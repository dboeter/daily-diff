# 03: highlights.json leaves out ai-data and ai-models

Status: needs-triage
Findings: 5 [medium], see `../review.md`

## Problem

`[highlights] no highlight for ai-data; reply: {"ai-agents":[…` on 2026-11-08 and `no highlight for ai-models, ai-data` on 11-09. Both pages were published. `withFallbackHighlights` covers `ai-policy`, `ai-trends` and an `ai-data` with a Jev-kept vendor item only.

## What to build

- [x] Read the logged raw replies of 11-08 and 11-09: did the model skip the pages, or were their Highlights `NO_HIGHLIGHT_NOTE` or `NO_MODEL_NEWS_NOTE` (then the gap is correct and the log line is noise)
- [ ] If the pages had real Highlights: fall back to the page's first Highlight for every published daily page, as `ai-policy` does

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: no new case on 11-10. The 11-09 case is the one named above. On that day the models page opened with "No lab or model news today." (issue 12), which may explain its missing entry.
- 2026-11-11: read the logs of runs 42452303696 (11-08) and 42570582649 (11-09).
  - `ai-data`, both days: the page's only Highlight was "No item stands out today." (`NO_HIGHLIGHT_NOTE`). The gap is correct and the log line was noise. Fixed: the line now names only a page that has something to restate (`skippedReports`, `src/reports/prompts-pages.ts`).
  - `ai-models`, 11-09: the page had two real Highlights (OpenAI's raise, Anthropic's power deal) under "No lab or model news today.", and the model left the page out. Inferred, not tested: the no-news bullet made the model skip it, since the prompt tells it to omit a report with no news. Issue 12 removes that bullet.
  - Not built: a fallback Highlight for every daily page. The one real gap has its cause removed, and a fallback would end the model's right to skip a page with routine items (`forcedHighlightReports`). Reopen if a page with real Highlights is skipped again; the log line now shows exactly those cases. Hence `needs-triage` for the second checkbox.
