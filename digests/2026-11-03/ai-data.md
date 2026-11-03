# Data Engineering 2026-11-03

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-03) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-03/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-03/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-03/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Projects: 27 | Active today: 2 | Stable releases: 1 | Prereleases (not covered): 1 | Generated: 2026-11-03 06:30 UTC

---

## Highlights
- Azure Databricks workspaces with the compliance security profile: Databricks-provided MCP connectors (Google Drive, Gmail, Google Calendar, Microsoft 365, Atlassian, Slack, GitHub) will be enabled by default in Genie One and Genie Code starting December 2026; govern via Unity Catalog and Unity Gateway.
- Azure Databricks users: OneLake external locations enter Public Preview as managed storage for Unity Catalog catalogs (tables, volumes, materialized views, streaming tables) with Unity Catalog governance; enable via the Previews page.
- BigQuery users: The Data Engineering Agent reaches GA with support for BigQuery AI, ML, and object functions and statements in generated Dataform SQLX pipelines and agent instruction files.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-02 | [Higher limits and BROWSE support for Unity Catalog secrets](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#higher-limits-and-browse-support-for-unity-catalog-secrets) | Unity Catalog secrets limits increase to 1,000 per schema and 10,000 per metastore, and the BROWSE privilege on a catalog now allows secret metadata discovery without value access or code references. |
| 2026-11-02 | [OneLake external locations are in Public Preview](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#onelake-external-locations-are-in-public-preview) | OneLake external locations can now serve as managed storage for Unity Catalog catalogs (tables, volumes, materialized views, streaming tables) with Unity Catalog governance, enabled via the Previews page. |
| 2026-11-02 | [Databricks Runtime 19: November 2, 2026](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-2-2026) | ALTER SHARE ADD/ALTER VIEW now supports WITH HISTORY and WITHOUT HISTORY clauses, and Python libraries pytz and tzdata are updated to 2026.5 versions. |
| 2026-10-29 | 🤖 [Databricks-provided MCP connectors in Genie One and Genie Code will soon be enabled by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#databricks-provided-mcp-connectors-in-genie-one-and-genie-code-will-soon-be-enabled-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Starting December 2026, Databricks-provided MCP connectors (Google Drive, Gmail, Google Calendar, Microsoft 365, Atlassian, Slack, GitHub) will be enabled by default in Genie One and Genie Code for workspaces with the compliance security profile, governed via Unity Catalog and Unity Gateway. |
| 2026-10-28 | [Serverless log delivery to Unity Catalog volumes (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#serverless-log-delivery-to-unity-catalog-volumes-beta) | Workspace admins can now route serverless job application logs to Unity Catalog volumes for retention and analysis. |
| 2026-10-27 | 🤖 [Lakeflow Designer October release](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#lakeflow-designer-october-release) | The October release adds an AI Function operator with ai_decide (Beta), HTML operator, shareable full-screen previews, operator categorization, custom operator publishing, and auto-layout for groups in Lakeflow Designer. |

*Also new:* [Genie Agents enhancements](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#genie-agents-enhancements)

### Terraform provider for Databricks

- **Release:** [v1.141.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.141.0) adds resources and data sources for `databricks_genie_agent`, supports fixed-size REALTIME warehouses with `max_dbu`, `statement_timeout`, and `customer_version_label` in `databricks_sql_endpoint` and `databricks_sql_warehouse`, fixes the Azure Databricks US Gov account console host in authentication docs, and preserves `auto_stop_mins`, REALTIME `statement_timeout`, and `max_dbu` in warehouse exports.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-02 | [Open Data Sharing (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-02-open-data-sharing-ga) | Open Data Sharing is now generally available. |
| 2026-11-02 | 🤖 [AI_EXTRACT updates](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-02-ai-extract) | AIEXTRACT achieves a 12.8% relative accuracy improvement for extracting fields, lists, and tables from complex documents like forms, handwritten content, dense tables, and charts. |
| 2026-10-28 | 🤖 [OpenAI GPT-5.6 Luna, GPT-5.6 Terra, and GPT-6 Luna in AI Functions (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-28-openai-models-ai-functions-preview) | OpenAI models GPT-5.6 Luna, GPT-5.6 Terra, and GPT-6 Luna are now available in public preview within AI Functions. |

*Also new:* [OpenAI GPT-6.1 Terra (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-27-openai-gpt-61-terra-preview)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-02 | Azure updates | [[Launched] Generally Available: Azure Storage Actions adds automatic task updates, execution controls, and case-sensitive matching](https://azure.microsoft.com/updates?id=578628) | Azure Storage Actions adds automatic task definition propagation, execution controls, and case-sensitive matching for Blob and Data Lake Storage automation. |
| 2026-11-02 | BigQuery | 🤖 [The Data Engineering Agent now supports BigQuery AI, ML, and object functions and statements in generated Dataform SQLX pipelines and agent instruction files (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_02_2026) | The Data Engineering Agent now generates Dataform SQLX pipelines and instruction files using BigQuery AI, ML, and object functions and statements. |
| 2026-11-02 | Azure updates | [[Launched] Generally Available: Change from virtual network integration to a private endpoint capable network configuration in Azure Database for PostgreSQL flexible server](https://azure.microsoft.com/updates?id=574541) | Existing VNet-integrated Azure Database for PostgreSQL Flexible Server instances can now migrate from delegated-subnet networking to a private endpoint-capable configuration. |

*Also new:* [You can now monitor the performance, adoption, latency, and costs of your data agents and their conversations by using Google Cloud Observability in BigQuery (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_02_2026) · [[Launched] Generally Available: Restart databases in Azure SQL DB via the Azure portal](https://azure.microsoft.com/updates?id=577992) · [Lakehouse caching for cross-cloud data access (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_02_2026) · [The SECURE_CONTEXT function is now available in Preview (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_02_2026) · [You can use the AI.PARSE_DOCUMENT function to extract layout elements such as titles, headings, paragraphs, lists, tables, and images by using the Document AI layout parser to convert unstructured doc…](https://docs.cloud.google.com/bigquery/docs/release-notes#November_02_2026)

---

## Open-source stack

### DuckDB

- **News:** [Moving our warehouse off DuckDB](https://news.ycombinator.com/item?id=50338747) reports a team migrated from DuckDB and DuckLake to a custom Trino deployment and a new table format called HogLake, detailing what failed at scale. The case study highlights operational limits that prompted the switch and may inform architects evaluating DuckDB for warehouse workloads.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata), [SQLFluff](https://github.com/sqlfluff/sqlfluff)

---

## Across platforms

- AI functions in SQL and pipelines: Snowflake says AI_EXTRACT gains a 12.8% accuracy improvement (GA) and OpenAI GPT-5.6/6 models enter Preview in AI Functions; BigQuery's Data Engineering Agent reaches GA generating Dataform SQLX with BigQuery AI, ML, and object functions; Databricks Lakeflow Designer adds an ai_decide AI Function operator in Beta.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-28 | [From seats to prompts: reclaiming CRM licenses with a governed read model](https://medium.com/snowflake/from-seats-to-prompts-reclaiming-crm-licenses-with-a-governed-read-model-5d18a8ebdfda) | Snowflake on Medium | The author (Snowflake's go-to-market engineering team) replaced excess full CRM licenses with a governed read model on Snowflake after finding many licensed users only read data without creating or editing records. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Show HN: Rustable is an open source database client built in Rust](https://rustable.app) | Hacker News | [18 points, 7 comments](https://news.ycombinator.com/item?id=50347524) | Rustable releases an open‑source, cross‑platform database client written in Rust for macOS, Windows, and Linux. |
| [Show HN: ClickBench inspired leaderboard for multiple database benchmarks](https://benchmark.pivotlake.io/) | Hacker News | [4 points, 0 comments](https://news.ycombinator.com/item?id=50337773) | — |
| [An Introduction to Bε-trees and Write-Optimization](https://www.usenix.org/publications/login/oct15/bender) | Lobste.rs | [11 points, 0 comments](https://lobste.rs/s/0ec9yk/introduction_b_trees_write_optimization) | The article introduces Bε‑trees and write‑optimization techniques that form the foundation of the GEFS file system. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*