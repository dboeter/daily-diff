import { describe, it, expect, vi } from "vitest";
import {
  dataRelevance,
  dateCandidates,
  keywordVerdict,
  selectVendorItems,
  MAX_VENDOR_ITEMS,
  type DataAnswers,
} from "../data/jev.ts";
import { asStateItem, recentVendorItems, type VendorItem } from "../data/vendors.ts";
import { newItems, nextReportedState, type ReportedState } from "../core/report-state.ts";

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
    expect(sel.rankedBy).toBe("jev");
    expect(ask).toHaveBeenCalledTimes(4);
    expect(sel.nextVerdicts?.items["high"]).toMatchObject({
      decided: DATE,
      model: "jev-test",
      lastSeen: DATE,
    });
    expect(sel.nextVerdicts?.items["bcr"]).toBeUndefined();
    expect(sel.rankingFile).toContain(
      '"id":"ad","title":"Title ad","source":"Azure Databricks","kept":false',
    );
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
    expect(sel.rankingFile).toContain(
      '"id":"gcp3","title":"Feature: preview","source":"BigQuery","kept":false,"overCap":true',
    );
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

describe("vendor state", () => {
  // What fetchVendorData's pipeline does with the state (new-items.ts): the age limit, then the state's keys.
  const newVendorItems = (items: VendorItem[], state: ReportedState | null, dateStr: string) => {
    const recent = recentVendorItems(items, dateStr);
    const fresh = new Set(newItems(recent.map(asStateItem), state, dateStr).map((i) => i.id));
    return recent.filter((i) => fresh.has(asStateItem(i).id));
  };
  const nextDataState = (state: ReportedState | null, items: VendorItem[], dateStr: string) =>
    nextReportedState(state, items.map(asStateItem), dateStr);
  // The state keys a note on title + date (data/vendors.ts stateId), as item() builds them.
  const key = (id: string) => `title ${id}|2026-10-16`;

  it("keeps items reported today for a same-day re-run and drops earlier ones", () => {
    const state = { reported: { [key("today")]: DATE, [key("earlier")]: "2026-10-15" }, stages: {} };
    const fresh = newVendorItems([item("today"), item("earlier"), item("new")], state, DATE);
    expect(fresh.map((i) => i.id)).toEqual(["today", "new"]);
  });

  it("drops items older than 7 days on every run, keeps future dates, and lets bundles skip the limit", () => {
    const items = [
      item("old", { date: "2026-10-09" }),
      item("edge", { date: "2026-10-10" }),
      item("future", { date: "2026-10-19" }),
      item("bcr", { date: "", stage: "Planned" }),
    ];
    expect(newVendorItems(items, null, DATE).map((i) => i.id)).toEqual(["edge", "future", "bcr"]);
    expect(newVendorItems(items, { reported: {}, stages: {} }, DATE).map((i) => i.id)).toEqual([
      "edge",
      "future",
      "bcr",
    ]);
  });

  it("does not report a note again under its other guid", () => {
    const state = nextDataState(null, [item("topic-page-guid", { title: "Same note" })], "2026-10-16");
    expect(newVendorItems([item("monthly-page-guid", { title: "Same note" })], state, DATE)).toEqual([]);
  });

  it("reports a bundle again when its stage moves, not before", () => {
    const bundle = item("bcr", { date: "", stage: "Enabled by default" });
    const state = nextDataState(null, [bundle], "2026-10-10");
    expect(newVendorItems([bundle], state, DATE)).toEqual([]);
    const moved = { ...bundle, stage: "Generally enabled" };
    expect(newVendorItems([moved], state, DATE)).toEqual([moved]);
  });

  it("prunes reported ids after 30 days and never prunes stages", () => {
    const state = nextDataState(
      { reported: { gone: "2026-09-01", kept: "2026-10-01" }, stages: { bcr: " Planned" } },
      [item("new")],
      DATE,
    );
    expect(state).toEqual({
      reported: { kept: "2026-10-01", [key("new")]: DATE },
      stages: { bcr: " Planned" },
    });
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
