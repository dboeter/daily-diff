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
  type RepoFetch,
  fetchRecentItems,
  fetchRecentReleases,
  fetchHotIssues,
  isPrerelease,
  fetchSkillsData,
  createGitHubIssue,
} from "./github.ts";
import {
  type RepoDigest,
  type ProjectActivity,
  buildInfraPrompt,
  buildInfraComparisonPrompt,
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
import { buildProjectReportContent, buildInfraReportContent } from "./report-builders.ts";
import {
  saveWebReport,
  saveTrendingReport,
  saveHnReport,
  savePhReport,
  saveArxivReport,
  saveHfReport,
  saveCommunityReport,
} from "./report-savers.ts";
import { loadWebState, fetchSiteContent, type WebFetchResult, type WebState } from "./web.ts";
import { fetchTrendingData, type TrendingData } from "./trending.ts";
import { fetchHnData, type HnData } from "./hn.ts";
import { fetchPhData, type PhData } from "./ph.ts";
import { fetchArxivData, type ArxivData } from "./arxiv.ts";
import { fetchHfData, type HfData } from "./hf.ts";
import { fetchDevtoData, type DevtoData } from "./devto.ts";
import { fetchLobstersData, type LobstersData } from "./lobsters.ts";
import { loadConfig } from "./config.ts";
import { toCstDateStr, toUtcStr, weekdayOf, sleep } from "./date.ts";
import { MSG, ISSUE_LABELS, AGENTS_REPORT, INFRA_ISSUE_TITLE } from "./i18n.ts";

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

// ---------------------------------------------------------------------------
// Phase 1: Fetch
// ---------------------------------------------------------------------------

/** An agent's releases and hot issues; news is matched after every source is in. */
type AgentFetch = Omit<ProjectActivity, "news">;

/** Stable releases and hot issues for one agent. A failed fetch reads as a quiet day. */
async function fetchAgent(cfg: RepoConfig, since: Date): Promise<AgentFetch> {
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
  since: Date,
  webState: WebState,
  fetchHf: boolean,
): Promise<{
  agentFetches: AgentFetch[];
  fetched: RepoFetch[];
  skillsData: { prs: GitHubItem[]; issues: GitHubItem[] };
  webResults: WebFetchResult[];
  trendingData: TrendingData;
  hnData: HnData;
  phData: PhData;
  arxivData: ArxivData;
  hfData: HfData;
  devtoData: DevtoData;
  lobstersData: LobstersData;
}> {
  console.log(
    `  Tracking: ${[...AGENTS, ...INFRA_REPOS].map((r) => r.id).join(", ")}, claude-code-skills, web, hn, ph, arxiv, ` +
      `${fetchHf ? "hf, " : ""}devto, lobsters`,
  );

  const [
    agentFetches,
    fetched,
    skillsData,
    webResults,
    trendingData,
    hnData,
    phData,
    arxivData,
    hfData,
    devtoData,
    lobstersData,
  ] = await Promise.all([
    Promise.all(AGENTS.map((cfg) => fetchAgent(cfg, since))),
    Promise.all(
      INFRA_REPOS.map(async (cfg) => {
        try {
          const [issuesRaw, prs, releases] = await Promise.all([
            fetchRecentItems(cfg, "issues", since),
            fetchRecentItems(cfg, "pulls", since),
            fetchRecentReleases(cfg.repo, since),
          ]);
          const issues = issuesRaw.filter((i) => !i.pull_request);
          console.log(
            `  [${cfg.id}] issues: ${issues.length}, prs: ${prs.length}, releases: ${releases.length}`,
          );
          return { cfg, issues, prs, releases };
        } catch (err) {
          console.error(`  [${cfg.id}] fetch failed: ${err}`);
          return { cfg, issues: [], prs: [], releases: [] };
        }
      }),
    ),
    fetchSkillsData(CLAUDE_SKILLS_REPO)
      .then((d) => {
        console.log(`  [claude-code-skills] prs: ${d.prs.length}, issues: ${d.issues.length}`);
        return d;
      })
      .catch((err) => {
        console.error(`  [claude-code-skills] fetch failed: ${err}`);
        return { prs: [] as GitHubItem[], issues: [] as GitHubItem[] };
      }),
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
    fetchTrendingData().catch(
      (): TrendingData => ({
        trendingRepos: [],
        searchRepos: [],
        trendingFetchSuccess: false,
      }),
    ),
    fetchHnData().catch((): HnData => ({ stories: [], fetchSuccess: false })),
    fetchPhData().catch((): PhData => ({ products: [], fetchSuccess: false })),
    fetchArxivData().catch((): ArxivData => ({ papers: [], fetchSuccess: false })),
    fetchHf
      ? fetchHfData().catch((): HfData => ({ models: [], fetchSuccess: false }))
      : Promise.resolve<HfData>({ models: [], fetchSuccess: false }),
    fetchDevtoData().catch((): DevtoData => ({ articles: [], fetchSuccess: false })),
    fetchLobstersData().catch((): LobstersData => ({ stories: [], fetchSuccess: false })),
  ]);

  return {
    agentFetches,
    fetched,
    skillsData,
    webResults,
    trendingData,
    hnData,
    phData,
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

/** Summarize a repo's activity, returning a RepoDigest. Skips LLM if no data. */
async function summarizeRepo(
  { cfg, issues, prs, releases }: RepoFetch,
  prompt: string,
  noActivityMsg: string,
  failMsg: string,
): Promise<RepoDigest> {
  if (!issues.length && !prs.length && !releases.length) {
    console.log(`  [${cfg.id}] No activity, skipping LLM call`);
    return { config: cfg, issues, prs, releases, summary: noActivityMsg };
  }
  const summary = await summarize(cfg.id, prompt, failMsg);
  return { config: cfg, issues, prs, releases, summary };
}

const AGENTS_SCOPE = {
  subject: "AI coding agents and personal AI assistants",
  window: "last 24h",
  period: "today",
} as const;

/** Every LLM-generated report body. */
interface Summaries {
  agentsSummary: string;
  skillsSummary: string;
  infraDigests: RepoDigest[];
  trendingSummary: string;
}

/** Generate every report body. */
async function generateSummaries(
  agentActivities: ProjectActivity[],
  skillsData: { prs: GitHubItem[]; issues: GitHubItem[] },
  fetchedInfra: RepoFetch[],
  trendingData: TrendingData,
  dateStr: string,
): Promise<Summaries> {
  const noActivity = MSG.noActivity;
  const fail = MSG.summaryFailed;

  const activeAgents = agentActivities.filter(hasActivity);

  const [agentsSummary, skillsSummary, infraDigests, trendingSummary] = await Promise.all([
    activeAgents.length
      ? summarize(
          "agents",
          buildProjectDigestPrompt(activeAgents, AGENTS_SCOPE, dateStr),
          MSG.summaryFailed,
          LLM_TOKENS_LISTING,
        )
      : Promise.resolve(MSG.agentsNoActivity),
    summarize(
      "claude-code-skills",
      buildSkillsPrompt(skillsData.prs, skillsData.issues, dateStr),
      MSG.skillsFailed,
    ),
    Promise.all(
      fetchedInfra.map((f) =>
        summarizeRepo(f, buildInfraPrompt(f.cfg, f.issues, f.prs, f.releases, dateStr), noActivity, fail),
      ),
    ),
    (async () => {
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

  return { agentsSummary, skillsSummary, infraDigests, trendingSummary };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * The Hugging Face report runs weekly, not daily. The Hub's trending list is
 * ranked by cumulative downloads, so it barely moves: measured over 14 days,
 * 90.5% of the models in a given day's report were already in the previous
 * day's. Weekly keeps the signal and drops six LLM calls a week, plus the Hub
 * fetch on those days.
 * 1 = Monday, against the CST date the digest folder is named for.
 */
const HF_REPORT_WEEKDAY = 1;

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
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = toCstDateStr(now);
  const utcStr = toUtcStr(now);
  const digestRepo = process.env["DIGEST_REPO"] ?? "";

  const providerName = process.env["LLM_PROVIDER"] ?? "anthropic";
  const isHfWeek = weekdayOf(dateStr) === HF_REPORT_WEEKDAY;
  console.log(
    `[${now.toISOString()}] Starting digest | provider: ${providerName} | HF weekly: ${isHfWeek ? "yes" : "no"}`,
  );

  // 1. Fetch all data in parallel
  const webState = loadWebState();
  const {
    agentFetches,
    fetched,
    skillsData,
    webResults,
    trendingData,
    hnData,
    phData,
    arxivData,
    hfData,
    devtoData,
    lobstersData,
  } = await fetchAllData(since, webState, isHfWeek);

  // Agent news is matched against the other sources' data, so it waits for them.
  const agentNews = matchAgentNews(AGENTS, { hn: hnData, web: webResults, trending: trendingData });
  const agentActivities: ProjectActivity[] = agentFetches.map((f) => ({
    ...f,
    news: agentNews.get(f.config.id) ?? [],
  }));

  // 2. Generate every report body
  console.log("  Generating summaries...");
  const summaries = await generateSummaries(agentActivities, skillsData, fetched, trendingData, dateStr);

  // First gate: ~20 calls have run by now, enough to tell an outage from a
  // flaky report. Bailing here costs nothing — no file has been written yet.
  assertLlmHealthy("summary");

  // 3. Generate the infra cross-repo comparison
  console.log("  Calling LLM for infra comparison...");
  // Routed through summarize() so a failed comparison degrades to a fixed
  // notice, the same way a failed per-repo summary does. These calls used to be
  // bare: on 2026-08-28 the provider was unreachable, and the rejection here
  // aborted main() — discarding every summary already generated along with the
  // HN, ArXiv, Product Hunt, trending and web reports, whose data had all been
  // fetched successfully and which have nothing to do with a comparison.
  const infraComparison = await summarize(
    "infra-comparison",
    buildInfraComparisonPrompt(summaries.infraDigests, dateStr),
    MSG.comparisonFailed,
  );

  // 4. Build + save all reports
  const ft = autoGenFooter();
  // Called without a URL for the full report on disk; with the committed file's
  // URL for the brief GitHub issue variant (comparison + per-project TL;DR).
  const agentsContent = buildProjectReportContent({
    title: AGENTS_REPORT.title,
    dateStr,
    utcStr,
    activities: agentActivities,
    summary: summaries.agentsSummary,
    period: AGENTS_REPORT.period,
    footer: ft,
  });
  const buildInfra = (fullReportUrl?: string) =>
    buildInfraReportContent(summaries.infraDigests, infraComparison, utcStr, dateStr, ft, fullReportUrl);
  const infraContent = buildInfra();

  console.log(`  Saved ${saveFile(agentsContent, dateStr, "ai-agents.md")}`);
  console.log(`  Saved ${saveFile(infraContent, dateStr, "ai-infra.md")}`);

  if (!isHfWeek) {
    console.log("  [hf] Weekly report — not scheduled today, skipping.");
  }

  await Promise.all([
    saveWebReport(webResults, webState, utcStr, dateStr, digestRepo),
    saveTrendingReport(
      trendingData,
      summaries.trendingSummary,
      { summary: summaries.skillsSummary, repo: CLAUDE_SKILLS_REPO },
      utcStr,
      dateStr,
      digestRepo,
    ),
    saveHnReport(hnData, utcStr, dateStr, digestRepo),
    savePhReport(phData, utcStr, dateStr, digestRepo),
    saveArxivReport(arxivData, utcStr, dateStr, digestRepo),
    saveCommunityReport(devtoData, lobstersData, utcStr, dateStr, digestRepo),
    ...(isHfWeek ? [saveHfReport(hfData, utcStr, dateStr, digestRepo)] : []),
  ]);

  // Second gate: an outage that starts *after* the first gate would otherwise
  // sail straight through — the savers each swallow their own failure and just
  // skip a report. Files are on disk by now, but the failing exit skips the
  // commit step, so they are never published.
  assertLlmHealthy("report");

  // 5. Generate highlights for Telegram notification
  const readReport = (name: string): string | undefined => {
    const p = path.join("digests", dateStr, name);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : undefined;
  };

  const reports: Record<string, string> = {
    "ai-agents": agentsContent,
    "ai-infra": infraContent,
  };
  for (const id of [
    "ai-trending",
    "ai-web",
    "ai-hn",
    "ai-ph",
    "ai-arxiv",
    "ai-hf",
    "ai-community",
  ] as const) {
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

  // 6. Create GitHub issues for agents + infra
  if (digestRepo) {
    const fileUrl = (file: string) => `https://github.com/${digestRepo}/blob/main/digests/${dateStr}/${file}`;
    const agentsUrl = await createGitHubIssue(
      AGENTS_REPORT.issueTitle(dateStr),
      agentsContent,
      ISSUE_LABELS.agents,
    );
    console.log(`  Created agents issue: ${agentsUrl}`);

    const infraUrl = await createGitHubIssue(
      INFRA_ISSUE_TITLE(dateStr),
      buildInfra(fileUrl("ai-infra.md")),
      ISSUE_LABELS.infra,
    );
    console.log(`  Created infra issue: ${infraUrl}`);
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
