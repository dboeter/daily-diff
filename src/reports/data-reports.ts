/**
 * Builders for the data-source reports: LLM call + report Markdown, plus the
 * source's state file (web, ArXiv, trending caches) once its report is built.
 * main() writes the report files and opens the issues once every report is
 * in, so each report's bar can link the others.
 */

import {
  ARXIV_REPORT,
  DATA_REPORT,
  MSG,
  POLICY_REPORT,
  PROJECT_SCOPE,
  REPORT_META,
  SECTIONS,
  WEB_REPORT,
  TRENDING_REPORT,
  reportHeading,
  type ReportId,
} from "../core/i18n.ts";
import {
  buildWebReportPrompt,
  buildDiscussionsPrompt,
  buildArxivPrompt,
  buildModelsPrompt,
  buildPolicySummariesPrompt,
  buildTrendingSummariesPrompt,
  buildTrendingProsePrompt,
  buildPolicyProsePrompt,
  buildDataSummariesPrompt,
  buildDataProsePrompt,
  discussionSources,
  modelSources,
  type DiscussionsData,
} from "./prompts-data.ts";
import {
  generateBody,
  generateOr,
  saveFile,
  autoGenFooter,
  LLM_TOKENS_WEB,
  LLM_TOKENS_LISTING,
} from "../core/report.ts";
import { saveWebState, type WebFetchResult, type WebState } from "../sources/web.ts";
import type { TrendingData } from "../trending/trending.ts";
import { saveClassifyCache, saveMatchState } from "../trending/jev.ts";
import { saveStarHistory, summaryRows } from "../trending/rank.ts";
import { buildProjectDigestPrompt, buildSkillsPrompt, hasActivity, type ProjectActivity } from "./prompts.ts";
import type { SkillsData } from "../core/github.ts";
import {
  buildProjectReportContent,
  renderTrendingTables,
  renderPolicyTable,
  nestHeadings,
  renderVendorTables,
  policyTitleLabel,
  type ProjectGroup,
} from "./report-builders.ts";
import { parseRowSummaries, spliceTables, TABLES_MARKER } from "./summarized-table.ts";
import { saveArxivState, type ArxivData } from "../sources/arxiv.ts";
import type { HfData } from "../sources/hf.ts";
import { POLICY_STATE_FILE, type PolicyData, type PolicyItem } from "../policy/policy.ts";
import { POLICY_VERDICTS_FILE } from "../policy/jev.ts";
import { renderDeadlines } from "../policy/deadlines.ts";
import type { OpenRouterData } from "../sources/openrouter.ts";
import { DATA_STATE_FILE, type VendorData } from "../data/vendors.ts";
import { DATA_VERDICTS_FILE } from "../data/jev.ts";
import { commitWrites, planWrites } from "../core/new-items.ts";
import type { DataSectionKey } from "../core/config.ts";

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

      const counts = (site: WebFetchResult["site"]) => {
        const r = webResults.find((w) => w.site === site);
        if (r && !r.fetchSuccess) return WEB_REPORT.sourceFailed;
        return WEB_REPORT.sourceCounts(r?.newItems.length ?? 0, r?.totalDiscovered ?? 0);
      };

      const mode = isFirstRun ? WEB_REPORT.firstCrawl : WEB_REPORT.todayUpdate;

      const meta =
        `> ${mode} | ${WEB_REPORT.newContent(totalNew)} | ${REPORT_META.generated(utcStr)}\n\n` +
        `${REPORT_META.sourcesHeader}\n` +
        `- Anthropic: [anthropic.com](https://www.anthropic.com) — ${counts("anthropic")}\n` +
        `- OpenAI: [openai.com](https://openai.com) — ${counts("openai")}`;
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

/**
 * Three LLM calls: the row summaries, the prose around the code-rendered
 * tables, and the Skills section. A failed summaries call leaves the
 * descriptions in the rows; a failed prose call leaves MSG.trendingFailed and
 * the report is still written (unlike Policy Watch, whose report is skipped:
 * here the tables carry the report); a failed Skills fetch or call leaves MSG.skillsFailed.
 */
export async function buildTrendingReport(
  trendingData: TrendingData,
  skills: SkillsData & { repo: string },
  utcStr: string,
  dateStr: string,
): Promise<SavedReport | null> {
  const report = trendingData.report;
  if (report === undefined) {
    console.log("  [trending] No ranked data, skipping report.");
    return null;
  }
  const rows = summaryRows(report);
  const [summaries, prose, skillsSummary] = await Promise.all([
    rows.length > 0
      ? generateOr("trending-summaries", buildTrendingSummariesPrompt(rows, dateStr), "", LLM_TOKENS_LISTING)
      : "",
    generateOr(
      "trending",
      buildTrendingProsePrompt(renderTrendingTables(report, new Map()), trendingData, dateStr),
      MSG.trendingFailed,
      LLM_TOKENS_LISTING,
    ),
    // A failed fetch has nothing to summarize: the notice, without a call.
    skills.fetchSuccess
      ? generateOr(
          "claude-code-skills",
          buildSkillsPrompt(skills.prs, skills.issues, dateStr),
          MSG.skillsFailed,
        )
      : MSG.skillsFailed,
  ]);

  // Skills ranks the community's most-discussed Claude Code skills — the same
  // "what's popular" genre as trending repos, so it rides along here.
  const skillsSection =
    `\n\n---\n\n## ${TRENDING_REPORT.skillsHeading}\n\n` +
    `${TRENDING_REPORT.skillsSource(skills.repo)}\n\n` +
    // Code renders "## Claude Code Skills"; the body's own sections go below it.
    nestHeadings(skillsSummary, 3);

  const tables = renderTrendingTables(report, parseRowSummaries(summaries));
  const trendingContent = assembleReport(
    "ai-trending",
    dateStr,
    `> ${REPORT_META.sources(TRENDING_REPORT.sources)} | ${REPORT_META.generated(utcStr)}`,
    spliceTables(prose, tables) + skillsSection,
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
  // The trace, the verdicts and the observed state before the no-items skip, unlike the trending
  // cache: on a day Jev drops every item there is no report, and the dropped items would be asked
  // again every day until they leave the feed's age window.
  const files = { state: stateFile, verdicts: verdictsFile, trace: "policy-ranking.json" };
  const writes = planWrites(policyData);
  commitWrites(writes.onFetched, files, dateStr);
  if (!policyData.fetchSuccess || policyData.items.length === 0) {
    console.log(`  [policy] ${policyData.fetchSuccess ? POLICY_REPORT.noNewItems : POLICY_REPORT.noData}`);
    return null;
  }
  const { items } = policyData;
  const tables = (summaries: Map<number, string>) =>
    renderPolicyTable(items, summaries, renderDeadlines(policyData.deadlines));
  const [summaries, prose] = await Promise.all([
    generateOr(
      "policy-summaries",
      buildPolicySummariesPrompt(items, dateStr, policyData.readerProfile),
      "",
      LLM_TOKENS_LISTING,
    ),
    generateOr(
      "policy",
      buildPolicyProsePrompt(tables(new Map()), dateStr, policyData.readerProfile),
      null,
      LLM_TOKENS_LISTING,
    ),
  ]);
  if (prose === null) return null;

  const sources = [...new Set(items.map((i) => i.source))].join(" + ");
  const ranked = policyData.rankedBy === "jev" ? REPORT_META.jevRanked : "";
  const meta = `> ${REPORT_META.sources(sources)} | ${POLICY_REPORT.newItems(items.length)}${ranked} | ${REPORT_META.generated(utcStr)}`;
  const body = spliceTables(prose, tables(parseRowSummaries(summaries)));
  // Only once the report exists, like the ArXiv state.
  commitWrites(writes.onReported, files, dateStr);
  return { id: "ai-policy", content: assembleReport("ai-policy", dateStr, meta, body) };
}

// ---------------------------------------------------------------------------
// Data report (Databricks, Snowflake, the open-source data stack) — daily
// ---------------------------------------------------------------------------

/** One repo section of the data report (config.yml `databricks`, `snowflake`, `data_stack`). */
export interface DataSection {
  key: DataSectionKey;
  subject: string;
  /** Every tracked project, active or not, in config order. */
  activities: ProjectActivity[];
}

/**
 * Split the prose call's reply at TABLES_MARKER: Highlights before it; after
 * it, the Data × AI and Worth a Look sections, each from its heading to the
 * next `## ` heading, so they render in report order whatever order the model used.
 */
function splitProse(prose: string): { highlights: string; dataAi: string; worthALook: string } {
  const lines = prose.split("\n");
  const i = lines.findIndex((l) => l.trim() === TABLES_MARKER);
  // No marker: all of it goes on top, as spliceTables does with a missing marker.
  if (i === -1) return { highlights: prose.trim(), dataAi: "", worthALook: "" };
  const after = lines.slice(i + 1);
  const section = (heading: string) => {
    const start = after.findIndex((l) => l.trim() === `## ${heading}`);
    if (start === -1) return "";
    const end = after.findIndex((l, j) => j > start && l.startsWith("## "));
    return after
      .slice(start, end === -1 ? undefined : end)
      .join("\n")
      .trim();
  };
  return {
    highlights: lines.slice(0, i).join("\n").trim(),
    dataAi: section(DATA_REPORT.dataAi),
    worthALook: section(SECTIONS.worthALook),
  };
}

/**
 * The data report: Highlights, then Databricks, Snowflake and Azure / Fabric &
 * GCP (each its code-rendered vendor table, then the vendor's repo section),
 * the open-source stack, Data × AI and Worth a Look. A section with neither vendor items
 * nor repo activity is left out; Data × AI is asked for only when a vendor item
 * is AI-flagged or a tracked project is active (the model picks the AI-related
 * releases and news), and left out when the model writes none. LLM calls: one per active repo section (as in
 * the agents report) and one for the vendor row summaries, in parallel; then
 * one for Highlights and Worth a Look over all of it. A failed summaries call
 * leaves the descriptions in the tables; a failed prose call leaves the failure
 * notice in Highlights. Null when there are no kept vendor items and no repo activity.
 * `dataLaw` (today's Policy Watch items that are EU data law) is linked in code
 * at the end of Worth a Look, which it creates if the prose has none; it never
 * makes a report on its own.
 */
export async function buildDataReport(
  sections: DataSection[],
  vendor: VendorData,
  dataLaw: PolicyItem[],
  utcStr: string,
  dateStr: string,
  stateFile = DATA_STATE_FILE,
  verdictsFile = DATA_VERDICTS_FILE,
): Promise<SavedReport | null> {
  // Before the skip, as in buildPolicyReport: dropped items are then not asked again tomorrow, and
  // a quiet day keeps its record-only bundles.
  const files = { state: stateFile, verdicts: verdictsFile, trace: "data-ranking.json" };
  const writes = planWrites(vendor);
  commitWrites(writes.onFetched, files, dateStr);
  const { items } = vendor;
  if (items.length === 0 && !sections.some((s) => s.activities.some(hasActivity))) {
    console.log(`  [data] ${DATA_REPORT.noNewItems}`);
    return null;
  }
  const H = DATA_REPORT.headings;
  const [repos, rowSummaries] = await Promise.all([
    Promise.all(
      sections.map(async (s) => {
        const active = s.activities.filter(hasActivity);
        if (!active.length) return { ...s, summary: "" };
        const prompt = buildProjectDigestPrompt(active, { subject: s.subject, ...PROJECT_SCOPE }, dateStr);
        const summary = await generateOr(`data-${s.key}`, prompt, MSG.summaryFailed, LLM_TOKENS_LISTING);
        return { ...s, summary };
      }),
    ),
    items.length > 0
      ? generateOr("data-vendor-summaries", buildDataSummariesPrompt(items, dateStr), "", LLM_TOKENS_LISTING)
      : "",
  ]);
  const tables = renderVendorTables(items, parseRowSummaries(rowSummaries));
  const repo = (key: DataSectionKey) => {
    const r = repos.find((s) => s.key === key);
    return { activities: r?.activities ?? [], summary: r?.summary ?? "" };
  };
  // Report order; Azure and GCP have no repo section.
  const groups: ProjectGroup[] = [
    { title: H.databricks, ...repo("databricks"), preamble: tables.databricks },
    { title: H.snowflake, ...repo("snowflake"), preamble: tables.snowflake },
    { title: H.cloud, activities: [], summary: "", preamble: tables.cloud },
    { title: H.data_stack, ...repo("data_stack") },
  ];

  // The prose call sees what the reader sees between Highlights and Worth a Look.
  const sectionsMd = groups
    .map((g) => {
      const body = g.activities.some(hasActivity) ? nestHeadings(g.summary, 3) : "";
      return g.preamble || body ? `## ${g.title}\n\n${[g.preamble, body].filter(Boolean).join("\n\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
  const aiItems = items.filter((i) => i.aiInData);
  const active = sections.flatMap((s) => s.activities.filter(hasActivity));
  const dataAi =
    aiItems.length || active.length
      ? {
          vendorTitles: aiItems.map((i) => `${i.title} (${i.source})`),
          news: active.flatMap((a) => a.news.map((n) => `${n.title} (${n.source}; ${a.config.name})`)),
        }
      : undefined;
  const prose = await generateOr(
    "data-highlights",
    buildDataProsePrompt(sectionsMd, dateStr, dataAi),
    null,
    LLM_TOKENS_LISTING,
  );
  const {
    highlights,
    dataAi: dataAiMd,
    worthALook,
  } = prose === null
    ? { highlights: `## ${SECTIONS.highlights}\n\n${MSG.summaryFailed}`, dataAi: "", worthALook: "" }
    : splitProse(prose);
  const lawLinks = dataLaw
    .map((i) => `- [${policyTitleLabel(i.title)}](${i.link}) — Policy Watch${i.stage ? `, ${i.stage}` : ""}`)
    .join("\n");
  const worth = lawLinks ? `${worthALook || `## ${SECTIONS.worthALook}\n`}\n${lawLinks}` : worthALook;
  // Not asked for: a Data × AI section the model wrote anyway is dropped.
  const epilogue = [dataAi ? dataAiMd : "", worth].filter(Boolean).join("\n\n---\n\n");

  const content = buildProjectReportContent({
    heading: reportHeading("ai-data", dateStr),
    utcStr,
    groups,
    period: PROJECT_SCOPE.period,
    preamble: highlights ? `${highlights}\n\n---\n\n` : "",
    omitQuietGroups: true,
    // On 2026-10-19 "Projects: 17 | Active today: 0" was all the header said above 16 vendor rows.
    leadingCounts: DATA_REPORT.vendorCount(items.length),
    ...(epilogue ? { epilogue: `\n\n---\n\n${epilogue}` } : {}),
    footer: autoGenFooter(),
  });
  // Only once the report exists, like the policy state; after a failed fetch it only prunes.
  commitWrites(writes.onReported, files, dateStr);
  return { id: "ai-data", content };
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
