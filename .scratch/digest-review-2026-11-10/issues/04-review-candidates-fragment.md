# 04: The review marks BigQuery notes as shown that the report does not link

Status: done
Findings: 8 [medium], see `../review.md`

## Problem

On 2026-11-08 two BigQuery candidates (`#November_05_2026`, `#November_03_2026`) had status `shown` while the report's only BigQuery link was `#November_06_2026`. Cause (read, not run): `key()` in `~/daily-diff-review/scripts/candidates.py` builds the match key from host, path and query and drops the fragment, and every BigQuery note links the same release-notes page. The same holds for Databricks notes on one page (`…/whats-coming#…`), so an `excluded` note can read as `shown`.

Lives in the review repo, not here.

## What to build

- [x] `key()` keeps the fragment
- [x] Check one day's tagged candidates: the BigQuery and Databricks notes not linked are `excluded`

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: two BigQuery notes on 11-09 and six candidates on 11-10 read as `shown` without a link in the report: one Unity Gateway note, three Lakeflow Designer notes and the two BigQuery notes. The Databricks notes confirm the second half of the cause above.
- 2026-11-11: fixed in `~/daily-diff-review` (commit 51c74e5). Tagged 11-08, 11-09 and 11-10 with the old and the new key: 5, 5 and 7 items change, all vendor notes and no story. On 11-10 the Unity Gateway note and the three Lakeflow Designer notes go from `shown` to `excluded`, and the two BigQuery notes from `shown` to `shown-earlier`.
