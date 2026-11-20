# Data Engineering 2026-11-20

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-20) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-20/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-20/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-20/ai-policy) · **🟨 Data Engineering**

> Vendor items: 14 | Also new: 6 | Projects: 26 | Active today: 7 | Stable releases: 5 | Prereleases skipped: 2 | Spotted: 5 | Generated: 2026-11-20 06:58 UTC

---

## Highlights

- Snowflake users with dynamic tables using the default `AUTO` refresh mode: dynamic tables now resolve to `ADAPTIVE` instead of `INCREMENTAL` when the definition supports incremental refresh.
- Databricks CLI users: v1.27.0 requires uninstalling the legacy `databricks-cli` package before installing the new `databricks` package from PyPI.
- Snowpark Python users calling `DataFrameReader.documents()` with a `schema` or `prompt`: v1.58.0 adds `INPUT_TOKENS` and `OUTPUT_TOKENS` columns, so schema fields can no longer be named like these columns.

---

## Action required

| Date | Item | Platform | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | Azure Databricks | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | BigQuery | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Azure Databricks | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | Azure Databricks | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-20 | [OAuth authentication for webhook destinations will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#oauth-authentication-for-webhook-destinations-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Starting on or after December 20, 2026, OAuth authentication becomes the default for webhook destinations in workspaces with the compliance security profile enabled (subject to region and compliance standard requirements); Azure Databricks obtains a token from the configured OAuth token endpoint using OAuth 2.0 client credentials, and existing webhook destinations retain their configured authentication. |
| 2026-11-19 | [Lakebase now supports Postgres 19](https://learn.microsoft.com/azure/databricks/release-notes/lakebase#lakebase-now-supports-postgres-19) | Lakebase supports Postgres 19, which is selected when creating a new project; the full list of supported versions is in Postgres compatibility. |
| 2026-11-18 | 🤖 [ai_forecast version 2 is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai_forecast-version-2-is-now-generally-available) | Version 2 of the `ai_forecast` function in Databricks SQL is powered by a research-optimized time series foundation model for improved out-of-the-box accuracy and adds built-in holiday support, external covariates, and non-negative forecasts. |
| 2026-11-18 | [OAuth M2M authentication for the Salesforce, ServiceNow, and Jira connectors](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-m2m-authentication-for-the-salesforce-servicenow-and-jira-connectors) | OAuth machine-to-machine (M2M) authentication uses the OAuth client credentials flow with no interactive sign-in for the Salesforce, ServiceNow, and Jira connectors in Lakeflow Connect; for Jira, M2M supports Jira Cloud only. |
| 2026-11-17 | [Databricks SQL version 2026.46 is rolling out in Current](https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202646-is-rolling-out-in-current) | — |
| 2026-11-16 | 🤖 [Genie Ontology snippets will soon be generally available and enabled by default](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#genie-ontology-snippets-will-soon-be-generally-available-and-enabled-by-default) | Genie Ontology automatically extracts and maintains business context from existing assets such as metric views, dashboards, SQL queries, and Genie Agents; enabled by default, it lets Genie One and Genie Code search the most relevant snippets from assets you have permission to access, improving response accuracy and speed. |

### Databricks CLI

- **Release:** [v1.27.0](https://github.com/databricks/cli/releases/tag/v1.27.0) makes the CLI installable from PyPI as `databricks` (via `uvx databricks`, `pipx install databricks`, or `pip install databricks`), shipping only the prebuilt binary; the legacy `databricks-cli` package must be uninstalled first because both provide a `databricks` command.

### dbt-databricks

- **Release:** [v1.13.1](https://github.com/databricks/dbt-databricks/releases/tag/v1.13.1) fixes materialized views with a Compatibility Mode location being dropped and lost when `use_safer_relation_operations` or a `partition_by` change would recreate them at the same location; it also fixes relation replacement no longer failing with `CANNOT_DROP_TAGGED_COLUMN` by unsetting tags on columns that a `table` model or incremental full refresh removes.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-20 | ⚠️ [AUTO refresh mode for dynamic tables resolves to ADAPTIVE](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-dynamic-tables-auto-resolves-to-adaptive) | Dynamic tables created with `REFRESHMODE = AUTO` (the default) now resolve to `ADAPTIVE` instead of `INCREMENTAL` when the definition supports incremental refresh, while definitions incompatible with incremental refresh still resolve to `FULL`. |
| 2026-11-19 | ⚠️ [Snowflake Data Clean Rooms updates](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-19-dcr) | In Snowflake Data Clean Rooms (Clean Rooms API Version 19.5), specifications whose `freeform_sql_policies` section names no policy are now rejected with a validation error, whereas previously such a section could satisfy the `require_freeform_sql_policy` check without attaching any policy to the data. |
| 2026-11-19 | [Code Bundles (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-19-code-bundles-ga) | Code Bundles let you package non-SQL code such as Python, Java, or Scala and run it on Snowflake warehouses or compute pools with a single `EXECUTE CODE BUNDLE` command, without building containers or wrapping logic in stored procedures. |
| 2026-11-19 | [Error logging and CHECK constraint enforcement for COPY INTO and Snowpipe (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-19-copy-snowpipe-error-logging-check-constraints-ga) | `COPY INTO` and Snowpipe can keep invalid rows out of your tables and record the rows they reject via error logging and `CHECK` constraint enforcement, so you can find and fix bad data with SQL. |
| 2026-11-16 | [Iceberg table properties in SQL (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-16-iceberg-table-properties-ga) | Iceberg table properties can be set on Snowflake-managed and writable externally managed Apache Iceberg™ tables with the `TABLEPROPERTIES` clause. |

*Also new:* [Snowflake App Runtime serverless compute and Workspaces development (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-19-snowflake-app-runtime-serverless-workspaces-preview) · [Data governance policy inheritance for Cortex Search (Public Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-17-cortex-search-data-governance-inheritance-preview) · [AI Governance (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-19-ai-governance-preview)

### Snowpark Python

- [v1.58.0](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.58.0) is a breaking change: `DataFrameReader.documents()` (Private Preview) reads with a `schema` or `prompt` now return the `AI_COMPLETE` token usage of each document in `INPUT_TOKENS` and `OUTPUT_TOKENS` columns, so a schema field can no longer be named like one of these columns. It also fixes `to_binary` and `try_to_binary` raising `TypeError` when the format was a `Column`.

**Quiet today:** [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-19 | 🤖 [You can now enable agent observability with the Data Engineering Agent to monitor the agent's token consumption, request volume, and model latency in Cloud Monitoring and inspect execution traces and …](https://docs.cloud.google.com/bigquery/docs/release-notes#November_19_2026) | Agent observability with the Data Engineering Agent lets you monitor token consumption, request volume, and model latency in Cloud Monitoring and inspect execution traces and tool calls in Cloud Trace. |
| 2026-11-19 | 🤖 [You can now create AI indexes using the CREATE AI INDEX statement to perform natural language searches across table columns with the AI.SEARCH function without manually generating embeddings or managi…](https://docs.cloud.google.com/bigquery/docs/release-notes#November_19_2026) | The `CREATE AI INDEX` statement creates AI indexes for natural language searches across table columns via the `AI.SEARCH` function, without manually generating embeddings or managing models. |
| 2026-11-19 | [You can use the validation service in the BigQuery Migration Service to verify that tables migrated from your source data warehouse match your target tables in BigQuery across schemas, aggregate metri…](https://docs.cloud.google.com/bigquery/docs/release-notes#November_19_2026) | The validation service in the BigQuery Migration Service verifies that tables migrated from your source data warehouse match the target tables in BigQuery across schemas, aggregate metrics, and row-level data. |

*Also new:* [[In preview] Public Preview: PostgreSQL 19 on Azure Database for PostgreSQL](https://azure.microsoft.com/updates?id=574587) · [[In preview] Public Preview: Database Agent for Azure Database for PostgreSQL](https://azure.microsoft.com/updates?id=579579) · [BigQuery generative AI functions now support the gemini-4-neon model](https://docs.cloud.google.com/bigquery/docs/release-notes#November_19_2026)

---

## Open-source stack

### Apache Airflow

- **News:** A Snowflake Medium post challenges the claim that Apache Airflow is dead for Snowflake pipelines, saying Snowflake’s new task graphs do not make Airflow DAGs obsolete: [Do You Still Need Airflow for Snowflake Pipelines? An Honest Answer From Someone Who’s Run Both](https://medium.com/snowflake/do-you-still-need-airflow-for-snowflake-pipelines-an-honest-answer-from-someone-whos-run-both-0e8d4a5a9036). It frames the question as whether teams still need Airflow for Snowflake orchestration.

### Dagster

- **Release:** [1.13.31](https://github.com/dagster-io/dagster/releases/tag/1.13.31) includes a breaking change to the `dagster` Claude Code plugin: it no longer reads `DAGSTER_CLOUD_MCP_URL`, so organizations in the EU region must add the EU server directly or authentication can fail. It fixes BigQuery and Snowflake I/O managers mishandling partition keys containing apostrophes or backslashes.

### Prefect

- **Release:** [3.9.4](https://github.com/PrefectHQ/prefect/releases/tag/3.9.4) fixes served flow run shutdown on Windows so it no longer needs a console-wide `CTRL_BREAK`. It fixes stale workers moving completed flow runs to `Pending`.

### Polars

- **News:** The Polars blog says Google and Polars launched `polars-bigquery`, a native I/O extension built on Google Cloud’s Rust libraries, and reports it loads BigQuery data into Polars 3x to 4x faster than previous standard approaches: [Accelerating Polars + BigQuery pipelines with the polars-bigquery package](https://pola.rs/posts/polars-bigquery/). It positions the package as a faster path for Polars + BigQuery pipelines.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Distributed, high-performance blob storage on SQLite](https://zerodha.tech/blog/high-performance-distributed-blob-storage/) | Hacker News | [278 points, 71 comments](https://news.ycombinator.com/item?id=50557537) | The source says its team built Blobasaur, a sharded, distributed SQLite-based blob-storage server for high-throughput blob reads and writes. |
| [PostgreSQL 19 Released](https://www.postgresql.org/about/news/postgresql-19-released-3449/) | Hacker News | [107 points, 7 comments](https://news.ycombinator.com/item?id=50560357) | The announcement says the PostgreSQL Global Development Group released PostgreSQL 19 on November 19, 2026. |
| Logitech Harmony IR code online database archive ([pickysysadmin/logitech-harmony-ir-archive](https://github.com/pickysysadmin/logitech-harmony-ir-archive)) | Hacker News | [85 points, 23 comments](https://news.ycombinator.com/item?id=50519778) | A GitHub archive preserves the complete set of IR codes and protocol formats used by Logitech Harmony remotes and hubs. |
| [Postgres 19 Repack: Faster, Built-In Table Bloat Cleanup](https://www.snowflake.com/en/blog/engineering/postgres-19-repack-table-bloat/) | Hacker News | [56 points, 8 comments](https://news.ycombinator.com/item?id=50569516) | — |
| [Postgres 19 is out, and it's available on Neon and Databricks Lakebase](https://www.databricks.com/blog/postgresql-19-available-lakebase) | Hacker News | [48 points, 19 comments](https://news.ycombinator.com/item?id=50568643) | Databricks says PostgreSQL 19 is available on Lakebase the same day the community released it. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*