# Data Engineering 2026-10-29

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-29) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-29/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-29/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-29/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Projects: 17 | Active today: 0 | Stable releases: 0 | Prereleases (not covered): 0 | Generated: 2026-10-29 05:34 UTC

---

## Highlights
- No item stands out today.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-28 | ⚠️ 🤖 [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2026-10-28 | ⚠️ 🤖 [Serverless GPU in clean rooms will soon be on by default for accounts where it's turned off](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#serverless-gpu-in-clean-rooms-will-soon-be-on-by-default-for-accounts-where-its-turned-off) | Starting on or after November 26, 2026, serverless GPU in clean rooms becomes enabled by default for Enterprise and Premium tier accounts; until then, admins can turn on Clean Rooms AI Runtime from the Previews page in the account console. |
| 2026-10-28 | 🤖 [Serverless GPU for clean room notebooks is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#serverless-gpu-for-clean-room-notebooks-is-now-generally-available) | Serverless GPU for clean room notebooks is generally available, allowing model inference and training on serverless GPU compute with AI Runtime, using the same approval flow, data access, and output tables as other clean room notebooks. |
| 2026-10-27 | 🤖 [Unity Gateway Usage Dashboard v1.0](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#unity-gateway-usage-dashboard-v10) | The Unity Gateway Usage Dashboard v1.0 is available, providing coding-agent adoption metrics, harness usage, estimated session spend, expanded model and user spend analysis, and tag-based spend attribution. |
| 2026-10-26 | [Databricks Runtime 19: October 26, 2026](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-october-26-2026) | — |
| 2026-10-26 | [Databricks SQL version 2026.43 is rolling out in Current](https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202643-is-rolling-out-in-current) | — |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-28 | [Request Access in Workspaces (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-28-request-access-workspaces-ga) | — |
| 2026-10-28 | [Check the quotas that apply to you with MY_BUDGET_SUMMARY (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-28-my-budget-summary) | The `MY_BUDGET_SUMMARY` table function is generally available in Snowflake, letting users check their limits, usage, and block status for per-user quotas. |
| 2026-10-27 | [DCM Projects DEFINE TASK GRAPH (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-27-dcm-define-task-graph-preview) | In DCM Projects, `DEFINE TASK GRAPH` is now in Public Preview, enabling declarative management of task graphs and member tasks with graph-wide settings for schedule, overlap policy, retry behavior, and member-task defaults. |
| 2026-10-26 | 🤖 [CoCo Desktop v1.23.0](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-26-coco-desktop-v1-23-0) | CoCo Desktop v1.23.0 improves session organization and brings Snowflake Managed MCP servers to all accounts. |

*Also new:* [Cortex AI usage in Native App usage history](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-28-native-app-ai-usage-history)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-28 | 🤖 [Govern your Microsoft Fabric data estate from one place with the OneLake catalog and Govern Skills (Generally Available)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Govern-your-Microsoft-Fabric-data-estate-from-one-place-with-the/ba-p/5377369) | The Govern experience in the OneLake catalog is generally available, centralizing governance for tenants, domains, capacities, workspaces, tags, and policies, while Govern Skills in the Skills for Fabric collection give AI agents knowledge to audit, investigate, and remediate governance issues at scale. |
| 2026-10-28 | [More ways to use scalar UDFs in Microsoft Fabric Data Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/More-ways-to-use-scalar-UDFs-in-Microsoft-Fabric-Data-Warehouse/ba-p/5376708) | Scalar UDFs in Microsoft Fabric Data Warehouse gain enhanced procedural logic support in Preview, including more natural loop control, broader query-shape support, automatic adoption of new capabilities, inlineability validation with diagnostics, and a `WITH INLINE = AUTO` override for non-inlineable functions. |

---

Nothing new from Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino)) today.

---

## Across platforms

- MCP integration: Databricks requires migration from the Genie One MCP Beta endpoint to the `system.ai.genie_one_mcp` MCP in Unity Gateway by November 30, 2026; Snowflake adds Snowflake Managed MCP servers to CoCo Desktop v1.23.0 for all accounts.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Why Microsoft contributes to Postgres: What I tell people](https://techcommunity.microsoft.com/blog/adforpostgresql/why-microsoft-contributes-to-postgres-what-i-tell-people/4568479) | Hacker News | [4 points, 0 comments](https://news.ycombinator.com/item?id=50277503) | A Microsoft employee explains why the company contributes to PostgreSQL, based on a talk given at PGConf.EU in Valencia. |
| [The Benchmarking Crisis](http://databasearchitects.blogspot.com/2026/10/the-benchmarking-crisis.html) | Lobste.rs | [11 points, 8 comments](https://lobste.rs/s/smtpje/benchmarking_crisis) | A blog post on databasearchitects.blogspot.com discusses a benchmarking crisis, written by and for database architects. |
| [Should our LLM wiki use vector search? We benchmarked it before deciding](https://dev.to/peter-white-1492/should-our-llm-wiki-use-vector-search-we-benchmarked-it-before-deciding-fkf) | Dev.to | [15 reactions, 13 comments](https://dev.to/peter-white-1492/should-our-llm-wiki-use-vector-search-we-benchmarked-it-before-deciding-fkf) | The author benchmarks vector search for their LLM wiki to evaluate whether it helps users who phrase questions in their own way. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*