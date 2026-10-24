# AI Agents 2026-10-24

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-24) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-24/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-24/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-24/ai-data)

> Generated: 2026-10-24 01:29 UTC | Projects: 16 | Active today: 6 | Stable releases: 3 | Prereleases (not covered): 2

---

## Highlights

- Hermes Agent v0.22.5 delivers a stable rollup of roughly 81 pull requests across CLI, installers, Microsoft Store, Docker, and Hermes Cloud
- Oh My Pi on Windows x64 crashes with stack overflow when resuming a session that has a pending edit tool call
- Claude Code v2.1.310 introduces the Monitor tool and plugin monitors for Bedrock, Vertex, and Foundry
- OpenShell trends on GitHub as a safe private runtime for autonomous AI agents, gaining over a thousand stars
- Omnara launches as an open-source self-hostable alternative to Claude Managed Agents and OpenAI's Agents API

---

## Coding Agents & Assistants

### Claude Code

- **Release**: [v2.1.310](https://github.com/anthropics/claude-code/releases/tag/v2.1.310) adds the Monitor tool and plugin monitors on Bedrock, Vertex, and Foundry; fixes request failures behind gateways that reject the `effort-2025-11-24` beta value or mid-conversation system messages with automatic retry logic.

### Kilo Code

- **Hot issue**: [#15379](https://github.com/Kilo-Org/kilocode/issues/15379) — selecting and copying text from chat history steals focus to the prompt input, breaking Cmd+C and copy context actions on macOS (v7.8.15, VS Code 1.143).

### Oh My Pi

- **Hot issue**: [#16857](https://github.com/can1357/oh-my-pi/issues/16857) — Windows x64 crashes with stack overflow (0xC00000FD) when resuming a session with a pending `edit` tool call, caused by unbounded recursion in the native module (~500 frames).

### DeepSeek Harness

- **Prerelease**: [dsh-v0.2.1-rc.3](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-rc.3) adds "More" menus to left sidebar, conversation views, and right sidebar for plugin browsing/creation; fixes draft loss when switching sessions; aligns API key adapter model list updates with account login mode.

### Hermes Agent

- **Release**: [v0.22.5](https://github.com/nousresearch/hermes-agent/releases/tag/v0.22.5) rolls up ~81 PRs since v0.22.4 into a stable release for CLI, installers, Microsoft Store, Docker, and Hermes Cloud.
- **Hot issue**: [#143426](https://github.com/NousResearch/hermes-agent/issues/143426) — Linux desktop launches at 6% window opacity due to default translucency via `setOpacity`; Settings hides the opacity control (Ubuntu 26.04, GNOME 50, Wayland/XWayland).
- **Hot issue**: [#143379](https://github.com/NousResearch/hermes-agent/issues/143379) — RFC on doc-chain substrate network governance, read semantics, and compaction for durable record provenance across session compression.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

**Unavailable today:** [OpenAI Codex](https://github.com/openai/codex)

---

## Agent Tooling

### OpenShell

- **News**: GitHub Trending highlights OpenShell as "the safe, private runtime for autonomous AI agents," surging +1,119 stars — signaling strong developer interest in NVIDIA's agent sandbox. [GitHub Trending](https://github.com/NVIDIA/OpenShell)

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Using thousands of AI agents to uncover new leads in biological data](https://openai.com/index/scaling-ai-research-for-complex-biological-data/) | Hacker News | [159 points, 105 comments](https://news.ycombinator.com/item?id=50180752) | — Using thousands of AI agents to uncover new leads in biological data (Hacker News, openai.com) |
| [Using Claude to reduce the attack surface of code](https://www.anthropic.com/research/attack-surface-reduction) | Hacker News | [135 points, 91 comments](https://news.ycombinator.com/item?id=50175779) | Automated attack surface analysis and reduction can meaningfully improve the security of deployed software in the near term. In this post, we preview data we’ve collected from applying attack surface reduction techniques to large open-source codebases using Claude. |
| [Show HN: Omnara – Open-source alternative to Claude Managed Agents](https://github.com/omnara-ai/omnara) | Hacker News | [111 points, 34 comments](https://news.ycombinator.com/item?id=50183892) | The open-source managed agent platform. A self-hostable alternative to Claude Managed Agents and OpenAI's Agents API. |
| [Claude Duet](https://claude.com/resources/articles/claude-duet) | Hacker News | [92 points, 13 comments](https://news.ycombinator.com/item?id=50186455) | Claude Duet is a new app where Claude works as a proactive agent. The research preview opens by waitlist today for Pro and Max subscribers in the US. |
| [Show HN: UI micro interactions prompts for AI](https://www.typeui.sh/micro-interactions) | Hacker News | [79 points, 44 comments](https://news.ycombinator.com/item?id=50199290) | — Show HN: UI micro interactions prompts for AI (Hacker News, typeui.sh) |
| [Launch HN: Alter (YC S25) – Access control for multi-user agents](https://alterauth.com/) | Hacker News | [68 points, 49 comments](https://news.ycombinator.com/item?id=50176908) | PAM for AI agents, enforced at runtime: vaulted credentials, per-action policy, approval before risky calls complete, and an audit trail for every call through Alter. |
| [I Built a Pixel Hero That Nags Me to Drink Water (and Runs 100% on My Laptop)](https://dev.to/kumuda/i-built-a-pixel-hero-that-nags-me-to-drink-water-and-runs-100-on-my-laptop-2ilb) | Dev.to | [45 reactions, 4 comments](https://dev.to/kumuda/i-built-a-pixel-hero-that-nags-me-to-drink-water-and-runs-100-on-my-laptop-2ilb) | This is a submission for the Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady. |
| [Hush: I Hid 10 Emergencies in My Own Notifications. An On-Device Gemma OS Found All 10.](https://dev.to/rajan_mishra_a9f78ad216b4/hush-i-hid-10-emergencies-in-my-own-notifications-an-on-device-gemma-os-found-all-10-m3g) | Dev.to | [17 reactions, 3 comments](https://dev.to/rajan_mishra_a9f78ad216b4/hush-i-hid-10-emergencies-in-my-own-notifications-an-on-device-gemma-os-found-all-10-m3g) | This is a submission for the Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*