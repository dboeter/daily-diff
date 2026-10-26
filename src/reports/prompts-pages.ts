/**
 * Page prompts: the row summaries of Trends (its Hugging Face table included),
 * the models page, AI Policy, the data report and Spotted; the prose of Trends,
 * AI Policy and the data report; and the highlights.json prompt. The agents and
 * models pages' Highlights, the repo sections and the shared prompt rules are in
 * prompts.ts.
 */

import type { LabPost } from "../sources/labs.ts";
import type { summaryRows } from "../trending/rank.ts";
import type { OpenRouterData, OpenRouterNewModel } from "../sources/openrouter.ts";
import { DATA_REPORT, GOING_AWAY, MODELS_PAGE, MSG, SECTIONS, SPOTTED } from "../core/strings.ts";
import { TABLES_MARKER, rowList, summaryLine, summaryOutputRule, type Numbered } from "./summarized-table.ts";
import {
  goingAwayRule,
  HIGHLIGHTS_PICK_RULE,
  IDENTIFIER_RULE,
  RELEASE_ORDER,
  NO_TITLE_RULE,
  RELEASE_BODY_CHARS,
  releaseNotes,
  sourceFidelityRules,
} from "./prompts.ts";
import type { ReleaseRow } from "./pages.ts";
import type { Deadline } from "../core/report-state.ts";
import { formatParameters, type HfData, type HfRow } from "../sources/huggingface.ts";
import type { ResearchPaper } from "../trending/research.ts";
import type { PolicyItem } from "../policy/items.ts";
import type { KeptVendorItem } from "../data/relevance.ts";
import { signHighlight } from "./markdown.ts";
import { siteOf, type StoryRow } from "../spotted/pool.ts";

/** Which sources Trends' Models section covers: no call when neither has data. */
export function modelSources(hf: HfData, openrouter: OpenRouterData) {
  return { hasHf: hf.fetchSuccess, hasOpenRouter: openrouter.topModels.length > 0 };
}

/**
 * Weekly Trends, call 1 of the first round: one 2-sentence summary per
 * numbered Radar and category table row. The rows were selected and ranked in
 * code; parseRowSummaries reads the reply. A row without a description gets
 * `—`: a sentence from the name alone only restated the row ("Helios DeepSeek
 * fleet is a newly listed project on OpenRouter", 2026-10-23).
 */
export function buildTrendingSummariesPrompt(rows: ReturnType<typeof summaryRows>, dateStr: string): string {
  const list = rowList(
    rows,
    (r) => `${r.name} — ${r.description || "(no description)"}${r.facts ? ` — ${r.facts}` : ""}`,
  );
  return `You are a technical analyst covering AI coding tools, agents and agent harnesses. Below are ${rows.length} numbered projects and tools from the weekly trends report, week ending ${dateStr}, each with its description and where it was found.

${list}

${summaryLine("1-2 sentences")} — what it is, then one fact from the description that sets it apart from similar tools.
- Ground every sentence only in the given description. Do not invent features, users, releases or numbers.
- No "It matters because" or "why it matters" clause, and no sentence that restates the first in other words.
- ${IDENTIFIER_RULE}
- No star, gain, download, token or rank figures: the table shows them next to the summary.
- If the description is empty, write \`N: —\`: the table shows the name and where it was found.
${summaryOutputRule(rows.length)}
- English.
`;
}

/**
 * Weekly Trends, the second round: Highlights and Signals around the page
 * rendered from the first round's calls. The model places TABLES_MARKER where
 * spliceTables inserts the page. Signals rest on row figures: the row summaries are
 * written from descriptions without figures, so "summaries support it" let the model
 * build trends from shared wording (forced weekly run, 2026-10-27).
 */
export function buildTrendsProsePrompt(
  pageMd: string,
  dateStr: string,
  /** Rows with neither a summary nor a description ("—"): the page says nothing about them, so no Highlight. */
  noSummaryNames: string[] = [],
): string {
  return `You are the editor of a weekly trends report for AI practitioners: agents and coding tools, models, research and the community's most discussed stories. Below is this week's page, week ending ${dateStr}. Its tables were selected and ranked in code from GitHub Trending (weekly), GitHub topic search, OpenRouter app and model rankings, npm downloads, Hugging Face, arXiv (ranked by relevance) and Hacker News, Lobste.rs and Dev.to. 🆕 in a Signal column means created or listed in the last 14 days; 🔥 before a name means the item was also in last week's report.

${pageMd || "(The page has no sections this week.)"}

---

Write only these parts, in this order:

1. \`## ${SECTIONS.highlights}\` — 1-3 bullets on the most noteworthy items of the week for a data or AI engineer, most relevant first, across the page's sections.
2. The line \`${TABLES_MARKER}\` exactly once, on its own line. The page is inserted there.
3. \`## ${SECTIONS.signals}\` — 100-300 words, 2-4 short paragraphs: what the tables' figures show, such as the largest star gains, rank moves against last week's page and the usage leaders. This is the one place for trend claims, and each Signal:
   - links the rows it rests on, and every name and figure in it appears in those rows;
   - rests on those rows' figures (stars gained, %, rank, tokens, downloads, likes), never on what their summaries, descriptions or titles have in common: three tools that all support Codex are not a signal;
   - counts a share in one table, from its rows as shown ("4 of the 19 rows", never "half the top 20");
   - uses no trend verb the figures cannot show (dominates, is accelerating, is converging): one snapshot shows no change over time.
   The Research table has no figures, so it gives no Signal. Fewer Signals beat an unsupported one.

Rules:
- ${NO_TITLE_RULE}
- In ${SECTIONS.highlights}: ${goingAwayRule("bullet")} ${HIGHLIGHTS_PICK_RULE}${noSummaryNames.length ? `\n- These rows have no summary or description: no Highlight for them. ${noSummaryNames.map((t) => `"${t}"`).join(", ")}` : ""}
- Do not reproduce or alter the tables, and write no other sections.
- Each table gives its window in its intro line, and a claim keeps it, in Highlights too: OpenRouter usage is one day's snapshot, so say "on <its date>", never "this week".
- Base every claim on the page. It shows descriptions, summaries and counts only, so do not describe releases, adoption or community reactions it does not show.
- Mention only items that appear on the page, and link every item you mention.
${sourceFidelityRules()}
- English, professional and concise.
`;
}

/**
 * Policy report, call 1 of 2: one 2-sentence summary per numbered table row.
 * The rows are the kept items, numbered by fetchPolicyData; parseRowSummaries reads the reply.
 */
export function buildPolicySummariesPrompt(
  items: Numbered<PolicyItem>[],
  dateStr: string,
  readerProfile: string,
): string {
  const list = rowList(
    items,
    (it) =>
      `${it.title} (${it.source}, ${it.published.slice(0, 10)}${it.stage ? `, stage: ${it.stage}` : ""}) — ${it.description || "(no description)"}`,
  );
  return `You are a policy analyst covering AI legislation, regulation and official guidance. The reader: ${readerProfile}

Below are ${items.length} numbered items from official sources and news & commentary outlets, new as of ${dateStr}, each with its source, date and text.

${list}

${summaryLine("2 sentences")} — what was published or decided, and what it means for organisations that deploy AI.
- Ground every sentence only in the given text. Do not invent obligations, dates, stages or legal status.
- If the text is empty, say only what the title shows.
${summaryOutputRule(items.length)}
- English.
`;
}

/**
 * Policy report, call 2 of 2: Highlights only, above the code-rendered
 * table, which spliceTables appends.
 */
export function buildPolicyProsePrompt(
  tableMd: string,
  dateStr: string,
  readerProfile: string,
  /**
   * Deadlines of items reported on earlier days, closing within a week. The
   * Coming up table is not in `tableMd`: given it as "new items", on
   * 2026-10-22 the model opened Highlights with two consultations reported a week earlier.
   */
  nearDeadlines: Deadline[] = [],
): string {
  const deadlineBlock = nearDeadlines.length
    ? `\nOpen deadlines of items reported on earlier days (not new today; you may mention one in a sentence, not as a highlight of its own):\n${nearDeadlines.map((d) => `- ${d.date}: [${d.title}](${d.link}) (${d.source})`).join("\n")}\n`
    : "";
  return `You are a policy analyst covering AI legislation, regulation and official guidance in the EU, the Netherlands and the US. The reader: ${readerProfile}

Below is today's table of new items from official sources and news & commentary outlets, ${dateStr}; the Summary column holds summaries of each item.

${tableMd}
${deadlineBlock}
---

Write only \`## ${SECTIONS.highlights}\`: 2-4 sentences on the most consequential items today. The table goes below it.

Rules:
- ${NO_TITLE_RULE}
- Do not reproduce or alter the table.
- Base every claim on the table${nearDeadlines.length ? " or the open deadlines" : ""}. Do not invent obligations, dates, stages or legal status: a wrong legal status is worse than none.
- Mention only items that appear in the table${nearDeadlines.length ? " or the open deadlines" : ""}, and link every item you mention.
${sourceFidelityRules()}
- English, professional and concise.
`;
}

/** A story's line in a summaries prompt: title, source, site, counts and its description. */
const storyLine = (r: StoryRow): string =>
  `${r.title} (${SPOTTED.sources[r.source]}, ${siteOf(r.url) || r.url}, ${SPOTTED.counts(r.source, r.points, r.comments)}) — ${r.description ? `description: ${r.description}` : "(no description)"}`;

/**
 * The story summary rules (Spotted and Trends' Most discussed rows, one call). A story
 * without a description gets `—`: a sentence on its title and site only restated
 * the row ("The story titled 'X' is from openai.com", 2026-10-23). Told to take 2 sentences from
 * the description, the model copied it whole (every Spotted row on 2026-10-25 and 10-26).
 */
const STORY_RULES = `- A story with a description: in your own words, what it is about, with one concrete fact from the description (a number, a named tool, a finding). Never copy the description: the reader can open the link. Without one: write \`N: —\`; the table shows its title and site.
- Describe no comment thread or community reaction, and no claim, method or result a story's title and description do not state.
- A first-person story ("I tested…", "We built…") is the author's: say who did it ("the author tested…").`;

/**
 * Spotted, one call for every page's rows and Trends' Most discussed rows: one
 * summary per numbered story. selectSpotted numbers the Spotted rows, main() the
 * Most discussed rows after them; parseRowSummaries reads the reply.
 * The model sees titles, sites, counts and descriptions, never the article or
 * the thread: on 2026-10-19 summaries of HN titles alone guessed what an article argues.
 */
export function buildSpottedSummariesPrompt(rows: StoryRow[], dateStr: string): string {
  return `You summarize community stories (Hacker News, Lobste.rs, Dev.to) for AI and data practitioners.

Below are ${rows.length} numbered stories as of ${dateStr}, each with its source, the linked site, its counts and, where given, a description (the linked page's own for Hacker News, the author's for Dev.to). You have read neither the article nor the comment thread.

${rowList(rows, storyLine)}

${summaryLine("1-2 sentences")} — what the story is about.
${STORY_RULES}
${summaryOutputRule(rows.length)}
- English.
`;
}

/**
 * Weekly Trends, one call for the Research rows. The Most discussed rows go
 * through the Spotted call (buildSpottedSummariesPrompt). parseRowSummaries reads the reply.
 */
export function buildTrendsSummariesPrompt(papers: Numbered<ResearchPaper>[], dateStr: string): string {
  return `You summarize research papers for AI practitioners.

Below are ${papers.length} numbered arXiv papers of the week ending ${dateStr}, each with its abstract (cut). You have not read the full papers.

${rowList(papers, (p) => `${p.title} (arXiv paper) — abstract: ${p.abstract}`)}

${summaryLine("1 sentence")}.
- Start with the paper's name (the short name before the colon, else the title): what it does, then its headline result, with the number when the abstract gives one. No claim, number or result the abstract does not state.
${summaryOutputRule(papers.length)}
- English.
`;
}

/**
 * The models page's one summaries call: its lab posts (numbered first) and its
 * newly listed models (numbered after them). parseRowSummaries reads the reply.
 * An OpenAI post has no page content: its title comes from the URL slug.
 */
export function buildModelsSummariesPrompt(
  posts: Numbered<LabPost>[],
  models: Numbered<OpenRouterNewModel>[],
  dateStr: string,
): string {
  const list = [
    rowList(
      posts,
      (p) =>
        `${p.title} (${MODELS_PAGE.labs[p.site]} post, ${p.url}) — ${p.content ? `page text: ${p.content}` : "(no page text)"}`,
    ),
    rowList(
      models,
      (m) =>
        `${m.name} (OpenRouter model \`${m.id}\`) — ${m.description ? `catalog description: ${m.description}` : "(no description)"}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
  const count = posts.length + models.length;
  return `You summarize AI lab announcements and newly listed models for AI practitioners.

Below are ${count} numbered items, new as of ${dateStr}: posts from Anthropic and OpenAI${models.length ? ", then models newly listed in OpenRouter's catalog" : ""}.

${list}

${summaryLine("1-2 sentences")}.
- A post with page text: 1-2 sentences taken from it, on what was announced and for whom.
- A post without page text: write \`N: —\`, unless its title says more than its URL does.
- A model: 1 sentence from its catalog description: what it is for, and what it takes in and gives back (text, images, audio) when the description says. Not its context length: the row shows it. Leave out its marketing claims (best, leading, state-of-the-art).
- Ground every sentence only in the given text. Do not invent versions, prices, dates or benchmarks.
- ${IDENTIFIER_RULE}
${summaryOutputRule(count)}
- English.
`;
}

/** The data report's reader, shared by its two vendor calls. */
const DATA_READER =
  "a data engineer at a consultancy whose clients run Databricks, Snowflake, Azure / Microsoft Fabric and GCP / BigQuery";

/**
 * Data report, vendor call 1 of 2: one summary per numbered vendor table row.
 * The rows are the kept vendor items, numbered by selectVendorItems; parseRowSummaries reads the reply.
 */
export function buildDataSummariesPrompt(
  items: Numbered<KeptVendorItem>[],
  dateStr: string,
  releases: Numbered<ReleaseRow>[] = [],
): string {
  const list = [
    rowList(
      items,
      (it) =>
        `${it.title} (${it.source}${it.date ? `, ${it.date}` : ""}${it.stage ? `, status: ${it.stage}` : ""}${it.deprecation ? ", deprecation or breaking change" : ""}) — ${it.description || "(no description)"}`,
    ),
    rowList(
      releases,
      (r) =>
        `${r.project.name} ${r.release.tag_name} (release, ${r.release.published_at.slice(0, 10)}) — ${r.release.announcement ? `Announcement: ${r.release.announcement} Notes: ` : ""}${releaseNotes(r.release.body, RELEASE_BODY_CHARS) || "(no release notes)"}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
  const count = items.length + releases.length;
  return `You summarize data platform release notes for ${DATA_READER}.

Below are ${count} numbered release notes and updates, new as of ${dateStr}, each with its source and text${releases.length ? "; the ones marked (release) are open-source project releases, with their release notes" : ""}.

${list}

${summaryLine("1-2 sentences")} — what the change enables, breaks or requires for client data platforms: a setting to turn on, a migration, a cloud, region or edition limit (for a deprecation or breaking change: what stops working or must be migrated, and by when).
- Do not repeat the title or its status words (generally available, preview, now available): the title is shown next to the summary.
- Ground every sentence only in the given text. Do not invent dates, versions, regions or availability.
- ${IDENTIFIER_RULE}
- When the text adds nothing beyond the title (or is empty), write \`N: —\` for that item.${releases.length ? `\n- For a release: its most important changes for users in 1 sentence, in this order: ${RELEASE_ORDER}; say so first when it is a major version (only a version x.0.0 is a major version). Notes are cut at ${RELEASE_BODY_CHARS} characters: summarize what they show, and never say they are cut.` : ""}
${summaryOutputRule(count)}
- English.
`;
}

/**
 * Data report, vendor call 2 of 2: Highlights before the report's sections
 * (code-rendered vendor tables plus the repo bodies) and Across platforms after
 * them, which buildDataReport splits at TABLES_MARKER. Highlights say what a
 * change means for clients (the tables already say what changed); Across
 * platforms compares one capability across vendors, or is left out.
 */
export function buildDataProsePrompt(
  sectionsMd: string,
  dateStr: string,
  /** Kept vendor rows under "Notable" significance or unsure of it (`minor`): in the tables, never a Highlight. */
  minorTitles: string[] = [],
): string {
  const parts = [
    `\`## ${SECTIONS.highlights}\` — 1-3 bullets, the most consequential changes today, deprecations, retirements and breaking changes first. Each bullet says who is affected (which client setup: e.g. Azure Databricks workspaces with the compliance security profile, Snowflake Native App providers, BigQuery users of AI functions), what to do when the row says or its change requires it (enable, migrate, test, plan for) and by when, if the row gives a date.`,
    `The line \`${TABLES_MARKER}\` exactly once, on its own line. The sections are inserted there.`,
    `\`## ${DATA_REPORT.acrossPlatforms}\` — 0-3 bullets, each one capability that moved on two or more platforms in the rows above (e.g. governance tagging on Snowflake and Databricks, AI functions in SQL on BigQuery and Snowflake), saying how they differ: GA or preview, which clouds, what each covers. Only rows in the sections count; say nothing about features they do not show. Leave this heading out when no capability moved on two platforms: no padding.`,
  ];
  return `You are the editor of a daily data engineering report for ${DATA_READER}.

Below are today's report sections, ${dateStr}: vendor release-note tables (⚠️ marks a deprecation, retirement or breaking change; 🤖 an AI feature in a data platform), the releases and hot issues of tracked open-source projects and, under Spotted, community stories about data engineering.

${sectionsMd}

---

Write only these parts, in this order:

${parts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Rules:
- ${NO_TITLE_RULE}
- In ${SECTIONS.highlights}: ${goingAwayRule("bullet")} ${HIGHLIGHTS_PICK_RULE}${minorTitles.length ? `\n- These rows are minor: no Highlight for them. ${minorTitles.map((t) => `"${t}"`).join(", ")}` : ""}
- Length: at most ~150 words for ${SECTIONS.highlights}, ~120 for ${DATA_REPORT.acrossPlatforms}.
- A major release in ${DATA_REPORT.releasesHeading} (a version x.0.0, or one whose summary names breaking changes) is a Highlights candidate: say who must test or migrate.
- Never restate a row: the reader sees the tables right below. A bullet that only says what changed, without who is affected and what to do, is left out.
- Write no links, URLs or other sections; name each item as the sections do. Dates only as the "by when" of a row that gives one.
- Name each item in at most one bullet of ${SECTIONS.highlights}; ${DATA_REPORT.acrossPlatforms} compares rows, so it may name a row again. Two rows that describe the same change (a release note and its behavior change bundle, a "coming soon" note and its GA note) are one item: mention it once.
- Base every claim on the sections. Do not invent versions, dates or availability.
${sourceFidelityRules()}
- English, professional and concise.
`;
}

// ---------------------------------------------------------------------------
// Highlights prompt — extracts structured highlights from finished reports
// for use in Telegram notifications.
// ---------------------------------------------------------------------------

export interface ReportHighlights {
  [reportId: string]: string[];
}

// Telegram rejects messages over 4096 chars (after HTML entity parsing). Up to
// 10 reports × HIGHLIGHTS_MAX_PER_REPORT × HIGHLIGHT_MAX_CHARS ≈ 2.8k, plus
// section labels, keeps the worst case under that limit.
const HIGHLIGHTS_MAX_PER_REPORT = 2;
const HIGHLIGHT_MAX_CHARS = 140;
// A report saved before its page had a Highlights section (the archive before October 2026) is sent
// as its first 8000 chars, so scripts/regen-highlights.ts still covers an old date.
const HIGHLIGHTS_EXCERPT_CHARS = 8000;

/**
 * A report's `## Highlights` section (heading included), up to the next heading, `---` rule or
 * TABLES_MARKER; null when the report has none. highlights.json sees only this, so it can restate
 * only what the page picked: on 2026-10-26 it read the whole page and led with a Snowflake note
 * the data page had left out as minor.
 */
export function highlightsSection(md: string): string | null {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${SECTIONS.highlights}`);
  if (start < 0) return null;
  const end = lines.findIndex(
    (l, i) => i > start && (l.startsWith("#") || l.trim() === "---" || l.trim() === TABLES_MARKER),
  );
  return lines
    .slice(start, end === -1 ? undefined : end)
    .join("\n")
    .trim();
}

export function buildHighlightsPrompt(
  reportContents: Record<string, string>,
  forced: readonly string[] = [],
  maxPerReport: number = HIGHLIGHTS_MAX_PER_REPORT,
): string {
  const forcedRule = forced.length
    ? `\n- ${forced.map((id) => FORCED_REASON[id] ?? id).join(" and ")} ${forced.length === 1 ? "was" : "were"} already judged relevant to this reader: give ${forced.length === 1 ? "that report" : "each of those reports"} at least 1 highlight`
    : "";

  const sections = Object.entries(reportContents)
    .map(
      ([id, content]) =>
        `## [${id}]\n\n${highlightsSection(content) ?? content.slice(0, HIGHLIGHTS_EXCERPT_CHARS)}`,
    )
    .join("\n\n---\n\n");

  // The count is a maximum, not a quota, and the exclusion list is explicit: a
  // fixed 6-per-report quota padded every section with routine noise
  // ("2 nightly builds", "200 commits", star counts). No "why it matters" ask:
  // on 2026-10-26 it made the model add consequences no page stated.
  return `You are a selective news editor. The following are the Highlights of today's AI ecosystem reports, each labeled with a report ID. Each report's editor already picked them from the report's rows. The reader is a developer who wants to know what actually changed in the AI tooling world today, who follows AI policy for work (the ai-policy report), and who passes data-platform changes on to data-engineering colleagues working on Databricks, Snowflake and the open-source data stack (the ai-data report).

${sections}

---

For each report, pick AT MOST ${maxPerReport} of its Highlights that this reader would genuinely care about, and restate or shorten each as one sentence of at most ${HIGHLIGHT_MAX_CHARS} characters. Fewer is better than filler: return 1 or 0 when only 1 or 0 items qualify.

Say the concrete change, capability or consequence the Highlight states; add no consequence, audience or benefit it does not state.
Good: "Claude Code adds background subagents that keep running while you chat"
Bad: "Claude Code v2.1.288 released" (no content)  ·  "Copilot CLI ships three prereleases" (routine)

Never include:
- Routine releases: nightlies, alphas, prereleases, build-number ranges, or a version number without saying what it changes
- Raw counts: commits, issues, PRs, open items, stars, comments, points
- CI status, flaky tests, pending upgrades, "in progress" or "targets" items with no shipped result
- Generic trend statements ("X dominates", "Y remains active", "Z gains attention")

Return ONLY valid JSON, no markdown fences, no explanation. Format:
{"ai-agents":["highlight 1",...],"ai-models":["highlight 1",...],...}

Rules:
- Use the exact report IDs from the [brackets] above as keys
- Omit a report's key entirely when nothing in it qualifies, or when it contains only failure messages
- At most ${maxPerReport} highlights per report, each at most ${HIGHLIGHT_MAX_CHARS} characters
- A report's first highlight covers the first bullet of its \`## ${SECTIONS.highlights}\` (the page's lead), unless that bullet says there is no news
- Each highlight restates one item of its report's Highlights above, never another subject; one subject per highlight, and keep its window ("this week") as the report gives it
${sourceFidelityRules()}
- ${goingAwayRule("highlight")}${forcedRule}`;
}

const FORCED_REASON: Record<string, string> = {
  "ai-policy": "Every item in ai-policy",
  "ai-data": "every vendor release-note row in ai-data",
};

/**
 * The reports that always get a highlight when published: AI Policy, whose
 * every item Jev kept, and the data report only on a day Jev kept a vendor
 * item (a day of repo activity alone holds routine releases and hot issues,
 * which the model may rightly skip). On 2026-10-20 the model left AI Policy
 * out though it carried the AI Act's first harmonised standard in the OJ.
 */
export function forcedHighlightReports(hasVendorItems: boolean): string[] {
  return hasVendorItems ? ["ai-policy", "ai-data"] : ["ai-policy"];
}

/**
 * The highlights as saved: each one's going-away sign normalized (`signHighlight`), a report's
 * first one signed when its page's lead bullet is, with a
 * fallback for each `forced` report the model left out: the first sentence of that report's own
 * Highlights section.
 */
export function withFallbackHighlights(
  highlights: ReportHighlights,
  reportContents: Record<string, string>,
  forced: readonly string[],
): ReportHighlights {
  const out = Object.fromEntries(
    Object.entries(highlights).map(([id, items]) => [id, items.map(signHighlight)]),
  );
  // The prompt has a report's first highlight cover its page's lead bullet, so a lead signed going
  // away keeps its sign; the model dropped it on the Polars lead (regen of 2026-10-26).
  for (const [id, items] of Object.entries(out)) {
    const lead = reportContents[id] ? firstHighlight(reportContents[id]) : null;
    if (items[0] && lead?.startsWith(`${GOING_AWAY} `) && !items[0].startsWith(`${GOING_AWAY} `))
      items[0] = `${GOING_AWAY} ${items[0]}`;
  }
  for (const id of forced) {
    const content = reportContents[id];
    if (out[id]?.length || !content) continue;
    const line = firstHighlight(content);
    if (line) out[id] = [line];
  }
  return out;
}

// A period after one of these, or inside a dotted abbreviation (U.S., E.U.), ends no
// sentence: AI Policy prose cites "Art. 50", "the U.S. Senate" and
// deadlines such as "closes Nov. 9". A sentence that really ends on "Dec." runs
// on, and is cut at HIGHLIGHT_MAX_CHARS.
const ABBREVIATIONS = new Set([
  ...["jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec"],
  "sec",
  "para",
  "fig",
  "art",
  "no",
  "nr",
  "e.g",
  "i.e",
  "vs",
  "etc",
  "inc",
  "cf",
  "approx",
  "dr",
  "mr",
  "ms",
  "st",
]);
const FAILURE_NOTICES = new Set<string>(Object.values(MSG));

/**
 * The first sentence under a report's `## Highlights`, as plain text (the
 * first bullet or paragraph, hard-wrapped lines joined, Markdown and ⚠️
 * removed); null when there is none or only a failure notice.
 */
export function firstHighlight(md: string): string | null {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${SECTIONS.highlights}`);
  if (start < 0) return null;
  const block: string[] = [];
  for (const raw of lines.slice(start + 1)) {
    const line = raw.trim();
    // The saved report has the tables spliced in, each opening with a heading.
    if (line.startsWith("#") || line === TABLES_MARKER) break;
    if (!line) {
      if (block.length) break;
      continue;
    }
    if (block.length && /^([-*]|\d+[.)])\s/.test(line)) break;
    block.push(line);
  }
  const text = block
    .join(" ")
    .replace(/^([-*]|\d+[.)])\s+/, "")
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/(^|[\s(])[*_]([^*_]+)[*_](?=[\s.,;:!?)]|$)/g, "$1$2")
    .trim();
  if (!text || FAILURE_NOTICES.has(text)) return null;
  const plain = text.replace(/⚠️\s*/g, "").trim();
  let end = plain.length;
  for (const m of plain.matchAll(/[.!?](?=\s|$)/g)) {
    const word = plain.slice(0, m.index).split(/\s/).pop() ?? "";
    if (m[0] === "." && (/\.[A-Za-z]$/.test(word) || ABBREVIATIONS.has(word.toLowerCase()))) continue;
    end = m.index + 1;
    break;
  }
  const sentence = plain.slice(0, end);
  if (sentence.length <= HIGHLIGHT_MAX_CHARS) return sentence;
  const cut = Array.from(sentence)
    .slice(0, HIGHLIGHT_MAX_CHARS - 1)
    .join("");
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[,;:]$/, "")}…`;
}

// ---------------------------------------------------------------------------
// Trends: Models
// ---------------------------------------------------------------------------

/**
 * Weekly Trends' Hugging Face table: one summary per numbered release row
 * (`hfReleaseRows`); code renders the table (`renderHfTable`), its ranks,
 * figures and 🔥. The input has no tags: on 2026-10-26 the summaries printed
 * `model_type` tags ("Qwen 3.5" for Qwen3.8-27B, "Spark 2.5" for Spark-X2.6-4B).
 */
export function buildHfSummariesPrompt(rows: Numbered<HfRow>[], dateStr: string): string {
  const list = rowList(rows, (m) =>
    [
      m.id,
      `task: ${m.pipelineTag || "unknown"}`,
      m.parameters !== null ? `parameters: ${formatParameters(m.parameters, m.id)}` : "",
      license(m.tags),
    ]
      .filter(Boolean)
      .join(" | "),
  );
  return `You are an AI model ecosystem analyst. Below are ${rows.length} numbered models trending on the Hugging Face Hub, week ending ${dateStr}, each with its task (pipeline tag), parameter count and license where known.

${list}

${summaryLine("one sentence")}: what the model is, from its task, size, license and name only (e.g. "27B image-text-to-text model, Apache-2.0 license."). You have no model card: say nothing else about it.
- No use the task does not name (not "style transfer" for image-to-image) and no quality or speed word ("high-quality", "sophisticated", "efficient", "powerful").
- Never name a base model, architecture, family or version the model's name does not state.
- No likes, download or rank figures: the table shows them.
- If the task is unknown and the name says nothing about what the model does, write \`N: —\`.
${summaryOutputRule(rows.length)}
- English.
`;
}

/** "Apache-2.0 license" from a `license:` tag; "" without one. */
function license(tags: string[]): string {
  const tag = tags.find((t) => t.startsWith("license:"));
  return tag ? `license: ${tag.slice("license:".length)}` : "";
}
