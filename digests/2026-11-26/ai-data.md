# Data Engineering 2026-11-26

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-26) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-26/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-26/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-26/ai-policy) · **🟨 Data Engineering**

> Vendor items: 9 | Projects: 26 | Active today: 3 | Stable releases: 1 | Prereleases skipped: 2 | Spotted: 0 | Generated: 2026-11-26 08:01 UTC

---

## Highlights

- − BigQuery users of the Storage API v1beta1 face its shutdown on August 31, 2027, after which calls fail with a NOT_FOUND error; the note says to migrate to the v1 API and update connectors and client libraries to versions defaulting to v1 by then.
- − Holders of legacy OpenSharing open recipient tokens issued before February 25, 2026 (expiring after February 25, 2027 or with no expiration) now auto-expire on February 25, 2027; Databricks recommends rotating them before then.
- BigQuery users of the AI.PREDICT and AI.EVALUATE functions now default to TabFM version 1.1 (Preview), which raises input limits to 80,000 sampled training rows and 128 feature columns.

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

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-24 | ⚠️ [Latest automatic expiration date for legacy OpenSharing open recipient tokens moved to February 25, 2027](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#latest-automatic-expiration-date-for-legacy-opensharing-open-recipient-tokens-moved-to-february-25-2027) | Recommended: rotate these tokens before February 25, 2027: OpenSharing open recipient tokens issued before February 25, 2026, with expiration dates after February 25, 2027, or with no expiration now auto-expire on February 25, 2027 (previously December 8, 2026), and rotated tokens use the new recipient-specific URL format. |
| 2026-11-24 | [Recipient-specific URLs for OpenSharing open recipients](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#recipient-specific-urls-for-opensharing-open-recipients) | In most regions, OpenSharing open recipients use a recipient-specific URL that includes the recipient ID in the host name, so recipients can allow egress to that host name instead of the shared regional one; existing URLs and tokens continue to work until they expire. |
| 2026-11-24 | [Directory-based access for OpenSharing SecureConnect (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#directory-based-access-for-opensharing-secureconnect-public-preview) | OpenSharing SecureConnect can deliver eligible tables and views to Azure Databricks recipients using serverless compute with directory-based access instead of per-file pre-signed URLs, and account admins can manage it from the account console Previews page. |
| 2026-11-23 | [Artifact Registry is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#artifact-registry-is-now-generally-available) | Container images can be stored as governed assets in Unity Catalog, browsed in Catalog Explorer, listed and managed with the `databricks software-artifacts` CLI commands, and deleted through the Software Artifacts API. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-25 | [Snowflake Native Apps support for FedRAMP on Azure for apps with containers (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-25-native-apps-spcs-azure-gov-ga) | Native Apps using Snowpark Container Services now support FedRAMP on Microsoft Azure, so containerized apps can be distributed to any Snowflake customer who can use them in a FedRAMP region. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-25 | ⚠️ [The BigQuery Storage API v1beta1 is deprecated and will be shut down on August 31, 2027](https://docs.cloud.google.com/bigquery/docs/release-notes#November_25_2026) | Migrate workloads from `v1beta1` to `v1` by August 31, 2027: after that date calls to the `v1beta1` endpoint fail with a `NOT_FOUND` error, so update connectors and client libraries to versions that default to the `v1` API. |
| 2026-11-25 | [You can use cross-cloud connections to query data in AWS, Azure, and Salesforce Data 360 from all BigQuery regions with more feature availability than standard connections that use BigQuery Omni (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_25_2026) | Cross-cloud connections can query data in AWS, Azure, and Salesforce Data 360 from all BigQuery regions, with more feature availability than standard connections that use BigQuery Omni. |
| 2026-11-24 | 🤖 [The following table-valued functions are now generally available (GA) in the query editor and as part of conversational analytics to help you analyze your data (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_24_2026) | The `ML.TREND`, `ML.SEASONALITY`, `ML.DETECT_CHANGE_POINTS`, and `ML.CORRELATION` table-valued functions can now be used in the query editor and in conversational analytics to surface directional trends, repeating seasonality, structural change points, and column correlations. |
| 2026-11-23 | 🤖 [Version 1.1 of the TabFM model is now available as the default model for the AI.PREDICT and AI.EVALUATE functions (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_23_2026) | Version 1.1 of `TabFM`, now the default for `AI.PREDICT` and `AI.EVALUATE`, raises input limits to 80,000 sampled training rows and 128 feature columns and reduces latency by up to 50x, so interactive queries return predictions in around 1 second and millions of rows can be scored in a single BigQuery job. |

---

## Open-source stack

### dlt

- **News:** [dltHub on Snowpark: new data without a new approval path](https://dlthub.com/blog/dlthub-on-snowpark-container-services) says dltHub now runs inside a Snowflake account on Snowpark Container Services, and that loading new sources does not require a new security review; Private Preview is open.

### DuckDB

- **News:** [I Don’t Want a Lesson in Computer Science!](https://duckdb.org/2026/11/25/star-trek-queries-duckdb.html) says DuckDB gave Claude a DuckDB database and the Enterprise crew’s actual lines to test whether the Enterprise computer now exists.

### Soda Core

- **Release:** [v4.32.0](https://github.com/sodadata/soda-core/releases/tag/v4.32.0) fixes contract handling by refusing two data sources with one name.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-25 | [Lessons from Getting an SPCS Native App onto the Snowflake Marketplace](https://medium.com/snowflake/lessons-from-getting-an-spcs-native-app-onto-the-snowflake-marketplace-6b1d1426d70c) | Snowflake on Medium | The author built a Snowflake Marketplace app, `JadeOrbit OmniLens AI`, that reads `ACCOUNT_USAGE` and uses Cortex for FinOps insights entirely inside the consumer's own account with no external API keys, and reports that listing it took two rounds of Snowflake's functional review. |
| 2026-11-25 | [From scanned homeowner tax records to a governed AI agent, entirely in SQL](https://medium.com/snowflake/from-scanned-homeowner-tax-records-to-a-governed-ai-agent-entirely-in-sql-8aa4b8fee8f0) | Snowflake on Medium | The author processed 16 Massachusetts and Connecticut property tax records in SQL, reporting 100% field accuracy on digital documents and 94% on scans, and added a Cortex Agent to produce a governed lead list without the data leaving Snowflake. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*