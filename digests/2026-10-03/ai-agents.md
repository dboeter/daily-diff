# OpenClaw Ecosystem Digest 2026-10-03

> Issues: 500 | PRs: 500 | Projects covered: 5 | Generated: 2026-10-03 08:33 UTC

- [OpenClaw](https://github.com/openclaw/openclaw)
- [Hermes Agent](https://github.com/nousresearch/hermes-agent)
- [IronClaw](https://github.com/nearai/ironclaw)
- [QwenPaw](https://github.com/agentscope-ai/QwenPaw)
- [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw)

---

## OpenClaw Deep Dive

# OpenClaw Project Digest — 2026-10-03

## 1. Today's Overview

OpenClaw remains highly active, with **500 issues** and **500 pull requests** updated in the last 24 hours; **321 issues remain open/active** and **179 were closed**, while **284 pull requests remain open** and **216 were merged or closed**. Two releases were published, including **v2026.9.8** and the gateway-only **v2026.8.35 extended-stable** release. The project is making visible progress across session lifecycle performance, memory tooling, channel reliability, diagnostics, and security-sensitive gateway routing, but the current issue mix shows elevated operational risk in SQLite, plugin capture, worker memory, process cleanup, and session-state management. Overall health is **active but strained**: development throughput is high, yet several P0/P1 regressions and unrecovered release-blocking issues remain open.

## 2. Releases

### [v2026.9.8](https://github.com/openclaw/openclaw/releases/tag/v2026.9.8)

- Published as the latest main release.
- Contains **58 commits**, **43 pull requests**, and contributions from **21 contributors**.
- The supplied release data points to the project’s release notes/changelog but does not expose enough detailed change content to enumerate feature-level changes.
- Based on the issue and PR activity around the 2026.9.x line, operators should assume that this release is still associated with ongoing work around:
  - session database and SQLite performance,
  - plugin capture cleanup,
  - model-catalog worker memory use,
  - gateway restart and shutdown reliability,
  - hot-reload and session ownership behavior.
- The project’s update/repair tracking issue indicates that upgrade, migration, rollback, Doctor, and restart behavior remain an active area of risk: [issue #145252](https://github.com/openclaw/openclaw/issues/145252).

### [v2026.8.35](https://github.com/openclaw/openclaw/releases/tag/v2026.8.35)

- Described as a **gateway-only `extended-stable` release**, the project’s current equivalent to LTS.
- Includes critical security updates, reliability and performance fixes, and additional model support relative to the end-of-August 2026 baseline.
- This provides a potentially lower-risk deployment option for production gateways, but users should still validate channel credentials, update behavior, and session/database migrations in staging.

**Migration and breaking-change note:** No explicit breaking-change list is included in the supplied data. Given the number of P0/P1 issues involving 2026.9.x, operators should test upgrades incrementally, retain rollback options, and run update diagnostics before switching stable deployments to the newer release.

## 3. Project Progress

The data shows substantial implementation activity, although the listed pull requests are mostly still open and awaiting maintainer review rather than confirmed as merged today.

### Gateway and session infrastructure

- [PR #164075](https://github.com/openclaw/openclaw/pull/164075) routes pairing, approval listing, and default approval edits through the live gateway owner instead of directly accessing the installation’s SQLite state. This is a security-sensitive change intended to avoid concurrent access and preserve live ownership semantics.
- [PR #163815](https://github.com/openclaw/openclaw/pull/163815) moves session creation, reset, and deletion off the Gateway main thread and adds more specific lifecycle diagnostics. This directly targets the open class of large-session-store stalls.
- [PR #119055](https://github.com/openclaw/openclaw/pull/119055) works on durable waiting-result ownership across retries, addressing stale or foreign session/SQLite ownership in Code Mode continuations.
- [PR #126263](https://github.com/openclaw/openclaw/pull/126263) binds completion refresh to task ownership so a replacement subagent run cannot be mistaken for a newer completion.
- [PR #164175](https://github.com/openclaw/openclaw/pull/164175) fixes Claude CLI agents forgetting already-announced subagent results on the following turn.

### Reliability, diagnostics, and security

- [PR #164171](https://github.com/openclaw/openclaw/pull/164171) fixes background execution timeouts that produce no output never waking the session.
- [PR #164169](https://github.com/openclaw/openclaw/pull/164169) preserves recognized schema-worker causes in update reports instead of losing them behind private paths or warnings.
- [PR #162262](https://github.com/openclaw/openclaw/pull/162262) corrects update/repair reporting so crash-loop suppression is not incorrectly reported as healthy recovery.
- [PR #141271](https://github.com/openclaw/openclaw/pull/141271) redacts credentials from Codex dynamic-tool error content.
- [PR #164040](https://github.com/openclaw/openclaw/pull/164040) rechecks TLS trust during explicit Android gateway reconnects.
- [PR #164136](https://github.com/openclaw/openclaw/pull/164136) allows Slack accounts to recover from startup `auth.test` failures without waiting for a reconnect or inbound event.

### Memory, logging, and channel behavior

- [PR #163693](https://github.com/openclaw/openclaw/pull/163693) adds optional memory embedding configuration during onboarding or later configuration.
- [PR #164130](https://github.com/openclaw/openclaw/pull/164130) prevents Logbook idle analysis ticks from repeatedly scanning completed history.
- [PR #120119](https://github.com/openclaw/openclaw/pull/120119) preserves encoded image filenames when delivery transforms the underlying image format.
- [PR #127309](https://github.com/openclaw/openclaw/pull/127309) makes WhatsApp group gating honor `implicitMentions`.
- [PR #164173](https://github.com/openclaw/openclaw/pull/164173) removes legacy Telegram reply-cache fallback behavior.
- [PR #164177](https://github.com/openclaw/openclaw/pull/164177) is a broad logging and diagnostic-wrapper refactor across gateway, agents, channels, and apps.

### Performance

- [PR #164128](https://github.com/openclaw/openclaw/pull/164128) removes unrelated warm-image cleanup from the Crabbox worker allocation path.
- [PR #137184](https://github.com/openclaw/openclaw/pull/137184) allows compaction to summarize in one pass when the complete history fits within the summarizer window.
- [PR #164048](https://github.com/openclaw/openclaw/pull/164048) stops stale device workers from repeatedly probing and generating warnings after a device is unavailable.

**Assessment:** The PR pipeline is clearly attacking the project’s major architectural bottlenecks, particularly session ownership, worker lifecycle, and large local state. However, the number of open PRs and several “needs proof” or “waiting on author” labels indicate that review, compatibility testing, and proof requirements remain substantial.

## 4. Community Hot Topics

### Most active issues

1. **[#143524 — Agent SQLite WAL grows to 1.4–2.8 GB](https://github.com/openclaw/openclaw/issues/143524)** — **104 comments**, P0, crash-loop and release-blocker impact.  
   The core need is dependable database lifecycle management. Users need bounded WAL growth, reliable checkpointing, and predictable startup behavior on Windows and other high-write installations. The unusually high comment count suggests significant operator concern and possible multiple affected deployments.

2. **[#144911 — MCP initialization timeout crashes the Gateway](https://github.com/openclaw/openclaw/issues/144911)** — **31 comments**, closed.  
   A failing stdio MCP server can trigger an unhandled promise rejection in child cleanup and terminate the entire Gateway. This highlights the need for strict isolation: one misbehaving child process or MCP initialization should not be able to take down the whole runtime.

3. **[#119720 — Synchronous persistence and transcript maintenance block the event loop](https://github.com/openclaw/openclaw/issues/119720)** — **21 comments**, P1.  
   Large installs are exposing the central scaling tension: OpenClaw’s durable session model is valuable for recovery, but synchronous SQLite and transcript work can block the Gateway’s event loop. The community is seeking architectural rather than one-off fixes.

4. **[#102175 — Embedded prompt cache breaks across session boundaries](https://github.com/openclaw/openclaw/issues/102175)** — **21 comments**, P1, security-related review requested.  
   Users care about both efficiency and consistency: provider prompt-cache reuse should not change unexpectedly when room events, authorization, compaction, recovery, or Responses continuation boundaries intervene.

5. **[#139710 — Mid-turn plugin-generation supersede kills system-agent turns](https://github.com/openclaw/openclaw/issues/139710)** — **20 comments**, P1.  
   Hot reloads are causing active inference and planner fallback to disappear together. This is a fundamental runtime-lifecycle problem: configuration changes must not invalidate work without a controlled restart or retry path.

6. **[#97616 — Unreaped hook/tool child processes](https://github.com/openclaw/openclaw/issues/97616)** — **17 comments**, P1.  
   Long-running installations are accumulating zombies and degrading performance. The underlying demand is robust process supervision and guaranteed cleanup for every hook and tool execution.

7. **[#118885 — Redundant full SQLite integrity checks](https://github.com/openclaw/openclaw/issues/118885)** — **13 comments**, P1.  
   Operators want startup checks that are safe for multi-gigabyte databases, with deduplication or incremental validation rather than repeated full scans.

8. **[#150635 — Short-term recall evicts entries before dreaming promotion](https://github.com/openclaw/openclaw/issues/150635)** — **13 comments**, P2.  
   The memory subsystem is failing at its intended promotion pipeline. Users need clear retention semantics and enough capacity for nightly ingestion to promote useful long-term memories.

9. **[#119411 — Memory file watcher does not reindex](https://github.com/openclaw/openclaw/issues/119411)** — **12 comments**, P1.  
   Silent memory staleness is especially problematic because the system can report itself clean while indexed content is incomplete.

10. **[#161976 — WhatsApp DM replies fail at durable registry handoff](https://github.com/openclaw/openclaw/issues/161976)** — **11 comments**, P1.  
    The agent can successfully produce a response while final delivery fails after restart. This points to a broader need for durable, idempotent outbound delivery and clearer failure state.

### Most active pull requests

- [PR #164075](https://github.com/openclaw/openclaw/pull/164075) is the most consequential security-sensitive item in the listed PR activity because it centralizes pairing and approval operations through the live Gateway owner.
- [PR #126255](https://github.com/openclaw/openclaw/pull/126255), which adds a pure-CDP browser code mode, remains open and is marked for proof and security-sensitive review.
- [PR #119055](https://github.com/openclaw/openclaw/pull/119055) and [PR #126263](https://github.com/openclaw/openclaw/pull/126263) target durable ownership and subagent lifecycle correctness, both of which intersect with data-loss and message-delivery risks.
- [PR #163693](https://github.com/openclaw/openclaw/pull/163693) reflects broader demand for better memory configuration and embedding-provider support.
- Several PRs have “waiting on author” or “needs proof” labels, including [PR #163350](https://github.com/openclaw/openclaw/pull/163350), [PR #136677](https://github.com/openclaw/openclaw/pull/136677), [PR #137184](https://github.com/openclaw/openclaw/pull/137184), and [PR #164173](https://github.com/openclaw/openclaw/pull/164173). The backlog is therefore not only an engineering-volume problem; it also has a review and validation bottleneck.

## 5. Bugs & Stability

### P0 / immediate release-risk items

- **[#143524 — SQLite WAL unbounded growth](https://github.com/openclaw/openclaw/issues/143524):** The most prominent stability and disk-exhaustion risk. Manual truncation only temporarily restores service, and Gateway startup can be blocked. No fix PR is identified in the supplied data; the issue is marked as needing maintainer review and information.
- **[#162031 — 2026.9.7 crash-loop during runtime tool assembly](https://github.com/openclaw/openclaw/issues/162031):** Gateway exits with an unhandled promise rejection even with all plugins disabled during the Doctor runtime-tool-schema path. This is a broad core-runtime failure and requires urgent reproduction.
- **[#161953 — Windows session creation failure](https://github.com/openclaw/openclaw/issues/161953):** Closed, indicating a resolved Windows-specific path/publication-owner defect. The fix is an important compatibility signal for Windows operators.
- **[#158390 — Plugin-capture temporary directories never garbage-collected](https://github.com/openclaw/openclaw/issues/158390):** P0 disk-fill risk. Operations create multi-gigabyte capture directories that are never removed. No linked fix is shown.
- **[#145252 — 2026.9.3/9.4 update and recovery reliability](https://github.com/openclaw/openclaw/issues/145252):** An open coordination issue covering upgrades, migrations, Doctor, rollback, and restart behavior, with release-blocker impact.

### P1 reliability and data-integrity risks

- **[#160386 — Severe SQLite I/O pressure and RPC timeouts](https://github.com/openclaw/openclaw/issues/160386):** Large session stores on 2026.9.6 can cause I/O saturation, WebUI RPC timeouts, and admission invalidation. [PR #163815](https://github.com/openclaw/openclaw/pull/163815) is a related session-lifecycle performance improvement, but the issue itself remains open.
- **[#160548 — Model-catalog worker leaks approximately 1 GiB every five minutes](https://github.com/openclaw/openclaw/issues/160548):** Memory reclamation supersedes the runtime publication and kills waiting turns. The catalog-worker family is also represented by closed [issue #159514](https://github.com/openclaw/openclaw/issues/159514), suggesting prior partial remediation but continuing architectural risk.
- **[#157989 — Plugin source capture rewrites gigabytes of data](https://github.com/openclaw/openclaw/issues/157989):** Repeated byte copies and hashing create severe SSD wear. [PR #164130](https://github.com/openclaw/openclaw/pull/164130) improves related Logbook processing, but no direct plugin-capture fix is listed.
- **[#97616 — Zombie child-process accumulation](https://github.com/openclaw/openclaw/issues/97616):** Long-term runtime degradation and possible resource exhaustion. No direct fix PR is shown.
- **[#144291 — Config hot reload aborts in-flight agent turns](https://github.com/openclaw/openclaw/issues/144291):** Live configuration changes can kill active generations and cause message loss. This is closely related to the supersede problems in [#139710](https://github.com/openclaw/openclaw/issues/139710).
- **[#154572 — Claude CLI child sessions fail with `SessionTranscriptWriterClaimReboundError`](https://github.com/openclaw/openclaw/issues/154572):** A 2026.9.5 regression affecting `sessions_spawn`; the ordinary CLI route still works. No clearly identified fix PR is provided.
- **[#154299 — Subagent completion text silently dropped](https://github.com/openclaw/openclaw/issues/154299):** Telegram outbound delivery can lose the final result without a queue entry or failure record.
- **[#162119 — Codex 403 owner-verification error after model switch](https://github.com/openclaw/openclaw/issues/162119):** Authentication and model-switch state can make existing conversations fail before producing a reply.
- **[#163566 — Durable context turns become `session-rebound` after update repair](https://github.com/openclaw/openclaw/issues/163566):** Session resource loading can burn 80–150 seconds of CPU per turn after 2026.9.7 update/repair.
- **[#158126 — Gateway shutdown intermittently exits with code 1](https://github.com/openclaw/openclaw/issues/158126):** Shutdown-sidecar errors leave systemd units failed and make restart behavior unreliable.

### Provider, channel, and compatibility regressions

- **[#38327 — Google Vertex/Gemini regression](https://github.com/openclaw/openclaw/issues/38327):** Long-standing P0 provider regression with 17 comments; still open.
- **[#118793 — Claude CLI session-limit errors bypass fallback](https://github.com/openclaw/openclaw/issues/118793):** The agent terminates instead of trying the configured backup model.
- **[#157126 — Claude CLI MCP bridge inherits the first request’s scope](https://github.com/openclaw/openclaw/issues/157126):** After restart recovery, owner turns may lose `operator.admin`, creating a security-boundary concern.
- **[#160610 — Discord autoPresence reports degraded with SecretRef/env credentials](https://github.com/openclaw/openclaw/issues/160610):** Status reporting is inconsistent with actual connectivity.
- **[#103198 — WebChat image attachments resolve incorrectly](https://github.com/openclaw/openclaw/issues/103198):** The image tool receives `image_0` rather than the media-store path.
- **[#137493 — Internal context envelope leaks into WebChat](https://github.com/openclaw/openclaw/issues/137493):** Closed, but notable as a security-relevant regression involving large text pastes.

**Overall stability assessment:** The issue mix is dominated by cross-cutting lifecycle and persistence defects rather than isolated feature bugs. The highest-risk cluster is: **SQLite/WAL and startup work, worker/plugin resource cleanup, ownership invalidation during hot reload or retries, and child-process supervision**.

## 6. Feature Requests & Roadmap Signals

Likely near-term roadmap themes, based on open feature requests and active PRs:

1. **Per-agent memory and dreaming control**  
   [Issue #67413](https://github.com/openclaw/openclaw/issues/67413) requests per-agent dreaming configuration to prevent all workspaces from consuming memory simultaneously. This is a strong candidate for the next memory-focused release because it is already product-shaped, motivated by OOM protection, and aligned with the broader memory roadmap.

2. **Better memory ingestion and promotion**  
   [Issue #150635](https://github.com/openclaw/openclaw/issues/150635) exposes a broken promotion path, while the closed memory write-pipeline issue [#42648](https://github.com/openclaw/openclaw/issues/42648) called for classification, deduplication, merging, and conflict handling. Memory may receive both correctness fixes and configuration improvements.

3. **Configurable memory embeddings**  
   [PR #163693](https://github.com/openclaw/openclaw/pull/163693) is an explicit roadmap signal for optional embedding-provider setup. It is likely to be included once compatibility and proof requirements are met.

4. **More capable browser automation**  
   [PR #126255](https://github.com/openclaw/openclaw/pull

---

## Cross-Ecosystem Comparison

# Cross-Project Comparison Report — 2026-10-03

## 1. Ecosystem Overview

The personal AI assistant and agent ecosystem is moving rapidly toward persistent, multi-channel, tool-using systems rather than standalone chat applications. OpenClaw and ZeroClaw show the highest engineering throughput, while QwenPaw is iterating strongly across WebUI, providers, sessions, and multimodal capabilities; Hermes is expanding desktop, plugin, and operational functionality. The dominant engineering challenge is no longer simply model integration, but reliable lifecycle management of sessions, subprocesses, configuration changes, credentials, and durable state. Across projects, community demand is converging on predictable upgrades, observability, resource controls, provider portability, and safe correction or rollback of agent actions. The ecosystem therefore appears highly innovative but operationally immature in several important production-critical areas.

## 2. Activity Comparison

| Project | Issues updated | PRs updated | Release status | Health assessment |
|---|---:|---:|---|---|
| **OpenClaw** | 500 | 500 | Two releases: `v2026.9.8`; gateway-only `v2026.8.35` extended-stable | **Active but strained** — very high throughput, but unresolved P0/P1 risks in SQLite, memory, cleanup, and session ownership |
| **Hermes Agent** | 50 | 50 | No new release | **Active, moderately strained** — broad feature and compatibility work, with Windows, updater, session-state, and automation risks |
| **IronClaw** | 1 | 0 | No new release | **Low activity / watch** — limited signal, but a potentially significant unresolved macOS credential-backend failure |
| **QwenPaw** | 15 | 15 | No new release | **Active and improving** — focused fixes for WebUI, providers, session continuity, multimodal handling, and startup recovery |
| **ZeroClaw** | 50 | 50 | No new release; work targets `v0.8.6`/`v0.9.0` preparation | **Highly active but high-risk** — extensive architecture work and release-gate regressions |

*Counts represent issues or pull requests updated in the last 24 hours, not total repository backlog.*

## 3. OpenClaw's Position

### Advantages versus peers

- **Largest visible community activity:** OpenClaw recorded 500 updated issues and 500 updated PRs, substantially exceeding the other projects’ reported activity.
- **Most mature release channel in this comparison:** It published both a main release and a gateway-focused extended-stable release, giving operators a potential stability-oriented deployment target.
- **Broadest operational and channel surface:** Activity spans session lifecycle, SQLite, gateway routing, provider behavior, Telegram, Slack, WhatsApp, memory, browser automation, diagnostics, and security.
- **Strong architectural investment:** The project is addressing root causes—ownership, persistence, worker cleanup, lifecycle management, and gateway authority—rather than limiting changes to UI-level work.
- **Security-sensitive development:** Pairing and approval operations are being moved behind the live Gateway owner, with additional credential-redaction and TLS-trust work.

### Technical approach differences

OpenClaw is comparatively focused on a mature, long-running gateway/runtime model with durable local state, multi-channel integrations, and extensive operational controls. Hermes is more desktop- and plugin-oriented, with a browser-hosted Desktop renderer and ecosystem expansion. QwenPaw emphasizes the WebUI, provider compatibility, session usability, and multimodal tools. ZeroClaw is pursuing a broad Rust-oriented gateway/client split, feature-gated integrations, RPC coverage, and subprocess resource controls. IronClaw currently presents a much smaller observable development surface and is primarily signaled by a macOS service-startup and credential issue.

### Community size comparison

OpenClaw is clearly the largest in terms of reported daily issue and PR activity. ZeroClaw and Hermes form the next tier, each with 50 updated issues and PRs, although their activity is more concentrated in architectural or product-specific work. QwenPaw has a smaller but still substantial contributor signal, while IronClaw’s single issue provides insufficient evidence to assess community scale.

## 4. Shared Technical Focus Areas

| Shared requirement | Projects | Evidence and interpretation |
|---|---|---|
| **Reliable session and state management** | OpenClaw, Hermes, QwenPaw, ZeroClaw | OpenClaw is addressing SQLite, session ownership, retries, and subagent completion; Hermes is preserving archive, pin, and hidden flags; QwenPaw is fixing active-chat selection and compressed-history loading; ZeroClaw is adding atomic ownership and session-state persistence. |
| **Subprocess and worker supervision** | OpenClaw, Hermes, ZeroClaw | OpenClaw has unreaped hook/tool child processes and model-worker memory leaks; Hermes is escalating MCP cleanup from `SIGTERM` to `SIGKILL`; ZeroClaw is adding an opt-in subprocess memory watchdog and cancellation controls. |
| **Safe hot configuration and reload behavior** | OpenClaw, ZeroClaw, QwenPaw | OpenClaw reports aborted or superseded turns during reload; ZeroClaw is building configuration generations and per-target apply results; QwenPaw is improving cleanup and cancellation during agent-instance reload. |
| **Provider portability and fallback** | OpenClaw, Hermes, QwenPaw, ZeroClaw | OpenClaw has provider and model-switch regressions; Hermes has Anthropic fallback and OpenRouter/DeepSeek issues; QwenPaw is updating GPT token parameters and gateway error classification; ZeroClaw is addressing provider URI/model discovery. |
| **Credential and security-boundary correctness** | OpenClaw, Hermes, IronClaw, ZeroClaw | OpenClaw is centralizing pairing and approval ownership and redacting credentials; Hermes needs `.env` fallback for skill secrets and correct cron hook loading; IronClaw has a macOS credential backend failure; ZeroClaw is expanding RPC security parity. |
| **Multimodal and media reliability** | OpenClaw, QwenPaw, Hermes | OpenClaw is fixing image filename preservation and WhatsApp behavior; QwenPaw is adding `view_audio` and addressing image hangs; Hermes is improving browser rich-text input and Slack formatting. |
| **Better observability and diagnostics** | All projects | OpenClaw is refactoring diagnostics and preserving update causes; Hermes has incorrect trace and configuration guidance; QwenPaw needs explicit finish reasons and provider metadata; ZeroClaw needs better cost attribution and lifecycle observability; IronClaw needs runtime credential diagnostics. |
| **Ecosystem extensibility** | OpenClaw, Hermes, QwenPaw, ZeroClaw | Plugin catalogs, MCP, browser automation, coding CLIs, channel integrations, A2A protocols, and feature-gated services are recurring roadmap themes. |

The common pattern is that the projects are treating **operational correctness as a product feature**, not merely an implementation detail.

## 5. Differentiation Analysis

### OpenClaw

- **Primary focus:** High-capability personal assistant gateway with extensive messaging-channel integration, persistent sessions, memory, and automation.
- **Target users:** Operators and technically sophisticated users running always-on assistants across multiple communication channels and devices.
- **Architecture emphasis:** Durable local persistence, Gateway ownership, session lifecycle management, channel routing, and security-sensitive control planes.
- **Key differentiator:** Broadest ecosystem and strongest apparent operational scale, but also the greatest concentration of unresolved cross-cutting risks.

### Hermes Agent

- **Primary focus:** Desktop-centered personal-agent experience, CLI usability, plugins, memory integrations, and remote/browser access.
- **Target users:** Users seeking a more polished desktop workspace and a plugin-oriented assistant platform.
- **Architecture emphasis:** Electron/Tauri-style desktop UX, browser-hosted renderer, session management, MCP, and plugin catalog expansion.
- **Key differentiator:** Stronger product/UX orientation than core runtime projects, with meaningful momentum toward a full personal-agent workspace.

### QwenPaw

- **Primary focus:** WebUI, provider compatibility, conversation continuity, multimodal tools, and lightweight desktop usability.
- **Target users:** Users who need a configurable web console and broad model/provider support, including newer GPT families and multimodal workflows.
- **Architecture emphasis:** Frontend state correctness, provider probing, session/history handling, media tools, and responsive/mobile access.
- **Key differentiator:** Most visibly focused on closing the gap between advertised model/media capabilities and actual runtime behavior.

### ZeroClaw

- **Primary focus:** High-performance agent runtime, gateway/client separation, RPC, coding workflows, subprocess control, and extensibility.
- **Target users:** Developers embedding or operating the agent as infrastructure, including ZeroCode, coding CLI, channel, and automation workflows.
- **Architecture emphasis:** Explicit gateway boundaries, feature-gated dependencies, structured tool calls, ownership claims, cancellation, and resource limits.
- **Key differentiator:** Most infrastructure-like roadmap, with significant investment in making the runtime composable, controllable, and safer for long-lived services.

### IronClaw

- **Primary focus:** Core service execution and extension support, with a local-development workflow.
- **Target users:** Local macOS developers and extension users.
- **Architecture emphasis:** Credential backends, extension startup, and local service diagnostics.
- **Key differentiator:** Insufficient activity for a robust comparison; its current signal is a critical credential-loading failure on macOS rather than a broad roadmap.

## 6. Community Momentum & Maturity

### Rapidly iterating

- **OpenClaw:** Highest momentum and broadest scope. Its two releases indicate delivery capacity, but the open P0/P1 backlog suggests a **strained production-maturity profile**.
- **ZeroClaw:** Exceptionally strong architectural momentum, with gateway separation, RPC, cancellation, subprocess limits, and session ownership work progressing together. The large number of open PRs and release-gated regressions suggests **pre-release hardening**, not settled stability.
- **QwenPaw:** Strong, focused momentum with several PRs directly tied to high-impact user issues. It appears to be in an **active stabilization and capability-expansion phase**.
- **Hermes Agent:** Broad iteration across Desktop, browser access, memory, plugins, sessions, and configuration. Its roadmap is ambitious, but compatibility and deployment inconsistencies indicate **productization in progress**.

### Stabilizing or less active

- **IronClaw:** Insufficient evidence to call it rapidly evolving. The lack of PR/release activity and the unresolved macOS issue suggest **a small or quieter maintenance phase** with a newly exposed reliability risk.
- **OpenClaw extended-stable:** The `v2026.8.35` gateway-only release indicates an attempt to provide a lower-risk production lane, but migration, update, and recovery behavior still require validation.

Across the ecosystem, **release frequency is not equivalent to operational maturity**. OpenClaw and ZeroClaw demonstrate the highest release and architectural pressure, while QwenPaw’s issue-to-PR mapping suggests more focused corrective iteration.

## 7. Trend Signals

1. **Persistent agents are becoming long-running services.**  
   Projects are increasingly expected to survive restarts, recover interrupted turns, preserve durable state, and operate continuously across channels. This shifts evaluation from “does it answer?” to “does it remain correct over weeks?”

2. **Lifecycle management is the central reliability bottleneck.**  
   Sessions, workers, MCP servers, tool calls, hot reloads, retries, and shutdown behavior repeatedly appear as high-severity concerns. Future agent frameworks will need first-class ownership, cancellation, cleanup, recovery, and idempotency contracts.

3. **Resource isolation is becoming mandatory.**  
   Memory limits, CPU-spin detection, descendant-process monitoring, bounded recursion, and guaranteed child cleanup are appearing across OpenClaw, ZeroClaw, and Hermes. A production agent cannot safely execute arbitrary tools without enforceable resource boundaries.

4. **Provider compatibility is a continuous maintenance burden.**  
   Model naming, token parameters, fallback behavior, OAuth credentials, and gateway-specific error semantics change faster than release cycles. Provider adapters need capability discovery, normalized errors, and automatic compatibility testing.

5. **Users want reversibility and auditability.**  
   QwenPaw’s message-retraction and workspace-rollback request, OpenClaw’s session ownership work, and ZeroClaw’s session persistence efforts all point toward agent actions that are inspectable, bounded, and reversible.

6. **Multimodal support is moving from capability claims to runtime reliability.**  
   Image, video, and audio support increasingly requires careful handling of filenames, provider limits, media transformations, hangs, and fallback behavior. Merely registering a multimodal tool is no longer sufficient.

7. **Security boundaries are tightening around remote control and credentials.**  
   Approval routing, TLS trust, RPC parity, browser-hosted access, secret loading, and credential diagnostics are becoming central product concerns as agents gain more system and channel permissions.

8. **The ecosystem is differentiating into infrastructure and workspace layers.**  
   OpenClaw and ZeroClaw are deepening runtime/gateway infrastructure; Hermes is building a desktop and plugin workspace; QwenPaw is improving a web console and multimodal assistant experience. This suggests increasing specialization rather than convergence toward a single universal agent architecture.

**Decision-maker takeaway:** choose OpenClaw for breadth and channel-rich personal-assistant capability, but apply conservative release and persistence controls. Consider ZeroClaw for infrastructure-oriented extensibility and RPC isolation, Hermes for desktop and plugin-centric workflows, and QwenPaw for a web-first, provider-flexible, multimodal console. In every case, validate upgrade, session recovery, subprocess cleanup, and credential behavior before production deployment.

---

## Peer Project Reports

<details>
<summary><strong>Hermes Agent</strong> — <a href="https://github.com/nousresearch/hermes-agent">nousresearch/hermes-agent</a></summary>

# Hermes Agent Project Digest — 2026-10-03

## 1. Today's Overview

Hermes Agent showed high development activity, with **50 issues** and **50 pull requests updated in the last 24 hours**. Most discussions remain open—**45 active issues** and **40 open PRs**—indicating a substantial review and triage workload rather than rapid stabilization. The activity is distributed across desktop usability, plugin and memory integrations, CLI/configuration robustness, gateway operations, and session management. No release was published, so today’s changes are not yet represented in a tagged version. Several fixes for concrete P1/P2 issues have PRs in progress, but the project still shows a broad surface area of reliability and compatibility concerns.

## 2. Releases

No new release was published in the last 24 hours. The latest release list is empty, so there are no version-specific migration or breaking-change notes available for today.

## 3. Project Progress

### Closed or completed PR activity

The following PRs were closed today. The supplied data does not distinguish between merged and abandoned closures, so they should not automatically be interpreted as shipped fixes:

- **PR #83217 — Restore flat MoA configuration fields after preset merging**  
  [PR #83217](https://github.com/NousResearch/hermes-agent/pull/83217)  
  Addresses legacy `moa.reference_models` and `moa.aggregator` settings being shadowed by default preset values. This is a configuration-compatibility fix for users relying on flat MoA settings.

- **PR #83388 — Prevent accidental bare `pytest` execution**  
  [PR #83388](https://github.com/NousResearch/hermes-agent/pull/83388)  
  Adds a guard so contributors are directed to Hermes’ canonical test runner, reducing the chance of tests running in an uncontrolled environment and mutating the checkout.

- **PR #125225 — Make desktop compiler test path handling portable**  
  [PR #125225](https://github.com/NousResearch/hermes-agent/pull/125225)  
  Adjusts a desktop test to accept either path separator, improving Windows test compatibility.

- **PR #132081 — Automated JavaScript formatting and lint fixes**  
  [PR #132081](https://github.com/NousResearch/hermes-agent/pull/132081)  
  A generated formatting PR reported to auto-merge when CI passes. It represents maintenance rather than a user-facing feature.

### Open work advancing the product

- **MCP process cleanup escalation**  
  [PR #132057](https://github.com/NousResearch/hermes-agent/pull/132057)  
  Escalates from `SIGTERM` to `SIGKILL` for leftover MCP child processes that ignore graceful termination. This should improve shutdown reliability, although the PR was still open.

- **Project Cockpit for Hermes Desktop**  
  [PR #132083](https://github.com/NousResearch/hermes-agent/pull/132083)  
  Adds a Projects destination and a read-only cockpit for canonical project folders, repositories, active sessions, and recent sessions. This is a notable step toward stronger project-aware UX in Desktop.

- **Runtime marker correction for PM**  
  [PR #129306](https://github.com/NousResearch/hermes-agent/pull/129306)  
  Publishes complete Python and site-packages paths in the package-manager runtime marker. This targets a P1 compatibility problem in runtime discovery.

- **Session protection-flag preservation**  
  [PR #131161](https://github.com/NousResearch/hermes-agent/pull/131161)  
  Preserves protection flags when transferring or restoring sessions, including pinned, hidden, and related retention state.

- **Imported-session flag preservation**  
  [PR #130345](https://github.com/NousResearch/hermes-agent/pull/130345)  
  Carries `archived`, `auto_archived`, `pinned`, and `hidden` flags through session imports. It overlaps with #131161 and suggests active attention to session-state correctness.

- **Browser-hosted Desktop renderer**  
  [PR #93508](https://github.com/NousResearch/hermes-agent/pull/93508)  
  Adds an authenticated `hermes webapp` mode that serves the actual Desktop renderer in a browser. If completed, this could substantially improve access to the Desktop experience from remote or non-Electron environments.

- **Browser rich-text input reliability**  
  [PR #132082](https://github.com/NousResearch/hermes-agent/pull/132082)  
  Replaces the `contentEditable` text-replacement approach with native input handling, intended to improve `browser_type` behavior in rich editors such as Lexical.

- **Slack markdown-link escaping**  
  [PR #132079](https://github.com/NousResearch/hermes-agent/pull/132079)  
  Fixes escaping of `&`, `<`, and `>` in converted Slack link labels.

- **Streaming shutdown race**  
  [PR #132080](https://github.com/NousResearch/hermes-agent/pull/132080)  
  Handles synchronous generators that are still executing during close, preventing `ValueError: generator already executing` on an unmanaged stream seam.

## 4. Community Hot Topics

### Most-discussed issues

1. **Pre-installed “Hermes Ops” expert profile and proactive update reporter** — 6 comments  
   [Issue #126063](https://github.com/NousResearch/hermes-agent/issues/126063)  
   Users are asking for an always-available operations specialist that the main agent can consult for troubleshooting, installation, updates, and system health. The request points to a broader need for first-class operational intelligence rather than relying solely on the user’s prompts or generic tools.

2. **Windows updater loses visibility of gateways after mid-update relaunch** — 5 comments  
   [Issue #123490](https://github.com/NousResearch/hermes-agent/issues/123490)  
   The updater’s process-discovery and relaunch behavior may incorrectly report a gateway as dead on Windows. This is operationally important because failures in update verification can leave users unsure whether their agent is running.

3. **Desktop distribution through the Nous Research homepage** — 4 comments  
   [Issue #126619](https://github.com/NousResearch/hermes-agent/issues/126619)  
   The request highlights a distribution and discoverability gap: users are directed to the bootstrap installer while the more capable Desktop application is not equally prominent. It suggests that installation friction and unclear product positioning remain significant adoption barriers.

4. **Cron shell hooks silently disabled under systemd gateway** — 4 comments  
   [Issue #131764](https://github.com/NousResearch/hermes-agent/issues/131764)  
   Scheduled jobs can run through an external worker without loading profile-level `hooks:` configuration. Because there is no warning, users may believe automation is protected or instrumented when it is not.

5. **Mnemosyne tools unavailable despite configured plugin and populated database** — 4 comments  
   [Issue #125520](https://github.com/NousResearch/hermes-agent/issues/125520)  
   The report highlights a mismatch between plugin installation/configuration and runtime tool exposure or initialization. Similar integration friction appears in the OpenViking report, where context injection works but native tools are missing: [Issue #130484](https://github.com/NousResearch/hermes-agent/issues/130484).

6. **Deeply nested tool arguments cause `RecursionError`** — 4 comments  
   [Issue #132016](https://github.com/NousResearch/hermes-agent/issues/132016)  
   Unbounded recursive argument coercion can crash tool dispatch on pathological but potentially model-generated structures. This is a security- and stability-relevant edge case around MCP and tool inputs.

7. **Hindsight memory should retain tool calls and results** — 3 comments  
   [Issue #6429](https://github.com/NousResearch/hermes-agent/issues/6429)  
   Users want richer longitudinal memory that includes actions and outcomes, not only user and assistant text. This reflects demand for more useful agent memory and better reconstruction of past work.

8. **Skill configuration should support `.env` fallback through `env_key`** — 3 comments  
   [Issue #6406](https://github.com/NousResearch/hermes-agent/issues/6406)  
   The request identifies a practical security and usability concern: secrets should be loadable from the natural secret store rather than being embedded in `config.yaml`.

9. **Desktop model-picker handling of `-flash` variants** — 4 comments  
   [Issue #124884](https://github.com/NousResearch/hermes-agent/issues/124884)  
   The fixed suffix-based classification is brittle as vendors introduce new naming conventions. This affects model discoverability and can make routing decisions less predictable.

10. **Desktop model picker omits OpenAI Codex OAuth providers** — 2 comments  
    [Issue #124510](https://github.com/NousResearch/hermes-agent/issues/124510)  
    A valid OAuth credential is available, yet the Desktop picker does not list the provider, creating a CLI/Desktop parity problem.

### Most active PRs

- **Matrix receipts and processing feedback** — 2 or more substantive project dependencies  
  [PR #126283](https://github.com/NousResearch/hermes-agent/pull/126283)  
  The PR’s dependency stack indicates an ambitious Matrix integration effort involving session state, message delivery, automation, and compatibility. This is a major channel-integration workstream rather than a small isolated fix.

- **Plugin Catalog additions: Vietnamese language and Zalo plugins**  
  [PR #130281](https://github.com/NousResearch/hermes-agent/pull/130281)  
  Community-owned plugins are being added, reinforcing Hermes’ extension ecosystem and localization strategy.

- **Standalone Bend proof-verification plugin**  
  [Issue #131689](https://github.com/NousResearch/hermes-agent/issues/131689)  
  This is an innovation signal: specialized domain integrations are increasingly being proposed as standalone plugins rather than additions to core.

## 5. Bugs & Stability

### Highest-severity or highest-risk reports

1. **P1 — PM runtime marker incompleteness**  
   [PR #129306](https://github.com/NousResearch/hermes-agent/pull/129306)  
   The isolated runtime may be staged but fail discovery because the marker lacks Python and site-packages paths. This can affect package-management and update/runtime compatibility broadly.

2. **P1 — Session protection flags lost during transfer/import**  
   [PR #131161](https://github.com/NousResearch/hermes-agent/pull/131161)  
   [PR #130345](https://github.com/NousResearch/hermes-agent/pull/130345)  
   Losing pinned, hidden, or archive flags can delete history the user intended to preserve or expose sessions that should remain out of normal listings. The presence of two related PRs suggests the issue has significant state-integrity implications.

3. **P1 — Windows updater falsely fails relaunch verification**  
   [Issue #123490](https://github.com/NousResearch/hermes-agent/issues/123490)  
   This is a high-impact deployment and recovery problem, particularly for users relying on automated updates.

4. **P2 — Cron hooks silently do not execute**  
   [Issue #131764](https://github.com/NousResearch/hermes-agent/issues/131764)  
   The absence of warnings makes this difficult to diagnose and can undermine trust in scheduled automation.

5. **P2 — Unbounded recursion in tool-argument coercion**  
   [Issue #132016](https://github.com/NousResearch/hermes-agent/issues/132016)  
   A malformed or unusually deep tool payload can terminate dispatch with a recursion failure. The issue was reported today and deserves a depth limit plus regression tests.

6. **P2 — `agent.max_turns: .inf` crashes startup**  
   [Issue #132075](https://github.com/NousResearch/hermes-agent/issues/132075)  
   YAML special float values are documented as unlimited but cause `OverflowError`; NaN causes a different failure. A direct fix is active in [PR #132085](https://github.com/NousResearch/hermes-agent/pull/132085).

7. **P2 — Anthropic fallback skipped as credential pool exhausted**  
   [Issue #131993](https://github.com/NousResearch/hermes-agent/issues/131993)  
   This is a provider-routing and resilience issue: a fallback provider can be incorrectly skipped when its borrowed credential has not yet been populated.

8. **P2 — OpenRouter/DeepSeek regression**  
   [Issue #131855](https://github.com/NousResearch/hermes-agent/issues/131855)  
   Users report missing thinking blocks and loss of tool-call capability after recent updates. The issue was closed today, but the supplied data does not confirm whether the underlying regression is fully resolved.

9. **P2 — PM garbage collection can delete user-placed tools and worktrees**  
   [Issue #124074](https://github.com/NousResearch/hermes-agent/issues/124074)  
   The lack of dry-run, allowlist, or quarantine makes destructive cleanup especially risky. This is a strong candidate for a maintenance-priority safety intervention.

10. **P2 — Desktop/CLI model-picker parity failure**  
    [Issue #124510](https://github.com/NousResearch/hermes-agent/issues/124510)  
    A valid Codex OAuth credential is not reflected in Desktop model options, making a supported provider effectively inaccessible in one major frontend.

### Additional correctness and UX bugs

- Incorrect trace-upload guidance: [Issue #132076](https://github.com/NousResearch/hermes-agent/issues/132076)
- Wrong `max_iterations` guidance: [Issue #132073](https://github.com/NousResearch/hermes-agent/issues/132073)
- Slack markdown-link escaping: [Issue #132074](https://github.com/NousResearch/hermes-agent/issues/132074), with [PR #132079](https://github.com/NousResearch/hermes-agent/pull/132079)
- Desktop model tag classification: [Issue #124884](https://github.com/NousResearch/hermes-agent/issues/124884)
- Windows memory writes use CRLF: [Issue #109674](https://github.com/NousResearch/hermes-agent/issues/109674), with [PR #109685](https://github.com/NousResearch/hermes-agent/pull/109685)
- Desktop translucency control is effectively two-position: [Issue #77312](https://github.com/NousResearch/hermes-agent/issues/77312)
- External launchers break after a `_desktop_launch_options()` return-signature change: [Issue #125852](https://github.com/NousResearch/hermes-agent/issues/125852)
- Desktop bot mention autocomplete omits non-default profiles: [Issue #132068](https://github.com/NousResearch/hermes-agent/issues/132068)

Overall, today’s bug profile is **moderate-to-high operational risk**, with the most important themes being update/runtime correctness, session state preservation, automation reliability, destructive maintenance behavior, and provider-routing correctness.

## 6. Feature Requests & Roadmap Signals

### High-likelihood near-term candidates

These are not confirmed roadmap commitments, but the volume and specificity of discussion make them plausible candidates for the next release cycle:

- **Operational expert profile and update reporter**  
  [Issue #126063](https://github.com/NousResearch/hermes-agent/issues/126063)  
  A built-in “Hermes Ops” profile could improve setup, diagnostics, update awareness, and self-service troubleshooting.

- **Improved Desktop distribution**  
  [Issue #126619](https://github.com/NousResearch/hermes-agent/issues/126619)  
  The project may prioritize making Desktop installation as discoverable and accessible as the bootstrap installer.

- **Desktop project cockpit**  
  [PR #132083](https://github.com/NousResearch/hermes-agent/pull/132083)  
  Project-centric navigation and session visibility are aligned with Hermes’ move from a chat client toward a full personal-agent workspace.

- **Richer memory retention**  
  [Issue #6429](https://github.com/NousResearch/hermes-agent/issues/6429)  
  Tool-call and result retention could become part of a broader memory-system improvement, especially alongside Hindsight and OpenViking work.

- **Secret-aware skill configuration**  
  [Issue #6406](https://github.com/NousResearch/hermes-agent/issues/6406)  
  `.env` fallback for skill configuration is a relatively contained usability and security improvement with broad applicability.

- **Remote/browser access to Desktop**  
  [PR #93508](https://github.com/NousResearch/hermes-agent/pull/93508)  
  If completed, browser hosting could be a major accessibility and deployment feature, particularly for remote gateways and server environments.

### Plugin and ecosystem direction

- Plugin Catalog expansion: [PR #130281](https://github.com/NousResearch/hermes-agent/pull/130281)
- Bend proof verification as a standalone plugin: [Issue #131689](https://github.com/NousResearch/hermes-agent/issues/131689)
- Bittensor wallet skill: [Issue #5906](https://github.com/NousResearch/hermes-agent/issues/5906)
- OpenViking native tool exposure: [Issue #130484](https://github.com/NousResearch/hermes-agent/issues/130484)
- Matrix receipts and processing feedback: [PR #126283](https://github.com/NousResearch/hermes-agent/pull/126283)

The ecosystem signal is clear: Hermes is increasingly acting as a host for domain-specific plugins and channel integrations rather than implementing every capability in core.

## 7. User Feedback Summary

### Recurring pain points

- **Configuration is not reliably reflected in runtime behavior.** Users report values that are accepted by configuration but ignored, overwritten, or interpreted differently by another execution path. Examples include MoA merging, `max_turns` special values, skill secrets, and cron hooks.

- **Desktop and CLI behavior are diverging.** Model providers, profiles, launch contracts, and appearance controls behave differently across interfaces. This creates a high-support-cost experience and makes Hermes feel less coherent as a product.

- **Updates and installation remain fragile on Windows and under wrappers.** Process discovery, relaunch verification, CRLF handling, and external launcher compatibility all show that deployment boundaries need more defensive testing.

- **Memory integrations are difficult to trust.** Users can have plugins installed, databases populated, and context injection active while still finding that the advertised tools are unavailable. This points to a need for stronger initialization and capability-discovery diagnostics.

- **Destructive operations lack safety rails.** The PM garbage-collection report is particularly concerning because it can remove user-managed content and nested Git worktrees without a dry run or quarantine.

- **Documentation and error messages contain incorrect commands or keys.** Examples include nonexistent `/upload-trace` and `hermes trace upload` guidance in [Issue #132076](https://github.com/NousResearch/hermes-agent/issues/132076), and references

</details>

<details>
<summary><strong>IronClaw</strong> — <a href="https://github.com/nearai/ironclaw">nearai/ironclaw</a></summary>

# IronClaw Project Digest — 2026-10-03

## 1. Today's Overview

IronClaw recorded **one updated issue and no pull-request activity** in the last 24 hours. The only reported item is an open issue concerning `ironclaw serve` failing on macOS with a credential-read/backend error affecting the `web-app` extension under the `local-dev` profile. The report affects both IronClaw **1.4.1** installed through the official installer and **1.4.0** built with Cargo, indicating a potentially reproducible issue across recent versions. No releases, merged fixes, or additional community responses were reported, so today’s activity indicates a **low-volume but potentially significant stability problem** rather than broad development momentum.

## 2. Releases

No new releases were published today. The report references recent versions **1.4.1** and **1.4.0**, but no release notes or migration guidance were available in the provided data.

## 3. Project Progress

- **Merged or closed PRs:** None reported in the last 24 hours.
- **Features advanced or fixes delivered:** No confirmed code changes or fixes were reported.
- The open issue indicates that the macOS credential-loading failure has not yet been visibly addressed through a merged PR or release.

## 4. Community Hot Topics

### [Issue #8122 — `ironclaw serve` fails with credential read/backend error](https://github.com/nearai/ironclaw/issues/8122)

- **Status:** Open
- **Author:** rahhbster
- **Created/updated:** 2026-10-03
- **Comments/reactions:** 0 comments and 0 reactions reported

This is the only active discussion in the supplied data. The report concerns a failure in the `web-app` extension on **macOS Apple Silicon**, using the `local-dev` boot profile. The environment reports that `ironclaw doctor` passes all **8/8 checks**, which suggests the issue may occur specifically during service startup or extension credential access rather than during general diagnostics.

The underlying need is likely broader than a single command failure: users need reliable credential handling and extension startup behavior on officially supported macOS installations, particularly for local development.

## 5. Bugs & Stability

### High-priority stability issue

#### [Issue #8122 — Credential read failure on macOS](https://github.com/nearai/ironclaw/issues/8122)

- **Severity:** High for local macOS development and extension usage; impact beyond that environment is not yet known.
- **Affected versions:** Reported on **1.4.1** and **1.4.0**.
- **Platform:** macOS on Apple Silicon, `aarch64-apple-darwin`.
- **Profile:** `local-dev`.
- **Component:** `ironclaw serve` / `web-app` extension credential access.
- **Observed error:** `credential read failed: BackendUnavailable` according to the issue title.
- **Diagnostics:** `ironclaw doctor` reportedly passed all 8 checks.
- **Fix PR:** None identified in the available data.
- **Reproduction status:** The reporter states that the problem occurs with both an official installation and a Cargo-built 1.4.0 binary, suggesting it is not limited to the installer.

This report should be treated as a **potentially cross-installation macOS credential/backend compatibility issue**. The lack of comments and reactions means there is not yet evidence of broad confirmation, but the combination of recent-version reproducibility and failure in a core serve path warrants prompt investigation.

## 6. Feature Requests & Roadmap Signals

No explicit feature requests were reported today, and there are no open PRs or release notes from which to infer roadmap priorities.

The issue does provide several indirect roadmap signals:

- Improve macOS support for credential backends and local-development profiles.
- Ensure extension credential loading works consistently across installation methods.
- Strengthen `ironclaw doctor` or add runtime checks that detect credential-backend failures before `serve` starts.
- Improve the diagnostic quality of `BackendUnavailable` errors, including actionable remediation guidance.

These are recommendations based on the report rather than confirmed roadmap commitments. The most likely near-term focus would be a **stability and diagnostics fix**, not a new feature release.

## 7. User Feedback Summary

The available feedback consists of a single detailed bug report from a user running IronClaw locally on macOS.

### User pain points

- The user cannot successfully start the relevant service with the `web-app` extension.
- The failure occurs on two recent versions and with two installation methods.
- The issue is not caught by the project’s standard `doctor` checks, which all pass.
- The error is difficult to interpret without additional information: `BackendUnavailable` identifies a failure category but does not yet explain the affected backend or remediation.

### Use case represented

- Local development on macOS Apple Silicon.
- Running `ironclaw serve` with the `local-dev` profile.
- Using the `web-app` extension and its stored credentials.

### Satisfaction signal

There is not enough feedback to assess overall satisfaction. However, the report reflects a meaningful reliability concern for a primary development workflow, and the absence of an associated fix or maintainer response leaves the user without a visible path to resolution.

## 8. Backlog Watch

- **[Issue #8122](https://github.com/nearai/ironclaw/issues/8122)** is the only item available for assessment and was updated today, so it is not a long-unanswered issue based on the supplied data.
- No open or stale PR backlog data was provided.
- Maintainer attention is recommended to:
  1. Reproduce the failure on macOS Apple Silicon.
  2. Determine whether the issue affects installer-based and Cargo-based installations equally.
  3. Identify the unavailable credential backend and whether profile selection or keychain integration is involved.
  4. Add coverage to startup diagnostics.
  5. Publish a fix or, if necessary, document a workaround once the scope is confirmed.

**Overall health assessment:** **Stable-looking core diagnostics, but with a newly surfaced macOS/local-development reliability risk.** Project activity was minimal today, with no release or PR throughput; the key health signal is the unresolved credential-backend issue in a core service path.

</details>

<details>
<summary><strong>QwenPaw</strong> — <a href="https://github.com/agentscope-ai/QwenPaw">agentscope-ai/QwenPaw</a></summary>

# QwenPaw Project Digest — 2026-10-03

## 1. Today's Overview

QwenPaw recorded **15 updated issues** and **15 updated pull requests** in the last 24 hours, indicating sustained development across the console, providers, desktop app, agent runtime, and multimodal tools. Most issues remain open (**14 of 15**), while the PR queue contains **8 open** and **7 closed** updates. Activity is especially concentrated in WebUI usability, provider compatibility, conversation reliability, and media handling. No new release was published, so these changes are not yet available in a formal version release.

## 2. Releases

No new QwenPaw release was identified for 2026-10-03.

## 3. Project Progress

### Open PRs addressing current issues

- **[PR #8091 — Track last active chat ID on sidebar session click](https://github.com/agentscope-ai/QwenPaw/pull/8091)**  
  Fixes incorrect new-session behavior by recording the active conversation when users open a historical chat from the sidebar. This directly addresses the duplicate/new-session behavior described in [Issue #7661](https://github.com/agentscope-ai/QwenPaw/issues/7661).

- **[PR #8090 — Recognize newer GPT token-limit parameters](https://github.com/agentscope-ai/QwenPaw/pull/8090)**  
  Updates provider probing for GPT-6-family models to use `max_completion_tokens` instead of the legacy `max_tokens` parameter. It targets the HTTP 400 connection-test failures reported in [Issue #8074](https://github.com/agentscope-ai/QwenPaw/issues/8074).

- **[PR #8089 — Support terminal identity over LAN HTTP](https://github.com/agentscope-ai/QwenPaw/pull/8089)**  
  Adds a fallback UUID implementation for browsers where `crypto.randomUUID()` is unavailable, including LAN HTTP environments. This is a candidate fix for conversation-page access failures in [Issue #8073](https://github.com/agentscope-ai/QwenPaw/issues/8073).

- **[PR #8086 — Move settings navigation into a mobile drawer](https://github.com/agentscope-ai/QwenPaw/pull/8086)**  
  Improves the WebUI on screens up to 768px wide by moving the large settings navigation into a mobile drawer. This advances the mobile-console request in [Issue #6281](https://github.com/agentscope-ai/QwenPaw/issues/6281).

- **[PR #8084 — Reject oversized prompts and surface empty model replies](https://github.com/agentscope-ai/QwenPaw/pull/8084)**  
  Adds explicit handling for prompts exceeding model context limits and for providers that return an empty completion. It should reduce silent failure cases where users receive no output despite an apparently successful request.

- **[PR #8079 — Notify the room and cancel in-flight runs after reload drain timeout](https://github.com/agentscope-ai/QwenPaw/pull/8079)**  
  Improves behavior when configuration reloads trigger cleanup of an old agent instance. Rather than leaving a room without notification, the run is explicitly cancelled when the cleanup budget expires.

- **[PR #8083 — Add `view_audio` built-in tool](https://github.com/agentscope-ai/QwenPaw/pull/8083)**  
  Extends built-in multimodal understanding beyond `view_image` and `view_video`. It corresponds to the audio-understanding request in [Issue #8081](https://github.com/agentscope-ai/QwenPaw/issues/8081).

### Closed/updated PRs

The following PRs were marked closed or otherwise finalized in the reported activity window. The supplied data does not distinguish merge from administrative closure, so they should be treated as completed changes requiring verification of merge status:

- **[PR #7347 — Keep rich-input caret visible](https://github.com/agentscope-ai/QwenPaw/pull/7347)**: improves cursor visibility in multiline composers.
- **[PR #6877 — Remember desktop window geometry](https://github.com/agentscope-ai/QwenPaw/pull/6877)**: persists Tauri window position and size between launches.
- **[PR #7356 — Add chat scroll lock](https://github.com/agentscope-ai/QwenPaw/pull/7356)**: lets users stop streaming output from forcibly pulling the viewport to the bottom.
- **[PR #7357 — Add tool-call visibility toggle](https://github.com/agentscope-ai/QwenPaw/pull/7357)**: allows tool-call cards to be hidden for cleaner conversation reading.
- **[PR #7359 — Expose per-media inline caps](https://github.com/agentscope-ai/QwenPaw/pull/7359)**: adds provider-level image, video, and audio inline limits.
- **[PR #6874 — Add configurable MCP tool-call timeout](https://github.com/agentscope-ai/QwenPaw/pull/6874)**: introduces a per-client tool-call deadline, defaulting to 300 seconds.
- **[PR #7344 — Support game-development file languages](https://github.com/agentscope-ai/QwenPaw/pull/7344)**: adds Console syntax support for common Unity, Godot, and graphics-development files.

Additional active work includes the Chinese localization fix in **[PR #7936](https://github.com/agentscope-ai/QwenPaw/pull/7936)** for the access-control username label.

## 4. Community Hot Topics

### Conversation history and session management

- **[Issue #7884 — Compressed refresh prevents full history loading](https://github.com/agentscope-ai/QwenPaw/issues/7884)** — **8 comments**  
  Users report that older chat history is unavailable after refreshing or compressing the frontend. This is a high-impact usability problem: users cannot reliably revisit prior discussions, and the issue suggests that conversation retention or pagination needs clarification and improvement.

- **[Issue #7661 — Incorrect creation of a new session](https://github.com/agentscope-ai/QwenPaw/issues/7661)** — **5 comments**  
  Selecting a historical conversation can create another session instead of continuing the selected one. The issue points to a state-management problem in active-session tracking, now addressed in principle by [PR #8091](https://github.com/agentscope-ai/QwenPaw/pull/8091).

- **[Issue #7997 — Message retraction/editing and workspace rollback](https://github.com/agentscope-ai/QwenPaw/issues/7997)** — **8 comments**  
  The request reflects a broader need for conversational correction: users want to edit or retract messages, truncate downstream context, and optionally restore workspace files. This is important for safe experimentation with coding and file-manipulation agents.

### WebUI and mobile usability

- **[Issue #6281 — Mobile Web Console support](https://github.com/agentscope-ai/QwenPaw/issues/6281)** — **6 comments**  
  The recurring demand is for a usable mobile layout rather than a desktop interface compressed into a narrow viewport. [PR #8086](https://github.com/agentscope-ai/QwenPaw/pull/8086) directly advances this work.

- **[Issue #8073 — Conversation page inaccessible in V2.2.2.beta4](https://github.com/agentscope-ai/QwenPaw/issues/8073)** — **2 comments**  
  The failure appears specific to LAN access from another device, suggesting secure-context or browser-origin assumptions in the frontend. [PR #8089](https://github.com/agentscope-ai/QwenPaw/pull/8089) is a focused candidate fix.

### Provider and model compatibility

- **[Issue #8074 — GPT-6-family OpenAI provider connection tests return HTTP 400](https://github.com/agentscope-ai/QwenPaw/issues/8074)** — **2 comments**  
  The failure results from outdated model-name matching around token parameters. [PR #8090](https://github.com/agentscope-ai/QwenPaw/pull/8090) addresses the provider-side compatibility gap.

- **[Issue #8092 — Gateway content-inspection false positives classified as bad requests](https://github.com/agentscope-ai/QwenPaw/issues/8092)** — **1 comment**  
  A benign conversation can be terminated when an OpenAI-compatible gateway reports `data_inspection_failed`. The underlying need is more accurate error classification, retry policy, and fallback behavior across heterogeneous gateways.

## 5. Bugs & Stability

### High severity

1. **Console can remain stuck on the boot splash** — [Issue #8094](https://github.com/agentscope-ai/QwenPaw/issues/8094)  
   A stale WebView2 cache after an update can leave users on “LOADING CONSOLE” with neither a retry path nor a visible error. Because the failure occurs at startup and may persist across launches, it can make the application appear unusable. No corresponding fix is listed in the current PR set.

2. **Conversation page becomes inaccessible over LAN HTTP** — [Issue #8073](https://github.com/agentscope-ai/QwenPaw/issues/8073)  
   This is a functional regression or environment-specific failure reported on V2.2.2.beta4. [PR #8089](https://github.com/agentscope-ai/QwenPaw/pull/8089) provides a likely targeted fix, but deployment and merge status should be monitored.

3. **Context overflow can produce silent empty replies** — [PR #8084](https://github.com/agentscope-ai/QwenPaw/pull/8084) / [Issue #8085](https://github.com/agentscope-ai/QwenPaw/issues/8085)  
   Some providers return HTTP 200 with zero completion tokens when the input is too large, while output-length truncation is also not surfaced clearly. Together, these cases can make failures indistinguishable from normal completion. PR #8084 is the more comprehensive active fix candidate.

### Medium severity

4. **Image input is rejected despite advertised multimodal capability** — [Issue #8093](https://github.com/agentscope-ai/QwenPaw/issues/8093)  
   Models such as `mimo-v2.6-flash` and `glm-5.3-flash` are reported as multimodal by the catalog or prober but are blocked by the active runtime.

5. **Image handling hangs in a Bash/PIL cropping loop** — [Issue #8088](https://github.com/agentscope-ai/QwenPaw/issues/8088)  
   The image sub-agent repeatedly crops images instead of directly inspecting them, eventually hanging and returning no reply. This creates a significant failure mode for image-based workflows.

6. **Gateway false positives terminate turns without fallback** — [Issue #8092](https://github.com/agentscope-ai/QwenPaw/issues/8092)  
   `data_inspection_failed` is being treated as a non-retryable bad request, preventing fallback models from being used even when the primary provider is unsuitable.

7. **Duplicate session creation and wrong conversation selection** — [Issue #7661](https://github.com/agentscope-ai/QwenPaw/issues/7661)  
   Incorrect active-chat state can fragment conversations and make navigation unreliable. [PR #8091](https://github.com/agentscope-ai/QwenPaw/pull/8091) is a direct fix attempt.

8. **GPT-6 provider probing fails with HTTP 400** — [Issue #8074](https://github.com/agentscope-ai/QwenPaw/issues/8074)  
   Newer OpenAI models reject the legacy token-limit parameter used by QwenPaw. [PR #8090](https://github.com/agentscope-ai/QwenPaw/pull/8090) targets the problem.

## 6. Feature Requests & Roadmap Signals

### Likely near-term candidates

- **Mobile WebUI improvements** — [Issue #6281](https://github.com/agentscope-ai/QwenPaw/issues/6281) and [PR #8086](https://github.com/agentscope-ai/QwenPaw/pull/8086)  
  The presence of an active PR suggests mobile usability is an immediate roadmap item.

- **Audio understanding** — [Issue #8081](https://github.com/agentscope-ai/QwenPaw/issues/8081) and [PR #8083](https://github.com/agentscope-ai/QwenPaw/pull/8083)  
  Adding `view_audio` would bring QwenPaw closer to parity with its existing image and video tools.

- **More reliable conversation recovery and editing** — [Issue #7997](https://github.com/agentscope-ai/QwenPaw/issues/7997)  
  Message editing, retraction, context truncation, and workspace rollback are strategically important for agent safety and usability, especially for coding sessions.

- **More transparent generation status** — [Issue #8085](https://github.com/agentscope-ai/QwenPaw/issues/8085)  
  Explicitly exposing `finish_reason="length"` would help users distinguish incomplete answers from successful completion. This is a relatively small but high-value reliability improvement.

- **Lark response metadata** — [Issue #8087](https://github.com/agentscope-ai/QwenPaw/issues/8087)  
  Users want the agent name, provider, and model shown with Feishu/Lark responses for transparency and debugging.

### Longer-term or higher-complexity requests

- **Full conversation-history retention and loading** — [Issue #7884](https://github.com/agentscope-ai/QwenPaw/issues/7884)  
  This may require changes to storage, pagination, compression, and frontend state restoration rather than a narrow UI patch.

- **Workspace-aware message rollback** — [Issue #7997](https://github.com/agentscope-ai/QwenPaw/issues/7997)  
  Correctly restoring files after a retracted message is more complex than editing chat history and will require snapshot, diff, and execution-state handling.

## 7. User Feedback Summary

The reported feedback is predominantly negative but actionable, with users identifying concrete friction rather than requesting broad product changes:

- **Conversation continuity is unreliable:** users lose older messages, open the wrong session, or unexpectedly create new sessions ([#7884](https://github.com/agentscope-ai/QwenPaw/issues/7884), [#7661](https://github.com/agentscope-ai/QwenPaw/issues/7661)).
- **WebUI is not consistently usable across environments:** LAN HTTP access can prevent conversation pages from opening ([#8073](https://github.com/agentscope-ai/QwenPaw/issues/8073)), while the console may become unrecoverably stuck after updates ([#8094](https://github.com/agentscope-ai/QwenPaw/issues/8094)).
- **Provider compatibility is lagging behind model evolution:** GPT-6-family probing fails, and gateway-specific error semantics can cause unnecessary turn termination ([#8074](https://github.com/agentscope-ai/QwenPaw/issues/8074), [#8092](https://github.com/agentscope-ai/QwenPaw/issues/8092)).
- **Multimodal support is inconsistent:** advertised image capabilities do not always match runtime behavior, and image processing can hang without user feedback ([#8093](https://github.com/agentscope-ai/QwenPaw/issues/8093), [#8088](https://github.com/agentscope-ai/QwenPaw/issues/8088)).
- **Users want more control and visibility:** mobile layouts, message editing/retraction, scroll locking, tool-call visibility, finish-reason reporting, and model/provider metadata are recurring usability priorities.

Overall, the activity level is high and the project is addressing both foundational reliability and user-facing quality. However, the concentration of open issues around silent failures, session state, provider compatibility, and startup recovery suggests these areas should receive release-gating attention.

## 8. Backlog Watch

- **[Issue #7884 — History unavailable after compression/refresh](https://github.com/agentscope-ai/QwenPaw/issues/7884)**  
  Important because it affects data discoverability and trust in conversation persistence. With eight comments, it warrants a maintainer response clarifying retention limits and whether a fix is planned.

- **[Issue #7997 — Message editing/retraction and workspace rollback](https://github.com/agentscope-ai/QwenPaw/issues/7997)**  
  A broad but highly valuable roadmap request. It needs design decisions around context mutation, file snapshots, and auditability.

- **[Issue #8094 — Console boot splash has no recovery path](https://github.com/agentscope-ai/QwenPaw/issues/8094)**  
  A startup blocker with potentially broad user impact. It should be prioritized for a retry mechanism, actionable error reporting, and cache-recovery guidance.

- **[Issue #8092 — Gateway content-inspection false positives](https://github.com/agentscope-ai/QwenPaw/issues/8092)**  
  Requires provider-error normalization and likely a fallback/retry design across multiple gateway implementations.

- **[Issue #8088 — Image processing hang](https://github.com/agentscope-ai/QwenPaw/issues/8088)**  
  A silent cancellation is especially problematic for users because they receive no actionable failure message. Maintainers should verify the sub-agent routing and add bounded execution or direct multimodal handling.

- **[Issue #8085 — Length-based truncation is not surfaced](https://github.com/agentscope-ai/QwenPaw/issues/8085)**  
  A relatively contained correctness issue that should be prioritized because it affects the interpretation of every generated answer.

- **[PR #8091](https://github.com/agentscope-ai/QwenPaw/pull/8091), [PR #8090](https://github.com/agentscope-ai/QwenPaw/pull/8090), and [PR #8089](https://github.com/agentscope-ai/QwenPaw/pull/8099)**  
  These active fixes map directly to high-impact open bugs and should be monitored for merge, testing, and inclusion in the next release.

</details>

<details>
<summary><strong>ZeroClaw</strong> — <a href="https://github.com/zeroclaw-labs/zeroclaw">zeroclaw-labs/zeroclaw</a></summary>

# ZeroClaw Project Digest — 2026-10-03

## 1. Today's Overview

ZeroClaw shows high development activity, with **50 issues** and **50 pull requests updated in the last 24 hours**; **47 issues remain open or active**, while only **3 were closed**. The project has **no new release**, so recent work appears to be concentrated in stabilization, runtime architecture, security, and the v0.8.6/v0.9.0 preparation pipeline rather than a shipped release. The most urgent areas are subprocess resource control, daemon CPU behavior, session persistence, channel-backed tools, and ZeroCode/RPC reliability. Overall, the high PR volume indicates strong engineering momentum, but the open bug ratio and several release-gate regressions suggest a substantial stabilization and review workload.

## 3. Project Progress

### Pull-request activity

All **50 updated PRs remain open**, with **no PRs reported as merged or closed** during the period. The most substantial active work includes:

- **Opt-in subprocess memory watchdog** — PR [#11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456) adds a disabled-by-default resident-memory limit for shell and skill subprocesses, including descendant-process monitoring. This directly advances Issue [#6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916).
- **Structured native tool-argument recovery** — PR [#11479](https://github.com/zeroclaw-labs/zeroclaw/pull/11479) applies schema-guided recovery when native or text-fallback tool calls contain malformed or stringified structured fields.
- **Standalone gateway expansion** — PRs [#11381](https://github.com/zeroclaw-labs/zeroclaw/pull/11381) and [#11377](https://github.com/zeroclaw-labs/zeroclaw/pull/11377) continue separating gateway functionality from the in-process daemon and add session, run, and version-check APIs.
- **Feature-gated SaaS and coding-CLI tools** — PR [#11221](https://github.com/zeroclaw-labs/zeroclaw/pull/11221) seeks to make broad integrations opt-in rather than compiling them into every build, reducing dependency and attack surface.
- **Configuration apply-result tracking** — PR [#11466](https://github.com/zeroclaw-labs/zeroclaw/pull/11466) advances canonical configuration generations and per-target application results, supporting more accurate live-configuration behavior.
- **ZeroCode context management** — PR [#10905](https://github.com/zeroclaw-labs/zeroclaw/pull/10905) adds explicit recoverable context compaction and restoration commands.
- **RPC and channel correctness** — PRs [#11452](https://github.com/zeroclaw-labs/zeroclaw/pull/11452) and [#10986](https://github.com/zeroclaw-labs/zeroclaw/pull/10986) address missing or incorrectly reconstructed live channel instances in session tools.
- **RPC security parity** — PR [#11182](https://github.com/zeroclaw-labs/zeroclaw/pull/11182) expands core RPC coverage for workspace, catalog, canvas, pairing, channels, and system operations as part of the planned gateway/client split.
- **Session persistence and ownership** — PR [#10412](https://github.com/zeroclaw-labs/zeroclaw/pull/10412) introduces a shared atomic session-ownership claim contract; PR [#9746](https://github.com/zeroclaw-labs/zeroclaw/pull/9746) adds per-agent ownership scoping for session tools and Discord search.
- **TLS trust improvements** — PRs [#11443](https://github.com/zeroclaw-labs/zeroclaw/pull/11443) and [#10712](https://github.com/zeroclaw-labs/zeroclaw/pull/10712) address `SSL_CERT_FILE` and platform-root trust for outbound WebSocket connections.

### Closed issues

Only three issue closures are reflected in the data:

- [#11369](https://github.com/zeroclaw-labs/zeroclaw/issues/11369) — Docker images built from `master` failed at startup, and interrupted upgrades could strand the database. The issue is marked **closed**, but the underlying release-gate concern is significant.
- [#10791](https://github.com/zeroclaw-labs/zeroclaw/issues/10791) — local RPC connections could remain alive after a terminal writer failure. The issue is marked **closed**, addressing a ZeroCode/daemon lifecycle gap.
- A third closed issue is included in the source data’s issue set but is not shown among the top 30 issue summaries, so its subject cannot be characterized reliably here.

## 4. Community Hot Topics

### Issues

- [#9965 — Harden runtime-written executable test fixtures](https://github.com/zeroclaw-labs/zeroclaw/issues/9965) — **13 comments**, the most discussed item. The work targets executable test fixtures created after the process becomes multithreaded and reflects broader concern around deterministic parallel-runtime testing.
- [#5808 — Defer built-in tool schemas to reduce the fixed prompt floor](https://github.com/zeroclaw-labs/zeroclaw/issues/5808) — **10 comments**. This is a high-impact agent-loop issue: the default 32K context budget can reportedly be exceeded by the first iteration because built-in tool schemas consume too much prompt space.
- [#9799 — Long-lived ephemeral daemon can enter sustained multi-core CPU spin](https://github.com/zeroclaw-labs/zeroclaw/issues/9799) — **7 comments**. The report describes a daemon consuming 140–177% CPU for approximately 17 hours, including repeated activity after a Telegram socket became closed. This indicates a potentially serious long-running service stability problem.
- [#6105 — Agent lacks context of the cron job it is running](https://github.com/zeroclaw-labs/zeroclaw/issues/6105) — **6 comments**. Scheduled-agent responses lack provenance and message context, reducing reliability for reminders and channel-based workflows.
- [#6916 — Add process-memory limits to shell and skill subprocesses](https://github.com/zeroclaw-labs/zeroclaw/issues/6916) — **5 comments**. Existing output and timeout controls do not prevent a child process from exhausting host or container memory.
- [#7468 — Rename non-agent aliases in Zerocode](https://github.com/zeroclaw-labs/zeroclaw/issues/7468) — **4 comments**. The request targets usability and configuration consistency for model providers, MCP servers, and agents.
- [#7743 — Support approval forwarding for independent delegate handoffs](https://github.com/zeroclaw-labs/zeroclaw/issues/7743) — **4 comments**. This exposes a broader need for clearer delegation boundaries and policy-aware multi-agent execution.
- [#5836 — Add cooperative cancellation to the Tool execution contract](https://github.com/zeroclaw-labs/zeroclaw/issues/5836) — **4 comments**. Long-running tools such as shell commands and HTTP requests cannot currently be stopped promptly through the agent cancellation token.
- [#10225 — ZeroCode RPC sessions cannot reach configured channels](https://github.com/zeroclaw-labs/zeroclaw/issues/10225) — **3 comments**. This is a workflow-blocking integration defect: agents launched through ZeroCode RPC cannot use configured channel-backed tools.
- [#10700 — Cost records use a daemon-lifetime session ID](https://github.com/zeroclaw-labs/zeroclaw/issues/10700) — **3 comments**. Cost attribution is not conversation-scoped, making per-agent and per-chat spending analysis unreliable.

### Pull requests

- [#11477 — Propose shell memory watchdog exception](https://github.com/zeroclaw-labs/zeroclaw/pull/11477)
- [#11479 — Recover structured native tool arguments](https://github.com/zeroclaw-labs/zeroclaw/pull/11479)
- [#11221 — Gate SaaS and coding-CLI tools behind opt-in features](https://github.com/zeroclaw-labs/zeroclaw/pull/11221)
- [#11381 — Serve session messages, state, and delete from the gateway](https://github.com/zeroclaw-labs/zeroclaw/pull/11381)
- [#11377 — Serve gateway runs and version-check APIs](https://github.com/zeroclaw-labs/zeroclaw/pull/11377)
- [#11182 — Add core RPC parity across major daemon operations](https://github.com/zeroclaw-labs/zeroclaw/pull/11182)
- [#10836 — Move declarative cron-job ownership](https://github.com/zeroclaw-labs/zeroclaw/pull/10836)
- [#11450 — Recover delegate settlements after worker exit](https://github.com/zeroclaw-labs/zeroclaw/pull/11450)
- [#11466 — Report per-target configuration application results](https://github.com/zeroclaw-labs/zeroclaw/pull/11466)
- [#10412 — Extract atomic session-ownership claims](https://github.com/zeroclaw-labs/zeroclaw/pull/10412)

The activity is highly concentrated in architectural and reliability work rather than small incremental changes. Several PRs are large, cross-cutting, and explicitly depend on other work, which likely explains the absence of merges and points to a complex integration queue.

## 5. Bugs & Stability

### Highest severity

1. **Daemon startup and upgrade failure** — [#11369](https://github.com/zeroclaw-labs/zeroclaw/issues/11369), marked **S1 / workflow blocked** and release-gated for v0.8.6.  
   Docker images built from `master` exited at startup, while an interrupted upgrade could leave the database inaccessible or stranded. The issue is closed, but maintainers should verify that the release pipeline no longer permits images or upgrades with incompatible data-directory state.

2. **Long-lived daemon CPU spin** — [#9799](https://github.com/zeroclaw-labs/zeroclaw/issues/9799), **S1 / high risk**.  
   A daemon reportedly sustained 140–177% CPU for 17 hours after a channel socket closed. The absence of a linked fix in the supplied data makes this a key watch item. The issue is marked `needs-repro`, so instrumentation, lifecycle tracing, and a minimized reproduction remain important.

3. **ZeroCode channel-backed tools unavailable** — [#10225](https://github.com/zeroclaw-labs/zeroclaw/issues/10225), **S1 / workflow blocked**.  
   RPC sessions can start channels but cannot use them through tools such as `git_forge`. Active PRs [#11452](https://github.com/zeroclaw-labs/zeroclaw/pull/11452) and [#10986](https://github.com/zeroclaw-labs/zeroclaw/pull/10986) appear directly related and may provide the implementation path.

4. **Failed ACP turns are not persisted on the ZeroCode Code path** — [#10673](https://github.com/zeroclaw-labs/zeroclaw/issues/10673), **S1 / workflow blocked**.  
   Failed and cancelled turns can be lost from the daemon RPC path. This is a direct follow-up to the broader ACP persistence work in [#9333](https://github.com/zeroclaw-labs/zeroclaw/issues/9333).

5. **Zerocode launch-directory regression** — [#11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387), release-gated for v0.8.6.  
   Sessions again ignore the shell directory from which Zerocode was launched and use the configured agent workspace instead. This is a recurrence of [#10609](https://github.com/zeroclaw-labs/zeroclaw/issues/10609), making regression coverage especially important.

### Other notable stability issues

- [#11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332) — skill review and skill creation do not run for channel, webhook, or gateway turns.
- [#11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333) — skill review tools cannot see skills supplied through `skill_bundles`.
- [#11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336) — plugin verification reports `[loads]` for a plugin that the runtime rejects.
- [#10741](https://github.com/zeroclaw-labs/zeroclaw/issues/10741) — ZeroCode can silently pause queued work after an apparently normal completion.
- [#9736](https://github.com/zeroclaw-labs/zeroclaw/issues/9736) — the RPC prompt path does not persist `SessionState`.
- [#11296](https://github.com/zeroclaw-labs/zeroclaw/issues/11296) — custom or llama.cpp provider URIs are mishandled when discovering models.
- [#9799](https://github.com/zeroclaw-labs/zeroclaw/issues/9799) — CPU spin remains unresolved in the supplied data.
- [#10700](https://github.com/zeroclaw-labs/zeroclaw/issues/10700) — cost records cannot be separated reliably by conversation.

No new release was published, so these fixes are not yet reflected in a versioned artifact.

## 6. Feature Requests & Roadmap Signals

### Likely near-term roadmap candidates

- **Subprocess resource controls** — [#6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916) and PR [#11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456) are positioned for a near-term release, subject to review and platform validation.
- **Tool-schema deferral** — [#5808](https://github.com/zeroclaw-labs/zeroclaw/issues/5808) is a high-priority agent-loop optimization. If the implementation is stable, it could materially improve context utilization and first-turn reliability.
- **Gateway process separation** — [#11002](https://github.com/zeroclaw-labs/zeroclaw/issues/11002), [#11377](https://github.com/zeroclaw-labs/zeroclaw/pull/11377), and [#11381](https://github.com/zeroclaw-labs/zeroclaw/pull/11381) indicate an active v0.9.0 architectural direction: the web gateway is becoming an optional standalone IPC client rather than an in-process dependency.
- **Configuration generation and live apply status** — [#10892](https://github.com/zeroclaw-labs/zeroclaw/issues/10892) and PR [#11466](https://github.com/zeroclaw-labs/zeroclaw/pull/11466) provide the foundation for reliable hot configuration updates.
- **Tool cancellation and delegate lifecycle controls** — [#5836](https://github.com/zeroclaw-labs/zeroclaw/issues/5836) and PR [#11450](https://github.com/zeroclaw-labs/zeroclaw/pull/11450) show increasing focus on deterministic shutdown, recovery, and multi-agent safety.
- **Persistent session attachments and context management** — PRs [#10407](https://github.com/zeroclaw-labs/zeroclaw/pull/10407) and [#10905](https://github.com/zeroclaw-labs/zeroclaw/pull/10905) point toward richer long-lived session UX.
- **A2A protocol crate** — RFC [#11254](https://github.com/zeroclaw-labs/zeroclaw/issues/11254) signals a longer-term move toward a formalized agent-to-agent interoperability boundary.

### UX and policy features

- Rename non-agent aliases in Zerocode: [#7468](https://github.com/zeroclaw-labs/zeroclaw/issues/7468).
- Show subagent activity and expandable tool results: [#8763](https://github.com/zeroclaw-labs/zeroclaw/issues/8763).
- Expose intra-family provider fallback notices: [#7883](https://github.com/zeroclaw-labs/zeroclaw/issues/7883).
- Support approval forwarding for independent delegate handoffs: [#7743](https://github.com/zeroclaw-labs/zeroclaw/issues/7743).
- Define truthful lifecycle semantics for `sessions_send`: [#10293](https://github.com/zeroclaw-labs/zeroclaw/issues/10293).

The roadmap appears to be balancing product expansion—gateway, plugins, channels, ZeroCode, and A2A—with foundational controls around ownership, cancellation, resource limits, and observability.

## 7. User Feedback Summary

### Recurring pain points

- **Resource exhaustion and runaway execution**  
  Users report shell or skill subprocesses consuming excessive memory and a daemon sustaining unusually high CPU usage. See [#6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916) and [#9799](https://github.com/zeroclaw-labs/zeroclaw/issues/9799).

- **Unreliable session and channel behavior**  
  Scheduled jobs lack execution context, ZeroCode RPC sessions cannot access configured channels, failed turns may not persist, and queued work can pause unexpectedly. See [#6105](https://github.com/zeroclaw-labs/zeroclaw/issues/6105), [#10225](https://github.com/zeroclaw-labs/zeroclaw/issues/10225), [#10673](https://github.com/zeroclaw-labs/zeroclaw/issues/10673), and [#10741](https://github.com/zeroclaw-labs/zeroclaw/issues/10741).

- **Configuration and skill-management inconsistencies**  
  Skill bundles load successfully but are invisible to review tools, and learning features are absent from channel and gateway turns. Plugin verification can also disagree with runtime registration. See [#11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333), [#11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332), and [#11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336).

- **Poor observability and attribution**  
  Cost records are daemon-scoped rather than conversation-scoped, and RPC session state is not consistently persisted. See [#10700](https://github.com/zeroclaw-labs/zeroclaw/issues/10700) and [#9736](https://github.com/zeroclaw-labs/zeroclaw/issues/9736).

- **Deployment friction**  
  Docker and interrupted-upgrade behavior

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*