/**
 * Plain HTTP for the AI Policy sources and RSS feeds: one User-Agent, one
 * timeout and one error shape. A hung source would otherwise stall the
 * 40-minute job, so every request is aborted after FETCH_TIMEOUT_MS.
 */

import { sleep } from "./date.ts";

export const FETCH_TIMEOUT_MS = 30_000;
const FETCH_RETRY_DELAY_MS = 2_000;

/** A gateway's 502, 503 or 504, or our own timeout: what a second try often clears. */
const isTransient = (err: unknown): boolean =>
  err instanceof Error && (err.name === "TimeoutError" || /^HTTP 50[234]$/.test(err.message));

/**
 * `fetch` with the project User-Agent and a timeout. Throws `HTTP <status>` on a non-2xx answer.
 * A GET that fails on a transient error is tried once more: in the week of 2026-11-04 Open States
 * (502), Congress.gov (timeout) and GitHub Trending (504) each lost a day to one such answer. The
 * log names the host only: some sources carry their key in the query.
 */
export async function fetchOk(
  url: string,
  init: RequestInit & { timeoutMs?: number; retryDelayMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = FETCH_TIMEOUT_MS, retryDelayMs = FETCH_RETRY_DELAY_MS, headers, ...rest } = init;
  const once = async (): Promise<Response> => {
    const res = await fetch(url, {
      ...rest,
      headers: { "User-Agent": "daily-diff/1.0", ...(headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  };
  if ((rest.method ?? "GET").toUpperCase() !== "GET") return once();
  try {
    return await once();
  } catch (err) {
    if (!isTransient(err)) throw err;
    console.log(`  [http] ${new URL(url).hostname}: ${(err as Error).message}, retrying once`);
    await sleep(retryDelayMs);
    return once();
  }
}

/** An API key from the environment; logs that `source` is skipped when it is unset. */
export function apiKeyFor(envVar: string, source: string): string | undefined {
  const key = process.env[envVar];
  if (!key) console.log(`  [policy] ${source} skipped: ${envVar} is not set`);
  return key;
}
