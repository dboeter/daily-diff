import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  policyRelevance,
  selectPolicyItems,
  watchlisted,
  loadPolicyVerdicts,
  savePolicyVerdicts,
  type PolicyAnswers,
  type PolicyVerdicts,
} from "../policy-jev.ts";
import type { PolicyItem } from "../policy.ts";
import type { PolicyConfig } from "../config.ts";

const answers = (
  about: number,
  binding: number,
  newStage: number,
  significance: number,
  impact?: number,
): PolicyAnswers => ({
  about_ai_policy: { noul: about },
  binding: { noul: binding },
  new_stage: { noul: newStage },
  significance: { score: significance },
  ...(impact === undefined ? {} : { impact: { score: impact } }),
});

const item = (id: string, over: Partial<PolicyItem> = {}): PolicyItem => ({
  id,
  title: `Title ${id}`,
  link: `https://example.eu/${id}`,
  published: "2026-10-13T08:00:00.000Z",
  description: "",
  source: "Commission",
  jurisdiction: "eu",
  jevOnly: false,
  ...over,
});

describe("policyRelevance", () => {
  it("keeps a binding new stage of major significance at full weight", () => {
    const v = policyRelevance(answers(1, 1, 1, 2), "eu");
    expect(v.relevance).toBeCloseTo(1);
    expect(v.keep).toBe(true);
  });

  it("drops a routine, non-binding AI-policy event of no significance", () => {
    const v = policyRelevance(answers(1, 0, 0, 0), "eu");
    expect(v.relevance).toBeCloseTo(0.4);
    expect(v.keep).toBe(false);
  });

  it("drops an item not about AI policy, however significant", () => {
    expect(policyRelevance(answers(0.3, 1, 1, 2), "nl").keep).toBe(false);
  });

  it("drops a US item with little expected impact on the reader", () => {
    expect(policyRelevance(answers(1, 1, 1, 2, 0.6), "us_federal").keep).toBe(false);
    expect(policyRelevance(answers(1, 1, 1, 2, 1.4), "us_states").keep).toBe(true);
  });

  it("keeps an item from elsewhere only when it is a major event", () => {
    expect(policyRelevance(answers(1, 1, 1, 1.2), "other").keep).toBe(false);
    expect(policyRelevance(answers(1, 1, 1, 1.8), "other").keep).toBe(true);
  });

  it("throws on an unexpected answer shape, so the call counts as failed", () => {
    expect(() => policyRelevance({ about_ai_policy: {} } as PolicyAnswers, "eu")).toThrow("Unexpected");
    expect(() => policyRelevance(answers(1, 1, 1, 2), "us_federal")).toThrow("Unexpected");
  });
});

describe("selectPolicyItems", () => {
  const noWatchlist = { eu: [], nl: [], usFederal: [], usStates: [] };
  const base = { readerProfile: "A practitioner.", watchlist: noWatchlist, dateStr: "2026-10-14" };
  const stub = (byId: Record<string, PolicyAnswers>) =>
    vi.fn(async (state: unknown, _questions: object, _apiKey: string) => {
      const title = (state as { title: string }).title;
      const a = byId[title.replace("Title ", "")];
      if (!a) throw new Error("HTTP 500");
      return { model: "jev-1.0", answers: a as unknown };
    });

  it("keeps items Jev rates relevant, most relevant first", async () => {
    const ask = stub({ low: answers(1, 0, 1, 1), high: answers(1, 1, 1, 2), off: answers(0, 0, 0, 0) });
    const sel = await selectPolicyItems([item("low"), item("off"), item("high")], {
      ...base,
      apiKey: "k",
      cache: { items: {} },
      ask,
    });
    expect(sel.rankedBy).toBe("jev");
    expect(sel.items.map((i) => i.id)).toEqual(["high", "low"]);
  });

  it("asks the impact question with the reader profile for US items only", async () => {
    const ask = stub({ eu: answers(1, 1, 1, 2), us: answers(1, 1, 1, 2, 2) });
    await selectPolicyItems([item("eu"), item("us", { jurisdiction: "us_federal" })], {
      ...base,
      apiKey: "k",
      cache: { items: {} },
      ask,
    });
    const calls = ask.mock.calls.map(([state, questions]) => [state, Object.keys(questions)]);
    expect(calls).toContainEqual([
      { title: "Title eu", description: "" },
      ["about_ai_policy", "binding", "new_stage", "significance"],
    ]);
    expect(calls).toContainEqual([
      { title: "Title us", description: "", reader: "A practitioner." },
      ["about_ai_policy", "binding", "new_stage", "significance", "impact"],
    ]);
  });

  it("asks once: a saved verdict is reused, and new answers are saved", async () => {
    const cache: PolicyVerdicts = {
      items: {
        old: {
          title: "Title old",
          answers: answers(1, 1, 1, 2),
          decided: "2026-10-12",
          lastSeen: "2026-10-12",
        },
        gone: { title: "Gone", answers: answers(1, 1, 1, 2), decided: "2026-09-01", lastSeen: "2026-09-13" },
      },
    };
    const ask = stub({ fresh: answers(1, 1, 1, 1) });
    const sel = await selectPolicyItems([item("old"), item("fresh")], { ...base, apiKey: "k", cache, ask });
    expect(ask).toHaveBeenCalledTimes(1);
    expect(sel.items.map((i) => i.id)).toEqual(["old", "fresh"]);
    expect(sel.nextVerdicts?.items).toEqual({
      old: { ...cache.items["old"], lastSeen: "2026-10-14" },
      fresh: {
        title: "Title fresh",
        answers: answers(1, 1, 1, 1),
        decided: "2026-10-14",
        model: "jev-1.0",
        lastSeen: "2026-10-14",
      },
    });
  });

  it("without a key keeps watchlisted items and keyword hits, and drops Jev-only feeds", async () => {
    const ask = stub({});
    const sel = await selectPolicyItems(
      [
        item("kw", { title: "Commission adopts AI Act guidelines" }),
        item("plain", { title: "Cybersecurity call for tenders" }),
        item("jevonly", { title: "Regulator fines AI provider", jevOnly: true }),
        item("watched", { title: "Uber fine", description: "Case 2024/123", jevOnly: true }),
      ],
      { ...base, watchlist: { ...noWatchlist, eu: ["2024/123"] }, cache: { items: {} }, ask },
    );
    expect(ask).not.toHaveBeenCalled();
    expect(sel.rankedBy).toBe("keywords");
    expect(sel.items.map((i) => i.id)).toEqual(["kw", "watched"]);
  });

  it("falls back to keywords when more than half the calls fail, keeping saved verdicts", async () => {
    const ask = stub({ ok: answers(1, 1, 1, 2) });
    const cache: PolicyVerdicts = {
      items: { saved: { title: "x", answers: answers(1, 1, 1, 2), lastSeen: "2026-10-13" } },
    };
    const sel = await selectPolicyItems(
      [item("saved"), item("ok"), item("f1", { title: "Title f1 on artificial intelligence" }), item("f2")],
      { ...base, apiKey: "k", cache, ask },
    );
    expect(sel.rankedBy).toBe("keywords");
    expect(sel.items.map((i) => i.id)).toEqual(["saved", "f1"]);
  });

  it("keeps a watchlisted item Jev would drop", async () => {
    const ask = stub({ w: answers(0, 0, 0, 0) });
    const sel = await selectPolicyItems([item("w", { link: "https://x/2024-0106(COD)" })], {
      ...base,
      watchlist: { ...noWatchlist, eu: ["2024-0106(cod)"] },
      apiKey: "k",
      cache: { items: {} },
      ask,
    });
    expect(sel.items.map((i) => i.id)).toEqual(["w"]);
  });

  it("traces every item, kept or dropped, one per line", async () => {
    const ask = stub({ a: answers(1, 1, 1, 2), b: answers(0, 0, 0, 0) });
    const sel = await selectPolicyItems([item("a"), item("b")], {
      ...base,
      apiKey: "k",
      cache: { items: {} },
      ask,
    });
    const trace = JSON.parse(sel.rankingFile) as { models: string[]; items: { id: string; kept: boolean }[] };
    expect(trace.models).toEqual(["jev-1.0"]);
    expect(trace.items.map((i) => [i.id, i.kept])).toEqual([
      ["a", true],
      ["b", false],
    ]);
    expect(sel.rankingFile.split("\n").filter((l) => l.startsWith('{"id"'))).toHaveLength(2);
  });
});

describe("policy verdict file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "policy-verdicts-"));

  it("round-trips; a missing file is empty, a malformed one null", () => {
    const file = path.join(dir, "v.json");
    expect(loadPolicyVerdicts(file)).toEqual({ items: {} });
    const cache: PolicyVerdicts = {
      items: { a: { title: "A", answers: answers(1, 1, 1, 2), lastSeen: "2026-10-14" } },
    };
    savePolicyVerdicts(cache, file);
    expect(loadPolicyVerdicts(file)).toEqual(cache);
    fs.writeFileSync(file, "{ nope");
    expect(loadPolicyVerdicts(file)).toBeNull();
  });
});

describe("policyRelevance for news items", () => {
  it("keeps a significant commentary piece that reports no new stage and nothing binding", () => {
    // A weekly AI Act roundup: on topic and notable, neither a step in a process nor binding.
    expect(policyRelevance(answers(0.8, 0, 0, 1), "eu", true).keep).toBe(true);
  });

  it("drops an off-topic news piece however significant", () => {
    expect(policyRelevance(answers(0.2, 0, 0, 1.6), "eu", true).keep).toBe(false);
  });

  it("drops an on-topic news piece of minor significance", () => {
    expect(policyRelevance(answers(1, 1, 1, 0), "nl", true).keep).toBe(false);
  });

  it("still holds US news to the impact gate", () => {
    expect(policyRelevance(answers(0.9, 0, 0, 1.5, 0.4), "us_federal", true).keep).toBe(false);
    expect(policyRelevance(answers(0.9, 0, 0, 1.5, 1.2), "us_federal", true).keep).toBe(true);
  });
});

describe("watchlisted", () => {
  const item = (description: string) => ({ title: "T", description, link: "https://x.nl/" });

  it("matches a whole entry, case-insensitively", () => {
    expect(watchlisted(item("Dutch bill, Kamerstuk 36875."), ["36875"])).toBe(true);
    expect(watchlisted(item("procedure 2025/0359(COD)."), ["2025/0359(cod)"])).toBe(true);
    expect(watchlisted(item("(NIST-2026-0100; RIN 0693-AB12)"), ["0693-AB12"])).toBe(true);
  });

  it("does not match inside a longer number", () => {
    expect(watchlisted(item("Kamerstuk 136875"), ["36875"])).toBe(false);
    expect(watchlisted(item("Kamerstuk 368750"), ["36875"])).toBe(false);
    expect(watchlisted(item("Regulation (EU) 2024/16890"), ["2024/1689"])).toBe(false);
    expect(watchlisted(item("CELEX 2032024/1689"), ["2024/1689"])).toBe(false);
  });
});

describe("selectPolicyItems watchlist", () => {
  const empty: PolicyConfig["watchlist"] = { eu: [], nl: [], usFederal: [], usStates: [] };
  const drop = vi.fn(async () => ({ model: "jev-1.0", answers: answers(0, 0, 0, 0) as unknown }));
  const opts = (watchlist: PolicyConfig["watchlist"]) => ({
    readerProfile: "A practitioner.",
    dateStr: "2026-10-14",
    watchlist,
    apiKey: "test",
    cache: { items: {} },
    ask: drop,
  });

  it("does not let a news item naming a watchlisted file bypass Jev", async () => {
    const news = item("n", { description: "Analysis of Regulation 2024/1689", news: true });
    const sel = await selectPolicyItems([news], opts({ ...empty, eu: ["2024/1689"] }));
    expect(sel.items).toEqual([]);
  });

  it("matches only the item's own jurisdiction's watchlist", async () => {
    const us = item("u", { description: "Bill citing EU Regulation 2024/1689", jurisdiction: "us_federal" });
    const eu = item("e", { description: "Regulation 2024/1689" });
    const sel = await selectPolicyItems([us, eu], opts({ ...empty, eu: ["2024/1689"] }));
    expect(sel.items.map((i) => i.id)).toEqual(["e"]);
  });
});

describe("selectPolicyItems impact wording", () => {
  it("asks about the reported development, not a US measure, for US news", async () => {
    const ask = vi.fn(async (_s: unknown, _q: object, _k: string) => ({
      model: "jev-1.0",
      answers: answers(1, 0, 0, 1, 1) as unknown,
    }));
    await selectPolicyItems(
      [item("m"), item("n", { news: true })].map((i) => ({ ...i, jurisdiction: "us_federal" as const })),
      {
        readerProfile: "A practitioner.",
        dateStr: "2026-10-14",
        watchlist: { eu: [], nl: [], usFederal: [], usStates: [] },
        apiKey: "test",
        cache: { items: {} },
        ask,
      },
    );
    const wording = ask.mock.calls.map(
      ([, q]) => (q as { impact: { instructions: string } }).impact.instructions,
    );
    expect(wording[0]).toContain("US measure");
    expect(wording[1]).not.toContain("US measure");
    expect(wording[1]).toContain("development");
  });
});
