# AI Agents 2026-11-02

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-02) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-02/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-02/ai-data) · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-02/ai-trends)

> Projects: 16 | Active today: 4 | Stable releases: 2 | Prereleases (not covered): 7 | Generated: 2026-11-02 05:48 UTC

---

## Highlights

- Oh My Pi v18.15.0 release adds Modular Cloud as a provider via `/login modular` with models.dev prices and per-model reasoning controls, and makes SambaNova Cloud follow-up turns reuse prefix cache.
- Users report dead keys fail in the Claude desktop app on Windows with Spanish (Latin America) layouts, so ´ then a yields a instead of á; the issue persists in Claude desktop app 4.4212.0 and Claude Code 2.1.309.
- Microsoft's postmortem on a malicious Claude Code–branded extension describes a persistent SSH backdoor and guidance to detect and remediate it.

---

## Coding Agents & Assistants

### Claude Code

- **Hot issue:** [#106479](https://github.com/anthropics/claude-code/issues/106479): Users report that dead keys do not work in the Claude desktop app on Windows with Spanish (Latin America) keyboard layouts, so pressing ´ then a produces a instead of á, making accented vowels impossible to type; the issue persists in Claude desktop app 4.4212.0 and Claude Code 2.1.309. (7 comments, 7 👍; +14 in the last 24h)
- [Postmortem on Claude Code Cursor extension hack](https://news.ycombinator.com/item?id=50332497) — Microsoft analyzes a malicious Claude Code–branded extension, its persistent SSH backdoor, and guidance to detect and remediate it.

### OpenAI Codex

- **Hot issue:** [#58530](https://github.com/openai/codex/issues/58530): A ChatGPT Plus subscriber asks OpenAI to preserve separate usage allowances for regular ChatGPT conversations and Codex, warning that reports of a shared limit starting in December could make the product less valuable for users who combine coding and everyday conversations. (17 comments, 21 👍; +32 in the last 24h)

### Oh My Pi

- **Release:** [v18.15.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.15.0) replaces `GroupedLineContext.isUrl` with `url`. It fixes OpenAI remote compaction replaying backend-only `internal_chat_message_metadata_passthrough` metadata that Codex rejects, and fixes Codex conversation replay failing on unknown `internal_chat_message_metadata_passthrough.content_token_count` by omitting backend-internal response metadata from replayed input.
- It also fixes `service_tier: "ultrafast"` being dropped for OpenAI-family models on custom providers, Google Vertex Workforce Identity Federation ADC token refresh hitting the wrong endpoint, Anthropic and rotating-token OAuth accounts being signed out on `invalid_grant` from background usage polls, and OpenAI-compatible models ignoring provider-reported context and output token limits.
- Headline features add Modular Cloud (`modular`) as a provider via `/login modular` with models.dev prices and per-model reasoning controls, make SambaNova Cloud follow-up turns reuse prefix cache, and add one-line captions for long background shell commands through the `widget` model role.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

### Agent Deck

- **Release:** [v1.16.36](https://github.com/asheshgoplani/agent-deck/releases/tag/v1.16.36) fixes the UI by reordering orphaned sub-sessions among top-level rows and starting global-search sessions through the resume builder. It also fixes session handling so a fresh Claude start’s boot reaches the parent as info and its token lasts until the first turn, makes `launchesFresh` an `atomic.Bool` to stop a concurrent-restart race, and changes update polling to run on every `check_interval` tick instead of every second one.

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [AI agent swarms in Minecraft fail to build civilization, drown in bureaucracy](https://www.tomshardware.com/tech-industry/artificial-intelligence/ai-agent-swarms-unleashed-in-minecraft-to-build-a-thriving-civilization-50-agent-teams-fail-after-falling-into-paralyzing-bureaucracy) | Hacker News | [162 points, 77 comments](https://news.ycombinator.com/item?id=50325662) | The story describes AI agent swarms in Minecraft failing to build civilization and drowning in bureaucracy, based on game testing intended to provide insight into recent AI agent headlines. |
| [Muse AI agent is a commercial surveillance network disguised as an AI assistant](https://paulfwalsh.substack.com/p/metas-muse-ai-agent-is-a-commercial) | Hacker News | [43 points, 6 comments](https://news.ycombinator.com/item?id=50328293) | — |
| [I Am the Reason OpenAI Is Killing Unlimited Chats](https://chaosmanage.github.io/i-killed-unlimited-chatgpt/) | Hacker News | [38 points, 7 comments](https://news.ycombinator.com/item?id=50327416) | The author built custom MCP integrations and used multiple ChatGPT conversations for software development. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*