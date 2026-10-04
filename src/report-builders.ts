/**
 * Report content builders — extracted from index.ts for testability.
 */

import type { ProjectActivity, RepoDigest } from "./prompts.ts";
import { INFRA_REPORT } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Brief (GitHub issue) variant
// ---------------------------------------------------------------------------
// When a builder gets `fullReportUrl`, it renders the brief variant used for
// GitHub issues: the comparison plus each project's TL;DR bullets, with a link
// to the committed full report. The full variant is what lands on disk and the
// web UI.

/**
 * The bullets of a summary's "TL;DR" section (see the per-repo prompts), capped
 * at `max`. Falls back to the first bullets anywhere, then to the first line —
 * which covers the fixed "no activity" / "summary failed" notices.
 */
export function extractTldr(summary: string, max = 3): string {
  const lines = summary.split("\n");
  const start = lines.findIndex((l) => /TL;?DR/i.test(l));
  const scope = start >= 0 ? lines.slice(start + 1) : lines;
  const bullets: string[] = [];
  for (const line of scope) {
    const t = line.trim();
    if (start >= 0 && /^#{1,6}\s/.test(t)) break;
    const m = /^(?:[-*]|\d+\.)\s+(.*)$/.exec(t);
    if (m) bullets.push(`- ${m[1]}`);
    if (bullets.length >= max) break;
  }
  if (bullets.length) return bullets.join("\n");
  if (start >= 0) return extractTldr(lines.slice(start + 1).join("\n"), max);
  return lines.find((l) => l.trim() && !l.trim().startsWith("#"))?.trim() ?? "";
}

function briefSections(digests: RepoDigest[]): string {
  return digests
    .map((d) => `**[${d.config.name}](https://github.com/${d.config.repo})**\n\n${extractTldr(d.summary)}`)
    .join("\n\n");
}

function fullReportLink(url: string): string {
  return `> 📄 Per-project details: [full report](${url})\n\n`;
}

// ---------------------------------------------------------------------------
// Project digest (agents report)
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

// ---------------------------------------------------------------------------
// Infra Report
// ---------------------------------------------------------------------------

export function buildInfraReportContent(
  infraDigests: RepoDigest[],
  comparison: string,
  utcStr: string,
  dateStr: string,
  footer: string,
  fullReportUrl?: string,
): string {
  const repoLinks = infraDigests
    .map((d) => `- [${d.config.name}](https://github.com/${d.config.repo})`)
    .join("\n");

  const projectSections = infraDigests
    .map((d) =>
      [
        `<details>`,
        `<summary><strong>${d.config.name}</strong> — <a href="https://github.com/${d.config.repo}">${d.config.repo}</a></summary>`,
        ``,
        d.summary,
        ``,
        `</details>`,
      ].join("\n"),
    )
    .join("\n\n");

  return (
    `# ${INFRA_REPORT.title} ${dateStr}\n\n` +
    INFRA_REPORT.meta(utcStr, infraDigests.length) +
    `${repoLinks}\n\n` +
    `---\n\n` +
    `## ${INFRA_REPORT.comparison}\n\n` +
    comparison +
    `\n\n---\n\n` +
    `## ${INFRA_REPORT.detail}\n\n` +
    (fullReportUrl ? fullReportLink(fullReportUrl) + briefSections(infraDigests) : projectSections) +
    footer
  );
}
