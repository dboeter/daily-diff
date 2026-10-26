/**
 * AI Policy fetching and state. Sources: the RSS feeds in config.yml
 * `policy.feeds`, and the registered non-RSS sources (`policy/sources.ts`).
 * New items are scored by Jev (`policy/relevance.ts`). The state records which items
 * a run reported, so the daily report shows each item once, and a stage item
 * again when its stage moves. What a run observes (record-only stages, deadline
 * changes) is saved on every successful fetch; what it reports, only once the
 * report exists.
 */

import path from "node:path";
import { fetchRssFeed, recentNewsItems, type FeedItem } from "../core/rss.ts";
import type { Jurisdiction, PolicyConfig } from "../core/config.ts";
import { POLICY_SOURCES, type PolicySource } from "./sources.ts";
import { loadPolicyVerdicts, selectPolicyItems, type PolicyVerdicts } from "./relevance.ts";
import { sourceCounts, type AskJev } from "../core/jev.ts";
import { daysBefore } from "../core/date.ts";
import { warnStep } from "../core/llm.ts";
import { upcomingDeadlines } from "./deadlines.ts";
import { loadReportedState, nextDeadlines, type Deadline, type ReportedState } from "../core/report-state.ts";
import { collectNewItems, type NewItems } from "../core/new-items.ts";
import { numberRows, type Numbered } from "../reports/summarized-table.ts";
import { POLICY_REPORT } from "../core/strings.ts";

export interface PolicyItem extends FeedItem {
  /** The feed's display name (config.yml policy.feeds). */
  source: string;
  /** From the feed (config.yml): whose policy the item is, and whether only Jev can judge it. */
  jurisdiction: Jurisdiction;
  jevOnly: boolean;
  /** From a news feed (`kind: news`): rendered in the News & commentary section, after the jurisdictions. */
  news?: boolean;
  /**
   * Where a legislative file stands, display text rendered by code (never the
   * model). Set by stage sources; an item with a stage is reported again when it moves.
   */
  stage?: string;
  /** ISO date of a deadline the item carries (a comment period's end). */
  deadline?: string;
  /**
   * A stage item recorded in the state without being scored or reported: a
   * source sets it for a stage that was already old when first seen, so a
   * newly watchlisted file does not open with stale news.
   */
  recordOnly?: boolean;
}

/** The reported-items state plus the open deadlines of reported items. */
export interface PolicyState extends ReportedState {
  /** Item id → the open deadline of a reported item; dropped once passed (policy/deadlines.ts). */
  deadlines?: Record<string, Deadline>;
  /** Primary source name → the first day of its run of days with no judged item (`nextZeroSince`). */
  zeroSince?: Record<string, string>;
}

export interface PolicyData extends NewItems<Numbered<PolicyItem>, PolicyState, PolicyVerdicts> {
  /** The Coming up section's rows; shown only when there are items. */
  deadlines: Deadline[];
  /** config.yml `policy.reader_profile`, for the report prompts. */
  readerProfile: string;
}

export const POLICY_STATE_FILE = path.join("digests", "policy-state.json");

/** Missing or malformed → null: every item in the age window counts as new, like a first run. */
export const loadPolicyState = (file = POLICY_STATE_FILE): PolicyState | null => loadReportedState(file);

/** A paid advertorial's link path. */
const SPONSORED_LINK_RE = /\/sponsored-content\//;

/** Every source and feed in parallel; one entry per source, null when it failed. Also used by `scripts/jev-lab.ts`. */
export async function fetchPolicySources(
  config: PolicyConfig,
  now: Date,
  dateStr: string,
  state: PolicyState | null,
  sources: PolicySource[] = POLICY_SOURCES,
): Promise<(PolicyItem[] | null)[]> {
  const fromSources = sources.map(async (source) => {
    try {
      const items = await source.fetch({ config, now, dateStr, state });
      console.log(`  [policy] ${source.name}: ${items.length} items`);
      return items;
    } catch (err) {
      console.error(`  [policy] ${source.name} failed: ${err}`);
      return null;
    }
  });
  return Promise.all([
    ...fromSources,
    ...config.feeds.map(async (feed) => {
      try {
        // Politico's feeds carry paid advertorials under /sponsored-content/; on 2026-10-18 Jev kept one
        // ("How can Europe leverage laws to secure cloud sovereignty?") once it read the full text.
        const items = recentNewsItems(await fetchRssFeed(feed.url), now).filter(
          (i) => !SPONSORED_LINK_RE.test(i.link),
        );
        console.log(`  [policy] ${feed.name}: ${items.length} items within the news age limit`);
        return items.map((i): PolicyItem => ({
          ...i,
          source: feed.name,
          jurisdiction: feed.jurisdiction,
          jevOnly: feed.jevOnly,
          news: feed.news,
        }));
      } catch (err) {
        console.error(`  [policy] ${feed.name} failed: ${err}`);
        return null;
      }
    }),
  ]);
}

/**
 * Days a primary source may go without a judged item before the run warns. A week: the official
 * sources publish on weekdays, so a quiet weekend or a slow week alone does not warn.
 */
export const QUIET_SOURCE_WARN_DAYS = 7;

/**
 * Each primary source (a registered source, or a feed without `kind: news`) without a judged item
 * today keeps the first day of its quiet run; a source with one leaves the map. A failed fetch counts
 * as quiet: a broken source is what the warning is for. Same-day re-runs keep the date.
 */
export function nextZeroSince(
  prev: Record<string, string> | undefined,
  primary: string[],
  judgedSources: string[],
  dateStr: string,
): Record<string, string> {
  const judged = new Set(judgedSources);
  return Object.fromEntries(primary.filter((n) => !judged.has(n)).map((n) => [n, prev?.[n] ?? dateStr]));
}

/** The sources quiet for QUIET_SOURCE_WARN_DAYS days or more, today included. */
export function quietSources(zeroSince: Record<string, string>, dateStr: string): [string, string][] {
  const from = daysBefore(dateStr, QUIET_SOURCE_WARN_DAYS - 1);
  return Object.entries(zeroSince).filter(([, since]) => since <= from);
}

export async function fetchPolicyData(
  config: PolicyConfig,
  now: Date,
  dateStr: string,
  state = loadPolicyState(),
  jev: { apiKey?: string; cache: PolicyVerdicts | null; ask?: AskJev } = {
    apiKey: process.env["TYPESAFE_API_KEY"],
    cache: loadPolicyVerdicts(),
  },
  sources: PolicySource[] = POLICY_SOURCES,
): Promise<PolicyData> {
  // Per source name: items fetched (null: failed), and the source each item came from. Item `source`
  // fields differ from the registry names ("Commission mail" fetches "European Commission" items).
  const names = [...sources.map((s) => s.name), ...config.feeds.map((f) => f.name)];
  const primary = [...sources.map((s) => s.name), ...config.feeds.filter((f) => !f.news).map((f) => f.name)];
  let fetched: Record<string, number | null> = {};
  const originOf = new Map<string, string>();
  let zeroSince = state?.zeroSince;
  const data = await collectNewItems({
    tag: "policy",
    state,
    dateStr,
    fetch: async () => {
      const results = await fetchPolicySources(config, now, dateStr, state, sources);
      fetched = Object.fromEntries(names.map((n, i) => [n, results[i]?.length ?? null]));
      // Last copy wins, as in byId below.
      results.forEach((r, i) => r?.forEach((item) => originOf.set(item.id, names[i]!)));
      // One row per id: the Commission mailing repeats items of the Commission's RSS feed, under its guid.
      // The last copy wins: feeds come after sources, so the RSS item (its own pubDate) is the one shown.
      const byId = new Map(results.flatMap((r) => r ?? []).map((i) => [i.id, i] as const));
      return { items: [...byId.values()], fetchSuccess: results.some((r) => r !== null) };
    },
    // A source sets `recordOnly` itself (staleOnFirstSight): Have your say, for one, keeps an open
    // initiative whose stage started long ago.
    stateItem: (i: PolicyItem) => i,
    select: async (candidates) => {
      console.log(`  [policy] ${POLICY_REPORT.newItems(candidates.length)}`);
      const judged = candidates.map((c) => originOf.get(c.id) ?? c.source);
      zeroSince = nextZeroSince(state?.zeroSince, primary, judged, dateStr);
      for (const [name, since] of quietSources(zeroSince, dateStr)) {
        warnStep(`[policy] WARN ${name}: no judged item since ${since}; check whether the source is broken`);
      }
      const selection = await selectPolicyItems(candidates, {
        readerProfile: config.readerProfile,
        watchlist: config.watchlist,
        sources: sourceCounts(fetched, judged),
        dateStr,
        ...jev,
      });
      // selectPolicyItems returns report order, so the row numbers run on down the page; the table
      // and the summaries prompt both read each row's own number.
      return { ...selection, items: numberRows(selection.items) };
    },
    extend: (kept, fetchedItems): Pick<PolicyState, "deadlines" | "zeroSince"> => ({
      deadlines: nextDeadlines(state?.deadlines, kept, fetchedItems, dateStr),
      ...(zeroSince ? { zeroSince } : {}),
    }),
  });
  return {
    ...data,
    deadlines: upcomingDeadlines(data.nextState.deadlines ?? {}, config.calendar, dateStr),
    readerProfile: config.readerProfile,
  };
}
