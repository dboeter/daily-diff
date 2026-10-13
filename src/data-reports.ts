/**
 * Builders for the data-source reports: LLM call + report Markdown, plus the
 * source's state file (web, ArXiv, trending caches) once its report is built.
 * main() writes the report files and opens the issues once every report is
 * in, so each report's bar can link the others.
 */

import { REPORT_META, WEB_REPORT, TRENDING_REPORT, reportHeading, type ReportId } from "./i18n.ts";
import {
  buildWebReportPrompt,
  buildDiscussionsPrompt,
  buildArxivPrompt,
  buildModelsPrompt,
  discussionSources,
  type DiscussionsData,
} from "./prompts-data.ts";
import { callLlm, saveFile, autoGenFooter, LLM_TOKENS_WEB, LLM_TOKENS_LISTING } from "./report.ts";
import { saveWebState, type WebFetchResult, type WebState } from "./web.ts";
import type { TrendingData } from "./trending.ts";
import { saveClassifyCache, saveMatchState } from "./trending-jev.ts";
import { saveStarHistory } from "./trending-rank.ts";
import {
  parseRowSummaries,
  renderTrendingTables,
  spliceTrendingProse,
  stripModelTitle,
  nestHeadings,
} from "./report-builders.ts";
import { saveArxivState, type ArxivData } from "./arxiv.ts";
import type { HfData } from "./hf.ts";
import type { OpenRouterData } from "./openrouter.ts";

/** A finished report: main() writes its file and opens its issue (title and label from REPORTS). */
export interface SavedReport {
  id: ReportId;
  content: string;
  /** Only when it differs from reportIssueTitle (the web report's first crawl). */
  issueTitle?: string;
}

/** An LLM-written report body, without the H1 the model sometimes adds above the report's own. */
export async function generateBody(prompt: string, maxTokens?: number): Promise<string> {
  return stripModelTitle(await callLlm(prompt, maxTokens));
}

/** H1, the meta block (a `>` line, plus the web report's source list), rule, body, footer. */
function assembleReport(id: ReportId, dateStr: string, meta: string, body: string): string {
  return `${reportHeading(id, dateStr)}\n\n${meta}\n\n---\n\n${body}${autoGenFooter()}`;
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
        `${WEB_REPORT.sourcesHeader}\n` +
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
    spliceTrendingProse(trending.prose, tables) + skillsSection,
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
  const sources = [
    hasHn && `[Hacker News](https://news.ycombinator.com/) (${hn.stories.length} stories)`,
    hasDevto && `[Dev.to](https://dev.to/) (${devto.articles.length} articles)`,
    hasLobsters && `[Lobste.rs](https://lobste.rs/) (${lobsters.stories.length} stories)`,
  ].filter(Boolean);
  if (sources.length === 0) {
    console.log("  [discussions] No data available, skipping report.");
    return null;
  }

  console.log("  [discussions] Calling LLM for discussions report...");
  try {
    const summary = await generateBody(buildDiscussionsPrompt(data, dateStr), LLM_TOKENS_LISTING);
    const meta = `> ${REPORT_META.sources(sources.join(" + "))} | ${REPORT_META.generated(utcStr)}`;
    return { id: "ai-hn", content: assembleReport("ai-hn", dateStr, meta, summary) };
  } catch (err) {
    console.error(`  [discussions] Report generation failed: ${err}`);
    return null;
  }
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

  console.log("  [arxiv] Calling LLM for ArXiv report...");
  try {
    const summary = await generateBody(buildArxivPrompt(arxivData, dateStr), LLM_TOKENS_LISTING);
    const meta =
      `> Source: [ArXiv](https://arxiv.org/) (cs.AI, cs.CL, cs.LG) | ` +
      `${arxivData.papers.length} papers${arxivData.rankedBy === "jev" ? " ranked by [Jev](https://typesafe.ai) relevance" : ""} | ` +
      REPORT_META.generated(utcStr);
    const content = assembleReport("ai-arxiv", dateStr, meta, summary);
    // Only once the report exists: after a failed report the next run takes this pool too.
    if (arxivData.nextState) saveArxivState(arxivData.nextState);
    return { id: "ai-arxiv", content };
  } catch (err) {
    console.error(`  [arxiv] Report generation failed: ${err}`);
    return null;
  }
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
  const hasOpenRouter = openrouter.topModels.length > 0 || openrouter.newModels.length > 0;
  const sources = [
    hfData.fetchSuccess && `[Hugging Face Hub](https://huggingface.co/) (${hfData.models.length} models)`,
    hasOpenRouter && `[OpenRouter](https://openrouter.ai/rankings)`,
  ].filter(Boolean);
  if (sources.length === 0) {
    console.log("  [models] No data available, skipping report.");
    return null;
  }

  console.log("  [models] Calling LLM for models report...");
  try {
    const summary = await generateBody(buildModelsPrompt(hfData, openrouter, dateStr), LLM_TOKENS_LISTING);
    const meta = `> ${REPORT_META.sources(sources.join(" + "))} | ${REPORT_META.generated(utcStr)}`;
    return { id: "ai-hf", content: assembleReport("ai-hf", dateStr, meta, summary) };
  } catch (err) {
    console.error(`  [models] Report generation failed: ${err}`);
    return null;
  }
}
