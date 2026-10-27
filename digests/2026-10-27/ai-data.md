# Data Engineering 2026-10-27

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-27) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-27/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-27/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-27/ai-policy) · **🟨 Data Engineering**

> Generated: 2026-10-27 04:50 UTC | Vendor items: 12 | Projects: 17 | Active today: 3 | Stable releases: 2 | Prereleases (not covered): 0

---

## Highlights
- − Snowflake Connector for Python v4.8.1 drops Python 3.10 support (minimum now 3.11); Snowflake Python users on 3.10 must upgrade runtime before adopting this version.
- Azure Databricks workspaces with the compliance security profile enabled will receive Lakeflow Performance Observability by default on 2026-11-25; no action required but expect job-level query metrics and Genie Code Optimize button to appear.
- Snowflake Task Graphs Preview adds atomic deployments, centralized configuration, and upstream-outcome-based run control; teams orchestrating tasks in Snowflake should evaluate for CI/CD workflows.
- Snowflake Pipeline Builder Preview provides a visual designer to orchestrate Notebooks, Python files, ML Jobs, and SQL as version-controlled task graphs; Snowflake-native pipeline authors should test the DCM-backed deployment model.
- BigQuery Conversational Analytics conversation logging reaches GA; organizations using BigQuery data agents can now persist agent conversations to a BigQuery table in the agent's project.

---

## Databricks

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-26 | Azure Databricks | 🤖 [Improved Lakeflow Performance Observability will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#improved-lakeflow-performance-observability-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Starting November 25, 2026, workspaces with the compliance security profile enabled get Lakeflow Performance Observability by default, providing job-level query metrics, data volume insights, and an Optimize button linking to Genie Code for serverless compute, SQL Warehouses, and Lakeflow Pipelines. |
| 2026-10-26 | Azure Databricks | 🤖 [Improved Lakeflow Performance Observability is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#improved-lakeflow-performance-observability-is-now-generally-available) | Lakeflow Jobs now expose job-level query performance metrics and data volume insights with an Optimize button that opens Genie Code for query tuning on serverless compute. |
| 2026-10-26 | Azure Databricks | [QuickBooks connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#quickbooks-connector-is-available-in-beta) | The managed QuickBooks connector in Lakeflow Connect (Beta) ingests accounting data from QuickBooks Online via OAuth user authorization with incremental ingestion and delete capture. |
| 2026-10-24 | Azure Databricks | [PayPal connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#paypal-connector-is-available-in-beta) | The managed PayPal connector in Lakeflow Connect (Beta) ingests payments data from PayPal using OAuth client credentials with incremental ingestion. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-23 | Snowflake | [Oct 23, 2026: Atomic deployments, centralized configuration, and advanced branching for task graphs (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-23-task-graphs-preview) | Preview adds centralized task graph configuration, atomic deployments without pipeline suspension, and upstream-outcome-based task run control. |
| 2026-10-22 | Snowflake | [Oct 22, 2026: Pipeline Builder (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-22-pipeline-builder-preview) | Pipeline Builder (Preview) provides a visual designer to orchestrate Notebooks, Python files, ML Jobs, and SQL as task graphs, with each pipeline as a DCM project enabling planned deployments and version control. |
| 2026-10-22 | Snowflake | [Oct 22, 2026: Ingress policies (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-22-ingress-policies-preview) | Ingress policies (Preview) allow admitting or blocking requests by combining multiple conditions into a single policy. |
| 2026-10-23 | Snowflake | [Oct 23, 2026: CoCo Desktop v1.22.1](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-23-coco-desktop-v1-22-1) | CoCo Desktop v1.22.1 adds Defer to Production for Snowflake-managed dbt runs and improves session and app management. |

### Snowflake Connector for Python

- **Release**: [v4.8.1](https://github.com/snowflakedb/snowflake-connector-python/releases/tag/v4.8.1) fixes `write_pandas` identifier quoting (Parquet field paths quoted, Iceberg option values escaped, `quote_identifiers=False` validates unquoted identifiers), drops Python 3.10 support (minimum now 3.11), and upgrades vendored `urllib3` to 2.8.0.

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-26 | BigQuery | 🤖 [Feature: Conversation logging for Conversational analytics in BigQuery is now generally available (GA).](https://docs.cloud.google.com/bigquery/docs/release-notes#October_26_2026) | Conversation logging for Conversational Analytics (GA) lets you log data agent conversations to a BigQuery table in the agent's project. |
| 2026-10-26 | BigQuery | [Feature: Python user-defined functions now support volume mounts, which let you access dependency files from Cloud Storage directly from your Python UDF code.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_26_2026) | Python UDFs (Preview) now support volume mounts to access dependency files directly from Cloud Storage. |
| 2026-10-26 | BigQuery | [Feature: The REGEXP_EXTRACT_GROUPS function produces substrings that match multiple capturing groups in a regular expression.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_26_2026) | The new REGEXP_EXTRACT_GROUPS function (Preview) extracts substrings matching multiple capturing groups in a regex. |
| 2026-10-26 | Microsoft Fabric | [Announcing workspace monitoring integration for Fabric Data Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Announcing-workspace-monitoring-integration-for-Fabric-Data/ba-p/5376599) | Workspace monitoring integration (Preview) aggregates completed warehouse query events into a WarehouseExecutions table in a monitoring Eventhouse/KQL database, covering warehouses, SQL analytics endpoints, and snapshots with metrics like duration, status, result codes, and CPU time for cross-workspace performance analysis. |

---

## Open-source stack

### Dagster
- **Release**: [1.13.27](https://github.com/dagster-io/dagster/releases/tag/1.13.27) removes the default `[Dagster Plus] Credit Limit Exceeded` alert policy for new organizations, adds a mobile-friendly run details page, and scopes BigQuery Insights cost queries to the dbt invocation.

### Polars
- **Hot issue**: [#30299](https://github.com/pola-rs/polars/issues/30299) reports a regression in Polars 2.0 where streaming `select` reorders rows when using `when(window).then(literal).otherwise(literal)`, marked high priority and now closed.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [DuckDB](https://github.com/duckdb/duckdb), [Trino](https://github.com/trinodb/trino)

---

## Across platforms

- AI-assisted SQL optimization: Databricks (GA, Genie Code via Optimize button in Lakeflow Observability for serverless, SQL Warehouses, Lakeflow Pipelines) and BigQuery (GA, Conversational Analytics with conversation logging to BigQuery tables).
- Warehouse query observability: Databricks (GA, Lakeflow Performance Observability with job-level query metrics and data volume insights) and Microsoft Fabric (Preview, Workspace monitoring integration aggregating completed warehouse query events into a WarehouseExecutions KQL table).

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*