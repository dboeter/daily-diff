# Data Engineering 2026-11-25

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-25) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-25/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-25/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-25/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Projects: 26 | Active today: 6 | Stable releases: 5 | Prereleases skipped: 3 | Spotted: 2 | Generated: 2026-11-25 08:14 UTC

---

## Highlights

- Snowflake Terraform users managing preview `snowflake_table`, `snowflake_tables` data source, or `snowflake_failover_group` resources face breaking changes in provider v2.24.0; a migration guide covers the required updates.
- OpenMetadata users get a major release (2.1.0) adding data quality failure thresholds, dimension-based test grouping, grouped incident management, workflow conditions on data product assets and column changes, service-level tag inheritance, impersonation policy conditions, entity lifecycle stages, domain styling, and glossary settings.
- Snowflake Native App providers can now run Streamlit apps on Snowpark Container Services compute pools instead of virtual warehouses, now generally available.

---

## Action required

| Date | Item | Platform | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | Azure Databricks | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2026-12-11 | [GPT-5 and GPT-5 mini will be retired on December 11, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-and-gpt-5-mini-will-be-retired-on-december-11-2026) | Azure Databricks | Recommended: migrate GPT-5 to OpenAI GPT-6.1 Sol and GPT-5 mini to OpenAI GPT-6.1 Terra by December 11, 2026, when both models are retired. |
| 2026-12-11 | [GPT-5 nano will be retired on December 11, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-nano-will-be-retired-on-december-11-2026) | Azure Databricks | Migrate to GPT-6 Luna (the recommended replacement) before December 11, 2026: GPT-5 nano is retired on that date and API calls to it are not redirected afterward. |
| 2027-01-15 | [Upcoming breaking change: array_contains with a constant empty array will return NULL for a NULL value](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-breaking-change-array_contains-with-a-constant-empty-array-will-return-null-for-a-null-value) | Azure Databricks | Use `size(arr) > 0 AND array_contains(arr, value)` to keep prior results: starting on or after January 15, 2027, with ANSI mode enabled in Databricks Runtime 19 and above, `array_contains(arr, value)` returns NULL instead of false when arr is a constant empty array and value is NULL. `map_contains_key(map, key)` with a constant empty map changes the same way, so `NOT array_contains(arr, value)` no longer matches rows where value is NULL. |
| 2027-01-31 | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | BigQuery | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Azure Databricks | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | Azure Databricks | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-24 | [Genie Migrate conversion to Lakeflow pipelines is generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-migrate-conversion-to-lakeflow-pipelines-is-generally-available) | Enables T-SQL script migration from SQL Server and Synapse to Lakeflow pipelines via the `Spark Declarative Pipelines` target framework, requiring a workspace admin to enable `Migration Projects Experimental Features` in the Previews page. |
| 2026-11-24 | [New configuration options for classic instance pools](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#new-configuration-options-for-classic-instance-pools) | Adds spot instance support with fallback for classic instance pools and allows modifying existing pool availability and maximum spot price settings. |
| 2026-11-24 | [Lakewatch streaming detection rules (Experimental)](https://learn.microsoft.com/azure/databricks/release-notes/lakewatch#lakewatch-streaming-detection-rules-experimental) | Introduces experimental streaming detection rules that evaluate each new row on arrival for low-latency signature and IOC detections with managed compute. |
| 2026-11-24 | [Migrate a Postgres database to Lakebase (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/lakebase#migrate-a-postgres-database-to-lakebase-beta) | Enables one-time PostgreSQL database migration to Lakebase with compatibility assessment and schema/data copy to a chosen branch via the Lakebase App or Postgres API and SDKs. |
| 2026-11-23 | [Outbound IP addresses for serverless compute are generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#outbound-ip-addresses-for-serverless-compute-are-generally-available) | Publishes serverless compute outbound IP addresses in `ip-ranges.json` for firewall allowlisting, requiring automated updates as addresses change. |

### Databricks CLI

- **Release:** [v1.28.0](https://github.com/databricks/cli/releases/tag/v1.28.0) adds retries for transient errors in `fs` commands (HTTP 503/500) and fixes a 10-second Ctrl-C delay when stopping `databricks aitools install`, `update`, or `uninstall`. It also improves automatic AI tools installation: no longer prompts in containers, keeps newer skills, waits before retrying failed installs, and makes `aitools uninstall --skills` fail when no skill matches.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-23 | [Support for multiple tag-based row access policies (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-23-multiple-tag-based-row-access-policies) | Allows applying multiple tag-based row access policies to a single table or view, combined with `AND` by default or `OR` when `PERMISSIVE` is specified on the tag. |
| 2026-11-20 | [Container runtime for Streamlit apps in Snowflake Native Apps (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-streamlit-container-runtime-native-apps-ga) | Allows Streamlit apps in Snowflake Native Apps to run as Snowpark Container Services on a consumer-account compute pool instead of a virtual warehouse. |
| 2026-11-20 | [Simplify selective data replacement with DELETING WHERE in SQL and Dynamic Tables with custom incrementalization](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-insert-overwrite-deleting-where) | Enables replacing row groups or data ranges in a single SQL statement using `DELETING WHERE` in DML and Dynamic Tables with custom incrementalization. |
| 2026-11-20 | [Failover group refreshes continue when a stream has an unsupported source object](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-stream-replication-unsupported-source-objects) | Failover group refreshes now succeed even when a stream has an unsupported source object, replicating the problematic stream as unreadable in the secondary account. |
| 2026-11-20 | 🤖 [Semantic View Autopilot import from Horizon Catalog connectors (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-semantic-view-autopilot-connected-bi-import-preview) | Enables Semantic View Autopilot to create semantic views directly from Horizon Catalog connector models without file export or upload. |

### Terraform provider for Snowflake

- **Release:** [v2.24.0](https://github.com/snowflakedb/terraform-provider-snowflake/releases/tag/v2.24.0) reworks the preview `snowflake_table` resource and `snowflake_tables` data source (using fully qualified name as resource ID, replacing several attributes, adding new options) and the preview `snowflake_failover_group` resource (moving replicas to new `snowflake_failover_group_secondary` resource), and adds the preview `snowflake_backup_set` resource and data source; a migration guide covers the breaking changes.

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-24 | 🤖 [The built-in text embedding model embeddinggemma-300m in the AI.EMBED and AI.SIMILARITY functions (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_24_2026) | Makes the `embeddinggemma-300m` text embedding model generally available for use in `AI.EMBED` and `AI.SIMILARITY` functions. |
| 2026-11-24 | [BigQuery Migration Service supports translating Databricks SQL and Apache Spark SQL 3.x and 4.x into GoogleSQL and extracting schema metadata from Databricks in Preview](https://docs.cloud.google.com/bigquery/docs/release-notes#November_24_2026) | Adds preview support for translating Databricks SQL and Apache Spark SQL 3.x and 4.x to `GoogleSQL` and extracting schema metadata from Databricks. |

---

## Open-source stack

### Prefect

- **Release:** [3.9.5](https://github.com/PrefectHQ/prefect/releases/tag/3.9.5) fixes concurrent requests invalidating each other's CSRF tokens and keeps mixed day-and-time `IntervalSchedule` refills aligned with the original series across daylight saving time changes.

### dlt

- **News:** According to dltHub, [dltHub is now pay-as-you-go: $10 per runtime hour](https://dlthub.com/blog/dlthub-pay-as-you-go), with no contract or minimum spend and the option to move to an Annual Commitment once you have the proof.

### Polars

- **Release:** [py-2.2.0](https://github.com/pola-rs/polars/releases/tag/py-2.2.0) adds out-of-core joins and Iceberg table writes and maintenance from SQL.

### OpenMetadata

- **Release:** [2.0.10-release](https://github.com/open-metadata/OpenMetadata/releases/tag/2.0.10-release) fixes connection secrets being stored in plain text by encrypting them, and adds dbt Cloud multi-job ingestion.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage)

---

## Releases this week

| Date | Project | Version | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-20 | [OpenMetadata](https://github.com/open-metadata/OpenMetadata) | [2.1.0-release](https://github.com/open-metadata/OpenMetadata/releases/tag/2.1.0-release) | Adds data quality failure thresholds, dimension-based test grouping, multi-status filtering, enhanced run history with duration and error details, grouped incident management, workflow conditions on data product assets and column changes, service-level tag inheritance, impersonation policy conditions, entity lifecycle stages, domain styling, and glossary settings. |

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-24 | [Evaluating AI Systems in Production on Snowflake](https://medium.com/snowflake/evaluating-ai-systems-in-production-on-snowflake-6fdac4f33988) | Snowflake on Medium | The author presents a four-stage evaluation framework using dbt and Snowflake Cortex to detect silent AI pipeline failures like prompt regression and hallucination, illustrated by a case where a single prompt tweak caused cancellation tickets to be misrouted to billing for weeks unnoticed. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Show HN: Mason – A lightweight Postgres read-replica, built on columnar storage](https://masondata.ai/) | Hacker News | [94 points, 18 comments](https://news.ycombinator.com/item?id=50630294) | Masondata says Mason is a lightweight drop-in replacement for a Postgres read replica, built on columnar storage, and claims it uses the same SQL and gives the same answers while being extremely fast for analytical queries. |
| [Gnomon: Git for Postgres Data](https://gnomon.bitsinfra.com/) | Hacker News | [40 points, 6 comments](https://news.ycombinator.com/item?id=50611613) | The project describes Gnomon as Git for Postgres data built for agents, offering branches, history, merges and undo inside PostgreSQL. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*