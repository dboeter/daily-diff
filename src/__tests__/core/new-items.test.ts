import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import { collectNewItems, commitWrites, planWrites } from "../../core/new-items.ts";
import { judgeItems, loadItemsFile, type VerdictCache } from "../../core/jev.ts";
import { loadReportedState, type ReportedState } from "../../core/report-state.ts";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "new-items-"));
// The trace goes through llm.ts's saveFile, which writes under digests/: kept in the temp dir here.
vi.mock("../../core/llm.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../core/llm.ts")>()),
  saveFile: (content: string, ...segments: string[]) => {
    const file = path.join(dir, "digests", ...segments);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    return file;
  },
}));

interface Item {
  id: string;
  title: string;
  published: string;
  stage?: string;
  recordOnly?: boolean;
}
type A = { keep: number };
const DATE = "2026-10-18";
const item = (id: string, over: Partial<Item> = {}): Item => ({
  id,
  title: `Title ${id}`,
  published: "2026-10-17",
  ...over,
});
/** Jev keeps the items whose title says "keep". */
const ask = vi.fn(async (state: unknown) => ({
  model: "jev-1.0",
  answers: { keep: (state as { title: string }).title.includes("keep") ? 1 : 0 } as unknown,
}));

function run(items: Item[] | null, state: ReportedState | null, cache: VerdictCache<A> = { items: {} }) {
  return collectNewItems({
    tag: "test",
    state,
    dateStr: DATE,
    fetch: async () => ({ items: items ?? [], fetchSuccess: items !== null }),
    stateItem: (i: Item) => i,
    select: async (candidates) => {
      const j = await judgeItems(candidates, {
        tag: "test",
        request: (i) => ({ state: { title: i.title }, questions: {} }),
        decide: (a: A) => ({ relevance: a.keep, keep: a.keep > 0.5 }),
        apiKey: "k",
        cache,
        dateStr: DATE,
        unseenDays: 30,
        ask,
      });
      return {
        items: candidates.filter((i) => j.verdicts.get(i.id)?.keep),
        rankedBy: j.rankedBy,
        nextVerdicts: j.nextCache,
        traceFile: j.traceFile([], {}),
      };
    },
  });
}

/** A fresh set of files per test. */
function filesFor(name: string) {
  const files = {
    state: path.join(dir, `${name}-state.json`),
    verdicts: path.join(dir, `${name}-verdicts.json`),
    trace: `${name}-trace.json`,
  };
  return {
    files,
    trace: () => path.join(dir, "digests", DATE, files.trace),
    state: () => loadReportedState(files.state),
  };
}

describe("collectNewItems", () => {
  it("selects the new items, records record-only ones and keeps only the selected in nextState", async () => {
    const data = await run(
      [
        item("keep-1", { title: "keep this" }),
        item("drop-1"),
        item("seen", { title: "keep" }),
        item("old", { stage: "Adopted", published: "2026-07-01", recordOnly: true }),
      ],
      { reported: { seen: "2026-10-17" }, stages: {} },
    );
    expect(data.items.map((i) => i.id)).toEqual(["keep-1"]);
    expect(ask).not.toHaveBeenCalledWith(expect.objectContaining({ title: "Title old" }), {}, "k");
    expect(data.nextState).toEqual({
      reported: { seen: "2026-10-17", "keep-1": DATE },
      stages: { old: "2026-07-01 Adopted" },
    });
    expect(data.observedState).toEqual({
      reported: { seen: "2026-10-17" },
      stages: { old: "2026-07-01 Adopted" },
    });
    expect(Object.keys(data.nextVerdicts!.items)).toEqual(["keep-1", "drop-1"]);
  });

  it("marks the over-cap items reported in nextState only", async () => {
    const data = await collectNewItems({
      tag: "test",
      state: null,
      dateStr: DATE,
      fetch: async () => ({ items: [item("row"), item("over")], fetchSuccess: true }),
      stateItem: (i: Item) => i,
      select: async ([row, over]) => ({
        items: [row!],
        alsoNew: [over!],
        rankedBy: "jev",
        nextVerdicts: null,
        traceFile: "",
      }),
    });
    expect(data.alsoNew!.map((i) => i.id)).toEqual(["over"]);
    expect(data.nextState.reported).toEqual({ row: DATE, over: DATE });
    expect(data.observedState.reported).toEqual({});
  });

  it("returns fetchSuccess false instead of throwing when a step fails", async () => {
    const data = await collectNewItems({
      tag: "test",
      state: null,
      dateStr: DATE,
      fetch: async () => Promise.reject(new Error("state broken")),
      stateItem: (i: Item) => i,
      select: async () => Promise.reject(new Error("unreachable")),
    });
    expect(data).toMatchObject({ items: [], fetchSuccess: false, nextState: { reported: {}, stages: {} } });
  });
});

describe("save protocol", () => {
  it("writes the trace and the verdicts before a no-items return, and the observed state", async () => {
    const f = filesFor("quiet");
    const data = await run([item("drop-1"), item("old", { stage: "Adopted", recordOnly: true })], null);
    expect(data.items).toEqual([]);
    // The builder commits `onFetched`, then finds nothing to report and stops.
    commitWrites(planWrites(data).onFetched, f.files, DATE);
    expect(fs.existsSync(f.trace())).toBe(true);
    expect(Object.keys(loadItemsFile(f.files.verdicts, "test")!.items)).toEqual(["drop-1"]);
    expect(f.state()).toEqual({ reported: {}, stages: { old: "2026-10-17 Adopted" } });
  });

  it("marks the kept items reported only after onReported", async () => {
    const f = filesFor("report");
    const data = await run([item("keep-1", { title: "keep" })], null);
    const writes = planWrites(data);
    commitWrites(writes.onFetched, f.files, DATE);
    expect(f.state()).toEqual({ reported: {}, stages: {} });
    commitWrites(writes.onReported, f.files, DATE);
    expect(f.state()).toEqual({ reported: { "keep-1": DATE }, stages: {} });
  });

  it("writes no state after a failed fetch", async () => {
    const f = filesFor("failed");
    const data = await run(null, { reported: { a: "2026-10-17" } });
    expect(data.fetchSuccess).toBe(false);
    commitWrites(planWrites(data).onFetched, f.files, DATE);
    expect(fs.existsSync(f.files.state)).toBe(false);
  });

  it("orders the writes: trace, verdicts, observed state; then the reported state", async () => {
    const data = await run([item("keep-1", { title: "keep" })], null);
    const writes = planWrites(data);
    expect(writes.onFetched.map((w) => w.kind)).toEqual(["trace", "verdicts", "state"]);
    expect(writes.onReported).toEqual([{ kind: "state", state: data.nextState }]);
  });
});
