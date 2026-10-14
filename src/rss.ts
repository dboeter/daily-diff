/**
 * RSS 2.0 news feeds: fetch, parse, and the news age limit every news feed
 * shares. Regex parsing like arxiv.ts, no XML dependency: feeds are flat
 * enough. Atom is not handled yet — add it when a source needs it.
 */

export interface FeedItem {
  /** The guid, else the link. */
  id: string;
  title: string;
  link: string;
  /** ISO timestamp; "" when the feed gives no parseable date. */
  published: string;
  /** Plain text: entities decoded, HTML stripped, whitespace collapsed. */
  description: string;
}

/**
 * News older than this is skipped on every run: news missed during a gap
 * between runs is no longer new (maintainer, 2026-10-14). News feeds only,
 * not legislative stages or consultations.
 */
export const NEWS_MAX_AGE_DAYS = 7;

const FETCH_TIMEOUT_MS = 30_000;
const DESCRIPTION_MAX_CHARS = 600;

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** A tag's text: CDATA unwrapped or entities decoded. "" when absent. */
function tagText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  if (!m) return "";
  const cdata = m[1]!.trim().match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return (cdata ? cdata[1]! : decodeEntities(m[1]!)).trim();
}

/**
 * Drupal's byline: the title repeated, "Anonymous (not verified)" and the post
 * date, ahead of the body in every Commission digital-strategy description.
 * Stripped before truncation so it costs no body text and Jev and the LLM never read it.
 */
const DRUPAL_BYLINE_RE = /^.*?Anonymous \(not verified\) \w{3}, \d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}\s*/;

/** HTML to plain text: tags stripped, entities decoded, whitespace collapsed, truncated. */
export function plainText(html: string): string {
  const text = decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
    .replace(DRUPAL_BYLINE_RE, "");
  return text.length > DESCRIPTION_MAX_CHARS ? `${text.slice(0, DESCRIPTION_MAX_CHARS)}…` : text;
}

export function parseRssItems(xml: string): FeedItem[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)].map(([, body]) => {
    const link = tagText(body!, "link");
    const date = Date.parse(tagText(body!, "pubDate"));
    return {
      id: tagText(body!, "guid") || link,
      title: tagText(body!, "title"),
      link,
      published: Number.isFinite(date) ? new Date(date).toISOString() : "",
      // Description HTML arrives entity-encoded: tagText decodes it to HTML, plainText strips it.
      description: plainText(tagText(body!, "description")),
    };
  });
}

/** The items no older than NEWS_MAX_AGE_DAYS at `now`; undated items are dropped. */
export function recentNewsItems(items: FeedItem[], now: Date): FeedItem[] {
  const oldest = now.getTime() - NEWS_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return items.filter((i) => Date.parse(i.published) >= oldest);
}

/** Fetch and parse a feed. Throws on HTTP errors and after FETCH_TIMEOUT_MS. */
export async function fetchRssFeed(url: string): Promise<FeedItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "daily-diff/1.0" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseRssItems(await res.text());
}
