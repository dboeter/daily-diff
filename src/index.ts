/**
 * Daily Diff: daily digest for AI CLI tools and OpenClaw.
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
  type RepoFetch,
  fetchRecentItems,
  fetchRecentReleases,
  fetchRecentDiscussions,
  fetchSkillsData,
  createGitHubIssue,
} from "./github.ts";
import {
  type RepoDigest,
  buildCliPrompt,
  buildPeerPrompt,
  buildInfraPrompt,
  buildComparisonPrompt,
  buildInfraComparisonPrompt,
  buildPeersComparisonPrompt,
  buildSkillsPrompt,
} from "./prompts.ts";
import { buildTrendingPrompt, buildHighlightsPrompt, type ReportHighlights } from "./prompts-data.ts";
import {
  callLlm,
  parseLlmJson,
  saveFile,
  autoGenFooter,
  LLM_TOKENS_TRENDING,
  assertLlmHealthy,
  reportLlmHealth,
  llmHealthLine,
  isConnectionError,
} from "./report.ts";
import {
  buildCliReportContent,
  buildOpenclawReportContent,
  buildInfraReportContent,
} from "./report-builders.ts";
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
import { MSG, ISSUE_LABELS, CLI_ISSUE_TITLE, OPENCLAW_ISSUE_TITLE, INFRA_ISSUE_TITLE } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Repo config — loaded from config.yml, falls back to built-in defaults
// ---------------------------------------------------------------------------

const {
  cliRepos: CLI_REPOS,
  skillsRepo: CLAUDE_SKILLS_REPO,
  openclaw: OPENCLAW,
  openclawPeers: OPENCLAW_PEERS,
  infraRepos: INFRA_REPOS,
} = loadConfig();

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

async function fetchAllData(
  since: Date,
  webState: WebState,
  fetchHf: boolean,
): Promise<{
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
  const allConfigs = [...CLI_REPOS, OPENCLAW, ...OPENCLAW_PEERS, ...INFRA_REPOS];
  console.log(
    `  Tracking: ${allConfigs.map((r) => r.id).join(", ")}, claude-code-skills, web, hn, ph, arxiv, ` +
      `${fetchHf ? "hf, " : ""}devto, lobsters`,
  );

  const [
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
    Promise.all(
      allConfigs.map(async (cfg) => {
        try {
          const [issuesRaw, prs, releases, discussions] = await Promise.all([
            fetchRecentItems(cfg, "issues", since),
            fetchRecentItems(cfg, "pulls", since),
            fetchRecentReleases(cfg.repo, since),
            cfg.discussions ? fetchRecentDiscussions(cfg.repo, since) : Promise.resolve([]),
          ]);
          const issues = issuesRaw.filter((i) => !i.pull_request);
          console.log(
            `  [${cfg.id}] issues: ${issues.length}, prs: ${prs.length}, releases: ${releases.length}` +
              (cfg.discussions ? `, discussions: ${discussions.length}` : ""),
          );
          return { cfg, issues, prs, releases, discussions };
        } catch (err) {
          console.error(`  [${cfg.id}] fetch failed: ${err}`);
          return { cfg, issues: [], prs: [], releases: [], discussions: [] };
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
  { cfg, issues, prs, releases, discussions }: RepoFetch,
  prompt: string,
  noActivityMsg: string,
  failMsg: string,
): Promise<RepoDigest> {
  if (!issues.length && !prs.length && !releases.length && !discussions.length) {
    console.log(`  [${cfg.id}] No activity, skipping LLM call`);
    return { config: cfg, issues, prs, releases, discussions, summary: noActivityMsg };
  }
  const summary = await summarize(cfg.id, prompt, failMsg);
  return { config: cfg, issues, prs, releases, discussions, summary };
}

/** Every LLM-generated report body. */
interface Summaries {
  cliDigests: RepoDigest[];
  openclawSummary: string;
  skillsSummary: string;
  peerDigests: RepoDigest[];
  infraDigests: RepoDigest[];
  trendingSummary: string;
}

/** Generate every report body. */
async function generateSummaries(
  fetchedCli: RepoFetch[],
  fetchedOpenclaw: RepoFetch,
  skillsData: { prs: GitHubItem[]; issues: GitHubItem[] },
  fetchedPeers: RepoFetch[],
  fetchedInfra: RepoFetch[],
  trendingData: TrendingData,
  dateStr: string,
): Promise<Summaries> {
  const noActivity = MSG.noActivity;
  const fail = MSG.summaryFailed;

  const [cliDigests, openclawSummary, skillsSummary, peerDigests, infraDigests, trendingSummary] =
    await Promise.all([
      Promise.all(
        fetchedCli.map((f) =>
          summarizeRepo(
            f,
            buildCliPrompt(f.cfg, f.issues, f.prs, f.releases, f.discussions, dateStr),
            noActivity,
            fail,
          ),
        ),
      ),
      summarizeRepo(
        fetchedOpenclaw,
        buildPeerPrompt(
          fetchedOpenclaw.cfg,
          fetchedOpenclaw.issues,
          fetchedOpenclaw.prs,
          fetchedOpenclaw.releases,
          dateStr,
          50,
          30,
        ),
        noActivity,
        fail,
      ).then((d) => d.summary),
      summarize(
        "claude-code-skills",
        buildSkillsPrompt(skillsData.prs, skillsData.issues, dateStr),
        MSG.skillsFailed,
      ),
      Promise.all(
        fetchedPeers.map((f) =>
          summarizeRepo(f, buildPeerPrompt(f.cfg, f.issues, f.prs, f.releases, dateStr), noActivity, fail),
        ),
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

  return { cliDigests, openclawSummary, skillsSummary, peerDigests, infraDigests, trendingSummary };
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

  const peerIds = new Set(OPENCLAW_PEERS.map((p) => p.id));
  const infraIds = new Set(INFRA_REPOS.map((r) => r.id));
  const fetchedCli = fetched.filter(
    (f) => f.cfg.id !== OPENCLAW.id && !peerIds.has(f.cfg.id) && !infraIds.has(f.cfg.id),
  );
  const fetchedOpenclaw = fetched.find((f) => f.cfg.id === OPENCLAW.id)!;
  const fetchedPeers = fetched.filter((f) => peerIds.has(f.cfg.id));
  const fetchedInfra = fetched.filter((f) => infraIds.has(f.cfg.id));

  // 2. Generate every report body
  console.log("  Generating summaries...");
  const summaries = await generateSummaries(
    fetchedCli,
    fetchedOpenclaw,
    skillsData,
    fetchedPeers,
    fetchedInfra,
    trendingData,
    dateStr,
  );

  // First gate: ~20 calls have run by now, enough to tell an outage from a
  // flaky report. Bailing here costs nothing — no file has been written yet.
  assertLlmHealthy("summary");

  // 3. Generate cross-repo comparisons
  console.log("  Calling LLM for comparative analyses...");
  const openclawDigest: RepoDigest = {
    config: OPENCLAW,
    issues: fetchedOpenclaw.issues,
    prs: fetchedOpenclaw.prs,
    releases: fetchedOpenclaw.releases,
    discussions: fetchedOpenclaw.discussions,
    summary: summaries.openclawSummary,
  };

  // Routed through summarize() so a failed comparison degrades to a fixed
  // notice, the same way a failed per-repo summary does. These calls used to be
  // bare: on 2026-08-28 the provider was unreachable, and the rejection here
  // aborted main() — discarding every summary already generated along with the
  // HN, ArXiv, Product Hunt, trending and web reports, whose data had all been
  // fetched successfully and which have nothing to do with a comparison.
  const [comparison, peersComparison, infraComparison] = await Promise.all([
    summarize("cli-comparison", buildComparisonPrompt(summaries.cliDigests, dateStr), MSG.comparisonFailed),
    summarize(
      "peers-comparison",
      buildPeersComparisonPrompt(openclawDigest, summaries.peerDigests, dateStr),
      MSG.comparisonFailed,
    ),
    summarize(
      "infra-comparison",
      buildInfraComparisonPrompt(summaries.infraDigests, dateStr),
      MSG.comparisonFailed,
    ),
  ]);

  // 4. Build + save all reports
  const ft = autoGenFooter();
  const cliContent = buildCliReportContent(
    summaries.cliDigests,
    summaries.skillsSummary,
    comparison,
    utcStr,
    dateStr,
    ft,
    CLAUDE_SKILLS_REPO,
  );
  const openclawContent = buildOpenclawReportContent(
    fetchedOpenclaw,
    summaries.peerDigests,
    summaries.openclawSummary,
    peersComparison,
    utcStr,
    dateStr,
    ft,
    OPENCLAW,
    OPENCLAW_PEERS,
  );
  const infraContent = buildInfraReportContent(summaries.infraDigests, infraComparison, utcStr, dateStr, ft);

  console.log(`  Saved ${saveFile(cliContent, dateStr, "ai-cli.md")}`);
  console.log(`  Saved ${saveFile(openclawContent, dateStr, "ai-agents.md")}`);
  console.log(`  Saved ${saveFile(infraContent, dateStr, "ai-infra.md")}`);

  if (!isHfWeek) {
    console.log("  [hf] Weekly report — not scheduled today, skipping.");
  }

  await Promise.all([
    saveWebReport(webResults, webState, utcStr, dateStr, digestRepo),
    saveTrendingReport(trendingData, summaries.trendingSummary, utcStr, dateStr, digestRepo),
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
    "ai-cli": cliContent,
    "ai-agents": openclawContent,
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

  // 6. Create GitHub issues for CLI + OpenClaw + infra
  if (digestRepo) {
    const cliUrl = await createGitHubIssue(CLI_ISSUE_TITLE(dateStr), cliContent, ISSUE_LABELS.cli);
    console.log(`  Created CLI issue: ${cliUrl}`);

    const ocUrl = await createGitHubIssue(
      OPENCLAW_ISSUE_TITLE(dateStr),
      openclawContent,
      ISSUE_LABELS.openclaw,
    );
    console.log(`  Created OpenClaw issue: ${ocUrl}`);

    const infraUrl = await createGitHubIssue(INFRA_ISSUE_TITLE(dateStr), infraContent, ISSUE_LABELS.infra);
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
