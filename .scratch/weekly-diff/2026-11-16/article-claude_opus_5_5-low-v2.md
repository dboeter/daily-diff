Anthropic released [Claude Fable 5.2 and Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2), and Claude Code made Fable 5.2 its default model. Azure Databricks set near dates for a model retirement and an endpoint end of life. The European Commission published guidelines on the AI Act's Article 50 transparency obligations.

## Claude Fable 5.2 and Claude Code

Anthropic says Fable 5.2 achieves a new benchmark in coding, finance and science. An analysis reports it [scoring 65 on Artificial Analysis](https://artificialanalysis.ai/models/claude-fable-5-2), the highest score to date. Claude Code [v2.1.321–v2.1.322](https://github.com/anthropics/claude-code/releases/tag/v2.1.322) make Claude Fable 5.2 the default model, with 1M context at $8/$40 per Mtok. The same releases add fast mode on Vertex in global/US/EU regions and fix MCP OAuth token leaks. The model is also listed on OpenRouter as [Claude Fable 5.2](https://openrouter.ai/anthropic/claude-fable-5.2) with a 1M context.

Several regressions surfaced during the week. Issue [#107390](https://github.com/anthropics/claude-code/issues/107390) reports weekly Team usage exhausted in ~30.5 hours after reset, with no workflow change. Issue [#108726](https://github.com/anthropics/claude-code/issues/108726) reports that `DISABLE_TELEMETRY=1` stops feature flags from loading, so the `/model` picker hides Fable 5.2. [v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) adds an experimental opt-in Code Mode. An issue, [#109446](https://github.com/anthropics/claude-code/issues/109446), says that release silently removed `subagentStatusLine` with no replacement. [v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixes a security issue in zstd-compressed response decoding. The status page also confirmed [elevated errors](https://news.ycombinator.com/item?id=50481187) across Claude services.

_A changed default model at a higher context size, together with the usage-burn report, suggests that teams on Claude Code plans should watch their quotas this week. The telemetry issue means a privacy setting can change which model a user sees, which is worth checking in locked-down client setups._

## Databricks dates and defaults

Azure Databricks will retire [Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) on 2026-11-19. API calls will be automatically redirected to Gemini 3.8 Flash. The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life on November 30, 2026, after which requests fail. The release note directs workloads to `system.ai.genie_one_mcp` in Unity Gateway. [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is deprecated and will be retired on February 4, 2027.

Two changes are further out. After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables [will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits). The note calls this a breaking change. Separately, [external access to managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) becomes the default for workspaces with the compliance security profile enabled, starting on or after December 10, 2026.

[Smart Routing](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta) now routes only subagents. Databricks says this cuts cost by up to 70% and p90 latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused. The Databricks CLI [v1.25.0](https://github.com/databricks/cli/releases/tag/v1.25.0) removes `CRITICAL` as a valid `compute.priority_class` value.

_The Gemini redirect is silent, so a workload on Gemini 3.6 Flash would change models without any failing call. This makes the 2026-11-19 date the one most likely to catch teams off guard. The catalog-commits and external-access changes together point to Unity Catalog taking a larger coordinating role for managed tables._

## Security reports in the stack

A write-up describes turning [a 22-year-old PostgreSQL type-confusion primitive into RCE](https://mehmetince.net/part-3-6-how-i-ended-up-turning-a-22-year-old-postgresql-type-confusion-primitive-into-rce-cve-2026-6460/). The PostgreSQL project lists [CVE-2026-6460](https://www.postgresql.org/support/security/CVE-2026-6460/) as arbitrary code execution. The PostgreSQL Global Development Group released [18.7, 17.12, 16.16, 15.20, 14.25 and 19 RC 2](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/).

On the agent side, a Hermes Agent issue, [#62336](https://github.com/NousResearch/hermes-agent/issues/62336), says terminal environment snapshots write credential-bearing variables to plaintext files. Another issue, [#152674](https://github.com/NousResearch/hermes-agent/issues/152674), says the Desktop app admits messages from two different accounts as `uid:10000`. NVIDIA's [OpenShell v0.1.8](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8) makes several breaking changes, including explicit `auth_style` declarations for static provider credentials.

_Agent tools that hold environment secrets are a recurring theme in this week's reports. That makes how a harness stores credentials worth weighing when choosing one for client work._

## EU AI Act transparency

The Commission published [guidelines on Article 50 transparency obligations](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005), listed as a preparatory document. On 2026-12-02, the [Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act), alongside bans on sexual deepfakes and CSAM generators. The Commission also adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) on AI regulatory sandboxes.

In the Netherlands, the cabinet [adopted a vision for AI](https://www.digitaleoverheid.nl/nieuws/kabinet-kiest-voor-ai-die-nederland-vooruithelpt/). The Tweede Kamer [adopted a motion by Beckerman](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24997&did=2026D57726) calling for research into protecting artists and creators against AI.

_The guidelines arrive less than three weeks before the Art. 50(2) transition ends. Dutch and EU clients with generative output in production are likely to ask about them soon._

## Where usage moved

On OpenRouter on 2026-11-15, [deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) led with 59.23T tokens, holding rank 1. [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) rose from 4 to 2 with 18.12T. Among apps, [Kilo Code](https://kilocode.ai/) ranked week #5 with 7.03T tokens/week, +46% vs previous week. [OpenClaw](https://openclaw.ai/) fell -46% vs previous week to 2.69T tokens/week. In GitHub stars, [Tencent/LoopForge](https://github.com/Tencent/LoopForge) gained +1,632 in the last 7 days (+989%). It orchestrates CodeBuddy, Codex and Claude Code.

_In this one-day snapshot, DeepSeek flash models still dominate token volume. Anthropic's highest entry, [claude-opus-5.5](https://openrouter.ai/anthropic/claude-opus-5.5-20260921), sits at rank 6 with 6.98T. Fable 5.2 does not appear in the top 20, so its uptake does not show in these figures yet._
