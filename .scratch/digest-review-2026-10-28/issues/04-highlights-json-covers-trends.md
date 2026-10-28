# 04: highlights.json covers a published Trends page

Status: done
Blocked by: None (can start immediately)
Findings: T2 [medium], regression of ticket 04 of the 2026-10-26 round — see `../review.md`, `../ai-trends.md`

## What to build

The weekly Trends page reaches the Overview, Telegram and Teams. On 2026-10-28 `highlights.json` had no `ai-trends` key although the page had three Highlights; the 10-26 edition had two. The `highlights` call was `ok` (1,155 chars, the saved file's exact size), so the model left the key out.

- [x] A published Trends page with Highlights always gets at least one `highlights.json` entry, its lead first, whatever the model returns
- [x] The highlights prompt no longer contradicts the Trends page: a code-computed figure with its window (token volume on a date, stars gained in 7 days) may be restated for Trends, while raw counts stay banned for the daily pages
- [x] The raw reply of the `highlights` call is kept somewhere a maintainer can read (trace or log), so the next omission can be explained from the run
- [x] A test: a Trends page whose Highlights are figure-led yields an `ai-trends` entry restating its first bullet

## Comments

From the review: the prompt (`src/reports/prompts-pages.ts:443-456`) bans "Raw counts: … stars" and "X dominates" while requiring "A report's first highlight covers the first bullet"; Trends' lead (DeepSeek 35.37T tokens) and second bullet (+16,593 stars) are figures. `forcedHighlightReports` (`:474`) forces only `ai-policy` and `ai-data`, so `withFallbackHighlights` (`:555`) adds nothing for Trends. Which rule tipped the model is inferred: the raw reply is not saved.

Done (2026-10-28):

- **Cause**: the `highlights.json` prompt banned "Raw counts: … stars" while Trends' Highlights lead with code-computed figures (tokens, stars gained), and `forcedHighlightReports` did not list `ai-trends`, so `withFallbackHighlights` had no net when the model left the key out.
- **Changed**:
  - `src/reports/prompts-pages.ts`: `forcedHighlightReports` now always includes `ai-trends` (a fallback applies only when the page is published, since `withFallbackHighlights` skips absent content), with a `FORCED_REASON` entry. `buildHighlightsPrompt` adds an exception to the raw-counts ban only when `ai-trends` is in the input: "restate a figure its Highlights state with its window". The daily-only prompt is unchanged. `withFallbackHighlights` puts Trends' lead first: if the model wrote a highlight that `restatesLead` the page's first Highlight, it moves to the front; otherwise the lead's first sentence (`firstHighlight`) goes in front. The list is capped at 2, and nothing is added when the lead is `NO_HIGHLIGHT_NOTE`.
  - `src/index.ts` (the `highlights.json` block, `attemptJson`): when the parsed reply has no highlight for a published report, the run logs `[highlights] no highlight for <ids>; reply: <raw reply>`.
  - `scripts/regen-highlights.ts` calls `forcedHighlightReports(false)`, so it now forces `ai-trends` too. The script was not edited.
- **Tests** (`src/__tests__/reports/prompts-pages.test.ts`): new `describe("highlights.json for Trends")` with four cases: a figure-led Trends page the model left out gets an entry restating its first bullet; the model's restatement of the lead moves first, else the lead is prepended and capped; no entry for an unpublished page or a `NO_HIGHLIGHT_NOTE` page; the prompt allows Trends figures and keeps the raw-counts ban for a daily-only input. The existing `forcedHighlightReports` expectation is updated. `pnpm test` (1042 passed), `pnpm typecheck` and `pnpm lint` are clean.
- **Docs**: the AGENTS.md "Report outputs" `highlights.json` row says "A published `ai-policy`, or an `ai-data` with a Jev-kept vendor item, that the model left out gets the first sentence of its own Highlights (`withFallbackHighlights`)". New wording: "A published `ai-policy` or `ai-trends`, or an `ai-data` with a Jev-kept vendor item, that the model left out gets the first sentence of its own Highlights (`withFallbackHighlights`); `ai-trends` always leads with its page's lead (the model's restatement of it moved first, else that first sentence), and only for `ai-trends` may a highlight restate a code-computed figure with its window. When the model gives a published report no highlight, the run logs the raw reply (`[highlights] no highlight for …`)."
