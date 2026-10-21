/**
 * Which items a report has already shown: the state behind Policy Watch
 * (`digests/policy-state.json`) and the data report's vendor feeds
 * (`digests/data-state.json`). An item is new until a run reports it; a stage
 * item (one with a `stage`) is new again when its stage moves. A same-day
 * re-run reports the same items, as the ArXiv state does.
 */

import fs from "node:fs";
import path from "node:path";
import { daysBefore } from "./date.ts";

export interface ReportedState {
  /** Item id → the CST date it was first reported (for a stage item: the day its stage last changed). */
  reported: Record<string, string>;
  /**
   * Stage item id → its last reported `stageKey`. Never pruned: a procedure can
   * stall for months, and an id missing for a day (a failed fetch) must not
   * re-report its stage. Renaming a stage's display text re-reports each item once.
   */
  stages?: Record<string, string>;
}

/**
 * What the state reads of an item; `published` dates a stage item's stage.
 * `aliases`: keys the state may hold the item under from before its key
 * changed; one in `reported` counts as the item's own (it ages out with the prune).
 */
export type StateItem = { id: string; published: string; stage?: string; aliases?: string[] };

/**
 * How long a reported id is remembered. Both reports drop items older than 7
 * days before they reach the state, so this only needs to be longer than that.
 */
const REPORTED_KEEP_DAYS = 30;

/**
 * A stage item first seen at a stage older than this is recorded but not
 * reported: adding a file to the watchlist, or a first run, must not report stale news.
 */
const FIRST_SEEN_MAX_AGE_DAYS = 30;

/** Missing or malformed → null: every item counts as new, like a first run. Extra fields are kept. */
export function loadReportedState<S extends ReportedState>(file: string): S | null {
  try {
    const state = JSON.parse(fs.readFileSync(file, "utf-8")) as S;
    const r: unknown = state?.reported;
    // A state saved before stage sources existed has no `stages`.
    return r && typeof r === "object" && !Array.isArray(r) ? { ...state, stages: state.stages ?? {} } : null;
  } catch {
    return null;
  }
}

export function saveReportedState(state: ReportedState, file: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/** What the state compares for a stage item: the stage and its date, so a second trilogue is a move too. */
export function stageKey(item: { published: string; stage?: string }): string {
  return `${item.published.slice(0, 10)} ${item.stage}`;
}

/** Items no earlier day reported; a stage item also when its stage moved. An item reported today is still new. */
export function newItems<T extends StateItem>(items: T[], state: ReportedState | null, dateStr: string): T[] {
  return items.filter((i) => {
    const day = [i.id, ...(i.aliases ?? [])].map((k) => state?.reported[k]).find((d) => d !== undefined);
    if (day === dateStr) return true;
    if (i.stage !== undefined) return state?.stages?.[i.id] !== stageKey(i);
    return day === undefined;
  });
}

/**
 * The state after reporting `items` on `dateStr`; ids older than REPORTED_KEEP_DAYS are pruned.
 * `recorded` stage items only get their stage saved: not reported, so a same-day re-run skips them too.
 * `seen` (every fetched item): one reported under an alias gets that day under its id, so it stays
 * reported once the alias no longer matches (a stable-id note whose date is edited again).
 */
export function nextReportedState(
  state: ReportedState | null,
  items: StateItem[],
  dateStr: string,
  recorded: StateItem[] = [],
  seen: StateItem[] = [],
): ReportedState {
  const cutoff = daysBefore(dateStr, REPORTED_KEEP_DAYS);
  const reported = Object.fromEntries(
    Object.entries(state?.reported ?? {}).filter(([, day]) => day >= cutoff),
  );
  const stages = { ...state?.stages };
  for (const i of seen) {
    const day = i.aliases?.map((k) => reported[k]).find((d) => d !== undefined);
    if (day !== undefined) reported[i.id] ??= day;
  }
  for (const i of items) {
    if (i.stage !== undefined && stages[i.id] !== stageKey(i)) {
      reported[i.id] = dateStr;
      stages[i.id] = stageKey(i);
    } else reported[i.id] ??= dateStr;
  }
  for (const i of recorded) stages[i.id] = stageKey(i);
  return { reported, stages };
}

/** Whether a stage item should only be recorded: the state has never seen `id`, and its stage is old. */
export function staleOnFirstSight(
  ctx: { state: ReportedState | null; dateStr: string },
  id: string,
  stageDate: string,
): boolean {
  return (
    ctx.state?.stages?.[id] === undefined && stageDate < daysBefore(ctx.dateStr, FIRST_SEEN_MAX_AGE_DAYS)
  );
}

/** `item`, marked `recordOnly` when it is stale on first sight (`staleOnFirstSight`). */
export function markStaleOnFirstSight<T extends { id: string; recordOnly?: boolean }>(
  ctx: { state: ReportedState | null; dateStr: string },
  item: T,
  stageDate: string,
): T {
  return staleOnFirstSight(ctx, item.id, stageDate) ? { ...item, recordOnly: true } : item;
}

// ---------------------------------------------------------------------------
// Deadlines of reported items (an extra state field)
// ---------------------------------------------------------------------------

export interface Deadline {
  /** ISO date. */
  date: string;
  title: string;
  link: string;
  source: string;
}

/** What nextDeadlines reads of an item: a policy item, or the data report's vendor item. */
type Dated = Omit<Deadline, "date"> & { id: string; deadline?: string };

/**
 * The open deadlines after today's run: the saved ones not yet passed, plus
 * the reported items' deadlines. A saved item fetched again takes its current
 * deadline (an extension), or leaves when it has none (feedback closed early).
 * An item no report carried is not added: Jev dropped it. A saved entry not
 * fetched again is kept as it is, extra fields included. Policy Watch's
 * Upcoming deadlines and the data report's Action required table.
 */
export function nextDeadlines(
  saved: Record<string, Deadline> | undefined,
  reported: Dated[],
  fetched: Dated[],
  dateStr: string,
): Record<string, Deadline> {
  const next = Object.fromEntries(Object.entries(saved ?? {}).filter(([, d]) => d.date >= dateStr));
  const toDeadline = (i: Dated): Deadline => ({
    date: i.deadline!,
    title: i.title,
    link: i.link,
    source: i.source,
  });
  for (const i of fetched) {
    if (!(i.id in next)) continue;
    if (i.deadline && i.deadline >= dateStr) next[i.id] = toDeadline(i);
    else delete next[i.id];
  }
  for (const i of reported) if (i.deadline && i.deadline >= dateStr) next[i.id] = toDeadline(i);
  return next;
}
