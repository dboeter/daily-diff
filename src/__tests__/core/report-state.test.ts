import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  type StateItem,
  loadReportedState,
  markStaleOnFirstSight,
  newItems,
  nextDeadlines,
  nextReportedState,
  saveReportedState,
  staleOnFirstSight,
} from "../../core/report-state.ts";

const item = (id: string, published = "2026-10-13T08:00:00.000Z"): StateItem => ({ id, published });

describe("newItems", () => {
  it("everything is new without state", () => {
    expect(newItems([item("a"), item("b")], null, "2026-10-14").map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("skips items an earlier day reported", () => {
    const state = { reported: { a: "2026-10-13" } };
    expect(newItems([item("a"), item("b")], state, "2026-10-14").map((i) => i.id)).toEqual(["b"]);
  });

  it("a same-day re-run reports the same items again", () => {
    const state = nextReportedState(null, [item("a"), item("b")], "2026-10-14");
    expect(newItems([item("a"), item("b")], state, "2026-10-14").map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("newItems with stages", () => {
  const staged = (stage: string, published = "2026-07-24T00:00:00.000Z"): StateItem => ({
    ...item("ep:2025/0359(COD)", published),
    stage,
  });
  const reportedOn = (day: string) =>
    nextReportedState(null, [staged("Published in the Official Journal")], day);

  it("skips an item whose stage has not changed, also after its reported day is pruned", () => {
    const state = { ...reportedOn("2026-08-01"), reported: {} };
    expect(newItems([staged("Published in the Official Journal")], state, "2026-10-14")).toEqual([]);
  });

  it("reports an item again when its stage moves", () => {
    const moved = staged("Signed", "2026-10-13T00:00:00.000Z");
    expect(newItems([moved], reportedOn("2026-10-01"), "2026-10-14")).toEqual([moved]);
  });

  it("a same-day re-run reports the same stage again", () => {
    const it0 = staged("Published in the Official Journal");
    expect(newItems([it0], reportedOn("2026-10-14"), "2026-10-14")).toEqual([it0]);
  });
});

describe("nextReportedState", () => {
  it("records a stage change as reported today and never prunes stages", () => {
    const before = {
      reported: { a: "2026-10-01" },
      stages: { a: "2026-10-01 Trilogue", old: "2024-01-01 Signed" },
    };
    const a = { ...item("a", "2026-10-13T00:00:00.000Z"), stage: "Signed" };
    const state = nextReportedState(before, [a], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-14" });
    expect(state.stages).toEqual({ a: "2026-10-13 Signed", old: "2024-01-01 Signed" });
  });

  it("records each reported item with the day it was first reported", () => {
    const state = nextReportedState({ reported: { a: "2026-10-13" } }, [item("b")], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-13", b: "2026-10-14" });
  });

  it("keeps the first-reported day on a same-day re-run", () => {
    const state = nextReportedState({ reported: { a: "2026-10-14" } }, [item("a")], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-14" });
  });

  it("prunes ids reported more than 30 days ago", () => {
    const state = nextReportedState(
      { reported: { old: "2026-09-13", kept: "2026-09-14" } },
      [],
      "2026-10-14",
    );
    expect(state.reported).toEqual({ kept: "2026-09-14" });
  });
});

describe("state file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "report-state-"));
  const file = path.join(dir, "state.json");

  it("round-trips", () => {
    saveReportedState({ reported: { a: "2026-10-14" } }, file);
    expect(loadReportedState(file)).toEqual({ reported: { a: "2026-10-14" }, stages: {} });
  });

  it("reads a state saved before stages existed", () => {
    const file = path.join(dir, "old.json");
    fs.writeFileSync(file, JSON.stringify({ reported: { a: "2026-10-13" } }));
    expect(loadReportedState(file)).toEqual({ reported: { a: "2026-10-13" }, stages: {} });
  });

  it("missing or malformed reads as no state", () => {
    expect(loadReportedState(path.join(dir, "missing.json"))).toBeNull();
    fs.writeFileSync(file, "{ not json");
    expect(loadReportedState(file)).toBeNull();
    fs.writeFileSync(file, '{"reported": []}');
    expect(loadReportedState(file)).toBeNull();
  });
});

describe("staleOnFirstSight", () => {
  it("records a stage over 30 days old only when the state has never seen the item", () => {
    const ctx = { state: { reported: {}, stages: { seen: "2026-01-01 Signed" } }, dateStr: "2026-10-14" };
    expect(staleOnFirstSight(ctx, "new", "2026-09-13")).toBe(true);
    expect(staleOnFirstSight(ctx, "new", "2026-09-14")).toBe(false);
    expect(staleOnFirstSight(ctx, "seen", "2026-01-01")).toBe(false);
    expect(staleOnFirstSight({ state: null, dateStr: "2026-10-14" }, "new", "")).toBe(true);
  });
});

describe("markStaleOnFirstSight", () => {
  it("marks a stale item recordOnly and returns a fresh one unchanged", () => {
    const ctx = { state: { reported: {}, stages: {} }, dateStr: "2026-10-14" };
    const it_ = { id: "new", title: "T" };
    expect(markStaleOnFirstSight(ctx, it_, "2026-09-13")).toEqual({ ...it_, recordOnly: true });
    expect(markStaleOnFirstSight(ctx, it_, "2026-09-14")).toBe(it_);
  });
});

describe("nextDeadlines", () => {
  const deadlineItem = (id: string, deadline?: string) => ({
    id,
    title: `Title ${id}`,
    link: `https://example.eu/${id}`,
    published: "2026-10-01",
    source: "Have your say",
    ...(deadline ? { deadline } : {}),
  });
  const prev = {
    old: { date: "2026-10-13", title: "Closed yesterday", link: "l", source: "s" },
    kept: { date: "2026-11-01", title: "Reported last week", link: "l", source: "s" },
    moved: { date: "2026-10-20", title: "Extended", link: "l", source: "s" },
    gone: { date: "2026-10-30", title: "Withdrawn", link: "l", source: "s" },
  };

  it("keeps earlier open deadlines, adds today's, updates moved ones and drops passed or removed ones", () => {
    const next = nextDeadlines(
      prev,
      [deadlineItem("new", "2026-10-25"), deadlineItem("nodeadline")],
      [deadlineItem("moved", "2026-10-27"), deadlineItem("gone"), deadlineItem("new", "2026-10-25")],
      "2026-10-14",
    );
    expect(Object.keys(next).sort()).toEqual(["kept", "moved", "new"]);
    expect(next["moved"]?.date).toBe("2026-10-27");
    expect(next["new"]).toEqual({
      date: "2026-10-25",
      title: "Title new",
      link: "https://example.eu/new",
      source: "Have your say",
    });
  });

  it("does not add a fetched item that was never reported", () => {
    expect(nextDeadlines({}, [], [deadlineItem("dropped", "2026-10-25")], "2026-10-14")).toEqual({});
  });
});
