# 13: Low-confidence impact doesn't drop major policy items

Status: ready-for-agent
Blocked by: 02
Findings: X2 — see `../review.md`

## What to build

A major policy item is not dropped on an impact score the model is unsure of. The DHS order banning DeepSeek from federal civilian systems was the best-scored of 99 policy items (relevance 0.853, significance 1.25) but was dropped on impact 0.48 at confidence 0.28; it reached readers only as a Most discussed row with no summary.

- [ ] For items with high significance, a low-confidence impact score counts as unknown, not none
- [ ] Such an item lands in the jurisdiction section or News & commentary
- [ ] Rerunning the 2026-10-26 policy judgments keeps `us-fr:2026-21447`
