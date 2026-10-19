/**
 * Hacker News AI stories fetched from the official Firebase API.
 */

import { fetchOk } from "../core/http.ts";
import { plainText } from "../core/rss.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HnStory {
  id: string;
  hnRank?: number;
  title: string;
  url: string; // external URL, or HN discussion link if no external URL
  hnUrl: string; // always the HN discussion link
  points: number;
  comments: number;
  author: string;
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

const HN_TOP_STORIES = 30;
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
  by?: string;
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

function isAiRelated(item: HnFirebaseItem): boolean {
  const text = `${item.title ?? ""} ${item.url ?? ""}`;
  return AI_KEYWORD_PATTERNS.some((pattern) => pattern.test(text));
}

function toHnStory(item: HnFirebaseItem, hnRank: number): HnStory {
  const id = String(item.id);
  const hnUrl = `https://news.ycombinator.com/item?id=${id}`;

  return {
    id,
    hnRank,
    title: item.title ?? "(untitled)",
    url: item.url ?? hnUrl,
    hnUrl,
    points: item.score ?? 0,
    comments: item.descendants ?? 0,
    author: item.by ?? "unknown",
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
export function metaDescription(html: string): string {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag);
  for (const key of META_KEYS) {
    for (const tag of tags) {
      if (!key.test(tag)) continue;
      const content = tag.match(/\scontent=(?:"([^"]*)"|'([^']*)')/i);
      const text = plainText(content?.[1] ?? content?.[2] ?? "", DESCRIPTION_MAX_CHARS);
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

async function withDescription(story: HnStory): Promise<HnStory> {
  if (story.url === story.hnUrl) return story;
  try {
    const html = await fetchHead(story.url);
    const description = html ? metaDescription(html) : "";
    return description ? { ...story, description } : story;
  } catch {
    return story;
  }
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export async function fetchHnData(): Promise<HnData> {
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

    for (let i = 0; i < topIds.length && stories.length < HN_TOP_STORIES; i += HN_BATCH_SIZE) {
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

      for (let j = 0; j < items.length && stories.length < HN_TOP_STORIES; j += 1) {
        const item = items[j];
        if (!item || item.deleted || item.dead || item.type !== "story" || !item.title) {
          continue;
        }
        if (isAiRelated(item)) {
          stories.push(toHnStory(item, i + j + 1));
        }
      }
    }

    const described = await Promise.all(stories.map(withDescription));
    console.log(
      `  [hn] ${stories.length} AI stories (scanned ${topIds.length} topstories), ` +
        `${described.filter((s) => s.description).length} with a page description`,
    );
    return { stories: described, fetchSuccess: stories.length > 0 };
  } catch (err) {
    console.error(`  [hn] fetch failed: ${err}`);
    return { stories: [], fetchSuccess: false };
  }
}
