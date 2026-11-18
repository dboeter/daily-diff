# AI Agents 2026-11-18

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-18) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-18/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-18/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-18/ai-data)

> Projects: 15 | Active today: 5 | Stable releases: 9 | Prereleases (not covered): 5 | Generated: 2026-11-18 07:08 UTC

---

## Highlights

- socket.dev reports that compromised versions 1.26.1 and 1.26.2 of Microsoft's agent-framework PyPI package use `.pth` startup hooks to exfiltrate Azure, GitHub Actions, and CI/CD credentials.
- Oh My Pi v18.22.1–v18.22.2 carries a breaking change: the JavaScript eval `commit` helper now validates its arguments strictly, throwing a `TypeError` on unknown option names or non-object options.
- A Harvard study says AI coding agents increased code production by 30%, while completed work did not measurably rise and review time grew by 49%.

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.327](https://github.com/anthropics/claude-code/releases/tag/v2.1.327) fixes several data-loss and safety bugs: stopping a Remote Control server in worktree mode no longer deletes a running session's git-ignored files such as `.env`, self-hosted runners using `--use-anthropic-git-proxy` no longer delete a non-empty directory named by `GIT_CONFIG_GLOBAL`, and `claude mcp add`/`claude mcp remove` with project scope no longer drop other top-level keys from `.mcp.json`. It adds a confirmation before `/install-github-app` changes a repository, a `/status` listing of broken agent, skill, command and output-style files and other misconfigurations, and `/tui classic` as the name for the non-fullscreen renderer.
- **News:** [How the Claude Code team thinks about verification](https://news.ycombinator.com/item?id=50529612) describes how end-to-end, property and differential tests let coding agents verify their work with evidence, and what the Claude Code team does to keep its verifiers honest.

### OpenAI Codex

- **Release:** [rust-v0.169.1](https://github.com/openai/codex/releases/tag/rust-v0.169.1)–[rust-v0.170.0](https://github.com/openai/codex/releases/tag/rust-v0.170.0) fixes MCP OAuth credential races during cancellation, login, and logout, keeps child threads and permission updates from losing existing sandbox restrictions, and removes duplicate file search results. It adds WebRTC negotiation for realtime voice calls in the TUI and experimental support for using identically named MCP servers across environments.
- **Hot issue:** [#57101](https://github.com/openai/codex/issues/57101): An issue reports that on Windows the Codex Computer Use helper and its capture-access record stay open — leaving a gold/yellow border around the display — roughly five hours after a screenshot-producing turn completes, and asks that capture resources be released when their owning work ends. (57 comments, 9 👍; +15 in the last 24h)

### OpenCode

- **Release:** [v1.19.6](https://github.com/anomalyco/opencode/releases/tag/v1.19.6)–[v2.3.2](https://github.com/anomalyco/opencode/releases/tag/v2.3.2) fixes GPT-6.2 models re-billing the system prompt as uncached input on every step and stops sessions with many images from sending oversized requests. Headline additions include timed-out shell commands moving to the background instead of being killed, background compaction now on by default, GPT 6.2 models showing up in the model picker when signing in with ChatGPT, and OpenCode 1 offering an in-app upgrade to OpenCode 2.0.
- **Hot issue:** [#37216](https://github.com/anomalyco/opencode/issues/37216): A feature request asks for i18n support in the TUI, whose strings are hardcoded in English while the app, desktop and console packages already support 17+ locales. (21 comments, 0 👍; +11 in the last 24h)

### Oh My Pi

- **Release:** [v18.22.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.1)–[v18.22.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.2) has a breaking change: the JavaScript eval `commit` helper now validates its arguments strictly, throwing a `TypeError` on unknown option names or non-object options, and the obsolete `wayland-pipewire` Cargo feature and `OMP_NATIVE_FEATURES` variable are removed. Fixes include no longer feeding failed tool calls back to the model as refusal explanations and OAuth accounts refreshed through an auth broker keeping their stored routing metadata; it also adds a native Kiro provider that signs in with AWS IAM Identity Center, AWS Builder ID, Google, GitHub, or a Kiro API key and reports Kiro credits in `/usage`.
- **Hot issue:** [#19578](https://github.com/can1357/oh-my-pi/issues/19578): An issue reports that `openai-codex/gpt-6.2-sol` and `gpt-6.2-astra` are missing from OMP's Codex model list after `omp models refresh` and that a direct request for Sol fails model resolution while the native Codex CLI lists both and completes a Sol request, though the reporter notes the workspace and OMP credential used were not verified. (9 comments, 2 👍; +11 in the last 24h)

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

### OpenShell

- **Release:** [v0.1.9](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.9) moves the Go SDK to `github.com/ai-openshell/sdk-go` and deprecates `github.com/NVIDIA/OpenShell/sdk/go`; wildcard network policy endpoints no longer accept private IP literals alone unless an exact endpoint or `allowed_ips` grant is present, middleware selectors cannot include a port, and Helm charts with `service.metricsPort` set to `0` or `false` fail to render, with `metrics.enabled` replacing the port value. It also says Postgres gateway migration `010` builds indexes on `objects` with `CREATE INDEX` and blocks writes, fixes write-method authorization denial events to report Create, Update, or Delete by `class_uid: 6003` and `status_id: 2`, and includes opt-in HTTP streaming hooks plus `mutation_admission_limit_per_caller` and `mutation_replay_window_seconds` controls.

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Harvard researchers find AI coding agents shifted the bottleneck to code review](https://complexdiscovery.com/harvard-researchers-find-ai-coding-agents-shifted-the-bottleneck-to-code-review/) | Hacker News | [149 points, 194 comments](https://news.ycombinator.com/item?id=50538303) | A Harvard study says AI coding agents increased code production by 30%, while completed work did not measurably rise and review time grew by 49%. |
| [Launch HN: StarSling (YC P25) – Self-improving CI for agent-volume repos](https://starsling.dev) | Hacker News | [64 points, 37 comments](https://news.ycombinator.com/item?id=50536468) | StarSling, a YC P25 startup, says its GitHub Actions runners are a drop-in replacement for ubuntu-latest, up to 10x faster, and include AI agents that open CI optimization pull requests. |
| [Advancing computer-use agents for healthcare teams](https://openai.com/index/advancing-computer-use-for-healthcare-teams/) | Hacker News | [47 points, 30 comments](https://news.ycombinator.com/item?id=50535898) | — |
| [How long have we got before the agent output is enshittified?](https://rachsmith.com/how-long-until-agent-output-turns-to-shit) | Hacker News | [15 points, 16 comments](https://news.ycombinator.com/item?id=50531129) | The author asks how long before the output of AI agents begins inevitable enshittification. |
| 🔓 [Microsoft's agent-framework PyPI package Compromised with Credential Stealer](https://socket.dev/blog/agent-framework-pypi-package-compromised-with-credential-stealer) | Hacker News | [14 points, 2 comments](https://news.ycombinator.com/item?id=50542084) | A socket.dev report says compromised versions 1.26.1 and 1.26.2 of Microsoft's agent-framework PyPI package use .pth startup hooks to exfiltrate Azure, GitHub Actions, and CI/CD credentials. |
| Spaceship IDE – Realtime Steering with Cerebras Ultra-Low Latency LLM ([chuanqisun/spaceship](https://github.com/chuanqisun/spaceship)) | Hacker News | [5 points, 0 comments](https://news.ycombinator.com/item?id=50536955) | Spaceship IDE advertises realtime steering of ideas using a Cerebras ultra-low-latency LLM. |
| [Ignite 2026: Copilot is "the new OS for work," and now Office runs inside of it](https://arstechnica.com/gadgets/2026/11/microsoft-calls-copilot-the-new-os-for-work-at-ignite-keynote/) | Hacker News | [5 points, 1 comment](https://news.ycombinator.com/item?id=50542314) | The Ars Technica report says Copilot is the new OS for work, with Word, Excel, and PowerPoint running inside it and always-on agents are next. |
| [AI agents open 17 million pull requests a month. I built a gate that rejects the ones that lie.](https://dev.to/aws-builders/ai-agents-open-17-million-pull-requests-a-month-i-built-a-gate-that-rejects-the-ones-that-lie-46n7) | Dev.to | [30 reactions, 18 comments](https://dev.to/aws-builders/ai-agents-open-17-million-pull-requests-a-month-i-built-a-gate-that-rejects-the-ones-that-lie-46n7) | The author writes that AI agents open 17 million pull requests a month and built a deterministic Python gate that rejects Amazon Nova Pro fixes when the fix cannot be proven. |
| [Once Upon Agentic AI (Part 2): Develop your own MCP server and cast its tools from Strands Agents](https://dev.to/aws/once-upon-agentic-ai-part-2-develop-your-own-mcp-server-and-cast-its-tools-from-strands-agents-9ob) | Dev.to | [29 reactions, 7 comments](https://dev.to/aws/once-upon-agentic-ai-part-2-develop-your-own-mcp-server-and-cast-its-tools-from-strands-agents-9ob) | The author's Part 2 entry in Once Upon Agentic AI describes developing an MCP server and casting its tools from Strands Agents. |
| 🔓 [My Agent Scrubbed a Leaked API Key by Force-Pushing main. It Made Everything Worse.](https://dev.to/debashish_ghosal/my-agent-scrubbed-a-leaked-api-key-by-force-pushing-main-it-made-everything-worse-57a) | Dev.to | [24 reactions, 7 comments](https://dev.to/debashish_ghosal/my-agent-scrubbed-a-leaked-api-key-by-force-pushing-main-it-made-everything-worse-57a) | *Not confirmed by the vendor, a researcher or the press.* The author recounts how their agent removed a leaked API key by force-pushing main and made everything worse. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*