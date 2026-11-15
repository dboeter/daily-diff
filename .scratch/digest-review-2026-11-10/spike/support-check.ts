/**
 * Spike for issue 05: does one Jev question ("does the source support this sentence?") separate
 * the published sentences the reviews flagged from those that held up?
 *
 * Usage: node --env-file=.env --import tsx .scratch/digest-review-2026-11-10/spike/support-check.ts <cases.jsonl> [--limit N]
 * Each input line: {"id", "claim", "source", "label": "flagged" | "control"}. `source` is the text
 * the writing model was given (or the on-page row, for a Highlight). Answers are cached in
 * `cache.json` next to this file, so a rerun asks only for new or changed cases. Never writes digests/.
 */
import fs from "node:fs";
import path from "node:path";
import { askJev, mapJev } from "../../../src/core/jev.ts";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const CACHE = path.join(DIR, "cache.json");

export const SUPPORT_QUESTIONS = {
  supported: {
    type: "noul",
    instructions:
      "`claim` is a sentence a digest wrote about the item in `source`. Does `source` support " +
      "everything `claim` states, as `claim` states it?",
    criteria: {
      true:
        "Every fact in `claim` is in `source` with the same strength, scope and attribution: a claim " +
        "may shorten, paraphrase or leave things out, and may say who reports it",
      false:
        "`claim` says more than `source`: it states as fact what `source` gives as one person's " +
        "report, allegation or question; turns 'recommends', 'can' or 'upcoming' into 'must', " +
        "'does' or 'released'; adds a release stage, date, figure, cause, comparison or audience " +
        "`source` does not give; merges separate changes into one; generalizes one case to many; " +
        "or reverses or drops the qualifier of a figure",
    },
  },
};

interface Case {
  id: string;
  claim: string;
  source: string;
  label: string;
}

const args = process.argv.slice(2);
const file = args[0];
const limitAt = args.indexOf("--limit");
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;
const key = process.env.TYPESAFE_API_KEY;
if (!file || !key)
  throw new Error("usage: support-check.ts <cases.jsonl> [--limit N], with TYPESAFE_API_KEY");

const cases: Case[] = fs
  .readFileSync(file, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l) as Case)
  .slice(0, limit);
const cache: Record<string, { claim: string; source: string; answers: unknown }> = fs.existsSync(CACHE)
  ? JSON.parse(fs.readFileSync(CACHE, "utf8"))
  : {};
const todo = cases.filter((c) => cache[c.id]?.claim !== c.claim || cache[c.id]?.source !== c.source);
console.log(`${cases.length} cases, ${todo.length} to ask`);

const { results } = await mapJev(
  todo,
  async (c) => askJev({ source: c.source, claim: c.claim }, SUPPORT_QUESTIONS, key),
  "support",
);
todo.forEach((c, i) => {
  const r = results[i];
  if (r) cache[c.id] = { claim: c.claim, source: c.source, answers: r.answers };
});
fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));

for (const c of cases) {
  // Printed raw: the noul answer's shape is checked on the pilot before any scoring code is written.
  console.log(`${c.label.padEnd(8)} ${c.id.padEnd(22)} ${JSON.stringify(cache[c.id]?.answers ?? "failed")}`);
}
