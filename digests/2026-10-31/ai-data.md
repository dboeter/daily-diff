# Data Engineering 2026-10-31

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-31) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-31/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-31/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-31/ai-policy) · **🟨 Data Engineering**

> Vendor items: 14 | Projects: 27 | Active today: 11 | Stable releases: 4 | Prereleases (not covered): 1 | Generated: 2026-10-31 05:21 UTC

---

## Highlights
- − Azure Databricks users of Thinking Machine Labs Inkling and Moonshot AI Kimi K2.7: both models retired 2026-10-30; migrate to GLM 5.3 or Kimi K3 per deprecated models guide.
- Databricks Unity Catalog REST API clients: unpaginated list requests will soon return HTTP 400; adopt `max_results=0` with `next_page_token` or upgrade the Databricks SDK/CLI.
- OpenLineage 1.55.0 users on dbt Core v2: integration breaks with node jobs keyed by `unique_id`, unit tests typed as `UNIT_TEST`, and zero-lineage commands running without wrapper events; test pipelines for these changes.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-30 | ⚠️ 🤖 [Thinking Machine Labs Inkling is retired](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#thinking-machine-labs-inkling-is-retired) | The Thinking Machine Labs Inkling model was retired on October 30, 2026; migrate to GLM 5.3 or Kimi K3 per the deprecated models guide. |
| 2026-10-30 | ⚠️ 🤖 [Moonshot AI Kimi K2.7 is retired](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#moonshot-ai-kimi-k27-is-retired) | The Moonshot AI Kimi K2.7 model was retired on October 30, 2026; migrate to Kimi K3 per the deprecated models guide. |
| 2026-10-28 | ⚠️ [Unpaginated requests to some Unity Catalog REST API operations will soon be rejected](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#unpaginated-requests-to-some-unity-catalog-rest-api-operations-will-soon-be-rejected) | Unpaginated requests to Unity Catalog REST API list operations will return HTTP 400; update clients to use `max_results=0` and `next_page_token` or upgrade the Databricks SDK/CLI. |
| 2026-10-30 | [Azure West US 2, South Central US, and Australia Southeast now have dedicated regional control planes](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#azure-west-us-2-south-central-us-and-australia-southeast-now-have-dedicated-regional-control-planes) | New workspaces in Azure West US 2, South Central US, and Australia Southeast require updated firewall allowlists for new regional control plane endpoints and storage; existing workspaces are unaffected unless migrated. |
| 2026-10-30 | [Microsoft Graph Logs connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#microsoft-graph-logs-connector-is-available-in-beta) | The Microsoft Graph Logs connector in Lakeflow Connect Beta ingests security alerts from Microsoft Defender XDR and Sentinel using OAuth machine-to-machine authentication with incremental ingestion. |
| 2026-10-29 | [Real-time mode in Lakeflow pipelines is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#real-time-mode-in-lakeflow-pipelines-is-now-generally-available) | Real-time mode in Lakeflow pipelines is generally available on classic and serverless compute for operational workloads requiring end-to-end latency as low as five milliseconds. |
| 2026-10-29 | [Native XML file format support is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#native-xml-file-format-support-is-now-generally-available) | Native XML support enables ingesting, querying, and parsing XML files via Auto Loader, `read_files`, `COPY INTO`, and the `from_xml` and `schema_of_xml` SQL functions. |
| 2026-10-29 | 🤖 [Dashboard relationships are now generally available](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-relationships-are-now-generally-available) | Dashboard relationships let you build multi-fact data models scoped to an AI/BI dashboard. |
| 2026-10-29 | [Xero connector is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#xero-connector-is-available-in-beta) | The Xero connector in Lakeflow Connect Beta ingests accounting data such as invoices, payments, and contacts via OAuth user authorization with incremental ingestion and deleted record removal. |

*Also new:* [Multiple real-time flows per serverless pipeline and source stage adaptive repartitioning are in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#multiple-real-time-flows-per-serverless-pipeline-and-source-stage-adaptive-repartitioning-are-in-beta) · [Lakebase snapshots and backup schedule APIs are generally available](https://learn.microsoft.com/azure/databricks/release-notes/lakebase#lakebase-snapshots-and-backup-schedule-apis-are-generally-available) · [Choose a billing workspace for private endpoint charges (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#choose-a-billing-workspace-for-private-endpoint-charges-public-preview) · [Genie Agents enhancements and bug fixes](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#genie-agents-enhancements-and-bug-fixes) · [Relationships between metric views (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#relationships-between-metric-views-beta) · [Managed warehouse for MLflow (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#managed-warehouse-for-mlflow-beta) · [Claude Code auto mode for Anthropic and non-Anthropic models](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#claude-code-auto-mode-for-anthropic-and-non-anthropic-models) · [Track Unity Gateway skill usage with audit logs and the usage dashboard](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#track-unity-gateway-skill-usage-with-audit-logs-and-the-usage-dashboard) · [Simba JDBC Driver (Legacy) 2.8.6 is available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/october#simba-jdbc-driver-legacy-286-is-available)

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-30 | [Tri-Secret Secure for Snowflake storage for Apache Iceberg™ tables (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-30-iceberg-snowflake-storage-tss-ga) | Tri-Secret Secure for Snowflake storage for Iceberg tables is generally available on AWS and Azure, allowing encryption of Snowflake-managed storage volumes with a customer-managed key. |
| 2026-10-29 | [Access externally managed Apache Iceberg™ tables through Snowflake Horizon Catalog (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-29-externally-managed-iceberg-tables-horizon-irc-ga) | Externally managed Apache Iceberg tables can now be queried through Snowflake Horizon Catalog. |
| 2026-10-29 | [Horizon Iceberg REST Catalog telemetry (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-29-horizon-irc-telemetry-ga) | Horizon Iceberg REST Catalog telemetry captures HTTP requests from external query engines into the account event table for monitoring and troubleshooting. |

*Also new:* [UUID data type in hybrid tables (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-30-uuid-hybrid-tables-ga) · [Cortex Training (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-30-cortex-training-preview) · [Deep Research in Snowflake CoWork can research the web](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-30-snowflake-cowork-deep-research-web)

### Snowpark Python

- **News:** Snowpark Python's `DataFrame.to_polars()` is now generally available, letting users convert query results directly into a Polars DataFrame with a single call; the default Parquet transport reads files in parallel to accelerate large data transfers. [Snowpark Python Supports Native to_polars()](https://medium.com/snowflake/snowpark-python-supports-native-to-polars-b84e03721b5d)

**Quiet today:** [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-30 | Azure updates | [[In preview] Public Preview: Support database-level managed identity (including FIC) in Create Database Scoped Credential T-SQL](https://azure.microsoft.com/updates?id=577491) | Database-level managed identity in Azure SQL Database enables using a user-assigned managed identity per database to query Azure Blob Storage and ADLS Gen2 via external tables and `OPENROWSET`. |
| 2026-10-30 | BigQuery | [You can now retrieve query results directly in the Apache Arrow format for faster retrieval speed and improved serialization efficiency (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#October_30_2026) | BigQuery query results can be retrieved directly in Apache Arrow format for faster retrieval and improved serialization efficiency in Preview. |

---

## Open-source stack

### dbt Core
- **News:** Hacker News showcases "Fitness Functions for Dbt Projects," a guided evolution approach for data transformation projects. https://news.ycombinator.com/item?id=50294526
- **News:** Obie Insurance cut month-end close from 25 hours to 2 by rebuilding on dbt and Apache Iceberg. https://www.getdbt.com/blog/obie-insurance-month-end-close-dbt-state-lakehouse
- **News:** Okta uses dbt as the single source of truth for governing context for AI agents at scale. https://www.getdbt.com/blog/okta-ai-agent-context-governance

### Apache Airflow
- **News:** Apache Airflow CI now runs trusted builds on self-hosted runners to relieve pressure on shared GitHub-hosted capacity. https://airflow.apache.org/blog/self-hosted-ci-runners/

### Dagster
- **Release:** [1.13.28](https://github.com/dagster-io/dagster/releases/tag/1.13.28) fixes `UPathIOManager.storage_options` AttributeError with universal-pathlib 0.3.0+, fixes dbt hook crashes when using `select`/`exclude`, fixes `ModuleNotFoundError` for `dateutil` when importing `dagster-dbt` without `dbt-core`, adds protobuf 7 support, UI selection input improvements, background tab polling reductions, and Databricks `run_job()` preview.
- **News:** Sigma runs a 2,883-model semantic layer on dbt and Dagster, managing it as version-controlled code. https://www.getdbt.com/blog/sigma-dbt-dagster-semantic-layer

### Prefect
- **Release:** [3.9.1](https://github.com/PrefectHQ/prefect/releases/tag/3.9.1) fixes state persistence errors failing successful flows, fixes retry logic for flows returning failed states, fixes forked child processes exiting with code 1 from QueueService drain, fixes `GitRepository.pull_code()` re-cloning shallow clones, adds custom state discovery and filters, Run action in React flows list, task run duration sorting, `get_timezones()` caching, and shared orchestration clients.

### Apache Iceberg
- **News:** Obie Insurance rebuilt on dbt and Apache Iceberg, cutting month-end close from 25 hours to 2. https://www.getdbt.com/blog/obie-insurance-month-end-close-dbt-state-lakehouse
- **News:** Apache Iceberg on Snowflake simplified in 2026 with dbt's new catalog config enabling small-team setup in an afternoon. https://www.getdbt.com/blog/apache-iceberg-snowflake-dbt-catalog-configuration
- **News:** Snowflake introduces AI Functions in dynamic Iceberg tables to pay model costs only for changed rows during backfills. https://medium.com/snowflake/the-missing-ai-layer-in-your-iceberg-lakehouse-19a4b4bf8a94

### DuckDB
- **News:** Data engineer Matt Martin details moving from spreadsheets to DuckLake, handling analytical tasks without operational complexity. https://duckdb.org/2026/10/29/from-spreadsheets-to-ducklake.html
- **News:** DuckDB 2.0.0 gems highlighted including performance and usability improvements. https://duckdb.org/2026/10/26/gems-of-duckdb-200.html
- **News:** dbt v2 ships built-in DuckDB adapter for local, offline warehouse-free transformation. https://www.getdbt.com/blog/dbt-duckdb-warehouse-free-data-transformation

### Polars
- **News:** Polars 2.1 releases out-of-core group-bys, recursive SQL, attached Iceberg catalogs, encrypted Parquet, and ~90 performance improvements. https://pola.rs/posts/polars-2-1-changelog/
- **News:** Snowpark Python adds native `to_polars()` with parallel Parquet transport for accelerated large data transfers. https://medium.com/snowflake/snowpark-python-supports-native-to-polars-b84e03721b5d

### OpenLineage
- **Release:** [1.55.0](https://github.com/OpenLineage/OpenLineage/releases/tag/1.55.0) breaks dbt Core v2 integration: node jobs now named by `unique_id`, unit tests get `UNIT_TEST` job type and no datasets, commands with no lineage run without wrapper events; adds Go OAuth 2.0 client credentials auth, experimental OData catalog integration, Dataproc Metastore properties in Hive catalog facets, and default database parameter in SQL parser APIs.

### OpenMetadata
- **News:** October 2026 community news covers data lineage, data contracts, and metadata layer behind NL-to-SQL assistants, plus three v2.1 previews. https://blog.open-metadata.org/october-2026-openmetadata-community-news-3010803f5f73
- **News:** September 2026 community news highlights contributor blogs, four Ask the Experts videos, and training meetups in Brazil and Belgium. https://blog.open-metadata.org/september-2026-openmetadata-community-news-47623585d3a1

### SQLFluff
- **Release:** [4.5.0](https://github.com/sqlfluff/sqlfluff/releases/tag/4.5.0) speeds linting by removing quadratic work in layout rules and `LT09`, improves parse error diagnostics with unexpected token and expected grammar, adds `LT05` `list_wrapping = fill` and `indented_using_on_newline` options, expands Databricks/SparkSQL support for SQL scripting, Unity Catalog, `GEOGRAPHY`/`GEOMETRY` types, and enhances Jinja templater for dbt materialization blocks and `fromjson`/`tojson` helpers.

**Quiet today:** [SQLMesh](https://github.com/SQLMesh/sqlmesh), [dlt](https://github.com/dlt-hub/dlt), [PyIceberg](https://github.com/apache/iceberg-python), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core)

---

## Releases this week

| Project | Version | Date | Summary |
| :--- | :--- | :--- | :--- |
| [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake) | [v2.22.1](https://github.com/snowflakedb/terraform-provider-snowflake/releases/tag/v2.22.1) | 2026-10-29 | The Terraform provider for Snowflake v2.22.1 rebuilds with Go 1.26.10 to fix certificate verification rejecting intermediates in CVE-2026-111943 with no configuration changes. |
| [Soda Core](https://github.com/sodadata/soda-core) | [v4.29.0](https://github.com/sodadata/soda-core/releases/tag/v4.29.0) | 2026-10-27 | Soda Core v4.29.0 fixes YAML parsing errors and logging, adds a data product file type and public `execute_command`/`execute_query` for Soda Cloud, limits Postgres discovery to readable objects, and names filters and grants when discover finds nothing. |
| [OpenMetadata](https://github.com/open-metadata/OpenMetadata) | [2.0.7-release](https://github.com/open-metadata/OpenMetadata/releases/tag/2.0.7-release) | 2026-10-27 | OpenMetadata 2.0.7 fixes Pub/Sub impersonation, MS SQL catalog timeouts, Unity Catalog cross-database lineage, Hex lineage source attribution, dbt Cloud test result ingestion, Power BI page ingestion, Tableau backfill safety, and BigQuery lineage SQL parsing, plus security updates. |
| [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks) | [v1.140.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.140.0) | 2026-10-26 | The Terraform provider for Databricks v1.140.0 updates the Go toolchain to 1.26.10 for updated certificates with no user-facing changes. |
| [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks) | [v1.139.1](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.139.1) | 2026-10-24 | The Terraform provider for Databricks v1.139.1 updates the Go toolchain to 1.26.10 for updated certificates with no user-facing changes. |

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-10-29 | [The Agent Is Now a Pipeline Step: Keeping CoCo Automations and Cloud Agents Reproducible](https://medium.com/snowflake/the-agent-is-now-a-pipeline-step-keeping-coco-automations-and-cloud-agents-reproducible-e29cfabde47b) | Snowflake on Medium | The author learned that scheduled agents must be treated as versioned, reviewed pipeline steps after a 3 a.m. agent run reported success but produced incorrect results without failing. |
| 2026-10-27 | [What a year of building ADBC drivers taught Columnar about zero-copy's non-zero problems](https://www.getdbt.com/blog/columnar-adbc-drivers-zero-copy-lessons) | dbt Labs blog | Matt Topol shares type-system challenges encountered building production ADBC drivers now used by dbt v2. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [PostgreSQL 19 Running Behind Schedule Due to AI/LLM Burden](https://www.phoronix.com/news/PostgreSQL-19-Late) | Hacker News | [11 points, 0 comments](https://news.ycombinator.com/item?id=50309439) | PostgreSQL 19's release is delayed until at least November due to the burden of AI/LLM-related features. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*