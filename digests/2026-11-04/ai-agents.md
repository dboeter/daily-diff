# AI Agents 2026-11-04

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-04) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-04/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-04/ai-data)

> Projects: 16 | Active today: 5 | Stable releases: 3 | Prereleases (not covered): 9 | Generated: 2026-11-04 06:01 UTC

---

## Highlights

- OpenShell v0.1.7 introduces breaking changes: emits only native OCSF 1.8.0 records, deprecates multiple `schema_version` settings, moves Podman CA-bundle config under `supervisor.network`, and runs MicroVM sandboxes as the image's `sandbox` account instead of UID 1000:1000.
- Codex CLI v0.166.0 on gpt-6-sol medium reportedly destroyed systemd, containers, and ran random scripts when asked to reboot a server, costing $10,000+; issue has 114 comments in 24 hours.
- Revolut moved ~2,000 engineers off Claude Code and Codex to self-hosted GLM from Z.ai, claiming a 90% reduction in AI coding spend.

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.318](https://github.com/anthropics/claude-code/releases/tag/v2.1.318) fixes `--continue` losing conversation after malformed tool call retries, macOS Bash memory growth stalls, permission prompts eating keystrokes, config writes failing silently on shared network homes, and MCP server re-probing on every start.
- **Hot issue:** [#106878](https://github.com/anthropics/claude-code/issues/106878): users report Opus 4.6 `thinkingDurationMs` dropped ~3.4× between CLI 2.1.296 and 2.1.316 with `effort=max` unchanged; a server-side `supportsAdaptiveThinking` catalog flip is suspected, workaround is `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1` + `MAX_THINKING_TOKENS=`. (regression; 3 comments, 0 👍; +3 in the last 24h)
- **News:** [Revolut swaps Claude for GLM open-weight model, cutting AI coding bill by 90%](https://news.ycombinator.com/item?id=50358078): Revolut moved ~2,000 engineers off Claude Code and Codex to GLM from Z.ai.

### OpenAI Codex

- **Hot issue:** [#59060](https://github.com/openai/codex/issues/59060): an issue says Codex CLI v0.166.0 on gpt-6-sol medium destroyed systemd, containers, and ran random scripts when asked to reboot a server, costing $10,000+. (114 comments, 14 👍; +114 in the last 24h)
- **Hot issue:** [#58258](https://github.com/openai/codex/issues/58258): users report Windows desktop app 26.1027.30824 spins indefinitely sending PPTX attachments in Office preflight with zero-GC capability query loops. (23 comments, 3 👍; +13 in the last 24h)
- **News:** [OpenAI seems to be silently re-enabling model training on Codex chats](https://news.ycombinator.com/item?id=50352757).
- **News:** [Revolut swaps Claude for GLM open-weight model, cutting AI coding bill by 90%](https://news.ycombinator.com/item?id=50358078): Revolut moved ~2,000 engineers off Codex and Claude Code to GLM from Z.ai.

### DeepSeek Harness

- **Prerelease:** [dsh-v0.2.2-alpha.3](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-alpha.3) adds unified right-click/keyboard menus across sessions/workspace/sidebar with developer extensibility, persistent directory tree in file preview, experimental "Change Request & Worktree" unified code review entry, and syncs Cordis Core to 4.0.0-rc.11.

### Hermes Agent

- **Release:** [v0.22.7](https://github.com/nousresearch/hermes-agent/releases/tag/v0.22.7) rolls up ~174 PRs since v0.22.6 including opt-in lead routing for Desktop Group Chats, cron jobs posting to Group Chats, room purpose/shared notes, pinned Kanban boards as quick-switch tabs, `$$TeX$$` and Mermaid diagram rendering via Pele, Desktop update error box with failed output and report link, Web Access step naming with running clock, Telegram on Team Gateway via shared bot, opt-in Slack `thread_followup_silence`, and Daybreak switch for catalog-listed ChatGPT subscription models.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [Oh My Pi](https://github.com/can1357/oh-my-pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

---

## Agent Tooling

### OpenShell

- **Release:** [v0.1.7](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.7) breaks compatibility by emitting only native OCSF 1.8.0 records and deprecating the `ocsf_schema_version` setting, the gateway `schema_version` fields, Helm `server.ocsfLog.schemaVersion`, and `OPENSHELL_OTLP_OCSF_SCHEMA_VERSION`. The Podman-only `[openshell.drivers.podman].additional_ca_bundle` is deprecated in favor of `[openshell.supervisor.network].additional_ca_bundle`, and MicroVM driver sandboxes now run as the image's `sandbox` account instead of UID 1000:1000.
- **Release:** Fixes include shared-pool sandboxes correctly showing `Stopped` after a 60‑second supervisor recovery deadline, `sandbox create` now explains placement failures, VM sandboxes start under restrictive umasks (e.g., `UMask=0077`), policy DNS address selection passes the same destination checks as endpoints, and the gateway accepts a supervisor's full 200‑line reconnect log backlog.

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Postman silently auto-installs AI plugins and attempts to share all API data](https://github.com/postmanlabs/postman-app-support/issues/14370) | Hacker News | [1150 points, 376 comments](https://news.ycombinator.com/item?id=50354960) | A GitHub issue reports that Postman silently auto-installs AI plugins and attempts to share all API data without user consent. |
| Octomind – open-source AI harness that saves your tokens, static rust ([Muvon/octomind](https://github.com/Muvon/octomind)) | Hacker News | [53 points, 36 comments](https://news.ycombinator.com/item?id=50352898) | Octomind is an open-source AI coding agent and runtime distributed as a single static Rust binary that is MCP-native and runs in terminals, CI, or as a daemon. |
| [British fintech Revolut slashes AI coding costs 10x by going self-hosted](https://www.theregister.com/ai-and-ml/2026/11/03/british-fintech-revolut-slashes-ai-coding-costs-10x-by-cutting-out-claude-and-going-self-hosted/5307345) | Hacker News | [15 points, 1 comment](https://news.ycombinator.com/item?id=50358388) | British fintech Revolut reduced its AI coding costs tenfold by moving to self-hosted models. |
| [I Let AI Build a Feature Without Giving It the Full Context](https://dev.to/harsh2644/i-let-ai-build-a-feature-without-giving-it-the-full-context-6h) | Dev.to | [25 reactions, 21 comments](https://dev.to/harsh2644/i-let-ai-build-a-feature-without-giving-it-the-full-context-6h) | The author tested giving an AI a vague prompt to build a feature and found it produced a confident but costly answer. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*