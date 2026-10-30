# News & discussion section from community feeds

Status: ready-for-agent
Type: task
Blocked by: 12

## Evidence

Ticket 12's spike (2026-10-30) found 10 engineering blogs with a usable feed and a relevant share worth a table: DuckDB, Polars, Airflow, dbt Developer, dbt Labs (caveat), dltHub (caveat), Dagster, Confluent (the only Kafka release signal; caveat), OpenMetadata, Snowflake on Medium (caveat). Substack newsletters and Reddit are out of scope (`spec.md`: Substack answers 403 to Actions). Today the data report's only commentary is what reaches HN, Lobste.rs and Dev.to: 12 data-topic stories in the 8 days to 2026-10-30, about 1.5 a day.

## Task

Implement the recommendation in `12-community-sources.md`:

1. **Reachability first**: fetch every candidate feed from a `workflow_dispatch` run (a throwaway script step is fine) and drop any that answers 403 or empty on Actions before writing code against it.
2. `data.community` in `config.yml` (name, url, optional `kind`, optional `cap`), loaded by `loadConfig` (a key with no schema entry is silently ignored) and documented in the config's comment block.
3. A fetcher (`src/data/community.ts`) that reads each feed with `parseRssItems` (an Atom feed needs the BigQuery-style reader) into `Story` rows; it never throws (`fetchSuccess: false`).
4. Items first go through `matchProjectNews` in the data pool, so a post naming a tracked project is **News** under that project; the rest is judged by Jev through `judgeItems` with a `digests/community-verdicts.json` cache (insight score + audience), per the questions in ticket 12.
5. A `## News & discussion` table (Story | Source | Summary) between `## Across platforms` and `## Spotted` (`DATA_REPORT` in `src/core/strings.ts`), rows summarized through `summarizeRows`, at most 6, `cap` per source (default 1), newest first; a release post repeating a tracked repo's release of the same day is dropped in code (`repeat`). A row never makes the report on its own.
6. `community-trace.json` in the day folder, like the other traces; `fetched`/`judged` per source in its header.
7. Tests mirror the module (`__tests__/data/community.test.ts`) with one fixture feed per parser shape; AGENTS.md's Data engineering section and README's report description gain the new section.

## Done when

- Every feed in `data.community` returned items on an Actions run (step 1), recorded in this ticket.
- A run with `TYPESAFE_API_KEY` shows the table with 1–3 rows on a weekday and none on a quiet day, and the trace explains every drop.
- A follow-up note is added to this ticket's Comments naming the date two weeks on when the dbt Labs blog's kept share is read from the traces (the removal, if any, is a config edit, not part of this ticket).
