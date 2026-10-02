# AI CLI Tools Community Digest 2026-10-03

> Generated: 2026-10-02 20:23 UTC | Tools covered: 7

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

# Cross-Tool AI CLI Ecosystem Report — 2026-10-03

## 1. Ecosystem Overview

AI CLI development is shifting from basic chat and code generation toward **durable, multi-agent execution systems**. The dominant engineering concerns are session continuity, context compaction, MCP/process lifecycle, background-task observability, permissions, and recovery from partial failures. Cross-platform reliability—particularly on Windows and in browser/computer-use environments—remains a weakness across otherwise capable tools. At the same time, structured output, Git workflow controls, BYOK/provider compatibility, and automation-friendly APIs show where the tools are converging. Community demand is increasingly for **predictability and inspectability**: users want clear status, actionable errors, and explicit control over what agents may do.

## 2. Activity Comparison

> Counts reflect the items highlighted in the supplied digests, not necessarily the repositories’ complete activity totals. A lack of listed Discussions means none were included in the digest, not necessarily that the channel was inactive.

| Tool | Issues highlighted | PRs highlighted | Discussions highlighted | Release status |
|---|---:|---:|---:|---|
| **Claude Code** | 10 | 2 | 0 | Stable release: **v2.1.288** |
| **OpenAI Codex** | 10 | 10 | 4 | Rapid pre-release: **7 Rust alpha builds** for `0.162.0` |
| **Gemini CLI** | 10 | 10 | 0 | Nightly: **v0.64.0-nightly.20261002** |
| **GitHub Copilot CLI** | 10 | 1 | 0 | Three patch releases: **v1.0.92-0/-1/-2** |
| **OpenCode** | 10 | 10 | 0 | No release in the last 24 hours |
| **Pi** | 10 | 10 | 3 | No release in the last 24 hours |
| **Qwen Code** | 10 | 10 | 0 | Nightly: **v0.24.7-nightly.20261001** |

### Release interpretation

- **Copilot CLI** had the most conventional stability release train, concentrating on Windows sandboxing, MCP reconnects, OAuth, background-agent steering, and session hooks.
- **Codex** and **Gemini CLI** were the most visibly active in pre-release engineering, with ten implementation PRs each; Codex’s seven alpha builds also indicate unusually rapid iteration.
- **OpenCode** and **Pi** had no release but substantial active development. OpenCode was focused on OpenCode 2.0 usability and session/provider behavior, while Pi addressed provider compatibility, security hardening, and its upcoming 1.0 packaging.
- **Claude Code** shipped a focused stable release while its community activity centered more on long-running correctness problems than feature breadth.
- **Qwen Code’s** activity was heavily concentrated on Managed Agent architecture and distributed-session infrastructure.

## 3. Shared Feature Directions

### A. Reliable MCP and subprocess lifecycle management

- **Claude Code:** MCP servers survive process exit; Windows child processes terminate inconsistently.
- **Codex:** MCP startup can outlive the originating connection, leaving thread listeners unloaded; browser/computer tasks suffer persistent MCP startup failures.
- **Copilot CLI:** stale MCP writer bindings, expired Streamable HTTP sessions, OAuth callback incompatibility, workspace `.mcp.json` loading, and registry failures.
- **Qwen Code:** managed sessions require recoverable tool execution, writer fencing, and authenticated broker-provisioned credentials.
- **Gemini CLI:** browser-agent settings and tool lifecycle behavior remain inconsistent.

**Need:** deterministic startup, shutdown, reconnection, timeout, and cleanup semantics across local and remote MCP servers.

### B. Durable sessions and recoverable agent state

- **Claude Code:** compaction can silently remove working context; archiving lacks a complete restore/delete lifecycle.
- **Gemini CLI:** quick exit after resume could delete history; nightly work adds append-only recording, atomic state writes, and backup recovery.
- **OpenCode:** disk exhaustion can crash the TUI and leave malformed tool-call records; session cleanup can affect progressing work.
- **Qwen Code:** live session deletion can create degraded history; managed stores and projections grow without bounds.
- **Copilot CLI:** mobile state can remain queued after local execution; context rollover and lifecycle hooks require stronger guarantees.

**Need:** durable transcripts, transactional state updates, bounded retention, explicit compaction, and reliable archive/restore/delete semantics.

### C. Context and token transparency

- **Claude Code:** users request visibility and opt-outs for microcompaction and idle compaction.
- **Gemini CLI:** large tool sets trigger API errors; eager directory expansion and binary-file inclusion cause context bloat.
- **Codex:** model-access errors omit entitlement and context-window details.
- **Copilot CLI:** model fallback can select a model unable to hold the accumulated static prompt.
- **Pi:** context usage can jump to 330K after a network error; long-context pricing and reasoning-token accounting require correction.
- **Qwen Code:** system prompts, tools, `QWEN.md`, and skills create opaque non-conversation overhead; side queries bypass context-window clamping.

**Need:** accurate estimates, visible fixed-context costs, predictable compaction, and safe budgeting across every request path.

### D. Agent and subagent observability

- **Claude Code:** orphaned agents/background work and cloud messaging behavior are difficult to reconcile.
- **Codex:** queued prompts may never send; reviews can silently skip fork PRs; subagent restrictions are under-specified.
- **Gemini CLI:** subagents can report success after `MAX_TURNS`; `/bug` omits failing subagent trajectories.
- **OpenCode:** subagents may ask the user questions that should route through the parent; queue-versus-steer semantics were regressed.
- **Pi:** extension prompt contributions disappear during retries, resumes, notifications, and plan continuations.

**Need:** explicit task states, acknowledged queues, correct termination statuses, complete trajectories, and controllable message routing.

### E. Safety, permissions, and confinement

- **Qwen Code:** confinement should occur before permission flow; host re-enrollment can leave stale valid credentials; Desktop workspaces unexpectedly lose trust.
- **Gemini CLI:** concerns include destructive Git operations and temporary scripts scattered through repositories.
- **Claude Code:** safeguard false positives affect benign actions and prompts.
- **Copilot CLI:** persistent allowed directories do not reliably suppress shell prompts.
- **Codex:** Windows browser permissions cannot be verified, masking whether execution is authorized.

**Need:** policy decisions enforced before prompting, durable across restarts, correctly scoped, and observable through actionable diagnostics.

### F. Better Git and automation controls

- **Codex:** restore branch selection and clarify worktree creation; improve fork-PR review behavior.
- **Claude Code:** `gh api` is now built into cloud sessions, and model/mode selection needs clearer controls.
- **OpenCode:** schema-constrained output from `opencode run` improves machine-consumable automation.
- **Copilot CLI:** persistent permissions and background execution need predictable behavior.
- **Pi and Qwen Code:** packaging, hosted workspace, and extension integrations are expanding.

**Need:** scriptable, structured interfaces with explicit repository, branch, permission, and completion semantics.

### G. Non-interactive and background-work parity

- **Gemini CLI:** PRs enable skills in non-interactive mode and add web-tool timeouts.
- **Copilot CLI:** background agents gain steerable messages and more reliable context recovery.
- **OpenCode:** schema output and explicit queue/steer controls target automation.
- **Codex:** worktree selection, thread lifecycle, and async task visibility are being improved.

**Need:** background agents should expose the same skills, controls, status, and safety guarantees available in interactive sessions.

## 4. Differentiation Analysis

### Claude Code

**Focus:** Rich local/cloud agent workflows, mods, MCP, session lifecycle, and context management.

**Technical approach:** Extends a mature interactive coding agent with mod APIs, cloud-session tools, model/mode configuration, and cross-client session behavior. Recent release additions are relatively small, while the backlog reflects pressure from long-running sessions, silent compaction, and client inconsistency.

**Best fit:** Developers already invested in Claude’s ecosystem who need extensibility and local/cloud orchestration.

**Current tradeoff:** Powerful but increasingly complex; context transparency, Windows reliability, and complete session lifecycle remain unresolved.

### OpenAI Codex

**Focus:** Rust CLI/TUI evolution, Git workflows, computer/browser use, model routing, and subagent composability.

**Technical approach:** Rapid alpha development around an event-driven agent runtime, with changes to retry handling, connector caching, MCP lifecycle, terminal input, and Git-aware commands. Worktree UX and dynamic model orchestration show a push toward composable agent infrastructure.

**Best fit:** Developers seeking an open, terminal-centric coding agent and working directly with its evolving runtime.

**Current tradeoff:** Fast iteration and strong extensibility potential, offset by alpha volatility and significant Windows and state-observability gaps.

### Gemini CLI

**Focus:** Session durability, subagents, browser agents, repository-scale context management, and non-interactive workflows.

**Technical approach:** Heavy investment in file discovery, lazy `@directory` expansion, glob matching, atomic persistence, bounded web calls, OAuth standards, and tool-count reduction. It is actively addressing context bloat and lifecycle hangs at the implementation layer.

**Best fit:** Developers working in large repositories or using delegated and browser-capable workflows.

**Current tradeoff:** Broad capability, but subagent termination, hanging, settings compliance, and destructive-action risks need stronger reliability.

### GitHub Copilot CLI

**Focus:** GitHub-centric development, enterprise MCP, OAuth, sandboxing, background-agent steering, and lifecycle hooks.

**Technical approach:** The three-patch release train is a stability pass over remote MCP reconnection, Windows temporary-file behavior, OAuth reauthentication, context rollover, and session events. It is the most tightly aligned with GitHub’s authentication and developer ecosystem.

**Best fit:** GitHub users and organizations already invested in Copilot, GitHub Actions, and enterprise identity.

**Current tradeoff:** Convenient ecosystem integration, but MCP remains its largest source of friction; custom model compatibility is less mature.

### OpenCode

**Focus:** Provider flexibility, BYOK, OpenCode 2.0, TUI usability, session continuity, and automation.

**Technical approach:** Provider-neutral, with a strong TUI and broad model/account support. Active work targets startup performance, queue semantics, schema-constrained output, clipboard behavior, and V2 regression repair.

**Best fit:** Developers who value model choice, local provider control, and a keyboard-centric interface.

**Current tradeoff:** High flexibility and customization, but provider, quota, entitlement, and V2 transition issues add operational uncertainty.

### Pi

**Focus:** Extensibility, provider compatibility, token accounting, security, terminal UX, and a planned 1.0 architecture.

**Technical approach:** Lightweight, provider-adapter-oriented, and increasingly native/C++-oriented. Recent changes address Azure/Bedrock/OpenRouter compatibility, WebP parsing, dependency security, streaming accounting, hidden-tool prompts, and codemode resource usage.

**Best fit:** Developers who want a small, hackable agent runtime with extensive provider and extension control.

**Current tradeoff:** Strong flexibility and customization, but Windows maturity, extension API compatibility, and provider-specific correctness require careful validation.

### Qwen Code

**Focus:** Managed Agent infrastructure, durable distributed sessions, hosted workspaces, and Qwen-native agent architecture.

**Technical approach:** The most backend-oriented roadmap. It separates inference from tool-environment provisioning and is building authenticated brokers, writer ownership, recoverable execution, projections, retries, and side-query token controls.

**Best fit:** Platform engineers building hosted, multi-agent, or long-running agent services.

**Current tradeoff:** Ambitious distributed infrastructure, but session, credential, retention, and idempotency semantics are still under active refinement.

## 5. Community Momentum & Maturity

### Strongest visible release momentum

1. **OpenAI Codex** — Seven alpha releases and ten implementation PRs in one day indicate the fastest iteration cycle.
2. **Gemini CLI** — Ten PRs and a release centered on session durability, context efficiency, timeouts, and protocol correctness.
3. **Qwen Code** — Ten PRs concentrated on a coherent Managed Agent architecture, suggesting high development intensity.
4. **GitHub Copilot CLI** — Three patches in 24 hours demonstrate an active stabilization cycle rather than a feature push.
5. **Pi** — Ten PRs across security, providers, accounting, rendering, and native build infrastructure, despite no release.
6. **OpenCode** — Ten PRs and substantial issue activity, primarily to repair and improve the 2.0 transition.
7. **Claude Code** — A focused stable release with less PR activity in the digest, but significant operational concerns and 46 comments on the leading MCP cleanup issue.

### Community engagement signals

- **OpenCode** has the strongest single-issue reaction: 70 👍 on honoring `disable-model-invocation` in skills, indicating substantial demand for Claude-compatible extensibility semantics.
- **Codex** has broad high-reaction workflow concerns: 57 👍 for restoring branch selection and 26 👍 for fork-PR review support.
- **Claude Code’s** leading issues attracted 24–46 comments, especially around MCP cleanup, authentication, and context degradation.
- **Copilot CLI** reported 33 recently updated issues, indicating a sizable active backlog even though only one PR was included in the digest.
- **Pi’s** Windows discussion reached 72 comments, showing unusually strong interest in platform usability.
- **Qwen Code’s** Managed Agent architecture issue reached 41 comments, signaling strong architectural participation.

### Maturity assessment

- **Most production-integrated:** Claude Code and GitHub Copilot CLI, due to mature user bases and established product surfaces, though each has meaningful reliability gaps.
- **Most rapidly evolving:** Codex, Gemini CLI, and Qwen Code.
- **Most provider-flexible and customization-oriented:** OpenCode and Pi.
- **Most focused on infrastructure-level multi-agent maturity:** Qwen Code.
- **Most exposed to transition risk:** OpenCode 2.0, Codex’s alpha Rust line, and Pi’s impending 1.0 packaging changes.

These are directional assessments from one-day digest samples; issue counts and reactions are not directly comparable measures of overall project size or user-base maturity.

## 6. Trend Signals

### 1. The CLI is becoming an agent runtime, not merely a terminal interface

Session ownership, recoverable tool calls, writer fencing, subagents, background steering, broker authentication, projections, and cloud/local routing now dominate roadmaps. Tool selection should account for the durability model—not just model quality or coding benchmarks.

### 2. Observability is replacing implicit progress as the default

Queue acknowledgments, compaction notices, task termination reasons, context breakdowns, late-result accounting, and explicit terminal states are becoming purchasing criteria. An agent that works but cannot prove what it did is less suitable for unattended use.

### 3. MCP reliability is the shared integration bottleneck

Every mature integration faces some combination of stale credentials, expired sessions, configuration discovery, OAuth callback incompatibility, process leaks, or incorrect startup ordering. Vendors that implement a consistent MCP supervisor—authentication, health checks, reconnect policy, diagnostics, and guaranteed cleanup—will differentiate materially.

### 4. Provider neutrality is valuable but operationally difficult

OpenCode, Pi, and parts of Copilot/Codex support custom or routed models. However, tool-schema compatibility, token accounting, quota isolation, entitlement discovery, context windows, and fallback behavior remain inconsistent. BYOK should be evaluated with a test matrix, not treated as plug-and-play model substitution.

### 5. Long-context models are exposing fixed-context economics

Large model context windows do not eliminate context pressure. Tool schemas, system prompts, skills, repository files, side queries, and multimodal assets can consume substantial capacity. `/context`-style accounting, lazy tool discovery, scoped skills, and per-path token budgets are becoming standard agent features.

### 6. Background autonomy needs stronger safety boundaries

The community is moving toward explicit queue/steer modes, bounded retries, workspace confinement, persistent permissions, and parent-agent question routing. For production adoption, unattended execution should be paired with retention limits, cancellation, idempotency, and auditable terminal states.

### 7. Platform parity remains a competitive differentiator

Windows failures appear across Claude Code, Codex, Copilot CLI, and Pi. Native terminal handling, process cleanup, filesystem semantics, browser authorization, and sandboxing need to be first-class release criteria rather than peripheral compatibility work.

### Practical reference for developers

When selecting or building an AI CLI in late 2026, prioritize:

1. **Session durability and recovery**
2. **Explicit task and queue state**
3. **Context-window and compaction transparency**
4. **MCP lifecycle and diagnostics**
5. **Structured, scriptable output**
6. **Permission durability and workspace confinement**
7. **Cross-platform testing, especially Windows**
8. **Provider and tool-schema compatibility**
9. **Bounded storage, retries, and background retention**
10. **Observable subagent trajectories and failure reasons**

The ecosystem is converging on similar architecture, but the strongest differentiators are now implementation quality—state correctness, failure recovery, policy enforcement, and clarity—not access to a general-purpose coding model.

---

## Per-Tool Reports

<details>
<summary><strong>Claude Code</strong> — <a href="https://github.com/anthropics/claude-code">anthropics/claude-code</a></summary>

## Claude Code Skills Highlights

> Source: [anthropics/skills](https://github.com/anthropics/skills)

# Claude Code Skills Community Highlights  
*As of 2026-10-03. PR comment counts are not available in the supplied dataset, so the ranking below is a qualitative proxy for community attention, recency, scope, and issue/PR linkage—not a strict comment-count ranking. All listed PRs are open.*

## 1. Top Skills Ranking

1. **[#1298 — skill-creator trigger-evaluation fixes](https://github.com/anthropics/skills/pull/1298)**  
   Improves evaluation reliability by isolating worker processes, handling Windows subprocess behavior, and preventing unrelated tool failures from being misclassified as negative examples.  
   - **Discussion highlight:** Addresses a fundamental quality-assurance problem: invalid or misleading trigger scores can lead contributors to optimize Skills incorrectly.  
   - **Status:** **Open**

2. **[#1742 — mcp-builder support for MCP 2.x](https://github.com/anthropics/skills/pull/1742)**  
   Updates streamable HTTP client imports and custom-header configuration for newer `mcp>=2.0.0` releases.  
   - **Discussion highlight:** Follows reported issue [#1668](https://github.com/anthropics/skills/issues/1668) and reflects the operational reality that Skills must keep pace with rapidly changing MCP APIs.  
   - **Status:** **Open**

3. **[#1771 — proofcore-contract-auditor](https://github.com/anthropics/skills/pull/1771)**  
   Adds static analysis for Solidity and Rust smart contracts, with cryptographic audit-proof notarization on TON through ProofCore’s zero-storage Merkle protocol.  
   - **Discussion highlight:** Combines security analysis, blockchain provenance, and Web3 domain specialization—an emerging high-interest niche.  
   - **Status:** **Open**

4. **[#1703 — md2video-audio](https://github.com/anthropics/skills/pull/1703)**  
   Converts Markdown documents into narrated MP4 videos using a slide-generation workflow and realistic synthetic voiceovers.  
   - **Discussion highlight:** Extends Claude Code beyond document generation into automated multimedia production, potentially supporting training, documentation, and marketing workflows.  
   - **Status:** **Open**

5. **[#1245 — notion-spec-to-implementation and quantitative-resume-auditor](https://github.com/anthropics/skills/pull/1245)**  
   Adds two Skills: one translates product and technical specifications into structured Notion implementation plans, and the other provides quantitative resume review.  
   - **Discussion highlight:** Shows strong interest in workflow automation and structured “spec-to-execution” pipelines, while also broadening the ecosystem into career applications.  
   - **Status:** **Open**

6. **[#525 — pyxel retro-game development](https://github.com/anthropics/skills/pull/525)**  
   Provides guidance for building, debugging, and verifying Python games with Pyxel, including headless execution, input-driven testing, and frame inspection.  
   - **Discussion highlight:** Focuses on evidence-based game validation rather than merely generating game code, reflecting demand for autonomous testing and inspection workflows.  
   - **Status:** **Open**

7. **[#1615 — scnet-hpc](https://github.com/anthropics/skills/pull/1615)**  
   Enables operation of SCNet HPC clusters through profile-aware SSH and Slurm workflows, including job generation, resource discovery, modules, and accelerators.  
   - **Discussion highlight:** Targets a specialized enterprise/scientific environment and translates domain-specific operational knowledge into repeatable Claude workflows.  
   - **Status:** **Open**

8. **[#822 — AI Watch Tester (AWT)](https://github.com/anthropics/skills/pull/822)**  
   Adds vision- and browser-controlled end-to-end testing, allowing Claude to generate and execute tests with minimal manual setup.  
   - **Discussion highlight:** Directly addresses the broader community demand for automated QA, browser automation, and test generation.  
   - **Status:** **Open**

## 2. Community Demand Trends

- **Skill and agent quality assurance**  
  Issues consistently emphasize evaluation, benchmarking, security analysis, and operational verification. The demand is not merely for more Skills, but for reliable ways to test whether Skills trigger correctly and produce valid results. See issues [#556](https://github.com/anthropics/skills/issues/556), [#1383](https://github.com/anthropics/skills/issues/1383), and [#1390](https://github.com/anthropics/skills/issues/1390).

- **Security, trust, and governance**  
  Community members are asking for stronger namespace controls, provenance, audit trails, policy enforcement, and threat detection. The central concern is that users may mistake community content for official Anthropic functionality. See issues [#492](https://github.com/anthropics/skills/issues/492) and [#412](https://github.com/anthropics/skills/issues/412).

- **Organization-scale sharing and management**  
  There is clear demand for centralized libraries, internal sharing, permissions, and governance beyond manually exchanging `.skill` files. See issue [#228](https://github.com/anthropics/skills/issues/228).

- **Memory and persistent agent context**  
  Proposals address long-running agents, context-window management, and compact symbolic representations of memory. See issue [#1329](https://github.com/anthropics/skills/issues/1329).

- **Testing and verification**  
  End-to-end browser testing, unit/component testing, adversarial review, and delivery verification are recurring themes. Issues [#1385](https://github.com/anthropics/skills/issues/1385) and [#822’s related proposal](https://github.com/anthropics/skills/pull/822) illustrate this trend.

- **Document production and quality**  
  Community submissions focus on typography, DOCX/ODT processing, Markdown-to-video workflows, and more polished generated documents. Relevant proposals include [#514](https://github.com/anthropics/skills/pull/514), [#486](https://github.com/anthropics/skills/pull/486), and [#1703](https://github.com/anthropics/skills/pull/1703).

## 3. High-Potential Pending Skills

- **[#1298 — skill-creator fixes](https://github.com/anthropics/skills/pull/1298):** High leverage because it improves the tooling used to build and evaluate other Skills.  
- **[#1742 — mcp-builder MCP 2.x compatibility](https://github.com/anthropics/skills/pull/1742):** Important for maintaining compatibility as the MCP ecosystem evolves.  
- **[#1703 — md2video-audio](https://github.com/anthropics/skills/pull/1703):** A differentiated content-production workflow with broad potential for education and business use.  
- **[#1245 — Notion implementation planning](https://github.com/anthropics/skills/pull/1245):** Connects requirements management with concrete software-delivery work.  
- **[#525 — Pyxel](https://github.com/anthropics/skills/pull/525):** Combines domain guidance with automated execution and verification.  
- **[#1615 — SCNet HPC](https://github.com/anthropics/skills/pull/1615):** High-value for research and enterprise users operating specialized infrastructure.  
- **[#822 — AWT](https://github.com/anthropics/skills/pull/822):** Directly targets a major pain point: autonomous application testing.  
- **[#1771 — ProofCore contract auditor](https://github.com/anthropics/skills/pull/1771):** A high-value specialized entry for Web3 security and auditable smart-contract analysis.

## 4. Skills Ecosystem Insight

The community’s most concentrated demand is for **reliable, secure, and verifiable workflow automation—especially Skills that can operate external systems, test their own outputs, and integrate into organizational development and governance processes**.

---

# Claude Code Community Digest — 2026-10-03

## 1. Today’s Highlights

Claude Code released **v2.1.288**, adding a new mod API for retrieving fullscreen selections and a built-in `gh api` command for cloud-session images without GitHub CLI. Community attention focused on **context compaction behavior, orphaned background processes, session-management gaps, and cloud messaging**, while Windows users reported several desktop reliability and filesystem-integration concerns.

## 2. Releases

### [v2.1.288](https://github.com/anthropics/claude-code/releases/tag/v2.1.288)

- Added `$.ui.selection()` for mods.
  - Returns the text most recently selected in fullscreen mode.
  - If the selection is within a transcript row, also provides that row.
- Added a built-in `gh api` command to cloud sessions whose image does not include the GitHub CLI.
- Fixed the built-in sending control character.

**Why it matters:** Mod authors can build richer editor-like interactions around transcript selections, and cloud sessions can interact with GitHub APIs without relying on a preinstalled CLI binary.

## 3. Hot Issues

### 1. [MCP servers are not properly terminated on exit, leaving orphaned processes](https://github.com/anthropics/claude-code/issues/1935)

**Category:** MCP / process cleanup  
**Community reaction:** 46 comments, 19 👍

This long-running macOS bug reports that MCP server processes can survive Claude Code termination. It is particularly important for developers running multiple agents or servers, where orphaned processes may retain resources, ports, or credentials.

### 2. [Fable 5 safeguard false-positives on the greeting “Hi”](https://github.com/anthropics/claude-code/issues/87640)

**Category:** Model safeguards  
**Community reaction:** 29 comments, 21 👍

Users report that a one-word greeting can trigger a `[reasoning_extraction]` safeguard error. The issue highlights the usability risk of broad classifier rules, especially when legitimate short prompts are incorrectly treated as attempts to extract hidden reasoning.

### 3. [Silent context degradation in 1M-context sessions](https://github.com/anthropics/claude-code/issues/42542)

**Category:** Context management  
**Community reaction:** 29 comments, 11 👍

This report describes several mechanisms—including microcompaction, cached microcompaction, and session-memory compaction—that can clear tool results without sufficient notification. For long-running coding sessions, hidden loss of context can cause incorrect assumptions, repeated work, or subtle regressions.

### 4. [Verification emails are suppressed, with no support-bot escalation path](https://github.com/anthropics/claude-code/issues/79808)

**Category:** Authentication  
**Community reaction:** 24 comments, 7 👍

Users affected by missing verification emails report being unable to log in and unable to escalate beyond an automated support flow. This is a high-impact account-access problem despite being primarily operational rather than code-focused.

### 5. [Session archiving is effectively one-way](https://github.com/anthropics/claude-code/issues/67835)

**Category:** Session management / Desktop  
**Community reaction:** 11 comments, 7 👍

The Desktop app exposes session archiving but reportedly lacks a corresponding unarchive view or `unarchive_session` tool. Users are concerned that archived sessions become effectively orphaned, which is particularly problematic for automated workflows and session-management agents.

### 6. [Model picker skips `opusplan` without showing an Opus Plan Mode row](https://github.com/anthropics/claude-code/issues/89690)

**Category:** Model picker  
**Community reaction:** 10 comments

A model configuration containing an `opusplan` row can be treated as already covered by the built-in model lineup, even though that lineup does not display the corresponding row in ordinary sessions. The result is a model or mode that is configured but inaccessible through `/model`.

### 7. [Cloud `SendMessage` reports one-way behavior despite remote reply support](https://github.com/anthropics/claude-code/issues/98897)

**Category:** Cloud sessions / Messaging  
**Community reaction:** 9 comments

When a local Desktop session sends a message to a cloud session, the tool reportedly tells the model that the route is one-way. However, the cloud session may still be able to reply through remote messaging, creating an inconsistency between the tool’s guidance and actual behavior.

### 8. [VS Code session list supports archive/unarchive but not deletion](https://github.com/anthropics/claude-code/issues/93835)

**Category:** VS Code / Session management  
**Community reaction:** 7 comments, 14 👍

The VS Code extension offers no visible way to permanently delete a session. Users generally want a clear distinction between temporary archival and destructive deletion, especially for managing sensitive or unnecessary conversation history.

### 9. [Idle compaction in v2.1.286 discards working context without an opt-out](https://github.com/anthropics/claude-code/issues/98747)

**Category:** Context management / Regression  
**Community reaction:** 4 comments, 3 👍

A new report says that idle sessions are automatically compacted before prompt-cache expiry, with the action logged as “manual.” Long-running sessions may lose important grounding, and users are requesting a warning or configuration control before this behavior occurs.

### 10. [Windows desktop child processes terminate simultaneously and the UI hangs](https://github.com/anthropics/claude-code/issues/99056)

**Category:** Windows Desktop / Reliability  
**Community reaction:** Newly filed, no reactions yet

This report describes repeated termination of all child processes with exit code 1 and a hanging interface. The issue has persisted across reinstall attempts, making it a potentially significant blocker for Windows-based development workflows.

## 4. Key PR Progress

Only two pull requests were updated in the reporting window, so there are not 10 PRs to highlight.

### [PR #97293 — Mod API declarations for process and filesystem metadata](https://github.com/anthropics/claude-code/pull/97293)

**Status:** Open

This PR prepares TypeScript declarations for fields that will become available when the released npm CLI supports them:

- `isStdoutTruncated`
- `isStderrTruncated` on `$.process.run` results
- `mtimeMs` on `$.fs.list` entries

The PR is intentionally gated so the declarations do not promise fields that the currently installed CLI does not yet return. It indicates ongoing work to expose richer process diagnostics and filesystem metadata to mods.

### [PR #16632 — Replace ralph-loop initialization shell block with a functional Bash tool call](https://github.com/anthropics/claude-code/pull/16632)

**Status:** Closed

This PR addresses a shell-approval problem caused by ralph-loop initialization being represented as a Markdown-formatted code block. Converting it to a functional Bash tool call is intended to ensure the command is recognized and handled by the engine’s safety and approval system rather than treated as display-only or legacy content.

## 5. Feature Request Trends

### Session lifecycle and portability

Several requests converge on better session management:

- Unarchiving sessions programmatically and from Desktop
- Permanent session deletion in VS Code
- More reliable preservation and visibility of long-running sessions
- Improved behavior for sessions moving between personal and organizational accounts

### Cross-session and cloud coordination

Community interest is shifting toward richer agent orchestration:

- Cloud-to-cloud `SendMessage`
- More reliable replies from cloud sessions
- Configurable cross-session send limits
- Coordination between Claude Code and the Claude Design agent

### Context and model-control transparency

The most technically significant recurring request is better control over context management:

- Visible warnings before microcompaction or idle compaction
- Opt-outs or configuration controls for automatic context reduction
- Clearer logs describing what context was discarded
- More predictable model-picker behavior for specialized modes such as `opusplan`

### Platform and integration reliability

Windows-specific issues span desktop process management, registry virtualization, background cleanup, and UI behavior. This suggests that platform parity remains a major area of concern, particularly for users running Claude Code through the Desktop or VS Code surfaces.

### Git and commit metadata

The [`Assisted-by` commit trailer proposal](https://github.com/anthropics/claude-code/issues/36105) reflects demand for clearer attribution conventions in AI-assisted development, with 43 👍 showing strong community interest.

## 6. Developer Pain Points

1. **Context can disappear without adequate visibility.**  
   Users need to know when compaction occurs, what was removed, and whether active working state remains intact.

2. **Background processes are not reliably cleaned up.**  
   MCP servers and Windows/Git Bash subprocesses can remain orphaned, complicating local development and automation.

3. **Cloud and local behavior are not fully consistent.**  
   Messaging, GitHub tooling, session routing, and model selection can differ between CLI, Desktop, VS Code, Remote Control, and cloud sessions.

4. **Session management lacks a complete lifecycle.**  
   Archive, restore, delete, visibility, and organization capabilities are uneven across clients.

5. **Safety classifiers create false positives.**  
   Both model safeguards and permission classifiers can block benign actions such as greetings, local application testing, or `git push`.

6. **Windows support still has reliability gaps.**  
   Process termination, registry writes, orphaned `find.exe` processes, and Desktop hangs are recurring themes.

7. **The ecosystem needs clearer integration contracts.**  
   Mods and third-party providers depend on stable APIs and metadata, making gated PRs such as the process/filesystem declaration work important for extension authors.

</details>

<details>
<summary><strong>OpenAI Codex</strong> — <a href="https://github.com/openai/codex">openai/codex</a></summary>

# OpenAI Codex Community Digest — 2026-10-03

## 1. Today's Highlights

OpenAI published seven consecutive Rust alpha builds for `0.162.0`, indicating active iteration ahead of the next Codex CLI release; the supplied release metadata does not include individual change summaries. Community activity centered on reliability issues in Windows desktop, VS Code, browser automation, queued messaging, and session persistence, while several closed pull requests improved retry behavior, MCP lifecycle handling, TUI controls, and terminal compatibility.

## 2. Releases

- [`rust-v0.162.0-alpha.1` through `rust-v0.162.0-alpha.7`](https://github.com/openai/codex/releases) — Seven alpha releases were published or updated within the last 24 hours. No detailed changelog was provided in the dataset, so the safest conclusion is that the Rust-based Codex client is undergoing a rapid pre-release cycle. Teams evaluating upgrades should treat these as alpha builds and review the individual release artifacts and commit history before deploying.

## 3. Hot Issues

1. **[#47345 — Linux sandbox fails after ChatGPT update](https://github.com/openai/codex/issues/47345)**  
   A Linux sandbox failure involving a non-absolute `mountinfo` path affected Ubuntu users after an application update. The issue was closed after substantial discussion—49 comments and 37 reactions—making it one of the strongest signals in the daily issue set. It highlights the importance of sandbox-path validation and post-update regression testing.

2. **[#49532 — Restore branch selection in the Codex app](https://github.com/openai/codex/issues/49532)**  
   Users are requesting the return of branch selection when starting work in the Codex app. The issue accumulated 26 comments and 57 👍 reactions, suggesting strong community demand and a meaningful workflow regression for users who need explicit control over the active Git branch.

3. **[#49488 — Windows Work computer tasks lack browser and desktop tools](https://github.com/openai/codex/issues/49488)**  
   This report describes durable MCP startup failures and a follow-up path error preventing computer tasks from accessing browser and desktop capabilities. It matters because it affects the core agent-to-tool execution path rather than a peripheral feature. Seventeen comments and six reactions indicate growing interest in Windows computer-use reliability.

4. **[#49396 — Unsupported `gpt-6.1-sol` error lacks eligibility details](https://github.com/openai/codex/issues/49396)**  
   ChatGPT-authenticated CLI users receive an “unsupported” message for `gpt-6.1-sol` without an explanation of account eligibility or entitlement. The issue exposes an important product gap: model availability errors should distinguish between an invalid model, a missing plan entitlement, rollout status, and stale client catalogs.

5. **[#48670 — Windows built-in browser permissions cannot be verified](https://github.com/openai/codex/issues/48670)**  
   The browser may visibly open pages while Browser Use subsequently fails because saved permissions or the security check cannot be verified. This creates a confusing state in which the UI appears healthy but the agent cannot interact with the page. Nine comments and one reaction reflect concern about browser automation reliability and error clarity.

6. **[#47577 — `@codex review` silently ignores fork pull requests](https://github.com/openai/codex/issues/47577)**  
   GitHub code review is reported to work for same-repository branches but not for PRs from forks. Eight comments and 26 👍 reactions make this a notable functional regression, especially for open-source workflows where external contributions are common. Silent failure is particularly problematic because users may assume a review is still pending.

7. **[#30820 — Windows app eagerly runs review-summary Git snapshots](https://github.com/openai/codex/issues/30820)**  
   Restoring a workspace can trigger Git snapshot work immediately, causing CPU, I/O, and memory spikes. The issue has remained active since July and represents a recurring desktop-performance concern. It suggests that background review generation needs stronger laziness, throttling, and cancellation controls.

8. **[#50071 — Linux app crashes or becomes unresponsive with `ResizeObserver` errors](https://github.com/openai/codex/issues/50071)**  
   Users report repeated crashes and severe unresponsiveness accompanied by thousands of `ResizeObserver` errors. Although newer than many entries, it is operationally serious because it affects a current app build and can make the interface unusable even with a single task. The issue has four comments, indicating emerging but notable momentum.

9. **[#49573 — Sites publishing fails through browser-proxy port 8889](https://github.com/openai/codex/issues/49573)**  
   Publishing an update to an existing Site fails during Git synchronization because the workflow cannot connect to the browser proxy. A related report is also present in the issue set. This points to a shared connectivity or orchestration weakness affecting both Sites publishing and source access.

10. **[#49081 — Queued CLI messages are not sent](https://github.com/openai/codex/issues/49081)**  
    Users report that messages queued in the CLI remain unsent. The issue is especially relevant for agentic workflows, where users may assume a prompt has been accepted while it is actually stranded. It connects to the same broader queue-management theme seen in the VS Code and Windows app reports.

## 4. Key PR Progress

1. **[#50418 — Honor `Retry-After` headers in failed Responses events](https://github.com/openai/codex/pull/50418)**  
   Streamed `response.failed` events can include server-provided retry timing in `response.error.headers`. The change parses nested `Retry-After` values and avoids using conflicting local delays, improving backoff correctness for rate limits and transient API failures.

2. **[#50416 — Clarify Git worktree choices](https://github.com/openai/codex/pull/50416)**  
   The `/new` and `/fork` picker now distinguishes between using the current Git worktree and creating a new worktree, with an explanation that the latter creates a separate checkout. This should reduce accidental isolation and improve onboarding for Git-based tasks.

3. **[#50406 — Restore `0.159.3` fixes in the `0.159` alpha lineage](https://github.com/openai/codex/pull/50406)**  
   This PR backports fixes and model-catalog updates from `0.159.3` while retaining the PowerShell compatibility fix from the alpha hotfix branch. It is a practical stabilization measure for clients constrained to the older release line.

4. **[#50402 — Consolidate command output into `aggregated_output`](https://github.com/openai/codex/pull/50402)**  
   Command execution events are being simplified by removing separate `stdout`, `stderr`, and `formatted_output` fields in favor of `aggregated_output`. The refactor reduces event-shape complexity for consumers, though it may require corresponding tooling updates.

5. **[#31471 — Extract Apps cache logic into `ConnectorRuntimeManager`](https://github.com/openai/codex/pull/31471)**  
   The PR introduces runtime-scoped connector and tools caching, including account, user, workspace mode, and Codex home context. Stale contexts are discarded as inputs change, which should improve correctness for multi-account and workspace-aware integrations.

6. **[#50380 — Fix thread unloading after MCP startup disconnect](https://github.com/openai/codex/pull/50380)**  
   Threads can remain loaded when MCP startup outlives the requesting connection and no listener is started. The fix ensures the thread listener still starts after the connection has been cleaned up, addressing a resource and lifecycle leak.

7. **[#50396 — Honor pager bindings for transcript page keys](https://github.com/openai/codex/pull/50396)**  
   `PageUp` and `PageDown` now respect custom pager bindings instead of always forcing full-page movement. This improves consistency for users whose terminal and transcript navigation are configured through custom keybindings.

8. **[#50389 — Honor configured keybindings before transcript navigation](https://github.com/openai/codex/pull/50389)**  
   Explicitly configured composer shortcuts now take precedence over transcript navigation, preventing bindings such as `Ctrl+Space` from being consumed by the transcript. This directly addresses a common TUI input conflict between editing, steering, and navigation.

9. **[#50375 — Use printable ASCII terminal titles under GNU Screen](https://github.com/openai/codex/pull/50375)**  
   GNU Screen can mishandle Unicode OSC terminal titles by truncating them at a byte boundary and emitting control characters. The patch converts titles to printable ASCII when Screen is detected, preventing terminal display corruption.

10. **[#50359 — Render ANSI styles in TUI hook system messages](https://github.com/openai/codex/pull/50359)**  
    Hook system messages are now parsed into styled spans so colors and text formatting render correctly across lines. The result is more readable hook output and better parity with the visual expectations of terminal automation tools.

## 5. Hot Discussions

### Ideas

- **[#49977 — Dynamic model and reasoning orchestration in Codex/Work](https://github.com/openai/codex/discussions/49977)**  
  The proposal advocates replacing static model and reasoning selection with runtime orchestration that can adapt as task complexity changes. This would align model choice, effort, and cost with the evolving demands of long-running jobs.

- **[#41833 — Stop cutting controls on v2 subagents](https://github.com/openai/codex/discussions/41833)**  
  Users object to restrictions imposed on low-level app-server paths that limit the controls available to v2 subagents. The discussion reflects demand for greater composability and for capability restrictions to be represented as UX guidance rather than silently enforced protocol limitations.

### Q&A

- **[#9277 — Codex review asks users to connect GitHub](https://github.com/openai/codex/discussions/9277)**  
  Users are troubleshooting `@codex review` prompts that require a connected Codex account or GitHub integration. The issue is especially relevant to fork-based workflows, where authentication and repository authorization can prevent reviews from starting.

- **[#50235 — Dot chat stays loading after showing read receipts](https://github.com/openai/codex/discussions/50235)**  
  A Dot conversation displays delivery and read status but never produces a reply. The report suggests that message transport and response generation may have diverged, even though the cloud computer remains accessible.

### Show and tell

- **[#50222 — QuotaCrew for Codex](https://github.com/openai/codex/discussions/50222)**  
  QuotaCrew is a Windows account manager intended to track usage limits, switch accounts, and continue interrupted conversations. It illustrates growing demand for operational tooling around quota management and cross-session continuity.

## 6. Feature Request Trends

- **More explicit Git workflow control:** Restore branch selection, clarify worktree behavior, and improve transparency around the active checkout.
- **Reliable browser and computer use:** Windows browser permissions, MCP startup, browser-proxy connectivity, and desktop-tool availability need stronger diagnostics and more dependable lifecycle management.
- **Better queue and message semantics:** Users want queued prompts in CLI, VS Code, and desktop to be visibly acknowledged, cancellable, recoverable, and guaranteed to send.
- **Model and entitlement clarity:** Codex should explain model availability, rollout eligibility, subscription access, stale catalogs, and version requirements instead of returning generic unsupported-model errors.
- **TUI composability and terminal compatibility:** Configurable shortcuts, pager bindings, mouse-capture opt-in, ANSI rendering, GNU Screen compatibility, and terminal-safe title handling are recurring priorities.
- **Automation and lifecycle APIs:** The community wants scriptable Cloud environment discovery, task dispatch, monitoring, cancellation, and PR/result handoff.
- **Background-work performance:** Desktop apps should avoid eager Git snapshots, excessive resize loops, zombie subprocesses, and expensive review-summary work when the workspace is merely restored.
- **Long-running agent continuity:** Compaction recovery, async-question lifecycle management, remote task visibility, and account/session continuation remain important for autonomous workflows.

## 7. Developer Pain Points

The dominant frustration is **state uncertainty**. Users report prompts that appear queued but do not send, reviews that silently skip fork PRs, tasks that remain loading after read receipts, and subagents whose controls are unexpectedly restricted. These are difficult to debug because the UI may indicate progress without confirming that execution actually occurred.

A second major theme is **cross-platform fragmentation**, especially on Windows. Issues span VS Code queue-lock errors, stale app-server runtimes, browser-proxy failures, desktop renderer reloads, state corruption, resource spikes, and computer-use authorization. Windows users appear to face the largest combined surface area of reliability problems.

Developers also report **fragile automation boundaries**: MCP startup can outlive its connection, remote control reconnects can loop, sandbox behavior can change after updates, and Sites publishing can fail during Git synchronization. The recurring need is better lifecycle management, explicit status reporting, and actionable errors.

Finally, model and terminal workflows need greater predictability. Model access errors are not sufficiently explained, terminal shortcuts can be intercepted unexpectedly, mouse capture has become controversial, and several terminal environments expose formatting or title-compatibility issues. Overall, the community is asking for Codex to be more composable, observable, and conservative when changing defaults.

</details>

<details>
<summary><strong>Gemini CLI</strong> — <a href="https://github.com/google-gemini/gemini-cli">google-gemini/gemini-cli</a></summary>

# Gemini CLI Community Digest — 2026-10-03

## Today's Highlights

The latest nightly release focuses on session durability and reliability, including append-only chat-recording updates, bounded history, atomic state persistence, and recovery from corrupted state. The broader development trend remains centered on agent reliability: subagent termination reporting, browser-agent stability, non-interactive skill activation, context management, and preventing tool/API-induced hangs are receiving significant attention.

## Releases

### [v0.64.0-nightly.20261002.gc9096a847](https://github.com/google-gemini/gemini-cli/releases/tag/v0.64.0-nightly.20261002.gc9096a847)

- **Chat recording improvements:** `ChatRecordingService` now uses append-only delta patching and a bounded history window.
- **State persistence:** CLI state is persisted atomically and can recover from a backup when corruption is detected.
- **Primary impact:** These changes aim to reduce session-history loss and improve recovery after interrupted or corrupted writes.

## Hot Issues

1. **[#22323 — Subagents can report success after hitting MAX_TURNS](https://github.com/google-gemini/gemini-cli/issues/22323)**  
   A `codebase_investigator` subagent can return `status: "success"` and termination reason `"GOAL"` even when it reached its turn limit before completing analysis. The issue has **13 comments** and **2 likes**, making it one of the most discussed reliability problems. Incorrect termination semantics can mislead both users and evaluation pipelines.

2. **[#21409 — Generalist agent hangs indefinitely](https://github.com/google-gemini/gemini-cli/issues/21409)**  
   Users report that deferring to the generalist agent can hang even for simple operations such as creating a folder, sometimes for an hour or more. With **8 likes** and **8 comments**, this is a high-impact workflow failure. Avoiding subagent delegation appears to work around the issue.

3. **[#21983 — Browser subagent fails under Wayland](https://github.com/google-gemini/gemini-cli/issues/21983)**  
   The browser subagent reports a failure in Wayland environments. Although the issue has only **4 comments**, browser automation is a key agent capability and Wayland is increasingly common on Linux desktops.

4. **[#22267 — Browser Agent ignores `settings.json` overrides](https://github.com/google-gemini/gemini-cli/issues/22267)**  
   Browser Agent appears to ignore global and project-level settings such as `maxTurns`, despite loading them during initialization. This creates a mismatch between configured behavior and actual execution, making agent limits difficult to enforce.

5. **[#24246 — Gemini CLI receives 400 errors with a large number of tools](https://github.com/google-gemini/gemini-cli/issues/24246)**  
   Users report 400 errors when very large tool sets are enabled, with the issue title referring to more than 128 tools while the description mentions more than 400 available tools. The request is for better automatic scoping or tool prioritization, reflecting a growing concern around tool-count and context limits.

6. **[#22672 — Agents may use destructive Git operations](https://github.com/google-gemini/gemini-cli/issues/22672)**  
   The discussion highlights potentially unsafe commands such as `git reset` or force operations when safer alternatives exist, as well as destructive changes to databases and other resources. The report has **3 comments** and **1 like**, and points toward stronger guardrails and safer default agent behavior.

7. **[#21763 — `/bug` reports omit subagent context](https://github.com/google-gemini/gemini-cli/issues/21763)**  
   Bug reports generated with `/bug` currently focus on the main session and may not include the state or trajectory of the subagent that failed. This limits diagnosis of agent failures and has **2 comments** from the community.

8. **[#23571 — Models create temporary scripts in random locations](https://github.com/google-gemini/gemini-cli/issues/23571)**  
   When shell execution is restricted, the model may compensate by generating multiple edit scripts throughout the repository. This increases cleanup overhead and makes it harder to maintain a clean working tree. The issue has **3 comments**.

9. **[#21968 — Gemini does not automatically use skills and subagents](https://github.com/google-gemini/gemini-cli/issues/21968)**  
   The report says Gemini often fails to activate relevant custom skills or delegate to subagents unless explicitly instructed. With **7 comments**, it reflects a broader usability gap: agents may be capable of specialized workflows but do not reliably select them.

10. **[#20079 — Symlinked agent definitions are not recognized](https://github.com/google-gemini/gemini-cli/issues/20079)**  
    Agent files in `~/.gemini/agents/` are not recognized when the `.md` file is a symlink. Symlink support is important for reusable configurations, monorepos, and team-managed agent definitions.

## Key PR Progress

1. **[#29616 — Align OAuth callback issuer validation with RFC 9207](https://github.com/google-gemini/gemini-cli/pull/29616)**  
   Updates OAuth callback `iss` validation to follow RFC 9207 and MCP authorization requirements. This is a high-priority security and standards-compliance change.

2. **[#29617 — Avoid eager recursive expansion of `@directory` references](https://github.com/google-gemini/gemini-cli/pull/29617)**  
   Directory references will resolve to their workspace path without immediately expanding all descendants. This should reduce unnecessary context consumption and improve responsiveness for large repositories.

3. **[#29582 — Optimize ignore filtering and prune ignored subtrees](https://github.com/google-gemini/gemini-cli/pull/29582)**  
   Adds directory-level memoization, wildcard directory expansion, and symlink/realpath caching. The goal is to remove multi-second blocking delays during file discovery in large repositories.

4. **[#29584 — Prevent resumed-session history deletion on quick exit](https://github.com/google-gemini/gemini-cli/pull/29584)**  
   Fixes a data-loss scenario in which quitting immediately after resuming a session, such as with `Ctrl+C` or `/exit`, could remove the resumed conversation history. This is a particularly important durability fix.

5. **[#29608 — Add 30-second timeouts to web tools](https://github.com/google-gemini/gemini-cli/pull/29608)**  
   `GoogleSearch` and `WebFetch` now time out underlying model requests after 30 seconds. This addresses cases where the agent loop remained in a permanent `Thinking...` state for 30 minutes or more.

6. **[#29457 — Replace fuzzy explicit-file matching with glob matching](https://github.com/google-gemini/gemini-cli/pull/29457)**  
   Corrects a context-bloat bug in `read-many-files`, where binary assets such as images, PDFs, and audio could be incorrectly treated as explicitly requested. The change reduces accidental inclusion of large files.

7. **[#29612 — Enforce a valid terminal user turn](https://github.com/google-gemini/gemini-cli/pull/29612)**  
   Normalizes request contents so histories sent to `generateContentStream` end with a valid, non-empty user turn. This is intended to prevent protocol failures after operations such as `/rewind` or stream abortion.

8. **[#29611 — Support multimodal function responses for dotted Gemini 3 models](https://github.com/google-gemini/gemini-cli/pull/29611)**  
   Fixes model-alias handling and multimodal response support for versions such as `gemini-3.8-flash`, preventing invalid sibling parts and associated HTTP 400 errors.

9. **[#29546 — Activate skills in non-interactive mode](https://github.com/google-gemini/gemini-cli/pull/29546)**  
   Registers `SkillCommandLoader` in the non-interactive slash-command path, allowing `/skill-name` commands to work outside the interactive UI. The PR also handles tool action results instead of treating them as fatal errors.

10. **[#29606 — Improve custom-header parsing](https://github.com/google-gemini/gemini-cli/pull/29606)**  
    Splits `GEMINI_CLI_CUSTOM_HEADERS` only before valid RFC 9110 tokens. This preserves commas in JSON metadata and other legitimate header values instead of misinterpreting them as new headers.

## Feature Request Trends

- **More reliable subagents:** The strongest recurring direction is improving subagent recovery, termination status, configuration handling, browser compatibility, and observability.
- **Better automatic tool and skill selection:** Users want Gemini to select relevant skills, subagents, and tools without requiring repeated manual instructions.
- **Context and token efficiency:** Requests include AST-aware search and file reading, surgical file extraction, automatic tool scoping, persistent task tracking, and avoiding eager directory expansion.
- **Safer execution environments:** Community proposals emphasize zero-dependency OS sandboxing, post-execution intent routing, and stronger protection against destructive Git or resource-management commands.
- **Improved agent observability:** Exposing subagent trajectories through `/chat share`, enriching `/bug` reports, and improving internal evaluation reliability are recurring priorities.
- **Persistent, workspace-aware state:** Interest extends to file-based task tracking, workspace-specific policies, shared memory, and parallel subagent collaboration.
- **More capable browser automation:** Browser Agent needs better settings compliance, Wayland support, session takeover, and lock recovery.
- **Non-interactive parity:** Skills, slash commands, and agent features should work consistently in CI and scripted workflows, not only in the interactive terminal.

## Developer Pain Points

- **Agent hangs and false completion states:** Web calls, subagents, and terminal operations may hang or report success despite reaching internal limits.
- **Configuration that is loaded but not honored:** Browser Agent and other components can ignore `settings.json` overrides such as `maxTurns`.
- **Context bloat:** Directory references, binary files, large tool sets, and broad file discovery can consume substantial context or trigger API errors.
- **Destructive or messy side effects:** Models may run unsafe Git commands or create temporary scripts in arbitrary repository locations.
- **Limited subagent observability:** Current debugging and sharing workflows do not consistently expose subagent context or trajectories.
- **Discovery and compatibility gaps:** Symlinked agent files, Wayland environments, custom headers, and multimodal Gemini model names expose interoperability issues.
- **Evaluation reliability:** Internal evaluations can be inconsistent or misleading, including the request to make a steering evaluation always pass and improve artifact validation.
- **Session durability:** Resuming a session and exiting quickly has recently been associated with permanent conversation-history loss, making atomic persistence and backup recovery especially important.

</details>

<details>
<summary><strong>GitHub Copilot CLI</strong> — <a href="https://github.com/github/copilot-cli">github/copilot-cli</a></summary>

# GitHub Copilot CLI Community Digest — 2026-10-03

## Today’s Highlights

Copilot CLI shipped three patch releases in the past 24 hours, focusing on Windows sandbox reliability, background-agent steering, MCP resilience, OAuth reauthentication, and session lifecycle behavior. Community attention remains concentrated on MCP configuration and authentication, agent/skills behavior, custom model compatibility, and session reliability; the backlog contains **33 recently updated issues**, including several newly filed regressions.

## Releases

### [v1.0.92-2](https://github.com/github/copilot-cli/releases/tag/v1.0.92-2)

- Sandboxed commands on Windows now create temporary files inside the granted temporary directory, allowing tools that rename temporary files into their final locations to work correctly.
- Prompt-mode sessions now emit one `sessionEnd` hook after Stop-hook continuations finish, fixing duplicate or premature lifecycle events.

### [v1.0.92-1](https://github.com/github/copilot-cli/releases/tag/v1.0.92-1)

- Remote MCP servers now reconnect after idle Streamable HTTP sessions expire.
- Messages sent to a running background agent steer its active turn at the next processing opportunity.
- Context rollovers retain recent user requests in the recovery context.
- Automatic sandbox CA setup output is now hidden.

### [v1.0.92-0](https://github.com/github/copilot-cli/releases/tag/v1.0.92-0)

- MCP tools remain available after OAuth reauthentication when their tool definitions have not changed.

**Community takeaway:** The release train is primarily a stability pass. MCP long-running connections, OAuth, background-agent coordination, and context preservation are the most immediate upgrades for developer-facing workflows.

## Hot Issues

1. **[Manual-only project skills are unreachable — #4438](https://github.com/github/copilot-cli/issues/4438)**  
   `disable-model-invocation: true` appears to make a skill entirely unavailable, despite the skill appearing in `copilot skill list`. Explicit user requests return `Skill not found` rather than invoking the skill manually. The issue has drawn **11 comments and 12 reactions**, making it the most active item in the update set and an important usability concern for controlled agent workflows.

2. **[Stale MCP writer binding breaks CLI after macOS reboot — #4998](https://github.com/github/copilot-cli/issues/4998)**  
   A persisted `.mcp-writer.binding` containing an outdated filesystem device ID reportedly prevents both new and resumed sessions from processing prompts after a macOS update or reboot. The report has **6 comments and 5 reactions** and highlights an important startup-recovery failure.

3. **[Azure MCP registry validation fails with BrokenPipe — #4851](https://github.com/github/copilot-cli/issues/4851)**  
   Copilot CLI’s Rust runtime fails while validating an Azure API Center MCP registry, despite a previously stable configuration. The report has **5 comments and 8 reactions**, suggesting concern about regressions in enterprise MCP environments.

4. **[Workspace `.mcp.json` was not loaded in v1.0.83 — #4832](https://github.com/github/copilot-cli/issues/4832)**  
   The workspace-level MCP configuration was ignored entirely, and `mcp list` showed no Workspace group. Although the issue is now **closed**, it remains noteworthy because workspace-scoped MCP configuration is central to reproducible project tooling. The discussion includes **4 comments**.

5. **[DeepSeek BYOK fails on custom tool definitions — #4840](https://github.com/github/copilot-cli/issues/4840)**  
   BYOK requests fail with a JSON deserialization error because the selected endpoint rejects the `custom` tool type. The issue remains open with **3 comments and 1 reaction**, pointing to a compatibility gap for non-GitHub model providers and custom tool schemas.

6. **[Mobile session state remains queued after remote response — #4569](https://github.com/github/copilot-cli/issues/4569)**  
   GitHub Mobile continues showing “Queued for Copilot” after a remotely controlled CLI session has already received a prompt and responded locally. With **2 comments**, this is a relatively small but meaningful remote-development and session synchronization problem.

7. **Persistent `allowed_directories` do not suppress shell permission prompts — #4482](https://github.com/github/copilot-cli/issues/4482)**  
   Directories configured in `~/.copilot/permissions-config.json` are reportedly ignored for shell commands; using `/add-dir` during the session works around the issue. The report has **2 comments** and affects automation, especially in long-running or unattended sessions.

8. **[Routed model failures can switch sessions to incompatible models — #5042](https://github.com/github/copilot-cli/issues/5042)**  
   After a routed model returns a 400 error, the session may switch to a smaller-context model that cannot load the accumulated static prompt. The newly filed issue highlights risks around model fallback, context-window assumptions, tool compatibility, and mid-session behavior changes.

9. **[MCP OAuth loopback callback rejected by Microsoft Entra ID — #5040](https://github.com/github/copilot-cli/issues/5040)**  
   Remote HTTP MCP servers protected by Microsoft Entra ID fail authentication because Entra rejects the CLI’s `127.0.0.1` callback. The report is new and untriaged, but it is particularly relevant to enterprise users integrating remote MCP services.

10. **[CLI updates can stop while `events.jsonl` continues growing — #5035](https://github.com/github/copilot-cli/issues/5035)**  
    Sessions may remain interactive while agent updates cease to appear, even as the event log continues to grow. The issue is new, but it raises important observability and session-health concerns for developers relying on autonomous or long-running CLI sessions.

## Key PR Progress

Only one recently updated pull request was provided, so it is not possible to select ten important PRs from this update.

- **[Update default model version in README — #5036](https://github.com/github/copilot-cli/pull/5036)**  
  This documentation-only change updates the README to reflect the current default Copilot CLI model. It is open and has no recorded comments or reactions in the supplied data.

## Feature Request Trends

- **More precise agent and skill control:** The `disable-model-invocation` behavior in [#4438](https://github.com/github/copilot-cli/issues/4438) and the request to disable “Task complete” summaries in [#5033](https://github.com/github/copilot-cli/issues/5033) both point toward better-grained control over agent invocation, summaries, and automation behavior.
- **Persistent and predictable permissions:** [#4482](https://github.com/github/copilot-cli/issues/4482) highlights demand for configured directory permissions to work reliably. The broader trend is toward policy-based controls that survive session restarts and do not require interactive `/add-dir` or confirmation for every workflow.
- **More reliable MCP lifecycle management:** Issues involving stale bindings, workspace configuration loading, reload behavior, OAuth callbacks, and remote HTTP reconnects indicate that developers want MCP integrations to behave consistently across startup, reauthentication, configuration changes, and long idle periods.
- **Better BYOK and model-provider compatibility:** [#4840](https://github.com/github/copilot-cli/issues/4840) and the model fallback report in [#5042](https://github.com/github/copilot-cli/issues/5042) show increasing interest in using third-party and routed models without sacrificing tools, context management, or session continuity.
- **Improved long-session usability:** Requests include keyboard-accessible history navigation in [#5015](https://github.com/github/copilot-cli/issues/5015), fresh-context plan execution in [#5041](https://github.com/github/copilot-cli/issues/5041), and disabling noisy MCP status notifications in [#5034](https://github.com/github/copilot-cli/issues/5034).
- **Background and autopilot observability:** Issues around stalled updates, permission failures after enabling autopilot, and background-task completion in [#5035](https://github.com/github/copilot-cli/issues/5035), [#5031](https://github.com/github/copilot-cli/issues/5031), and [#4628](https://github.com/github/copilot-cli/issues/4628) underscore the need for predictable background-agent execution.
- **More flexible agent extensibility:** The ACP regression in [#5030](https://github.com/github/copilot-cli/issues/5030) highlights demand for custom agents to work across CLI execution modes.

## Developer Pain Points

- **MCP remains the largest source of integration friction:** Developers are encountering stale bindings, missing workspace configuration, OAuth callback incompatibilities, protocol negotiation failures, expired HTTP sessions, and inconsistent reload behavior.
- **Configuration is not always applied consistently:** Workspace MCP files, persistent permission directories, and changed configuration during a live session can behave differently from their documented or expected behavior.
- **Background-agent behavior is difficult to reason about:** Long-running tasks can lose updates, inherit incorrect permission settings, trigger misleading completion summaries, or stop the parent process after subagent completion.
- **Custom model support is fragile:** BYOK endpoints may reject tool schemas, while routed-model fallback can silently change the active model and context assumptions mid-session.
- **Session and terminal UX need more polish:** Clipboard warnings, terminal layout issues, inaccessible history navigation, stale mobile state, and noisy MCP notifications all add friction to daily CLI use.
- **Correctness around generated commits and artifacts needs attention:** [#5032](https://github.com/github/copilot-cli/issues/5032) reports malformed co-authorship trailers, while [#5037](https://github.com/github/copilot-cli/issues/5037) reports pasted images being lost after rewinding a conversation.

</details>

<details>
<summary><strong>OpenCode</strong> — <a href="https://github.com/anomalyco/opencode">anomalyco/opencode</a></summary>

# OpenCode Community Digest — 2026-10-03

## 1. Today’s Highlights

OpenCode saw no new release in the last 24 hours, but development remained active across reliability, session handling, provider behavior, and the V2 TUI. Several notable fixes and features are in progress, including schema-constrained CLI output, deferred provider-catalog loading, session cleanup safeguards, Linux primary-buffer support, and notification fixes for the new layout.

A recurring theme in issue activity is the transition to OpenCode 2.0: users are reporting V2-specific TUI, configuration, instruction-loading, terminal, and session-management regressions alongside long-standing provider reliability and quota concerns.

## 2. Releases

No new OpenCode versions were published in the last 24 hours.

## 3. Hot Issues

1. **[FEATURE]: Respect `disable-model-invocation: true` in `SKILL.md` frontmatter** — [#34498](https://github.com/anomalyco/opencode/issues/34498)  
   This request seeks compatibility with Claude Code-style skill metadata, allowing skills to opt out of model invocation. The issue was closed after substantial discussion and strong community interest, with 70 👍 reactions and 19 comments.

2. **Muse Spark 1.3 access restricted through OpenCode Zen** — [#49057](https://github.com/anomalyco/opencode/issues/49057)  
   Users report that a free Muse Spark model becomes inaccessible through OpenCode Zen with a `user_blocked` upstream error. With 17 comments but no recorded 👍, the discussion highlights the importance of transparent appeal and access policies for provider-hosted models.

3. **OpenCode Go quota usage appears approximately four times higher than displayed** — [#42985](https://github.com/anomalyco/opencode/issues/42985)  
   The reported mismatch concerns DeepSeek V4 Flash usage shown in the UI versus quota consumption. The issue has 17 comments and 7 👍, making metering accuracy and cost visibility significant concerns for managed OpenCode Go users.

4. **AI aborts after writing `</｜DSML｜tool_calls>`** — [#49050](https://github.com/anomalyco/opencode/issues/49050)  
   This report describes an apparent parser or protocol-boundary failure when a model emits a DSML tool-call terminator. The 11-comment discussion is important because malformed or unusual model output can interrupt otherwise valid agent workflows.

5. **DeepSeek V4.1 Flash prompt-cache regression with new images** — [#51993](https://github.com/anomalyco/opencode/issues/51993)  
   When a conversation gains a new image, cached processing reportedly regresses to the first image, causing later image content to be reprocessed. This has implications for multimodal latency, token usage, and cost predictability.

6. **Weekly quota for one model blocks requests to other models** — [#52783](https://github.com/anomalyco/opencode/issues/52783)  
   Users report that exhausting the `qwen3.7-plus` weekly quota causes OpenCode to reject requests to other models as well. The issue is recent but already has eight comments, suggesting strong concern about quota isolation and model fallback behavior.

7. **OpenAI enterprise account returns “Service Unavailable”** — [#52392](https://github.com/anomalyco/opencode/issues/52392)  
   This report describes persistent upstream connection failures affecting an enterprise OpenAI account. A related issue, [#52269](https://github.com/anomalyco/opencode/issues/52269), covers intermittent failures across models and sessions, together pointing to ongoing provider connectivity and retry-diagnostics concerns.

8. **GitHub Copilot Student plan provider is not registered** — [#34644](https://github.com/anomalyco/opencode/issues/34644)  
   OAuth authentication succeeds, but the `github-copilot` provider does not appear in the model selector for eligible Student-plan accounts. The issue has 21 👍 and six comments, reflecting demand for correct plan-aware provider discovery and entitlement handling.

9. **Subagents should ask questions to the parent session, not the user** — [#52795](https://github.com/anomalyco/opencode/issues/52795)  
   This feature proposal questions allowing task subagents to invoke the user-facing question tool. The discussion focuses on maintaining conversational continuity in parent-child agent workflows and avoiding subagents interrupting users for decisions that should be escalated through the parent agent.

10. **V2 TUI crashes when configuration storage runs out of space** — [#52776](https://github.com/anomalyco/opencode/issues/52776)  
    The TUI can crash with `ENOSPC` while watching `~/.config/opencode`. A related report, [#52796](https://github.com/anomalyco/opencode/issues/52796), describes failed tool-result writes leaving orphaned tool-use records and causing subsequent Anthropic requests to fail with HTTP 400 errors. Together, these expose the need for graceful storage-exhaustion handling and transactional state protection.

## 4. Key PR Progress

1. **Add schema-constrained output to `opencode run`** — [PR #52831](https://github.com/anomalyco/opencode/pull/52831)  
   This feature adds schema-based output constraints to the CLI, addressing requests to make automated agent runs easier to validate and consume programmatically. It is one of the most consequential CLI usability changes in the current queue.

2. **Defer loading the provider catalog at startup** — [PR #52816](https://github.com/anomalyco/opencode/pull/52816)  
   Provider metadata is loaded only when needed rather than during every startup, targeting startup latency and redundant initialization work. The PR also addresses multiple related performance and startup issues.

3. **Preserve progressing sessions during location cleanup** — [PR #51583](https://github.com/anomalyco/opencode/pull/51583)  
   This fix prevents cleanup of one location or session context from disrupting other active sessions and owned shell/subagent work. It is particularly relevant to concurrent agent execution and background processes.

4. **Restore the queued follow-up / “Queue/Steer” setting** — [PR #52428](https://github.com/anomalyco/opencode/pull/52428)  
   The app had always steered messages into the running turn, effectively removing the distinction between queueing and steering. This PR restores the setting and restores user control over how follow-up messages interact with active work.

5. **Add Linux primary-selection support to the TUI** — [PR #32370](https://github.com/anomalyco/opencode/pull/32370)  
   The proposed configuration supports Linux PRIMARY selection, including middle-click paste and related clipboard behavior. It extends the existing Linux clipboard handling and addresses a long-standing workflow gap.

6. **Play notification sounds in the new V2 layout** — [PR #52823](https://github.com/anomalyco/opencode/pull/52823)  
   The new layout was missing the notification and sound handler used by the legacy interface. This fix restores alerts for permission requests and questions raised by background sessions.

7. **Clear the todo dock after fade-out** — [PR #52813](https://github.com/anomalyco/opencode/pull/52813)  
   Completed todos were only hidden, allowing stale items to reappear in later sessions. The change removes the dock after its final fade-out, improving session isolation and interface cleanliness.

8. **Keep transcript rows stable when history is prepended** — [PR #52824](https://github.com/anomalyco/opencode/pull/52824)  
   Session rows lacked stable IDs, causing older-history pagination to remount visible transcript content and briefly display blank or unhighlighted Markdown. This fix improves TUI rendering stability while loading historical messages.

9. **Simplify ACP turn folding** — [PR #52826](https://github.com/anomalyco/opencode/pull/52826)  
   This internal refactor separates event-folding behavior from delivery policy and removes repeated branch handling. The PR is intended to preserve the existing wire behavior while making the ACP implementation easier to maintain.

10. **Add the OpenCode Browser extension** — [PR #52818](https://github.com/anomalyco/opencode/pull/52818)  
    The proposed browser extension introduces a new package and browser-based OpenCode integration. As a new product surface, it may expand the project’s ecosystem beyond the terminal and desktop clients, but its API and scope are still evolving.

## 5. Feature Request Trends

- **More controllable agent behavior**
  - Honor `disable-model-invocation` in skills ([#34498](https://github.com/anomalyco/opencode/issues/34498)).
  - Route subagent questions through the parent session ([#52795](https://github.com/anomalyco/opencode/issues/52795)).
  - Restore explicit queue-versus-steer behavior ([PR #52428](https://github.com/anomalyco/opencode/pull/52428)).

- **Better visibility into usage and model limits**
  - Reconcile displayed costs with Go quota consumption ([#42985](https://github.com/anomalyco/opencode/issues/42985)).
  - Honor provider-reported costs from gateways ([#43818](https://github.com/anomalyco/opencode/issues/43818)).
  - Show context-window limits, throughput, and subagent cost in the TUI ([#42929](https://github.com/anomalyco/opencode/issues/42929), [#49380](https://github.com/anomalyco/opencode/issues/49380), [#48548](https://github.com/anomalyco/opencode/issues/48548)).

- **Provider and subscription interoperability**
  - Add CommandCode support ([#26338](https://github.com/anomalyco/opencode/issues/26338)).
  - Correct GitHub Copilot Student-plan discovery ([#34644](https://github.com/anomalyco/opencode/issues/34644)).
  - Improve handling of OpenAI enterprise connectivity ([#52392](https://github.com/anomalyco/opencode/issues/52392), [#52269](https://github.com/anomalyco/opencode/issues/52269)).

- **V2 usability and compatibility**
  - Add schema-constrained CLI output ([PR #52831](https://github.com/anomalyco/opencode/pull/52831)).
  - Improve V2 documentation for alerts and sessions ([PR #52799](https://github.com/anomalyco/opencode/pull/52799), [PR #52800](https://github.com/anomalyco/opencode/pull/52800)).
  - Restore missing V2 TUI functionality and clarify its behavior ([#52794](https://github.com/anomalyco/opencode/issues/52794), [PR #52823](https://github.com/anomalyco/opencode/pull/52823)).

## 6. Developer Pain Points

- **Provider reliability and account entitlement issues:** OpenAI enterprise failures, Muse Spark access restrictions, Copilot Student provider discovery, and cross-model quota blocking are creating uncertainty about whether failures are local, provider-side, or entitlement-related.
- **Cost and quota transparency:** Users need reliable accounting for managed Go usage, provider-reported gateway costs, context consumption, and model-level quota isolation.
- **V2 transition regressions:** Missing notifications, absent session-pinning controls, disappearing sidebar metrics, broken persistent terminals on older glibc systems, and instruction-loading failures indicate that the 2.0 migration still has substantial edge cases.
- **Session and state durability:** Database or disk exhaustion can crash the TUI and leave malformed tool-call history, causing later provider requests to fail.
- **Startup and interaction performance:** Startup-time provider catalog loading, TUI transcript remounts, and slow initialization are recurring themes in both issues and optimization PRs.
- **Agent orchestration ergonomics:** Developers are asking for clearer control over subagent escalation, queued messages, invocation permissions, and resumable long-running sessions.
- **Terminal and desktop workflow gaps:** Linux PRIMARY selection, context-window visibility, throughput metrics, pinned sessions, and stable todo/transcript behavior remain important quality-of-life concerns.

</details>

<details>
<summary><strong>Pi</strong> — <a href="https://github.com/earendil-works/pi">earendil-works/pi</a></summary>

# Pi Community Digest — 2026-10-03

## Today's Highlights

Pi saw a busy day of maintenance and platform evolution, with fixes landing for multiline syntax highlighting, WebP security handling, OpenAI-compatible token accounting, hidden-tool prompts, and dependency vulnerabilities. Community attention centered on Windows support, TUI behavior, OAuth/account identity, context accounting, MCP configuration, and the upcoming 1.0 packaging changes.

## Releases

No new Pi releases were published in the last 24 hours.

## Hot Issues

1. **[Windows] How do you use Pi on Windows?** [#7547](https://github.com/earendil-works/pi/issues/7547)  
   The most-discussed issue of the day, with 72 comments. The discussion covers Windows terminal compatibility, installation paths, native tooling, and whether platform-specific functionality belongs in core or external tooling. It remains a major platform-quality discussion.

2. **ChatGPT OAuth error 400 during sign-in** [#10258](https://github.com/earendil-works/pi/issues/10258)  
   A reported `invalid_grant` failure affected the OpenAI OAuth flow, while the legacy provider worked for some users. The issue was closed, but it highlights the importance of reliable authentication migration paths.

3. **Terminal color-query replies leak into the prompt on Windows** [#10256](https://github.com/earendil-works/pi/issues/10256)  
   Users of Pi 0.99.x on mintty/ConPTY reported terminal response sequences appearing in the input prompt and triggering the external editor. The regression is limited to specific Windows terminal combinations but can break interactive startup entirely.

4. **ChatGPT OAuth ID token is not persisted** [#10300](https://github.com/earendil-works/pi/issues/10300)  
   The login flow requires an ID token, but the credential conversion path does not save it, preventing extensions from accessing account identity. The issue is particularly relevant to extension authors building account-aware integrations.

5. **Pi 1.0 drops the `./node` export, breaking subagents** [#10360](https://github.com/earendil-works/pi/issues/10360)  
   A packaging/export change in `pi-agent-core` 1.0 removed previously available Node.js subpaths, causing background and async subagents to fail with a missing-export error. A related report was also filed as [#10359](https://github.com/earendil-works/pi/issues/10359).

6. **Context usage is massively overestimated after a retryable network error** [#10287](https://github.com/earendil-works/pi/issues/10287)  
   Reported context usage jumped from roughly 42k to 330k tokens after a WebSocket or fetch failure. The bug affects usage reporting, session continuation decisions, and potentially model/context management.

7. **Extension prompt contributions are dropped on runs without a user prompt** [#10267](https://github.com/earendil-works/pi/issues/10267)  
   `before_agent_start` contributions from extensions may disappear during background notifications, plan-mode continuations, retries, and resumes. This can re-bill or resend an entire prompt while silently losing intended system or section guidance.

8. **CMD mode ignores `outputPad: 0`** [#9946](https://github.com/earendil-works/pi/issues/9946)  
   CMD output retains a leading space despite the setting, while chat messages respect the configuration. The discrepancy suggests separate rendering or formatting paths are not honoring the same user preference.

9. **Codemode script output grows memory without bound** [#10283](https://github.com/earendil-works/pi/issues/10283)  
   Repeated `text()` or `console.*` output is retained outside the QuickJS heap limit, allowing process memory to grow until Pi crashes. This is an important reliability concern for tool-heavy and long-running sessions.

10. **OpenRouter should show models available to the signed-in user** [#10353](https://github.com/earendil-works/pi/issues/10353)  
    Pi currently lists models based on its catalog rather than the user’s authenticated OpenRouter entitlement. The proposal would improve model selection by using the account-specific model endpoint while retaining Pi’s capability metadata.

## Key PR Progress

1. **Azure Foundry Chat Completions support** [#9714](https://github.com/earendil-works/pi/pull/9714)  
   Expands the Azure provider beyond Responses API deployments to Chat Completions-based models, including DeepSeek V4 Pro support. This broadens compatibility with Azure Foundry deployments.

2. **Bazel foundation for the C++ backbone** [#10372](https://github.com/earendil-works/pi/pull/10372)  
   Introduces Bazel 8, module macros, style checks, clang-tidy configuration, interfaces, source layout, and initial clock modules. The PR provides build infrastructure for future native components.

3. **Long-context pricing tier for OpenAI models on Bedrock** [#10329](https://github.com/earendil-works/pi/pull/10329)  
   Corrects cost metadata for requests beyond 272k input tokens, where Bedrock applies higher input/cache rates and a 1.5× output multiplier. This prevents inaccurate accounting for very long conversations.

4. **Hidden-tool guidance removed from rules and skills hints** [#10368](https://github.com/earendil-works/pi/pull/10368)  
   Ensures that tools omitted from the model’s visible tool list are not still referenced in generated rules or skills guidance. The fix reduces contradictory prompts and likely retry behavior around hidden `bash` tools.

5. **Correct streaming reasoning-token accounting for OpenAI-compatible gateways** [#10365](https://github.com/earendil-works/pi/pull/10365)  
   Reconciles inconsistent gateway behavior where streaming and non-streaming `completion_tokens` differ in their handling of `reasoning_tokens`. This improves usage and billing calculations across compatible providers.

6. **Cloudflare Clef classifiers for Workers AI** [#10316](https://github.com/earendil-works/pi/pull/10316)  
   Adds `@cf/cloudflare/clef` and `@cf/cloudflare/clef-flash` to the model catalog, including pricing and context metadata. Related implementations also appeared in [#10322](https://github.com/earendil-works/pi/pull/10322).

7. **Multiline syntax highlighting restored** [#10361](https://github.com/earendil-works/pi/pull/10361)  
   Applies the active syntax formatter independently to each rendered line, preserving highlighting for multiline tokens. A related follow-up remains open in [#10356](https://github.com/earendil-works/pi/pull/10356).

8. **WebP EXIF parser hardening** [#10346](https://github.com/earendil-works/pi/pull/10346)  
   Treats RIFF chunk sizes as unsigned values and rejects malformed or out-of-bounds payloads. The change addresses a potential infinite loop caused by signed integer interpretation of large chunk lengths.

9. **Dependency update for `brace-expansion`** [#10332](https://github.com/earendil-works/pi/pull/10332)  
   Updates the shrinkwrapped dependency from 5.0.9 to 5.0.12, addressing security advisory **GHSA-q2hr-2g5m-vwhr**. This is a notable example of shrinkwrap directly controlling the vulnerable installed version.

10. **Bedrock thinking-block binding controls** [#10328](https://github.com/earendil-works/pi/pull/10328)  
    Configures Bedrock adaptive thinking requests to drop stale or mismatched thinking blocks after system prompts or tools change. This follows Anthropic-style behavior and prevents provider-side 400 errors.

Additional notable work includes the proposed schema publication effort in [#9880](https://github.com/earendil-works/pi/pull/9880), LLM Gateway providers in [#7610](https://github.com/earendil-works/pi/pull/7610), and image-only steering queue cleanup in [#8612](https://github.com/earendil-works/pi/pull/8612).

## Hot Discussions

### Ideas

- **Working memory as prompt sections** — [#10151](https://github.com/earendil-works/pi/discussions/10151)  
  Proposes representing tasks, prior-session summaries, and working context as structured prompt sections, complementing Pi’s skills-based capability memory. The idea seeks to close the loop between session logs and persistent agent context.

- **Ability to disable the share feature** — [#10128](https://github.com/earendil-works/pi/discussions/10128)  
  The community is discussing whether share functionality should be opt-in or easily disabled, reflecting broader interest in user control over session data and external sharing.

### Q&A

- **Codemode benchmarks and token savings** — [#10230](https://github.com/earendil-works/pi/discussions/10230)  
  Users are asking for benchmark data on codemode’s “only” mode and its apparent action-fusion/token-saving benefits, with attention being drawn to related NVIDIA research.

### Show and tell

- **Qwen 3.8 26B fine-tuned for Pi** — [#10331](https://github.com/earendil-works/pi/discussions/10331)  
  A community member shared a Pi-specialized Qwen fine-tune, generating interest in agent-optimized open models while also highlighting the hardware and hosting trade-offs for individual users.

## Feature Request Trends

- **More reliable and polished Windows support**  
  Terminal detection, ConPTY/mintty behavior, external editors, and platform-specific workflows remain recurring priorities.

- **Better provider and model discovery**  
  Users want Pi to reflect authenticated model access, including OpenRouter entitlements and improved Azure, Bedrock, Workers AI, and gateway integrations.

- **Persistent identity and extension-friendly authentication**  
  OAuth ID-token persistence and clearer account metadata are increasingly important as extensions gain deeper integrations.

- **Better context and usage management**  
  Accurate context accounting, compaction queueing, long-context pricing, and reliable behavior after network errors are major concerns for long-running sessions.

- **Cleaner prompt/tool exposure**  
  The community favors clearer distinctions between visible tools, executable tools, rules, and skills. Hidden tools should not leave behind misleading prompt guidance.

- **Configuration extensibility and validation**  
  Project-level MCP overrides, published JSON schemas, and more predictable rendering settings recur as onboarding and integration needs.

- **More first-class agent ergonomics**  
  Persistent working memory, action fusion/codemode improvements, image-only queueing, and better subagent compatibility reflect demand for a more capable agent runtime.

## Developer Pain Points

- **Cross-platform terminal correctness:** Windows behavior varies significantly by terminal and launch method, producing issues that can prevent normal interaction.
- **Provider compatibility:** OAuth changes, gateway-specific usage semantics, model ID changes, and incomplete provider support create recurring integration friction.
- **Context lifecycle correctness:** Compaction, retries, resumes, system-prompt changes, and network failures can produce inaccurate token accounting or malformed state.
- **Extension API stability:** The 1.0 removal of `pi-agent-core` subpath exports broke existing subagent and extension integrations, highlighting the need for migration notes and compatibility guarantees.
- **Prompt consistency:** Hidden tools, extension-injected prompts, and provider-specific reasoning blocks can become out of sync with actual execution behavior.
- **Runtime safety:** Codemode output retention, malformed WebP parsing, and missing stream error handling point to the need for stronger resource and failure-path limits.
- **Discoverability:** Better README installation guidance, configuration schemas, account-aware model catalogs, and clearer provider capabilities would reduce setup and maintenance costs.

</details>

<details>
<summary><strong>Qwen Code</strong> — <a href="https://github.com/QwenLM/qwen-code">QwenLM/qwen-code</a></summary>

# Qwen Code Community Digest — 2026-10-03

## Today's Highlights

Qwen Code’s latest activity is concentrated in the Managed Agent architecture and session infrastructure, including durable session history, writer fencing, host authentication, bounded retries, and database hot-path optimization. The community is also addressing reliability and developer-experience issues across LSP diagnostics, context-token budgeting, memory management, shell parsing, and agent safety. A new nightly release includes fixes for Code Mode and permission handling.

## Releases

### v0.24.7-nightly.20261001.a7deb01bcb

- Aligns Code Mode text with lazy tool discovery.
- Includes permission-handling fixes.
- [View release](https://github.com/QwenLM/qwen-code/releases/tag/v0.24.7-nightly.20261001.a7deb01bcb)

## Hot Issues

1. **[#12380 — Define Managed Agent dual-path architecture and staged delivery](https://github.com/QwenLM/qwen-code/issues/12380)**  
   Proposes separating model inference from tool-environment provisioning while giving Sessions durable ownership, workspace bindings, recoverable tool executions, and a stable web/API surface. It is the most discussed issue in the update, with **41 comments**, indicating strong architectural interest around daemon, multi-agent, and session-management direction.

2. **[#12028 — Non-conversation context token governance](https://github.com/QwenLM/qwen-code/issues/12028)**  
   Highlights the recurring cost of system prompts, tool schemas, `QWEN.md` context, and skill listings on every request. The issue has **18 comments** and reflects broader demand for visibility and control over fixed-context token overhead in long-context models.

3. **[#12091 — `sessions/delete` can permanently break a live session](https://github.com/QwenLM/qwen-code/issues/12091)**  
   A live writer can recreate a deleted transcript with a broken `parentUuid`, leaving the session in `degraded_history` and disabling auto-continue. This P1 issue is important because it affects the core session lifecycle and data durability model.

4. **[#13157 — Agent Host should run the confinement guard before permission flow](https://github.com/QwenLM/qwen-code/issues/13157)**  
   In `qwen serve --join` mode, an out-of-workspace tool call reaches permission handling before being rejected by the Host’s confinement guard. The resulting auto-rejection can terminate the entire run, making this a notable Agent Host safety and availability issue.

5. **[#13122 — Re-enrollment after a 401 leaves a stale valid host credential](https://github.com/QwenLM/qwen-code/issues/13122)**  
   Host enrollment mints new credentials without reliable deduplication by host name or workspace. A failed authentication followed by re-enrollment may therefore leave an old registry entry and still-valid secret, raising credential-lifecycle and security concerns.

6. **[#13208 — Side queries can exceed the model context window](https://github.com/QwenLM/qwen-code/issues/13208)**  
   Main-turn requests apply a context-window clamp, but side queries through lower-level generation APIs do not. As a result, `max_tokens` can be sent without accounting for the available context, potentially causing invalid or wasteful requests.

7. **[#13184 — Managed session stores and panel projections grow without bounds](https://github.com/QwenLM/qwen-code/issues/13184)**  
   The Managed Agent persistence and UI layers default to unbounded time growth across session events, projections, and related state. The issue is especially relevant for long-running or multi-agent deployments and is prompting performance and retention work.

8. **[#13238 — Late host results can be acknowledged while usage is dropped](https://github.com/QwenLM/qwen-code/issues/13238)**  
   A result arriving after terminal settlement is treated as already applied based on attempt, host, and lease identity, even when it contains newly incurred usage. This creates an accounting and idempotency correctness gap in distributed Managed Agent execution.

9. **[#13130 — Desktop workspaces became unexpectedly untrusted](https://github.com/QwenLM/qwen-code/issues/13130)**  
   Users report that Desktop workspaces can become read-only or untrusted without a practical recovery path. The issue affects trust configuration, Windows and Web Shell behavior, and overall usability.

10. **[#13078 — Daily dependency CVE audit failed](https://github.com/QwenLM/qwen-code/issues/13078)**  
    The scheduled audit is failing and requires investigation of the failing action and possible causes, including newly introduced vulnerabilities or audit-service availability. It is a CI and supply-chain signal rather than a direct user-facing feature request.

## Key PR Progress

1. **[#13217 — Stop database amplification on Managed Agent session hot paths](https://github.com/QwenLM/qwen-code/pull/13217)**  
   Reduces repeated persistence work, including whole-document rewrites under session locks after small event batches. This is a major scalability improvement for active Managed Agent sessions.

2. **[#13219 — Bound Managed Agent retry loops with terminal states](https://github.com/QwenLM/qwen-code/pull/13219)**  
   Adds retry budgets and terminal states to asynchronous managed-agent loops, including recovery for projection failures. It should prevent permanently wedged retries and make failure behavior deterministic.

3. **[#13210 — Add broker authentication and broker-provisioned writer credentials](https://github.com/QwenLM/qwen-code/pull/13210)**  
   Introduces authenticated principals and broker-managed writer credentials for the Managed Agent Runtime Broker. The PR also includes bilingual design documentation and targets the security architecture discussed in #13180.

4. **[#13246 — Keep `/context` estimates within the context window](https://github.com/QwenLM/qwen-code/pull/13246)**  
   Applies the same correction used for provider-reported token counts to estimated context breakdowns before the first reply, after model switches, or after resume. This addresses the accounting issue in #13239.

5. **[#13244 — Budget side-query output tokens against the resolved context window](https://github.com/QwenLM/qwen-code/pull/13244)**  
   Extends context-window output clamping to `generateJson` and `generateText` side queries, which currently bypass the main `llm-chat` path. It directly addresses #13208.

6. **[#13128 — Surface failed or unavailable LSP diagnostics as errors](https://github.com/QwenLM/qwen-code/pull/13128)**  
   Stops `NativeLspService` from reporting a clean result when no LSP server is ready, has failed, or has not started. This improves the correctness of editor and agent decisions based on diagnostics.

7. **[#12901 — Preserve nested `tool_call` arguments on Responses requests](https://github.com/QwenLM/qwen-code/pull/12901)**  
   Keeps nested schemas compatible with Azure-specific empty-property handling and improves bridged validation errors by naming the target. The change targets provider interoperability and schema fidelity.

8. **[#13026 — Report speculation files that could not be applied](https://github.com/QwenLM/qwen-code/pull/13026)**  
   Ensures failed speculative file copies are surfaced rather than silently discarded, while preserving successfully applied speculation. This improves transparency around speculative edits.

9. **[#13166 — Add read-only `glob` to hosted-workspace profiles](https://github.com/QwenLM/qwen-code/pull/13166)**  
   Extends hosted workspace capabilities with `glob` through versioned `hosted-workspace-files/2` and `hosted-workspace-shell/2` profiles. It broadens the tool surface while retaining profile-based capability control.

10. **[#13156 — Keep `MEMORY.md` index link targets resolvable](https://github.com/QwenLM/qwen-code/pull/13156)**  
    Fixes index generation that could truncate Markdown link targets when titles exceeded the line limit. The result is more reliable navigation into managed-memory files.

## Feature Request Trends

- **Managed Agent runtime and architecture:** Durable Sessions, workspace bindings, recoverable tool execution, writer fencing, takeover semantics, broker authentication, credential provisioning, and long-running distributed execution are the dominant roadmap themes.
- **Session lifecycle and persistence:** Community interest is concentrated on safe deletion, archival, recovery, history durability, bounded retention, and projection consistency.
- **Agent safety and permissions:** Confinement checks, workspace boundaries, permission ordering, and secure host enrollment are recurring priorities.
- **Context and token efficiency:** Requesters want better visibility into non-conversation context, accurate `/context` estimates, context-aware side-query budgets, and controls for long-context costs.
- **Memory reliability:** Issues focus on preserving links, handling CRLF edits safely, preventing index corruption or truncation, balancing long entries, and reducing unnecessary auto-memory extraction.
- **Web Shell and Desktop usability:** Keyboard navigation, trust recovery, file editing fidelity, mobile connection restoration, and richer session views are prominent UX requests.
- **LSP and tool correctness:** Failed diagnostics, unavailable servers, shell parsing semantics, and provider-specific tool schema compatibility are important foundations for reliable agent behavior.
- **CI and platform performance:** The community is pursuing cheaper trusted-PR execution, louder lint failures, dependency-audit reliability, and more predictable managed-agent resource growth.

## Developer Pain Points

- **Distributed-agent correctness is still the main engineering concern.** Teams are working through retries, late results, leases, writer ownership, session deletion, projection recovery, and credential rotation across multiple issues and PRs.
- **Token accounting is inconsistent across request paths.** Main chat requests, side queries, estimates, tool schemas, and fixed context are handled differently, leading to context-window violations and misleading `/context` output.
- **Persistence layers need explicit lifecycle and retention controls.** Live sessions, deleted transcripts, indexed memory, hosted workspaces, and UI projections can grow indefinitely or be damaged by concurrent writers.
- **Failure states are not always surfaced clearly.** LSP failures, speculative-edit failures, unavailable clipboards, and permission/confirmation failures can be misreported or produce incomplete diagnostics.
- **Hosted and Desktop environments have trust and interoperability rough edges.** Unexpected workspace distrust, TLS-stack-specific resets, CRLF rewriting, and provider compatibility issues create practical friction beyond the core CLI.
- **Automation quality is under scrutiny.** The failing CVE audit, silently ineffective lint lanes, and the demand for more reliable CI routing show growing concern about operational safeguards.

</details>

---
*This digest is auto-generated by [agents-radar](https://github.com/dboeter/daily-diff).*