# Summarized tables: number rows once, at selection

Status: needs-triage
Type: task
Blocked by: 01

## Problem

A row summary lands on the right table row only if three modules enumerate the same list in the same order:

- **Order:** `fetchPolicyData`'s jurisdiction sort (`src/policy.ts:157`) and `orderAndCap` (`src/data-jev.ts`).
- **Prompts:** `buildPolicySummariesPrompt` and `buildDataSummariesPrompt` (`src/prompts-data.ts:114`, `:176`), which number rows `i + 1`.
- **Renderers:** `renderPolicyTable` and `renderVendorTables` (`src/report-builders.ts:329`, `:367`), which number rows `i + 1` again.

The renderers' doc comments carry the rule ("the items must arrive grouped (fetchPolicyData sorts them)"). No test checks both halves together.

The three summaries prompts (trending, policy, data) each restate the `N: <text>` output contract that `parseRowSummaries` parses.

Trending already solved this. `selectTrendingReport` assigns `n` once (`Numbered<T>`, `src/trending-rank.ts:85`), and both the prompt (`summaryRows`) and the renderer read `row.n`.

## Solution

Use the trending pattern for policy and vendor rows, and give the shared pieces one module (working name `src/summarized-table.ts`):

- `Numbered<T>` (moved from `trending-rank.ts`) and a `numberRows(items)` helper. It is called once, right after the final order is set: after the jurisdiction sort in `fetchPolicyData`, after `orderAndCap` in `selectVendorItems`.
- The row-list line and the output-contract text the three summaries prompts share. The per-report framing (reader, what to say) stays in each prompt builder.
- `parseRowSummaries`, `TABLES_MARKER` and `spliceTables` (moved from `report-builders.ts`).
- A summary-cell helper `(summaries, row) → cell text` with the description fallback (`descriptionFallback` becomes internal).

`renderPolicyTable`, `renderVendorTables` and `renderTrendingTables` keep their cell layouts and read `row.n`. Keep the sorts: readers still want ascending numbers down the page. The renderer just stops depending on them.

Constraint: `buildPolicyReport` renders the tables with an empty summaries map for the prose prompt, at the same time as the summaries call runs. The module stays pure and render-twice friendly. It does not make the LLM call (that placement is ticket 03's topic).

## Scope

- In: `src/summarized-table.ts` (new); `src/report-builders.ts`, `src/prompts-data.ts`, `src/policy.ts`, `src/data-jev.ts`, `src/trending-rank.ts`; `PolicyData.items` and `VendorData.items` become `Numbered<…>[]`.
- Out: the prose prompts, `splitProse` (data report), the LLM calls.
- Docs: the AGENTS.md source-file table (new row; `report-builders.ts` row loses the moved functions), the Policy Watch and vendor **Layout** text that says rows are numbered across sections (they still are, but the number now comes from selection).

Estimate: ~+80 / −70 lines in src, plus tests. 7 files.

## Done when

- A test in `src/__tests__/summarized-table.test.ts` builds policy items in jurisdiction order, numbers them, shuffles the array, renders it, and checks that reply line `3: …` lands on the row numbered 3 under its jurisdiction heading. The same check runs for vendor rows across sections.
- Prompt test: the summaries prompts list exactly the rows' `n` values, and the policy, data and trending prompts share the contract text (one source, asserted by importing it).
- `report-builders.test.ts` numbering tests and `prompt-builders.test.ts` row-list tests that only re-checked `i + 1` are removed or folded into the above. The `data-reports.test.ts` "rows numbered across sections" test still passes.
- `grep -n "i + 1" src/report-builders.ts src/prompts-data.ts` finds no row numbering.

## Comments
