/**
 * LLM prompt builders for data-source reports (trending, web, HN).
 *
 * Separated from prompts.ts to keep each module focused.
 */

import type { WebFetchResult } from "./web.ts";
import type { TrendingData } from "./trending.ts";
import type { summaryRows } from "./trending-rank.ts";
import { formatTokens, type OpenRouterData } from "./openrouter.ts";
import { ARXIV_REPORT, DISCUSSIONS_REPORT, MODELS_REPORT, SECTIONS, WEB_REPORT } from "./i18n.ts";
import { TRENDING_TABLES_MARKER } from "./report-builders.ts";
import { NO_TITLE_RULE } from "./prompts.ts";
import type { HnData } from "./hn.ts";
import type { ArxivData } from "./arxiv.ts";
import type { HfData } from "./hf.ts";
import type { DevtoData } from "./devto.ts";
import type { LobstersData } from "./lobsters.ts";
import type { PolicyItem } from "./policy.ts";

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
  const list = rows
    .map((r) => `${r.n}. ${r.name} — ${r.description || "(no description)"} — ${r.facts}`)
    .join("\n");
  return `You are a technical analyst covering AI coding tools, agents and agent harnesses. Below are ${rows.length} numbered projects and tools from the agent & AI coding trends report for the week ending ${dateStr}, each with its description and the facts measured this week.

${list}

For every numbered item write exactly one line in the form \`N: <2 sentences>\` — what it is and why it is worth attention this week.
- Ground every sentence only in the given description and facts. Do not invent features, users, releases or numbers.
- If the description is empty, say only what the name and the facts show.
- Output one line per item, ${rows.length} lines in total, in the given order. No other text: no headings, no introduction, no blank lines.
- English.
`;
}

/**
 * Weekly trending, call 2 of 2: the prose sections around the code-rendered
 * tables. The model places TRENDING_TABLES_MARKER where spliceTrendingProse
 * inserts the tables.
 */
export function buildTrendingProsePrompt(tablesMd: string, data: TrendingData, dateStr: string): string {
  return `You are a technical analyst covering AI coding tools, agents and agent harnesses. Below are this week's tables for the agent & AI coding trends report, week ending ${dateStr}. They were selected and ranked in code from GitHub Trending (weekly), GitHub topic search, OpenRouter app rankings and npm downloads; the Summary column holds the project descriptions.

${tablesMd || "(No projects were selected this week.)"}

---

Write the prose sections of the report, in this order:

1. \`## ${SECTIONS.highlights}\` — 3-5 sentences on the most noteworthy agent and AI-coding developments this week.
2. The line \`${TRENDING_TABLES_MARKER}\` exactly once, on its own line. The tables are inserted there.
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
 * The rows are the day's new feed items in feed order; parseRowSummaries reads the reply.
 */
export function buildPolicySummariesPrompt(items: PolicyItem[], dateStr: string): string {
  const list = items
    .map(
      (it, i) =>
        `${i + 1}. ${it.title} (${it.source}, ${it.published.slice(0, 10)}) — ${it.description || "(no description)"}`,
    )
    .join("\n");
  return `You are a policy analyst covering AI legislation, regulation and official guidance for an AI practitioner in the Netherlands. Below are ${items.length} numbered items from official sources, new as of ${dateStr}, each with its source, date and text.

${list}

For every numbered item write exactly one line in the form \`N: <2 sentences>\` — what was published or decided, and what it means for organisations that deploy AI.
- Ground every sentence only in the given text. Do not invent obligations, dates, stages or legal status.
- If the text is empty, say only what the title shows.
- Output one line per item, ${items.length} lines in total, in the given order. No other text: no headings, no introduction, no blank lines.
- English.
`;
}

/**
 * Policy report, call 2 of 2: the prose sections around the code-rendered
 * table, which spliceTrendingProse inserts at TRENDING_TABLES_MARKER.
 */
export function buildPolicyProsePrompt(tableMd: string, dateStr: string): string {
  return `You are a policy analyst covering AI legislation, regulation and official guidance in the EU, the Netherlands and the US, for an AI practitioner in the Netherlands who deploys AI built by others. Below is today's table of new items from official sources, ${dateStr}; the Summary column holds summaries of each item.

${tableMd}

---

Write the prose sections of the report, in this order:

1. \`## ${SECTIONS.highlights}\` — 2-4 sentences on the most consequential items today.
2. The line \`${TRENDING_TABLES_MARKER}\` exactly once, on its own line. The table is inserted there.
3. \`## ${SECTIONS.signals}\` — 100-200 words: where policy is moving and what it means for organisations that deploy AI.
4. \`## ${SECTIONS.worthALook}\` — 1-3 bullets: items worth reading in full, with brief reasoning.

Rules:
- ${NO_TITLE_RULE}
- Do not reproduce or alter the table.
- Base every claim on the table. Do not invent obligations, dates, stages or legal status: a wrong legal status is worse than none.
- Mention only items that appear in the table, and link every item you mention.
- English, professional and concise.
`;
}

export function buildWebReportPrompt(results: WebFetchResult[], dateStr: string): string {
  const isAnyFirstRun = results.some((r) => r.isFirstRun);

  const siteSections = results
    .map(({ siteName, isFirstRun, newItems, totalDiscovered }) => {
      const mode = isFirstRun
        ? `First full crawl (sitemap total ${totalDiscovered} URLs, showing latest ${newItems.length} articles)`
        : `Incremental update, ${newItems.length} new articles today`;

      if (newItems.length === 0) {
        const noContent = `(${mode}, no content to analyze.)`;
        return `## ${siteName}\n\n${noContent}`;
      }

      const categoryLabel = "Category";
      const dateLabel = "Published/Updated";
      const unknownDate = "unknown";
      const excerptLabel = "Excerpt";
      const metadataOnlyNote =
        "(metadata-only: title derived from URL slug, may be inaccurate; no article text available)";
      const itemsText = newItems
        .map((item) => {
          const lines = [
            `### [${item.title || item.url}](${item.url})`,
            `- ${categoryLabel}: ${item.category} | ${dateLabel}: ${item.lastmod.slice(0, 10) || unknownDate}`,
          ];
          if (item.content) {
            lines.push(`- ${excerptLabel}: ${item.content}`);
          } else {
            lines.push(`- ${metadataOnlyNote}`);
          }
          return lines.join("\n");
        })
        .join("\n\n");

      const lp = "(";
      const rp = ")";
      return `## ${siteName}${lp}${mode}${rp}\n\n${itemsText}`;
    })
    .join("\n\n---\n\n");

  const firstRunNote = isAnyFirstRun
    ? "This is the first full crawl. Please focus on the overall content landscape, historical context, and core themes of each site, rather than individual articles."
    : "This is an incremental update. Please focus on today's new content and assess its strategic significance in context.";

  return `You are a deep content analyst focused on AI, skilled at extracting strategic signals from official announcements, technical blogs, research papers, and product documentation.

The following content was crawled on ${dateStr} from Anthropic (claude.com / anthropic.com) and OpenAI (openai.com). ${firstRunNote}

${siteSections}

---

Write the report in English with these sections. ${NO_TITLE_RULE}

## ${SECTIONS.highlights}
3-5 sentences on the most important new releases or developments.

## ${WEB_REPORT.anthropicHeading}
Important content grouped by category (news / research / engineering / learn, etc.) under \`###\` subheadings:
- For each piece, 2-4 sentences extracting core insights, technical details, or business significance
- Note publication date and original link
- If first full crawl, trace important milestones chronologically
Omit this section when Anthropic has no new content.

## ${WEB_REPORT.openaiHeading}
Same structure, grouped by research / release / company / safety. Omit this section when OpenAI has no new content.
- ⚠️ Note: OpenAI data is metadata-only (titles derived from URL slugs, no article text). Only list URLs and categories objectively. Do NOT speculate on title meanings or fabricate content summaries. If information is insufficient for analysis, state the data limitation clearly.

## ${SECTIONS.signals}
Based on both companies' release cadence and content focus:
- Each company's recent technical priorities (model capabilities / safety / productization / ecosystem)
- Competitive dynamics: who is setting the agenda, who is following
- Potential impact on developers and enterprise users
- Hidden signals in titles, phrasing and timing: new terms, dense releases in one category, policy and safety developments

## ${SECTIONS.worthALook}
1-3 pieces most worth reading in full, with brief reasoning.

${isAnyFirstRun ? `## ${WEB_REPORT.landscapeHeading}\nFirst full crawl only: summarize the content category distribution for both companies and describe their content strategy style (academic-oriented vs product-oriented vs user stories, etc.)\n\n` : ""}Style: English, professional and detailed, suited for AI researchers, product managers, and technical decision-makers. Every item must include official links.
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
  maxPerReport: number = HIGHLIGHTS_MAX_PER_REPORT,
): string {
  const sections = Object.entries(reportContents)
    .map(([id, content]) => `## [${id}]\n\n${content.slice(0, HIGHLIGHTS_EXCERPT_CHARS)}`)
    .join("\n\n---\n\n");

  // The count is a maximum, not a quota, and the exclusion list is explicit: a
  // fixed 6-per-report quota padded every section with routine noise
  // ("2 nightly builds", "200 commits", star counts).
  return `You are a selective news editor. The following are today's AI ecosystem report excerpts, each labeled with a report ID. The reader is a developer who wants to know what actually changed in the AI tooling world today and why it matters to them, and who follows AI policy for work (the ai-policy report).

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

Never include:
- Routine releases: nightlies, alphas, prereleases, build-number ranges, or a version number without saying what it changes
- Raw counts: commits, issues, PRs, open items, stars, comments, points
- CI status, flaky tests, pending upgrades, "in progress" or "targets" items with no shipped result
- Generic trend statements ("X dominates", "Y remains active", "Z gains attention")

Return ONLY valid JSON, no markdown fences, no explanation. Format:
{"ai-agents":["highlight 1",...],"ai-hn":["highlight 1",...],...}

Rules:
- Use the exact report IDs from the [brackets] above as keys
- Omit a report's key entirely when nothing in it qualifies, or when it contains only failure messages
- At most ${maxPerReport} highlights per report, each at most ${HIGHLIGHT_MAX_CHARS} characters`;
}

/** The discussions report's sources. Dev.to and Lobste.rs are fetched on the weekly run only. */
export interface DiscussionsData {
  hn: HnData;
  devto: DevtoData;
  lobsters: LobstersData;
}

/**
 * Which sources the discussions report covers; the prompt and the report's
 * sources line both read it. HN alone stays in even when empty; next to a
 * weekly source an empty HN gets no section.
 */
export function discussionSources({ hn, devto, lobsters }: DiscussionsData) {
  const hasDevto = devto.fetchSuccess && devto.articles.length > 0;
  const hasLobsters = lobsters.fetchSuccess && lobsters.stories.length > 0;
  const hasHn = hn.fetchSuccess && (hn.stories.length > 0 || !(hasDevto || hasLobsters));
  return { hasHn, hasDevto, hasLobsters };
}

/**
 * The discussions report: Hacker News daily, plus Dev.to and Lobste.rs on the
 * weekly run — one report since October 2026, when the weekly community
 * report was folded in. A source that failed or was not fetched gets neither
 * input nor section.
 */
export function buildDiscussionsPrompt(data: DiscussionsData, dateStr: string): string {
  const { hn, devto, lobsters } = data;
  const { hasHn, hasDevto, hasLobsters } = discussionSources(data);
  const weekly = hasDevto || hasLobsters;

  const inputs: string[] = [];
  const sections: string[] = [];
  if (hasHn) {
    inputs.push(
      `## Hacker News (current topstories feed, ${hn.stories.length} AI stories, ordered by HN rank)\n\n` +
        hn.stories
          .map(
            (s, i) =>
              `${i + 1}. **${s.title}**\n` +
              `   Link: ${s.url}\n` +
              `   Discussion: ${s.hnUrl}\n` +
              `   HN Rank: ${s.hnRank ?? i + 1} | Score: ${s.points} | Comments: ${s.comments} | Author: ${s.author} | Time: ${s.createdAt.slice(0, 16)}`,
          )
          .join("\n\n"),
    );
    sections.push(`## ${DISCUSSIONS_REPORT.hnHeading}
Organized by category: a \`### <category>\` heading per category, each followed by a **Markdown table** with exactly these columns:

   | Title | Score | Comments | Summary |
   | :--- | ---: | ---: | :--- |

   - **Title**: title as a Markdown link to the original article, followed by a " · [HN](discussion-url)" link to the HN thread
   - **Score / Comments**: copy the numbers from the input verbatim
   - **Summary**: 2 sentences — what the item is and why it matters to developers. Do not describe the comments: you have not read them. If the title does not say what the item is, do not guess
   - Select the 2-5 most representative items per category; omit a category if it is empty

   Categories:
   - 🔬 Models & Research (new model releases, papers, benchmarks)
   - 🛠️ Tools & Engineering (open-source projects, frameworks, engineering practices)
   - 🏢 Industry News (company news, funding, product launches)
   - 💬 Opinions & Debates (notable Ask HN, Show HN, or hot discussion threads)`);
  }
  if (hasDevto) {
    inputs.push(
      `## Dev.to (top AI articles of the week, ${devto.articles.length} articles)\n\n` +
        devto.articles
          .map(
            (a, i) =>
              `${i + 1}. **${a.title}**\n` +
              `   Link: ${a.url}\n` +
              `   Author: ${a.user} | Reactions: ${a.positiveReactionsCount} | Comments: ${a.commentsCount} | Reading: ${a.readingTimeMinutes} min\n` +
              `   Tags: ${a.tags.join(", ")}\n` +
              `   ${a.description}`,
          )
          .join("\n\n"),
    );
    sections.push(`## ${DISCUSSIONS_REPORT.devtoHeading}
The 5-10 most valuable articles as a **Markdown table**:

   | Article | Reactions | Comments | Summary |
   | :--- | ---: | ---: | :--- |

   - **Article**: title as a Markdown link
   - **Reactions / Comments**: copy the numbers from the input verbatim
   - **Summary**: 2 sentences — the key takeaway for developers`);
  }
  if (hasLobsters) {
    inputs.push(
      `## Lobste.rs (AI/ML stories of the last 7 days, ${lobsters.stories.length} stories)\n\n` +
        lobsters.stories
          .map(
            (s, i) =>
              `${i + 1}. **${s.title}**\n` +
              `   Link: ${s.url}\n` +
              `   Discussion: ${s.commentsUrl}\n` +
              `   Score: ${s.score} | Comments: ${s.commentCount} | Author: ${s.author} | Tags: ${s.tags.join(", ")}`,
          )
          .join("\n\n"),
    );
    sections.push(`## ${DISCUSSIONS_REPORT.lobstersHeading}
The 3-8 most notable stories as a **Markdown table**:

   | Story | Score | Comments | Summary |
   | :--- | ---: | ---: | :--- |

   - **Story**: title as a Markdown link, followed by " · [discuss](discussion-url)"
   - **Score / Comments**: copy the numbers from the input verbatim
   - **Summary**: 2 sentences — why it's worth reading`);
  }

  const when = weekly ? "today on Hacker News and this week on Dev.to and Lobste.rs" : "today on Hacker News";
  return `You are an AI industry news analyst. The following are AI-related posts from developer communities as of ${dateStr}. You have only each item's title, link, counts and (for Dev.to) description — not the article and not the comment thread:

---

${inputs.join("\n\n---\n\n")}

---

Write the report in English with these sections. ${NO_TITLE_RULE}

## ${SECTIONS.highlights}
3-5 sentences on the hottest AI topics ${when}, judged by score and comment count.

${sections.join("\n\n")}

## ${SECTIONS.signals}
100-200 words on what developers are discussing, from the titles and counts alone:
   - Which topics are most active (high score + high comments)?
   - Which stories draw far more comments than points — a sign of a contested topic?${weekly ? "\n   - Practical concerns, tutorials or patterns that recur across the communities" : ""}

## ${SECTIONS.worthALook}
2-3 pieces most worth reading in depth, with brief reasoning.

Style: English, concise and professional, preserve all original links.
`;
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
2-3 papers most worth reading in full, with reasoning.

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
2-3 models most worth trying or studying, with reasoning.

Style: English, concise and professional, preserve all links.
`;
}
