/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease, HotIssue } from "../core/github.ts";
import type { NewsItem } from "./project-news.ts";
import { GOING_AWAY, hotIssueGain, SECTIONS } from "../core/strings.ts";

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
  hotIssues: HotIssue[];
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

/**
 * A hot issue's body as the model sees it. On 2026-10-28 OpenCode #59387, the maintainers' "Free
 * tier issues: read this first" thread, read as a live bug from its first 300 characters.
 */
export const HOT_ISSUE_BODY_CHARS = 1000;

/** Issue-form and template lines that say nothing about the issue: an unanswered field, a checklist item. */
const ISSUE_TEMPLATE_LINE_RE = /^[ \t]*(?:_No response_|[-*][ \t]+\[[ xX]\][ \t].*)[ \t]*$/gm;

/**
 * An issue or PR body on one line, without template comments and lines, code blocks (logs, stack
 * traces), HTML tags and link noise (`stripLinkNoise`), cut at `maxChars`.
 */
function issueBody(body: string | null | undefined, maxChars: number): string {
  const text = stripLinkNoise(
    (body ?? "")
      .replace(/<!--[\s\S]*?(?:-->|$)/g, " ")
      .replace(/(```|~~~)[\s\S]*?(\1|$)/g, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(ISSUE_TEMPLATE_LINE_RE, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxChars ? `${text.slice(0, maxChars)}...` : text;
}

export function formatItem(item: GitHubItem, bodyChars = 300): string {
  const labels = item.labels.map((l) => l.name).join(", ");
  const labelStr = labels ? ` [${labels}]` : "";
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
    `  ${t.summary}: ${issueBody(item.body, bodyChars)}`,
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
  "Several items on one theme in the same period are not a trend: a trend or causal claim needs rows that show it (a summary that states it, or figures such as gains or ranks), never titles, descriptions or co-occurrence alone.",
];

/** SOURCE_FIDELITY_RULES as prompt rule lines. */
export const sourceFidelityRules = (): string => SOURCE_FIDELITY_RULES.map((r) => `- ${r}`).join("\n");

/**
 * How a release summary orders its changes. On 2026-10-26 the Polars row spent its words on 3 of
 * 88 performance items and the Cline row led with minor items and called a fix an addition.
 */
export const RELEASE_ORDER =
  "breaking changes first, then fixes that change behavior (call a fix a fix, never 'adds' or 'introduces'), then headline features, performance last";

/** Identifiers and names exactly as the source writes them: a reader copies them. */
export const IDENTIFIER_RULE =
  "Copy identifiers (types, functions, settings, flags) verbatim from the text, in `code`; write a project or repo name exactly as given, even at the start of a sentence (pstack-claude, never Pstack-claude).";

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

/** A news story's description as the model sees it: enough to show the project is its subject. */
const NEWS_DESCRIPTION_CHARS = 300;

/** Newest stable releases shown per project; llama.cpp alone tags 35–70 a week. */
const RELEASES_PER_PROJECT = 10;
/**
 * A stable release's notes as the model sees them (the agents and data reports), counted after
 * `releaseNotes` strips the links: OpenCode v2.2.0's 35 KB notes strip to 17 KB, its Breaking
 * changes and Highlights to the first 1.8 KB. Prompt input, which `callLlm`'s token budgets (output
 * caps) do not count: 16 agents or 17 data repos × RELEASES_PER_PROJECT × 2000 chars is at worst
 * ~85K tokens, inside gpt-4o's 128K context and the daily fallbacks' 1M; a normal day sends a few releases.
 * The data page's Releases this week rows have no code cap: only releases no earlier report showed.
 */
export const RELEASE_BODY_CHARS = 2000;
// A prerelease is reported only if its notes show notable features, so the
// model needs more of them. DeepSeek Harness notes run 4–19 KB, Chinese first
// behind "[English](#en-…)" anchor links and <h3> tags: at 400 characters the
// model saw the anchors and half a heading.
const PREVIEW_BODY_CHARS = 1500;

/**
 * Release notes on one line, without fenced code blocks, HTML tags, in-page
 * anchor links and link noise (`stripLinkNoise`), the going-away and upgrade
 * sections first (`priorityFirst`), cut after the last whole item that fits
 * `maxChars`. Agent Deck's notes open with three install blocks (Homebrew,
 * curl, `go install`), so on 2026-10-19 the first 400 characters held no
 * change and the report listed install commands.
 */
export function releaseNotes(body: string | null | undefined, maxChars: number): string {
  const text = compactChangelog(body ?? "")
    .replace(/(```|~~~)[\s\S]*?(\1|$)/g, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]\(#[^)]*\)/g, " ");
  return wholeItems(stripLinkNoise(priorityFirst(text)), maxChars);
}

/**
 * Text without what costs characters and tells the model nothing: link URLs (a
 * link keeps its text, an image goes), PR and issue references, thank-you and
 * first-contribution lines, the Full Changelog link. Line breaks are kept. On
 * 2026-10-28 most of OpenShell v0.1.6's first 400 characters were PR link URLs.
 */
export function stripLinkNoise(text: string): string {
  return (
    text
      .replace(/^#+[ \t]*New Contributors[ \t]*$/gim, "")
      .replace(CONTRIBUTOR_LINE_RE, "")
      .replace(/\*\*Full Changelog\*\*:?\s*\S+/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/(?:,\s*)?\[#\d+\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<?https?:\/\/[^\s)>]+>?/g, " ")
      // The reference lists the steps above emptied, "([#1](…), [#2](…))" → "( , )", and "(#1, #2)";
      // the opening lookahead keeps a call's "()" in code.
      .replace(/\((?=[\s,#])(?:[\s,]|#\d+)+\)/g, " ")
      .replace(/ by @[\w-]+(?:\[bot\])?(?![\w/-])(?: in #\d+)?/g, "")
  );
}

// "- @user made their first contribution in …", "Thanks to @a and @b", "Contributors: @a, @b".
const CONTRIBUTOR_LINE_RE =
  /^[ \t]*(?:[*-][ \t]+)?(?:.*\bmade their first contribution\b.*|(?:thanks|thank you|kudos|contributors|credits)\b.*@[\w-]+.*)$/gim;

/**
 * A heading of what a user must act on: what breaks, goes away or needs an
 * upgrade step. On 2026-10-28 OpenCode v2.2.0's three breaking changes and
 * OpenShell v0.1.6's upgrade notes came after the cut.
 */
const PRIORITY_HEADING_RE =
  /\b(?:breaking|removed|removals?|deprecat\w*|upgrade notes?|upgrade guide|upgrading|migrat\w*|security)\b/i;

/** The sections under a PRIORITY_HEADING_RE heading (each through its sub-headings) moved to the front, in order. */
function priorityFirst(text: string): string {
  const front: string[] = [];
  const rest: string[] = [];
  let level = 0; // the heading level of the priority section we are in, 0 outside one
  for (const line of text.split("\n")) {
    const heading = /^[ \t]*(#{1,6})[ \t]+(.*)$/.exec(line);
    if (heading && level && heading[1]!.length <= level) level = 0;
    if (heading && !level && PRIORITY_HEADING_RE.test(heading[2]!)) level = heading[1]!.length;
    (level ? front : rest).push(line);
  }
  return [...front, ...rest].join("\n");
}

/**
 * The lines on one line, up to the last whole line that fits `maxChars`; a line
 * that does not fit gives its leading whole sentences, and a first line without
 * one is cut at a word. A heading with nothing under it (OpenShell's title over
 * its install block) or left last by the cut is dropped: it introduces nothing.
 */
function wholeItems(text: string, maxChars: number): string {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const level = (line: string) => /^#+(?= )/.exec(line)?.[0].length ?? 0;
  const items: string[] = [];
  let length = -1; // the joining space before the first item is not there
  for (const [i, item] of lines.entries()) {
    const next = lines[i + 1];
    if (level(item) && (next === undefined || (level(next) && level(next) <= level(item)))) continue;
    const room = maxChars - length - 1;
    if (item.length <= room) {
      items.push(item);
      length += item.length + 1;
      continue;
    }
    const head = item.slice(0, room + 1);
    const sentenceEnd = Math.max(...[...head.matchAll(/[.!?;](?=\s)/g)].map((m) => m.index), -1);
    if (sentenceEnd >= 0) items.push(item.slice(0, sentenceEnd + 1));
    else if (!items.length) items.push(head.slice(0, Math.max(head.lastIndexOf(" "), 0)).trim());
    break;
  }
  while (items.length && level(items.at(-1)!)) items.pop();
  return items.join(" ");
}

// GitHub's generated notes: "* <PR title> by @user in https://github.com/…/pull/N".
const CHANGELOG_ENTRY_RE = /^[ \t]*[*-][ \t]+(.+?) by @\S+ in https:\/\/github\.com\/\S+\/pull\/\d+[ \t]*$/gm;

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
  return withCount.replace(CHANGELOG_ENTRY_RE, "$1;");
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

/** A project's block in the digest prompt; also the source its section's backticked tokens are checked against. */
export function formatProject(a: ProjectActivity): string {
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
  const issues =
    a.hotIssues
      .map(
        (i) =>
          `${formatItem(i, HOT_ISSUE_BODY_CHARS)}\n  ${hotIssueGain(i.gain, i.gainSince)}` +
          (i.fix ? `\n  Fix: PR #${i.fix.number} ${i.fix.state}` : ""),
      )
      .join("\n") || "None";
  const news =
    a.news
      .map(
        (n) =>
          `- [${n.source}] ${n.title} — ${n.url} (${n.detail})${n.description ? `\n  Description: ${n.description.slice(0, NEWS_DESCRIPTION_CHARS)}` : ""}`,
      )
      .join("\n") || "None";

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
- **Release**: what the stable release(s) change for users, in this order: ${RELEASE_ORDER}. Several releases in a range: summarize the range, do not list each one. Link each release you name as a plain Markdown link, [tag](url), never inside backticks; a range as its oldest and newest, [v1.2.0](url)–[v1.2.5](url). A release with an Announcement: describe it from the announcement, not from its first changelog entries.
- **Prerelease**: only from a "Prereleases (no stable release yet)" list, and only when it adds notable features or breaking changes; skip routine alpha/rc bumps. Say it is a prerelease and link it.
- **News**: what the news item says about the project and why it matters. Link it.
- **Hot issue**: one bullet per issue, written "- **Hot issue:** #<number>: <description>". The description says what the issue reports and how serious it is, worded as a report ("users report", "an issue says"), never as an established fact. When the body shows a tracking, announcement or FAQ thread rather than a bug report, say so. For a security issue, say where the problem shows and who is affected. Write no link, label, comment or 👍 count, gain or fix status: code adds them to the bullet.

Rules:
- Use only the data above. Omit a bullet type that has no data. Never state what did not happen ("no release today", "no breaking issues were reported").
- A news item may mention a project only in passing: skip it unless the project is its actual subject, judged from its title and description.
- A project with a stable release always gets its section and a **Release** bullet naming its most user-visible changes, even when they are small.
- If every item of a project without a stable release is skipped, leave out its section entirely; code lists it as quiet.
- ${IDENTIFIER_RULE}
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

/**
 * The Skills section. `prs` are open or merged (selectSkillsItems drops a PR closed without
 * merging), so code, not the model, decides what shipped: a merged PR is listed as MERGED.
 */
export function buildSkillsPrompt(prs: GitHubItem[], issues: GitHubItem[], dateStr: string): string {
  const topPrs = topN(prs, 20);
  const topIssues = topN(issues, 15);

  const noneStr = "None";
  const prsText =
    topPrs.map((p) => formatItem(p.merged_at ? { ...p, state: "merged" } : p)).join("\n") || noneStr;
  const issuesText = topIssues.map((i) => formatItem(i)).join("\n") || noneStr;

  return `You are a technical analyst writing for engineers who use coding agents and build data/AI systems. The following data is from github.com/anthropics/skills, Anthropic's Claude Code Skills repository: its pull requests and issues updated in the last 7 days (data as of ${dateStr}).

## Repository Context
A PR proposes a new or changed Skill; most are third-party submissions, and an open PR is not a released Skill. Issues are bug reports and requests.

## Pull Requests updated this week (sorted by comments, ${prs.length} total, showing top ${topPrs.length})
${prsText}

## Issues updated this week (sorted by comments, ${issues.length} total, showing top ${topIssues.length})
${issuesText}

---

Write the section in English with these headings. ${NO_TITLE_RULE}
Leave out every item that is not about coding agents or data/AI engineering (e.g. games, blockchain, resumes, media production).

## Open PRs worth watching
Up to 5 open PRs: what each would add or fix, and that it is not merged yet. Describe what the PR does; do not call it critical or an overhaul unless its text says so.

## Merged this week
The PRs with state MERGED, if any: what each ships.

## Requests
From the issues, what people ask the Skills to do or fix.

## Takeaway
One sentence on what the open PRs, merged PRs and issues you wrote about have in common.

Style: concise and professional, include GitHub links for each item.
${REPO_LENGTH_RULE}
`;
}
