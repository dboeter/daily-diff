/**
 * Policy Watch fetching and state. Sources: the RSS feeds in config.yml
 * `policy.feeds`, and the registered non-RSS sources (`policy-sources.ts`).
 * New items are scored by Jev (`policy-jev.ts`). The state records which items
 * a run reported, so the daily report shows each item once, and a stage item
 * again when its stage moves. What a run observes (record-only stages, deadline
 * changes) is saved on every successful fetch; what it reports, only once the
 * report exists.
 */

import fs from "node:fs";
import path from "node:path";
import { fetchRssFeed, recentNewsItems, type FeedItem } from "./rss.ts";
import { JURISDICTIONS, type Jurisdiction, type PolicyConfig } from "./config.ts";
import { POLICY_SOURCES, type PolicySource } from "./policy-sources.ts";
import { loadPolicyVerdicts, selectPolicyItems, type PolicyVerdicts } from "./policy-jev.ts";
import type { AskJev } from "./trending-jev.ts";
import { nextDeadlines, upcomingDeadlines, type Deadline } from "./policy-deadlines.ts";
import { daysBefore } from "./date.ts";
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

/**
 * The state after reporting `items` on `dateStr`; ids older than REPORTED_KEEP_DAYS are pruned.
 * `recorded` stage items only get their stage saved: not reported, so a same-day re-run skips them too.
 */
export function nextPolicyState(
  state: PolicyState | null,
  items: StateItem[],
  dateStr: string,
  recorded: StateItem[] = [],
): PolicyState {
  const cutoff = daysBefore(dateStr, REPORTED_KEEP_DAYS);
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
  for (const i of recorded) stages[i.id] = stageKey(i);
  return { reported, stages };
}

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
  const fresh = newPolicyItems(fetched, state, dateStr);
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
    ...nextPolicyState(state, [], dateStr, recorded),
    deadlines: nextDeadlines(state?.deadlines, [], fetched, dateStr),
  };
  return {
    items: [...selection.items].sort((a, b) => rank(a) - rank(b)),
    fetchSuccess: results.some((r) => r !== null),
    // Only the kept items: a dropped one is not reported, and its saved verdict stops it being asked again.
    nextState: { ...nextPolicyState(state, selection.items, dateStr, recorded), deadlines },
    observedState,
    deadlines: upcomingDeadlines(deadlines, config.calendar, dateStr),
    rankedBy: selection.rankedBy,
    readerProfile: config.readerProfile,
    nextVerdicts: selection.nextVerdicts,
    ...(candidates.length > 0 ? { rankingFile: selection.rankingFile } : {}),
  };
}
