# 11: `data-trace.json` lacks `minor` and the source text

Status: done
Findings: 11 [low], see `../review.md`

## What to build

Trace rows have `ai_in_data, decided, deprecation, id, kept, keyword, rank, real_change, relevance, rendered, significance, source, title`: no `minor` flag (so the no-Highlight decision cannot be traced, see #01/#06) and no description, so vendor summaries cannot be checked without refetching.

- [x] Kept rows carry `minor: true|false`
- [x] Rows carry the `vendorText` the summaries call saw (or its first N chars)

## Comments

### Done (2026-11-01)

`selectVendorItems` trace rows: a kept item gets `minor` (true/false), a shown one `text` (its `description`, what the summaries call sees). AGENTS.md trace paragraph updated. Test in `relevance.test.ts`.
