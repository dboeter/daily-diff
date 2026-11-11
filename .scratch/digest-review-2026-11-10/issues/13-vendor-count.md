# 13: The data report's "Vendor items" count leaves out the Also new lines

Status: done
Findings: 15 [low], see `../review.md`

## Problem

The 2026-11-10 data report says `Vendor items: 15` in its meta line. Its tables hold 15 vendor rows (Databricks 8, Snowflake 3, Fabric 1, BigQuery 3) and its three `*Also new:*` lines link 5 more, so the page shows 20. The count is `DATA_REPORT.vendorCount(items.length)` (`src/reports/pages.ts:922`), the table rows only (read, not run).

## What to build

- [x] Count the Also new items too, or name them apart ("Vendor items: 15, also new: 5")
- [x] A test with items over the cap

## Comments

- 2026-11-11: the meta line names them apart: `Vendor items: 15 | Also new: 5` (`DATA_REPORT.vendorCount`). Without Also new links the line is unchanged.
