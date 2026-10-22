/**
 * The policy report's "Coming up" section, its last, rendered in code: the open
 * deadlines of every item a report has carried (saved in the policy state by
 * `nextDeadlines`, src/core/report-state.ts, so a consultation stays listed until it closes) plus the dated calendar in
 * config.yml `policy.calendar`. It shows only on report days; it never makes
 * one by itself (it would repeat daily).
 */

import type { PolicyCalendarEntry } from "../core/config.ts";
import { POLICY_REPORT } from "../core/i18n.ts";
import { cell, policyTitleLabel } from "../reports/report-builders.ts";
import { daysBefore } from "../core/date.ts";
import type { Deadline } from "../core/report-state.ts";

// POLICY_REPORT.deadlinesWindow states it under the heading.
const WINDOW_DAYS = 30;

/** Deadlines from today through the next 30 days, soonest first. */
export function upcomingDeadlines(
  open: Record<string, Deadline>,
  calendar: PolicyCalendarEntry[],
  dateStr: string,
): Deadline[] {
  const last = daysBefore(dateStr, -WINDOW_DAYS);
  return [
    ...Object.values(open),
    ...calendar.map((c) => ({
      date: c.date,
      title: c.label,
      link: c.link,
      source: POLICY_REPORT.calendarSource,
    })),
  ]
    .filter((d) => d.date >= dateStr && d.date <= last)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

/** The section; empty when nothing is due. */
export function renderDeadlines(deadlines: Deadline[]): string {
  if (deadlines.length === 0) return "";
  const rows = deadlines.map(
    (d) => `| ${d.date} | ${cell(d.source)} | [${policyTitleLabel(d.title)}](${cell(d.link)}) |`,
  );
  return `## ${POLICY_REPORT.deadlinesHeading}\n\n${POLICY_REPORT.deadlinesWindow}\n\n${POLICY_REPORT.deadlinesHeader}\n${rows.join("\n")}`;
}
