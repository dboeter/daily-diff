# Daily Diff

A GitHub Actions workflow that runs every morning at 06:37 CST. It aggregates AI ecosystem signals from 11 data sources, then publishes English digests as GitHub Issues and committed Markdown files: a daily set (agents, Hacker News, ArXiv, official web content) and a weekly set on Mondays (infrastructure, trending, community, Hugging Face).

### Data Sources

| Source                                                            | Type                                              | Data                                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| [GitHub Repos](https://github.com)                                | API                                               | Stable releases and hot issues from 18 tracked agent and infra repos              |
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
wrangler deploy
```

## Tracked sources

### AI agents (GitHub) — daily

Coding agents and personal AI assistants, CLI or not, in one daily report. Issue and PR churn is not reported; each agent is covered by:

- **Stable releases** from the last 24h. Nightlies, alphas and release candidates are detected (API flag or tag pattern) and only counted.
- **Hot issues**: opened in the last 48h with 10+ comments and 👍 combined (3+ when labelled regression or security), at most 2 per agent.
- **News**: Hacker News stories, new Anthropic/OpenAI pages and GitHub Trending repos that name the agent. An item naming three or more agents is treated as a compatibility list and skipped.

Agents with none of these are listed in one "Quiet today" line.

| Agent              | Repository                                                                |
| ------------------ | ------------------------------------------------------------------------- |
| Claude Code        | [anthropics/claude-code](https://github.com/anthropics/claude-code)       |
| OpenAI Codex       | [openai/codex](https://github.com/openai/codex)                           |
| Gemini CLI         | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)   |
| GitHub Copilot CLI | [github/copilot-cli](https://github.com/github/copilot-cli)               |
| OpenCode           | [anomalyco/opencode](https://github.com/anomalyco/opencode)               |
| Pi                 | [earendil-works/pi](https://github.com/earendil-works/pi)                 |
| Qwen Code          | [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)                   |
| OpenClaw           | [openclaw/openclaw](https://github.com/openclaw/openclaw)                 |
| Hermes Agent       | [nousresearch/hermes-agent](https://github.com/nousresearch/hermes-agent) |
| IronClaw           | [nearai/ironclaw](https://github.com/nearai/ironclaw)                     |
| QwenPaw            | [agentscope-ai/QwenPaw](https://github.com/agentscope-ai/QwenPaw)         |
| ZeroClaw           | [zeroclaw-labs/zeroclaw](https://github.com/zeroclaw-labs/zeroclaw)       |

### AI infrastructure (GitHub) — weekly

The inference and serving layer the agents run on top of. Weekly report on the same pipeline as the agents report — stable releases and hot issues of the last 7 days, without news matching.

| Project   | Repository                                                  | Layer            | Stars  |
| --------- | ----------------------------------------------------------- | ---------------- | ------ |
| Ollama    | [ollama/ollama](https://github.com/ollama/ollama)           | Local runtime    | 177.2k |
| llama.cpp | [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) | Inference engine | 121.9k |
| vLLM      | [vllm-project/vllm](https://github.com/vllm-project/vllm)   | Serving engine   | 87.5k  |
| Unsloth   | [unslothai/unsloth](https://github.com/unslothai/unsloth)   | Fine-tuning      | 69.0k  |
| LiteLLM   | [BerriAI/litellm](https://github.com/BerriAI/litellm)       | LLM gateway      | 55.0k  |
| SGLang    | [sgl-project/sglang](https://github.com/sgl-project/sglang) | Serving engine   | 30.9k  |

### GitHub AI Trending — weekly

| Source                                                          | Details                                                                                                                                            |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [github.com/trending](https://github.com/trending?since=weekly) | This week's trending repos — parsed from HTML; includes the stars gained this week                                                                 |
| GitHub Search API                                               | Repos active in the last 7 days matching 6 agent topics: `harness`, `agent-harness`, `ai-coding`, `multi-agent`, `agent-orchestration`, `ai-agent` |
| GitHub Search API (new repos)                                   | Repos _created_ in the last 14 days tagged `coding-agent` or `agentic-coding`                                                                      |
| [OpenRouter](https://openrouter.ai/apps)                        | Apps ranked by tokens (top 200 per day/week/month) + OpenRouter's trending list; top models by tokens; models listed in the last 8 days            |
| [npm](https://www.npmjs.com)                                    | Packages tagged `coding-agent`, `agentic-coding`, `cli-agent`; split into top by weekly downloads and rising (weekly well above monthly rate)      |

The LLM keeps only agent, harness and AI-coding repos (general AI/ML such as model weights, inference engines and RAG is out of scope), classifies them (coding agents / harnesses & frameworks / multi-agent & orchestration / agent tooling / other agents), and extracts trend signals. The report ends with a Claude Code Skills section: [anthropics/skills](https://github.com/anthropics/skills) PRs and issues, fetched without a date filter and sorted by popularity.

OpenRouter, npm and the new-repo search feed an **Agent & Coding Tool Radar** table aimed at spotting new agents and agentic coding tools early.

The daily trending list is still fetched every day, for the agents report's news matching.

### Hacker News

Top AI stories from the last 24 hours, fetched from the official [Firebase API](https://github.com/HackerNews/API). The top 500 stories are scanned in batches of 50, filtered for AI-related keywords, and ranked by score. The top stories are passed to the LLM for analysis.

### Official web content (sitemap-based)

| Organization | Site                                       | Tracked sections                                                                               |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Anthropic    | [anthropic.com](https://www.anthropic.com) | `/news/`, `/research/`, `/engineering/`, `/learn/`                                             |
| OpenAI       | [openai.com](https://openai.com)           | research, publication, release, company, engineering, milestone, learn-guides, safety, product |

New articles are detected by comparing sitemap `lastmod` timestamps against a persisted state file (`digests/web-state.json`). On the **first run**, up to 25 recent articles per site are fetched and a comprehensive overview report is generated. On subsequent runs, only new or updated URLs trigger a report; if nothing changed, the web report step is skipped entirely.

## Features

- **Daily:** one agents report — stable releases, hot issues and news for 12 coding agents and AI assistants, in one LLM call
- **Daily:** Hacker News AI stories, new ArXiv papers, and new Anthropic/OpenAI web content (sitemap-based, incremental)
- **Weekly (Mondays):** AI infrastructure releases and hot issues, GitHub AI trending + Claude Code Skills, Dev.to + Lobste.rs community digest, Hugging Face trending models
- Publishes a GitHub Issue per report; commits Markdown files to `digests/YYYY-MM-DD/`
- Runs via GitHub Actions; supports manual triggering, with an option to force the weekly reports
- All tracked repositories are configurable via `config.yml` — no code changes needed

The weekly split exists because the daily editions of those reports mostly repeated themselves: sampled over September 2026, 54% of trending links and 45% of community links were already in the previous day's report, and on a given day 5 of 6 infra projects shipped no release. Product Hunt was dropped at the same time — mostly consumer apps, a poor fit for the audience.

## Setup

### 1. Fork this repository

### 2. Customize `config.yml` (optional)

Edit `config.yml` in the repo root to add, remove, or replace the tracked repositories. The file is fully commented. No code changes are needed — the pipeline reads it on every run and falls back to built-in defaults if the file is absent.

```yaml
# Add a new agent
agents:
  - id: my-agent
    repo: owner/my-agent
    name: My Agent
    keywords: [my agent] # optional: news match terms; defaults to name + repo name

# Add a new AI infrastructure project
infra_repos:
  - id: my-engine
    repo: owner/my-engine
    name: My Engine
```

### 3. Add Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret               | Required      | Description                                                                                                   |
| -------------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `LLM_PROVIDER`       | optional      | `anthropic` (default), `openai`, `github-copilot`, `openrouter`, `deepseek`, or `qwen`                        |
| `ANTHROPIC_API_KEY`  | if Anthropic  | API key — works with both Anthropic and Kimi Code                                                             |
| `ANTHROPIC_BASE_URL` | optional      | API endpoint override. Set to `https://api.kimi.com/coding/` for Kimi Code; leave unset for Anthropic         |
| `OPENAI_API_KEY`     | if OpenAI     | OpenAI API key                                                                                                |
| `OPENAI_BASE_URL`    | optional      | OpenAI endpoint override                                                                                      |
| `OPENROUTER_API_KEY` | if OpenRouter | OpenRouter API key                                                                                            |
| `DEEPSEEK_API_KEY`   | if DeepSeek   | DeepSeek API key                                                                                              |
| `DASHSCOPE_API_KEY`  | if Qwen       | Alibaba Model Studio API key                                                                                  |
| `TYPESAFE_API_KEY`   | optional      | [TypeSafe](https://typesafe.ai) key. If set, ArXiv papers are ranked by Jev relevance instead of recency      |
| `TELEGRAM_BOT_TOKEN` | optional      | Telegram bot token from [@BotFather](https://t.me/BotFather). If set, a message is sent after each digest run |
| `TELEGRAM_CHAT_ID`   | optional      | Telegram chat/channel/group ID to send notifications to                                                       |

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
# export TYPESAFE_API_KEY=xxxxx              # optional; rank ArXiv papers by Jev relevance

pnpm start
```

## Output format

Files are written to `digests/YYYY-MM-DD/`:

| File              | Content                                                                                               | Cadence | GitHub Issue label |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ------- | ------------------ |
| `ai-agents.md`    | AI agents digest — overview + per-agent releases, news and hot issues                                 | daily   | `agents`           |
| `ai-hn.md`        | Hacker News AI community digest — top stories + sentiment analysis (only written when fetch succeeds) | daily   | `hn`               |
| `ai-arxiv.md`     | ArXiv AI research digest — key papers from cs.AI/cs.CL/cs.LG                                          | daily   | `arxiv`            |
| `ai-web.md`       | Official web content report (only written when new content exists)                                    | daily   | `web`              |
| `ai-infra.md`     | AI infrastructure weekly — overview + per-project releases and hot issues                             | weekly  | `infra`            |
| `ai-trending.md`  | GitHub agent & AI-coding trending report — repos by category + trend signals + Claude Code Skills     | weekly  | `trending`         |
| `ai-community.md` | Tech community AI weekly — Dev.to articles + Lobste.rs stories combined                               | weekly  | `community`        |
| `ai-hf.md`        | Hugging Face trending models digest — sorted by weekly likes                                          | weekly  | `hf`               |

Archived days also contain `ai-cli.md` (the CLI report, merged into `ai-agents.md` in October 2026) and `ai-ph.md` (Product Hunt, dropped in October 2026). Before October 2026, `ai-agents.md` was the OpenClaw ecosystem report.

A shared state file `digests/web-state.json` tracks which web URLs have been seen; it is committed alongside the daily digests.

---

`ai-agents.md` structure (`ai-infra.md` is the same, over a week):

```
Generated | Projects: 12 | Active today: N | Stable releases: N | Prereleases (not covered): N

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
Top repos by dimension
  🧑‍💻 Coding Agents               — CLI / IDE / cloud agents that write code
  🧰 Agent Harnesses & Frameworks — harnesses / SDKs / agent runtimes
  🕸️ Multi-Agent & Orchestration  — swarms / supervisors / many-agent coordination
  🔌 Agent Tooling               — memory / context / skills / MCP / sandboxes / cost
  🤖 Other Agents                — personal / research / browser / vertical agents
Trend signal analysis
Community focus
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

| Workflow     | Cron          | UTC         | CST            |
| ------------ | ------------- | ----------- | -------------- |
| Daily digest | `37 22 * * *` | 22:37 daily | 06:37 next day |

To change the schedule, edit the cron expression in `.github/workflows/daily-digest.yml`.

GitHub's scheduled runs are queued, not guaranteed — typical delay for this workflow is 10-15 minutes, so a 06:37 CST start lands the digest around 07:00 CST. The minute is off the hour on purpose: the `:00` slot is the most contended, and while this workflow sat at `0 23 * * *` the delays degraded from minutes to hours (the 2026-08-26 run was dispatched 5h07m late, and the 2026-08-27 run was never created at all).

When a scheduled run is late enough that you dispatch a catch-up run manually, the two would otherwise both build the same day's digest and open a duplicate set of issues. Two guards prevent that: a `concurrency: daily-digest` group serializes overlapping runs, and a `guard` job skips any **scheduled** run whose `digests/YYYY-MM-DD` folder (CST date) is already committed. Manual `workflow_dispatch` runs always proceed, so you can still force a regeneration.

## Star History

[![Star History Chart](https://star-history.dera.page/svg?repos=dboeter/daily-diff&type=Date)](https://star-history.dera.page/#dboeter/daily-diff&Date)
