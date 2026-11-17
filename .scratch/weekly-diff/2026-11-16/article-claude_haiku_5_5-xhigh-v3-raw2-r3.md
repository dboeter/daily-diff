[Claude Code](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) and [Pi](https://github.com/earendil-works/pi/releases/tag/v1.5.1) added Claude Fable 5.2 on 2026-11-09, and Pi also changed the default model for its anthropic provider to Claude Opus 5.5. [Azure Databricks](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) published two model retirement dates, and [security fixes](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) and security reports appeared in agent tools and PostgreSQL. The [EU calendar](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) lists one dated AI Act item in its next 30 days.

## Model retirements, redirects and defaults

[Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) will be retired on 2026-11-19, and its API calls are then automatically redirected to Gemini 3.8 Flash at the same price. [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is deprecated and will be retired on 2027-02-04, with GLM 5.3 as the recommended replacement. [Smart Routing](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta) (Beta) now routes only subagents, not the first prompt, and costs up to 70% less in internal benchmarks.

Defaults changed too. [Claude Code 2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) made Claude Fable 5.2, at $8/$40 per Mtok, the default Fable model. [Pi v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) changed the default model for the anthropic provider to Claude Opus 5.5, and its notes say that requests Fable 5.2's safety classifiers refuse are answered by Claude Opus 5 through server-side fallback, billed at Opus 5's price.

*A redirect or a fallback can change the model, or the price, behind a call without any change to the code that makes it.*

## Behavior changes and dated deadlines

[Great Expectations 1.25.0](https://github.com/great-expectations/great_expectations/releases/tag/1.25.0) changes results on SQL backends: four Expectations now count rows with a NULL in a compared column as unexpected, which the release says matches pandas. The [Terraform provider for Databricks v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) now applies compute settings that the synchronous update API ignored, and an omitted compute_size resets to MEDIUM. [Snowpark Python 1.57.0](https://github.com/snowflakedb/snowpark-python/releases/tag/v1.57.0) no longer takes the parse_mode, row_boundary and extract_images options in DataFrameReader.documents(), a Private Preview API.

The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life on 2026-11-30, after which requests fail. [External access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) will be available by default for eligible workspaces with the compliance security profile enabled, starting on or after 2026-12-10.

*A new release can change results or resource sizes on its next run with no edit to the calling code, so an upgrade is worth watching as a change in its own right.*

## Coding agent releases and open reports

[Claude Code 2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) added Code Mode as an experimental opt-in and removed the subagentStatusLine setting. A [bug report](https://github.com/anthropics/claude-code/issues/109446) says the removal left no replacement, so per-agent context, cost, model and effort no longer show in the agent panel. [OpenCode v2.3.0](https://github.com/anomalyco/opencode/releases/tag/v2.3.0) made subagents always run in the background and made low the default transcript verbosity.

Two issue reports describe problems. One macOS user's local transcripts show 47 of 51 Claude Code sessions with a failed first [Claude in Chrome](https://github.com/anthropics/claude-code/issues/108679) call, from 2026-11-07 21:10 UTC to 2026-11-09. A [second report](https://github.com/anthropics/claude-code/issues/108726) says that setting DISABLE_TELEMETRY to 1 hides Fable 5.2 from the /model picker.

On OpenRouter, [Kilo Code](https://kilocode.ai/) ranked week #5 among OpenRouter apps, with 7.03T tokens in the last 7 days (+46% vs previous week). [OpenClaw](https://openclaw.ai/) ranked week #8, with 2.69T tokens in the last 7 days (-46% vs previous week).

*One week of ranks shows movement within that week, not a lasting shift. Kilo Code and OpenClaw moved 46% in opposite directions, which suggests churn between agent apps.*

## Security fixes and reports across tools

[Claude Code 2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) fixed MCP OAuth requests that sent secrets such as refresh tokens to another host when a server redirected them. It also fixed a read-only Bash command that ran outside the sandbox without a permission prompt. [Claude Code 2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixed a security issue in how zstd-compressed responses are decoded. A Hacker News item titled "CVE-2026-6460 – Arbitrary Code Execution in Postgres" links to [PostgreSQL's security page](https://www.postgresql.org/support/security/CVE-2026-6460/).

Other reports cover credentials and requests. An [issue](https://github.com/NousResearch/hermes-agent/issues/152674) reports that Hermes Agent desktop messages are admitted as uid:10000 instead of the logged-in user, after a sign-in the server logs as successful. A [Codex issue](https://github.com/openai/codex/issues/61489) reports a 400 for highly compressible content, where the issue says the documented response is 413, and says every later turn in that thread then fails.

*These are individual reports, each describing one user's setup. Credential and request handling come up in several tools this week, which makes it worth watching.*

## EU and Dutch AI policy dates

A [Commission Implementing Regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) dated 2026-11-10 lays down rules for AI regulatory sandboxes under Regulation (EU) 2024/1689, and its stage is Regulation adopted. The [Article 50 transparency guidelines](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005) are listed as a preparatory document. A [targeted consultation](https://digital-strategy.ec.europa.eu/news-redirect/964768) on draft revised election guidelines under the Digital Services Act covers measures that very large online platforms and search engines should adopt against generative AI and information manipulation risks to electoral processes.

Motions in the Tweede Kamer on the 2027 Economic Affairs and Climate budget address a [legal framework for liability for damage caused by AI models](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24563&did=2026D56703) and [adequately equipping authorities to supervise the AI Regulation](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682). The calendar's 30-day table lists one date, [2026-12-02](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act), for AI Act bans on sexual deepfakes and CSAM generators and the end of the Art. 50(2) transition.

*For EU clients, the sandbox rules are already adopted while the Article 50 guidance is at the preparatory stage, and the Art. 50(2) transition ends on 2026-12-02. That suggests the guidance sits at an earlier stage than the rules, a reading from stage labels alone.*
