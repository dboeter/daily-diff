/**
 * Matches already-fetched news items (community stories, GitHub Trending) to the
 * tracked projects they mention. Lab posts are not project news: they are the models page's
 * tracked items. Pure functions — no network I/O.
 */

import type { RepoConfig } from "../core/github.ts";
import { escapeRegex } from "../core/regex.ts";
import { SPOTTED } from "../core/strings.ts";
import { linkKey, type Story } from "../spotted/pool.ts";
import type { TrendingData } from "../trending/compose.ts";
import type { CommunityPost } from "../data/community.ts";

export interface NewsItem {
  source: string;
  title: string;
  url: string;
  /** Short engagement/context line, e.g. "312 points, 95 comments". */
  detail: string;
  /** A community story's id, so a story matched into a page counts as shown. */
  id?: string;
  /** A community story's description: matching reads it, so the model must see it too. */
  description?: string;
}

export interface NewsSources {
  /** The fresh community stories: HN, Lobste.rs, Dev.to. */
  stories?: Story[];
  trending?: TrendingData;
  /** The data report's community feed posts (blogs, newsletters), already filtered to those no earlier report showed (`unshownPosts`). */
  posts?: CommunityPost[];
}

/** A community post's detail line: its feed and date; a post has no counts. */
export const postDetail = (p: Pick<CommunityPost, "kind" | "date">): string =>
  `${p.kind === "newsletter" ? "newsletter issue" : "blog post"}, ${p.date}`;

/** News items per agent, so one viral thread cannot crowd out the rest. */
export const NEWS_PER_AGENT = 5;

/**
 * The terms an agent is matched by: the full "owner/repo", plus explicit
 * keywords, else name and repo name. Keywords replace the short names rather
 * than adding to them, because a short name can be an ordinary word (Pi's
 * "pi"); the full repo path is always distinctive, so it is always included.
 */
export function agentTerms(cfg: RepoConfig): string[] {
  if (cfg.keywords?.length) return [...new Set([...cfg.keywords, cfg.repo])];
  const repoName = cfg.repo.split("/")[1] ?? cfg.repo;
  return [...new Set([cfg.name, repoName, cfg.repo])];
}

/**
 * Whole-word, case-insensitive matcher for an agent's terms. Spaces, hyphens
 * and slashes inside a term are interchangeable and optional, so "claude code"
 * matches "Claude Code", "claude-code" and "ClaudeCode", and "openai/codex"
 * matches "openai codex" (how trending repo names reach the matcher). The start
 * boundary also rejects a preceding "-" or "/", which keeps a term from
 * matching inside "raspberry-pi"; a following "-" is allowed, so
 * "Claude Code-powered" and "earendil-works" still match. "Raspberry Pi" is
 * rejected outright: Pi's "pi agent" keyword would otherwise match
 * "Raspberry Pi agent".
 */
export function agentMatcher(cfg: RepoConfig): RegExp {
  const alternatives = agentTerms(cfg).map((t) =>
    t
      .trim()
      .split(/[\s/-]+/)
      .map(escapeRegex)
      .join("[\\s/-]?"),
  );
  return new RegExp(`(?<![\\w/-])(?<!raspberry[\\s-]?)(?:${alternatives.join("|")})(?![\\w/])`, "i");
}

/**
 * Flatten the fetched sources into one list of candidate news items. `key`
 * dedupes them: a story's is its article's link (`linkKey`), so its copies on
 * other sources are one item; a trending repo's is its URL.
 */
export function collectNewsItems(sources: NewsSources): { item: NewsItem; text: string; key: string }[] {
  const out: { item: NewsItem; text: string; key: string }[] = [];

  for (const s of sources.stories ?? []) {
    out.push({
      item: {
        source: SPOTTED.sources[s.source],
        title: s.title,
        url: s.discussionUrl,
        detail: SPOTTED.counts(s.source, s.points, s.comments),
        id: s.id,
        ...(s.description ? { description: s.description } : {}),
      },
      // The description too: on 2026-10-25 a Dev.to story about OpenShell named it only there.
      text: `${s.title} ${s.description ?? ""}`,
      key: linkKey(s.url),
    });
  }

  // After the stories: a story about a post (HN linking a DuckDB blog post) and the post itself share
  // a link, so the story, with its counts, is the copy listed and the post is `claimed`.
  for (const p of sources.posts ?? []) {
    out.push({
      item: {
        source: p.source,
        title: p.title,
        url: p.url,
        detail: postDetail(p),
        id: p.id,
        ...(p.description ? { description: p.description } : {}),
      },
      text: `${p.title} ${p.description}`,
      key: linkKey(p.url),
    });
  }

  const trending = sources.trending;
  for (const r of trending?.trendingRepos ?? []) {
    out.push({
      item: {
        source: "GitHub Trending",
        title: `${r.fullName}${r.description ? ` — ${r.description}` : ""}`,
        url: r.url,
        detail: `+${r.periodStars} stars ${trending?.period === "weekly" ? "this week" : "today"} on GitHub Trending`,
      },
      text: `${r.fullName.replace("/", " ")} ${r.description}`,
      key: r.url,
    });
  }
  return out;
}

/**
 * An item naming more agents than this is a compatibility list ("works with
 * Claude Code, Codex, OpenCode…"), not news about any one of them. On
 * 2026-10-04 such trending repos took up most of every agent's news slots.
 */
export const MAX_AGENTS_PER_ITEM = 2;

/**
 * The data pool's `maxPerItem`: an item naming several projects is listed once, under the one its
 * text names first that has room. Listed under each, one post showed twice on one page (2026-10-31:
 * a dbt blog post under dbt Core and Iceberg).
 */
export const FIRST_NAMED = "first-named";

/**
 * News items per tracked project id. An item naming up to `maxPerItem`
 * projects is listed under each; one naming more is dropped (default
 * MAX_AGENTS_PER_ITEM, for the agents and infra pool); FIRST_NAMED lists it
 * under one, however many it names. Items keep source order (community stories, then
 * trending), each `key` once: the first copy listed under a project claims it, so a copy whose title
 * names no project, or only projects whose lists are full, leaves the article to another copy.
 *
 * A GitHub Trending repo is news only for the project whose own repo it is:
 * trending there is a daily event. A third-party repo naming a project is not
 * (on 2026-10-19 vakandi/opencode-rust, vastsa/PI-Desktop and three more made
 * 10 of 16 agents "active"), and GitHub Search results never are: the topic
 * queries sort by stars, so they return the same large repos every day.
 */
export function matchProjectNews(
  agents: RepoConfig[],
  sources: NewsSources,
  maxPerItem: number | typeof FIRST_NAMED = MAX_AGENTS_PER_ITEM,
): Map<string, NewsItem[]> {
  const matchers = agents.map((cfg) => ({
    id: cfg.id,
    re: agentMatcher(cfg),
    ownUrl: `https://github.com/${cfg.repo}`.toLowerCase(),
  }));
  const result = new Map<string, NewsItem[]>(agents.map((cfg) => [cfg.id, []]));
  const claimed = new Set<string>();

  for (const { item, text, key } of collectNewsItems(sources)) {
    if (claimed.has(key)) continue;
    const hits = matchers.filter((m) =>
      item.source === "GitHub Trending" ? item.url.toLowerCase() === m.ownUrl : m.re.test(text),
    );
    if (hits.length === 0 || (maxPerItem !== FIRST_NAMED && hits.length > maxPerItem)) continue;
    if (maxPerItem === FIRST_NAMED) hits.sort((a, b) => text.search(a.re) - text.search(b.re));
    const open = hits.map(({ id }) => result.get(id)!).filter((list) => list.length < NEWS_PER_AGENT);
    const lists = maxPerItem === FIRST_NAMED ? open.slice(0, 1) : open;
    if (lists.length === 0) continue;
    claimed.add(key);
    for (const list of lists) list.push(item);
  }

  return result;
}
