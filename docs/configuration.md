# Configuration and running

How to configure the digest, which keys it uses, how to run it locally and when the scheduled run starts.

## `config.yml`

`config.yml` (fully commented) holds the tracked repos, the AI Policy sources, watchlists and calendar, and the vendor feeds; the pipeline stops with an error when a section is missing. After editing it, run `pnpm readme` to refresh the tracked-repo tables in the [README](../README.md#what-it-tracks); pre-commit and CI fail while they are stale.

```yaml
agents:
  repos:
    - id: my-agent
      repo: owner/my-agent
      name: My Agent
      keywords: [my agent] # optional: news match terms; defaults to name + repo name
```

## Secrets

Repository secrets (**Settings → Secrets and variables → Actions**); `GITHUB_TOKEN` is provided by Actions.

| Secret                                   | Description                                                                                                                                                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPENROUTER_API_KEY`                     | The scheduled run's LLM key (the workflow sets `LLM_PROVIDER: openrouter`; for another provider, edit the workflow, see [LLM providers](#llm-providers))                                                                   |
| `ANTHROPIC_API_KEY`                      | The weekly pages' writer, Claude Opus on the Anthropic API: Weekly Diff's article (one call of about $0.80) and Trends' five calls (cost not measured). Without it: no Weekly Diff page, and the run's model writes Trends |
| `TYPESAFE_API_KEY`                       | Jev judgments (without it: keyword rules, search-topic labels, and no Research section in Trends)                                                                                                                          |
| `USA_GOV_API_KEY`                        | [api.data.gov](https://api.data.gov/signup/) key for Congress.gov and Regulations.gov                                                                                                                                      |
| `PLURAL_API_KEY`                         | [Open States](https://open.pluralpolicy.com) key for US state bills                                                                                                                                                        |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Telegram notifications (bot from [@BotFather](https://t.me/BotFather))                                                                                                                                                     |
| `TEAMS_WEBHOOK_URL`                      | Power Automate Workflows webhook for the Teams card                                                                                                                                                                        |
| `CLOUDFLARE_API_TOKEN`                   | The `Deploy MCP` workflow only                                                                                                                                                                                             |

A source whose key is unset is skipped; the rest of the run goes on.

## LLM providers

| Provider       | `LLM_PROVIDER`        | Key                  | Default model                 | Model override         |
| -------------- | --------------------- | -------------------- | ----------------------------- | ---------------------- |
| Anthropic      | `anthropic` (default) | `ANTHROPIC_API_KEY`  | `claude-sonnet-5-5`           | `ANTHROPIC_MODEL`      |
| OpenAI         | `openai`              | `OPENAI_API_KEY`     | `gpt-4o`                      | `OPENAI_MODEL`         |
| GitHub Copilot | `github-copilot`      | `GITHUB_TOKEN`       | `gpt-4o`                      | `GITHUB_COPILOT_MODEL` |
| OpenRouter     | `openrouter`          | `OPENROUTER_API_KEY` | `anthropic/claude-sonnet-5.5` | `OPENROUTER_MODEL`     |
| DeepSeek       | `deepseek`            | `DEEPSEEK_API_KEY`   | `deepseek-v4-flash`           | `DEEPSEEK_MODEL`       |
| Qwen           | `qwen`                | `DASHSCOPE_API_KEY`  | `qwen-flash`                  | `QWEN_MODEL`           |

`ANTHROPIC_BASE_URL`, `OPENAI_BASE_URL` and `DASHSCOPE_BASE_URL` override the endpoints. The scheduled run uses OpenRouter's free `baidu/ernie-5.5-flash-preview:free` with `OPENROUTER_REASONING_EFFORT=high` (reasoning counts against a call's output budget; a call it uses up is retried once at double budget) and `OPENROUTER_FALLBACK_MODELS` tried in order when it is down. When half the LLM calls fail, the run aborts before publishing anything.

## Running locally

```bash
pnpm install
export GITHUB_TOKEN=ghp_xxxxx
export ANTHROPIC_API_KEY=sk-ant-xxxxx   # or LLM_PROVIDER + its key
# export DIGEST_REPO=dboeter/daily-diff  # open GitHub Issues; omit to only write files
# export DIGEST_FORCE_WEEKLY=1           # also build the weekly pages (Trends, Weekly Diff) on a non-Monday;
#                                        # Claude Opus writes them with ANTHROPIC_API_KEY (the article about $0.80;
#                                        # Trends' five calls not measured); without it, no Weekly Diff page
pnpm start
```

A local run writes that day's reports and changes the state files under `digests/`. [`CONTRIBUTING.md`](../CONTRIBUTING.md#set-up) has the commands that undo it.

## Schedule

The workflow's cron is `7 1 * * *` in `Europe/Amsterdam`. GitHub starts scheduled runs 2.5–4 hours late, so the cron sits about 4 hours before the digest is wanted; if the delay changes, move it in `.github/workflows/daily-digest.yml`. Report dates and the Monday Trends run use CST (UTC+8), the same calendar day as Amsterdam at that hour.

**Actions → Daily Diff → Run workflow** starts a run by hand, e.g. to regenerate a day; tick **force_weekly** to build Trends and Weekly Diff too. A scheduled run skips a day whose `digests/YYYY-MM-DD` folder is already committed, so a late cron after a manual catch-up opens no duplicate issues.
