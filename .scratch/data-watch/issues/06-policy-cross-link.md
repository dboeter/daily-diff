# Policy cross-link: EU data law

Status: resolved
Type: task
Blocked by: 02

Optional; can be cut.

## Scope

- Policy watchlist and keyword list gain the Data Act, Data Governance Act and NIS2.
- Policy items marked as data law are linked from the data report's Worth a Look, from Policy Watch's data (not fetched twice).
- Docs: AGENTS.md.

## Done when

- A report test: a kept data-law policy item appears in Worth a Look; an AI-only policy item does not.
- All checks pass.

## Comments

2026-10-18, branch `data-watch` (uncommitted):

- `policy.watchlist.eu` gains 2023/2854 (Data Act), 2022/868 (Data Governance Act), 2022/2555 (NIS2): EUR-Lex fetches them and Policy Watch always keeps them.
- New `policy.data_law` tokens; `isDataLaw` (`src/policy-jev.ts`) reuses the watchlist token matcher; the fallback's `fallbackKeywordHit` also hits the data-law names (not `keywordHit`, the sources' AI filter); US government sources are never data law.
- `buildDataReport` links Policy Watch's kept data-law items in Worth a Look, rendered in code (heading created when the prose call wrote none); they never make a report on their own.
- Checks: typecheck, lint, format:check, readme --check, 679 tests pass.
