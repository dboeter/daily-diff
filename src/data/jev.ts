/**
 * The data report's vendor relevance: Jev answers four questions per new
 * vendor item, code weighs them into keep/drop and an order (the Policy Watch
 * pattern, `policy/jev.ts`), and the answers are cached per item id in
 * `digests/data-verdicts.json` so an item is asked once. Without Jev, keyword
 * rules decide. Behavior-change bundles skip Jev: always kept, as deprecations.
 */

import path from "node:path";
import { judgeItems, loadItemsFile, type AskJev, type VerdictCache } from "../core/jev.ts";
import type { VendorItem } from "./vendors.ts";
import { numberRows, type Numbered } from "../reports/summarized-table.ts";
import { VENDOR_SECTIONS, vendorSection, type VendorSection } from "../core/config.ts";
import type { Selection } from "../core/new-items.ts";

/** `state` is `{ title, description, source }`. */
const QUESTIONS = {
  real_change: {
    type: "noul",
    instructions:
      "Does the item from `source`, described by `title` and `description`, announce a change to a data platform or service?",
    criteria: {
      true: {
        what: "A product change: a release, general availability, a preview, a deprecation or retirement, a behavior change",
        examples: [
          "a feature now generally available",
          "a new runtime version",
          "a feature in public preview",
          "a service scheduled for retirement",
        ],
      },
      false: {
        what: "Marketing, an event recap, a customer story, a community post or an opinion piece",
        examples: ["a conference roundup", "a customer success story", "a community spotlight", "a webinar"],
      },
    },
  },
  deprecation: {
    type: "noul",
    instructions: "Does the item in `title` and `description` announce something going away or breaking?",
    criteria: {
      true: {
        what: "A deprecation, retirement, end of support or a breaking change",
        examples: [
          "a model scheduled for retirement",
          "an API version reaching end of support",
          "a default behavior that changes",
        ],
      },
      false: {
        what: "A new feature, an improvement, a fix or anything else",
        examples: ["a new connector", "a performance improvement", "a region rollout"],
      },
    },
  },
  ai_in_data: {
    type: "noul",
    instructions: "Is the item in `title` and `description` about AI in data work?",
    criteria: {
      true: {
        what: "AI or LLM features in a data platform, or AI tooling for data work",
        examples: [
          "an LLM function in SQL",
          "a text-to-SQL assistant",
          "an agent framework on the warehouse",
        ],
      },
      false: {
        what: "Data platform changes without an AI angle",
        examples: ["a storage format change", "a new SQL function", "a networking feature"],
      },
    },
  },
  significance: {
    type: "score",
    instructions:
      "How significant is the item in `title` and `description` for a data engineer at a consultancy whose clients use Databricks, Snowflake, Azure and GCP?",
    criteria: [
      {
        what: "Minor: niche, or little changes for client projects",
        examples: ["a region rollout", "a new model on a model gateway", "a documentation update"],
      },
      {
        what: "Notable: data engineers should know about it",
        examples: ["a new feature in preview", "a connector update", "a new SQL capability"],
      },
      {
        what: "Major: changes how client platforms are built or run",
        examples: [
          "a core feature generally available",
          "a retirement that forces a migration",
          "a pricing or default change",
        ],
      },
    ],
  },
};

export interface DataAnswers {
  real_change: { noul: number };
  deprecation: { noul: number };
  /** Not weighed: flags an item for the Data × AI section (`aiInData`). */
  ai_in_data: { noul: number };
  /** Probability-weighted level, 0–2. */
  significance: { score: number };
}

/** Summing to 1. A real change and significance carry the order; a deprecation adds a little on top. */
const DATA_WEIGHTS = { real_change: 0.4, significance: 0.4, deprecation: 0.2 };
const MAX_LEVEL = 2;
/** Keep: a real change at this noul or more (the gate that drops marketing and event recaps). */
const REAL_CHANGE_MIN = 0.5;
/** A sure real change (0.4) needs some significance or a deprecation on top: a niche note drops. */
const KEEP_MIN_RELEVANCE = 0.5;
/** A deprecation at this noul or more, if a real change, is always kept: consultants warn clients early. */
const DEPRECATION_MIN = 0.5;

/** Weighted relevance in 0–1, the keep decision and the deprecation flag. Throws on an unexpected answer shape. */
export function dataRelevance(a: DataAnswers): { relevance: number; keep: boolean; deprecation: boolean } {
  const relevance =
    DATA_WEIGHTS.real_change * a.real_change?.noul +
    (DATA_WEIGHTS.significance * a.significance?.score) / MAX_LEVEL +
    DATA_WEIGHTS.deprecation * a.deprecation?.noul;
  // A NaN would sort arbitrarily yet count as a success (see relevanceOf in arxiv.ts).
  if (!Number.isFinite(relevance)) throw new Error(`Unexpected Jev answers: ${JSON.stringify(a)}`);
  const real = a.real_change.noul >= REAL_CHANGE_MIN;
  const deprecation = real && a.deprecation.noul >= DEPRECATION_MIN;
  return { relevance, keep: deprecation || (real && relevance >= KEEP_MIN_RELEVANCE), deprecation };
}

/**
 * Keyword fallback. GA and AI are matched case-sensitively as whole words,
 * so "ga" and "ai" inside other words do not count.
 */
const DEPRECATION_RE = /deprecat|retire|breaking|end of support|end-of-life|sunset|behaviou?r change/i;
const FEATURE_RE = /generally available|preview|now available|introduc|release/i;
const GA_RE = /\bGA\b/;
const AI_ACRONYM_RE = /\bAI\b/;
const AI_RE = /\bLLM|\bagent|cortex|genie|copilot|\bmodel/i;
/** Data × AI: Jev's `ai_in_data` at this noul or more. */
const AI_IN_DATA_MIN = 0.5;
/** Without a Jev answer, an item is in Data × AI when it names an AI term (bundles included). */
const aiKeywordHit = (text: string): boolean => AI_ACRONYM_RE.test(text) || AI_RE.test(text);
/** Azure updates' status category for retirements. */
const RETIREMENTS_CATEGORY = "Retirements";

/** The fallback's verdict: kept or not, and as a deprecation. */
export function keywordVerdict(i: Pick<VendorItem, "title" | "description" | "categories">): {
  keep: boolean;
  deprecation: boolean;
} {
  const text = `${i.title} ${i.description}`;
  if (DEPRECATION_RE.test(text) || i.categories?.includes(RETIREMENTS_CATEGORY)) {
    return { keep: true, deprecation: true };
  }
  return { keep: FEATURE_RE.test(text) || GA_RE.test(text) || aiKeywordHit(text), deprecation: false };
}

/**
 * Vendor items in the report at most. The 2026-10-17 spike counted ~11 raw
 * items on a typical day and ~45 on a busy one: 12 covers a typical day in
 * full, and Jev's order trims a busy one.
 */
export const MAX_VENDOR_ITEMS = 12;

// ---------------------------------------------------------------------------
// Verdict cache
// ---------------------------------------------------------------------------

/** `digests/data-verdicts.json`: Jev's raw answers per item id. Hand-editable. */
export type DataVerdicts = VerdictCache<DataAnswers>;

export const DATA_VERDICTS_FILE = path.join("digests", "data-verdicts.json");
/** Items leave the 7-day age limit, so an id unseen this long will not return; the data state's span. */
const VERDICT_UNSEEN_DAYS = 30;

/** Missing → empty. Malformed → null: every item is asked and nothing is saved, so a hand edit survives. */
export function loadDataVerdicts(file = DATA_VERDICTS_FILE): DataVerdicts | null {
  return loadItemsFile(file, "data");
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/** A kept vendor item; deprecations are rendered with ⚠️ and listed first. */
export interface KeptVendorItem extends VendorItem {
  deprecation: boolean;
  /** For the Data × AI section: Jev's `ai_in_data`, else an AI keyword in title or description. */
  aiInData: boolean;
}

/**
 * Items by section, deprecations first, then by relevance (no verdict: feed order);
 * numbered in that order. Trace: `data-ranking.json`.
 */
export type VendorSelection = Selection<Numbered<KeptVendorItem>, DataVerdicts>;

/**
 * Non-deprecations each section gets first. Without floors the cloud block got
 * 0 of 12 on the 2026-10-17 first-run pool: Databricks and Snowflake filled the cap.
 */
const SECTION_FLOORS: Record<VendorSection, number> = { databricks: 6, snowflake: 3, cloud: 3 };

/**
 * Every deprecation, plus up to SECTION_FLOORS non-deprecations per section by
 * relevance; slots still left under MAX_VENDOR_ITEMS go Databricks, Snowflake,
 * then Azure/GCP. Returned in report order.
 */
function orderAndCap(kept: KeptVendorItem[], score: (i: VendorItem) => number): KeptVendorItem[] {
  const rank = (i: VendorItem) => VENDOR_SECTIONS.indexOf(vendorSection(i.vendor));
  // Stable: items without a verdict (score -1) keep feed order.
  const byRelevance = [...kept].sort((a, b) => rank(a) - rank(b) || score(b) - score(a));
  const rest = byRelevance.filter((i) => !i.deprecation);
  const picked = new Set([
    ...byRelevance.filter((i) => i.deprecation),
    ...VENDOR_SECTIONS.flatMap((sec) =>
      rest.filter((i) => vendorSection(i.vendor) === sec).slice(0, SECTION_FLOORS[sec]),
    ),
  ]);
  // `rest` is in section order, so the leftover slots fill Databricks first.
  for (const i of rest) if (picked.size < MAX_VENDOR_ITEMS) picked.add(i);
  return byRelevance
    .filter((i) => picked.has(i))
    .sort((a, b) => rank(a) - rank(b) || Number(b.deprecation) - Number(a.deprecation));
}

export async function selectVendorItems(
  items: VendorItem[],
  opts: { apiKey?: string; cache: DataVerdicts | null; dateStr: string; ask?: AskJev },
): Promise<VendorSelection> {
  // Behavior-change bundles are deprecations by definition: no question to ask.
  const judgment = await judgeItems(
    items.filter((i) => i.stage === undefined),
    {
      ...opts,
      tag: "data",
      request: (item) => ({
        state: { title: item.title, description: item.description, source: item.source },
        questions: QUESTIONS,
      }),
      decide: (a: DataAnswers) => dataRelevance(a),
      unseenDays: VERDICT_UNSEEN_DAYS,
    },
  );
  const { verdicts, rankedBy } = judgment;

  const decide = (i: VendorItem): { keep: boolean; deprecation: boolean } =>
    i.stage !== undefined ? { keep: true, deprecation: true } : (verdicts.get(i.id) ?? keywordVerdict(i));
  const kept = items.flatMap((i): KeptVendorItem[] => {
    const d = decide(i);
    // `?.`: dataRelevance does not check this answer, and a hand-added entry may lack it.
    const ai = verdicts.get(i.id)?.answers.ai_in_data?.noul;
    const aiInData = ai === undefined ? aiKeywordHit(`${i.title} ${i.description}`) : ai >= AI_IN_DATA_MIN;
    return d.keep ? [{ ...i, deprecation: d.deprecation, aiInData }] : [];
  });
  const selected = orderAndCap(kept, (i) => verdicts.get(i.id)?.relevance ?? -1);
  console.log(
    `  [data] Kept ${selected.length}/${items.length} vendor items` +
      `${kept.length > selected.length ? ` (${kept.length - selected.length} over the cap)` : ""}` +
      `${rankedBy === "keywords" ? " (no Jev: keyword rules)" : ""}`,
  );

  const keptIds = new Set(kept.map((i) => i.id));
  const selectedIds = new Set(selected.map((i) => i.id));
  const rows = items.map((i) => ({
    id: i.id,
    title: i.title,
    source: i.source,
    kept: selectedIds.has(i.id),
    ...(keptIds.has(i.id) && !selectedIds.has(i.id) ? { overCap: true } : {}),
    deprecation: decide(i).deprecation,
    ...judgment.traceFields(i),
    ...(i.stage !== undefined ? { stage: i.stage } : { keyword: keywordVerdict(i) }),
  }));
  const rankingFile = judgment.rankingFile(rows, { weights: DATA_WEIGHTS });

  return { items: numberRows(selected), rankedBy, nextVerdicts: judgment.nextCache, rankingFile };
}
