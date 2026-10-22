/**
 * Report content builders — extracted from index.ts for testability.
 */

import { hasActivity, RELEASE_BODY_CHARS, releaseNotes, type ProjectActivity } from "./prompts.ts";
import type { ReleaseRow } from "./data-reports.ts";
import { escapeRegex } from "./agent-news.ts";
import type { OpenRouterNewModel, OpenRouterStealthModel } from "../sources/openrouter.ts";
import type { WebPageItem } from "../sources/web.ts";
import type { TrendingReportData } from "../trending/rank.ts";
import type { PolicyItem } from "../policy/policy.ts";
import type { KeptVendorItem } from "../data/jev.ts";
import type { VendorAction } from "../data/vendors.ts";
import type { StoryRow } from "../spotted/spotted.ts";
import type { ResearchPaper } from "../sources/research.ts";
import type { Category } from "../trending/rank.ts";
import type { RepoConfig } from "../core/github.ts";
import {
  AGENT_SECTION_KEYS,
  VENDOR_SECTIONS,
  vendorSection,
  type AgentSectionKey,
  type VendorSection,
} from "../core/config.ts";
import { summaryText, type Numbered } from "./summarized-table.ts";
import {
  LIVE_REPORT_IDS,
  OVERVIEW,
  REPORTS,
  REPORT_META,
  SECTIONS,
  STEALTH_SECTION,
  MODELS_PAGE,
  TRENDS_REPORT,
  POLICY_REPORT,
  DATA_REPORT,
  SPOTTED,
  type ReportId,
} from "../core/i18n.ts";

// ---------------------------------------------------------------------------
// Project digest (the agents report's agents and infra sections, the data report's repo sections)
// ---------------------------------------------------------------------------

/** One config section's projects, under its own heading. */
export interface ProjectGroup {
  /** The section's `title` in config.yml, rendered as its `##` heading. */
  title: string;
  /** Every tracked project, active or not, in config order. */
  activities: ProjectActivity[];
  /** LLM output: one `## <Project>` section per active project. */
  summary: string;
  /** Markdown under the heading, before the projects (the data report's vendor table). Shown even when every project is quiet. */
  preamble?: string;
}

export interface ProjectReportInput {
  /** The H1 line, from reportHeading. */
  heading: string;
  utcStr: string;
  groups: ProjectGroup[];
  /** Label for the quiet-projects line, e.g. "today". */
  period: string;
  /** Markdown rendered between the header and the groups, ending with its own separator. */
  preamble?: string;
  /** Counts shown before the project counts, e.g. the data report's "Vendor items: 16". */
  leadingCounts?: string;
  /** Markdown after the last group, before the footer (Spotted, the data report's EU data law), with its own separator. */
  epilogue?: string;
  footer: string;
}

/**
 * The projects in a group that count as quiet. Quiet is decided by the
 * summary, not only the data: the model leaves out a project whose only news
 * mentions it in passing, and such a project is quiet too. A summary with no
 * project section at all is a failure notice, so then the data decides.
 */
function quietProjects(g: ProjectGroup): ProjectActivity[] {
  const withData = g.activities.filter(hasActivity);
  // Line-anchored, so "## Pi pod" in a summary does not count as a Pi section.
  const covered = withData.filter((a) =>
    new RegExp(`^##\\s+${escapeRegex(a.config.name)}\\s*$`, "m").test(g.summary),
  );
  const active = covered.length > 0 ? covered : withData;
  return g.activities.filter((a) => !active.includes(a) && !a.fetchFailed);
}

/**
 * The groups as a prose call reads them: each with its preamble or an active
 * project, under its `##` title, the projects' sections nested below it (no
 * quiet lines). Empty groups are left out.
 */
export function groupsMarkdown(groups: ProjectGroup[]): string[] {
  return groups
    .map((g) => {
      const body = g.activities.some(hasActivity) ? nestHeadings(g.summary, 3) : "";
      return g.preamble || body ? `## ${g.title}\n\n${[g.preamble, body].filter(Boolean).join("\n\n")}` : "";
    })
    .filter(Boolean);
}

/**
 * Release-focused report, one `##` section per config group (coding agents,
 * agent tooling), the LLM's sections nested below it. Quiet projects are
 * listed in one line per group rather than each getting a "no activity"
 * section. Small enough to post as the GitHub issue body unchanged, so there
 * is no brief variant.
 */
export function buildProjectReportContent(r: ProjectReportInput): string {
  const all = r.groups.flatMap((g) => g.activities);
  const releases = all.reduce((n, a) => n + a.releases.length, 0);
  const prereleases = all.reduce((n, a) => n + a.prereleaseCount, 0);
  const link = (a: ProjectActivity) => `[${a.config.name}](https://github.com/${a.config.repo})`;
  let inactiveCount = 0;
  const sections = r.groups.flatMap((g) => {
    const quiet = quietProjects(g);
    // A project whose release fetch failed was not checked: "Quiet" would claim it shipped nothing.
    const unavailable = g.activities.filter((a) => a.fetchFailed);
    inactiveCount += quiet.length + unavailable.length;
    // A group with neither projects nor a preamble (the data report's Azure / Fabric & GCP on a day
    // without its vendor rows) has nothing to show. An all-quiet group shows its quiet line.
    if (!g.activities.length && !g.preamble) return [];
    const projects = [
      // The data report passes an empty summary for a group with no active project.
      nestHeadings(g.summary, 3),
      quiet.length ? `**Quiet ${r.period}:** ${quiet.map(link).join(", ")}` : "",
      unavailable.length ? `**Unavailable ${r.period}:** ${unavailable.map(link).join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    return `## ${g.title}\n\n` + [g.preamble, projects].filter(Boolean).join("\n\n");
  });

  return (
    `${r.heading}\n\n` +
    `> ${REPORT_META.generated(r.utcStr)} | ${r.leadingCounts ? `${r.leadingCounts} | ` : ""}Projects: ${all.length} | ` +
    `Active ${r.period}: ${all.length - inactiveCount} | ` +
    `Stable releases: ${releases} | Prereleases (not covered): ${prereleases}\n\n` +
    `---\n\n` +
    (r.preamble ?? "") +
    sections.join("\n\n---\n\n") +
    (r.epilogue ?? "") +
    r.footer
  );
}

// ---------------------------------------------------------------------------
// Report bar: links between the day's reports
// ---------------------------------------------------------------------------

/**
 * One line linking the day's overview and its other reports, in REPORTS
 * order. Absolute Pages URLs, so it works in the GitHub issue copy too.
 * Before October 2026 a report linked to nothing: the sidebar was the only
 * way between reports.
 */
export function renderReportBar(
  current: ReportId,
  ids: ReportId[],
  dateStr: string,
  pagesUrl: string,
): string {
  const links = LIVE_REPORT_IDS.filter((id) => ids.includes(id)).map((id) => {
    const label = `${REPORTS[id].emoji} ${REPORTS[id].name}`;
    return id === current ? `**${label}**` : `[${label}](${pagesUrl}/#${dateStr}/${id})`;
  });
  return [`[${OVERVIEW.emoji} ${OVERVIEW.name}](${pagesUrl}/#${dateStr})`, ...links].join(" · ");
}

/** Put the report bar under the report's H1. */
export function withReportBar(content: string, bar: string): string {
  const i = content.indexOf("\n");
  return i === -1 ? `${content}\n\n${bar}` : `${content.slice(0, i)}\n\n${bar}${content.slice(i)}`;
}

// ---------------------------------------------------------------------------
// LLM body clean-up
// ---------------------------------------------------------------------------

/** A `**Date:** …` style line of a title block the model writes under its H1. */
const TITLE_BLOCK_LINE = /^\*\*[\w /]+:\*\*/;

/**
 * Remove the title the model writes at the top of a report body: code renders
 * the report's H1 and metadata line. Before October 2026 five reports carried
 * two H1s ("# Hacker News AI Community Digest 2026-10-12" from code, then the
 * model's "… — 2026-10-12"), and the web report a `**Date:**` … `**Type:**` block
 * as well. A later H1 is demoted to H2, keeping its section.
 */
export function stripModelTitle(md: string): string {
  const lines = md.split("\n");
  let i = 0;
  const skipBlank = () => {
    while (i < lines.length && lines[i]!.trim() === "") i++;
  };
  skipBlank();
  if (/^#\s/.test(lines[i] ?? "")) {
    i++;
    while (i < lines.length && (lines[i]!.trim() === "" || TITLE_BLOCK_LINE.test(lines[i]!))) i++;
    if (/^-{3,}\s*$/.test(lines[i] ?? "")) {
      i++;
      skipBlank();
    }
  }
  const body = lines.slice(i);
  const levels = headingLevels(body);
  return body.map((line, j) => (levels[j] === 1 ? `#${line}` : line)).join("\n");
}

/** A code span: a pair of single backticks on one line, matched left to right. */
const CODE_SPAN = /`([^`\n]+)`/g;
/** Nothing but web links and the dashes or commas between them: `[text](url)` in prose about Markdown is code. */
const LINKS_ONLY = /^(?:\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)[\s,–—-]*)+$/;

/**
 * Take Markdown links out of the backticks the model puts around them, where
 * they render as literal text: on 2026-10-23 every release and issue link of
 * the agents report read `[v2.1.307](…)–[v2.1.308](…)`, after the prompt's own
 * example. A code span with anything else in it stays.
 */
export function unwrapCodeLinks(md: string): string {
  return md.replace(CODE_SPAN, (span, inner: string) => (LINKS_ONLY.test(inner) ? inner : span));
}

/**
 * A reply that was to write only Highlights, cut to its Highlights under the
 * fixed heading: a section the model adds anyway would land above the page's
 * tables, and a missing heading would leave bare bullets.
 */
export function highlightsOnly(reply: string): string {
  const lines = stripModelTitle(reply).trim().split("\n");
  const start = lines[0]?.startsWith("## ") ? 1 : 0;
  const end = lines.findIndex((l, j) => j >= start && l.startsWith("## "));
  const body = lines
    .slice(start, end === -1 ? undefined : end)
    .join("\n")
    .trim();
  return `## ${SECTIONS.highlights}\n\n${body}`;
}

/** Lines with their heading level (0 = not a heading), ignoring code fences. */
function headingLevels(lines: string[]): number[] {
  let inFence = false;
  return lines.map((line) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    return inFence ? 0 : (line.match(/^(#{1,6})\s/)?.[1]?.length ?? 0);
  });
}

/**
 * Shift a body's headings so its top heading sits at `level`, for a body
 * placed under a code-rendered heading (Skills inside trending). Before
 * October 2026 the Skills body's own H1 and H2s outranked its "## Claude Code
 * Skills" section.
 */
export function nestHeadings(md: string, level: number): string {
  const lines = md.split("\n");
  const levels = headingLevels(lines);
  const top = Math.min(...levels.filter((l) => l > 0));
  const shift = Number.isFinite(top) ? Math.max(0, level - top) : 0;
  if (shift === 0) return md;
  return lines
    .map((line, i) =>
      levels[i]! > 0 ? "#".repeat(Math.min(6, levels[i]! + shift)) + line.slice(levels[i]!) : line,
    )
    .join("\n");
}

// ---------------------------------------------------------------------------
// Stealth models (daily, on the models page)
// ---------------------------------------------------------------------------

/** A stealth model listed within this many days is flagged new (2 days covers a delayed cron). */
const STEALTH_NEW_DAYS = 2;
/** A stealth model expiring within this many days is flagged — they vanish without further notice. */
const STEALTH_EXPIRING_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A stealth model listed within STEALTH_NEW_DAYS: 🆕 in the table, and it publishes the models page. */
export function isNewStealthModel(m: OpenRouterStealthModel, now = Date.now()): boolean {
  const today = Date.parse(new Date(now).toISOString().slice(0, 10));
  return today - Date.parse(m.created) < STEALTH_NEW_DAYS * DAY_MS;
}

/**
 * Deterministic stealth-model section. Rendered from the catalog, not by the
 * LLM, so it can't be dropped or invented, and it always appears: "none
 * listed" and "catalog unavailable" are news too.
 */
export function buildStealthSection(models: OpenRouterStealthModel[] | null, now = Date.now()): string {
  const S = STEALTH_SECTION;
  let body: string;
  if (models === null) body = S.unavailable;
  else if (models.length === 0) body = S.none;
  else {
    const today = Date.parse(new Date(now).toISOString().slice(0, 10));
    const rows = models.map((m) => {
      const status: string[] = [];
      if (isNewStealthModel(m, now)) status.push(S.isNew);
      if (m.expires) {
        const days = Math.round((Date.parse(m.expires) - today) / DAY_MS);
        if (days <= STEALTH_EXPIRING_DAYS) status.push(S.expiring(days));
      }
      const link = `[${m.name}](https://openrouter.ai/${m.id})`;
      return `| ${link} \`${m.id}\` | ${m.created} | ${m.expires ?? "—"} | ${status.join(", ") || S.live} |`;
    });
    body = `${S.header}\n${rows.join("\n")}`;
  }
  return `## ${S.title}\n\n${body}\n\n---\n\n`;
}

// ---------------------------------------------------------------------------
// Code-rendered tables with LLM row summaries (summarized-table.ts)
// ---------------------------------------------------------------------------

/** Table cell text: one line, pipes escaped. */
export const cell = (s: string) => s.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();

/** Policy table link text. EUR-Lex titles run to 500+ characters; the item keeps the full one for Jev and the prompts. */
const POLICY_TITLE_MAX_CHARS = 200;
export const policyTitleLabel = (title: string): string =>
  cell(title.length > POLICY_TITLE_MAX_CHARS ? `${title.slice(0, POLICY_TITLE_MAX_CHARS)}…` : title);

/** The Radar and category tables, a `##` heading each; "" when both are empty. */
export function renderTrendingTables(report: TrendingReportData, summaries: Map<number, string>): string {
  const T = TRENDS_REPORT;
  const summary = (row: { n: number; description: string }) => cell(summaryText(summaries, row));
  const link = (name: string, url: string) => (url ? `[${cell(name)}](${cell(url)})` : cell(name));
  // 🔥: also in last week's report. In the name cell, the one cell both tables share.
  const fire = (r: { onFire?: boolean }) => (r.onFire ? "🔥 " : "");
  const blocks: string[] = [];

  if (report.radar.length > 0) {
    const rows = report.radar.map(
      (r) =>
        `| ${fire(r)}${link(r.name, r.url)} | ${cell(r.sources.join("; "))} | ${cell(r.signals.join("; "))} | ` +
        `${summary(r)} |`,
    );
    blocks.push(`## ${T.radarHeading}`, `${T.radarHeader}\n${rows.join("\n")}`);
  }

  for (const { category, rows } of report.categories) {
    const lines = rows.map(
      (r) =>
        `| ${fire(r)}${link(r.fullName, r.url)} | ${cell(r.language)} | ${cell(r.starsCell)} | ${summary(r)} |`,
    );
    blocks.push(`## ${T.categoryTitles[category]}`, `${T.categoryHeader}\n${lines.join("\n")}`);
  }

  return blocks.join("\n\n");
}

/**
 * The policy report's tables, one `##` section per jurisdiction with items, in
 * POLICY_REPORT.headings order, then News & commentary (news-feed items), then
 * Coming up. Each
 * row shows the summary for its own number (`n`, set by fetchPolicyData).
 * Date, source, title and stage come from the data, never the model.
 */
export function renderPolicyTable(
  items: Numbered<PolicyItem>[],
  summaries: Map<number, string>,
  /** The rendered Coming up section, which goes last, after the news. */
  deadlines = "",
): string {
  const lead = (it: PolicyItem) =>
    `| ${it.published.slice(0, 10)} | ${cell(it.source)} | [${policyTitleLabel(it.title)}](${cell(it.link)}) | `;
  const sections = Object.entries(POLICY_REPORT.headings).map(([jurisdiction, heading]) => {
    const rows = items
      .filter((it) => !it.news && it.jurisdiction === jurisdiction)
      .map((it) => `${lead(it)}${cell(it.stage ?? "")} | ${cell(summaryText(summaries, it))} |`);
    return rows.length ? `## ${heading}\n\n${POLICY_REPORT.tableHeader}\n${rows.join("\n")}` : "";
  });
  const newsRows = items
    .filter((it) => it.news)
    .map((it) => `${lead(it)}${cell(summaryText(summaries, it))} |`);
  if (newsRows.length) {
    sections.push(
      `## ${POLICY_REPORT.newsHeading}\n\n${POLICY_REPORT.newsTableHeader}\n${newsRows.join("\n")}`,
    );
  }
  sections.push(deadlines);
  return sections.filter(Boolean).join("\n\n");
}

/**
 * The data report's vendor tables, one per vendor section with items. Each row
 * shows the summary for its own number (`n`, set by selectVendorItems).
 * Date, source, title and the ⚠️/🤖 markers come from the data, never the model.
 */
/**
 * The data report's Releases this week table; each row's summary by its own
 * number (after the vendor rows), else its release notes, truncated. Empty
 * when there are no rows.
 */
export function renderReleaseTable(rows: Numbered<ReleaseRow>[], summaries: Map<number, string>): string {
  if (!rows.length) return "";
  const lines = rows.map(({ n, project, release }) => {
    const summary = summaryText(summaries, {
      n,
      description: releaseNotes(release.body, RELEASE_BODY_CHARS),
    });
    return (
      `| [${cell(project.name)}](https://github.com/${project.repo}) | ` +
      `[${cell(release.tag_name)}](https://github.com/${project.repo}/releases/tag/${encodeURIComponent(release.tag_name)}) | ` +
      `${release.published_at.slice(0, 10)} | ${cell(summary)} |`
    );
  });
  return `${DATA_REPORT.releasesTableHeader}\n${lines.join("\n")}`;
}

/**
 * The data report's Action required section: the open end dates (on or after
 * `dateStr`), nearest first. Empty when none is open.
 */
export function renderVendorActions(actions: Record<string, VendorAction>, dateStr: string): string {
  const rows = Object.values(actions)
    .filter((a) => a.date >= dateStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
    .map(
      (a) =>
        `| ${a.date} | ${cell(a.source)} | [${policyTitleLabel(a.title)}](${cell(a.link)}) | ${cell(a.summary ?? "—")} |`,
    );
  return rows.length
    ? `## ${DATA_REPORT.actionHeading}\n\n${DATA_REPORT.actionTableHeader}\n${rows.join("\n")}`
    : "";
}

export function renderVendorTables(
  items: Numbered<KeptVendorItem>[],
  summaries: Map<number, string>,
  /** Over the cap: one line of links under the section's table, no summaries. */
  alsoNew: KeptVendorItem[] = [],
): Partial<Record<VendorSection, string>> {
  const tables: Partial<Record<VendorSection, string>> = {};
  for (const section of VENDOR_SECTIONS) {
    const links = alsoNew
      .filter((it) => vendorSection(it.vendor) === section)
      .map((it) => `[${policyTitleLabel(it.title)}](${it.link})`);
    const also = links.length ? `*${DATA_REPORT.alsoNew}* ${links.join(" · ")}` : "";
    const rows = items
      .filter((it) => vendorSection(it.vendor) === section)
      .map(
        (it) =>
          `| ${it.date || "—"} | ${cell(it.source)} | ` +
          `${it.deprecation ? `${DATA_REPORT.deprecationMarker} ` : ""}${it.aiInData ? `${DATA_REPORT.aiMarker} ` : ""}` +
          `[${policyTitleLabel(it.title)}](${cell(it.link)}) | ` +
          `${cell(summaryText(summaries, it))} |`,
      );
    const table = rows.length ? `${DATA_REPORT.vendorTableHeader}\n${rows.join("\n")}` : "";
    if (table || also) tables[section] = [table, also].filter(Boolean).join("\n\n");
  }
  return tables;
}

/**
 * A page's Spotted section (or Trends' Most discussed, under `heading`): each
 * story linked to its article, its discussion linked with its counts, and the
 * summary for its own number (else its description, truncated). Empty when
 * the page has no rows.
 */
export function renderSpottedTable(
  rows: StoryRow[],
  summaries: Map<number, string>,
  heading: string = SPOTTED.heading,
): string {
  if (!rows.length) return "";
  const lines = rows.map(
    (r) =>
      `| [${cell(r.title)}](${cell(r.url)}) | ${SPOTTED.sources[r.source]} | ` +
      `[${SPOTTED.counts(r.source, r.points, r.comments)}](${cell(r.discussionUrl)}) | ` +
      `${cell(summaryText(summaries, { n: r.n, description: r.description ?? "" }))} |`,
  );
  return `## ${heading}\n\n${SPOTTED.tableHeader}\n${lines.join("\n")}`;
}

/** Trends' Research section: each paper linked, its summary by its own number (else its abstract, truncated). */
export function renderResearchTable(
  papers: Numbered<ResearchPaper>[],
  summaries: Map<number, string>,
): string {
  if (!papers.length) return "";
  const T = TRENDS_REPORT;
  const lines = papers.map(
    (p) =>
      `| [${cell(p.title)}](${cell(p.url)}) | ${cell(summaryText(summaries, { n: p.n, description: p.abstract }))} |`,
  );
  return `## ${T.researchHeading}\n\n${T.researchTableHeader}\n${lines.join("\n")}`;
}

/**
 * The config.yml section a trending category would join, as promotion did
 * until October 2026: Other Agents (a job-search bot, a vulnerability scanner
 * on 2026-10-19) joins none.
 */
const CANDIDATE_SECTION: Partial<Record<Category, AgentSectionKey>> = {
  coding_agent: "agents",
  harness_framework: "infra",
  multi_agent: "infra",
  agent_tooling: "infra",
};

/**
 * Trends' Candidates to track: the 🔥 GitHub repos in no config.yml section
 * (`tracked`, compared case-insensitively), grouped by the section they would
 * join, each with its entry in config.yml's format. Empty when there are none.
 */
export function renderCandidates(
  candidates: { fullName: string; category: Category }[],
  tracked: RepoConfig[],
): string {
  const T = TRENDS_REPORT;
  const known = new Set(tracked.map((r) => r.repo.toLowerCase()));
  const groups = AGENT_SECTION_KEYS.map((key) => {
    const repos = [
      ...new Set(
        candidates
          .filter((c) => CANDIDATE_SECTION[c.category] === key && !known.has(c.fullName.toLowerCase()))
          .map((c) => c.fullName),
      ),
    ];
    if (!repos.length) return "";
    const entries = repos.map((repo) => {
      const name = repo.split("/")[1] ?? repo;
      return `    - id: ${name.toLowerCase()}\n      repo: ${repo}\n      name: ${name}`;
    });
    return `${T.candidatesSection(key)}\n\n\`\`\`yaml\n${entries.join("\n")}\n\`\`\``;
  }).filter(Boolean);
  if (!groups.length) return "";
  return `## ${T.candidatesHeading}\n\n${T.candidatesIntro}\n\n${groups.join("\n\n")}`;
}

/** The models page's Lab announcements rows, each summary by its own number (else the page text, truncated, or "—"). */
export function renderLabPostsTable(posts: Numbered<WebPageItem>[], summaries: Map<number, string>): string {
  const lines = posts.map(
    (p) =>
      `| ${p.lastmod.slice(0, 10) || "—"} | ${MODELS_PAGE.labs[p.site]} | [${policyTitleLabel(p.title || p.url)}](${cell(p.url)}) | ` +
      `${cell(summaryText(summaries, { n: p.n, description: p.content }))} |`,
  );
  return `${MODELS_PAGE.labTableHeader}\n${lines.join("\n")}`;
}

/** A context length as a table cell: 262144 → "262K", 1048576 → "1M". */
function contextCell(tokens: number): string {
  if (!tokens) return "—";
  return tokens >= 1e6 ? `${Number((tokens / 1e6).toFixed(1))}M` : `${Math.round(tokens / 1e3)}K`;
}

/** The models page's New on OpenRouter rows, each summary by its own number (else the description, truncated). */
export function renderNewModelsTable(
  models: Numbered<OpenRouterNewModel>[],
  summaries: Map<number, string>,
): string {
  const lines = models.map(
    (m) =>
      `| [${cell(m.name)}](https://openrouter.ai/${m.id}) \`${m.id}\` | ${m.created} | ${contextCell(m.contextLength)} | ` +
      `${cell(summaryText(summaries, m))} |`,
  );
  return `${MODELS_PAGE.modelsTableHeader}\n${lines.join("\n")}`;
}
