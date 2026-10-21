# Community and engineering sources

Status: needs-triage
Type: research

## Evidence

Every vendor source is a release-notes feed, so the report has no commentary, practice or discussion. The vendor product blogs were rejected in ticket 01 because they repeat the release notes; that reason does not cover engineering blogs or community sources.

## Question

Which sources add data engineering news and opinion at a useful volume, and how are they judged?

Candidates to check (feed exists, items a week, share relevant to a data engineer at a Databricks/Snowflake/Azure/GCP consultancy):

- Hacker News, Lobste.rs (`databases` tag) and r/dataengineering, filtered by data terms (DuckDB, Iceberg, lakehouse, dbt, Spark, Postgres…). The HN and Lobste.rs fetchers exist (`src/sources/`).
- Engineering blogs: DuckDB, dbt, Apache Iceberg, the Databricks and Snowflake engineering blogs (not the product blogs).
- One or two newsletters, e.g. Data Engineering Weekly.

## Done when

- A spike note in this file (`## Answer`): per candidate, feed URL, items over the last 14 days, how many a data engineer would want, and the overlap with the vendor feeds.
- A recommendation: which to add, the section they go in (a `## News & discussion` table like Policy Watch's News & commentary is the default), and the Jev question(s) that judge them, reusing `selectVendorItems`'s pipeline.
- Implementation is a follow-up ticket.
