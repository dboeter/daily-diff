## Claude Code
- **Release:** [v2.1.326](https://github.com/anthropics/claude-code/releases/tag/v2.1.326) fixes background sessions losing the shell-exported LLM gateway by stopping them before any model request, fixes the background service ending user processes after a process number is reused, and adds Code Mode when agent teams are enabled.
- **Hot issue:** #110480: An issue reports that premium-seat usage limits on Team/Enterprise have been exhausted about 3–5x faster on non-Fable models (Opus / Sonnet) since the week of Nov 9, 2026, leaving only about 20–30% of the previous workload before hitting limits, and that everyone in the reporter's organization sees the same drop.
- **News:** A Hacker News item, [Tokendoctor – the same Claude Code for up to 38% less](https://news.ycombinator.com/item?id=50526584), says tokendoctor is a Claude Code plugin that shows what use overpays, fixes it with a diff you approve, and runs locally, claiming up to 38% less.

## OpenCode
- **Release:** [v1.19.6](https://github.com/anomalyco/opencode/releases/tag/v1.19.6) fixes sessions with many images by replacing the oldest images when history passes 25 MiB, fixes provider errors for oversized request bodies by starting compaction and a retry, and offers an upgrade to OpenCode 2 that downloads in the background and keeps sessions, projects, and settings.
- **News:** A Hacker News item, [OpenCode Browse](https://news.ycombinator.com/item?id=50523459), says Browse lets OpenCode and other MCP clients use your real browser, with agents reading, clicking, typing, taking screenshots, recording tabs, and handing logins and 2FA back to you.

## Oh My Pi
- **Release:** [v18.21.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.21.0)–[v18.22.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.0) moves binary analysis from the standalone `ida` and `ghidra` tools into the backend-neutral `dsm` namespace, replaces `ida.enabled`, `ida.maxOpen`, and `ida.idleCloseSec` with `disassembler.backend`, `disassembler.maxOpen`, and `disassembler.idleCloseSec`, and updates the `AgentSession` run lifecycle with `agent_end` and `agent_pause`.

## jcode
- **Release:** [v1.0.0](https://github.com/1jehuang/jcode/releases/tag/v1.0.0) launches jcode Cloud with `/cloud` and `/local`, reworks swarms into phased parallel lanes with one pinned progress view, and makes the terminal lighter with lower CPU, fewer wakeups, faster transcript rendering, and less rendered-text memory.

## Hermes Agent
- **Release:** [v0.23.2](https://github.com/nousresearch/hermes-agent/releases/tag/v0.23.2) fixes Desktop chats created by an August build with a bare `custom` provider so they can send again after updating, fixes Desktop or TUI replies that stream beside a todo or memory call so they settle instead of leaving the Stop button up, and fixes duplicate “Recovered reply” messages after a mid-stream crash.
- **Hot issue:** #156670: An issue reports that on multi-monitor Macs `computer_use` can bring agent windows to the foreground and post real system-wide input, including in `--yolo` sessions with no approval prompt, and proposes keeping agent windows off the active display and requiring approval for foreground delivery.