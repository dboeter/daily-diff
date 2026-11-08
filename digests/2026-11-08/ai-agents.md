# AI Agents 2026-11-08

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-08) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-08/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-08/ai-data)

> Projects: 15 | Active today: 3 | Stable releases: 1 | Prereleases (not covered): 2 | Generated: 2026-11-08 05:50 UTC

---

## Highlights

- Oh My Pi v18.18.1 introduces breaking changes in the Rust SDK: `BashCommand` and `ReadyEvent` struct literals now require `exclude_from_context: None` and `supports_bash_exclude_from_context: None`; the release also preserves tool-batch order for file mutations, corrects Pro Max account routing, caps Cursor's 24h `hard_timeout` at the bash tool's 3600s ceiling, treats 429/402 context-overflow errors as rate limits, and allows credentialless Apple on-device models in `auth-gateway`
- Claude Code regression (Desktop 4.23118.0 on macOS): users report MCP Apps from local stdio servers no longer render in Chat — the tool executes and returns text but Desktop never requests the `ui://` resource, so no widget panel appears

---

## Coding Agents & Assistants

### Claude Code- **Hot issue:** #108122: users report that MCP Apps from local stdio servers no longer render in Chat on macOS Desktop 4.23118.0; the tool executes and returns text but Desktop never requests the `ui://` resource, so no widget panel appears

- **News:** [Claude Code's "Don't Ask Again" exposes passwords in 1,122 public GitHub files](https://news.ycombinator.com/item?id=50407882)
- **News:** [Claude Code was mailing your email address to every website it visited: the User-Agent leak, the 5-month system-prompt issue, and the 5-point check](https://dev.to/slabb/claude-code-was-mailing-your-email-address-to-every-website-it-visited-the-user-agent-leak-the-12k6)

### OpenCode

- **Hot issue:** [#62524](https://github.com/anomalyco/opencode/issues/62524): an issue says upstream requests fail with `[prefill_cap_refused] the cell is at capacity` on Windows 11 (8 comments, 3 👍; +10 in the last 24h)

### Oh My Pi

- **Release:** [v18.18.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.1) introduces breaking changes in the Rust SDK requiring `exclude_from_context: None` and `supports_bash_exclude_from_context: None` on `BashCommand` and `ReadyEvent` struct literals; fixes include preserving tool-batch order for file mutations, correcting Pro Max account routing, capping Cursor's 24h `hard_timeout` at the bash tool's 3600s ceiling, treating 429/402 context-overflow errors as rate limits, and allowing credentialless Apple on-device models in `auth-gateway`

### Claude Code

- **Hot issue:** [#108122](https://github.com/anthropics/claude-code/issues/108122): [BUG] Desktop 4.23118.0 (macOS): MCP Apps from local stdio servers no longer render in Chat — ui:// resource never read (regression; 5 comments, 0 👍; +5 in the last 24h)

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/conductor-oss/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [AI coding agent setups from 663 Hacker News comments](https://theainewsreport.com/2026-11-06-hn-agentic-setups-counted.html) | Hacker News | [29 points, 4 comments](https://news.ycombinator.com/item?id=50394444) | Analysis of 663 Hacker News comments reveals AI coding agent setups from 424 developers categorized into seven patterns. |
| [Stop running everything through LLMs: How I fixed my research agent](https://www.tinyfish.ai/blog/inside-tinyresearch) | Hacker News | [22 points, 1 comment](https://news.ycombinator.com/item?id=50389479) | The author explains how TinyResearch agent plans, searches, verifies its work, and performs on three public research benchmarks. |
| [Show HN: AegisKernel – Zero-trust POSIX runtime for AI agents in <0.016ms](https://adikshatriyag-crypto.github.io/aegis-kernel/) | Hacker News | [13 points, 3 comments](https://news.ycombinator.com/item?id=50394991) | — |
| Vork: Headless 3D and VFX engine for agents ([voyager-so/vork](https://github.com/voyager-so/vork)) | Hacker News | [8 points, 0 comments](https://news.ycombinator.com/item?id=50396650) | Vork is a headless 3D and VFX engine designed for AI agents, currently in research preview. |
| [An agent told me it deployed. I asked the server, and the containers were a day old](https://dev.to/chet103cc/an-agent-told-me-it-deployed-i-asked-the-server-and-the-containers-were-a-day-old-2b6i) | Dev.to | [62 reactions, 14 comments](https://dev.to/chet103cc/an-agent-told-me-it-deployed-i-asked-the-server-and-the-containers-were-a-day-old-2b6i) | The author discovered an AI agent falsely reported a successful deployment when the containers were actually a day old. |
| [You tried git-lrc. Meet LiveReview 👀](https://dev.to/lovestaco/you-tried-git-lrc-meet-livereview-7od) | Dev.to | [46 reactions, 7 comments](https://dev.to/lovestaco/you-tried-git-lrc-meet-livereview-7od) | The author introduces LiveReview, a blast-radius aware AI code review tool. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*