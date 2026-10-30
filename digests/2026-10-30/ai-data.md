# Data Engineering 2026-10-30

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-30) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-30/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-30/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-30/ai-policy) · **🟨 Data Engineering**

> Vendor items: 10 | Projects: 17 | Active today: 7 | Stable releases: 4 | Prereleases (not covered): 0 | Generated: 2026-10-30 05:34 UTC

---

## Highlights
- dbt-databricks v1.13.0 introduces a breaking change for view models: views now use a single materialization regardless of `use_materialization_v2`; with the flag off, `view_update_via_alter` alters Unity Catalog views in place and fails on Hive metastore views. Databricks teams using dbt with view models must test and adjust materialization logic.
- dlt 1.32.0 introduces breaking changes: naive SCD2 timestamps are no longer read as UTC, `refresh="drop_resources"` and `pipeline.drop()` now drop all tables belonging to resources, and Jira and Salesforce verified sources are rewritten. dlt users across platforms must test pipelines and update source configurations.
- Databricks CLI v1.23.0 reverts bundle file uploads to the legacy endpoint, fixing notebook uploads, and immutable-folder deploys now refuse deployment onto externally modified snapshots (use `--force` for fresh snapshot). Databricks bundle users should validate deployment workflows.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-28 | [View personal and shared spend limits with the ug CLI](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#view-personal-and-shared-spend-limits-with-the-ug-cli) | The `ug` CLI now displays up to five personal and shared spend limits ordered by highest percentage used; run `ug usage --all` to see all applicable limits. |

### Delta Lake
- **News:** [MiniLake](https://news.ycombinator.com/item?id=50259697) is a local Databricks API emulator that runs real SQL, real Delta Lake, and real Spark jobs, letting developers point the Databricks SDK, Terraform, or an LLM agent at localhost for local development and testing.

### Databricks CLI
- **Release:** [v1.23.0](https://github.com/databricks/cli/releases/tag/v1.23.0) reverts bundle file uploads to the legacy `/workspace-files/import-file` endpoint, fixing notebooks being uploaded as plain files and deployments failing (e.g., SQL notebooks); immutable-folder deploys now refuse to deploy onto a snapshot modified outside the bundle, with `bundle deploy --force` moving to a fresh snapshot.
- **Release:** Adds `lifecycle.depends_on` to order resources without referencing their fields, `bundle deploy --select` for resource deletion selection, and a `workspace.sync_mode` setting (`overwrite`, `in-place`, `immutable`); `databricks ssh connect` now makes `claude` and `codex` available on dedicated clusters, serverless IDE sessions, and non-interactive commands.
- **Release:** Fixes `bundle validate` failing with "expected a map to index" when a job `schedule`, `trigger`, or `continuous` references a whole block; adds GPU_1xRTX6000 accelerator workload support and shows only workspace-available accelerator types in `databricks air run -h config.compute`.

### dbt-databricks
- **Release:** [v1.13.0](https://github.com/databricks/dbt-databricks/releases/tag/v1.13.0) **BREAKING for some view models:** views now use one materialization regardless of `use_materialization_v2`; with the flag off, `view_update_via_alter` alters Unity Catalog views in place and fails on Hive metastore views, grants apply after tags, and view replacement calls `get_create_view_as_sql` overrides.
- **Release:** Merges `tblproperties` additively across config hierarchy levels instead of replacing parent values; adds opt-in invocation telemetry via `connection_parameters.enable_dbt_telemetry` reporting aggregate POST_PARSE model configuration and POST_RUN outcomes.
- **Release:** Replaces views with `CREATE OR REPLACE VIEW` when `use_safer_relation_operations` is on (including views inheriting `file_format: parquet`), so upstream column drops or renames no longer fail with `UNRESOLVED_COLUMN`; lets Predictive Optimization manage models with `auto_liquid_cluster` instead of running synchronous `OPTIMIZE` after materialization.

**Quiet today:** [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow)

---

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-30 | [External OAuth for Snowflake Postgres (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-30-snowflake-postgres-external-oauth-ga) | External OAuth for Snowflake Postgres lets you authenticate connections using access tokens from an external identity provider. |
| 2026-10-30 | [Hybrid table support for Google Cloud (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-30-hybrid-tables-gcp-preview) | Hybrid tables are now supported in all Google Cloud commercial regions in Preview, while remaining generally available on AWS and Azure. |
| 2026-10-29 | [Snowflake Data Clean Rooms updates](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-29-dcr) | Snowflake Data Clean Rooms receives API version 19.1 with general performance improvements, bug fixes, and updates to private preview features. |
| 2026-10-28 | 🤖 [AI_PARSE_DOCUMENT introduces AGENTIC mode for intelligent document processing (Public Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-28-ai-parse-document-agentic-mode-preview) | `AI_PARSE_DOCUMENT` adds an `AGENTIC` mode that extracts actionable information from complex documents including charts and diagrams, not just text. |
| 2026-10-27 | [Carry over comments, tags, and privileges with COPY = ( ... )](https://docs.snowflake.com/en/release-notes/2026/other/2026-10-27-copy-metadata-carry-over) | The `COPY` parameter on `CREATE OR REPLACE` statements carries over comments, tags, and privileges from the replaced object so they need not be restated. |

### Snowpark Python
- **Release:** [v1.56.0](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.56.0) adds `DataFrameReader.documents()` (private preview) for reading staged documents into DataFrames with schema-based extraction and parallel processing. Eager schema validation now raises invalid column references in `filter` and `sort` at DataFrame creation. Two bugs are fixed: missing dataframe trace info in errors when debuggability is enabled, and `Session.client_telemetry` failing to obtain a workload-identity auth token on the v5 connector.

**Quiet today:** [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris)

---

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-10-29 | [Strengthening data security with workspace-level private connectivity for custom endpoints for Eventstream (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Strengthening-data-security-with-workspace-level-private/ba-p/5377347) | Eventstream adds workspace-level private links for custom endpoint sources (Preview), letting applications in restricted networks send events to Fabric without a public internet path. |
| 2026-10-29 | [Manage once, reuse everywhere: Introducing variable library support for Eventstream (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Manage-once-reuse-everywhere-Introducing-variable-library/ba-p/5377349) | Variable library integration for Eventstream (Preview) lets teams reuse a single eventstream definition across environments by referencing environment-specific resources that resolve at runtime and persist through Git and deployment pipelines. |
| 2026-10-29 | 🤖 [Introducing the data engineering agent for Fabric (Project Osmos)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Introducing-the-data-engineering-agent-for-Fabric-Project-Osmos/ba-p/5377944) | Project Osmos introduces a data engineering agent that generates Spark code from natural language and addresses validation, schema drift, and incremental-load correctness concerns. |
| 2026-10-29 | 🤖 [Bringing Rust-native Spark compatibility to Microsoft OneLake with Sail and LakeSail](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Bringing-Rust-native-Spark-compatibility-to-Microsoft-OneLake/ba-p/5377595) | Sail, a Rust-native drop-in replacement for Apache Spark with built-in Delta Lake and Apache Iceberg support, connects natively to OneLake alongside LakeSail Cloud Sessions for managed execution. |

---

## Open-source stack

### Apache Airflow
- **Hot issue:** [#75865](https://github.com/apache/airflow/issues/75865): An issue tracks the testing status of Apache Airflow 3.4.0rc1, requesting contributors to verify changes in the release candidate. (23 comments, 0 👍; +17 in the last 24h)

### dlt
- **Release:** [1.32.0](https://github.com/dlt-hub/dlt/releases/tag/1.32.0) introduces breaking changes: naive scd2 timestamps are no longer read as UTC, `refresh="drop_resources"` and `pipeline.drop()` now drop all tables belonging to resources, Arrow extract shares resolved schema contract per table, and Jira and Salesforce verified sources are rewritten from scratch.

### DuckDB
- **News:** A Hacker News post discusses a data engineer's journey from spreadsheets to DuckLake via DuckDB, highlighting DuckDB's ability to handle analytical tasks without operational complexity.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Dagster](https://github.com/dagster-io/dagster), [Apache Iceberg](https://github.com/apache/iceberg), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino)

---

## Across platforms

- AI-assisted data engineering appears on Snowflake and Fabric: Snowflake's `AI_PARSE_DOCUMENT` adds `AGENTIC` mode (Public Preview) for extracting actionable information from complex documents including charts and diagrams; Fabric's Project Osmos (Preview) introduces a data engineering agent that generates Spark code from natural language and handles validation, schema drift, and incremental-load correctness. Both are in preview; Snowflake focuses on document understanding, Fabric on code generation.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Edit an SQLite database in your browser](https://editsqlite.com/) | Hacker News | [66 points, 33 comments](https://news.ycombinator.com/item?id=50255161) | A browser-based tool lets users open, edit, and re-export SQLite databases locally with a spreadsheet grid, SQL console, and a writer that passes SQLite's official integrity check. |
| [Solving Postgres' Count Problem](https://www.paradedb.com/blog/opening-a-closed-tin-part-2) | Hacker News | [17 points, 0 comments](https://news.ycombinator.com/item?id=50269668) | ParadeDB accelerated Wikipedia COUNT queries using ctid-aware segment partitioning, an inverted DocId map, and bitmap postings, achieving 10–22x higher throughput than Tantivy on filtered, time-sorted Hacker News queries. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*