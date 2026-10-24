/**
 * Cross-source matching for the Trends page: Jev matches OpenRouter apps to the
 * npm packages and GitHub repos that URL merging missed. The decisions are saved
 * in `digests/trending-matches.json`, so each app is asked once.
 */

import fs from "node:fs";
import path from "node:path";
import { askJev, mapJev, type AskJev, type ChoiceAnswer } from "../core/jev.ts";
import type { RadarRow } from "./rank.ts";
import { normKey } from "./classify.ts";

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
