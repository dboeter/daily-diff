/**
 * TypeSafe Jev client, shared by ArXiv, trending, Policy Watch and the data
 * report's vendor feeds; `judgeItems` is the cached judgment of the last three.
 *
 * Jev is not a chat model: POST /v1/systemone takes a `state` and typed
 * questions and returns probabilities. It is called directly rather than through
 * callLlm — it is not an LlmProvider, and ~600 calls a day would swamp the
 * llmStats health gate that is calibrated for 3–5 report calls.
 */

import fs from "node:fs";
import path from "node:path";
import { daysBefore, sleep } from "./date.ts";

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
/**
 * The Models page lists 80 requests/second and warns the limit can change without
 * notice; at ~100 ms a call, 5 workers stay near 50/s.
 */
const JEV_CONCURRENCY = 5;
/** Above this fraction of failed calls the answers are noise — the caller falls back. */
const JEV_MAX_FAILURE_RATIO = 0.5;
const JEV_MAX_RETRIES = 3;
const JEV_RETRY_BASE_MS = 1000;
const JEV_RETRY_MAX_MS = 10_000;

/** Wait before retry `attempt` (0-based): the `retry-after` seconds when sent, else exponential backoff. */
export function retryDelayMs(retryAfter: string | null, attempt: number): number {
  const seconds = Number(retryAfter);
  // retry-after may also be an HTTP date; Number() makes that NaN and it falls back to backoff.
  const ms =
    retryAfter && Number.isFinite(seconds) && seconds >= 0
      ? seconds * 1000
      : JEV_RETRY_BASE_MS * 2 ** attempt;
  return Math.min(ms, JEV_RETRY_MAX_MS);
}

/**
 * `askJev` without the type parameter, so tests can inject a stub that returns
 * fixed answers. Callers check the answer shape themselves.
 */
export type AskJev = (
  state: unknown,
  questions: object,
  apiKey: string,
) => Promise<{ model: string; answers: unknown }>;

/** One Jev request. `model` is the versioned model that answered — `jev-latest` is an alias that moves. */
export async function askJev<A>(
  state: unknown,
  questions: object,
  apiKey: string,
): Promise<{ model: string; answers: A }> {
  const request = (): Promise<Response> =>
    fetch(JEV_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "jev-latest", state, questions }),
    });
  let resp = await request();
  // 429 = rate limited, 529 = overloaded; the docs ask for exponential backoff. An item
  // that still fails counts as failed in mapJev, and a broad outage trips the caller's fallback.
  for (
    let attempt = 0;
    (resp.status === 429 || resp.status === 529) && attempt < JEV_MAX_RETRIES;
    attempt++
  ) {
    await sleep(retryDelayMs(resp.headers.get("retry-after"), attempt));
    resp = await request();
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as { model: string; answers: A };
}

/**
 * Run `fn` over `items` with JEV_CONCURRENCY workers. `results[i]` belongs to
 * `items[i]` and is null when that call threw. Logs the first failure and the tally.
 */
export async function mapJev<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  label: string,
): Promise<{ results: (R | null)[]; failed: number }> {
  const results = new Array<R | null>(items.length).fill(null);
  let failed = 0;
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i]!);
      } catch (err) {
        failed++;
        if (failed === 1) console.error(`  [${label}] Jev call failed: ${err}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(JEV_CONCURRENCY, items.length) }, worker));

  console.log(`  [${label}] Jev answered ${items.length - failed}/${items.length}`);
  return { results, failed };
}

/** True when too many calls failed for the answers to mean anything. */
export function jevFailedTooOften(failed: number, total: number): boolean {
  return total > 0 && failed / total > JEV_MAX_FAILURE_RATIO;
}

// ---------------------------------------------------------------------------
// Verdict cache files (trending classifications, policy verdicts)
// ---------------------------------------------------------------------------

/** A committed, hand-editable cache: `{ "items": { <key>: <entry> } }`. */
export interface ItemsFile<T> {
  items: Record<string, T>;
}

/**
 * Missing file → empty. Unreadable or malformed → null, logged under `tag`:
 * every item is asked and nothing is saved, since an empty cache saved after
 * the report would overwrite a hand edit.
 */
export function loadItemsFile<T>(file: string, tag: string): ItemsFile<T> | null {
  if (!fs.existsSync(file)) return { items: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<ItemsFile<T>> | null;
    const items: unknown = parsed?.items;
    if (!items || typeof items !== "object" || Array.isArray(items)) throw new Error("no `items` object");
    return parsed as ItemsFile<T>;
  } catch (err) {
    console.error(`  [${tag}] Cannot read ${file}, every item is asked: ${err}`);
    return null;
  }
}

/** One item per line: a pretty-printed file of hundreds of entries would be long to read and diff. */
export function saveItemsFile(cache: ItemsFile<unknown>, file: string): void {
  const lines = Object.entries(cache.items).map(
    ([key, e]) => `    ${JSON.stringify(key)}: ${JSON.stringify(e)}`,
  );
  const body = lines.length > 0 ? `{\n${lines.join(",\n")}\n  }` : "{}";
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `{\n  "items": ${body}\n}\n`, "utf-8");
}

// ---------------------------------------------------------------------------
// Cached judgments (Policy Watch, the data report's vendor items, trending classification)
// ---------------------------------------------------------------------------

/**
 * One item's saved answers in a verdict file. Hand-editable: to fix a verdict,
 * edit its `answers` and set `pinned`.
 */
export interface VerdictEntry<A> {
  /** For readers only. */
  title: string;
  /** Raw answers, not the decision, so the weights can change without asking again. */
  answers: A;
  /**
   * What the answers were given for (`judgeItems`' `fingerprint`): a stage
   * item's stage, a trending item's description hash. Absent otherwise.
   */
  fingerprint?: string;
  /** A hand fix: reused whatever the fingerprint, never asked again. */
  pinned?: true;
  /** CST date Jev answered; absent on a hand-added entry. */
  decided?: string;
  model?: string;
  lastSeen: string;
}

export type VerdictCache<A> = ItemsFile<VerdictEntry<A>>;

/** A Jev `choice` question's answer. */
export interface ChoiceAnswer {
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

/** Who decided a run's selection: Jev, or the caller's keyword fallback. */
export type RankedBy = "jev" | "keywords";

/**
 * An item's decision with the answers it came from. `decided` is set when they came
 * from the cache: the CST date Jev answered, or "by hand" for a hand-added entry.
 */
export type Judged<A, D> = D & { answers: A; model?: string; decided?: string };

export interface Judgment<I, A, D> {
  /** The verdicts this run decides by: saved ones, plus the new ones unless Jev failed too often. */
  verdicts: Map<string, Judged<A, D>>;
  /** "keywords" when there was no key or more than half the new calls failed: the caller's fallback decides. */
  rankedBy: RankedBy;
  /** The cache to save: new answers, items marked seen, unseen ones pruned. null when the file was malformed. */
  nextCache: VerdictCache<A> | null;
  /**
   * The trace fields of an item: relevance (when the decision has one), its
   * answers and `decided`; also the answers that arrived when Jev was down.
   */
  traceFields(item: I): Record<string, unknown>;
  /** The trace file: `header` entries after `models` and `rankedBy`, then one row per line. */
  rankingFile(rows: object[], header: Record<string, unknown>): string;
}

const round = (n: number): number => Math.round(n * 1000) / 1000;
const roundAnswers = <A>(a: A): A =>
  JSON.parse(JSON.stringify(a), (_, v: unknown) => (typeof v === "number" ? round(v) : v)) as A;

/**
 * Judge `items` once each: a saved verdict is reused (only at the same
 * fingerprint, unless pinned), the rest are asked. `decide` weighs answers into a decision
 * and throws on an unexpected shape, which counts a new call as failed and a
 * saved entry as missing (it is asked again). When the new calls fail too often,
 * the answers that did arrive are still saved, but this run decides without them.
 * A decision's numeric `relevance`, when it has one, goes into the trace.
 */
export async function judgeItems<I extends { id: string; title: string }, A, D extends object>(
  items: I[],
  opts: {
    /** Log tag. */
    tag: string;
    request: (item: I) => { state: unknown; questions: object };
    decide: (answers: A, item: I) => D;
    /**
     * What the answers depend on beyond the id: a stage, for sources whose ids
     * persist across stages; a description hash. A saved entry at a different
     * fingerprint (or none) is asked again.
     */
    fingerprint?: (item: I) => string | undefined;
    apiKey?: string;
    cache: VerdictCache<A> | null;
    dateStr: string;
    /** Entries not seen for this many days are pruned. */
    unseenDays: number;
    ask?: AskJev;
  },
): Promise<Judgment<I, A, D>> {
  const { tag, request, decide, fingerprint, apiKey, cache, dateStr, unseenDays, ask = askJev } = opts;
  const verdicts = new Map<string, Judged<A, D>>();
  for (const item of items) {
    const e = cache?.items[item.id];
    if (!e || (!e.pinned && fingerprint && e.fingerprint !== fingerprint(item))) continue;
    try {
      verdicts.set(item.id, {
        answers: e.answers,
        ...decide(e.answers, item),
        decided: e.decided ?? "by hand",
      });
    } catch {
      console.error(`  [${tag}] Invalid saved verdict for ${item.id}, asking again`);
    }
  }

  const toAsk = items.filter((i) => !verdicts.has(i.id));
  const fresh = new Map<string, Judged<A, D>>();
  // Every item decided from saved verdicts is a Jev ranking, key or not.
  let jevDown = !apiKey && toAsk.length > 0;
  if (apiKey && toAsk.length > 0) {
    const { results, failed } = await mapJev(
      toAsk,
      async (item): Promise<Judged<A, D>> => {
        const { state, questions } = request(item);
        const { model, answers } = await ask(state, questions, apiKey);
        const a = answers as A;
        return { answers: a, model, ...decide(a, item) };
      },
      tag,
    );
    toAsk.forEach((item, i) => results[i] && fresh.set(item.id, results[i]));
    jevDown = jevFailedTooOften(failed, toAsk.length);
  }
  if (!jevDown) for (const [id, v] of fresh) verdicts.set(id, v);

  let nextCache: VerdictCache<A> | null = null;
  if (cache) {
    const next = { ...cache.items };
    for (const item of items) {
      const v = fresh.get(item.id);
      const f = fingerprint?.(item);
      if (v) {
        next[item.id] = {
          title: item.title,
          ...(f ? { fingerprint: f } : {}),
          answers: roundAnswers(v.answers),
          decided: dateStr,
          ...(v.model ? { model: v.model } : {}),
          lastSeen: dateStr,
        };
      } else if (next[item.id]) {
        // Spread, not rebuilt: a hand edit keeps its fields.
        next[item.id] = { ...next[item.id]!, lastSeen: dateStr };
      }
    }
    nextCache = {
      items: Object.fromEntries(
        Object.entries(next).filter(([, e]) => e.lastSeen >= daysBefore(dateStr, unseenDays)),
      ),
    };
  }

  const rankedBy = jevDown ? "keywords" : "jev";
  const models = [...new Set([...fresh.values()].flatMap((v) => (v.model ? [v.model] : [])))];
  return {
    verdicts,
    rankedBy,
    nextCache,
    traceFields(item) {
      const v = verdicts.get(item.id) ?? fresh.get(item.id);
      const relevance = v && "relevance" in v && typeof v.relevance === "number" ? v.relevance : undefined;
      return {
        ...(v === undefined || relevance !== undefined
          ? { relevance: relevance === undefined ? null : round(relevance) }
          : {}),
        ...(v ? roundAnswers(v.answers) : {}),
        decided: v?.decided ?? null,
      };
    },
    rankingFile(rows, header) {
      const head = Object.entries({ models, rankedBy, ...header }).map(
        ([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)},\n`,
      );
      return `{\n${head.join("")}"items": [\n${rows.map((r) => JSON.stringify(r)).join(",\n")}\n]\n}\n`;
    },
  };
}
