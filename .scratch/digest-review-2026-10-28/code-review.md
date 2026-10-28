# Code review: dagent run 20261028-133043 (ac819b6...37bff2f)

Two-axis review of the twelve tickets' result branch, before the fix round.

## Standards

Hard:

1. `src/reports/markdown.ts` `hotIssueFacts` writes report strings inline (`${i.comments} comments, … 👍`, `fix PR [#N] open`, `since …` / `in the …` which duplicates `hotIssueGain` in `strings.ts`) against "Fixed report strings live in `src/core/strings.ts`", and prints "1 comments" (no `plural`).
2. `tidyTrendsSummaries` lives in `src/trending/rank.ts` ("Selection, ranking and numbering") while the other summary cleanup, `dropInputTalk`, is in `src/reports/summarized-table.ts`, the home AGENTS.md names for LLM row summaries.
3. AGENTS.md: "A BigQuery verdict id stays `<anchor>#<type>: <first sentence>`, its title before 2026-10-28" is history, not current state; AGENTS.md documents `scripts/rejudge-research.ts` but not the other scripts.

Judgement calls:

- Duplicated code: `bigquery.ts` `STAGE_PHRASE_RE`/`stageOf` vs `vendors.ts` `STATUS_RE`; the code-fence and HTML-tag regex pair repeated in `issueBody`, `releaseNotes`, `announcementLinks` (`prompts.ts`); `vendorText` truncates twice; two word-overlap tokenizers (`rank.ts` `contentWords`, `prompts-pages.ts` `leadWords`); a third copy of the `sectionHeading(...).test(section)` lookup in `withHotIssueFacts`; `POLICY_TALK_MIN_POINTS` copies `TALKED_ABOUT_MIN_POINTS`.
- Shotgun surgery: the `"Sections: "` literal set in `rss.ts` and matched in `snowflake.ts`; `**Hot issue:**` in the prompt and in a `markdown.ts` regex; no shared constant.
- Feature envy: `core/github.ts` and `trending/rank.ts` import `escapeRegex` from `reports/project-news.ts`.
- Repeated switches: `"ai-trends"` special-cased in four places in `prompts-pages.ts`; `forced` not filtered to published reports.
- Divergent change: `github.ts` grew to 1,127 lines; the hot-issue cluster could be its own module.
- Names and literals: `QueuedRepo.since` is now a function; `const c = ctx` alias; `HOT_ISSUE_MAX_STATUS_CALLS = 66` hard-coded from prose; `per_page: "100"` in `fetchFixStatus`; `formatItem(item, bodyChars = 300)` beside `HOT_ISSUE_BODY_CHARS`.
- `skills.ts` tests `html_url.includes("/pull/")` where the lists are already split.
- Comments over 3 sentences: `RELEASE_BODY_CHARS`, `isRetryableGet`.

## Spec

Blocking:

- 10: already-reported BigQuery notes come back once: `stateId` keys a note without a stage on lowercased title + date, and the title changed. Needs the old `<type>: <first sentence>|date` key as an alias.
- 06: bots and slash commands are filtered only in the API count; a gain from the snapshot or a new issue's whole total keeps them past the top `HOT_ISSUE_MAX_VERIFIED` issues or the call cap.

Wrong or partial:

- 06: `fetchFixStatus` reads the first 100 timeline events (oldest first), so on a busy issue the fix-PR reference is past that page.
- 06: `withHotIssueFacts` only decorates bullets the model wrote; a hot issue the model left out gets no code fallback.
- 04: `forcedHighlightReports` always includes `ai-trends`, so six daily runs a week ask for a highlight of a page that is not in the input.
- 10: `stageOf` scans the whole note: "will be generally available" or a GA + Preview note shows "(GA)".
- 12: a failed Jev call keeps the old unpenalized relevance silently ("failed, kept").
- 01: `ensureLabel`, `createGitHubIssue` and the close loop still `fetch` without a timeout.
- 02: `priorityFirst` recognises only `#` headings, not a bold-label section (`**Breaking changes**`); the 35 KB claim rests on a 4 KB fixture.

Holds: 03, 07, 08, 11 meet every box; 01 paging, retries and `noStableYet`; the 745-call budget.

Summary: Standards 3 hard + ~15 judgement calls (worst: inline report strings with a plural bug); Spec 2 blocking + 7 partial (worst: BigQuery repeats on the first run after merge).
