/**
 * Hacker News AI and data stories fetched from the official Firebase API.
 */

import { fetchOk } from "../core/http.ts";
import { plainText } from "../core/rss.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HnStory {
  id: string;
  title: string;
  url: string; // external URL, or HN discussion link if no external URL
  hnUrl: string; // always the HN discussion link
  points: number;
  comments: number;
  createdAt: string;
  /** The linked page's og:description or meta description; absent for a text post or a failed fetch. */
  description?: string;
}

export interface HnData {
  stories: HnStory[];
  fetchSuccess: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Stories no page has shown yet; a story shown on an earlier day is kept but not counted. */
const HN_TOP_STORIES = 40;
const HN_STORIES_TO_SCAN = 500;
const HN_BATCH_SIZE = 50;

const HN_TOPSTORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM_URL = (id: number) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

// ---------------------------------------------------------------------------
// Firebase API types
// ---------------------------------------------------------------------------

interface HnFirebaseItem {
  id: number;
  deleted?: boolean;
  dead?: boolean;
  type?: string;
  time?: number;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
}

const AI_KEYWORD_PATTERNS = [
  /\bai\b/i,
  /\ba\.i\./i,
  /\bllm(s)?\b/i,
  /\bml\b/i,
  /machine learning/i,
  /deep learning/i,
  /neural/i,
  /transformer/i,
  /language model(s)?\b/i,
  /foundation model(s)?\b/i,
  /\brag\b/i,
  /agent(s)?\b/i,
  /openai/i,
  /anthropic/i,
  /claude/i,
  /chatgpt/i,
  /gemini/i,
  /copilot/i,
];

/**
 * Without these the Data page has no HN stories to spot: the AI list admits AI
 * stories only. Spark, Iceberg and Arrow only with "Apache" or as their Python
 * packages: bare, they match "tip of the iceberg", Meta's Muse Spark model and
 * arrow functions.
 */
export const DATA_KEYWORD_PATTERNS = [
  /\bdatabases?\b/i,
  /\bsql\b/i,
  /\bpostgres(ql)?\b/i,
  /\bsqlite\b/i,
  /\bduckdb\b/i,
  /\bclickhouse\b/i,
  /\bsnowflake\b/i,
  /\bdatabricks\b/i,
  /\bbigquery\b/i,
  /\bapache (spark|iceberg|arrow)\b/i,
  /\bpy(spark|iceberg|arrow)\b/i,
  /\bspark sql\b/i,
  /\bparquet\b/i,
  /\bdbt\b/i,
  /\bairflow\b/i,
  /\bdagster\b/i,
  /\bkafka\b/i,
  /\bpolars\b/i,
  /\btrino\b/i,
  /data engineering/i,
  /data warehouse/i,
  /data lake/i,
  /lakehouse/i,
  /\betl\b/i,
];

function isAiOrDataRelated(item: HnFirebaseItem): boolean {
  const text = `${item.title ?? ""} ${item.url ?? ""}`;
  return [...AI_KEYWORD_PATTERNS, ...DATA_KEYWORD_PATTERNS].some((pattern) => pattern.test(text));
}

function toHnStory(item: HnFirebaseItem): HnStory {
  const id = String(item.id);
  const hnUrl = `https://news.ycombinator.com/item?id=${id}`;

  return {
    id,
    title: item.title ?? "(untitled)",
    url: item.url ?? hnUrl,
    hnUrl,
    points: item.score ?? 0,
    comments: item.descendants ?? 0,
    createdAt: item.time ? new Date(item.time * 1000).toISOString() : new Date(0).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Article descriptions
// ---------------------------------------------------------------------------

/**
 * The model saw titles only, and on 2026-10-19 summaries guessed what an
 * article argues ("Neural networks are clean": "when properly regularized…").
 * A page's own description is one request per story, cut short: a slow or
 * huge page only loses its description.
 */
const DESCRIPTION_TIMEOUT_MS = 8000;
/** The `<head>` is near the top; a `text()` on a 20 MB page would be a timeout, not a cap. */
const DESCRIPTION_MAX_BYTES = 64 * 1024;
const DESCRIPTION_MAX_CHARS = 300;

/** Some sites write `name="og:description"`. `\s` before each attribute, so `data-name=` is not one. */
const META_KEYS = [/\s(?:property|name)=["']og:description["']/i, /\sname=["']description["']/i];

/** `og:description`, else `<meta name="description">`, as plain text; "" when neither. */
export function metaDescription(html: string, maxChars = DESCRIPTION_MAX_CHARS): string {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag);
  for (const key of META_KEYS) {
    for (const tag of tags) {
      if (!key.test(tag)) continue;
      const content = tag.match(/\scontent=(?:"([^"]*)"|'([^']*)')/i);
      const text = plainText(content?.[1] ?? content?.[2] ?? "", maxChars);
      if (text) return text;
    }
  }
  return "";
}

/** The first DESCRIPTION_MAX_BYTES of an HTML page, else null. */
async function fetchHead(url: string): Promise<string | null> {
  const res = await fetchOk(url, { timeoutMs: DESCRIPTION_TIMEOUT_MS });
  if (!res.headers.get("content-type")?.includes("text/html") || !res.body) {
    await res.body?.cancel();
    return null;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < DESCRIPTION_MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  await reader.cancel();
  return Buffer.concat(chunks).toString("utf8");
}

/** A page's meta description (also the agents and data reports' release announcements); "" on any failure. */
export async function pageDescription(url: string, maxChars = DESCRIPTION_MAX_CHARS): Promise<string> {
  try {
    const html = await fetchHead(url);
    return html ? metaDescription(html, maxChars) : "";
  } catch {
    return "";
  }
}

async function withDescription(story: HnStory): Promise<HnStory> {
  if (story.url === story.hnUrl) return story;
  const description = await pageDescription(story.url);
  return description ? { ...story, description } : story;
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

/**
 * The top AI and data stories. `isShown(story)`: a story a page showed, or a
 * copy of its link, stays in the result, for its latest counts, but does not
 * count toward HN_TOP_STORIES, so the cut yields stories no page has shown.
 */
export async function fetchHnData(isShown: (story: HnStory) => boolean = () => false): Promise<HnData> {
  try {
    const topResp = await fetch(HN_TOPSTORIES_URL, {
      headers: { "User-Agent": "daily-diff/1.0" },
    });
    if (!topResp.ok) {
      console.error(`  [hn] topstories: HTTP ${topResp.status}`);
      return { stories: [], fetchSuccess: false };
    }

    const topIds = ((await topResp.json()) as number[]).slice(0, HN_STORIES_TO_SCAN);
    const stories: HnStory[] = [];
    let unshown = 0;

    for (let i = 0; i < topIds.length && unshown < HN_TOP_STORIES; i += HN_BATCH_SIZE) {
      const batchIds = topIds.slice(i, i + HN_BATCH_SIZE);
      const items = await Promise.all(
        batchIds.map(async (id): Promise<HnFirebaseItem | null> => {
          const resp = await fetch(HN_ITEM_URL(id), {
            headers: { "User-Agent": "daily-diff/1.0" },
          });
          if (!resp.ok) {
            console.error(`  [hn] item ${id}: HTTP ${resp.status}`);
            return null;
          }
          return (await resp.json()) as HnFirebaseItem;
        }),
      );

      for (let j = 0; j < items.length && unshown < HN_TOP_STORIES; j += 1) {
        const item = items[j];
        if (!item || item.deleted || item.dead || item.type !== "story" || !item.title) {
          continue;
        }
        if (isAiOrDataRelated(item)) {
          const story = toHnStory(item);
          stories.push(story);
          if (!isShown(story)) unshown += 1;
        }
      }
    }

    const described = await Promise.all(stories.map(withDescription));
    console.log(
      `  [hn] ${stories.length} AI and data stories, ${unshown} not shown before (scanned ${topIds.length} topstories), ` +
        `${described.filter((s) => s.description).length} with a page description`,
    );
    return { stories: described, fetchSuccess: stories.length > 0 };
  } catch (err) {
    console.error(`  [hn] fetch failed: ${err}`);
    return { stories: [], fetchSuccess: false };
  }
}
