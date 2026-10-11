/**
 * LLM invocation, file I/O, and GitHub issue creation helpers.
 */

import fs from "node:fs";
import path from "node:path";
import { FOOTER } from "./i18n.ts";
import { sleep } from "./date.ts";

// ---------------------------------------------------------------------------
// LLM token budget constants
// ---------------------------------------------------------------------------

// Ceilings, not targets: the prompts cap the length. They are high because the
// daily run's free OpenRouter reasoning model spends part of max_tokens on
// reasoning (on 2026-10-11 the HN report was cut off at the old 6144). 16384 is
// the output cap of gpt-4o, the OpenAI and Copilot default; higher budgets would
// make those providers reject the request.
export const LLM_TOKENS_DEFAULT = 8192;
/** Table-formatted listing reports (HN, ArXiv, HF, Community) need extra
 *  headroom for the multi-row tables plus 2-sentence summaries. */
export const LLM_TOKENS_LISTING = 16384;
export const LLM_TOKENS_WEB = 16384;
import { type LlmProvider, createProvider, TruncatedResponseError } from "./providers/index.ts";

const provider: LlmProvider = createProvider();

// ---------------------------------------------------------------------------
// Concurrency limiter — prevents rate-limit (429) errors when many LLM calls
// are fired in parallel. At most LLM_CONCURRENCY requests are in-flight at
// any given time; the rest queue and run as slots free up.
// ---------------------------------------------------------------------------

const LLM_CONCURRENCY = 5;
let llmSlots = LLM_CONCURRENCY;
const llmQueue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (llmSlots > 0) {
    llmSlots--;
    return Promise.resolve();
  }
  return new Promise((resolve) => llmQueue.push(resolve));
}

function releaseSlot(): void {
  const next = llmQueue.shift();
  if (next) {
    next();
  } else {
    llmSlots++;
  }
}

// ---------------------------------------------------------------------------
// LLM
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Health accounting
//
// Every caller of callLlm() degrades gracefully — a failed summary becomes a
// "generation failed" notice. That is right per report and wrong for the run
// as a whole: on 2026-09-03 all ~30 calls failed, and the pipeline cheerfully published a digest of placeholders
// and reported success. These counters let main() tell "one report is thin"
// apart from "the provider was down", and abort in the second case.
// ---------------------------------------------------------------------------

export const llmStats = { attempted: 0, failed: 0 };

/** Fraction of LLM calls that exhausted their retries. 0 when none were made. */
export function llmFailureRatio(): number {
  return llmStats.attempted === 0 ? 0 : llmStats.failed / llmStats.attempted;
}

/** Test seam — the counters are module state shared by the whole run. */
export function resetLlmStats(): void {
  llmStats.attempted = 0;
  llmStats.failed = 0;
}

/**
 * Fraction of failed calls above which the run is a total loss rather than a
 * degraded one. Half is deliberately far from the noise floor: a bad-but-usable
 * day loses one or two calls out of forty (~5%), an outage loses all of them.
 */
const LLM_ABORT_RATIO = 0.5;

/**
 * Below this many calls the ratio is meaningless. Was 5 when a run made ~30
 * calls; since October 2026 a daily run makes only 3–4 (agents, HN, ArXiv, and
 * web when there is new content), so 5 would never arm the gate on six days
 * out of seven. At 3, losing 2 of the 3 core daily reports aborts the run — by
 * then the day is mostly placeholders anyway.
 */
const LLM_MIN_SAMPLES = 3;

export function llmHealthLine(): string {
  const { attempted, failed } = llmStats;
  return `${failed}/${attempted} LLM calls failed (${Math.round(llmFailureRatio() * 100)}%)`;
}

/**
 * Throw when the LLM provider is effectively down.
 *
 * Every individual call site degrades gracefully, so without this check a total
 * outage still walks the whole pipeline: it writes placeholder reports, commits
 * them, opens eight GitHub issues and pushes a Telegram message with no
 * highlights — and exits 0, so nothing alerts. That is exactly what happened on
 * 2026-09-03. Throwing makes `pnpm start` exit non-zero, which fails the job and
 * skips the commit, notify and issue steps, so the day is simply missing rather
 * than published wrong — and a manual re-dispatch can still fill it in.
 */
export function assertLlmHealthy(stage: string): void {
  if (llmStats.attempted < LLM_MIN_SAMPLES) return;
  if (llmFailureRatio() < LLM_ABORT_RATIO) return;
  throw new Error(
    `LLM provider appears to be down — ${llmHealthLine()} by the end of the ${stage} phase. ` +
      `Aborting before anything is published; re-run this workflow once the provider recovers.`,
  );
}

/**
 * Log the final tally, and surface it on the Actions run page when calls were
 * lost. A run below the abort ratio still publishes, but a report that quietly
 * came back thin should not need a log dive to notice.
 */
export function reportLlmHealth(): void {
  const line = llmHealthLine();
  if (llmStats.failed === 0) {
    console.log(`  [llm] ${line}`);
    return;
  }
  console.warn(`  [llm] ${line} — some reports are degraded`);
  const summaryPath = process.env["GITHUB_STEP_SUMMARY"];
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `⚠️ **Degraded LLM output** — ${line}\n`, "utf-8");
  }
}

/** A rate limit clears in seconds, so a short ladder is enough: 5 s, 10 s, 20 s. */
const MAX_RETRIES_429 = 3;
/**
 * Connection failures get a much longer ladder than 429s. A rate limit is the
 * provider pushing back on *us*; an unreachable endpoint is a network outage
 * that lasts minutes and clears on its own.
 *
 * On 2026-09-03 the DashScope cn-beijing endpoint was unreachable from the
 * GitHub runner for the entire LLM phase (00:36–00:40 UTC). Every one of the
 * ~30 calls burned its 5+10+20 s ladder inside the first 35 s, gave up, and the
 * run published a digest built entirely out of "generation failed" placeholders.
 * Six retries capped at 60 s cover ~3 min of outage instead of 35 s.
 */
const MAX_RETRIES_CONNECTION = 6;
const RETRY_BASE_MS = 5_000;
/** Backoff cap. Uncapped, attempt 6 would sleep 160 s and blow the job timeout. */
const RETRY_MAX_MS = 60_000; // ladder: 5, 10, 20, 40, 60, 60 -> 195 s of cover

export function is429(err: unknown): boolean {
  return (err as { status?: number })?.status === 429 || String(err).includes("429");
}

/** Node/undici error codes for a connection that never carried a request. */
const CONNECTION_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

/**
 * True when the request never reached the model — DNS, TCP or TLS failed.
 *
 * The signal is buried: the OpenAI SDK reports these as `APIConnectionError`
 * with `status: undefined`, wrapping a `TypeError: fetch failed`, wrapping the
 * `AggregateError` that actually carries `code`. So walk the cause chain rather
 * than inspecting only the outermost error. The depth cap guards against a
 * self-referencing chain.
 */
export function isConnectionError(err: unknown): boolean {
  for (let cur: unknown = err, depth = 0; cur != null && depth < 5; depth++) {
    const e = cur as { name?: string; code?: string; message?: string; cause?: unknown };
    if (e.name === "APIConnectionError" || e.name === "APIConnectionTimeoutError") return true;
    if (typeof e.code === "string" && CONNECTION_ERROR_CODES.has(e.code)) return true;
    if (typeof e.message === "string" && /fetch failed|Connection error/i.test(e.message)) return true;
    cur = e.cause;
  }
  return false;
}

/**
 * Retry rate limits and connection failures; let everything else through.
 *
 * A 4xx that is not 429 will fail identically on the next attempt, and retrying
 * a 5xx risks a duplicate generation that already billed.
 */
export function isRetryable(err: unknown): boolean {
  return is429(err) || isConnectionError(err);
}

export async function callLlm(prompt: string, maxTokens = LLM_TOKENS_DEFAULT): Promise<string> {
  llmStats.attempted++;
  let budget = maxTokens;
  for (let attempt = 0; ;) {
    await acquireSlot();
    let released = false;
    try {
      return await provider.call(prompt, budget);
    } catch (err) {
      // A cut-off response gets one retry at double the budget, apart from the
      // 429/connection ladder: a second cut-off fails the call rather than
      // publishing a report that stops mid-table (HN, 2026-10-11).
      if (err instanceof TruncatedResponseError && budget === maxTokens) {
        releaseSlot();
        released = true;
        budget = maxTokens * 2;
        console.error(`[llm] ${err.message} — retrying once with max_tokens=${budget}...`);
        continue;
      }
      const rateLimited = is429(err);
      const maxRetries = rateLimited ? MAX_RETRIES_429 : MAX_RETRIES_CONNECTION;
      if (attempt < maxRetries && isRetryable(err)) {
        releaseSlot();
        released = true;
        const wait = Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);
        const reason = rateLimited ? "429" : "connection error";
        console.error(`[llm] ${reason} — retry ${attempt + 1}/${maxRetries} in ${wait / 1000}s...`);
        attempt++;
        await sleep(wait);
        continue;
      }
      llmStats.failed++;
      throw err;
    } finally {
      if (!released) releaseSlot();
    }
  }
}

// Matches ASCII control characters U+0000–U+001F. Built from a string so no
// literal control character appears in the source (keeps it readable + lint-clean).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F]", "g");

/**
 * Parse JSON returned by an LLM. Strips markdown code fences and replaces raw
 * control characters with spaces before parsing. The model occasionally emits
 * an unescaped control character (e.g. a bare newline) inside a string literal,
 * which is illegal in JSON and makes `JSON.parse` throw "Bad control character
 * in string literal". Control chars outside strings are only insignificant
 * whitespace, so replacing them is safe either way.
 *
 * If the strict parse still fails, the payload is repaired once (drop any prose
 * wrapper around the JSON, strip trailing commas) and retried — a single stray
 * character (e.g. a trailing comma before `}`) used to wipe an entire
 * highlights.json.
 */
export function parseLlmJson<T = unknown>(raw: string): T {
  const cleaned = raw
    .replace(/```json?\n?/g, "")
    .replace(/```/g, "")
    .replace(CONTROL_CHARS, " ")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    const repaired = repairJson(cleaned);
    if (repaired !== cleaned) return JSON.parse(repaired) as T;
    throw err;
  }
}

/**
 * Best-effort repair of common LLM JSON defects: narrow to the outermost
 * object/array (dropping surrounding prose) and remove trailing commas before a
 * closing brace or bracket. Returns the input unchanged when nothing applies.
 */
function repairJson(s: string): string {
  const first = s.search(/[{[]/);
  const lastBrace = s.lastIndexOf("}");
  const lastBracket = s.lastIndexOf("]");
  const last = Math.max(lastBrace, lastBracket);
  const narrowed = first >= 0 && last > first ? s.slice(first, last + 1) : s;
  return narrowed.replace(/,(\s*[}\]])/g, "$1");
}

// ---------------------------------------------------------------------------
// File output
// ---------------------------------------------------------------------------

export function saveFile(content: string, ...segments: string[]): string {
  const filepath = path.join("digests", ...segments);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, content, "utf-8");
  return filepath;
}

export function autoGenFooter(): string {
  const digestRepo = process.env["DIGEST_REPO"] ?? "";
  if (!digestRepo) return "";
  return `\n\n---\n*${FOOTER.autoGen} [Daily Diff](https://github.com/${digestRepo}).*`;
}
