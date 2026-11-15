# Data Engineering 2026-11-15

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-15) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-15/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-15/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-15/ai-policy) · **🟨 Data Engineering**

> Vendor items: 3 | Projects: 26 | Active today: 1 | Stable releases: 1 | Prereleases (not covered): 1 | Generated: 2026-11-15 06:12 UTC

---

## Highlights
- No item stands out today.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-19 | Azure Databricks | [Gemini 3.6 Flash will be retired on November 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) | API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide. |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-09 | [Databricks Runtime 19: November 9, 2026](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-9-2026) | Fixes real-time mode reservation liveness and occupied-slot accounting when tasks execute through Aether. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-11 | [Override per-user quota limits for specific users (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-limit-overrides) | Enables setting per-user, per-cycle credit limit overrides on a per-user quota with an optional expiration date. |

### Apache Polaris

- **Release:** [apache-polaris-1.9.0](https://github.com/apache/polaris/releases/tag/apache-polaris-1.9.0) publishes signed source and binary distributions, a Helm chart, Docker images (`apache/polaris:1.9.0` for the server and `apache/polaris-admin:1.9.0` for the admin tool), and Maven artifacts to Maven Central with SHA-512 checksums.

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-11 | [You can use the JSON_FLATTEN function to extract all non-array values that are either directly in the input JSON value or children of one or more consecutively nested arrays in the input JSON value](https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026) | Enables using the `JSON_FLATTEN` function to extract non-array values directly in JSON or from consecutively nested arrays. |

---

## Releases this week

| Project | Version | Date | Summary |
| :--- | :--- | :--- | :--- |
| [OpenMetadata](https://github.com/open-metadata/OpenMetadata) | [2.0.8-release](https://github.com/open-metadata/OpenMetadata/releases/tag/2.0.8-release) | 2026-11-13 | Fixes pipeline deletion to use Airflow's supported cleanup path, fixes Glue test connection to probe only configured databases and tables, fixes Hex ingestion to build working source links and create data models with SQL-cell column lineage, fixes Hex table and column lineage to terminate at the Hex data model, enables Power BI empty listings to soft-delete stale entities, and enables SSIS connections to accept Azure Data Lake Storage containers. |

---

Nothing new from Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---

## Across platforms

- No capability moved on two or more platforms this period.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*