# 04: The review marks BigQuery notes as shown that the report does not link

Status: ready-for-agent
Findings: 8 [medium], see `../review.md`

## Problem

On 2026-11-08 two BigQuery candidates (`#November_05_2026`, `#November_03_2026`) had status `shown` while the report's only BigQuery link was `#November_06_2026`. Cause (read, not run): `key()` in `~/daily-diff-review/scripts/candidates.py` builds the match key from host, path and query and drops the fragment, and every BigQuery note links the same release-notes page. The same holds for Databricks notes on one page (`…/whats-coming#…`), so an `excluded` note can read as `shown`.

Lives in the review repo, not here.

## What to build

- [ ] `key()` keeps the fragment
- [ ] Check one day's tagged candidates: the BigQuery and Databricks notes not linked are `excluded`

## Comments
