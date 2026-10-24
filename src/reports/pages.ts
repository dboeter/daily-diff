/**
 * The page builders (`buildXxxReport`): LLM calls + report Markdown, plus the
 * source's state file (labs, models, trending caches) once its report is built.
 * main() writes the report files and opens the issues once every report is
 * in, so each report's bar can link the others.
 */

import {
  DATA_REPORT,
  MSG,
  POLICY_REPORT,
  PROJECT_SCOPE,
  REPORTS,
  REPORT_META,
  SECTIONS,
  MODELS_PAGE,
  TRENDS_REPORT,
  reportHeading,
  type ReportId,
} from "../core/strings.ts";
import {
  buildPolicySummariesPrompt,
  buildTrendingSummariesPrompt,
  buildTrendsModelsPrompt,
  buildTrendsProsePrompt,
  buildTrendsSummariesPrompt,
  buildPolicyProsePrompt,
  buildDataSummariesPrompt,
  buildDataProsePrompt,
  buildModelsSummariesPrompt,
  modelSources,
} from "./prompts-pages.ts";
import { generateOr, saveFile, autoGenFooter, LLM_TOKENS_LISTING } from "../core/llm.ts";
import { saveLabsState, type LabsFetchResult, type LabPost, type LabsState } from "../sources/labs.ts";
import { loadReportedState, newItems, nextReportedState, saveReportedState } from "../core/report-state.ts";
import type { TrendingData } from "../trending/trending.ts";
import { saveClassifyCache, saveMatchState } from "../trending/jev.ts";
import { saveStarHistory, summaryRows } from "../trending/rank.ts";
import {
  AGENTS_HIGHLIGHTS_FOCUS,
  MODELS_HIGHLIGHTS_FOCUS,
  buildPageHighlightsPrompt,
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  hasActivity,
  type ProjectActivity,
} from "./prompts.ts";
import type { GitHubRelease, RepoConfig, SkillsData } from "../core/github.ts";
import {
  buildProjectReportContent,
  buildStealthSection,
  groupsMarkdown,
  highlightsOnly,
  signListItems,
  isNewStealthModel,
  renderCandidates,
  renderLabPostsTable,
  renderNewModelsTable,
  renderResearchTable,
  renderTrendingTables,
  renderPolicyTable,
  nestHeadings,
  renderVendorTables,
  renderVendorActions,
  renderReleaseTable,
  renderSpottedTable,
  policyTitleLabel,
  type ProjectGroup,
} from "./markdown.ts";
import {
  numberRows,
  parseRowSummaries,
  spliceTables,
  summaryText,
  TABLES_MARKER,
} from "./summarized-table.ts";
import type { HfData } from "../sources/hf.ts";
import type { ResearchPaper } from "../trending/research.ts";
import { POLICY_STATE_FILE, type PolicyData, type PolicyItem } from "../policy/policy.ts";
import { POLICY_VERDICTS_FILE } from "../policy/jev.ts";
import { nearPolicyDeadlines, renderDeadlines } from "../policy/deadlines.ts";
import type { ModelCatalog } from "../sources/openrouter.ts";
import { DATA_STATE_FILE, type DataState, type VendorData } from "../data/vendors.ts";
import { DATA_VERDICTS_FILE } from "../data/jev.ts";
import { commitWrites, planWrites } from "../core/new-items.ts";
import type { DataSectionKey } from "../core/config.ts";
import type { SpottedSection, StoryRow } from "../spotted/spotted.ts";

/** A finished report: main() writes its file and opens its issue (title and label from REPORTS). */
export interface SavedReport {
  id: ReportId;
  content: string;
}

/**
 * H1, the meta line, rule, body, footer. The footer brings its own separator,
 * so a body ending in one (Trends' tables, the models page's stealth section)
 * loses it.
 */
function assembleReport(id: ReportId, dateStr: string, meta: string, body: string): string {
  const trimmed = body.replace(/\n\n---(?:\n\n)?$/, "");
  return `${reportHeading(id, dateStr)}\n\n${meta}\n\n---\n\n${trimmed}${autoGenFooter()}`;
}

// ---------------------------------------------------------------------------
// Trends page — weekly, see WEEKLY_REPORT_WEEKDAY in date.ts
// ---------------------------------------------------------------------------

/** What the Trends page is built from; main() gathers it. */
export interface TrendsInput {
  trending: TrendingData;
  skills: SkillsData & { repo: string };
  hf: HfData;
  /** The week's papers (`weekPapers`). */
  papers: ResearchPaper[];
  /** The week's most discussed stories (`mostDiscussed`). */
  stories: Omit<StoryRow, "n">[];
  /** Every config.yml repo: Candidates to track leaves them out. */
  tracked: RepoConfig[];
}

/**
 * The weekly Trends page: Highlights, Agents & coding tools (the Radar and
 * category tables), Claude Code Skills, Candidates to track (code only),
 * Models, Research, Most discussed, Signals. An empty section is left out; the
 * page is null when every section is. First round, in parallel: the trending
 * row summaries, the models call, Skills, and one call for the Research and
 * Most discussed rows. Second round: the prose call over the page rendered
 * from them writes Highlights and Signals, and spliceTables puts the page
 * between them. A failed summaries call shows the descriptions, a failed
 * models call leaves the notice under Models, a failed prose call the notice
 * under Highlights; a failed Skills fetch or call leaves MSG.skillsFailed.
 */
export async function buildTrendsReport(
  input: TrendsInput,
  utcStr: string,
  dateStr: string,
): Promise<SavedReport | null> {
  const T = TRENDS_REPORT;
  const { trending, skills, hf } = input;
  const report = trending.report;
  const rows = report ? summaryRows(report) : [];
  const { hasHf, hasOpenRouter } = modelSources(hf, trending.openrouter);
  const papers = numberRows(input.papers);
  const stories = numberRows(input.stories, papers.length);
  const hasSkills = skills.prs.length + skills.issues.length > 0;
  if (!rows.length && !hasHf && !hasOpenRouter && !hasSkills && !papers.length && !stories.length) {
    console.log("  [trends] No trending rows, models, Skills activity, papers or stories, skipping report.");
    return null;
  }

  const [summaries, models, skillsSummary, rowSummaries] = await Promise.all([
    rows.length
      ? generateOr("trending-summaries", buildTrendingSummariesPrompt(rows, dateStr), "", LLM_TOKENS_LISTING)
      : "",
    hasHf || hasOpenRouter
      ? generateOr(
          "trends-models",
          buildTrendsModelsPrompt(hf, trending.openrouter, dateStr),
          MSG.summaryFailed,
          LLM_TOKENS_LISTING,
        )
      : "",
    // A failed fetch has nothing to summarize: the notice, without a call.
    skills.fetchSuccess
      ? generateOr(
          "claude-code-skills",
          buildSkillsPrompt(skills.prs, skills.issues, dateStr),
          MSG.skillsFailed,
        )
      : MSG.skillsFailed,
    papers.length + stories.length
      ? generateOr(
          "trends-summaries",
          buildTrendsSummariesPrompt(papers, stories, dateStr),
          "",
          LLM_TOKENS_LISTING,
        )
      : "",
  ]);

  const rowMap = parseRowSummaries(rowSummaries);
  const tables = report ? renderTrendingTables(report, parseRowSummaries(summaries)) : "";
  const page = [
    // The tables' own `##` headings go below the section's.
    tables && `## ${T.agentsHeading}\n\n${nestHeadings(tables, 3)}`,
    // Code renders "## Claude Code Skills"; the body's own sections go below it.
    `## ${T.skillsHeading}\n\n${T.skillsSource(skills.repo)}\n\n${nestHeadings(skillsSummary, 3)}`,
    report ? renderCandidates(report.onFire, input.tracked) : "",
    models && `## ${T.modelsHeading}\n\n${nestHeadings(models, 3)}`,
    renderResearchTable(papers, rowMap),
    renderSpottedTable(stories, rowMap, T.mostDiscussedHeading),
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
  const prose = await generateOr("trends", buildTrendsProsePrompt(page, dateStr), null, LLM_TOKENS_LISTING);
  const body = spliceTables(
    prose === null ? `## ${SECTIONS.highlights}\n\n${MSG.summaryFailed}` : signListItems(prose),
    `---\n\n${page}\n\n---`,
  );
  const content = assembleReport(
    "ai-trends",
    dateStr,
    `> ${REPORT_META.sources(T.sources)} | ${REPORT_META.generated(utcStr)}`,
    body,
  );

  // Only once the page exists.
  if (report?.traceFile) {
    console.log(`  Saved ${saveFile(report.traceFile, dateStr, "trending-trace.json")}`);
  }
  if (report?.nextMatches) saveMatchState(report.nextMatches);
  if (report?.nextClassifications) saveClassifyCache(report.nextClassifications);
  if (report?.nextStarHistory) saveStarHistory(report.nextStarHistory);

  return { id: "ai-trends", content };
}

// ---------------------------------------------------------------------------
// Agents report — daily
// ---------------------------------------------------------------------------

/**
 * The agents report: Highlights, one section per group
 * (agents, infra; their LLM summaries come from main()) and Spotted. One LLM
 * call: Highlights over the rendered groups and the Spotted table, none when
 * no project is active and Spotted is empty (then there is no Highlights). A
 * failed call leaves the failure notice under the heading.
 */
export async function buildAgentsReport(
  groups: ProjectGroup[],
  spotted: SpottedSection,
  utcStr: string,
  dateStr: string,
): Promise<SavedReport> {
  const spottedMd = renderSpottedTable(spotted.rows, spotted.summaries);
  let highlights = "";
  if (groups.some((g) => g.activities.some(hasActivity)) || spottedMd) {
    const bodyMd = [...groupsMarkdown(groups), spottedMd].filter(Boolean).join("\n\n");
    const prose = await generateOr(
      "agents-highlights",
      buildPageHighlightsPrompt(REPORTS["ai-agents"].name, bodyMd, AGENTS_HIGHLIGHTS_FOCUS, dateStr),
      null,
      LLM_TOKENS_LISTING,
    );
    highlights = highlightsOnly(prose ?? MSG.summaryFailed);
  }
  const content = buildProjectReportContent({
    heading: reportHeading("ai-agents", dateStr),
    utcStr,
    groups,
    period: PROJECT_SCOPE.period,
    ...(highlights ? { preamble: `${highlights}\n\n---\n\n` } : {}),
    ...(spottedMd ? { epilogue: `\n\n---\n\n${spottedMd}` } : {}),
    footer: autoGenFooter(),
  });
  return { id: "ai-agents", content };
}

// ---------------------------------------------------------------------------
// Models page (Anthropic and OpenAI posts, OpenRouter's new and stealth models) — daily
// ---------------------------------------------------------------------------

/** `digests/models-state.json`: the OpenRouter models a page listed (model id → CST date). */
export const MODELS_STATE_FILE = "digests/models-state.json";

/** Lab announcements rows; the rest is one "N more posts not shown." line. */
export const LAB_POSTS_MAX = 15;

/** The sitemaps' new posts, newest first; a first-crawled site only gets a count line: every URL in its sitemaps is new. */
export function labPosts(labs: LabsFetchResult[]): LabPost[] {
  return labs
    .filter((r) => !r.isFirstRun)
    .flatMap((r) => r.newItems)
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod));
}

/**
 * The models page: Highlights, Lab announcements (the sitemaps' new posts,
 * newest first, at most LAB_POSTS_MAX; a lab on its first crawl gets one line
 * with its count instead), New on OpenRouter (models listed in the last 2 days
 * that no earlier page listed), the stealth table (always shown) and Spotted.
 * Two LLM calls: the posts' and models' row summaries, then Highlights over the
 * rendered sections. A failed summaries call shows the descriptions, a failed
 * Highlights call the failure notice. Null when there is no new post, new
 * model, 🆕 stealth model or Spotted row. The labs state is saved either way, the
 * models state only once the page is built.
 */
export async function buildModelsPage(
  labs: LabsFetchResult[],
  labsState: LabsState,
  catalog: ModelCatalog | null,
  spotted: SpottedSection,
  utcStr: string,
  dateStr: string,
  stateFile = MODELS_STATE_FILE,
  now = Date.now(),
): Promise<SavedReport | null> {
  saveLabsState(labsState);
  console.log("  [models] Web state saved.");
  const P = MODELS_PAGE;
  const posts = labPosts(labs);
  const shownPosts = numberRows(posts.slice(0, LAB_POSTS_MAX));
  const state = loadReportedState(stateFile);
  const fresh = newItems(
    (catalog?.newModels ?? []).map((m) => ({ ...m, published: m.created })),
    state,
    dateStr,
  );
  const models = numberRows(fresh, shownPosts.length);
  const newStealth = (catalog?.stealth ?? []).some((m) => isNewStealthModel(m, now));
  const firstCrawls = labs
    .filter((r) => r.isFirstRun && r.totalDiscovered)
    .map((r) => P.firstCrawl(P.labs[r.site], r.totalDiscovered));
  if (!posts.length && !firstCrawls.length && !models.length && !newStealth && !spotted.rows.length) {
    console.log(`  [models] ${P.noContent}`);
    return null;
  }

  const summaries = parseRowSummaries(
    shownPosts.length + models.length > 0
      ? await generateOr(
          "models-summaries",
          buildModelsSummariesPrompt(shownPosts, models, dateStr),
          "",
          LLM_TOKENS_LISTING,
        )
      : "",
  );
  const failed = labs.filter((r) => !r.fetchSuccess).map((r) => P.siteFailed(P.labs[r.site]));
  const labBody = [
    shownPosts.length
      ? renderLabPostsTable(shownPosts, summaries)
      : labs.some((r) => !r.isFirstRun)
        ? P.noPosts
        : "",
    posts.length > LAB_POSTS_MAX ? P.morePosts(posts.length - LAB_POSTS_MAX) : "",
    ...firstCrawls,
    ...failed,
  ]
    .filter(Boolean)
    .join("\n\n");
  const modelsBody =
    catalog === null
      ? P.catalogUnavailable
      : models.length
        ? renderNewModelsTable(models, summaries)
        : P.noModels;
  const tracked = [`## ${P.labHeading}\n\n${labBody}`, `## ${P.modelsHeading}\n\n${modelsBody}`];
  const stealth = buildStealthSection(catalog?.stealth ?? null, now);
  const spottedMd = renderSpottedTable(spotted.rows, spotted.summaries);
  // The Highlights call reads everything below Highlights: a 🆕 stealth model is this page's news too.
  const bodyMd = [...tracked, stealth, spottedMd].filter(Boolean).join("\n\n");
  const prose = await generateOr(
    "models-highlights",
    buildPageHighlightsPrompt(REPORTS["ai-models"].name, bodyMd, MODELS_HIGHLIGHTS_FOCUS, dateStr),
    null,
    LLM_TOKENS_LISTING,
  );
  const highlights = highlightsOnly(prose ?? MSG.summaryFailed);

  const meta = `> ${P.counts(posts.length, models.length, spotted.rows.length)} | ${REPORT_META.generated(utcStr)}`;
  const body = `${[highlights, ...tracked].map((s) => `${s}\n\n---\n\n`).join("")}${stealth}${spottedMd}`;
  saveReportedState(nextReportedState(state, fresh, dateStr), stateFile);
  return {
    id: "ai-models",
    content: assembleReport("ai-models", dateStr, meta, body),
  };
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
  const files = { state: stateFile, verdicts: verdictsFile, trace: "policy-trace.json" };
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
      buildPolicyProsePrompt(
        renderPolicyTable(items, new Map()),
        dateStr,
        policyData.readerProfile,
        nearPolicyDeadlines(policyData.deadlines, items, dateStr),
      ),
      null,
      LLM_TOKENS_LISTING,
    ),
  ]);
  if (prose === null) return null;

  const sources = [...new Set(items.map((i) => i.source))].join(" + ");
  const ranked = policyData.rankedBy === "jev" ? REPORT_META.jevRanked : "";
  const meta = `> ${REPORT_META.sources(sources)} | ${POLICY_REPORT.newItems(items.length)}${ranked} | ${REPORT_META.generated(utcStr)}`;
  const body = spliceTables(highlightsOnly(prose), tables(parseRowSummaries(summaries)));
  // Only once the report exists.
  commitWrites(writes.onReported, files, dateStr);
  return { id: "ai-policy", content: assembleReport("ai-policy", dateStr, meta, body) };
}

// ---------------------------------------------------------------------------
// Data report (Databricks, Snowflake, the open-source data stack) — daily
// ---------------------------------------------------------------------------

/** A Releases this week row: a stable release no earlier report showed. */
export interface ReleaseRow {
  /** `release:<owner/repo>@<tag>`, its entry in the data state's `reported`. */
  key: string;
  project: RepoConfig;
  release: GitHubRelease;
}

/** One repo section of the data report (config.yml `databricks`, `snowflake`, `data_stack`). */
export interface DataSection {
  key: DataSectionKey;
  subject: string;
  /** Every tracked project, active or not, in config order. */
  activities: ProjectActivity[];
}

/** A bullet line: `- `, `* ` or `1. `. */
const BULLET_RE = /^\s*(?:[-*]|\d+\.)\s/;

/**
 * Split the prose call's reply at TABLES_MARKER (without one, at its first
 * `## ` heading after the first line, so a section the model wrote is still
 * placed or dropped): Highlights before it; after it, only
 * the Across platforms section's bullets (with their wrapped lines), from its
 * heading to the next `## ` heading, so a note the model adds there is dropped
 * (the 2026-10-21 replay ended with one). Any other section it wrote was not
 * asked for and is dropped; a heading without bullets is left out.
 */
function splitProse(prose: string): { highlights: string; acrossPlatforms: string } {
  const lines = prose.split("\n");
  const marker = lines.findIndex((l) => l.trim() === TABLES_MARKER);
  const heading = lines.findIndex((l, j) => j > 0 && l.startsWith("## "));
  const i = marker !== -1 ? marker : heading !== -1 ? heading : lines.length;
  // Past the marker, or from the heading itself when there is none.
  const after = lines.slice(marker !== -1 ? i + 1 : i);
  const start = after.findIndex((l) => l.trim() === `## ${DATA_REPORT.acrossPlatforms}`);
  const end = after.findIndex((l, j) => j > start && l.startsWith("## "));
  const section = start === -1 ? [] : after.slice(start + 1, end === -1 ? undefined : end);
  const bullets: string[] = [];
  let inBullet = false;
  // signListItems first: bullets opened with the sign instead of a marker would match no BULLET_RE.
  for (const l of signListItems(section.join("\n")).split("\n")) {
    inBullet = BULLET_RE.test(l) || (inBullet && /^\s+\S/.test(l));
    if (inBullet) bullets.push(l.trimEnd());
  }
  return {
    highlights: signListItems(lines.slice(0, i).join("\n").trim()),
    acrossPlatforms: bullets.length ? `## ${DATA_REPORT.acrossPlatforms}\n\n${bullets.join("\n")}` : "",
  };
}

/**
 * The data repos' stable releases of the last 7 days that no earlier report
 * showed (`reported`: the data state, which keeps them as `release:<repo>@<tag>`;
 * one shown today is shown again on a same-day re-run), newest first.
 */
function newReleases(
  sections: DataSection[],
  reported: Record<string, string>,
  dateStr: string,
): (ReleaseRow & { inSection: boolean })[] {
  return sections
    .flatMap((s) => s.activities)
    .flatMap((a) =>
      (a.weekReleases ?? []).map((release) => ({
        key: `release:${a.config.repo}@${release.tag_name}`,
        project: a.config,
        release,
        inSection: a.releases.some((r) => r.tag_name === release.tag_name),
      })),
    )
    .filter((r) => (reported[r.key] ?? dateStr) === dateStr)
    .sort((a, b) => b.release.published_at.localeCompare(a.release.published_at));
}

/**
 * Whether the data report has news: a kept vendor item, a release of the week
 * no earlier report showed that no repo section lists, or an active project.
 * Without any it is skipped: Spotted rows and EU data law never make one.
 */
export function hasDataNews(sections: DataSection[], vendor: VendorData, dateStr: string): boolean {
  return (
    vendor.items.length > 0 ||
    newReleases(sections, vendor.nextState.reported, dateStr).some((r) => !r.inSection) ||
    sections.some((s) => s.activities.some(hasActivity))
  );
}

/**
 * The data report: Highlights, then Databricks, Snowflake and Azure / Fabric &
 * GCP (each its code-rendered vendor table, then the vendor's repo section),
 * with Action required (code-rendered: the open end dates of reported
 * deprecations, in the state until they pass) between Highlights and them,
 * the open-source stack, Releases this week (code-rendered: the data repos'
 * stable releases of the last 7 days not shown before, summarized by the vendor
 * summaries call), Across platforms, Spotted and EU data law. A section with neither vendor items
 * nor repo activity is left out. LLM calls: one per active repo section (as in
 * the agents report) and one for the vendor row summaries, in parallel; then
 * one for Highlights and Across platforms over all of it (Across platforms is
 * left out when the model writes none). A failed summaries call leaves the
 * descriptions in the tables; a failed prose call leaves the failure notice in
 * Highlights. Null without news (`hasDataNews`): no kept vendor item, no release
 * of the week to list and no repo activity.
 * EU data law, the last section, is code only: links to `dataLaw` (today's
 * AI Policy items that are EU data law), left out when there are none; it
 * never makes a report on its own. Spotted (code-rendered, summarized by
 * main()'s Spotted call) goes between Across platforms and EU data law, and
 * never makes a report on its own either; the prose call sees it.
 */
export async function buildDataReport(
  sections: DataSection[],
  vendor: VendorData,
  dataLaw: PolicyItem[],
  spotted: SpottedSection,
  utcStr: string,
  dateStr: string,
  stateFile = DATA_STATE_FILE,
  verdictsFile = DATA_VERDICTS_FILE,
): Promise<SavedReport | null> {
  // Before the skip, as in buildPolicyReport: dropped items are then not asked again tomorrow, and
  // a quiet day keeps its record-only bundles.
  const files = { state: stateFile, verdicts: verdictsFile, trace: "data-trace.json" };
  commitWrites(planWrites(vendor).onFetched, files, dateStr);
  if (!hasDataNews(sections, vendor, dateStr)) {
    console.log(`  [data] ${DATA_REPORT.noNewItems}`);
    return null;
  }
  const { items } = vendor;
  const unshown = newReleases(sections, vendor.nextState.reported, dateStr);
  // A release of the last 24h is in its repo section: recorded as shown, not listed twice.
  const releases = numberRows(
    unshown.filter((r) => !r.inSection),
    items.length,
  );
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
    items.length + releases.length > 0
      ? generateOr(
          "data-vendor-summaries",
          buildDataSummariesPrompt(items, dateStr, releases),
          "",
          LLM_TOKENS_LISTING,
        )
      : "",
  ]);
  const summaries = parseRowSummaries(rowSummaries);
  // The prose call does not see the over-cap links: they have no summary to write from.
  const proseTables = renderVendorTables(items, summaries);
  const tables = renderVendorTables(items, summaries, vendor.alsoNew);
  // Today's end dates take today's row summary, kept in the state for the later report days.
  // A "—" summary (nothing beyond the title) is no action: the description, truncated, stands in.
  const actions = { ...vendor.nextState.actions };
  for (const i of items) {
    if (!actions[i.id] || !i.endDate) continue;
    const summary = summaryText(summaries, i);
    actions[i.id] = { ...actions[i.id]!, summary: summary === "—" ? summaryText(new Map(), i) : summary };
  }
  const actionTable = renderVendorActions(actions, dateStr);
  const repo = (key: DataSectionKey) => {
    const r = repos.find((s) => s.key === key);
    return { activities: r?.activities ?? [], summary: r?.summary ?? "" };
  };
  // Report order; Azure and GCP have no repo section.
  const groupsWith = (tables: ReturnType<typeof renderVendorTables>): ProjectGroup[] => [
    { title: H.databricks, ...repo("databricks"), preamble: tables.databricks },
    { title: H.snowflake, ...repo("snowflake"), preamble: tables.snowflake },
    { title: H.cloud, activities: [], summary: "", preamble: tables.cloud },
    { title: H.data_stack, ...repo("data_stack") },
    {
      title: DATA_REPORT.releasesHeading,
      activities: [],
      summary: "",
      preamble: renderReleaseTable(releases, summaries),
    },
  ];
  const groups = groupsWith(tables);

  const spottedMd = renderSpottedTable(spotted.rows, spotted.summaries);
  // The prose call sees what the reader sees below Highlights, except the over-cap links.
  const sectionsMd = [...groupsMarkdown(groupsWith(proseTables)), spottedMd].filter(Boolean).join("\n\n");
  const prose = await generateOr(
    "data-highlights",
    buildDataProsePrompt(sectionsMd, dateStr),
    null,
    LLM_TOKENS_LISTING,
  );
  const { highlights, acrossPlatforms } =
    prose === null
      ? { highlights: `## ${SECTIONS.highlights}\n\n${MSG.summaryFailed}`, acrossPlatforms: "" }
      : splitProse(prose);
  const lawLinks = dataLaw
    .map(
      (i) =>
        `- [${policyTitleLabel(i.title)}](${i.link}) — ${REPORTS["ai-policy"].name}${i.stage ? `, ${i.stage}` : ""}`,
    )
    .join("\n");
  const epilogue = [
    acrossPlatforms,
    spottedMd,
    lawLinks ? `## ${DATA_REPORT.dataLawHeading}\n\n${lawLinks}` : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const content = buildProjectReportContent({
    heading: reportHeading("ai-data", dateStr),
    utcStr,
    groups,
    period: PROJECT_SCOPE.period,
    preamble: [highlights, actionTable]
      .filter(Boolean)
      .map((s) => `${s}\n\n---\n\n`)
      .join(""),
    // On 2026-10-19 "Projects: 17 | Active today: 0" was all the header said above 16 vendor rows.
    leadingCounts: DATA_REPORT.vendorCount(items.length),
    ...(epilogue ? { epilogue: `\n\n---\n\n${epilogue}` } : {}),
    footer: autoGenFooter(),
  });
  // Only once the report exists, like the policy state; after a failed fetch it only prunes.
  const nextState: DataState = {
    ...vendor.nextState,
    ...(vendor.nextState.actions ? { actions } : {}),
    // Shown once: the next run skips them (newReleases); pruned with the vendor ids.
    reported: { ...vendor.nextState.reported, ...Object.fromEntries(unshown.map((r) => [r.key, dateStr])) },
  };
  // The reported state as the report left it: today's action summaries and shown releases added.
  commitWrites(planWrites({ ...vendor, nextState }).onReported, files, dateStr);
  return { id: "ai-data", content };
}
