# Data × AI section and news matching

Status: resolved
Type: task
Blocked by: 03

## Scope

- News matching (`matchProjectNews`) over the data projects, with explicit `keywords` for short or ambiguous names (dlt, Delta, Polaris…); HN stories about a tracked project or vendor reach its section.
- The Data × AI section, written from Jev's AI-flagged vendor items, tracked-project release notes and matched HN/trending news.
- Docs: AGENTS.md.

## Done when

- Report tests: the section appears with AI items and is left out without them; a news item naming "Delta" in another sense does not match.
- All checks pass.

## Comments

2026-10-18, branch `data-watch` (uncommitted):

- `matchProjectNews` takes `maxPerItem`; the data repos are a second pool with no compatibility-list drop (a story naming DuckDB, Polars and Iceberg is news), agents and infra keep 2.
- Keywords in `config.yml` for the ambiguous names: Delta Lake (never bare "delta"), Databricks CLI (repo name `cli`), Apache Polaris, dlt (`dlt-hub`, `data load tool`), Apache Iceberg, Apache Airflow; dbt keeps bare "dbt" plus `dbt core`, `dbt labs`.
- `## Data × AI`: written by the existing prose call (no new LLM call) from vendor items with `aiInData` (Jev `ai_in_data` ≥ 0.5, else the AI keyword terms), the active data-project releases and matched news; left out when there are no inputs or the model omits it.
- Checks: typecheck, lint, format:check, readme --check, 672 tests pass. Not run: a real LLM call, real Jev `ai_in_data` answers.
