# 01: Codex's releases reach the agents page

Status: done
Blocked by: None (can start immediately)
Findings: A3 [high] — see `../review.md`, `../ai-agents.md`

## What to build

A tracked project with a release in the window shows it, whatever its asset count. OpenAI Codex was "Unavailable today" on 2026-10-24, 10-26, 10-27 and 10-28, so its stable rust-v0.165.0 (2026-10-27) never reached a page. `/repos/openai/codex/releases?per_page=100` makes GitHub serialize ~13,000 asset records and fails at ~11 s (504, or a 200 with truncated JSON); `per_page=10` answers in 4.9 s, `releases/latest` in 0.6 s.

- [x] The releases fetch pages in small pages (10–30) until a release is older than the window, so Codex's request answers within GitHub's limit
- [x] `githubGet` retries a 5xx (502/503/504) with backoff, as it does a dropped connection, and every request has a timeout
- [x] `noStableYet` still answers correctly for a repo with no stable release and for Codex (~86 alphas per 100 releases); it no longer depends on a page of 100
- [x] Tests: a 504 then 200 is retried and succeeds; a truncated body is retried, not parsed; `noStableYet` on a short history and on a long prerelease-only page
- [ ] A live run shows Codex as active or quiet, not Unavailable (not run: no network in this node; check the next CI run's `[codex] releases:` line)

## Comments

From the review: `githubGet` (`src/core/github.ts:114-136`) retries only a `TypeError`, so a `GitHubApiError` 504 fails on the first try, and its raw `fetch` has no timeout (`fetchOk` has one). `RELEASES_PAGE = 100` (`:162`); the `noStableYet` comment at `:167-171` explains why a page of 100 was chosen. Paging costs core calls: keep the worst-case budget in AGENTS.md's hot-issues paragraph (547 core calls per daily run against 1,000/h) true, or update it.

### Done (2026-10-28)

**Cause:** `fetchRecentReleases` asked for one page of 100 releases; with ~130 assets per Codex release GitHub cannot build that page within its ~10 s limit and answers 504 or a truncated 200. `githubGet` retried only a `TypeError`, so the 504 (and the `SyntaxError` of a truncated body) failed the fetch on the first try, and the project read as Unavailable.

**Changed** (`src/core/github.ts`):

- `fetchRecentReleases`: pages of `RELEASES_PAGE = 10` (measured safe; 20–30 would near the limit at ~0.4 s per Codex release), at most `RELEASES_MAX_PAGES = 5` (50 releases). It stops at the first page whose last release is older than `since` once a stable release has been seen, or at a short page (history read). `noStableYet` = the whole history was read and none of it is stable; a prerelease-only read that hit the cap reads as false, as a full page of 100 did before. Hitting the cap logs `[github] <repo> releases: stopped at 5 pages`. `RecentReleases`' shape is unchanged, so `fetchProject` in `src/index.ts` needs no change.
- `githubGet`: retries `isRetryable` failures on the existing ladder (2 retries, 2 s then 4 s): `TypeError`, `SyntaxError` (truncated body), a `TimeoutError` abort, and `GitHubApiError` 502/503/504. Every attempt has `signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)` (30 s, from `src/core/http.ts`), which also covers reading the body. Other statuses still fail at once (callers rely on `status`, e.g. the star-history 403/422/429 stop).

**Tests** (`src/__tests__/core/github.test.ts`, `fetchRecentReleases` describe): a 504 then 200 is retried and succeeds; a truncated 200 body is retried, not parsed; every request carries an abort signal; paging in pages of 10 stops at the first page ending before the window; a short prerelease-only history read over several pages is `noStableYet`; Codex's stable release behind 25 alphas past the window is found (3 pages, `noStableYet` false); a long prerelease-only history stops at the 5-page cap, reads false and logs. The `respond` helper now serves the history by `page`/`per_page`. The `fetchHotIssues` mock's `"fail"` answer moved from 502 to 404, since a 502 is now retried. `pnpm test` (1044 passed), `pnpm typecheck`, `pnpm lint` and `pnpm format` pass.

**Docs:** AGENTS.md, AI Agents → Hot issues: "Worst case per daily run: 33 repos × 8 list pages + 250 count calls + 33 release lists = 547 core calls" → "Worst case per daily run: 33 repos × 8 list pages + 250 count calls + 33 repos × 5 release pages (10 releases a page, `RELEASES_MAX_PAGES`) = 679 core calls, retries of a 5xx, a truncated body or a timeout (at most 2 per request) on top". The "normal day lists one page for most repos" sentence stays true for releases too (one page unless a repo has 10+ releases in the window or a prerelease-only first page). Worth adding to the AI Agents "Releases, hot issues and news only" bullet: "Releases are read 10 a page (Codex's ~130 assets per release make a page of 100 fail at GitHub's ~10 s limit), until a page ends before the window and a stable release has been seen, at most 5 pages; `githubGet` retries a 502/503/504, a truncated body and its 30 s timeout like a dropped connection."

### Fix round (code review)

- Timeouts (`src/core/github.ts`): `ensureLabel`, `createGitHubIssue` and the issue-closing PATCH in `closeSupersededIssues` now pass `signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)`, as `githubGet` does, so every GitHub request has a timeout. They are not retried, as before.
- `isRetryableGet`'s comment cut from four sentences to one.
- Tests: `github.test.ts` › `closeSupersededIssues` › "gives every write request a timeout": the PATCH, the label POST and the issue POST each carry an `AbortSignal`. `pnpm test` (1109 passed), `pnpm typecheck`, `pnpm lint`, `pnpm format:check` pass.
- Docs: none. AGENTS.md says nothing of the write requests' timeouts; the worst-case core-call count (745) does not move.
