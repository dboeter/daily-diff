/**
 * Policy Watch relevance: Jev scores each new item, code weighs the answers
 * into keep/drop and an order (the ArXiv `relevanceOf` pattern), and the
 * answers are cached per item id in `digests/policy-verdicts.json` so an item
 * is asked once (a stage item once per stage). Without Jev, watchlisted items and keyword hits are kept.
 */

import path from "node:path";
import { askJev, mapJev, jevFailedTooOften, loadItemsFile, saveItemsFile } from "./jev.ts";
import type { AskJev } from "./trending-jev.ts";
import type { Jurisdiction, PolicyConfig } from "./config.ts";
import type { PolicyItem, PolicyState } from "./policy.ts";
import { daysBefore } from "./date.ts";

/**
 * The four questions every item gets; `state` is `{ title, description }`, plus
 * `stage` and `stage_date` for a stage item (an enacted bill is not the bill it was).
 */
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
    instructions:
      "Does the item in `title` and `description` (at `stage`, when given) concern a legally binding measure?",
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
      "Does the item in `title` and `description` (at `stage`, when given) report a new step in a policy process, rather than routine activity?",
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
      "How significant is the item in `title` and `description` (at `stage`, when given) for organisations that use AI in the jurisdiction it concerns?",
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
const IMPACT_CRITERIA = [
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
];
const IMPACT_QUESTION = {
  type: "score",
  instructions:
    "How much is the US measure in `title` and `description` expected to affect `reader`, their clients and colleagues, directly or indirectly?",
  criteria: IMPACT_CRITERIA,
};
/** A news or commentary piece reports on a development rather than being a measure itself. */
const NEWS_IMPACT_QUESTION = {
  ...IMPACT_QUESTION,
  instructions:
    "How much is the US development reported in `title` and `description` expected to affect `reader`, their clients and colleagues, directly or indirectly?",
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
/**
 * News items (`kind: news` feeds), summing to 1: topic and significance only.
 * A weekly roundup or an analysis piece is no new stage and binds nothing, yet
 * belongs in the report when it is about AI policy and significant. With
 * KEEP_MIN_RELEVANCE, an on-topic piece needs some significance: about 1 and
 * significance 0 is 0.4 and drops.
 */
const NEWS_WEIGHTS = { about_ai_policy: 0.4, significance: 0.6 };
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
  news = false,
): { relevance: number; keep: boolean } {
  const impact = isUs(jurisdiction) ? a.impact?.score : 0;
  const relevance = news
    ? NEWS_WEIGHTS.about_ai_policy * a.about_ai_policy?.noul +
      (NEWS_WEIGHTS.significance * a.significance?.score) / MAX_LEVEL
    : POLICY_WEIGHTS.about_ai_policy * a.about_ai_policy?.noul +
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

/**
 * Names a watchlist entry as a whole token, case-insensitively: no letter or
 * digit on either side, so dossier 36875 does not match inside 136875, nor
 * 2024/1689 inside 2024/16890.
 */
export const watchlisted = (
  i: Pick<PolicyItem, "title" | "description" | "link">,
  watchlist: string[],
): boolean => {
  const text = `${i.title} ${i.description} ${i.link}`;
  return watchlist.some((w) => {
    const entry = w.trim();
    if (entry === "") return false;
    const escaped = entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu").test(text);
  });
};

/**
 * A stage item first seen at a stage older than this is recorded in the state
 * but not reported: adding a file to the watchlist must not report stale news.
 */
const FIRST_SEEN_MAX_AGE_DAYS = 30;

/** Whether a stage source should set `recordOnly`: the state has never seen `id`, and its stage is old. */
export function staleOnFirstSight(
  ctx: { state: PolicyState | null; dateStr: string },
  id: string,
  stageDate: string,
): boolean {
  return (
    ctx.state?.stages?.[id] === undefined && stageDate < daysBefore(ctx.dateStr, FIRST_SEEN_MAX_AGE_DAYS)
  );
}

/** The watchlist of an item's own jurisdiction; Elsewhere has none. */
const WATCHLIST_OF: Record<Jurisdiction, keyof PolicyConfig["watchlist"] | null> = {
  eu: "eu",
  nl: "nl",
  us_federal: "usFederal",
  us_states: "usStates",
  other: null,
};
const watchlistFor = (watchlist: PolicyConfig["watchlist"], j: Jurisdiction): string[] => {
  const key = WATCHLIST_OF[j];
  return key ? watchlist[key] : [];
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
  /**
   * A stage item's stage when Jev answered: Congress, Open States and Have
   * your say keep an id across stages, so a different stage is asked again.
   * Absent for other items, and on entries saved before stages were recorded.
   */
  stage?: string;
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
  return loadItemsFile<PolicyVerdictEntry>(file, "policy");
}

/** One item per line, like the trending classifications. */
export function savePolicyVerdicts(cache: PolicyVerdicts, file = POLICY_VERDICTS_FILE): void {
  saveItemsFile(cache, file);
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
    /** A non-news item naming an entry of its own jurisdiction's list is always kept. */
    watchlist: PolicyConfig["watchlist"];
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
    if (!e || e.stage !== item.stage) continue;
    try {
      verdicts.set(item.id, {
        answers: e.answers,
        ...policyRelevance(e.answers, item.jurisdiction, item.news),
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
          // A stage item's `published` is its stage's date.
          ...(item.stage ? { stage: item.stage, stage_date: item.published.slice(0, 10) } : {}),
          ...(us ? { reader: readerProfile } : {}),
        };
        const impact = item.news ? NEWS_IMPACT_QUESTION : IMPACT_QUESTION;
        const questions = us ? { ...BASE_QUESTIONS, impact } : BASE_QUESTIONS;
        const { model, answers } = await ask(state, questions, apiKey);
        const a = answers as PolicyAnswers;
        return { answers: a, model, ...policyRelevance(a, item.jurisdiction, item.news) };
      },
      "policy",
    );
    toAsk.forEach((item, i) => results[i] && fresh.set(item.id, results[i]));
    jevDown = jevFailedTooOften(failed, toAsk.length);
  }
  // Too many failures: the answers that did arrive are saved, but this run decides by keyword.
  if (!jevDown) for (const [id, v] of fresh) verdicts.set(id, v);

  const onWatchlist = (i: PolicyItem): boolean => watchlisted(i, watchlistFor(watchlist, i.jurisdiction));
  const kept = (i: PolicyItem): boolean => {
    // News about a watchlisted file is still news: Jev judges it like any other piece.
    if (!i.news && onWatchlist(i)) return true;
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
          ...(item.stage ? { stage: item.stage } : {}),
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
        Object.entries(next).filter(([, e]) => e.lastSeen >= daysBefore(dateStr, VERDICT_UNSEEN_DAYS)),
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
      watchlisted: onWatchlist(i),
      keyword: keywordHit(i),
    });
  });
  const rankingFile =
    `{\n"models": ${JSON.stringify(models)},\n"rankedBy": ${JSON.stringify(jevDown ? "keywords" : "jev")},\n` +
    `"weights": ${JSON.stringify(POLICY_WEIGHTS)},\n"newsWeights": ${JSON.stringify(NEWS_WEIGHTS)},\n"items": [\n${lines.join(",\n")}\n]\n}\n`;

  return { items: selected, rankedBy: jevDown ? "keywords" : "jev", nextVerdicts, rankingFile };
}
