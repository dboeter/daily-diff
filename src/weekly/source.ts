/**
 * Weekly Diff's source: the items the week's pages showed, each with the text its source gave.
 *
 * The article is written from source texts, not from the pages' row summaries: in the experiment
 * of 2026-11-16 (`.scratch/weekly-diff/`) an article written from the pages repeated a summary's
 * error ("the default model" for "the default Fable model"). So a release's notes and a hot
 * issue's body come whole from GitHub, cleaned as the pipeline cleans them, and every other item
 * brings the text `candidates.json` saved. No model-written text goes in, except the Trends row
 * summaries, which stand next to code-written figures.
 */

import type { GitHubItem } from "../core/github.ts";
import {
  DATA_REPORT,
  FOOTER,
  OVERVIEW,
  POLICY_REPORT,
  REPORTS,
  SECTIONS,
  SECURITY,
  TRENDS_REPORT,
} from "../core/strings.ts";
import { type Candidate, MAX_TEXT_CHARS } from "../reports/candidates.ts";
import { formatItem, releaseNotes } from "../reports/prompts.ts";

/** One day of the week: what it fetched and the pages it published, by report id. */
export interface WeekDay {
  date: string;
  candidates: Candidate[];
  pages: Record<string, string>;
}

/** A GitHub API object by its path (`repos/<repo>/releases/tags/<tag>`); undefined when the call failed. */
export type GitHubFetch = (apiPath: string) => Promise<unknown>;

export interface WeekSource {
  text: string;
  /** The items listed: each shown item once. */
  items: number;
}

/** A release's notes and an issue's body: enough for all but the longest (20 of 41 releases were cut on 2026-11-16). */
const RELEASE_CHARS = 6000;
const ISSUE_CHARS = 3000;
/** Closes a text that is not whole, so the writer states nothing about the missing part. */
export const CUT_MARK = " […cut]";

/** The pages whose rows show the week's items, with the name each has in the source. */
const PAGES: Record<string, string> = {
  "ai-agents": REPORTS["ai-agents"].name,
  "ai-models": REPORTS["ai-models"].name,
  "ai-policy": REPORTS["ai-policy"].name,
  "ai-data": REPORTS["ai-data"].name,
  "ai-trends": `${REPORTS["ai-trends"].name} (weekly tables)`,
};
/** The reports the source is read from. */
export const WEEK_PAGE_IDS = Object.keys(PAGES);
const CANDIDATE_PAGES: Record<string, string> = { ...PAGES, spotted: "Community stories" };
/** Model-written prose over the rows, and the maintainer's config list: not a source. "Across platforms" is in the pages up to 2026-11-15. */
const CUT_SECTIONS = new Set<string>([
  SECTIONS.highlights,
  SECTIONS.signals,
  "Across platforms",
  TRENDS_REPORT.candidatesHeading,
]);
/** The same under a `###`: the Skills section's model-written conclusion. */
const CUT_SUBSECTIONS = new Set(["Takeaway"]);
/** Row markers the digest's code sets: a security event, a deprecation or behavior change, an AI feature in a data platform. */
const MARKERS = [SECURITY.marker.trim(), DATA_REPORT.deprecationMarker, DATA_REPORT.aiMarker];

/** A line of a day's pages outside the cut sections, with the headings it stands under. */
interface PageLine {
  page: string;
  h2: string;
  h3: string;
  line: string;
}

/** A page's sections without its H1, report bar, meta line, rules, footer and the cut sections. */
export function pageRows(markdown: string): string {
  const kept: string[] = [];
  let cut = false;
  let cutSub = false;
  for (const line of markdown.split("\n")) {
    const heading = /^## (.+)$/.exec(line);
    const subheading = /^### (.+)$/.exec(line);
    if (heading) [cut, cutSub] = [CUT_SECTIONS.has(heading[1]!.trim()), false];
    if (subheading) cutSub = CUT_SUBSECTIONS.has(subheading[1]!.trim());
    if (cut || cutSub) continue;
    if (
      /^# /.test(line) ||
      line.startsWith(`[${OVERVIEW.emoji} ${OVERVIEW.name}]`) ||
      /^> /.test(line) ||
      line.trim() === "---"
    )
      continue;
    if (line.startsWith(`*${FOOTER.autoGen}`)) continue;
    kept.push(line);
  }
  return kept
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pageLines(day: WeekDay): PageLine[] {
  const lines: PageLine[] = [];
  for (const id of Object.keys(PAGES)) {
    const markdown = day.pages[id];
    if (!markdown) continue;
    let h2 = "";
    let h3 = "";
    for (const line of markdown.split("\n")) {
      const heading = /^(##|###) (.+)$/.exec(line);
      if (heading?.[1] === "##") [h2, h3] = [heading[2]!.trim(), ""];
      else if (heading) h3 = heading[2]!.trim();
      else if (!CUT_SECTIONS.has(h2)) lines.push({ page: id, h2, h3, line });
    }
  }
  return lines;
}

const letters = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * The line that shows a candidate: it links the candidate (or its discussion page). BigQuery's
 * notes of one day share a link, so when `byTitle` is set the line must also hold the
 * candidate's title.
 */
function shownOn(lines: PageLine[], c: Candidate, byTitle: boolean): PageLine | undefined {
  const links = [c.url, c.discussion]
    .filter((url): url is string => url !== undefined)
    .map((url) => `](${url})`);
  const title = letters(c.title).slice(0, 30);
  return lines.find(
    (l) => links.some((link) => l.line.includes(link)) && (!byTitle || letters(l.line).includes(title)),
  );
}

/** The Stage cell of an AI Policy row: code-rendered, and not in `candidates.json`. */
function policyStage(row: string): string {
  const cells = row.replace(/^\|\s*|\s*\|$/g, "").split(/\s+\|\s+/);
  const stage = cells.length === 5 ? cells[3]! : "";
  return stage === "—" ? "" : stage;
}

/** What the digest's code put on the item's row: its section, markers, a story's counts, a hot issue's totals. */
function digestFacts(shown: PageLine, c: Candidate): string {
  const { line } = shown;
  // The first of the item's links on the row: a story's title link comes before its counts link.
  const at = Math.min(
    ...[c.url, c.discussion].flatMap((url) =>
      url && line.includes(`](${url})`) ? [line.indexOf(`](${url})`)] : [],
    ),
  );
  const before = line.slice(0, at);
  const lead = before.slice(Math.max(0, before.lastIndexOf("[") - 8), before.lastIndexOf("["));
  const stage = c.kind === "policy-item" ? policyStage(line) : "";
  const facts = [
    `shown under ${[PAGES[shown.page], shown.h2, shown.h3].filter(Boolean).join(" › ")}`,
    ...MARKERS.filter((m) => lead.includes(m)),
    /\[(\d[^\]]*?(?:comments?|points?|reactions?))\]/.exec(line)?.[1],
    c.kind === "hot-issue" && /\(([^()]*(?:comments?|👍)[^()]*)\)\s*$/.exec(line)?.[1],
    stage && `stage: ${stage}`,
  ];
  return facts.filter(Boolean).join(" · ");
}

/** A `## <heading>` section of a page, heading included; "" when the page has none. */
function section(markdown: string, heading: string): string {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return "";
  const end = lines.findIndex((line, i) => i > start && (/^## /.test(line) || line.trim() === "---"));
  return lines
    .slice(start, end === -1 ? undefined : end)
    .join("\n")
    .trim();
}

/** On one line, as `candidates.json` saves a text: release notes carry `###` headings, which are the items' own delimiter here. */
const marked = (text: string, cut: boolean): string =>
  text.replace(/\s+/g, " ").trim() + (cut ? CUT_MARK : "");

/** One item per kind, link and title: BigQuery's notes of one day share a link. */
const itemKey = (c: Candidate): string => `${c.kind} ${c.url} ${letters(c.title).slice(0, 30)}`;

/** The item's source text: a release's notes and a hot issue's body whole from GitHub, else the saved text. */
async function sourceText(
  c: Candidate,
  originals: Map<string, Candidate>,
  fetchGitHub: GitHubFetch,
): Promise<string> {
  const tag = /\/releases\/tag\/(.+)$/.exec(c.url)?.[1];
  if (c.kind === "release" && tag) {
    const release = (await fetchGitHub(`repos/${c.source}/releases/tags/${tag}`)) as
      { body: string | null } | undefined;
    if (release) {
      const notes = releaseNotes(release.body, RELEASE_CHARS);
      return marked(notes, releaseNotes(release.body, Number.MAX_SAFE_INTEGER).length > notes.length);
    }
  }
  const issue = /\/issues\/(\d+)$/.exec(c.url)?.[1];
  if (c.kind === "hot-issue" && issue) {
    const item = (await fetchGitHub(`repos/${c.source}/issues/${issue}`)) as GitHubItem | undefined;
    if (item) {
      // `formatItem` is the pipeline's only door to its issue-body cleaner; the body follows its last label.
      const body = (chars: number) => formatItem(item, chars).split("Summary: ").slice(1).join("Summary: ");
      return marked(body(ISSUE_CHARS), body(Number.MAX_SAFE_INTEGER).length > body(ISSUE_CHARS).length);
    }
  }
  if (c.kind === "open-action") {
    // An open Action required row carries the digest's own summary; the note it came from has the vendor's text.
    const original = originals.get(itemKey({ ...c, kind: "vendor-note" }));
    if (!original) return `(the digest's own summary of this note; the vendor's text is not saved) ${c.text}`;
    return marked(original.text, original.text.length >= MAX_TEXT_CHARS);
  }
  return marked(c.text.trim() || "(the source gave no text)", c.text.length >= MAX_TEXT_CHARS);
}

/**
 * The items the week's pages showed, each once, on the first day it was shown, with its source
 * text and the digest's code-written facts; then the weekly Trends tables and AI Policy's latest
 * Coming up, which code renders. A vendor note that is also an open Action required row is
 * listed once, as the note, with the row's end date.
 *
 * `days` are the week's days, oldest first. `vendorNotes` are the vendor notes of every saved
 * day, oldest first: the source text of an Action required row an earlier week opened.
 */
export async function buildWeekSource(
  days: WeekDay[],
  vendorNotes: Candidate[],
  fetchGitHub: GitHubFetch,
): Promise<WeekSource> {
  const originals = new Map<string, Candidate>();
  for (const c of vendorNotes) {
    if (c.kind === "vendor-note" && !originals.has(itemKey(c))) originals.set(itemKey(c), c);
  }

  const shown: { day: string; c: Candidate; on: PageLine }[] = [];
  const seen = new Set<string>();
  for (const day of days) {
    const lines = pageLines(day);
    const perLink = new Map<string, number>();
    for (const c of day.candidates)
      perLink.set(`${c.kind} ${c.url}`, (perLink.get(`${c.kind} ${c.url}`) ?? 0) + 1);
    for (const c of day.candidates) {
      const on = shownOn(lines, c, perLink.get(`${c.kind} ${c.url}`)! > 1);
      if (!on || seen.has(itemKey(c))) continue;
      seen.add(itemKey(c));
      shown.push({ day: day.date, c, on });
    }
  }

  const ends = new Map(
    shown
      .filter((s) => s.c.kind === "open-action")
      .map((s) => [itemKey({ ...s.c, kind: "vendor-note" }), s.c.ends]),
  );
  const notes = new Set(shown.filter((s) => s.c.kind === "vendor-note").map((s) => itemKey(s.c)));
  const blocks: string[] = [];
  let items = 0;
  let comingUp = "";
  for (const day of days) {
    for (const [id, name] of Object.entries(CANDIDATE_PAGES)) {
      const listed = shown
        .filter((s) => s.day === day.date && s.c.page === id)
        .filter((s) => s.c.kind !== "open-action" || !notes.has(itemKey({ ...s.c, kind: "vendor-note" })));
      const texts: string[] = [];
      // One GitHub call at a time: the weekly run is the one closest to the hourly API limit.
      for (const { c, on } of listed) {
        const end = c.ends ?? ends.get(itemKey(c));
        const facts = [
          `kind: ${c.kind}`,
          `source: ${c.source}`,
          c.published && `published: ${c.published.slice(0, 10)}`,
          end && `ends: ${end}`,
          `link: ${c.url}`,
          c.discussion && `discussion: ${c.discussion}`,
        ].filter(Boolean);
        texts.push(
          `### ${c.title.trim()}\n\n${facts.join(" · ")}\ndigest: ${digestFacts(on, c)}\ntext: ${await sourceText(c, originals, fetchGitHub)}`,
        );
      }
      items += texts.length;
      if (texts.length) blocks.push(`===== ${day.date} · ${name} =====\n\n${texts.join("\n\n")}`);
    }
    const trends = day.pages["ai-trends"];
    if (trends) blocks.push(`===== ${day.date} · ${PAGES["ai-trends"]} =====\n\n${pageRows(trends)}`);
    const upcoming = section(day.pages["ai-policy"] ?? "", POLICY_REPORT.deadlinesHeading);
    if (upcoming) comingUp = `===== ${day.date} · AI Policy: dates (code-rendered) =====\n\n${upcoming}`;
  }
  if (comingUp) blocks.push(comingUp);
  return { text: blocks.join("\n\n"), items };
}
