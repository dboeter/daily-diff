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

/** Boilerplate a linked page's meta description carries in place of content. */
const DESCRIPTION_BOILERPLATE = [
  /Contribute to [\w.-]+\/[\w.-]+ development by creating an account on GitHub\.?/gi,
  /\s+-\s+[\w.-]+\/[\w.-]+\s*$/, // GitHub's trailing " - owner/repo"
  // A sentence that opens with it: "A CLI to subscribe to RSS feeds" is content.
  /(?:^|(?<=[.!?] ))Subscribe (now |today )?(for|to)\b[^.]*\.?/gi,
  /(\.{3}|…)\s*$/,
];

/**
 * A story's description without page boilerplate, whitespace collapsed; undefined when nothing is
 * left. On 2026-10-26 a Spotted row read "Contribute to microsoft/Agensh development by creating an
 * account on GitHub." and a Most discussed row "Subscribe for daily updates."
 */
export function cleanStoryDescription(description: string | undefined): string | undefined {
  let d = (description ?? "").replace(/\s+/g, " ").trim();
  for (const re of DESCRIPTION_BOILERPLATE) d = d.replace(re, "").trim();
  return d || undefined;
}

/** `cleanStoryDescription` as an optional `description` field. */
const describedBy = (description: string | undefined) => {
  const d = cleanStoryDescription(description);
  return d ? { description: d } : {};
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
      ...describedBy(s.description),
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
      ...describedBy(s.description),
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
      ...describedBy(a.description),
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
  cut?: string; // CST date Spotted's per-source cap alone left it out: next day's pool takes it again
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
 * The stories Spotted's cap cut yesterday (`cut`) that no page showed and today's fetch did not
 * return, rebuilt from the log for one more chance in today's pool. On 2026-10-25 a Dev.to story
 * about OpenShell (agents 0.99) was cut by the cap and Dev.to's 2-day window dropped it the next day.
 * Its publish date is unknown: the log's first-seen date stands in.
 */
export function carriedStories(log: SpottedLog, fetched: Story[], dateStr: string): Story[] {
  const yesterday = daysBefore(dateStr, 1);
  const fetchedIds = new Set(fetched.map((s) => s.id));
  const fetchedLinks = new Set(fetched.map((s) => linkKey(s.url)));
  return Object.entries(log.items)
    .filter(
      ([id, e]) =>
        e.cut === yesterday && !e.shown && !fetchedIds.has(id) && !fetchedLinks.has(linkKey(e.url)),
    )
    .map(([id, e]) => ({
      id,
      source: e.source,
      title: e.title,
      url: e.url,
      discussionUrl: e.discussionUrl,
      points: e.points,
      comments: e.comments,
      ...describedBy(e.description),
      published: `${e.firstSeen}T00:00:00Z`,
    }));
}

/**
 * Each fetched story with its latest counts and `lastSeen` (a story shown on
 * an earlier day too); `shown` set for each of `shownIds` that has none; `cut`
 * set to today for each of `cutIds` (Spotted's cap left it out) that no page showed;
 * entries unseen for more than LOG_UNSEEN_DAYS pruned.
 */
export function nextLog(
  log: SpottedLog,
  fetched: Story[],
  shownIds: Iterable<string>,
  dateStr: string,
  cutIds: Iterable<string> = [],
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
      ...(prev?.cut ? { cut: prev.cut } : {}),
    };
  }
  for (const id of shownIds) {
    const e = items[id];
    if (e && !e.shown) items[id] = { ...e, shown: dateStr };
  }
  for (const id of cutIds) {
    const e = items[id];
    if (e && !e.shown) items[id] = { ...e, cut: dateStr };
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
  /** A floor on the next row, given the rows taken so far: a story under it is dropped as `threshold`. */
  passes?: (story: T, taken: number) => boolean,
): T[] {
  const rows: T[] = [];
  for (const s of stories) {
    if (passes && !passes(s, rows.length)) {
      onDrop?.(s, "threshold");
      continue;
    }
    const key = linkKey(s.url);
    if (taken.has(key)) {
      onDrop?.(s, "repeat");
      continue;
    }
    // Checked last: `cap` means the story would have been a row, which is what carries it to tomorrow.
    if (rows.length === cap) {
      onDrop?.(s, "cap");
      continue;
    }
    taken.add(key);
    rows.push(s);
  }
  return rows;
}

/**
 * A routed story needs this probability for its topic to be Spotted. On 2026-10-26 DetectorScope
 * (agents 0.43) and the AI graveyard (models 0.53) made rows on topics Jev was unsure of.
 */
export const SPOTTED_MIN_TOPIC_PROBABILITY = 0.6;
/** A story published longer ago is not news, however late a source surfaces it (a 25-day-old post, 2026-10-26). */
export const SPOTTED_MAX_AGE_DAYS = 7;
/** Once a page has this many rows, a further row needs SPOTTED_MIN_POINTS: no 8-point row beside 491. */
export const SPOTTED_ROWS_BEFORE_FLOOR = 3;
/** Each source's own scale (HN points, Lobste.rs score, Dev.to reactions); stories are fetched hours old. */
export const SPOTTED_MIN_POINTS: Record<StorySource, number> = { hn: 5, lobsters: 3, devto: 10 };

/** Dev.to challenge entries open with this line: three Hacktoberfest entries in two days on 2026-10-25/26. */
export const isContestEntry = (s: Pick<Story, "title" | "description">): boolean =>
  /\bthis is a submission for\b/i.test(`${s.title} ${s.description ?? ""}`);

/** Topic probability in tenths: a sure story ranks above an unsure one, points decide within a band. */
const confidenceBand = (p: number | undefined) => Math.round((p ?? 1) * 10);

/**
 * Each page's rows: per source up to SPOTTED_PER_SOURCE, sources in SPOTTED_PER_SOURCE order,
 * ranked by topic probability band, then points; numbered across pages in SPOTTED_PAGES order.
 * Left out before ranking (`threshold`): a topic probability under SPOTTED_MIN_TOPIC_PROBABILITY,
 * a story over SPOTTED_MAX_AGE_DAYS old (when `dateStr` is given) and a contest entry; while
 * ranking, a story under SPOTTED_MIN_POINTS once its page has SPOTTED_ROWS_BEFORE_FLOOR rows.
 * Each link once: a row claims its link in that order, so a copy below its source's cut, or on no
 * page, leaves the link to a copy that makes a row. `pageOf` is null for a story no page takes;
 * `probabilityOf` is undefined without a Jev verdict (the keyword fallback), which passes.
 * `dropped`, when given, gets every story without a row and why (for the trace).
 */
export function selectSpotted(
  stories: Story[],
  pageOf: (story: Story) => SpottedPage | null,
  dropped?: Map<string, DroppedReason>,
  opts: { dateStr?: string; probabilityOf?: (story: Story) => number | undefined } = {},
): SpottedRow[] {
  const sources = Object.keys(SPOTTED_PER_SOURCE) as StorySource[];
  const probability = (s: Story) => opts.probabilityOf?.(s);
  const oldest = opts.dateStr ? daysBefore(opts.dateStr, SPOTTED_MAX_AGE_DAYS) : "";
  const eligible = stories.filter((s) => {
    if (pageOf(s) === null) {
      dropped?.set(s.id, "routing");
      return false;
    }
    const p = probability(s);
    const tooOld = oldest !== "" && s.published.slice(0, 10) < oldest;
    if ((p !== undefined && p < SPOTTED_MIN_TOPIC_PROBABILITY) || tooOld || isContestEntry(s)) {
      dropped?.set(s.id, "threshold");
      return false;
    }
    return true;
  });
  const taken = new Set<string>();
  return numberRows(
    SPOTTED_PAGES.flatMap((page) => {
      const rows: Story[] = [];
      for (const source of sources) {
        const ranked = eligible
          .filter((s) => s.source === source && pageOf(s) === page)
          .sort(
            (a, b) => confidenceBand(probability(b)) - confidenceBand(probability(a)) || b.points - a.points,
          );
        const claimed = claimRows(
          ranked,
          SPOTTED_PER_SOURCE[source],
          taken,
          (s, reason) => dropped?.set(s.id, reason),
          (s, sourceRows) =>
            rows.length + sourceRows < SPOTTED_ROWS_BEFORE_FLOOR || s.points >= SPOTTED_MIN_POINTS[source],
        );
        rows.push(...claimed);
      }
      return rows.map((s) => ({ ...s, page }));
    }),
  );
}

/** The Overview's "Also talked about" stories per source, sources in this order. */
export const TALKED_ABOUT_PER_SOURCE: Record<StorySource, number> = { hn: 3, lobsters: 1, devto: 1 };
/**
 * Points a story routed to no page needs for the Overview, per source: 32 of 45 judged stories were
 * `other` on 2026-10-26, so only the much-discussed ones (an AI-found PHP RCE at 452 points) make it.
 */
export const TALKED_ABOUT_MIN_POINTS: Record<StorySource, number> = { hn: 50, lobsters: 10, devto: 20 };
/**
 * The Overview's policy list per source, apart from `other`: on 2026-10-28 three `other` essays
 * (605, 542, 402 points) took HN's slots from Claude's illegally obtained books (323) and police AI (279).
 */
export const POLICY_TALK_PER_SOURCE: Record<StorySource, number> = { hn: 2, lobsters: 1, devto: 1 };
/** Points a policy story needs for the Overview, per source: the same bar as `other`. */
export const POLICY_TALK_MIN_POINTS: Record<StorySource, number> = { hn: 50, lobsters: 10, devto: 20 };
const POLICY_TOPIC = "policy";

/** An Overview "Also talked about" row: a story with the topic Jev routed it to. */
export type TalkedAboutRow = Pick<
  Story,
  "id" | "source" | "title" | "url" | "discussionUrl" | "points" | "comments"
> & {
  topic: string;
};

/**
 * The Overview's lists of stories routed to a topic with no page (the maintainer's choices of
 * 2026-10-26 and 10-28): `policy` first, per source the top POLICY_TALK_PER_SOURCE by points with
 * at least POLICY_TALK_MIN_POINTS, then the rest (`other`, "Also talked about"), per source the top
 * TALKED_ABOUT_PER_SOURCE with at least TALKED_ABOUT_MIN_POINTS; at most SPOTTED_MAX_AGE_DAYS old,
 * no contest entry, each link once and none a Spotted row took (`taken`, `linkKey`s). No topic
 * probability floor: a story split between policy and other goes by its leading topic.
 */
export function selectTalkedAbout(
  stories: Story[],
  topicOf: (story: Story) => string | undefined,
  pageOf: (story: Story) => SpottedPage | null,
  dateStr: string,
  taken: Set<string>,
): TalkedAboutRow[] {
  const oldest = daysBefore(dateStr, SPOTTED_MAX_AGE_DAYS);
  const claimed = new Set(taken);
  const lanes = [
    { isPolicy: true, perSource: POLICY_TALK_PER_SOURCE, minPoints: POLICY_TALK_MIN_POINTS },
    { isPolicy: false, perSource: TALKED_ABOUT_PER_SOURCE, minPoints: TALKED_ABOUT_MIN_POINTS },
  ];
  return lanes
    .flatMap(({ isPolicy, perSource, minPoints }) =>
      (Object.keys(perSource) as StorySource[]).flatMap((source) =>
        claimRows(
          stories
            .filter(
              (s) =>
                s.source === source &&
                topicOf(s) !== undefined &&
                (topicOf(s) === POLICY_TOPIC) === isPolicy &&
                pageOf(s) === null &&
                s.points >= minPoints[source] &&
                s.published.slice(0, 10) >= oldest &&
                !isContestEntry(s),
            )
            .sort((a, b) => b.points - a.points),
          perSource[source],
          claimed,
        ),
      ),
    )
    .map((s) => ({
      id: s.id,
      source: s.source,
      title: s.title,
      url: s.url,
      discussionUrl: s.discussionUrl,
      points: s.points,
      comments: s.comments,
      topic: topicOf(s)!,
    }));
}

/** Trends' Most discussed per source, sources in this order. */
export const MOST_DISCUSSED_PER_SOURCE: Record<StorySource, number> = { hn: 5, lobsters: 3, devto: 3 };
/** Comments a Most discussed row needs, per source: a 0-comment Lobste.rs row stood among 500-comment threads (2026-10-26). */
export const MOST_DISCUSSED_MIN_COMMENTS: Record<StorySource, number> = { hn: 20, lobsters: 3, devto: 5 };
/** The Spotted topic that is off the reader's subjects: never Most discussed. */
const OFF_AUDIENCE_TOPIC = "other";

/**
 * Trends' Most discussed: the logged stories first seen in the 7 days before
 * the run (the run's own stories enter the log after the page is built, so
 * each day counts in one week), per source the top MOST_DISCUSSED_PER_SOURCE
 * by comments, each with at least MOST_DISCUSSED_MIN_COMMENTS and not routed to the `other` topic
 * (`topicOf`: its saved Spotted verdict; unknown passes). A story a page showed on an earlier day (`shown`: a same-day
 * re-run shows today's rows again) or a daily page shows today (`showing`: the
 * run's project news and Spotted rows) is left out, by id or link; each link
 * once, in the first source whose rows take it. Unnumbered: main() numbers
 * them after the Spotted rows, for the one story summaries call.
 */
export function mostDiscussed(
  log: SpottedLog,
  dateStr: string,
  showing: Pick<Story, "id" | "url">[],
  topicOf: (id: string) => string | undefined = () => undefined,
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
        !showingIds.has(id) &&
        e.comments >= MOST_DISCUSSED_MIN_COMMENTS[e.source] &&
        topicOf(id) !== OFF_AUDIENCE_TOPIC,
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
      // Logged before descriptions were cleaned at fetch.
      ...describedBy(e.description),
    })),
  );
}
