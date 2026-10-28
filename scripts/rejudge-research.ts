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
 * The state keeps 600 characters of each abstract, and a cut abstract scores
 * lower on every question, so the full abstracts are fetched from the arXiv API
 * first; an entry the API does not return is judged on its stored text.
 *
 * Usage:
 *   npx tsx scripts/rejudge-research.ts [YYYY-MM-DD] [--dry-run]
 *
 * YYYY-MM-DD: re-judge entries saved before this date (default 2026-10-28).
 * --dry-run: print the changes, write nothing.
 *
 * Exits 1 when an entry's Jev call failed, listing those entries last (the
 * rest are still saved): run it again until it exits 0.
 *
 * Env vars:
 *   TYPESAFE_API_KEY
 */

import { pathToFileURL } from "node:url";
import { jevFailedTooOften, mapJev } from "../src/core/jev.ts";
import { fetchOk } from "../src/core/http.ts";
import {
  API_URL,
  parseArxivEntries,
  scorePaper,
  type ArxivPaper,
  type JevScore,
} from "../src/sources/arxiv.ts";
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

/** The full abstracts of the papers `ids` names (state ids are their abs URLs), in one arXiv API request. */
export async function fetchAbstracts(ids: string[]): Promise<Map<string, string>> {
  const params = new URLSearchParams({
    id_list: ids.map((id) => id.replace(/^https?:\/\/arxiv\.org\/abs\//, "")).join(","),
    max_results: String(ids.length),
  });
  const res = await fetchOk(`${API_URL}?${params}`);
  return new Map(parseArxivEntries(await res.text()).map((p) => [p.id, p.summary]));
}

/** The entry as the paper `scorePaper` reads: only `title` and `summary` reach Jev and the code-link check. */
function asPaper(id: string, e: ResearchEntry, abstract: string): ArxivPaper {
  return {
    id,
    title: e.title,
    summary: abstract,
    authors: [],
    published: e.published,
    updated: e.published,
    categories: [],
    url: e.url,
    pdfUrl: "",
  };
}

/**
 * The state with every entry saved before `cutoff` re-scored, from its full
 * abstract in `abstracts` when there is one, and one change per such entry.
 * Returns null when too many calls failed for the scores to be trusted, like the
 * daily ranking's recency fallback.
 */
export async function rejudgeResearch(
  state: ResearchState,
  cutoff: string,
  score: (paper: ArxivPaper) => Promise<JevScore>,
  abstracts: Map<string, string> = new Map(),
): Promise<{ state: ResearchState; changes: RelevanceChange[] } | null> {
  const stale = entriesBefore(state, cutoff);
  const { results, failed } = await mapJev(
    stale,
    ([id, e]) => score(asPaper(id, e, abstracts.get(id) ?? e.abstract)),
    "rejudge",
  );
  if (jevFailedTooOften(failed, stale.length)) return null;
  const items = { ...state.items };
  const changes = stale.map(([id, e], i): RelevanceChange => {
    const relevance = results[i]?.relevance ?? null;
    if (relevance !== null) items[id] = { ...e, relevance };
    return { id, title: e.title, old: e.relevance, new: relevance };
  });
  return { state: { items }, changes };
}

/**
 * Prints every change, then the entries whose call failed: they keep their old, unpenalized
 * relevance. Returns the exit code, 1 when there is such an entry, so the maintainer reruns the
 * script (a rerun scores from fresh answers, so the entries already re-judged stay as they are).
 */
export function printChanges(changes: RelevanceChange[]): number {
  for (const c of changes) {
    const now = c.new === null ? "failed, kept" : c.new.toFixed(3);
    console.log(`  ${c.old.toFixed(3)} → ${now}  ${c.title}`);
  }
  const failed = changes.filter((c) => c.new === null);
  if (!failed.length) return 0;
  console.error(
    `${failed.length} entries could not be re-judged and keep their old relevance; run the script again:`,
  );
  for (const c of failed) console.error(`  ${c.id}  ${c.title}`);
  return 1;
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
  const ids = entriesBefore(state, cutoff).map(([id]) => id);
  const abstracts = await fetchAbstracts(ids);
  const full = ids.filter((id) => abstracts.has(id)).length;
  console.log(`Re-judging ${ids.length} entries saved before ${cutoff} (${full} full abstracts)...`);
  const result = await rejudgeResearch(state, cutoff, (paper) => scorePaper(paper, apiKey), abstracts);
  if (!result) {
    console.error("Too many Jev failures (first error above): nothing was changed.");
    process.exit(1);
  }

  process.exitCode = printChanges(result.changes);
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
