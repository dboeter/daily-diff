# Data Engineering 2026-10-28

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-28) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-28/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-28/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-28/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Projects: 17 | Active today: 0 | Stable releases: 0 | Prereleases (not covered): 0 | Generated: 2026-10-28 05:25 UTC

---

## Highlights
- Azure Databricks account admins: account-level security features (network connectivity, network security, encryption, enhanced compliance) are now GA by default; configure them before they take effect.
- Snowflake users building ingestion pipelines: CoCo is GA for continuous Snowpipe loads on new files and one-time COPY INTO on existing files, targeting standard or Snowflake-managed tables.
- Databricks metastore admins: AI Functions Unity Catalog permissions on `system.ai` schema are GA; enablement requires contacting your Databricks account team.

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-27 | 🤖 [Default OAuth apps for external AI agents are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#default-oauth-apps-for-external-ai-agents-are-now-generally-available) | ChatGPT, Codex, Claude, Claude Code, and Cursor can connect to Azure Databricks `MCP servers` including the `Genie One MCP server` using default `OAuth client IDs`, removing the need for account admins to create an OAuth app. |
| 2026-10-27 | [Editing files in Unity Catalog volumes is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#editing-files-in-unity-catalog-volumes-is-now-generally-available) | Files in `Unity Catalog` volumes can be edited directly in the workspace file editor without download or re-upload, accessible from `Catalog Explorer` or the schema browser in a notebook or SQL editor. |
| 2026-10-27 | 🤖 [AI Functions Unity Catalog permissions is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#ai-functions-unity-catalog-permissions-is-now-generally-available) | `Metastore admins` can control which task-specific AI Functions users can run via `Unity Catalog` permissions on the `system.ai` schema, though enabling the feature requires contacting your Databricks account team. |
| 2026-10-26 | [Account-level security features are now available by default at GA](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#account-level-security-features-are-now-available-by-default-at-ga) | Account-level security features for network connectivity, network security, encryption, and enhanced security and compliance are available by default at GA without manual enablement on the `Previews page`, but `account admins` must configure them before they take effect and retain full control over adoption. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-27 | [Continuous and bulk file loading with CoCo (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-27-file-loading-coco-ga) | `CoCo` builds continuous `Snowpipe` pipelines for new files in cloud storage or one-time `COPY INTO` loads for existing files, both loading into standard Snowflake tables or Snowflake-managed tables. |
| 2026-10-27 | 🤖 [Cortex Code skills for interactive analytics](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-27-interactive-cortex-code-skills) | Two `Cortex Code skills` now help work with interactive analytics in Snowflake. |
| 2026-10-26 | [Secondary indexes (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-26-secondary-indexes-ga) | — |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-27 | BigQuery | [Feature: You can manage and version control SQL scripts and notebooks with BigQuery Studio Git repositories, which provide a streamlined, folder-based integration with remote Git repositories.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_27_2026) | SQL scripts and notebooks can be version controlled with `BigQuery Studio Git repositories`, providing a streamlined folder-based integration with remote Git repositories. |
| 2026-10-27 | BigQuery | 🤖 [Feature: The Data Engineering Agent now integrates with Google Drive, letting you provide Google Sheets files, CSV, or JSONL files as input for your data engineering pipelines.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_27_2026) | The `Data Engineering Agent` integrates with Google Drive, accepting Google Sheets files, CSV, or JSONL files as input for data engineering pipelines. |
| 2026-10-27 | BigQuery | 🤖 [Feature: You can now use conversational analytics in Connected Sheets to ask questions and analyze your BigQuery data using natural language.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_27_2026) | Conversational analytics in `Connected Sheets` enables natural language questions on BigQuery data, with the `Gemini side panel` translating to optimized SQL, executing queries, summarizing trends, and inserting live refreshable database objects into workbooks. |
| 2026-10-27 | Azure updates | [[Launched] Generally Available: Higher limit of Azure Blob Storage accounts per region per subscription](https://azure.microsoft.com/updates?id=578358) | Azure Blob Storage accounts per region per subscription now support up to 1,000 storage accounts with `standard endpoints`, up from the default 250, enabling more accounts per subscription. |
| 2026-10-21 | Microsoft Fabric | [Simplify Teradata migrations with Fabric Migration Assistant (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Simplify-Teradata-migrations-with-Fabric-Migration-Assistant/ba-p/5376058) | `Fabric Migration Assistant for Data Warehouse` supports Teradata sources in preview, converting eligible metadata and code to `Fabric-compatible T-SQL`, deploying destination definitions, and flagging scripts for review, though data migration requires a separate loading step. |

*Also new:* [Feature: The AI.COUNT_TOKENS function, which estimates the token count of a text string, is generally available (GA).](https://docs.cloud.google.com/bigquery/docs/release-notes#October_27_2026) · [Connect coding agents to Fabric notebooks with FNTK (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Connect-coding-agents-to-Fabric-notebooks-with-FNTK-Preview/ba-p/5375986)

---

Nothing new from Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino)) today.

---

## Across platforms

- AI-assisted development and analytics moved on all three platforms: Databricks added default OAuth apps so ChatGPT, Codex, Claude, and Cursor connect to MCP servers (GA); Snowflake released Cortex Code skills for interactive analytics; BigQuery launched conversational analytics in Connected Sheets (natural language to optimized SQL via Gemini) and a Data Engineering Agent that accepts Google Drive files as pipeline input.
- Git-backed authoring for SQL and notebooks appeared on BigQuery (BigQuery Studio Git repositories, folder-based remote repo integration); no equivalent GA item in this set for Databricks or Snowflake.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*