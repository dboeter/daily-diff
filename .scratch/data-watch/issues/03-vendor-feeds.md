# Vendor feeds, state and Jev relevance

Status: resolved
Type: task
Blocked by: 01, 02

Add the vendor sources kept by the spike (01) to the data report: Databricks, Snowflake, and the Azure / Fabric & GCP block.

## Scope

- `data.feeds` in `config.yml` (vendor, URL, parser), loaded by `loadConfig`. RSS 2.0 feeds go through `src/rss.ts`: Azure Databricks, Fabric, and Azure updates with a category filter. Three sources get their own module with a pure `parseXxx(body)` (zero parsed throws) and a `fetchXxx`:
  - Snowflake release notes (`__NEXT_DATA__`).
  - Snowflake behavior-change bundles (`/en/release-notes/behavior-changes`): one stage item per bundle (`stage` = its status), so a bundle is reported again when its status moves. They count as deprecations.
  - BigQuery (Atom, split on `<h3>`).

  The vendor blogs are not sources (maintainer, 2026-10-17). Ids, dates and dedupe follow 01's "Decisions for ticket 03". A failing feed is logged and skipped.

- State file in `digests/` (id → CST date first reported; same-day re-run sees the same items; 30-day prune; malformed = first run; 7-day age limit), plus a `stages` map (id → last reported stage) for the behavior-change bundles, as in `digests/policy-state.json`.
- Jev relevance per new item (real change, deprecation/breaking, AI in data work, significance), weights in code, verdict cache file (one item per line), trace in the day folder, keyword fallback without a key or when more than half the calls fail.
- Ordering: deprecations and breaking changes first, then relevance. One LLM call for the vendor prose, with a length cap set from the spike's volume numbers.
- The spec's report layout with fixed headings in `src/i18n.ts` (Highlights → Databricks → Snowflake → Azure / Fabric & GCP → Open-source stack → Worth a Look), deferred from 02, which uses the config titles and a per-section Overview.
- Docs: AGENTS.md (source files, tracked sources), glossary (Vendor Feed).

## Done when

- Parser tests on trimmed live fixtures; select/weighting tests as in the policy-jev tests; report tests: Databricks vendor items under Databricks, deprecations first.
- All checks pass; a local run without `TYPESAFE_API_KEY` still produces the vendor sections from the keyword rules.

## Comments

2026-10-17, branch `data-watch` (uncommitted):

- Sources: `data.feeds` in `config.yml` (6 feeds). RSS through `src/rss.ts` (Azure Databricks, Fabric, Azure updates with a product-category filter); parser modules `src/data-snowflake.ts` (release notes from `__NEXT_DATA__`; behavior-change bundles from the pending table only, one stage item per bundle) and `src/data-bigquery.ts` (Atom, split on `<h3>`). Azure updates leaves out `Azure Databricks`, `Analytics` and `AI + machine learning`: every Databricks item also carries the other two.
- State `digests/data-state.json` reuses the policy state functions; 7-day age limit on every run (the Azure Databricks feed holds ~1,300 items of history); a bundle first seen at a stage older than 30 days is record-only.
- Relevance `src/data-jev.ts`: four Jev questions, weights 0.4 real change / 0.4 significance / 0.2 deprecation; `ai_in_data` is asked and saved, not weighed (for 04). Cache `digests/data-verdicts.json`, trace `data-ranking.json`, keyword fallback.
- Cap 12 with floors (6 Databricks, 3 Snowflake, 3 Azure/GCP, leftovers in that order); deprecations are never cut, so a report can exceed 12.
- Layout: fixed `DATA_REPORT` headings; vendor tables rendered in code (policy pattern), one summaries call and one prose call (Highlights + Worth a Look).
- Checks: typecheck, lint, format:check, readme --check, 666 tests pass.
- Live check without key or LLM (empty state): 61 new items, 14 kept (7 Databricks, 4 Snowflake, 3 Azure, 0 GCP — without Jev the shared cloud floor goes in feed order, Azure first).
- Not run: the Jev path against the real API, a real LLM call, `pnpm start`.
