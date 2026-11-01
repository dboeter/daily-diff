# 11: `data-trace.json` lacks `minor` and the source text

Status: ready-for-agent
Findings: 11 [low], see `../review.md`

## What to build

Trace rows have `ai_in_data, decided, deprecation, id, kept, keyword, rank, real_change, relevance, rendered, significance, source, title`: no `minor` flag (so the no-Highlight decision cannot be traced, see #01/#06) and no description, so vendor summaries cannot be checked without refetching.

- [ ] Kept rows carry `minor: true|false`
- [ ] Rows carry the `vendorText` the summaries call saw (or its first N chars)
