# OpenClaw Ecosystem Digest 2026-10-03

> Issues: 500 | PRs: 500 | Projects covered: 5 | Generated: 2026-10-03 15:36 UTC

- [OpenClaw](https://github.com/openclaw/openclaw)
- [Hermes Agent](https://github.com/nousresearch/hermes-agent)
- [IronClaw](https://github.com/nearai/ironclaw)
- [QwenPaw](https://github.com/agentscope-ai/QwenPaw)
- [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw)

---

## OpenClaw Deep Dive

## 1. TL;DR

- OpenClaw released [v2026.9.8](https://github.com/openclaw/openclaw/releases/tag/v2026.9.8), containing 58 commits and 43 PRs, while sustaining very high development activity: 1,000 items updated in 24 hours.
- Stability and durability remain the dominant concerns, especially SQLite growth/locking, session recovery, subagent settlement, and process leaks.
- New fixes target CLI conversation retention, concurrent workspace initialization, model-fallback visibility, MCP pagination, and release automation, but several P0/P1 incidents still lack fix PRs.

## 2. Today's Overview

The project is highly active but operationally stressed: 337 issues and 276 PRs remain open. Activity spans release preparation, persistence performance, agent lifecycle correctness, security boundaries, and channel UX, indicating sustained maintenance pressure around the Gateway.

## 3. Releases

[v2026.9.8](https://github.com/openclaw/openclaw/releases/tag/v2026.9.8) was published with 58 commits, 43 PRs, and 21 contributors. The supplied release excerpt omits itemized changes and migration notes, so no specific breaking changes can be verified.

## 4. Project Progress

- A security fix now [releases caller context from reusable SQLite read workers](https://github.com/openclaw/openclaw/pull/164370), reducing retention of completed-turn and transcript data.
- The [cron tool schema regression](https://github.com/openclaw/openclaw/issues/108473) was closed, alongside clarification of [generated-video URL materialization](https://github.com/openclaw/openclaw/issues/132601).
- Open fixes address [CLI child-completion conversation retention](https://github.com/openclaw/openclaw/pull/164378), [concurrent workspace setup](https://github.com/openclaw/openclaw/pull/164377), and [fallback-model visibility](https://github.com/openclaw/openclaw/pull/164364).

## 5. Community Hot Topics

The largest discussions center on [unbounded SQLite WAL growth](https://github.com/openclaw/openclaw/issues/143524) (105 comments), [Gateway event-loop blocking](https://github.com/openclaw/openclaw/issues/119720) (22), and [embedded prompt-cache loss](https://github.com/openclaw/openclaw/issues/102175) (21). These reveal demand for predictable long-running persistence, efficient session maintenance, and stable provider performance.

## 6. Bugs & Stability

- **P0:** [Windows WAL growth can block startup](https://github.com/openclaw/openclaw/issues/143524); [large-store SQLite pressure causes RPC timeouts](https://github.com/openclaw/openclaw/issues/160386); and [shutdown intermittently fails](https://github.com/openclaw/openclaw/issues/158126). No fix PRs are linked in the supplied data.
- **P1:** [prepared-model-catalog leaks ~1 GiB/5 minutes](https://github.com/openclaw/openclaw/issues/160548) and [plugin captures rewrite gigabytes per start](https://github.com/openclaw/openclaw/issues/157989), indicating severe resource and SSD-wear risks.
- [MCP timeout cleanup crashes](https://github.com/openclaw/openclaw/issues/144911) was closed; related [plugin-generation fencing](https://github.com/openclaw/openclaw/pull/158348) and [CLI completion retention](https://github.com/openclaw/openclaw/pull/164378) remain open.

## 7. Feature Requests & Roadmap Signals

- [Per-agent dreaming controls](https://github.com/openclaw/openclaw/issues/67413) could plausibly land soon to prevent simultaneous memory spikes.
- A [daily maintenance window](https://github.com/openclaw/openclaw/issues/120244) may improve cron reliability, while [per-turn message budgets](https://github.com/openclaw/openclaw/issues/119992) would reduce duplicate-answer storms.

## 8. User Feedback Summary

Users report acceptable ordinary operation but serious reliability degradation under large databases, many agents, Windows, WhatsApp, Telegram, and CLI-backed sessions. Recurring dissatisfaction centers on silent memory/index staleness, missing replies, duplicate retries, runaway processes, and confusing provider errors.

## 9. Backlog Watch

Long-lived P1s needing maintainer action include [Google Vertex regression](https://github.com/openclaw/openclaw/issues/38327), [loop-detection absence](https://github.com/openclaw/openclaw/issues/120415), [memory watcher failure](https://github.com/openclaw/openclaw/issues/119411), and [zombie child accumulation](https://github.com/openclaw/openclaw/issues/97616).

---

## Cross-Ecosystem Comparison

## 1. Ecosystem Overview

The ecosystem remains highly active but operationally immature: every project is prioritizing persistence, subprocess lifecycle, provider compatibility, and observability. OpenClaw leads in release cadence and overall throughput, while ZeroClaw and QwenPaw show comparable maintenance intensity. Hermes emphasizes desktop usability and security hardening; IronClaw is comparatively quiet, with insufficient evidence to assess broader momentum.

## 2. Activity Comparison

| Project | Active Issues | Open PRs | Release Status | Health Score* |
|---|---:|---:|---|---:|
| OpenClaw | 337 | 276 | v2026.9.8 released | 6/10 |
| Hermes Agent | 44 | 35 | No release today | 6/10 |
| IronClaw | 1 | 0 | No release today | 5/10 |
| QwenPaw | Large backlog; 10 updated | 8 | No release today | 6/10 |
| ZeroClaw | 33 | 42 | No release today | 5/10 |

\*Inferred from severity, fix coverage, release cadence, and user impact; not an official metric.

## 3. OpenClaw's Position

- **Advantages:** Highest throughput, only project with a release today, broad Gateway/channel coverage, and active fixes for SQLite security, workspace concurrency, CLI retention, and fallback visibility.
- **Technical/community distinction:** More operationally complex—and more community scrutiny—around SQLite, sessions, agents, and channels. Peer activity is substantial, but OpenClaw’s 1,000 daily updates and much larger backlog indicate the ecosystem’s broadest engagement, not necessarily the healthiest runtime.

## 4. Shared Technical Focus Areas

- **Runtime reliability:** OpenClaw, Hermes, QwenPaw, and ZeroClaw all confront hangs, crashes, stale state, duplicate output, or runaway processes.
- **Provider and gateway compatibility:** OpenClaw, Hermes, QwenPaw, and ZeroClaw are addressing model fallback, malformed requests, token parameters, connection validation, and gateway isolation.
- **Resource governance:** SQLite/WAL growth, daemon CPU, memory leaks, subprocess limits, and image truncation require bounded storage and resource budgets.

## 5. Differentiation Analysis

- OpenClaw targets multi-agent, multi-channel, always-on operation; IronClaw focuses on local credential-backed services; QwenPaw differentiates through console UX and subagent lineage.
- Hermes targets desktop/voice interactions, while ZeroClaw emphasizes ZeroCode, delegation policy, gateway/runtime separation, and cross-platform execution.

## 6. Community Momentum & Maturity

- **Rapid iteration:** OpenClaw, ZeroClaw, QwenPaw, and Hermes. **Lower observed momentum:** IronClaw.
- OpenClaw is scaling fastest but carrying severe operational debt. ZeroClaw and QwenPaw are actively stabilizing; Hermes shows strong focused delivery. No project appears fully mature.

## 7. Trend Signals

- Agent platforms are moving from feature expansion toward **durable operations**: bounded persistence, deterministic recovery, resource isolation, and trustworthy diagnostics.
- Developer value is shifting toward **provider portability, explicit fallbacks, secure delegation, lineage/attribution, and observable failure modes**. These capabilities increasingly distinguish dependable assistants from feature-rich prototypes.

---

## Peer Project Reports

<details>
<summary><strong>Hermes Agent</strong> — <a href="https://github.com/nousresearch/hermes-agent">nousresearch/hermes-agent</a></summary>

## TL;DR
- Hermes Agent remained highly active: **50 issues and 50 PRs updated**, with **6 issues closed**, **15 PRs merged/closed**, and no release.
- Desktop reliability dominated discussion, especially duplicate replies, Linux/macOS launch failures, bot-screen control, and remote gateway connectivity.
- Security and delivery hardening advanced through closed email-authentication PRs and open validation work for web-provider URLs.

## Today’s Overview
The project shows **very high but unresolved activity**: 44 active issues and 35 open PRs indicate a fast-moving backlog. Closed work addressed session metadata, worker-process cleanup, streamed desktop rendering, CLI update behavior, and email authentication; release cadence is currently absent.

## Project Progress
- [PR #129772](https://github.com/NousResearch/hermes-agent/pull/129772), closed today, moves email sender authorization before MIME-body retrieval, reducing resource exposure for unauthenticated mail.
- [PR #98611](https://github.com/NousResearch/hermes-agent/pull/98611) and [PR #125405](https://github.com/NousResearch/hermes-agent/pull/125405) close email-auth pinning gaps involving the From-domain default and RFC-compliant comments.
- [PR #128887](https://github.com/NousResearch/hermes-agent/pull/128887) strengthens worktree cleanup by rechecking safety gates immediately before deletion.

## Community Hot Topics
- [Issue #123801](https://github.com/NousResearch/hermes-agent/issues/123801), the day’s most discussed thread (**23 comments**), closed after investigating duplicate macOS replies despite a single stored completion.
- [Issue #131055](https://github.com/NousResearch/hermes-agent/issues/131055) reports sticky Linux sandbox fallback state causing renderer crash loops; [Issue #120828](https://github.com/NousResearch/hermes-agent/issues/120828) covers malformed tool-only Ollama requests. Both have **6 comments**, pointing to demand for safer launcher state and provider payload normalization.
- [PR #132268](https://github.com/NousResearch/hermes-agent/pull/132268) addresses wake-word failures with noise-suppressed microphones, reflecting broader voice-assistant usability concerns.

## Bugs & Stability
- **P1/security:** [Issue #132178](https://github.com/NousResearch/hermes-agent/issues/132178) shows macOS tests replacing a checkout’s virtual-environment Python; [Issue #132189](https://github.com/NousResearch/hermes-agent/issues/132189) was closed after remote Desktop-to-gateway origin validation failures.
- **P2:** [PR #120955](https://github.com/NousResearch/hermes-agent/pull/120955) preserves indented fenced code in gateway replies; [PR #120969](https://github.com/NousResearch/hermes-agent/pull/120969) preserves startup-resume placeholders.
- **P2:** [Issue #132223](https://github.com/NousResearch/hermes-agent/issues/132223) reports healthy cron runs being released as stale; [Issue #131055](https://github.com/NousResearch/hermes-agent/issues/131055) remains unfixed.

## Feature Requests & Roadmap Signals
- [PR #120970](https://github.com/NousResearch/hermes-agent/pull/120970) and [PR #120977](https://github.com/NousResearch/hermes-agent/pull/120977) advance bot-screen profile routing and explicit stopping, likely near-term desktop priorities.
- [Issue #131337](https://github.com/NousResearch/hermes-agent/issues/131337) requests a names-only skill accessor to reduce prompt size and support retrieval-oriented plugins.
- [Issue #125813](https://github.com/NousResearch/hermes-agent/issues/125813) proposes Linux launch diagnostics, aligning with improving desktop failure visibility.

## User Feedback Summary
Users report tangible reliability pain: duplicated desktop output, inaccessible or crashing bots, broken installers, malformed model requests, and update-dependent plugin loss ([Issue #132242](https://github.com/NousResearch/hermes-agent/issues/132242)). Meanwhile, requests target better observability, safer plugin policy, and transparent learning/reliability feedback.

## Backlog Watch
- [PR #72367](https://github.com/NousResearch/hermes-agent/pull/72367), open since July, proposes fail-closed validation of web-provider final URLs; it needs security review.
- [Issue #79152](https://github.com/NousResearch/hermes-agent/issues/79152), open since August, requests a strict `pre_gateway_dispatch` policy mode and remains marked `needs-decision`.

</details>

<details>
<summary><strong>IronClaw</strong> — <a href="https://github.com/nearai/ironclaw">nearai/ironclaw</a></summary>

## 1. TL;DR
- IronClaw recorded one new issue concerning `ironclaw serve` credential access in the macOS `local-dev` profile.
- The failure affects both IronClaw 1.4.1 installed officially and 1.4.0 installed from source, despite all eight `ironclaw doctor` checks passing.
- No pull requests, releases, fixes, or other notable activity were reported today.

## 2. Today’s Overview
Project activity was low: one issue was updated and remains open, with no PR or release activity. The report indicates a potentially significant local-development reliability gap, but it does not yet establish broader production impact.

## 5. Community Hot Topics
- **[#8122 — `ironclaw serve` fails with credential read failed: BackendUnavailable](https://github.com/nearai/ironclaw/issues/8122):** The only active report, submitted today, has no comments or reactions. It highlights a need for dependable credential access across extension-backed services on macOS development setups.

## 6. Bugs & Stability
- **High: macOS credential backend failure** — [`ironclaw serve` cannot read credentials for the `web-app` extension under the `local-dev` profile on Apple Silicon, using `aarch64-apple-darwin` and Darwin 27.0.0. The issue reproduces on both 1.4.0 and 1.4.1, while `ironclaw doctor` passes 8/8 checks; no fix PR is linked.  
  **Assessment:** A version-spanning reproducibility across installation methods suggests an environmental, backend-discovery, or platform-compatibility problem rather than a single-release regression.

## 7. Feature Requests & Roadmap Signals
No explicit feature requests were submitted. However, improving credential-backend diagnostics and aligning `ironclaw doctor` checks with actual `serve` behavior would be a likely near-term stability priority.

## 8. User Feedback Summary
Users can install and validate IronClaw successfully, but core credential access still breaks during local service startup. This disconnect between successful health checks and failed execution creates meaningful developer friction.

</details>

<details>
<summary><strong>QwenPaw</strong> — <a href="https://github.com/agentscope-ai/QwenPaw">agentscope-ai/QwenPaw</a></summary>

## 1. TL;DR
- QwenPaw recorded **10 updated issues and 15 PRs**, with fixes advancing for session routing, GPT-6 compatibility, mobile UI, and chat truncation handling.
- Reliability concerns dominated the day, including console boot failures, gateway-triggered turn termination, incorrect multimodal handling, and image-processing hangs ([#8094](https://github.com/agentscope-ai/QwenPaw/issues/8094), [#8092](https://github.com/agentscope-ai/QwenPaw/issues/8092)).
- No release shipped; **8 PRs remain open**, while 7 are listed as merged/closed.

## 2. Today's Overview
Activity was high and strongly maintenance-oriented: six focused fixes were opened alongside seven closed PRs. The backlog remains unusually large, and several recently filed stability issues have only one comment, indicating limited maintainer response so far.

## 4. Project Progress
- Console usability advanced through a mobile settings drawer, LAN-safe terminal identity, and fixes for rich-input caret visibility and chat scrolling ([#8086](https://github.com/agentscope-ai/QwenPaw/pull/8086), [#8089](https://github.com/agentscope-ai/QwenPaw/pull/8089), [#7347](https://github.com/agentscope-ai/QwenPaw/pull/7347)).
- Closed work also added tool-call visibility controls, per-media provider limits, configurable MCP timeouts, game-development language support, and desktop window persistence ([#7357](https://github.com/agentscope-ai/QwenPaw/pull/7357), [#7359](https://github.com/agentscope-ai/QwenPaw/pull/7359), [#6874](https://github.com/agentscope-ai/QwenPaw/pull/6874)).
- Open work now includes explicit truncation metadata, inter-agent attribution, and persisted subagent lineage ([#8096](https://github.com/agentscope-ai/QwenPaw/pull/8096), [#8095](https://github.com/agentscope-ai/QwenPaw/pull/8095), [#7004](https://github.com/agentscope-ai/QwenPaw/pull/7004)).

## 5. Community Hot Topics
- History persistence/loading and incorrect new-session creation remained the most discussed UX concerns ([#7884](https://github.com/agentscope-ai/QwenPaw/issues/7884), 8 comments; [#7661](https://github.com/agentscope-ai/QwenPaw/issues/7661), 5).
- These reflect a core need for dependable conversation continuity and navigable long-term memory.

## 6. Bugs & Stability
- **High:** Ali-compatible gateway inspection false positives abort turns without retry/fallback ([#8092](https://github.com/agentscope-ai/QwenPaw/issues/8092)); no fix PR shown.
- **High:** GPT-6 connection tests return 400 due to outdated token parameters; fix proposed in [#8090](https://github.com/agentscope-ai/QwenPaw/pull/8090).
- **High:** stale WebView2 cache can permanently stall console startup ([#8094](https://github.com/agentscope-ai/QwenPaw/issues/8094)); image and multimodal failures also remain unresolved ([#8088](https://github.com/agentscope-ai/QwenPaw/issues/8088), [#8093](https://github.com/agentscope-ai/QwenPaw/issues/8093)).

## 7. Feature Requests & Roadmap Signals
Mobile support and richer response metadata are likely next-version candidates ([#6281](https://github.com/agentscope-ai/QwenPaw/issues/6281), [#8087](https://github.com/agentscope-ai/QwenPaw/issues/8087)).

## 8. User Feedback Summary
Users report lost historical context, duplicate sessions, unusable small-screen layouts, silent failures, and opaque model behavior. Overall satisfaction appears strained around reliability, continuity, and observability.

## 9. Backlog Watch
PR [#7004](https://github.com/agentscope-ai/QwenPaw/pull/7004), created August 13, remains open; history-loss issue [#7884](https://github.com/agentscope-ai/QwenPaw/issues/7884) needs maintainer attention.

</details>

<details>
<summary><strong>ZeroClaw</strong> — <a href="https://github.com/zeroclaw-labs/zeroclaw">zeroclaw-labs/zeroclaw</a></summary>

## TL;DR
- ZeroClaw recorded **41 updated issues and 50 PRs**, with most work focused on runtime reliability, ZeroCode, delegation security, and first-run usability.
- **Eight PRs closed**, including fixes for ZeroCode launch-directory regression, ACP recovery notices, transcript layout, and `sessions_send` documentation.
- No release shipped; urgent signals include daemon CPU spinning, oversized-image truncation, Windows stack pressure, and subprocess memory limits.

## Today’s Overview
Activity was high: **33 issues remain active** and **42 PRs open**, indicating a substantial review and stabilization workload. No new release was published, while v0.8.6/v0.9.0 runtime and gateway separation continued.

## Project Progress
- [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219) closed after fixing fresh local ZeroCode sessions to honor their launch directory, resolving [#11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387).
- [PR #11445](https://github.com/zeroclaw-labs/zeroclaw/pull/11445) preserved ACP recovery notices in ZeroCode history; [PR #11459](https://github.com/zeroclaw-labs/zeroclaw/pull/11459) centralized transcript layout state.
- [PR #11461](https://github.com/zeroclaw-labs/zeroclaw/pull/11461) clarified `sessions_send` as legacy history append rather than agent messaging.

## Community Hot Topics
- Runtime test hardening led discussion in [#9965](https://github.com/zeroclaw-labs/zeroclaw/issues/9965): 13 comments, reflecting cross-platform reliability and executable-fixture concerns.
- Prompt-budget pressure in [#5808](https://github.com/zeroclaw-labs/zeroclaw/issues/5808) generated active implementation work around deferred tool schemas.
- Gateway separation remains strategically important in [#11002](https://github.com/zeroclaw-labs/zeroclaw/issues/11002), though it is currently blocked.

## Bugs & Stability
- **High:** Long-lived daemons may sustain **140–177% CPU** in [#9799](https://github.com/zeroclaw-labs/zeroclaw/issues/9799); no fix PR is identified.
- **High:** Shell/skill subprocesses lack memory limits in [#6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916).
- **Medium:** Images over 64 KB may be silently truncated in [#11478](https://github.com/zeroclaw-labs/zeroclaw/issues/11478); Windows stack pressure in [#10734](https://github.com/zeroclaw-labs/zeroclaw/issues/10734) is closed.

## Feature Requests & Roadmap Signals
- Likely near-term: ZeroCode session refresh, provider-alias renaming, delegated approvals, and file-write overwrite reporting via [#11457](https://github.com/zeroclaw-labs/zeroclaw/pull/11457), [#11460](https://github.com/zeroclaw-labs/zeroclaw/pull/11460), [#11462](https://github.com/zeroclaw-labs/zeroclaw/pull/11462), and [#11463](https://github.com/zeroclaw-labs/zeroclaw/pull/11463).
- Deferred tool schemas could materially improve small-context workflows tracked by [#5808](https://github.com/zeroclaw-labs/zeroclaw/issues/5808).

## User Feedback Summary
Users report blocked workflows and degraded trust around cron context, channel-backed ZeroCode sessions, images, daemon CPU, workspace selection, and queued-task pauses ([#6105](https://github.com/zeroclaw-labs/zeroclaw/issues/6105), [#10225](https://github.com/zeroclaw-labs/zeroclaw/issues/10225), [#10741](https://github.com/zeroclaw-labs/zeroclaw/issues/10741)).

## Backlog Watch
Maintainer attention is needed on [PR #10412](https://github.com/zeroclaw-labs/zeroclaw/pull/10412), explicitly requiring author action, and the long-running v0.8.6/v0.9.0 tracker [#7432](https://github.com/zeroclaw-labs/zeroclaw/issues/7432).

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*