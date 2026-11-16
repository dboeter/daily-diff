Anthropic announced [Claude Fable 5.2 and Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2), which its page calls "our new models for the hardest technical challenges", and coding agents added Fable 5.2 to their model lists. Google made [Gemini 4 Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) available and introduced [Gemini 4 Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/). Databricks set an [end-of-life date for the Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint), and the European Commission published [guidelines on the AI Act's Article 50 transparency obligations](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005).

## Claude Fable 5.2 in the coding agents

[Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) added Claude Fable 5.2 (`claude-fable-5-2`) as the default Fable model. It has 1M context and costs $8/$40 per Mtok, with cache reads at $0.20/Mtok. [Pi v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) added it to its `anthropic` provider at the same price, with 128K output. Pi's notes say that when Fable 5.2's safety classifiers refuse a request before any output, Claude Opus 5 answers it through server-side fallback. That answer is billed at Opus 5's price. The same Pi release also changed the default model for the `anthropic` provider to Claude Opus 5.5, replacing Claude Opus 4.8.

[One issue](https://github.com/anthropics/claude-code/issues/108726) reports that `DISABLE_TELEMETRY=1` hides Fable 5.2 from Claude Code's `/model` picker, while `claude --model claude-fable-5-2` still works. [Another issue](https://github.com/anthropics/claude-code/issues/109446) reports that 2.1.323 removed the `subagentStatusLine` setting. Its reporter calls that setting the only per-subagent view of context, cost, model and effort.

On OpenRouter, [Claude Code](https://claude.ai/code) ranked week #4 with 10.80T tokens/week (+7.5% vs previous week). [Kilo Code](https://kilocode.ai/) reached 7.03T tokens/week (+46% vs previous week).

*With refused requests billed at another model's price, the cost of a Fable 5.2 workload may depend on more than its list price. The two reports suggest that client settings and versions can change which models and cost details a team sees.*

## Gemini 4 models in BigQuery and agent tools

[BigQuery generative AI functions now support gemini-4-carbon](https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026), and the note says the model is generally available. [A later note adds gemini-4-hydrogen](https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026), also generally available.

According to the catalog in [Oh My Pi v18.18.8](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.8), Gemini 4 Carbon costs $2 input / $0.10 cached / $10 output per 1M tokens through 2026-11-30. After that date the catalog lists $4 / $0.20 / $20.

Oh My Pi also changed course three times on Google Antigravity:
[v18.18.4](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.4) paused it, "since Google may restrict accounts that use it outside its own apps".
[v18.18.7](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.7) resumed it behind a login warning.
[v18.20.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.1) paused it again and pointed users to `GEMINI_API_KEY` with Google AI Studio or the `google-vertex` provider.

On Azure Databricks, [Gemini 3.6 Flash will be retired on 2026-11-19](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026). From that date, calls are redirected to Gemini 3.8 Flash at the same price.

*If Oh My Pi's figures are right, Carbon's price doubles after 2026-11-30, so cost estimates made this month may not hold in December. The Antigravity reversals point to API keys and Vertex as the steadier route for this tool's users.*

## Databricks deadlines and changed defaults

The Genie One MCP Beta endpoint at `/api/2.0/mcp/genie` reaches end of life on 2026-11-30. After that, requests fail. The note points to the `system.ai.genie_one_mcp` MCP in Unity Gateway.

[Smart Routing now routes only subagents](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta), not the first prompt. Databricks says it costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused, and the feature is in Beta.

Starting on or after 2026-12-10, [external access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) will be on by default for eligible workspaces with the compliance security profile enabled. Metastore settings and Unity Catalog privileges continue to control access.

Two tools changed how app compute size is handled:
[Terraform provider v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) now updates `databricks_app` through the asynchronous API. An omitted `compute_size` now resets to `MEDIUM`, and omitted min and max instances disable horizontal scaling.
[Databricks CLI v1.26.0](https://github.com/databricks/cli/releases/tag/v1.26.0) no longer sends `compute_size` when a bundle does not declare it. A deploy therefore no longer resets a manually resized app.

*The two tools now treat an undeclared compute size in opposite ways: Terraform resets it, bundles leave it alone. For clients on the compliance security profile, the 2026-12-10 default turns external Delta access from an opt-in into something governed only by existing settings and privileges.*

## EU AI Act guidance and dates

The Commission's Article 50 guidelines carry the stage of a preparatory document. [Commission Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) of 2026-11-10 lays down rules for AI regulatory sandboxes under the AI Act, at the stage "regulation adopted". The open dates list 2026-12-02 for [AI Act bans on sexual deepfakes and CSAM generators, and the end of the Art. 50(2) transition](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act).

In the Tweede Kamer, [a motion by El Boujdaini c.s.](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682) is about equipping authorities for supervision of the AI Act. [A motion by Dassen](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24563&did=2026D56703) is about a legal framework for liability when AI models cause damage.

*The Article 50 guidelines appeared about three weeks before the Art. 50(2) transition ends, so the guidance and the date it relates to fall close together. The Dutch motions suggest that supervision capacity and liability are on the parliamentary agenda.*

## Security fixes in agents and databases

The Claude Code v2.1.321 release fixed MCP OAuth requests that sent secrets such as refresh tokens to another host when a server redirected them. As a separate fix, it closed a case where a read-only Bash command ran outside the sandbox without a permission prompt. [Claude Code v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixed a security issue in how zstd-compressed responses are decoded.

[OpenShell v0.1.8](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8) stops AWS SigV4 signing diagnostics from appearing in supervisor TRACE logs, where they could expose the temporary session token. [A Hermes Agent issue](https://github.com/NousResearch/hermes-agent/issues/62336) reports that terminal environment snapshots write credential-bearing environment variables to disk in plaintext. For databases, [CVE-2026-6460](https://www.postgresql.org/support/security/CVE-2026-6460/) is listed as arbitrary code execution in Postgres.

*Most of the agent fixes concern credentials ending up where they do not belong: at another host, in logs or on disk. This suggests credential handling in agent tooling was a recurring weak spot this week.*
