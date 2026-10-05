/**
 * ArXiv AI papers fetched via the ArXiv API (Atom feed).
 *
 * Strategy: query cs.AI + cs.CL + cs.LG categories for the newest papers,
 * sorted by submission date, keep those submitted after the newest paper the
 * previous run saw (`digests/arxiv-state.json`), then rank by relevance with
 * TypeSafe's Jev decision model when `TYPESAFE_API_KEY` is set (recency
 * otherwise).
 */

import fs from "node:fs";
import path from "node:path";

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
  /** `buildRankingFile` output when ranked by Jev, saved next to the report. */
  rankingFile?: string;
  /** State to save once the report is written; absent when there were no new papers. */
  nextState?: ArxivState;
}

/** `digests/arxiv-state.json`: where the previous run's pool ended. */
export interface ArxivState {
  /** CST date of the run that wrote this. */
  date: string;
  /** Submission-time lower bound that run used (ISO). */
  cutoff: string;
  /** Newest submission time in that run's pool (ISO). */
  newest: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Papers per API request. The three categories see several hundred
 * submissions a day; at the old 50 the pool covered a few hours, so the report
 * was an arbitrary recency slice whatever the ranking.
 */
const ARXIV_PAGE_SIZE = 300;
/**
 * Pages per category. One page reaches back about a day in cs.AI and cs.LG, and
 * the Monday batch holds three days of submissions (Friday afternoon to Monday).
 * Measured 2026-10-05: four pages reach back 77–82 h across three weekdays, so
 * they cover the lighter weekend span; the cap only bounds a run after a gap.
 */
const ARXIV_MAX_PAGES = 4;
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
 * an indirection the Jev 1.13 docs list as a failure mode. All questions run in
 * one request, in parallel.
 *
 * `about_llms` and `about_agents_or_code` sort topic. On their own they leave
 * roughly one paper in six near the top score, more than the 40 the prompt
 * takes, so the others separate papers within that group by what a
 * practitioner can use.
 */
const RELEVANCE_QUESTIONS = {
  // A Score, not a noul: a paper can be partly about LLMs, and a noul near 0.5
  // means "unsure", not "partly". On 100 papers the old noul put such papers at
  // 0.4–0.65; the Score puts them on level 1 with high confidence.
  about_llms: {
    type: "score",
    instructions: "How central are large language models to the paper described by `title` and `abstract`?",
    criteria: [
      {
        what: "No language model is involved",
        examples: ["image classification", "reinforcement learning for robot control", "optimization theory"],
      },
      {
        what: "A language model is one component or tool, not the subject of the paper",
        examples: [
          "a vision-language model study focused on the visual encoder",
          "an LLM used to label data for a non-language task",
          "a method shown on LLMs among other model types",
        ],
      },
      {
        what: "Large language models or LLM-based agents are the subject of the paper",
        examples: [
          "fine-tuning an LLM",
          "evaluating LLM reasoning",
          "an LLM agent framework",
          "serving or compressing LLMs",
        ],
      },
    ],
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
  proposes_technique: {
    type: "noul",
    instructions: "Does the paper in `abstract` propose a new technique, method, or system?",
    criteria: {
      true: {
        what: "The paper contributes a method, algorithm, system, or tool",
        examples: ["a decoding method", "a fine-tuning recipe", "an agent framework"],
      },
      false: {
        what: "The paper contributes only a benchmark, dataset, survey, or analysis of existing methods",
        examples: ["a new benchmark", "a survey", "a study of why models fail"],
      },
    },
  },
  // Speculative: only meaningful when the paper proposes a technique, so the
  // premise is stated and `relevanceOf` gates the answer on `proposes_technique`.
  // One noul asking both read "no technique" and "needs training" as the same no.
  works_without_training: {
    type: "noul",
    instructions:
      "If the paper in `abstract` proposes a technique, is that technique applied to existing models without training or fine-tuning them?",
    criteria: {
      true: {
        what: "The technique is applied at inference or integration time",
        examples: [
          "a prompting or decoding method",
          "KV-cache compression",
          "a retrieval pipeline",
          "an agent scaffold or tool",
        ],
      },
      false: {
        what: "The technique needs pre-training or fine-tuning",
        examples: ["a fine-tuning recipe", "a new architecture trained from scratch"],
      },
    },
  },
  widely_used_models: {
    type: "noul",
    instructions: "Does `abstract` report results on widely used large language models?",
    criteria: {
      true: {
        what: "Results on a current widely used model family",
        examples: ["GPT-4o", "Claude", "Gemini", "Llama 3", "Qwen", "DeepSeek", "Mistral", "Gemma"],
      },
      false: {
        what: "Results only on small, older, custom, or unnamed models, or no model results",
        examples: ["GPT-2", "BERT", "a 100M-parameter model trained by the authors"],
      },
    },
  },
};

/**
 * Weights for `relevanceOf`, summing to 1. LLM fit is half, so an off-topic paper
 * (at most 0.5) never outranks a paper about LLMs (at least 0.5).
 */
const RELEVANCE_WEIGHTS = {
  about_llms: 0.5,
  about_agents_or_code: 0.2,
  /** Applies to proposes_technique × works_without_training: a training-free technique. */
  training_free_technique: 0.1,
  widely_used_models: 0.1,
  code_released: 0.1,
};
/** Top level of the `about_llms` score, to normalize it to 0–1. */
const ABOUT_LLMS_MAX_LEVEL = RELEVANCE_QUESTIONS.about_llms.criteria.length - 1;

/**
 * A code or model link in the abstract. A regex, not a Jev question: the
 * TypeSafe docs say to keep in code whatever code can decide exactly.
 */
const CODE_LINK_RE = /\b(github\.(com|io)|gitlab\.com|huggingface\.co)\//i;

export function hasCodeLink(abstract: string): boolean {
  return CODE_LINK_RE.test(abstract);
}

export interface JevAnswers {
  /** `score` is the probability-weighted level (Σ level × p), between 0 and the top level. */
  about_llms: { score: number };
  about_agents_or_code: { noul: number };
  proposes_technique: { noul: number };
  works_without_training: { noul: number };
  widely_used_models: { noul: number };
}

/** Weighted relevance in 0–1. */
export function relevanceOf(answers: JevAnswers, codeReleased: boolean): number {
  const value =
    (RELEVANCE_WEIGHTS.about_llms * answers.about_llms.score) / ABOUT_LLMS_MAX_LEVEL +
    RELEVANCE_WEIGHTS.about_agents_or_code * answers.about_agents_or_code.noul +
    RELEVANCE_WEIGHTS.training_free_technique *
      answers.proposes_technique.noul *
      answers.works_without_training.noul +
    RELEVANCE_WEIGHTS.widely_used_models * answers.widely_used_models.noul +
    (codeReleased ? RELEVANCE_WEIGHTS.code_released : 0);
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

/** One paper's Jev result: the composite and the raw judgments it came from, kept so the weights can be retuned without rerunning inference. */
export interface JevScore {
  relevance: number;
  answers: JevAnswers;
  codeReleased: boolean;
  /** Versioned model that answered — `jev-latest` is an alias that moves. */
  model: string;
}

export async function scorePaper(paper: ArxivPaper, apiKey: string): Promise<JevScore> {
  const request = (): Promise<Response> =>
    fetch(JEV_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "jev-latest",
        // No `categories`: no question reads them, and unused state costs accuracy.
        state: { title: paper.title, abstract: paper.summary },
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
  const body = (await resp.json()) as { model: string; answers: JevAnswers };
  const codeReleased = hasCodeLink(paper.summary);
  return {
    relevance: relevanceOf(body.answers, codeReleased),
    answers: body.answers,
    codeReleased,
    model: body.model,
  };
}

export interface RankedPaper {
  paper: ArxivPaper;
  /** null when the scoring call failed. */
  jev: JevScore | null;
}

/**
 * Sort papers by Jev relevance, most relevant first. Input order breaks ties
 * (the sort is stable). Papers whose scoring call failed sort last. Returns
 * null when too many calls failed for the order to mean anything.
 */
export async function rankByRelevance(
  papers: ArxivPaper[],
  apiKey: string,
  score: (paper: ArxivPaper, apiKey: string) => Promise<JevScore> = scorePaper,
): Promise<RankedPaper[] | null> {
  const scores = new Array<JevScore | null>(papers.length).fill(null);
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
    .map((paper, i): RankedPaper => ({ paper, jev: scores[i] ?? null }))
    .sort((a, b) => (b.jev?.relevance ?? -1) - (a.jev?.relevance ?? -1));
}

/** Papers kept in the ranking file — the prompt's 40 plus the next tier, for tuning. */
const RANKING_FILE_PAPERS = 100;

/**
 * The ranking file: per-paper raw judgments for the top of the ranking, one
 * paper per line. Kept so a misranked paper can be traced to an answer or a
 * weight, and so weights can be retuned on past days without rerunning Jev.
 */
export function buildRankingFile(ranked: RankedPaper[]): string {
  const rows = ranked
    .slice(0, RANKING_FILE_PAPERS)
    .flatMap(({ paper, jev }) => (jev ? [{ paper, jev }] : []))
    .map(({ paper, jev }) => {
      const a = jev.answers;
      const round = (n: number): number => Math.round(n * 1000) / 1000;
      return JSON.stringify({
        id: paper.id,
        title: paper.title,
        relevance: round(jev.relevance),
        about_llms: round(a.about_llms.score),
        about_agents_or_code: round(a.about_agents_or_code.noul),
        proposes_technique: round(a.proposes_technique.noul),
        works_without_training: round(a.works_without_training.noul),
        widely_used_models: round(a.widely_used_models.noul),
        code_released: jev.codeReleased,
      });
    });
  const models = [...new Set(ranked.flatMap((r) => (r.jev ? [r.jev.model] : [])))];
  return (
    `{\n"models": ${JSON.stringify(models)},\n"weights": ${JSON.stringify(RELEVANCE_WEIGHTS)},\n` +
    `"papers": [\n${rows.join(",\n")}\n]\n}\n`
  );
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STATE_FILE = path.join("digests", "arxiv-state.json");
/** Pool window when there is no state yet. */
const FIRST_RUN_WINDOW_MS = 48 * 60 * 60 * 1000;

export function loadArxivState(): ArxivState | null {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) as ArxivState;
  } catch {
    return null;
  }
}

export function saveArxivState(state: ArxivState): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/**
 * Lower bound on submission time for this run's pool (epoch ms).
 *
 * Not a fixed window from the run time: arXiv announces Sun–Thu at 20:00 ET,
 * each batch holding submissions up to 14:00 ET the day before, so the newest
 * paper the 22:37 UTC run can see is already 28–76 h old. The old 48 h window
 * skipped the Tuesday report every week, never showed the Thursday–Friday batch,
 * and clipped every other batch. Taking everything submitted after the newest
 * paper the previous run saw shows each batch exactly once.
 */
export function submissionCutoff(state: ArxivState | null, dateStr: string, now: Date): number {
  // A re-run of the same day (workflow_dispatch) regenerates from the same pool.
  const cutoff = state ? Date.parse(state.date === dateStr ? state.cutoff : state.newest) : NaN;
  return Number.isFinite(cutoff) ? cutoff : now.getTime() - FIRST_RUN_WINDOW_MS;
}

/** State after this run, or undefined when the pool is empty (nothing new to record). */
export function nextArxivState(pool: ArxivPaper[], cutoff: number, dateStr: string): ArxivState | undefined {
  if (pool.length === 0) return undefined;
  const newest = Math.max(...pool.map((p) => Date.parse(p.published)));
  return { date: dateStr, cutoff: new Date(cutoff).toISOString(), newest: new Date(newest).toISOString() };
}

export async function fetchArxivData(dateStr: string, state = loadArxivState()): Promise<ArxivData> {
  const cutoff = submissionCutoff(state, dateStr, new Date());
  const seen = new Map<string, ArxivPaper>();
  let requests = 0;

  for (const cat of CATEGORIES) {
    for (let page = 0; page < ARXIV_MAX_PAGES; page++) {
      if (requests++ > 0) await sleep(REQUEST_DELAY_MS);
      try {
        const params = new URLSearchParams({
          search_query: `cat:${cat}`,
          sortBy: "submittedDate",
          sortOrder: "descending",
          start: String(page * ARXIV_PAGE_SIZE),
          max_results: String(ARXIV_PAGE_SIZE),
        });

        const resp = await fetch(`${API_URL}?${params}`, {
          headers: { "User-Agent": "daily-diff/1.0" },
        });

        if (!resp.ok) {
          console.error(`  [arxiv] ${cat} page ${page + 1}: HTTP ${resp.status}`);
          break;
        }

        const parsedPapers = parseArxivEntries(await resp.text());
        for (const paper of parsedPapers) {
          if (!seen.has(paper.id)) seen.set(paper.id, paper);
        }
        console.log(`  [arxiv] ${cat} page ${page + 1}: ${parsedPapers.length} papers`);

        // Sorted newest first: stop once the page reaches the cutoff or runs out.
        const oldest = parsedPapers.at(-1);
        if (parsedPapers.length < ARXIV_PAGE_SIZE || !oldest || Date.parse(oldest.published) <= cutoff) break;
      } catch (err) {
        console.error(`  [arxiv] ${cat} page ${page + 1}: ${err}`);
        break;
      }
    }
  }

  const recent = [...seen.values()]
    .filter((p) => Date.parse(p.published) > cutoff)
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));

  const apiKey = process.env["TYPESAFE_API_KEY"];
  const ranked = apiKey ? await rankByRelevance(recent, apiKey) : null;
  if (apiKey && !ranked) console.error("  [arxiv] Too many Jev failures — falling back to recency");
  const papers = (ranked ? ranked.map((r) => r.paper) : recent).slice(0, ARXIV_PROMPT_PAPERS);
  const rankedBy = ranked ? "jev" : "recency";
  const nextState = nextArxivState(recent, cutoff, dateStr);

  console.log(
    `  [arxiv] ${papers.length} papers by ${rankedBy} ` +
      `(from ${recent.length} submitted after ${new Date(cutoff).toISOString()}, ${seen.size} unique)`,
  );
  return {
    papers,
    fetchSuccess: papers.length > 0,
    rankedBy,
    ...(ranked ? { rankingFile: buildRankingFile(ranked) } : {}),
    ...(nextState ? { nextState } : {}),
  };
}
