Anthropic released [Claude Fable 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2), and Claude Code made it the default Fable model. Claude Code then shipped two more releases, and one of them removed a setting without a replacement. Azure Databricks published several retirement dates and changed defaults, while the EU adopted rules for AI Act regulatory sandboxes ahead of a 2 December transition date.

## Claude Fable 5.2 and Claude Code

[Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) added Claude Fable 5.2 (`claude-fable-5-2`) as "the default Fable model", with 1M context, priced at $8/$40 per Mtok and $0.20/Mtok for cache reads. The same release fixed MCP OAuth requests that sent secrets such as refresh tokens to another host when a server redirected them. It also fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt. Anthropic describes the model as its "most capable model for the most demanding technical work", according to its [OpenRouter listing](https://openrouter.ai/anthropic/claude-fable-5.2). A story reports that it [scores 65 on Artificial Analysis, highest so far](https://artificialanalysis.ai/models/claude-fable-5-2).

An issue reports that [`DISABLE_TELEMETRY=1` hides Fable 5.2 from the /model picker](https://github.com/anthropics/claude-code/issues/108726), because the client then ignores feature flags. The reporter says `claude --model claude-fable-5-2` still works in the same configuration.

[v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) added Code Mode, an experimental opt-in in which Claude writes JavaScript to call its tools. It also added `engines["claude-code"]` version ranges for plugins. An issue reports that this release [removed `subagentStatusLine` with no replacement](https://github.com/anthropics/claude-code/issues/109446), which hides per-agent context, cost, model and effort. Another user reports that, since 2.1.321, [messages sent from the iOS app mid-turn no longer reach Claude](https://github.com/anthropics/claude-code/issues/108975) until the turn ends. [v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) then fixed "a security issue in how zstd-compressed responses are decoded".

_For teams that set telemetry off in shared settings, the reported issue suggests that new models may not appear where users expect them. Three releases in one week, with one removed setting, suggest that pinned versions are worth weighing against the security fixes._

## Databricks dates and changed defaults

Several Azure Databricks changes carry dates. The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) reaches end of life on November 30, 2026, after which requests fail. The replacement named is the `system.ai.genie_one_mcp` MCP in Unity Gateway.

[Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026) will be retired on November 19, 2026. From that date, calls are redirected to Gemini 3.8 Flash at the same price. [Zhipu AI GLM 5.2](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement) is deprecated and will be retired on February 4, 2027, and GLM 5.3 is the recommended replacement.

Starting on or after December 10, 2026, [external access to Unity Catalog managed Delta tables](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled) will be available by default for eligible workspaces with the compliance security profile enabled. After Databricks Runtime 15.4 LTS reaches end of support on August 19, 2027, [all Unity Catalog managed tables will be upgraded to catalog commits](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits).

[OAuth on-behalf-of for service principals](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-on-behalf-of-for-service-principals-is-generally-available) is now generally available and turned on by default.

[Terraform provider v1.143.0](https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0) changes how `databricks_app` updates apps. Compute settings now take effect. An omitted `compute_size` resets to `MEDIUM`, and an omitted `git_source` clears the app's default git source.

_The two nearest dates fall within this month, and one of them ends in failing requests rather than a redirect. The Terraform change is likely to show up as altered app sizing wherever configurations left those fields out._

## Snowflake and BigQuery governance features

Snowflake added [temporary role grants](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-temporary-role-grants-preview) in preview, using `FOR INTERVAL` or `UNTIL`. It also made it possible to [override per-user quota limits](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-limit-overrides) for specific users, which is generally available. A new [INTEGRATIONS view in ACCOUNT_USAGE](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-account-usage-integrations-view-preview) is in preview.

BigQuery made [project caps](https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026) generally available in the Enterprise and Enterprise Plus editions. It also opened [compute cost attribution](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026) in preview.

_Both vendors added controls for who spends what and for how long in the same week. This suggests that cost and access limits per user or project are a shared focus this week._

## EU AI Act steps

The Commission adopted [Implementing Regulation (EU) 2026/2487](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487) on AI regulatory sandboxes. It also published [guidelines on the Article 50 transparency obligations](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005), listed as a preparatory document. The AI Act calendar shows that the [Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) on 2026-12-02. In the Netherlands, a Tweede Kamer motion asks to [equip authorities for supervision of the AI Act](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682).

_With the Article 50 guidance published shortly before the transition date, clients with generative features in the EU will likely look to it first._

## Coding agent usage

On OpenRouter, [Kilo Code](https://kilocode.ai/) used 7.03T tokens/week (+46% vs previous week), and [Strix](https://strix.ai/) used 2.56T (+45%). [OpenClaw](https://openclaw.ai/) fell to 2.69T (-46%), and [omp](https://omp.sh/) fell to 2.13T (-36%), though its npm downloads rose 34%. [Hermes Agent](https://hermes-agent.nousresearch.com/) ranked week #3 with 13.02T tokens/week, ahead of [Claude Code](https://claude.ai/code) at week #4 with 10.80T.

_These figures show sharp swings within one week among the open agents. They do not yet show a lasting shift._
