# AI Agents 2026-10-16

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-16) · **🤖 AI Agents** · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-16/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-16/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-16/ai-web) · [⚖️ Policy Watch](https://dboeter.github.io/daily-diff/#2026-10-16/ai-policy)

> Generated: 2026-10-16 08:53 UTC | Projects: 16 | Active today: 10 | Stable releases: 11 | Prereleases (not covered): 1

---

## 🕵️ Stealth Models on OpenRouter

No stealth models listed on OpenRouter today.

---

## Coding Agents & Assistants

### Overview
Claude Code shipped a stable update adding usage‑limit controls, OpenTelemetry tracing guidance, and a vim motion, while users reported UI regressions such as the missing “Group by” option and forced‑hidden Routines sidebar. Kilo Code, OpenCode, Pi, Oh My Pi, and Cline all released new stable versions with features like gateway routing, upgrade‑policy fixes, session‑share destination selection, tokenizer improvements, and cloud‑session rollout. DeepSeek Harness issued an alpha prerelease with custom model‑reasoning UI and plugin‑index support, and Hermes Agent faces an open bug where a local session provider override incorrectly reuses a profile’s base URL. News highlighted the growing ecosystem around agent skills, with the scientific‑agent‑skills library trending and gaining traction across Claude Code, Codex, and other agents.

### Claude Code
- **Release**: v2.1.301 adds `CLAUDE_CODE_RETRY_WATCHDOG_MAX_USAGE_LIMIT_WAIT_MS` to cap unattended retries, OpenTelemetry tracing guidance for the `claude-api` skill, and the `%` vim motion to jump to matching brackets. https://github.com/anthropics/claude-code/releases/tag/v2.1.301
- **Hot issue**: Windows users report the “Group by” option removed from the Code tab sidebar, leaving sessions grouped only by environment. https://github.com/anthropics/claude-code/issues/102088
- **News**: The scientific‑agent‑skills library (177 validated skills, 100+ scientific databases) is compatible with Claude Code and is gaining traction on GitHub Trending. https://github.com/K-Dense-AI/scientific-agent-skills

### OpenAI Codex
- **News**: The scientific‑agent‑skills library, which bills itself as the #1 Agent Skills library for science, lists Codex among its supported agents and has surged in popularity on GitHub Trending. https://github.com/K-Dense-AI/scientific-agent-skills

### Kilo Code
- **Release**: v7.8.12 routes Kilo Gateway traffic through `https://ai-gateway.kilo.ai/api/v1` by default (configurable via `KILO_AI_GATEWAY_URL`), while the JetBrains v7.1.10 release adds agent‑model editing, transcript preview with live updates, and CLI‑session forking. https://github.com/Kilo-Org/kilocode/releases/tag/v7.8.12

### OpenCode
- **Release**: v1.19.2/1.19.1 locks updates to the 1.x line, improves upgrade handling for Yarn and Homebrew installs, and discontinues session sharing (existing share links no longer work). https://github.com/anomalyco/opencode/releases/tag/v1.19.2
- **Hot issue**: Closed reports describe the free tier being unusable after reinstall (“Endpoint not available” on ~50 % of requests) and the free model limited to OpenCode‑only usage. https://github.com/anomalyco/opencode/issues/55443

### Pi
- **Release**: v1.3.0 introduces a `sessionShareDestination` setting (`auto`, `gist`, or `radius`) to choose where `/share` uploads go. https://github.com/earendil-works/pi/releases/tag/v1.3.0

### Oh My Pi
- **Release**: v18.11.1 adds `Tokenizer.countLatestTurn` to count the latest assistant turn and `Agent.prioritizeSteering` to bring pending steering messages ahead of older ones. https://github.com/can1357/oh-my-pi/releases/tag/v18.11.1

### Cline
- **Release**: v4.1.25 rolls out Cline Cloud sessions (hosted sandbox tasks), makes Gemini 4 Argon the default provider when no model is chosen, enforces plugin execution in workers or sandboxes, restores Marketplace plugin loading, removes the Cloud sessions toggle, and adds mid‑stream retry logic (up to 3 attempts). https://github.com/cline/cline/releases/tag/v4.1.25

### DeepSeek Harness
- **Prerelease**: dsh‑v0.2.1‑alpha.4 adds UI‑based reasoning‑level configuration for custom API models, enables discovering/installing plugins from custom plugin‑index sources, fixes input glitches between commands and arguments, improves Office file delivery, and reduces Linux startup checks. https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-alpha.4

### Hermes Agent
- **Hot issue**: An open bug shows that a local `session.create` with an explicit `provider` but no `base_url` incorrectly reuses the profile’s stale `model.base_url`, sending the new provider’s key to the old endpoint and resulting in 401 errors. https://github.com/nousresearch/hermes-agent/issues/138843

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [jcode](https://github.com/1jehuang/jcode), [Command Code](https://github.com/CommandCodeAI/command-code)

---

## Agent Tooling

### Overview
Today, context-mode appeared on GitHub Trending, drawing significant attention for its context‑window optimizations aimed at AI coding agents. The project highlighted a 98% reduction in sandbox tool output, persistent session memory, and cross‑platform routing via MCP + hooks. No new stable releases or prereleases were issued, and no hot issues were reported. The surge in stars reflects growing interest in its approach to managing agent context.

### context-mode
- **News**: The project trended on GitHub, showcasing context‑window optimization for AI coding agents that cuts sandbox tool output by 98%, persists session memory, and enforces routing across 17 platforms via MCP + hooks (https://github.com/mksglu/context-mode).

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*