# AI CLI 工具社区动态日报 2026-10-03

> 生成时间: 2026-10-02 20:23 UTC | 覆盖工具: 7 个

- [Claude Code](https://github.com/anthropics/claude-code)
- [OpenAI Codex](https://github.com/openai/codex)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)
- [OpenCode](https://github.com/anomalyco/opencode)
- [Pi](https://github.com/earendil-works/pi)
- [Qwen Code](https://github.com/QwenLM/qwen-code)
- [Claude Code Skills](https://github.com/anthropics/skills)

---

## 横向对比

# 跨工具 AI CLI 生态报告 — 2026-10-03

## 1. 生态概览

AI CLI 的发展正从基础聊天与代码生成，转向**持久、可恢复的多智能体执行系统**。当前的核心工程问题包括会话连续性、上下文压缩、MCP/进程生命周期、后台任务可观测性、权限，以及部分失败后的恢复能力。跨平台可靠性——尤其是 Windows 以及浏览器/计算机使用环境——仍是众多能力较强工具的短板。与此同时，结构化输出、Git 工作流控制、BYOK/提供商兼容性和适合自动化的 API，也显示出各工具正在趋同的方向。社区对**可预测性和可检查性**的需求日益增长：用户希望获得清晰的状态、可执行的错误信息，以及对智能体行为的明确控制。

## 2. 活跃度比较

> 数量反映所提供的摘要中重点展示的项目，不一定代表仓库的完整活动总量。未列出 Discussions 并不表示该频道没有活动，只表示摘要中未收录相关内容。

| 工具 | 重点展示的 Issues | 重点展示的 PRs | 重点展示的 Discussions | 发布状态 |
|---|---:|---:|---:|---|
| **Claude Code** | 10 | 2 | 0 | 稳定版：**v2.1.288** |
| **OpenAI Codex** | 10 | 10 | 4 | 快速预发布：`0.162.0` 的 **7 个 Rust alpha 构建** |
| **Gemini CLI** | 10 | 10 | 0 | Nightly：**v0.64.0-nightly.20261002** |
| **GitHub Copilot CLI** | 10 | 1 | 0 | 三个补丁版本：**v1.0.92-0/-1/-2** |
| **OpenCode** | 10 | 10 | 0 | 过去 24 小时内没有发布 |
| **Pi** | 10 | 10 | 3 | 过去 24 小时内没有发布 |
| **Qwen Code** | 10 | 10 | 0 | Nightly：**v0.24.7-nightly.20261001** |

### 发布情况解读

- **Copilot CLI** 采用最传统的稳定性发布节奏，重点解决 Windows 沙箱、MCP 重连、OAuth、后台智能体引导和会话钩子等问题。
- **Codex** 和 **Gemini CLI** 在预发布工程方面最活跃，均有十个实现类 PR；Codex 的七个 alpha 构建也表明其迭代速度异常迅捷。
- **OpenCode** 和 **Pi** 虽未发布版本，但开发活动活跃。OpenCode 专注于 OpenCode 2.0 的可用性和会话/提供商行为；Pi 则处理提供商兼容性、安全加固及即将推出的 1.0 打包工作。
- **Claude Code** 发布了聚焦重点的稳定版本，但社区活动更多集中在长期运行中的正确性问题，而非功能广度。
- **Qwen Code** 的活动高度集中在 Managed Agent 架构和分布式会话基础设施上。

## 3. 共同功能方向

### A. 可靠的 MCP 与子进程生命周期管理

- **Claude Code：** MCP 服务器无法在进程退出后持续运行；Windows 子进程终止行为不一致。
- **Codex：** MCP 启动后可能比原始连接存续更久，导致线程监听器未加载；浏览器/计算机任务持续遭遇 MCP 启动失败。
- **Copilot CLI：** 存在失效的 MCP writer 绑定、过期的 Streamable HTTP 会话、OAuth 回调不兼容、工作区 `.mcp.json` 加载及注册表失败等问题。
- **Qwen Code：** 托管会话需要支持恢复的工具执行、writer fencing，以及经认证的 broker 提供凭据。
- **Gemini CLI：** 浏览器智能体设置和工具生命周期行为仍不一致。

**需求：** 为本地和远程 MCP 服务器提供确定性的启动、关闭、重连、超时和清理语义。

### B. 持久会话与可恢复的智能体状态

- **Claude Code：** 压缩过程可能静默移除工作上下文；归档功能缺少完整的恢复/删除生命周期。
- **Gemini CLI：** 恢复后快速退出可能删除历史记录；nightly 版本正在加入仅追加记录、原子状态写入和备份恢复。
- **OpenCode：** 磁盘空间耗尽可能导致 TUI 崩溃，并留下格式错误的工具调用记录；会话清理可能影响正在进行的工作。
- **Qwen Code：** 删除实时会话可能造成历史记录降级；托管存储和投影会无限增长。
- **Copilot CLI：** 本地执行后移动端状态可能仍处于排队状态；上下文轮转和生命周期钩子需要更强保证。

**需求：** 持久化对话记录、事务性状态更新、有界保留、显式压缩，以及可靠的归档/恢复/删除语义。

### C. 上下文与 Token 透明度

- **Claude Code：** 用户要求能够查看并选择退出 microcompaction 和 idle compaction。
- **Gemini CLI：** 大型工具集触发 API 错误；过早展开目录和纳入二进制文件会导致上下文膨胀。
- **Codex：** 模型访问错误缺少 entitlement 和上下文窗口信息。
- **Copilot CLI：** 模型回退可能选择无法容纳已累积静态提示词的模型。
- **Pi：** 网络错误后上下文使用量可能跃升至 330K；长上下文定价和推理 token 统计需要修正。
- **Qwen Code：** 系统提示词、工具、`QWEN.md` 和 skills 会产生不透明的对话外开销；侧查询绕过了上下文窗口限制。

**需求：** 在所有请求路径上实现准确估算、可见的固定上下文成本、可预测的压缩，以及安全的预算控制。

### D. 智能体与子智能体可观测性

- **Claude Code：** 孤立智能体/后台工作及云消息行为难以协调。
- **Codex：** 排队的提示词可能永远不会发送；审查可能静默跳过 fork PR；子智能体限制说明不足。
- **Gemini CLI：** 子智能体达到 `MAX_TURNS` 后仍可能报告成功；`/bug` 不会包含失败的子智能体轨迹。
- **OpenCode：** 子智能体可能向用户提出本应通过父智能体路由的问题；队列与引导语义出现回归。
- **Pi：** 在重试、恢复、通知和计划继续执行期间，扩展提示词贡献会消失。

**需求：** 明确的任务状态、已确认队列、正确的终止状态、完整轨迹，以及可控的消息路由。

### E. 安全、权限与隔离

- **Qwen Code：** 隔离应在权限流程之前执行；主机重新注册可能留下失效但仍有效的凭据；Desktop 工作区可能意外失去信任。
- **Gemini CLI：** 风险包括破坏性 Git 操作，以及散落在仓库中的临时脚本。
- **Claude Code：** 安全防护误报会影响正常操作和提示词。
- **Copilot CLI：** 持久允许目录无法可靠地抑制 shell 提示。
- **Codex：** Windows 浏览器权限无法验证，因而无法判断执行是否已获授权。

**需求：** 策略决策必须在提示用户之前执行，能够跨重启持久化，作用域设置正确，并通过可执行的诊断信息进行观察。

### F. 更好的 Git 与自动化控制

- **Codex：** 恢复分支选择并明确 worktree 创建行为；改进 fork PR 审查。
- **Claude Code：** `gh api` 现已内置于云会话中，模型/模式选择需要更清晰的控件。
- **OpenCode：** `opencode run` 的 schema 约束输出提升了机器可消费的自动化能力。
- **Copilot CLI：** 持久权限和后台执行需要可预测的行为。
- **Pi 和 Qwen Code：** 正在扩展打包、托管工作区和扩展集成。

**需求：** 提供可脚本化、结构化的接口，并明确仓库、分支、权限和完成语义。

### G. 非交互模式与后台工作能力对齐

- **Gemini CLI：** PR 正在为非交互模式启用 skills，并增加 Web 工具超时。
- **Copilot CLI：** 后台智能体获得可引导消息和更可靠的上下文恢复能力。
- **OpenCode：** Schema 输出和显式队列/引导控制面向自动化场景。
- **Codex：** 正在改进 worktree 选择、线程生命周期和异步任务可见性。

**需求：** 后台智能体应提供与交互式会话相同的 skills、控制能力、状态和安全保证。

## 4. 差异化分析

### Claude Code

**重点：** 丰富的本地/云端智能体工作流、mods、MCP、会话生命周期和上下文管理。

**技术路线：** 在成熟的交互式编码智能体基础上扩展 mod API、云会话工具、模型/模式配置和跨客户端会话行为。近期版本新增内容相对有限，但待办问题反映出来自长时间会话、静默压缩和客户端不一致的压力。

**最适合：** 已投入 Claude 生态系统、需要可扩展性及本地/云端编排能力的开发者。

**当前取舍：** 功能强大但日益复杂；上下文透明度、Windows 可靠性和完整的会话生命周期仍未解决。

### OpenAI Codex

**重点：** Rust CLI/TUI 演进、Git 工作流、计算机/浏览器使用、模型路由和子智能体可组合性。

**技术路线：** 围绕事件驱动的智能体运行时快速进行 alpha 开发，涉及重试处理、连接器缓存、MCP 生命周期、终端输入和 Git 感知命令。Worktree UX 和动态模型编排体现了其向可组合智能体基础设施发展的方向。

**最适合：** 寻找开放、以终端为中心的编码智能体，并希望直接使用其不断演化的运行时的开发者。

**当前取舍：** 迭代迅速且扩展潜力强，但 alpha 版本波动较大，Windows 支持和状态可观测性也存在明显缺口。

### Gemini CLI

**重点：** 会话持久性、子智能体、浏览器智能体、仓库级上下文管理和非交互工作流。

**技术路线：** 大量投入文件发现、惰性 `@directory` 展开、glob 匹配、原子持久化、有界 Web 调用、OAuth 标准和工具数量削减。它正在从实现层积极解决上下文膨胀和生命周期挂起问题。

**最适合：** 在大型仓库中工作，或使用委派与浏览器能力工作流的开发者。

**当前取舍：** 能力广泛，但子智能体终止、挂起、设置合规和破坏性操作风险仍需更强的可靠性。

### GitHub Copilot CLI

**重点：** 以 GitHub 为中心的企业级开发、OAuth、沙箱、后台智能体引导和生命周期钩子。

**技术路线：** 三个补丁版本构成一轮稳定性更新，集中处理远程 MCP 重连、Windows 临时文件行为、OAuth 重新认证、上下文轮转和会话事件。它与 GitHub 的认证及开发者生态系统结合最紧密。

**最适合：** 已投入 Copilot、GitHub Actions 和企业身份体系的 GitHub 用户与组织。

**当前取舍：** 生态系统集成便捷，但 MCP 仍是最大的摩擦来源；自定义模型兼容性尚不够成熟。

### OpenCode

**重点：** 提供商灵活性、BYOK、OpenCode 2.0、TUI 可用性、会话连续性和自动化。

**技术路线：** 提供商中立，拥有强大的 TUI 和广泛的模型/账户支持。当前工作聚焦启动性能、队列语义、schema 约束输出、剪贴板行为和 V2 回归修复。

**最适合：** 重视模型选择、本地提供商控制及键盘驱动界面的开发者。

**当前取舍：** 灵活性和可定制性强，但提供商、配额、entitlement 和 V2 过渡问题增加了运行不确定性。

### Pi

**重点：** 可扩展性、提供商兼容性、token 统计、安全、终端 UX，以及规划中的 1.0 架构。

**技术路线：** 轻量、面向提供商适配器，并日益转向原生/C++ 实现。近期变更涵盖 Azure/Bedrock/OpenRouter 兼容性、WebP 解析、依赖安全、流式统计、隐藏工具提示词和 codemode 资源使用。

**最适合：** 希望拥有小巧、可修改的智能体运行时，并广泛控制提供商和扩展的开发者。

**当前取舍：** 灵活性和可定制性强，但 Windows 成熟度、扩展 API 兼容性和提供商特定行为仍需仔细验证。

### Qwen Code

**重点：** Managed Agent 基础设施、持久化分布式会话、托管工作区和 Qwen 原生智能体架构。

**技术路线：** 路线图最偏后端基础设施。它将推理与工具环境配置分离，并正在构建认证 broker、writer 所有权、可恢复执行、投影、重试和侧查询 token 控制。

**最适合：** 构建托管式、多智能体或长时间运行智能体服务的平台工程师。

**当前取舍：** 分布式基础设施目标宏大，但会话、凭据、保留和幂等语义仍在持续完善。

## 5. 社区发展与成熟度

### 最明显的发布动能

1. **OpenAI Codex** — 一天内发布七个 alpha 版本并合入十个实现类 PR，迭代周期最快。
2. **Gemini CLI** — 十个 PR 及一个聚焦会话持久性、上下文效率、超时和协议正确性的版本。
3. **Qwen Code** — 十个 PR 集中于连贯的 Managed Agent 架构，表明开发强度很高。
4. **GitHub Copilot CLI** — 24 小时内发布三个补丁版本，体现的是积极稳定化周期，而非功能集中推进。
5. **Pi** — 尽管没有发布版本，但有十个 PR 涉及安全、提供商、统计、渲染和原生构建基础设施。
6. **OpenCode** — 十个 PR 和大量 issue 活动，主要用于修复及改进 2.0 过渡。
7. **Claude Code** — 摘要中 PR 活动较少，但发布了聚焦重点的稳定版本；主要 MCP 清理 issue 获得了 46 条评论，运维问题十分突出。

### 社区参与信号

- **OpenCode** 的单个 issue 获得了最强烈反响：关于在 skills 中遵守 `disable-model-invocation` 的 issue 获得 70 个 👍，表明市场对 Claude 兼容扩展语义存在大量需求。
- **Codex** 广泛的工作流问题获得了高度关注：恢复分支选择获得 57 个 👍，fork PR 审查支持获得 26 个 👍。
- **Claude Code** 的主要 issue 吸引了 24–46 条评论，集中于 MCP 清理、身份认证和上下文退化。
- **Copilot CLI** 报告有 33 个近期更新的 issue，说明其待办事项规模可观，尽管摘要中仅收录了一个 PR。
- **Pi** 的 Windows 讨论达到 72 条评论，显示出对平台可用性的异常强烈关注。
- **Qwen Code** 的 Managed Agent 架构 issue 达到 41 条评论，表明架构层面的参与度很高。

### 成熟度评估

- **生产集成最成熟：** Claude Code 和 GitHub Copilot CLI。两者均拥有成熟用户基础和完整产品形态，但仍存在有意义的可靠性缺口。
- **演进速度最快：** Codex、Gemini CLI 和 Qwen Code。
- **提供商灵活性和定制导向最强：** OpenCode 和 Pi。
- **最专注于基础设施级多智能体成熟度：** Qwen Code。
- **过渡风险最明显：** OpenCode 2.0、Codex 的 alpha Rust 版本线，以及 Pi 即将进行的 1.0 打包变更。

以上评估基于单日摘要样本，方向性仅供参考；issue 数量和用户反应不能直接用于比较项目整体规模或用户基础成熟度。

## 6. 趋势信号

### 1. CLI 正在成为智能体运行时，而不再只是终端界面

会话所有权、可恢复工具调用、writer fencing、子智能体、后台引导、broker 认证、投影以及云端/本地路由，如今主导着各项目的路线图。选择工具时，应考虑其持久化模型，而不只是模型质量或编码基准。

### 2. 可观测性正在取代隐式进度，成为默认要求

队列确认、压缩通知、任务终止原因、上下文明细、迟到结果统计和明确的终端状态，正在成为采购标准。一个即使能够工作，却无法证明自身执行过程的智能体，不太适合无人值守使用。

### 3. MCP 可靠性是集成层面的共同瓶颈

每个成熟集成都会遇到以下若干问题：凭据失效、会话过期、配置发现、OAuth 回调不兼容、进程泄漏或启动顺序错误。能够实现统一 MCP supervisor——涵盖认证、健康检查、重连策略、诊断和可靠清理——的厂商将形成显著差异化。

### 4. 提供商中立具有价值，但在运维层面并不容易

OpenCode、Pi 以及 Copilot/Codex 的部分功能支持自定义或路由模型。然而，工具 schema 兼容性、token 统计、配额隔离、entitlement 发现、上下文窗口和回退行为仍不一致。评估 BYOK 时应使用测试矩阵，而不能将其视为即插即用的模型替换方案。

### 5. 长上下文模型正在暴露固定上下文的经济成本

大型模型上下文窗口并不能消除上下文压力。工具 schema、系统提示词、skills、仓库文件、侧查询和多模态资产都可能占用大量容量。`/context` 式统计、惰性工具发现、限定范围的 skills，以及按路径划分的 token 预算，正在成为标准智能体功能。

### 6. 后台自主执行需要更强的安全边界

社区正转向显式队列/引导模式、有界重试、工作区隔离、持久权限和父智能体问题路由。要投入生产使用，无人值守执行必须配套保留期限、取消机制、幂等性和可审计的终端状态。

### 7. 平台能力对齐仍是重要竞争差异化因素

Claude Code、Codex、Copilot CLI 和 Pi 均有 Windows 失败案例。原生终端处理、进程清理、文件系统语义、浏览器授权和沙箱应成为一等发布标准，而不是外围兼容性工作。

### 开发者实用参考

在 2026 年末选择或构建 AI CLI 时，应优先考虑：

1. **会话持久性与恢复能力**
2. **明确的任务和队列状态**
3. **上下文窗口与压缩透明度**
4. **MCP 生命周期与诊断能力**
5. **结构化、可脚本化输出**
6. **权限持久化与工作区隔离**
7. **跨平台测试，尤其是 Windows**
8. **提供商和工具 schema 兼容性**
9. **有界存储、重试和后台任务保留**
10. **可观察的子智能体轨迹和失败原因**

整个生态系统正在收敛于相似的架构，但当前最强的差异化因素已是实现质量——状态正确性、故障恢复、策略执行和清晰度——而不是能否使用通用编码模型。

---

---

## 各工具详细报告

<details>
<summary><strong>Claude Code</strong> — <a href="https://github.com/anthropics/claude-code">anthropics/claude-code</a></summary>

## Claude Code Skills 社区热点

> 数据来源: [anthropics/skills](https://github.com/anthropics/skills)

# Claude Code Skills 社区热点  
*截至 2026-10-03。由于所提供的数据集中不包含 PR 评论数，以下排名是对社区关注度、时效性、影响范围以及 issue/PR 关联度的定性代理指标，并非严格的评论数排名。所有列出的 PR 均处于开放状态。*

## 1. 热门 Skills 排名

1. **[#1298 — skill-creator trigger-evaluation fixes](https://github.com/anthropics/skills/pull/1298)**  
   通过隔离 worker 进程、处理 Windows 子进程行为，并防止将无关的工具故障误判为负面示例，提升评估可靠性。  
   - **讨论亮点：** 解决了一项根本性的质量保证问题：无效或误导性的触发评分可能诱导贡献者对 Skills 进行错误优化。  
   - **状态：** **开放**

2. **[#1742 — mcp-builder support for MCP 2.x](https://github.com/anthropics/skills/pull/1742)**  
   针对较新的 `mcp>=2.0.0` 版本，更新了 streamable HTTP 客户端导入和自定义标头配置。  
   - **讨论亮点：** 跟进已报告的 issue [#1668](https://github.com/anthropics/skills/issues/1668)，反映出 Skills 必须跟上快速变化的 MCP API 这一实际运维需求。  
   - **状态：** **开放**

3. **[#1771 — proofcore-contract-auditor](https://github.com/anthropics/skills/pull/1771)**  
   为 Solidity 和 Rust 智能合约添加静态分析，并通过 ProofCore 的零存储 Merkle 协议，在 TON 上提供加密审计证明存证。  
   - **讨论亮点：** 融合了安全分析、区块链来源追踪和 Web3 领域专业化——这是一个正在兴起且备受关注的细分方向。  
   - **状态：** **开放**

4. **[#1703 — md2video-audio](https://github.com/anthropics/skills/pull/1703)**  
   使用幻灯片生成工作流和逼真的合成语音，将 Markdown 文档转换为带旁白的 MP4 视频。  
   - **讨论亮点：** 将 Claude Code 从文档生成扩展到自动化多媒体制作，有望支持培训、文档和营销等工作流。  
   - **状态：** **开放**

5. **[#1245 — notion-spec-to-implementation and quantitative-resume-auditor](https://github.com/anthropics/skills/pull/1245)**  
   新增两个 Skills：一个将产品和技术规格转换为结构化的 Notion 实施计划，另一个提供定量简历评估。  
   - **讨论亮点：** 展现了社区对工作流自动化和结构化“从规格到执行”流水线的强烈兴趣，同时也推动生态拓展至职业应用领域。  
   - **状态：** **开放**

6. **[#525 — pyxel retro-game development](https://github.com/anthropics/skills/pull/525)**  
   提供使用 Pyxel 构建、调试和验证 Python 游戏的指导，包括无头执行、输入驱动测试和帧检查。  
   - **讨论亮点：** 强调基于证据的游戏验证，而非仅仅生成游戏代码，反映出社区对自主测试和检查工作流的需求。  
   - **状态：** **开放**

7. **[#1615 — scnet-hpc](https://github.com/anthropics/skills/pull/1615)**  
   通过具备配置感知能力的 SSH 和 Slurm 工作流，支持操作 SCNet HPC 集群，包括作业生成、资源发现、模块和加速器管理。  
   - **讨论亮点：** 面向专业化的企业/科研环境，将领域特定的运维知识转化为可重复执行的 Claude 工作流。  
   - **状态：** **开放**

8. **[#822 — AI Watch Tester (AWT)](https://github.com/anthropics/skills/pull/822)**  
   新增基于视觉和浏览器控制的端到端测试，使 Claude 能够在极少的手动配置下生成并执行测试。  
   - **讨论亮点：** 直接回应了社区对自动化 QA、浏览器自动化和测试生成的广泛需求。  
   - **状态：** **开放**

## 2. 社区需求趋势

- **Skill 和 agent 质量保证**  
  相关 issue 持续关注评估、基准测试、安全分析和运行验证。社区的需求并不只是增加 Skills，而是希望获得可靠的方法来测试 Skills 是否能够正确触发并产生有效结果。参见 issues [#556](https://github.com/anthropics/skills/issues/556)、[#1383](https://github.com/anthropics/skills/issues/1383) 和 [#1390](https://github.com/anthropics/skills/issues/1390)。

- **安全、信任与治理**  
  社区成员希望加强命名空间控制、来源追踪、审计轨迹、策略执行和威胁检测。核心担忧在于，用户可能会将社区内容误认为 Anthropic 官方功能。参见 issues [#492](https://github.com/anthropics/skills/issues/492) 和 [#412](https://github.com/anthropics/skills/issues/412)。

- **组织规模的共享与管理**  
  社区明确希望获得集中式库、内部共享、权限管理和治理能力，以取代手动交换 `.skill` 文件。参见 issue [#228](https://github.com/anthropics/skills/issues/228)。

- **记忆与持久化 agent 上下文**  
  相关提案涉及长时间运行的 agent、上下文窗口管理，以及记忆的紧凑符号化表示。参见 issue [#1329](https://github.com/anthropics/skills/issues/1329)。

- **测试与验证**  
  端到端浏览器测试、单元/组件测试、对抗性审查和交付验证是反复出现的主题。Issues [#1385](https://github.com/anthropics/skills/issues/1385) 和 [#822’s related proposal](https://github.com/anthropics/skills/pull/822) 体现了这一趋势。

- **文档制作与质量**  
  社区提交的内容聚焦于排版、DOCX/ODT 处理、Markdown 转视频工作流，以及更高质量的文档生成。相关提案包括 [#514](https://github.com/anthropics/skills/pull/514)、[#486](https://github.com/anthropics/skills/pull/486) 和 [#1703](https://github.com/anthropics/skills/pull/1703)。

## 3. 高潜力待合并 Skills

- **[#1298 — skill-creator fixes](https://github.com/anthropics/skills/pull/1298)：** 由于提升了构建和评估其他 Skills 所使用的工具，具有很高的杠杆效应。  
- **[#1742 — mcp-builder MCP 2.x compatibility](https://github.com/anthropics/skills/pull/1742)：** 对于在 MCP 生态不断演进的背景下保持兼容性至关重要。  
- **[#1703 — md2video-audio](https://github.com/anthropics/skills/pull/1703)：** 具备差异化优势的内容生产工作流，在教育和商业场景中拥有广泛潜力。  
- **[#1245 — Notion implementation planning](https://github.com/anthropics/skills/pull/1245)：** 将需求管理与具体的软件交付工作连接起来。  
- **[#525 — Pyxel](https://github.com/anthropics/skills/pull/525)：** 将领域指导与自动执行和验证相结合。  
- **[#1615 — SCNet HPC](https://github.com/anthropics/skills/pull/1615)：** 对于操作专业基础设施的科研和企业用户具有较高价值。  
- **[#822 — AWT](https://github.com/anthropics/skills/pull/822)：** 直接针对一个主要痛点：自主应用测试。  
- **[#1771 — ProofCore contract auditor](https://github.com/anthropics/skills/pull/1771)：** 面向 Web3 安全和可审计智能合约分析的高价值专业化方案。

## 4. Skills 生态洞察

社区最集中的需求是**可靠、安全且可验证的工作流自动化，尤其是能够操作外部系统、测试自身输出，并融入组织开发与治理流程的 Skills**。

---

---

# Claude Code 社区摘要 — 2026-10-03

## 1. 今日重点

Claude Code 发布 **v2.1.288**，新增了用于获取全屏选区的 mod API，并为未安装 GitHub CLI 的云端会话加入了内置 `gh api` 命令。社区关注点集中在**上下文压缩行为、孤立的后台进程、会话管理缺口以及云端消息传递**，与此同时，Windows 用户还报告了多项桌面端可靠性和文件系统集成问题。

## 2. 版本发布

### [v2.1.288](https://github.com/anthropics/claude-code/releases/tag/v2.1.288)

- 为 mod 新增了 `$.ui.selection()`。
  - 返回全屏模式下最近选中的文本。
  - 如果选区位于 transcript 行中，还会同时提供该行。
- 为未包含 GitHub CLI 的云端会话新增了内置 `gh api` 命令。
- 修复了内置发送控件中的控制字符问题。

**重要性：** mod 作者可以围绕 transcript 选区构建更丰富的类编辑器交互，而云端会话无需依赖预装的 CLI 二进制文件即可与 GitHub API 交互。

## 3. 热门问题

### 1. [MCP servers are not properly terminated on exit, leaving orphaned processes](https://github.com/anthropics/claude-code/issues/1935)

**类别：** MCP / 进程清理  
**社区反应：** 46 条评论，19 个 👍

这是一个长期存在的 macOS 问题：MCP server 进程可能在 Claude Code 退出后继续运行。对于同时运行多个 agent 或 server 的开发者而言，这个问题尤其重要，因为孤立进程可能会占用资源、端口或凭据。

### 2. [Fable 5 safeguard false-positives on the greeting “Hi”](https://github.com/anthropics/claude-code/issues/87640)

**类别：** 模型安全防护  
**社区反应：** 29 条评论，21 个 👍

用户报告称，仅一个单词的问候语也可能触发 `[reasoning_extraction]` 安全防护错误。该问题凸显了宽泛分类器规则带来的可用性风险，尤其是合法的简短提示被错误地视为提取隐藏推理过程时。

### 3. [Silent context degradation in 1M-context sessions](https://github.com/anthropics/claude-code/issues/42542)

**类别：** 上下文管理  
**社区反应：** 29 条评论，11 个 👍

该报告描述了多种可能在缺乏充分通知的情况下清除工具结果的机制，包括 microcompaction、cached microcompaction 和 session-memory compaction。对于长时间运行的编码会话而言，上下文在未被告知的情况下丢失，可能导致错误假设、重复工作或细微回归。

### 4. [Verification emails are suppressed, with no support-bot escalation path](https://github.com/anthropics/claude-code/issues/79808)

**类别：** 身份验证  
**社区反应：** 24 条评论，7 个 👍

受验证邮件未收到问题影响的用户报告称，他们无法登录，也无法将问题升级到自动化支持流程之外。尽管这主要属于运营层面的问题，但其影响范围较大，直接关系到账户访问权限。

### 5. [Session archiving is effectively one-way](https://github.com/anthropics/claude-code/issues/67835)

**类别：** 会话管理 / Desktop  
**社区反应：** 11 条评论，7 个 👍

Desktop 应用支持归档会话，据称却没有相应的取消归档视图或 `unarchive_session` 工具。用户担心，归档后的会话实际上会变成“孤立会话”，这对自动化工作流和会话管理 agent 尤其不利。

### 6. [Model picker skips `opusplan` without showing an Opus Plan Mode row](https://github.com/anthropics/claude-code/issues/89690)

**类别：** 模型选择器  
**社区反应：** 10 条评论

包含 `opusplan` 行的模型配置可能会被视为已被内置模型阵容覆盖，但该阵容在普通会话中并不会显示对应的行。结果是，用户虽然配置了某个模型或模式，却无法通过 `/model` 访问它。

### 7. [Cloud `SendMessage` reports one-way behavior despite remote reply support](https://github.com/anthropics/claude-code/issues/98897)

**类别：** 云端会话 / 消息传递  
**社区反应：** 9 条评论

据报告，当本地 Desktop 会话向云端会话发送消息时，该工具会告知模型该路由是单向的。然而，云端会话实际上可能仍能通过远程消息回复，这导致工具提供的说明与实际行为不一致。

### 8. [VS Code session list supports archive/unarchive but not deletion](https://github.com/anthropics/claude-code/issues/93835)

**类别：** VS Code / 会话管理  
**社区反应：** 7 条评论，14 个 👍

VS Code 扩展没有提供永久删除会话的可见方式。用户通常希望明确区分临时归档和破坏性删除，尤其是在管理敏感或不再需要的对话历史时。

### 9. [Idle compaction in v2.1.286 discards working context without an opt-out](https://github.com/anthropics/claude-code/issues/98747)

**类别：** 上下文管理 / 回归  
**社区反应：** 4 条评论，3 个 👍

一份新报告称，处于空闲状态的会话会在 prompt cache 过期前自动执行压缩，但该操作会被记录为“manual”。长时间运行的会话可能因此丢失重要的工作背景，用户也要求在该行为发生前提供警告或配置控制选项。

### 10. [Windows desktop child processes terminate simultaneously and the UI hangs](https://github.com/anthropics/claude-code/issues/99056)

**类别：** Windows Desktop / 可靠性  
**社区反应：** 新提交，暂无反应

该报告描述了所有子进程同时以退出码 1 终止、界面卡死的问题。尝试多次重新安装后问题仍然存在，因此可能成为基于 Windows 的开发工作流中的重大阻碍。

## 4. 关键 PR 进展

在本次报告窗口内，只有两个 pull request 有更新，因此没有 10 个 PR 可供重点介绍。

### [PR #97293 — Mod API declarations for process and filesystem metadata](https://github.com/anthropics/claude-code/pull/97293)

**状态：** Open

该 PR 正在为未来发布的 npm CLI 将提供的字段准备 TypeScript 声明：

- `isStdoutTruncated`
- `$.process.run` 结果中的 `isStderrTruncated`
- `$.fs.list` 条目中的 `mtimeMs`

该 PR 特意设置了门槛，确保这些声明不会暗示当前已安装的 CLI 已经返回这些字段。这表明项目正在持续推进，旨在为 mod 暴露更丰富的进程诊断和文件系统元数据。

### [PR #16632 — Replace ralph-loop initialization shell block with a functional Bash tool call](https://github.com/anthropics/claude-code/pull/16632)

**状态：** Closed

该 PR 旨在解决 ralph-loop 初始化被表示为 Markdown 格式代码块时引发的 shell 审批问题。将其转换为可执行的 Bash 工具调用，是为了让引擎的安全与审批系统能够识别并处理该命令，而不是将其视为仅用于展示或属于旧版内容。

## 5. 功能请求趋势

### 会话生命周期与可移植性

多个请求都指向更完善的会话管理能力：

- 通过编程方式以及在 Desktop 中取消归档会话
- 在 VS Code 中永久删除会话
- 更可靠地保存和查看长时间运行的会话
- 改善会话在个人账户与组织账户之间迁移时的行为

### 跨会话与云端协作

社区兴趣正逐渐转向更丰富的 agent 编排：

- 云端到云端的 `SendMessage`
- 云端会话更可靠的回复能力
- 可配置的跨会话发送限制
- Claude Code 与 Claude Design agent 之间的协作

### 上下文与模型控制透明度

技术上最重要的重复需求，是对上下文管理提供更好的控制：

- 在 microcompaction 或 idle compaction 之前显示明确警告
- 为自动缩减上下文提供关闭选项或配置控制
- 使用更清晰的日志说明哪些上下文已被丢弃
- 为 `opusplan` 等专用模式提供更可预测的模型选择器行为

### 平台与集成可靠性

Windows 特有的问题涉及桌面端进程管理、注册表虚拟化、后台清理以及界面行为。这表明平台一致性仍然是主要关注领域，尤其是对于通过 Desktop 或 VS Code 使用 Claude Code 的用户而言。

### Git 与提交元数据

[`Assisted-by` commit trailer proposal](https://github.com/anthropics/claude-code/issues/36105) 反映了社区对 AI 辅助开发中更清晰署名规范的强烈需求，目前已有 43 个 👍，表明社区关注度很高。

## 6. 开发者痛点

1. **上下文可能在缺乏充分可见性的情况下消失。**  
   用户需要知道何时发生压缩、哪些内容被移除，以及当前的工作状态是否仍然完整。

2. **后台进程无法得到可靠清理。**  
   MCP server 以及 Windows/Git Bash 子进程可能会成为孤立进程，从而增加本地开发和自动化的复杂性。

3. **云端与本地行为并未完全一致。**  
   消息传递、GitHub 工具、会话路由和模型选择，可能因 CLI、Desktop、VS Code、Remote Control 和云端会话而异。

4. **会话管理缺乏完整的生命周期。**  
   归档、恢复、删除、可见性和组织能力在不同客户端之间表现不均衡。

5. **安全分类器会产生误报。**  
   模型安全防护和权限分类器都可能阻止正常操作，例如发送问候语、测试本地应用或执行 `git push`。

6. **Windows 支持仍然存在可靠性缺口。**  
   进程终止、注册表写入、孤立的 `find.exe` 进程以及 Desktop 卡死等问题反复出现。

7. **生态系统需要更清晰的集成契约。**  
   mod 和第三方提供商依赖稳定的 API 与元数据，因此进程/文件系统声明等受门槛限制的 PR，对扩展作者而言十分重要。

</details>

<details>
<summary><strong>OpenAI Codex</strong> — <a href="https://github.com/openai/codex">openai/codex</a></summary>

# OpenAI Codex 社区摘要 — 2026-10-03

## 1. 今日要点

OpenAI 连续发布了七版 `0.162.0` Rust alpha 构建，表明团队正在为下一版 Codex CLI 积极迭代；现有发布元数据未包含各版本的具体变更摘要。社区讨论主要集中在 Windows 桌面端、VS Code、浏览器自动化、排队消息和会话持久化等可靠性问题；与此同时，多个已关闭的 pull request 改进了重试行为、MCP 生命周期管理、TUI 控件和终端兼容性。

## 2. 发布

- [`rust-v0.162.0-alpha.1` 至 `rust-v0.162.0-alpha.7`](https://github.com/openai/codex/releases) — 过去 24 小时内发布或更新了七个 alpha 版本。数据集未提供详细更新日志，因此最稳妥的判断是：基于 Rust 的 Codex 客户端正处于快速预发布周期。评估升级的团队应将这些版本视为 alpha 构建，并在部署前审查各个发布产物和提交历史。

## 3. 热门问题

1. **[#47345 — Linux sandbox fails after ChatGPT update](https://github.com/openai/codex/issues/47345)**  
   应用更新后，Ubuntu 用户遇到与 `mountinfo` 非绝对路径有关的 Linux 沙箱故障。经过大量讨论后，该问题已关闭，共收到 49 条评论和 37 次互动，使其成为当日问题列表中最受关注的信号之一。它凸显了沙箱路径校验以及更新后回归测试的重要性。

2. **[#49532 — Restore branch selection in the Codex app](https://github.com/openai/codex/issues/49532)**  
   用户希望 Codex 应用在开始工作时重新提供分支选择功能。该问题累计收到 26 条评论和 57 个 👍，表明社区需求强烈；对于需要明确控制当前 Git 分支的用户而言，这也意味着重要的功能回归。

3. **[#49488 — Windows Work computer tasks lack browser and desktop tools](https://github.com/openai/codex/issues/49488)**  
   该报告描述了持续性的 MCP 启动失败，以及随后出现的路径错误，导致计算机任务无法访问浏览器和桌面能力。之所以重要，是因为它影响的是从智能体到工具执行的核心链路，而非外围功能。17 条评论和 6 次互动表明，Windows computer-use 的可靠性正受到越来越广泛关注。

4. **[#49396 — Unsupported `gpt-6.1-sol` error lacks eligibility details](https://github.com/openai/codex/issues/49396)**  
   使用 ChatGPT 身份验证的 CLI 用户在选择 `gpt-6.1-sol` 时只收到“不支持”的提示，却无法了解账户资格或权限范围。该问题暴露了一个重要的产品缺口：模型可用性错误应区分模型无效、套餐权益缺失、灰度发布状态和客户端模型目录过期等情况。

5. **[#48670 — Windows built-in browser permissions cannot be verified](https://github.com/openai/codex/issues/48670)**  
   浏览器可能已成功打开页面，但 Browser Use 随后失败，原因是已保存的权限或安全检查无法验证。这会造成一种令人困惑的状态：界面看起来一切正常，智能体却无法与页面交互。9 条评论和 1 次互动反映出社区对浏览器自动化可靠性及错误清晰度的担忧。

6. **[#47577 — `@codex review` silently ignores fork pull requests](https://github.com/openai/codex/issues/47577)**  
   据报告，GitHub 代码审查对同仓库分支有效，但对来自 fork 的 PR 无效。8 条评论和 26 个 👍 表明这是一项值得关注的重大功能回归，尤其是在外部贡献较为常见的开源工作流中。静默失败尤其成问题，因为用户可能误以为审查仍在进行。

7. **[#30820 — Windows app eagerly runs review-summary Git snapshots](https://github.com/openai/codex/issues/30820)**  
   恢复工作区可能立即触发 Git 快照任务，导致 CPU、I/O 和内存使用量激增。该问题自 7 月以来一直处于活跃状态，代表着反复出现的桌面端性能问题。这表明后台审查摘要生成需要更强的延迟执行、节流和取消控制。

8. **[#50071 — Linux app crashes or becomes unresponsive with `ResizeObserver` errors](https://github.com/openai/codex/issues/50071)**  
   用户报告应用在出现数千条 `ResizeObserver` 错误时反复崩溃或严重无响应。尽管该问题比列表中的许多条目更新，但在运维层面十分严重，因为它影响当前应用版本，即使只运行单个任务也可能导致界面无法使用。该问题已有 4 条评论，关注度虽尚在形成，但已值得注意。

9. **[#49573 — Sites publishing fails through browser-proxy port 8889](https://github.com/openai/codex/issues/49573)**  
   更新现有 Site 时，Git 同步阶段因无法连接浏览器代理而导致发布失败。问题集中还包含一份相关报告。这表明 Sites 发布和源文件访问可能存在共同的连接性或编排缺陷。

10. **[#49081 — Queued CLI messages are not sent](https://github.com/openai/codex/issues/49081)**  
    用户报告 CLI 中排队的消息未被发送。该问题对智能体工作流尤其重要，因为用户可能以为提示词已经被接受，实际上却滞留未发。它也与 VS Code 和 Windows 应用报告中出现的更广泛的队列管理主题相互关联。

## 4. 关键 PR 进展

1. **[#50418 — Honor `Retry-After` headers in failed Responses events](https://github.com/openai/codex/pull/50418)**  
   流式传输的 `response.failed` 事件可以在 `response.error.headers` 中包含服务器提供的重试时间。此变更是为了解析嵌套的 `Retry-After` 值，并避免使用相互冲突的本地延迟，从而提升限流和临时 API 故障场景下的退避正确性。

2. **[#50416 — Clarify Git worktree choices](https://github.com/openai/codex/pull/50416)**  
   `/new` 和 `/fork` 选择器现在会区分“使用当前 Git worktree”和“创建新 worktree”，并说明后者会创建一个独立的检出版本。这有助于减少意外隔离，并改善基于 Git 的任务上手体验。

3. **[#50406 — Restore `0.159.3` fixes in the `0.159` alpha lineage](https://github.com/openai/codex/pull/50406)**  
   该 PR 将 `0.159.3` 中的修复和模型目录更新向后移植，同时保留 alpha hotfix 分支中的 PowerShell 兼容性修复。对于受旧版本发布线限制的客户端而言，这是一项实用的稳定性改进。

4. **[#50402 — Consolidate command output into `aggregated_output`](https://github.com/openai/codex/pull/50402)**  
   命令执行事件正在简化：移除独立的 `stdout`、`stderr` 和 `formatted_output` 字段，统一改用 `aggregated_output`。此次重构降低了消费者处理事件结构的复杂度，但相关工具可能也需要同步更新。

5. **[#31471 — Extract Apps cache logic into `ConnectorRuntimeManager`](https://github.com/openai/codex/pull/31471)**  
   该 PR 引入运行时范围的连接器和工具缓存，缓存上下文包括账户、用户、工作区模式和 Codex home。随着输入发生变化，过期上下文会被丢弃，从而有望提升多账户和工作区感知型集成的正确性。

6. **[#50380 — Fix thread unloading after MCP startup disconnect](https://github.com/openai/codex/pull/50380)**  
   当 MCP 启动过程长于发起请求的连接，且没有启动任何监听器时，线程可能一直保持加载状态。该修复确保在线程连接被清理后，线程监听器仍能启动，从而解决资源和生命周期泄漏问题。

7. **[#50396 — Honor pager bindings for transcript page keys](https://github.com/openai/codex/pull/50396)**  
   `PageUp` 和 `PageDown` 现在会遵循自定义 pager 绑定，而不再始终强制执行整页移动。对于通过自定义快捷键配置终端和记录导航的用户，这提升了行为一致性。

8. **[#50389 — Honor configured keybindings before transcript navigation](https://github.com/openai/codex/pull/50389)**  
   显式配置的编辑器快捷键现在优先于记录导航，避免 `Ctrl+Space` 等绑定被记录界面占用。这直接解决了一个常见的 TUI 输入冲突，即编辑、引导和导航之间的快捷键冲突。

9. **[#50375 — Use printable ASCII terminal titles under GNU Screen](https://github.com/openai/codex/pull/50375)**  
   GNU Screen 可能无法正确处理 Unicode OSC 终端标题，在字节边界处截断标题并输出控制字符。此补丁会在检测到 Screen 时将标题转换为可打印的 ASCII 字符，从而防止终端显示异常。

10. **[#50359 — Render ANSI styles in TUI hook system messages](https://github.com/openai/codex/pull/50359)**  
    Hook 系统消息现在会被解析为带样式的文本片段，以便颜色和文本格式能够跨行正确显示。这将提升 hook 输出的可读性，也使其视觉效果更符合终端自动化工具的预期。

## 5. 热门讨论

### 想法

- **[#49977 — Dynamic model and reasoning orchestration in Codex/Work](https://github.com/openai/codex/discussions/49977)**  
  该提案主张以运行时编排取代静态的模型和推理选择，使系统能够随着任务复杂度的变化动态调整。这可以让模型选择、推理投入和成本更好地适应长时间运行任务不断变化的需求。

- **[#41833 — Stop cutting controls on v2 subagents](https://github.com/openai/codex/discussions/41833)**  
  用户反对对低层 app-server 路径施加限制，因为这些限制削弱了 v2 subagents 可用的控制能力。这场讨论反映出用户希望获得更强的可组合性，并要求将能力限制作为 UX 指导明确呈现，而不是通过协议静默实施限制。

### 问答

- **[#9277 — Codex review asks users to connect GitHub](https://github.com/openai/codex/discussions/9277)**  
  用户正在排查 `@codex review` 提示其连接 Codex 账户或 GitHub 集成的问题。对于基于 fork 的工作流，这个问题尤其重要，因为身份验证和仓库授权可能阻止审查启动。

- **[#50235 — Dot chat stays loading after showing read receipts](https://github.com/openai/codex/discussions/50235)**  
  Dot 对话在显示送达和已读状态后始终没有回复。报告表明，即使云端计算机仍可访问，消息传输和响应生成环节也可能已经出现不同步。

### 展示与分享

- **[#50222 — QuotaCrew for Codex](https://github.com/openai/codex/discussions/50222)**  
  QuotaCrew 是一款 Windows 账户管理工具，用于跟踪使用限额、切换账户以及继续中断的对话。它体现了社区对配额管理和跨会话连续性相关运维工具日益增长的需求。

## 6. 功能请求趋势

- **更明确的 Git 工作流控制：** 恢复分支选择、明确 worktree 行为，并提升当前检出版本状态的透明度。
- **更可靠的浏览器和 computer use：** Windows 浏览器权限、MCP 启动、浏览器代理连接和桌面工具可用性需要更强的诊断能力和更可靠的生命周期管理。
- **更好的队列和消息语义：** 用户希望 CLI、VS Code 和桌面端中的排队提示词能够获得明确的已接收反馈，并支持取消、恢复且保证最终发送。
- **更清晰的模型和权益说明：** Codex 应解释模型可用性、灰度发布资格、订阅访问权限、模型目录过期和版本要求，而不是只返回通用的模型不受支持错误。
- **TUI 可组合性和终端兼容性：** 可配置快捷键、pager 绑定、鼠标捕获选择加入、ANSI 渲染、GNU Screen 兼容性和终端标题安全处理是反复出现的优先事项。
- **自动化和生命周期 API：** 社区希望获得可脚本化的云环境发现、任务调度、监控、取消以及 PR 和结果交接能力。
- **后台任务性能：** 桌面应用不应在工作区恢复时立即执行 Git 快照、过多尺寸监听循环、僵尸子进程和高成本的审查摘要任务。
- **长时间运行智能体的连续性：** 上下文压缩后的恢复、异步问题生命周期管理、远程任务可见性以及账户和会话延续，仍是自主工作流的重要组成部分。

## 7. 开发者痛点

最主要的不满是**状态不确定**。用户报告提示词看似已排队却未发送、审查静默跳过 fork PR、对话显示已读回执后仍持续加载，以及 subagent 的控制能力受到意外限制。这些问题很难排查，因为界面可能显示任务正在推进，却无法确认执行是否真正发生。

另一个主要主题是**跨平台体验碎片化**，Windows 尤其突出。问题涵盖 VS Code 队列锁定错误、app-server 运行时过期、浏览器代理故障、桌面渲染进程重载、状态损坏、资源使用量激增和 computer-use 授权。Windows 用户似乎面临范围最广、总量最大的可靠性问题集合。

开发者还报告了**脆弱的自动化边界**：MCP 启动可能比连接本身持续更久，远程控制重连可能陷入循环，沙箱行为可能在更新后发生变化，Sites 也可能在 Git 同步期间发布失败。反复出现的需求是改进生命周期管理、明确报告状态并提供可操作的错误信息。

最后，模型和终端工作流需要更强的可预测性。模型访问错误缺少充分解释，终端快捷键可能意外被拦截，鼠标捕获引发了争议，一些终端环境还存在格式或标题兼容性问题。总体而言，社区希望 Codex 具备更强的可组合性和可观察性，并在修改默认行为时更加谨慎。

---

</details>

<details>
<summary><strong>Gemini CLI</strong> — <a href="https://github.com/google-gemini/gemini-cli">google-gemini/gemini-cli</a></summary>

# Gemini CLI 社区摘要 — 2026-10-03

## 今日重点

最新的 nightly 版本侧重于提升会话持久性与可靠性，包括仅追加的聊天记录更新、有限历史窗口、原子状态持久化，以及从损坏状态中恢复。整体开发趋势仍围绕智能体可靠性展开：子智能体终止状态上报、浏览器智能体稳定性、非交互式技能激活、上下文管理，以及防止工具/API 调用导致卡死等问题，正受到广泛关注。

## 发布版本

### [v0.64.0-nightly.20261002.gc9096a847](https://github.com/google-gemini/gemini-cli/releases/tag/v0.64.0-nightly.20261002.gc9096a847)

- **聊天记录改进：** `ChatRecordingService` 现在采用仅追加的增量补丁机制，并设置了有限的历史窗口。
- **状态持久化：** CLI 状态将以原子方式持久化，并在检测到损坏时从备份中恢复。
- **主要影响：** 这些改动旨在减少会话历史丢失，并改善写入被中断或数据损坏后的恢复能力。

## 热门问题

1. **[#22323 — 子智能体达到 MAX_TURNS 后仍可能报告成功](https://github.com/google-gemini/gemini-cli/issues/22323)**  
   `codebase_investigator` 子智能体即使在完成分析前已达到轮次上限，也可能返回 `status: "success"`，并将终止原因标记为 `"GOAL"`。该问题已有 **13 条评论**和 **2 个赞**，是备受关注的可靠性问题之一。不正确的终止语义可能误导用户和评估流程。

2. **[#21409 — 通用智能体无限期卡死](https://github.com/google-gemini/gemini-cli/issues/21409)**  
   用户报告称，即使只是创建文件夹等简单操作，交给通用智能体处理也可能卡死，有时会持续一小时甚至更久。该问题获得 **8 个赞**和 **8 条评论**，属于影响较大的工作流故障。避免委派给子智能体似乎可以绕过此问题。

3. **[#21983 — 浏览器子智能体在 Wayland 下失败](https://github.com/google-gemini/gemini-cli/issues/21983)**  
   浏览器子智能体在 Wayland 环境中报告失败。尽管该问题只有 **4 条评论**，但浏览器自动化是智能体的关键能力，而 Wayland 在 Linux 桌面环境中正日益普及。

4. **[#22267 — Browser Agent 忽略 `settings.json` 覆盖配置](https://github.com/google-gemini/gemini-cli/issues/22267)**  
   Browser Agent 似乎会忽略全局和项目级设置，例如 `maxTurns`，尽管它在初始化时已加载这些配置。这会导致配置行为与实际执行不一致，使智能体限制难以落实。

5. **[#24246 — Gemini CLI 在工具数量过多时出现 400 错误](https://github.com/google-gemini/gemini-cli/issues/24246)**  
   用户报告称，启用非常大的工具集时会出现 400 错误；问题标题提到超过 128 个工具，而描述中则提到可用工具超过 400 个。该问题呼吁改进自动范围控制或工具优先级机制，反映出人们对工具数量和上下文限制日益增长的关注。

6. **[#22672 — 智能体可能执行破坏性的 Git 操作](https://github.com/google-gemini/gemini-cli/issues/22672)**  
   讨论重点关注了在存在更安全替代方案时，智能体仍可能执行 `git reset` 或强制操作等潜在危险命令，以及对数据库和其他资源进行破坏性修改。该报告已有 **3 条评论**和 **1 个赞**，表明社区希望加强防护机制，并采用更安全的智能体默认行为。

7. **[#21763 — `/bug` 报告未包含子智能体上下文](https://github.com/google-gemini/gemini-cli/issues/21763)**  
   使用 `/bug` 生成的错误报告目前主要关注主会话，可能不会包含失败子智能体的状态或执行轨迹。这限制了智能体故障的诊断能力，目前社区已有 **2 条评论**。

8. **[#23571 — 模型在随机位置创建临时脚本](https://github.com/google-gemini/gemini-cli/issues/23571)**  
   当 shell 执行受到限制时，模型可能会通过在整个仓库中生成多个编辑脚本来进行补偿。这增加了清理工作负担，也更难保持工作树整洁。该问题已有 **3 条评论**。

9. **[#21968 — Gemini 不会自动使用技能和子智能体](https://github.com/google-gemini/gemini-cli/issues/21968)**  
   报告指出，除非用户明确下达指令，否则 Gemini 经常不会激活相关自定义技能或委派任务给子智能体。该问题已有 **7 条评论**，反映出一个更广泛的可用性缺口：智能体可能具备执行专业工作流的能力，但无法可靠地选择并启用这些能力。

10. **[#20079 — 无法识别符号链接形式的智能体定义](https://github.com/google-gemini/gemini-cli/issues/20079)**  
    当 `~/.gemini/agents/` 中的 `.md` 文件是符号链接时，系统无法识别这些智能体文件。符号链接支持对于可复用配置、单体仓库和团队统一管理的智能体定义都很重要。

## 关键 PR 进展

1. **[#29616 — 使 OAuth 回调 issuer 验证符合 RFC 9207](https://github.com/google-gemini/gemini-cli/pull/29616)**  
   按照 RFC 9207 和 MCP 授权要求更新 OAuth 回调 `iss` 验证。这是一项高优先级的安全性和标准合规性改动。

2. **[#29617 — 避免过早递归展开 `@directory` 引用](https://github.com/google-gemini/gemini-cli/pull/29617)**  
   目录引用将解析为对应的工作区路径，而不会立即展开所有后代目录。此改动有助于减少不必要的上下文消耗，并提升大型仓库中的响应速度。

3. **[#29582 — 优化忽略规则过滤并剪除被忽略的子树](https://github.com/google-gemini/gemini-cli/pull/29582)**  
   新增目录级记忆化、通配目录展开，以及符号链接/真实路径缓存。目标是消除大型仓库进行文件发现时可能出现的数秒级阻塞延迟。

4. **[#29584 — 防止快速退出时删除恢复会话的历史记录](https://github.com/google-gemini/gemini-cli/pull/29584)**  
   修复一种数据丢失场景：在恢复会话后立即退出，例如按下 `Ctrl+C` 或使用 `/exit`，可能导致恢复的对话历史被删除。这是一项尤其重要的持久性修复。

5. **[#29608 — 为 Web 工具添加 30 秒超时](https://github.com/google-gemini/gemini-cli/pull/29608)**  
   `GoogleSearch` 和 `WebFetch` 现在会在 30 秒后终止底层模型请求。此改动解决了智能体循环可能永久停留在 `Thinking...` 状态、持续 30 分钟甚至更久的问题。

6. **[#29457 — 使用 glob 匹配替代显式文件的模糊匹配](https://github.com/google-gemini/gemini-cli/pull/29457)**  
   修复 `read-many-files` 中导致上下文膨胀的缺陷：图片、PDF 和音频等二进制资源可能被错误地视为显式请求的文件。此改动可减少大型文件被意外纳入上下文的情况。

7. **[#29612 — 确保终端用户轮次有效](https://github.com/google-gemini/gemini-cli/pull/29612)**  
   规范化请求内容，使发送到 `generateContentStream` 的历史记录始终以有效且非空的用户轮次结束。这旨在防止执行 `/rewind` 或中止流式响应等操作后出现协议失败。

8. **[#29611 — 为带点号的 Gemini 3 模型支持多模态函数响应](https://github.com/google-gemini/gemini-cli/pull/29611)**  
   修复模型别名处理以及 `gemini-3.8-flash` 等版本的多模态响应支持，避免生成无效的同级部分及相关 HTTP 400 错误。

9. **[#29546 — 在非交互模式下激活技能](https://github.com/google-gemini/gemini-cli/pull/29546)**  
   在非交互式斜杠命令路径中注册 `SkillCommandLoader`，使 `/skill-name` 命令能够在交互式 UI 之外运行。该 PR 还会处理工具操作结果，而不会将其视为致命错误。

10. **[#29606 — 改进自定义请求头解析](https://github.com/google-gemini/gemini-cli/pull/29606)**  
    仅在有效的 RFC 9110 token 之前拆分 `GEMINI_CLI_CUSTOM_HEADERS`。这样可以保留 JSON 元数据和其他合法请求头值中的逗号，避免将其误解为新请求头的分隔符。

## 功能请求趋势

- **更可靠的子智能体：** 最受关注的方向是改进子智能体恢复能力、终止状态、配置处理、浏览器兼容性和可观测性。
- **更好的自动工具和技能选择：** 用户希望 Gemini 无需反复手动指示，就能自动选择相关技能、子智能体和工具。
- **上下文和 token 效率：** 相关请求包括支持 AST 的搜索和文件读取、精准文件提取、自动工具范围控制、持久化任务跟踪，以及避免过早展开目录。
- **更安全的执行环境：** 社区提案强调采用零依赖的操作系统沙箱、执行后的意图路由，以及更强的防护机制，以防止破坏性的 Git 或资源管理命令。
- **更好的智能体可观测性：** 通过 `/chat share` 暴露子智能体执行轨迹、丰富 `/bug` 报告，以及提高内部评估可靠性，都是反复出现的优先事项。
- **持久化且感知工作区的状态：** 社区的兴趣涵盖基于文件的任务跟踪、工作区专属策略、共享记忆，以及并行子智能体协作。
- **能力更强的浏览器自动化：** Browser Agent 需要更好地遵循设置、支持 Wayland、实现会话接管和锁恢复。
- **非交互模式体验一致：** 技能、斜杠命令和智能体功能应在 CI 与脚本化工作流中保持一致可用，而不应仅限于交互式终端。

## 开发者痛点

- **智能体卡死和错误完成状态：** Web 调用、子智能体和终端操作可能卡死，或在达到内部限制后仍报告成功。
- **配置已加载但未生效：** Browser Agent 和其他组件可能忽略 `settings.json` 中的覆盖配置，例如 `maxTurns`。
- **上下文膨胀：** 目录引用、二进制文件、大型工具集和广泛的文件发现操作可能消耗大量上下文，甚至触发 API 错误。
- **破坏性或混乱的副作用：** 模型可能执行不安全的 Git 命令，或在仓库中的任意位置创建临时脚本。
- **子智能体可观测性有限：** 当前调试和共享流程无法稳定暴露子智能体的上下文或执行轨迹。
- **发现和兼容性问题：** 符号链接形式的智能体文件、Wayland 环境、自定义请求头和多模态 Gemini 模型名称，都暴露出了互操作性问题。
- **评估可靠性：** 内部评估可能不一致或产生误导，包括要求让引导式评估始终通过，以及改进产物验证。
- **会话持久性：** 最近发现，恢复会话后快速退出可能导致对话历史永久丢失，因此原子持久化和备份恢复尤为重要。

</details>

<details>
<summary><strong>GitHub Copilot CLI</strong> — <a href="https://github.com/github/copilot-cli">github/copilot-cli</a></summary>

# GitHub Copilot CLI 社区摘要 — 2026-10-03

## 今日要点

过去 24 小时内，Copilot CLI 发布了三个补丁版本，重点改进 Windows 沙箱可靠性、后台代理引导、MCP 韧性、OAuth 重新认证以及会话生命周期行为。社区关注点仍集中在 MCP 配置与认证、代理/技能行为、自定义模型兼容性和会话可靠性；待处理列表中有 **33 个最近更新的 issue**，其中包括若干新报告的回归问题。

## 发布版本

### [v1.0.92-2](https://github.com/github/copilot-cli/releases/tag/v1.0.92-2)

- Windows 上的沙箱命令现在会在获授权的临时目录内创建临时文件，使需要将临时文件重命名为最终位置的工具能够正常运行。
- 提示模式会话现在会在 Stop-hook 续接完成后发出一次 `sessionEnd` hook，修复生命周期事件重复或过早触发的问题。

### [v1.0.92-1](https://github.com/github/copilot-cli/releases/tag/v1.0.92-1)

- 远程 MCP 服务器现在会在空闲的 Streamable HTTP 会话过期后重新连接。
- 发送给运行中的后台代理的消息，会在其下一次处理机会到来时引导当前执行轮次。
- 上下文滚动时，会在恢复上下文中保留最近的用户请求。
- 自动沙箱 CA 配置的输出现在会被隐藏。

### [v1.0.92-0](https://github.com/github/copilot-cli/releases/tag/v1.0.92-0)

- 当 MCP 工具定义未发生变化时，OAuth 重新认证后 MCP 工具仍可继续使用。

**社区要点：** 本轮发布主要是一次稳定性维护。对于面向开发者的工作流而言，MCP 长连接、OAuth、后台代理协调和上下文保留是最直接的能力升级。

## 热门 Issue

1. **[仅支持手动调用的项目技能无法访问 — #4438](https://github.com/github/copilot-cli/issues/4438)**  
   `disable-model-invocation: true` 似乎会导致技能完全不可用，尽管该技能仍会出现在 `copilot skill list` 中。用户明确请求该技能时，系统会返回 `Skill not found`，而不会手动调用它。该问题已获得 **11 条评论和 12 个 reaction**，是本次更新中最活跃的问题，也是受控代理工作流中一个重要的可用性隐患。

2. **[macOS 重启后，MCP writer 的过期绑定导致 CLI 无法使用 — #4998](https://github.com/github/copilot-cli/issues/4998)**  
   据报告，持久化的 `.mcp-writer.binding` 文件中包含过时的文件系统设备 ID，会在 macOS 更新或重启后导致新会话和恢复的会话都无法处理提示。该报告已有 **6 条评论和 5 个 reaction**，凸显了启动恢复过程中的重要故障。

3. **[Azure MCP 注册表验证因 BrokenPipe 失败 — #4851](https://github.com/github/copilot-cli/issues/4851)**  
   尽管此前配置一直稳定，Copilot CLI 的 Rust 运行时仍会在验证 Azure API Center MCP 注册表时失败。该报告已有 **5 条评论和 8 个 reaction**，反映出社区对 MCP 企业环境中回归问题的担忧。

4. **[v1.0.83 未加载工作区 `.mcp.json` — #4832](https://github.com/github/copilot-cli/issues/4832)**  
   工作区级别的 MCP 配置被完全忽略，且 `mcp list` 中没有显示 Workspace 组。尽管该问题目前**已关闭**，但仍值得注意，因为工作区范围的 MCP 配置是可复现项目工具链的核心。讨论中有 **4 条评论**。

5. **[DeepSeek BYOK 在自定义工具定义上失败 — #4840](https://github.com/github/copilot-cli/issues/4840)**  
   由于所选端点拒绝 `custom` 工具类型，BYOK 请求会因 JSON 反序列化错误而失败。该问题仍未解决，已有 **3 条评论和 1 个 reaction**，表明非 GitHub 模型提供商与自定义工具模式之间存在兼容性缺口。

6. **[远程响应后，移动端会话状态仍显示排队中 — #4569](https://github.com/github/copilot-cli/issues/4569)**  
   在远程控制的 CLI 会话已经收到提示并在本地响应后，GitHub Mobile 仍显示“Queued for Copilot”。该问题有 **2 条评论**，规模相对较小，但对于远程开发和会话同步而言具有实际意义。

7. **[持久化的 `allowed_directories` 无法抑制 shell 权限提示 — #4482](https://github.com/github/copilot-cli/issues/4482)**  
   据报告，在 `~/.copilot/permissions-config.json` 中配置的目录会被 shell 命令忽略；在会话期间使用 `/add-dir` 可以暂时绕过该问题。该报告已有 **2 条评论**，并会影响自动化流程，尤其是在长时间运行或无人值守的会话中。

8. **[路由模型失败时，会话可能切换到不兼容的模型 — #5042](https://github.com/github/copilot-cli/issues/5042)**  
   路由模型返回 400 错误后，会话可能切换到上下文窗口更小、无法加载累积静态提示的模型。这个新问题暴露了模型回退、上下文窗口假设、工具兼容性以及会话中途行为变更方面的风险。

9. **[MCP OAuth 回环回调被 Microsoft Entra ID 拒绝 — #5040](https://github.com/github/copilot-cli/issues/5040)**  
   受 Microsoft Entra ID 保护的远程 HTTP MCP 服务器无法完成认证，因为 Entra 拒绝了 CLI 的 `127.0.0.1` 回调。该问题刚提交，尚未分类处理，但对于集成远程 MCP 服务的企业用户尤其相关。

10. **[CLI 更新可能停止，但 `events.jsonl` 仍持续增长 — #5035](https://github.com/github/copilot-cli/issues/5035)**  
    即使事件日志持续增长，会话仍可能保持可交互状态，但代理更新不再出现。该问题刚提交，却提出了重要的可观测性和会话健康问题， particularly 影响依赖自主运行或长时间 CLI 会话的开发者。

## 关键 PR 进展

本次更新仅提供了一个最近更新的 pull request，因此无法从中选出十个重要 PR。

- **[更新 README 中的默认模型版本 — #5036](https://github.com/github/copilot-cli/pull/5036)**  
  这项仅涉及文档的变更更新了 README，使其反映当前 Copilot CLI 的默认模型。根据所提供的数据，该 PR 仍处于开放状态，且没有记录到评论或 reaction。

## 功能请求趋势

- **更精细的代理和技能控制：** [#4438](https://github.com/github/copilot-cli/issues/4438) 中的 `disable-model-invocation` 行为，以及 [#5033](https://github.com/github/copilot-cli/issues/5033) 中禁用“Task complete”摘要的请求，都表明用户希望更细粒度地控制代理调用、摘要和自动化行为。
- **更持久、更可预测的权限：** [#4482](https://github.com/github/copilot-cli/issues/4482) 突显了用户对目录权限配置可靠生效的需求。整体趋势是采用基于策略的控制方式，使其能够跨会话重启持续生效，并且每个工作流都不需要交互式 `/add-dir` 或确认操作。
- **更可靠的 MCP 生命周期管理：** 涉及过期绑定、工作区配置加载、重新加载行为、OAuth 回调和远程 HTTP 重连等问题，表明开发者希望 MCP 集成在启动、重新认证、配置变更和长时间空闲期间都能保持一致。
- **更好的 BYOK 和模型提供商兼容性：** [#4840](https://github.com/github/copilot-cli/issues/4840) 以及 [#5042](https://github.com/github/copilot-cli/issues/5042) 中的模型回退报告显示，越来越多用户希望在不牺牲工具、上下文管理和会话连续性的情况下使用第三方模型和路由模型。
- **改善长会话可用性：** [#5015](https://github.com/github/copilot-cli/issues/5015) 中提出了通过键盘访问历史记录，[#5041](https://github.com/github/copilot-cli/issues/5041) 中提出了在全新上下文中执行计划，[#5034](https://github.com/github/copilot-cli/issues/5034) 中则提出关闭嘈杂的 MCP 状态通知。
- **后台与自动驾驶可观测性：** 围绕更新停滞、启用自动驾驶后权限失败，以及 [#5035](https://github.com/github/copilot-cli/issues/5035)、[#5031](https://github.com/github/copilot-cli/issues/5031) 和 [#4628](https://github.com/github/copilot-cli/issues/4628) 中后台任务完成情况的问题，凸显了用户对可预测的后台代理执行的需求。
- **更灵活的代理扩展性：** [#5030](https://github.com/github/copilot-cli/issues/5030) 中的 ACP 回归问题表明，用户希望自定义代理能够在不同 CLI 执行模式下正常工作。

## 开发者痛点

- **MCP 仍是集成摩擦的主要来源：** 开发者遇到了过期绑定、工作区配置缺失、OAuth 回调不兼容、协议协商失败、HTTP 会话过期以及重新加载行为不一致等问题。
- **配置并不总是一致生效：** 工作区 MCP 文件、持久化权限目录，以及活动会话期间修改的配置，其实际行为可能与文档说明或用户预期不同。
- **后台代理行为难以预测：** 长时间运行的任务可能丢失更新、继承错误的权限设置、触发误导性的完成摘要，或在子代理完成后停止父进程。
- **自定义模型支持较为脆弱：** BYOK 端点可能拒绝工具模式，而路由模型回退则可能在会话中途悄然改变当前模型和上下文假设。
- **会话和终端体验仍需打磨：** 剪贴板警告、终端布局问题、历史记录无法访问、移动端状态过期以及嘈杂的 MCP 通知，都会增加日常 CLI 使用的摩擦。
- **生成的提交和产物的正确性需要关注：** [#5032](https://github.com/github/copilot-cli/issues/5032) 报告了格式错误的共同作者尾注，而 [#5037](https://github.com/github/copilot-cli/issues/5037) 报告了在回退对话后粘贴的图片会丢失。

---

Rules:
- Output ONLY the translation. No preamble, no explanation, no markdown fences around the whole output.
- Preserve the Markdown structure exactly: headings, tables (including column alignment rows), lists, blockquotes, bold/italic, horizontal rules, emoji.
- Keep URLs, link targets, code spans, code blocks, numbers and dates verbatim.
- Keep project names, repository slugs, usernames, version tags, file paths and API/config identifiers in their original form — do not translate them.
- Issue/PR references like #12345 and their link text stay as-is.
- Use natural technical Chinese, the register of a Chinese developer newsletter — not a literal word-for-word rendering.

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

# Pi 社区摘要 — 2026-10-03

## 今日要点

Pi 经历了繁忙的一天，维护和平台功能持续演进，多行语法高亮、WebP 安全处理、OpenAI 兼容令牌计费、隐藏工具提示以及依赖漏洞等问题均已得到修复。社区关注重点集中在 Windows 支持、TUI 行为、OAuth/账户身份、上下文计量、MCP 配置，以及即将到来的 1.0 打包变更。

## 发布版本

过去 24 小时内没有发布新的 Pi 版本。

## 热门问题

1. **[Windows] 如何在 Windows 上使用 Pi？** [#7547](https://github.com/earendil-works/pi/issues/7547)  
   这是当天讨论最多的问题，共有 72 条评论。讨论涵盖 Windows 终端兼容性、安装路径、原生工具，以及平台特定功能应归入核心还是外部工具。该问题仍是平台质量方面的重要讨论主题。

2. **登录期间出现 ChatGPT OAuth 400 错误** [#10258](https://github.com/earendil-works/pi/issues/10258)  
   有报告称 `invalid_grant` 失败影响了 OpenAI OAuth 流程，而部分用户仍可通过旧版提供商正常登录。该问题已关闭，但凸显了可靠认证迁移路径的重要性。

3. **Windows 上终端颜色查询响应泄漏到提示符中** [#10256](https://github.com/earendil-works/pi/issues/10256)  
   使用 mintty/ConPTY 的 Pi 0.99.x 用户报告称，终端响应序列会出现在输入提示符中，并触发外部编辑器。该回归问题仅影响特定的 Windows 终端组合，但可能导致交互式启动完全失败。

4. **ChatGPT OAuth ID token 未持久化** [#10300](https://github.com/earendil-works/pi/issues/10300)  
   登录流程需要 ID token，但凭据转换路径不会保存它，导致扩展无法访问账户身份。对于构建具备账户感知能力的集成的扩展作者而言，该问题尤其重要。

5. **Pi 1.0 移除 `./node` 导出，导致 subagent 失效** [#10360](https://github.com/earendil-works/pi/issues/10360)  
   `pi-agent-core` 1.0 的打包/导出变更移除了原先可用的 Node.js 子路径，导致后台和异步 subagent 因缺少导出而失败。相关报告也提交于 [#10359](https://github.com/earendil-works/pi/issues/10359)。

6. **可重试网络错误之后，上下文用量被严重高估** [#10287](https://github.com/earendil-works/pi/issues/10287)  
   有报告称，在 WebSocket 或 fetch 失败后，上下文用量从约 42k 跃升至 330k tokens。该问题影响用量报告、会话继续执行决策，并可能影响模型/上下文管理。

7. **没有用户提示时，扩展提示贡献被丢弃** [#10267](https://github.com/earendil-works/pi/issues/10267)  
   扩展对 `before_agent_start` 的贡献，可能会在后台通知、计划模式继续执行、重试和恢复期间消失。这可能导致完整提示被重新计费或重新发送，同时原本应包含的系统或章节指导却被静默丢弃。

8. **CMD 模式忽略 `outputPad: 0`** [#9946](https://github.com/earendil-works/pi/issues/9946)  
   尽管设置如此，CMD 输出仍保留前导空格，而聊天消息会遵循该配置。这一差异表明，独立的渲染或格式化路径未遵循相同的用户偏好。

9. **Codemode 脚本输出导致内存无限增长** [#10283](https://github.com/earendil-works/pi/issues/10283)  
   重复的 `text()` 或 `console.*` 输出会保留在 QuickJS 堆限制之外，使进程内存持续增长，直至 Pi 崩溃。对于工具调用频繁且运行时间较长的会话，这是一个重要的可靠性问题。

10. **OpenRouter 应显示已登录用户可用的模型** [#10353](https://github.com/earendil-works/pi/issues/10353)  
    Pi 当前根据自身目录列出模型，而不是根据用户通过身份验证的 OpenRouter 权限列出。该提议通过使用账户专属的模型端点，同时保留 Pi 的能力元数据，来改进模型选择体验。

## 关键 PR 进展

1. **支持 Azure Foundry Chat Completions** [#9714](https://github.com/earendil-works/pi/pull/9714)  
   将 Azure 提供商的支持范围从 Responses API 部署扩展到基于 Chat Completions 的模型，包括 DeepSeek V4 Pro 支持。这提升了与 Azure Foundry 部署的兼容性。

2. **为 C++ 核心构建奠定 Bazel 基础** [#10372](https://github.com/earendil-works/pi/pull/10372)  
   引入 Bazel 8、模块宏、样式检查、clang-tidy 配置、接口、源代码布局以及初始 clock 模块。该 PR 为未来的原生组件提供了构建基础设施。

3. **Bedrock 上 OpenAI 模型的长上下文定价层级** [#10329](https://github.com/earendil-works/pi/pull/10329)  
   修正输入超过 272k tokens 的请求的成本元数据。Bedrock 对此类请求采用更高的输入/缓存费率和 1.5× 输出乘数，从而避免在超长对话中产生不准确的计费。

4. **从规则和技能提示中移除隐藏工具指导** [#10368](https://github.com/earendil-works/pi/pull/10368)  
   确保从模型可见工具列表中省略的工具，不会继续出现在生成的规则或技能提示中。该修复减少了相互矛盾的提示，并可能减少围绕隐藏 `bash` 工具的重试行为。

5. **修正 OpenAI 兼容网关的流式 reasoning-token 计量** [#10365](https://github.com/earendil-works/pi/pull/10365)  
   协调不同网关在流式和非流式 `completion_tokens` 对 `reasoning_tokens` 处理上的不一致。这改进了兼容提供商之间的用量和计费计算。

6. **为 Workers AI 增加 Cloudflare Clef 分类器** [#10316](https://github.com/earendil-works/pi/pull/10316)  
   将 `@cf/cloudflare/clef` 和 `@cf/cloudflare/clef-flash` 添加到模型目录，并补充定价和上下文元数据。相关实现也出现在 [#10322](https://github.com/earendil-works/pi/pull/10322)。

7. **恢复多行语法高亮** [#10361](https://github.com/earendil-works/pi/pull/10361)  
   对每个渲染行独立应用当前语法格式化器，从而保留多行 token 的高亮。相关后续 PR 仍处于开放状态：[#10356](https://github.com/earendil-works/pi/pull/10356)。

8. **加强 WebP EXIF 解析器安全性** [#10346](https://github.com/earendil-works/pi/pull/10346)  
   将 RIFF chunk 大小视为无符号值，并拒绝格式错误或越界的载荷。该变更解决了大型 chunk 长度被当作有符号整数解释时可能导致的无限循环问题。

9. **更新 `brace-expansion` 依赖** [#10332](https://github.com/earendil-works/pi/pull/10332)  
   将 shrinkwrap 固定的依赖从 5.0.9 更新至 5.0.12，修复安全公告 **GHSA-q2hr-2g5m-vwhr** 中的漏洞。这是 shrinkwrap 直接控制存在漏洞的已安装版本的一个典型案例。

10. **Bedrock thinking-block 绑定控制** [#10328](https://github.com/earendil-works/pi/pull/10328)  
    配置 Bedrock 自适应 thinking 请求，使其在系统提示或工具发生变化后丢弃过时或不匹配的 thinking blocks。该行为遵循 Anthropic 风格，并可防止提供商端出现 400 错误。

其他值得注意的工作还包括：[#9880](https://github.com/earendil-works/pi/pull/9880) 中提出的 schema 发布工作、[#7610](https://github.com/earendil-works/pi/pull/7610) 中的 LLM Gateway 提供商，以及 [#8612](https://github.com/earendil-works/pi/pull/8612) 中对仅图像 steering 队列的清理。

## 热门讨论

### 想法

- **将工作记忆作为提示章节** — [#10151](https://github.com/earendil-works/pi/discussions/10151)  
  提议将任务、之前会话的摘要和工作上下文表示为结构化提示章节，从而补充 Pi 基于 skills 的能力记忆。该想法旨在打通会话日志与持久化 agent 上下文之间的闭环。

- **支持禁用 share 功能** — [#10128](https://github.com/earendil-works/pi/discussions/10128)  
  社区正在讨论 share 功能是否应设为选择性启用，或是否应提供便捷的禁用方式。这反映出用户对会话数据和外部共享控制的广泛兴趣。

### 问答

- **Codemode 基准测试与 token 节省** — [#10230](https://github.com/earendil-works/pi/discussions/10230)  
  用户正在询问 codemode 的“only”模式及其似乎能够实现动作融合/节省 token 的相关基准数据，同时关注 NVIDIA 的相关研究。

### 展示与分享

- **为 Pi 微调的 Qwen 3.8 26B** — [#10331](https://github.com/earendil-works/pi/discussions/10331)  
  一位社区成员分享了一个针对 Pi 优化的 Qwen 微调模型，引发了人们对 agent 优化开源模型的兴趣，同时也凸显了个人用户在硬件和托管方面的权衡。

## 功能请求趋势

- **更可靠、更完善的 Windows 支持**  
  终端检测、ConPTY/mintty 行为、外部编辑器和平台特定工作流，仍是反复出现的优先事项。

- **更好的提供商和模型发现能力**  
  用户希望 Pi 能够反映通过身份验证获得的模型访问权限，包括 OpenRouter 权限，以及对 Azure、Bedrock、Workers AI 和网关集成更好的支持。

- **持久化身份和友好的扩展认证**  
  随着扩展实现更深入的集成，OAuth ID-token 持久化和更清晰的账户元数据变得日益重要。

- **更好的上下文和用量管理**  
  准确的上下文计量、压缩队列、长上下文定价，以及网络错误后的可靠行为，都是长会话的重要关注点。

- **更清晰的提示/工具暴露机制**  
  社区支持更明确地区分可见工具、可执行工具、规则和 skills。隐藏工具不应留下误导性的提示指导。

- **配置的可扩展性与验证**  
  项目级 MCP 覆盖、已发布的 JSON schema，以及更可预测的渲染设置，持续成为入门和集成需求。

- **更完善的一等 agent 使用体验**  
  持久化工作记忆、动作融合/codemode 改进、仅图像队列，以及更好的 subagent 兼容性，反映出用户对更强能力 agent 运行时 的需求。

## 开发者痛点

- **跨平台终端正确性：** Windows 行为会因终端和启动方式而显著不同，并可能产生阻止正常交互的问题。
- **提供商兼容性：** OAuth 变更、网关特定的用量语义、模型 ID 变更和不完整的提供商支持，持续造成集成摩擦。
- **上下文生命周期正确性：** 压缩、重试、恢复、系统提示变更和网络失败，可能导致 token 计量不准确或状态异常。
- **扩展 API 稳定性：** 1.0 移除 `pi-agent-core` 子路径导出破坏了现有 subagent 和扩展集成，凸显了提供迁移说明和兼容性保证的必要性。
- **提示一致性：** 隐藏工具、扩展注入的提示和提供商特定的 reasoning blocks，可能与实际执行行为失去同步。
- **运行时安全：** Codemode 输出保留、WebP 格式错误解析和流错误处理缺失，表明需要更严格的资源和失败路径限制。
- **可发现性：** 更好的 README 安装指导、配置 schema、账户感知的模型目录，以及更清晰的提供商能力说明，可以降低设置和维护成本。

---

</details>

<details>
<summary><strong>Qwen Code</strong> — <a href="https://github.com/QwenLM/qwen-code">QwenLM/qwen-code</a></summary>

# Qwen Code 社区摘要 — 2026-10-03

## 今日焦点

Qwen Code 近期活动主要集中于 Managed Agent 架构和会话基础设施，包括持久化会话历史、写入者隔离、主机身份验证、有界重试和数据库热点路径优化。社区也在解决 LSP 诊断、上下文 token 预算、内存管理、Shell 解析和 Agent 安全等方面的可靠性与开发者体验问题。最新夜间版本包含 Code Mode 和权限处理相关修复。

## 发布版本

### v0.24.7-nightly.20261001.a7deb01bcb

- 使 Code Mode 文本与延迟工具发现机制保持一致。
- 包含权限处理修复。
- [查看发布版本](https://github.com/QwenLM/qwen-code/releases/tag/v0.24.7-nightly.20261001.a7deb01bcb)

## 热门议题

1. **[#12380 — Define Managed Agent dual-path architecture and staged delivery](https://github.com/QwenLM/qwen-code/issues/12380)**  
   提议将模型推理与工具环境配置相分离，同时赋予 Sessions 对持久化状态的所有权、工作区绑定、可恢复的工具执行能力以及稳定的 Web/API 接口。这是本次更新中讨论最热烈的议题，共有 **41 条评论**，表明社区对守护进程、多 Agent 和会话管理方向存在浓厚的架构兴趣。

2. **[#12028 — Non-conversation context token governance](https://github.com/QwenLM/qwen-code/issues/12028)**  
   指出系统提示词、工具 schema、`QWEN.md` 上下文和技能列表在每次请求中都会反复产生固定 token 开销。该议题已有 **18 条评论**，反映出社区普遍希望提高长上下文模型固定上下文开销的可见性，并加强相关控制。

3. **[#12091 — `sessions/delete` can permanently break a live session](https://github.com/QwenLM/qwen-code/issues/12091)**  
   活跃写入者可能使用损坏的 `parentUuid` 重新创建已删除的对话记录，使会话进入 `degraded_history` 状态并导致自动续接失效。这个 P1 级问题至关重要，因为它直接影响核心会话生命周期和数据持久化模型。

4. **[#13157 — Agent Host should run the confinement guard before permission flow](https://github.com/QwenLM/qwen-code/issues/13157)**  
   在 `qwen serve --join` 模式下，越出工作区的工具调用会先进入权限处理流程，之后才被 Host 的隔离防护机制拒绝。由此触发的自动拒绝可能终止整个运行，是 Agent Host 在安全性和可用性方面值得关注的显著问题。

5. **[#13122 — Re-enrollment after a 401 leaves a stale valid host credential](https://github.com/QwenLM/qwen-code/issues/13122)**  
   Host 注册流程在签发新凭据时，未能可靠地按主机名称或工作区去重。因此，身份验证失败后重新注册可能留下旧的注册记录和仍然有效的 secret，引发对凭据生命周期和安全的担忧。

6. **[#13208 — Side queries can exceed the model context window](https://github.com/QwenLM/qwen-code/issues/13208)**  
   主对话轮次的请求会限制在上下文窗口范围内，但通过底层生成 API 发起的辅助查询不会。因此，`max_tokens` 可能在未考虑可用上下文的情况下被发送，从而产生无效或浪费资源的请求。

7. **[#13184 — Managed session stores and panel projections grow without bounds](https://github.com/QwenLM/qwen-code/issues/13184)**  
   Managed Agent 的持久化层和 UI 层默认允许会话事件、投影及相关状态随时间无限增长。该问题对长期运行或多 Agent 部署尤其重要，并推动了下一步的性能和保留策略工作。

8. **[#13238 — Late host results can be acknowledged while usage is dropped](https://github.com/QwenLM/qwen-code/issues/13238)**  
   在终态结算之后到达的结果，会依据尝试、Host 和租约标识被视为已处理，即使其中包含新产生的用量。这使分布式 Managed Agent 执行在用量核算和幂等性正确性方面出现缺口。

9. **[#13130 — Desktop workspaces became unexpectedly untrusted](https://github.com/QwenLM/qwen-code/issues/13130)**  
   用户报告称，Desktop 工作区可能在没有可行恢复路径的情况下变成只读或不受信任状态。该问题影响信任配置、Windows 和 Web Shell 行为以及整体可用性。

10. **[#13078 — Daily dependency CVE audit failed](https://github.com/QwenLM/qwen-code/issues/13078)**  
    定时审计持续失败，需要调查失败的操作及潜在原因，包括新引入的漏洞或审计服务可用性问题。它属于 CI 和供应链风险信号，并非直接面向用户的功能需求。

## 关键 PR 进展

1. **[#13217 — Stop database amplification on Managed Agent session hot paths](https://github.com/QwenLM/qwen-code/pull/13217)**  
   减少重复的持久化工作，包括在小型事件批次写入会话锁后重写整个文档。这是提升活跃 Managed Agent 会话可扩展性的重大改进。

2. **[#13219 — Bound Managed Agent retry loops with terminal states](https://github.com/QwenLM/qwen-code/pull/13219)**  
   为异步托管 Agent 循环增加重试预算和终态，并支持投影失败后的恢复。该改动可防止重试永久卡死，并让失败行为更加确定。

3. **[#13210 — Add broker authentication and broker-provisioned writer credentials](https://github.com/QwenLM/qwen-code/pull/13210)**  
   为 Managed Agent Runtime Broker 引入经过身份验证的 principal 和由 Broker 管理的写入者凭据。该 PR 还包含双语设计文档，旨在完善 #13180 中讨论的安全架构。

4. **[#13246 — Keep `/context` estimates within the context window](https://github.com/QwenLM/qwen-code/pull/13246)**  
   在首次回复之前、切换模型之后或恢复会话之后，对预估的上下文明细应用与提供商报告 token 数量时相同的修正。这解决了 #13239 中的核算问题。

5. **[#13244 — Budget side-query output tokens against the resolved context window](https://github.com/QwenLM/qwen-code/pull/13244)**  
   将上下文窗口输出限制扩展至 `generateJson` 和 `generateText` 辅助查询；这些查询目前会绕过主 `llm-chat` 路径。该改动直接解决了 #13208。

6. **[#13128 — Surface failed or unavailable LSP diagnostics as errors](https://github.com/QwenLM/qwen-code/pull/13128)**  
   当没有 LSP Server 准备就绪、启动失败或尚未启动时，不再允许 `NativeLspService` 报告干净结果。这提升了基于诊断结果的编辑器和 Agent 决策的准确性。

7. **[#12901 — Preserve nested `tool_call` arguments on Responses requests](https://github.com/QwenLM/qwen-code/pull/12901)**  
   使嵌套 schema 能够兼容 Azure 特有的空属性处理方式，并通过指明目标对象来改进桥接验证错误。该改动旨在提升提供商互操作性和 schema 保真度。

8. **[#13026 — Report speculation files that could not be applied](https://github.com/QwenLM/qwen-code/pull/13026)**  
   确保应用失败的推测性文件副本会被报告，而不是被静默丢弃，同时保留已成功应用的推测结果。这提高了推测性编辑过程的透明度。

9. **[#13166 — Add read-only `glob` to hosted-workspace profiles](https://github.com/QwenLM/qwen-code/pull/13166)**  
   通过版本化的 `hosted-workspace-files/2` 和 `hosted-workspace-shell/2` 配置，为托管工作区配置扩展只读 `glob` 能力。这扩大了工具能力范围，同时保留基于配置的能力控制机制。

10. **[#13156 — Keep `MEMORY.md` index link targets resolvable](https://github.com/QwenLM/qwen-code/pull/13156)**  
    修复标题超过行长度限制时，索引生成可能截断 Markdown 链接目标的问题。由此可更可靠地导航至托管内存文件。

## 功能需求趋势

- **Managed Agent 运行时与架构：** 持久化 Sessions、工作区绑定、可恢复的工具执行、写入者隔离、接管语义、Broker 身份验证、凭据配置和长期分布式执行，是当前路线图的核心主题。
- **会话生命周期与持久化：** 社区关注点主要集中在安全删除、归档、恢复、历史持久性、有界保留和投影一致性。
- **Agent 安全与权限：** 隔离检查、工作区边界、权限处理顺序和安全 Host 注册是反复出现的重点。
- **上下文与 token 效率：** 用户希望提高非对话上下文的可见度、获得准确的 `/context` 估算、按上下文控制辅助查询预算，并控制长上下文成本。
- **内存可靠性：** 相关问题聚焦于保留链接、安全处理 CRLF 编辑、防止索引损坏或截断、平衡过长条目，以及减少不必要的自动内存提取。
- **Web Shell 和 Desktop 可用性：** 键盘导航、信任恢复、文件编辑保真度、移动端连接恢复和更丰富的会话视图是突出的 UX 需求。
- **LSP 与工具正确性：** 诊断失败、Server 不可用、Shell 解析语义以及特定提供商的工具 schema 兼容性，是实现可靠 Agent 行为的重要基础。
- **CI 与平台性能：** 社区正在推动成本更低且可信的 PR 执行、更显著的 lint 失败、更可靠的依赖审计，以及更可预测的托管 Agent 资源增长。

## 开发者痛点

- **分布式 Agent 的正确性仍是首要工程难题。** 多个议题和 PR 正集中处理重试、延迟结果、租约、写入者所有权、会话删除、投影恢复和凭据轮换等问题。
- **不同请求路径的 token 核算并不一致。** 主聊天请求、辅助查询、估算、工具 schema 和固定上下文采用了不同处理方式，导致上下文窗口超限和 `/context` 输出失真。
- **持久化层需要明确的生命周期和保留控制。** 活跃会话、已删除的对话记录、已索引内存、托管工作区和 UI 投影可能无限增长，也可能因并发写入而损坏。
- **失败状态并不总能被清晰呈现。** LSP 失败、推测性编辑失败、剪贴板不可用以及权限或确认失败可能被错误报告，或产生不完整的诊断信息。
- **托管和 Desktop 环境仍存在信任与互操作性问题。** 工作区意外失去信任、特定 TLS 栈导致的连接重置、CRLF 重写和提供商兼容性问题，为核心 CLI 之外带来了实际使用障碍。
- **自动化质量正受到严格审视。** CVE 审计失败、lint 流水线静默失效，以及社区对更可靠 CI 路由的诉求，表明人们对运营保障措施的日益关注。

</details>

---
*本日报由 [agents-radar](https://github.com/dboeter/daily-diff) 自动生成。*