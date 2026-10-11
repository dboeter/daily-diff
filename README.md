# Daily Diff

A GitHub Actions workflow that runs every night, landing the digest by about 05:00 Amsterdam time. It aggregates AI ecosystem signals from 11 data sources, then publishes English digests as GitHub Issues and committed Markdown files: a daily set (agents, Hacker News, ArXiv, official web content) and a weekly set on Mondays (infrastructure, trending, community, Hugging Face).

### Data Sources

| Source                                                            | Type                                              | Data                                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| [GitHub Repos](https://github.com)                                | API                                               | Stable releases and hot issues from the agent and infra repos in `config.yml`     |
| [Claude Code Skills](https://github.com/anthropics/skills)        | API                                               | Trending skills sorted by community engagement — **weekly**                       |
| [GitHub Trending](https://github.com/trending)                    | HTML + API                                        | Weekly trending repos + AI topic search (7-day window) — **weekly**               |
| [OpenRouter](https://openrouter.ai/apps)                          | HTML (RSC payload) + Models API                   | Agent app usage, top/new models — **weekly**; stealth models daily                |
| [npm](https://www.npmjs.com)                                      | Registry search API                               | Coding-agent packages by downloads and momentum — **weekly**                      |
| [Hacker News](https://news.ycombinator.com)                       | [Firebase API](https://github.com/HackerNews/API) | Top AI stories from last 24h via topstories scanning                              |
| [ArXiv](https://arxiv.org)                                        | [ArXiv API](https://export.arxiv.org/api/query)   | Papers from cs.AI, cs.CL, cs.LG (new since the last run), ranked by Jev relevance |
| [Hugging Face](https://huggingface.co)                            | [Hub API](https://huggingface.co/api/models)      | 30 trending models sorted by weekly likes — **weekly**, Mondays only              |
| [Dev.to](https://dev.to)                                          | [Forem API](https://dev.to/api)                   | Top AI/LLM articles of the week from 5 tags — **weekly**                          |
| [Lobste.rs](https://lobste.rs)                                    | JSON API                                          | AI/ML tagged stories from last 7 days — **weekly**                                |
| [Anthropic](https://anthropic.com) + [OpenAI](https://openai.com) | Sitemap                                           | New articles detected via `lastmod` diff                                          |

## Web UI

**[https://dboeter.github.io/daily-diff](https://dboeter.github.io/daily-diff)**

Browse all historical digests in a clean, dark-themed interface — no login required. Reports are rendered from the Markdown files in this repo via GitHub Pages.

## Telegram Notifications

When `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set, a message is pushed after each run. It links to all reports for that day plus the Web UI and RSS feed.

## RSS Feed

**[https://dboeter.github.io/daily-diff/feed.xml](https://dboeter.github.io/daily-diff/feed.xml)**

Subscribe in any RSS reader (Feedly, Reeder, NewsBlur, etc.) to receive new digests automatically. The feed includes the latest 30 reports across all report types, updated daily alongside `manifest.json`.

## MCP Server

**`https://daily-diff-mcp.<your-subdomain>.workers.dev`** (see **Self-hosting** below)

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
      "url": "https://daily-diff-mcp.<your-subdomain>.workers.dev"
    }
  }
}
```

Restart Claude Desktop after saving. You can then ask Claude things like:

- _"What's the latest in AI coding agents?"_ → calls `get_latest`
- _"Search for Claude Code mentions this week"_ → calls `search`
- _"Show me the AI trending report for 2026-03-05"_ → calls `get_report`

**OpenClaw setup** — run the following command:

```bash
openclaw mcp add --transport http daily-diff https://daily-diff-mcp.<your-subdomain>.workers.dev
```

Or add it manually to `~/.openclaw/openclaw.json`:

```json
{
  "mcpServers": {
    "daily-diff": {
      "type": "http",
      "url": "https://daily-diff-mcp.<your-subdomain>.workers.dev"
    }
  }
}
```

You can then ask OpenClaw things like:

- _"What's the latest in AI coding agents?"_ → calls `get_latest`
- _"Search for Claude Code mentions this week"_ → calls `search`
- _"Show me the AI trending report for 2026-03-05"_ → calls `get_report`

**Self-hosting** — deploy your own instance from the `mcp/` directory:

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
- **News**: Hacker News stories, new Anthropic/OpenAI pages and GitHub Trending repos that name the agent. An item naming three or more agents is treated as a compatibility list and skipped.

Agents with none of these are listed in one "Quiet today" line.

<!-- tracked:agents -->
<!-- generated from config.yml: edit config.yml, then run pnpm readme -->

**AI Agents Digest**: AI coding agents and personal AI assistants.

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

### Infra projects (GitHub) — weekly

The `infra` section of `config.yml`, in a weekly report (`ai-infra`) on the same pipeline as the agents report — stable releases and hot issues of the last 7 days, without news matching. Until 2026-10-10 it tracked inference engines (vLLM, llama.cpp, Ollama…).

<!-- tracked:infra -->
<!-- generated from config.yml: edit config.yml, then run pnpm readme -->

**Agent Tooling Weekly**: AI agent tooling — agent sandboxes, terminal session multiplexers and context-management tools.

| Project      | Repository                                                              |
| ------------ | ----------------------------------------------------------------------- |
| OpenShell    | [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell)                 |
| herdr        | [herdrdev/herdr](https://github.com/herdrdev/herdr)                     |
| context-mode | [mksglu/context-mode](https://github.com/mksglu/context-mode)           |
| Agent Deck   | [asheshgoplani/agent-deck](https://github.com/asheshgoplani/agent-deck) |

<!-- /tracked:infra -->

### GitHub AI Trending — weekly

| Source                                                          | Details                                                                                                                                                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [github.com/trending](https://github.com/trending?since=weekly) | This week's trending repos — parsed from HTML; includes the stars gained this week                                                                                                                                             |
| GitHub Search API                                               | 6 agent topics (`coding-agent`, `agentic-coding`, `ai-coding`, `agent-harness`, `harness`, `agent-orchestration`): every repo with 100+ stars pushed in the last 7 days, plus repos created in the last 14 days with 25+ stars |
| [OpenRouter](https://openrouter.ai/apps)                        | Apps ranked by tokens (top 200 per day/week/month) + OpenRouter's trending list; top models by tokens; models listed in the last 8 days                                                                                        |
| [npm](https://www.npmjs.com)                                    | Packages tagged `coding-agent`, `agentic-coding`, `cli-agent`; split into top by weekly downloads and rising (weekly well above monthly rate)                                                                                  |

Code builds the tables, not the LLM. The category tables hold established repos and alternate between the biggest star gains this week and the biggest relative gains (repos that had at least 100 stars a week ago and gained at least 50), so a fast-growing smaller repo shows next to the big movers. The weekly gain is GitHub's own count for repos on the trending page, otherwise the difference from last week's count in `digests/trending-state.json`. Repos missing from last week's count get it from GitHub's [star history API](https://docs.github.com/en/rest/activity/starring#get-repository-star-history), one request each, at most 500 per run. [Jev](https://typesafe.ai) decides whether each item is in scope and which category it lands in (coding agents / harnesses & frameworks / multi-agent & orchestration / agent tooling / other agents), and whether it is an agent itself rather than a plugin or MCP server. Each item is judged once: the verdicts are saved in `digests/trending-classifications.json` and reused every week, unless the item's description changes. Without a `TYPESAFE_API_KEY` the repo's search topic decides instead for items not judged before, and a trending repo that no agent topic search returned is left out. Each category shows at most 8 repos.

OpenRouter, npm and the new-repo search feed an **Agent & Coding Tool Radar** table aimed at spotting new agents and agentic coding tools early. New tools come first (🆕: listed on OpenRouter in the last 14 days or ranked this week but not this month, npm downloads at 3x the monthly rate, or a GitHub repo created in the last 14 days with at least 25 stars), but they take at most 8 of the 12 rows, so the week's established leaders still show. Rows that share a GitHub repo or a website become one row, and Jev matches an OpenRouter app to its npm package or GitHub repo. Each match is decided once and saved in `digests/trending-matches.json`, which you can edit by hand.

The LLM writes a two-sentence summary for each row and the prose sections around the tables: highlights, trend signals, community hot spots and model usage. The report ends with a Claude Code Skills section: [anthropics/skills](https://github.com/anthropics/skills) PRs and issues, fetched without a date filter and sorted by popularity.

The daily trending list and the top 15 repos per topic are still fetched every day, for the agents report's news matching.

### Hacker News

Top AI stories from the last 24 hours, fetched from the official [Firebase API](https://github.com/HackerNews/API). The top 500 stories are scanned in batches of 50, filtered for AI-related keywords, and ranked by score. The top stories are passed to the LLM for analysis.

### Official web content (sitemap-based)

| Organization | Site                                       | Tracked sections                                                                               |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Anthropic    | [anthropic.com](https://www.anthropic.com) | `/news/`, `/research/`, `/engineering/`, `/learn/`                                             |
| OpenAI       | [openai.com](https://openai.com)           | research, publication, release, company, engineering, milestone, learn-guides, safety, product |

New articles are detected by comparing sitemap `lastmod` timestamps against a persisted state file (`digests/web-state.json`). On the **first run**, up to 25 recent articles per site are fetched and a comprehensive overview report is generated. On subsequent runs, only new or updated URLs trigger a report; if nothing changed, the web report step is skipped entirely.

## Features

- **Daily:** one agents report — stable releases, hot issues and news for the `agents` repos in `config.yml`, in one LLM call
- **Daily:** Hacker News AI stories, new ArXiv papers, and new Anthropic/OpenAI web content (sitemap-based, incremental)
- **Weekly (Mondays):** releases and hot issues of the `infra` projects, GitHub AI trending + Claude Code Skills, Dev.to + Lobste.rs community digest, Hugging Face trending models
- Publishes a GitHub Issue per report; commits Markdown files to `digests/YYYY-MM-DD/`
- Runs via GitHub Actions; supports manual triggering, with an option to force the weekly reports
- All tracked repositories are configurable via `config.yml` — no code changes needed

The weekly split exists because the daily editions of those reports mostly repeated themselves: sampled over September 2026, 54% of trending links and 45% of community links were already in the previous day's report, and on a given day 5 of 6 infra projects shipped no release. Product Hunt was dropped at the same time — mostly consumer apps, a poor fit for the audience.

## Setup

### 1. Fork this repository

### 2. Customize `config.yml` (optional)

Edit `config.yml` in the repo root to add, remove, or replace the tracked repositories. The file is fully commented. No code changes are needed — the pipeline reads it on every run and stops with an error if the file or a section is missing. Each report section also sets its `title` (report heading and issue title) and `subject` (what the projects are, for the LLM prompt). After editing, run `pnpm readme` to refresh the tracked-repo tables above; the pre-commit hook and CI fail while they are stale.

```yaml
agents:
  title: My Agents Report # report heading and issue title
  subject: what the projects are, for the LLM prompt
  repos:
    # Add a new agent
    - id: my-agent
      repo: owner/my-agent
      name: My Agent
      keywords: [my agent] # optional: news match terms; defaults to name + repo name

infra:
  title: My Weekly Report
  subject: what the projects are, for the LLM prompt
  repos:
    # Add a new weekly project
    - id: my-tool
      repo: owner/my-tool
      name: My Tool
```

### 3. Add Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret               | Required      | Description                                                                                                                                                                                                             |
| -------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LLM_PROVIDER`       | optional      | `anthropic` (default), `openai`, `github-copilot`, `openrouter`, `deepseek`, or `qwen`                                                                                                                                  |
| `ANTHROPIC_API_KEY`  | if Anthropic  | API key — works with both Anthropic and Kimi Code                                                                                                                                                                       |
| `ANTHROPIC_BASE_URL` | optional      | API endpoint override. Set to `https://api.kimi.com/coding/` for Kimi Code; leave unset for Anthropic                                                                                                                   |
| `OPENAI_API_KEY`     | if OpenAI     | OpenAI API key                                                                                                                                                                                                          |
| `OPENAI_BASE_URL`    | optional      | OpenAI endpoint override                                                                                                                                                                                                |
| `OPENROUTER_API_KEY` | if OpenRouter | OpenRouter API key                                                                                                                                                                                                      |
| `DEEPSEEK_API_KEY`   | if DeepSeek   | DeepSeek API key                                                                                                                                                                                                        |
| `DASHSCOPE_API_KEY`  | if Qwen       | Alibaba Model Studio API key                                                                                                                                                                                            |
| `TYPESAFE_API_KEY`   | optional      | [TypeSafe](https://typesafe.ai) key. If set, ArXiv papers are ranked by Jev relevance instead of recency, and Jev decides the trending report's scope, categories and cross-source matches instead of the search topics |
| `TELEGRAM_BOT_TOKEN` | optional      | Telegram bot token from [@BotFather](https://t.me/BotFather). If set, a message is sent after each digest run                                                                                                           |
| `TELEGRAM_CHAT_ID`   | optional      | Telegram chat/channel/group ID to send notifications to                                                                                                                                                                 |

> `GITHUB_TOKEN` is provided automatically by GitHub Actions. When using `github-copilot` as the provider, the same `GITHUB_TOKEN` is used for LLM calls.

**Setting up Telegram notifications** (optional):

1. Message [@BotFather](https://t.me/BotFather) on Telegram, create a bot, and copy the token
2. Add the bot to your channel/group, or start a DM with it
3. Get the chat ID via [@userinfobot](https://t.me/userinfobot) or the [getUpdates](https://core.telegram.org/bots/api#getupdates) API
4. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as repository secrets

> If neither secret is set, the notification step is silently skipped.

### 3. Enable the workflow

Confirm the workflow is enabled in the **Actions** tab.

To test immediately, go to **Actions → Daily Diff → Run workflow**. Tick **force_weekly** to also generate the weekly reports on a non-Monday (e.g. to redo a missed Monday).

> **First run note**: The web content step will fetch up to 50 articles (25 per site) and may take a few extra minutes. Subsequent runs are fast — only new articles are processed.

## LLM providers

Set `LLM_PROVIDER` to choose which model backend powers the digest generation. Defaults to `anthropic`.

| Provider       | `LLM_PROVIDER`   | Required env vars    | Default model               |
| -------------- | ---------------- | -------------------- | --------------------------- |
| Anthropic      | `anthropic`      | `ANTHROPIC_API_KEY`  | `claude-sonnet-4-6`         |
| OpenAI         | `openai`         | `OPENAI_API_KEY`     | `gpt-4o`                    |
| GitHub Copilot | `github-copilot` | `GITHUB_TOKEN`       | `gpt-4o`                    |
| OpenRouter     | `openrouter`     | `OPENROUTER_API_KEY` | `anthropic/claude-sonnet-4` |
| DeepSeek       | `deepseek`       | `DEEPSEEK_API_KEY`   | `deepseek-v4-flash`         |
| Qwen           | `qwen`           | `DASHSCOPE_API_KEY`  | `qwen-flash`                |

Override the model name with `ANTHROPIC_MODEL`, `OPENAI_MODEL`, `GITHUB_COPILOT_MODEL`, `OPENROUTER_MODEL`, `DEEPSEEK_MODEL`, or `QWEN_MODEL` respectively. The Qwen endpoint can be overridden with `DASHSCOPE_BASE_URL`. For reasoning models on OpenRouter, set `OPENROUTER_REASONING_EFFORT` (e.g. `low`) so reasoning does not consume the whole output budget.

The scheduled daily run uses `openrouter` / `nvidia/nemotron-3-ultra-550b-a55b:free` with `OPENROUTER_REASONING_EFFORT=low`.

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

export DIGEST_REPO=your-username/daily-diff  # optional; omit to only write files
# export DIGEST_FORCE_WEEKLY=1               # optional; also run the weekly reports today
# export TYPESAFE_API_KEY=xxxxx              # optional; Jev for ArXiv ranking and trending scope

pnpm start

pnpm readme   # after editing config.yml: refresh the tracked-repo tables in this README
```

## Output format

Files are written to `digests/YYYY-MM-DD/`:

| File              | Content                                                                                               | Cadence | GitHub Issue label |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ------- | ------------------ |
| `ai-agents.md`    | AI agents digest — overview + per-agent releases, news and hot issues                                 | daily   | `agents`           |
| `ai-hn.md`        | Hacker News AI community digest — top stories + sentiment analysis (only written when fetch succeeds) | daily   | `hn`               |
| `ai-arxiv.md`     | ArXiv AI research digest — key papers from cs.AI/cs.CL/cs.LG                                          | daily   | `arxiv`            |
| `ai-web.md`       | Official web content report (only written when new content exists)                                    | daily   | `web`              |
| `ai-infra.md`     | Weekly report on the `infra` projects — overview + per-project releases and hot issues                | weekly  | `infra`            |
| `ai-trending.md`  | GitHub agent & AI-coding trending report — repos by category + trend signals + Claude Code Skills     | weekly  | `trending`         |
| `ai-community.md` | Tech community AI weekly — Dev.to articles + Lobste.rs stories combined                               | weekly  | `community`        |
| `ai-hf.md`        | Hugging Face trending models digest — sorted by weekly likes                                          | weekly  | `hf`               |

Archived days also contain `ai-cli.md` (the CLI report, merged into `ai-agents.md` in October 2026) and `ai-ph.md` (Product Hunt, dropped in October 2026). Before October 2026, `ai-agents.md` was the OpenClaw ecosystem report.

A shared state file `digests/web-state.json` tracks which web URLs have been seen; it is committed alongside the daily digests.

---

`ai-agents.md` structure (`ai-infra.md` is the same, over a week):

```
Generated | Projects: N | Active today: N | Stable releases: N | Prereleases (not covered): N

## 🕵️ Stealth Models on OpenRouter   — agents report only; deterministic table, 🆕 new / ⏳ expiring

## Overview
  3-5 sentences: what shipped, what broke, what got attention

## <Agent>            — one section per active agent, at most 3 bullets
  Release / News / Hot issue

Quiet today: <agents with nothing to report>
```

`ai-web.md` structure:

```
Sources: anthropic.com (N articles) + openai.com (N articles)

Today's summary
Anthropic / Claude highlights  (news / research / engineering / learn)
OpenAI highlights              (research / release / company / safety / ...)
Strategic signals
Notable details
[First full crawl also includes: Content landscape overview]
```

`ai-trending.md` structure:

```
Sources: GitHub Trending + GitHub Search API + OpenRouter + npm

This week's highlights
Agent & coding tool radar (OpenRouter / npm / GitHub, new tools flagged 🆕)
Top projects by category
  🧑‍💻 Coding Agents               — CLI / IDE / cloud agents that write code
  🧰 Agent Harnesses & Frameworks — harnesses / SDKs / agent runtimes
  🕸️ Multi-Agent & Orchestration  — swarms / supervisors / many-agent coordination
  🔌 Agent Tooling               — memory / context / skills / MCP / sandboxes / cost
  🤖 Other Agents                — personal / research / browser / vertical agents
Trend signal analysis
Community hot spots
Model usage on OpenRouter (top models by tokens + newly listed)
Claude Code Skills highlights
```

`ai-hn.md` structure:

```
Sources: Hacker News (top-30 AI stories, last 24h)

Today's summary
Top stories & discussions
  🔬 Models & Research  — new model releases / papers / benchmarks
  🛠️ Tools & Engineering — open-source projects / frameworks / engineering practice
  🏢 Industry news      — company news / funding / product launches
  💬 Opinions & debate  — Ask HN / Show HN / hot threads
Community sentiment signals
Worth reading
```

Historical digests are stored in [`digests/`](./digests/). Published issues are tagged by type: [`agents`](../../issues?q=is%3Aissue+label%3Aagents) · [`infra`](../../issues?q=is%3Aissue+label%3Ainfra) · [`web`](../../issues?q=is%3Aissue+label%3Aweb) · [`trending`](../../issues?q=is%3Aissue+label%3Atrending) · [`hn`](../../issues?q=is%3Aissue+label%3Ahn) · [`arxiv`](../../issues?q=is%3Aissue+label%3Aarxiv) · [`hf`](../../issues?q=is%3Aissue+label%3Ahf) · [`community`](../../issues?q=is%3Aissue+label%3Acommunity). Older issues also carry the retired labels [`digest`](../../issues?q=is%3Aissue+label%3Adigest) (CLI), [`openclaw`](../../issues?q=is%3Aissue+label%3Aopenclaw) and [`ph`](../../issues?q=is%3Aissue+label%3Aph).

Only the most recent issues are left open — `pnpm close-stale` closes everything older on each run, so the issue list stays at roughly one day's worth instead of thousands. Daily reports keep the newest day open; each weekly report keeps its newest edition open until the next Monday. Nothing is deleted: the label links above include closed issues, and the full archive also lives under `digests/` and in the Web UI. Issues without a digest label, and pull requests, are never touched.

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
