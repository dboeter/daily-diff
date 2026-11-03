# AI Agents 2026-11-03

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-03) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-03/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-03/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-03/ai-data)

> Projects: 16 | Active today: 5 | Stable releases: 4 | Prereleases (not covered): 9 | Generated: 2026-11-03 06:30 UTC

---

## Highlights

- Pi v1.5.0 breaks tool argument validation — TypeBox features outside JSON Schema no longer apply, plain JSON Schema tools get same coercion as TypeBox tools, validation errors show pi-schema messages instead of TypeBox messages
- − Oh My Pi v18.16.0 removes PI_TOKENIZER_ACCURATE (all models now use native tokenizer), replaces Editor.prediction with Editor.predictions, and deprecates compaction utilities in favor of @oh-my-pi/snapcompact
- Hermes Agent v0.22.6 rolls up ~776 PRs adding webapp served from gateway, /model reset, per-skill locks, opt-in OS-keychain vault storage, agent-picked ElevenLabs voices, pre_llm_call hook, and resumable downloads

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.317](https://github.com/anthropics/claude-code/releases/tag/v2.1.317) fixes project and local MCP servers disconnecting after the first turn in desktop sessions, fixes auto mode failing on 403/422 from LLM gateways, fixes `claude auth status` exiting before slow token refresh saves, and fixes `effortLevel` setting ignored by pre-started sessions.
- **Release:** Adds warnings for `/schedule` when cloud tasks get unrequested connectors, adds confirmation before web/shell tools send account email, adds `onFailure: "block"` for Agent SDK hook callbacks, and adds cost report API `GET /v1/organizations/analytics/cost` for admin gateways.
- **Hot issue:** [#18435](https://github.com/anthropics/claude-code/issues/18435): users report inability to switch between multiple Claude accounts in Desktop without signing out and losing context, requesting native profile switching like Slack workspaces. (230 comments, 987 👍; +10 since 2026-11-01)
- **Hot issue:** [#88391](https://github.com/anthropics/claude-code/issues/88391): users report prompt suggestions silently stopped appearing in Desktop on 2026-08-18 (regression in 2.1.229), with no error or local override since a server-side feature gate controls it. (regression; 18 comments, 18 👍; +3 since 2026-11-01)

### OpenAI Codex

- **Hot issue:** [#58302](https://github.com/openai/codex/issues/58302): users report XLSX attachments stay pending with spinning send control on macOS desktop version 26.1027.30824, and the composer stops accepting typing until the app is restarted. (17 comments, 1 👍; +11 in the last 24h)

### Pi

- **Release:** [v1.5.0](https://github.com/earendil-works/pi/releases/tag/v1.5.0) breaks tool argument validation: TypeBox features outside JSON Schema no longer apply, plain JSON Schema tools now get same coercion as TypeBox tools, and validation errors show pi-schema messages instead of TypeBox messages.
- **Release:** Adds extension update changelogs on fresh launch, faster incremental streaming for large tool calls and code-heavy answers, custom self-update commands via `PI_SELF_UPDATE_COMMAND`, and GPT-6.1 Terra model support with 500K context via Codex.

### Oh My Pi

- **Release:** [v18.16.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.16.0) removes `PI_TOKENIZER_ACCURATE` (every model now uses native tokenizer), changes `buildExecutionFrame` to set loader into `bottomBorder` directly, replaces `Editor.prediction` with `Editor.predictions` returning all predictions, and deprecates several compaction utilities in favor of `@oh-my-pi/snapcompact`.
- **Release:** Fixes context estimates for models without known tokenizer (Gemini, Grok) to use o200k_base instead of 4 bytes/token, which undercounted by 11–48% on code sessions, and fixes estimates no longer charging for another model's thinking signatures when switching providers.

### Hermes Agent

- **Release:** [v0.22.6](https://github.com/nousresearch/hermes-agent/releases/tag/v0.22.6) rolls up ~776 PRs since v0.22.5 including webapp served from gateway listener, `/model reset` to clear model pin without losing history, per-skill locks against autonomous writes, opt-in prepared compaction, `hermes cron cancel` with missed-run policy, `/delegation` choices saved across sessions, `hermes migrate` for Grok Bot and OpenBot users, opt-in OS-keychain vault key storage, agent-picked ElevenLabs voices, `pre_llm_call` hook, desktop group chat improvements, Telegram video notes, Slack emoji reactions in threads, and resumable downloads in package manager.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Launch HN: Momentic (YC W24) – Agents that catch bugs by using your app](https://momentic.ai/) | Hacker News | [137 points, 92 comments](https://news.ycombinator.com/item?id=50339913) | Momentic launches Mo, an AI QA engineer that automatically finds bugs in web, iOS, and Android apps with repro steps and converts each run into regression tests for every pull request. |
| [Last night an AI agent performed brain surgery on a mouse](https://twitter.com/OcanaSantero/status/2115442964574908902) | Hacker News | [128 points, 101 comments](https://news.ycombinator.com/item?id=50336138) | An AI agent autonomously performed brain surgery on a mouse, selecting among 19 gene‑therapy vectors and deriving target coordinates to reduce seizures. |
| [Show HN: Better Together – AI agents team up against spam calls and texts](https://better-together.fun/) | Hacker News | [6 points, 0 comments](https://news.ycombinator.com/item?id=50331415) | Better Together introduces a system where multiple AI agents collaborate to block spam calls and texts, starting with that use case. |
| [AI Agents Still Can't Maintain Your Codebase](https://www.youtube.com/watch?v=ntO2eQ2iu6o) | Hacker News | [6 points, 0 comments](https://news.ycombinator.com/item?id=50337738) | — |
| [My Agent Gave the Right Answer. Then It Wrote Down That It Was Wrong.](https://dev.to/kenielzep97/my-agent-gave-the-right-answer-then-it-wrote-down-that-it-was-wrong-311d) | Dev.to | [17 reactions, 4 comments](https://dev.to/kenielzep97/my-agent-gave-the-right-answer-then-it-wrote-down-that-it-was-wrong-311d) | The author tested an AI agent with a fabricated query on October 31 at 15:15 Eastern and observed it initially answer correctly but then record that it was wrong. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*