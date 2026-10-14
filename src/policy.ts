/**
 * Policy Watch sources and state. One source so far: the Commission's
 * digital-strategy news feed. The state records which items a run reported,
 * so the daily report shows each item once.
 */

import fs from "node:fs";
import path from "node:path";
import { fetchRssFeed, recentNewsItems, type FeedItem } from "./rss.ts";
import type { PolicyFeed } from "./config.ts";

export interface PolicyItem extends FeedItem {
  /** The feed's display name (config.yml policy.feeds). */
  source: string;
}

export interface PolicyState {
  /** Item id → the CST date it was first reported. */
  reported: Record<string, string>;
}

export interface PolicyData {
  /** The items to report today, in feed order. */
  items: PolicyItem[];
  /** False when every feed failed. */
  fetchSuccess: boolean;
  /** Saved by buildPolicyReport once the report exists, like the ArXiv state. */
  nextState: PolicyState;
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
    return r && typeof r === "object" && !Array.isArray(r) ? state : null;
  } catch {
    return null;
  }
}

export function savePolicyState(state: PolicyState, file = POLICY_STATE_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/**
 * Items no earlier day reported. An item first reported today is still new,
 * so a same-day re-run (workflow_dispatch after the day's commit) reports the
 * same items, as the ArXiv state does.
 */
export function newPolicyItems<T extends { id: string }>(
  items: T[],
  state: PolicyState | null,
  dateStr: string,
): T[] {
  return items.filter((i) => {
    const day = state?.reported[i.id];
    return day === undefined || day === dateStr;
  });
}

/** The state after reporting `items` on `dateStr`; ids older than REPORTED_KEEP_DAYS are pruned. */
export function nextPolicyState(
  state: PolicyState | null,
  items: { id: string }[],
  dateStr: string,
): PolicyState {
  const cutoff = new Date(Date.parse(dateStr) - REPORTED_KEEP_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const reported = Object.fromEntries(
    Object.entries(state?.reported ?? {}).filter(([, day]) => day >= cutoff),
  );
  for (const i of items) reported[i.id] ??= dateStr;
  return { reported };
}

export async function fetchPolicyData(
  feeds: PolicyFeed[],
  now: Date,
  dateStr: string,
  state = loadPolicyState(),
): Promise<PolicyData> {
  const results = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const items = recentNewsItems(await fetchRssFeed(feed.url), now);
        console.log(`  [policy] ${feed.name}: ${items.length} items within the news age limit`);
        return items.map((i): PolicyItem => ({ ...i, source: feed.name }));
      } catch (err) {
        console.error(`  [policy] ${feed.name} failed: ${err}`);
        return null;
      }
    }),
  );
  const items = newPolicyItems(
    results.flatMap((r) => r ?? []),
    state,
    dateStr,
  );
  console.log(`  [policy] ${items.length} new items`);
  return {
    items,
    fetchSuccess: results.some((r) => r !== null),
    nextState: nextPolicyState(state, items, dateStr),
  };
}
