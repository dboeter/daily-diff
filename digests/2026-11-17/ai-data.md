# Data Engineering 2026-11-17

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-17) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-17/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-17/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-17/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Also new: 4 | Projects: 26 | Active today: 1 | Stable releases: 1 | Prereleases (not covered): 1 | Generated: 2026-11-17 07:44 UTC

---

## Highlights

- Databricks users starting new streaming queries in real-time mode on Runtime 19 now filter late events against the live watermark and evict state sooner by default; to keep the previous behavior, set `spark.databricks.streaming.realTimeMode.realTimeWatermark.enabled` to false before starting the query (checkpoint restarts are unaffected).
- Azure Databricks users ingesting PostgreSQL change data can now do so with the PostgreSQL integrated CDC pipeline (Beta), which needs no separate ingestion gateway.

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
| 2026-11-16 | ⚠️ [Databricks Runtime 19: November 16, 2026](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-16-2026) | New streaming queries in real-time mode use real-time watermark propagation by default; stateful operators advance the event-time watermark within a batch, so late events are filtered against the live watermark and state is evicted sooner. Queries restarted from an existing checkpoint keep their original behavior, and to keep the previous behavior for a new query, set `spark.databricks.streaming.realTimeMode.realTimeWatermark.enabled` to false before starting it. |
| 2026-11-18 | 🤖 [Genie Code CLI is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-code-cli-is-now-generally-available) | Genie Code CLI is managed the same way as Genie Code in the workspace; admins manage one Genie Code budget across the CLI and workspace, and users can apply their free monthly Genie usage in the CLI. |
| 2026-11-16 | [IP functions will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#ip-functions-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | IP functions will be available by default for workspaces with the compliance security profile enabled, letting users work with IP addresses and CIDR blocks, including joins on them. |
| 2026-11-16 | [Governed tag propagation supports classic compute (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#governed-tag-propagation-supports-classic-compute-beta) | Governed tag propagation supports classic compute running Databricks Runtime 19 or above, in addition to serverless compute; governed tags on a source propagate to the tables and views derived from it on either compute type. |
| 2026-11-16 | 🤖 [Share Unity Catalog agent skills with OpenSharing and Azure Databricks Marketplace (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#share-unity-catalog-agent-skills-with-opensharing-and-azure-databricks-marketplace-beta) | Providers can add Unity Catalog agent skills to OpenSharing shares and Azure Databricks Marketplace listings; Databricks-to-Databricks recipients get read-only access to each shared skill in the catalog they create from the share, and provider changes reach recipients asynchronously. |
| 2026-11-15 | [PostgreSQL integrated CDC pipeline is now in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#postgresql-integrated-cdc-pipeline-is-now-in-beta) | The PostgreSQL integrated CDC pipeline lets you ingest change data from PostgreSQL into Azure Databricks using a single integrated CDC pipeline with no separate ingestion gateway. |
| 2026-11-13 | [External access to views through the Iceberg REST catalog is in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#external-access-to-views-through-the-iceberg-rest-catalog-is-in-beta) | External Iceberg engines can query Unity Catalog views over Iceberg-compatible tables through the Iceberg REST catalog. |
| 2026-11-12 | [Budgets now support daily thresholds in addition to monthly thresholds](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#budgets-now-support-daily-thresholds-in-addition-to-monthly-thresholds) | Budgets scoped to Unity Gateway, including budgets for Genie, support daily per-user thresholds in addition to monthly per-user thresholds; you can set a daily threshold, a monthly threshold, or both, with separate alert, webhook, and block usage actions for each period, and daily thresholds reset at 00:00 UTC. |
| 2026-11-11 | [Serverless rate limits are now in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#serverless-rate-limits-are-now-in-beta) | Serverless rate limits let you limit Spark executor autoscaling for serverless jobs and pipelines by setting a size on an automated compute object. |

*Also new:* [Submit Databricks support cases from your workspace with the Get support form](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#submit-databricks-support-cases-from-your-workspace-with-the-get-support-form)

### Terraform provider for Databricks

- **Release:** [v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) switches `databricks_app` to the asynchronous Apps update API, now applying `compute_size`, `compute_min_instances`, and `compute_max_instances` changes that were previously ignored; omitted fields are cleared or reset to defaults. Fixes perpetual diffs by retaining configured secret values (`pem_key_passphrase`, `ssl_keystore_key`, `ssl_key_password`, `schema_registry_api_secret`) and ignoring whitespace-only differences in PEM-encoded options for `databricks_connection`. Adds `databricks_assume_group_restricted_sharing_group` resource and data source, plus write-only attributes `personal_access_token_wo`/`personal_access_token_wo_version` for `databricks_git_credential` and `options_wo`/`options_wo_version` for `databricks_connection`.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-16 | 🤖 [Create, evaluate, and optimize Cortex AI Functions with Cortex AI Function Studio (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-16-cortex-ai-function-studio-ga) | Cortex AI Function Studio enables organizations to create, evaluate, and optimize production-ready Cortex AI Functions for unstructured and multimodal data workflows, automating prompt engineering, model selection, benchmarking, and optimization. |
| 2026-11-16 | 🤖 [Cortex AI Function Optimization for more efficient AI implementations (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-16-ai-function-optimization-ga) | Cortex AI Function Optimization automatically searches across prompts and models for improved implementations of custom AI Functions; using the `AIFUNCTIONOPTIMIZATION` experiment type, customers can evaluate multiple model candidates. |
| 2026-11-16 | [SHOW GRANTS TO ... INCLUDE HIERARCHY (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-16-show-grants-include-hierarchy) | You can add `INCLUDE HIERARCHY` to `SHOW GRANTS TO` statements to list the grants held by every role in a grantee's role hierarchy, not only the grants made directly to that role or user. |

*Also new:* [SCIM provisioning for organization users and organization user groups (Private preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-16-organization-scim-private-preview) · [Google Gemini 4 Carbon and Hydrogen models (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-gemini-4-carbon-hydrogen-preview) · [AI_COMPLETE adds support for Twelve Labs Pegasus 1.5 (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-16-ai-complete-pegasus-1-5-preview)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

Nothing new from Azure / Fabric & GCP or Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | [From Streamlit to Snowflake App Runtime: A Demo Migration](https://medium.com/snowflake/from-streamlit-to-snowflake-app-runtime-a-demo-migration-19e6e81d9873) | Snowflake on Medium | The author migrated the Apache Ossie demo from Streamlit in Snowflake to Snowflake App Runtime as a Next.js app; the Ossie YAML and a Snowflake semantic view kept metric definitions outside the interface, and the demo answered one question with 115,550 without a semantic view versus 103,200 with it. |
| 2026-11-17 | [I benchmarked Snowflake Postgres mirroring for two days. Here are the numbers.](https://medium.com/snowflake/i-benchmarked-snowflake-postgres-mirroring-for-two-days-here-are-the-numbers-b50eba22b8de) | Snowflake on Medium | The author benchmarked Snowflake Postgres mirroring for two days on the smallest instance that supports mirroring; new rows show up in `TABLE$live` after ~26 s median and ~37 s p90, regardless of whether the refresh interval is 30 seconds or 10 minutes, and the table lags behind `$live` by up to one refresh interval. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Generate QR Codes with Pure SQL in PostgreSQL - Tanel Poder Blog](https://tanelpoder.com/posts/generate-qr-code-with-pure-sql-in-postgres/) | Lobste.rs | [1 point, 0 comments](https://lobste.rs/s/0ficdv/generate_qr_codes_with_pure_sql) | The author describes building a QR-code generator for PostgreSQL as a single pure SQL statement, requiring no external libraries or Postgres extension. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*