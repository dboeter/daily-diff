# Data Engineering 2026-11-11

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-11) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-11/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-11/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-11/ai-policy) · **🟨 Data Engineering**

> Vendor items: 5 | Projects: 26 | Active today: 4 | Stable releases: 0 | Prereleases (not covered): 1 | Generated: 2026-11-11 05:56 UTC

---

## Highlights
- − Azure Databricks workspaces with Unity Catalog managed tables must plan for automatic upgrade to catalog commits after Databricks Runtime 15.4 LTS end of support on August 19, 2027, enabling multi-statement transactions, external engine writes, and consistent governance.
- Snowflake Python Connector 5.0.0 introduces a native asyncio awaitable API built on Universal Core; teams using the connector in event-loop-based Python services must test migration to eliminate thread pools.
- BigQuery generative AI functions now support the gemini-4-carbon model (GA), and graph measures for locking aggregations to a key to prevent overcounting are GA with GRAPH_EXPAND TVF supporting multi-fact-table queries.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-06 | ⚠️ [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-10 | 🤖 [AI_EXTRACT and AI_PARSE_DOCUMENT now support page filtering with FL_FILTER_PAGES](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-fl-filter-pages) | `AI_EXTRACT` and `AI_PARSE_DOCUMENT` now accept `FL_FILTER_PAGES` to process specific document pages directly in SQL, eliminating the need to create separate files for each section. |
| 2026-11-10 | [Temporary role grants to users (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-temporary-role-grants-preview) | Account roles can be granted to users temporarily using `FOR INTERVAL` or `UNTIL` clauses in GRANT ROLE, with automatic revocation when the grant expires. |

### Snowflake Connector for Python

- **News:** [Native Asyncio Comes to the Snowflake Python Connector](https://medium.com/snowflake/native-asyncio-comes-to-the-snowflake-python-connector-5941385ac80e) announces version 5.0.0 with a native awaitable API built on Universal Core, eliminating the need for thread pools when calling Snowflake from event-loop-based Python services.

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-10 | [You can use graph measures to lock an aggregation to a key in order to perform complex aggregations without overcounting (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026) | `graph measures` lock aggregations to a key to prevent overcounting, supporting expressions including `AGG`-wrapped combinations, queried via `GRAPH_EXPAND` TVF (now multi-fact-table) and `AGG` function, with schema inspection via `BQ.SHOW_GRAPH_EXPAND_SCHEMA` and custom metadata via `OPTIONS` clause extensions. |
| 2026-11-10 | 🤖 [BigQuery generative AI functions now support the gemini-4-carbon model](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026) | BigQuery generative AI functions now support the `gemini-4-carbon` model for generally available use. |

---

## Open-source stack

### dlt

- **News:** [Introducing performance optimization in dltHub](https://dlthub.com/blog/introducing-performance-optimization) announces new performance optimization features for the data ingestion library.

### Apache Iceberg

- **News:** [Is your Iceberg catalog healthy?](https://medium.com/snowflake/is-your-iceberg-catalog-healthy-939dc7817154) compares five open-source Iceberg catalogs on functionality and project health, highlighting catalog choice as critical for Iceberg adoption.

### DuckDB

- **News:** [Measuring Quack: DuckDB's New Client-Server Protocol](https://news.ycombinator.com/item?id=50444907) — title only, no description.
- **News:** [Ducks in a Column](https://duckdb.org/2026/11/10/ducks-in-a-column.html) details how DuckDB's columnar storage enables features like column-level SQL, aggregation shortcuts, window functions, and ASOF joins.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [PyIceberg](https://github.com/apache/iceberg-python), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

## Across platforms

- AI functions in SQL: Snowflake adds page filtering to AI_EXTRACT and AI_PARSE_DOCUMENT (GA), while BigQuery generative AI functions add gemini-4-carbon model support (GA); both run in-warehouse but expose different function sets and models.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [ClickHouse Acquires Xata](https://xata.io/blog/xata-is-joining-clickhouse) | Hacker News | [99 points, 10 comments](https://news.ycombinator.com/item?id=50436706) | — |
| Show HN: WolveKafka – Consume Kafka with a plain HTTP endpoint ([wolveflake/wolvekafka](https://github.com/wolveflake/wolvekafka)) | Hacker News | [11 points, 2 comments](https://news.ycombinator.com/item?id=50443596) | A Show HN tool called WolveKafka that enables consuming Kafka via a plain HTTP endpoint in any language, handling retries, dead-letter queues, batching, and offsets. |
| [Next-Level Benchmarking Overfitting](http://databasearchitects.blogspot.com/2026/11/next-level-benchmarking-overfitting.html) | Lobste.rs | [18 points, 3 comments](https://lobste.rs/s/nuoce5/next_level_benchmarking_overfitting) | A blog post by and for database architects examining overfitting in benchmarking practices. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*