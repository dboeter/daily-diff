/**
 * The data report's community feeds (config.yml `data.community`): engineering
 * blogs and newsletters, RSS 2.0 or Atom, read through src/core/rss.ts. Jev
 * judges every post here before news matching: a release or technical post
 * that names a tracked project is that project's news (`matchProjectNews`, the
 * data pool); the rest are News & discussion candidates. A failing feed is
 * logged and skipped. Spike and decisions:
 * `.scratch/data-watch/issues/12-community-sources.md`.
 */

import path from "node:path";
import type { CommunityFeed, CommunityKind } from "../core/config.ts";
import {
  droppedFor,
  judgeItems,
  loadItemsFile,
  LOW_CONFIDENCE,
  renderedAt,
  sourceCounts,
  type AskJev,
  type ChoiceAnswer,
  type DroppedReason,
  type Judgment,
  type RankedBy,
  type VerdictCache,
} from "../core/jev.ts";
import { fetchRssFeed, NEWS_MAX_AGE_DAYS, plainText, recentNewsItems } from "../core/rss.ts";
import { numberRows, type Numbered } from "../reports/summarized-table.ts";
import { DATA_KEYWORD_PATTERNS } from "../sources/hn.ts";
import { linkKey } from "../spotted/pool.ts";

/** One post of a community feed. */
export interface CommunityPost {
  /** `post:<linkKey>`: the feed's guid is not stable across feed generators, the link is. */
  id: string;
  /** The feed's display name (config `name`). */
  source: string;
  kind: CommunityKind;
  title: string;
  url: string;
  /** ISO. */
  published: string;
  /** YYYY-MM-DD. */
  date: string;
  /** Plain text, truncated (`plainText`); "" when the feed gives none. */
  description: string;
}

/** A post's description as Jev and the summaries see it. Substack-length posts would otherwise swamp the prompt. */
const POST_DESCRIPTION_MAX_CHARS = 1000;

export const postId = (url: string): string => `post:${linkKey(url)}`;

/** A post's link without Medium's `?source=rss----…` tracking parameter; other parameters stay. */
export function cleanPostUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.get("source")?.startsWith("rss")) u.searchParams.delete("source");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * The posts no earlier report showed, as news under a project or as a News &
 * discussion row: `reported` is the data state's map (`post:` keys → CST date
 * first reported). A post reported today stays, so a same-day re-run shows the
 * same ones. Applied before `matchProjectNews` (a post is a project's news once,
 * not for the 7 days it stays in its feed) and again in the builder for callers
 * that bypass the pipeline.
 */
export function unshownPosts(
  posts: CommunityPost[],
  reported: Record<string, string> | undefined,
  dateStr: string,
): CommunityPost[] {
  return posts.filter((p) => (reported?.[p.id] ?? dateStr) === dateStr);
}

/**
 * Every configured feed's posts of the last NEWS_MAX_AGE_DAYS at `now`
 * (`recentNewsItems`: timestamps, not calendar dates, so a UTC post date and
 * the CST run date cannot disagree at the edge), fetched in parallel, one per
 * link. `counts` is per feed name: null when its fetch failed. Never throws.
 */
export async function fetchCommunityPosts(
  feeds: CommunityFeed[],
  now: Date,
): Promise<{ posts: CommunityPost[]; fetchSuccess: boolean; counts: Record<string, number | null> }> {
  const results = await Promise.allSettled(
    feeds.map((f) => fetchRssFeed(f.url, (html) => plainText(html, POST_DESCRIPTION_MAX_CHARS))),
  );
  const seen = new Set<string>();
  const posts = results.flatMap((r, i) => {
    const feed = feeds[i]!;
    if (r.status === "rejected") {
      console.log(
        `  [community] ${feed.name} failed: ${r.reason instanceof Error ? r.reason.message : r.reason}`,
      );
      return [];
    }
    const recent = recentNewsItems(r.value, now).filter((item) => item.link);
    console.log(
      `  [community] ${feed.name}: ${r.value.length} items, ${recent.length} in the last ${NEWS_MAX_AGE_DAYS} days`,
    );
    return recent.flatMap((item): CommunityPost[] => {
      const url = cleanPostUrl(item.link);
      const id = postId(url);
      if (seen.has(id)) return [];
      seen.add(id);
      return [
        {
          id,
          source: feed.name,
          kind: feed.kind,
          title: item.title,
          url,
          published: item.published,
          date: item.published.slice(0, 10),
          description: item.description,
        },
      ];
    });
  });
  const counts = Object.fromEntries(
    results.map((r, i) => [feeds[i]!.name, r.status === "fulfilled" ? r.value.length : null]),
  );
  return { posts, fetchSuccess: feeds.length === 0 || results.some((r) => r.status === "fulfilled"), counts };
}

// ---------------------------------------------------------------------------
// Relevance: Jev's insight score and audience choice, cached per post
// ---------------------------------------------------------------------------

/** `state` is `{ title, description, source }`. */
const QUESTIONS = {
  insight: {
    type: "score",
    instructions:
      "How much does the post from `source`, described by `title` and `description`, teach a data engineer about building or running a data platform?",
    criteria: [
      {
        what: "Nothing: marketing, a customer story, an event, hiring, a product announcement or a roundup of links",
        examples: [
          "a customer success story",
          "a conference or webinar announcement",
          "a release announcement restating a changelog",
          "a partnership or funding post",
        ],
      },
      {
        what: "Some: a how-to, a tutorial or an opinion a data engineer might skim",
        examples: [
          "a getting-started tutorial",
          "an opinion on data team organisation",
          "a feature walkthrough",
        ],
      },
      {
        what: "Substantial: a technique, a measured result, a migration or failure report, a design decision explained",
        examples: [
          "a benchmark with numbers and method",
          "a postmortem of a pipeline failure",
          "how a format or engine works internally",
          "a migration between platforms with what broke",
        ],
      },
    ],
  },
  audience: {
    type: "choice",
    instructions:
      "Which part of a data consultancy's stack is the post in `title` and `description` about? The consultancy's clients run Databricks, Snowflake, Azure with Microsoft Fabric, Google Cloud with BigQuery, and the open-source data tools (dbt, Airflow, Dagster, Prefect, dlt, Iceberg, Delta Lake, DuckDB, Polars, Trino, Kafka).",
    criteria: {
      databricks: {
        what: "Databricks, Delta Lake, Unity Catalog, MLflow",
        examples: ["a Databricks cost post", "Delta Lake internals"],
      },
      snowflake: {
        what: "Snowflake, Snowpark, Polaris",
        examples: ["Snowpark Python", "Snowflake cost controls"],
      },
      azure_fabric: {
        what: "Azure data services and Microsoft Fabric",
        examples: ["OneLake", "Fabric pipelines", "Azure Data Factory"],
      },
      gcp: { what: "Google Cloud data services", examples: ["BigQuery", "Dataflow", "Dataproc"] },
      open_source_stack: {
        what: "An open-source data tool or format",
        examples: ["dbt", "Airflow", "Iceberg", "DuckDB", "Polars", "Kafka", "a query engine"],
      },
      general_data_engineering: {
        what: "Data engineering practice without one platform: modelling, quality, lineage, team practice, architecture",
        examples: ["data contracts", "medallion architecture critique", "how to run a data team"],
      },
      off_audience: {
        what: "Not data engineering",
        examples: ["a career post", "AI model news", "a marketing or company post", "consumer software"],
      },
    },
  },
  // Gates project news, not the insight score: insight scored "Announcing Polars 2.1" 0.01 and the
  // dbt blog's customer stories at confidence 0 (2026-10-31), so it cannot tell news from marketing.
  kind: {
    type: "choice",
    instructions: "What kind of post from `source`, described by `title` and `description`, is this?",
    criteria: {
      release: {
        what: "A release, a new feature or a deprecation of a tool or platform",
        examples: ["Announcing Polars 2.1", "a feature now generally available"],
      },
      technical: {
        what: "A technical post: how something works, a technique, a benchmark, a migration, a design decision",
        examples: ["how a query engine plans joins", "a tutorial", "lessons from building a driver"],
      },
      customer_story: {
        what: "A customer or user story told by the vendor: how a company uses the product",
        examples: ["How Acme cut costs 30% with X", "What Y learned running X at scale"],
      },
      marketing: {
        what: "An event, webinar, community roundup, newsletter, hiring or partnership post",
        examples: ["monthly community news", "a conference recap"],
      },
    },
  },
};

export interface CommunityAnswers {
  /** Probability-weighted level, 0–2, and how sure Jev is of it. */
  insight: { score: number; confidence?: number };
  audience: ChoiceAnswer;
  kind: ChoiceAnswer;
}

export type Audience = keyof typeof QUESTIONS.audience.criteria;
type Kind = keyof typeof QUESTIONS.kind.criteria;
/** The kinds a post naming a tracked project is that project's news as. */
const NEWS_KINDS: ReadonlySet<string> = new Set<Kind>(["release", "technical"]);

/** Insight a kept post needs, on the 0–2 scale: "Some" alone is not a row, a sure "Some" leaning "Substantial" is. */
export const INSIGHT_MIN = 1.2;
const OFF_AUDIENCE: Audience = "off_audience";

/**
 * The decision Jev's answers weigh into. `keep`: a News & discussion row; `news`: may be a
 * tracked project's news. `relevance` is the insight score, for the trace and the order.
 */
export interface CommunityVerdict {
  keep: boolean;
  news: boolean;
  audience: Audience;
  relevance: number;
}

/** Throws on an unexpected shape, so the call counts as failed (or a saved entry as missing: one saved before `kind` is asked again). */
export function communityVerdict(a: CommunityAnswers): CommunityVerdict {
  const score = a?.insight?.score;
  const audience = a?.audience?.choice;
  const kind = a?.kind?.choice;
  if (
    typeof score !== "number" ||
    typeof audience !== "string" ||
    !Object.hasOwn(QUESTIONS.audience.criteria, audience) ||
    typeof kind !== "string" ||
    !Object.hasOwn(QUESTIONS.kind.criteria, kind)
  ) {
    throw new Error(`Unexpected Jev answers: ${JSON.stringify(a)}`);
  }
  // An unsure insight score counts as unknown: it neither keeps nor drops on its own, so it drops.
  const confident = (a.insight.confidence ?? 1) >= LOW_CONFIDENCE;
  return {
    keep: confident && score >= INSIGHT_MIN && audience !== OFF_AUDIENCE,
    news: NEWS_KINDS.has(kind),
    audience: audience as Audience,
    relevance: score,
  };
}

/** Posts the keyword fallback never keeps: the feeds' marketing shapes. */
const MARKETING_RE =
  /\b(webinar|customer story|case study|success story|we'?re hiring|join us|recap|summit|conference|meetup|partnership|funding|press release|newsletter #?\d)/i;

/**
 * Without Jev (no key, or more than half the new calls failed): a post naming a data term
 * (the HN data filter's patterns) and no marketing shape is kept, at relevance 1; a post
 * with no marketing shape may be news.
 */
export function keywordVerdict(p: Pick<CommunityPost, "title" | "description">): CommunityVerdict {
  const text = `${p.title} ${p.description}`;
  const news = !MARKETING_RE.test(text);
  const keep = news && DATA_KEYWORD_PATTERNS.some((re) => re.test(text));
  return { keep, news, audience: "general_data_engineering", relevance: keep ? 1 : 0 };
}

// ---------------------------------------------------------------------------
// Verdict cache and selection
// ---------------------------------------------------------------------------

export type CommunityVerdicts = VerdictCache<CommunityAnswers>;

export const COMMUNITY_VERDICTS_FILE = path.join("digests", "community-verdicts.json");
/** A post leaves the NEWS_MAX_AGE_DAYS window, so an id unseen this long will not return. */
const VERDICT_UNSEEN_DAYS = 30;

/** Missing → empty. Malformed → null: every post is asked and nothing is saved, so a hand edit survives. */
export function loadCommunityVerdicts(file = COMMUNITY_VERDICTS_FILE): CommunityVerdicts | null {
  return loadItemsFile(file, "community");
}

/** Rows the News & discussion table shows at most: a reading list, not a feed reader. */
export const MAX_COMMUNITY_ROWS = 6;

/** A News & discussion row. */
export type CommunityRow = Numbered<CommunityPost & { audience: Audience }>;

export interface CommunitySelection {
  /** The rows, newest first, numbered in that order (after `numberAfter`). */
  rows: CommunityRow[];
  rankedBy: RankedBy;
  /** null when the verdict file was malformed: it is left as it is. */
  nextVerdicts: CommunityVerdicts | null;
  /** `community-trace.json`: every candidate post with its answers and decision. */
  traceFile: string;
}

export type CommunityJudgment = Judgment<CommunityPost, CommunityAnswers, CommunityVerdict>;

/** Jev's verdict on every post (saved ones reused), before news matching: `news` gates matching. */
export function judgeCommunityPosts(
  posts: CommunityPost[],
  jev: { apiKey?: string; cache: CommunityVerdicts | null; dateStr: string; ask?: AskJev },
): Promise<CommunityJudgment> {
  return judgeItems(posts, {
    ...jev,
    tag: "community",
    request: (p) => ({
      state: { title: p.title, description: p.description, source: p.source },
      questions: QUESTIONS,
    }),
    decide: (a: CommunityAnswers) => communityVerdict(a),
    unseenDays: VERDICT_UNSEEN_DAYS,
  });
}

const verdictIn =
  (judgment: CommunityJudgment) =>
  (p: CommunityPost): CommunityVerdict =>
    judgment.verdicts.get(p.id) ?? keywordVerdict(p);

/** The posts that may be a tracked project's news: a release or technical post, not a customer story or marketing. */
export function newsPosts(posts: CommunityPost[], judgment: CommunityJudgment): CommunityPost[] {
  const verdictOf = verdictIn(judgment);
  return posts.filter((p) => verdictOf(p).news);
}

/**
 * The News & discussion rows among `posts` (the fetched posts no project took as
 * news and no earlier report showed): the verdict in `judgment` (else `keywordVerdict`)
 * keeps a post; a kept post whose link another row of the report already shows
 * (`taken`, `linkKey`s) is `repeat`; per feed the top `cap` by insight, then the
 * top MAX_COMMUNITY_ROWS overall (`cap` in the trace), shown newest first.
 * `numberAfter`: the rows are numbered after the report's vendor and release
 * rows, for the one summaries call.
 */
export function selectCommunityPosts(
  posts: CommunityPost[],
  opts: {
    feeds: CommunityFeed[];
    judgment: CommunityJudgment;
    /** Items per feed (null: failed), for the trace's `sources` header. */
    fetched: Record<string, number | null>;
    /** Links the report's other rows show (project news, Spotted). */
    taken?: Set<string>;
    numberAfter?: number;
  },
): CommunitySelection {
  const { feeds, judgment, fetched, taken = new Set<string>(), numberAfter = 0 } = opts;
  const verdictOf = verdictIn(judgment);
  const dropped = new Map<string, DroppedReason>();
  const kept = posts.filter((p) => {
    const v = verdictOf(p);
    if (!v.keep) dropped.set(p.id, "threshold");
    else if (taken.has(linkKey(p.url))) dropped.set(p.id, "repeat");
    return v.keep && !taken.has(linkKey(p.url));
  });
  const capOf = new Map(feeds.map((f) => [f.name, f.cap]));
  const byInsight = (a: CommunityPost, b: CommunityPost) =>
    verdictOf(b).relevance - verdictOf(a).relevance || b.published.localeCompare(a.published);
  const perFeed = [...new Set(kept.map((p) => p.source))].flatMap((source) => {
    const ranked = kept.filter((p) => p.source === source).sort(byInsight);
    const cap = capOf.get(source) ?? 1;
    for (const p of ranked.slice(cap)) dropped.set(p.id, "cap");
    return ranked.slice(0, cap);
  });
  const picked = perFeed.sort(byInsight).slice(0, MAX_COMMUNITY_ROWS);
  for (const p of perFeed.slice(MAX_COMMUNITY_ROWS)) dropped.set(p.id, "cap");
  const rows = numberRows(
    picked
      .sort((a, b) => b.published.localeCompare(a.published))
      .map((p) => ({ ...p, audience: verdictOf(p).audience })),
    numberAfter,
  );
  console.log(
    `  [community] Kept ${rows.length}/${posts.length} posts` +
      `${judgment.rankedBy === "keywords" ? " (no Jev: keyword rules)" : ""}`,
  );
  const rowOf = new Map(rows.map((r) => [r.id, r.n]));
  const traceRows = posts.map((p) => ({
    id: p.id,
    title: p.title,
    source: p.source,
    ...(rowOf.has(p.id) ? renderedAt(rowOf.get(p.id)!) : droppedFor(dropped.get(p.id) ?? "threshold")),
    audience: verdictOf(p).audience,
    ...judgment.traceFields(p),
    ...(judgment.verdicts.has(p.id) ? {} : { keyword: keywordVerdict(p).keep }),
  }));
  return {
    rows,
    rankedBy: judgment.rankedBy,
    nextVerdicts: judgment.nextCache,
    traceFile: judgment.traceFile(traceRows, {
      sources: sourceCounts(
        fetched,
        posts.map((p) => p.source),
      ),
      insight_min: INSIGHT_MIN,
    }),
  };
}
