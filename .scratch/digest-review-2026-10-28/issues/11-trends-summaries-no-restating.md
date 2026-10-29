# 11: Trends row summaries say one thing once

Status: done
Blocked by: None (can start immediately)
Findings: T3 [medium] — see `../review.md`, `../ai-trends.md`

## What to build

A Trends table cell adds information. On 2026-10-28, 42 of 53 summaries had a second sentence starting "It …" that restated the first ("pi is a coding agent positioned as personally yours. It is positioned as personally yours among many coding agents."), and 30 of 53 ended "in TypeScript." or "in Python.", repeating the Lang column. The prompt already forbids the restatement; the free model ignores it.

- [x] Code drops a second sentence whose content words are mostly in the first (threshold chosen from the 10-28 rows, documented next to the constant)
- [x] A trailing "in <language>" that matches the row's Lang column is removed in code, or the row's language is no longer passed as its only fact
- [x] Tests on three 10-28 summaries (pi, Proto Agent, anomalyco/opencode) give one sentence each

## Comments

From the review: `buildTrendingSummariesPrompt` (`src/reports/prompts-pages.ts:54-72`); `summaryRows` (`src/trending/rank.ts:821+`) passes `Language: X` as the only fact for a category row.

Done (2026-10-28):

- Cause: the free model ignores the prompt's "no sentence that restates the first" rule. Category rows get `Language: X` as their only fact (`summaryRows`), and the model echoes it as "in TypeScript.". No code checked either.
- Changed: `tidyTrendsSummaries` and `RESTATED_SENTENCE_SHARE` (0.6) in `src/trending/rank.ts`. A sentence after the first is dropped when at least 60% of its content words (stopwords removed, plural "s" cut) appear in the first. The three 10-28 restatements score 0.67 (pi), 1 (Proto Agent) and 1 (opencode). After that, a trailing "(written) in <language>" that matches a category row's Lang column is cut. `buildTrendsReport` (`src/reports/pages.ts`, the one call site) runs the Radar and category summaries through it with the report, and the Hugging Face summaries without one (no Lang column, so only the restatement rule applies). The language is still passed to the prompt. The threshold comes from the three examples only: the 10-28 page with all 53 rows is not in this worktree (no `digests/2026-10-28/`).
- Tests: `tidyTrendsSummaries` in `src/__tests__/trending/rank.test.ts`. pi and Proto Agent lose their second sentence, and anomalyco/opencode becomes "anomalyco/opencode is the open source coding agent.". Four cases stay unchanged: a second sentence that adds a fact, a language that differs from the row's Lang, a summary given without a report, and "t/x is written in TypeScript." (the strip is skipped after "is"/"written", so it never leaves "t/x is.").
- Docs: no AGENTS.md statement is wrong now. Suggested addition to the Trends "Code ranks and renders the tables" bullet, after `(summaryRows: …)`: "; code drops a later summary sentence made mostly of the first's words (`RESTATED_SENTENCE_SHARE`) and a trailing "in <language>" that repeats the Lang column (`tidyTrendsSummaries`)".

Fix round (code review, 2026-10-28):

- **Changed**: `tidyTrendsSummaries`, `RESTATED_SENTENCE_SHARE` and the tokenizer moved from `src/trending/rank.ts` to `src/reports/summarized-table.ts`, next to `dropInputTalk`; the tokenizer is exported as `contentWords` and also replaces `leadWords`'s own split in `src/reports/prompts-pages.ts` (one tokenizer for both). `src/reports/pages.ts`: its import line only (outside the brief's file list; needed by the move). `escapeRegex` moved from `src/reports/project-news.ts` to a new `src/core/regex.ts` (no existing core module fit), so `src/core/github.ts` no longer depends on `reports/`; importers updated: `github.ts`, `markdown.ts`, `prompts-pages.ts`, `project-news.ts`, `summarized-table.ts` (`rank.ts` no longer needs it).
- **Tests**: the `tidyTrendsSummaries` cases moved unchanged from `src/__tests__/trending/rank.test.ts` to `src/__tests__/reports/summarized-table.test.ts`; the 10-28 scores in the constant's comment still hold (same tokenizer).
- Docs: AGENTS.md's Source files table has no row for `src/core/regex.ts`; add "| `src/core/regex.ts` | `escapeRegex` |". The `src/reports/summarized-table.ts` row could add "Trends' summary cleanup (`tidyTrendsSummaries`), `dropInputTalk`".
