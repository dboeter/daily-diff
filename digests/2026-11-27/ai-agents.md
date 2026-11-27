# AI Agents 2026-11-27

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-27) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-27/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-27/ai-data)

> Projects: 15 | Active today: 2 | Stable releases: 4 | Prereleases skipped: 3 | Spotted: 5 | Generated: 2026-11-27 08:06 UTC

---

## Highlights

- Cline's SDK v0.2.2 strips telemetry helper exports from @cline/llms, @cline/shared and @cline/core and removes the options argument from writeGlobalSettings, setTelemetryOptOutGlobally and setAutoUpdateEnabledGlobally.
- Google DeepMind says its AI agents now run experiments autonomously for upcoming Gemini models, while its research chief states the lab is far from recursive self-improvement and leaves the agents' chains of thought untrained for review.
- Google will require AI agents to reach Gmail, Drive and Workspace through its own MCP servers from February 2027, and the Gmail server can't send email, according to the report.

---

## Coding agents & assistants

### Claude Code

- [Back up your Claude Code sessions and use them on any machine](https://news.ycombinator.com/item?id=50655243) offers encrypted backups of Claude Code sessions that can be fetched and continued on any of your machines.
- [Show HN: Silent dictation for Claude Code via on-device lip reading](https://news.ycombinator.com/item?id=50655639) uses a local lip-reading model to type mouthed words into the Claude Code prompt.

### Cline

- **Release:** The SDK [sdk/sdk/v0.2.2](https://github.com/cline/cline/releases/tag/sdk/sdk/v0.2.2) removes several telemetry helper exports from `@cline/llms`, `@cline/shared` and `@cline/core` and drops the options argument from `writeGlobalSettings`, `setTelemetryOptOutGlobally` and `setAutoUpdateEnabledGlobally`; the [extension release](https://github.com/cline/cline/releases/tag/v4.1.28) refreshes the model catalog, no longer listing OpenAI ids the upstream catalog marks deprecated (such as `gpt-4o` and `gpt-5`) and adding the Concentrate and Prima Labs providers.

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [Oh My Pi](https://github.com/can1357/oh-my-pi), [jcode](https://github.com/1jehuang/jcode), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

Nothing new from Agent tooling ([OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)) today.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Google Will Make AI Agents Use Its MCP Servers. The Gmail One Can't Send Email](https://techstackups.com/articles/google-workspace-ai-agents-mcp/) | Hacker News | [321 points, 279 comments](https://news.ycombinator.com/item?id=50653477) | From February 2027, Google's terms will require AI agents to go through Google's own MCP servers to use Gmail, Drive and Workspace, and the piece notes the Gmail server cannot send email. |
| 🔓 [Notion's official MCP inject hidden upsell instructions into agent context](https://www.reddit.com/r/ClaudeCode/comments/1y4qm5o/heads_up_if_you_wire_notions_official_mcp_into/) | Hacker News | [54 points, 22 comments](https://news.ycombinator.com/item?id=50658093) | *Not confirmed by the vendor, a researcher or the press.* — |
| [AI agents now control part of DeepMind's compute for Gemini experiments](https://the-decoder.com/ai-agents-now-control-part-of-deepminds-compute-for-gemini-experiments-but-recursive-self-improvement-remains-distant/) | Hacker News | [53 points, 26 comments](https://news.ycombinator.com/item?id=50661218) | Google DeepMind says its AI agents now run experiments autonomously for upcoming Gemini models; research chief Koray Kavukcuoglu states the lab is far from recursive self-improvement, and the agents' chains of thought are left untrained so they can be reviewed. |
| [Show HN: Carry – Save every AI conversations as Markdown, in a folder you Own](https://carry.md/) | Hacker News | [30 points, 27 comments](https://news.ycombinator.com/item?id=50637995) | Carry automatically backs up ChatGPT, Claude, Gemini and Grok conversations as Markdown in a folder the user owns, letting them search saved chats and continue in another AI. |
| [Stop AI Agents Acting on Bluffs? A Strands Decider 2B Tool Gate Test](https://dev.to/aws-builders/stop-ai-agents-acting-on-bluffs-a-strands-decider-2b-tool-gate-test-5004) | Dev.to | [28 reactions, 29 comments](https://dev.to/aws-builders/stop-ai-agents-acting-on-bluffs-a-strands-decider-2b-tool-gate-test-5004) | The author tested Strands Decider 2B as an AI agent tool gate on 16 refund cases, using Nova Pro as a judge, across accuracy, thresholds, injection, latency and cost. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*