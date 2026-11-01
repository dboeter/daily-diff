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

### Live check (2026-11-01)

The 11-01 pool rebuilt from `digests/spotted-log.json` (55 fresh stories, live Jev, nothing saved): 55/55 answered, 6 dropped, all correct: the two later video-game stories (repeats of hn:50320255), two Postgres 19 delay stories and the Wall Street selloff story (repeats of stories shown 10-31: hn:50309439, hn:50306008), and devto:4945893 (Open-VSX audit guide, repeat of hn:50300683). The last one needed the criteria to say a guide or checklist prompted by an event is no new development: before, Jev chose `same_event_new_development` (0.67); after, `same_event_no_development` (0.56, confidence 0.34, so borderline). No wrong drop among the 55.

### Review fixes

- The same-day comparison ran before routing and selection, so a story could be dropped as a repeat of one that then showed nowhere. Split in two (`src/spotted/same-event.ts`): `dropShownRepeats` before news matching compares only with stories shown on earlier days, now within `SPOTTED_MAX_AGE_DAYS` (was 2 days); `dropSameDayRepeats` after selection ranks what shows today (project news first, then Spotted and talked-about rows by `rankFresh`), asks each row once against the stories above it, removes a repeat and reruns selection so the next candidate takes the slot and is checked too. Project news is never removed.
- Fingerprint = CST day + 8-char sha1 of the `earlier` list, so a re-run with another ranking asks again (it could drop both copies). The same-day step's verdicts are keyed `<id>#same-day` so the two steps do not overwrite each other's entry.
- Saved verdicts apply without a key or with Jev failing; a story without one is kept.
- Repeats are `repeat: <date>` in the spotted log and skipped by Most discussed, which also skips a story without a topic verdict. `sources.judged` counts topic-routed stories only.
- Tests: `src/__tests__/spotted/same-event.test.ts` (stub Jev answers by the `earlier` list, so ordering matters), `pool.test.ts`. No live Jev run.
