# Data Engineering 2026-11-12

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-12) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-12/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-12/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-12/ai-policy) · **🟨 Data Engineering**

> Vendor items: 12 | Also new: 5 | Projects: 26 | Active today: 2 | Stable releases: 1 | Prereleases (not covered): 1 | Generated: 2026-11-12 06:59 UTC

---

## Highlights
- Azure Databricks workspaces with the compliance security profile enabled will have external access to Unity Catalog managed Delta tables enabled by default on or after December 10, 2026; plan for external Delta clients to create, read, and write managed tables.
- BigQuery Enterprise and Enterprise Plus users can now specify an optional principal property on reservation assignments (generally available) to route queries by user, service account, or third-party identity.
- Fabric Warehouse CI/CD (preview) adds DacFx schema deployment, pre- and post-deployment scripts, and Warehouse Item Definition APIs for a more complete lifecycle.

---

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

---

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-12 | 🤖 [Genie ZeroOps is available in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-zeroops-is-available-in-beta) | Genie ZeroOps monitors jobs, pipelines, and tables in the background, detects failures and data quality issues, investigates the root cause, and proposes a fix. |
| 2026-11-11 | [Pages are generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#pages-are-generally-available) | Curators can certify and deprecate Pages, the new MANAGE PAGES permission controls who can publish and manage Pages in a domain, and Pages can be managed via the REST API. |
| 2026-11-11 | 🤖 [Azure Databricks Genie plugin for Microsoft Copilot Cowork (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#azure-databricks-genie-plugin-for-microsoft-copilot-cowork-public-preview) | The Azure Databricks Genie plugin connects Microsoft Copilot Cowork to Genie One without creating an OAuth app or editing a plugin manifest; existing Beta manifest-based plugin installations are not migrated automatically and users must add the new plugin in Copilot Cowork. |
| 2026-11-11 | [Write custom service policies in Python (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#write-custom-service-policies-in-python-beta) | Custom service policies can be written as Python functions in Unity Catalog for rules SQL cannot express, such as regular expressions, Python packages, or calls to an external guardrail through a service credential; available in select regions. |
| 2026-11-11 | 🤖 [The Genie One desktop app for Windows is in Beta](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#the-genie-one-desktop-app-for-windows-is-in-beta) | The Genie One desktop app for Windows in Beta opens Genie One on the desktop instead of a browser tab, letting business users chat with data in natural language, work with threads and documents, and use Genie Agents without a browser. |
| 2026-11-10 | [External access to Unity Catalog managed Delta tables will soon be available by default for workspaces with the compliance security profile enabled](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) | External Delta clients can create, read, and write Unity Catalog managed Delta tables by default for workspaces with the compliance security profile enabled starting on or after December 10, 2026; creating and writing requires catalog commits and access continues to be controlled by metastore external data access settings and Unity Catalog privileges. |
| 2026-11-10 | 🤖 [Text and binary inputs for protobuf requests to custom model serving endpoints (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#text-and-binary-inputs-for-protobuf-requests-to-custom-model-serving-endpoints-public-preview) | Protobuf requests to custom model serving endpoints can carry text and binary data as KServe v2 BYTES tensors alongside numeric tensors, with text and binary outputs returned as BYTES tensors; this is only available on endpoints deployed after November 10, 2026. |
| 2026-11-09 | 🤖 [Use cleaned AI answers in Lakeflow Designer (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#use-cleaned-ai-answers-in-lakeflow-designer-public-preview) | Supported AI Function outputs in Lakeflow Designer can be cleaned for downstream transformations, with cleaned results including answer values, error messages, and raw responses in separate columns. |
| 2026-11-06 | [Distinguish Lakeflow Designer Python previews from full runs (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#distinguish-lakeflow-designer-python-previews-from-full-runs-public-preview) | Python operators in Lakeflow Designer now expose config["is_preview"] so code can skip side effects during previews. |

*Also new:* [Azure Databricks Genie plugin for Microsoft 365 Copilot (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#azure-databricks-genie-plugin-for-microsoft-365-copilot-public-preview) · [Bring your own ChatGPT subscription to Codex with Unity Gateway](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#bring-your-own-chatgpt-subscription-to-codex-with-unity-gateway) · [Allow ChatGPT and Claude as partner platforms in context-based ingress policies](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#allow-chatgpt-and-claude-as-partner-platforms-in-context-based-ingress-policies) · [Calculate across rows in Lakeflow Designer (Public Preview)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#calculate-across-rows-in-lakeflow-designer-public-preview)

### Databricks CLI

- **Release:** [v1.26.0](https://github.com/databricks/cli/releases/tag/v1.26.0) fixes explicit `false` values on optional boolean bundle fields being dropped, which hid them from `bundle validate -o json` and prevented targets from overriding `true` with `false`; it also stops sending `compute_size` in the app update mask when undeclared, preventing a deploy from resetting a manually resized app to the default size.
- **Release:** Adds the `feature_specs` resource type with Unity Catalog grants, extends `lifecycle.depends_on` to target grants or permissions (e.g., `schemas.foo.grants`), and introduces `DATABRICKS_BUNDLE_INIT_WORKSPACE_HOST_PROFILE` to control the host returned by the `workspace_host` template helper.
- **Release:** `air run` now reuses its existing workspace connection for config validation instead of opening a second one, saving a TCP and TLS handshake per submission, and parallelizes archive compression for git-pinned `code_source` snapshots to speed up packaging on large repositories.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

---

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-11 | Microsoft Fabric | [Use OneLake as native storage for Azure Databricks (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks-Preview/ba-p/5377939) | OneLake external-location support for Unity Catalog is generally available in Microsoft Fabric with OneLake Security enabled by default for Azure Databricks Storage items, while on the Azure Databricks side the feature is in preview; supported Unity Catalog-managed data can be stored directly in OneLake. |
| 2026-11-11 | BigQuery | [You can specify an optional principal property on BigQuery reservation assignments to route queries to specific reservations based on the identity of the user, service account, or third-party identity…](https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026) | An optional principal property can be specified on BigQuery reservation assignments to route queries to specific reservations based on the identity of the user, service account, or third-party identity executing the job; supported only in BigQuery Enterprise and Enterprise Plus editions and generally available. |
| 2026-11-11 | Microsoft Fabric | [The next chapter for CI/CD in Fabric Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/The-next-chapter-for-CI-CD-in-Fabric-Warehouse-Preview/ba-p/5401222) | CI/CD in Fabric Warehouse now includes DacFx for a common schema deployment foundation, pre- and post-deployment scripts for changes beyond schema, and Warehouse Item Definition APIs for automation, creating a more complete CI/CD lifecycle. |

*Also new:* [Project caps (also known as scheduling policies) let you limit maximum slots and concurrency per project within a BigQuery reservation (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026)

---

## Open-source stack

### DuckDB

- **News:** [Show HN: NoDOM high performance WASM UI kit for DuckDB-WASM](https://news.ycombinator.com/item?id=50452389)
- **News:** [Local Analytics Doesn't Need a Database Server](https://duckdb.org/2026/11/12/local-analytics-without-a-database-server.html) describes how DuckDB enables serverless local analytics, powering SQLRooms for interactive data, visualizations, and AI-assisted analysis on the user's machine.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

---

Nothing new from Snowflake ([Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)) today.

---

## Across platforms

- OneLake as native storage for Unity Catalog: in Microsoft Fabric the external-location support is generally available with OneLake Security enabled by default; on Azure Databricks the same capability is in preview.

---

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-11 | [Agents Are Code Too: What I Learned Shipping a Cortex Agent Through Azure DevOps](https://medium.com/snowflake/agents-are-code-too-what-i-learned-shipping-a-cortex-agent-through-azure-devops-fab3adae29e8) | Snowflake on Medium | The author built a Cortex Agent for the finance domain and moved it through sbx, dev, uat, and prod with the same discipline applied to other Snowflake objects, learning that an agent you cannot rebuild from Git is a prototype regardless of answer quality. |

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| TimeNet: Open-source data infrastructure for Temporal Foundation Models ([OpenTSLM/TimeNet](https://github.com/OpenTSLM/TimeNet)) | Hacker News | [49 points, 8 comments](https://news.ycombinator.com/item?id=50443264) | TimeNet offers open‑source infrastructure to download and explore time‑series datasets in a unified format. |
| [JSON vs. jsonb in Postgres: size and speed, measured](https://now-next.nl/en/insights/postgresql-json-vs-jsonb-measured/) | Hacker News | [29 points, 0 comments](https://news.ycombinator.com/item?id=50452394) | Benchmarks of JSON versus jsonb in PostgreSQL 17/18 reveal jsonb can be 23 % smaller or 41 % larger depending on document shape. |
| Show HN: I created a library for correctly using SQLite in Go programs ([cattlecloud/litesql](https://github.com/cattlecloud/litesql)) | Hacker News | [21 points, 1 comment](https://news.ycombinator.com/item?id=50453176) | The author released litesql, a Go library for convenient and performant SQLite3 database access. |
| [Part 5: The Control That Protected an Empty Bucket](https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j) | Dev.to | [18 reactions, 4 comments](https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j) | This installment continues a public series building an HL7 v2 to FHIR R4 interoperability service. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*