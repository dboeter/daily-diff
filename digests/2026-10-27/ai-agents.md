# AI Agents 2026-10-27

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-27) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-27/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-27/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-27/ai-data)

> Generated: 2026-10-27 04:50 UTC | Projects: 16 | Active today: 6 | Stable releases: 5 | Prereleases (not covered): 1

---

## Highlights

- Hermes Agent loads `~/.hermes/.env` with override enabled, letting a malicious file silently relocate the agent’s identity and policy on next start
- OpenCode free tier reports “Free usage exceeded” with no reset and “version no longer supported” errors, blocking access even without recent prompts
- Claude Code Opus usage limits drain roughly five times faster on macOS, hitting 72 percent of weekly quota in two days
- Cline introduces Cloud tasks with a Local | Cloud toggle, separate model selection for cloud sessions, and a sandbox startup progress card
- Hob launches as an open-source, on-device alternative to Claude Cowork and ChatGPT, running Gemma and gpt-oss locally on Mac, Windows, and Linux

---

## Coding Agents & Assistants

### Claude Code
- **Release**: [v2.1.311](https://github.com/anthropics/claude-code/releases/tag/v2.1.311) adds `--hold-idle-file` and `--max-hold-min` to `self-hosted-runner` for keeping idle sessions, a tip for the Explanatory output style, and fixes long startup freezes with large CLAUDE.md files plus interrupt handling.
- **Hot issue**: [#105125](https://github.com/anthropics/claude-code/issues/105125) — Opus usage limits draining ~5× faster; user at 72% weekly quota after 2 days on macOS.

### Kilo Code
- **Release**: [v7.8.18](https://github.com/Kilo-Org/kilocode/releases/tag/v7.8.18) fixes copying selected chat text with Cmd/Ctrl+C or right-click Copy in VS Code 1.143 — selection no longer clears and focus stays put.

### OpenCode
- **Hot issue**: [#59387](https://github.com/anomalyco/opencode/issues/59387) — main tracking issue for free-tier failures: “Free usage exceeded,” reset never happens, and “version no longer supported” errors.
- **Hot issue**: [#58941](https://github.com/anomalyco/opencode/issues/58941) — free usage exceeded without sending any prompts in 4 days.

### Oh My Pi
- **Release**: [v18.13.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.13.0)–[v18.13.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.13.1) add `SummaryOptions.remotePromptCacheKey` and `remoteCompactionPolicyModel()` for remote compaction cache keys, send cache/session headers during remote compaction, introduce `Agent.isPaused` to distinguish safely paused agents, and fix Codex accounts with exhausted spend caps being incorrectly selected.

### Cline
- **Release**: [v4.1.26](https://github.com/cline/cline/releases/tag/v4.1.26) adds Cloud tasks with a Local | Cloud toggle in Settings > API Configuration, separate model selection for cloud sessions, and a progress card showing repo, branch, and sandbox startup steps.

### Hermes Agent
- **Hot issue**: [#144685](https://github.com/NousResearch/hermes-agent/issues/144685) — security bug: `~/.hermes/.env` loaded with `override=True` can set `HERMES_HOME` itself, silently relocating the agent’s identity and policy on next start.
- **Hot issue**: [#144547](https://github.com/NousResearch/hermes-agent/issues/144547) — lifecycle guard blocks `gateway restart/stop/uninstall` but not `hermes update`, which drains, SIGKILLs, and replaces the gateway code tree unguarded.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

**Unavailable today:** [OpenAI Codex](https://github.com/openai/codex)

---

## Agent Tooling

No stable releases, hot issues or news items today.

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Show HN: Hob - Open-source, on device alternative to Claude Cowork and ChatGPT](https://github.com/FrigadeHQ/hob) | Hacker News | [132 points, 31 comments](https://news.ycombinator.com/item?id=50246238) | An easier way to use AI on your own computer. A free, open-source alternative to Claude and ChatGPT that runs open-weight models like Gemma and gpt-oss locally on Mac, Windows and Linux. |
| [The Git Forge for Agent-Human Collaboration](https://entire.com/blog/the-git-forge-for-agent-human-collaboration) | Hacker News | [54 points, 35 comments](https://news.ycombinator.com/item?id=50247453) | Source control is at a breaking point. Today, we open the portal to a new kind of Git forge: reimagined review, CI integrations, code hosting, and continuous memory for every agent. |
| [Show HN: Proc-CLI – An agent-friendly CLI tool for process and port management](https://proc-cli.com/) | Hacker News | [21 points, 5 comments](https://news.ycombinator.com/item?id=50239041) | Semantic CLI tool for process management. Target by port, PID, name or path. |
| [OpenAI's agents talked to each other through the CPU Cache](https://the-decoder.com/openais-isolated-ai-agents-found-ways-to-talk-to-each-other-through-cpu-cache/) | Hacker News | [18 points, 1 comments](https://news.ycombinator.com/item?id=50251200) | OpenAI now trains its most powerful models without internet access, after an internal research model exploited a DNS misconfiguration in September and reached the open internet. In controlled tests, AI agents still found ways to communicate covertly through side channels. |
| [Show HN: AgentTrust – Zero-trust security and human approvals for AI agents](https://github.com/SRN0129/Agenttrust) | Hacker News | [14 points, 1 comments](https://news.ycombinator.com/item?id=50235909) | Enterprise Zero-Trust Security, Cascading Delegation, Human Approvals & Verifiable Audit Infrastructure for Autonomous AI Agents - SRN0129/Agenttrust |
| [LearnHarness – An Agent Harness for Learning](https://github.com/amosblomqvist/learnharness) | Hacker News | [10 points, 0 comments](https://news.ycombinator.com/item?id=50243281) | Agent harness for learning difficult things. Contribute to amosblomqvist/learnharness development by creating an account on GitHub. |
| [Slowth Money: a local AI agent for your financial goals](https://dev.to/javz/slowth-money-a-local-ai-agent-for-your-financial-goals-2ki2) | Dev.to | [23 reactions, 8 comments](https://dev.to/javz/slowth-money-a-local-ai-agent-for-your-financial-goals-2ki2) | This is a submission for the Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady. |
| [AI Agents Have the Keys to Your Computer. I Spent 8 Months Building an Antivirus for Them.](https://dev.to/id_1/ai-agents-have-the-keys-to-your-computer-i-spent-8-months-building-an-antivirus-for-them-349j) | Dev.to | [20 reactions, 7 comments](https://dev.to/id_1/ai-agents-have-the-keys-to-your-computer-i-spent-8-months-building-an-antivirus-for-them-349j) | A coding agent with terminal access can install a package, run a script, start a child process and... |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*