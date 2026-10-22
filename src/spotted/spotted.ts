/**
 * Spotted: the community stories (Hacker News, Lobste.rs, Dev.to) of a day,
 * minus the ones a page showed on an earlier day, each routed to its topic's
 * page (`src/spotted/jev.ts`). The log `digests/spotted-log.json` records what
 * was fetched and what a page showed.
 */

import path from "node:path";
import { daysBefore } from "../core/date.ts";
import { loadItemsFile, saveItemsFile, type ItemsFile } from "../core/jev.ts";
import { numberRows, type Numbered } from "../reports/summarized-table.ts";
import type { HnData } from "../sources/hn.ts";
import type { LobstersData } from "../sources/lobsters.ts";
import type { DevtoData } from "../sources/devto.ts";

export type StorySource = "hn" | "lobsters" | "devto";

/** One community story, whatever its source. */
export interface Story {
  id: string; // "hn:<id>", "lobsters:<short_id>", "devto:<id>"
  source: StorySource;
  title: string;
  url: string; // the linked article; the discussion for a text post
  discussionUrl: string; // HN item page, Lobste.rs comments, the Dev.to article
  points: number; // HN points, Lobste.rs score, Dev.to positive reactions
  comments: number;
  description?: string; // HN page description, Dev.to description
  published: string; // ISO
}

/** The link's host, which often says what a title does not (arxiv.org, a lab's blog); "" for a bad URL. */
export const siteOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** Every fetched story, shown before or not: the log takes the latest counts of each. */
export function storiesFrom(hn: HnData, lobsters: LobstersData, devto: DevtoData): Story[] {
  return [
    ...hn.stories.map((s): Story => ({
      id: `hn:${s.id}`,
      source: "hn",
      title: s.title,
      url: s.url,
      discussionUrl: s.hnUrl,
      points: s.points,
      comments: s.comments,
      ...(s.description ? { description: s.description } : {}),
      published: s.createdAt,
    })),
    ...lobsters.stories.map((s): Story => ({
      id: `lobsters:${s.id}`,
      source: "lobsters",
      title: s.title,
      url: s.url,
      discussionUrl: s.commentsUrl,
      points: s.score,
      comments: s.commentCount,
      published: s.publishedAt,
    })),
    ...devto.articles.map((a): Story => ({
      id: `devto:${a.id}`,
      source: "devto",
      title: a.title,
      url: a.url,
      discussionUrl: a.url,
      points: a.positiveReactionsCount,
      comments: a.commentsCount,
      ...(a.description ? { description: a.description } : {}),
      published: a.publishedAt,
    })),
  ];
}

// ---------------------------------------------------------------------------
// Log: digests/spotted-log.json
// ---------------------------------------------------------------------------

export interface LoggedStory {
  source: StorySource;
  title: string;
  url: string;
  discussionUrl: string;
  points: number; // latest fetched
  comments: number; // latest fetched
  firstSeen: string; // CST date
  lastSeen: string; // CST date
  shown?: string; // CST date a page first showed it
}

export type SpottedLog = ItemsFile<LoggedStory>;

export const SPOTTED_LOG_FILE = path.join("digests", "spotted-log.json");

/**
 * The weekly page reads the 7 days before Monday's run, and a story unseen
 * this long does not return to any source's window.
 */
const LOG_UNSEEN_DAYS = 8;

/** Missing or malformed → empty: the log holds no hand edits, so a malformed one is overwritten. */
export function loadSpottedLog(file = SPOTTED_LOG_FILE): SpottedLog {
  return loadItemsFile<LoggedStory>(file, "spotted") ?? { items: {} };
}

export function saveSpottedLog(log: SpottedLog, file = SPOTTED_LOG_FILE): void {
  saveItemsFile(log, file);
}

/** A page showed the story on an earlier day. One shown today is shown again on a same-day re-run. */
export function shownBefore(log: SpottedLog, id: string, dateStr: string): boolean {
  const shown = log.items[id]?.shown;
  return shown !== undefined && shown !== dateStr;
}

/** The stories no page showed on an earlier day. */
export function freshStories(stories: Story[], log: SpottedLog, dateStr: string): Story[] {
  return stories.filter((s) => !shownBefore(log, s.id, dateStr));
}

/**
 * Each fetched story with its latest counts and `lastSeen` (a story shown on
 * an earlier day too); `shown` set for each of `shownIds` that has none;
 * entries unseen for more than LOG_UNSEEN_DAYS pruned.
 */
export function nextLog(
  log: SpottedLog,
  fetched: Story[],
  shownIds: Iterable<string>,
  dateStr: string,
): SpottedLog {
  const items = { ...log.items };
  for (const s of fetched) {
    const prev = items[s.id];
    items[s.id] = {
      source: s.source,
      title: s.title,
      url: s.url,
      discussionUrl: s.discussionUrl,
      points: s.points,
      comments: s.comments,
      firstSeen: prev?.firstSeen ?? dateStr,
      lastSeen: dateStr,
      ...(prev?.shown ? { shown: prev.shown } : {}),
    };
  }
  for (const id of shownIds) {
    const e = items[id];
    if (e && !e.shown) items[id] = { ...e, shown: dateStr };
  }
  const oldest = daysBefore(dateStr, LOG_UNSEEN_DAYS);
  return { items: Object.fromEntries(Object.entries(items).filter(([, e]) => e.lastSeen >= oldest)) };
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/** The pages with a Spotted section, in row-numbering order. */
export const SPOTTED_PAGES = ["agents", "models", "data"] as const;
export type SpottedPage = (typeof SPOTTED_PAGES)[number];

/**
 * Stories per page and source, sources in this order. No combined score:
 * HN points, Lobste.rs scores and Dev.to reactions are not comparable.
 */
export const SPOTTED_PER_SOURCE: Record<StorySource, number> = { hn: 6, lobsters: 2, devto: 2 };

export type SpottedRow = Numbered<Story & { page: SpottedPage }>;

/**
 * Each page's rows: per source the top SPOTTED_PER_SOURCE by points, sources
 * in SPOTTED_PER_SOURCE order, numbered across pages in SPOTTED_PAGES order.
 * `pageOf` is null for a story no page takes.
 */
export function selectSpotted(stories: Story[], pageOf: (story: Story) => SpottedPage | null): SpottedRow[] {
  const sources = Object.keys(SPOTTED_PER_SOURCE) as StorySource[];
  return numberRows(
    SPOTTED_PAGES.flatMap((page) =>
      sources.flatMap((source) =>
        stories
          .filter((s) => s.source === source && pageOf(s) === page)
          .sort((a, b) => b.points - a.points)
          .slice(0, SPOTTED_PER_SOURCE[source])
          .map((s) => ({ ...s, page })),
      ),
    ),
  );
}
