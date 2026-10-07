import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildRadarCandidates,
  loadStarHistory,
  mergeRows,
  nextStarHistory,
  radarPool,
  rankGithubRepos,
  selectTrendingReport,
  saveStarHistory,
  starBaseline,
  summaryRows,
  urlMerge,
  type GithubRow,
  type RadarRow,
  type StarHistory,
} from "../trending-rank.ts";
import type { AskJev, Classification } from "../trending-jev.ts";
import {
  composeTrendingReport,
  EMPTY_NPM,
  EMPTY_OPENROUTER,
  type SearchRepo,
  type TrendingRepo,
} from "../trending.ts";
import type { OpenRouterApp } from "../openrouter.ts";
import type { NpmData, NpmPackage } from "../npm.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DATE = "2026-10-05";

function trending(fullName: string, o: Partial<TrendingRepo> = {}): TrendingRepo {
  return {
    fullName,
    description: "",
    language: "",
    periodStars: 0,
    totalStars: 0,
    forks: 0,
    url: `https://github.com/${fullName}`,
    ...o,
  };
}

function search(fullName: string, o: Partial<SearchRepo> = {}): SearchRepo {
  return {
    fullName,
    description: null,
    language: null,
    stargazersCount: 0,
    pushedAt: "2026-10-04T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    url: `https://github.com/${fullName}`,
    searchQuery: "ai-agent",
    ...o,
  };
}

function app(appId: number, o: Partial<OpenRouterApp> = {}): OpenRouterApp {
  return {
    appId,
    title: `App ${appId}`,
    description: "",
    url: "",
    categories: [],
    createdAt: "2025-01-01T00:00:00Z",
    weekTokens: 0,
    dayRank: null,
    weekRank: 10,
    monthRank: 20,
    growthPercent: null,
    ...o,
  };
}

/** weekly 1,000 / monthly 4,000 = momentum 1.1x (not new). */
function pkg(name: string, o: Partial<NpmPackage> = {}): NpmPackage {
  return {
    name,
    description: "",
    weekly: 1000,
    monthly: 4000,
    url: `https://www.npmjs.com/package/${name}`,
    lastPublish: "2026-10-01",
    ...o,
  };
}

const npmData = (rising: NpmPackage[], top: NpmPackage[] = []): NpmData => ({
  rising,
  top,
  fetchSuccess: true,
});
const NO_NPM = npmData([]);
const IN_SCOPE: Classification = { category: null, standalone: null };

/** Classify every candidate in scope. */
const allInScope = (rows: { keys: string[] }[]) => new Map(rows.map((r) => [r.keys[0]!, IN_SCOPE]));

// ---------------------------------------------------------------------------
// rankGithubRepos
// ---------------------------------------------------------------------------

describe("rankGithubRepos", () => {
  it("merges by fullName: trending numbers, search topic and creation date", () => {
    const rows = rankGithubRepos(
      [
        trending("a/x", {
          periodStars: 50,
          totalStars: 1000,
          language: "Rust",
          description: "from trending",
        }),
        trending("b/y", { periodStars: 10 }),
      ],
      [
        search("A/X", { stargazersCount: 999, searchQuery: "harness", language: "Go", description: "s" }),
        search("b/y", { stargazersCount: 500, language: "Go", description: "from search" }),
      ],
      DATE,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      key: "github:a/x",
      totalStars: 1000,
      language: "Rust",
      description: "from trending",
      topic: "harness",
      perWeek: 50,
      starsCell: "1,000 (+50)",
    });
    // Trending total missing (0) → search total; empty trending fields fall back too.
    expect(rows[1]).toMatchObject({
      totalStars: 500,
      language: "Go",
      description: "from search",
      starsCell: "500 (+10)",
    });
  });

  it("applies the perWeek precedence and sorts the null tail by total stars", () => {
    const rows = rankGithubRepos(
      [trending("t/week", { periodStars: 300, totalStars: 86_392 })],
      [
        search("s/old-small", { stargazersCount: 100 }),
        search("s/old-big", { stargazersCount: 86_392 }),
        // Created 7 days ago: 900 stars → 900/week.
        search("s/new", { stargazersCount: 900, createdAt: "2026-09-28T00:00:00Z" }),
        // New and on the trending page: GitHub's own count wins.
        search("t/week", { createdAt: "2026-10-01T00:00:00Z" }),
        // Created today: age 0 counts as 1 day.
        search("s/today", { stargazersCount: 10, createdAt: "2026-10-05T01:00:00Z" }),
      ],
      DATE,
    );
    expect(rows.map((r) => [r.fullName, r.perWeek])).toEqual([
      ["s/new", 900],
      ["t/week", 300],
      ["s/today", 70],
      ["s/old-big", null],
      ["s/old-small", null],
    ]);
  });

  it("formats each stars cell", () => {
    const rows = rankGithubRepos(
      [
        trending("t/full", { periodStars: 1851, totalStars: 86_392 }),
        trending("t/no-total", { periodStars: 1851 }),
      ],
      [
        search("s/new", { stargazersCount: 1240, createdAt: "2026-09-26T12:00:00Z" }),
        search("s/one", { stargazersCount: 5, createdAt: "2026-10-04T00:00:00Z" }),
        search("s/old", { stargazersCount: 86_392 }),
      ],
      DATE,
    );
    const cell = (name: string) => rows.find((r) => r.fullName === name)!.starsCell;
    expect(cell("t/full")).toBe("86,392 (+1,851)");
    expect(cell("t/no-total")).toBe("(+1,851)");
    expect(cell("s/new")).toBe("1,240 (new, 9 days)");
    expect(cell("s/one")).toBe("5 (new, 1 day)");
    expect(cell("s/old")).toBe("86,392");
  });

  it("dates creation in CST and flags repos up to 14 days old or from a new:* query", () => {
    const rows = rankGithubRepos(
      [],
      [
        // 2026-09-20T20:00Z is 2026-09-21 in CST: 14 days.
        search("s/edge", { createdAt: "2026-09-20T20:00:00Z" }),
        search("s/old", { createdAt: "2026-09-20T10:00:00Z" }),
        search("s/new-query", { searchQuery: "new:harness" }),
      ],
      DATE,
    );
    const row = (name: string) => rows.find((r) => r.fullName === name)!;
    expect(row("s/edge").isNew).toBe(true);
    expect(row("s/edge").starsCell).toBe("0 (new, 14 days)");
    expect(row("s/old").isNew).toBe(false);
    expect(row("s/new-query")).toMatchObject({ isNew: true, perWeek: null });
  });

  it("leaves topic unset for trending-page-only repos", () => {
    const [row] = rankGithubRepos([trending("t/only", { periodStars: 5 })], [], DATE);
    expect(row).not.toHaveProperty("topic");
    expect(row!.isNew).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildRadarCandidates
// ---------------------------------------------------------------------------

describe("buildRadarCandidates", () => {
  const signal = (rows: RadarRow[], key: string) => rows.find((r) => r.keys[0] === key)!.signals[0];

  it("formats OpenRouter signals and flags new apps", () => {
    const rows = buildRadarCandidates(
      [
        app(1, { weekRank: 12, monthRank: null, weekTokens: 2_640_000_000_000, growthPercent: 776 }),
        app(2, { weekRank: 3, monthRank: 5, growthPercent: -12 }),
        app(3, { createdAt: "2026-09-21T10:00:00Z" }),
        app(4, { createdAt: "2026-09-20T10:00:00Z" }),
        app(5, { weekRank: null, monthRank: null }),
      ],
      NO_NPM,
      [],
      DATE,
    );
    expect(signal(rows, "openrouter:1")).toBe("🆕 week #12 / month —, 2.64T tokens/week · 📈 +776%");
    expect(signal(rows, "openrouter:2")).toBe("week #3 / month #5 · 📈 -12%");
    // Listed 14 days ago: new; 15 days: not.
    expect(signal(rows, "openrouter:3")).toBe("🆕 week #10 / month #20");
    expect(signal(rows, "openrouter:4")).toBe("week #10 / month #20");
    // Unranked both periods is not "ranked this week, absent from the month list".
    expect(signal(rows, "openrouter:5")).toBe("week — / month —");
    expect(rows.find((r) => r.keys[0] === "openrouter:1")).toMatchObject({
      sources: ["OpenRouter"],
      isNew: true,
    });
  });

  it("formats npm signals and flags momentum >= 3x as new", () => {
    const rows = buildRadarCandidates(
      [],
      npmData(
        [pkg("at-three", { weekly: 700, monthly: 1000 })],
        [pkg("steady", { weekly: 12_560, monthly: 100_000 })],
      ),
      [],
      DATE,
    );
    expect(signal(rows, "npm:at-three")).toBe("🆕 700/week, 3.0x");
    expect(signal(rows, "npm:steady")).toBe("12,560/week, 0.5x");
    expect(rows.find((r) => r.keys[0] === "npm:steady")).toMatchObject({ sources: ["npm"], isNew: false });
  });

  it("takes only new GitHub rows, always 🆕, with the stars cell as signal", () => {
    const github = rankGithubRepos(
      [],
      [search("s/new", { stargazersCount: 1240, createdAt: "2026-09-26T00:00:00Z" }), search("s/old")],
      DATE,
    );
    const rows = buildRadarCandidates([], NO_NPM, github, DATE);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      keys: ["github:s/new"],
      name: "s/new",
      sources: ["GitHub"],
      signals: ["🆕 1,240 (new, 9 days)"],
      isNew: true,
    });
  });

  it("leaves new GitHub repos under 25 stars off the Radar", () => {
    const github = rankGithubRepos(
      [],
      [
        search("s/small", { searchQuery: "new:coding-agent", stargazersCount: 24 }),
        search("s/big", { searchQuery: "new:coding-agent", stargazersCount: 25 }),
      ],
      DATE,
    );
    expect(buildRadarCandidates([], NO_NPM, github, DATE).map((r) => r.keys[0])).toEqual(["github:s/big"]);
  });

  it("orders 🆕 first, then by relative position, ties OpenRouter > npm > GitHub", () => {
    const github = rankGithubRepos(
      [],
      [search("g/new", { searchQuery: "new:harness", stargazersCount: 30 })],
      DATE,
    );
    const rows = buildRadarCandidates(
      [app(1), app(2)],
      npmData([pkg("p-new", { weekly: 1000, monthly: 1000 })], [pkg("p1"), pkg("p2"), pkg("p3")]),
      github,
      DATE,
    );
    expect(rows.map((r) => r.keys[0])).toEqual([
      "npm:p-new", // 🆕, position 0, npm before GitHub
      "github:g/new", // 🆕, position 0
      "openrouter:1", // 0
      "npm:p1", // 0.25
      "openrouter:2", // 0.5, OpenRouter before npm
      "npm:p2", // 0.5
      "npm:p3", // 0.75
    ]);
  });
});

// ---------------------------------------------------------------------------
// Merging
// ---------------------------------------------------------------------------

describe("urlMerge", () => {
  it("merges an npm package with the GitHub repo its repository URL names", () => {
    const github = rankGithubRepos(
      [],
      [search("Kilo-Org/kilocode", { searchQuery: "new:coding-agent", stargazersCount: 30 })],
      DATE,
    );
    const rows = urlMerge(
      buildRadarCandidates(
        [],
        npmData([], [pkg("@kilocode/cli", { repository: "git+https://github.com/Kilo-Org/kilocode.git" })]),
        github,
        DATE,
      ),
    );
    expect(rows).toHaveLength(1);
    // The GitHub row is 🆕 and sorts first, so it gives the name.
    expect(rows[0]).toMatchObject({
      keys: ["github:Kilo-Org/kilocode", "npm:@kilocode/cli"],
      name: "Kilo-Org/kilocode",
      sources: ["GitHub", "npm"],
      signals: ["🆕 30", "1,000/week, 1.1x"],
      isNew: true,
    });
  });

  it("parses git@ and https repository URLs alike", () => {
    const rows = urlMerge(
      buildRadarCandidates(
        [app(1, { url: "https://github.com/acme/agent#readme" })],
        npmData([], [pkg("acme-agent", { repository: "git@github.com:Acme/Agent.git" })]),
        [],
        DATE,
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.sources).toEqual(["OpenRouter", "npm"]);
  });

  it("merges an OpenRouter site root with an npm homepage on the same host", () => {
    const rows = urlMerge(
      buildRadarCandidates(
        [app(1, { url: "https://www.kilo.ai/" })],
        npmData([], [pkg("kilo", { homepage: "https://kilo.ai" })]),
        [],
        DATE,
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.links).toContain("host:kilo.ai");
  });

  it("does not host-merge a URL with a path", () => {
    const rows = urlMerge(
      buildRadarCandidates(
        [app(1, { url: "https://openai.com/codex/" })],
        npmData([], [pkg("other-openai-tool", { homepage: "https://openai.com" })]),
        [],
        DATE,
      ),
    );
    expect(rows).toHaveLength(2);
  });

  it("merges transitively, at the earliest member's position, joining sources and signals", () => {
    const github = rankGithubRepos(
      [],
      [search("kilo-org/kilocode", { searchQuery: "new:coding-agent", stargazersCount: 30 })],
      DATE,
    );
    const rows = urlMerge(
      buildRadarCandidates(
        [app(1), app(2, { title: "Kilo Code", url: "https://kilo.ai/", description: "VS Code agent" })],
        npmData(
          [],
          [
            pkg("kilo", {
              homepage: "https://kilo.ai",
              repository: "https://github.com/Kilo-Org/kilocode",
            }),
          ],
        ),
        github,
        DATE,
      ),
    );
    // Candidates: github (🆕), openrouter:1, npm:kilo, openrouter:2 → github absorbs npm, npm absorbs openrouter:2.
    expect(rows.map((r) => r.keys)).toEqual([
      ["github:kilo-org/kilocode", "npm:kilo", "openrouter:2"],
      ["openrouter:1"],
    ]);
    expect(rows[0]).toMatchObject({
      name: "kilo-org/kilocode",
      description: "VS Code agent",
      sources: ["GitHub", "npm", "OpenRouter"],
    });
    expect(rows[0]!.signals).toHaveLength(3);
  });
});

describe("mergeRows", () => {
  const row = (key: string, o: Partial<RadarRow> = {}): RadarRow => ({
    keys: [key],
    name: key,
    url: `https://${key}.example`,
    description: "",
    sources: ["npm"],
    signals: [key],
    isNew: false,
    links: [],
    ...o,
  });

  it("places a merged row at its earliest member and takes its name and url", () => {
    const merged = mergeRows(
      [row("a"), row("b"), row("c", { description: "from c", isNew: true, sources: ["GitHub"] })],
      [["c", "a"]],
    );
    expect(merged.map((r) => r.keys)).toEqual([["a", "c"], ["b"]]);
    expect(merged[0]).toMatchObject({
      name: "a",
      url: "https://a.example",
      description: "from c",
      sources: ["npm", "GitHub"],
      signals: ["a", "c"],
      isNew: true,
    });
  });

  it("follows pairs that name any member key and ignores unknown keys", () => {
    const merged = mergeRows(
      [row("a"), row("b"), row("c"), row("d")],
      [
        ["b", "c"],
        ["d", "c"],
        ["x", "a"],
      ],
    );
    expect(merged.map((r) => r.keys)).toEqual([["a"], ["b", "c", "d"]]);
  });
});

// ---------------------------------------------------------------------------
// selectTrendingReport
// ---------------------------------------------------------------------------

describe("selectTrendingReport", () => {
  /** n distinct npm candidates; extra homepages create merges. */
  const npmCandidates = (n: number, homepages: Record<number, string> = {}) =>
    buildRadarCandidates(
      [],
      npmData(
        [],
        Array.from({ length: n }, (_, i) => pkg(`p${i}`, homepages[i] ? { homepage: homepages[i] } : {})),
      ),
      [],
      DATE,
    );

  it("caps the Radar at 12 rows numbered 1..12", () => {
    const candidates = npmCandidates(20);
    const report = selectTrendingReport([], candidates, allInScope(candidates), "topics");
    expect(report.radar.map((r) => r.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(report.radar.at(-1)!.keys).toEqual(["npm:p11"]);
    expect(report.classifiedBy).toBe("topics");
  });

  it("merges before the 12-row cap, so a merged tool takes one slot", () => {
    const candidates = npmCandidates(13, { 1: "https://x.dev", 12: "https://x.dev/" });
    const report = selectTrendingReport([], candidates, allInScope(candidates), "topics");
    expect(report.radar).toHaveLength(12);
    expect(report.radar[1]!.keys).toEqual(["npm:p1", "npm:p12"]);
  });

  it("only merges within the first 30 in-scope candidates", () => {
    const candidates = npmCandidates(32, { 0: "https://x.dev", 30: "https://x.dev" });
    const report = selectTrendingReport([], candidates, allInScope(candidates), "topics");
    expect(report.radar[0]!.keys).toEqual(["npm:p0"]);
  });

  it("drops unclassified, out-of-scope and non-standalone candidates from the Radar", () => {
    const candidates = npmCandidates(4);
    const classifications = new Map<string, Classification>([
      ["npm:p0", { category: "out_of_scope", standalone: null }],
      ["npm:p1", { category: null, standalone: 0.2 }],
      ["npm:p2", { category: null, standalone: 0.9 }],
    ]);
    const report = selectTrendingReport([], candidates, classifications, "jev");
    expect(report.radar.map((r) => r.keys[0])).toEqual(["npm:p2"]);
  });

  it("applies cross-source links after the URL merge", () => {
    const candidates = npmCandidates(4);
    const report = selectTrendingReport([], candidates, allInScope(candidates), "jev", [
      ["npm:p0", "npm:p3"],
    ]);
    expect(report.radar.map((r) => r.keys)).toEqual([["npm:p0", "npm:p3"], ["npm:p1"], ["npm:p2"]]);
  });

  it("groups category rows in fixed order, caps them at 8 and omits empty categories", () => {
    const github = rankGithubRepos(
      [],
      Array.from({ length: 12 }, (_, i) => search(`c/r${i}`, { stargazersCount: 100 - i })),
      DATE,
    );
    const classifications = new Map<string, Classification>(
      github.map((r, i) => [
        r.key,
        { category: i === 0 ? "multi_agent" : i === 1 ? "out_of_scope" : "coding_agent", standalone: null },
      ]),
    );
    const report = selectTrendingReport(github, [], classifications, "topics");
    expect(report.categories.map((c) => [c.category, c.rows.length])).toEqual([
      ["coding_agent", 8],
      ["multi_agent", 1],
    ]);
    expect(report.categories[0]!.rows.map((r) => r.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(report.categories[1]!.rows[0]!.n).toBe(9);
  });

  /** `count` npm candidates named `${prefix}${i}`; momentum 4.3x (🆕) when `fresh`. */
  const npmRun = (prefix: string, count: number, fresh: boolean) =>
    Array.from({ length: count }, (_, i) =>
      pkg(`${prefix}${i}`, fresh ? { weekly: 1000, monthly: 1000 } : {}),
    );

  it("keeps at most 8 🆕 rows when established tools can fill the rest", () => {
    const candidates = buildRadarCandidates(
      [],
      npmData(npmRun("new", 15, true), npmRun("old", 15, false)),
      [],
      DATE,
    );
    const report = selectTrendingReport([], candidates, allInScope(candidates), "topics");
    expect(report.radar.map((r) => r.keys[0])).toEqual([
      ...Array.from({ length: 8 }, (_, i) => `npm:new${i}`),
      ...Array.from({ length: 4 }, (_, i) => `npm:old${i}`),
    ]);
  });

  it("backfills either side when the other runs short", () => {
    const fewOld = buildRadarCandidates(
      [],
      npmData(npmRun("new", 15, true), npmRun("old", 2, false)),
      [],
      DATE,
    );
    const a = selectTrendingReport([], fewOld, allInScope(fewOld), "topics");
    expect(a.radar.filter((r) => r.isNew)).toHaveLength(10);
    expect(a.radar).toHaveLength(12);

    const fewNew = buildRadarCandidates(
      [],
      npmData(npmRun("new", 2, true), npmRun("old", 15, false)),
      [],
      DATE,
    );
    const b = selectTrendingReport([], fewNew, allInScope(fewNew), "topics");
    expect(b.radar.filter((r) => r.isNew)).toHaveLength(2);
    expect(b.radar).toHaveLength(12);
  });

  it("caps 🆕 rows in the pool at 20, so established tools reach it", () => {
    // 25 🆕 rows, then an established row that would merge with 🆕 row 22 if both were pooled.
    const candidates = buildRadarCandidates(
      [],
      npmData(
        [
          ...npmRun("new", 25, true).map((p, i) => (i === 22 ? { ...p, homepage: "https://x.dev" } : p)),
          ...npmRun("old", 1, false).map((p) => ({ ...p, homepage: "https://x.dev" })),
        ],
        npmRun("top", 10, false),
      ),
      [],
      DATE,
    );
    const report = selectTrendingReport([], candidates, allInScope(candidates), "topics");
    // old0 is pooled (unmerged, established); new22 is not, as the 23rd 🆕 row.
    expect(report.radar.find((r) => r.keys.includes("npm:old0"))?.keys).toEqual(["npm:old0"]);
  });

  it("keeps new repos off the category tables and numbers the categories after the Radar", () => {
    const github = rankGithubRepos(
      [],
      [
        search("g/new", { searchQuery: "new:coding-agent", stargazersCount: 50 }),
        search("g/old", { stargazersCount: 10 }),
      ],
      DATE,
    );
    const candidates = buildRadarCandidates([], npmData([], [pkg("p0")]), github, DATE);
    const coding: Classification = { category: "coding_agent", standalone: null };
    const classifications = new Map<string, Classification>([
      ["npm:p0", IN_SCOPE],
      ["github:g/new", coding],
      ["github:g/old", coding],
    ]);
    const report = selectTrendingReport(github, candidates, classifications, "topics");
    expect(report.radar.map((r) => [r.keys[0], r.n])).toEqual([
      ["github:g/new", 1],
      ["npm:p0", 2],
    ]);
    expect(report.categories[0]!.rows.map((r) => [r.fullName, r.n])).toEqual([["g/old", 3]]);

    const summaries = summaryRows(report);
    expect(summaries.map((s) => s.n)).toEqual([1, 2, 3]);
    expect(summaries[0]!.facts).toBe("Source: GitHub | Signal: 🆕 50");
    expect(summaries[2]).toEqual({ n: 3, name: "g/old", description: "", facts: "Stars: 10" });
  });
});

describe("radarPool", () => {
  it("keeps eligible candidates unmerged, 🆕 first and capped at 20, the pool at 30", () => {
    const fresh = buildRadarCandidates(
      [],
      npmData(Array.from({ length: 25 }, (_, i) => pkg(`n${i}`, { weekly: 4000, monthly: 4000 }))),
      [],
      DATE,
    );
    const established = buildRadarCandidates([], npmData([], [pkg("e0"), pkg("e1")]), [], DATE);
    const candidates = [...fresh, ...established];
    const classifications = allInScope(candidates);
    classifications.set("npm:n0", { category: null, standalone: 0.1 });
    const pool = radarPool(candidates, classifications);
    expect(pool).toHaveLength(26);
    expect(pool.map((r) => r.keys[0]).slice(19, 22)).toEqual(["npm:n20", "npm:e0", "npm:e1"]);
    expect(pool.at(-1)!.keys).toEqual(["npm:n24"]);
  });
});

describe("summaryRows", () => {
  it("lists language and stars for GitHub rows, joined sources and signals for Radar rows", () => {
    const github: GithubRow[] = rankGithubRepos(
      [trending("t/x", { periodStars: 7, totalStars: 70, language: "Rust", description: "Desc" })],
      [search("t/x", { searchQuery: "harness" })],
      DATE,
    );
    const merged = mergeRows(
      buildRadarCandidates([app(1, { title: "Tool" })], npmData([], [pkg("tool")]), [], DATE),
      [["openrouter:1", "npm:tool"]],
    );
    const classifications = new Map<string, Classification>([
      ["openrouter:1", IN_SCOPE],
      ["github:t/x", { category: "harness_framework", standalone: null }],
    ]);
    const report = selectTrendingReport(github, merged, classifications, "topics");
    expect(summaryRows(report)).toEqual([
      {
        n: 1,
        name: "Tool",
        description: "",
        facts: "Source: OpenRouter; npm | Signal: week #10 / month #20; 1,000/week, 1.1x",
      },
      { n: 2, name: "t/x", description: "Desc", facts: "Language: Rust | Stars: 70 (+7)" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Star history
// ---------------------------------------------------------------------------

/** DATE is 2026-10-05: one week back is 2026-09-28, four days back 2026-10-01. */
const hist = (repos: StarHistory["repos"]): StarHistory => ({ repos });

describe("starBaseline", () => {
  const h = hist({
    "a/x": [
      ["2026-09-21", 100],
      ["2026-09-28", 200],
      [DATE, 300],
    ],
  });

  it("takes the newest point before today and ignores today's", () => {
    expect(starBaseline(h, "A/X", DATE)).toEqual({ date: "2026-09-28", stars: 200 });
  });

  it("is null without points before today", () => {
    expect(starBaseline(h, "b/y", DATE)).toBeNull();
    expect(starBaseline(h, "a/x", "2026-09-21")).toBeNull();
  });
});

describe("rankGithubRepos with star history", () => {
  const h = hist({ "a/x": [["2026-09-28", 85_580]], "b/y": [["2026-10-01", 85_580]] });

  it("uses the delta over exactly a week", () => {
    const [row] = rankGithubRepos([], [search("a/x", { stargazersCount: 86_392 })], DATE, h);
    expect(row).toMatchObject({ starsCell: "86,392 (+812)", perWeek: 812 });
  });

  it("scales a delta over another span to a week and names the days", () => {
    const [row] = rankGithubRepos([], [search("b/y", { stargazersCount: 86_392 })], DATE, h);
    expect(row).toMatchObject({ starsCell: "86,392 (+812 in 4 days)", perWeek: (812 * 7) / 4 });
    const oneDay = hist({ "a/x": [["2026-10-04", 86_380]] });
    const [next] = rankGithubRepos([], [search("a/x", { stargazersCount: 86_392 })], DATE, oneDay);
    expect(next).toMatchObject({ starsCell: "86,392 (+12 in 1 day)", perWeek: 84 });
  });

  it("looks the repo up case-insensitively", () => {
    const [row] = rankGithubRepos([], [search("A/X", { stargazersCount: 86_392 })], DATE, h);
    expect(row!.perWeek).toBe(812);
  });

  it("shows a negative delta with its sign", () => {
    const [row] = rankGithubRepos([], [search("a/x", { stargazersCount: 85_568 })], DATE, h);
    expect(row).toMatchObject({ starsCell: "85,568 (-12)", perWeek: -12 });
  });

  it("prefers trending periodStars over the delta", () => {
    const [row] = rankGithubRepos(
      [trending("a/x", { periodStars: 50, totalStars: 86_392 })],
      [search("a/x", { stargazersCount: 86_392 })],
      DATE,
      h,
    );
    expect(row).toMatchObject({ starsCell: "86,392 (+50)", perWeek: 50 });
  });

  it("prefers the delta over new-repo scaling", () => {
    const [row] = rankGithubRepos(
      [],
      [search("n/new", { stargazersCount: 300, createdAt: "2026-09-27T00:00:00Z" })],
      DATE,
      hist({ "n/new": [["2026-10-01", 200]] }),
    );
    expect(row).toMatchObject({ starsCell: "300 (+100 in 4 days)", perWeek: 175, isNew: true });
  });

  it("computes no delta when the star count is unknown", () => {
    const [row] = rankGithubRepos([trending("a/x", { totalStars: 0 })], [], DATE, h);
    expect(row).toMatchObject({ starsCell: "0", perWeek: null });
  });
});

describe("nextStarHistory", () => {
  const row = (fullName: string, totalStars: number) =>
    rankGithubRepos([], [search(fullName, { stargazersCount: totalStars })], DATE)[0]!;

  it("records rows with stars and skips a missed count", () => {
    const next = nextStarHistory(hist({}), [row("A/X", 10), row("b/y", 0)], DATE);
    expect(next).toEqual(hist({ "a/x": [[DATE, 10]] }));
  });

  it("replaces today's point, so a same-day re-run is idempotent", () => {
    const h = hist({ "a/x": [["2026-09-28", 85_580]] });
    const repos = [search("a/x", { stargazersCount: 86_392 })];
    const first = nextStarHistory(h, rankGithubRepos([], repos, DATE, h), DATE);
    const rerunRows = rankGithubRepos([], repos, DATE, first);
    expect(rerunRows[0]!.perWeek).toBe(812);
    expect(nextStarHistory(first, rerunRows, DATE)).toEqual(first);
    expect(first.repos["a/x"]).toEqual([
      ["2026-09-28", 85_580],
      [DATE, 86_392],
    ]);
  });

  it("carries forward unseen repos and prunes points older than 35 days", () => {
    const h = hist({
      "old/gone": [["2026-08-30", 5]],
      "a/x": [
        ["2026-08-30", 1],
        ["2026-08-31", 2],
      ],
      "b/y": [["2026-09-28", 7]],
    });
    expect(nextStarHistory(h, [], DATE)).toEqual(
      hist({ "a/x": [["2026-08-31", 2]], "b/y": [["2026-09-28", 7]] }),
    );
  });
});

describe("loadStarHistory / saveStarHistory", () => {
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "trending-state-"));

  it("reads back what saveStarHistory wrote, one repo per line", () => {
    const file = path.join(tmp(), "sub", "s.json");
    const h = hist({
      "a/x": [
        ["2026-09-28", 1],
        [DATE, 2],
      ],
      "b/y": [[DATE, 3]],
    });
    saveStarHistory(h, file);
    const text = fs.readFileSync(file, "utf-8");
    expect(text.split("\n")).toHaveLength(7);
    expect(text).toContain('"a/x": [["2026-09-28",1],["2026-10-05",2]],');
    expect(loadStarHistory(file)).toEqual(h);
    saveStarHistory(hist({}), file);
    expect(loadStarHistory(file)).toEqual(hist({}));
  });

  it("returns an empty history for a missing, invalid or repos-less file", () => {
    const dir = tmp();
    expect(loadStarHistory(path.join(dir, "none.json"))).toEqual(hist({}));
    const file = path.join(dir, "s.json");
    fs.writeFileSync(file, "{ not json");
    expect(loadStarHistory(file)).toEqual(hist({}));
    fs.writeFileSync(file, "{}");
    expect(loadStarHistory(file)).toEqual(hist({}));
  });
});

describe("composeTrendingReport with star history", () => {
  const notCalled: AskJev = async () => {
    throw new Error("Jev called without a key");
  };

  it("ranks a search repo by its delta and returns the next history", async () => {
    const data = {
      trendingRepos: [],
      searchRepos: [
        search("big/agent", { stargazersCount: 9_000 }),
        search("small/agent", { stargazersCount: 600 }),
      ],
      trendingFetchSuccess: true,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
    };
    const h = hist({ "big/agent": [["2026-09-28", 8_990]], "small/agent": [["2026-09-28", 400]] });
    const report = await composeTrendingReport(data, DATE, "", null, notCalled, h, { items: {} });
    expect(report.categories.flatMap((c) => c.rows.map((r) => [r.fullName, r.starsCell]))).toEqual([
      ["small/agent", "600 (+200)"],
      ["big/agent", "9,000 (+10)"],
    ]);
    expect(report.nextStarHistory?.repos["small/agent"]).toEqual([
      ["2026-09-28", 400],
      [DATE, 600],
    ]);
  });
});
