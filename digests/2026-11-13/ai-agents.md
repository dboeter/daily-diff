# AI Agents 2026-11-13

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-13) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-13/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-13/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-13/ai-data)

> Projects: 15 | Active today: 4 | Stable releases: 3 | Prereleases (not covered): 3 | Generated: 2026-11-13 06:24 UTC

---

## Highlights

- Claude Code v2.1.323 silently removed `subagentStatusLine` with no replacement, hiding per-subagent context, cost, model, effort, and status; users report the regression arrived without warning or migration path.
- Oh My Pi v18.20.0 introduces breaking changes: `secrets.yml` regex rules now use Rust `regex` patterns (no lookarounds/backreferences), secret placeholders become four camelCased words without `$$` delimiters, and `task.file`/`taskFile` fields are removed.
- OpenAI Codex rust-v0.168.0 adds model provider browsing in Sessions, TUI workspace split view, audio recording attachments, animated GIF generation, fullscreen image previews in tmux on Ghostty/Kitty, and `tui.notification_method = "osc777"` for terminal notifications.

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) adds Code Mode (experimental opt-in for JavaScript tool calls), plugin version validation via `engines["claude-code"]`, TypeScript hook type checking in `claude plugin validate`, `.docx` support for Artifact uploads, and new environment variables including `CLAUDE_CODE_DISABLE_AGENT_PROGRESS_SUMMARIES` and `CLAUDE_CODE_RESUME_HINT_COMMAND`.
- **Hot issue:** [#109446](https://github.com/anthropics/claude-code/issues/109446): an issue says 2.1.323 silently removed `subagentStatusLine` with no replacement, hiding per-subagent context, cost, model, effort, and status. (regression; 2 comments, 2 👍; +4 in the last 24h)
- **News:** [Anthropic carelessly killed a Claude Code feature users built on, no warning](https://news.ycombinator.com/item?id=50477704) reports the regression removing `subagentStatusLine` without warning or migration path.
- **Hot issue:** [#84862](https://github.com/anthropics/claude-code/issues/84862): [FEATURE] Passkey (WebAuthn) sign-in for Claude accounts, across every surface (37 comments, 185 👍; +11 since 2026-11-11)

### OpenAI Codex

- **Release:** [rust-v0.168.0](https://github.com/openai/codex/releases/tag/rust-v0.168.0) adds model provider browsing in Sessions, TUI workspace split view via `features.tui_workspace`, audio recording attachments, animated GIF generation via `features.image_generation_animation`, fullscreen image previews in tmux on Ghostty/Kitty, and `tui.notification_method = "osc777"` for terminal notifications.

### Pi

- **News:** [Pi GPUI: A native GUI for the pi coding agent, built with Rust and GPUI.](https://news.ycombinator.com/item?id=50464872) announces a native GUI for the pi coding agent built with Rust and GPUI for macOS and Linux.

### Oh My Pi

- **Release:** [v18.20.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.0) breaks `secrets.yml` regex rules (now Rust `regex` patterns, no lookarounds/backreferences, `(?P …)` marks redacted part), changes secret placeholders to four camelCased words without `$$` delimiters, makes model output from placeholders byte-identical on replay, and removes `task.file` and `taskFile` field.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Foundation Models framework](https://developer.apple.com/foundation-models-framework/) | Hacker News | [181 points, 26 comments](https://news.ycombinator.com/item?id=50474361) | Apple released a native Swift API called Foundation Models for integrating any large language model directly into apps. |
| [Show HN: AgentRun – open-source, Self-improving Managed Agents](https://github.com/Parcha-ai/agentrun/blob/main/README.md) | Hacker News | [90 points, 25 comments](https://news.ycombinator.com/item?id=50471650) | AgentRun is an open-source platform that adds self-improvement, durable execution, and a control plane on top of existing agent harnesses. |
| [Durable Execution Agents](https://martinfowler.com/articles/durable-execution-agents.html) | Hacker News | [5 points, 0 comments](https://news.ycombinator.com/item?id=50462904) | — |
| [MCP Is Dead Simple. And That's Exactly the Problem](https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811) | Dev.to | [97 reactions, 61 comments](https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811) | The article examines Model Context Protocol (MCP), questioning what it is and whether its simplicity masks deeper implementation problems. |
| [Your MCP Servers Are Silently Draining Your Context Window: The Hidden Cost of Tool-Heavy AI Agents](https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl) | Dev.to | [42 reactions, 16 comments](https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl) | Attaching dozens of MCP tools to agents degrades LLM reasoning and inflates API costs, while small TypeScript micro-tools can mitigate the issue. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*