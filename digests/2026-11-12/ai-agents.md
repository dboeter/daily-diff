# AI Agents 2026-11-12

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-12) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-12/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-12/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-12/ai-data)

> Projects: 15 | Active today: 6 | Stable releases: 4 | Prereleases (not covered): 7 | Generated: 2026-11-12 06:59 UTC

---

## Highlights

- Oh My Pi v18.19.0 breaks the browser `open` API (`ignore_https_errors` → `insecure`, `allow_file_access` removed), changes `app` option from object to string, removes `task.file` and `blocked` todo status, and adds Liquid AI `liquid-systemone` judgment API with 10,000-patch validation  
- Users report Claude Code iOS app messages sent mid-turn no longer reach Claude until the turn ends, a regression since version 2.1.321 preventing steering of long-running tasks  
- DeepSeek Harness prerelease dsh-v0.2.2-rc.2 adds Git Worktree review by branch/commit/file-type with GitHub review sync, named and multi-layer SubAgent support with AgentTeam session sharing, and desktop update channel switching

---

## Coding Agents & Assistants

### Claude Code

- **Hot issue:** [#108975](https://github.com/anthropics/claude-code/issues/108975): users report that messages sent from the iOS app mid-turn no longer reach Claude until the turn ends, a regression since version 2.1.321 that prevents steering long-running tasks. (regression; 5 comments, 1 👍; +6 in the last 24h)
- **Hot issue:** [#108984](https://github.com/anthropics/claude-code/issues/108984): users report that Claude Code drops text in the middle of scrollback when appending new console output on Linux, making it impossible to read previous output while the agent continues working. (regression; 3 comments, 2 👍; +4 in the last 24h)
- **News:** [Atuin Threads: All your agent sessions on every machine](https://news.ycombinator.com/item?id=50453637) describes a tool that syncs and searches agent session history across machines, letting users start a task in Claude Code and resume it in Codex.

### OpenAI Codex

- **Release:** [rust-v0.167.2](https://github.com/openai/codex/releases/tag/rust-v0.167.2) adds incremental tool updates by default on Google Cloud Vertex AI, with an opt-out via `incremental_tools_legacy_gcp = false` in `config.toml`.
- **News:** [Atuin Threads: All your agent sessions on every machine](https://news.ycombinator.com/item?id=50453637) describes a tool that syncs and searches agent session history across machines, letting users start a task in Codex and resume it in Claude Code.

### OpenCode

- **Release:** [process-daemon-v0.5.2](https://github.com/anomalyco/opencode/releases/tag/process-daemon-v0.5.2) publishes opencode-pty 0.5.2 (protocol 8) as `@opencode/pty@0.5.2` to npm.

### Oh My Pi

- **Release:** [v18.19.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.19.0) breaks the browser `open` API (`ignore_https_errors` → `insecure`, `allow_file_access` removed), changes `app` option from object to string, removes `task.file` and `blocked` todo status, adds Liquid AI `liquid-systemone` judgment API with 10,000-patch validation, and fixes Gemini CLI/Antigravity thought signature ordering and quota bucket handling.
- **Release:** [v18.18.9](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.9) removes Devin's retired SWE-1.6 Fast model, removes Smithery MCP commands (API shut down Oct 31), adds `SOFYA_API_KEY` for the `sofya` provider, fixes Devin requests sending `temperature: 0` (now raised to `0.0001`), and improves auth-gateway credential rotation.

### DeepSeek Harness

- **Prerelease:** [dsh-v0.2.2-rc.2](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2) adds Git Worktree review by branch/commit/file-type with GitHub review sync, named and multi-layer SubAgent support with AgentTeam session sharing, desktop update channel switching, and extensive UI/UX improvements across code review, sidebar, chat history, patch editing, and agent terminal visibility.

### Hermes Agent

- **Hot issue:** [#153396](https://github.com/NousResearch/hermes-agent/issues/153396): users request the ability to bring their own Slack app per agent on the Team Gateway so each agent keeps its own bot name and avatar while still suspending when idle. (8 comments, 7 👍; +15 in the last 24h)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: Klad, a paint app your coding agent can drive (source-available) ([klad-app/klad](https://github.com/klad-app/klad)) | Hacker News | [78 points, 31 comments](https://news.ycombinator.com/item?id=50454951) | Klad is a source‑available drawing application designed for collaborative use between coding agents and humans. |
| [Launch HN: Pomerado (YC F26) – Turn any website into an MCP for agents](https://news.ycombinator.com/item?id=50455811) | Hacker News | [53 points, 42 comments](https://news.ycombinator.com/item?id=50455811) | — |
| [Modern Web Guidance 1.0: The web platform expertise your coding agent is missing](https://developer.chrome.com/blog/modern-web-guidance-v1) | Hacker News | [30 points, 7 comments](https://news.ycombinator.com/item?id=50460398) | Modern Web Guidance 1.0 supplies expert‑vetted web platform skills, browser compatibility data, and codebase modernization guidance for AI coding agents. |
| [Subagents Conwidered Harmful](https://nikvdp.com/notes/subagents-considered-harmful/) | Hacker News | [24 points, 8 comments](https://news.ycombinator.com/item?id=50450268) | — |
| [I gave an agent a lakehouse and control of my garden](https://jatorre.github.io/garden/) | Hacker News | [5 points, 0 comments](https://news.ycombinator.com/item?id=50415162) | The author gave an AI agent control of a garden equipped with eleven sensors, a camera, and an old phone, producing a €60 lettuce. |
| [A Small Laptop Is a Full Build Kit: Bootstrapping with a Chromebook, Claude, and GitHub](https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16) | Dev.to | [22 reactions, 7 comments](https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16) | The author bootstrapped a development environment using a Chromebook, Claude, and GitHub, demonstrating a small laptop can serve as a full build kit. |
| [The Limits That Don't Limit](https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j) | Dev.to | [19 reactions, 4 comments](https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j) | The post outlines four guards against runaway agents, noting that a 5‑second deadline actually took 21.9 seconds to enforce. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*