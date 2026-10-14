/**
 * Policy Watch fetching and state. Sources: the RSS feeds in config.yml
 * `policy.feeds`, and the registered non-RSS sources (`policy-sources.ts`).
 * New items are scored by Jev (`policy-jev.ts`). The state records which items
 * a run reported, so the daily report shows each item once, and a stage item
 * again when its stage moves.
 */

import fs from "node:fs";
import path from "node:path";
import { fetchRssFeed, recentNewsItems, type FeedItem } from "./rss.ts";
import { JURISDICTIONS, type Jurisdiction, type PolicyConfig } from "./config.ts";
import { POLICY_SOURCES, type PolicySource } from "./policy-sources.ts";
import { loadPolicyVerdicts, selectPolicyItems, type PolicyVerdicts } from "./policy-jev.ts";
import type { AskJev } from "./trending-jev.ts";
import { nextDeadlines, upcomingDeadlines, type Deadline } from "./policy-deadlines.ts";

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
}

export interface PolicyState {
  /** Item id → the CST date it was first reported (for a stage item: the day its stage last changed). */
  reported: Record<string, string>;
  /**
   * Stage item id → its last reported `stageKey`. Never pruned: a procedure can
   * stall for months, and an id missing for a day (a failed fetch) must not
   * re-report its stage. Renaming a stage's display text re-reports each item once.
   */
  stages?: Record<string, string>;
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
  /** "keywords" when Jev was unavailable: watchlisted items and keyword hits only. */
  rankedBy?: "jev" | "keywords";
  /** Saved by buildPolicyReport; null leaves a malformed file as it is. */
  nextVerdicts?: PolicyVerdicts | null;
  /** `policy-ranking.json`, every scored item. */
  rankingFile?: string;
  /** The Upcoming deadlines section's rows; shown only when there are items. */
  deadlines: Deadline[];
}

export const POLICY_STATE_FILE = path.join("digests", "policy-state.json");

/**
 * How long a reported id is remembered. News items leave the feed's age window
 * (NEWS_MAX_AGE_DAYS) a week after they are published, so this only needs to
 * be longer than that.
 */
const REPORTED_KEEP_DAYS = 30;

/** Missing or malformed → null: every item in the age window counts as new, like a first run. */
export function loadPolicyState(file = POLICY_STATE_FILE): PolicyState | null {
  try {
    const state = JSON.parse(fs.readFileSync(file, "utf-8")) as PolicyState;
    const r: unknown = state?.reported;
    // A state saved before stage sources existed has no `stages`.
    return r && typeof r === "object" && !Array.isArray(r) ? { ...state, stages: state.stages ?? {} } : null;
  } catch {
    return null;
  }
}

export function savePolicyState(state: PolicyState, file = POLICY_STATE_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/** What the state compares for a stage item: the stage and its date, so a second trilogue is a move too. */
export function stageKey(item: { published: string; stage?: string }): string {
  return `${item.published.slice(0, 10)} ${item.stage}`;
}

type StateItem = { id: string; published: string; stage?: string };

/**
 * Items no earlier day reported; a stage item also when its stage moved. An
 * item reported today is still new, so a same-day re-run (workflow_dispatch
 * after the day's commit) reports the same items, as the ArXiv state does.
 */
export function newPolicyItems<T extends StateItem>(
  items: T[],
  state: PolicyState | null,
  dateStr: string,
): T[] {
  return items.filter((i) => {
    const day = state?.reported[i.id];
    if (day === dateStr) return true;
    if (i.stage !== undefined) return state?.stages?.[i.id] !== stageKey(i);
    return day === undefined;
  });
}

/** The state after reporting `items` on `dateStr`; ids older than REPORTED_KEEP_DAYS are pruned. */
export function nextPolicyState(state: PolicyState | null, items: StateItem[], dateStr: string): PolicyState {
  const cutoff = new Date(Date.parse(dateStr) - REPORTED_KEEP_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const reported = Object.fromEntries(
    Object.entries(state?.reported ?? {}).filter(([, day]) => day >= cutoff),
  );
  const stages = { ...state?.stages };
  for (const i of items) {
    if (i.stage !== undefined && stages[i.id] !== stageKey(i)) {
      reported[i.id] = dateStr;
      stages[i.id] = stageKey(i);
    } else reported[i.id] ??= dateStr;
  }
  return { reported, stages };
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
  const results = await Promise.all([
    ...fromSources,
    ...config.feeds.map(async (feed) => {
      try {
        const items = recentNewsItems(await fetchRssFeed(feed.url), now);
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
  const fetched = results.flatMap((r) => r ?? []);
  const candidates = newPolicyItems(fetched, state, dateStr);
  console.log(`  [policy] ${candidates.length} new items`);
  const selection = await selectPolicyItems(candidates, {
    readerProfile: config.readerProfile,
    watchlist: Object.values(config.watchlist).flat(),
    dateStr,
    ...jev,
  });
  // The report has one section per jurisdiction in JURISDICTIONS order, then News & commentary. Sorting
  // here (stable, so relevance order holds within a section) keeps the summaries prompt's row numbers
  // equal to the table's.
  const rank = (i: PolicyItem) => (i.news ? JURISDICTIONS.length : JURISDICTIONS.indexOf(i.jurisdiction));
  const deadlines = nextDeadlines(state?.deadlines, selection.items, fetched, dateStr);
  return {
    items: [...selection.items].sort((a, b) => rank(a) - rank(b)),
    fetchSuccess: results.some((r) => r !== null),
    // Only the kept items: a dropped one is not reported, and its saved verdict stops it being asked again.
    nextState: { ...nextPolicyState(state, selection.items, dateStr), deadlines },
    deadlines: upcomingDeadlines(deadlines, config.calendar, dateStr),
    rankedBy: selection.rankedBy,
    nextVerdicts: selection.nextVerdicts,
    ...(candidates.length > 0 ? { rankingFile: selection.rankingFile } : {}),
  };
}
