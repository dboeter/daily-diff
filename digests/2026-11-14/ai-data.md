# Data Engineering 2026-11-14

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-14) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-14/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-14/ai-models) · **🟨 Data Engineering**

> Vendor items: 12 | Also new: 8 | Projects: 26 | Active today: 2 | Stable releases: 4 | Prereleases (not covered): 2 | Generated: 2026-11-14 06:05 UTC

---

## Highlights
- − Azure Databricks workspaces using Gemini 3.6 Flash must migrate to Gemini 3.8 Flash by 2026-11-19 as the model will be retired and calls automatically redirected.
- Data engineers authoring DAGs in TypeScript, Java, or Go can adopt the first stable Airflow SDKs (1.0.0) released this week; test and migrate to the stable APIs.
- Snowflake Native App providers on AWS and Azure can now package application versions up to 150 GiB (from 5 GB); update packaging to leverage the larger limit.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-19 | Azure Databricks | [Gemini 3.6 Flash will be retired on November 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) | API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide. |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-12 | ⚠️ 🤖 [Gemini 3.6 Flash will be retired on November 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) | API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide. |
| 2026-11-13 | 🤖 [Importing Power BI and Tableau files with Genie Code will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#importing-power-bi-and-tableau-files-with-genie-code-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Import Power BI and Tableau files as AI/BI dashboards and metric views using Genie Code; available by default for compliance security profile workspaces on or after 2026-12-15; until then enable via Previews; requires partner-powered AI features. |
| 2026-11-13 | [OneLake external locations support file events (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#onelake-external-locations-support-file-events-public-preview) | Enable file events on OneLake external locations via Fabric eventstream; Azure Databricks can create the eventstream or you can provide your own. |
| 2026-11-12 | [OAuth on-behalf-of for service principals is generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-on-behalf-of-for-service-principals-is-generally-available) | Use standard U2M OAuth flow to act as a service principal without creating an OAuth secret; requires `Service Principal Manager` role on the service principal; enabled by default. |
| 2026-11-12 | [Flows are securable objects in Unity Catalog (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#flows-are-securable-objects-in-unity-catalog-beta) | Grant `READ FLOW`, `REFRESH FLOW`, `WRITE FLOW`, `APPLY TAG`, `MANAGE` on flows and `CREATE FLOW` on schemas in Unity Catalog; Beta requires contacting Databricks account team. |
| 2026-11-12 | 🤖 [Dashboard enhancements and bug fixes](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-enhancements-and-bug-fixes) | Genie Code custom calculations can reference other custom calculations in the same dataset; viewers can sort pivot tables by row and column; authors can style pivot table headers per row, column, and value field; pivot table values wrap text; authors can resize pivot table divider; authors can turn off associative filtering between dashboard filters; undo and redo supported for dashboard variables; Ask Genie appears only on supported widgets. |
| 2026-11-11 | 🤖 [Pages will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#pages-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | Pages (governed definitions of business concepts) available by default in December 2026 for workspaces with compliance security profile enabled (no compliance standard or HIPAA, PCI-DSS, C5, TISAX, HITRUST); other compliance standards cannot use Pages; Genie One prioritizes Page definitions. |

*Also new:* [AI Function task support in Declarative Automation Bundles (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-function-task-support-in-declarative-automation-bundles-beta) · [Connectors section in Genie Agent settings (Beta)](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#connectors-section-in-genie-agent-settings-beta) · [Databricks SQL version 2026.45 is rolling out in Current](https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202645-is-rolling-out-in-current) · [Artifacts and slides in Genie One (Beta)](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#artifacts-and-slides-in-genie-one-beta) · [Scheduled tasks can email other users in Genie One](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#scheduled-tasks-can-email-other-users-in-genie-one)

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-12 | [Larger application package versions on AWS and Azure](https://docs.snowflake.com/en/release-notes/2026/10_41) | Maximum file size in application package version increased from 5 GB to 150 GiB; maximum application package version stage size increased from 5 GiB to 150 GiB; applies to AWS and Azure accounts including government regions and AWS China. |
| 2026-11-11 | [Select per-user quota users by role (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-role-scope) | Define per-user quota users by roles (in addition to user tags and names); role selects directly granted users, keeping quota scope current as roles are granted or revoked, including identity provider-provisioned roles. |
| 2026-11-11 | [Programmatic notifications for Trust Center findings (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-trust-center-programmatic-notifications-ga) | — |

*Also new:* [Convert Tableau workbooks to Streamlit in Snowflake apps with CoCo (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-tableau-to-streamlit-preview) · [DCM Projects PLAN privilege (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcm-plan-privilege-preview) · [AI_TRANSCRIBE delivers improved transcription accuracy](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-ai-transcribe-accuracy-improvements)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-13 | BigQuery | [BigQuery connections to MySQL, Oracle, and PostgreSQL are now available and can be used to run MySQL federated queries, Oracle federated queries, and PostgreSQL federated queries (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_13_2026) | BigQuery connections to MySQL, Oracle, and PostgreSQL enable MySQL, Oracle, and PostgreSQL federated queries; features are in Preview. |
| 2026-11-13 | Microsoft Fabric | [Use OneLake as native storage for Azure Databricks](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks/ba-p/5377939) | OneLake external-location support for Azure Databricks Unity Catalog generally available in Microsoft Fabric with OneLake Security enabled by default for Azure Databricks Storage items; on Azure Databricks side the feature is in preview; supported Unity Catalog-managed data can be stored directly in OneLake. |

---

## Open-source stack

### Apache Airflow

- **Release:** First stable releases of the TypeScript, Java, and Go SDKs ([ts-sdk/1.0.0](https://github.com/apache/airflow/releases/tag/ts-sdk/1.0.0), [java-sdk/1.0.0](https://github.com/apache/airflow/releases/tag/java-sdk/1.0.0), [go-sdk/v1.0.0](https://github.com/apache/airflow/releases/tag/go-sdk/v1.0.0)) enable native DAG authoring in those languages with task dependencies, task groups, and variable APIs.

### Prefect

- **Release:** Prefect 3.9.3 adds search and ordering to the automations page, aligns flow run timeline ticks to local time boundaries, and fixes bugs in async generator flows, parallel task kwargs handling, and transaction commit ordering.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

## Across platforms

- OneLake integration with Azure Databricks: Microsoft Fabric reports general availability of OneLake as native storage for Azure Databricks Unity Catalog with OneLake Security enabled by default, while Azure Databricks offers file events on OneLake external locations in public preview; the feature covers Unity Catalog‑managed data stored directly in OneLake.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| 🔓 [CVE-2026-6460 – Arbitrary Code Execution in Postgres](https://www.postgresql.org/support/security/CVE-2026-6460/) | Hacker News | [12 points, 9 comments](https://news.ycombinator.com/item?id=50484044) | — |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*