/**
 * Scope and category policy for the weekly trending report.
 *
 * Every candidate item — a GitHub row, an OpenRouter app, an npm package — gets
 * a `Classification`: from Jev (`classifyItems`) when `TYPESAFE_API_KEY` is set,
 * else from `fallbackClassification`, which reads the GitHub topic query that
 * found a repo. The policy functions (`inScope`, `onRadar`) are the same either
 * way. Jev's verdicts are saved in `digests/trending-classifications.json`, so
 * each item is asked once. Jev also matches OpenRouter apps to npm/GitHub rows
 * that URL merging missed; those decisions are saved in `digests/trending-matches.json`.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { askJev, jevFailedTooOften, mapJev } from "./jev.ts";
import type { Category, GithubRow, RadarRow } from "./trending-rank.ts";
import type { SearchTopic } from "./trending.ts";
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

/**
 * `askJev` without the type parameter, so tests can inject a stub that returns
 * fixed answers. Callers check the answer shape themselves.
 */
export type AskJev = (
  state: unknown,
  questions: object,
  apiKey: string,
) => Promise<{ model: string; answers: unknown }>;

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

interface ChoiceAnswer {
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface ClassifyAnswers {
  category: ChoiceAnswer;
  standalone_tool: { noul: number };
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

export async function classifyItem(
  item: ClassifyItem,
  apiKey: string,
  ask: AskJev = askJev,
): Promise<Classification> {
  const { model, answers } = await ask(classifyState(item), CLASSIFY_QUESTIONS, apiKey);
  const a = answers as ClassifyAnswers;
  const choice = a?.category?.choice;
  const standalone = a?.standalone_tool?.noul;
  // Throw rather than guess: mapJev counts it as a failure, so a changed
  // response shape trips the fallback instead of classifying everything wrong.
  if (
    typeof choice !== "string" ||
    !Object.hasOwn(CLASSIFY_QUESTIONS.category.criteria, choice) ||
    !Number.isFinite(standalone)
  ) {
    throw new Error(`Unexpected Jev answers: ${JSON.stringify(answers)}`);
  }
  return {
    category: choice as Classification["category"],
    standalone,
    probabilities: a.category.probabilities,
    model,
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

/** Jev classification by item key; null when too many calls failed for the answers to mean anything. */
export async function classifyItems(
  items: ClassifyItem[],
  apiKey: string,
  ask: AskJev = askJev,
): Promise<Map<string, Classification> | null> {
  const asked = items.filter((item) => !isTaggedAgentApp(item));
  const { results, failed } = await mapJev(asked, (item) => classifyItem(item, apiKey, ask), "trending");
  if (jevFailedTooOften(failed, asked.length)) return null;
  const byKey = new Map(asked.map((item, i) => [item.key, results[i]]));
  // Tagged apps get the fallback's verdict: in scope, standalone unknown. A
  // single failed call also falls back for that item only: it should neither
  // drop the item (unclassified = off the Radar) nor send the whole run to the fallback.
  return new Map(items.map((item) => [item.key, byKey.get(item.key) ?? fallbackClassification(item)]));
}

// ---------------------------------------------------------------------------
// Cross-source matching, cached in digests/trending-matches.json
// ---------------------------------------------------------------------------

/** `digests/trending-matches.json`. Hand-editable; see the design doc. */
export interface MatchState {
  /** Key: OpenRouter appId as a string. */
  apps: Record<string, MatchEntry>;
}

export interface MatchEntry {
  /** For readers only. */
  title: string;
  /** Matched package name (bare, no "npm:"). */
  npm?: string;
  /** Matched owner/repo (bare, no "github:"). */
  github?: string;
  /** Candidate keys: "npm:<name>", "github:<owner/repo>". */
  rejected: string[];
  /** CST date this app was last in the Radar pool. */
  lastSeen: string;
  /** CST date of the last saved match. */
  decided?: string;
  /** Jev model that made it. */
  model?: string;
}

export interface Candidate {
  key: string;
  name: string;
  description: string;
  url: string;
}

type MatchSource = "npm" | "github";
const MATCH_SOURCES: MatchSource[] = ["npm", "github"];

/** One line of the trace's `matches` list. */
export interface MatchTrace {
  app: string;
  title: string;
  source: MatchSource;
  offered?: string[];
  choice: string;
  probabilities?: Record<string, number>;
  /** "cached" = a match saved by an earlier run that linked rows this run. */
  result: "matched" | "rejected" | "cached";
}

export const MATCH_FILE = path.join("digests", "trending-matches.json");
/** Tuned later on the trace; a low-confidence guess must never merge two tools. */
export const MATCH_MIN_PROBABILITY = 0.8;
/** An app off the pool this long is dropped, so the file does not keep every app ever ranked. */
export const MATCH_UNSEEN_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;
const OPENROUTER_PREFIX = "openrouter:";

/** GitHub names are case-insensitive: the trending page and the file may differ in case. */
const normKey = (key: string) => (key.startsWith("github:") ? key.toLowerCase() : key);
const sourceOf = (key: string): MatchSource | null =>
  key.startsWith("npm:") ? "npm" : key.startsWith("github:") ? "github" : null;
const appIdOf = (appKey: string) => appKey.slice(OPENROUTER_PREFIX.length);

/** Missing file → empty state. Unreadable or malformed → null: the run skips matching and saves nothing. */
export function loadMatchState(file = MATCH_FILE): MatchState | null {
  if (!fs.existsSync(file)) return { apps: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<MatchState> | null;
    if (typeof parsed?.apps !== "object" || parsed.apps === null || Array.isArray(parsed.apps)) {
      throw new Error("no `apps` object");
    }
    return parsed as MatchState;
  } catch (err) {
    // Never fall back to an empty state here: it would be saved after the report,
    // overwriting a hand-edited file that only has a typo.
    console.error(`  [trending/match] Cannot read ${file}, matching skipped: ${err}`);
    return null;
  }
}

export function saveMatchState(state: MatchState, file = MATCH_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/** Saved match keys of every app except `exceptAppId`, normalized. */
function takenKeys(state: MatchState, exceptAppId: string): Set<string> {
  return new Set(
    Object.entries(state.apps)
      .filter(([id]) => id !== exceptAppId)
      .flatMap(([, e]) => MATCH_SOURCES.flatMap((s) => (e[s] ? [normKey(`${s}:${e[s]}`)] : []))),
  );
}

/**
 * The candidates Jev still has to judge for one app, per source. `rows` are the
 * url-merged pool rows; `members` maps every pool key to its pre-merge row, for
 * the candidate's name, description and url.
 */
export function pendingMatchQuestions(
  appKey: string,
  rows: RadarRow[],
  state: MatchState,
  members: Map<string, RadarRow>,
): Record<MatchSource, Candidate[]> {
  const appId = appIdOf(appKey);
  const entry = state.apps[appId];
  const own = rows.find((r) => r.keys.includes(appKey));
  // `rejected ?? []`: a hand-added entry may carry only a forced match.
  const rejected = new Set((entry?.rejected ?? []).map(normKey));
  // One tool, one app: a key saved as another app's match is never offered.
  const taken = takenKeys(state, appId);
  const pending = (source: MatchSource): Candidate[] => {
    // A saved match (even one not in this pool) or a URL-merged member settles the source.
    if (entry?.[source] !== undefined || own?.keys.some((k) => sourceOf(k) === source)) return [];
    return rows
      .filter((r) => !r.keys.some((k) => k.startsWith(OPENROUTER_PREFIX)))
      .flatMap((r) => r.keys)
      .filter((k) => sourceOf(k) === source && !rejected.has(normKey(k)) && !taken.has(normKey(k)))
      .map((key) => {
        const m = members.get(key);
        return { key, name: m?.name ?? key, description: m?.description ?? "", url: m?.url ?? "" };
      });
  };
  return { npm: pending("npm"), github: pending("github") };
}

const SOURCE_LABELS: Record<MatchSource, string> = { npm: "npm package", github: "GitHub repository" };

/** Only questions with candidates. The candidates are the options: Jev reads option descriptions. */
function matchQuestions(pending: Record<MatchSource, Candidate[]>): Record<string, object> {
  return Object.fromEntries(
    MATCH_SOURCES.filter((s) => pending[s].length > 0).map((s) => [
      `${s}_match`,
      {
        type: "choice",
        instructions: `Which ${SOURCE_LABELS[s]} is the same product as the OpenRouter app in \`app\`?`,
        criteria: {
          ...Object.fromEntries(
            pending[s].map((c) => [
              c.key,
              {
                name: c.name,
                ...(c.description ? { description: c.description } : {}),
                ...(c.url ? { url: c.url } : {}),
              },
            ]),
          ),
          none: "None of these is the same product as the app",
        },
      },
    ]),
  );
}

type MatchAnswers = Partial<Record<`${MatchSource}_match`, ChoiceAnswer>>;

/**
 * Fold one app's match answers into the state; pure. A confident pick is saved
 * unless the source already has a match (a hand-set one is never overwritten)
 * or another app already holds it (one tool, one app — two apps asked in the
 * same run can pick the same candidate). Otherwise every offered candidate is
 * rejected, an uncertain pick included, so no pair is asked twice.
 */
export function applyMatchAnswers(
  state: MatchState,
  appKey: string,
  title: string,
  asked: Partial<Record<MatchSource, string[]>>,
  answers: MatchAnswers,
  model: string,
  dateStr: string,
): MatchState {
  const appId = appIdOf(appKey);
  const prev = state.apps[appId];
  const entry: MatchEntry = { title, lastSeen: dateStr, ...prev, rejected: [...(prev?.rejected ?? [])] };
  const taken = takenKeys(state, appId);
  for (const source of MATCH_SOURCES) {
    const offered = asked[source];
    if (!offered) continue;
    const answer = answers[`${source}_match`];
    const pick = answer?.choice;
    if (
      pick !== undefined &&
      pick !== "none" &&
      (answer?.probabilities?.[pick] ?? 0) >= MATCH_MIN_PROBABILITY &&
      entry[source] === undefined &&
      !taken.has(normKey(pick))
    ) {
      entry[source] = pick.slice(source.length + 1);
      entry.decided = dateStr;
      entry.model = model;
    } else {
      const known = new Set(entry.rejected.map(normKey));
      entry.rejected.push(...offered.filter((k) => !known.has(normKey(k))));
    }
  }
  return { apps: { ...state.apps, [appId]: entry } };
}

/**
 * Mark pool apps seen, drop `rejected` keys outside this run's pool (a returning
 * candidate is asked again, which keeps the file bounded), and drop apps unseen
 * for MATCH_UNSEEN_DAYS. Saved matches are otherwise kept.
 */
export function pruneMatchState(state: MatchState, poolKeys: Set<string>, dateStr: string): MatchState {
  const pool = new Set([...poolKeys].map(normKey));
  const apps: Record<string, MatchEntry> = {};
  for (const [id, e] of Object.entries(state.apps)) {
    const lastSeen = pool.has(`${OPENROUTER_PREFIX}${id}`) ? dateStr : e.lastSeen;
    if ((Date.parse(dateStr) - Date.parse(lastSeen)) / DAY_MS > MATCH_UNSEEN_DAYS) continue;
    apps[id] = { ...e, lastSeen, rejected: (e.rejected ?? []).filter((k) => pool.has(normKey(k))) };
  }
  return { apps };
}

/** A link per pool app with a saved match in the pool, naming the pool's own key (its casing). */
export function matchLinks(rows: RadarRow[], state: MatchState): [string, string][] {
  const poolKeys = new Map(rows.flatMap((r) => r.keys).map((k) => [normKey(k), k]));
  const links: [string, string][] = [];
  for (const [id, e] of Object.entries(state.apps)) {
    const appKey = `${OPENROUTER_PREFIX}${id}`;
    if (!poolKeys.has(appKey)) continue;
    for (const source of MATCH_SOURCES) {
      const member = e[source] ? poolKeys.get(normKey(`${source}:${e[source]}`)) : undefined;
      if (member) links.push([appKey, member]);
    }
  }
  return links;
}

/** Throws unless every asked question has a choice among its options, so mapJev counts it as failed. */
function checkMatchAnswers(answers: unknown, asked: Partial<Record<MatchSource, string[]>>): MatchAnswers {
  const a = answers as MatchAnswers;
  for (const source of MATCH_SOURCES) {
    const offered = asked[source];
    if (!offered) continue;
    const answer = a?.[`${source}_match`];
    if (
      typeof answer?.choice !== "string" ||
      (answer.choice !== "none" && !offered.includes(answer.choice)) ||
      typeof answer.probabilities !== "object"
    ) {
      throw new Error(`Unexpected Jev answers: ${JSON.stringify(answers)}`);
    }
  }
  return a;
}

/**
 * Match this run's pool: ask Jev about pending candidates (with a key), fold
 * the answers in, prune, and link. `rows` are the url-merged `pool`. A failed
 * call records nothing, so the pair is asked again next run; there is no
 * failure-ratio fallback because saved matches stay valid either way.
 */
export async function matchApps(
  rows: RadarRow[],
  pool: RadarRow[],
  state: MatchState,
  apiKey: string | undefined,
  dateStr: string,
  ask: AskJev = askJev,
): Promise<{
  state: MatchState;
  links: [string, string][];
  trace: MatchTrace[];
  models: string[];
  called: boolean;
}> {
  const members = new Map(pool.map((r) => [r.keys[0]!, r]));
  const title = (appKey: string) => members.get(appKey)?.name ?? appKey;
  const trace: MatchTrace[] = [];
  const models = new Set<string>();
  let next = state;

  const apps = apiKey
    ? pool
        .map((r) => r.keys[0]!)
        .filter((k) => k.startsWith(OPENROUTER_PREFIX))
        .map((appKey) => ({ appKey, pending: pendingMatchQuestions(appKey, rows, state, members) }))
        .filter((a) => a.pending.npm.length + a.pending.github.length > 0)
    : [];
  if (apiKey && apps.length > 0) {
    const { results } = await mapJev(
      apps,
      async ({ appKey, pending }) => {
        const app = members.get(appKey)!;
        const asked = Object.fromEntries(
          MATCH_SOURCES.filter((s) => pending[s].length > 0).map((s) => [s, pending[s].map((c) => c.key)]),
        ) as Partial<Record<MatchSource, string[]>>;
        const { model, answers } = await ask(
          {
            app: {
              title: app.name,
              ...(app.description ? { description: app.description } : {}),
              ...(app.url ? { url: app.url } : {}),
            },
          },
          matchQuestions(pending),
          apiKey,
        );
        return { asked, model, answers: checkMatchAnswers(answers, asked) };
      },
      "trending/match",
    );
    // Folded in pool order, sequentially, so "one tool, one app" holds within the run.
    apps.forEach(({ appKey }, i) => {
      const r = results[i];
      if (!r) return;
      models.add(r.model);
      const before = next.apps[appIdOf(appKey)];
      next = applyMatchAnswers(next, appKey, title(appKey), r.asked, r.answers, r.model, dateStr);
      const after = next.apps[appIdOf(appKey)]!;
      for (const source of MATCH_SOURCES) {
        const answer = r.answers[`${source}_match`];
        if (!r.asked[source] || !answer) continue;
        trace.push({
          app: appKey,
          title: title(appKey),
          source,
          offered: r.asked[source],
          choice: answer.choice,
          probabilities: answer.probabilities,
          result: before?.[source] === undefined && after[source] !== undefined ? "matched" : "rejected",
        });
      }
    });
  }

  next = pruneMatchState(next, new Set(pool.flatMap((r) => r.keys)), dateStr);
  const links = matchLinks(rows, next);
  const matchedNow = new Set(trace.filter((t) => t.result === "matched").map((t) => `${t.app} ${t.source}`));
  for (const [app, member] of links) {
    const source = sourceOf(member)!;
    if (matchedNow.has(`${app} ${source}`)) continue;
    trace.push({ app, title: title(app), source, choice: member, result: "cached" });
  }
  return { state: next, links, trace, models: [...models], called: apps.length > 0 };
}

// ---------------------------------------------------------------------------
// Classification cache, digests/trending-classifications.json
// ---------------------------------------------------------------------------

/**
 * `digests/trending-classifications.json`: Jev's verdict per item, so each item
 * is asked once instead of every week. A project's scope does not change while
 * its description stays the same. Hand-editable; see AGENTS.md.
 */
export interface ClassifyCache {
  /** Key: the item key, GitHub keys lowercased (`normKey`). */
  items: Record<string, ClassifyEntry>;
}

export interface ClassifyEntry {
  /** For readers only. */
  name: string;
  category: Category | "out_of_scope";
  standalone: number | null;
  /**
   * Hash of the description Jev read. A changed description is asked again: a
   * new repo first seen with an empty or placeholder description would
   * otherwise stay out of scope. Absent = keep the verdict regardless (a hand fix).
   */
  desc?: string;
  /** CST date Jev answered; absent on a hand-added entry. */
  decided?: string;
  model?: string;
  /** CST date the item was last on one of the report's lists. */
  lastSeen: string;
}

export const CLASSIFY_FILE = path.join("digests", "trending-classifications.json");
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
export function loadClassifyCache(file = CLASSIFY_FILE): ClassifyCache | null {
  if (!fs.existsSync(file)) return { items: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<ClassifyCache> | null;
    if (typeof parsed?.items !== "object" || parsed.items === null || Array.isArray(parsed.items)) {
      throw new Error("no `items` object");
    }
    return parsed as ClassifyCache;
  } catch (err) {
    // As with the match file: an empty cache saved after the report would overwrite a hand edit.
    console.error(`  [trending] Cannot read ${file}, every item is asked: ${err}`);
    return null;
  }
}

/** One item per line, like the star history: ~200 items a week would make a pretty-printed file long. */
export function saveClassifyCache(cache: ClassifyCache, file = CLASSIFY_FILE): void {
  const lines = Object.entries(cache.items).map(
    ([key, e]) => `    ${JSON.stringify(key)}: ${JSON.stringify(e)}`,
  );
  const body = lines.length > 0 ? `{\n${lines.join(",\n")}\n  }` : "{}";
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `{\n  "items": ${body}\n}\n`, "utf-8");
}

/** The saved verdicts that still hold for `items`, by item key. */
export function cachedClassifications(
  cache: ClassifyCache,
  items: ClassifyItem[],
): Map<string, Classification> {
  const hits = new Map<string, Classification>();
  for (const item of items) {
    // The tags settle scope, so they beat a verdict saved before the app was tagged.
    if (isTaggedAgentApp(item)) continue;
    const e = cache.items[normKey(item.key)];
    if (!e || (e.desc !== undefined && e.desc !== descHash(item))) continue;
    // A hand edit with a typo is asked again rather than shown under an unknown category.
    if (
      !Object.hasOwn(CLASSIFY_QUESTIONS.category.criteria, e.category) ||
      (e.standalone !== null && !Number.isFinite(e.standalone))
    ) {
      console.error(`  [trending] Invalid saved classification for ${item.key}, asking again`);
      continue;
    }
    hits.set(item.key, {
      category: e.category,
      standalone: e.standalone,
      ...(e.model ? { model: e.model } : {}),
      decided: e.decided ?? "by hand",
    });
  }
  return hits;
}

/**
 * The cache after this run: Jev's new answers saved, every classified item
 * marked seen, items unseen for CLASSIFY_UNSEEN_DAYS dropped. A verdict without
 * a model (a tagged app, a failed call, the topic fallback) is never saved, so a
 * later run never reads a topic-label guess as Jev's.
 */
export function nextClassifyCache(
  cache: ClassifyCache,
  items: ClassifyItem[],
  classifications: Map<string, Classification>,
  dateStr: string,
): ClassifyCache {
  const next = { ...cache.items };
  for (const item of items) {
    const key = normKey(item.key);
    const c = classifications.get(item.key);
    if (c?.model !== undefined && c.decided === undefined && c.category !== null) {
      next[key] = {
        name: itemText(item)[0],
        category: c.category,
        standalone: c.standalone === null ? null : Math.round(c.standalone * 1000) / 1000,
        desc: descHash(item),
        decided: dateStr,
        model: c.model,
        lastSeen: dateStr,
      };
    } else if (next[key]) {
      // Spread, not rebuilt: a hand edit keeps its fields.
      next[key] = { ...next[key], lastSeen: dateStr };
    }
  }
  return {
    items: Object.fromEntries(
      Object.entries(next).filter(
        ([, e]) => (Date.parse(dateStr) - Date.parse(e.lastSeen)) / DAY_MS <= CLASSIFY_UNSEEN_DAYS,
      ),
    ),
  };
}

// ---------------------------------------------------------------------------
// Trace
// ---------------------------------------------------------------------------

/**
 * `digests/YYYY-MM-DD/trending-ranking.json`, one item per line, like
 * `arxiv-ranking.json`. Every classified item, not a top slice: a misclassified
 * out-of-scope repo is the main thing to trace, and it never reaches the report.
 */
export function buildTrendingRankingFile(
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
      // A saved verdict has no probabilities here; they are in the trace of the run that decided it.
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
