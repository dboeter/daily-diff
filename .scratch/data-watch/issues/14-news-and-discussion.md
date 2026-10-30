# News & discussion section from community feeds

Status: ready-for-agent
Type: task
Blocked by: none (12 is resolved)

## Evidence

Ticket 12's spike (2026-10-30) found 13 engineering blogs, newsletters and forums with a usable feed and a relevant share worth a table: DuckDB, Polars, Airflow, dbt Developer, dbt Labs (caveat), dltHub, Dagster, Confluent (the only Kafka release signal), OpenMetadata, Snowflake on Medium, Data Engineering Weekly, Seattle Data Guy, Benn Stancil, r/dataengineering. Today the data report's only commentary comes from what reaches HN, Lobste.rs and Dev.to.

## Task

Implement the recommendation in `12-community-sources.md`:

1. `data.community` in `config.yml` (name, url, optional `kind`, optional `cap`), loaded by `loadConfig` (a key with no schema entry is silently ignored) and documented in the config's comment block.
2. A fetcher (`src/data/community.ts`) that reads each feed with `parseRssItems` (Atom feeds need the BigQuery-style reader) into `Story` rows; it never throws (`fetchSuccess: false`).
3. Items first go through `matchProjectNews` in the data pool, so a post naming a tracked project is **News** under that project; the rest is judged by Jev through `judgeItems` with a `digests/community-verdicts.json` cache (insight score + audience), per the questions in ticket 12.
4. A `## News & discussion` table (Story | Source | Summary) between `## Across platforms` and `## Spotted` (`DATA_REPORT` in `src/core/strings.ts`), rows summarized through `summarizeRows`, at most 6, `cap` per source (default 1), newest first; a release post repeating a tracked repo's release of the same day is dropped in code (`repeat`). A row never makes the report on its own.
5. `community-trace.json` in the day folder, like the other traces; `fetched`/`judged` per source in its header.
6. Tests mirror the module (`__tests__/data/community.test.ts`) with one fixture feed per parser shape; AGENTS.md's Data engineering section and README's report description gain the new section.

## Done when

- A local run with `TYPESAFE_API_KEY` shows the table with 2–4 rows on a weekday and none on a quiet day, and the trace explains every drop.
- The dbt Labs blog's kept share is measured after two weeks; under 1 in 5 it is removed from the config.
