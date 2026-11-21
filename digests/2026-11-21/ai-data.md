# Data Engineering 2026-11-21

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-21) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-21/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-21/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-21/ai-policy) · **🟨 Data Engineering**

> Vendor items: 11 | Projects: 26 | Active today: 1 | Stable releases: 1 | Prereleases skipped: 2 | Spotted: 0 | Generated: 2026-11-21 06:55 UTC

---

## Highlights

- − Databricks users of GPT-5 and GPT-5 mini: both models retire December 11, 2026; Databricks recommends migrating GPT-5 to OpenAI GPT-6.1 Sol and GPT-5 mini to OpenAI GPT-6.1 Terra by that date.
- Databricks users with ANSI mode enabled in Databricks Runtime 19 and above: starting January 15, 2027, `array_contains` with a constant empty array returns NULL instead of false when the value is NULL; to keep prior results, use `size(arr) > 0 AND array_contains(arr, value)`.

---

## Action required

| Date | Item | Platform | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | Azure Databricks | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2026-12-11 | [GPT-5 and GPT-5 mini will be retired on December 11, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-and-gpt-5-mini-will-be-retired-on-december-11-2026) | Azure Databricks | Recommended: migrate GPT-5 to OpenAI GPT-6.1 Sol and GPT-5 mini to OpenAI GPT-6.1 Terra by December 11, 2026, when both models are retired. |
| 2027-01-15 | [Upcoming breaking change: array_contains with a constant empty array will return NULL for a NULL value](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-breaking-change-array_contains-with-a-constant-empty-array-will-return-null-for-a-null-value) | Azure Databricks | Use `size(arr) > 0 AND array_contains(arr, value)` to keep prior results: starting on or after January 15, 2027, with ANSI mode enabled in Databricks Runtime 19 and above, `array_contains(arr, value)` returns NULL instead of false when arr is a constant empty array and value is NULL. `map_contains_key(map, key)` with a constant empty map changes the same way, so `NOT array_contains(arr, value)` no longer matches rows where value is NULL. |
| 2027-01-31 | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | BigQuery | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Azure Databricks | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | Azure Databricks | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-19 | ⚠️ 🤖 [GPT-5 and GPT-5 mini will be retired on December 11, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-and-gpt-5-mini-will-be-retired-on-december-11-2026) | Recommended: migrate GPT-5 to OpenAI GPT-6.1 Sol and GPT-5 mini to OpenAI GPT-6.1 Terra by December 11, 2026, when both models are retired. |
| 2026-11-16 | ⚠️ [Upcoming breaking change: array_contains with a constant empty array will return NULL for a NULL value](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-breaking-change-array_contains-with-a-constant-empty-array-will-return-null-for-a-null-value) | Use `size(arr) > 0 AND array_contains(arr, value)` to keep prior results: starting on or after January 15, 2027, with ANSI mode enabled in Databricks Runtime 19 and above, `array_contains(arr, value)` returns NULL instead of false when arr is a constant empty array and value is NULL. `map_contains_key(map, key)` with a constant empty map changes the same way, so `NOT array_contains(arr, value)` no longer matches rows where value is NULL. |
| 2026-11-20 | [Warehouse-level statement timeouts are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#warehouse-level-statement-timeouts-are-now-generally-available) | Statement timeouts can be set at the warehouse level via the `statement_timeout` field in the SQL warehouses API, Databricks SDKs, Terraform, or Declarative Automation Bundles. |
| 2026-11-20 | 🤖 [MCP tools in Genie Agents are generally available](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#mcp-tools-in-genie-agents-are-generally-available) | Genie Agents can attach external MCP servers registered in Unity Gateway, in addition to Databricks-provided connectors, and the Agent mode APIs support MCP tools. |
| 2026-11-20 | 🤖 [The Azure Databricks GitHub app will request permission to create and manage pull requests](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#the-azure-databricks-github-app-will-request-permission-to-create-and-manage-pull-requests) | The Azure Databricks GitHub app will request Read and write access to pull requests so Genie Code and Genie ZeroOps can create and manage them, with branch protection rules and required reviews still applying; if owners don't accept, nothing changes but those two tools can't create or manage pull requests. |
| 2026-11-19 | [Databricks-to-Databricks Delta Sharing across regulatory domains is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-to-databricks-delta-sharing-across-regulatory-domains-is-now-generally-available) | Delta Sharing across regulatory domains lets commercial workspaces share with AWS GovCloud, AWS GovCloud DoD, and Azure China, though sharing between Azure China and either AWS GovCloud or AWS GovCloud DoD is not supported. |
| 2026-11-19 | [Manage Lakewatch with the Databricks CLI (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/lakewatch#manage-lakewatch-with-the-databricks-cli-beta) | The `lakewatch` command group in the Databricks CLI manages datasources, parsers, and detection rules and updates per-catalog Lakewatch configuration, requiring Databricks CLI version 1.25.0 or above (parser commands need version 1.27.0 or above). |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-20 | [Postgres access roles for token authentication (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-postgres-token-access-roles-ga) | A Postgres access role for a Postgres user can be granted to Snowflake roles, application roles, or users, letting authorized callers generate short-lived tokens to connect as that Postgres user. |
| 2026-11-20 | 🤖 [AI_COMPLETE adds support for Snowflake Decision (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-ai-complete-snowflake-decision-public-preview) | `AI_COMPLETE` supports Snowflake Decision, a purpose-built model for high-throughput classification, scoring, and decision-making across massive datasets, letting organizations evaluate unstructured data against predefined criteria. |
| 2026-11-20 | 🤖 [AI_EXTRACT accuracy improvements (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-ai-extract-accuracy) | `AI_EXTRACT` delivers more accurate extraction of fields, lists, tables, and complex layouts, building on the improvements released on November 2, 2026. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-20 | [On-premises data gateway November 2026 release](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/On-premises-data-gateway-November-2026-release/ba-p/5430005) | Version 3000.342 strengthens gateway security, reliability, and diagnostics, updates dependencies, and improves Oracle DirectQuery and data transfers. It adds Gateway Dual Relay and compatibility with the November 2026 Power BI Desktop release so queries run the same in Power BI Desktop and cloud refreshes. |

---

## Open-source stack

### DuckDB

- **Release:** [v2.0.1](https://github.com/duckdb/duckdb/releases/tag/v2.0.1) is the first patch release of the 2.0 LTS line, shipping security patches and adding the ability to define custom extension repositories with only their hostname.
- **News:** In [Announcing DuckDB 2.0.1 LTS](https://duckdb.org/2026/11/20/announcing-duckdb-201.html), DuckDB presents 2.0.1 as the first patch of its 2.0 LTS line, citing bugfixes, performance improvements and security patches.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

## Releases this week

| Date | Project | Version | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-20 | [OpenMetadata](https://github.com/open-metadata/OpenMetadata) | [2.0.9-release](https://github.com/open-metadata/OpenMetadata/releases/tag/2.0.9-release) | OpenMetadata's maintenance release fixes unreliable MicroStrategy ingestion and incomplete lineage, missing Sigma element and formula lineage, inaccurate Oracle and Datalake sampling, BigQuery DDL cache collisions, MSSQL/AzureSQL schema-name changes and wrong GCS metrics; it applies only Approved dbt glossary terms, tightens secret masking and authorization, and caps `python-liquid` below version 3. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*