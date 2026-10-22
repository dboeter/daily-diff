/**
 * coming-up.json: the dated items of the next 30 days from every page, nearest
 * first, for the Overview and Telegram. Built in code from the state the run
 * already keeps; not a report.
 */

import type { PolicyCalendarEntry } from "../core/config.ts";
import { COMING_UP, type ReportId } from "../core/i18n.ts";
import type { Deadline } from "../core/report-state.ts";
import type { DataState } from "../data/vendors.ts";
import { upcomingDeadlines } from "../policy/deadlines.ts";
import type { PolicyState } from "../policy/policy.ts";
import type { OpenRouterStealthModel } from "../sources/openrouter.ts";

export interface ComingUpEntry extends Deadline {
  /** The report id of the page the item comes from. */
  page: ReportId;
}

/** A null state or catalog (missing, malformed, unavailable) adds nothing. */
export function buildComingUp(
  sources: {
    policy: PolicyState | null;
    calendar: PolicyCalendarEntry[];
    data: DataState | null;
    stealth: OpenRouterStealthModel[] | null;
  },
  dateStr: string,
): ComingUpEntry[] {
  const stealth = Object.fromEntries(
    (sources.stealth ?? []).flatMap((m) =>
      m.expires
        ? [
            [
              m.id,
              {
                date: m.expires,
                title: COMING_UP.stealthTitle(m.name),
                link: `https://openrouter.ai/${m.id}`,
                source: COMING_UP.stealthSource,
              },
            ],
          ]
        : [],
    ),
  );
  const tag = (page: ReportId, deadlines: Deadline[]): ComingUpEntry[] =>
    // Field by field: a data action also carries its summary.
    deadlines.map((d) => ({ date: d.date, title: d.title, link: d.link, source: d.source, page }));
  return [
    ...tag("ai-policy", upcomingDeadlines(sources.policy?.deadlines ?? {}, sources.calendar, dateStr)),
    ...tag("ai-data", upcomingDeadlines(sources.data?.actions ?? {}, [], dateStr)),
    ...tag("ai-models", upcomingDeadlines(stealth, [], dateStr)),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
