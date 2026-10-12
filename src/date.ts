/**
 * Date and timing utilities used across the pipeline.
 */

const CST_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Convert a Date to a CST (UTC+8) date string like "2026-03-11". */
export function toCstDateStr(date: Date): string {
  return new Date(date.getTime() + CST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Format a Date as a compact UTC string like "2026-03-11 00:00". */
export function toUtcStr(date: Date): string {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

/** Promise-based delay. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Day of week for a "YYYY-MM-DD" date string, 0 = Sunday. */
export function weekdayOf(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/**
 * The reports in WEEKLY_ISSUE_LABELS (github.ts), plus the Skills section of
 * the trending report, run weekly, not daily —
 * both the fetch and the report, except that Trending is still fetched daily
 * for the agents report's news matching. Sampled over September 2026, the daily
 * editions mostly repeated themselves: 54% of trending links and 45% of
 * community links were in the previous day's report, and the HF list (ranked by
 * cumulative downloads) carried over 90.5% of its models. Infra was weekly
 * too (on a given day 5 of 6 projects shipped no release) until October 2026,
 * when it became a section of the daily agents report: a quiet project there
 * costs one name in the quiet line.
 * 1 = Monday, against the CST date the digest folder is named for.
 */
export const WEEKLY_REPORT_WEEKDAY = 1;

/**
 * Set DIGEST_FORCE_WEEKLY=1 to run the weekly reports on any day — for testing
 * the weekly path, or regenerating a missed Monday via workflow_dispatch.
 */
export function isWeeklyRun(dateStr: string, force = false): boolean {
  return force || weekdayOf(dateStr) === WEEKLY_REPORT_WEEKDAY;
}
