/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease } from "../core/github.ts";
import type { NewsItem } from "./project-news.ts";
import { GOING_AWAY, SECTIONS } from "../core/strings.ts";

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
  /** The data report only: stable releases of the last 7 days, newest first, for Releases this week. */
  weekReleases?: GitHubRelease[];
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

/**
 * Asks for the gutter sign (GOING_AWAY) on each bullet or highlight about something going away.
 * The bullet form spells out the marker: told only to "start a bullet with −", a model wrote − as
 * the marker on every bullet (models page, 2026-10-24).
 */
export const goingAwayRule = (item: "bullet" | "highlight") =>
  (item === "bullet"
    ? `Write every bullet as "- text". When its item is going away (a deprecation, retirement, removal, ` +
      `end of support or shutdown), put "${GOING_AWAY} " (the minus sign) after the marker: "- ${GOING_AWAY} text".`
    : `Start a highlight with "${GOING_AWAY} " (the minus sign) when its item is going away: a deprecation, ` +
      `retirement, removal, end of support or shutdown.`) +
  ` Going away means a feature, model, API or product that is removed or gets an end date; a bug fix, ` +
  `a breaking change or a call that now raises an error is not going away. Give every other ${item} no sign.`;

/**
 * What a Highlights, Signals or highlights.json claim may say beyond its source: nothing. On
 * 2026-10-26 the models wrote "GA" for two Snowflake notes that said no such thing, added "audit
 * your invocations immediately", stated a vendor's design target as achieved throughput, dropped
 * the limits of a 200-case self-published study and built a trend from three paper titles.
 */
export const SOURCE_FIDELITY_RULES = [
  "Release-stage words (GA, generally available, preview, beta, deprecated) only when the item's own row or text uses them.",
  "No call to action, audience or conclusion the source does not state: never add advice such as 'audit now' or 'upgrade immediately'.",
  "A vendor's or a self-published figure is that source's claim: attribute it ('X says', 'according to X'), and never state a target or estimate as achieved. An open issue is a report ('users report'), not an established fact.",
  "A study result keeps its scope when the source gives it: sample size, a single run, not peer reviewed.",
  "A trend or causal claim needs the rows' summaries to support it: never infer a trend from titles alone.",
];

/** SOURCE_FIDELITY_RULES as prompt rule lines. */
export const sourceFidelityRules = (): string => SOURCE_FIDELITY_RULES.map((r) => `- ${r}`).join("\n");

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
/** A stable release's notes as the model sees them (the agents and data reports). */
export const RELEASE_BODY_CHARS = 400;
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
  return compactChangelog(body ?? "")
    .replace(/(```|~~~)[\s\S]*?(\1|$)/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]\(#[^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars);
}

// GitHub's generated notes: "* <PR title> by @user in https://github.com/…/pull/N".
const CHANGELOG_ENTRY_RE = /^[ \t]*[*-][ \t]+(.+?) by @\S+ in https:\/\/github\.com\/\S+\/pull\/\d+[ \t]*$/gm;
const NEW_CONTRIBUTOR_RE = /^[ \t]*[*-][ \t]+@\S+ made their first contribution in \S+[ \t]*$/gm;

/**
 * A generated changelog as PR titles only, with its count. At 400 characters
 * DuckDB 2.0.0's notes held one intro line and two PR entries, each with its
 * author and URL, and the report described a major release by two refactors.
 */
function compactChangelog(body: string): string {
  const entries = body.match(CHANGELOG_ENTRY_RE)?.length ?? 0;
  if (!entries) return body;
  const header = /^#+[ \t]*What['’]s Changed[ \t]*$/im;
  const counted = `What's Changed (${entries} merged PRs):`;
  const first = body.search(CHANGELOG_ENTRY_RE);
  const withCount = header.test(body)
    ? body.replace(header, counted)
    : `${body.slice(0, first)}${counted}\n${body.slice(first)}`;
  return withCount
    .replace(CHANGELOG_ENTRY_RE, "$1;")
    .replace(NEW_CONTRIBUTOR_RE, "")
    .replace(/^#+[ \t]*New Contributors[ \t]*$/im, "")
    .replace(/\*\*Full Changelog\*\*:?\s*\S+/g, "");
}

/** Only a version x.0.0 is a major version (the data prompts' rule). */
export function isMajorRelease(tag: string): boolean {
  return /^v?\d+\.0\.0$/.test(tag);
}

/** Hosts whose pages are never a release announcement: their description is a badge, an invite or a package page. */
const NOT_ANNOUNCEMENT_HOST =
  /(?:^|\.)(?:github\.com|githubusercontent\.com|shields\.io|discord\.(?:gg|com)|pypi\.org|npmjs\.com|x\.com|twitter\.com|crates\.io|docs\.rs)$/i;
/** A post, not a docs or landing page: the prompt describes the release from what this page says. */
const ANNOUNCEMENT_PATH = /blog|announc|news|release|post/i;

/**
 * Links in a release's notes that look like its announcement post, in order:
 * outside code blocks, images and HTML tags (autolinks and `<a href>` kept), on no badge, chat or package host,
 * with a post-like path.
 */
export function announcementLinks(body: string | null | undefined): string[] {
  const text = (body ?? "")
    .replace(/(```|~~~)[\s\S]*?(\1|$)/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    // An autolink (`<https://…>`) and an HTML link's href are links, not tags to drop.
    .replace(/<(https:\/\/[^\s>]+)>/g, " $1 ")
    .replace(/<a\s[^>]*href=["'](https:\/\/[^"']+)["'][^>]*>/gi, " $1 ")
    .replace(/<[^>]*>/g, " ");
  const links = [...text.matchAll(/https:\/\/[^\s)\]>"'`]+/g)].map(([u]) => u.replace(/[.,;:*!?]+$/, ""));
  return [...new Set(links)].filter((u) => {
    try {
      const url = new URL(u);
      return !NOT_ANNOUNCEMENT_HOST.test(url.hostname) && ANNOUNCEMENT_PATH.test(url.pathname);
    } catch {
      return false;
    }
  });
}

function formatRelease(r: GitHubRelease, repo: string, notes: string): string {
  const announcement = r.announcement ? `\n  Announcement: ${r.announcement}` : "";
  return `- ${r.tag_name}${r.name && r.name !== r.tag_name ? ` (${r.name})` : ""} — https://github.com/${repo}/releases/tag/${r.tag_name}${announcement}\n  ${notes || "(no release notes)"}`;
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

Write the report in English: one section per project above that has something left to report, in the order given, headed \`## <Project name>\`, with at most 3 bullets, one or two sentences each. Write no other sections:
- **Release**: what the stable release(s) change for users — features, breaking changes, fixes that matter. Several releases in a range: summarize the range, do not list each one. Link each release you name as a plain Markdown link, [tag](url), never inside backticks; a range as its oldest and newest, [v1.2.0](url)–[v1.2.5](url). A release with an Announcement: describe it from the announcement, not from its first changelog entries.
- **Prerelease**: only from a "Prereleases (no stable release yet)" list, and only when it adds notable features or breaking changes; skip routine alpha/rc bumps. Say it is a prerelease and link it.
- **News**: what the news item says about the project and why it matters. Link it.
- **Hot issue**: what users are hitting and how serious it is. Link the issue (https://github.com/<repo>/issues/<number>).

Rules:
- Use only the data above. Omit a bullet type that has no data. Never state what did not happen ("no release today", "no breaking issues were reported").
- A news item may mention a project only in passing: skip it unless the project is its actual subject.
- If every item for a project is skipped, leave out its section entirely; the report lists it as quiet.
- Style: concise and concrete, for developers who use these tools.
`;
}

/** How every page's Highlights bullets are cut: one subject each, with its window. */
export const HIGHLIGHTS_PICK_RULE =
  "One subject per bullet. Keep an item's window as the sections give it ('this week', 'in 7 days'): never present a weekly figure as today's.";

/** The models page's Highlights note on a day without a lab post or new model: Spotted rows alone are not model news. */
export const NO_MODEL_NEWS_NOTE =
  "The page has no lab post and no new model today: open with the bullet '- No lab or model news today.' and add at most 2 bullets.";

/** What the agents page's Highlights rank first: its focus line for buildPageHighlightsPrompt. */
export const AGENTS_HIGHLIGHTS_FOCUS =
  "a release with breaking changes, a hot regression, a new capability, a notable spotted tool";

/** The models page's focus: what changes what a practitioner builds with. */
export const MODELS_HIGHLIGHTS_FOCUS =
  "a new model or a model's availability or price, a capability, a safety or evaluation finding, a lab's product launch";

/**
 * A page's Highlights, written after its sections: the model reads the rendered
 * body (the tracked sections and Spotted) and writes only `## Highlights`,
 * which goes above them. `focus` names what counts as consequential on this page.
 */
export function buildPageHighlightsPrompt(
  page: string,
  bodyMd: string,
  focus: string,
  dateStr: string,
  /** An extra rule for today's page, e.g. the models page with no lab post or new model. */
  note?: string,
): string {
  return `You are the editor of ${page}, a daily report. Below are today's report sections, ${dateStr}.

${bodyMd}

---

Write only \`## ${SECTIONS.highlights}\`: 1–3 bullets, most consequential for a data or AI engineer first: ${focus}. Pick the few that matter; do not restate every row.

Rules:
- ${NO_TITLE_RULE}
- ${goingAwayRule("bullet")}
- ${HIGHLIGHTS_PICK_RULE}${note ? `\n- ${note}` : ""}
- About 100 words in total. Write no other sections.
- Name each item in at most one bullet. Write no links or URLs: the sections below link every item.
- Base every claim on the sections. Do not invent versions, dates or features.
${sourceFidelityRules()}
- English, concise and concrete.
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
