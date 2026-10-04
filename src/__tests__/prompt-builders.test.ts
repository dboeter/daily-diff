import { describe, it, expect } from "vitest";
import {
  buildInfraPrompt,
  buildInfraComparisonPrompt,
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  hasActivity,
  type ProjectActivity,
} from "../prompts.ts";
import { buildTrendingPrompt, buildWebReportPrompt, buildHnPrompt } from "../prompts-data.ts";
import type { RepoConfig, GitHubItem, GitHubRelease } from "../github.ts";
import type { RepoDigest } from "../prompts.ts";
import type { TrendingData } from "../trending.ts";
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

function makeDigest(overrides: Partial<RepoDigest> = {}): RepoDigest {
  return {
    config: cfg,
    issues: [],
    prs: [],
    releases: [],
    summary: "Summary",
    ...overrides,
  };
}

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
});

// ---------------------------------------------------------------------------
// buildInfraPrompt
// ---------------------------------------------------------------------------

describe("buildInfraPrompt", () => {
  it("includes repo and release data", () => {
    const result = buildInfraPrompt(cfg, [makeItem()], [makeItem()], [release], "2026-03-09");
    expect(result).toContain("AI infrastructure");
    expect(result).toContain("New Model & Hardware Support");
    expect(result).toContain("TestTool");
    expect(result).toContain("v1.0.0");
  });

  it("shows None when a section has no data", () => {
    const result = buildInfraPrompt(cfg, [makeItem()], [], [], "2026-03-09");
    expect(result).toContain("None");
  });

  it("includes sample notes when items exceed limit", () => {
    const items = Array.from({ length: 50 }, (_, i) => makeItem({ number: i, comments: i }));
    const result = buildInfraPrompt(cfg, items, [], [], "2026-03-09");
    expect(result).toContain("Total: 50 items; showing top 30");
  });
});

// ---------------------------------------------------------------------------
// buildInfraComparisonPrompt
// ---------------------------------------------------------------------------

describe("buildInfraComparisonPrompt", () => {
  it("includes all digest summaries when they have data", () => {
    const digests = [
      makeDigest({ config: { ...cfg, name: "vLLM" }, summary: "Summary A", issues: [makeItem()] }),
      makeDigest({ config: { ...cfg, name: "Ollama" }, summary: "Summary B", prs: [makeItem()] }),
    ];
    const result = buildInfraComparisonPrompt(digests, "2026-03-09");
    expect(result).toContain("Model Support Race");
    expect(result).toContain("vLLM");
    expect(result).toContain("Summary A");
    expect(result).toContain("Ollama");
    expect(result).toContain("Summary B");
  });

  it("shows no-activity for empty digests", () => {
    const result = buildInfraComparisonPrompt([makeDigest({ summary: "Summary" })], "2026-03-09");
    expect(result).toContain("No activity in the last 24 hours.");
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
          todayStars: 100,
          totalStars: 5000,
          forks: 200,
          url: "https://github.com/org/repo",
        },
      ],
      searchRepos: [],
      trendingFetchSuccess: true,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("org/repo");
    expect(result).toContain("Python");
    expect(result).toContain("5,000");
    expect(result).toContain("+100 today");
  });

  it("omits the total when the scraped star count is 0", () => {
    const data: TrendingData = {
      trendingRepos: [
        {
          fullName: "org/repo",
          description: "",
          language: "",
          todayStars: 408,
          totalStars: 0,
          forks: 0,
          url: "https://github.com/org/repo",
        },
      ],
      searchRepos: [],
      trendingFetchSuccess: true,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("- [org/repo](https://github.com/org/repo) (+408 today)");
    expect(result).not.toContain("⭐0");
  });

  it("shows fetch failure message when trending fails", () => {
    const data: TrendingData = { trendingRepos: [], searchRepos: [], trendingFetchSuccess: false };
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
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("[topic:ai-agent]");
    expect(result).toContain("1,000");
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
});
