# Data Engineering Watch 2026-10-22

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-22) · [🤖 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-22/ai-agents) · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-22/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-22/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-22/ai-web) · [⚖️ Policy Watch](https://dboeter.github.io/daily-diff/#2026-10-22/ai-policy) · **🗄️ Data Engineering Watch**

> Generated: 2026-10-22 01:26 UTC | Vendor items: 12 | Projects: 17 | Active today: 3 | Stable releases: 2 | Prereleases (not covered): 0

---

## Highlights
- DuckDB v2.0.0 "Cyanoptera" introduces a major internal overhaul converting identifiers to a dedicated class and adopting tidy-check tooling.
- Polars `read_csv` exhibits a 120× memory overhead on wide tables in the v2 series, a severe performance regression under triage.
- Snowflake Declarative Feature Store reaches general availability with version-controlled YAML or Python definitions and plan-and-apply deployment.
- Azure Databricks enables native Postgres logical replication to stream changes into and out of Lakebase for migrations and continuous sync.
- Azure Databricks adds OAuth custom identity claims to service principal tokens for row-level filtering in multi-tenant scenarios.

---

## Databricks

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-16 | Azure Databricks | [File upload in Genie One and Genie Agents will soon be available by default for compliance security profile workspaces with supported compliance standards](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#file-upload-in-genie-one-and-genie-agents-will-soon-be-available-by-default-for-compliance-security-profile-workspaces-with-supported-compliance-standards) | Starting November 15, 2026, file upload in Genie One and Genie Agents becomes available by default for compliance security profile workspaces where the compliance standard supports it, enabling natural language analysis of uploaded files alongside existing data. |
| 2026-10-15 | Azure Databricks | [Replicate data in and out of Lakebase with Postgres logical replication](https://learn.microsoft.com/azure/databricks/release-notes/lakebase#replicate-data-in-and-out-of-lakebase-with-postgres-logical-replication) | Native Postgres logical replication now supports streaming changes into and out of Lakebase, allowing migration of existing Postgres databases and continuous sync with external Postgres instances. |
| 2026-10-19 | Azure Databricks | [Saving an unchanged job no longer adds rows to the jobs system tables](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#saving-an-unchanged-job-no-longer-adds-rows-to-the-jobs-system-tables) | Saving a job without changes no longer writes rows to system.lakeflow.jobs or system.lakeflow.job_tasks, and change_time remains at the last actual modification, reducing audit noise across UI, API, and bundle deployments. |
| 2026-10-19 | Azure Databricks | [Filter data per end user with OAuth custom identity claims](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#filter-data-per-end-user-with-oauth-custom-identity-claims) | Custom identity claims can now be added to service principal OAuth tokens and used for row-level filtering in dynamic views or ABAC policies, enabling multi-tenant data access through a single service principal. |
| 2026-10-16 | Azure Databricks | [Delegate budget access with access control lists (ACLs)](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#delegate-budget-access-with-access-control-lists-acls) | Budgets now support access control lists (ACLs), allowing account and workspace admins to delegate Budget Manager or Budget Viewer roles to users, groups, or service principals for granular cost governance. |
| 2026-10-16 | Azure Databricks | [Delegate access to Genie budgets](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#delegate-access-to-genie-budgets) | Genie cost budgets now support ACLs, letting admins assign Budget Manager or Budget Viewer roles to specific principals for delegated management of Genie spending limits. |

### Overview
MLflow shipped a patch release that adds lineage tracking for generative AI evaluation runs and fixes two tracking-related bugs affecting Optuna integration. The update improves reproducibility for hyperparameter tuning workloads and ensures dataset, scorer, and agent metadata are recorded during `mlflow.genai.evaluate` calls. No other Databricks-maintained projects reported releases, hot issues, or notable news in the last 24 hours.

### MLflow
- **Release**: v3.17.2 adds lineage recording for dataset, scorer, and agent metadata on `mlflow.genai.evaluate` runs, and fixes two tracking issues: reseeding sampler and forwarding batch settings on `MlflowSparkStudy` executors, plus preventing `MlflowStorage` from marking Optuna trials finished prematurely. [v3.17.2](https://github.com/mlflow/mlflow/releases/tag/v3.17.2)

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks)

---

## Snowflake

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-21 | Snowflake | [October 21, 2026: Declarative Feature Store (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-21-declarative-feature-store-ga) | Declarative Feature Store is generally available, enabling version-controlled YAML or Python definitions of feature store resources with plan-and-apply deployment via the snow feature CLI. |
| 2026-10-16 | Snowflake | [Oct 16, 2026: Parquet Direct (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-16-parquet-direct-preview) | Parquet Direct preview allows creating read-only Apache Iceberg tables from Parquet files in cloud object storage, querying data in place without copying or rewriting. |
| 2026-10-20 | Snowflake | [Oct 20, 2026: Sensitive Data Entitlement and Access reports (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-20-sensitive-data-entitlement-access-reports-ga) | Sensitive Data Entitlement and Access reports in Trust Center are generally available for Enterprise Edition and higher, providing visibility into sensitive data access and entitlements. |

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-21 | BigQuery | [Feature: The AI.CHUNK_DOCUMENT function is a table-valued function that splits unstructured documents into semantically coherent text chunks optimized for vector embeddings and Retrieval-Augmented Gen…](https://docs.cloud.google.com/bigquery/docs/release-notes#October_21_2026) | BigQuery's AI.CHUNK_DOCUMENT function is generally available, splitting unstructured documents into semantically coherent chunks optimized for vector embeddings and RAG workflows. |
| 2026-10-20 | Microsoft Fabric | [New analytical functions in Microsoft Fabric Data Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/New-analytical-functions-in-Microsoft-Fabric-Data-Warehouse/ba-p/5375432) | Microsoft Fabric Data Warehouse preview adds MEDIAN, QUANTILE, APPROX_MEDIAN, APPROX_QUANTILE, and aggregate syntax for PERCENTILE_CONT/DISC, enabling efficient distribution analytics in T-SQL. |
| 2026-10-21 | Azure updates | [[Launched] Generally Available: Azure Cosmos DB Safe Key Rotation](https://azure.microsoft.com/updates?id=576716) | Azure Cosmos DB Safe Key Rotation is generally available, providing last-used timestamps for account keys to safely identify active keys before rotating or retiring credentials. |

---

## Open-source stack

### Overview
DuckDB released version 2.0.0 "Cyanoptera", a major milestone that refactors internal identifiers and adopts tidy-check tooling. Polars users are reporting a severe memory regression in `read_csv` on wide tables, with the function consuming 120× more data memory than expected in the v2 series.

### DuckDB
- **Release**: DuckDB v2.0.0 "Cyanoptera" introduces a major internal overhaul, converting `Identifier` from strings to a dedicated class and migrating to tidy-check for development workflows. The release marks a significant architectural step for the engine. https://github.com/duckdb/duckdb/releases/tag/v2.0.0

### Polars
- **Hot issue**: `read_csv` exhibits a 120× memory overhead on wide tables in Polars v2, flagged as a performance regression with medium priority. The issue is accepted and under triage, affecting Python users processing broad datasets. https://github.com/pola-rs/polars/issues/30114

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [Trino](https://github.com/trinodb/trino)

---

## Data × AI
- Azure Databricks will enable file upload in Genie One and Genie Agents by default for compliance security profile workspaces, allowing natural language analysis of uploaded files.
- Azure Databricks adds ACL-based delegation for Genie budgets so admins can assign Budget Manager or Budget Viewer roles to specific principals.
- BigQuery releases AI.CHUNK_DOCUMENT as a generally available table-valued function that splits documents into chunks optimized for vector embeddings and RAG workflows.

---

## Worth a Look
- [Saving an unchanged job no longer adds rows to the jobs system tables](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#saving-an-unchanged-job-no-longer-adds-rows-to-the-jobs-system-tables) — Saving a job without changes no longer writes to system tables, reducing audit noise across UI, API, and bundle deployments.
- [New analytical functions in Microsoft Fabric Data Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/New-analytical-functions-in-Microsoft-Fabric-Data-Warehouse/ba-p/5375432) — Preview adds MEDIAN, QUANTILE, APPROX_MEDIAN, APPROX_QUANTILE, and PERCENTILE_CONT/DISC aggregate syntax for efficient distribution analytics.
- [Generally Available: Azure Cosmos DB Safe Key Rotation](https://azure.microsoft.com/updates?id=576716) — Provides last-used timestamps for account keys to safely identify active keys before rotating or retiring credentials.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*