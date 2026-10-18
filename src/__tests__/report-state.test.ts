import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  loadReportedState,
  newItems,
  nextReportedState,
  saveReportedState,
  staleOnFirstSight,
  type StateItem,
} from "../report-state.ts";

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
