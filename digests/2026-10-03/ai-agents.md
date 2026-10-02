# OpenClaw Ecosystem Digest 2026-10-03

> Issues: 496 | PRs: 500 | Projects covered: 5 | Generated: 2026-10-02 20:23 UTC

- [OpenClaw](https://github.com/openclaw/openclaw)
- [Hermes Agent](https://github.com/nousresearch/hermes-agent)
- [IronClaw](https://github.com/nearai/ironclaw)
- [QwenPaw](https://github.com/agentscope-ai/QwenPaw)
- [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw)

---

## OpenClaw Deep Dive

# OpenClaw Project Digest — 2026-10-03

## 1. Today's Overview

OpenClaw remains highly active, with **496 issues** and **500 pull requests** updated in the last 24 hours; approximately two-thirds of each remain open or active. The project is primarily in a **stabilization phase**, with strong attention on model-catalog memory growth, gateway/SQLite contention, restart recovery, process leaks, and message delivery. Two `extended-stable` gateway releases were published—**v2026.8.34** and **v2026.8.35**—focused on critical security, reliability, performance, and model-support improvements. The volume of P0/P1 reports and proof-gated migration/security PRs suggests substantial engineering activity, but also a growing operational and maintenance burden.

**Activity assessment:** Very high churn, with stabilization and state-management correctness outweighing feature expansion.

---

## 2. Releases

### [v2026.8.35](https://github.com/openclaw/openclaw/releases/tag/v2026.8.35)

- Gateway-only `extended-stable` release, OpenClaw’s current equivalent to LTS.
- Based on OpenClaw from the end of August 2026.
- Includes:
  - Critical security updates.
  - Reliability and performance fixes.
  - New model support.

### [v2026.8.34](https://github.com/openclaw/openclaw/releases/tag/v2026.8.34)

- Also a gateway-only `extended-stable` release.
- Carries the same broad stabilization, security, performance, and model-support scope.

### Release assessment

The supplied release notes do not identify explicit breaking changes or mandatory migration steps. However, the issue backlog around 2026.9.x highlights serious memory, startup, provider, and persistence problems, so operators should treat the stable line as the lower-risk deployment path and review the [2026.9.3/2026.9.4 upgrade and recovery tracking issue](https://github.com/openclaw/openclaw/issues/145252) before upgrading recovery-sensitive installations.

---

## 3. Project Progress

The visible PR set shows movement in several important areas:

- **Gateway startup and session lifecycle**
  - [PR #163690](https://github.com/openclaw/openclaw/pull/163690) proposes opening the listener before validating a multi-gigabyte store and honoring clean-close receipts. This directly targets slow startup while preserving admission safety.
  - [PR #163763](https://github.com/openclaw/openclaw/pull/163763) demotes idle materialized session rows so long-lived gateways do not retain unnecessary session graphs.

- **Model-catalog worker performance**
  - [PR #162226](https://github.com/openclaw/openclaw/pull/162226) addresses repeated plugin reloads when the catalog scope grows. It is directly related to the catalog-worker memory and CPU reports, including [#159662](https://github.com/openclaw/openclaw/issues/159662), [#160548](https://github.com/openclaw/openclaw/issues/160548), and [#161379](https://github.com/openclaw/openclaw/issues/161379).
  - [PR #157575](https://github.com/openclaw/openclaw/pull/157575) addresses managed-gateway heap settings overriding worker-specific limits.

- **Session and state correctness**
  - [PR #163723](https://github.com/openclaw/openclaw/pull/163723) retires unshipped agent-session schemas, reducing unnecessary migration complexity.
  - [PR #162920](https://github.com/openclaw/openclaw/pull/162920) moves legacy ACP session metadata migration into Doctor. It is marked **needs proof** and carries compatibility and security-boundary risk.
  - [PR #119055](https://github.com/openclaw/openclaw/pull/119055) hardens Code Mode continuation and input persistence against stale or foreign ownership.
  - [PR #112709](https://github.com/openclaw/openclaw/pull/112709) proposes atomic managed TaskFlow cancellation state.

- **Agent context and UX**
  - [PR #138084](https://github.com/openclaw/openclaw/pull/138084) introduces an agent-requested `session_compact` tool, allowing long-running assistants to archive completed topics before automatic token pressure.
  - [PR #127389](https://github.com/openclaw/openclaw/pull/127389) hides internal completion wakes and generated-media/subagent notifications from normal chat history.
  - [PR #163761](https://github.com/openclaw/openclaw/pull/163761) fixes Workboard Sessions boards on multi-agent Gateways.
  - [PR #163762](https://github.com/openclaw/openclaw/pull/163762) fixes scrolling and initial-frame behavior for video widgets.

- **Platform capabilities**
  - [PR #142954](https://github.com/openclaw/openclaw/pull/142954) and [PR #143216](https://github.com/openclaw/openclaw/pull/143216) advance Wear OS Gateway conversations, shared authentication, and approvals. Both remain large and security-sensitive.

- **Maintenance and refactoring**
  - [PR #163759](https://github.com/openclaw/openclaw/pull/163759) consolidates duplicated Telegram dispatch, delivery, callback, and configuration plumbing.
  - [PR #163186](https://github.com/openclaw/openclaw/pull/163186) retires obsolete pre-July OAuth sidecar imports.
  - [PR #163752](https://github.com/openclaw/openclaw/pull/163752) and [PR #163737](https://github.com/openclaw/openclaw/pull/163737) reduce unnecessary test builds and load-dependent flakiness.

Overall, the PR backlog is strongly oriented toward **resource ownership, state durability, startup availability, and architectural cleanup**, rather than broad new-agent features.

---

## 4. Community Hot Topics

The most discussed active issues are:

1. [Realtime voice work can retain unbounded provider and consult state — #116201](https://github.com/openclaw/openclaw/issues/116201)  
   **59 comments.** Realtime voice lacks hard ownership bounds, allowing superseded consult work, large frames, and audio data to accumulate under slow or bursty providers. This exposes a need for explicit cancellation, buffering limits, and session-level resource accounting.

2. [Embedded prompt cache breaks across session boundaries — #102175](https://github.com/openclaw/openclaw/issues/102175)  
   **21 comments.** Tool inventory and policy state appear to change across room events, compaction, recovery, and Responses continuations. Users need predictable cache reuse, especially for long-lived embedded sessions.

3. [Vertex/Gemini 3.1 Pro Preview failure after 2026.3.2 — #38327](https://github.com/openclaw/openclaw/issues/38327)  
   **18 comments.** A long-standing P0 provider regression produces `Cannot convert undefined or null to object`. Despite available source reproduction and clear impact, it still needs a maintainer-reviewed fix.

4. [Plugin-generation supersede kills system-agent turn — #139710](https://github.com/openclaw/openclaw/issues/139710)  
   **18 comments.** Hot reload or supersession can terminate both the active system-agent turn and its planner fallback, surfacing a misleading “unreachable inference” error.

5. [Unreaped hook/tool child processes — #97616](https://github.com/openclaw/openclaw/issues/97616)  
   **17 comments.** Zombie process accumulation is associated with long-term runtime degradation and possible crash loops.

6. [Second run displaces an in-flight turn and loses the reply — #148707](https://github.com/openclaw/openclaw/issues/148707)  
   **17 comments.** This is a direct session-authority and message-loss regression: the displaced turn terminates without retry or recovery.

7. [Prepared-model-catalog worker leaks memory — #159662](https://github.com/openclaw/openclaw/issues/159662)  
   **14 comments.** Reports estimate approximately 4–5 GB/hour of growth across providers and configurations. This is now one of the clearest gateway-wide reliability threats.

8. [Upgrade and recovery reliability tracking for 2026.9.3/2026.9.4 — #145252](https://github.com/openclaw/openclaw/issues/145252)  
   **12 comments.** The coordinated issue reflects broader problems involving migrations, Doctor, rollback, restart, and recovery rather than a single defect.

### Underlying community needs

The dominant demand is not for more surface-level features. Users and operators need:

- Hard resource limits and predictable cleanup.
- Durable single-writer or clearly owned session state.
- Safe recovery after restarts and supersession.
- Consistent provider adapters and cache behavior.
- Faster, safer upgrades with reliable rollback.
- Better visibility into degraded but still functioning components.

---

## 5. Bugs & Stability

### P0 — urgent release or availability risk

- **[Gateway startup is slowed by plugin count — #155859](https://github.com/openclaw/openclaw/issues/155859)**  
  Startup exceeds the 120-second publication budget in plugin-heavy installations. **Potential related PR:** [#163690](https://github.com/openclaw/openclaw/pull/163690), though that focuses on store validation rather than all plugin startup cost.

- **[Prepared-model-catalog worker memory leak — #159662](https://github.com/openclaw/openclaw/issues/159662)**  
  Provider-agnostic leak reported at 4–5 GB/hour. **Related PR:** [#162226](https://github.com/openclaw/openclaw/pull/162226).

- **[Gateway state-DB admission crash — #160521](https://github.com/openclaw/openclaw/issues/160521)**  
  Read-admission seal and closed worker-environment inventory lead to an unhandled rejection during `reconcileActive`. No clear fix PR is identified.

- **[Subscription-auth billing cooldown persists for roughly five hours — #115642](https://github.com/openclaw/openclaw/issues/115642)**  
  Outages can disable a provider long after recovery. Requested remedies include probe-based recovery, shorter usage-limit TTLs, and a manual reset command.

- **[Main-session heap OOM and core-dump restart loop — #115424](https://github.com/openclaw/openclaw/issues/115424)**  
  Automatic restart recovery repeatedly hot-resumes the oversized session, turning one crash into a persistent failure loop.

- **[Desktop app boot-loops the Gateway — #115256](https://github.com/openclaw/openclaw/issues/115256)**  
  `doctor` reportedly recommends a repair that the desktop app immediately reverts.

### P1 — high-impact reliability, security, or data-loss risk

- **[Child-process leak and zombie accumulation — #97616](https://github.com/openclaw/openclaw/issues/97616)**
- **[In-flight reply loss during same-session displacement — #148707](https://github.com/openclaw/openclaw/issues/148707)**
- **[WhatsApp DM durable handoff failure after restart — #161976](https://github.com/openclaw/openclaw/issues/161976)**
- **[SQLite contention causes roughly 33-second event-loop stalls — #117262](https://github.com/openclaw/openclaw/issues/117262)**
- **[Model-catalog leak kills waiting turns during memory reclamation — #160548](https://github.com/openclaw/openclaw/issues/160548)**
- **[Catalog refresh loop pins a CPU core — #161379](https://github.com/openclaw/openclaw/issues/161379)**
- **[Codex intermittent 403 after in-place model switch — #162119](https://github.com/openclaw/openclaw/issues/162119)**
- **[Internal reasoning leakage — #91804](https://github.com/openclaw/openclaw/issues/91804)**
- **[Telegram WebChat restart-recovery claim regression — #118839](https://github.com/openclaw/openclaw/issues/118839)**
- **[Claude CLI subagent turns fail transcript-writer rebinding — #154572](https://github.com/openclaw/openclaw/issues/154572)**

### P2 — important correctness and usability issues

- **[Realtime voice retains unbounded state — #116201](https://github.com/openclaw/openclaw/issues/116201)**
- **[Cross-agent dreaming contaminates identity and memory — #65374](https://github.com/openclaw/openclaw/issues/65374)**
- **[Dreaming candidates are evicted before promotion — #150635](https://github.com/openclaw/openclaw/issues/150635)**
- **[Dreaming ranker and applier disagree on eligibility — #121232](https://github.com/openclaw/openclaw/issues/121232)**
- **[Telegram progress duplicates initial commentary — #116512](https://github.com/openclaw/openclaw/issues/116512)**
- **[Matrix rooms can loop on no-reply and stale replay — #114211](https://github.com/openclaw/openclaw/issues/114211)**
- **[Claude CLI session limits do not trigger fallback — #118793](https://github.com/openclaw/openclaw/issues/118793)**
- **[Discord reports degraded status with SecretRef/env credentials — #160610](https://github.com/openclaw/openclaw/issues/160610)**

### Notable closed regressions

- [Normal tool text degrading into image placeholders — #96857](https://github.com/openclaw/openclaw/issues/96857)
- [Provider request-schema rejection — #108075](https://github.com/openclaw/openclaw/issues/108075)
- [Control UI navigation regression — #108182](https://github.com/openclaw/openclaw/issues/108182)
- [Windows session-creation publication guard failure — #161953](https://github.com/openclaw/openclaw/pull/161953)
- [Telegram DM reply fallback regression — #111519](https://github.com/openclaw/openclaw/issues/111519)

These closures are positive, but the high recurrence of ownership and publication-authority defects suggests that regression testing around restart, concurrency, and durable handoff needs strengthening.

---

## 6. Feature Requests & Roadmap Signals

- **Per-agent dreaming controls — [#67413](https://github.com/openclaw/openclaw/issues/67413)**  
  Requested controls include disabling dreaming per agent, staggering workspaces, and controlling memory spikes. The active memory bugs make this likely to be addressed in the next stabilization phase.

- **Agent-requested context compaction — [PR #138084](https://github.com/openclaw/openclaw/pull/138084)**  
  A plausible near-term feature because it directly mitigates long-session token waste and gives agents better control over topic transitions. It is still marked **needs proof**.

- **Provider-neutral memory runtime — [PR #162175](https://github.com/openclaw/openclaw/pull/162175)**  
  Allows memory plugins not backed by workspace files to participate in recall. This is strategically important for extensibility, though security-sensitive and compatibility-sensitive.

- **Wear OS Gateway conversations and approvals — [PR #143216](https://github.com/openclaw/openclaw/pull/143216)**  
  A substantial client-platform expansion, dependent on shared Gateway-client work. It is not likely to ship immediately because the stack remains draft and proof-gated.

- **macOS background launch mode — [PR #163758](https://github.com/openclaw/openclaw/pull/163758)**  
  Adds `--no-activate` for automation that should not steal focus. This is relatively contained and has a clear personal-assistant use case.

### Near-term prediction

The next release is more likely to emphasize:

1. Model-catalog worker lifecycle and memory bounds.
2. Gateway startup, SQLite, and restart-recovery reliability.
3. Session ownership and message-delivery correctness.
4. Memory-core isolation and scheduling.
5. Smaller UX additions such as background macOS launching.

---

## 7. User Feedback Summary

### Primary user pain points

- **Replies are being lost or duplicated.** Same-session displacement, WhatsApp restart handoff, duplicate transcript writers, and failed subagent delivery make users distrust session continuity.
- **Gateways consume excessive resources.** Reported symptoms include multi-gigabyte worker growth, CPU pinning, zombie processes, 30-second event-loop stalls, and repeated core dumps.
- **Upgrades are not sufficiently predictable.** Users report severe 2026.9.x startup, migration, recovery, provider, and platform regressions despite a coordinated tracking issue.
- **Provider behavior remains inconsistent.** Vertex/Gemini, Codex, Claude CLI, OpenAI Responses, and subscription-auth cooldown failures all suggest that adapter-level conformance needs strengthening.
- **Memory features are not yet safe for multi-agent use.** Shared dreaming corpora, identity contamination, eviction-before-promotion, and ranker/applier disagreement are preventing reliable long-term personalization.
- **Security and privacy regressions are especially damaging.** Internal reasoning leakage, cross-agent memory sharing, and owner-verification failures directly affect trust.

### Positive/use-case signals

- Users are actively deploying OpenClaw as a long-running personal assistant across WhatsApp, Telegram, Discord, Matrix, WebChat, WeChat, macOS, Android, and planned Wear OS.
- Automation is a growing use case, particularly background app launch, task cancellation, and multi-agent Workboard management.
- Several closed issues indicate that maintainers are responsive to concrete regressions, while proof-gated PRs show increasing attention to security boundaries and durable-state proof.

---

## 8. Backlog Watch

### Long-unanswered or maintenance-dependent issues

- **[Vertex/Gemini regression, open since March — #38327](https://github.com/openclaw/openclaw/issues/38327)**  
  Despite source reproduction and P0 impact, it lacks a new fix PR and needs maintainer ownership.

- **[Cross-agent dreaming identity contamination, open since April — #65374](https://github.com/openclaw/openclaw/issues/65374)**  
  Security, privacy, and data-model implications require an explicit product decision.

- **[Per-agent dreaming controls — #67413](https://github.com/openclaw/openclaw/issues/67413)**  
  Older feature request now tied directly to multiple active memory-reliability issues.

- **[Codex steady-state CPU and helper-process overhead — #84037](https://github.com/openclaw/openclaw/issues/84037)**  
  Important for always-on personal-assistant deployments but requires profiling and maintainer prioritization.

- **[Realtime voice resource bounds — #116201](https://github.com/openclaw/openclaw/issues/116201)**  
  The highest-comment issue in the sample and still needs a live reproduction or ownership-bound design decision.

- **[Matrix no-reply/restart loops — #114211](https://github.com/openclaw/openclaw/issues/114211)**  
  High-impact room-agent behavior with security and session-state implications.

- **[Desktop Gateway boot loop — #115256](https://github.com/openclaw/openclaw/issues/115256)**  
  Stable-channel user impact despite being older; no replacement fix is evident in the supplied data.

- **[Usage-cost cache lock can freeze permanently in containers — #114234](https://github.com/openclaw/openclaw/issues/114234)**  
  Container-specific but operationally dangerous because PID reuse defeats ownership validation.

### PRs requiring maintainer attention

- [#162226](https://github.com/openclaw/openclaw/pull/162226) — model

---

## Cross-Ecosystem Comparison

# Cross-Project Ecosystem Comparison — 2026-10-03

## 1. Ecosystem Overview

The personal AI agent ecosystem is moving from feature expansion toward **production-grade reliability, state integrity, resource governance, and secure interoperability**. OpenClaw, Hermes Agent, and ZeroClaw show very high development churn, while QwenPaw is addressing a smaller set of WebUI, session, and multimodal issues; IronClaw had no activity in the sampled period. Across active projects, the common operational challenge is keeping long-running, multimodal, multi-agent systems observable and trustworthy rather than merely capable. The strongest near-term differentiator is therefore lifecycle management—memory bounds, cancellation, recovery, durable messaging, and predictable provider behavior—rather than access to another model or chat interface.

## 2. Activity Comparison

| Project | Issues updated | PRs updated | Release status | Health score* |
|---|---:|---:|---|---|
| **OpenClaw** | 496 | 500 | Two `extended-stable` releases: v2026.8.34 and v2026.8.35 | **6.5/10** — extremely active, but under substantial stabilization and operational load |
| **Hermes Agent** | 50 | 50 | No release | **6.5/10** — strong development momentum with session, Desktop, Windows, and integration risks |
| **IronClaw** | 0 | 0 | No release reported | **N/A** — insufficient activity to assess current health |
| **QwenPaw** | 10 | 4 | No release | **6.0/10** — focused maintenance, but exposed by a beta regression and session defects |
| **ZeroClaw** | 50 | 50 | No release; multiple fixes targeted at v0.8.6 | **5.5/10** — highly active and security-conscious, but 48 open PRs imply elevated review and release risk |

\*Health scores are qualitative assessments derived from activity, release posture, issue severity, and remediation maturity—not formal project metrics. “Issues updated” and “PRs updated” measure daily attention, not necessarily net repository growth.

## 3. OpenClaw's Position

### Advantages versus peers

- **Scale and ecosystem breadth:** OpenClaw has by far the largest sampled activity volume, with nearly 1,000 combined issue and PR updates in 24 hours. Its multi-channel footprint—WhatsApp, Telegram, Discord, Matrix, WebChat, WeChat, desktop, mobile, and planned Wear OS support—is broader than the alternatives described.
- **Mature stabilization channel:** The two gateway-only `extended-stable` releases provide a lower-risk deployment path explicitly positioned as OpenClaw’s equivalent to LTS.
- **Deep state-management investment:** OpenClaw is addressing startup admission, SQLite contention, session ownership, restart recovery, cancellation, provider adapters, and durable message handoff at an architectural level.
- **Strong extensibility trajectory:** Provider-neutral memory runtimes, agent-requested context compaction, Workboard multi-agent support, and platform expansion indicate a broad personal-assistant platform rather than a narrowly scoped coding agent.
- **Large operational feedback surface:** Its high issue volume also indicates a large deployment base and strong real-world testing, although it raises maintenance costs.

### Technical approach differences

- **OpenClaw** emphasizes an always-on gateway, durable multi-channel sessions, plugin/provider catalogs, persistent memory, and extensive client surfaces. Its main challenge is controlling complexity inside a mature, stateful platform.
- **Hermes Agent** focuses heavily on Desktop usability, remote gateway connectivity, skills, local-model workflows, Google Workspace, and cross-agent collaboration. It is pursuing a more client- and integration-oriented architecture.
- **ZeroClaw** emphasizes local/runtime control: subprocess memory limits, Windows security, cooperative tool cancellation, ZeroCode/ACP workflows, gateway inspection, and delegation policy. It appears more runtime- and operator-oriented.
- **QwenPaw** prioritizes a multi-agent workspace and WebUI, with recent work on reload lifecycle, multimodal perception, conversation editing, and cross-instance coordination.
- **IronClaw** cannot be meaningfully differentiated from the supplied daily data because it recorded no activity.

### Community size comparison

OpenClaw clearly has the broadest observable community activity: its busiest issues have tens of comments, but its issue and PR throughput is roughly ten times that of the other active projects. Hermes Agent has the strongest visible strategic discussion, particularly around cross-gateway collaboration and Desktop reliability. ZeroClaw and QwenPaw show concentrated specialist engagement, while IronClaw provides no current momentum signal.

## 4. Shared Technical Focus Areas

| Technical focus | Projects | Emerging requirement |
|---|---|---|
| **Session and conversation integrity** | OpenClaw, Hermes Agent, QwenPaw | Prevent displaced turns, duplicate replies, session fragmentation, wrong-session affinity, and loss of context across restart or reload. |
| **Explicit lifecycle and recovery** | OpenClaw, Hermes Agent, QwenPaw, ZeroClaw | Make cancellation, drain timeout, failed-turn persistence, restart recovery, and terminal status deterministic and visible. |
| **Memory and resource bounds** | OpenClaw, Hermes Agent, ZeroClaw | Enforce hard limits for workers, subprocesses, audio buffers, compaction lineage, and persistent session data. |
| **Provider and model reliability** | OpenClaw, Hermes Agent, ZeroClaw, QwenPaw | Standardize provider configuration, fallback, context limits, cache behavior, model switching, and timeout semantics. |
| **Desktop and gateway connectivity** | OpenClaw, Hermes Agent, ZeroClaw | Make private-CA TLS, WebSockets, backend status, reload, and LAN access work consistently across process boundaries. |
| **Long-running tool control** | ZeroClaw, Hermes Agent, QwenPaw | Support cooperative cancellation, configurable deadlines, live-status signaling, and reliable process cleanup. |
| **Skills and plugin correctness** | Hermes Agent, ZeroClaw, OpenClaw | Improve discovery without excessive prompt cost and ensure inspection tools reflect actual runtime availability. |
| **Multi-agent delegation and interoperability** | Hermes Agent, OpenClaw, ZeroClaw, QwenPaw | Add cross-agent or cross-gateway collaboration while preserving identity, permissions, provenance, and approval boundaries. |
| **Security and privacy** | OpenClaw, Hermes Agent, ZeroClaw | Harden secret storage, remote images, Windows path parsing, memory isolation, owner verification, and delegated approvals. |
| **Operational observability** | All active projects | Clearly distinguish completed, failed, paused, canceled, truncated, blocked, and still-running work. |

The most urgent shared requirement is a **single-writer, explicitly owned lifecycle model for every turn**. Message delivery, compaction, cancellation, and recovery all depend on the runtime knowing which agent, client, or gateway instance is authoritative.

## 5. Differentiation Analysis

### Feature focus

- **OpenClaw:** Broad personal-assistant platform centered on a persistent gateway, many messaging channels, model/provider extensibility, memory, automation, and cross-client access.
- **Hermes Agent:** Desktop-first agent experience, remote gateway use, skills, local models, productivity integrations, and cross-gateway collaboration.
- **ZeroClaw:** Runtime safety, subprocess governance, ZeroCode/ACP workflows, plugin and skill integrity, gateway inspection, and local/operator control.
- **QwenPaw:** Multi-agent workspace UX, conversation correction and rollback, WebUI consistency, and built-in image/video/audio perception.
- **IronClaw:** No current differentiation signal in the supplied data.

### Target users

- **OpenClaw:** Operators and individuals running always-on assistants across many channels and devices.
- **Hermes Agent:** Desktop users, developers, remote-gateway operators, and local-model enthusiasts.
- **ZeroClaw:** Technical users and operators who require explicit controls over execution, security, plugins, and processes.
- **QwenPaw:** Users building local or home-server multi-agent workspaces with strong WebUI needs.
- **IronClaw:** Cannot be inferred reliably from current activity.

### Technical architecture

OpenClaw’s differentiator is a mature, highly connected gateway and durable session ecosystem. Hermes is optimizing the boundary between Desktop, remote gateways, integrations, and skills. ZeroClaw is applying stronger low-level runtime and policy controls, including subprocess watchdogs and delegation approval routing. QwenPaw is currently more focused on workspace state, conversation presentation, and multimodal tooling than on distributed runtime infrastructure.

## 6. Community Momentum & Maturity

### Rapidly iterating

- **OpenClaw:** Highest velocity and broadest platform surface. It is stabilizing rather than merely expanding, with memory, startup, persistence, and delivery correctness dominating the roadmap.
- **Hermes Agent:** Strong innovation across collaboration, Desktop, skills, and local inference, but many changes remain open and no new release was published.
- **ZeroClaw:** Extremely active release-gating work, including subprocess limits, Windows secret protection, cancellation, ACP persistence, and provider behavior. The large open-PR count creates review risk.

### Focused stabilization

- **QwenPaw:** Lower volume but concentrated on a recent beta regression, fragmented conversations, silent truncation, and reload cleanup. It needs a dependable release and regression-test pass before broader capability expansion.
- **IronClaw:** No evidence of daily momentum; current maturity and roadmap cannot be assessed from this snapshot.

### Overall maturity

OpenClaw is the most mature as a **comprehensive deployed platform**, though its scale exposes deeper reliability debt. Hermes and ZeroClaw are highly active challengers with strong engineering direction but visible release and governance risks. QwenPaw is earlier in operational hardening, while IronClaw’s status remains indeterminate.

## 7. Trend Signals

1. **The market is shifting from agent capability to agent trustworthiness.**  
   The most important features are now durable identity, correct handoff, reliable cancellation, visible failure states, and safe restart behavior.

2. **Always-on agents require hard resource governance.**  
   OpenClaw’s catalog-worker growth and ZeroClaw’s subprocess OOM reports demonstrate that memory and CPU controls are production prerequisites, not optional optimizations.

3. **Multi-agent ecosystems require distributed trust.**  
   Hermes’s cross-gateway collaboration, OpenClaw’s delegation controls, ZeroClaw’s approval routing, and QwenPaw’s inter-instance proposal all point toward agent-to-agent interoperability—but security boundaries must be designed first.

4. **Skills are becoming a first-class runtime subsystem.**  
   Hermes is addressing prompt cost versus discoverability, while ZeroClaw is fixing skill visibility and channel parity. The trend is toward searchable indexes, lazy loading, provenance-aware bundles, and runtime-verified activation.

5. **Multimodal agents are expanding, but buffer and lifecycle controls lag.**  
   QwenPaw is adding native audio perception, OpenClaw is confronting unbounded realtime-voice state, and ZeroClaw is considering a backend-neutral voice channel. Audio support will require strict buffering, cancellation, and session accounting.

6. **Local and self-hosted inference remains strategically important.**  
   Hermes users want multi-GPU support and tolerant slow-model behavior; ZeroClaw focuses on local runtime controls; QwenPaw supports custom models. Providers must handle local latency, resource variability, and fallbacks differently from hosted APIs.

7. **Desktop and gateway boundaries are becoming a major fault line.**  
   Private-CA failures, duplicate rendering, false watchdogs, incorrect backend status, LAN regressions, and stale WebSockets all stem from inconsistencies between UI, main process, gateway, and storage.

8. **Recovery-safe configuration and upgrade paths will differentiate mature products.**  
   OpenClaw’s migration/recovery tracking and Hermes’s update, backup, and profile-handling issues show that preserving user state through upgrades is becoming a core product requirement.

9. **Actionable observability is replacing silent degradation.**  
   Feature proposals across the ecosystem increasingly request fallback notices, blocked-task reasons, terminal statuses, resource alerts, and context-usage meters. Agent developers should treat observability as part of the agent API, not an operator-only add-on.

10. **The winning architecture will combine autonomy with explicit control.**  
    Users want agents that can act continuously across devices and services, but they also demand dry boundaries for tools, permissions, secrets, memory, delegation, and recovery. The strongest projects are converging on that combination, though the ecosystem has not yet standardized how it should be implemented.

---

## Peer Project Reports

<details>
<summary><strong>Hermes Agent</strong> — <a href="https://github.com/nousresearch/hermes-agent">nousresearch/hermes-agent</a></summary>

# Hermes Agent Project Digest — 2026-10-03

## 1. Today’s Overview

Hermes Agent had a high-volume development day, with **50 issues updated** and **50 pull requests updated** in the last 24 hours. Of the issues, **46 remained open or active and 4 were closed**; **25 PRs were open and 25 were merged or closed**. There were **no new releases**, so today’s work appears focused on maintenance, reliability, platform integration, and architectural improvements rather than a versioned rollout. The most significant signals are continued work on cross-agent collaboration, session integrity, gateway/desktop reliability, and reducing the token cost of skills. Overall activity is strong, but the number of high-priority regressions and open cross-platform issues indicates a busy and potentially fragile release surface.

## 2. Releases

No new releases were published in the last 24 hours.

## 3. Project Progress

### Merged or closed PRs

The repository reports **25 merged or closed PRs**, including the following notable changes:

- **Remote gateway and private-CA connectivity**
  - [PR #103683 — bridge remote gateway WebSockets through the main process for private-CA trust](https://github.com/NousResearch/hermes-agent/pull/103683), closed.
  - [PR #57239 — trust macOS keychain and `NODE_EXTRA_CA_CERTS` for remote gateway TLS](https://github.com/NousResearch/hermes-agent/pull/57239), open.
  - [PR #128311 — dial remote gateway WebSockets through the main process for private-CA and LNA origins](https://github.com/NousResearch/hermes-agent/pull/128311), open.
  
  These changes address a recurring Desktop-to-gateway problem: HTTPS and WebSocket connections can fail even when the remote certificate is trusted by the operating system, because Chromium, Node, and the main process may use different certificate paths.

- **Gateway and automation correctness**
  - [PR #123564 — include the block reason in API-server wake turns](https://github.com/NousResearch/hermes-agent/pull/123564), open. This improves Kanban/automation observability by ensuring blocked sessions receive the reason they were woken.
  - [PR #130416 — give each Slack slash invocation its own ephemeral reply context](https://github.com/NousResearch/hermes-agent/pull/130416), open. This should prevent reply-routing collisions between asynchronous slash-command invocations.
  - [PR #125765 — allow `script_timeout_seconds=0` to disable the cron script deadline](https://github.com/NousResearch/hermes-agent/pull/125765), open. This gives long-running, checkpointed jobs a documented way to run without the default one-hour deadline.

- **Session and TUI stability**
  - [PR #128528 — tell clients that a quiet turn is still running](https://github.com/NousResearch/hermes-agent/pull/128528), open. This targets false “reply cut off” or timeout behavior when a backend remains active but is quiet.
  - [PR #130869 — prevent the TUI from crashing on `/queue rm` with an invalid index](https://github.com/NousResearch/hermes-agent/pull/130869), open.
  - [PR #131047 — reuse the main-turn OpenCode session key for auxiliary threads](https://github.com/NousResearch/hermes-agent/pull/131047), open.
  - [PR #131742 — allow fresh skill reads after patch no-match errors](https://github.com/NousResearch/hermes-agent/pull/131742), open. This improves recovery when an agent attempts a failed skill edit and then tries to read the complete file again.

- **Security and update handling**
  - [PR #131746 — scan lifecycle scripts named by Windows paths](https://github.com/NousResearch/hermes-agent/pull/131746), open. The proposal addresses a security-relevant parsing failure where POSIX-style tokenization can interpret Windows backslashes incorrectly.
  - [PR #130878 — prevent implicit fetches for remote Markdown images](https://github.com/NousResearch/hermes-agent/pull/130878), open. Remote images would become explicit links rather than automatically loading external resources.
  - [PR #131741 — preserve a checkout’s own `maintenance.auto=false` setting during update](https://github.com/NousResearch/hermes-agent/pull/131741), closed.
  - [PR #86833 — bound the autostash restore prompt with a timeout](https://github.com/NousResearch/hermes-agent/pull/86833), closed. This prevents unattended `hermes update` operations from hanging at an interactive prompt.

- **Platform and usability fixes**
  - [PR #131728 — add `activate.fish` for the fish shell](https://github.com/NousResearch/hermes-agent/pull/131728), open.
  - [PR #103683](https://github.com/NousResearch/hermes-agent/pull/103683) and [PR #25503 — correct Windows gateway runtime status detection](https://github.com/NousResearch/hermes-agent/pull/25503), both closed.
  - [PR #106042 — preserve replacement draft providers during Desktop cleanup](https://github.com/NousResearch/hermes-agent/pull/106042), closed.
  - [PR #66280 — handle Telegram live locations in the background](https://github.com/NousResearch/hermes-agent/pull/66280), open. This would prevent continuous location updates from flooding the conversation while retaining normal handling for deliberate pins and venues.

### Open PRs indicating active work

The remaining open PRs continue to target:

- Quiet-turn liveness signaling and session-state correctness.
- Slack and Telegram message delivery.
- Kanban automation and blocked-task propagation.
- Windows installation, update, and terminal behavior.
- Skills retrieval, editing, and prompt efficiency.
- Desktop rendering, security, and remote-gateway compatibility.

## 4. Community Hot Topics

### Cross-agent collaboration across gateways

The most active issue by comment volume is [Issue #97681 — Let Bots collaborate across gateways](https://github.com/NousResearch/hermes-agent/issues/97681), with **33 comments and 4 likes**. The proposal is for Hermes Bots to collaborate across machines—and eventually across owners—while preserving separate ownership of models, tools, memory, credentials, and deployment control.

This indicates strong interest in Hermes evolving from a single personal agent into a distributed agent ecosystem. The main design challenge is not merely inter-process messaging; it is secure delegation, identity, permissions, context transfer, failure recovery, and clear ownership boundaries.

### Desktop duplicate replies and slow-model false failures

Two highly active P1 issues concern Desktop/session reliability:

- [Issue #123801 — macOS Desktop renders duplicate assistant replies](https://github.com/NousResearch/hermes-agent/issues/123801), **22 comments and 1 like**.
- [Issue #125306 — 45-second live-turn silence watchdog produces misleading “reply was cut off” messages](https://github.com/NousResearch/hermes-agent/issues/125306), **7 comments and 2 likes**.

Together, these reports point to a broader gap between backend liveness, stored message state, and Desktop presentation. A slow self-hosted model can be incorrectly treated as failed, while a session can be rendered twice even when only one assistant row and one completion exist. The requested fix PR [#128528](https://github.com/NousResearch/hermes-agent/pull/128528) directly addresses quiet-turn liveness, but duplicate rendering may still require a separate persistence-to-renderer deduplication fix.

### Skills scalability and prompt cost

Several issues and PRs focus on the growing skills context:

- [Issue #2045 — lazy skill loading](https://github.com/NousResearch/hermes-agent/issues/2045), **10 comments and 4 likes**.
- [Issue #17649 — semantic skill retrieval with SQLite FTS5](https://github.com/NousResearch/hermes-agent/issues/17649), **5 comments and 1 like**.
- [Issue #102811 — skills prompt forces over-eager skill loading](https://github.com/NousResearch/hermes-agent/issues/102811), **4 comments**.
- [Issue #71481 — names-only skills index breaks spontaneous discovery](https://github.com/NousResearch/hermes-agent/issues/71481), **2 comments**.
- [PR #131742 — fresh skill reads after patch errors](https://github.com/NousResearch/hermes-agent/pull/131742), open.

The underlying need is to reduce prompt bloat without making skills undiscoverable. The discussion exposes a tradeoff: compact indexes save tokens, but removing descriptions may prevent the model from realizing that a relevant skill exists. This is a likely design priority for a future version.

### Google Workspace integration

The Google Workspace skill is producing several concrete quality reports:

- [Issue #35560 — documented setup flags do not exist](https://github.com/NousResearch/hermes-agent/issues/35560), **6 comments and 1 like**.
- [Issue #131711 — empty Gmail searches return non-JSON from the Python backend](https://github.com/NousResearch/hermes-agent/issues/131711), **4 comments**.
- [Issue #43054 — Gmail retrieval drops forwarded and nested MIME bodies](https://github.com/NousResearch/hermes-agent/issues/43054), **4 comments**.

These are not isolated cosmetic issues. They affect setup reliability, output consistency, and the ability to process real-world email. The pattern suggests insufficient contract testing across the skill’s multiple backends and MIME structures.

### High-interest distribution and local-model requests

- [Issue #38519 — Hermes Desktop frontend-only installation](https://github.com/NousResearch/hermes-agent/issues/38519), **8 comments and 16 likes**.
- [Issue #118418 — detect and use multi-GPU VRAM in the local runtime](https://github.com/NousResearch/hermes-agent/issues/118418), **2 comments**.

The frontend-only request has the strongest reaction signal in the issue list, indicating demand for a cleaner split between Desktop client and always-on gateway/agent infrastructure. The multi-GPU request reflects a desire to use Hermes as a capable local-model frontend, particularly for larger models and longer contexts.

## 5. Bugs & Stability

### P0/P1 or session-state risks

1. **Session compression corruption risk — P0**
   - [PR #129759 — retain guarded auto-prune lineages](https://github.com/NousResearch/hermes-agent/pull/129759), open.
   - The issue is that auto-pruning can remove compressed ancestors while preserving only an old tip, leaving a broken compression lineage. This can threaten long-running session integrity.
   - A related open issue, [Issue #131412 — oversized OpenAI Codex sessions cannot be compacted](https://github.com/NousResearch/hermes-agent/issues/131412), reports that protected tail history consumes all compressible content while `middle_window_tokens` remains zero.
   - **Assessment:** high priority because these are data-integrity and session-continuity risks.

2. **macOS Desktop duplicate assistant replies — P1**
   - [Issue #123801](https://github.com/NousResearch/hermes-agent/issues/123801).
   - A single persisted row and completion can still result in duplicate rendered assistant messages. This may affect user trust and can also cause agents or users to interpret the response as repeated execution.
   - **Fix status:** no direct fix PR is identified in the supplied data; related liveness work is present in [PR #128528](https://github.com/NousResearch/hermes-agent/pull/128528).

3. **False timeout for slow models — P1**
   - [Issue #125306](https://github.com/NousResearch/hermes-agent/issues/125306).
   - The Desktop watchdog assumes a 45-second silence means failure, which is unsafe for self-hosted models and long-running inference.
   - **Fix status:** [PR #128528](https://github.com/NousResearch/hermes-agent/pull/128528) is directly relevant and should be prioritized.

4. **OpenCode session affinity bug**
   - [Issue #115000](https://github.com/NousResearch/hermes-agent/issues/115000), addressed by [PR #131047](https://github.com/NousResearch/hermes-agent/pull/131047).
   - Auxiliary threads may reuse the wrong or stale `x-opencode-session` key, risking context misassociation.

5. **Security-relevant Windows lifecycle command parsing**
   - [PR #131746](https://github.com/NousResearch/hermes-agent/pull/131746).
   - Incorrect parsing of Windows paths could allow a lifecycle command to evade intended script scanning. This should receive security-focused review and tests across POSIX and Windows command forms.

### P2 reliability and compatibility issues

- [Issue #131681 — `pilk==0.2.4` missing from `exclude-newer`](https://github.com/NousResearch/hermes-agent/issues/131681), causing plugin workspaces to be unsatisfiable on mirrors without upload-time metadata.
- [Issue #124526 — non-ASCII Windows usernames break `uv` path resolution](https://github.com/NousResearch/hermes-agent/issues/124526), affecting CLI installation and Desktop installation.
- [Issue #120888 — full backup can run indefinitely during concurrent writes](https://github.com/NousResearch/hermes-agent/issues/120888).
- [Issue #131736 — Windows Desktop reports backend failure while another PID remains active](https://github.com/NousResearch/hermes-agent/issues/131736).
- [Issue #131657 — Desktop Artifacts reads remote sessions without `connection_id`](https://github.com/NousResearch/hermes-agent/issues/131657), causing registered remote sessions to return 404s.
- [Issue #131659 — a dangling Windows symlink/junction breaks the entire Dashboard Files listing](https://github.com/NousResearch/hermes-agent/issues/131659).
- [Issue #75444 — auto-decomposer can re-dispatch escalated triage tasks indefinitely](https://github.com/NousResearch/hermes-agent/issues/75444).
- [Issue #43054 — nested/forwarded email bodies are dropped](https://github.com/NousResearch/hermes-agent/issues/43054).
- [Issue #119033 — Feishu typing reactions notify the user on every turn](https://github.com/NousResearch/hermes-agent/issues/119033).
- [Issue #131738 — Slack SVG attachments are incorrectly reported as scope/auth failures](https://github.com/NousResearch/hermes-agent/issues/131738).
- [Issue #131739 — tool-output filenames are linkified and replaced with third-party page titles](https://github.com/NousResearch/hermes-agent/issues/131739).
- [Issue #131070 — Desktop workspace selection lacks expected context-menu actions on Windows](https://github.com/NousResearch/hermes-agent/issues/131070).
- [Issue #131663 — malformed tool-call garbage can flood the chat and stop the agent](https://github.com/NousResearch/hermes-agent/issues/131663).

The breadth of these reports suggests that Desktop, Windows, gateway integrations, and session persistence remain the main stability hotspots.

## 6. Feature Requests & Roadmap Signals

### Most likely near-term roadmap candidates

- **Cross-gateway and cross-owner collaboration**
  - [Issue #97681](https://github.com/NousResearch/hermes-agent/issues/97681).
  - This is the strongest strategic signal in the data, though its distributed-identity and permission requirements make it more likely to arrive as staged infrastructure than a single release.

- **Asynchronous A2A task execution**
  - [Issue #91687 — A2A long jobs should return a task ID](https://github.com/NousResearch/hermes-agent/issues/91687).
  - Returning task IDs and enabling later result retrieval would address the current 120–300 second synchronous timeout limitation and is well suited to a near-term gateway/plugin release.

- **Efficient skill discovery**
  - [Issue #2045](https://github.com/NousResearch/hermes-agent/issues/2045), [Issue #17649](https://github.com/NousResearch/hermes-agent/issues/17649), and [Issue #102811](https://github.com/NousResearch/hermes-agent/issues/102811).
  - A likely direction is a hybrid system: compact searchable index, on-demand metadata expansion, and explicit retrieval tools. The main design risk is preserving spontaneous discovery.

- **Desktop frontend-only installation**
  - [Issue #38519](https://github.com/NousResearch/hermes-agent/issues/38519).
  - Given the 16 likes and clear remote-agent use case, this could become a practical packaging/configuration change soon.

- **Better local-model support**
  - [Issue #118418](https://github.com/NousResearch/hermes-agent/issues/118418).
  - Multi-GPU VRAM detection and context handling would improve Hermes’s appeal as a local inference client, though it requires careful testing across runtimes and hardware.

- **Profile-level heartbeat**
  - [Issue #130197](https://github.com/NousResearch/hermes-agent/issues/130197).
  - This would extend session heartbeats into profile-scoped, context-aware automation.

### Lower-probability or longer-term items

- [Issue #36002 — per-auxiliary fallback policy tiers](https://github.com/NousResearch/hermes-agent/issues/36002), which is strategically important but likely requires a larger reliability policy redesign.
- [Issue #130197](https://github.com/NousResearch/hermes-agent/issues/130197), which depends on coherent profile and session context semantics.
- [Issue #118418](https://github.com/NousResearch/hermes-agent/issues/118418), which may require runtime-specific changes beyond the CLI/UI layer.

## 7. User Feedback Summary

### Positive signals

- Users are investing significant discussion time in the project, with **33 comments** on cross-gateway collaboration and **22 comments** on duplicate Desktop replies.
- The frontend-only installation request received **16 likes**, indicating strong demand for a more flexible deployment model.
- The proposal for a cat-themed native memory provider, [PR #131744](https://github.com/NousResearch/hermes-agent/pull/131744), also shows active ecosystem experimentation around persistent and semantic memory.
- Telegram live-location support, fish activation, and OpenCode session handling indicate contributors are broadening Hermes’s usability beyond its core Desktop experience.

### Main sources of dissatisfaction

- **Silent or misleading failures:** slow models are declared cut off, duplicate messages appear, remote sessions are not found, and backend status is reported incorrectly.
- **Windows friction:** non-ASCII usernames, PTY console windows, context menus, symlinks, gateway detection, and update behavior generate multiple reports.
- **Integration fragility:** Slack, Feishu, Telegram, Google Workspace, and remote gateways exhibit message-routing, attachment, MIME, and TLS problems.
- **Configuration complexity:** users struggle with installation topology, profile inheritance, local model detection, cron timeout semantics, and skill prompt behavior.
- **Skill discoverability versus efficiency:** the community wants lower token usage, but some users report that compact indexes make relevant skills harder to discover.
- **Automation loop failures:** Kanban tasks can bounce indefinitely through triage, and blocked wake messages may omit the reason for

</details>

<details>
<summary><strong>IronClaw</strong> — <a href="https://github.com/nearai/ironclaw">nearai/ironclaw</a></summary>

No activity in the last 24 hours.

</details>

<details>
<summary><strong>QwenPaw</strong> — <a href="https://github.com/agentscope-ai/QwenPaw">agentscope-ai/QwenPaw</a></summary>

# QwenPaw Project Digest — 2026-10-03

## 1. Today’s Overview

QwenPaw recorded **10 updated issues and 4 updated pull requests** in the last 24 hours, with **no issues or PRs closed/merged** and **no new releases**. Activity was concentrated around improving failure visibility, agent lifecycle cleanup, and built-in multimodal tooling. Several high-impact bugs remain open, including a V2.2.2.beta4 conversation-page regression affecting LAN access, third-party model visibility failures, and conversation fragmentation in the WebUI. Overall, the project is showing strong contributor engagement, but the current mix of open reliability reports and unmerged fixes suggests near-term stabilization work is needed.

## 3. Project Progress

No pull requests were merged or closed today. Nevertheless, four open PRs advanced the project’s reliability and capabilities:

- **[PR #8084 — Refuse oversized prompts and surface empty model replies](https://github.com/agentscope-ai/QwenPaw/pull/8084)**  
  Adds protection against prompts that exceed the model’s effective context window and attempts to expose empty provider responses rather than allowing rooms to fail silently. This directly addresses the risk of successful HTTP responses containing zero generated tokens near the context limit.

- **[PR #8079 — Cancel in-flight runs when reload drain time expires](https://github.com/agentscope-ai/QwenPaw/pull/8079)**  
  Intended to fix [Issue #8076](https://github.com/agentscope-ai/QwenPaw/issues/8076). The proposal prevents old agent instances from being abandoned silently after prolonged cleanup, while notifying the room and canceling remaining turns.

- **[PR #8083 — Add `view_audio` built-in tool](https://github.com/agentscope-ai/QwenPaw/pull/8083)**  
  A first-time-contributor submission adding native audio understanding alongside the existing `view_image` and `view_video` tools. It addresses the corresponding feature request in [Issue #8081](https://github.com/agentscope-ai/QwenPaw/issues/8081).

- **[PR #7936 — Complete Chinese access-control username translation](https://github.com/agentscope-ai/QwenPaw/pull/7936)**  
  Adds the missing `channels.username` localization key for Chinese, aligning the Chinese UI with the other shipped locales. The PR is small but improves interface consistency.

**Assessment:** The most meaningful progress is around making abnormal agent behavior visible and recoverable. However, none of these changes has yet been merged, so users are not confirmed to benefit from them in a published release.

## 4. Community Hot Topics

### Most active issue: message editing, retraction, and workspace rollback

- **[Issue #7997 — Support message retraction/editing and workspace rollback in WebUI](https://github.com/agentscope-ai/QwenPaw/issues/7997)**  
  **8 comments**, the highest discussion count among today’s items. The request covers editing or retracting prior user messages, truncating downstream conversation history, and optionally restoring file snapshots. This indicates that users need to correct mistakes without manually rebuilding a chat or reverting workspace changes, linking conversational state with filesystem state.

### Most active feature discussion: Markdown rendering for user messages

- **[Issue #2975 — Render user-entered session messages as Markdown](https://github.com/agentscope-ai/QwenPaw/issues/2975)**  
  **4 comments**, with activity updated on October 2. The report identifies a disparity between assistant responses and user messages: user-authored Markdown appears as raw syntax. This is especially important for code snippets, structured lists, technical explanations, and document-like input.

### Third-party agent integration defects

- **[Issue #8077 — Qoder custom models unavailable and context meter hidden](https://github.com/agentscope-ai/QwenPaw/issues/8077)**  
  **2 comments.** Three related defects reportedly affect the Qoder third-party agent: custom models are invisible or unusable, backend configuration is dropped, and the context-usage meter is hidden. The concentration of defects in one adapter suggests a need for broader integration testing and contract validation between QwenPaw and third-party agent harnesses.

### Agent reload lifecycle

- **[Issue #8076 — Reload abandons in-flight turns after drain timeout](https://github.com/agentscope-ai/QwenPaw/issues/8076)**  
  **1 comment**, with a proposed fix in **[PR #8079](https://github.com/agentscope-ai/QwenPaw/pull/8079)**. Discussion focuses on the long cleanup budget—up to 24 hours in the described implementation—and the resulting possibility that users receive no room notification or cancellation signal.

**Underlying needs:** The most prominent community demand is not merely additional features, but trustworthy state management: accurate conversation history, predictable WebUI rendering, visible truncation errors, reliable third-party model configuration, and deterministic agent cleanup.

## 5. Bugs & Stability

### High severity: conversation page inaccessible on LAN after beta upgrade

- **[Issue #8073 — V2.2.2.beta4 unable to access conversation page](https://github.com/agentscope-ai/QwenPaw/issues/8073)**  
  Reported after upgrading from V2.2.1 to V2.2.2.beta4. The conversation page fails for other devices accessing local services over the LAN, while local access reportedly works.  
  **Impact:** A likely release regression affecting remote and household/server deployments.  
  **Fix PR:** None identified.  
  **Priority:** Urgent; this is a beta-version regression with broad access implications.

### High severity: conversation split into multiple UI pages

- **[Issue #8078 — `chat_with_agent` messages registered as separate chats](https://github.com/agentscope-ai/QwenPaw/issues/8078)**  
  Reports that cross-session agent messages are registered as independent chats, causing one logical session to fragment into multiple pages. The report was produced on V2.2.2b4 and affects both user experience and continuity of conversation state.  
  **Impact:** Breaks session integrity and may make multi-agent workflows difficult to follow or recover.  
  **Fix PR:** None identified.

### High severity: context-window overflow may fail silently

- **[Issue #8085 — Surface `finish_reason="length"` when output is truncated](https://github.com/agentscope-ai/QwenPaw/issues/8085)**  
  Generation cutoffs caused by output limits currently drop the stop reason, leaving users unable to distinguish a complete answer from a response that ended mid-sentence.  
  **Impact:** Silent data loss or incomplete answers can be mistaken for successful completions.  
  **Related PR:** **[PR #8084](https://github.com/agentscope-ai/QwenPaw/pull/8084)** addresses oversized prompts and empty replies, but may not fully implement the specific `finish_reason="length"` behavior requested in Issue #8085.

### Medium-high severity: third-party Qoder integration failures

- **[Issue #8077 — Qoder custom models invisible/unusable and context meter hidden](https://github.com/agentscope-ai/QwenPaw/issues/8077)**  
  Combines configuration loss, unavailable custom models, and missing usage visibility.  
  **Impact:** Qoder cannot be used reliably with custom models, and users lack key context-capacity information.  
  **Fix PR:** None identified.

### Medium severity: agent reload may leave work running or silently discarded

- **[Issue #8076 — Reload drain timeout abandons in-flight turns](https://github.com/agentscope-ai/QwenPaw/issues/8076)**  
  Potentially lengthy cleanup can end with in-flight work being abandoned without room-level notification.  
  **Fix PR:** **[PR #8079](https://github.com/agentscope-ai/QwenPaw/pull/8079)** is open and directly targets this behavior.

**Stability assessment:** The combination of a beta regression, session-routing/state fragmentation, silent truncation, and third-party integration failures indicates elevated near-term stability risk. The presence of targeted fix PRs is positive, but their open status and the absence of a new release mean remediation is not yet available to users.

## 6. Feature Requests & Roadmap Signals

### Native audio understanding

- **[Issue #8081 — Add `view_audio` built-in tool](https://github.com/agentscope-ai/QwenPaw/issues/8081)**
- **[PR #8083 — Implement `view_audio`](https://github.com/agentscope-ai/QwenPaw/pull/8083)**

This is the clearest near-term roadmap candidate because a concrete implementation is already under review. It would bring audio handling into the same direct perception model as images and video, reducing reliance on external transcription and scripting.

**Prediction:** Likely to appear in a near-term release if the PR passes review and integration testing.

### Message editing, retraction, and optional workspace rollback

- **[Issue #7997](https://github.com/agentscope-ai/QwenPaw/issues/7997)**

This is a substantial state-management feature rather than a small UI enhancement. It must coordinate chat-history truncation, context rebuilding, snapshot restoration, and potentially multi-agent state. It has the highest community engagement among current issues, but no implementation PR is listed.

**Prediction:** Plausible roadmap priority, though likely to require design work and may not be expected in the next patch release.

### Markdown rendering for user messages

- **[Issue #2975](https://github.com/agentscope-ai/QwenPaw/issues/2975)**

The request addresses a visible consistency gap and should be relatively straightforward for the frontend, subject to safe HTML sanitization and consistent handling of code blocks and pasted content.

**Prediction:** A reasonable candidate for a quick WebUI usability update, although no active PR is shown.

### Cross-machine agent discovery and delegation

- **[Issue #8080 — Inter-instance agent communication](https://github.com/agentscope-ai/QwenPaw/issues/8080)**

The proposal extends current multi-agent capabilities beyond one instance or workspace through automatic discovery, task delegation, and knowledge or memory transfer across machines. It targets home servers, office devices, and cloud GPU hosts.

**Prediction:** Strategic long-term direction rather than an immediate next-version feature. Authentication, discovery, trust, data consistency, and security would need to be designed first.

### Better heartbeat documentation

- **[Issue #8082 — Document heartbeat silence, concurrency, and `AGENTS.md` behavior](https://github.com/agentscope-ai/QwenPaw/issues/8082)**

The request concerns runtime semantics that are not adequately explained by the current configuration documentation. This is likely a low-cost documentation improvement and may help users understand expected silence, overlap, concurrency, and heartbeat integration.

**Prediction:** Documentation-only change suitable for an immediate maintenance update.

## 7. User Feedback Summary

Users are reporting a mixed experience:

- **Remote access reliability is weak after beta upgrades:** The inability to open conversations from another LAN device in V2.2.2.beta4 is a significant regression for users operating QwenPaw on home servers or shared machines.
- **Conversation state is difficult to trust:** Users need a single session to remain coherent when agents communicate, yet `chat_with_agent` can create separate UI pages.
- **Failure states are insufficiently visible:** Silent truncation, empty replies, and abandoned reloads make it difficult to know whether work completed, failed, or was still running.
- **WebUI parity is incomplete:** Assistant responses support rich Markdown, but user messages do not, leading to poor presentation of technical content.
- **Third-party integrations lack dependable configuration:** Qoder custom models may not be surfaced or preserved, and context usage is hidden.
- **Multimodal workflows are uneven:** Image and video tools exist, while audio requires indirect workarounds.
- **Correction and recovery are important use cases:** Message retraction, history rewriting, and workspace rollback reflect a need for safe experimentation, especially for coding agents that can modify files.

Overall, the feedback points to a high level of expectation for an agent workspace: users want it to be recoverable, observable, consistent across devices, and capable of supporting rich technical and multimodal inputs.

## 8. Backlog Watch

- **[Issue #2975 — Markdown rendering for user messages](https://github.com/agentscope-ai/QwenPaw/issues/2975)**  
  Created on April 6 and still open. Although relatively small, it has persisted for months and affects everyday usability for technical users. It is a strong candidate for backlog cleanup or implementation.

- **[Issue #7997 — Message editing/retraction and workspace rollback](https://github.com/agentscope-ai/QwenPaw/issues/7997)**  
  Created on September 27 with eight comments, making it both recent and high-engagement. Maintainers should clarify scope and architectural expectations so discussion does not stall before implementation begins.

- **[PR #7936 — Chinese access-control username localization](https://github.com/agentscope-ai/QwenPaw/pull/7936)**  
  Open since September 22. The change is small, isolated, and likely low-risk, but it has remained pending while newer PRs receive attention. A maintainer review could quickly remove a visible localization gap.

- **[Issue #8073 — V2.2.2.beta4 LAN conversation access regression](https://github.com/agentscope-ai/QwenPaw/issues/8073)**  
  Requires prompt triage because it appears tied to the latest beta and may affect deployment workflows. No corresponding fix is identified.

- **[Issue #8078 — Session fragmentation in `chat_with_agent`](https://github.com/agentscope-ai/QwenPaw/issues/8078)**  
  A core state-consistency defect that could undermine multi-agent usability. It should be triaged alongside session-routing and conversation-registration tests.

- **[PR #8084](https://github.com/agentscope-ai/QwenPaw/pull/8084), [PR #8079](https://github.com/agentscope-ai/QwenPaw/pull/8079), and [PR #8083](https://github.com/agentscope-ai/QwenPaw/pull/8083)**  
  These open PRs represent the most immediate opportunities to improve stability and capability. Prompt review, regression testing, and release planning would convert current community activity into user-visible progress.

</details>

<details>
<summary><strong>ZeroClaw</strong> — <a href="https://github.com/zeroclaw-labs/zeroclaw">zeroclaw-labs/zeroclaw</a></summary>

# ZeroClaw Project Digest — 2026-10-03

## 1. Today’s Overview

ZeroClaw shows high development activity: **50 issues** and **50 pull requests** were updated in the last 24 hours, with **47 issues open/active** and **48 PRs open**. The work is concentrated around **security hardening, runtime reliability, provider compatibility, ZeroCode/ACP behavior, agent delegation, and skills**. No new release was published, but several open fixes are explicitly targeted at **v0.8.6**, indicating active release-gating work. Overall health is **active but high-risk**, with multiple high-severity and security-sensitive changes still awaiting merge or maintainer review.

## 2. Releases

No new ZeroClaw release was published in the supplied data.

The repository nevertheless contains multiple changes labeled for **v0.8.6**, including:

- [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219): Restore the launch directory for fresh local ZeroCode sessions.
- [PR #11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456): Add an opt-in subprocess memory watchdog.
- [PR #11451](https://github.com/zeroclaw-labs/zeroclaw/pull/11451): Protect Windows secret key files at creation.
- [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387): Regression in ZeroCode’s launch-directory handling.
- [Issue #11369](https://github.com/zeroclaw-labs/zeroclaw/issues/11369): Docker startup failure and possible database stranding after interrupted upgrades; this issue is now closed.
- [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336): Plugin verification incorrectly reports plugins that the runtime cannot register.
- [Issue #11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333): Skill review tools cannot see skills supplied through `skill_bundles`.
- [Issue #11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332): Skill review and creation do not run for channel, webhook, or gateway turns.

## 3. Project Progress

The supplied PR list shows **48 open PRs** and reports that **2 PRs were merged or closed**, but the two merged/closed PRs are not included in the displayed top-20 details. Therefore, the exact changes merged today cannot be identified from this data.

The most significant open work advancing project capabilities and stability includes:

### Runtime and security

- [PR #11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456): Adds an opt-in shell and skill subprocess memory watchdog, tracking resident memory across visible descendants and terminating the owned process when the configured limit is exceeded. This directly advances [Issue #6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916), which documents production OOM incidents.
- [PR #11451](https://github.com/zeroclaw-labs/zeroclaw/pull/11451): Implements restrictive Windows ACLs for secret key files at creation time, continuing the security work tracked by [Issue #9460](https://github.com/zeroclaw-labs/zeroclaw/issues/9460).
- [PR #11469](https://github.com/zeroclaw-labs/zeroclaw/pull/11469): Fixes null-device recognition across host operating systems, allowing Windows sessions to evaluate POSIX null-device paths safely.
- [PR #11465](https://github.com/zeroclaw-labs/zeroclaw/pull/11465): Exposes cooperative cancellation context to tools, addressing the long-running tool cancellation gap described in [Issue #5836](https://github.com/zeroclaw-labs/zeroclaw/issues/5836).
- [PR #11458](https://github.com/zeroclaw-labs/zeroclaw/pull/11458): Hardens SQLite admission for memory audit hygiene using ownership, link, mode, and regular-file checks.

### ZeroCode, ACP, and gateway

- [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219): Restores the launch directory for fresh and restarted local ZeroCode Chat and Code sessions. This is the apparent fix for the regression in [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387).
- [PR #11457](https://github.com/zeroclaw-labs/zeroclaw/pull/11457): Adds a non-canceling F5 refresh flow for the focused ZeroCode session, preserving drafts, attachments, queues, selection, and reading position.
- [PR #11431](https://github.com/zeroclaw-labs/zeroclaw/pull/11431): Closes chat WebSocket connections left behind when gateway reloads retire an instance.
- [PR #11459](https://github.com/zeroclaw-labs/zeroclaw/pull/11459): Centralizes transcript layout caching in ZeroCode to keep row, line, screen, footer, copy, and URL indexes consistent.
- [PR #11460](https://github.com/zeroclaw-labs/zeroclaw/pull/11460): Adds provider-alias renaming in the ZeroCode Config interface, corresponding to [Issue #7468](https://github.com/zeroclaw-labs/zeroclaw/issues/7468).

### Agent, delegation, and configuration

- [PR #11462](https://github.com/zeroclaw-labs/zeroclaw/pull/11462): Routes independent delegate approvals to the target operator’s configured approval route, advancing [Issue #7743](https://github.com/zeroclaw-labs/zeroclaw/issues/7743).
- [PR #11467](https://github.com/zeroclaw-labs/zeroclaw/pull/11467): Adds opt-in single-tool provider rounds, intended to simplify tool execution under providers that do not support parallel or full tool-call behavior.
- [PR #11466](https://github.com/zeroclaw-labs/zeroclaw/pull/11466): Adds per-target configuration application results, improving visibility into which settings were accepted or rejected.
- [PR #11464](https://github.com/zeroclaw-labs/zeroclaw/pull/11464): Adds opt-in model fallback notices with `off`, `redacted`, and `detailed` modes, corresponding to [Issue #7883](https://github.com/zeroclaw-labs/zeroclaw/issues/7883).
- [PR #11438](https://github.com/zeroclaw-labs/zeroclaw/pull/11438) and [PR #11441](https://github.com/zeroclaw-labs/zeroclaw/pull/11441): Advance RFC #6954 by binding cron `main` jobs to the conversation in which they were created. These are stacked changes and still require dependency review and approval.

## 4. Community Hot Topics

The most active issue by comment volume is the maintainer decision queue:

1. [Issue #8692](https://github.com/zeroclaw-labs/zeroclaw/issues/8692) — **15 comments**  
   This tracker consolidates RFCs, design decisions, release-policy questions, and issues requiring maintainer or code-owner attention. Its high activity suggests a substantial design-review backlog rather than a single feature request. The underlying need is clear governance: reduce ambiguity around architecture proposals and prevent high-risk changes from progressing without an explicit decision owner.

Other highly discussed issues include:

- [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387) — **5 comments**  
  Reports a repeated regression in ZeroCode’s working-directory handling. The impact is significant because agents may operate in an unexpected workspace, affecting file operations, repository context, and user trust.
- [Issue #7943](https://github.com/zeroclaw-labs/zeroclaw/issues/7943) — **5 comments**  
  Proposes a backend-agnostic realtime voice-host channel, with ZeroClaw acting as the LLM/RAG/MCP layer over text and control events. This reflects demand for voice interaction without coupling the core agent to a specific ASR, VAD, or playback stack.
- [Issue #6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916) — **4 comments**  
  Reports unbounded memory consumption by subprocesses despite existing output and timeout limits. The discussion is driven by production reliability and container-level OOM risk.
- [Issue #11296](https://github.com/zeroclaw-labs/zeroclaw/issues/11296) — **4 comments**  
  Reports incorrect URL handling for llama.cpp and custom compatible providers when discovering models.
- [Issue #5836](https://github.com/zeroclaw-labs/zeroclaw/issues/5836) — **3 comments**  
  Requests cooperative cancellation for long-running tools, highlighting a gap between agent-loop cancellation and actual tool termination.
- [Issue #7743](https://github.com/zeroclaw-labs/zeroclaw/issues/7743) — **3 comments**  
  Proposes deny-by-default approval forwarding for independent delegate handoffs, addressing security and policy isolation between agents.
- [Issue #7468](https://github.com/zeroclaw-labs/zeroclaw/issues/7468) — **3 comments**  
  Requests renaming non-agent aliases in ZeroCode, a usability issue affecting provider, agent, and MCP configuration.
- [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336) — **3 comments**  
  Reports that plugin inspection commands can claim a plugin loads successfully even when the runtime rejects it.

The main community needs emerging from these discussions are:

- **Predictable execution context**: users need sessions to retain the correct working directory and filesystem context.
- **Safe long-running execution**: cancellation, memory limits, and failure cleanup must apply consistently to tools and subprocesses.
- **Transparent fallback behavior**: operators need visibility when providers switch models.
- **Policy correctness**: delegated agents and plugins need behavior that matches the configuration users can inspect.
- **Operational inspectability**: ZeroCode, ACP, channels, and gateway paths need consistent visibility into subagent activity, tool results, and failed turns.

## 5. Bugs & Stability

### Highest severity

1. **ZeroCode/RPC channel workflow blockage — [Issue #10225](https://github.com/zeroclaw-labs/zeroclaw/issues/10225)**  
   Severity: **S1 / workflow blocked**  
   ZeroCode Code/RPC sessions cannot reach configured channels through channel-backed tools. The daemon can poll channels, but agent tool access appears unavailable. No directly matching fix is shown in the supplied PR list.

2. **Failed ACP turn persistence — [Issue #10673](https://github.com/zeroclaw-labs/zeroclaw/issues/10673)**  
   Severity: **S1 / workflow blocked**  
   Failed turns reached through ZeroCode’s Code pane may not be persisted on the daemon RPC path. This can obscure failures and complicate recovery or debugging. The issue remains open and in progress.

3. **Docker startup failure and database stranding — [Issue #11369](https://github.com/zeroclaw-labs/zeroclaw/issues/11369)**  
   Severity: **S1**, now **closed**  
   Images built from `master` could exit at startup because the daemon locked a data directory before configuration loading and then rejected a differing configured path. The issue also identified possible database stranding after interrupted upgrades. Its closed status indicates resolution, though the exact merged fix is not identified in the provided PR subset.

### High-impact regressions and reliability issues

4. **ZeroCode launch-directory regression — [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387)**  
   Severity: **S2 / degraded behavior**  
   Fresh sessions ignore the shell launch directory and use the configured agent workspace. The regression is associated with [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219), which is still open.

5. **Plugin verification/runtime mismatch — [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336)**  
   Severity: **S2 / degraded behavior**  
   `plugin info` and `plugin list --verify` may report `[loads]` for a plugin that the runtime refuses to register because required configuration values lack a schema. This creates a dangerous gap between diagnostic output and actual availability.

6. **Skill bundle review blindness — [Issue #11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333)**  
   Severity: **S2 / degraded behavior**  
   Skills loaded through `skill_bundles` are unavailable to skill review tools such as `skills_list` and `skill_view`.

7. **Missing learning loop on non-CLI channels — [Issue #11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332)**  
   Severity: **S2 / degraded behavior**  
   Skill review and creation do not run for Matrix, webhook, gateway/web UI, and other channel-driven turns, despite being enabled.

8. **Custom and llama.cpp provider URL resolution — [Issue #11296](https://github.com/zeroclaw-labs/zeroclaw/issues/11296)**  
   Severity: **S3**  
   Compatible providers may ignore the configured URI when fetching models, especially through routers. Related open work is [PR #11468](https://github.com/zeroclaw-labs/zeroclaw/pull/11468), which addresses reasoning controls rather than the reported URL issue.

9. **Windows Ctrl+C behavior — [Issue #9028](https://github.com/zeroclaw-labs/zeroclaw/issues/9028)**  
   Severity: **S2**  
   Ctrl+C causes a force-quit-style termination in the Windows CLI, returning exit code `1073741510`, rather than behaving as a normal interrupt.

10. **Gateway reload leaves WebSockets open — [PR #11431](https://github.com/zeroclaw-labs/zeroclaw/pull/11431)**  
    This is a stability fix rather than a newly reported issue. Reloaded gateway instances can leave upgraded chat sockets attached to retired instances.

11. **Agent context exhaustion lacks terminal status — [Issue #8758](https://github.com/zeroclaw-labs/zeroclaw/issues/8758)**  
    Severity: **S2**  
    Agents may stop after context pressure without clearly reporting whether the task completed, was paused, or cannot continue.

12. **Silent ZeroCode queue pause — [Issue #10741](https://github.com/zeroclaw-labs/zeroclaw/issues/10741)**  
    Severity: **S2**  
    A normal-looking response can leave queued work silently paused when the expected terminal notification is missing.

## 6. Feature Requests & Roadmap Signals

### Likely candidates for the next release

The following changes have strong release-planning signals because they are already implemented in open PRs and/or tagged for v0.8.6:

- **Subprocess memory controls** — [PR #11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456) / [Issue #6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916)
- **ZeroCode launch-directory restoration** — [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219) / [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387)
- **Windows secret-file protection** — [PR #11451](https://github.com/zeroclaw-labs/zeroclaw/pull/11451) / [Issue #9460](https://github.com/zeroclaw-labs/zeroclaw/issues/9460)
- **Plugin verification correctness** — [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336)
- **Skill bundle review support** — [Issue #11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333)
- **Channel/gateway skill-learning parity** — [Issue #11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332)

### Medium-term roadmap signals

- **Realtime voice-host channel** — [Issue #7943](https://github.com/zeroclaw-labs/zeroclaw/issues/7943)  
  A backend-agnostic WebSocket voice interface could become a major channel capability, but it remains parked and requires architectural decisions.
- **A2A protocol crate** — [Issue #11254](https://github.com/zeroclaw-labs/zeroclaw/issues/11254)  
  The proposed `zeroclaw-a2a` crate signals continued investment in standardized agent-to-agent interoperability.
- **Knowledge corpus and document RAG** — [Issue #11235](https://github.com/zeroclaw-labs/zeroclaw/issues/11235)  
  The RFC proposes operator-managed document retrieval, with potential applications in local documentation, security references, and tool knowledge.
- **Standalone gateway process** — [Issue #11002](https://github.com/zeroclaw-labs/zeroclaw/issues/11002)  
  Separating `zeroclaw-gw` into an optional IPC client is a significant architectural step toward headless and independently deployed web deployments. It is currently blocked and targeted at v0.9.0.
- **Explicit session lifecycle semantics** — [Issue #10293](https://github.com/zeroclaw-labs/zeroclaw/issues/10293)  
  The project is evaluating whether `sessions_send` should be deprecated in favor of a more truthful, provenance-aware history operation.
- **Eval harness memory coverage** — [Issue #9226](https://github.com/zeroclaw-labs/zeroclaw/issues/9226)  
  Adding memory seeding and side-effect graders would improve the project’s ability to test persistent-agent behavior.

The roadmap therefore appears to be moving in three directions: **hardening operational safety**, **improving ZeroCode/ACP and channel consistency**, and **expanding agent interoperability and knowledge capabilities**.

## 7. User Feedback Summary

### User pain points

- **Unexpected working directories are a major trust issue.** Users expect local ZeroCode sessions to operate where they were launched, not silently switch to a configured workspace. This is documented in [Issue #11387](

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*