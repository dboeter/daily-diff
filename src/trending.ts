/**
 * Trending data: GitHub trending and AI topic search (daily, for agent news;
 * weekly for the trending report), plus OpenRouter app/model popularity and
 * npm coding-agent downloads on the weekly run.
 */

import { fetchOpenRouterData, type OpenRouterData } from "./openrouter.ts";
import { fetchNpmData, type NpmData } from "./npm.ts";
import { fetchWeeklyStarGain, GitHubApiError, searchSlot } from "./github.ts";
import {
  buildRadarCandidates,
  loadStarHistory,
  NEW_REPO_MIN_STARS,
  nextStarHistory,
  npmKey,
  openrouterKey,
  radarPool,
  rankGithubRepos,
  RELATIVE_MIN_BASELINE,
  selectTrendingReport,
  urlMerge,
  type GithubRow,
  type StarHistory,
  type TrendingReportData,
} from "./trending-rank.ts";
import {
  buildTrendingRankingFile,
  cachedClassifications,
  classifyItems,
  fallbackClassification,
  inScope,
  loadClassifyCache,
  loadMatchState,
  matchApps,
  nextClassifyCache,
  onRadar,
  type AskJev,
  type Classification,
  type ClassifyCache,
  type ClassifyItem,
  type MatchState,
  type MatchTrace,
} from "./trending-jev.ts";
import { askJev } from "./jev.ts";

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
  createdAt: string;
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
  /** Ranked and selected report rows; weekly run only, undefined on daily runs or when ranking failed. */
  report?: TrendingReportData;
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

/**
 * Agent topics searched, most specific first: dedupe keeps the first query's
 * label, the fallback category (`TOPIC_CATEGORIES`). `ai-agent` and
 * `multi-agent` were dropped on 2026-10-07: their top repos were stock bots,
 * slide generators and RAG apps. `claude-code` and `mcp` are left out: their
 * repos are mostly plugins and MCP servers. Each request adds ~2 s to the fetch
 * phase: searchSlot paces the search API's 30 requests a minute.
 */
const SEARCH_TOPICS = [
  "coding-agent",
  "agentic-coding",
  "ai-coding",
  "agent-harness",
  "harness",
  "agent-orchestration",
];

/**
 * Weekly pages of 100 per established-repo query. On 2026-10-07 the largest,
 * `coding-agent`, had 188 repos with 100+ stars pushed that week; all six topics
 * gave 565 unique repos from 16 requests.
 */
const MAX_SEARCH_PAGES = 3;
/** Daily runs only feed agent news, which needs the top repos, not the whole pool. */
const DAILY_PER_TOPIC = 15;

/**
 * History-API calls per weekly run. The Actions GITHUB_TOKEN allows 1,000 core
 * requests an hour per repository and the rest of the run makes ~60–80 (releases,
 * skills, issues, labels, close-stale), so 500 never starves issue creation.
 * Only the first run, or one after a missed Monday, comes near it: otherwise the
 * star history covers every repo seen the week before.
 */
const MAX_STAR_HISTORY_CALLS = 500;

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
  created_at: string;
  html_url: string;
}

interface SearchApiResponse {
  items: SearchApiItem[];
}

interface SearchQuery {
  q: string;
  /** The topic, kept as `searchQuery`. */
  label: string;
  /** For the log: the topic, plus "(new)" for the creation-date query. */
  name: string;
  perPage: number;
  maxPages: number;
}

/**
 * Weekly (`fourteenDaysAgo` set): per topic, repos created in 14 days with
 * NEW_REPO_MIN_STARS (the Radar's new agents) and repos pushed in 7 days with
 * RELATIVE_MIN_BASELINE stars, every page (the category tables' pool, wide
 * enough that a mid-size repo with a big week is in it). Sorted by total
 * stars, the pushed query alone is an all-time leaderboard: it needs the
 * second query for new repos and the star gain to rank. Daily: the top
 * DAILY_PER_TOPIC pushed repos per topic, for agent news.
 */
export async function searchAiRepos(
  sevenDaysAgo: string,
  fourteenDaysAgo: string | null,
): Promise<SearchRepo[]> {
  const token = process.env["GITHUB_TOKEN"] ?? "";
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const queries: SearchQuery[] = SEARCH_TOPICS.flatMap((topic): SearchQuery[] =>
    fourteenDaysAgo
      ? [
          {
            q: `topic:${topic}+created:>${fourteenDaysAgo}+stars:>=${NEW_REPO_MIN_STARS}`,
            label: topic,
            name: `${topic} (new)`,
            perPage: 100,
            maxPages: 1,
          },
          {
            q: `topic:${topic}+pushed:>${sevenDaysAgo}+stars:>=${RELATIVE_MIN_BASELINE}`,
            label: topic,
            name: topic,
            perPage: 100,
            maxPages: MAX_SEARCH_PAGES,
          },
        ]
      : [
          {
            q: `topic:${topic}+pushed:>${sevenDaysAgo}`,
            label: topic,
            name: topic,
            perPage: DAILY_PER_TOPIC,
            maxPages: 1,
          },
        ],
  );

  // A short page is the last one. A failed page keeps the pages before it.
  const searchPages = async ({ q, name, perPage, maxPages }: SearchQuery): Promise<SearchApiItem[]> => {
    const items: SearchApiItem[] = [];
    try {
      for (let page = 1; page <= maxPages; page++) {
        await searchSlot();
        const url =
          `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc` +
          `&per_page=${perPage}&page=${page}`;
        const resp = await fetch(url, { headers });
        if (!resp.ok) {
          console.error(`  [trending/search] "${name}" page ${page}: HTTP ${resp.status}`);
          break;
        }
        const pageItems = ((await resp.json()) as SearchApiResponse).items ?? [];
        items.push(...pageItems);
        if (pageItems.length < perPage) break;
      }
    } catch (err) {
      console.error(`  [trending/search] "${name}": ${err}`);
    }
    return items;
  };

  // Fetch in parallel, dedupe afterwards in query order so labels don't depend on response timing.
  const results = await Promise.all(queries.map(searchPages));

  const seen = new Set<string>();
  const all: SearchRepo[] = [];
  queries.forEach(({ label, name }, i) => {
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
          createdAt: item.created_at,
          url: item.html_url,
          searchQuery: label,
        });
        added++;
      }
    }
    console.log(`  [trending/search] "${name}": ${added} new repos`);
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

export async function fetchTrendingData(period: TrendingPeriod, dateStr: string): Promise<TrendingData> {
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const weekly = period === "weekly";

  const [{ repos: trendingRepos, success }, searchRepos, openrouter, npm] = await Promise.all([
    fetchGitHubTrending(period),
    searchAiRepos(daysAgo(7), weekly ? daysAgo(14) : null),
    weekly ? fetchOpenRouterData().catch((): OpenRouterData => EMPTY_OPENROUTER) : EMPTY_OPENROUTER,
    weekly ? fetchNpmData().catch((): NpmData => EMPTY_NPM) : EMPTY_NPM,
  ]);

  const data: TrendingData = { trendingRepos, searchRepos, trendingFetchSuccess: success, openrouter, npm };
  if (!weekly || !hasTrendingData(data)) return data;

  // Caught here, not left to the caller: index.ts wraps fetchTrendingData in
  // `.catch(() => empty)`, so a throw would also wipe trendingRepos and
  // searchRepos — Monday's agent news.
  try {
    return { ...data, report: await composeTrendingReport(data, dateStr) };
  } catch (err) {
    console.error(`  [trending] ranking failed: ${err}`);
    return data;
  }
}

/**
 * History-API gains for the rows nothing else measured that could reach the
 * report: new repos the Radar would show, established repos in scope. One call
 * at a time (the endpoint answers 422 when "spammed"), new rows first, then by
 * total stars, at most MAX_STAR_HISTORY_CALLS.
 */
async function fetchMissingGains(
  rows: GithubRow[],
  classifications: Map<string, Classification>,
  fetchGain: (repo: string) => Promise<number>,
): Promise<Map<string, number>> {
  const reachesReport = (r: GithubRow) => {
    const c = classifications.get(r.key);
    if (c === undefined) return false;
    return r.isNew ? r.totalStars >= NEW_REPO_MIN_STARS && onRadar(c) : inScope(c);
  };
  // Rows without a gain come sorted by total stars (`rankGithubRepos`).
  const missing = rows.filter((r) => r.gain === null && reachesReport(r));
  const queue = [...missing.filter((r) => r.isNew), ...missing.filter((r) => !r.isNew)];

  const fetched = new Map<string, number>();
  let failed = 0;
  let tried = 0;
  for (const row of queue.slice(0, MAX_STAR_HISTORY_CALLS)) {
    tried++;
    try {
      fetched.set(row.fullName.toLowerCase(), await fetchGain(row.fullName));
    } catch (err) {
      failed++;
      console.error(`  [trending] star history ${row.fullName}: ${err}`);
      // A rate limit or a "spammed" 422 fails every later call too, and each one spends quota.
      if (err instanceof GitHubApiError && [403, 422, 429].includes(err.status)) break;
    }
  }
  const known = rows.filter((r) => r.gain !== null).length;
  console.log(
    `  [trending] Star gains: ${known} from the trending page, star history or age; ` +
      `${fetched.size} fetched, ${failed} failed, ${queue.length - tried} not tried ` +
      `(${rows.length - known - queue.length} cannot reach the report)`,
  );
  return fetched;
}

/**
 * Rank, classify, match and select the weekly report's rows. The defaults are
 * the production inputs; tests inject the key, the match state, `ask`, the star
 * history, the classification cache and `fetchGain`.
 */
export async function composeTrendingReport(
  data: TrendingData,
  dateStr: string,
  apiKey = process.env["TYPESAFE_API_KEY"],
  matchState: MatchState | null = loadMatchState(),
  ask: AskJev = askJev,
  // Weekly only: daily runs never compose, so they never read or write the file.
  history: StarHistory = loadStarHistory(),
  // Null (unreadable file): every item is asked and the file is left as it is.
  classifyCache: ClassifyCache | null = loadClassifyCache(),
  fetchGain: (repo: string) => Promise<number> = fetchWeeklyStarGain,
): Promise<TrendingReportData> {
  // Every GitHub row is classified: the new ones are Radar candidates, the rest
  // category rows. Classified before the gains are complete, so the history API
  // is only asked about rows in scope; a verdict is saved, a gain is not.
  const itemsFor = (rows: GithubRow[]): ClassifyItem[] => [
    ...rows.map((row): ClassifyItem => ({ kind: "github", key: row.key, row })),
    ...data.openrouter.apps.map(
      (app): ClassifyItem => ({ kind: "openrouter", key: openrouterKey(app), app }),
    ),
    ...[...data.npm.rising, ...data.npm.top].map(
      (pkg): ClassifyItem => ({ kind: "npm", key: npmKey(pkg), pkg }),
    ),
  ];
  const firstRows = rankGithubRepos(data.trendingRepos, data.searchRepos, dateStr, history);
  const firstItems = itemsFor(firstRows);
  // Saved verdicts are Jev's, so they hold without a key or when this run's calls
  // fail; only the rest is asked, and `classifiedBy` describes those.
  const saved = classifyCache
    ? cachedClassifications(classifyCache, firstItems)
    : new Map<string, Classification>();
  const asked = firstItems.filter((item) => !saved.has(item.key));
  const byJev = apiKey ? await classifyItems(asked, apiKey, ask) : null;
  const classifiedBy = byJev ? "jev" : "topics";
  const classifications = new Map(
    firstItems.map((item) => [
      item.key,
      saved.get(item.key) ?? byJev?.get(item.key) ?? fallbackClassification(item),
    ]),
  );
  console.log(
    `  [trending] Classified ${classifications.size} items: ${saved.size} saved, the rest ` +
      (byJev
        ? "by Jev"
        : `by topic labels (fallback: ${apiKey ? "too many Jev failures" : "no TYPESAFE_API_KEY"})`),
  );

  const fetched = await fetchMissingGains(firstRows, classifications, fetchGain);
  const githubRows =
    fetched.size > 0
      ? rankGithubRepos(data.trendingRepos, data.searchRepos, dateStr, history, fetched)
      : firstRows;
  // The trace and the cache read the final rows' gains.
  const items = itemsFor(githubRows);
  const candidates = buildRadarCandidates(data.openrouter.apps, data.npm, githubRows, dateStr);

  // Matching needs a readable state file; without one (null) it is skipped and nothing is saved.
  let links: [string, string][] = [];
  let nextMatches: MatchState | undefined;
  let matchTrace: MatchTrace[] = [];
  let matchModels: string[] = [];
  let matchCalled = false;
  if (matchState !== null) {
    const pool = radarPool(candidates, classifications);
    const m = await matchApps(urlMerge(pool), pool, matchState, apiKey, dateStr, ask);
    ({ links, trace: matchTrace, models: matchModels, called: matchCalled } = m);
    nextMatches = m.state;
    console.log(`  [trending] Cross-source matches applied: ${links.length}`);
  }

  const report = selectTrendingReport(githubRows, candidates, classifications, classifiedBy, links);
  console.log(
    `  [trending] Radar: ${report.radar.length} rows | ` +
      (report.categories.map((c) => `${c.category}: ${c.rows.length}`).join(", ") || "no category rows"),
  );
  const rankingFile =
    classifiedBy === "jev" || matchCalled
      ? buildTrendingRankingFile(items, classifications, classifiedBy, matchTrace, matchModels)
      : undefined;
  return {
    ...report,
    ...(rankingFile !== undefined ? { rankingFile } : {}),
    ...(nextMatches !== undefined ? { nextMatches } : {}),
    ...(classifyCache
      ? { nextClassifications: nextClassifyCache(classifyCache, items, classifications, dateStr) }
      : {}),
    nextStarHistory: nextStarHistory(history, githubRows, dateStr),
  };
}
