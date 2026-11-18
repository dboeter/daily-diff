## Claude Code

- **News:** A Hacker News submission describes [how its author runs multiple Claude Code accounts on one Mac](https://news.ycombinator.com/item?id=50506993).

## Oh My Pi

- **Release:** [v18.20.3](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.3) is a breaking change: it removes the public `isXdDevicePath` export from `providers/cursor-pi-args`, so ranged reads of `xd://` documents now use standard line-selector behavior, and it renames the browser `tab.clickAt()` option from `clickCount` to `count` to match `tab.click()`. It also fixes rate-limit handling for Mistral and other OpenAI-compatible providers so requests with no available allowance fail immediately with an actionable error suggesting a model or plan change.