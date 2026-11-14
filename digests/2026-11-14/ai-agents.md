# AI Agents 2026-11-14

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-14) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-14/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-14/ai-data)

> Projects: 15 | Active today: 5 | Stable releases: 3 | Prereleases (not covered): 5 | Generated: 2026-11-14 06:05 UTC

---

## Highlights

- Hermes Agent issue #62336 reports terminal environment snapshots capture all environment variables including credentials from Bitwarden Secrets Manager to persistent plaintext files, exposing secrets to any process with filesystem read access
- Claude Code v2.1.325 fixes a security issue in zstd-compressed response decoding along with subagent model handling bugs in worktrees and session resumption losses after unclean exits
- OpenAI Codex rust-v0.169.0 adds multiple side-chat tabs, search across older tasks, custom model provider management from the terminal, and Cloud connection support for images and conversation archiving on macOS and Linux

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325) fixes a security issue in zstd-compressed response decoding, resolves subagent model handling bugs in worktrees and bare repos, fixes session resumption losing recent turns after unclean exits, and corrects shell commands running in deleted working directories.
- **Hot issue:** [#109508](https://github.com/anthropics/claude-code/issues/109508): users report a 403 "Attention Required" Cloudflare error when running `/login` on macOS, preventing authentication and loading user info; gained significant attention in the last 24 hours. (7 comments, 7 👍; +14 in the last 24h)
- **Hot issue:** [#108679](https://github.com/anthropics/claude-code/issues/108679): users report new Claude Code sessions on macOS get "Browser extension is not connected" for Chrome integration since 2026-11-07, while existing sessions continue working; retrying and restarts do not resolve it. (regression; 5 comments, 3 👍; +3 since 2026-11-12)
- **News:** [Elevated errors on claude.ai, Claude Code, and platform.claude.com](https://news.ycombinator.com/item?id=50481187) — status page confirms elevated errors across Claude services.
- **News:** [Anthropic upgrades Claude Code Projects to run parallel AI workers](https://news.ycombinator.com/item?id=50492141) — new beta experience enables parallel AI workers in Claude Code Projects.
- **News:** [Claude Code and Codex reverse engineered my 1994 Jeep's ECU over a $3 Arduino](https://news.ycombinator.com/item?id=50463399) — title only.

### OpenAI Codex

- **Release:** [rust-v0.169.0](https://github.com/openai/codex/releases/tag/rust-v0.169.0) adds multiple side-chat tabs in the terminal workspace, search across older tasks, collapsible turn details in transcripts, custom model provider management from the terminal, Ctrl+S to save diagnostic ZIPs locally, and Cloud connection support for images, model selection, and conversation archiving on macOS/Linux; fixes `codex exec` trust handling, plan handoff on "Yes, clear context and implement", Windows sandbox path handling, and pasted image orientation on macOS.
- **Hot issue:** [#61348](https://github.com/openai/codex/issues/61348): users request a continuous engineering workspace across ChatGPT, Work, and Codex with durable, verifiable project experience instead of disposable tasks; framed as a cross-product UX/product-design request. (14 comments, 0 👍; +13 in the last 24h)
- **News:** [Claude Code and Codex reverse engineered my 1994 Jeep's ECU over a $3 Arduino](https://news.ycombinator.com/item?id=50463399) — title only.

### OpenCode

- **Release:** [v2.3.0](https://github.com/anomalyco/opencode/releases/tag/v2.3.0) makes background subagents the default (return immediately, run concurrently, report when idle), quiets transcripts by summarizing tool calls into collapsible activity rows, adds jump-to-prompt navigation (Cmd+Alt+G), adds experimental MCP events and shell timeout background flags, moves local Windows shell commands to the process daemon, and adds LM Studio decision-model support.

### DeepSeek Harness

- **Prerelease:** [dsh-v0.2.2-rc.3](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.3) adds an experimental DeepSeek chat import plugin to bring past conversations from the DeepSeek App or web into the workspace, and fixes Windows desktop in-app updates that could fail and prevent automatic reopening.

### Hermes Agent

- **Hot issue:** [#62336](https://github.com/NousResearch/hermes-agent/issues/62336): an issue says terminal environment snapshots in `tools/environments/base.py` capture all environment variables — including credential-bearing vars from `bws run --` and Bitwarden Secrets Manager — to persistent plaintext files at `cache/terminal/hermes-snap-*.sh`, exposing secrets to any process with filesystem read access. (type/security; 19 comments, 0 👍; +3 in the last 24h)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [Oh My Pi](https://github.com/can1357/oh-my-pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Claude Meetings](https://claude.com/resources/articles/claude-meetings) | Hacker News | [87 points, 66 comments](https://news.ycombinator.com/item?id=50491097) | The new Claude Meetings integration adds the Claude AI assistant to video calls, letting it take notes, answer questions, and create docs and whiteboards during the meeting. |
| [AI agents have a big problem: Nobody wants to let them in](https://www.pcworld.com/article/3283946/ai-agents-have-a-big-problem-nobody-wants-to-let-them-in.html) | Hacker News | [15 points, 6 comments](https://news.ycombinator.com/item?id=50482661) | — |
| Show HN: Log every LLM call with tokens, cost, latency, and time to first token ([garritfra/llmtee](https://github.com/garritfra/llmtee)) | Hacker News | [10 points, 2 comments](https://news.ycombinator.com/item?id=50451943) | The Show HN project provides a self‑hosted LLM proxy that records every call’s token usage, cost, latency, and time‑to‑first‑token. |
| [A VS Code extension to turn ANY free chatbot website into an AI agent (kind of)](https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb) | Dev.to | [41 reactions, 80 comments](https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb) | The author describes a VS Code extension that can turn any free chatbot site into an AI agent, noting the recent free promo for Qoder, Alibaba’s AI IDE. |
| [How To Review Pull Requests with Kiro CLI and GitHub Actions](https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b) | Dev.to | [30 reactions, 5 comments](https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b) | The article explains how to review pull requests using Kiro CLI’s headless mode together with GitHub Actions. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*