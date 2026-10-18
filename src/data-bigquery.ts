/**
 * BigQuery release notes: an Atom feed with one entry per day (newest 30), each
 * holding that day's notes under an `<h3>` type (`Feature`, `Change`…). The
 * notes are the unit to report, so each entry is split on `<h3>`. Breaks when
 * the feed changes: zero entries parsed throws.
 */

import { tagText, vendorText } from "./rss.ts";
import { fetchOk } from "./http.ts";
import type { VendorNote } from "./data-vendors.ts";

/** The first sentence of a note's first paragraph (a list often follows its colon). */
function firstSentence(html: string): string {
  const text = vendorText(html.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? html, Number.MAX_SAFE_INTEGER);
  return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
}

/**
 * One note per `<h3>`: title = "<type>: <first sentence>", id = the entry's
 * anchor + "#" + title (not the note's index: a note added before it would
 * move it, and the verdict cache is keyed by id), categories = [type].
 */
export function parseBigQueryNotes(xml: string): VendorNote[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => e!);
  if (entries.length === 0) throw new Error("no BigQuery entries parsed (feed changed?)");
  return entries.flatMap((entry) => {
    const anchor = tagText(entry, "id").split("#")[1] ?? "";
    // `<updated>` is the day at local midnight (2026-10-16T00:00:00-07:00): its date part is the day.
    const date = tagText(entry, "updated").slice(0, 10);
    const link = entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? "";
    // tagText unwraps the CDATA content to HTML; each <h3> starts a note.
    return tagText(entry, "content")
      .split(/<h3>/)
      .slice(1)
      .map((part) => {
        const [type, body = ""] = part.split("</h3>");
        const kind = vendorText(type!);
        const title = `${kind}: ${firstSentence(body)}`;
        return {
          id: `${anchor}#${title}`,
          title,
          link,
          date,
          description: vendorText(body),
          categories: [kind],
        };
      });
  });
}

/** Fetch and parse the feed. Throws on HTTP errors and when nothing parses. */
export async function fetchBigQueryNotes(url: string): Promise<VendorNote[]> {
  return parseBigQueryNotes(await (await fetchOk(url)).text());
}
