# AI Agents 2026-10-25

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-10-25) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-10-25/ai-models) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-10-25/ai-data)

> Generated: 2026-10-25 01:00 UTC | Projects: 16 | Active today: 8 | Stable releases: 1 | Prereleases (not covered): 1

---

## Highlights

- Hermes Agent unified gateway merge introduced regressions across CLI, TUI, desktop, API server, cron, and editor integrations
- Claude Code “fizzy_lake” redesign breaks dark theme on Windows: glaring text, invisible bold, greyed-out inline code, inverted sidebar, slower launch
- OpenAI Codex VS Code extension fails to start UI on Windows, blocking Plus and Pro users
- OpenCode free-model limits report exhausted immediately after reset with “LIMIT REACHED WITHOUT ANY USE” errors
- OpenShell surges 896 stars on GitHub Trending as a safe, private runtime for autonomous agents

---

## Coding Agents & Assistants

### Claude Code

- **Hot issue**: A redesign experiment (“fizzy_lake”) breaks the dark theme on Windows — glaring text, near-invisible bold in Latin and Cyrillic, greyed-out inline code, inverted sidebar, and slower launch; re-login no longer restores the old styles. [#104695](https://github.com/anthropics/claude-code/issues/104695), [#104529](https://github.com/anthropics/claude-code/issues/104529)
- **News**: Hacker News thread alleges the desktop app silently adds users’ email addresses to outbound HTTP requests. [HN discussion](https://news.ycombinator.com/item?id=50219875)

### OpenAI Codex

- **Hot issue**: VS Code extension 26.1021.22027 fails to start its UI on Windows (VS Code 1.143.1), blocking Codex for multiple users on Plus and Pro plans. [#56691](https://github.com/openai/codex/issues/56691), [#56655](https://github.com/openai/codex/issues/56655)

### Gemini CLI

- **News**: The project appeared on GitHub Trending, gaining ~44 stars for its open-source terminal agent that brings Gemini directly into the CLI. [GitHub Trending](https://github.com/google-gemini/gemini-cli)

### OpenCode

- **Hot issue**: Users report free-model limits exhausted immediately after reset (“LIMIT REACHED WITHOUT ANY USE”) and “Free Usage Exceeded, Subscribe to Go” errors on all free models in Desktop 1.19.4. [#58670](https://github.com/anomalyco/opencode/issues/58670), [#58781](https://github.com/anomalyco/opencode/issues/58781)

### Oh My Pi

- **Hot issue**: On Windows x64, resuming a session with a pending `edit` tool call triggers unbounded recursion in the native module (`pi_natives.win32-x64-baseline.node`), causing a deterministic stack overflow (0xC00000FD). [#16857](https://github.com/can1357/oh-my-pi/issues/16857)

### Hermes Agent

- **Hot issue**: Linux desktop launches at 6% window opacity due to a default translucency setting applied via `setOpacity`; the Settings UI hides the control to fix it. [#143426](https://github.com/NousResearch/hermes-agent/issues/143426)
- **Hot issue**: Unified gateway merge (#106742) introduced post-merge regressions across CLI, TUI, desktop, API server, cron, and editor integrations — conversations now route through a single gateway process. [#143547](https://github.com/NousResearch/hermes-agent/issues/143547)

**Quiet today:** [Kilo Code](https://github.com/Kilo-Org/kilocode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

---

## Agent Tooling

### OpenShell
- **News:** GitHub Trending highlights OpenShell as a safe, private runtime for autonomous AI agents, driving a surge of 896 stars. [https://github.com/NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell)

### Agent Deck
- **Release:** [v1.16.33](https://github.com/asheshgoplani/agent-deck/releases/tag/v1.16.33) updates Vite to 8.3.4 in the web test suite and adds macOS app-side documentation checks.

**Quiet today:** [herdr](https://github.com/herdrdev/herdr), [context-mode](https://github.com/mksglu/context-mode)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [Show HN: Corgi, a helpful {agent, terminal} multiplexer](https://corgi.computer/) | Hacker News | [125 points, 42 comments](https://news.ycombinator.com/item?id=50214373) | Friendly helper for your agents. |
| [Show HN: Penmentor – Claude marks up your handwritten math like a teacher](https://github.com/AbdullahAlhariri/penmentor) | Hacker News | [66 points, 9 comments](https://news.ycombinator.com/item?id=50167604) | AI mentor that corrects your written math visually with local harnesses. |
| [Launch HN: Respan (YC W24) – Open-source Rust AI gateway built around plugins](https://news.ycombinator.com/item?id=50167583) | Hacker News | [53 points, 21 comments](https://news.ycombinator.com/item?id=50167583) | — |
| [Benchmarking Bot Detection Systems Against Modern AI Agents in 2026](https://research.poh.org/bot-benchmarking-2026/) | Hacker News | [49 points, 8 comments](https://news.ycombinator.com/item?id=50169506) | We test five bot detection systems against scripted browsers, stealth browsers, and AI browsing agents completing a realistic survey. Detection rates range from 9% to 99%. |
| [The attack chain behind the v1.107.0 LiteLLM release](https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain) | Hacker News | [19 points, 0 comments](https://news.ycombinator.com/item?id=50215317) | — |
| [Agents fail like engineers, so I review them like engineers](https://blog.greenflagged.dev/posts/agents-fail-like-engineers/) | Hacker News | [14 points, 4 comments](https://news.ycombinator.com/item?id=50211031) | The Skeptic validates claims, the Logician makes sure the logic is sound, and the Steward thinks long-term. These 3 agents took my workflow to the next level. |
| [Scrawl: show an agent the problem](https://scrawl.kitlangton.com/) | Lobste.rs | [1 points, 1 comments](https://lobste.rs/s/jqjioq/scrawl_show_agent_problem) | Record your screen, voice, clicks and drawings on a Mac or PC, then paste one compact capture into your AI coding agent. |
| [I let an open model delete 1,242 of my saved articles. On purpose. I feel lighter.](https://dev.to/sarvar_04/i-let-an-open-model-delete-1242-of-my-saved-articles-on-purpose-i-feel-lighter-l7f) | Dev.to | [24 reactions, 18 comments](https://dev.to/sarvar_04/i-let-an-open-model-delete-1242-of-my-saved-articles-on-purpose-i-feel-lighter-l7f) | Unpile is a 100% local read-later triage agent. TabPFN decides which saved articles you will actually read, Gemma writes the digest, offline and free. |
| [Sloth Reads: an open model reads my read-later pile overnight, then reads me the good ones](https://dev.to/sbis04/sloth-reads-an-open-model-reads-my-read-later-pile-overnight-then-reads-me-the-good-ones-3o14) | Dev.to | [19 reactions, 2 comments](https://dev.to/sbis04/sloth-reads-an-open-model-reads-my-read-later-pile-overnight-then-reads-me-the-good-ones-3o14) | This is a submission for the Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*