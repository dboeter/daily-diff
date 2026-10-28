import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DataFeed } from "../../core/config.ts";
import { type ReportedState, newItems, nextReportedState } from "../../core/report-state.ts";
import {
  type DataState,
  type VendorItem,
  asStateItem,
  fetchVendorData,
  fetchVendorFeeds,
  recentVendorItems,
} from "../../data/vendors.ts";
import { parseBigQueryNotes } from "../../data/bigquery.ts";

const fixture = (name: string) => fs.readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf-8");

afterEach(() => vi.restoreAllMocks());

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

describe("fetchVendorFeeds", () => {
  const feeds: DataFeed[] = [
    { name: "Azure Databricks", vendor: "databricks", url: "https://x/dbx.xml", parser: "rss" },
    {
      name: "Azure updates",
      vendor: "azure",
      url: "https://x/azure.xml",
      parser: "rss",
      categories: ["Databases", "Microsoft Fabric"],
    },
    { name: "BigQuery", vendor: "gcp", url: "https://x/down.xml", parser: "bigquery" },
  ];
  const now = new Date("2026-10-17T00:00:00Z");

  function stubFetch() {
    vi.spyOn(console, "log").mockImplementation(() => {});
    return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("dbx.xml")) return new Response(fixture("azure-databricks.xml"));
      if (url.endsWith("azure.xml")) return new Response(fixture("azure-updates.xml"));
      return new Response("", { status: 503 });
    });
  }

  it("dedupes a note listed twice under two guids, keeps future dates, and tags vendor and source", async () => {
    stubFetch();
    const { items } = await fetchVendorFeeds({ feeds }, now);
    const dbx = items.filter((i) => i.vendor === "databricks");
    expect(dbx.map((i) => i.date)).toEqual(["2026-10-19", "2026-10-16", "2026-10-15"]);
    expect(dbx[0]).toMatchObject({
      source: "Azure Databricks",
      title: "Saving an unchanged job no longer adds rows to the jobs system tables",
      categories: ["Product", "Jobs", "System tables & audit logs"],
    });
  });

  it("keeps only the RSS items in the feed's categories", async () => {
    stubFetch();
    const azure = (await fetchVendorFeeds({ feeds }, now)).items.filter((i) => i.vendor === "azure");
    expect(azure.map((i) => i.id)).toEqual(["573691"]);
    expect(azure[0]).toMatchObject({ source: "Azure updates", date: "2026-10-08" });
  });

  it("logs and skips a failing feed", async () => {
    stubFetch();
    const { items } = await fetchVendorFeeds({ feeds }, now);
    expect(items.some((i) => i.vendor === "gcp")).toBe(false);
    expect(console.log).toHaveBeenCalledWith("  [data] BigQuery failed: HTTP 503");
  });
});

describe("fetchVendorData", () => {
  const feeds: DataFeed[] = [
    { name: "Snowflake BCR", vendor: "snowflake", url: "https://x/bcr", parser: "snowflake-bcr" },
  ];
  const now = new Date("2026-10-17T00:00:00Z");
  const run = (state: DataState | null) => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(fixture("snowflake-bcr.html")));
    return fetchVendorData({ feeds }, now, { state, jev: { cache: { items: {} } } });
  };

  it("records a bundle first seen at a stage over 30 days old without reporting it", async () => {
    const data = await run(null);
    expect(data.items.map((i) => i.id)).toEqual(["snowflake-bcr:2026_08"]);
    expect(data.nextState!.reported).toEqual({ "snowflake-bcr:2026_08": "2026-10-17" });
    // The three 2026-09-09 bundles: stage saved, so they return only when it moves.
    expect(Object.keys(data.nextState!.stages!).sort()).toEqual([
      "snowflake-bcr:2026_05",
      "snowflake-bcr:2026_06",
      "snowflake-bcr:2026_07",
      "snowflake-bcr:2026_08",
    ]);
  });

  it("lists a reported bundle's end date once its plan gets a day, and follows a reschedule", async () => {
    const page = (planned: string) =>
      `<table><tr><th>Pending Changes</th></tr><tr><td><strong>2026_09</strong></td><td><p>Introduced in the 10.38 release (October 14-20, 2026) as Disabled by Default; account admins can enable for testing.</p><p>Status planned to change in ${planned} to Generally Enabled.</p></td></tr></table>`;
    const day = (date: string, planned: string, state: DataState | null) => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(page(planned)));
      return fetchVendorData({ feeds }, new Date(`${date}T01:00:00Z`), {
        state,
        jev: { cache: { items: {} } },
      });
    };
    const d1 = await day("2026-10-21", "a subsequent November 2026 release", null);
    expect(d1.items.map((i) => i.id)).toEqual(["snowflake-bcr:2026_09"]);
    expect(d1.nextState.actions).toEqual({});
    // Same stage, so not new again: the action still has to come from the fetched bundle.
    const d2 = await day("2026-10-22", "the 10.42 release (November 10-16, 2026)", d1.nextState);
    expect(d2.items).toEqual([]);
    expect(d2.observedState.actions?.["snowflake-bcr:2026_09"]?.date).toBe("2026-11-16");
    // buildDataReport adds the row summary; a reschedule keeps it.
    const saved = d2.observedState.actions!["snowflake-bcr:2026_09"]!;
    const d2State = {
      ...d2.observedState,
      actions: { "snowflake-bcr:2026_09": { ...saved, summary: "Test it." } },
    };
    const d3 = await day("2026-10-23", "the 10.43 release (November 17-23, 2026)", d2State);
    expect(d3.observedState.actions?.["snowflake-bcr:2026_09"]).toMatchObject({
      date: "2026-11-23",
      summary: "Test it.",
    });
    // Back to a month-only plan: no date to act by.
    const d4 = await day("2026-10-24", "a subsequent December 2026 release", d3.observedState);
    expect(d4.observedState.actions).toEqual({});
  });

  it("reports a known bundle whose stage moved, however old the stage date", async () => {
    const data = await run({ reported: {}, stages: { "snowflake-bcr:2026_07": "2026-08-01 Planned" } });
    expect(data.items.map((i) => i.id)).toEqual(["snowflake-bcr:2026_08", "snowflake-bcr:2026_07"]);
  });
});

describe("fetchVendorData across days", () => {
  const rss = (items: { guid: string; title: string; date: string }[]) =>
    `<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>${items
      .map(
        (i) =>
          `<item><title>${i.title}</title><link>https://x/${i.guid}</link><guid>${i.guid}</guid><pubDate>${new Date(`${i.date}T00:00:00Z`).toUTCString()}</pubDate><description>d</description></item>`,
      )
      .join("")}</channel></rss>`;
  const feeds: DataFeed[] = [
    { name: "Microsoft Fabric", vendor: "azure", url: "https://x/fabric.xml", parser: "rss", stableId: true },
    { name: "Azure Databricks", vendor: "databricks", url: "https://x/dbx.xml", parser: "rss" },
  ];
  type Note = { guid: string; title: string; date: string };
  const run = (day: string, fabric: Note[], dbx: Note[], state: DataState | null) => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input) => new Response(rss(String(input).endsWith("fabric.xml") ? fabric : dbx)),
    );
    return fetchVendorData({ feeds }, new Date(`${day}T01:00:00Z`), { state, jev: { cache: { items: {} } } });
  };
  const retiring = { guid: "ba-p/5374418", title: "Retirement of the custom tool: move to Fabric IQ" };

  it("marks over-cap items reported, except a coming-soon note, whose GA note must still show", async () => {
    const notes = Array.from({ length: 14 }, (_, i) => ({
      guid: `n${i}`,
      title: `Feature ${i} now available`,
      date: "2026-10-20",
    }));
    const soon = { guid: "soon", title: "Feature Z will soon be generally available", date: "2026-10-20" };
    const data = await run("2026-10-21", [], [...notes, soon], null);
    expect(data.items).toHaveLength(12);
    expect(data.alsoNew!.map((i) => i.title)).toEqual([
      "Feature 12 now available",
      "Feature 13 now available",
    ]);
    const reported = Object.keys(data.nextState.reported);
    expect(reported).toContain("feature 13 now available|2026-10-20");
    expect(reported.some((k) => k.includes("will soon be"))).toBe(false);
  });

  it("does not report a stable-id item again when its date moves", async () => {
    const first = await run("2026-10-20", [{ ...retiring, date: "2026-10-19" }], [], null);
    expect(first.items.map((i) => i.title)).toEqual([retiring.title]);
    const second = await run("2026-10-21", [{ ...retiring, date: "2026-10-20" }], [], first.nextState);
    expect(second.items).toEqual([]);
  });

  it("reads a stable-id item's title + date key saved before the change as reported", async () => {
    const legacy = {
      reported: { "retirement of the custom tool: move to fabric iq|2026-10-19": "2026-10-20" },
    };
    const data = await run("2026-10-21", [{ ...retiring, date: "2026-10-19" }], [], legacy);
    expect(data.items).toEqual([]);
    // The old key's day moves to the guid, so a later date edit is still not new.
    expect(data.observedState.reported["ba-p/5374418"]).toBe("2026-10-20");
    const moved = await run("2026-10-22", [{ ...retiring, date: "2026-10-21" }], [], data.observedState);
    expect(moved.items).toEqual([]);
  });

  it("still keys an Azure Databricks note on title + date, so a second guid is not new", async () => {
    const note = { title: "Lakebase replication is generally available", date: "2026-10-19" };
    const first = await run("2026-10-20", [], [{ ...note, guid: "topic#a" }], null);
    expect(first.items).toHaveLength(1);
    const second = await run("2026-10-21", [], [{ ...note, guid: "month#a" }], first.nextState);
    expect(second.items).toEqual([]);
  });

  const comingSoon = {
    guid: "whats-coming#pkg",
    title: "Workspace-level package repositories for Databricks Apps will soon be generally available",
    date: "2026-10-14",
  };
  const ga = {
    guid: "october#pkg",
    title: "Workspace-level package repositories for Databricks Apps are generally available",
    date: "2026-10-14",
  };

  it("does not report a GA note after its coming-soon note was reported on an earlier day", async () => {
    const first = await run("2026-10-20", [], [comingSoon], null);
    expect(first.items.map((i) => i.title)).toEqual([comingSoon.title]);
    const second = await run("2026-10-21", [], [comingSoon, ga], first.nextState);
    expect(second.items).toEqual([]);
  });

  it("reports both when the coming-soon and GA notes arrive on the same day", async () => {
    const data = await run("2026-10-21", [], [comingSoon, ga], null);
    expect(data.items.map((i) => i.title).sort()).toEqual([ga.title, comingSoon.title].sort());
  });

  it("keeps a reported deprecation's end date in the state until it passes; one without a date is not kept", async () => {
    const ask = vi.fn(async (_s: unknown, questions: object) => ({
      model: "m",
      answers: {
        real_change: { noul: 1 },
        deprecation: { noul: 1 },
        ai_in_data: { noul: 0 },
        significance: { score: 2 },
        ...("end_date" in questions ? { end_date: { choice: "2026-11-19" } } : {}),
      },
    }));
    const notes = [
      { guid: "a", title: "Model X is scheduled for retirement on November 19, 2026", date: "2026-10-19" },
      { guid: "b", title: "Legacy tab is deprecated", date: "2026-10-19" },
    ];
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(rss(notes)));
    const jev = { apiKey: "k", cache: { items: {} }, ask };
    const day1 = await fetchVendorData({ feeds: [feeds[1]!] }, new Date("2026-10-21T01:00:00Z"), {
      state: null,
      jev,
    });
    expect(day1.nextState.actions).toEqual({
      a: { date: "2026-11-19", title: notes[0]!.title, link: "https://x/a", source: "Azure Databricks" },
    });
    // A quiet day keeps it; the day after it passes drops it.
    const quiet = await fetchVendorData({ feeds: [] }, new Date("2026-11-19T01:00:00Z"), {
      state: day1.nextState,
      jev,
    });
    expect(Object.keys(quiet.observedState.actions ?? {})).toEqual(["a"]);
    const after = await fetchVendorData({ feeds: [] }, new Date("2026-11-20T01:00:00Z"), {
      state: day1.nextState,
      jev,
    });
    expect(after.observedState.actions).toEqual({});
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

  it("does not report a BigQuery note again under the title + date key saved before its label", () => {
    const notes = parseBigQueryNotes(fixture("bigquery.xml"))
      .filter((n) => n.date === "2026-10-15")
      .map((n): VendorItem => ({ ...n, vendor: "gcp", source: "BigQuery" }));
    const state = {
      reported: { "feature: you can copy tables across regions.|2026-10-15": "2026-10-15" },
      stages: {},
    };
    expect(notes[0]!.title).toBe("You can copy tables across regions (GA)");
    expect(newVendorItems(notes, state, DATE).map((i) => i.title)).not.toContain(notes[0]!.title);
    expect(newVendorItems(notes, state, DATE)).toHaveLength(notes.length - 1);
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
