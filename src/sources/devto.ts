/**
 * Dev.to AI articles fetched via the Forem API.
 */

import { sleep } from "../core/date.ts";
import { FETCH_TIMEOUT_MS } from "../core/http.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DevtoArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  positiveReactionsCount: number;
  commentsCount: number;
}

export interface DevtoData {
  articles: DevtoArticle[];
  fetchSuccess: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEVTO_PER_PAGE = 30;
/**
 * `top=2` returned 110 unique articles over the five tags on 2026-10-22, most
 * with fewer than 15 reactions: below this they are not worth a Jev call each.
 */
const DEVTO_MIN_REACTIONS = 15;
const API_URL = "https://dev.to/api/articles";
/**
 * The wait before the one retry of a 429: its `Retry-After` seconds, capped, or the default without one.
 * A second is enough between sequential tag requests; the cap keeps a long `Retry-After` from stalling
 * the fetch phase, since a skipped tag costs only a few articles.
 */
const RETRY_AFTER_DEFAULT_MS = 1000;
const RETRY_AFTER_MAX_MS = 5000;

const retryDelayMs = (resp: Response): number => {
  const seconds = Number(resp.headers.get("retry-after"));
  const ms = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : RETRY_AFTER_DEFAULT_MS;
  return Math.min(ms, RETRY_AFTER_MAX_MS);
};

/**
 * Tags to query, one at a time, dedup by id: in parallel, Dev.to answered HTTP 429 to three of the
 * five on 2026-11-01.
 */
const TAGS = ["ai", "llm", "machinelearning", "openai", "langchain"];

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

export interface DevtoApiArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  positive_reactions_count: number;
  comments_count: number;
}

export function toDevtoArticle(a: DevtoApiArticle): DevtoArticle {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    url: a.url,
    publishedAt: a.published_at,
    positiveReactionsCount: a.positive_reactions_count,
    commentsCount: a.comments_count,
  };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export async function fetchDevtoData(): Promise<DevtoData> {
  const seen = new Map<number, DevtoArticle>();

  try {
    for (const tag of TAGS) {
      try {
        const params = new URLSearchParams({
          tag,
          per_page: String(DEVTO_PER_PAGE),
          // Fetched daily: the most popular articles of the last 2 days.
          top: "2",
        });

        // Not fetchOk: it throws on a non-2xx answer, and the 429 retry needs its status and Retry-After.
        const get = () =>
          fetch(`${API_URL}?${params}`, {
            headers: { "User-Agent": "daily-diff/1.0" },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          });
        let resp = await get();
        if (resp.status === 429) {
          await sleep(retryDelayMs(resp));
          resp = await get();
        }

        if (!resp.ok) {
          console.error(`  [devto] "${tag}": HTTP ${resp.status}`);
          continue;
        }

        const raw = (await resp.json()) as DevtoApiArticle[];
        for (const a of raw) {
          if (!seen.has(a.id)) {
            seen.set(a.id, toDevtoArticle(a));
          }
        }
      } catch (err) {
        console.error(`  [devto] "${tag}": ${err}`);
      }
    }

    const articles = [...seen.values()]
      .filter((a) => a.positiveReactionsCount >= DEVTO_MIN_REACTIONS)
      .sort((a, b) => b.positiveReactionsCount - a.positiveReactionsCount)
      .slice(0, DEVTO_PER_PAGE);

    console.log(`  [devto] ${articles.length} articles (from ${seen.size} unique)`);
    // A quiet day with every article under the reaction floor is not a failed fetch.
    return { articles, fetchSuccess: seen.size > 0 };
  } catch (err) {
    console.error(`  [devto] fetch failed: ${err}`);
    return { articles: [], fetchSuccess: false };
  }
}
