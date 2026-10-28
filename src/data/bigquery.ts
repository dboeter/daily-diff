/**
 * BigQuery release notes: an Atom feed with one entry per day (newest 30), each
 * holding that day's notes under an `<h3>` type (`Feature`, `Change`…). The
 * notes are the unit to report, so each entry is split on `<h3>`. Breaks when
 * the feed changes: zero entries parsed throws.
 */

import { tagText, vendorText } from "../core/rss.ts";
import { fetchOk } from "../core/http.ts";
import type { VendorNote } from "./vendors.ts";

/** The first sentence of a note's first paragraph (a list often follows its colon). */
function firstSentence(html: string): string {
  const text = vendorText(html.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? html, Number.MAX_SAFE_INTEGER);
  return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
}

/** A stage marker in parentheses ("(GA)", "(Public Preview)"); also in vendors.ts's STATUS_RE. Case-insensitive. */
export const STAGE_MARKER = String.raw`\((?:general availability|ga|public preview|preview)\)`;

const GA_PHRASE = "generally available";
const PREVIEW_PHRASE = "in (?:public |private )?preview";
/** A trailing stage phrase ("… is now generally available (GA)."), which the stage suffix replaces. */
const STAGE_PHRASE_RE = new RegExp(
  String.raw`\s+(?:is|are) (?:now )?(?:${GA_PHRASE}|${PREVIEW_PHRASE})(?: ${STAGE_MARKER})?\.?$|\s*${STAGE_MARKER}\.?$`,
  "i",
);
/** A clause the summary carries ("…, letting you provide …"): the label stops before it. */
const TRAILING_CLAUSE_RE = /,\s+(?:which|letting|allowing|enabling|so that)\b.*$/;

/** Present availability: "is now generally available", "are in Preview"; "will be …" does not match. */
const PRESENT_GA_RE = new RegExp(String.raw`\b(?:is|are) (?:now )?${GA_PHRASE}\b`, "i");
const PRESENT_PREVIEW_RE = new RegExp(
  String.raw`\b(?:is|are) (?:now )?(?:available )?${PREVIEW_PHRASE}\b`,
  "i",
);
/** A later sentence about the note's subject ("This feature is …"), not about something it names. */
const SUBJECT_SENTENCE_RE =
  /^(?:(?:this|these|the) (?:features?|capabilit(?:y|ies)|functionality)|it|they)\b/i;

/**
 * The release stage the note states for its subject: from its first sentence
 * or one opening "This feature …", in the present tense. A note that states
 * none, or both GA and Preview (two features at two stages), gets none.
 */
function stageOf(text: string): string | undefined {
  const stages = new Set(
    text
      .split(/(?<=[.!?])\s+/)
      .filter((s, i) => (i === 0 || SUBJECT_SENTENCE_RE.test(s)) && !/\bwill\b/i.test(s))
      .flatMap((s) => [
        ...(PRESENT_GA_RE.test(s) ? ["GA"] : []),
        ...(PRESENT_PREVIEW_RE.test(s) ? ["Preview"] : []),
      ]),
  );
  return stages.size === 1 ? [...stages][0] : undefined;
}

/**
 * The Item cell's label: the first sentence without its stage phrase, trailing
 * clause and period, then the stage from the whole note (`stageOf`), as the other
 * vendors' titles carry it ("(GA)", "(Preview)"). BigQuery states it in a later sentence.
 */
function noteLabel(sentence: string, text: string): string {
  const stage = stageOf(text);
  // Without a stage suffix, a stage phrase stays: it may be the only place the note states one.
  const label = (stage ? sentence.replace(STAGE_PHRASE_RE, "") : sentence)
    .replace(TRAILING_CLAUSE_RE, "")
    .replace(/[.:]$/, "");
  return stage ? `${label} (${stage})` : label;
}

/**
 * One note per `<h3>`: title = its label (`noteLabel`), id = the entry's anchor
 * + "#" + "<type>: <first sentence>", the title before 2026-10-28 (not the
 * note's index: a note added before it would move it, and the verdict cache is
 * keyed by id), categories = [type]. That old title is also `formerTitles`, so
 * the data state's title + date keys saved before 2026-10-28 still match.
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
        const sentence = firstSentence(body);
        const text = vendorText(body, Number.MAX_SAFE_INTEGER);
        const oldTitle = `${kind}: ${sentence}`;
        return {
          id: `${anchor}#${oldTitle}`,
          title: noteLabel(sentence, text),
          formerTitles: [oldTitle],
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
