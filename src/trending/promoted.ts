/**
 * Trending repos promoted into the daily agents report. The weekly trending
 * run records which GitHub repos made its category tables; each daily run until
 * the next weekly one tracks them next to `agents.repos` and `infra.repos` in
 * `config.yml`, so the report follows what is moving, not only a hand-kept list.
 * Pure functions — the record lives in `digests/trending-state.json`.
 */

import type { RepoConfig } from "../core/github.ts";
import type { AgentSectionKey } from "../core/config.ts";
import type { Category, StarHistory, TrendingReportData } from "./rank.ts";

/** The weekly report's category-table repos, in table order: [fullName, category]. */
export interface PromotedRecord {
  /** CST date of the weekly report they come from. */
  date: string;
  repos: [string, Category][];
}

/**
 * Agents-report section per trending category; harnesses, orchestration and
 * tooling are the infra section's agent tooling. `other_agent` is left out: on
 * 2026-10-19 its rows included a job-search bot and a vulnerability scanner,
 * not coding agents or assistants.
 */
const SECTION_OF: Partial<Record<Category, AgentSectionKey>> = {
  coding_agent: "agents",
  harness_framework: "infra",
  multi_agent: "infra",
  agent_tooling: "infra",
};

/**
 * Promoted repos per section. Each costs a release fetch and a hot-issue search
 * (~2 s at `searchSlot`'s spacing), and a quiet one only a name in the quiet line.
 */
export const PROMOTED_PER_SECTION = 5;

/**
 * A record older than this is ignored: one missed Monday keeps last week's
 * repos, two drop them rather than track a stale week indefinitely.
 */
const PROMOTED_MAX_AGE_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The category-table rows of a weekly report (`MIN_STARS` or more, like every
 * GitHub row in it). Not the Radar: its GitHub rows are repos created this
 * fortnight, and its other rows have no repo.
 */
export function promotedRecord(
  report: Pick<TrendingReportData, "categories">,
  dateStr: string,
): PromotedRecord {
  return {
    date: dateStr,
    repos: report.categories.flatMap((c) => c.rows.map((r): [string, Category] => [r.fullName, c.category])),
  };
}

/**
 * The repos to track today per section: the latest record's, minus any repo
 * already tracked (case-insensitive), taken round-robin over the section's
 * categories in table order (each table is ordered by gain), at most
 * PROMOTED_PER_SECTION. News matches only the full `owner/repo` (`keywords`):
 * names such as "plugins" or "rea" are ordinary words.
 */
export function promotedRepos(
  history: Pick<StarHistory, "promoted">,
  dateStr: string,
  tracked: RepoConfig[],
): Record<AgentSectionKey, RepoConfig[]> {
  const out: Record<AgentSectionKey, RepoConfig[]> = { agents: [], infra: [] };
  const record = history.promoted;
  if (!record) return out;
  const age = Math.round((Date.parse(dateStr) - Date.parse(record.date)) / DAY_MS);
  if (!(age >= 0 && age <= PROMOTED_MAX_AGE_DAYS)) return out;

  const seen = new Set(tracked.map((r) => r.repo.toLowerCase()));
  for (const section of Object.keys(out) as AgentSectionKey[]) {
    const queues = new Map<Category, string[]>();
    for (const [fullName, category] of record.repos) {
      if (SECTION_OF[category] !== section) continue;
      queues.set(category, [...(queues.get(category) ?? []), fullName]);
    }
    const lists = [...queues.values()];
    for (let i = 0; out[section].length < PROMOTED_PER_SECTION && lists.some((l) => i < l.length); i++) {
      for (const list of lists) {
        const fullName = list[i];
        if (fullName === undefined || seen.has(fullName.toLowerCase())) continue;
        if (out[section].length >= PROMOTED_PER_SECTION) break;
        seen.add(fullName.toLowerCase());
        out[section].push({
          id: `trending-${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          repo: fullName,
          // The full path, so a promoted project reads apart from the curated ones.
          name: fullName,
          keywords: [fullName],
        });
      }
    }
  }
  return out;
}
