===== 2026-11-10 · AI Agents =====

### Claude Code v2.1.322
kind: release · source: anthropics/claude-code · published: 2026-11-10 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.322
## What's changed - Added fast mode on Vertex in the global, us and eu regions, falling back to standard speed if Vertex refuses it

### Claude Code v2.1.321
kind: release · source: anthropics/claude-code · published: 2026-11-09 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.321
## What's changed - Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model — 1M context, $8/$40 per Mtok with $0.20/Mtok cache reads - Added `--settings <file>` to `claude remote-control`, which applies a settings file to every session it starts; if the file changes, no new session starts until you restart `claude remote-control` - Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them - Fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt - Fixed a case where Bash permission checks judged a file write from the wrong folder and didn't prompt - Fixed deny rules and protected-file prompts not applying to the file that a `cp` or `mv` into a directory writes - Fixed the "Draws from usage credits" note showing after a switch to Fable on Enterprise seats whose plan includes Fable - Fixed the fallback model sometimes declining a request or mentioning a stopped response when the first model was blocked before replying - Fixed `claude mcp login` printing a SEP-2352 issuer warning each time you sign in again to a server that Claude Code registered with - Fixed `NotebookEdit` deleting or overwriting a notebook's first cell when the call named no cell, on network paths (UNC shares, WSL folders, `/net` mounts) - Fixed Edit changing the first of several matches, replacing a whole file on an empty `old_string`, or editing a notebook as text, on network paths (UNC shares, WSL f

### [BUG] Claude Team weekly usage reached 100% ~30.5 hours after reset (Nov 4–5, 2026)
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-05 · link: https://github.com/anthropics/claude-code/issues/107390
### Preflight Checklist - [x] I have searched [existing issues](https://github.com/anthropics/claude-code/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug) and this hasn't been reported yet - [x] This is a single bug report (please file separate reports for different bugs) - [x] I am using the latest version of Claude Code ### What's Wrong? I am experiencing unexpectedly rapid weekly usage consumption on my Claude Team subscription. During October 2026, I regularly used Claude Code heavily for software development. My five-hour session allowance often exhausted within approximately two hours of active work, but I could continue using Claude Code across the week without reaching the weekly limit. However, during the weekly cycle beginning November 4, 2026, my entire weekly allowance was exhausted in approximately **30 hours and 31 minutes**, despite no intentional change to my development workflow. ### Timeline (Sri Lanka time, UTC+05:30) | Date and time | 5-hour usage | Weekly All models | Weekly Fable | |---|---|---|---| | Nov 4, 3:30 AM | — | Weekly reset | Weekly reset | | Nov 4, ~11:05 AM | 100% | 34% | 8% | | Nov 5, ~10:01 AM | 4% | 100% | 12% | The weekly usage increased from 34% to 100% in less than 23 hours. At the time of complete weekly exhaustion, my current five-hour session showed only 4% usage. The next weekly reset is November 11, 2026, at 3:30 AM, leaving almost six days without further included weekly usage. I understand that usage depends on model choice, to

### [BUG] Claude in Chrome: desktop bridge 403 "OAuth token forbidden" on Windows (token scopes user:inference user:office), Pro plan confirmed by support
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-06 · link: https://github.com/anthropics/claude-code/issues/107922
### Preflight Checklist - [x] I have searched [existing issues](https://github.com/anthropics/claude-code/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug) and this hasn't been reported yet - [x] This is a single bug report (please file separate reports for different bugs) - [x] I am using the latest version of Claude Code ### What's Wrong? Since ~29 October 2026, Claude in Chrome does not connect to the Claude desktop app (Code tab) on Windows. The desktop app's connection to the cloud bridge `wss://bridge.claudeusercontent.com/chrome/<ACCOUNT_UUID>` is rejected with 403 every few seconds, so all `mcp__claude-in-chrome__*` tools report "Claude in Chrome is not connected". Support confirmed that my Claude Pro plan is active and is not the cause, but they cannot escalate it from chat. This looks the same as #55827 (Windows, same token scopes), which was auto-closed as a duplicate without a fix. **Environment** - OS: Windows 11 Pro (build 26300) - Claude desktop app: 4.23118 (Code tab), bundled Claude Code 2.1.317 - Chrome extension: Claude in Chrome (`fcoeoabgfenejglbffodgkkbkcdhcgfn`), installed in one Chrome profile only - Plan: Claude Pro (personal, single-user org, bought via Google Play), confirmed active by support - Network: direct connection, no VPN or proxy **Token scopes** - Token the desktop app uses for the bridge: `user:inference user:office` - Claude Code session token in the same app: `user:inference user:file_upload user:profile user:sessions:claude_code user:p

### Pi v1.5.1
kind: release · source: earendil-works/pi · published: 2026-11-09 · link: https://github.com/earendil-works/pi/releases/tag/v1.5.1
### New Features - **Shell login and logout**: use `pi auth login <provider>` and `pi auth logout <provider>` without starting a session, with API-key and no-browser sign-in options. See [Credential commands](https://github.com/earendil-works/pi/blob/v1.5.1/packages/coding-agent/docs/cli.md#credential-commands). - **Idle prompt cache warming**: eligible caches now stay warm for up to 30 minutes between runs when a refresh is expected to pay for itself. See [`cacheWarming`](https://github.com/earendil-works/pi/blob/v1.5.1/packages/coding-agent/docs/settings.md#model-and-thinking). - **Anthropic message threads**: requests send only new messages while the server continues the conversation, with full-request fallback when earlier context changes. See [Anthropic compatibility](https://github.com/earendil-works/pi/blob/v1.5.1/packages/coding-agent/docs/models-configuration.md#anthropic-messages). - **Richer Mermaid diagrams**: pie charts, author-defined styles, clickable labels on supported terminals, and diagrams in expanded branch and compaction summaries. See [Display settings](https://github.com/earendil-works/pi/blob/v1.5.1/packages/coding-agent/docs/settings.md#terminal-and-display) and [Markdown transformers](https://github.com/earendil-works/pi/blob/v1.5.1/packages/coding-agent/docs/extensions.md#piregistermarkdowntransformertransformer-options). - **GitHub Copilot classifiers**: call Microsoft-Decision-1 through codemode `models.classify()` for typed decisions and probabi

### Oh My Pi v18.18.6
kind: release · source: can1357/oh-my-pi · published: 2026-11-09 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.6
## @oh-my-pi/pi-catalog ### Fixed - LiteLLM lists only the models the configured key can call (its authenticated `/v1/models`), keeping the proxy's metadata for them; a proxy whose `/v1/models` fails now lists no models instead of every model it serves ([#18601](https://github.com/can1357/oh-my-pi/issues/18601)) ## @oh-my-pi/pi-coding-agent ### Added - In Tern, a turn's long-press menu on a phone can edit and resend a prompt, retry the turn, open the rewind page on it, or fork the session from it into a new session - A rewind from the transcript says how many turns it dropped and offers Undo on its toast in Tern, which puts the turns and your draft back ### Changed - Browser `role/` selectors in Chrome tabs now match the role and name Chrome's accessibility tree reports, so they reach open shadow roots and skip hidden elements; in Tern every name `observe()` reports selects its element again ([#18632](https://github.com/can1357/oh-my-pi/pull/18632) by [@will-bogusz](https://github.com/will-bogusz)) ### Fixed - A late usage-limit error from a previous provider no longer blocks or cools down the selected provider; when the old provider has spent its retry budget, a replay-safe turn still tries the selected model without the old quota delay ([#17098](https://github.com/can1357/oh-my-pi/issues/17098), [#17571](https://github.com/can1357/oh-my-pi/pull/17571) by [@Bensonluo](https://github.com/Bensonluo)) - Multi-question ask forms in Tern show Submit on the last question tab, not

### Oh My Pi v18.18.4
kind: release · source: can1357/oh-my-pi · published: 2026-11-09 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.4
## @oh-my-pi/pi-ai ### Added - Added the `base64SkipThoughtSignature` compat flag so Gemini gateways that decode `thoughtSignature` as base64 (such as the Hyperspace AI LLM proxy) can receive the unsigned-tool-call bypass sentinel without rejecting the request with a 400 ([#18586](https://github.com/can1357/oh-my-pi/pull/18586) by [@tuandinh0801](https://github.com/tuandinh0801)). ### Changed - Providers paused by a `disabled` auth rule (currently Google Antigravity) are left out of the built-in login list, refuse login, token refresh and usage probes, resolve no key from any source, and refuse requests and image generation with the pause reason; stored logins are kept and work again once the rule is removed, and an extension that registers its own login under the paused id takes it back ([#18622](https://github.com/can1357/oh-my-pi/pull/18622) by [@H4vC](https://github.com/H4vC)) ### Fixed - Exclusive tools (`edit`, `write`, `eval`, …) called as Cursor MCP tools now keep their place in the tool batch, so a shell or read sent with an edit no longer runs against the old file or starts before an earlier call finishes ([#18502](https://github.com/can1357/oh-my-pi/pull/18502) by [@eggpeat](https://github.com/eggpeat)) ## @oh-my-pi/pi-catalog ### Added - Added Otari gateway provider: `/login otari` with `OTARI_API_KEY`, models discovered live per workspace ([#17841](https://github.com/can1357/oh-my-pi/pull/17841) by [@tbille](https://github.com/tbille)) - Added the `base64SkipThou

### Hermes Agent Hermes Agent v0.23.1
kind: release · source: nousresearch/hermes-agent · published: 2026-11-10 · link: https://github.com/nousresearch/hermes-agent/releases/tag/v0.23.1
# Hermes Agent v0.23.1 **Release Date:** November 9, 2026 > Patch release. This tag rolls up the ~618 PRs merged since v0.23.0 into a stable release for the GitHub release (CLI and installers), the Microsoft Store app, Docker and Hermes Cloud. Full curated notes for this window ship with v0.24.0. **What this patch ships for plugin users:** since the plugin catalog's site deploy on November 9, the published `plugin-catalog.json` was larger than the 2 MiB cap clients accept, so every install silently fell back to the catalog it shipped with. `hermes plugins install <name>` could not find plugins added since your last update, installed the pin your release shipped instead of the current one, and missed newer `removed` entries. This release raises the cap to 16 MiB, so the live catalog is used again ([#151860](https://github.com/NousResearch/hermes-agent/pull/151860), fixes [#151856](https://github.com/NousResearch/hermes-agent/issues/151856), thanks @100yenadmin). Installs that stay on v0.23.0 or older keep falling back until they update. <!-- HERMES_BUILDS_TABLE --> ## About this release Measured at commit `3b421578588`, the window since v0.23.0 contains **2,578 non-merge commits** across **2,781 changed files** (+151,690 / −62,595), **618 merged PRs** and **409 closed issues**. Also in the window, undocumented here on purpose: Esc backtrack in the TUI and classic CLI (replacing the rewind list picker), group chats that run on a gateway without Desktop and can seat bots from ot

===== 2026-11-10 · AI Models & Labs =====

### Claude can design electronic prototypes from start to finish
kind: lab-post · source: anthropic · published: 2026-11-09 · link: https://www.anthropic.com/research/claude-electronics-design
01 Reasoning through geometric problems Testing Claude on real-world electronics design 01 Reasoning through geometric problems 02 Revising designs 03 Using software and documentation 04 Keeping track of constraints and downstream effects 05 Designing for real-world manufacturing 06 Limitations and next steps Published Nov 9, 2026 Team Science A little over a year ago, we began testing how well Claude could design basic electronic circuits. We collaborated with Diode Computers , 1 a company that designs and manufactures circuit boards, to train Claude on simple tasks—for example, on reading a chip’s datasheet and working out which parts a chip needs in order to run. The models we experimented with back then couldn’t reliably lay out a circuit board; they also struggled to design components that fit together. Now, Claude can both design and prototype electronic hardware from start to finish. Engineering an electronic device requires working through many complex steps and practical constraints. You have to not only design and simulate a circuit board, but also reason about the board’s physical layout and how it will behave, model the mechanical components, and write firmware—all while keeping track of which parts are readily available and what a factory is set up to build. To see how newer Claude models have improved in this area, we collaborated with Diode again, this time asking Claude Fable 5.2 to design three electronic devices: a speakerphone, a voice-assistant hub, and a

### Control Room
kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/index/control-room/
(the source gave no text)

### Chatgpt Enterprise Aws Marketplace
kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/index/chatgpt-enterprise-aws-marketplace/
(the source gave no text)

### Nex AGI: Nex-N2.6
kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/nex-agi/nex-n2.6
Nex-N2.6 is an agentic model from Nex AGI, built on [GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash-BF16) with about 321B parameters. It is suited for computer use, coding, and long-horizon tasks that involve tools. Compared with...

### Thinking Machines: Inkling 2 Small (free)
kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/thinkingmachines/inkling-2-small:free
Inkling 2 Small is a multimodal mixture-of-experts reasoning model from Thinking Machines Lab, with 17B active parameters out of 594B total. It is the first model in the second Inkling...

### Anthropic: Claude Fable 5.2
kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/anthropic/claude-fable-5.2
Claude Fable 5.2 is Anthropic's most capable model for the most demanding technical work, with gains over Fable 5.1 in coding, reasoning, and vision. In prerelease testing it completed otherwise-infeasible...

### Anthropic: Claude Fable 5.2 (batch)
kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/anthropic/claude-fable-5.2:batch
Claude Fable 5.2 is Anthropic's most capable model for the most demanding technical work, with gains over Fable 5.1 in coding, reasoning, and vision. In prerelease testing it completed otherwise-infeasible...

### Meta: Muse Ember
kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/meta/muse-ember
Muse Ember is the smallest and most efficient model from Meta that’s designed for complex reasoning execution and the work agents repeat all day: tool calls, coding agent subtasks, routing,...

===== 2026-11-10 · AI Policy =====

### Commission preliminarily finds TikTok’s ‘For You’ feed in breach of Digital Services Act for harmful ‘rabbit holes’ effect
kind: policy-item · source: European Commission · published: 2026-11-06 · link: https://digital-strategy.ec.europa.eu/news-redirect/964582
The European Commission has preliminarily found TikTok in breach of the Digital Services Act (DSA) for the so-called ‘rabbit hole effect’ of its recommender system.

### Pennsylvania Enacts Artificial Intelligence Deceptive Advertising Act
kind: policy-item · source: Covington Inside Privacy · published: 2026-11-09 · link: https://www.insideprivacy.com/artificial-intelligence/pennsylvania-enacts-artificial-intelligence-deceptive-advertising-act/
On October 22, 2026, the Governor of Pennsylvania signed the Artificial Intelligence Deceptive Advertising Act (Senate Bill 806) (“Act”) into law. The Act joins a growing number of state laws focused on the use of AI in advertising. However, unlike the laws in New York and California, Pennsylvania’s disclosure requirement is not limited to AI-generated... Continue Reading…

===== 2026-11-10 · Data Engineering =====

### Databricks CLI v1.25.0
kind: release · source: databricks/cli · published: 2026-11-09 · link: https://github.com/databricks/cli/releases/tag/v1.25.0
### CLI * `databricks aitools install --output json` now reports a more specific `error_category` (`MANIFEST_NOT_FOUND`, `PERMISSION_DENIED`, `FILESYSTEM`) for some failures it reported as `UNCATEGORIZED`. ([#7380](https://github.com/databricks/cli/pull/7380)) * Suggest `databricks auth logout --profile <profile-name> --delete` when multiple profiles match the same workspace in `databricks auth docker` commands. ([#7363](https://github.com/databricks/cli/pull/7363)) * Fix `%pip` in Jupyter notebooks opened over `databricks ssh connect` on serverless environment versions 5 and 6 and on dedicated clusters running recent Databricks Runtime versions, which fell back to the stock IPython magic instead of the Databricks one. ([#7263](https://github.com/databricks/cli/pull/7263)) ### AI Runtime * `databricks air run` now validates the config server-side while it uploads the run artifacts, instead of before, which shortens submission. ([#7368](https://github.com/databricks/cli/pull/7368)) * Remove `CRITICAL` as a valid `compute.priority_class` value; the AI Runtime API no longer accepts it. ([#7371](https://github.com/databricks/cli/pull/7371)) ### Bundles * Built-in templates add the workspace ID to `workspace.host` (`?w=<id>`) when the profile or an environment variable sets it, so generated bundles select the right workspace on hosts shared by several workspaces. Welcome messages show the same URL, and `dbt-sql` also adds `?o=<id>` to the HTTP path it suggests for `dbt init`. ([#7

### Terraform provider for Databricks v1.142.0
kind: release · source: databricks/terraform-provider-databricks · published: 2026-11-09 · link: https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.142.0
### New Features and Improvements * `databricks_connection` now supports referencing Unity Catalog secrets through the `secrets` argument ([#6126](https://github.com/databricks/terraform-provider-databricks/pull/6126)). * Add resource and data sources for `databricks_lakewatch_datasource`. * Add resource and data source for `databricks_lakewatch_datasource_config`. * Add resource and data source for `databricks_lakewatch_rule_config`. * Add resource and data source for `databricks_lakewatch_alert_config`. * Add resource and data source for `databricks_lakewatch_common_config`. * Add resource and data sources for `databricks_lakewatch_rule`. * Add `databricks_app_slack` and `databricks_app_teams` configuration blocks to `databricks_notification_destination`, and accept `DATABRICKS_APP_SLACK` and `DATABRICKS_APP_TEAMS` as `type` in the `databricks_notification_destinations` data source ([#6131](https://github.com/databricks/terraform-provider-databricks/pull/6131)). ### Bug Fixes * Fix data races when concurrent resource operations access the unified provider's client caches ([#6120](https://github.com/databricks/terraform-provider-databricks/pull/6120)). * Preserve `databricks_pipeline.expected_last_modified` during refresh to avoid post-apply drift ([#6133](https://github.com/databricks/terraform-provider-databricks/pull/6133)).

### Who is actually using your Snowflake MCP server?
kind: community-post · source: Snowflake on Medium · published: 2026-11-09 · link: https://medium.com/snowflake/who-is-actually-using-your-snowflake-mcp-server-683a6cb543d7
How to see who sends queries through MCP, how many and how often, using one join in account usage Snowflake has no column that tells you which MCP server a query came through. It does store the name of the OAuth security integration that every MCP client signs in with. Give each MCP server its own integration, join one column from query history to login history, and you have usage per server, user and day. This article shows how, and where the approach stops working. Setting up a Snowflake-managed MCP server takes a few minutes. A few weeks later, the same client usually comes back with a different question: is anyone using it? Which users, how often, and is it worth it? I get this question from clients regularly. The last one put it as a requirement: a model that contains only queries run by their reporting team through one specific MCP server, without the same people’s Snowsight work, and with user, role, timestamp and volume. Two identical rows in query history My first thought was …

### Databricks Genie app in Microsoft Teams is now generally available
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-in-microsoft-teams-is-now-generally-available
The Databricks Genie app in Microsoft Teams is now generally available. Chat with the app in a direct message or mention @Databricks Genie in a channel or group chat to get answers to data questions without leaving Microsoft Teams. See Databricks Genie app in Microsoft Teams.

### Databricks Genie app for Slack is now generally available
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-for-slack-is-now-generally-available
The Databricks Genie app for Slack is now generally available. Send a direct message to the app or mention @Genie in a channel or group DM to get answers to data questions without leaving Slack. See Databricks Genie app for Slack.

### Genie Search is now generally available
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-search-is-now-generally-available
Genie Search is now generally available. Genie Search indexes your organization's knowledge in sources such as Google Drive, Jira, Confluence, and Workday, so Genie One can search all of that knowledge in one place. Azure Databricks indexes each document's permissions with its content and keeps both current, so users see only the documents that they can already access in the source. Genie Search also powers the following features in Genie One: Org directories: Find teammates, browse the org chart, and view profiles from Workday. See Browse org directories in Genie One. Search in Discover: Search Azure Databricks assets and content from connected sources in one place. See Use Genie Search in Genie One. Databricks recommends using Genie Search together with MCP connectors, which let Genie One access live data and take action in the applications your team uses.

### Genie Ontology is now generally available
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-ontology-is-now-generally-available
Genie Ontology is now generally available. Genie Ontology is the context layer that gives Genie One, Genie Code, and other AI agents a business-aware map of your organization. It combines modeled knowledge that you define in Unity Catalog semantics with learned knowledge that Genie extracts from your assets and usage.

### Shift dates in Lakeflow Jobs parameters with date arithmetic (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#shift-dates-in-lakeflow-jobs-parameters-with-date-arithmetic-beta
Dynamic value references in Lakeflow Jobs can now shift a date by a duration before formatting it. For example, {{(job.start_time - 1.day).iso_date}} passes the date of the day before the run started to a task. Date arithmetic is in Beta. See Shift dates with date arithmetic.

### Recover dropped Unity Catalog volumes with UNDROP VOLUME
kind: vendor-note · source: Azure Databricks · published: 2026-11-07 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#recover-dropped-unity-catalog-volumes-with-undrop-volume
You can now recover a dropped Unity Catalog volume within 7 days. Find its ID with SHOW VOLUMES DROPPED, then run UNDROP VOLUME WITH ID to restore it with its privileges and tags. Requires Databricks Runtime 19 and above. See UNDROP VOLUME.

### Zhipu AI GLM 5.2 is scheduled for retirement
kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement
Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027. GLM 5.3 is the recommended replacement. See Legacy, deprecated, and retired models for migration guidance.

### Load Unity Catalog tables into PyTorch on AI Runtime (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#load-unity-catalog-tables-into-pytorch-on-ai-runtime-beta
UCDataset streams rows from Unity Catalog tables directly into PyTorch training loops on AI Runtime, without Spark or a SQL warehouse. It applies filter expressions and deletion vectors as it reads, and splits the matching rows across GPUs and data loader workers. See Load Unity Catalog tables into PyTorch with UCDataset.

### Smart Routing is faster and lower cost, and now routes subagents only (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-05 · link: https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta
Smart Routing now routes only subagents, not the first prompt. It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused. See Select models or use Smart Routing.

### Databricks SQL version 2026.45 is now available in Preview
kind: vendor-note · source: Azure Databricks · published: 2026-11-03 · link: https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202645-is-now-available-in-preview
Sections: Share views with or without history. Databricks SQL version 2026.45 is now available in the Preview channel. Review the following section to learn about new features. ALTER SHARE... ADD VIEW and ALTER SHARE... ALTER VIEW now accept the WITH HISTORY and WITHOUT HISTORY clauses. Existing history defaults are unchanged.

### Unifying SQL Pools: Upcoming changes to UI and APIs
kind: vendor-note · source: Microsoft Fabric · published: 2026-11-09 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Unifying-SQL-Pools-Upcoming-changes-to-UI-and-APIs/ba-p/5397390
Sections: What's changing and when; What this means for customers; Performance and cost considerations for new workspaces; What API consumers should update; Changes to GET API responses; Changes to PATCH API; Before unification (current behavior):; After unification (proposed behavior):; Next steps. SQL pools are Fabric Data Warehouse’s built-in workload management capability. They help administrators organize workloads and control how compute resources are allocated across them. SQL pool configurations are represented differently depending on whether a workspace uses the built-in or custom pool model. With unified SQL pools, we’re removing that distinction and representing all pools through a single configuration model across the UI and APIs. This removes the need to switch between built-in and custom modes, making SQL pool configurations easier to understand and manage consistently across the UI and APIs. This blog provides advance notice of upcoming changes to SQL pool configuration…

### Nov 09, 2026: Skill recommendations and suggestions to create and share skills in CoCo
kind: vendor-note · source: Snowflake · published: 2026-11-09 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-09-coco-skill-recommendations
CoCo now helps you find, create, and share skills as you work. These capabilities are rolling out gradually, so you might not see them in your CoCo sessions yet. They include the following:

### Nov 06, 2026: Anthropic Claude 5.5 and OpenAI GPT-6 models (General availability)
kind: vendor-note · source: Snowflake · published: 2026-11-06 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-06-claude-5-5-openai-gpt-6-ga
The following models are now generally available:

### Nov 03, 2026: Snowflake CoCo for Microsoft Excel and Snowflake CoCo for Google Sheets (Preview)
kind: vendor-note · source: Snowflake · published: 2026-11-03 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-coco-excel-sheets-preview
Snowflake CoCo for Microsoft Excel and Snowflake CoCo for Google Sheets are now available in preview. Each one adds CoCo as a chat pane inside your spreadsheet, connected to your live Snowflake data. From the pane, you can query data with natural language or SQL; build pivot tables, charts, and form

### IPADDRESS data type (General availability)
kind: vendor-note · source: Snowflake · published: 2026-11-08 · link: https://docs.snowflake.com/en/release-notes/2026/10_40
With this release, Snowflake is pleased to announce the general availability of the IPADDRESS data type. An IPADDRESS value stores an IPv4 or IPv6 address as a native 128-bit value. Snowflake validates each address, stores it in a canonical form, and compares values in numeric address order. Use TOI

### To support your FinOps practices, you can now opt in to compute cost attribution in BigQuery editions (Preview)
kind: vendor-note · source: BigQuery · published: 2026-11-09 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026
To support your FinOps practices, you can now opt in to compute cost attribution in BigQuery editions. This feature attributes billed compute charges directly to the query projects that use your administration project's reservation capacity. Allocating costs based on actual commitment and autoscaling slot usage lets you accurately track project-level costs and manage internal chargebacks. This feature is available in Preview.

===== 2026-11-10 · Community stories =====

### Amazon saves millions by replacing Sonnet 4.6 with Strands Decider
kind: story · source: Hacker News · published: 2026-11-10 · link: https://strandsagents.com/blog/amazon-saves-millions-replacing-sonnet-with-strands-decider/ · discussion: https://news.ycombinator.com/item?id=50436640
Two Amazon engineers swapped Claude Sonnet 4.6 for a decision model in one of the world's biggest internal ticketing systems.

### Claude Fable 5.2 and Mythos 5.2
kind: story · source: Hacker News · published: 2026-11-09 · link: https://www.anthropic.com/claude-fable-and-mythos-5-2 · discussion: https://news.ycombinator.com/item?id=50429068
Claude Fable 5.2 and Claude Mythos 5.2, our new models for the hardest technical challenges. Fable 5.2 sets a new bar in coding, finance, and the sciences.

### Ultorg: The User Interface for Relational Databases
kind: story · source: Hacker News · published: 2026-11-10 · link: https://www.ultorg.com/ · discussion: https://news.ycombinator.com/item?id=50435898
Ultorg is an efficient, spreadsheet-like user interface for relational databases. Query and edit data across tables and relationships, without SQL.

### Muse Ember: Our smallest, most efficient model
kind: story · source: Hacker News · published: 2026-11-09 · link: https://research.meta.ai/blog/muse-ember · discussion: https://news.ycombinator.com/item?id=50429024
Muse Ember is our smallest and most efficient model, designed for complex reasoning execution and the work agents repeat all day.

### Google Gemini routes personal Drive files and emails to human annotators
kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/thisisme6598/gemini_files/ · discussion: https://news.ycombinator.com/item?id=50429426
Documentation of Gemini File Leaking Behavior.

### Claude Fable 5.2 scores 65 on Artificial Analysis, highest so far
kind: story · source: Hacker News · published: 2026-11-09 · link: https://artificialanalysis.ai/models/claude-fable-5-2 · discussion: https://news.ycombinator.com/item?id=50431144
Analysis of Anthropic's Claude Fable 5.2 (Max, Default Fallback) and comparison to other AI models across key metrics including quality, price, performance (time per Intelligence Index task & time to first answer token), context window & more.

### Show HN: STE80 Humanizer – de-AI text by writing 80% of the way to ASD-STE100
kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/Dodaios/ste80-humanizer · discussion: https://news.ycombinator.com/item?id=50429144
STE80 Humanizer: agent skill that removes AI tells and rewrites text 80% of the way to ASD-STE100 (Simplified Technical English), the method Andrej Karpathy shared.

### Testing Claude on real-world electronics design
kind: story · source: Hacker News · published: 2026-11-09 · link: https://www.anthropic.com/research/claude-electronics-design · discussion: https://news.ycombinator.com/item?id=50429952
We asked Claude to design three electronic devices: a speakerphone, a voice-assistant hub, and a handheld virtual pet. The prototypes worked without any fixes to their circuitry.

### USB: A trust layer for AI skills and MCP servers
kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/PeepSick/usbplus · discussion: https://news.ycombinator.com/item?id=50432661
USB+ — Universal Systems Bridge. One skill format, every agent runtime: 529 skills, 16 target formats, Trust Layer (secscan + mcprobe), zero-dependency CLI, HTTP MCP server.

### Show HN: Airgap-check – find what your AI app silently downloads offline
kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/humanethq/airgap-check · discussion: https://news.ycombinator.com/item?id=50431705
Audit AI repositories for offline (--network none) crashes, silent telemetry, and .env secret routing

### ChatGPT Desktop forwards your SSH agent to remote machines
kind: story · source: Hacker News · published: 2026-11-09 · link: https://news.ycombinator.com/item?id=50422628 · discussion: https://news.ycombinator.com/item?id=50422628
(the source gave no text)

### Why Is AI Slop So Frustrating to Read?
kind: story · source: Hacker News · published: 2026-11-09 · link: https://zonderlabs.com/slop · discussion: https://news.ycombinator.com/item?id=50433799
Most AI slop is unclear writing. We break it into three faults and measure them: 78% of Claude Code reply sentences are unclear, vs 11% on Stack Overflow.

### 6 Hours of YouTube and 85 handtyped pages of notes on LLM Inference – Start here
kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/samir-sarwar/samir-vllm · discussion: https://news.ycombinator.com/item?id=50424199
small LLM inference engine from scratch, w/ 6+ hours of youtube tutorials & 85+ pages of handwritten notes included

### Ask HN: How do you evaluate the skills your AI agents use?
kind: story · source: Hacker News · published: 2026-11-09 · link: https://news.ycombinator.com/item?id=50426070 · discussion: https://news.ycombinator.com/item?id=50426070
(the source gave no text)

### Show HN: Glassbrain – Read your agent's brain, know what your agent knows
kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/voidixyn/glassbrain · discussion: https://news.ycombinator.com/item?id=50423154
Know what your agent knows: open, diff and review the knowledge graphs agents write. Plain JSON in, one HTML file out.

### How much does it cost to run a text game with LLMs
kind: story · source: Dev.to · published: 2026-11-08 · link: https://dev.to/hiper2d/how-much-does-it-cost-to-run-a-text-game-with-llms-57o7 · discussion: https://dev.to/hiper2d/how-much-does-it-cost-to-run-a-text-game-with-llms-57o7
AI costs are confusing. Providers give you a lot of numbers and nothing to actually know how much you are going to pay in the long run. There is no point in these input/cached/output token prices if you have no idea how many reasoning tokens you'll spend on your tasks. How much will be cached. We are going to review the real-world usage of 27 frontier models.

### Top 7 Best Agent Gateways
kind: story · source: Dev.to · published: 2026-11-09 · link: https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi · discussion: https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi
An agent is not just a chat window with better manners. It can call a model five times, search an

### Take Claude Code Above Average: Let Antigravity Review It
kind: story · source: Dev.to · published: 2026-11-09 · link: https://dev.to/gde/take-claude-code-above-average-let-antigravity-review-it-1f3g · discussion: https://dev.to/gde/take-claude-code-above-average-let-antigravity-review-it-1f3g
In November 2026, I spent a day building a small tool with Claude Code: a bridge that lets a second

### Don't Write More Prompts. Install These 10 Trending 'Skills' Instead
kind: story · source: Dev.to · published: 2026-11-09 · link: https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc · discussion: https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc
I found 10 trending skills on GitHub that can boost your agent power a lot, and I had to test them

===== 2026-11-11 · AI Agents =====

### [BUG] DISABLE_TELEMETRY hides Fable 5.2 from the /model picker because feature flags are ignored
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-10 · link: https://github.com/anthropics/claude-code/issues/108726
### What's Wrong? `DISABLE_TELEMETRY=1` does more than disable telemetry. It stops Claude Code from downloading feature flags and makes it ignore the flags cached on disk, so every flag falls back to its compiled default. Features that depend on a flag break silently. The case I hit: with `"env": {"DISABLE_TELEMETRY": "1"}` in `~/.claude/settings.json`, the `/model` picker does not offer Fable 5.2. The "Fable" row is still Fable 5.1: ``` 1. Default (recommended) Opus 5.5 · Best for everyday, complex tasks 2. Opus Opus 5.5 · Best for everyday, complex tasks 3. Fable Fable 5.1 · Most capable for your hardest and longest-running tasks 4. Sonnet Sonnet 5.5 · Efficient for routine tasks 5. Haiku Haiku 5.5 · Fastest for quick answers ``` The account has Fable 5.2: `claude --model claude-fable-5-2` works in the same configuration. Same root cause as #36460 (channels unavailable) and #86171 (Monitor tool unavailable). ### What Should Happen? `DISABLE_TELEMETRY` should stop analytics events and nothing else. The model list should be the same with telemetry on or off. With the variable removed, same binary and account: ``` 1. Default (recommended) Opus 5.5 · Best for everyday, complex tasks 2. Opus 5.5 For complex work and everyday tasks 3. Fable 5.2 For your toughest challenges 4. Sonnet 5.5 Most efficient for simpler tasks 5. Haiku 5.5 Fastest for quick answers ▸ More models ``` ### Error Messages/Logs With `DISABLE_TELEMETRY=1` (`--debug-file`): ``` [servedCatalog] off (flag) ``` Wi

### [FEATURE] Desktop app: option to make Enter insert a newline and Ctrl+Enter submit in the chat composer
kind: hot-issue · source: anthropics/claude-code · published: 2026-08-26 · link: https://github.com/anthropics/claude-code/issues/89673
### Feature request Add a way to make **Enter insert a newline** and **Ctrl+Enter (or Cmd+Enter) submit** in the **Desktop app's chat composer**. ### Current behavior - In the Desktop app, Enter always submits the message; the only way to get a newline is Shift+Enter. - `~/.claude/keybindings.json` (e.g. `{"context": "Chat", "bindings": {"enter": "chat:newline", "ctrl+enter": "chat:submit"}}`) works in the terminal TUI as documented, but is completely ignored by the Desktop app's composer. - This was reported in #25087, which was closed without a fix landing — the thread ends with an OS-level Karabiner-Elements workaround that only helps macOS users. There is no equivalent workaround on Windows. ### Why When writing longer, structured prompts (multi-line lists, pasted context plus instructions), it's very easy to accidentally send an incomplete message with a reflexive Enter. Enter-for-newline with a modifier-to-send is the standard convention in many chat/messenger apps, so muscle memory works against the current default. ### Proposed solutions (either would work) 1. Make the Desktop composer respect the `Chat` context in `~/.claude/keybindings.json`, or 2. Add a simple composer setting in the Desktop app: "Enter sends / Enter inserts newline (use Ctrl+Enter to send)". ### Environment - Claude Code Desktop app on Windows 11 (also affects macOS per #25087) 🤖 Generated with [Claude Code](https://claude.com/claude-code)

### OpenAI Codex 0.167.1
kind: release · source: openai/codex · published: 2026-11-10 · link: https://github.com/openai/codex/releases/tag/rust-v0.167.1
## Changelog Full Changelog: https://github.com/openai/codex/compare/rust-v0.167.0...rust-v0.167.1

### UI doesn't start in VS Code extension 26.51021.22027
kind: hot-issue · source: openai/codex · published: 2026-10-24 · link: https://github.com/openai/codex/issues/56655
### What version of the IDE extension are you using? 26.51021.22027 ### What subscription do you have? Pro ### Which IDE are you using? VS Code ### What platform is your computer? Microsoft Windows NT 10.0.26300.0 x64 ### What issue are you seeing? After upgrading the extension to v26.51021.22027 - Codex doesn't start, with this notification: --- Codex could not start The extension could not start its user interface. --- OS: Windows 11 Pro, 26H2, build 26300.9711 VS Code Version: 1.143.1 (user setup) Commit: e646868227c3e3a9e3f24277c8c7220be42c0be7 Date: 2026-10-22T17:23:22Z Electron: 43.7.7 ElectronBuildId: 15743441 Chromium: 150.0.7871.250 Node.js: 24.21.0 V8: 15.0.245.31-electron.0 @github/copilot: 1.0.100-1 @github/copilot-sdk: 1.0.23-preview.5 OS: Windows_NT x64 10.0.26300 ### What steps can reproduce the bug? Upgrade to this version and restart extensions ### What is the expected behavior? _No response_ ### Additional information Rolling back to 26.51007.21434 fixes the problem

### Gemini CLI Release v0.68.0
kind: release · source: google-gemini/gemini-cli · published: 2026-11-10 · link: https://github.com/google-gemini/gemini-cli/releases/tag/v0.68.0
## What's Changed * Changelog for v0.67.0-preview.0 by @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/29990 * Changelog for v0.66.0 by @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/29992 * docs(readme): clarify Gemini CLI scope, limitations, and tool landscape by @LyalinDotCom in https://github.com/google-gemini/gemini-cli/pull/29995 * fix(cli): bound inline history re-render after terminal width changes by @jvargassanchez-dot in https://github.com/google-gemini/gemini-cli/pull/29904 * fix(ui): handle surrogate pairs when truncating in sanitizeForDisplay by @diegogodinezr in https://github.com/google-gemini/gemini-cli/pull/29993 * fix(core): make isWithinRoot case-insensitive on Windows by @duvanka-prasad in https://github.com/google-gemini/gemini-cli/pull/29999 * fix(core): recognize dotted Gemini 3 models in supportsMultimodalFunctionResponse by @jesussamuel-byte in https://github.com/google-gemini/gemini-cli/pull/29982 * feat(cli): add extension validation command and evaluation tests by @tadipavan in https://github.com/google-gemini/gemini-cli/pull/29980 * fix(core): normalize leading slashes in file search query for @ autocomplete by @urielefrenvirtusa in https://github.com/google-gemini/gemini-cli/pull/29987 * fix(vscode-ide-companion): register all extension disposables in context.subscriptions by @jvargassanchez-dot in https://github.com/google-gemini/gemini-cli/pull/29994 * fix(core): list Auto in /model when dynamicMode

### OpenCode v2.2.7
kind: release · source: anomalyco/opencode · published: 2026-11-10 · link: https://github.com/anomalyco/opencode/releases/tag/v2.2.7
### Highlights - **GitHub Copilot Auto**: Pick **Auto** in the model picker when your Copilot account has an Auto pool, and Copilot's router chooses the model for each session at the Auto discount. If routing fails, OpenCode falls back to the account's default chat model. ([#62997](https://github.com/anomalyco/opencode/pull/62997)) - **Side Panel Tab Shortcuts**: Right-click a side panel tab and choose **Close tabs to the right**. `⌘W` now closes side panel tabs wherever focus is, `⌥⌘W` or `Ctrl+Alt+W` always closes the session tab, and `⌘⇧T` reopens the last closed tab of either kind where it was. ([#62922](https://github.com/anomalyco/opencode/pull/62922)) - **Mark Sessions Read or Unread**: Open the menu on a tab, Home row, project row or inbox card and choose **Mark as unread** to keep its dot until you next visit. ([#62889](https://github.com/anomalyco/opencode/pull/62889)) ### Breaking changes #### `@opencode/ai`: `ImageResponse.image` is removed This affects code that imports `@opencode/ai` directly. Read `response.images[0]` instead of `response.image`. ([#63011](https://github.com/anomalyco/opencode/pull/63011)) #### SDK: fewer endpoints wait for plugins to load On a Location that is still loading plugins, `agent.list` returns the agents loaded so far, and `integration.list`, `usage.limits`, `vcs.init`, `rpc.call` and `artifact.*` no longer wait up to 5 seconds. Entries and actions that a plugin provides appear when it finishes loading, so refresh on the matching `*.

### Pi v1.5.2
kind: release · source: earendil-works/pi · published: 2026-11-10 · link: https://github.com/earendil-works/pi/releases/tag/v1.5.2
### New Features - **Fork sessions whose folder is gone**: when a session's original folder was moved or deleted, you can now fork it into the current folder instead of only continuing, so later resumes no longer ask. See [Continue or switch sessions](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/sessions.md#continue-or-switch-sessions). ### Changed - When a session's working directory no longer exists, for example after the project folder was renamed, interactive mode now offers `Continue`, `Fork`, or `Cancel` instead of only continuing. `Continue` runs the session in the current directory without storing the choice, as before; `Fork` copies it into the current directory as a new session with a new ID, like `--fork`, so the next resume no longer asks. This applies at startup (`--session`, `--resume`), to `/resume`, to `/import`, and to `ctx.switchSession()` from extensions ([#11975](https://github.com/earendil-works/pi/pull/11975) by [@petrroll](https://github.com/petrroll), fixes [#11060](https://github.com/earendil-works/pi/issues/11060)) ### Fixed - Fixed `/import` of a session whose working directory no longer exists leaving a copy in the session directory, and continuing it leaving a second copy with the same ID (`s.jsonl` and `s-1.jsonl`); the failed copy is now removed ([#11975](https://github.com/earendil-works/pi/pull/11975) by [@petrroll](https://github.com/petrroll), fixes [#11060](https://github.com/earendil-works/pi/issues/11060)) -

### Oh My Pi v18.18.8
kind: release · source: can1357/oh-my-pi · published: 2026-11-11 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.8
## @oh-my-pi/pi-ai ### Fixed - Fixed concurrent OAuth requests rejected as `claude_code_version_too_old` failing instead of retrying with the required version ([#18651](https://github.com/can1357/oh-my-pi/issues/18651)) - Chat Completions gateway requests preserve explicit tool strict-mode choices, so Codex tools can omit optional arguments when callers set `strict: false` ([#18672](https://github.com/can1357/oh-my-pi/pull/18672) by [@0xeb](https://github.com/0xeb)). ## @oh-my-pi/pi-catalog ### Added - Added Muse Ember (`muse-ember-1.0`) on Meta Model API and Muse Code with the `minimal`–`max` reasoning effort ladder and its >200K long-context pricing - Added Gemini 4 Carbon pricing on the Gemini API, Vertex AI, Google Antigravity, and Cursor ($2 input / $0.10 cached / $10 output per 1M tokens through 2026-11-30, then $4 / $0.20 / $20), instead of showing $0 ([#18734](https://github.com/can1357/oh-my-pi/pull/18734) by [@eggpeat](https://github.com/eggpeat)) ### Fixed - Fixed regenerating the catalog marking 18 reasoning models as non-reasoning when NanoGPT's `<id>:thinking` sibling row had larger limits ([#18673](https://github.com/can1357/oh-my-pi/issues/18673), [#18728](https://github.com/can1357/oh-my-pi/pull/18728)) ## @oh-my-pi/pi-coding-agent ### Changed - `curl -fsSL https://omp.sh/install | sh` and `install.ps1` now install the standalone binary by default, even when bun is present, so installs get delta updates; pass `--source`/`-Source` for a bun package install - A

### Oh My Pi v18.18.7
kind: release · source: can1357/oh-my-pi · published: 2026-11-10 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.7
## @oh-my-pi/pi-ai ### Added - LiteLLM usage adapter (`@oh-my-pi/pi-ai/usage/litellm`) reporting a gateway's key and user USD budgets ([#17873](https://github.com/can1357/oh-my-pi/pull/17873) by [@maykonmichel](https://github.com/maykonmichel)) - `UsageApi.replaceConfiguredProviders` registers configuration-sourced usage providers between runtime overrides and the built-in resolver, and `UsageProvider.usesRequestKey` makes aggregate usage probe only the key inference would send ([#17873](https://github.com/can1357/oh-my-pi/pull/17873) by [@maykonmichel](https://github.com/maykonmichel)) ### Changed - Providers with a `login-warning` auth rule show their account risk before a new login and start it only after the user answers `yes`; any other answer or a cancel stores nothing, and their login-list entry is marked "(at your own risk)" ([#18499](https://github.com/can1357/oh-my-pi/issues/18499)) ### Fixed - Claude Fable launch resets now report the Fable weekly limit they clear instead of an unknown window ([#18661](https://github.com/can1357/oh-my-pi/pull/18661) by [@TheAifam5](https://github.com/TheAifam5)) ## @oh-my-pi/pi-catalog ### Added - Added Muse Ember (`muse-ember-1.0`) on Meta Model API and Muse Code with the `minimal`–`max` reasoning effort ladder and its >200K long-context pricing - Added the `login-warning "<text>"` auth rule, which makes a new login accept the stated account risk first ([#18499](https://github.com/can1357/oh-my-pi/issues/18499)) ### Changed - Resu

### Desktop ws identity lost — server mints identity-bearing ws ticket, message admission is uid:10000 (two accounts)
kind: hot-issue · source: nousresearch/hermes-agent · published: 2026-11-10 · link: https://github.com/NousResearch/hermes-agent/issues/152674
### Bug Description Desktop messages stop carrying the logged-in Nous user id: server dashboard-auth.log mints ws tickets WITH the correct user_id, but every chat message is admitted as principal "uid:10000". Reproduced with two different Nous accounts (fresh logins), after full app restart, full OS restart and Electron storage cleanup. Related to #152661 (same no_cookie loop signature in dashboard-auth.log), but here the client does complete sign-in and the ticket is minted — identity is lost between the ws ticket and the message admission. ### Steps to Reproduce 1. Desktop app (Windows 11) connected to a remote OAuth-gated gateway (Nous OAuth provider, behind Caddy), user signed in. 2. Log out and log back in (server logs native_token_success with the correct user id); optionally restart the app, reboot the OS, clear Electron storage, or sign in with a second Nous account. 3. Send any chat message. 4. Check server state.db: session_admissions.principal_id and sessions.user_id for the new session. ### Expected Behavior Messages carry the logged-in user's id (nous:nas_user:<uuid>) as they did until Nov 7 2026; a session that cannot be identified should fail loudly instead of silently degrading to the shared uid:10000. ### Actual Behavior dashboard-auth.log shows native_token_success and ws_ticket_minted with the correct user_id (67a3ff6f for account 1, 5fc47070 for account 2), and a chat message sent ~60 s later is recorded with session_admissions.principal_id = "uid:10000".

### OpenShell OpenShell v0.1.8
kind: release · source: NVIDIA/OpenShell · published: 2026-11-10 · link: https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8
## OpenShell v0.1.8 ### Quick install ```bash curl -LsSf https://raw.githubusercontent.com/NVIDIA/OpenShell/main/install.sh | OPENSHELL_VERSION=v0.1.8 sh ``` ### Upgrade notes - Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies, so custom headers such as `x-api-key`, query parameters, and path slots need an explicit placement declaration. Upgrade the gateway before the supervisor, and update existing imported profiles as needed, since editing reference YAML alone does not update the gateway catalog. `auth_style` selects the active placement, and fields for other styles are ignored. [#4886](https://github.com/NVIDIA/OpenShell/pull/4886) - REST endpoints now return `403` for HTTP upgrade requests in both enforce and audit modes. Configure WebSocket traffic with `protocol: websocket` and explicit handshake and message rules; `websocket_credential_rewrite: true` now requires a WebSocket endpoint. [#5336](https://github.com/NVIDIA/OpenShell/pull/5336) - OCSF sandbox attribution moved: supervisor events use `device.container.uid` and `device.container.name`, gateway API Activity and Detection Finding events use `resources` entries with `type: "sandbox"`, and other gateway classes use `unmapped.sandbox_id` and `unmapped.sandbox_name`. SIEM parsers that read top-level `container.uid` or `container.name` must update their mappings. [#5048](https://github.com/NVIDIA/OpenShe

===== 2026-11-11 · AI Models & Labs =====

### Anthropic launches roadshow for proposed initial public offering
kind: lab-post · source: anthropic · published: 2026-11-10 · link: https://www.anthropic.com/news/roadshow-launch
Anthropic launches roadshow for proposed initial public offering Published Nov 10, 2026 Category Announcements Today Anthropic, PBC launched the roadshow for its proposed initial public offering of its Class A common stock. The proposed offering consists of 825,000,000 shares of Class A common stock. Of these, 801,351,354 shares are being offered by Anthropic and 23,648,646 shares are being offered by certain existing stockholders. Anthropic will not receive any proceeds from the sale of shares by the selling stockholders. Anthropic also expects to grant the underwriters a 30-day option to purchase up to an additional 123,750,000 shares of its Class A common stock. The initial public offering price is expected to be between $70.00 and $78.00 per share. Anthropic has applied to list its Class A common stock on the Nasdaq Global Select Market under the symbol “ANT.” The proposed offering will be made only by means of a prospectus. Copies of the preliminary prospectus may be obtained from: Goldman Sachs & Co. LLC, Attention: Prospectus Department, 200 West Street, New York, NY 10282, by telephone at (866) 471-2526, or by email at prospectus-ny@ny.email.gs.com; or Morgan Stanley & Co. LLC, Attention: Prospectus Department, 180 Varick Street, 2nd Floor, New York, NY 10014. A registration statement relating to these securities has been filed with the U.S. Securities and Exchange Commission but has not yet become effective. These securities may not be sold, nor may offers to buy be

### Ai Effect On Freelance Work
kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/ai-effect-on-freelance-work/
(the source gave no text)

### Chatgpt Plus For Veterans
kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/chatgpt-plus-for-veterans/
(the source gave no text)

### Helping Caregivers Use Ai In Everyday Life
kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/helping-caregivers-use-ai-in-everyday-life/
(the source gave no text)

### Introducing Businesses Chatgpt
kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/introducing-businesses-chatgpt/
(the source gave no text)

### Closing Ai Guidance Gap Education
kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/index/closing-ai-guidance-gap-education/
(the source gave no text)

### Enabling A Data Driven Workforce Webinar
kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/enabling-a-data-driven-workforce-webinar/
(the source gave no text)

### Identifying And Scaling Ai Use Cases
kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/identifying-and-scaling-ai-use-cases/
(the source gave no text)

### How Openai Uses Codex
kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/how-openai-uses-codex/
(the source gave no text)

### Fine Tuning Gpt 4o Webinar
kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/fine-tuning-gpt-4o-webinar/
(the source gave no text)

### Baidu: ERNIE-5.5-Flash-Preview
kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/baidu/ernie-5.5-flash-preview
ERNIE 5.5 Flash Preview is the latest foundation model in the ERNIE family, with comprehensive improvements in coding, agentic capabilities, knowledge work, and deep research. It has 280 billion total...

### Baidu: ERNIE-Light-DT-1.0
kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/baidu/ernie-light-dt-1.0-intl
ERNIE-Light-DT-1.0 is based on open-source GLM models and includes research findings from Baidu Search's Lightning large model. It features Baidu Sparse Attention (BSA), a unique sparse attention mechanism developed by...

### Google: Gemini 4 Carbon
kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/google/gemini-4-carbon
Gemini 4 Carbon is a frontier Gemini 4 model from Google for coding, agentic and complex reasoning work. It takes text, image, audio, video and file input, supports long decode...

### Google: Gemini 4 Carbon (batch)
kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/google/gemini-4-carbon:batch
Gemini 4 Carbon is a frontier Gemini 4 model from Google for coding, agentic and complex reasoning work. It takes text, image, audio, video and file input, supports long decode...

===== 2026-11-11 · AI Policy =====

### Motie van het lid Beckerman over onderzoeken hoe kunstenaars en makers beter beschermd kunnen worden tegen AI 
kind: policy-item · source: Tweede Kamer · published: 2026-11-09 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24559&did=2026D56699
Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Motie van het lid El Boujdaini c.s. over autoriteiten voldoende toerusten voor het toezicht op de AI-verordening 
kind: policy-item · source: Tweede Kamer · published: 2026-11-09 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682
Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Motie van het lid Dassen over een juridisch kader voor de aansprakelijkheid bij schade van AI-modellen 
kind: policy-item · source: Tweede Kamer · published: 2026-11-09 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24563&did=2026D56703
Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Commission invites views on draft revised election guidelines under Digital Services Act
kind: policy-item · source: European Commission · published: 2026-11-10 · link: https://digital-strategy.ec.europa.eu/news-redirect/964805
The European Commission launched a consultation to update its election guidelines under the Digital Services Act (DSA), addressing the rapid evolution of technologies, particularly generative Artificial Intelligence (AI), and the growing sophistication of manipulation risks.

### Targeted consultation on the draft revised election guidelines under the Digital Services Act (DSA)
kind: policy-item · source: European Commission · published: 2026-11-10 · link: https://digital-strategy.ec.europa.eu/news-redirect/964768
This consultation focuses on measures Very Large Online Platforms (VLOPs) and Very Large Online Search Engines (VLOSEs) should adopt to address generative AI and information manipulation risks to electoral processes.

### AI toolbox supports public administrations to put the Apply AI Strategy into practice
kind: policy-item · source: European Commission · published: 2026-11-05 · link: https://digital-strategy.ec.europa.eu/news-redirect/964507
Public administrations looking to adopt artificial intelligence can find practical tools, guidance and examples in the AI toolbox for the European public sector, available on the Interoperable Europe portal. The toolbox supports the implementation of the European Commission’s Apply AI Strategy by helping administrations identify resources they can use and adapt to their needs.

### Kabinet kiest voor AI die Nederland vooruithelpt
kind: policy-item · source: Digitale Overheid · published: 2026-11-10 · link: https://www.digitaleoverheid.nl/nieuws/kabinet-kiest-voor-ai-die-nederland-vooruithelpt/
Het kabinet kiest voor een visie op AI die bijdraagt aan een sterke economie, goede publieke dienstverlening en oplossingen voor maatschappelijke uitdagingen. Het bericht Kabinet kiest voor AI die Nederland vooruithelpt verscheen eerst op Digitale Overheid .

### Nvidia loses ground in Washington chip fight after CEO spy scandal
kind: policy-item · source: Politico US · published: 2026-11-11 · link: https://www.politico.com/news/2026/11/10/nvidia-ceos-spy-scandal-tilts-capitol-hills-chip-fight-01160548
The revelations have weakened the semiconductor giant's hand as it tries to block new curbs on AI chips.

### Exclusive: Wall Street regulator poised to bring charges against prediction market giant Kalshi
kind: policy-item · source: Politico US · published: 2026-11-10 · link: 
(the source gave no text)

### Trahan crafting AI safety bill with narrower state preemption
kind: policy-item · source: Politico US · published: 2026-11-10 · link: https://www.politico.com/live-updates/2026/11/10/congress/trahan-crafting-ai-safety-bill-with-narrower-state-law-preemption-01158965
Lawmakers in a Democrat-controlled Congress may be less likely to supersede state AI laws.

### Gezichtsscanner rukt op, maar cijfers over omvang fraude ontbreken
kind: policy-item · source: Binnenlands Bestuur · published: 2026-11-10 · link: https://www.binnenlandsbestuur.nl/digitaal/gezichtsscanner-rukt-op-omvang-fraude-onbekend
Het kabinet werkt aan een wettelijke grondslag voor de inzet van gezichtsscanners bij aanvragen van een reisdocument of identiteitskaart. Meer dan de helft van de gemeenten zet op eigen initiatief al automatische gezichtsvergelijking in bij de identiteitsvaststelling. Maar hoe groot het probleem van fraude met paspoortaanvragen aan de gemeentebalie werkelijk is, weet niemand.

===== 2026-11-11 · Data Engineering =====

### Ducks in a Column
kind: community-post · source: DuckDB blog · published: 2026-11-10 · link: https://duckdb.org/2026/11/10/ducks-in-a-column.html
DuckDB is fast among other reasons because it stores data by column, so a query reads only the columns it names. This post covers DuckDB features that take advantage of that design choice: querying files in place, column-level SQL, aggregation shortcuts, window functions, ASOF joins, and writing well-organized Parquet.

### Introducing performance optimization in dltHub
kind: community-post · source: dltHub blog · published: 2026-11-10 · link: https://dlthub.com/blog/introducing-performance-optimization
TODO: meta description (about 150 characters).

### Is your Iceberg catalog healthy?
kind: community-post · source: Snowflake on Medium · published: 2026-11-10 · link: https://medium.com/snowflake/is-your-iceberg-catalog-healthy-939dc7817154
A comparison of five open-source Iceberg catalogs on functionality and OSS project health. Apache Iceberg™ allows an organisation to own their data layer in an open format in their own storage, and has become the de facto open table format. Still, every engine must reach those Iceberg tables through an Iceberg catalog. A natural extension is an open-source Apache Iceberg catalog to complete the open lakehouse stack, acting as an open governance layer, so that access to your tables isn’t dependent on any one vendor’s managed service. In this blog, I aim to simplify the decision process when it comes to choosing an Iceberg catalog and therefore building an open lakehouse on Iceberg. I focus on the functional completeness of each catalog for Iceberg data and dive deep on OSS project health. After all, an OSS project with one vendor driving development carries similar lock-in risk to a proprietary product. My goal here is to provide transparency on the relative health of common OSS catalog…

### Native Asyncio Comes to the Snowflake Python Connector
kind: community-post · source: Snowflake on Medium · published: 2026-11-10 · link: https://medium.com/snowflake/native-asyncio-comes-to-the-snowflake-python-connector-5941385ac80e
Version 5.0.0 is the same package you already install, now with an awaitable API built on Universal Core. If your Python service runs on an event loop, calling Snowflake has meant handing the call to a thread pool so it doesn’t block everything else. In our public preview post we introduced Universal Core; this is the Python feature it made room for. Snowflake Connector for Python 5.0.0 became generally available on October 15. It is still snowflake-connector-python, with the same synchronous API. Check the upgrade guide for behavior changes before switching. The package is a thin Python wrapper around Universal Core, the Rust core shared with the ODBC driver. The big addition is snowflake.connector.aio : native asyncio support, the feature you’ve asked us for most, going back to a 2017 GitHub issue. TL;DR If you run async Python against Snowflake, install snowflake-connector-python 5.0.0 on Python 3.11 or later. Async applications import snowflake.connector.aio and await the calls tha…

### All Unity Catalog managed tables will be upgraded to catalog commits
kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits
After Databricks Runtime 15.4 LTS reaches end of support on August 19, 2027, Azure Databricks will upgrade all Unity Catalog managed tables to use catalog commits. With catalog commits, Unity Catalog becomes the system of coordination for your tables. This enables multi-statement, multi-table transactions, writes from external engines, and consistent governance across all engines. See Catalog commits.

### Nov 10, 2026: AI_EXTRACT and AI_PARSE_DOCUMENT now support page filtering with FL_FILTER_PAGES
kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-fl-filter-pages
AIEXTRACT and AIPARSEDOCUMENT now support selecting document pages with FLFILTERPAGES. Process the pages relevant to your task directly in SQL, without creating separate files for each document section.

### Nov 10, 2026: Temporary role grants to users (Preview)
kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-temporary-role-grants-preview
You can now grant an account role to a user temporarily. When you run [](/sql-reference/sql/grant-role) to grant a role to a user, use the FOR INTERVAL clause to specify how long the grant lasts, or the UNTIL clause to specify when it expires. When the grant expires, the user automatically loses acc

### You can use graph measures to lock an aggregation to a key in order to perform complex aggregations without overcounting (GA)
kind: vendor-note · source: BigQuery · published: 2026-11-10 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026
You can use graph measures to lock an aggregation to a key in order to perform complex aggregations without overcounting. Measure expressions can include the following: Aggregate function calls Expressions within aggregate functions Conditional logic within aggregate functions Conditional distinct counting Scalar operations and expressions outside of aggregate functions Combinations of measures wrapped in the AGG function To query measures, you transform your graph into a flattened table by using the GRAPH_EXPAND TVF, and then query measures in that table with the AGG function. The GRAPH_EXPAND function now supports multiple fact tables. To view the output schema of the GRAPH_EXPAND function, use the BQ.SHOW_GRAPH_EXPAND_SCHEMA system procedure. You can define extensions in the OPTIONS clause of the labels and properties in your graphs, which are string pairs that represent custom metadata for natural language querying. Measures and graphs are supported in Data Studio through the Bi…

===== 2026-11-11 · Community stories =====

### Show HN: Get your coding agent off ~2019 JavaScript, onto modern web primitives
kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/GoogleChrome/modern-web-guidance · discussion: https://news.ycombinator.com/item?id=50443812
Keep your coding agent up to date with the latest web best practices

### LLMs Play Zachtronics' TIS-100
kind: story · source: Hacker News · published: 2026-11-11 · link: https://tis-100.wincon.dev/ · discussion: https://news.ycombinator.com/item?id=50448340
16 LLMs took on TIS-100's community leaderboard and found 133 new frontier points on 18 of 55 puzzles, including 3 outright cycle records.

### What objective is reasoning solving?
kind: story · source: Hacker News · published: 2026-11-10 · link: https://alexwang.ai/posts/reasoning-as-pathfinding/ · discussion: https://news.ycombinator.com/item?id=50445013
Reasoning as pathfinding in token space.

### An Open Field Guide to Inference Engineering
kind: story · source: Hacker News · published: 2026-11-10 · link: https://docs.modelplane.ai/guides/inference-guide · discussion: https://news.ycombinator.com/item?id=50443714
A field guide to inference concepts, production operations, tooling, and career development for platform engineers.

### Life on Claude Nine
kind: story · source: Hacker News · published: 2026-11-10 · link: https://babuschk.in/posts/2026-01-25-life-on-claude-nine.html · discussion: https://news.ycombinator.com/item?id=50443587
It started with automating his emails.

### Businesses in ChatGPT – OpenAI
kind: story · source: Hacker News · published: 2026-11-10 · link: https://openai.com/index/introducing-businesses-chatgpt/ · discussion: https://news.ycombinator.com/item?id=50443944
(the source gave no text)

### ClickHouse Acquires Xata
kind: story · source: Hacker News · published: 2026-11-10 · link: https://xata.io/blog/xata-is-joining-clickhouse · discussion: https://news.ycombinator.com/item?id=50436706
(the source gave no text)

### Show HN: WolveKafka – Consume Kafka with a plain HTTP endpoint
kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/wolveflake/wolvekafka · discussion: https://news.ycombinator.com/item?id=50443596
Consume Kafka with an HTTP handler in any language. Retries, DLQ, batching, and offsets handled for you.

### Show HN: AI agents that barter your stuff for things you want
kind: story · source: Hacker News · published: 2026-11-10 · link: https://barterpilot.com/ · discussion: https://news.ycombinator.com/item?id=50446649
Your stuff is your currency. List what you're done with, tell your AI agent what you want, and it barters for a fair trade.

### Gemini 4 Carbon is now available
kind: story · source: Hacker News · published: 2026-11-10 · link: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/ · discussion: https://news.ycombinator.com/item?id=50442303
Today, we’re making Gemini 4 Carbon available to developers, enterprises, scientists, and consumers.

### Anthropic to Seek $1.3T Valuation in IPO
kind: story · source: Hacker News · published: 2026-11-10 · link: https://www.wsj.com/finance/stocks/anthropic-to-seek-1-3-trillion-valuation-in-ipo-8337b669 · discussion: https://news.ycombinator.com/item?id=50439616
(the source gave no text)

### Claude Fable 5.2 launch offers
kind: story · source: Hacker News · published: 2026-11-09 · link: https://support.claude.com/en/articles/17506494-claude-fable-5-2-launch-offers · discussion: https://news.ycombinator.com/item?id=50430176
(the source gave no text)

### Show HN: Cosh – An open-source AI agent orchestrator
kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/DiegoZaluski/co-sh · discussion: https://news.ycombinator.com/item?id=50439141
Open-source agent and multi-agent orchestrator built in Rust. Fast TUI, computer use, and integrations with external agents like Codex and Goose.

### Measuring Quack: DuckDB's New Client-Server Protocol
kind: story · source: Hacker News · published: 2026-11-10 · link: https://ramonactruta.substack.com/p/measuring-quack-duckdbs-new-client · discussion: https://news.ycombinator.com/item?id=50444907
(the source gave no text)

### Next-Level Benchmarking Overfitting
kind: story · source: Lobste.rs · published: 2026-11-10 · link: http://databasearchitects.blogspot.com/2026/11/next-level-benchmarking-overfitting.html · discussion: https://lobste.rs/s/nuoce5/next_level_benchmarking_overfitting
A blog by and for database architects.

### Detecting Flaky Tests and Finding Their Root Causes with Strands Agents and Gemini
kind: story · source: Dev.to · published: 2026-11-10 · link: https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan · discussion: https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan
A few years ago (three years at most), one of the biggest challenges QA Engineers faced was: how do

### Once Upon Agentic AI (Part 1): Create your own agent and forge its tools with Strands Agents
kind: story · source: Dev.to · published: 2026-11-10 · link: https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo · discussion: https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo
On Day1, three heroes that nothing destined to cross went on a journey to write the same legend.

===== 2026-11-12 · AI Agents =====

### [BUG] Messages Sent from the iOS App Mid-Turn No Longer Reach Claude Until the Turn Ends
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-11 · link: https://github.com/anthropics/claude-code/issues/108975
### Preflight Checklist - [x] I have searched [existing issues](https://github.com/anthropics/claude-code/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug) and this hasn't been reported yet - [x] This is a single bug report (please file separate reports for different bugs) - [x] I am using the latest version of Claude Code ### What's Wrong? Since Claude Code went to 2.1.321 (now 2.1.322), anything I send from the iOS app while Claude is working just sits there until the turn ends. On really long horizon tasks, the wait can be minutes to hours before a turn boundary opens up, so I have lost the ability to redirect/steer Claude. My setup: a Claude Desktop Code tab session on my Mac with Remote Control on, driven from the Claude iOS app. Mid-turn the composer now says "Queue for after this turn…" and there's only the one send button. <img width="1320" height="1520" alt="1-mid-turn-queued" src="https://github.com/user-attachments/assets/e89f5fcd-0e63-420f-8162-49b3e10d9545" /> Idle, the same box says "Type / for commands": <img width="1320" height="320" alt="2-idle-composer" src="https://github.com/user-attachments/assets/9c347d7e-c1c7-4129-8351-a37f62aacedc" /> Up to 2.1.318 that same send button reached Claude at the next tool call, and I used it all the time to steer/correct a long task from my phone without stopping it. Now the only way in mid-task is Stop, which kills the tool call and loses its work. That's not what I want mid-task. What the session's queue log shows (UTC,

### [BUG] Claude Code drops next in the middle of the scrollback when it appends text to console
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-11 · link: https://github.com/anthropics/claude-code/issues/108984
### Preflight Checklist - [x] I have searched [existing issues](https://github.com/anthropics/claude-code/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug) and this hasn't been reported yet - [x] This is a single bug report (please file separate reports for different bugs) - [x] I am using the latest version of Claude Code ### What's Wrong? If I scroll up in a Claude Code Session (in gnome-terminal on Fedora, not using the new renderer), and then Claude Code sends new output to the console, the text in the middle of what I'm reading is often deleted. This is a clear example, where you can see that the last half of the first table and the first half of the second table are deleted, including the text in between them. I had to ask Claude Code to give me the information again. (See also #89270, which was auto-closed due to lack of Anthropic response.) <img width="2560" height="1314" alt="image" src="https://github.com/user-attachments/assets/ce8e7dc8-4deb-414c-96ed-7e4d7b2c04b2" /> ### What Should Happen? Appending new text to the console should not affect the scrollback. ### Error Messages/Logs ```shell ``` ### Steps to Reproduce 1. Start a session 2. Ask Claude for a detailed report on something 3. Let Claude grind away on other tasks 4. Scroll back to see the detailed report 5. Wait for Claude to generate more responses below what you can see ### Claude Model None ### Is this a regression? Yes, this worked in a previous version ### Last Working Version _No response_ ### Claud

### OpenAI Codex 0.167.2
kind: release · source: openai/codex · published: 2026-11-11 · link: https://github.com/openai/codex/releases/tag/rust-v0.167.2
## New Features - Codex now sends tool updates incrementally by default on Google Cloud Vertex AI. To opt out, set `incremental_tools_legacy_gcp = false` under `[features]` in `config.toml`. ([#60617](https://github.com/openai/codex/pull/60617), [#60848](https://github.com/openai/codex/pull/60848)) ## Changelog Full Changelog: https://github.com/openai/codex/compare/rust-v0.167.1...rust-v0.167.2

### OpenCode process-daemon v0.5.2
kind: release · source: anomalyco/opencode · published: 2026-11-11 · link: https://github.com/anomalyco/opencode/releases/tag/process-daemon-v0.5.2
opencode-pty 0.5.2 (protocol 8) from packages/process-daemon, published to npm as @opencode/pty@0.5.2.

### Oh My Pi v18.19.0
kind: release · source: can1357/oh-my-pi · published: 2026-11-12 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.19.0
## @oh-my-pi/pi-ai ### Added - Added the `liquid-systemone` judgment API for Liquid AI decision models, including validation that rejects image sets exceeding Liquid’s 10,000 32×32-patch request limit before submission. ### Fixed - Fixed Gemini CLI and Antigravity responses losing or misordering thought signatures and reply text, including responses that follow tool calls. - Fixed Gemini CLI and Antigravity merging reply text around a thought signature, dropping signatures at the start of a reply or after a tool call, and placing a thought ahead of reply text that streamed before it ([#18942](https://github.com/can1357/oh-my-pi/pull/18942) by [@JustasMasiulis](https://github.com/JustasMasiulis)) - Fixed Google Antigravity judging Gemini models by quota buckets they do not consume: Gemini 3.x requests ignore the Gemini 4 Argon weekly bucket, and Argon requests ignore `gemini-weekly`, so an exhausted or low bucket no longer blocks, reserves, or caps an account for the other models ([#16104](https://github.com/can1357/oh-my-pi/issues/16104)). ## @oh-my-pi/pi-catalog ### Added - Added Liquid AI provider support with the d1.1 and d1-ultra judge models and Liquid authentication via `/login liquid` using `LIQUID_API_KEY`. ### Fixed - Fixed Google Antigravity Gemini 4 Argon models sharing the general Gemini quota scope instead of their dedicated weekly bucket ([#16104](https://github.com/can1357/oh-my-pi/issues/16104)). ## @oh-my-pi/pi-coding-agent ### Breaking Changes - Changed the

### Oh My Pi v18.18.9
kind: release · source: can1357/oh-my-pi · published: 2026-11-11 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.9
## @oh-my-pi/pi-agent-core ### Added - Tool calls get `ctx.toolCall.earlierEffectsSettled`, which settles once the earlier calls of their message that run beside them and may write files (their approval, asked with their arguments, is not `read`) have finished; speculative results wait for those effects before validation, and cancellation while waiting prevents their commit ([#16274](https://github.com/can1357/oh-my-pi/pull/16274) by [@will-bogusz](https://github.com/will-bogusz)) ## @oh-my-pi/pi-ai ### Added - Added `SOFYA_API_KEY` as the env key for the `sofya` provider ([#18185](https://github.com/can1357/oh-my-pi/pull/18185) by [@yusufgurdogan](https://github.com/yusufgurdogan)) ### Fixed - Devin requests no longer send `temperature: 0`: the catalog's `temperature-floor` raises it to `0.0001`, so session titles and Mnemopi memory extraction work on Devin instead of failing with Cascade's opaque `invalid_argument` and silently falling back to another model ([#18423](https://github.com/can1357/oh-my-pi/issues/18423)) - Auth-gateway `/v1/messages` now answers `400 invalid_request_error` for `output_config.format` (and the pre-GA `output_format`) instead of returning 200 with output the schema never constrained, so structured-output clients fall back to prompt-side schemas ([#18842](https://github.com/can1357/oh-my-pi/issues/18842)) - Auth-gateway requests denied only the requested model (Codex ChatGPT account, Cursor plan) now switch to another account and keep the denied on

### DeepSeek Harness v0.2.2-rc.2
kind: release · source: deepseek-ai/deepseek-harness · published: 2026-11-11 · link: https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2
[中文](#cn-v0.2.2-rc.2) | [English](#en-v0.2.2-rc.2) <h3 id="cn-v0.2.2-rc.2">新增功能</h3> - Git Worktree 支持按分支、提交和文件类型审阅改动，并直接处理 GitHub 评审、同步已审阅进度和更新分支。 @LegGasai - SubAgent 支持具名与多层协作，AgentTeam 可按会话开启，共用成员与任务面板。 @Dudu-0223, @Yifffan - 桌面端支持在设置中切换正式版与开发版更新渠道。 @winewill ### 体验优化 - 改善代码审阅时的评论、文件导航与窄屏布局，减少查看大型改动时的卡顿，并放宽大型仓库创建工作树的等待时间。 @LegGasai - 改善多层子代理的浏览与任务协调，优先展示任务描述，支持逐层展开和读取失败后重试。 @Dudu-0223 - 优化左侧栏插件入口的收纳，不常用入口可移入“更多”，重新固定时保持原顺序。 @Yifffan - 简化个性化页面安装后的操作，移除“保留”按钮，统一使用撤销与恢复。 @ZiyaZhang - 改善自定义主题对通知、卡片、计划和任务等界面颜色的覆盖。 @turtle2099 - 改善页面缩放、平移及长列表场景下的菜单定位，保持菜单与触发位置对齐；自定义浮层需适配新定位接口。 @Stevring, @LegGasai - 改善暗色模式下文件树浮层的显示，使用背景层次区分面板，避免白色投影。 @turtle2099 - 改善在侧栏查找文件的体验，支持按名称或路径搜索，并可调整排除规则与隐藏文件显示。 @yudshj - 改善侧栏长列表的浏览与拖动体验，插件导航和会话列表共用滚动区域，工作区工具栏保持可见。 @Yifffan - 优化从会话打开工作目录的操作，统一“在应用中打开”菜单，并改善窄屏使用体验。 @Yifffan - 加快文件右键菜单的打开；关联应用查询较慢时，先提供默认应用入口。 @yudshj - 向上回看聊天时自动加载更早消息，优先保持阅读位置，并保留手动加载和重试入口。 @imccyu - 改善聊天过程的可查看性，可展开工作区指令、技能目录等信息，了解模型收到的上下文。 @turtle2099 - 改善补丁编辑的回执，折叠状态下也可查看修改的文件，并在成功后直接打开。 @sjw1231 - 优化会话首页的交互动画。 @ZiyaZhang - 改善会话恢复或压缩后的上下文提示，明确当前运行信息与旧信息的替换关系。 @kermanx - 改善聊天中代码差异的阅读，显示增删行颜色，并按文件语言高亮。 @mektpoy - 改善粘贴图片和文件的体验，未聚焦输入框时也可粘贴到最近使用的可用输入框或主对话。 @std4453 - 改善暂停、恢复定时任务时的操作反馈，保持按钮焦点与显示稳定，避免重复操作。 @turtle2099 - 优化目标栏的操作排列与按钮间距，统一为“编辑、清除、暂停或恢复”。 @turtle2099 - 优化模型请求失败后的重试设置，可在模型设置中选择重试条件、次数和等待时间。 @turtle2099 - 改善临时请求失败后的恢复操作，可直接点击“继续生成”，无需另写消息。 @LegGasai - 改善 API Key 的管理，已保存密钥以掩码显示，支持整体替换或清除，不显示完整旧密钥。 @Magolor - 优化多问题检索，单次网页搜索默认支持最多 10 个查询和 10 个来源。 @turtle2099 - 改善 Agent 终端的可见性与接管体验，命

### [Feature]: Team Gateway: bring your own Slack app per agent (keep bot name and avatar)
kind: hot-issue · source: nousresearch/hermes-agent · published: 2026-11-11 · link: https://github.com/NousResearch/hermes-agent/issues/153396
### Problem or Use Case On Hermes Cloud, an instance on the Team Gateway relay replies through the shared team bot, with its display name added as a prefix. A Slack token held by the instance itself keeps the machine awake, because suspend only arms when messaging is relay-only. So today the choice is either: - each agent keeps its own Slack app (own name, avatar, channel) and stays awake around the clock, or - each agent scales to zero when idle, but every agent speaks through one shared bot. You can't have both. ### Proposed Solution Let the connector hold a separate Slack app (bot token, name, avatar) per agent. Each agent would reply under its own identity through the relay, and still suspend when idle and wake on inbound or a scheduled job. ### Alternatives Considered - Shared bot with a name prefix plus "Lock a location to this agent" per channel: routing works, but every agent looks the same in Slack. - Posting through the shared bot with a per-message username and icon (Slack's `chat:write.customize`): would give each agent a distinct name and avatar without separate apps. - Turning instances on and off by hand: saves money, but messages and scheduled jobs are missed while an agent is off. ### Feature Type Gateway/messaging improvement ### Additional context I run several agents for my business and for clients, each in its own Slack channel. A distinct name and avatar is a big part of how a team treats each agent as its own colleague. A core team member said in Discor

===== 2026-11-12 · AI Models & Labs =====

### Baidu: ERNIE-5.5-Flash-Preview (free)
kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/baidu/ernie-5.5-flash-preview:free
ERNIE 5.5 Flash Preview is the latest foundation model in the ERNIE family, with comprehensive improvements in coding, agentic capabilities, knowledge work, and deep research. It has 280 billion total...

===== 2026-11-12 · AI Policy =====

### Commission Implementing Regulation (EU) 2026/2487 of 10 November 2026 laying down rules for the application of Regulation (EU) 2024/1689 of the European Parliament and of the Council as regards the establishment, development, implementation, operation and supervision of AI regulatory sandboxes
kind: policy-item · source: EUR-Lex · published: 2026-11-10 · stage: Regulation adopted · link: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487
(the source gave no text)

### Motie van de leden Mathlouti en Struijs over inzicht in de AI-toepassingen die de politie al inzet en de mogelijkheden ọm deze op te schalen 
kind: policy-item · source: Tweede Kamer · published: 2026-11-10 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24707&did=2026D57026
Motion. Vaststelling van de begrotingsstaten van het Ministerie van Justitie en Veiligheid (VI) voor het jaar 2027

### EU needs a system to respond to AI incidents, Finland and Estonia say
kind: policy-item · source: Politico Europe · published: 2026-11-11 · link: https://www.politico.eu/article/eu-needs-a-system-to-respond-to-ai-incidents-finland-and-estonia-say/?utm_source=RSS_Feed&utm_medium=RSS&utm_campaign=RSS_Syndication
In a letter seen by POLITICO, Finland and Estonia call for "EU-level arrangements for responding to serious AI incidents." This comes as European leaders are set to meet Friday to debate AI for the first time.

===== 2026-11-12 · Data Engineering =====

### Databricks CLI v1.26.0
kind: release · source: databricks/cli · published: 2026-11-11 · link: https://github.com/databricks/cli/releases/tag/v1.26.0
## Release v1.26.0 (2026-11-11) ### AI Runtime * `air run` reuses its existing workspace connection for config validation instead of opening a second one, which saves a TCP and TLS handshake per submission. ([#7210](https://github.com/databricks/cli/pull/7210)) * Speed up `databricks air run` for git-pinned `code_source` snapshots by compressing the archive in parallel, which substantially shortens packaging on large repositories. ([#7402](https://github.com/databricks/cli/pull/7402)) * Point the `air run -h config` agent-skill hint at the stable `databricks-ai-runtime` skill. ([#7454](https://github.com/databricks/cli/pull/7454)) ### Bundles * Add `DATABRICKS_BUNDLE_INIT_WORKSPACE_HOST_PROFILE`, which names a profile whose host the `workspace_host` template helper returns instead of the selected profile's host. The profile must have the selected profile's workspace ID. ([#7410](https://github.com/databricks/cli/pull/7410)) * Fixed an explicit `false` on optional boolean fields (`variables.*.sensitive`, `artifacts.*.dynamic_version`, `bundle.deployment.lock.force`, `workspace.azure_use_msi`, `replace_existing` on postgres endpoints, databases and roles, and the `experimental.*` flags) being dropped, which hid it from `bundle validate -o json` and kept a target from overriding `true` with it. ([#7412](https://github.com/databricks/cli/pull/7412)) * Stop sending `compute_size` in the app update mask when the bundle does not declare it, so a deploy no longer resets a manually re

### Local Analytics Doesn’t Need a Database Server
kind: community-post · source: DuckDB blog · published: 2026-11-12 · link: https://duckdb.org/2026/11/12/local-analytics-without-a-database-server.html
From interactive maps to graph exploration, DuckDB makes it possible to analyze data without a database server. Ilya Boyandin shares how this approach led to SQLRooms, a toolkit for building analytics applications that bring data, visualizations, and AI-assisted analysis together on the user’s machine.

### Agents Are Code Too: What I Learned Shipping a Cortex Agent Through Azure DevOps
kind: community-post · source: Snowflake on Medium · published: 2026-11-11 · link: https://medium.com/snowflake/agents-are-code-too-what-i-learned-shipping-a-cortex-agent-through-azure-devops-fab3adae29e8
Building the agent took a week. Getting it safely from sandbox to production took longer, and taught me more. Most Cortex Agent content I read ends at the same place: a working demo in Snowsight, a clever question, a correct answer. That is where my real work started. In my recent project, I built a Cortex Agent for the finance domain. The agent itself came together quickly. What took real thought was the part nobody demos: moving it through sbx, dev, uat and prod with the same discipline we already applied to every other Snowflake object on the platform. After roughly a decade of building data platforms, I’ve learned to be suspicious of anything that only exists in one environment. So here is what I learned treating an agent like code, and what I’d do the same way again. An agent you can’t rebuild from Git is a prototype, no matter how good its answers are. 1. The myth: “An agent is just a config in the UI” It’s easy to see a Cortex Agent as a few settings in a form: pick a semantic v…

### Genie ZeroOps is available in Beta
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-zeroops-is-available-in-beta
Genie ZeroOps is now available in Beta. It monitors jobs, pipelines, and tables in the background, detects failures and data quality issues, investigates the root cause, and proposes a fix. See Get started with Genie ZeroOps.

### Azure Databricks Genie plugin for Microsoft 365 Copilot (Public Preview)
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#azure-databricks-genie-plugin-for-microsoft-365-copilot-public-preview
The Azure Databricks Genie plugin connects Microsoft 365 Copilot Chat to Genie One, so users can ask questions about their Azure Databricks data without an @-mention. See Option 1: Use the Azure Databricks Genie plugin (recommended).

### Azure Databricks Genie plugin for Microsoft Copilot Cowork (Public Preview)
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#azure-databricks-genie-plugin-for-microsoft-copilot-cowork-public-preview
The Azure Databricks Genie plugin connects Microsoft Copilot Cowork to Genie One, so users can ask questions about their Azure Databricks data without creating an OAuth app or editing a plugin manifest. Existing installations of the Beta manifest-based Genie plugin aren't migrated automatically. To use the new plugin, add it in Copilot Cowork. See Azure Databricks Genie plugin for Microsoft Copilot Cowork.

### Bring your own ChatGPT subscription to Codex with Unity Gateway
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#bring-your-own-chatgpt-subscription-to-codex-with-unity-gateway
You can now use your own ChatGPT Go, Plus, Pro, or Enterprise subscription with Codex and ChatGPT desktop through Unity Gateway. Requests are billed to your subscription, and Unity Gateway governs access and usage. See ChatGPT subscription support.

### Pages are generally available
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#pages-are-generally-available
Pages, governed definitions of business concepts organized by domain on the Discover page, are generally available. Curators can certify and deprecate Pages, and the new MANAGE PAGES permission controls who can publish and manage Pages in a domain. You can also manage Pages with the REST API. See Pages.

### The Genie One desktop app for Windows is in Beta
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#the-genie-one-desktop-app-for-windows-is-in-beta
The Genie One desktop app is now available for Windows in Beta, in addition to macOS. The native app opens Genie One on your desktop instead of in a browser tab, so business users can chat with data in natural language, work with their threads and documents, and use Genie Agents without a browser. See Windows.

### Write custom service policies in Python (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#write-custom-service-policies-in-python-beta
You can now write a custom service policy as a Python function in Unity Catalog. Use it for rules that SQL can't express, such as regular expressions, Python packages, or calls to an external guardrail through a service credential. It's available in select regions. See Write a custom Python service policy.

### Allow ChatGPT and Claude as partner platforms in context-based ingress policies
kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#allow-chatgpt-and-claude-as-partner-platforms-in-context-based-ingress-policies
Context-based ingress policies can now allow traffic from ChatGPT and Claude as partner platforms. Azure Databricks keeps their published IP ranges current, so you don't track the IPs yourself. Use these rules to allow hosted Model Context Protocol (MCP) clients, such as the Databricks Genie plugins for ChatGPT and Claude, to reach your workspace. See Allow partner platforms in context-based ingress policies.

### Text and binary inputs for protobuf requests to custom model serving endpoints (Public Preview)
kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#text-and-binary-inputs-for-protobuf-requests-to-custom-model-serving-endpoints-public-preview
Protobuf requests to custom model serving endpoints can now carry text and binary data, such as titles, images, audio, and documents, as KServe v2 BYTES tensors alongside numeric tensors in the same request. Text and binary model outputs are returned as BYTES tensors. This feature is in Public Preview and is only available on endpoints deployed after November 10, 2026. See Protobuf tensor input.

### External access to Unity Catalog managed Delta tables will soon be available by default for workspaces with the compliance security profile enabled
kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled
Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled. Supported external Delta clients can create, read, and write Unity Catalog managed Delta tables. Creating and writing managed Delta tables requires catalog commits. Metastore external data access settings and Unity Catalog privileges continue to control access. See Access Databricks tables from Delta clients.

### Use cleaned AI answers in Lakeflow Designer (Public Preview)
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#use-cleaned-ai-answers-in-lakeflow-designer-public-preview
Clean supported AI Function outputs in Lakeflow Designer for downstream transformations. Cleaned results include answer values, error messages, and raw responses in separate columns. See AI Function.

### Distinguish Lakeflow Designer Python previews from full runs (Public Preview)
kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#distinguish-lakeflow-designer-python-previews-from-full-runs-public-preview
Python operators in Lakeflow Designer now expose config["is_preview"] so your code can skip side effects during previews. See Python preview mode.

### Calculate across rows in Lakeflow Designer (Public Preview)
kind: vendor-note · source: Azure Databricks · published: 2026-11-05 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#calculate-across-rows-in-lakeflow-designer-public-preview
Use the Multi-Row Formula operator in Lakeflow Designer for running totals, ranks, moving averages, and other calculations across ordered rows. See Multi-Row Formula.

### The next chapter for CI/CD in Fabric Warehouse (Preview)
kind: vendor-note · source: Microsoft Fabric · published: 2026-11-11 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/The-next-chapter-for-CI-CD-in-Fabric-Warehouse-Preview/ba-p/5401222
Sections: What we've delivered; Establishing a consistent deployment foundation with DacFx; Pre, and post-deployment scripts; Warehouse Item Definition APIs; Bringing Familiar Warehouse Development Experiences to Client Tools; What's next for CI/CD in Fabric Warehouse; Get started with CI/CD in Fabric Warehouse. Building and operating a data warehouse is increasingly a software engineering discipline. Teams want to develop warehouse changes in isolation, version them in Git, review them through pull requests, promote them safely across environments, and automate the entire process using their existing CI/CD systems. Over the past several releases, we've been evolving CI/CD in Fabric Warehouse around that lifecycle: DacFx established a common schema deployment foundation. Pre, and post-deployment scripts expanded deployments beyond schema changes. Warehouse Item Definition APIs opened the same lifecycle to automation. Together, these investments are creating a more complete CI/CD lifecy…

### Use OneLake as native storage for Azure Databricks (Preview)
kind: vendor-note · source: Microsoft Fabric · published: 2026-11-11 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks-Preview/ba-p/5377939
Sections: Why this matters; What's new in this release; One shared data foundation, with flexibility above it; Use OneLake as the storage foundation; Continue using Unity Catalog-managed objects; Keep platform responsibilities clear; How it works; Security; How to read the data in Fabric; Get started. Organizations increasingly use Microsoft Fabric and Azure Databricks together so teams can choose the tools that best fit their data engineering, analytics, and AI workloads while working from a common data foundation. OneLake external-location support for Azure Databricks Unity Catalog is now generally available in Microsoft Fabric, with OneLake Security enabled by default for Azure Databricks Storage items. On the Azure Databricks side, the feature is in preview. With this integration, supported Unity Catalog-managed data can be stored directly in OneLake. To understand the setup and supported scenarios, Connect Azure Databricks to a OneLake external location. Data teams often need Azu…

### Project caps (also known as scheduling policies) let you limit maximum slots and concurrency per project within a BigQuery reservation (GA)
kind: vendor-note · source: BigQuery · published: 2026-11-11 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026
Project caps (also known as scheduling policies) let you limit maximum slots and concurrency per project within a BigQuery reservation. This feature is only supported in the BigQuery Enterprise and Enterprise Plus editions and is generally available (GA).

### Upcoming end of life for the Genie One MCP Beta endpoint
kind: open-action · source: Azure Databricks · ends: 2026-11-30 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint
The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway.

### Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields
kind: open-action · source: BigQuery · ends: 2027-01-31 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026
Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will drop support for the `legacyMode` field in the DeliveryProfile dataset schema and the `permitSkuSharing` field in the FulfillmentService dataset schema.

### Zhipu AI GLM 5.2 is scheduled for retirement
kind: open-action · source: Azure Databricks · ends: 2027-02-04 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement
Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance.

### All Unity Catalog managed tables will be upgraded to catalog commits
kind: open-action · source: Azure Databricks · ends: 2027-08-19 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits
After Databricks Runtime 15.4 LTS end of support on August 19, 2027, all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline.

===== 2026-11-12 · Community stories =====

### Gemini Decisions API
kind: story · source: Hacker News · published: 2026-11-11 · link: https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/ · discussion: https://news.ycombinator.com/item?id=50456791
Meet the Gemini Decisions API, powered by our state-of-the-art model Gemini Decision for fast, calibrated multimodal decisions.

### I gave an agent a lakehouse and control of my garden
kind: story · source: Hacker News · published: 2026-11-08 · link: https://jatorre.github.io/garden/ · discussion: https://news.ycombinator.com/item?id=50415162
Or how to produce a €60 lettuce. Eleven sensors, a camera, an old phone and an agent that waters my vegetables.

### Faster Retrieval for Better, More Efficient RAG
kind: story · source: Hacker News · published: 2026-11-11 · link: https://machinelearning.apple.com/research/faster-retrieval · discussion: https://news.ycombinator.com/item?id=50455633
Maximum inner product search (MIPS) sits at the core of recommendation systems, search, and retrieval-augmented generation (RAG). Given a

### Atuin Threads: All your agent sessions on every machine
kind: story · source: Hacker News · published: 2026-11-11 · link: https://blog.atuin.sh/threads-agent-sessions/ · discussion: https://news.ycombinator.com/item?id=50453637
Atuin Threads: one searchable, synced history for every agent session, on every machine Start a task in Claude Code, then resume it in Codex

### Launch HN: Pomerado (YC F26) – Turn any website into an MCP for agents
kind: story · source: Hacker News · published: 2026-11-11 · link: https://news.ycombinator.com/item?id=50455811 · discussion: https://news.ycombinator.com/item?id=50455811
(the source gave no text)

### Tools for exploring the souls of large language models
kind: story · source: Hacker News · published: 2026-11-11 · link: https://oshea00.github.io/posts/tinygpt-visualizer/ · discussion: https://news.ycombinator.com/item?id=50458434
On metaphysics, large language models, and souls. Using TinyGPT Visualizer to decode how large language models think and act.

### Show HN: Klad, a paint app your coding agent can drive (source-available)
kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/klad-app/klad · discussion: https://news.ycombinator.com/item?id=50454951
A drawing app built for agent/human collaboration.

### Modern Web Guidance 1.0: The web platform expertise your coding agent is missing
kind: story · source: Hacker News · published: 2026-11-11 · link: https://developer.chrome.com/blog/modern-web-guidance-v1 · discussion: https://news.ycombinator.com/item?id=50460398
Modern Web Guidance 1.0 brings expert-vetted web platform skills, browser compatibility data, and codebase modernization to your AI coding agents.

### TimeNet: Open-source data infrastructure for Temporal Foundation Models
kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/OpenTSLM/TimeNet · discussion: https://news.ycombinator.com/item?id=50443264
Download and explore time-series datasets through one standardized format.

### JSON vs. jsonb in Postgres: size and speed, measured
kind: story · source: Hacker News · published: 2026-11-11 · link: https://now-next.nl/en/insights/postgresql-json-vs-jsonb-measured/ · discussion: https://news.ycombinator.com/item?id=50452394
json vs jsonb in PostgreSQL 17 and 18, measured on six document shapes: when jsonb is 23% smaller or 41% larger, read speed, GIN, and what it changes.

### Show HN: I created a library for correctly using SQLite in Go programs
kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/cattlecloud/litesql · discussion: https://news.ycombinator.com/item?id=50453176
litesql is a Go library for convenient, easy, and performant use of SQLite3 databases in Go programs

### Compress any LLM 3x in one click, near-lossless, in under 50 MB RAM
kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/NeuraCryption/SPECTRA · discussion: https://news.ycombinator.com/item?id=50450729
(the source gave no text)

### The Surprising Effectiveness of Deleting Weights in LLM Post-Training
kind: story · source: Hacker News · published: 2026-11-10 · link: https://arxiv.org/abs/2611.10866 · discussion: https://news.ycombinator.com/item?id=50447363
How little of a pretrained large language model (LLM) has to change for it to acquire new capabilities? We find that zeroing fewer than 0.05% of its weights, with no other modification, matches full fine-tuning (FFT) at scale across three LLM post-training regimes: reinforcement learning with verifi

### Subagents Conwidered Harmful
kind: story · source: Hacker News · published: 2026-11-11 · link: https://nikvdp.com/notes/subagents-considered-harmful/ · discussion: https://news.ycombinator.com/item?id=50450268
(the source gave no text)

### Show HN: NoDOM high performance WASM UI kit for DuckDB-WASM
kind: story · source: Hacker News · published: 2026-11-11 · link: https://osullivj.github.io/nodom_ukprop/ · discussion: https://news.ycombinator.com/item?id=50452389
(the source gave no text)

### Writing a SIGGRAPH paper from scratch
kind: story · source: Lobste.rs · published: 2026-11-11 · link: https://alexandergoslin.me/writing-a-siggraph-paper-from-scratch/ · discussion: https://lobste.rs/s/793ecg/writing_siggraph_paper_from_scratch
In September 2024, my final year of college, I began working on a side project called “Terrain Diffusion.” The goal was to create a learned procedural terrain generator that could drop into almost any game engine with minimal friction. I had nothing but one RTX 3090 Ti, which I bought with money fro

### A Small Laptop Is a Full Build Kit: Bootstrapping with a Chromebook, Claude, and GitHub
kind: story · source: Dev.to · published: 2026-11-11 · link: https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16 · discussion: https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16
A small laptop is a full build kit. Here's how far mine went. TL;DR: A reader suggested I publish

### Part 5: The Control That Protected an Empty Bucket
kind: story · source: Dev.to · published: 2026-11-11 · link: https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j · discussion: https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j
This is Part 5 of a series building an HL7 v2 to FHIR R4 interoperability service in public. The

### The Limits That Don't Limit
kind: story · source: Dev.to · published: 2026-11-07 · link: https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j · discussion: https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j
Four walls exist to stop a runaway agent. A turn cap counts model calls, a token cap misses single-turn answers, and a 5-second deadline took 21.9 seconds.

### Anthropic Targets $1.4T Valuation in IPO
kind: story · source: Hacker News · published: 2026-11-11 · link: https://www.bloomberg.com/news/videos/2026-11-10/anthropic-targets-1-4-trillion-valuation-in-ipo-video · discussion: https://news.ycombinator.com/item?id=50445463
(the source gave no text)

===== 2026-11-13 · AI Agents =====

### Claude Code v2.1.323
kind: release · source: anthropics/claude-code · published: 2026-11-12 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.323
## What's changed - Added Code Mode, an experimental opt-in in which Claude writes JavaScript to call its tools; see https://code.claude.com/docs/en/code-mode to turn it on, or to turn it off for an organization - Added `engines["claude-code"]` to `plugin.json`: plugins outside their stated Claude Code version range are not installed, updated or loaded, and install and update pick the newest version that fits - Added type checking of a plugin's TypeScript hooks module to `claude plugin validate`; each finding is a warning, and `--strict` fails on it - Added to `claude plugin validate` the `$` nouns a mod's `engine.create` hook adds, withholds or replaces - Added support for `CLAUDE_CODE_AUTO_MODE_MODEL` in managed settings for Claude Desktop sessions on third-party providers (takes effect once Claude Desktop includes this version) - Added an options menu (stop, switch to usage credits, upgrade) when a model needs usage credits that are turned off or used up - Added a progress heartbeat every 30 seconds while hooks run long in `claude -p` and SDK sessions, so a host such as Claude Desktop won't end the turn as hung (once it includes this version) - Added `.docx` support to Artifact tool asset uploads - Added a `/diff to close` hint to the diff panel, and the keys that focus and close a panel to the `?` shortcut guide - Added a start-up warning for Bash allow rules with a `*` in a variable's value, such as `Bash(PORT=* npm run dev)` - Added a warning when a plugin's language se

### [FEATURE] Passkey (WebAuthn) sign-in for Claude accounts, across every surface
kind: hot-issue · source: anthropics/claude-code · published: 2026-08-07 · link: https://github.com/anthropics/claude-code/issues/84862
### Preflight Checklist - [x] I have searched [existing requests](https://github.com/anthropics/claude-code/issues?q=is%3Aissue%20label%3Aenhancement) and this feature hasn't been requested yet - [x] This is a single feature request (not multiple features) ### Problem Statement Signing in to a Claude account currently offers two paths: "Continue with Google", or an emailed magic link / one-time code. If Google sign-in isn't an option for you, the magic link is the only path — and it's slow and failure-prone: - The email frequently takes 5+ minutes to arrive. #82049 reports 2–5 minute delays since mid-July 2026. - The link and code expire after 10 minutes. Those two facts interact badly. Five of the ten minutes are typically gone before the email lands, and nobody sits and watches an inbox for five minutes — so I step away, come back, and the link has expired. Then I request another one and try to time it better. The usable window is far shorter than the stated 10 minutes. The cost is then multiplied by the number of surfaces. I sign in on five: the Claude mobile app, Claude Code, the web app, Claude for Excel, and Claude for Chrome. Each holds its own credential and expires on its own schedule, so this isn't a one-time setup cost — it's a recurring interruption that lands several times across my clients. Passkeys are the standard answer to exactly this: instant, local, phishing-resistant, and already supported by the OS keychain or password manager on every device I use. ###

### [BUG] 2.1.323 removed subagentStatusLine with no replacement: per-agent context, cost, model and effort are now invisible
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/issues/109446
## Regression: 2.1.323 silently removed `subagentStatusLine`, with no reason, no replacement and no migration path ### What happened The 2.1.323 changelog says: > Removed the `subagentStatusLine` setting: subagent rows always use the default look, and settings files that still hold the key load as before The settings schema now describes the key as "Deprecated: no longer has any effect. Subagent rows always use the default look." Nothing warns at startup. A configured command simply stops running, and users find out when their agent panel goes blank. 2.1.322 still runs the command. 2.1.323 never calls it. ### Why this hurts `subagentStatusLine` was the **only** place in Claude Code where a user could see, per running subagent, at a glance: - its live context use against its own window - what it has spent so far (tokens and dollars) - its model **and** its reasoning effort - its status, its age and its prompt-cache state Without it, a session that runs several background agents is flying blind. Nothing in the default row shows which agent is burning context, which one is about to hit its window, which one went to the expensive model, or which one is silently re-paying for an expired cache. This is the row as it rendered on 2.1.322, boxed in red: ![subagentStatusLine row on 2.1.322, boxed in red](https://gist.githubusercontent.com/rezzminator/888cc0a73890b169991387f6b328b45d/raw/5bd42397081e40a5a0ad0cac028202fb31b2eebb/subagent-row-before.png) The same row as text: ```text ○ ▱▱

### OpenAI Codex 0.168.0
kind: release · source: openai/codex · published: 2026-11-13 · link: https://github.com/openai/codex/releases/tag/rust-v0.168.0
## New Features - Browse model providers under Sessions → Model providers and choose the default for new chats. (#59541, #59722) - Enable `features.tui_workspace` to view a side conversation beside the main chat. Drag the divider to resize the panes or press `leader z` to zoom the focused pane. (#58992, #59527, #59595) - Attach recordings when using an audio-capable model. Codex skips confirmed rejected recordings on later turns and uses clip duration to keep more short recordings in context. (#59234, #59268) - Enable `features.image_generation_animation` to generate or edit animated GIFs with optional frame count and timing controls. (#59073) - Fullscreen Codex displays image previews and pets in tmux on Ghostty and Kitty with `allow-passthrough all`. (#59579, #59580) - Set `tui.notification_method = "osc777"` for terminal notifications. Approval notifications show longer command previews and distinguish terminal input from network access requests. (#59256) ## Bug Fixes - Local TUI history and resume pickers filter newly created threads by the signed-in ChatGPT account. (#58918) - Open and resumed chats use their saved model provider after you change the default for new chats. (#59503) - The TUI renders replies interrupted by tool calls as a single Markdown message and restores reasoning summaries when replaying a conversation. (#59698, #59700) - Steering messages reach running turns when sent during the final transcript save or after switching back to a long-running chat. (

### Oh My Pi v18.20.0
kind: release · source: can1357/oh-my-pi · published: 2026-11-12 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.0
## @oh-my-pi/pi-agent-core ### Changed - `prepareCompaction()` runs as the `compaction.prepare` loop phase, so a `ui.loop-blocked` stall from a cold token walk over a long branch names compaction instead of "unknown" ([#15027](https://github.com/can1357/oh-my-pi/issues/15027), [#18867](https://github.com/can1357/oh-my-pi/pull/18867) by [@wolfiesch](https://github.com/wolfiesch)) ## @oh-my-pi/pi-ai ### Added - Added the `google-decisions` judgment API for Google's Gemini Decisions API (`gemini-decision-1`), with text and image input ([#19060](https://github.com/can1357/oh-my-pi/pull/19060) by [@kevcube](https://github.com/kevcube)) - Added `apiKey` to successful `OAuthAccessResolution` results from `oauth.accessById()` and `oauth.accessAll()`: the key normal requests send for that account, which differs from `accessToken` for providers with structured credentials ([#19030](https://github.com/can1357/oh-my-pi/pull/19030) by [@Xytronix](https://github.com/Xytronix)) - Added an optional `exemptionAlias` to `ToolCallLoopGuard` so transport calls can match the dispatched tool's name in `exemptTools` ([#18860](https://github.com/can1357/oh-my-pi/issues/18860)) - Added the `liquid-systemone` judgment API for Liquid AI's decision models, which rejects image sets over Liquid's 10,000 32×32-patch request cap before sending ([#18076](https://github.com/can1357/oh-my-pi/issues/18076), [#18100](https://github.com/can1357/oh-my-pi/pull/18100) by [@SuperUserA](https://github.com/SuperUserA))

===== 2026-11-13 · AI Models & Labs =====

### Google: Gemini 4 Hydrogen
kind: model · source: OpenRouter · published: 2026-11-12 · link: https://openrouter.ai/google/gemini-4-hydrogen
Gemini 4 Hydrogen is the high-efficiency workhorse model of the Gemini 4 family from Google, built for high-throughput agentic workflows, coding and multi-model routing at lower cost and latency than...

### Google: Gemini 4 Hydrogen (batch)
kind: model · source: OpenRouter · published: 2026-11-12 · link: https://openrouter.ai/google/gemini-4-hydrogen:batch
Gemini 4 Hydrogen is the high-efficiency workhorse model of the Gemini 4 family from Google, built for high-throughput agentic workflows, coding and multi-model routing at lower cost and latency than...

===== 2026-11-13 · AI Policy =====

### Communication from the Commission – Guidelines on the implementation of the transparency obligations for certain AI systems under Article 50 of Regulation (EU) 2024/1689 (the AI Act)
kind: policy-item · source: EUR-Lex · published: 2026-11-12 · stage: Preparatory document · link: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005
(the source gave no text)

### Gewijzigde motie van het lid Beckerman over onderzoeken hoe kunstenaars en makers beter beschermd kunnen worden tegen AI (t.v.v. 37020-XIII-28)
kind: policy-item · source: Tweede Kamer · published: 2026-11-12 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24997&did=2026D57726
Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Nonprofits sue Anthropic, Google, and other tech giants to freeze the AI arms race
kind: policy-item · source: Politico US · published: 2026-11-12 · link: https://www.politico.com/news/2026/11/12/nonprofits-sue-ai-companies-over-existential-risk-01161965
Five tech companies are targeted in a San Francisco suit that wants a court to block more advanced models and self-improving AI.

### AI Kill Switches: What Policymakers Should Know
kind: policy-item · source: CSET · published: 2026-11-12 · link: https://cset.georgetown.edu/article/ai-kill-switches-what-policymakers-should-know/
Policymakers have recently proposed requiring “AI kill switches” to quickly stop an AI system or limit the impact of a harmful or unwanted AI incident. This piece describes different potential implementations of AI kill switches at each layer of the AI stack and offers key takeaways for policymakers. The post AI Kill Switches: What Policymakers Should Know appeared first on Center for Security and Emerging Technology .

===== 2026-11-13 · Data Engineering =====

### Snowpark Python Release
kind: release · source: snowflakedb/snowpark-python · published: 2026-11-12 · link: https://github.com/snowflakedb/snowpark-python/releases/tag/v1.57.0
## 1.57.0 (2026-11-12) ### Snowpark Python API Updates #### New Features - Added `Session.semantic_view()` (PuPr) to query a semantic view. Pass the semantic view name plus any of `dimensions`, `metrics`, `facts`, and `where`; it returns a `DataFrame`. - Added `Session.debug` (Experimental) to turn the debug features on and off per session, with `session.debug.set(...)` or `session.debug.enable_<feature>()` / `disable_<feature>()`. The features are: - `eager_schema_validation`: validates the schema of a DataFrame when it is created, so an invalid operation fails at the line that defines it. - `trace_sql_errors_to_dataframe`: maps a SQL compilation error to the Python lines of the DataFrame operations that generated the failing SQL. - `dataframe_trace_on_error`: adds the most recent DataFrame operations of a failed DataFrame to the error. `snowflake.snowpark.context.configure_development_features` is now a mirror of `Session.debug` that applies to every session. - Added support for the following functions in `functions.py`: - `try_to_boolean` - `try_to_date` - `try_to_decfloat` - `try_to_decimal` (with aliases `try_to_number` and `try_to_numeric`) - `try_to_double` - `try_to_time` - `try_to_timestamp` - `try_to_timestamp_ltz` - `try_to_timestamp_ntz` - `try_to_timestamp_tz` #### Improvements - The debug features of `Session.debug` (Experimental) and `snowflake.snowpark.context.configure_development_features` (Experimental) no longer depend on AST collection and no longer chang

### dbt Core dbt v1.12.7
kind: release · source: dbt-labs/dbt · published: 2026-11-12 · link: https://github.com/dbt-labs/dbt/releases/tag/v1.12.7
## dbt-core 1.12.7 - November 12, 2026 ### Features - Extend RunResult with the state_decision_id attribute ([#0](https://github.com/dbt-labs/dbt-core/issues/0)) ### Fixes - Fall back to per-source freshness checks when batch metadata freshness computation fails, instead of skipping every selected source now that `skip_nodes_if_on_run_start_fails` defaults to True ([#15634](https://github.com/dbt-labs/dbt-core/issues/15634)) - Scope relation-cache population in `compile`/`show`/`docs generate` to the selected nodes' schemas so `--cache-selected-only` is honored (previously only `run` respected the flag) ([#12944](https://github.com/dbt-labs/dbt-core/issues/12944)) - Fix `statically_parse_unrendered_config` stringifying list/dict config values, which caused false positives in `state:modified` comparisons across different dbt versions. ([#16133](https://github.com/dbt-labs/dbt-core/issues/16133)) - Reword the snapshot timestamp data type mismatch warning to identify hard-delete timestamps as the affected columns and to recommend overriding the `snapshot_get_time` macro, instead of incorrectly suggesting a change to the snapshot's `updated_at` config ([#fs-14450](https://github.com/dbt-labs/dbt-core/issues/fs-14450)) - Recognize Databricks Python model config keys (`access_control_list`, `notebook_access_control_list`) in jsonschema validation so they no longer raise spurious `CustomKeyInConfigDeprecation` warnings (dbt-databricks#1661) ([#N/A](https://github.com/dbt-labs/dbt-co

### Dagster 1.13.30 (core) / 0.29.30 (libraries)
kind: release · source: dagster-io/dagster · published: 2026-11-12 · link: https://github.com/dagster-io/dagster/releases/tag/1.13.30
### New - Dropped support for Python 3.10. Dagster now requires Python 3.11 or later. - [ui] The asset catalog and asset graph no longer poll asset health data for assets whose health isn't shown, which reduces load when browsing large workspaces. - [dagster-cloud-cli] Added a `dagster-cloud deployment copy-materializations` command, which copies the latest asset materializations from one deployment to another and keeps their original timestamps. ### Bugfixes - [dagster-cloud-cli] Fixed Serverless fast deploys failing with `No module named ...` when the project's code is not installed as a package. ### Dagster Plus - Users with the "Edit concurrency limits" permission can now edit concurrency limits from the Concurrency settings page. - The Dagster+ MCP server now has tools to read schedules, sensors, and their ticks, to start and stop schedules and sensors, and to work with asset partitions, including adding and deleting dynamic partitions. - Serverless code locations that take more than 3 minutes to load no longer fail to deploy. - Serverless base images are no longer built for Python 3.10. Existing Python 3.10 PEX code locations keep running on the last Python 3.10 base image. - Fixed the "Send Sample Alert" button on the alert policy details page not sending Slack alerts. - Alert emails and Microsoft Teams alerts now escape customer-provided values such as job names and asset keys, so those values can no longer inject HTML.

### Great Expectations 1.25.0
kind: release · source: great-expectations/great_expectations · published: 2026-11-12 · link: https://github.com/great-expectations/great_expectations/releases/tag/1.25.0
Compatibility: `zstandard` minimum 0.25.0 removed (extra `spark-connect`) #### Highlights - **Compare two columns in a row condition** — Row conditions can now compare two columns of the same row on pandas, Spark and SQL backends. `Column`'s comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`) build a column-to-column condition when the right-hand side is another `Column`; it joins AND/OR groups, saves and reloads with a suite, and renders in Data Docs as written. Rows with a null in either column are excluded under every operator, and `is_in`/`is_not_in` reject a `Column` with a message pointing to the comparison operators. ([#12363](https://github.com/fivetran/great_expectations/pull/12363)) ```python import great_expectations.expectations as gxe from great_expectations.expectations.row_conditions import Column gxe.ExpectColumnValuesToNotBeNull( column="shipped_at", row_condition=Column("end_date") > Column("start_date"), ) ``` - **SQL metrics and Expectations work with a row condition** — Distinct-values, median, quantile, value-counts, histogram, sample-values, regex-values, table head and column-pair Expectations and metrics no longer fail on SQL backends when a row condition is set. They previously emitted a SQLAlchemy 2.0 deprecation warning and raised an `ArgumentError` under SQLAlchemy 2.1. Results without a row condition are unchanged. ([#12364](https://github.com/fivetran/great_expectations/pull/12364), [#12368](https://github.com/fivetran/great_expectations/pul

### Polars Nanook benchmarked against Databricks Photon
kind: community-post · source: Polars blog · published: 2026-11-12 · link: https://pola.rs/posts/polars-nanook-vs-databricks/
In this blog post we compare Polars Nanook against the Databricks Spark with Photon engine.

### dltHub brings data and meaning into ClickHouse
kind: community-post · source: dltHub blog · published: 2026-11-12 · link: https://dlthub.com/blog/dlthub-clickhouse-ontology-agents
Private Preview: dltHub writes your business definitions into ClickHouse table and column comments, so ClickHouse Agent gives trusted answers.

### dltHub on ClickHouse: the ClickHouse Agent walkthrough
kind: community-post · source: dltHub blog · published: 2026-11-10 · link: https://dlthub.com/blog/clickhouse-agent-ontology-walkthrough
Demo walkthrough: dltHub loads GitHub data, its definitions and an ontology into ClickHouse, so ClickHouse Agent answers how much CI is waste.

### Operational Ontology on Snowflake: From Business Meaning to Governed AI Action
kind: community-post · source: Snowflake on Medium · published: 2026-11-12 · link: https://medium.com/snowflake/operational-ontology-on-snowflake-from-business-meaning-to-governed-ai-action-6f3ef270d3f2
A reference architecture for AI agents to reason over operational state, simulate decisions, execute governed actions, and verify real-world outcomes. From Enterprise Knowledge to Operational Decisions At 1:30 PM, packing station PB-04 goes offline in a distribution center. Orders begin accumulating, and a carrier scheduled to depart at 5:00 PM may leave before its shipments are ready. An AI agent connected to warehouse data can identify the failed station, trace affected orders, and explain the shipping risk. But the warehouse manager needs to decide what to do. Can qualified workers move to another station? Can orders be rerouted? Which recovery plan has the best chance of meeting the deadline without creating another bottleneck? Answering these questions requires current operational state, resource capabilities, business constraints, and a way to evaluate proposed changes. Acting on a decision also requires authorization and confirmation that the intended changes occurred. In the ea…

### Streamlit’s Floor, React’s Ceiling, Inside Snowflake
kind: community-post · source: Snowflake on Medium · published: 2026-11-12 · link: https://medium.com/snowflake/streamlits-floor-react-s-ceiling-inside-snowflake-c78f90e39dc8
Keep the simplicity of Streamlit in Snowflake, and move the interactions that a rerun cannot do to the front end Picture a revenue review. An analyst opens the pipeline dashboard and points at EMEA on the regional bar chart. A tooltip appears. The other charts and the KPIs do not change. She wants more. She wants every chart and KPI to show the EMEA numbers while she points. Then she wants to drag across two quarters on the trend line and watch bookings and the commit share change during the drag. That is how she finds the quarter where the commit share fell. Without these interactions, she must click, wait for the rerun, read the result and click again, for every guess. I build many Streamlit in Snowflake (SiS) apps. I use SiS because it is the simplest way that I know to show data to people, not to mention that you can have an app up and running with a SINGLE PROMPT . I did not want to move my apps out of SiS. I wanted SiS to support these interactions. I call the result RiSiS (React…

### ABAC DENY policies support AI securables and attachment to individual objects (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#abac-deny-policies-support-ai-securables-and-attachment-to-individual-objects-beta
Expanded FOR clause support: DENY policies can now apply to model services, model provider services, MCP services, agent services, and skills. Expanded ON clause support: DENY policies can now be attached directly on tables, volumes, functions, models, secrets, model services, model provider services, MCP services, agent services, and skills. See Supported securable types and privileges.

### Standalone pipelines on serverless general compute are now generally available
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#standalone-pipelines-on-serverless-general-compute-are-now-generally-available
Creating and refreshing standalone materialized views and streaming tables from a notebook on serverless general compute is now generally available. You can define them with SQL through spark.sql() or with the Python pipelines decorators. See Notebooks and Use Python with standalone pipelines.

### Partial schema inference for Python Lakeflow pipelines
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#partial-schema-inference-for-python-lakeflow-pipelines
In an upcoming release, Python Lakeflow pipelines will support partial schema inference in Beta. You will be able to use the override_schema argument of table, materialized_view, or create_streaming_table to declare only the columns whose type, constraint, or comment you want to control. The pipeline infers the remaining columns from the query output. See Develop pipeline code with Python.

### Budget alerts can now trigger webhooks (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#budget-alerts-can-now-trigger-webhooks-beta
You can now configure budgets to trigger webhooks when spend thresholds are exhausted, so budget events can be routed to incident, ticketing, or automation tools. See Trigger custom webhooks.

### AI Functions Asynchronous API (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-functions-asynchronous-api-beta
You can now use the AI Functions Asynchronous API to run ai_parse_document, ai_extract, or ai_classify asynchronously on up to 50,000 requests from a JSONL file in a Unity Catalog volume. The batch writes one result for each request to a file in a volume. Workspace admins can turn on the AI Functions Asynchronous API preview from the Previews page. This feature is in Beta. See the Asynchronous API reference. For examples, see document parsing, information extraction, and classification.

### [In preview] Public Preview: SQL performance monitoring for Azure SQL Managed Instance
kind: vendor-note · source: Azure updates · published: 2026-11-12 · link: https://azure.microsoft.com/updates?id=574158
The public preview of Microsoft-managed performance monitoring for Azure SQL Managed Instance is now available. Customers monitoring business-critical SQL Managed Instance workloads often rely on custom scripts and disconnected monitoring tools. This requ

### Nov 13, 2026: Many-to-many relationships in semantic views (Preview)
kind: vendor-note · source: Snowflake · published: 2026-11-13 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-semantic-views-many-to-many-preview
Many-to-many relationships are now in preview for semantic views. You can model a many-to-many relationship between two logical tables in either of the following ways:

### Nov 12, 2026: Snowflake Data Clean Rooms updates
kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcr
Clean Rooms API Version: 19.4 The following updates are now available in Snowflake Data Clean Rooms: Save analysis results: You can now save the results of a SQL analysis template run to a table in the clean room, so you can query them later or compare results across runs without rerunning the analysis. To save results, add the save_mode and name fields to the analysis specification that you pass to RUN. Saved results are stored in the clean room and aren't visible to other collaborators. Learn more. Security scan rejection reasons in update requests: When a request to add or update a template with a code spec fails the automated security scan, VIEW_UPDATE_REQUESTS now shows the specific reason that the scan rejected the code spec. Use the reason to fix the code and resubmit the request. General performance improvements and bug fixes.

### Nov 11, 2026: Semantic view materializations (General availability)
kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-semantic-view-materializations-ga
Semantic view materializations are now generally available and are no longer in Preview. With materializations, you can pre-aggregate frequently queried dimensions and metrics in a semantic view to improve query performance.

### Nov 10, 2026: INTEGRATIONS view in ACCOUNT_USAGE (Preview)
kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-account-usage-integrations-view-preview
With this preview release, the ACCOUNTUSAGE schema includes a new INTEGRATIONS view that returns a row for each integration in your account. The view includes metadata for API, catalog, external access, notification, security, and storage integrations, such as the integration type, category, enabled

### November 10, 2026: Geospatial maps in Snowflake CoWork (Preview)
kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-cowork-maps-preview
Geospatial maps are now available in preview in Snowflake CoWork. When a question returns locations, regions, or density over geography, the agent can plot the result on an interactive map: latitude and longitude points, H3 hexagons, or GEOGRAPHY and GEOMETRY shapes. You can pan and zoom the map in

### You can track table-level data lineage in Knowledge Catalog for BigQuery pipelines (GA)
kind: vendor-note · source: BigQuery · published: 2026-11-12 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026
You can track table-level data lineage in Knowledge Catalog for BigQuery pipelines. For more information, see Track data lineage. This feature is generally available (GA).

===== 2026-11-13 · Community stories =====

### Gemini 4 Hydrogen and Orchestrator
kind: story · source: Hacker News · published: 2026-11-12 · link: https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/ · discussion: https://news.ycombinator.com/item?id=50472260
Today, we're rolling out Gemini 4 Hydrogen inside Google Antigravity alongside a new model dropdown option called Orchestrator, which pairs Hydrogen with

### Edge0-145B: Frontier AI Capabilities on Your Own Computer
kind: story · source: Hacker News · published: 2026-11-12 · link: https://edge0.ai/blog/introducing-edge0-145b-frontier-ai-capabilities-on-your-own-computer · discussion: https://news.ycombinator.com/item?id=50475713
Meet Edge0-145B, an open-source 145B model for local coding, reasoning, and agent tasks, with no cloud-model token fees for local inference.

### Foundation Models framework
kind: story · source: Hacker News · published: 2026-11-12 · link: https://developer.apple.com/foundation-models-framework/ · discussion: https://news.ycombinator.com/item?id=50474361
The Foundation Models framework is a native Swift API for integrating any large language model into your app.

### I'm making LLMs work on small and old devices
kind: story · source: Hacker News · published: 2026-11-12 · link: https://github.com/hyperionaidev/smolmaxxing/ · discussion: https://news.ycombinator.com/item?id=50468888
maxxing the ability to run different LLMs on the smallest devices possible

### Turning a 22-year-old Postgres type-confusion primitive into RCE
kind: story · source: Hacker News · published: 2026-11-12 · link: https://mehmetince.net/part-3-6-how-i-ended-up-turning-a-22-year-old-postgresql-type-confusion-primitive-into-rce-cve-2026-6460/ · discussion: https://news.ycombinator.com/item?id=50471761
If you had told me in April 2026 one question “Mehmet, can we use managed PostgreSQL for this project?” would send me into the deepest rabbit hole of my life, I would have laughed. Months later, I finally found the bottom of that rabbit hole. It was a 22-year-old zero-day in PostgreSQL core. In this

### Anthropic IPO
kind: story · source: Hacker News · published: 2026-11-12 · link: https://ipo.anthropic.com/us/ · discussion: https://news.ycombinator.com/item?id=50465829
Anthropic has filed to become a public company. Read the Founders’ letter and other relevant information.

### Gemini 4 Hydrogen
kind: story · source: Hacker News · published: 2026-11-12 · link: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/ · discussion: https://news.ycombinator.com/item?id=50471431
Today, we’re introducing Gemini 4 Hydrogen, our daily driver for agentic workflows

### Chinese frontier AI models carry the fingerprint of export-controlled GPUs
kind: story · source: Hacker News · published: 2026-11-12 · link: https://unemploymentlabs.com/checkpoint-forensics · discussion: https://news.ycombinator.com/item?id=50474883
Our forensic analysis of publicly released AI models finds evidence that DeepSeek, Moonshot AI, MiniMax and Ant Group have gained access to NVIDIA’s Blackwell GPUs, despite restrictions on exporting these chips to China, and are using that hardware to create their AI models.

### Anthropic carelessly killed a Claude Code feature users built on, no warning
kind: story · source: Hacker News · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/issues/109446 · discussion: https://news.ycombinator.com/item?id=50477704
Regression: 2.1.323 silently removed subagentStatusLine, with no reason, no replacement and no migration path What happened The 2.1.323 changelog says: Removed the subagentStatusLine setting: subag

### Show HN: AgentRun – open-source, Self-improving Managed Agents
kind: story · source: Hacker News · published: 2026-11-12 · link: https://github.com/Parcha-ai/agentrun/blob/main/README.md · discussion: https://news.ycombinator.com/item?id=50471650
AgentRun is an open-source platform that supercharges your agents. It adds self-improvement, durable execution and a control plane on top of your favorite agent harness. Your agents become smarter,

### PostgreSQL 18.7, 17.12, 16.16, 15.20, 14.25, and 19 RC 2 Released
kind: story · source: Hacker News · published: 2026-11-12 · link: https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/ · discussion: https://news.ycombinator.com/item?id=50467763
The PostgreSQL Global Development Group has released an update to all supported versions of PostgreSQL, including 18.7, 17.12, 16.16, 15.20,

### Pi GPUI: A native GUI for the pi coding agent, built with Rust and GPUI.
kind: story · source: Hacker News · published: 2026-11-12 · link: https://pi-gpui.dev · discussion: https://news.ycombinator.com/item?id=50464872
A native GUI for your installed pi coding agent, built with Rust and GPUI for macOS and Linux.

### Tell HN: Cast('abc' AS INTEGER) returns 0 in SQLite
kind: story · source: Hacker News · published: 2026-11-12 · link: https://news.ycombinator.com/item?id=50468864 · discussion: https://news.ycombinator.com/item?id=50468864
(the source gave no text)

### Durable Execution Agents
kind: story · source: Hacker News · published: 2026-11-12 · link: https://martinfowler.com/articles/durable-execution-agents.html · discussion: https://news.ycombinator.com/item?id=50462904
(the source gave no text)

### libreagi - save OS models
kind: story · source: Lobste.rs · published: 2026-11-12 · link: https://libreagi.com/ · discussion: https://lobste.rs/s/7c4iar/libreagi_save_os_models
A private BitTorrent tracker where members keep copies of the open models most likely to disappear.

### MCP Is Dead Simple. And That's Exactly the Problem
kind: story · source: Dev.to · published: 2026-11-12 · link: https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811 · discussion: https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811
What exactly is MCP? Is it some mysterious technology that requires secret knowledge to implement?

### Your MCP Servers Are Silently Draining Your Context Window: The Hidden Cost of Tool-Heavy AI Agents
kind: story · source: Dev.to · published: 2026-11-12 · link: https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl · discussion: https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl
Why attaching dozens of Model Context Protocol (MCP) tools degrades LLM reasoning, inflates API bills, and how small, focused TypeScript micro-tools fix the problem.

===== 2026-11-14 · AI Agents =====

### Claude Code v2.1.325
kind: release · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.325
## What's changed - Fixed a security issue in how zstd-compressed responses are decoded - Added a spinner tip in VS Code and similar integrated terminals about re-running a notebook cell, shown once Claude has read or edited a Jupyter notebook - Added a line under the error shown when your organization's policy blocks a request, saying how to continue: run `/rewind` and change the message, or run `/clear` - Added a note for Claude when a sandboxed `git checkout`, `git stash` or autostash pull cannot update protected files such as those in `.claude` - Fixed `/security-review` and skills' inline git commands stopping with an error in worktrees of bare repositories, `--separate-git-dir` checkouts and Android `repo` checkouts - Fixed subagents with their own model being moved to the plan-mode model when the model setting is `opusplan` or `haiku` - Fixed subagents on a different model sizing file reads and MCP results with the main session's model - Fixed sessions on many third-party gateways and Foundry stopping with a context length error on every turn instead of compacting - Fixed recent turns sometimes going missing from a resumed session after Claude Code stopped without a clean exit - Fixed shell commands running in the launch directory after the working directory was deleted; the command now fails with a message and can be re-issued - Fixed an approved plan edit being lost when the `plansDirectory` folder can't take it: the plan is now saved in the default plans folder, and

### [BUG] Claude down?
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/issues/109508
### Preflight Checklist - [x] I have searched [existing issues](https://github.com/anthropics/claude-code/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug) and this hasn't been reported yet - [x] This is a single bug report (please file separate reports for different bugs) - [x] I am using the latest version of Claude Code ### What's Wrong? Please run /login · API Error: 403 Attention Required! | Cloudflare I opened my claude.ai and settings but my user info is not loading ### What Should Happen? should be able to login ### Error Messages/Logs ```shell ``` ### Steps to Reproduce Please run /login · API Error: 403 Attention Required! | Cloudflare I opened my claude.ai and settings but my user info is not loading ### Claude Model None ### Is this a regression? Yes, this worked in a previous version ### Last Working Version _No response_ ### Claude Code Version latest ### Platform Anthropic API ### Operating System macOS ### Terminal/Shell Terminal.app (macOS) ### Additional Information _No response_

### [BUG] Claude in Chrome: new Claude Code sessions get 'Browser extension is not connected' while already-running sessions see the browsers (macOS, since 2026-11-07)
kind: hot-issue · source: anthropics/claude-code · published: 2026-11-09 · link: https://github.com/anthropics/claude-code/issues/108679
## What happens Since about 2026-11-07 21:10 UTC, newly started Claude Code sessions on my Mac get this on their first claude-in-chrome call: > Browser extension is not connected. Please ensure the Claude browser extension is installed and running… `list_connected_browsers` returns the same message. During the same minute, a Claude Code session that was already running lists the browsers and drives tabs normally. Retrying inside the new session does not help. Neither do waiting, restarting Chrome, or switching the native host. A running session that has lost the browser comes back only when a browser reconnects to the bridge (its `connectedAt` changes), for example after I open the Claude side panel in Chrome. ## Environment - macOS. Claude Code 2.1.319 and 2.1.321 (both affected; 2.1.319 worked fine until Nov 7). - Claude in Chrome 1.0.105 (installed Nov 4, unchanged), Chrome 156.0.8078.80 (updated Nov 3, unchanged). - One Chrome profile with the extension, signed in to the same claude.ai account and org as Claude Code. A second Mac's Chrome is signed in to the same account. - `~/.claude.json` has `chromeExtension.pairedDeviceId` set to the local Chrome. - Many Claude Code sessions run on this machine (automated runner panes plus interactive ones). ## Measurements From local Claude Code transcripts (`~/.claude/projects/**/*.jsonl`): - Nov 4 to Nov 7 21:10 UTC: about 50 sessions used claude-in-chrome, with 0 "not connected" errors. - From Nov 7 21:10 UTC to Nov 9: in 47 of 51

### OpenAI Codex 0.169.0
kind: release · source: openai/codex · published: 2026-11-13 · link: https://github.com/openai/codex/releases/tag/rust-v0.169.0
## New Features - The opt-in terminal workspace supports multiple side-chat tabs. Switch between them with the keyboard or mouse, and reopen saved local side chats after restarting Codex. (#59784, #60152, #60181) - Search older tasks from the agent command center by name, prompt preview, or working directory. (#60286) - Turn on **Collapse turn details** in the full-screen transcript to fold completed activity beneath each prompt while keeping answers visible and tool output searchable. (#60554, #60555, #60556, #60557) - Add or edit custom model providers from the terminal. With custom gateway onboarding enabled, you can create a provider during sign-in and use a device code for supported gateways over SSH or without a local browser. (#59779, #60009, #60186, #60486, #60662) - Press `Ctrl+S` in the terminal report editor to save a diagnostic ZIP locally, even when uploads are disabled. (#60542) - With the opt-in Cloud connection on macOS and Linux, send images, choose a model and reasoning effort, and archive or restore Cloud conversations from the terminal. (#59828, #60061, #60635, #60651) ## Bug Fixes - `codex exec` keeps project configuration and MCP servers disabled in untrusted directories, even with `--sandbox workspace-write`. Use `--trust` with `codex exec` or `codex review` to explicitly save project trust. (#60041) - **Yes, clear context and implement** now hands the full approved plan to the fresh session and keeps the current session open if the handoff fails. (#607

### Feature request: make ChatGPT + Work + Codex a continuous engineering workspace, not disposable tasks
kind: hot-issue · source: openai/codex · published: 2026-11-13 · link: https://github.com/openai/codex/issues/61348
**Provenance and review:** Compiled and reviewed by ChatGPT from user-provided conversations and complaint summaries. ChatGPT checked the presentation against the materials available in these exchanges; this is **not independent verification of every original chat, local file, tool log, or test result**. Unverified details remain reported claims. ## TL;DR **I don't need another AI model, another /goal, another temporary agent, or another workaround to maintain. I need to open ChatGPT, talk through an engineering problem, send the resulting task and evidence to my *existing* agent on my own computer through Work/Codex, and return to the same work tomorrow.** The real unit of work should be a **long-lived engineering project with durable, verifiable experience**, not an isolated chat, task, or model invocation. This is a cross-product **UX/product-design request**, not a claim that Work chats cannot be reopened or that Codex has no session-resume functionality. Those partial capabilities exist. The end-to-end experience described below is what is missing. ## Why this needs to be treated as a serious product problem **This is not a hypothetical feature request. It is time already lost in real engineering work.** The current workflow effectively taxes a project owner every time work crosses a product, device, context window, or agent session. The tax is paid in repeated explanations, re-checking decisions, reconstructing how tools were used, and resolving contradictions between c

### OpenCode v2.3.0
kind: release · source: anomalyco/opencode · published: 2026-11-13 · link: https://github.com/anomalyco/opencode/releases/tag/v2.3.0
### Highlights - **Background Subagents by Default**: Subagents now return immediately, continue in the background, and report back whenever they become idle. You can keep working in the parent session while multiple subagents run concurrently. ([#63382](https://github.com/anomalyco/opencode/pull/63382)) - **Quieter Transcripts by Default**: The TUI now summarizes each run of tool calls and thoughts into one collapsible activity row, so the answer is easier to follow. To see every step again, set **Verbosity** to `medium` or `high` in settings, or set `session.verbosity` in your TUI config; an existing setting is kept. ([#63207](https://github.com/anomalyco/opencode/pull/63207)) - **Jump to an Earlier Prompt**: In the desktop app, open **Jump to message** from the command palette or press `Cmd+Alt+G` (`Ctrl+Alt+G` on Windows and Linux) to search prompts across the current session and jump directly to one. ([#63585](https://github.com/anomalyco/opencode/pull/63585)) ### Core #### Improvements - Subagents now always run in the background, return their session ID immediately, and report results to their parent whenever they become idle. ([#63382](https://github.com/anomalyco/opencode/pull/63382)) - Added experimental support for MCP events, behind the `mcp_events` flag. ([#63254](https://github.com/anomalyco/opencode/pull/63254), [#63261](https://github.com/anomalyco/opencode/pull/63261), [#63269](https://github.com/anomalyco/opencode/pull/63269)) - Shell commands now survive se

### DeepSeek Harness v0.2.2-rc.3
kind: release · source: deepseek-ai/deepseek-harness · published: 2026-11-13 · link: https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.3
[中文](#cn-v0.2.2-rc.3) | [English](#en-v0.2.2-rc.3) <h3 id="cn-v0.2.2-rc.3">新增功能</h3> - 新增实验性「DeepSeek 会话导入」插件，支持将 DeepSeek App 或网页版的历史会话导入工作区，并继续对话。 @imccyu ### 问题修复 - 修复 Windows 桌面版应用内更新可能失败、无法自动重新打开的问题。 @winewill <h3 id="en-v0.2.2-rc.3">New Features</h3> - Add an experimental DeepSeek chat import plugin to import past conversations from DeepSeek App or its web version into a workspace and continue chatting. by @imccyu ### Bug Fixes - Fix an issue that could cause Windows desktop in-app updates to fail and prevent the app from reopening automatically. by @winewill Full Changelog: https://github.com/deepseek-ai/deepseek-harness/compare/dsh-v0.2.2-rc.2...dsh-v0.2.2-rc.3

### [Security] Terminal environment snapshots capture credential-bearing env vars to disk
kind: hot-issue · source: nousresearch/hermes-agent · published: 2026-07-10 · link: https://github.com/NousResearch/hermes-agent/issues/62336
## Summary The terminal environment snapshot mechanism in `tools/environments/base.py` captures **all** environment variables to disk via `export -p`, including sensitive credentials injected by `bws run --` and Bitwarden Secrets Manager at startup. These snapshots persist at `cache/terminal/hermes-snap-*.sh` and contain plaintext credential values. ## Root Cause In `tools/environments/base.py`, two locations call `export -p` to dump the full environment into snapshot files: 1. **`init_session()` (line 399):** Session bootstrap captures initial environment 2. **`_wrap_command()` (line 516):** After each command, re-dumps environment Both use unfiltered `export -p`, which writes every `declare -x` line — including secrets managed by BSM, `bws run --`, and auth pool env vars — to persistent disk files. ## Impact - Credentials survive sessions (files persist in `cache/terminal/`) - Any process/user with filesystem read access to the Hermes home directory can read them - The model can read them via `read_file` / `search_files` tool calls - Created ~2 MB of credential-bearing data across 21 snapshot files before detection ## Proposed Mitigation Filter credential-bearing env vars from `export -p` output before writing to the snapshot file. A `grep -vE` pipe excluding known credential prefixes prevents secrets from being persisted while preserving the snapshot mechanism for legitimate env vars: ```bash export -p | grep -vE '^(declare -x (CREDENTIAL_PREFIXES|...))' > snap_tmp ``` The

===== 2026-11-14 · AI Models & Labs =====

### Building strong safety evaluations
kind: lab-post · source: anthropic · published: 2026-11-13 · link: https://www.anthropic.com/research/building-strong-safety-evaluations
01 Safety first Building strong safety evaluations 01 Safety first 02 Design 03 Run 04 Report 05 Where to start Published Nov 13, 2026 Team Engineering Safety evaluations inform some of the most consequential decisions we make about an AI model, including whether it’s ready to deploy, which safeguards ship alongside it, and what our next round of safety training and research should focus on. When we say a model is “safer than its predecessor,” we mean that it scored better on a set of evals someone built. But a safety claim is only as sound as the eval behind it, and good ones are hard to build. A safety eval measures a model’s propensity to cause or contribute to harm, whether its response to a request makes harm more or less likely, and how severe that harm would be, rather than measuring specific capabilities. It can cover different types of harm. For example, a user may actively request harmful outputs (such as seeking instructions on how to harm themselves), or they may request outputs that are intended to be harmless, but that come with high risk of unintended harm (such as seeking information on the appropriate dose of a drug). Essentially, a safety eval asks, “Given a specific input, did the model do the right thing?” Like other types of evals, these can be tricky to get right: researchers have repeatedly found that AI evals are easy to game , don’t always measure what they claim to measure, and aren’t documented well enough to reproduce . The results can change depen

### Introducing Chatgpt Wallet
kind: lab-post · source: openai · published: 2026-11-13 · link: https://openai.com/index/introducing-chatgpt-wallet/
(the source gave no text)

### inclusionAI: Ling 3.2 Flash (free)
kind: model · source: OpenRouter · published: 2026-11-13 · link: https://openrouter.ai/inclusionai/ling-3.2-flash:free
Ling 3.2 Flash is a hybrid reasoning model from inclusionAI that accepts text and image input, with a 1M-token context window and up to 200 images per request. Thinking can...

===== 2026-11-14 · Data Engineering =====

### Apache Airflow Apache Airflow TypeScript SDK 1.0.0
kind: release · source: apache/airflow · published: 2026-11-13 · link: https://github.com/apache/airflow/releases/tag/ts-sdk/1.0.0
First stable release of the Apache Airflow TypeScript SDK. Changes since 1.0.0-beta2: - A task that passes `queue` as `undefined` now inherits the Dag's queue. - The build no longer uses a machine-global pnpm config that created stray `.pnpm-store` directories. Published on npm as `@apache-airflow/ts-sdk@1.0.0`.

### Apache Airflow Apache Airflow Java SDK 1.0.0
kind: release · source: apache/airflow · published: 2026-11-13 · link: https://github.com/apache/airflow/releases/tag/java-sdk/1.0.0
First stable release of the Apache Airflow Java SDK. Changes since 1.0.0-beta1: - Native Java Dag authoring, serialized to DagSerialization v3: task dependencies, task groups, branching and conditions, edge labels - Triggering other Dags - Task state store and Variable APIs - Many fixes and hardening improvements Maven artifacts are published under group id `org.apache.airflow`; import `airflow-sdk-bom:1.0.0` to keep module versions aligned.

### Apache Airflow Apache Airflow Go SDK 1.0.0
kind: release · source: apache/airflow · published: 2026-11-13 · link: https://github.com/apache/airflow/releases/tag/go-sdk/v1.0.0
First stable release of the Apache Airflow Go SDK. Changes since 1.0.0-beta4: - Fix the Go SDK build on 32-bit targets. - Fix the install command breaking the first bundle build. - Log attributes no longer displace standard log fields. - `ti_run` now loads the serialized Dag only for stub tasks. Install with: ``` go get github.com/apache/airflow/go-sdk@v1.0.0 ``` API reference: https://pkg.go.dev/github.com/apache/airflow/go-sdk@v1.0.0

### AI Function task support in Declarative Automation Bundles (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-13 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-function-task-support-in-declarative-automation-bundles-beta
Support for AI Function tasks in Declarative Automation Bundles is now in Beta. See AI Function task.

### OneLake external locations support file events (Public Preview)
kind: vendor-note · source: Azure Databricks · published: 2026-11-13 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#onelake-external-locations-support-file-events-public-preview
You can now enable file events on OneLake external locations through a Fabric eventstream. Azure Databricks can create the eventstream for you, or you can provide your own. See Set up file events.

### Importing Power BI and Tableau files with Genie Code will soon be available by default for workspaces with the compliance security profile enabled
kind: vendor-note · source: Azure Databricks · published: 2026-11-13 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#importing-power-bi-and-tableau-files-with-genie-code-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled
You can use Genie Code to import Power BI and Tableau files as AI/BI dashboards and metric views. Starting on or after December 15, 2026, this will be available by default for workspaces with the compliance security profile enabled. Until then, a workspace admin can turn it on from Previews in the workspace settings. Importing requires partner-powered AI features for the account and workspace. See Import BI files using Genie Code.

### Artifacts and slides in Genie One (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#artifacts-and-slides-in-genie-one-beta
Artifacts are slide decks and other custom visual pages that Genie One builds from your data and saves to your workspace. Ask Genie for an artifact in chat, edit it yourself or ask for changes, then present it and share it with others. Anyone who views an artifact can use Ask Genie to ask questions about the data behind a chart or number. An artifact stores a snapshot of its data, so anyone who can view it sees that data, even without access to the source tables. This feature is in Beta. A workspace admin turns on the Artifacts preview from the Previews page. See Artifacts in Genie One and Slides in Genie One.

### Connectors section in Genie Agent settings (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#connectors-section-in-genie-agent-settings-beta
The Configure settings for a Genie Agent now have a dedicated section for adding connectors. This feature is in Beta. See Add connectors to a Genie Agent.

### Dashboard enhancements and bug fixes
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-enhancements-and-bug-fixes
Custom calculations with Genie Code: Genie Code can now write custom calculations that reference other custom calculations in the same dataset. See Referencing other calculations. Sort pivot tables: Viewers can now sort pivot tables by row and column. See Table and pivot table visualizations. Pivot table header styles: Authors can now style pivot table headers separately for each row, column, and value field. See Style pivot table headers. Pivot table text wrapping: Pivot table values can now adjust their height to wrap text. Pivot table divider: Authors can now resize the divider between columns and values in a pivot table. Associative filtering: Authors can now turn off associative filtering between dashboard filters. See Configure filter application behavior. Undo and redo for dashboard variables: Actions on dashboard variables now support undo and redo. See Use dashboard variables. Ask Genie on supported widgets: Ask Genie now appears only on widgets that Genie can use…

### Scheduled tasks can email other users in Genie One
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#scheduled-tasks-can-email-other-users-in-genie-one
Scheduled tasks in Genie One can now send emails to other users in your organization, not just to you. See Scheduled tasks.

### Flows are securable objects in Unity Catalog (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#flows-are-securable-objects-in-unity-catalog-beta
Pipeline flows are now securable objects in Unity Catalog. You can grant READ FLOW, REFRESH FLOW, WRITE FLOW, APPLY TAG, and MANAGE on individual flows, and CREATE FLOW on schemas. To participate in the Beta, contact your Databricks account team. See Flows in Unity Catalog.

### Gemini 3.6 Flash will be retired on November 19, 2026
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026
Google Gemini 3.6 Flash will be retired on November 19, 2026. Starting on that date, API calls to Gemini 3.6 Flash will be automatically redirected to Gemini 3.8 Flash at the same price. Gemini 3.8 Flash is the recommended replacement. See Legacy, deprecated, and retired models for migration guidance.

### OAuth on-behalf-of for service principals is generally available
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-on-behalf-of-for-service-principals-is-generally-available
OAuth on-behalf-of (OBO) for service principals is now generally available and turned on by default. With OBO, you use the standard user-to-machine (U2M) OAuth flow to act as a service principal you manage, without creating an OAuth secret. You must have the Service Principal Manager role on the service principal. A workspace admin no longer needs to turn on the feature from the Previews page. See Authenticate as a service principal using OAuth OBO.

### Pages will soon be available by default for workspaces with the compliance security profile enabled
kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#pages-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled
Starting in December 2026, Pages will be available by default for workspaces with the compliance security profile enabled. This applies to workspaces with no compliance standard selected or with the HIPAA, PCI-DSS, C5, TISAX, or HITRUST compliance standard selected. Workspaces with any other compliance standard can't use Pages. See Limitations. Pages are governed definitions of business concepts, such as critical terms, entities, and acronyms, organized by domain on the Discover page. Genie One prioritizes Page definitions over context it infers automatically and cites the Page in its answers. See Pages.

### Databricks SQL version 2026.45 is rolling out in Current
kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202645-is-rolling-out-in-current
Databricks SQL version 2026.45 is rolling out to the Current channel. See features in 2026.45.

### Use OneLake as native storage for Azure Databricks
kind: vendor-note · source: Microsoft Fabric · published: 2026-11-13 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks/ba-p/5377939
Sections: Why this matters; What's new in this release; One shared data foundation, with flexibility above it; Use OneLake as the storage foundation; Continue using Unity Catalog-managed objects; Keep platform responsibilities clear; How it works; Security; How to read the data in Fabric; Get started. Organizations increasingly use Microsoft Fabric and Azure Databricks together so teams can choose the tools that best fit their data engineering, analytics, and AI workloads while working from a common data foundation. OneLake external-location support for Azure Databricks Unity Catalog is now generally available in Microsoft Fabric, with OneLake Security enabled by default for Azure Databricks Storage items. On the Azure Databricks side, the feature is in preview. With this integration, supported Unity Catalog-managed data can be stored directly in OneLake. To understand the setup and supported scenarios, Connect Azure Databricks to a OneLake external location. Data teams often need Azu…

### Nov 13, 2026: AI_TRANSCRIBE delivers improved transcription accuracy
kind: vendor-note · source: Snowflake · published: 2026-11-13 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-ai-transcribe-accuracy-improvements
Snowflake Cortex AITRANSCRIBE has been upgraded to deliver improved transcription accuracy across multiple languages, including English and French. The update improves speech recognition quality, helping produce more accurate transcripts of meetings, conversations, and recorded audio. These improvem

### Nov 12, 2026: DCM Projects PLAN privilege (Preview)
kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcm-plan-privilege-preview
With this Public Preview release, you can grant the PLAN privilege on a DCM project to let a role run EXECUTE DCM PROJECT... PLAN and EXECUTE DCM PROJECT... PLAN DELTA without holding OWNERSHIP of the project. The DCM project privileges form a hierarchy in the order READ, MONITOR, PLAN, OWNERSHI

### Nov 12, 2026: Convert Tableau workbooks to Streamlit in Snowflake apps with CoCo (Preview)
kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-tableau-to-streamlit-preview
The tableau-to-streamlit-in-snowflake skill for Cortex Code (CoCo) is now available in preview. The skill converts a Tableau workbook into a multipage Streamlit in Snowflake app, with one app page for each Tableau dashboard. Worksheets become native Streamlit charts and tables, calculations become Snowflake SQL, and

### Nov 11, 2026: Select per-user quota users by role (General availability)
kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-role-scope
You can now define the users in a per-user quota by the roles they hold, in addition to user tags and user names. A role selects the users who are directly granted it, so quota scope stays current as you grant and revoke roles, including roles that your identity provider provisions.

### Nov 11, 2026: Programmatic notifications for Trust Center findings (General availability)
kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-trust-center-programmatic-notifications-ga
Programmatic notifications for Trust Center findings are now generally available and are no longer in Preview.

### Larger application package versions on AWS and Azure
kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/10_41
With this release, the maximum size of a file in an application package version increases from 5 GB to 150 GiB, and the maximum size of an application package version stage increases from 5 GiB to 150 GiB. These limits apply to accounts on AWS and Azure, including government regions and AWS China re

### BigQuery connections to MySQL, Oracle, and PostgreSQL are now available and can be used to run MySQL federated queries, Oracle federated queries, and PostgreSQL federated queries (Preview)
kind: vendor-note · source: BigQuery · published: 2026-11-13 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_13_2026
BigQuery connections to MySQL, Oracle, and PostgreSQL are now available and can be used to run MySQL federated queries, Oracle federated queries, and PostgreSQL federated queries. These features are in Preview.

===== 2026-11-14 · Community stories =====

### Unsloth Qwen3.8-27B Quantizations – Dynamic v3.1 Update
kind: story · source: Hacker News · published: 2026-11-14 · link: https://unsloth.ai/docs/models/qwen3.8 · discussion: https://news.ycombinator.com/item?id=50491980
Guide to running Qwen3.8 quants including Qwen3.8-27B on your local setup.

### Perplexity Decider v1.3: Training, eval, and use cases
kind: story · source: Hacker News · published: 2026-11-13 · link: https://www.perplexity.ai/hub/blog/perplexity-decider · discussion: https://news.ycombinator.com/item?id=50488464
(the source gave no text)

### Claude Meetings
kind: story · source: Hacker News · published: 2026-11-13 · link: https://claude.com/resources/articles/claude-meetings · discussion: https://news.ycombinator.com/item?id=50491097
Add Claude to your video calls to take notes, answer questions, and build docs and whiteboards while your team talks.

### Elevated errors on claude.ai, Claude Code, and platform.claude.com
kind: story · source: Hacker News · published: 2026-11-13 · link: https://status.claude.com/incidents/nn11wk485zfn · discussion: https://news.ycombinator.com/item?id=50481187
Claude's Status Page - Elevated errors on claude.ai, Claude Code, and platform.claude.com.

### Anthropic upgrades Claude Code Projects to run parallel AI workers
kind: story · source: Hacker News · published: 2026-11-14 · link: https://claude.com/resources/articles/projects-redesigned · discussion: https://news.ycombinator.com/item?id=50492141
A new experience for Claude projects, now available in beta in Claude Code

### OpenAI disbands its robotics team as its general models start running robots
kind: story · source: Hacker News · published: 2026-11-13 · link: https://fortune.com/2026/11/13/openai-disbands-robotics-team-as-its-general-models-start-running-robots/ · discussion: https://news.ycombinator.com/item?id=50487184
OpenAI moved its robotics researchers onto other teams representing new thinking about the best way to build general-purpose robots.

### Show HN: Log every LLM call with tokens, cost, latency, and time to first token
kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/garritfra/llmtee · discussion: https://news.ycombinator.com/item?id=50451943
Self-hosted LLM proxy.

### Claude Is Down
kind: story · source: Hacker News · published: 2026-11-13 · link: https://status.claude.com/history · discussion: https://news.ycombinator.com/item?id=50481220
Claude's Incident and Scheduled Maintenance History

### CVE-2026-6460 – Arbitrary Code Execution in Postgres
kind: story · source: Hacker News · published: 2026-11-13 · link: https://www.postgresql.org/support/security/CVE-2026-6460/ · discussion: https://news.ycombinator.com/item?id=50484044
(the source gave no text)

### AI agents have a big problem: Nobody wants to let them in
kind: story · source: Hacker News · published: 2026-11-13 · link: https://www.pcworld.com/article/3283946/ai-agents-have-a-big-problem-nobody-wants-to-let-them-in.html · discussion: https://news.ycombinator.com/item?id=50482661
(the source gave no text)

### Hugging Face CEO vows to keep fighting for open-source AI
kind: story · source: Hacker News · published: 2026-11-12 · link: https://techcrunch.com/2026/11/12/hugging-face-ceo-vows-to-keep-fighting-for-open-source-ai-after-jensen-huangs-exit/ · discussion: https://news.ycombinator.com/item?id=50471673
Hugging Face's CEO pledged to keep fighting for open source AI after Huang's exit, raising questions about Nvidia's $12.9 billion acquisition.

### Claude Code and Codex reverse engineered my 1994 Jeep's ECU over a $3 Arduino [video]
kind: story · source: Hacker News · published: 2026-11-12 · link: https://www.youtube.com/watch?v=WPj3aQ-xxpI · discussion: https://news.ycombinator.com/item?id=50463399
(the source gave no text)

### e-means: 10x faster k-means at equal loss
kind: story · source: Lobste.rs · published: 2026-11-13 · link: https://e-means.github.io/ · discussion: https://lobste.rs/s/rnmylu/e_means_10x_faster_k_means_at_equal_loss
Modern optimization and scaling laws for k-means clustering

### A VS Code extension to turn ANY free chatbot website into an AI agent (kind of)
kind: story · source: Dev.to · published: 2026-11-12 · link: https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb · discussion: https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb
So, why should I bring this up again? Because Qoder (Alibaba’s AI IDE) free promo has officially

### Torrents are perfect for model distribution
kind: story · source: Hacker News · published: 2026-11-13 · link: https://pirateface.co/articles/every-ai-model-should-be-a-torrent · discussion: https://news.ycombinator.com/item?id=50464055
(the source gave no text)

### How To Review Pull Requests with Kiro CLI and GitHub Actions
kind: story · source: Dev.to · published: 2026-11-13 · link: https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b · discussion: https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b
Review Pull Requests with Kiro CLI and GitHub Actions Kiro CLI has a headless mode. Give

===== 2026-11-15 · AI Agents =====

### # zstd request compression: highly compressible content gets a bare 400 instead of the documented 413, and Codex never avoids it
kind: hot-issue · source: openai/codex · published: 2026-11-14 · link: https://github.com/openai/codex/issues/61489
### What version of Codex CLI is running? codex-cli 0.167.0 ### What subscription do you have? Pro 500 ### Which model were you using? gpt-6.1-sol ### What platform is your computer? Linux x86_64（CentOS 8） ### What terminal emulator and version are you using (if applicable)? _No response_ ### Codex doctor report ```json ``` ### What issue are you seeing? ## Summary With `features.enable_request_compression` on (the default for ChatGPT auth), Codex zstd-compresses HTTP request bodies to `chatgpt.com/backend-api/codex/responses`. When part of the body decompresses to far more than its compressed size, the backend answers `400 {"detail":"Bad Request"}`. The same request sent uncompressed succeeds. The API docs ([production best practices → Compress request bodies](https://developers.openai.com/api/docs/guides/production-best-practices)) say the decompressed body must be at most 100× the compressed size, that requests exceeding the limits **return HTTP 413**, and that 400 is for invalid or incomplete zstd data. A decompression-ratio limit is reasonable; the problems are: 1. **The Codex backend returns a bare 400, not the documented 413**, so a client can't tell "ratio limit" from corrupted data, and the user only sees "Bad Request". 2. **Codex compresses by default and never avoids or recovers from it**: it does not check the ratio before sending and does not retry uncompressed. Once a thread's history contains such content, every later turn fails the same way. **The trigger is l

### Oh My Pi v18.20.2
kind: release · source: can1357/oh-my-pi · published: 2026-11-14 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.2
## @oh-my-pi/pi-ai ### Added - Added the Antigravity CLI ACP provider with managed installation, Google sign-in, refreshable distributed credentials, host tools, and retained conversations across tool steps and history changes. ## @oh-my-pi/pi-catalog ### Added - Added Antigravity CLI models for Gemini, Claude and GPT-OSS with selectable native thinking levels. ## @oh-my-pi/pi-coding-agent ### Added - Added the `antigravity-cli` provider for Google Antigravity over ACP, with managed binary installation, `/login antigravity-cli` Google sign-in, host tool execution, and retained conversations across tool steps and history changes. ## @oh-my-pi/pi-utils ### Added - Added a profile-aware data directory for managed Antigravity CLI installations and isolated account state. **Full Changelog**: https://github.com/can1357/oh-my-pi/compare/v18.20.1...v18.20.2

### Oh My Pi v18.20.1
kind: release · source: can1357/oh-my-pi · published: 2026-11-14 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.1
## @oh-my-pi/pi-agent-core ### Fixed - Corrected context cost estimates for requests that omit reasoning history, so billing estimates now include thinking text only when it is sent or reconstructed for a tool call. ## @oh-my-pi/pi-ai ### Added - Added `setUnpausedProviders()` to `@oh-my-pi/pi-ai/oauth`, allowing applications to re-enable providers paused by authentication rules; loaded credential pools and extension logins recognize the change on their next read. ### Changed - Updated Vertex AI Gemini requests to use the v1beta1 API, restoring support for long Gemini responses. - Improved Google Antigravity quota recovery so Gemini 4 Argon access can resume after quota or plan changes when shared Gemini capacity is available. - Improved Amazon Bedrock region selection to honor a configured regional endpoint before falling back to `us-east-1`. ### Fixed - Fixed Gemini 4 responses that exceed a single output segment across Google, Vertex AI, Gemini CLI, and Antigravity, ensuring long responses continue generating and are delivered as one complete reply. - Fixed Cursor conversations so hook-added prompt content remains in the current user message and conversation context is correctly preserved across turns. - Fixed Amazon Bedrock streaming so malformed responses fail promptly and interrupted responses are retried rather than treated as complete. - Fixed Claude account recovery when usage reports contain only one shared usage window. - Fixed OpenRouter conversations with Kimi an

===== 2026-11-15 · AI Policy =====

### Convergent Interests: How America Could Undermine Its Own AI Advantage
kind: policy-item · source: CSET · published: 2026-11-14 · link: https://cset.georgetown.edu/article/convergent-interests-how-america-could-undermine-its-own-ai-advantage/
A convergence of political, commercial, and ideological pressures can impede America’s AI leadership, and public controversies are powerful enough to catalyze that convergence. Our piece spotlights this issue, urging policymakers to govern AI responsibly without disabling the innovation that makes American leadership possible—even in the wake of scandal. The post Convergent Interests: How America Could Undermine Its Own AI Advantage appeared first on Center for Security and Emerging Technology .

===== 2026-11-15 · Data Engineering =====

### Apache Polaris Release 1.9.0
kind: release · source: apache/polaris · published: 2026-11-14 · link: https://github.com/apache/polaris/releases/tag/apache-polaris-1.9.0
Apache Polaris 1.9.0 Release ## Release Artifacts This release includes: - Source and binary distributions - Helm chart package - Docker images published to Docker Hub - Maven artifacts published to Maven Central ## Verification All artifacts have been signed with GPG and include SHA-512 checksums for verification. ## Docker Images - `apache/polaris:1.9.0` - Polaris Server - `apache/polaris-admin:1.9.0` - Polaris Admin Tool

### OpenMetadata 2.0.8-release
kind: release · source: open-metadata/OpenMetadata · published: 2026-11-13 · link: https://github.com/open-metadata/OpenMetadata/releases/tag/2.0.8-release
## Changelog OpenMetadata 2.0.8 is a maintenance release that expands connector coverage and improves lineage accuracy. It strengthens Data Quality and governance workflows. It also strengthens Model Context Protocol (MCP) authentication and access controls. The release improves search, Resource Description Framework (RDF) storage operations, and upgrades. It also improves user interface (UI) reliability. Security updates cover the server, ingestion, and Airflow. They also cover MCP and frontend dependencies. ### 🔌 Connectors and Ingestion This release includes the following connector and ingestion improvements: - **Deleting an ingestion pipeline could fail and leave its directed acyclic graph in Airflow** [#36267](https://github.com/open-metadata/OpenMetadata/pull/36267): Pipeline deletion now uses Airflow's supported cleanup path. It removes graph versions and cleans runs and task instances in dependency order. - **Glue Test Connection could fail on databases excluded by the pipeline filters** [#36574](https://github.com/open-metadata/OpenMetadata/pull/36574): Connection tests now probe only the databases and tables that ingestion is configured to read. - **Hex links were broken, and projects lacked detailed models and lineage** [#36420](https://github.com/open-metadata/OpenMetadata/pull/36420), [#36388](https://github.com/open-metadata/OpenMetadata/pull/36388), [#36856](https://github.com/open-metadata/OpenMetadata/pull/36856): Hex ingestion now builds working source link

### Databricks Runtime 19: November 9, 2026
kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-9-2026
Sections: Bug fixes. Fix real-time mode reservation liveness and occupied-slot accounting when tasks execute through Aether.

### Nov 11, 2026: Override per-user quota limits for specific users (General availability)
kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-limit-overrides
You can now set per-user, per-cycle credit limit overrides on a per-user quota to give specific users a higher or lower limit than the quota default without changing the quota's user scope or creating a separate quota. You can also set an optional expiration date so a temporary adjustment reverts au

### Gemini 3.6 Flash will be retired on November 19, 2026
kind: open-action · source: Azure Databricks · ends: 2026-11-19 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026
API calls to `Gemini 3.6 Flash` will be automatically redirected to `Gemini 3.8 Flash` on 2026-11-19; migrate to `Gemini 3.8 Flash` using the Legacy, deprecated, and retired models guide.

===== 2026-11-15 · Community stories =====

### Generative AI uses more energy on non-English text
kind: story · source: Hacker News · published: 2026-11-10 · link: https://news.umich.edu/generative-ai-uses-more-energy-on-non-english-text/ · discussion: https://news.ycombinator.com/item?id=50441444
(the source gave no text)

### What a task costs on Opus 5.5
kind: story · source: Hacker News · published: 2026-11-15 · link: https://claude.dev/blog/what-a-task-costs-on-opus-5-5/ · discussion: https://news.ycombinator.com/item?id=50503241
The same token price can cost very different amounts per task. Learn what Claude Code tasks cost on Opus 5.5 and which settings change the bill.

### Show HN: Agweb – a browser for agents that stays out of your way
kind: story · source: Hacker News · published: 2026-11-14 · link: https://github.com/paul-nameless/agweb · discussion: https://news.ycombinator.com/item?id=50497147
A browser built for agents - no focus stealing, a tiny footprint, all tabs in one view.

### Agile Manifesto for Agents
kind: story · source: Hacker News · published: 2026-11-14 · link: https://debarshibasak.github.io/readables/blogs/agent-first-development · discussion: https://news.ycombinator.com/item?id=50496562
Twelve commandments for vibe coding and agents in a team: understand the scope before implementation, coordinate bounded work, and deliver software the enterprise can operate.

### End‑to‑End 4‑Bit Training
kind: story · source: Hacker News · published: 2026-11-13 · link: https://thinkingmachines.ai/blog/end-to-end-4-bit-training/ · discussion: https://news.ycombinator.com/item?id=50490618
Training large language models involves calculating and storing a lot of numbers. Using fewer bits for each value reduces memory usage and allows GPUs to perform calculations faster. However, there is a tradeoff: fewer bits also mean fewer representable numbers, leading to more aggressive rounding.

### Show HN: Shotoku – Local-first action governance and budget caps for AI agents
kind: story · source: Hacker News · published: 2026-11-14 · link: https://www.shotoku.dev/ · discussion: https://news.ycombinator.com/item?id=50496705
Give your AI agents a budget. Spending limits, human approvals, and a tamper-evident audit trail — enforced locally before the payment happens. No cloud. No custody.

### Show HN: Cyberviber – a $15 touch screen to show which Claude session needs you
kind: story · source: Hacker News · published: 2026-11-14 · link: https://cyberviber.de/ · discussion: https://news.ycombinator.com/item?id=50496642
A 2.4″ ESP32 touch display that lists running Claude Code sessions with their state and focuses a session's terminal when you tap it.

### Show HN: Open-Source Version of Cyclon: Phone where AI is the interface?
kind: story · source: Hacker News · published: 2026-11-14 · link: https://opencyclone.vercel.app/ · discussion: https://news.ycombinator.com/item?id=50493213
Do not buy an AI phone. Just use the one you have. Free and open source.

### Ex-OpenAI researcher finds Blackwell signatures in open-weight models
kind: story · source: Hacker News · published: 2026-11-14 · link: https://twitter.com/willdepue/status/2120992457630326841 · discussion: https://news.ycombinator.com/item?id=50494668
I have a major result to share. I’ve found conclusive forensic evidence that the top 4 Chinese AI labs—DeepSeek, Moonshot, MiniMax and Ant Group—have built their newest models on NVIDIA’s most advanced Blackwell chips, which are barred from export to China. This sounds insane, but I discovered th

### DeepSeek V4 Pro 0813
kind: story · source: Hacker News · published: 2026-11-14 · link: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813 · discussion: https://news.ycombinator.com/item?id=50492302
Text Generation model with 1.7T parameters. Download, explore files and run it on Hugging Face.

### Claude asked to renumber pages deletes professor's syllabus, year of notes
kind: story · source: Hacker News · published: 2026-11-14 · link: https://www.tomshardware.com/tech-industry/artificial-intelligence/rogue-claude-ai-tasked-with-renumbering-pages-accidentally-deletes-law-professors-entire-syllabus-one-year-of-lecture-notes-youre-right-to-be-angry-i-deleted-your-files-through-my-own-carelessness-humbled-agent-admits · discussion: https://news.ycombinator.com/item?id=50499114
A University of Chicago lecturer has revealed a rogue Claude AI agent deleted his entire syllabus and year's worth of lecture notes by mistake.

### You could have invented transformers from memory
kind: story · source: Lobste.rs · published: 2026-11-13 · link: https://alexwang.ai/posts/associative-memory/ · discussion: https://lobste.rs/s/u2h9as/you_could_have_invented_transformers
Every layer is a memory store

### Gemini Decision 1 is Free on Google AI Studio
kind: story · source: Hacker News · published: 2026-11-12 · link: https://aistudio.google.com/docs/decisions-api · discussion: https://news.ycombinator.com/item?id=50457853
The fastest path from prompt to production with Gemini

### Anthropic says a key AI safety alarm has been triggered, days before its IPO
kind: story · source: Hacker News · published: 2026-11-12 · link: https://finance.yahoo.com/markets/article/anthropic-says-a-key-ai-safety-alarm-has-been-triggered-days-before-its-ipo-171519615.html · discussion: https://news.ycombinator.com/item?id=50456668
(the source gave no text)

### Your Agent Needs a Schema, Not a Better Prompt
kind: story · source: Dev.to · published: 2026-11-13 · link: https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm · discussion: https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm
The failure nobody demos The agent demo always works. The customer asks for a refund, the

### Composio vs Nango vs Scalekit: What Changes When Your Agent Goes to Production
kind: story · source: Dev.to · published: 2026-11-14 · link: https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2 · discussion: https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2
The demo passed. The security review didn't. Here's a story you've probably lived, or will

===== 2026-11-16 · AI Agents =====

### Oh My Pi v18.20.3
kind: release · source: can1357/oh-my-pi · published: 2026-11-16 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.3
## @oh-my-pi/pi-ai ### Breaking Changes - Removed the public `isXdDevicePath` export from `providers/cursor-pi-args`. Ranged reads of `xd://` documents now use the standard line-selector behavior. ### Fixed - Fixed rate-limit handling for Mistral and other OpenAI-compatible providers so requests with no available allowance fail immediately with an actionable error suggesting a model or plan change. - Fixed Anthropic OAuth requests for pooled Claude accounts to report accurate device and account information, including after credentials are rotated during a request. ## @oh-my-pi/pi-catalog ### Added - Added publicly available image-sizing helpers for determining model-delivered image dimensions and fitting images to a specified long edge before coordinate mapping. ### Fixed - Fixed image inputs being dropped for DeepSeek V4 Flash, restoring consistent multimodal image support. - Restricted reasoning-effort options for Mistral GLM 5.3, GLM 5.3 Flash, and Mistral Large 4 to the levels supported by those models. ## @oh-my-pi/pi-coding-agent ### Breaking Changes - Renamed the browser `tab.clickAt()` option from `clickCount` to `count`, matching `tab.click()`. - Browser viewport screenshot coordinates now use the displayed image coordinates when the screenshot is scaled for the model; pass `css: true` (or `{ x, y, css: true }` for drag points) to provide viewport CSS pixels explicitly. - Added opt-in `mnemopi.recallRelevance` (`off`, `auto`, or `on`; default `off`) to filter automat

### anthropics/skills
kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/anthropics/skills
Public repository for Agent Skills

### backnotprop/plannotator
kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/backnotprop/plannotator
The workspace to stay in the loop and on top of agents - shape, decide, plan, annotate, review code, share with team, and send all feedback to agents with one click.

### vercel-labs/agent-browser
kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/vercel-labs/agent-browser
Browser automation CLI for AI agents

### ZhuLinsen/daily_stock_analysis
kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/ZhuLinsen/daily_stock_analysis
LLM 驱动的多市场股票智能分析系统：多源行情、实时新闻、决策看板与自动推送，支持零成本定时运行。 LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs.

### milind-soni/OpenMausBot
kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/milind-soni/OpenMausBot
Open-source Grok Bot alternative with a virtual machine that bots can use

### google/elephant-goldfish-model
kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/google/elephant-goldfish-model
Open-source plugin for designing and reviewing software with agents

### addyosmani/agent-skills
kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/addyosmani/agent-skills
Production-grade engineering skills for AI coding agents.

===== 2026-11-16 · AI Models & Labs =====

### Lvmh Media Division Partnership
kind: lab-post · source: openai · published: 2026-11-16 · link: https://openai.com/index/lvmh-media-division-partnership/
(the source gave no text)

### Qwen: Qwen4 Max
kind: model · source: OpenRouter · published: 2026-11-16 · link: https://openrouter.ai/qwen/qwen4-max
Qwen4 Max is the flagship model in Alibaba's Qwen4 series. It accepts text, image, and video input and returns text, with a 1M-token context window and reasoning enabled by default....

===== 2026-11-16 · AI Policy =====

### Commission invites views on draft revised election guidelines under Digital Services Act
kind: policy-item · source: European Commission · published: 2026-11-10 · link: https://digital-strategy.ec.europa.eu/en/news/commission-invites-views-draft-revised-election-guidelines-under-digital-services-act
The European Commission launched a consultation to update its election guidelines under the Digital Services Act (DSA), addressing the rapid evolution of technologies, particularly generative Artificial Intelligence (AI), and the growing sophistication of manipulation risks.

===== 2026-11-16 · Data Engineering =====

### Terraform provider for Databricks v1.143.0
kind: release · source: databricks/terraform-provider-databricks · published: 2026-11-16 · link: https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0
### Important Changes * `databricks_app` now updates apps through the asynchronous Apps update API ([#6151](https://github.com/databricks/terraform-provider-databricks/pull/6151)). The synchronous update API ignored `compute_size`, `compute_min_instances`, and `compute_max_instances`, so changes to them never took effect; they are now applied. As before, an update replaces the app's updatable fields with the configuration, so fields omitted from it are cleared. That now also covers the fields the synchronous API skipped: an omitted `compute_size` resets to `MEDIUM`, omitted `compute_min_instances` and `compute_max_instances` disable horizontal scaling, and an omitted `git_source` clears the app's default git source. Updates now wait for the app update to reach `SUCCEEDED`. ### New Features and Improvements * Add resource and data sources for `databricks_assume_group_restricted_sharing_group`. * Add `personal_access_token_wo` and `personal_access_token_wo_version` write-only attributes to `databricks_git_credential` resource ([#6088](https://github.com/databricks/terraform-provider-databricks/pull/6088)). * Add `options_wo` and `options_wo_version` write-only attributes to `databricks_connection` resource ([#6088](https://github.com/databricks/terraform-provider-databricks/pull/6088)). ### Bug Fixes * Keep the configured values of the `pem_key_passphrase`, `ssl_keystore_key`, `ssl_key_password` and `schema_registry_api_secret` options of `databricks_connection`, which the API

### Use Genie One as your Chrome new tab page (Beta)
kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#use-genie-one-as-your-chrome-new-tab-page-beta
The Genie One Chrome extension replaces the Chrome new tab page with Genie One from your Azure Databricks workspace. While the extension is turned on, new tabs open the Genie One home page, so you can ask a question, search across your connected tools, or open a dashboard without first going to your workspace. The extension uses your existing Azure Databricks sign-in and permissions, and it works with the one workspace you choose. This feature is in Beta. See Use Genie One as your Chrome new tab page.

===== 2026-11-16 · Community stories =====

### Qwen4-Max
kind: story · source: Hacker News · published: 2026-11-16 · link: https://qwen.ai/blog?id=qwen4-max · discussion: https://news.ycombinator.com/item?id=50513215
Qwen offers comprehensive functionality spanning chatbot, image and video understanding, image generation, document processing, web search integration, tool utilization, and artifacts.

### What thousands of conversations look like inside a language model
kind: story · source: Hacker News · published: 2026-11-13 · link: https://operator0x.com/field-notes/qwen-conversation-state-space/ · discussion: https://news.ycombinator.com/item?id=50481321
I mapped thousands of conversations inside Qwen to see how language takes shape.

### Understanding Positional Embeddings in Modern LLMs
kind: story · source: Hacker News · published: 2026-11-15 · link: https://magazine.sebastianraschka.com/p/understanding-positional-embeddings · discussion: https://news.ycombinator.com/item?id=50506376
The Methods Behind How LLMs Represent Token Positions

### The efficient frontier of LLM inference
kind: story · source: Hacker News · published: 2026-11-15 · link: https://www.baseten.co/blog/the-efficient-frontier-of-llm-inference/#quantization · discussion: https://news.ycombinator.com/item?id=50512233
In inference engineering, some techniques move a deployment along the latency–throughput frontier, while others push the entire frontier out. This article maps batch sizing, parallelism, quantization, kernels, speculative decoding, and disaggregation.

### Show HN: db-branch – database branches in seconds for AI agents and CI, via ZFS
kind: story · source: Hacker News · published: 2026-11-15 · link: https://github.com/db-branch/db-branch · discussion: https://news.ycombinator.com/item?id=50506940
Instant MySQL database branches on ZFS clones, clustered across VMs with ProxySQL routing

### Agentic AI Designs an Analog Synthesizer
kind: story · source: Hacker News · published: 2026-11-16 · link: https://cpldcpu.github.io/2026/11/14/touchsynth/ · discussion: https://news.ycombinator.com/item?id=50512933
An analog monophonic synthesizer built from ~200 components, with a transistor ladder filter and touch keys. Circuit, simulation, PCB, firmware and most of the bring-up were done by Claude Opus 5.5.

### Google AI Ultra Subscription Not Worth It
kind: story · source: Hacker News · published: 2026-11-16 · link: https://www.reddit.com/r/google_antigravity/comments/1xx9nl3/google_ai_ultra_subscription_not_worth_it/ · discussion: https://news.ycombinator.com/item?id=50514224
(the source gave no text)

### Show HN: Skillset: Easily curate and install agent skills collection
kind: story · source: Hacker News · published: 2026-11-15 · link: https://github.com/itsmeyaw/skillset · discussion: https://news.ycombinator.com/item?id=50511761
CLI to easily manage your skills. Start saving token by installing only necessary skills!

### Show HN: Canban – Kanban and Workflow and Herdr Workbench for CLI Agents
kind: story · source: Hacker News · published: 2026-11-15 · link: https://github.com/jjyr/canban · discussion: https://news.ycombinator.com/item?id=50508535
Canban = Kanban + herdr workbench.

### Show HN: Attest – Test what AI agents do, not just what they say
kind: story · source: Hacker News · published: 2026-11-15 · link: https://attest-framework.github.io/ · discussion: https://news.ycombinator.com/item?id=50509107
Test what your AI agent says, which tools it calls and what it changes. Replay recorded model responses and enforce checks in CI.

### Parents pay $75k for Alpha's AI school. Half of its students missed math target
kind: story · source: Hacker News · published: 2026-11-15 · link: https://fortune.com/2026/11/14/alpha-school-ai-students-tuition-learning-goals/ · discussion: https://news.ycombinator.com/item?id=50509953
Only 42% of Alpha students hit its 2x learning goal in math and reading, internal data show, as 2,600 public school students now use its software.

### A 27-byte telemetry response nobody reads freezes Claude Desktop every two days
kind: story · source: Hacker News · published: 2026-11-14 · link: https://blog.dfb.sh/blog/claude-desktop-freeze/ · discussion: https://news.ycombinator.com/item?id=50499446
Claude Desktop on Linux froze dead every couple of days, with empty logs. It took two months and a 1.5 TiB core dump to find out why. The app never reads a 27-byte telemetry reply, and Chromium keeps a file descriptor open for each one until the renderer runs out of them. Chromium says it works as i

### I run multiple Claude Code accounts on one Mac
kind: story · source: Hacker News · published: 2026-11-15 · link: https://twitter.com/viborc/status/2121941174374039788 · discussion: https://news.ycombinator.com/item?id=50506993
How I run multiple Claude Code accounts on one Mac

### Please Implement A Quorum Database
kind: story · source: Lobste.rs · published: 2026-11-15 · link: https://transactional.blog/talk/please-implement-a-quorum-database · discussion: https://lobste.rs/s/hgicaq/please_implement_quorum_database
Leaderless replication is fun and practical.

### Designing nextest's install scripts
kind: story · source: Lobste.rs · published: 2026-11-15 · link: https://sunshowers.io/posts/nextest-install-scripts/ · discussion: https://lobste.rs/s/tbpfcn/designing_nextest_s_install_scripts
How I built the scripts carefully using coding agents.

### Give Your Voice Agent Hands: Let It Act Across Sales and Marketing
kind: story · source: Dev.to · published: 2026-11-15 · link: https://dev.to/therealmrmumba/give-your-voice-agent-hands-let-it-act-across-sales-and-marketing-fn2 · discussion: https://dev.to/therealmrmumba/give-your-voice-agent-hands-let-it-act-across-sales-and-marketing-fn2
The call ends. The admin starts. Maya is an account executive. She just finished a good

### I Told My Agent Who Sent the Message. It Mostly Stopped Saying We Were Talking.
kind: story · source: Dev.to · published: 2026-11-15 · link: https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8 · discussion: https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8
This is the line: AUTOMATED SCHEDULER CHECK: sender=scheduler, not Keniel; Keniel is not

===== 2026-11-16 · Trends (weekly tables) =====

## Agents & coding tools

### 🚀 Agent & Coding Tool Radar

*New tools (🆕: created or listed in the last 14 days) first, then each source's top movers; 🔥 also on last week's Trends page. OpenRouter: the app's rank this week / this month among OpenRouter apps, its tokens in the last 7 days. npm: downloads in the last 7 days. OpenRouter and npm "vs previous week": against the row's figure on last week's page, none when it was not there. GitHub: total stars (stars gained in the last 7 days, % on a week ago).*

| Tool | Source | Signal | Summary |
| :--- | :--- | :--- | :--- |
| [Bitbison triage](https://bitbison.io/) | OpenRouter | 🆕 week #100 / month —, 44.7B tokens/week | Bitbison triage analyzes build activity to catch supply chain attacks before release and lets you block releases that fail your security checks. |
| 🔥 [Kilo Code](https://kilocode.ai/) | OpenRouter | week #5 / month #5, 7.03T tokens/week (+46% vs previous week) | Kilo Code is an open-source AI coding agent that works across VS Code, JetBrains, and CLI to help developers ship code faster with agentic workflows. |
| [@sma1lboy/rove](https://www.npmjs.com/package/@sma1lboy/rove) | npm | 28,686 downloads/week | @sma1lboy/rove is an agentic development environment (ADE) for your terminal that runs Claude Code, Codex, Copilot and more side by side in isolated worktrees, handing tasks to each other. |
| 🔥 [Strix](https://strix.ai/) | OpenRouter | week #9 / month #12, 2.56T tokens/week (+45% vs previous week) | Strix are open-source AI hackers that find and validate vulnerabilities in your code, APIs, and infrastructure and open fix PRs. |
| [OpenHands](https://docs.all-hands.dev/) | OpenRouter | week #14 / month #18, 1.00T tokens/week | OpenHands is an AI coding agent that can run commands, browse the web, and call APIs. |
| 🔥 [Hermes Agent](https://hermes-agent.nousresearch.com/) | OpenRouter | week #3 / month #4, 13.02T tokens/week (+5.1% vs previous week) | Hermes Agent is an open-source, self-improving AI agent by Nous Research that runs persistently with memory across sessions, builds reusable skills from experience, and comes with 40+ built-in tools including web search, browser automation, and vision plus scheduled automations and subagents. |
| [@earendil-works/pi-coding-agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) | npm | 6,307,903 downloads/week | @earendil-works/pi-coding-agent is a coding agent CLI with read, bash, edit, write tools and session management. |
| 🔥 [Claude Code](https://claude.ai/code) | OpenRouter | week #4 / month #3, 10.80T tokens/week (+7.5% vs previous week) | Claude Code is Anthropic's agentic coding tool that reads your entire codebase, plans and executes changes across files, runs tests, and iterates on failures from natural language prompts. |
| 🔥 [pi](https://pi.dev/) | OpenRouter | week #6 / month #6, 4.00T tokens/week (-4.8% vs previous week) | pi is a coding agent described as "yours" among many coding agents. |
| [Codex](https://openai.com/codex/) | OpenRouter | week #7 / month #7, 3.42T tokens/week | Codex is a coding agent that helps you build and ship with AI. |
| 🔥 [OpenClaw](https://openclaw.ai/) | OpenRouter | week #8 / month #8, 2.69T tokens/week (-46% vs previous week) | OpenClaw is an open-source AI agent that connects to your messaging apps and takes real actions on your behalf, from running commands and browsing the web to managing files and sending emails. |
| 🔥 [omp](https://omp.sh/) | OpenRouter; npm | week #11 / month #10, 2.13T tokens/week (-36% vs previous week); 295,519 downloads/week (+34% vs previous week) | omp is a coding agent CLI with read, bash, edit, write tools and session management. |

### 🧑‍💻 Coding Agents

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [google/elephant-goldfish-model](https://github.com/google/elephant-goldfish-model) | Python | 20,026 (+5,060, +34%) | google/elephant-goldfish-model is an open-source plugin for designing and reviewing software with agents. |
| 🔥 [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code) | TypeScript | 30,576 (+1,462, +5%) | QwenLM/qwen-code is an open-source AI coding agent that lives in your terminal. |
| 🔥 [superplanehq/superplane](https://github.com/superplanehq/superplane) | Go | 10,060 (+828, +9%) | superplanehq/superplane is an open source factory for one-shot engineering. |
| 🔥 [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | TypeScript | 4,293 (+681, +19%) | PurpleDoubleD/locally-uncensored is an all-in-one local AI studio for desktop with chat, image and video generation, and a coding agent in one free, open source app that runs on Windows and Linux with no Docker, no terminal, no cloud required. |
| 🔥 [Gentleman-Programming/gentle-shell](https://github.com/Gentleman-Programming/gentle-shell) | TypeScript | 2,681 (+598, +29%) | Gentleman-Programming/gentle-shell is a Pi-native workspace for AI-assisted development bringing parallel coding agents, live tasks, Git diffs, persistent memory, and permission controls into one terminal interface powered by Gentle AI and Organic Driven Development (ODD). |
| 🔥 [WhiteTowerAI/ohmygame](https://github.com/WhiteTowerAI/ohmygame) | TypeScript | 2,263 (+494, +28%) | WhiteTowerAI/ohmygame is an open-source studio for making games with AI, your own one-person game studio with game canvas and bring your own key. |
| 🔥 [JetBrains/thinkrail](https://github.com/JetBrains/thinkrail) | TypeScript | 8,295 (+290, +3.6%) | JetBrains/thinkrail is an agentic IDE that gets better every time you use it. |
| 🔥 [unstablebuild/rune](https://github.com/unstablebuild/rune) | Go | 1,795 (+206, +13%) | unstablebuild/rune is a fast, GPU-accelerated, full-featured IDE and terminal multiplexer suitable for both automatic and manual programming. |

### 🧰 Agent Harnesses & Frameworks

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| 🔥 [ccch1mneyyy/dsh-Go](https://github.com/ccch1mneyyy/dsh-Go) | Dart | 24,256 (+7,687, +46%) | ccch1mneyyy/dsh-Go is dsh-go, a DeepSeek Harness that runs natively on mobile and can remote control your computer. |
| [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | Go | 52,520 (+2,849, +5.7%) | alibaba/open-code-review is a hybrid architecture code review tool with deterministic pipelines + LLM Agent, precise line-level comments, and a built-in multi-language ruleset covering NPE, thread-safety, XSS, and SQL injection, compatible with OpenAI and Anthropic. |
| [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop) | JavaScript | 19,295 (+1,676, +9.5%) | dataelement/dsh-desktop is DSHDesktop, the DeepSeek Harness desktop version. |
| 🔥 [lobehub/lobehub](https://github.com/lobehub/lobehub) | TypeScript | 85,610 (+1,131, +1.3%) | lobehub/lobehub is LobeHub, a platform to add super-agents to your team's existing chats that take on work by themselves and get better every week. |
| [mdiri-ai/SoduWork](https://github.com/mdiri-ai/SoduWork) | JavaScript | 1,014 (+1,001) | mdiri-ai/SoduWork is an AI-native engine for teams and their agents that is multi-harness, multi-agent, and self-hosted. |
| 🔥 [FailproofAI/failproofai](https://github.com/FailproofAI/failproofai) | TypeScript | 9,100 (+856, +10%) | FailproofAI/failproofai provides observability and enforcement for AI agent harnesses, capturing every run and ensuring runtime reliability with policy enforcement. |
| [converge-ai-labs/agent-foundation](https://github.com/converge-ai-labs/agent-foundation) | Python | 1,298 (+386, +42%) | converge-ai-labs/agent-foundation is a13n, a platform to build, run, and manage AI agents at scale on your own infrastructure with a built-in harness, durable execution, multi-provider support, and a management console. |
| 🔥 [heymrun/heym](https://github.com/heymrun/heym) | Python | 1,685 (+150, +9.8%) | heymrun/heym lets you build agentic systems, orchestrate agents, automate business processes, inspect every execution, and keep humans in control, deployable on your own infrastructure. |

### 🕸️ Multi-Agent & Orchestration

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [pingdotgg/t3code](https://github.com/pingdotgg/t3code) | TypeScript | 62,023 (+9,091, +17%) | pingdotgg/t3code is the best way to control Claude Code, Codex and more from any computer or phone. |
| 🔥 [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | TypeScript | 114,220 (+1,822, +1.6%) | paperclipai/paperclip is the open-source app everyone uses to manage agents at work. |
| [Tencent/LoopForge](https://github.com/Tencent/LoopForge) | Go | 2,046 (+1,767, +633%) | Tencent/LoopForge provides self-hosted workflows for coding-agent delivery, orchestrating CodeBuddy, Codex, and Claude Code with scripts and human approval gates, including local workflows for coding assistants. |
| 🔥 [agent-of-empires/agent-of-empires](https://github.com/agent-of-empires/agent-of-empires) | Rust | 4,559 (+668, +17%) | agent-of-empires/agent-of-empires manages multiple Claude Code and OpenCode agents from TUI or Web for mobile access, also supporting Mistral Vibe, Codex CLI, Gemini CLI, Pi.dev, Copilot CLI, and Factory Droid Coding. |
| 🔥 [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator) | TypeScript | 14,784 (+484, +3.4%) | OrchestratorInc/agent-orchestrator plans, runs, and supervises fleets of agents from task to merged PR with desktop (macOS, Windows, Linux) and iPhone & Android apps, supporting Claude Code, Codex, and 35+ coding agents. |
| 🔥 [sandbox-quantum/switch](https://github.com/sandbox-quantum/switch) | Python | 4,538 (+284, +6.7%) | sandbox-quantum/switch provides open-source AI teammates in Slack, Teams, Discord, Telegram, and Mattermost, self-hostable with any agent harness and any model. |
| [zeronsh/zeron](https://github.com/zeronsh/zeron) | Rust | 3,690 (+210, +6%) | zeronsh/zeron is a native control plane for Claude Code, Codex, Cursor, Devin and other coding agents. |
| [open-mercato/cezar](https://github.com/open-mercato/cezar) | TypeScript | 1,065 (+96, +9.9%) | open-mercato/cezar is an open-source orchestrator and ADE for running Claude Code, Codex, OpenCode, Pi and other AI coding agents in parallel locally or 24/7 on your own server. |

### 🔌 Agent Tooling

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [anthropics/skills](https://github.com/anthropics/skills) | Python | 195,587 (+6,077, +3.2%) | anthropics/skills is a public repository for Agent Skills. |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Rust | 51,798 (+4,217, +8.9%) | vercel-labs/agent-browser is a browser automation CLI for AI agents. |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | JavaScript | 118,095 (+3,889, +3.4%) | addyosmani/agent-skills provides production-grade engineering skills for AI coding agents. |
| [backnotprop/plannotator](https://github.com/backnotprop/plannotator) | TypeScript | 12,134 (+1,719, +17%) | backnotprop/plannotator is a workspace to stay in the loop and on top of agents to shape, decide, plan, annotate, review code, share with team, and send all feedback to agents with one click. |
| 🔥 [microsoft/TokenEconomizer](https://github.com/microsoft/TokenEconomizer) | Python | 6,821 (+1,492, +28%) | microsoft/TokenEconomizer provides experience-driven black-box cost control for coding agents. |
| 🔥 [haydenschmitty/floorplan](https://github.com/haydenschmitty/floorplan) | JavaScript | 4,574 (+1,301, +40%) | haydenschmitty/floorplan is an interactive, plain-English map of your codebase drawn by Claude or Codex. |
| 🔥 [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | Python | 6,096 (+1,258, +26%) | kajisho5/ffmpeg-skill is a local video editor for coding agents with 42 FFmpeg tools, a machine-readable contract, and an MCP server for Claude Code, Cursor, and Codex, supporting cut, captions, reframe, loudness, and platform exports with no cloud or API keys. |
| 🔥 [ZiChuanLan/agent-purge](https://github.com/ZiChuanLan/agent-purge) | JavaScript | 1,857 (+370, +25%) | ZiChuanLan/agent-purge lets you replace or inject system prompts across codex, claude, opencode, grok, omp, hermes, pi, zcode with a local web console. |

### 🤖 Other Agents

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot) | TypeScript | 23,796 (+5,463, +30%) | milind-soni/OpenMausBot is an open-source Grok Bot alternative with a virtual machine that bots can use. |
| [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | Python | 72,659 (+4,548, +6.7%) | ZhuLinsen/daily_stock_analysis is an LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs. |

## Skills: PRs and requests this week

### Open PRs worth watching
- **#2211** – mcp-builder: reports incomplete evaluation runs instead of crashing or scoring partial output; handles `max_tokens` and refusal stops correctly. [PR #2211](https://github.com/anthropics/skills/pull/2211)
- **#2219** – skill-creator: adds Origin/Host/Content-Type checks to the eval viewer feedback endpoint, closing a CSRF vector. [PR #2219](https://github.com/anthropics/skills/pull/2219)
- **#2216** – claude-api: adds Agent SDK row to routing table and points to a fetchable local reference, fixing scope/docs mismatch. [PR #2216](https://github.com/anthropics/skills/pull/2216)
- **#1903** – pdf: streams PDF-to-image conversion page-by-page to bound memory on long documents. [PR #1903](https://github.com/anthropics/skills/pull/1903)
- **#2198** – skill-creator: isolates each `run_eval` probe in its own temp project and accepts documented frontmatter keys. [PR #2198](https://github.com/anthropics/skills/pull/2198)

### Merged this week
*None.*

### Requests
- **#2220** – Skill-creator entrypoint (33 KB) exceeds some agent environments’ ~15 KiB budget; asks for a bounded entrypoint. [Issue #2220](https://github.com/anthropics/skills/issues/2220)
- **#2201** – mcp-builder evaluation loop answers only the first `tool_use` block and misclassifies `max_tokens`/refusal stops as final answers. [Issue #2201](https://github.com/anthropics/skills/issues/2201)
- **#2207** – claude-api skill excludes Agent SDK but links to an oversized docs page agents can’t fetch in one read. [Issue #2207](https://github.com/anthropics/skills/issues/2207)

### Takeaway
Open PRs and issues converge on hardening skill-creator tooling, fixing evaluation correctness in mcp-builder, and aligning claude-api docs with current SDK endpoints and agent environment constraints.

## Models

### OpenRouter usage

Top models by tokens (prompt + completion) on OpenRouter on 2026-11-15, one day's snapshot. Last week: the model's rank on last week's page, new when it was not ranked there.

| # | Model | Tokens | Last week |
| ---: | :--- | ---: | :---: |
| 1 | [deepseek/deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) | 59.23T | 1 |
| 2 | [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104) | 18.12T | 4 |
| 3 | [deepseek/deepseek-v4.1-flash-20260910](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20260910) | 15.55T | 2 |
| 4 | [z-ai/glm-5.3-flash-20260826](https://openrouter.ai/z-ai/glm-5.3-flash-20260826) | 11.90T | 3 |
| 5 | [openai/gpt-6-luna-20260922](https://openrouter.ai/openai/gpt-6-luna-20260922) | 7.85T | 5 |
| 6 | [anthropic/claude-opus-5.5-20260921](https://openrouter.ai/anthropic/claude-opus-5.5-20260921) | 6.98T | 7 |
| 7 | [stepfun/step-5-preview-20261008](https://openrouter.ai/stepfun/step-5-preview-20261008) | 6.41T | 6 |
| 8 | [xiaomi/mimo-v2.6-flash-20260921](https://openrouter.ai/xiaomi/mimo-v2.6-flash-20260921) | 4.23T | new |
| 9 | [z-ai/glm-5.3-20260816](https://openrouter.ai/z-ai/glm-5.3-20260816) | 3.76T | 12 |
| 10 | [openai/gpt-6.1-sol-20260929](https://openrouter.ai/openai/gpt-6.1-sol-20260929) | 3.71T | 11 |
| 11 | [moonshotai/kimi-k3.1-pro-20261023](https://openrouter.ai/moonshotai/kimi-k3.1-pro-20261023) | 3.47T | 9 |
| 12 | [minimax/minimax-m3.1-flash-20261019](https://openrouter.ai/minimax/minimax-m3.1-flash-20261019) | 3.38T | 8 |
| 13 | [deepseek/deepseek-v4-flash-20260731](https://openrouter.ai/deepseek/deepseek-v4-flash-20260731) | 3.28T | 14 |
| 14 | [nvidia/nemotron-3-ultra-550b-a55b-20260604](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b-20260604) | 3.19T | 16 |
| 15 | [nvidia/nemotron-3.5-super-vl-20261015](https://openrouter.ai/nvidia/nemotron-3.5-super-vl-20261015) | 3.00T | 17 |
| 16 | [meta/muse-spark-1.3-contributor-20260902](https://openrouter.ai/meta/muse-spark-1.3-contributor-20260902) | 2.99T | 18 |
| 17 | [typesafe/jev-1.13-20260917](https://openrouter.ai/typesafe/jev-1.13-20260917) | 2.81T | 15 |
| 18 | [anthropic/claude-haiku-5.5-20261007](https://openrouter.ai/anthropic/claude-haiku-5.5-20261007) | 2.76T | 20 |
| 19 | [anthropic/claude-sonnet-5.5-20260928](https://openrouter.ai/anthropic/claude-sonnet-5.5-20260928) | 2.55T | new |
| 20 | [deepseek/deepseek-v4-flash-20260423](https://openrouter.ai/deepseek/deepseek-v4-flash-20260423) | 2.17T | new |

### Hugging Face trending

*Ranked by likes gained in the last 7 days; 🔥 also on last week's Trends page; quantised copies of a release share its row.*

| # | Model | Likes (total) | Downloads (30 days) | Summary |
| ---: | :--- | ---: | ---: | :--- |
| 1 | [MiniMaxAI/MiniMax-H3-Image](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image) | 1,228 | 571,067 | text-to-image model, other license. |
| 2 | 🔥 [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (+ [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)) | 20,162 | 6,547,772 | 27B image-text-to-text model, Apache-2.0 license. |
| 3 | 🔥 [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) | 12,120 | 2,754,355 | image-to-video model, other license. |
| 4 | [Comfy-Org/MiniMax-H3-Image](https://huggingface.co/Comfy-Org/MiniMax-H3-Image) | 434 | 1,973,388 | text-to-image model, other license. |
| 5 | [Zyphra/ZONOS3-Mini](https://huggingface.co/Zyphra/ZONOS3-Mini) | 419 | 39,862 | text-to-speech model, Apache-2.0 license. |
| 6 | [thinkingmachines/Inkling-2-Small](https://huggingface.co/thinkingmachines/Inkling-2-Small) | 363 | 7,329 | 594B image-text-to-text model, Apache-2.0 license. |
| 7 | [higurashi-ai/Haru-4B](https://huggingface.co/higurashi-ai/Haru-4B) | 348 | 2,098 | 5.2B audio-to-audio model, Apache-2.0 license. |
| 8 | 🔥 [speridlabs/idol](https://huggingface.co/speridlabs/idol) | 2,380 | 33,423 | image-to-3d model, Apache-2.0 license. |
| 9 | [Edge0/Edge0-145B-NVFP4](https://huggingface.co/Edge0/Edge0-145B-NVFP4) | 328 | 41,606 | 145B text-generation model, other license. |
| 10 | 🔥 [moonshotai/Kimi-K3.1-Pro](https://huggingface.co/moonshotai/Kimi-K3.1-Pro) | 2,118 | 46,766 | 2.7T image-text-to-text model, other license. |
| 11 | 🔥 [NousResearch/Arete-27B](https://huggingface.co/NousResearch/Arete-27B) | 621 | 7,497 | 27B text-generation model, Apache-2.0 license. |
| 12 | 🔥 [black-forest-labs/flux-3-image-klein-comfy](https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy) | 3,268 | 1,182,267 | image-to-image model, other license. |

## Research

| Paper | Summary |
| :--- | :--- |
| [Hibana: Fast Agentic Inference on Unified-Memory Devices](http://arxiv.org/abs/2611.10469v1) | Hibana: Fast Agentic Inference on Unified-Memory Devices — an inference engine for unified-memory devices that co-optimizes model representation, memory management, and decoding strategy. |
| [Code as Explanations: Executable and Verifiable LLM Explanations](http://arxiv.org/abs/2611.14704v1) | Code as Explanations: Executable and Verifiable LLM Explanations — proposes code explanations, programs that explain LLM behavior across a dataset and enable automatic verification by execution. |
| [Don't Just Trust Your Memory: Evidence-Linked Memory Reduces Memory-Induced Degradation in LLM Agents](http://arxiv.org/abs/2611.14320v1) | Don't Just Trust Your Memory: Evidence-Linked Memory Reduces Memory-Induced Degradation in LLM Agents — introduces WikiTrace, evidence-linked memory that reduces memory-induced degradation by providing agents with trajectories to verify lessons. |
| [Mitigating Agentic Deception via Evaluation-Side Partially Observable Games](http://arxiv.org/abs/2611.12835v1) | Mitigating Agentic Deception via Evaluation-Side Partially Observable Games — addresses agentic deception by modeling evaluation as partially observable games to check faithfulness of reasoning and tool use beyond final outcomes. |
| [Actor, Judge, or Teacher? Understanding Decision Models in Long-Horizon Agents](http://arxiv.org/abs/2611.17167v1) | Actor, Judge, or Teacher? Understanding Decision Models in Long-Horizon Agents — compares decision models and LLMs as actors, judges, and teachers on ALFWorld and WebShop, finding all six models are pulled toward similar actor performance. |
| [LiveAsset: Learning Intent Assets from Corrective Interactions for Agent Runtime Control](http://arxiv.org/abs/2611.11560v1) | LiveAsset: Learning Intent Assets from Corrective Interactions for Agent Runtime Control — proposes LiveAsset to learn intent assets from multi-turn corrections by interpreting each correction against preceding and revised outcomes for runtime control. |
| [When Experience Becomes a Backdoor: Poisoning Self-Evolving LLM Agents via Failure-Aware Task Optimization](http://arxiv.org/abs/2611.10542v1) | When Experience Becomes a Backdoor: Poisoning Self-Evolving LLM Agents via Failure-Aware Task Optimization — studies task-level backdoor attacks where poisoned evolution tasks implant malicious rules into skills constructed by a trusted evolver. |
| [OverServe: Resource Amplification Attacks on SaaS Agents via Tool--Prompt Co-Design](http://arxiv.org/abs/2611.14808v1) | OverServe: Resource Amplification Attacks on SaaS Agents via Tool--Prompt Co-Design — presents OverServe, a multi-agent framework that co-designs tool prompts to exploit agent completion decisions and amplify resource consumption in SaaS deployments. |
| [Can LLM Agents Organize Their Own Memory?](http://arxiv.org/abs/2611.11929v1) | Can LLM Agents Organize Their Own Memory? — introduces self-organized memory (SoMem), a framework where agents store memory in linked documents and autonomously decide what to summarize, how to group, and when to revise topics. |
| [PACE: Keeping the Right Tokens in the KV Cache Is Not Enough for Long-Horizon LLM Agents](http://arxiv.org/abs/2611.10240v1) | PACE: Keeping the Right Tokens in the KV Cache Is Not Enough for Long-Horizon LLM Agents — shows that in 100K-token coding sessions on Qwen3-8B with a 2,048-token budget, a planner-guided policy keeping over 99% of needed tokens still sees accuracy fall from 93% to 64% as definition-use gaps grow. |

## Most discussed

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [What unshare -n leaves behind: building a boundary for an AI recon agent](https://dev.to/gnomeman4201/what-unshare-n-leaves-behind-building-a-boundary-for-an-ai-recon-agent-75b) | Dev.to | [15 reactions, 22 comments](https://dev.to/gnomeman4201/what-unshare-n-leaves-behind-building-a-boundary-for-an-ai-recon-agent-75b) | The author examines what Linux's unshare -n leaves exposed while building a network isolation boundary for an AI reconnaissance agent, noting the sandbox passed 13 isolation tests. |
| [Stop Asking LLMs to Do Math: Client-Side Functions in Flutter GenUI with bloc_signals](https://dev.to/gde/stop-asking-llms-to-do-math-client-side-functions-in-flutter-genui-with-blocsignals-23bh) | Dev.to | [16 reactions, 16 comments](https://dev.to/gde/stop-asking-llms-to-do-math-client-side-functions-in-flutter-genui-with-blocsignals-23bh) | The article explains why client-side functions are critical for Generative UI, showing how bloc_signals_genui converts catalog functions into 0ms synchronous reactive signals in Flutter. |
| [Can't Beat Free: Gemma 4 31B on AMD Token Lab, with a Local Chat Page and an ADK Agent](https://dev.to/gde/cant-beat-free-gemma-4-31b-on-amd-token-lab-with-a-local-chat-page-and-an-adk-agent-c5b) | Dev.to | [36 reactions, 13 comments](https://dev.to/gde/cant-beat-free-gemma-4-31b-on-amd-token-lab-with-a-local-chat-page-and-an-adk-agent-c5b) | AMD Token Lab offers a free OpenAI-compatible API on AMD GPUs via the AMD AI Developer Program, enabling a local chat page, terminal client, and ADK agent to run Gemma 4 31B. |

===== 2026-11-16 · AI Policy: dates (code-rendered) =====

## Coming up

Deadlines and dates in the next 30 days.

| Date | Source | Item |
| :--- | :--- | :--- |
| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |