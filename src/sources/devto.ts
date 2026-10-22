/**
 * Dev.to AI articles fetched via the Forem API.
 */

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

/** Tags to query — run in parallel, dedup by id. */
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
    await Promise.all(
      TAGS.map(async (tag) => {
        try {
          const params = new URLSearchParams({
            tag,
            per_page: String(DEVTO_PER_PAGE),
            // Fetched daily: the most popular articles of the last 2 days.
            top: "2",
          });

          const resp = await fetch(`${API_URL}?${params}`, {
            headers: { "User-Agent": "daily-diff/1.0" },
          });

          if (!resp.ok) {
            console.error(`  [devto] "${tag}": HTTP ${resp.status}`);
            return;
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
      }),
    );

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
