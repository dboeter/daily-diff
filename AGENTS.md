# AGENTS.md

## Project overview

Daily Diff is a daily digest generator for the AI open-source ecosystem. A GitHub Actions cron job runs at 22:37 UTC (06:37 CST next day) and produces English reports, published as GitHub Issues and committed Markdown files. Most reports are daily; a weekly set runs on Mondays (CST).

## Commands

```bash
pnpm start          # run the full digest locally
pnpm test           # vitest (unit tests)
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm lint:fix       # ESLint --fix
pnpm format         # Prettier --write src
pnpm format:check   # Prettier --check src
```

Required env vars for local runs:

```bash
export GITHUB_TOKEN=ghp_xxxxx
export DIGEST_REPO=owner/repo   # omit to skip GitHub issue creation

# LLM provider (default: anthropic)
export LLM_PROVIDER=anthropic   # anthropic | openai | github-copilot | openrouter | deepseek | qwen

# Anthropic (default)
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI
# export OPENAI_API_KEY=sk-xxxxx

# GitHub Copilot — uses GITHUB_TOKEN

# OpenRouter
# export OPENROUTER_API_KEY=sk-or-xxxxx

# DeepSeek
# export DEEPSEEK_API_KEY=sk-xxxxx

# Qwen (Alibaba Model Studio)
# export DASHSCOPE_API_KEY=sk-xxxxx

# Run the weekly reports (infra, trending, community, HF) on a non-Monday
# export DIGEST_FORCE_WEEKLY=1
```

## Architecture

The pipeline runs in four sequential phases, each implemented as a named async function in `src/index.ts`:

1. **`fetchAllData`** — all network I/O in parallel. Daily: releases + hot issues for the 12 agents, Anthropic/OpenAI sitemaps, GitHub Trending (HTML + Search API, for agent news), Hacker News Firebase API, ArXiv API, OpenRouter model catalog (stealth models). Weekly only (`isWeeklyRun`): releases + hot issues for the 6 infra repos, Claude Code Skills, OpenRouter apps/rankings, npm registry search, Hugging Face Hub API, Dev.to Forem API, Lobste.rs JSON API.
2. **News matching** — `matchAgentNews` (`src/agent-news.ts`) assigns HN, web and trending items to the agents they name.
3. **`generateSummaries`** — one LLM call for the agents report; on the weekly run also infra, skills and trending. Rate-limited to 5 concurrent requests by a queue in `src/report.ts`.
4. **Save phase** — `buildProjectReportContent` (in `src/report-builders.ts`) builds the agents and infra Markdown; the `saveXxxReport` functions (in `src/report-savers.ts`) generate their body, write the file and create the GitHub Issue.

## Source files

| File                                 | Responsibility                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`                       | Orchestration: repo config, phase functions, `main()`                                                                                                                                             |
| `src/i18n.ts`                        | Centralized report strings: report titles, issue labels, footer text, status messages, `REPORT_LABELS`, `NOTIFY_LABELS`                                                                           |
| `src/github.ts`                      | GitHub API helpers: `fetchRecentReleases`, `isPrerelease`, `fetchHotIssues` (search API), `fetchSkillsData`, `createGitHubIssue`, `closeSupersededIssues`                                         |
| `src/config.ts`                      | Loads `config.yml` into `RadarConfig` (`agents`, `skillsRepo`, `infraRepos`); built-in defaults when a section is missing                                                                         |
| `src/prompts.ts`                     | LLM prompt builders for repo reports: `buildProjectDigestPrompt` (agents daily, infra weekly; `DigestScope` sets the wording), `buildSkillsPrompt`; `ProjectActivity` type                        |
| `src/agent-news.ts`                  | `matchAgentNews`: whole-word matching of agent names/keywords against HN, web and trending items                                                                                                  |
| `src/prompts-data.ts`                | LLM prompt builders for data-source reports: `buildTrendingPrompt`, `buildWebReportPrompt`, `buildHnPrompt`, `buildArxivPrompt`, `buildHfPrompt`, `buildCommunityPrompt`, `buildHighlightsPrompt` |
| `src/report.ts`                      | `callLlm` (with concurrency limiter), `saveFile`, `autoGenFooter` (uses i18n), LLM token budget constants, LLM health accounting and outage gates                                                 |
| `src/report-builders.ts`             | `buildProjectReportContent` — assembles the agents and infra report Markdown (header counts, LLM body, quiet-projects line)                                                                       |
| `src/report-savers.ts`               | `saveWebReport`, `saveTrendingReport`, `saveHnReport`, `saveArxivReport`, `saveHfReport`, `saveCommunityReport` — LLM call + file save + optional GitHub issue                                    |
| `src/date.ts`                        | Date and timing utilities: `toCstDateStr`, `toUtcStr`, `weekdayOf`, `sleep`; weekly schedule: `WEEKLY_REPORT_WEEKDAY`, `isWeeklyRun`                                                              |
| `src/providers/types.ts`             | `LlmProvider` interface, `ProviderName` type, `VALID_PROVIDER_NAMES`                                                                                                                              |
| `src/providers/openai-compatible.ts` | `OpenAICompatibleProvider` — shared base class for OpenAI-compatible providers                                                                                                                    |
| `src/providers/anthropic.ts`         | `AnthropicProvider` — Anthropic SDK wrapper                                                                                                                                                       |
| `src/providers/openai.ts`            | `OpenAIProvider` — extends `OpenAICompatibleProvider`                                                                                                                                             |
| `src/providers/github-copilot.ts`    | `GitHubCopilotProvider` — extends `OpenAICompatibleProvider`                                                                                                                                      |
| `src/providers/openrouter.ts`        | `OpenRouterProvider` — extends `OpenAICompatibleProvider`                                                                                                                                         |
| `src/providers/deepseek.ts`          | `DeepSeekProvider` — extends `OpenAICompatibleProvider`                                                                                                                                           |
| `src/providers/qwen.ts`              | `QwenProvider` — extends `OpenAICompatibleProvider`; Alibaba Model Studio                                                                                                                         |
| `src/providers/index.ts`             | `createProvider` factory + barrel re-exports                                                                                                                                                      |
| `src/web.ts`                         | Sitemap-based web content fetching; state persisted to `digests/web-state.json`                                                                                                                   |
| `src/trending.ts`                    | GitHub Trending HTML scraper (`since=daily`, or `weekly` on the weekly run) + Search API topic queries; on the weekly run also composes OpenRouter + npm; `hasTrendingData` gates the report      |
| `src/openrouter.ts`                  | OpenRouter app + model popularity scraped from the `/apps` and `/rankings` RSC payload; new models and `fetchStealthModels` via `/api/v1/models`                                                   |
| `src/npm.ts`                         | npm coding-agent packages via registry search; `rankNpmPackages` splits rising (download momentum) from top                                                                                      |
| `src/hn.ts`                          | Hacker News top AI stories via Firebase API (top 500 scanned in batches of 50, regex-filtered)                                                                                                    |
| `src/arxiv.ts`                       | ArXiv AI papers via API Atom feed (cs.AI, cs.CL, cs.LG)                                                                                                                                           |
| `src/hf.ts`                          | Hugging Face Hub trending models via Hub API (weekly)                                                                                                                                             |
| `src/devto.ts`                       | Dev.to top AI articles of the week via Forem API (`top=7`)                                                                                                                                        |
| `src/lobsters.ts`                    | Lobste.rs AI/ML stories via JSON endpoints                                                                                                                                                        |
| `src/notify.ts`                      | Telegram notification sender (`pnpm notify`)                                                                                                                                                      |
| `src/close-stale-issues.ts`          | Auto-closer for superseded daily digest issues (`pnpm close-stale`)                                                                                                                               |
| `src/generate-manifest.ts`           | Generates `manifest.json` (sidebar data for Web UI) and `feed.xml` (RSS 2.0 feed)                                                                                                                 |

## Report outputs

Files written to `digests/YYYY-MM-DD/`:

| File              | Label       | Notes                                                           |
| ----------------- | ----------- | --------------------------------------------------------------- |
| `ai-agents.md`    | `agents`    | Daily, always generated; opens with the stealth-model table     |
| `ai-hn.md`        | `hn`        | Daily, skipped if fetch fails                                   |
| `ai-arxiv.md`     | `arxiv`     | Daily, skipped if fetch fails                                   |
| `ai-web.md`       | `web`       | Daily, skipped if no new sitemap content                        |
| `ai-infra.md`     | `infra`     | **Weekly**, always generated on the weekly run                  |
| `ai-trending.md`  | `trending`  | **Weekly**, skipped if all data sources fail; ends with Skills  |
| `ai-community.md` | `community` | **Weekly**, skipped if both Dev.to and Lobsters fail            |
| `ai-hf.md`        | `hf`        | **Weekly**                                                      |

Weekly = on `WEEKLY_REPORT_WEEKDAY` (Monday, CST) or when `DIGEST_FORCE_WEEKLY=1` (the workflow's `force_weekly` dispatch input). Archive-only files: `ai-cli.md` (merged into `ai-agents.md` in October 2026), `ai-ph.md` (dropped October 2026); before October 2026 `ai-agents.md` was the OpenClaw ecosystem report.

## Tracked sources

- **AGENTS** (12, daily): claude-code, codex, gemini-cli, copilot-cli, opencode, pi, qwen-code, openclaw, hermes-agent, ironclaw, qwenpaw, zeroclaw. One list, CLI or not — the CLI/OpenClaw split was merged in October 2026. Optional `keywords` per agent set the news-match terms (Pi needs them: "pi" alone matches Raspberry Pi).
- **INFRA_REPOS** (6, weekly): vllm, sglang, llama-cpp, ollama, litellm, unsloth — inference engines, gateway and fine-tuning layer
- **CLAUDE_SKILLS_REPO** (weekly, in `ai-trending`): anthropics/skills — no date filter, sorted by popularity
- **Web**: anthropic.com + openai.com via sitemap, state in `digests/web-state.json`
- **Trending**: github.com/trending (HTML) + GitHub Search API (6 AI topics, 7-day window). Fetched daily for agent news; the report is weekly and scrapes `since=weekly` that day. The weekly run adds `coding-agent`/`agentic-coding` repos _created_ in 14 days (weekly-only because search quota is shared with `fetchHotIssues`), OpenRouter and npm; these feed an "Agent & Coding Tool Radar" section aimed at spotting new agents.
  - **OpenRouter** has no usage API. `/apps` and `/rankings` embed their data in the Next.js RSC payload (`self.__next_f.push` chunks), parsed by `extractRscPayload` + `extractJsonArray`. `/apps` carries the top 200 apps for day/week/month plus a `trending` list with `growthPercent`; category pages load client-side, so apps outside those lists are invisible. The scrape breaks silently when the frontend changes — watch for `[openrouter] Parsed 0 apps` in the log.
  - **npm** uses the `downloads.weekly`/`monthly` already in the registry search response (the downloads API rejects scoped packages in bulk). Counts are gameable and the keywords match plugins/MCP servers too; the prompt tells the LLM to filter those.
- **Stealth models** (daily, top of `ai-agents`): `isStealthModel` matches a `stealth/` id prefix, or a description saying "cloaked"/"anonymous"/"stealth" … "model", in the official `/api/v1/models` catalog. `buildStealthSection` (`src/report-builders.ts`) renders it deterministically — not by the LLM — via the `preamble` of `buildProjectReportContent`. It always appears: 🆕 = listed within 2 days, ⏳ = `expiration_date` within 3 days, and "catalog unavailable" is distinct from "none listed". The cron itself runs on a stealth model, so a ⏳ on that row means `OPENROUTER_MODEL` needs replacing.
- **HN**: Firebase API (`/v0/topstories.json`) — scans top 500 stories in batches of 50, filters for AI keywords, top 30 by points
- **ArXiv**: ArXiv API (Atom XML) — queries cs.AI, cs.CL, cs.LG categories for the newest papers from the last 48h
- **Community** (weekly): Dev.to (5 AI tags, top of the week) + Lobste.rs (`/t/ai.json`, `/t/ml.json`, last 7 days) — technical articles and community discussions
- **HF**: Hugging Face Hub trending models — **weekly**. The Hub list is ranked by cumulative downloads and 90.5% of a day's models carried over from the previous day, so daily generation was re-summarizing the same table.

## Key conventions

- All fixed report strings (titles, labels, footers, messages) are centralized in `src/i18n.ts`. Reports are English-only: one file, one GitHub issue per report.
- LLM prompt builders are split across two files: `src/prompts.ts` (repo-level prompts) and `src/prompts-data.ts` (data-source prompts). Each report type has its own builder function.
- Weekly and monthly rollups were removed in July 2026. `ai-weekly`/`ai-monthly` remain in `REPORT_LABELS` (`src/i18n.ts`) and `REPORT_FILES` (`src/generate-manifest.ts`) only so archived reports stay reachable — do not add generation code back. The same goes for `ai-cli` and `ai-ph` (retired October 2026). `REPORT_LABELS` titles stay cadence-neutral because the archive holds both daily and weekly editions.
- **Weekly vs daily.** Infra, Trending, Community, HF and Skills run only when `isWeeklyRun` (`src/date.ts`) is true — fetch and report both, except that Trending is fetched daily for agent news. Measured over September 2026: 54% of trending links and 45% of community links repeated from the previous day, and 5 of 6 infra projects shipped no release on a given day. Product Hunt was dropped (mostly consumer apps); ArXiv stays daily pending a quality-ranked replacement.
- **Agents and infra reports cover releases, hot issues and news only — no issue/PR churn.** The old per-repo summaries mostly restated ongoing themes ("X remains focused on…"). The pieces:
  - Stable releases only; `isPrerelease` checks the API flag and the tag (`nightly`, `alpha`, `beta`, `rc`, `preview`, `canary`, `.dev`) because several projects publish nightlies as normal releases. Prereleases are counted in the header, never sent to the model.
  - `fetchHotIssues` uses the search API (the issues list can only filter by update time). Hot = opened in the window (widened to at least 48h — engagement takes days to build) and `comments + 👍` ≥ 10, or ≥ 3 with a regression/security label; max 2 per repo. Search allows 30 requests/minute, shared with trending's 6 topic queries; a failed hot-issue fetch degrades to none, it never discards the releases.
  - `matchAgentNews` drops an item that names 3+ agents: it is a compatibility list ("works with Claude Code, Codex, OpenCode…"), not news.
  - One LLM call per report over the active projects; quiet projects are listed in one line by `buildProjectReportContent`. The issue body is the full report (no brief variant).
- `callLlm(prompt, maxTokens?)` defaults to 4096 tokens. Web and trending reports use 8192. The agents/infra reports and the table-formatted listing reports (HN, ArXiv, HF, Community) use `LLM_TOKENS_LISTING` = 6144.
- The Skills prompt carries a hard length cap (`REPO_LENGTH_RULE`, ~300 words, max 3 bullets per section). Before such caps the old per-repo reports ran 77–114 KB and hit GitHub's 64 KB issue body limit.
- Data-source listing reports (Trending, HN, ArXiv, HF, Community) render their item lists as **Markdown tables** (not bullet lists). Numeric columns are copied verbatim from the fetched data; the summary column is 2 sentences. Tables already have CSS in `index.html` and render natively in GitHub Issues too.
- `callLlm` retries on two error classes, with separate budgets; the concurrency slot is released during every wait.
  - **429** — 3 retries, 5 s / 10 s / 20 s. A rate limit clears in seconds.
  - **Connection failure** (DNS/TCP/TLS, detected by `isConnectionError` walking the SDK's `cause` chain) — 6 retries, 5 / 10 / 20 / 40 / 60 / 60 s, capped by `RETRY_MAX_MS`. A network outage between the runner and the provider lasts minutes, not seconds. On 2026-09-03 the DashScope cn-beijing endpoint was unreachable from the GitHub runner for the whole LLM phase; the old shared 3-retry ladder gave up 35 s in and the run published a digest of nothing but "generation failed" placeholders.
- Every LLM call site degrades gracefully (a failed summary becomes a fixed notice), which is right per report and wrong for the run as a whole. `llmStats` in `src/report.ts` counts attempts and final failures across the run, and `assertLlmHealthy(stage)` throws when at least `LLM_MIN_SAMPLES` (3) calls have run and at least `LLM_ABORT_RATIO` (50%) of them failed. `main()` calls it at two gates — after the summary phase and after the save phase — so a provider outage exits non-zero _before_ anything is committed, no issues are opened and no Telegram message is sent. A missing day is recoverable by `workflow_dispatch`; a published day of placeholders is not. `LLM_MIN_SAMPLES` was 5 when a run made ~30 calls; a daily run now makes 3–4 (agents, HN, ArXiv, web), so the first gate only arms on the weekly run and the second gate needs the lower floor to arm at all.
- `reportLlmHealth()` logs the final tally and, when any call was lost, appends a warning to `$GITHUB_STEP_SUMMARY` so a partially degraded run is visible on the Actions run page without a log dive.
- The concurrency limiter (`LLM_CONCURRENCY = 5`) prevents 429s when many parallel LLM calls fire. Do not bypass it by calling SDK clients directly.
- LLM provider is selected via `LLM_PROVIDER` env var (default: `anthropic`). Valid values: `anthropic`, `openai`, `github-copilot`, `openrouter`, `deepseek`, `qwen`.
- The daily GitHub Actions run uses `openrouter` with the free stealth model `stealth/space-bunny-alpha` and `OPENROUTER_REASONING_EFFORT=low`. Without the low effort this reasoning model spends the whole `max_tokens` budget on reasoning and returns empty content (`finish_reason: "length"`) — the 2026-10-02 test run lost 19/21 calls that way. Stealth models can be withdrawn without notice; when that happens the LLM health gate aborts the run, and the fix is a new `OPENROUTER_MODEL` in the workflow.
- The daily workflow only ever produces one digest per CST day. Two mechanisms enforce it: a workflow-level `concurrency: daily-digest` group (`cancel-in-progress: false`) serializes overlapping runs, and a `guard` job skips **scheduled** runs whose `digests/YYYY-MM-DD` folder is already committed (checked via `gh api .../contents/...`, so no second checkout). `workflow_dispatch` always proceeds — that is the escape hatch for regenerating a day. This exists because GitHub delayed the 2026-08-26 scheduled run by 5h07m; the manual catch-up run and the late scheduled run both completed and opened 18 duplicate issues for 2026-08-27.
- Provider implementations live in `src/providers/`. Each file implements the `LlmProvider` interface. The factory in `src/providers/index.ts` validates the provider name and logs only the provider name — never API keys or endpoint URLs.
- `closeSupersededIssues` in `src/github.ts` (run by `pnpm close-stale`, the workflow's last step) keeps only the most recent digest day's issues open and closes the rest — per retention group: all daily labels form one group, each weekly label (`infra`, `trending`, `community`, `hf`) its own, so Monday's weekly issues stay open until the next Monday. The retained day is the newest **open digest issue**, not today's date, so a failed run leaves yesterday's reports up instead of closing everything. Days are compared as CST dates via `toCstDateStr`, matching the `digests/YYYY-MM-DD` folders — a delayed cron and its manual catch-up run land on the same day and are both retained. Eligibility requires a label in `ISSUE_LABELS` (plus the legacy `weekly`/`monthly`, and `digest`/`openclaw`/`ph` from the reports retired in October 2026), and pull requests are excluded: the `/issues` REST endpoint returns PRs too, and the previous `closeStaleIssues` would have closed any open PR older than its cutoff.
- GitHub issue label colors are defined in `LABEL_COLORS` in `src/github.ts`. Add new labels there.
- Web state (`digests/web-state.json`) is committed to git on every run. It is the source of truth for which URLs have been seen. `saveWebReport` writes it once at the end, regardless of whether a report was generated.
- Tracked repos are pruned when they go quiet. (Since October 2026 a quiet agent costs nothing — it lands in the report's "Quiet today" line — so pruning is less pressing.) Removed August 2026 after an activity audit:
  - `deepseek-harness` — Issues/PRs disabled upstream and the Discussions board dormant: 13/13 days of zero data.
  - `zeptoclaw`, `nullclaw` — no upstream push for 30+ days; 90% and 50% of days had no activity at all.
  - `nanobot`, `nanoclaw`, `lobsterai`, `codewhale` — 17–37 items per 24h, well under the 30-issue + 20-PR prompt sample, so the model was padding a full 8-section report out of a handful of items.
  - `picoclaw`, `moltis` — removed by maintainer decision alongside the above.
  - Same audit fixed two renames: `qwibitai/nanoclaw` → `nanocoai/nanoclaw`, `agentscope-ai/CoPaw` → `agentscope-ai/QwenPaw`.

## Web UI & RSS Feed

- Web UI: `index.html` reads `manifest.json` to build the sidebar, then fetches `digests/YYYY-MM-DD/report.md` on demand.
- RSS Feed: `feed.xml` at the repo root. Generated by `src/generate-manifest.ts` in the same `pnpm manifest` step. Contains the latest 30 items (newest first) across all report types. Item links use hash routing: `https://dboeter.github.io/daily-diff/#YYYY-MM-DD/report`.
- Both `manifest.json` and `feed.xml` are committed together in the "Commit manifest and feed" GHA step.
- The `REPORT_LABELS` map in `src/i18n.ts` must be kept in sync with the `LABELS` object in `index.html` when adding new report types.

## Adding a new report type

1. Create a data fetcher (or add to an existing one). For a repo-backed report, add the section to `RawConfig`/`RadarConfig` and `loadConfig` in `src/config.ts` — a `config.yml` section with no schema entry is silently ignored. Decide daily vs weekly: a weekly report gates its fetch and save on `isWeeklyRun`, and its label goes in `WEEKLY_ISSUE_LABELS` in `src/github.ts`.
2. Add a `buildXxxPrompt` function in `src/prompts-data.ts` (for data-source prompts) or `src/prompts.ts` (for repo-level prompts).
3. Add strings (titles, labels, issue title function) to `src/i18n.ts`.
4. Add a `saveXxxReport` function in `src/report-savers.ts`.
5. Wire into `fetchAllData`, `generateSummaries`, and the save phase in `src/index.ts`.
6. Add a label color entry in `LABEL_COLORS` in `src/github.ts`.
7. Add the report ID and label to `REPORT_LABELS` in `src/i18n.ts` and `LABELS` in `index.html`.
8. Add the report file name to `REPORT_FILES` in `src/generate-manifest.ts`.
9. Update README.md and this file.
