# AI Agents 2026-11-15

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-15) · **🟪 AI Agents** · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-15/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-15/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-15/ai-data)

> Projects: 15 | Active today: 3 | Stable releases: 2 | Prereleases (not covered): 1 | Generated: 2026-11-15 06:12 UTC

---

## Highlights

- Oh My Pi v18.20.1–v18.20.2 changes `lsTree()` to return `{ path, mode }` objects, a breaking API change.
- OpenAI Codex issue #61489: users report that with request compression enabled, highly compressible bodies receive HTTP 400 instead of documented 413 and Codex does not fall back to uncompressed requests.
- Shotoku introduces local-first governance for AI agents with budget caps, spending limits, human approval gates, and a tamper-evident audit trail enforced before payment.

---

## Coding Agents & Assistants

### Claude Code

- **News:** [What a task costs on Opus 5.5](https://news.ycombinator.com/item?id=50503241) breaks down per-task token costs on Opus 5.5 and shows which settings affect the bill.
- **News:** [Show HN: Cyberviber – a $15 touch screen to show which Claude session needs you](https://news.ycombinator.com/item?id=50496642) describes a 2.4″ ESP32 display that lists running Claude Code sessions and focuses a terminal on tap.

### OpenAI Codex

- **Hot issue:** [#61489](https://github.com/openai/codex/issues/61489): users report that with `features.enable_request_compression` on, highly compressible request bodies receive a bare HTTP 400 instead of the documented 413, and Codex never falls back to uncompressed requests. (12 comments, 0 👍; +11 in the last 24h)

### Oh My Pi

- **Release:** [v18.20.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.1)–[v18.20.2](https://github.com/can1357/oh-my-pi/releases/tag/v18.20.2) changes `lsTree()` to return `{ path, mode }` objects (breaking), fixes context cost estimates, Vertex AI Gemini v1beta1 support, Amazon Bedrock region selection, Gemini 4 long responses, Cursor conversation context, Bedrock streaming retries, Claude account recovery, OpenRouter reasoning preservation, Xiaomi MiMo auth, and Perplexity sign-in; adds Antigravity CLI ACP provider with managed install, Google sign-in, host tools, and retained conversations, plus Antigravity models for Gemini, Claude, and GPT-OSS with selectable thinking levels.

**Quiet today:** [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Kilo Code](https://github.com/Kilo-Org/kilocode), [OpenCode](https://github.com/anomalyco/opencode), [Pi](https://github.com/earendil-works/pi), [jcode](https://github.com/1jehuang/jcode), [Cline](https://github.com/cline/cline), [Command Code](https://github.com/CommandCodeAI/command-code), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [Hermes Agent](https://github.com/nousresearch/hermes-agent)

---

## Agent Tooling

**Quiet today:** [OpenShell](https://github.com/NVIDIA/OpenShell), [herdr](https://github.com/herdrdev/herdr), [Conductor](https://github.com/microsoft/conductor)

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| Show HN: Agweb – a browser for agents that stays out of your way ([paul-nameless/agweb](https://github.com/paul-nameless/agweb)) | Hacker News | [92 points, 27 comments](https://news.ycombinator.com/item?id=50497147) | Agweb is a browser designed for AI agents that avoids focus stealing, has a minimal footprint, and displays all tabs in a single view. |
| [Claude asked to renumber pages deletes professor's syllabus, year of notes](https://www.tomshardware.com/tech-industry/artificial-intelligence/rogue-claude-ai-tasked-with-renumbering-pages-accidentally-deletes-law-professors-entire-syllabus-one-year-of-lecture-notes-youre-right-to-be-angry-i-deleted-your-files-through-my-own-carelessness-humbled-agent-admits) | Hacker News | [45 points, 63 comments](https://news.ycombinator.com/item?id=50499114) | A University of Chicago lecturer reported that a Claude AI agent accidentally deleted his entire syllabus and a year of lecture notes. |
| [Agile Manifesto for Agents](https://debarshibasak.github.io/readables/blogs/agent-first-development) | Hacker News | [28 points, 6 comments](https://news.ycombinator.com/item?id=50496562) | The "Agile Manifesto for Agents" proposes twelve commandments for coordinating AI agents in teams, emphasizing scope understanding and bounded work delivery. |
| [Show HN: Shotoku – Local-first action governance and budget caps for AI agents](https://www.shotoku.dev/) | Hacker News | [9 points, 1 comment](https://news.ycombinator.com/item?id=50496705) | Shotoku provides local-first governance for AI agents with budget caps, spending limits, human approval requirements, and a tamper-evident audit trail enforced before any payment. |
| [Show HN: Open-Source Version of Cyclon: Phone where AI is the interface?](https://opencyclone.vercel.app/) | Hacker News | [8 points, 1 comment](https://news.ycombinator.com/item?id=50493213) | An open-source Cyclon alternative lets users turn their existing phone into an AI interface without purchasing dedicated hardware. |
| [Composio vs Nango vs Scalekit: What Changes When Your Agent Goes to Production](https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2) | Dev.to | [29 reactions, 3 comments](https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2) | The author compares Composio, Nango, and Scalekit for taking AI agents to production, highlighting security review challenges after successful demos. |
| [Your Agent Needs a Schema, Not a Better Prompt](https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm) | Dev.to | [22 reactions, 9 comments](https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm) | The author argues that AI agents require structured schemas rather than improved prompts to function reliably in production. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*