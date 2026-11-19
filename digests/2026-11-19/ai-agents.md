# AI Agents 2026-11-19

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-19) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-19/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-19/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-19/ai-data)

> Projects: 15 | Active today: 6 | Stable releases: 4 | Prereleases skipped: 3 | Spotted: 4 | Generated: 2026-11-19 07:10 UTC

---

## Highlights

- Oh My Pi v19.0.0 ships as a breaking release, swapping `session.handoff(focus)` for `session.compact(focus, { mode: "handoff" })` (cancellable with `abortCompaction()`).
- Claude Code v2.1.328 introduces auto mode for Opus 4.6 and Sonnet 4.6, available on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry and the Claude apps gateway.
- An issue reports that in Codex desktop, an `input_audio` tool result with a data URL makes the next model request return HTTP 400, after which later text-only turns in the same chat also fail.

---

## Coding agents & assistants

### Claude Code

- **Release:** [v2.1.328](https://github.com/anthropics/claude-code/releases/tag/v2.1.328) adds auto mode for Claude Opus 4.6 and Sonnet 4.6 on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry and Claude apps gateway; interactive sessions with no permission mode now start in it. It also adds `"onFailure": "block"` for `mcp_tool` hooks, matching command and HTTP hooks, so a failed hook call blocks the action.

### OpenAI Codex

- **Hot issue:** [#62212](https://github.com/openai/codex/issues/62212): An issue reports that in Codex desktop a tool result containing an `input_audio` content item with a data URL makes the next model request return HTTP 400, and later text-only turns in the same chat then fail the same way. (17 comments, 0 👍; +17 in the last 24h)
- **News:** Hacker News item titled [The Codex Sandbox](https://news.ycombinator.com/item?id=50549758).

### Gemini CLI

- **Release:** [v0.69.0](https://github.com/google-gemini/gemini-cli/releases/tag/v0.69.0) fixes silent multi-minute loading hangs on network failures. It prevents terminal model-turn 400s on resume and main-thread JSONL freezes.

### Oh My Pi

- **Release:** [v19.0.0](https://github.com/can1357/oh-my-pi/releases/tag/v19.0.0) is a breaking release that replaces `session.handoff(focus)` with `session.compact(focus, { mode: "handoff" })`; `abortCompaction()` cancels it. Shared background processes move to one per-user daemon, and `omp ps` drops `--global` and reports global, project and session units together.
- **Hot issue:** [#18937](https://github.com/can1357/oh-my-pi/issues/18937): An issue reports that on Windows the bash tool's embedded shell lacks MSYS `.exe` suffix transparency, so `test -x "$JAVA_HOME/bin/java"` fails for a JDK that ships only `bin/java.exe` and the Gradle/Maven launchers abort with an invalid `JAVA_HOME` error, alongside related `uname`/`OSTYPE`, shebang and `env` parity gaps. (17 comments, 0 👍; +11 since 2026-11-17)

### jcode

- **Release:** [v1.0.1](https://github.com/1jehuang/jcode/releases/tag/v1.0.1) fixes model catalog updates being dropped when they arrive while an agent is busy, so newly released models such as GPT-6.2 Sol now appear in the model picker.

### DeepSeek Harness

- **Prerelease:** [dsh-v0.2.2-rc.5](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.5), a prerelease, makes DeepSeek models use DeepSeek's server-side search with no per-search charge, while other models default to the DeepSeek Search API.

**Quiet today:** [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

Nothing new from Agent tooling ([OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)) today.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [AI agents ask better questions than KPMG accountants in audit trial](https://europeanbusinessmagazine.com/ai-agents-better-questions-kpmg/) | Hacker News | [441 points, 189 comments](https://news.ycombinator.com/item?id=50547777) | — |
| [Launch HN: Maritime (YC F26) – A managed cloud for production AI agents](https://news.ycombinator.com/item?id=50549188) | Hacker News | [51 points, 44 comments](https://news.ycombinator.com/item?id=50549188) | — |
| [Is Coding with AI Actually Faster and Cheaper?](https://dev.to/sylwia-lask/is-coding-with-ai-actually-faster-and-cheaper-2810) | Dev.to | [130 reactions, 97 comments](https://dev.to/sylwia-lask/is-coding-with-ai-actually-faster-and-cheaper-2810) | The author asks whether coding with AI is actually faster and cheaper, focusing on coding agents. |
| [An MCP Tool Call Can Resolve and Still Fail](https://dev.to/gde/an-mcp-tool-call-can-resolve-and-still-fail-52kc) | Dev.to | [25 reactions, 28 comments](https://dev.to/gde/an-mcp-tool-call-can-resolve-and-still-fail-52kc) | The author describes how an MCP tool call can resolve and return a result with a completed tool span in the trace while still failing. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*