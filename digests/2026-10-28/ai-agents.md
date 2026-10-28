# AI Agents 2026-10-28

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-28) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-28/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-28/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-28/ai-data)

> Projects: 16 | Active today: 7 | Stable releases: 5 | Prereleases (not covered): 8 | Generated: 2026-10-28 05:25 UTC

---

## Highlights

- OpenShell v0.1.6 now refuses to start gateways unless OIDC, mTLS, or JWT authentication is configured; local development requires explicitly setting `allow_unauthenticated_users = true`.
- Claude Code headless `claude -p` consumes roughly 1.8× more of the 5-hour token window than the interactive CLI for the same workload, per user reports with 92 upvotes.
- Hermes Agent leaks a valid `OPENAI_API_KEY` to third-party `base_url` endpoints during model-catalog probes against OpenAI-compatible providers, labeled a security issue.

---

## Coding Agents & Assistants

### Claude Code
- **Release:** [v2.1.312](https://github.com/anthropics/claude-code/releases/tag/v2.1.312) adds `oidc.user_id_claim` for identifying users via non-`sub` claims (e.g., Microsoft Entra ID's `oid`), enables click-to-send for queued messages in fullscreen, and fixes managed settings and organization policy not being fetched after session start.
- **Hot issue:** [#97074](https://github.com/anthropics/claude-code/issues/97074) — headless `claude -p` consumes ~1.8× more of the 5-hour token window than interactive CLI for the same workload; 92 👍, 54 comments.
- **Hot issue:** [#105408](https://github.com/anthropics/claude-code/issues/105408) — `apiKeyHelper` not re-run on 401 when using Vertex with `CLAUDE_CODE_SKIP_VERTEX_AUTH=1`; 22 👍, filed yesterday.
- **News:** [Dev.to plugin](https://dev.to/wst2002rk/your-ai-said-fixed-but-never-ran-the-tests-i-made-a-plugin-that-wont-let-it-say-done-until-5531) prevents Claude Code, Codex, and Cursor from claiming "done" until tests actually pass; 29 reactions.

### Gemini CLI
- **Release:** [v0.66.0](https://github.com/google-gemini/gemini-cli/releases/tag/v0.66.0) fixes synchronized output and spinner rendering, debug console height calculation, terminal buffer flickering, and right-hand border issues across 26 merged PRs.
- **Hot issue:** [#15404](https://github.com/google-gemini/gemini-cli/issues/15404) — temp files flagged as `Generic.PyStealer.AD.3D27F607` by antivirus; 16 comments, triaged as security priority P2.

### OpenCode
- **Release:** [v2.2.0](https://github.com/anomalyco/opencode/releases/tag/v2.2.0) introduces experimental desktop plugins (create, install, share) and a refreshed desktop app experience.
- **Hot issue:** [#59387](https://github.com/anomalyco/opencode/issues/59387) — free tier users hit "usage exceeded" and reset failures; 42 comments, 7 👍, updated today.

### Oh My Pi
- **Release:** [v18.13.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.13.2) adds optional `handlesToolInterrupt` flag to `AgentTool`, allowing interruptible tools like `wait` to drain queued wake events instead of being skipped.

### DeepSeek Harness
- **Prerelease:** [dsh-v0.2.2-alpha.2](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-alpha.2) adds plugin management with rich details and hot-update rollback, chat-text references, full-session Markdown copy, multi-language UI (ja/es/fr/de/ru/pt-BR), experimental `subagent_oar` tool to delegate tasks to local Codex or Claude CLI, personalized recommendations, developer statistics plugin, and Git worktree-based change requests.

### Hermes Agent
- **Hot issue:** [#145452](https://github.com/NousResearch/hermes-agent/issues/145452) — model-catalog probes against a config-declared OpenAI-compatible provider send the wrong credential (or none), leaking a valid `OPENAI_API_KEY` to a third-party `base_url`; 5 comments, security label.
- **Hot issue:** [#143379](https://github.com/NousResearch/hermes-agent/issues/143379) — RFC proposing a durable "doc-chain substrate" for read/restore/governance across session compression; 29 comments.

**Quiet today:** [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

**Unavailable today:** [OpenAI Codex](https://github.com/openai/codex)

---

## Agent Tooling

### OpenShell
- **Release:** [v0.1.6](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.6) — Gateways now refuse to start unless OIDC, mTLS user or operator authentication, or gateway JWTs are configured; for trusted local development only, set `allow_unauthenticated_users = true` under `[openshell.gateway.auth]`. New sandboxes on Kubernetes, Docker, Podman, and VM now open terminals with improved isolation.

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [We let our cloud agents query prod (with OIDC, not secrets)](https://www.formal.ai/blog/cloud-agents-oidc-infrastructure/) | Hacker News | [17 points, 12 comments](https://news.ycombinator.com/item?id=50261584) | Formal uses OIDC to grant cloud coding agents auditable, policy-controlled, short-lived access to production data and infrastructure without long-lived secrets. |
| Show HN: Agent-relay for multi-vendor coding sessions ([saranyan/agent-relay](https://github.com/saranyan/agent-relay)) | Hacker News | [6 points, 0 comments](https://news.ycombinator.com/item?id=50262407) | — |
| [Here be monsters: What do you still need to know when agents do the work?](https://blog.adrq.dev/here-be-monsters-what-do-you-still-need-to-know-when-agents-do-the-work) | Hacker News | [165 points, 88 comments](https://news.ycombinator.com/item?id=50258868) | The article argues that as AI agents write code faster than humans can read it, engineers still need fundamentals, breadth, and willingness to debug when things break. |
| [Survival LLM: AI assistant and emergency library that runs on your own computer](https://www.brangus.io/survival-llm) | Hacker News | [261 points, 120 comments](https://news.ycombinator.com/item?id=50264853) | Survival LLM is a free, offline AI assistant with a survival library of 1.5 million articles that runs locally on Mac and Windows, showing sources for every answer. |
| [Can You Make a 3D Game with AI, If You Don't Know How to Do Anything?](https://buildtounderstand.substack.com/p/can-you-make-a-3d-game-if-you-dont) | Hacker News | [6 points, 1 comment](https://news.ycombinator.com/item?id=50261110) | — |
| Kauldron: Modular, scalable library to train ML models ([google-research/kauldron](https://github.com/google-research/kauldron)) | Hacker News | [25 points, 2 comments](https://news.ycombinator.com/item?id=50235449) | Kauldron is a modular, scalable library for training machine learning models. |
| [I Compared 11 Best AI Design-to-Code Tools for My Client Projects](https://dev.to/devstackhub/i-compared-11-best-ai-design-to-code-tools-for-my-client-projects-4alo) | Dev.to | [38 reactions, 15 comments](https://dev.to/devstackhub/i-compared-11-best-ai-design-to-code-tools-for-my-client-projects-4alo) | The author compared 11 AI design-to-code tools, covering Figma integrations and AI coding agents, to help choose the right tool for converting designs into code. |
| [MCP Token Cost: I Cut My MCP Server From 15 Tools to 4](https://dev.to/aws-builders/mcp-token-cost-i-cut-my-mcp-server-from-15-tools-to-4-cek) | Dev.to | [34 reactions, 41 comments](https://dev.to/aws-builders/mcp-token-cost-i-cut-my-mcp-server-from-15-tools-to-4-cek) | The author rebuilt an AWS cost-triage MCP server, reducing tools from 15 to 4, cutting tool calls from 7 to 2, and shrinking schemas by 88%. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*