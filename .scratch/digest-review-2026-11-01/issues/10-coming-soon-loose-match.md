# 10: `shippedComingSoon` matches too loosely; its count is inflated

Status: needs-triage
Findings: 10 [low], see `../review.md`

## Problem

`[data] 5 notes ship a reported coming-soon note, skipped`. Reproduced against the previous data state: four GA notes already reported, plus "AI Runtime is now in Public Preview" (2026-03-19). Coming-soon titles like "X will soon be available by default for workspaces with the compliance security profile…" are cut by `STATUS_RE` to the bare feature name, so any later note on that feature matches; the GA notes predate their coming-soon notes. The count is logged before the reported and age filters. No reader lost anything on 11-01. Code: `src/data/vendors.ts:172-203` (`titleStem`, `shippedComingSoon`).
