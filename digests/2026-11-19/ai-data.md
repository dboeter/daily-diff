# Data Engineering 2026-11-19

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-19) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-19/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-19/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-19/ai-policy) · **🟨 Data Engineering**

> Vendor items: 14 | Also new: 8 | Projects: 26 | Active today: 2 | Stable releases: 1 | Prereleases skipped: 1 | Spotted: 0 | Generated: 2026-11-19 07:10 UTC

---

## Highlights

- − Databricks users of Gemini 3.6 Flash: the model is retired as of November 19, 2026, and API calls are automatically redirected to Gemini 3.8 Flash, the recommended replacement, at the same price.
- Lakewatch query page users: TIMERANGE_NOW() now returns the end of the selected time range instead of the current time, letting you test detection rule predicates against historical data.
- Databricks account admins can now set an account-wide retention period of 30 to 3,650 days for supported system tables; data retained beyond the first 395 days incurs Databricks storage charges.

---

## Action required

| Date | Item | Platform | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-19 | [Gemini 3.6 Flash is retired](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-is-retired) | Azure Databricks | Gemini 3.6 Flash is retired as of November 19, 2026, with API calls automatically redirected to Gemini 3.8 Flash, the recommended replacement, at the same price. |
| 2026-11-19 | [Gemini 3.6 Flash will be retired on November 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) | Azure Databricks | API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide. |
| 2026-11-30 | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | Azure Databricks | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | BigQuery | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Azure Databricks | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | Azure Databricks | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-19 | ⚠️ 🤖 [Gemini 3.6 Flash is retired](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-is-retired) | Gemini 3.6 Flash is retired as of November 19, 2026, with API calls automatically redirected to Gemini 3.8 Flash, the recommended replacement, at the same price. |
| 2026-11-16 | ⚠️ [TIMERANGE_NOW() on the Lakewatch query page uses the selected time range](https://learn.microsoft.com/azure/databricks/release-notes/lakewatch#timerange_now-on-the-lakewatch-query-page-uses-the-selected-time-range) | `TIMERANGE_NOW()` on the Lakewatch query page now returns the end of the selected time range instead of the current time, so you can test a detection rule's predicates against historical data. |
| 2026-11-18 | [Configurable retention for system tables is generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#configurable-retention-for-system-tables-is-generally-available) | Account admins can set an account-wide retention period from 30 to 3,650 days for supported system tables; the first 395 days are free and data retained beyond 395 days incurs Databricks storage charges. |
| 2026-11-18 | 🤖 [Evaluate streaming responses incrementally with service policies (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#evaluate-streaming-responses-incrementally-with-service-policies-beta) | Model output policies now default to streaming evaluation, including existing policies, and released text can't be recalled; `Full response evaluation` can be chosen to buffer the response. |
| 2026-11-17 | [Lakebase streaming sink is generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#lakebase-streaming-sink-is-generally-available) | The Lakebase streaming sink now supports `Trigger.AvailableNow()` on serverless jobs and notebooks, and on Databricks Runtime 19 and above also supports merge strategies and additive schema evolution (`mergeSchema`); writing to an external PostgreSQL database through a Unity Catalog connection is in Public Preview. |
| 2026-11-17 | [JDBC Unity Catalog connections are now available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#jdbc-unity-catalog-connections-are-now-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | JDBC Unity Catalog connections, including SSL certificate support, are now on by default for workspaces with the compliance security profile enabled, letting you connect to external databases with a custom JDBC driver under access governed by Unity Catalog. |
| 2026-11-16 | [Azure Databricks on Azure Government is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#azure-databricks-on-azure-government-is-available-in-beta) | A new Azure Databricks environment in Azure Government is open to all customers in Beta and must not be used to process Controlled Unclassified Information (CUI) or run production workloads. |
| 2026-11-13 | [Metric view parameters are generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#metric-view-parameters-are-generally-available) | Parameters in metric views bind values at query time so one metric view definition serves many query variants; querying a metric view that defines parameters requires Databricks Runtime 18.2 or above. |

*Also new:* [Service policies protect embedding inputs (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#service-policies-protect-embedding-inputs-beta) · [Value lists for AI/BI dashboard parameters are generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#value-lists-for-aibi-dashboard-parameters-are-generally-available) · [Genie Code analysis for alerts is in Beta](https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#genie-code-analysis-for-alerts-is-in-beta) · [Configure materialization TTLs for individual OpenSharing recipients](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#configure-materialization-ttls-for-individual-opensharing-recipients)

### Terraform provider for Databricks

- **Release:** [v1.144.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.144.0) adds `statement_timeout` support for all SQL warehouse types, with explicit `0` clearing the override.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-18 | [Schema detection and evolution for structured types (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-18-structured-type-inference) | Snowflake can create structured `OBJECT`, `ARRAY`, and `MAP` columns from the nested data in Parquet, JSON, Avro, and ORC files; when you load them with `COPY INTO` or Snowpipe, schema evolution adds new structured columns and fields as your data evolves. |
| 2026-11-18 | 🤖 [Retrieve Cortex Search (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-18-cortex-search-retrieve-ga) | The `CORTEXSEARCHRETRIEVE` table function runs low-latency Cortex Search queries directly from SQL, either one query at a time or one query per input row with a `LATERAL` join. |
| 2026-11-18 | 🤖 [Cortex Agent SDK (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-18-cortex-agent-sdk-ga) | The Cortex Agent SDK supports Python and TypeScript at version 1.0.0 and lets you build applications that run Cortex Agents and Cortex Code, stream responses, maintain conversations and threads, and reconnect to long-running work. |

*Also new:* [Prompt caching for Cortex AI Functions](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-18-cortex-prompt-caching) · [Log mode for prompt injection guardrails](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-18-prompt-injection-guardrails-log-mode) · [AI_EXTRACT citations (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-18-ai-extract-citations)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-18 | [You can manage and version control SQL scripts and notebooks with BigQuery Studio Git repositories (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_18_2026) | BigQuery | BigQuery Studio Git repositories let you manage and version control SQL scripts and notebooks through a streamlined, folder-based integration with remote Git repositories. |
| 2026-11-18 | [Lakehouse supports BigQuery row-level security and column-level security with dynamic data masking on Apache Iceberg tables in the Lakehouse runtime catalog ( GA )](https://docs.cloud.google.com/bigquery/docs/release-notes#November_18_2026) | BigQuery | Lakehouse supports BigQuery row-level security and column-level security with dynamic data masking on Apache Iceberg tables in the Lakehouse runtime catalog, managed with GoogleSQL DDL statements in BigQuery; on catalogs that use credential vending mode, the Apache Iceberg REST catalog endpoint vends storage credentials only to principals that have unmasked access to every protected column and, if the table has row-level access policies, unfiltered row access. |
| 2026-11-18 | 🤖 [[In preview] Public Preview: AI-powered application and database modernization with Modernize CLI](https://azure.microsoft.com/updates?id=579943) | Azure updates | Modernize CLI brings application and database modernization together as one connected, agentic journey, assessing application architecture, dependencies, and cloud readiness while discovering the databases the application relies on. |

*Also new:* [You can query the INFORMATION_SCHEMA.ROW_ACCESS_POLICIES view to retrieve metadata about active row-level access policies and inspect filter predicates across a dataset or region (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_18_2026)

---

## Open-source stack

### Polars

- **News:** The Polars blog presents [Distributed Polars on Ray](https://pola.rs/posts/ray-actors/), describing how to run distributed Polars queries on the Ray cluster you already operate without manual partitioning.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*