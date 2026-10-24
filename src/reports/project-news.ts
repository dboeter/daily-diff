/**
 * Matches already-fetched news items (community stories, GitHub Trending) to the
 * tracked projects they mention. Lab posts are not project news: they are the models page's
 * tracked items. Pure functions — no network I/O.
 */

import type { RepoConfig } from "../core/github.ts";
import { SPOTTED } from "../core/strings.ts";
import { linkKey, type Story } from "../spotted/spotted.ts";
import type { TrendingData } from "../trending/trending.ts";

export interface NewsItem {
  source: string;
  title: string;
  url: string;
  /** Short engagement/context line, e.g. "312 points, 95 comments". */
  detail: string;
  /** A community story's id, so a story matched into a page counts as shown. */
  id?: string;
}

export interface NewsSources {
  /** The fresh community stories: HN, Lobste.rs, Dev.to. */
  stories?: Story[];
  trending?: TrendingData;
}

/** News items per agent, so one viral thread cannot crowd out the rest. */
export const NEWS_PER_AGENT = 5;

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
      },
      text: s.title,
      key: linkKey(s.url),
    });
  }

  const trending = sources.trending;
  for (const r of trending?.trendingRepos ?? []) {
    out.push({
      item: {
        source: "GitHub Trending",
        title: `${r.fullName}${r.description ? ` — ${r.description}` : ""}`,
        url: r.url,
        detail: `+${r.periodStars} stars on GitHub Trending`,
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
 * News items per tracked project id. An item naming up to `maxPerItem`
 * projects is listed under each; one naming more is dropped (default
 * MAX_AGENTS_PER_ITEM, for the agents and infra pool). Items keep source order (community stories, then
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
  maxPerItem = MAX_AGENTS_PER_ITEM,
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
    if (hits.length === 0 || hits.length > maxPerItem) continue;
    const lists = hits.map(({ id }) => result.get(id)!).filter((list) => list.length < NEWS_PER_AGENT);
    if (lists.length === 0) continue;
    claimed.add(key);
    for (const list of lists) list.push(item);
  }

  return result;
}
