/**
 * The Trends page's data and composition: GitHub Trending and the AI topic
 * search (daily, for agent news; weekly for the Trends page), plus OpenRouter
 * app/model popularity and npm coding-agent downloads on the weekly run, and
 * `composeTrendingReport`, which classifies, ranks, matches and selects the page's rows.
 */

import { fetchOpenRouterData, type OpenRouterData } from "../sources/openrouter.ts";
import { pageDescription } from "../sources/hn.ts";
import { fetchNpmData, type NpmData } from "./npm.ts";
import { fetchWeeklyStarGain, GitHubApiError, githubGet, searchSlot } from "../core/github.ts";
import {
  buildRadarCandidates,
  loadStarHistory,
  NEW_REPO_DAYS,
  MIN_STARS,
  NEW_REPO_MIN_STARS,
  nextStarHistory,
  lastWeekFigures,
  lastWeekKeys,
  radarFigures,
  reportedKeys,
  npmKey,
  openrouterKey,
  radarPool,
  rankGithubRepos,
  reachesReport,
  selectTrendingReport,
  urlMerge,
  type GithubRow,
  type StarHistory,
  type TrendingReportData,
} from "./rank.ts";
import {
  buildTrendingTraceFile,
  classifyTrendingItems,
  loadTrendingVerdicts,
  type Classification,
  type TrendingVerdicts,
  type ClassifyItem,
} from "./classify.ts";
import { loadMatchState, matchApps, type MatchState, type MatchTrace } from "./match.ts";
import { askJev, type AskJev, type DroppedReason } from "../core/jev.ts";

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
  /** The search topic that found it, first in `SEARCH_TOPICS` order. */
  topic: string;
}

export interface TrendingData {
  trendingRepos: TrendingRepo[];
  searchRepos: SearchRepo[];
  /** False when every topic search failed; absent on daily runs (no search) and in old fixtures. */
  searchFetchSuccess?: boolean;
  trendingFetchSuccess: boolean;
  /** The trending page's window, which `periodStars` counts over; absent in old fixtures. */
  period?: TrendingPeriod;
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
 * topic, the fallback category (`TOPIC_CATEGORIES`). `ai-agent` and
 * `multi-agent` were dropped on 2026-10-07: their top repos were stock bots,
 * slide generators and RAG apps. `claude-code` and `mcp` are left out: their
 * repos are mostly plugins and MCP servers. Each request adds ~2 s to the fetch
 * phase: searchSlot paces the search API's 30 requests a minute.
 */
export const SEARCH_TOPICS = [
  "coding-agent",
  "agentic-coding",
  "ai-coding",
  "agent-harness",
  "harness",
  "agent-orchestration",
] as const;
export type SearchTopic = (typeof SEARCH_TOPICS)[number];

/**
 * Repos active this week: pushed within this many days. Daily (agent news) and
 * weekly alike, so not tied to the weekly star-gain window.
 */
const SEARCH_PUSHED_DAYS = 7;

/**
 * Weekly pages of 100 per established-repo query. On 2026-10-07 the largest,
 * `coding-agent`, had 188 repos with 100+ stars pushed that week; all six topics
 * gave 565 unique repos from 16 requests.
 */
const MAX_SEARCH_PAGES = 3;

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
  topic: SearchTopic;
  /** For the log: the topic, plus "(new)" for the creation-date query. */
  name: string;
  perPage: number;
  maxPages: number;
}

/**
 * Weekly only: per topic, repos created since `createdSince` with
 * NEW_REPO_MIN_STARS (the Radar's new agents) and repos pushed since
 * `pushedSince` with MIN_STARS, every page (the category
 * tables' pool, wide enough that a mid-size repo with a big week is in it).
 * Sorted by total stars, the pushed query alone is an all-time leaderboard: it
 * needs the second query for new repos and the star gain to rank. Not daily:
 * search results stopped counting as agent news on 2026-10-19 (`matchProjectNews`).
 */
export async function searchAiRepos(
  pushedSince: string,
  createdSince: string,
): Promise<{ repos: SearchRepo[]; success: boolean }> {
  // Space-separated: githubGet URL-encodes `q`, and an encoded "+" is a literal plus.
  const queries: SearchQuery[] = SEARCH_TOPICS.flatMap((topic): SearchQuery[] => [
    {
      q: `topic:${topic} created:>${createdSince} stars:>=${NEW_REPO_MIN_STARS}`,
      topic,
      name: `${topic} (new)`,
      perPage: 100,
      maxPages: 1,
    },
    {
      q: `topic:${topic} pushed:>${pushedSince} stars:>=${MIN_STARS}`,
      topic,
      name: topic,
      perPage: 100,
      maxPages: MAX_SEARCH_PAGES,
    },
  ]);

  // A short page is the last one. A failed page keeps the pages before it. Any answered first page
  // counts as success: an empty result is then "nothing found", not a failed search.
  let success = false;
  const searchPages = async ({ q, name, perPage, maxPages }: SearchQuery): Promise<SearchApiItem[]> => {
    const items: SearchApiItem[] = [];
    for (let page = 1; page <= maxPages; page++) {
      try {
        const { items: pageItems = [] } = await githubGet<SearchApiResponse>(
          "https://api.github.com/search/repositories",
          { q, sort: "stars", order: "desc", per_page: String(perPage), page: String(page) },
          searchSlot,
        );
        items.push(...pageItems);
        success = true;
        if (pageItems.length < perPage) break;
      } catch (err) {
        console.error(`  [trending/search] "${name}" page ${page}: ${err}`);
        break;
      }
    }
    return items;
  };

  // Fetch in parallel, dedupe afterwards in query order so topics don't depend on response timing.
  const results = await Promise.all(queries.map(searchPages));

  const seen = new Set<string>();
  const all: SearchRepo[] = [];
  queries.forEach(({ topic, name }, i) => {
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
          topic,
        });
        added++;
      }
    }
    console.log(`  [trending/search] "${name}": ${added} new repos`);
  });

  return { repos: all, success };
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * "daily" feeds the agents report's news matching; "weekly" (on the weekly run)
 * also feeds the trending report, which would otherwise summarize one day's list.
 */
export type TrendingPeriod = "daily" | "weekly";

/** Never throws: a failure is an empty result with `trendingFetchSuccess: false`. */
export async function fetchTrendingData(period: TrendingPeriod, dateStr: string): Promise<TrendingData> {
  try {
    return await fetchTrending(period, dateStr);
  } catch (err) {
    console.error(`  [trending] fetch failed: ${err}`);
    return EMPTY_TRENDING;
  }
}

export const EMPTY_TRENDING: TrendingData = {
  trendingRepos: [],
  searchRepos: [],
  trendingFetchSuccess: false,
  openrouter: EMPTY_OPENROUTER,
  npm: EMPTY_NPM,
};

async function fetchTrending(period: TrendingPeriod, dateStr: string): Promise<TrendingData> {
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const weekly = period === "weekly";

  const [{ repos: trendingRepos, success }, search, openrouter, npm] = await Promise.all([
    fetchGitHubTrending(period),
    weekly ? searchAiRepos(daysAgo(SEARCH_PUSHED_DAYS), daysAgo(NEW_REPO_DAYS)) : undefined,
    weekly ? fetchOpenRouterData().catch((): OpenRouterData => EMPTY_OPENROUTER) : EMPTY_OPENROUTER,
    weekly ? fetchNpmData().catch((): NpmData => EMPTY_NPM) : EMPTY_NPM,
  ]);

  const data: TrendingData = {
    trendingRepos,
    searchRepos: search?.repos ?? [],
    ...(search && { searchFetchSuccess: search.success }),
    trendingFetchSuccess: success,
    period,
    openrouter,
    npm,
  };
  if (!weekly || !hasTrendingData(data)) return data;

  // Caught here, not by fetchTrendingData's catch-all, which would also wipe
  // trendingRepos, Monday's agent news.
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
  // Rows without a gain come sorted by total stars (`rankGithubRepos`).
  const missing = rows.filter((r) => r.gain === null && reachesReport(r, classifications.get(r.key)));
  const queue = [...missing.filter((r) => r.isNew), ...missing.filter((r) => !r.isNew)];
  const capped = queue.slice(0, MAX_STAR_HISTORY_CALLS);

  const fetched = new Map<string, number>();
  let failed = 0;
  let calls = 0;
  for (const row of capped) {
    calls++;
    try {
      fetched.set(row.fullName.toLowerCase(), await fetchGain(row.fullName));
    } catch (err) {
      failed++;
      console.error(`  [trending] star history ${row.fullName}: ${err}`);
      // A rate limit or a "spammed" 422 fails every later call too, and each one spends quota.
      if (err instanceof GitHubApiError && [403, 422, 429].includes(err.status)) break;
    }
  }
  const from = (source: GithubRow["gainFrom"]) => rows.filter((r) => r.gainFrom === source).length;
  console.log(
    `  [trending] Star gains: ${from("trending")} trending page, ${from("snapshot")} snapshot, ` +
      `${from("age")} created this week; history API: ${calls} calls, ${failed} failed, ` +
      `${queue.length - capped.length} over the cap, ${capped.length - calls} skipped after a rate limit; ` +
      `${from(null) - missing.length} cannot reach the report`,
  );
  return fetched;
}

/** What `composeTrendingReport` reads and calls; tests inject them. */
export interface ComposeDeps {
  /** Empty or undefined: no Jev, the topic fallback classifies. */
  apiKey: string | undefined;
  /** Null (unreadable file): matching is skipped and nothing is saved. */
  matchState: MatchState | null;
  ask: AskJev;
  /** Weekly only: daily runs never compose, so they never read or write the file. */
  history: StarHistory;
  /** Null (unreadable file): every item is asked and the file is left as it is. */
  trendingVerdicts: TrendingVerdicts | null;
  fetchGain: (repo: string) => Promise<number>;
  /** A page's meta description, "" on failure: a shown Radar row without a description borrows its site's. */
  fetchDescription: (url: string) => Promise<string>;
}

/** Hosts whose rows already carry their registry's description: their page's meta adds nothing. */
const REGISTRY_HOSTS = new Set(["github.com", "www.npmjs.com", "npmjs.com"]);

/**
 * The shown Radar rows, a row without a description given its site's meta description, so it gets a
 * summary instead of "—" (Strix, an OpenRouter app, on 2026-10-26). Only the shown rows are fetched.
 */
async function withSiteDescriptions(
  radar: TrendingReportData["radar"],
  fetchDescription: ComposeDeps["fetchDescription"],
): Promise<TrendingReportData["radar"]> {
  return Promise.all(
    radar.map(async (r) => {
      if (r.description || !URL.canParse(r.url) || REGISTRY_HOSTS.has(new URL(r.url).hostname)) return r;
      const description = await fetchDescription(r.url);
      return description ? { ...r, description } : r;
    }),
  );
}

/**
 * Rank, classify, match and select the weekly report's rows. A dependency left
 * out is the production one; only an omitted file is loaded.
 */
export async function composeTrendingReport(
  data: TrendingData,
  dateStr: string,
  deps: Partial<ComposeDeps> = {},
): Promise<TrendingReportData> {
  const {
    apiKey = process.env["TYPESAFE_API_KEY"],
    matchState = loadMatchState(),
    ask = askJev,
    history = loadStarHistory(),
    trendingVerdicts = loadTrendingVerdicts(),
    fetchGain = fetchWeeklyStarGain,
    fetchDescription = pageDescription,
  } = deps;
  // Every GitHub row is classified: the new ones are Radar candidates, the rest
  // category rows. Classified before the gains are complete, so the history API
  // is only asked about rows in scope; a verdict is saved, a gain is not.
  const itemsFor = (rows: GithubRow[]): ClassifyItem[] => [
    ...rows.map((row): ClassifyItem => ({ kind: "github", key: row.key, row })),
    ...data.openrouter.apps.map((app): ClassifyItem => ({
      kind: "openrouter",
      key: openrouterKey(app),
      app,
    })),
    ...[...data.npm.rising, ...data.npm.top].map((pkg): ClassifyItem => ({
      kind: "npm",
      key: npmKey(pkg),
      pkg,
    })),
  ];
  const firstRows = rankGithubRepos(data.trendingRepos, data.searchRepos, dateStr, history);
  const firstItems = itemsFor(firstRows);
  // Saved verdicts are Jev's, so they hold without a key or when this run's calls
  // fail; only the rest is asked, and `classifiedBy` describes those.
  const { classifications, classifiedBy, nextCache } = await classifyTrendingItems(firstItems, {
    apiKey,
    cache: trendingVerdicts,
    dateStr,
    ask,
  });

  const fetched = await fetchMissingGains(firstRows, classifications, fetchGain);
  const githubRows =
    fetched.size > 0
      ? rankGithubRepos(data.trendingRepos, data.searchRepos, dateStr, history, fetched)
      : firstRows;
  // The trace reads the final rows' gains. Same keys as firstItems: the gains re-rank rows, they
  // neither add nor drop any, so the cache built from firstItems marks every item seen.
  const items = itemsFor(githubRows);
  const candidates = buildRadarCandidates(
    data.openrouter.apps,
    data.npm,
    githubRows,
    dateStr,
    lastWeekFigures(history, dateStr),
  );

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

  const dropped = new Map<string, DroppedReason>();
  const selected = selectTrendingReport(
    githubRows,
    candidates,
    classifications,
    classifiedBy,
    links,
    lastWeekKeys(history, dateStr),
    dropped,
  );
  const report = { ...selected, radar: await withSiteDescriptions(selected.radar, fetchDescription) };
  console.log(
    `  [trending] Radar: ${report.radar.length} rows | ` +
      (report.categories.map((c) => `${c.category}: ${c.rows.length}`).join(", ") || "no category rows"),
  );
  const traceFile =
    classifiedBy === "jev" || matchCalled
      ? buildTrendingTraceFile(items, classifications, classifiedBy, matchTrace, matchModels, {
          report,
          dropped,
          sources: {
            "GitHub Trending": { fetched: data.trendingFetchSuccess ? data.trendingRepos.length : null },
            "topic search": { fetched: data.searchFetchSuccess === false ? null : data.searchRepos.length },
            "OpenRouter apps": { fetched: data.openrouter.fetchSuccess ? data.openrouter.apps.length : null },
            npm: { fetched: data.npm.fetchSuccess ? data.npm.rising.length + data.npm.top.length : null },
          },
        })
      : undefined;
  const shown = reportedKeys(report);
  return {
    ...report,
    ...(traceFile !== undefined ? { traceFile } : {}),
    ...(nextMatches !== undefined ? { nextMatches } : {}),
    ...(nextCache ? { nextTrendingVerdicts: nextCache } : {}),
    nextStarHistory: nextStarHistory(history, githubRows, dateStr, shown, {
      // The shown rows' figures only: a row new to the Radar next week shows no comparison.
      figures: Object.fromEntries(
        [...radarFigures(data.openrouter.apps, data.npm)].filter(([k]) => shown.includes(k)),
      ),
      ...(data.openrouter.topModels.length > 0 && {
        modelRanking: data.openrouter.topModels.map((m) => m.slug),
      }),
    }),
  };
}
