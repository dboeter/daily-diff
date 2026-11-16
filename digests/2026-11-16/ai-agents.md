# AI Agents 2026-11-16

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-16) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-16/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-16/ai-data) · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-16/ai-trends)

> Projects: 15 | Active today: 3 | Stable releases: 1 | Prereleases (not covered): 4 | Generated: 2026-11-16 06:09 UTC

---

## Highlights

- Oh My Pi v18.20.3 removes the public `isXdDevicePath` export, renames `tab.clickAt()`'s `clickCount` to `count`, changes screenshot coordinates to displayed image pixels (opt in to CSS pixels with `css: true`), and drops the `seance` agent, `/seance` command, and `sourceSession` parameter.
- Attest framework introduced: tests AI agents by verifying tool calls and state changes, with recorded model response replay for CI.
- A 27-byte unread telemetry response caused Chromium to leak file descriptors, freezing Claude Desktop on Linux every two days until debugged via a 1.5 TiB core dump.

---

## Coding Agents & Assistants

### Claude Code

- **News:** [I run multiple Claude Code accounts on one Mac](https://news.ycombinator.com/item?id=50506993) describes how to run multiple Claude Code accounts on a single Mac.

### Oh My Pi

- **Release:** [v18.20.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.3) removes the public `isXdDevicePath` export from `providers/cursor-pi-args` and renames `tab.clickAt()`'s `clickCount` option to `count` to match `tab.click()`. Browser viewport screenshot coordinates now use displayed image coordinates when scaled; pass `css: true` to provide viewport CSS pixels explicitly.
- **Release:** The release adds opt-in `mnemopi.recallRelevance` (`off`, `auto`, or `on`; default `off`) to filter automatic memory recall for task relevance, path-scoped entries for `bash.patterns` and `bashInterceptor.patterns` resolved per working directory, and `bash.allowedEnvVars` with per-rule `env` lists for explicitly named environment-variable prefixes. Subagents now preserve `@upstream` provider pinning on inherited models, and new `--no-judge`, `--no-spotlight`, and `--offline` options restrict auxiliary services to the active model's provider or disable cross-provider services.
- **Release:** Compound bash approval prompts now show each command segment separately, distinguishing allowed segments from those requiring approval, and per-rule TTSR `repeatMode` frontmatter (`once`, `after-gap`, or `always`) overrides the global repeat policy. The `seance` agent, `/seance` command, and the task tool's `sourceSession` parameter are removed. Rate-limit handling for Mistral and other OpenAI-compatible providers is fixed so requests with no available allowance fail immediately with an actionable error suggesting a model or plan change.

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

### herdr

- **News:** [Show HN: Canban – Kanban and Workflow and Herdr Workbench for CLI Agents](https://news.ycombinator.com/item?id=50508535) introduces Canban as a combination of Kanban and the herdr workbench for CLI agents.

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [Conductor](https://github.com/microsoft/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Agentic AI Designs an Analog Synthesizer](https://cpldcpu.github.io/2026/11/14/touchsynth/) | Hacker News | [12 points, 1 comment](https://news.ycombinator.com/item?id=50512933) | An analog monophonic synthesizer with ~200 components and a transistor ladder filter was largely designed by Claude Opus 5.5. |
| [A 27-byte telemetry response nobody reads freezes Claude Desktop every two days](https://blog.dfb.sh/blog/claude-desktop-freeze/) | Hacker News | [9 points, 1 comment](https://news.ycombinator.com/item?id=50499446) | The author debugged a 1.5 TiB core dump over two months to find that an unread 27-byte telemetry response caused Chromium to leak file descriptors, freezing Claude Desktop on Linux every couple of days. |
| [Show HN: Attest – Test what AI agents do, not just what they say](https://attest-framework.github.io/) | Hacker News | [6 points, 0 comments](https://news.ycombinator.com/item?id=50509107) | Attest is a framework that tests AI agents by verifying tool calls and state changes, supporting replay of recorded model responses in CI. |
| [I Told My Agent Who Sent the Message. It Mostly Stopped Saying We Were Talking.](https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8) | Dev.to | [22 reactions, 11 comments](https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8) | The author found that adding a sender identifier line to messages largely stopped their AI agent from incorrectly claiming it was conversing with the user. |
| [Your AI Coding Agent Wrote a 600-Word Summary. What It Skipped Is in the Fine Print.](https://dev.to/debashish_ghosal/your-ai-coding-agent-wrote-a-600-word-summary-what-it-skipped-is-in-the-fine-print-1h7d) | Dev.to | [20 reactions, 9 comments](https://dev.to/debashish_ghosal/your-ai-coding-agent-wrote-a-600-word-summary-what-it-skipped-is-in-the-fine-print-1h7d) | The author examines how AI coding agents produce lengthy summaries while omitting critical details in the fine print. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*