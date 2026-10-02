# OpenClaw 生态日报 2026-10-03

> Issues: 496 | PRs: 500 | 覆盖项目: 5 个 | 生成时间: 2026-10-02 20:23 UTC

- [OpenClaw](https://github.com/openclaw/openclaw)
- [Hermes Agent](https://github.com/nousresearch/hermes-agent)
- [IronClaw](https://github.com/nearai/ironclaw)
- [QwenPaw](https://github.com/agentscope-ai/QwenPaw)
- [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw)

---

## OpenClaw 项目深度报告

# OpenClaw 项目摘要 — 2026-10-03

## 1. 今日概览

OpenClaw 继续保持高度活跃，过去 24 小时内有 **496 个 issue** 和 **500 个 pull request** 获得更新；其中约三分之二仍处于开放或活跃状态。项目目前主要处于**稳定化阶段**，重点关注模型目录内存增长、gateway/SQLite 争用、重启恢复、进程泄漏和消息投递。近期发布了两个 `extended-stable` gateway 版本——**v2026.8.34** 和 **v2026.8.35**——主要涵盖关键安全、可靠性、性能和模型支持改进。P0/P1 报告以及需要通过 proof 才能合并的迁移/安全类 PR 数量较多，表明项目工程活动十分活跃，但运维和维护负担也在不断上升。

**活跃度评估：** 变更 churn 非常高；相比扩展新功能，稳定化和状态管理正确性目前占据更重要的位置。

---

## 2. 版本发布

### [v2026.8.35](https://github.com/openclaw/openclaw/releases/tag/v2026.8.35)

- 仅包含 Gateway 的 `extended-stable` 发布版本，相当于 OpenClaw 当前的 LTS 版本。
- 基于 2026 年 8 月底的 OpenClaw 代码。
- 包含：
  - 关键安全更新。
  - 可靠性和性能修复。
  - 新模型支持。

### [v2026.8.34](https://github.com/openclaw/openclaw/releases/tag/v2026.8.34)

- 同样是仅包含 Gateway 的 `extended-stable` 发布版本。
- 涵盖相同范围的稳定化、安全、性能和模型支持改进。

### 发布评估

现有发布说明未指出明确的 breaking change 或强制迁移步骤。不过，围绕 2026.9.x 的 issue backlog 反映出严重的内存、启动、provider 和持久化问题，因此运维人员应优先将 stable 分支视为风险较低的部署路径；对于对恢复能力敏感的安装环境，在升级前还应查看[2026.9.3/2026.9.4 升级与恢复跟踪 issue](https://github.com/openclaw/openclaw/issues/145252)。

---

## 3. 项目进展

从当前可见的 PR 集合来看，项目正在多个重要方向推进：

- **Gateway 启动与会话生命周期**
  - [PR #163690](https://github.com/openclaw/openclaw/pull/163690) 提议在验证数 GB 级别的 store 之前先打开 listener，并遵循 clean-close receipt。此举旨在解决启动缓慢问题，同时保持接入安全性。
  - [PR #163763](https://github.com/openclaw/openclaw/pull/163763) 将长期闲置的 materialized session rows 降级，避免长期运行的 gateway 保留不必要的 session graph。

- **模型目录 worker 性能**
  - [PR #162226](https://github.com/openclaw/openclaw/pull/162226) 处理目录范围扩大后反复重载插件的问题。它与 catalog-worker 的内存和 CPU 报告直接相关，包括 [#159662](https://github.com/openclaw/openclaw/issues/159662)、[#160548](https://github.com/openclaw/openclaw/issues/160548) 和 [#161379](https://github.com/openclaw/openclaw/issues/161379)。
  - [PR #157575](https://github.com/openclaw/openclaw/pull/157575) 处理 managed-gateway 的 heap 设置覆盖 worker 专属限制的问题。

- **会话与状态正确性**
  - [PR #163723](https://github.com/openclaw/openclaw/pull/163723) 淘汰尚未发布的 agent-session schema，降低不必要的迁移复杂度。
  - [PR #162920](https://github.com/openclaw/openclaw/pull/162920) 将旧版 ACP session metadata 的迁移移入 Doctor。该 PR 被标记为 **needs proof**，并存在兼容性和安全边界风险。
  - [PR #119055](https://github.com/openclaw/openclaw/pull/119055) 加强 Code Mode 的 continuation 和输入持久化，防止使用过期或不属于当前所有者的状态。
  - [PR #112709](https://github.com/openclaw/openclaw/pull/112709) 提议以原子方式管理 TaskFlow 取消状态。

- **Agent 上下文与用户体验**
  - [PR #138084](https://github.com/openclaw/openclaw/pull/138084) 引入由 agent 请求触发的 `session_compact` 工具，使长期运行的 assistant 能在自动 token 压力出现之前归档已完成的话题。
  - [PR #127389](https://github.com/openclaw/openclaw/pull/127389) 从普通聊天历史中隐藏内部 completion wake，以及生成媒体和 subagent 通知。
  - [PR #163761](https://github.com/openclaw/openclaw/pull/163761) 修复多 agent Gateway 上的 Workboard Sessions board 问题。
  - [PR #163762](https://github.com/openclaw/openclaw/pull/163762) 修复视频 widget 的滚动和首帧显示行为。

- **平台能力**
  - [PR #142954](https://github.com/openclaw/openclaw/pull/142954) 和 [PR #143216](https://github.com/openclaw/openclaw/pull/143216) 推进 Wear OS Gateway 对话、共享认证和 approvals。两者规模都较大，且涉及安全敏感改动。

- **维护与重构**
  - [PR #163759](https://github.com/openclaw/openclaw/pull/163759) 整合重复的 Telegram dispatch、delivery、callback 和 configuration plumbing。
  - [PR #163186](https://github.com/openclaw/openclaw/pull/163186) 淘汰 7 月之前已废弃的 OAuth sidecar import。
  - [PR #163752](https://github.com/openclaw/openclaw/pull/163752) 和 [PR #163737](https://github.com/openclaw/openclaw/pull/163737) 减少不必要的测试构建和受负载影响的 flaky 测试。

总体来看，PR backlog 主要聚焦于**资源所有权、状态持久性、启动可用性和架构清理**，而不是广泛扩展新的 agent 功能。

---

## 4. 社区热点

当前讨论最活跃的 issue 包括：

1. [Realtime voice 工作可能保留无上限的 provider 和 consult 状态 — #116201](https://github.com/openclaw/openclaw/issues/116201)  
   **59 条评论。** Realtime voice 缺少明确的资源所有权边界；在 provider 较慢或流量突发时，已被取代的 consult 工作、大型 frame 和音频数据可能不断累积。这暴露出系统需要显式取消机制、缓冲限制和会话级资源核算。

2. [Embedded prompt cache 在跨会话边界时失效 — #102175](https://github.com/openclaw/openclaw/issues/102175)  
   **21 条评论。** 在 room event、compaction、recovery 和 Responses continuation 过程中，tool inventory 和 policy state 似乎会发生变化。用户需要可预测的缓存复用机制，尤其是对于长期运行的 embedded session。

3. [升级至 2026.3.2 后 Vertex/Gemini 3.1 Pro Preview 失败 — #38327](https://github.com/openclaw/openclaw/issues/38327)  
   **18 条评论。** 这是一个长期存在的 P0 provider 回归问题，会触发 `Cannot convert undefined or null to object`。尽管已有源码复现和明确的影响范围，但目前仍需要维护者审核并提供修复。

4. [Plugin-generation supersede 终止 system-agent turn — #139710](https://github.com/openclaw/openclaw/issues/139710)  
   **18 条评论。** Hot reload 或 supersession 可能同时终止当前活动的 system-agent turn 和其 planner fallback，最终显示具有误导性的“unreachable inference”错误。

5. [Hook/tool 子进程未被回收 — #97616](https://github.com/openclaw/openclaw/issues/97616)  
   **17 条评论。** 僵尸进程不断累积，与长期运行性能下降和可能的 crash loop 有关。

6. [第二次运行挤掉进行中的 turn 并丢失回复 — #148707](https://github.com/openclaw/openclaw/issues/148707)  
   **17 条评论。** 这是一个直接的 session authority 和消息丢失回归问题：被挤掉的 turn 会在没有重试或恢复的情况下终止。

7. [Prepared-model-catalog worker 内存泄漏 — #159662](https://github.com/openclaw/openclaw/issues/159662)  
   **14 条评论。** 报告估计，在不同 provider 和配置下，内存增长速度约为每小时 4–5 GB。目前已成为最明确的 gateway 级可靠性威胁之一。

8. [2026.9.3/2026.9.4 升级与恢复可靠性跟踪 — #145252](https://github.com/openclaw/openclaw/issues/145252)  
   **12 条评论。** 这一协调 issue 反映的是迁移、Doctor、rollback、restart 和 recovery 等多个层面的综合问题，而不是单一缺陷。

### 社区的核心需求

当前最主要的诉求并不是增加表层功能。用户和运维人员需要：

- 明确的资源限制和可预测的清理机制。
- 持久化的 single-writer 机制，或明确的状态所有权。
- 在重启和 supersession 之后进行安全恢复。
- 一致的 provider adapter 行为和缓存行为。
- 更快、更安全的升级，以及可靠的 rollback。
- 更好地查看已降级但仍可工作的组件。

---

## 5. Bug 与稳定性

### P0 — 紧急的发布或可用性风险

- **[插件数量导致 Gateway 启动变慢 — #155859](https://github.com/openclaw/openclaw/issues/155859)**  
  在插件较多的安装环境中，启动时间超过 120 秒的发布预算。**潜在相关 PR：**[#163690](https://github.com/openclaw/openclaw/pull/163690)，但该 PR 主要关注 store 验证，并未覆盖所有插件启动开销。

- **[Prepared-model-catalog worker 内存泄漏 — #159662](https://github.com/openclaw/openclaw/issues/159662)**  
  报告称存在与 provider 无关的内存泄漏，增长速度约为每小时 4–5 GB。**相关 PR：**[#162226](https://github.com/openclaw/openclaw/pull/162226)。

- **[Gateway state-DB admission crash — #160521](https://github.com/openclaw/openclaw/issues/160521)**  
  在 `reconcileActive` 期间，read-admission seal 和已关闭的 worker-environment inventory 会导致 unhandled rejection。目前尚未识别出明确的修复 PR。

- **[Subscription-auth billing cooldown 会持续约五小时 — #115642](https://github.com/openclaw/openclaw/issues/115642)**  
  即使故障已经恢复，provider 仍可能在很长时间内处于禁用状态。用户提出的修复方案包括基于 probe 的恢复、缩短 usage-limit TTL，以及增加手动重置命令。

- **[Main-session heap OOM 和 core-dump restart loop — #115424](https://github.com/openclaw/openclaw/issues/115424)**  
  自动重启恢复会反复热恢复过大的 session，将单次崩溃变成持续的失败循环。

- **[Desktop app 导致 Gateway 启动循环 — #115256](https://github.com/openclaw/openclaw/issues/115256)**  
  据称，`doctor` 会建议执行某种修复，但 desktop app 随后会立即将其还原。

### P1 — 高影响的可靠性、安全或数据丢失风险

- **[子进程泄漏和僵尸进程累积 — #97616](https://github.com/openclaw/openclaw/issues/97616)**
- **[同一 session 内发生挤占时丢失进行中的回复 — #148707](https://github.com/openclaw/openclaw/issues/148707)**
- **[重启后 WhatsApp DM durable handoff 失败 — #161976](https://github.com/openclaw/openclaw/issues/161976)**
- **[SQLite 争用导致约 33 秒的 event-loop stall — #117262](https://github.com/openclaw/openclaw/issues/117262)**
- **[内存回收期间模型目录泄漏导致等待中的 turn 被终止 — #160548](https://github.com/openclaw/openclaw/issues/160548)**
- **[目录刷新循环占满一个 CPU core — #161379](https://github.com/openclaw/openclaw/issues/161379)**
- **[原地切换模型后 Codex 间歇性返回 403 — #162119](https://github.com/openclaw/openclaw/issues/162119)**
- **[内部 reasoning 泄漏 — #91804](https://github.com/openclaw/openclaw/issues/91804)**
- **[Telegram WebChat restart-recovery claim 回归问题 — #118839](https://github.com/openclaw/openclaw/issues/118839)**
- **[Claude CLI subagent turn 在 transcript-writer rebinding 时失败 — #154572](https://github.com/openclaw/openclaw/issues/154572)**

### P2 — 重要的正确性和可用性问题

- **[Realtime voice 保留无上限的状态 — #116201](https://github.com/openclaw/openclaw/issues/116201)**
- **[跨 agent dreaming 污染身份和记忆 — #65374](https://github.com/openclaw/openclaw/issues/65374)**
- **[Dreaming candidates 在晋升前被淘汰 — #150635](https://github.com/openclaw/openclaw/issues/150635)**
- **[Dreaming ranker 与 applier 对资格判定不一致 — #121232](https://github.com/openclaw/openclaw/issues/121232)**
- **[Telegram progress 重复显示初始 commentary — #116512](https://github.com/openclaw/openclaw/issues/116512)**
- **[Matrix room 可能因 no-reply 和 stale replay 形成循环 — #114211](https://github.com/openclaw/openclaw/issues/114211)**
- **[Claude CLI session limit 不会触发 fallback — #118793](https://github.com/openclaw/openclaw/issues/118793)**
- **[使用 SecretRef/env credentials 时，Discord 报告状态降级 — #160610](https://github.com/openclaw/openclaw/issues/160610)**

### 值得关注的已关闭回归问题

- [普通工具文本退化为 image placeholder — #96857](https://github.com/openclaw/openclaw/issues/96857)
- [Provider request schema 拒绝问题 — #108075](https://github.com/openclaw/openclaw/issues/108075)
- [Control UI 导航回归问题 — #108182](https://github.com/openclaw/openclaw/issues/108182)
- [Windows session creation 的 publication guard 失败 — #161953](https://github.com/openclaw/openclaw/pull/161953)
- [Telegram DM reply fallback 回归问题 — #111519](https://github.com/openclaw/openclaw/issues/111519)

这些问题的关闭是积极信号，但所有权和发布授权类缺陷反复出现，说明围绕 restart、concurrency 和 durable handoff 的 regression testing 仍需加强。

---

## 6. 功能请求与路线图信号

- **按 agent 配置 dreaming 控制 — [#67413](https://github.com/openclaw/openclaw/issues/67413)**  
  请求中的控制项包括按 agent 禁用 dreaming、错开 workspace 执行时间，以及控制内存峰值。由于当前存在多个活跃的内存问题，该功能很可能在下一稳定化阶段得到处理。

- **由 agent 请求触发的上下文压缩 — [PR #138084](https://github.com/openclaw/openclaw/pull/138084)**  
  这是一个有可能在近期落地的功能，因为它能直接减少长期 session 中的 token 浪费，并让 agent 更好地控制话题切换。目前该 PR 仍被标记为 **needs proof**。

- **Provider-neutral memory runtime — [PR #162175](https://github.com/openclaw/openclaw/pull/162175)**  
  允许不依赖 workspace 文件的 memory plugin 参与 recall。从扩展性的角度看，这具有重要战略意义，但同时涉及安全敏感和兼容性敏感的问题。

- **Wear OS Gateway 对话和 approvals — [PR #143216](https://github.com/openclaw/openclaw/pull/143216)**  
  这是一项较大的客户端平台扩展，依赖共享的 Gateway-client 工作。由于整个技术栈仍处于 draft 状态并受 proof 门控，因此不太可能立即发布。

- **macOS 后台启动模式 — [PR #163758](https://github.com/openclaw/openclaw/pull/163758)**  
  新增 `--no-activate`，用于不应抢占焦点的自动化场景。该改动范围相对有限，并且有明确的个人 assistant 使用场景。

### 近期预测

下一版本更可能重点关注：

1. 模型目录 worker 生命周期和内存上限。
2. Gateway 启动、SQLite 和 restart-recovery 可靠性。
3. 会话所有权和消息投递正确性。
4. Memory core 隔离和调度。
5. 较小的 UX 增强，例如 macOS 后台启动。

---

## 7. 用户反馈摘要

### 主要用户痛点

- **回复出现丢失或重复。** 同一 session 内发生挤占、WhatsApp 重启 handoff、重复的 transcript writer 以及 subagent delivery 失败，使用户不再信任会话连续性。
- **Gateway 消耗过多资源。** 已报告的症状包括 worker 占用数 GB 内存、CPU 被占满、僵尸进程、30 秒 event-loop stall 和反复 core dump。
- **升级行为不够可预测。** 即使已有协调跟踪 issue，用户仍报告 2026.9.x 存在严重的启动、迁移、恢复、provider 和平台回归问题。
- **Provider 行为仍不一致。** Vertex/Gemini、Codex、Claude CLI、OpenAI Responses 和 subscription-auth cooldown 故障都表明，需要加强 adapter 层面的规范符合性。
- **Memory 功能尚不适合多 agent 场景安全使用。** 共享 dreaming corpus、身份污染、晋升前淘汰，以及 ranker/applier 判定不一致，阻碍了可靠的长期个性化。
- **安全和隐私回归尤其容易损害信任。** 内部 reasoning 泄漏、跨 agent 记忆共享和 owner verification 失败都会直接影响用户信任。

### 积极信号和用例方向

- 用户正在多个平台上将 OpenClaw 部署为长期运行的个人 assistant，包括 WhatsApp、Telegram、Discord、Matrix、WebChat、WeChat、macOS、Android，以及计划中的 Wear OS。
- 自动化正在成为重要用例，尤其是后台 app 启动、任务取消和多 agent Workboard 管理。
- 多个已关闭 issue 表明，维护者能够响应明确且具体的回归问题；同时，proof-gated PR 也说明项目越来越重视安全边界和 durable state proof。

---

## 8. Backlog 观察

### 长期无人回复或依赖维护工作的问题

- **[Vertex/Gemini 回归问题，自 3 月起未解决 — #38327](https://github.com/openclaw/openclaw/issues/38327)**  
  尽管已有源码复现且影响达到 P0 级别，但目前仍没有新的修复 PR，需要维护者明确负责。

- **[跨 agent dreaming 身份污染，自 4 月起未解决 — #65374](https://github.com/openclaw/openclaw/issues/65374)**  
  该问题涉及安全、隐私和数据模型，需要产品层面作出明确决策。

- **[按 agent 配置 dreaming 控制 — #67413](https://github.com/openclaw/openclaw/issues/67413)**  
  这一较早提出的功能请求，如今已直接关联多个活跃的 memory 可靠性问题。

- **[Codex 稳态 CPU 和辅助

---

## 横向生态对比

# 跨项目生态比较 — 2026-10-03

## 1. 生态概览

个人 AI agent 生态正在从功能扩张转向**生产级可靠性、状态完整性、资源治理和安全互操作性**。OpenClaw、Hermes Agent 和 ZeroClaw 的开发 churn 非常高，而 QwenPaw 正在处理一组规模较小的 WebUI、会话和多模态问题；IronClaw 在采样期间没有活动。对于所有活跃项目而言，共同的运维挑战是如何让长时间运行、多模态、多 agent 系统保持可观测、可信赖，而不只是具备能力。因此，近期最强的差异化因素将是生命周期管理——内存边界、取消、恢复、持久消息传递和可预测的 provider 行为——而不是再接入一个模型或聊天界面。

## 2. 活动比较

| 项目 | 更新的 Issues | 更新的 PRs | 发布状态 | 健康评分* |
|---|---:|---:|---|---|
| **OpenClaw** | 496 | 500 | 两个 `extended-stable` 版本：v2026.8.34 和 v2026.8.35 | **6.5/10** — 极其活跃，但稳定化和运维负载压力很大 |
| **Hermes Agent** | 50 | 50 | 无发布 | **6.5/10** — 开发势头强劲，但存在会话、Desktop、Windows 和集成风险 |
| **IronClaw** | 0 | 0 | 未报告发布 | **N/A** — 活动不足，无法评估当前健康状况 |
| **QwenPaw** | 10 | 4 | 无发布 | **6.0/10** — 聚焦维护，但暴露了 beta 回归和会话缺陷 |
| **ZeroClaw** | 50 | 50 | 无发布；多个修复目标为 v0.8.6 | **5.5/10** — 高度活跃且重视安全，但 48 个开放 PR 意味着更高的审查和发布风险 |

\*健康评分是根据活动、发布状态、Issue 严重程度和修复成熟度得出的定性评估，并非正式的项目指标。“更新的 Issues”和“更新的 PRs”衡量的是每日关注度，不一定代表仓库的净增长。

## 3. OpenClaw 的定位

### 相比其他项目的优势

- **规模和生态广度：** OpenClaw 在采样期内的活动量遥遥领先，24 小时内 Issues 和 PRs 的合计更新接近 1,000 次。它的多渠道覆盖范围——WhatsApp、Telegram、Discord、Matrix、WebChat、WeChat、桌面端、移动端，以及计划中的 Wear OS 支持——比上述其他方案更广。
- **成熟的稳定化渠道：** 两个仅针对 gateway 的 `extended-stable` 版本提供了风险更低的部署路径，并被明确定位为 OpenClaw 对应 LTS 的方案。
- **深入的状态管理投入：** OpenClaw 正从架构层面处理启动准入、SQLite 争用、会话所有权、重启恢复、取消、provider 适配器和持久消息交接等问题。
- **强大的扩展性发展方向：** 与 provider 无关的 memory runtime、由 agent 请求触发的上下文压缩、Workboard 多 agent 支持以及平台扩展，都表明它正在打造一个广泛的个人助理平台，而不是一个功能狭窄的 coding agent。
- **广泛的运维反馈面：** Issue 数量庞大也说明其部署基础规模大、经过了充分的真实环境检验，尽管这也会增加维护成本。

### 技术路线差异

- **OpenClaw** 强调 always-on gateway、持久的多渠道会话、插件/provider 目录、持久化 memory 以及广泛的客户端形态。其主要挑战是如何控制一个成熟且有状态的平台内部复杂度。
- **Hermes Agent** 重点关注 Desktop 可用性、远程 gateway 连接、skills、本地模型工作流、Google Workspace 以及跨 agent 协作。它采用的是一种更偏客户端和集成导向的架构。
- **ZeroClaw** 强调本地和运行时控制：子进程内存限制、Windows 安全、协作式工具取消、ZeroCode/ACP 工作流、gateway 检查和委派策略。它看起来更偏运行时和运维导向。
- **QwenPaw** 优先建设多 agent workspace 和 WebUI，近期工作涵盖 reload 生命周期、多模态感知、对话编辑和跨实例协调。
- **IronClaw** 在所提供的每日数据中没有任何活动，因此无法有意义地区分其特点。

### 社区规模比较

OpenClaw 明显拥有最广泛的可观测社区活动：最活跃的 Issues 拥有数十条评论，但其 Issue 和 PR 吞吐量大约是其他活跃项目的十倍。Hermes Agent 展现出最明显的战略讨论热度，尤其是在跨 gateway 协作和 Desktop 可靠性方面。ZeroClaw 与 QwenPaw 的讨论更集中于专业问题，而 IronClaw 当前没有提供任何发展势头信号。

## 4. 共同的技术重点领域

| 技术重点 | 涉及项目 | 正在形成的要求 |
|---|---|---|
| **会话与对话完整性** | OpenClaw、Hermes Agent、QwenPaw | 防止对话轮次错位、重复回复、会话碎片化、会话亲和性错误，以及重启或 reload 后上下文丢失。 |
| **明确的生命周期与恢复机制** | OpenClaw、Hermes Agent、QwenPaw、ZeroClaw | 确保取消、drain timeout、失败轮次持久化、重启恢复和终态状态都是确定且可见的。 |
| **内存与资源边界** | OpenClaw、Hermes Agent、ZeroClaw | 对 worker、子进程、音频缓冲区、压缩 lineage 和持久化会话数据实施硬限制。 |
| **Provider 与模型可靠性** | OpenClaw、Hermes Agent、ZeroClaw、QwenPaw | 标准化 provider 配置、fallback、上下文限制、缓存行为、模型切换和 timeout 语义。 |
| **Desktop 与 gateway 连通性** | OpenClaw、Hermes Agent、ZeroClaw | 确保 private-CA TLS、WebSockets、backend 状态、reload 和 LAN 访问能够跨进程边界稳定工作。 |
| **长时间运行的工具控制** | ZeroClaw、Hermes Agent、QwenPaw | 支持协作式取消、可配置的 deadline、实时状态信号以及可靠的进程清理。 |
| **Skills 与插件正确性** | Hermes Agent、ZeroClaw、OpenClaw | 在不造成过高 prompt 成本的情况下改进发现机制，并确保检查工具能够反映真实的运行时可用性。 |
| **多 agent 委派与互操作性** | Hermes Agent、OpenClaw、ZeroClaw、QwenPaw | 在保留身份、权限、来源和审批边界的前提下，增加跨 agent 或跨 gateway 的协作。 |
| **安全与隐私** | OpenClaw、Hermes Agent、ZeroClaw | 加固 secret 存储、远程图片、Windows 路径解析、内存隔离、所有者验证和委派审批。 |
| **运维可观测性** | 所有活跃项目 | 清晰区分已完成、失败、暂停、已取消、已截断、被阻塞和仍在运行的工作。 |

最紧迫的共同要求是为**每一轮对话建立单写入者、所有权明确的生命周期模型**。消息投递、压缩、取消和恢复都依赖于运行时明确知道哪个 agent、客户端或 gateway 实例具有权威性。

## 5. 差异化分析

### 功能重点

- **OpenClaw：** 以持久 gateway 为核心的综合个人助理平台，覆盖大量消息渠道、模型/provider 扩展、memory、自动化和跨客户端访问。
- **Hermes Agent：** 以 Desktop 为先的 agent 体验，支持远程 gateway、skills、本地模型生产力集成和跨 gateway 协作。
- **ZeroClaw：** 关注运行时安全、子进程治理、ZeroCode/ACP 工作流、插件和 skill 完整性、gateway 检查以及本地/运维控制。
- **QwenPaw：** 关注多 agent workspace UX、对话纠正与回滚、WebUI 一致性，以及内置的图像/视频/音频感知能力。
- **IronClaw：** 在当前数据中没有明确的差异化信号。

### 目标用户

- **OpenClaw：** 需要跨多个渠道和设备运行 always-on 助理的运维人员和个人用户。
- **Hermes Agent：** Desktop 用户、开发者、远程 gateway 运维人员以及本地模型爱好者。
- **ZeroClaw：** 需要对执行、安全、插件和进程实施明确控制的技术用户和运维人员。
- **QwenPaw：** 构建本地或家用服务器多 agent workspace，且对 WebUI 有较强需求的用户。
- **IronClaw：** 无法根据当前活动可靠推断。

### 技术架构

OpenClaw 的差异化优势在于成熟且高度互联的 gateway，以及持久化会话生态。Hermes 正在优化 Desktop、远程 gateway、集成和 skills 之间的边界。ZeroClaw 正在加强底层运行时和策略控制，包括子进程 watchdog 和委派审批路由。QwenPaw 当前更关注 workspace 状态、对话呈现和多模态工具，而不是分布式运行时基础设施。

## 6. 社区发展势头与成熟度

### 快速迭代

- **OpenClaw：** 迭代速度最高，平台覆盖范围最广。它正在进行稳定化，而不只是继续扩张；memory、启动、持久化和投递正确性主导着其路线图。
- **Hermes Agent：** 在协作、Desktop、skills 和本地推理方面创新强劲，但许多变更仍处于开放状态，也没有发布新版本。
- **ZeroClaw：** 发布门控工作极其活跃，涵盖子进程限制、Windows secret 保护、取消、ACP 持久化和 provider 行为。大量开放 PR 也带来了审查风险。

### 聚焦稳定化

- **QwenPaw：** 工作量较低，但集中处理近期 beta 回归、会话碎片化、静默截断和 reload 清理问题。在扩大能力范围之前，需要发布一个可靠版本并完成回归测试。
- **IronClaw：** 没有每日发展势头的证据；仅凭当前快照无法评估其成熟度和路线图。

### 整体成熟度

作为**综合性部署平台**，OpenClaw 最为成熟，但其规模也暴露了更深层的可靠性技术债。Hermes 和 ZeroClaw 是非常活跃的挑战者，工程质量方向强劲，但也存在明显的发布和治理风险。QwenPaw 仍处于较早的运维加固阶段，而 IronClaw 的状态尚不确定。

## 7. 趋势信号

1. **市场正在从 agent 能力转向 agent 可信度。**  
   当前最重要的特性是持久身份、正确交接、可靠取消、可见的失败状态以及安全的重启行为。

2. **Always-on agent 需要严格的资源治理。**  
   OpenClaw 的 catalog-worker 增长以及 ZeroClaw 报告的子进程 OOM 都表明，内存和 CPU 控制是生产环境的前置要求，而不是可选的优化项。

3. **多 agent 生态需要分布式信任。**  
   Hermes 的跨 gateway 协作、OpenClaw 的委派控制、ZeroClaw 的审批路由，以及 QwenPaw 的跨实例提案，都指向 agent-to-agent 互操作性；但必须首先设计安全边界。

4. **Skills 正在成为一等运行时子系统。**  
   Hermes 正在处理 prompt 成本与可发现性之间的平衡，ZeroClaw 则在修复 skill 可见性和渠道一致性。趋势正转向可搜索索引、懒加载、具备来源追踪能力的 bundle，以及经过运行时验证的激活机制。

5. **多模态 agent 正在扩张，但缓冲区和生命周期控制仍然滞后。**  
   QwenPaw 正在加入原生音频感知，OpenClaw 正在应对无界的实时语音状态，ZeroClaw 则在考虑一个与 backend 无关的语音 channel。音频支持将需要严格的缓冲、取消和会话统计机制。

6. **本地和自托管推理仍具有重要的战略价值。**  
   Hermes 用户希望获得多 GPU 支持，并能容忍慢模型行为；ZeroClaw 专注于本地运行时控制；QwenPaw 支持自定义模型。Provider 必须以不同于托管 API 的方式处理本地延迟、资源波动和 fallback。

7. **Desktop 与 gateway 之间的边界正成为主要故障分界线。**  
   private-CA 故障、重复渲染、误报 watchdog、错误的 backend 状态、LAN 回归和失效 WebSockets，都源于 UI、主进程、gateway 与存储之间的不一致。

8. **具备恢复安全性的配置和升级路径将成为成熟产品的差异化因素。**  
   OpenClaw 的迁移/恢复跟踪，以及 Hermes 在更新、备份和 profile 处理方面的问题，都表明在升级过程中保留用户状态正在成为核心产品要求。

9. **可操作的可观测性正在取代静默降级。**  
   整个生态中越来越多的功能提案都要求提供 fallback 通知、任务阻塞原因、终态状态、资源警报和上下文使用量计量。Agent 开发者应将可观测性视为 agent API 的一部分，而不是仅供运维人员使用的附加功能。

10. **获胜的架构将把自主性与明确控制结合起来。**  
    用户希望 agent 能够跨设备和服务持续执行任务，同时也要求工具、权限、secrets、memory、委派和恢复具备明确边界。最强的项目正在逐渐趋同于这种组合，但整个生态尚未对其实现方式形成标准化。

---

## 同赛道项目详细报告

<details>
<summary><strong>Hermes Agent</strong> — <a href="https://github.com/nousresearch/hermes-agent">nousresearch/hermes-agent</a></summary>

# Hermes Agent 项目摘要 — 2026-10-03

## 1. 今日概览

过去 24 小时内，Hermes Agent 开发活动量很高，共更新了 **50 个 issue** 和 **50 个 pull request**。其中，**46 个 issue 仍处于开放或活跃状态，4 个已关闭**；**25 个 PR 处于开放状态，25 个已合并或关闭**。期间**没有新版本发布**，因此今天的工作重点显然不在版本发布，而是维护、可靠性、平台集成和架构改进。最值得关注的动向包括：持续推进跨 Agent 协作、会话完整性、网关/桌面端可靠性，以及降低技能的 token 成本。整体活动十分活跃，但高优先级回归问题和尚未解决的跨平台问题数量较多，表明当前发布面较为繁忙且可能存在不稳定风险。

## 2. 版本发布

过去 24 小时内没有发布新版本。

## 3. 项目进展

### 已合并或关闭的 PR

仓库共报告 **25 个已合并或关闭的 PR**，其中值得关注的变更包括：

- **远程网关和私有 CA 连通性**
  - [PR #103683 — bridge remote gateway WebSockets through the main process for private-CA trust](https://github.com/NousResearch/hermes-agent/pull/103683)，已关闭。
  - [PR #57239 — trust macOS keychain and `NODE_EXTRA_CA_CERTS` for remote gateway TLS](https://github.com/NousResearch/hermes-agent/pull/57239)，开放中。
  - [PR #128311 — dial remote gateway WebSockets through the main process for private-CA and LNA origins](https://github.com/NousResearch/hermes-agent/pull/128311)，开放中。
  
  这些变更针对的是 Desktop 到网关之间反复出现的问题：即使操作系统已信任远程证书，HTTPS 和 WebSocket 连接仍可能失败，因为 Chromium、Node 和主进程使用的证书信任路径可能不同。

- **网关和自动化正确性**
  - [PR #123564 — include the block reason in API-server wake turns](https://github.com/NousResearch/hermes-agent/pull/123564)，开放中。该变更可提升 Kanban/自动化的可观测性，确保被阻止的会话在唤醒时收到具体原因。
  - [PR #130416 — give each Slack slash invocation its own ephemeral reply context](https://github.com/NousResearch/hermes-agent/pull/130416)，开放中。这应能防止异步斜杠命令调用之间发生回复路由冲突。
  - [PR #125765 — allow `script_timeout_seconds=0` to disable the cron script deadline](https://github.com/NousResearch/hermes-agent/pull/125765)，开放中。这为长时间运行且支持检查点的任务提供了一种有文档说明的方式，使其不受默认一小时截止时间限制。

- **会话和 TUI 稳定性**
  - [PR #128528 — tell clients that a quiet turn is still running](https://github.com/NousResearch/hermes-agent/pull/128528)，开放中。该变更旨在解决后端仍在运行但暂时无输出时，客户端误报“回复被截断”或超时的问题。
  - [PR #130869 — prevent the TUI from crashing on `/queue rm` with an invalid index](https://github.com/NousResearch/hermes-agent/pull/130869)，开放中。
  - [PR #131047 — reuse the main-turn OpenCode session key for auxiliary threads](https://github.com/NousResearch/hermes-agent/pull/131047)，开放中。
  - [PR #131742 — allow fresh skill reads after patch no-match errors](https://github.com/NousResearch/hermes-agent/pull/131742)，开放中。这可改善 Agent 尝试编辑技能失败后，再次读取完整文件时的恢复能力。

- **安全和更新处理**
  - [PR #131746 — scan lifecycle scripts named by Windows paths](https://github.com/NousResearch/hermes-agent/pull/131746)，开放中。该提案修复了一个与安全相关的解析缺陷：POSIX 风格分词可能错误解释 Windows 反斜杠路径。
  - [PR #130878 — prevent implicit fetches for remote Markdown images](https://github.com/NousResearch/hermes-agent/pull/130878)，开放中。远程图片将改为显式链接，而不是自动加载外部资源。
  - [PR #131741 — preserve a checkout’s own `maintenance.auto=false` setting during update](https://github.com/NousResearch/hermes-agent/pull/131741)，已关闭。
  - [PR #86833 — bound the autostash restore prompt with a timeout](https://github.com/NousResearch/hermes-agent/pull/86833)，已关闭。这可防止无人值守的 `hermes update` 操作卡在交互式提示上。

- **平台和易用性修复**
  - [PR #131728 — add `activate.fish` for the fish shell](https://github.com/NousResearch/hermes-agent/pull/131728)，开放中。
  - [PR #103683](https://github.com/NousResearch/hermes-agent/pull/103683) 和 [PR #25503 — correct Windows gateway runtime status detection](https://github.com/NousResearch/hermes-agent/pull/25503)，均已关闭。
  - [PR #106042 — preserve replacement draft providers during Desktop cleanup](https://github.com/NousResearch/hermes-agent/pull/106042)，已关闭。
  - [PR #66280 — handle Telegram live locations in the background](https://github.com/NousResearch/hermes-agent/pull/66280)，开放中。这将防止持续的位置更新淹没对话，同时保留对用户主动固定位置和场所的正常处理能力。

### 反映当前工作重点的开放 PR

其余开放 PR 仍在持续推进以下方向：

- 静默轮次的存活信号和会话状态正确性。
- Slack 和 Telegram 消息投递。
- Kanban 自动化和被阻止任务的传播。
- Windows 安装、更新和终端行为。
- 技能检索、编辑和提示词效率。
- Desktop 渲染、安全性和远程网关兼容性。

## 4. 社区热点

### 跨网关的 Agent 协作

按评论数计算，最活跃的 issue 是 [Issue #97681 — Let Bots collaborate across gateways](https://github.com/NousResearch/hermes-agent/issues/97681)，共有 **33 条评论和 4 个赞**。该提案希望让 Hermes Bots 能够跨机器协作，并最终支持跨所有者协作，同时保持模型、工具、内存、凭据和部署控制权的独立归属。

这表明社区对 Hermes 从单一个人 Agent 演进为分布式 Agent 生态抱有强烈兴趣。其核心设计挑战不只是进程间消息传递，还包括安全委派、身份、权限、上下文传输、故障恢复以及清晰的权责边界。

### Desktop 重复回复与慢模型误报失败

两个高度活跃的 P1 issue 与 Desktop/会话可靠性有关：

- [Issue #123801 — macOS Desktop renders duplicate assistant replies](https://github.com/NousResearch/hermes-agent/issues/123801)，**22 条评论和 1 个赞**。
- [Issue #125306 — 45-second live-turn silence watchdog produces misleading “reply was cut off” messages](https://github.com/NousResearch/hermes-agent/issues/125306)，**7 条评论和 2 个赞**。

这些报告共同反映出后端存活状态、已存储消息状态和 Desktop 展示层之间存在更广泛的断层。运行缓慢的自托管模型可能被误判为失败；即便实际上只有一条 Assistant 消息记录和一次完成事件，会话仍可能在界面上被渲染两次。相关修复 PR [#128528](https://github.com/NousResearch/hermes-agent/pull/128528) 直接处理了静默轮次的存活判断，但重复渲染问题可能仍需单独修复持久化层到渲染层的去重逻辑。

### 技能可扩展性与提示词成本

多个 issue 和 PR 都聚焦于不断膨胀的技能上下文：

- [Issue #2045 — lazy skill loading](https://github.com/NousResearch/hermes-agent/issues/2045)，**10 条评论和 4 个赞**。
- [Issue #17649 — semantic skill retrieval with SQLite FTS5](https://github.com/NousResearch/hermes-agent/issues/17649)，**5 条评论和 1 个赞**。
- [Issue #102811 — skills prompt forces over-eager skill loading](https://github.com/NousResearch/hermes-agent/issues/102811)，**4 条评论**。
- [Issue #71481 — names-only skills index breaks spontaneous discovery](https://github.com/NousResearch/hermes-agent/issues/71481)，**2 条评论**。
- [PR #131742 — fresh skill reads after patch errors](https://github.com/NousResearch/hermes-agent/pull/131742)，开放中。

其核心需求是在减少提示词膨胀的同时，确保技能仍然可被发现。讨论揭示了一个权衡：紧凑索引可以节省 token，但移除描述后，模型可能无法意识到相关技能的存在。这很可能成为未来版本的一个重点设计方向。

### Google Workspace 集成

Google Workspace 技能已经引发多项具体的质量问题报告：

- [Issue #35560 — documented setup flags do not exist](https://github.com/NousResearch/hermes-agent/issues/35560)，**6 条评论和 1 个赞**。
- [Issue #131711 — empty Gmail searches return non-JSON from the Python backend](https://github.com/NousResearch/hermes-agent/issues/131711)，**4 条评论**。
- [Issue #43054 — Gmail retrieval drops forwarded and nested MIME bodies](https://github.com/NousResearch/hermes-agent/issues/43054)，**4 条评论**。

这些并非孤立的外观问题，而是会影响安装可靠性、输出一致性以及真实邮件的处理能力。这一模式表明，该技能在多个后端和 MIME 结构之间缺乏充分的契约测试。

### 高关注度的分发方式和本地模型需求

- [Issue #38519 — Hermes Desktop frontend-only installation](https://github.com/NousResearch/hermes-agent/issues/38519)，**8 条评论和 16 个赞**。
- [Issue #118418 — detect and use multi-GPU VRAM in the local runtime](https://github.com/NousResearch/hermes-agent/issues/118418)，**2 条评论**。

仅安装前端的需求在 issue 列表中获得了最强烈的反响，表明用户希望更清晰地拆分 Desktop 客户端与常驻网关/Agent 基础设施。多 GPU 需求则反映出用户希望将 Hermes 作为功能强大的本地模型前端使用，尤其是用于运行更大的模型和更长的上下文。

## 5. Bug 与稳定性

### P0/P1 或会话状态风险

1. **会话压缩损坏风险 — P0**
   - [PR #129759 — retain guarded auto-prune lineages](https://github.com/NousResearch/hermes-agent/pull/129759)，开放中。
   - 问题在于，自动裁剪可能删除已压缩的祖先节点，却只保留一个较旧的末端节点，从而形成损坏的压缩链，可能威胁长时间运行会话的完整性。
   - 相关开放 issue [Issue #131412 — oversized OpenAI Codex sessions cannot be compacted](https://github.com/NousResearch/hermes-agent/issues/131412) 指出，受保护的尾部历史会占满所有可压缩内容，同时 `middle_window_tokens` 仍为零。
   - **评估：**优先级很高，因为这属于数据完整性和会话连续性风险。

2. **macOS Desktop 重复显示 Assistant 回复 — P1**
   - [Issue #123801](https://github.com/NousResearch/hermes-agent/issues/123801)。
   - 即使只持久化了一条记录和一次完成事件，Assistant 消息仍可能在界面上被重复渲染。这会损害用户信任，也可能使用户或 Agent 将其误认为重复执行。
   - **修复状态：**现有数据中尚未发现直接修复该问题的 PR；相关存活状态工作见 [PR #128528](https://github.com/NousResearch/hermes-agent/pull/128528)。

3. **慢模型被误报超时 — P1**
   - [Issue #125306](https://github.com/NousResearch/hermes-agent/issues/125306)。
   - Desktop 看门狗假定静默 45 秒即表示任务失败，这对自托管模型和长时间推理而言并不安全。
   - **修复状态：**[PR #128528](https://github.com/NousResearch/hermes-agent/pull/128528) 与此问题直接相关，应优先处理。

4. **OpenCode 会话亲和性 Bug**
   - [Issue #115000](https://github.com/NousResearch/hermes-agent/issues/115000)，由 [PR #131047](https://github.com/NousResearch/hermes-agent/pull/131047) 处理。
   - 辅助线程可能复用错误或过期的 `x-opencode-session` key，从而造成上下文错误关联。

5. **与安全相关的 Windows 生命周期命令解析**
   - [PR #131746](https://github.com/NousResearch/hermes-agent/pull/131746)。
   - Windows 路径解析错误可能导致生命周期命令绕过预期的脚本扫描。应从安全角度进行审查，并针对 POSIX 和 Windows 命令形式补充测试。

### P2 可靠性与兼容性问题

- [Issue #131681 — `pilk==0.2.4` missing from `exclude-newer`](https://github.com/NousResearch/hermes-agent/issues/131681)，导致在缺少上传时间元数据的镜像中，插件工作区无法完成依赖解析。
- [Issue #124526 — non-ASCII Windows usernames break `uv` path resolution](https://github.com/NousResearch/hermes-agent/issues/124526)，影响 CLI 和 Desktop 安装。
- [Issue #120888 — full backup can run indefinitely during concurrent writes](https://github.com/NousResearch/hermes-agent/issues/120888)。
- [Issue #131736 — Windows Desktop reports backend failure while another PID remains active](https://github.com/NousResearch/hermes-agent/issues/131736)。
- [Issue #131657 — Desktop Artifacts reads remote sessions without `connection_id`](https://github.com/NousResearch/hermes-agent/issues/131657)，导致已注册的远程会话返回 404。
- [Issue #131659 — a dangling Windows symlink/junction breaks the entire Dashboard Files listing](https://github.com/NousResearch/hermes-agent/issues/131659)。
- [Issue #75444 — auto-decomposer can re-dispatch escalated triage tasks indefinitely](https://github.com/NousResearch/hermes-agent/issues/75444)。
- [Issue #43054 — nested/forwarded email bodies are dropped](https://github.com/NousResearch/hermes-agent/issues/43054)。
- [Issue #119033 — Feishu typing reactions notify the user on every turn](https://github.com/NousResearch/hermes-agent/issues/119033)。
- [Issue #131738 — Slack SVG attachments are incorrectly reported as scope/auth failures](https://github.com/NousResearch/hermes-agent/issues/131738)。
- [Issue #131739 — tool-output filenames are linkified and replaced with third-party page titles](https://github.com/NousResearch/hermes-agent/issues/131739)。
- [Issue #131070 — Desktop workspace selection lacks expected context-menu actions on Windows](https://github.com/NousResearch/hermes-agent/issues/131070)。
- [Issue #131663 — malformed tool-call garbage can flood the chat and stop the agent](https://github.com/NousResearch/hermes-agent/issues/131663)。

这些报告覆盖范围广泛，说明 Desktop、Windows、网关集成和会话持久化仍是主要稳定性热点。

## 6. 功能请求与路线图信号

### 最有可能进入近期路线图的候选项

- **跨网关和跨所有者协作**
  - [Issue #97681](https://github.com/NousResearch/hermes-agent/issues/97681)。
  - 这是数据中最强的战略信号，不过分布式身份和权限要求意味着它更可能以分阶段基础设施的形式交付，而非随单个版本一次性推出。

- **异步 A2A 任务执行**
  - [Issue #91687 — A2A long jobs should return a task ID](https://github.com/NousResearch/hermes-agent/issues/91687)。
  - 返回 task ID 并支持后续结果获取，可以解决当前 120–300 秒同步超时限制，也很适合在近期网关/插件版本中落地。

- **高效技能发现**
  - [Issue #2045](https://github.com/NousResearch/hermes-agent/issues/2045)、[Issue #17649](https://github.com/NousResearch/hermes-agent/issues/17649) 和 [Issue #102811](https://github.com/NousResearch/hermes-agent/issues/102811)。
  - 一个可能的方向是采用混合系统：紧凑的可搜索索引、按需扩展元数据，以及显式检索工具。主要设计风险是如何保留模型对技能的自主发现能力。

- **Desktop 仅前端安装**
  - [Issue #38519](https://github.com/NousResearch/hermes-agent/issues/38519)。
  - 鉴于该需求获得了 16 个赞，且远程 Agent 使用场景明确，它可能很快演变为一种实用的打包或配置调整。

- **更好的本地模型支持**
  - [Issue #118418](https://github.com/NousResearch/hermes-agent/issues/118418)。
  - 多 GPU 显存检测和上下文处理将提升 Hermes 作为本地推理客户端的吸引力，但需要在不同运行时和硬件上进行谨慎测试。

- **Profile 级心跳**
  - [Issue #130197](https://github.com/NousResearch/hermes-agent/issues/130197)。
  - 这项能力将把会话心跳扩展到 Profile 范围，并使其具备上下文感知能力。

### 可能性较低或更长期的项目

- [Issue #36002 — per-auxiliary fallback policy tiers](https://github.com/NousResearch/hermes-agent/issues/36002)，战略意义重要，但可能需要对可靠性策略进行更大规模的重新设计。
- [Issue #130197](https://github.com/NousResearch/hermes-agent/issues/130197)，依赖于一致且连贯的 Profile 和会话上下文语义。
- [Issue #118418](https://github.com/NousResearch/hermes-agent/issues/118418)，可能需要针对不同运行时进行超出 CLI/UI 层的修改。

## 7. 用户反馈汇总

### 积极信号

- 用户投入了大量讨论时间，跨网关协作 issue 获得了 **33 条评论**，Desktop 重复回复 issue 获得了 **22 条评论**。
- 仅安装前端的需求获得了 **16 个赞**，表明社区强烈希望采用更灵活的部署模式。
- 以猫为主题的原生记忆提供商提案 [PR #131744](https://github.com/NousResearch/hermes-agent/pull/131744)，也说明生态系统正在积极探索持久化和语义记忆。
- Telegram 实时位置支持、fish 激活和 OpenCode 会话处理等进展表明，贡献者正在拓宽 Hermes 的使用边界，使其不再局限于核心 Desktop 体验。

### 主要不满来源

- **静默失败或误导性失败：**慢模型被判定为回复被截断、消息重复出现、远程会话无法找到，以及后端状态报告错误。
- **Windows 使用阻力：**非 ASCII 用户名、PTY 控制台窗口、右键菜单、符号链接、网关检测和更新行为等问题引发了大量报告。
- **集成脆弱性：**Slack、Feishu、Telegram

</details>

<details>
<summary><strong>IronClaw</strong> — <a href="https://github.com/nearai/ironclaw">nearai/ironclaw</a></summary>

过去24小时无活动。

</details>

<details>
<summary><strong>QwenPaw</strong> — <a href="https://github.com/agentscope-ai/QwenPaw">agentscope-ai/QwenPaw</a></summary>

# QwenPaw 项目摘要 — 2026-10-03

## 1. 今日概览

过去 24 小时内，QwenPaw 共记录 **10 个更新的 Issue 和 4 个更新的 Pull Request**，**没有 Issue 或 PR 被关闭/合并**，也**没有新版本发布**。项目活动主要集中在提升故障可见性、清理 Agent 生命周期，以及完善内置多模态工具等方面。目前仍有多个高影响范围的 Bug 处于开放状态，包括影响局域网访问的 V2.2.2.beta4 会话页面回归问题、第三方模型不可见问题，以及 WebUI 中的会话碎片化问题。总体来看，项目贡献者参与度较高，但当前仍有大量开放的可靠性问题报告和尚未合并的修复，说明近期需要开展稳定化工作。

## 3. 项目进展

今天没有 Pull Request 被合并或关闭。不过，仍有 4 个开放 PR 推进了项目的可靠性和能力建设：

- **[PR #8084 — Refuse oversized prompts and surface empty model replies](https://github.com/agentscope-ai/QwenPaw/pull/8084)**  
  增加对超出模型有效上下文窗口的提示词的保护，并尝试显式呈现空白的模型响应，避免房间在无提示的情况下静默失败。该 PR 直接应对了 HTTP 请求成功但返回零个生成 token 的风险，尤其是在接近上下文限制时。

- **[PR #8079 — Cancel in-flight runs when reload drain time expires](https://github.com/agentscope-ai/QwenPaw/pull/8079)**  
  旨在修复 [Issue #8076](https://github.com/agentscope-ai/QwenPaw/issues/8076)。该方案可以避免长时间清理后旧 Agent 实例被静默遗弃，同时向房间发送通知并取消剩余轮次。

- **[PR #8083 — Add `view_audio` built-in tool](https://github.com/agentscope-ai/QwenPaw/pull/8083)**  
  首次贡献者提交的实现，在现有 `view_image` 和 `view_video` 工具的基础上增加了原生音频理解能力。它回应了 [Issue #8081](https://github.com/agentscope-ai/QwenPaw/issues/8081) 中对应的功能请求。

- **[PR #7936 — Complete Chinese access-control username translation](https://github.com/agentscope-ai/QwenPaw/pull/7936)**  
  补充中文环境缺失的 `channels.username` 本地化键，使中文界面与其他已发布的语言版本保持一致。这个 PR 改动很小，但能够提升界面的一致性。

**评估：** 最有意义的进展在于让异常的 Agent 行为变得可见、可恢复。不过，这些变更目前都尚未合并，因此尚不能确认用户已通过已发布的版本享受到这些改进。

## 4. 社区热点

### 最活跃 Issue：消息编辑、撤回和工作区回滚

- **[Issue #7997 — Support message retraction/editing and workspace rollback in WebUI](https://github.com/agentscope-ai/QwenPaw/issues/7997)**  
  **8 条评论**，是今日各项议题中讨论数量最多的。该请求涵盖编辑或撤回历史用户消息、截断后续对话历史，以及选择性恢复文件快照。这表明用户希望在不手动重建聊天或撤销工作区变更的情况下纠正错误，将对话状态与文件系统状态关联起来。

### 最活跃的功能讨论：用户消息的 Markdown 渲染

- **[Issue #2975 — Render user-entered session messages as Markdown](https://github.com/agentscope-ai/QwenPaw/issues/2975)**  
  **4 条评论**，最后活动时间为 10 月 2 日。报告指出，助手响应和用户消息之间存在差异：用户输入的 Markdown 会以原始语法显示。对于代码片段、结构化列表、技术说明以及文档类输入，这个问题尤其突出。

### 第三方 Agent 集成缺陷

- **[Issue #8077 — Qoder custom models unavailable and context meter hidden](https://github.com/agentscope-ai/QwenPaw/issues/8077)**  
  **2 条评论。** 据报告，Qoder 第三方 Agent 存在 3 个相互关联的缺陷：自定义模型不可见或无法使用、后端配置丢失，以及上下文使用量计量器被隐藏。多个问题集中在同一个适配器上，说明 QwenPaw 与第三方 Agent 运行框架之间需要加强集成测试和契约验证。

### Agent 重载生命周期

- **[Issue #8076 — Reload abandons in-flight turns after drain timeout](https://github.com/agentscope-ai/QwenPaw/issues/8076)**  
  **1 条评论**，并在 **[PR #8079](https://github.com/agentscope-ai/QwenPaw/pull/8079)** 中提出了修复方案。讨论重点是过长的清理时间预算——在所述实现中最长可达 24 小时——以及由此导致用户可能收不到房间通知或取消信号的可能性。

**核心需求：** 当前社区最突出的诉求并不只是增加更多功能，而是实现可信的状态管理：准确的对话历史、可预测的 WebUI 渲染、可见的截断错误、可靠的第三方模型配置，以及确定性的 Agent 清理。

## 5. Bug 与稳定性

### 高严重度：升级 Beta 后无法通过局域网访问会话页面

- **[Issue #8073 — V2.2.2.beta4 unable to access conversation page](https://github.com/agentscope-ai/QwenPaw/issues/8073)**  
  该问题在从 V2.2.1 升级到 V2.2.2.beta4 后被报告。从其他设备通过局域网访问本地服务时，会话页面无法打开，但据称本地访问正常。  
  **影响：** 这可能是一个影响远程访问以及家庭/服务器部署的版本回归问题。  
  **修复 PR：** 暂未发现。  
  **优先级：** 紧急；这是一个影响范围较大的 Beta 版本回归问题。

### 高严重度：会话被拆分到多个 UI 页面

- **[Issue #8078 — `chat_with_agent` messages registered as separate chats](https://github.com/agentscope-ai/QwenPaw/issues/8078)**  
  报告称，跨会话的 Agent 消息被注册为独立聊天，导致一个逻辑会话碎片化为多个页面。报告基于 V2.2.2b4，既影响用户体验，也影响对话状态的连续性。  
  **影响：** 破坏会话完整性，可能使多 Agent 工作流难以追踪或恢复。  
  **修复 PR：** 暂未发现。

### 高严重度：上下文窗口溢出可能静默失败

- **[Issue #8085 — Surface `finish_reason="length"` when output is truncated](https://github.com/agentscope-ai/QwenPaw/issues/8085)**  
  当前，由于输出限制而导致的生成截断会丢失停止原因，导致用户无法区分完整答案和在句子中途结束的响应。  
  **影响：** 静默数据丢失或答案不完整的情况可能被误认为是正常完成。  
  **相关 PR：**[PR #8084](https://github.com/agentscope-ai/QwenPaw/pull/8084) 处理了超大提示词和空白回复问题，但可能尚未完全实现 Issue #8085 所要求的具体 `finish_reason="length"` 行为。

### 中高严重度：Qoder 第三方集成失败

- **[Issue #8077 — Qoder custom models invisible/unusable and context meter hidden](https://github.com/agentscope-ai/QwenPaw/issues/8077)**  
  涉及配置丢失、自定义模型不可用，以及使用情况不可见等问题。  
  **影响：** Qoder 无法可靠地使用自定义模型，同时用户也无法获取关键的上下文容量信息。  
  **修复 PR：** 暂未发现。

### 中严重度：Agent 重载可能导致任务继续运行或被静默丢弃

- **[Issue #8076 — Reload drain timeout abandons in-flight turns](https://github.com/agentscope-ai/QwenPaw/issues/8076)**  
  可能持续较长时间的清理过程，最终导致正在执行的任务在没有房间级通知的情况下被遗弃。  
  **修复 PR：**[PR #8079](https://github.com/agentscope-ai/QwenPaw/pull/8079) 仍处于开放状态，并直接针对该行为提出修复。

**稳定性评估：** Beta 回归、会话路由/状态碎片化、静默截断和第三方集成失败等问题叠加，意味着项目近期稳定性风险较高。相关定向修复 PR 的出现是一个积极信号，但由于这些 PR 尚未合并，且没有新版本发布，修复目前还无法交付给用户。

## 6. 功能请求与路线图信号

### 原生音频理解

- **[Issue #8081 — Add `view_audio` built-in tool](https://github.com/agentscope-ai/QwenPaw/issues/8081)**
- **[PR #8083 — Implement `view_audio`](https://github.com/agentscope-ai/QwenPaw/pull/8083)**

这是目前最明确的近期路线图候选项，因为具体实现已经进入审查阶段。该功能将音频处理纳入与图像和视频相同的直接感知模型，减少对外部转录工具和脚本的依赖。

**预测：** 如果该 PR 能通过审查和集成测试，很可能会出现在近期发布的版本中。

### 消息编辑、撤回和可选的工作区回滚

- **[Issue #7997](https://github.com/agentscope-ai/QwenPaw/issues/7997)**

这不是一项小型的 UI 增强，而是一项涉及状态管理的复杂功能。它需要协调聊天历史截断、上下文重建、快照恢复，以及潜在的多 Agent 状态。尽管该 Issue 在当前所有开放 Issue 中社区参与度最高，但目前尚未列出对应的实现 PR。

**预测：** 该功能有可能成为路线图重点，但仍需要进行设计工作，短期内不太可能出现在下一个补丁版本中。

### 用户消息的 Markdown 渲染

- **[Issue #2975](https://github.com/agentscope-ai/QwenPaw/issues/2975)**

该请求解决了一个明显的一致性缺口。对于前端而言，实现难度相对较低，但需要确保安全的 HTML 清理，以及对代码块和粘贴内容进行一致处理。

**预测：** 这是一个适合快速发布的 WebUI 易用性改进候选项，不过目前没有正在进行的 PR。

### 跨机器 Agent 发现与委派

- **[Issue #8080 — Inter-instance agent communication](https://github.com/agentscope-ai/QwenPaw/issues/8080)**

该提案将现有多 Agent 能力扩展到单个实例或工作区之外，支持自动发现、任务委派，以及跨机器传输知识或记忆。目标是覆盖家庭服务器、办公设备和云端 GPU 主机。

**预测：** 这更像是长期的战略方向，而不是下一版本的即时功能。认证、发现机制、信任模型、数据一致性和安全性都需要先行设计。

### 完善心跳机制文档

- **[Issue #8082 — Document heartbeat silence, concurrency, and `AGENTS.md` behavior](https://github.com/agentscope-ai/QwenPaw/issues/8082)**

该请求关注的是当前配置文档未能充分解释的运行时语义。这很可能是一项低成本的文档改进，有助于用户理解预期的静默、任务重叠、并发以及心跳集成行为。

**预测：** 这是一项仅涉及文档的改动，适合在近期维护更新中发布。

## 7. 用户反馈摘要

用户的反馈呈现出较为复杂的使用体验：

- **升级 Beta 后远程访问可靠性不足：** V2.2.2.beta4 无法从其他局域网设备打开会话，这对将 QwenPaw 部署在家庭服务器或共享机器上的用户来说，是一个明显的回归问题。
- **对话状态难以信赖：** 用户希望一次会话在 Agent 通信过程中始终保持连贯，但 `chat_with_agent` 可能会创建独立的 UI 页面。
- **故障状态不够可见：** 静默截断、空白回复和被遗弃的重载任务，使用户难以判断工作究竟是完成、失败，还是仍在运行。
- **WebUI 功能对等性不完整：** 助手响应支持丰富的 Markdown，但用户消息不支持，导致技术内容展示效果较差。
- **第三方集成缺乏可靠配置：** Qoder 的自定义模型可能无法显示或保留，上下文使用情况也会被隐藏。
- **多模态工作流支持不均衡：** 目前已有图像和视频工具，但音频处理仍需要间接的变通方法。
- **纠错与恢复是重要使用场景：** 消息撤回、历史重写和工作区回滚，反映出用户对安全实验的需求，尤其是在编码 Agent 可能修改文件的情况下。

总体而言，用户的反馈体现了对 Agent 工作区的高要求：用户希望它具备可恢复性、可观测性、跨设备一致性，并能够支持丰富的技术内容和多模态输入。

## 8. 待办事项观察

- **[Issue #2975 — Markdown rendering for user messages](https://github.com/agentscope-ai/QwenPaw/issues/2975)**  
  创建于 4 月 6 日，至今仍未关闭。虽然范围相对较小，但问题已经持续数月，并影响技术用户的日常使用。它是清理积压或推动实现的强力候选项。

- **[Issue #7997 — Message editing/retraction and workspace rollback](https://github.com/agentscope-ai/QwenPaw/issues/7997)**  
  创建于 9 月 27 日，目前已有 8 条评论，既是近期提出，也具有较高参与度。维护者应明确功能范围和架构预期，避免讨论在实现开始前陷入停滞。

- **[PR #7936 — Chinese access-control username localization](https://github.com/agentscope-ai/QwenPaw/pull/7936)**  
  自 9 月 22 日起一直处于开放状态。该改动规模小、范围独立且风险较低，但在此期间获得了更多关注的较新 PR 仍不断进入处理流程。维护者进行一次审查，即可快速补上这一明显的本地化缺口。

- **[Issue #8073 — V2.2.2.beta4 LAN conversation access regression](https://github.com/agentscope-ai/QwenPaw/issues/8073)**  
  需要及时分诊和优先级评估，因为该问题似乎与最新 Beta 版本有关，并可能影响部署流程。目前尚未发现对应的修复方案。

- **[Issue #8078 — Session fragmentation in `chat_with_agent`](https://github.com/agentscope-ai/QwenPaw/issues/8078)**  
  这是一个核心状态一致性缺陷，可能削弱多 Agent 的可用性。应与会话路由和聊天注册测试一并进行分诊。

- **[PR #8084](https://github.com/agentscope-ai/QwenPaw/pull/8084)、[PR #8079](https://github.com/agentscope-ai/QwenPaw/pull/8079) 和 [PR #8083](https://github.com/agentscope-ai/QwenPaw/pull/8083)**  
  这些开放 PR 是当前提升稳定性和功能能力最直接的机会。及时进行审查、回归测试和发布规划，将有助于把社区活动转化为用户可见的产品进展。

---

</details>

<details>
<summary><strong>ZeroClaw</strong> — <a href="https://github.com/zeroclaw-labs/zeroclaw">zeroclaw-labs/zeroclaw</a></summary>

# ZeroClaw 项目摘要 — 2026-10-03

## 1. 今日概览

ZeroClaw 开发活动非常活跃：过去 24 小时内共更新了 **50 个 issue** 和 **50 个 pull request**，目前有 **47 个 issue 处于开放/活跃状态**，以及 **48 个 PR 处于开放状态**。工作重点集中在 **安全加固、运行时可靠性、provider 兼容性、ZeroCode/ACP 行为、agent 委派和 skills**。虽然没有发布新版本，但有多项开放中的修复明确以 **v0.8.6** 为目标，表明项目正在积极进行发布门控工作。整体健康状况为 **活跃但风险较高**，仍有多个高严重度及安全敏感变更等待合并或 maintainer 审查。

## 2. 发布

提供的数据中没有新的 ZeroClaw 版本发布。

不过，仓库中包含多项标记为面向 **v0.8.6** 的变更，包括：

- [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219)：为新建的本地 ZeroCode session 恢复启动目录。
- [PR #11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456)：增加可选启用的 subprocess 内存 watchdog。
- [PR #11451](https://github.com/zeroclaw-labs/zeroclaw/pull/11451)：在创建 Windows secret key 文件时为其提供保护。
- [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387)：ZeroCode 启动目录处理出现回归。
- [Issue #11369](https://github.com/zeroclaw-labs/zeroclaw/issues/11369)：Docker 启动失败，升级中断后可能造成数据库搁置；该 issue 现已关闭。
- [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336)：插件验证错误地报告了 runtime 无法注册的插件。
- [Issue #11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333)：Skill review 工具无法看到通过 `skill_bundles` 提供的 skills。
- [Issue #11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332)：针对 channel、webhook 或 gateway turn 的 skill review 和 skill 创建流程不会运行。

## 3. 项目进展

提供的 PR 列表显示有 **48 个开放中的 PR**，并报告有 **2 个 PR 已合并或关闭**，但显示的前 20 条详情中并未包含这两个已合并/关闭的 PR。因此，无法仅凭现有数据确定今天完成合并的具体变更。

当前推动项目能力和稳定性提升的重要开放工作包括：

### 运行时与安全

- [PR #11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456)：增加可选启用的 shell 和 skill subprocess 内存 watchdog，跨可见的后代进程跟踪常驻内存，并在超过配置上限时终止其所属进程。该工作直接推进了记录生产环境 OOM 事件的 [Issue #6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916)。
- [PR #11451](https://github.com/zeroclaw-labs/zeroclaw/pull/11451)：在创建 secret key 文件时应用权限受限的 Windows ACL，继续推进 [Issue #9460](https://github.com/zeroclaw-labs/zeroclaw/issues/9460) 所跟踪的安全工作。
- [PR #11469](https://github.com/zeroclaw-labs/zeroclaw/pull/11469)：修复不同 host operating system 之间的 null device 识别问题，使 Windows session 能够安全地处理 POSIX null device path。
- [PR #11465](https://github.com/zeroclaw-labs/zeroclaw/pull/11465)：向 tools 暴露 cooperative cancellation context，解决 [Issue #5836](https://github.com/zeroclaw-labs/zeroclaw/issues/5836) 中描述的长时间运行 tool 无法取消的问题。
- [PR #11458](https://github.com/zeroclaw-labs/zeroclaw/pull/11458)：通过 ownership、link、mode 和 regular-file 检查，加强用于 memory audit 卫生管理的 SQLite admission。

### ZeroCode、ACP 与 Gateway

- [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219)：为新建和重启的本地 ZeroCode Chat 与 Code session 恢复启动目录。这似乎是针对 [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387) 中回归问题的修复。
- [PR #11457](https://github.com/zeroclaw-labs/zeroclaw/pull/11457)：为当前聚焦的 ZeroCode session 增加不会取消任务的 F5 刷新流程，保留草稿、附件、队列、选中项和阅读位置。
- [PR #11431](https://github.com/zeroclaw-labs/zeroclaw/pull/11431)：关闭 gateway reload 淘汰旧实例后遗留的 chat WebSocket connection。
- [PR #11459](https://github.com/zeroclaw-labs/zeroclaw/pull/11459)：在 ZeroCode 中集中管理 transcript layout cache，确保 row、line、screen、footer、copy 和 URL index 保持一致。
- [PR #11460](https://github.com/zeroclaw-labs/zeroclaw/pull/11460)：在 ZeroCode Config interface 中增加 provider alias 重命名功能，对应 [Issue #7468](https://github.com/zeroclaw-labs/zeroclaw/issues/7468)。

### Agent、委派与配置

- [PR #11462](https://github.com/zeroclaw-labs/zeroclaw/pull/11462)：将独立 delegate 的审批请求路由至目标 operator 配置的 approval route，推进 [Issue #7743](https://github.com/zeroclaw-labs/zeroclaw/issues/7743)。
- [PR #11467](https://github.com/zeroclaw-labs/zeroclaw/pull/11467)：增加可选启用的 single-tool provider rounds，旨在简化不支持并行或完整 tool-call 行为的 provider 下的 tool execution。
- [PR #11466](https://github.com/zeroclaw-labs/zeroclaw/pull/11466)：增加 per-target 配置应用结果，提高设置被接受或拒绝情况的可见性。
- [PR #11464](https://github.com/zeroclaw-labs/zeroclaw/pull/11464)：增加可选启用的 model fallback 通知，提供 `off`、`redacted` 和 `detailed` 三种模式，对应 [Issue #7883](https://github.com/zeroclaw-labs/zeroclaw/issues/7883)。
- [PR #11438](https://github.com/zeroclaw-labs/zeroclaw/pull/11438) 和 [PR #11441](https://github.com/zeroclaw-labs/zeroclaw/pull/11441)：推进 RFC #6954，将 cron `main` jobs 绑定到创建它们的 conversation。这两项变更是 stacked changes，仍需依赖关系审查和批准。

## 4. 社区热点

按评论数量计算，最活跃的 issue 是 maintainer decision queue：

1. [Issue #8692](https://github.com/zeroclaw-labs/zeroclaw/issues/8692) — **15 条评论**  
   该 tracker 汇总了 RFC、design decision、release-policy question，以及需要 maintainer 或 code owner 关注的 issues。其高活跃度表明项目存在大量待处理的设计审查任务，而非单一的 feature request。背后的核心需求是明确的治理机制：减少架构 proposal 的歧义，并防止高风险变更在没有明确 decision owner 的情况下继续推进。

其他讨论热度较高的 issues 包括：

- [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387) — **5 条评论**  
  报告 ZeroCode working-directory handling 反复出现回归。该问题影响显著，因为 agents 可能在非预期 workspace 中运行，进而影响 file operation、repository context 和用户信任。
- [Issue #7943](https://github.com/zeroclaw-labs/zeroclaw/issues/7943) — **5 条评论**  
  提议构建一个与 backend 无关的 realtime voice-host channel，由 ZeroClaw 作为 LLM/RAG/MCP layer，通过 text 和 control events 进行工作。这反映出市场对 voice interaction 的需求，同时避免将 core agent 与特定 ASR、VAD 或 playback stack 绑定。
- [Issue #6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916) — **4 条评论**  
  报告 subprocess 在已有 output 和 timeout limit 的情况下仍会无界消耗内存。讨论重点集中在生产可靠性和 container-level OOM 风险。
- [Issue #11296](https://github.com/zeroclaw-labs/zeroclaw/issues/11296) — **4 条评论**  
  报告 llama.cpp 和 custom compatible provider 在发现 models 时错误处理 URL。
- [Issue #5836](https://github.com/zeroclaw-labs/zeroclaw/issues/5836) — **3 条评论**  
  请求为长时间运行的 tools 增加 cooperative cancellation，并指出 agent-loop cancellation 与实际 tool termination 之间存在缺口。
- [Issue #7743](https://github.com/zeroclaw-labs/zeroclaw/issues/7743) — **3 条评论**  
  提议为 independent delegate handoff 默认拒绝转发审批，以加强 agents 之间的安全性和 policy isolation。
- [Issue #7468](https://github.com/zeroclaw-labs/zeroclaw/issues/7468) — **3 条评论**  
  请求在 ZeroCode 中重命名 non-agent aliases；这是一个影响 provider、agent 和 MCP 配置的 usability issue。
- [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336) — **3 条评论**  
  报告 plugin inspection command 可能在 runtime 拒绝插件时仍声称该插件加载成功。

这些讨论反映出的主要社区需求包括：

- **可预测的执行上下文**：用户需要 session 保持正确的工作目录和 filesystem context。
- **安全的长时执行**：取消、内存限制和 failure cleanup 必须一致地应用于 tools 和 subprocesses。
- **透明的 fallback 行为**：operators 需要在 providers 切换 models 时获得可见性。
- **策略正确性**：delegated agents 和 plugins 的行为必须与用户能够检查的配置一致。
- **可运维的可观测性**：ZeroCode、ACP、channels 和 gateway paths 需要一致地展示 subagent activity、tool results 和 failed turns。

## 5. Bug 与稳定性

### 最高严重度

1. **ZeroCode/RPC channel workflow 阻塞 — [Issue #10225](https://github.com/zeroclaw-labs/zeroclaw/issues/10225)**  
   严重度：**S1 / workflow blocked**  
   ZeroCode Code/RPC sessions 无法通过 channel-backed tools 访问已配置的 channels。daemon 可以轮询 channels，但 agent tool access 似乎不可用。提供的 PR 列表中没有显示直接对应的修复。

2. **失败的 ACP turn 未能持久化 — [Issue #10673](https://github.com/zeroclaw-labs/zeroclaw/issues/10673)**  
   严重度：**S1 / workflow blocked**  
   通过 ZeroCode Code pane 发起的失败 turns，可能不会在 daemon RPC path 上持久化。这可能掩盖失败情况，并增加 recovery 或 debugging 的难度。该 issue 仍处于开放和处理中。

3. **Docker 启动失败及数据库搁置 — [Issue #11369](https://github.com/zeroclaw-labs/zeroclaw/issues/11369)**  
   严重度：**S1**，现已**关闭**  
   从 `master` 构建的 images 可能在启动时退出，因为 daemon 在加载配置前锁定了 data directory，随后又因配置的路径不同而拒绝运行。该 issue 还指出，升级中断后可能出现数据库搁置。其关闭状态表明问题已得到解决，但提供的 PR 子集中未标明确切的 merged fix。

### 高影响回归与可靠性问题

4. **ZeroCode 启动目录回归 — [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387)**  
   严重度：**S2 / degraded behavior**  
   新建 sessions 会忽略 shell launch directory，转而使用 configured agent workspace。该回归与 [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219) 相关，目前该 PR 仍未关闭。

5. **Plugin verification/runtime 不一致 — [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336)**  
   严重度：**S2 / degraded behavior**  
   `plugin info` 和 `plugin list --verify` 可能会将某个 plugin 报告为 `[loads]`，但 runtime 实际会拒绝注册它，因为必需的配置值缺少 schema。这会造成 diagnostic output 与实际 availability 之间的危险偏差。

6. **Skill bundle review 不可见 — [Issue #11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333)**  
   严重度：**S2 / degraded behavior**  
   通过 `skill_bundles` 加载的 skills 无法被 `skills_list` 和 `skill_view` 等 skill review tools 访问。

7. **Non-CLI channels 缺少 learning loop — [Issue #11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332)**  
   严重度：**S2 / degraded behavior**  
   即使相关功能已启用，针对 Matrix、webhook、gateway/web UI 以及其他由 channel 驱动的 turns，skill review 和 skill creation 仍不会运行。

8. **Custom provider 与 llama.cpp provider URL 解析问题 — [Issue #11296](https://github.com/zeroclaw-labs/zeroclaw/issues/11296)**  
   严重度：**S3**  
   compatible providers 在获取 models 时可能忽略配置的 URI，尤其是在通过 routers 访问时。相关开放工作 [PR #11468](https://github.com/zeroclaw-labs/zeroclaw/pull/11468) 处理的是 reasoning controls，而不是此处报告的 URL 问题。

9. **Windows Ctrl+C 行为 — [Issue #9028](https://github.com/zeroclaw-labs/zeroclaw/issues/9028)**  
   严重度：**S2**  
   在 Windows CLI 中，Ctrl+C 会触发类似强制退出的终止行为，并返回 exit code `1073741510`，而不是作为正常 interrupt 处理。

10. **Gateway reload 遗留 WebSocket connections — [PR #11431](https://github.com/zeroclaw-labs/zeroclaw/pull/11431)**  
    这是一项稳定性修复，而不是新报告的 issue。完成 reload 的 gateway instances 可能会让 upgraded chat sockets 继续连接到已淘汰的旧 instances。

11. **Agent context exhaustion 缺少 terminal status — [Issue #8758](https://github.com/zeroclaw-labs/zeroclaw/issues/8758)**  
    严重度：**S2**  
    Agents 可能因 context pressure 停止，却没有明确报告任务已完成、已暂停，还是无法继续。

12. **ZeroCode queue 静默暂停 — [Issue #10741](https://github.com/zeroclaw-labs/zeroclaw/issues/10741)**  
    严重度：**S2**  
    如果预期的 terminal notification 缺失，看似正常的 response 可能导致 queued work 悄然暂停。

## 6. Feature Requests 与路线图信号

### 下一版本的潜在候选内容

以下变更具有明显的 release-planning 信号，因为它们已经在开放中的 PRs 中实现，和/或被标记为 v0.8.6 的目标内容：

- **Subprocess 内存控制** — [PR #11456](https://github.com/zeroclaw-labs/zeroclaw/pull/11456) / [Issue #6916](https://github.com/zeroclaw-labs/zeroclaw/issues/6916)
- **恢复 ZeroCode 启动目录** — [PR #11219](https://github.com/zeroclaw-labs/zeroclaw/pull/11219) / [Issue #11387](https://github.com/zeroclaw-labs/zeroclaw/issues/11387)
- **Windows secret-file 保护** — [PR #11451](https://github.com/zeroclaw-labs/zeroclaw/pull/11451) / [Issue #9460](https://github.com/zeroclaw-labs/zeroclaw/issues/9460)
- **Plugin verification 正确性** — [Issue #11336](https://github.com/zeroclaw-labs/zeroclaw/issues/11336)
- **Skill bundle review 支持** — [Issue #11333](https://github.com/zeroclaw-labs/zeroclaw/issues/11333)
- **Channel/gateway skill-learning 一致性** — [Issue #11332](https://github.com/zeroclaw-labs/zeroclaw/issues/11332)

### 中期路线图信号

- **Realtime voice-host channel** — [Issue #7943](https://github.com/zeroclaw-labs/zeroclaw/issues/7943)  
  一个与 backend 无关的 WebSocket voice interface 可能成为一项重要的 channel capability，但目前仍处于搁置状态，需要做出架构决策。
- **A2A protocol crate** — [Issue #11254](https://github.com/zeroclaw-labs/zeroclaw/issues/11254)  
  提议中的 `zeroclaw-a2a` crate 表明项目正持续投入标准化 agent-to-agent interoperability。
- **Knowledge corpus 与 document RAG** — [Issue #11235](https://github.com/zeroclaw-labs/zeroclaw/issues/11235)  
  该 RFC 提议提供由 operator 管理的 document retrieval，可应用于 local documentation、security references 和 tool knowledge。
- **Standalone gateway process** — [Issue #11002](https://github.com/zeroclaw-labs/zeroclaw/issues/11002)  
  将 `zeroclaw-gw` 拆分为可选的 IPC client，是迈向 headless 和独立部署 web deployments 的一项重大架构调整。目前该工作处于阻塞状态，目标版本为 v0.9.0。
- **明确的 session lifecycle semantics** — [Issue #10293](https://github.com/zeroclaw-labs/zeroclaw/issues/10293)  
  项目正在评估是否应弃用 `sessions_send`，转而采用更准确、且具备 provenance awareness 的 history operation。
- **Eval harness 内存覆盖** — [Issue #9226](https://github.com/zeroclaw-labs/zeroclaw/issues/9226)  
  增加 memory seeding 和 side

</details>

---
*本日报由 [agents-radar](https://github.com/dboeter/daily-diff) 自动生成。*