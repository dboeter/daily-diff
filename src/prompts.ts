/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease, GitHubDiscussion } from "./github.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoDigest {
  config: RepoConfig;
  issues: GitHubItem[];
  prs: GitHubItem[];
  releases: GitHubRelease[];
  discussions: GitHubDiscussion[];
  summary: string;
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

export function formatDiscussion(d: GitHubDiscussion): string {
  const body = (d.body ?? "").replace(/\n/g, " ").trim().slice(0, 300);
  const ellipsis = (d.body ?? "").length > 300 ? "..." : "";
  const t = { author: "Author", created: "Created", updated: "Updated", comments: "Comments", url: "URL" };
  const answered = d.answered ? " [ANSWERED]" : "";
  // Same URL-shortening as formatItem: keep "owner/repo" only, so the rendered
  // issue body never contains a full github.com link that triggers back-refs.
  const repoSlug = d.html_url.replace(/^https:\/\/github\.com\//, "").replace(/\/discussions\/\d+$/, "");
  return [
    `#${d.number} [${d.category}]${answered} ${d.title}`,
    `  ${t.author}: ${d.author} | ${t.created}: ${d.created_at.slice(0, 10)} | ${t.updated}: ${d.updated_at.slice(0, 10)} | ${t.comments}: ${d.comments} | 👍: ${d.upvotes}`,
    `  ${t.url}: ${repoSlug} Discussion #${d.number}`,
    `  ${"Summary"}: ${body}${ellipsis}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Sampling helpers (shared)
// ---------------------------------------------------------------------------

const CLI_ISSUE_LIMIT = 30;
const CLI_PR_LIMIT = 20;
// Higher than the issue/PR limits: for a repo with Issues/PRs disabled the
// discussion list is the entire report, not a supplement to them.
const CLI_DISCUSSION_LIMIT = 40;

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

/**
 * Sort discussions by engagement (comments + upvotes) desc, take top N.
 * Unlike issues, upvotes are the primary signal on a discussion board — many
 * high-value threads are feature requests with votes but no replies.
 */
export function topDiscussions(items: GitHubDiscussion[], n: number): GitHubDiscussion[] {
  return [...items].sort((a, b) => b.comments + b.upvotes - (a.comments + a.upvotes)).slice(0, n);
}

/** What the top-N sample was ranked by, so the note doesn't misstate the sort. */
export type SampleBy = "comments" | "engagement";

const SAMPLE_BY_TEXT: Record<SampleBy, string> = {
  comments: "comment count",
  engagement: "comments + upvotes",
};

export function sampleNote(total: number, sampled: number, by: SampleBy = "comments"): string {
  const criterion = SAMPLE_BY_TEXT[by];
  return total > sampled
    ? `(Total: ${total} items; showing top ${sampled} by ${criterion})`
    : `(Total: ${total} items)`;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export function buildCliPrompt(
  cfg: RepoConfig,
  issues: GitHubItem[],
  prs: GitHubItem[],
  releases: GitHubRelease[],
  discussions: GitHubDiscussion[],
  dateStr: string,
): string {
  const sampledIssues = topN(issues, CLI_ISSUE_LIMIT);
  const sampledPrs = topN(prs, CLI_PR_LIMIT);
  const sampledDiscussions = topDiscussions(discussions, CLI_DISCUSSION_LIMIT);

  const issuesText = sampledIssues.map((i) => formatItem(i)).join("\n") || "None";
  const prsText = sampledPrs.map((p) => formatItem(p)).join("\n") || "None";
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : "None";

  const issueNote = sampleNote(issues.length, sampledIssues.length);
  const prNote = sampleNote(prs.length, sampledPrs.length);

  // Repos without discussions enabled get no section at all, rather than an
  // empty one the model would feel obliged to comment on.
  const discussionsSection = sampledDiscussions.length
    ? `\n## Latest Discussions (updated in last 24h)${sampleNote(discussions.length, sampledDiscussions.length, "engagement")}\n` +
      sampledDiscussions.map((d) => formatDiscussion(d)).join("\n") +
      "\n"
    : "";

  return `You are a technical analyst focused on AI developer tools. Based on the following GitHub data, generate the ${cfg.name} community digest for ${dateStr}.

# Data source: github.com/${cfg.repo}

## Latest Releases (last 24h)
${releasesText}

## Latest Issues (updated in last 24h)${issueNote}
${issuesText}

## Latest Pull Requests (updated in last 24h)${prNote}
${prsText}
${discussionsSection}
---

Generate a structured English digest with the following sections:

1. **TL;DR** - Exactly 3 bullets, one sentence each: the most important things that happened today
2. **Releases** - If new versions exist, summarize changes; omit if none
3. **Hot Issues** - Pick up to 3 noteworthy Issues, explain why they matter and community reaction
4. **Key PR Progress** - Pick up to 3 important PRs, describe features or fixes
5. **Hot Discussions** - Pick up to 3 noteworthy Discussions, grouped by category (Ideas / Q&A / Show and tell). Omit this section entirely if no discussion data was provided
6. **Feature Request Trends** - Distill the most-requested feature directions from all Issues and Discussions
7. **Developer Pain Points** - Summarize recurring developer frustrations or high-frequency requests

Style: concise and professional, suited for technical developers. Include GitHub links for each item.
${REPO_LENGTH_RULE}
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
      const hasData = d.issues.length || d.prs.length || d.releases.length || d.discussions.length;
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

const PEER_ISSUE_LIMIT = 30;
const PEER_PR_LIMIT = 20;

export function buildPeerPrompt(
  cfg: RepoConfig,
  issues: GitHubItem[],
  prs: GitHubItem[],
  releases: GitHubRelease[],
  dateStr: string,
  issueLimit = PEER_ISSUE_LIMIT,
  prLimit = PEER_PR_LIMIT,
): string {
  const totalIssues = issues.length;
  const totalPrs = prs.length;

  const sampledIssues = topN(issues, issueLimit);
  const sampledPrs = topN(prs, prLimit);

  const noneStr = "None";
  const issuesText = sampledIssues.map((i) => formatItem(i)).join("\n") || noneStr;
  const prsText = sampledPrs.map((p) => formatItem(p)).join("\n") || noneStr;
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : noneStr;

  const openIssues = issues.filter((i) => i.state === "open").length;
  const closedIssues = issues.filter((i) => i.state === "closed").length;
  const openPrs = prs.filter((p) => p.state === "open").length;
  const mergedPrs = prs.filter((p) => p.state === "closed").length;

  const issueSampleNote = sampleNote(totalIssues, sampledIssues.length);
  const prSampleNote = sampleNote(totalPrs, sampledPrs.length);

  return `You are an analyst of AI agent and personal AI assistant open-source projects. Based on the following GitHub data from ${cfg.name} (github.com/${cfg.repo}), generate a project digest for ${dateStr}.

# Data Overview
- Issues updated in last 24h: ${totalIssues} (open/active: ${openIssues}, closed: ${closedIssues})
- PRs updated in last 24h: ${totalPrs} (open: ${openPrs}, merged/closed: ${mergedPrs})
- New releases: ${releases.length}

## Latest Releases
${releasesText}

## Latest Issues ${issueSampleNote}
${issuesText}

## Latest Pull Requests ${prSampleNote}
${prsText}

---

Generate a structured English ${cfg.name} project digest with the following sections:

1. **TL;DR** - Exactly 3 bullets, one sentence each: the most important things that happened today
2. **Today's Overview** - 2-3 sentences on project status, including activity assessment
3. **Releases** - If new versions exist, detail changes, breaking changes, migration notes; omit if none
4. **Project Progress** - Merged/closed PRs today, what features advanced or were fixed
5. **Community Hot Topics** - Most active Issues/PRs with most comments/reactions (with links), analyze underlying needs
6. **Bugs & Stability** - Bugs, crashes, regressions reported today, ranked by severity, note if fix PRs exist
7. **Feature Requests & Roadmap Signals** - User-requested features, predict which might be in next version
8. **User Feedback Summary** - Real user pain points, use cases, satisfaction/dissatisfaction
9. **Backlog Watch** - Long-unanswered important Issues or PRs needing maintainer attention

Style: objective, data-driven, highlighting project health. Include GitHub links for each item.
${REPO_LENGTH_RULE}
`;
}

export function buildPeersComparisonPrompt(
  openclawDigest: RepoDigest,
  peerDigests: RepoDigest[],
  dateStr: string,
): string {
  const noActivityStr = "No activity in the last 24 hours.";

  const openclawSection = `## OpenClaw (core reference, github.com/${openclawDigest.config.repo})\n${openclawDigest.summary}`;

  const peerSections = peerDigests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length || d.discussions.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  return `You are a senior analyst of the AI agent and personal AI assistant open-source ecosystem. The following are ${dateStr} community digest summaries for each project.

${openclawSection}

---

${peerSections}

---

Generate a cross-project comparison report in English with these sections:

1. **Ecosystem Overview** - 3-5 sentences on the overall personal AI assistant / agent open-source landscape
2. **Activity Comparison** - Table comparing Issues count, PR count, Release status, and health score for each project
3. **OpenClaw's Position** - Advantages vs peers, technical approach differences, community size comparison
4. **Shared Technical Focus Areas** - Requirements emerging across multiple projects (note which projects, specific needs)
5. **Differentiation Analysis** - Key differences in feature focus, target users, technical architecture
6. **Community Momentum & Maturity** - Activity tiers, which are rapidly iterating, which are stabilizing
7. **Trend Signals** - Industry trends extracted from community feedback, value for AI agent developers

Style: concise and professional, data-backed, suited for technical decision-makers and developers.
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

export function buildComparisonPrompt(digests: RepoDigest[], dateStr: string): string {
  const noActivityStr = "No activity in the last 24 hours.";

  const sections = digests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length || d.discussions.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  return `You are a senior technical analyst of the AI developer tools ecosystem. The following are ${dateStr} community digest summaries for each major AI CLI tool:

${sections}

---

Generate a cross-tool comparison report in English with these sections:

1. **Ecosystem Overview** - 3-5 sentences on the overall AI CLI tools development landscape
2. **Activity Comparison** - Table comparing Issues count, PR count, Discussions count and Release status for each tool today. Some repos have Issues/PRs disabled upstream and use Discussions as their only community channel — mark those as "N/A" rather than reporting them as inactive
3. **Shared Feature Directions** - Requirements appearing across multiple tool communities (note which tools, specific needs)
4. **Differentiation Analysis** - Differences in feature focus, target users, and technical approach
5. **Community Momentum & Maturity** - Which tools have more active communities, which are rapidly iterating
6. **Trend Signals** - Industry trends from community feedback, reference value for developers

Style: concise and professional, data-backed, suited for technical decision-makers and developers.
${COMPARISON_LENGTH_RULE}
`;
}
