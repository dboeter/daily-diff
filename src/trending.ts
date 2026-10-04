/**
 * Trending data: GitHub trending and AI topic search (daily, for agent news;
 * weekly for the trending report), plus OpenRouter app/model popularity and
 * npm coding-agent downloads on the weekly run.
 */

import { fetchOpenRouterData, type OpenRouterData } from "./openrouter.ts";
import { fetchNpmData, type NpmData } from "./npm.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrendingRepo {
  fullName: string;
  description: string;
  language: string;
  /** Stars gained in the scraped period: today, or this week on the weekly run. */
  periodStars: number;
  totalStars: number;
  forks: number;
  url: string;
}

export interface SearchRepo {
  fullName: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  pushedAt: string;
  url: string;
  searchQuery: string;
}

export interface TrendingData {
  trendingRepos: TrendingRepo[];
  searchRepos: SearchRepo[];
  trendingFetchSuccess: boolean;
  /** Weekly run only; EMPTY_OPENROUTER on daily runs. */
  openrouter: OpenRouterData;
  /** Weekly run only; EMPTY_NPM on daily runs. */
  npm: NpmData;
}

export const EMPTY_OPENROUTER: OpenRouterData = {
  apps: [],
  topModels: [],
  topModelsDate: "",
  newModels: [],
  fetchSuccess: false,
};
export const EMPTY_NPM: NpmData = { rising: [], top: [], fetchSuccess: false };

/** True when any source produced data — the report is skipped only if all failed. */
export function hasTrendingData(data: TrendingData): boolean {
  return (
    data.trendingRepos.length > 0 ||
    data.searchRepos.length > 0 ||
    data.openrouter.fetchSuccess ||
    data.npm.fetchSuccess
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Repos active (pushed) in the last 7 days, by stars. Favors established repos. */
const SEARCH_QUERIES = [
  { q: "topic:llm", label: "llm" },
  { q: "topic:ai-agent", label: "ai-agent" },
  { q: "topic:rag", label: "rag" },
  { q: "topic:vector-database", label: "vector-db" },
  { q: "topic:large-language-model", label: "llm-model" },
  { q: "topic:machine-learning", label: "ml" },
];

/**
 * Weekly run only. Repos created in the last 14 days, by stars — surfaces new
 * agents that the pushed-based queries rank below old, high-star repos.
 * `claude-code` and `mcp` are left out: their new repos are mostly plugins and
 * MCP servers. Weekly-only because search quota is shared with fetchHotIssues.
 */
const NEW_REPO_QUERIES = [
  { q: "topic:coding-agent", label: "new:coding-agent" },
  { q: "topic:agentic-coding", label: "new:agentic-coding" },
];

// ---------------------------------------------------------------------------
// GitHub Trending HTML fetch
// ---------------------------------------------------------------------------

export function parseTrendingHtml(html: string): TrendingRepo[] {
  const repos: TrendingRepo[] = [];

  // Split by article blocks
  const articlePattern =
    /<article[^>]*class="[^"]*Box-row[^"]*"[\s\S]*?(?=<article[^>]*class="[^"]*Box-row[^"]*"|$)/g;
  const blocks = html.match(articlePattern) ?? [];

  for (const block of blocks) {
    try {
      // fullName from <h2> > <a href="/owner/repo">
      const nameMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]+href="\/([^/"]+\/[^/"]+)"/);
      if (!nameMatch?.[1]) continue;
      const fullName = nameMatch[1].trim();

      // description from col-9 paragraph
      const descMatch = block.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/);
      const description = descMatch?.[1] ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      // language
      const langMatch = block.match(/<span[^>]+itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/);
      const language = langMatch?.[1] ? langMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      // stars gained in the period ("1,234 stars today" / "… this week")
      const periodMatch = block.match(/([\d,]+)\s+stars?\s+(?:today|this week)/i);
      const periodStars = periodMatch?.[1] ? parseInt(periodMatch[1].replace(/,/g, ""), 10) : 0;

      // total stars — look for link with /stargazers. The octicon is a nested
      // <svg><path d="…"/></svg>, so skip arbitrary markup but never past </a>.
      const totalMatch = block.match(/href="\/[^"]+\/stargazers"[^>]*>(?:(?!<\/a>)[\s\S])*?([\d,]+)\s*<\/a>/);
      const totalStars = totalMatch?.[1] ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : 0;

      // forks
      const forkMatch = block.match(/href="\/[^"]+\/forks"[^>]*>(?:(?!<\/a>)[\s\S])*?([\d,]+)\s*<\/a>/);
      const forks = forkMatch?.[1] ? parseInt(forkMatch[1].replace(/,/g, ""), 10) : 0;

      repos.push({
        fullName,
        description,
        language,
        periodStars,
        totalStars,
        forks,
        url: `https://github.com/${fullName}`,
      });
    } catch {
      // single block parse failure is non-fatal
    }
  }

  return repos;
}

async function fetchGitHubTrending(
  period: TrendingPeriod,
): Promise<{ repos: TrendingRepo[]; success: boolean }> {
  try {
    const resp = await fetch(`https://github.com/trending?since=${period}&spoken_language_code=`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; daily-diff/1.0)",
        Accept: "text/html",
      },
    });
    if (!resp.ok) {
      console.error(`  [trending] HTTP ${resp.status} fetching github.com/trending`);
      return { repos: [], success: false };
    }

    const html = await resp.text();
    const repos = parseTrendingHtml(html);

    if (repos.length === 0) {
      console.error("  [trending] Parsed 0 repos — HTML structure may have changed");
      return { repos: [], success: false };
    }

    console.log(`  [trending] Parsed ${repos.length} trending repos from HTML`);
    return { repos, success: true };
  } catch (err) {
    console.error(`  [trending] Fetch failed: ${err}`);
    return { repos: [], success: false };
  }
}

// ---------------------------------------------------------------------------
// GitHub Search API
// ---------------------------------------------------------------------------

interface SearchApiItem {
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  html_url: string;
}

interface SearchApiResponse {
  items: SearchApiItem[];
}

/** `fourteenDaysAgo` null skips the new-repo queries. */
async function searchAiRepos(sevenDaysAgo: string, fourteenDaysAgo: string | null): Promise<SearchRepo[]> {
  const token = process.env["GITHUB_TOKEN"] ?? "";
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const seen = new Set<string>();
  const all: SearchRepo[] = [];

  // New-repo queries first: dedupe keeps the first label, and `new:*` is the signal worth keeping.
  const queries = [
    ...(fourteenDaysAgo
      ? NEW_REPO_QUERIES.map((s) => ({ ...s, q: `${s.q}+created:>${fourteenDaysAgo}` }))
      : []),
    ...SEARCH_QUERIES.map((s) => ({ ...s, q: `${s.q}+pushed:>${sevenDaysAgo}` })),
  ];

  // Fetch in parallel, dedupe afterwards in query order so labels don't depend on response timing.
  const results = await Promise.all(
    queries.map(async ({ q, label }) => {
      try {
        const query = `${q}&sort=stars&order=desc`;
        const url = `https://api.github.com/search/repositories?q=${query}&per_page=15`;
        const resp = await fetch(url, { headers });
        if (!resp.ok) {
          console.error(`  [trending/search] "${label}": HTTP ${resp.status}`);
          return [];
        }
        const data = (await resp.json()) as SearchApiResponse;
        return data.items ?? [];
      } catch (err) {
        console.error(`  [trending/search] "${label}": ${err}`);
        return [];
      }
    }),
  );

  queries.forEach(({ label }, i) => {
    let added = 0;
    for (const item of results[i]!) {
      if (!seen.has(item.full_name)) {
        seen.add(item.full_name);
        all.push({
          fullName: item.full_name,
          description: item.description,
          language: item.language,
          stargazersCount: item.stargazers_count,
          pushedAt: item.pushed_at,
          url: item.html_url,
          searchQuery: label,
        });
        added++;
      }
    }
    console.log(`  [trending/search] "${label}": ${added} new repos`);
  });

  return all;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * "daily" feeds the agents report's news matching; "weekly" (on the weekly run)
 * also feeds the trending report, which would otherwise summarize one day's list.
 */
export type TrendingPeriod = "daily" | "weekly";

export async function fetchTrendingData(period: TrendingPeriod = "daily"): Promise<TrendingData> {
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const weekly = period === "weekly";

  const [{ repos: trendingRepos, success }, searchRepos, openrouter, npm] = await Promise.all([
    fetchGitHubTrending(period),
    searchAiRepos(daysAgo(7), weekly ? daysAgo(14) : null),
    weekly ? fetchOpenRouterData().catch((): OpenRouterData => EMPTY_OPENROUTER) : EMPTY_OPENROUTER,
    weekly ? fetchNpmData().catch((): NpmData => EMPTY_NPM) : EMPTY_NPM,
  ]);

  return { trendingRepos, searchRepos, trendingFetchSuccess: success, openrouter, npm };
}
