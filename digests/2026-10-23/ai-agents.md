# AI Agents 2026-10-23

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-23) · **🤖 AI Agents** · [🧠 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-23/ai-models) · [⚖️ AI Policy](https://dboeter.github.io/daily-diff/#2026-10-23/ai-policy) · [🗄️ Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-23/ai-data)

> Generated: 2026-10-22 23:49 UTC | Projects: 16 | Active today: 7 | Stable releases: 5 | Prereleases (not covered): 6

---

## Highlights

- **Claude Code v2.1.308–309** patches sandbox escapes: startup files no longer run outside the sandbox on macOS and Linux, `denyWrite` globs work behind symlinks, and sandboxed commands can no longer modify the passed MCP config
- **OpenAI Codex** regression blocks new chats on macOS and in Windows Worktree mode with a "Cannot serialize value" error; Local mode remains functional
- **Voxtral 3** launches as Mistral's voice agent SDK supporting real-time speech in 50+ languages, emotional TTS, accurate transcription, and deep tool use
- **OpenShell** gains traction as a dedicated secure runtime for autonomous agent fleets, drawing strong community interest around agent sandboxing infrastructure
- **Kilo Code jetbrains/v7.1.12** adds project-scoped usage aggregation with a pageable API, custom auto-routers with local evals, a session host registry, and Kilo Cloud session adapter

---

## Coding Agents & Assistants

### Claude Code
- **Release**: [v2.1.308](https://github.com/anthropics/claude-code/releases/tag/v2.1.308)–[v2.1.309](https://github.com/anthropics/claude-code/releases/tag/v2.1.309) fix sandboxed Bash commands running startup files outside the sandbox on macOS and Linux, correct `denyWrite` glob patterns behind symlinks, and stop sandboxed commands and auto-accepted edits from modifying the MCP config passed with `--mcp-conf`.
- **News**: [agent-usage-guard](https://news.ycombinator.com/item?id=50198936) is a Claude Code mod that protects your usage window, helping users avoid burning through their Claude Code subscription limit.

### OpenAI Codex
- **Hot issue**: New chats fail with "Cannot serialize value" on macOS ([#55744](https://github.com/openai/codex/issues/55744), closed) and in Windows Worktree mode ([#55827](https://github.com/openai/codex/issues/55827), open), while Local mode works, indicating a cross-platform serialization bug in chat initialization.

### Kilo Code
- **Release**: [jetbrains/v7.1.12](https://github.com/Kilo-Org/kilocode/releases/tag/jetbrains/v7.1.12) adds project-scoped agent usage aggregation with a pageable HTTP API, custom auto routers with client models and local evals, a session host registry and Kilo Cloud session adapter, base-branch fetching in the Agent Manager, and prompt-navigator sync fixes.

### OpenCode
- **Release**: [v1.19.4](https://github.com/anomalyco/opencode/releases/tag/v1.19.4) upgrades the bundled Bun runtime to 1.4.4, patching security vulnerabilities in Brotli, TLS, HTTP/1.1–3, WebSocket, and `fetch`, and updating root certificates to NSS 3.131.1.

### jcode
- **Release**: [v0.99.1](https://github.com/1jehuang/jcode/releases/tag/v0.99.1) fixes OpenAI models failing every turn with `invalid_request_error` from rejected tool schemas, lets the TUI recover from a vanished or unresponsive server, adds Native Muse login and Venice AI provider support, configurable Kagi web search, and persistent `/latex` rendering controls.

### Hermes Agent
- **Hot issue**: A closed certifi issue ([#142307](https://github.com/nousresearch/hermes-agent/issues/142307)) left Hermes trusting compromised eMudhra intermediate CAs, while an open redaction bug ([#142852](https://github.com/nousresearch/hermes-agent/issues/142852)) leaks prefix tokens followed by an underscore through a shared lookahead regex.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Pi](https://github.com/earendil-works/pi), [Oh My Pi](https://github.com/can1357/oh-my-pi), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

### OpenShell
- **News**: Hacker News features OpenShell as a safe, private runtime for fleets of autonomous AI agents, highlighting its focus on secure agent execution at scale. The discussion (268 points, 138 comments) signals strong community interest in dedicated agent sandboxing infrastructure. [Hacker News](https://news.ycombinator.com/item?id=50198675)

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Voxtral 3](https://mistral.ai/news/voxtral-3/) | Hacker News | [767 points, 200 comments](https://news.ycombinator.com/item?id=50168396) | Voxtral 3: Mistral's voice agent SDK for real-time speech in 50+ languages, accurate transcription, emotional TTS, deep tool use. |
| [Claude Duet](https://claude.com/product/claude-duet) | Hacker News | [545 points, 510 comments](https://news.ycombinator.com/item?id=50186037) | Claude Duet is a personal AI agent you message. It handles your inbox, calendar and follow-ups and messages you when something needs you. |
| [Patch the Planet: global response coordination as agents uncover vulnerabilities](https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities/) | Hacker News | [262 points, 183 comments](https://news.ycombinator.com/item?id=50181175) | — |
| [RuneScape Bench: MMOs for Agents [video]](https://www.youtube.com/watch?v=cNm4zyUtWj0) | Hacker News | [248 points, 82 comments](https://news.ycombinator.com/item?id=50136126) | — |
| [OpenAI CLI](https://github.com/openai/openai-cli) | Hacker News | [229 points, 109 comments](https://news.ycombinator.com/item?id=50191507) | Official CLI for the OpenAI API. Contribute to openai/openai-cli development by creating an account on GitHub. |
| [Using LLM for confidence scoring is a bad idea](https://rumple.github.io/blog/2026/10/20/asking-llm-for-confidence.html) | Hacker News | [200 points, 99 comments](https://news.ycombinator.com/item?id=50176082) | LLM-based agents can do a lot of tasks. Or, at least, they can appear to do them. |
| [Idempotency keys for AI agents: why hashing the arguments doesn't work](https://dev.to/anis_meziani_52aab42304a8/idempotency-keys-for-ai-agents-why-hashing-the-arguments-doesnt-work-cap) | Dev.to | [26 reactions, 31 comments](https://dev.to/anis_meziani_52aab42304a8/idempotency-keys-for-ai-agents-why-hashing-the-arguments-doesnt-work-cap) | When an agent replays a run, the model rewrites the email and the hash changes. Here's why idempotency keys must come from stable intent, never from generated content. |
| [I Explored Respan Gateway: A Plugin-First, Open-Source LLM Gateway](https://dev.to/devstackhub/i-explored-respan-gateway-a-plugin-first-open-source-llm-gateway-4d6b) | Dev.to | [25 reactions, 18 comments](https://dev.to/devstackhub/i-explored-respan-gateway-a-plugin-first-open-source-llm-gateway-4d6b) | Every time I connect an application to a new LLM provider, I run into the same problem: how much... |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*