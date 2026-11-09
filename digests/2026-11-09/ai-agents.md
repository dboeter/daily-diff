# AI Agents 2026-11-09

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-09) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-09/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-09/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-09/ai-data) · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-09/ai-trends)

> Projects: 15 | Active today: 3 | Stable releases: 2 | Prereleases (not covered): 0 | Generated: 2026-11-09 06:01 UTC

---

## Highlights

- Oh My Pi v18.18.2–v18.18.3 introduces breaking changes: `ask` tool now accepts a single HTML form (`{ html }`) instead of `questions[]`; `AskToolDetails` becomes `{ answers, timedOut? }`; `QuestionResult` removed; `logoutCredential()` requires `AgentSession`; `SessionStorage.hasAssistantTurn()` replaced by `scanLines(path, visit)`. New features include `balanced` delegation bias, `ask` forms supporting images and free-text options, and `ui.formDialog(html, options)` extension.
- Goldman Sachs is pulling Claude Code from its bankers and traders.
- An article argues agent memory suffers from fragmentation analogous to pre-OpenTelemetry observability, with every tool storing memory in its own incompatible format (177 points, 105 comments on Hacker News).

---

## Coding Agents & Assistants

### Claude Code

- **News:** [Goldman Sachs is pulling Claude Code from its bankers and traders](https://news.ycombinator.com/item?id=50415628)
- **News:** [How I Fight AI Brain Fry](https://news.ycombinator.com/item?id=50416363) — describes terminal workflow strain when using Claude Code or Codex.

### OpenAI Codex

- **News:** [How I Fight AI Brain Fry](https://news.ycombinator.com/item?id=50416363) — describes terminal workflow strain when using Codex or Claude Code.

### Oh My Pi

- **Release:** [v18.18.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.2)–[v18.18.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.3): breaking — `ask` tool now takes a single HTML form (`{ html }`) instead of `questions[]`; `AskToolDetails` becomes { answers, timedOut? }; `QuestionResult` removed; `logoutCredential()` requires `AgentSession` and a scoped-model refresher; `SessionStorage.hasAssistantTurn()` replaced by `scanLines(path, visit)`. fixes — GenAI message-content capture from `.env` files works again; remote OpenAI compaction preparation and generic `/chat/completions` compaction retain correct model attribution; rotated credential pools report exhausted credential status correctly; OpenAI multi-image edits and Cursor xd:// device reads fixed. features — `balanced` delegation bias added; Tern right-click `ask` answer adds Note annotation; `task.eager` scopes to main agent only; `ask` forms support images (URL, data URI, local file, Mermaid) and "Other" free-text options; extension gains `ui.formDialog(html, options)`; `canReplayRemoteCompactionFrom()`, Cursor edit execution context, and Responses replay utilities added.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/conductor-oss/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Agent memory needs its OpenTelemetry moment](https://www.lorekit.io/blog/open-agent-memory-format) | Hacker News | [177 points, 105 comments](https://news.ycombinator.com/item?id=50411467) | The article argues that AI agent memory suffers from fragmentation similar to pre-OpenTelemetry observability, noting that every tool currently stores memory in its own incompatible format. |
| [Ask HN: How do you manage your AI agents' context across clients and projects?](https://news.ycombinator.com/item?id=50403153) | Hacker News | [35 points, 26 comments](https://news.ycombinator.com/item?id=50403153) | — |
| Show HN: LLM weight editing tool made by a 15-year-old ([Miyamoto-Renya/LaplacesScissors](https://github.com/Miyamoto-Renya/LaplacesScissors)) | Hacker News | [13 points, 2 comments](https://news.ycombinator.com/item?id=50409986) | — |
| [Linux-use – agent-first GUI control for Linux](https://javimosch.github.io/linux-use/) | Hacker News | [5 points, 0 comments](https://news.ycombinator.com/item?id=50390950) | The post introduces Linux-use, a single static binary built with MFL that gives agents CLI-first GUI control over Linux desktops via the AT-SPI2 accessibility tree. |
| [Building RailPulse AI: Deploying an Open-Source Railway Dispatch Agent with Gemma and Google Cloud Run](https://dev.to/gde/building-railpulse-ai-deploying-an-open-source-railway-dispatch-agent-with-gemma-and-google-cloud-2b9g) | Dev.to | [28 reactions, 23 comments](https://dev.to/gde/building-railpulse-ai-deploying-an-open-source-railway-dispatch-agent-with-gemma-and-google-cloud-2b9g) | The author, Robina Mirbahar, describes deploying RailPulse AI, an open-source railway dispatch agent powered by Gemma on Google Cloud Run. |
| [The Correct Timestamp Was in My Agent's Prompt. It Still Said We Were Talking.](https://dev.to/kenielzep97/the-correct-timestamp-was-in-my-agents-prompt-it-still-said-we-were-talking-eh7) | Dev.to | [23 reactions, 6 comments](https://dev.to/kenielzep97/the-correct-timestamp-was-in-my-agents-prompt-it-still-said-we-were-talking-eh7) | The author recounts a scheduled self-audit at 05:57 Eastern on November 6 where their agent received the correct timestamp in its prompt yet still claimed they were actively talking. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*