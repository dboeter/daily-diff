/**
 * ArXiv AI papers fetched via the ArXiv API (Atom feed).
 *
 * Strategy: query cs.AI + cs.CL + cs.LG categories for the newest papers,
 * sorted by submission date, filtered to last 48h, then ranked by relevance
 * with TypeSafe's Jev decision model when `TYPESAFE_API_KEY` is set (recency
 * otherwise).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArxivPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated: string;
  categories: string[];
  url: string;
  pdfUrl: string;
}

export interface ArxivData {
  papers: ArxivPaper[];
  fetchSuccess: boolean;
  /** How `papers` was cut down from the 48h pool. */
  rankedBy: "jev" | "recency";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Papers fetched per category. The three categories see several hundred
 * submissions a day; at the old 50 the pool covered a few hours, so the report
 * was an arbitrary recency slice whatever the ranking.
 */
const ARXIV_FETCH_PER_CATEGORY = 300;
/** Papers handed to the digest prompt (with full abstracts). */
export const ARXIV_PROMPT_PAPERS = 40;
const API_URL = "https://export.arxiv.org/api/query";

/** ArXiv categories to search. */
const CATEGORIES = ["cs.AI", "cs.CL", "cs.LG"];

/** Delay between requests (ArXiv asks for 3s). */
const REQUEST_DELAY_MS = 3000;

// ---------------------------------------------------------------------------
// XML helpers (lightweight, no dependency)
// ---------------------------------------------------------------------------

export function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const m = xml.match(re);
  return m ? m[1]!.trim() : "";
}

export function extractAllTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1]!.trim());
  }
  return results;
}

export function extractAttr(xml: string, tag: string, attr: string): string[] {
  const re = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>`, "g");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1]!);
  }
  return results;
}

export function extractLinkHref(xml: string, rel: string): string {
  const re = new RegExp(`<link[^>]*rel="${rel}"[^>]*href="([^"]*)"[^>]*/?>`, "g");
  const m = re.exec(xml);
  return m ? m[1]! : "";
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

export function parseEntry(entryXml: string): ArxivPaper | null {
  const id = extractTag(entryXml, "id");
  if (!id) return null;

  const title = extractTag(entryXml, "title").replace(/\s+/g, " ");
  const summary = extractTag(entryXml, "summary").replace(/\s+/g, " ");
  const authors = extractAllTags(entryXml, "name");
  const published = extractTag(entryXml, "published");
  const updated = extractTag(entryXml, "updated");
  const categories = extractAttr(entryXml, "category", "term");

  const url = id; // ArXiv id IS the URL (e.g. http://arxiv.org/abs/...)
  const pdfUrl = extractLinkHref(entryXml, "related") || id.replace("/abs/", "/pdf/");

  return { id, title, summary, authors, published, updated, categories, url, pdfUrl };
}

export function parseArxivEntries(xml: string): ArxivPaper[] {
  const entryBlocks = xml.split("<entry>").slice(1);
  const papers: ArxivPaper[] = [];
  for (const block of entryBlocks) {
    const paper = parseEntry("<entry>" + block);
    if (paper) papers.push(paper);
  }
  return papers;
}

// ---------------------------------------------------------------------------
// Relevance ranking (Jev)
//
// Jev is not a chat model: POST /v1/systemone takes a `state` and typed
// questions and returns probabilities. It is called directly rather than through
// callLlm — it is not an LlmProvider, and ~600 calls a day would swamp the
// llmStats health gate that is calibrated for 3–4 report calls.
// ---------------------------------------------------------------------------

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
/**
 * The Models page lists 80 requests/second and warns the limit can change without
 * notice; at ~100 ms a call, 5 workers stay near 50/s.
 */
const JEV_CONCURRENCY = 5;
/** Above this fraction of failed scoring calls the ranking is noise — fall back to recency. */
const JEV_MAX_FAILURE_RATIO = 0.5;
const JEV_MAX_RETRIES = 3;
const JEV_RETRY_BASE_MS = 1000;
const JEV_RETRY_MAX_MS = 10_000;

/**
 * Composite scoring: each question judges one property of the paper and
 * `relevanceOf` weighs them in code. One broad "how relevant is this?" question
 * hid several judgments and asked Jev to guess what an audience cares about —
 * an indirection the Jev 1.13 docs list as a failure mode. All three run in one
 * request, in parallel.
 */
const RELEVANCE_QUESTIONS = {
  about_llms: {
    type: "noul",
    instructions:
      "Is the paper described by `title` and `abstract` about large language models or LLM-based agents?",
    criteria: {
      true: "The paper trains, evaluates, analyzes, serves, or builds a system on large language models or LLM-based agents",
      false:
        "The paper is about other machine learning, such as vision-only models, reinforcement learning without a language model, tabular data, or theory that involves no language model",
    },
  },
  about_agents_or_code: {
    type: "noul",
    instructions:
      "Is the paper described by `title` and `abstract` about AI agents, tool use, or code generation?",
    criteria: {
      true: "The paper studies systems that act in multiple steps, call tools or APIs, or write, repair, or review code",
      false: "The paper studies models that answer in a single step without tools, and not code",
    },
  },
  practical: {
    type: "score",
    instructions: "How directly can an engineer apply the result in `abstract`?",
    criteria: [
      {
        what: "No practical takeaway",
        examples: ["a convergence proof", "a generalization bound with no new algorithm"],
      },
      {
        what: "A finding or benchmark worth knowing, but no method to adopt",
        examples: ["a benchmark showing agents fail on long tasks", "an analysis of why models hallucinate"],
      },
      {
        what: "A method, tool, or technique an engineer can adopt",
        examples: [
          "a fine-tuning or prompting recipe",
          "a KV-cache compression that speeds up serving",
          "an agent memory or planning design",
        ],
      },
    ],
  },
};

/** Weights for `relevanceOf`. LLM fit dominates so an off-topic paper sinks however practical it is. */
const RELEVANCE_WEIGHTS = { about_llms: 0.5, about_agents_or_code: 0.25, practical: 0.25 };
/** Top level of the `practical` score, to normalize it to 0–1. */
const PRACTICAL_MAX_LEVEL = RELEVANCE_QUESTIONS.practical.criteria.length - 1;

interface JevAnswers {
  about_llms: { noul: number };
  about_agents_or_code: { noul: number };
  /** `score` is already the probability-weighted level (Σ level × p), between 0 and the top level. */
  practical: { score: number };
}

/** Weighted relevance in 0–1. */
export function relevanceOf(answers: JevAnswers): number {
  const value =
    RELEVANCE_WEIGHTS.about_llms * answers.about_llms.noul +
    RELEVANCE_WEIGHTS.about_agents_or_code * answers.about_agents_or_code.noul +
    (RELEVANCE_WEIGHTS.practical * answers.practical.score) / PRACTICAL_MAX_LEVEL;
  // Throw rather than return NaN: a NaN score would sort arbitrarily yet count as a
  // success, so a changed response shape would never trip the recency fallback.
  if (!Number.isFinite(value)) throw new Error(`Unexpected Jev answers: ${JSON.stringify(answers)}`);
  return value;
}

/** Wait before retry `attempt` (0-based): the `retry-after` seconds when sent, else exponential backoff. */
export function retryDelayMs(retryAfter: string | null, attempt: number): number {
  const seconds = Number(retryAfter);
  // retry-after may also be an HTTP date; Number() makes that NaN and it falls back to backoff.
  const ms =
    retryAfter && Number.isFinite(seconds) && seconds >= 0
      ? seconds * 1000
      : JEV_RETRY_BASE_MS * 2 ** attempt;
  return Math.min(ms, JEV_RETRY_MAX_MS);
}

export async function scorePaper(paper: ArxivPaper, apiKey: string): Promise<number> {
  const request = (): Promise<Response> =>
    fetch(JEV_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "jev-latest",
        state: { title: paper.title, abstract: paper.summary, categories: paper.categories },
        questions: RELEVANCE_QUESTIONS,
      }),
    });
  let resp = await request();
  // 429 = rate limited, 529 = overloaded; the docs ask for exponential backoff. A paper
  // that still fails sorts last, and a broad outage trips the recency fallback.
  for (
    let attempt = 0;
    (resp.status === 429 || resp.status === 529) && attempt < JEV_MAX_RETRIES;
    attempt++
  ) {
    await sleep(retryDelayMs(resp.headers.get("retry-after"), attempt));
    resp = await request();
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const body = (await resp.json()) as { answers: JevAnswers };
  return relevanceOf(body.answers);
}

/**
 * Sort papers by Jev relevance, most relevant first. Input order breaks ties
 * (the sort is stable). Papers whose scoring call failed sort last. Returns
 * null when too many calls failed for the order to mean anything.
 */
export async function rankByRelevance(
  papers: ArxivPaper[],
  apiKey: string,
  score: (paper: ArxivPaper, apiKey: string) => Promise<number> = scorePaper,
): Promise<ArxivPaper[] | null> {
  const scores = new Array<number>(papers.length).fill(-1);
  let failed = 0;
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < papers.length) {
      const i = next++;
      try {
        scores[i] = await score(papers[i]!, apiKey);
      } catch (err) {
        failed++;
        if (failed === 1) console.error(`  [arxiv] Jev scoring failed: ${err}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(JEV_CONCURRENCY, papers.length) }, worker));

  console.log(`  [arxiv] Jev scored ${papers.length - failed}/${papers.length} papers`);
  if (papers.length > 0 && failed / papers.length > JEV_MAX_FAILURE_RATIO) return null;
  return papers
    .map((paper, i) => ({ paper, score: scores[i]! }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.paper);
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchArxivData(): Promise<ArxivData> {
  const seen = new Map<string, ArxivPaper>();

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]!;
    if (i > 0) await sleep(REQUEST_DELAY_MS);

    try {
      const params = new URLSearchParams({
        search_query: `cat:${cat}`,
        sortBy: "submittedDate",
        sortOrder: "descending",
        max_results: String(ARXIV_FETCH_PER_CATEGORY),
      });

      const resp = await fetch(`${API_URL}?${params}`, {
        headers: { "User-Agent": "daily-diff/1.0" },
      });

      if (!resp.ok) {
        console.error(`  [arxiv] ${cat}: HTTP ${resp.status}`);
        continue;
      }

      const xml = await resp.text();
      const parsedPapers = parseArxivEntries(xml);
      for (const paper of parsedPapers) {
        if (!seen.has(paper.id)) {
          seen.set(paper.id, paper);
        }
      }

      console.log(`  [arxiv] ${cat}: ${parsedPapers.length} papers`);
    } catch (err) {
      console.error(`  [arxiv] ${cat}: ${err}`);
    }
  }

  // Filter to last 48h (ArXiv has a ~1-day publishing delay, so 24h would miss today's batch)
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = [...seen.values()]
    .filter((p) => new Date(p.published).getTime() > cutoff)
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  const apiKey = process.env["TYPESAFE_API_KEY"];
  const ranked = apiKey ? await rankByRelevance(recent, apiKey) : null;
  if (apiKey && !ranked) console.error("  [arxiv] Too many Jev failures — falling back to recency");
  const papers = (ranked ?? recent).slice(0, ARXIV_PROMPT_PAPERS);
  const rankedBy = ranked ? "jev" : "recency";

  console.log(
    `  [arxiv] ${papers.length} papers by ${rankedBy} (from ${recent.length} in 48h, ${seen.size} unique)`,
  );
  return { papers, fetchSuccess: papers.length > 0, rankedBy };
}
