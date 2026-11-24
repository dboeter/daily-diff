# Data Engineering 2026-11-24

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-24) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-24/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-24/ai-models) · **🟨 Data Engineering**

> Vendor items: 12 | Also new: 5 | Projects: 26 | Active today: 0 | Stable releases: 0 | Prereleases skipped: 1 | Spotted: 1 | Generated: 2026-11-24 09:41 UTC

---

## Highlights

- − Azure Databricks users of GPT-5 nano should migrate to GPT-6 Luna (recommended replacement) by December 11, 2026
- Azure Databricks workspaces with the compliance security profile enabled will use ai_forecast version 2 by default starting January 2027
- BigQuery users of AI.PREDICT and AI.EVALUATE functions now use TabFM model version 1.1 by default

---

## Action required

| Date | Item | Platform | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | Azure Databricks | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2026-12-11 | [GPT-5 and GPT-5 mini will be retired on December 11, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-and-gpt-5-mini-will-be-retired-on-december-11-2026) | Azure Databricks | Recommended: migrate GPT-5 to OpenAI GPT-6.1 Sol and GPT-5 mini to OpenAI GPT-6.1 Terra by December 11, 2026, when both models are retired. |
| 2026-12-11 | [GPT-5 nano will be retired on December 11, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-nano-will-be-retired-on-december-11-2026) | Azure Databricks | Migrate to GPT-6 Luna (the recommended replacement) before December 11, 2026: GPT-5 nano is retired on that date and API calls to it are not redirected afterward. |
| 2027-01-15 | [Upcoming breaking change: array_contains with a constant empty array will return NULL for a NULL value](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-breaking-change-array_contains-with-a-constant-empty-array-will-return-null-for-a-null-value) | Azure Databricks | Use `size(arr) > 0 AND array_contains(arr, value)` to keep prior results: starting on or after January 15, 2027, with ANSI mode enabled in Databricks Runtime 19 and above, `array_contains(arr, value)` returns NULL instead of false when arr is a constant empty array and value is NULL. `map_contains_key(map, key)` with a constant empty map changes the same way, so `NOT array_contains(arr, value)` no longer matches rows where value is NULL. |
| 2027-01-31 | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | BigQuery | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Azure Databricks | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | Azure Databricks | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-17 | ⚠️ 🤖 [GPT-5 nano will be retired on December 11, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-nano-will-be-retired-on-december-11-2026) | Migrate to GPT-6 Luna (the recommended replacement) before December 11, 2026: GPT-5 nano is retired on that date and API calls to it are not redirected afterward. |
| 2026-11-23 | 🤖 [ai_forecast version 2 will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#ai_forecast-version-2-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Starting January 2027, `ai_forecast` version 2 becomes the default for workspaces with the compliance security profile enabled, adding holidays, external covariates, and non-negative forecasts via a foundation model; queries without a specified version still use version 1. |
| 2026-11-23 | 🤖 [Search SharePoint content with Genie Search (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#search-sharepoint-content-with-genie-search-beta) | Genie Search can index files in SharePoint Online so Genie One can search them alongside other connected sources, with users seeing only files they already have access to in SharePoint. |
| 2026-11-23 | [Databricks Runtime 19: November 23, 2026](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-23-2026) | This runtime update includes Java upgraded from Zulu21.52+15-CA to Zulu21.52+203-CA, operating system security updates, and bug fixes. |
| 2026-11-20 | [OAuth authentication for webhook notification destinations is generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-authentication-for-webhook-notification-destinations-is-generally-available) | OAuth 2.0 client credentials can authenticate webhook notification destinations using an access token from a configured OAuth token endpoint. |
| 2026-11-19 | [New VARIANT manipulation functions](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#new-variant-manipulation-functions) | SQL functions for manipulating VARIANT values are supported in Databricks SQL and Databricks Runtime 19 and above: `variant_insert`, `variant_set`, `variant_delete`, `variant_array_append`, `variant_pick`, `variant_strip_nulls`, plus error-tolerant `try_variant_insert`, `try_variant_set`, and `try_variant_array_append`. |
| 2026-11-19 | 🤖 [Genie One enhancements](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#genie-one-enhancements) | Genie One adds Android push notifications for long-running prompts and scheduled tasks, and voice input for dictating prompts on web, desktop, and mobile (US and EU regions). It also lists workspace and other-folder skills registered in Genie Code, which cannot be edited in Genie One. |
| 2026-11-19 | 🤖 [Dashboard enhancements](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-enhancements) | Dashboard subscription emails now support up to 24 MB of combined attachments (up from 9 MB), and Genie Code for dashboard authoring more closely reproduces a screenshot's visual styling when recreating a dashboard from it. |
| 2026-11-17 | [Data Classification no longer rescans recreated tables or scans short-lived temporary tables](https://learn.microsoft.com/azure/databricks/release-notes/data-classification#data-classification-no-longer-rescans-recreated-tables-or-scans-short-lived-temporary-tables) | Data Classification now reduces ongoing scan costs for catalogs with frequently dropped and recreated tables or tables that exist only briefly; the change is automatic and requires no configuration. |

*Also new:* [Impact analysis in Unity Catalog lineage (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#impact-analysis-in-unity-catalog-lineage-beta)

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Azure / Fabric & GCP

| Date | Item | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-23 | 🤖 [Version 1.1 of the TabFM model is now available and is the default model used by the AI.PREDICT and AI.EVALUATE functions (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_23_2026) | BigQuery | TabFM model version 1.1 is the default model used by the `AI.PREDICT` and `AI.EVALUATE` functions. |
| 2026-11-23 | [Fabric on-demand billing and Zero-provisioned (F0) Capacity (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Fabric-on-demand-billing-and-Zero-provisioned-F0-Capacity/ba-p/5377585) | Microsoft Fabric | Fabric introduces on-demand billing with a new `F0` SKU for zero upfront commitment and a hybrid option pairing any traditional `F` SKU with on-demand billing, which can be selectively enabled per workload (such as Data Factory or Data Warehouse). Usage thresholds can be set per on-demand billing category for governance and spend control. |
| 2026-11-23 | [On-demand billing for Fabric Data Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/On-demand-billing-for-Fabric-Data-Warehouse-Preview/ba-p/5376329) | Microsoft Fabric | On-demand billing for Fabric Data Warehouse lets you use dedicated compute when your warehouse needs it and pay for only the compute you consume, fitting variable or intermittent workloads; you can control how much compute each workspace can use and monitor actual consumption. |

*Also new:* [The reservation_override_mode and disable_on_demand_billing reservation and billing controls (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_23_2026) · [Scalar User-defined functions (UDFs) in Microsoft Fabric Data Warehouse (Generally Available)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Scalar-User-defined-functions-UDFs-in-Microsoft-Fabric-Data/ba-p/5399753) · [[In preview] Public Preview: Azure Database for PostgreSQL enhanced Burstable tier (Basv2)](https://azure.microsoft.com/updates?id=574535) · [You can now use the built-in embeddinggemma-2 model in the AI.EMBED function](https://docs.cloud.google.com/bigquery/docs/release-notes#November_23_2026)

---

## Releases this week

| Date | Project | Version | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-23 | [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks) | [v1.145.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.145.0) | Adds resources and data sources for `databricks_lakewatch_parser` and `databricks_lakewatch_parser_version`, plus data sources for `databricks_lakewatch_builtin_parser` and `databricks_lakewatch_builtin_parser_version`. |

---

Nothing new from Snowflake ([Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)) or Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Ride the SQL curve from basics to mastery](https://sqlride.com/) | Hacker News | [31 points, 7 comments](https://news.ycombinator.com/item?id=50593006) | — |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*