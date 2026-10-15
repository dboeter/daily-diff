# AI Agents 2026-10-15

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-15) · **🤖 AI Agents** · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-15/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-15/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-15/ai-web) · [⚖️ Policy Watch](https://dboeter.github.io/daily-diff/#2026-10-15/ai-policy)

> Generated: 2026-10-15 01:23 UTC | Projects: 16 | Active today: 9 | Stable releases: 9 | Prereleases (not covered): 6

---

## 🕵️ Stealth Models on OpenRouter

No stealth models listed on OpenRouter today.

---

## Coding Agents & Assistants

### Overview
Claude Code shipped v2.1.300 and v2.1.299 adding prompt decorations, cache token telemetry, and idle conversation compaction, while Windows desktop users report regressions in session grouping and missing context-window visibility. Hermes Agent delivered v0.22.0 "Threshold Release" (~24k commits) and a v0.22.1 patch, but a security issue exposes local llama-server API keys in plain-text logs. DeepSeek Harness prerelease dsh-v0.2.1-alpha.3 brings extensive fixes for session handling, plugin hot-reload, and web terminal reliability. jcode released three versions (v0.96.0–v0.98.1) focusing on idle performance, remote MCP connections, and markdown responses. OpenCode's desktop app freezes on tab clicks and free-tier users hit access blocks.

### Claude Code
- **Release**: v2.1.300 adds `virtualText` for prompt decorations, splits cache token metrics by 5m/1h lifetime in OpenTelemetry, and exposes `$.ui.view({ agentId })` for mods to show agent transcripts. v2.1.299 introduces `CLAUDE_CODE_DISABLE_FILE_MENTIONS` to pass paths instead of file contents, and idle compaction for 200K+ token conversations after ~54 minutes. [v2.1.300](https://github.com/anthropics/claude-code/releases/tag/v2.1.300) · [v2.1.299](https://github.com/anthropics/claude-code/releases/tag/v2.1.299)
- **Hot issue**: Windows Desktop 2.37337.1 removed "Group by" from Code tab sidebar — sessions now only group by environment. [#102088](https://github.com/anthropics/claude-code/issues/102088)
- **Hot issue**: Desktop app no longer shows context-window usage; footer ring and popover list only plan windows. [#102094](https://github.com/anthropics/claude-code/issues/102094)

### OpenCode
- **Hot issue**: Free tier users blocked with message "OpenCode's free tier can only be used from within OpenCode" even after reinstall. [#55443](https://github.com/anomalyco/opencode/issues/55443)
- **Hot issue**: Clicking any tab inside an open project freezes the desktop app to a blank white screen; only restart recovers. [#55324](https://github.com/anomalyco/opencode/issues/55324)

### Pi
- **News**: PI-Desktop project builds a local-first AI coding agent desktop using Electron, Rust host core, and Pi Agent Harness with user-installable plugins. [PI-Desktop](https://github.com/vastsa/PI-Desktop)

### Oh My Pi
- **Release**: v18.11.0 removes `ApprovalDetailsOptions` (compact approval prompt no longer shows tool details) and adds `AgentTool.delegationGuidance` for same-name extension replacements. [v18.11.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.11.0)

### jcode
- **Release**: v0.96.0–v0.98.1 range cuts idle CPU/disk reads in repos with many untracked files, shares model catalog processing across clients, enables markdown responses via `user_response` tool, adds remote MCP over HTTP/SSE with OAuth, and supports session collections with hidden reminders. [v0.98.1](https://github.com/1jehuang/jcode/releases/tag/v0.98.1) · [v0.97.0](https://github.com/1jehuang/jcode/releases/tag/v0.97.0) · [v0.96.0](https://github.com/1jehuang/jcode/releases/tag/v0.96.0)

### DeepSeek Harness
- **Prerelease**: dsh-v0.2.1-alpha.3 fixes session-switch blank areas, plugin hot-reload, macOS workspace path paste, Git worktree creation on older Git, web terminal input handling, and adds in-memory PTC Node mode for variable reuse across runs. API key priority changed: web/desktop prefer saved credentials; headless defaults to env/.env. [dsh-v0.2.1-alpha.3](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-alpha.3)
- **News**: DSHDesktop project provides a dedicated desktop wrapper for DeepSeek Harness. [dsh-desktop](https://github.com/dataelement/dsh-desktop)

### Hermes Agent
- **Release**: v0.22.0 "Threshold Release" (~24k commits, ~7k issues closed) overhauls the agent core; v0.22.1 patches Windows Store and plugin updates. [v0.22.0](https://github.com/nousresearch/hermes-agent/releases/tag/v0.22.0) · [v0.22.1](https://github.com/nousresearch/hermes-agent/releases/tag/v0.22.1)
- **Hot issue**: Local runtime supervisor logs llama-server command line including `--api-key` in plain text to `llama-server.log` on every spawn and crash-restart. [#137804](https://github.com/nousresearch/hermes-agent/issues/137804)

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

---

## Agent Tooling

### Overview
herdr shipped v0.9.5, a hotfix restoring prefix-key handling for Tern and CJK input methods on macOS as well as Ghostty’s `text:` keybinds after v0.9.4 broke them. The related issue (#5255) was closed the same day. Meanwhile, context-mode surged onto GitHub Trending with a pitch for 98% tool-output reduction, cross-platform session memory, and MCP-backed routing across 17 platforms.

### herdr
- **Release**: v0.9.5 fixes prefix shortcuts that stopped working in Tern, Chinese, Japanese, and Korean input methods on macOS, and with Ghostty `text:` keybinds that send the prefix and a key together. https://github.com/herdrdev/herdr/releases/tag/v0.9.5
- **Hot issue**: #5255 reported that Ctrl+B entered prefix mode but the following key was ignored in Tern; the bug was triaged, confirmed reproducible, and closed with the v0.9.5 fix. https://github.com/herdrdev/herdr/issues/5255

### context-mode
- **News**: GitHub Trending highlights context-mode as a context-window optimizer for AI coding agents, claiming 98% tool-output reduction, persistent session memory, and routing enforcement across 17 platforms via MCP and hooks. https://github.com/mksglu/context-mode

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*