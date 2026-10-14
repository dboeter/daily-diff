/**
 * The policy report's "Upcoming deadlines" section, rendered in code: the open
 * deadlines of every item a report has carried (saved in the policy state, so
 * a consultation stays listed until it closes) plus the dated calendar in
 * config.yml `policy.calendar`. It shows only on report days; it never makes
 * one by itself (it would repeat daily).
 */

import type { PolicyCalendarEntry } from "./config.ts";
import type { PolicyItem } from "./policy.ts";
import { POLICY_REPORT } from "./i18n.ts";
import { cell, policyTitleLabel } from "./report-builders.ts";
import { daysBefore } from "./date.ts";

export interface Deadline {
  /** ISO date. */
  date: string;
  title: string;
  link: string;
  source: string;
}

const WINDOW_DAYS = 30;

/**
 * The open deadlines after today's run: the saved ones not yet passed, plus
 * the reported items' deadlines. A saved item fetched again takes its current
 * deadline (an extension), or leaves when it has none (feedback closed early).
 * An item no report carried is not added: Jev dropped it.
 */
export function nextDeadlines(
  saved: Record<string, Deadline> | undefined,
  reported: PolicyItem[],
  fetched: PolicyItem[],
  dateStr: string,
): Record<string, Deadline> {
  const next = Object.fromEntries(Object.entries(saved ?? {}).filter(([, d]) => d.date >= dateStr));
  const toDeadline = (i: PolicyItem): Deadline => ({
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
  return `## ${POLICY_REPORT.deadlinesHeading}\n\n${POLICY_REPORT.deadlinesHeader}\n${rows.join("\n")}`;
}
