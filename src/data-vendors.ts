/**
 * The data report's vendor release-notes feeds (config.yml `data.feeds`):
 * RSS 2.0 through src/rss.ts, Snowflake and BigQuery through their own
 * modules. A failing feed is logged and skipped.
 */

import type { DataConfig, DataFeed, Vendor } from "./config.ts";
import { fetchRssFeed, VENDOR_DESCRIPTION_MAX_CHARS } from "./rss.ts";
import { fetchBehaviorChangeBundles, fetchSnowflakeReleases } from "./data-snowflake.ts";
import { fetchBigQueryNotes } from "./data-bigquery.ts";
import path from "node:path";
import {
  loadReportedState,
  markStaleOnFirstSight,
  type ReportedState,
  type StateItem,
} from "./report-state.ts";
import { collectNewItems, type NewItems } from "./new-items.ts";
import type { Numbered } from "./summarized-table.ts";
import { loadDataVerdicts, selectVendorItems, type DataVerdicts, type KeptVendorItem } from "./data-jev.ts";
import type { AskJev } from "./jev.ts";
import { daysBefore, toCstDateStr } from "./date.ts";

export interface VendorItem {
  /** Stable per note: the guid, or the parser's own key. */
  id: string;
  vendor: Vendor;
  /** The feed's display name (config `name`). */
  source: string;
  title: string;
  link: string;
  /**
   * YYYY-MM-DD; may lie ahead of the run (Databricks dates a note by its
   * release). "" for a behavior-change bundle whose status gives no full date.
   */
  date: string;
  /** Plain text, truncated to VENDOR_DESCRIPTION_MAX_CHARS. */
  description: string;
  /** A behavior-change bundle's status. */
  stage?: string;
  categories?: string[];
  /** A bundle first seen at an old stage: its stage is recorded, not reported (staleOnFirstSight). */
  recordOnly?: boolean;
}

/** An item as a parser returns it, before the feed's vendor and name are added. */
export type VendorNote = Omit<VendorItem, "vendor" | "source">;

async function fetchRssNotes(feed: DataFeed): Promise<VendorNote[]> {
  const items = await fetchRssFeed(feed.url, VENDOR_DESCRIPTION_MAX_CHARS);
  const wanted = feed.categories;
  return items
    .filter((i) => !wanted || i.categories?.some((c) => wanted.includes(c)))
    .map((i) => ({
      id: i.id,
      title: i.title,
      link: i.link,
      // pubDate is a UTC date (Databricks: 00:00:00 GMT), so the ISO date part is the day.
      date: i.published.slice(0, 10),
      description: i.description,
      ...(i.categories ? { categories: i.categories } : {}),
    }));
}

const PARSERS: Record<DataFeed["parser"], (feed: DataFeed) => Promise<VendorNote[]>> = {
  rss: fetchRssNotes,
  snowflake: (f) => fetchSnowflakeReleases(f.url),
  "snowflake-bcr": (f) => fetchBehaviorChangeBundles(f.url),
  bigquery: (f) => fetchBigQueryNotes(f.url),
};

/** Lowercased, whitespace-collapsed title + date. */
const dedupeKey = (i: VendorItem): string => `${i.title.toLowerCase().replace(/\s+/g, " ").trim()}|${i.date}`;

/**
 * Every configured feed's items, fetched in parallel. Deduped within the run on
 * title + date: Databricks lists a note on its topic page and on the monthly
 * product page, under two guids; the first one listed is kept. `now` is unused:
 * the age limit is applied by fetchVendorData (`recentVendorItems`), on the CST date.
 */
export async function fetchVendorFeeds(
  config: DataConfig,
  _now: Date,
): Promise<{ items: VendorItem[]; fetchSuccess: boolean }> {
  const results = await Promise.allSettled(config.feeds.map((f) => PARSERS[f.parser](f)));
  const seen = new Set<string>();
  const items = results.flatMap((r, i) => {
    const feed = config.feeds[i]!;
    if (r.status === "rejected") {
      console.log(`  [data] ${feed.name} failed: ${r.reason instanceof Error ? r.reason.message : r.reason}`);
      return [];
    }
    console.log(`  [data] ${feed.name}: ${r.value.length} items`);
    return r.value
      .map((n): VendorItem => ({ ...n, vendor: feed.vendor, source: feed.name }))
      .filter((item) => {
        const key = dedupeKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  });
  return { items, fetchSuccess: results.some((r) => r.status === "fulfilled") };
}

// ---------------------------------------------------------------------------
// State: which vendor items a run reported (report-state.ts, shared with Policy Watch)
// ---------------------------------------------------------------------------

/** Note key (title + date, `stateId`) or bundle id → CST date first reported; `stages`: behavior-change bundle id → its last reported stageKey. */
export type DataState = ReportedState;

export const DATA_STATE_FILE = path.join("digests", "data-state.json");

/**
 * Applied on every run, not only the first: the Azure Databricks feed carries
 * ~1,300 items of history, and an id the state pruned after 30 days would
 * otherwise come back.
 */
const VENDOR_MAX_AGE_DAYS = 7;

/** Missing or malformed → null, a first run. */
export const loadDataState = (file = DATA_STATE_FILE): DataState | null => loadReportedState(file);

/**
 * The state's StateItem: it dates an item by `published`. A note is keyed
 * on dedupeKey, not its id: Databricks lists a note under two guids and the run
 * keeps whichever comes first, and a BigQuery note's id moves when a note is
 * added before it. Bundles keep their id: their stage is what moves.
 */
const stateId = (i: VendorItem): string => (i.stage === undefined ? dedupeKey(i) : i.id);
export const asStateItem = (i: VendorItem): StateItem => ({
  id: stateId(i),
  published: i.date,
  stage: i.stage,
});

/**
 * The age limit. A date ahead of the run is valid (Databricks dates a note by
 * its release); bundles skip the limit (their date may be "").
 */
export function recentVendorItems(items: VendorItem[], dateStr: string): VendorItem[] {
  const cutoff = daysBefore(dateStr, VENDOR_MAX_AGE_DAYS);
  return items.filter((i) => i.stage !== undefined || i.date >= cutoff);
}

/** The kept items in report order (selectVendorItems). */
export type VendorData = NewItems<Numbered<KeptVendorItem>, DataState, DataVerdicts>;

/** Fetch every feed, keep the new items, and let Jev (or the keyword rules) select them. Never throws. */
export async function fetchVendorData(
  config: DataConfig,
  now: Date,
  state = loadDataState(),
  jev: { apiKey?: string; cache: DataVerdicts | null; ask?: AskJev } = {
    apiKey: process.env["TYPESAFE_API_KEY"],
    cache: loadDataVerdicts(),
  },
): Promise<VendorData> {
  const dateStr = toCstDateStr(now);
  return collectNewItems({
    tag: "data",
    state,
    dateStr,
    fetch: async () => {
      const { items, fetchSuccess } = await fetchVendorFeeds(config, now);
      return {
        // A bundle first seen at a stage over 30 days old (or with no full date) is recorded without
        // reporting, as Policy Watch does: a first run must not open with months-old bundles.
        items: recentVendorItems(items, dateStr).map((i) =>
          i.stage !== undefined ? markStaleOnFirstSight({ state, dateStr }, i, i.date) : i,
        ),
        fetchSuccess,
      };
    },
    stateItem: asStateItem,
    select: (candidates) => {
      console.log(`  [data] ${candidates.length} new vendor items`);
      return selectVendorItems(candidates, { ...jev, dateStr });
    },
  });
}
