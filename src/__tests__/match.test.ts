import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { AskJev } from "../core/jev.ts";
import {
  type MatchState,
  applyMatchAnswers,
  loadMatchState,
  matchApps,
  pendingMatchQuestions,
  pruneMatchState,
  saveMatchState,
} from "../trending/match.ts";
import { type RadarRow, urlMerge } from "../trending/rank.ts";

// ---------------------------------------------------------------------------
// Jev classification
// ---------------------------------------------------------------------------

const MODEL = "jev-1.13.0";

function choice(pick: string, p = 0.9) {
  return { type: "choice", choice: pick, confidence: p, probabilities: { [pick]: p, none: 1 - p } };
}

/** A stub `ask` answering the classification questions. */

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
