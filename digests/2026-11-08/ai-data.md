# Data Engineering 2026-11-08

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-08) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-08/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-08/ai-models) · **🟨 Data Engineering**

> Vendor items: 2 | Projects: 26 | Active today: 0 | Stable releases: 0 | Prereleases (not covered): 0 | Generated: 2026-11-08 05:50 UTC

---

## Highlights
- No item stands out today.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-02 | 🤖 [CoCo automations (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-02-cortex-code-automations-ga) | CoCo automations enable scheduling recurring, unattended CoCo runs in a Snowflake-managed sandbox, with each run creating a Cortex thread to inspect the agent's messages, tool calls, and results. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-02 | 🤖 [From a prompt to an operational dashboard: Generate Real-Time Dashboards with Copilot (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/From-a-prompt-to-an-operational-dashboard-Generate-Real-Time/ba-p/5380258) | Copilot in Microsoft Fabric can generate a Real-Time Dashboard from a natural-language description using tables from a selected Eventhouse database. |

---

Nothing new from Databricks ([Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)) or Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

---

## Across platforms

- AI-assisted authoring appears on both Snowflake and Fabric: Snowflake's CoCo automations (GA) schedule unattended agent runs in a managed sandbox, while Fabric's Copilot (Preview) generates Real-Time Dashboards from natural-language prompts against Eventhouse tables.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [PostgreSQL Internals [pdf] (2023)](https://edu.postgrespro.com/postgresql_internals-14_en.pdf) | Hacker News | [87 points, 7 comments](https://news.ycombinator.com/item?id=50361765) | — |
| ZeBridge – PostgreSQL replicas on devices, synchronized over NATS ([ndrean/ZeBridge](https://github.com/ndrean/ZeBridge)) | Hacker News | [27 points, 3 comments](https://news.ycombinator.com/item?id=50354763) | ZeBridge enables bidirectional local-first synchronization between PostgreSQL and edge clients like SQLite, PGLite, Postgres, or DuckDB over NATS. |
| [Just how far can the FOR UPDATE SKIP LOCKED Postgres queue go?](https://garbagecollected.io/posts/postgres-task-queue-where-it-breaks/) | Lobste.rs | [1 point, 1 comment](https://lobste.rs/s/y8i714/just_how_far_can_for_update_skip_locked) | The author analyzes the scaling limits of FOR UPDATE SKIP LOCKED PostgreSQL queues and mitigation strategies. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*