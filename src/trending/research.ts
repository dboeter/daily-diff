/**
 * The research state `digests/research-state.json`: each day's top arXiv papers
 * by Jev relevance, from which the weekly Trends page takes its papers of the
 * week. arXiv is fetched and scored daily; the page is weekly.
 */

import path from "node:path";
import { daysBefore } from "../core/date.ts";
import { loadItemsFile, saveItemsFile, type ItemsFile } from "../core/jev.ts";
import type { ArxivData } from "../sources/arxiv.ts";

/** One saved paper, keyed by its arXiv id. */
export interface ResearchEntry {
  title: string;
  url: string;
  published: string; // ISO
  relevance: number;
  abstract: string; // cut at ABSTRACT_CHARS
  date: string; // CST date of the run that ranked it
}

export type ResearchState = ItemsFile<ResearchEntry>;
export type ResearchPaper = ResearchEntry & { id: string };

export const RESEARCH_STATE_FILE = path.join("digests", "research-state.json");

/** Papers saved per day. */
const DAILY_PAPERS = 15;
/** Papers on the weekly page. */
export const WEEKLY_PAPERS = 10;
const ABSTRACT_CHARS = 600;
/** The weekly page reads the 7 days before Monday's run. */
const KEEP_DAYS = 8;

/** Missing or malformed → empty: the file holds no hand edits, so a malformed one is overwritten. */
export function loadResearchState(file = RESEARCH_STATE_FILE): ResearchState {
  return loadItemsFile<ResearchEntry>(file, "research") ?? { items: {} };
}

export function saveResearchState(state: ResearchState, file = RESEARCH_STATE_FILE): void {
  saveItemsFile(state, file);
}

/**
 * The state after a run: on a Jev-ranked run, that date's entries replaced by
 * its top DAILY_PAPERS (so a same-day re-run gives the same day); a run ranked
 * by recency adds nothing. Entries older than KEEP_DAYS are pruned.
 */
export function nextResearchState(state: ResearchState, arxiv: ArxivData, dateStr: string): ResearchState {
  const oldest = daysBefore(dateStr, KEEP_DAYS);
  const ranked = arxiv.rankedBy === "jev";
  const items: Record<string, ResearchEntry> = Object.fromEntries(
    Object.entries(state.items).filter(([, e]) => e.date >= oldest && !(ranked && e.date === dateStr)),
  );
  if (ranked) {
    const top = arxiv.papers
      .flatMap((p) => (p.relevance === undefined ? [] : [{ ...p, relevance: p.relevance }]))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, DAILY_PAPERS);
    for (const p of top) {
      // A paper an earlier day saved keeps that day: it was first seen then.
      if (items[p.id]) continue;
      items[p.id] = {
        title: p.title,
        url: p.url,
        published: p.published,
        relevance: p.relevance,
        abstract: p.summary.slice(0, ABSTRACT_CHARS),
        date: dateStr,
      };
    }
  }
  return { items };
}

/** The week's papers: saved in the 7 days before the run, the WEEKLY_PAPERS most relevant. */
export function weekPapers(state: ResearchState, dateStr: string): ResearchPaper[] {
  const from = daysBefore(dateStr, 7);
  return Object.entries(state.items)
    .filter(([, e]) => e.date >= from && e.date < dateStr)
    .map(([id, e]) => ({ id, ...e }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, WEEKLY_PAPERS);
}
