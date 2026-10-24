import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { type AskJev, judgeItems } from "../../core/jev.ts";
import type { OpenRouterApp } from "../../sources/openrouter.ts";
import {
  type Classification,
  type ClassifyAnswers,
  type ClassifyItem,
  STANDALONE_MIN_NOUL,
  type TrendingVerdicts,
  buildTrendingTraceFile,
  classificationOf,
  classifyTrendingItems,
  fallbackClassification,
  inScope,
  loadTrendingVerdicts,
  onRadar,
  saveTrendingVerdicts,
} from "../../trending/classify.ts";
import type { NpmPackage } from "../../trending/npm.ts";
import { type GithubRow } from "../../trending/rank.ts";
import { migrateClassifyEntry, migratePolicyEntry } from "../../../scripts/migrate-verdict-fingerprints.ts";

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

// ---------------------------------------------------------------------------
// Match cache
// ---------------------------------------------------------------------------

const DATE = "2026-10-05";

const DAY_MS = 24 * 60 * 60 * 1000;

const daysBefore = (n: number) => new Date(Date.parse(DATE) - n * DAY_MS).toISOString().slice(0, 10);

/** A stub `ask` answering match questions: picks per question id, at probability `p`. */

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
  const run = (list: ClassifyItem[], ask: AskJev, cache: TrendingVerdicts | null = { items: {} }) =>
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
// Trending verdicts
// ---------------------------------------------------------------------------

describe("trending verdicts", () => {
  // The generic cache rules (reuse, prune, hand-edit spread, invalid entry asked again) are judgeItems' (core/jev.test.ts).
  const npmItem = (name: string, description = ""): ClassifyItem => ({
    kind: "npm",
    key: `npm:${name}`,
    pkg: { name, description } as NpmPackage,
  });
  const run = (
    list: ClassifyItem[],
    cache: TrendingVerdicts,
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
    const cache: TrendingVerdicts = {
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
    expect(loadTrendingVerdicts(file)).toEqual({ items: {} });
    const { nextCache } = await run([npmItem("a"), npmItem("b")], { items: {} });
    saveTrendingVerdicts(nextCache!, file);
    const lines = fs.readFileSync(file, "utf-8").split("\n");
    expect(lines.filter((l) => l.startsWith('    "npm:'))).toHaveLength(2);
    expect(lines).toHaveLength(7); // "{", "items" line, 2 items, "}", "}", "" after the final newline
    expect(loadTrendingVerdicts(file)).toEqual(nextCache);
    fs.writeFileSync(file, "{ not json");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(loadTrendingVerdicts(file)).toBeNull();
    fs.writeFileSync(file, '{"items": []}');
    expect(loadTrendingVerdicts(file)).toBeNull();
    error.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Trace
// ---------------------------------------------------------------------------

describe("buildTrendingTraceFile", () => {
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
    const file = buildTrendingTraceFile(
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

describe("verdict fingerprint migration", () => {
  type OldEntry = { name: string; category: string; standalone: number | null; desc?: string };
  const old = JSON.parse(
    fs.readFileSync(new URL("../fixtures/trending-classifications-v1.json", import.meta.url), "utf-8"),
  ) as { items: Record<string, OldEntry> };

  it("gives every migrated entry its old category and standalone, a hand fix pinned", async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "classify-migrate-")), "c.json");
    const migrated = Object.fromEntries(
      Object.entries(old.items).map(([k, e]) => [k, migrateClassifyEntry(e as never)]),
    );
    saveTrendingVerdicts({ items: migrated }, file);
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
      cache: loadTrendingVerdicts(file),
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
