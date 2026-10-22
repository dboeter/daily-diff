# Data Engineering 2026-10-23

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-23) · [🤖 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-23/ai-agents) · [🧠 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-23/ai-models) · [⚖️ AI Policy](https://dboeter.github.io/daily-diff/#2026-10-23/ai-policy) · **🗄️ Data Engineering**

> Generated: 2026-10-22 23:49 UTC | Vendor items: 13 | Projects: 17 | Active today: 5 | Stable releases: 4 | Prereleases (not covered): 0

---

## Highlights
- **Snowflake accounts in AWS US East 1 using Cortex fine-tuning** — migrate new model training workloads to other regions; creation stopped October 20, 2026.
- **DuckDB production users** — test and migrate to 2.0.0 LTS “Cinnamon Teal” (breaking changes: Quack protocol, async I/O, `VARIANT` type, extensible parser); released October 21, 2026.
- **Azure Databricks workspaces with the compliance security profile** — plan for Genie Code tasks in Lakeflow Jobs to be enabled by default starting November 2026.
- **Snowpark Python users calling `DataFrame.to_polars()`** — upgrade to v1.55.3; method is now GA with Parquet default transport (performance shift) and JDBC lazy execution fix.
- **Azure Databricks users on serverless compute (env v5+, Connect Python 18.1.8+/Scala 18.1.5+)** — validate `df.cache()`/`persist()` in Public Preview (on by default; admins can disable).

---

## Databricks

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-21 | Azure Databricks | 🤖 [Genie Code tasks in Lakeflow Jobs are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#genie-code-tasks-in-lakeflow-jobs-are-now-generally-available) | Enables running prompts autonomously in Lakeflow Jobs with access to upstream task outputs and tool calls, returning a link to the Genie Code chat response. |
| 2026-10-21 | Azure Databricks | 🤖 [Genie Code tasks in Lakeflow Jobs are available by default for workspaces with the compliance security profile enabled starting in November 2026](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#genie-code-tasks-in-lakeflow-jobs-are-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled-starting-in-november-2026) | Enables Genie Code tasks by default for workspaces with the compliance security profile starting November 2026. |
| 2026-10-21 | Azure Databricks | [Lakeflow pipelines system tables are now generally available (GA)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#lakeflow-pipelines-system-tables-are-now-generally-available-ga) | Enables querying the `lakeflow.pipelines` and `lakeflow.pipeline_update_timeline` system tables to audit pipeline runs across the account. |
| 2026-10-23 | Azure Databricks | [DataFrame caching on serverless compute is now in Public Preview](https://learn.microsoft.com/azure/databricks/release-notes/serverless#dataframe-caching-on-serverless-compute-is-now-in-public-preview) | Enables `df.cache()` and `df.persist()` on serverless compute (requires serverless environment version 5+, Databricks Connect Python 18.1.8+ or Scala 18.1.5+); preview is on by default but admins can disable it. |
| 2026-10-22 | Azure Databricks | [Microsoft Entra ID connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#microsoft-entra-id-connector-is-available-in-beta) | Enables ingesting Microsoft Entra ID users, groups, applications, service principals, directory roles, identity configuration, and audit/sign-in logs via OAuth machine-to-machine auth with incremental ingestion for logs. |
| 2026-10-20 | Azure Databricks | [SurveyMonkey connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#surveymonkey-connector-is-available-in-beta) | Enables ingesting SurveyMonkey surveys, structure, collectors, responses, and contacts via OAuth user-to-machine auth with incremental ingestion and multiple authoring options; workspace admins control access via the Previews page. |

*Also new:* [Oracle Eloqua connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#oracle-eloqua-connector-is-available-in-beta) · [Asana connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#asana-connector-is-available-in-beta) · [Lakebase Insights moves to per-project settings, with on-demand runs (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/lakebase#lakebase-insights-moves-to-per-project-settings-with-on-demand-runs-beta) · [Box Audit Logs managed ingestion connector (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#box-audit-logs-managed-ingestion-connector-beta) · [Screen MCP tool calls and results for jailbreaks (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#screen-mcp-tool-calls-and-results-for-jailbreaks-beta)

### Databricks CLI
- **Release**: [v1.22.0](https://github.com/databricks/cli/releases/tag/v1.22.0)–[v1.22.1](https://github.com/databricks/cli/releases/tag/v1.22.1) fix `aitools` skill installation to prevent downgrades and resolve GitHub API rate limits, and ensure `auth login --timeout` applies to browser-based OAuth.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-20 | Snowflake | ⚠️ 🤖 [Oct 20, 2026: Cortex Fine-tuning: New model training no longer available in AWS US East 1](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-20-cortex-finetuning-aws-us-east-1) | Stops creation of new Cortex fine-tuned models in AWS US East 1 (N. Virginia) as of October 20, 2026; workloads must move to other regions. |
| 2026-10-22 | Snowflake | [Oct 22, 2026: Quiesce a primary failover group (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-22-quiesce-primary-failover-group-ga) | Enables placing a primary failover group into read-only mode (quiesce) for maintenance or failover testing. |
| 2026-10-22 | Snowflake | [Oct 22, 2026: Snowflake Data Clean Rooms updates](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-22-dcr) | Enables collaboration edits with approver workflow for role changes, fixes `REMOVE_TEMPLATE` to clean up orphaned code specs preventing security scan timeouts, and upgrades the Clean Rooms Python runtime to 3.13. |
| 2026-10-22 | Snowflake | [IPADDRESS data type (Preview)](https://docs.snowflake.com/en/release-notes/2026/10_38) | Enables storing IPv4 or IPv6 addresses as a validated, canonical 128-bit native type with numeric comparison semantics. |

*Also new:* [Oct 16, 2026: Grok 4.7 and GLM 5.3 models (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-16-grok-4-7-glm-5-3-preview) · [Oct 20, 2026: dbt Projects on Snowflake updates](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-20-dbt-projects-on-snowflake-updates) · [Oct 19, 2026: Tools for Cortex AI Gateway (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-19-cortex-ai-gateway-tools)

### Snowpark Python
- **Release**: v1.55.3 removes the experimental tag from `DataFrame.to_polars()` and switches its default transport to Parquet for better performance; it also fixes a timeout in `DataFrameReader.jdbc` on slow sources by lazy query execution. [v1.55.3](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.55.3)

**Quiet today:** [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-22 | Azure updates | [[Launched] Generally Available: ABFS Vectored Read for Azure Data Lake Storage](https://azure.microsoft.com/updates?id=577618) | Enables compatible analytics engines to reduce request overhead for selective reads on Azure Data Lake Storage by combining nearby file ranges into fewer asynchronous storage requests. |
| 2026-10-22 | BigQuery | 🤖 [Feature: The AI.TRANSLATE function lets you translate text strings between languages.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_22_2026) | Enables translating text strings between languages using standard Neural Machine Translation or Translation LLM capabilities via the `AI.TRANSLATE` function. |
| 2026-10-20 | Microsoft Fabric | [T-SQL language enhancements in Microsoft Fabric Data Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/T-SQL-language-enhancements-in-Microsoft-Fabric-Data-Warehouse/ba-p/5375433) | Enables `GROUP BY ALL`, `ORDER BY ALL`, `QUALIFY`, and `FROM ... SELECT` syntax to reduce repetitive SQL and simplify analytical queries in Microsoft Fabric Data Warehouse. |

*Also new:* [Advanced NL2SQL and advanced DAX generation in Fabric data agents (Generally Available)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Advanced-NL2SQL-and-advanced-DAX-generation-in-Fabric-data/ba-p/5374654) · [Explore and process multiple event types with Schema-aware Fabric Eventstreams (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Explore-and-process-multiple-event-types-with-Schema-aware/ba-p/5376384) · [Incrementally migrate and re-migrate database objects with Migration Assistant for Fabric Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Incrementally-migrate-and-re-migrate-database-objects-with/ba-p/5376060) · [Create purpose-built custom visuals in Real-Time Dashboards with Copilot (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Create-purpose-built-custom-visuals-in-Real-Time-Dashboards-with/ba-p/5376359) · [From mixed events to real-time action: Fabric Eventstreams Q3 2026](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/From-mixed-events-to-real-time-action-Fabric-Eventstreams-Q3/ba-p/5375736)

---

## Open-source stack

### SQLMesh
- **Release**: [v0.236.4](https://github.com/SQLMesh/sqlmesh/releases/tag/v0.236.4) fixes virtual catalog handling for ClickHouse, prevents cascading drops in DuckLake catalogs, adds no-op warehouse create for Fabric, improves Snowflake timestamp lookups, and updates Databricks PyArrow dependency.

### Apache Airflow
- **Hot issue**: [#75332](https://github.com/apache/airflow/issues/75332) requests contributor testing of provider release candidates prepared on October 20, 2026, to verify stability before final distribution.

### DuckDB
- **News**: [Hacker News](https://news.ycombinator.com/item?id=50181136) and [Lobste.rs](https://lobste.rs/s/dcvs3u/announcing_duckdb_2_0_0_lts_cinnamon_teal) announce DuckDB 2.0.0 LTS "Cinnamon Teal", a long-term support release emphasizing stability for production analytics workloads.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino)

---

## Releases this week

| Project | Version | Date | Summary |
| :--- | :--- | :--- | :--- |
| [DuckDB](https://github.com/duckdb/duckdb) | [v2.0.0](https://github.com/duckdb/duckdb/releases/tag/v2.0.0) | 2026-10-21 | Major release 2.0.0 introduces the Quack protocol, asynchronous I/O, a first-class `VARIANT` type, agent mode, triggers, and an extensible SQL parser. |
| [MLflow](https://github.com/mlflow/mlflow) | [v3.17.2](https://github.com/mlflow/mlflow/releases/tag/v3.17.2) | 2026-10-21 | Patch release adds lineage recording for dataset, scorer, and agent on `mlflow.genai.evaluate` runs and fixes Optuna trial tracking and sampler reseeding bugs. |
| [Trino](https://github.com/trinodb/trino) | [484](https://github.com/trinodb/trino/releases/tag/484) | 2026-10-16 | — |

---

## Across platforms

- **AI-assisted SQL authoring**: BigQuery ships `AI.TRANSLATE` (GA, standard NMT or LLM); Databricks offers Genie Code tasks in Lakeflow Jobs (GA, agentic prompts with tool calls); Snowflake Cortex fine-tuning retracts in AWS us-east-1 only. All three platforms surface AI inside the warehouse, but(BigQuery, Databricks) add net-new functions while Snowflake restricts a training capability in one region.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [The bridge to agent-scale Git infrastructure](https://github.blog/engineering/architecture-optimization/the-bridge-to-agent-scale-git-infrastructure/) | Hacker News | [67 points, 20 comments](https://news.ycombinator.com/item?id=50183344) | We moved a copy of 99.99999% of GitHub's repositories to Azure. Here's how per-reference quorums will bring over the rest. |
| [Postgres recovery_prefetch can cause outages](https://ardentperf.com/2026/10/20/postgres-recovery_prefetch-considered-harmful-and-causing-outages/) | Hacker News | [28 points, 0 comments](https://news.ycombinator.com/item?id=50188614) | Another story of something I saw in the field which surprised me. Turns out recovery_prefetch can cause outages. |
| [Unauthorized Access to PingCAP Cloud Resources](https://www.pingcap.com/trust-hub/security/security-update-october-2026/) | Lobste.rs | [5 points, 3 comments](https://lobste.rs/s/x7codz/unauthorized_access_pingcap_cloud) | PingCAP powers your digital transformation with a single source of truth at scale. Developed to be an open, unified, distributed SQL database solution. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*