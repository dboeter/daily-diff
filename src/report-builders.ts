/**
 * Report content builders — extracted from index.ts for testability.
 */

import { hasActivity, type ProjectActivity } from "./prompts.ts";
import { escapeRegex } from "./agent-news.ts";
import type { OpenRouterStealthModel } from "./openrouter.ts";
import type { TrendingReportData } from "./trending-rank.ts";
import type { PolicyItem } from "./policy.ts";
import type { KeptVendorItem } from "./data-jev.ts";
import { VENDOR_SECTIONS, vendorSection, type VendorSection } from "./config.ts";
import { summaryText, type Numbered } from "./summarized-table.ts";
import {
  LIVE_REPORT_IDS,
  OVERVIEW,
  REPORTS,
  REPORT_META,
  STEALTH_SECTION,
  TRENDING_REPORT,
  POLICY_REPORT,
  DATA_REPORT,
  type ReportId,
} from "./i18n.ts";

// ---------------------------------------------------------------------------
// Project digest (the agents report's agents and infra sections, the data report's repo sections)
// ---------------------------------------------------------------------------

/** One config section's projects, under its own heading. */
export interface ProjectGroup {
  /** The section's `title` in config.yml, rendered as its `##` heading. */
  title: string;
  /** Every tracked project, active or not, in config order. */
  activities: ProjectActivity[];
  /** LLM output: overview plus one `## <Project>` section per active project. */
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
  /**
   * Leave out a group with no active project (the data report). The agents
   * report shows it with its notice and quiet line. Either way the header counts it.
   */
  omitQuietGroups?: boolean;
  /** Markdown after the last group, before the footer (the data report's Worth a Look), with its own separator. */
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
  return g.activities.filter((a) => !active.includes(a));
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
  let quietCount = 0;
  const sections = r.groups.flatMap((g) => {
    const quiet = quietProjects(g);
    quietCount += quiet.length;
    // With omitQuietGroups, a group's projects are left out when all are quiet; its preamble still shows.
    const showProjects = !(r.omitQuietGroups && quiet.length === g.activities.length);
    if (!showProjects && !g.preamble) return [];
    const projects = showProjects
      ? nestHeadings(g.summary, 3) +
        (quiet.length ? `\n\n**Quiet ${r.period}:** ${quiet.map(link).join(", ")}` : "")
      : "";
    return `## ${g.title}\n\n` + [g.preamble, projects].filter(Boolean).join("\n\n");
  });

  return (
    `${r.heading}\n\n` +
    `> ${REPORT_META.generated(r.utcStr)} | Projects: ${all.length} | ` +
    `Active ${r.period}: ${all.length - quietCount} | ` +
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
// Stealth models (daily, top of the agents report)
// ---------------------------------------------------------------------------

/** A stealth model listed within this many days is flagged new (2 days covers a delayed cron). */
const STEALTH_NEW_DAYS = 2;
/** A stealth model expiring within this many days is flagged — they vanish without further notice. */
const STEALTH_EXPIRING_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

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
      if (today - Date.parse(m.created) < STEALTH_NEW_DAYS * DAY_MS) status.push(S.isNew);
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

/** The Radar and category tables; "" when both are empty. */
export function renderTrendingTables(report: TrendingReportData, summaries: Map<number, string>): string {
  const T = TRENDING_REPORT;
  const summary = (row: { n: number; description: string }) => cell(summaryText(summaries, row));
  const link = (name: string, url: string) => (url ? `[${cell(name)}](${cell(url)})` : cell(name));
  const blocks: string[] = [];

  if (report.radar.length > 0) {
    const rows = report.radar.map(
      (r) =>
        `| ${link(r.name, r.url)} | ${cell(r.sources.join("; "))} | ${cell(r.signals.join("; "))} | ` +
        `${summary(r)} |`,
    );
    blocks.push(`## ${T.radarHeading}`, `${T.radarHeader}\n${rows.join("\n")}`);
  }

  if (report.categories.length > 0) {
    blocks.push(`## ${T.categoriesHeading}`);
    for (const { category, rows } of report.categories) {
      const lines = rows.map(
        (r) => `| ${link(r.fullName, r.url)} | ${cell(r.language)} | ${cell(r.starsCell)} | ${summary(r)} |`,
      );
      blocks.push(`### ${T.categoryTitles[category]}`, `${T.categoryHeader}\n${lines.join("\n")}`);
    }
  }

  return blocks.join("\n\n");
}

/**
 * The policy report's tables, one `##` section per jurisdiction with items, in
 * POLICY_REPORT.headings order, then News & commentary (news-feed items). Each
 * row shows the summary for its own number (`n`, set by fetchPolicyData).
 * Date, source, title and stage come from the data, never the model.
 */
export function renderPolicyTable(
  items: Numbered<PolicyItem>[],
  summaries: Map<number, string>,
  /** The rendered Upcoming deadlines section, which goes between the jurisdictions and the news. */
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
  sections.push(deadlines);
  const newsRows = items
    .filter((it) => it.news)
    .map((it) => `${lead(it)}${cell(summaryText(summaries, it))} |`);
  if (newsRows.length) {
    sections.push(
      `## ${POLICY_REPORT.newsHeading}\n\n${POLICY_REPORT.newsTableHeader}\n${newsRows.join("\n")}`,
    );
  }
  return sections.filter(Boolean).join("\n\n");
}

/**
 * The data report's vendor tables, one per vendor section with items. Each row
 * shows the summary for its own number (`n`, set by selectVendorItems).
 * Date, source, title and the deprecation marker come from the data, never the model.
 */
export function renderVendorTables(
  items: Numbered<KeptVendorItem>[],
  summaries: Map<number, string>,
): Partial<Record<VendorSection, string>> {
  const tables: Partial<Record<VendorSection, string>> = {};
  for (const section of VENDOR_SECTIONS) {
    const rows = items
      .filter((it) => vendorSection(it.vendor) === section)
      .map(
        (it) =>
          `| ${it.date || "—"} | ${cell(it.source)} | ` +
          `${it.deprecation ? `${DATA_REPORT.deprecationMarker} ` : ""}[${policyTitleLabel(it.title)}](${cell(it.link)}) | ` +
          `${cell(summaryText(summaries, it))} |`,
      );
    if (rows.length) tables[section] = `${DATA_REPORT.vendorTableHeader}\n${rows.join("\n")}`;
  }
  return tables;
}
