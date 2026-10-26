# AI Agents 2026-10-26

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-26) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-26/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-26/ai-data) · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-10-26/ai-trends)

> Generated: 2026-10-26 04:31 UTC | Projects: 16 | Active today: 5 | Stable releases: 3 | Prereleases (not covered): 0

---

## Highlights

- Hermes Agent leaks secrets: CLI flags bypass chat egress and approval-card redaction, while `gateway status` prints MCP command lines with API keys in plaintext
- OpenCode free-tier regression in Desktop 1.19.4: "Free Usage Exceeded" errors persist without limit reset
- Cline SDK v0.2.0 and CLI v3.0.74 introduce live-session reattachment and cross-app task attachment with Hub health timeout
- Command Code DeepSeek harness returns 503 after `/compact`, freezing sessions and blocking input
- Skyvern rewrite achieves 2.3× speedup and 90.5% Odysseys benchmark score via progressive disclosure

---

## Coding Agents & Assistants

### OpenCode
- **Hot issue**: Users report free models suddenly returning "Free Usage Exceeded, Subscribe to Go" errors in Desktop 1.19.4, with limits not resetting as expected [#58781](https://github.com/anomalyco/opencode/issues/58781), [#58670](https://github.com/anomalyco/opencode/issues/58670).
- **News**: Project hit GitHub Trending with +5,921 stars, highlighting its open-source coding agent positioning [GitHub Trending](https://github.com/anomalyco/opencode).

### Cline
- **Release**: [sdk/sdk/v0.2.0](https://github.com/cline/cline/releases/tag/sdk%2Fsdk%2Fv0.2.0) reattaches to live sessions instead of replacing runtimes; [cli-v3.0.74](https://github.com/cline/cline/releases/tag/cli-v3.0.74) attaches to running tasks across apps, adds Hub health timeout, and prevents hangs on frozen Hubs.

### Command Code
- **Hot issue**: DeepSeek Harness Cloudflare returns 503 after `/compact` command, freezing the session and blocking input submission [#1067](https://github.com/CommandCodeAI/command-code/issues/1067).

### Hermes Agent
- **Hot issue**: Secrets passed as CLI flags (`--password=`, `--token=`, `docker login -p`) and Azure keys bypass chat egress and approval-card redaction [#143982](https://github.com/NousResearch/hermes-agent/issues/143982).
- **Hot issue**: `hermes gateway status` prints MCP child-process command lines verbatim, exposing API keys in plaintext [#143938](https://github.com/NousResearch/hermes-agent/issues/143938).

**Quiet today:** [Claude Code](https://github.com/anthropics/claude-code), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [Oh My Pi](https://github.com/can1357/oh-my-pi), [jcode](https://github.com/1jehuang/jcode), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

**Unavailable today:** [OpenAI Codex](https://github.com/openai/codex)

---

## Agent Tooling

(no reportable changes for Agent Deck v1.16.34 — only dependency updates)

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Making My Blog Readable by AI Agents](https://deallocatedobjects.com/posts/making-my-blog-readable-by-ai-agents) | Hacker News | [35 points, 9 comments](https://news.ycombinator.com/item?id=50225443) | A lot of the people reading this blog now aren’t people. They’re agents: Claude, ChatGPT, Perplexity and friends, fetching a page because somebody asked them a question. |
| [Progressive disclosure in agents to make them 2.3x faster](https://www.skyvern.com/blog/deleting-rag-from-our-web-agent-made-it-2-3x-faster/) | Hacker News | [21 points, 2 comments](https://news.ycombinator.com/item?id=50222826) | We rewrote Skyvern from scratch using Pi as inspiration, making it 2.3x faster and score 90.5% on Odysseys benchmark. |
| [Show HN: ADRs for AI – Deliberation records for human–AI work, versioned in Git](https://adrs.systems) | Hacker News | [18 points, 13 comments](https://news.ycombinator.com/item?id=50227041) | — |
| [CowAgent – Open-Source Super AI Assistant](https://cowagent.ai/en/) | Hacker News | [11 points, 2 comments](https://news.ycombinator.com/item?id=50218141) | An open-source super AI assistant & Agent Harness. Plans tasks, runs tools and skills, autonomously grows with memory and knowledge. |
| [Show HN: Agentsh – A Decentralized, Scalable Multiagent Harness](https://github.com/microsoft/Agensh) | Hacker News | [10 points, 1 comments](https://news.ycombinator.com/item?id=50223759) | A Decentralized, Scalable Multiagent Harness. Contribute to microsoft/Agensh development by creating an account on GitHub. |
| [DetectorScope: AI text detectors that show their work](https://github.com/google-deepmind/detectorscope) | Hacker News | [9 points, 2 comments](https://news.ycombinator.com/item?id=50222061) | Build AI text detectors whose decisions are mechanistically grounded and human-auditable (EMNLP 2026) - google-deepmind/detectorscope |
| [Let It Die: The Lazy Email Agent on TabPFN, Gemma and Temporal](https://dev.to/khushighosh/let-it-die-the-lazy-email-agent-on-tabpfn-gemma-and-temporal-10o0) | Dev.to | [16 reactions, 4 comments](https://dev.to/khushighosh/let-it-die-the-lazy-email-agent-on-tabpfn-gemma-and-temporal-10o0) | This is a submission for the Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady          ... |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*