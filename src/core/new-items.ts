/**
 * The new-items pipeline of Policy Watch and the data report's vendor feeds:
 * fetch, keep what the state has not reported, record the record-only stage
 * items, select the rest (Jev or keywords), and the order the files are saved
 * in. Each report supplies the fetch, the state item and the selection.
 *
 * The save protocol (`planWrites`, `commitWrites`): the trace and the verdicts
 * on every run, before any no-report skip, so dropped items are not asked again
 * tomorrow; the observed state (record-only stages, plus the report's own
 * fields) on a successful fetch; the reported state only once the report exists.
 */

import { saveFile } from "./report.ts";
import { saveItemsFile, type ItemsFile, type RankedBy } from "./jev.ts";
import {
  newItems,
  nextReportedState,
  saveReportedState,
  type ReportedState,
  type StateItem,
} from "./report-state.ts";

/** What a report's selection returns (`selectPolicyItems`, `selectVendorItems`). */
export interface Selection<I, V extends ItemsFile<unknown>, A = never> {
  /** The kept items, in the report's order. */
  items: I[];
  /** Kept but over the report's cap: listed without a row and marked reported with the kept items. */
  alsoNew?: A[];
  /** "keywords" when there was no key or more than half the new calls failed. */
  rankedBy: RankedBy;
  /** null when the verdict file was malformed: it is left as it is. */
  nextVerdicts: V | null;
  /** The day's `*-ranking.json` trace: every new item, kept or dropped. */
  rankingFile: string;
}

export interface NewItems<I, S extends ReportedState, V extends ItemsFile<unknown>, A = never> {
  /** The kept items, in the selection's order. */
  items: I[];
  /** The selection's `alsoNew`; absent on a failed fetch. */
  alsoNew?: A[];
  /** False when every source failed, or the pipeline threw. */
  fetchSuccess: boolean;
  /** Absent when nothing was selected (a failed fetch). */
  rankedBy?: RankedBy;
  /** Saved once the report exists: today's kept (and `alsoNew`) items marked reported. */
  nextState: S;
  /** `nextState` without today's kept items. Saved on every successful fetch, so a quiet day keeps it. */
  observedState: S;
  nextVerdicts?: V | null;
  /** The day's trace; absent when there were no candidates. */
  rankingFile?: string;
}

/** The fields a report adds to its state; `kept` is [] for the observed state. */
type Extend<S, I, F> = (kept: I[], fetched: F[]) => Omit<S, keyof ReportedState>;

/**
 * Fetch, filter on the state and select. A stage item the report marked
 * `recordOnly` is recorded in the state without being selected or reported.
 * Never throws: a failing step logs and returns `fetchSuccess: false`, with
 * states that only prune.
 */
export async function collectNewItems<
  F extends { recordOnly?: boolean },
  I extends F,
  S extends ReportedState,
  V extends ItemsFile<unknown>,
  A extends F = never,
>(opts: {
  tag: string;
  state: S | null;
  dateStr: string;
  fetch: () => Promise<{ items: F[]; fetchSuccess: boolean }>;
  /** How the state keys and dates an item. */
  stateItem: (item: F) => StateItem;
  select: (candidates: F[]) => Promise<Selection<I, V, A>>;
  extend?: Extend<S, I, F>;
}): Promise<NewItems<I, S, V, A>> {
  const { tag, state, dateStr, stateItem } = opts;
  // `extend` sees the kept items only: an over-cap item has no row to carry its fields.
  const stateFor = (kept: I[], recorded: F[], fetched: F[], alsoNew: A[] = []): S =>
    ({
      ...nextReportedState(
        state,
        [...kept, ...alsoNew].map(stateItem),
        dateStr,
        recorded.map(stateItem),
        fetched.map(stateItem),
      ),
      ...opts.extend?.(kept, fetched),
    }) as S;
  try {
    const { items: fetched, fetchSuccess } = await opts.fetch();
    const freshIds = new Set(newItems(fetched.map(stateItem), state, dateStr).map((i) => i.id));
    const fresh = fetched.filter((i) => freshIds.has(stateItem(i).id));
    const recorded = fresh.filter((i) => i.recordOnly);
    const candidates = fresh.filter((i) => !i.recordOnly);
    const selection = await opts.select(candidates);
    return {
      items: selection.items,
      ...(selection.alsoNew ? { alsoNew: selection.alsoNew } : {}),
      fetchSuccess,
      rankedBy: selection.rankedBy,
      // Only the kept items: a dropped one is not reported, and its saved verdict stops it being asked again.
      // Over-cap ones too, else they return the next day and push that day's items out (2026-10-22).
      nextState: stateFor(selection.items, recorded, fetched, selection.alsoNew),
      observedState: stateFor([], recorded, fetched),
      nextVerdicts: selection.nextVerdicts,
      ...(candidates.length > 0 ? { rankingFile: selection.rankingFile } : {}),
    };
  } catch (err) {
    console.error(`  [${tag}] Failed: ${err}`);
    const pruned = stateFor([], [], []);
    return { items: [], fetchSuccess: false, nextState: pruned, observedState: pruned };
  }
}

// ---------------------------------------------------------------------------
// Save protocol
// ---------------------------------------------------------------------------

export type Write =
  | { kind: "trace"; content: string }
  | { kind: "verdicts"; cache: ItemsFile<unknown> }
  | { kind: "state"; state: ReportedState };

/** Where a report's writes go; `trace` is a file name in the day's digest folder. */
export interface ReportFiles {
  state: string;
  verdicts: string;
  trace: string;
}

/**
 * `onFetched`: committed by the builder before it decides whether there is a
 * report. `onReported`: once the report exists (the observed state's
 * successor, so it is also written after a failed fetch: it then only prunes).
 */
export function planWrites(
  data: Pick<
    NewItems<unknown, ReportedState, ItemsFile<unknown>>,
    "fetchSuccess" | "nextState" | "observedState" | "nextVerdicts" | "rankingFile"
  >,
): { onFetched: Write[]; onReported: Write[] } {
  return {
    onFetched: [
      ...(data.rankingFile ? [{ kind: "trace" as const, content: data.rankingFile }] : []),
      ...(data.nextVerdicts ? [{ kind: "verdicts" as const, cache: data.nextVerdicts }] : []),
      ...(data.fetchSuccess ? [{ kind: "state" as const, state: data.observedState }] : []),
    ],
    onReported: [{ kind: "state", state: data.nextState }],
  };
}

export function commitWrites(writes: Write[], files: ReportFiles, dateStr: string): void {
  for (const w of writes) {
    if (w.kind === "trace") console.log(`  Saved ${saveFile(w.content, dateStr, files.trace)}`);
    else if (w.kind === "verdicts") saveItemsFile(w.cache, files.verdicts);
    else saveReportedState(w.state, files.state);
  }
}
