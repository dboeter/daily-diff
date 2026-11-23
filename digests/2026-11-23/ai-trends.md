# Trends 2026-11-23

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-23) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-23/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-23/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-23/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-23/ai-data) · [⬜ Weekly Diff](https://dboeter.github.io/daily-diff/#2026-11-23/ai-weekly) · **🟫 Trends**

> Agents & tools: 44 | Models: 32 | Papers: 10 | Most discussed: 8 | Sources: GitHub Trending + GitHub Search API + OpenRouter + npm + Hugging Face + arXiv + Hacker News + Lobste.rs + Dev.to | Generated: 2026-11-23 07:21 UTC

---

## Highlights

- [tencent/hy4-flash-20261116](https://openrouter.ai/tencent/hy4-flash-20261116) is new to the OpenRouter usage table at #4, with 10.21T tokens on 2026-11-22. Its Hugging Face repo, [tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash), is #3 on Hugging Face trending and is listed as a 220B image-text-to-text model under a custom ("other") license.
- The [NariQ](http://arxiv.org/abs/2611.26157v1) paper reports that existing ≤3-bit quantizations of [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) match BF16 on AIME but solve at most 72% as many DeepSWE tasks. NariQ is a trellis-coded post-training quantization method that calibrates on tokens the BF16 model generates during agent sessions. The truncated abstract gives no NariQ result.
- In [anthropics/skills](https://github.com/anthropics/skills), [#2246](https://github.com/anthropics/skills/issues/2246) reports that mcp-builder's v1 Node streamable HTTP example listens on every interface with no Host validation. Unmerged PR [#2247](https://github.com/anthropics/skills/pull/2247) would bind it to loopback only and validate the Host header. Separately, unmerged PR [#1640](https://github.com/anthropics/skills/pull/1640) would add a path-traversal guard to the Python `get_document` resource example.

---

## Agents & coding tools

### 🚀 Agent & coding tool radar

*New tools (🆕: created or listed in the last 14 days) first, then each source's top movers; 🔥 also on last week's Trends page. OpenRouter: the app's rank this week / this month among OpenRouter apps, its tokens in the last 7 days. npm: downloads in the last 7 days. OpenRouter and npm "vs previous week": against the row's figure on last week's page, none when it was not there. GitHub: total stars (stars gained in the last 7 days, % on a week ago).*

| Tool | Source | Signal | Summary |
| :--- | :--- | :--- | :--- |
| 🔥 [Hermes Agent](https://hermes-agent.nousresearch.com/) | OpenRouter | week #3 / month #3, 14.15T tokens/week (+8.7% vs previous week) | Hermes Agent is an open-source, self-improving AI agent by Nous Research that runs persistently with memory across sessions. It builds reusable skills from experience and comes with 40+ built-in tools, including web search, browser automation and vision. |
| 🔥 [Claude Code](https://claude.ai/code) | OpenRouter | week #4 / month #4, 11.47T tokens/week (+6.2% vs previous week) | Claude Code is Anthropic's agentic coding tool that plans and executes changes across files from natural language prompts. It reads your entire codebase, runs tests and iterates on failures. |
| 🔥 [Kilo Code](https://kilocode.ai/) | OpenRouter | week #5 / month #5, 8.71T tokens/week (+24% vs previous week) | Kilo Code is an open-source AI coding agent for shipping code with agentic workflows. It works across VS Code, JetBrains and the CLI. |
| 🔥 [pi](https://pi.dev/) | OpenRouter | week #6 / month #6, 5.84T tokens/week (+46% vs previous week) | pi is a coding agent pitched on ownership, with a description saying that among many coding agents, "this one is yours." |
| 🔥 [Strix](https://strix.ai/) | OpenRouter | week #7 / month #11, 3.29T tokens/week (+29% vs previous week) | Strix is a set of open-source AI hackers that find and validate vulnerabilities in your code, APIs and infrastructure. Beyond finding issues, it opens fix PRs. |
| 🔥 [OpenHands](https://docs.all-hands.dev/) | OpenRouter | week #14 / month #17, 986.0B tokens/week (-1.8% vs previous week) | OpenHands is an AI coding agent that can run commands, browse the web and call APIs. |
| 🔥 [Codex](https://openai.com/codex/) | OpenRouter | week #9 / month #7, 3.22T tokens/week (-5.9% vs previous week) | Codex is a coding agent that helps you build and ship with AI. |
| 🔥 [omp](https://omp.sh/) | OpenRouter; npm | week #12 / month #10, 2.19T tokens/week (+3% vs previous week); 290,900 downloads/week (-1.6% vs previous week) | omp is a coding agent CLI with `read`, `bash`, `edit` and `write` tools. It also provides session management. |
| 🔥 [OpenClaw](https://openclaw.ai/) | OpenRouter | week #13 / month #8, 1.76T tokens/week (-34% vs previous week) | OpenClaw is an open-source AI agent that takes real actions on your behalf, from running commands and browsing the web to managing files and sending emails. It connects to your messaging apps. |
| [Hello Minds, powered by Ethoswarm](https://www.hellominds.ai/) | OpenRouter | week #22 / month #21, 538.6B tokens/week | Hello Minds, powered by Ethoswarm, is a personal AI agent that handles bookings, research and everyday tasks. It works through email and the messaging channels you already use, with no coding required. |
| [oonacode](https://www.npmjs.com/package/oonacode) | npm | 11,392 downloads/week | oonacode is a multi-provider coding agent made up of the `oona` CLI, a headless host service and a local web UI. Its npm package is a wrapper, and the native binary is installed through a per-platform optional dependency. |
| [Cline](https://cline.bot/) | OpenRouter | week #27 / month #20, 381.2B tokens/week | Cline is an open-source AI coding agent that lives inside your IDE and autonomously explores your codebase, edits files and runs terminal commands. It also uses browser automation. |

### 🧑‍💻 Coding agents

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| 🔥 [WhiteTowerAI/ohmygame](https://github.com/WhiteTowerAI/ohmygame) | TypeScript | 3,170 (+907, +40%) | WhiteTowerAI/ohmygame is an open-source app for making games with AI, pitched as your own one-person game studio. It includes a game canvas and lets you bring your own key. |
| 🔥 [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | TypeScript | 4,606 (+313, +7.3%) | PurpleDoubleD/locally-uncensored is a free, open-source local AI desktop studio that combines chat, image and video generation and a coding agent. It runs on Windows and Linux with no Docker, terminal or cloud required. |
| 🔥 [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code) | TypeScript | 30,881 (+305, +1%) | QwenLM/qwen-code is an open-source AI coding agent that lives in your terminal. |
| 🔥 [Gentleman-Programming/gentle-shell](https://github.com/Gentleman-Programming/gentle-shell) | TypeScript | 2,895 (+214, +8%) | Gentleman-Programming/gentle-shell is a Pi-native terminal workspace for AI-assisted development with parallel coding agents, live tasks, Git diffs, persistent memory and permission controls. It is powered by Gentle AI and Organic Driven Development (ODD). |
| [vastsa/PI-Desktop](https://github.com/vastsa/PI-Desktop) | TypeScript | 8,157 (+146, +1.8%) | vastsa/PI-Desktop is a local-first AI coding agent desktop app built on Electron with a Rust host core and the pi Agent Harness. It supports user-installable plugins. |
| [chaitin/MonkeyCode](https://github.com/chaitin/MonkeyCode) | TypeScript | 5,350 (+134, +2.6%) | chaitin/MonkeyCode is described, in Chinese, as an enterprise-grade AI office workbench. |
| 🔥 [JetBrains/thinkrail](https://github.com/JetBrains/thinkrail) | TypeScript | 8,407 (+112, +1.4%) | JetBrains/thinkrail is ThinkRail, an agentic IDE. It is pitched as getting better every time you use it. |
| [openBitFun/OpenBitFun](https://github.com/openBitFun/OpenBitFun) | Rust | 4,106 (+74, +1.8%) | openBitFun/OpenBitFun pairs a high-performance agent runtime written in Rust with a desktop application. It combines the depth of a Code Agent with general-purpose capabilities for work beyond software development. |

### 🧰 Agent harnesses & frameworks

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| 🔥 [ccch1mneyyy/dsh-Go](https://github.com/ccch1mneyyy/dsh-Go) | Dart | 30,398 (+6,142, +25%) | ccch1mneyyy/dsh-Go is a Dart app that puts a DeepSeek Harness in your pocket. It runs natively on a phone and can also remotely control your computer. |
| 🔥 [mdiri-ai/SoduWork](https://github.com/mdiri-ai/SoduWork) | JavaScript | 6,852 (+5,838, +576%) | mdiri-ai/SoduWork is a self-hosted, AI-native engine for teams and their agents. It is multi-harness and multi-agent. |
| 🔥 [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | Go | 55,505 (+3,700, +7.1%) | alibaba/open-code-review is a code review tool with a hybrid architecture of deterministic pipelines plus an LLM agent that produces precise line-level comments. It includes a built-in multi-language ruleset covering NPE, thread-safety, XSS and SQL injection, and is OpenAI and Anthropic compatible. |
| [ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui) | TypeScript | 21,255 (+3,620, +21%) | ag-ui-protocol/ag-ui defines AG-UI, the Agent-User Interaction Protocol. It is aimed at bringing agents into frontend applications. |
| [NVIDIA/SkillEvaluator](https://github.com/NVIDIA/SkillEvaluator) | Python | 4,419 (+2,409, +120%) | NVIDIA/SkillEvaluator is a multi-tier framework for evaluating AI agent skills and plugins with quality gates, security scanning and harness compatibility checks. It includes live agent evaluation that measures how skills affect agent behavior, plus reusable CI templates for any repository. |
| 🔥 [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop) | JavaScript | 20,850 (+1,555, +8.1%) | dataelement/dsh-desktop is DSHDesktop, a desktop version of DeepSeek Harness. |
| 🔥 [FailproofAI/failproofai](https://github.com/FailproofAI/failproofai) | TypeScript | 10,111 (+1,011, +11%) | FailproofAI/failproofai provides observability and enforcement for AI agent harnesses. It captures every run and applies policy enforcement for runtime reliability. |
| 🔥 [converge-ai-labs/agent-foundation](https://github.com/converge-ai-labs/agent-foundation) | Python | 1,511 (+213, +16%) | converge-ai-labs/agent-foundation (a13n) is an open-source platform for building, running and managing AI agents at scale on your own infrastructure. It includes a built-in harness, durable execution, multi-provider support and a management console. |

### 🕸️ Multi-agent & orchestration

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| 🔥 [pingdotgg/t3code](https://github.com/pingdotgg/t3code) | TypeScript | 72,704 (+10,681, +17%) | pingdotgg/t3code is a tool for controlling Claude Code, Codex and more. It works from any computer or phone. |
| 🔥 [Tencent/LoopForge](https://github.com/Tencent/LoopForge) | Go | 5,766 (+3,720, +182%) | Tencent/LoopForge provides self-hosted workflows for coding-agent delivery that orchestrate CodeBuddy, Codex and Claude Code. It uses scripts and human approval gates. |
| 🔥 [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | TypeScript | 116,072 (+1,852, +1.6%) | paperclipai/paperclip is an open-source app for managing agents at work. |
| 🔥 [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator) | TypeScript | 15,032 (+248, +1.7%) | OrchestratorInc/agent-orchestrator plans, runs and supervises fleets of agents from task to merged PR, supporting Claude Code, Codex and 35+ coding agents. It ships desktop apps for macOS, Windows and Linux, plus iPhone and Android apps. |
| [ParadevAI/Paradev](https://github.com/ParadevAI/Paradev) | TypeScript | 16,496 (+173, +1.1%) | ParadevAI/Paradev is an open-source alternative to the Codex App and Conductor for orchestrating coding agents in parallel. It runs on your own subscriptions. |
| [zqiren/Orbital](https://github.com/zqiren/Orbital) | Python | 1,122 (+139, +14%) | zqiren/Orbital is a Python project described only by the line "Context is yours. Agents are replaceable." |
| [awslabs/cli-agent-orchestrator](https://github.com/awslabs/cli-agent-orchestrator) | Python | 1,638 (+75, +4.8%) | awslabs/cli-agent-orchestrator provides multi-agent orchestration for AI coding CLIs such as Claude Code, Kiro and Codex. It coordinates them in isolated tmux sessions. |
| 🔥 [open-mercato/cezar](https://github.com/open-mercato/cezar) | TypeScript | 1,136 (+71, +6.7%) | open-mercato/cezar is an open-source orchestrator and ADE for running Claude Code, Codex, OpenCode, Pi and other AI coding agents in parallel. It can run locally or 24/7 on your own server. |

### 🔌 Agent tooling

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | Python | 72,972 (+4,731, +6.9%) | mvanhorn/last30days-skill is an AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket and the web. It then synthesizes a grounded summary. |
| 🔥 [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | Python | 9,894 (+3,748, +61%) | kajisho5/ffmpeg-skill is a local video editor for coding agents with 42 FFmpeg tools for Claude Code, Cursor and Codex. It exposes a machine-readable contract and an MCP server, with no cloud or API keys needed. |
| [GoogleChrome/modern-web-guidance-src](https://github.com/GoogleChrome/modern-web-guidance-src) | TypeScript | 10,300 (+3,575, +53%) | GoogleChrome/modern-web-guidance-src keeps your coding agent up to date with the latest web best practices. |
| 🔥 [backnotprop/plannotator](https://github.com/backnotprop/plannotator) | TypeScript | 14,515 (+2,815, +24%) | backnotprop/plannotator is a workspace for staying on top of agents by shaping, planning, annotating and reviewing code and sharing it with your team. It sends all feedback to agents with one click. |
| [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) | TypeScript | 12,039 (+2,683, +29%) | google-labs-code/stitch-skills is a library of Agent Skills designed to work with the Stitch MCP server. Each skill follows the Agent Skills open standard for compatibility with coding agents such as Antigravity, Gemini CLI, Claude Code and Cursor. |
| [tradermonty/claude-trading-skills](https://github.com/tradermonty/claude-trading-skills) | Python | 7,841 (+2,616, +50%) | tradermonty/claude-trading-skills is a set of Claude Code skills for equity investors and traders. It covers market analysis, technical charting, economic calendars, screeners and trading strategy development. |
| [aoci-spec/aoci-code](https://github.com/aoci-spec/aoci-code) | Go | 2,941 (+1,013, +53%) | aoci-spec/aoci-code is a persistent, Git-versioned map of your whole codebase and database schema that coding agents read before they touch anything. It is a local-first MCP server and CLI in Go that gives Claude Code, Codex, Cursor and opencode long-term context, memory and code intelligence. |
| [Get-Concord-AI/concord-mcp](https://github.com/Get-Concord-AI/concord-mcp) | TypeScript | 1,484 (+326, +28%) | Get-Concord-AI/concord-mcp provides live messaging for coding agents. |

---

## Skills: PRs and requests this week

> Source: [anthropics/skills](https://github.com/anthropics/skills)

### Open PRs worth watching

- **mcp-builder security examples (unmerged):** [#2247](https://github.com/anthropics/skills/pull/2247) would make the v1 Node streamable HTTP example bind to loopback only and validate the Host header, matching the skill's own best-practices guide. [#1640](https://github.com/anthropics/skills/pull/1640) would add a guard so the Python `get_document` resource example rejects path-traversal names such as `../../etc/passwd`.
- **claude-api description length (unmerged):** [#2242](https://github.com/anthropics/skills/pull/2242) and [#2250](https://github.com/anthropics/skills/pull/2250) both shorten the skill's frontmatter description to fit the Agent Skills spec's 1,024-character cap. It was 1,068 characters, which can fail validation or prevent loading. The two PRs overlap, so at most one is likely to land.
- **skill-creator eval tooling (unmerged):** [#1453](https://github.com/anthropics/skills/pull/1453) and [#2245](https://github.com/anthropics/skills/pull/2245) fix `aggregate_benchmark.py`, which currently reports 0% for flat single-run layouts and ignores eval directories that don't use the `eval-*` prefix. [#2260](https://github.com/anthropics/skills/pull/2260) moves eval workspaces out of the skills directory so they are no longer mistaken for skills.

### Requests

- [#2246](https://github.com/anthropics/skills/issues/2246) reports that mcp-builder's v1 Node streamable HTTP example listens on every interface with no Host validation. This contradicts the skill's own advice to bind `127.0.0.1` and enable DNS rebinding protection. The fix is proposed in #2247.
- [#2261](https://github.com/anthropics/skills/issues/2261) comes from a third-party static-audit service. It flags a credentials-related signal in the `claude-api` skill and includes an invitation to partner with the service.

### Takeaway

This week's activity hardens existing skills rather than adding new ones: aligning example code with the skills' own security guidance, keeping metadata within spec limits, and making skill-creator's evaluation tooling report correct results. Nothing was merged.

---

## Candidates to track

These repos trended two weeks in a row (🔥) and are not tracked, by the config.yml section they fit.

- `agents.repos`: [WhiteTowerAI/ohmygame](https://github.com/WhiteTowerAI/ohmygame), [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored), [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code), [Gentleman-Programming/gentle-shell](https://github.com/Gentleman-Programming/gentle-shell), [JetBrains/thinkrail](https://github.com/JetBrains/thinkrail)
- `infra.repos`: [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill), [backnotprop/plannotator](https://github.com/backnotprop/plannotator)
- No matching section: [ccch1mneyyy/dsh-Go](https://github.com/ccch1mneyyy/dsh-Go), [mdiri-ai/SoduWork](https://github.com/mdiri-ai/SoduWork), [alibaba/open-code-review](https://github.com/alibaba/open-code-review), [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop), [FailproofAI/failproofai](https://github.com/FailproofAI/failproofai), [converge-ai-labs/agent-foundation](https://github.com/converge-ai-labs/agent-foundation), [pingdotgg/t3code](https://github.com/pingdotgg/t3code), [Tencent/LoopForge](https://github.com/Tencent/LoopForge), [paperclipai/paperclip](https://github.com/paperclipai/paperclip), [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator), [open-mercato/cezar](https://github.com/open-mercato/cezar)

<details><summary>config.yml lines to track one</summary>

`agents.repos`:

```yaml
    - id: ohmygame
      repo: WhiteTowerAI/ohmygame
      name: ohmygame
    - id: locally-uncensored
      repo: PurpleDoubleD/locally-uncensored
      name: locally-uncensored
    - id: qwen-code
      repo: QwenLM/qwen-code
      name: qwen-code
    - id: gentle-shell
      repo: Gentleman-Programming/gentle-shell
      name: gentle-shell
    - id: thinkrail
      repo: JetBrains/thinkrail
      name: thinkrail
```

`infra.repos`:

```yaml
    - id: ffmpeg-skill
      repo: kajisho5/ffmpeg-skill
      name: ffmpeg-skill
    - id: plannotator
      repo: backnotprop/plannotator
      name: plannotator
```

</details>

---

## Models

### OpenRouter usage

Top models by tokens (prompt + completion) on OpenRouter on 2026-11-22, one day's snapshot. Last week: the model's rank on last week's page, new when it was not ranked there.

| # | Model | Tokens | Last week |
| ---: | :--- | ---: | :---: |
| 1 | [deepseek/deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) | 65.04T | 1 |
| 2 | [deepseek/deepseek-v4.1-flash-20260910](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20260910) | 15.35T | 3 |
| 3 | [z-ai/glm-5.3-flash-20260826](https://openrouter.ai/z-ai/glm-5.3-flash-20260826) | 12.23T | 4 |
| 4 | [tencent/hy4-flash-20261116](https://openrouter.ai/tencent/hy4-flash-20261116) | 10.21T | new |
| 5 | [openai/gpt-6-luna-20260922](https://openrouter.ai/openai/gpt-6-luna-20260922) | 8.31T | 5 |
| 6 | [anthropic/claude-opus-5.5-20260921](https://openrouter.ai/anthropic/claude-opus-5.5-20260921) | 6.97T | 6 |
| 7 | [minimax/minimax-m3.1-flash-20261019](https://openrouter.ai/minimax/minimax-m3.1-flash-20261019) | 4.29T | 12 |
| 8 | [moonshotai/kimi-k3.1-pro-20261023](https://openrouter.ai/moonshotai/kimi-k3.1-pro-20261023) | 4.07T | 11 |
| 9 | [nvidia/nemotron-3-ultra-550b-a55b-20260604](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b-20260604) | 3.93T | 14 |
| 10 | [xiaomi/mimo-v2.6-flash-20260921](https://openrouter.ai/xiaomi/mimo-v2.6-flash-20260921) | 3.70T | 8 |
| 11 | [baidu/ernie-5.5-flash-preview-20261110](https://openrouter.ai/baidu/ernie-5.5-flash-preview-20261110) | 3.47T | new |
| 12 | [z-ai/glm-5.3-20260816](https://openrouter.ai/z-ai/glm-5.3-20260816) | 3.45T | 9 |
| 13 | [stepfun/step-5-preview-20261008](https://openrouter.ai/stepfun/step-5-preview-20261008) | 3.23T | 7 |
| 14 | [meta/muse-spark-1.3-contributor-20260902](https://openrouter.ai/meta/muse-spark-1.3-contributor-20260902) | 3.12T | 16 |
| 15 | [nvidia/nemotron-3.5-super-vl-20261015](https://openrouter.ai/nvidia/nemotron-3.5-super-vl-20261015) | 2.91T | 15 |
| 16 | [anthropic/claude-haiku-5.5-20261007](https://openrouter.ai/anthropic/claude-haiku-5.5-20261007) | 2.89T | 18 |
| 17 | [typesafe/jev-1.13-20260917](https://openrouter.ai/typesafe/jev-1.13-20260917) | 2.86T | 17 |
| 18 | [anthropic/claude-sonnet-5.5-20260928](https://openrouter.ai/anthropic/claude-sonnet-5.5-20260928) | 2.79T | 19 |
| 19 | [openai/gpt-6.1-sol-20260929](https://openrouter.ai/openai/gpt-6.1-sol-20260929) | 2.52T | 10 |
| 20 | [deepseek/deepseek-v4-flash-20260731](https://openrouter.ai/deepseek/deepseek-v4-flash-20260731) | 2.51T | 13 |

### Hugging Face trending

*Ranked by likes gained in the last 7 days; 🔥 also on last week's Trends page; quantised copies of a release share its row.*

| # | Model | Likes (total) | Downloads (30 days) | Summary |
| ---: | :--- | ---: | ---: | :--- |
| 1 | [thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini) (+ [unsloth/Inkling-2-Mini-GGUF](https://huggingface.co/unsloth/Inkling-2-Mini-GGUF)) | 5,131 | 23,543 | 26B image-text-to-text model, Apache-2.0 license. |
| 2 | [inworld/voice-isolator](https://huggingface.co/inworld/voice-isolator) | 659 | 0 | Audio-to-audio voice isolation model, Apache-2.0 license. |
| 3 | [tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash) | 629 | 6,617 | 220B image-text-to-text model, custom ("other") license. |
| 4 | [harness-hub/Qwen3.8-27B-pi-adapted](https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted) | 998 | 2,831 | Image-text-to-text model, a pi-adapted variant of Qwen3.8-27B per its name, Apache-2.0 license. |
| 5 | 🔥 [higurashi-ai/Haru-4B](https://huggingface.co/higurashi-ai/Haru-4B) | 906 | 8,608 | 5.2B audio-to-audio model, Apache-2.0 license. |
| 6 | [apple/DepthPro2](https://huggingface.co/apple/DepthPro2) | 369 | 0 | Depth-estimation model, custom ("other") license. |
| 7 | 🔥 [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) | 20,954 | 6,297,396 | 27B image-text-to-text model, Apache-2.0 license. |
| 8 | [sensenova/SenseNova-Loop-9B](https://huggingface.co/sensenova/SenseNova-Loop-9B) | 574 | 1,863 | 9B image-text-to-text model, Apache-2.0 license. |
| 9 | [apple/FastFrames-L](https://huggingface.co/apple/FastFrames-L) | 545 | 0 | Text-to-video model, Apple AMLR license. |
| 10 | [SulphurAI/Sulphur-3](https://huggingface.co/SulphurAI/Sulphur-3) | 810 | 78,931 | — |
| 11 | 🔥 [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) | 13,096 | 2,993,088 | Image-to-video model, custom ("other") license. |
| 12 | [meituan-longcat/LongCat-Video-Avatar-1.6](https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6) | 446 | 3,483 | Video-avatar model per its name, untagged task, MIT license. |

---

## Research

| Paper | Summary |
| :--- | :--- |
| [NariQ: Sub-3-Bit Quantization for Long-Horizon Agentic Tasks](http://arxiv.org/abs/2611.26157v1) | NariQ is a trellis-coded post-training quantization method that calibrates on tokens the BF16 model generates during agent sessions; it targets the finding that existing ≤3-bit quantizations of Qwen3.8-27B match BF16 on AIME but solve at most 72% as many DeepSWE tasks, though the truncated abstract gives no NariQ result. |
| [LuthorSQL: A One-Pass Text-to-SQL Model as System 1 for a Slower LLM Agent](http://arxiv.org/abs/2611.17780v1) | LuthorSQL is a non-autoregressive 7B text-to-SQL model that runs on local hardware as a fast "System 1" gate and escalates to a slower LLM agent (System 2), offloading work from hosted agents such as a Claude Opus 5.5 agent that costs over $70,000 a year at 10,000 queries a day, though the truncated abstract reports no accuracy or savings results. |
| [Linglong Agent Service: A Runtime for Centralized Agent Reasoning and Distributed Execution](http://arxiv.org/abs/2611.21129v1) | Linglong Agent Service (agentsvc) is a self-hosted HTTP service and embeddable Python runtime where a parent service keeps inference orchestration, tool descriptions and conversation history, while each inference request picks one child environment for file, shell, terminal and MCP operations, though the truncated abstract reports no evaluation results. |
| [KnowledgeClaw: Towards Agentic Knowledge Engineering via Omnimodal Hypergraphs](http://arxiv.org/abs/2611.24294v1) | KnowledgeClaw formalizes Omnimodal Knowledge Engineering (OmniKE) for turning raw files into reasoning-ready knowledge bases via omnimodal hypergraphs and releases OmniKE-Bench, with six tasks and 1,829 model-free items over 3,960 real files in five modalities, though the truncated abstract gives no system results. |
| [SEAM: Computer-Use Agents Know the Harm Between Screens, and Commit It Anyway](http://arxiv.org/abs/2611.22971v1) | SEAM (Safety Execution Across Multiple screens) is a benchmark that tests whether computer-use agents commit harm that only emerges by combining facts seen on different screens under a legitimate task, and its title claims agents recognize this harm yet commit it anyway, though the truncated abstract gives no numbers. |
| [GRACE: Parallel Best-of-N Multi-Agent Analysis of Closed-Form Questions over Dataframes with Guardrail Selection and Adaptive Retry](http://arxiv.org/abs/2611.20983v1) | GRACE (Generative, Ranked, Adaptive Code Ensemble) is a production-oriented pipeline that answers closed-form questions over dataframes by running N code-writing agents concurrently, with guardrail-based best-of-N selection and adaptive retry instead of answer-agreement voting, though the truncated abstract reports no results. |
| [Replication of Agentic Security Events: Audit and Investigation (ROGUE-AI)](http://arxiv.org/abs/2611.26553v1) | ROGUE-AI is a framework for replicating media-reported security incidents involving LLM agents (e.g., Replit's coding agent deleting a production database) in order to validate them and test their root causes, though the truncated abstract reports no findings. |
| [Probing agent overeagerness in realistic settings with continuation audits](http://arxiv.org/abs/2611.24491v1) | Continuation Audits is a pipeline that probes frontier coding agents for overeagerness (reckless actions beyond the user's mandate) by grounding the auditor on a prefix from realistic interactions, meant to avoid models recognizing synthetic audits, though the truncated abstract reports no results. |
| [Evolution Under Fire: Evolving Agent Safety Harnesses with Adaptive Injection Stressors](http://arxiv.org/abs/2611.22583v1) | Evolution Under Fire is a staged framework that co-evolves executable safety harnesses for tool-using agents, via utility-constrained, Pareto-scheduled tree search, alongside adaptive prompt-injection stressors, though the truncated abstract reports no results. |
| [Benchmark Factory: Agentic Benchmark Creation via Dataset Curation and Label-Free Quality Anchors](http://arxiv.org/abs/2611.18890v1) | Benchmark Factory is an autonomous meta-agent loop with human checkpoints that builds coding-agent benchmarks from landed production code changes, running models of known relative strength and diagnosing and repairing candidates until they clear label-free quality anchors, though the truncated abstract cuts off before its results. |

---

## Most discussed

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Combatting adversarial distillation](https://openai.com/index/combatting-adversarial-distillation/) | Hacker News | [34 points, 50 comments](https://news.ycombinator.com/item?id=50581242) | OpenAI outlines a layered defense against adversarial distillation combining training, safeguards, detection, and enforcement. |
| [Reports of AI-related child sexual abuse material rise 8,400% in two years](https://www.theguardian.com/technology/2026/nov/16/ai-related-child-sexual-abuse-material-rise-exploitation-deepfakes) | Hacker News | [18 points, 25 comments](https://news.ycombinator.com/item?id=50513713) | Reports of AI-generated child sexual abuse material have risen 8,400% over two years, prompting calls for government action. |
| [International UN talks on controlling use of autonomous weapons collapse](https://www.theguardian.com/technology/2026/nov/21/international-talks-control-ai-autonomous-weapons-collapse) | Hacker News | [41 points, 25 comments](https://news.ycombinator.com/item?id=50594564) | UN talks on regulating autonomous weapons collapsed after a week without a negotiating mandate, attributed to Russian obstruction. |
| [An FBI agent called a Claude user about his chats](https://austinpatrick.substack.com/p/when-should-ai-labs-alert-police) | Hacker News | [28 points, 24 comments](https://news.ycombinator.com/item?id=50567485) | — |
| [Anthropic reportedly prices its IPO at $83 per share, valuing at $1.5T](https://apnews.com/article/anthropic-ipo-pricing-70b660ddf900d90bbf484ecdf1fb441c) | Hacker News | [17 points, 23 comments](https://news.ycombinator.com/item?id=50553581) | — |
| [Can a plain table hijack an AI agent?](https://dev.to/edbrdi/can-a-plain-table-hijack-an-ai-agent-2pde) | Dev.to | [24 reactions, 50 comments](https://dev.to/edbrdi/can-a-plain-table-hijack-an-ai-agent-2pde) | The article explores whether a plain table can hijack an AI agent, with all cases documented in the agent-redteam repository. |
| [Your AI Agent Retried the Tool Call. The First One Had Already Succeeded.](https://dev.to/rudratosh/your-ai-agent-retried-the-tool-call-the-first-one-had-already-succeeded-3pke) | Dev.to | [16 reactions, 33 comments](https://dev.to/rudratosh/your-ai-agent-retried-the-tool-call-the-first-one-had-already-succeeded-3pke) | The author explains how AI agent retries cause duplicate charges and proposes retry-safe designs using stable operation IDs, idempotency keys, and reconciliation. |
| [Stop Paying LLM Prices for an if Statement: A Field Guide to Decision Models in Late 2026](https://dev.to/amananandrai/stop-paying-llm-prices-for-an-if-statement-a-field-guide-to-decision-models-in-late-2026-4d24) | Dev.to | [25 reactions, 16 comments](https://dev.to/amananandrai/stop-paying-llm-prices-for-an-if-statement-a-field-guide-to-decision-models-in-late-2026-4d24) | The author argues against using LLMs for simple conditional logic, advocating for decision models instead. |

---

## Signals

OpenRouter usage (one day's snapshot, on 2026-11-22): #1 is [deepseek/deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017) with 65.04T tokens; #2 is [deepseek/deepseek-v4.1-flash-20260910](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20260910) with 15.35T (#1 has 4.2× #2's tokens). The first was also #1 on last week's page, and the second was #3 there.

Across the 4 GitHub category tables (32 rows), stars gained in the last 7 days: the largest absolute gain is [pingdotgg/t3code](https://github.com/pingdotgg/t3code) (🕸️ Multi-agent & orchestration, row 1), 72,704 (+10,681, +17%). The largest relative gain is [mdiri-ai/SoduWork](https://github.com/mdiri-ai/SoduWork) (🧰 Agent harnesses & frameworks, row 2), 6,852 (+5,838, +576%). Both rows also appeared on last week's page.

In the Agent & coding tool radar's OpenRouter rows, the most tokens in the last 7 days went to [Hermes Agent](https://hermes-agent.nousresearch.com/) (row 1), with 14.15T tokens/week. It ranks week #3 / month #3 among OpenRouter apps, at +8.7% vs previous week.

The Agent & coding tool radar's largest rise against last week's page is [pi](https://pi.dev/) (row 4, OpenRouter), at +46% vs previous week. It sits at week #6 / month #6 among OpenRouter apps, with 5.84T tokens/week.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*