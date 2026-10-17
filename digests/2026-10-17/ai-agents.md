# AI Agents 2026-10-17

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-17) · **🤖 AI Agents** · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-17/ai-web)

> Generated: 2026-10-17 01:14 UTC | Projects: 16 | Active today: 10 | Stable releases: 10 | Prereleases (not covered): 6

---

## 🕵️ Stealth Models on OpenRouter

⚠️ OpenRouter model catalog unavailable — stealth model status unknown.

---

## Coding Agents & Assistants

### Overview
Claude Code shipped a new stable version that adds model‑selection controls and idle‑compaction toggles, while OpenAI Codex users are seeing desktop‑client 404 errors and lost browser access. Kilo Code’s JetBrains plugin gained mobile‑agent listing and CLI bundling, OpenCode refined model‑reasoning handling and fixed upgrade paths, and Oh My Pi updated its agent‑core and AI layers. Cline introduced Cloud sessions, moved plugins to worker/sandbox threads, and retried provider failures, DeepSeek Harness released an alpha that polished skill lists and added model‑label slots, and Hermes Agent dealt with a provider‑override bug and reported Android/Termux regressions. Community highlights include official Claude Code plugins, a Codex‑focused tutorial, a Pi desktop wrapper, and a DeepSeek Harness desktop client.

### Claude Code
- **Release**: v2.1.302 adds the `CLAUDE_CODE_AUTO_MODE_MODEL` environment variable to choose the model for the client‑side auto‑mode classifier, introduces an idle‑compaction toggle in `/config` with notices showing how to disable it, and adds notices to `/design-sync` and `/design-login`. [[Release](https://github.com/anthropics/claude-code/releases/tag/v2.1.302)]
- **Hot issues**: Users ask for a less intrusive end‑of‑turn “next‑step” box in the Code tab (#102273) and want the “Group by folder” toggle and always‑visible context percentage restored (#102305). [[#102273](https://github.com/anthropics/claude-code/issues/102273)] [[#102305](https://github.com/anthropics/claude-code/issues/102305)]
- **News**: The official plugin directory (`anthropics/claude-plugins-official`) and the community‑curated `awesome-claude-code` list showcase growing plugin ecosystems for Claude Code. [[claude-plugins-official](https://github.com/anthropics/claude-plugins-official)] [[awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)]

### OpenAI Codex
- **Hot issues**: #54197 reports a 404 “Model not found” error on desktop clients because the client sends model “gpt-6”, while mobile works; #54376 describes the Codex app losing browser access after an update on macOS. [[#54197](https://github.com/openai/codex/issues/54197)] [[#54376](https://github.com/openai/codex/issues/54376)]
- **News**: The tutorial repo `tradecatlabs/vibe-coding-cn` provides a Chinese‑language guide to Codex‑based pair programming, covering prompts, skills, workflow and context management. [[vibe-coding-cn](https://github.com/tradecatlabs/vibe-coding-cn)]

### Kilo Code
- **Release**: JetBrains plugin v7.1.11 adds listing remote agents for the mobile app, bundles Kilo CLI v7.8.13, and fixes UI‑thread blocking from ignore‑file loading, deferred prompt dispatch, worker console writes, MCP OAuth token refresh, session timing, and OpenRouter reasoning persistence. [[jetbrains/v7.1.11](https://github.com/Kilo-Org/kilocode/releases/tag/jetbrains/v7.1.11)]

### OpenCode
- **Release**: v1.19.3 lets users configure model reasoning options to generate reasoning variants, superseding catalog variants while preserving overrides; v1.19.2 ensures 1.x updates stay on the 1.x line, separates 2.x upgrades, and fixes Yarn and Homebrew upgrade handling. [[v1.19.3](https://github.com/anomalyco/opencode/releases/tag/v1.19.3)] [[v1.19.2](https://github.com/anomalyco/opencode/releases/tag/v1.19.2)]
- **Hot issues**: #55607 (closed) reported frequent “Endpoint not available” errors with the free LongCat 2.5 preview, hinting at server capacity limits; #56033 (open) complains that the recent v2.0.29 update reduced communication and thought output, making the agent less informative. [[#55607](https://github.com/anomalyco/opencode/issues/55607)] [[#56033](https://github.com/anomalyco/opencode/issues/56033)]

### Pi
- **News**: `vastsa/PI-Desktop` packages the Pi Agent Harness into a local‑first desktop client built with Electron and Rust, supporting user‑installable plugins. [[PI-Desktop](https://github.com/vastsa/PI-Desktop)]

### Oh My Pi
- **Release**: v18.11.3 adds queue‑aware `prepareQueuedMessages` and fixes JSON Schema dereferencing; v18.11.2 makes `agent_start` carry resumed tool‑call IDs and changes cancelled ask handling to report user‑canceled instead of retrying. [[v18.11.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.11.3)] [[v18.11.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.11.2)]

### Cline
- **Release**: v4.1.25 introduces Cline Cloud sessions (hosted GitHub sandbox tasks) and sets Gemini 4 Argon as the default provider when no model is selected; SDK v0.0.94 moves plugins to worker or sandbox threads, dropping in‑process mode; desktop v0.0.47 restores marketplace plugin loading, removes the Cloud sessions toggle (always on when available) and adds up‑to‑three retries on provider errors; cli v3.0.72 runs plugins in a worker thread and reports missing‑plugin situations. [[v4.1.25](https://github.com/cline/cline/releases/tag/v4.1.25)] [[sdk/v0.0.94](https://github.com/cline/cline/releases/tag/sdk/sdk/v0.0.94)] [[desktop-v0.0.47](https://github.com/cline/cline/releases/tag/desktop-v0.0.47)] [[cli-v3.0.72](https://github.com/cline/cline/releases/tag/cli-v3.0.72)]

### DeepSeek Harness
- **Prerelease**: dsh‑v0.2.1‑alpha.5 fixes the skill list not updating after plugin toggles, reduces redundant terminal queries, improves PTC Mode guidance, stops Page Up from shifting the UI, and adds a `conversation.input.model.label` slot for plugins to customize model labels per provider. [[dsh-v0.2.1-alpha.5](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-alpha.5)]
- **News**: `dataelement/dsh-desktop` delivers a dedicated DeepSeek Harness desktop client, wrapping the harness in an Electron‑style interface for local use. [[dsh-desktop](https://github.com/dataelement/dsh-desktop)]

### Hermes Agent
- **Hot issues**: #138843 (closed) showed that a local `session.create` with an explicit provider but no base_url would reuse the profile’s stale base_url, causing 401 errors; #140004 (open) describes Hermes on Android/Termux losing functionality after several days, noting what works and what broke after recent updates. [[#138843](https://github.com/NousResearch/hermes-agent/issues/138843)] [[#140004](https://github.com/NousResearch/hermes-agent/issues/140004)]

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [jcode](https://github.com/1jehuang/jcode), [Command Code](https://github.com/CommandCodeAI/command-code)

---

## Agent Tooling

### Overview
Today the only activity was a GitHub Trending highlight for context-mode, which showcased its context‑window optimization for AI coding agents. The project claims a 98% reduction in sandbox tool output, persistent session memory, and cross‑platform routing via MCP and hooks. This attention signals growing interest in tools that manage agent context and sandbox overhead.

### context-mode
- **News**: GitHub Trending highlighted context-mode as a context‑window optimizer for AI coding agents, noting 98% less sandbox output, persistent session memory, and MCP‑hook routing across 17 platforms; the post drove significant visibility. https://github.com/mksglu/context-mode

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*