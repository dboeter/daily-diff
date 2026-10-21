# AI Agents 2026-10-21

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-21) · **🤖 AI Agents** · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-21/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-21/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-21/ai-web) · [⚖️ Policy Watch](https://dboeter.github.io/daily-diff/#2026-10-21/ai-policy) · [🗄️ Data Engineering Watch](https://dboeter.github.io/daily-diff/#2026-10-21/ai-data)

> Generated: 2026-10-21 01:27 UTC | Projects: 25 | Active today: 12 | Stable releases: 15 | Prereleases (not covered): 2

---

## 🕵️ Stealth Models on OpenRouter

No stealth models listed on OpenRouter today.

---

## Coding Agents & Assistants

### Overview
Claude Code shipped v2.1.305 with sandbox improvements for Linux nested namespaces and a retry watchdog fix, but a regression on Windows Bedrock broke custom CA handling. Gemini CLI v0.65.0 enforces read-only workspaces in untrusted folders and fixes session resume bugs. Hermes Agent faces two serious issues: smart approval auto-executing destructive `osascript` commands on macOS, and a protocol mismatch sending chat/completions to a Codex Responses endpoint. OpenCode hit GitHub Trending while users report free-tier IP blocks on Windows. Oh My Pi added Bedrock native compaction and account policy reclaim logic. Pstack-claude released two builds adding Muse plugin support and unified effort fields across runtimes. Autoloom published its seventh beta with task fidelity and UI recovery fixes.

### Claude Code
- **Release**: v2.1.305 adds `sandbox.allowNestedUserNamespaces` so sandboxed Linux commands can create user namespaces (Chromium, rootless podman), and `CLAUDE_CODE_RETRY_WATCHDOG_USAGE_LIMIT_RECHECK_MS` lets unattended retry mode notice lifted usage limits before reset. https://github.com/anthropics/claude-code/releases/tag/v2.1.305
- **Hot issue**: Windows Bedrock users on v2.1.304 hit `UNABLE_TO_GET_ISSUER_CERT` despite custom CAs being loaded; regression from v2.1.303. https://github.com/anthropics/claude-code/issues/103680
- **News**: Anthropic published research on Claude Code's sandboxing architecture and auto-mode implementation, plus a postmortem on April quality reports. https://www.anthropic.com/research/claude-code-sandboxing https://www.anthropic.com/research/claude-code-auto-mode https://www.anthropic.com/research/april-23-postmortem

### Gemini CLI
- **Release**: v0.65.0 enforces read-only workspace settings in untrusted folders, prevents duplicate tool response turns when resuming sessions, and stops deletion of resumed session history on quick exit. https://github.com/google-gemini/gemini-cli/releases/tag/v0.65.0

### OpenCode
- **Hot issue**: Windows users report free models blocked by alleged IP abuse detection with no VPN; error claims free tier only works within OpenCode desktop. Issue closed but user impact unclear. https://github.com/anomalyco/opencode/issues/56965
- **News**: Project trending on GitHub with +1,240 stars, described as "the open source coding agent." https://github.com/anomalyco/opencode

### Oh My Pi
- **Release**: v18.12.4 enables native compaction for supported Bedrock Claude models and adds opt-in `reclaimAbovePct` to account policies so sessions auto-return to preferred accounts after priority drops. https://github.com/can1357/oh-my-pi/releases/tag/v18.12.4

### Hermes Agent
- **Hot issue**: Smart approval mode auto-approved `osascript` commands that closed a user's unsaved PowerPoint deck and deleted its export — unrecoverable data loss on macOS. https://github.com/NousResearch/hermes-agent/issues/141346
- **Hot issue**: Kanban worker posts to chat/completions endpoint despite `api_mode=codex_responses`, getting 400 `ModelProtocolUnsupported` for `muse-spark` on opencode-go. https://github.com/NousResearch/hermes-agent/issues/141861

### michael-denyer/pstack-claude
- **Release**: v0.9.96 ships a Muse build with native plugin manifest, shared skills as slash commands, and a `SessionStart` hook injecting poteto-mode mandate. v0.9.95 unifies `@level` effort fields across Claude Code, Codex, Copilot, and Pi runtimes, removing generated effort-specific agents. https://github.com/michael-denyer/pstack-claude/releases/tag/v0.9.96 https://github.com/michael-denyer/pstack-claude/releases/tag/v0.9.95

### GanyuanRan/Autoloom
- **Prerelease**: v0.1.0-beta.7 strengthens task fidelity across understanding, transformation, and delivery; improves bidirectional review with conservative fixes reusing governance checkpoints; fixes UI drawing stalls and session restore failures after updates. https://github.com/GanyuanRan/Autoloom/releases/tag/v0.1.0-beta.7

**Quiet today:** [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [cursor/plugins](https://github.com/cursor/plugins), [GCWing/OpenBitFun](https://github.com/GCWing/OpenBitFun)

**Unavailable today:** [OpenAI Codex](https://github.com/openai/codex)

---

## Agent Tooling

### Overview
OpenShell v0.1.5 renames OCSF log files from `.log` to `.jsonl`, requiring collector pattern updates. Ruflo shipped five releases in two days fixing task cancel/status correctness, enabling TUI mouse interaction by default, wiring real AgentDB HNSW vector search, patching a CWE-22 path-traversal vulnerability, and resolving a critical install break caused by an unpublished memory package — also landing on GitHub Trending. HyperFrames resolved timeouts on long phone-video exports and stabilized distributed rendering with frame sub-ranges. Pi-harness added verified update downloads with progress, cancellation, resume, and retry. OpenRig delivered a rapid follow-up with daily-drive fixes including Claude seat handover waits and Slack missed-message recovery across mapped channels.

### OpenShell
- **Release**: [v0.1.5](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.5) renames Supervisor OCSF log files to `openshell-ocsf.YYYY-MM-DD.jsonl`; update any collector patterns from `*.log` to `*.jsonl`. Old `.log` files are not migrated and may be cleaned up.

### ruvnet/ruflo
- **Release**: [v3.59.2](https://github.com/ruvnet/ruflo/releases/tag/v3.59.2) fixes `task cancel` to return `previousStatus`, refuse to touch finished tasks, and exit 1 on failure; `task status` now shows correct status box titles.
- **Release**: [v3.59.0–v3.58.0](https://github.com/ruvnet/ruflo/releases/tag/v3.59.0) adds real AgentDB HNSW vector search with staleness rejection and exact-cosine fallback, enables TUI mouse clicking by default (`--no-mouse` to disable), patches CWE-22 path-traversal in `hooks_codemod`, and fixes a critical install break from an unpublished `@claude-flow/memory` pin.
- **News**: [GitHub Trending](https://github.com/ruvnet/ruflo) highlights ruflo as "the original agent harness" for deploying multi-player swarms with adaptive memory, self-learning intelligence, federation, vector RAG, and native Claude Code/Codex/Hermes integration (+684 stars).

### heygen-com/hyperframes
- **Release**: [v0.8.181](https://github.com/heygen-com/hyperframes/releases/tag/v0.8.181) eliminates timeouts and stalls on long phone-video exports; cloud render plans now check audio peaks faster; studio keeps edit preview waiting while window draws no frames.
- **Release**: [v0.8.180](https://github.com/heygen-com/hyperframes/releases/tag/v0.8.180) fixes intermittent empty-frame failures in multi-worker renders, adds distributed chunk rendering as frame sub-ranges, restores previews to playhead on video reload, and speeds up phone-video snapshot decoding.

### wangmiaozero/pi-harness
- **Release**: [v2.2.4](https://github.com/wangmiaozero/pi-harness/releases/tag/v2.2.4) adds verified update downloads with progress, cancellation, resume, and retry; blocks unverified or incompatible packages; improves manual install guidance; fixes update status after restart into a newly applied update.

### mvschwarz/openrig
- **Release**: [v0.6.13](https://github.com/mvschwarz/openrig/releases/tag/v0.6.13) delivers daily-drive fixes: Claude seat handover now waits for the new Claude before typing packets; Slack missed-message recovery reaches mapped channels, recent threads, and relayed channels; 15 of 46 changes from 10 outside contributors.

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck), [paperclipai/paperclip](https://github.com/paperclipai/paperclip)

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*