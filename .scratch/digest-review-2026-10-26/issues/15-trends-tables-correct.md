# 15: Trends tables are correct and self-explaining

Status: partial
Blocked by: 01
Findings: T3, T4, T5, T11, T12, T13, T15, T19, T20, A8, S8 — see `../review.md`

## What to build

Every figure on the Trends page is right, has its window and is explained, and every row says something. On 2026-10-26 the category tables were not sorted by 7-day gain as AGENTS.md says and skipped larger gainers, "round out the top five" named six models, growth figures did not reconcile with last week, a Radar row linked `birdstrike.local`, 6 of 11 Radar rows had no description, Hugging Face rows repeated last week unmarked and printed `model_type` tags, and the agents page showed a weekly "+5,921 stars" as if daily.

- [x] Category rows sort by displayed 7-day gain, or AGENTS.md states the real order; the trace says why a large gainer is absent
- [x] Ranks, "top N" and "newcomer" are computed in code, not by the model
- [ ] The Radar has a one-line legend (🔥, 🆕, inclusion rule, units, "vs previous week"), and its growth figures reconcile with the previous Weekly Digest (legend done; reconciling needs a design decision, see Comments)
- [ ] Every figure carries its window, on Trends and wherever a Trending gain appears on a daily page (done for the Radar, category tables, OpenRouter usage and the agents page; the Hugging Face Likes and Downloads columns still have none)
- [x] `.local` and `localhost` links are rejected; an empty Lang cell shows "—"
- [ ] A 🆕 row with neither description nor usage is dropped; a row without summary falls back to the repo or site description and cannot be a Highlight (drop done; site-description fetch and the Highlight rule not done)
- [ ] Hugging Face rows get the repeat marker, one row per release (no uncensored variants), a rank, and a summary built from pipeline tag, size or card text, never `model_type` (partial; not verified: needs live LLM run)
- [x] OpenRouter usage links on model names instead of bare "link"

## Comments

- Category order: `interleaveGains` picks up to 8 rows alternating absolute and relative gain (why Lody +130 beat knowledge-work-plugins +2,790); the picked rows now show by displayed gain, and AGENTS.md states the pick rule. `dropped_reason: cap` was already in the trace code; the 2026-10-26 trace predates it (no `rendered`/`dropped_reason` fields).
- OpenRouter usage is now a code table (rank, linked model, tokens), no LLM: the rankings snapshot is one day's tokens (`OpenRouterModel.tokens`), so the old bullets showed daily figures with no window. "Newcomers" is gone, not computed: the rankings carry no creation date.
- Windows: the agents page's Trending detail says "this week" or "today" by the scrape's `period` (the Monday run scrapes `since=weekly`, so 10-26's +5,921 was weekly). npm signal says "downloads/week"; the legend gives each source's units and windows.
- Reconcile: 📈 is OpenRouter's own growth figure and the npm ratio is this week against the 30-day average week; neither is "vs the previous Trends page". Making them reconcile means saving last week's values (like `trending-state.json`) and computing the change in code: a design decision.
- 🆕 OpenRouter apps with no description, rank or tokens are dropped (HunterSwarm-style rows). Fetching a site meta description and keeping a summary-less row out of Highlights are not done.
- Hugging Face: uncensored/abliterated re-uploads are dropped in code, tags (the `model_type` source) are no longer in the prompt, and the table asks for a `#` column. Not done: the 🔥 repeat marker and base/GGUF grouping into one row per release.
