/**
 * Scope and category policy for the weekly trending report.
 *
 * Every candidate item — a GitHub row, an OpenRouter app, an npm package — gets
 * a `Classification`. Today it comes from `fallbackClassification`, which reads
 * the GitHub topic query that found a repo; Jev answers replace it once wired
 * in. The policy functions (`inScope`, `onRadar`) are the same either way.
 */

import type { Category, GithubRow } from "./trending-rank.ts";
import type { OpenRouterApp } from "./openrouter.ts";
import type { NpmPackage } from "./npm.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Classification {
  /** null = in scope, category unknown (fallback for Radar-only sources, whose category is never shown). */
  category: Category | "out_of_scope" | null;
  /** standalone_tool noul (is it an agent itself, not a plugin/extension/MCP server/proxy?); null = unknown. */
  standalone: number | null;
}

/** One item to classify; `key` is the item key used in `RadarRow.keys` and `GithubRow.key`. */
export type ClassifyItem = { key: string } & (
  | { kind: "github"; row: GithubRow }
  | { kind: "openrouter"; app: OpenRouterApp }
  | { kind: "npm"; pkg: NpmPackage }
);

// ---------------------------------------------------------------------------
// Policy
// ---------------------------------------------------------------------------

/**
 * The Radar is for agents themselves. A noul is a probability, so 0.5 is the
 * point where "it is the agent" becomes more likely than "it plugs into one";
 * plugins, MCP servers and proxies still reach the category tables.
 */
export const STANDALONE_MIN_NOUL = 0.5;

export function inScope(c: Classification): boolean {
  return c.category !== "out_of_scope";
}

/** Unknown standalone-ness keeps an item on the Radar: the fallback cannot tell, and dropping would empty it. */
export function onRadar(c: Classification): boolean {
  return inScope(c) && (c.standalone === null || c.standalone >= STANDALONE_MIN_NOUL);
}

// ---------------------------------------------------------------------------
// Topic-label fallback
// ---------------------------------------------------------------------------

/**
 * Search-query label → category. The labels are the `SEARCH_QUERIES` and
 * `NEW_REPO_QUERIES` labels in `trending.ts`; each topic was chosen for one
 * kind of project, so the label is a fair first guess at the category. A label
 * missing here (a query added later) reads as out of scope until it is mapped.
 */
const TOPIC_CATEGORIES: Record<string, Category> = {
  harness: "harness_framework",
  "agent-harness": "harness_framework",
  "new:harness": "harness_framework",
  "ai-coding": "coding_agent",
  "new:coding-agent": "coding_agent",
  "new:agentic-coding": "coding_agent",
  "multi-agent": "multi_agent",
  "agent-orchestration": "multi_agent",
  "ai-agent": "other_agent",
};

/** Deterministic classification from what the fetch already knows, used when Jev is unavailable. */
export function fallbackClassification(item: ClassifyItem): Classification {
  if (item.kind === "github") {
    // No topic = found only on the trending page. The weekly trending page is
    // mostly not about agents, and nothing else vouches for the repo.
    const topic = item.row.topic;
    const category = topic !== undefined ? (TOPIC_CATEGORIES[topic] ?? "out_of_scope") : "out_of_scope";
    // standalone unknown, so `new:*` repos stay on the Radar.
    return { category, standalone: null };
  }
  // OpenRouter's agent categories and the npm coding-agent keywords already
  // pre-filter these sources; their category is never shown.
  return { category: null, standalone: null };
}
