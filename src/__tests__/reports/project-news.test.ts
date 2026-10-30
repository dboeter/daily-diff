import { describe, it, expect } from "vitest";
import {
  agentMatcher,
  agentTerms,
  matchProjectNews,
  NEWS_PER_AGENT,
  type NewsSources,
} from "../../reports/project-news.ts";
import { DATA_SECTION_KEYS, loadConfig } from "../../core/config.ts";
import type { RepoConfig } from "../../core/github.ts";
import type { Story } from "../../spotted/pool.ts";
import { EMPTY_NPM, EMPTY_OPENROUTER, type TrendingData } from "../../trending/compose.ts";
import type { LabsFetchResult } from "../../sources/labs.ts";

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

function story(title: string, id = title): Story {
  return {
    id: `hn:${id}`,
    source: "hn",
    title,
    url: `https://example.com/${encodeURIComponent(id)}`,
    discussionUrl: `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`,
    points: 100,
    comments: 20,
    published: "2026-10-04T00:00:00Z",
  };
}

const hn = (...titles: string[]): Story[] => titles.map((t) => story(t));

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
// matchProjectNews
// ---------------------------------------------------------------------------

describe("matchProjectNews", () => {
  it("assigns HN stories to the agents they mention", () => {
    const news = matchProjectNews([claudeCode, openclaw], {
      stories: hn("Claude Code hooks deep dive", "OpenClaw vs Claude Code", "Unrelated GPU news"),
    });
    expect(news.get("claude-code")!.map((n) => n.title)).toEqual([
      "Claude Code hooks deep dive",
      "OpenClaw vs Claude Code",
    ]);
    expect(news.get("openclaw")!.map((n) => n.title)).toEqual(["OpenClaw vs Claude Code"]);
  });

  it("links HN items to the discussion and carries their score and story id", () => {
    const [item] = matchProjectNews([openclaw], { stories: hn("OpenClaw 2.0") }).get("openclaw")!;
    expect(item!.source).toBe("Hacker News");
    expect(item!.url).toContain("news.ycombinator.com");
    expect(item!.detail).toBe("100 points, 20 comments");
    expect(item!.id).toBe("hn:OpenClaw 2.0");
  });

  it("matches Lobste.rs and Dev.to stories too, a Dev.to story's points as reactions", () => {
    const lobsters: Story = {
      ...story("OpenClaw on a Pi"),
      id: "lobsters:abc",
      source: "lobsters",
      discussionUrl: "https://lobste.rs/s/abc",
    };
    const devto: Story = {
      ...story("OpenClaw tips"),
      id: "devto:7",
      source: "devto",
      discussionUrl: "https://dev.to/a/b",
    };
    const items = matchProjectNews([openclaw], { stories: [lobsters, devto] }).get("openclaw")!;
    expect(items.map((n) => [n.source, n.url, n.detail, n.id])).toEqual([
      ["Lobste.rs", "https://lobste.rs/s/abc", "100 points, 20 comments", "lobsters:abc"],
      ["Dev.to", "https://dev.to/a/b", "100 reactions, 20 comments", "devto:7"],
    ]);
  });

  // Lab posts are the models page's tracked items, shown there once.
  it("takes no lab posts as project news", () => {
    const labs: LabsFetchResult[] = [
      {
        site: "anthropic",
        isFirstRun: false,
        totalDiscovered: 1,
        fetchSuccess: true,
        newItems: [
          {
            url: "https://www.anthropic.com/news/claude-code-on-the-web",
            title: "Introducing a new way to work",
            lastmod: "2026-10-04",
            content: "",
            site: "anthropic",
          },
        ],
      },
    ];
    const news = matchProjectNews([claudeCode], { labs } as NewsSources);
    expect(news.get("claude-code")).toEqual([]);
  });

  // 2026-10-19: vakandi/opencode-rust, vastsa/PI-Desktop and others made 10 of 16 projects "active".
  it("does not count a third-party repo that names a project as its news", () => {
    const trending: TrendingData = {
      trendingFetchSuccess: true,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
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
          fullName: "someone/claw-memory",
          description: "Long-term memory for OpenClaw",
          language: "TypeScript",
          stargazersCount: 900,
          pushedAt: "2026-10-04",
          createdAt: "2025-01-01T00:00:00Z",
          url: "https://github.com/someone/claw-memory",
          topic: "ai-agent",
        },
      ],
    };
    const news = matchProjectNews([claudeCode, openclaw], { trending });
    expect(news.get("claude-code")).toEqual([]);
    expect(news.get("openclaw")).toEqual([]);
  });

  it("skips an agent's own repo in search results, not on GitHub Trending", () => {
    const trending: TrendingData = {
      trendingFetchSuccess: true,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
      trendingRepos: [],
      searchRepos: [
        {
          fullName: "openclaw/openclaw",
          description: null,
          language: "TypeScript",
          stargazersCount: 90000,
          pushedAt: "2026-10-04",
          createdAt: "2025-01-01T00:00:00Z",
          url: "https://github.com/OpenClaw/OpenClaw",
          topic: "ai-agent",
        },
      ],
    };
    expect(matchProjectNews([openclaw], { trending }).get("openclaw")).toEqual([]);

    trending.trendingRepos = [
      {
        fullName: "openclaw/openclaw",
        description: "",
        language: "TypeScript",
        periodStars: 800,
        totalStars: 90000,
        forks: 10,
        url: "https://github.com/openclaw/openclaw",
      },
    ];
    expect(
      matchProjectNews([openclaw], { trending })
        .get("openclaw")!
        .map((n) => n.source),
    ).toEqual(["GitHub Trending"]);
  });

  it("de-duplicates by link and caps the list per agent", () => {
    const stories = [
      story("OpenClaw one", "1"),
      story("OpenClaw one again", "1"),
      ...Array.from({ length: 10 }, (_, i) => story(`OpenClaw ${i}`, `x${i}`)),
    ];
    const items = matchProjectNews([openclaw], { stories }).get("openclaw")!;
    expect(items).toHaveLength(NEWS_PER_AGENT);
    expect(new Set(items.map((n) => n.url)).size).toBe(items.length);
  });

  it("takes the copies of one article on two sources as one item, the first that matches", () => {
    const lobsters = (title: string): Story => ({
      ...story(title, "x"),
      id: "lobsters:x",
      source: "lobsters",
      url: "https://www.example.com/a/",
      discussionUrl: "https://lobste.rs/s/x",
    });
    const hnCopy = (title: string): Story => ({ ...story(title, "1"), url: "https://example.com/a" });
    const both = matchProjectNews([openclaw], {
      stories: [hnCopy("OpenClaw 3.0"), lobsters("OpenClaw 3.0")],
    });
    expect(both.get("openclaw")!.map((n) => n.id)).toEqual(["hn:1"]);
    // An HN title that names no project leaves the article to the Lobste.rs copy that does.
    const one = matchProjectNews([openclaw], {
      stories: [hnCopy("A 3.0 release"), lobsters("OpenClaw 3.0")],
    });
    expect(one.get("openclaw")!.map((n) => n.id)).toEqual(["lobsters:x"]);
  });

  it("leaves an article to another copy when the projects its title names have full lists", () => {
    const codex: RepoConfig = { id: "codex", repo: "openai/codex", name: "Codex" };
    const full = Array.from({ length: NEWS_PER_AGENT }, (_, i) => story(`Claude Code tip ${i}`, `t${i}`));
    const lobsters: Story = {
      ...story("Codex adopts the same plugin API", "x"),
      id: "lobsters:x",
      source: "lobsters",
      url: "https://example.com/a",
    };
    const news = matchProjectNews([claudeCode, codex], {
      stories: [...full, { ...story("Claude Code 3.0 is out", "1"), url: "https://example.com/a" }, lobsters],
    });
    expect(news.get("claude-code")).toHaveLength(NEWS_PER_AGENT);
    expect(news.get("codex")!.map((n) => n.id)).toEqual(["lobsters:x"]);
  });

  it("drops compatibility lists that name three or more agents", () => {
    const codex: RepoConfig = {
      id: "codex",
      repo: "openai/codex",
      name: "OpenAI Codex",
      keywords: ["codex"],
    };
    const news = matchProjectNews([claudeCode, codex, openclaw], {
      stories: hn("Memory plugin for Claude Code, Codex and OpenClaw", "Codex vs Claude Code"),
    });
    expect(news.get("claude-code")!.map((n) => n.title)).toEqual(["Codex vs Claude Code"]);
    expect(news.get("openclaw")).toEqual([]);
  });

  it("returns an empty list for every agent when no source has data", () => {
    const news = matchProjectNews([claudeCode, pi], {});
    expect(news.get("claude-code")).toEqual([]);
    expect(news.get("pi")).toEqual([]);
  });
});

// The data report's projects, with the keywords in config.yml.
describe("data project news", () => {
  const config = loadConfig();
  const dataRepos = DATA_SECTION_KEYS.flatMap((k) => config[k].repos);
  const repo = (id: string) => dataRepos.find((r) => r.id === id)!;

  it("does not match Delta Lake on another delta", () => {
    expect(matches(repo("delta"), "Delta Air Lines cancels flights")).toBe(false);
    expect(matches(repo("delta"), "Measuring the delta between two runs")).toBe(false);
    expect(matches(repo("delta"), "Delta Lake 4.0 released")).toBe(true);
  });

  it("routes delta-rs stories to delta-rs, not Delta Lake", () => {
    expect(matches(repo("delta"), "delta-rs adds deletion vectors")).toBe(false);
    expect(matches(repo("delta-rs"), "delta-rs adds deletion vectors")).toBe(true);
    expect(matches(repo("delta-rs"), "Reading Delta tables with the deltalake Python package")).toBe(true);
  });

  it("does not match Soda Core on the drink", () => {
    expect(matches(repo("soda-core"), "Baking soda vs. baking powder")).toBe(false);
    expect(matches(repo("soda-core"), "Soda Core 4.24 adds contract checks")).toBe(true);
  });

  it("matches dlt only by its keywords, never inside another word", () => {
    expect(matches(repo("dlt"), "DLT pipelines on Databricks")).toBe(false);
    expect(matches(repo("dlt"), "Faster sdlt parsing")).toBe(false);
    expect(matches(repo("dlt"), "dltHub raises a seed round")).toBe(true);
    expect(matches(repo("dlt"), "dlt-hub/dlt — data load tool")).toBe(true);
  });

  it("does not match the Databricks CLI on any CLI", () => {
    expect(matches(repo("databricks-cli"), "A CLI for everything")).toBe(false);
    expect(matches(repo("databricks-cli"), "The new Databricks CLI bundles")).toBe(true);
  });

  it("keeps a story naming three data projects, which the agents pool would drop", () => {
    const sources = { stories: hn("DuckDB vs Polars on Apache Iceberg tables") };
    const news = matchProjectNews(dataRepos, sources, Infinity);
    for (const id of ["duckdb", "polars", "iceberg"]) expect(news.get(id)).toHaveLength(1);
    expect(matchProjectNews(dataRepos, sources).get("duckdb")).toEqual([]);
  });
});

describe("matchProjectNews reads the description", () => {
  it("matches a story that names the project only in its description, and passes the description on", () => {
    const openShell: RepoConfig = { id: "openshell", repo: "NVIDIA/OpenShell", name: "OpenShell" };
    const s = {
      ...story("Agents should never hold your API keys. NVIDIA just open-sourced the runtime"),
      description: "NVIDIA open-sourced OpenShell: a runtime where agent fleets get kernel-level sandboxes.",
    };
    const news = matchProjectNews([openShell], { stories: [s] }).get("openshell")!;
    expect(news.map((n) => n.id)).toEqual([s.id]);
    expect(news[0]!.description).toContain("open-sourced OpenShell");
  });
});
