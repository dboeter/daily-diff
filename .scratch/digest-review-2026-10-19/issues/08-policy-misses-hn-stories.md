# Policy Watch misses AI-policy stories that only reach HN or the web

Status: needs-info

## Problem

On 2026-10-19 the biggest AI-policy story of the day, "Anthropic's proposed AI safety bill only kicks in if 50 deaths or $1B in damages" (Tom's Hardware, HN 616 points), was in the discussions report but not in the Policy Watch pool at all (0 of 123 items mention Anthropic). AGENTS.md lists "Jev significance on HN, web and news items" as future work for the `other` jurisdiction.

## Desired behavior

HN stories (and lab web posts) that are about AI policy enter the policy pool as news items, judged by the same Jev questions, with their jurisdiction taken from the story (or `other`).

## Open questions

- Jurisdiction for a non-feed item: ask Jev (a Choice), or default to `other` and its major-only gate.
- Duplicates with Politico/Transformer coverage of the same event.

## Where

`fetchPolicyData` (`src/policy/policy.ts`), `selectPolicyItems` (`src/policy/jev.ts`), `src/sources/hn.ts`.

## Comments

- 2026-10-19: HN only, decided without the maintainer (defaults; revisit). `src/policy/hn.ts` turns HN stories whose title or page description names a policy term into news items with jurisdiction `other` (the major-only gate), `jevOnly`, judged by the same Jev questions; registered in `fetchAllData` over the one shared HN fetch. Open: a Jev Choice for the jurisdiction instead of `other` (a US bill story would then get the impact question), lab web posts as a source, and dedupe against Politico/Transformer coverage.
- 2026-10-19 (follow-up): the premise does not hold. Policy Watch reported the event on 2026-10-18 through Politico US ("Anthropic quietly pitches its own AI safety bill to lawmakers", 2026-10-16, about AI policy 0.99, US impact 1.48); it was absent from the 2026-10-19 pool only because the state had already reported it. The HN source as built would also drop the HN story: an `other` item needs P(level 2) >= 0.5, and Jev gave the same event significance {0: 0.21, 1: 0.77, 2: 0.02}. A Jev jurisdiction Choice would let it through as us_federal, which here would have been a duplicate of the Politico row. Decision for the maintainer: revert `0d642ab` (recommended: no case yet of a story only HN carries), keep it as is, or add the Choice plus a dedupe against recently reported items.
