/**
 * The story security question: whether a fresh community story is a security event,
 * and for a flagged one its kind, severity and who makes the claim, through `judgeItems`,
 * cached in `digests/security-verdicts.json` and traced in `security-trace.json`. A flagged
 * story carries the 🔓 marker on the pages; the banner is not built yet
 * (`.scratch/security-section/spec.md`).
 *
 * The questions and the bars are the spike's (`spike/results.md`, 2026-11-11):
 * its counts hold only for this wording and this state, so change them together
 * or replay first.
 */

import path from "node:path";
import {
  judgeItems,
  type DroppedReason,
  loadItemsFile,
  saveItemsFile,
  type AskJev,
  type ChoiceAnswer,
  type RankedBy,
  type VerdictCache,
} from "../core/jev.ts";
import { siteOf, type Story } from "../spotted/pool.ts";

const SCOPE = "an AI tool, an AI model provider or AI service, or a data platform or data tool";

export const SECURITY_QUESTIONS = {
  is_security: {
    type: "noul",
    instructions:
      "Does the story described by `title` (and `description` when present), linked from `site`, " +
      `report a specific security or privacy event that concerns ${SCOPE}?`,
    criteria: {
      true:
        "It reports a breach, hack, leak or exposure of data, secrets or personal data; a malicious " +
        "or compromised package or extension; a concrete vulnerability or exploit in a named product; " +
        "or a patch, postmortem or vendor statement about such an event",
      false:
        "Anything else: a research paper or general essay on a class of attack; a new security tool, " +
        "scanner or sandbox; AI safety, misuse, moderation, policy or law; security news about " +
        "something that is not AI or data tooling; an ordinary bug, outage, release or opinion",
    },
  },
  kind: {
    type: "choice",
    instructions: "What kind of story is described by `title` (and `description` when present)?",
    criteria: {
      incident: {
        what: "A security or privacy incident that happened in a named product or service",
        examples: [
          "a provider was hacked and customer data exposed",
          "a malicious extension was published under a tool's name",
          "a tool sent users' personal data to third parties",
        ],
      },
      vulnerability: {
        what: "A concrete flaw or exploit in a named product, with no breach reported",
        examples: [
          "a prompt injection that makes a named agent leak tokens",
          "a sandbox escape in a named tool",
        ],
      },
      fix: {
        what: "A patch, postmortem, vendor statement or remediation guide for an incident or vulnerability",
        examples: ["a postmortem on a compromised extension", "a release that closes a reported leak"],
      },
      none: {
        what: "Not a specific security or privacy event in a named product",
        examples: [
          "a model release",
          "a research paper on attacks",
          "a new security scanner",
          "an essay on AI safety",
          "a policy story",
        ],
      },
    },
  },
  severity: {
    type: "score",
    instructions:
      "Suppose the story described by `title` and `description` is a security or privacy event. " +
      "How much does it ask of the people who use the product or service it names?",
    criteria: [
      {
        what: "Nothing: not a security or privacy event, or one with no effect on users",
        examples: ["a model release", "a theoretical attack on no named product"],
      },
      {
        what: "Worth knowing: a real flaw or exposure, limited in reach or already closed, no action needed now",
        examples: ["a fixed bug that leaked a setting", "a vulnerability that needs unusual conditions"],
      },
      {
        what: "Act now: users should update, uninstall or rotate credentials, or data of many users was exposed",
        examples: [
          "a backdoored release of a popular extension",
          "a breach that exposed customer data",
          "a tool that sends account details to every site it visits",
        ],
      },
    ],
  },
  claim_by: {
    type: "choice",
    instructions: "Who stands behind the claim in the story described by `title`, `description` and `site`?",
    criteria: {
      vendor_or_researcher: {
        what: "The affected vendor itself or a security firm or researcher publishing its own findings",
        examples: ["a vendor postmortem", "a security firm's write-up of a backdoor it found"],
      },
      press: {
        what: "A news outlet reporting the event",
        examples: ["a Bloomberg or Forbes article on a breach"],
      },
      individual: {
        what: "One user's report, forum post or blog post, not confirmed by anyone else in the text",
        examples: ["a Tell HN post", "a GitHub issue by one user", "a personal blog's allegation"],
      },
      unclear: { what: "The text does not show who makes the claim, or there is no claim" },
    },
  },
};

type ClaimBy = keyof typeof SECURITY_QUESTIONS.claim_by.criteria;

const { is_security: _flagQuestion, ...detailQuestions } = SECURITY_QUESTIONS;
/** Asked of every story. Alone it costs about 490 tokens a story, all four about 1,370 (2026-11-14). */
const FLAG_QUESTIONS = { is_security: _flagQuestion };
/**
 * Asked of a flagged story only, about 1,170 tokens. Jev answers each question on its own: asked apart,
 * the flag (0.95/0.94, 0.03/0.03) and these (severity 1.98/1.98, 0.95/0.91, 1.92/1.92, same kind and
 * claim) matched the spike's answers to all four (2026-11-14).
 */
const DETAIL_QUESTIONS = detailQuestions;

export interface FlagAnswers {
  is_security: { noul: number };
}

export interface DetailAnswers {
  kind: ChoiceAnswer;
  /** Probability-weighted level, 0–2. */
  severity: { score: number; confidence?: number };
  claim_by: ChoiceAnswer;
}

/** Spike: 15 of 17 true stories found, 5 false hits of 363 (all security news outside the scope). */
export const FLAG_MIN = 0.6;
/** Spike: with the claim rule, 5 events in 13 days; severity alone does not separate (12 of 15 flagged score ≥ 1.6). */
export const BANNER_MIN_SEVERITY = 1.5;
/**
 * One person's claim is never a banner, however many points it has (maintainer, 2026-11-13: points
 * say a story is popular, not true). The Claude Code email leak (severity 1.92) was a GitHub issue.
 */
const BANNER_CLAIMS: ReadonlySet<ClaimBy> = new Set(["vendor_or_researcher", "press"]);

export interface SecurityDecision {
  flagged: boolean;
  /**
   * Banner-grade: flagged, severe, and claimed by the vendor, a researcher or the press. Null when a
   * flagged story's detail answers are missing (its call failed), so a missed banner reads apart from "no".
   */
  banner: boolean | null;
  /**
   * The claim is the vendor's, a researcher's or the press's. Null when the detail answers are missing
   * (not flagged, or its call failed); anything but true shows as not confirmed (`SECURITY.unconfirmed`).
   */
  confirmed: boolean | null;
}

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const unexpected = (a: unknown): never => {
  throw new Error(`Unexpected Jev answers: ${JSON.stringify(a)}`);
};

/** Throws on an unexpected shape, so a new call counts as failed and a saved entry is asked again. */
export function flagDecision(a: FlagAnswers): { flagged: boolean } {
  if (!isNumber(a?.is_security?.noul)) unexpected(a);
  return { flagged: a.is_security.noul >= FLAG_MIN };
}

/** Whether a flagged story is banner-grade; throws on an unexpected shape. */
export function detailDecision(a: DetailAnswers): { banner: boolean; confirmed: boolean } {
  const kind = a?.kind?.choice;
  const claim = a?.claim_by?.choice;
  if (
    !isNumber(a?.severity?.score) ||
    typeof kind !== "string" ||
    !Object.hasOwn(SECURITY_QUESTIONS.kind.criteria, kind) ||
    typeof claim !== "string" ||
    !Object.hasOwn(SECURITY_QUESTIONS.claim_by.criteria, claim)
  ) {
    unexpected(a);
  }
  const confirmed = BANNER_CLAIMS.has(claim as ClaimBy);
  return { banner: a.severity.score >= BANNER_MIN_SEVERITY && confirmed, confirmed };
}

/** One file for both stages: a story's flag under its id, its other answers under `<id>#detail`. */
export type SecurityVerdicts = VerdictCache<FlagAnswers | DetailAnswers>;

export const SECURITY_VERDICTS_FILE = path.join("digests", "security-verdicts.json");
const SECURITY_UNSEEN_DAYS = 30;
const detailId = (story: Story): string => `${story.id}#detail`;

/** Missing file → empty cache. Unreadable or malformed → null: every story is asked and nothing is saved. */
export function loadSecurityVerdicts(file = SECURITY_VERDICTS_FILE): SecurityVerdicts | null {
  return loadItemsFile(file, "security");
}

export function saveSecurityVerdicts(cache: SecurityVerdicts, file = SECURITY_VERDICTS_FILE): void {
  saveItemsFile(cache, file);
}

/** The spike's state: title, description when present, site. */
function securityState(story: Story): object {
  return {
    title: story.title,
    ...(story.description ? { description: story.description } : {}),
    site: siteOf(story.url),
  };
}

export interface SecurityJudgment {
  /** Each story Jev decided (saved verdicts included); a flagged story whose detail call failed has `banner: null`. */
  decisions: Map<string, SecurityDecision>;
  /** "keywords" when the flag stage fell back: then nothing new is flagged (no keyword rule exists). */
  rankedBy: RankedBy;
  nextCache: SecurityVerdicts | null;
  /** The flag's answers and `decided`, then a flagged story's other answers and their `detail_decided`. */
  traceFields(story: Story): Record<string, unknown>;
  traceFile(rows: object[], header: Record<string, unknown>): string;
}

/**
 * Two stages through `judgeItems`, one cache: the flag question for every story not in the cache,
 * then the kind, severity and claim questions for each flagged story without them. No fingerprint:
 * a story's text flips between filled and empty when its page fetch fails (11 of 103 stories seen on
 * two days or more, 2026-11-07 to 11-10, none from empty to filled), so a text hash would only ask
 * again. Without a key, or when more than half the new calls fail, nothing new is flagged: there is no
 * keyword fallback, since the spike found keywords cannot tell a security event ("60k former agents
 * revealed").
 */
export async function judgeSecurityStories(
  stories: Story[],
  opts: { apiKey?: string; cache: SecurityVerdicts | null; dateStr: string; ask?: AskJev },
): Promise<SecurityJudgment> {
  const flag = await judgeItems(stories, {
    ...opts,
    cache: opts.cache as VerdictCache<FlagAnswers> | null,
    tag: "security",
    request: (story) => ({ state: securityState(story), questions: FLAG_QUESTIONS }),
    decide: (a: FlagAnswers) => flagDecision(a),
    unseenDays: SECURITY_UNSEEN_DAYS,
  });
  const flagged = stories.filter((s) => flag.verdicts.get(s.id)?.flagged);
  const asDetail = (s: Story): Story => ({ ...s, id: detailId(s) });
  const detail = await judgeItems(flagged.map(asDetail), {
    ...opts,
    cache: flag.nextCache as VerdictCache<DetailAnswers> | null,
    tag: "security",
    request: (story) => ({ state: securityState(story), questions: DETAIL_QUESTIONS }),
    decide: (a: DetailAnswers) => detailDecision(a),
    unseenDays: SECURITY_UNSEEN_DAYS,
  });
  const decisions = new Map<string, SecurityDecision>();
  for (const s of stories) {
    const f = flag.verdicts.get(s.id);
    if (!f) continue;
    const d = f.flagged ? detail.verdicts.get(detailId(s)) : undefined;
    decisions.set(s.id, {
      flagged: f.flagged,
      banner: f.flagged ? (d?.banner ?? null) : false,
      confirmed: d?.confirmed ?? null,
    });
  }
  const decided = [...decisions.values()];
  console.log(
    `  [security] ${stories.length} stories: ${decided.filter((d) => d.flagged).length} flagged, ` +
      `${decided.filter((d) => d.banner).length} banner-grade` +
      (flag.rankedBy === "jev"
        ? ""
        : ` from saved verdicts only (${opts.apiKey ? "too many Jev failures" : "no TYPESAFE_API_KEY"})`),
  );
  return {
    decisions,
    rankedBy: flag.rankedBy,
    nextCache: detail.nextCache as SecurityVerdicts | null,
    traceFields(story) {
      const { relevance: _r, ...f } = flag.traceFields(story);
      if (!decisions.get(story.id)?.flagged) return f;
      const { relevance: _d, decided, ...d } = detail.traceFields(asDetail(story));
      return { ...f, ...d, detail_decided: decided };
    },
    // The flag stage's models and rankedBy head the file; the detail stage's fallback is its own key.
    traceFile: (rows, header) => flag.traceFile(rows, { detail_rankedBy: detail.rankedBy, ...header }),
  };
}

/** Where a story went today: its project's News, a listed lab post, a Spotted row or the Overview's lists. */
export type Placement = "news" | "lab" | "spotted" | "talked_about";

/**
 * `digests/YYYY-MM-DD/security-trace.json`: every judged story with `flagged`, `banner`, `confirmed`,
 * its answers, where today's selection placed it (`placed`) and whether a published page
 * showed it (`shown`). A story placed nowhere gets the reason (`dropped_reason`: Spotted's
 * `cap`, `threshold` or `routing`, or `repeat`; null when it has none), so a flagged story
 * lost to selection reads apart from one a same-event check removed. The header counts the
 * flagged and banner-grade stories.
 */
export function securityTraceFile(
  stories: Story[],
  judgment: SecurityJudgment,
  placed: Map<string, Placement>,
  shownIds: Set<string>,
  dropped: Map<string, DroppedReason>,
): string {
  const rows = stories.map((s) => {
    const v = judgment.decisions.get(s.id);
    return {
      id: s.id,
      title: s.title,
      source: s.source,
      flagged: v?.flagged ?? null,
      banner: v?.banner ?? null,
      confirmed: v?.confirmed ?? null,
      placed: placed.get(s.id) ?? null,
      ...(placed.has(s.id) ? {} : { dropped_reason: dropped.get(s.id) ?? null }),
      shown: shownIds.has(s.id),
      ...judgment.traceFields(s),
    };
  });
  const decided = [...judgment.decisions.values()];
  return judgment.traceFile(rows, {
    flag_min: FLAG_MIN,
    banner_min_severity: BANNER_MIN_SEVERITY,
    flagged: decided.filter((d) => d.flagged).length,
    banner: decided.filter((d) => d.banner).length,
  });
}
