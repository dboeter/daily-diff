# 10: `shippedComingSoon` matches too loosely; its count is inflated

Status: done
Findings: 10 [low], see `../review.md`

## Problem

`[data] 5 notes ship a reported coming-soon note, skipped`. Reproduced against the previous data state: four GA notes already reported, plus "AI Runtime is now in Public Preview" (2026-03-19). Coming-soon titles like "X will soon be available by default for workspaces with the compliance security profile…" are cut by `STATUS_RE` to the bare feature name, so any later note on that feature matches; the GA notes predate their coming-soon notes. The count is logged before the reported and age filters. No reader lost anything on 11-01. Code: `src/data/vendors.ts:172-203` (`titleStem`, `shippedComingSoon`).

## Comments

### Decision (2026-11-01)

Tighten the match (a shipped note must not predate its coming-soon note; the CSP-default stem must not match any note on the feature) and log the count after the reported and age filters.

### Done

Cause: `STATUS_RE` cut "X will soon be available by default for workspaces with the compliance security profile" to the bare feature, the match ignored dates, and the count was logged before the age and reported filters. Change (`src/data/vendors.ts`): `titleStem` keeps a "for workspaces with …" scope; a note dated before its coming-soon note does not match; the skip count is taken after `recentVendorItems` and `newItems`. Tests (`src/__tests__/data/vendors.test.ts`): a GA note dated before its coming-soon note is reported; a CSP coming-soon note skips only its CSP note, not "AI Runtime is now in Public Preview".

### Review fixes

- `titleStem` appended a "for workspaces with …" scope that came before the status words a second time (it was still in the stem). Now it appends the scope only when the status strip cut it off. Test in `src/__tests__/data/vendors.test.ts`. Also `src/__tests__/data/relevance.test.ts`: an unsure significance of 0.95 at confidence 0.2 is still `minor`.

### Code review follow-up (2026-11-01)

`SCOPE_RE` keeps any "for|in|on …" clause after the status words (not a stage such as "in Public Preview"), so a region- or account-scoped coming-soon note matches only a note with the same scope. On the current data state every reported coming-soon note is a compliance-security-profile rollout, so none now pairs with a feature's general GA note. Test in `vendors.test.ts`.
