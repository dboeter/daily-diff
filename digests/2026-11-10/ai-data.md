# Data Engineering 2026-11-10

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-10) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-10/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-10/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-10/ai-policy) · **🟨 Data Engineering**

> Vendor items: 15 | Projects: 26 | Active today: 2 | Stable releases: 2 | Prereleases (not covered): 0 | Generated: 2026-11-10 07:03 UTC

---

## Highlights
- − Azure Databricks workspaces using Zhipu AI GLM 5.2 must migrate to GLM 5.3 before the model retires on February 4, 2027.
- Databricks CLI v1.25.0 removes `CRITICAL` as a valid `compute.priority_class` value; AI Runtime API callers using that value must update to a supported priority class.
- Microsoft Fabric users with SQL pools should plan for upcoming API and UI changes as built-in versus custom pool distinctions are removed in a unified pool model.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-06 | ⚠️ 🤖 [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2026-11-05 | ⚠️ 🤖 [Smart Routing is faster and lower cost, and now routes subagents only (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta) | Smart Routing now routes only subagents instead of the first prompt, reducing cost by up to 70% and p90 latency from 9 seconds to 2 seconds, while Smart Routing for Codex is paused. |
| 2026-11-09 | 🤖 [Genie Search is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-search-is-now-generally-available) | Genie Search indexes organizational knowledge from Google Drive, Jira, Confluence, and Workday while preserving source permissions, powering org directories and unified search in Discover alongside MCP connectors. |
| 2026-11-09 | 🤖 [Genie Ontology is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-ontology-is-now-generally-available) | Genie Ontology provides a business-aware context layer for Genie One, Genie Code, and other AI agents by combining modeled knowledge from Unity Catalog semantics with learned knowledge extracted from assets and usage. |
| 2026-11-09 | [Shift dates in Lakeflow Jobs parameters with date arithmetic (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#shift-dates-in-lakeflow-jobs-parameters-with-date-arithmetic-beta) | Lakeflow Jobs parameters now support date arithmetic in dynamic value references, allowing expressions like `{{(job.start_time - 1.day).iso_date}}` to shift dates by a duration before formatting. |
| 2026-11-07 | [Recover dropped Unity Catalog volumes with UNDROP VOLUME](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#recover-dropped-unity-catalog-volumes-with-undrop-volume) | Dropped Unity Catalog volumes can be recovered within 7 days using `SHOW VOLUMES DROPPED` to find the ID and `UNDROP VOLUME WITH ID` to restore privileges and tags, requiring Databricks Runtime 19 or above. |
| 2026-11-06 | 🤖 [Load Unity Catalog tables into PyTorch on AI Runtime (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#load-unity-catalog-tables-into-pytorch-on-ai-runtime-beta) | UCDataset streams Unity Catalog table rows directly into PyTorch training loops on AI Runtime without Spark or a SQL warehouse, applying filter expressions and deletion vectors while splitting rows across GPUs and data loader workers. |
| 2026-11-03 | [Databricks SQL version 2026.45 is now available in Preview](https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202645-is-now-available-in-preview) | Databricks SQL 2026.45 Preview adds `WITH HISTORY` and `WITHOUT HISTORY` clauses to `ALTER SHARE... ADD VIEW` and `ALTER SHARE... ALTER VIEW` for controlling view history sharing. |

*Also new:* [Databricks Genie app in Microsoft Teams is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-in-microsoft-teams-is-now-generally-available) · [Databricks Genie app for Slack is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-for-slack-is-now-generally-available)

### Databricks CLI

- **Release:** [v1.25.0](https://github.com/databricks/cli/releases/tag/v1.25.0) removes `CRITICAL` as a valid `compute.priority_class` value; the AI Runtime API no longer accepts it.
- **Release:** Fixes `%pip` in Jupyter notebooks over `databricks ssh connect` on serverless envs 5/6 and recent Databricks Runtime, which fell back to stock IPython magic; also fixes bundle grants/permissions staying under old names/IDs after resource rename/recreate, and registered model `aliases` now apply on deploy instead of being ignored.
- **Release:** Adds `postgres_data_apis` resource (Private Preview) for Lakebase Postgres Data API, more specific `error_category` for `databricks aitools install --output json`, and templates now embed workspace ID (`?w=`) in `workspace.host` for multi-workspace hosts.

### Terraform provider for Databricks

- **Release:** [v1.142.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.142.0) adds databricks_connection.secrets for Unity Catalog secrets, new LakeWatch resources (`databricks_lakewatch_datasource`, `databricks_lakewatch_rule`, etc.), and Slack/Teams blocks for `databricks_notification_destination`.
- **Release:** Fixes data races in concurrent provider client caches and preserves `databricks_pipeline.expected_last_modified` on refresh to prevent post-apply drift.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-08 | [IPADDRESS data type (General availability)](https://docs.snowflake.com/en/release-notes/2026/10_40) | The `IPADDRESS` data type stores IPv4 or IPv6 addresses as native 128-bit values with validation, canonical storage, and numeric address order comparison. |
| 2026-11-08 | 🤖 [CoCo Admin in Snowsight (Preview)](https://docs.snowflake.com/en/release-notes/2026/10_40) | CoCo Admin in Snowsight automatically detects CoCo enablement status and identifies the exact remaining setup steps instead of requiring a manual checklist. |
| 2026-11-06 | 🤖 [Anthropic Claude 5.5 and OpenAI GPT-6 models (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-06-claude-5-5-openai-gpt-6-ga) | Anthropic Claude 5.5 and OpenAI GPT-6 models are now generally available in Snowflake. |

*Also new:* [Snowflake CoCo for Microsoft Excel and Snowflake CoCo for Google Sheets (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-coco-excel-sheets-preview) · [Skill recommendations and suggestions to create and share skills in CoCo](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-09-coco-skill-recommendations)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-09 | Microsoft Fabric | ⚠️ [Unifying SQL Pools: Upcoming changes to UI and APIs](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Unifying-SQL-Pools-Upcoming-changes-to-UI-and-APIs/ba-p/5397390) | SQL pool configurations are moving to a unified model that removes the built-in versus custom pool distinction, representing all pools through a single configuration across UI and APIs with upcoming changes to GET and PATCH API responses. |
| 2026-11-09 | BigQuery | [Query performance troubleshooting and job and system performance comparison in the BigQuery jobs explorer (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026) | BigQuery jobs explorer now provides generally available query performance troubleshooting and job and system performance comparison capabilities. |
| 2026-11-09 | BigQuery | [When you create or schedule a pipeline, you can specify the maximum number of concurrently executed pipeline tasks (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026) | BigQuery pipelines support specifying the maximum number of concurrently executed pipeline tasks at creation or scheduling time. |
| 2026-11-09 | BigQuery | [To support your FinOps practices, you can now opt in to compute cost attribution in BigQuery editions (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026) | BigQuery editions offer an opt-in compute cost attribution feature that assigns billed compute charges to query projects based on actual commitment and autoscaling slot usage from the administration project's reservation capacity. |

*Also new:* [You can use compression functions in GoogleSQL to compress or decompress bytes or string values by using the Zstandard (Zstd) lossless data compression algorithm](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026)

---

Nothing new from Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---

## Across platforms

- AI model serving advances on Databricks and Snowflake: Databricks Smart Routing (Beta) now routes subagents only, cutting cost up to 70% and p90 latency from 9s to 2s, while Snowflake makes Anthropic Claude 5.5 and OpenAI GPT-6 generally available for Cortex workloads.
- Cost attribution appears on Databricks and BigQuery: Databricks Smart Routing reduces routing cost per request, and BigQuery editions add opt-in compute cost attribution (Preview) that assigns billed slots to query projects based on actual reservation usage.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-09 | [Who is actually using your Snowflake MCP server?](https://medium.com/snowflake/who-is-actually-using-your-snowflake-mcp-server-683a6cb543d7) | Snowflake on Medium | The author demonstrates tracking Snowflake MCP server usage by assigning each server its own OAuth security integration and joining query history to login history, yielding usage per server, user, and day with one join. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Ultorg: The User Interface for Relational Databases](https://www.ultorg.com/) | Hacker News | [26 points, 5 comments](https://news.ycombinator.com/item?id=50435898) | Ultorg offers a spreadsheet-like UI for relational databases, enabling query and edit across tables without writing SQL. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*