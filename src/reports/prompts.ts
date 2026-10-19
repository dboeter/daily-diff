/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease } from "../core/github.ts";
import type { NewsItem } from "./agent-news.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One project's input to the agents report (its agents and infra sections, daily). */
export interface ProjectActivity {
  config: RepoConfig;
  /** Stable releases only, newest first. */
  releases: GitHubRelease[];
  /**
   * Newest prereleases in the window, only for a project that has never
   * shipped a stable release; the model reports the notable ones.
   */
  previews: GitHubRelease[];
  /** Nightlies, alphas, RCs not in `previews` — counted in the report header, never sent to the model. */
  prereleaseCount: number;
  hotIssues: GitHubItem[];
  news: NewsItem[];
  /** The release fetch failed: the project could not be checked, so it is neither active nor quiet. */
  fetchFailed?: boolean;
}

/** Wording that differs between the agents and infra sections. */
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

// Without explicit caps the model wrote 10–12 KB per project, pushing the old
// per-repo reports to 77–114 KB — past GitHub's 64 KB issue body limit.
const REPO_LENGTH_RULE =
  "Length: at most ~300 words in total. Use at most 3 bullets per section, one or two sentences each. " +
  "Omit any section that has nothing notable instead of writing filler.";

/** Every LLM-written report body starts at its first `##` section: code renders the title. */
export const NO_TITLE_RULE =
  "Do not write a title, a date line or any `#` heading: code adds the report title. " +
  "Use exactly the `##` headings given, in the given order.";

/** Sort by comment count desc, take top N. */
export function topN(items: GitHubItem[], n: number): GitHubItem[] {
  return [...items].sort((a, b) => b.comments - a.comments).slice(0, n);
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

/** A project with no stable release, previewed prerelease, hot issue or news item is left out of the prompt. */
export function hasActivity(a: ProjectActivity): boolean {
  return a.releases.length > 0 || a.previews.length > 0 || a.hotIssues.length > 0 || a.news.length > 0;
}

/** Newest stable releases shown per project; llama.cpp alone tags 35–70 a week. */
const RELEASES_PER_PROJECT = 10;
const RELEASE_BODY_CHARS = 400;
// A prerelease is reported only if its notes show notable features, so the
// model needs more of them. DeepSeek Harness notes run 4–19 KB, Chinese first
// behind "[English](#en-…)" anchor links and <h3> tags: at 400 characters the
// model saw the anchors and half a heading.
const PREVIEW_BODY_CHARS = 1500;

/**
 * Release notes on one line, without fenced code blocks, HTML tags and in-page
 * anchor links, cut at `maxChars`. Agent Deck's notes open with three install
 * blocks (Homebrew, curl, `go install`), so on 2026-10-19 the first 400
 * characters held no change and the report listed install commands.
 */
export function releaseNotes(body: string | null | undefined, maxChars: number): string {
  return (body ?? "")
    .replace(/(```|~~~)[\s\S]*?(\1|$)/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]\(#[^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars);
}

function formatRelease(r: GitHubRelease, repo: string, notes: string): string {
  return `- ${r.tag_name}${r.name && r.name !== r.tag_name ? ` (${r.name})` : ""} — https://github.com/${repo}/releases/tag/${r.tag_name}\n  ${notes || "(no release notes)"}`;
}

function formatProject(a: ProjectActivity): string {
  const { config: cfg } = a;
  const shown = a.releases.slice(0, RELEASES_PER_PROJECT);
  const releaseNote =
    a.releases.length > shown.length
      ? ` (${a.releases.length} stable releases; showing newest ${shown.length})`
      : "";
  const releases = shown.length
    ? shown.map((r) => formatRelease(r, cfg.repo, releaseNotes(r.body, RELEASE_BODY_CHARS))).join("\n")
    : "None";
  // Only for a project without a stable release, so every other project's
  // section reads as before.
  const previews = a.previews.length
    ? `\n\n### Prereleases (no stable release yet)\n` +
      a.previews.map((r) => formatRelease(r, cfg.repo, releaseNotes(r.body, PREVIEW_BODY_CHARS))).join("\n")
    : "";
  const issues = a.hotIssues.map((i) => formatItem(i)).join("\n") || "None";
  const news = a.news.map((n) => `- [${n.source}] ${n.title} — ${n.url} (${n.detail})`).join("\n") || "None";

  return `## ${cfg.name} (github.com/${cfg.repo})

### Stable releases${releaseNote}
${releases}${previews}

### Hot issues
${issues}

### News mentioning ${cfg.name}
${news}`;
}

/**
 * One prompt for every active project: stable releases (or, for a project without one yet,
 * its prereleases), hot issues and news.
 * Issue and PR churn is deliberately absent — it produced most of the filler
 * in the old per-repo reports ("X remains focused on…").
 */
export function buildProjectDigestPrompt(
  active: ProjectActivity[],
  scope: DigestScope,
  dateStr: string,
): string {
  const sections = active.map(formatProject).join("\n\n---\n\n");

  return `You are a technical editor covering ${scope.subject}. Below is the data for ${dateStr} (${scope.window}) for every project that had a stable release, a prerelease (projects without a stable release yet), a hot issue, or a news mention. Projects with nothing are already excluded.

${sections}

---

Write the report in English with exactly this structure:

## Overview
3–5 sentences on the most important changes across these projects ${scope.period}: what shipped, what broke, what got attention. Name projects. No counts of issues, PRs or stars.

Then one section per project above that has something left to report, in the order given, headed \`## <Project name>\`, with at most 3 bullets, one or two sentences each:
- **Release**: what the stable release(s) change for users — features, breaking changes, fixes that matter. Link the release. Several releases in a range: summarize the range, do not list each one.
- **Prerelease**: only from a "Prereleases (no stable release yet)" list, and only when it adds notable features or breaking changes; skip routine alpha/rc bumps. Say it is a prerelease and link it.
- **News**: what the news item says about the project and why it matters. Link it.
- **Hot issue**: what users are hitting and how serious it is. Link the issue (https://github.com/<repo>/issues/<number>).

Rules:
- Use only the data above. Omit a bullet type that has no data. Never state what did not happen, in the overview or a section ("no release today", "no breaking issues were reported").
- A news item may mention a project only in passing: skip it unless the project is its actual subject.
- If every item for a project is skipped, leave out its section entirely; the report lists it as quiet.
- Style: concise and concrete, for developers who use these tools.
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

Write the Skills section in English with these headings. ${NO_TITLE_RULE}

## Top Skills
The 3-5 most-discussed Skills (PRs) by comments/attention: each Skill's functionality, discussion highlights, and current status (open/merged/draft).

## Community Demand
From Issues, the most-anticipated new Skill directions (e.g. workflow automation, code review, test generation, documentation).

## Pending Skills
Active-comment PRs not yet merged; these Skills may land soon.

## Takeaway
One sentence: what is the community's most concentrated demand at the Skills level?

Style: concise and professional, include GitHub links for each item.
${REPO_LENGTH_RULE}
`;
}
