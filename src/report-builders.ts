/**
 * Report content builders — extracted from index.ts for testability.
 */

import { hasActivity, type ProjectActivity } from "./prompts.ts";
import { escapeRegex } from "./agent-news.ts";
import type { OpenRouterStealthModel } from "./openrouter.ts";
import type { TrendingReportData } from "./trending-rank.ts";
import { STEALTH_SECTION, TRENDING_REPORT } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Project digest (daily agents report, weekly infra report)
// ---------------------------------------------------------------------------

export interface ProjectReportInput {
  title: string;
  dateStr: string;
  utcStr: string;
  /** Every tracked project, active or not, in config order. */
  activities: ProjectActivity[];
  /** LLM output: overview plus one section per active project. */
  summary: string;
  /** Label for the quiet-projects line, e.g. "today". */
  period: string;
  /** Markdown rendered between the header and the summary, ending with its own separator. */
  preamble?: string;
  footer: string;
}

/**
 * Release-focused report. Quiet projects are listed in one line at the end
 * rather than each getting a "no activity" section. Small enough to post as
 * the GitHub issue body unchanged, so there is no brief variant.
 *
 * Quiet is decided by the summary, not only the data: the model leaves out a
 * project whose only news mentions it in passing, and such a project is quiet
 * too. A summary with no project section at all is a failure notice, so then
 * the data decides.
 */
export function buildProjectReportContent(r: ProjectReportInput): string {
  const releases = r.activities.reduce((n, a) => n + a.releases.length, 0);
  const prereleases = r.activities.reduce((n, a) => n + a.prereleaseCount, 0);
  const withData = r.activities.filter(hasActivity);
  // Line-anchored, so "## Pi pod" in a summary does not count as a Pi section.
  const covered = withData.filter((a) =>
    new RegExp(`^##\\s+${escapeRegex(a.config.name)}\\s*$`, "m").test(r.summary),
  );
  const active = covered.length > 0 ? covered : withData;
  const quiet = r.activities.filter((a) => !active.includes(a));
  const link = (a: ProjectActivity) => `[${a.config.name}](https://github.com/${a.config.repo})`;

  return (
    `# ${r.title} ${r.dateStr}\n\n` +
    `> Generated: ${r.utcStr} UTC | Projects: ${r.activities.length} | ` +
    `Active ${r.period}: ${r.activities.length - quiet.length} | ` +
    `Stable releases: ${releases} | Prereleases (not covered): ${prereleases}\n\n` +
    `---\n\n` +
    (r.preamble ?? "") +
    r.summary +
    (quiet.length ? `\n\n---\n\n**Quiet ${r.period}:** ${quiet.map(link).join(", ")}` : "") +
    r.footer
  );
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
// Trending tables (weekly)
// ---------------------------------------------------------------------------

/** Where the prose LLM call leaves room for the code-rendered tables. */
export const TRENDING_TABLES_MARKER = "<!-- tables -->";

/**
 * A row with no LLM summary shows its description instead, cut to about two
 * lines of a table cell so one long README blurb does not stretch the table.
 */
const DESCRIPTION_FALLBACK_CHARS = 160;

/**
 * Parse the summaries call's `N: text` lines. Tolerant of the list styles
 * models drift into (`3.`, `3)`, `- 3:`, `**3:**`); lines without a leading
 * number or with no text are ignored, and the first line for a number wins.
 */
export function parseRowSummaries(text: string): Map<number, string> {
  const summaries = new Map<number, string>();
  for (const line of text.split("\n")) {
    // `.` must not be followed by a digit, so "3.5x growth" is not row 3.
    const m = line.match(/^\s*(?:[-*+]\s+)?\**\s*(\d+)\s*\**\s*(?::|\)|\.(?!\d))\s*\**\s*(.*?)\s*$/);
    if (!m || !m[2]) continue;
    const n = Number(m[1]);
    if (!summaries.has(n)) summaries.set(n, m[2]);
  }
  return summaries;
}

/** Table cell text: one line, pipes escaped. */
const cell = (s: string) => s.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();

function descriptionFallback(description: string): string {
  const d = description.replace(/\s+/g, " ").trim();
  if (!d) return "—";
  if (d.length <= DESCRIPTION_FALLBACK_CHARS) return d;
  const cut = d.slice(0, DESCRIPTION_FALLBACK_CHARS);
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** The Radar and category tables; "" when both are empty. */
export function renderTrendingTables(report: TrendingReportData, summaries: Map<number, string>): string {
  const T = TRENDING_REPORT;
  const summary = (n: number, description: string) =>
    cell(summaries.get(n) ?? descriptionFallback(description));
  const link = (name: string, url: string) => (url ? `[${cell(name)}](${cell(url)})` : cell(name));
  const blocks: string[] = [];

  if (report.radar.length > 0) {
    const rows = report.radar.map(
      (r) =>
        `| ${link(r.name, r.url)} | ${cell(r.sources.join("; "))} | ${cell(r.signals.join("; "))} | ` +
        `${summary(r.n, r.description)} |`,
    );
    blocks.push(`## ${T.radarHeading}`, `${T.radarHeader}\n${rows.join("\n")}`);
  }

  if (report.categories.length > 0) {
    blocks.push(`## ${T.categoriesHeading}`);
    for (const { category, rows } of report.categories) {
      const lines = rows.map(
        (r) =>
          `| ${link(r.fullName, r.url)} | ${cell(r.language)} | ${cell(r.starsCell)} | ` +
          `${summary(r.n, r.description)} |`,
      );
      blocks.push(`### ${T.categoryTitles[category]}`, `${T.categoryHeader}\n${lines.join("\n")}`);
    }
  }

  return blocks.join("\n\n");
}

/** Put the tables where the prose left the marker; after the prose when the model dropped it. */
export function spliceTrendingProse(prose: string, tables: string): string {
  const lines = prose.split("\n");
  const i = lines.findIndex((l) => l.trim() === TRENDING_TABLES_MARKER);
  if (i === -1) return tables ? `${prose.trimEnd()}\n\n${tables}` : prose;
  const before = lines.slice(0, i).join("\n").trimEnd();
  const after = lines
    .slice(i + 1)
    .join("\n")
    .trimStart();
  return [before, tables, after].filter(Boolean).join("\n\n");
}
