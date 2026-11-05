# AI Agents 2026-11-05

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-05) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-05/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-05/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-05/ai-data)

> Projects: 16 | Active today: 4 | Stable releases: 5 | Prereleases (not covered): 8 | Generated: 2026-11-05 06:28 UTC

---

## Highlights

- context-mode v2.0.0 rewrites the runtime: agents now send scripts that execute in a local sandbox, only printed answers enter the context window, and full output is persisted in a per-project SQLite index; adds nine tools and hooks for ten agents.
- DeepSeek Harness dsh-v0.2.2-rc.1 introduces experimental plugins including `subagent_oar` to delegate tasks to local Codex or Claude CLI, and a change-requests feature that runs sessions in isolated Git worktrees with diff navigation.
- Hermes Agent issue #24770 confirms the architecture intentionally rejects a second external memory provider registration; maintainers mark the limitation `wontfix` and direct multi-provider routing to a catalog plugin or call hooks.

---

## Coding Agents & Assistants

### Gemini CLI

- **Release:** [v0.67.0](https://github.com/google-gemini/gemini-cli/releases/tag/v0.67.0) fixes atomic writes to respect read-only files and hard links, prevents duplicate agent loading when the workspace is the home directory, and handles termination signals to stop tool execution after cancellation in non-interactive mode. Adds a `models` command and `--list-models` flag for model discovery, bridges the IDE companion into container sandboxes over exec stdio, and classifies project spending cap errors as terminal quota errors.

### DeepSeek Harness

- **Prerelease:** [dsh-v0.2.2-rc.1](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.1) adds experimental plugins including a `subagent_oar` tool to delegate tasks to local Codex or Claude CLI, a "Change Requests & Work Trees" feature for running sessions in isolated Git worktrees with diff navigation, and a developer statistics plugin showing per-turn context, cache, and timing metrics. Improves mobile/tablet layouts, adds chat text references with compact previews, and supports copying full session history as Markdown.

### Hermes Agent

- **Hot issue:** [#24770](https://github.com/NousResearch/hermes-agent/issues/24770): users report the architecture enforces a single external memory provider at a time, rejecting second registrations, and the maintainers have marked the limitation as intentional and `wontfix`, directing multi-provider routing to a standalone catalog plugin or the documented `pre_llm_call`/`post_llm_call` hooks. (302 comments, 2 👍; +100 in the last 24h)

**Quiet today:** [Claude Code](https://github.com/anthropics/claude-code), [OpenAI Codex](https://github.com/openai/codex), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [Oh My Pi](https://github.com/can1357/oh-my-pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code)

---

## Agent Tooling

### context-mode

- **Release:** [v2.0.0](https://github.com/mksglu/context-mode/releases/tag/v2.0.0)–[v2.1.0](https://github.com/mksglu/context-mode/releases/tag/v2.1.0) — Context Mode 2.0 is a full rewrite: the agent sends a script that runs in a local sandbox, only the printed answer enters the context window, and full output is stored in a per-project SQLite index for later search. It adds 9 tools, hooks for all 10 supported agents, and a runnable bench. v2.1.0 adds a release plan showing which agents receive each update, a `dry_run` input, and fixes for Kiro CLI 3.0 tool IDs, OpenCode 2.x plugin discovery, and Codex 0.166 hook trust preservation.

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Agent Deck](https://github.com/asheshgoplani/agent-deck)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Ask HN: What's your current AI agentic setup?](https://news.ycombinator.com/item?id=50366117) | Hacker News | [251 points, 239 comments](https://news.ycombinator.com/item?id=50366117) | — |
| [Basically no one is using AI agents for their DoorDash orders](https://arstechnica.com/ai/2026/10/doordash-says-outside-ai-agents-have-only-led-to-hundreds-of-orders-so-far/) | Hacker News | [111 points, 206 comments](https://news.ycombinator.com/item?id=50338474) | An Ars Technica article reports that AI agents are barely being used for food delivery orders like DoorDash, noting the e-commerce agent use case is still in early days. |
| [YC's Garry Tan uses AI agents so much, he spends up to $200K a year on tokens](https://techcrunch.com/2026/11/02/y-combinators-garry-tan-uses-ai-agents-so-much-he-spends-up-to-200k-a-year-on-tokens/) | Hacker News | [78 points, 97 comments](https://news.ycombinator.com/item?id=50366971) | Y Combinator's Garry Tan reportedly spends up to $200,000 annually on AI tokens due to heavy agent usage, as discussed on a podcast with Walter Isaacson. |
| [You'll need nerves of steel to work with AI agents](https://orchidfiles.com/youll-need-nerves-of-steel-to-work-with-ai-agents/) | Hacker News | [46 points, 62 comments](https://news.ycombinator.com/item?id=50373149) | The author details reliability issues encountered when using AI coding agents like Cursor's Composer 2.5, noting problems persist across models such as gpt-6.1-luna. |
| [Your AI's code is "almost right". Here are 7 ways it fools you, and the 30-second check for each](https://dev.to/wst2002rk/your-ais-code-is-almost-right-here-are-7-ways-it-fools-you-and-the-30-second-check-for-each-4i93) | Dev.to | [43 reactions, 6 comments](https://dev.to/wst2002rk/your-ais-code-is-almost-right-here-are-7-ways-it-fools-you-and-the-30-second-check-for-each-4i93) | The author outlines seven ways AI-generated code appears correct but contains subtle flaws, providing a 30-second verification check for each pitfall. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*