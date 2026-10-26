# Hot Issue: drop the "opened in the window" requirement

Status: done

## Problem

`GLOSSARY.md` defines a **Hot Issue** as an issue with real engagement (comments + 👍), or less on a regression/security issue, **however old**. `fetchHotIssues` (`src/github.ts`) only finds issues _opened_ in the window (widened to at least 48h). A long-running issue that suddenly flares up (a regression reported last month, now with 40 new comments) never appears.

## Desired behavior

An issue is a Hot Issue on engagement alone, whenever it was opened.

## Open questions (decide before implementing)

- **Repeats.** Without the age filter, the same big issue is hot every day. Options: count only engagement gained in the window (the search API can't filter by that; needs per-issue data or a saved snapshot like `trending-state.json`), require activity in the window (`updated:>=` plus the threshold), or keep a seen-list and report an issue once.
  - Decided (maintainer, 2026-10-26): engagement gained in the window, counted per candidate issue, plus a seen-list; a hot issue is shown once (`digests/hot-issues-state.json`). See Comments.
- **Quota.** Search allows 30 requests/minute, shared with trending; `searchSlot` spaces calls 2.1 s apart. A wider query must still fit one request per repo, or the fetch time grows.
- **Threshold.** The current 10 / 3 thresholds were tuned for new issues; old issues have had longer to collect engagement.

## Comments

- Built (2026-10-26): `fetchHotIssues` searches `repo:<r> is:issue is:open updated:>=<since>` (the report window `fetchProject` passes, 24h), sorted by `interactions`, for the candidates; an issue qualifies on the engagement it gained in the window, whenever it was opened (see Repeats). `HOT_ISSUE_MIN_WINDOW_MS` and the creation filter are gone. Tests: `src/__tests__/core/github.test.ts` ("keeps an issue opened months ago with 12 new comments in the window, with its gain", the `fetchHotIssues` query test).
- Repeats: engagement gained in the window plus a seen-list. `fetchHotIssues` measures each candidate's gain in the window (snapshot baseline, or the API for old issues without one; see the last comment), so an old mega-thread with two new comments is not hot (maintainer, 2026-10-26). The seen-list stays: a hot issue is shown once (`digests/hot-issues-state.json`, id `issue:<owner/repo>#<n>`); more engagement or a new label no longer brings it back (maintainer, 2026-10-26, replacing ticket 08's doubling rule). A mega-thread appears once, on a day it gains engagement over the bar, then never again: the state is never pruned (`nextHotIssuesState`).
- Quota: still one search request per repo, paced by `searchSlot`; the gain calls are core REST calls, outside it.
- Threshold: 10 / 3, applied to the engagement gained in the window, so an old issue's long-collected total no longer counts. The total only pre-filters the search results (the gain cannot exceed it). Tests: `src/__tests__/core/github.test.ts` (`selectHotIssues`, `hotIssueCandidates`, `fetchHotIssues`).

## Notes

- Update the hot-issue bullet in AGENTS.md ("Agents and infra reports cover…").
- Tests for `fetchHotIssues` query building.
- Gain from a daily snapshot (maintainer, 2026-10-26). Measured live on 10-26: in anthropics/claude-code and openai/codex all 50 search results cleared the bar on their total, so checking the top 10 by total checked old mega-threads and missed newly hot issues (Codex #56691: total 53, +13 in 24h). Now `digests/hot-issues-snapshot.json` holds every search result's total per day (`<owner/repo>#<n>` → date, total, and `baseline`, the last earlier-day total, so a same-day re-run measures the same gains; pruned after 8 days unseen; malformed reads as empty). The search returns 100 per repo. Gain = today's total − a baseline at most 2 days old (the prompt says "since <date>" for a 2-day-old one); with no baseline, an issue opened in the window gains its whole total; an older one is counted by the API, at most `HOT_ISSUE_MAX_CHECKED` (10) per repo, highest total first. Worst case unchanged at 33 × 10 × 2 = 660 core calls (990 with over 100 👍 each); near it only on a run without a snapshot. Tests: `src/__tests__/core/github.test.ts` ("selectHotIssues, gain from the snapshot", "nextHotIssueSnapshot", "keeps Codex #56691 (53 now, 40 yesterday) hot without a fetch").
- Review fixes (2026-10-26):
  - Candidates: the search (100 by interactions) is replaced by the core issues list, `GET /repos/{r}/issues?state=open&since=<window>&sort=updated&direction=desc&per_page=100`, paged until a short page (measured before pull requests, which share the pages, are dropped), at most `HOT_ISSUE_MAX_PAGES` (8) per repo, logged when hit. Checked live: the list is core, carries `comments` and `reactions["+1"]`, mixes in pull requests (28 of codex's first 100), and `page=N` works. In 37h codex listed 815 items and claude-code 826; the 24h window holds ~550 issues each. Every listed issue gets a snapshot entry, so a quiet old issue that surges has a baseline the day after it is first listed. Hot issues no longer use `searchSlot`.
  - Run-wide budget: per-issue count calls are capped at `HOT_ISSUE_MAX_COUNT_CALLS` (250) per run, shared by every repo, reserved before each issue's fetch (repos run in parallel); a candidate past it is skipped. One log line: `[github] hot issues: N list pages, M count calls[, K candidates skipped…]`. Worst case per daily run: 33 repos × 8 list pages + 250 + 33 release lists = 547 core calls.
  - Reaction order checked live: claude-code#45596 (1,195 👍) has April 2026 reactions on page 1 and its last page ends 2026-10-23, so oldest first; the last-page logic stays.
  - Snapshot pruned at the 2-day baseline age (`SNAPSHOT_KEEP_DAYS` removed): older entries were never read.
  - Open: `hotIssuesToCheck` still orders highest total first with 10 per repo. In claude-code and codex nearly every listed issue clears the bar on its total, so on a day an older small-total issue without a baseline (quiet 2+ days, then surging) competes with mega-threads, its count call can go to them; it is caught when it gains 10 again against the next day's snapshot.
  - Tests: `src/__tests__/core/github.test.ts` (`fetchHotIssues`: "reads the next page while a page is full…", "stops after 8 list pages and logs it", "finds a small-total old issue that surged, from its snapshot baseline…", "skips candidates once the run used 250 count calls…", "returns the unused part of an issue's reserved count calls", "reads the newest page of 👍 when there are over 100"; `nextHotIssueSnapshot` prune at 2 days).
