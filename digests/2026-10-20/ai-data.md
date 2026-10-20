# Data Engineering Watch 2026-10-20

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-20) · [🤖 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-20/ai-agents) · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-20/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-20/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-20/ai-web) · [⚖️ Policy Watch](https://dboeter.github.io/daily-diff/#2026-10-20/ai-policy) · **🗄️ Data Engineering Watch**

> Generated: 2026-10-20 01:42 UTC | Projects: 17 | Active today: 0 | Stable releases: 0 | Prereleases (not covered): 0

---

## Highlights
- Microsoft Fabric retires the Foundry data‑agent custom tool, requiring migration to Fabric IQ.  
- Snowflake’s Online Feature Store reaches general availability, enabling low‑latency feature serving for ML workloads.  
- Databricks releases the agentic code converter for general availability, supporting SQL conversion from T‑SQL, Snowflake, Redshift, Oracle, BigQuery and Teradata with validation and Genie Code chat.  
- Databricks makes on‑demand state repartitioning generally available, allowing dynamic resizing of shuffle partitions in Structured Streaming or Lakeflow without losing checkpoint state.

---

## Databricks

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-15 | Azure Databricks | [The agentic code converter is generally available for SQL conversion](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#the-agentic-code-converter-is-generally-available-for-sql-conversion) | The agentic code converter is now generally available for converting SQL from dialects such as T‑SQL, Snowflake, Redshift, Oracle, BigQuery and Teradata into Databricks SQL queries, with validation and error fixing before writing results to a workspace folder. After conversion you can continue chatting with Genie Code about the converted files. |
| 2026-10-13 | Azure Databricks | [On-demand state repartitioning is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#on-demand-state-repartitioning-is-now-generally-available) | On‑demand state repartitioning is now generally available, allowing you to resize the number of shuffle partitions for a stateful Structured Streaming query or Lakeflow pipeline without losing checkpoint state. This provides flexibility to scale streaming workloads while preserving state. |
| 2026-10-13 | Azure Databricks | [AI Runtime will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#ai-runtime-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | AI Runtime is scheduled to become generally available on October 15, 2026 on AWS and Azure for workspaces without the compliance security profile enabled, and will be available by default for eligible workspaces with the compliance profile enabled in mid‑November. This lets you train and fine‑tune models on serverless GPUs without provisioning or managing the underlying infrastructure. |
| 2026-10-14 | Azure Databricks | [Workspace-level package repositories for Databricks Apps will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#workspace-level-package-repositories-for-databricks-apps-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Starting November 13, 2026, workspace‑level package repositories for Databricks Apps will be automatically enabled for workspaces with the compliance security profile enabled, letting admins configure default Python and npm package repositories that apps inherit while still permitting app‑level overrides. This simplifies dependency management for Databricks Apps in compliant environments. |
| 2026-10-15 | Azure Databricks | [Context-based ingress policies for inbound private connectivity are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#context-based-ingress-policies-for-inbound-private-connectivity-are-now-generally-available) | Context‑based ingress policies for inbound Private Link are now generally available, enabling you to control which registered private endpoints can reach your workspace and combine endpoint rules with identity and request type conditions in a single policy. Account admins must turn on Context‑Based Ingress: Workspace Private Access Policies from the account console Previews page to use them. |
| 2026-10-15 | Azure Databricks | [Consumer access to query Unity Gateway services is generally available](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#consumer-access-to-query-unity-gateway-services-is-generally-available) | Consumer access to query Unity Gateway services is now generally available, so users with the consumer access entitlement no longer need an account admin to enable the preview to query model services or use Unity Gateway coding agent features. This can increase model traffic, and admins can set budgets, rate limits or disable direct model access for those users. |

---

## Snowflake

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-20 | Snowflake | [October 20, 2026: Online Feature Store (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-20-online-feature-store-ga) | Online Feature Store is now generally available and is no longer in Preview. Clients can use it for low‑latency feature serving in Snowflake ML workflows. |
| 2026-10-13 | Snowflake | [Oct 13, 2026: Cortex Agent SDK (Public Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-13-cortex-agent-sdk-preview) | The Cortex Agent SDK is now available in Public Preview for Python and TypeScript, allowing you to build applications that run Cortex Agents and Cortex Code, maintain conversations and threads, observe durable turns, and reconnect to long‑running work. This enables developers to create agent‑based solutions on Snowflake. |
| 2026-10-13 | Snowflake | [Oct 13, 2026: Gemini 4 Argon model in AI Functions (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-13-gemini-4-argon-preview) | The gemini‑4‑argon model is now available in Public Preview in Snowflake AI Functions with the AICOMPLETE predicate. This gives you access to a newer Gemini model for AI‑driven SQL functions. |

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-19 | Microsoft Fabric | ⚠️ [Retiring the Fabric data agent custom tool in Microsoft Foundry: move to Fabric IQ](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Retiring-the-Fabric-data-agent-custom-tool-in-Microsoft-Foundry/ba-p/5374418) | Starting November 6, 2026, the earlier Fabric data agent custom‑tool integration in Microsoft Foundry is deprecated and will no longer be supported; Foundry agents that use a Fabric data agent as a custom tool must be migrated before that date. The replacement integration uses the Fabric IQ (OneLake Catalog) tool to make Fabric data agents available to agents and applications. |
| 2026-10-14 | BigQuery | [Feature: Metadata migration from Dataproc Metastore to Lakehouse is now generally available (GA).](https://docs.cloud.google.com/bigquery/docs/release-notes#October_14_2026) | Metadata migration from Dataproc Metastore to Lakehouse is now generally available, permitting a one‑time backfill or dry run to move metadata to an Apache Iceberg REST catalog endpoint or a Hive catalog endpoint via the Google Cloud console, gcloud CLI, or REST API. This simplifies lifting Dataproc Metastore metadata into a lakehouse storage format. |
| 2026-10-14 | BigQuery | [Feature: You can publish a BigQuery Conversational Analytics agent in Gemini Enterprise.](https://docs.cloud.google.com/bigquery/docs/release-notes#October_14_2026) | You can now publish a BigQuery Conversational Analytics agent in Gemini Enterprise, a feature that is generally available. This lets you share conversational analytics capabilities as a managed agent within Gemini Enterprise. |
| 2026-10-13 | BigQuery | [Feature: The AI.AGG function is generally available (GA).](https://docs.cloud.google.com/bigquery/docs/release-notes#October_13_2026) | The AI.AGG function is now generally available in BigQuery, enabling you to semantically aggregate unstructured input data based on natural language instructions. This provides a built‑in way to perform AI‑driven aggregation without custom code. |

---

## Data × AI  
- Databricks’ agentic code converter is now generally available for converting SQL from multiple dialects into Databricks SQL, with validation and chat‑based refinement via Genie Code.  
- Snowflake’s Cortex Agent SDK enters public preview for Python and TypeScript, enabling durable agent applications, and the Gemini 4 Argon model is previewed in AI Functions for AICOMPLETE.  
- BigQuery adds generally available AI.AGG for semantic aggregation and lets users publish Conversational Analytics agents in Gemini Enterprise, while Microsoft Fabric retires its Foundry data‑agent tool in favor of Fabric IQ.

---

## Worth a Look  
- Microsoft Fabric’s retirement of the Foundry data‑agent tool – important for compliance‑focused environments needing to migrate to Fabric IQ.  
- Snowflake’s Online Feature Store GA – core for real‑time ML pipelines, worth understanding the new capabilities and limits.  
- Databricks agentic code converter GA – useful for cross‑platform SQL migration projects; review its validation and Genie Code interaction.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*