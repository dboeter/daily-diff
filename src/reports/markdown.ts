/**
 * Report Markdown in code: page assembly, the report bar, the code-rendered
 * tables, and the cleanup of what models write (titles, code links, headings).
 */

import {
  formatProject,
  hasActivity,
  RELEASE_BODY_CHARS,
  releaseNotes,
  type ProjectActivity,
} from "./prompts.ts";
import type { ReleaseRow } from "./pages.ts";
import { escapeRegex } from "../core/regex.ts";
import {
  formatTokens,
  type OpenRouterModel,
  type OpenRouterNewModel,
  type OpenRouterStealthModel,
} from "../sources/openrouter.ts";
import type { LabPost } from "../sources/labs.ts";
import type { TrendingReportData } from "../trending/rank.ts";
import type { NoHighlightRow } from "./prompts-pages.ts";
import { hfDescription, hfKeys, type HfRow } from "../sources/huggingface.ts";
import type { PolicyItem } from "../policy/items.ts";
import type { KeptVendorItem } from "../data/relevance.ts";
import type { VendorAction } from "../data/vendors.ts";
import type { CommunityRow } from "../data/community.ts";
import type { StoryRow } from "../spotted/pool.ts";
import type { ResearchPaper } from "../trending/research.ts";
import type { Category } from "../trending/rank.ts";
import type { RepoConfig } from "../core/github.ts";
import { hotIssueLabel, type HotIssue } from "../core/hot-issues.ts";
import {
  AGENT_SECTION_KEYS,
  VENDOR_SECTIONS,
  vendorSection,
  type AgentSectionKey,
  type VendorSection,
} from "../core/config.ts";
import { checkCodeTokens, summaryText, type Numbered } from "./summarized-table.ts";
import {
  GOING_AWAY,
  HOT_ISSUE,
  LIVE_REPORT_IDS,
  MSG,
  nothingNew,
  OVERVIEW,
  REPORTS,
  REPORT_META,
  SECTIONS,
  STEALTH_SECTION,
  MODELS_PAGE,
  TRENDS_REPORT,
  POLICY_REPORT,
  DATA_REPORT,
  SPOTTED,
  type ReportId,
} from "../core/strings.ts";

// ---------------------------------------------------------------------------
// Project digest (the agents report's agents and infra sections, the data report's repo sections)
// ---------------------------------------------------------------------------

/** One config section's projects, under its own heading. */
export interface ProjectGroup {
  /** The section's `title` in config.yml, rendered as its `##` heading. */
  title: string;
  /** Every tracked project, active or not, in config order. */
  activities: ProjectActivity[];
  /** LLM output: one `## <Project>` section per active project. */
  summary: string;
  /**
   * A tracked source of the data report: with nothing to show (no preamble, no project section, no
   * unavailable project) it is named, with its quiet projects, in the page's one "Nothing new from …"
   * line instead of a heading. Without it an empty group shows its quiet line, or nothing.
   */
  namedWhenEmpty?: boolean;
  /** Markdown under the heading, before the projects (the data report's vendor table). Shown even when every project is quiet. */
  preamble?: string;
}

export interface ProjectReportInput {
  /** The H1 line, from reportHeading. */
  heading: string;
  utcStr: string;
  groups: ProjectGroup[];
  /** Label for the quiet-projects line, e.g. "today". */
  period: string;
  /** Markdown rendered between the header and the groups, ending with its own separator. */
  preamble?: string;
  /** Counts shown before the project counts, e.g. the data report's "Vendor items: 16". */
  leadingCounts?: string;
  /** Markdown after the last group, before the footer (Spotted, the data report's EU data law), with its own separator. */
  epilogue?: string;
  footer: string;
}

/** A `## <name>` section of a project summary, line-anchored, so "## Pi pod" is not Pi's. */
const sectionHeading = (name: string) => new RegExp(`^##\\s+${escapeRegex(name)}\\s*$`, "m");

/** The section's text under `## <name>`, up to the next `## `, or null when the summary has none. */
function sectionOf(summary: string, name: string): string | null {
  const m = sectionHeading(name).exec(summary);
  if (!m) return null;
  const rest = summary.slice(m.index + m[0].length);
  const next = rest.search(/^##\s/m);
  return next === -1 ? rest : rest.slice(0, next);
}

/** A project the model covered: its section carries at least one bullet, not only an absence note. */
const covers = (summary: string, a: ProjectActivity) =>
  /^\s*[-*]\s+\S/m.test(sectionOf(summary, a.config.name) ?? "");

/** Dependency bumps and chores: never a release's top item. */
const ROUTINE_ITEM = /\b(bump(s|ed)?|deps?|dependenc(y|ies)|dependabot|chore|renovate)\b/i;

/**
 * The code-written Release bullet of a project with a stable release the model left without one:
 * the newest release, linked, and its first 3 non-routine note items. On 2026-10-26 Agent Deck
 * v1.16.34 (about 20 user-facing items) rendered as a bare "(no reportable changes)".
 */
function releaseBullet(a: ProjectActivity): string {
  const r = a.releases[0]!;
  const items = (r.body ?? "")
    .split("\n")
    .map((l) => /^\s*[-*]\s+(.+)$/.exec(l)?.[1] ?? "")
    .map((t) =>
      t
        .replace(/\s+by @\S+ in https:\/\/\S+$/, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\s*\(#\d+\)$/, "")
        .replace(/\*\*/g, "")
        .trim(),
    )
    .filter((t) => t && !ROUTINE_ITEM.test(t))
    .slice(0, 3)
    .map((t) => (t.length > 120 ? `${t.slice(0, 119).trimEnd()}…` : t));
  const title = r.name && r.name !== r.tag_name ? ` (${r.name})` : "";
  const link = `[${r.tag_name}](https://github.com/${a.config.repo}/releases/tag/${r.tag_name})${title}`;
  return `- **Release:** ${link}${items.length ? `: ${items.join("; ")}` : ""}`;
}

/**
 * The code-written section of a project with a stable release or a hot issue the model left
 * without a bullet: its Release bullet and its Hot issue bullets.
 */
const projectFallbackSection = (a: ProjectActivity): string =>
  [
    `## ${a.config.name}`,
    ...(a.releases.length ? [releaseBullet(a)] : []),
    ...a.hotIssues.map(hotIssueBullet),
  ].join("\n");

/** The project whose `## <name>` heads the section. */
const projectOf = (section: string, g: ProjectGroup): ProjectActivity | undefined =>
  g.activities.find((p) => sectionHeading(p.config.name).test(section));

/**
 * Whether a normalized section (`boldLabelColonInside`) shows the project's release: a
 * `**Release:**` bullet, or a bullet naming one of its release tags without the label.
 */
const showsRelease = (section: string, a: ProjectActivity): boolean =>
  /^\s*[-*]\s+\*\*Release:\*\*/m.test(section) ||
  section.split("\n").some((l) => /^\s*[-*]\s/.test(l) && a.releases.some((r) => l.includes(r.tag_name)));

/** A covered section of a project with a stable release, with the Release bullet the model left out appended. */
function withReleaseBullet(section: string, g: ProjectGroup): string {
  const a = projectOf(section, g);
  return a && a.releases.length > 0 && !showsRelease(section, a)
    ? `${section}\n${releaseBullet(a)}`
    : section;
}

/**
 * A bullet's bold label in one form, the colon inside (`**Release:**`), as projectFallbackSection
 * writes it: the prompt lists `**Release**:` and models copy either form (2026-10-25 vs 10-26).
 */
export const boldLabelColonInside = (md: string): string =>
  md.replace(/^(\s*[-*]\s+)\*\*([^*\n]+?)\*\*:/gm, "$1**$2:**");

/**
 * A hot issue's facts in one form, written by code: the regression or security label it qualified
 * on, its totals, its gain and its fix PR. On 2026-10-28 the model wrote a different count
 * parenthetical on every row and left out Gemini #15404's `area/security`.
 */
function hotIssueFacts(i: HotIssue): string {
  const fix = i.fix && HOT_ISSUE.fix(i.fix.state, `[#${i.fix.number}](${i.fix.url})`);
  return [
    hotIssueLabel(i),
    HOT_ISSUE.totals(i.comments, i.reactions?.["+1"] ?? 0),
    HOT_ISSUE.gain(i.gain, i.gainSince),
    fix,
  ]
    .filter(Boolean)
    .join("; ");
}

/** The code-written Hot issue bullet of a hot issue the model left out: its title as the description. */
const hotIssueBullet = (i: HotIssue): string =>
  `- **${HOT_ISSUE.label}:** [#${i.number}](${i.html_url}): ${i.title} (${hotIssueFacts(i)})`;

/** A Hot issue bullet, its label normalized by `boldLabelColonInside`, in any case ("Hot Issue"). */
const HOT_ISSUE_BULLET = new RegExp(`^\\s*[-*]\\s+\\*\\*${escapeRegex(HOT_ISSUE.label)}:\\*\\*`, "i");

/** A parenthetical the model wrote with counts or a gain: "(16 comments, +3 in 24h)". */
const MODEL_COUNTS = /\s*\((?=[^()\n]*(?:\bcomments?\b|👍|\breactions?\b|\+\d+\s+(?:in|since)\b))[^()\n]*\)/g;

/**
 * A section's Hot issue bullets with code's facts: each bullet naming one of the project's hot
 * issues (`#N` or its URL) gets the issue linked where the model left it bare, any counts the model
 * wrote dropped, and `hotIssueFacts` appended, prefixed by the number when the bullet names several.
 * A hot issue no bullet names gets a code-written one (`hotIssueBullet`).
 */
function withHotIssueFacts(section: string, g: ProjectGroup): string {
  const a = projectOf(section, g);
  if (!a?.hotIssues.length) return section;
  const shown = new Set<HotIssue>();
  const lines = section.split("\n").map((line) => {
    if (!HOT_ISSUE_BULLET.test(line)) return line;
    const named = a.hotIssues.filter((i) => new RegExp(`(?:#|/issues/)${i.number}(?!\\d)`).test(line));
    if (!named.length) return line;
    for (const i of named) shown.add(i);
    let text = line.replace(MODEL_COUNTS, "").trimEnd();
    for (const i of named) {
      if (!text.includes(`/issues/${i.number}`)) {
        text = text.replace(new RegExp(`#${i.number}(?!\\d)`), `[#${i.number}](${i.html_url})`);
      }
    }
    const facts = named.map((i) => `(${named.length > 1 ? `#${i.number}: ` : ""}${hotIssueFacts(i)})`);
    return `${text} ${facts.join(" ")}`;
  });
  const missing = a.hotIssues.filter((i) => !shown.has(i)).map(hotIssueBullet);
  return [...lines, ...missing].join("\n");
}

/**
 * A news link in one form, written by code: a bare news URL in the section becomes
 * `[<title>](<url>)`. The prompt asks for a Markdown link, but most News bullets of 2026-10-20 to
 * 10-31 ended in a bare URL (15 of 24), next to linked ones on the same page.
 */
function withNewsLinks(section: string, g: ProjectGroup): string {
  const a = projectOf(section, g);
  return (a?.news ?? []).reduce((text, n) => {
    // A trending repo's title is "owner/repo — description": the repo names the link.
    const label = (n.source === "GitHub Trending" ? n.title.split(" — ")[0]! : n.title).replace(/[[\]]/g, "");
    // Bare: not the target of a Markdown link or an autolink, and not the start of a longer URL.
    const bare = new RegExp(`(?<![([<])${escapeRegex(n.url)}(?![\\w/?#=&%-])`, "g");
    return text.replace(bare, () => `[${label}](${n.url})`);
  }, section);
}

/** A model-written project section with its backticked tokens checked against that project's prompt block. */
function checkProjectTokens(section: string, g: ProjectGroup): string {
  const a = projectOf(section, g);
  if (!a) return section;
  return checkCodeTokens(new Map([[0, section]]), new Map([[0, formatProject(a)]]), g.title).get(0)!;
}

/**
 * A group's projects as rendered: the model's summary without text outside a `##` section and
 * without a project section that has no bullet (both are absence notes the prompt forbids), plus a
 * code section for each project with a stable release or a hot issue the model did not cover, and a
 * code Release bullet appended to a covered section that does not show its release, and each Hot
 * issue bullet with its facts in code, a missing one code-written (`withHotIssueFacts`), and each
 * bare news URL linked with its title (`withNewsLinks`). Each project
 * section's backticked tokens are checked against the project's block in the prompt
 * (`checkCodeTokens`). `quiet` is every other checked project without a section; after a failed
 * call (MSG.summaryFailed) the data decides.
 */
function groupProjects(g: ProjectGroup): { body: string; quiet: ProjectActivity[] } {
  const failed = g.summary.trim() === MSG.summaryFailed;
  const covered = g.activities.filter((a) => covers(g.summary, a));
  const fallback = g.activities.filter(
    (a) => (a.releases.length > 0 || a.hotIssues.length > 0) && !covered.includes(a),
  );
  const kept = failed
    ? [g.summary.trim()]
    : g.summary
        .split(/^(?=##\s)/m)
        .filter((chunk) => /^##\s/.test(chunk))
        .filter(
          (chunk) =>
            !g.activities.some((a) => sectionHeading(a.config.name).test(chunk) && !covers(chunk, a)),
        )
        .map((chunk) =>
          withNewsLinks(
            withHotIssueFacts(
              withReleaseBullet(boldLabelColonInside(checkProjectTokens(chunk.trim(), g)), g),
              g,
            ),
            g,
          ),
        );
  const body = [...kept, ...fallback.map(projectFallbackSection)].filter(Boolean).join("\n\n");
  const active = failed ? g.activities.filter(hasActivity) : [...covered, ...fallback];
  return { body, quiet: g.activities.filter((a) => !active.includes(a) && !a.fetchFailed) };
}

/**
 * The groups as a prose call reads them: each with its preamble or an active
 * project, under its `##` title, the projects' sections nested below it (no
 * quiet lines). Empty groups are left out.
 */
export function groupsMarkdown(groups: ProjectGroup[]): string[] {
  return groups
    .map((g) => {
      const body = g.activities.some(hasActivity) ? nestHeadings(groupProjects(g).body, 3) : "";
      return g.preamble || body ? `## ${g.title}\n\n${[g.preamble, body].filter(Boolean).join("\n\n")}` : "";
    })
    .filter(Boolean);
}

/**
 * Release-focused report, one `##` section per config group (coding agents,
 * agent tooling), the LLM's sections nested below it. Quiet projects are
 * listed in one line per group rather than each getting a "no activity"
 * section. Small enough to post as the GitHub issue body unchanged, so there
 * is no brief variant.
 */
export function buildProjectReportContent(r: ProjectReportInput): string {
  const all = r.groups.flatMap((g) => g.activities);
  const releases = all.reduce((n, a) => n + a.releases.length, 0);
  const prereleases = all.reduce((n, a) => n + a.prereleaseCount, 0);
  const link = (a: ProjectActivity) => `[${a.config.name}](https://github.com/${a.config.repo})`;
  let inactiveCount = 0;
  const nothingNewFrom: string[] = [];
  const sections = r.groups.flatMap((g) => {
    const { body, quiet } = groupProjects(g);
    // A project whose release fetch failed was not checked: "Quiet" would claim it shipped nothing.
    const unavailable = g.activities.filter((a) => a.fetchFailed);
    inactiveCount += quiet.length + unavailable.length;
    if (g.namedWhenEmpty && !body && !g.preamble && !unavailable.length) {
      // The quiet repos stay named: the line is the only sign they are tracked.
      nothingNewFrom.push(quiet.length ? `${g.title} (${quiet.map(link).join(", ")})` : g.title);
      return [];
    }
    // A group with neither projects nor a preamble (the data report's Azure / Fabric & GCP on a day
    // without its vendor rows) has nothing to show. An all-quiet group shows its quiet line.
    if (!g.activities.length && !g.preamble) return [];
    const projects = [
      // The data report passes an empty summary for a group with no active project.
      nestHeadings(body, 3),
      quiet.length ? `**Quiet ${r.period}:** ${quiet.map(link).join(", ")}` : "",
      unavailable.length ? `**Unavailable ${r.period}:** ${unavailable.map(link).join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    return `## ${g.title}\n\n` + [g.preamble, projects].filter(Boolean).join("\n\n");
  });
  if (nothingNewFrom.length) sections.push(nothingNew(nothingNewFrom, r.period));

  return (
    `${r.heading}\n\n` +
    REPORT_META.line(
      [
        r.leadingCounts ?? "",
        `Projects: ${all.length}`,
        `Active ${r.period}: ${all.length - inactiveCount}`,
        `Stable releases: ${releases}`,
        `Prereleases (not covered): ${prereleases}`,
      ],
      r.utcStr,
    ) +
    `\n\n` +
    `---\n\n` +
    (r.preamble ?? "") +
    sections.join("\n\n---\n\n") +
    (r.epilogue ?? "") +
    r.footer
  );
}

// ---------------------------------------------------------------------------
// Report bar: links between the day's reports
// ---------------------------------------------------------------------------

/**
 * One line linking the day's overview and its other reports, in REPORTS
 * order. Absolute Pages URLs, so it works in the GitHub issue copy too.
 * Before October 2026 a report linked to nothing: the sidebar was the only
 * way between reports.
 */
export function renderReportBar(
  current: ReportId,
  ids: ReportId[],
  dateStr: string,
  pagesUrl: string,
): string {
  const links = LIVE_REPORT_IDS.filter((id) => ids.includes(id)).map((id) => {
    const label = `${REPORTS[id].emoji} ${REPORTS[id].name}`;
    return id === current ? `**${label}**` : `[${label}](${pagesUrl}/#${dateStr}/${id})`;
  });
  return [`[${OVERVIEW.emoji} ${OVERVIEW.name}](${pagesUrl}/#${dateStr})`, ...links].join(" · ");
}

/** Put the report bar under the report's H1. */
export function withReportBar(content: string, bar: string): string {
  const i = content.indexOf("\n");
  return i === -1 ? `${content}\n\n${bar}` : `${content.slice(0, i)}\n\n${bar}${content.slice(i)}`;
}

// ---------------------------------------------------------------------------
// LLM body clean-up
// ---------------------------------------------------------------------------

/** A `**Date:** …` style line of a title block the model writes under its H1. */
const TITLE_BLOCK_LINE = /^\*\*[\w /]+:\*\*/;

/**
 * Remove the title the model writes at the top of a report body: code renders
 * the report's H1 and metadata line. Before October 2026 five reports carried
 * two H1s ("# Hacker News AI Community Digest 2026-10-12" from code, then the
 * model's "… — 2026-10-12"), and the web report a `**Date:**` … `**Type:**` block
 * as well. A later H1 is demoted to H2, keeping its section.
 */
export function stripModelTitle(md: string): string {
  const lines = md.split("\n");
  let i = 0;
  const skipBlank = () => {
    while (i < lines.length && lines[i]!.trim() === "") i++;
  };
  skipBlank();
  if (/^#\s/.test(lines[i] ?? "")) {
    i++;
    while (i < lines.length && (lines[i]!.trim() === "" || TITLE_BLOCK_LINE.test(lines[i]!))) i++;
    if (/^-{3,}\s*$/.test(lines[i] ?? "")) {
      i++;
      skipBlank();
    }
  }
  const body = lines.slice(i);
  const levels = headingLevels(body);
  return body.map((line, j) => (levels[j] === 1 ? `#${line}` : line)).join("\n");
}

/** A code span: a pair of single backticks on one line, matched left to right. */
const CODE_SPAN = /`([^`\n]+)`/g;
/** Nothing but web links and the dashes or commas between them: `[text](url)` in prose about Markdown is code. */
const LINKS_ONLY = /^(?:\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)[\s,–—-]*)+$/;

/**
 * Take Markdown links out of the backticks the model puts around them, where
 * they render as literal text: on 2026-10-23 every release and issue link of
 * the agents report read `[v2.1.307](…)–[v2.1.308](…)`, after the prompt's own
 * example. A code span with anything else in it stays.
 */
export function unwrapCodeLinks(md: string): string {
  return md.replace(CODE_SPAN, (span, inner: string) => (LINKS_ONLY.test(inner) ? inner : span));
}

/** A line that opens with a dash or the minus sign but no list marker. */
const UNMARKED_SIGN = /^[–—−][ \t]+/;

/**
 * Models write the gutter's minus (GOING_AWAY) as a hyphen or a dash, and `- - text` would nest a
 * list: a list item opening with one becomes the minus sign.
 *
 * A model may also drop the list marker and open every bullet with the sign, which Markdown renders
 * as one paragraph (the models page of 2026-10-24, where no item was going away). A `##` section
 * whose every unindented line opens that way gets `- ` markers. One such line among prose or list
 * items is left alone: it may be a wrapped line, and its sign cannot be told from a marker.
 */
export function signListItems(md: string): string {
  const listed = md
    .split(/^(?=## )/m)
    .map((section) => {
      const lines = section.split("\n");
      // Headings, `---` rules and comments such as TABLES_MARKER are no lines of text.
      const body = lines.filter((l) => /^\S/.test(l) && !/^(## |<!--|([-*_])\2{2,}\s*$)/.test(l));
      if (!body.length || !body.every((l) => UNMARKED_SIGN.test(l))) return section;
      return lines.map((l) => l.replace(UNMARKED_SIGN, "- ")).join("\n");
    })
    .join("");
  return listed.replace(/^(\s*[-*]\s+)[-–—−](?=\s)/gm, `$1${GOING_AWAY}`);
}

/** `signListItems` for one highlights.json entry. */
export function signHighlight(text: string): string {
  return text.replace(/^[-–—−](?=\s)/, GOING_AWAY);
}

/**
 * A reply that was to write only Highlights, cut to its Highlights under the
 * fixed heading: a section the model adds anyway would land above the page's
 * tables, and a missing heading would leave bare bullets.
 */
export function highlightsOnly(reply: string): string {
  const lines = stripModelTitle(reply).trim().split("\n");
  const start = lines[0]?.startsWith("## ") ? 1 : 0;
  const end = lines.findIndex((l, j) => j >= start && l.startsWith("## "));
  const body = lines
    .slice(start, end === -1 ? undefined : end)
    .join("\n")
    .trim();
  return `## ${SECTIONS.highlights}\n\n${signListItems(body)}`;
}

/** Lines with their heading level (0 = not a heading), ignoring code fences. */
function headingLevels(lines: string[]): number[] {
  let inFence = false;
  return lines.map((line) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    return inFence ? 0 : (line.match(/^(#{1,6})\s/)?.[1]?.length ?? 0);
  });
}

/**
 * Shift a body's headings so its top heading sits at `level`, for a body
 * placed under a code-rendered heading (Skills inside trending). Before
 * October 2026 the Skills body's own H1 and H2s outranked its "## Claude Code
 * Skills" section.
 */
export function nestHeadings(md: string, level: number): string {
  const lines = md.split("\n");
  const levels = headingLevels(lines);
  const top = Math.min(...levels.filter((l) => l > 0));
  const shift = Number.isFinite(top) ? Math.max(0, level - top) : 0;
  if (shift === 0) return md;
  return lines
    .map((line, i) =>
      levels[i]! > 0 ? "#".repeat(Math.min(6, levels[i]! + shift)) + line.slice(levels[i]!) : line,
    )
    .join("\n");
}

// ---------------------------------------------------------------------------
// Stealth models (daily, on the models page)
// ---------------------------------------------------------------------------

/** A stealth model listed within this many days is flagged new (2 days covers a delayed cron). */
const STEALTH_NEW_DAYS = 2;
/** A stealth model expiring within this many days is flagged — they vanish without further notice. */
const STEALTH_EXPIRING_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A stealth model listed within STEALTH_NEW_DAYS: 🆕 in the table, and it publishes the models page. */
export function isNewStealthModel(m: OpenRouterStealthModel, now = Date.now()): boolean {
  const today = Date.parse(new Date(now).toISOString().slice(0, 10));
  return today - Date.parse(m.created) < STEALTH_NEW_DAYS * DAY_MS;
}

/**
 * Deterministic stealth-model section. Rendered from the catalog, not by the
 * LLM, so it can't be dropped or invented. "Catalog unavailable" is news too;
 * the models page names a catalog without stealth models in its "Nothing new" line.
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
      if (isNewStealthModel(m, now)) status.push(S.isNew);
      if (m.expires) {
        const days = Math.round((Date.parse(m.expires) - today) / DAY_MS);
        if (days <= STEALTH_EXPIRING_DAYS) status.push(S.expiring(days));
      }
      const link = `[${m.name}](https://openrouter.ai/${m.id})`;
      return `| ${link} \`${m.id}\` | ${m.created} | ${m.expires ?? "—"} | ${status.join(", ") || S.live} |`;
    });
    body = `${S.header}\n${rows.join("\n")}`;
  }
  return `## ${S.title}\n\n${body}`;
}

// ---------------------------------------------------------------------------
// Code-rendered tables with LLM row summaries (summarized-table.ts)
// ---------------------------------------------------------------------------

/** Table cell text: one line, pipes escaped. */
export const cell = (s: string) => s.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();

/** Policy table link text. EUR-Lex titles run to 500+ characters; the item keeps the full one for Jev and the prompts. */
const POLICY_TITLE_MAX_CHARS = 200;
export const policyTitleLabel = (title: string): string =>
  cell(title.length > POLICY_TITLE_MAX_CHARS ? `${title.slice(0, POLICY_TITLE_MAX_CHARS)}…` : title);

/**
 * The Radar, category and Hugging Face rows whose cell shows "—": no summary
 * and no description to fall back on. The page says nothing about them, so
 * they make no Highlight: the prose call is told, and `dropNoHighlightRows`
 * drops one it writes anyway (Strix on 2026-10-26).
 */
export function unsummarizedRows(
  report: TrendingReportData | undefined,
  summaries: Map<number, string>,
  hf: Numbered<HfRow>[] = [],
  hfSummaries: Map<number, string> = new Map(),
): NoHighlightRow[] {
  const radar = report?.radar ?? [];
  const tables = report?.categories.flatMap((c) => c.rows) ?? [];
  return [
    ...radar.filter((r) => summaryText(summaries, r) === "—").map((r) => ({ name: r.name, url: r.url })),
    ...tables.filter((r) => summaryText(summaries, r) === "—").map((r) => ({ name: r.fullName, url: r.url })),
    ...hf.filter((r) => hfSummaryText(hfSummaries, r) === "—").map((r) => ({ name: r.id, url: r.url })),
  ];
}

/** The Radar and category tables, a `##` heading each; "" when both are empty. */
export function renderTrendingTables(report: TrendingReportData, summaries: Map<number, string>): string {
  const T = TRENDS_REPORT;
  const summary = (row: { n: number; description: string }) => cell(summaryText(summaries, row));
  const link = (name: string, url: string) => (url ? `[${cell(name)}](${cell(url)})` : cell(name));
  // 🔥: also in last week's report. In the name cell, the one cell both tables share.
  const fire = (r: { onFire?: boolean }) => (r.onFire ? "🔥 " : "");
  const blocks: string[] = [];

  if (report.radar.length > 0) {
    const rows = report.radar.map(
      (r) =>
        `| ${fire(r)}${link(r.name, r.url)} | ${cell(r.sources.join("; "))} | ${cell(r.signals.join("; "))} | ` +
        `${summary(r)} |`,
    );
    blocks.push(`## ${T.radarHeading}`, T.radarLegend, `${T.radarHeader}\n${rows.join("\n")}`);
  }

  for (const { category, rows } of report.categories) {
    const lines = rows.map(
      (r) =>
        `| ${fire(r)}${link(r.fullName, r.url)} | ${cell(r.language || "—")} | ${cell(r.starsCell)} | ${summary(r)} |`,
    );
    blocks.push(`## ${T.categoryTitles[category]}`, `${T.categoryHeader}\n${lines.join("\n")}`);
  }

  return blocks.join("\n\n");
}

/**
 * The policy report's tables, one `##` section per jurisdiction with items, in
 * POLICY_REPORT.headings order, then News & commentary (news-feed items), then
 * Coming up. Each
 * row shows the summary for its own number (`n`, set by fetchPolicyData).
 * Date, source, title and stage come from the data, never the model.
 */
export function renderPolicyTable(
  items: Numbered<PolicyItem>[],
  summaries: Map<number, string>,
  /** The rendered Coming up section, which goes last, after the news. */
  deadlines = "",
): string {
  const lead = (it: PolicyItem) =>
    `| ${it.published.slice(0, 10)} | ${cell(it.source)} | [${policyTitleLabel(it.title)}](${cell(it.link)}) | `;
  const sections = Object.entries(POLICY_REPORT.headings).map(([jurisdiction, heading]) => {
    const rows = items
      .filter((it) => !it.news && it.jurisdiction === jurisdiction)
      .map((it) => `${lead(it)}${cell(it.stage || "—")} | ${cell(summaryText(summaries, it))} |`);
    return rows.length ? `## ${heading}\n\n${POLICY_REPORT.tableHeader}\n${rows.join("\n")}` : "";
  });
  const newsRows = items
    .filter((it) => it.news)
    .map((it) => `${lead(it)}${cell(summaryText(summaries, it))} |`);
  if (newsRows.length) {
    sections.push(
      `## ${POLICY_REPORT.newsHeading}\n\n${POLICY_REPORT.newsTableHeader}\n${newsRows.join("\n")}`,
    );
  }
  sections.push(deadlines);
  return sections.filter(Boolean).join("\n\n");
}

/**
 * A vendor item's link text without the date its title opens with: Snowflake titles its notes
 * "October 23, 2026: …" or "Oct 26, 2026: …", which the Date column already shows. The stored
 * title keeps it: title + date is the item's state key.
 */
export const vendorTitleLabel = (title: string): string =>
  policyTitleLabel(title.replace(/^(?:[A-Z][a-z]+\.? \d{1,2}, \d{4}|\d{4}-\d{2}-\d{2}):\s*/, ""));

/**
 * The data report's Releases this week table; each row's summary by its own
 * number (after the vendor rows), else its release notes, truncated. Empty
 * when there are no rows.
 */
export function renderReleaseTable(rows: Numbered<ReleaseRow>[], summaries: Map<number, string>): string {
  if (!rows.length) return "";
  const lines = rows.map(({ n, project, release }) => {
    const summary = summaryText(summaries, {
      n,
      description: releaseNotes(release.body, RELEASE_BODY_CHARS),
    });
    return (
      `| [${cell(project.name)}](https://github.com/${project.repo}) | ` +
      `[${cell(release.tag_name)}](https://github.com/${project.repo}/releases/tag/${encodeURIComponent(release.tag_name)}) | ` +
      `${release.published_at.slice(0, 10)} | ${cell(summary)} |`
    );
  });
  return `${DATA_REPORT.releasesTableHeader}\n${lines.join("\n")}`;
}

/**
 * The data report's Action required section: the open end dates (on or after
 * `dateStr`), nearest first. Empty when none is open.
 */
export function renderVendorActions(actions: Record<string, VendorAction>, dateStr: string): string {
  const rows = Object.values(actions)
    .filter((a) => a.date >= dateStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
    .map(
      (a) =>
        `| ${a.date} | ${cell(a.source)} | [${vendorTitleLabel(a.title)}](${cell(a.link)}) | ${cell(a.summary ?? "—")} |`,
    );
  return rows.length
    ? `## ${DATA_REPORT.actionHeading}\n\n${DATA_REPORT.actionTableHeader}\n${rows.join("\n")}`
    : "";
}

/**
 * The data report's vendor tables, one per vendor section with items. Each row
 * shows the summary for its own number (`n`, set by selectVendorItems).
 * Date, source, title and the ⚠️/🤖 markers come from the data, never the model.
 */
export function renderVendorTables(
  items: Numbered<KeptVendorItem>[],
  summaries: Map<number, string>,
  /** Over the cap: one line of links under the section's table, no summaries. */
  alsoNew: KeptVendorItem[] = [],
): Partial<Record<VendorSection, string>> {
  const tables: Partial<Record<VendorSection, string>> = {};
  for (const section of VENDOR_SECTIONS) {
    const links = alsoNew
      .filter((it) => vendorSection(it.vendor) === section)
      .map((it) => `[${vendorTitleLabel(it.title)}](${it.link})`);
    const also = links.length ? `*${DATA_REPORT.alsoNew}* ${links.join(" · ")}` : "";
    // Deprecations first, then newest first (undated last); a row keeps its number, so its summary follows it.
    const sectionItems = items
      .filter((it) => vendorSection(it.vendor) === section)
      .sort(
        (a, b) => Number(b.deprecation) - Number(a.deprecation) || (b.date || "").localeCompare(a.date || ""),
      );
    const oneSource = new Set(sectionItems.map((it) => it.source)).size === 1;
    const rows = sectionItems.map(
      (it) =>
        `| ${it.date || "—"} | ${oneSource ? "" : `${cell(it.source)} | `}` +
        `${it.deprecation ? `${DATA_REPORT.deprecationMarker} ` : ""}${it.aiInData ? `${DATA_REPORT.aiMarker} ` : ""}` +
        `[${vendorTitleLabel(it.title)}](${cell(it.link)}) | ` +
        `${cell(summaryText(summaries, it))} |`,
    );
    const header = oneSource ? DATA_REPORT.vendorTableHeaderOneSource : DATA_REPORT.vendorTableHeader;
    const table = rows.length ? `${header}\n${rows.join("\n")}` : "";
    if (table || also) tables[section] = [table, also].filter(Boolean).join("\n\n");
  }
  return tables;
}

/**
 * A story's link: its title, or for a story linking a GitHub repo the title with the repo as the
 * link text, so the link reads what it opens ("Show HN: Agentsh" linked microsoft/Agensh, 2026-10-26).
 */
function storyLink(r: Pick<StoryRow, "title" | "url">): string {
  const repo = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i.exec(r.url)?.[1];
  return repo ? `${cell(r.title)} ([${cell(repo)}](${cell(r.url)}))` : `[${cell(r.title)}](${cell(r.url)})`;
}

/**
 * A page's Spotted section (or Trends' Most discussed, under `heading`): each
 * story linked to its article, its discussion linked with its counts, and the
 * summary for its own number (else its description, truncated). Empty when
 * the page has no rows.
 */
export function renderSpottedTable(
  rows: StoryRow[],
  summaries: Map<number, string>,
  heading: string = SPOTTED.heading,
): string {
  if (!rows.length) return "";
  const lines = rows.map(
    (r) =>
      `| ${storyLink(r)} | ${SPOTTED.sources[r.source]} | ` +
      `[${SPOTTED.counts(r.source, r.points, r.comments)}](${cell(r.discussionUrl)}) | ` +
      `${cell(summaryText(summaries, { n: r.n, description: r.description ?? "" }))} |`,
  );
  return `## ${heading}\n\n${SPOTTED.tableHeader}\n${lines.join("\n")}`;
}

/**
 * The data report's News & discussion section: each community post linked, its feed, its summary by
 * its own number (else its description, truncated). "" without rows.
 */
export function renderCommunityTable(rows: CommunityRow[], summaries: Map<number, string>): string {
  if (!rows.length) return "";
  const lines = rows.map(
    (r) =>
      `| ${r.date} | [${cell(r.title)}](${cell(r.url)}) | ${cell(r.source)} | ` +
      `${cell(summaryText(summaries, { n: r.n, description: r.description }))} |`,
  );
  return `## ${DATA_REPORT.communityHeading}\n\n${DATA_REPORT.communityTableHeader}\n${lines.join("\n")}`;
}

/** Trends' Research section: each paper linked, its summary by its own number (else its abstract, truncated). */
export function renderResearchTable(
  papers: Numbered<ResearchPaper>[],
  summaries: Map<number, string>,
): string {
  if (!papers.length) return "";
  const T = TRENDS_REPORT;
  const lines = papers.map(
    (p) =>
      `| [${cell(p.title)}](${cell(p.url)}) | ${cell(summaryText(summaries, { n: p.n, description: p.abstract }))} |`,
  );
  return `## ${T.researchHeading}\n\n${T.researchTableHeader}\n${lines.join("\n")}`;
}

/**
 * The config.yml section a trending category fits. `infra` is sandboxes,
 * session multiplexers and context tools, so harnesses, frameworks and
 * multi-agent systems (ruflo, paperclip on 2026-10-26) fit none, nor do Other
 * Agents (a job-search bot, a vulnerability scanner on 2026-10-19).
 */
const CANDIDATE_SECTION: Partial<Record<Category, AgentSectionKey>> = {
  coding_agent: "agents",
  agent_tooling: "infra",
};

/**
 * Trends' Candidates to track: the 🔥 GitHub repos in no config.yml section
 * (`tracked`, compared case-insensitively), linked and grouped by the section
 * their category fits, then those that fit none. The config.yml lines are for
 * the maintainer, so they sit collapsed below. Empty when there are none.
 */
export function renderCandidates(
  candidates: { fullName: string; category: Category }[],
  tracked: RepoConfig[],
): string {
  const T = TRENDS_REPORT;
  const known = new Set(tracked.map((r) => r.repo.toLowerCase()));
  const fresh = candidates.filter((c) => !known.has(c.fullName.toLowerCase()));
  const reposOf = (key: AgentSectionKey | undefined) => [
    ...new Set(fresh.filter((c) => CANDIDATE_SECTION[c.category] === key).map((c) => c.fullName)),
  ];
  const links = (repos: string[]) => repos.map((r) => `[${r}](https://github.com/${r})`).join(", ");
  const groups = AGENT_SECTION_KEYS.map((key) => ({ key, repos: reposOf(key) })).filter(
    (g) => g.repos.length,
  );
  const unmatched = reposOf(undefined);
  if (!groups.length && !unmatched.length) return "";
  const list = [
    ...groups.map((g) => `- ${T.candidatesSection(g.key)} ${links(g.repos)}`),
    ...(unmatched.length ? [`- ${T.candidatesNoSection} ${links(unmatched)}`] : []),
  ].join("\n");
  const yaml = groups.map((g) => {
    const entries = g.repos.map((repo) => {
      const name = repo.split("/")[1] ?? repo;
      return `    - id: ${name.toLowerCase()}\n      repo: ${repo}\n      name: ${name}`;
    });
    return `${T.candidatesSection(g.key)}\n\n\`\`\`yaml\n${entries.join("\n")}\n\`\`\``;
  });
  // The blank line after </summary> lets the Markdown inside <details> render.
  const details = yaml.length
    ? `\n\n<details><summary>${T.candidatesConfig}</summary>\n\n${yaml.join("\n\n")}\n\n</details>`
    : "";
  return `## ${T.candidatesHeading}\n\n${T.candidatesIntro}\n\n${list}${details}`;
}

/**
 * Trends' OpenRouter usage, in code: on 2026-10-26 the model wrote "round out
 * the top five" after six models and picked "newcomers" by no rule. Ranks are
 * the rankings page's order; each model name links its OpenRouter page.
 */
export function renderOpenRouterUsage(
  models: OpenRouterModel[],
  date: string,
  /** The slugs, in rank order, that the run dated 7 days earlier saved; no Last week column without them. */
  lastWeek?: string[],
): string {
  if (!models.length) return "";
  const T = TRENDS_REPORT;
  const lastWeekCell = (slug: string) => {
    if (!lastWeek) return "";
    const rank = lastWeek.indexOf(slug);
    return ` ${rank === -1 ? T.openRouterNewcomer : rank + 1} |`;
  };
  const rows = models.map(
    (m, i) =>
      `| ${i + 1} | [${cell(m.slug)}](https://openrouter.ai/${m.slug}) | ${formatTokens(m.tokens)} |${lastWeekCell(m.slug)}`,
  );
  const header = lastWeek ? T.openRouterHeaderLastWeek : T.openRouterHeader;
  return `## ${T.openRouterHeading}\n\n${T.openRouterIntro(date, lastWeek !== undefined)}\n\n${header}\n${rows.join("\n")}`;
}

/**
 * A Hugging Face row's summary cell: the model's line, else its task and size. A "—" line
 * counts as none: the prompt allows it for an unknown task even when the size is known.
 */
export function hfSummaryText(summaries: Map<number, string>, r: Numbered<HfRow>): string {
  const line = summaries.get(r.n);
  return line && line !== "—" ? line : summaryText(new Map(), { n: r.n, description: hfDescription(r) });
}

/**
 * Trends' Hugging Face table, in code like OpenRouter usage: the rank is the
 * row's place in the Hub's order, 🔥 a row also on the page dated 7 days
 * earlier (`lastWeek`: `lastWeekKeys`), quantised copies follow the original's
 * link. The model writes only the summary, else the row shows its task and size.
 */
export function renderHfTable(
  rows: Numbered<HfRow>[],
  summaries: Map<number, string>,
  lastWeek: Set<string> = new Set(),
): string {
  if (!rows.length) return "";
  const T = TRENDS_REPORT;
  const lines = rows.map((r, i) => {
    const fire = hfKeys(r).some((k) => lastWeek.has(k)) ? "🔥 " : "";
    const variants = r.variants.length
      ? ` (+ ${r.variants.map((v) => `[${cell(v.id)}](${cell(v.url)})`).join(", ")})`
      : "";
    return (
      `| ${i + 1} | ${fire}[${cell(r.id)}](${cell(r.url)})${variants} | ${r.likes.toLocaleString("en-US")} | ` +
      `${r.downloads.toLocaleString("en-US")} | ${cell(hfSummaryText(summaries, r))} |`
    );
  });
  return `## ${T.hfHeading}\n\n${T.hfIntro}\n\n${T.hfHeader}\n${lines.join("\n")}`;
}

/** The models page's Lab announcements rows, each summary by its own number (else the page text, truncated, or "—"). */
export function renderLabPostsTable(posts: Numbered<LabPost>[], summaries: Map<number, string>): string {
  const lines = posts.map(
    (p) =>
      `| ${p.lastmod.slice(0, 10) || "—"} | ${MODELS_PAGE.labs[p.site]} | [${policyTitleLabel(p.title || p.url)}](${cell(p.url)}) | ` +
      `${cell(summaryText(summaries, { n: p.n, description: p.content }))} |`,
  );
  return `${MODELS_PAGE.labTableHeader}\n${lines.join("\n")}`;
}

/** A context length as a table cell: 262144 → "262K", 1048576 → "1M". */
function contextCell(tokens: number): string {
  if (!tokens) return "—";
  return tokens >= 1e6 ? `${Number((tokens / 1e6).toFixed(1))}M` : `${Math.round(tokens / 1e3)}K`;
}

/** The models page's New on OpenRouter rows, each summary by its own number (else the description, truncated). */
export function renderNewModelsTable(
  models: Numbered<OpenRouterNewModel>[],
  summaries: Map<number, string>,
): string {
  const lines = models.map(
    (m) =>
      `| [${cell(m.name)}](https://openrouter.ai/${m.id}) \`${m.id}\` | ${m.created} | ${contextCell(m.contextLength)} | ` +
      `${cell(summaryText(summaries, m))} |`,
  );
  return `${MODELS_PAGE.modelsTableHeader}\n${lines.join("\n")}`;
}
