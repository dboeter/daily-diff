/**
 * Report content builders — extracted from index.ts for testability.
 */

import type { RepoConfig, RepoFetch } from "./github.ts";
import type { RepoDigest } from "./prompts.ts";
import { CLI_REPORT, OPENCLAW_REPORT, INFRA_REPORT } from "./i18n.ts";

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
// CLI Report
// ---------------------------------------------------------------------------

export function buildCliReportContent(
  cliDigests: RepoDigest[],
  skillsSummary: string,
  comparison: string,
  utcStr: string,
  dateStr: string,
  footer: string,
  skillsRepo: string,
  fullReportUrl?: string,
): string {
  const repoLinks =
    cliDigests.map((d) => `- [${d.config.name}](https://github.com/${d.config.repo})`).join("\n") +
    `\n- [Claude Code Skills](https://github.com/${skillsRepo})`;

  const title = `# ${CLI_REPORT.title} ${dateStr}\n\n`;
  const meta = CLI_REPORT.meta(utcStr, cliDigests.length);

  const skillsSection =
    `## ${CLI_REPORT.skillsHeading}\n\n` +
    `> ${CLI_REPORT.skillsSource}: [anthropics/skills](https://github.com/${skillsRepo})\n\n` +
    `${skillsSummary}\n\n---\n\n`;

  const toolSections = cliDigests
    .map((d) => {
      const skills = d.config.id === "claude-code" ? skillsSection : "";
      return [
        `<details>`,
        `<summary><strong>${d.config.name}</strong> — <a href="https://github.com/${d.config.repo}">${d.config.repo}</a></summary>`,
        ``,
        skills + d.summary,
        ``,
        `</details>`,
      ].join("\n");
    })
    .join("\n\n");

  return (
    title +
    meta +
    `${repoLinks}\n\n` +
    `---\n\n` +
    `## ${CLI_REPORT.comparison}\n\n` +
    comparison +
    `\n\n---\n\n` +
    `## ${CLI_REPORT.detail}\n\n` +
    (fullReportUrl ? fullReportLink(fullReportUrl) + briefSections(cliDigests) : toolSections) +
    footer
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

// ---------------------------------------------------------------------------
// OpenClaw Report
// ---------------------------------------------------------------------------

export function buildOpenclawReportContent(
  fetchedOpenclaw: RepoFetch,
  peerDigests: RepoDigest[],
  openclawSummary: string,
  peersComparison: string,
  utcStr: string,
  dateStr: string,
  footer: string,
  openclaw: RepoConfig,
  openclawPeers: RepoConfig[],
  fullReportUrl?: string,
): string {
  const { issues, prs } = fetchedOpenclaw;

  const peersRepoLinks =
    `- [OpenClaw](https://github.com/${openclaw.repo})\n` +
    openclawPeers.map((p) => `- [${p.name}](https://github.com/${p.repo})`).join("\n");

  const peerDetailSections = peerDigests
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

  const title = `# ${OPENCLAW_REPORT.title} ${dateStr}\n\n`;
  const meta = `> Issues: ${issues.length} | PRs: ${prs.length} | Projects covered: ${1 + openclawPeers.length} | Generated: ${utcStr} UTC\n\n`;

  return (
    title +
    meta +
    `${peersRepoLinks}\n\n` +
    `---\n\n` +
    `## ${OPENCLAW_REPORT.deepDive}\n\n` +
    (fullReportUrl ? fullReportLink(fullReportUrl) + extractTldr(openclawSummary) : openclawSummary) +
    `\n\n---\n\n` +
    `## ${OPENCLAW_REPORT.comparison}\n\n` +
    peersComparison +
    `\n\n---\n\n` +
    `## ${OPENCLAW_REPORT.peers}\n\n` +
    (fullReportUrl ? briefSections(peerDigests) : peerDetailSections) +
    footer
  );
}
