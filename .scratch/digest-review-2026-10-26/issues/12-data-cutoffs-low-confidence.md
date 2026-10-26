# 12: Low confidence counts as unknown at the data report cutoffs

Status: done
Blocked by: 01
Findings: S6, D4, D13 — see `../review.md`

## What to build

The data report does not drop a significant vendor item because one low-confidence score sits under a cutoff. On 2026-10-26 the Snowflake "Recompact Iceberg table data" behavior change (significance 0.79) was dropped on real_change 0.46, and the Fabric FNTK coding-agent item 0.01 under the cut (significance confidence 0.30), leaving Azure / Fabric & GCP empty while the Snowflake analogue was a Highlight.

- [x] A score with low confidence is treated as unknown, not as a low value, in the keep decision
- [x] A high-significance item, or one about a Tracked project, is kept despite a low real_change
- [x] A section with no kept item shows its best item within a small margin of the cut (or an "Also new" line)
- [x] Rerunning the 2026-10-26 data judgments keeps the Iceberg note and the Fabric FNTK item

## Comments

`dataRelevance` (data/relevance.ts) now weighs `significanceLevel`: Jev's score, or level 1 ("Notable") when its confidence is under 0.4. An item about a Tracked data project (`tracked`: its title or description matches a `databricks`/`snowflake`/`data_stack` repo's matcher, passed from `fetchVendorData`) or at least "Notable" is kept on a real change of 0.4 or more. A section with no kept item takes its best Jev-judged item within 0.05 of the keep bar (`NEAR_CUT_MARGIN`). Replay on the saved 10-26 answers: the Recompact Iceberg note (real change 0.46) is kept through Apache Iceberg's "iceberg table" keyword, and Fabric FNTK (significance 0.53 at confidence 0.30) reaches relevance 0.584 (test `ticket 12 replay`). The exemption bar is 0.4, not 0.3: at 0.3 Jev thinks a note is 70% likely no change at all (an existing test held that line). The `minor` flag (ticket 04) uses the same level.
