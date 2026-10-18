import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  newPolicyItems,
  nextPolicyState,
  loadPolicyState,
  savePolicyState,
  fetchPolicyData,
  type PolicyItem,
} from "../policy.ts";
import type { PolicyConfig } from "../config.ts";

const item = (id: string, published = "2026-10-13T08:00:00.000Z"): PolicyItem => ({
  id,
  title: `Title ${id}`,
  link: `https://example.eu/${id}`,
  published,
  description: "",
  source: "Commission",
  jurisdiction: "eu",
  jevOnly: false,
});

describe("newPolicyItems", () => {
  it("everything is new without state", () => {
    expect(newPolicyItems([item("a"), item("b")], null, "2026-10-14").map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("skips items an earlier day reported", () => {
    const state = { reported: { a: "2026-10-13" } };
    expect(newPolicyItems([item("a"), item("b")], state, "2026-10-14").map((i) => i.id)).toEqual(["b"]);
  });

  it("a same-day re-run reports the same items again", () => {
    const state = nextPolicyState(null, [item("a"), item("b")], "2026-10-14");
    expect(newPolicyItems([item("a"), item("b")], state, "2026-10-14").map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("newPolicyItems with stages", () => {
  const staged = (stage: string, published = "2026-07-24T00:00:00.000Z"): PolicyItem => ({
    ...item("ep:2025/0359(COD)", published),
    stage,
  });
  const reportedOn = (day: string) =>
    nextPolicyState(null, [staged("Published in the Official Journal")], day);

  it("skips an item whose stage has not changed, also after its reported day is pruned", () => {
    const state = { ...reportedOn("2026-08-01"), reported: {} };
    expect(newPolicyItems([staged("Published in the Official Journal")], state, "2026-10-14")).toEqual([]);
  });

  it("reports an item again when its stage moves", () => {
    const moved = staged("Signed", "2026-10-13T00:00:00.000Z");
    expect(newPolicyItems([moved], reportedOn("2026-10-01"), "2026-10-14")).toEqual([moved]);
  });

  it("a same-day re-run reports the same stage again", () => {
    const it0 = staged("Published in the Official Journal");
    expect(newPolicyItems([it0], reportedOn("2026-10-14"), "2026-10-14")).toEqual([it0]);
  });
});

describe("nextPolicyState", () => {
  it("records a stage change as reported today and never prunes stages", () => {
    const before = {
      reported: { a: "2026-10-01" },
      stages: { a: "2026-10-01 Trilogue", old: "2024-01-01 Signed" },
    };
    const a = { ...item("a", "2026-10-13T00:00:00.000Z"), stage: "Signed" };
    const state = nextPolicyState(before, [a], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-14" });
    expect(state.stages).toEqual({ a: "2026-10-13 Signed", old: "2024-01-01 Signed" });
  });

  it("records each reported item with the day it was first reported", () => {
    const state = nextPolicyState({ reported: { a: "2026-10-13" } }, [item("b")], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-13", b: "2026-10-14" });
  });

  it("keeps the first-reported day on a same-day re-run", () => {
    const state = nextPolicyState({ reported: { a: "2026-10-14" } }, [item("a")], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-14" });
  });

  it("prunes ids reported more than 30 days ago", () => {
    const state = nextPolicyState({ reported: { old: "2026-09-13", kept: "2026-09-14" } }, [], "2026-10-14");
    expect(state.reported).toEqual({ kept: "2026-09-14" });
  });
});

describe("policy state file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "policy-state-"));
  const file = path.join(dir, "policy-state.json");

  it("round-trips", () => {
    savePolicyState({ reported: { a: "2026-10-14" } }, file);
    expect(loadPolicyState(file)).toEqual({ reported: { a: "2026-10-14" }, stages: {} });
  });

  it("reads a state saved before stages existed", () => {
    const file = path.join(dir, "old.json");
    fs.writeFileSync(file, JSON.stringify({ reported: { a: "2026-10-13" } }));
    expect(loadPolicyState(file)).toEqual({ reported: { a: "2026-10-13" }, stages: {} });
  });

  it("missing or malformed reads as no state", () => {
    expect(loadPolicyState(path.join(dir, "missing.json"))).toBeNull();
    fs.writeFileSync(file, "{ not json");
    expect(loadPolicyState(file)).toBeNull();
    fs.writeFileSync(file, '{"reported": []}');
    expect(loadPolicyState(file)).toBeNull();
  });
});

describe("fetchPolicyData", () => {
  afterEach(() => vi.restoreAllMocks());
  const config: PolicyConfig = {
    readerProfile: "A practitioner.",
    watchlist: { eu: [], nl: [], usFederal: [], usStates: [] },
    feeds: [
      {
        name: "Commission",
        url: "https://example.eu/rss.xml",
        jurisdiction: "eu",
        jevOnly: false,
        news: false,
      },
    ],
    dataLaw: [],
    calendar: [],
  };
  const rss = (ids: [string, string][]) =>
    `<rss><channel>${ids
      .map(
        ([id, date]) =>
          `<item><title>${id}</title><link>https://x/${id}</link><guid>${id}</guid><pubDate>${date}</pubDate></item>`,
      )
      .join("")}</channel></rss>`;
  const noul = (n: number) => ({ noul: n });
  // Jev keeps "new AI rules" and drops "new event".
  const ask = vi.fn(async (state: unknown) => {
    const keep = (state as { title: string }).title === "new AI rules";
    return {
      model: "jev-1.0",
      answers: {
        about_ai_policy: noul(keep ? 1 : 0),
        binding: noul(1),
        new_stage: noul(1),
        significance: { score: 2 },
      } as unknown,
    };
  });

  it("scores new items within the news age limit and records only the kept ones", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        rss([
          ["new AI rules", "Tue, 13 Oct 2026 08:00:00 +0000"],
          ["new event", "Tue, 13 Oct 2026 09:00:00 +0000"],
          ["seen", "Mon, 12 Oct 2026 08:00:00 +0000"],
          ["stale", "Mon, 05 Oct 2026 08:00:00 +0000"],
        ]),
      ),
    );
    const data = await fetchPolicyData(
      config,
      new Date("2026-10-13T23:00:00Z"),
      "2026-10-14",
      { reported: { seen: "2026-10-13" } },
      { apiKey: "k", cache: { items: {} }, ask },
      [],
    );
    expect(data.fetchSuccess).toBe(true);
    expect(ask).toHaveBeenCalledTimes(2);
    expect(data.rankedBy).toBe("jev");
    expect(data.items.map((i) => [i.id, i.source, i.jurisdiction])).toEqual([
      ["new AI rules", "Commission", "eu"],
    ]);
    expect(data.nextState.reported).toEqual({ seen: "2026-10-13", "new AI rules": "2026-10-14" });
    expect(Object.keys(data.nextVerdicts!.items)).toEqual(["new AI rules", "new event"]);
  });

  it("adds registered sources' items, groups them by jurisdiction and survives a failing source", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(rss([["new AI rules", "Tue, 13 Oct 2026 08:00:00 +0000"]])),
    );
    const nl = { ...item("nl-motion"), title: "new AI rules", jurisdiction: "nl" as const };
    const act = { ...item("eu-act"), title: "new AI rules", stage: "Regulation adopted" };
    const procedure = { ...item("ep:1"), title: "new AI rules", stage: "Trilogue" };
    const fetchStages = vi.fn(async () => [nl, procedure, act]);
    const data = await fetchPolicyData(
      config,
      new Date("2026-10-13T23:00:00Z"),
      "2026-10-14",
      { reported: {}, stages: { "ep:1": "2026-10-13 Trilogue" } },
      { apiKey: "test-key", cache: { items: {} }, ask },
      [
        { name: "Stages", fetch: fetchStages },
        { name: "Broken", fetch: async () => Promise.reject(new Error("HTTP 500")) },
      ],
    );
    expect(fetchStages).toHaveBeenCalledWith(expect.objectContaining({ dateStr: "2026-10-14", config }));
    // The procedure's stage is unchanged, so it is not new; EU items come before NL ones.
    expect(data.items.map((i) => i.id)).toEqual(["eu-act", "new AI rules", "nl-motion"]);
    expect(data.nextState.stages).toEqual({
      "ep:1": "2026-10-13 Trilogue",
      "eu-act": "2026-10-13 Regulation adopted",
    });
    expect(data.fetchSuccess).toBe(true);
  });

  it("records a record-only stage item in the state without scoring or reporting it", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(rss([])));
    const old = { ...item("nl:1", "2026-08-01"), stage: "Passed the Tweede Kamer", recordOnly: true };
    const askOld = vi.fn(ask.getMockImplementation()!);
    const data = await fetchPolicyData(
      config,
      new Date("2026-10-13T23:00:00Z"),
      "2026-10-14",
      null,
      { apiKey: "test-key", cache: { items: {} }, ask: askOld },
      [{ name: "NL", fetch: async () => [old] }],
    );
    expect(data.items).toEqual([]);
    expect(askOld).not.toHaveBeenCalled();
    expect(data.nextState).toMatchObject({
      reported: {},
      stages: { "nl:1": "2026-08-01 Passed the Tweede Kamer" },
    });
  });

  it("observes stages and deadline changes without marking kept items as reported", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(rss([["new AI rules", "Tue, 13 Oct 2026 08:00:00 +0000"]])),
    );
    const old = { ...item("nl:1", "2026-08-01"), stage: "Passed the Tweede Kamer", recordOnly: true };
    // Reported before, its stage unchanged: not new, but its feedback period was extended.
    const extended = { ...item("hys:1"), stage: "Open for feedback", deadline: "2026-11-20" };
    const closed = { ...item("hys:2"), stage: "Open for feedback" };
    const saved = { title: "T", link: "https://x", source: "Have your say" };
    const data = await fetchPolicyData(
      config,
      new Date("2026-10-13T23:00:00Z"),
      "2026-10-14",
      {
        reported: { "hys:1": "2026-10-13", "hys:2": "2026-10-13" },
        stages: { "hys:1": "2026-10-13 Open for feedback", "hys:2": "2026-10-13 Open for feedback" },
        deadlines: {
          "hys:1": { ...saved, date: "2026-11-01" },
          "hys:2": { ...saved, date: "2026-11-02" },
        },
      },
      { apiKey: "k", cache: { items: {} }, ask },
      [{ name: "Stages", fetch: async () => [old, extended, closed] }],
    );
    expect(data.items.map((i) => i.id)).toEqual(["new AI rules"]);
    expect(data.observedState).toEqual({
      reported: { "hys:1": "2026-10-13", "hys:2": "2026-10-13" },
      stages: {
        "hys:1": "2026-10-13 Open for feedback",
        "hys:2": "2026-10-13 Open for feedback",
        "nl:1": "2026-08-01 Passed the Tweede Kamer",
      },
      deadlines: {
        "hys:1": {
          date: "2026-11-20",
          title: "Title hys:1",
          link: "https://example.eu/hys:1",
          source: "Commission",
        },
      },
    });
    expect(data.nextState.reported["new AI rules"]).toBe("2026-10-14");
  });

  it("reports a failed feed as fetchSuccess false instead of throwing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 503 }));
    const data = await fetchPolicyData(
      config,
      new Date("2026-10-13T23:00:00Z"),
      "2026-10-14",
      null,
      { cache: { items: {} } },
      [],
    );
    expect(data.fetchSuccess).toBe(false);
    expect(data.items).toEqual([]);
  });

  it("marks news-feed items and puts them after every jurisdiction's items", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (url) =>
        new Response(
          rss([[String(url).includes("politico") ? "news" : "rules", "Tue, 13 Oct 2026 08:00:00 +0000"]]),
        ),
    );
    const keepAll = vi.fn(async () => ({
      model: "jev-1.0",
      answers: {
        about_ai_policy: noul(1),
        binding: noul(1),
        new_stage: noul(1),
        significance: { score: 2 },
        impact: { score: 2 },
      } as unknown,
    }));
    const data = await fetchPolicyData(
      {
        ...config,
        feeds: [
          {
            name: "Politico",
            url: "https://politico/rss",
            jurisdiction: "us_federal",
            jevOnly: false,
            news: true,
          },
          { name: "Agency", url: "https://agency/rss", jurisdiction: "other", jevOnly: false, news: false },
        ],
      },
      new Date("2026-10-13T23:00:00Z"),
      "2026-10-14",
      null,
      { apiKey: "test-key", cache: { items: {} }, ask: keepAll },
      [],
    );
    expect(data.items.map((i) => [i.id, i.news])).toEqual([
      ["rules", false],
      ["news", true],
    ]);
  });
});
