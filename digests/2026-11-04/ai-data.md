# Data Engineering 2026-11-04

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-04) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-04/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-04/ai-models) · **🟨 Data Engineering**

> Vendor items: 12 | Projects: 27 | Active today: 2 | Stable releases: 1 | Prereleases (not covered): 1 | Generated: 2026-11-04 06:01 UTC

---

## Highlights
- dbt Core v2.0.11 renames `--run-cache-mode` to `--state-mode` (deprecated alias kept) — dbt Core users must update scripts and CI pipelines using the old flag.
- Snowflake Cortex AI Gateway reaches GA — Snowflake customers get a single governed endpoint for AI inference with request tracing and spend attribution per user.
- Microsoft Fabric adds materialized views and streaming tables to Mirrored Azure Databricks catalogs — Fabric workspaces mirroring Unity Catalog can now read those object types via shortcuts without replication.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-03 | [Trigger Lakeflow Jobs when upstream jobs complete (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#trigger-lakeflow-jobs-when-upstream-jobs-complete-beta) | Lakeflow Jobs can now be triggered when upstream jobs complete, including across workspaces sharing the same Unity Catalog metastore, by configuring dependencies on the downstream job. |
| 2026-11-02 | [Zerobus Ingest into default storage is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zerobus-ingest-into-default-storage-is-now-generally-available) | Zerobus Ingest in Lakeflow Connect now supports ingesting into tables backed by default storage. |
| 2026-11-01 | 🤖 [AI Functions usage is now included in Unity Gateway budgets](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#ai-functions-usage-is-now-included-in-unity-gateway-budgets) | Unity Gateway budgets now track spend from AI Functions including `ai_parse_document`, `ai_extract`, and `ai_classify` across batch and real-time execution paths starting November 1, 2026. |
| 2026-10-30 | [Monitor data freshness in Lakeflow Connect database connector pipelines (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#monitor-data-freshness-in-lakeflow-connect-database-connector-pipelines-public-preview) | A new Data freshness column in Lakeflow Connect database connector pipelines shows time since latest source commit ingested for CDC tables across SQL Server, PostgreSQL, MySQL, and Oracle sources; data freshness and end-to-end lag can be queried from the event log and alerted on. |
| 2026-10-29 | [Data quality monitoring anomaly detection is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#data-quality-monitoring-anomaly-detection-is-now-generally-available) | Enable anomaly detection at the schema level to monitor freshness and completeness of all tables based on historical patterns; results are stored in `system.data_quality_monitoring.table_results`. |
| 2026-10-28 | [Request for access is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#request-for-access-is-now-generally-available) | Users can request privileges on Unity Catalog objects from anywhere in Azure Databricks and track request status in Catalog Explorer. |

*Also new:* [Okta connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#okta-connector-is-available-in-beta) · [User-aware workspace instructions for Genie One](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#user-aware-workspace-instructions-for-genie-one) · [Control Lakebase sink upserts with merge strategies](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#control-lakebase-sink-upserts-with-merge-strategies)

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-03 | 🤖 [Cortex AI Gateway inference, observability, and cost management (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-cortex-ai-gateway-ga) | Cortex AI Gateway provides a single governed endpoint for AI model inference with full request tracing and spend attribution to users. |
| 2026-11-03 | 🤖 [Snowflake CoCo for Excel and Snowflake CoCo for Google Sheets (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-coco-excel-sheets-preview) | Snowflake CoCo adds a chat pane inside Excel and Google Sheets connected to live Snowflake data, enabling natural language or SQL queries, pivot tables, charts, and formulas. |
| 2026-11-03 | 🤖 [Google Gemini 4 Argon model (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-gemini-4-argon-ga) | The `gemini-4-argon` model is now generally available for use in AI Functions. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-03 | Microsoft Fabric | [Announcing support for Materialized views and streaming tables in Mirrored Azure Databricks catalog](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Announcing-support-for-Materialized-views-and-streaming-tables/ba-p/5377928) | Mirrored Azure Databricks catalogs in Microsoft Fabric now support materialized views and streaming tables alongside tables, providing read-only access via shortcuts without data replication; configure which Unity Catalog catalogs, schemas, and objects to mirror. |
| 2026-11-03 | Microsoft Fabric | 🤖 [OneLake: The file system for agent-first data engineering](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/OneLake-The-file-system-for-agent-first-data-engineering/ba-p/5383035) | OneLake introduces a remotely hosted MCP server (preview) allowing agents to explore and manage data without a local server, positioning OneLake as the file system for agent-first data engineering with Fabric engines as programs and AI prompts as the terminal. |
| 2026-11-03 | Azure updates | [[In preview] Public Preview: Extend immutability for PITR backups for Azure SQL Database and Azure SQL Managed Instance](https://azure.microsoft.com/updates?id=579305) | PITR backup immutability can now be extended beyond the default 7 days to match configured PITR retention, useful for financial customers requiring 35-day retention. |

---

## Open-source stack

### dbt Core

- **Release:** v2.0.11 renames `--run-cache-mode` to `--state-mode` (with deprecated alias), adds BigQuery query reservation config, improves parse progress bar, introduces state config to ignore external modifications on views, supports `allow_jinja_file_extensions`, enables authenticated private S3 downloads, adds `DBT_CLOUD_LOGIN_HOST` for SSO, includes resource filter in lineage view, and provides a feature flag registry via `--feature` and `DBT_ENGINE_FEATURES`. [v2.0.11](https://github.com/dbt-labs/dbt/releases/tag/v2.0.11)

### dlt

- **News:** The [Building pipelines has become easy. Knowing if they work correctly is now easy, too](https://dlthub.com/blog/introducing-pipeline-observability) blog announces the general availability of dltHub's observability UI, providing a context graph interface to help detect missing data issues that aren't visible from surface-level pipeline checks.

**Quiet today:** [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata), [SQLFluff](https://github.com/sqlfluff/sqlfluff)

---

## Across platforms

- AI cost governance: Databricks Unity Gateway budgets now include AI Functions (`ai_parse_document`, `ai_extract`, `ai_classify`) spend (GA Nov 1); Snowflake Cortex AI Gateway GA provides request tracing and spend attribution per user — both platforms now meter AI SQL functions.
- Agent-style data access: Snowflake CoCo adds a chat pane in Excel/Sheets (Preview); Fabric OneLake exposes a hosted MCP server (Preview) so agents explore data — similar copilot/agent entry points, different surfaces.
- Cross-cloud catalog mirroring: Fabric mirrors Unity Catalog materialized views and streaming tables read-only via shortcuts; Databricks Lakeflow Jobs now trigger across workspaces sharing a metastore — both enable multi-workspace lineage without data movement.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-03 | [Before You Model a Single Table: Data Modelling Questions to Ask for AI Agents in Snowflake](https://medium.com/snowflake/before-you-model-a-single-table-data-modelling-questions-to-ask-for-ai-agents-in-snowflake-0ac71edf8172) | Snowflake on Medium | The author, a Snowflake Architect, outlines six modelling questions (grain, shape, semantic views, business meaning, performance, evaluation) to resolve before building Cortex Agents, noting that agents lack the tacit knowledge analysts carry and every schema ambiguity becomes a risky inference. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [The Internals of PostgreSQL](https://www.interdb.jp/pg/index.html) | Hacker News | [205 points, 13 comments](https://news.ycombinator.com/item?id=50358702) | — |
| [Postgres 19 REPACK: Built-In Online Table Bloat Cleanup](https://www.snowflake.com/en/blog/engineering/postgres-19-repack-table-bloat/) | Lobste.rs | [4 points, 0 comments](https://lobste.rs/s/uutnr5/postgres_19_repack_built_online_table) | PostgreSQL 19 introduces REPACK and REPACK CONCURRENTLY to reclaim bloated table space online without downtime, external extensions, or table locks. |
| [Designing a planned switchover for minimum disruption](https://planetscale.com/blog/designing-a-planned-switchover-for-minimum-disruption) | Lobste.rs | [2 points, 0 comments](https://lobste.rs/s/cwxne0/designing_planned_switchover_for) | Neki designs low-disruption Postgres primary switchovers using preflight checks, query buffering, synchronous replication, and fast rollback. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*