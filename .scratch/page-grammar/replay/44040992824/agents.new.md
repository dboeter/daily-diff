## Claude Code

- **Release:** [v2.1.326](https://github.com/anthropics/claude-code/releases/tag/v2.1.326) fixes background sessions that lost the LLM gateway exported by the user's shell, which now stop before any model request. It also fixes the background service terminating unrelated processes, such as an SSH login, when a process number on its list had been reused by another user's.
- **Hot issue:** #110480: an issue reports that premium seat (Team/Enterprise) usage limits on non-Fable models such as Opus and Sonnet are being exhausted roughly 3–5x faster since the week of Nov 9, 2026, with the reporter hitting the limit after 20–30% of previously possible work and saying everyone in their organization sees the same drop, pointing to changed metering rather than workload.
- **News:** [Tokendoctor – the same Claude Code for up to 38% less](https://news.ycombinator.com/item?id=50526584) is a plugin that, by its own description, shows what a use overpays, applies an approved diff, and puts any change back on the user's machine.

## OpenCode

- **Release:** [v1.19.6](https://github.com/anomalyco/opencode/releases/tag/v1.19.6) offers the upgrade to OpenCode 2.0 from the desktop app, downloading in the background and installing only on the user's choice while keeping sessions, projects and settings, with OpenCode 1 plugins needing an update. It also fixes sessions with large image histories by replacing the oldest images with a placeholder once history passes 25 MiB, and starts compaction with a retry on a too-large request body error instead of failing the turn.
- **News:** [OpenCode Browse](https://news.ycombinator.com/item?id=50523459) lets OpenCode and other MCP clients use a real browser, with agents reading, clicking, typing, taking screenshots, recording tabs, and handing logins and 2FA back to the user.

## Oh My Pi

- **Release:** [v18.21.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.21.0)–[v18.22.0](https://github.com/can1357/oh-my-pi/releases/tag/v18.22.0) moves binary analysis out of the standalone `ida` and `ghidra` tools into the `dsm` namespace, replacing `ida.enabled`, `ida.maxOpen` and `ida.idleCloseSec` with `disassembler.backend`, `disassembler.maxOpen` and `disassembler.idleCloseSec`. The same range reworks the `AgentSession` run lifecycle: `agent_end` fires once when a run can no longer resume, and `hasPendingAsyncWork()`, `settleAsyncWork()` and `suppressAutoResumeUntilPrompt()` are replaced by `isRunActive`, `wakeSources` and `waitForRunEnd()`.

## jcode

- **Release:** [v1.0.0](https://github.com/1jehuang/jcode/releases/tag/v1.0.0) launches jcode Cloud, moving a session or coordinated swarm to a VM with `/cloud`, keeping it running after disconnecting and bringing the conversation and repository back with `/local`. Swarms now plan jobs in phases and parallel lanes, starting workers as dependencies finish and showing the team's progress in one pinned view.

## Hermes Agent

- **Release:** [v0.23.2](https://github.com/nousresearch/hermes-agent/releases/tag/v0.23.2) is a patch tag rolling up ~1,989 merged PRs since v0.23.1 for the CLI and installers, the Microsoft Store app, Docker and Hermes Cloud, with curated notes deferred to v0.24.0. Among the fixes, a Desktop or TUI reply that streamed beside a todo or memory call now settles instead of leaving the Stop button up, and Desktop chats created by an August build with a bare `custom` provider can send again.
- **Hot issue:** #156670: a feature and security report says that on a multi-monitor Mac, `computer_use` can still disturb the person sharing the machine, retrying with `delivery_mode: "foreground"` / `raise_window` when background delivery fails and posting system-wide input that collides with the user's mouse and keyboard, with no prompt in `--yolo` sessions, and working in whatever window is on the display the user is actively using; the reporter counted about 30 foreground calls over two weeks and asks for `foreground: ask` as the default that survives `--yolo` plus `avoid_active_display`.