# Data Engineering 2026-11-13

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-13) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-13/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-13/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-13/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Also new: 1 | Projects: 26 | Active today: 6 | Stable releases: 4 | Prereleases (not covered): 1 | Generated: 2026-11-13 06:24 UTC

---

## Highlights
- Dagster 1.13.30 drops Python 3.10 support; teams on Python 3.10 must migrate to 3.11+ before upgrading.
- Snowpark Python v1.57.0 changes `Session.debug` (no longer uses AST collection), makes `DataFrameReader.documents()` always parse with `AI_PARSE_DOCUMENT` in `LAYOUT` mode, and limits `configure_development_features` to explicitly passed features; Snowpark users must test for behavioral differences.
- dbt Core v1.12.7 fixes a regression where batch metadata freshness failures skipped all selected sources; users relying on freshness checks should verify per-source fallback works.
- Great Expectations 1.25.0 counts rows with NULLs in compared columns as unexpected for several `ExpectColumnPair*` and `ExpectMulticolumn*` expectations on SQL backends, aligning with pandas; SQL backend users must review validation results.
- BigQuery table-level data lineage in Knowledge Catalog is GA; BigQuery admins can enable lineage tracking for governance workflows.
- Databricks standalone pipelines on serverless general compute are GA; pipeline authors can create and refresh materialized views and streaming tables from notebooks on serverless compute.
- Snowflake semantic view materializations are GA; teams with semantic views can pre-aggregate dimensions and metrics for query performance.

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
| 2026-11-12 | 🤖 [ABAC DENY policies support AI securables and attachment to individual objects (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#abac-deny-policies-support-ai-securables-and-attachment-to-individual-objects-beta) | DENY policies now support FOR clause for model services, model provider services, MCP services, agent services, and skills, and ON clause attachment directly to tables, volumes, functions, models, secrets, model services, model provider services, MCP services, agent services, and skills. |
| 2026-11-11 | [Standalone pipelines on serverless general compute are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#standalone-pipelines-on-serverless-general-compute-are-now-generally-available) | Enables creating and refreshing standalone materialized views and streaming tables from notebooks on serverless general compute using `spark.sql()` or Python pipelines decorators. |
| 2026-11-11 | [Partial schema inference for Python Lakeflow pipelines](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#partial-schema-inference-for-python-lakeflow-pipelines) | In an upcoming release, Python Lakeflow pipelines will support partial schema inference via the `override_schema` argument on `table`, `materialized_view`, or `create_streaming_table` to control specific columns while inferring the rest from query output. |
| 2026-11-10 | [Budget alerts can now trigger webhooks (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#budget-alerts-can-now-trigger-webhooks-beta) | Budgets can now trigger webhooks when spend thresholds are exhausted, routing budget events to incident, ticketing, or automation tools. |
| 2026-11-09 | 🤖 [AI Functions Asynchronous API (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-functions-asynchronous-api-beta) | Enables running `ai_parse_document`, `ai_extract`, or `ai_classify` asynchronously on up to 50,000 requests from a JSONL file in a Unity Catalog volume; workspace admins must enable the AI Functions Asynchronous API preview from the Previews page. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-13 | [Many-to-many relationships in semantic views (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-semantic-views-many-to-many-preview) | Many-to-many relationships in semantic views are in preview, allowing modeling many-to-many relationships between two logical tables. |
| 2026-11-11 | [Semantic view materializations (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-semantic-view-materializations-ga) | Semantic view materializations enable pre-aggregating frequently queried dimensions and metrics in a semantic view to improve query performance. |
| 2026-11-10 | [INTEGRATIONS view in ACCOUNT_USAGE (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-account-usage-integrations-view-preview) | The ACCOUNT_USAGE schema now includes an INTEGRATIONS view in preview returning a row per integration with metadata for API, catalog, external access, notification, security, and storage integrations including type, category, and enabled status. |
| 2026-11-10 | 🤖 [Geospatial maps in Snowflake CoWork (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-cowork-maps-preview) | Geospatial maps in Snowflake CoWork preview enable interactive plotting of latitude/longitude points, H3 hexagons, or GEOGRAPHY and GEOMETRY shapes with pan and zoom when queries return geographic data. |

*Also new:* [Snowflake Data Clean Rooms updates](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcr)

### Snowpark Python

- **Release:** [v1.57.0](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.57.0) changes `Session.debug` to no longer depend on AST collection, simplifies `DataFrameReader.documents()` to always parse with `AI_PARSE_DOCUMENT` in `LAYOUT` mode, and makes `configure_development_features` update only explicitly passed features.
- **Release:** [v1.57.0](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.57.0) adds `Session.semantic_view()` (PuPr) for querying semantic views, introduces experimental `Session.debug` with `eager_schema_validation`, `trace_sql_errors_to_dataframe`, and `dataframe_trace_on_error`, and adds try_to_* conversion functions in `functions.py`.

**Quiet today:** [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-12 | BigQuery | [You can track table-level data lineage in Knowledge Catalog for BigQuery pipelines (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026) | Table-level data lineage tracking in Knowledge Catalog for BigQuery pipelines is generally available. |
| 2026-11-12 | BigQuery | 🤖 [BigQuery generative AI functions now support the gemini-4-hydrogen model](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026) | BigQuery generative AI functions now support the `gemini-4-hydrogen` model, which is generally available. |
| 2026-11-12 | Azure updates | [[In preview] Public Preview: SQL performance monitoring for Azure SQL Managed Instance](https://azure.microsoft.com/updates?id=574158) | Microsoft-managed performance monitoring for Azure SQL Managed Instance is in public preview, replacing reliance on custom scripts and disconnected monitoring tools. |

---

## Open-source stack

### dbt Core

- **Release:** [v1.12.7](https://github.com/dbt-labs/dbt/releases/tag/v1.12.7) fixes a regression where batch metadata freshness failures skipped all selected sources, now falling back to per-source checks; scopes relation-cache population to selected schemas so `--cache-selected-only` is honored in `compile`/`show`/`docs generate`; and corrects `statically_parse_unrendered_config` stringifying list/dict values that caused false `state:modified` positives.
- **Release:** Adds the `builtin_macros_prefer_overrides` behavior flag (default false) to prefer adapter overrides over base dbt implementations for builtin macros; accepts dbt v2-only `info_schema`, `check-paths`, and `checks` keys in `dbt_project.yml` with a note they are v2-specific; and ignores unsupported manifest node types (e.g., dbt v2 checks) when loading `--state`/`--defer` manifests.

### Dagster

- **Release:** [1.13.30](https://github.com/dagster-io/dagster/releases/tag/1.13.30) drops Python 3.10 support, now requiring Python 3.11+. The asset catalog and graph stop polling health data for hidden assets, reducing load in large workspaces. A new `dagster-cloud deployment copy-materializations` command copies latest materializations between deployments preserving timestamps.

### dlt

- **News:** [dltHub brings data and meaning into ClickHouse](https://dlthub.com/blog/dlthub-clickhouse-ontology-agents) announces a private preview where dltHub writes business definitions into ClickHouse table and column comments so the ClickHouse Agent can give trusted answers.
- **News:** [dltHub on ClickHouse: the ClickHouse Agent walkthrough](https://dlthub.com/blog/clickhouse-agent-ontology-walkthrough) demonstrates loading GitHub data, definitions, and an ontology into ClickHouse so the ClickHouse Agent can answer questions like how much CI is waste.

### Polars

- **News:** [Polars Nanook benchmarked against Databricks Photon](https://pola.rs/posts/polars-nanook-vs-databricks/) compares Polars Nanook performance against Databricks Spark with the Photon engine.

### Great Expectations

- **Release:** [1.25.0](https://github.com/great-expectations/great_expectations/releases/tag/1.25.0) enables row conditions to compare two columns of the same row across pandas, Spark, and SQL backends using `Column` comparison operators. SQL metrics and Expectations (distinct-values, median, quantile, etc.) now work with row conditions instead of failing on SQLAlchemy 2.1.
- **Release:** On SQL backends, rows containing NULLs in compared columns are now counted as unexpected for `ExpectColumnPairValuesAToBeGreaterThanB`, `ExpectColumnPairValuesToBeInSet`, `ExpectMulticolumnSumToEqual`, and `ExpectCompoundColumnsToBeUnique`, matching pandas behavior. The `zstandard>=0.25.0` minimum is removed from the `spark-connect` extra, allowing installation alongside older `zstandard` pins like Airflow 3.0.x constraints.

**Quiet today:** [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Prefect](https://github.com/PrefectHQ/prefect), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Trino](https://github.com/trinodb/trino), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

## Across platforms

- AI functions in SQL: BigQuery adds `gemini-4-hydrogen` (GA) for generative AI functions; Databricks releases AI Functions Asynchronous API (Beta) for batch `ai_parse_document`, `ai_extract`, `ai_classify` on up to 50k rows via JSONL in Unity Catalog volumes.
- Semantic layer governance: Snowflake introduces many-to-many relationships in semantic views (Preview) and materializations (GA); Databricks extends ABAC DENY policies to AI securables (model services, agent services, skills) with FOR/ON clauses (Beta).
- Data lineage and observability: BigQuery Knowledge Catalog table-level lineage (GA) and Databricks budget alert webhooks (Beta) both push operational metadata to external systems for automation.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-12 | [Operational Ontology on Snowflake: From Business Meaning to Governed AI Action](https://medium.com/snowflake/operational-ontology-on-snowflake-from-business-meaning-to-governed-ai-action-6f3ef270d3f2) | Snowflake on Medium | The author describes a reference architecture for AI agents to reason over operational state, simulate decisions, execute governed actions, and verify outcomes, using a distribution center example where an agent identifies failed packing station PB-04 and traces affected orders. |
| 2026-11-12 | [Streamlit’s Floor, React’s Ceiling, Inside Snowflake](https://medium.com/snowflake/streamlits-floor-react-s-ceiling-inside-snowflake-c78f90e39dc8) | Snowflake on Medium | The author builds Streamlit in Snowflake (SiS) apps and created RiSiS (React in Streamlit in Snowflake) to add interactions like cross-filtering charts on hover and drag that SiS reruns cannot support, enabling an analyst to filter EMEA data across all charts by pointing at a bar. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Turning a 22-year-old Postgres type-confusion primitive into RCE](https://mehmetince.net/part-3-6-how-i-ended-up-turning-a-22-year-old-postgresql-type-confusion-primitive-into-rce-cve-2026-6460/) | Hacker News | [167 points, 30 comments](https://news.ycombinator.com/item?id=50471761) | The author discovered a 22-year-old zero-day type-confusion vulnerability in PostgreSQL core that enables remote code execution. |
| [PostgreSQL 18.7, 17.12, 16.16, 15.20, 14.25, and 19 RC 2 Released](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/) | Hacker News | [104 points, 14 comments](https://news.ycombinator.com/item?id=50467763) | The PostgreSQL Global Development Group released updates for all supported versions including 18.7, 17.12, 16.16, 15.20, 14.25, and 19 RC 2. |
| [Tell HN: Cast('abc' AS INTEGER) returns 0 in SQLite](https://news.ycombinator.com/item?id=50468864) | Hacker News | [3 points, 5 comments](https://news.ycombinator.com/item?id=50468864) | — |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*