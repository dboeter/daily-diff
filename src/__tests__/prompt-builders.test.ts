import { describe, it, expect } from "vitest";
import {
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  hasActivity,
  type ProjectActivity,
} from "../prompts.ts";
import { buildTrendingPrompt, buildWebReportPrompt, buildHnPrompt } from "../prompts-data.ts";
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
  return { config: cfg, releases: [], prereleaseCount: 0, hotIssues: [], news: [], ...overrides };
}

const scope = { subject: "AI coding agents", window: "last 24h", period: "today" };

describe("hasActivity", () => {
  it("is false for a project with nothing but prereleases", () => {
    expect(hasActivity(makeActivity({ prereleaseCount: 3 }))).toBe(false);
  });

  it("is true for a release, a hot issue or a news item", () => {
    expect(hasActivity(makeActivity({ releases: [release] }))).toBe(true);
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

  it("never sends prereleases to the model", () => {
    const prompt = buildProjectDigestPrompt(
      [makeActivity({ releases: [release], prereleaseCount: 4 })],
      scope,
      "d",
    );
    expect(prompt).not.toMatch(/prerelease/i);
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
// buildTrendingPrompt
// ---------------------------------------------------------------------------

describe("buildTrendingPrompt", () => {
  it("includes trending repos", () => {
    const data: TrendingData = {
      trendingRepos: [
        {
          fullName: "org/repo",
          description: "desc",
          language: "Python",
          periodStars: 100,
          totalStars: 5000,
          forks: 200,
          url: "https://github.com/org/repo",
        },
      ],
      searchRepos: [],
      trendingFetchSuccess: true,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("org/repo");
    expect(result).toContain("Python");
    expect(result).toContain("5,000");
    expect(result).toContain("+100 this week");
  });

  it("omits the total when the scraped star count is 0", () => {
    const data: TrendingData = {
      trendingRepos: [
        {
          fullName: "org/repo",
          description: "",
          language: "",
          periodStars: 408,
          totalStars: 0,
          forks: 0,
          url: "https://github.com/org/repo",
        },
      ],
      searchRepos: [],
      trendingFetchSuccess: true,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("- [org/repo](https://github.com/org/repo) (+408 this week)");
    expect(result).not.toContain("⭐0");
  });

  it("shows fetch failure message when trending fails", () => {
    const data: TrendingData = {
      trendingRepos: [],
      searchRepos: [],
      trendingFetchSuccess: false,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("Unable to fetch");
  });

  it("includes search repos with topic tag", () => {
    const data: TrendingData = {
      trendingRepos: [],
      searchRepos: [
        {
          fullName: "ai/agent",
          description: "An AI agent",
          language: "TypeScript",
          stargazersCount: 1000,
          pushedAt: "2026-03-08",
          url: "https://github.com/ai/agent",
          searchQuery: "ai-agent",
        },
      ],
      trendingFetchSuccess: false,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("[topic:ai-agent]");
    expect(result).toContain("1,000");
  });

  it("omits the radar and model sections when OpenRouter and npm have no data", () => {
    const data: TrendingData = {
      trendingRepos: [],
      searchRepos: [],
      trendingFetchSuccess: false,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).not.toContain("Agent & Coding Tool Radar");
    expect(result).not.toContain("OpenRouter");
    expect(result).not.toContain("npm");
  });

  it("renders OpenRouter apps, models and npm packages with the radar section", () => {
    const data: TrendingData = {
      trendingRepos: [],
      searchRepos: [],
      trendingFetchSuccess: false,
      openrouter: {
        apps: [
          {
            appId: 1,
            title: "Kimi Code CLI",
            description: "A coding agent",
            url: "https://kimi.example",
            categories: ["cli-agent"],
            createdAt: "2026-02-28T00:00:00Z",
            weekTokens: 13_694_514_725_528,
            dayRank: 12,
            weekRank: 110,
            monthRank: null,
            growthPercent: 776,
          },
        ],
        topModels: [{ slug: "deepseek/deepseek-v4.1-flash", tokens: 25_630_000_000_000 }],
        topModelsDate: "2026-03-08",
        newModels: [
          {
            id: "inclusionai/ling-3.1-flash",
            name: "Ling 3.1 Flash",
            description: "MoE",
            created: "2026-03-08",
            contextLength: 262_144,
          },
        ],
        fetchSuccess: true,
      },
      npm: {
        rising: [
          {
            name: "nano-coder",
            description: "A 6MB coding agent",
            weekly: 12_560,
            monthly: 12_859,
            url: "https://www.npmjs.com/package/nano-coder",
            lastPublish: "2026-03-07",
          },
        ],
        top: [],
        fetchSuccess: true,
      },
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("Agent & Coding Tool Radar");
    expect(result).toContain("- [Kimi Code CLI](https://kimi.example) | rank day #12 / week #110 / month —");
    expect(result).toContain("13.69T tokens/week");
    expect(result).toContain("+776% (OpenRouter trending)");
    expect(result).toContain("deepseek/deepseek-v4.1-flash — 25.63T tokens");
    expect(result).toContain("Ling 3.1 Flash (`inclusionai/ling-3.1-flash`)");
    expect(result).toContain("12,560/week, 12,859/month | momentum 4.2x");
    expect(result).toContain("Model Usage on OpenRouter");
    expect(result).not.toContain("npm Top Coding-Agent");
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
