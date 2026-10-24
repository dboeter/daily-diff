import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  policyRelevance,
  selectPolicyItems,
  watchlisted,
  isDataLaw,
  keywordHit,
  fallbackKeywordHit,
  loadPolicyVerdicts,
  type PolicyAnswers,
  type PolicyVerdicts,
} from "../policy/relevance.ts";
import type { PolicyItem } from "../policy/items.ts";
import { saveItemsFile } from "../core/jev.ts";
import type { Jurisdiction, PolicyConfig } from "../core/config.ts";

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

  // Score-only answers (no probabilities) gate on the score's nearest level.
  it("drops a US item with little expected impact on the reader", () => {
    expect(policyRelevance(answers(1, 1, 1, 2, 0.4), "us_federal").keep).toBe(false);
    expect(policyRelevance(answers(1, 1, 1, 2, 1.4), "us_states").keep).toBe(true);
  });

  it("keeps an item from elsewhere only when it is a major event", () => {
    expect(policyRelevance(answers(1, 1, 1, 1.4), "other").keep).toBe(false);
    expect(policyRelevance(answers(1, 1, 1, 1.8), "other").keep).toBe(true);
  });

  it("gates on the level probabilities, not the expected score", () => {
    const withProbs = (impact: Record<string, number>, score: number): PolicyAnswers => ({
      ...answers(1, 1, 1, 2),
      impact: { score, probabilities: impact },
    });
    // 2026-10-19, Covington on an enacted US law: mostly "some effect", expected score under 1.
    expect(policyRelevance(withProbs({ 0: 0.17, 1: 0.82, 2: 0.01 }, 0.84), "us_federal").keep).toBe(true);
    expect(policyRelevance(withProbs({ 0: 0.6, 1: 0.4, 2: 0 }, 0.4), "us_states").keep).toBe(false);

    const other = (probabilities: Record<string, number>, score: number): PolicyAnswers => ({
      ...answers(1, 1, 1, 2),
      significance: { score, probabilities },
    });
    expect(policyRelevance(other({ 0: 0.2, 1: 0.2, 2: 0.6 }, 1.4), "other").keep).toBe(true);
    expect(policyRelevance(other({ 0: 0, 1: 0.7, 2: 0.3 }, 1.6), "other").keep).toBe(false);

    expect(policyRelevance(withProbs({}, 1), "us_federal").keep).toBe(false);
    expect(() => policyRelevance(withProbs({ 0: 0.2, 1: NaN }, 1), "us_federal")).toThrow("Unexpected");
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

  it("asks again when a stage item has moved past the stage its verdict was saved at", async () => {
    const saved = { answers: answers(1, 0, 0, 0), decided: "2026-10-01", lastSeen: "2026-10-13" };
    const cache: PolicyVerdicts = {
      items: {
        moved: { ...saved, title: "Title moved", fingerprint: "Introduced" },
        same: { ...saved, title: "Title same", fingerprint: "Introduced" },
        // Saved before verdicts carried a stage.
        legacy: { ...saved, title: "Title legacy" },
        plain: { ...saved, title: "Title plain" },
      },
    };
    const ask = stub({ moved: answers(1, 1, 1, 2), legacy: answers(1, 1, 1, 2) });
    const sel = await selectPolicyItems(
      [
        item("moved", { stage: "Became law" }),
        item("same", { stage: "Introduced" }),
        item("legacy", { stage: "Introduced" }),
        item("plain"),
      ],
      { ...base, apiKey: "k", cache, ask },
    );
    expect(ask.mock.calls.map(([state]) => (state as { title: string }).title)).toEqual([
      "Title moved",
      "Title legacy",
    ]);
    expect(sel.items.map((i) => i.id)).toEqual(["moved", "legacy"]);
    expect(sel.nextVerdicts?.items["moved"]).toMatchObject({
      fingerprint: "Became law",
      answers: answers(1, 1, 1, 2),
    });
  });

  it("shows Jev a stage item's stage and its date", async () => {
    const ask = stub({ bill: answers(1, 1, 1, 2), [`long ${"x".repeat(300)}`]: answers(1, 1, 1, 2) });
    // A long EUR-Lex title reaches Jev whole; only the rendered table truncates it.
    const long = item("long", { title: `Title long ${"x".repeat(300)}` });
    await selectPolicyItems([long], { ...base, apiKey: "k", cache: { items: {} }, ask });
    expect(ask.mock.calls[0]![0]).toMatchObject({ title: long.title });
    ask.mockClear();
    await selectPolicyItems([item("bill", { stage: "Became law" })], {
      ...base,
      apiKey: "k",
      cache: { items: {} },
      ask,
    });
    expect(ask.mock.calls[0]![0]).toEqual({
      title: "Title bill",
      description: "",
      stage: "Became law",
      stage_date: "2026-10-13",
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
    const trace = JSON.parse(sel.traceFile) as { models: string[]; items: { id: string; kept: boolean }[] };
    expect(trace.models).toEqual(["jev-1.0"]);
    expect(trace.items.map((i) => [i.id, i.kept])).toEqual([
      ["a", true],
      ["b", false],
    ]);
    expect(sel.traceFile.split("\n").filter((l) => l.startsWith('{"id"'))).toHaveLength(2);
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
    saveItemsFile(cache, file);
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

describe("isDataLaw", () => {
  const tokens = ["2023/2854", "2022/868", "2022/2555", "Data Act", "Data Governance Act", "NIS2", "NIS 2"];
  const item = (title: string, link = "https://x.eu/", jurisdiction: Jurisdiction = "eu", news = false) => ({
    title,
    description: "",
    link,
    jurisdiction,
    news,
  });

  it("matches a data-law name or act number in the title or link", () => {
    expect(isDataLaw(item("NIS2 implementing act adopted"), tokens)).toBe(true);
    expect(isDataLaw(item("Regulation", "https://eur-lex.europa.eu/eli/reg/2022/868/oj"), tokens)).toBe(true);
  });

  it("does not match a longer word", () => {
    expect(isDataLaw(item("Data Actions in the cloud"), tokens)).toBe(false);
  });

  it("skips US government sources but not US news feeds", () => {
    expect(isDataLaw(item("Protecting Kids' Data Act", "https://congress.gov/", "us_federal"), tokens)).toBe(
      false,
    );
    expect(isDataLaw(item("EU Data Act guidance", "https://cov.com/", "us_federal", true), tokens)).toBe(
      true,
    );
  });
});

describe("data-law keywords", () => {
  it("count in the fallback, whole-word, but not as a source filter", () => {
    expect(fallbackKeywordHit({ title: "Data Governance Act review", description: "" })).toBe(true);
    expect(fallbackKeywordHit({ title: "NIS 2 transposition", description: "" })).toBe(true);
    expect(fallbackKeywordHit({ title: "Data Actions", description: "" })).toBe(false);
    expect(keywordHit({ title: "Protecting Kids' Data Act", description: "" })).toBe(false);
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
