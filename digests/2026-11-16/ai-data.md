# Data Engineering 2026-11-16

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-16) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-16/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-16/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-16/ai-policy) · **🟨 Data Engineering** · [⬜ Weekly Diff](https://dboeter.github.io/daily-diff/#2026-11-16/ai-weekly) · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-16/ai-trends)

> Vendor items: 1 | Projects: 26 | Active today: 1 | Stable releases: 1 | Prereleases (not covered): 1 | Generated: 2026-11-16 09:26 UTC

---

## Highlights

- Terraform provider for Databricks v1.143.0 introduces a breaking change for users managing `databricks_app` resources: updates now use the asynchronous API and omitted fields are cleared (compute size resets to `MEDIUM`, autoscaling disabled, git source cleared), whereas the previous synchronous API ignored those changes.

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
| 2026-11-12 | 🤖 [Use Genie One as your Chrome new tab page (Beta)](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#use-genie-one-as-your-chrome-new-tab-page-beta) | The Genie One Chrome extension replaces the Chrome new tab page with Genie One from your Azure Databricks workspace, using your existing Azure Databricks sign-in and permissions and working with one chosen workspace when the extension is turned on. |

### Terraform provider for Databricks

- **Release:** [v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) switches `databricks_app` updates to the asynchronous API, now applying `compute_size`, `compute_min_instances`, and `compute_max_instances` changes that the synchronous API ignored; omitted fields are cleared (size resets to `MEDIUM`, scaling disabled, git source cleared). Fixes perpetual diffs by preserving sensitive connection options (`pem_key_passphrase`, `ssl_keystore_key`, `ssl_key_password`, `schema_registry_api_secret`) and ignoring whitespace-only PEM differences. Adds `databricks_assume_group_restricted_sharing_group` resource and data source, plus write-only attributes for `databricks_git_credential` and `databricks_connection`.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

Nothing new from Snowflake ([Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)), Azure / Fabric & GCP or Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: db-branch – database branches in seconds for AI agents and CI, via ZFS ([db-branch/db-branch](https://github.com/db-branch/db-branch)) | Hacker News | [42 points, 11 comments](https://news.ycombinator.com/item?id=50506940) | db-branch enables instant MySQL database branching using ZFS clones, clustered across VMs with ProxySQL routing for AI agents and CI. |
| [Please Implement A Quorum Database](https://transactional.blog/talk/please-implement-a-quorum-database) | Lobste.rs | [11 points, 0 comments](https://lobste.rs/s/hgicaq/please_implement_quorum_database) | The post argues that leaderless replication is both enjoyable and practical, advocating for a quorum database implementation. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*