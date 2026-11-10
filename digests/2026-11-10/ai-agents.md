# AI Agents 2026-11-10

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-10) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-10/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-10/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-10/ai-data)

> Projects: 15 | Active today: 4 | Stable releases: 7 | Prereleases (not covered): 3 | Generated: 2026-11-10 07:03 UTC

---

## Highlights

- Pi v1.5.1 removes `GrepOperations.readFile` callbacks for context lines (breaking change)
- Claude Code users report Team usage exhausted in ~30.5 hours after reset, far faster than prior burn rate (regression)
- Hermes Agent v0.23.1 raises plugin catalog cap to 16 MiB, fixing silent install failures for plugins added since last update

---

## Coding Agents & Assistants

### Claude Code

- **Release:** [v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321)–[v2.1.322](https://github.com/anthropics/claude-code/releases/tag/v2.1.322) add fast mode on Vertex in global/US/EU regions, make Claude Fable 5.2 the default model (1M context, $8/$40 per Mtok), add `--settings` to `claude remote-control`, and fix multiple regressions including MCP OAuth token leaks, Bash permission prompts on network paths, `NotebookEdit`/`Edit` corruption on UNC/WSL paths, and Windows `FileChanged` hook failures with lowercase drive letters.
- **Hot issue:** [#107390](https://github.com/anthropics/claude-code/issues/107390): users report weekly Team usage exhausted in ~30.5 hours after reset (Nov 4–5), far faster than the prior ~2-hour session burn rate, with no workflow change. (regression; 11 comments, 5 👍; +9 since 2026-11-08)
- **Hot issue:** [#107922](https://github.com/anthropics/claude-code/issues/107922): an issue says Claude in Chrome fails to connect to the desktop app on Windows with 403 "OAuth token forbidden" on the bridge WebSocket since ~Oct 29, despite an active Pro plan confirmed by support. (regression; 4 comments, 1 👍; +3 since 2026-11-08)
- **News:** [Why Is AI Slop So Frustrating to Read?](https://news.ycombinator.com/item?id=50433799) analyzes unclear writing in AI output, measuring 78% of Claude Code reply sentences as unclear versus 11% on Stack Overflow.
- **News:** [Take Claude Code Above Average: Let Antigravity Review It](https://dev.to/gde/take-claude-code-above-average-let-antigravity-review-it-1f3g) describes building a tool that lets a second AI review Claude Code's work to improve quality.

### Pi

- **Release:** [v1.5.1](https://github.com/earendil-works/pi/releases/tag/v1.5.1) removes `GrepOperations.readFile` callbacks for context lines (breaking), stops sending empty `tools` for OpenAI-compatible models to fix vLLM 0.20+ 400 errors, adds pi auth login/logout without starting a session, enables idle prompt cache warming up to 30 minutes, implements Anthropic message threads sending only new messages, enriches Mermaid diagrams with pie charts and clickable labels, adds GitHub Copilot classifiers via `models.classify()`, and shows package update summaries with `pi update --extensions`.

### Oh My Pi

- **Release:** [v18.18.4](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.4)–[v18.18.6](https://github.com/can1357/oh-my-pi/releases/tag/v18.18.6) add Claude Fable 5.2 and Mythos 5.2 models, introduce Otari gateway provider (`/login otari`), pause Google Antigravity via a `disabled` auth rule, add `base64SkipThoughtSignature` compat flag for Gemini gateways, fix MCP `headers`/stdio `env` with `!command` retrying on 401/403, fix exclusive MCP tools keeping batch position, add Tern long-press menu to edit/resend/fork turns, fix multi-question ask forms showing Submit on last tab, and raise plugin catalog cap to 16 MiB so live catalog works again.

### Hermes Agent

- **Release:** [v0.23.1](https://github.com/nousresearch/hermes-agent/releases/tag/v0.23.1) raises the plugin catalog size cap from 2 MiB to 16 MiB so the live catalog is used instead of falling back to the bundled one, fixing silent install failures for plugins added since the last update; the patch rolls up ~618 PRs since v0.23.0 including Esc backtrack in TUI/CLI, group chats on gateways without Desktop, shared gateway connections, in-app browser sign-in with real browser profile, `hermes gateway attach`, new plugin API (session-scoped env, JSON-RPC, `llm.oneshot`, stable `conversation_id`, hooks), and faster transcript/handoff reads.

**Quiet today:** [OpenAI Codex](https://github.com/openai/codex), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/conductor-oss/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [ChatGPT Desktop forwards your SSH agent to remote machines](https://news.ycombinator.com/item?id=50422628) | Hacker News | [208 points, 73 comments](https://news.ycombinator.com/item?id=50422628) | — |
| Show HN: STE80 Humanizer – de-AI text by writing 80% of the way to ASD-STE100 ([Dodaios/ste80-humanizer](https://github.com/Dodaios/ste80-humanizer)) | Hacker News | [83 points, 24 comments](https://news.ycombinator.com/item?id=50429144) | The author released an agent skill called STE80 Humanizer that rewrites text to reach 80% of the ASD-STE100 Simplified Technical English standard. |
| [Ask HN: How do you evaluate the skills your AI agents use?](https://news.ycombinator.com/item?id=50426070) | Hacker News | [18 points, 4 comments](https://news.ycombinator.com/item?id=50426070) | — |
| USB: A trust layer for AI skills and MCP servers ([PeepSick/usbplus](https://github.com/PeepSick/usbplus)) | Hacker News | [11 points, 2 comments](https://news.ycombinator.com/item?id=50432661) | USB+ provides a universal skill format with 529 skills and 16 target formats, including a trust layer with secscan and mcprobe. |
| Show HN: Airgap-check – find what your AI app silently downloads offline ([humanethq/airgap-check](https://github.com/humanethq/airgap-check)) | Hacker News | [9 points, 0 comments](https://news.ycombinator.com/item?id=50431705) | Airgap-check audits AI repositories for offline crashes, silent telemetry, and .env secret routing when run with --network none. |
| Show HN: Glassbrain – Read your agent's brain, know what your agent knows ([voidixyn/glassbrain](https://github.com/voidixyn/glassbrain)) | Hacker News | [6 points, 1 comment](https://news.ycombinator.com/item?id=50423154) | Glassbrain lets you inspect agents' knowledge graphs by converting plain JSON into a single HTML file for review. |
| [Top 7 Best Agent Gateways](https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi) | Dev.to | [21 reactions, 3 comments](https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi) | The author reviews seven agent gateways, highlighting that agents can call a model five times and search. |
| [Don't Write More Prompts. Install These 10 Trending 'Skills' Instead](https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc) | Dev.to | [20 reactions, 7 comments](https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc) | The author tested 10 trending GitHub skills that enhance agent capabilities. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*