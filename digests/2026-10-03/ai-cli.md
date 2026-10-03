# AI CLI Tools Community Digest 2026-10-03

> Generated: 2026-10-03 08:33 UTC | Tools covered: 7

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

AI CLI development is shifting from basic agent interaction toward production-grade platform capabilities: durable sessions, subagent orchestration, extensibility, MCP compatibility, sandboxing, permissions, and long-context reliability. Prompt delivery, session state, and context compaction remain common failure points across several tools, with particularly high user impact in VS Code and Windows workflows. Extensibility is diverging by ecosystem: Claude Code emphasizes Mods and plugins, GitHub Copilot focuses on MCP and enterprise integrations, while Qwen Code is investing heavily in remotely managed agents. Release activity is broadly active, although many current changes remain in nightly or prerelease channels and should be evaluated cautiously.

## 2. Activity Comparison

The counts below reflect the items highlighted in the supplied daily digests, not necessarily the complete repository activity totals.

| Tool | Hot issues covered | PRs covered | Discussions covered | Release status today |
|---|---:|---:|---:|---|
| **Claude Code** | 10 | 5 | 0 reported | **v2.1.288** released |
| **OpenAI Codex** | 10 | 10 | 6 | Four **Rust v0.162.0 alpha** prereleases |
| **Gemini CLI** | 10 | 10 | 0 reported | **v0.64.0 nightly** released |
| **GitHub Copilot CLI** | 10 | 1 | 0 reported | Three patches: **v1.0.92-1 through -3** |
| **OpenCode** | 10 | 10 | 0 reported | No release in the last 24 hours |
| **Pi** | 10 | 10 | 2 | No release reported in the digest |
| **Qwen Code** | 10 | 10 | 0 reported | **v0.24.7 nightly** released |

### Activity interpretation

- **OpenAI Codex, Gemini CLI, OpenCode, Pi, and Qwen Code** show the broadest sampled development activity, with ten issues and ten PRs highlighted.
- **Claude Code** has fewer PRs in the digest but exceptionally high community engagement, including more than **1,186 reactions** on the `/buddy` restoration campaign and 240 comments on its Mods roadmap.
- **GitHub Copilot CLI** has the smallest technical PR sample—one updated PR—but shipped three patch releases, indicating active release maintenance despite limited visible PR turnover in the supplied data.
- OpenCode and Pi had no new release mentioned in the digest; this should not be interpreted as inactivity because both have substantial active issue and PR backlogs.
- A “0 reported” discussion count means no discussions were included in the digest, not necessarily that the repository has Discussions disabled. If a repository uses Discussions as its only community channel, that should be marked N/A rather than inactive.

## 3. Shared Feature Directions

### Durable sessions and reliable prompt delivery

This is the most important cross-tool trend.

- **OpenAI Codex:** VS Code prompts are silently dropped, completed threads remain incorrectly marked as streaming, and queued messages can fail after lock-release errors.
- **GitHub Copilot CLI:** Background shell completions can trigger invalid requests, while context rollovers and session lifecycle behavior remain problematic.
- **Gemini CLI:** Interrupted turns can poison resumed context, and duplicate tool responses can be replayed after session resume.
- **Pi:** Auto-compaction fails in CLI mode, aborted tools leave unanswered calls in history, and malformed provider output can permanently wedge a session.
- **Qwen Code:** Late host results can lose usage accounting, and managed session deletion can corrupt transcript history.

**Requirement:** Sessions need durable message queues, explicit state transitions, recoverable failures, valid tool-call histories, and trustworthy resume/compaction behavior.

### Long-context and memory management

- **Claude Code:** Request for visibility into effective auto-compaction windows and better subagent model/state visibility.
- **OpenAI Codex:** Remote `/compact` context-preservation tests and long-thread stability.
- **Gemini CLI:** Excessive directory expansion, tool-count limits, and slower large-repository discovery.
- **GitHub Copilot CLI:** Compaction failures with GPT-6.1-SOL and preservation of requests during rollovers.
- **Pi:** Long-session CPU usage, TUI redraw performance, context overcounting after retries, and missing CLI compaction.
- **Qwen Code:** Governance of system prompts, tool schemas, `QWEN.md`, skills, memory recall, and rule re-injection after eviction.

**Requirement:** Context systems should distinguish conversation history from persistent instructions, memory, tool schemas, and UI state. They also need explicit token budgets, retention policies, and accurate usage reporting.

### Agent orchestration and subagent observability

- **Claude Code:** Background-subagent permission timing, effective model display, and multi-agent state observability.
- **OpenAI Codex:** Dynamic model/reasoning orchestration and preserving low-level controls for v2 subagents.
- **Gemini CLI:** False success after `MAX_TURNS`, generalist-agent hangs, browser-agent configuration, and insufficient subagent diagnostics.
- **Pi:** Provider-specific tool-call normalization and reliable tool-call histories.
- **Qwen Code:** Managed-agent dual-path architecture, runtime-session recovery, memory, and hosted workspaces.

**Requirement:** Developers want to know which agent is active, which model and effort level it uses, whether it is blocked, why it terminated, and what it changed. Termination status must accurately distinguish success, cancellation, timeout, and failure.

### Extensibility and integration interoperability

- **Claude Code:** Mods, plugin security defaults, UI composition, process/file metadata, and marketplace configuration.
- **OpenAI Codex:** MCP resource helpers and stable Code Mode descriptions in the face of changing tool catalogs.
- **GitHub Copilot CLI:** MCP OAuth, remote-server reconnection, metadata stability, Entra authentication, and Figma integration.
- **OpenCode:** GitLab Duo self-managed support and server-plugin integration activation.
- **Qwen Code:** Deployment-managed extensions and hosted-workspace glob support.

**Requirement:** Extension ecosystems need stable APIs, secure permission boundaries, predictable tool catalogs, reliable authentication, and compatibility across local, hosted, and enterprise environments.

### Sandboxing, permissions, and governance

- **Claude Code:** Protected-path mutation breaks Linux sandbox behavior; plugin security defaults; permission-hook ordering; possible redirection-based policy bypass.
- **OpenAI Codex:** Windows sandbox diagnostics, WSL DrvFS handling, browser connector isolation, and HPC `/tmp` failures.
- **Gemini CLI:** Scheduler-level enforcement of “wait” and “explain first” directives; rootless Podman and gVisor support.
- **GitHub Copilot CLI:** Network-bypass prompts, Linux DNS namespace failures, Windows temp-file handling, and finer-grained approvals.
- **Qwen Code:** Agent Host confinement ordering and stale host credentials after re-enrollment.

**Requirement:** Sandboxing and permissions should be enforced at the execution layer, not only through prompt instructions. Diagnostics should explain denials, namespace failures, proxy behavior, and lifecycle state without requiring an interactive terminal.

### Cross-platform reliability

Windows is a recurring weak point:

- **Codex:** Desktop startup, Dots tool parity, VS Code message delivery, browser access, and crashes.
- **Copilot CLI:** Temporary-file handling and terminal input behavior.
- **OpenCode:** PowerShell encoding and Windows-specific process behavior.
- **Pi:** Windows extension and installation issues.
- **Claude Code:** Windows update deadlocks and inconsistent plugin slash-command dispatch.

Linux and nonstandard environments also matter:

- **Codex:** HPC bubblewrap and WSL-mounted home directories.
- **Copilot CLI:** systemd-resolved DNS inside the sandbox.
- **Gemini CLI:** Wayland browser automation and rootless containers.
- **Claude Code:** Bubblewrap protected-path lifecycle.

## 4. Differentiation Analysis

### Claude Code: extensibility-first coding platform

Claude Code is differentiating itself through the **Mods and plugin ecosystem**, including UI APIs, process metadata, filesystem metadata, marketplace sources, and plugin security policies. Its strongest user priorities are extensibility, IDE-native diff review, contextual clarity, and preserving customizable workflows such as `/buddy`.

**Target users:** Developers and teams that want deep CLI customization, plugin-driven workflows, and strong coding-agent ergonomics.

**Technical approach:** Incremental extension APIs layered over the CLI, with increasing attention to safe plugin composition and cloud-session tooling.

### OpenAI Codex: broad client and model-platform ecosystem

Codex is addressing reliability across a wider surface—CLI, VS Code, Windows desktop, Dots, browser tools, Bedrock, MCP, and remote sessions. Its differentiation is less a single feature and more the breadth of its ecosystem and model-provider integration.

**Target users:** Developers working across local and hosted Codex surfaces, enterprise users of Bedrock/GovCloud, and teams needing advanced model routing and MCP support.

**Technical approach:** Rust-based runtime development, client-state consistency, dynamic tool catalogs, provider-specific safeguards, and recovery-oriented diagnostics.

### Gemini CLI: agent delegation, browser automation, and safety

Gemini CLI places unusual emphasis on **subagents and browser-agent operations**. Current work targets false-success reporting, hangs, settings propagation, Wayland support, browser lock recovery, and tool governance. Scheduler-level enforcement of user “hold” directives is a notable safety-oriented direction.

**Target users:** Developers experimenting with multi-agent workflows, browser automation, sandboxed execution, and Google-oriented agent experiences.

**Technical approach:** Delegated-agent infrastructure, MCP and extension loading, browser control, and layered safety checks around mutations.

### GitHub Copilot CLI: enterprise integration and practical terminal workflow

Copilot CLI focuses on GitHub ecosystem integration, MCP, BYOK, remote authentication, and terminal ergonomics. The new environment picker and improved background-agent behavior support a practical distinction between local and cloud execution.

**Target users:** GitHub-centered enterprise teams, MCP consumers, BYOK users, and developers who want a terminal-native assistant integrated with hosted services.

**Technical approach:** Provider routing, remote MCP lifecycle management, OAuth compatibility, permission prompts, and terminal interaction hardening.

### OpenCode: open provider flexibility and V2 platform evolution

OpenCode’s differentiation is broad provider choice, local/self-managed deployments, and an increasingly ambitious V2 architecture. Its main risks are operational: free-tier authentication failure, unbounded SQLite growth, migration regressions, and billing opacity.

**Target users:** Developers who prioritize provider flexibility, self-hosting, open tooling, and integration with enterprise systems such as self-managed GitLab.

**Technical approach:** Provider abstraction, V2 event storage, plugin-based integrations, desktop/web UI, and TUI/session infrastructure.

### Pi: lightweight, extensible, long-session interface

Pi is strongly focused on the **interactive terminal experience** and extensibility. Its current competitive pressure comes from TUI performance, provider portability, local model support, classifier integrations, and memory architecture. It is particularly attractive for developers willing to customize a lightweight agent runtime.

**Target users:** Power users, extension authors, local-model users, and developers who value granular control over prompts, tools, and provider behavior.

**Technical approach:** Minimal core with extensions, provider normalization, local classification support, and highly customized TUI rendering.

### Qwen Code: managed and distributed agent infrastructure

Qwen Code is investing most heavily in a durable **Managed Agent platform**: hosted workspaces, runtime sessions, background shells, memory, host credentials, passive takeover, and web-shell synchronization. Its roadmap is more service-oriented than the other tools.

**Target users:** Organizations deploying managed coding agents, remote workspaces, CI-like automation, or multi-user agent services.

**Technical approach:** Session ownership, durable execution, hosted-worker capabilities, credential lifecycle management, SSE recovery, and deployment-managed extensions.

## 5. Community Momentum & Maturity

### Strongest community mobilization: Claude Code

Claude Code shows the highest visible engagement:

- `/buddy`: **275 comments and 1,186 reactions**
- Mods roadmap: **240 comments and 130 reactions**
- VS Code diff review: **40 comments and 202 reactions**

This indicates strong attachment to established workflows and active investment in the extension platform. The breadth of reported defects also suggests a mature but operationally complex product.

### Broadest visible technical activity: Codex, Gemini CLI, OpenCode, Pi, and Qwen Code

These tools each had ten issues and ten PRs represented in the digest. The activity spans not only UI bugs but also runtime, provider, sandbox, session, and infrastructure concerns.

- **Codex** has the widest cross-surface reliability program.
- **Gemini CLI** has a particularly active subagent and browser-agent agenda.
- **OpenCode** is actively addressing both user-facing regressions and foundational V2 storage/migration issues.
- **Pi** is concentrated on long-session UX and provider portability.
- **Qwen Code** has the most explicit distributed-agent infrastructure focus.

### Rapid release iteration

- **GitHub Copilot CLI** shipped three patches in one day.
- **Codex** shipped four Rust alpha builds in 24 hours.
- **Claude Code, Gemini CLI, and Qwen Code** each shipped a new build.
- **OpenCode** had no new release in the digest, while **Pi** had no release reported.

High release velocity is useful for testing but increases upgrade risk. Codex’s alpha builds and the Gemini/Qwen nightlies should be treated as validation channels rather than default production upgrades.

### Relative maturity

- **Claude Code and GitHub Copilot CLI** appear comparatively mature in broad productization, integrations, and user-facing ecosystems, though they retain meaningful reliability issues.
- **Gemini CLI and Qwen Code** show strong platform investment but are still consolidating behavior across agents, tools, sandboxes, and managed environments.
- **OpenCode and Pi** provide substantial flexibility and customization, but their current risk centers on V2 migration, storage growth, long-session performance, and provider edge cases.
- **Codex** has a large and rapidly changing client ecosystem; maturity is uneven across CLI, VS Code, desktop, Windows, and delegated workflows.

## 6. Trend Signals

### 1. The market is shifting from “chat with code” to durable agent execution

The strongest common signal is that users expect agents to work reliably across long sessions and asynchronous boundaries. Prompt loss, stuck queues, interrupted tool calls, incorrect `streaming` state, malformed histories, and late host results are no longer acceptable edge cases.

### 2. Session reliability is becoming a competitive differentiator

Tools are increasingly differentiating themselves through:

- resumable sessions
- durable queues
- recovery utilities
- deterministic tool-call histories
- explicit failure diagnostics
- context-preserving compaction

A coding agent’s quality is increasingly judged by whether it can continue safely after failure, not only by the quality of its first response.

### 3. MCP is a major reliability and compatibility boundary

MCP issues affect Codex, Copilot CLI, Gemini CLI, OpenCode, and Qwen Code. The recurring causes are tool-catalog churn, metadata changes, OAuth callback behavior, reconnection, stateful servers, schema compatibility, and configuration reloads.

For tool builders, the practical implication is to treat MCP as a distributed protocol rather than a simple tool registry. Implementations need versioning, metadata normalization, retry semantics, and observable authentication state.

### 4. Provider portability is valuable but remains brittle

OpenCode, Pi, Copilot CLI, Codex, and Qwen Code all work across multiple providers or deployment models. However, provider-specific tool IDs, reasoning blocks, cache points, service tiers, OAuth identities, and malformed responses continue to break portability.

A major opportunity is a stronger normalization layer for:

- tool-call schemas and IDs
- reasoning/thinking blocks
- usage accounting
- retries
- context windows
- compaction
- model fallback

### 5. Long-context support is not enough; context lifecycle management is required

Every tool is confronting some combination of context bloat, compaction failures, repeated tool schemas, memory injection, path-rule eviction, and UI rendering costs. Future agents will need explicit context budgets and observability showing what is consuming tokens and why.

### 6. Security controls are moving from prompt-level to execution-level

Gemini’s scheduler-level hold directives, Copilot’s network-bypass prompts, Claude’s plugin security defaults, Codex’s sandbox diagnostics, and Qwen’s Agent Host confinement issues all point in the same direction: user intent and security policy must be enforced below the model’s natural-language layer.

### 7. Multi-agent systems need a control plane

The community increasingly wants subagents to be supervised, observable, recoverable, and cost-aware. Important future capabilities include:

- explicit subagent status and termination reasons
- model/effort selection per task
- cancellation and takeover semantics
- delegated questions back to the parent session
- durable execution receipts
- per-agent token and usage reporting
- safe recovery from malformed output

### 8. Enterprise deployment remains a difficult differentiator

Bedrock, GovCloud, WSL, HPC, systemd-resolved, rootless Podman, gVisor, self-managed GitLab, and remote MCP authentication all expose environment-specific weaknesses. Enterprise readiness requires testing across filesystem layouts, network namespaces, identity systems, and long-lived services—not just standard developer laptops.

### 9. Developer experience is increasingly visual and review-oriented

Claude Code’s Copilot-style diff-review demand, Codex’s fullscreen TUI discussion, and Copilot CLI’s environment picker reflect a broader shift toward IDE-like review experiences. Coding agents are expected to provide clear change previews, navigation, status visibility, and approval controls rather than only terminal text.

### 10. Operational hygiene will become a differentiator

OpenCode’s SQLite growth, Qwen’s unbounded managed projections, Pi’s long-session CPU load, and OpenAI’s request/session recovery problems all point to the need for production-grade operational features:

- storage retention and compaction
- event replay controls
- metrics and health checks
- recovery tooling
- bounded resource usage
- explicit limits on tool and context growth

**Overall takeaway:** The AI CLI market is maturing around reliability, extensibility, and operational control. Claude Code leads on ecosystem customization, Codex on cross-surface breadth, Copilot on enterprise and terminal integration, Gemini on subagent/browser workflows, OpenCode on provider flexibility, Pi on extensibility and TUI-centric interaction, and Qwen Code on managed distributed-agent infrastructure.

---

## Per-Tool Reports

<details>
<summary><strong>Claude Code</strong> — <a href="https://github.com/anthropics/claude-code">anthropics/claude-code</a></summary>

## Claude Code Skills Highlights

> Source: [anthropics/skills](https://github.com/anthropics/skills)

# Claude Code Skills Community Highlights  
*As of 2026-10-03*

> **Ranking note:** The supplied pull-request data says it is sorted by comments, but every displayed PR has `Comments: undefined`. Therefore, the ranking below reflects the provided ordering, update recency, and linked issue activity—not a verified comment or watch count.

## 1. Top Skills Ranking

1. **Skill Creator evaluation reliability** — [PR #1298](https://github.com/anthropics/skills/pull/1298)  
   Improves the trigger-evaluation pipeline in `skill-creator`. The proposed work isolates probes between workers, handles Windows subprocess-pipe behavior, and distinguishes runtime failures from legitimate negative examples.  
   **Attention:** This addresses long-running concerns documented in related issues, including [zero trigger rates in `run_eval.py`](https://github.com/anthropics/skills/issues/556) and [silent benchmark, Windows, and skill-shadowing failures](https://github.com/anthropics/skills/issues/1383).  
   **Status:** **Open**

2. **MCP Builder compatibility with MCP 2.x** — [PR #1742](https://github.com/anthropics/skills/pull/1742)  
   Updates `mcp-builder` for the renamed `streamable_http_client` API and the newer `create_mcp_http_client`/custom-header configuration introduced in `mcp>=2.0.0`.  
   **Attention:** It resolves an identified compatibility defect, making it especially relevant as users move from older SDK interfaces. Related evaluation reliability is also under scrutiny in [Issue #1390](https://github.com/anthropics/skills/issues/1390).  
   **Status:** **Open**

3. **ProofCore Contract Auditor** — [PR #1771](https://github.com/anthropics/skills/pull/1771)  
   Introduces a Web3-focused skill for static analysis of Solidity and Rust smart contracts, with cryptographic audit-proof notarization on TON through ProofCore’s zero-storage Merkle protocol.  
   **Attention:** The submission connects code analysis with tamper-evident audit evidence, an area where specialized, domain-specific Skills remain scarce.  
   **Status:** **Open**

4. **Orphaned DOCX Comment Detection** — [PR #1734](https://github.com/anthropics/skills/pull/1734)  
   Adds detection and handling of orphaned Word comments—comments left in invalid, stale, or otherwise problematic states during document workflows.  
   **Attention:** It targets a narrow but recurring document-quality problem that generic document instructions often miss. It complements related reliability work on revision handling in [PR #1792](https://github.com/anthropics/skills/pull/1792).  
   **Status:** **Open**

5. **Markdown-to-Video/Audio** — [PR #1703](https://github.com/anthropics/skills/pull/1703)  
   Adds a workflow that converts Markdown into presentation slides, MP4 video, and realistic voiceover, reportedly using a zero-cost path built around Marp and related rendering tools.  
   **Attention:** The proposal points toward a broader community demand for multimodal content automation: one structured source document becoming a complete presentation package.  
   **Status:** **Open**

6. **Notion Spec-to-Implementation and Resume Auditor** — [PR #1245](https://github.com/anthropics/skills/pull/1245)  
   Adds two workflow Skills: one that converts Notion specifications into implementation tasks, acceptance criteria, and progress tracking; the other audits quantitative resumes.  
   **Attention:** The proposal reflects interest in product-management automation and Claude’s ability to turn unstructured business documents into concrete engineering work.  
   **Status:** **Open**

7. **Claude API Model Lifecycle Accuracy** — [PR #1607](https://github.com/anthropics/skills/pull/1607)  
   Corrects the `claude-api` Skill so retired model IDs are no longer presented as active legacy models. It addresses metadata that can materially affect model selection.  
   **Attention:** The change is important because the bundled API Skill is broadly used and stale model guidance can produce production errors. Related concerns about its size and eager context loading appear in [Issue #1487](https://github.com/anthropics/skills/issues/1487).  
   **Status:** **Open**

8. **AI Watch Tester end-to-end testing** — [PR #822](https://github.com/anthropics/skills/pull/822)  
   Integrates AI Watch Tester, a browser- and vision-driven E2E testing tool that can generate tests from a target and operate applications through Claude.  
   **Attention:** The submission reflects strong demand for zero-code test generation, browser automation, and evidence-based UI verification. It aligns with the community’s broader interest in testing patterns represented by [PR #723](https://github.com/anthropics/skills/pull/723).  
   **Status:** **Open**

## 2. Community Demand Trends

### Enterprise sharing and governance

The clearest product-level demand is centralized, organization-wide Skill distribution. [Issue #228](https://github.com/anthropics/skills/issues/228) asks for shared libraries or direct sharing links instead of manually sending `.skill` files through Slack or Teams. This would make Skills discoverable, governable, and consistently deployed across teams.

Security is equally urgent. [Issue #492](https://github.com/anthropics/skills/issues/492) warns that community Skills distributed under an `anthropic/` namespace can impersonate official content and exploit misplaced trust. Proposed demand therefore includes:

- Verified publisher and provenance indicators  
- Clear separation between official and community namespaces  
- Permission and installation warnings  
- Organization-level allowlists and review controls  

### Persistent agent memory

[Issue #1329](https://github.com/anthropics/skills/issues/1329) proposes `compact-memory`, a symbolic notation for maintaining compact, long-running agent state. The likely direction is not conventional verbose memory files, but structured representations optimized for:

- Durable task and decision state  
- Lower context consumption  
- Reliable continuity across sessions  
- Better recovery after compaction or interruption  

### Quality assurance and verification

Several proposals demand stronger quality gates rather than only generation Skills. [Issue #1385](https://github.com/anthropics/skills/issues/1385) proposes a three-stage pipeline: pre-task calibration, adversarial review, and delivery verification. This indicates growing interest in Skills that independently inspect plans, challenge assumptions, and verify final artifacts.

The meta-Skill proposal in [PR #83](https://github.com/anthropics/skills/pull/83) points in the same direction through separate quality- and security-analyzing Skills.

### Testing and browser automation

Community interest is concentrated on practical testing workflows:

- AI-generated E2E tests through [PR #822](https://github.com/anthropics/skills/pull/822)  
- Broader testing guidance through [PR #723](https://github.com/anthropics/skills/pull/723)  
- Destructive-operation safeguards through [PR #1776](https://github.com/anthropics/skills/pull/1776)  

The desired capability is not simply “write tests”; it is to create tests, run them against real systems, inspect evidence, and report verified outcomes.

### Document intelligence and production quality

Document demand is moving beyond creation. Community submissions target typographic quality control ([PR #514](https://github.com/anthropics/skills/pull/514)), DOCX comment hygiene ([PR #1734](https://github.com/anthropics/skills/pull/1734)), reliable revision acceptance ([PR #1792](https://github.com/anthropics/skills/pull/1792)), and OpenDocument support ([PR #486](https://github.com/anthropics/skills/pull/486)).

The emerging pattern is specialized validation Skills that detect failures invisible to the user—such as widows, orphaned comments, unresolved tracked changes, or incorrect file references.

### Specification-to-execution workflows

[PR #1245](https://github.com/anthropics/skills/pull/1245) highlights demand for turning specifications into engineering-ready execution. The anticipated direction includes:

- Breaking product documents into tasks  
- Generating acceptance criteria  
- Tracking implementation status  
- Preserving links back to source requirements  

This represents a shift from document summarization toward operational planning.

## 3. High-Potential Pending Skills

These PRs are still open but appear well aligned with active community needs:

- **Skill Creator reliability and trigger evaluation** — [PR #1298](https://github.com/anthropics/skills/pull/1298)  
  High impact because it repairs shared infrastructure used to create and optimize other Skills.

- **MCP Builder MCP 2.x support** — [PR #1742](https://github.com/anthropics/skills/pull/1742)  
  High practical value given the ecosystem’s movement toward current MCP SDKs.

- **AI Watch Tester** — [PR #822](https://github.com/anthropics/skills/pull/822)  
  Strong alignment with demand for browser automation, generated E2E tests, and visual verification.

- **Blast Radius** — [PR #1776](https://github.com/anthropics/skills/pull/1776)  
  A focused safety layer for bulk or destructive operations, covering effects beyond merely matching database rows.

- **Testing Patterns** — [PR #723](https://github.com/anthropics/skills/pull/723)  
  Broadens testing from E2E automation into a coherent strategy spanning unit, component, integration, and broader test design.

- **Document Typography** — [PR #514](https://github.com/anthropics/skills/pull/514)  
  Addresses broadly applicable document-quality defects that can be incorporated as reusable validation guidance.

- **Skill Quality and Security Analyzers** — [PR #83](https://github.com/anthropics/skills/pull/83)  
  Potentially valuable marketplace infrastructure for reviewing Skill structure, execution quality, and security risk.

- **ProofCore Contract Auditor** — [PR #1771](https://github.com/anthropics/skills/pull/1771)  
  A differentiated candidate for specialized Web3 auditing, though its dependency on a third-party notarization ecosystem should be weighed carefully.

## 4. Skills Ecosystem Insight

**The community’s most concentrated Skill-level demand is for trustworthy operational automation—workflows that can act across documents, APIs, browsers, and infrastructure while independently validating security, quality, and real-world impact before reporting success.**

---

# Claude Code Community Digest — 2026-10-03

## Today’s Highlights

Claude Code **v2.1.288** expands the Mods API with text-selection access and improves GitHub tooling inside cloud sessions. Community attention is centered on the rapidly evolving **Mods extensibility system**, along with recurring concerns around instruction adherence, sandbox reliability, permissions, and IDE workflows. Only **five pull requests** were updated in the last 24 hours, so all available PRs are included below.

## Releases

### [v2.1.288](https://github.com/anthropics/claude-code/releases/tag/v2.1.288)

- Added **`$.ui.selection()` for Mods**:
  - Returns the user’s most recent fullscreen text selection.
  - When the selected text is contained in one transcript row, also makes that row available.
- Added a built-in **`gh api`** command for cloud-session images that do not include GitHub CLI.
- Fixed a problem where the built-in command could send a control character.

A newly reported issue, [#99130](https://github.com/anthropics/claude-code/issues/99130), says Mods may still be remotely disabled despite documentation stating that they are enabled by default from v2.1.287 onward.

## Hot Issues

### 1. [Bring Back Buddy — A Consolidated Plea from the Community](https://github.com/anthropics/claude-code/issues/45596)
Users are asking for the removal of `/buddy` in v2.1.97 to be reversed. With **275 comments and 1,186 reactions**, it is the day’s dominant community campaign and reflects strong attachment to custom status-line features. The request is marked as a duplicate/enhancement and remains open.

### 2. [Mods — Make Claude 10x More Extensible](https://github.com/anthropics/claude-code/issues/91870)
This tracking issue covers the community’s broader extensibility agenda. It has **240 comments and 130 reactions**, with maintainers reporting that Mods are live and actively incorporating feedback. The scale of discussion makes it the most important platform-direction issue for Mods developers.

### 3. [VS Code Extension: Diff Review UI Similar to Copilot Edits Review](https://github.com/anthropics/claude-code/issues/33932)
Developers want a richer side-by-side change-review experience in the VS Code extension, including clearer presentation of proposed edits. The request has **40 comments and 202 reactions**, indicating broad interest in closing the gap with established agentic IDE review workflows.

### 4. [Effort/Model Selection Reverts to “Extra” When Switching Chats](https://github.com/anthropics/claude-code/issues/66266)
A report claimed that per-chat effort or “ultracode” settings could revert after switching conversations. Although the issue is now **closed**, its 15 comments make it noteworthy: model-selection persistence is important for predictable cost and capability management. It may overlap with the broader class of silent effort-level downgrades referenced in the report.

### 5. [Improve the Model’s Ability to Follow Instructions](https://github.com/anthropics/claude-code/issues/13689)
This long-running request covers failures to preserve explicit user constraints and workflows. It has **12 comments and 10 reactions**, and connects directly to several new reports about models running tests or servers during code-only reviews, skipping loaded review procedures, or altering established rules.

### 6. [Cowork on Windows: Plugin Slash Commands Behave Inconsistently](https://github.com/anthropics/claude-code/issues/94309)
On Windows, a typed plugin slash command executes only when the picker resolves it into a “blue chip”; otherwise, identical text is sent to the model as ordinary input. This is a meaningful plugin UX and command-dispatch consistency problem, particularly for keyboard-driven workflows.

### 7. [PermissionRequest Hook Timing Differs for Background Subagents](https://github.com/anthropics/claude-code/issues/82150)
Main sessions reportedly run the `PermissionRequest` hook concurrently with the local permission dialog, while background subagents await the hook before presenting the dialog. Such differences can alter which permission decision “wins” and can block automation, particularly when hooks deliberately wait on external approvals.

### 8. [Windows Update Deadlock After `beforeQuitForUpdate`](https://github.com/anthropics/claude-code/issues/96942)
The main Windows process can survive the pre-update quit hook and block relaunch through the application’s single-instance lock. The issue has a reproduction across two versions, making it operationally significant for teams that depend on unattended or managed desktop updates.

### 9. [Linux Bubblewrap Sandbox Stops Working After Protected Paths Change](https://github.com/anthropics/claude-code/issues/95529)
On Linux, bubblewrap snapshots protected-path bindings at session start. Deleting or replacing one of those paths mid-session can cause later sandboxed Bash commands to fail, even though the underlying command has not materially changed.

### 10. [Cloud Session Using the Wrong Usage Pool](https://github.com/anthropics/claude-code/issues/99166)
A new GitHub-integration report says a cloud session connected to a private repository appears to use the wrong usage or credit pool. The issue has limited discussion so far, but incorrect usage attribution can affect quotas, billing, and access-control expectations.

## Key PR Progress

The source lists five updated PRs rather than ten; all five are included.

### 1. [Plugins May Tighten, Never Loosen, Security Defaults](https://github.com/anthropics/claude-code/pull/99137)
Proposed changes ensure that a personal plugin cannot remove deny rules, weaken ask rules, or alter pinned variables in a `sec-default` policy context. This is an important extension-security boundary: plugins may add restrictions but should not weaken user-defined controls.

### 2. [Preserve `/diff` Pane Until It Can Render](https://github.com/anthropics/claude-code/pull/99141)
The `/diff` pane would remain available when opened before a renderer is attached, appearing once rendering becomes possible. This improves extensibility and lifecycle robustness for Mods that provide custom panes.

### 3. [Show Plugin Toasts While `/diff` Is Open](https://github.com/anthropics/claude-code/pull/99118)
Other plugins’ transient notifications would no longer be suppressed while the `/diff` pane or dialog is active. The change reduces notification starvation and suggests more predictable cross-plugin UI composition.

### 4. [Expose Process Truncation and File Modification Metadata to Mods](https://github.com/anthropics/claude-code/pull/97293)
The proposed declarations add:
- `isStdoutTruncated` and `isStderrTruncated` to `$.process.run` results.
- `mtimeMs` to `$.fs.list` entries.

The PR is gated on those fields actually being present in the released npm CLI, preventing Mods from relying on unsupported metadata.

### 5. [Document `skipLfs` Marketplace Sources](https://github.com/anthropics/claude-code/pull/77977)
This documentation PR covers `skipLfs` for GitHub shorthand and generic Git marketplace sources, including examples that avoid Git LFS downloads. The PR is closed and docs-only, but improves plugin installation and repository setup guidance.

## Feature Request Trends

- **Stronger and safer extensibility:** Mods remain the central platform theme, with demand for richer APIs, better UI composition, cross-plugin behavior, security boundaries, and reliable rollout.  
  [#91870](https://github.com/anthropics/claude-code/issues/91870) · [#99137](https://github.com/anthropics/claude-code/pull/99137)

- **IDE-native review workflows:** Developers want Copilot-style diff review, reliable multi-root links, and better handling of local uncommitted changes versus the base branch.  
  [#33932](https://github.com/anthropics/claude-code/issues/33932) · [#99177](https://github.com/anthropics/claude-code/issues/99177) · [#94537](https://github.com/anthropics/claude-code/issues/94537)

- **More transparent context management:** There is a request to expose the effective auto-compaction window to status lines, helping users understand and tune long-session behavior.  
  [#96467](https://github.com/anthropics/claude-code/issues/96467)

- **Observable, correct subagent state:** Status lines and transcripts should show the subagent’s effective model rather than the parent session’s model.  
  [#97473](https://github.com/anthropics/claude-code/issues/97473)

- **Improved desktop interaction and metadata:** Requests include rendering hover hints from Markdown titles and `<abbr title>`, plus fixing same-name collisions between local and SSH-remote projects.  
  [#95508](https://github.com/anthropics/claude-code/issues/95508) · [#99172](https://github.com/anthropics/claude-code/issues/99172)

- **Preservation of customizable workflows:** The highly upvoted request to restore `/buddy` demonstrates demand for stable, user-extensible status-line customization.  
  [#45596](https://github.com/anthropics/claude-code/issues/45596)

## Developer Pain Points

- **Instruction adherence and review boundaries:** Multiple new reports claim Claude may execute tests or servers despite zero-autonomy or code-only instructions, skip loaded review procedures, or run commands for simple yes/no questions. These reports also question whether the model preserves user-defined memory and procedures.  
  [#99184](https://github.com/anthropics/claude-code/issues/99184) · [#99182](https://github.com/anthropics/claude-code/issues/99182) · [#99183](https://github.com/anthropics/claude-code/issues/99183) · [#99179](https://github.com/anthropics/claude-code/issues/99179) · [#99180](https://github.com/anthropics/claude-code/issues/99180)

- **Sandbox behavior that changes mid-session:** Protected-path mutations can invalidate later Bash execution, while file redirection can apparently bypass `sandbox.excludedCommands`. Both affect the reliability of security and network policy enforcement.  
  [#95529](https://github.com/anthropics/claude-code/issues/95529) · [#95532](https://github.com/anthropics/claude-code/issues/95532)

- **Plugin command ambiguity and collisions:** Typed Cowork commands may become plain model input if not selected in the picker, while duplicate plugin names can produce unlabeled menu entries and incorrect marketplace resolution.  
  [#94309](https://github.com/anthropics/claude-code/issues/94309) · [#99174](https://github.com/anthropics/claude-code/issues/99174)

- **Permissions and automation can stall:** Background-subagent hook ordering, scheduled-task wake-up races, and silent periods during large tasks all create reliability problems for non-interactive workflows.  
  [#82150](https://github.com/anthropics/claude-code/issues/82150) · [#99173](https://github.com/anthropics/claude-code/issues/99173) · [#99181](https://github.com/anthropics/claude-code/issues/99181)

- **Cross-platform update and workspace defects:** Windows update deadlocks, SSH/local sidebar collisions, and unclickable VS Code links in multi-root workspaces are recurring sources of desktop friction.  
  [#96942](https://github.com/anthropics/claude-code/issues/96942) · [#99172](https://github.com/anthropics/claude-code/issues/99172) · [#99177](https://github.com/anthropics/claude-code/issues/99177)

- **Billing, entitlements, and integration visibility:** A cloud session may be attributed to the wrong usage pool, while GitHub may be unavailable in Project knowledge despite a connected account. These are high-impact trust issues even where current community discussion is limited.  
  [#99166](https://github.com/anthropics/claude-code/issues/99166) · [#99176](https://github.com/anthropics/claude-code/issues/99176)

</details>

<details>
<summary><strong>OpenAI Codex</strong> — <a href="https://github.com/openai/codex">openai/codex</a></summary>

# OpenAI Codex Community Digest — 2026-10-03

## Today’s Highlights

The dominant theme today is **reliability across Codex client surfaces**, particularly message delivery and session state in the Windows desktop app and VS Code extension. Multiple reports describe prompts being dropped, stuck in queues, replayed after restart, or retried indefinitely.

Underlying development is moving quickly: four `0.162.0` Rust alpha builds shipped in 24 hours, alongside targeted fixes for Windows daemons and sandboxes, Code Mode/MCP compatibility, Bedrock model tiers, and TUI behavior.

## Releases

- [`rust-v0.162.0-alpha.6`](https://github.com/openai/codex/releases/tag/rust-v0.162.0-alpha.6)
- [`rust-v0.162.0-alpha.7`](https://github.com/openai/codex/releases/tag/rust-v0.162.0-alpha.7)
- [`rust-v0.162.0-alpha.8`](https://github.com/openai/codex/releases/tag/rust-v0.162.0-alpha.8)
- [`rust-v0.162.0-alpha.9`](https://github.com/openai/codex/releases/tag/rust-v0.162.0-alpha.9)

These are prerelease builds of the Rust CLI distribution. No detailed changelog was provided, so users should treat them as testing releases rather than a production upgrade recommendation.

## Hot Issues

1. **[#48324 — Windows desktop fails to load organization settings](https://github.com/openai/codex/issues/48324)**  
   Codex in the ChatGPT Windows app can fail before the composer or session loads, while Web and CLI remain functional. The issue had **37 comments and 6 reactions**, making it today’s most-discussed report; its early failure point also blocks `/feedback` and creation of a desktop session ID.

2. **[#49458 — Dot-started Windows tasks lack Computer Use tools](https://github.com/openai/codex/issues/49458)**  
   Tasks started through Windows Dots reportedly do not receive Computer Use capabilities even though ordinary local Codex sessions work. It drew **32 comments and 14 👍**, indicating strong interest in parity between local sessions and delegated or remote workflows.

3. **[#49988 — VS Code extension intermittently drops submitted messages](https://github.com/openai/codex/issues/49988)**  
   After an October 1 update, Enter may clear the composer without adding the message or starting Codex processing. Despite a lower comment count, it was the day’s most-reacted issue at **20 👍**, suggesting substantial community impact.

4. **[#50118 — Completed threads remain `streaming=true` and queue new prompts](https://github.com/openai/codex/issues/50118)**  
   The extension can continue treating a finished turn as active, causing normal prompts to remain queued. This is an important session-state defect because it breaks the expected turn lifecycle and can accumulate or replay work.

5. **[#50403 — Queued VS Code messages fail to send after lock-release error](https://github.com/openai/codex/issues/50403)**  
   A JSON parsing error—`"undefined" is not valid JSON`—prevents release of the queued-message send lock. The symptom is silently failed delivery, making the failure difficult for users to diagnose and potentially blocking subsequent prompts.

6. **[#49746 — Windows Dots cannot read existing local chats](https://github.com/openai/codex/issues/49746)**  
   Dots reports an unsupported placement region when opening an existing local Codex conversation. This limits continuity between local and delegated workflows and appears related to broader Windows Dots compatibility work.

7. **[#45625 — Windows browser connector returns HTML and finds no browsers](https://github.com/openai/codex/issues/45625)**  
   The connector’s JSON endpoint appears to return an HTML page, causing browser enumeration to fail despite Edge and Chrome being open. This affects an important agent capability: observing and interacting with browser tabs.

8. **[#50519 — Windows app repeatedly returns home and crashes](https://github.com/openai/codex/issues/50519)**  
   A current Windows build reportedly crashes after being active for a while; the report includes a process dump and call relationships. Although new, the crash plus diagnostic evidence makes it a high-priority stability lead.

9. **[#44256 — Long local thread crashes ChatGPT desktop](https://github.com/openai/codex/issues/44256)**  
   Opening a specific long Codex thread containing extensive tool and reasoning events terminates the macOS desktop app. This suggests a possible session-rendering or deserialization scalability problem rather than a general application failure.

10. **[#48758 — Bubblewrap fails on HPC systems with overmounted `/tmp`](https://github.com/openai/codex/issues/48758)**  
    Codex’s Linux sandbox can fail on HPC environments where `/tmp` is mounted unusually. The issue is significant for research, academic, and cluster users who depend on sandbox isolation in nonstandard Linux layouts.

Also notable: [#50538](https://github.com/openai/codex/issues/50538) adds another report of intermittent Enter-to-submit failure in VS Code, reinforcing the queue and message-delivery cluster.

## Key PR Progress

1. **[#50559 — Distinguish daemon release identity from executable contents](https://github.com/openai/codex/pull/50559)**  
   Separates release identity from binary equality so resource-only updates are recognized correctly. This prevents unnecessary daemon restarts while still allowing stale updater handoffs.

2. **[#50540 — Incremental tool catalogs in Responses Lite](https://github.com/openai/codex/pull/50540)**  
   Sends the initial tool catalog once and thereafter appends only added or changed definitions. This can reduce request overhead and improve catalog-update behavior for tool-heavy sessions.

3. **[#50546 — Keep MCP resource helpers available in Code Mode](https://github.com/openai/codex/pull/50546)**  
   Ensures `list_mcp_resources`, `list_mcp_resource_templates`, and `read_mcp_resource` remain registered in `CodeModeOnly`. This improves MCP compatibility and avoids tool discovery shifting as servers come and go.

4. **[#50536 — Stabilize shared MCP types in Code Mode descriptions](https://github.com/openai/codex/pull/50536)**  
   Keeps the default or configured MCP TypeScript preamble present regardless of deferred tool schemas. More stable `exec` descriptions should reduce prompt churn caused by catalog changes.

5. **[#50555 — Skip daemon auto-start for Windows-mounted WSL homes](https://github.com/openai/codex/pull/50555)**  
   Avoids starting the managed daemon when `CODEX_HOME` is on DrvFS/9p, where Unix permission semantics are unreliable. This targets a class of WSL startup failures before the TUI can open.

6. **[#50558 — Avoid querying the current directory for absolute paths](https://github.com/openai/codex/pull/50558)**  
   Routes absolute paths through resolution logic that does not read the process working directory. As a result, path resolution remains valid even if the current directory has been deleted.

7. **[#50507 — Add Windows sandbox service stop diagnostics](https://github.com/openai/codex/pull/50507)**  
   Records lifecycle reasons and numeric HRESULT values for requested stops, shutdown, owner removal, startup failure, broker failure, and interrupted registration. Better persisted diagnostics should make Windows sandbox failures more actionable.

8. **[#50510 — Require GovCloud acknowledgment after Bedrock setup](https://github.com/openai/codex/pull/50510)**  
   Detects AWS GovCloud configuration and requires explicit acknowledgment of security and deployment guidance. This adds an important guardrail for enterprise and government-oriented Bedrock setups.

9. **[#50516 — Test context preservation for remote `/compact`](https://github.com/openai/codex/pull/50516)**  
   Adds scenario and snapshot coverage for requests before and after remote compaction, including persisted replacement history. This protects conversation continuity across context compression.

10. **[#50525 — Reject unknown TUI keys in strict config validation](https://github.com/openai/codex/pull/50525)**  
    Improves strict configuration validation by detecting unknown keys under `[tui]`, including keys previously hidden by flattened notification settings. Misspelled or unsupported options will now fail early rather than being silently ignored.

Additional notable fixes include improved daemon installer errors ([#50499](https://github.com/openai/codex/pull/50499)), Bedrock `ultrafast` service-tier support ([#50472](https://github.com/openai/codex/pull/50472)), and more consistent centered TUI confirmations ([#50504](https://github.com/openai/codex/pull/50504)).

## Hot Discussions

### Ideas

- **[#49977 — Dynamic model and reasoning orchestration in Codex/Work](https://github.com/openai/codex/discussions/49977)**  
  Proposes selecting models and reasoning effort dynamically during a task rather than fixing them at session start. The goal is to route work according to complexity, latency, and cost.

- **[#41833 — Stop cutting controls on v2 subagents](https://github.com/openai/codex/discussions/41833)**  
  Calls for retaining low-level controls for v2 subagents rather than constraining inputs and configuration to fit UI guidance. This reflects demand for more precise programmatic control over agent behavior.

- **[#49129 — Codex CLI goes fullscreen](https://github.com/openai/codex/discussions/49129)**  
  A staff-authored discussion explains the new full-terminal experience: expandable diffs and tool output, a pinned composer, and copyable text without leaving the active transcript.

### Show and tell

- **[#50548 — `codex-unlock`](https://github.com/openai/codex/discussions/50548)**  
  A community CLI for diagnosing native thread writer locks and recovering eligible completed sessions that still hold one. It may be particularly relevant during the current wave of stuck or replayed-session reports.

- **[#50547 — `session-peer`](https://github.com/openai/codex/discussions/50547)**  
  A CLI for discovering and messaging Codex and Claude Code sessions locally or over SSH. It supports asking another session to review a change, report progress, or take over work.

### Q&A / Project Direction

- **[#50487 — AGENTS.md and project skills removed from Codex source](https://github.com/openai/codex/discussions/50487)**  
  A community member asks about the disappearance of repository-level `AGENTS.md` and Codex-specific skills. The discussion may clarify the project’s evolving stance on explicit agent scaffolding.

## Feature Request Trends

- **Reliable prompt delivery and queue recovery:** The clearest demand is for durable message submission, explicit queue state, safer retry behavior, and recovery of prompts lost during extension reloads or session-state errors.
- **Windows and WSL parity:** Users want desktop, CLI, VS Code, Dots, and local-session capabilities to behave consistently—especially Computer Use, browser access, daemons, sandboxing, and existing-chat loading.
- **Greater agent control:** Discussions and subagent reports favor exposing advanced controls directly rather than reducing them to simplified UI defaults.
- **Dynamic model orchestration:** Developers want automatic selection of model and reasoning effort based on task complexity, cost, and latency.
- **MCP stability in Code Mode:** Tool discovery, shared type descriptions, and resource helpers should remain stable as server catalogs change.
- **Enterprise and cloud-model support:** Bedrock service tiers, GovCloud safeguards, and clearer configuration validation are recurring themes.
- **Session observability and recovery:** Better diagnostics, persisted failure reasons, transcript preservation, and tools for recovering stuck sessions are increasingly important.
- **Long-session reliability:** UI and protocol improvements should continue, but long threads also need deeper support for large tool/reasoning histories and compact operations.
- **RTL accessibility:** [#21563](https://github.com/openai/codex/issues/21563) continues to highlight the need for proper Persian/Farsi directionality and a force-direction option.

## Developer Pain Points

1. **Silent prompt loss:** The most serious recurring issue is Enter or Send clearing the composer without delivering the message, often leaving no visible error.
2. **Incorrect session state:** Threads can remain `streaming=true`, queue unrelated follow-ups, replay prompts after restart, or become permanently “processing.”
3. **Surface inconsistency:** Windows Web/App, CLI, VS Code, and Dots workflows diverge in startup behavior, authentication, Computer Use, and local-session access.
4. **Windows reliability:** Reports include terminal-window flashing, sandbox lifecycle failures, UI freeze loops, desktop crashes, browser-connector failures, and daemon startup issues.
5. **Nonstandard environments:** HPC clusters, WSL on Windows-mounted filesystems, proxy-constrained networks, and restricted outbound HTTPS remain difficult deployment targets.
6. **Tool-catalog churn:** Dynamic tool availability can alter prompts and Code Mode descriptions, making agent behavior less deterministic.
7. **Long-running sessions:** Large local threads, repeated `/compact` operations, and extended desktop sessions expose stability and context-preservation risks.
8. **Configuration discoverability:** Strict validation is improving, but users also need better diagnostics for daemon, sandbox, Bedrock, and managed-policy failures.

</details>

<details>
<summary><strong>Gemini CLI</strong> — <a href="https://github.com/google-gemini/gemini-cli">google-gemini/gemini-cli</a></summary>

# Gemini CLI Community Digest — 2026-10-03

## Today’s Highlights

- Gemini CLI released the `v0.64.0` nightly build with a reliability fix making Enter and Spacebar consistently confirm options in interactive selection lists.
- Agent infrastructure remains the dominant focus across the community: current discussions center on subagent recovery, browser-agent reliability, configuration propagation, observability, and safer tool-use controls.
- Several important reliability and security fixes are progressing in PRs, including atomic persistent-state writes, session-resume deduplication, OAuth callback validation, MCP timeout handling, and protection against unintended mutations after user hold directives.

## Releases

### `v0.64.0-nightly.20261003.gfb972b2f8`

This nightly release includes a CLI usability fix ensuring that **Enter and Spacebar reliably confirm selection-list options**, addressing inconsistent keyboard interaction in interactive prompts.

[View release](https://github.com/google-gemini/gemini-cli/releases/tag/v0.64.0-nightly.20261003.gfb972b2f8) · [Release PR](https://github.com/google-gemini/gemini-cli/pull/29619)

## Hot Issues

1. **Subagents can report false success after reaching `MAX_TURNS`** — [#22323](https://github.com/google-gemini/gemini-cli/issues/22323)  
   A `codebase_investigator` subagent can report `status: "success"` and termination reason `GOAL` even when it hit its turn limit before performing the requested analysis. Incorrect termination reporting makes failures difficult to detect in automated workflows. The issue has **13 comments** and **2 👍**.

2. **Generalist agent hangs indefinitely** — [#21409](https://github.com/google-gemini/gemini-cli/issues/21409)  
   Users report that deferring work to the generalist agent can hang for up to an hour, including on simple operations such as folder creation. Explicitly telling Gemini not to use subagents appears to avoid the problem. The issue has **8 comments** and **8 👍**, indicating strong community interest.

3. **Browser Agent ignores `settings.json` overrides** — [#22267](https://github.com/google-gemini/gemini-cli/issues/22267)  
   The Browser Agent reportedly ignores global and project-level settings, including `maxTurns`. This creates inconsistent behavior between the main agent and delegated browser workflows. The issue has **4 comments** and **0 👍**.

4. **Browser subagent failures under Wayland** — [#21983](https://github.com/google-gemini/gemini-cli/issues/21983)  
   Browser automation terminates unexpectedly on Wayland environments, limiting browser-agent use on modern Linux desktops. The issue has **4 comments** and **1 👍**.

5. **More than 128 tools can trigger 400 errors** — [#24246](https://github.com/google-gemini/gemini-cli/issues/24246)  
   The issue reports HTTP 400 failures when more than 400 tools are available, with the title referring to the 128-tool limit. This highlights the need for better tool-scoping and discovery behavior as MCP and extension ecosystems grow. It has **3 comments**.

6. **Gemini does not invoke custom skills and subagents enough** — [#21968](https://github.com/google-gemini/gemini-cli/issues/21968)  
   Users report that Gemini will use custom skills or subagents when explicitly instructed but often fails to select them autonomously. The concern is reduced effectiveness from missed delegation opportunities. The issue has **7 comments**.

7. **Model creates temporary scripts in random locations** — [#23571](https://github.com/google-gemini/gemini-cli/issues/23571)  
   Restricting shell access can lead the model to create edit scripts across multiple directories, leaving users with repository cleanup work and accidental commit noise. The issue has **3 comments**.

8. **Interactive Vite creation can become stuck** — [#22465](https://github.com/google-gemini/gemini-cli/issues/22465)  
   When instructed to create a Vite application, Gemini CLI can stop at an interactive prompt rather than proceeding. The project is adding a behavioral evaluation to address this reliability gap. The issue has **2 comments**.

9. **`/bug` reports omit subagent context** — [#21763](https://github.com/google-gemini/gemini-cli/issues/21763)  
   Bug reports generated from the main session do not include enough information about what was happening inside a subagent, complicating diagnosis and evaluation. The issue has **2 comments**.

10. **Browser Agent needs session takeover and lock recovery** — [#22232](https://github.com/google-gemini/gemini-cli/issues/22232)  
    Persistent browser sessions currently fail fast when a browser profile is locked by another process. The requested improvement would support automatic takeover and recovery, making long-running browser-agent sessions more robust. The issue has **4 comments**.

## Key PR Progress

1. **Make persistent-state writes failure-safe** — [PR #29402](https://github.com/google-gemini/gemini-cli/pull/29402) — **Closed**  
   Writes `state.json` through a temporary sibling file, `fsync`, and atomic rename. This prevents interrupted saves from replacing valid state with truncated JSON and silently clearing persistent CLI state.

2. **Prevent duplicate tool responses when resuming sessions** — [PR #29400](https://github.com/google-gemini/gemini-cli/pull/29400) — **Closed**  
   Fixes replaying tool results from both `toolCalls[].result` and durable user messages after session resume. A related implementation remains open as [PR #29618](https://github.com/google-gemini/gemini-cli/pull/29618).

3. **Bound initial MCP tool discovery with a short timeout** — [PR #29398](https://github.com/google-gemini/gemini-cli/pull/29398) — **Closed**  
   Prevents a malformed or mismatched `tools/list` response from causing MCP discovery to wait for the full default timeout—potentially ten minutes.

4. **Preserve unrelated comments during edits** — [PR #29399](https://github.com/google-gemini/gemini-cli/pull/29399) — **Closed**  
   Strengthens the replace-tool contract and encourages minimal, targeted edits. The change aims to avoid rewriting large code regions and accidentally deleting unrelated comments or code.

5. **Prevent session context poisoning after interrupted turns** — [PR #29397](https://github.com/google-gemini/gemini-cli/pull/29397) — **Closed**  
   Addresses synthetic interrupted-response turns being appended to session history after SIGINT, timeouts, or aborted tool calls. Such entries could create context poisoning and infinite agent loops.

6. **Enforce user hold directives at the scheduler layer** — [PR #29394](https://github.com/google-gemini/gemini-cli/pull/29394) — **Closed**  
   Blocks mutating tools such as `replace`, `write_file`, and `run_shell_command` when users say “wait,” “explain first,” or “do not apply fixes yet.” This moves enforcement beyond prompt instructions and into the execution scheduler.

7. **Align OAuth callback issuer validation with RFC 9207** — [PR #29616](https://github.com/google-gemini/gemini-cli/pull/29616) — **Open**  
   Updates OAuth callback `iss` validation to match RFC 9207 and MCP authorization requirements. It requires the issuer parameter when the authentication flow requires it.

8. **Support rootless Podman sandboxes with `keep-id`** — [PR #29505](https://github.com/google-gemini/gemini-cli/pull/29505) — **Open**  
   Corrects UID/GID handling for rootless Podman sessions so the sandbox can preserve the host user’s identity and start reliably.

9. **Optimize ignore filtering and enable subtree pruning** — [PR #29582](https://github.com/google-gemini/gemini-cli/pull/29582) — **Open**  
   Adds hierarchical directory-state memoization, wildcard-directory pruning, and in-memory symlink/realpath caching. The goal is to remove multi-second discovery delays in large repositories.

10. **Avoid eager recursive expansion for `@<directory>` references** — [PR #29617](https://github.com/google-gemini/gemini-cli/pull/29617) — **Open**  
    Changes directory references so they resolve to relative workspace paths without immediately expanding into a recursive glob. This should reduce accidental context expansion and improve performance.

Additional notable work includes [PR #29387](https://github.com/google-gemini/gemini-cli/pull/29387), which prevents one malformed extension directory from breaking all extension loading, and [PR #29597](https://github.com/google-gemini/gemini-cli/pull/29597), which adds IPC fallback support for gVisor/runsc sandboxes.

## Feature Request Trends

- **More capable and reliable subagents:** Better termination semantics, recovery after turn limits, context propagation, trajectory sharing, and parallel collaboration.
- **Improved browser-agent operations:** Wayland support, persistent-session lock recovery, automatic takeover, and correct application of `settings.json`.
- **Better tool governance:** Tool scoping as ecosystems grow, bounded discovery timeouts, context-efficient file reads, and safeguards against destructive actions.
- **AST-aware code intelligence:** AST-aware search, method-level reads, and codebase mapping to improve precision and reduce token usage. See the parent discussion in [#22745](https://github.com/google-gemini/gemini-cli/issues/22745).
- **Skills and task-management improvements:** More autonomous skill/subagent selection, non-interactive skill activation, persistent file-based task tracking, and better self-knowledge of CLI commands and flags.
- **Safer, more efficient shell execution:** Rootless Podman compatibility, gVisor IPC fallback, sandboxing improvements, and controls that prevent unsafe Git or shell operations.
- **Evaluation and observability:** More stable internal evaluations, behavioral regression tests, and easier access to subagent trajectories through commands such as `/chat share`.

## Developer Pain Points

The most visible recurring frustrations are:

- **False or misleading subagent results**, especially when a subagent hits a turn limit but reports success.
- **Hangs and interruption handling**, including generalist-agent freezes, Vite prompt deadlocks, and browser-agent failures.
- **Configuration that is loaded but not honored**, as seen with Browser Agent overrides and symlinked agent definitions.
- **Context and performance pressure**, including excessive file expansion, token-heavy reads, many tools, temporary-script clutter, and slow repository discovery.
- **Insufficient observability**, especially for subagent diagnostics and reviewing or sharing subagent trajectories.
- **Safety and destructive-action concerns**, including agents applying changes after users request a pause or explanation first.
- **Browser automation fragility**, particularly on Linux/Wayland and when persistent sessions encounter stale locks.

</details>

<details>
<summary><strong>GitHub Copilot CLI</strong> — <a href="https://github.com/github/copilot-cli">github/copilot-cli</a></summary>

# GitHub Copilot CLI Community Digest — 2026-10-03

## Today's Highlights

Copilot CLI released three patch-level updates in the last 24 hours, centered on smoother terminal interaction, more reliable background-agent workflows, and improved sandboxed command execution. The main user-facing addition is a pre-conversation environment picker accessible with `Ctrl+E`, allowing developers to switch between local and cloud runs before starting a conversation.

Community activity is concentrated around MCP reliability, BYOK compatibility, context management, permissions, and terminal usability. Several newly reported regressions affect versions around `1.0.84`–`1.0.91`, particularly in OAuth, model routing, tool catalogs, and context compaction.

## Releases

### v1.0.92-3

- Added a pre-conversation `Ctrl+E` environment picker for switching between local and cloud runs.
- Improved ordering and responsiveness for keyboard, paste, and mouse input during rapid interaction.
- Added a network-bypass prompt whenever the sandbox proxy blocks a destination.
- Fixed Windows sandboxed commands to write temporary files to the granted temporary directory, allowing tools that rename temporary files into place to work correctly.

[Release v1.0.92-3](https://github.com/github/copilot-cli/releases/tag/v1.0.92-3)

### v1.0.92-2

- Fixed Windows temporary-file handling for sandboxed commands.
- Ensured prompt-mode sessions fire a single `sessionEnd` hook after Stop-hook continuations finish.

[Release v1.0.92-2](https://github.com/github/copilot-cli/releases/tag/v1.0.92-2)

### v1.0.92-1

- Added reconnection to remote MCP servers after idle Streamable HTTP sessions expire.
- Changed messaging to a running background agent so it steers the active turn at the next processing opportunity.
- Preserved the latest requests during context rollovers.
- Hid automatic sandbox CA setup from the user-facing output.

[Release v1.0.92-1](https://github.com/github/copilot-cli/releases/tag/v1.0.92-1)

## Hot Issues

### 1. Background shell completion can produce an HTTP 400

When a background shell command completes after its originating turn, a system notification may trigger an API request containing invalid `thinking` content, resulting in HTTP 400 errors. This directly affects long-running commands and background workflows.

The issue had four comments at the time of the digest and one 👍 reaction.

[Issue #4946](https://github.com/github/copilot-cli/issues/4946)

### 2. BYOK support reportedly breaks with DeepSeek

A custom BYOK configuration is reportedly failing with a `400` deserialization error involving the `custom` tool type. The report affects users configuring providers through `COPILOT_PROVIDER_BASE_URL` and may indicate a compatibility gap between Copilot CLI tool definitions and non-Copilot providers.

The issue has three comments and one reaction.

[Issue #4840](https://github.com/github/copilot-cli/issues/4840)

### 3. MCP tool calls can fail when metadata changes

A regression in `1.0.87` reportedly causes “MCP tool catalog changed” errors when an unrelated tool’s `_meta` field differs between `tools/list` responses. This is significant because it can make otherwise valid MCP tools unavailable or cause calls to fail unexpectedly.

[Issue #5044](https://github.com/github/copilot-cli/issues/5044)

### 4. Context compaction fails with GPT-6.1-SOL

Users report repeated `/compact` failures with an empty model response, preventing conversation summarization and context reduction. The issue is especially relevant for long-running sessions where context management is essential.

[Issue #5045](https://github.com/github/copilot-cli/issues/5045)

### 5. Routed-model failures can switch sessions to an incompatible fallback model

A HydraFusion session reportedly falls back from a larger routed model to a smaller-context model after a 400 error. Because the static prompt and tool set may not fit the fallback model, the session can become unusable after a transient routing or model-support failure.

[Issue #5042](https://github.com/github/copilot-cli/issues/5042)

### 6. Microsoft Entra authentication fails for remote MCP servers

Remote MCP servers protected by Microsoft Entra reportedly reject Copilot CLI’s loopback callback because each authorization attempt uses a different port. Users receive `AADSTS50011`, and the report indicates that no suitable localhost host override is available.

[Issue #5040](https://github.com/github/copilot-cli/issues/5040)

### 7. Atlassian MCP OAuth login fails even with a stored valid token

Since runtime `1.0.90-0`, Atlassian’s stateful `/v2/mcp` endpoint reportedly continues to show “Sign in” and fails with an HTTP 400 probe error despite an apparently valid stored token. This may affect teams using Atlassian remote MCP integrations.

[Issue #5014](https://github.com/github/copilot-cli/issues/5014)

### 8. Linux sandbox DNS can fail with systemd-resolved

The Linux sandbox may receive a `127.0.0.53` DNS resolver address from `systemd-resolved`, but that address is inaccessible inside the sandbox’s network namespace. The result is broken DNS despite a seemingly valid host resolver configuration.

[Issue #5027](https://github.com/github/copilot-cli/issues/5027)

### 9. Figma Code Connect data is empty through Copilot CLI

A Figma remote MCP integration reportedly returns empty Code Connect data and omits `CodeConnectSnippet` elements, while other MCP clients receive the expected data. This limits the usefulness of Figma context and may indicate differences in MCP response handling or metadata propagation.

[Issue #5025](https://github.com/github/copilot-cli/issues/5025)

### 10. Explicitly disabled skills remain unreachable

A project skill marked with `disable-model-invocation: true` appears in `copilot skill list` but returns “Skill not found” when explicitly invoked. The behavior is confusing because the skill is discoverable but not callable, and the report has attracted substantial discussion with 11 comments and 12 👍 reactions.

[Issue #4438](https://github.com/github/copilot-cli/issues/4438)

### Other notable activity

Several issues were closed during the period, including reports about workspace MCP configuration loading, clipboard rendering, BYOK reasoning-effort handling, empty MCP input schemas, MCP OAuth refresh behavior, and stale workspace configuration after reloads:

- [Issue #4832 — workspace `.mcp.json` not loaded](https://github.com/github/copilot-cli/issues/4832)
- [Issue #3172 — clipboard ownership status message](https://github.com/github/copilot-cli/issues/3172)
- [Issue #4012 — unsupported reasoning effort with GLM-5.2](https://github.com/github/copilot-cli/issues/4012)
- [Issue #1825 — empty MCP input schema failure](https://github.com/github/copilot-cli/issues/1825)
- [Issue #4562 — MCP reload reuses stale workspace config](https://github.com/github/copilot-cli/issues/4562)

## Key PR Progress

Only one pull request was updated in the last 24 hours, so there are not 10 available PRs to select.

### PR #5046 — Initial commit

This is the only recently updated PR in the supplied data. It is open and does not yet include a description or substantive review activity, so its technical scope and likely impact cannot be assessed from the available metadata.

[PR #5046](https://github.com/github/copilot-cli/pull/5046)

## Feature Request Trends

### MCP interoperability and authentication

The strongest recurring theme is the reliability of remote MCP integrations:

- OAuth callback and probe compatibility
- Token refresh and reconnect behavior
- Protocol-version negotiation
- Stable tool catalogs and metadata
- Correct workspace configuration reloads
- Support for stateful services such as Atlassian
- Compatibility with Figma’s Code Connect data

Feature requests in this area consistently focus on making MCP servers behave consistently across CLI, desktop, and other MCP clients.

### More flexible permissions and approvals

Users are seeking finer-grained permission controls, including:

- Command-pattern allow lists
- Better persistence for configured allowed directories
- Assisted approval exposed through ACP mode
- More predictable sandbox escape and network-access prompts

The recurring need is both safety and reduced prompt fatigue: users want Copilot to automate clearly safe actions without weakening controls around sensitive operations.

### Improved terminal and keyboard navigation

The `Ctrl+E` environment picker addresses a specific workflow gap, while other issues request:

- Vim/less-style navigation through chat history
- Better handling of clipboard shortcuts in specialized terminals
- More reliable keyboard and mouse behavior during rapid interaction
- Improved accessibility when mouse mode is disabled

### Context and session management

The issue tracker shows strong interest in:

- Reliable context compaction
- Better recovery after model or tool failures
- Avoiding fallback models that cannot accommodate the active prompt
- Dropping planning transcripts while preserving useful artifacts
- More stable background-agent and session lifecycle behavior

### Model-provider compatibility

BYOK users need better support across providers, particularly for:

- Custom tool schemas
- Reasoning-effort settings
- Provider-specific model behavior
- Tool and context compatibility with alternate models

### Skills and agent controls

The skill invocation issue and plan-mode request point to a broader desire for clearer control boundaries: users want skills to behave predictably when model invocation is disabled, and want planning artifacts to survive without carrying over irrelevant implementation history.

## Developer Pain Points

1. **MCP is becoming the largest reliability surface.**  
   OAuth, protocol negotiation, tool discovery, metadata, callbacks, and configuration reloads are all producing separate failure modes.

2. **Long-running and background workflows are fragile.**  
   Shell completions, remote MCP sessions, and background-agent steering can fail or lose state after asynchronous boundaries.

3. **Model routing can make a session worse rather than recover it.**  
   Automatic fallback after a model error may select a model unable to handle the existing prompt, tools, or context.

4. **Context management remains unreliable.**  
   Compaction failures and rollover-related behavior can undermine long sessions precisely when developers depend on them most.

5. **BYOK compatibility is not consistently transparent.**  
   Providers may reject tool schemas or reject reasoning settings even when the underlying model configuration appears valid.

6. **Terminal integrations expose edge cases.**  
   Clipboard ownership, alternate terminals such as Herdr, rapid input, and keyboard-only navigation still need hardening.

7. **Permissions are difficult to configure predictably.**  
   Users want safe automation without repeatedly approving routine operations, and they expect configured allowed directories to behave consistently across session startup and runtime.

</details>

<details>
<summary><strong>OpenCode</strong> — <a href="https://github.com/anomalyco/opencode">anomalyco/opencode</a></summary>

# OpenCode Community Digest — 2026-10-03

## 1. Today’s Highlights

The dominant issue is a widespread failure of OpenCode Console/Zen free-tier models, with many users reporting the misleading error: **“OpenCode's free tier can only be used from within OpenCode”** across the official CLI, desktop apps, Linux, Windows, macOS, and Termux. Meanwhile, several fixes are progressing for V2 reliability, including GitLab Duo self-managed support, Windows UTF-8 handling, TUI stability, web UI CSP behavior, and managed-service recovery; no new release was published in the last 24 hours.

## 3. Hot Issues

1. **[Console free tier rejected inside OpenCode](https://github.com/anomalyco/opencode/issues/49433)**  
   A long-running issue affecting all free-tier models, including official clients, is drawing substantial discussion with 59 comments and 15 likes. Related reports were opened or updated across desktop, CLI, Zen, and Termux environments, indicating a likely authentication, provider-routing, or Console configuration problem rather than a user-facing setup error.

2. **[Unbounded SQLite event-table growth](https://github.com/anomalyco/opencode/issues/33356)**  
   The V2 local database can exceed 13 GB because event snapshots are never pruned or compacted. The issue is particularly important for long-running or server deployments, where disk exhaustion can become an operational outage; it has 38 comments and 12 likes.

3. **[Pay Go with crypto](https://github.com/anomalyco/opencode/issues/23153)**  
   This long-standing feature request proposes cryptocurrency payment for OpenCode Go. It is the most positively received request in the issue set, with 55 likes and 24 comments, signaling strong community interest in alternative billing and payment options.

4. **[Go quota usage appears higher than displayed cost](https://github.com/anomalyco/opencode/issues/42985)**  
   Users are reporting a discrepancy between usage-graph costs and Go quota consumption for DeepSeek V4 Flash. The report raises concerns about quota transparency, billing predictability, and whether discounts or usage accounting are being applied consistently.

5. **[PowerShell output encoding breaks non-ASCII characters](https://github.com/anomalyco/opencode/issues/23636)**  
   Non-ASCII filenames and output are garbled on Windows under Chinese, Japanese, and Korean locales because PowerShell output encoding is not normalized. The issue has 16 comments and 5 likes and is especially relevant to internationalized developer environments.

6. **[GitLab Duo fails on self-managed instances](https://github.com/anomalyco/opencode/issues/50843)**  
   GitLab Duo workflows lack the working-directory and project context required by self-managed GitLab, and expired OAuth-token refresh may also be problematic. The issue has 13 comments and is being addressed directly by a linked implementation PR.

7. **[Todo list becomes stale or leaks between tasks](https://github.com/anomalyco/opencode/issues/41359)**  
   The desktop todo dock can remain stuck on an old task for multiple turns and carry stale items into new sessions. This affects trust in agent progress visibility; a focused fix is now under review.

8. **[Embedded web UI blocks blob iframes](https://github.com/anomalyco/opencode/issues/50828)**  
   The embedded UI’s CSP omits `frame-src`, causing `blob:` iframes used by the icon renderer to be blocked. The result is missing or broken icons, with 5 comments and a corresponding PR awaiting review.

9. **[Free usage reset time is not shown](https://github.com/anomalyco/opencode/issues/52894)**  
   When users reach the free limit, the interface reports that the limit was reached without displaying the exact reset time. The request targets a common usability and quota-management problem, especially for users scheduling unattended agent runs.

10. **[Migrated V1 sessions do not open in the V2 TUI](https://github.com/anomalyco/opencode/issues/52924)**  
    Sessions migrated from V1 appear in the TUI but fail to open, and are missing from project-scoped session lists after migration. Although the data migration itself appears successful, the discovery and selection paths are inconsistent, creating a significant upgrade regression.

## 4. Key PR Progress

1. **[fix(core): route live Bus events before Location fanout](https://github.com/anomalyco/opencode/pull/52922)**  
   Routes live bus events before location fanout to improve behavior when many project directories are loaded. This is a targeted V2 event-delivery fix related to #52921.

2. **[fix(provider): correct Bedrock cache-point placement](https://github.com/anomalyco/opencode/pull/36532)**  
   Prevents Bedrock cache breakpoints from being placed after reasoning blocks in Anthropic extended-thinking requests. The fix should improve prompt-cache compatibility and reduce provider-side request errors.

3. **[feat: adjustable desktop and web font settings](https://github.com/anomalyco/opencode/pull/27684)**  
   Adds configurable font size and line-height controls for Desktop and Web. This is a long-running usability enhancement addressing multiple existing display-related feature requests.

4. **[fix(nix): use Effect CLI completion flags](https://github.com/anomalyco/opencode/pull/50409)**  
   Updates the Nix package to use Effect CLI’s `--completions <shell>` syntax instead of the removed Yargs completion command. The PR is closed and resolves the Nix build failure described in #50408.

5. **[fix: support GitLab Duo on self-managed instances](https://github.com/anomalyco/opencode/pull/50844)**  
   Uses the configured self-managed GitLab instance and addresses workflow context and authentication-refresh issues. It directly targets #50843 and is one of the most operationally relevant integrations in the current queue.

6. **[feat(plugin): expose integration.connection.activate](https://github.com/anomalyco/opencode/pull/52797)**  
   Enables server plugins to activate a saved integration connection rather than only listing connections. This expands the capabilities of the V2 plugin model and closes the gap identified in #51410.

7. **[fix(tui): keep transcript rows stable when history is prepended](https://github.com/anomalyco/opencode/pull/52824)**  
   Uses stable row identity when older transcript history is loaded, preventing rows from remounting and causing blank markdown or visual blinking. The PR is closed and addresses a notable session-history UX regression.

8. **[fix: allow blob frames and objects in embedded UI CSP](https://github.com/anomalyco/opencode/pull/51636)**  
   Adds appropriate CSP allowances for `blob:` frames and objects so embedded icon rendering works correctly. The PR remains open and directly addresses #50828.

9. **[fix(app): clear todo dock after fade-out](https://github.com/anomalyco/opencode/pull/52813)**  
   Clears the todo dock after the last item completes rather than merely hiding it, preventing stale tasks from reappearing in subsequent sessions. It targets the persistent todo-state issue in #41359.

10. **[refactor(ai): avoid redundant request-body validation](https://github.com/anomalyco/opencode/pull/52909)**  
    Reuses `ProviderShared.encodeJson` and removes a second schema-validation pass after route compilation. The refactor should reduce unnecessary work in request preparation and simplify provider transport handling.

## 6. Feature Request Trends

- **Billing flexibility and transparency:** Crypto payments, clearer quota consumption, and exact free-tier reset times are prominent requests.
- **Reliable free-tier access:** The Console/Zen authentication failure has generated a large volume of related reports, making provider availability and billing-state visibility the strongest current theme.
- **V2 compatibility and migration:** Users are asking for stable todo behavior, accessible migrated V1 sessions, and smoother transitions between the two major versions.
- **Better agent orchestration:** The requested ability for subagents to ask questions to the parent session instead of directly interrupting users points toward more controllable multi-agent workflows.
- **Plugin extensibility:** Server plugins need stronger integration lifecycle controls, including activating connections and read-only access to historical execution changesets.
- **UI customization and correctness:** Font and line-height controls, stable transcript rendering, correct todo state, and working embedded icons are recurring frontend priorities.
- **Enterprise/self-managed support:** GitLab Duo workflow support is a notable example of demand for parity between hosted and self-managed infrastructure.

## 7. Developer Pain Points

- **Unclear authentication and quota behavior:** The free-tier error is especially confusing because it appears even when requests are being made from official OpenCode clients. Users need actionable diagnostics and clearer distinction between authentication failure, provider eligibility, quota exhaustion, and client-environment detection.
- **Unbounded local storage:** V2’s event-sourcing database lacks visible retention or compaction controls, creating disk-exhaustion risk for persistent installations.
- **V2 migration regressions:** Migrated sessions, todo state, and runtime tool behavior show that upgrade compatibility needs stronger end-to-end testing.
- **Cross-platform encoding and process issues:** Windows PowerShell output, terminal mouse mode, package-manager upgrade resolution, and subprocess behavior continue to generate platform-specific failures.
- **Embedded UI security-policy friction:** CSP restrictions that improve security can break legitimate local rendering paths such as blob-based icon iframes; the project needs a deliberate, documented compatibility policy.
- **Billing observability:** Users want a transparent relationship between displayed model cost, discounts, quota consumption, and subscription limits—especially for OpenCode Go and Zen.

</details>

<details>
<summary><strong>Pi</strong> — <a href="https://github.com/earendil-works/pi">earendil-works/pi</a></summary>

# Pi Community Digest — 2026-10-03

## Today’s Highlights

The community’s focus was squarely on **long-running-session reliability and TUI performance**, with reports of excessive CPU, full-transcript rerenders, terminal redraw storms, and degraded typing in sessions with hundreds of messages. Provider compatibility remained active, including OpenAI/Codex tool-call transitions, Bedrock thinking-block replay, OAuth identity persistence, and a malformed OpenRouter tool call that can permanently wedge a session.

## Hot Issues

1. **High CPU usage on macOS in long sessions** — [#7730](https://github.com/earendil-works/pi/issues/7730)  
   Pi reportedly reaches 100%+ CPU while memory grows to 600–800 MB, apparently scaling with context or session length. The issue has 18 comments and 10 reactions, making it one of the strongest signals for prioritizing agent-loop and context-management performance.

2. **ChatGPT OAuth ID token is not persisted** — [#10300](https://github.com/earendil-works/pi/issues/10300)  
   The login flow receives an ID token but omits it when saving credentials, preventing extensions from accessing the authenticated account’s identity. With 13 comments in two days, this highlights a broader need for stable, well-defined extension-facing authentication APIs.

3. **Full-screen redraw storm in long transcripts** — [#9255](https://github.com/earendil-works/pi/issues/9255)  
   Streaming updates above the viewport trigger a full redraw nearly every frame, causing violent jumps and doubled text in large transcripts. Its 10-comment discussion indicates that correctness and rendering performance are now tightly coupled pain points.

4. **TUI lag in sessions with 800+ messages** — [#9807](https://github.com/earendil-works/pi/issues/9807)  
   Full scrollback rerendering makes both typing and navigation noticeably slow in an 814-message, 1.7 MB session. The report highlights a need for incremental, cell-level diffing rather than repeatedly processing the entire transcript.

5. **Switching to Codex fails with a custom-tool ID error** — [#10257](https://github.com/earendil-works/pi/issues/10257)  
   A mid-chat switch from Muse to GPT-6.1 Sol replays `fc_`-prefixed calls as `custom_tool_call`, while the endpoint expects a `ctc_` ID. This blocks model switching and highlights the difficulty of normalizing provider-specific tool-call formats.

6. **Auto-compaction does not start in CLI mode** — [#10330](https://github.com/earendil-works/pi/issues/10330)  
   The report says automatic compaction never begins in JSON/CLI runs, despite working reliably in the TUI. This is significant for unattended agent workflows, where context growth directly affects reliability and cost.

7. **Aborting tools leaves unanswered tool calls in history** — [#9986](https://github.com/earendil-works/pi/issues/9986)  
   Tool calls after the abort point disappear without responses, producing an invalid or ambiguous transcript. The problem affects sequential execution and threatens session replay, resumption, and provider compatibility.

8. **Context usage massively overestimates usage after a network retry** — [#10287](https://github.com/earendil-works/pi/issues/10287)  
   A retryable WebSocket/fetch error reportedly causes `getContextUsage()` to jump from roughly 42K to 330K tokens. This can trigger premature compaction, misleading UI, and incorrect cost or capacity decisions.

9. **Malformed OpenRouter/GLM tool call permanently wedges the session** — [#10299](https://github.com/earendil-works/pi/issues/10299)  
   An empty `tool_calls` entry is saved and replayed, causing every subsequent request to fail. The report includes a proposed fix and suggests Pi should defensively reject or repair malformed provider output.

10. **Too many input images stop an agent task** — [#10162](https://github.com/earendil-works/pi/issues/10162)  
    Adding many images appears to halt long-running agent work, potentially preventing the auto-compaction loop from progressing. The issue is especially relevant to visual QA, screenshot-driven development, and other multimodal automation.

Additional community signal came from the Windows usage thread, [#7547](https://github.com/earendil-works/pi/issues/7547), which reached 72 comments and 2 reactions. Discussion continues around supported launch paths, shell integration, extension behavior, and which Windows responsibilities belong in core versus external tools.

## Key PR Progress

1. **Improve TUI diff performance** — [PR #10383](https://github.com/earendil-works/pi/pull/10383)  
   Diffs raw lines while preserving pointer equality, allowing unchanged lines to skip expensive comparisons. The PR is closed but directly targets the long-session rendering problems in [#9255](https://github.com/earendil-works/pi/issues/9255) and [#9807](https://github.com/earendil-works/pi/issues/9807).

2. **Native llama.cpp classifier support** — [PR #10382](https://github.com/earendil-works/pi/pull/10382)  
   Probes loaded llama.cpp models through `/v1/systemone` and recognizes decision models as classifiers rather than chat models. This broadens Pi’s support for local routing and decision models.

3. **Azure Foundry Chat Completions deployments** — [PR #9714](https://github.com/earendil-works/pi/pull/9714)  
   Extends the Azure provider beyond Responses API deployments, including support for Chat Completions models such as DeepSeek V4 Pro. The PR remains open.

4. **Handle mismatched Bedrock thinking blocks** — [PR #10328](https://github.com/earendil-works/pi/pull/10328)  
   Uses Bedrock’s binding controls to drop thinking blocks whose signatures no longer match the current system prompt or tool set, avoiding 400 responses. It is closed following [#10324](https://github.com/earendil-works/pi/issues/10324).

5. **Deduplicate reused tool-call IDs** — [PR #10397](https://github.com/earendil-works/pi/pull/10397)  
   Removes duplicate OpenAI-compatible tool calls when a provider reuses the same `(call_id, id)` pair. The fix improves resilience to providers that mutate a repeated function call.

6. **Add Bedrock long-context pricing tiers** — [PR #10329](https://github.com/earendil-works/pi/pull/10329)  
   Adds OpenAI’s long-context tier for Bedrock GPT models: requests beyond 272K tokens are charged at higher input/cache and output rates. This improves cost reporting for long-running agents.

7. **Keep hidden tools out of rules and skill hints** — [PR #10368](https://github.com/earendil-works/pi/pull/10368)  
   Ensures tools excluded from the model-visible `<tools>` declaration are not referenced in rules or skill hints. This closes a prompt inconsistency where models were told to use capabilities they could not see.

8. **Normalize streaming reasoning-token accounting** — [PR #10365](https://github.com/earendil-works/pi/pull/10365)  
   Folds disjoint streaming `reasoning_tokens` into output usage for OpenAI-compatible gateways. The change addresses inconsistent usage reporting between streaming and non-streaming modes.

9. **Add Cloudflare Clef classifiers to Workers AI** — [PR #10316](https://github.com/earendil-works/pi/pull/10316)  
   Adds the 27B Clef and 9B Clef Flash decision models to the catalog, with pricing and context metadata. It expands lightweight local/cloud-hosted classification options.

10. **Fix multiline syntax highlighting** — [PR #10361](https://github.com/earendil-works/pi/pull/10361)  
    Applies active syntax formatting to every rendered line of a multiline token, preserving colors after the TUI splits output into separate rows. A related open PR, [#10356](https://github.com/earendil-works/pi/pull/10356), also adjusts interpolation styling.

Also notable: [PR #10346](https://github.com/earendil-works/pi/pull/10346) fixes a possible infinite loop caused by signed parsing of oversized WebP RIFF chunks, while [PR #10332](https://github.com/earendil-works/pi/pull/10332) updates `brace-expansion` to `5.0.12` to address a known vulnerability.

## Hot Discussions

### Ideas

- **Disable the share feature** — [Discussion #10128](https://github.com/earendil-works/pi/discussions/10128)  
  The proposal seeks a way to opt out of sharing, reflecting demand for stronger local-first and privacy controls. The discussion had 2 comments and 3 reactions.

- **Working memory as prompt sections** — [Discussion #10151](https://github.com/earendil-works/pi/discussions/10151)  
  The author proposes prompt sections for active tasks and past-session memory, with the session log closing the loop. It suggests a richer distinction between capability context, task state, and historical memory.

### Q&A

- **Codemode benchmarks and token savings** — [Discussion #10230](https://github.com/earendil-works/pi/discussions/10230)  
  Community interest centers on the new codemode “only” mode and whether it reduces token usage through action fusion or similar techniques. There are 2 comments and 1 reaction, with no benchmark data yet.

### Show and Tell

No new show-and-tell discussions were reported.

## Feature Request Trends

- **Scalable long-session UX:** Incremental TUI rendering, stable redraw behavior, and responsive typing/scrolling are the dominant requests.
- **Reliable agent lifecycle management:** Abort handling, valid tool-call history, auto-compaction in CLI mode, and robust retries are recurring needs.
- **Provider portability:** Users want reliable switching among Codex, Bedrock, OpenRouter, Azure, and other OpenAI-compatible endpoints.
- **Better multimodal workflows:** More input images and image rendering in long sessions expose limitations in both context management and terminal presentation.
- **Extension observability and safety:** Authentication identity, extension logging, background prompts, and lifecycle events need more predictable behavior.
- **Privacy controls:** Community members are asking for the ability to disable sharing and retain tighter control over session data.
- **Local classifier support:** Native llama.cpp and Workers AI classifier integrations point toward cheaper, specialized routing without full chat-model calls.
- **Better memory architecture:** Discussions and issues both suggest separating active tasks, past-session knowledge, and capability instructions rather than flattening them into one prompt.

## Developer Pain Points

The recurring frustration is that Pi works well for interactive, moderate-length sessions but becomes less predictable as sessions grow. Large transcripts expose rendering bottlenecks, high CPU usage, image failures, and slow navigation. Long-running or unattended workflows are also vulnerable to context-accounting errors, missing auto-compaction, malformed tool calls, and aborts that leave incomplete history.

At the platform level, developers are navigating inconsistent provider behavior: OAuth credentials lose identity data, model switching breaks tool-call IDs, Bedrock rejects stale thinking signatures, and OpenRouter can return a malformed call that wedges the entire session. Finally, extensions and terminal integrations need stronger guarantees—console output can corrupt the TUI, background prompts may be dropped, and Windows extension management has reportedly broken the global installation in at least one report ([#10399](https://github.com/earendil-works/pi/issues/10399)).

</details>

<details>
<summary><strong>Qwen Code</strong> — <a href="https://github.com/QwenLM/qwen-code">QwenLM/qwen-code</a></summary>

# Qwen Code Community Digest — 2026-10-03

## Today's Highlights

Managed Agent development remains the dominant theme, with active work across hosted workspaces, runtime-session recovery, memory, background shell execution, and durable host-result handling. Reliability and operational safety are also prominent: several high-priority bugs concern token-window enforcement, session deletion, host credential lifecycle, and context-rule re-injection.

A new nightly release includes core Code Mode and permission-related fixes, alongside broader ongoing stabilization of managed-agent and Web Shell behavior.

## Releases

### [v0.24.7-nightly.20261002.a011f66944](https://github.com/QwenLM/qwen-code/releases/tag/v0.24.7-nightly.20261002.a011f66944)

- **Core:** Aligned Code Mode text with lazy tool discovery ([#12990](https://github.com/QwenLM/qwen-code/pull/12990)).
- **Permissions:** Added changes to honor approved permission flows; the supplied release notes are truncated, so the complete behavior is not available here.
- This is a **nightly build** and should be treated as a testing release rather than a stable deployment target.

## Hot Issues

1. **[Proposal: Managed Agent dual-path architecture and staged delivery](https://github.com/QwenLM/qwen-code/issues/12380)**  
   This P2 discussion has generated **43 comments**, the highest reaction in the issue set. It proposes separating model inference from tool-environment provisioning while giving Sessions durable ownership of workspaces, recoverable tool executions, and a stable web-service interface. The strong discussion indicates that Managed Agent architecture is a central roadmap concern.

2. **[Non-conversation context token governance](https://github.com/QwenLM/qwen-code/issues/12028)**  
   This in-progress P2 issue focuses on the recurring cost of system prompts, tool schemas, `QWEN.md` files, and skill listings. With **18 comments**, it highlights the need for visibility and control over non-conversation context, especially for long-context models where these inputs can dominate request cost.

3. **[Daily dependency CVE audit failed](https://github.com/QwenLM/qwen-code/issues/13078)**  
   The scheduled dependency audit is currently failing, with **7 comments**. The issue is still needs-triage, so maintainers must determine whether this reflects a newly discovered vulnerability, audit-service unavailability, or CI infrastructure instability.

4. **[Path-conditional rules are not re-injected after context eviction](https://github.com/QwenLM/qwen-code/issues/13259)**  
   This new P2 bug reports that `.qwen/rules/*.md` rules with `paths:` globs are marked as consumed even when their reminder is later evicted from context. The problem can cause required repository rules to disappear from the model’s active context; the issue already has **4 comments** and is particularly relevant to rule-based coding workflows.

5. **[Managed session stores and panel projection grow without bound](https://github.com/QwenLM/qwen-code/issues/13184)**  
   This P2 issue identifies unbounded growth in managed-agent persistence and UI projection layers, including session events and panel data. It has **5 comments** and matters for long-running deployments because uncontrolled retention can increase storage, memory, and synchronization costs.

6. **[Agent Host: out-of-workspace calls terminate the run before confinement enforcement](https://github.com/QwenLM/qwen-code/issues/13157)**  
   In `qwen serve --join` Agent Host mode, an out-of-workspace tool call reaches the permission flow before the confinement guard. Because the host has no interactive client to approve the request, the run ends prematurely. The issue has **6 comments** and is a security and availability concern for managed execution.

7. **[Deleting a live session can permanently corrupt transcript history](https://github.com/QwenLM/qwen-code/issues/12091)**  
   This P1 bug describes `sessions/delete` unlinking a transcript while the runtime writer remains attached. The writer can recreate the JSONL file with a non-null parent reference, leaving the session degraded and auto-continue disabled. Six comments reflect the severity of the potential data-integrity impact.

8. **[Late host results are acknowledged but usage is lost](https://github.com/QwenLM/qwen-code/issues/13238)**  
   This P2 managed-agent issue concerns a result arriving after terminal settlement. The coordinator treats it as already applied and drops incurred token usage. With **4 comments**, it represents a correctness and accounting problem for distributed agent runs.

9. **[Host re-enrollment leaves stale host rows with valid credentials](https://github.com/QwenLM/qwen-code/issues/13122)**  
   Re-enrollment after a 401 mints a new host ID and secret but does not deduplicate the existing host entry. The stale row can retain a still-valid credential, creating lifecycle and credential-management risk. The issue has **5 comments** and is important for secure host rotation.

10. **[Managed-agent real-model E2E test fails out of the box](https://github.com/QwenLM/qwen-code/issues/13258)**  
    This P2 test issue reports that the documented real-model mode of `run-managed-agent-server-e2e.ts` no longer passes on current `main`. It has **3 comments** and limits confidence in the Managed Agent server’s end-to-end validation, particularly around the hosted-harness contract.

## Key PR Progress

1. **[PR #13263 — Repair real-model managed-agent E2E mode](https://github.com/QwenLM/qwen-code/pull/13263)**  
   Updates the managed-agent server E2E runner to match the current Hosted Harness contract and restores the documented real-model test path. This directly addresses [#13258](https://github.com/QwenLM/qwen-code/issues/13258).

2. **[PR #13241 — Distinguish accepted host results from terminal runs](https://github.com/QwenLM/qwen-code/pull/13241)**  
   Improves idempotent result handling: exact retries are acknowledged only when their durable receipts match, while late results can update usage without incorrectly changing terminal state. This is important for reliable distributed execution and addresses [#13238](https://github.com/QwenLM/qwen-code/issues/13238).

3. **[PR #13173 — Adopt the Runtime Session on passive takeover](https://github.com/QwenLM/qwen-code/pull/13173)**  
   Ensures that a passive hosted-turn takeover acquires the dead owner’s Runtime Session before inspecting or releasing it. The change is intended to make cancellation and takeover sequencing safer and more recoverable.

4. **[PR #13206 — Harden Web Shell managed SSE handling](https://github.com/QwenLM/qwen-code/pull/13206)**  
   Adds client-side handling for corrupt SSE frames and merges gap-resync operations. This is useful for recovering from proxy rewriting, truncated frames, or future serialization changes affecting the managed-agent session panel.

5. **[PR #13166 — Add glob support to hosted-workspace profiles](https://github.com/QwenLM/qwen-code/pull/13166)**  
   Introduces read-only `glob` support through versioned `hosted-workspace-files/2` and `hosted-workspace-shell/2` profiles. The model-facing profile controls tool exposure, while the worker capability identity is updated accordingly.

6. **[PR #13158 — Add opt-in memory-selection skipping](https://github.com/QwenLM/qwen-code/pull/13158)**  
   Adds an opt-in experiment that skips memory selection when a fast lookup contains one clear title or keyword match whose body is not already in context. The change preserves deduplication and records the decision in recall logs for later analysis.

7. **[PR #13156 — Keep `MEMORY.md` index links resolvable](https://github.com/QwenLM/qwen-code/pull/13156)**  
   Fixes truncation that could cut through Markdown link targets when titles pushed the closing syntax beyond the 150-character limit. This prevents managed-memory index entries from becoming unusable.

8. **[PR #12183 — Load deployment-managed extensions from a directory](https://github.com/QwenLM/qwen-code/pull/12183)**  
   Adds `--managed-extensions <root>` support for the CLI and daemon. Qwen Code discovers complete extension packages in direct child directories and loads their contributions in place, while deployment providers own package files and users retain activation preferences.

9. **[PR #13262 — Defer ComposerTagWidget React-root unmounting](https://github.com/QwenLM/qwen-code/pull/13262)**  
   Defers unmounting of both ComposerTagWidget React roots at all cleanup sites, reducing the risk of race-related teardown errors. This is a focused Web Shell/UI robustness improvement.

10. **[PR #13140 — Harden settings failures and sandbox command streams](https://github.com/QwenLM/qwen-code/pull/13140)**  
    Includes fixes for native partial-read input accounting and sandbox command-stream handling, with additional CI validation. The PR reports extensive local test coverage and platform-specific acceptance work, making it a broad reliability hardening effort.

Additional notable work includes the [background Shell and Monitor runtime design](https://github.com/QwenLM/qwen-code/pull/13265), [managed-memory Markdown-style correction](https://github.com/QwenLM/qwen-code/pull/13158), and [CI lint-lane safeguards](https://github.com/QwenLM/qwen-code/pull/12650).

## Feature Request Trends

### Managed and distributed agents

The largest direction is the evolution of Qwen Code into a durable, remotely managed agent platform. Requests and active work cover:

- Managed Agent dual-path execution and staged delivery ([#12380](https://github.com/QwenLM/qwen-code/issues/12380)).
- Hosted workspace tooling, including read-only `glob` support ([#13166](https://github.com/QwenLM/qwen-code/pull/13166)).
- Background Shell and Monitor capabilities ([#13265](https://github.com/QwenLM/qwen-code/pull/13265)).
- Media delivery through Managed Runtime provider workers ([#13039](https://github.com/QwenLM/qwen-code/issues/13039)).
- Multi-agent orchestration, subagents, and durable session ownership.

### Memory and context management

Developers are increasingly focused on controlling token cost and preserving useful context:

- Governance and visibility for system prompts, tool schemas, rules, and skill listings ([#12028](https://github.com/QwenLM/qwen-code/issues/12028)).
- Better memory-recall selection ([#13158](https://github.com/QwenLM/qwen-code/pull/13158)).
- Bounded cooldown behavior for no-op memory extraction ([#13004](https://github.com/QwenLM/qwen-code/issues/13004)).
- Correct path-rule reinjection after context eviction ([#13259](https://github.com/QwenLM/qwen-code/issues/13259)).
- Window-aware output budgeting for side and main queries ([#13208](https://github.com/QwenLM/qwen-code/issues/13208), [#13252](https://github.com/QwenLM/qwen-code/issues/13252)).

### Deployment, extensions, and integrations

There is strong interest in making Qwen Code deployable in controlled environments:

- Deployment-managed extensions ([#12183](https://github.com/QwenLM/qwen-code/pull/12183)).
- Feishu integration and inbound file handling ([#13170](https://github.com/QwenLM/qwen-code/pull/13170), [#13220](https://github.com/QwenLM/qwen-code/issues/13220)).
- Email channels using IMAP/SMTP, though the original request is now closed ([#8281](https://github.com/QwenLM/qwen-code/issues/8281)).
- Mobile connection and session recovery ([#12247](https://github.com/QwenLM/qwen-code/pull/12247)).

### Web Shell and terminal usability

Feature requests include keyboard shortcuts for Session Overview and Split View ([#13175](https://github.com/QwenLM/qwen-code/issues/13175)), clearer “Thinking” versus “Done” states ([#13261](https://github.com/QwenLM/qwen-code/issues/13261)), and improved viewport alignment for short terminal conversations ([#9305](https://github.com/QwenLM/qwen-code/pull/9305)).

## Developer Pain Points

- **Managed-agent reliability:** Live-session deletion, late host results, passive takeover, credential rotation, and E2E drift continue to affect distributed execution.
- **Context and token efficiency:** The system increasingly needs explicit accounting for non-conversation context, side-query output limits, memory extraction cadence, and rule reinjection.
- **Security boundaries:** Agent Host confinement ordering and stale credentials after re-enrollment are prominent concerns.
- **Unbounded persistence:** Managed sessions and UI projections need retention and compaction policies suitable for long-running services.
- **CI and test reliability:** Dependency-audit failures, flaky hosted-workspace tests, Feishu test isolation, and managed-agent real-model tests are all receiving active attention.
- **Environment compatibility:** TLS behavior differs across Electron/BoringSSL, Node/OpenSSL, VS Code, and Linux carrier links, creating deployment-specific connectivity issues ([#13234](https://github.com/QwenLM/qwen-code/issues/13234)).
- **Non-interactive operation:** Startup, permission, and sandbox failure messages need to remain actionable when there is no interactive terminal or user prompt.

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*