/**
 * Lobste.rs AI and database stories fetched via tag-based JSON endpoints (e.g., /t/ai.json).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LobstersStory {
  /** Lobste.rs `short_id`. */
  id: string;
  title: string;
  url: string;
  commentsUrl: string;
  score: number;
  commentCount: number;
  author: string;
  publishedAt: string;
  tags: string[];
}

export interface LobstersData {
  stories: LobstersStory[];
  fetchSuccess: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOBSTERS_TOP = 20;

/** Stories published this many days back; the Spotted log drops the ones a page already showed. */
const LOBSTERS_DAYS = 2;

/**
 * Tag-based JSON endpoints — Lobste.rs provides these natively. Not `ml`: it is
 * "MetaLanguage, OCaml programming". `vibecoding` ("Using AI/LLM, coding tools.
 * Don't also tag with `ai`") holds the AI coding stories.
 */
const TAG_URLS = [
  "https://lobste.rs/t/ai.json",
  "https://lobste.rs/t/vibecoding.json",
  "https://lobste.rs/t/databases.json",
];

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

export interface LobstersApiStory {
  short_id: string;
  title: string;
  url: string;
  comments_url: string;
  score: number;
  comment_count: number;
  submitter_user: { username: string };
  created_at: string;
  tags: string[];
}

export function toLobstersStory(s: LobstersApiStory): LobstersStory {
  return {
    id: s.short_id,
    title: s.title,
    url: s.url || s.comments_url,
    commentsUrl: s.comments_url,
    score: s.score,
    commentCount: s.comment_count,
    author: s.submitter_user.username,
    publishedAt: s.created_at,
    tags: s.tags,
  };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export async function fetchLobstersData(): Promise<LobstersData> {
  const seen = new Map<string, LobstersStory>();

  try {
    await Promise.all(
      TAG_URLS.map(async (tagUrl) => {
        try {
          const resp = await fetch(tagUrl, {
            headers: { "User-Agent": "daily-diff/1.0" },
          });

          if (!resp.ok) {
            console.error(`  [lobsters] ${tagUrl}: HTTP ${resp.status}`);
            return;
          }

          const raw = (await resp.json()) as LobstersApiStory[];
          for (const s of raw) {
            if (!seen.has(s.short_id)) {
              seen.set(s.short_id, toLobstersStory(s));
            }
          }
        } catch (err) {
          console.error(`  [lobsters] ${tagUrl}: ${err}`);
        }
      }),
    );

    const since = Date.now() - LOBSTERS_DAYS * 24 * 60 * 60 * 1000;
    const stories = [...seen.values()]
      .filter((s) => new Date(s.publishedAt).getTime() > since)
      .sort((a, b) => b.score - a.score)
      .slice(0, LOBSTERS_TOP);

    console.log(`  [lobsters] ${stories.length} stories (from ${seen.size} unique)`);
    return { stories, fetchSuccess: stories.length > 0 };
  } catch (err) {
    console.error(`  [lobsters] fetch failed: ${err}`);
    return { stories: [], fetchSuccess: false };
  }
}
