/**
 * Code-rendered tables with LLM row summaries (trending, Policy Watch, the
 * data report's vendor tables). A row's number is set once, when the report's
 * final order is chosen (`numberRows`, or trending's `selectTrendingReport`);
 * the summaries prompt lists the rows by that number, the model answers
 * `N: text` lines (`parseRowSummaries`), and the renderer looks each row's
 * summary up by its own number. So a summary lands on its row whatever order
 * the renderer walks the rows in. Pure: a report renders its tables once for
 * the prose prompt (no summaries) and once for the report.
 */

/** A table row with its number in the report: the summaries call's `N:`. */
export type Numbered<T> = T & { n: number };

/** Number the rows 1, 2, … in their final order. */
export const numberRows = <T>(items: T[]): Numbered<T>[] => items.map((it, i) => ({ ...it, n: i + 1 }));

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
