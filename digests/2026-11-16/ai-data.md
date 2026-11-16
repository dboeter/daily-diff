# Data Engineering 2026-11-16

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-16) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-16/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-16/ai-models) · **🟨 Data Engineering** · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-16/ai-trends)

> Vendor items: 1 | Projects: 26 | Active today: 0 | Stable releases: 0 | Prereleases (not covered): 1 | Generated: 2026-11-16 06:09 UTC

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
| 2026-11-12 | 🤖 [Use Genie One as your Chrome new tab page (Beta)](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#use-genie-one-as-your-chrome-new-tab-page-beta) | The Genie One Chrome extension lets users open Genie One from their Azure Databricks workspace directly in new Chrome tabs, using existing sign-in and permissions for a single chosen workspace to ask questions, search tools, or open dashboards without navigating to the workspace first. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

Nothing new from Snowflake ([Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)), Azure / Fabric & GCP or Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: db-branch – database branches in seconds for AI agents and CI, via ZFS ([db-branch/db-branch](https://github.com/db-branch/db-branch)) | Hacker News | [39 points, 10 comments](https://news.ycombinator.com/item?id=50506940) | db-branch provides instant MySQL database branching using ZFS clones with ProxySQL routing across VMs for AI agents and CI. |
| [Please Implement A Quorum Database](https://transactional.blog/talk/please-implement-a-quorum-database) | Lobste.rs | [10 points, 0 comments](https://lobste.rs/s/hgicaq/please_implement_quorum_database) | The author argues that leaderless replication for quorum databases is both fun and practical to implement. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*