# 07: Quiet-source warning fires for sources that do fetch

Status: ready-for-agent
Findings: 7 [low], see `../review.md`

## Problem

`zeroSince` in `digests/policy-state.json` is 2026-10-28 for EUR-Lex, European Parliament, Have your say, Congress.gov, Internetconsultatie and EDPB, so `QUIET_SOURCE_WARN_DAYS` (7) fires ~11-03/04. EUR-Lex (1 item), EP (2) and Have your say (2) do fetch, but their items are watchlist items already reported at their current stage, never judged, so they count as quiet: false alarms. Congress.gov is genuinely 0 every day; Digitale Overheid went quiet 11-01.

## Open questions

- Count "fetched ≥ 1" rather than "judged ≥ 1" as not quiet?

## Comments

### Decision (2026-11-01)

A source that fetched ≥ 1 item is not quiet; a failed or empty fetch is.
