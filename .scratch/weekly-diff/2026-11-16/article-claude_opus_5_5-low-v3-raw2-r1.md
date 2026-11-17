Anthropic released Claude Fable 5.2, and Claude Code made it the default Fable model. Claude Code also shipped several security fixes and one removed setting that drew complaints. Databricks published a cluster of retirement dates and default changes, PostgreSQL shipped updates to all supported versions, and the EU published Article 50 transparency guidelines under the AI Act.

## Claude Fable 5.2 and Claude Code

[Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) added Claude Fable 5.2 as "the default Fable model". The release notes list 1M context and $8/$40 per Mtok, with $0.20/Mtok cache reads.

The same release fixed several security-relevant bugs:

- MCP OAuth requests sent secrets such as refresh tokens to another host when a server redirected them.
- A read-only Bash command could run outside the sandbox without a permission prompt.
- Deny rules did not apply to files written by `cp` or `mv` into a directory.

[Pi v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) adds the model to its `anthropic` provider. According to Pi's notes, requests that Fable's safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback and billed at Opus 5's price. Pi v1.5.1 also changes the default model for that provider to Claude Opus 5.5.

On 2026-11-09, a [story on Artificial Analysis](https://artificialanalysis.ai/models/claude-fable-5-2) drew 335 points with the title "Claude Fable 5.2 scores 65 on Artificial Analysis, highest so far".

Later releases brought their own changes:

- [Claude Code v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) "fixed a security issue in how zstd-compressed responses are decoded".
- [v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) removed the `subagentStatusLine` setting. An [issue reports](https://github.com/anthropics/claude-code/issues/109446) that this removal leaves per-subagent context, cost, model and effort invisible, with no replacement.
- Another [issue reports](https://github.com/anthropics/claude-code/issues/108726) that `DISABLE_TELEMETRY=1` hides Fable 5.2 from the `/model` picker because feature flags are ignored.
- A Team subscriber [reports](https://github.com/anthropics/claude-code/issues/107390) that weekly usage reached 100% about 30.5 hours after reset.

*For teams pinning Claude Code versions, this week shows security fixes and a removed setting arriving in neighbouring releases. That makes the changelog worth reading before each upgrade. The Fable price and the Opus fallback billing that Pi describes both bear on cost estimates for client work.*

## Databricks dates and changed defaults

Several Azure Databricks notes carry dates:

| Date | What changes |
|:--|:--|
| 2026-11-19 | [Gemini 3.6 Flash will be retired](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026). Calls are redirected to Gemini 3.8 Flash at the same price. |
| 2026-11-30 | The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life. After that, requests fail. The note points to `system.ai.genie_one_mcp` in Unity Gateway. |
| 2027-02-04 | [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is retired, with GLM 5.3 as the recommended replacement. |

Defaults are moving too:

- Starting on or after 2026-12-10, [external access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) will be available by default for eligible workspaces with the compliance security profile enabled.
- After Databricks Runtime 15.4 LTS reaches end of support on 2027-08-19, all [Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits).
- [OAuth on-behalf-of for service principals](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-on-behalf-of-for-service-principals-is-generally-available) is generally available and turned on by default.
- [Smart Routing](https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta) now routes only subagents, not the first prompt, and Smart Routing for Codex is paused.

[Terraform provider v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) changes how `databricks_app` updates apps. An omitted `compute_size` now resets to `MEDIUM`, and an omitted `git_source` clears the app's default git source.

*The two November dates fall inside this month. The Terraform change can alter running apps whose configuration leaves those fields out. Compliance-profile workspaces in client estates face default changes in December worth checking against their access policies.*

## PostgreSQL and agent security reports

The PostgreSQL Global Development Group [released 18.7, 17.12, 16.16, 15.20, 14.25 and 19 RC 2](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/). Separately, the digest listed [CVE-2026-6460](https://www.postgresql.org/support/security/CVE-2026-6460/), titled "Arbitrary Code Execution in Postgres", as a security event. A [write-up](https://mehmetince.net/part-3-6-how-i-ended-up-turning-a-22-year-old-postgresql-type-confusion-primitive-into-rce-cve-2026-6460/) describes turning a 22-year-old type-confusion primitive into RCE.

In Hermes Agent, a security [issue reports](https://github.com/NousResearch/hermes-agent/issues/62336) that terminal environment snapshots write credential-bearing environment variables to disk in plaintext.

[OpenShell v0.1.8](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8) changes two behaviours:

- Static provider credentials without placement metadata now resolve only in the `Authorization` header unless declared otherwise.
- AWS SigV4 signing diagnostics no longer appear in supervisor TRACE logs.

*Agent tooling that handles credentials drew several reports this week. Where environment variables and logs hold secrets, they remain a recurring weak point.*

## Usage movements in agent tools and models

On OpenRouter's app rankings over the last 7 days:

| App | Rank | Tokens | Change vs previous week |
|:--|:--|:--|:--|
| [Kilo Code](https://kilocode.ai/) | week #5 | 7.03T | +46% |
| [Strix](https://strix.ai/) | week #9 | 2.56T | +45% |
| [OpenClaw](https://openclaw.ai/) | week #8 | 2.69T | -46% |
| [omp](https://omp.sh/) | week #11 | 2.13T | -36% |

omp's npm downloads rose to 295,519 (+34% vs previous week).

On GitHub, [Tencent/LoopForge](https://github.com/Tencent/LoopForge) gained 1,767 stars (+633%). In OpenRouter model usage on 2026-11-15, [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) ranked #2 with 18.12T tokens, up from #4 last week.

*These are one week's figures and show movement in that week, not a settled shift. The gap between omp's falling OpenRouter tokens and rising npm downloads suggests the two signals measure different kinds of use.*

## EU AI Act texts

The Commission published [guidelines on the Article 50 transparency obligations](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005), listed as a preparatory document. It also adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) on AI regulatory sandboxes.

The AI Act [timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) lists 2026-12-02 as the date when the Art. 50(2) transition ends. On 2026-11-09, the Tweede Kamer received a [motion on equipping authorities](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682) to supervise the AI Act.

*Guidelines on Article 50 published shortly before the Art. 50(2) transition ends give Dutch clients a text to read against their generative systems. As a preparatory document, they are worth watching for changes.*
