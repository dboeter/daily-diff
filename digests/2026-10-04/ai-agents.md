# OpenClaw Ecosystem Digest 2026-10-04

> Issues: 500 | PRs: 500 | Projects covered: 5 | Generated: 2026-10-03 19:55 UTC

- [OpenClaw](https://github.com/openclaw/openclaw)
- [Hermes Agent](https://github.com/nousresearch/hermes-agent)
- [IronClaw](https://github.com/nearai/ironclaw)
- [QwenPaw](https://github.com/agentscope-ai/QwenPaw)
- [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw)

---

## OpenClaw Deep Dive

## TL;DR
- OpenClaw released [v2026.9.8](https://github.com/openclaw/openclaw/releases/tag/v2026.9.8), containing 58 commits, 43 PRs, and contributions from 21 developers.
- Activity was extremely high—500 issues and 500 PRs were updated—but reliability, SQLite performance, and session-settlement failures remain prominent release risks.
- Maintainers advanced upgrade rollback, SQLite efficiency, worker memory, UI behavior, and security-sensitive identity handling through active proposals.

## Today’s Overview
The project shows sustained engineering activity and active triage, with roughly two-thirds of updated issues and PRs still open. The main health concern is repeated degradation around large session stores, model-runtime lifecycle, and Gateway reliability.

## Releases
- [v2026.9.8](https://github.com/openclaw/openclaw/releases/tag/v2026.9.8) is the day’s only release; supplied release notes contain no specific breaking-change or migration details.
- Operators should note subsequent recovery work for failed activation in [PR #164497](https://github.com/openclaw/openclaw/pull/164497), targeting a future 2026.9.9.

## Project Progress
- Closed PRs improved child-process waiting ([#164463](https://github.com/openclaw/openclaw/pull/164463)), memory retention ([#164467](https://github.com/openclaw/openclaw/pull/164467)), and release-test isolation ([#164487](https://github.com/openclaw/openclaw/pull/164487)).
- Open PRs share immutable transcript messages ([#164502](https://github.com/openclaw/openclaw/pull/164502)), move pairing reads off the Gateway thread ([#164476](https://github.com/openclaw/openclaw/pull/164476)), and reuse idle SQLite capacity ([#164477](https://github.com/openclaw/openclaw/pull/164477)).

## Community Hot Topics
- The highest-engagement report is unbounded SQLite WAL growth blocking Windows startup ([#143524](https://github.com/openclaw/openclaw/issues/143524), 105 comments).
- Session/event-loop blocking and subagent settlement failures dominate broader reliability discussion ([#119720](https://github.com/openclaw/openclaw/issues/119720), [#159612](https://github.com/openclaw/openclaw/issues/159612)).

## Bugs & Stability
- **P0:** Severe SQLite I/O, lock, WAL, integrity-check, and reclamation failures affect large stores ([#160386](https://github.com/openclaw/openclaw/issues/160386), [#148307](https://github.com/openclaw/openclaw/issues/148307)); targeted PRs exist, but no direct fix PR is identified for #143524.
- **P1:** Model-catalog workers reportedly leak ~1 GiB every five minutes and abort active turns ([#160548](https://github.com/openclaw/openclaw/issues/160548)).
- **P1:** Config/plugin hot reload can kill in-flight system turns ([#144291](https://github.com/openclaw/openclaw/issues/144291), [#139710](https://github.com/openclaw/openclaw/issues/139710)).

## Feature Requests & Roadmap Signals
- Upgrade-preview planning ([#164501](https://github.com/openclaw/openclaw/pull/164501)) and restored subagent/process panels ([#164061](https://github.com/openclaw/openclaw/pull/164061)) are plausible near-term additions.
- Security demand includes TOTP-backed exec approvals ([#67440](https://github.com/openclaw/openclaw/issues/67440)) and stronger scoped identity handling ([#157500](https://github.com/openclaw/openclaw/pull/157500)).

## Backlog Watch
- Maintainer action is overdue for memory-index freshness ([#119411](https://github.com/openclaw/openclaw/issues/119411)), update-safety reporting ([#122019](https://github.com/openclaw/openclaw/issues/122019)), and runaway prepared-model CPU usage ([#161379](https://github.com/openclaw/openclaw/issues/161379)).

---

## Cross-Ecosystem Comparison

## 1. Ecosystem Overview

Personal AI agents are converging on persistent sessions, messaging gateways, tool execution, and provider portability. Engineering effort is shifting from basic chat UX toward reliability, security boundaries, update safety, and inspectable runtime behavior. OpenClaw, Hermes Agent, and ZeroClaw show high issue/PR throughput, but also substantial operational risk; QwenPaw is improving usability, while IronClaw has limited recent activity.

## 2. Activity Comparison

| Project | Issues updated | PRs updated | Release status | Health score* |
|---|---:|---:|---|---|
| OpenClaw | 500 | 500 | v2026.9.8 released | 6/10 |
| Hermes Agent | 50 | 50 | None | 4/10 |
| IronClaw | 1 | 0 | None | 5/10 |
| QwenPaw | 10 | 16 | None | 6/10 |
| ZeroClaw | 50 | 50 | None | 5/10 |

\*Qualitative score based on reliability, security, merge/release progress, and operational maturity—not a benchmarked metric.

## 3. OpenClaw's Position

- **Advantages:** Highest activity and only project shipping a release; broad improvements across SQLite, memory, process lifecycle, UI, and upgrade rollback.
- **Technical/community position:** Its session-store and gateway architecture supports rich persistent-agent workflows, but community scale—500 updates, 1,000+ discussions, and 21 release contributors—also exposes reliability and triage debt unmatched by peers.
- **Risks:** SQLite WAL/locking failures, ~1 GiB worker-memory leaks, and hot-reload interruptions remain release-critical.

## 4. Shared Technical Focus Areas

- **Session and gateway reliability:** OpenClaw, Hermes, QwenPaw, and ZeroClaw all report stalled turns, context/session loss, ownership conflicts, or gateway delivery failures.
- **Safe lifecycle management:** OpenClaw and Hermes prioritize crash-safe upgrades, process cleanup, rollback, and memory/CPU containment; ZeroClaw also targets daemon and CI stability.
- **Security and observability:** ZeroClaw has a shared-memory isolation breach, Hermes has high-severity npm findings, and QwenPaw lacks provider/model attribution—making permissions, dependency hygiene, and runtime inspection common requirements.

## 5. Differentiation Analysis

- **OpenClaw:** Broad, extensible assistant platform emphasizing persistent session infrastructure and extensive gateway/provider integration.
- **Hermes:** Stronger focus on cross-owner A2A collaboration, model/credential ownership, and message-channel breadth; **QwenPaw:** Desktop/Web console usability, mobile adaptation, multimodal handling, and game-development tooling; **IronClaw:** Smaller macOS/local-development footprint centered on credentials and serve-time reliability.
- **ZeroClaw:** Rust-oriented runtime hardening, ZeroCode operations, sandboxing, IPC/gateway separation, and background cron execution.

## 6. Community Momentum & Maturity

- **Rapid iteration:** OpenClaw, Hermes, and ZeroClaw; QwenPaw is active but measured, while IronClaw is comparatively quiet.
- **Stabilizing/maturing:** IronClaw shows limited momentum, whereas QwenPaw’s merged UI fixes and ZeroClaw’s CI/cache closures suggest consolidation.

## 7. Trend Signals

- Agent platforms are becoming long-running operating systems for conversations, tools, and automation—not merely chat clients.
- Demand is rising for mobile consoles, A2A collaboration, scoped credentials, approval controls, diagnostics, and transparent agent activity.
- For developers, the decisive differentiators are now dependable state recovery, security isolation, resource containment, and cross-provider portability.

---

## Peer Project Reports

<details>
<summary><strong>Hermes Agent</strong> — <a href="https://github.com/nousresearch/hermes-agent">nousresearch/hermes-agent</a></summary>

## TL;DR
- Activity was high—50 issues and 50 PRs updated—with no release published.
- Update reliability dominated development, including crash-safe upgrades, Windows hand-off locking, and real-update CI coverage.
- Serious stability risks remain around runaway Git packs, session ownership, gateway delivery, terminal process cleanup, and silent scratch deletion.

## Today’s Overview
Hermes remains highly active but operationally unsettled: 90% of updated issues and 96% of updated PRs remain open. No merged changes are identifiable in the supplied data, while several critical P0/P1 defects need coordinated fixes.

## Project Progress
Open PRs advanced fixes for [crash-safe updates](https://github.com/NousResearch/hermes-agent/pull/132361), [update hand-off locking](https://github.com/NousResearch/hermes-agent/pull/132354), and [crashed-update CI coverage](https://github.com/NousResearch/hermes-agent/pull/132346).
Other notable work targets [Discord session caching](https://github.com/NousResearch/hermes-agent/pull/131243), [quoted filenames](https://github.com/NousResearch/hermes-agent/pull/132289), and [urllib3 security updates](https://github.com/NousResearch/hermes-agent/pull/132394).

## Community Hot Topics
Cross-gateway bot collaboration remains the dominant design effort ([#97681](https://github.com/NousResearch/hermes-agent/issues/97681)); users want distributed agents without surrendering ownership of models, memory, tools, or credentials.
Security debt is the other major concern, with 24 of 30 reported npm findings rated high ([#107356](https://github.com/NousResearch/hermes-agent/issues/107356)). Trusted cross-owner agent contacts are emerging as the next A2A product layer ([#132248](https://github.com/NousResearch/hermes-agent/issues/132248)).

## Bugs & Stability
- **P0:** Windows generated roughly 180 GiB of Git packs after an interrupted update ([#131444](https://github.com/NousResearch/hermes-agent/issues/131444)); channel overrides can evict agents every turn ([#131294](https://github.com/NousResearch/hermes-agent/issues/131294)); PTY descendants can hang cleanup ([#132358](https://github.com/NousResearch/hermes-agent/issues/132358)); scratch pruning can destroy multi-day work ([#132401](https://github.com/NousResearch/hermes-agent/issues/132401)).
- **P1/P2:** Telegram warm-up can wedge the first inbound turn ([#131145](https://github.com/NousResearch/hermes-agent/issues/131145)); Matrix sync can leave the bot deaf ([#131778](https://github.com/NousResearch/hermes-agent/issues/131778)); Desktop can steal cron session ownership ([#129858](https://github.com/NousResearch/hermes-agent/issues/129858)).

## Feature Requests & Roadmap Signals
Users requested Desktop session import ([#132406](https://github.com/NousResearch/hermes-agent/issues/132406)), A2A filtering from recents/search ([#108003](https://github.com/NousResearch/hermes-agent/issues/108003)), and easier text quoting ([#52554](https://github.com/NousResearch/hermes-agent/issues/52554)).

## User Feedback Summary
Pain centers on unreliable updates, silent data loss, ignored model configuration, inaccessible default profiles, and message gateways that stall or lose context.

## Backlog Watch
The cross-gateway collaboration RFC ([#97681](https://github.com/NousResearch/hermes-agent/issues/97681)) and longstanding Desktop OOM report ([#62964](https://github.com/NousResearch/hermes-agent/issues/62964)) need maintainer prioritization.

</details>

<details>
<summary><strong>IronClaw</strong> — <a href="https://github.com/nearai/ironclaw">nearai/ironclaw</a></summary>

## IronClaw Project Digest — 2026-10-04

### TL;DR
- IronClaw recorded one active issue update and no pull-request activity in the last 24 hours. [Issue #8122](https://github.com/nearai/ironclaw/issues/8122)
- Users are encountering a macOS `credential read failed: BackendUnavailable` error when starting `ironclaw serve` with the `local-dev` profile. [Issue #8122](https://github.com/nearai/ironclaw/issues/8122)
- No releases, merged PRs, or fixes were reported today.

### Today’s Overview
Project activity was low, with one newly created, still-uncommented bug report and no code changes. The report affects both IronClaw 1.4.1 and a locally built 1.4.0 installation, indicating a potentially persistent local-development issue rather than a newly introduced release regression. [Issue #8122](https://github.com/nearai/ironclaw/issues/8122)

### Community Hot Topics
- **Credential backend failure on macOS:** The sole discussion concerns `ironclaw serve` failing under the `local-dev` profile on Apple Silicon, despite `ironclaw doctor` passing 8/8 checks. [Issue #8122](https://github.com/nearai/ironclaw/issues/8122)
- The report highlights a need for reliable credential access and diagnostics that cover the gap between successful health checks and actual server startup.

### Bugs & Stability
- **High:** `ironclaw serve` fails with `credential read failed: BackendUnavailable` for the macOS local-dev web-app extension. It reproduces on official 1.4.1 and locally built 1.4.0; no fix PR is linked. [Issue #8122](https://github.com/nearai/ironclaw/issues/8122)

### User Feedback Summary
- Users need local macOS development to start reliably without manually diagnosing credential-backend problems.
- The successful `doctor` result but failed `serve` command suggests the health checks may not adequately validate the credential path required at runtime.

</details>

<details>
<summary><strong>QwenPaw</strong> — <a href="https://github.com/agentscope-ai/QwenPaw">agentscope-ai/QwenPaw</a></summary>

## TL;DR
- QwenPaw recorded **10 updated issues and 16 PRs**, with active work concentrated on console/session reliability, provider compatibility, and agent messaging.
- Fixes progressed for caret visibility, window geometry, chat scrolling, tool-call controls, media limits, MCP timeouts, and game-development file rendering.
- No release shipped; three new provider/runtime bugs remain unresolved, including GPT-6 probe failures and image-handling failures.

## Today’s Overview
Activity is high but release activity is absent: **9 issues remain open, 9 PRs are open, and 7 PRs are merged/closed**. The backlog indicates strong engineering throughput, tempered by recurring usability and multimodal-routing gaps.

## Project Progress
- [PR #7347](https://github.com/agentscope-ai/QwenPaw/pull/7347) keeps the rich-input caret visible; [#7356](https://github.com/agentscope-ai/QwenPaw/pull/7356) adds chat scroll locking.
- [#7357](https://github.com/agentscope-ai/QwenPaw/pull/7357) adds a tool-call visibility toggle; [#7359](https://github.com/agentscope-ai/QwenPaw/pull/7359) exposes per-media inline caps.
- [#6877](https://github.com/agentscope-ai/QwenPaw/pull/6877) persists desktop window geometry, while [#7344](https://github.com/agentscope-ai/QwenPaw/pull/7344) adds C# and shader highlighting.

## Community Hot Topics
- [Issue #7884](https://github.com/agentscope-ai/QwenPaw/issues/7884) led discussion with **8 comments**, highlighting dissatisfaction with short, incompletely reloadable history.
- [Issue #6281](https://github.com/agentscope-ai/QwenPaw/issues/6281) has **6 comments** on mobile Web-console adaptation; [Issue #7661](https://github.com/agentscope-ai/QwenPaw/issues/7661) has **5** concerning accidental duplicate sessions.
- These requests reflect demand for dependable conversation continuity and first-class mobile workflows.

## Bugs & Stability
- **High:** [Issue #8094](https://github.com/agentscope-ai/QwenPaw/issues/8094) reports the console permanently stuck at boot after stale WebView2 caching, without retry/error UI.
- **High:** [Issue #8088](https://github.com/agentscope-ai/QwenPaw/issues/8088) reports image requests hanging in a Bash/PIL cropping loop and ending silently; [#8093](https://github.com/agentscope-ai/QwenPaw/issues/8093) reports false multimodal blocking.
- **Medium:** [Issue #8074](https://github.com/agentscope-ai/QwenPaw/issues/8074) tracks GPT-6 connection-test HTTP 400s; proposed fix [#8090](https://github.com/agentscope-ai/QwenPaw/pull/8090) is open. Session duplication is addressed by open [PR #8091](https://github.com/agentscope-ai/QwenPaw/pull/8091).

## Feature Requests & Roadmap Signals
- Mobile settings navigation is advancing in [PR #8086](https://github.com/agentscope-ai/QwenPaw/pull/8086), making responsive console support likely soon.
- [Issue #8087](https://github.com/agentscope-ai/QwenPaw/issues/8087) requests agent/provider/model attribution in Feishu responses; [Issue #7535](https://github.com/agentscope-ai/QwenPaw/issues/7535) advanced Element recovery-key verification and next-generation OIDC but closed without a stated release.

## User Feedback Summary
Users report poor trust in core interactions: lost history, duplicate sessions, silent image failures, and unrecoverable boot screens. Chat-control improvements landed, but mobile support, provider/model transparency, and dependable long-running sessions remain important sources of dissatisfaction.

## Backlog Watch
Long-running [#7884](https://github.com/agentscope-ai/QwenPaw/issues/7884), [#6281](https://github.com/agentscope-ai/QwenPaw/issues/6281), and [#7661](https://github.com/agentscope-ai/QwenPaw/issues/7661) need maintainers to publish concrete acceptance criteria and near-term milestones.

</details>

<details>
<summary><strong>ZeroClaw</strong> — <a href="https://github.com/zeroclaw-labs/zeroclaw">zeroclaw-labs/zeroclaw</a></summary>

## 1. TL;DR
- ZeroClaw remained highly active: 50 issues and 50 PRs updated, with 43 issues active and 45 PRs open.
- The highest-priority work centers on runtime reliability, security boundaries, ZeroCode usability, and configuration/session correctness.
- No release was published today; several high-risk fixes and architectural changes are still awaiting review or merge.

## 2. Today's Overview
Activity was very high and concentrated in active engineering work, with 7 issues closed and 5 PRs merged/closed. The backlog shows strong investment in v0.8.6/v0.9.0 runtime hardening, gateway separation, and ZeroCode operator experience, but many items remain blocked or under review.

## 4. Project Progress
- CI improvements and Windows runtime stack-overflow remediation were closed: [#7108](https://github.com/zeroclaw-labs/zeroclaw/issues/7108), [#10734](https://github.com/zeroclaw-labs/zeroclaw/issues/10734).
- Provider cache behavior and image-history cache handling were closed: [#10662](https://github.com/zeroclaw-labs/zeroclaw/issues/10662), [#10701](https://github.com/zeroclaw-labs/zeroclaw/issues/10701).
- Active PRs include Slack status restoration ([#11514](https://github.com/zeroclaw-labs/zeroclaw/pull/11514)), ZeroCode runtime-context visibility ([#11513](https://github.com/zeroclaw-labs/zeroclaw/pull/11513)), and bounded skill HTTP calls ([#11512](https://github.com/zeroclaw-labs/zeroclaw/pull/11512)).

## 5. Community Hot Topics
- Runtime test hardening and CI performance led issue discussion: [#9965](https://github.com/zeroclaw-labs/zeroclaw/issues/9965), [#10734](https://github.com/zeroclaw-labs/zeroclaw/issues/10734).
- Cron-context behavior and ZeroCode session/channel access remain high-interest reliability concerns: [#6105](https://github.com/zeroclaw-labs/zeroclaw/issues/6105), [#10225](https://github.com/zeroclaw-labs/zeroclaw/issues/10225).
- These requests reflect demand for dependable background execution, inspectable agent activity, and consistent UI/runtime state.

## 6. Bugs & Stability
- **S0/security:** owned sessions may access shared memory through delegation paths, [#11239](https://github.com/zeroclaw-labs/zeroclaw/issues/11239).
- **S1:** macOS sandbox ignores `allowed_roots`; long-lived daemon CPU spin; ZeroCode cannot reach configured channels: [#10536](https://github.com/zeroclaw-labs/zeroclaw/issues/10536), [#9799](https://github.com/zeroclaw-labs/zeroclaw/issues/9799), [#10225](https://github.com/zeroclaw-labs/zeroclaw/issues/10225).
- **Provider/data integrity:** images over 64 KB may be truncated, and SQLite rewrites message timestamps: [#11478](https://github.com/zeroclaw-labs/zeroclaw/issues/11478), [#11420](https://github.com/zeroclaw-labs/zeroclaw/issues/11420). Related fixes are present or in progress, including [#11512](https://github.com/zeroclaw-labs/zeroclaw/pull/11512).

## 7. Feature Requests & Roadmap Signals
Standalone `zeroclaw-gw` IPC/client separation is a v0.9.0 signal: [#11002](https://github.com/zeroclaw-labs/zeroclaw/issues/11002). First-run E2E coverage and ZeroCode observability may support v0.8.6: [#8766](https://github.com/zeroclaw-labs/zeroclaw/issues/8766), [#8763](https://github.com/zeroclaw-labs/zeroclaw/issues/8763).

## 8. User Feedback Summary
Users report unreliable cron context, lost session metadata, silent ZeroCode pauses, absent channel access, and invisible runtime context. Overall satisfaction appears mixed: active contributors are shipping fixes, but S0/S1 defects and release-gate work indicate meaningful operational risk.

## 9. Backlog Watch
Maintainers should prioritize [#11239](https://github.com/zeroclaw-labs/zeroclaw/issues/11239), [#9799](https://github.com/zeroclaw-labs/zeroclaw/issues/9799), and [#10536](https://github.com/zeroclaw-labs/zeroclaw/issues/10536); several are long-running, high-risk, and marked accepted or in progress.

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*