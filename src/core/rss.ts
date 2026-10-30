/**
 * RSS 2.0 and Atom news feeds: fetch, parse, and the news age limit every
 * news feed shares. Regex parsing like arxiv.ts, no XML dependency: feeds are
 * flat enough. Atom arrived with the community feeds (DuckDB, Airflow and
 * dltHub publish Atom); BigQuery's per-day Atom entries keep their own parser.
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

/** The named entities blog feeds write besides the XML five (Hugo's Airflow feed: `&rsquo;`, `&mdash;`). */
const NAMED_ENTITIES: Record<string, string> = {
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  copy: "\u00a9",
  trade: "\u2122",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(
      /&(lsquo|rsquo|ldquo|rdquo|ndash|mdash|hellip|copy|trade);/g,
      (_, name: string) => NAMED_ENTITIES[name]!,
    )
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
      // Medium's feeds carry the body only as `<content:encoded>`.
      description: toText(tagText(body!, "description") || tagText(body!, "content:encoded")),
      ...(categories.length ? { categories } : {}),
    };
  });
}

/**
 * An Atom entry's `<link>`: the `rel="alternate"` one, else the first without a
 * `rel` (dltHub's feed writes `<link href="…"/>`), from its `href`.
 */
function atomLink(entry: string): string {
  const links = [...entry.matchAll(/<link\b([^>]*)\/?>/g)].map(([, attrs]) => attrs!);
  const pick = links.find((a) => /\brel="alternate"/.test(a)) ?? links.find((a) => !/\brel=/.test(a));
  return pick?.match(/\bhref="([^"]*)"/)?.[1]?.replace(/&amp;/g, "&") ?? "";
}

/**
 * Atom entries as FeedItems: `<id>` (else the link), `<published>` (else
 * `<updated>`), `<summary>` (else `<content>`) as the description, `<category
 * term>` values as categories.
 */
export function parseAtomEntries(xml: string, toText: (html: string) => string = plainText): FeedItem[] {
  return [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/g)].map(([, body]) => {
    const link = atomLink(body!);
    const date = Date.parse(tagText(body!, "published") || tagText(body!, "updated"));
    const categories = [...body!.matchAll(/<category\b[^>]*\bterm="([^"]*)"/g)].map(([, t]) =>
      decodeEntities(t!),
    );
    return {
      id: tagText(body!, "id") || link,
      title: tagText(body!, "title"),
      link,
      published: Number.isFinite(date) ? new Date(date).toISOString() : "",
      description: toText(tagText(body!, "summary") || tagText(body!, "content")),
      ...(categories.length ? { categories } : {}),
    };
  });
}

/** RSS 2.0 or Atom, by the document's root element. */
export function parseFeedItems(xml: string, toText: (html: string) => string = plainText): FeedItem[] {
  return /<feed[\s>]/.test(xml.slice(0, 2000)) ? parseAtomEntries(xml, toText) : parseRssItems(xml, toText);
}

/** The items no older than NEWS_MAX_AGE_DAYS at `now`; undated items are dropped. */
export function recentNewsItems(items: FeedItem[], now: Date): FeedItem[] {
  const oldest = now.getTime() - NEWS_MAX_AGE_DAYS * DAY_MS;
  return items.filter((i) => Date.parse(i.published) >= oldest);
}

/** Fetch and parse a feed (RSS 2.0 or Atom). Throws on HTTP errors and after http.ts's FETCH_TIMEOUT_MS. */
export async function fetchRssFeed(
  url: string,
  toText: (html: string) => string = plainText,
): Promise<FeedItem[]> {
  return parseFeedItems(await (await fetchOk(url)).text(), toText);
}
