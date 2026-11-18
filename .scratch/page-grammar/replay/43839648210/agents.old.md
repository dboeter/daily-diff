## Claude Code

- **News:** A Hacker News post, [I run multiple Claude Code accounts on one Mac](https://news.ycombinator.com/item?id=50506993), describes how to run several Claude Code accounts on a single Mac.

## Oh My Pi

- **Release:** [v18.20.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.3) removes the `isXdDevicePath` export from `providers/cursor-pi-args` (ranged reads of `xd://` documents now use standard line-selector behavior), renames the browser `tab.clickAt()` option from `clickCount` to `count`, and drops the `seance` agent, `/seance` command, and the task tool's `sourceSession` parameter. It also fixes rate-limit handling for Mistral and other OpenAI-compatible providers so requests with no available allowance fail immediately with an actionable error, and adds opt-in `mnemopi.recallRelevance` (default `off`) to filter automatic memory recall by task relevance, path-scoped `bash.patterns` and `bashInterceptor.patterns` resolved per working directory, and `--no-judge`, `--no-spotlight`, and `--offline` flags.