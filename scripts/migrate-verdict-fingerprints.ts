/**
 * One-off migration (October 2026), for the move of the trending
 * classification cache onto judgeItems:
 *
 * - `digests/trending-classifications.json`: an entry held the decision
 *   (`name`, `category`, `standalone`, `desc`); it now holds Jev's answers, like
 *   the policy and data verdicts (`title`, `answers`, `fingerprint`). An entry
 *   without `desc` was a hand fix, never asked again: it becomes `pinned`.
 * - `digests/policy-verdicts.json`: a stage item's `stage` becomes `fingerprint`.
 *
 * Idempotent: a migrated entry is left as it is, so the script can run again on
 * files a run of the old code wrote meanwhile (e.g. after merging main).
 *
 * Usage: node --import tsx scripts/migrate-verdict-fingerprints.ts
 */

import { pathToFileURL } from "node:url";
import { loadItemsFile, saveItemsFile, type VerdictEntry } from "../src/jev.ts";
import { CLASSIFY_FILE, type ClassifyAnswers } from "../src/trending-jev.ts";
import { POLICY_VERDICTS_FILE } from "../src/policy-jev.ts";

/** A `trending-classifications.json` entry before the migration. */
interface OldClassifyEntry {
  name: string;
  category: string;
  standalone: number | null;
  desc?: string;
  decided?: string;
  model?: string;
  lastSeen: string;
}

type Entry = Record<string, unknown>;

export function migrateClassifyEntry(e: Entry): VerdictEntry<ClassifyAnswers> {
  if ("answers" in e) return e as unknown as VerdictEntry<ClassifyAnswers>;
  const { name, category, standalone, desc, ...rest } = e as unknown as OldClassifyEntry;
  return {
    title: name,
    ...(desc !== undefined ? { fingerprint: desc } : { pinned: true }),
    answers: { category: { choice: category }, standalone_tool: { noul: standalone } },
    // decided, model, lastSeen
    ...rest,
  };
}

export function migratePolicyEntry(e: Entry): Entry {
  if (!("stage" in e)) return e;
  const { stage, ...rest } = e;
  return { ...rest, fingerprint: stage };
}

function migrateFile(file: string, migrate: (e: Entry) => unknown): void {
  const cache = loadItemsFile<Entry>(file, "migrate");
  if (!cache) throw new Error(`Cannot read ${file}`);
  const items = Object.fromEntries(Object.entries(cache.items).map(([k, e]) => [k, migrate(e)]));
  saveItemsFile({ items }, file);
  console.log(`Migrated ${Object.keys(items).length} entries in ${file}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrateFile(CLASSIFY_FILE, migrateClassifyEntry);
  migrateFile(POLICY_VERDICTS_FILE, migratePolicyEntry);
}
