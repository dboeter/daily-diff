/**
 * Builders for the data-source reports: LLM call + report Markdown, plus the
 * source's state file (web, ArXiv, trending caches) once its report is built.
 * main() writes the report files and opens the issues once every report is
 * in, so each report's bar can link the others.
 */

import {
  ARXIV_REPORT,
  POLICY_REPORT,
  REPORT_META,
  WEB_REPORT,
  TRENDING_REPORT,
  reportHeading,
  type ReportId,
} from "./i18n.ts";
import {
  buildWebReportPrompt,
  buildDiscussionsPrompt,
  buildArxivPrompt,
  buildModelsPrompt,
  buildPolicySummariesPrompt,
  buildPolicyProsePrompt,
  discussionSources,
  modelSources,
  type DiscussionsData,
} from "./prompts-data.ts";
import { generateBody, saveFile, autoGenFooter, LLM_TOKENS_WEB, LLM_TOKENS_LISTING } from "./report.ts";
import { saveWebState, type WebFetchResult, type WebState } from "./web.ts";
import type { TrendingData } from "./trending.ts";
import { saveClassifyCache, saveMatchState } from "./trending-jev.ts";
import { saveStarHistory } from "./trending-rank.ts";
import {
  parseRowSummaries,
  renderTrendingTables,
  renderPolicyTable,
  spliceTables,
  nestHeadings,
} from "./report-builders.ts";
import { saveArxivState, type ArxivData } from "./arxiv.ts";
import type { HfData } from "./hf.ts";
import { savePolicyState, POLICY_STATE_FILE, type PolicyData } from "./policy.ts";
import { savePolicyVerdicts, POLICY_VERDICTS_FILE } from "./policy-jev.ts";
import { renderDeadlines } from "./policy-deadlines.ts";
import type { OpenRouterData } from "./openrouter.ts";

/** A finished report: main() writes its file and opens its issue (title and label from REPORTS). */
export interface SavedReport {
  id: ReportId;
  content: string;
  /** Only when it differs from reportIssueTitle (the web report's first crawl). */
  issueTitle?: string;
}

/** H1, the meta block (a `>` line, plus the web report's source list), rule, body, footer. */
function assembleReport(id: ReportId, dateStr: string, meta: string, body: string): string {
  return `${reportHeading(id, dateStr)}\n\n${meta}\n\n---\n\n${body}${autoGenFooter()}`;
}

/** The meta line of a report with several sources: the ones present, joined. */
function sourcesMeta(sources: (string | false)[], utcStr: string): string {
  return `> ${REPORT_META.sources(sources.filter(Boolean).join(" + "))} | ${REPORT_META.generated(utcStr)}`;
}

/**
 * The LLM listing reports' shared step: one call, the body under the report's
 * H1 and meta line. Null when the call failed, so the report is skipped.
 */
async function buildListingReport(
  id: ReportId,
  tag: string,
  prompt: string,
  meta: string,
  dateStr: string,
): Promise<SavedReport | null> {
  console.log(`  [${tag}] Calling LLM for ${tag} report...`);
  try {
    const body = await generateBody(prompt, LLM_TOKENS_LISTING);
    return { id, content: assembleReport(id, dateStr, meta, body) };
  } catch (err) {
    console.error(`  [${tag}] Report generation failed: ${err}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Web report
// ---------------------------------------------------------------------------

export async function buildWebReport(
  webResults: WebFetchResult[],
  webState: WebState,
  utcStr: string,
  dateStr: string,
): Promise<SavedReport | null> {
  const hasNewContent = webResults.some((r) => r.newItems.length > 0);
  let saved: SavedReport | null = null;

  if (hasNewContent) {
    console.log("  [web] Calling LLM for web content report...");
    try {
      const summary = await generateBody(buildWebReportPrompt(webResults, dateStr), LLM_TOKENS_WEB);
      const isFirstRun = webResults.some((r) => r.isFirstRun);
      const totalNew = webResults.reduce((sum, r) => sum + r.newItems.length, 0);

      const anthropicNew = webResults.find((r) => r.site === "anthropic")?.newItems.length ?? 0;
      const anthropicTotal = webResults.find((r) => r.site === "anthropic")?.totalDiscovered ?? 0;
      const openaiNew = webResults.find((r) => r.site === "openai")?.newItems.length ?? 0;
      const openaiTotal = webResults.find((r) => r.site === "openai")?.totalDiscovered ?? 0;

      const mode = isFirstRun ? WEB_REPORT.firstCrawl : WEB_REPORT.todayUpdate;

      const meta =
        `> ${mode} | ${WEB_REPORT.newContent(totalNew)} | ${REPORT_META.generated(utcStr)}\n\n` +
        `${REPORT_META.sourcesHeader}\n` +
        `- Anthropic: [anthropic.com](https://www.anthropic.com) — ${anthropicNew} new articles (sitemap total: ${anthropicTotal})\n` +
        `- OpenAI: [openai.com](https://openai.com) — ${openaiNew} new articles (sitemap total: ${openaiTotal})`;
      const webContent = assembleReport("ai-web", dateStr, meta, summary);

      saved = { id: "ai-web", content: webContent, issueTitle: WEB_REPORT.issueTitle(dateStr, isFirstRun) };
    } catch (err) {
      console.error(`  [web] Report generation failed: ${err}`);
    }
  } else {
    console.log("  [web] No new content detected, skipping report.");
  }

  saveWebState(webState);
  console.log("  [web] State saved.");
  return saved;
}

// ---------------------------------------------------------------------------
// Trending report
// ---------------------------------------------------------------------------

export async function buildTrendingReport(
  trendingData: TrendingData,
  trending: { summaries: string; prose: string },
  skills: { summary: string; repo: string },
  utcStr: string,
  dateStr: string,
): Promise<SavedReport | null> {
  const report = trendingData.report;
  if (report === undefined) {
    console.log("  [trending] No ranked data, skipping report.");
    return null;
  }

  // Skills ranks the community's most-discussed Claude Code skills — the same
  // "what's popular" genre as trending repos, so it rides along here.
  const skillsSection =
    `\n\n---\n\n## ${TRENDING_REPORT.skillsHeading}\n\n` +
    `${TRENDING_REPORT.skillsSource(skills.repo)}\n\n` +
    // Code renders "## Claude Code Skills"; the body's own sections go below it.
    nestHeadings(skills.summary, 3);

  const tables = renderTrendingTables(report, parseRowSummaries(trending.summaries));
  const trendingContent = assembleReport(
    "ai-trending",
    dateStr,
    `> ${REPORT_META.sources(TRENDING_REPORT.sources)} | ${REPORT_META.generated(utcStr)}`,
    spliceTables(trending.prose, tables) + skillsSection,
  );

  // Only once the report exists, like the ArXiv state.
  if (report.rankingFile) {
    console.log(`  Saved ${saveFile(report.rankingFile, dateStr, "trending-ranking.json")}`);
  }
  if (report.nextMatches) saveMatchState(report.nextMatches);
  if (report.nextClassifications) saveClassifyCache(report.nextClassifications);
  if (report.nextStarHistory) saveStarHistory(report.nextStarHistory);

  return { id: "ai-trending", content: trendingContent };
}

// ---------------------------------------------------------------------------
// Discussions report (Hacker News daily; Dev.to + Lobste.rs on the weekly run)
// ---------------------------------------------------------------------------

export async function buildDiscussionsReport(
  data: DiscussionsData,
  utcStr: string,
  dateStr: string,
): Promise<SavedReport | null> {
  const { hn, devto, lobsters } = data;
  const { hasHn, hasDevto, hasLobsters } = discussionSources(data);
  if (!hasHn && !hasDevto && !hasLobsters) {
    console.log("  [discussions] No data available, skipping report.");
    return null;
  }
  const meta = sourcesMeta(
    [
      hasHn && `[Hacker News](https://news.ycombinator.com/) (${hn.stories.length} stories)`,
      hasDevto && `[Dev.to](https://dev.to/) (${devto.articles.length} articles)`,
      hasLobsters && `[Lobste.rs](https://lobste.rs/) (${lobsters.stories.length} stories)`,
    ],
    utcStr,
  );
  return buildListingReport("ai-hn", "discussions", buildDiscussionsPrompt(data, dateStr), meta, dateStr);
}

// ---------------------------------------------------------------------------
// ArXiv report
// ---------------------------------------------------------------------------

export async function buildArxivReport(
  arxivData: ArxivData,
  utcStr: string,
  dateStr: string,
): Promise<SavedReport | null> {
  if (!arxivData.fetchSuccess) {
    console.log("  [arxiv] No data available, skipping report.");
    return null;
  }

  // Written before the LLM call: the ranking is useful for tuning even when the report fails.
  if (arxivData.rankingFile) {
    console.log(`  Saved ${saveFile(arxivData.rankingFile, dateStr, "arxiv-ranking.json")}`);
  }

  const meta =
    `> ${REPORT_META.sources(ARXIV_REPORT.source)} | ` +
    `${arxivData.papers.length} papers${arxivData.rankedBy === "jev" ? REPORT_META.jevRanked : ""} | ` +
    REPORT_META.generated(utcStr);
  const report = await buildListingReport(
    "ai-arxiv",
    "arxiv",
    buildArxivPrompt(arxivData, dateStr),
    meta,
    dateStr,
  );
  // Only once the report exists: after a failed report the next run takes this pool too.
  if (report && arxivData.nextState) saveArxivState(arxivData.nextState);
  return report;
}

// ---------------------------------------------------------------------------
// Policy report
// ---------------------------------------------------------------------------

/**
 * Two LLM calls, like trending: row summaries and the prose around the
 * code-rendered table. A failed summaries call leaves the descriptions in the
 * table; a failed prose call skips the report.
 */
export async function buildPolicyReport(
  policyData: PolicyData,
  utcStr: string,
  dateStr: string,
  stateFile = POLICY_STATE_FILE,
  verdictsFile = POLICY_VERDICTS_FILE,
): Promise<SavedReport | null> {
  // Before the no-items skip, unlike the trending cache: on a day Jev drops
  // every item there is no report, and the dropped items would be asked again
  // every day until they leave the feed's age window.
  if (policyData.rankingFile) {
    console.log(`  Saved ${saveFile(policyData.rankingFile, dateStr, "policy-ranking.json")}`);
  }
  if (policyData.nextVerdicts) savePolicyVerdicts(policyData.nextVerdicts, verdictsFile);
  if (!policyData.fetchSuccess || policyData.items.length === 0) {
    console.log(`  [policy] ${policyData.fetchSuccess ? POLICY_REPORT.noNewItems : POLICY_REPORT.noData}`);
    return null;
  }
  const { items } = policyData;
  const tables = (summaries: Map<number, string>) =>
    renderPolicyTable(items, summaries, renderDeadlines(policyData.deadlines));
  console.log("  [policy] Calling LLM for policy report...");
  const [summaries, prose] = await Promise.all([
    generateBody(
      buildPolicySummariesPrompt(items, dateStr, policyData.readerProfile),
      LLM_TOKENS_LISTING,
    ).catch((err) => {
      console.error(`  [policy] Summaries failed, showing descriptions: ${err}`);
      return "";
    }),
    generateBody(
      buildPolicyProsePrompt(tables(new Map()), dateStr, policyData.readerProfile),
      LLM_TOKENS_LISTING,
    ).catch((err) => {
      console.error(`  [policy] Report generation failed: ${err}`);
      return null;
    }),
  ]);
  if (prose === null) return null;

  const sources = [...new Set(items.map((i) => i.source))].join(" + ");
  const ranked = policyData.rankedBy === "jev" ? REPORT_META.jevRanked : "";
  const meta = `> ${REPORT_META.sources(sources)} | ${POLICY_REPORT.newItems(items.length)}${ranked} | ${REPORT_META.generated(utcStr)}`;
  const body = spliceTables(prose, tables(parseRowSummaries(summaries)));
  // Only once the report exists, like the ArXiv state.
  savePolicyState(policyData.nextState, stateFile);
  return { id: "ai-policy", content: assembleReport("ai-policy", dateStr, meta, body) };
}

// ---------------------------------------------------------------------------
// Models report (Hugging Face + OpenRouter usage) — weekly, see WEEKLY_REPORT_WEEKDAY in date.ts
// ---------------------------------------------------------------------------

export async function buildModelsReport(
  hfData: HfData,
  openrouter: OpenRouterData,
  utcStr: string,
  dateStr: string,
): Promise<SavedReport | null> {
  const { hasHf, hasOpenRouter } = modelSources(hfData, openrouter);
  if (!hasHf && !hasOpenRouter) {
    console.log("  [models] No data available, skipping report.");
    return null;
  }
  const meta = sourcesMeta(
    [
      hasHf && `[Hugging Face Hub](https://huggingface.co/) (${hfData.models.length} models)`,
      hasOpenRouter && `[OpenRouter](https://openrouter.ai/rankings)`,
    ],
    utcStr,
  );
  return buildListingReport("ai-hf", "models", buildModelsPrompt(hfData, openrouter, dateStr), meta, dateStr);
}
