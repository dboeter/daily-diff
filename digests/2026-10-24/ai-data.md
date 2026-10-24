# Data Engineering 2026-10-24

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-24) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-24/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-24/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-24/ai-policy) · **🟨 Data Engineering**

> Generated: 2026-10-24 01:29 UTC | Vendor items: 11 | Projects: 17 | Active today: 1 | Stable releases: 0 | Prereleases (not covered): 0

---

## Highlights
- Azure Databricks workspaces with Unity Catalog volumes: Files API 3.0 (Beta) enables multipart uploads over 5 GB and conditional operations; test large-file and versioned workflows.
- Azure Databricks workspaces using serverless compute: Serverless job environments from pyproject.toml (Beta) requires enabling Project‑Scoped Shared Compute on the Previews page; configure job environments via pyproject.toml in Jobs UI, API, or bundles.
- Azure Databricks workspaces using Asset Bundles: Shared Serverless for Asset Bundles (Beta) requires enabling Project‑Scoped Shared Compute; notebooks and files in the same bundle can share serverless compute and a bundle‑root pyproject.toml environment.
- Snowflake on GCP clients using Snowpark Container Services: GEN_ARM_G1 and GEN_X64_G1 instance families (1–28 vCPU) are now GA; migrate workloads to the new general‑purpose instances.
- Snowflake clients running ML Jobs on Container Runtime: Custom runtime images (GA) let you build, validate, and register custom container images as Custom Runtime Environments; register images for production ML workloads.

---

## Databricks

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-23 | Azure Databricks | [Files API 3.0 for Unity Catalog volumes is now in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#files-api-30-for-unity-catalog-volumes-is-now-in-beta) | Enables multipart uploads for files larger than 5 GB to Unity Catalog volumes and conditional operations (upload, download, delete based on version) to prevent unintended changes. |
| 2026-10-23 | Azure Databricks | [Google Analytics Aggregated connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#google-analytics-aggregated-connector-is-available-in-beta) | Enables ingesting aggregated Google Analytics 4 report data into Azure Databricks via Lakeflow Connect with incremental ingestion and service account or OAuth U2M authentication; workspace admins control access via the Previews page. |
| 2026-10-22 | Azure Databricks | [Serverless job environments from pyproject.toml (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#serverless-job-environments-from-pyprojecttoml-beta) | Allows serverless notebook and Python script tasks to configure job environments via pyproject.toml in the Jobs UI, API, or bundles; requires enabling Project‑Scoped Shared Compute on the Previews page. |
| 2026-10-22 | Azure Databricks | [Shared Serverless for Asset Bundles (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#shared-serverless-for-asset-bundles-beta) | Allows notebooks and files in the same asset bundle to share serverless compute and a bundle‑root pyproject.toml environment; requires enabling Project‑Scoped Shared Compute on the Previews page. |
| 2026-10-22 | Azure Databricks | 🤖 [Genie One enhancements](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#genie-one-enhancements) | Adds conversation outline for navigation, skill uploads, extraction of snippets from external tool queries (e.g., dbt), and remembered sign‑in email in the Genie mobile app. |
| 2026-10-22 | Azure Databricks | 🤖 [Dashboard enhancements](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-enhancements) | Adds private bookmarks for dashboard viewers, bulk import of up to 100 Power BI or Tableau files as AI/BI dashboards, field picker tooltips, layered combo charts, custom waterfall totals, and improved Sankey labels. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-23 | Snowflake | [October 23, 2026: Snowpark Container Services GEN_ARM_G1 and GEN_X64_G1 instances on Google Cloud (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-23-spcs-gcp-gen-instances-ga) | Makes GEN_ARM_G1 and GEN_X64_G1 instance families generally available for Snowpark Container Services on Google Cloud, offering general‑purpose compute from 1 to 28 vCPU. |
| 2026-10-22 | Snowflake | 🤖 [October 22, 2026: Custom runtime images for ML Jobs (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-22-custom-runtime-images-ml-jobs-ga) | Allows building, validating, and registering custom container images as Custom Runtime Environments for ML Jobs on Container Runtime, referenced via runtimeenvironment="cre@ ". |
| 2026-10-22 | Snowflake | 🤖 [Oct 22, 2026: Skill and plugin sharing in CoCo (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-22-skill-plugin-sharing-ga) | Makes skill and plugin sharing in CoCo generally available. |
| 2026-10-23 | Snowflake | 🤖 [Oct 23, 2026: Retrieve Cortex Search (Public Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-23-cortex-search-retrieve-preview) | Introduces the CORTEXSEARCHRETRIEVE table function for low‑latency Cortex Search queries from SQL, supporting single queries or per‑row LATERAL joins. |
| 2026-10-23 | Snowflake | 🤖 [Oct 23, 2026: Responses API for the Cortex REST API (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-23-cortex-rest-api-responses-api) | Adds an OpenAI‑compatible Responses API endpoint on the Cortex REST API and Cortex AI Gateway to call OpenAI models via the OpenAI SDK or other clients. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Open-source stack

### Apache Airflow
- **Hot issue**: Task state store writes from `on_retry_callback` fail with a 404 error because the execution API cannot find the task instance; the issue is closed but highlights a callback timing problem in Airflow 3.3.2. [apache/airflow#75406](https://github.com/apache/airflow/issues/75406)

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino)

---

## Across platforms

- AI-assisted data interaction: Databricks Genie One and Dashboard enhancements (Beta) add conversation outlines, skill uploads, and bulk BI import for consumers; Snowflake Retrieve Cortex Search (Preview) and Cortex REST API Responses API (Preview) expose a SQL table function and an OpenAI‑compatible endpoint for developers.
- Managed compute for custom workloads: Databricks Serverless job environments and Shared Serverless (Beta, Azure) let notebooks share pyproject.toml‑defined Python environments; Snowflake Snowpark Container Services GEN instances on GCP (GA) provide 1–28 vCPU container compute for general‑purpose workloads.
- Environment-as-code for ML and data tasks: Databricks pyproject.toml for serverless environments (Beta) uses Python packaging standards; Snowflake Custom runtime images for ML Jobs (GA) uses container images. Both GA/Beta, Databricks on Azure serverless, Snowflake on Container Runtime.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Remove pgrust: the entry is cheating (per-query kernels and result caching)](https://github.com/ClickHouse/ClickBench/pull/2165) | Hacker News | [182 points, 142 comments](https://news.ycombinator.com/item?id=50205816) | This removes the pgrust entry (added in #1163, updated to v0.4-preview in #2106) from the benchmark. The results it reports are produced by machinery written specifically for the 43 ClickBench quer... |
| [The Hibernate Origin Story (Outsider Edition)](https://fishbowl.pastiche.org/2026/10/23/hibernate-origin-story) | Lobste.rs | [10 points, 3 comments](https://lobste.rs/s/ydmw6s/hibernate_origin_story_outsider_edition) | I had nothing to do with the development of Hibernate, except that I happened to be in the room at the time holding a beer. But it is still a fun story. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*