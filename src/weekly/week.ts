/**
 * Weekly Diff's input from disk: the six days before the run, and every saved day's vendor
 * notes. Today's pages and candidates are not saved yet when the article is written, so the
 * caller passes them.
 */

import fs from "node:fs";
import path from "node:path";
import { daysBefore, WEEK_DAYS } from "../core/date.ts";
import { githubGet } from "../core/github.ts";
import { type Candidate, isCandidate } from "../reports/candidates.ts";
import { WEEK_PAGE_IDS, type GitHubFetch, type WeekDay } from "./source.ts";

const DIGESTS_DIR = "digests";
const DAY_FOLDER = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A day's `candidates.json`. A day without one (before 2026-11-07, or without a run) reads as
 * none, silently. A file that cannot be read or parsed, or is no list, is logged and reads as
 * none; an entry of another shape is left out and counted in the log.
 */
function readCandidates(dir: string, date: string): Candidate[] {
  const file = path.join(dir, date, "candidates.json");
  if (!fs.existsSync(file)) return [];
  const name = `${date}/candidates.json`;
  let entries: unknown;
  try {
    entries = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (err) {
    console.error(`  [weekly] ${name}: ${String(err).split("\n")[0]}`);
    return [];
  }
  if (!Array.isArray(entries)) {
    console.error(`  [weekly] ${name}: not a list`);
    return [];
  }
  const candidates = entries.filter(isCandidate);
  const other = entries.length - candidates.length;
  if (other) console.error(`  [weekly] ${name}: ${other} entries of another shape left out`);
  return candidates;
}

/** A day's saved pages, by report id. */
function readPages(dir: string, date: string): Record<string, string> {
  const pages: Record<string, string> = {};
  for (const id of WEEK_PAGE_IDS) {
    const file = path.join(dir, date, `${id}.md`);
    if (fs.existsSync(file)) pages[id] = fs.readFileSync(file, "utf-8");
  }
  return pages;
}

/**
 * The week that ends on `today.date`, oldest day first, and the vendor notes of every saved day,
 * oldest first: an Action required row an earlier week opened takes its text from its note.
 */
export function loadWeek(today: WeekDay, dir = DIGESTS_DIR): { days: WeekDay[]; vendorNotes: Candidate[] } {
  const saved = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => DAY_FOLDER.test(name) && name < today.date)
        .sort()
    : [];
  // Each saved day is read once: the week's days are among them.
  const candidates = new Map(saved.map((date) => [date, readCandidates(dir, date)]));
  const earlier = Array.from({ length: WEEK_DAYS - 1 }, (_, i): WeekDay => {
    const date = daysBefore(today.date, WEEK_DAYS - 1 - i);
    return { date, candidates: candidates.get(date) ?? [], pages: readPages(dir, date) };
  });
  const isNote = (c: Candidate) => c.kind === "vendor-note";
  return {
    days: [...earlier, today],
    vendorNotes: [...[...candidates.values()].flat().filter(isNote), ...today.candidates.filter(isNote)],
  };
}

/** A release or an issue from the GitHub API; a failed call is logged, and the item keeps its saved text. */
export const fetchGitHubObject: GitHubFetch = (apiPath) =>
  githubGet<unknown>(`https://api.github.com/${apiPath}`).catch((err: unknown) => {
    console.error(`  [weekly] ${apiPath}: ${String(err).split("\n")[0]}`);
    return undefined;
  });
