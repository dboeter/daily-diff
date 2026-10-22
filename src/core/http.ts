/**
 * Plain HTTP for the AI Policy sources and RSS feeds: one User-Agent, one
 * timeout and one error shape. A hung source would otherwise stall the
 * 40-minute job, so every request is aborted after FETCH_TIMEOUT_MS.
 */

export const FETCH_TIMEOUT_MS = 30_000;

/** `fetch` with the project User-Agent and a timeout. Throws `HTTP <status>` on a non-2xx answer. */
export async function fetchOk(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = FETCH_TIMEOUT_MS, headers, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: { "User-Agent": "daily-diff/1.0", ...(headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

/** An API key from the environment; logs that `source` is skipped when it is unset. */
export function apiKeyFor(envVar: string, source: string): string | undefined {
  const key = process.env[envVar];
  if (!key) console.log(`  [policy] ${source} skipped: ${envVar} is not set`);
  return key;
}
