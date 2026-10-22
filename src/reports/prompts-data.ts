/**
 * LLM prompt builders for data-source reports (trending, the models page, Spotted, policy, data).
 *
 * Separated from prompts.ts to keep each module focused.
 */

import type { WebPageItem } from "../sources/web.ts";
import type { TrendingData } from "../trending/trending.ts";
import type { summaryRows } from "../trending/rank.ts";
import { formatTokens, type OpenRouterData, type OpenRouterNewModel } from "../sources/openrouter.ts";
import {
  ARXIV_REPORT,
  DATA_REPORT,
  MODELS_PAGE,
  MODELS_REPORT,
  MSG,
  SECTIONS,
  SPOTTED,
} from "../core/i18n.ts";
import { TABLES_MARKER, rowList, summaryLine, summaryOutputRule, type Numbered } from "./summarized-table.ts";
import { NO_TITLE_RULE, RELEASE_BODY_CHARS, releaseNotes } from "./prompts.ts";
import type { ReleaseRow } from "./data-reports.ts";
import type { ArxivData } from "../sources/arxiv.ts";
import type { HfData } from "../sources/hf.ts";
import type { PolicyItem } from "../policy/policy.ts";
import type { KeptVendorItem } from "../data/jev.ts";
import { siteOf, type SpottedRow } from "../spotted/spotted.ts";

/** Which sources the models report covers; the prompt and the report's sources line both read it. */
export function modelSources(hf: HfData, openrouter: OpenRouterData) {
  return {
    hasHf: hf.fetchSuccess,
    hasOpenRouter: openrouter.topModels.length > 0 || openrouter.newModels.length > 0,
  };
}

/** OpenRouter model usage. Empty string when there is no model data. */
function buildModelUsageData(openrouter: OpenRouterData): string {
  const { topModels, topModelsDate, newModels } = openrouter;
  const sections: string[] = [];
  if (topModels.length > 0) {
    sections.push(
      `## OpenRouter Top Models by Tokens (${topModelsDate})\n` +
        topModels.map((m, i) => `${i + 1}. ${m.slug} — ${formatTokens(m.tokens)} tokens`).join("\n"),
    );
  }
  if (newModels.length > 0) {
    sections.push(
      `## Models Newly Listed on OpenRouter (last 8 days)\n` +
        newModels
          .map(
            (m) =>
              `- ${m.name} (\`${m.id}\`) | listed ${m.created} | ${m.contextLength.toLocaleString()} ctx` +
              (m.description ? `\n  ${m.description.slice(0, 300)}` : ""),
          )
          .join("\n"),
    );
  }
  return sections.join("\n\n---\n\n");
}

/**
 * Weekly trending, call 1 of 2: one 2-sentence summary per numbered table row.
 * The rows were selected and ranked in code; parseRowSummaries reads the reply.
 */
export function buildTrendingSummariesPrompt(rows: ReturnType<typeof summaryRows>, dateStr: string): string {
  const list = rowList(
    rows,
    (r) => `${r.name} — ${r.description || "(no description)"}${r.facts ? ` — ${r.facts}` : ""}`,
  );
  return `You are a technical analyst covering AI coding tools, agents and agent harnesses. Below are ${rows.length} numbered projects and tools from the agent & AI coding trends report for the week ending ${dateStr}, each with its description and where it was found.

${list}

${summaryLine("2 sentences")} — what it is and why it matters to developers.
- Ground every sentence only in the given description. Do not invent features, users, releases or numbers.
- No star, gain, download, token or rank figures: the table shows them next to the summary.
- If the description is empty, say only what the name shows, in one sentence.
${summaryOutputRule(rows.length)}
- English.
`;
}

/**
 * Weekly trending, call 2 of 2: the prose sections around the code-rendered
 * tables. The model places TABLES_MARKER where spliceTables
 * inserts the tables.
 */
export function buildTrendingProsePrompt(tablesMd: string, data: TrendingData, dateStr: string): string {
  return `You are a technical analyst covering AI coding tools, agents and agent harnesses. Below are this week's tables for the agent & AI coding trends report, week ending ${dateStr}. They were selected and ranked in code from GitHub Trending (weekly), GitHub topic search, OpenRouter app rankings and npm downloads; the Summary column holds the project descriptions. 🆕 in the Signal column means created or listed in the last 14 days; 🔥 before a name means the item was also in last week's report.

${tablesMd || "(No projects were selected this week.)"}

---

Write the prose sections of the report, in this order:

1. \`## ${SECTIONS.highlights}\` — 3-5 sentences on the most noteworthy agent and AI-coding developments this week.
2. The line \`${TABLES_MARKER}\` exactly once, on its own line. The tables are inserted there.
3. \`## ${SECTIONS.signals}\` — 200-300 words: which kinds of agent or coding tool are getting attention, and any new harness or orchestration patterns.
4. \`## ${SECTIONS.worthALook}\` — 3-5 bullets: specific projects or directions worth developer focus, with brief reasoning.

Rules:
- ${NO_TITLE_RULE}
- Do not reproduce or alter the tables.
- Base every claim on the tables and the data above. They show descriptions and counts only, so do not describe releases, adoption or community reactions they do not show.
- Mention only projects that appear in the tables, and link every project you mention.
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
export function buildPolicyProsePrompt(tableMd: string, dateStr: string, readerProfile: string): string {
  return `You are a policy analyst covering AI legislation, regulation and official guidance in the EU, the Netherlands and the US. The reader: ${readerProfile}

Below is today's table of new items from official sources and news & commentary outlets, ${dateStr}; the Summary column holds summaries of each item.

${tableMd}

---

Write only \`## ${SECTIONS.highlights}\`: 2-4 sentences on the most consequential items today. The table goes below it.

Rules:
- ${NO_TITLE_RULE}
- Do not reproduce or alter the table.
- Base every claim on the table. Do not invent obligations, dates, stages or legal status: a wrong legal status is worse than none.
- Mention only items that appear in the table, and link every item you mention.
- English, professional and concise.
`;
}

/**
 * Spotted, one call for every page's rows: one summary per numbered story.
 * The rows are numbered by selectSpotted; parseRowSummaries reads the reply.
 * The model sees titles, sites, counts and descriptions, never the article or
 * the thread: on 2026-10-19 summaries of HN titles alone guessed what an article argues.
 */
export function buildSpottedSummariesPrompt(rows: SpottedRow[], dateStr: string): string {
  const list = rowList(
    rows,
    (r) =>
      `${r.title} (${SPOTTED.sources[r.source]}, ${siteOf(r.url) || r.url}, ${SPOTTED.counts(r.source, r.points, r.comments)}) — ${r.description ? `description: ${r.description}` : "(no description)"}`,
  );
  return `You summarize community stories (Hacker News, Lobste.rs, Dev.to) for AI and data practitioners.

Below are ${rows.length} numbered stories as of ${dateStr}, each with its source, the linked site, its counts and, where given, a description (the linked page's own for Hacker News, the author's for Dev.to). You have read neither the article nor the comment thread.

${list}

${summaryLine("1-2 sentences")} — what the story is about.
- With a description: 2 sentences taken from it. Without one: 1 sentence saying only what the title and the site say.
- Describe no comment thread or community reaction, and no claim, method or result the title and description do not state.
${summaryOutputRule(rows.length)}
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
        `${r.project.name} ${r.release.tag_name} (release, ${r.release.published_at.slice(0, 10)}) — ${releaseNotes(r.release.body, RELEASE_BODY_CHARS) || "(no release notes)"}`,
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
- At most ${maxPerReport} highlights per report, each at most ${HIGHLIGHT_MAX_CHARS} characters${forcedRule}`;
}

const FORCED_REASON: Record<string, string> = {
  "ai-policy": "Every item in ai-policy",
  "ai-data": "every vendor release-note row in ai-data",
};

/**
 * The reports that always get a highlight when published: Policy Watch, whose
 * every item Jev kept, and the data report only on a day Jev kept a vendor
 * item (a day of repo activity alone holds routine releases and hot issues,
 * which the model may rightly skip). On 2026-10-20 the model left Policy Watch
 * out though it carried the AI Act's first harmonised standard in the OJ.
 */
export function forcedHighlightReports(hasVendorItems: boolean): string[] {
  return hasVendorItems ? ["ai-policy", "ai-data"] : ["ai-policy"];
}

/**
 * The highlights with a fallback for each `forced` report the model left out:
 * the first sentence of that report's own Highlights section.
 */
export function withFallbackHighlights(
  highlights: ReportHighlights,
  reportContents: Record<string, string>,
  forced: readonly string[],
): ReportHighlights {
  const out = { ...highlights };
  for (const id of forced) {
    const content = reportContents[id];
    if (out[id]?.length || !content) continue;
    const line = firstHighlight(content);
    if (line) out[id] = [line];
  }
  return out;
}

// A period after one of these, or inside a dotted abbreviation (U.S., E.U.), ends no
// sentence: Policy Watch prose cites "Art. 50", "the U.S. Senate" and
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
// ArXiv prompt
// ---------------------------------------------------------------------------

export function buildArxivPrompt(data: ArxivData, dateStr: string): string {
  const papersText = data.papers
    .map((p, i) => {
      const authors =
        p.authors.length > 3 ? p.authors.slice(0, 3).join(", ") + " et al." : p.authors.join(", ");
      const cats = p.categories.slice(0, 3).join(", ");
      return (
        `${i + 1}. **${p.title}**\n` +
        `   Link: ${p.url}\n` +
        `   Authors: ${authors} | Categories: ${cats}\n` +
        `   Published: ${p.published.slice(0, 10)}\n` +
        `   Abstract: ${p.summary}`
      );
    })
    .join("\n\n");

  const order =
    data.rankedBy === "jev"
      ? "pre-selected for relevance to LLM and agent practitioners, most relevant first"
      : "the most recent submissions";
  return `You are an AI research analyst. The following are recent AI-related papers from ArXiv as of ${dateStr} (${data.papers.length} papers from cs.AI, cs.CL, cs.LG, ${order}):

---

${papersText}

---

Write the report in English with these sections. ${NO_TITLE_RULE}

## ${SECTIONS.highlights}
3-5 sentences on the most significant research directions and breakthroughs.

## ${ARXIV_REPORT.papersHeading}
The 8-15 most important papers, organized by theme: a \`### <theme>\` heading per theme, each followed by a **Markdown table** with exactly these columns:

   | Paper | Authors | Summary |
   | :--- | :--- | :--- |

   - **Paper**: title as a Markdown link to its ArXiv URL
   - **Authors**: abbreviated (first 3 + et al.)
   - **Summary**: 2 sentences — the key contribution and why it matters
   - Omit a theme if no paper falls under it

   Themes:
   - 🧠 Large Language Models (architecture, training, alignment, evaluation)
   - 🤖 Agents & Reasoning (planning, tool use, multi-agent, chain-of-thought)
   - 🔧 Methods & Frameworks (new techniques, benchmarks, efficiency improvements)
   - 📊 Applications (domain-specific, multimodal, code generation)

## ${SECTIONS.signals}
100-200 words on emerging research directions visible in these submissions.

## ${SECTIONS.worthALook}
2-3 papers most worth reading in full, with reasoning. Each bullet opens with the paper's title as a Markdown link to its ArXiv URL.

Style: English, concise and professional, preserve all ArXiv links.
`;
}

// ---------------------------------------------------------------------------
// Hugging Face prompt
// ---------------------------------------------------------------------------

/**
 * The weekly models report: Hugging Face trending models and OpenRouter token
 * usage (in the trending report until October 2026). Either source alone is
 * enough for a report.
 */
export function buildModelsPrompt(data: HfData, openrouter: OpenRouterData, dateStr: string): string {
  const M = MODELS_REPORT;
  const { hasHf, hasOpenRouter } = modelSources(data, openrouter);
  const modelData = buildModelUsageData(openrouter);
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
    hasHf
      ? `Hugging Face Hub trending models (${data.models.length}, sorted by weekly likes):\n\n${modelsText}`
      : "",
    hasOpenRouter ? `OpenRouter:\n\n${modelData}` : "",
  ].filter(Boolean);

  const hfSection = `## ${M.hfHeading}
Organized by category: a \`### <category>\` heading per category, each followed by a **Markdown table** with exactly these columns:

   | Model | Author | Likes | Downloads | Summary |
   | :--- | :--- | ---: | ---: | :--- |

   - **Model**: model name as a Markdown link to its HF URL
   - **Likes / Downloads**: copy the numbers from the input verbatim (keep the thousands separators; do not recompute or round)
   - **Summary**: 2 sentences — what it is and why it's trending, including a standout capability or data point
   - Omit a category if no model falls under it

   Categories:
   - 🧠 Language Models (LLMs, chat models, instruction-tuned)
   - 🎨 Multimodal & Generation (image, video, audio, text-to-X)
   - 🔧 Specialized Models (code, math, medical, embeddings)
   - 📦 Fine-tunes & Quantizations (community fine-tunes, GGUF, AWQ)

`;
  const openRouterSection = `## ${M.openRouterHeading}
3-5 bullets: which models lead token usage, notable newcomers in the top list, and newly listed models worth trying for agentic work. Copy token figures verbatim; link each model as https://openrouter.ai/<id>.

`;

  return `You are an AI model ecosystem analyst. The following are this week's model signals as of ${dateStr}:

---

${inputs.join("\n\n---\n\n")}

---

Write the report in English with these sections. ${NO_TITLE_RULE}

## ${SECTIONS.highlights}
3-5 sentences on the most notable model releases and trends this week.

${hasHf ? hfSection : ""}${hasOpenRouter ? openRouterSection : ""}## ${SECTIONS.signals}
100-200 words analyzing model ecosystem trends:
   - Which model families are gaining momentum?
   - Open-weight vs proprietary trends
   - Notable quantization or fine-tuning activity

## ${SECTIONS.worthALook}
2-3 models most worth trying or studying, with reasoning. Each bullet opens with the model's name as a Markdown link, the same link as elsewhere in the report.

Style: English, concise and professional, preserve all links.
`;
}
