/**
 * Report content builders — extracted from index.ts for testability.
 */

import type { ProjectActivity } from "./prompts.ts";
import type { OpenRouterStealthModel } from "./openrouter.ts";
import { STEALTH_SECTION } from "./i18n.ts";

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
 */
export function buildProjectReportContent(r: ProjectReportInput): string {
  const releases = r.activities.reduce((n, a) => n + a.releases.length, 0);
  const prereleases = r.activities.reduce((n, a) => n + a.prereleaseCount, 0);
  const quiet = r.activities.filter(
    (a) => a.releases.length === 0 && a.hotIssues.length === 0 && a.news.length === 0,
  );
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
