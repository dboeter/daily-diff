/**
 * The data report's vendor release-notes feeds (config.yml `data.feeds`):
 * RSS 2.0 through src/core/rss.ts, Snowflake and BigQuery through their own
 * modules. A failing feed is logged and skipped.
 */

import type { DataConfig, DataFeed, Vendor } from "../core/config.ts";
import { fetchRssFeed, VENDOR_DESCRIPTION_MAX_CHARS } from "../core/rss.ts";
import { fetchBehaviorChangeBundles, fetchSnowflakeReleases } from "./snowflake.ts";
import { fetchBigQueryNotes } from "./bigquery.ts";
import path from "node:path";
import {
  loadReportedState,
  markStaleOnFirstSight,
  nextDeadlines,
  type Deadline,
  type ReportedState,
  type StateItem,
} from "../core/report-state.ts";
import { collectNewItems, type NewItems } from "../core/new-items.ts";
import type { Numbered } from "../reports/summarized-table.ts";
import { loadDataVerdicts, selectVendorItems, type DataVerdicts, type KeptVendorItem } from "./relevance.ts";
import type { AskJev } from "../core/jev.ts";
import type { RepoConfig } from "../core/github.ts";
import { agentMatcher } from "../reports/project-news.ts";
import { daysBefore, toCstDateStr } from "../core/date.ts";

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
  /** A behavior-change bundle's planned next status change, when its window has a full date (ISO). */
  endDate?: string;
  /** From a feed with `stable_id`: the state keys it on `id`. */
  stableId?: true;
}

/** An item as a parser returns it, before the feed's vendor and name are added. */
export type VendorNote = Omit<VendorItem, "vendor" | "source" | "stableId">;

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
): Promise<{ items: VendorItem[]; fetchSuccess: boolean; counts: Record<string, number | null> }> {
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
      .map((n): VendorItem => ({
        ...n,
        vendor: feed.vendor,
        source: feed.name,
        ...(feed.stableId ? { stableId: true as const } : {}),
      }))
      .filter((item) => {
        const key = dedupeKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  });
  const counts = Object.fromEntries(
    results.map((r, i) => [config.feeds[i]!.name, r.status === "fulfilled" ? r.value.length : null]),
  );
  return { items, fetchSuccess: results.some((r) => r.status === "fulfilled"), counts };
}

// ---------------------------------------------------------------------------
// State: which vendor items a run reported (report-state.ts, shared with AI Policy)
// ---------------------------------------------------------------------------

/** An open end date of a reported deprecation: the Action required table's row. */
export interface VendorAction extends Deadline {
  /** The row summary of the day it was reported ("what to do"); set by buildDataReport. */
  summary?: string;
}

/**
 * Note key (`stateId`) or bundle id → CST date first reported; `stages`: behavior-change bundle id → its last reported stageKey;
 * `actions`: item id → the open end date of a reported deprecation, until it passes.
 */
export interface DataState extends ReportedState {
  actions?: Record<string, VendorAction>;
}

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
 * added before it. A `stable_id` feed's note (Fabric, Azure updates) and a
 * bundle keep their id: an edited date or title, or a bundle's stage, is what
 * moves. Such a note's title + date key, saved before 2026-10-22, is its alias.
 */
const stateId = (i: VendorItem): string => (i.stage === undefined && !i.stableId ? dedupeKey(i) : i.id);
export const asStateItem = (i: VendorItem): StateItem => ({
  id: stateId(i),
  published: i.date,
  stage: i.stage,
  ...(i.stableId && i.stage === undefined ? { aliases: [dedupeKey(i)] } : {}),
});

/** A note announcing a change ahead: Databricks' "What's coming" page. */
const COMING_SOON_RE = /\b(?:will soon be|coming soon)\b/i;
/** A title's status phrase and what follows it, so a coming-soon note and its GA note share a stem. */
const STATUS_RE =
  /\s+(?:will soon be|will be|is now|are now|is generally|are generally|is available|are available|now available|(?:is|are) in (?:public )?preview)\b.*$|\s*\((?:general availability|ga|public preview|preview)\)\s*$/i;
const titleStem = (title: string): string =>
  title.toLowerCase().replace(/\s+/g, " ").replace(STATUS_RE, "").trim();

/**
 * Notes that ship what a coming-soon note, reported on an earlier day, announced
 * ("… will soon be available by default …" → "… are generally available"):
 * the reader already has it. Matched on the title stem, read from the state's
 * title + date keys. Same-day pairs stay, for the prose call to mention once.
 * Checked on the 2026-10-12..21 state: it pairs only the Databricks Apps
 * package repositories, Genie file upload and feature views notes.
 */
export function shippedComingSoon(
  items: VendorItem[],
  state: DataState | null,
  dateStr: string,
): Set<VendorItem> {
  const announced = new Set(
    Object.entries(state?.reported ?? {})
      .filter(([key, day]) => day < dateStr && COMING_SOON_RE.test(key))
      .map(([key]) => titleStem(key.slice(0, key.lastIndexOf("|")))),
  );
  return new Set(
    items.filter(
      (i) => i.stage === undefined && !COMING_SOON_RE.test(i.title) && announced.has(titleStem(i.title)),
    ),
  );
}

/**
 * The age limit. A date ahead of the run is valid (Databricks dates a note by
 * its release); bundles skip the limit (their date may be "").
 */
export function recentVendorItems(items: VendorItem[], dateStr: string): VendorItem[] {
  const cutoff = daysBefore(dateStr, VENDOR_MAX_AGE_DAYS);
  return items.filter((i) => i.stage !== undefined || i.date >= cutoff);
}

/** The kept items in report order, and the over-cap ones by relevance (selectVendorItems). */
export type VendorData = NewItems<Numbered<KeptVendorItem>, DataState, DataVerdicts, KeptVendorItem>;

/** Fetch every feed, keep the new items, and let Jev (or the keyword rules) select them. Never throws. */
export async function fetchVendorData(
  config: DataConfig,
  now: Date,
  {
    state = loadDataState(),
    jev = { apiKey: process.env["TYPESAFE_API_KEY"], cache: loadDataVerdicts() },
    trackedProjects = [],
  }: {
    /** null: a first run. Default: `digests/data-state.json`. */
    state?: DataState | null;
    jev?: { apiKey?: string; cache: DataVerdicts | null; ask?: AskJev };
    /** The Tracked data projects: an item naming one is kept on a weaker real-change answer. */
    trackedProjects?: RepoConfig[];
  } = {},
): Promise<VendorData> {
  const matchers = trackedProjects.map(agentMatcher);
  const tracked = (i: VendorItem) => matchers.some((re) => re.test(`${i.title} ${i.description}`));
  const dateStr = toCstDateStr(now);
  let counts: Record<string, number | null> = {};
  return collectNewItems({
    tag: "data",
    state,
    dateStr,
    fetch: async () => {
      const fetched = await fetchVendorFeeds(config, now);
      const { items, fetchSuccess } = fetched;
      counts = fetched.counts;
      const shipped = shippedComingSoon(items, state, dateStr);
      if (shipped.size)
        console.log(`  [data] ${shipped.size} notes ship a reported coming-soon note, skipped`);
      return {
        // A bundle first seen at a stage over 30 days old (or with no full date) is recorded without
        // reporting, as AI Policy does: a first run must not open with months-old bundles.
        items: recentVendorItems(
          items.filter((i) => !shipped.has(i)),
          dateStr,
        ).map((i) => (i.stage !== undefined ? markStaleOnFirstSight({ state, dateStr }, i, i.date) : i)),
        fetchSuccess,
      };
    },
    stateItem: asStateItem,
    // Only bundles as `fetched`: a note's end date is Jev's (set on kept items), so a refetched note
    // would wipe its saved date; a bundle's is parsed from the page, so each fetch is current.
    // A bundle the state knows is not new while its stage holds, so its date (a plan that gained a
    // day, a reschedule) comes from the fetch.
    extend: (kept, fetched) => {
      const bundles = fetched.filter((i) => i.stage !== undefined);
      const known = bundles.filter((i) => i.endDate && state?.stages?.[i.id] !== undefined);
      return {
        actions: nextDeadlines(
          state?.actions,
          [...known, ...kept.filter((i) => i.endDate)].map((i) => ({ ...i, deadline: i.endDate })),
          bundles.map((i) => ({ ...i, deadline: i.endDate })),
          dateStr,
        ) as Record<string, VendorAction>,
      };
    },
    select: async (candidates) => {
      console.log(`  [data] ${candidates.length} new vendor items`);
      const selection = await selectVendorItems(candidates, { ...jev, dateStr, fetched: counts, tracked });
      // An over-cap coming-soon note stays unreported: marked reported, it would make
      // shippedComingSoon skip its GA note, which the reader would then never see.
      return { ...selection, alsoNew: selection.alsoNew?.filter((i) => !COMING_SOON_RE.test(i.title)) };
    },
  });
}
