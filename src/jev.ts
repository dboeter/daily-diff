/**
 * TypeSafe Jev client, shared by the ArXiv ranking and the trending report.
 *
 * Jev is not a chat model: POST /v1/systemone takes a `state` and typed
 * questions and returns probabilities. It is called directly rather than through
 * callLlm — it is not an LlmProvider, and ~600 calls a day would swamp the
 * llmStats health gate that is calibrated for 3–5 report calls.
 */

import { sleep } from "./date.ts";

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
/**
 * The Models page lists 80 requests/second and warns the limit can change without
 * notice; at ~100 ms a call, 5 workers stay near 50/s.
 */
const JEV_CONCURRENCY = 5;
/** Above this fraction of failed calls the answers are noise — the caller falls back. */
const JEV_MAX_FAILURE_RATIO = 0.5;
const JEV_MAX_RETRIES = 3;
const JEV_RETRY_BASE_MS = 1000;
const JEV_RETRY_MAX_MS = 10_000;

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

/** One Jev request. `model` is the versioned model that answered — `jev-latest` is an alias that moves. */
export async function askJev<A>(
  state: unknown,
  questions: object,
  apiKey: string,
): Promise<{ model: string; answers: A }> {
  const request = (): Promise<Response> =>
    fetch(JEV_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "jev-latest", state, questions }),
    });
  let resp = await request();
  // 429 = rate limited, 529 = overloaded; the docs ask for exponential backoff. An item
  // that still fails counts as failed in mapJev, and a broad outage trips the caller's fallback.
  for (
    let attempt = 0;
    (resp.status === 429 || resp.status === 529) && attempt < JEV_MAX_RETRIES;
    attempt++
  ) {
    await sleep(retryDelayMs(resp.headers.get("retry-after"), attempt));
    resp = await request();
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as { model: string; answers: A };
}

/**
 * Run `fn` over `items` with JEV_CONCURRENCY workers. `results[i]` belongs to
 * `items[i]` and is null when that call threw. Logs the first failure and the tally.
 */
export async function mapJev<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  label: string,
): Promise<{ results: (R | null)[]; failed: number }> {
  const results = new Array<R | null>(items.length).fill(null);
  let failed = 0;
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i]!);
      } catch (err) {
        failed++;
        if (failed === 1) console.error(`  [${label}] Jev call failed: ${err}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(JEV_CONCURRENCY, items.length) }, worker));

  console.log(`  [${label}] Jev answered ${items.length - failed}/${items.length}`);
  return { results, failed };
}

/** True when too many calls failed for the answers to mean anything. */
export function jevFailedTooOften(failed: number, total: number): boolean {
  return total > 0 && failed / total > JEV_MAX_FAILURE_RATIO;
}
