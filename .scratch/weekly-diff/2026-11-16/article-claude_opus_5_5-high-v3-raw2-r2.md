Anthropic's Claude Fable 5.2 reached coding tools this week: [Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) made it the default Fable model at $8/$40 per Mtok. Databricks set two near dates: [Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) retires on 2026-11-19, and the [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life on 2026-11-30. In Brussels, the Commission adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) on AI regulatory sandboxes.

## Claude Fable 5.2

[Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) added Claude Fable 5.2 (`claude-fable-5-2`) as the default Fable model. It has 1M context and costs $8/$40 per Mtok, with $0.20/Mtok cache reads. [Pi v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) added the model to its `anthropic` provider at the same token prices, with 128K output. According to Pi's notes, its safety classifiers can refuse a request before any output. Such requests are then answered by Claude Opus 5 through server-side fallback and billed at Opus 5's price.

OpenRouter's [listing](https://openrouter.ai/anthropic/claude-fable-5.2) calls Fable 5.2 "Anthropic's most capable model for the most demanding technical work". The [announcement of Fable 5.2 and Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2) drew 464 points and 741 comments on Hacker News.

An [issue](https://github.com/anthropics/claude-code/issues/108726) reports that `DISABLE_TELEMETRY=1` hides Fable 5.2 from the `/model` picker, because Claude Code then ignores feature flags. The reporter says `claude --model claude-fable-5-2` still works in the same setup.

*For teams that turn telemetry off on client machines, the picker may not show what the account can use, and the explicit model flag is the reported way around it. The Opus 5 fallback means a Fable 5.2 bill can include Opus 5 prices, which is worth tracking in cost reports.*

## Claude Code fixes and agent usage

The same [v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) release fixed two problems:
- MCP OAuth requests sent secrets such as refresh tokens to another host when a server redirected them.
- A read-only Bash command could run outside the sandbox without a permission prompt.

[v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixed "a security issue in how zstd-compressed responses are decoded". It also fixed background sessions on a claude.ai login using, and billing, an API key or token from the shell that started the background service.

[v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) added Code Mode, an experimental opt-in in which Claude writes JavaScript to call its tools. An [issue](https://github.com/anthropics/claude-code/issues/109446) reports that 2.1.323 also removed the `subagentStatusLine` setting without a replacement. Per-subagent context, cost, model and effort no longer show through it. Anthropic's [status page](https://status.claude.com/incidents/nn11wk485zfn) listed elevated errors on claude.ai, Claude Code and platform.claude.com.

The OpenRouter app ranking ([Trends](https://claude.ai/code)) shows these figures for the week:
- Claude Code: week #4, 10.80T tokens/week (+7.5% vs previous week).
- [Kilo Code](https://kilocode.ai/): week #5, 7.03T tokens/week (+46% vs previous week).
- [Strix](https://strix.ai/): week #9, 2.56T tokens/week (+45% vs previous week).
- [OpenClaw](https://openclaw.ai/): week #8, 2.69T tokens/week (-46% vs previous week).
- [Hermes Agent](https://hermes-agent.nousresearch.com/): week #3, 13.02T tokens/week (+5.1% vs previous week).

*Several of this week's fixes concern where credentials go and which account pays, which matters most when one setup serves several clients. The OpenRouter swings cover a single week; Kilo Code's rise and OpenClaw's drop are worth watching rather than reading as a lasting shift.*

## Databricks dates and defaults

[Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) retires on 2026-11-19. From that date, API calls go to Gemini 3.8 Flash at the same price. The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life on 2026-11-30, after which requests fail. The notice points to the `system.ai.genie_one_mcp` MCP in Unity Gateway. [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is deprecated and will be retired on 2027-02-04, with GLM 5.3 as the recommended replacement.

[Smart Routing](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta), in Beta, now routes only subagents, not the first prompt. Databricks says it costs up to 70% less in internal benchmarks. Smart Routing for Codex is paused.

[Terraform provider v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) changes how `databricks_app` handles fields left out of the configuration:
- An omitted `compute_size` now resets to `MEDIUM`.
- Omitted minimum and maximum instances disable horizontal scaling.
- An omitted `git_source` clears the app's default git source.

Starting on or after 2026-12-10, [external access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) will be on by default for eligible workspaces with the compliance security profile enabled.

*The Gemini redirect keeps calls working, but the model behind them changes, so outputs tied to 3.6 Flash may differ. The Terraform change is the likeliest surprise: configurations that never set `compute_size` now act on it.*

## Postgres and the open-source stack

A PostgreSQL security page lists [CVE-2026-6460](https://www.postgresql.org/support/security/CVE-2026-6460/), arbitrary code execution in Postgres. Separately, [PostgreSQL 18.7, 17.12, 16.16, 15.20 and 14.25](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/) were released as an update to all supported versions, alongside 19 RC 2.

Other changes in the open-source stack:
- [Dagster 1.13.30](https://github.com/dagster-io/dagster/releases/tag/1.13.30) dropped Python 3.10 and now requires 3.11 or later.
- [Great Expectations 1.25.0](https://github.com/great-expectations/great_expectations/releases/tag/1.25.0) now counts rows with a NULL in a compared column as unexpected for four expectations on SQL backends, matching pandas.
- Apache Airflow published first stable releases of its [TypeScript](https://github.com/apache/airflow/releases/tag/ts-sdk/1.0.0), [Java](https://github.com/apache/airflow/releases/tag/java-sdk/1.0.0) and [Go](https://github.com/apache/airflow/releases/tag/go-sdk/v1.0.0) SDKs, all at 1.0.0.

*The Great Expectations change can turn passing SQL checks into failures with no change in the data. Three stable Airflow SDKs at once suggest that authoring Airflow tasks outside Python is leaving beta.*

## EU AI Act dates

The Commission adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) of 10 November 2026. It sets rules for establishing, operating and supervising AI regulatory sandboxes under Regulation (EU) 2024/1689. EUR-Lex also lists Commission [guidelines on the transparency obligations under Article 50](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005) of the AI Act, as a preparatory document.

The [AI Act timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) marks 2026-12-02 for two things: bans on sexual deepfakes and CSAM generators, and the end of the Art. 50(2) transition.

In the Tweede Kamer, a [motion by El Boujdaini c.s.](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682) concerns equipping authorities sufficiently for supervision of the AI Regulation. [Finland and Estonia](https://www.politico.eu/article/eu-needs-a-system-to-respond-to-ai-incidents-finland-and-estonia-say/?utm_source=RSS_Feed&utm_medium=RSS&utm_campaign=RSS_Syndication) call, in a letter seen by Politico, for "EU-level arrangements for responding to serious AI incidents."

*The Article 50 guidelines appeared less than three weeks before the Art. 50(2) transition ends on 2026-12-02. That makes them the text to read for any client whose systems fall under that article.*
