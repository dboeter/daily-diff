# Data Engineering 2026-11-01

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-01) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-01/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-01/ai-models) · **🟨 Data Engineering**

> Vendor items: 3 | Projects: 27 | Active today: 1 | Stable releases: 0 | Prereleases (not covered): 0 | Generated: 2026-11-01 05:49 UTC

---

## Highlights
- All vendor release notes today are minor fixes and previews; no deprecations or breaking changes.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-29 | [Dashboard bug fixes](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-bug-fixes) | Single-field filter field changes now clear the previous default value and fall back to All or None; widget-level filter values refresh automatically when datasets change; custom themes no longer apply to the View queries dialog, widget context menus, or data reference popovers; funnel chart fields persist when switching chart types; tabbed editor popovers retain their initial height instead of expanding. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-30 | [CREATE OR ALTER SECRET, DCM Projects DEFINE SECRET, and environment variables (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-30-dcm-define-secret-env-vars-preview) | DEFINE SECRET in DCM Projects definition files enables declarative secrets management, and environment variables and secrets declared in the DCM project manifest keep values out of definition files, repositories, and deployment artifacts. |

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-29 | [Using Allow workspace settings editing policy in Fabric (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Using-Allow-workspace-settings-editing-policy-in-Fabric-Preview/ba-p/5377845) | The Allow workspace settings editing policy enables delegating workspace administration to development teams while retaining centralized control over encryption and networking settings. |

---

## Open-source stack

### dbt Core
- **News:** [How to put generative AI directly into a dbt pipeline with plain SQL](https://www.getdbt.com/blog/bigquery-generative-ai-dbt-sql-functions) shows how to call BigQuery's AI SQL functions from dbt models for tasks like sentiment scoring and LLM-generated product briefings.
- **News:** [Charts worth stealing: the design calls BI should ship](https://www.getdbt.com/blog/bi-dashboard-chart-design-inspiration) details the design defaults behind dbt Charts, from consistent color palettes to the small choices that make dashboards readable.
- **News:** [dbt Charts: a new open-source language for dashboards that live inside your dbt repo](https://www.getdbt.com/blog/dbt-charts-open-source-dashboard-yaml) introduces a plain YAML spec for version-controlled dashboards that deploy alongside dbt models.

**Quiet today:** [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata), [SQLFluff](https://github.com/sqlfluff/sqlfluff)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Postgres 19 is late, and it's AI's fault](http://rhaas.blogspot.com/2026/10/postgres-19-is-late-and-its-ais-fault.html) | Hacker News | [6 points, 1 comment](https://news.ycombinator.com/item?id=50312408) | PostgreSQL 19's release has slipped past its historically predictable mid-September window, with the delay attributed to AI-related development work. |
| [Jepsen: ParticleDB 1.1.4](https://jepsen.io/analyses/particledb-1.1.4) | Lobste.rs | [83 points, 18 comments](https://lobste.rs/s/drwd4j/jepsen_particledb_1_1_4) | — |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*