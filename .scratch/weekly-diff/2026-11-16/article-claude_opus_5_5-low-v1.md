Anthropic's Claude Fable 5.2 became the default model in Claude Code this week. A run of regressions, removals and an outage followed it. On the data side, Azure Databricks posted a model retirement for 2026-11-19 alongside the Genie One MCP Beta shutdown on 2026-11-30, and the EU published draft guidance on AI Act transparency duties ahead of a 2026-12-02 date.

## Claude Fable 5.2 and Claude Code

[Claude Code v2.1.321–v2.1.322](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) made Claude Fable 5.2 the default model, with 1M context at $8/$40 per Mtok. The same releases fixed regressions including MCP OAuth token leaks. Anthropic [released Claude Fable 5.2 and Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2). An [analysis reports](https://artificialanalysis.ai/models/claude-fable-5-2) a score of 65 on Artificial Analysis, the highest to date. The model was [listed on OpenRouter](https://openrouter.ai/anthropic/claude-fable-5.2) on 2026-11-09.

Several problems were reported after the switch:

- **Telemetry and the model picker:** users report that [`DISABLE_TELEMETRY=1` stops feature flags loading](https://github.com/anthropics/claude-code/issues/108726), so the `/model` picker hides Fable 5.2.
- **Team usage limits:** users report [weekly Team usage exhausted in ~30.5 hours](https://github.com/anthropics/claude-code/issues/107390) after reset, with no workflow change.
- **Removed status line:** an issue says [v2.1.323 silently removed `subagentStatusLine`](https://github.com/anthropics/claude-code/issues/109446) with no replacement.
- **Outage:** on 2026-11-14 the status page confirmed [elevated errors](https://news.ycombinator.com/item?id=50481187) across Claude services.

That same day, [v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixed a security issue in zstd-compressed response decoding.

_A default-model change combined with reported usage and picker issues suggests teams that set telemetry off or share Team plans may see behaviour change without touching their setup. The silent removal is worth watching for anyone building tooling on Claude Code's status output._

## Databricks deadlines and defaults

The nearest Azure Databricks date is [Gemini 3.6 Flash's retirement](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026). On 2026-11-19, API calls to it will be automatically redirected to Gemini 3.8 Flash.

The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) at `/api/2.0/mcp/genie` reaches end of life on 2026-11-30. After that date, requests fail. Databricks points to `system.ai.genie_one_mcp` in Unity Gateway as the replacement.

Further out, there are three dates:

- **Default external access, 2026-12-10:** starting on or after that date, workspaces with the compliance security profile will get [external Delta client access to managed tables by default](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled).
- **GLM 5.2 retirement, 2027-02-04:** [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) will be retired.
- **Catalog commits, 2027-08-19:** after Runtime 15.4 LTS end of support, all Unity Catalog managed tables will be [upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits). Databricks calls this a breaking change.

Separately, [Smart Routing now routes only subagents](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta). Databricks says this cuts cost by up to 70% and p90 latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused.

_Two retirements and an endpoint shutdown inside one month suggest that model and MCP endpoints on Databricks now turn over on short cycles. The planned default for external access is likely relevant to compliance-profile clients, because it changes who can write to managed tables by default._

## Security reports in agent tooling and Postgres

An open Hermes Agent issue says [terminal environment snapshots write credential-bearing variables](https://github.com/NousResearch/hermes-agent/issues/62336) to plaintext files under `cache/terminal/`. Another Hermes issue says the [Desktop app admits messages from two different accounts as `uid:10000`](https://github.com/NousResearch/hermes-agent/issues/152674).

[OpenShell v0.1.8](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8) shipped several breaking changes. Static provider credentials now need explicit `auth_style` placement, and REST endpoints now return `403` for HTTP upgrade requests.

On the database side, the PostgreSQL Global Development Group [released 18.7, 17.12, 16.16, 15.20 and 14.25](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/). A researcher described turning [a 22-year-old type-confusion bug into RCE](https://mehmetince.net/part-3-6-how-i-ended-up-turning-a-22-year-old-postgresql-type-confusion-primitive-into-rce-cve-2026-6460/), filed as [CVE-2026-6460](https://www.postgresql.org/support/security/CVE-2026-6460/).

_The Hermes and OpenShell items both concern how agents handle credentials. This suggests secret handling is where agent runtimes are being hardened, and where reports are surfacing._

## Usage shifts on OpenRouter

Among OpenRouter apps, [Kilo Code](https://kilocode.ai/) ran 7.03T tokens/week (+46% vs previous week). [Hermes Agent](https://hermes-agent.nousresearch.com/) ranked #3 at 13.02T tokens/week (+5.1%), and [Claude Code](https://claude.ai/code) ranked #4 at 10.80T (+7.5%). [OpenClaw](https://openclaw.ai/) fell to 2.69T tokens/week (-46%).

By model on 2026-11-15, [deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) stayed first with 59.23T tokens. [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) moved from 4 to 2 with 18.12T tokens. Two Anthropic models sat at 6 and 19 in that day's top 20.

_One week's figures show traffic moving towards Kilo Code and away from OpenClaw, not a settled trend. The model table suggests the heaviest OpenRouter volume still goes to low-cost flash models rather than frontier ones._

## EU AI Act transparency and Dutch politics

The Commission published [draft guidelines on Article 50 transparency obligations](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005), a preparatory document. On 2026-12-02 the [Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act). On the same date, bans on sexual deepfakes and CSAM generators apply.

The Commission also adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) on AI regulatory sandboxes.

In the Netherlands, the cabinet [adopted an AI vision](https://www.digitaleoverheid.nl/nieuws/kabinet-kiest-voor-ai-die-nederland-vooruithelpt/). The House received a motion calling for a [liability framework for damage caused by AI models](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24563&did=2026D56703).

_Guidance published weeks before the Art. 50(2) date suggests clients with generative features in the EU will meet the transparency rules with little time to read them. The liability motion is worth watching, though it is only a motion so far._
