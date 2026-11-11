# 08: Policy summaries say only what the source says

Status: done
Blocked by: None (can start immediately)
Findings: M3 [medium]; lows L4 (regression of ticket 17 of the 2026-10-26 round), L9 — see `../review.md`, `../ai-models-policy.md`

## What to build

A policy row's summary never talks about its own input. On 2026-10-28 the only AI Policy row ended "The provided text does not specify any direct implications for organisations that deploy AI." The prompt asks for two sentences, the second on what the item means for deployers, and also says to ground every sentence in the text; when the text has no implication, the model can only say so. Two lows on the same page: the meta line reads "1 new items" (L4), and the empty Stage cell is blank where other tables show `—` (L9).

- [x] The summary is one sentence, plus a second only when the text states what the item means for organisations
- [x] Code drops a summary sentence about the input ("the provided text", "the text does not") and logs it
- [x] The meta line pluralizes ("1 new item")
- [x] An empty Stage cell shows `—`
- [x] Tests for the sentence strip and the singular

## Comments

From the review: `src/reports/prompts-pages.ts:139-140` (2 sentences, then "Ground every sentence only in the given text"); `newItems` in `src/core/strings.ts:227` does not use `plural`.

Done (2026-10-28). Cause: `buildPolicySummariesPrompt` asked for exactly 2 sentences, the second on what the item means for deployers, and also required every sentence to come from the text; with no implication in the text the model could only write about the text. `POLICY_REPORT.newItems` hard-coded "items", and `renderPolicyTable` wrote `it.stage ?? ""`.

Changed:

- `src/reports/prompts-pages.ts` `buildPolicySummariesPrompt`: `1-2 sentences`, a second only when the text states what the item means for organisations that deploy AI, and a rule never to write about the text itself.
- `src/reports/summarized-table.ts`: new `dropInputTalk(summaries, tag)` drops each sentence matching `INPUT_TALK_RE` ("provided/given text/description", "the text/description does not / doesn't / did not / is empty"), logs `[policy-summaries] row N: dropped a sentence about its input: "…"`, and drops a summary left with no sentence, so its row shows the description.
- `src/reports/pages.ts` `buildPolicyReport`: runs `dropInputTalk` on the parsed summaries before `checkCodeTokens`.
- `src/core/strings.ts` `POLICY_REPORT.newItems`: `plural(n, "new item")`; the `tableHeader` comment now says Stage is `—` without one.
- `src/reports/markdown.ts` `renderPolicyTable`: Stage cell `it.stage || "—"`.

Tests: a `dropInputTalk` block in `__tests__/reports/summarized-table.test.ts` (drops the sentence and keeps the rest, leaves a clean summary untouched, drops a summary with nothing left); a `POLICY_REPORT.newItems` block in `__tests__/core/strings.test.ts` (1 new item, 2 new items); the prompt test asserts the new rules; the policy table expectations in `markdown.test.ts`, `summarized-table.test.ts` and `pages.test.ts` now expect `—` in an empty Stage cell and the `1-2 sentences` contract. `pnpm typecheck`, `pnpm lint` and `pnpm test` (1048 tests) pass.

Docs: no AGENTS.md statement is now wrong. Suggested addition to the AI Policy bullet "Code renders the tables (…); the LLM writes only row summaries and Highlights, so a legal status or date never comes from the model.": append "A summary sentence about the model's input ("the provided text does not …") is dropped and logged (`dropInputTalk`), and a row without a stage shows `—`."
