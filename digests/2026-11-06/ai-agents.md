# AI Agents 2026-11-06

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-06) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-06/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-06/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-06/ai-data)

> Projects: 16 | Active today: 7 | Stable releases: 9 | Prereleases (not covered): 3 | Generated: 2026-11-06 06:22 UTC

---

## Highlights

- Oh My Pi v18.17.0 introduces breaking changes: `parseShell()` replaced with `RunTrace.present()` and `ShellVisualization`; `fromJsonSchema` returns opaque validator without `.pick()`/`.props`; `MarkdownTheme.heading` requires depth argument; `CustomEditor.modelMentionLabel` replaced with `resolveModelMention`; adds `Agent.queuedMessageGate` and `wireToolsFingerprint()`; enables opt-in Responses WebSockets for catalog models.
- Claude Code users report a privacy violation: the `User-Agent` header sent during web searches includes their email address, exposing it to third parties and leading to scam emails; the issue has 41 comments and 239 upvotes.
- Hermes Agent v0.23.0 removes all built-in browser tools in favor of `browser_exec` only, consolidates Office skills into `microsoft-office`, expands approval gate to catch `curl | sudo bash` pipes and hidden credential uploads, refuses inconsistently parsed URLs, and requires macOS 13+ and 64-bit Windows.

---

## Coding Agents & Assistants

### Claude Code

- **Hot issue:** [#107757](https://github.com/anthropics/claude-code/issues/107757): Users report a privacy violation where the `User-Agent` header sent during web searches includes their email address, exposing it to third parties and leading to scam emails; the reporter demands complete removal of this behavior rather than an opt-out setting. (area:security; 41 comments, 239 👍; +180 in the last 24h)
- **News:** [Show HN: Stroq – a local audit of what your coding agent did and why](https://news.ycombinator.com/item?id=50380704) describes an open-source tool that finds known secrets in AI coding agent sessions including Claude Code, then guards future sessions with local hooks tracing risky commands to the content that dictated them.
- **Hot issue:** [#107318](https://github.com/anthropics/claude-code/issues/107318): [Bug] Artifacts shared from another account can no longer be read or edited from a Code session after the desktop update (regression; 6 comments, 1 👍; +6 in the last 24h)

### OpenAI Codex

- **Release:** [rust-v0.167.0](https://github.com/openai/codex/releases/tag/rust-v0.167.0) adds an agent command center (`codex agents --no-daemon`), backend switching in the session picker with draft preservation, local image preview in supported terminals, GCP Vertex AI setup wizard, opt-in system proxy settings, and expanded patch details during approval prompts; fixes include saved chats staying visible after provider switches, `Ctrl+L` clearing display while preserving history, and automatic context compaction accounting for failed responses.
- **Hot issue:** [#59301](https://github.com/openai/codex/issues/59301): Users report severe typing lag in dot conversations on macOS that worsens over time, with characters appearing in bursts and Korean input particularly affected; the same dot remains responsive in Chrome on the same machine. (18 comments, 5 👍; +14 in the last 24h)
- **News:** [Show HN: Stroq – a local audit of what your coding agent did and why](https://news.ycombinator.com/item?id=50380704) describes an open-source tool that finds known secrets in AI coding agent sessions including Codex, then guards future sessions with local hooks tracing risky commands to the content that dictated them.

### Kilo Code

- **Release:** [v7.8.27](https://github.com/Kilo-Org/kilocode/releases/tag/v7.8.27) has no notable changes listed.

### OpenCode

- **Release:** [process-daemon-v0.5.0](https://github.com/anomalyco/opencode/releases/tag/process-daemon-v0.5.0) updates the pty protocol to version 8 and publishes `@opencode/pty@0.5.0` to npm.

### Oh My Pi

- **Release:** [v18.17.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.17.0) introduces breaking changes: replaces `parseShell()` with `RunTrace.present()` and `ShellVisualization`, changes `fromJsonSchema` to return an opaque validator without `.pick()`/`.props`, requires heading depth argument for `MarkdownTheme.heading`, replaces `CustomEditor.modelMentionLabel` with `resolveModelMention`, adds `Agent.queuedMessageGate` for filtering queued messages, adds `wireToolsFingerprint()` for tool spec hashing, and enables opt-in standard Responses WebSockets for catalog-supported models with incremental turns and HTTP/SSE fallback.

### Hermes Agent

- **Release:** [v0.23.0](https://github.com/nousresearch/hermes-agent/releases/tag/v0.23.0) "The Hearth Release" removes all built-in browser tools in favor of `browser_exec` only (Camofox users get the plugin auto-installed), renames `hermes mcp serve` to `hermes mcp-serve`, consolidates Word/PowerPoint/Excel into one `microsoft-office` skill, disables the webapp by default, requires macOS 13+ and 64-bit Windows (Electron 44), masks more secret shapes (quoted secrets, connection strings, Azure keys, non-PEM private keys, SMB passwords), expands approval gate to catch curl | sudo bash pipes and hidden credential uploads, refuses URLs with inconsistently parsed hosts, and makes unattended gateways skip unapproved shell hooks instead of freezing.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

### context-mode

- **Release:** [v2.1.1](https://github.com/mksglu/context-mode/releases/tag/v2.1.1)–[v2.1.4](https://github.com/mksglu/context-mode/releases/tag/v2.1.4) expand deny rules to all `ctx_execute` shell languages (sh, bash, zsh, dash, ksh, fish) and `ctx_batch` commands with per-segment linear-time checks; `fetch` blocks additional private address ranges and validates redirect hops; `ctx_upgrade` preserves v1 data directories and limits hook output to 16 MiB; fixes include bounded `Read` returning full content, subagents without ctx tools falling back to `WebFetch`/`curl`, and Claude Code host field preservation.

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Launch HN: Rivet (YC W23) – Scale and Orchestrate Agents on S3 ([rivet-dev/rivet](https://github.com/rivet-dev/rivet)) | Hacker News | [88 points, 47 comments](https://news.ycombinator.com/item?id=50381687) | Rivet, a YC W23 project, launches an orchestrator for agentic workloads that scales and coordinates AI agents on S3 with high-density throughput. |
| [Building a Multi-Agent System from Scratch: Architecture Patterns](https://kadhar.dev/blog/multi-agent-systems-from-scratch) | Hacker News | [84 points, 34 comments](https://news.ycombinator.com/item?id=50380658) | The article outlines three architecture patterns — orchestrator-worker, blackboard, and pipeline — for coordinating multiple AI agents, plus failure modes that appear beyond single-agent demos. |
| [Show HN: Nico – a two-agent type personal agent on your Mac](https://nico.app/) | Hacker News | [7 points, 2 comments](https://news.ycombinator.com/item?id=50377851) | Nico is a two-agent personal assistant for Mac triggered by holding the right Command key, using the user's existing AI subscriptions to answer email, convert PDFs to spreadsheets, and tidy the Desktop. |
| [An AI Testing Presentation Became the Final Push for Organizational Change at My Company](https://dev.to/xulingfeng/an-ai-testing-presentation-became-the-final-push-for-organizational-change-at-my-company-12ag) | Dev.to | [51 reactions, 28 comments](https://dev.to/xulingfeng/an-ai-testing-presentation-became-the-final-push-for-organizational-change-at-my-company-12ag) | The author describes how a presentation on multi-agent AI testing became the catalyst for broader organizational change discussions at their company. |
| [WebMCP Attack Lab: Can an E-Shop Hijack Your AI Agent?](https://dev.to/gramli/webmcp-attack-lab-can-an-e-shop-hijack-your-ai-agent-4oe5) | Dev.to | [48 reactions, 34 comments](https://dev.to/gramli/webmcp-attack-lab-can-an-e-shop-hijack-your-ai-agent-4oe5) | The author tests WebMCP, a proposed web standard, by building an attack lab to see if an e-commerce site can hijack an AI agent. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*