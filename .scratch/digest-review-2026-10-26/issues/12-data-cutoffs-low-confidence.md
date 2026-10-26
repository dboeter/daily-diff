# 12: Low confidence counts as unknown at the data report cutoffs

Status: ready-for-agent
Blocked by: 01
Findings: S6, D4, D13 — see `../review.md`

## What to build

The data report does not drop a significant vendor item because one low-confidence score sits under a cutoff. On 2026-10-26 the Snowflake "Recompact Iceberg table data" behavior change (significance 0.79) was dropped on real_change 0.46, and the Fabric FNTK coding-agent item 0.01 under the cut (significance confidence 0.30), leaving Azure / Fabric & GCP empty while the Snowflake analogue was a Highlight.

- [ ] A score with low confidence is treated as unknown, not as a low value, in the keep decision
- [ ] A high-significance item, or one about a Tracked project, is kept despite a low real_change
- [ ] A section with no kept item shows its best item within a small margin of the cut (or an "Also new" line)
- [ ] Rerunning the 2026-10-26 data judgments keeps the Iceberg note and the Fabric FNTK item
