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
import { buildTrendingPrompt, buildHighlightsPrompt, type ReportHighlights } from "./prompts-data.ts";
import {
  callLlm,
  parseLlmJson,
  saveFile,
  autoGenFooter,
  LLM_TOKENS_TRENDING,
  LLM_TOKENS_LISTING,
  assertLlmHealthy,
  reportLlmHealth,
  llmHealthLine,
  isConnectionError,
} from "./report.ts";
import { buildProjectReportContent } from "./report-builders.ts";
import {
  saveWebReport,
  saveTrendingReport,
  saveHnReport,
  saveArxivReport,
  saveHfReport,
  saveCommunityReport,
} from "./report-savers.ts";
import { loadWebState, fetchSiteContent, type WebFetchResult, type WebState } from "./web.ts";
import { fetchTrendingData, type TrendingData } from "./trending.ts";
import { fetchHnData, type HnData } from "./hn.ts";
import { fetchArxivData, type ArxivData } from "./arxiv.ts";
import { fetchHfData, type HfData } from "./hf.ts";
import { fetchDevtoData, type DevtoData } from "./devto.ts";
import { fetchLobstersData, type LobstersData } from "./lobsters.ts";
import { loadConfig } from "./config.ts";
import { toCstDateStr, toUtcStr, isWeeklyRun, sleep } from "./date.ts";
import { MSG, ISSUE_LABELS, AGENTS_REPORT, INFRA_REPORT } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Repo config — loaded from config.yml, falls back to built-in defaults
// ---------------------------------------------------------------------------

const { agents: AGENTS, skillsRepo: CLAUDE_SKILLS_REPO, infraRepos: INFRA_REPOS } = loadConfig();

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

/** Stable releases and hot issues for one project. A failed fetch reads as a quiet period. */
async function fetchProject(cfg: RepoConfig, since: Date): Promise<ProjectFetch> {
  try {
    const [releases, hotIssues] = await Promise.all([
      fetchRecentReleases(cfg.repo, since),
      // Search API, rate-limited separately from releases: a failure here must
      // not discard the releases.
      fetchHotIssues(cfg.repo, since).catch((err): GitHubItem[] => {
        console.error(`  [${cfg.id}] hot issues fetch failed: ${err}`);
        return [];
      }),
    ]);
    const stable = releases.filter((r) => !isPrerelease(r));
    console.log(
      `  [${cfg.id}] releases: ${stable.length} stable + ${releases.length - stable.length} pre, ` +
        `hot issues: ${hotIssues.length}`,
    );
    return { config: cfg, releases: stable, prereleaseCount: releases.length - stable.length, hotIssues };
  } catch (err) {
    console.error(`  [${cfg.id}] fetch failed: ${err}`);
    return { config: cfg, releases: [], prereleaseCount: 0, hotIssues: [] };
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
}> {
  const daySince = new Date(now.getTime() - DAY_MS);
  const weekSince = new Date(now.getTime() - 7 * DAY_MS);
  console.log(
    `  Tracking daily: ${AGENTS.map((r) => r.id).join(", ")}, web, hn, arxiv, trending (news only)` +
      (weekly
        ? ` | weekly: ${INFRA_REPOS.map((r) => r.id).join(", ")}, skills, trending, hf, devto, lobsters`
        : ""),
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
  ] = await Promise.all([
    Promise.all(AGENTS.map((cfg) => fetchProject(cfg, daySince))),
    weekly
      ? Promise.all(INFRA_REPOS.map((cfg) => fetchProject(cfg, weekSince)))
      : Promise.resolve<ProjectFetch[]>([]),
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
    fetchTrendingData(weekly ? "weekly" : "daily").catch(
      (): TrendingData => ({
        trendingRepos: [],
        searchRepos: [],
        trendingFetchSuccess: false,
      }),
    ),
    fetchHnData().catch((): HnData => ({ stories: [], fetchSuccess: false })),
    fetchArxivData().catch((): ArxivData => ({ papers: [], fetchSuccess: false })),
    weekly
      ? fetchHfData().catch((): HfData => ({ models: [], fetchSuccess: false }))
      : Promise.resolve<HfData>({ models: [], fetchSuccess: false }),
    weekly
      ? fetchDevtoData().catch((): DevtoData => ({ articles: [], fetchSuccess: false }))
      : Promise.resolve<DevtoData>({ articles: [], fetchSuccess: false }),
    weekly
      ? fetchLobstersData().catch((): LobstersData => ({ stories: [], fetchSuccess: false }))
      : Promise.resolve<LobstersData>({ stories: [], fetchSuccess: false }),
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
  };
}

// ---------------------------------------------------------------------------
// Phase 2: LLM summaries
// ---------------------------------------------------------------------------

/** Call LLM with logging and error fallback. */
async function summarize(id: string, prompt: string, failMsg: string, maxTokens?: number): Promise<string> {
  console.log(`  [${id}] Calling LLM for summary...`);
  try {
    return await callLlm(prompt, maxTokens);
  } catch (err) {
    console.error(`  [${id}] LLM call failed: ${err}`);
    return failMsg;
  }
}

/** One LLM call over every active project; a fixed notice when none was active. */
function summarizeProjects(
  id: string,
  activities: ProjectActivity[],
  scope: DigestScope,
  dateStr: string,
  noActivityMsg: string,
): Promise<string> {
  const active = activities.filter(hasActivity);
  if (!active.length) {
    console.log(`  [${id}] No releases, hot issues or news, skipping LLM call`);
    return Promise.resolve(noActivityMsg);
  }
  return summarize(
    id,
    buildProjectDigestPrompt(active, scope, dateStr),
    MSG.summaryFailed,
    LLM_TOKENS_LISTING,
  );
}

const AGENTS_SCOPE: DigestScope = {
  subject: "AI coding agents and personal AI assistants",
  window: "last 24h",
  period: AGENTS_REPORT.period,
};

const INFRA_SCOPE: DigestScope = {
  subject: "AI infrastructure — inference engines, model serving, LLM gateways and fine-tuning frameworks",
  window: "last 7 days",
  period: INFRA_REPORT.period,
};

/** Every LLM-generated report body. The weekly ones are empty on other days. */
interface Summaries {
  agentsSummary: string;
  infraSummary: string;
  skillsSummary: string;
  trendingSummary: string;
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
  const [agentsSummary, infraSummary, skillsSummary, trendingSummary] = await Promise.all([
    summarizeProjects("agents", agentActivities, AGENTS_SCOPE, dateStr, MSG.agentsNoActivity),
    weekly
      ? summarizeProjects("infra", infraActivities, INFRA_SCOPE, dateStr, MSG.infraNoActivity)
      : Promise.resolve(""),
    weekly
      ? summarize(
          "claude-code-skills",
          buildSkillsPrompt(skillsData.prs, skillsData.issues, dateStr),
          MSG.skillsFailed,
        )
      : Promise.resolve(""),
    (async () => {
      if (!weekly) return "";
      const hasData = trendingData.trendingRepos.length > 0 || trendingData.searchRepos.length > 0;
      if (!hasData) {
        return MSG.trendingNoData;
      }
      return summarize(
        "trending",
        buildTrendingPrompt(trendingData, dateStr),
        MSG.trendingFailed,
        LLM_TOKENS_TRENDING,
      );
    })(),
  ]);

  return { agentsSummary, infraSummary, skillsSummary, trendingSummary };
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
  } = await fetchAllData(now, webState, weekly);

  // Agent news is matched against the other sources' data, so it waits for them.
  const agentNews = matchAgentNews(AGENTS, { hn: hnData, web: webResults, trending: trendingData });
  const agentActivities: ProjectActivity[] = agentFetches.map((f) => ({
    ...f,
    news: agentNews.get(f.config.id) ?? [],
  }));
  // Infra is reported on releases and hot issues alone: the news sources are
  // daily snapshots, and infra project names ("vLLM", "Ollama") already show up
  // in the HN report.
  const infraActivities: ProjectActivity[] = infraFetches.map((f) => ({ ...f, news: [] }));

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

  // First gate. On a daily run only the agents call has happened by now, below
  // LLM_MIN_SAMPLES, so this only arms on the weekly run (4 calls); the second
  // gate, after the savers, covers every run. Bailing here costs nothing — no
  // file has been written yet.
  assertLlmHealthy("summary");

  // 3. Build + save all reports
  const ft = autoGenFooter();
  const agentsContent = buildProjectReportContent({
    title: AGENTS_REPORT.title,
    dateStr,
    utcStr,
    activities: agentActivities,
    summary: summaries.agentsSummary,
    period: AGENTS_REPORT.period,
    footer: ft,
  });
  console.log(`  Saved ${saveFile(agentsContent, dateStr, "ai-agents.md")}`);

  let infraContent = "";
  if (weekly) {
    infraContent = buildProjectReportContent({
      title: INFRA_REPORT.title,
      dateStr,
      utcStr,
      activities: infraActivities,
      summary: summaries.infraSummary,
      period: INFRA_REPORT.period,
      footer: ft,
    });
    console.log(`  Saved ${saveFile(infraContent, dateStr, "ai-infra.md")}`);
  } else {
    console.log("  [weekly] Infra, trending, community and HF reports — not scheduled today, skipping.");
  }

  await Promise.all([
    saveWebReport(webResults, webState, utcStr, dateStr, digestRepo),
    saveHnReport(hnData, utcStr, dateStr, digestRepo),
    saveArxivReport(arxivData, utcStr, dateStr, digestRepo),
    ...(weekly
      ? [
          saveTrendingReport(
            trendingData,
            summaries.trendingSummary,
            { summary: summaries.skillsSummary, repo: CLAUDE_SKILLS_REPO },
            utcStr,
            dateStr,
            digestRepo,
          ),
          saveCommunityReport(devtoData, lobstersData, utcStr, dateStr, digestRepo),
          saveHfReport(hfData, utcStr, dateStr, digestRepo),
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
        return parseLlmJson<ReportHighlights>(await callLlm(prompt, 2048));
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

  // 5. Create GitHub issues for agents (+ infra on the weekly run)
  if (digestRepo) {
    const agentsUrl = await createGitHubIssue(
      AGENTS_REPORT.issueTitle(dateStr),
      agentsContent,
      ISSUE_LABELS.agents,
    );
    console.log(`  Created agents issue: ${agentsUrl}`);

    if (weekly) {
      const infraUrl = await createGitHubIssue(
        INFRA_REPORT.issueTitle(dateStr),
        infraContent,
        ISSUE_LABELS.infra,
      );
      console.log(`  Created infra issue: ${infraUrl}`);
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
