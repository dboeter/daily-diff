/**
 * Daily Diff: daily digest for AI agents and the AI open-source ecosystem.
 *
 * Env vars:
 *   LLM_PROVIDER        - "anthropic" | "openai" | "github-copilot" | "openrouter" (default: anthropic)
 *   GITHUB_TOKEN        - GitHub token for API access and issue creation
 *   DIGEST_REPO         - owner/repo where digest issues are posted (optional)
 *
 * Provider-specific env vars — see src/providers/ for full list.
 */

import fs from "node:fs";
import path from "node:path";
import {
  type GitHubItem,
  type RepoConfig,
  fetchRecentReleases,
  fetchHotIssues,
  isPrerelease,
  fetchSkillsData,
  createGitHubIssue,
  WEEKLY_ISSUE_LABELS,
} from "./github.ts";
import {
  type DigestScope,
  type ProjectActivity,
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  hasActivity,
} from "./prompts.ts";
import { matchAgentNews } from "./agent-news.ts";
import {
  buildTrendingSummariesPrompt,
  buildTrendingProsePrompt,
  buildHighlightsPrompt,
  type ReportHighlights,
} from "./prompts-data.ts";
import {
  callLlm,
  parseLlmJson,
  saveFile,
  autoGenFooter,
  LLM_TOKENS_LISTING,
  assertLlmHealthy,
  reportLlmHealth,
  llmHealthLine,
  isConnectionError,
} from "./report.ts";
import {
  buildProjectReportContent,
  buildStealthSection,
  renderTrendingTables,
  stripModelTitle,
} from "./report-builders.ts";
import { summaryRows } from "./trending-rank.ts";
import {
  saveWebReport,
  saveTrendingReport,
  saveDiscussionsReport,
  saveArxivReport,
  saveHfReport,
} from "./report-savers.ts";
import { loadWebState, fetchSiteContent, type WebFetchResult, type WebState } from "./web.ts";
import { fetchTrendingData, EMPTY_NPM, EMPTY_OPENROUTER, type TrendingData } from "./trending.ts";
import { fetchStealthModels, type OpenRouterStealthModel } from "./openrouter.ts";
import { fetchHnData, type HnData } from "./hn.ts";
import { fetchArxivData, type ArxivData } from "./arxiv.ts";
import { fetchHfData, type HfData } from "./hf.ts";
import { fetchDevtoData, type DevtoData } from "./devto.ts";
import { fetchLobstersData, type LobstersData } from "./lobsters.ts";
import { loadConfig, type SectionKey } from "./config.ts";
import { toCstDateStr, toUtcStr, isWeeklyRun, sleep } from "./date.ts";
import { MSG, ISSUE_LABELS, PROJECT_REPORTS, REPORTS, reportIssueTitle } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Repo config — loaded from config.yml (throws when a section is missing)
// ---------------------------------------------------------------------------

const CONFIG = loadConfig();
const AGENTS = CONFIG.agents.repos;
const INFRA_REPOS = CONFIG.infra.repos;
const CLAUDE_SKILLS_REPO = CONFIG.skillsRepo;

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

/** Stable releases and hot issues for one project. A failed fetch reads as a quiet period. */
async function fetchProject(cfg: RepoConfig, since: Date): Promise<ProjectFetch> {
  try {
    const [{ recent: releases, noStableYet }, hotIssues] = await Promise.all([
      fetchRecentReleases(cfg.repo, since),
      // Search API, rate-limited separately from releases: a failure here must
      // not discard the releases.
      fetchHotIssues(cfg.repo, since).catch((err): GitHubItem[] => {
        console.error(`  [${cfg.id}] hot issues fetch failed: ${err}`);
        return [];
      }),
    ]);
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
    };
  } catch (err) {
    console.error(`  [${cfg.id}] fetch failed: ${err}`);
    return { config: cfg, releases: [], previews: [], prereleaseCount: 0, hotIssues: [] };
  }
}

async function fetchAllData(
  now: Date,
  webState: WebState,
  weekly: boolean,
): Promise<{
  agentFetches: ProjectFetch[];
  infraFetches: ProjectFetch[];
  skillsData: { prs: GitHubItem[]; issues: GitHubItem[] };
  webResults: WebFetchResult[];
  trendingData: TrendingData;
  hnData: HnData;
  arxivData: ArxivData;
  hfData: HfData;
  devtoData: DevtoData;
  lobstersData: LobstersData;
  stealthModels: OpenRouterStealthModel[] | null;
}> {
  const daySince = new Date(now.getTime() - DAY_MS);
  console.log(
    `  Tracking daily: ${[...AGENTS, ...INFRA_REPOS].map((r) => r.id).join(", ")}, web, hn, arxiv, trending (news only)` +
      (weekly ? " | weekly: skills, trending, hf, devto, lobsters" : ""),
  );

  const noSkills = { prs: [] as GitHubItem[], issues: [] as GitHubItem[] };

  const [
    agentFetches,
    infraFetches,
    skillsData,
    webResults,
    trendingData,
    hnData,
    arxivData,
    hfData,
    devtoData,
    lobstersData,
    stealthModels,
  ] = await Promise.all([
    Promise.all(AGENTS.map((cfg) => fetchProject(cfg, daySince))),
    Promise.all(INFRA_REPOS.map((cfg) => fetchProject(cfg, daySince))),
    weekly
      ? fetchSkillsData(CLAUDE_SKILLS_REPO)
          .then((d) => {
            console.log(`  [claude-code-skills] prs: ${d.prs.length}, issues: ${d.issues.length}`);
            return d;
          })
          .catch((err) => {
            console.error(`  [claude-code-skills] fetch failed: ${err}`);
            return noSkills;
          })
      : Promise.resolve(noSkills),
    Promise.all([
      fetchSiteContent("anthropic", webState).catch((err): WebFetchResult => {
        console.error(`  [web/anthropic] fetch failed: ${err}`);
        return {
          site: "anthropic",
          siteName: "Anthropic (Claude)",
          isFirstRun: false,
          newItems: [],
          totalDiscovered: 0,
        };
      }),
      fetchSiteContent("openai", webState).catch((err): WebFetchResult => {
        console.error(`  [web/openai] fetch failed: ${err}`);
        return { site: "openai", siteName: "OpenAI", isFirstRun: false, newItems: [], totalDiscovered: 0 };
      }),
    ]),
    // Fetched every day — the agents report matches trending repos as news —
    // but only reported weekly.
    fetchTrendingData(weekly ? "weekly" : "daily", toCstDateStr(now)).catch((): TrendingData => ({
      trendingRepos: [],
      searchRepos: [],
      trendingFetchSuccess: false,
      openrouter: EMPTY_OPENROUTER,
      npm: EMPTY_NPM,
    })),
    fetchHnData().catch((): HnData => ({ stories: [], fetchSuccess: false })),
    fetchArxivData(toCstDateStr(now)).catch((): ArxivData => ({
      papers: [],
      fetchSuccess: false,
      rankedBy: "recency",
    })),
    weekly
      ? fetchHfData().catch((): HfData => ({ models: [], fetchSuccess: false }))
      : Promise.resolve<HfData>({ models: [], fetchSuccess: false }),
    weekly
      ? fetchDevtoData().catch((): DevtoData => ({ articles: [], fetchSuccess: false }))
      : Promise.resolve<DevtoData>({ articles: [], fetchSuccess: false }),
    weekly
      ? fetchLobstersData().catch((): LobstersData => ({ stories: [], fetchSuccess: false }))
      : Promise.resolve<LobstersData>({ stories: [], fetchSuccess: false }),
    // Daily, unlike the rest of OpenRouter: stealth models are free for a short window.
    fetchStealthModels(),
  ]);

  return {
    agentFetches,
    infraFetches,
    skillsData,
    webResults,
    trendingData,
    hnData,
    arxivData,
    hfData,
    devtoData,
    lobstersData,
    stealthModels,
  };
}

// ---------------------------------------------------------------------------
// Phase 2: LLM summaries
// ---------------------------------------------------------------------------

/** Call LLM with logging and error fallback. */
async function summarize(id: string, prompt: string, failMsg: string, maxTokens?: number): Promise<string> {
  console.log(`  [${id}] Calling LLM for summary...`);
  try {
    return stripModelTitle(await callLlm(prompt, maxTokens));
  } catch (err) {
    console.error(`  [${id}] LLM call failed: ${err}`);
    return failMsg;
  }
}

/** Prompt wording for a section report: its subject from config.yml, its cadence from i18n. */
function sectionScope(key: SectionKey): DigestScope {
  const { window, period } = PROJECT_REPORTS[key];
  return { subject: CONFIG[key].subject, window, period };
}

/** One LLM call over every active project; a fixed notice when none was active. */
function summarizeProjects(id: SectionKey, activities: ProjectActivity[], dateStr: string): Promise<string> {
  const active = activities.filter(hasActivity);
  if (!active.length) {
    console.log(`  [${id}] No releases, hot issues or news, skipping LLM call`);
    return Promise.resolve(MSG.projectsNoActivity);
  }
  return summarize(
    id,
    buildProjectDigestPrompt(active, sectionScope(id), dateStr),
    MSG.summaryFailed,
    LLM_TOKENS_LISTING,
  );
}

/** Every LLM-generated report body. The weekly ones are empty on other days. */
interface Summaries {
  agentsSummary: string;
  infraSummary: string;
  skillsSummary: string;
  /** Weekly trending: the per-row summaries (`N: text` lines) and the prose around the tables. */
  trending: { summaries: string; prose: string };
}

/** Generate every report body. */
async function generateSummaries(
  agentActivities: ProjectActivity[],
  infraActivities: ProjectActivity[],
  skillsData: { prs: GitHubItem[]; issues: GitHubItem[] },
  trendingData: TrendingData,
  dateStr: string,
  weekly: boolean,
): Promise<Summaries> {
  const report = trendingData.report;
  const rows = report ? summaryRows(report) : [];
  const [agentsSummary, infraSummary, skillsSummary, trendingSummaries, trendingProse] = await Promise.all([
    summarizeProjects("agents", agentActivities, dateStr),
    summarizeProjects("infra", infraActivities, dateStr),
    weekly
      ? summarize(
          "claude-code-skills",
          buildSkillsPrompt(skillsData.prs, skillsData.issues, dateStr),
          MSG.skillsFailed,
        )
      : Promise.resolve(""),
    // Trending: code ranks and renders the tables; one call writes the row
    // summaries, the other the prose around the tables. A failed summaries
    // call is "": the rows fall back to their descriptions.
    report && rows.length > 0
      ? summarize("trending-summaries", buildTrendingSummariesPrompt(rows, dateStr), "", LLM_TOKENS_LISTING)
      : Promise.resolve(""),
    report
      ? summarize(
          "trending",
          buildTrendingProsePrompt(renderTrendingTables(report, new Map()), trendingData, dateStr),
          MSG.trendingFailed,
          LLM_TOKENS_LISTING,
        )
      : Promise.resolve(""),
  ]);

  return {
    agentsSummary,
    infraSummary,
    skillsSummary,
    trending: { summaries: trendingSummaries, prose: trendingProse },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** Reports that only exist on the weekly run, in highlights order. */
const WEEKLY_REPORT_IDS = [...WEEKLY_ISSUE_LABELS].map((label) => `ai-${label}`);

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
  const {
    agentFetches,
    infraFetches,
    skillsData,
    webResults,
    trendingData,
    hnData,
    arxivData,
    hfData,
    devtoData,
    lobstersData,
    stealthModels,
  } = await fetchAllData(now, webState, weekly);

  // Agent news is matched against the other sources' data, so it waits for them.
  // Agents and tooling in one pass: an item naming 3+ of them is a compatibility list.
  const agentNews = matchAgentNews([...AGENTS, ...INFRA_REPOS], {
    hn: hnData,
    web: webResults,
    trending: trendingData,
  });
  const withNews = (f: ProjectFetch): ProjectActivity => ({ ...f, news: agentNews.get(f.config.id) ?? [] });
  const agentActivities = agentFetches.map(withNews);
  const infraActivities = infraFetches.map(withNews);

  // 2. Generate every report body
  console.log("  Generating summaries...");
  const summaries = await generateSummaries(
    agentActivities,
    infraActivities,
    skillsData,
    trendingData,
    dateStr,
    weekly,
  );

  // First gate. On a daily run at most the agents and infra calls have happened
  // by now, below LLM_MIN_SAMPLES, so this only arms on the weekly run (5 calls:
  // agents, infra, skills, trending summaries, trending prose); the second gate, after the
  // savers, covers every run. Bailing here costs nothing — no file has been
  // written yet.
  assertLlmHealthy("summary");

  // 3. Build + save all reports
  // The infra section is a group in the agents report since October 2026.
  const agentsContent = buildProjectReportContent({
    title: REPORTS["ai-agents"].name,
    dateStr,
    utcStr,
    groups: [
      { title: CONFIG.agents.title, activities: agentActivities, summary: summaries.agentsSummary },
      { title: CONFIG.infra.title, activities: infraActivities, summary: summaries.infraSummary },
    ],
    period: PROJECT_REPORTS.agents.period,
    preamble: buildStealthSection(stealthModels),
    footer: autoGenFooter(),
  });
  console.log(`  Saved ${saveFile(agentsContent, dateStr, "ai-agents.md")}`);
  if (!weekly)
    console.log("  [weekly] Trending and HF reports, Dev.to and Lobste.rs — not scheduled today, skipping.");

  await Promise.all([
    saveWebReport(webResults, webState, utcStr, dateStr, digestRepo),
    saveDiscussionsReport(
      { hn: hnData, devto: devtoData, lobsters: lobstersData },
      utcStr,
      dateStr,
      digestRepo,
    ),
    saveArxivReport(arxivData, utcStr, dateStr, digestRepo),
    ...(weekly
      ? [
          saveTrendingReport(
            trendingData,
            summaries.trending,
            { summary: summaries.skillsSummary, repo: CLAUDE_SKILLS_REPO },
            utcStr,
            dateStr,
            digestRepo,
          ),
          saveHfReport(hfData, trendingData.openrouter, utcStr, dateStr, digestRepo),
        ]
      : []),
  ]);

  // Second gate: an outage that starts *after* the first gate would otherwise
  // sail straight through — the savers each swallow their own failure and just
  // skip a report. Files are on disk by now, but the failing exit skips the
  // commit step, so they are never published.
  assertLlmHealthy("report");

  // 4. Generate highlights for Telegram notification
  const readReport = (name: string): string | undefined => {
    const p = path.join("digests", dateStr, name);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : undefined;
  };

  const reports: Record<string, string> = { "ai-agents": agentsContent };
  // Savers skip a report when its source failed, so read back what was written.
  for (const id of ["ai-web", "ai-hn", "ai-arxiv", ...(weekly ? WEEKLY_REPORT_IDS : [])]) {
    const content = readReport(`${id}.md`);
    if (content) reports[id] = content;
  }

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

  const highlights = await attemptJson(buildHighlightsPrompt(reports));

  const highlightsPath = saveFile(JSON.stringify(highlights, null, 2), dateStr, "highlights.json");
  console.log(`  Saved ${highlightsPath}`);

  // 5. Create the GitHub issue for agents
  if (digestRepo) {
    const agentsUrl = await createGitHubIssue(
      reportIssueTitle("ai-agents", dateStr),
      agentsContent,
      ISSUE_LABELS.agents,
    );
    console.log(`  Created agents issue: ${agentsUrl}`);
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
