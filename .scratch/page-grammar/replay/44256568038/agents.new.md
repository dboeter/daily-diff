## Claude Code

- **Release:** [v2.1.327](https://github.com/anthropics/claude-code/releases/tag/v2.1.327) fixes Remote Control so stopping the server in worktree mode no longer deletes a running session's git-ignored files such as `.env`, fixes self-hosted runners with `--use-anthropic-git-proxy` so they no longer delete a non-empty directory named by `GIT_CONFIG_GLOBAL` at startup, and fixes `claude mcp add` and `claude mcp remove` with project scope so they no longer delete other top-level keys from `.mcp.json` such as `$schema` or another tool's `servers`.
- **News:** [How the Claude Code team thinks about verification](https://news.ycombinator.com/item?id=50529612) describes how the Claude Code team uses end-to-end, property, and differential tests to let coding agents verify their work with evidence, and how it keeps its verifiers honest.

## OpenAI Codex

- **Release:** [rust-v0.169.1](https://github.com/openai/codex/releases/tag/rust-v0.169.1)–[rust-v0.170.0](https://github.com/openai/codex/releases/tag/rust-v0.170.0) fixes MCP OAuth credential races during cancellation, login, and logout, fixes child threads losing existing sandbox restrictions, and adds WebRTC negotiation for realtime voice calls in the TUI.
- **Hot issue:** #57101: An issue reports that Windows Computer Use leaves capture access and a gold/yellow display border open after the screenshot-producing turn completes, with the helper and capture-access record still present about five hours later, and requests that capture resources be released when their owning work ends.

## OpenCode

- **Release:** [v1.19.6](https://github.com/anomalyco/opencode/releases/tag/v1.19.6)–[v2.3.2](https://github.com/anomalyco/opencode/releases/tag/v2.3.2) adds an OpenCode 1 offer to upgrade to OpenCode 2, with plugins made for OpenCode 1 needing an update, fixes GPT-6.2 models re-billing the system prompt as uncached input on every step, and shell commands still running when their timeout expires now move to the background instead of being killed.
- **Hot issue:** #37216: A feature request reports that `packages/tui` has all strings hardcoded in English with no localization system, while the app, desktop, and console packages have i18n support with 17+ locales, and proposes extracting TUI strings into an i18n key system and adding a `locale` config option.

## Oh My Pi

- **Release:** [v18.22.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.1)–[v18.22.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.2) makes the JavaScript eval `commit` helper validate its arguments strictly, removes the obsolete `OMP_NATIVE_FEATURES` configuration variable, and fixes shutdown or cancellation of an omp session so it no longer makes every other session sharing the agent directory see its OAuth accounts as depleted for 5 minutes.
- **Hot issue:** #19578: An issue reports that `openai-codex/gpt-6.2-sol` and `gpt-6.2-astra` are absent from Oh My Pi's Codex model list after `omp models refresh`, that a direct request for Sol fails model resolution, and that selecting Sol through a temporary in-memory clone is rejected by the Codex backend while native Codex CLI lists both models and completes a GPT-6.2 Sol request; the report notes the comparison is not yet controlled for the same account and workspace.