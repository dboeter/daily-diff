# AI Open Source Trends Weekly 2026-10-05

> Sources: GitHub Trending + GitHub Search API + OpenRouter + npm | Generated: 2026-10-04 20:34 UTC

---

# AI Open Source Trends Report — Week Ending 2026-10-05

## 1. This Week’s Highlights

Agent infrastructure dominated the hot list: [paperclipai/paperclip](https://github.com/paperclipai/paperclip), [vectorize-io/hindsight](https://github.com/vectorize-io/hindsight), [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell), and [mvschwarz/openrig](https://github.com/mvschwarz/openrig) all gained thousands of stars. The strongest new direction is the “agent harness” as a customizable layer around coding agents, with governance, persistent memory, multi-agent coordination, approval gates, and verification emerging as recurring themes.

Creative AI applications also showed broad appeal, led by [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio), which added 16,775 stars in one week, while agentic video generation remained popular through Hyperframes and MoneyPrinterTurbo. OpenRouter usage confirms coding agents as the main workload: Hermes Agent, Kilo Code, Cline, Claude Code, Codex, and pi occupy most of the leading app ranks. Meanwhile, model routing is increasingly driven by fast, economical models, with Space Bunny Alpha, DeepSeek V4.1 Flash, GLM-5.3 Flash, and Mimo V2.6 Flash leading token volume.

## 1b. 🚀 Agent & Coding Tool Radar

| Tool | Source | Signal | Summary |
| :--- | :--- | :--- | :--- |
| [Hermes Agent](https://hermes-agent.nousresearch.com/) | OpenRouter, GitHub | week #2 / month #2, 13.69T tokens/week, 📈 +12% | An open-source, persistent personal agent with memory, reusable skills, automation, subagents, and more than 40 tools. Its first-place weekly scale among individual agent applications makes it the clearest usage leader in the dataset. |
| [Kilo Code](https://www.kilocode.ai/) | OpenRouter, npm | week #3 / month #5, 7.46T tokens/week, 📈 +94%; 47,481/week, 1.3x | An open-source coding agent spanning VS Code, JetBrains, and CLI workflows. Its near-94% weekly usage increase and cross-surface presence suggest strong adoption beyond a single IDE ecosystem. |
| [Cline](https://cline.bot/) | OpenRouter | week #4 / month #7, 7.13T tokens/week, 📈 +103% | An autonomous IDE and CLI coding agent that edits repositories, executes terminal commands, and uses browser automation. Weekly routing growth above 100% indicates that interactive, tool-heavy development remains in heavy demand. |
| [Codex](https://openai.com/codex/) | OpenRouter | week #8 / month #10, 4.26T tokens/week, 📈 +182% | A command-line coding agent focused on implementing and shipping software changes. Its rapid growth reinforces the continued migration from IDE assistants toward autonomous terminal workflows. |
| [Command Code](https://commandcode.ai/) | OpenRouter | week #12 / month #14, 2.64T tokens/week, 📈 +776% | A multi-surface agent combining programming, CLI, IDE, personal-agent, and native-app-building capabilities. Its 776% increase is the strongest momentum among the established OpenRouter coding tools listed. |
| [pi](https://pi.dev/) | OpenRouter, npm | week #9 / month #8, 3.32T tokens/week, 📈 +39%; 5,054,141/week, 1.6x | A customizable coding-agent CLI with filesystem, shell, session, and extension capabilities. It combines very strong package distribution with high OpenRouter usage, making its surrounding ecosystem an important platform to watch. |
| [OpenAgentCore](https://github.com/MiniMax-AI/OpenAgentCore) | GitHub | 🆕 topic:new:coding-agent, ⭐168 | A self-hosted Go implementation of the OpenAI Agents API with multiple native coding harnesses. It is a new interoperability play aimed at reducing dependence on one proprietary agent runtime. |
| [clodfarm](https://github.com/matank001/clodfarm) | GitHub | 🆕 topic:new:coding-agent, ⭐136 | A farm of Claude Code agents that divides a mission into subagents and coordinates work across account limits. It is an early but notable experiment in sustained parallel agent scheduling and quota-aware execution. |
| [Autoloom](https://github.com/GanyuanRan/Autoloom) | GitHub | 🆕 topic:new:coding-agent, ⭐122 | A desktop coding environment adding baseline-aware execution, governance, and evidence-backed delivery to agentic changes. It stands out for treating AI development as a governed software process rather than unrestricted code generation. |
| [jev-harness](https://github.com/TypeSafeAI/jev-harness) | GitHub | 🆕 topic:new:coding-agent, ⭐27 | A custom harness in which an LLM proposes work, Jev answers narrow questions, and deterministic code controls each step. Its receipt-based execution model offers an interesting middle ground between free-form agents and conventional static analysis. |
| [agent-afk](https://www.npmjs.com/package/agent-afk) | npm | 44,747/week, 91,940/month, momentum 2.1x | A modifiable, self-hosted coding-agent harness supporting custom prompts, routing, gates, skills, terminal states, and multiple model providers. It is worth watching as an open alternative to vertically controlled coding-agent platforms. |
| [openrig](https://github.com/mvschwarz/openrig) | GitHub | ⭐4,937 (+4,245 this week) | A persistent multi-agent network connecting Claude Code, Codex, and Pi agents through roles, shared context, and owned work. Its nearly repository-sized weekly gain indicates unusually strong launch momentum for agent-team orchestration. |

## 2. Top Projects by Category

### 🔧 AI Infrastructure

| Project | Lang | Stars (total / this week) | Summary |
| :--- | :--- | ---: | :--- |
| [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | TypeScript | 97,116 (+10,722) | An open-source application for managing AI agents in workplace settings. It was the leading agent-focused trending repository this week, showing strong demand for operational agent-management software. |
| [vectorize-io/hindsight](https://github.com/vectorize-io/hindsight) | Python | 45,446 (+14,507) | Infrastructure for agent memory that learns from prior interactions. It recorded the second-largest weekly star gain among the filtered repositories, underscoring demand for persistent context. |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | JavaScript | 76,177 (+3,311) | A design-language and skill system intended to improve AI-assisted design workflows. Its popularity indicates that specialized, domain-specific agent instructions are becoming a major product category. |
| [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell) | Rust | 14,834 (+5,854) | A privacy-focused, safe runtime for autonomous AI agents. NVIDIA’s involvement and the project’s 5,854-star weekly gain signal strong institutional interest in secure agent execution environments. |
| [tile-ai/tilelang](https://github.com/tile-ai/tilelang) | Python | 8,351 (+800) | A domain-specific language for developing high-performance GPU, CPU, and accelerator kernels. It targets the lower-level infrastructure required to optimize AI workloads efficiently. |
| [huggingface/transformers](https://github.com/huggingface/transformers) | Python | 166,954 | A foundational library for defining, training, and deploying transformer models across text, vision, audio, and multimodal workloads. Its continuing presence in active AI topic results reflects its role as core model infrastructure. |

### 🤖 AI Agents / Workflows

| Project | Lang | Stars (total / this week) | Summary |
| :--- | :--- | ---: | :--- |
| [mvschwarz/openrig](https://github.com/mvschwarz/openrig) | TypeScript | 4,937 (+4,245) | A multi-agent system that connects Claude Code, Codex, and Pi through persistent roles, shared context, and owned responsibilities. Its exceptional weekly growth makes it one of the most important new orchestration projects in the dataset. |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | Python | 90,721 (+3,952) | A CLI that gives agents access to search and reading across GitHub, YouTube, Reddit, Twitter, Bilibili, and XiaoHongShu. It packages fragmented web-access methods into a single agent tool without requiring API fees. |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | Python | 27,590 (+948) | A large cross-agent collection of skills, plugins, commands, and operational playbooks for multiple coding agents. It reflects the rapid commoditization of agent behavior through reusable instruction and workflow packages. |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | Python | 251,194 | A persistent, self-improving personal agent with memory, skills, tools, scheduled automation, and subagents. It also leads the individual-app OpenRouter rankings at 13.69T weekly tokens. |
| [TencentCloud/Octop](https://github.com/TencentCloud/Octop) | Python | 6,721 (+1,476) | A self-hosted assistant designed for multi-user and multi-agent operation. It represents the growing enterprise interest in deploying agent systems with shared and governed infrastructure. |
| [MiniMax-AI/OpenAgentCore](https://github.com/MiniMax-AI/OpenAgentCore) | Go | 168 | A newly created, self-hosted implementation of the OpenAI Agents API with native coding harnesses. It is an emerging interoperability option for teams seeking more control over agent deployment. |
| [career-ops-hq/career-ops](https://github.com/career-ops-hq/career-ops) | JavaScript | 73,472 | A locally runnable job-search agent that finds roles, evaluates fit, generates application materials, and tracks progress. It demonstrates how agent workflows are becoming packaged into complete vertical applications. |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | TypeScript | 188,575 | A web-data and crawling platform for supplying agents with external information. It addresses one of the most persistent agent requirements: reliable, tool-accessible context from the open web. |

### 📦 AI Applications

| Project | Lang | Stars (total / this week) | Summary |
| :--- | :--- | ---: | :--- |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | Python | 53,088 (+16,775) | A fully local voice platform for cloning, design, dubbing, dictation, transcription, and audiobook creation. Its 646-language claim and exceptional weekly growth make it the week’s fastest-rising AI application. |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | TypeScript | 56,707 (+3,011) | A video-generation system driven by HTML and designed for agentic use. The HTML-first approach offers a structured alternative to prompt-only video generation. |
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | Python | 128,440 (+2,324) | An automated workflow that turns topics or keywords into high-definition short videos. It remains one of the largest open-source generative-media applications by total community size. |
| [career-ops-hq/career-ops](https://github.com/career-ops-hq/career-ops) | JavaScript | 73,472 | An end-to-end job-search agent that handles discovery, fit scoring, application materials, and tracking. Its local CLI-based delivery makes a previously service-heavy workflow more privacy-conscious and extensible. |
| [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | Python | 65,893 | An LLM-powered system for multi-market analysis, news integration, dashboards, notifications, and scheduled operation. It is a notable example of domain-specific, continuously running agentic applications. |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | Python | 57,605 | A document-to-PowerPoint agent that creates native shapes, charts, transitions, animations, narration, and template-aware slides. It shows generative AI moving beyond document wrappers into structured native file generation. |
| [HKUDS/nanobot](https://github.com/HKUDS/nanobot) | Python | 48,782 | A lightweight personal-agent framework with a WebUI, tools, memory, MCP, multi-agent workflows, and messaging integrations. Its OpenRouter usage and topic visibility show that compact personal agents continue to gain traction. |

### 🧠 LLMs / Training

| Project | Lang | Stars (total / this week) | Summary |
| :--- | :--- | ---: | :--- |
| [huggingface/transformers](https://github.com/huggingface/transformers) | Python | 166,954 | A general model-definition framework supporting training and inference for text, vision, audio, and multimodal models. It remains foundational infrastructure for applying new model architectures and checkpoints. |
| [tile-ai/tilelang](https://github.com/tile-ai/tilelang) | Python | 8,351 (+800) | A DSL for constructing high-performance compute kernels across GPUs, CPUs, and other accelerators. It targets the optimization layer needed to make model training and inference economically viable. |
| [tensorflow/tensorflow](https://github.com/tensorflow/tensorflow) | C++ | 200,701 | A mature general-purpose machine-learning framework for training, inference, and production deployment. Its continued activity shows persistent demand for an end-to-end platform rather than model libraries alone. |
| [ultralytics/ultralytics](https://github.com/ultralytics/ultralytics) | Python | 62,202 | A computer-vision toolkit spanning detection, segmentation, classification, pose estimation, and object tracking. It remains one of the most accessible open-source model ecosystems for practical vision workloads. |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | Python | 63,834 (+5,059) | An educational path for learning to build and deploy AI systems. Its strong weekly growth shows sustained demand for practical, implementation-oriented AI engineering material. |
| [galilai-group/stable-pretraining](https://github.com/galilai-group/stable-pretraining) | Python | 326 | A minimal, scalable library focused on reliable foundation-model and world-model pretraining. It is an emerging research-oriented project aimed at improving the reproducibility and stability of pretraining. |

### 🔍 RAG / Knowledge

| Project | Lang | Stars (total / this week) | Summary |
| :--- | :--- | ---: | :--- |
| [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | TypeScript | 96,061 | A persistent memory system that captures agent work, compresses it, and restores relevant context across sessions. It is one of the clearest signals that memory has become a default feature of coding-agent stacks. |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | Python | 123,757 | A tool that converts code, documentation, schemas, configuration, and PDFs into an explainable knowledge graph. Its deterministic, non-vector approach challenges the assumption that every repository context problem requires embeddings. |
| [mem0ai/mem0](https://github.com/mem0ai/mem0) | Python | 66,569 | Infrastructure for storing and retrieving persistent agent memory. It targets production applications that need durable context rather than short-lived prompt history. |
| [infiniflow/ragflow](https://github.com/infiniflow/ragflow) | Go | 91,679 | A RAG engine that combines document retrieval with agent capabilities. Its mature feature set and large community make it a central platform for document-grounded AI applications. |
| [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) | Python | 74,413 | A context-compression library, proxy, and MCP server that reduces tool output, logs, files, and RAG chunks before they reach models. It targets token economics directly, with reported savings of 20% for coding agents and 60–95% for JSON. |
| [VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex) | Python | 38,630 | A vectorless, reasoning-based document-indexing approach for retrieval-augmented generation. It highlights continued experimentation with alternatives to conventional embedding stores. |
| [topoteretes/cognee](https://github.com/topoteretes/cognee) | Python | 31,354 | A platform for constructing and querying persistent knowledge and memory structures for agents. It sits at the intersection of RAG, knowledge graphs, and long-term agent context. |
| [StarTrail-org/LEANN](https://github.com/StarTrail-org/LEANN) | Python | 13,009 | A privacy-focused RAG system designed for personal devices with substantial claimed storage savings. It reflects the push toward efficient, local retrieval without cloud-hosted vector infrastructure. |

## 3. Trend Signal Analysis

The most explosive community attention is going to **agent orchestration and reusable harnesses**, not to another generic chatbot framework. Paperclip gained 10,722 stars, Hindsight gained 14,507, and openrig gained 4,245 despite having fewer than 5,000 total stars. The recurring harness concepts—approval gates, persistent roles, shared context, evidence-backed execution, quota awareness, and memory—suggest that differentiation is moving from raw model access to the control plane around the model.

A new stack is also forming around **typed, auditable agent execution**. Rust appears in secure runtimes such as OpenShell, Go appears in self-hosted agent cores, and several new projects implement role separation, immutable receipts, file-only memory, isolated sandboxes, and deterministic planning. This resembles the early evolution of ordinary software infrastructure: agents are beginning to acquire runtimes, control planes, observability layers, policy systems, and test gates.

OpenRouter usage connects these repository trends to product adoption. Coding agents dominate the highest-token applications, while fast models dominate the model ranking. Space Bunny Alpha leads with 35.93T tokens, followed by DeepSeek V4.1 Flash at 25.63T and GLM-5.3 Flash at 9.57T. This aligns with the new harness projects’ emphasis on model routing, token compression, and escalation control.

Recent model releases reinforce the same direction. GPT-6.1 Sol, Claude Sonnet 5.5, and the 1M–1.05M-context Pareto Preview are positioned for long-horizon, document-heavy, and agentic work. The ecosystem trend is therefore toward persistent agents operating over larger contexts, with cheaper models handling routine work and frontier models reserved for complex stages.

## 4. Community Hot Spots

- **[paperclipai/paperclip](https://github.com/paperclipai/paperclip) — agent management at work:** Its 10,722-star weekly gain is the strongest validation of a control plane for deploying, supervising, and coordinating workplace agents.
- **[vectorize-io/hindsight](https://github.com/vectorize-io/hindsight) — learning memory:** Persistent, adaptive memory is becoming a core infrastructure primitive rather than a minor chat-history feature.
- **[mvschwarz/openrig](https://github.com/mvschwarz/openrig) — heterogeneous agent teams:** Combining Claude Code, Codex, and Pi with persistent roles and shared context points toward multi-vendor agent organizations.
- **[debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) — fully local generative audio:** The 16,775-star gain demonstrates strong demand for private, ElevenLabs-style speech capabilities without cloud dependence.
- **[NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell) — safe agent runtimes:** Security, privacy, and execution isolation are emerging as foundational requirements for autonomous software agents.

## 5. Model Usage on OpenRouter

- **[stealth/space-bunny-alpha](https://openrouter.ai/stealth/space-bunny-alpha)** leads usage with **35.93T tokens**, making it the dominant model by routed volume in this snapshot.
- **[deepseek/deepseek-v4.1-flash-20260910](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20260910)** ranks second with **25.63T tokens**, while **[z-ai/glm-5.3-flash-20260826](https://openrouter.ai/z-ai/glm-5.3-flash-20260826)** and **[xiaomi/mimo-v2.6-flash-20260921](https://openrouter.ai/xiaomi/mimo-v2.6-flash-20260921)** follow with **9.57T** and **9.54T tokens** respectively.
- Notable frontier entries include **[openai/gpt-6-luna-20260922](https://openrouter.ai/openai/gpt-6-luna-20260922)** at **6.00T tokens**, **[typesafe/jev-1.13-20260917](https://openrouter.ai/typesafe/jev-1.13-20260917)** at **3.06T**, and **[anthropic/claude-opus-5.5-20260921](https://openrouter.ai/anthropic/claude-opus-5.5-20260921)** at **2.31T**.
- Newly listed **[OpenAI GPT-6.1 Sol](https://openrouter.ai/openai/gpt-6-sol)** offers **1,050,000 ctx** and targets agentic coding, computer use, and document-heavy work; the separate Pro configuration trades higher cost for stronger reasoning.
- **[Claude Sonnet 5.5](https://openrouter.ai/anthropic/claude-sonnet-5.5)** brings **1,000,000 ctx** to general feature development and bug fixing, while **[Pareto 26.10 Preview](https://openrouter.ai/unbiased/pareto-26.10-preview)** offers **1,048,576 ctx** for multimodal research, coding, and agentic workflows.

---

## Claude Code Skills Highlights

> Source: [anthropics/skills](https://github.com/anthropics/skills)

## 1. Top Skills Ranking

*PR comment counts are unavailable in the supplied data, so “attention” is inferred from updates, scope, and community discussion—not a verified watch ranking.*

- **[#1298 — skill-creator evaluation reliability](https://github.com/anthropics/skills/pull/1298)** *(Open)*: Fixes trigger-eval interference, Windows subprocess failures, and incorrect handling of runtime errors—addressing a major skill-authoring and quality-assurance concern.
- **[#1742 — mcp-builder MCP 2 compatibility](https://github.com/anthropics/skills/pull/1742)** *(Open)*: Adds support for the renamed `streamable_http_client` and custom HTTP headers, fixing integration with current MCP servers.
- **[#1703 — md2video-audio](https://github.com/anthropics/skills/pull/1703)** *(Open)*: Converts Markdown into narrated, professional MP4 presentations through Marp and text-to-speech, reflecting strong interest in automated content production.
- **[#525 — pyxel](https://github.com/anthropics/skills/pull/525)** *(Open)*: Provides evidence-driven workflows for building, debugging, and visually verifying retro games with Pyxel.
- **[#822 — AI Watch Tester](https://github.com/anthropics/skills/pull/822)** *(Open)*: Adds vision- and browser-driven end-to-end testing, including test generation and execution without conventional test-code scaffolding.

## 2. Community Demand Trends

- **[#228 — Organization-wide sharing](https://github.com/anthropics/skills/issues/228)**: Strong demand for centrally managed skill libraries and share links rather than manual `.skill` uploads.
- **[#1329 — compact-memory](https://github.com/anthropics/skills/issues/1329)**: Interest in compact, structured memory that preserves long-running agent state without wasting context.
- **[#1385 — reasoning quality gates](https://github.com/anthropics/skills/issues/1385)**: Calls for reusable calibration, adversarial-review, and delivery-verification workflows.

## 3. High-Potential Pending Skills

- **[#1245 — Notion implementation and resume auditing](https://github.com/anthropics/skills/pull/1245)**: Combines spec-to-task planning with quantitative resume review; actively updated but still open.
- **[#514 — document typography](https://github.com/anthropics/skills/pull/514)**: Addresses broadly applicable document-quality issues such as widows, orphans, and numbering alignment.
- **[#1776 — blast-radius](https://github.com/anthropics/skills/pull/1776)**: Adds a pre-operation checklist for destructive bulk actions, targeting high-risk agent behavior.

## 4. Skills Ecosystem Insight

The community is most concentrated on **reliable, verifiable automation**—especially safe execution, testing, evaluation, memory efficiency, and enterprise-scale skill distribution.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*