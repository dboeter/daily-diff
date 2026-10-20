# Hot-issue search hit "API rate limit exceeded for installation"

Status: needs-info

## Problem

Run 39183625233 (2026-10-19 01:05 UTC): `[duckdb] hot issues fetch failed: GitHub API error 403 … API rate limit exceeded for installation`. DuckDB lost its hot issues for the day. `searchSlot` (`src/core/github.ts`) spaces searches 2.1 s apart, so 30/min should hold; this message is the installation's limit, not the per-minute search one.

## To find out

- Which limit: the response headers (`x-ratelimit-resource`, `x-ratelimit-remaining`) are not logged. Log them on a 403.
- Whether a retry after `x-ratelimit-reset` / `retry-after` would have recovered it (the fetch degrades to no hot issues, by design).
- The weekly run adds ~108 star-history calls and 16 topic searches on top of 22 hot-issue searches.

## Comments

- 2026-10-19: logging only. `githubGet` now appends `[rate limit: resource …, remaining …, reset <ISO>, retry-after …]` to the error of a 403/429, so the next failure names the limit. No retry yet: `githubGet` retries only dropped connections, and a core-limit reset can be an hour out. Next step once a log line exists: if it is `search` with a reset under a minute, wait for it once in `searchSlot`; if it is `core`, the weekly star-history calls are the budget to cut.
