/**
 * Page prompts: the row summaries of Trends (its Hugging Face table included),
 * the models page, AI Policy, the data report and Spotted; the prose of Trends,
 * AI Policy and the data report; and highlights.json from the pages. The agents and
 * models pages' Highlights, the repo sections and the shared prompt rules are in
 * prompts.ts.
 */

import type { LabPost } from "../sources/labs.ts";
import type { summaryRows } from "../trending/rank.ts";
import type { OpenRouterData, OpenRouterNewModel } from "../sources/openrouter.ts";
import {
  DATA_REPORT,
  MODELS_PAGE,
  MSG,
  NO_HIGHLIGHT_NOTE,
  SECTIONS,
  SECURITY,
  SPOTTED,
} from "../core/strings.ts";
import {
  TABLES_MARKER,
  contentWords,
  rowList,
  summaryLine,
  summaryOutputRule,
  type Numbered,
} from "./summarized-table.ts";
import {
  goingAwayRule,
  HIGHLIGHTS_PICK_RULE,
  ownWordsRule,
  IDENTIFIER_RULE,
  RELEASE_ORDER,
  NO_TITLE_RULE,
  RELEASE_BODY_CHARS,
  releaseNotes,
  sourceFidelityRules,
  SOURCE_FIDELITY_RULES,
  NO_TREND_RULE,
} from "./prompts.ts";
import type { ReleaseRow } from "./pages.ts";
import type { CommunityRow } from "../data/community.ts";
import { postDetail } from "./project-news.ts";
import type { Deadline } from "../core/report-state.ts";
import { formatParameters, type HfData, type HfRow } from "../sources/huggingface.ts";
import type { ResearchPaper } from "../trending/research.ts";
import type { PolicyItem } from "../policy/items.ts";
import type { KeptVendorItem } from "../data/relevance.ts";
import { signHighlight } from "./markdown.ts";
import { escapeRegex } from "../core/regex.ts";
import { daysBefore, WEEK_DAYS } from "../core/date.ts";
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
 * build trends from shared wording (forced weekly run, 2026-10-27). Comparisons come
 * from `facts` (`trendsFacts`): derived by the model, they misread the tables.
 */
export function buildTrendsProsePrompt(
  pageMd: string,
  dateStr: string,
  /** Rows with neither a summary nor a description ("—"): the page says nothing about them, so no Highlight. */
  noSummaryNames: string[] = [],
  /** `trendsFacts`: the comparisons computed in code from the tables' rows. */
  facts = "",
): string {
  return `You are the editor of a weekly trends report for AI practitioners: agents and coding tools, models, research and the community's most discussed stories. Below is this week's page, week ending ${dateStr}. Its tables were selected and ranked in code from GitHub Trending (weekly), GitHub topic search, OpenRouter app and model rankings, npm downloads, Hugging Face, arXiv (ranked by relevance) and Hacker News, Lobste.rs and Dev.to. 🆕 in a Signal column means created or listed in the last 14 days; 🔥 before a name means the item was also in last week's report.

${pageMd || "(The page has no sections this week.)"}
${facts ? `\nFacts computed in code from the tables above (each names its table, row and window):\n\n${facts}\n` : ""}
---

Write only these parts, in this order:

1. \`## ${SECTIONS.highlights}\` — 1-3 bullets on the most noteworthy items of the week for a data or AI engineer, most relevant first, across the page's sections.
2. The line \`${TABLES_MARKER}\` exactly once, on its own line. The page is inserted there.
3. \`## ${SECTIONS.signals}\` — 100-300 words, 2-4 short paragraphs: what the tables' figures show, such as the largest star gains, rank moves against last week's page and the usage leaders. This is the one place for trend claims, and each Signal:
   - opens with one fact from the facts block, as given, and links the rows that fact names; every other name and figure in it appears in those rows, and it lists no rows beyond them;
   - rests on those rows' figures (stars gained, %, rank, tokens, downloads, likes), never on what their summaries, descriptions or titles have in common: three tools that all support Codex are not a signal;
   - uses no trend verb the figures cannot show (dominates, is accelerating, is converging): one snapshot shows no change over time.
   The Research table has no figures, so it gives no Signal. Fewer Signals beat an unsupported one.

Rules:
- ${NO_TITLE_RULE}
- In ${SECTIONS.highlights}: ${goingAwayRule("bullet")} ${HIGHLIGHTS_PICK_RULE}${noSummaryNames.length ? `\n- These rows have no summary or description: no Highlight for them. ${noSummaryNames.map((t) => `"${t}"`).join(", ")}` : ""}
- Do not reproduce or alter the tables, and write no other sections.
- Each table gives its window in its intro line, and a claim keeps it, in Highlights too: OpenRouter usage is one day's snapshot, so say "on <its date>", never "this week".
- Base every claim on the page. It shows descriptions, summaries and counts only, so do not describe releases, adoption or community reactions it does not show.
- Mention only items that appear on the page, and link every item you mention: each Signal and each Highlight carries the link of every row it names.
- Comparisons ("largest", "most", "leads", "nearly double", counts and shares such as "3 of the top 10") come only from the facts block, quoted as given, with its table and window. Compute none yourself, and compare no rows the facts block does not compare.
${sourceFidelityRules()}
- English, professional and concise.
`;
}

/**
 * Policy report, call 1 of 2: one 1-2 sentence summary per numbered table row.
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

${summaryLine("1-2 sentences")} — what was published or decided. Add a second sentence only when the text states what the item means for organisations that deploy AI; otherwise write one sentence.
- Never write about the text itself ("the provided text", "the text does not specify"): leave out what it does not say.
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

Write only \`## ${SECTIONS.highlights}\`: 2-4 sentences in one paragraph on the most consequential items today. The table goes below it.

Rules:
- ${NO_TITLE_RULE}
- Do not reproduce or alter the table.
- ${ownWordsRule("item")}
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
${sourceFidelityRules()}
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
- A post without page text: write \`N: —\`.
- A model: 1 sentence from its catalog description: what it is for, and what it takes in and gives back (text, images, audio) when the description says. Not its context length: the row shows it. Leave out its marketing claims (best, leading, state-of-the-art).
- Ground every sentence only in the given text. Do not invent versions, prices, dates or benchmarks.
- ${IDENTIFIER_RULE}
${summaryOutputRule(count)}
- English.
`;
}

/**
 * The models Highlights call's rule for the lab posts without page text (`note` of
 * buildPageHighlightsPrompt); undefined when every shown post has text.
 */
export function labPostsNoHighlightNote(titles: string[]): string | undefined {
  return titles.length
    ? `These lab posts have no page text, only a title: no Highlight for them. ${titles.map((t) => `"${t}"`).join(", ")}`
    : undefined;
}

/**
 * A page's Highlights rule for its stories that show only a title (`titleOnlyStories`,
 * `titleOnlyNews`) and its unconfirmed security claims (`unconfirmedClaims`), each with its own
 * reason; undefined when there are none.
 */
export function storiesNoHighlightNote(titles: string[], unconfirmed: string[] = []): string | undefined {
  const quoted = (ts: string[]) => [...new Set(ts)].map((t) => `"${t}"`).join(", ");
  const notes = [
    ...(titles.length
      ? [
          `These stories (Spotted rows and News items) show only a title, no description: no Highlight for them. ${quoted(titles)}`,
        ]
      : []),
    ...(unconfirmed.length
      ? [
          `These security stories are not confirmed by the vendor, a researcher or the press: no Highlight for them. ${quoted(unconfirmed)}`,
        ]
      : []),
  ];
  return notes.length ? notes.join("\n") : undefined;
}

/** The data report's reader, shared by its two vendor calls. */
const DATA_READER =
  "a data engineer at a consultancy whose clients run Databricks, Snowflake, Azure / Microsoft Fabric and GCP / BigQuery";

/**
 * Data report, vendor call 1 of 2: one summary per numbered vendor table row.
 * The rows are the kept vendor items, numbered by selectVendorItems; parseRowSummaries reads the reply.
 * A deprecation's summary is also its Action required row's "What to do" cell, so it opens with the
 * action its note states. Only a deprecation: without that limit a feature note's summary opened
 * "Turn on the … extension" (replay of 2026-11-16, `.scratch/page-grammar/`).
 */
export function buildDataSummariesPrompt(
  items: Numbered<KeptVendorItem>[],
  dateStr: string,
  releases: Numbered<ReleaseRow>[] = [],
  /** News & discussion rows: community feed posts, numbered after the releases. */
  posts: CommunityRow[] = [],
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
    rowList(
      posts,
      (p) => `${p.title} (${postDetail(p)}, ${p.source}) — ${p.description || "(no description)"}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
  const count = items.length + releases.length + posts.length;
  const kinds = [
    releases.length
      ? "the ones marked (release) are open-source project releases, with their release notes"
      : "",
    posts.length
      ? "the ones marked (blog post) or (newsletter issue) are community posts, with the feed's text, which may be cut"
      : "",
  ].filter(Boolean);
  return `You summarize data platform release notes for ${DATA_READER}.

Below are ${count} numbered release notes and updates, new as of ${dateStr}, each with its source and text${kinds.length ? `; ${kinds.join("; ")}` : ""}.

${list}

${summaryLine("1-2 sentences")} — what the change enables, breaks or requires for client data platforms: a setting that must be on, a migration, a cloud, region or edition limit (for a deprecation or breaking change: what stops working, and by when).
- A deprecation or breaking change whose text states an action (migrate, update, switch, turn a setting on): open its summary with that action, verb first ("Migrate to X by <date>: …"). Keep the text's strength: when it only recommends, write "Recommended: migrate to X …". When the text states no action, open with what stops working and when, and never invent an action. Every other row is described, never instructed: no summary of a feature note opens with an action.
- Do not repeat the title or its status words (generally available, preview, now available): the title is shown next to the summary.
- Ground every sentence only in the given text. Do not invent dates, versions, regions or availability.
- ${IDENTIFIER_RULE}
- When the text adds nothing beyond the title (or is empty), write \`N: —\` for that item.${releases.length ? `\n- For a release: its most important changes for users in 1 sentence, in this order: ${RELEASE_ORDER}; say so first when it is a major version (only a version x.0.0 is a major version). Notes are cut at ${RELEASE_BODY_CHARS} characters: summarize what they show, and never say they are cut.` : ""}${posts.length ? `\n- For a community post: what a data engineer learns from it, in your own words, with one concrete fact from the text (a number, a named tool, a finding). You have not read the post: no claim, method or result its text does not state. A first-person post is its author's: say who did it ("the author benchmarked…"). Never copy the text: the reader can open the link.` : ""}
${summaryOutputRule(count)}
- English.
`;
}

/**
 * Data report, vendor call 2 of 2: Highlights over the report's sections
 * (code-rendered vendor tables plus the repo bodies). Highlights say what a
 * change means for clients (the tables already say what changed). No section after the tables:
 * Across platforms (one capability compared on two platforms) was removed in November 2026, as 7
 * of its 9 reviewed bullets overstated their rows or paired unrelated ones.
 */
export function buildDataProsePrompt(
  sectionsMd: string,
  dateStr: string,
  /** Kept vendor rows under "Notable" significance or unsure of it (`minor`): in the tables, never a Highlight. */
  minorTitles: string[] = [],
  /** Stories that show only a title (`titleOnlyStories`, `titleOnlyNews`): never a Highlight. */
  titleOnlyTitles: string[] = [],
  /** Flagged security stories not confirmed by the vendor, a researcher or the press (`unconfirmedClaims`): never a Highlight. */
  unconfirmedTitles: string[] = [],
): string {
  const storiesNote = storiesNoHighlightNote(titleOnlyTitles, unconfirmedTitles);
  return `You are the editor of a daily data engineering report for ${DATA_READER}.

Below are today's report sections, ${dateStr}: vendor release-note tables (⚠️ marks a deprecation, retirement or breaking change; 🤖 an AI feature in a data platform), the releases and hot issues of tracked open-source projects, under ${DATA_REPORT.communityHeading} posts from engineering blogs and newsletters, and, under Spotted, community stories about data engineering.

${sectionsMd}

---

Write only \`## ${SECTIONS.highlights}\`: 1-3 bullets, the most consequential changes today, deprecations, retirements and breaking changes first. Each bullet says who is affected, as far as the row names it (which client setup: e.g. Azure Databricks workspaces with the compliance security profile, Snowflake Native App providers, BigQuery users of AI functions; the platform's users when the row names no narrower group), what to do only when the row states it, as strongly as the row does (a recommended replacement is a recommendation, not a must), and by when, if the row gives a date.

Rules:
- ${NO_TITLE_RULE}
- In ${SECTIONS.highlights}: ${goingAwayRule("bullet")} ${HIGHLIGHTS_PICK_RULE}
- When no item qualifies, ${SECTIONS.highlights} is the one bullet "- ${NO_HIGHLIGHT_NOTE}". Never a bullet about the rows as a group or about what is absent ("all notes are minor", "no deprecations"): the Action required table above the sections is not shown here.${minorTitles.length ? `\n- These rows are minor: no Highlight for them. ${minorTitles.map((t) => `"${t}"`).join(", ")}` : ""}${storiesNote ? `\n- ${storiesNote}` : ""}
- Length: at most ~150 words.
- A major release in ${DATA_REPORT.releasesHeading} (a version x.0.0, or one whose summary names breaking changes) is a Highlights candidate: say who it affects, and a test or migration step only when its summary gives one.
- Never restate a row: the reader sees the tables right below. A bullet that only says what changed, without who is affected, is left out.
- Write no links, URLs or other sections; name each item as the sections do. Dates only as the "by when" of a row that gives one.
- Name each item in at most one bullet. Two rows that describe the same change (a release note and its behavior change bundle, a "coming soon" note and its GA note) are one item: mention it once.
- Base every claim on the sections. Do not invent versions, dates or availability.
${sourceFidelityRules()}
- English, professional and concise.
`;
}

// ---------------------------------------------------------------------------
// highlights.json: each page's own Highlights, for Telegram, Teams and the Overview
// ---------------------------------------------------------------------------

export interface ReportHighlights {
  [reportId: string]: string[];
}

const HIGHLIGHTS_MAX_PER_REPORT = 2;

/** The reports whose highlight is their lede's first sentence: Weekly Diff, an article with no Highlights section. */
const LEDE_HIGHLIGHT_REPORTS = new Set<string>(["ai-weekly"]);

/**
 * A report's `## Highlights` section (heading included), up to the next heading, `---` rule or
 * TABLES_MARKER; null when the report has none. highlights.json is made from it (`pageHighlights`).
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

// A highlight restates the lead when at least this share of its content words are in the lead.
const LEAD_MATCH_MIN = 0.5;
const leadWords = (s: string) => new Set(contentWords(s));

/** Whether `highlight` restates `lead`: most of its words are the lead's. */
export function restatesLead(highlight: string, lead: string): boolean {
  const words = [...leadWords(highlight)];
  const inLead = leadWords(lead);
  return words.length > 0 && words.filter((w) => inLead.has(w)).length / words.length >= LEAD_MATCH_MIN;
}

/**
 * A table row the page shows but that makes no Highlight: a `minor` vendor row, a Trends row
 * showing "—", a lab post without page text.
 */
export interface NoHighlightRow {
  name: string;
  /** "" when the row has no link. */
  url: string;
  /**
   * A community story that shows only its title. A bullet is about it only when it links the
   * story or says little more than that title: on a launch day a lab post or release with text
   * shares the title's words, and its bullet says much more.
   */
  story?: true;
}

/**
 * A data Highlight that speaks of the rows as a group ("minor", our internal label) or states an
 * absence: on 2026-11-01 the only Highlight read "All vendor release notes today are minor fixes and
 * previews; no deprecations or breaking changes." Narrow on purpose: only these phrases.
 */
export const isGroupOrAbsenceBullet = (bullet: string): boolean =>
  /\b(?:are|all|only) minor\b|\bminor (?:fixes|changes|updates|notes)\b|\bno (?:deprecations|breaking changes|notable)\b|\bnothing new\b/i.test(
    bullet,
  );

// A title of at least this many content words also matches a bullet restating most of them
// (4 words of 3+ letters before stopwords were dropped).
const RESTATED_NAME_MIN_WORDS = 3;

/**
 * The Highlights before TABLES_MARKER (the whole text without one) without a bullet about a
 * `rows` entry: one linking its URL, naming it (word-bounded), or restating most of a longer
 * name's words (`restatesLead`). The prompt names these rows as no Highlight; this is the net for
 * a model that writes one anyway. Each drop is logged; when every bullet goes, NO_HIGHLIGHT_NOTE
 * stands in, so the section never reads empty. `alsoDrop` drops a
 * bullet for its own text (the data page's `isGroupOrAbsenceBullet`).
 */
export function dropNoHighlightRows(
  prose: string,
  rows: readonly NoHighlightRow[],
  tag: string,
  alsoDrop?: (bullet: string) => boolean,
): string {
  if (!rows.length && !alsoDrop) return prose;
  const at = prose.indexOf(TABLES_MARKER);
  const head = at === -1 ? prose : prose.slice(0, at);
  const about = (bullet: string) =>
    rows.some(
      (r) =>
        (r.url !== "" && bullet.includes(`](${r.url})`)) ||
        (r.story
          ? restatesLead(r.name, bullet) && restatesLead(bullet, r.name)
          : new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(r.name)}($|[^\\p{L}\\p{N}])`, "iu").test(bullet) ||
            (leadWords(r.name).size >= RESTATED_NAME_MIN_WORDS && restatesLead(r.name, bullet))),
    ) || alsoDrop?.(bullet) === true;
  // A bullet is its marker line and the indented lines continuing it.
  const lines = head.split("\n");
  const bullets: number[][] = [];
  let open: number[] | null = null;
  lines.forEach((line, n) => {
    if (/^\s*(?:[-*]|\d+\.)\s/.test(line)) bullets.push((open = [n]));
    else if (open && /^\s+\S/.test(line)) open.push(n);
    else open = null;
  });
  const textOf = (b: number[]) => b.map((n) => lines[n]!.trim()).join(" ");
  const dropped = bullets.filter((b) => about(textOf(b)));
  if (!dropped.length) return prose;
  for (const b of dropped)
    console.log(
      `  [${tag}] Highlight about a no-Highlight row or an absence dropped: ${textOf(b).slice(0, 80)}`,
    );
  const gone = new Set(dropped.flat());
  // The note takes the first dropped bullet's place when none is left.
  const kept = lines.flatMap((l, n) =>
    !gone.has(n)
      ? [l]
      : dropped.length === bullets.length && n === dropped[0]![0]
        ? [`- ${NO_HIGHLIGHT_NOTE}`]
        : [],
  );
  return `${kept.join("\n")}${at === -1 ? "" : prose.slice(at)}`;
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
 * The first sentence of an article's lede: the paragraph under the rule that closes the page's
 * head (H1, report bar, meta line), as plain text; null when the page has no such paragraph.
 * A heading the model put above its lede, against the prompt, is passed over.
 */
export function ledeHighlight(md: string): string | null {
  const lines = md.split("\n");
  const rule = lines.findIndex((l) => l.trim() === "---");
  if (rule < 0) return null;
  const block: string[] = [];
  for (const raw of lines.slice(rule + 1)) {
    const line = raw.trim();
    if (line.startsWith("#") && !block.length) continue;
    if (line.startsWith("#") || line === "---") break;
    if (!line) {
      if (block.length) break;
      continue;
    }
    block.push(line);
  }
  return firstSentence(block.join(" "));
}

/** Markdown text as plain text: list marker, links, bold, code, italics and ⚠️ removed. */
function plainText(block: string): string {
  return block
    .replace(/^([-*]|\d+[.)])\s+/, "")
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/(^|[\s(])[*_]([^*_]+)[*_](?=[\s.,;:!?)]|$)/g, "$1$2")
    .replace(/⚠️\s*/g, "")
    .trim();
}

/** A paragraph's first sentence as plain text; null for none or a failure notice. */
function firstSentence(block: string): string | null {
  const plain = plainText(block);
  if (!plain || FAILURE_NOTICES.has(plain)) return null;
  for (const m of plain.matchAll(/[.!?](?=\s|$)/g)) {
    const word = plain.slice(0, m.index).split(/\s/).pop() ?? "";
    if (m[0] === "." && (/\.[A-Za-z]$/.test(word) || ABBREVIATIONS.has(word.toLowerCase()))) continue;
    return plain.slice(0, m.index + 1);
  }
  return plain;
}

/**
 * The items of a report's `## Highlights` as plain text: each bullet, or each paragraph of a prose
 * section (AI Policy), whole and with its going-away sign. NO_HIGHLIGHT_NOTE, a failure notice and
 * an unconfirmed security claim are no items.
 */
function highlightItems(md: string): string[] {
  const section = highlightsSection(md);
  if (!section) return [];
  const items: string[][] = [];
  let open: string[] | null = null;
  for (const raw of section.split("\n").slice(1)) {
    const line = raw.trim();
    if (!line) open = null;
    else if (/^([-*]|\d+[.)])\s/.test(line) || !open) items.push((open = [line]));
    else open.push(line);
  }
  // Checked on the Markdown: the notices and the claim's marker carry ⚠️ and emphasis.
  return items
    .map((lines) => lines.join(" ").replace(/^([-*]|\d+[.)])\s+/, ""))
    .filter(
      (md) =>
        md !== NO_HIGHLIGHT_NOTE && !FAILURE_NOTICES.has(md) && !md.includes(SECURITY.unconfirmed.trim()),
    )
    .map((md) => signHighlight(plainText(md)))
    .filter((text) => text !== "");
}

/**
 * highlights.json: each page's first HIGHLIGHTS_MAX_PER_REPORT Highlights as the page wrote them,
 * and Weekly Diff's lede sentence (`ledeHighlight`). No model restates them: on 2026-11-21 that
 * call reasoned past its budget twice and two pages went out without highlights, and a restatement
 * could state what the page did not. A page without a Highlights section (the archive before
 * October 2026) gets no entry.
 */
export function pageHighlights(reportContents: Record<string, string>): ReportHighlights {
  const out: ReportHighlights = {};
  for (const [id, content] of Object.entries(reportContents)) {
    const items = LEDE_HIGHLIGHT_REPORTS.has(id)
      ? [ledeHighlight(content)].filter((h): h is string => h !== null)
      : highlightItems(content).slice(0, HIGHLIGHTS_MAX_PER_REPORT);
    if (items.length) out[id] = items;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Weekly Diff: the week's article
// ---------------------------------------------------------------------------

/** How the article's source (`buildWeekSource`, src/weekly/source.ts) is laid out. */
export const WEEK_SOURCE_NOTE = `Each item has its kind, source, date and link, a "digest:" line, and a "text:" line with what its source gave: release notes, an issue's body, a feed entry, a page's description. The "digest:" line is written by the digest's code, not by a model: the section that showed the item, 🔓 for a security event, ⚠️ for a deprecation, retirement or behavior change, 🤖 for an AI feature in a data platform, a story's points and comments, a hot issue's totals and gain. A text that ends with "[…cut]" is incomplete.`;

// One fidelity rule forbids a trend claim over co-occurring items. The article may make one as
// a marked reading, so its Analysis rules replace it.
const articleFidelityRules = SOURCE_FIDELITY_RULES.filter((rule) => rule !== NO_TREND_RULE)
  .map((r) => `- ${r}`)
  .join("\n");

/**
 * Weekly Diff: one article on the week, written from the source texts of the shown items by a
 * stronger model than the rest of the pipeline uses (src/weekly/writer.ts). Facts rest on rows
 * and link them; the writer's reading is set in italics, and only that. This is the prompt the
 * experiment of 2026-11-16 measured (`.scratch/weekly-diff/`, prompt v3): at high effort three
 * articles drew 0 to 2 major flags each from two judges. A change here is not measured until
 * the lab runs it again.
 */
export const buildWeeklyArticlePrompt = (
  source: string,
  dateStr: string,
): string => `You write "Weekly Diff", the weekly article of Daily Diff, a digest for AI practitioners and data engineers at a Dutch data consultancy. The reader works with coding agents, LLM APIs, Databricks, Snowflake and the open-source data stack, has clients in the EU and the Netherlands, and did not read every daily page.

Below are the items the digest showed from ${daysBefore(dateStr, WEEK_DAYS - 1)} to ${dateStr}, by day and page. ${WEEK_SOURCE_NOTE} After the items come the weekly Trends tables and the open AI Policy dates. They are your only source. A "row" in the rules below is one such item or one table row. State nothing about the part of a text that was cut. An issue's body is its reporter's account, and a story's text is its page's own description.

Write one article of 700–1000 words on what changed this week and what it means for this reader.

Shape:
- No title. Open with a lede of 2–3 sentences that names the week's main developments. The lede only reports: it links two developments ("followed", "after", "ahead of", "in response to") only when a row states that link.
- Then 3–5 sections, each under a \`## \` heading that names its subject in a plain noun phrase. Choose the sections by what mattered this week, not one per page: a section may draw on several pages and days, and a page with nothing that matters is left out.
- Paragraphs of prose only. No bullet or numbered list anywhere, no bold labels, no tables, no closing summary.
- Select. Most rows do not belong in the article. Prefer what changes what the reader does or decides (breaking changes, deprecations with a date, deadlines, changed prices or defaults, security events), a development with rows on several days, and the movements the Trends tables show in figures.

Facts:
- Every factual statement rests on a row of the source and links it once, with that row's own link, on the name of the thing.
- Nothing from your own knowledge: state nothing about a company, product, model or law that the source does not say, however well known.
- Copy figures exactly, with their unit and their window ("in the last 7 days", "on 2026-11-15"). A rank or a change keeps the basis its row gives ("week #3", "+46% vs previous week").
- Make a comparison ("the largest", "more than") only when one table of the source shows it. Before you state a count ("3 of the top 20", "four releases"), go through every row you count.
- Give an event's date only when its row states one, and write every date as an ISO date (2026-11-30), also when the source spells it out. The date of a page is the day the digest reported the item, not the day it happened.
- Describe a model, product, company or document in the source's words only: no "low-cost", "frontier", "flagship" or "draft" that its row does not use.
- A description belongs to the page it comes from: a listing's or a story's text is that page's wording, not the statement of the company it describes.
- Two rows are about the same thing only when the source says so: never join a write-up, a CVE, an issue or a release that the source lists apart.
${articleFidelityRules}

Analysis:
- The article interprets: what a development means for this reader, how items connect, where a market moves. End each section with 1–3 sentences of interpretation.
- Set every sentence of interpretation in *italics*, and nothing else in italics. The reader tells your reading from the reported facts by the italics alone.
- An interpretation rests on facts stated in its own section. Word it as a reading ("this suggests", "a likely reason", "worth watching"), no stronger than its facts: one week of figures shows a movement in that week, not a lasting shift.
- Check each premise against its row before you write the reading: its date (an event dated before a change does not follow from it, and a date months away is not "this month"), its count, and its scope (a few items in two projects are not a whole market).
- No forecast stated as certain, no advice the facts do not support, and no interpretation that needs a fact from outside the source to hold.

Style:
- Plain words, short sentences, active voice. No hype, no scene-setting ("In a week where …"), no rhetorical questions.
- Write about the developments, never about the digest, its pages or what they lack.

SOURCE

${source}`;

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
