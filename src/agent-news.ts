/**
 * Matches already-fetched news items (HN, Anthropic/OpenAI web pages, GitHub
 * Trending) to the agents they mention. Pure functions — no network I/O.
 */

import type { RepoConfig } from "./github.ts";
import type { HnData } from "./hn.ts";
import type { WebFetchResult } from "./web.ts";
import type { TrendingData } from "./trending.ts";

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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The terms an agent is matched by: explicit keywords, else name and repo name. */
export function agentTerms(cfg: RepoConfig): string[] {
  if (cfg.keywords?.length) return cfg.keywords;
  const repoName = cfg.repo.split("/")[1] ?? cfg.repo;
  return [...new Set([cfg.name, repoName])];
}

/**
 * Whole-word, case-insensitive matcher for an agent's terms. Spaces and hyphens
 * inside a term are interchangeable and optional, so "claude code" matches
 * "Claude Code", "claude-code" and "ClaudeCode". The boundaries also reject a
 * neighbouring "-" or "/", which keeps "pi" from matching inside "api" or
 * "raspberry-pi".
 */
export function agentMatcher(cfg: RepoConfig): RegExp {
  const alternatives = agentTerms(cfg).map((t) =>
    t
      .trim()
      .split(/[\s-]+/)
      .map(escapeRegex)
      .join("[\\s-]?"),
  );
  return new RegExp(`(?<![\\w/-])(?:${alternatives.join("|")})(?![\\w/-])`, "i");
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
        detail: `+${r.todayStars} stars on GitHub Trending`,
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
 * News items per agent id. An item naming one or two agents is listed under
 * each; one naming more is dropped (see MAX_AGENTS_PER_ITEM). Items keep source
 * order (HN rank, then web, then trending) and are de-duplicated by URL.
 */
export function matchAgentNews(agents: RepoConfig[], sources: NewsSources): Map<string, NewsItem[]> {
  const matchers = agents.map((cfg) => ({ id: cfg.id, re: agentMatcher(cfg) }));
  const result = new Map<string, NewsItem[]>(agents.map((cfg) => [cfg.id, []]));
  const seen = new Set<string>();

  for (const { item, text } of collectNewsItems(sources)) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    const hits = matchers.filter((m) => m.re.test(text));
    if (hits.length === 0 || hits.length > MAX_AGENTS_PER_ITEM) continue;
    for (const { id } of hits) {
      const list = result.get(id)!;
      if (list.length < NEWS_PER_AGENT) list.push(item);
    }
  }

  return result;
}
