# Weekly Diff 2026-11-16

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-16) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-16/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-16/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-16/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-16/ai-data) · **⬜ Weekly Diff** · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-16/ai-trends)

> Sources: 330 items the pages showed from 2026-11-10 to 2026-11-16 | Written by claude-opus-5-5 | Text in italics is interpretation | Generated: 22:30 UTC

---

Anthropic released [Claude Fable 5.2 and Claude Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2). Google made [Gemini 4 Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) available and introduced [Gemini 4 Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/). Azure Databricks set dates for model retirements and an MCP endpoint, and the European Commission adopted [an implementing regulation on AI regulatory sandboxes](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487).

## Claude Fable 5.2 in coding agents

[Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) added Claude Fable 5.2 (`claude-fable-5-2`) as the default Fable model. It has 1M context and costs $8/$40 per Mtok, with $0.20/Mtok for cache reads. The same release fixed MCP OAuth requests that sent secrets such as refresh tokens to another host when a server redirected them. It separately fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt.

[Pi v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) also added Fable 5.2 to its `anthropic` provider. Its notes say that requests Fable 5.2's safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback, and are billed at Opus 5's price. The same release changed the default model of that provider to Claude Opus 5.5.

Two issues describe friction with the new model and with later releases. One [issue reports](https://github.com/anthropics/claude-code/issues/108726) that `DISABLE_TELEMETRY=1` stops Claude Code from downloading feature flags, so the `/model` picker offers Fable 5.1 instead of 5.2. Another [issue reports](https://github.com/anthropics/claude-code/issues/109446) that 2.1.323 removed the `subagentStatusLine` setting. Its reporter calls the setting the only place to see each subagent's context, cost, model and effort. A Team subscriber [reports](https://github.com/anthropics/claude-code/issues/107390) that weekly usage reached 100% about 30 hours and 31 minutes after the reset on 2026-11-04. Later in the week, [Claude Code v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixed a security issue in how zstd-compressed responses are decoded.

*For teams whose clients require telemetry to be off, the reported link between `DISABLE_TELEMETRY` and the model picker is worth watching, because a privacy setting may hide the new default Fable model. Pi's note suggests that the cost of a Fable request can depend on whether the request is refused.*

## Azure Databricks dates and defaults

The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life on 2026-11-30, after which requests fail. The note points workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway. [Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) retires on 2026-11-19. From that date, calls are redirected to Gemini 3.8 Flash at the same price. [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is deprecated and retires on 2027-02-04, with GLM 5.3 as the recommended replacement.

Starting on or after 2026-12-10, [external access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) will be available by default for eligible workspaces with the compliance security profile enabled. [Smart Routing](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta), which is in Beta, now routes only subagents. Databricks says it costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused.

Two tools changed how they handle an app's compute size. [Terraform provider v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) now updates `databricks_app` through the asynchronous API. As a result, an omitted `compute_size` resets to `MEDIUM`, and an omitted `git_source` clears the app's default git source. [Databricks CLI v1.26.0](https://github.com/databricks/cli/releases/tag/v1.26.0) no longer sends `compute_size` when a bundle does not declare it. A deploy therefore no longer resets a manually resized app to the default size.

*The two tools now treat an undeclared app size in opposite ways, so apps managed with both may end up at different sizes depending on which tool deployed last. The compliance-profile change is worth watching, since access will then depend on metastore external data access settings and Unity Catalog privileges.*

## Gemini 4 models in BigQuery and agent catalogs

BigQuery generative AI functions now support [gemini-4-carbon](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026) and [gemini-4-hydrogen](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026). The notes call each model generally available.

Oh My Pi's [v18.18.8](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.8) catalog lists Gemini 4 Carbon at $2 input, $0.10 cached and $10 output per 1M tokens through 2026-11-30, then $4, $0.20 and $20. Its [v18.20.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.1) lists Gemini 4 Hydrogen on Google Antigravity at $1.50/$7.50 per million tokens. The same release paused Google Antigravity again and points users to `GEMINI_API_KEY` with Google AI Studio or to the `google-vertex` provider. An earlier [v18.18.4](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.4) had paused Antigravity because Google may restrict accounts that use it outside its own apps.

*If that catalog's dates hold, Carbon's per-token prices double after 2026-11-30, so cost estimates made this month may not carry over to December. The repeated pausing in one tool suggests that Antigravity access through third-party agents is less settled than access through API keys or Vertex.*

## EU AI Act implementation

The Commission also published [guidelines on the transparency obligations for certain AI systems under Article 50](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005) of the AI Act on 2026-11-12. The [AI Act timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) lists 2026-12-02 for two milestones: bans on sexual deepfakes and CSAM generators, and the end of the Article 50(2) transition. In the Netherlands, [a motion by El Boujdaini and others](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682) concerns equipping authorities sufficiently for supervision of the AI Act.

*The Article 50 guidelines appeared 20 days before the Article 50(2) transition ends, which leaves a short window for clients whose AI systems fall under that article to compare their practice with them.*

## Agent tool usage

Several agent tools moved sharply in OpenRouter's app ranking. [Kilo Code](https://kilocode.ai/) was week #5 with 7.03T tokens/week, +46% vs previous week. [Strix](https://strix.ai/) was week #9 with 2.56T tokens/week, +45% vs previous week. [OpenClaw](https://openclaw.ai/) was week #8 with 2.69T tokens/week, -46% vs previous week. [omp](https://omp.sh/) was week #11 with 2.13T tokens/week, -36% vs previous week, while its npm package had 295,519 downloads/week, +34% vs previous week. [Hermes Agent](https://hermes-agent.nousresearch.com/) was week #3 with 13.02T tokens/week (+5.1% vs previous week), and [Claude Code](https://claude.ai/code) was week #4 with 10.80T tokens/week (+7.5% vs previous week).

Among models on 2026-11-15, [deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) led OpenRouter tokens with 59.23T. [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) was #2 with 18.12T, after ranking #4 last week.

*omp's OpenRouter tokens and npm downloads moved in opposite directions, which suggests OpenRouter tokens alone may not track how much a tool is used. Swings near 46% in both directions show one week's movement, not a lasting shift.*

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*