# 11: Trends row summaries say one thing once

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: T3 [medium] — see `../review.md`, `../ai-trends.md`

## What to build

A Trends table cell adds information. On 2026-10-28, 42 of 53 summaries had a second sentence starting "It …" that restated the first ("pi is a coding agent positioned as personally yours. It is positioned as personally yours among many coding agents."), and 30 of 53 ended "in TypeScript." or "in Python.", repeating the Lang column. The prompt already forbids the restatement; the free model ignores it.

- [ ] Code drops a second sentence whose content words are mostly in the first (threshold chosen from the 10-28 rows, documented next to the constant)
- [ ] A trailing "in <language>" that matches the row's Lang column is removed in code, or the row's language is no longer passed as its only fact
- [ ] Tests on three 10-28 summaries (pi, Proto Agent, anomalyco/opencode) give one sentence each

## Comments

From the review: `buildTrendingSummariesPrompt` (`src/reports/prompts-pages.ts:54-72`); `summaryRows` (`src/trending/rank.ts:821+`) passes `Language: X` as the only fact for a category row.
