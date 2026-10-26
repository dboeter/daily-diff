import { afterEach, describe, expect, it, vi } from "vitest";
import type { AskJev } from "../../core/jev.ts";
import type { TrendingVerdicts } from "../../trending/classify.ts";
import {
  type SearchRepo,
  type TrendingData,
  composeTrendingReport,
  EMPTY_OPENROUTER,
  fetchTrendingData,
  parseTrendingHtml,
  searchAiRepos,
} from "../../trending/compose.ts";
import { type MatchState } from "../../trending/match.ts";
import type { NpmPackage } from "../../trending/npm.ts";
import { MIN_STARS, NEW_REPO_MIN_STARS } from "../../trending/rank.ts";
import { DATE, classifyAnswer, notCalled } from "./helpers.ts";

const SAMPLE_HTML = `
<main>
  <div class="Box">
    <article class="Box-row">
      <h2 class="h3 lh-condensed">
        <a href="/owner1/repo-alpha">owner1 / repo-alpha</a>
      </h2>
      <p class="col-9 color-fg-muted my-1 pr-4">
        A fast inference engine for large models.
      </p>
      <div class="f6 color-fg-muted mt-2">
        <span class="d-inline-block ml-0 mr-3">
          <span itemprop="programmingLanguage">Python</span>
        </span>
        <a href="/owner1/repo-alpha/stargazers" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 12,500
        </a>
        <a href="/owner1/repo-alpha/forks" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 1,234
        </a>
        <span class="d-inline-block float-sm-right">
          523 stars today
        </span>
      </div>
    </article>
    <article class="Box-row">
      <h2 class="h3 lh-condensed">
        <a href="/owner2/repo-beta">owner2 / repo-beta</a>
      </h2>
      <p class="col-9 color-fg-muted my-1 pr-4">
        Rust-based developer CLI.
      </p>
      <div class="f6 color-fg-muted mt-2">
        <span class="d-inline-block ml-0 mr-3">
          <span itemprop="programmingLanguage">Rust</span>
        </span>
        <a href="/owner2/repo-beta/stargazers" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 850
        </a>
        <a href="/owner2/repo-beta/forks" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 42
        </a>
        <span class="d-inline-block float-sm-right">
          88 stars today
        </span>
      </div>
    </article>
  </div>
</main>
`;

const entry = (o: Partial<MatchState["apps"][string]> = {}) => ({
  title: "Kilo Code",
  rejected: [],
  lastSeen: DATE,
  ...o,
});

describe("parseTrendingHtml", () => {
  it("parses multiple trending repository cards", () => {
    const repos = parseTrendingHtml(SAMPLE_HTML);
    expect(repos).toHaveLength(2);

    expect(repos[0]).toEqual({
      fullName: "owner1/repo-alpha",
      description: "A fast inference engine for large models.",
      language: "Python",
      periodStars: 523,
      totalStars: 12500,
      forks: 1234,
      url: "https://github.com/owner1/repo-alpha",
    });

    expect(repos[1]).toEqual({
      fullName: "owner2/repo-beta",
      description: "Rust-based developer CLI.",
      language: "Rust",
      periodStars: 88,
      totalStars: 850,
      forks: 42,
      url: "https://github.com/owner2/repo-beta",
    });
  });

  it("handles empty or irrelevant HTML without errors", () => {
    expect(parseTrendingHtml("<html><body>No articles here</body></html>")).toEqual([]);
  });

  it("reads the stars gained this week from the weekly page", () => {
    const html = `
      <article class="Box-row">
        <h2><a href="/owner/weekly">owner / weekly</a></h2>
        <span class="d-inline-block float-sm-right">1,204 stars this week</span>
      </article>
    `;
    expect(parseTrendingHtml(html)[0]?.periodStars).toBe(1204);
  });

  it("handles articles with missing optional fields gracefully", () => {
    const minimalHtml = `
      <article class="Box-row">
        <h2><a href="/owner/minimal">owner / minimal</a></h2>
      </article>
    `;
    const repos = parseTrendingHtml(minimalHtml);
    expect(repos).toHaveLength(1);
    expect(repos[0]?.fullName).toBe("owner/minimal");
    expect(repos[0]?.description).toBe("");
    expect(repos[0]?.language).toBe("");
    expect(repos[0]?.periodStars).toBe(0);
    expect(repos[0]?.totalStars).toBe(0);
    expect(repos[0]?.forks).toBe(0);
  });

  it("does not read the forks count as total stars when the stargazers link has no number", () => {
    const html = `
      <article class="Box-row">
        <h2><a href="/owner/nostars">owner / nostars</a></h2>
        <a href="/owner/nostars/stargazers"><svg><path d="M8 .25a.75"></path></svg></a>
        <a href="/owner/nostars/forks"><svg><path d="M5 5.372v.878"></path></svg> 77</a>
      </article>
    `;
    const repos = parseTrendingHtml(html);
    expect(repos[0]?.totalStars).toBe(0);
    expect(repos[0]?.forks).toBe(77);
  });
});

describe("searchAiRepos", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const item = (full_name: string) => ({
    full_name,
    description: null,
    language: null,
    stargazers_count: 100,
    pushed_at: "2026-10-07T00:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
    html_url: `https://github.com/${full_name}`,
  });

  /** Mock the search API; `pages` maps "<q> page <n>" to that page's repo names. */
  function mockSearch(pages: Record<string, string[]> = {}): string[] {
    const urls: string[] = [];
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = new URL(String(input));
      urls.push(String(input));
      const names = pages[`${url.searchParams.get("q")} page ${url.searchParams.get("page")}`] ?? [];
      return { ok: true, json: async () => ({ items: names.map(item) }) } as Response;
    });
    return urls;
  }

  /** searchSlot spaces calls 2.1 s apart: run them on fake timers. */
  async function run(fourteenDaysAgo: string) {
    vi.useFakeTimers();
    const pending = searchAiRepos("2026-09-30", fourteenDaysAgo);
    await vi.runAllTimersAsync();
    return pending;
  }

  it("weekly: new and established queries per topic, paging while pages are full", async () => {
    const full = Array.from({ length: 100 }, (_, i) => `full/r${i}`);
    const urls = mockSearch({
      [`topic:coding-agent created:>2026-09-23 stars:>=${NEW_REPO_MIN_STARS} page 1`]: ["n/new"],
      [`topic:coding-agent pushed:>2026-09-30 stars:>=${MIN_STARS} page 1`]: full,
      [`topic:coding-agent pushed:>2026-09-30 stars:>=${MIN_STARS} page 2`]: ["p/two", "n/new"],
      [`topic:ai-coding pushed:>2026-09-30 stars:>=${MIN_STARS} page 1`]: ["p/two", "c/three"],
    });
    const { repos, success } = await run("2026-09-23");
    expect(success).toBe(true);
    // 6 topics × 2 queries, plus page 2 of the one full page.
    expect(urls).toHaveLength(13);
    expect(urls.every((u) => u.includes("&per_page=100&"))).toBe(true);
    expect(repos).toHaveLength(103);
    expect(repos[0]).toMatchObject({ fullName: "n/new", topic: "coding-agent" });
    expect(repos.at(-1)).toMatchObject({ fullName: "c/three", topic: "ai-coding" });
  });

  it("reports failure when every search fails, so the trace's fetched is null", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "",
    } as Response);
    expect(await run("2026-09-23")).toEqual({ repos: [], success: false });
  });

  it("retries a dropped connection, and keeps the pages before a failed one", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const pushed = `topic:coding-agent pushed:>2026-09-30 stars:>=${MIN_STARS}`;
    const full = Array.from({ length: 100 }, (_, i) => `full/r${i}`);
    let attempts = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = new URL(String(input));
      const at = `${url.searchParams.get("q")} page ${url.searchParams.get("page")}`;
      if (at === `${pushed} page 1` && attempts++ === 0) throw new TypeError("terminated");
      if (at === `${pushed} page 2`) return { ok: false, status: 500, text: async () => "" } as Response;
      const names = at === `${pushed} page 1` ? full : [];
      return { ok: true, json: async () => ({ items: names.map(item) }) } as Response;
    });
    const { repos } = await run("2026-09-23");
    expect(attempts).toBe(2);
    expect(repos).toHaveLength(100);
    expect(errors).toHaveBeenCalledWith(
      expect.stringContaining('"coding-agent" page 2: Error: GitHub API error 500'),
    );
  });
});

describe("fetchTrendingData", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns trendingFetchSuccess false instead of throwing when the network is down", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    vi.useFakeTimers();
    const pending = fetchTrendingData("daily", "2026-10-19");
    await vi.runAllTimersAsync();
    expect(await pending).toMatchObject({ trendingRepos: [], searchRepos: [], trendingFetchSuccess: false });
  });

  // Search results stopped counting as agent news on 2026-10-19, so the daily run asks only the trending page.
  it("makes no search request on the daily run", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    vi.useFakeTimers();
    const pending = fetchTrendingData("daily", "2026-10-19");
    await vi.runAllTimersAsync();
    await pending;
    expect(fetchSpy.mock.calls.some(([u]) => String(u).includes("/search/"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

describe("composeTrendingReport", () => {
  const search = (fullName: string): SearchRepo => ({
    fullName,
    description: null,
    language: null,
    stargazersCount: 1000,
    pushedAt: "2026-10-04T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    url: `https://github.com/${fullName}`,
    topic: "coding-agent",
  });
  const npmPkg = (name: string) =>
    ({ name, description: "", weekly: 1000, monthly: 4000, url: "", lastPublish: DATE }) as NpmPackage;
  const data: TrendingData = {
    trendingRepos: [],
    searchRepos: [{ ...search("a/agent"), description: "A coding agent" }, search("b/weights")],
    trendingFetchSuccess: true,
    openrouter: {
      ...EMPTY_OPENROUTER,
      apps: [
        {
          appId: 1,
          title: "Kilo Code",
          description: "",
          url: "https://kilocode.ai/docs",
          categories: [],
          createdAt: "2025-01-01T00:00:00Z",
          weekTokens: 0,
          dayRank: null,
          weekRank: 1,
          monthRank: 1,
          growthPercent: null,
        },
      ],
      fetchSuccess: true,
    },
    npm: { rising: [], top: [npmPkg("kilo-plugin"), npmPkg("@kilocode/cli")], fetchSuccess: true },
  };
  const categories: Record<string, [string, number]> = {
    "a/agent": ["coding_agent", 0.9],
    "b/weights": ["out_of_scope", 0.1],
    "kilo-plugin": ["agent_tooling", 0.1],
    "@kilocode/cli": ["coding_agent", 0.9],
    "Kilo Code": ["coding_agent", 0.9],
  };
  /** Classification answers only; a match question fails the test. */
  const ask: AskJev = async (state, questions) => {
    if (!("category" in questions)) throw new Error("unexpected match call");
    const [category, standalone] = categories[(state as { name: string }).name]!;
    return classifyAnswer(category, standalone)(state, questions, "key");
  };
  const saved = (): MatchState => ({ apps: { "1": entry({ npm: "@kilocode/cli" }) } });

  const noCache = (): TrendingVerdicts => ({ items: {} });
  /** Stands in for the history API, which would be asked about a/agent. */
  const zeroGain = async () => 0;

  it("lets Jev decide scope and Radar, and merges a saved match into one Radar row", async () => {
    const report = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: saved(),
      ask,
      history: { repos: {} },
      trendingVerdicts: noCache(),
      fetchGain: zeroGain,
    });
    expect(report.classifiedBy).toBe("jev");
    expect(report.radar.map((r) => r.keys)).toEqual([["openrouter:1", "npm:@kilocode/cli"]]);
    expect(report.categories.map((c) => [c.category, c.rows.map((r) => r.fullName)])).toEqual([
      ["coding_agent", ["a/agent"]],
    ]);
    expect(report.nextMatches?.apps["1"]).toMatchObject({ npm: "@kilocode/cli", lastSeen: DATE });
    expect(JSON.parse(report.traceFile!).matches).toEqual([
      {
        app: "openrouter:1",
        title: "Kilo Code",
        source: "npm",
        choice: "npm:@kilocode/cli",
        result: "cached",
      },
    ]);
  });

  it("skips matching and saves no state when the match file is unreadable", async () => {
    const report = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: null,
      ask,
      history: { repos: {} },
      trendingVerdicts: noCache(),
      fetchGain: zeroGain,
    });
    expect(report.radar.map((r) => r.keys)).toEqual([["openrouter:1"], ["npm:@kilocode/cli"]]);
    expect(report.nextMatches).toBeUndefined();
  });

  it("falls back to topic labels without a key and writes no trace", async () => {
    const report = await composeTrendingReport(data, DATE, {
      apiKey: "",
      matchState: saved(),
      ask: notCalled,
      history: { repos: {} },
      trendingVerdicts: noCache(),
      fetchGain: zeroGain,
    });
    expect(report.classifiedBy).toBe("topics");
    expect(report.traceFile).toBeUndefined();
    expect(report.radar[0]!.keys).toEqual(["openrouter:1", "npm:@kilocode/cli"]);
    expect(report.nextTrendingVerdicts).toEqual(noCache());
  });

  it("asks Jev only about items missing from the trending verdicts, and uses saved verdicts without a key", async () => {
    const first = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: null,
      ask,
      history: { repos: {} },
      trendingVerdicts: noCache(),
      fetchGain: zeroGain,
    });
    expect(Object.keys(first.nextTrendingVerdicts!.items)).toHaveLength(5);

    const counted = vi.fn(ask);
    const second = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: null,
      ask: counted,
      history: { repos: {} },
      trendingVerdicts: first.nextTrendingVerdicts!,
      fetchGain: zeroGain,
    });
    expect(counted).not.toHaveBeenCalled();
    expect(second.classifiedBy).toBe("jev");
    expect([second.radar, second.categories]).toEqual([first.radar, first.categories]);
    expect(second.nextTrendingVerdicts).toEqual(first.nextTrendingVerdicts);
    expect(JSON.parse(second.traceFile!).items[0]).toMatchObject({ key: "github:a/agent", decided: DATE });

    // The topic fallback would put b/weights (topic coding-agent) in coding_agent; the saved verdict keeps it out.
    const keyless = await composeTrendingReport(data, DATE, {
      apiKey: "",
      matchState: null,
      ask: notCalled,
      history: { repos: {} },
      trendingVerdicts: first.nextTrendingVerdicts!,
      fetchGain: zeroGain,
    });
    expect(keyless.categories).toEqual(first.categories);
  });

  it("asks every item and saves no cache when the cache file is unreadable", async () => {
    const counted = vi.fn(ask);
    const report = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: null,
      ask: counted,
      history: { repos: {} },
      trendingVerdicts: null,
      fetchGain: zeroGain,
    });
    expect(counted).toHaveBeenCalledTimes(5);
    expect(report.nextTrendingVerdicts).toBeUndefined();
  });
});
