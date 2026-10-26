# 05: Spotted and Most discussed rows get real summaries

Status: partial
Blocked by: 01
Findings: S1, A6, M1, T8, A10 — see `../review.md`

## What to build

Spotted rows and the Trends Most discussed rows say what the story is about. On 2026-10-26 (and 10-25) every Spotted Summary on the agents and models pages was the linked page's meta description ("Contribute to microsoft/Agensh development by creating an account on GitHub.", "I am a dermatologist. I tested..."), and Most discussed showed "Subscribe for daily updates." and "—" for a 524-comment thread. AGENTS.md says a failed summaries call shows the descriptions, so first establish whether the call fails, is skipped, or returns descriptions.

- [x] The cause of the fallback on 2026-10-25/26 is recorded in this ticket's Comments
- [x] Spotted rows carry a model-written summary with one concrete fact from the story
- [ ] Most discussed rows go through the same summaries call (same rules, separate call: see Comments)
- [x] When the call fails, the fallback strips boilerplate ("Contribute to … on GitHub", "- owner/repo", trailing "...", subscribe lines) and shows "—" when nothing is left
- [x] Link text matches the repo name when the story links a repo

## Comments

**Cause (2026-10-25/26):** the summaries call neither failed nor was skipped. The run logs show `[spotted-summaries] Calling LLM...` with `0/8` (10-25) and `0/14` (10-26) LLM calls failed, and the rendered cells are whole descriptions longer than the 160-character code fallback, without its "…". The model followed `STORY_RULES`, which told it to give "2 sentences taken from" the description: it copied them. Most discussed uses the same rules (`buildTrendsSummariesPrompt`), hence its copied "Subscribe for daily updates.".

**Fix:** `STORY_RULES` now asks for its own words with one concrete fact, never a copy, and names a first-person author; it stays shared by Spotted and Most discussed (same rules, as the second box asks; they remain two calls because Most discussed is weekly). `cleanStoryDescription` (spotted/pool.ts) strips boilerplate at fetch, from carried stories and from old log entries, so prompt and fallback both get clean text and an empty one shows "—". `renderSpottedTable` labels a GitHub repo link with `owner/repo`. Model output itself unverified until a live run.

- Review fix: the subscribe pattern only strips a sentence that opens with "Subscribe for/to", so "A CLI to subscribe to RSS feeds and read offline." stays whole. Test: `cleanStoryDescription` cases (pool.test).
**Review (2026-10-26):** Most discussed shares `STORY_RULES` with Spotted but runs in its own call (`trends-summaries` in `buildTrendsReport`, beside `spotted-summaries`), so the box as written is not met. Unticked.
