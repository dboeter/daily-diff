# AI Agents 2026-10-31

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-31) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-31/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-10-31/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-31/ai-data)

> Projects: 16 | Active today: 3 | Stable releases: 5 | Prereleases (not covered): 2 | Generated: 2026-10-31 05:21 UTC

---

## Highlights

- Hacker News reports a backdoor in the official Claude Code for VS Code extension on the Cursor Marketplace that drops a persistent SSH backdoor across macOS, Linux, and Windows  
- OpenCode v2.2.3–v2.2.5 introduces breaking changes: TUI plugins require OpenTUI 0.8, and managed policy `integration.use` now covers only integrations with separate actions for MCP, skills, and plugins  
- Wiz reports at least nine AI developer platforms breached this month in a series of agentic attacks leading to LLMJacking at scale

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.316](https://github.com/anthropics/claude-code/releases/tag/v2.1.316) adds `CLAUDE_CODE_DISABLE_ULTRATHINK` to turn off the `ultrathink` keyword, pooled group budgets for the Claude apps gateway, `CLAUDE_CODE_DISABLE_LOOPED_CROSS_CERT_DROP` to keep cross-certificates, `CLAUDE_CODE_SUBAGENT_EFFORT` for subagent effort levels, `managed.policy_mode: layered` for merged policies, and `guardrail.input_tagging` for Bedrock guardrails; deprecates fast mode for Opus 4.8 (removed November 30, 2026); fixes shell commands left running on exit, bash aliases with line breaks, bash scripts stopping after first command with `SHELLOPTS` exported, PowerShell hooks not blocking on exit code 2, and network requests hanging on corrupted compressed responses.
- **Hot issue:** [#106167](https://github.com/anthropics/claude-code/issues/106167): users report a server-delivered "games" instruction blocks professional development work on commissioned digital board wargame modules, refusing legitimate paid client projects since October 27. (6 comments, 6 👍; +12 in the last 24h)
- **Hot issue:** [#106037](https://github.com/anthropics/claude-code/issues/106037): an issue says scheduled tasks miss custom connector tools for the entire run while built-in connectors load normally; custom connector tools appear only after a follow-up message, a regression of a previously fixed issue. (regression; 2 comments, 1 👍; +3 in the last 24h)
- **News:** [Hacker News](https://news.ycombinator.com/item?id=50300683) reports a backdoor in the official Claude Code for VS Code extension on the Cursor Marketplace that drops a persistent SSH backdoor across macOS, Linux, and Windows.

### OpenCode

- **Release:** [v2.2.3](https://github.com/anomalyco/opencode/releases/tag/v2.2.3)–[v2.2.5](https://github.com/anomalyco/opencode/releases/tag/v2.2.5): breaking changes include TUI plugins requiring OpenTUI 0.8 and managed policy `integration.use` now covering only integrations with separate actions for MCP, skills, and plugins; adds built-in Claude Agent provider using `claude auth login`, worktree and shell mode shortcuts, percentage compaction buffer (`"compaction": { "buffer": "20%" }`), persistent desktop terminals surviving restarts, opt-in artifacts with local static-file provider, enabled schedules under `opencode serve`, guided Claude Agent setup, and quick base branch selection; fixes MCP servers disconnected by large stdio messages, idle locations restarting MCP servers, compaction capping at model context window, LiteLLM errors triggering compaction, reasoning preserved on model switch, plugin cursor styles preserved, and Cursor `/login` instruction replaced with `claude auth login`.
- **Hot issue:** [#60399](https://github.com/anomalyco/opencode/issues/60399): users report CLI hangs before sending requests on networks that drop fragmented TLS ClientHello (post-quantum key share), with no session, stream, or error for 120+ seconds; works instantly through VPN. (17 comments, 3 👍; +18 in the last 24h)
- **Hot issue:** [#60573](https://github.com/anomalyco/opencode/issues/60573): users report OpenCode and models not working in Russia without VPN, DPI mitigations from previous comments ineffective, affecting Go Plus subscription. (8 comments, 4 👍; +11 in the last 24h)

### Oh My Pi

- **Release:** [v18.14.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.14.1) replaces `SentToolDefinitions.inactiveFor(messages, tools)` with `withInactiveTools(context)` which also clears stale `inactiveTools`; fixes long tool-call intents blocking execution when intent tracing enabled; adds `codexAccessPrograms` stream option and `configureCodexAccessPrograms()` to disable automatic Daybreak Blue `access_programs` request on Codex; adds `waitForSibling` to `RotateCredentialOptions` to skip sibling-unblock wait; limits Cursor runs through `omp auth-gateway` to client's own tools advertised as MCP; fixes native judgment requests sending credentials unredacted, Codex sessions losing responses and retrying when native turn lane refuses live steering, and Cursor models being told file/shell tools unavailable while client runs calls anyway.

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Show HN: Sketch Stadium – watch your agent play Pictionary](https://sketch.wakeshift.ai/games/q5ucru) | Hacker News | [31 points, 9 comments](https://news.ycombinator.com/item?id=50305218) | — |
| [Black October: At least nine AI developer platforms breached this month](https://www.wiz.io/blog/black-october-for-ai-developer-platforms) | Hacker News | [4 points, 0 comments](https://news.ycombinator.com/item?id=50311844) | At least nine AI developer platforms were breached this month in a series of agentic attacks leading to LLMJacking at scale. |
| [Cisco gives engineer unlimited AI tokens to rewrite legacy code](https://fortune.com/2026/10/30/cisco-president-jeetu-patel-gen-z-27-year-old-unlimited-ai-tokens-rewrite-legacy-code-entry-level-jobs/) | Hacker News | [141 points, 175 comments](https://news.ycombinator.com/item?id=50304122) | Cisco engineer Paddy, 27, was given unlimited AI tokens by leadership and told to "go nuts" rewriting legacy code. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*