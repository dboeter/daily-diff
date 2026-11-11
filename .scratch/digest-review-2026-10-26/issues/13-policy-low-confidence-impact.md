# 13: Low-confidence impact doesn't drop major policy items

Status: done
Blocked by: 02
Findings: X2 — see `../review.md`

## What to build

A major policy item is not dropped on an impact score the model is unsure of. The DHS order banning DeepSeek from federal civilian systems was the best-scored of 99 policy items (relevance 0.853, significance 1.25) but was dropped on impact 0.48 at confidence 0.28; it reached readers only as a Most discussed row with no summary.

- [x] For items with high significance, a low-confidence impact score counts as unknown, not none
- [x] Such an item lands in the jurisdiction section or News & commentary
- [x] Rerunning the 2026-10-26 policy judgments keeps `us-fr:2026-21447`

## Comments

Built: `policyRelevance` (policy/relevance.ts) lets a US item pass the impact gate when its impact confidence is under 0.4 (`LOW_CONFIDENCE`, the data report's bar) and its significance reaches level 1 with probability 0.5 or more. The topic and relevance gates still apply. Test `ticket 13 replay` covers the saved DHS answers. Replaying every judged item of `digests/2026-10-26/policy-trace.json` changes one decision only: `us-fr:2026-21447`, a non-news Federal Register item, so it renders in the US federal section.
