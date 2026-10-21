# Data Engineering Watch 2026-10-21

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-21) · [🤖 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-21/ai-agents) · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-21/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-21/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-21/ai-web) · [⚖️ Policy Watch](https://dboeter.github.io/daily-diff/#2026-10-21/ai-policy) · **🗄️ Data Engineering Watch**

> Generated: 2026-10-21 01:27 UTC | Vendor items: 16 | Projects: 17 | Active today: 0 | Stable releases: 0 | Prereleases (not covered): 0

---

## Highlights
- Azure Databricks will retire DeepSeek V4.1 Flash on November 19, 2026, requiring migration to DeepSeek V4.1 Flash (1017).  
- The MLflow Logs tab for AI Runtime runs replaces the Artifacts tab, adding search, filter, download, and 60‑day log retention.  
- Databricks Runtime 19 hides internal Spark Connect metrics for row filters and column masks, which may break dependent notebooks or tools.  
- Microsoft Fabric deprecates the Foundry data‑agent custom tool, ending support November 6, 2026; migration to Fabric IQ (OneLake Catalog) is required.  
- Asynchronous processing with transformWithState is now GA, enabling concurrent state operations.

---

## Databricks

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-19 | Azure Databricks | ⚠️ [DeepSeek V4.1 Flash is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#deepseek-v41-flash-is-scheduled-for-retirement) | DeepSeek V4.1 Flash will be retired on November 19, 2026, and must be migrated to DeepSeek V4.1 Flash (1017) using the provided guidance. |
| 2026-10-15 | Azure Databricks | ⚠️ [Redesigned MLflow Logs tab for AI Runtime runs](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#redesigned-mlflow-logs-tab-for-ai-runtime-runs) | The MLflow Logs tab for AI Runtime runs now supports search, filter, and download, replacing the deprecated Artifacts tab log files for new runs, with logs retained for 60 days. |
| 2026-10-19 | Azure Databricks | ⚠️ [Databricks Runtime 19: October 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-october-19-2026) | Spark Connect DataFrame execution metrics now hide internal operators and metrics for row filters and column masks, protecting policy execution details, which may require updates to notebooks or tools that rely on those metrics. |
| 2026-10-19 | Azure Databricks | [Asynchronous processing with transformWithState is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#asynchronous-processing-with-transformwithstate-is-now-generally-available) | Asynchronous processing for the Python transformWithState API is now generally available, enabling concurrent state operations and user logic for higher throughput with minimal code changes. |
| 2026-10-14 | Azure Databricks | [Transactions support both managed Delta Lake and Apache Iceberg tables](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#transactions-support-both-managed-delta-lake-and-apache-iceberg-tables) | Transactions are now generally available for Unity Catalog managed Delta Lake and Apache Iceberg tables, allowing atomic multi-statement transactions with BEGIN ATOMIC/COMMIT syntax when catalog commits are enabled. |
| 2026-10-14 | Azure Databricks | [Data Classification API is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/data-classification#data-classification-api-is-now-generally-available) | The Data Classification API and its Terraform resource are now generally available, while auto-tagging configuration remains in public preview. |
| 2026-10-16 | Azure Databricks | [File upload in Genie One and Genie Agents is now generally available](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#file-upload-in-genie-one-and-genie-agents-is-now-generally-available) | File upload in Genie One and Genie Agents is now generally available, allowing file analysis in natural language conversations, except for consumer-only users. |
| 2026-10-16 | Azure Databricks | [READ METADATA privilege support for compliance security profile standards](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#read-metadata-privilege-support-for-compliance-security-profile-standards) | The READ METADATA privilege now supports all compliance security profile standards and is enabled by default for workspaces with the compliance security profile. |
| 2026-10-14 | Azure Databricks | [Workspace-level package repositories for Databricks Apps are generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#workspace-level-package-repositories-for-databricks-apps-are-generally-available) | Workspace admins can now configure default Python and npm package repositories for Databricks Apps, which inherit workspace settings while allowing app-level overrides. |

---

## Snowflake

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-19 | Snowflake | [Oct 19, 2026: Schema variables (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-19-schema-variables-ga) | Schema variables are now generally available in Snowflake. |
| 2026-10-20 | Snowflake | [Oct 20, 2026: Snowflake-provided tags (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-20-snowflake-provided-tags-ga) | Snowflake-provided tags in the SNOWFLAKE.TAGS schema are now generally available, offering a consistent vocabulary for governance use cases like cost center, certification, sensitivity, environment, and project. |
| 2026-10-14 | Snowflake | [October 14, 2026: Centralized event sharing for Snowflake Native Apps — General Availability](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-14-centralized-event-sharing-ga) | Centralized event sharing for Snowflake Native Apps is now generally available, allowing providers to route application telemetry from multiple regions to centralized accounts via event routing tables. |

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-20 | Microsoft Fabric | ⚠️ [Retiring the Fabric data agent custom tool in Microsoft Foundry: move to Fabric IQ](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Retiring-the-Fabric-data-agent-custom-tool-in-Microsoft-Foundry/ba-p/5374418) | The Fabric data agent custom tool integration in Microsoft Foundry is deprecated and will be unsupported after November 6, 2026, requiring migration to the Fabric IQ (OneLake Catalog) tool for connecting Fabric data agents to Foundry agents. |
| 2026-10-15 | BigQuery | [Feature: You can now use reusable column aliases in GoogleSQL.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_15_2026) | Reusable column aliases in GoogleSQL are now generally available (opt-in), allowing aliases defined in SELECT to be referenced within the same SELECT list or WHERE clause, easing migration from other warehouses. |
| 2026-10-14 | BigQuery | [Feature: Conversational analytics now lets you create a conversation with all of the data sources in multiple projects, or create a conversation with a dataset.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_14_2026) | Conversational analytics now supports creating conversations across all data sources in multiple projects or with a single dataset, both generally available. |
| 2026-10-14 | BigQuery | [Feature: The AI.AGG function now supports the output_schema argument, which lets you specify the schema of the function output as a comma-separated list of fields.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_14_2026) | The AI.AGG function now supports an output_schema argument to define the output schema as a comma-separated list of fields, generally available. |

---

## Data × AI
- Azure Databricks retires DeepSeek V4.1 Flash, pushing users to the updated DeepSeek V4.1 Flash (1017) model.  
- The MLflow Logs tab for AI Runtime runs adds search, filter, download, and 60‑day retention, replacing the Artifacts tab.  
- Genie One and Genie Agents gain GA file‑upload support for natural‑language file analysis.  
- Microsoft Fabric deprecates its Foundry data‑agent custom tool for Fabric IQ; BigQuery adds cross‑project conversational analytics and AI.AGG output_schema.

---

## Worth a Look
- Transactions are now GA for managed Delta Lake and Iceberg tables in Unity Catalog, supporting atomic multi‑statement transactions.  
- Data Classification API and its Terraform resource reach GA for programmatic sensitive‑data tagging (auto‑tagging stays in preview).  
- BigQuery adds reusable column aliases in GoogleSQL (opt‑in GA), simplifying query migration.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*