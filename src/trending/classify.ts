/**
 * Scope and category policy for the weekly trending report.
 *
 * Every candidate item — a GitHub row, an OpenRouter app, an npm package — gets
 * a `Classification`: from Jev (`classifyTrendingItems`, through `judgeItems`) when `TYPESAFE_API_KEY` is set,
 * else from `fallbackClassification`, which reads the GitHub topic query that
 * found a repo. The policy functions (`inScope`, `onRadar`) are the same either
 * way. Jev's verdicts are saved in `digests/trending-verdicts.json`, so
 * each item is asked once.
 */

import { createHash } from "node:crypto";
import path from "node:path";
import { judgeItems, loadItemsFile, saveItemsFile, type AskJev, type VerdictCache } from "../core/jev.ts";
import type { Category, GithubRow } from "./rank.ts";
import type { SearchTopic } from "./trending.ts";
import type { OpenRouterApp } from "../sources/openrouter.ts";
import type { NpmPackage } from "./npm.ts";
import { normKey, type MatchTrace } from "./match.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Classification {
  /** null = in scope, category unknown (fallback for Radar-only sources, whose category is never shown). */
  category: Category | "out_of_scope" | null;
  /** standalone_tool noul (is it an agent itself, not a plugin/extension/MCP server/proxy?); null = unknown. */
  standalone: number | null;
  /** Jev only, for the trace: the category choice's probabilities. */
  probabilities?: Record<string, number>;
  /** Jev only: the versioned model that answered. */
  model?: string;
  /** Saved verdicts only: the CST date Jev decided it, or "by hand". */
  decided?: string;
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
 * Search topic → category, for every `SEARCH_TOPICS` entry in `trending.ts`
 * (tsc checks both ways); each topic was chosen for one kind of project, so it
 * is a fair first guess at the category. Typed by string for the lookup: a
 * test row can carry any topic, which reads as out of scope.
 */
const TOPIC_CATEGORIES: Record<string, Category> = {
  "coding-agent": "coding_agent",
  "agentic-coding": "coding_agent",
  "ai-coding": "coding_agent",
  "agent-harness": "harness_framework",
  harness: "harness_framework",
  "agent-orchestration": "multi_agent",
} satisfies Record<SearchTopic, Category>;

/** Deterministic classification from what the fetch already knows, used when Jev is unavailable. */
export function fallbackClassification(item: ClassifyItem): Classification {
  if (item.kind === "github") {
    // No topic = found only on the trending page. The weekly trending page is
    // mostly not about agents, and nothing else vouches for the repo.
    const topic = item.row.topic;
    const category = topic !== undefined ? (TOPIC_CATEGORIES[topic] ?? "out_of_scope") : "out_of_scope";
    // standalone unknown, so new repos from a topic search stay on the Radar.
    return { category, standalone: null };
  }
  // OpenRouter's agent categories and the npm coding-agent keywords already
  // pre-filter these sources; their category is never shown.
  return { category: null, standalone: null };
}

// ---------------------------------------------------------------------------
// Jev classification
// ---------------------------------------------------------------------------

/** One request per item, both questions together. */
const CLASSIFY_QUESTIONS = {
  category: {
    type: "choice",
    instructions:
      "Which kind of project is the item described by `name` and `description` (and `topic` when present)?",
    criteria: {
      coding_agent: {
        what: "An agent that writes code",
        examples: ["a CLI coding agent", "an IDE coding agent", "a cloud coding agent"],
      },
      harness_framework: {
        what: "A harness, SDK, framework or runtime for building agents",
        examples: ["an agent SDK", "an agent harness", "an agent runtime"],
      },
      multi_agent: {
        what: "A system that runs and coordinates many agents",
        examples: ["an agent swarm", "a supervisor agent", "a multi-agent orchestrator"],
      },
      agent_tooling: {
        what: "Tooling built for agents",
        examples: [
          "agent memory",
          "context management",
          "skills",
          "an MCP server",
          "a sandbox",
          "a token or cost tool",
        ],
      },
      other_agent: {
        what: "Any other agent",
        examples: ["a personal assistant", "a research agent", "a browser agent", "a vertical agent"],
      },
      // The no-match outcome the Jev docs recommend. General AI/ML counts only
      // when it is built specifically for agents.
      out_of_scope: {
        what: "Not an agent or tooling built for agents",
        examples: [
          "model weights",
          "training or fine-tuning",
          "an inference engine",
          "a RAG pipeline",
          "a vector database",
          "a chat frontend",
          "a project unrelated to AI",
          "an awesome-list or tutorial",
        ],
      },
    },
  },
  // Gates the Radar only (`onRadar`); plugins still reach the category tables.
  standalone_tool: {
    type: "noul",
    instructions:
      "Is the item itself an agent or agentic coding tool, rather than a plugin, extension, MCP server, skill, proxy or router for one?",
    criteria: {
      true: {
        what: "The agent or tool a user runs",
        examples: ["a CLI coding agent", "an IDE agent", "a personal agent", "an agent harness"],
      },
      false: {
        what: "Something that plugs into or sits in front of an agent",
        examples: ["a plugin", "an extension", "an MCP server", "a skill", "a proxy or router"],
      },
    },
  },
};

/** Jev's raw answers, as saved. A migrated or hand-added entry may lack the probabilities, or the noul (null). */
export interface ClassifyAnswers {
  category: { choice: string; confidence?: number; probabilities?: Record<string, number> };
  standalone_tool: { noul: number | null };
}

const SOURCE_NAMES: Record<ClassifyItem["kind"], string> = {
  github: "GitHub repository",
  openrouter: "OpenRouter app",
  npm: "npm package",
};

/** The name and description Jev reads. */
function itemText(item: ClassifyItem): [name: string, description: string] {
  return item.kind === "github"
    ? [item.row.fullName, item.row.description]
    : item.kind === "openrouter"
      ? [item.app.title, item.app.description]
      : [item.pkg.name, item.pkg.description];
}

/**
 * Only what the questions read: unused state costs accuracy (see `scorePaper`),
 * so no language and no URL. An empty description is omitted rather than sent
 * as "".
 */
function classifyState(item: ClassifyItem): object {
  const [name, description] = itemText(item);
  const topic = item.kind === "github" ? item.row.topic : undefined;
  return {
    name,
    ...(description ? { description } : {}),
    source: SOURCE_NAMES[item.kind],
    ...(topic ? { topic } : {}),
  };
}

/**
 * Answers → scope and category. Throws rather than guess on an unexpected
 * shape: a new call then counts as failed (a changed response shape trips the
 * fallback instead of classifying everything wrong), and a saved entry with a
 * typo is asked again rather than shown under an unknown category.
 */
export function classificationOf(answers: ClassifyAnswers): Classification {
  const choice = answers?.category?.choice;
  const standalone = answers?.standalone_tool?.noul;
  if (
    typeof choice !== "string" ||
    !Object.hasOwn(CLASSIFY_QUESTIONS.category.criteria, choice) ||
    (standalone !== null && !Number.isFinite(standalone))
  ) {
    throw new Error(`Unexpected Jev answers: ${JSON.stringify(answers)}`);
  }
  const probabilities = answers.category.probabilities;
  return {
    category: choice as Classification["category"],
    standalone: standalone ?? null,
    ...(probabilities ? { probabilities } : {}),
  };
}

/**
 * OpenRouter's own app tags that settle scope, so these apps skip Jev. Most
 * tagged apps have no description, and on 2026-10-07 Jev, reading a bare name,
 * put 14 of 37 tagged apps out of scope (goose, Crush, Command Code among them)
 * and scored Roo Code 0.15 as standalone. `programming-app` and
 * `native-app-builder` are left to Jev: they also tag gateways (Portkey) and
 * game engines (GDevelop). Untagged apps are on the list only for being new or
 * trending (`selectAgentApps`), and need judging too.
 */
const AGENT_APP_TAGS = new Set(["cli-agent", "ide-extension", "cloud-agent", "personal-agent"]);

/** An OpenRouter app OpenRouter itself tags as an agent: in scope and on the Radar without Jev. */
export function isTaggedAgentApp(item: ClassifyItem): boolean {
  return item.kind === "openrouter" && item.app.categories.some((c) => AGENT_APP_TAGS.has(c));
}

/**
 * Every item's classification, by item key. Tagged apps by their tag (in
 * scope, standalone unknown); the rest through `judgeItems`: a saved verdict
 * at the same description (`descHash`) or pinned, else Jev, else the topic
 * fallback (a failed call falls back for that item only).
 * `classifiedBy` is "topics" when there was no key or more than half the new
 * calls failed, with items left to ask.
 */
export async function classifyTrendingItems(
  items: ClassifyItem[],
  opts: { apiKey?: string; cache: TrendingVerdicts | null; dateStr: string; ask?: AskJev },
): Promise<{
  classifications: Map<string, Classification>;
  classifiedBy: "jev" | "topics";
  nextCache: TrendingVerdicts | null;
}> {
  const judgment = await judgeItems(
    items
      .filter((item) => !isTaggedAgentApp(item))
      .map((item) => ({ id: normKey(item.key), title: itemText(item)[0], item })),
    {
      ...opts,
      tag: "trending",
      request: ({ item }) => ({ state: classifyState(item), questions: CLASSIFY_QUESTIONS }),
      decide: (a: ClassifyAnswers) => classificationOf(a),
      fingerprint: ({ item }) => descHash(item),
      unseenDays: CLASSIFY_UNSEEN_DAYS,
    },
  );
  const classifications = new Map(
    items.map((item): [string, Classification] => {
      const v = isTaggedAgentApp(item) ? undefined : judgment.verdicts.get(normKey(item.key));
      if (!v) return [item.key, fallbackClassification(item)];
      // Built, not spread: the verdict also carries its raw answers.
      const { category, standalone, probabilities, model, decided } = v;
      return [
        item.key,
        {
          category,
          standalone,
          ...(probabilities ? { probabilities } : {}),
          ...(model ? { model } : {}),
          ...(decided ? { decided } : {}),
        },
      ];
    }),
  );
  const saved = [...classifications.values()].filter((c) => c.decided).length;
  const classifiedBy = judgment.rankedBy === "jev" ? "jev" : "topics";
  console.log(
    `  [trending] Classified ${classifications.size} items: ${saved} saved, the rest ` +
      (classifiedBy === "jev"
        ? "by Jev"
        : `by topic labels (fallback: ${opts.apiKey ? "too many Jev failures" : "no TYPESAFE_API_KEY"})`),
  );
  return { classifications, classifiedBy, nextCache: judgment.nextCache };
}

// ---------------------------------------------------------------------------
// Trending verdicts, digests/trending-verdicts.json
// ---------------------------------------------------------------------------

/**
 * `digests/trending-verdicts.json`: Jev's answers per item key (GitHub
 * keys lowercased, `normKey`), so each item is asked once instead of every
 * week: a project's scope does not change while its description stays the
 * same. The entry's `fingerprint` is the hash of the description Jev read, so
 * a changed description is asked again (a new repo first seen with an empty or
 * placeholder description would otherwise stay out of scope); `pinned` keeps a
 * hand fix. Hand-editable; see AGENTS.md.
 */
export type TrendingVerdicts = VerdictCache<ClassifyAnswers>;

export const TRENDING_VERDICTS_FILE = path.join("digests", "trending-verdicts.json");
/** An item off every list this long is dropped, which keeps the file bounded; if it returns, it costs one call. */
export const CLASSIFY_UNSEEN_DAYS = 180;

/**
 * Letters and digits only: the trending page scrape keeps HTML entities and
 * line breaks the search API does not, and a repo moving between the two
 * must not count as a changed description.
 */
const descHash = (item: ClassifyItem): string =>
  createHash("sha1")
    .update(
      itemText(item)[1]
        .replace(/&#?\w+;/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ""),
    )
    .digest("hex")
    .slice(0, 8);

/** Missing file → empty cache. Unreadable or malformed → null: every item is asked and nothing is saved. */
export function loadTrendingVerdicts(file = TRENDING_VERDICTS_FILE): TrendingVerdicts | null {
  return loadItemsFile(file, "trending");
}

/** One item per line, like the star history: ~200 items a week would make a pretty-printed file long. */
export function saveTrendingVerdicts(cache: TrendingVerdicts, file = TRENDING_VERDICTS_FILE): void {
  saveItemsFile(cache, file);
}

// ---------------------------------------------------------------------------
// Trace
// ---------------------------------------------------------------------------

/**
 * `digests/YYYY-MM-DD/trending-trace.json`, one item per line, like
 * `arxiv-trace.json`. Every classified item, not a top slice: a misclassified
 * out-of-scope repo is the main thing to trace, and it never reaches the report.
 */
export function buildTrendingTraceFile(
  items: ClassifyItem[],
  classifications: Map<string, Classification>,
  classifiedBy: "jev" | "topics",
  matches: MatchTrace[],
  matchModels: string[] = [],
): string {
  const round = (n: number): number => Math.round(n * 1000) / 1000;
  const roundAll = (p: Record<string, number> | undefined) =>
    p && Object.fromEntries(Object.entries(p).map(([k, v]) => [k, round(v)]));
  const itemLines = items.map((item) => {
    const c = classifications.get(item.key);
    const [name] = itemText(item);
    const row = item.kind === "github" ? item.row : null;
    return JSON.stringify({
      key: item.key,
      name,
      category: c?.category ?? null,
      probabilities: roundAll(c?.probabilities),
      standalone: c?.standalone == null ? null : round(c.standalone),
      gain: row?.gain ?? null,
      gainFrom: row?.gainFrom ?? null,
      relative: row?.relative == null ? null : round(row.relative),
      // A saved verdict shows the probabilities it was saved with (none on a migrated or hand-added entry).
      ...(c?.decided ? { decided: c.decided } : {}),
    });
  });
  const matchLines = matches.map((m) => JSON.stringify({ ...m, probabilities: roundAll(m.probabilities) }));
  const models = [
    ...new Set([...[...classifications.values()].flatMap((c) => (c.model ? [c.model] : [])), ...matchModels]),
  ];
  return (
    `{\n"models": ${JSON.stringify(models)},\n"classifiedBy": ${JSON.stringify(classifiedBy)},\n` +
    `"items": [\n${itemLines.join(",\n")}\n],\n"matches": [\n${matchLines.join(",\n")}\n]\n}\n`
  );
}
