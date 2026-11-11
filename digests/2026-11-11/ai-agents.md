# AI Agents 2026-11-11

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-11) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-11/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-11/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-11/ai-data)

> Projects: 15 | Active today: 8 | Stable releases: 7 | Prereleases (not covered): 6 | Generated: 2026-11-11 05:56 UTC

---

## Highlights

- OpenShell v0.1.8 introduces breaking changes: static provider credentials now require explicit `auth_style` declarations, REST endpoints return 403 for HTTP upgrade requests, OCSF sandbox attribution fields move to `resources` or `unmapped`, sandboxes fail when filesystem policies traverse symlinks in writable workspaces, and IPv4-mapped IPv6 destinations are evaluated as IPv4; the Python SDK moves to `ai-openshell/sdk-python` and the Go SDK module is deprecated.
- Users report the OpenAI Codex VS Code extension fails to start its UI on Windows after upgrading to v26.51021.22027; rolling back to v26.51007.21434 restores function (78 comments, 85 👍).
- Users report `DISABLE_TELEMETRY=1` prevents feature flags from loading in Claude Code, causing the `/model` picker to hide Fable 5.2 and fall back to compiled defaults.

---

## Coding Agents & Assistants

### Claude Code

- **Hot issue:** [#108726](https://github.com/anthropics/claude-code/issues/108726): users report that `DISABLE_TELEMETRY=1` prevents feature flags from loading, causing the `/model` picker to hide Fable 5.2 and fall back to compiled defaults. (5 comments, 12 👍; +17 in the last 24h)
- **Hot issue:** [#89673](https://github.com/anthropics/claude-code/issues/89673): users request an option in the Desktop app to make Enter insert a newline and Ctrl+Enter submit, matching common chat conventions; the existing `keybindings.json` works only in the terminal TUI. (24 comments, 104 👍; +11 in the last 24h)

### OpenAI Codex

- **Release:** [rust-v0.167.1](https://github.com/openai/codex/releases/tag/rust-v0.167.1)
- **Hot issue:** [#56655](https://github.com/openai/codex/issues/56655): users report the VS Code extension fails to start its UI on Windows after upgrading to v26.51021.22027; rolling back to v26.51007.21434 restores function. (78 comments, 85 👍; +27 in the last 24h)
- **News:** [Show HN: Cosh – An open-source AI agent orchestrator](https://news.ycombinator.com/item?id=50439141) mentions Codex as one of the external agents Cosh integrates with.

### Gemini CLI

- **Release:** [v0.68.0](https://github.com/google-gemini/gemini-cli/releases/tag/v0.68.0) fixes case-insensitive root detection on Windows, surrogate-pair handling in display truncation, `.git/info/exclude` honoring in shadow repos, 429 rate-limit countdown in the loading indicator, and preserves the selected model across fallback and rewind.

### OpenCode

- **Release:** [v2.2.7](https://github.com/anomalyco/opencode/releases/tag/v2.2.7) removes `ImageResponse.image` (use `response.images[0]`), adds GitHub Copilot Auto model picking, side-panel tab shortcuts (`⌘W`, `⌥⌘W`, `⌘⇧T`), session read/unread marking, MCP login persistence across concurrent refreshes, negative `read` offsets, and file-not-found suggestions.

### Pi

- **Release:** [v1.5.2](https://github.com/earendil-works/pi/releases/tag/v1.5.2) adds forking sessions whose original folder is gone, changes the missing-directory prompt to offer Continue/Fork/Cancel, and fixes `/import` leaving duplicate session files and an outdated Claude Code version in Anthropic OAuth requests.

### Oh My Pi

- **Release:** [v18.18.8](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.8)–[v18.18.7](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.7) removes `getConfigAgentDirName()`, adds LiteLLM usage adapter with key/user budgets, login-warning auth rule for risky accounts, Muse Ember model with reasoning ladder, per-window saved-reset auto-redeem settings, and fixes Morph session-id header, Claude Fable limit reporting, and child-browser isolation.

### Hermes Agent

- **Hot issue:** [#152674](https://github.com/NousResearch/hermes-agent/issues/152674): an issue says the Desktop app loses the logged-in Nous user identity — the server mints a correct ws ticket but chat messages are admitted as `uid:10000` for two different accounts after full restarts and storage cleanup. (type/security; 3 comments, 0 👍; +3 in the last 24h)

**Quiet today:** [Kilo Code](https://github.com/Kilo-Org/kilocode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

### OpenShell

- **Release:** [v0.1.8](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8) makes several breaking changes: static provider credentials now require explicit `auth_style` placement declarations for custom headers, query parameters, and path slots; REST endpoints return `403` for HTTP upgrade requests; OCSF sandbox attribution fields move to `resources` entries or `unmapped` fields; sandboxes fail to launch when filesystem policies traverse symlinks in writable workspaces; and IPv4-mapped IPv6 destinations are evaluated as IPv4.
- **Release:** The `openshell` Python SDK is now published from `ai-openshell/sdk-python` (install via `pip install openshell`), and the Go SDK module `github.com/NVIDIA/OpenShell/sdk/go` is deprecated in favor of `github.com/ai-openshell/sdk-go`.
- **Release:** WebSocket traffic must be configured with `protocol: websocket` and explicit handshake/message rules; `websocket_credential_rewrite: true` now requires a WebSocket endpoint.

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/conductor-oss/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: Get your coding agent off ~2019 JavaScript, onto modern web primitives ([GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)) | Hacker News | [322 points, 98 comments](https://news.ycombinator.com/item?id=50443812) | A Show HN project that updates coding agents from roughly 2019-era JavaScript to modern web primitives. |
| [Life on Claude Nine](https://babuschk.in/posts/2026-01-25-life-on-claude-nine.html) | Hacker News | [96 points, 57 comments](https://news.ycombinator.com/item?id=50443587) | The author describes adopting Claude for daily life, beginning with email automation. |
| [Show HN: AI agents that barter your stuff for things you want](https://barterpilot.com/) | Hacker News | [6 points, 4 comments](https://news.ycombinator.com/item?id=50446649) | A Show HN service where AI agents barter listed personal items for desired goods, treating possessions as currency. |
| [Detecting Flaky Tests and Finding Their Root Causes with Strands Agents and Gemini](https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan) | Dev.to | [48 reactions, 5 comments](https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan) | The author explores detecting flaky tests and identifying root causes using Strands Agents and Gemini. |
| [Once Upon Agentic AI (Part 1): Create your own agent and forge its tools with Strands Agents](https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo) | Dev.to | [23 reactions, 3 comments](https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo) | A tutorial (Part 1) on building a custom agent and its tools with the Strands Agents framework. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*