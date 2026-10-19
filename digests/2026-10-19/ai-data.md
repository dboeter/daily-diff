# Data Engineering Watch 2026-10-19

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-19) · [🤖 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-19/ai-agents) · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-19/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-19/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-19/ai-web) · **🗄️ Data Engineering Watch** · [📈 Agent & AI Coding Trends](https://dboeter.github.io/daily-diff/#2026-10-19/ai-trending) · [🧠 AI Models](https://dboeter.github.io/daily-diff/#2026-10-19/ai-hf)

> Generated: 2026-10-19 01:04 UTC | Projects: 17 | Active today: 0 | Stable releases: 0 | Prereleases (not covered): 0

---

## Highlights
- Databricks AI Runtime SDK replaces the deprecated serverless_gpu package in GPU environment version 6.  
- Knowledge Assistant and Supervisor Agent are now legacy; new agents should use the Agent Bricks CLI.  
- Snowflake release 10.37 introduces behavior change bundles, with bundle 2026_08 disabled by default for testing.  
- Azure Databricks makes Feature Views generally available for batch, streaming, and request‑time data.

---

## Databricks

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-13 | Azure Databricks | ⚠️ [Databricks AI Runtime SDK replaces serverless_gpu](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#databricks-ai-runtime-sdk-replaces-serverless_gpu) | Starting in GPU environment version 6, the Databricks AI Runtime SDK ( databricks-sdk-air ) replaces the deprecated serverless_gpu package. It provides the… |
| 2026-10-12 | Azure Databricks | ⚠️ [Knowledge Assistant and Supervisor Agent are now legacy](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#knowledge-assistant-and-supervisor-agent-are-now-legacy) | Knowledge Assistant and Supervisor Agent are now legacy offerings. For new agents written in code, Databricks recommends the Agent Bricks CLI . To build agents… |
| 2026-10-12 | Azure Databricks | [Feature Views are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#feature-views-are-now-generally-available) | Feature Views are now generally available for batch, streaming, and request-time data. They will be enabled for compliance security profile workspaces in… |
| 2026-10-14 | Azure Databricks | [Billing for private network gateway](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#billing-for-private-network-gateway) | Starting on or after December 1, 2026, Azure Databricks will bill for private network gateway usage. See Private network gateway . |
| 2026-10-12 | Azure Databricks | [Feature Views will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#feature-views-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Feature Views are now generally available. They will be automatically enabled for workspaces with the compliance security profile enabled in mid-November 2026.… |
| 2026-10-15 | Azure Databricks | [MySQL integrated CDC pipeline is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#mysql-integrated-cdc-pipeline-is-now-generally-available) | The integrated CDC pipeline for MySQL is now generally available. An integrated CDC pipeline ingests change data from MySQL into Azure Databricks using a… |
| 2026-10-13 | Azure Databricks | [External writes to managed Delta tables are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#external-writes-to-managed-delta-tables-are-now-generally-available) | Support for creating and writing to Unity Catalog managed Delta tables from external Apache Spark clients is now generally available. Tables must have catalog… |
| 2026-10-15 | Azure Databricks | [ADBC driver for Power BI is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#adbc-driver-for-power-bi-is-now-generally-available) | The Arrow Database Connectivity (ADBC) driver for the Azure Databricks connector for Power BI is now generally available. ADBC is the default driver for new… |

---

## Snowflake

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-16 | Snowflake | ⚠️ [10.37 Release Notes (with behavior changes): Oct 08, 2026 - Oct 16, 2026](https://docs.snowflake.com/en/release-notes/2026/10_37) | Behavior change bundles This release contains the following behavior change bundles:... Read more |
| 2026-10-16 | Snowflake behavior changes | ⚠️ [Behavior change bundle 2026_08](https://docs.snowflake.com/en/release-notes/bcr-bundles/2026_08_bundle) | Introduced in the 10.37 release (October 8-16, 2026) as Disabled by Default; account admins can enable for testing. Status planned to change in a subsequent… |
| 2026-10-16 | Snowflake | [October 16, 2026: Apache Iceberg™ v3 table upgrades and expression defaults (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-16-iceberg-v3-upgrade-expression-defaults-ga) | The following Apache Iceberg™ v3 features are now generally available. |
| 2026-10-15 | Snowflake | [Oct 15, 2026: Data mirroring for Snowflake Postgres (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-15-postgres-data-mirroring-ga) | Data mirroring for Snowflake Postgres is now generally available. Data mirroring continuously replicates tables from a Snowflake Postgres instance into a… |
| 2026-10-14 | Snowflake | [Oct 14, 2026: Document generation in Snowflake CoWork (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-14-cowork-document-generation-ga) | Document generation in Snowflake CoWork is now generally available and is no longer in Preview. You can ask Snowflake CoWork to generate a PDF, a Word document… |

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-14 | BigQuery | [Feature: The Apache Hive catalog endpoint in the Lakehouse runtime catalog is now generally available (GA).](https://docs.cloud.google.com/bigquery/docs/release-notes#October_14_2026) | The Apache Hive catalog endpoint in the Lakehouse runtime catalog is now generally available (GA). This integration lets you use the metastore as a serverless,… |
| 2026-10-15 | BigQuery | [Feature: You can copy tables across regions.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_15_2026) | You can copy tables across regions. This feature is now generally available (GA). |
| 2026-10-12 | BigQuery | [Feature: Incremental data transfers for the BigQuery Data Transfer Service for PostgreSQL and ServiceNow are now generally available (GA).](https://docs.cloud.google.com/bigquery/docs/release-notes#October_12_2026) | Incremental data transfers for the BigQuery Data Transfer Service for PostgreSQL and ServiceNow are now generally available (GA). |

---

## Data × AI
- Databricks AI Runtime SDK now supersedes serverless_gpu, providing the SDK for GPU workloads in Databricks AI Runtime.  
- Knowledge Assistant and Supervisor Agent are deprecated; Databricks recommends the Agent Bricks CLI for building custom agents.  
- Snowflake CoWork document generation is generally available, enabling AI‑driven PDF and Word creation from natural language prompts.

---

## Worth a Look
- Snowflake Apache Iceberg v3 table upgrades are now GA, offering enhanced table features and performance.  
- BigQuery adds cross‑region table copy capability, simplifying data movement across locations.  
- Azure Databricks MySQL integrated CDC pipeline is GA, streamlining change‑data capture from MySQL into Delta Lake.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*