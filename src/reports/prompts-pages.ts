/**
 * Page prompts: the row-summaries and prose calls of Trends, the models page,
 * AI Policy, the data report and Spotted, and the highlights.json prompt. The
 * repo-section prompts and the shared prompt rules are in prompts.ts.
 */

import type { WebPageItem } from "../sources/web.ts";
import type { summaryRows } from "../trending/rank.ts";
import { formatTokens, type OpenRouterData, type OpenRouterNewModel } from "../sources/openrouter.ts";
import { DATA_REPORT, MODELS_PAGE, MSG, SECTIONS, SPOTTED, TRENDS_REPORT } from "../core/strings.ts";
import { TABLES_MARKER, rowList, summaryLine, summaryOutputRule, type Numbered } from "./summarized-table.ts";
import { goingAwayRule, NO_TITLE_RULE, RELEASE_BODY_CHARS, releaseNotes } from "./prompts.ts";
import type { ReleaseRow } from "./pages.ts";
import type { Deadline } from "../core/report-state.ts";
import type { HfData } from "../sources/hf.ts";
import type { ResearchPaper } from "../sources/research.ts";
import type { PolicyItem } from "../policy/policy.ts";
import type { KeptVendorItem } from "../data/jev.ts";
import { signHighlight } from "./markdown.ts";
import { siteOf, type StoryRow } from "../spotted/spotted.ts";

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

${summaryLine("2 sentences")} — what it is and why it matters to developers.
- Ground every sentence only in the given description. Do not invent features, users, releases or numbers.
- No star, gain, download, token or rank figures: the table shows them next to the summary.
- If the description is empty, write \`N: —\`: the table shows the name and where it was found.
${summaryOutputRule(rows.length)}
- English.
`;
}

/**
 * Weekly Trends, the second round: Highlights and Signals around the page
 * rendered from the first round's calls. The model places TABLES_MARKER where
 * spliceTables inserts the page.
 */
export function buildTrendsProsePrompt(pageMd: string, dateStr: string): string {
  return `You are the editor of a weekly trends report for AI practitioners: agents and coding tools, models, research and the community's most discussed stories. Below is this week's page, week ending ${dateStr}. Its tables were selected and ranked in code from GitHub Trending (weekly), GitHub topic search, OpenRouter app and model rankings, npm downloads, Hugging Face, arXiv (ranked by relevance) and Hacker News, Lobste.rs and Dev.to. 🆕 in a Signal column means created or listed in the last 14 days; 🔥 before a name means the item was also in last week's report.

${pageMd || "(The page has no sections this week.)"}

---

Write only these parts, in this order:

1. \`## ${SECTIONS.highlights}\` — 3-5 bullets on the most noteworthy items of the week, across the page's sections.
2. The line \`${TABLES_MARKER}\` exactly once, on its own line. The page is inserted there.
3. \`## ${SECTIONS.signals}\` — 200-300 words: patterns across the week's tables, such as which kinds of agent or coding tool are getting attention, which model families lead usage, and which research directions recur. This is the one place for trend claims: each must rest on two or more rows.

Rules:
- ${NO_TITLE_RULE}
- In ${SECTIONS.highlights}: ${goingAwayRule("bullet")}
- Do not reproduce or alter the tables, and write no other sections.
- Base every claim on the page. It shows descriptions, summaries and counts only, so do not describe releases, adoption or community reactions it does not show.
- Mention only items that appear on the page, and link every item you mention.
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
- English, professional and concise.
`;
}

/** A story's line in a summaries prompt: title, source, site, counts and its description. */
const storyLine = (r: Omit<StoryRow, "n">): string =>
  `${r.title} (${SPOTTED.sources[r.source]}, ${siteOf(r.url) || r.url}, ${SPOTTED.counts(r.source, r.points, r.comments)}) — ${r.description ? `description: ${r.description}` : "(no description)"}`;

/**
 * The story summary rules, shared by Spotted and Trends' Most discussed. A story
 * without a description gets `—`: a sentence on its title and site only restated
 * the row ("The story titled 'X' is from openai.com", 2026-10-23).
 */
const STORY_RULES = `- A story with a description: 2 sentences taken from it. Without one: write \`N: —\`; the table shows its title and site.
- Describe no comment thread or community reaction, and no claim, method or result a story's title and description do not state.`;

/**
 * Spotted, one call for every page's rows: one summary per numbered story.
 * The rows are numbered by selectSpotted; parseRowSummaries reads the reply.
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
 * Weekly Trends, one call for the Research rows (numbered first) and the Most
 * discussed rows (numbered after them). parseRowSummaries reads the reply.
 */
export function buildTrendsSummariesPrompt(
  papers: Numbered<ResearchPaper>[],
  stories: StoryRow[],
  dateStr: string,
): string {
  const list = [
    rowList(papers, (p) => `${p.title} (arXiv paper) — abstract: ${p.abstract}`),
    rowList(stories, storyLine),
  ]
    .filter(Boolean)
    .join("\n");
  const count = papers.length + stories.length;
  return `You summarize research papers and community stories for AI practitioners.

Below are ${count} numbered items of the week ending ${dateStr}: ${[papers.length && "arXiv papers, each with its abstract (cut)", stories.length && "the week's most discussed community stories (Hacker News, Lobste.rs, Dev.to), each with its source, the linked site, its counts and, where given, a description"].filter(Boolean).join(", then ")}. You have read neither the full papers, the articles nor the comment threads.

${list}

${summaryLine("1-2 sentences")}.
- A paper: 2 sentences from its abstract: what it shows. No claim, number or result the abstract does not state.
${STORY_RULES}
${summaryOutputRule(count)}
- English.
`;
}

/**
 * The models page's one summaries call: its lab posts (numbered first) and its
 * newly listed models (numbered after them). parseRowSummaries reads the reply.
 * An OpenAI post has no page content: its title comes from the URL slug.
 */
export function buildModelsSummariesPrompt(
  posts: Numbered<WebPageItem>[],
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
- When the text adds nothing beyond the title (or is empty), write \`N: —\` for that item.${releases.length ? "\n- For a release: its most important change for users in 1 sentence; say so first when it is a major version (only a version x.0.0 is a major version) or its notes name breaking changes. Notes are cut at ${RELEASE_BODY_CHARS} characters: summarize what they show, and never say they are cut." : ""}
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
export function buildDataProsePrompt(sectionsMd: string, dateStr: string): string {
  const parts = [
    `\`## ${SECTIONS.highlights}\` — 3-5 bullets, the most consequential changes today, deprecations, retirements and breaking changes first. Each bullet says who is affected (which client setup: e.g. Azure Databricks workspaces with the compliance security profile, Snowflake Native App providers, BigQuery users of AI functions), what to do (enable, migrate, test, plan for) and by when, if the row gives a date.`,
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
- In ${SECTIONS.highlights}: ${goingAwayRule("bullet")}
- Length: at most ~200 words for ${SECTIONS.highlights}, ~120 for ${DATA_REPORT.acrossPlatforms}.
- A major release in ${DATA_REPORT.releasesHeading} (a version x.0.0, or one whose summary names breaking changes) is a Highlights candidate: say who must test or migrate.
- Never restate a row: the reader sees the tables right below. A bullet that only says what changed, without who is affected and what to do, is left out.
- Write no links, URLs or other sections; name each item as the sections do. Dates only as the "by when" of a row that gives one.
- Name each item in at most one bullet of ${SECTIONS.highlights}; ${DATA_REPORT.acrossPlatforms} compares rows, so it may name a row again. Two rows that describe the same change (a release note and its behavior change bundle, a "coming soon" note and its GA note) are one item: mention it once.
- Base every claim on the sections. Do not invent versions, dates or availability.
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
// Repo reports open with a link list and an activity-count table; a 2000-char
// window ended there, so the model only had counts to work with ("3
// prereleases", "337 open issues"). 8000 reaches through the comparison prose.
const HIGHLIGHTS_EXCERPT_CHARS = 8000;

export function buildHighlightsPrompt(
  reportContents: Record<string, string>,
  forced: readonly string[] = [],
  maxPerReport: number = HIGHLIGHTS_MAX_PER_REPORT,
): string {
  const forcedRule = forced.length
    ? `\n- ${forced.map((id) => FORCED_REASON[id] ?? id).join(" and ")} ${forced.length === 1 ? "was" : "were"} already judged relevant to this reader: give ${forced.length === 1 ? "that report" : "each of those reports"} at least 1 highlight`
    : "";

  const sections = Object.entries(reportContents)
    .map(([id, content]) => `## [${id}]\n\n${content.slice(0, HIGHLIGHTS_EXCERPT_CHARS)}`)
    .join("\n\n---\n\n");

  // The count is a maximum, not a quota, and the exclusion list is explicit: a
  // fixed 6-per-report quota padded every section with routine noise
  // ("2 nightly builds", "200 commits", star counts).
  return `You are a selective news editor. The following are today's AI ecosystem report excerpts, each labeled with a report ID. The reader is a developer who wants to know what actually changed in the AI tooling world today and why it matters to them, who follows AI policy for work (the ai-policy report), and who passes data-platform changes on to data-engineering colleagues working on Databricks, Snowflake and the open-source data stack (the ai-data report).

${sections}

---

For each report, pick AT MOST ${maxPerReport} highlights that this reader would genuinely care about. Fewer is better than filler: return 1 or 0 when only 1 or 0 items qualify.

Each highlight is one sentence of at most ${HIGHLIGHT_MAX_CHARS} characters that says what happened AND why it matters (the concrete change, capability or consequence).
Good: "Claude Code adds background subagents, so long refactors keep running while you keep chatting"
Bad: "Claude Code v2.1.288 released" (no content)  ·  "Copilot CLI ships three prereleases" (routine)

Qualifies:
- A user-visible feature, breaking change, or deprecation, named concretely
- A security fix or vulnerability with real impact
- Support for a specific new model or hardware platform
- A concrete announcement, launch, paper result, or project with a clear new capability
- A discussion with a specific, non-obvious takeaway
- A law, regulation, official guidance or enforcement decision that was published, adopted or moved to a new stage, or a consultation opening, with what it means for organisations that deploy AI
- For ai-data: a deprecation, retirement or breaking change in Databricks, Snowflake, Azure / Fabric, BigQuery or a tracked data project, or a major platform feature (generally available or in public preview), with what it means for client data platforms

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
 * The highlights as saved: each one's going-away sign normalized (`signHighlight`), with a
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
 * Weekly Trends' Models section: OpenRouter token usage and Hugging Face
 * trending models, only the `###` parts whose source has data. Either source
 * alone is enough for the call.
 */
export function buildTrendsModelsPrompt(data: HfData, openrouter: OpenRouterData, dateStr: string): string {
  const T = TRENDS_REPORT;
  const { hasHf, hasOpenRouter } = modelSources(data, openrouter);
  const usage = openrouter.topModels
    .map((m, i) => `${i + 1}. ${m.slug} — ${formatTokens(m.tokens)} tokens`)
    .join("\n");
  const modelsText = data.models
    .map(
      (m, i) =>
        `${i + 1}. **${m.id}**\n` +
        `   Link: ${m.url}\n` +
        `   Author: ${m.author} | Pipeline: ${m.pipelineTag || "N/A"}\n` +
        `   Likes: ${m.likes.toLocaleString()} | Downloads: ${m.downloads.toLocaleString()}\n` +
        `   Tags: ${m.tags.slice(0, 5).join(", ")}`,
    )
    .join("\n\n");

  const inputs = [
    hasOpenRouter ? `OpenRouter top models by tokens (${openrouter.topModelsDate}):\n\n${usage}` : "",
    hasHf
      ? `Hugging Face Hub trending models (${data.models.length}, sorted by weekly likes):\n\n${modelsText}`
      : "",
  ].filter(Boolean);

  const parts = [
    hasOpenRouter &&
      `\`### ${T.openRouterHeading}\` — 3-5 bullets: which models lead token usage and notable newcomers in the top list. Copy token figures verbatim; link each model as https://openrouter.ai/<slug>.`,
    hasHf &&
      `\`### ${T.hfHeading}\` — one **Markdown table** with exactly these columns:

   | Model | Author | Likes | Downloads | Summary |
   | :--- | :--- | ---: | ---: | :--- |

   - **Model**: model name as a Markdown link to its HF URL
   - **Likes / Downloads**: copy the numbers from the input verbatim (keep the thousands separators; do not recompute or round)
   - **Summary**: 1-2 sentences — what it is, from its pipeline and tags`,
  ].filter(Boolean);

  return `You are an AI model ecosystem analyst. The following are this week's model signals as of ${dateStr}:

---

${inputs.join("\n\n---\n\n")}

---

Write only these parts, in this order:

${parts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Rules:
- ${NO_TITLE_RULE}
- No Highlights, Signals or other sections: they are written elsewhere on the page.
- Base every claim on the data above. Do not invent releases, benchmarks or capabilities.
- English, concise and professional, preserve all links.
`;
}
