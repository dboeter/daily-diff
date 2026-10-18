import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  applyMatchAnswers,
  buildTrendingRankingFile,
  cachedClassifications,
  classifyItem,
  classifyItems,
  fallbackClassification,
  inScope,
  loadClassifyCache,
  loadMatchState,
  matchApps,
  nextClassifyCache,
  onRadar,
  pendingMatchQuestions,
  pruneMatchState,
  saveClassifyCache,
  saveMatchState,
  STANDALONE_MIN_NOUL,
  type Classification,
  type ClassifyCache,
  type ClassifyItem,
  type MatchState,
} from "../trending-jev.ts";
import type { AskJev } from "../jev.ts";
import { urlMerge, type GithubRow, type RadarRow } from "../trending-rank.ts";
import { composeTrendingReport, EMPTY_OPENROUTER, type SearchRepo, type TrendingData } from "../trending.ts";
import type { OpenRouterApp } from "../openrouter.ts";
import type { NpmPackage } from "../npm.ts";

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

describe("classifyItem", () => {
  it("maps a Choice and a Noul answer to a Classification with probabilities and model", async () => {
    expect(await classifyItem(githubItem("ai-agent"), "key", classifyAnswer("coding_agent", 0.81))).toEqual({
      category: "coding_agent",
      standalone: 0.81,
      probabilities: { coding_agent: 0.9, none: 1 - 0.9 },
      model: MODEL,
    });
  });

  it("sends the topic and omits an empty description", async () => {
    const ask = vi.fn(classifyAnswer("coding_agent", 1));
    await classifyItem(githubItem("coding-agent"), "key", ask);
    expect(ask.mock.calls[0]![0]).toEqual({
      name: "o/r",
      source: "GitHub repository",
      topic: "coding-agent",
    });
    await classifyItem(
      { kind: "npm", key: "npm:x", pkg: { name: "x", description: "d" } as NpmPackage },
      "key",
      ask,
    );
    expect(ask.mock.calls[1]![0]).toEqual({ name: "x", description: "d", source: "npm package" });
  });

  it("throws on an unknown choice and on a NaN noul", async () => {
    await expect(classifyItem(githubItem(), "key", classifyAnswer("toString", 1))).rejects.toThrow();
    await expect(classifyItem(githubItem(), "key", classifyAnswer("coding_agent", NaN))).rejects.toThrow();
  });
});

describe("classifyItems", () => {
  const items: ClassifyItem[] = ["a", "b", "c"].map((n) => ({
    kind: "npm",
    key: `npm:${n}`,
    pkg: { name: n, description: "" } as NpmPackage,
  }));
  const failing =
    (names: string[]): AskJev =>
    async (state) => {
      if (names.includes((state as { name: string }).name)) throw new Error("HTTP 529");
      return classifyAnswer("coding_agent", 0.9)(state, {}, "key");
    };

  it("returns null when more than half the calls fail", async () => {
    expect(await classifyItems(items, "key", failing(["a", "b"]))).toBeNull();
  });

  it("gives a single failed item the fallback classification", async () => {
    const result = await classifyItems(items, "key", failing(["b"]));
    expect(result?.get("npm:b")).toEqual({ category: null, standalone: null });
    expect(result?.get("npm:a")?.category).toBe("coding_agent");
  });

  it("skips Jev for apps OpenRouter tags as agents, not for broad tags or untagged apps", async () => {
    const app = (appId: number, categories: string[]): ClassifyItem => ({
      kind: "openrouter",
      key: `openrouter:${appId}`,
      app: { appId, title: `App ${appId}`, description: "", categories } as unknown as OpenRouterApp,
    });
    const ask = vi.fn(classifyAnswer("out_of_scope", 0.1));
    const result = await classifyItems(
      [app(1, ["cli-agent"]), app(2, ["programming-app"]), app(3, [])],
      "key",
      ask,
    );
    expect(ask.mock.calls.map((c) => (c[0] as { name: string }).name)).toEqual(["App 2", "App 3"]);
    expect(result?.get("openrouter:1")).toEqual({ category: null, standalone: null });
    expect(result?.get("openrouter:2")?.category).toBe("out_of_scope");
    expect(result?.get("openrouter:3")?.category).toBe("out_of_scope");
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
  const npmItem = (name: string, description = ""): ClassifyItem => ({
    kind: "npm",
    key: `npm:${name}`,
    pkg: { name, description } as NpmPackage,
  });
  const jev = (category: Classification["category"], standalone: number): Classification => ({
    category,
    standalone,
    probabilities: { [String(category)]: 0.9 },
    model: MODEL,
  });
  const saveAnswers = (items: ClassifyItem[], answers: Classification[]) =>
    nextClassifyCache({ items: {} }, items, new Map(items.map((item, i) => [item.key, answers[i]!])), DATE);
  const handFix = {
    name: "o/r",
    category: "out_of_scope" as const,
    standalone: null,
    lastSeen: daysBefore(30),
  };

  it("saves a Jev answer and reuses it while the description is unchanged", () => {
    const item = npmItem("a", "An agent");
    const cache = saveAnswers([item], [jev("coding_agent", 0.81234)]);
    expect(cache.items["npm:a"]).toEqual({
      name: "a",
      category: "coding_agent",
      standalone: 0.812,
      desc: expect.stringMatching(/^[0-9a-f]{8}$/),
      decided: DATE,
      model: MODEL,
      lastSeen: DATE,
    });
    const hits = cachedClassifications(cache, [item]);
    expect(hits.get("npm:a")).toEqual({
      category: "coding_agent",
      standalone: 0.812,
      model: MODEL,
      decided: DATE,
    });
    // A same-day re-run rewrites the same file.
    expect(nextClassifyCache(cache, [item], hits, DATE)).toEqual(cache);
    expect(cachedClassifications(cache, [npmItem("a", "A different project now")]).size).toBe(0);
  });

  it("ignores entities, case and whitespace in the description, as the trending scrape and search differ", () => {
    const cache = saveAnswers(
      [npmItem("a", "Claude Code & Codex: a harness")],
      [jev("harness_framework", 0.9)],
    );
    expect(cachedClassifications(cache, [npmItem("a", "Claude Code &amp; Codex:\n  a harness")]).size).toBe(
      1,
    );
  });

  it("lets OpenRouter's agent tags beat a verdict saved before the app was tagged", () => {
    const app = (categories: string[]): ClassifyItem => ({
      kind: "openrouter",
      key: "openrouter:7",
      app: { appId: 7, title: "Crush", description: "", categories } as unknown as OpenRouterApp,
    });
    const cache = saveAnswers([app([])], [jev("out_of_scope", 0.2)]);
    expect(cachedClassifications(cache, [app([])]).size).toBe(1);
    expect(cachedClassifications(cache, [app(["cli-agent"])]).size).toBe(0);
  });

  it("never saves a verdict without a model: tagged apps, failed calls, the topic fallback", () => {
    const cache = saveAnswers(
      [npmItem("a"), githubItem("ai-agent")],
      [
        { category: null, standalone: null },
        { category: "other_agent", standalone: null },
      ],
    );
    expect(cache.items).toEqual({});
  });

  it("keeps a hand fix without desc, compares GitHub keys case-insensitively, and asks again on a bad category", () => {
    const cache: ClassifyCache = {
      items: {
        "github:o/r": handFix,
        "npm:typo": { ...handFix, name: "typo", category: "coding-agent" as never },
      },
    };
    const item: ClassifyItem = {
      kind: "github",
      key: "github:O/R",
      row: { ...githubRow("ai-agent"), key: "github:O/R", fullName: "O/R", description: "anything" },
    };
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    const hits = cachedClassifications(cache, [item, npmItem("typo")]);
    expect(hits.get("github:O/R")).toEqual({
      category: "out_of_scope",
      standalone: null,
      decided: "by hand",
    });
    expect(hits.has("npm:typo")).toBe(false);
  });

  it("marks hits seen without rewriting them and drops items unseen for 180 days", () => {
    const cache: ClassifyCache = {
      items: {
        "github:o/r": handFix,
        "npm:old": { ...handFix, name: "old", lastSeen: daysBefore(181) },
        "npm:kept": { ...handFix, name: "kept", lastSeen: daysBefore(180) },
      },
    };
    const items = [githubItem("ai-agent")];
    expect(nextClassifyCache(cache, items, cachedClassifications(cache, items), DATE).items).toEqual({
      "github:o/r": { ...handFix, lastSeen: DATE },
      "npm:kept": cache.items["npm:kept"],
    });
  });

  it("reads back what it saved, one item per line; a missing file is empty, an invalid one null", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "trending-classify-")), "c.json");
    expect(loadClassifyCache(file)).toEqual({ items: {} });
    const cache = saveAnswers(
      [npmItem("a"), npmItem("b")],
      [jev("coding_agent", 0.9), jev("out_of_scope", 0.1)],
    );
    saveClassifyCache(cache, file);
    const lines = fs.readFileSync(file, "utf-8").split("\n");
    expect(lines.filter((l) => l.startsWith('    "npm:'))).toHaveLength(2);
    expect(lines).toHaveLength(7); // "{", "items" line, 2 items, "}", "}", "" after the final newline
    expect(loadClassifyCache(file)).toEqual(cache);
    fs.writeFileSync(file, "{ not json");
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
