## Claude Code

- **Release:** [v2.1.327](https://github.com/anthropics/claude-code/releases/tag/v2.1.327) fixes self-hosted runners with `--use-anthropic-git-proxy` deleting a non-empty directory named by `GIT_CONFIG_GLOBAL` at startup, and stops Remote Control server shutdown in worktree mode from deleting a running session's git-ignored files such as `.env`.
- **News:** [How the Claude Code team thinks about verification](https://news.ycombinator.com/item?id=50529612) covers how end-to-end, property and differential tests let coding agents verify their work with evidence, and what the Claude Code team does to keep its verifiers honest.

## OpenAI Codex

- **Release:** [rust-v0.169.1](https://github.com/openai/codex/releases/tag/rust-v0.169.1)–[rust-v0.170.0](https://github.com/openai/codex/releases/tag/rust-v0.170.0) fixes permission updates and child threads losing existing sandbox restrictions, and fixes MCP OAuth credential races during cancellation, login, and logout.
- **Hot issue:** #57101: an issue reports that on Windows, Computer Use leaves capture access and a gold/yellow display border open long after a screenshot-producing turn completes, and asks that capture resources be released when the owning work ends.

## OpenCode

- **Release:** [v1.19.6](https://github.com/anomalyco/opencode/releases/tag/v1.19.6)–[v2.3.2](https://github.com/anomalyco/opencode/releases/tag/v2.3.2) fixes GPT-6.2 models re-billing the system prompt as uncached input on every step; on GitHub Copilot `gpt-6.2-sol`, uncached input per step dropped from about 14,000 tokens to 3. Shell commands still running when their timeout expires now move to the background instead of being killed.
- **Hot issue:** #37216: an issue requests i18n support for the TUI, noting its strings are hardcoded in English while the app, desktop and console packages already support 17+ locales, and proposing a `locale` option in `opencode.json` plus a set of target languages.

## Oh My Pi

- **Release:** [v18.22.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.1)–[v18.22.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.2) makes the JavaScript eval `commit` helper validate its arguments strictly, so unknown option names and non-object options now throw a `TypeError` and scripts passing extra options need updating, and removes the obsolete `wayland-pipewire` Cargo feature and `OMP_NATIVE_FEATURES` variable.
- **Hot issue:** #19578: an issue reports that `openai-codex/gpt-6.2-sol` and `gpt-6.2-astra` are missing from Oh My Pi's Codex model list after `omp models refresh` and that direct requests fail with `model_not_found`, while native Codex lists and serves both, though the reporter notes it is not yet a controlled same-account-and-workspace comparison.