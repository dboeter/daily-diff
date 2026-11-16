/**
 * Weekly Diff's input from disk: the six days before the run, and every saved day's vendor
 * notes. Today's pages and candidates are not saved yet when the article is written, so the
 * caller passes them.
 */

import fs from "node:fs";
import path from "node:path";
import { daysBefore } from "../core/date.ts";
import { githubGet } from "../core/github.ts";
import type { Candidate } from "../reports/candidates.ts";
import { WEEK_PAGE_IDS, type GitHubFetch, type WeekDay } from "./source.ts";

const DIGESTS_DIR = "digests";
const DAY_FOLDER = /^\d{4}-\d{2}-\d{2}$/;

/** A day's `candidates.json`; none before 2026-11-07, and a malformed one reads as none. */
function readCandidates(dir: string, date: string): Candidate[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, date, "candidates.json"), "utf-8")) as Candidate[];
  } catch {
    return [];
  }
}

function readDay(dir: string, date: string): WeekDay {
  const pages: Record<string, string> = {};
  for (const id of WEEK_PAGE_IDS) {
    const file = path.join(dir, date, `${id}.md`);
    if (fs.existsSync(file)) pages[id] = fs.readFileSync(file, "utf-8");
  }
  return { date, candidates: readCandidates(dir, date), pages };
}

/**
 * The week that ends on `today.date`, oldest day first, and the vendor notes of every saved day,
 * oldest first: an Action required row an earlier week opened takes its text from its note.
 */
export function loadWeek(today: WeekDay, dir = DIGESTS_DIR): { days: WeekDay[]; vendorNotes: Candidate[] } {
  const earlier = Array.from({ length: 6 }, (_, i) => readDay(dir, daysBefore(today.date, 6 - i)));
  const saved = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => DAY_FOLDER.test(name) && name < today.date)
        .sort()
    : [];
  const isNote = (c: Candidate) => c.kind === "vendor-note";
  return {
    days: [...earlier, today],
    vendorNotes: [
      ...saved.flatMap((date) => readCandidates(dir, date).filter(isNote)),
      ...today.candidates.filter(isNote),
    ],
  };
}

/** A release or an issue from the GitHub API; a failed call is logged, and the item keeps its saved text. */
export const fetchGitHubObject: GitHubFetch = (apiPath) =>
  githubGet<unknown>(`https://api.github.com/${apiPath}`).catch((err: unknown) => {
    console.error(`  [weekly] ${apiPath}: ${String(err).split("\n")[0]}`);
    return undefined;
  });
