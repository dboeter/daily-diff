# AI Agents 2026-10-29

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-29) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-29/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-29/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-29/ai-data)

> Projects: 16 | Active today: 5 | Stable releases: 4 | Prereleases (not covered): 9 | Generated: 2026-10-29 05:34 UTC

---

## Highlights

- Anthropic introduces `CLAUDE_CODE_EVEN_MORE_DANGEROUSLY_SKIP_PERMISSIONS` flag letting Claude Code users bypass all permission prompts entirely
- Gemini CLI `--yolo` mode repeatedly halts with “CRITICAL SECURITY WARNING” on project temp dirs, workspace scripts, and home paths; `findUntrustedFlags` lacks a settings toggle to suppress it
- OpenCode v2.2.1 adds `/goal` command to keep sessions working toward an objective until reviewer confirmation and experimental image generation via `experimental.image_generate`

---

## Coding Agents & Assistants

### Claude Code
- **Hot issue:** In v2.1.150 on WSL, the mouse scroll wheel sends arrow keys instead of scrolling conversation output, cycling through input history; regression since previous version. [#65833](https://github.com/anthropics/claude-code/issues/65833)
- **News:** A Bun preload script disables `agent_summary` and cuts ~15–20% token overhead from the status line, showing the feature burns significant context. [Hacker News](https://news.ycombinator.com/item?id=50284255)

### Gemini CLI
- **Hot issue:** `--yolo` mode repeatedly halts with “CRITICAL SECURITY WARNING: Untrusted Command Flags Detected” on project temp dirs, workspace `.sh` scripts, and `~/` paths; `findUntrustedFlags` lacks a settings toggle to suppress it. [#30004](https://github.com/google-gemini/gemini-cli/issues/30004)

### OpenCode
- **Release:** [v2.2.1](https://github.com/anomalyco/opencode/releases/tag/v2.2.1) adds `/goal` command to keep sessions working toward an objective until reviewer confirmation, and experimental image generation via `experimental.image_generate`; [v1.19.5](https://github.com/anomalyco/opencode/releases/tag/v1.19.5) fixes failed TUI worker requests returning errors instead of hanging; [process-daemon-v0.3.2](https://github.com/anomalyco/opencode/releases/tag/process-daemon-v0.3.2) updates the PTY protocol to v7.

### Oh My Pi
- **Release:** [v18.13.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.13.3) raises Bun engine requirement to ≥1.4.4 and fixes chat-completion context estimates that incorrectly counted dropped thinking tokens, preventing premature compaction.

### Hermes Agent
- **Hot issue:** In multiplexed gateway mode, mid-turn progress and background-review notices from secondary profiles (e.g., `yori`) are delivered to the primary profile’s Telegram bot instead of their own, cross-contaminating streams across four bots. [#143364](https://github.com/NousResearch/hermes-agent/issues/143364)

**Quiet today:** [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

**Unavailable today:** [OpenAI Codex](https://github.com/openai/codex)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [The Agent SDK](https://cursor.com/blog/agent-sdk) | Hacker News | [110 points, 116 comments](https://news.ycombinator.com/item?id=50273731) | Cursor's Agent SDK framework lets developers define managed agents like Bugbot, Security Reviewer, and Rollouts in code and deploy them with a single command. |
| [Anthropic now lets Claude users jump out of plane without parachute](https://www.theregister.com/ai-and-ml/2026/10/27/anthropic-now-lets-claude-users-jump-out-of-plane-without-parachute/5305807) | Hacker News | [8 points, 2 comments](https://news.ycombinator.com/item?id=50274666) | Anthropic introduces a CLAUDE_CODE_EVEN_MORE_DANGEROUSLY_SKIP_PERMISSIONS flag that lets Claude Code users bypass permission prompts entirely. |
| [Show HN: Cirkit – Annotate, Trace, and Ask AI About Schematic PDFs](https://www.cirkit.us/demo/) | Hacker News | [4 points, 2 comments](https://news.ycombinator.com/item?id=50268880) | Cirkit converts schematic PDFs into collaborative hardware workspaces with BOM-aware parts, searchable notes, live equations, and an AI that reads the page. |
| [Dayjob: Tax – evaluating AI agents on 50 professional tax assignments](https://surgehq.ai/blog/dayjob-tax) | Hacker News | [219 points, 141 comments](https://news.ycombinator.com/item?id=50275626) | SurgeHQ's DAYJOB: Tax benchmark evaluates AI agents across 50 realistic tax assignments testing professional judgment and messy record navigation. |
| [How to cut your AI agent's input tokens: what worked, what failed, and a bench to measure yours](https://dev.to/anis_meziani_52aab42304a8/how-to-cut-your-ai-agents-input-tokens-what-worked-what-failed-and-a-bench-to-measure-yours-f90) | Dev.to | [16 reactions, 11 comments](https://dev.to/anis_meziani_52aab42304a8/how-to-cut-your-ai-agents-input-tokens-what-worked-what-failed-and-a-bench-to-measure-yours-f90) | The author reports their AI agent consumed 17,000 tokens before reading any input, sharing a 7-point checklist and open-source benchmark for reducing token usage. |
| [Four Ways a Test Can Lie to You](https://dev.to/kenwalger/four-ways-a-test-can-lie-to-you-2ibf) | Dev.to | [15 reactions, 10 comments](https://dev.to/kenwalger/four-ways-a-test-can-lie-to-you-2ibf) | The author describes four ways tests can be misleading after verifying a small application where an AI agent wrote most of the code. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*