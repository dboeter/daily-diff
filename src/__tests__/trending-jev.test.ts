import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  applyMatchAnswers,
  buildTrendingRankingFile,
  classificationOf,
  classifyTrendingItems,
  fallbackClassification,
  inScope,
  loadClassifyCache,
  loadMatchState,
  matchApps,
  onRadar,
  pendingMatchQuestions,
  pruneMatchState,
  saveClassifyCache,
  saveMatchState,
  STANDALONE_MIN_NOUL,
  type Classification,
  type ClassifyAnswers,
  type ClassifyCache,
  type ClassifyItem,
  type MatchState,
} from "../trending/jev.ts";
import { judgeItems, type AskJev } from "../core/jev.ts";
import { migrateClassifyEntry, migratePolicyEntry } from "../../scripts/migrate-verdict-fingerprints.ts";
import { urlMerge, type GithubRow, type RadarRow } from "../trending/rank.ts";
import {
  composeTrendingReport,
  EMPTY_OPENROUTER,
  type SearchRepo,
  type TrendingData,
} from "../trending/trending.ts";
import type { OpenRouterApp } from "../sources/openrouter.ts";
import type { NpmPackage } from "../trending/npm.ts";

function githubRow(topic?: string): GithubRow {
  return {
    key: "github:o/r",
    fullName: "o/r",
    url: "https://github.com/o/r",
    description: "",
    language: "",
    totalStars: 0,
    gain: null,
    gainFrom: null,
    relative: null,
    starsCell: "0",
    isNew: false,
    ...(topic !== undefined ? { topic } : {}),
  };
}

const classify = (topic?: string) =>
  fallbackClassification({ kind: "github", key: "github:o/r", row: githubRow(topic) });

describe("fallbackClassification", () => {
  it.each([
    ["coding-agent", "coding_agent"],
    ["agentic-coding", "coding_agent"],
    ["ai-coding", "coding_agent"],
    ["agent-harness", "harness_framework"],
    ["harness", "harness_framework"],
    ["agent-orchestration", "multi_agent"],
  ])("maps topic %s to %s with standalone unknown", (topic, category) => {
    expect(classify(topic)).toEqual({ category, standalone: null });
  });

  it("puts an unknown label and trending-page-only repos out of scope", () => {
    expect(classify("llm")).toEqual({ category: "out_of_scope", standalone: null });
    expect(classify()).toEqual({ category: "out_of_scope", standalone: null });
  });

  it("keeps topic-search repos on the Radar", () => {
    expect(onRadar(classify("coding-agent"))).toBe(true);
  });

  it("keeps OpenRouter apps and npm packages in scope with unknown category", () => {
    const app = { appId: 1 } as OpenRouterApp;
    const pkg = { name: "x" } as NpmPackage;
    expect(fallbackClassification({ kind: "openrouter", key: "openrouter:1", app })).toEqual({
      category: null,
      standalone: null,
    });
    expect(fallbackClassification({ kind: "npm", key: "npm:x", pkg })).toEqual({
      category: null,
      standalone: null,
    });
  });
});

describe("inScope / onRadar", () => {
  it("treats only out_of_scope as out of scope", () => {
    expect(inScope({ category: "out_of_scope", standalone: 1 })).toBe(false);
    expect(inScope({ category: null, standalone: null })).toBe(true);
    expect(inScope({ category: "agent_tooling", standalone: 0 })).toBe(true);
  });

  it("requires standalone >= 0.5 or unknown for the Radar", () => {
    expect(STANDALONE_MIN_NOUL).toBe(0.5);
    expect(onRadar({ category: null, standalone: 0.5 })).toBe(true);
    expect(onRadar({ category: null, standalone: 0.49 })).toBe(false);
    expect(onRadar({ category: null, standalone: null })).toBe(true);
    expect(onRadar({ category: "out_of_scope", standalone: 1 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Jev classification
// ---------------------------------------------------------------------------

const MODEL = "jev-1.13.0";

function choice(pick: string, p = 0.9) {
  return { type: "choice", choice: pick, confidence: p, probabilities: { [pick]: p, none: 1 - p } };
}

/** A stub `ask` answering the classification questions. */
const classifyAnswer =
  (category: string, standalone: number): AskJev =>
  async () => ({
    model: MODEL,
    answers: { category: choice(category), standalone_tool: { noul: standalone } },
  });

const githubItem = (topic?: string, description = ""): ClassifyItem => ({
  kind: "github",
  key: "github:o/r",
  row: { ...githubRow(topic), description },
});

describe("classificationOf", () => {
  it("maps a Choice and a Noul answer to a Classification with probabilities", () => {
    expect(
      classificationOf({
        category: { choice: "coding_agent", probabilities: { coding_agent: 0.9 } },
        standalone_tool: { noul: 0.81 },
      }),
    ).toEqual({ category: "coding_agent", standalone: 0.81, probabilities: { coding_agent: 0.9 } });
  });

  it("accepts a missing noul (a hand-added entry) and no probabilities (a migrated one)", () => {
    expect(
      classificationOf({ category: { choice: "out_of_scope" }, standalone_tool: { noul: null } }),
    ).toEqual({ category: "out_of_scope", standalone: null });
  });

  it("throws on an unknown choice and on a NaN noul", () => {
    const bad = (choice: string, noul: number) => () =>
      classificationOf({ category: { choice }, standalone_tool: { noul } });
    expect(bad("toString", 1)).toThrow();
    expect(bad("coding_agent", NaN)).toThrow();
  });
});

describe("classifyTrendingItems", () => {
  const items: ClassifyItem[] = ["a", "b", "c"].map((n) => ({
    kind: "npm",
    key: `npm:${n}`,
    pkg: { name: n, description: "" } as NpmPackage,
  }));
  const failing =
    (names: string[]): AskJev =>
    async (state) => {
      if (names.includes((state as { name: string }).name)) throw new Error("HTTP 529");
      return classifyAnswer("coding_agent", 0.9)(state, {}, "k");
    };
  const run = (list: ClassifyItem[], ask: AskJev, cache: ClassifyCache | null = { items: {} }) =>
    classifyTrendingItems(list, { apiKey: "k", cache, dateStr: DATE, ask });

  it("sends the topic and omits an empty description", async () => {
    const ask = vi.fn(classifyAnswer("coding_agent", 1));
    const npm: ClassifyItem = {
      kind: "npm",
      key: "npm:x",
      pkg: { name: "x", description: "d" } as NpmPackage,
    };
    await run([githubItem("coding-agent"), npm], ask);
    expect(ask.mock.calls.map((c) => c[0])).toEqual([
      { name: "o/r", source: "GitHub repository", topic: "coding-agent" },
      { name: "x", description: "d", source: "npm package" },
    ]);
  });

  it("falls back to topic labels when more than half the calls fail", async () => {
    const result = await run(items, failing(["a", "b"]));
    expect(result.classifiedBy).toBe("topics");
    expect(result.classifications.get("npm:c")).toEqual({ category: null, standalone: null });
  });

  it("gives a single failed item the fallback classification", async () => {
    const result = await run(items, failing(["b"]));
    expect(result.classifiedBy).toBe("jev");
    expect(result.classifications.get("npm:b")).toEqual({ category: null, standalone: null });
    expect(result.classifications.get("npm:a")).toEqual({
      category: "coding_agent",
      standalone: 0.9,
      probabilities: { coding_agent: 0.9, none: 1 - 0.9 },
      model: MODEL,
    });
  });

  it("skips Jev for apps OpenRouter tags as agents, not for broad tags or untagged apps", async () => {
    const app = (appId: number, categories: string[]): ClassifyItem => ({
      kind: "openrouter",
      key: `openrouter:${appId}`,
      app: { appId, title: `App ${appId}`, description: "", categories } as unknown as OpenRouterApp,
    });
    const ask = vi.fn(classifyAnswer("out_of_scope", 0.1));
    const { classifications } = await run(
      [app(1, ["cli-agent"]), app(2, ["programming-app"]), app(3, [])],
      ask,
    );
    expect(ask.mock.calls.map((c) => (c[0] as { name: string }).name)).toEqual(["App 2", "App 3"]);
    expect(classifications.get("openrouter:1")).toEqual({ category: null, standalone: null });
    expect(classifications.get("openrouter:2")?.category).toBe("out_of_scope");
    expect(classifications.get("openrouter:3")?.category).toBe("out_of_scope");
  });
});

// ---------------------------------------------------------------------------
// Match cache
// ---------------------------------------------------------------------------

const DATE = "2026-10-05";
const DAY_MS = 24 * 60 * 60 * 1000;
const daysBefore = (n: number) => new Date(Date.parse(DATE) - n * DAY_MS).toISOString().slice(0, 10);

function radarRow(key: string, o: Partial<RadarRow> = {}): RadarRow {
  return {
    keys: [key],
    name: key.slice(key.indexOf(":") + 1),
    url: "",
    description: "",
    sources: ["npm"],
    signals: [""],
    isNew: false,
    links: [],
    ...o,
  };
}

const entry = (o: Partial<MatchState["apps"][string]> = {}) => ({
  title: "Kilo Code",
  rejected: [],
  lastSeen: DATE,
  ...o,
});

const notCalled: AskJev = vi.fn(async () => {
  throw new Error("ask must not be called");
});

/** A stub `ask` answering match questions: picks per question id, at probability `p`. */
const matchAnswer =
  (picks: Record<string, string>, p = 0.9): AskJev =>
  async (_state, questions) => ({
    model: MODEL,
    answers: Object.fromEntries(Object.keys(questions).map((q) => [q, choice(picks[q] ?? "none", p)])),
  });

const run = (pool: RadarRow[], state: MatchState, ask: AskJev, apiKey = "key") =>
  matchApps(urlMerge(pool), pool, state, apiKey, DATE, ask);

describe("matchApps", () => {
  const pool = [
    radarRow("openrouter:1", { name: "Kilo Code" }),
    radarRow("npm:a"),
    radarRow("github:Kilo-Org/kilocode"),
  ];

  it("reuses a saved match without a call", async () => {
    const state = { apps: { "1": entry({ npm: "a", github: "Kilo-Org/kilocode" }) } };
    const result = await run(pool, state, notCalled);
    expect(notCalled).not.toHaveBeenCalled();
    expect(result.links).toEqual([
      ["openrouter:1", "npm:a"],
      ["openrouter:1", "github:Kilo-Org/kilocode"],
    ]);
    expect(result.trace.map((t) => t.result)).toEqual(["cached", "cached"]);
    expect(result.called).toBe(false);
  });

  it("compares GitHub names case-insensitively and links the pool's casing", async () => {
    const state = { apps: { "1": entry({ github: "kilo-org/KILOCODE", rejected: ["npm:a"] }) } };
    const result = await run(pool, state, notCalled);
    expect(result.links).toEqual([["openrouter:1", "github:Kilo-Org/kilocode"]]);
  });

  it("saves a confident pick and traces it as matched", async () => {
    const result = await run(pool, { apps: {} }, matchAnswer({ npm_match: "npm:a" }));
    expect(result.state.apps["1"]).toMatchObject({ npm: "a", decided: DATE, model: MODEL });
    expect(result.state.apps["1"]!.rejected).toEqual(["github:Kilo-Org/kilocode"]);
    expect(result.links).toEqual([["openrouter:1", "npm:a"]]);
    expect(result.trace.map((t) => [t.source, t.result])).toEqual([
      ["npm", "matched"],
      ["github", "rejected"],
    ]);
  });

  it("gives a tool picked by two apps in the same run to the first app only", async () => {
    const twoApps = [radarRow("openrouter:1"), radarRow("openrouter:2"), radarRow("npm:a")];
    const result = await run(twoApps, { apps: {} }, matchAnswer({ npm_match: "npm:a" }));
    expect(result.state.apps["1"]!.npm).toBe("a");
    expect(result.state.apps["2"]!.npm).toBeUndefined();
    expect(result.state.apps["2"]!.rejected).toEqual(["npm:a"]);
  });

  it("records nothing for a failed call", async () => {
    const failing: AskJev = async () => {
      throw new Error("HTTP 529");
    };
    const result = await run(pool, { apps: {} }, failing);
    expect(result.state).toEqual({ apps: {} });
    expect(result.links).toEqual([]);
    expect(result.called).toBe(true);
  });

  it("records nothing for an answer outside the offered options", async () => {
    const result = await run(pool, { apps: {} }, matchAnswer({ npm_match: "npm:zzz" }));
    expect(result.state).toEqual({ apps: {} });
  });

  it("still links saved matches without a key", async () => {
    const state = { apps: { "1": entry({ npm: "a" }) } };
    const result = await run(pool, state, notCalled, "");
    expect(result.links).toEqual([["openrouter:1", "npm:a"]]);
    expect(notCalled).not.toHaveBeenCalled();
  });
});

describe("pendingMatchQuestions", () => {
  const members = (pool: RadarRow[]) => new Map(pool.map((r) => [r.keys[0]!, r]));

  it("asks only about new candidates", () => {
    const pool = [
      radarRow("openrouter:1"),
      radarRow("openrouter:2"),
      radarRow("npm:a", { description: "A", url: "https://a.dev" }),
      radarRow("npm:b"),
      radarRow("npm:c"),
      radarRow("github:x/y"),
    ];
    const state = {
      apps: {
        // Rejected b; a GitHub match outside this pool still settles the source.
        "1": entry({ rejected: ["npm:b"], github: "gone/repo" }),
        // Another app's match is never offered.
        "2": entry({ npm: "c" }),
      },
    };
    expect(pendingMatchQuestions("openrouter:1", urlMerge(pool), state, members(pool))).toEqual({
      npm: [{ key: "npm:a", name: "a", description: "A", url: "https://a.dev" }],
      github: [],
    });
    expect(pendingMatchQuestions("openrouter:2", urlMerge(pool), state, members(pool))).toEqual({
      npm: [],
      github: [{ key: "github:x/y", name: "x/y", description: "", url: "" }],
    });
  });

  it("skips a source the URL merge already joined to the app, and rejected keys case-insensitively", () => {
    const pool = [
      radarRow("openrouter:1", { links: ["repo:x/y"] }),
      radarRow("github:x/y", { links: ["repo:x/y"] }),
      radarRow("github:Other/Repo"),
      radarRow("github:z/z"),
      radarRow("npm:a"),
    ];
    const state = { apps: { "1": entry() } };
    expect(pendingMatchQuestions("openrouter:1", urlMerge(pool), state, members(pool)).github).toEqual([]);
    const other = { apps: { "3": entry({ rejected: ["github:other/repo"] }) } };
    expect(pendingMatchQuestions("openrouter:3", urlMerge(pool), other, members(pool)).github).toEqual([
      { key: "github:z/z", name: "z/z", description: "", url: "" },
    ]);
  });
});

describe("applyMatchAnswers", () => {
  const asked = { npm: ["npm:a", "npm:b"] };
  const answers = (p: number) => ({ npm_match: choice("npm:a", p) });

  it("rejects every offered candidate below 0.8, the uncertain pick included", () => {
    const next = applyMatchAnswers(
      { apps: {} },
      "openrouter:1",
      "Kilo Code",
      asked,
      answers(0.79),
      MODEL,
      DATE,
    );
    expect(next.apps["1"]).toEqual({ title: "Kilo Code", rejected: ["npm:a", "npm:b"], lastSeen: DATE });
  });

  it("saves a pick at 0.8 as a bare name", () => {
    const next = applyMatchAnswers(
      { apps: {} },
      "openrouter:1",
      "Kilo Code",
      asked,
      answers(0.8),
      MODEL,
      DATE,
    );
    expect(next.apps["1"]).toMatchObject({ npm: "a", decided: DATE, model: MODEL, rejected: [] });
  });

  it("never overwrites a hand-set match", () => {
    const state = { apps: { "1": entry({ npm: "hand" }) } };
    const next = applyMatchAnswers(state, "openrouter:1", "Kilo Code", asked, answers(0.99), MODEL, DATE);
    expect(next.apps["1"]!.npm).toBe("hand");
    expect(state.apps["1"]!.rejected).toEqual([]);
  });
});

describe("pruneMatchState", () => {
  it("marks pool apps seen, drops rejected keys outside the pool and apps unseen for 180 days", () => {
    const state = {
      apps: {
        "1": entry({ lastSeen: daysBefore(400), rejected: ["npm:a", "github:X/Y", "npm:gone"], npm: "gone" }),
        "2": entry({ lastSeen: daysBefore(181) }),
        "3": entry({ lastSeen: daysBefore(180) }),
      },
    };
    const next = pruneMatchState(state, new Set(["openrouter:1", "npm:a", "github:x/y"]), DATE);
    expect(next.apps["1"]).toEqual(entry({ lastSeen: DATE, rejected: ["npm:a", "github:X/Y"], npm: "gone" }));
    expect(next.apps["2"]).toBeUndefined();
    expect(next.apps["3"]).toBeDefined();
  });
});

describe("loadMatchState", () => {
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "trending-matches-"));

  it("returns an empty state for a missing file", () => {
    expect(loadMatchState(path.join(tmp(), "none.json"))).toEqual({ apps: {} });
  });

  it("returns null for invalid JSON or a file without an apps object", () => {
    const file = path.join(tmp(), "m.json");
    fs.writeFileSync(file, "{ not json");
    expect(loadMatchState(file)).toBeNull();
    fs.writeFileSync(file, "{}");
    expect(loadMatchState(file)).toBeNull();
  });

  it("reads back what saveMatchState wrote", () => {
    const file = path.join(tmp(), "sub", "m.json");
    const state = { apps: { "1": entry({ npm: "a" }) } };
    saveMatchState(state, file);
    expect(fs.readFileSync(file, "utf-8").endsWith("}\n")).toBe(true);
    expect(loadMatchState(file)).toEqual(state);
  });
});

// ---------------------------------------------------------------------------
// Classification cache
// ---------------------------------------------------------------------------

describe("classification cache", () => {
  // The generic cache rules (reuse, prune, hand-edit spread, invalid entry asked again) are judgeItems' (jev.test.ts).
  const npmItem = (name: string, description = ""): ClassifyItem => ({
    kind: "npm",
    key: `npm:${name}`,
    pkg: { name, description } as NpmPackage,
  });
  const run = (
    list: ClassifyItem[],
    cache: ClassifyCache,
    ask: AskJev = classifyAnswer("coding_agent", 0.9),
  ) => classifyTrendingItems(list, { apiKey: "k", cache, dateStr: DATE, ask });

  it("saves the answers with a description hash, and asks again when the description changes", async () => {
    const first = await run([npmItem("a", "An agent")], { items: {} });
    expect(first.nextCache!.items["npm:a"]).toEqual({
      title: "a",
      fingerprint: expect.stringMatching(/^[0-9a-f]{8}$/),
      answers: {
        category: {
          type: "choice",
          choice: "coding_agent",
          confidence: 0.9,
          probabilities: { coding_agent: 0.9, none: 0.1 },
        },
        standalone_tool: { noul: 0.9 },
      },
      decided: DATE,
      model: MODEL,
      lastSeen: DATE,
    });
    const ask = vi.fn(classifyAnswer("out_of_scope", 0.1));
    const same = await run([npmItem("a", "An agent")], first.nextCache!, ask);
    expect(ask).not.toHaveBeenCalled();
    expect(same.classifications.get("npm:a")).toMatchObject({ category: "coding_agent", decided: DATE });
    const changed = await run([npmItem("a", "A different project now")], first.nextCache!, ask);
    expect(ask).toHaveBeenCalledOnce();
    expect(changed.classifications.get("npm:a")?.category).toBe("out_of_scope");
  });

  it("ignores entities, case and whitespace in the description, as the trending scrape and search differ", async () => {
    const first = await run([npmItem("a", "Claude Code & Codex: a harness")], { items: {} });
    const ask = vi.fn(classifyAnswer("out_of_scope", 0.1));
    await run([npmItem("a", "Claude Code &amp; Codex:\n  a harness")], first.nextCache!, ask);
    expect(ask).not.toHaveBeenCalled();
  });

  it("never asks a pinned entry again, and compares GitHub keys case-insensitively", async () => {
    const cache: ClassifyCache = {
      items: {
        "github:o/r": {
          title: "o/r",
          answers: { category: { choice: "out_of_scope" }, standalone_tool: { noul: null } },
          pinned: true,
          lastSeen: daysBefore(30),
        },
      },
    };
    const item: ClassifyItem = {
      kind: "github",
      key: "github:O/R",
      row: { ...githubRow("ai-agent"), key: "github:O/R", fullName: "O/R", description: "anything" },
    };
    const ask = vi.fn(classifyAnswer("coding_agent", 0.9));
    const result = await run([item], cache, ask);
    expect(ask).not.toHaveBeenCalled();
    expect(result.classifications.get("github:O/R")).toEqual({
      category: "out_of_scope",
      standalone: null,
      decided: "by hand",
    });
  });

  it("lets OpenRouter's agent tags beat a verdict saved before the app was tagged", async () => {
    const app = (categories: string[]): ClassifyItem => ({
      kind: "openrouter",
      key: "openrouter:7",
      app: { appId: 7, title: "Crush", description: "", categories } as unknown as OpenRouterApp,
    });
    const first = await run([app([])], { items: {} }, classifyAnswer("out_of_scope", 0.2));
    expect(first.classifications.get("openrouter:7")?.category).toBe("out_of_scope");
    const tagged = await run([app(["cli-agent"])], first.nextCache!);
    expect(tagged.classifications.get("openrouter:7")).toEqual({ category: null, standalone: null });
  });

  it("reads back what it saved, one item per line; a missing file is empty, an invalid one null", async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "trending-classify-")), "c.json");
    expect(loadClassifyCache(file)).toEqual({ items: {} });
    const { nextCache } = await run([npmItem("a"), npmItem("b")], { items: {} });
    saveClassifyCache(nextCache!, file);
    const lines = fs.readFileSync(file, "utf-8").split("\n");
    expect(lines.filter((l) => l.startsWith('    "npm:'))).toHaveLength(2);
    expect(lines).toHaveLength(7); // "{", "items" line, 2 items, "}", "}", "" after the final newline
    expect(loadClassifyCache(file)).toEqual(nextCache);
    fs.writeFileSync(file, "{ not json");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(loadClassifyCache(file)).toBeNull();
    fs.writeFileSync(file, '{"items": []}');
    expect(loadClassifyCache(file)).toBeNull();
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
    stargazersCount: 100,
    pushedAt: "2026-10-04T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    url: `https://github.com/${fullName}`,
    topic: "coding-agent",
  });
  const npmPkg = (name: string) =>
    ({ name, description: "", weekly: 1000, monthly: 4000, url: "", lastPublish: DATE }) as NpmPackage;
  const data: TrendingData = {
    trendingRepos: [],
    searchRepos: [search("a/agent"), search("b/weights")],
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

  const noCache = (): ClassifyCache => ({ items: {} });
  /** Stands in for the history API, which would be asked about a/agent. */
  const zeroGain = async () => 0;

  it("lets Jev decide scope and Radar, and merges a saved match into one Radar row", async () => {
    const report = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: saved(),
      ask,
      history: { repos: {} },
      classifyCache: noCache(),
      fetchGain: zeroGain,
    });
    expect(report.classifiedBy).toBe("jev");
    expect(report.radar.map((r) => r.keys)).toEqual([["openrouter:1", "npm:@kilocode/cli"]]);
    expect(report.categories.map((c) => [c.category, c.rows.map((r) => r.fullName)])).toEqual([
      ["coding_agent", ["a/agent"]],
    ]);
    expect(report.nextMatches?.apps["1"]).toMatchObject({ npm: "@kilocode/cli", lastSeen: DATE });
    expect(JSON.parse(report.rankingFile!).matches).toEqual([
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
      classifyCache: noCache(),
      fetchGain: zeroGain,
    });
    expect(report.radar.map((r) => r.keys)).toEqual([["openrouter:1"], ["npm:@kilocode/cli"]]);
    expect(report.nextMatches).toBeUndefined();
  });

  it("falls back to topic labels without a key and writes no ranking file", async () => {
    const report = await composeTrendingReport(data, DATE, {
      apiKey: "",
      matchState: saved(),
      ask: notCalled,
      history: { repos: {} },
      classifyCache: noCache(),
      fetchGain: zeroGain,
    });
    expect(report.classifiedBy).toBe("topics");
    expect(report.rankingFile).toBeUndefined();
    expect(report.radar[0]!.keys).toEqual(["openrouter:1", "npm:@kilocode/cli"]);
    expect(report.nextClassifications).toEqual(noCache());
  });

  it("asks Jev only about items missing from the classification cache, and uses saved verdicts without a key", async () => {
    const first = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: null,
      ask,
      history: { repos: {} },
      classifyCache: noCache(),
      fetchGain: zeroGain,
    });
    expect(Object.keys(first.nextClassifications!.items)).toHaveLength(5);

    const counted = vi.fn(ask);
    const second = await composeTrendingReport(data, DATE, {
      apiKey: "key",
      matchState: null,
      ask: counted,
      history: { repos: {} },
      classifyCache: first.nextClassifications!,
      fetchGain: zeroGain,
    });
    expect(counted).not.toHaveBeenCalled();
    expect(second.classifiedBy).toBe("jev");
    expect([second.radar, second.categories]).toEqual([first.radar, first.categories]);
    expect(second.nextClassifications).toEqual(first.nextClassifications);
    expect(JSON.parse(second.rankingFile!).items[0]).toMatchObject({ key: "github:a/agent", decided: DATE });

    // The topic fallback would put b/weights (topic coding-agent) in coding_agent; the saved verdict keeps it out.
    const keyless = await composeTrendingReport(data, DATE, {
      apiKey: "",
      matchState: null,
      ask: notCalled,
      history: { repos: {} },
      classifyCache: first.nextClassifications!,
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
      classifyCache: null,
      fetchGain: zeroGain,
    });
    expect(counted).toHaveBeenCalledTimes(5);
    expect(report.nextClassifications).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Trace
// ---------------------------------------------------------------------------

describe("buildTrendingRankingFile", () => {
  it("writes every item and match on its own line, rounded to 3 decimals", () => {
    const row = { ...githubRow("coding-agent"), gain: 812, gainFrom: "api" as const, relative: 0.0712345 };
    const items: ClassifyItem[] = [
      { kind: "github", key: row.key, row },
      { kind: "npm", key: "npm:x", pkg: { name: "x" } as NpmPackage },
    ];
    const classifications = new Map<string, Classification>([
      [
        "github:o/r",
        {
          category: "coding_agent",
          standalone: 0.81234,
          probabilities: { coding_agent: 0.98765 },
          model: MODEL,
        },
      ],
      ["npm:x", { category: null, standalone: null }],
    ]);
    const file = buildTrendingRankingFile(
      items,
      classifications,
      "jev",
      [
        {
          app: "openrouter:1",
          title: "K",
          source: "npm",
          offered: ["npm:x"],
          choice: "none",
          probabilities: { none: 0.33333 },
          result: "rejected",
        },
      ],
      ["jev-1.14.0"],
    );
    const lines = file.split("\n");
    expect(lines.filter((l) => l.startsWith('{"key"'))).toHaveLength(2);
    expect(lines.filter((l) => l.startsWith('{"app"'))).toHaveLength(1);
    const parsed = JSON.parse(file);
    expect(parsed.models).toEqual([MODEL, "jev-1.14.0"]);
    expect(parsed.classifiedBy).toBe("jev");
    expect(parsed.items).toEqual([
      {
        key: "github:o/r",
        name: "o/r",
        category: "coding_agent",
        probabilities: { coding_agent: 0.988 },
        standalone: 0.812,
        gain: 812,
        gainFrom: "api",
        relative: 0.071,
      },
      {
        key: "npm:x",
        name: "x",
        category: null,
        standalone: null,
        gain: null,
        gainFrom: null,
        relative: null,
      },
    ]);
    expect(parsed.matches[0].probabilities).toEqual({ none: 0.333 });
  });
});

// ---------------------------------------------------------------------------
// Migration of the pre-judgeItems cache (scripts/migrate-verdict-fingerprints.ts)
// ---------------------------------------------------------------------------

describe("classification cache migration", () => {
  type OldEntry = { name: string; category: string; standalone: number | null; desc?: string };
  const old = JSON.parse(
    fs.readFileSync(new URL("./fixtures/trending-classifications-v1.json", import.meta.url), "utf-8"),
  ) as { items: Record<string, OldEntry> };

  it("gives every migrated entry its old category and standalone, a hand fix pinned", async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "classify-migrate-")), "c.json");
    const migrated = Object.fromEntries(
      Object.entries(old.items).map(([k, e]) => [k, migrateClassifyEntry(e as never)]),
    );
    saveClassifyCache({ items: migrated }, file);
    // The entry's own hash, except for the hand fix, whose description has changed since.
    const items = Object.entries(old.items).map(([id, e]) => ({
      id,
      title: e.name,
      hash: e.desc ?? "changed",
    }));
    const j = await judgeItems(items, {
      tag: "test",
      request: () => ({ state: {}, questions: {} }),
      decide: (a: ClassifyAnswers) => classificationOf(a),
      fingerprint: (i) => i.hash,
      cache: loadClassifyCache(file),
      dateStr: DATE,
      unseenDays: 180,
    });
    expect(j.rankedBy).toBe("jev");
    expect(j.verdicts.size).toBe(11);
    for (const [id, e] of Object.entries(old.items)) {
      expect(j.verdicts.get(id)).toMatchObject({ category: e.category, standalone: e.standalone });
    }
    expect(migrated["npm:hand-fixed"]).toMatchObject({ pinned: true });
    expect(migrated["npm:hand-fixed"]).not.toHaveProperty("fingerprint");
    // Idempotent: a migrated entry is left as it is.
    expect(migrateClassifyEntry(migrated["github:cursor/plugins"] as never)).toEqual(
      migrated["github:cursor/plugins"],
    );
  });

  it("renames a policy verdict's stage to fingerprint, once", () => {
    const e = { title: "t", stage: "Adopted", answers: {}, lastSeen: DATE };
    const m = migratePolicyEntry(e);
    expect(m).toEqual({ title: "t", answers: {}, lastSeen: DATE, fingerprint: "Adopted" });
    expect(migratePolicyEntry(m)).toEqual(m);
  });
});
