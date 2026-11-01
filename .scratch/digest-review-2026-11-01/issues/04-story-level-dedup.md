# 04: One event, one row

Status: needs-triage
Findings: 4 [medium], see `../review.md`

## Problem

Repeats are caught by item id and `linkKey` only (`src/spotted/pool.ts:174-209`, spotted log `shown`).

- Models Spotted 2026-11-01: Mashable (hn:50320255), Tom's Hardware (hn:50315987) and Game Developer (hn:50316635) on Claude blocking game reverse-engineering take 3 of `SPOTTED_PER_SOURCE.hn` = 6 slots, cutting a 75-pt story.
- Agents: the Open-VSX trojanized `anthropic.claude-code` extension led 10-31 (hn:50300683) and led again 11-01 through a Dev.to follow-up (devto:4945893).

## Open questions

- Same-day grouping (one row, other outlets folded in) vs cross-day "already covered" check; Jev same-event judgment vs title-token overlap.
- Should a genuinely new development (a follow-up with new facts) still show?
