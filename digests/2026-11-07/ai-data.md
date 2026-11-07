# Data Engineering 2026-11-07

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-07) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-07/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-07/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-07/ai-policy) · **🟨 Data Engineering**

> Vendor items: 14 | Projects: 26 | Active today: 4 | Stable releases: 3 | Prereleases (not covered): 1 | Generated: 2026-11-07 05:47 UTC

---

## Highlights
- Databricks: New jobs compute in the UI defaults to Auto access mode instead of Dedicated for new jobs; for Azure Databricks workspaces with the compliance security profile this default takes effect in December 2026.
- − BigQuery: Data Transfer Service for Shopify connector will drop support for the `legacyMode` and `permitSkuSharing` fields on January 31, 2027; affected transfers must be updated before then.
- Snowflake: Apache Iceberg tables can now be read and written across Snowflake accounts via Horizon Catalog without managing secrets (GA); affects multi-account Iceberg setups.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-09 | ⚠️ [New jobs compute defaults to Auto access mode](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#new-jobs-compute-defaults-to-auto-access-mode) | New jobs compute in the UI now defaults to `Auto` access mode instead of `Dedicated`; `Auto` uses `Standard` access mode unless a machine learning runtime, GPU instance type, or Databricks Runtime below 14.3 is selected, and cluster policies enforcing a different mode still take precedence. Existing jobs are unaffected; for workspaces with the compliance security profile this default takes effect in December 2026. |
| 2026-11-09 | ⚠️ [New jobs compute will soon default to Auto access mode for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#new-jobs-compute-will-soon-default-to-auto-access-mode-for-workspaces-with-the-compliance-security-profile-enabled) | Starting December 2026, new jobs compute created in the UI will default to `Auto` access mode in workspaces with the compliance security profile enabled, using `Standard` access mode unless a machine learning runtime, GPU instance type, or Databricks Runtime below 14.3 is selected, with cluster policies still taking precedence. |
| 2026-11-06 | [Install drivers for JDBC Unity Catalog connections from Maven](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#install-drivers-for-jdbc-unity-catalog-connections-from-maven) | JDBC drivers for Unity Catalog connections can now be installed from a Maven coordinate instead of uploading to a volume, requiring serverless compute, Databricks Runtime 19 or above, or SQL warehouses 2026.43 or above. |
| 2026-11-06 | [Restore a deleted Unity Catalog metastore with the REST API (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#restore-a-deleted-unity-catalog-metastore-with-the-rest-api-public-preview) | Account admins can restore a deleted Unity Catalog metastore by its ID via the REST API for up to 5 days after deletion. |
| 2026-11-06 | 🤖 [Unity Catalog wikis are in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#unity-catalog-wikis-are-in-beta) | Unity Catalog wikis enter Beta, allowing data owners and stewards to draft and publish table documentation in Catalog Explorer manually or with Genie Code, while any user with metadata view permissions can comment, suggest edits, and react; account admins control feature access from the Previews page. |
| 2026-11-05 | [Metric view listings are generally available in Databricks Marketplace](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#metric-view-listings-are-generally-available-in-databricks-marketplace) | Providers can publish governed business metrics in Databricks Marketplace by adding metric views, though only Azure Databricks recipients can consume shared metric views. |
| 2026-11-03 | [Start Lakeflow Designer workflows from suggested or recent tables](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#start-lakeflow-designer-workflows-from-suggested-or-recent-tables) | Lakeflow Designer now lets users start visual data prep workflows from suggested, favorite, or recently used tables on the welcome screen. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-05 | [Organization users and user groups in Organization Command Center (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-05-organization-hub-command-center-users-preview) | Organization users and user groups are now available in preview in Organization Command Center. |
| 2026-11-03 | [On-demand table creation for catalog-linked databases (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-cld-on-demand-table-creation) | On-demand table creation for catalog-linked databases is now generally available. |
| 2026-11-01 | [Apache Iceberg™ tables: Read and write across Snowflake accounts with Snowflake Horizon Catalog, now without managing secrets (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-01-horizon-catalog-integration-wif-ga) | Snowflake Horizon Catalog catalog integrations now enable reading and writing Apache Iceberg tables across Snowflake accounts without creating, storing, or rotating secrets, with both accounts accessing the same table data without copying. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-06 | ⚠️ [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2026-11-06 | [You can now use BigQuery Graph and run Graph Query Language (GQL) queries when you use on-demand pricing](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | BigQuery Graph and Graph Query Language (GQL) queries are now supported when using on-demand pricing. |
| 2026-11-02 | [Lakehouse supports the following remote catalog providers for cross-cloud data access (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_02_2026) | BigQuery Lakehouse adds GA support for federated catalog endpoints across Databricks Unity Catalog on AWS/Azure/GCP, AWS Glue Data Catalog on AWS, Snowflake Horizon Catalog on AWS/Azure/GCP, and Workday Data Lake on AWS/GCP, enabling metadata synchronization and direct Apache Iceberg table queries from BigQuery, Managed Service for Apache Spark, and Apache Spark without data migration or ETL, with routing over public internet or Cross-Cloud Interconnect and protection via VPC Service Controls; for Databricks Unity Catalog, user identity federation can propagate end-user identities for permission enforcement. |
| 2026-11-02 | [You can now use BigQuery change history and continuous queries for Apache Iceberg managed tables in Lakehouse (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_02_2026) | BigQuery change history and continuous queries are now generally available for Apache Iceberg managed tables in Lakehouse, allowing the `APPENDS` table-valued function to track appended rows over a time range and continuous queries to read incoming data from and write output rows to Iceberg managed tables. |

*Also new:* [You can now use a custom organization policy to allow or deny specific operations on models in BigQuery (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) · [In the query execution graph's query text heatmap, you can now view and navigate through a hierarchical list of context references, such as nested function calls or view references, for stage steps (G…](https://docs.cloud.google.com/bigquery/docs/release-notes#November_05_2026) · [In the query execution graph, the query text heatmap now supports displaying the SQL text for persistent and temporary user-defined functions (UDFs) (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_05_2026) · [Share data and context across organizations with IQ Share (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Share-data-and-context-across-organizations-with-IQ-Share/ba-p/5378764)

---

## Open-source stack

### dbt Core

- **Release:** [v1.11.17](https://github.com/dbt-labs/dbt/releases/tag/v1.11.17) fixes `dbt deps` git credential handling by using a git credential helper instead of embedding credentials in clone URLs, and fixes credential supply during `git reset --hard` for subdirectory installs.

### Apache Airflow

- **Release:** [3.4.0](https://github.com/apache/airflow/releases/tag/3.4.0) introduces Task Loops (AIP-111) allowing decorated task groups to repeat at runtime with conditional do...while logic, and adds a Dag Importer for authoring DAGs in non-Python languages like TypeScript.
- **News:** The [Apache Airflow 3.4.0 announcement](https://airflow.apache.org/blog/airflow-3.4.0/) highlights Task Loops, multi-language DAG authoring, and AI agent integration as the release's headline features.

### Prefect

- **Release:** [3.9.2](https://github.com/PrefectHQ/prefect/releases/tag/3.9.2) reduces deployment writes from queue polling, fixes lock release handling in `RedisLockManager` and `MemoryLockManager`, preserves datetime instants during timezone changes, and resolves multiple UI, CLI, and `GitRepository` bugs.

### Apache Iceberg

- **News:** [Query Databricks Lakeflow Pipeline Tables from Snowflake, Without Copying Data](https://medium.com/snowflake/query-databricks-lakeflow-pipeline-tables-from-snowflake-without-copying-data-dde301ede202) demonstrates reading Databricks Lakeflow streaming tables and materialized views directly as Iceberg tables from Snowflake, showing cross-platform Iceberg interoperability.

**Quiet today:** [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

## Across platforms

- Apache Iceberg interoperability advanced on three platforms: Snowflake Horizon Catalog enables cross-account Iceberg read/write without secrets (GA); BigQuery Lakehouse adds GA federated catalog endpoints for Unity Catalog, Glue, Horizon Catalog, and Workday; Databricks Lakeflow Pipeline Tables are readable as Iceberg tables from Snowflake per the Iceberg project.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-06 | [Shipping a Data Catalog App on Snowflake App Runtime: Notes From a Real Build](https://medium.com/snowflake/shipping-a-data-catalog-app-on-snowflake-app-runtime-notes-from-a-real-build-2fcc74d4e5c0) | Snowflake on Medium | The author rebuilt a business glossary and definition-approval app on Snowflake App Runtime in five days, deploying with `snow app deploy` without Docker, a container registry, or a separate auth layer, keeping data in the client account and using existing SSO for sign-in. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*