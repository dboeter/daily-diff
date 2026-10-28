# 01: Codex's releases reach the agents page

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: A3 [high] — see `../review.md`, `../ai-agents.md`

## What to build

A tracked project with a release in the window shows it, whatever its asset count. OpenAI Codex was "Unavailable today" on 2026-10-24, 10-26, 10-27 and 10-28, so its stable rust-v0.165.0 (2026-10-27) never reached a page. `/repos/openai/codex/releases?per_page=100` makes GitHub serialize ~13,000 asset records and fails at ~11 s (504, or a 200 with truncated JSON); `per_page=10` answers in 4.9 s, `releases/latest` in 0.6 s.

- [ ] The releases fetch pages in small pages (10–30) until a release is older than the window, so Codex's request answers within GitHub's limit
- [ ] `githubGet` retries a 5xx (502/503/504) with backoff, as it does a dropped connection, and every request has a timeout
- [ ] `noStableYet` still answers correctly for a repo with no stable release and for Codex (~86 alphas per 100 releases); it no longer depends on a page of 100
- [ ] Tests: a 504 then 200 is retried and succeeds; a truncated body is retried, not parsed; `noStableYet` on a short history and on a long prerelease-only page
- [ ] A live run shows Codex as active or quiet, not Unavailable

## Comments

From the review: `githubGet` (`src/core/github.ts:114-136`) retries only a `TypeError`, so a `GitHubApiError` 504 fails on the first try, and its raw `fetch` has no timeout (`fetchOk` has one). `RELEASES_PAGE = 100` (`:162`); the `noStableYet` comment at `:167-171` explains why a page of 100 was chosen. Paging costs core calls: keep the worst-case budget in AGENTS.md's hot-issues paragraph (547 core calls per daily run against 1,000/h) true, or update it.
