/**
 * Report content builders — extracted from index.ts for testability.
 */

import type { ProjectActivity } from "./prompts.ts";

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
    r.summary +
    (quiet.length ? `\n\n---\n\n**Quiet ${r.period}:** ${quiet.map(link).join(", ")}` : "") +
    r.footer
  );
}
