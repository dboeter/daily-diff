# Data Engineering 2026-11-06

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-06) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-06/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-06/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-06/ai-policy) · **🟨 Data Engineering**

> Vendor items: 16 | Projects: 27 | Active today: 6 | Stable releases: 3 | Prereleases (not covered): 1 | Generated: 2026-11-06 06:22 UTC

---

## Highlights
- − Azure Databricks workspaces using AI Functions in SQL on runtimes below 17.3 LTS: upgrade affected compute to 17.3 LTS or above before January 2027 when calls will start returning errors.
- − Teams running DeepSeek V4 Flash (0731) on Databricks: migrate to DeepSeek V4.1 Flash (1017) using the legacy model migration guidance; the old model was retired November 5, 2026.
- − BigQuery users who relied on the Metadata curation console page: switch to Knowledge Catalog for Cloud Storage discovery scans, data profiling, quality, and governance tasks; the console page was removed November 5, 2026.
- Terraform provider for Snowflake v2.23.0 introduces breaking changes with a migration guide; review and test plans for reworked preview resources (`snowflake_alert`, `snowflake_pipe`, `snowflake_share`) and new preview resources before adopting.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-05 | ⚠️ 🤖 [Upcoming removal of AI Functions support on older runtimes](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#upcoming-removal-of-ai-functions-support-on-older-runtimes) | Starting January 2027, AI Functions in SQL queries will stop working on Databricks Runtime versions below 17.3 LTS; upgrade affected compute to 17.3 LTS or above before then. |
| 2026-11-05 | ⚠️ 🤖 [DeepSeek V4 Flash (0731) is retired](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#deepseek-v4-flash-0731-is-retired) | DeepSeek V4 Flash (0731) was retired on November 5, 2026; migrate to DeepSeek V4.1 Flash (1017) using the legacy model migration guidance. |
| 2026-11-04 | ⚠️ 🤖 [AI Functions require Databricks Runtime 17.3 LTS or above](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#ai-functions-require-databricks-runtime-173-lts-or-above) | Beginning January 2027, AI Functions other than `ai_similarity` require Databricks Runtime 17.3 LTS or above; calls on older runtimes will return an error. |
| 2026-11-05 | [Allow partner platforms in context-based ingress policies](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#allow-partner-platforms-in-context-based-ingress-policies) | Context-based ingress policies can now allow traffic from Power BI, Tableau Cloud, dbt Cloud, and Genie apps for Slack and Microsoft Teams without manual IP tracking. |
| 2026-11-05 | 🤖 [Dashboard enhancements and bug fixes](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-enhancements-and-bug-fixes) | Dashboard authors can reorder variables in the editor, set display names for field variable options (e.g., "Total revenue" instead of "Sum of sales"), and use Genie Code to import Unity Catalog metric view relationships as dashboard relationships (Beta). |
| 2026-11-05 | 🤖 [External knowledge sources are in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#external-knowledge-sources-are-in-beta) | External knowledge sources (Beta) let an account admin pull Power BI semantic model metadata into Azure Databricks so Genie can use Power BI measure definitions; enable via the account console Previews page. |
| 2026-11-04 | 🤖 [AI Function tasks for jobs (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-function-tasks-for-jobs-beta) | AI Function tasks for jobs (Beta) run `ai_parse_document`, `ai_extract`, or `ai_classify` on volume files or table rows without SQL, processing only new or changed inputs per run and writing results to a Unity Catalog table. |
| 2026-11-03 | [Lakehouse//RT supports fine-grained access control (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#lakehousert-supports-fine-grained-access-control-beta) | Lakehouse//RT (Beta) now supports read queries on tables protected by row filters, column masks, and ABAC policies. |
| 2026-10-31 | [New Azure instance types: Dsv7, Ddsv7, Esv7, Edsv7, Famdsv7, and larger Lsv4 and Lasv4](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#new-azure-instance-types-dsv7-ddsv7-esv7-edsv7-famdsv7-and-larger-lsv4-and-lasv4) | New Azure instance types Dsv7, Ddsv7, Esv7, Edsv7, Famdsv7 (4–32 vCPUs) and larger Lsv4/Lasv4 sizes (48, 64, 80 vCPUs) are available for classic compute. |

*Also new:* [FedRAMP High compliance controls now available on Azure Databricks on Azure](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#fedramp-high-compliance-controls-now-available-on-azure-databricks-on-azure) · [Run Claude Code and Codex in the SSH tunnel](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#run-claude-code-and-codex-in-the-ssh-tunnel) · [Databricks SQL version 2026.44 is rolling out in Current](https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202644-is-rolling-out-in-current) · [Approve Genie tool actions in Slack and Microsoft Teams (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#approve-genie-tool-actions-in-slack-and-microsoft-teams-public-preview) · [Genie One enhancements](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#genie-one-enhancements) · [More external knowledge sources](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#more-external-knowledge-sources) · [Publish Unity Gateway Skills with a GitHub Action in Beta](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#publish-unity-gateway-skills-with-a-github-action-in-beta) · [Genie Agents enhancements](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#genie-agents-enhancements)

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-05 | [CoCo Desktop v1.25.0](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-05-coco-desktop-v1-25-0) | CoCo Desktop v1.25.0 improves dbt performance and stability. |
| 2026-11-04 | 🤖 [HTML reports (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-04-html-reports-preview) | HTML reports (Preview) can be created as self-contained files in Snowsight Workspaces, CoCo Desktop, or Snowflake CoWork with a code-execution agent and published as Report artifacts to share snapshots. |
| 2026-11-02 | [SECRET object tagging](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-02-secret-object-tagging) | Snowflake now allows assigning tags to secrets on create or alter to track sensitive objects, manage governance workflows, and organize secrets consistently with other tagged objects. |

### Terraform provider for Snowflake

- **Release:** [v2.23.0](https://github.com/snowflakedb/terraform-provider-snowflake/releases/tag/v2.23.0) includes a migration guide for breaking changes, reworks preview `snowflake_alert`, `snowflake_pipe`, and `snowflake_share` resources and data sources, adds new preview resources for `snowflake_postgres_mirror`, `snowflake_replication_group`, `snowflake_projection_policy`, `snowflake_code_bundle`, and `snowflake_backup_policy`, makes `snowflake_warehouse` default to `WAREHOUSE_TYPE = STANDARD` when `warehouse_type` is omitted, adds a `token_file_path` provider field for token-file authentication, and adds `version_trigger` to `snowflake_openflow_connector` for in-place bundle updates.

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-05 | BigQuery | ⚠️ [The BigQuery Metadata curation console page has been removed](https://docs.cloud.google.com/bigquery/docs/release-notes#November_05_2026) | The BigQuery Metadata curation console page has been removed; use Knowledge Catalog to schedule Cloud Storage discovery scans, manage data profiling and quality, and perform governance tasks. |
| 2026-11-05 | Microsoft Fabric | [Use OneLake as native storage for Azure Databricks (Generally Available)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks-Generally/ba-p/5377939) | OneLake external-location support for Azure Databricks Unity Catalog is generally available from the Microsoft Fabric side with OneLake Security enabled by default, allowing supported Unity Catalog-managed data to be stored directly in OneLake. |
| 2026-11-05 | Microsoft Fabric | [Regular expression functions in Microsoft Fabric Data Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Regular-expression-functions-in-Microsoft-Fabric-Data-Warehouse/ba-p/5382375) | Microsoft Fabric Data Warehouse (Preview) adds scalar T-SQL functions `REGEXP_LIKE` and `REGEXP_REPLACE` to extract, validate, standardize, and mask text patterns directly in the warehouse. |
| 2026-11-05 | Microsoft Fabric | [Build more connected workflows with Fabric Actions and Business Actions in Fabric Pipelines (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Build-more-connected-workflows-with-Fabric-Actions-and-Business/ba-p/5377911) | Fabric Actions and Business Actions (Preview) let pipelines orchestrate Fabric operations (e.g., semantic model refresh) and business application steps without custom API integrations. |

---

## Open-source stack

### Dagster

- **Release:** [1.13.29](https://github.com/dagster-io/dagster/releases/tag/1.13.29) fixes `dg --help` breaking with `typer` 0.26+, shift-click selection across row 10, and mobile layout issues on asset pages and run tables. It adds mobile layouts for code location overview, sensor and schedule detail pages, and improves global search and asset catalog load performance by sharing filtering logic.

### dlt

- **News:** [dltHub on Databricks: the Unity Catalog Pages walkthrough](https://dlthub.com/blog/databricks-unity-catalog-pages-genie-ontology-walkthrough) demonstrates a single CI waste definition in a Unity Catalog Page driving the dlt pipeline, model, metric view, and Genie's answer. [Trusted answers on new data from day one, with dltHub on Databricks](https://dlthub.com/blog/dlthub-databricks-unity-catalog-pages-genie) announces private preview integration with Databricks Unity Catalog Pages and Genie Ontology for trusted answers on fresh data. [Postgres to BigQuery benchmark: dltHub vs. Fivetran, Airbyte, and Stitch](https://dlthub.com/blog/sql-benchmark-saas) benchmarks 191.5M rows across tools for performance, ease of use, and customizability.

### DuckDB

- **News:** [How JetBrains Built Cross-Database Queries into DataGrip with DuckDB](https://duckdb.org/2026/11/05/jetbrains-datagrip.html) explains how JetBrains embedded DuckDB in DataGrip using custom table functions to enable cross-database joins without building a new query engine.

### Polars

- **News:** [Polars Cloud becomes Polars Nanook](https://pola.rs/posts/polars-cloud-becomes-polars-nanook/) announces the rebrand as the platform expands beyond managed cloud compute to a full data platform supporting both cloud and on-premise airgapped environments.

### Soda Core

- **Release:** [v4.30.0](https://github.com/sodadata/soda-core/releases/tag/v4.30.0) adds data-plane statement and expression nodes rendered for Postgres, SQL Server, Snowflake, and Athena, plus workload identity federation authentication for SQL Server, Synapse, and Fabric. It fixes contract invalid-value counting when lists contain nulls, keeps distinct rows separate in combined row keys, and redacts session post-processing per file via a RedactionPolicy.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Prefect](https://github.com/PrefectHQ/prefect), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata), [SQLFluff](https://github.com/sqlfluff/sqlfluff)

---

## Across platforms

- OneLake as Unity Catalog external location is now GA from the Microsoft Fabric side, enabling Azure Databricks to store Unity Catalog‑managed data directly in OneLake with OneLake Security enabled by default.
- Fine‑grained access control expands: Databricks Lakehouse//RT (Beta) adds read support for row filters, column masks, and ABAC policies; Snowflake adds SECRET object tagging for governance workflows on secrets alongside other tagged objects.
- AI‑assisted authoring surfaces: Databricks Dashboards (Beta) gain Genie Code to import Unity Catalog metric view relationships; Snowflake HTML reports (Preview) can be created via a code‑execution agent in Snowsight, CoCo Desktop, or CoWork and published as Report artifacts.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-05 | [Choosing How ML Models Move to Production on Snowflake: Code, Model, or Hybrid Promotion](https://medium.com/snowflake/choosing-how-ml-models-move-to-production-on-snowflake-code-model-or-hybrid-promotion-aca2ae322bb6) | Snowflake on Medium | The author walks through model promotion patterns (code, model, hybrid) on Snowflake, noting that environments are typically separate databases or accounts (DEV/STAGING/PROD) and that data access, training cost, CI/CD readiness, and business needs shape the right pattern. |
| 2026-11-05 | [Best Practices for Scoping and Organising Snowflake Semantic Views](https://medium.com/snowflake/best-practices-for-scoping-and-organising-snowflake-semantic-views-6e2e2758b538) | Snowflake on Medium | The author tested semantic view topologies on the Tasty Bytes dataset with a 20-question suite and found neither topology nor size affected accuracy, but a single duplicated column name did; Composable semantic views and strict mode remain in private preview. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Exporting tables from a SQL Server backup (.bak) to Parquet without restoring it](https://blog.arpe.io/fastbcp-1-6-export-sql-server-backup-to-parquet) | Hacker News | [22 points, 3 comments](https://news.ycombinator.com/item?id=50380410) | FastBCP 1.6 extracts tables directly from SQL Server .bak backup files into Parquet without restoring the database or running a SQL Server instance. |
| [I turned 100 old science fiction books into a database of 6,222 startup ideas](https://www.reddit.com/r/SideProject/comments/1xly9r8/i_turned_100_old_science_fiction_books_into_a/) | Hacker News | [10 points, 5 comments](https://news.ycombinator.com/item?id=50383975) | — |
| [How Flink's Kafka connector commits offsets to Kafka](https://dalelane.co.uk/blog/?p=6161) | Lobste.rs | [2 points, 0 comments](https://lobste.rs/s/wfw32o/how_flink_s_kafka_connector_commits) | The author details, with diagrams, how Apache Flink's Kafka connector commits consumer offsets to Kafka, based on a pull request they merged into flink-connector-kafka. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*