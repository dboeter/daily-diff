/**
 * RSS 2.0 news feeds: fetch, parse, and the news age limit every news feed
 * shares. Regex parsing like arxiv.ts, no XML dependency: feeds are flat
 * enough. Atom is not handled yet — add it when a source needs it.
 */

import { fetchOk } from "./http.ts";
import { DAY_MS } from "./date.ts";

export interface FeedItem {
  /** The guid, else the link. */
  id: string;
  title: string;
  link: string;
  /** ISO timestamp; "" when the feed gives no parseable date. */
  published: string;
  /** Plain text: entities decoded, HTML stripped, whitespace collapsed. */
  description: string;
  /** The `<category>` values; absent when the item has none. */
  categories?: string[];
}

/**
 * News older than this is skipped on every run: news missed during a gap
 * between runs is no longer new (maintainer, 2026-10-14). News feeds only,
 * not legislative stages or consultations.
 */
export const NEWS_MAX_AGE_DAYS = 7;

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
export function tagText(xml: string, tag: string): string {
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

/** HTML to plain text: tags stripped, entities decoded, whitespace collapsed. */
const untruncatedText = (html: string): string =>
  decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
    .replace(DRUPAL_BYLINE_RE, "");

const truncate = (text: string, maxChars: number): string =>
  text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;

/** HTML to plain text: tags stripped, entities decoded, whitespace collapsed, truncated. */
export function plainText(html: string, maxChars = DESCRIPTION_MAX_CHARS): string {
  return truncate(untruncatedText(html), maxChars);
}

/** The data report's vendor notes; Fabric's descriptions are whole posts (up to ~12 KB). */
export const VENDOR_DESCRIPTION_MAX_CHARS = 1000;

const HEADING_RE = /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;

/** What opens a vendor description that lists its post's headings (vendorText). */
export const SECTIONS_LABEL = "Sections: ";

/**
 * plainText for the vendor parsers, without the space it leaves before
 * punctuation where a tag closed ("<a>regions</a>." → "regions ."). A post
 * with `<h2>`–`<h4>` headings opens with them ("Sections: A; B. …"), so
 * every feature of a multi-feature post survives the cut: the Fabric gateway
 * post's one new capability was a heading ~1,600 chars in (2026-10-28).
 */
export function vendorText(html: string, maxChars = VENDOR_DESCRIPTION_MAX_CHARS): string {
  const headings = [...html.matchAll(HEADING_RE)].map(([, , h]) => untruncatedText(h!)).filter(Boolean);
  const body = untruncatedText(html.replace(HEADING_RE, " "));
  const text = headings.length ? `${SECTIONS_LABEL}${headings.join("; ")}. ${body}` : body;
  return truncate(text, maxChars).replace(/ ([,;:.])/g, "$1");
}

/** `toText` turns an item's description HTML into its `description` (vendor feeds: vendorText). */
export function parseRssItems(xml: string, toText: (html: string) => string = plainText): FeedItem[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)].map(([, body]) => {
    const link = tagText(body!, "link");
    const date = Date.parse(tagText(body!, "pubDate"));
    const categories = [...body!.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/g)].map(([c]) =>
      tagText(c, "category"),
    );
    return {
      id: tagText(body!, "guid") || link,
      title: tagText(body!, "title"),
      link,
      published: Number.isFinite(date) ? new Date(date).toISOString() : "",
      // Description HTML arrives entity-encoded: tagText decodes it to HTML, plainText strips it.
      description: toText(tagText(body!, "description")),
      ...(categories.length ? { categories } : {}),
    };
  });
}

/** The items no older than NEWS_MAX_AGE_DAYS at `now`; undated items are dropped. */
export function recentNewsItems(items: FeedItem[], now: Date): FeedItem[] {
  const oldest = now.getTime() - NEWS_MAX_AGE_DAYS * DAY_MS;
  return items.filter((i) => Date.parse(i.published) >= oldest);
}

/** Fetch and parse a feed. Throws on HTTP errors and after http.ts's FETCH_TIMEOUT_MS. */
export async function fetchRssFeed(
  url: string,
  toText: (html: string) => string = plainText,
): Promise<FeedItem[]> {
  return parseRssItems(await (await fetchOk(url)).text(), toText);
}
