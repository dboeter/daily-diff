import { describe, it, expect } from "vitest";
import { agentMatcher, agentTerms, matchAgentNews, NEWS_PER_AGENT } from "../agent-news.ts";
import type { RepoConfig } from "../github.ts";
import type { HnData, HnStory } from "../hn.ts";
import type { TrendingData } from "../trending.ts";
import type { WebFetchResult } from "../web.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const claudeCode: RepoConfig = { id: "claude-code", repo: "anthropics/claude-code", name: "Claude Code" };
const pi: RepoConfig = {
  id: "pi",
  repo: "earendil-works/pi",
  name: "Pi",
  keywords: ["pi coding agent", "pi agent", "earendil"],
};
const openclaw: RepoConfig = { id: "openclaw", repo: "openclaw/openclaw", name: "OpenClaw" };

function story(title: string, id = title): HnStory {
  return {
    id,
    title,
    url: `https://example.com/${encodeURIComponent(id)}`,
    hnUrl: `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`,
    points: 100,
    comments: 20,
    author: "alice",
    createdAt: "2026-10-04T00:00:00Z",
  };
}

function hn(...titles: string[]): HnData {
  return { stories: titles.map((t) => story(t)), fetchSuccess: true };
}

const matches = (cfg: RepoConfig, text: string) => agentMatcher(cfg).test(text);

// ---------------------------------------------------------------------------
// agentTerms / agentMatcher
// ---------------------------------------------------------------------------

describe("agentTerms", () => {
  it("uses the display name, repo name and full repo by default", () => {
    expect(agentTerms(openclaw)).toEqual(["OpenClaw", "openclaw", "openclaw/openclaw"]);
  });

  it("uses the keywords instead of the short names when set, plus the full repo", () => {
    expect(agentTerms(pi)).toEqual(["pi coding agent", "pi agent", "earendil", "earendil-works/pi"]);
  });
});

describe("agentMatcher", () => {
  it("matches a name with spaces, hyphens or neither", () => {
    expect(matches(claudeCode, "Claude Code adds background agents")).toBe(true);
    expect(matches(claudeCode, "anthropics claude-code")).toBe(true);
    expect(matches(claudeCode, "Why ClaudeCode won")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(matches(openclaw, "OPENCLAW 2026.9 is out")).toBe(true);
  });

  it("matches a name followed by a hyphen", () => {
    expect(matches(claudeCode, "Claude Code-powered review bot")).toBe(true);
    expect(matches(pi, "earendil-works pi")).toBe(true);
  });

  it("matches the full owner/repo, with a slash or as trending text", () => {
    const codex: RepoConfig = { id: "codex", repo: "openai/codex", name: "Codex", keywords: ["codex"] };
    expect(matches(codex, "Fork of openai/codex with MCP support")).toBe(true);
    expect(matches(pi, "Patches for earendil-works/pi")).toBe(true);
  });

  it("does not match inside a longer word", () => {
    expect(matches(openclaw, "openclawish forks")).toBe(false);
  });

  it("matches Pi only through its keywords", () => {
    expect(matches(pi, "Show HN: Pi pod – Run your pi coding agent in sandboxes")).toBe(true);
    expect(matches(pi, "Earendil ships Pi 1.0")).toBe(true);
  });

  it("does not match the bare word pi, API or Raspberry Pi", () => {
    expect(matches(pi, "A new API for agents")).toBe(false);
    expect(matches(pi, "Running Llama on a Raspberry Pi 5")).toBe(false);
    expect(matches(pi, "raspberry-pi agent cluster")).toBe(false);
    expect(matches(pi, "Building a Raspberry Pi agent for home automation")).toBe(false);
    expect(matches(pi, "Computing pi to a trillion digits")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// matchAgentNews
// ---------------------------------------------------------------------------

describe("matchAgentNews", () => {
  it("assigns HN stories to the agents they mention", () => {
    const news = matchAgentNews([claudeCode, openclaw], {
      hn: hn("Claude Code hooks deep dive", "OpenClaw vs Claude Code", "Unrelated GPU news"),
    });
    expect(news.get("claude-code")!.map((n) => n.title)).toEqual([
      "Claude Code hooks deep dive",
      "OpenClaw vs Claude Code",
    ]);
    expect(news.get("openclaw")!.map((n) => n.title)).toEqual(["OpenClaw vs Claude Code"]);
  });

  it("links HN items to the discussion and carries their score", () => {
    const [item] = matchAgentNews([openclaw], { hn: hn("OpenClaw 2.0") }).get("openclaw")!;
    expect(item!.source).toBe("Hacker News");
    expect(item!.url).toContain("news.ycombinator.com");
    expect(item!.detail).toBe("100 points, 20 comments");
  });

  it("matches web pages by URL slug when the title is generic", () => {
    const web: WebFetchResult[] = [
      {
        site: "anthropic",
        siteName: "Anthropic (Claude)",
        isFirstRun: false,
        totalDiscovered: 1,
        newItems: [
          {
            url: "https://www.anthropic.com/news/claude-code-on-the-web",
            title: "Introducing a new way to work",
            lastmod: "2026-10-04",
            content: "",
            site: "anthropic",
            category: "news",
          },
        ],
      },
    ];
    const news = matchAgentNews([claudeCode], { web });
    expect(news.get("claude-code")!.map((n) => n.source)).toEqual(["Anthropic (Claude)"]);
  });

  it("matches trending repos by name and description", () => {
    const trending: TrendingData = {
      trendingFetchSuccess: true,
      trendingRepos: [
        {
          fullName: "someone/cc-skills",
          description: "A skill pack for Claude Code",
          language: "TypeScript",
          periodStars: 300,
          totalStars: 1000,
          forks: 10,
          url: "https://github.com/someone/cc-skills",
        },
      ],
      searchRepos: [
        {
          fullName: "openclaw/openclaw",
          description: null,
          language: "TypeScript",
          stargazersCount: 90000,
          pushedAt: "2026-10-04",
          url: "https://github.com/openclaw/openclaw",
          searchQuery: "ai-agent",
        },
      ],
    };
    const news = matchAgentNews([claudeCode, openclaw], { trending });
    expect(news.get("claude-code")!.map((n) => n.url)).toEqual(["https://github.com/someone/cc-skills"]);
    expect(news.get("openclaw")!.map((n) => n.url)).toEqual(["https://github.com/openclaw/openclaw"]);
  });

  it("de-duplicates by URL and caps the list per agent", () => {
    const stories = [
      story("OpenClaw one", "1"),
      story("OpenClaw one again", "1"),
      ...Array.from({ length: 10 }, (_, i) => story(`OpenClaw ${i}`, `x${i}`)),
    ];
    const items = matchAgentNews([openclaw], { hn: { stories, fetchSuccess: true } }).get("openclaw")!;
    expect(items).toHaveLength(NEWS_PER_AGENT);
    expect(new Set(items.map((n) => n.url)).size).toBe(items.length);
  });

  it("drops compatibility lists that name three or more agents", () => {
    const codex: RepoConfig = {
      id: "codex",
      repo: "openai/codex",
      name: "OpenAI Codex",
      keywords: ["codex"],
    };
    const news = matchAgentNews([claudeCode, codex, openclaw], {
      hn: hn("Memory plugin for Claude Code, Codex and OpenClaw", "Codex vs Claude Code"),
    });
    expect(news.get("claude-code")!.map((n) => n.title)).toEqual(["Codex vs Claude Code"]);
    expect(news.get("openclaw")).toEqual([]);
  });

  it("returns an empty list for every agent when no source has data", () => {
    const news = matchAgentNews([claudeCode, pi], {});
    expect(news.get("claude-code")).toEqual([]);
    expect(news.get("pi")).toEqual([]);
  });
});
