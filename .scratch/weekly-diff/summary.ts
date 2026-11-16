/**
 * Weekly Diff experiment: tables over the saved judge files. No API call.
 *
 *   node --import tsx .scratch/weekly-diff/summary.ts <date> runs [file-name part] [judge tag]   one row per judged article
 *   node --import tsx .scratch/weekly-diff/summary.ts <date> agree <judge A> <judge B>   two judges, one article
 *
 * `runs` takes the judge files whose name holds the given part (default "-v3-raw2-") and ends
 * with the default judge's rubric tag, and prints each run and the range per cell (model and
 * effort). `agree` aligns two judges' verdicts by the sentence start, not by number, since
 * two judges can split sentences differently.
 */

import fs from "node:fs";
import path from "node:path";

interface Verdict {
  n: number;
  start: string;
  kind: string;
  italic: boolean;
  verdict: string;
  severity: string;
  problem: string;
}

const [date = "", mode, ...rest] = process.argv.slice(2);
const dir = path.join(".scratch", "weekly-diff", date);

const verdictsOf = (file: string): Verdict[] =>
  fs
    .readFileSync(file, "utf8")
    .split("\n")
    .flatMap((line) => {
      const json = /\{.*\}/.exec(line)?.[0];
      if (!json) return [];
      try {
        return [JSON.parse(json) as Verdict];
      } catch {
        return [];
      }
    });

const plain = (text: string): string =>
  text
    .replace(/[[\]*`"“”_…]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const count = <T>(items: T[], test: (item: T) => boolean): number => items.filter(test).length;
const range = (values: number[]): string => {
  const [low, high] = [Math.min(...values), Math.max(...values)];
  return low === high ? `${low}` : `${low}–${high}`;
};

function runs(part = "-v3-raw2-", judgeTag = ""): void {
  const ending = new RegExp(`-j\\d+${judgeTag}\\.jsonl$`);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("judge-") && f.includes(part) && ending.test(f))
    .sort();
  const rows = files.map((file) => {
    const name = file.replace(/^judge-/, "").replace(ending, "");
    const verdicts = verdictsOf(path.join(dir, file));
    const article = fs.readFileSync(path.join(dir, `article-${name}.md`), "utf8");
    const facts = verdicts.filter((v) => v.kind !== "interpretation");
    const readings = verdicts.filter((v) => v.kind === "interpretation");
    return {
      cell: name.replace(/-r\d+$/, "").replace(/-v\d+-\w+$/, ""),
      name,
      words: article.split(/\s+/).filter(Boolean).length,
      sentences: verdicts.length,
      facts: facts.length,
      factsFlagged: count(facts, (v) => v.verdict !== "supported"),
      readings: readings.length,
      readingsFlagged: count(readings, (v) => v.verdict !== "supported"),
      major: count(verdicts, (v) => v.severity === "major"),
      minor: count(verdicts, (v) => v.severity === "minor"),
      unverifiable: count(verdicts, (v) => v.verdict === "unverifiable"),
      unmarked: count(verdicts, (v) => v.kind !== "fact" && !v.italic),
      // The prompt forbids lists, tables and bold labels; the judge does not look at form.
      listLines: count(article.split("\n"), (l) => /^\s*(?:[-*+]|\d+\.)\s/.test(l)),
      tableLines: count(article.split("\n"), (l) => l.trimStart().startsWith("|")),
      bold: (article.match(/\*\*[^*]+\*\*/g) ?? []).length,
    };
  });
  const columns = [
    "words",
    "sentences",
    "facts",
    "factsFlagged",
    "readings",
    "readingsFlagged",
    "major",
    "minor",
    "unverifiable",
    "unmarked",
    "listLines",
    "tableLines",
    "bold",
  ] as const;
  console.log(`| Run | ${columns.join(" | ")} |`);
  console.log(`| --- | ${columns.map(() => "---").join(" | ")} |`);
  for (const row of rows) console.log(`| ${row.name} | ${columns.map((c) => row[c]).join(" | ")} |`);
  console.log("");
  console.log(`| Cell (runs) | ${columns.join(" | ")} |`);
  console.log(`| --- | ${columns.map(() => "---").join(" | ")} |`);
  for (const cell of [...new Set(rows.map((r) => r.cell))]) {
    const of = rows.filter((r) => r.cell === cell);
    console.log(`| ${cell} (${of.length}) | ${columns.map((c) => range(of.map((r) => r[c]))).join(" | ")} |`);
  }
}

function agree(fileA: string, fileB: string): void {
  const [a, b] = [verdictsOf(fileA), verdictsOf(fileB)];
  const key = (v: Verdict): string => plain(v.start).split(" ").slice(0, 5).join(" ");
  const byKey = new Map(b.map((v) => [key(v), v]));
  const pairs = a.flatMap((v): [Verdict, Verdict][] => {
    const other = byKey.get(key(v));
    return other ? [[v, other]] : [];
  });
  const flagged = (v: Verdict): boolean => v.verdict !== "supported";
  console.log(`A: ${a.length} verdicts, B: ${b.length} verdicts, aligned by sentence start: ${pairs.length}`);
  console.log(
    `Same flagged-or-supported: ${count(pairs, ([x, y]) => flagged(x) === flagged(y))} of ${pairs.length}`,
  );
  console.log(`Same verdict: ${count(pairs, ([x, y]) => x.verdict === y.verdict)} of ${pairs.length}`);
  console.log(`Same kind: ${count(pairs, ([x, y]) => x.kind === y.kind)} of ${pairs.length}`);
  console.log(
    `Flagged by both: ${count(pairs, ([x, y]) => flagged(x) && flagged(y))}, only A: ${count(pairs, ([x, y]) => flagged(x) && !flagged(y))}, only B: ${count(pairs, ([x, y]) => !flagged(x) && flagged(y))}`,
  );
  console.log(
    `Major: A ${count(a, (v) => v.severity === "major")}, B ${count(b, (v) => v.severity === "major")}, both ${count(pairs, ([x, y]) => x.severity === "major" && y.severity === "major")}`,
  );
  console.log("\nDisagreements (flagged by one judge only):");
  for (const [x, y] of pairs.filter(([x, y]) => flagged(x) !== flagged(y))) {
    const [who, v] = flagged(x) ? ["A", x] : ["B", y];
    console.log(`- ${x.n}. "${x.start} …" only ${who} (${v.verdict}, ${v.severity}): ${v.problem}`);
  }
}

if (mode === "agree") agree(rest[0] ?? "", rest[1] ?? "");
else runs(rest[0], rest[1]);
