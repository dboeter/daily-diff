Anthropic released Claude Fable 5.2, which Claude Code made its default Fable model, and shipped three Claude Code releases while users filed issues about usage metering and a removed setting. Azure Databricks set near-term dates for an MCP endpoint shutdown and a model retirement, and announced default changes for compliance workspaces. Google added Gemini 4 Carbon and Gemini 4 Hydrogen to BigQuery generative AI functions, and Anthropic launched the [roadshow](https://www.anthropic.com/news/roadshow-launch) for its proposed initial public offering.

## Claude Fable 5.2 and Claude Code

[Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) added Claude Fable 5.2 (`claude-fable-5-2`) as the default Fable model, with 1M context and pricing of $8/$40 per Mtok and $0.20/Mtok cache reads. The same release fixed MCP OAuth requests that sent secrets such as refresh tokens to another host when a server redirected them. It also fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt. According to the [Pi v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) notes, requests that Fable 5.2's safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback, billed at Opus 5's price. On 2026-11-09, [Artificial Analysis](https://artificialanalysis.ai/models/claude-fable-5-2) scored Fable 5.2 at 65, which the story's title calls the highest so far.

[v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixed "a security issue in how zstd-compressed responses are decoded." [v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) added Code Mode as an experimental opt-in. An [issue](https://github.com/anthropics/claude-code/issues/109446) reports that 2.1.323 removed the `subagentStatusLine` setting with no replacement.

Other issues filed this week are reports from single users. A Team subscriber [reports](https://github.com/anthropics/claude-code/issues/107390) that their weekly allowance ran out about 30.5 hours after reset. Another user [reports](https://github.com/anthropics/claude-code/issues/108726) that `DISABLE_TELEMETRY=1` hides Fable 5.2 from the `/model` picker because feature flags are ignored. Anthropic's status page also listed [elevated errors](https://status.claude.com/incidents/nn11wk485zfn) on claude.ai, Claude Code and platform.claude.com.

*Teams that pin settings or rely on the status line may want to read each release's notes before they upgrade, since a setting can now disappear between releases. The fallback to Opus 5 means a Fable 5.2 bill can include requests priced at another model's rate.*

## Databricks dates and defaults

The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life on 2026-11-30. After that date requests fail, and the digest's summary says workloads should migrate to the `system.ai.genie_one_mcp` MCP in Unity Gateway. [Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) retires on 2026-11-19, and calls will be redirected to Gemini 3.8 Flash at the same price. [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is deprecated and retires on 2027-02-04, with GLM 5.3 recommended as the replacement.

For workspaces with the compliance security profile, [external access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) becomes available by default starting on or after 2026-12-10. After Runtime 15.4 LTS reaches end of support on 2027-08-19, [all Unity Catalog managed tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits) will be upgraded to catalog commits. [OAuth on-behalf-of for service principals](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-on-behalf-of-for-service-principals-is-generally-available) is generally available and turned on by default.

[Smart Routing](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta) now routes only subagents, and Smart Routing for Codex is paused. Databricks says it costs up to 70% less in internal benchmarks.

In [Terraform provider v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0), `databricks_app` updates now apply compute fields. An omitted `compute_size` now resets to `MEDIUM`, and an omitted `git_source` clears the app's default git source.

*The two November dates fall within weeks, so MCP clients and Gemini 3.6 Flash callers on Databricks have little slack. The Terraform change can resize apps on the next apply when the configuration leaves compute fields out.*

## Security events in the data stack

The PostgreSQL project published [CVE-2026-6460](https://www.postgresql.org/support/security/CVE-2026-6460/), titled "Arbitrary Code Execution in Postgres." [OpenShell v0.1.8](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8) stopped AWS SigV4 signing diagnostics from appearing in supervisor TRACE logs, where they could expose the temporary session token. Its upgrade notes also say SIEM parsers that read top-level `container.uid` must update their mappings.

For Hermes Agent, an [open issue](https://github.com/NousResearch/hermes-agent/issues/62336) reports that terminal environment snapshots write credential-bearing environment variables to disk. In [Dagster 1.13.30](https://github.com/dagster-io/dagster/releases/tag/1.13.30), alert emails and Teams alerts now escape customer-provided values so they cannot inject HTML. The same release drops support for Python 3.10.

*Several fixes this week concern secrets leaking into logs, files or redirects. This suggests that agent and pipeline tooling around credentials is still settling.*

## Models and usage figures

BigQuery generative AI functions now support [gemini-4-carbon](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026) and [gemini-4-hydrogen](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026), and both models are generally available. Snowflake made [Anthropic Claude 5.5 and OpenAI GPT-6 models](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-06-claude-5-5-openai-gpt-6-ga) generally available.

On OpenRouter on 2026-11-15, [deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) led with 59.23T tokens. [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) rose to #2 from #4, with 18.12T tokens. Among apps, [Kilo Code](https://kilocode.ai/) reached 7.03T tokens/week (+46% vs previous week), while [OpenClaw](https://openclaw.ai/) fell to 2.69T (-46% vs previous week).

*The top of the OpenRouter table is held by Flash-type models from DeepSeek, Z.ai and others. This one-day snapshot points to cost-oriented models carrying the volume, not to a lasting shift.*

## EU AI Act steps

The Commission adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487), which sets rules for AI regulatory sandboxes under the AI Act. It also published [guidelines on the Article 50 transparency obligations](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005), listed at the stage of a preparatory document. On 2026-12-02, the [Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act), and the AI Act's bans on sexual deepfakes and CSAM generators take effect on the same date.

*For clients with generative AI features in the EU, the Article 50 guidance and the 2026-12-02 date arrive close together. That makes transparency obligations worth watching this month.*
