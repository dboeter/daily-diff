/**
 * Spotted: the community stories (Hacker News, Lobste.rs, Dev.to) of a day,
 * minus the ones a page showed on an earlier day (by id or link), each link
 * once, each routed to its topic's page (`src/spotted/jev.ts`). The log
 * `digests/spotted-log.json` records what was fetched and what a page showed.
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

/** What a story table row reads (`renderSpottedTable`): a Spotted row, or a Most discussed row from the log. */
export type StoryRow = Numbered<
  Pick<Story, "id" | "source" | "title" | "url" | "discussionUrl" | "points" | "comments" | "description">
>;

/** The link's host, which often says what a title does not (arxiv.org, a lab's blog); "" for a bad URL. */
export const siteOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/**
 * A story's link as a dedupe key: no scheme, `www.`, fragment, trailing slash
 * or `utm_*` parameters, host lowercased. Other parameters stay: an HN text
 * post's link is `news.ycombinator.com/item?id=N`. Unparsable → itself, trimmed.
 */
export function linkKey(url: string): string {
  try {
    const u = new URL(url.trim());
    for (const k of [...u.searchParams.keys()]) if (k.startsWith("utm_")) u.searchParams.delete(k);
    const query = u.searchParams.toString();
    return `${u.host.toLowerCase().replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}${query ? `?${query}` : ""}`;
  } catch {
    return url.trim();
  }
}

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
  description?: string; // cut at LOGGED_DESCRIPTION_CHARS, for Trends' Most discussed summaries
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

/** A logged description's length: enough for a summary, without growing the committed log much. */
const LOGGED_DESCRIPTION_CHARS = 300;

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

/**
 * The stories no page showed on an earlier day, by id or by link (`linkKey`,
 * any source), each link once: the first copy in pool order (HN, Lobste.rs,
 * Dev.to: `storiesFrom`) wins.
 */
export function freshStories(stories: Story[], log: SpottedLog, dateStr: string): Story[] {
  const seen = new Set(
    Object.values(log.items)
      .filter((e) => e.shown !== undefined && e.shown !== dateStr)
      .map((e) => linkKey(e.url)),
  );
  return stories.filter((s) => {
    const key = linkKey(s.url);
    if (shownBefore(log, s.id, dateStr) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
      ...(s.description ? { description: s.description.slice(0, LOGGED_DESCRIPTION_CHARS) } : {}),
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

/** A page's Spotted rows and the summaries call's answers, by row number. */
export interface SpottedSection {
  rows: SpottedRow[];
  summaries: Map<number, string>;
}

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

/** Trends' Most discussed per source, sources in this order; every topic counts. */
export const MOST_DISCUSSED_PER_SOURCE: Record<StorySource, number> = { hn: 5, lobsters: 3, devto: 3 };

/**
 * Trends' Most discussed: the logged stories first seen in the 7 days before
 * the run (the run's own stories enter the log after the page is built, so
 * each day counts in one week), per source the top MOST_DISCUSSED_PER_SOURCE
 * by comments. A story a daily page showed (`shown`, any day) or takes today
 * (`showing`: the run's project news and Spotted rows) is left out, by id or
 * link; each link once, in the first source whose rows take it. Unnumbered:
 * the page numbers them after its papers.
 */
export function mostDiscussed(
  log: SpottedLog,
  dateStr: string,
  showing: Pick<Story, "id" | "url">[],
): Omit<StoryRow, "n">[] {
  const from = daysBefore(dateStr, 7);
  const showingIds = new Set(showing.map((s) => s.id));
  const taken = new Set([
    ...showing.map((s) => linkKey(s.url)),
    ...Object.values(log.items)
      .filter((e) => e.shown)
      .map((e) => linkKey(e.url)),
  ]);
  const week = Object.entries(log.items).filter(
    ([id, e]) =>
      e.firstSeen >= from &&
      e.firstSeen < dateStr &&
      !e.shown &&
      !showingIds.has(id) &&
      !taken.has(linkKey(e.url)),
  );
  return (Object.keys(MOST_DISCUSSED_PER_SOURCE) as StorySource[]).flatMap((source) => {
    // Only a row claims its link: a copy below one source's cut can be a later source's row.
    const rows: [string, LoggedStory][] = [];
    for (const [id, e] of week
      .filter(([, e]) => e.source === source)
      .sort(([, a], [, b]) => b.comments - a.comments)) {
      if (rows.length === MOST_DISCUSSED_PER_SOURCE[source]) break;
      const key = linkKey(e.url);
      if (taken.has(key)) continue;
      taken.add(key);
      rows.push([id, e]);
    }
    return rows.map(([id, e]) => ({
      id,
      source: e.source,
      title: e.title,
      url: e.url,
      discussionUrl: e.discussionUrl,
      points: e.points,
      comments: e.comments,
      ...(e.description ? { description: e.description } : {}),
    }));
  });
}
