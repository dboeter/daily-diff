<img src="favicon.svg" width="56" height="56" alt="Daily Diff mark: a plus over a minus in a diff gutter">

# Daily Diff

A personal daily digest of AI coding agents, agent tooling, AI policy and the data engineering stack, built by a GitHub Actions workflow that runs every night and lands by about 05:00 Amsterdam time. Read it in the [Web UI](#web-ui), the [RSS feed](#rss-feed) or the [MCP server](#mcp-server). The workflow collects from the [data sources](#data-sources) below, then publishes English digests as GitHub Issues and committed Markdown files: a daily set (AI Agents, AI Models & Labs, AI Policy, Data Engineering) and a weekly Trends page on Mondays.

### Data Sources

| Source                                                            | Type                                                                      | Data                                                                                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [GitHub Repos](https://github.com)                                | API                                                                       | Stable releases and hot issues from the agent, infra and data repos in `config.yml`                                               |
| [Claude Code Skills](https://github.com/anthropics/skills)        | API                                                                       | Trending skills sorted by community engagement — **weekly**                                                                       |
| [GitHub Trending](https://github.com/trending)                    | HTML + API                                                                | Weekly trending repos + AI topic search (7-day window) — **weekly**                                                               |
| [OpenRouter](https://openrouter.ai/apps)                          | HTML (RSC payload) + Models API                                           | Agent app usage, top models by tokens — **weekly**; newly listed and stealth models daily                                         |
| [npm](https://www.npmjs.com)                                      | Registry search API                                                       | Coding-agent packages by downloads and momentum — **weekly**                                                                      |
| [Hacker News](https://news.ycombinator.com)                       | [Firebase API](https://github.com/HackerNews/API)                         | Top AI and data stories via topstories scanning, each shown once                                                                  |
| [ArXiv](https://arxiv.org)                                        | [ArXiv API](https://export.arxiv.org/api/query)                           | Papers from cs.AI, cs.CL, cs.LG (new since the last run), ranked by Jev relevance daily; the week's top 10 in Trends — **weekly** |
| [Hugging Face](https://huggingface.co)                            | [Hub API](https://huggingface.co/api/models)                              | 15 trending models sorted by weekly likes — **weekly**, Mondays only                                                              |
| [Dev.to](https://dev.to)                                          | [Forem API](https://dev.to/api)                                           | Top AI/LLM articles of the last 2 days from 5 tags, 15+ reactions                                                                 |
| [Lobste.rs](https://lobste.rs)                                    | JSON API                                                                  | `ai`, `vibecoding` and `databases` stories of the last 2 days                                                                     |
| [Anthropic](https://anthropic.com) + [OpenAI](https://openai.com) | Sitemap                                                                   | New posts: URLs not seen before                                                                                                   |
| [European Commission](https://digital-strategy.ec.europa.eu)      | [RSS](https://digital-strategy.ec.europa.eu/en/rss.xml)                   | AI Office and digital-policy news, new since the last run, at most 7 days old                                                     |
| [EDPB](https://www.edpb.europa.eu)                                | [RSS](https://www.edpb.europa.eu/feed/news_en)                            | EU data protection news, every item judged by Jev, at most 7 days old                                                             |
| [EUR-Lex](https://eur-lex.europa.eu)                              | [Cellar SPARQL](https://publications.europa.eu/webapi/rdf/sparql)         | EU acts and proposals on AI or a watchlisted act, with their stage                                                                |
| [European Parliament](https://oeil.secure.europarl.europa.eu)     | [Open Data API](https://data.europarl.europa.eu)                          | Watchlisted EU procedures, reported when their stage moves                                                                        |
| [Tweede Kamer](https://www.tweedekamer.nl)                        | [OData API](https://opendata.tweedekamer.nl), KOOP SRU                    | AI motions, letters, questions; watchlisted bills to the Staatsblad                                                               |
| [Have your say](https://ec.europa.eu/info/law/better-regulation)  | Portal search API (undocumented)                                          | AI Commission initiatives: new stage or feedback period, closing date                                                             |
| [Dutch government](https://www.rijksoverheid.nl)                  | RSS                                                                       | AP, Rijksoverheid, RDI, Digitale Overheid news, every item judged by Jev                                                          |
| [Internetconsultatie](https://www.internetconsultatie.nl)         | Homepage list                                                             | Open Dutch consultations on AI, closing date                                                                                      |
| [Federal Register](https://www.federalregister.gov)               | [API v1](https://www.federalregister.gov/developers/documentation/api/v1) | US rules and notices naming AI, presidential documents, watchlisted dockets/RINs                                                  |
| [Regulations.gov](https://www.regulations.gov)                    | [API v4](https://open.gsa.gov/api/regulationsgov/)                        | US AI dockets the Federal Register missed, comment deadlines; needs `USA_GOV_API_KEY`                                             |
| [Congress.gov](https://www.congress.gov)                          | [API v3](https://api.congress.gov)                                        | US federal AI bills from passing a chamber onward; needs `USA_GOV_API_KEY`                                                        |
| [Open States](https://openstates.org)                             | [API v3](https://v3.openstates.org/docs)                                  | US state AI bills from passing a chamber onward; needs `PLURAL_API_KEY`                                                           |
| Data vendor release notes (`data.feeds` in `config.yml`)          | RSS, Atom, HTML                                                           | New Databricks, Fabric, Azure, Snowflake, BigQuery notes; Jev-judged                                                              |
| Policy news (6 outlets, `kind: news` in `config.yml`)             | RSS                                                                       | Politico, Transformer, CSET, Covington, Binnenlands Bestuur                                                                       |

## Web UI

**[https://dboeter.github.io/daily-diff](https://dboeter.github.io/daily-diff)**

Browse all historical digests in dark or light theme, no login required. Reports are rendered from the Markdown files in this repo via GitHub Pages. Each day opens on an overview of every report's highlights, then **Coming up**: the dated items of the next 30 days from every page (policy deadlines, Action required dates in Data Engineering, stealth model expiries); each report links to the day's other reports, the previous and next day, and its own previous report (weekly reports skip days), and long reports get a table of contents. The latest weekly reports stay pinned under **This week** in the sidebar.

## Telegram Notifications

When `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set, a message is pushed after each run. It links to all reports for that day, with their highlights, then up to 5 Coming up items, plus the Web UI and RSS feed.

## RSS Feed

**[https://dboeter.github.io/daily-diff/feed.xml](https://dboeter.github.io/daily-diff/feed.xml)**

Subscribe in any RSS reader (Feedly, Reeder, NewsBlur, etc.) to receive new digests automatically. The feed includes the latest 30 reports across all report types, updated daily alongside `manifest.json`. Each page also has its own feed of its latest 30 issues, `feeds/<id>.xml` (for example [`feeds/ai-data.xml`](https://dboeter.github.io/daily-diff/feeds/ai-data.xml) for Data Engineering alone), linked from the page in the Web UI.

## MCP Server

**`https://daily-diff-mcp.dboeter.workers.dev`** (a Cloudflare Worker deployed from `mcp/`, see **Deploying** below)

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes Daily Diff data as tools. Any MCP-compatible client (Claude Desktop, OpenClaw, etc.) can query the latest AI ecosystem reports directly.

**Available tools:**

| Tool           | Description                                         |
| -------------- | --------------------------------------------------- |
| `list_reports` | List available dates and report types (last N days) |
| `get_latest`   | Fetch the most recent report of a given type        |
| `get_report`   | Fetch a specific report by date and type            |
| `search`       | Keyword search across recent reports                |

**Claude Desktop setup** — add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "daily-diff": {
      "url": "https://daily-diff-mcp.dboeter.workers.dev"
    }
  }
}
```

Restart Claude Desktop after saving. You can then ask Claude things like:

- _"What's the latest in AI coding agents?"_ → calls `get_latest`
- _"Search for Claude Code mentions this week"_ → calls `search`
- _"Show me the Trends page for 2026-03-02"_ → calls `get_report`

**OpenClaw setup** — run the following command:

```bash
openclaw mcp add --transport http daily-diff https://daily-diff-mcp.dboeter.workers.dev
```

Or add it manually to `~/.openclaw/openclaw.json`:

```json
{
  "mcpServers": {
    "daily-diff": {
      "type": "http",
      "url": "https://daily-diff-mcp.dboeter.workers.dev"
    }
  }
}
```

You can then ask OpenClaw things like:

- _"What's the latest in AI coding agents?"_ → calls `get_latest`
- _"Search for Claude Code mentions this week"_ → calls `search`
- _"Show me the Trends page for 2026-03-02"_ → calls `get_report`

**Deploying** — the `Deploy MCP` workflow (`.github/workflows/deploy-mcp.yml`) deploys the worker on every push to `main` that touches `mcp/`, using the `CLOUDFLARE_API_TOKEN` secret (a Cloudflare token with the "Edit Cloudflare Workers" template). New digests need no deploy: the worker reads them from GitHub Pages. To deploy by hand:

```bash
cd mcp
pnpm install
pnpm run deploy   # not `pnpm deploy`: that is pnpm's own workspace command
```

## Tracked sources

### Agents (GitHub) — daily

The `agents` section of `config.yml`, in one daily report. Issue and PR churn is not reported; each agent is covered by:

- **Stable releases** from the last 24h. Nightlies, alphas and release candidates are detected (API flag or tag pattern) and only counted — except for an agent that has never shipped a stable release: its prereleases are covered when they add notable features.
- **Hot issues**: opened in the last 48h with 10+ comments and 👍 combined (3+ when labelled regression or security), at most 2 per agent.
- **News**: Hacker News, Lobste.rs and Dev.to stories no page has shown before and GitHub Trending repos that name the agent. An item naming three or more tracked projects is treated as a compatibility list and skipped.

Agents with none of these are listed in one "Quiet today" line; an agent whose releases could not be fetched goes in an "Unavailable today" line instead.

**Spotted**: the community stories that named no tracked project get a topic from [Jev](https://typesafe.ai) (agents, models, research, data, policy, other). The agents stories end the agents report in a table, the models stories AI Models & Labs, the data stories the data report, at most 6 from Hacker News and 2 each from Lobste.rs and Dev.to per page. A story is shown once, also when another source links the same article: `digests/spotted-log.json` records what a page showed.

The report tracks the repos below and no others: trending repos are not added automatically.

<!-- tracked:agents -->
<!-- generated from config.yml: edit config.yml, then run pnpm readme -->

**Coding Agents & Assistants**: AI coding agents and personal AI assistants.

| Project          | Repository                                                                      |
| ---------------- | ------------------------------------------------------------------------------- |
| Claude Code      | [anthropics/claude-code](https://github.com/anthropics/claude-code)             |
| OpenAI Codex     | [openai/codex](https://github.com/openai/codex)                                 |
| Gemini CLI       | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)         |
| Kilo Code        | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode)                       |
| OpenCode         | [anomalyco/opencode](https://github.com/anomalyco/opencode)                     |
| Pi               | [earendil-works/pi](https://github.com/earendil-works/pi)                       |
| Oh My Pi         | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi)                         |
| jcode            | [1jehuang/jcode](https://github.com/1jehuang/jcode)                             |
| Cline            | [cline/cline](https://github.com/cline/cline)                                   |
| Command Code     | [CommandCodeAI/command-code](https://github.com/CommandCodeAI/command-code)     |
| DeepSeek Harness | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) |
| Hermes Agent     | [nousresearch/hermes-agent](https://github.com/nousresearch/hermes-agent)       |

<!-- /tracked:agents -->

### Agent tooling (GitHub) — daily

The `infra` section of `config.yml`: the second section of the daily agents report, covered the same way as the agents. It was a weekly report of its own (`ai-infra`) until October 2026. Until 2026-10-10 it tracked inference engines (vLLM, llama.cpp, Ollama…).

<!-- tracked:infra -->
<!-- generated from config.yml: edit config.yml, then run pnpm readme -->

**Agent Tooling**: AI agent tooling — agent sandboxes, terminal session multiplexers and context-management tools.

| Project      | Repository                                                              |
| ------------ | ----------------------------------------------------------------------- |
| OpenShell    | [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell)                 |
| herdr        | [herdrdev/herdr](https://github.com/herdrdev/herdr)                     |
| context-mode | [mksglu/context-mode](https://github.com/mksglu/context-mode)           |
| Agent Deck   | [asheshgoplani/agent-deck](https://github.com/asheshgoplani/agent-deck) |

<!-- /tracked:infra -->

### Data engineering (GitHub) — daily

The `databricks`, `snowflake` and `data_stack` sections of `config.yml`: the repo sections of the daily data report (`ai-data`), for data engineers working on Databricks, Snowflake and the open-source data stack. Covered like the agents, news included (`keywords` keep ordinary words such as delta, dlt and iceberg from matching). The report also carries the vendors' release notes (`data.feeds`: Azure Databricks, Microsoft Fabric, Azure updates, Snowflake, Snowflake behavior changes, BigQuery), new items only, judged by Jev (keyword rules without `TYPESAFE_API_KEY`), at most 12 a day with deprecations first. A section with nothing new is left out, and the report is skipped when all are.

<!-- tracked:databricks -->
<!-- generated from config.yml: edit config.yml, then run pnpm readme -->

**Databricks**: Databricks and the open-source projects Databricks maintains (Delta Lake, Unity Catalog, MLflow, its CLI and dbt adapter).

| Project        | Repository                                                                |
| -------------- | ------------------------------------------------------------------------- |
| Delta Lake     | [delta-io/delta](https://github.com/delta-io/delta)                       |
| Unity Catalog  | [unitycatalog/unitycatalog](https://github.com/unitycatalog/unitycatalog) |
| MLflow         | [mlflow/mlflow](https://github.com/mlflow/mlflow)                         |
| Databricks CLI | [databricks/cli](https://github.com/databricks/cli)                       |
| dbt-databricks | [databricks/dbt-databricks](https://github.com/databricks/dbt-databricks) |

<!-- /tracked:databricks -->

<!-- tracked:snowflake -->
<!-- generated from config.yml: edit config.yml, then run pnpm readme -->

**Snowflake**: Snowflake's open-source clients and the Apache Polaris catalog Snowflake maintains.

| Project                        | Repository                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| Snowpark Python                | [snowflakedb/snowpark-python](https://github.com/snowflakedb/snowpark-python)                       |
| Snowflake Connector for Python | [snowflakedb/snowflake-connector-python](https://github.com/snowflakedb/snowflake-connector-python) |
| Apache Polaris                 | [apache/polaris](https://github.com/apache/polaris)                                                 |

<!-- /tracked:snowflake -->

<!-- tracked:data_stack -->
<!-- generated from config.yml: edit config.yml, then run pnpm readme -->

**Open-source data stack**: open-source data engineering tools — transformation, orchestration, ingestion, table formats and query engines.

| Project        | Repository                                                  |
| -------------- | ----------------------------------------------------------- |
| dbt Core       | [dbt-labs/dbt](https://github.com/dbt-labs/dbt)             |
| SQLMesh        | [SQLMesh/sqlmesh](https://github.com/SQLMesh/sqlmesh)       |
| Apache Airflow | [apache/airflow](https://github.com/apache/airflow)         |
| Dagster        | [dagster-io/dagster](https://github.com/dagster-io/dagster) |
| dlt            | [dlt-hub/dlt](https://github.com/dlt-hub/dlt)               |
| Apache Iceberg | [apache/iceberg](https://github.com/apache/iceberg)         |
| DuckDB         | [duckdb/duckdb](https://github.com/duckdb/duckdb)           |
| Polars         | [pola-rs/polars](https://github.com/pola-rs/polars)         |
| Trino          | [trinodb/trino](https://github.com/trinodb/trino)           |

<!-- /tracked:data_stack -->

### GitHub AI Trending — weekly, in Trends

| Source                                                          | Details                                                                                                                                                                                                                           |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [github.com/trending](https://github.com/trending?since=weekly) | This week's trending repos — parsed from HTML; includes the stars gained this week                                                                                                                                                |
| GitHub Search API                                               | 6 agent topics (`coding-agent`, `agentic-coding`, `ai-coding`, `agent-harness`, `harness`, `agent-orchestration`): every repo with 1,000+ stars pushed in the last 7 days, plus repos created in the last 14 days with 500+ stars |
| [OpenRouter](https://openrouter.ai/apps)                        | Apps ranked by tokens (top 200 per day/week/month) + OpenRouter's trending list (top models by tokens go to Trends' Models section)                                                                                               |
| [npm](https://www.npmjs.com)                                    | Packages tagged `coding-agent`, `agentic-coding`, `cli-agent`; split into top by weekly downloads and rising (weekly well above monthly rate)                                                                                     |

Code builds the tables, not the LLM. The category tables hold established repos and alternate between the biggest star gains this week and the biggest relative gains (repos that had at least 100 stars a week ago and gained at least 50), so a fast-growing smaller repo shows next to the big movers. The weekly gain is GitHub's own count for repos on the trending page, otherwise the difference from last week's count in `digests/trending-state.json`. Repos missing from last week's count get it from GitHub's [star history API](https://docs.github.com/en/rest/activity/starring#get-repository-star-history), one request each, at most 500 per run. [Jev](https://typesafe.ai) decides whether each item is in scope and which category it lands in (coding agents / harnesses & frameworks / multi-agent & orchestration / agent tooling / other agents), and whether it is an agent itself rather than a plugin or MCP server. Each item is judged once: the verdicts are saved in `digests/trending-classifications.json` and reused every week, unless the item's description changes. Without a `TYPESAFE_API_KEY` the repo's search topic decides instead for items not judged before, and a trending repo that no agent topic search returned is left out. Each category shows at most 8 repos.

OpenRouter, npm and the new-repo search feed an **Agent & Coding Tool Radar** table of standalone agents and coding tools worth watching. New tools come first (🆕: listed on OpenRouter in the last 14 days, or a GitHub repo created in the last 14 days; a jump in usage is not new, so npm packages, whose search results carry no first-publish date, are never 🆕), but they take at most 8 of the 12 rows, so the week's established leaders still show. A GitHub repo needs at least 1,000 stars to appear in the report, a new one 500. Rows that share a GitHub repo or a website become one row, and Jev matches an OpenRouter app to its npm package or GitHub repo. Each match is decided once and saved in `digests/trending-matches.json`, which you can edit by hand.

The LLM writes a two-sentence summary for each row. The tables open the weekly Trends page under Agents & coding tools, followed by a Claude Code Skills section: [anthropics/skills](https://github.com/anthropics/skills) PRs and issues, fetched without a date filter and sorted by popularity.

The GitHub Trending page is still fetched every day: a tracked project's own repo on it counts as that project's news.

### Community stories: Hacker News, Dev.to, Lobste.rs

Top AI and data stories, fetched from the official [Firebase API](https://github.com/HackerNews/API). The top 500 stories are scanned in batches of 50 and filtered for AI and data keywords until 40 stories no page has shown are found. With the top Dev.to articles and Lobste.rs stories of the last 2 days, a story that names a tracked project is that project's news; the others go to a page's Spotted section by topic. The week's most-commented stories that no daily page showed make the Trends page's Most discussed.

### Official web content (sitemap-based)

| Organization | Site                                       | Tracked sections                                                                               |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Anthropic    | [anthropic.com](https://www.anthropic.com) | `/news/`, `/research/`, `/engineering/`, `/learn/`                                             |
| OpenAI       | [openai.com](https://openai.com)           | research, publication, release, company, engineering, milestone, learn-guides, safety, product |

A post is new when its URL is not in the persisted state file (`digests/web-state.json`); a moved `lastmod` (an edit, or a sitemap rebuild) does not count. On the **first run** the Lab announcements section is one line with the number of posts recorded; from the next run on, new posts are listed in AI Models & Labs.

## Features

- **Daily:** one agents report — stable releases, hot issues and news for the `agents` and `infra` repos in `config.yml`, one section and one LLM call each
- **Daily:** one data report — vendor release notes (`data.feeds`, code-rendered tables, deprecations first) plus stable releases, hot issues and news for the `databricks`, `snowflake` and `data_stack` repos in `config.yml`, one LLM call per repo section, one for the vendor row summaries and one for Highlights and Across platforms
- **Daily:** AI Models & Labs — new Anthropic and OpenAI posts (sitemap-based, incremental), models newly listed on OpenRouter and the stealth-model table
- **Daily:** Hacker News, Dev.to and Lobste.rs stories in each page's Spotted section, new ArXiv papers ranked and saved for the weekly Research section, and AI Policy: new AI policy items from official sources (`policy` in `config.yml`)
- **Weekly (Mondays):** Trends — GitHub AI trending, Claude Code Skills, candidates to track, OpenRouter token usage and Hugging Face trending models, the week's top papers and most discussed community stories, and Signals
- Publishes a GitHub Issue per report; commits Markdown files to `digests/YYYY-MM-DD/`
- Runs via GitHub Actions; supports manual triggering, with an option to force the weekly Trends page
- Tracked repositories and policy sources live in `config.yml`, so changing them needs no code change

The weekly split exists because those reports, run daily, mostly repeated themselves: sampled over September 2026, 54% of trending links and 45% of community links were already in the previous day's report. Product Hunt was dropped at the same time — mostly consumer apps, a poor fit for the audience.

## Configuration

### Tracked repositories (`config.yml`)

`config.yml` in the repo root lists the tracked repositories and the AI Policy sources. The file is fully commented. The pipeline reads it on every run and stops with an error if the file or a section is missing. Each repo section (the agents and the data report's) also sets its `title` (its heading in the report) and `subject` (what the projects are, for the LLM prompt). After editing, run `pnpm readme` to refresh the tracked-repo tables above; the pre-commit hook and CI fail while they are stale.

```yaml
agents:
  repos:
    - id: my-agent
      repo: owner/my-agent
      name: My Agent
      keywords: [my agent] # optional: news match terms; defaults to name + repo name
```

### Secrets

The workflow reads these repository secrets (**Settings → Secrets and variables → Actions**):

| Secret                 | Required           | Description                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LLM_PROVIDER`         | optional           | `anthropic` (default), `openai`, `github-copilot`, `openrouter`, `deepseek`, or `qwen`                                                                                                                                                                                                                                                                                |
| `ANTHROPIC_API_KEY`    | if Anthropic       | API key — works with both Anthropic and Kimi Code                                                                                                                                                                                                                                                                                                                     |
| `ANTHROPIC_BASE_URL`   | optional           | API endpoint override. Set to `https://api.kimi.com/coding/` for Kimi Code; leave unset for Anthropic                                                                                                                                                                                                                                                                 |
| `OPENAI_API_KEY`       | if OpenAI          | OpenAI API key                                                                                                                                                                                                                                                                                                                                                        |
| `OPENAI_BASE_URL`      | optional           | OpenAI endpoint override                                                                                                                                                                                                                                                                                                                                              |
| `OPENROUTER_API_KEY`   | if OpenRouter      | OpenRouter API key                                                                                                                                                                                                                                                                                                                                                    |
| `DEEPSEEK_API_KEY`     | if DeepSeek        | DeepSeek API key                                                                                                                                                                                                                                                                                                                                                      |
| `DASHSCOPE_API_KEY`    | if Qwen            | Alibaba Model Studio API key                                                                                                                                                                                                                                                                                                                                          |
| `TYPESAFE_API_KEY`     | optional           | [TypeSafe](https://typesafe.ai) key. If set, Jev ranks the ArXiv papers for the Trends page's Research section (without it the section is left out), decides the Trends tables' scope, categories and cross-source matches instead of the search topics, routes Spotted stories to their page, and picks the AI Policy and vendor-feed items instead of keyword rules |
| `PLURAL_API_KEY`       | optional           | [Open States / Plural](https://open.pluralpolicy.com) key for AI Policy's US state bills; unset skips that source                                                                                                                                                                                                                                                     |
| `USA_GOV_API_KEY`      | optional           | [api.data.gov](https://api.data.gov/signup/) key for AI Policy's Congress.gov bills and Regulations.gov documents; unset skips those two (the Federal Register needs no key)                                                                                                                                                                                          |
| `TELEGRAM_BOT_TOKEN`   | optional           | Telegram bot token from [@BotFather](https://t.me/BotFather). If set, a message is sent after each digest run                                                                                                                                                                                                                                                         |
| `TELEGRAM_CHAT_ID`     | optional           | Telegram chat/channel/group ID to send notifications to                                                                                                                                                                                                                                                                                                               |
| `TEAMS_WEBHOOK_URL`    | optional           | Power Automate Workflows webhook ("When a Teams webhook request is received"). If set, the data report's highlights are posted to that Teams channel as an Adaptive Card                                                                                                                                                                                              |
| `CLOUDFLARE_API_TOKEN` | for the MCP deploy | Cloudflare API token used by the `Deploy MCP` workflow (not by the daily digest)                                                                                                                                                                                                                                                                                      |

> `GITHUB_TOKEN` is provided automatically by GitHub Actions. When using `github-copilot` as the provider, the same `GITHUB_TOKEN` is used for LLM calls.

**Setting up Telegram notifications** (optional):

1. Message [@BotFather](https://t.me/BotFather) on Telegram, create a bot, and copy the token
2. Add the bot to the channel/group, or start a DM with it
3. Get the chat ID via [@userinfobot](https://t.me/userinfobot) or the [getUpdates](https://core.telegram.org/bots/api#getupdates) API
4. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as repository secrets

> If neither secret is set, the notification step is silently skipped.

### Manual runs

**Actions → Daily Diff → Run workflow** starts a run outside the schedule, e.g. to regenerate a day. Tick **force_weekly** to also generate the weekly reports on a non-Monday (e.g. to redo a missed Monday).

## LLM providers

Set `LLM_PROVIDER` to choose which model backend powers the digest generation. Defaults to `anthropic`.

| Provider       | `LLM_PROVIDER`   | Required env vars    | Default model                 |
| -------------- | ---------------- | -------------------- | ----------------------------- |
| Anthropic      | `anthropic`      | `ANTHROPIC_API_KEY`  | `claude-sonnet-5-5`           |
| OpenAI         | `openai`         | `OPENAI_API_KEY`     | `gpt-4o`                      |
| GitHub Copilot | `github-copilot` | `GITHUB_TOKEN`       | `gpt-4o`                      |
| OpenRouter     | `openrouter`     | `OPENROUTER_API_KEY` | `anthropic/claude-sonnet-5.5` |
| DeepSeek       | `deepseek`       | `DEEPSEEK_API_KEY`   | `deepseek-v4-flash`           |
| Qwen           | `qwen`           | `DASHSCOPE_API_KEY`  | `qwen-flash`                  |

Override the model name with `ANTHROPIC_MODEL`, `OPENAI_MODEL`, `GITHUB_COPILOT_MODEL`, `OPENROUTER_MODEL`, `DEEPSEEK_MODEL`, or `QWEN_MODEL` respectively. The Qwen endpoint can be overridden with `DASHSCOPE_BASE_URL`. For reasoning models on OpenRouter, set `OPENROUTER_REASONING_EFFORT` (e.g. `low`) so reasoning does not consume the whole output budget.

The scheduled daily run uses `openrouter` / `nvidia/nemotron-3-super-120b-a12b:free` with `OPENROUTER_REASONING_EFFORT=low`, falling back to `nvidia/nemotron-3-ultra-550b-a55b:free` and `nvidia/nemotron-3.5-super-vl:free` (`OPENROUTER_FALLBACK_MODELS`, comma-separated, tried in order when the primary errors or is down).

The provider abstraction lives in `src/providers/` — each provider is a separate file implementing the `LlmProvider` interface. Adding a new provider only requires creating a new file and registering it in the factory.

## Running locally

```bash
pnpm install

export GITHUB_TOKEN=ghp_xxxxx

# Option A: Anthropic (default)
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# Option B: OpenAI
# export LLM_PROVIDER=openai
# export OPENAI_API_KEY=sk-xxxxxxxx

# Option C: GitHub Copilot (uses GITHUB_TOKEN)
# export LLM_PROVIDER=github-copilot

# Option D: OpenRouter
# export LLM_PROVIDER=openrouter
# export OPENROUTER_API_KEY=sk-or-xxxxxxxx

# Option E: DeepSeek
# export LLM_PROVIDER=deepseek
# export DEEPSEEK_API_KEY=sk-xxxxxxxx

# Qwen (Alibaba Model Studio)
# export LLM_PROVIDER=qwen
# export DASHSCOPE_API_KEY=sk-xxxxxxxx

export DIGEST_REPO=dboeter/daily-diff       # optional; omit to only write files
# export DIGEST_FORCE_WEEKLY=1               # optional; also build the weekly Trends page today
# export TYPESAFE_API_KEY=xxxxx              # optional; Jev for ArXiv ranking, trending scope and AI Policy relevance
# export PLURAL_API_KEY=xxxxx                 # optional; AI Policy's US state bills (Open States)
# export USA_GOV_API_KEY=xxxxx                # optional; AI Policy's Congress.gov and Regulations.gov

pnpm start

pnpm readme   # after editing config.yml: refresh the tracked-repo tables in this README
```

## Output format

Files are written to `digests/YYYY-MM-DD/`:

| File              | Content                                                                                                                                                                                                             | Cadence | GitHub Issue label |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------ |
| `ai-agents.md`    | AI Agents — a section each for the agents and the agent-tooling projects: releases, news and hot issues, then Spotted                                                                                               | daily   | `agents`           |
| `ai-models.md`    | AI Models & Labs — new Anthropic and OpenAI posts, models newly listed on OpenRouter, stealth models, Spotted (only written when something is new)                                                                  | daily   | `models`           |
| `ai-policy.md`    | AI Policy — new AI legislation, regulation and guidance items (only written when a new item passes the relevance check)                                                                                             | daily   | `policy`           |
| `ai-data.md`      | Data Engineering — vendor release notes and repo releases for Databricks, Snowflake, Azure / Fabric & GCP and the open-source data stack (only written when something is new)                                       | daily   | `data`             |
| `ai-trends.md`    | Trends — agents & coding tools (radar + repos by category), Claude Code Skills, candidates to track, models (OpenRouter usage, Hugging Face trending), research papers of the week, most discussed stories, signals | weekly  | `trends`           |
| `highlights.json` | Up to 2 highlights per report, for Telegram and the web UI's day overview                                                                                                                                           | daily   | —                  |
| `coming-up.json`  | The dated items of the next 30 days from every page, nearest first, for Telegram and the web UI's day overview (code, no LLM call)                                                                                  | daily   | —                  |

Archived days also contain `ai-cli.md` (the CLI report, merged into `ai-agents.md` in October 2026), `ai-ph.md` (Product Hunt, dropped in October 2026), `ai-infra.md` (weekly until October 2026, now a section of `ai-agents.md`), `ai-community.md` (weekly until October 2026, then part of `ai-hn.md`), `ai-hn.md` (AI Discussions, daily until October 2026, now each page's Spotted section) `ai-web.md` (Lab Announcements, daily until October 2026, now part of `ai-models.md`), `ai-trending.md` (Agent & AI Coding Trends) and `ai-hf.md` (AI Models), weekly until October 2026, and `ai-arxiv.md` (AI Research, daily until October 2026), all three now part of `ai-trends.md`. Before October 2026, `ai-agents.md` was the OpenClaw ecosystem report.

Shared state files are committed alongside the daily digests: `digests/web-state.json` tracks which web URLs have been seen, `digests/models-state.json` which OpenRouter models a page listed, `digests/policy-state.json` which policy items were reported (and each legislative item's last reported stage, so it reappears when it moves, and the open deadlines of reported items, listed until they pass), `digests/policy-verdicts.json` Jev's answers per policy item, so each is asked once (an item first reported today counts as new again, so a same-day re-run reports the same items), and `digests/research-state.json` each day's top arXiv papers, from which the weekly Trends page takes its papers of the week.

---

Every report opens with its title and a bar of links to the day's overview and other reports. AI Agents, AI Models & Labs, AI Policy and Data Engineering read **Highlights**, their tracked sections, **Spotted**, then **Coming up** (AI Policy). The weekly Trends page opens with **Highlights** and ends with **Signals**, the one place for trend claims.

`ai-agents.md` structure:

```
[⬛ Overview] · **🟪 AI Agents** · [🟦 AI Models & Labs] · …
Generated | Projects: N | Active today: N | Stable releases: N | Prereleases (not covered): N

## Highlights                          — 3-5 bullets over the sections and Spotted (left out when nothing is active or spotted)

## Coding Agents & Assistants          — config.yml agents.title
### <Agent>                            — one per active agent, at most 3 bullets: Release / News / Hot issue
Quiet today: <agents with nothing to report>
Unavailable today: <agents whose release fetch failed, if any>

## Agent Tooling                       — config.yml infra.title, same layout

## Spotted                             — community stories about agents that named no tracked project
```

`ai-data.md` structure:

```
Generated | Projects: N | Active today: N | Stable releases: N | Prereleases (not covered): N

## Highlights                          — 3-5 bullets: who is affected, what to do, by when; deprecations first
## Action required                     — open end dates of reported deprecations, nearest first, until they pass
## Databricks                          — vendor table (⚠️ = deprecation, 🤖 = AI in data work), then the repos in the ai-agents layout
## Snowflake                           — the same
## Azure / Fabric & GCP                — vendor table only
## Open-source stack                   — the data_stack repos (a quiet line even when all are quiet)
## Releases this week                  — the data repos' stable releases of the last 7 days, each shown once
## Across platforms                    — 0-3 bullets: one capability that moved on two or more vendors, compared
## Spotted                             — community stories about data engineering that named no tracked project
## EU data law                        — links to today's AI Policy items that are EU data law (code-rendered)
(a section with nothing new is left out)
```

`ai-models.md` structure:

```
Lab posts: N | New models: N | Spotted: N | Generated

## Highlights                          — 3-5 bullets: what changes what a practitioner builds with
## Lab announcements                   — Date | Lab | Post | Summary: new Anthropic and OpenAI posts, newest first, at most 15
## New on OpenRouter                   — Model | Listed | Context | Summary: listed in the last 2 days, each shown once
## 🕵️ Stealth Models on OpenRouter   — deterministic table, 🆕 new / ⏳ expiring (always shown)
## Spotted                             — community stories about models and labs that named no tracked project
```

`ai-policy.md` structure:

```
Sources: European Commission | N new items ranked by Jev relevance

## Highlights
## EU             — one table per jurisdiction with items (EU, Netherlands, US federal, US states, Elsewhere), rendered in code:
                   date, source, title link, stage; the LLM writes the summary column
## News & commentary — items from the news & commentary feeds (`kind: news`), date, source, title link, summary
## Coming up      — rendered in code: open consultations of reported items, and policy.calendar dates, in the next 30 days
```

`ai-trends.md` structure:

```
Sources: GitHub Trending + GitHub Search API + OpenRouter + npm + Hugging Face + arXiv + Hacker News + Lobste.rs + Dev.to

## Highlights
## Agents & coding tools
  ### 🚀 Agent & Coding Tool Radar  — OpenRouter / npm / GitHub, new tools flagged 🆕; 🔥 = also in last week's report, in the category tables too
  ### 🧑‍💻 Coding Agents               — CLI / IDE / cloud agents that write code
  ### 🧰 Agent Harnesses & Frameworks — harnesses / SDKs / agent runtimes
  ### 🕸️ Multi-Agent & Orchestration  — swarms / supervisors / many-agent coordination
  ### 🔌 Agent Tooling               — memory / context / skills / MCP / sandboxes / cost
  ### 🤖 Other Agents                — personal / research / browser / vertical agents
## Claude Code Skills
## Candidates to track       — 🔥 repos in no config.yml section, with the lines to add (code only)
## Models
  ### OpenRouter usage       — top models by tokens
  ### Hugging Face trending  — at most 15 models
## Research                  — the week's 10 most relevant arXiv papers
## Most discussed            — the week's most commented HN, Lobste.rs and Dev.to stories no daily page showed
## Signals                   — patterns across the week's tables
(a section with nothing in it is left out)
```

Historical digests are stored in [`digests/`](./digests/). Published issues are tagged by type: [`agents`](../../issues?q=is%3Aissue+label%3Aagents) · [`models`](../../issues?q=is%3Aissue+label%3Amodels) · [`policy`](../../issues?q=is%3Aissue+label%3Apolicy) · [`data`](../../issues?q=is%3Aissue+label%3Adata) · [`trends`](../../issues?q=is%3Aissue+label%3Atrends). Older issues also carry the retired labels [`trending`](../../issues?q=is%3Aissue+label%3Atrending), [`hf`](../../issues?q=is%3Aissue+label%3Ahf), [`arxiv`](../../issues?q=is%3Aissue+label%3Aarxiv), [`hn`](../../issues?q=is%3Aissue+label%3Ahn), [`web`](../../issues?q=is%3Aissue+label%3Aweb), [`infra`](../../issues?q=is%3Aissue+label%3Ainfra), [`community`](../../issues?q=is%3Aissue+label%3Acommunity), [`digest`](../../issues?q=is%3Aissue+label%3Adigest) (CLI), [`openclaw`](../../issues?q=is%3Aissue+label%3Aopenclaw) and [`ph`](../../issues?q=is%3Aissue+label%3Aph).

Only the most recent issues are left open — `pnpm close-stale` closes everything older on each run, so the issue list stays at roughly one day's worth instead of thousands. Daily reports keep the newest day open; the weekly Trends page keeps its newest issue open until the next Monday. Nothing is deleted: the label links above include closed issues, and the full archive also lives under `digests/` and in the Web UI. Issues without a digest label, and pull requests, are never touched.

Weekly and monthly rollup reports were discontinued in July 2026; past ones remain browsable under `digests/` and in the Web UI.

## Schedule

| Workflow     | Cron        | Time zone          | Expected start |
| ------------ | ----------- | ------------------ | -------------- |
| Daily digest | `7 1 * * *` | `Europe/Amsterdam` | 03:40–05:00    |

To change the schedule, edit the cron expression in `.github/workflows/daily-digest.yml`. GitHub applies the time zone's daylight saving time itself.

GitHub's scheduled runs are queued, not guaranteed. From 2026-09-29 to 10-11, with the cron at 22:37 UTC, every run of this workflow started 2h32m–3h50m late, so the cron is set about 4 hours before the digest is wanted (05:00 Amsterdam time). If the delay changes, move the cron. The minute is off the hour on purpose: the `:00` slot is the most contended, and while this workflow sat at `0 23 * * *` (UTC) the delays degraded from minutes to hours (the 2026-08-26 run was dispatched 5h07m late, and the 2026-08-27 run was never created at all).

Report dates (`digests/YYYY-MM-DD`) and the Monday weekly run use CST (UTC+8), which at that hour is the same calendar day as Amsterdam.

When a scheduled run is late enough that you dispatch a catch-up run manually, the two would otherwise both build the same day's digest and open a duplicate set of issues. Two guards prevent that: a `concurrency: daily-digest` group serializes overlapping runs, and a `guard` job skips any **scheduled** run whose `digests/YYYY-MM-DD` folder (CST date) is already committed. Manual `workflow_dispatch` runs always proceed, so you can still force a regeneration.

## Star History

[![Star History Chart](https://star-history.dera.page/svg?repos=dboeter/daily-diff&type=Date)](https://star-history.dera.page/#dboeter/daily-diff&Date)
