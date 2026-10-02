/**
 * Report content builders — extracted from index.ts for testability.
 */

import type { RepoConfig, RepoFetch } from "./github.ts";
import type { RepoDigest } from "./prompts.ts";
import { CLI_REPORT, OPENCLAW_REPORT, INFRA_REPORT } from "./i18n.ts";

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
    toolSections +
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
    projectSections +
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
    openclawSummary +
    `\n\n---\n\n` +
    `## ${OPENCLAW_REPORT.comparison}\n\n` +
    peersComparison +
    `\n\n---\n\n` +
    `## ${OPENCLAW_REPORT.peers}\n\n` +
    peerDetailSections +
    footer
  );
}
