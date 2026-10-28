/**
 * Code-rendered tables with LLM row summaries (trending, AI Policy, the
 * data report's vendor tables). A row's number is set once, when the report's
 * final order is chosen (`numberRows`, or trending's `selectTrendingReport`);
 * the summaries prompt lists the rows by that number, the model answers
 * `N: text` lines (`parseRowSummaries`), and the renderer looks each row's
 * summary up by its own number. So a summary lands on its row whatever order
 * the renderer walks the rows in. Pure: a report renders its tables once for
 * the prose prompt (no summaries) and once for the report.
 */

import { escapeRegex } from "../core/regex.ts";
import type { TrendingReportData } from "../trending/rank.ts";

/** A table row with its number in the report: the summaries call's `N:`. */
export type Numbered<T> = T & { n: number };

/** Number the rows in their final order: after + 1, after + 2, … (`after` earlier rows in the same call). */
export const numberRows = <T>(items: T[], after = 0): Numbered<T>[] =>
  items.map((it, i) => ({ ...it, n: after + i + 1 }));

/** Where the prose LLM call leaves room for the code-rendered tables. */
export const TABLES_MARKER = "<!-- tables -->";

// ---------------------------------------------------------------------------
// Summaries prompt
// ---------------------------------------------------------------------------

/** The numbered row list: `N. <text>`, one row per line. */
export const rowList = <T>(rows: Numbered<T>[], text: (row: T) => string): string =>
  rows.map((r) => `${r.n}. ${text(r)}`).join("\n");

/** The output line every summaries prompt asks for; `length` is e.g. "2 sentences". */
export const summaryLine = (length: string): string =>
  `For every numbered item write exactly one line in the form \`N: <${length}>\``;

/** The output rule every summaries prompt ends its list of rules with, before the language. */
export const summaryOutputRule = (count: number): string =>
  `- Output one line per item, ${count} lines in total, in the given order. No other text: no headings, no introduction, no blank lines.`;

/**
 * Parse the summaries call's `N: text` lines. Tolerant of the list styles
 * models drift into (`3.`, `3)`, `- 3:`, `**3:**`); lines without a leading
 * number or with no text are ignored, and the first line for a number wins.
 */
export function parseRowSummaries(text: string): Map<number, string> {
  const summaries = new Map<number, string>();
  for (const line of text.split("\n")) {
    // `.` must not be followed by a digit, so "3.5x growth" is not row 3.
    const m = line.match(/^\s*(?:[-*+]\s+)?\**\s*(\d+)\s*\**\s*(?::|\)|\.(?!\d))\s*\**\s*(.*?)\s*$/);
    if (!m || !m[2]) continue;
    const n = Number(m[1]);
    if (!summaries.has(n)) summaries.set(n, m[2]);
  }
  return summaries;
}

/** Letters and digits only, lowercased: `CODINGAGENT` and `CODING_AGENT` compare equal. */
const tokenKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The summaries with every backticked token checked against its row's source text: a token the
 * source spells differently takes the source's spelling, and one the source lacks loses its
 * backticks, so a reader never copies an identifier the model made up. On 2026-10-26 a
 * Snowflake row read `CODINGAGENT` for the source's `CODING_AGENT`.
 */
export function checkCodeTokens(
  summaries: Map<number, string>,
  sources: Map<number, string>,
  tag: string,
): Map<number, string> {
  const checked = new Map<number, string>();
  for (const [n, text] of summaries) {
    const source = sources.get(n);
    if (source === undefined) {
      checked.set(n, text);
      continue;
    }
    const sourceTokens = source.match(/[\w.:/@-]+/g) ?? [];
    checked.set(
      n,
      text.replace(/`([^`\n]+)`/g, (whole, token: string) => {
        if (source.includes(token)) return whole;
        const match = sourceTokens.find((t) => tokenKey(t) === tokenKey(token) && tokenKey(t) !== "");
        console.warn(
          `  [${tag}] row ${n}: \`${token}\` is not in its source${match ? `; using \`${match}\`` : ""}`,
        );
        return match ? `\`${match}\`` : token;
      }),
    );
  }
  return checked;
}

/** A sentence about the model's input rather than the item: "The provided text does not specify …". */
const INPUT_TALK_RE =
  /\b(?:provided|given) (?:text|description)\b|\bthe (?:text|description) (?:does not|doesn't|did not|is empty)\b/i;

/**
 * The summaries without their sentences about the model's input, each one logged. On 2026-10-28
 * the only AI Policy row ended "The provided text does not specify any direct implications for
 * organisations that deploy AI." A summary left with no sentence is dropped, so its row shows
 * the description.
 */
export function dropInputTalk(summaries: Map<number, string>, tag: string): Map<number, string> {
  const kept = new Map<number, string>();
  for (const [n, text] of summaries) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const rest = sentences.filter((s) => {
      if (!INPUT_TALK_RE.test(s)) return true;
      console.warn(`  [${tag}] row ${n}: dropped a sentence about its input: "${s}"`);
      return false;
    });
    if (rest.length) kept.set(n, rest.length === sentences.length ? text : rest.join(" "));
  }
  return kept;
}

const STOPWORDS = new Set(
  "a an and are as at be by for from has have in is it its of on or that the their this to was with you your yours".split(
    " ",
  ),
);

/**
 * Lowercased words minus stopwords, a plural "s" cut so "agents" matches "agent": the words two
 * texts are compared by, here and for a highlight restating its page's lead (`restatesLead`).
 */
export function contentWords(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}+#'-]*/gu) ?? [])
    .filter((w) => !STOPWORDS.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
}

/**
 * The share of a later sentence's content words already in the first at which
 * it is dropped as a restatement. On 2026-10-28 the restating second sentences
 * scored 0.67 (pi: "among", "many" new), 1 (Proto Agent) and 1
 * (anomalyco/opencode); 0.6 still keeps a sentence whose words are over 40% new.
 */
export const RESTATED_SENTENCE_SHARE = 0.6;

/**
 * Trends' row summaries with what the model repeats cut (2026-10-28: 42 of 53
 * had a second "It …" sentence restating the first, 30 ended "in TypeScript."
 * next to the Lang column; the prompt forbids the first and the free model
 * ignores it): a later sentence mostly made of the first's words, then a trailing
 * "(written) in <language>" matching a category row's Lang column. Pass the report
 * for the Radar and category summaries, none for Hugging Face's.
 */
export function tidyTrendsSummaries(
  summaries: Map<number, string>,
  report?: Pick<TrendingReportData, "categories">,
): Map<number, string> {
  const languages = new Map(
    (report?.categories ?? []).flatMap((g) => g.rows.flatMap((r) => (r.language ? [[r.n, r.language]] : []))),
  );
  return new Map(
    [...summaries].map(([n, line]) => {
      const [first = "", ...rest] = line.split(/(?<=[.!?])\s+(?=\p{Lu})/u);
      const firstWords = new Set(contentWords(first));
      const kept = rest.filter((s) => {
        const words = contentWords(s);
        return words.filter((w) => firstWords.has(w)).length < RESTATED_SENTENCE_SHARE * words.length;
      });
      let text = [first, ...kept].join(" ");
      const language = languages.get(n);
      if (language) {
        // Not after "is" or "written": "Foo is written in Rust." would become "Foo is.".
        const suffix = `(?<!\\b(?:is|are|was|written)),?\\s+(?:written\\s+)?in\\s+${escapeRegex(language)}(?=[.!]?$)`;
        text = text.replace(new RegExp(suffix, "i"), "");
      }
      return [n, text];
    }),
  );
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * A row with no LLM summary shows its description instead, cut to about two
 * lines of a table cell so one long README blurb does not stretch the table.
 */
const DESCRIPTION_FALLBACK_CHARS = 160;

function descriptionFallback(description: string): string {
  const d = description.replace(/\s+/g, " ").trim();
  if (!d) return "—";
  if (d.length <= DESCRIPTION_FALLBACK_CHARS) return d;
  const cut = d.slice(0, DESCRIPTION_FALLBACK_CHARS);
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** A row's summary cell text (not yet cell-escaped): the model's line for its number, else its description. */
export const summaryText = (
  summaries: Map<number, string>,
  row: { n: number; description: string },
): string => summaries.get(row.n) ?? descriptionFallback(row.description);

/** Put the tables where the prose left the marker; after the prose when the model dropped it. */
export function spliceTables(prose: string, tables: string): string {
  const lines = prose.split("\n");
  const i = lines.findIndex((l) => l.trim() === TABLES_MARKER);
  if (i === -1) return tables ? `${prose.trimEnd()}\n\n${tables}` : prose;
  const before = lines.slice(0, i).join("\n").trimEnd();
  const after = lines
    .slice(i + 1)
    .join("\n")
    .trimStart();
  return [before, tables, after].filter(Boolean).join("\n\n");
}
