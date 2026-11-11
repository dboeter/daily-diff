# 07: Quiet-source warning fires for sources that do fetch

Status: done
Findings: 7 [low], see `../review.md`

## Problem

`zeroSince` in `digests/policy-state.json` is 2026-10-28 for EUR-Lex, European Parliament, Have your say, Congress.gov, Internetconsultatie and EDPB, so `QUIET_SOURCE_WARN_DAYS` (7) fires ~11-03/04. EUR-Lex (1 item), EP (2) and Have your say (2) do fetch, but their items are watchlist items already reported at their current stage, never judged, so they count as quiet: false alarms. Congress.gov is genuinely 0 every day; Digitale Overheid went quiet 11-01.

## Open questions

- Count "fetched ≥ 1" rather than "judged ≥ 1" as not quiet?

## Comments

### Decision (2026-11-01)

A source that fetched ≥ 1 item is not quiet; a failed or empty fetch is.

### Done

Cause: `nextZeroSince` counted judged items, and a watchlist item already reported at its stage is fetched but never judged. Change: it takes the per-source fetch counts (`fetched`); a source with at least 1 item leaves `zeroSince`, a failed (null) or empty fetch stays quiet; the warning reads "no item fetched since". Tests: `quiet sources` and the `fetchPolicyData` observed-state test in `src/__tests__/policy/items.test.ts`.
