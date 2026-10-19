/**
 * Policy Watch source: Hacker News stories about AI policy, from the run's one
 * HN fetch (`fetchHnData`, shared with the discussions report). On 2026-10-19
 * the day's biggest AI-policy story ("Anthropic's proposed AI safety bill only
 * kicks in if 50 deaths or $1B in damages", 616 points) reached HN only.
 *
 * Every HN story is about AI already, so a policy-term check on title and page
 * description keeps the Jev calls to the few that may be policy. The items are
 * news from elsewhere (`other`): Jev's about-AI-policy question decides, and
 * `other` keeps only major events. `jevOnly`: without Jev the AI keyword
 * fallback would keep every story.
 */

import type { HnData, HnStory } from "../sources/hn.ts";
import type { PolicyItem } from "./policy.ts";
import type { PolicySource } from "./sources.ts";

/**
 * Whole words, case-insensitive; "Act" alone is case-sensitive ("act on" is not law). No
 * "judge" (LLM-as-a-judge) or "SEC" (seconds).
 */
const POLICY_TERMS =
  /\b(?:bills?|laws?|lawmakers?|legislat\w*|regulat\w*|polic(?:y|ies)|senate|congress|parliament|governments?|governor|white house|executive order|ban(?:s|ned)?|courts?|rulings?|lawsuits?|sues?|sued|ftc|fcc|antitrust|copyright|liability|commission|ministers?|eu|gdpr)\b/i;
const ACT = /\bAct\b/;

const isPolicyStory = (s: HnStory): boolean => {
  const text = `${s.title} ${s.description ?? ""}`;
  return POLICY_TERMS.test(text) || ACT.test(text);
};

export function hnPolicyItems(stories: HnStory[]): PolicyItem[] {
  return stories.filter(isPolicyStory).map((s) => ({
    id: `hn:${s.id}`,
    title: s.title,
    link: s.url,
    published: s.createdAt,
    description: s.description ?? "",
    source: "Hacker News",
    jurisdiction: "other",
    jevOnly: true,
    news: true,
  }));
}

/** A source over the run's HN fetch; a failed fetch fails the source. */
export function hnPolicySource(hn: Promise<HnData>): PolicySource {
  return {
    name: "Hacker News",
    fetch: async () => {
      const data = await hn;
      if (!data.fetchSuccess) throw new Error("the HN fetch failed");
      return hnPolicyItems(data.stories);
    },
  };
}
