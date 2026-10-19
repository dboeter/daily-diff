/**
 * Matches already-fetched news items (HN, Anthropic/OpenAI web pages, GitHub
 * Trending) to the agents they mention. Pure functions — no network I/O.
 */

import type { RepoConfig } from "../core/github.ts";
import type { HnData } from "../sources/hn.ts";
import type { WebFetchResult } from "../sources/web.ts";
import type { TrendingData } from "../trending/trending.ts";

export interface NewsItem {
  source: string;
  title: string;
  url: string;
  /** Short engagement/context line, e.g. "312 points, 95 comments". */
  detail: string;
}

export interface NewsSources {
  hn?: HnData;
  web?: WebFetchResult[];
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

/** Flatten the fetched sources into one list of candidate news items. */
export function collectNewsItems(sources: NewsSources): { item: NewsItem; text: string }[] {
  const out: { item: NewsItem; text: string }[] = [];

  for (const s of sources.hn?.stories ?? []) {
    out.push({
      item: {
        source: "Hacker News",
        title: s.title,
        url: s.hnUrl,
        detail: `${s.points} points, ${s.comments} comments`,
      },
      text: s.title,
    });
  }

  for (const site of sources.web ?? []) {
    for (const p of site.newItems) {
      // The URL slug often names the product when the title is generic.
      const slug = p.url.replace(/^https?:\/\/[^/]+/, "").replace(/[/_-]+/g, " ");
      out.push({
        item: { source: site.siteName, title: p.title, url: p.url, detail: p.category },
        text: `${p.title} ${slug}`,
      });
    }
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
    });
  }
  for (const r of trending?.searchRepos ?? []) {
    out.push({
      item: {
        source: "GitHub Search",
        title: `${r.fullName}${r.description ? ` — ${r.description}` : ""}`,
        url: r.url,
        detail: `${r.stargazersCount} stars`,
      },
      text: `${r.fullName.replace("/", " ")} ${r.description ?? ""}`,
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
 * MAX_AGENTS_PER_ITEM, for the agents and infra pool). Items keep source order (HN rank, then web, then
 * trending) and are de-duplicated by URL.
 *
 * An agent's own repo in the GitHub Search results is not news about it: the
 * topic queries sort by stars, so a large agent repo (QwenPaw, 35k stars) is
 * returned every day. On GitHub Trending its own repo still counts — trending
 * there is a daily event.
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
  const seen = new Set<string>();

  for (const { item, text } of collectNewsItems(sources)) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    const ownSearchResult = (m: { ownUrl: string }) =>
      item.source === "GitHub Search" && item.url.toLowerCase() === m.ownUrl;
    const hits = matchers.filter((m) => m.re.test(text) && !ownSearchResult(m));
    if (hits.length === 0 || hits.length > maxPerItem) continue;
    for (const { id } of hits) {
      const list = result.get(id)!;
      if (list.length < NEWS_PER_AGENT) list.push(item);
    }
  }

  return result;
}
