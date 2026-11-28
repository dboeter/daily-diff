# Data Engineering 2026-11-28

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-28) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-28/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-28/ai-models) · **🟨 Data Engineering**

> Vendor items: 0 | Projects: 26 | Active today: 1 | Stable releases: 1 | Prereleases skipped: 0 | Spotted: 0 | Generated: 2026-11-28 07:32 UTC

---

## Highlights

- No item stands out today.

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
| 2027-02-25 | [Latest automatic expiration date for legacy OpenSharing open recipient tokens moved to February 25, 2027](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#latest-automatic-expiration-date-for-legacy-opensharing-open-recipient-tokens-moved-to-february-25-2027) | Azure Databricks | Recommended: rotate these tokens before February 25, 2027: OpenSharing open recipient tokens issued before February 25, 2026, with expiration dates after February 25, 2027, or with no expiration now auto-expire on February 25, 2027 (previously December 8, 2026), and rotated tokens use the new recipient-specific URL format. |
| 2027-08-19 | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | Azure Databricks | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |
| 2027-08-31 | [The BigQuery Storage API v1beta1 is deprecated and will be shut down on August 31, 2027](https://docs.cloud.google.com/bigquery/docs/release-notes#November_25_2026) | BigQuery | Migrate workloads from `v1beta1` to `v1` by August 31, 2027: after that date calls to the `v1beta1` endpoint fail with a `NOT_FOUND` error, so update connectors and client libraries to versions that default to the `v1` API. |

---

## Databricks

### delta-rs

- **Release:** [rust-v1.1.5](https://github.com/delta-io/delta-rs/releases/tag/rust-v1.1.5) is a patch release of `deltalake-core` 1.1.5 on the `release/1.x` line, which stays on `buoyant_kernel` 0.28. It fixes optimize so it no longer commits over a concurrent delete when `min_commit_interval` splits the work, by passing the files optimize reads to the conflict checker, and fixes a not-matched-by-source merge so it keeps one copy of a target row that is matched twice.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

Nothing new from Snowflake ([Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)), Azure / Fabric & GCP or Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*