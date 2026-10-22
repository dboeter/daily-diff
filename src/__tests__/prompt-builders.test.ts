import { describe, it, expect } from "vitest";
import {
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  announcementLink,
  hasActivity,
  isMajorRelease,
  releaseNotes,
  type ProjectActivity,
} from "../reports/prompts.ts";
import {
  buildTrendingSummariesPrompt,
  buildTrendingProsePrompt,
  buildWebReportPrompt,
  buildDiscussionsPrompt,
  discussionSources,
  buildArxivPrompt,
  buildModelsPrompt,
  buildPolicySummariesPrompt,
  buildPolicyProsePrompt,
  buildDataProsePrompt,
  withFallbackHighlights,
  forcedHighlightReports,
  buildHighlightsPrompt,
  firstHighlight,
} from "../reports/prompts-data.ts";
import { TABLES_MARKER, numberRows } from "../reports/summarized-table.ts";
import { MODELS_REPORT, SECTIONS } from "../core/i18n.ts";
import type { RepoConfig, GitHubItem, GitHubRelease } from "../core/github.ts";
import { EMPTY_NPM, EMPTY_OPENROUTER, type TrendingData } from "../trending/trending.ts";
import type { HnData } from "../sources/hn.ts";
import type { DevtoData } from "../sources/devto.ts";
import type { LobstersData } from "../sources/lobsters.ts";
import type { WebFetchResult } from "../sources/web.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const cfg: RepoConfig = { id: "test", repo: "org/test", name: "TestTool" };

function makeItem(overrides: Partial<GitHubItem> = {}): GitHubItem {
  return {
    number: 1,
    title: "Issue",
    state: "open",
    user: { login: "alice" },
    labels: [],
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 5,
    reactions: { "+1": 2 },
    body: "body",
    html_url: "https://github.com/org/test/issues/1",
    ...overrides,
  };
}

const release: GitHubRelease = {
  tag_name: "v1.0.0",
  name: "Release 1.0",
  body: "Release notes",
  published_at: "2026-03-09T00:00:00Z",
  prerelease: false,
};

// ---------------------------------------------------------------------------
// buildProjectDigestPrompt
// ---------------------------------------------------------------------------

function makeActivity(overrides: Partial<ProjectActivity> = {}): ProjectActivity {
  return {
    config: cfg,
    releases: [],
    previews: [],
    prereleaseCount: 0,
    hotIssues: [],
    news: [],
    ...overrides,
  };
}

const scope = { subject: "AI coding agents", window: "last 24h", period: "today" };

describe("hasActivity", () => {
  it("is false for a project with nothing but prereleases", () => {
    expect(hasActivity(makeActivity({ prereleaseCount: 3 }))).toBe(false);
  });

  it("is true for a release, a previewed prerelease, a hot issue or a news item", () => {
    expect(hasActivity(makeActivity({ releases: [release] }))).toBe(true);
    expect(hasActivity(makeActivity({ previews: [{ ...release, prerelease: true }] }))).toBe(true);
    expect(hasActivity(makeActivity({ hotIssues: [makeItem()] }))).toBe(true);
    expect(
      hasActivity(makeActivity({ news: [{ source: "Hacker News", title: "t", url: "u", detail: "d" }] })),
    ).toBe(true);
  });
});

describe("buildProjectDigestPrompt", () => {
  it("includes releases with their tag URL, hot issues and news", () => {
    const prompt = buildProjectDigestPrompt(
      [
        makeActivity({
          releases: [release],
          hotIssues: [makeItem({ title: "Crash on start" })],
          news: [{ source: "Hacker News", title: "TestTool 1.0", url: "https://hn/1", detail: "9 points" }],
        }),
      ],
      scope,
      "2026-10-04",
    );
    expect(prompt).toContain("## TestTool (github.com/org/test)");
    expect(prompt).toContain("https://github.com/org/test/releases/tag/v1.0.0");
    expect(prompt).toContain("Release notes");
    expect(prompt).toContain("Crash on start");
    expect(prompt).toContain("[Hacker News] TestTool 1.0 — https://hn/1 (9 points)");
    expect(prompt).toContain("2026-10-04 (last 24h)");
    expect(prompt).toContain("AI coding agents");
  });

  it("sends no prerelease list for a project that has a stable release", () => {
    const prompt = buildProjectDigestPrompt(
      [makeActivity({ releases: [release], prereleaseCount: 4 })],
      scope,
      "d",
    );
    expect(prompt).not.toContain("### Prereleases");
  });

  it("lists the prereleases of a project without a stable release, with longer, cleaned notes", () => {
    const features = "New plugin manager and Claude Code mods compatibility layer. ".repeat(15);
    const preview: GitHubRelease = {
      tag_name: "dsh-v0.2.0-rc.1",
      name: "dsh-v0.2.0-rc.1",
      body: `[中文](#cn-v0.2.0-rc.1) | [English](#en-v0.2.0-rc.1)\n<h3 id="en-v0.2.0-rc.1">New features</h3>\n${features}`,
      published_at: "2026-09-28T00:00:00Z",
      prerelease: true,
    };
    const prompt = buildProjectDigestPrompt([makeActivity({ previews: [preview] })], scope, "d");
    expect(prompt).toContain("### Prereleases (no stable release yet)");
    expect(prompt).toContain("https://github.com/org/test/releases/tag/dsh-v0.2.0-rc.1");
    expect(prompt).toContain("New features New plugin manager");
    expect(prompt).not.toContain("<h3");
    expect(prompt).not.toContain("(#en-");
    expect(releaseNotes(preview.body, 1500).length).toBeGreaterThan(400);
    expect(prompt).toContain("skip routine alpha/rc bumps");
  });

  it("leaves fenced code blocks (install commands) out of the release notes", () => {
    const body =
      "### Installation\n```bash\nbrew install org/tap/tool\n```\n```bash\n" +
      "x".repeat(400) +
      "\n```\n## What's new\n- Slash commands run safely";
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [{ ...release, body }] })], scope, "d");
    expect(prompt).not.toContain("brew install");
    expect(prompt).toContain("Slash commands run safely");
    expect(releaseNotes("```sh\nnpm i tool\n```", 400)).toBe("");
    expect(releaseNotes("~~~\ngo install tool\n~~~\nFixes", 400)).toBe("Fixes");
  });

  // DuckDB v2.0.0's notes, trimmed (2026-10-21).
  const duckdbBody =
    'This release of DuckDB is named "Cyanoptera" after Spatula Cyanoptera.\r\n\r\n' +
    "Please also refer to the announcement blog post: https://duckdb.org/2026/10/21/announcing-duckdb-200.html\r\n\r\n" +
    "## What's Changed\r\n" +
    "* Make `Identifier` a class instead of using string everywhere by @Mytherin in https://github.com/duckdb/duckdb/pull/23161\r\n" +
    "* Move to tidy-check diff again by @Mytherin in https://github.com/duckdb/duckdb/pull/23196\r\n" +
    "* Allow `MERGE INTO` in triggers by @Dtenwolde in https://github.com/duckdb/duckdb/pull/23201\r\n\r\n" +
    "## New Contributors\r\n* @someone made their first contribution in https://github.com/duckdb/duckdb/pull/23000\r\n\r\n" +
    "**Full Changelog**: https://github.com/duckdb/duckdb/compare/v1.5.0...v2.0.0";

  it("compacts a generated changelog to its PR titles and their count", () => {
    const notes = releaseNotes(duckdbBody, 1000);
    expect(notes).toContain("What's Changed (3 merged PRs): Make `Identifier` a class");
    expect(notes).toContain("Allow `MERGE INTO` in triggers;");
    expect(notes).not.toMatch(/@Mytherin|pull\/23161|first contribution|Full Changelog/);
    expect(releaseNotes("## What's Changed\n- Hand-written note", 400)).toBe(
      "## What's Changed - Hand-written note",
    );
  });

  it("finds a major release's announcement and shows it in the prompt", () => {
    expect(isMajorRelease("v2.0.0")).toBe(true);
    expect(isMajorRelease("2.0.0")).toBe(true);
    expect(isMajorRelease("v2.0.1")).toBe(false);
    expect(isMajorRelease("v2.1.0")).toBe(false);
    expect(announcementLink(duckdbBody)).toBe("https://duckdb.org/2026/10/21/announcing-duckdb-200.html");
    expect(announcementLink("See https://github.com/o/r/pull/1")).toBeUndefined();
    const prompt = buildProjectDigestPrompt(
      [
        makeActivity({
          releases: [
            { ...release, tag_name: "v2.0.0", body: duckdbBody, announcement: "Our biggest release." },
          ],
        }),
      ],
      scope,
      "d",
    );
    expect(prompt).toContain("Announcement: Our biggest release.");
    expect(prompt).toContain("describe it from the announcement");
    expect(prompt).toContain("Link each release you name as `[tag](url)`");
  });

  it("forbids stating absences in the overview too", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).toContain("Never state what did not happen");
  });

  it("caps the releases shown and notes the total", () => {
    const releases = Array.from({ length: 14 }, (_, i) => ({ ...release, tag_name: `b${100 - i}` }));
    const prompt = buildProjectDigestPrompt([makeActivity({ releases })], scope, "d");
    expect(prompt).toContain("(14 stable releases; showing newest 10)");
    expect(prompt).toContain("b100");
    expect(prompt).not.toContain("b87");
  });

  it("asks for an overview and one section per project", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).toContain("## Overview");
    expect(prompt).toContain("## <Project name>");
    expect(prompt).toContain("today");
  });

  it("lets the model leave out a project whose items it skipped", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).toContain("that has something left to report");
    expect(prompt).toContain("leave out its section entirely");
  });
});

// ---------------------------------------------------------------------------
// buildSkillsPrompt
// ---------------------------------------------------------------------------

describe("buildSkillsPrompt", () => {
  it("includes skills repository context", () => {
    const result = buildSkillsPrompt([makeItem()], [makeItem()], "2026-03-09");
    expect(result).toContain("anthropics/skills");
    expect(result).toContain("Claude Code Skills");
  });

  it("shows None when no data", () => {
    const result = buildSkillsPrompt([], [], "2026-03-09");
    expect(result).toContain("Claude Code ecosystem");
    expect(result).toContain("None");
  });
});

// ---------------------------------------------------------------------------
// buildTrendingSummariesPrompt / buildTrendingProsePrompt
// ---------------------------------------------------------------------------

const withModels: TrendingData["openrouter"] = {
  ...EMPTY_OPENROUTER,
  topModels: [{ slug: "deepseek/deepseek-v4.1-flash", tokens: 25_630_000_000_000 }],
  topModelsDate: "2026-10-04",
  newModels: [
    {
      id: "inclusionai/ling-3.1-flash",
      name: "Ling 3.1 Flash",
      description: "MoE",
      created: "2026-10-04",
      contextLength: 262_144,
    },
  ],
  fetchSuccess: true,
};

const noTrending: TrendingData = {
  trendingRepos: [],
  searchRepos: [],
  trendingFetchSuccess: false,
  openrouter: EMPTY_OPENROUTER,
  npm: EMPTY_NPM,
};

describe("buildTrendingSummariesPrompt", () => {
  const rows = [
    {
      n: 1,
      name: "nano-coder",
      description: "A 6MB coding agent",
      facts: "Source: npm | New: created or listed in the last 14 days",
    },
    { n: 2, name: "org/repo", description: "", facts: "" },
  ];

  it("lists each row with its number, description and facts", () => {
    const result = buildTrendingSummariesPrompt(rows, "2026-10-05");
    expect(result).toContain("1. nano-coder — A 6MB coding agent — Source: npm | New: created or listed");
    expect(result).toContain("2. org/repo — (no description)\n");
  });

  it("forbids the figures the table already shows", () => {
    expect(buildTrendingSummariesPrompt(rows, "2026-10-05")).toContain(
      "No star, gain, download, token or rank figures",
    );
  });

  it("asks for one `N: <2 sentences>` line per row and nothing else", () => {
    const result = buildTrendingSummariesPrompt(rows, "2026-10-05");
    expect(result).toContain("`N: <2 sentences>`");
    expect(result).toContain("2 lines in total");
    expect(result).toContain("No other text");
    expect(result).toContain("Do not invent");
  });
});

describe("buildTrendingProsePrompt", () => {
  it("includes the tables, the marker instruction and the section headings in order", () => {
    const result = buildTrendingProsePrompt("| Tool |\n| :--- |", noTrending, "2026-10-05");
    expect(result).toContain("| Tool |");
    expect(result).toContain(`\`${TABLES_MARKER}\` exactly once`);
    const order = [SECTIONS.highlights, TABLES_MARKER, SECTIONS.signals, SECTIONS.worthALook].map((s) =>
      result.indexOf(s),
    );
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(result).toContain("Do not reproduce or alter the tables");
  });

  it("leaves OpenRouter model usage to the models report", () => {
    const result = buildTrendingProsePrompt("", { ...noTrending, openrouter: withModels }, "2026-10-05");
    expect(result).not.toContain(MODELS_REPORT.openRouterHeading);
    expect(result).not.toContain("deepseek/deepseek-v4.1-flash");
    expect(result).toContain("No projects were selected");
  });
});

describe("buildPolicySummariesPrompt", () => {
  const items = [
    {
      id: "1",
      title: "AI Act guidelines",
      link: "https://example.eu/a",
      published: "2026-10-09T07:16:00.000Z",
      description: "The AI Office publishes guidelines.",
      source: "European Commission",
      jurisdiction: "eu" as const,
      jevOnly: false,
    },
  ];

  it("numbers the items with their source and text, and asks for one `N:` line each", () => {
    const result = buildPolicySummariesPrompt(numberRows(items), "2026-10-14", "A Dutch AI practitioner.");
    expect(result).toContain(
      "1. AI Act guidelines (European Commission, 2026-10-09) — The AI Office publishes guidelines.",
    );
    expect(result).toContain("`N: <2 sentences>`");
    expect(result).toContain("1 lines in total");
    expect(result).toContain("Do not invent");
    expect(result).toContain("The reader: A Dutch AI practitioner.");
  });
});

describe("buildPolicyProsePrompt", () => {
  it("includes the table, the marker instruction and the section headings in order", () => {
    const result = buildPolicyProsePrompt("| Date |\n| :--- |", "2026-10-14", "A Dutch AI practitioner.");
    expect(result).toContain("| Date |");
    expect(result).toContain(`\`${TABLES_MARKER}\` exactly once`);
    const order = [SECTIONS.highlights, TABLES_MARKER, SECTIONS.signals, SECTIONS.worthALook].map((s) =>
      result.indexOf(s),
    );
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(result).toContain("Do not reproduce or alter the table");
    expect(result).toContain("Do not write a title");
    expect(result).toContain("The reader: A Dutch AI practitioner.");
    expect(result).not.toContain("Open deadlines");
  });

  it("lists near deadlines as earlier items, not new ones", () => {
    const result = buildPolicyProsePrompt("| Date |", "2026-10-22", "A reader.", [
      { date: "2026-10-27", title: "Consultation X", link: "https://x", source: "Have your say" },
    ]);
    expect(result).toContain("Open deadlines of items reported on earlier days (not new today");
    expect(result).toContain("- 2026-10-27: [Consultation X](https://x) (Have your say)");
    expect(result).toContain("in the table or the open deadlines");
  });
});

// ---------------------------------------------------------------------------
// buildModelsPrompt (the models report)
// ---------------------------------------------------------------------------

describe("buildModelsPrompt", () => {
  it("adds the OpenRouter section and data when OpenRouter has models", () => {
    const result = buildModelsPrompt({ models: [], fetchSuccess: true }, withModels, "2026-10-05");
    expect(result).toContain(`## ${MODELS_REPORT.openRouterHeading}\n`);
    expect(result).toContain("deepseek/deepseek-v4.1-flash — 25.63T tokens");
    expect(result).toContain("Ling 3.1 Flash (`inclusionai/ling-3.1-flash`)");
  });

  it("omits the OpenRouter section without model data, and the HF one without HF data", () => {
    const hfOnly = buildModelsPrompt({ models: [], fetchSuccess: true }, EMPTY_OPENROUTER, "2026-10-05");
    expect(hfOnly).not.toContain(`## ${MODELS_REPORT.openRouterHeading}`);
    expect(hfOnly).toContain(`## ${MODELS_REPORT.hfHeading}\n`);
    const orOnly = buildModelsPrompt({ models: [], fetchSuccess: false }, withModels, "2026-10-05");
    expect(orOnly).not.toContain(`## ${MODELS_REPORT.hfHeading}`);
  });
});

// ---------------------------------------------------------------------------
// buildWebReportPrompt
// ---------------------------------------------------------------------------

describe("buildWebReportPrompt", () => {
  it("includes site sections for first run", () => {
    const results: WebFetchResult[] = [
      {
        site: "anthropic",
        siteName: "Anthropic",
        isFirstRun: true,
        newItems: [
          {
            url: "https://anthropic.com/news/test",
            title: "Test",
            lastmod: "2026-03-09",
            content: "Content",
            site: "anthropic",
            category: "news",
          },
        ],
        totalDiscovered: 50,
        fetchSuccess: true,
      },
    ];
    const result = buildWebReportPrompt(results, "2026-03-09");
    expect(result).toContain("First full crawl");
    expect(result).toContain("Anthropic");
    expect(result).toContain("Content Landscape Overview"); // first-run-only section
  });

  it("shows incremental mode for non-first-run", () => {
    const results: WebFetchResult[] = [
      {
        site: "openai",
        siteName: "OpenAI",
        isFirstRun: false,
        newItems: [],
        totalDiscovered: 100,
        fetchSuccess: true,
      },
    ];
    const result = buildWebReportPrompt(results, "2026-03-09");
    expect(result).toContain("Incremental update");
    expect(result).not.toContain("Content Landscape Overview");
  });

  // 2026-10-19: one article became ~600 words restated across four sections.
  it("asks for Highlights and the lab section only with 1-2 new articles", () => {
    const article = (n: number) => ({
      url: `https://anthropic.com/news/a${n}`,
      title: `A${n}`,
      lastmod: "2026-10-19",
      content: "Text",
      site: "anthropic" as const,
      category: "news",
    });
    const site = (count: number): WebFetchResult[] => [
      {
        site: "anthropic",
        siteName: "Anthropic",
        isFirstRun: false,
        newItems: Array.from({ length: count }, (_, i) => article(i)),
        totalDiscovered: 100,
        fetchSuccess: true,
      },
    ];
    const short = buildWebReportPrompt(site(1), "2026-10-19");
    expect(short).toContain(`## ${SECTIONS.highlights}\n`);
    expect(short).toContain("## Anthropic\n");
    expect(short).not.toContain(`## ${SECTIONS.signals}\n`);
    expect(short).not.toContain(`## ${SECTIONS.worthALook}\n`);
    const full = buildWebReportPrompt(site(3), "2026-10-19");
    expect(full).toContain(`## ${SECTIONS.signals}\n`);
    expect(full).toContain("no forward-looking claims");
    expect(full).toContain("never interpreted");
    expect(full).not.toContain("Hidden signals");
    // Metadata-only items (no content) do not count toward the full layout.
    const slugs = site(3).map((r) => ({ ...r, newItems: r.newItems.map((i) => ({ ...i, content: "" })) }));
    expect(buildWebReportPrompt(slugs, "2026-10-19")).not.toContain(`## ${SECTIONS.signals}\n`);
  });
});

// ---------------------------------------------------------------------------
// buildDiscussionsPrompt
// ---------------------------------------------------------------------------

const noDevto: DevtoData = { articles: [], fetchSuccess: false };
const noLobsters: LobstersData = { stories: [], fetchSuccess: false };
const devtoArticle: DevtoData["articles"][number] = {
  id: 1,
  title: "MCP lesson",
  url: "https://dev.to/a/mcp",
  description: "d",
  user: "u",
  positiveReactionsCount: 78,
  commentsCount: 85,
  readingTimeMinutes: 5,
  tags: ["ai"],
  publishedAt: "2026-10-10T00:00:00Z",
};
const hnOnlyPrompt = (hn: HnData, dateStr: string) =>
  buildDiscussionsPrompt({ hn, devto: noDevto, lobsters: noLobsters }, dateStr);

describe("buildDiscussionsPrompt", () => {
  it("includes stories with metadata", () => {
    const data: HnData = {
      stories: [
        {
          id: "123",
          title: "AI News",
          url: "https://example.com/ai",
          hnUrl: "https://news.ycombinator.com/item?id=123",
          points: 200,
          comments: 50,
          author: "bob",
          createdAt: "2026-03-09T10:00:00Z",
        },
      ],
      fetchSuccess: true,
    };
    const result = hnOnlyPrompt(data, "2026-03-09");
    expect(result).toContain("AI News");
    expect(result).toContain("Score: 200");
    expect(result).toContain("Comments: 50");
    expect(result).toContain("Author: bob");
  });

  it("marks only stories with more comments than points as contested, and one table per story", () => {
    const story = (id: string, points: number, comments: number) => ({
      id,
      title: `Story ${id}`,
      url: `https://example.com/${id}`,
      hnUrl: `https://news.ycombinator.com/item?id=${id}`,
      points,
      comments,
      author: "a",
      createdAt: "2026-10-22T00:00:00Z",
    });
    // 2026-10-22: 578 points and 538 comments is not contested.
    const result = hnOnlyPrompt(
      { stories: [story("1", 578, 538), story("2", 50, 90)], fetchSuccess: true },
      "d",
    );
    expect(result).toContain("Score: 578 | Comments: 538 | Author: a | Time: 2026-10-22T00:00\n");
    expect(result).toContain(
      "Comments: 90 | Author: a | Time: 2026-10-22T00:00 | Contested: more comments than points",
    );
    expect(result).toContain("compare no counts yourself");
    expect(result).toContain("Each story appears in exactly one table");
    expect(result).toContain("descending Score");
  });

  it("mentions Hacker News", () => {
    const data: HnData = {
      stories: [
        {
          id: "1",
          title: "Test",
          url: "https://test.com",
          hnUrl: "https://news.ycombinator.com/item?id=1",
          points: 10,
          comments: 2,
          author: "a",
          createdAt: "2026-03-09T10:00:00Z",
        },
      ],
      fetchSuccess: true,
    };
    const result = hnOnlyPrompt(data, "2026-03-09");
    expect(result).toContain("Score: 10");
    expect(result).toContain("Comments: 2");
    expect(result).toContain("Hacker News");
  });

  it("asks for Dev.to and Lobste.rs only when the weekly run fetched them", () => {
    const daily = hnOnlyPrompt({ stories: [], fetchSuccess: true }, "2026-10-12");
    expect(daily).toContain("## Hacker News\n");
    expect(daily).not.toMatch(/## Dev\.to|## Lobste\.rs/);

    const devto: DevtoData = { fetchSuccess: true, articles: [devtoArticle] };
    const weekly = buildDiscussionsPrompt(
      { hn: { stories: [], fetchSuccess: false }, devto, lobsters: noLobsters },
      "2026-10-12",
    );
    expect(weekly).toContain("MCP lesson");
    expect(weekly).toContain("## Dev.to\n");
    expect(weekly).not.toContain("## Hacker News\n");
    expect(weekly).not.toContain("## Lobste.rs\n");
  });

  it("discussionSources: an empty HN stays alone, but not next to a weekly source", () => {
    const emptyHn: HnData = { stories: [], fetchSuccess: true };
    const devto: DevtoData = { articles: [devtoArticle], fetchSuccess: true };
    expect(discussionSources({ hn: emptyHn, devto: noDevto, lobsters: noLobsters }).hasHn).toBe(true);
    expect(discussionSources({ hn: emptyHn, devto, lobsters: noLobsters })).toEqual({
      hasHn: false,
      hasDevto: true,
      hasLobsters: false,
    });
    const failed = { hn: { stories: [], fetchSuccess: false }, devto: noDevto, lobsters: noLobsters };
    expect(discussionSources(failed).hasHn).toBe(false);
  });

  it("does not ask for comment-thread content the model never sees", () => {
    const result = hnOnlyPrompt({ stories: [], fetchSuccess: true }, "2026-10-06");
    expect(result).toContain("not the article and not the comment thread");
    expect(result).toContain("describe no discussion");
    expect(result).not.toMatch(/typical reaction|last cycle/);
  });

  it("passes a story's page description, and limits a story without one to its title", () => {
    const story = {
      id: "1",
      title: "Neural networks are clean",
      url: "https://goodfire.ai/clean",
      hnUrl: "https://news.ycombinator.com/item?id=1",
      points: 300,
      comments: 80,
      author: "a",
      createdAt: "2026-10-19T00:00:00Z",
      description: "Sparse features generalize.",
    };
    const result = hnOnlyPrompt({ stories: [story], fetchSuccess: true }, "2026-10-19");
    expect(result).toContain("   Page description: Sparse features generalize.");
    expect(result).toContain("without one, 1 sentence saying only what the title and the link's domain say");
  });
});

// ---------------------------------------------------------------------------
// Shared section layout
// ---------------------------------------------------------------------------

describe("listing report layout", () => {
  // Three articles with text: with fewer the web prompt leaves out Signals and Worth a Look.
  const web: WebFetchResult[] = [
    {
      site: "openai",
      siteName: "OpenAI",
      isFirstRun: false,
      newItems: [1, 2, 3].map((n) => ({
        url: `https://openai.com/index/p${n}`,
        title: `P${n}`,
        lastmod: "2026-10-12",
        content: "Text",
        site: "openai" as const,
        category: "release",
      })),
      totalDiscovered: 3,
      fetchSuccess: true,
    },
  ];
  const prompts: Record<string, string> = {
    hn: hnOnlyPrompt({ stories: [], fetchSuccess: true }, "2026-10-12"),
    arxiv: buildArxivPrompt({ papers: [], fetchSuccess: true, rankedBy: "recency" }, "2026-10-12"),
    hf: buildModelsPrompt({ models: [], fetchSuccess: true }, withModels, "2026-10-12"),
    weekly: buildDiscussionsPrompt(
      {
        hn: { stories: [], fetchSuccess: true },
        devto: { articles: [], fetchSuccess: true },
        lobsters: { stories: [], fetchSuccess: true },
      },
      "2026-10-12",
    ),
    web: buildWebReportPrompt(web, "2026-10-12"),
  };

  it.each(Object.keys(prompts))("%s: Highlights first, then Signals", (id) => {
    const p = prompts[id]!;
    const h = p.indexOf(`## ${SECTIONS.highlights}\n`);
    expect(h).toBeGreaterThan(-1);
    expect(p.indexOf(`## ${SECTIONS.signals}\n`)).toBeGreaterThan(h);
  });

  it.each(["hn", "arxiv", "hf", "weekly", "web"])("%s: ends with Worth a Look", (id) => {
    const p = prompts[id]!;
    expect(p.indexOf(`## ${SECTIONS.worthALook}\n`)).toBeGreaterThan(p.indexOf(`## ${SECTIONS.signals}\n`));
  });

  it.each(Object.keys(prompts))("%s: no title, no numbered or day-bound headings", (id) => {
    const p = prompts[id]!;
    expect(p).toContain("Do not write a title");
    expect(p).not.toMatch(/Today's|This Week's|^\d\. \*\*/m);
  });
});

describe("buildDataProsePrompt", () => {
  const prompt = buildDataProsePrompt("## Databricks\n\n(table)", "2026-10-19");

  it("asks Highlights for who is affected, what to do and by when, not a restated row", () => {
    expect(prompt).toContain("who is affected");
    expect(prompt).toContain("what to do");
    expect(prompt).toContain("by when");
    expect(prompt).toContain("Never restate a row");
    expect(prompt).toContain("describe the same change");
  });

  it("asks for Across platforms: two platforms per bullet, from the rows, none when nothing qualifies", () => {
    expect(prompt).toContain("## Across platforms");
    expect(prompt).toContain("two or more platforms");
    expect(prompt).toContain("how they differ");
    expect(prompt).toContain("Leave this heading out");
    expect(prompt.indexOf("<!-- tables -->")).toBeLessThan(prompt.indexOf("`## Across platforms`"));
  });

  it("makes a major release a Highlights candidate", () => {
    expect(prompt).toContain("Releases this week");
    expect(prompt).toContain("x.0.0");
    expect(prompt).toContain("breaking changes");
  });

  it("asks for no Data × AI or Worth a Look section", () => {
    expect(prompt).not.toContain("Data × AI");
    expect(prompt).not.toContain("Worth a Look");
  });
});

describe("withFallbackHighlights", () => {
  const POLICY =
    "## Highlights\nThe Commission published the first [harmonised standard](https://x.eu) for the AI Act. Consultations close in November.\n\n<!-- tables -->";

  it("fills a published policy or data report the model left out with its first Highlights sentence", () => {
    const out = withFallbackHighlights({ "ai-hn": ["H."] }, { "ai-hn": "x", "ai-policy": POLICY }, [
      "ai-policy",
    ]);
    expect(out).toEqual({
      "ai-hn": ["H."],
      "ai-policy": ["The Commission published the first harmonised standard for the AI Act."],
    });
  });

  it("keeps the model's highlights, and adds none for other or absent reports", () => {
    const out = withFallbackHighlights(
      { "ai-policy": ["Mine."] },
      { "ai-policy": POLICY, "ai-web": POLICY },
      ["ai-policy"],
    );
    expect(out).toEqual({ "ai-policy": ["Mine."] });
  });

  it("reads a bullet, skips a failure notice and cuts a long sentence at a word", () => {
    expect(firstHighlight("## Highlights\n\n- **Snowflake** retires X. More.")).toBe("Snowflake retires X.");
    expect(firstHighlight("## Highlights\n\n⚠️ Summary generation failed.")).toBeNull();
    expect(firstHighlight("## Signals\nNo highlights here.")).toBeNull();
    const long = firstHighlight(`## Highlights\n${"word ".repeat(60)}end.`)!;
    expect(long.length).toBeLessThanOrEqual(140);
    expect(long.endsWith("word…")).toBe(true);
  });

  it("forces ai-data only on a day with kept vendor items", () => {
    expect(forcedHighlightReports(false)).toEqual(["ai-policy"]);
    expect(forcedHighlightReports(true)).toEqual(["ai-policy", "ai-data"]);
    const reports = { "ai-data": "## Highlights\n- dbt Core 1.11 ships." };
    expect(withFallbackHighlights({}, reports, forcedHighlightReports(false))).toEqual({});
    expect(withFallbackHighlights({}, reports, forcedHighlightReports(true))).toEqual({
      "ai-data": ["dbt Core 1.11 ships."],
    });
  });

  it("asks the model for a forced report's highlight only when forced", () => {
    expect(buildHighlightsPrompt({}, ["ai-policy"])).toContain("give that report at least 1 highlight");
    expect(buildHighlightsPrompt({}, forcedHighlightReports(true))).toContain(
      "vendor release-note row in ai-data",
    );
    expect(buildHighlightsPrompt({})).not.toContain("at least 1 highlight");
  });

  it("does not end the sentence at an abbreviation", () => {
    expect(firstHighlight("## Highlights\nThe U.S. Senate passed the bill. More.")).toBe(
      "The U.S. Senate passed the bill.",
    );
    expect(firstHighlight("## Highlights\nThe consultation closes Nov. 9 for comments. More.")).toBe(
      "The consultation closes Nov. 9 for comments.",
    );
    expect(
      firstHighlight("## Highlights\n- See [Art. 50 guidance](https://x.eu) e.g. for providers. More."),
    ).toBe("See Art. 50 guidance e.g. for providers.");
  });

  it("handles numbered bullets, sub-headings, wrapped lines, ⚠️ markers and italics", () => {
    expect(firstHighlight("## Highlights\n1. Snowflake retires X. More.")).toBe("Snowflake retires X.");
    expect(firstHighlight("## Highlights\n### Sub\n- A.")).toBeNull();
    expect(firstHighlight("## Highlights\nThe Commission published\na standard. More.\n\nNext.")).toBe(
      "The Commission published a standard.",
    );
    expect(firstHighlight("## Highlights\n- ⚠️ **Snowflake** retires X.\n- B.")).toBe("Snowflake retires X.");
    expect(firstHighlight("## Highlights\n- *Delta Lake* 4.0 adds `variant` type.")).toBe(
      "Delta Lake 4.0 adds variant type.",
    );
  });
});
