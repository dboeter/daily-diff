/**
 * Daily Diff: daily digest for AI agents, AI policy and the data engineering stack.
 *
 * Env vars:
 *   LLM_PROVIDER        - "anthropic" | "openai" | "github-copilot" | "openrouter" (default: anthropic)
 *   GITHUB_TOKEN        - GitHub token for API access and issue creation
 *   DIGEST_REPO         - owner/repo where digest issues are posted (optional)
 *
 * Provider-specific env vars — see src/providers/ for full list.
 */

import {
  type GitHubItem,
  type RepoConfig,
  fetchRecentReleases,
  fetchHotIssues,
  isPrerelease,
  fetchSkillsData,
  type SkillsData,
  createGitHubIssue,
} from "./core/github.ts";
import { type ProjectActivity, buildProjectDigestPrompt, hasActivity } from "./reports/prompts.ts";
import { matchProjectNews } from "./reports/agent-news.ts";
import {
  buildHighlightsPrompt,
  buildSpottedSummariesPrompt,
  forcedHighlightReports,
  withFallbackHighlights,
  type ReportHighlights,
} from "./reports/prompts-data.ts";
import {
  callLlm,
  generateOr,
  parseLlmJson,
  saveFile,
  LLM_TOKENS_LISTING,
  assertLlmHealthy,
  reportLlmHealth,
  llmHealthLine,
  isConnectionError,
} from "./core/report.ts";
import { renderReportBar, withReportBar } from "./reports/report-builders.ts";
import { parseRowSummaries } from "./reports/summarized-table.ts";
import {
  buildWebReport,
  buildTrendingReport,
  buildDiscussionsReport,
  buildArxivReport,
  buildModelsReport,
  buildPolicyReport,
  buildDataReport,
  buildAgentsReport,
  type SavedReport,
} from "./reports/data-reports.ts";
import { loadWebState, fetchSiteContent, type WebFetchResult, type WebState } from "./sources/web.ts";
import { fetchTrendingData, type TrendingData } from "./trending/trending.ts";
import { fetchStealthModels, type OpenRouterStealthModel } from "./sources/openrouter.ts";
import { fetchHnData, type HnData } from "./sources/hn.ts";
import { fetchArxivData, type ArxivData } from "./sources/arxiv.ts";
import { fetchPolicyData, type PolicyData } from "./policy/policy.ts";
import { isDataLaw } from "./policy/jev.ts";
import { fetchVendorData, type VendorData } from "./data/vendors.ts";
import { fetchHfData, type HfData } from "./sources/hf.ts";
import { fetchDevtoData, type DevtoData } from "./sources/devto.ts";
import { fetchLobstersData, type LobstersData } from "./sources/lobsters.ts";
import {
  freshStories,
  loadSpottedLog,
  nextLog,
  saveSpottedLog,
  selectSpotted,
  shownBefore,
  storiesFrom,
  type SpottedPage,
} from "./spotted/spotted.ts";
import {
  loadTopicCache,
  routeStories,
  saveTopicCache,
  spottedRankingFile,
  SPOTTED_PAGE,
} from "./spotted/jev.ts";
import { DATA_SECTION_KEYS, loadConfig, type SectionKey } from "./core/config.ts";
import { resolvePagesUrl } from "./cli/notify.ts";
import { toCstDateStr, toUtcStr, isWeeklyRun, sleep } from "./core/date.ts";
import { loadStarHistory } from "./trending/rank.ts";
import { promotedRepos } from "./trending/promoted.ts";
import { LIVE_REPORT_IDS, MSG, PROJECT_SCOPE, REPORTS, reportIssueTitle } from "./core/i18n.ts";

// ---------------------------------------------------------------------------
// Repo config — loaded from config.yml (throws when a section is missing)
// ---------------------------------------------------------------------------

const CONFIG = loadConfig();
const CLAUDE_SKILLS_REPO = CONFIG.skillsRepo;
const DATA_SECTIONS = DATA_SECTION_KEYS.map((key) => CONFIG[key]);
// The last weekly trending report's category-table repos join the curated
// lists. Read from the committed state, so Monday's run still uses the previous
// Monday's record: this run's trending report is saved after the fetch.
const PROMOTED = promotedRepos(loadStarHistory(), toCstDateStr(new Date()), [
  ...CONFIG.agents.repos,
  ...CONFIG.infra.repos,
  ...DATA_SECTIONS.flatMap((s) => s.repos),
]);
const AGENTS = [...CONFIG.agents.repos, ...PROMOTED.agents];
const INFRA_REPOS = [...CONFIG.infra.repos, ...PROMOTED.infra];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Phase 1: Fetch
// ---------------------------------------------------------------------------

/** A project's releases and hot issues; agent news is matched after every source is in. */
type ProjectFetch = Omit<ProjectActivity, "news">;

/**
 * Prereleases sent to the model per project that has never shipped a stable
 * release. Without them DeepSeek Harness, alpha/rc only, never showed a
 * release at all, while 0.2 added a lot of features; the model reports only
 * the notable ones. The daily window holds 0–1 of its prereleases.
 */
const PREVIEWS_PER_PROJECT = 3;

/**
 * Stable releases and hot issues for one project. A failed release fetch is `fetchFailed`, shown as unavailable.
 * `weekSince` (the data report): also the stable releases since then, as `weekReleases`, from the same request.
 */
async function fetchProject(cfg: RepoConfig, since: Date, weekSince?: Date): Promise<ProjectFetch> {
  try {
    const [{ recent, noStableYet }, hotIssues] = await Promise.all([
      fetchRecentReleases(cfg.repo, weekSince ?? since),
      // Search API, rate-limited separately from releases: a failure here must
      // not discard the releases.
      fetchHotIssues(cfg.repo, since).catch((err): GitHubItem[] => {
        console.error(`  [${cfg.id}] hot issues fetch failed: ${err}`);
        return [];
      }),
    ]);
    const releases = recent.filter((r) => new Date(r.published_at) >= since);
    const stable = releases.filter((r) => !isPrerelease(r));
    const previews = noStableYet ? releases.slice(0, PREVIEWS_PER_PROJECT) : [];
    console.log(
      `  [${cfg.id}] releases: ${stable.length} stable + ${releases.length - stable.length} pre` +
        `${noStableYet ? ` (no stable release yet, ${previews.length} sent)` : ""}, hot issues: ${hotIssues.length}`,
    );
    return {
      config: cfg,
      releases: stable,
      previews,
      prereleaseCount: releases.length - stable.length - previews.length,
      hotIssues,
      ...(weekSince ? { weekReleases: recent.filter((r) => !isPrerelease(r)) } : {}),
    };
  } catch (err) {
    console.error(`  [${cfg.id}] fetch failed: ${err}`);
    return { config: cfg, releases: [], previews: [], prereleaseCount: 0, hotIssues: [], fetchFailed: true };
  }
}

async function fetchAllData(
  now: Date,
  webState: WebState,
  weekly: boolean,
  /** A Hacker News story a page showed on an earlier day (the Spotted log). */
  hnShown: (storyId: string) => boolean,
): Promise<{
  agentFetches: ProjectFetch[];
  infraFetches: ProjectFetch[];
  /** One list per data report section, in DATA_SECTIONS order. */
  dataFetches: ProjectFetch[][];
  skillsData: SkillsData;
  webResults: WebFetchResult[];
  trendingData: TrendingData;
  hnData: HnData;
  arxivData: ArxivData;
  policyData: PolicyData;
  vendorData: VendorData;
  hfData: HfData;
  devtoData: DevtoData;
  lobstersData: LobstersData;
  stealthModels: OpenRouterStealthModel[] | null;
}> {
  const daySince = new Date(now.getTime() - DAY_MS);
  // The data report's Releases this week: its repos release about weekly, so a 24h window saw none on most days.
  const weekSince = new Date(now.getTime() - 7 * DAY_MS);
  console.log(
    `  Tracking daily: ${[...AGENTS, ...INFRA_REPOS, ...DATA_SECTIONS.flatMap((s) => s.repos)].map((r) => r.id).join(", ")}, web, hn, devto, lobsters, arxiv, policy, trending (news only)` +
      (weekly ? " | weekly: skills, trending, hf" : ""),
  );

  const noSkills: SkillsData = { prs: [], issues: [], fetchSuccess: false };

  const [
    agentFetches,
    infraFetches,
    dataFetches,
    skillsData,
    webResults,
    trendingData,
    hnData,
    arxivData,
    policyData,
    vendorData,
    hfData,
    devtoData,
    lobstersData,
    stealthModels,
  ] = await Promise.all([
    Promise.all(AGENTS.map((cfg) => fetchProject(cfg, daySince))),
    Promise.all(INFRA_REPOS.map((cfg) => fetchProject(cfg, daySince))),
    Promise.all(
      DATA_SECTIONS.map((s) => Promise.all(s.repos.map((cfg) => fetchProject(cfg, daySince, weekSince)))),
    ),
    // No fetcher here throws: each returns its empty value (fetchSuccess false) on a failure.
    weekly ? fetchSkillsData(CLAUDE_SKILLS_REPO) : Promise.resolve(noSkills),
    Promise.all([fetchSiteContent("anthropic", webState), fetchSiteContent("openai", webState)]),
    // Fetched every day — the agents report matches trending repos as news —
    // but only reported weekly.
    fetchTrendingData(weekly ? "weekly" : "daily", toCstDateStr(now)),
    fetchHnData(hnShown),
    fetchArxivData(toCstDateStr(now)),
    fetchPolicyData(CONFIG.policy, now, toCstDateStr(now)),
    fetchVendorData(CONFIG.data, now),
    weekly ? fetchHfData() : Promise.resolve<HfData>({ models: [], fetchSuccess: false }),
    fetchDevtoData(),
    fetchLobstersData(),
    // Daily, unlike the rest of OpenRouter: stealth models are free for a short window.
    fetchStealthModels(),
  ]);

  return {
    agentFetches,
    infraFetches,
    dataFetches,
    skillsData,
    webResults,
    trendingData,
    hnData,
    arxivData,
    policyData,
    vendorData,
    hfData,
    devtoData,
    lobstersData,
    stealthModels,
  };
}

// ---------------------------------------------------------------------------
// Phase 2: LLM summaries
// ---------------------------------------------------------------------------

/** One LLM call over every active project; a fixed notice when none was active. */
function summarizeProjects(id: SectionKey, activities: ProjectActivity[], dateStr: string): Promise<string> {
  const active = activities.filter(hasActivity);
  if (!active.length) {
    console.log(`  [${id}] No releases, hot issues or news, skipping LLM call`);
    return Promise.resolve(MSG.projectsNoActivity);
  }
  return generateOr(
    id,
    buildProjectDigestPrompt(active, { subject: CONFIG[id].subject, ...PROJECT_SCOPE }, dateStr),
    MSG.summaryFailed,
    LLM_TOKENS_LISTING,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Pause between the two highlights attempts when the first one died on a
 * connection failure. Long enough that attempt 2 lands outside the outage that
 * just consumed callLlm's retry ladder, short enough that a healthy provider
 * hiccup still costs the run a single minute.
 */
const HIGHLIGHTS_COOLDOWN_MS = 60_000;

async function main(): Promise<void> {
  requireEnv("GITHUB_TOKEN");

  const now = new Date();
  const dateStr = toCstDateStr(now);
  const utcStr = toUtcStr(now);
  const digestRepo = process.env["DIGEST_REPO"] ?? "";

  const providerName = process.env["LLM_PROVIDER"] ?? "anthropic";
  const weekly = isWeeklyRun(dateStr, process.env["DIGEST_FORCE_WEEKLY"] === "1");
  console.log(
    `[${now.toISOString()}] Starting digest | provider: ${providerName} | weekly reports: ${weekly ? "yes" : "no"}`,
  );

  // 1. Fetch all data in parallel
  const webState = loadWebState();
  // Before the fetch: HN's cut counts only the stories no page has shown.
  const spottedLog = loadSpottedLog();
  const {
    agentFetches,
    infraFetches,
    dataFetches,
    skillsData,
    webResults,
    trendingData,
    hnData,
    arxivData,
    policyData,
    vendorData,
    hfData,
    devtoData,
    lobstersData,
    stealthModels,
  } = await fetchAllData(now, webState, weekly, (id) => shownBefore(spottedLog, `hn:${id}`, dateStr));
  const stories = storiesFrom(hnData, lobstersData, devtoData);
  const fresh = freshStories(stories, spottedLog, dateStr);

  // Agent news is matched against the other sources' data, so it waits for them.
  // Agents and tooling in one pass: an item naming 3+ of them is a compatibility list.
  const projectNews = matchProjectNews([...AGENTS, ...INFRA_REPOS], {
    stories: fresh,
    web: webResults,
    trending: trendingData,
  });
  const withNews = (f: ProjectFetch): ProjectActivity => ({ ...f, news: projectNews.get(f.config.id) ?? [] });
  const agentActivities = agentFetches.map(withNews);
  const infraActivities = infraFetches.map(withNews);
  // The data projects are a pool of their own, without the compatibility-list
  // drop: a story naming DuckDB, Polars and Iceberg is news about the stack.
  const dataNews = matchProjectNews(
    DATA_SECTIONS.flatMap((s) => s.repos),
    { stories: fresh, web: webResults, trending: trendingData },
    Infinity,
  );
  const dataSections = DATA_SECTION_KEYS.map((key, i) => ({
    key,
    subject: CONFIG[key].subject,
    activities: dataFetches[i]!.map((f): ProjectActivity => ({
      ...f,
      news: dataNews.get(f.config.id) ?? [],
    })),
  }));

  // Spotted: the fresh stories no project in either pool claimed, routed to their topic's page.
  const matchedIds = new Set(
    [...projectNews.values(), ...dataNews.values()].flat().flatMap((n) => (n.id ? [n.id] : [])),
  );
  const unmatched = fresh.filter((s) => !matchedIds.has(s.id));
  const topicCache = loadTopicCache();
  const routing = await routeStories(unmatched, {
    apiKey: process.env["TYPESAFE_API_KEY"],
    cache: topicCache,
    dateStr,
  });
  const spottedRows = selectSpotted(unmatched, (s) => {
    const topic = routing.topics.get(s.id);
    return topic ? SPOTTED_PAGE[topic] : null;
  });
  const spottedOf = (page: SpottedPage) => spottedRows.filter((r) => r.page === page);

  // 2. The agents report's two sections and every page's Spotted summaries (one call, before the
  // page builders: the agents and data Highlights calls see their Spotted tables); every other
  // report makes its own calls in its builder.
  console.log("  Generating summaries...");
  const [agentsSummary, infraSummary, spottedSummaries] = await Promise.all([
    summarizeProjects("agents", agentActivities, dateStr),
    summarizeProjects("infra", infraActivities, dateStr),
    spottedRows.length
      ? generateOr(
          "spotted-summaries",
          buildSpottedSummariesPrompt(spottedRows, dateStr),
          "",
          LLM_TOKENS_LISTING,
        )
      : "",
  ]);
  const spottedSummaryMap = parseRowSummaries(spottedSummaries);

  // 3. Build every report
  if (!weekly) console.log("  [weekly] Trending and HF reports — not scheduled today, skipping.");

  const built = await Promise.all([
    // The infra section is a group in the agents report since October 2026.
    buildAgentsReport(
      [
        { title: CONFIG.agents.title, activities: agentActivities, summary: agentsSummary },
        { title: CONFIG.infra.title, activities: infraActivities, summary: infraSummary },
      ],
      stealthModels,
      { rows: spottedOf("agents"), summaries: spottedSummaryMap },
      utcStr,
      dateStr,
    ),
    buildWebReport(webResults, webState, utcStr, dateStr),
    buildDiscussionsReport({ hn: hnData, devto: devtoData, lobsters: lobstersData }, utcStr, dateStr),
    buildArxivReport(arxivData, utcStr, dateStr),
    buildPolicyReport(policyData, utcStr, dateStr),
    buildDataReport(
      dataSections,
      vendorData,
      policyData.items.filter((i) => isDataLaw(i, CONFIG.policy.dataLaw)),
      { rows: spottedOf("data"), summaries: spottedSummaryMap },
      utcStr,
      dateStr,
    ),
    ...(weekly
      ? [
          buildTrendingReport(trendingData, { ...skillsData, repo: CLAUDE_SKILLS_REPO }, utcStr, dateStr),
          buildModelsReport(hfData, trendingData.openrouter, utcStr, dateStr),
        ]
      : []),
  ]);
  // A builder returns null when its source failed or its LLM call did.
  // In REPORTS order, so the issues are opened in reading order.
  const saved = built
    .filter((r): r is SavedReport => r !== null)
    .sort((a, b) => LIVE_REPORT_IDS.indexOf(a.id) - LIVE_REPORT_IDS.indexOf(b.id));

  // The LLM health gate: the builders each swallow their own failure and just
  // skip a report, so an outage would otherwise publish a day of placeholders.
  // No report file or issue exists yet; state files may, but the failing exit
  // skips the commit step, so they are never published.
  assertLlmHealthy("report");

  // Shown: the Spotted rows and the matched project news of every published page, whether or not
  // the model mentioned them.
  const savedIds = new Set(saved.map((r) => r.id));
  const pageActivities = [
    ...agentActivities,
    ...infraActivities,
    ...(savedIds.has("ai-data") ? dataSections.flatMap((s) => s.activities) : []),
  ];
  const shownIds = new Set([
    ...spottedOf("agents").map((r) => r.id),
    ...(savedIds.has("ai-data") ? spottedOf("data").map((r) => r.id) : []),
    ...pageActivities.flatMap((a) => a.news.flatMap((n) => (n.id ? [n.id] : []))),
  ]);
  saveSpottedLog(nextLog(spottedLog, stories, shownIds, dateStr));
  if (routing.judgment.nextCache) saveTopicCache(routing.judgment.nextCache);
  console.log(
    `  Saved ${saveFile(spottedRankingFile(unmatched, routing, shownIds), dateStr, "spotted-ranking.json")}`,
  );

  // The highlights pass reads the bodies, not the link bars.
  const reports: Record<string, string> = Object.fromEntries(saved.map((r) => [r.id, r.content]));

  // Each report links the others the day produced, so the bar waits for all of them.
  const pagesUrl = resolvePagesUrl();
  const ids = saved.map((r) => r.id);
  const published: SavedReport[] = saved.map((r) => ({
    ...r,
    content: withReportBar(r.content, renderReportBar(r.id, ids, dateStr, pagesUrl)),
  }));
  for (const r of published) console.log(`  Saved ${saveFile(r.content, dateStr, `${r.id}.md`)}`);

  // 4. Generate highlights for Telegram notification
  console.log("  Generating highlights for Telegram...");
  // The highlights pass parses JSON and retries once: the LLM occasionally
  // emits slightly malformed JSON that repairJson can't fix (seen 2026-07-13:
  // "Expected ',' or ']' after array element"); a fresh generation usually
  // returns valid JSON.
  //
  // A connection failure is a different animal: attempt 1 has already burned
  // callLlm's full ~3 min connection ladder, so firing attempt 2 immediately
  // re-enters an outage that is demonstrably still going. On 2026-09-19 both
  // attempts failed back to back inside the same DashScope outage and the day
  // shipped with an empty highlights.json — Telegram rendered section links
  // and no bullets. Wait out a cooldown first; a malformed-JSON retry still
  // goes straight through.
  const attemptJson = async (prompt: string): Promise<ReportHighlights> => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return parseLlmJson<ReportHighlights>(await callLlm(prompt));
      } catch (err) {
        const tag = attempt < 2 ? "retrying" : "giving up";
        console.error(`  [highlights] attempt ${attempt} failed (${tag}): ${err}`);
        if (attempt < 2 && isConnectionError(err)) {
          console.error(
            `  [highlights] connection down — cooling down ${HIGHLIGHTS_COOLDOWN_MS / 1000}s before retry`,
          );
          await sleep(HIGHLIGHTS_COOLDOWN_MS);
        }
      }
    }
    return {};
  };

  const forced = forcedHighlightReports(vendorData.items.length > 0);
  const highlights = withFallbackHighlights(
    await attemptJson(buildHighlightsPrompt(reports, forced)),
    reports,
    forced,
  );

  const highlightsPath = saveFile(JSON.stringify(highlights, null, 2), dateStr, "highlights.json");
  console.log(`  Saved ${highlightsPath}`);

  // 5. Create the GitHub issues
  if (digestRepo) {
    for (const r of published) {
      const title = r.issueTitle ?? reportIssueTitle(r.id, dateStr);
      const url = await createGitHubIssue(title, r.content, REPORTS[r.id].label);
      console.log(`  Created ${r.id} issue: ${url}`);
    }
  }

  reportLlmHealth();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  // The tally is the first thing worth seeing when a run dies — it separates
  // "the provider was unreachable" from a genuine bug in the pipeline.
  console.error(`  [llm] ${llmHealthLine()}`);
  process.exit(1);
});
