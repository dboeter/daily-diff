Anthropic released Claude Fable 5.2, and Claude Code made it the default Fable model. Google made Gemini 4 Carbon and Gemini 4 Hydrogen available, and BigQuery's generative AI functions now support both. Databricks set near dates for a Genie One MCP endpoint and a Gemini model, and the European Commission published guidelines on the AI Act's transparency obligations.

## Claude Fable 5.2 in Claude Code

Anthropic calls [Claude Fable 5.2 and Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2) "our new models for the hardest technical challenges". [Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) added Claude Fable 5.2 (`claude-fable-5-2`) as the default Fable model. It has 1M context and costs $8/$40 per Mtok, with $0.20/Mtok cache reads. The same release fixed MCP OAuth requests that sent secrets such as refresh tokens to another host when a server redirected them. It also fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt.

[Pi v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) added the model to its `anthropic` provider. Its notes say that requests Fable 5.2's safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback, billed at Opus 5's price.

Later releases changed more. [Claude Code v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixed a security issue in how zstd-compressed responses are decoded. Version 2.1.323 removed the `subagentStatusLine` setting. [An issue](https://github.com/anthropics/claude-code/issues/109446) reports that this leaves no other place to see a subagent's context use, cost, model and effort. [Another issue](https://github.com/anthropics/claude-code/issues/108726) reports that `DISABLE_TELEMETRY=1` hides Fable 5.2 from the `/model` picker, while `claude --model claude-fable-5-2` works in the same configuration. One Team subscriber [reports](https://github.com/anthropics/claude-code/issues/107390) that a weekly allowance ran out about 30 hours and 31 minutes after reset.

*Going by Pi's notes, a Fable 5.2 bill can include requests charged at Opus 5's price, which is worth knowing when reading cost reports. Point releases this week both added security fixes and removed a configurable surface, so each update is worth reading before rollout.*

## Databricks deadlines and changed defaults

The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) at `/api/2.0/mcp/genie` reaches end of life on 2026-11-30, after which requests fail. The note points workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway.

[Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) retires on 2026-11-19. From that date, calls redirect to Gemini 3.8 Flash at the same price. [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is deprecated and will be retired on 2027-02-04, with GLM 5.3 as the recommended replacement.

[Smart Routing](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta), in Beta, now routes only subagents, not the first prompt. Databricks says it costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused.

Two releases change how app size is handled:

- [Terraform provider v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) now updates `databricks_app` through the asynchronous Apps update API. An omitted `compute_size` resets to `MEDIUM`, and an omitted `git_source` clears the app's default git source.
- [Databricks CLI v1.26.0](https://github.com/databricks/cli/releases/tag/v1.26.0) stops sending `compute_size` when a bundle does not declare it, so a deploy no longer resets a manually resized app.

Separately, [external access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) will be on by default for eligible compliance-security-profile workspaces starting on or after 2026-12-10.

*The two app changes pull in opposite directions: an undeclared `compute_size` now resets size under Terraform but is left alone by a bundle deploy. Which tool a client deploys with decides what happens to a resized app. The 2026-11-19 and 2026-11-30 dates fall within the next three weeks.*

## Gemini 4 and models in the warehouse

Google announced [Gemini 4 Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) for developers, enterprises, scientists and consumers. It then introduced [Gemini 4 Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) as "our daily driver for agentic workflows". BigQuery generative AI functions now support [gemini-4-carbon](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026) and [gemini-4-hydrogen](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026), and both models are generally available there. Snowflake announced the [general availability of Anthropic Claude 5.5 and OpenAI GPT-6 models](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-06-claude-5-5-openai-gpt-6-ga).

[Oh My Pi v18.18.8](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.8) lists these Gemini 4 Carbon prices per 1M tokens:

- through 2026-11-30: $2 input, $0.10 cached, $10 output
- after that: $4, $0.20 and $20

On OpenRouter on 2026-11-15, [deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) stayed first with 59.23T tokens. [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) rose from 4 to 2 with 18.12T. Among agent tools on OpenRouter:

- [Kilo Code](https://kilocode.ai/) reached 7.03T tokens/week (+46% vs previous week).
- [OpenClaw](https://openclaw.ai/) fell to 2.69T tokens/week (-46% vs previous week).

*BigQuery's support for each Gemini 4 model is dated the same day as Google's announcement, so warehouse SQL got these models without a lag this week. If Oh My Pi's catalog is right, every Carbon rate doubles after 2026-11-30, which matters for any estimate made on this month's prices.*

## EU AI Act rules and dates

The Commission adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487), which lays down rules for AI regulatory sandboxes under the AI Act. It also published [guidelines on the transparency obligations for certain AI systems under Article 50](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005), listed as a preparatory document. On [2026-12-02](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act), the AI Act's bans on sexual deepfakes and CSAM generators apply and the Art. 50(2) transition ends.

In the Netherlands, budget debates produced two relevant motions:

- [El Boujdaini c.s.](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682) on equipping authorities sufficiently to supervise the AI Act.
- [Dassen](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24563&did=2026D56703) on a legal framework for liability for damage caused by AI models.

At EU level, Finland and Estonia [call for](https://www.politico.eu/article/eu-needs-a-system-to-respond-to-ai-incidents-finland-and-estonia-say/?utm_source=RSS_Feed&utm_medium=RSS&utm_campaign=RSS_Syndication) "EU-level arrangements for responding to serious AI incidents".

*The Article 50 guidelines appeared three weeks before the Art. 50(2) transition ends, so clients with transparency obligations have little time to read them against their systems. The Dutch motions on supervision and liability are worth watching as signs of how national enforcement may take shape.*
