===== 2026-11-10 · AI Agents =====

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321)–[v2.1.322](https://github.com/anthropics/claude-code/releases/tag/v2.1.322) add fast mode on Vertex in global/US/EU regions, make Claude Fable 5.2 the default model (1M context, $8/$40 per Mtok), add `--settings` to `claude remote-control`, and fix multiple regressions including MCP OAuth token leaks, Bash permission prompts on network paths, `NotebookEdit`/`Edit` corruption on UNC/WSL paths, and Windows `FileChanged` hook failures with lowercase drive letters.
- **Hot issue:** [#107390](https://github.com/anthropics/claude-code/issues/107390): users report weekly Team usage exhausted in ~30.5 hours after reset (Nov 4–5), far faster than the prior ~2-hour session burn rate, with no workflow change. (regression; 11 comments, 5 👍; +9 since 2026-11-08)
- **Hot issue:** [#107922](https://github.com/anthropics/claude-code/issues/107922): an issue says Claude in Chrome fails to connect to the desktop app on Windows with 403 "OAuth token forbidden" on the bridge WebSocket since ~Oct 29, despite an active Pro plan confirmed by support. (regression; 4 comments, 1 👍; +3 since 2026-11-08)
- **News:** [Why Is AI Slop So Frustrating to Read?](https://news.ycombinator.com/item?id=50433799) analyzes unclear writing in AI output, measuring 78% of Claude Code reply sentences as unclear versus 11% on Stack Overflow.
- **News:** [Take Claude Code Above Average: Let Antigravity Review It](https://dev.to/gde/take-claude-code-above-average-let-antigravity-review-it-1f3g) describes building a tool that lets a second AI review Claude Code's work to improve quality.

### Pi

- **Release:** [v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) removes `GrepOperations.readFile` callbacks for context lines (breaking), stops sending empty `tools` for OpenAI-compatible models to fix vLLM 0.20+ 400 errors, adds pi auth login/logout without starting a session, enables idle prompt cache warming up to 30 minutes, implements Anthropic message threads sending only new messages, enriches Mermaid diagrams with pie charts and clickable labels, adds GitHub Copilot classifiers via `models.classify()`, and shows package update summaries with `pi update --extensions`.

### Oh My Pi

- **Release:** [v18.18.4](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.4)–[v18.18.6](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.6) add Claude Fable 5.2 and Mythos 5.2 models, introduce Otari gateway provider (`/login otari`), pause Google Antigravity via a `disabled` auth rule, add `base64SkipThoughtSignature` compat flag for Gemini gateways, fix MCP `headers`/stdio `env` with `!command` retrying on 401/403, fix exclusive MCP tools keeping batch position, add Tern long-press menu to edit/resend/fork turns, fix multi-question ask forms showing Submit on last tab, and raise plugin catalog cap to 16 MiB so live catalog works again.

### Hermes Agent

- **Release:** [v0.23.1](https://github.com/nousresearch/hermes-agent/releases/tag/v0.23.1) raises the plugin catalog size cap from 2 MiB to 16 MiB so the live catalog is used instead of falling back to the bundled one, fixing silent install failures for plugins added since the last update; the patch rolls up ~618 PRs since v0.23.0 including Esc backtrack in TUI/CLI, group chats on gateways without Desktop, shared gateway connections, in-app browser sign-in with real browser profile, `hermes gateway attach`, new plugin API (session-scoped env, JSON-RPC, `llm.oneshot`, stable `conversation_id`, hooks), and faster transcript/handoff reads.

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/conductor-oss/conductor)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [ChatGPT Desktop forwards your SSH agent to remote machines](https://news.ycombinator.com/item?id=50422628) | Hacker News | [208 points, 73 comments](https://news.ycombinator.com/item?id=50422628) | — |
| Show HN: STE80 Humanizer – de-AI text by writing 80% of the way to ASD-STE100 ([Dodaios/ste80-humanizer](https://github.com/Dodaios/ste80-humanizer)) | Hacker News | [83 points, 24 comments](https://news.ycombinator.com/item?id=50429144) | The author released an agent skill called STE80 Humanizer that rewrites text to reach 80% of the ASD-STE100 Simplified Technical English standard. |
| [Ask HN: How do you evaluate the skills your AI agents use?](https://news.ycombinator.com/item?id=50426070) | Hacker News | [18 points, 4 comments](https://news.ycombinator.com/item?id=50426070) | — |
| USB: A trust layer for AI skills and MCP servers ([PeepSick/usbplus](https://github.com/PeepSick/usbplus)) | Hacker News | [11 points, 2 comments](https://news.ycombinator.com/item?id=50432661) | USB+ provides a universal skill format with 529 skills and 16 target formats, including a trust layer with secscan and mcprobe. |
| Show HN: Airgap-check – find what your AI app silently downloads offline ([humanethq/airgap-check](https://github.com/humanethq/airgap-check)) | Hacker News | [9 points, 0 comments](https://news.ycombinator.com/item?id=50431705) | Airgap-check audits AI repositories for offline crashes, silent telemetry, and .env secret routing when run with --network none. |
| Show HN: Glassbrain – Read your agent's brain, know what your agent knows ([voidixyn/glassbrain](https://github.com/voidixyn/glassbrain)) | Hacker News | [6 points, 1 comment](https://news.ycombinator.com/item?id=50423154) | Glassbrain lets you inspect agents' knowledge graphs by converting plain JSON into a single HTML file for review. |
| [Top 7 Best Agent Gateways](https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi) | Dev.to | [21 reactions, 3 comments](https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi) | The author reviews seven agent gateways, highlighting that agents can call a model five times and search. |
| [Don't Write More Prompts. Install These 10 Trending 'Skills' Instead](https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc) | Dev.to | [20 reactions, 7 comments](https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc) | The author tested 10 trending GitHub skills that enhance agent capabilities. |

===== 2026-11-10 · AI Models & Labs =====

## Lab announcements

| Date | Lab | Post | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-10 | OpenAI | [Control Room](https://openai.com/index/control-room/) | — |
| 2026-11-10 | OpenAI | [Chatgpt Enterprise Aws Marketplace](https://openai.com/index/chatgpt-enterprise-aws-marketplace/) | — |
| 2026-11-09 | Anthropic | [Claude can design electronic prototypes from start to finish](https://www.anthropic.com/research/claude-electronics-design) | Anthropic announced that Claude can now design and prototype electronic hardware from start to finish, demonstrated by collaborating with Diode Computers to have Claude Fable 5.2 design three electronic devices including a speakerphone and voice-assistant hub. |

## New on OpenRouter

| Model | Listed | Context | Summary |
| :--- | :--- | :--- | :--- |
| [Nex AGI: Nex-N2.6](https://openrouter.ai/nex-agi/nex-n2.6) `nex-agi/nex-n2.6` | 2026-11-10 | 262K | Nex-N2.6 is an agentic model built on GLM-5.3-Flash with about 321B parameters, suited for computer use, coding, and long-horizon tasks that involve tools. |
| [Thinking Machines: Inkling 2 Small (free)](https://openrouter.ai/thinkingmachines/inkling-2-small:free) `thinkingmachines/inkling-2-small:free` | 2026-11-09 | 1M | Inkling 2 Small is a multimodal mixture-of-experts reasoning model from Thinking Machines Lab with 17B active parameters out of 594B total, the first model in the second Inkling series. |
| [Anthropic: Claude Fable 5.2](https://openrouter.ai/anthropic/claude-fable-5.2) `anthropic/claude-fable-5.2` | 2026-11-09 | 1M | Claude Fable 5.2 is Anthropic's model with gains over Fable 5.1 in coding, reasoning, and vision. |
| [Anthropic: Claude Fable 5.2 (batch)](https://openrouter.ai/anthropic/claude-fable-5.2:batch) `anthropic/claude-fable-5.2:batch` | 2026-11-09 | 1M | Claude Fable 5.2 (batch) is Anthropic's model with gains over Fable 5.1 in coding, reasoning, and vision. |
| [Meta: Muse Ember](https://openrouter.ai/meta/muse-ember) `meta/muse-ember` | 2026-11-09 | 1M | Muse Ember is a model from Meta designed for complex reasoning execution and agent workflows including tool calls, coding agent subtasks, and routing. |

Nothing new from OpenRouter's stealth models today.

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Google Gemini routes personal Drive files and emails to human annotators ([thisisme6598/gemini_files](https://github.com/thisisme6598/gemini_files/)) | Hacker News | [531 points, 120 comments](https://news.ycombinator.com/item?id=50429426) | The documentation shows that Google Gemini sends personal Drive files and emails to human annotators. |
| [Claude Fable 5.2 and Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2) | Hacker News | [464 points, 741 comments](https://news.ycombinator.com/item?id=50429068) | Anthropic released Claude Fable 5.2 and Mythos 5.2, with Fable 5.2 achieving a new benchmark in coding, finance, and science. |
| [Claude Fable 5.2 scores 65 on Artificial Analysis, highest so far](https://artificialanalysis.ai/models/claude-fable-5-2) | Hacker News | [335 points, 242 comments](https://news.ycombinator.com/item?id=50431144) | An analysis reports Claude Fable 5.2 scoring 65 on Artificial Analysis, the highest score to date, comparing quality, price, and performance metrics. |
| [Muse Ember: Our smallest, most efficient model](https://research.meta.ai/blog/muse-ember) | Hacker News | [287 points, 118 comments](https://news.ycombinator.com/item?id=50429024) | Meta introduced Muse Ember, its smallest and most efficient model built for complex reasoning and repetitive agent tasks. |
| 6 Hours of YouTube and 85 handtyped pages of notes on LLM Inference – Start here ([samir-sarwar/samir-vllm](https://github.com/samir-sarwar/samir-vllm)) | Hacker News | [78 points, 12 comments](https://news.ycombinator.com/item?id=50424199) | The project provides a from-scratch LLM inference engine accompanied by over 6 hours of YouTube tutorials and 85 pages of handwritten notes. |
| [Amazon saves millions by replacing Sonnet 4.6 with Strands Decider](https://strandsagents.com/blog/amazon-saves-millions-replacing-sonnet-with-strands-decider/) | Hacker News | [75 points, 14 comments](https://news.ycombinator.com/item?id=50436640) | Two Amazon engineers replaced Claude Sonnet 4.6 with a decision model in a massive internal ticketing system, saving millions. |
| [How much does it cost to run a text game with LLMs](https://dev.to/hiper2d/how-much-does-it-cost-to-run-a-text-game-with-llms-57o7) | Dev.to | [30 reactions, 32 comments](https://dev.to/hiper2d/how-much-does-it-cost-to-run-a-text-game-with-llms-57o7) | The author reviews real-world costs of running a text game across 27 frontier models, analyzing token pricing and caching. |

===== 2026-11-10 · AI Policy =====

## EU

| Date | Source | Title | Stage | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2026-11-06 | European Commission | [Commission preliminarily finds TikTok’s ‘For You’ feed in breach of Digital Services Act for harmful ‘rabbit holes’ effect](https://digital-strategy.ec.europa.eu/news-redirect/964582) | — | The European Commission preliminarily found TikTok in breach of the Digital Services Act for the 'rabbit hole effect' of its recommender system. |

## News & commentary

| Date | Source | Title | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-09 | Covington Inside Privacy | [Pennsylvania Enacts Artificial Intelligence Deceptive Advertising Act](https://www.insideprivacy.com/artificial-intelligence/pennsylvania-enacts-artificial-intelligence-deceptive-advertising-act/) | Pennsylvania enacted the Artificial Intelligence Deceptive Advertising Act (Senate Bill 806) on October 22, 2026. |

## Coming up

Deadlines and dates in the next 30 days.

| Date | Source | Item |
| :--- | :--- | :--- |
| 2026-11-11 | Have your say | [Cloud and AI Development Act](https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/14628_en) |
| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |

===== 2026-11-10 · Data Engineering =====

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-06 | ⚠️ 🤖 [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2026-11-05 | ⚠️ 🤖 [Smart Routing is faster and lower cost, and now routes subagents only (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta) | Smart Routing now routes only subagents instead of the first prompt, reducing cost by up to 70% and p90 latency from 9 seconds to 2 seconds, while Smart Routing for Codex is paused. |
| 2026-11-09 | 🤖 [Genie Search is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-search-is-now-generally-available) | Genie Search indexes organizational knowledge from Google Drive, Jira, Confluence, and Workday while preserving source permissions, powering org directories and unified search in Discover alongside MCP connectors. |
| 2026-11-09 | 🤖 [Genie Ontology is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-ontology-is-now-generally-available) | Genie Ontology provides a business-aware context layer for Genie One, Genie Code, and other AI agents by combining modeled knowledge from Unity Catalog semantics with learned knowledge extracted from assets and usage. |
| 2026-11-09 | [Shift dates in Lakeflow Jobs parameters with date arithmetic (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#shift-dates-in-lakeflow-jobs-parameters-with-date-arithmetic-beta) | Lakeflow Jobs parameters now support date arithmetic in dynamic value references, allowing expressions like `{{(job.start_time - 1.day).iso_date}}` to shift dates by a duration before formatting. |
| 2026-11-07 | [Recover dropped Unity Catalog volumes with UNDROP VOLUME](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#recover-dropped-unity-catalog-volumes-with-undrop-volume) | Dropped Unity Catalog volumes can be recovered within 7 days using `SHOW VOLUMES DROPPED` to find the ID and `UNDROP VOLUME WITH ID` to restore privileges and tags, requiring Databricks Runtime 19 or above. |
| 2026-11-06 | 🤖 [Load Unity Catalog tables into PyTorch on AI Runtime (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#load-unity-catalog-tables-into-pytorch-on-ai-runtime-beta) | UCDataset streams Unity Catalog table rows directly into PyTorch training loops on AI Runtime without Spark or a SQL warehouse, applying filter expressions and deletion vectors while splitting rows across GPUs and data loader workers. |
| 2026-11-03 | [Databricks SQL version 2026.45 is now available in Preview](https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202645-is-now-available-in-preview) | Databricks SQL 2026.45 Preview adds `WITH HISTORY` and `WITHOUT HISTORY` clauses to `ALTER SHARE... ADD VIEW` and `ALTER SHARE... ALTER VIEW` for controlling view history sharing. |

*Also new:* [Databricks Genie app in Microsoft Teams is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-in-microsoft-teams-is-now-generally-available) · [Databricks Genie app for Slack is now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-for-slack-is-now-generally-available)

### Databricks CLI

- **Release:** [v1.25.0](https://github.com/databricks/cli/releases/tag/v1.25.0) removes `CRITICAL` as a valid `compute.priority_class` value; the AI Runtime API no longer accepts it.
- **Release:** Fixes `%pip` in Jupyter notebooks over `databricks ssh connect` on serverless envs 5/6 and recent Databricks Runtime, which fell back to stock IPython magic; also fixes bundle grants/permissions staying under old names/IDs after resource rename/recreate, and registered model `aliases` now apply on deploy instead of being ignored.
- **Release:** Adds `postgres_data_apis` resource (Private Preview) for Lakebase Postgres Data API, more specific `error_category` for `databricks aitools install --output json`, and templates now embed workspace ID (`?w=`) in `workspace.host` for multi-workspace hosts.

### Terraform provider for Databricks

- **Release:** [v1.142.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.142.0) adds databricks_connection.secrets for Unity Catalog secrets, new LakeWatch resources (`databricks_lakewatch_datasource`, `databricks_lakewatch_rule`, etc.), and Slack/Teams blocks for `databricks_notification_destination`.
- **Release:** Fixes data races in concurrent provider client caches and preserves `databricks_pipeline.expected_last_modified` on refresh to prevent post-apply drift.

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [dbt-databricks](https://github.com/databricks/dbt-databricks)

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-08 | [IPADDRESS data type (General availability)](https://docs.snowflake.com/en/release-notes/2026/10_40) | The `IPADDRESS` data type stores IPv4 or IPv6 addresses as native 128-bit values with validation, canonical storage, and numeric address order comparison. |
| 2026-11-08 | 🤖 [CoCo Admin in Snowsight (Preview)](https://docs.snowflake.com/en/release-notes/2026/10_40) | CoCo Admin in Snowsight automatically detects CoCo enablement status and identifies the exact remaining setup steps instead of requiring a manual checklist. |
| 2026-11-06 | 🤖 [Anthropic Claude 5.5 and OpenAI GPT-6 models (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-06-claude-5-5-openai-gpt-6-ga) | Anthropic Claude 5.5 and OpenAI GPT-6 models are now generally available in Snowflake. |

*Also new:* [Snowflake CoCo for Microsoft Excel and Snowflake CoCo for Google Sheets (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-coco-excel-sheets-preview) · [Skill recommendations and suggestions to create and share skills in CoCo](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-09-coco-skill-recommendations)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-09 | Microsoft Fabric | ⚠️ [Unifying SQL Pools: Upcoming changes to UI and APIs](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Unifying-SQL-Pools-Upcoming-changes-to-UI-and-APIs/ba-p/5397390) | SQL pool configurations are moving to a unified model that removes the built-in versus custom pool distinction, representing all pools through a single configuration across UI and APIs with upcoming changes to GET and PATCH API responses. |
| 2026-11-09 | BigQuery | [Query performance troubleshooting and job and system performance comparison in the BigQuery jobs explorer (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026) | BigQuery jobs explorer now provides generally available query performance troubleshooting and job and system performance comparison capabilities. |
| 2026-11-09 | BigQuery | [When you create or schedule a pipeline, you can specify the maximum number of concurrently executed pipeline tasks (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026) | BigQuery pipelines support specifying the maximum number of concurrently executed pipeline tasks at creation or scheduling time. |
| 2026-11-09 | BigQuery | [To support your FinOps practices, you can now opt in to compute cost attribution in BigQuery editions (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026) | BigQuery editions offer an opt-in compute cost attribution feature that assigns billed compute charges to query projects based on actual commitment and autoscaling slot usage from the administration project's reservation capacity. |

*Also new:* [You can use compression functions in GoogleSQL to compress or decompress bytes or string values by using the Zstandard (Zstd) lossless data compression algorithm](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026)

Nothing new from Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-09 | [Who is actually using your Snowflake MCP server?](https://medium.com/snowflake/who-is-actually-using-your-snowflake-mcp-server-683a6cb543d7) | Snowflake on Medium | The author demonstrates tracking Snowflake MCP server usage by assigning each server its own OAuth security integration and joining query history to login history, yielding usage per server, user, and day with one join. |

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Ultorg: The User Interface for Relational Databases](https://www.ultorg.com/) | Hacker News | [26 points, 5 comments](https://news.ycombinator.com/item?id=50435898) | Ultorg offers a spreadsheet-like UI for relational databases, enabling query and edit across tables without writing SQL. |

===== 2026-11-11 · AI Agents =====

## Coding Agents & Assistants

### Claude Code

- **Hot issue:** [#108726](https://github.com/anthropics/claude-code/issues/108726): users report that `DISABLE_TELEMETRY=1` prevents feature flags from loading, causing the `/model` picker to hide Fable 5.2 and fall back to compiled defaults. (5 comments, 12 👍; +17 in the last 24h)
- **Hot issue:** [#89673](https://github.com/anthropics/claude-code/issues/89673): users request an option in the Desktop app to make Enter insert a newline and Ctrl+Enter submit, matching common chat conventions; the existing `keybindings.json` works only in the terminal TUI. (24 comments, 104 👍; +11 in the last 24h)

### OpenAI Codex

- **Release:** [rust-v0.167.1](https://github.com/openai/codex/releases/tag/rust-v0.167.1)
- **Hot issue:** [#56655](https://github.com/openai/codex/issues/56655): users report the VS Code extension fails to start its UI on Windows after upgrading to v26.51021.22027; rolling back to v26.51007.21434 restores function. (78 comments, 85 👍; +27 in the last 24h)
- **News:** [Show HN: Cosh – An open-source AI agent orchestrator](https://news.ycombinator.com/item?id=50439141) mentions Codex as one of the external agents Cosh integrates with.

### Gemini CLI

- **Release:** [v0.68.0](https://github.com/google-gemini/gemini-cli/releases/tag/v0.68.0) fixes case-insensitive root detection on Windows, surrogate-pair handling in display truncation, `.git/info/exclude` honoring in shadow repos, 429 rate-limit countdown in the loading indicator, and preserves the selected model across fallback and rewind.

### OpenCode

- **Release:** [v2.2.7](https://github.com/anomalyco/opencode/releases/tag/v2.2.7) removes `ImageResponse.image` (use `response.images[0]`), adds GitHub Copilot Auto model picking, side-panel tab shortcuts (`⌘W`, `⌥⌘W`, `⌘⇧T`), session read/unread marking, MCP login persistence across concurrent refreshes, negative `read` offsets, and file-not-found suggestions.

### Pi

- **Release:** [v1.5.2](https://github.com/earendil-works/pi/releases/tag/v1.5.2) adds forking sessions whose original folder is gone, changes the missing-directory prompt to offer Continue/Fork/Cancel, and fixes `/import` leaving duplicate session files and an outdated Claude Code version in Anthropic OAuth requests.

### Oh My Pi

- **Release:** [v18.18.8](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.8)–[v18.18.7](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.7) removes `getConfigAgentDirName()`, adds LiteLLM usage adapter with key/user budgets, login-warning auth rule for risky accounts, Muse Ember model with reasoning ladder, per-window saved-reset auto-redeem settings, and fixes Morph session-id header, Claude Fable limit reporting, and child-browser isolation.

### Hermes Agent

- **Hot issue:** [#152674](https://github.com/NousResearch/hermes-agent/issues/152674): an issue says the Desktop app loses the logged-in Nous user identity — the server mints a correct ws ticket but chat messages are admitted as `uid:10000` for two different accounts after full restarts and storage cleanup. (type/security; 3 comments, 0 👍; +3 in the last 24h)

**Quiet today:** [Kilo Code](https://github.com/Kilo-Org/kilocode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

## Agent Tooling

### OpenShell

- **Release:** [v0.1.8](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8) makes several breaking changes: static provider credentials now require explicit `auth_style` placement declarations for custom headers, query parameters, and path slots; REST endpoints return `403` for HTTP upgrade requests; OCSF sandbox attribution fields move to `resources` entries or `unmapped` fields; sandboxes fail to launch when filesystem policies traverse symlinks in writable workspaces; and IPv4-mapped IPv6 destinations are evaluated as IPv4.
- **Release:** The `openshell` Python SDK is now published from `ai-openshell/sdk-python` (install via `pip install openshell`), and the Go SDK module `github.com/NVIDIA/OpenShell/sdk/go` is deprecated in favor of `github.com/ai-openshell/sdk-go`.
- **Release:** WebSocket traffic must be configured with `protocol: websocket` and explicit handshake/message rules; `websocket_credential_rewrite: true` now requires a WebSocket endpoint.

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/conductor-oss/conductor)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: Get your coding agent off ~2019 JavaScript, onto modern web primitives ([GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)) | Hacker News | [322 points, 98 comments](https://news.ycombinator.com/item?id=50443812) | A Show HN project that updates coding agents from roughly 2019-era JavaScript to modern web primitives. |
| [Life on Claude Nine](https://babuschk.in/posts/2026-01-25-life-on-claude-nine.html) | Hacker News | [96 points, 57 comments](https://news.ycombinator.com/item?id=50443587) | The author describes adopting Claude for daily life, beginning with email automation. |
| [Show HN: AI agents that barter your stuff for things you want](https://barterpilot.com/) | Hacker News | [6 points, 4 comments](https://news.ycombinator.com/item?id=50446649) | A Show HN service where AI agents barter listed personal items for desired goods, treating possessions as currency. |
| [Detecting Flaky Tests and Finding Their Root Causes with Strands Agents and Gemini](https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan) | Dev.to | [48 reactions, 5 comments](https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan) | The author explores detecting flaky tests and identifying root causes using Strands Agents and Gemini. |
| [Once Upon Agentic AI (Part 1): Create your own agent and forge its tools with Strands Agents](https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo) | Dev.to | [23 reactions, 3 comments](https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo) | A tutorial (Part 1) on building a custom agent and its tools with the Strands Agents framework. |

===== 2026-11-11 · AI Models & Labs =====

## Lab announcements

| Date | Lab | Post | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-11 | OpenAI | [Ai Effect On Freelance Work](https://openai.com/index/ai-effect-on-freelance-work/) | — |
| 2026-11-11 | OpenAI | [Chatgpt Plus For Veterans](https://openai.com/index/chatgpt-plus-for-veterans/) | — |
| 2026-11-11 | OpenAI | [Helping Caregivers Use Ai In Everyday Life](https://openai.com/index/helping-caregivers-use-ai-in-everyday-life/) | — |
| 2026-11-11 | OpenAI | [Introducing Businesses Chatgpt](https://openai.com/index/introducing-businesses-chatgpt/) | — |
| 2026-11-10 | OpenAI | [Closing Ai Guidance Gap Education](https://openai.com/index/closing-ai-guidance-gap-education/) | — |
| 2026-11-10 | OpenAI | [Enabling A Data Driven Workforce Webinar](https://openai.com/business/learn/enabling-a-data-driven-workforce-webinar/) | — |
| 2026-11-10 | OpenAI | [Identifying And Scaling Ai Use Cases](https://openai.com/business/learn/identifying-and-scaling-ai-use-cases/) | — |
| 2026-11-10 | OpenAI | [How Openai Uses Codex](https://openai.com/business/learn/how-openai-uses-codex/) | — |
| 2026-11-10 | OpenAI | [Fine Tuning Gpt 4o Webinar](https://openai.com/business/learn/fine-tuning-gpt-4o-webinar/) | — |
| 2026-11-10 | Anthropic | [Anthropic launches roadshow for proposed initial public offering](https://www.anthropic.com/news/roadshow-launch) | Anthropic launched a roadshow for its proposed initial public offering of 825,000,000 shares of Class A common stock, with an expected price between $70.00 and $78.00 per share and plans to list on the Nasdaq Global Select Market under the symbol “ANT.” |

## New on OpenRouter

| Model | Listed | Context | Summary |
| :--- | :--- | :--- | :--- |
| [Baidu: ERNIE-5.5-Flash-Preview](https://openrouter.ai/baidu/ernie-5.5-flash-preview) `baidu/ernie-5.5-flash-preview` | 2026-11-10 | 1M | ERNIE 5.5 Flash Preview is the latest foundation model in the ERNIE family with comprehensive improvements in coding, agentic capabilities, knowledge work, and deep research. |
| [Baidu: ERNIE-Light-DT-1.0](https://openrouter.ai/baidu/ernie-light-dt-1.0-intl) `baidu/ernie-light-dt-1.0-intl` | 2026-11-10 | 1M | ERNIE-Light-DT-1.0 is based on open-source GLM models and includes research findings from Baidu Search's Lightning large model, featuring Baidu Sparse Attention (BSA). |
| [Google: Gemini 4 Carbon](https://openrouter.ai/google/gemini-4-carbon) `google/gemini-4-carbon` | 2026-11-10 | 1M | Gemini 4 Carbon is a frontier Gemini 4 model for coding, agentic and complex reasoning work that takes text, image, audio, video and file input. |
| [Google: Gemini 4 Carbon (batch)](https://openrouter.ai/google/gemini-4-carbon:batch) `google/gemini-4-carbon:batch` | 2026-11-10 | 1M | Gemini 4 Carbon is a frontier Gemini 4 model for coding, agentic and complex reasoning work that takes text, image, audio, video and file input. |

Nothing new from OpenRouter's stealth models today.

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Gemini 4 Carbon is now available](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) | Hacker News | [281 points, 154 comments](https://news.ycombinator.com/item?id=50442303) | Google announces the release of Gemini 4 Carbon for developers, enterprises, scientists, and consumers. |
| [What objective is reasoning solving?](https://alexwang.ai/posts/reasoning-as-pathfinding/) | Hacker News | [136 points, 63 comments](https://news.ycombinator.com/item?id=50445013) | An essay framing reasoning as a pathfinding problem within token space. |
| [An Open Field Guide to Inference Engineering](https://docs.modelplane.ai/guides/inference-guide) | Hacker News | [80 points, 8 comments](https://news.ycombinator.com/item?id=50443714) | An open field guide covering inference engineering concepts, production operations, tooling, and career paths for platform engineers. |
| [Anthropic to Seek $1.3T Valuation in IPO](https://www.wsj.com/finance/stocks/anthropic-to-seek-1-3-trillion-valuation-in-ipo-8337b669) | Hacker News | [59 points, 83 comments](https://news.ycombinator.com/item?id=50439616) | — |
| [LLMs Play Zachtronics' TIS-100](https://tis-100.wincon.dev/) | Hacker News | [34 points, 4 comments](https://news.ycombinator.com/item?id=50448340) | Sixteen LLMs were evaluated on Zachtronics' TIS-100 puzzles, discovering 133 new frontier points across 18 of 55 puzzles and three cycle records. |
| [Claude Fable 5.2 launch offers](https://support.claude.com/en/articles/17506494-claude-fable-5-2-launch-offers) | Hacker News | [29 points, 5 comments](https://news.ycombinator.com/item?id=50430176) | — |

===== 2026-11-11 · AI Policy =====

## EU

| Date | Source | Title | Stage | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2026-11-10 | European Commission | [Targeted consultation on the draft revised election guidelines under the Digital Services Act (DSA)](https://digital-strategy.ec.europa.eu/news-redirect/964768) | — | The European Commission launched a targeted consultation on draft revised election guidelines under the DSA focusing on measures VLOPs and VLOSEs should adopt to address generative AI and information manipulation risks to electoral processes. |
| 2026-11-10 | European Commission | [Commission invites views on draft revised election guidelines under Digital Services Act](https://digital-strategy.ec.europa.eu/news-redirect/964805) | — | The European Commission launched a consultation to update its election guidelines under the DSA addressing the rapid evolution of generative AI and growing sophistication of manipulation risks. |
| 2026-11-05 | European Commission | [AI toolbox supports public administrations to put the Apply AI Strategy into practice](https://digital-strategy.ec.europa.eu/news-redirect/964507) | — | The European Commission published an AI toolbox on the Interoperable Europe portal to support public administrations in implementing the Apply AI Strategy with practical tools, guidance and examples. |

## Netherlands

| Date | Source | Title | Stage | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2026-11-10 | Digitale Overheid | [Kabinet kiest voor AI die Nederland vooruithelpt](https://www.digitaleoverheid.nl/nieuws/kabinet-kiest-voor-ai-die-nederland-vooruithelpt/) | — | The Dutch cabinet adopted a vision for AI aimed at contributing to a strong economy, good public service delivery and solutions for societal challenges. |
| 2026-11-09 | Tweede Kamer | [Motie van het lid El Boujdaini c.s. over autoriteiten voldoende toerusten voor het toezicht op de AI-verordening](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682) | — | The Dutch House of Representatives received a motion by El Boujdaini and others calling for authorities to be sufficiently equipped for supervision of the AI Regulation. |
| 2026-11-09 | Tweede Kamer | [Motie van het lid Dassen over een juridisch kader voor de aansprakelijkheid bij schade van AI-modellen](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24563&did=2026D56703) | — | The Dutch House of Representatives received a motion by Dassen calling for a legal framework for liability for damage caused by AI models. |
| 2026-11-09 | Tweede Kamer | [Motie van het lid Beckerman over onderzoeken hoe kunstenaars en makers beter beschermd kunnen worden tegen AI](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24559&did=2026D56699) | — | The Dutch House of Representatives received a motion by Beckerman calling for an investigation into how artists and creators can be better protected against AI. |

## News & commentary

| Date | Source | Title | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-10 | Binnenlands Bestuur | [Gezichtsscanner rukt op, maar cijfers over omvang fraude ontbreken](https://www.binnenlandsbestuur.nl/digitaal/gezichtsscanner-rukt-op-omvang-fraude-onbekend) | The Dutch cabinet is working on a legal basis for using facial scanners for passport and ID applications while more than half of municipalities already use automatic facial comparison, though the scale of fraud remains unknown. |
| 2026-11-10 | Politico US | [Trahan crafting AI safety bill with narrower state preemption](https://www.politico.com/live-updates/2026/11/10/congress/trahan-crafting-ai-safety-bill-with-narrower-state-law-preemption-01158965) | US Representative Trahan is crafting an AI safety bill with narrower state preemption as a Democrat-controlled Congress may be less likely to supersede state AI laws. |
| 2026-11-11 | Politico US | [Nvidia loses ground in Washington chip fight after CEO spy scandal](https://www.politico.com/news/2026/11/10/nvidia-ceos-spy-scandal-tilts-capitol-hills-chip-fight-01160548) | Nvidia's influence in Washington has weakened amid a CEO spy scandal as it tries to block new curbs on AI chips. |

## Coming up

Deadlines and dates in the next 30 days.

| Date | Source | Item |
| :--- | :--- | :--- |
| 2026-11-11 | Have your say | [Cloud and AI Development Act](https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/14628_en) |
| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |

===== 2026-11-11 · Data Engineering =====

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-06 | ⚠️ [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-10 | 🤖 [AI_EXTRACT and AI_PARSE_DOCUMENT now support page filtering with FL_FILTER_PAGES](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-fl-filter-pages) | `AI_EXTRACT` and `AI_PARSE_DOCUMENT` now accept `FL_FILTER_PAGES` to process specific document pages directly in SQL, eliminating the need to create separate files for each section. |
| 2026-11-10 | [Temporary role grants to users (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-temporary-role-grants-preview) | Account roles can be granted to users temporarily using `FOR INTERVAL` or `UNTIL` clauses in GRANT ROLE, with automatic revocation when the grant expires. |

### Snowflake Connector for Python

- **News:** [Native Asyncio Comes to the Snowflake Python Connector](https://medium.com/snowflake/native-asyncio-comes-to-the-snowflake-python-connector-5941385ac80e) announces version 5.0.0 with a native awaitable API built on Universal Core, eliminating the need for thread pools when calling Snowflake from event-loop-based Python services.

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-10 | [You can use graph measures to lock an aggregation to a key in order to perform complex aggregations without overcounting (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026) | `graph measures` lock aggregations to a key to prevent overcounting, supporting expressions including `AGG`-wrapped combinations, queried via `GRAPH_EXPAND` TVF (now multi-fact-table) and `AGG` function, with schema inspection via `BQ.SHOW_GRAPH_EXPAND_SCHEMA` and custom metadata via `OPTIONS` clause extensions. |
| 2026-11-10 | 🤖 [BigQuery generative AI functions now support the gemini-4-carbon model](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026) | BigQuery generative AI functions now support the `gemini-4-carbon` model for generally available use. |

## Open-source stack

### dlt

- **News:** [Introducing performance optimization in dltHub](https://dlthub.com/blog/introducing-performance-optimization) announces new performance optimization features for the data ingestion library.

### Apache Iceberg

- **News:** [Is your Iceberg catalog healthy?](https://medium.com/snowflake/is-your-iceberg-catalog-healthy-939dc7817154) compares five open-source Iceberg catalogs on functionality and project health, highlighting catalog choice as critical for Iceberg adoption.

### DuckDB

- **News:** [Measuring Quack: DuckDB's New Client-Server Protocol](https://news.ycombinator.com/item?id=50444907) — title only, no description.
- **News:** [Ducks in a Column](https://duckdb.org/2026/11/10/ducks-in-a-column.html) details how DuckDB's columnar storage enables features like column-level SQL, aggregation shortcuts, window functions, and ASOF joins.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [PyIceberg](https://github.com/apache/iceberg-python), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [ClickHouse Acquires Xata](https://xata.io/blog/xata-is-joining-clickhouse) | Hacker News | [99 points, 10 comments](https://news.ycombinator.com/item?id=50436706) | — |
| Show HN: WolveKafka – Consume Kafka with a plain HTTP endpoint ([wolveflake/wolvekafka](https://github.com/wolveflake/wolvekafka)) | Hacker News | [11 points, 2 comments](https://news.ycombinator.com/item?id=50443596) | A Show HN tool called WolveKafka that enables consuming Kafka via a plain HTTP endpoint in any language, handling retries, dead-letter queues, batching, and offsets. |
| [Next-Level Benchmarking Overfitting](http://databasearchitects.blogspot.com/2026/11/next-level-benchmarking-overfitting.html) | Lobste.rs | [18 points, 3 comments](https://lobste.rs/s/nuoce5/next_level_benchmarking_overfitting) | A blog post by and for database architects examining overfitting in benchmarking practices. |

===== 2026-11-12 · AI Agents =====

## Coding Agents & Assistants

### Claude Code

- **Hot issue:** [#108975](https://github.com/anthropics/claude-code/issues/108975): users report that messages sent from the iOS app mid-turn no longer reach Claude until the turn ends, a regression since version 2.1.321 that prevents steering long-running tasks. (regression; 5 comments, 1 👍; +6 in the last 24h)
- **Hot issue:** [#108984](https://github.com/anthropics/claude-code/issues/108984): users report that Claude Code drops text in the middle of scrollback when appending new console output on Linux, making it impossible to read previous output while the agent continues working. (regression; 3 comments, 2 👍; +4 in the last 24h)
- **News:** [Atuin Threads: All your agent sessions on every machine](https://news.ycombinator.com/item?id=50453637) describes a tool that syncs and searches agent session history across machines, letting users start a task in Claude Code and resume it in Codex.

### OpenAI Codex

- **Release:** [rust-v0.167.2](https://github.com/openai/codex/releases/tag/rust-v0.167.2) adds incremental tool updates by default on Google Cloud Vertex AI, with an opt-out via `incremental_tools_legacy_gcp = false` in `config.toml`.
- **News:** [Atuin Threads: All your agent sessions on every machine](https://news.ycombinator.com/item?id=50453637) describes a tool that syncs and searches agent session history across machines, letting users start a task in Codex and resume it in Claude Code.

### OpenCode

- **Release:** [process-daemon-v0.5.2](https://github.com/anomalyco/opencode/releases/tag/process-daemon-v0.5.2) publishes opencode-pty 0.5.2 (protocol 8) as `@opencode/pty@0.5.2` to npm.

### Oh My Pi

- **Release:** [v18.19.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.19.0) breaks the browser `open` API (`ignore_https_errors` → `insecure`, `allow_file_access` removed), changes `app` option from object to string, removes `task.file` and `blocked` todo status, adds Liquid AI `liquid-systemone` judgment API with 10,000-patch validation, and fixes Gemini CLI/Antigravity thought signature ordering and quota bucket handling.
- **Release:** [v18.18.9](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.9) removes Devin's retired SWE-1.6 Fast model, removes Smithery MCP commands (API shut down Oct 31), adds `SOFYA_API_KEY` for the `sofya` provider, fixes Devin requests sending `temperature: 0` (now raised to `0.0001`), and improves auth-gateway credential rotation.

### DeepSeek Harness

- **Prerelease:** [dsh-v0.2.2-rc.2](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2) adds Git Worktree review by branch/commit/file-type with GitHub review sync, named and multi-layer SubAgent support with AgentTeam session sharing, desktop update channel switching, and extensive UI/UX improvements across code review, sidebar, chat history, patch editing, and agent terminal visibility.

### Hermes Agent

- **Hot issue:** [#153396](https://github.com/NousResearch/hermes-agent/issues/153396): users request the ability to bring their own Slack app per agent on the Team Gateway so each agent keeps its own bot name and avatar while still suspending when idle. (8 comments, 7 👍; +15 in the last 24h)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: Klad, a paint app your coding agent can drive (source-available) ([klad-app/klad](https://github.com/klad-app/klad)) | Hacker News | [78 points, 31 comments](https://news.ycombinator.com/item?id=50454951) | Klad is a source‑available drawing application designed for collaborative use between coding agents and humans. |
| [Launch HN: Pomerado (YC F26) – Turn any website into an MCP for agents](https://news.ycombinator.com/item?id=50455811) | Hacker News | [53 points, 42 comments](https://news.ycombinator.com/item?id=50455811) | — |
| [Modern Web Guidance 1.0: The web platform expertise your coding agent is missing](https://developer.chrome.com/blog/modern-web-guidance-v1) | Hacker News | [30 points, 7 comments](https://news.ycombinator.com/item?id=50460398) | Modern Web Guidance 1.0 supplies expert‑vetted web platform skills, browser compatibility data, and codebase modernization guidance for AI coding agents. |
| [Subagents Conwidered Harmful](https://nikvdp.com/notes/subagents-considered-harmful/) | Hacker News | [24 points, 8 comments](https://news.ycombinator.com/item?id=50450268) | — |
| [I gave an agent a lakehouse and control of my garden](https://jatorre.github.io/garden/) | Hacker News | [5 points, 0 comments](https://news.ycombinator.com/item?id=50415162) | The author gave an AI agent control of a garden equipped with eleven sensors, a camera, and an old phone, producing a €60 lettuce. |
| [A Small Laptop Is a Full Build Kit: Bootstrapping with a Chromebook, Claude, and GitHub](https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16) | Dev.to | [22 reactions, 7 comments](https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16) | The author bootstrapped a development environment using a Chromebook, Claude, and GitHub, demonstrating a small laptop can serve as a full build kit. |
| [The Limits That Don't Limit](https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j) | Dev.to | [19 reactions, 4 comments](https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j) | The post outlines four guards against runaway agents, noting that a 5‑second deadline actually took 21.9 seconds to enforce. |

===== 2026-11-12 · AI Models & Labs =====

## New on OpenRouter

| Model | Listed | Context | Summary |
| :--- | :--- | :--- | :--- |
| [Baidu: ERNIE-5.5-Flash-Preview (free)](https://openrouter.ai/baidu/ernie-5.5-flash-preview:free) `baidu/ernie-5.5-flash-preview:free` | 2026-11-10 | 1M | ERNIE 5.5 Flash Preview is the latest foundation model in the ERNIE family with comprehensive improvements in coding, agentic capabilities, knowledge work, and deep research. |

Nothing new from Anthropic and OpenAI or OpenRouter's stealth models today.

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Gemini Decisions API](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/) | Hacker News | [375 points, 120 comments](https://news.ycombinator.com/item?id=50456791) | Google launched the Gemini Decisions API, powered by the Gemini Decision model for fast, calibrated multimodal decisions. |
| [Faster Retrieval for Better, More Efficient RAG](https://machinelearning.apple.com/research/faster-retrieval) | Hacker News | [190 points, 36 comments](https://news.ycombinator.com/item?id=50455633) | Apple researchers describe accelerating retrieval‑augmented generation by leveraging Maximum Inner Product Search (MIPS). |
| [Tools for exploring the souls of large language models](https://oshea00.github.io/posts/tinygpt-visualizer/) | Hacker News | [43 points, 12 comments](https://news.ycombinator.com/item?id=50458434) | The article explores LLM internals using the TinyGPT Visualizer to decode model behavior. |
| [The Surprising Effectiveness of Deleting Weights in LLM Post-Training](https://arxiv.org/abs/2611.10866) | Hacker News | [30 points, 0 comments](https://news.ycombinator.com/item?id=50447363) | Research shows zeroing fewer than 0.05 % of an LLM’s weights matches full fine‑tuning performance across three post‑training regimes. |
| Compress any LLM 3x in one click, near-lossless, in under 50 MB RAM ([NeuraCryption/SPECTRA](https://github.com/NeuraCryption/SPECTRA)) | Hacker News | [24 points, 1 comment](https://news.ycombinator.com/item?id=50450729) | — |
| [Anthropic Targets $1.4T Valuation in IPO](https://www.bloomberg.com/news/videos/2026-11-10/anthropic-targets-1-4-trillion-valuation-in-ipo-video) | Hacker News | [16 points, 1 comment](https://news.ycombinator.com/item?id=50445463) | — |
| [Writing a SIGGRAPH paper from scratch](https://alexandergoslin.me/writing-a-siggraph-paper-from-scratch/) | Lobste.rs | [8 points, 0 comments](https://lobste.rs/s/793ecg/writing_siggraph_paper_from_scratch) | The author built a learned procedural terrain generator called Terrain Diffusion using a single RTX 3090 Ti GPU. |

===== 2026-11-12 · AI Policy =====

## EU

| Date | Source | Title | Stage | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2026-11-10 | EUR-Lex | [Commission Implementing Regulation (EU) 2026/2487 of 10 November 2026 laying down rules for the application of Regulation (EU) 2024/1689 of the European Parliament and of the Council as regards the es…](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) | Regulation adopted | The Commission adopted an implementing regulation establishing rules for the establishment, development, implementation, operation and supervision of AI regulatory sandboxes under the AI Act. |

## Netherlands

| Date | Source | Title | Stage | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2026-11-10 | Tweede Kamer | [Motie van de leden Mathlouti en Struijs over inzicht in de AI-toepassingen die de politie al inzet en de mogelijkheden ọm deze op te schalen](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24707&did=2026D57026) | — | Dutch MPs Mathlouti and Struijs submitted a motion during the 2027 budget debates calling for transparency on AI applications already used by the police and their potential for scaling. |

## News & commentary

| Date | Source | Title | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-11 | Politico Europe | [EU needs a system to respond to AI incidents, Finland and Estonia say](https://www.politico.eu/article/eu-needs-a-system-to-respond-to-ai-incidents-finland-and-estonia-say/?utm_source=RSS_Feed&utm_medium=RSS&utm_campaign=RSS_Syndication) | Finland and Estonia called for EU-level arrangements to respond to serious AI incidents in a letter ahead of a European leaders' meeting on AI. |

## Coming up

Deadlines and dates in the next 30 days.

| Date | Source | Item |
| :--- | :--- | :--- |
| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |

===== 2026-11-12 · Data Engineering =====

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

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

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-11 | Microsoft Fabric | [Use OneLake as native storage for Azure Databricks (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks-Preview/ba-p/5377939) | OneLake external-location support for Unity Catalog is generally available in Microsoft Fabric with OneLake Security enabled by default for Azure Databricks Storage items, while on the Azure Databricks side the feature is in preview; supported Unity Catalog-managed data can be stored directly in OneLake. |
| 2026-11-11 | BigQuery | [You can specify an optional principal property on BigQuery reservation assignments to route queries to specific reservations based on the identity of the user, service account, or third-party identity…](https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026) | An optional principal property can be specified on BigQuery reservation assignments to route queries to specific reservations based on the identity of the user, service account, or third-party identity executing the job; supported only in BigQuery Enterprise and Enterprise Plus editions and generally available. |
| 2026-11-11 | Microsoft Fabric | [The next chapter for CI/CD in Fabric Warehouse (Preview)](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/The-next-chapter-for-CI-CD-in-Fabric-Warehouse-Preview/ba-p/5401222) | CI/CD in Fabric Warehouse now includes DacFx for a common schema deployment foundation, pre- and post-deployment scripts for changes beyond schema, and Warehouse Item Definition APIs for automation, creating a more complete CI/CD lifecycle. |

*Also new:* [Project caps (also known as scheduling policies) let you limit maximum slots and concurrency per project within a BigQuery reservation (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026)

## Open-source stack

### DuckDB

- **News:** [Show HN: NoDOM high performance WASM UI kit for DuckDB-WASM](https://news.ycombinator.com/item?id=50452389)
- **News:** [Local Analytics Doesn't Need a Database Server](https://duckdb.org/2026/11/12/local-analytics-without-a-database-server.html) describes how DuckDB enables serverless local analytics, powering SQLRooms for interactive data, visualizations, and AI-assisted analysis on the user's machine.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

Nothing new from Snowflake ([Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)) today.

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-11 | [Agents Are Code Too: What I Learned Shipping a Cortex Agent Through Azure DevOps](https://medium.com/snowflake/agents-are-code-too-what-i-learned-shipping-a-cortex-agent-through-azure-devops-fab3adae29e8) | Snowflake on Medium | The author built a Cortex Agent for the finance domain and moved it through sbx, dev, uat, and prod with the same discipline applied to other Snowflake objects, learning that an agent you cannot rebuild from Git is a prototype regardless of answer quality. |

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| TimeNet: Open-source data infrastructure for Temporal Foundation Models ([OpenTSLM/TimeNet](https://github.com/OpenTSLM/TimeNet)) | Hacker News | [49 points, 8 comments](https://news.ycombinator.com/item?id=50443264) | TimeNet offers open‑source infrastructure to download and explore time‑series datasets in a unified format. |
| [JSON vs. jsonb in Postgres: size and speed, measured](https://now-next.nl/en/insights/postgresql-json-vs-jsonb-measured/) | Hacker News | [29 points, 0 comments](https://news.ycombinator.com/item?id=50452394) | Benchmarks of JSON versus jsonb in PostgreSQL 17/18 reveal jsonb can be 23 % smaller or 41 % larger depending on document shape. |
| Show HN: I created a library for correctly using SQLite in Go programs ([cattlecloud/litesql](https://github.com/cattlecloud/litesql)) | Hacker News | [21 points, 1 comment](https://news.ycombinator.com/item?id=50453176) | The author released litesql, a Go library for convenient and performant SQLite3 database access. |
| [Part 5: The Control That Protected an Empty Bucket](https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j) | Dev.to | [18 reactions, 4 comments](https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j) | This installment continues a public series building an HL7 v2 to FHIR R4 interoperability service. |

===== 2026-11-13 · AI Agents =====

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) adds Code Mode (experimental opt-in for JavaScript tool calls), plugin version validation via `engines["claude-code"]`, TypeScript hook type checking in `claude plugin validate`, `.docx` support for Artifact uploads, and new environment variables including `CLAUDE_CODE_DISABLE_AGENT_PROGRESS_SUMMARIES` and `CLAUDE_CODE_RESUME_HINT_COMMAND`.
- **Hot issue:** [#109446](https://github.com/anthropics/claude-code/issues/109446): an issue says 2.1.323 silently removed `subagentStatusLine` with no replacement, hiding per-subagent context, cost, model, effort, and status. (regression; 2 comments, 2 👍; +4 in the last 24h)
- **News:** [Anthropic carelessly killed a Claude Code feature users built on, no warning](https://news.ycombinator.com/item?id=50477704) reports the regression removing `subagentStatusLine` without warning or migration path.
- **Hot issue:** [#84862](https://github.com/anthropics/claude-code/issues/84862): [FEATURE] Passkey (WebAuthn) sign-in for Claude accounts, across every surface (37 comments, 185 👍; +11 since 2026-11-11)

### OpenAI Codex

- **Release:** [rust-v0.168.0](https://github.com/openai/codex/releases/tag/rust-v0.168.0) adds model provider browsing in Sessions, TUI workspace split view via `features.tui_workspace`, audio recording attachments, animated GIF generation via `features.image_generation_animation`, fullscreen image previews in tmux on Ghostty/Kitty, and `tui.notification_method = "osc777"` for terminal notifications.

### Pi

- **News:** [Pi GPUI: A native GUI for the pi coding agent, built with Rust and GPUI.](https://news.ycombinator.com/item?id=50464872) announces a native GUI for the pi coding agent built with Rust and GPUI for macOS and Linux.

### Oh My Pi

- **Release:** [v18.20.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.0) breaks `secrets.yml` regex rules (now Rust `regex` patterns, no lookarounds/backreferences, `(?P …)` marks redacted part), changes secret placeholders to four camelCased words without `$$` delimiters, makes model output from placeholders byte-identical on replay, and removes `task.file` and `taskFile` field.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Foundation Models framework](https://developer.apple.com/foundation-models-framework/) | Hacker News | [181 points, 26 comments](https://news.ycombinator.com/item?id=50474361) | Apple released a native Swift API called Foundation Models for integrating any large language model directly into apps. |
| [Show HN: AgentRun – open-source, Self-improving Managed Agents](https://github.com/Parcha-ai/agentrun/blob/main/README.md) | Hacker News | [90 points, 25 comments](https://news.ycombinator.com/item?id=50471650) | AgentRun is an open-source platform that adds self-improvement, durable execution, and a control plane on top of existing agent harnesses. |
| [Durable Execution Agents](https://martinfowler.com/articles/durable-execution-agents.html) | Hacker News | [5 points, 0 comments](https://news.ycombinator.com/item?id=50462904) | — |
| [MCP Is Dead Simple. And That's Exactly the Problem](https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811) | Dev.to | [97 reactions, 61 comments](https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811) | The article examines Model Context Protocol (MCP), questioning what it is and whether its simplicity masks deeper implementation problems. |
| [Your MCP Servers Are Silently Draining Your Context Window: The Hidden Cost of Tool-Heavy AI Agents](https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl) | Dev.to | [42 reactions, 16 comments](https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl) | Attaching dozens of MCP tools to agents degrades LLM reasoning and inflates API costs, while small TypeScript micro-tools can mitigate the issue. |

===== 2026-11-13 · AI Models & Labs =====

## New on OpenRouter

| Model | Listed | Context | Summary |
| :--- | :--- | :--- | :--- |
| [Google: Gemini 4 Hydrogen](https://openrouter.ai/google/gemini-4-hydrogen) `google/gemini-4-hydrogen` | 2026-11-12 | 1M | Gemini 4 Hydrogen is a high-efficiency workhorse model of the Gemini 4 family from Google, built for high-throughput agentic workflows, coding, and multi-model routing at lower cost and latency. |
| [Google: Gemini 4 Hydrogen (batch)](https://openrouter.ai/google/gemini-4-hydrogen:batch) `google/gemini-4-hydrogen:batch` | 2026-11-12 | 1M | Gemini 4 Hydrogen (batch) is a high-efficiency workhorse model of the Gemini 4 family from Google, built for high-throughput agentic workflows, coding, and multi-model routing at lower cost and latency. |

Nothing new from Anthropic and OpenAI or OpenRouter's stealth models today.

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Anthropic IPO](https://ipo.anthropic.com/us/) | Hacker News | [887 points, 848 comments](https://news.ycombinator.com/item?id=50465829) | Anthropic has filed for an initial public offering and published a founders’ letter detailing the move. |
| [Gemini 4 Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) | Hacker News | [505 points, 321 comments](https://news.ycombinator.com/item?id=50471431) | Google introduced Gemini 4 Hydrogen, positioning it as a daily driver model for agentic workflows. |
| [Gemini 4 Hydrogen and Orchestrator](https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/) | Hacker News | [374 points, 101 comments](https://news.ycombinator.com/item?id=50472260) | Google rolled out Gemini 4 Hydrogen inside Google Antigravity alongside a new Orchestrator model dropdown that pairs Hydrogen with another system. |
| I'm making LLMs work on small and old devices ([hyperionaidev/smolmaxxing](https://github.com/hyperionaidev/smolmaxxing/)) | Hacker News | [327 points, 120 comments](https://news.ycombinator.com/item?id=50468888) | The author is maximizing the ability to run various LLMs on the smallest and oldest devices possible. |
| [Chinese frontier AI models carry the fingerprint of export-controlled GPUs](https://unemploymentlabs.com/checkpoint-forensics) | Hacker News | [246 points, 66 comments](https://news.ycombinator.com/item?id=50474883) | Forensic analysis of public model releases found evidence that DeepSeek, Moonshot AI, MiniMax, and Ant Group used NVIDIA Blackwell GPUs despite export restrictions. |
| [Edge0-145B: Frontier AI Capabilities on Your Own Computer](https://edge0.ai/blog/introducing-edge0-145b-frontier-ai-capabilities-on-your-own-computer) | Hacker News | [183 points, 44 comments](https://news.ycombinator.com/item?id=50475713) | Edge0-145B is an open-source 145-billion-parameter model for local coding, reasoning, and agent tasks with no cloud token fees. |
| [libreagi - save OS models](https://libreagi.com/) | Lobste.rs | [12 points, 6 comments](https://lobste.rs/s/7c4iar/libreagi_save_os_models) | LibreAGI operates a private BitTorrent tracker where members archive open models most at risk of disappearing. |

===== 2026-11-13 · AI Policy =====

## EU

| Date | Source | Title | Stage | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2026-11-12 | EUR-Lex | [Communication from the Commission – Guidelines on the implementation of the transparency obligations for certain AI systems under Article 50 of Regulation (EU) 2024/1689 (the AI Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005) | Preparatory document | The European Commission published preparatory guidelines on implementing transparency obligations for certain AI systems under Article 50 of the AI Act. |

## Netherlands

| Date | Source | Title | Stage | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2026-11-12 | Tweede Kamer | [Gewijzigde motie van het lid Beckerman over onderzoeken hoe kunstenaars en makers beter beschermd kunnen worden tegen AI (t.v.v. 37020-XIII-28)](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24997&did=2026D57726) | — | The Dutch House of Representatives adopted a motion by MP Beckerman calling for research into better protection of artists and creators against AI. |

## News & commentary

| Date | Source | Title | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-12 | CSET | [AI Kill Switches: What Policymakers Should Know](https://cset.georgetown.edu/article/ai-kill-switches-what-policymakers-should-know/) | CSET released a brief outlining potential implementations of AI kill switches across the AI stack and key takeaways for policymakers. |
| 2026-11-12 | Politico US | [Nonprofits sue Anthropic, Google, and other tech giants to freeze the AI arms race](https://www.politico.com/news/2026/11/12/nonprofits-sue-ai-companies-over-existential-risk-01161965) | Nonprofits filed a lawsuit in San Francisco seeking to halt the development of more advanced and self‑improving AI models by five major tech companies. |

## Coming up

Deadlines and dates in the next 30 days.

| Date | Source | Item |
| :--- | :--- | :--- |
| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |

===== 2026-11-13 · Data Engineering =====

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-12 | 🤖 [ABAC DENY policies support AI securables and attachment to individual objects (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#abac-deny-policies-support-ai-securables-and-attachment-to-individual-objects-beta) | DENY policies now support FOR clause for model services, model provider services, MCP services, agent services, and skills, and ON clause attachment directly to tables, volumes, functions, models, secrets, model services, model provider services, MCP services, agent services, and skills. |
| 2026-11-11 | [Standalone pipelines on serverless general compute are now generally available](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#standalone-pipelines-on-serverless-general-compute-are-now-generally-available) | Enables creating and refreshing standalone materialized views and streaming tables from notebooks on serverless general compute using `spark.sql()` or Python pipelines decorators. |
| 2026-11-11 | [Partial schema inference for Python Lakeflow pipelines](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#partial-schema-inference-for-python-lakeflow-pipelines) | In an upcoming release, Python Lakeflow pipelines will support partial schema inference via the `override_schema` argument on `table`, `materialized_view`, or `create_streaming_table` to control specific columns while inferring the rest from query output. |
| 2026-11-10 | [Budget alerts can now trigger webhooks (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#budget-alerts-can-now-trigger-webhooks-beta) | Budgets can now trigger webhooks when spend thresholds are exhausted, routing budget events to incident, ticketing, or automation tools. |
| 2026-11-09 | 🤖 [AI Functions Asynchronous API (Beta)](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-functions-asynchronous-api-beta) | Enables running `ai_parse_document`, `ai_extract`, or `ai_classify` asynchronously on up to 50,000 requests from a JSONL file in a Unity Catalog volume; workspace admins must enable the AI Functions Asynchronous API preview from the Previews page. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-13 | [Many-to-many relationships in semantic views (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-semantic-views-many-to-many-preview) | Many-to-many relationships in semantic views are in preview, allowing modeling many-to-many relationships between two logical tables. |
| 2026-11-11 | [Semantic view materializations (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-semantic-view-materializations-ga) | Semantic view materializations enable pre-aggregating frequently queried dimensions and metrics in a semantic view to improve query performance. |
| 2026-11-10 | [INTEGRATIONS view in ACCOUNT_USAGE (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-account-usage-integrations-view-preview) | The ACCOUNT_USAGE schema now includes an INTEGRATIONS view in preview returning a row per integration with metadata for API, catalog, external access, notification, security, and storage integrations including type, category, and enabled status. |
| 2026-11-10 | 🤖 [Geospatial maps in Snowflake CoWork (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-cowork-maps-preview) | Geospatial maps in Snowflake CoWork preview enable interactive plotting of latitude/longitude points, H3 hexagons, or GEOGRAPHY and GEOMETRY shapes with pan and zoom when queries return geographic data. |

*Also new:* [Snowflake Data Clean Rooms updates](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcr)

### Snowpark Python

- **Release:** [v1.57.0](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.57.0) changes `Session.debug` to no longer depend on AST collection, simplifies `DataFrameReader.documents()` to always parse with `AI_PARSE_DOCUMENT` in `LAYOUT` mode, and makes `configure_development_features` update only explicitly passed features.
- **Release:** [v1.57.0](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.57.0) adds `Session.semantic_view()` (PuPr) for querying semantic views, introduces experimental `Session.debug` with `eager_schema_validation`, `trace_sql_errors_to_dataframe`, and `dataframe_trace_on_error`, and adds try_to_* conversion functions in `functions.py`.

**Quiet today:** [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-12 | BigQuery | [You can track table-level data lineage in Knowledge Catalog for BigQuery pipelines (GA)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026) | Table-level data lineage tracking in Knowledge Catalog for BigQuery pipelines is generally available. |
| 2026-11-12 | BigQuery | 🤖 [BigQuery generative AI functions now support the gemini-4-hydrogen model](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026) | BigQuery generative AI functions now support the `gemini-4-hydrogen` model, which is generally available. |
| 2026-11-12 | Azure updates | [[In preview] Public Preview: SQL performance monitoring for Azure SQL Managed Instance](https://azure.microsoft.com/updates?id=574158) | Microsoft-managed performance monitoring for Azure SQL Managed Instance is in public preview, replacing reliance on custom scripts and disconnected monitoring tools. |

## Open-source stack

### dbt Core

- **Release:** [v1.12.7](https://github.com/dbt-labs/dbt/releases/tag/v1.12.7) fixes a regression where batch metadata freshness failures skipped all selected sources, now falling back to per-source checks; scopes relation-cache population to selected schemas so `--cache-selected-only` is honored in `compile`/`show`/`docs generate`; and corrects `statically_parse_unrendered_config` stringifying list/dict values that caused false `state:modified` positives.
- **Release:** Adds the `builtin_macros_prefer_overrides` behavior flag (default false) to prefer adapter overrides over base dbt implementations for builtin macros; accepts dbt v2-only `info_schema`, `check-paths`, and `checks` keys in `dbt_project.yml` with a note they are v2-specific; and ignores unsupported manifest node types (e.g., dbt v2 checks) when loading `--state`/`--defer` manifests.

### Dagster

- **Release:** [1.13.30](https://github.com/dagster-io/dagster/releases/tag/1.13.30) drops Python 3.10 support, now requiring Python 3.11+. The asset catalog and graph stop polling health data for hidden assets, reducing load in large workspaces. A new `dagster-cloud deployment copy-materializations` command copies latest materializations between deployments preserving timestamps.

### dlt

- **News:** [dltHub brings data and meaning into ClickHouse](https://dlthub.com/blog/dlthub-clickhouse-ontology-agents) announces a private preview where dltHub writes business definitions into ClickHouse table and column comments so the ClickHouse Agent can give trusted answers.
- **News:** [dltHub on ClickHouse: the ClickHouse Agent walkthrough](https://dlthub.com/blog/clickhouse-agent-ontology-walkthrough) demonstrates loading GitHub data, definitions, and an ontology into ClickHouse so the ClickHouse Agent can answer questions like how much CI is waste.

### Polars

- **News:** [Polars Nanook benchmarked against Databricks Photon](https://pola.rs/posts/polars-nanook-vs-databricks/) compares Polars Nanook performance against Databricks Spark with the Photon engine.

### Great Expectations

- **Release:** [1.25.0](https://github.com/great-expectations/great_expectations/releases/tag/1.25.0) enables row conditions to compare two columns of the same row across pandas, Spark, and SQL backends using `Column` comparison operators. SQL metrics and Expectations (distinct-values, median, quantile, etc.) now work with row conditions instead of failing on SQLAlchemy 2.1.
- **Release:** On SQL backends, rows containing NULLs in compared columns are now counted as unexpected for `ExpectColumnPairValuesAToBeGreaterThanB`, `ExpectColumnPairValuesToBeInSet`, `ExpectMulticolumnSumToEqual`, and `ExpectCompoundColumnsToBeUnique`, matching pandas behavior. The `zstandard>=0.25.0` minimum is removed from the `spark-connect` extra, allowing installation alongside older `zstandard` pins like Airflow 3.0.x constraints.

**Quiet today:** [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Prefect](https://github.com/PrefectHQ/prefect), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Trino](https://github.com/trinodb/trino), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

## News & discussion

| Date | Post | Source | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-12 | [Operational Ontology on Snowflake: From Business Meaning to Governed AI Action](https://medium.com/snowflake/operational-ontology-on-snowflake-from-business-meaning-to-governed-ai-action-6f3ef270d3f2) | Snowflake on Medium | The author describes a reference architecture for AI agents to reason over operational state, simulate decisions, execute governed actions, and verify outcomes, using a distribution center example where an agent identifies failed packing station PB-04 and traces affected orders. |
| 2026-11-12 | [Streamlit’s Floor, React’s Ceiling, Inside Snowflake](https://medium.com/snowflake/streamlits-floor-react-s-ceiling-inside-snowflake-c78f90e39dc8) | Snowflake on Medium | The author builds Streamlit in Snowflake (SiS) apps and created RiSiS (React in Streamlit in Snowflake) to add interactions like cross-filtering charts on hover and drag that SiS reruns cannot support, enabling an analyst to filter EMEA data across all charts by pointing at a bar. |

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Turning a 22-year-old Postgres type-confusion primitive into RCE](https://mehmetince.net/part-3-6-how-i-ended-up-turning-a-22-year-old-postgresql-type-confusion-primitive-into-rce-cve-2026-6460/) | Hacker News | [167 points, 30 comments](https://news.ycombinator.com/item?id=50471761) | The author discovered a 22-year-old zero-day type-confusion vulnerability in PostgreSQL core that enables remote code execution. |
| [PostgreSQL 18.7, 17.12, 16.16, 15.20, 14.25, and 19 RC 2 Released](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/) | Hacker News | [104 points, 14 comments](https://news.ycombinator.com/item?id=50467763) | The PostgreSQL Global Development Group released updates for all supported versions including 18.7, 17.12, 16.16, 15.20, 14.25, and 19 RC 2. |
| [Tell HN: Cast('abc' AS INTEGER) returns 0 in SQLite](https://news.ycombinator.com/item?id=50468864) | Hacker News | [3 points, 5 comments](https://news.ycombinator.com/item?id=50468864) | — |

===== 2026-11-14 · AI Agents =====

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixes a security issue in zstd-compressed response decoding, resolves subagent model handling bugs in worktrees and bare repos, fixes session resumption losing recent turns after unclean exits, and corrects shell commands running in deleted working directories.
- **Hot issue:** [#109508](https://github.com/anthropics/claude-code/issues/109508): users report a 403 "Attention Required" Cloudflare error when running `/login` on macOS, preventing authentication and loading user info; gained significant attention in the last 24 hours. (7 comments, 7 👍; +14 in the last 24h)
- **Hot issue:** [#108679](https://github.com/anthropics/claude-code/issues/108679): users report new Claude Code sessions on macOS get "Browser extension is not connected" for Chrome integration since 2026-11-07, while existing sessions continue working; retrying and restarts do not resolve it. (regression; 5 comments, 3 👍; +3 since 2026-11-12)
- **News:** [Elevated errors on claude.ai, Claude Code, and platform.claude.com](https://news.ycombinator.com/item?id=50481187) — status page confirms elevated errors across Claude services.
- **News:** [Anthropic upgrades Claude Code Projects to run parallel AI workers](https://news.ycombinator.com/item?id=50492141) — new beta experience enables parallel AI workers in Claude Code Projects.
- **News:** [Claude Code and Codex reverse engineered my 1994 Jeep's ECU over a $3 Arduino](https://news.ycombinator.com/item?id=50463399) — title only.

### OpenAI Codex

- **Release:** [rust-v0.169.0](https://github.com/openai/codex/releases/tag/rust-v0.169.0) adds multiple side-chat tabs in the terminal workspace, search across older tasks, collapsible turn details in transcripts, custom model provider management from the terminal, Ctrl+S to save diagnostic ZIPs locally, and Cloud connection support for images, model selection, and conversation archiving on macOS/Linux; fixes `codex exec` trust handling, plan handoff on "Yes, clear context and implement", Windows sandbox path handling, and pasted image orientation on macOS.
- **Hot issue:** [#61348](https://github.com/openai/codex/issues/61348): users request a continuous engineering workspace across ChatGPT, Work, and Codex with durable, verifiable project experience instead of disposable tasks; framed as a cross-product UX/product-design request. (14 comments, 0 👍; +13 in the last 24h)
- **News:** [Claude Code and Codex reverse engineered my 1994 Jeep's ECU over a $3 Arduino](https://news.ycombinator.com/item?id=50463399) — title only.

### OpenCode

- **Release:** [v2.3.0](https://github.com/anomalyco/opencode/releases/tag/v2.3.0) makes background subagents the default (return immediately, run concurrently, report when idle), quiets transcripts by summarizing tool calls into collapsible activity rows, adds jump-to-prompt navigation (Cmd+Alt+G), adds experimental MCP events and shell timeout background flags, moves local Windows shell commands to the process daemon, and adds LM Studio decision-model support.

### DeepSeek Harness

- **Prerelease:** [dsh-v0.2.2-rc.3](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.3) adds an experimental DeepSeek chat import plugin to bring past conversations from the DeepSeek App or web into the workspace, and fixes Windows desktop in-app updates that could fail and prevent automatic reopening.

### Hermes Agent

- **Hot issue:** [#62336](https://github.com/NousResearch/hermes-agent/issues/62336): an issue says terminal environment snapshots in `tools/environments/base.py` capture all environment variables — including credential-bearing vars from `bws run --` and Bitwarden Secrets Manager — to persistent plaintext files at `cache/terminal/hermes-snap-*.sh`, exposing secrets to any process with filesystem read access. (type/security; 19 comments, 0 👍; +3 in the last 24h)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [Oh My Pi](https://github.com/can1357/oh-my-pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Claude Meetings](https://claude.com/resources/articles/claude-meetings) | Hacker News | [87 points, 66 comments](https://news.ycombinator.com/item?id=50491097) | The new Claude Meetings integration adds the Claude AI assistant to video calls, letting it take notes, answer questions, and create docs and whiteboards during the meeting. |
| [AI agents have a big problem: Nobody wants to let them in](https://www.pcworld.com/article/3283946/ai-agents-have-a-big-problem-nobody-wants-to-let-them-in.html) | Hacker News | [15 points, 6 comments](https://news.ycombinator.com/item?id=50482661) | — |
| Show HN: Log every LLM call with tokens, cost, latency, and time to first token ([garritfra/llmtee](https://github.com/garritfra/llmtee)) | Hacker News | [10 points, 2 comments](https://news.ycombinator.com/item?id=50451943) | The Show HN project provides a self‑hosted LLM proxy that records every call’s token usage, cost, latency, and time‑to‑first‑token. |
| [A VS Code extension to turn ANY free chatbot website into an AI agent (kind of)](https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb) | Dev.to | [41 reactions, 80 comments](https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb) | The author describes a VS Code extension that can turn any free chatbot site into an AI agent, noting the recent free promo for Qoder, Alibaba’s AI IDE. |
| [How To Review Pull Requests with Kiro CLI and GitHub Actions](https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b) | Dev.to | [30 reactions, 5 comments](https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b) | The article explains how to review pull requests using Kiro CLI’s headless mode together with GitHub Actions. |

===== 2026-11-14 · AI Models & Labs =====

## Lab announcements

| Date | Lab | Post | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-13 | Anthropic | [Building strong safety evaluations](https://www.anthropic.com/research/building-strong-safety-evaluations) | Anthropic published research on building strong safety evaluations to help researchers create sound safety assessments that measure a model's propensity to cause or contribute to harm. |
| 2026-11-13 | OpenAI | [Introducing Chatgpt Wallet](https://openai.com/index/introducing-chatgpt-wallet/) | — |

## New on OpenRouter

| Model | Listed | Context | Summary |
| :--- | :--- | :--- | :--- |
| [inclusionAI: Ling 3.2 Flash (free)](https://openrouter.ai/inclusionai/ling-3.2-flash:free) `inclusionai/ling-3.2-flash:free` | 2026-11-13 | 1M | inclusionAI's Ling 3.2 Flash is a hybrid reasoning model that accepts text and image input. |

Nothing new from OpenRouter's stealth models today.

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Claude Is Down](https://status.claude.com/history) | Hacker News | [198 points, 175 comments](https://news.ycombinator.com/item?id=50481220) | The post points to Claude’s status page, which publishes the service’s incident and scheduled maintenance history. |
| [OpenAI disbands its robotics team as its general models start running robots](https://fortune.com/2026/11/13/openai-disbands-robotics-team-as-its-general-models-start-running-robots/) | Hacker News | [155 points, 66 comments](https://news.ycombinator.com/item?id=50487184) | OpenAI has disbanded its dedicated robotics team, reassigning its researchers to other groups as its general models begin to control robots. |
| [Perplexity Decider v1.3: Training, eval, and use cases](https://www.perplexity.ai/hub/blog/perplexity-decider) | Hacker News | [115 points, 21 comments](https://news.ycombinator.com/item?id=50488464) | — |
| [Unsloth Qwen3.8-27B Quantizations – Dynamic v3.1 Update](https://unsloth.ai/docs/models/qwen3.8) | Hacker News | [75 points, 11 comments](https://news.ycombinator.com/item?id=50491980) | The Unsloth guide shows how to run Qwen3.8 quantized models, including the 27‑billion‑parameter version, on a local machine. |
| [Torrents are perfect for model distribution](https://pirateface.co/articles/every-ai-model-should-be-a-torrent) | Hacker News | [37 points, 16 comments](https://news.ycombinator.com/item?id=50464055) | — |
| [Hugging Face CEO vows to keep fighting for open-source AI](https://techcrunch.com/2026/11/12/hugging-face-ceo-vows-to-keep-fighting-for-open-source-ai-after-jensen-huangs-exit/) | Hacker News | [21 points, 2 comments](https://news.ycombinator.com/item?id=50471673) | Hugging Face’s CEO vowed to continue advocating for open‑source AI after Huang’s departure, amid scrutiny of Nvidia’s $12.9 billion acquisition. |
| [e-means: 10x faster k-means at equal loss](https://e-means.github.io/) | Lobste.rs | [4 points, 0 comments](https://lobste.rs/s/rnmylu/e_means_10x_faster_k_means_at_equal_loss) | The e‑means project claims a 10× speedup for k‑means clustering while maintaining the same loss. |

===== 2026-11-14 · Data Engineering =====

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-19 | Azure Databricks | [Gemini 3.6 Flash will be retired on November 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) | API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide. |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

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

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-12 | [Larger application package versions on AWS and Azure](https://docs.snowflake.com/en/release-notes/2026/10_41) | Maximum file size in application package version increased from 5 GB to 150 GiB; maximum application package version stage size increased from 5 GiB to 150 GiB; applies to AWS and Azure accounts including government regions and AWS China. |
| 2026-11-11 | [Select per-user quota users by role (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-role-scope) | Define per-user quota users by roles (in addition to user tags and names); role selects directly granted users, keeping quota scope current as roles are granted or revoked, including identity provider-provisioned roles. |
| 2026-11-11 | [Programmatic notifications for Trust Center findings (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-trust-center-programmatic-notifications-ga) | — |

*Also new:* [Convert Tableau workbooks to Streamlit in Snowflake apps with CoCo (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-tableau-to-streamlit-preview) · [DCM Projects PLAN privilege (Preview)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcm-plan-privilege-preview) · [AI_TRANSCRIBE delivers improved transcription accuracy](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-ai-transcribe-accuracy-improvements)

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

## Azure / Fabric & GCP

| Date | Source | Item | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-13 | BigQuery | [BigQuery connections to MySQL, Oracle, and PostgreSQL are now available and can be used to run MySQL federated queries, Oracle federated queries, and PostgreSQL federated queries (Preview)](https://docs.cloud.google.com/bigquery/docs/release-notes#November_13_2026) | BigQuery connections to MySQL, Oracle, and PostgreSQL enable MySQL, Oracle, and PostgreSQL federated queries; features are in Preview. |
| 2026-11-13 | Microsoft Fabric | [Use OneLake as native storage for Azure Databricks](https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks/ba-p/5377939) | OneLake external-location support for Azure Databricks Unity Catalog generally available in Microsoft Fabric with OneLake Security enabled by default for Azure Databricks Storage items; on Azure Databricks side the feature is in preview; supported Unity Catalog-managed data can be stored directly in OneLake. |

## Open-source stack

### Apache Airflow

- **Release:** First stable releases of the TypeScript, Java, and Go SDKs ([ts-sdk/1.0.0](https://github.com/apache/airflow/releases/tag/ts-sdk/1.0.0), [java-sdk/1.0.0](https://github.com/apache/airflow/releases/tag/java-sdk/1.0.0), [go-sdk/v1.0.0](https://github.com/apache/airflow/releases/tag/go-sdk/v1.0.0)) enable native DAG authoring in those languages with task dependencies, task groups, and variable APIs.

### Prefect

- **Release:** Prefect 3.9.3 adds search and ordering to the automations page, aligns flow run timeline ticks to local time boundaries, and fixes bugs in async generator flows, parallel task kwargs handling, and transaction commit ordering.

**Quiet today:** [dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Dagster](https://github.com/dagster-io/dagster), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| 🔓 [CVE-2026-6460 – Arbitrary Code Execution in Postgres](https://www.postgresql.org/support/security/CVE-2026-6460/) | Hacker News | [12 points, 9 comments](https://news.ycombinator.com/item?id=50484044) | — |

===== 2026-11-15 · AI Agents =====

## Coding Agents & Assistants

### Claude Code

- **News:** [What a task costs on Opus 5.5](https://news.ycombinator.com/item?id=50503241) breaks down per-task token costs on Opus 5.5 and shows which settings affect the bill.
- **News:** [Show HN: Cyberviber – a $15 touch screen to show which Claude session needs you](https://news.ycombinator.com/item?id=50496642) describes a 2.4″ ESP32 display that lists running Claude Code sessions and focuses a terminal on tap.

### OpenAI Codex

- **Hot issue:** [#61489](https://github.com/openai/codex/issues/61489): users report that with `features.enable_request_compression` on, highly compressible request bodies receive a bare HTTP 400 instead of the documented 413, and Codex never falls back to uncompressed requests. (12 comments, 0 👍; +11 in the last 24h)

### Oh My Pi

- **Release:** [v18.20.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.1)–[v18.20.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.2) changes `lsTree()` to return `{ path, mode }` objects (breaking), fixes context cost estimates, Vertex AI Gemini v1beta1 support, Amazon Bedrock region selection, Gemini 4 long responses, Cursor conversation context, Bedrock streaming retries, Claude account recovery, OpenRouter reasoning preservation, Xiaomi MiMo auth, and Perplexity sign-in; adds Antigravity CLI ACP provider with managed install, Google sign-in, host tools, and retained conversations, plus Antigravity models for Gemini, Claude, and GPT-OSS with selectable thinking levels.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: Agweb – a browser for agents that stays out of your way ([paul-nameless/agweb](https://github.com/paul-nameless/agweb)) | Hacker News | [92 points, 27 comments](https://news.ycombinator.com/item?id=50497147) | Agweb is a browser designed for AI agents that avoids focus stealing, has a minimal footprint, and displays all tabs in a single view. |
| [Claude asked to renumber pages deletes professor's syllabus, year of notes](https://www.tomshardware.com/tech-industry/artificial-intelligence/rogue-claude-ai-tasked-with-renumbering-pages-accidentally-deletes-law-professors-entire-syllabus-one-year-of-lecture-notes-youre-right-to-be-angry-i-deleted-your-files-through-my-own-carelessness-humbled-agent-admits) | Hacker News | [45 points, 63 comments](https://news.ycombinator.com/item?id=50499114) | A University of Chicago lecturer reported that a Claude AI agent accidentally deleted his entire syllabus and a year of lecture notes. |
| [Agile Manifesto for Agents](https://debarshibasak.github.io/readables/blogs/agent-first-development) | Hacker News | [28 points, 6 comments](https://news.ycombinator.com/item?id=50496562) | The "Agile Manifesto for Agents" proposes twelve commandments for coordinating AI agents in teams, emphasizing scope understanding and bounded work delivery. |
| [Show HN: Shotoku – Local-first action governance and budget caps for AI agents](https://www.shotoku.dev/) | Hacker News | [9 points, 1 comment](https://news.ycombinator.com/item?id=50496705) | Shotoku provides local-first governance for AI agents with budget caps, spending limits, human approval requirements, and a tamper-evident audit trail enforced before any payment. |
| [Show HN: Open-Source Version of Cyclon: Phone where AI is the interface?](https://opencyclone.vercel.app/) | Hacker News | [8 points, 1 comment](https://news.ycombinator.com/item?id=50493213) | An open-source Cyclon alternative lets users turn their existing phone into an AI interface without purchasing dedicated hardware. |
| [Composio vs Nango vs Scalekit: What Changes When Your Agent Goes to Production](https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2) | Dev.to | [29 reactions, 3 comments](https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2) | The author compares Composio, Nango, and Scalekit for taking AI agents to production, highlighting security review challenges after successful demos. |
| [Your Agent Needs a Schema, Not a Better Prompt](https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm) | Dev.to | [22 reactions, 9 comments](https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm) | The author argues that AI agents require structured schemas rather than improved prompts to function reliably in production. |

===== 2026-11-15 · AI Models & Labs =====

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Generative AI uses more energy on non-English text](https://news.umich.edu/generative-ai-uses-more-energy-on-non-english-text/) | Hacker News | [196 points, 103 comments](https://news.ycombinator.com/item?id=50441444) | — |
| [DeepSeek V4 Pro 0813](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813) | Hacker News | [25 points, 1 comment](https://news.ycombinator.com/item?id=50492302) | DeepSeek V4 Pro 0813 is a 1.7 trillion parameter text generation model available for download and exploration on Hugging Face. |
| [End‑to‑End 4‑Bit Training](https://thinkingmachines.ai/blog/end-to-end-4-bit-training/) | Hacker News | [24 points, 1 comment](https://news.ycombinator.com/item?id=50490618) | End-to-end 4-bit training reduces memory usage and accelerates GPU computation for LLMs, though it increases rounding aggressiveness due to fewer representable values. |
| [Ex-OpenAI researcher finds Blackwell signatures in open-weight models](https://twitter.com/willdepue/status/2120992457630326841) | Hacker News | [18 points, 1 comment](https://news.ycombinator.com/item?id=50494668) | An ex-OpenAI researcher claims forensic evidence shows four Chinese AI labs (DeepSeek, Moonshot, MiniMax, Ant Group) built models using export-restricted NVIDIA Blackwell chips. |
| [Gemini Decision 1 is Free on Google AI Studio](https://aistudio.google.com/docs/decisions-api) | Hacker News | [15 points, 1 comment](https://news.ycombinator.com/item?id=50457853) | Google AI Studio now offers free access to Gemini Decision 1, marketed as the fastest route from prompt to production. |
| [Anthropic says a key AI safety alarm has been triggered, days before its IPO](https://finance.yahoo.com/markets/article/anthropic-says-a-key-ai-safety-alarm-has-been-triggered-days-before-its-ipo-171519615.html) | Hacker News | [15 points, 11 comments](https://news.ycombinator.com/item?id=50456668) | — |
| [You could have invented transformers from memory](https://alexwang.ai/posts/associative-memory/) | Lobste.rs | [3 points, 0 comments](https://lobste.rs/s/u2h9as/you_could_have_invented_transformers) | The author's post "You could have invented transformers from memory" posits that every transformer layer functions as a memory store. |

===== 2026-11-15 · AI Policy =====

## News & commentary

| Date | Source | Title | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-14 | CSET | [Convergent Interests: How America Could Undermine Its Own AI Advantage](https://cset.georgetown.edu/article/convergent-interests-how-america-could-undermine-its-own-ai-advantage/) | CSET published a piece arguing that convergent political, commercial, and ideological pressures could undermine U.S. AI leadership, urging policymakers to regulate responsibly without stifling innovation. |

## Coming up

Deadlines and dates in the next 30 days.

| Date | Source | Item |
| :--- | :--- | :--- |
| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |

===== 2026-11-15 · Data Engineering =====

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-19 | Azure Databricks | [Gemini 3.6 Flash will be retired on November 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) | API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide. |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-09 | [Databricks Runtime 19: November 9, 2026](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-9-2026) | Fixes real-time mode reservation liveness and occupied-slot accounting when tasks execute through Aether. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

## Snowflake

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-11 | [Override per-user quota limits for specific users (General availability)](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-limit-overrides) | Enables setting per-user, per-cycle credit limit overrides on a per-user quota with an optional expiration date. |

### Apache Polaris

- **Release:** [apache-polaris-1.9.0](https://github.com/apache/polaris/releases/tag/apache-polaris-1.9.0) publishes signed source and binary distributions, a Helm chart, Docker images (`apache/polaris:1.9.0` for the server and `apache/polaris-admin:1.9.0` for the admin tool), and Maven artifacts to Maven Central with SHA-512 checksums.

**Quiet today:** [Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)

## Azure / Fabric & GCP

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-11 | [You can use the JSON_FLATTEN function to extract all non-array values that are either directly in the input JSON value or children of one or more consecutively nested arrays in the input JSON value](https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026) | Enables using the `JSON_FLATTEN` function to extract non-array values directly in JSON or from consecutively nested arrays. |

## Releases this week

| Project | Version | Date | Summary |
| :--- | :--- | :--- | :--- |
| [OpenMetadata](https://github.com/open-metadata/OpenMetadata) | [2.0.8-release](https://github.com/open-metadata/OpenMetadata/releases/tag/2.0.8-release) | 2026-11-13 | Fixes pipeline deletion to use Airflow's supported cleanup path, fixes Glue test connection to probe only configured databases and tables, fixes Hex ingestion to build working source links and create data models with SQL-cell column lineage, fixes Hex table and column lineage to terminate at the Hex data model, enables Power BI empty listings to soft-delete stale entities, and enables SSIS connections to accept Azure Data Lake Storage containers. |

Nothing new from Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

===== 2026-11-16 · AI Agents =====

## Coding Agents & Assistants

### Claude Code

- **News:** [I run multiple Claude Code accounts on one Mac](https://news.ycombinator.com/item?id=50506993) describes how to run multiple Claude Code accounts on a single Mac.

### Oh My Pi

- **Release:** [v18.20.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.3) removes the public `isXdDevicePath` export from `providers/cursor-pi-args` and renames `tab.clickAt()`'s `clickCount` option to `count` to match `tab.click()`. Browser viewport screenshot coordinates now use displayed image coordinates when scaled; pass `css: true` to provide viewport CSS pixels explicitly.
- **Release:** The release adds opt-in `mnemopi.recallRelevance` (`off`, `auto`, or `on`; default `off`) to filter automatic memory recall for task relevance, path-scoped entries for `bash.patterns` and `bashInterceptor.patterns` resolved per working directory, and `bash.allowedEnvVars` with per-rule `env` lists for explicitly named environment-variable prefixes. Subagents now preserve `@upstream` provider pinning on inherited models, and new `--no-judge`, `--no-spotlight`, and `--offline` options restrict auxiliary services to the active model's provider or disable cross-provider services.
- **Release:** Compound bash approval prompts now show each command segment separately, distinguishing allowed segments from those requiring approval, and per-rule TTSR `repeatMode` frontmatter (`once`, `after-gap`, or `always`) overrides the global repeat policy. The `seance` agent, `/seance` command, and the task tool's `sourceSession` parameter are removed. Rate-limit handling for Mistral and other OpenAI-compatible providers is fixed so requests with no available allowance fail immediately with an actionable error suggesting a model or plan change.

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

## Agent Tooling

### herdr

- **News:** [Show HN: Canban – Kanban and Workflow and Herdr Workbench for CLI Agents](https://news.ycombinator.com/item?id=50508535) introduces Canban as a combination of Kanban and the herdr workbench for CLI agents.

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [Conductor](https://github.com/microsoft/conductor)

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Agentic AI Designs an Analog Synthesizer](https://cpldcpu.github.io/2026/11/14/touchsynth/) | Hacker News | [12 points, 1 comment](https://news.ycombinator.com/item?id=50512933) | An analog monophonic synthesizer with ~200 components and a transistor ladder filter was largely designed by Claude Opus 5.5. |
| [A 27-byte telemetry response nobody reads freezes Claude Desktop every two days](https://blog.dfb.sh/blog/claude-desktop-freeze/) | Hacker News | [9 points, 1 comment](https://news.ycombinator.com/item?id=50499446) | The author debugged a 1.5 TiB core dump over two months to find that an unread 27-byte telemetry response caused Chromium to leak file descriptors, freezing Claude Desktop on Linux every couple of days. |
| [Show HN: Attest – Test what AI agents do, not just what they say](https://attest-framework.github.io/) | Hacker News | [6 points, 0 comments](https://news.ycombinator.com/item?id=50509107) | Attest is a framework that tests AI agents by verifying tool calls and state changes, supporting replay of recorded model responses in CI. |
| [I Told My Agent Who Sent the Message. It Mostly Stopped Saying We Were Talking.](https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8) | Dev.to | [22 reactions, 11 comments](https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8) | The author found that adding a sender identifier line to messages largely stopped their AI agent from incorrectly claiming it was conversing with the user. |
| [Your AI Coding Agent Wrote a 600-Word Summary. What It Skipped Is in the Fine Print.](https://dev.to/debashish_ghosal/your-ai-coding-agent-wrote-a-600-word-summary-what-it-skipped-is-in-the-fine-print-1h7d) | Dev.to | [20 reactions, 9 comments](https://dev.to/debashish_ghosal/your-ai-coding-agent-wrote-a-600-word-summary-what-it-skipped-is-in-the-fine-print-1h7d) | The author examines how AI coding agents produce lengthy summaries while omitting critical details in the fine print. |

===== 2026-11-16 · AI Models & Labs =====

## New on OpenRouter

| Model | Listed | Context | Summary |
| :--- | :--- | :--- | :--- |
| [Qwen: Qwen4 Max](https://openrouter.ai/qwen/qwen4-max) `qwen/qwen4-max` | 2026-11-16 | 1M | Qwen4 Max is a model in Alibaba's Qwen4 series that accepts text, image, and video input and returns text. |

Nothing new from Anthropic and OpenAI or OpenRouter's stealth models today.

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Qwen4-Max](https://qwen.ai/blog?id=qwen4-max) | Hacker News | [314 points, 106 comments](https://news.ycombinator.com/item?id=50513215) | Qwen4-Max is released with capabilities including chatbot, image/video understanding, image generation, document processing, web search, tool use, and artifacts. |
| [Understanding Positional Embeddings in Modern LLMs](https://magazine.sebastianraschka.com/p/understanding-positional-embeddings) | Hacker News | [225 points, 27 comments](https://news.ycombinator.com/item?id=50506376) | An article explains the methods modern LLMs use to represent token positions through positional embeddings. |
| [What thousands of conversations look like inside a language model](https://operator0x.com/field-notes/qwen-conversation-state-space/) | Hacker News | [119 points, 29 comments](https://news.ycombinator.com/item?id=50481321) | The author mapped thousands of conversations inside Qwen to visualize how language structures emerge in the model. |
| [Parents pay $75k for Alpha's AI school. Half of its students missed math target](https://fortune.com/2026/11/14/alpha-school-ai-students-tuition-learning-goals/) | Hacker News | [64 points, 62 comments](https://news.ycombinator.com/item?id=50509953) | Fortune reports that only 42% of Alpha School students met the 2x learning target in math and reading, while parents pay $75k tuition and 2,600 public school students use the software. |
| [New 'Access to Justice' Benchmark: Leading AI Models Miss Critical Legal Details](https://epyhia.com/new-access-to-justice-benchmark-finds-leading-ai-models-miss-critical) | Hacker News | [10 points, 1 comment](https://news.ycombinator.com/item?id=50497161) | Vals AI and NextLadder Ventures released a benchmark evaluating 23 models on 252 simulated legal-aid conversations, with no model reaching the 80% threshold. |
| [AI Companies Crack Down on the Coolest Thing People Were Doing with AI](https://www.404media.co/reverse-engineer-anything-ai-companies-crack-down-on-the-coolest-thing-people-were-doing-with-ai/) | Hacker News | [10 points, 4 comments](https://news.ycombinator.com/item?id=50441618) | 404 Media reports that AI companies are restricting user modifications, pushing the future of device hacking toward local and open-weight models. |

===== 2026-11-16 · Data Engineering =====

## Action required

| Date | Platform | Item | What to do |
| :--- | :--- | :--- | :--- |
| 2026-11-19 | Azure Databricks | [Gemini 3.6 Flash will be retired on November 19, 2026](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) | API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide. |
| 2026-11-30 | Azure Databricks | [Upcoming end of life for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) | The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. |
| 2027-01-31 | BigQuery | [Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields](https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026) | Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema. |
| 2027-02-04 | Azure Databricks | [Zhipu AI GLM 5.2 is scheduled for retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) | Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance. |
| 2027-08-19 | Azure Databricks | [All Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) | After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline. |

## Databricks

| Date | Item | Summary |
| :--- | :--- | :--- |
| 2026-11-12 | 🤖 [Use Genie One as your Chrome new tab page (Beta)](https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#use-genie-one-as-your-chrome-new-tab-page-beta) | The Genie One Chrome extension lets users open Genie One from their Azure Databricks workspace directly in new Chrome tabs, using existing sign-in and permissions for a single chosen workspace to ask questions, search tools, or open dashboards without navigating to the workspace first. |

**Quiet today:** [Delta Lake](https://github.com/delta-io/delta), [delta-rs](https://github.com/delta-io/delta-rs), [Unity Catalog](https://github.com/unitycatalog/unitycatalog), [MLflow](https://github.com/mlflow/mlflow), [Databricks CLI](https://github.com/databricks/cli), [dbt-databricks](https://github.com/databricks/dbt-databricks), [Terraform provider for Databricks](https://github.com/databricks/terraform-provider-databricks)

Nothing new from Snowflake ([Snowpark Python](https://github.com/snowflakedb/snowpark-python), [Snowflake Connector for Python](https://github.com/snowflakedb/snowflake-connector-python), [Apache Polaris](https://github.com/apache/polaris), [Terraform provider for Snowflake](https://github.com/snowflakedb/terraform-provider-snowflake)), Azure / Fabric & GCP or Open-source stack ([dbt Core](https://github.com/dbt-labs/dbt), [SQLMesh](https://github.com/SQLMesh/sqlmesh), [Apache Airflow](https://github.com/apache/airflow), [Dagster](https://github.com/dagster-io/dagster), [Prefect](https://github.com/PrefectHQ/prefect), [dlt](https://github.com/dlt-hub/dlt), [Apache Iceberg](https://github.com/apache/iceberg), [PyIceberg](https://github.com/apache/iceberg-python), [DuckDB](https://github.com/duckdb/duckdb), [Polars](https://github.com/pola-rs/polars), [Trino](https://github.com/trinodb/trino), [Great Expectations](https://github.com/great-expectations/great_expectations), [Soda Core](https://github.com/sodadata/soda-core), [OpenLineage](https://github.com/OpenLineage/OpenLineage), [OpenMetadata](https://github.com/open-metadata/OpenMetadata)) today.

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: db-branch – database branches in seconds for AI agents and CI, via ZFS ([db-branch/db-branch](https://github.com/db-branch/db-branch)) | Hacker News | [39 points, 10 comments](https://news.ycombinator.com/item?id=50506940) | db-branch provides instant MySQL database branching using ZFS clones with ProxySQL routing across VMs for AI agents and CI. |
| [Please Implement A Quorum Database](https://transactional.blog/talk/please-implement-a-quorum-database) | Lobste.rs | [10 points, 0 comments](https://lobste.rs/s/hgicaq/please_implement_quorum_database) | The author argues that leaderless replication for quorum databases is both fun and practical to implement. |

===== 2026-11-16 · Trends (weekly tables) =====

## Agents & coding tools

### 🚀 Agent & Coding Tool Radar

*New tools (🆕: created or listed in the last 14 days) first, then each source's top movers; 🔥 also on last week's Trends page. OpenRouter: the app's rank this week / this month among OpenRouter apps, its tokens in the last 7 days. npm: downloads in the last 7 days. OpenRouter and npm "vs previous week": against the row's figure on last week's page, none when it was not there. GitHub: total stars (stars gained in the last 7 days, % on a week ago).*

| Tool | Source | Signal | Summary |
| :--- | :--- | :--- | :--- |
| [Bitbison triage](https://bitbison.io/) | OpenRouter | 🆕 week #100 / month —, 44.7B tokens/week | Bitbison triage analyzes build activity to catch supply chain attacks before release and lets you block releases that fail your security checks. |
| 🔥 [Kilo Code](https://kilocode.ai/) | OpenRouter | week #5 / month #5, 7.03T tokens/week (+46% vs previous week) | Kilo Code is an open-source AI coding agent working across VS Code, JetBrains, and CLI with agentic workflows to help developers ship code faster. |
| [@sma1lboy/rove](https://www.npmjs.com/package/@sma1lboy/rove) | npm | 28,686 downloads/week | @sma1lboy/rove is an agentic development environment (ADE) for your terminal that runs Claude Code, Codex, Copilot and more side by side in isolated worktrees, handing tasks to each other. |
| 🔥 [Strix](https://strix.ai/) | OpenRouter | week #9 / month #12, 2.56T tokens/week (+45% vs previous week) | Strix are open-source AI hackers that find and validate vulnerabilities in your code, APIs, and infrastructure, and open fix PRs. |
| [OpenHands](https://docs.all-hands.dev/) | OpenRouter | week #14 / month #18, 1.00T tokens/week | OpenHands is an AI coding agent that can run commands, browse the web, and call APIs. |
| 🔥 [Hermes Agent](https://hermes-agent.nousresearch.com/) | OpenRouter | week #3 / month #4, 13.02T tokens/week (+5.1% vs previous week) | Hermes Agent is an open-source, self-improving AI agent by Nous Research that runs persistently with memory across sessions and builds reusable skills from experience, with 40+ built-in tools including web search, browser automation, and vision. |
| [@earendil-works/pi-coding-agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) | npm | 6,307,903 downloads/week | @earendil-works/pi-coding-agent is a coding agent CLI with read, bash, edit, write tools and session management. |
| 🔥 [Claude Code](https://claude.ai/code) | OpenRouter | week #4 / month #3, 10.80T tokens/week (+7.5% vs previous week) | Claude Code is Anthropic's agentic coding tool that reads your entire codebase, plans and executes changes across files, runs tests, and iterates on failures from natural language prompts. |
| 🔥 [pi](https://pi.dev/) | OpenRouter | week #6 / month #6, 4.00T tokens/week (-4.8% vs previous week) | pi is described as a coding agent that is yours among many coding agents. |
| [Codex](https://openai.com/codex/) | OpenRouter | week #7 / month #7, 3.42T tokens/week | Codex is a coding agent that helps you build and ship with AI. |
| 🔥 [OpenClaw](https://openclaw.ai/) | OpenRouter | week #8 / month #8, 2.69T tokens/week (-46% vs previous week) | OpenClaw is an open-source AI agent that connects to your messaging apps and takes real actions on your behalf, from running commands and browsing the web to managing files and sending emails. |
| 🔥 [omp](https://omp.sh/) | OpenRouter; npm | week #11 / month #10, 2.13T tokens/week (-36% vs previous week); 295,519 downloads/week (+34% vs previous week) | omp is a coding agent CLI with read, bash, edit, write tools and session management. |

### 🧑‍💻 Coding Agents

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [google/elephant-goldfish-model](https://github.com/google/elephant-goldfish-model) | Python | 19,934 (+5,060, +34%) | google/elephant-goldfish-model is an open-source plugin for designing and reviewing software with agents. |
| 🔥 [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code) | TypeScript | 30,560 (+1,446, +5%) | QwenLM/qwen-code is an open-source AI coding agent that lives in your terminal. |
| 🔥 [superplanehq/superplane](https://github.com/superplanehq/superplane) | Go | 10,058 (+826, +8.9%) | superplanehq/superplane is an open source factory for one-shot engineering. |
| 🔥 [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | TypeScript | 4,290 (+678, +19%) | PurpleDoubleD/locally-uncensored is an all-in-one local AI studio for desktop with chat, image and video generation, and a coding agent in one free, open source app for Windows and Linux requiring no Docker, no terminal, no cloud. |
| 🔥 [Gentleman-Programming/gentle-shell](https://github.com/Gentleman-Programming/gentle-shell) | TypeScript | 2,680 (+597, +29%) | Gentleman-Programming/gentle-shell is a Pi-native workspace for AI-assisted development bringing parallel coding agents, live tasks, Git diffs, persistent memory, and permission controls into one terminal interface powered by Gentle AI and Organic Driven Development (ODD). |
| 🔥 [WhiteTowerAI/ohmygame](https://github.com/WhiteTowerAI/ohmygame) | TypeScript | 2,252 (+483, +27%) | WhiteTowerAI/ohmygame is an open-source studio for making games with AI providing a game canvas and bring-your-own-key model in one app. |
| 🔥 [JetBrains/thinkrail](https://github.com/JetBrains/thinkrail) | TypeScript | 8,286 (+281, +3.5%) | JetBrains/thinkrail is an agentic IDE that gets better every time you use it. |
| 🔥 [unstablebuild/rune](https://github.com/unstablebuild/rune) | Go | 1,795 (+206, +13%) | unstablebuild/rune is a fast, GPU-accelerated, full-featured IDE and terminal multiplexer suitable for both automatic and manual programming. |

### 🧰 Agent Harnesses & Frameworks

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| 🔥 [ccch1mneyyy/dsh-Go](https://github.com/ccch1mneyyy/dsh-Go) | Dart | 24,052 (+7,483, +45%) | ccch1mneyyy/dsh-Go is dsh-go — DeepSeek Harness that runs on your phone and can remote control your computer. |
| [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | Go | 52,353 (+2,682, +5.4%) | alibaba/open-code-review is a secure, fast, efficient hybrid architecture code review tool battle-tested at Alibaba's scale with deterministic pipelines + LLM Agent, precise line-level comments, and built-in multi-language ruleset for NPE, thread-safety, XSS, SQL injection. |
| [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop) | JavaScript | 19,231 (+1,612, +9.1%) | dataelement/dsh-desktop is DSHDesktop — DeepSeek Harness Desktop version. |
| 🔥 [lobehub/lobehub](https://github.com/lobehub/lobehub) | TypeScript | 85,598 (+1,119, +1.3%) | lobehub/lobehub is LobeHub — Super-Agents on Your Team that add super-agents to the chats your team already uses, taking on work by themselves and getting better every week. |
| 🔥 [FailproofAI/failproofai](https://github.com/FailproofAI/failproofai) | TypeScript | 9,087 (+843, +10%) | FailproofAI/failproofai provides observability and enforcement for AI agent harnesses, capturing every run and runtime reliability with policy enforcement. |
| 🔥 [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | TypeScript | 81,835 (+537, +0.7%) | ruvnet/ruflo is the original agent harness for deploying intelligent multi-player swarms, coordinating autonomous workflows, and building conversational AI systems with adaptive memory, self-learning intelligence, federation, vector RAG integration, and native Claude Code / Codex / Hermes integration. |
| [converge-ai-labs/agent-foundation](https://github.com/converge-ai-labs/agent-foundation) | Python | 1,290 (+382, +42%) | converge-ai-labs/agent-foundation is a13n for building, running, and managing AI agents at scale on your own infrastructure with a built-in harness, durable execution, multi-provider support, and a management console. |
| 🔥 [heymrun/heym](https://github.com/heymrun/heym) | Python | 1,684 (+149, +9.7%) | heymrun/heym builds agentic systems to run with confidence, orchestrating agents, automating business processes, inspecting every execution, and keeping humans in control, deployable on your own infrastructure. |

### 🕸️ Multi-Agent & Orchestration

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [pingdotgg/t3code](https://github.com/pingdotgg/t3code) | TypeScript | 61,812 (+8,984, +17%) | pingdotgg/t3code is the best way to control Claude Code, Codex and more from any computer or phone. |
| 🔥 [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | TypeScript | 114,185 (+1,787, +1.6%) | paperclipai/paperclip is the open-source app everyone uses to manage agents at work. |
| [Tencent/LoopForge](https://github.com/Tencent/LoopForge) | Go | 1,797 (+1,632, +989%) | Tencent/LoopForge provides self-hosted workflows for coding-agent delivery orchestrating CodeBuddy, Codex and Claude Code with scripts and human approval gates, including local workflows for coding assistants. |
| 🔥 [agent-of-empires/agent-of-empires](https://github.com/agent-of-empires/agent-of-empires) | Rust | 4,549 (+658, +17%) | agent-of-empires/agent-of-empires manages multiple Claude Code, OpenCode agents from either TUI or Web for easy mobile access, also supporting Mistral Vibe, Codex CLI, Gemini CLI, Pi.dev, Copilot CLI, Factory Droid Coding. |
| 🔥 [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator) | TypeScript | 14,771 (+471, +3.3%) | OrchestratorInc/agent-orchestrator plans, runs and supervises fleets of agents from task to merged PR with desktop (macOS, Windows, Linux) + iPhone & Android apps supporting Claude Code, Codex & 35+ coding agents. |
| 🔥 [sandbox-quantum/switch](https://github.com/sandbox-quantum/switch) | Python | 4,537 (+283, +6.7%) | sandbox-quantum/switch provides open-source AI teammates in Slack, Teams, Discord, Telegram and Mattermost, self-hosted with any agent harness and any model. |
| [zeronsh/zeron](https://github.com/zeronsh/zeron) | Rust | 3,689 (+209, +6%) | zeronsh/zeron is a native control plane for Claude Code, Codex, Cursor, Devin and other coding agents. |
| [open-mercato/cezar](https://github.com/open-mercato/cezar) | TypeScript | 1,062 (+96, +9.9%) | open-mercato/cezar is an open-source orchestrator and ADE for running Claude Code, Codex, OpenCode, Pi and other AI coding agents in parallel locally or 24/7 on your own server. |

### 🔌 Agent Tooling

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [anthropics/skills](https://github.com/anthropics/skills) | Python | 195,496 (+6,077, +3.2%) | anthropics/skills is a public repository for Agent Skills. |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Rust | 51,734 (+4,217, +8.9%) | vercel-labs/agent-browser is a browser automation CLI for AI agents. |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | JavaScript | 118,033 (+3,889, +3.4%) | addyosmani/agent-skills provides production-grade engineering skills for AI coding agents. |
| [backnotprop/plannotator](https://github.com/backnotprop/plannotator) | TypeScript | 12,030 (+1,719, +17%) | backnotprop/plannotator is the workspace to stay in the loop and on top of agents — shape, decide, plan, annotate, review code, share with team, and send all feedback to agents with one click. |
| 🔥 [microsoft/TokenEconomizer](https://github.com/microsoft/TokenEconomizer) | Python | 6,704 (+1,375, +26%) | microsoft/TokenEconomizer provides experience-driven black-box cost control for coding agents. |
| 🔥 [haydenschmitty/floorplan](https://github.com/haydenschmitty/floorplan) | JavaScript | 4,553 (+1,280, +39%) | haydenschmitty/floorplan provides an interactive, plain-English map of your codebase drawn by Claude or Codex to see how your app actually fits together. |
| 🔥 [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | Python | 6,051 (+1,213, +25%) | kajisho5/ffmpeg-skill is a local video editor for coding agents with 42 FFmpeg tools, a machine-readable contract, and an MCP server for Claude Code, Cursor and Codex supporting cut, captions, reframe, loudness, platform exports with no cloud and no API keys. |
| 🔥 [ZiChuanLan/agent-purge](https://github.com/ZiChuanLan/agent-purge) | JavaScript | 1,850 (+363, +24%) | ZiChuanLan/agent-purge enables one persona across many coding agents by replacing or injecting system prompts across codex, claude, opencode, grok, omp, hermes, pi, zcode with a local web console. |

### 🤖 Other Agents

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot) | TypeScript | 23,639 (+5,463, +30%) | milind-soni/OpenMausBot is an open-source Grok Bot alternative with a virtual machine that bots can use. |
| [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | Python | 72,593 (+4,548, +6.7%) | ZhuLinsen/daily_stock_analysis is an LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs. |

## Skills: PRs and requests this week

### Open PRs worth watching
- **#2223** – Fixes `skill-creator` packaging to return a clean error (and `None`) when the output path is a file or nests under a file, instead of a Python traceback. [PR #2223](https://github.com/anthropics/skills/pull/2223)
- **#2219** – Adds Origin/Host/Content-Type checks to the eval-viewer feedback endpoint, preventing cross-origin overwrites of review data (part 2 of #1982). [PR #2219](https://github.com/anthropics/skills/pull/2219)
- **#2211** – Makes `mcp-builder` evaluation report incomplete runs (max_tokens, refusal, etc.) instead of scoring truncated output or crashing. [PR #2211](https://github.com/anthropics/skills/pull/2211)
- **#2199** – Enforces the spec rule that a skill's `name` must match its parent directory name; previously a mismatch produced a spec-violating `.skill` archive silently. [PR #2199](https://github.com/anthropics/skills/pull/2199)
- **#1903** – Streams PDF-to-image conversion page-by-page to bound memory; previously `convert_from_path` loaded all rendered pages at once. [PR #1903](https://github.com/anthropics/skills/pull/1903)

### Requests
- **#2220** – Reduce the 33 KB `skill-creator/SKILL.md` entrypoint so it fits within ~15 KiB agent context budgets. [Issue #2220](https://github.com/anthropics/skills/issues/2220)
- **#2207** – Bring Agent SDK into `claude-api` scope or provide a fetchable reference; the current linked page is too large to read in one call. [Issue #2207](https://github.com/anthropics/skills/issues/2207)
- **#2201** – Fix `mcp-builder` agent loop to handle parallel `tool_use` blocks and distinguish stop reasons (max_tokens, refusal) from final answers. [Issue #2201](https://github.com/anthropics/skills/issues/2201)

### Takeaway
The week's activity centers on hardening skill packaging, evaluation correctness, and endpoint security while trimming oversized entrypoints and updating deprecated MCP integrations.

## Models

### Hugging Face trending

*Ranked by likes gained in the last 7 days; 🔥 also on last week's Trends page; quantised copies of a release share its row.*

| # | Model | Likes (total) | Downloads (30 days) | Summary |
| ---: | :--- | ---: | ---: | :--- |
| 1 | [MiniMaxAI/MiniMax-H3-Image](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image) | 1,207 | 571,067 | Text-to-image model, other license. |
| 2 | 🔥 [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (+ [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)) | 20,144 | 6,547,772 | 27B image-text-to-text model, Apache-2.0 license. |
| 3 | 🔥 [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) | 12,091 | 2,754,355 | Image-to-video model, other license. |
| 4 | [Comfy-Org/MiniMax-H3-Image](https://huggingface.co/Comfy-Org/MiniMax-H3-Image) | 420 | 1,973,388 | Text-to-image model, other license. |
| 5 | [Zyphra/ZONOS3-Mini](https://huggingface.co/Zyphra/ZONOS3-Mini) | 409 | 39,862 | Text-to-speech model, Apache-2.0 license. |
| 6 | [thinkingmachines/Inkling-2-Small](https://huggingface.co/thinkingmachines/Inkling-2-Small) | 349 | 7,329 | 594B image-text-to-text model, Apache-2.0 license. |
| 7 | [higurashi-ai/Haru-4B](https://huggingface.co/higurashi-ai/Haru-4B) | 329 | 2,098 | 5.2B audio-to-audio model, Apache-2.0 license. |
| 8 | 🔥 [speridlabs/idol](https://huggingface.co/speridlabs/idol) | 2,372 | 33,423 | Image-to-3d model, Apache-2.0 license. |
| 9 | 🔥 [moonshotai/Kimi-K3.1-Pro](https://huggingface.co/moonshotai/Kimi-K3.1-Pro) | 2,112 | 46,766 | 2.7T image-text-to-text model, other license. |
| 10 | 🔥 [NousResearch/Arete-27B](https://huggingface.co/NousResearch/Arete-27B) | 615 | 7,497 | 27B text-generation model, Apache-2.0 license. |
| 11 | [Edge0/Edge0-145B-NVFP4](https://huggingface.co/Edge0/Edge0-145B-NVFP4) | 301 | 41,606 | 145B text-generation model, other license. |
| 12 | 🔥 [black-forest-labs/flux-3-image-klein-comfy](https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy) | 3,261 | 1,182,267 | Image-to-image model, other license. |

## Research

| Paper | Summary |
| :--- | :--- |
| [Hibana: Fast Agentic Inference on Unified-Memory Devices](http://arxiv.org/abs/2611.10469v1) | Hibana is an inference engine for unified-memory devices that co-optimizes model representation, memory management, and decoding strategy for fast agentic inference. |
| [Code as Explanations: Executable and Verifiable LLM Explanations](http://arxiv.org/abs/2611.14704v1) | Code as Explanations proposes executable code explanations that explain LLM behavior across datasets and enable automatic verification. |
| [Don't Just Trust Your Memory: Evidence-Linked Memory Reduces Memory-Induced Degradation in LLM Agents](http://arxiv.org/abs/2611.14320v1) | Don't Just Trust Your Memory introduces WikiTrace, an evidence-linked memory framework that reduces memory-induced degradation by linking lessons to their source trajectories. |
| [Mitigating Agentic Deception via Evaluation-Side Partially Observable Games](http://arxiv.org/abs/2611.12835v1) | Mitigating Agentic Deception via Evaluation-Side Partially Observable Games addresses agentic deception by mitigating evaluation-side partial observability in free-form language space. |
| [Actor, Judge, or Teacher? Understanding Decision Models in Long-Horizon Agents](http://arxiv.org/abs/2611.17167v1) | Actor, Judge, or Teacher? Understanding Decision Models in Long-Horizon Agents compares decision models and LLMs as actors, judges, and teachers on ALFWorld and WebShop to assess whether poor actors can still teach well. |
| [LiveAsset: Learning Intent Assets from Corrective Interactions for Agent Runtime Control](http://arxiv.org/abs/2611.11560v1) | LiveAsset learns intent assets from corrective interactions to enable runtime control of LLM agents aligning with user preferences. |
| [When Experience Becomes a Backdoor: Poisoning Self-Evolving LLM Agents via Failure-Aware Task Optimization](http://arxiv.org/abs/2611.10542v1) | When Experience Becomes a Backdoor: Poisoning Self-Evolving LLM Agents via Failure-Aware Task Optimization studies task-level backdoor attacks where poisoned evolution tasks compromise self-evolving LLM agents. |
| [OverServe: Resource Amplification Attacks on SaaS Agents via Tool--Prompt Co-Design](http://arxiv.org/abs/2611.14808v1) | OverServe presents a multi-agent framework that constructs resource amplification attacks on SaaS agents by co-designing tool prompts. |
| [Can LLM Agents Organize Their Own Memory?](http://arxiv.org/abs/2611.11929v1) | Can LLM Agents Organize Their Own Memory? introduces SoMem, a self-organized memory framework where agents autonomously summarize, group, and revise linked documents. |
| [PACE: Keeping the Right Tokens in the KV Cache Is Not Enough for Long-Horizon LLM Agents](http://arxiv.org/abs/2611.10240v1) | PACE demonstrates that keeping needed tokens in the KV cache is insufficient for long-horizon agents, showing accuracy drops from 93% to 64% in 100K-token coding sessions on Qwen3-8B with a 2,048-token budget despite over 99% needed tokens retained. |

## Most discussed

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [What unshare -n leaves behind: building a boundary for an AI recon agent](https://dev.to/gnomeman4201/what-unshare-n-leaves-behind-building-a-boundary-for-an-ai-recon-agent-75b) | Dev.to | [15 reactions, 22 comments](https://dev.to/gnomeman4201/what-unshare-n-leaves-behind-building-a-boundary-for-an-ai-recon-agent-75b) | The author investigates what Linux's unshare -n leaves exposed while building a sandbox boundary for an AI reconnaissance agent that passed 13 isolation tests. |
| [Stop Asking LLMs to Do Math: Client-Side Functions in Flutter GenUI with bloc_signals](https://dev.to/gde/stop-asking-llms-to-do-math-client-side-functions-in-flutter-genui-with-blocsignals-23bh) | Dev.to | [16 reactions, 16 comments](https://dev.to/gde/stop-asking-llms-to-do-math-client-side-functions-in-flutter-genui-with-blocsignals-23bh) | The author explains why client-side functions are critical for Generative UI, showing how bloc_signals_genui converts catalog functions into 0ms synchronous reactive signals in Flutter. |
| [Can't Beat Free: Gemma 4 31B on AMD Token Lab, with a Local Chat Page and an ADK Agent](https://dev.to/gde/cant-beat-free-gemma-4-31b-on-amd-token-lab-with-a-local-chat-page-and-an-adk-agent-c5b) | Dev.to | [36 reactions, 13 comments](https://dev.to/gde/cant-beat-free-gemma-4-31b-on-amd-token-lab-with-a-local-chat-page-and-an-adk-agent-c5b) | The author demonstrates running Gemma 4 31B via AMD Token Lab, a free OpenAI-compatible API on AMD GPUs, with a local chat page, terminal client, and ADK agent. |

===== 2026-11-16 · Trends (weekly tables): models =====

## OpenRouter usage

Top models by tokens (prompt + completion) on OpenRouter on 2026-11-15, one day's snapshot. Last week: the model's rank on last week's page, new when it was not ranked there.

| # | Model | Tokens | Last week |
| ---: | :--- | ---: | :---: |
| 1 | [deepseek/deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) | 59.23T | 1 |
| 2 | [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) | 18.12T | 4 |
| 3 | [deepseek/deepseek-v4.1-flash-20260910](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20260910) | 15.55T | 2 |
| 4 | [z-ai/glm-5.3-flash-20260826](https://openrouter.ai/z-ai/glm-5.3-flash-20260826) | 11.90T | 3 |
| 5 | [openai/gpt-6-luna-20260922](https://openrouter.ai/openai/gpt-6-luna-20260922) | 7.85T | 5 |
| 6 | [anthropic/claude-opus-5.5-20260921](https://openrouter.ai/anthropic/claude-opus-5.5-20260921) | 6.98T | 7 |
| 7 | [stepfun/step-5-preview-20261008](https://openrouter.ai/stepfun/step-5-preview-20261008) | 6.41T | 6 |
| 8 | [xiaomi/mimo-v2.6-flash-20260921](https://openrouter.ai/xiaomi/mimo-v2.6-flash-20260921) | 4.23T | new |
| 9 | [z-ai/glm-5.3-20260816](https://openrouter.ai/z-ai/glm-5.3-20260816) | 3.76T | 12 |
| 10 | [openai/gpt-6.1-sol-20260929](https://openrouter.ai/openai/gpt-6.1-sol-20260929) | 3.71T | 11 |
| 11 | [moonshotai/kimi-k3.1-pro-20261023](https://openrouter.ai/moonshotai/kimi-k3.1-pro-20261023) | 3.47T | 9 |
| 12 | [minimax/minimax-m3.1-flash-20261019](https://openrouter.ai/minimax/minimax-m3.1-flash-20261019) | 3.38T | 8 |
| 13 | [deepseek/deepseek-v4-flash-20260731](https://openrouter.ai/deepseek/deepseek-v4-flash-20260731) | 3.28T | 14 |
| 14 | [nvidia/nemotron-3-ultra-550b-a55b-20260604](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b-20260604) | 3.19T | 16 |
| 15 | [nvidia/nemotron-3.5-super-vl-20261015](https://openrouter.ai/nvidia/nemotron-3.5-super-vl-20261015) | 3.00T | 17 |
| 16 | [meta/muse-spark-1.3-contributor-20260902](https://openrouter.ai/meta/muse-spark-1.3-contributor-20260902) | 2.99T | 18 |
| 17 | [typesafe/jev-1.13-20260917](https://openrouter.ai/typesafe/jev-1.13-20260917) | 2.81T | 15 |
| 18 | [anthropic/claude-haiku-5.5-20261007](https://openrouter.ai/anthropic/claude-haiku-5.5-20261007) | 2.76T | 20 |
| 19 | [anthropic/claude-sonnet-5.5-20260928](https://openrouter.ai/anthropic/claude-sonnet-5.5-20260928) | 2.55T | new |
| 20 | [deepseek/deepseek-v4-flash-20260423](https://openrouter.ai/deepseek/deepseek-v4-flash-20260423) | 2.17T | new |