/**
 * Policy Watch relevance: Jev scores each new item, code weighs the answers
 * into keep/drop and an order (the ArXiv `relevanceOf` pattern), and the
 * answers are cached per item id in `digests/policy-verdicts.json` so an item
 * is asked once. Without Jev, watchlisted items and keyword hits are kept.
 */

import fs from "node:fs";
import path from "node:path";
import { askJev, mapJev, jevFailedTooOften } from "./jev.ts";
import type { AskJev } from "./trending-jev.ts";
import type { Jurisdiction } from "./config.ts";
import type { PolicyItem } from "./policy.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The four questions every item gets; `state` is `{ title, description }`. */
const BASE_QUESTIONS = {
  about_ai_policy: {
    type: "noul",
    instructions: "Is the item described by `title` and `description` about AI policy?",
    criteria: {
      true: {
        what: "Legislation, regulation, official guidance, enforcement or government policy on AI, algorithms or automated decision-making",
        examples: [
          "an AI Act implementing act",
          "guidelines for general-purpose AI models",
          "a data protection fine for automated decision-making",
          "a bill on frontier AI models",
        ],
      },
      false: {
        what: "Anything else, including AI news without a policy angle and policy on other subjects",
        examples: [
          "an AI research result",
          "a product launch",
          "a telecoms spectrum auction",
          "a cybersecurity grant",
        ],
      },
    },
  },
  binding: {
    type: "noul",
    instructions: "Does the item in `title` and `description` concern a legally binding measure?",
    criteria: {
      true: {
        what: "A law, regulation, implementing or delegated act, executive order, or an enforcement decision",
        examples: ["a regulation published in the Official Journal", "a fine", "a bill passed by a chamber"],
      },
      false: {
        what: "Guidance, a strategy, a consultation, a report, an event or a funding call",
        examples: ["a code of practice", "a call for tenders", "a public consultation", "a conference"],
      },
    },
  },
  new_stage: {
    type: "noul",
    instructions:
      "Does the item in `title` and `description` report a new step in a policy process, rather than routine activity?",
    criteria: {
      true: {
        what: "Something was adopted, published, voted, signed, decided, entered into force, or opened for comment",
        examples: [
          "a vote in parliament",
          "guidelines published",
          "a consultation launched",
          "a fine imposed",
        ],
      },
      false: {
        what: "Routine activity: a meeting, speech, event, newsletter, recap or announcement of future plans",
        examples: ["a panel meeting", "an innovation month", "a minister's speech", "a weekly roundup"],
      },
    },
  },
  significance: {
    type: "score",
    instructions:
      "How significant is the item in `title` and `description` for organisations that use AI in the jurisdiction it concerns?",
    criteria: [
      {
        what: "Minor: little changes for organisations using AI",
        examples: ["an event announcement", "a call for experts", "a meeting read-out"],
      },
      {
        what: "Notable: practitioners should know about it",
        examples: [
          "new guidance on an existing law",
          "a consultation on AI rules",
          "an enforcement decision",
        ],
      },
      {
        what: "Major: a landmark change to the rules on AI",
        examples: ["a major AI law adopted", "an obligation taking effect", "a record fine for AI use"],
      },
    ],
  },
};

/**
 * US items only; `reader` (config.yml `policy.reader_profile`) is in `state`
 * only for them, since unused state costs accuracy. A score of magnitude, not
 * kind: a direct or an indirect impact can be either level. Examples name no
 * sector: the reader's clients span many.
 */
const IMPACT_QUESTION = {
  type: "score",
  instructions:
    "How much is the US measure in `title` and `description` expected to affect `reader`, their clients and colleagues, directly or indirectly?",
  criteria: [
    {
      what: "Little or no expected effect outside the US",
      examples: ["a state rule on AI in its own agencies", "a federal grant program", "a hearing"],
    },
    {
      what: "Some effect: obligations or shifts that reach EU users in part or later",
      examples: [
        "disclosure duties for US AI vendors that their EU customers inherit",
        "a state law that national vendors are likely to apply everywhere",
      ],
    },
    {
      what: "Significant effect: obligations that reach EU users of US models, clouds or tools, or a change to the pace or direction of AI development",
      examples: [
        "export controls on AI chips or model weights",
        "federal rules for frontier models",
        "federal preemption of state AI laws",
      ],
    },
  ],
};

export interface PolicyAnswers {
  about_ai_policy: { noul: number };
  binding: { noul: number };
  new_stage: { noul: number };
  /** Probability-weighted level, 0–2. */
  significance: { score: number };
  /** US items only; 0–2. */
  impact?: { score: number };
}

/**
 * Weights for the order, summing to 1. Being about AI policy is the largest
 * share and also a gate, so an off-topic item never ranks on significance alone.
 */
const POLICY_WEIGHTS = { about_ai_policy: 0.4, significance: 0.3, new_stage: 0.2, binding: 0.1 };
const MAX_LEVEL = 2;
/** Keep: about AI policy at this noul or more, and a relevance of at least KEEP_MIN_RELEVANCE. */
const ABOUT_MIN = 0.5;
/** An AI-policy item (0.4) needs a new stage or some significance on top: a routine event drops. */
const KEEP_MIN_RELEVANCE = 0.5;
/** US items: "some effect" or more (spec: a US item with little expected impact stays out). */
const US_IMPACT_MIN = 1;
/** Elsewhere: only major events (spec). */
const OTHER_SIGNIFICANCE_MIN = 1.5;

const isUs = (j: Jurisdiction): boolean => j === "us_federal" || j === "us_states";

/** Weighted relevance in 0–1 and the keep decision. Throws on an unexpected answer shape. */
export function policyRelevance(
  a: PolicyAnswers,
  jurisdiction: Jurisdiction,
): { relevance: number; keep: boolean } {
  const impact = isUs(jurisdiction) ? a.impact?.score : 0;
  const relevance =
    POLICY_WEIGHTS.about_ai_policy * a.about_ai_policy?.noul +
    (POLICY_WEIGHTS.significance * a.significance?.score) / MAX_LEVEL +
    POLICY_WEIGHTS.new_stage * a.new_stage?.noul +
    POLICY_WEIGHTS.binding * a.binding?.noul;
  // A NaN would sort arbitrarily yet count as a success (see relevanceOf in arxiv.ts).
  if (!Number.isFinite(relevance) || !Number.isFinite(impact)) {
    throw new Error(`Unexpected Jev answers: ${JSON.stringify(a)}`);
  }
  const keep =
    a.about_ai_policy.noul >= ABOUT_MIN &&
    relevance >= KEEP_MIN_RELEVANCE &&
    (!isUs(jurisdiction) || impact! >= US_IMPACT_MIN) &&
    (jurisdiction !== "other" || a.significance.score >= OTHER_SIGNIFICANCE_MIN);
  return { relevance, keep };
}

/**
 * Keyword step of the fallback: names AI. "AI" is matched case-sensitively so
 * the word "ai" in other languages does not count.
 */
const AI_ACRONYM_RE = /\b(?:GP)?AI\b/;
const AI_KEYWORD_RE =
  /artificial intelligence|machine learning|\balgorithm|automated decision|generative|foundation model|kunstmatige intelligentie|\balgoritm/i;
export const keywordHit = (i: Pick<PolicyItem, "title" | "description">): boolean => {
  const text = `${i.title} ${i.description}`;
  return AI_ACRONYM_RE.test(text) || AI_KEYWORD_RE.test(text);
};

export const watchlisted = (
  i: Pick<PolicyItem, "title" | "description" | "link">,
  watchlist: string[],
): boolean => {
  const text = `${i.title} ${i.description} ${i.link}`.toLowerCase();
  return watchlist.some((w) => w.trim() !== "" && text.includes(w.trim().toLowerCase()));
};

// ---------------------------------------------------------------------------
// Verdict cache
// ---------------------------------------------------------------------------

/** `digests/policy-verdicts.json`: Jev's raw answers per item id. Hand-editable. */
export interface PolicyVerdicts {
  items: Record<string, PolicyVerdictEntry>;
}

export interface PolicyVerdictEntry {
  /** For readers only. */
  title: string;
  /** Raw answers, not the decision, so the weights can change without asking again. */
  answers: PolicyAnswers;
  /** CST date Jev answered; absent on a hand-added entry. */
  decided?: string;
  model?: string;
  lastSeen: string;
}

export const POLICY_VERDICTS_FILE = path.join("digests", "policy-verdicts.json");
/**
 * News items leave the 7-day age window, so an id unseen this long will not
 * return; the same span as the policy state's REPORTED_KEEP_DAYS.
 */
const VERDICT_UNSEEN_DAYS = 30;

/** Missing → empty. Malformed → null: every item is asked and nothing is saved, so a hand edit survives. */
export function loadPolicyVerdicts(file = POLICY_VERDICTS_FILE): PolicyVerdicts | null {
  if (!fs.existsSync(file)) return { items: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<PolicyVerdicts> | null;
    const items: unknown = parsed?.items;
    if (!items || typeof items !== "object" || Array.isArray(items)) throw new Error("no `items` object");
    return parsed as PolicyVerdicts;
  } catch (err) {
    console.error(`  [policy] Cannot read ${file}, every item is asked: ${err}`);
    return null;
  }
}

/** One item per line, like the trending classifications. */
export function savePolicyVerdicts(cache: PolicyVerdicts, file = POLICY_VERDICTS_FILE): void {
  const lines = Object.entries(cache.items).map(
    ([id, e]) => `    ${JSON.stringify(id)}: ${JSON.stringify(e)}`,
  );
  const body = lines.length > 0 ? `{\n${lines.join(",\n")}\n  }` : "{}";
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `{\n  "items": ${body}\n}\n`, "utf-8");
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

export interface PolicySelection {
  /** The kept items, most relevant first; items without a verdict after, in feed order. */
  items: PolicyItem[];
  /** "keywords" when there was no key or more than half the new calls failed. */
  rankedBy: "jev" | "keywords";
  /** null when the verdict file was malformed: it is left as it is. */
  nextVerdicts: PolicyVerdicts | null;
  /** `digests/YYYY-MM-DD/policy-ranking.json`: every item, kept or dropped. */
  rankingFile: string;
}

interface Verdict {
  answers: PolicyAnswers;
  relevance: number;
  keep: boolean;
  model?: string;
  /** Set when the verdict came from the cache. */
  decided?: string;
}

const round = (n: number): number => Math.round(n * 1000) / 1000;
const roundAnswers = (a: PolicyAnswers): PolicyAnswers =>
  JSON.parse(JSON.stringify(a), (_, v: unknown) => (typeof v === "number" ? round(v) : v)) as PolicyAnswers;

export async function selectPolicyItems(
  items: PolicyItem[],
  opts: {
    readerProfile: string;
    /** Every watchlist entry, all jurisdictions: an item naming one is always kept. */
    watchlist: string[];
    apiKey?: string;
    cache: PolicyVerdicts | null;
    dateStr: string;
    ask?: AskJev;
  },
): Promise<PolicySelection> {
  const { readerProfile, watchlist, apiKey, cache, dateStr, ask = askJev } = opts;
  const verdicts = new Map<string, Verdict>();
  for (const item of items) {
    const e = cache?.items[item.id];
    if (!e) continue;
    try {
      verdicts.set(item.id, {
        answers: e.answers,
        ...policyRelevance(e.answers, item.jurisdiction),
        decided: e.decided ?? "by hand",
      });
    } catch {
      console.error(`  [policy] Invalid saved verdict for ${item.id}, asking again`);
    }
  }

  const toAsk = items.filter((i) => !verdicts.has(i.id));
  const fresh = new Map<string, Verdict>();
  // Every item decided from saved verdicts is a Jev ranking, key or not.
  let jevDown = !apiKey && toAsk.length > 0;
  if (apiKey && toAsk.length > 0) {
    const { results, failed } = await mapJev(
      toAsk,
      async (item) => {
        const us = isUs(item.jurisdiction);
        const state = {
          title: item.title,
          description: item.description,
          ...(us ? { reader: readerProfile } : {}),
        };
        const questions = us ? { ...BASE_QUESTIONS, impact: IMPACT_QUESTION } : BASE_QUESTIONS;
        const { model, answers } = await ask(state, questions, apiKey);
        const a = answers as PolicyAnswers;
        return { answers: a, model, ...policyRelevance(a, item.jurisdiction) };
      },
      "policy",
    );
    toAsk.forEach((item, i) => results[i] && fresh.set(item.id, results[i]));
    jevDown = jevFailedTooOften(failed, toAsk.length);
  }
  // Too many failures: the answers that did arrive are saved, but this run decides by keyword.
  if (!jevDown) for (const [id, v] of fresh) verdicts.set(id, v);

  const kept = (i: PolicyItem): boolean => {
    if (watchlisted(i, watchlist)) return true;
    const v = verdicts.get(i.id);
    // A Jev-only feed's items need not name AI, so a keyword match means nothing there.
    return v ? v.keep : !i.jevOnly && keywordHit(i);
  };
  const score = (i: PolicyItem): number => verdicts.get(i.id)?.relevance ?? -1;
  const selected = items.filter(kept).sort((a, b) => score(b) - score(a));
  console.log(
    `  [policy] Kept ${selected.length}/${items.length} items${jevDown ? " (no Jev: watchlist and keywords only)" : ""}`,
  );

  let nextVerdicts: PolicyVerdicts | null = null;
  if (cache) {
    const next = { ...cache.items };
    for (const item of items) {
      const v = fresh.get(item.id);
      if (v) {
        next[item.id] = {
          title: item.title,
          answers: roundAnswers(v.answers),
          decided: dateStr,
          ...(v.model ? { model: v.model } : {}),
          lastSeen: dateStr,
        };
      } else if (next[item.id]) {
        next[item.id] = { ...next[item.id]!, lastSeen: dateStr };
      }
    }
    nextVerdicts = {
      items: Object.fromEntries(
        Object.entries(next).filter(
          ([, e]) => (Date.parse(dateStr) - Date.parse(e.lastSeen)) / DAY_MS <= VERDICT_UNSEEN_DAYS,
        ),
      ),
    };
  }

  const models = [...new Set([...fresh.values()].flatMap((v) => (v.model ? [v.model] : [])))];
  const lines = items.map((i) => {
    const v = verdicts.get(i.id) ?? fresh.get(i.id);
    return JSON.stringify({
      id: i.id,
      title: i.title,
      source: i.source,
      jurisdiction: i.jurisdiction,
      kept: selected.includes(i),
      relevance: v ? round(v.relevance) : null,
      ...(v ? roundAnswers(v.answers) : {}),
      decided: v?.decided ?? null,
      watchlisted: watchlisted(i, watchlist),
      keyword: keywordHit(i),
    });
  });
  const rankingFile =
    `{\n"models": ${JSON.stringify(models)},\n"rankedBy": ${JSON.stringify(jevDown ? "keywords" : "jev")},\n` +
    `"weights": ${JSON.stringify(POLICY_WEIGHTS)},\n"items": [\n${lines.join(",\n")}\n]\n}\n`;

  return { items: selected, rankedBy: jevDown ? "keywords" : "jev", nextVerdicts, rankingFile };
}
