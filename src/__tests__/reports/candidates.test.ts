import { describe, it, expect } from "vitest";
import { buildCandidates, candidatesFile, type CandidateSources } from "../../reports/candidates.ts";
import type { GitHubRelease, RepoConfig } from "../../core/github.ts";
import type { HotIssue } from "../../core/hot-issues.ts";
import type { Story } from "../../spotted/pool.ts";
import type { LabsFetchResult } from "../../sources/labs.ts";
import type { ModelCatalog } from "../../sources/openrouter.ts";
import type { TrendingRepo } from "../../trending/compose.ts";
import type { CommunityPost } from "../../data/community.ts";
import type { PolicyItem } from "../../policy/items.ts";
import type { VendorItem } from "../../data/vendors.ts";

const claude: RepoConfig = { id: "claude-code", repo: "anthropics/claude-code", name: "Claude Code" };
const duckdb: RepoConfig = { id: "duckdb", repo: "duckdb/duckdb", name: "DuckDB" };

const release = (tag: string, name: string, body: string | null): GitHubRelease => ({
  tag_name: tag,
  name,
  body,
  published_at: "2026-11-05T10:00:00Z",
  prerelease: false,
});

const hotIssue: HotIssue = {
  number: 7,
  title: "Crash on resume",
  state: "open",
  user: { login: "someone" },
  labels: [],
  created_at: "2026-11-04T08:00:00Z",
  updated_at: "2026-11-05T08:00:00Z",
  comments: 40,
  html_url: "https://github.com/anthropics/claude-code/issues/7",
  body: "It   crashes\n\nwhen resuming.",
  gain: 55,
};

const story: Story = {
  id: "lobsters:abc",
  source: "lobsters",
  title: "A story",
  url: "https://example.com/story",
  discussionUrl: "https://lobste.rs/s/abc",
  points: 120,
  comments: 30,
  description: "About a thing.",
  published: "2026-11-05T06:00:00Z",
};

const labs: LabsFetchResult[] = [
  {
    site: "anthropic",
    isFirstRun: false,
    newItems: [
      {
        url: "https://www.anthropic.com/news/new-model",
        title: "A new model",
        lastmod: "2026-11-05",
        content: "The   model\nis here.",
        site: "anthropic",
      },
    ],
    totalDiscovered: 400,
    fetchSuccess: true,
  },
];

const catalog: ModelCatalog = {
  newModels: [
    {
      id: "acme/foo-1",
      name: "Foo 1",
      description: "A model.",
      created: "2026-11-04",
      contextLength: 128000,
    },
  ],
  stealth: [{ id: "openrouter/bunny", name: "Bunny Alpha", created: "2026-11-03", expires: "2026-11-20" }],
};

const trendingRepo: TrendingRepo = {
  fullName: "someone/agent-kit",
  description: "A kit for agents.",
  language: "TypeScript",
  periodStars: 300,
  totalStars: 5000,
  forks: 40,
  url: "https://github.com/someone/agent-kit",
};

const post: CommunityPost = {
  id: "post:x",
  source: "DuckDB blog",
  kind: "blog",
  title: "Why we did it",
  url: "https://duckdb.org/2026/11/04/why",
  published: "2026-11-04T09:00:00Z",
  date: "2026-11-04",
  description: "A post about a thing.",
};

const policyItem: PolicyItem = {
  id: "eu:1",
  source: "European Commission",
  jurisdiction: "eu",
  jevOnly: true,
  title: "Guidelines on AI",
  link: "https://ec.europa.eu/guidelines",
  published: "2026-11-05T09:00:00Z",
  description: "The guidelines.",
  stage: "Adopted",
};

const vendorItem: VendorItem = {
  id: "dbx:1",
  vendor: "databricks",
  source: "Databricks release notes",
  title: "Genie file upload",
  link: "https://docs.databricks.com/genie",
  date: "2026-11-05",
  description: "Upload a file.",
};

const sources: CandidateSources = {
  agents: [
    {
      config: claude,
      releases: [release("v2.1.0", "Claude Code 2.1.0", "Fixes\n\n- one")],
      previews: [release("v2.2.0-rc1", "", null)],
      hotIssues: [hotIssue],
    },
  ],
  data: [{ config: duckdb, releases: [release("v2.0.0", "", "Big release")], previews: [], hotIssues: [] }],
  stories: [story],
  labs,
  catalog,
  trending: [trendingRepo],
  posts: [post],
  policy: [policyItem],
  vendor: [vendorItem],
  dateStr: "2026-11-05",
};

const nothing: CandidateSources = {
  agents: [],
  data: [],
  stories: [],
  labs: [],
  catalog: null,
  trending: [],
  posts: [],
  policy: [],
  vendor: [],
  dateStr: "2026-11-05",
};

describe("buildCandidates", () => {
  it("lists one candidate per fetched item, each kind on its page", () => {
    expect(buildCandidates(sources)).toEqual([
      {
        page: "ai-agents",
        kind: "release",
        source: "anthropics/claude-code",
        title: "Claude Code Claude Code 2.1.0",
        url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.0",
        published: "2026-11-05T10:00:00Z",
        text: "Fixes - one",
      },
      {
        page: "ai-agents",
        kind: "release",
        source: "anthropics/claude-code",
        title: "Claude Code v2.2.0-rc1",
        url: "https://github.com/anthropics/claude-code/releases/tag/v2.2.0-rc1",
        published: "2026-11-05T10:00:00Z",
        text: "",
      },
      {
        page: "ai-agents",
        kind: "hot-issue",
        source: "anthropics/claude-code",
        title: "Crash on resume",
        url: "https://github.com/anthropics/claude-code/issues/7",
        published: "2026-11-04T08:00:00Z",
        text: "It crashes when resuming.",
      },
      {
        page: "ai-data",
        kind: "release",
        source: "duckdb/duckdb",
        title: "DuckDB v2.0.0",
        url: "https://github.com/duckdb/duckdb/releases/tag/v2.0.0",
        published: "2026-11-05T10:00:00Z",
        text: "Big release",
      },
      {
        page: "spotted",
        kind: "story",
        source: "Lobste.rs",
        title: "A story",
        url: "https://example.com/story",
        discussion: "https://lobste.rs/s/abc",
        published: "2026-11-05T06:00:00Z",
        text: "About a thing.",
      },
      {
        page: "ai-models",
        kind: "lab-post",
        source: "anthropic",
        title: "A new model",
        url: "https://www.anthropic.com/news/new-model",
        published: "2026-11-05",
        text: "The model is here.",
      },
      {
        page: "ai-models",
        kind: "model",
        source: "OpenRouter",
        title: "Foo 1",
        url: "https://openrouter.ai/acme/foo-1",
        published: "2026-11-04",
        text: "A model.",
      },
      {
        page: "ai-models",
        kind: "model",
        source: "OpenRouter",
        title: "Bunny Alpha",
        url: "https://openrouter.ai/openrouter/bunny",
        published: "2026-11-03",
        text: "",
      },
      {
        page: "ai-agents",
        kind: "trending-repo",
        source: "GitHub Trending",
        title: "someone/agent-kit",
        url: "https://github.com/someone/agent-kit",
        published: "2026-11-05",
        text: "A kit for agents.",
      },
      {
        page: "ai-data",
        kind: "community-post",
        source: "DuckDB blog",
        title: "Why we did it",
        url: "https://duckdb.org/2026/11/04/why",
        published: "2026-11-04T09:00:00Z",
        text: "A post about a thing.",
      },
      {
        page: "ai-policy",
        kind: "policy-item",
        source: "European Commission",
        title: "Guidelines on AI",
        url: "https://ec.europa.eu/guidelines",
        published: "2026-11-05T09:00:00Z",
        text: "The guidelines.",
      },
      {
        page: "ai-data",
        kind: "vendor-note",
        source: "Databricks release notes",
        title: "Genie file upload",
        url: "https://docs.databricks.com/genie",
        published: "2026-11-05",
        text: "Upload a file.",
      },
    ]);
  });

  it("collapses whitespace and cuts the text to 1500 characters", () => {
    const body = `${"word  ".repeat(500)}\n\n${"x".repeat(1000)}`;
    const out = buildCandidates({
      ...nothing,
      agents: [{ config: claude, releases: [release("v1", "", body)], previews: [], hotIssues: [] }],
    });
    expect(out).toHaveLength(1);
    expect(out[0]?.text).toBe("word ".repeat(300));
    expect(out[0]?.text).toHaveLength(1500);
  });

  it("lists a data project's releases of the week once each, the day's included", () => {
    const today = release("v2.0.1", "", "Patch");
    const out = buildCandidates({
      ...nothing,
      data: [
        {
          config: duckdb,
          releases: [today],
          previews: [],
          hotIssues: [],
          weekReleases: [today, release("v2.0.0", "", "Big release")],
        },
      ],
    });
    expect(out.map((c) => c.url)).toEqual([
      "https://github.com/duckdb/duckdb/releases/tag/v2.0.1",
      "https://github.com/duckdb/duckdb/releases/tag/v2.0.0",
    ]);
  });

  it("gives every candidate the same seven fields, a story also its discussion, with no score, verdict or count", () => {
    const out = buildCandidates(sources);
    expect(out).toHaveLength(12);
    for (const c of out) {
      const fields = ["kind", "page", "published", "source", "text", "title", "url"];
      expect(Object.keys(c).sort()).toEqual(c.kind === "story" ? [...fields, "discussion"].sort() : fields);
    }
  });

  it("is empty when nothing was fetched", () => {
    expect(buildCandidates(nothing)).toEqual([]);
  });
});

describe("candidatesFile", () => {
  it("writes a top-level array with one candidate per line", () => {
    const candidates = buildCandidates(sources);
    const file = candidatesFile(candidates);
    expect(JSON.parse(file)).toEqual(candidates);
    expect(file.split("\n")).toHaveLength(candidates.length + 3);
  });

  it("writes an empty array as []", () => {
    expect(candidatesFile([])).toBe("[]\n");
  });
});
