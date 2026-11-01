# 04: One event, one row

Status: done
Findings: 4 [medium], see `../review.md`

## Problem

Repeats are caught by item id and `linkKey` only (`src/spotted/pool.ts:174-209`, spotted log `shown`).

- Models Spotted 2026-11-01: Mashable (hn:50320255), Tom's Hardware (hn:50315987) and Game Developer (hn:50316635) on Claude blocking game reverse-engineering take 3 of `SPOTTED_PER_SOURCE.hn` = 6 slots, cutting a 75-pt story.
- Agents: the Open-VSX trojanized `anthropic.claude-code` extension led 10-31 (hn:50300683) and led again 11-01 through a Dev.to follow-up (devto:4945893).

## Open questions

- Same-day grouping (one row, other outlets folded in) vs cross-day "already covered" check; Jev same-event judgment vs title-token overlap.
- Should a genuinely new development (a follow-up with new facts) still show?

## Comments

### Decision (2026-11-01)

Jev same-event check: a fresh story that reports the same event as a higher-ranked story today or a story shown in the last 2 days, with no new development, is dropped as `repeat`. Runs before news matching, so it covers project news too. Cached in a verdict file.

### Done

Cause: repeats were caught by item id and `linkKey` only, so another outlet's article on the same event, or a follow-up of a story shown the day before, was fresh. Now `dropSameEventRepeats` (`src/spotted/same-event.ts`) ranks the fresh stories (source order, then points) and asks Jev per story, against the titles of the stories shown in the last 2 days and the fresh ones ranked above it (own-link copies left out), whether it reports the same event without a new development; such a story leaves the pool before `matchProjectNews` (`src/index.ts`) and is `repeat` in `spotted-trace.json`. Cache `digests/same-event-verdicts.json`, fingerprint = the CST day, pruned after 30 days; without a verdict nothing is dropped. AGENTS.md: phase 2, caches table, Spotted section, trace `repeat`, `talked-about.json` row (issue 05). Tests: `src/__tests__/spotted/same-event.test.ts` on a fixture frozen from 2026-11-01 (stubbed Jev: verifies wiring and ordering, not Jev's judgment). No live Jev run.
