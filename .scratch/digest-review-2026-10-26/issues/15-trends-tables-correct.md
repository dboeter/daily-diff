# 15: Trends tables are correct and self-explaining

Status: ready-for-agent
Blocked by: 01
Findings: T3, T4, T5, T11, T12, T13, T15, T19, T20, A8, S8 — see `../review.md`

## What to build

Every figure on the Trends page is right, has its window and is explained, and every row says something. On 2026-10-26 the category tables were not sorted by 7-day gain as AGENTS.md says and skipped larger gainers, "round out the top five" named six models, growth figures did not reconcile with last week, a Radar row linked `birdstrike.local`, 6 of 11 Radar rows had no description, Hugging Face rows repeated last week unmarked and printed `model_type` tags, and the agents page showed a weekly "+5,921 stars" as if daily.

- [ ] Category rows sort by displayed 7-day gain, or AGENTS.md states the real order; the trace says why a large gainer is absent
- [ ] Ranks, "top N" and "newcomer" are computed in code, not by the model
- [ ] The Radar has a one-line legend (🔥, 🆕, inclusion rule, units, "vs previous week"), and its growth figures reconcile with the previous Weekly Digest
- [ ] Every figure carries its window, on Trends and wherever a Trending gain appears on a daily page
- [ ] `.local` and `localhost` links are rejected; an empty Lang cell shows "—"
- [ ] A 🆕 row with neither description nor usage is dropped; a row without summary falls back to the repo or site description and cannot be a Highlight
- [ ] Hugging Face rows get the repeat marker, one row per release (no uncensored variants), a rank, and a summary built from pipeline tag, size or card text, never `model_type`
- [ ] OpenRouter usage links on model names instead of bare "link"
