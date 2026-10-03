# AI CLI Tools Community Digest 2026-10-03

> Generated: 2026-10-03 15:36 UTC | Tools covered: 7

- [Claude Code](https://github.com/anthropics/claude-code)
- [OpenAI Codex](https://github.com/openai/codex)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)
- [OpenCode](https://github.com/anomalyco/opencode)
- [Pi](https://github.com/earendil-works/pi)
- [Qwen Code](https://github.com/QwenLM/qwen-code)
- [Claude Code Skills](https://github.com/anthropics/skills)

---

## Cross-Tool Comparison

## 1. Ecosystem Overview

AI CLI development is shifting from basic agent interaction toward durable, multi-agent execution. The strongest shared concerns are reliable orchestration, MCP stability, long-session context management, Windows/WSL compatibility, and predictable safety controls. Operational maturity—authentication, state persistence, sandbox networking, and recovery after interruption—now outweighs headline model differences. Projects are also converging on model/provider portability while differentiating through execution environments and extensibility.

## 2. Activity Comparison

| Tool | Issues | PRs | Discussions | Releases today |
|---|---:|---:|---:|---|
| Claude Code | 3 | 3 | 0 reported | 1: `v2.1.288` |
| OpenAI Codex | 3 | 3 | 3 | 3 Rust alphas |
| Gemini CLI | 3 | 3 | 1 | 1 nightly |
| GitHub Copilot CLI | 3 | 0 | 0 | 3 prereleases |
| OpenCode | 3 | 3 | 0 | None |
| Pi | 3 | 3 | 1 | None |
| Qwen Code | 3 | 3 | 0 | 1 nightly |

*Counts reflect items reported in the supplied digest; “0 reported” is not equivalent to disabled community channels.*

## 3. Shared Feature Directions

- **Agent reliability and control:** Claude Code, Codex, Gemini CLI, and Qwen Code emphasize safe delegation, termination reporting, background execution, task-aware waiting, and dynamic model/reasoning selection.
- **Long-running session management:** Codex, Pi, OpenCode, Gemini CLI, and Qwen Code face compaction, unbounded event growth, stale locks, or session-recovery problems.
- **MCP and provider interoperability:** Codex, Copilot CLI, OpenCode, and Pi are addressing catalog races, OAuth/reconnection, lazy discovery, ACP, and OpenAI-compatible providers.

## 4. Differentiation Analysis

Claude Code emphasizes mod/plugin extensibility and policy inheritance; Copilot CLI stands out with selectable local/cloud execution and assisted approvals. Qwen Code is investing most visibly in durable managed-agent infrastructure, while Codex targets daemon-heavy IDE, WSL, and remote workflows. Pi prioritizes a lightweight, extensible coding agent; OpenCode differentiates through provider openness, ACP, plugins, and self-hosted inference, but carries substantial v2 compatibility debt. Gemini CLI focuses on subagent orchestration and large-repository scalability.

## 5. Community Momentum & Maturity

Codex and Qwen Code show the broadest near-term delivery activity, each shipping multiple changes across alpha or nightly branches. Claude Code and Copilot CLI also iterate quickly while surfacing mature operational concerns—authentication, UI, networking, and MCP lifecycle management. OpenCode has high community visibility but greater platform inconsistency; Pi is comparatively selective, with active maintenance but no daily release.

## 6. Trend Signals

The ecosystem is moving toward **durable agents operating in selectable local, cloud, and remote sandboxes**. MCP remains the fastest-growing integration surface—and a major reliability bottleneck. Developers increasingly prioritize bounded tool loops, auditable state, atomic persistence, explicit compaction, and recoverable execution, indicating that agent infrastructure—not merely model output—is becoming the key competitive differentiator.

---

## Per-Tool Reports

<details>
<summary><strong>Claude Code</strong> — <a href="https://github.com/anthropics/claude-code">anthropics/claude-code</a></summary>

## Claude Code Skills Highlights

> Source: [anthropics/skills](https://github.com/anthropics/skills)

## 1. Top Skills Ranking

- [**skill-creator trigger-evaluation fixes (#1298)**](https://github.com/anthropics/skills/pull/1298) — Improves trigger evaluation isolation, Windows subprocess handling, and runtime-error reporting. It directly addresses reliability and security concerns raised in issues [#556](https://github.com/anthropics/skills/issues/556) and [#1383](https://github.com/anthropics/skills/issues/1383). **Status: Open.**
- [**mcp-builder compatibility fix (#1742)**](https://github.com/anthropics/skills/pull/1742) — Adds support for MCP 2’s renamed `streamable_http_client` and custom HTTP headers, addressing compatibility and integration problems. **Status: Open.**
- [**Document typography Skill (#514)**](https://github.com/anthropics/skills/pull/514) — Targets widows, orphans, numbering errors, and other typographic defects in generated documents. **Status: Open.**
- [**SCNet HPC Skill (#1615)**](https://github.com/anthropics/skills/pull/1615) — Provides profile-based SSH, Slurm job generation, cluster discovery, and accelerator guidance for scientific computing. **Status: Open.**
- [**Testing Patterns Skill (#723)**](https://github.com/ananthropics/skills/pull/723) — Covers testing philosophy, unit tests, React component testing, and broader testing-stack practices. **Status: Open.**

## 2. Community Demand Trends

- **Operational reliability:** The most urgent demand is trustworthy skill execution—triggering, evaluation, Windows compatibility, security boundaries, and context-window efficiency. See [#492](https://github.com/anthropics/skills/issues/492), [#1487](https://github.com/anthropics/skills/issues/1487), and [#1394](https://github.com/anthropics/skills/issues/1394).
- **Workflow automation and governance:** Users are seeking agent-governance, reasoning-quality gates, and compact persistent-memory mechanisms. See [#412](https://github.com/anthropics/skills/issues/412), [#1385](https://github.com/anthropics/skills/issues/1385), and [#1329](https://github.com/anthropics/skills/issues/1329).
- **Testing and specialist domains:** Requests also emphasize automated testing, document processing, smart-contract auditing, and technical infrastructure support.

## 3. High-Potential Pending Skills

- [**proofcore-contract-auditor (#1771)**](https://github.com/anthropics/skills/pull/1771) — Solidity/Rust static analysis with cryptographic audit notarization on TON. **Open.**
- [**md2video-audio (#1703)**](https://github.com/anthropics/skills/pull/1703) — Converts Markdown into narrated MP4 presentations using open-source tooling. **Open.**
- [**blast-radius (#1776)**](https://github.com/anthropics/skills/pull/1776) — Safety checklist for destructive or bulk operations and their real-world impact. **Open.**

## 4. Skills Ecosystem Insight

The community is concentrated on making Skills more reliable, secure, and production-ready—especially for agent workflows involving external systems and destructive actions.

---

## TL;DR

- [Claude Code v2.1.288](https://github.com/anthropics/claude-code/releases/tag/v2.1.288) adds a fullscreen selection API for mods and a built-in `gh api` for cloud sessions.
- Model output quality remains the dominant concern, with [#77136](https://github.com/anthropics/claude-code/issues/77136) drawing 138 comments and 438 reactions before closure.
- New engine work improves `/diff` lifecycle behavior and tightens plugin security boundaries.

## Releases

- **[v2.1.288](https://github.com/anthropics/claude-code/releases/tag/v2.1.288):** Mods can call `$.ui.selection()` to retrieve selected text and the containing transcript row; cloud-session images without GitHub CLI now include `gh api`, with a control-character sending fix.

## Hot Issues

- **[#77136 — Repetitive rhetorical tics and incoherent prose](https://github.com/anthropics/claude-code/issues/77136):** Users reported newer models ignoring explicit style guidance. Its 438 reactions and 138 comments made it today’s clearest community signal, though it is now closed.
- **[#89812 — Linux Desktop requires near-daily reauthentication](https://github.com/anthropics/claude-code/issues/89812):** Cowork users report stale-login loops and duplicate sign-ins during folder authorization; the issue remains open.
- **[False-positive safety blocks](https://github.com/anthropics/claude-code/issues/71842):** A large closed cluster alleged classifier overreach in authorized firmware research, IAM audits, SSH setup, and routine development—highlighting a need for better intent and authorization context.

## Key PR Progress

- **[#99137 — Plugin security inheritance](https://github.com/anthropics/claude-code/pull/99137):** Personal plugins may tighten but not loosen inherited `deny`, `ask`, or pinned-variable policies.
- **[#99141 — Deferred `/diff` pane](https://github.com/anthropics/claude-code/pull/99141):** An initially undrawable diff pane will remain available and appear once its host can render it.
- **[#99118 — Toasts during `/diff`](https://github.com/anthropics/claude-code/pull/99118):** Other plugins’ transient notifications will no longer be suppressed while the diff pane is open.

## Feature Request Trends

- Stronger adherence to explicit writing-style constraints.
- Context-aware safety classification that distinguishes authorized defensive work from prohibited activity.
- More reliable authentication and a polished, responsive `/diff` interface.

## Developer Pain Points

- Models producing repetitive language despite precise instructions.
- Safety and permission layers halting legitimate work or treating stale memory as current authorization.
- Authentication instability and terminal/diff UI edge cases disrupting interactive workflows.

</details>

<details>
<summary><strong>OpenAI Codex</strong> — <a href="https://github.com/openai/codex">openai/codex</a></summary>

## 1. TL;DR
- Three Rust alpha releases shipped: `0.162.0-alpha.8`, `.9`, and `.10`, with no changelogs provided.
- VS Code prompt loss and queue-state failures remain the most active community pain point, with several related regressions under investigation.
- Work focused on daemon reliability, MCP/Code Mode compatibility, Windows/WSL execution, and stricter configuration validation.

## 2. Releases
- [rust-v0.162.0-alpha.8](https://github.com/openai/codex/releases/tag/rust-v0.162.0-alpha.8), [alpha.9](https://github.com/openai/codex/releases/tag/rust-v0.162.0-alpha.9), and [alpha.10](https://github.com/openai/codex/releases/tag/rust-v0.162.0-alpha.10) were published within 24 hours. The supplied release data contains no feature or fix notes.

## 3. Hot Issues
- [VS Code drops submitted messages after update](https://github.com/openai/codex/issues/49988): 27 comments and 34 reactions; users report prompts clearing without reaching the conversation, requiring repeated submission.
- [Queued prompts remain marked `streaming=true`](https://github.com/openai/codex/issues/50118): 21 comments indicate completed turns are incorrectly treated as active, preventing normal follow-up prompts.
- [Android Remote pairing fails](https://github.com/openai/codex/issues/48774): 36 comments and 22 reactions highlight an unresolved Windows/mobile authentication-flow problem despite verified accounts and enabled connections.

## 4. Key PR Progress
- [Skip daemon auto-start for Windows-mounted WSL homes](https://github.com/openai/codex/pull/50555): avoids permission failures on DrvFS/9p filesystems.
- [Keep MCP resource helpers available in Code Mode](https://github.com/openai/codex/pull/50546): stabilizes MCP helper availability as servers change.
- [Reject unknown TUI keys in strict config validation](https://github.com/openai/codex/pull/50525): prevents silent configuration typos from passing `--strict-config`.

## 5. Hot Discussions
- **Ideas:** [Dynamic model and reasoning orchestration](https://github.com/openai/codex/discussions/49977) proposes runtime selection of models and reasoning effort.
- **Show and tell:** [session-peer](https://github.com/openai/codex/discussions/50547) enables messaging Codex and Claude Code sessions locally or over SSH; [codex-unlock](https://github.com/openai/codex/discussions/50548) diagnoses and recovers completed thread writer locks.
- **Ideas:** [Task-aware waiting/display-off mode](https://github.com/openai/codex/discussions/50644) requests better laptop-friendly background operation.

## 6. Feature Request Trends
- More reliable prompt submission and queue/session state handling.
- Better Windows, WSL, Linux sandbox, and Remote stability.
- Stronger MCP/plugin interoperability and visible diagnostics for authentication, locking, and daemon failures.

## 7. Developer Pain Points
- **VS Code reliability:** lost prompts, phantom queues, stuck processing, and Cloudflare/auth failures.
- **Windows execution:** app-server crashes, OOM/git fan-out, blank terminals, sandbox and Computer Use failures.
- **Operational control:** insufficient context for writer locks, daemon restarts, task orchestration, and background execution.

</details>

<details>
<summary><strong>Gemini CLI</strong> — <a href="https://github.com/google-gemini/gemini-cli">google-gemini/gemini-cli</a></summary>

## TL;DR
- The latest nightly fixes unreliable Enter/Space selection in interactive lists.
- Agent reliability remains the dominant concern: interrupted subagents may report success, generalist delegation can hang, and browser-agent configuration has gaps.
- Active work targets session integrity, subagent observability, sandbox compatibility, and scalable file discovery.

## Releases
- [`v0.64.0-nightly.20261003.gfb972b2f8`](https://github.com/google-gemini/gemini-cli/releases/tag/v0.64.0-nightly.20261003.gfb972b2f8): improves Enter and Spacebar confirmation reliability for selection-list options.

## Hot Issues
- [Subagent recovery after `MAX_TURNS`](https://github.com/google-gemini/gemini-cli/issues/22323): interrupted investigators can be reported as `GOAL` success despite doing no analysis; 13 comments indicate strong concern about silent failures.
- [Generalist agent hangs](https://github.com/google-gemini/gemini-cli/issues/21409): delegation may block even simple actions for up to an hour; eight likes reflect clear community impact.
- [Gemini underuses skills and subagents](https://github.com/google-gemini/gemini-cli/issues/21968): users report that relevant custom skills are not selected autonomously, reducing expected task decomposition.

## Key PR Progress
- [Preserve subagent multimodal tool responses](https://github.com/google-gemini/gemini-cli/pull/29621): retains image and other sibling response parts when subagents return tool results.
- [Failure-safe persistent state writes](https://github.com/google-gemini/gemini-cli/pull/29402): uses temporary-file writes, `fsync`, and atomic rename to prevent truncated `state.json`.
- [Optimize ignore filtering and subtree pruning](https://github.com/google-gemini/gemini-cli/pull/29582): memoization and symlink caching target multi-second file-discovery delays in large repositories.

## Feature Request Trends
- More predictable agent orchestration, termination reporting, and configurable subagent limits.
- AST-aware search, file reads, and codebase mapping ([discussion](https://github.com/google-gemini/gemini-cli/issues/22745)).
- Better sandboxing, browser-session recovery, and safer mutation controls.

## Developer Pain Points
- Hangs, interrupted runs, and false-success status obscure agent progress.
- Large contexts and tool counts cause failures, excessive tokens, and temporary-file clutter.
- Configuration overrides, symlinked agents, and session replay can behave inconsistently.

</details>

<details>
<summary><strong>GitHub Copilot CLI</strong> — <a href="https://github.com/github/copilot-cli">github/copilot-cli</a></summary>

## TL;DR
- Copilot CLI released [v1.0.92-3](https://github.com/github/copilot-cli/releases/tag/v1.0.92-3), adding a pre-conversation **Ctrl+E environment picker** for switching between local and cloud execution.
- Input responsiveness, sandbox networking prompts, Windows temporary-file behavior, background-agent steering, context recovery, and remote MCP reconnection received fixes.
- MCP reliability remains the dominant concern, with active reports involving OAuth, tool-catalog races, stale macOS state, and sandbox DNS.

## Releases
- [v1.0.92-3](https://github.com/github/copilot-cli/releases/tag/v1.0.92-3): Add the Ctrl+E environment picker; preserve keyboard, paste, and mouse ordering under rapid input; prompt when the sandbox proxy blocks network destinations.
- [v1.0.92-2](https://github.com/github/copilot-cli/releases/tag/v1.0.92-2) and [v1.0.92-1](https://github.com/github/copilot-cli/releases/tag/v1.0.92-1): Fix Windows sandbox temp-file writes, duplicate `sessionEnd` hooks, expired MCP reconnects, background-agent steering, and context-rollover recovery.

## Hot Issues
- [Stale macOS MCP binding blocks all sessions](https://github.com/github/copilot-cli/issues/4998): A reboot/security update leaves `.mcp-writer.binding` tied to an obsolete device ID, making new and resumed sessions unusable. It drew **6 likes and 7 comments**.
- [MCP catalog race rejects valid tool calls](https://github.com/github/copilot-cli/issues/5044): Calls can fail with “MCP tool catalog changed” when an unrelated tool’s `_meta` varies between `tools/list` responses.
- [Linux sandbox DNS fails with systemd-resolved](https://github.com/github/copilot-cli/issues/5027): Sharing the host stub resolver at `127.0.0.53` breaks DNS because that address is unreachable inside the sandbox.

## Feature Request Trends
- More control over execution context: fresh-context plan acceptance while preserving artifacts ([#5041](https://github.com/github/copilot-cli/issues/5041)).
- Better interactive review: keyboard/Vim-style chat-history navigation ([#5015](https://github.com/github/copilot-cli/issues/5015)).
- Bring Copilot’s assisted-approval safety model to ACP clients ([#5047](https://github.com/github/copilot-cli/issues/5047)).

## Developer Pain Points
- MCP authentication, reconnect, catalog consistency, and Linux sandbox networking.
- Context/model failures around compaction and fallback routing ([#5045](https://github.com/github/copilot-cli/issues/5045), [#5042](https://github.com/github/copilot-cli/issues/5042)).
- Input and background-task edge cases, including terminal copy shortcuts and shell-completion notifications.

</details>

<details>
<summary><strong>OpenCode</strong> — <a href="https://github.com/anomalyco/opencode">anomalyco/opencode</a></summary>

## TL;DR
- Free-tier requests are broadly failing with a misleading “can only be used from within OpenCode” authentication error, including in the official desktop app ([#52905](https://github.com/anomalyco/opencode/issues/52905)).
- OpenCode’s SQLite event storage continues to grow dangerously large—users report databases of 7–9 GB without a supported cleanup mechanism ([#52936](https://github.com/anomalyco/opencode/issues/52936)).
- Active fixes target ACP remote worktrees, piped CLI output, and proxy routing, while v2 compatibility concerns continue to surface ([#52955](https://github.com/anomalyco/opencode/pull/52955)).

## Hot Issues
- **[#49580](https://github.com/anomalyco/opencode/issues/49580)** — MonoCode cannot use Muse Spark 1.3 Free despite working authentication. Its 47 comments made this the day’s most discussed report, indicating broad third-party-frontend uncertainty.
- **[#52931](https://github.com/anomalyco/opencode/issues/52931)** — v2.0.20–2.0.22 removed built-in `todowrite`/`todoread` support from the model catalog; users are resorting to custom plugins.
- **[#52952](https://github.com/anomalyco/opencode/issues/52952)** — ACP sessions against SSH/devcontainer worktrees issue invalid reads for directory paths, breaking remote Zed workflows.

## Key PR Progress
- **[#52956](https://github.com/anomalyco/opencode/pull/52956)** filters directories from ACP tool-call locations, directly addressing the remote-worktree failure.
- **[#52955](https://github.com/anomalyco/opencode/pull/52955)** flushes `opencode api get` output before exit, preventing truncated JSON when piping large responses.
- **[#52951](https://github.com/anomalyco/opencode/pull/52951)** adds loopback hosts to `no_proxy`, restoring local TUI-to-service calls when `HTTPS_PROXY` is configured.

## Feature Request Trends
- Hot-reloadable configuration, plugins, and MCP changes without restarting sessions ([#39987](https://github.com/anomalyco/opencode/issues/39987)).
- Richer plugin control over compaction and the restoration of v1-native todo tools ([#50862](https://github.com/anomalyco/opencode/issues/50862)).
- Better local/LAN model discovery and faster parallel tool-result submission for self-hosted inference ([#27554](https://github.com/anomalyco/opencode/pull/27554), [#52933](https://github.com/anomalyco/opencode/issues/52933)).

## Developer Pain Points
- Free-tier authentication and provider availability are confusing and unreliable.
- Event retention can grow `opencode.db` to multiple gigabytes without cleanup controls.
- v2 regressions affect todos, proxy networking, CLI piping, snapshots, ACP, and Windows shells.

</details>

<details>
<summary><strong>Pi</strong> — <a href="https://github.com/earendil-works/pi">earendil-works/pi</a></summary>

## TL;DR

- No new Pi release shipped in the past 24 hours; work centered on TUI correctness, performance, and provider compatibility.
- The community resolved several recently reported crashes and data-integrity risks, while major fullscreen-TUI and long-session performance issues remain open.
- Provider work expanded around OpenAI Responses, Azure Foundry, Bedrock reasoning controls, and durable-session options.

## Hot Issues

- [Clipboard regression closed](https://github.com/earendil-works/pi/issues/9688): OSC 52 copying had stopped working outside SSH after a prior fix; nine comments and broad approval indicate strong developer interest.
- [CLI auto-compaction missing](https://github.com/earendil-works/pi/issues/10330): Non-TUI runs reportedly never trigger automatic context compaction, creating a significant long-running-agent reliability risk.
- [Prompt extensions dropped](https://github.com/earendil-works/pi/issues/10267): `before_agent_start` prompt contributions disappear during retries, resumes, and background-triggered runs, potentially causing incorrect billing and inconsistent behavior.

## Key PR Progress

- [TUI line diffing](https://github.com/earendil-works/pi/pull/10383): Preserves pointer equality for unchanged lines, reducing rendering work in large transcripts.
- [OpenAI top-level instructions](https://github.com/earendil-works/pi/pull/8734): Adds configurable Responses-compatible system instructions without duplicating them in model input.
- [Durable session options](https://github.com/earendil-works/pi/pull/10410): Exposes thinking budgets, WebSocket timeout, and session ID through durable conversation streaming.

## Hot Discussions

- **Ideas:** [Disable Pi’s share feature](https://github.com/earendil-works/pi/discussions/10128) seeks a clearer opt-out for a privacy-sensitive default.

## Feature Request Trends

- More reliable context management, including CLI compaction and accurate token accounting.
- Better fullscreen-TUI controls, selection behavior, and large-session performance.
- Broader compatibility with MCP standards, OpenAI-compatible providers, Azure, and Bedrock.

## Developer Pain Points

- Long sessions expose TUI lag, stale selection/input state, and context-usage inaccuracies.
- Automation paths differ from interactive mode, causing stuck prompts, silent agent lifecycle behavior, and missing compaction.
- Edge cases around retries, aborted tools, extensions, and session export threaten transcript integrity and reliable billing.

</details>

<details>
<summary><strong>Qwen Code</strong> — <a href="https://github.com/QwenLM/qwen-code">QwenLM/qwen-code</a></summary>

## 1. TL;DR
- Qwen Code shipped nightly **v0.24.7-nightly.20261002.a011f66944**, including fixes aligning Code Mode with lazy tool discovery and permission handling.
- Managed-agent development focused on durable execution, session recovery, background shell support, and reducing database hot-path load.
- Community attention remains concentrated around reliability and safety, especially runaway tool loops, CI failures, workspace authorization, and session-store scalability.

## 2. Releases
- **v0.24.7-nightly.20261002.a011f66944** updates core Code Mode tool discovery and permission behavior. [Release](https://github.com/QwenLM/qwen-code/releases/tag/v0.24.7-nightly.20261002.a011f66944)

## 3. Hot Issues
- **[#12380] Managed Agent dual-path architecture** proposes separating model inference from tool-environment provisioning, with durable Sessions, Workspaces, and recoverable executions. Its 45 comments make it the day’s dominant design discussion. [Issue](https://github.com/QwenLM/qwen-code/issues/12380)
- **[#10887] Repeated tool errors can consume 5–14M tokens** because the agent lacks early dead-end termination; this is a significant cost and availability risk. [Issue](https://github.com/QwenLM/qwen-code/issues/10887)
- **[#13184] Managed session stores and panel projections grow without bounds**, raising long-term storage, memory, and operational concerns. [Issue](https://github.com/QwenLM/qwen-code/issues/13184)

## 4. Key PR Progress
- **[#13265] H3 background Shell and Monitor runtime** extends the Managed path with asynchronous shell execution and monitoring. [PR](https://github.com/QwenLM/qwen-code/pull/13265)
- **[#13217] Reduce database amplification** targets repeated session-snapshot writes and other hot paths. [PR](https://github.com/QwenLM/qwen-code/pull/13217)
- **[#13299] Normalize models.dev catalog IDs** supports dotted and dashed model identifiers, addressing Qwen/GLM/Doubao lookup failures. [PR](https://github.com/QwenLM/qwen-code/pull/13299)

## 5. Feature Request Trends
- Durable, recoverable managed-agent sessions and workspace execution.
- Background shell, monitor, glob, and hosted foreground-shell capabilities.
- Context-management controls, including explicit reminders after auto-compaction.

## 6. Developer Pain Points
- Runaway failure loops and excessive token usage.
- CI flakiness, silent CodeQL cancellations, dependency-audit failures, and checkout issues.
- Unbounded persistence growth and authorization races during workspace/session transitions.

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*