import { describe, it, expect } from "vitest";
import {
  buildCliPrompt,
  buildPeerPrompt,
  buildInfraPrompt,
  buildComparisonPrompt,
  buildInfraComparisonPrompt,
  buildPeersComparisonPrompt,
  buildSkillsPrompt,
} from "../prompts.ts";
import { buildTrendingPrompt, buildWebReportPrompt, buildHnPrompt } from "../prompts-data.ts";
import type { RepoConfig, GitHubItem, GitHubRelease, GitHubDiscussion } from "../github.ts";
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

function makeDiscussion(overrides: Partial<GitHubDiscussion> = {}): GitHubDiscussion {
  return {
    number: 42,
    title: "Discussion title",
    body: "Discussion body",
    category: "Ideas",
    author: "alice",
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 4,
    upvotes: 16,
    answered: false,
    html_url: "https://github.com/org/test/discussions/42",
    ...overrides,
  };
}

const release: GitHubRelease = {
  tag_name: "v1.0.0",
  name: "Release 1.0",
  body: "Release notes",
  published_at: "2026-03-09T00:00:00Z",
};

function makeDigest(overrides: Partial<RepoDigest> = {}): RepoDigest {
  return {
    config: cfg,
    issues: [],
    prs: [],
    releases: [],
    discussions: [],
    summary: "Summary",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildCliPrompt
// ---------------------------------------------------------------------------

describe("buildCliPrompt", () => {
  it("includes repo, date and release data", () => {
    const result = buildCliPrompt(cfg, [makeItem()], [makeItem()], [release], [], "2026-03-09");
    expect(result).toContain("technical analyst");
    expect(result).toContain("TestTool");
    expect(result).toContain("2026-03-09");
    expect(result).toContain("org/test");
    expect(result).toContain("v1.0.0");
  });

  it("asks for the standard sections", () => {
    const result = buildCliPrompt(cfg, [makeItem()], [], [], [], "2026-03-09");
    expect(result).toContain("Hot Issues");
  });

  it("shows None when no data", () => {
    const result = buildCliPrompt(cfg, [], [], [], [], "2026-03-09");
    expect(result).toContain("None");
  });

  it("includes sample notes when items exceed limit", () => {
    const items = Array.from({ length: 50 }, (_, i) => makeItem({ number: i, comments: i }));
    const result = buildCliPrompt(cfg, items, [], [], [], "2026-03-09");
    expect(result).toContain("Total: 50 items; showing top 30");
  });

  it("omits the Discussions section when there is no discussion data", () => {
    const result = buildCliPrompt(cfg, [makeItem()], [], [], [], "2026-03-09");
    expect(result).not.toContain("Latest Discussions");
  });

  it("renders the Discussions section when data is present", () => {
    const result = buildCliPrompt(cfg, [], [], [], [makeDiscussion()], "2026-03-09");
    expect(result).toContain("Latest Discussions");
    expect(result).toContain("#42 [Ideas]");
    expect(result).toContain("Hot Discussions");
  });

  it("samples discussions by engagement when they exceed the limit", () => {
    const items = Array.from({ length: 60 }, (_, i) =>
      makeDiscussion({ number: i, comments: 0, upvotes: i }),
    );
    const result = buildCliPrompt(cfg, [], [], [], items, "2026-03-09");
    expect(result).toContain("Total: 60 items; showing top 40 by comments + upvotes");
    // Highest-upvoted kept, lowest dropped
    expect(result).toContain("#59 [Ideas]");
    expect(result).not.toContain("#0 [Ideas]");
  });
});

// ---------------------------------------------------------------------------
// buildPeerPrompt
// ---------------------------------------------------------------------------

describe("buildPeerPrompt", () => {
  it("includes data overview section", () => {
    const issues = [makeItem({ state: "open" }), makeItem({ state: "closed" })];
    const result = buildPeerPrompt(cfg, issues, [makeItem()], [release], "2026-03-09");
    expect(result).toContain("Data Overview");
    expect(result).toContain("open/active: 1");
    expect(result).toContain("closed: 1");
  });

  it("shows None when no data", () => {
    const result = buildPeerPrompt(cfg, [], [], [], "2026-03-09", 30, 20);
    expect(result).toContain("Data Overview");
    expect(result).toContain("None");
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
// buildComparisonPrompt
// ---------------------------------------------------------------------------

describe("buildComparisonPrompt", () => {
  it("includes all digest summaries when they have data", () => {
    const digests = [
      makeDigest({ config: { ...cfg, name: "Tool A" }, summary: "Summary A", issues: [makeItem()] }),
      makeDigest({ config: { ...cfg, name: "Tool B" }, summary: "Summary B", prs: [makeItem()] }),
    ];
    const result = buildComparisonPrompt(digests, "2026-03-09");
    expect(result).toContain("Tool A");
    expect(result).toContain("Summary A");
    expect(result).toContain("Tool B");
    expect(result).toContain("Summary B");
  });

  it("shows no-activity for empty digests", () => {
    const digests = [makeDigest({ summary: "Summary" })]; // no issues/prs/releases
    const result = buildComparisonPrompt(digests, "2026-03-09");
    expect(result).toContain("No activity in the last 24 hours.");
  });
});

// ---------------------------------------------------------------------------
// buildPeersComparisonPrompt
// ---------------------------------------------------------------------------

describe("buildPeersComparisonPrompt", () => {
  it("includes openclaw and peer sections", () => {
    const openclawDigest = makeDigest({
      config: { id: "openclaw", repo: "openclaw/openclaw", name: "OpenClaw" },
      summary: "OC summary",
    });
    const peerDigests = [
      makeDigest({ config: { ...cfg, name: "Peer" }, summary: "Peer summary", issues: [makeItem()] }),
    ];
    const result = buildPeersComparisonPrompt(openclawDigest, peerDigests, "2026-03-09");
    expect(result).toContain("OpenClaw (core reference");
    expect(result).toContain("OC summary");
    expect(result).toContain("Peer summary");
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
