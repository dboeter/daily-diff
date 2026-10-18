# Report modules own their LLM calls and their empty value

Status: needs-triage
Type: task
Blocked by: 01

## Problem

The weekly trending report is spread over three modules:

- `src/trending.ts` fetches and composes the rows.
- `generateSummaries` (`src/index.ts`) makes its summaries call, its prose call and the Skills call (Skills is only used by the trending report).
- `buildTrendingReport` (`src/data-reports.ts:152`) parses, splices and saves.

Policy Watch and the data report make their calls inside their builders. To change how trending is generated you read all three, and the two-call flow can only be tested through `main()`, which has no tests.

`fetchAllData` (`src/index.ts:143`) also writes a fallback value by hand for every source in a `.catch` (web ×2, trending, HN, ArXiv, HF, Dev.to, Lobste.rs; ticket 01 removes policy and vendor). So `index.ts` knows each data type's fields. `trending.ts` already exports `EMPTY_OPENROUTER` and `EMPTY_NPM` for the same reason.

## Solution

1. **Trending LLM calls into the builder.** `buildTrendingReport` takes `TrendingData` and the Skills data and makes its three calls, with the same prompts and failure policy:
   - a failed summaries call is `""` (rows show descriptions);
   - a failed prose call shows `MSG.trendingFailed` and the report is still written (unlike Policy Watch, whose report is skipped);
   - a failed Skills call shows `MSG.skillsFailed`.

   Keep this difference; don't unify it silently. `generateSummaries` then covers only agents and infra. Inline it into `main()` or keep it as a two-call helper, whichever reads shorter.

2. **One rule for fetch failures.** Each `fetchXxxData` catches its own failure and returns its empty value (`fetchSuccess: false`). `fetchAllData` then has no `.catch` fallbacks. The alternative rule: each module exports `emptyXxxData()` and `index.ts` keeps one-line catches. Apply whichever is picked to every source in `fetchAllData`.

## Open decisions (settle before implementing)

- **The first LLM health gate.** `assertLlmHealthy("summary")` (`index.ts:448`) arms only because the weekly run has made 5 calls by then (agents, infra, skills and the two trending calls). After step 1 it sees at most 2, below `LLM_MIN_SAMPLES` (3), so it can never fire. Proposed: remove it. The second gate already runs before any report file, issue or commit, and its comment covers the state files written by the builders. Alternative: keep it and lower `LLM_MIN_SAMPLES`, which weakens the second gate too.
- **Rule for step 2:** the fetcher never throws (proposed: matches ticket 01) or an exported empty value.
- **The data-law filter.** `policyData.items.filter(isDataLaw…)` stays in `index.ts`; it is the one cross-report link. Moving it into `buildDataReport` would make the data report read Policy Watch config. Proposed: leave it.

## Scope

- In: `src/index.ts` (`fetchAllData`, `generateSummaries`, the first gate), `src/data-reports.ts` (`buildTrendingReport`), the fetchers in `src/web.ts`, `src/trending.ts`, `src/hn.ts`, `src/arxiv.ts`, `src/hf.ts`, `src/devto.ts`, `src/lobsters.ts` (their outer catch only).
- Out: prompts, ranking and rendering; the agents report's calls (built inline in `main()` from two summaries, which is fine).
- Docs: AGENTS.md **Architecture** (phase 3 no longer lists trending or skills; phase 4 does), the `callLlm`/health-gate paragraph (the gates and the `LLM_MIN_SAMPLES` reasoning), and the `data-reports.ts` row.

Estimate: ~+60 / −110 lines in src, plus tests. 9 files, most of them one-catch edits.

## Done when

- New `buildTrendingReport` tests in `data-reports.test.ts`, with `generateBody` mocked as the policy tests do:
  - summaries and prose spliced;
  - summaries failure → descriptions in the rows;
  - prose failure → `MSG.trendingFailed` body, report still returned;
  - Skills section present.
- `fetchAllData` contains no `.catch` (the web fetches' `(err): WebFetchResult` catches included).
- Each changed fetcher has a test (or an existing one extended) showing a thrown network error returns `fetchSuccess: false`.
- If the gate is removed: `assertLlmHealthy` is called exactly once in `src/index.ts`, and AGENTS.md no longer mentions two gates.

## Comments
