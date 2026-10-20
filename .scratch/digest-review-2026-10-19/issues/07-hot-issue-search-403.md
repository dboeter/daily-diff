# Hot-issue search hit "API rate limit exceeded for installation"

Status: needs-triage

## Problem

Run 39183625233 (2026-10-19 01:05 UTC): `[duckdb] hot issues fetch failed: GitHub API error 403 … API rate limit exceeded for installation`. DuckDB lost its hot issues for the day. `searchSlot` (`src/core/github.ts`) spaces searches 2.1 s apart, so 30/min should hold; this message is the installation's limit, not the per-minute search one.

## To find out

- Which limit: the response headers (`x-ratelimit-resource`, `x-ratelimit-remaining`) are not logged. Log them on a 403.
- Whether a retry after `x-ratelimit-reset` / `retry-after` would have recovered it (the fetch degrades to no hot issues, by design).
- The weekly run adds ~108 star-history calls and 16 topic searches on top of 22 hot-issue searches.
