# 08: Policy summaries say only what the source says

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: M3 [medium]; lows L4 (regression of ticket 17 of the 2026-10-26 round), L9 — see `../review.md`, `../ai-models-policy.md`

## What to build

A policy row's summary never talks about its own input. On 2026-10-28 the only AI Policy row ended "The provided text does not specify any direct implications for organisations that deploy AI." The prompt asks for two sentences, the second on what the item means for deployers, and also says to ground every sentence in the text; when the text has no implication, the model can only say so. Two lows on the same page: the meta line reads "1 new items" (L4), and the empty Stage cell is blank where other tables show `—` (L9).

- [ ] The summary is one sentence, plus a second only when the text states what the item means for organisations
- [ ] Code drops a summary sentence about the input ("the provided text", "the text does not") and logs it
- [ ] The meta line pluralizes ("1 new item")
- [ ] An empty Stage cell shows `—`
- [ ] Tests for the sentence strip and the singular

## Comments

From the review: `src/reports/prompts-pages.ts:139-140` (2 sentences, then "Ground every sentence only in the given text"); `newItems` in `src/core/strings.ts:227` does not use `plural`.
