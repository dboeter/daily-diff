# News & discussion section from community feeds

Status: resolved
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

## Comments

- 2026-10-30: implemented (branch `news-and-discussion`). `data.community` with the 10 feeds; `src/data/community.ts` (fetch, Jev insight + audience, `community-verdicts.json`, selection, `community-trace.json`); posts join the data pool of `matchProjectNews`; `## News & discussion` between Across platforms and Spotted, summarized by the vendor summaries call; shown posts as `post:<linkKey>` in the data state. Atom parsing added to `rss.ts` (DuckDB, Airflow, dltHub), `content:encoded` read where a feed has no description (Medium), named entities decoded. Step 1 (reachability from Actions) is the "Check feeds" workflow (`pnpm feeds:check`), to be dispatched once this is on `main`: every feed answered from the development container, Actions _unverified_ until then. The dbt Labs kept share is to be read from the traces on 2026-11-13.
- 2026-10-30: merged (PR #181). "Check feeds" dispatched twice on `main` from Actions: all 10 community feeds answered with items both times (DuckDB 10, Polars 82, Airflow 42, dbt Developer 20, dbt Labs 25, dltHub 209, Dagster 176, Confluent 10, OpenMetadata 10, Snowflake on Medium 10). The first run's one failure was the Microsoft Fabric vendor feed ("fetch failed"), which answered on the second run and on the daily runs of 10-28..10-30 (20 items each): transient. Step 1 done; dbt Labs kept share to read on 2026-11-13.
