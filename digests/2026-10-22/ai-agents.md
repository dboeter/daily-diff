# AI Agents 2026-10-22

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-22) · **🤖 AI Agents** · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-22/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-22/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-22/ai-web) · [⚖️ Policy Watch](https://dboeter.github.io/daily-diff/#2026-10-22/ai-policy) · [🗄️ Data Engineering Watch](https://dboeter.github.io/daily-diff/#2026-10-22/ai-data)

> Generated: 2026-10-22 01:26 UTC | Projects: 25 | Active today: 11 | Stable releases: 29 | Prereleases (not covered): 6

---

## 🕵️ Stealth Models on OpenRouter

No stealth models listed on OpenRouter today.

---

## Coding Agents & Assistants

### Overview
Claude Code shipped two patch releases adding API version control and OpenTelemetry safety events while a Windows Bedrock regression blocks custom CA certificates. OpenAI Codex's macOS desktop app breaks first-message sends in new chats and Windows users lose the Dots entry after updating. Pi 1.4.0 introduces image input for classifier models across multiple providers. Oh My Pi updated its catalog with persistent prompt caching for OpenAI Codex and refreshed bundled Yolo-Auto models. Hermes Agent removed intrusive suggestion pills and fixed a Kanban worker protocol mismatch alongside a terminal paging crash. pstack-claude released a series of fixes aligning transcript and plugin discovery with Claude Code's `CLAUDE_CONFIG_DIR`. OpenBitFun added offline session recovery and hardened Windows icon handling.

### Claude Code
- **Release**: v2.1.307 adds `/claude-api api-version` to pin the API to `2026-10-21` and emits `claude_code.safety_event` OpenTelemetry events for every tool call blocked by permissions, auto-mode, safety checks, hooks, or the sandbox; v2.1.306 fixes `claude -p` authentication inside cloud sessions and stops spurious "prompt too long" errors in MCP-heavy sessions. [v2.1.307](https://github.com/anthropics/claude-code/releases/tag/v2.1.307), [v2.1.306](https://github.com/anthropics/claude-code/releases/tag/v2.1.306)
- **Hot issue**: Windows users on Bedrock hit `UNABLE_TO_GET_ISSUER_CERT` in 2.1.304; custom CAs load but aren't used, a regression from 2.1.303. [#103680](https://github.com/anthropics/claude-code/issues/103680)

### OpenAI Codex
- **Hot issue**: macOS desktop app 26.1016.51333 fails the first message in any new chat with "Cannot serialize value (couldn't stringify value)". [#55744](https://github.com/openai/codex/issues/55744)
- **Hot issue**: Windows Dots entry vanishes after updating to 26.1016.51333; reinstall and `Ctrl+.` don't restore it. [#55795](https://github.com/openai/codex/issues/55795)

### Pi
- **Release**: v1.4.0 enables image input for `codemode models.classify()` with TypeSafe's Jev and Cloudflare's Clef models on `typesafe`, `cloudflare-workers-ai`, and OpenRouter. [v1.4.0](https://github.com/earendil-works/pi/releases/tag/v1.4.0)

### Oh My Pi
- **Release**: v18.12.6 adds a `prompt-cache-persistent` catalog axis for providers with non-expiring prompt caches (logged-in OpenAI Codex) and updates the bundled Yolo-Auto catalog to `qwen3.8-27b` (new default), `yolo`, `yolo-small`, `yolo-128k`; v18.12.5 implements OpenAI 12-hour prompt caching for GPT-5.6+ via `cacheRetention: "long"` and fixes 404 errors on personal ChatGPT accounts. [v18.12.6](https://github.com/can1357/oh-my-pi/releases/tag/v18.12.6), [v18.12.5](https://github.com/can1357/oh-my-pi/releases/tag/v18.12.5)

### Hermes Agent
- **Release**: v0.22.4 removes suggestion pills that appeared above the composer without clear purpose; v0.22.3 rolls up ~620 PRs since v0.22.2 into a stable release across CLI, installer, Microsoft Store, Docker, and Hermes Cloud. [v0.22.4](https://github.com/nousresearch/hermes-agent/releases/tag/v0.22.4), [v0.22.3](https://github.com/nousresearch/hermes-agent/releases/tag/v0.22.3)
- **Hot issue**: Kanban worker posts to `chat/completions` despite `api_mode=codex_responses`, causing HTTP 400 `ModelProtocolUnsupported` for `muse-spark` on `opencode-go`. [#141861](https://github.com/NousResearch/hermes-agent/issues/141861)
- **Hot issue**: `process_manage` throws `TypeError: slice indices must be integers` when paging background process output, blocking log retrieval. [#141988](https://github.com/NousResearch/hermes-agent/issues/141988)

### michael-denyer/pstack-claude
- **Release**: v0.9.97–v0.9.101 fix transcript and plugin directory discovery to respect `CLAUDE_CONFIG_DIR`, switch hook argument passing from `awk -v` to environment variables to avoid backslash escape issues on Windows paths, and align skills with Claude Code's session ID and project layout. [v0.9.101](https://github.com/michael-denyer/pstack-claude/releases/tag/v0.9.101), [v0.9.100](https://github.com/michael-denyer/pstack-claude/releases/tag/v0.9.100), [v0.9.99](https://github.com/michael-denyer/pstack-claude/releases/tag/v0.9.99), [v0.9.98](https://github.com/michael-denyer/pstack-claude/releases/tag/v0.9.98), [v0.9.97](https://github.com/michael-denyer/pstack-claude/releases/tag/v0.9.97)

### GCWing/OpenBitFun
- **Release**: v1.0.7 preserves icon source bytes on Windows, keeps official and LAN relay connections independent, and adds offline session recovery for data tools. [v1.0.7](https://github.com/GCWing/OpenBitFun/releases/tag/v1.0.7)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [cursor/plugins](https://github.com/cursor/plugins), [GanyuanRan/Autoloom](https://github.com/GanyuanRan/Autoloom)

---

## Agent Tooling

### Overview
ruvnet/ruflo shipped eight rapid-fire patch releases (v3.59.3–v3.59.12) restoring the `pair` command, fixing Windows path handling, securing memory tombstones, and hardening policy locks. heygen-com/hyperframes released three versions (v0.8.183–v0.8.185) enabling 4K transparent renders, larger project uploads, and faster cold starts. wangmiaozero/pi-harness v2.2.5–v2.2.6 added local plugin support with trust approval, model verification, and refreshed skills. mvschwarz/openrig v0.6.14 delivered final 0.6-line stability fixes including in-place agent repair after upgrades.

### ruvnet/ruflo
- **Release**: v3.59.3–v3.59.12 restore the `pair` command for the Claude Code skill, fix Windows ADR indexing and console path bugs, remove unused `toml` dependency with high-severity CVEs, scrub memory tombstone payloads on delete, harden policy lock acquisition, add `--path` to `memory export`, distill both memory stores, and honor `hive-mind_init` persistence flags. https://github.com/ruvnet/ruflo/releases/tag/v3.59.12

### heygen-com/hyperframes
- **Release**: v0.8.183–v0.8.185 add 4K transparent MOV/WebM cloud rendering, support projects exceeding upload limits via chunked capture, start encoding during multi-worker MP4 capture, keep transparency in Studio previews, handle post-cookie-banner page reloads, and accelerate CLI cold starts with cached Chrome. https://github.com/heygen-com/hyperframes/releases/tag/v0.8.185

### wangmiaozero/pi-harness
- **Release**: v2.2.5–v2.2.6 introduce local Harness plugins for run metrics, custom evaluations, JSON trace exports, and team templates with explicit trust approval and permission diagnostics; add shared OpenCode Zen/Go setup with named API keys, individual and batch model verification, and model enablement controls. https://github.com/wangmiaozero/pi-harness/releases/tag/v2.2.6

### mvschwarz/openrig
- **Release**: v0.6.14 (final 0.6 release) fixes agents that stop receiving messages after an upgrade with in-place repair guidance, makes manual compaction wait at approvals, reduces refocus overhead on busy machines, and corrects inventory reads. https://github.com/mvschwarz/openrig/releases/tag/v0.6.14

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck), [paperclipai/paperclip](https://github.com/paperclipai/paperclip)

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*