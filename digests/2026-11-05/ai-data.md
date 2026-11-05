# Data Engineering 2026-11-05

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-05) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-05/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-05/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-05/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Projects: 27 | Active today: 2 | Stable releases: 2 | Prereleases (not covered): 2 | Generated: 2026-11-05 06:28 UTC

---

## Highlights
- MLflow v3.18.0 introduces breaking changes: `search_logged_models` now filters and sorts metrics by highest step then latest timestamp on SQL stores, `registered_model_meta` is no longer added to `models:/` downloads, and MCP server version identity becomes case-sensitive on MySQL and SQL Server requiring a database upgrade; Databricks MLflow users must test and migrate.
- Snowflake ships two GA features: Iceberg table backups for Snowflake Storage on AWS, and Delta Direct structured type evolution reconciling `OBJECT`, `ARRAY`, `MAP` changes during refresh (eliminating error `091989`); Snowflake users with Iceberg or Delta Direct tables can adopt both.
- Microsoft Fabric OneLake table APIs add Iceberg REST Catalog writes (Preview) for creating native Iceberg tables, committing snapshots, and requesting short-lived credentials; Fabric users on supported clouds can preview Iceberg table management.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-02 | [Simba JDBC Driver (Legacy) 2.8.7 is available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#simba-jdbc-driver-legacy-287-is-available) | Simba JDBC Driver (Legacy) 2.8.7 updates `jackson-core`, `jackson-databind`, and `jackson-datatype-jsr310` to `2.21.8`, available from the JDBC drivers archive under All JDBC Driver Versions (Simba). |

### MLflow

- **Release:** [v3.18.0](https://github.com/mlflow/mlflow/releases/tag/v3.18.0) introduces breaking changes: `search_logged_models` now filters and sorts metrics by highest step then latest timestamp on SQL stores, `registered_model_meta` is no longer added to `models:/` downloads, and MCP server version identity becomes case-sensitive on MySQL and SQL Server requiring a database upgrade. It adds Automatic Issue Detection to turn recurring agent failures into investigable issues and an experimental Skill Registry for sharing reusable skills across agents and projects.

### Databricks CLI

- **Release:** [v1.24.0](https://github.com/databricks/cli/releases/tag/v1.24.0) marks variables used as secret values as sensitive, preventing their plain-text use in other fields, and fixes `databricks auth login` and `databricks configure` overwriting parent profile credentials when saving dotted-name profiles. It adds workspace-supported accelerator types to `databricks air run -h config.compute.accelerator_type` and improves `air list` and `air run --watch` output.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-04 | [Backups for Snowflake Storage for Apache Iceberg™ tables (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-04-iceberg-backups) | Backups are now generally available for Snowflake Storage for Apache Iceberg tables and dynamic Iceberg tables on AWS. |
| 2026-11-04 | 🤖 [Background runs and additional supplementary tools for agents in the Snowflake-managed MCP server](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-04-mcp-async-agent-tools) | The `CORTEXAGENTRUN` and `CODINGAGENT` tools in the Snowflake-managed MCP server accept a `background` boolean argument that returns a pollable handle immediately when set to `true`. |
| 2026-11-03 | [Delta Direct: Structured type evolution (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-delta-direct-structured-type-evolution) | Delta Direct tables now reconcile structural changes to `OBJECT`, `ARRAY`, and `MAP` columns during refresh, eliminating the previous `091989` error that required dropping and recreating the table. |
| 2026-11-03 | [CoCo Desktop v1.24.0](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-coco-desktop-v1-24-0) | CoCo Desktop v1.24.0 introduces `Artifacts` and `Cloud automations` in preview. |
| 2026-11-02 | [Level of detail (LOD) expressions in semantic views (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-02-semantic-views-lod-metrics-preview) | `LOD` expressions in semantic views calculate values at a grain different from the query grain, enabling multi-granularity analysis within a single view. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-04 | Microsoft Fabric | [OneLake table APIs: Now with Iceberg writes, plus richer table metadata (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/OneLake-table-APIs-Now-with-Iceberg-writes-plus-richer-table/ba-p/5391262) | OneLake table APIs now support Iceberg REST Catalog writes for creating native Iceberg tables, committing snapshots, and requesting short-lived storage credentials, plus a metadata API for adding descriptions and tags to tables and columns. |
| 2026-11-04 | Azure updates | [[Launched] Generally Available: Azure Database for PostgreSQL stable REST API version 2026-10-01](https://azure.microsoft.com/updates?id=579300) | The Azure Database for PostgreSQL Flexible Server REST API `2026-10-01` is generally available with expanded maintenance management, immutable backups, and multi-tenant encryption capabilities. |
| 2026-11-04 | Microsoft Fabric | [Eventhouse support for OneLake security (Generally Available)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Eventhouse-support-for-OneLake-security-Generally-Available/ba-p/5377875) | Eventhouse external tables now enforce OneLake security `object-level`, `column-level`, and `row-level` access controls automatically when querying secured data, extending the centrally managed model to KQL queries. |
| 2026-11-04 | Microsoft Fabric | [Salesforce Data 360 integration with OneLake (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Salesforce-Data-360-integration-with-OneLake-Preview/ba-p/5384626) | Salesforce Data 360 integration with OneLake enables zero-copy file sharing so source data is available for analysis without building separate ingestion pipelines, keeping data current across Salesforce and Fabric. |
| 2026-11-04 | Microsoft Fabric | [Find expensive queries from Capacity Metrics (Generally Available)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Find-expensive-queries-from-Capacity-Metrics-Generally-Available/ba-p/5393588) | The Capacity Metrics app's "Monitor in warehouse" action links capacity usage spikes directly to Warehouse Monitor with the relevant time window pre-applied, using `CU %` to identify queries worth investigating. |
| 2026-11-03 | BigQuery | [You can now use persistent and temporary SQL user-defined functions (UDFs) in BigQuery continuous queries to encapsulate and reuse custom real-time transformation logic](https://docs.cloud.google.com/bigquery/docs/release-notes#November_03_2026) | BigQuery continuous queries now support persistent and temporary SQL `UDFs` for encapsulating and reusing custom real-time transformation logic. |

*Also new:* [Govern Fabric connections with admin APIs and data connection policies (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Govern-Fabric-connections-with-admin-APIs-and-data-connection/ba-p/5383656)

---

Nothing new from Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata), [SQLFluff](https://github.com/sqlfluff/sqlfluff)) today.

---

## Across platforms

- Iceberg table management: Snowflake reaches GA for backups on AWS while Fabric enters Preview for Iceberg REST Catalog writes (create, commit, credentials) via OneLake APIs; Snowflake covers backup/restore, Fabric covers write-path operations.
- AI agent runtimes: Snowflake's MCP server adds background runs for `CORTEXAGENTRUN` and `CODINGAGENT` tools; Databricks MLflow adds experimental Skill Registry for sharing reusable skills across agents; both extend agent orchestration but Snowflake focuses on async execution, Databricks on skill reuse.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-04 | [Cortex Agent Versioning and Multi-Environment Deployment](https://medium.com/snowflake/cortex-agent-versioning-and-multi-environment-deployment-18cb43e8097e) | Snowflake on Medium | The author outlines a practical approach to versioning and multi-environment deployment for Snowflake Cortex Agents, noting that agents add a configuration layer (instructions, tools) atop existing dbt-based silver/gold table promotion workflows. |
| 2026-11-04 | [Enterprise ML Architecture: Making Every Boundary Earn Its Place](https://medium.com/snowflake/enterprise-ml-architecture-making-every-boundary-earn-its-place-c0ffaac36fd4) | Snowflake on Medium | The author presents seven workload tests to reassess enterprise ML architecture placement as Snowflake expands across the ML lifecycle including feature management, model governance, warehouse and container-based inference, observability, explainability, and lineage. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Shlemiel the Painter Is Back: How Zig's Libc Rewrite Made SQLite 12,000× Slower](https://dennisforbes.ca/blog/microblog/2026/10/the_accidental_12000x_sqlite_slowdown/) | Hacker News | [19 points, 0 comments](https://news.ycombinator.com/item?id=50367576) | The author examines how a libc rewrite in Zig caused SQLite to become 12,000 times slower, highlighting recurring performance patterns across Rust, SQLite, and Zig. |
| [Burnt TOAST](https://www.pgedge.com/blog/burnt-toast) | Lobste.rs | [13 points, 2 comments](https://lobste.rs/s/dmpdid/burnt_toast) | Shaun Thomas analyzes PostgreSQL's TOAST storage for large columns, benchmarking when it accelerates scans and updates versus when table splitting or lz4 compression performs better. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*