/**
 * Report saver functions — LLM call + file save + optional GitHub issue.
 * Extracted from index.ts for separation of concerns.
 */

import { WEB_REPORT, TRENDING_REPORT, ISSUE_LABELS, reportHeading, reportIssueTitle } from "./i18n.ts";
import {
  buildWebReportPrompt,
  buildDiscussionsPrompt,
  buildArxivPrompt,
  buildHfPrompt,
  type DiscussionsData,
} from "./prompts-data.ts";
import { callLlm, saveFile, autoGenFooter, LLM_TOKENS_WEB, LLM_TOKENS_LISTING } from "./report.ts";
import { createGitHubIssue } from "./github.ts";
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

// ---------------------------------------------------------------------------
// Web report
// ---------------------------------------------------------------------------

export async function saveWebReport(
  webResults: WebFetchResult[],
  webState: WebState,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  const hasNewContent = webResults.some((r) => r.newItems.length > 0);

  if (hasNewContent) {
    console.log("  [web] Calling LLM for web content report...");
    try {
      const summary = stripModelTitle(
        await callLlm(buildWebReportPrompt(webResults, dateStr), LLM_TOKENS_WEB),
      );
      const isFirstRun = webResults.some((r) => r.isFirstRun);
      const totalNew = webResults.reduce((sum, r) => sum + r.newItems.length, 0);

      const anthropicNew = webResults.find((r) => r.site === "anthropic")?.newItems.length ?? 0;
      const anthropicTotal = webResults.find((r) => r.site === "anthropic")?.totalDiscovered ?? 0;
      const openaiNew = webResults.find((r) => r.site === "openai")?.newItems.length ?? 0;
      const openaiTotal = webResults.find((r) => r.site === "openai")?.totalDiscovered ?? 0;

      const fileName = "ai-web.md";
      const mode = isFirstRun ? WEB_REPORT.firstCrawl : WEB_REPORT.todayUpdate;

      const webTitle = `${reportHeading("ai-web", dateStr)}\n\n`;
      const webMeta = `> ${mode} | ${WEB_REPORT.newContent(totalNew)} | ${WEB_REPORT.generated(utcStr)}\n\n`;
      const webSources =
        `${WEB_REPORT.sourcesHeader}\n` +
        `- Anthropic: [anthropic.com](https://www.anthropic.com) — ${anthropicNew} new articles (sitemap total: ${anthropicTotal})\n` +
        `- OpenAI: [openai.com](https://openai.com) — ${openaiNew} new articles (sitemap total: ${openaiTotal})\n\n`;

      const webContent = webTitle + webMeta + webSources + `---\n\n` + summary + autoGenFooter();

      console.log(`  Saved ${saveFile(webContent, dateStr, fileName)}`);

      if (digestRepo) {
        const issueTitle = WEB_REPORT.issueTitle(dateStr, isFirstRun);
        const webLabel = ISSUE_LABELS.web;
        const webUrl = await createGitHubIssue(issueTitle, webContent, webLabel);
        console.log(`  Created web issue: ${webUrl}`);
      }
    } catch (err) {
      console.error(`  [web] Report generation failed: ${err}`);
    }
  } else {
    console.log("  [web] No new content detected, skipping report.");
  }

  saveWebState(webState);
  console.log("  [web] State saved.");
}

// ---------------------------------------------------------------------------
// Trending report
// ---------------------------------------------------------------------------

export async function saveTrendingReport(
  trendingData: TrendingData,
  trending: { summaries: string; prose: string },
  skills: { summary: string; repo: string },
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  const report = trendingData.report;
  if (report === undefined) {
    console.log("  [trending] No ranked data, skipping report.");
    return;
  }

  const fileName = "ai-trending.md";
  const header =
    `${reportHeading("ai-trending", dateStr)}\n\n` +
    `> ${TRENDING_REPORT.sources} | Generated: ${utcStr} UTC\n\n---\n\n`;

  // Skills ranks the community's most-discussed Claude Code skills — the same
  // "what's popular" genre as trending repos, so it rides along here.
  const skillsSection =
    `\n\n---\n\n## ${TRENDING_REPORT.skillsHeading}\n\n` +
    `${TRENDING_REPORT.skillsSource(skills.repo)}\n\n` +
    // Code renders "## Claude Code Skills"; the body's own sections go below it.
    nestHeadings(skills.summary, 3);

  const tables = renderTrendingTables(report, parseRowSummaries(trending.summaries));
  const trendingContent =
    header + spliceTrendingProse(trending.prose, tables) + skillsSection + autoGenFooter();

  console.log(`  Saved ${saveFile(trendingContent, dateStr, fileName)}`);
  // Only once the report exists, like the ArXiv state.
  if (report.rankingFile) {
    console.log(`  Saved ${saveFile(report.rankingFile, dateStr, "trending-ranking.json")}`);
  }
  if (report.nextMatches) saveMatchState(report.nextMatches);
  if (report.nextClassifications) saveClassifyCache(report.nextClassifications);
  if (report.nextStarHistory) saveStarHistory(report.nextStarHistory);

  if (digestRepo) {
    const trendingTitle = reportIssueTitle("ai-trending", dateStr);
    const trendingLabel = ISSUE_LABELS.trending;
    const trendingUrl = await createGitHubIssue(trendingTitle, trendingContent, trendingLabel);
    console.log(`  Created trending issue: ${trendingUrl}`);
  }
}

// ---------------------------------------------------------------------------
// Discussions report (Hacker News daily; Dev.to + Lobste.rs on the weekly run)
// ---------------------------------------------------------------------------

export async function saveDiscussionsReport(
  data: DiscussionsData,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  const { hn, devto, lobsters } = data;
  const sources = [
    hn.fetchSuccess && `[Hacker News](https://news.ycombinator.com/) (${hn.stories.length} stories)`,
    devto.fetchSuccess && `[Dev.to](https://dev.to/) (${devto.articles.length} articles)`,
    lobsters.fetchSuccess && `[Lobste.rs](https://lobste.rs/) (${lobsters.stories.length} stories)`,
  ].filter(Boolean);
  if (sources.length === 0) {
    console.log("  [discussions] No data available, skipping report.");
    return;
  }

  console.log("  [discussions] Calling LLM for discussions report...");
  try {
    const summary = stripModelTitle(await callLlm(buildDiscussionsPrompt(data, dateStr), LLM_TOKENS_LISTING));

    const fileName = "ai-hn.md";
    const header =
      `${reportHeading("ai-hn", dateStr)}\n\n` +
      `> Sources: ${sources.join(" + ")} | Generated: ${utcStr} UTC\n\n` +
      `---\n\n`;

    const content = header + summary + autoGenFooter();

    console.log(`  Saved ${saveFile(content, dateStr, fileName)}`);

    if (digestRepo) {
      const url = await createGitHubIssue(reportIssueTitle("ai-hn", dateStr), content, ISSUE_LABELS.hn);
      console.log(`  Created discussions issue: ${url}`);
    }
  } catch (err) {
    console.error(`  [discussions] Report generation failed: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// ArXiv report
// ---------------------------------------------------------------------------

export async function saveArxivReport(
  arxivData: ArxivData,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  if (!arxivData.fetchSuccess) {
    console.log("  [arxiv] No data available, skipping report.");
    return;
  }

  // Written before the LLM call: the ranking is useful for tuning even when the report fails.
  if (arxivData.rankingFile) {
    console.log(`  Saved ${saveFile(arxivData.rankingFile, dateStr, "arxiv-ranking.json")}`);
  }

  console.log("  [arxiv] Calling LLM for ArXiv report...");
  try {
    const summary = stripModelTitle(await callLlm(buildArxivPrompt(arxivData, dateStr), LLM_TOKENS_LISTING));

    const fileName = "ai-arxiv.md";
    const header =
      `${reportHeading("ai-arxiv", dateStr)}\n\n` +
      `> Source: [ArXiv](https://arxiv.org/) (cs.AI, cs.CL, cs.LG) | ` +
      `${arxivData.papers.length} papers${arxivData.rankedBy === "jev" ? " ranked by [Jev](https://typesafe.ai) relevance" : ""} | ` +
      `Generated: ${utcStr} UTC\n\n` +
      `---\n\n`;

    const content = header + summary + autoGenFooter();

    console.log(`  Saved ${saveFile(content, dateStr, fileName)}`);
    // Only once the report exists: after a failed report the next run takes this pool too.
    if (arxivData.nextState) saveArxivState(arxivData.nextState);

    if (digestRepo) {
      const title = reportIssueTitle("ai-arxiv", dateStr);
      const label = ISSUE_LABELS.arxiv;
      const url = await createGitHubIssue(title, content, label);
      console.log(`  Created ArXiv issue: ${url}`);
    }
  } catch (err) {
    console.error(`  [arxiv] Report generation failed: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Models report (Hugging Face + OpenRouter usage) — weekly, see WEEKLY_REPORT_WEEKDAY in date.ts
// ---------------------------------------------------------------------------

export async function saveHfReport(
  hfData: HfData,
  openrouter: OpenRouterData,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  const hasOpenRouter = openrouter.topModels.length > 0 || openrouter.newModels.length > 0;
  const sources = [
    hfData.fetchSuccess && `[Hugging Face Hub](https://huggingface.co/) (${hfData.models.length} models)`,
    hasOpenRouter && `[OpenRouter](https://openrouter.ai/rankings)`,
  ].filter(Boolean);
  if (sources.length === 0) {
    console.log("  [models] No data available, skipping report.");
    return;
  }

  console.log("  [models] Calling LLM for models report...");
  try {
    const summary = stripModelTitle(
      await callLlm(buildHfPrompt(hfData, openrouter, dateStr), LLM_TOKENS_LISTING),
    );

    const fileName = "ai-hf.md";
    const header =
      `${reportHeading("ai-hf", dateStr)}\n\n` +
      `> Sources: ${sources.join(" + ")} | Generated: ${utcStr} UTC\n\n` +
      `---\n\n`;

    const content = header + summary + autoGenFooter();

    console.log(`  Saved ${saveFile(content, dateStr, fileName)}`);

    if (digestRepo) {
      const title = reportIssueTitle("ai-hf", dateStr);
      const label = ISSUE_LABELS.hf;
      const url = await createGitHubIssue(title, content, label);
      console.log(`  Created models issue: ${url}`);
    }
  } catch (err) {
    console.error(`  [models] Report generation failed: ${err}`);
  }
}
