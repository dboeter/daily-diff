/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease } from "./github.ts";
import type { NewsItem } from "./agent-news.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoDigest {
  config: RepoConfig;
  issues: GitHubItem[];
  prs: GitHubItem[];
  releases: GitHubRelease[];
  summary: string;
}

/** One project's input to the release-focused digest (agents daily, infra weekly). */
export interface ProjectActivity {
  config: RepoConfig;
  /** Stable releases only, newest first. */
  releases: GitHubRelease[];
  /** Nightlies, alphas, RCs — counted in the report header, never sent to the model. */
  prereleaseCount: number;
  hotIssues: GitHubItem[];
  news: NewsItem[];
}

/** Wording that differs between the daily agents and weekly infra digests. */
export interface DigestScope {
  /** What the projects are, e.g. "AI coding agents and personal AI assistants". */
  subject: string;
  /** Data window as shown to the model, e.g. "last 24h". */
  window: string;
  /** "today" or "this week". */
  period: string;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatItem(item: GitHubItem): string {
  const labels = item.labels.map((l) => l.name).join(", ");
  const labelStr = labels ? ` [${labels}]` : "";
  const body = (item.body ?? "").replace(/\n/g, " ").trim().slice(0, 300);
  const ellipsis = (item.body ?? "").length > 300 ? "..." : "";
  const t = {
    author: "Author",
    created: "Created",
    updated: "Updated",
    comments: "Comments",
    url: "URL",
    summary: "Summary",
  };
  // Extract "owner/repo" from html_url to avoid full GitHub URLs that trigger cross-references
  const repoSlug = item.html_url.replace(/^https:\/\/github\.com\//, "").replace(/\/(issues|pull)\/\d+$/, "");
  const itemKind = item.html_url.includes("/pull/") ? "PR" : "Issue";
  const refStr = `${repoSlug} ${itemKind} #${item.number}`;
  return [
    `#${item.number} [${item.state.toUpperCase()}]${labelStr} ${item.title}`,
    `  ${t.author}: ${item.user.login} | ${t.created}: ${item.created_at.slice(0, 10)} | ${t.updated}: ${item.updated_at.slice(0, 10)} | ${t.comments}: ${item.comments} | 👍: ${item.reactions?.["+1"] ?? 0}`,
    `  ${t.url}: ${refStr}`,
    `  ${t.summary}: ${body}${ellipsis}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Sampling helpers (shared)
// ---------------------------------------------------------------------------

// Without explicit caps the model wrote 10–12 KB per project, pushing the CLI,
// agents and infra reports to 77–114 KB — past GitHub's 64 KB issue body limit.
// The per-repo "TL;DR" section is also what extractTldr() lifts into the issue.
const REPO_LENGTH_RULE =
  "Length: at most ~300 words in total. Use at most 3 bullets per section, one or two sentences each. " +
  "Omit any section that has nothing notable today instead of writing filler.";
const COMPARISON_LENGTH_RULE =
  "Length: at most ~450 words in total. Keep the comparison table; every other section gets at most 3 short bullets or 2 sentences.";

/** Sort by comment count desc, take top N. */
export function topN(items: GitHubItem[], n: number): GitHubItem[] {
  return [...items].sort((a, b) => b.comments - a.comments).slice(0, n);
}

export function sampleNote(total: number, sampled: number): string {
  return total > sampled
    ? `(Total: ${total} items; showing top ${sampled} by comment count)`
    : `(Total: ${total} items)`;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

/** A project with no stable release, hot issue or news item is left out of the prompt. */
export function hasActivity(a: ProjectActivity): boolean {
  return a.releases.length > 0 || a.hotIssues.length > 0 || a.news.length > 0;
}

/** Newest stable releases shown per project; llama.cpp alone tags 35–70 a week. */
const RELEASES_PER_PROJECT = 10;
const RELEASE_BODY_CHARS = 400;

function formatProject(a: ProjectActivity): string {
  const { config: cfg } = a;
  const shown = a.releases.slice(0, RELEASES_PER_PROJECT);
  const releaseNote =
    a.releases.length > shown.length
      ? ` (${a.releases.length} stable releases; showing newest ${shown.length})`
      : "";
  const releases = shown.length
    ? shown
        .map((r) => {
          const body = (r.body ?? "").replace(/\s+/g, " ").trim().slice(0, RELEASE_BODY_CHARS);
          return `- ${r.tag_name}${r.name && r.name !== r.tag_name ? ` (${r.name})` : ""} — https://github.com/${cfg.repo}/releases/tag/${r.tag_name}\n  ${body || "(no release notes)"}`;
        })
        .join("\n")
    : "None";
  const issues = a.hotIssues.map((i) => formatItem(i)).join("\n") || "None";
  const news = a.news.map((n) => `- [${n.source}] ${n.title} — ${n.url} (${n.detail})`).join("\n") || "None";

  return `## ${cfg.name} (github.com/${cfg.repo})

### Stable releases${releaseNote}
${releases}

### Hot issues
${issues}

### News mentioning ${cfg.name}
${news}`;
}

/**
 * One prompt for every active project: stable releases, hot issues and news.
 * Issue and PR churn is deliberately absent — it produced most of the filler
 * in the old per-repo reports ("X remains focused on…").
 */
export function buildProjectDigestPrompt(
  active: ProjectActivity[],
  scope: DigestScope,
  dateStr: string,
): string {
  const sections = active.map(formatProject).join("\n\n---\n\n");

  return `You are a technical editor covering ${scope.subject}. Below is the data for ${dateStr} (${scope.window}) for every project that had a stable release, a hot issue, or a news mention. Projects with nothing are already excluded.

${sections}

---

Write the report in English with exactly this structure:

## Overview
3–5 sentences on the most important changes across these projects ${scope.period}: what shipped, what broke, what got attention. Name projects. No counts of issues, PRs or stars.

Then one section per project above, in the order given, headed \`## <Project name>\`, with at most 3 bullets, one or two sentences each:
- **Release**: what the stable release(s) change for users — features, breaking changes, fixes that matter. Link the release. Several releases in a range: summarize the range, do not list each one.
- **News**: what the news item says about the project and why it matters. Link it.
- **Hot issue**: what users are hitting and how serious it is. Link the issue (https://github.com/<repo>/issues/<number>).

Rules:
- Use only the data above. Omit a bullet type that has no data; never write "no release today" or similar.
- A news item may mention a project only in passing: skip it unless the project is its actual subject.
- Style: concise and concrete, for developers who use these tools.
`;
}

const INFRA_ISSUE_LIMIT = 30;
const INFRA_PR_LIMIT = 20;

export function buildInfraPrompt(
  cfg: RepoConfig,
  issues: GitHubItem[],
  prs: GitHubItem[],
  releases: GitHubRelease[],
  dateStr: string,
): string {
  const sampledIssues = topN(issues, INFRA_ISSUE_LIMIT);
  const sampledPrs = topN(prs, INFRA_PR_LIMIT);

  const noneStr = "None";
  const issuesText = sampledIssues.map((i) => formatItem(i)).join("\n") || noneStr;
  const prsText = sampledPrs.map((p) => formatItem(p)).join("\n") || noneStr;
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : noneStr;

  const issueNote = sampleNote(issues.length, sampledIssues.length);
  const prNote = sampleNote(prs.length, sampledPrs.length);

  return `You are a technical analyst focused on AI infrastructure — inference engines, model serving, LLM gateways and fine-tuning frameworks. Based on the following GitHub data, generate the ${cfg.name} digest for ${dateStr}.

# Data source: github.com/${cfg.repo}

## Latest Releases (last 24h)
${releasesText}

## Latest Issues (updated in last 24h)${issueNote}
${issuesText}

## Latest Pull Requests (updated in last 24h)${prNote}
${prsText}

---

Generate a structured English digest with the following sections:

1. **TL;DR** - Exactly 3 bullets, one sentence each: the most important things that happened today
2. **Releases & Breaking Changes** - New versions, API/config changes, migration notes; omit if none
3. **New Model & Hardware Support** - Newly supported models, architectures, backends (CUDA/ROCm/Metal/CPU), quantization formats
4. **Performance & Optimization** - Throughput, latency, memory and kernel work landed or in progress, with concrete numbers when available
5. **Stability & Regressions** - Crashes, correctness bugs, regressions reported today, ranked by severity, note if fix PRs exist
6. **What This Means for Application Developers** - Practical takeaways for people building agents/apps on top of this project

Style: concise and professional, suited for infrastructure engineers. Include GitHub links for each item.
${REPO_LENGTH_RULE}
`;
}

export function buildInfraComparisonPrompt(digests: RepoDigest[], dateStr: string): string {
  const noActivityStr = "No activity in the last 24 hours.";

  const sections = digests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  return `You are a senior analyst of the AI infrastructure ecosystem — inference engines, model serving, LLM gateways and fine-tuning frameworks. The following are ${dateStr} digest summaries for each project:

${sections}

---

Generate a cross-project comparison report in English with these sections:

1. **Ecosystem Overview** - 3-5 sentences on the overall AI infrastructure landscape today
2. **Activity Comparison** - Table comparing Issues count, PR count and Release status for each project
3. **Model Support Race** - Which projects shipped support for which new models/architectures, and who is ahead
4. **Performance Frontier** - Where the optimization effort is concentrated (KV cache, batching, quantization, distributed serving, kernels)
5. **Layer Positioning** - How these projects differ by layer: serving engine vs local runtime vs gateway vs training/fine-tuning
6. **Trend Signals** - Industry trends extracted from today's activity, and what agent/application developers should watch

Style: concise and professional, data-backed, suited for infrastructure engineers and technical decision-makers.
${COMPARISON_LENGTH_RULE}
`;
}

export function buildSkillsPrompt(prs: GitHubItem[], issues: GitHubItem[], dateStr: string): string {
  const topPrs = topN(prs, 20);
  const topIssues = topN(issues, 15);

  const noneStr = "None";
  const prsText = topPrs.map((p) => formatItem(p)).join("\n") || noneStr;
  const issuesText = topIssues.map((i) => formatItem(i)).join("\n") || noneStr;

  return `You are a technical analyst focused on the Claude Code ecosystem. The following data is from github.com/anthropics/skills (official Claude Code Skills repository). Analyze the community's most-watched Skills activity (data as of ${dateStr}).

## Repository Context
anthropics/skills is the official Claude Code Skills collection. Each PR typically represents a new or improved Skill. The community proposes new Skills and reports issues via Issues; PRs represent actual Skill submissions.

## Popular Pull Requests (sorted by comments, ${prs.length} total, showing top ${topPrs.length})
${prsText}

## Community Issues (sorted by comments, ${issues.length} total, showing top ${topIssues.length})
${issuesText}

---

Generate a Claude Code Skills community highlights report in English with these sections:

1. **Top Skills Ranking** - List the 3-5 most-discussed Skills (PRs) by comments/attention, describe each Skill's functionality, discussion highlights, and current status (open/merged/draft)
2. **Community Demand Trends** - From Issues, distill the most-anticipated new Skill directions (e.g. workflow automation, code review, test generation, documentation)
3. **High-Potential Pending Skills** - Active-comment PRs not yet merged; these Skills may land soon
4. **Skills Ecosystem Insight** - One-sentence summary: what is the community's most concentrated demand at the Skills level?

Style: concise and professional, include GitHub links for each item.
${REPO_LENGTH_RULE}
`;
}
