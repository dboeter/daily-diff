# 10: BigQuery rows show their release stage

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: D2 [medium]; low D3 — see `../review.md`, `../ai-data.md`

## What to build

Every vendor row shows its release stage, from the source. Databricks, Snowflake and Fabric titles carry "(GA)" or "(Preview)"; BigQuery's do not. On 2026-10-28 the BigQuery note said "This feature is generally available (GA)" in its second sentence, but the Item cell holds only the first sentence and the summaries prompt forbids status words, so the row never showed GA; Highlight 3 said "released" and Across platforms said "GA" without either word in its input. On 10-27 the same source rendered "(GA)". The Item cell is also a whole "Feature: …" sentence that the Summary repeats (D3).

- [ ] Code reads the stage from a BigQuery note's body (GA, Preview) and shows it in the Item cell as the other vendors' titles do
- [ ] The Item cell is a short label without the "Feature:" prefix; the Summary adds what the label does not say
- [ ] The prose call sees the stage it may restate
- [ ] A test on the 2026-10-27 Drive note: the row shows GA

## Comments

From the review: `src/data/bigquery.ts:33` (title = `<type>: <first sentence>`); `src/reports/prompts-pages.ts:315` (no status words, on the assumption the title carries them); the prose call gets the rendered rows (`src/reports/pages.ts:774-783`); `vendorTitleLabel` (`src/reports/markdown.ts:574`) strips only dates.
