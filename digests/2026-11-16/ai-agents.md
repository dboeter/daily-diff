# AI Agents 2026-11-16

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-16) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-16/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-16/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-16/ai-data) · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-16/ai-trends)

> Projects: 15 | Active today: 3 | Stable releases: 1 | Prereleases (not covered): 4 | Generated: 2026-11-16 09:26 UTC

---

## Highlights

- Oh My Pi v18.20.3 ships breaking changes: removed public `isXdDevicePath` export, renamed `clickCount` to `count`, and viewport screenshot coordinates now use displayed image coordinates by default (use `css: true` for CSS pixels).
- A 27-byte unread telemetry response causes Claude Desktop on Linux to leak file descriptors until the renderer freezes every few days, discovered after a 1.5 TiB core dump.
- Attest framework introduces testing of AI agent behavior by verifying tool calls and state changes, with replay of recorded model responses and CI enforcement of checks.

---

## Coding Agents & Assistants

### Claude Code

- **News:** [I run multiple Claude Code accounts on one Mac](https://news.ycombinator.com/item?id=50506993) — A user describes how they run multiple Claude Code accounts on a single Mac.

### Oh My Pi

- **Release:** [v18.20.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.3) — Breaking changes: removed public `isXdDevicePath` export from `providers/cursor-pi-args`; renamed browser `tab.clickAt()` option `clickCount` to `count`; viewport screenshot coordinates now use displayed image coordinates when scaled (use `css: true` for CSS pixels). Fixes: rate-limit handling for Mistral and other OpenAI-compatible providers now fails immediately with actionable error. Features: added `mnemopi.recallRelevance` (`off`, `auto`, `on`) to filter automatic memory recall; path-scoped entries for `bash.patterns` and `bashInterceptor.patterns` resolved per working directory; added `bash.allowedEnvVars` and per-rule `env` lists; subagents preserve `@upstream` provider pinning; added `--no-judge`, `--no-spotlight`, `--offline` options; per-rule TTSR `repeatMode` frontmatter (`once`, `after-gap`, `always`); compound bash approval prompts show each command segment separately; removed `seance` agent, `/seance` command, and task tool's `sourceSession` parameter.

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

### herdr

- **News:** [Show HN: Canban – Kanban and Workflow and Herdr Workbench for CLI Agents](https://news.ycombinator.com/item?id=50508535) describes Canban as combining Kanban with the herdr workbench for CLI agents.

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [Conductor](https://github.com/microsoft/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Agentic AI Designs an Analog Synthesizer](https://cpldcpu.github.io/2026/11/14/touchsynth/) | Hacker News | [14 points, 2 comments](https://news.ycombinator.com/item?id=50512933) | An analog monophonic synthesizer built from around 200 components with a transistor ladder filter and touch keys had its circuit, simulation, PCB, firmware, and most bring-up completed by Claude Opus 5.5. |
| [A 27-byte telemetry response nobody reads freezes Claude Desktop every two days](https://blog.dfb.sh/blog/claude-desktop-freeze/) | Hacker News | [9 points, 1 comment](https://news.ycombinator.com/item?id=50499446) | Claude Desktop on Linux froze every few days because an unread 27-byte telemetry response caused Chromium to leak file descriptors until the renderer exhausted them, discovered after two months and a 1.5 TiB core dump. |
| [Show HN: Attest – Test what AI agents do, not just what they say](https://attest-framework.github.io/) | Hacker News | [7 points, 0 comments](https://news.ycombinator.com/item?id=50509107) | Attest is a framework that tests AI agent behavior by verifying tool calls and state changes, allowing replay of recorded model responses and enforcement of checks in CI. |
| Show HN: Skillset: Easily curate and install agent skills collection ([itsmeyaw/skillset](https://github.com/itsmeyaw/skillset)) | Hacker News | [5 points, 0 comments](https://news.ycombinator.com/item?id=50511761) | Skillset provides a CLI for curating and installing only necessary agent skills to reduce token consumption. |
| [Designing nextest's install scripts](https://sunshowers.io/posts/nextest-install-scripts/) | Lobste.rs | [3 points, 0 comments](https://lobste.rs/s/tbpfcn/designing_nextest_s_install_scripts) | The author describes building nextest's install scripts carefully with the assistance of coding agents. |
| [Give Your Voice Agent Hands: Let It Act Across Sales and Marketing](https://dev.to/therealmrmumba/give-your-voice-agent-hands-let-it-act-across-sales-and-marketing-fn2) | Dev.to | [39 reactions, 0 comments](https://dev.to/therealmrmumba/give-your-voice-agent-hands-let-it-act-across-sales-and-marketing-fn2) | The article illustrates how a voice agent named Maya can perform post-call administrative tasks across sales and marketing workflows. |
| [I Told My Agent Who Sent the Message. It Mostly Stopped Saying We Were Talking.](https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8) | Dev.to | [22 reactions, 12 comments](https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8) | The author found that informing their AI agent about the message sender (e.g., "sender=scheduler, not Keniel") largely stopped the agent from incorrectly claiming they were conversing. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*