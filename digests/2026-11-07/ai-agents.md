# AI Agents 2026-11-07

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-07) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-07/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-07/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-07/ai-data)

> Projects: 15 | Active today: 5 | Stable releases: 3 | Prereleases (not covered): 3 | Generated: 2026-11-07 05:47 UTC

---

## Highlights

- Claude Code v2.1.319 changes auto-mode behavior when telemetry or feature flags are disabled: server-uncheckable calls are now prompted or denied with no built-in fallback (use `CLAUDE_CODE_AUTO_MODE_SERVER=0` to retain old behavior); also adds MCP task background execution, `permissions.denyInsteadOfPrompting`, spend tracking in `/usage`, and gateway admin settings.
- A report shows Claude Code sends the user's email address in the User-Agent header during web searches without consent, resulting in spam.
- OpenAI Codex users report all local projects vanish from the Projects list after switching from an enterprise back to a personal account on Windows, though folders and chats remain visible but ungrouped.

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.319](https://github.com/anthropics/claude-code/releases/tag/v2.1.319) changes auto mode when telemetry/feature flags are off (server-uncheckable calls are asked about or denied with no built-in fallback; use `CLAUDE_CODE_AUTO_MODE_SERVER=0` to keep old behavior), adds MCP task background execution, `permissions.denyInsteadOfPrompting`, `/claude-api latency-optimize`, `CLAUDE_CODE_DISABLE_FEATURE_FLAGS`, spend tracking in `/usage`, and gateway admin settings.
- **News:** [Claude Code sends your email address to websites](https://news.ycombinator.com/item?id=50385272) reports the User-Agent header includes the user's email during web searches without consent, causing spam.
- **Hot issue:** [#107454](https://github.com/anthropics/claude-code/issues/107454): users report Remote Control write tools in auto mode stall on a server-side approval card with no "always allow" option since ~4 Nov; [#107467](https://github.com/anthropics/claude-code/issues/107467): users report Artifact.read no longer accepts `path`/`paths` in 2.1.318, breaking Migrated Design canvas file reading. (#107454: regression; 6 comments, 0 👍; +6 in the last 24h) (#107467: regression; 2 comments, 1 👍; +3 in the last 24h)

### OpenAI Codex

- **Hot issue:** [#59895](https://github.com/openai/codex/issues/59895): users report all local projects disappear from the Projects list after switching from enterprise back to personal account on Windows, though folders exist and chats remain visible but ungrouped. (9 comments, 2 👍; +10 in the last 24h)

### OpenCode

- **Release:** [v2.2.6](https://github.com/anomalyco/opencode/releases/tag/v2.2.6) adds opt-in MCP connection pooling (`pool: true`), `--archived` and `--worktree` flags for `opencode run`, provider/model-specific session warming, experimental bytecode VM for Code Mode (`experimental.codemode_vm`), PowerShell 7 Microsoft Store support, and Azure Messages for Foundry Claude models.

### Oh My Pi

- **Release:** [v18.18.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.0) fixes Mistral discovery listing non-chat models, cached catalog replacement on failed refresh, transcript freezing after provider restarts, bash tool card `cd` visualization, `cd ;` working directory handling, task-file approval symlink protection, subagent instruction formatting, hindsight memory persistence, long multi-byte bash command crashes, `grep -e`/`rg -e` pattern handling, and non-UTF-8 byte visualization.
- **Hot issue:** [#18341](https://github.com/can1357/oh-my-pi/issues/18341): users report the Antigravity provider receives 403 PERMISSION_DENIED from Google Cloud Code Assist API due to ToS violation, possibly from upstream authentication/fingerprint changes. (10 comments, 2 👍; +12 in the last 24h)

### Hermes Agent

- **Hot issue:** [#138974](https://github.com/NousResearch/hermes-agent/issues/138974): users report upgrade to v0.22.0+119.g0e427d7 breaks inherited ACLs on `%LOCALAPPDATA%\hermes\tools\*` on Windows, removing user access to tool executables and causing desktop backend spawn failure ("Access is denied"). (type/security; 6 comments, 0 👍; +3 in the last 24h)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/conductor-oss/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [ChatGPT silently passes data between connectors and the bounty wants an ID card](https://community.openai.com/t/security-follow-up-tool-call-silently-routed-to-a-different-connector/1413053) | Hacker News | [83 points, 35 comments](https://news.ycombinator.com/item?id=50399569) | ChatGPT silently switched between connectors during a conversation, passing a one-time confirmation code from the first connector's widget to the second without informing the user. |
| [Outbound SIP calling is now available to all organizations](https://developers.openai.com/api/docs/guides/voice-sip) | Hacker News | [62 points, 52 comments](https://news.ycombinator.com/item?id=50399695) | OpenAI has made outbound SIP calling available to all organizations, enabling phone calls to be connected to OpenAI via SIP. |
| [Perplexity launches AI agents for work](https://www.perplexity.ai/en-GB/hub/blog/teammates-are-agents-for-complex-ongoing-work) | Hacker News | [60 points, 53 comments](https://news.ycombinator.com/item?id=50395866) | Perplexity launched AI agents called teammates that coordinate to manage ongoing projects across operations, marketing, and other functions. |
| [Show HN: Agents infer Lego mechanisms from sources, then animate them](https://github.com/anteloc/ldraw-mecha/tree/v0.5.0) | Hacker News | [25 points, 1 comment](https://news.ycombinator.com/item?id=50397325) | The author built an agent system that infers Lego mechanisms from sources and animates them in Blender. |
| Show HN: Tmux-restore saves tmux windows and agent sessions across reboots ([andrewboldi/tmux-restore](https://github.com/andrewboldi/tmux-restore)) | Hacker News | [22 points, 9 comments](https://news.ycombinator.com/item?id=50355009) | The author created tmux-restore, a tool that restores tmux sessions, layouts, scrollback, and reopens AI agent conversations (including Claude Code, Codex, and Gemini CLI) after a reboot. |
| Show HN: Agentic Identity Broker, OAuth Delegation for AI Agents ([zalando-incubator/agentic-identity-broker](https://github.com/zalando-incubator/agentic-identity-broker)) | Hacker News | [21 points, 3 comments](https://news.ycombinator.com/item?id=50393235) | The author developed an identity broker for AI agents that handles OAuth2 delegation and consent management. |
| [Don't Write Markdown Files for Your Coding Agent. Write Scripts.](https://dev.to/dannwaneri/dont-write-markdown-files-for-your-coding-agent-write-scripts-j00) | Dev.to | [51 reactions, 33 comments](https://dev.to/dannwaneri/dont-write-markdown-files-for-your-coding-agent-write-scripts-j00) | The author argues that writing scripts, not markdown files, is necessary to box coding agents into deterministic actions. |
| [One Markdown File Can Hijack Your AI Coding Agent: The Hidden Cost of Blindly Trusting AGENTS.md](https://dev.to/johnnylemonny/one-markdown-file-can-hijack-your-ai-coding-agent-the-hidden-cost-of-blindly-trusting-agentsmd-167n) | Dev.to | [44 reactions, 30 comments](https://dev.to/johnnylemonny/one-markdown-file-can-hijack-your-ai-coding-agent-the-hidden-cost-of-blindly-trusting-agentsmd-167n) | The author demonstrates how a single malicious AGENTS.md or CLAUDE.md file can hijack an AI coding agent to steal OAuth tokens and execute shell commands, and explains how to lock down the workflow. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*