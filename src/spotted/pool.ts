/**
 * Spotted: the community stories (Hacker News, Lobste.rs, Dev.to) of a day,
 * minus the ones a page showed on an earlier day (by id or link), each routed
 * to its topic's page (`src/spotted/topics.ts`), each link shown once. The log
 * `digests/spotted-log.json` records what was fetched and what a page showed.
 */

import path from "node:path";
import { daysBefore } from "../core/date.ts";
import { loadItemsFile, saveItemsFile, type DroppedReason, type ItemsFile } from "../core/jev.ts";
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
  description?: string; // HN page description, Lobste.rs text or page description, Dev.to description
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
 * A story's link as a dedupe key: no scheme, `www.`, trailing slash or `utm_*`
 * parameters, host lowercased, and no fragment unless it is a route (`#/…`,
 * `#!/…`: a single-page app's path). Other parameters stay: an HN text post's
 * link is `news.ycombinator.com/item?id=N`. Unparsable → itself, trimmed.
 */
export function linkKey(url: string): string {
  try {
    const u = new URL(url.trim());
    for (const k of [...u.searchParams.keys()]) if (k.startsWith("utm_")) u.searchParams.delete(k);
    const query = u.searchParams.toString();
    const route = /^#!?\//.test(u.hash) ? u.hash : "";
    return `${u.host.toLowerCase().replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}${query ? `?${query}` : ""}${route}`;
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
      ...(s.description ? { description: s.description } : {}),
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

/** A page showed it on an earlier day: what a page shows today, a same-day re-run shows again. */
const shownEarlier = (shown: string | undefined, dateStr: string): boolean =>
  shown !== undefined && shown !== dateStr;

/**
 * Whether a story is in today's pool: no page showed it, or another copy of its
 * link (`linkKey`, any source), on an earlier day. A link shown today keeps all
 * its copies in for a same-day re-run, which claims it again.
 */
export function isFresh(log: SpottedLog, dateStr: string): (story: Pick<Story, "id" | "url">) => boolean {
  const shownLinks = new Set(
    Object.values(log.items)
      .filter((e) => shownEarlier(e.shown, dateStr))
      .map((e) => linkKey(e.url)),
  );
  return (s) => !shownEarlier(log.items[s.id]?.shown, dateStr) && !shownLinks.has(linkKey(s.url));
}

/**
 * Today's pool (`isFresh`). Every copy of a link stays: a project's news, or
 * else a Spotted row, claims it, and a copy that lands nowhere leaves it to
 * another.
 */
export function freshStories(stories: Story[], log: SpottedLog, dateStr: string): Story[] {
  return stories.filter(isFresh(log, dateStr));
}

/**
 * Today's pool by what shows each link, tracked parts first (placement rule 4):
 * `lab`, the stories whose link is a lab post the models page lists (its row
 * shows them), and `spotted`, the rest that no project's news took
 * (`newsLinks`, `linkKey`s), for routing. Every copy of a link goes the same way.
 */
export function splitPool(
  fresh: Story[],
  newsLinks: Set<string>,
  labUrls: string[],
): { lab: Story[]; spotted: Story[] } {
  const labLinks = new Set(labUrls.map(linkKey));
  return {
    lab: fresh.filter((s) => labLinks.has(linkKey(s.url))),
    spotted: fresh.filter((s) => !labLinks.has(linkKey(s.url)) && !newsLinks.has(linkKey(s.url))),
  };
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
 * Up to `cap` of `stories`, in order, skipping a link in `taken`; each one taken claims its link.
 * `onDrop` hears every story left out and why.
 */
function claimRows<T extends Pick<Story, "url">>(
  stories: T[],
  cap: number,
  taken: Set<string>,
  onDrop?: (story: T, reason: DroppedReason) => void,
): T[] {
  const rows: T[] = [];
  for (const s of stories) {
    if (rows.length === cap) {
      onDrop?.(s, "cap");
      continue;
    }
    const key = linkKey(s.url);
    if (taken.has(key)) {
      onDrop?.(s, "repeat");
      continue;
    }
    taken.add(key);
    rows.push(s);
  }
  return rows;
}

/**
 * Each page's rows: per source the top SPOTTED_PER_SOURCE by points, sources
 * in SPOTTED_PER_SOURCE order, numbered across pages in SPOTTED_PAGES order.
 * Each link once: a row claims its link in that order, so a copy below its
 * source's cut, or on no page, leaves the link to a copy that makes a row.
 * `pageOf` is null for a story no page takes. `dropped`, when given, gets every story without a row
 * and why (for the trace).
 */
export function selectSpotted(
  stories: Story[],
  pageOf: (story: Story) => SpottedPage | null,
  dropped?: Map<string, DroppedReason>,
): SpottedRow[] {
  const sources = Object.keys(SPOTTED_PER_SOURCE) as StorySource[];
  const taken = new Set<string>();
  for (const s of stories) if (pageOf(s) === null) dropped?.set(s.id, "routing");
  return numberRows(
    SPOTTED_PAGES.flatMap((page) =>
      sources.flatMap((source) =>
        claimRows(
          stories
            .filter((s) => s.source === source && pageOf(s) === page)
            .sort((a, b) => b.points - a.points),
          SPOTTED_PER_SOURCE[source],
          taken,
          (s, reason) => dropped?.set(s.id, reason),
        ).map((s) => ({ ...s, page })),
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
 * by comments. A story a page showed on an earlier day (`shown`: a same-day
 * re-run shows today's rows again) or a daily page shows today (`showing`: the
 * run's project news and Spotted rows) is left out, by id or link; each link
 * once, in the first source whose rows take it. Unnumbered: the page numbers
 * them after its papers.
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
      .filter((e) => shownEarlier(e.shown, dateStr))
      .map((e) => linkKey(e.url)),
  ]);
  const week = Object.entries(log.items)
    .filter(
      ([id, e]) =>
        e.firstSeen >= from &&
        e.firstSeen < dateStr &&
        !shownEarlier(e.shown, dateStr) &&
        !showingIds.has(id),
    )
    .map(([id, e]) => ({ id, ...e }));
  return (Object.keys(MOST_DISCUSSED_PER_SOURCE) as StorySource[]).flatMap((source) =>
    claimRows(
      week.filter((e) => e.source === source).sort((a, b) => b.comments - a.comments),
      MOST_DISCUSSED_PER_SOURCE[source],
      taken,
    ).map((e) => ({
      id: e.id,
      source: e.source,
      title: e.title,
      url: e.url,
      discussionUrl: e.discussionUrl,
      points: e.points,
      comments: e.comments,
      ...(e.description ? { description: e.description } : {}),
    })),
  );
}
