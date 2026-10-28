/**
 * One-off re-judge (October 2026): the `digests/research-state.json` entries
 * saved before the `domain_application` penalty existed carry an unpenalized
 * `relevance`, so the weekly Research table ranked agents for one outside field
 * (medical imaging, investing) at the top. This asks Jev the daily ArXiv
 * ranking's questions again (`scorePaper`) for the entries saved before the
 * cutoff, from their stored title and abstract, and rewrites their `relevance`.
 * The value comes from fresh answers, never from the stored one, so a second run
 * does not penalize twice.
 *
 * The stored abstract is cut at 600 characters, so a code link past that point
 * no longer counts as `code_released`.
 *
 * Usage:
 *   npx tsx scripts/rejudge-research.ts [YYYY-MM-DD] [--dry-run]
 *
 * YYYY-MM-DD: re-judge entries saved before this date (default 2026-10-28).
 * --dry-run: print the changes, write nothing.
 *
 * Env vars:
 *   TYPESAFE_API_KEY
 */

import { pathToFileURL } from "node:url";
import { jevFailedTooOften, mapJev } from "../src/core/jev.ts";
import { scorePaper, type ArxivPaper, type JevScore } from "../src/sources/arxiv.ts";
import {
  loadResearchState,
  saveResearchState,
  type ResearchEntry,
  type ResearchState,
} from "../src/trending/research.ts";

/** The first day the daily ranking saved penalized relevance. */
const DEFAULT_CUTOFF = "2026-10-28";

export interface RelevanceChange {
  id: string;
  title: string;
  old: number;
  /** null when the Jev call failed: the entry keeps its old relevance. */
  new: number | null;
}

/** The entries saved before `cutoff` (a CST date), by id. */
export function entriesBefore(state: ResearchState, cutoff: string): [string, ResearchEntry][] {
  return Object.entries(state.items).filter(([, e]) => e.date < cutoff);
}

/** The entry as the paper `scorePaper` reads: only `title` and `summary` reach Jev and the code-link check. */
function asPaper(id: string, e: ResearchEntry): ArxivPaper {
  return {
    id,
    title: e.title,
    summary: e.abstract,
    authors: [],
    published: e.published,
    updated: e.published,
    categories: [],
    url: e.url,
    pdfUrl: "",
  };
}

/**
 * The state with every entry saved before `cutoff` re-scored, and one change per
 * such entry. Returns null when too many calls failed for the scores to be
 * trusted, like the daily ranking's recency fallback.
 */
export async function rejudgeResearch(
  state: ResearchState,
  cutoff: string,
  score: (paper: ArxivPaper) => Promise<JevScore>,
): Promise<{ state: ResearchState; changes: RelevanceChange[] } | null> {
  const stale = entriesBefore(state, cutoff);
  const { results, failed } = await mapJev(stale, ([id, e]) => score(asPaper(id, e)), "rejudge");
  if (jevFailedTooOften(failed, stale.length)) return null;
  const items = { ...state.items };
  const changes = stale.map(([id, e], i): RelevanceChange => {
    const relevance = results[i]?.relevance ?? null;
    if (relevance !== null) items[id] = { ...e, relevance };
    return { id, title: e.title, old: e.relevance, new: relevance };
  });
  return { state: { items }, changes };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cutoff = args.find((a) => !a.startsWith("-")) ?? DEFAULT_CUTOFF;
  const dryRun = args.includes("--dry-run");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff)) throw new Error(`Not a YYYY-MM-DD date: ${cutoff}`);
  const apiKey = process.env["TYPESAFE_API_KEY"];
  if (!apiKey) {
    console.error("TYPESAFE_API_KEY is not set: the re-judge asks Jev, nothing was changed.");
    process.exit(1);
  }

  const state = loadResearchState();
  console.log(`Re-judging ${entriesBefore(state, cutoff).length} entries saved before ${cutoff}...`);
  const result = await rejudgeResearch(state, cutoff, (paper) => scorePaper(paper, apiKey));
  if (!result) {
    console.error("Too many Jev failures (first error above): nothing was changed.");
    process.exit(1);
  }

  for (const c of result.changes) {
    const now = c.new === null ? "failed, kept" : c.new.toFixed(3);
    console.log(`  ${c.old.toFixed(3)} → ${now}  ${c.title}`);
  }
  if (dryRun) {
    console.log("Dry run: nothing written.");
    return;
  }
  saveResearchState(result.state);
  console.log("Saved digests/research-state.json");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
