import { describe, it, expect } from "vitest";
import {
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  hasActivity,
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
      facts: "Source: npm | Signal: 🆕 12,560/week, 4.2x",
    },
    { n: 2, name: "org/repo", description: "", facts: "Stars: 86,392 (+1,851)" },
  ];

  it("lists each row with its number, description and facts", () => {
    const result = buildTrendingSummariesPrompt(rows, "2026-10-05");
    expect(result).toContain(
      "1. nano-coder — A 6MB coding agent — Source: npm | Signal: 🆕 12,560/week, 4.2x",
    );
    expect(result).toContain("2. org/repo — (no description) — Stars: 86,392 (+1,851)");
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
    expect(result).toContain("Do not describe the comments");
    expect(result).not.toMatch(/typical reaction|last cycle/);
  });
});

// ---------------------------------------------------------------------------
// Shared section layout
// ---------------------------------------------------------------------------

describe("listing report layout", () => {
  // Three articles: with fewer the web prompt leaves out Signals and Worth a Look.
  const web: WebFetchResult[] = [
    {
      site: "openai",
      siteName: "OpenAI",
      isFirstRun: false,
      newItems: [1, 2, 3].map((n) => ({
        url: `https://openai.com/index/p${n}`,
        title: `P${n}`,
        lastmod: "2026-10-12",
        content: "",
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
  it("names each item in at most one prose section, and a same-change pair once", () => {
    const prompt = buildDataProsePrompt("## Databricks\n\n(table)", "2026-10-19", {
      vendorTitles: ["X"],
      news: [],
    });
    expect(prompt).toContain("at most one of these parts");
    expect(prompt).toContain("not one the sections already lead with");
    expect(prompt).toContain("describe the same change");
  });
});
