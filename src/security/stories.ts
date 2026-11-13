/**
 * The story security question: four Jev answers per fresh community story,
 * through `judgeItems`, cached in `digests/security-verdicts.json`. Nothing is
 * shown yet (`.scratch/security-section/spec.md`, order of work step 3): the
 * decisions go into `security-trace.json` only, so a week of runs can be
 * checked by hand before the marker and the banner are built.
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
  type Judgment,
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

export interface SecurityAnswers {
  is_security: { noul: number };
  kind: ChoiceAnswer;
  /** Probability-weighted level, 0–2. */
  severity: { score: number; confidence?: number };
  claim_by: ChoiceAnswer;
}

/** Spike: 15 of 17 true stories found, 5 false hits of 363 (all security news outside the scope). */
export const FLAG_MIN = 0.6;
/** Spike: with the claim rule, 5 events in 13 days; severity alone does not separate (12 of 15 flagged score ≥ 1.6). */
export const BANNER_MIN_SEVERITY = 1.5;
/** One user's report is left out: the Claude Code email leak (severity 1.92) was a GitHub issue. */
const BANNER_CLAIMS: ReadonlySet<ClaimBy> = new Set(["vendor_or_researcher", "press"]);

export interface SecurityDecision {
  flagged: boolean;
  /** Banner-grade: flagged, severe, and claimed by the vendor, a researcher or the press. */
  banner: boolean;
}

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Throws on an unexpected shape, so a new call counts as failed and a saved entry is asked again. */
export function securityDecision(a: SecurityAnswers): SecurityDecision {
  const kind = a?.kind?.choice;
  const claim = a?.claim_by?.choice;
  if (
    !isNumber(a?.is_security?.noul) ||
    !isNumber(a?.severity?.score) ||
    typeof kind !== "string" ||
    !Object.hasOwn(SECURITY_QUESTIONS.kind.criteria, kind) ||
    typeof claim !== "string" ||
    !Object.hasOwn(SECURITY_QUESTIONS.claim_by.criteria, claim)
  ) {
    throw new Error(`Unexpected Jev answers: ${JSON.stringify(a)}`);
  }
  const flagged = a.is_security.noul >= FLAG_MIN;
  return {
    flagged,
    banner: flagged && a.severity.score >= BANNER_MIN_SEVERITY && BANNER_CLAIMS.has(claim as ClaimBy),
  };
}

export type SecurityVerdicts = VerdictCache<SecurityAnswers>;
export type SecurityJudgment = Judgment<Story, SecurityAnswers, SecurityDecision>;

export const SECURITY_VERDICTS_FILE = path.join("digests", "security-verdicts.json");
const SECURITY_UNSEEN_DAYS = 30;

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

/**
 * One Jev request per story not in the cache. No fingerprint: a story's text flips between
 * filled and empty when its page fetch fails (11 of 103 stories seen on two days or more,
 * 2026-11-07 to 11-10, none from empty to filled), so a text hash would only ask again. Without a key, or when more than half
 * the new calls fail, nothing is flagged: there is no keyword fallback, since the
 * spike found keywords cannot tell a security event ("60k former agents revealed").
 */
export async function judgeSecurityStories(
  stories: Story[],
  opts: { apiKey?: string; cache: SecurityVerdicts | null; dateStr: string; ask?: AskJev },
): Promise<SecurityJudgment> {
  const judgment = await judgeItems(stories, {
    ...opts,
    tag: "security",
    request: (story) => ({ state: securityState(story), questions: SECURITY_QUESTIONS }),
    decide: (a: SecurityAnswers) => securityDecision(a),
    unseenDays: SECURITY_UNSEEN_DAYS,
  });
  const decided = [...judgment.verdicts.values()];
  console.log(
    `  [security] ${stories.length} stories: ${decided.filter((d) => d.flagged).length} flagged, ` +
      `${decided.filter((d) => d.banner).length} banner-grade` +
      (judgment.rankedBy === "jev"
        ? ""
        : ` from saved verdicts only (${opts.apiKey ? "too many Jev failures" : "no TYPESAFE_API_KEY"})`),
  );
  return judgment;
}

/** Where a story went today: its project's News, a listed lab post, a Spotted row or the Overview's lists. */
export type Placement = "news" | "lab" | "spotted" | "talked_about";

/**
 * `digests/YYYY-MM-DD/security-trace.json`: every judged story with `flagged`, `banner`,
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
    const v = judgment.verdicts.get(s.id);
    return {
      id: s.id,
      title: s.title,
      source: s.source,
      flagged: v?.flagged ?? null,
      banner: v?.banner ?? null,
      placed: placed.get(s.id) ?? null,
      ...(placed.has(s.id) ? {} : { dropped_reason: dropped.get(s.id) ?? null }),
      shown: shownIds.has(s.id),
      ...judgment.traceFields(s),
    };
  });
  const decided = [...judgment.verdicts.values()];
  return judgment.traceFile(rows, {
    flag_min: FLAG_MIN,
    banner_min_severity: BANNER_MIN_SEVERITY,
    flagged: decided.filter((d) => d.flagged).length,
    banner: decided.filter((d) => d.banner).length,
  });
}
