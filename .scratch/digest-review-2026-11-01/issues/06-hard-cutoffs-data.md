# 06: Near-bar data items lost to hard cut-offs

Status: needs-triage
Findings: 6 [medium], see `../review.md`

## Problem

- Snowflake "CREATE OR ALTER SECRET, DCM Projects DEFINE SECRET, and environment variables (Preview)": significance 0.99, confidence 0.96, relevance 0.598 (best of the day), classed `minor` because `confidentlyNotable` needs `score >= NOTABLE_LEVEL` (1) (`src/data/relevance.ts:211-212`). Could not be a Highlight.
- Community: `[community] Kept 0/25 posts`; three Snowflake-on-Medium technical posts (audience `snowflake`) cleared `INSIGHT_MIN` 1.2 but failed `confidence >= LOW_CONFIDENCE` (`src/data/community.ts:271-273`):
  - budgets-quotas-and-monitors: 1.56, conf 0.34, p(0/1/2) = 0/0.44/0.56
  - before-you-model-a-single-table: 1.43, conf 0.36, 0/0.57/0.43
  - snowflake-optima-planning: 1.21, conf 0, 0.31/0.18/0.51
  The first two put no weight on "nothing"; low confidence is doubt between "some" and "substantial". The vendor side treats an unsure significance as level 1 instead of dropping.

## Open questions

- Notable as a score threshold below 1 (e.g. 0.9), or round the expectation?
- Community: keep on `p(nothing)` low instead of confidence?
