/**
 * Policy Watch fetching and state. Sources: the RSS feeds in config.yml
 * `policy.feeds`, and the registered non-RSS sources (`policy-sources.ts`).
 * New items are scored by Jev (`policy-jev.ts`). The state records which items
 * a run reported, so the daily report shows each item once, and a stage item
 * again when its stage moves. What a run observes (record-only stages, deadline
 * changes) is saved on every successful fetch; what it reports, only once the
 * report exists.
 */

import path from "node:path";
import { fetchRssFeed, recentNewsItems, type FeedItem } from "./rss.ts";
import { JURISDICTIONS, type Jurisdiction, type PolicyConfig } from "./config.ts";
import { POLICY_SOURCES, type PolicySource } from "./policy-sources.ts";
import { loadPolicyVerdicts, selectPolicyItems, type PolicyVerdicts } from "./policy-jev.ts";
import type { AskJev } from "./jev.ts";
import { nextDeadlines, upcomingDeadlines, type Deadline } from "./policy-deadlines.ts";
import {
  loadReportedState,
  newItems,
  nextReportedState,
  saveReportedState,
  type ReportedState,
} from "./report-state.ts";
import { POLICY_REPORT } from "./i18n.ts";

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
  /** Item id → the open deadline of a reported item; dropped once passed (policy-deadlines.ts). */
  deadlines?: Record<string, Deadline>;
}

export interface PolicyData {
  /** The items to report today: the kept ones, most relevant first. */
  items: PolicyItem[];
  /** False when every feed failed. */
  fetchSuccess: boolean;
  /** Saved by buildPolicyReport once the report exists, like the ArXiv state. */
  nextState: PolicyState;
  /**
   * `nextState` without today's kept items: the record-only stages and the
   * saved deadlines reconciled with the fetch. Saved on every successful fetch,
   * so a quiet day or a failed report still keeps them.
   */
  observedState: PolicyState;
  /** "keywords" when Jev was unavailable: watchlisted items and keyword hits only. */
  rankedBy?: "jev" | "keywords";
  /** Saved by buildPolicyReport; null leaves a malformed file as it is. */
  nextVerdicts?: PolicyVerdicts | null;
  /** `policy-ranking.json`, every scored item. */
  rankingFile?: string;
  /** The Upcoming deadlines section's rows; shown only when there are items. */
  deadlines: Deadline[];
  /** config.yml `policy.reader_profile`, for the report prompts. */
  readerProfile: string;
}

export const POLICY_STATE_FILE = path.join("digests", "policy-state.json");

/** Missing or malformed → null: every item in the age window counts as new, like a first run. */
export const loadPolicyState = (file = POLICY_STATE_FILE): PolicyState | null => loadReportedState(file);
export const savePolicyState = (state: PolicyState, file = POLICY_STATE_FILE): void =>
  saveReportedState(state, file);

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
  const results = await fetchPolicySources(config, now, dateStr, state, sources);
  const fetched = results.flatMap((r) => r ?? []);
  const fresh = newItems(fetched, state, dateStr);
  const recorded = fresh.filter((i) => i.recordOnly);
  const candidates = fresh.filter((i) => !i.recordOnly);
  console.log(`  [policy] ${POLICY_REPORT.newItems(candidates.length)}`);
  const selection = await selectPolicyItems(candidates, {
    readerProfile: config.readerProfile,
    watchlist: config.watchlist,
    dateStr,
    ...jev,
  });
  // The report has one section per jurisdiction in JURISDICTIONS order, then News & commentary. Sorting
  // here (stable, so relevance order holds within a section) keeps the summaries prompt's row numbers
  // equal to the table's.
  const rank = (i: PolicyItem) => (i.news ? JURISDICTIONS.length : JURISDICTIONS.indexOf(i.jurisdiction));
  const deadlines = nextDeadlines(state?.deadlines, selection.items, fetched, dateStr);
  const observedState = {
    ...nextReportedState(state, [], dateStr, recorded),
    deadlines: nextDeadlines(state?.deadlines, [], fetched, dateStr),
  };
  return {
    items: [...selection.items].sort((a, b) => rank(a) - rank(b)),
    fetchSuccess: results.some((r) => r !== null),
    // Only the kept items: a dropped one is not reported, and its saved verdict stops it being asked again.
    nextState: { ...nextReportedState(state, selection.items, dateStr, recorded), deadlines },
    observedState,
    deadlines: upcomingDeadlines(deadlines, config.calendar, dateStr),
    rankedBy: selection.rankedBy,
    readerProfile: config.readerProfile,
    nextVerdicts: selection.nextVerdicts,
    ...(candidates.length > 0 ? { rankingFile: selection.rankingFile } : {}),
  };
}
