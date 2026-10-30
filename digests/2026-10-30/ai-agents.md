# AI Agents 2026-10-30

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-30) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-30/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-30/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-30/ai-data)

> Projects: 16 | Active today: 5 | Stable releases: 6 | Prereleases (not covered): 6 | Generated: 2026-10-30 05:34 UTC

---

## Highlights

- Oh My Pi v18.14.0 introduces breaking changes: removes Bun event-loop workarounds, raw `models.json` export, and filesystem scan cache API; moves provider helpers to dedicated modules; requires provider-qualified model selectors; changes custom tool loader constructors to take `cwd` first.
- Users report Claude Code's `agent_summary` spinner consumes ~18% of weighted tokens in subagent-heavy sessions, with requests for a supported way to disable it via env var or settings.
- OpenAI Codex rust-v0.166.0 adds GPT-6.1 Terra to model catalogs and `codex queue --resume` for resuming queued tasks, plus keyboard-driven transcript selection and clearer safety-block explanations.

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.314](https://github.com/anthropics/claude-code/releases/tag/v2.1.314) adds `permissions.blockWritesOutsideWorkingDirectories` to block writes outside working directories in every permission mode; fixes sessions failing with "Invalid effort level" when org admins cap model effort; fixes `claude -p` exiting silently on startup failure; fixes Bedrock image handling and Microsoft Foundry model fallback.
- **Hot issue:** [#86879](https://github.com/anthropics/claude-code/issues/86879): users report the `agent_summary` spinner consumes ~18% of weighted tokens in subagent-heavy sessions and request a supported way to disable it via env var or settings. (8 comments, 80 👍; +80 in the last 24h)
- **Hot issue:** [#105503](https://github.com/anthropics/claude-code/issues/105503): an issue says the safety classifier blocks benign work on a public puzzle challenge (WeChall BrownOS), stopping protocol reverse-engineering of a toy lambda-calculus interpreter. (area:security; 3 comments, 0 👍; +3 since 2026-10-28)
- **News:** [Hacker News post](https://news.ycombinator.com/item?id=50286306) alleges Claude Code adds the user's email to the prompt and the LLM sends it to websites.

### OpenAI Codex

- **Release:** [rust-v0.166.0](https://github.com/openai/codex/releases/tag/rust-v0.166.0) adds keyboard-driven transcript selection with word/line/page motions, consistent Markdown rendering in async UI, GPT-6.1 Terra to model catalogs, `codex queue --resume`, clearer safety-block explanations, and `codex doctor --network-only`; fixes approval/permission preservation on resume/fork and TUI reconnection.
- **Hot issue:** [#57641](https://github.com/openai/codex/issues/57641): users report Terminal CLI `@Browser` fails with "The browser access host is unavailable" on Windows 11 with Brave after desktop app update 26.1023.6123.0, while desktop app chats still work. (13 comments, 5 👍; +11 in the last 24h)
- **News:** [Hacker News post](https://news.ycombinator.com/item?id=50292524) announces OpenAI is doubling usage limits for all Pro 100/200/500 tiers and Business Premium, effective immediately.

### OpenCode

- **Release:** [v2.2.2](https://github.com/anomalyco/opencode/releases/tag/v2.2.2) enables `experimental_image_generate` by default when an image-capable provider is connected; adds faster worktree selection via Git branch click on new-session screen; unifies quotes and annotations around a compact optional-comment editor; fixes persistent terminal requests with missing working directories and media preservation on session fork/import.
- **Release:** [process-daemon-v0.4.0](https://github.com/anomalyco/opencode/releases/tag/process-daemon-v0.4.0) publishes opencode-pty 0.4.0 (protocol 7) as @opencode/pty@0.4.0.

### Oh My Pi

- **Release:** [v18.14.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.14.0) removes Bun event-loop workaround utilities, moves Anthropic/Codex/OpenAI helpers to dedicated provider modules, updates auth-gateway model resolvers to receive `ModelResolveOptions`, removes raw `models.json` export in favor of bundled registry APIs, changes custom tool loader constructors to take `cwd` first, switches WebMCP to Chrome's native WebMcpController, requires provider-qualified model selectors to identify exact model IDs, and removes filesystem scan cache API and environment variables.

### Hermes Agent

- **Hot issue:** [#146356](https://github.com/NousResearch/hermes-agent/issues/146356): an issue says plain-text input typed into an idle session's window is hijacked into a different running session's turn as a mid-turn steer on Hermes Desktop with multiple chat windows; the hijacked messages are never persisted to any session's messages table. (type/security; 5 comments, 0 👍; +5 in the last 24h)
- **Hot issue:** [#118379](https://github.com/NousResearch/hermes-agent/issues/118379): an issue says Anthropic per-request credential refresh reverts credential-pool rotation — two pooled subscriptions bill as one, the turn falls through to fallback providers while the second account's quota remains untouched. (sweeper:risk-security-boundary; 11 comments, 1 👍; +3 since 2026-10-28; fix PR [#123361](https://github.com/NousResearch/hermes-agent/pull/123361) open)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [We ran AI agent swarms in Minecraft and Mindustry](https://labs.ycombinator.com/projects/games/index.html) | Hacker News | [232 points, 76 comments](https://news.ycombinator.com/item?id=50296486) | The authors ran swarms of Claude and GPT agents in Minecraft and Mindustry. |
| [Launch HN: Simantic (YC F26) – Firmware Simulation for AI Agents](https://news.ycombinator.com/item?id=50291116) | Hacker News | [58 points, 16 comments](https://news.ycombinator.com/item?id=50291116) | — |
| Show HN: phpClaw – AI agent runtime for PHP with tools, memory and guards ([phpclaw-php/phpclaw-monorepo](https://github.com/phpclaw-php/phpclaw-monorepo)) | Hacker News | [11 points, 4 comments](https://news.ycombinator.com/item?id=50293361) | The author released phpClaw, an open-source AI agent framework for PHP with a built-in ReAct loop, memory, tools, and security guards that integrates with frameworks like Laravel and WordPress. |
| [Claude Duet is the first personal-assistant-type harness that feels useful](https://fig.blue/posts/duet-is-the-future/) | Hacker News | [113 points, 111 comments](https://news.ycombinator.com/item?id=50292727) | — |
| [A Defense Contractor Gave Their AI Agent Access to a Secure Pentagon System](https://www.wired.com/story/a-defense-contractor-gave-their-personal-ai-agent-access-to-a-secure-pentagon-system/) | Hacker News | [19 points, 6 comments](https://news.ycombinator.com/item?id=50293979) | An Accenture employee's personal Claude agent reportedly ran on a DOD network for two months before detection. |
| [Grace Blackwell needs a new scheduler: 27% more usable GPUs from the same racks](https://skypilot.ai/blog/grace-blackwell-needs-a-new-scheduler) | Hacker News | [134 points, 21 comments](https://news.ycombinator.com/item?id=50290912) | SkyPilot's topology-aware scheduler achieves 27% more usable GPUs on NVL72 racks by keeping multi-node training on NVLink with automatic defragmentation and in-place failure recovery. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*