import { describe, it, expect } from "vitest";
import {
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  hasActivity,
  previewNotes,
  type ProjectActivity,
} from "../prompts.ts";
import {
  buildTrendingSummariesPrompt,
  buildTrendingProsePrompt,
  buildWebReportPrompt,
  buildHnPrompt,
} from "../prompts-data.ts";
import { TRENDING_TABLES_MARKER } from "../report-builders.ts";
import { TRENDING_REPORT } from "../i18n.ts";
import type { RepoConfig, GitHubItem, GitHubRelease } from "../github.ts";
import { EMPTY_NPM, EMPTY_OPENROUTER, type TrendingData } from "../trending.ts";
import type { HnData } from "../hn.ts";
import type { WebFetchResult } from "../web.ts";

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
    expect(previewNotes(preview.body).length).toBeGreaterThan(400);
    expect(prompt).toContain("skip routine alpha/rc bumps");
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
    expect(result).toContain(`\`${TRENDING_TABLES_MARKER}\` exactly once`);
    const order = [
      TRENDING_REPORT.highlightsHeading,
      TRENDING_TABLES_MARKER,
      TRENDING_REPORT.trendsHeading,
      TRENDING_REPORT.hotSpotsHeading,
    ].map((s) => result.indexOf(s));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(result).toContain("Do not reproduce or alter the tables");
  });

  it("omits the model-usage section without model data", () => {
    const result = buildTrendingProsePrompt("", noTrending, "2026-10-05");
    expect(result).not.toContain(TRENDING_REPORT.modelUsageHeading);
    expect(result).toContain("No projects were selected");
  });

  it("adds the model-usage section and data when OpenRouter has models", () => {
    const data: TrendingData = {
      ...noTrending,
      openrouter: {
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
      },
    };
    const result = buildTrendingProsePrompt("", data, "2026-10-05");
    expect(result).toContain(`## ${TRENDING_REPORT.modelUsageHeading}`);
    expect(result).toContain("deepseek/deepseek-v4.1-flash — 25.63T tokens");
    expect(result).toContain("Ling 3.1 Flash (`inclusionai/ling-3.1-flash`)");
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
      },
    ];
    const result = buildWebReportPrompt(results, "2026-03-09");
    expect(result).toContain("First full crawl");
    expect(result).toContain("Anthropic");
    expect(result).toContain("Content Landscape Overview"); // first-run-only section
  });

  it("shows incremental mode for non-first-run", () => {
    const results: WebFetchResult[] = [
      { site: "openai", siteName: "OpenAI", isFirstRun: false, newItems: [], totalDiscovered: 100 },
    ];
    const result = buildWebReportPrompt(results, "2026-03-09");
    expect(result).toContain("Incremental update");
    expect(result).not.toContain("Content Landscape Overview");
  });
});

// ---------------------------------------------------------------------------
// buildHnPrompt
// ---------------------------------------------------------------------------

describe("buildHnPrompt", () => {
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
    const result = buildHnPrompt(data, "2026-03-09");
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
    const result = buildHnPrompt(data, "2026-03-09");
    expect(result).toContain("Score: 10");
    expect(result).toContain("Comments: 2");
    expect(result).toContain("Hacker News");
  });

  it("does not ask for comment-thread content the model never sees", () => {
    const result = buildHnPrompt({ stories: [], fetchSuccess: true }, "2026-10-06");
    expect(result).toContain("not the article and not the comment thread");
    expect(result).toContain("Do not describe the comments");
    expect(result).not.toMatch(/typical reaction|last cycle/);
  });
});
