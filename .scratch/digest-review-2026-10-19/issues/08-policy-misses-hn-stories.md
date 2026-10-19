# Policy Watch misses AI-policy stories that only reach HN or the web

Status: needs-triage

## Problem

On 2026-10-19 the biggest AI-policy story of the day, "Anthropic's proposed AI safety bill only kicks in if 50 deaths or $1B in damages" (Tom's Hardware, HN 616 points), was in the discussions report but not in the Policy Watch pool at all (0 of 123 items mention Anthropic). AGENTS.md lists "Jev significance on HN, web and news items" as future work for the `other` jurisdiction.

## Desired behavior

HN stories (and lab web posts) that are about AI policy enter the policy pool as news items, judged by the same Jev questions, with their jurisdiction taken from the story (or `other`).

## Open questions

- Jurisdiction for a non-feed item: ask Jev (a Choice), or default to `other` and its major-only gate.
- Duplicates with Politico/Transformer coverage of the same event.

## Where

`fetchPolicyData` (`src/policy/policy.ts`), `selectPolicyItems` (`src/policy/jev.ts`), `src/sources/hn.ts`.
