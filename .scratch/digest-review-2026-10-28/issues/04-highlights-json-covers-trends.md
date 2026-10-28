# 04: highlights.json covers a published Trends page

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: T2 [medium], regression of ticket 04 of the 2026-10-26 round — see `../review.md`, `../ai-trends.md`

## What to build

The weekly Trends page reaches the Overview, Telegram and Teams. On 2026-10-28 `highlights.json` had no `ai-trends` key although the page had three Highlights; the 10-26 edition had two. The `highlights` call was `ok` (1,155 chars, the saved file's exact size), so the model left the key out.

- [ ] A published Trends page with Highlights always gets at least one `highlights.json` entry, its lead first, whatever the model returns
- [ ] The highlights prompt no longer contradicts the Trends page: a code-computed figure with its window (token volume on a date, stars gained in 7 days) may be restated for Trends, while raw counts stay banned for the daily pages
- [ ] The raw reply of the `highlights` call is kept somewhere a maintainer can read (trace or log), so the next omission can be explained from the run
- [ ] A test: a Trends page whose Highlights are figure-led yields an `ai-trends` entry restating its first bullet

## Comments

From the review: the prompt (`src/reports/prompts-pages.ts:443-456`) bans "Raw counts: … stars" and "X dominates" while requiring "A report's first highlight covers the first bullet"; Trends' lead (DeepSeek 35.37T tokens) and second bullet (+16,593 stars) are figures. `forcedHighlightReports` (`:474`) forces only `ai-policy` and `ai-data`, so `withFallbackHighlights` (`:555`) adds nothing for Trends. Which rule tipped the model is inferred: the raw reply is not saved.
