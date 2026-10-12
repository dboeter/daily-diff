# Agent & AI Coding Trends Weekly 2026-10-12

> Sources: GitHub Trending + GitHub Search API + OpenRouter + npm | Generated: 2026-10-12 01:37 UTC

---

## This Week's Highlights

New orchestration layers are gaining traction, with [mvschwarz/openrig](https://github.com/mvschwarz/openrig) (+41% stars) enabling persistent agent teams across Claude Code, Codex and Pi, and [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator) adding desktop, web and mobile supervision for 25+ harnesses. Sandboxed execution emerged as a priority: [strands-agents/box](https://github.com/strands-agents/box) launched with OS-level isolation and default-deny networking, while [microsoft/nvx](https://github.com/microsoft/nvx) introduced a cross-platform micro-VM sandbox. On the model side, StepFun’s [Step 5 Preview](https://openrouter.ai/models/stepfun/step-5-preview) debuted at 8.84T tokens/week on OpenRouter, and DeepSeek’s [deepseek-v4.1-flash](https://openrouter.ai/models/deepseek/deepseek-v4.1-flash-20260910) extended its lead to 40.97T tokens. Local-first coding agents also surged, with [dragonked2/alphacode](https://github.com/dragonked2/alphacode) (+43%) and [vastsa/PI-Desktop](https://github.com/vastsa/PI-Desktop) (+5.2%) emphasizing zero-API-key workflows.

## 🚀 Agent & Coding Tool Radar

| Tool | Source | Signal | Summary |
| :--- | :--- | :--- | :--- |
| [@ai-matrx/coding-sessions](https://www.npmjs.com/package/@ai-matrx/coding-sessions) | npm | 🆕 35,646/week, 3.5x | @ai-matrx/coding-sessions wraps Paperclip's MIT driver packages to drive users' own Claude Code and Codex subscriptions without API keys, allowing takeover of chats started elsewhere. It surged 3.5x to 35,646 weekly downloads on npm this week. |
| [GTKottman/mortiflix-oss](https://github.com/GTKottman/mortiflix-oss) | GitHub | 🆕 570 (+570) | GTKottman/mortiflix-oss is a local motion design studio where Claude creates videos step-by-step with user approval at each stage, supporting both Claude Code and API key authentication. It debuted on GitHub with 570 stars this week. |
| [GanyuanRan/Autoloom](https://github.com/GanyuanRan/Autoloom) | GitHub | 🆕 470 (+382) | GanyuanRan/Autoloom integrates Aegis governance into AI coding execution with baseline-aware changes and evidence-backed delivery, offering a free desktop client with model choice. It gained 382 stars this week to reach 470 total on GitHub. |
| [StepCode](https://github.com/stepfun-ai/Step-Code) | OpenRouter | 🆕 week #15 / month #38, 695.3B tokens/week · 📈 +100% | StepCode appeared on OpenRouter in week 15 of its tracking, processing 695.3B tokens weekly with 100% growth, though no description is provided. |
| [strands-agents/box](https://github.com/strands-agents/box) | GitHub | 🆕 332 (+332) | strands-agents/box runs AI agents in a Rust-written sandbox with OS isolation, default-deny Dogwood policies, and credential injection keeping secrets outside the agent, currently supporting macOS on Apple silicon. It launched on GitHub with 332 stars this week. |
| [TannerMidd/pi-pocket](https://github.com/TannerMidd/pi-pocket) | GitHub | 🆕 361 (+295) | TannerMidd/pi-pocket is a durable, multiplayer, mobile-first web app for Pi agents built on Pi Durable. It gained 295 stars this week to reach 361 on GitHub. |
| [codex-fleet conductor](https://github.com/AxiomMath/codex-fleet) | OpenRouter | 🆕 week #23 / month #50, 379.5B tokens/week · 📈 +100% | codex-fleet conductor appeared on OpenRouter in week 23, processing 379.5B tokens weekly with 100% growth, though no description is provided. |
| [Harvil1/codeAgent](https://github.com/Harvil1/codeAgent) | GitHub | 🆕 219 (+219) | Harvil1/codeAgent is an open-source terminal-based coding agent that understands repositories, plans multi-step changes, writes and edits files, runs commands and tests, and iterates until tasks complete with a transparent tool loop. It debuted on GitHub with 219 stars this week. |
| [Claude Code](https://claude.ai/code) | OpenRouter | week #2 / month #3, 9.49T tokens/week · 📈 +34% | Claude Code is Anthropic's agentic coding tool that reads entire codebases, plans and executes cross-file changes, runs tests, and iterates on failures from natural language prompts. It processed 9.49T tokens weekly on OpenRouter with 34% growth in week 2. |
| [Codex](https://openai.com/codex/) | OpenRouter | week #7 / month #9, 3.55T tokens/week · 📈 +31% | Codex is a coding agent for building and shipping with AI. It processed 3.55T tokens weekly on OpenRouter with 31% growth in week 7. |
| [OpenClaw](https://openclaw.ai/) | OpenRouter | week #12 / month #12, 1.86T tokens/week · 📈 +30% | OpenClaw is an open-source AI agent connecting to messaging apps to take real actions including running commands, browsing, managing files, and sending emails. It processed 1.86T tokens weekly on OpenRouter with 30% growth in week 12. |
| [Lemonade](https://lemonade.gg/) | OpenRouter | week #19 / month #21, 526.4B tokens/week · 📈 +36% | Lemonade is an AI tool for Roblox games. It processed 526.4B tokens weekly on OpenRouter with 36% growth in week 19. |

## Top Projects by Category

### 🧑‍💻 Coding Agents

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [cursor/plugins](https://github.com/cursor/plugins) | TypeScript | 10,907 (+1,140, +12%) | cursor/plugins is the Cursor plugin specification and official plugins repository written in TypeScript. It grew 12% to 10,907 stars with 1,140 new stars this week. |
| [michael-denyer/pstack-claude](https://github.com/michael-denyer/pstack-claude) | JavaScript | 1,821 (+602, +49%) | michael-denyer/pstack-claude provides rigorous agent workflows with Cursor primitives translated for Claude Code, Codex, Copilot, Pi, OpenCode, Gemini, and Prime Agent versions of Poteto's pstack. It grew 49% to 1,821 stars with 602 new stars this week. |
| [WhiteTowerAI/ohmygame](https://github.com/WhiteTowerAI/ohmygame) | TypeScript | 666 (+666) | WhiteTowerAI/ohmygame is an open-source AI game studio with game canvas, bringing your own key for a complete one-person game development environment. It debuted on GitHub with 666 stars this week. |
| [seteliu/st-cute](https://github.com/seteliu/st-cute) | Java | 164 (+51, +45%) | seteliu/st-cute is a coding agent with ReAct loop, web UI, and mobile support written in Java. It grew 45% to 164 stars with 51 new stars this week. |
| [dragonked2/alphacode](https://github.com/dragonked2/alphacode) | Rust | 273 (+82, +43%) | dragonked2/alphacode is a free MIT AI coding agent requiring no API key, with built-in free model or support for 50+ models, swarm mode, 40+ tools, browser and desktop automation, built in Rust. It grew 43% to 273 stars with 82 new stars this week. |
| [vastsa/PI-Desktop](https://github.com/vastsa/PI-Desktop) | TypeScript | 6,666 (+327, +5.2%) | vastsa/PI-Desktop is a local-first AI coding agent desktop using Electron, Rust host core, pi Agent Harness, and user-installable plugins. It grew 5.2% to 6,666 stars with 327 new stars this week. |
| [Agent-Field/CodeAF](https://github.com/Agent-Field/CodeAF) | Go | 392 (+117, +43%) | Agent-Field/CodeAF is an open-source software factory for open models written in Go. It grew 43% to 392 stars with 117 new stars this week. |
| [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | TypeScript | 2,190 (+273, +14%) | PurpleDoubleD/locally-uncensored is an all-in-one local AI studio for desktop with chat, image and video generation, and coding agent in one free open-source app for Windows and Linux without Docker, terminal, or cloud. It grew 14% to 2,190 stars with 273 new stars this week. |

### 🧰 Agent Harnesses & Frameworks

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | Go | 46,203 (+2,526, +5.8%) | alibaba/open-code-review is a battle-tested hybrid architecture code review tool with deterministic pipelines plus LLM agent, precise line-level comments, and built-in multi-language ruleset for NPE, thread-safety, XSS, and SQL injection. It grew 5.8% to 46,203 stars with 2,526 new stars this week. |
| [luobosibing2/dsh-jev-plugin](https://github.com/luobosibing2/dsh-jev-plugin) | JavaScript | 204 (+84, +70%) | luobosibing2/dsh-jev-plugin is a native DeepSeek Harness plugin integrating TypeSafe Jev or Decision API like luna as a System One decision layer for agent selection, supervision, corrections, and approvals. It grew 70% to 204 stars with 84 new stars this week. |
| [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop) | TypeScript | 13,281 (+1,451, +12%) | dataelement/dsh-desktop is the DeepSeek Harness Desktop client written in TypeScript. It grew 12% to 13,281 stars with 1,451 new stars this week. |
| [thetahealth/mirobody-eval](https://github.com/thetahealth/mirobody-eval) | Python | 215 (+76, +55%) | thetahealth/mirobody-eval is an evaluation harness for medical/health AI agents that reproduces and covers multiple benchmarks under one scoring discipline. It grew 55% to 215 stars with 76 new stars this week. |
| [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | Rust | 41,838 (+1,256, +3.1%) | tinyhumansai/openhuman claims to be the fastest, cheapest, most efficient open-source agent harness, running more than 500 agents on a $10 VPS, written in Rust. It grew 3.1% to 41,838 stars with 1,256 new stars this week. |
| [humanfia/humanize](https://github.com/humanfia/humanize) | Python | 277 (+84, +44%) | humanfia/humanize is an agent flow system for token maxxing written in Python. It grew 44% to 277 stars with 84 new stars this week. |
| [herdrdev/herdr](https://github.com/herdrdev/herdr) | Rust | 43,418 (+1,129, +2.7%) | herdrdev/herdr is the runtime for coding agents written in Rust. It grew 2.7% to 43,418 stars with 1,129 new stars this week. |
| [ericrisco/rsc-harness](https://github.com/ericrisco/rsc-harness) | JavaScript | 192 (+50, +35%) | ericrisco/rsc-harness is a meta-harness giving agents memory, database access, trade knowledge, and reflexes to not break repos, supporting Claude Code, Codex, and 15 more. It grew 35% to 192 stars with 50 new stars this week. |

### 🕸️ Multi-Agent & Orchestration

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [mvschwarz/openrig](https://github.com/mvschwarz/openrig) | TypeScript | 6,984 (+2,028, +41%) | mvschwarz/openrig builds persistent agent networks from Claude Code, Codex, and Pi with roles, shared context, and owned work. It grew 41% to 6,984 stars with 2,028 new stars this week. |
| [PinelliaChill/Operant](https://github.com/PinelliaChill/Operant) | Python | 290 (+173, +148%) | PinelliaChill/Operant Beta organizes traceable agent collaboration on local machines with multi-model division of labor, on-demand communication, hierarchical approval, and experience reuse through modular architecture. It grew 148% to 290 stars with 173 new stars this week. |
| [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator) | Go | 13,083 (+362, +2.8%) | OrchestratorInc/agent-orchestrator runs and supervises coding agent teams from planning to merge, supporting any harness including Claude Code, Codex, and 25+ more across desktop, web, mobile, and cloud. It grew 2.8% to 13,083 stars with 362 new stars this week. |
| [Sidiora-Labs/codify](https://github.com/Sidiora-Labs/codify) | C | 435 (+210, +93%) | Sidiora-Labs/codify is an AI agent workflow tool scaling from small simple projects to large complex codebases, written in C. It grew 93% to 435 stars with 210 new stars this week. |
| [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) | TypeScript | 39,797 (+265, +0.7%) | Yeachan-Heo/oh-my-claudecode provides teams-first multi-agent orchestration for Claude Code. It grew 0.7% to 39,797 stars with 265 new stars this week. |
| [boadij/pi-herdsman](https://github.com/boadij/pi-herdsman) | TypeScript | 173 (+52, +43%) | boadij/pi-herdsman enables asynchronous Pi subagents and agent fleet orchestration for parallel coding with nested delegation, background work, and supervision in herdr. It grew 43% to 173 stars with 52 new stars this week. |
| [lobehub/lobehub](https://github.com/lobehub/lobehub) | TypeScript | 83,148 (+239, +0.3%) | lobehub/lobehub is a Chief Agent Operator organizing agents into 7×24 operations through hiring, scheduling, and reporting on entire AI teams. It grew 0.3% to 83,148 stars with 239 new stars this week. |
| [superset-sh/superset](https://github.com/superset-sh/superset) | TypeScript | 15,082 (+233, +1.6%) | superset-sh/superset is an agentic IDE orchestrating 100+ coding agents in parallel, running any agent with user's own subscription. It grew 1.6% to 15,082 stars with 233 new stars this week. |

### 🔌 Agent Tooling

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Shell | 286,268 (+10,330, +3.7%) | mattpocock/skills provides skills for real engineers straight from the author's .agents directory, written in Shell. It grew 3.7% to 286,268 stars with 10,330 new stars this week. |
| [ranxianglei/billion-context](https://github.com/ranxianglei/billion-context) | TypeScript | 913 (+337, +59%) | ranxianglei/billion-context is a context-compression plugin for small context windows (100K sufficient), achieving 5x token savings and month-long single sessions of billions of tokens. It grew 59% to 913 stars with 337 new stars this week. |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | TypeScript | 60,999 (+4,223, +7.4%) | heygen-com/hyperframes enables writing HTML to render video, built for agents. It grew 7.4% to 60,999 stars with 4,223 new stars this week. |
| [aoci-spec/aoci-code](https://github.com/aoci-spec/aoci-code) | Go | 1,481 (+378, +34%) | aoci-spec/aoci-code is a persistent Git-versioned map of entire codebases and database schemas that agents read before making changes, as a local-first MCP server and CLI in Go. It grew 34% to 1,481 stars with 378 new stars this week. |
| [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | TypeScript | 99,754 (+3,803, +4%) | thedotmack/claude-mem provides persistent context across sessions for every agent, capturing session activity, compressing with AI, and injecting relevant context into future sessions, working with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode, and more. It grew 4% to 99,754 stars with 3,803 new stars this week. |
| [ruc-datalab/EvoOntology](https://github.com/ruc-datalab/EvoOntology) | Python | 773 (+186, +32%) | ruc-datalab/EvoOntology is a self-evolving ontology layer for data agents, establishing and evolving ontology layers for Claude Code and Codex. It grew 32% to 773 stars with 186 new stars this week. |
| [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) | Python | 19,278 (+2,508, +15%) | earthtojake/text-to-cad gives agents CAD superpowers. It grew 15% to 19,278 stars with 2,508 new stars this week. |
| [microsoft/nvx](https://github.com/microsoft/nvx) | Python | 387 (+87, +29%) | microsoft/nvx is a cross-platform micro-VM sandbox for agentic workloads written in Python. It grew 29% to 387 stars with 87 new stars this week. |

### 🤖 Other Agents

| Project | Lang | Stars (total / this week, %) | Summary |
| :--- | :--- | ---: | :--- |
| [nealbridges/VulnHunter](https://github.com/nealbridges/VulnHunter) | Python | 700 (+700) | nealbridges/VulnHunter is an agentic AI security scanner that hunts exploitable vulnerabilities like an adversary, proves them with executable PoCs, and fixes them test-first, rebuilt for any agent harness as a maintained fork of Capital One's VulnHunter. It debuted on GitHub with 700 stars this week. |
| [Goldwaterfung/Stratawright](https://github.com/Goldwaterfung/Stratawright) | C++ | 119 (+49) | Goldwaterfung/Stratawright is an agentic DAW that AI agents (Claude Code, Cursor, Codex) can natively control for music production, written in C++. It gained 49 stars this week to reach 119 on GitHub. |
| [agenvoy/Agenvoy](https://github.com/agenvoy/Agenvoy) | Go | 441 (+19, +4.5%) | agenvoy/Agenvoy is a self-hosted 24/7 personal AI agent running on user's own machine with local memory, schedules, tools, and credentials, as a single Go binary with MCP. It grew 4.5% to 441 stars with 19 new stars this week. |
| [OWWZO/ai-agent](https://github.com/OWWZO/ai-agent) | Java | 190 (+7, +3.8%) | OWWZO/ai-agent is a cloud-based intelligent agent for web-wide research and complex data analysis across public networks, YouTube, BiliBili, X, Xiaohongshu, and Hacker News, written in Java. It grew 3.8% to 190 stars with 7 new stars this week. |

## Trend Signal Analysis

Three clear patterns dominate this week’s signals. First, **multi-agent orchestration is moving from experimentation to infrastructure**: projects like [mvschwarz/openrig](https://github.com/mvschwarz/openrig), [PinelliaChill/Operant](https://github.com/PinelliaChill/Operant) (+148%), and [Sidiora-Labs/codify](https://github.com/Sidiora-Labs/codify) (+93%) implement persistent roles, hierarchical approval, and experience reuse across heterogeneous agent fleets. Second, **sandboxing and governance are becoming first-class primitives** — [strands-agents/box](https://github.com/strands-agents/box) combines OS isolation with a default-deny policy, [microsoft/nvx](https://github.com/microsoft/nvx) provides micro-VM sandboxing, and [GanyuanRan/Autoloom](https://github.com/GanyuanRan/Autoloom) bakes baseline-aware changes and evidence-backed delivery into the execution loop. Third, **local-first, bring-your-own-model agents are accelerating**: [dragonked2/alphacode](https://github.com/dragonked2/alphacode), [vastsa/PI-Desktop](https://github.com/vastsa/PI-Desktop), and [@ai-matrx/coding-sessions](https://www.npmjs.com/package/@ai-matrx/coding-sessions) (35.6K weekly npm downloads, 3.5× growth) all let developers run agents on their own subscriptions or local models without API keys. Harness ecosystems are also consolidating — [herdrdev/herdr](https://github.com/herdrdev/herdr) and [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) position themselves as universal runtimes, while [aoci-spec/aoci-code](https://github.com/aoci-spec/aoci-code) (+34%) and [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) (+4%) address persistent context and codebase mapping across sessions.

## Community Hot Spots

- **[mvschwarz/openrig](https://github.com/mvschwarz/openrig)** — Fastest-growing orchestration layer (+41% stars) with persistent, role-based agent teams across Claude Code, Codex and Pi; worth evaluating for production multi-agent workflows.
- **[strands-agents/box](https://github.com/strands-agents/box)** — New sandbox primitive combining OS isolation and default-deny networking; critical for teams deploying untrusted agent code.
- **[dragonked2/alphacode](https://github.com/dragonked2/alphacode)** — Local-first coding agent with swarm mode, 40+ tools, and 50+ model options; signals strong demand for zero-API-key, privacy-preserving development.
- **[stepfun/step-5-preview](https://openrouter.ai/models/stepfun/step-5-preview)** — Debuted at 8.84T tokens/week on OpenRouter; sparse MoE architecture (27B active / 600B total) optimized for agentic software engineering.
- **[aoci-spec/aoci-code](https://github.com/aoci-spec/aoci-code)** — Persistent, Git-versioned codebase and schema map read by agents before edits; addresses the context-grounding gap in large repositories.

## Model Usage on OpenRouter

- **DeepSeek’s deepseek-v4.1-flash-20260910 leads decisively at 40.97T tokens/week**, nearly 3.4× the second-place model.
- **Z.ai’s glm-5.3-flash-20260826 (12.24T) and Xiaomi’s mimo-v2.6-flash-20260921 (11.46T)** hold the #2 and #3 spots, both flash-tier models optimized for cost-sensitive agentic workloads.
- **StepFun’s step-5-preview-20261008 entered the top 5 immediately at 8.84T tokens/week**, marking the strongest debut for a new MoE flagship built for software engineering.
- **Newly listed models worth trying for agentic work**: [stepfun/step-5-preview](https://openrouter.ai/models/stepfun/step-5-preview) (1M context, sparse MoE), [anthropic/claude-haiku-5.5](https://openrouter.ai/models/anthropic/claude-haiku-5.5) (1M context, stronger coding and computer use), [mistralai/mistral-large-4-0](https://openrouter.ai/models/mistralai/mistral-large-4-0) (1M context, frontier multimodal reasoning), and [google/gemini-nano-banana-2.1](https://openrouter.ai/models/google/gemini-nano-banana-2.1) (65K context, image generation/editing for agent tooling).

---

## Claude Code Skills Highlights

> Source: [anthropics/skills](https://github.com/anthropics/skills)

# Claude Code Skills Community Highlights (2026-10-12)

## Top Skills Ranking (Most Active PRs)

| Skill | Functionality | Discussion Highlights | Status |
|-------|--------------|----------------------|--------|
| **mcp-builder** ([#1742](https://github.com/anthropics/skills/pull/1742)) | MCP server builder with streamable HTTP client | Fixes breaking changes in `mcp>=2.0.0` (`streamable_http_client` rename, custom headers API) | Open |
| **proofcore-contract-auditor** ([#1771](https://github.com/anthropics/skills/pull/1771)) | Smart contract static analysis + on-chain audit proofs (TON) | Web3 security focus; zero-storage Merkle anchoring | Open |
| **md2video-audio** ([#1703](https://github.com/anthropics/skills/pull/1703)) | Markdown → MP4 with human-like voiceovers (Marp + TTS) | Zero-cost video generation pipeline | Open |
| **skill-creator hardening** ([#1961](https://github.com/anthropics/skills/pull/1961)) | Eval viewer security (XSS, DNS rebinding, script breakout) | Critical security fixes for local HTTP eval UI | Open |

## Community Demand Trends (From Top Issues)

- **Trust & Namespace Security** ([#492](https://github.com/anthropics/skills/issues/492), 44 💬): Community skills published under `anthropic/` namespace enable impersonation; urgent namespace isolation needed
- **Org-wide Skill Sharing** ([#228](https://github.com/anthropics/skills/issues/228), 16 💬): Native shared skill library to replace manual `.skill` file distribution via Slack/Teams
- **skill-creator Evaluation Reliability** (5+ issues, 12–4 💬 each): Systematic failures in trigger evals (0% trigger rate), Windows incompatibility, benchmark layout mismatches, cross-worker UUID collisions

## High-Potential Pending Skills

- **notion-spec-to-implementation** ([#1245](https://github.com/anthropics/skills/pull/1245)): Spec → Notion tasks → implementation pipeline with progress tracking
- **awt (AI Watch Tester)** ([#822](https://github.com/anthropics/skills/pull/822)): Zero-code E2E test generation via browser vision/control
- **document-typography** ([#514](https://github.com/anthropics/skills/pull/514)): Typographic QC (orphans, widows, numbering) for AI-generated docs

## Skills Ecosystem Insight

The community's most concentrated demand is **hardening the skill-creator toolchain** (evaluation, security, Windows support) and **establishing trust boundaries** for skill distribution—foundational infrastructure over new domain skills.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*