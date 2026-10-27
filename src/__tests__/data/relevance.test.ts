import { describe, expect, it, vi } from "vitest";
import {
  type DataAnswers,
  MAX_VENDOR_ITEMS,
  dataRelevance,
  significanceLevel,
  dateCandidates,
  keywordVerdict,
  selectVendorItems,
} from "../../data/relevance.ts";
import type { VendorItem } from "../../data/vendors.ts";

const answers = (real: number, deprecation: number, significance: number, ai = 0): DataAnswers => ({
  real_change: { noul: real },
  deprecation: { noul: deprecation },
  ai_in_data: { noul: ai },
  significance: { score: significance },
});

const item = (id: string, over: Partial<VendorItem> = {}): VendorItem => ({
  id,
  vendor: "databricks",
  source: "Azure Databricks",
  title: `Title ${id}`,
  link: `https://example.com/${id}`,
  date: "2026-10-16",
  description: "",
  ...over,
});

const DATE = "2026-10-17";

describe("dataRelevance", () => {
  it("weighs real change, significance and deprecation", () => {
    expect(dataRelevance(answers(1, 0, 2)).relevance).toBeCloseTo(0.8);
    expect(dataRelevance(answers(1, 1, 2)).relevance).toBeCloseTo(1);
  });

  it("drops a niche real change and anything that is not a real change", () => {
    expect(dataRelevance(answers(1, 0, 0)).keep).toBe(false);
    expect(dataRelevance(answers(0.3, 0, 2)).keep).toBe(false);
    expect(dataRelevance(answers(0.3, 0.9, 2))).toMatchObject({ keep: false, deprecation: false });
  });

  it("counts a low-confidence significance as unknown (Notable), not low", () => {
    const sure = { ...answers(0.95, 0.02, 0.53), significance: { score: 0.53, confidence: 0.8 } };
    const unsure = { ...answers(0.95, 0.02, 0.53), significance: { score: 0.53, confidence: 0.3 } };
    expect(significanceLevel(sure)).toBe(0.53);
    expect(significanceLevel(unsure)).toBe(1);
    expect(dataRelevance(unsure).relevance).toBeGreaterThan(dataRelevance(sure).relevance);
  });

  it("keeps a Tracked-project or Notable item on a weaker real change, not on a weak one", () => {
    expect(dataRelevance(answers(0.46, 0.03, 0.5), true).keep).toBe(true);
    expect(dataRelevance(answers(0.46, 0.03, 0.5)).keep).toBe(false);
    expect(dataRelevance(answers(0.45, 0, 1.2)).keep).toBe(true);
    expect(dataRelevance(answers(0.35, 0, 2), true).keep).toBe(false);
  });

  it("ticket 12 replay: the 2026-10-26 answers keep the Iceberg note and the Fabric FNTK item", () => {
    // Saved answers from digests/2026-10-26/data-trace.json.
    const recompact: DataAnswers = {
      real_change: { noul: 0.46 },
      deprecation: { noul: 0.03 },
      ai_in_data: { noul: 0 },
      significance: { score: 0.79, confidence: 0.53 },
    };
    const fntk: DataAnswers = {
      real_change: { noul: 0.95 },
      deprecation: { noul: 0.02 },
      ai_in_data: { noul: 0.9 },
      significance: { score: 0.53, confidence: 0.3 },
    };
    // "Recompact Iceberg table data" names Apache Iceberg (keyword "iceberg table"), a Tracked project.
    expect(dataRelevance(recompact, true).keep).toBe(true);
    expect(dataRelevance(fntk).keep).toBe(true);
  });

  it("does not exempt an untracked item whose significance is only unknown", () => {
    // Real change 0.45 is under REAL_CHANGE_MIN; Notable at confidence 0.2 is not known to be Notable.
    const unsure: DataAnswers = { ...answers(0.45, 0, 1.5), significance: { score: 1.5, confidence: 0.2 } };
    expect(dataRelevance(unsure).keep).toBe(false);
    expect(dataRelevance(unsure, true).keep).toBe(true);
  });

  it("always keeps a deprecation that is a real change, whatever its relevance", () => {
    const v = dataRelevance(answers(0.6, 0.6, 0));
    expect(v.relevance).toBeLessThan(0.5);
    expect(v).toMatchObject({ keep: true, deprecation: true });
  });

  it("throws on an unexpected answer shape", () => {
    expect(() => dataRelevance({} as DataAnswers)).toThrow();
  });
});

describe("keywordVerdict", () => {
  it("keeps a post titled 'Retiring …' as a deprecation", () => {
    // 2026-10-20: "Retiring the Fabric data agent custom tool in Microsoft Foundry: move to Fabric IQ".
    expect(keywordVerdict(item("a", { title: "Retiring the Fabric data agent custom tool" }))).toEqual({
      keep: true,
      deprecation: true,
    });
  });

  it("keeps a retirement as a deprecation", () => {
    expect(
      keywordVerdict(item("a", { title: "Retirement: Azure Database for MySQL Single Server" })),
    ).toEqual({
      keep: true,
      deprecation: true,
    });
    expect(keywordVerdict(item("b", { title: "Update", categories: ["Retirements", "Databases"] }))).toEqual({
      keep: true,
      deprecation: true,
    });
  });

  it("keeps features and AI items, drops marketing", () => {
    expect(keywordVerdict(item("a", { title: "Lakeflow Connect is GA" })).keep).toBe(true);
    expect(keywordVerdict(item("b", { title: "Cortex Agents in public preview" })).keep).toBe(true);
    expect(keywordVerdict(item("c", { title: "AI functions for SQL warehouses" })).keep).toBe(true);
    expect(keywordVerdict(item("d", { title: "FabCon Vienna recap: a saga of community" }))).toEqual({
      keep: false,
      deprecation: false,
    });
  });
});

describe("selectVendorItems", () => {
  const byId: Record<string, DataAnswers> = {
    low: answers(1, 0, 0.6),
    high: answers(1, 0, 2),
    dep: answers(0.9, 0.9, 0.2),
    ad: answers(0.1, 0, 0),
  };
  const ask = vi.fn(async (state: unknown) => {
    const id = (state as { title: string }).title.replace("Title ", "");
    return { model: "jev-test", answers: byId[id]! };
  });

  it("ticket 04 replay: the 2026-10-26 low-confidence Snowflake note is kept but minor (no Highlight)", async () => {
    // Saved answers from digests/2026-10-26/data-trace.json (D5).
    const d5: DataAnswers = {
      real_change: { noul: 0.99 },
      deprecation: { noul: 0.01 },
      ai_in_data: { noul: 0.02 },
      significance: { score: 0.52, confidence: 0.25 },
    };
    const sel = await selectVendorItems([item("d5", { vendor: "snowflake", source: "Snowflake" })], {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: async () => ({ model: "jev-test", answers: d5 }),
    });
    expect(sel.items.map((i) => [i.id, i.minor])).toEqual([["d5", true]]);
  });

  it("orders deprecations first, then by relevance; bundles skip Jev; saves the answers", async () => {
    ask.mockClear();
    const sel = await selectVendorItems(
      [
        item("low"),
        item("ad"),
        item("high"),
        item("dep"),
        item("bcr", { vendor: "snowflake", stage: "Enabled" }),
      ],
      { apiKey: "k", cache: { items: {} }, dateStr: DATE, ask },
    );
    expect(sel.items.map((i) => i.id)).toEqual(["dep", "high", "low", "bcr"]);
    expect(sel.items.map((i) => i.deprecation)).toEqual([true, false, false, true]);
    // Significance under "Notable" (1) marks a non-deprecation minor: no Highlight. A deprecation never is.
    expect(sel.items.map((i) => i.minor ?? false)).toEqual([false, false, true, false]);
    expect(sel.rankedBy).toBe("jev");
    expect(ask).toHaveBeenCalledTimes(4);
    expect(sel.nextVerdicts?.items["high"]).toMatchObject({
      decided: DATE,
      model: "jev-test",
      lastSeen: DATE,
    });
    expect(sel.nextVerdicts?.items["bcr"]).toBeUndefined();
    expect(sel.traceFile).toContain('"id":"ad","title":"Title ad","source":"Azure Databricks","kept":false');
  });

  it("falls back to the keyword rules without a key, keeping feed order after deprecations", async () => {
    const sel = await selectVendorItems(
      [
        item("a", { title: "New connector now available" }),
        item("b", { title: "Customer story: Contoso" }),
        item("c", { title: "Retirement: legacy runtime" }),
        item("d", { title: "Delta Sharing GA" }),
      ],
      { cache: { items: {} }, dateStr: DATE },
    );
    expect(sel.rankedBy).toBe("keywords");
    expect(sel.items.map((i) => i.id)).toEqual(["c", "a", "d"]);
  });

  it("falls back to the keyword rules when more than half the calls fail", async () => {
    const failing = vi.fn(async () => {
      throw new Error("HTTP 500");
    });
    const sel = await selectVendorItems(
      [item("x", { title: "Retirement: X" }), item("y", { title: "Webinar" })],
      {
        apiKey: "k",
        cache: { items: {} },
        dateStr: DATE,
        ask: failing,
      },
    );
    expect(sel.rankedBy).toBe("keywords");
    expect(sel.items.map((i) => i.id)).toEqual(["x"]);
  });

  it("caps the report: every deprecation, per-section floors, leftover slots Databricks first", async () => {
    const many = [
      ...Array.from({ length: 5 }, (_, i) =>
        item(`gcp${i}`, { vendor: "gcp", title: "Feature: preview", source: "BigQuery" }),
      ),
      ...Array.from({ length: 14 }, (_, i) => item(`dbx${i}`, { title: "Feature now available" })),
      item("sf1", { vendor: "snowflake", title: "Feature now available" }),
      item("sf-dep", { vendor: "snowflake", title: "Deprecated: old driver" }),
      item("gcp-dep", { vendor: "gcp", title: "Breaking: legacy SQL" }),
    ];
    const sel = await selectVendorItems(many, { cache: { items: {} }, dateStr: DATE });
    expect(sel.items).toHaveLength(MAX_VENDOR_ITEMS);
    const ids = sel.items.map((i) => i.id);
    // 2 deprecations + 6 Databricks + 1 Snowflake (all it has) + 3 cloud = 12: nothing left over.
    expect(ids).toEqual([
      ...Array.from({ length: 6 }, (_, i) => `dbx${i}`),
      "sf-dep",
      "sf1",
      "gcp-dep",
      "gcp0",
      "gcp1",
      "gcp2",
    ]);
    expect(sel.traceFile).toContain(
      '"id":"gcp3","title":"Feature: preview","source":"BigQuery","kept":false,"overCap":true',
    );
    // Without verdicts all relevances tie, so the over-cap items keep feed order.
    expect(sel.alsoNew!.map((i) => i.id)).toEqual([
      "gcp3",
      "gcp4",
      ...Array.from({ length: 8 }, (_, i) => `dbx${i + 6}`),
    ]);
  });

  it("traces a kept item at its row number and an over-cap one as cut by the cap", async () => {
    const many = Array.from({ length: MAX_VENDOR_ITEMS + 2 }, (_, i) =>
      item(`dbx${i}`, { title: "Feature now available" }),
    );
    const sel = await selectVendorItems(many, { cache: { items: {} }, dateStr: DATE });
    const trace = JSON.parse(sel.traceFile) as { items: Record<string, unknown>[] };
    const row = (id: string) => trace.items.find((i) => i["id"] === id);
    const kept = sel.items[3]!;
    expect(row(kept.id)).toMatchObject({ rendered: true, rank: kept.n });
    expect(row(`dbx${MAX_VENDOR_ITEMS + 1}`)).toMatchObject({ rendered: false, dropped_reason: "cap" });
  });

  it("gives slots the floors leave to Databricks first", async () => {
    const many = [
      ...Array.from({ length: 14 }, (_, i) => item(`dbx${i}`, { title: "Feature now available" })),
      item("gcp0", { vendor: "gcp", title: "Feature: preview" }),
    ];
    const ids = (await selectVendorItems(many, { cache: { items: {} }, dateStr: DATE })).items.map(
      (i) => i.id,
    );
    expect(ids).toEqual([...Array.from({ length: 11 }, (_, i) => `dbx${i}`), "gcp0"]);
  });
});

describe("dateCandidates", () => {
  it("reads the feeds' date formats as ISO dates, US order for slashes, once each", () => {
    expect(
      dateCandidates(
        "Retires on November 19, 2026 (Nov. 19, 2026). Unsupported after 11/6/2026 or 6 December 2026, 2026-12-31.",
      ),
    ).toEqual([
      { iso: "2026-11-19", text: "November 19, 2026" },
      { iso: "2026-11-06", text: "11/6/2026" },
      { iso: "2026-12-06", text: "6 December 2026" },
      { iso: "2026-12-31", text: "2026-12-31" },
    ]);
    expect(dateCandidates("No date here, only version 19.1")).toEqual([]);
  });
});

describe("selectVendorItems end dates", () => {
  const deprecation = { ...answers(1, 1, 2) };
  const ask = vi.fn(async (_state: unknown, questions: object) => {
    const q = questions as { end_date?: { criteria: Record<string, unknown> } };
    const dates = Object.keys(q.end_date?.criteria ?? {}).filter((k) => k !== "none");
    // Jev picks the retirement date; the runtime's release date is no end date.
    const choice = dates.includes("2026-11-19") ? "2026-11-19" : "none";
    return {
      model: "jev-test",
      answers: { ...deprecation, ...(q.end_date ? { end_date: { choice } } : {}) },
    };
  });
  const pool = [
    item("deepseek", {
      title: "DeepSeek V4.1 Flash is scheduled for retirement",
      description: "It retires on November 19, 2026.",
    }),
    item("runtime", { title: "Databricks Runtime 19: October 19, 2026", description: "Metrics are hidden." }),
    item("mlflow", { title: "Redesigned MLflow Logs tab", description: "The Artifacts tab is deprecated." }),
  ];

  it("asks for the end date only when the text has dates, and keeps Jev's pick as a deprecation's end date", async () => {
    ask.mockClear();
    const { items } = await selectVendorItems(pool, {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask,
    });
    const criteria = ask.mock.calls.map((c) =>
      Object.keys((c[1] as { end_date?: { criteria: object } }).end_date?.criteria ?? {}),
    );
    expect(criteria).toEqual([["2026-11-19", "none"], ["2026-10-19", "none"], []]);
    expect(Object.fromEntries(items.map((i) => [i.id, i.endDate]))).toEqual({
      deepseek: "2026-11-19",
      runtime: undefined,
      mlflow: undefined,
    });
  });

  it("asks a saved verdict again once its text has dates it was not asked about", async () => {
    ask.mockClear();
    const cache = {
      items: {
        deepseek: { title: "x", answers: deprecation, decided: "2026-10-16", lastSeen: "2026-10-16" },
        mlflow: { title: "x", answers: deprecation, decided: "2026-10-16", lastSeen: "2026-10-16" },
      },
    };
    const { items } = await selectVendorItems([pool[0]!, pool[2]!], {
      apiKey: "k",
      cache,
      dateStr: DATE,
      ask,
    });
    expect(ask).toHaveBeenCalledOnce();
    expect(items.find((i) => i.id === "deepseek")?.endDate).toBe("2026-11-19");
  });

  it("ignores a pick that is not one of the candidates, or an end date on a non-deprecation", async () => {
    const odd = vi.fn(async () => ({
      model: "m",
      answers: { ...answers(1, 0, 2), end_date: { choice: "2026-11-19" } },
    }));
    const { items } = await selectVendorItems([pool[0]!], {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: odd,
    });
    expect(items[0]?.endDate).toBeUndefined();
    const made = vi.fn(async () => ({
      model: "m",
      answers: { ...deprecation, end_date: { choice: "2027-01-01" } },
    }));
    const r = await selectVendorItems([pool[0]!], {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: made,
    });
    expect(r.items[0]?.endDate).toBeUndefined();
  });
});

describe("selectVendorItems near the cut", () => {
  it("gives a section without a kept item its best item within 0.05 of the bar", async () => {
    const byTitle: Record<string, DataAnswers> = {
      // relevance 0.4*1 + 0.4*0.22/2 + 0 = 0.444 (no keep), 0.4*1 + 0.4*0.1/2 = 0.42 (no keep)
      near: { ...answers(1, 0, 0.22) },
      far: { ...answers(1, 0, 0.1) },
    };
    const ask = vi.fn(async (state: unknown) => ({
      model: "jev-test",
      answers: byTitle[(state as { title: string }).title.replace("Title ", "")]!,
    }));
    const sel = await selectVendorItems([item("near", { vendor: "gcp" }), item("far", { vendor: "gcp" })], {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask,
    });
    expect(sel.items.map((i) => i.id)).toEqual([]);
    const near2: Record<string, DataAnswers> = { ...byTitle, near: answers(1, 0, 0.3) }; // 0.46: within 0.05 of 0.5
    const ask2 = vi.fn(async (state: unknown) => ({
      model: "jev-test",
      answers: near2[(state as { title: string }).title.replace("Title ", "")]!,
    }));
    const sel2 = await selectVendorItems([item("near", { vendor: "gcp" }), item("far", { vendor: "gcp" })], {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: ask2,
    });
    expect(sel2.items.map((i) => i.id)).toEqual(["near"]);
  });
});
