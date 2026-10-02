# AI 基础设施日报 2026-10-03

> 生成时间: 2026-10-02 20:23 UTC | 覆盖项目: 6 个

- [vLLM](https://github.com/vllm-project/vllm)
- [SGLang](https://github.com/sgl-project/sglang)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://github.com/ollama/ollama)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Unsloth](https://github.com/unslothai/unsloth)

---

## 横向对比

# 跨项目 AI 基础设施对比 — 2026-10-03

## 1. 生态系统概览

当前生态正在模型使能、低精度推理、投机解码和分布式服务等方向快速演进，其中 **SGLang 和 llama.cpp 发布的变更数量最多**。开发活动仍高度集中于较新的 MoE 和多模态架构，尤其是 DeepSeek、Qwen、GLM 和 Blackwell；与此同时，模型、硬件与特性组合仍在持续磨合。可靠性已成为核心制约因素：多个项目中都出现了 KV-cache 静默损坏、调度器停滞、流式工具调用损坏、内存回归以及多 GPU 性能回落等问题。应用层也在围绕网关和智能体工作流加速整合，使模式保真度、策略执行、用量统计和流式正确性成为日益重要的运维关注点。

## 2. 活跃度对比

> 计数仅代表所提供的摘要中明确引用的独立 Issue 和 PR，并非各仓库当天的完整活动量。Issue 包含 RFC，并涵盖开放、关闭和已修复的报告；PR 则包括开放和已合入的工作。

| 项目 | 引用 Issue 数 | 引用 PR 数 | 发布状态 | 主要活跃方向 |
|---|---:|---:|---|---|
| **vLLM** | 14 | 12 | **无发布** | GLM 投机解码、ROCm/Blackwell、KV-cache 正确性、分布式执行 |
| **SGLang** | 17 | 15 | **已发布 v0.5.21**；本次发布合入 779 个 PR | DeepSeek 使能、MoE kernel、HiCache、PD 传输、Blackwell/AMD |
| **llama.cpp** | 12 | 22 | **发布了多个构建版本**，包括 b11337–b11351 | 后端稳健性、Hexagon、MTP 稳定性、内存分配 |
| **Ollama** | 9 | 12 | **无发布** | MLX 成熟度、model-runner 选择、工具调用流式传输、本地与云端能力一致性 |
| **LiteLLM** | 11 | 14 | **已发布 v1.105.0-dev.2** | 网关可观测性、支出归因、服务商/API 兼容性 |
| **Unsloth** | 18 | 9 | **无发布** | Studio、微调可移植性、图像/video kernel、多 GPU 性能回归 |
| **Unsloth 引用活动总计** | **81** | **84** | **3 个项目发布了版本；3 个项目未发布** | 各层级均有广泛进展 |

**解读：** Unsloth 的 Issue 引用数最多，主要反映了训练和 Studio 集成中的痛点；llama.cpp 的 PR 引用数最多，发布节奏也最为显眼。SGLang 的实际发布规模显著超过从单条引用中能够推断出的数量：仅 v0.5.21 就合入了 779 个 PR。

## 3. 模型支持竞赛

### 新发布或新集成的支持

- **SGLang**
  - 在 v0.5.21 中发布了针对 **DeepSeek-V4.1 Flash** 和 **GigaChat 3.5** 的文档/cookbook 支持。
  - 持续推进 DeepSeek-V4 路线图，涵盖 prefill、张量并行、路由和 mHC。
  - 最近的构建工作还新增或修正了实验性的 Qwen4 和 GLM-5.3-Flash 执行路径。

- **llama.cpp**
  - 发布了 **Qwen4** 的实验性修复。
  - 发布了 Hexagon HTP 对 **Q2_K 和 Q3_K** 的支持，并改进了 DMA 复制/拼接。
  - 修复了 Volta 上的 CUDA FlashAttention。
  - 已合入 GLM-5.3-Flash 支持；K2 Horizon dense、MoVA 和 ETET/MiniCPM5 风格 MoE 仍在推进中。

### 主要处于待支持状态

- **vLLM**
  - 尚待支持 DeepSeek-V4 混合 **MXFP4×FP8**。
  - ROCm/Kimi-K3 MXFP4 到 INT4 转换以及 Qwen3/Qwen3.5 融合注意力仍待完成。
  - 提议中的 GLM-5.2 SM10x 和 GLM-5.3 投机优化目前尚不应视为可用。

- **Ollama**
  - Granite 4.1/4.2 的实验性 MLX 支持仍处于开放状态。
  - MLX 依赖、runner 选择和 Strands Decider 变更尚未发布。
  - 部署后，runner 自动选择可能导致现有模型 tag 映射到新的后端制品。

- **Unsloth**
  - Qwen3-TTS 微调目前仅处于需求阶段。
  - AMD Ryzen AI Q4NX 导出和动态 GGUF 量化仍待完成。
  - 大多数推理性能工作仍以开放 PR 的形式存在。

- **LiteLLM**
  - 工作重点更多放在 API 和服务商抽象，而非模型 kernel。统一 Decisions API、原生 Bedrock GPT-5.6+ Chat Completions，以及 Responses 后端的工具搜索兼容性仍待完成。

### 领先者评估

**SGLang 在新发布的前沿模型使能方面领先**，尤其是 DeepSeek-V4.1 和 GigaChat 3.5。**llama.cpp 在本地架构和低资源后端的覆盖广度上领先**，尽管其部分最新模型工作仍处于实验阶段。vLLM 仍是最接近的前沿服务竞争者，但在本次快照中，其最重要的模型和硬件支持仍处于开放状态。LiteLLM 的优势在于服务商/API 标准化，而非原始模型执行能力。

## 4. 性能前沿

| 优化方向 | 领先活动 |
|---|---|
| **投机解码** | vLLM 报告 GLM-5.3 端到端提升 13.3%，MRV2 kernel 提升 1.2–1.3×，同时也存在接受率为 0% 和 MTP 失败问题。SGLang 正在改进 FPM 指标、确定性采样、FP8-KV 验证和 EPLB 交互。llama.cpp 和 Unsloth 聚焦于 Metal/Vulkan MTP 以及 CUDA-graph 行为。 |
| **MoE 与量化 kernel** | SGLang 在 Blackwell NVFP4 和 AMD MXFP4 使能、共享专家融合以及面向 decode 的 MoE/MLA tile 方面领先。vLLM 正在推进 MXFP4×FP8 路由和有损 ROCm MXFP4 到 INT4 转换。Unsloth 正在调优 BF16 与 INT8 MMQ，并推进融合式图像生成模块。 |
| **KV cache 与内存** | vLLM 正在解决 DeepEP 过度分配、调度器反压、稀疏索引损坏和 KV 分层准入问题。SGLang 正在优化 HiCache、调度器缓存驻留，以及 DeepSeek-V4 的 128k 内存回归。llama.cpp 正在改进 KV 池边界和主机卸载的 MoE 权重驻留。 |
| **分布式服务** | SGLang 的 NIXL pinned-host staging、EPLB、分层缓存和张量并行路线图，使其成为该方向最活跃的项目。vLLM 正在优化序列并行、FlashInfer all-reduce 选择和受权重加载限制的副本激活。 |
| **批处理与调度** | vLLM 正在应对准入停滞和投机 token 调度开销。SGLang 正在解决 chunked-prefill 槽位固定、缓存感知的等待请求驻留，以及 HiCache 请求完成处理。 |
| **低资源执行** | llama.cpp 和 Unsloth 在主机卸载、KV 池、RPC/多 GPU、图像生成和边缘后端方面最为突出。Ollama 正在优化 MLX 决策推理，但目前存在驻留和利用率回归。 |
| **网关效率** | LiteLLM 正在减少提示缓存检查中的 tokenization 开销、提高 OpenTelemetry 缓存/数据库 span 的准确性，并完善自动路由器的节省归因。 |

一个关键信号是，**性能与正确性正日益紧密耦合**。更快的投机路径可能会静默停止接受 token；融合量化可能会改变专家排序；优化的缓存策略可能影响请求准入；而多 GPU 变更则可能造成严重的性能断崖。

## 5. 各层级定位

| 项目 | 主要层级 | 差异化优势 |
|---|---|---|
| **vLLM** | 高吞吐量模型服务引擎 | 强大的前沿模型服务、批处理、投机解码、分布式执行，以及生产级调度器/缓存原语 |
| **SGLang** | 高吞吐量模型服务引擎 | 快速发布节奏、广泛的 MoE/量化工作、分层缓存、prefill/decode 分离，以及面向 Blackwell/AMD 的强劲布局 |
| **llama.cpp** | 本地与边缘推理运行时 | 出色的构建/后端可移植性、GGUF、CPU/Metal/Vulkan/Hexagon 覆盖、轻量部署和自包含工具链 |
| **Ollama** | 本地开发者/运行时及模型管理层 | 简化的本地模型体验、日益成熟的 MLX、自动 runner 选择，以及云端/本地模型抽象 |
| **LiteLLM** | LLM 网关与 SDK | 多服务商路由、策略执行、身份认证、可观测性、缓存、预算、支出归因和 API 标准化 |
| **Unsloth** | 微调与优化型本地推理 | 高效训练、LoRA/QLoRA 工作流、GGUF 转换和 Studio 图像/video 生成；越来越多地包含基于 llama.cpp 的服务能力 |

这些产品是互补关系，而非直接替代关系。一种常见架构是 **使用 Unsloth 创建 adapter → 使用 vLLM 或 SGLang 进行生产服务 → 使用 LiteLLM 作为受治理的网关**。llama.cpp 和 Ollama 更适用于本地、边缘、桌面以及开发者主导的部署。不过，Unsloth 生成的 Qwen3-VL LoRA 与 vLLM 之间目前仍存在 adapter 可移植性差距，表明这套集成尚未实现无缝衔接。

## 6. 趋势信号

### 行业趋势

1. **前沿模型支持速度已快于生产环境验证速度。**  
   新的 MoE、多模态和低精度 checkpoint 往往在数天内就会被集成，但特定模型、后端和量化组合仍可能出现静默损坏、格式错误输出或内存回归。

2. **投机解码正成为一级服务特性，同时也是重要的可靠性风险面。**  
   接受率、已接受 token 数、draft 延迟和特性兼容性必须被视为核心生产指标。接受率为 0% 的服务器即使能够正常响应，在运维层面也不能算健康。

3. **低精度格式正在造成技术栈碎片化。**  
   MXFP4、NVFP4、INT4、FP8、压缩张量、后端专属权重排序以及可选的有损转换，增加了 checkpoint 可移植性和可复现性的复杂度。

4. **分离式和分层服务正在推进，但可观测性仍显滞后。**  
   PD 传输、HiCache、KV 分层、EPLB、副本激活和调度器反压需要请求级追踪，而不能只依赖粗粒度的引擎健康信号。

5. **智能体正确性正在成为基础设施要求。**  
   流式工具调用可能被丢弃、合并、作为 reasoning 输出，或遭到截断。结构化模式、按路由划分的工具策略和流式内容通道现在都需要专门的 conformance 测试。

6. **网关治理与模型性能同等重要。**  
   LiteLLM 暴露出的策略绕过、共享模型健康检查、自定义定价和零成本报告表明，即使推理运行正常，路由、安全、预算和归因环节仍可能失效。

7. **本地运行时持续改进，但回归测试不可或缺。**  
   Ollama 的 MLX 驻留/利用率问题、llama.cpp 的 MTP/设备故障，以及 Unsloth 的 2.9× tensor-split 回归，都要求精确锁定构建版本并强制采用 canary 基准测试。

### 智能体和应用开发者应重点关注

- **锁定完整的 serving 技术栈：** engine 构建版本、模型镜像、GPU 后端、量化 kernel、Transformers 版本、网关和 adapter 格式。
- **增加流式智能体 conformance 测试：** 覆盖工具标签分片、多次调用、JSON 内部空白、reasoning 通道泄漏、空 content、schema enum，以及按路由划分的策略执行。
- **监控存活状态之外的运维指标：** 调度器积压、已准入/运行中请求、投机接受情况、提示处理进度、TTFT、缓存驻留、内存峰值和有效并行度。
- **将新的模型/硬件组合视为特性矩阵：** 测试架构、GPU 代际、后端、量化方式、投机解码器、缓存模式和并发度的每种组合。
- **验证从训练到服务的完整链路：** 尤其关注 LoRA 元数据、目标模块、checkpoint 布局、adapter 加载和动态权重同步。
- **在网关层核对成本：** 自定义模型定价、流式用量估算、服务层级、提示缓存计费和自动路由器节省金额，都可能影响财务报告。
- **优先采用带已知良好回退方案的 canary 发布，** 尤其是对于 SGLang 规模庞大的发布列车、llama.cpp 快速的构建流，以及 Unsloth 当前的多 GPU 不稳定性。

---

---

## 各项目详细报告

<details>
<summary><strong>vLLM</strong> — <a href="https://github.com/vllm-project/vllm">vllm-project/vllm</a></summary>

# vLLM 摘要 — 2026-10-03

## 1. 今日要点

vLLM 今日动态主要围绕特定模型的推理性能、投机解码和分布式执行展开：公开 PR 包括已报告的 **GLM-5.3 吞吐量提升 13.3%**、**投机解码内核性能提升 1.2–1.3×**，以及一项针对序列并行场景下 DeepEP v2 缓冲区过度分配问题的修复。可靠性仍是运维关注的核心，当前活跃报告涉及 Blackwell SM120 兼容性、ROCm 稀疏注意力 KV 数据损坏、调度器准入停滞，以及 MTP 接受率降至零。过去 **24 小时内没有新版本发布**；以下提及的所有变更均为尚未关闭的 issue 或 pull request，不应视为已经发布。

## 2. 新模型与硬件支持

- **MXFP4 × FP8 compressed-tensors 支持：** 一个公开 PR 为 `MXFP4xFP8_DYNAMIC` 压缩检查点新增路由支持，其中包括 DeepSeek-V4 MoE 支持。这扩展了 4 位与 8 位混合量化支持，但目前仍待合并。  
  [PR #59376](https://github.com/vllm-project/vllm/pull/59376)

- **ROCm/Kimi-K3 量化：** 一条可选启用的 gfx942 路径拟在加载时将 MXFP4 专家权重转换为分组 INT4，并通过 AITER 的 packed-int4 内核提供服务。该转换明确存在精度损失，并且需要选择对应算子。  
  [PR #51274](https://github.com/vllm-project/vllm/pull/51274)

- **ROCm Qwen3/Qwen3.5 融合注意力路径：** 一项公开的 ROCm 变更支持为 Qwen3-Next/Qwen3.5 启用融合 QK-norm、RoPE 和 gate 的 Triton 内核。  
  [PR #51406](https://github.com/vllm-project/vllm/pull/51406)

- **NVIDIA SM10x 上的 GLM-5.2：** 一项拟议优化计划在低并发解码场景中，将 GLM-5.2 的融合 QKV-A 投影接入现有的 DeepSeek-V3 融合 GEMM 自定义算子。  
  [PR #59822](https://github.com/vllm-project/vllm/pull/59822)

- **LoRA 适配器管理 API：** 一项拟议公共 API 将允许框架读取和更新已加载的 LoRA 适配器张量，而无需访问管理器内部状态。这与微调和智能体服务栈中的动态适配器权重同步直接相关。  
  [PR #59819](https://github.com/vllm-project/vllm/pull/59819)

## 3. 性能与优化

- **GLM-5.3 投机解码：** 据报告，融合多步草稿解码在并发度为 1 时可将端到端吞吐量提升 **13.3%**，并避免在多个草稿步骤之间反复重建元数据。  
  [PR #57443](https://github.com/vllm-project/vllm/pull/57443)

- **MRV2 自回归投机器：** 据称，正确传递动态调度的投机 token 数量可通过避免不必要的草稿前向计算和处理过期草稿 token，使内核性能提升 **1.2–1.3×**。  
  [PR #57053](https://github.com/vllm-project/vllm/pull/57053)

- **DeepEP v2 内存占用：** 据报告，在序列并行下，`ElasticBuffer` 的分配量达到实际需求的 `sp_size×`；拟议修复将按每个 rank 实际分发的分片确定其大小。  
  [PR #59687](https://github.com/vllm-project/vllm/pull/59687)

- **ROCm 分块预填充注意力：** 一项双遍因果 MHA 实现拟融合为单个因果 MHA 算子，以减少缓存上下文与新 token 同时预填充时的内核启动次数。  
  [PR #59469](https://github.com/vllm-project/vllm/pull/59469)

- **FlashInfer all-reduce 选择：** 一项公开修复将分别判断节点内、多节点 Blackwell 和多节点 Hopper 组的可用后端，避免不加区分地自动选择。  
  [PR #56891](https://github.com/vllm-project/vllm/pull/56891)

- **受权重加载限制的启动速度：** 当前路线图计划通过提前准备服务配置，并将权重加载推迟至更接近副本激活时点，加快其他兼容副本的快速激活。  
  [Issue #48193](https://github.com/vllm-project/vllm/issues/48193)

- **KV-cache 分层：** 一份 RFC 提议在级联和提升请求提交前执行准入控制，以解决 KV-cache 卸载系统中的慢层级过载和层级提升争用问题。  
  [Issue #51240](https://github.com/vllm-project/vllm/issues/51240)

## 4. 稳定性与回归问题

### 严重／高影响

1. **ROCm GLM-5.3 稀疏索引器可能破坏其 KV cache：** 据报告，kpool 索引器会将 4,096 个池条目写入 864 个槽位，导致约 **79% 的索引器 key 错误**。由于模型仍可生成流畅文本，该故障不会显式报错，主要表现为长上下文召回能力下降。今日数据中未发现相关修复 PR。  
   [Issue #54359](https://github.com/vllm-project/vllm/issues/54359)

2. **调度器在负载过高时可能停止准入请求：** 在引擎仍报告健康状态时，积压请求持续增长，形成生产环境中的反压问题，而这种问题可能难以通过粗粒度健康指标检测。当前未列出直接对应的修复 PR。  
   [Issue #53130](https://github.com/vllm-project/vllm/issues/53130)

3. **SM120 和分离式部署场景下 MTP 接受率降至 0%：** 两份独立报告分别涉及 RTX PRO 6000 Blackwell 上的 GLM-5.3-Flash，以及采用预填充／解码分离式服务的 Qwen3.8-Flash-Next。这实际上会使投机解码失去吞吐收益。两份报告均未显示对应的修复 PR。  
   - [SM120 / GLM-5.3 Issue #59724](https://github.com/vllm-project/vllm/issues/59724)  
   - [Disaggregated PD / Qwen3.8 Issue #59642](https://github.com/vllm-project/vllm/issues/59642)

4. **Blackwell SM120 CUDA graph 支持：** 据报告，DeepSeek-V4.1-Flash 在 eager execution 下的解码吞吐量极低，同时无法使用 CUDA graph。目前有一项 GDN prefix-cache 混合修复处于开放状态，但其目标是投机解码／缓存命中，并非针对所要求的 SM120 graph capture 修复。  
   - [Issue #56892](https://github.com/vllm-project/vllm/issues/56892)  
   - [Hybrid GDN cache fix PR #52244](https://github.com/vllm-project/vllm/pull/52244)

5. **ROCm GLM-5.3 低并发正确性：** 据报告，最近的 nightly 版本在请求并发度较低时会生成乱码，表明服务正确性可能会随批处理形状或调度器行为而变化。  
   [Issue #59413](https://github.com/vllm-project/vllm/issues/59413)

### 中等影响

6. **DFlash Mamba 组无法复用 prefix cache：** 据报告，drafter KV group 未被正确识别，导致所有组均被视为草稿组，从而无法按预期复用 prefix cache。  
   [Issue #57032](https://github.com/vllm-project/vllm/issues/57032)

7. **量化正确性与兼容性：** 当前公开 issue 报告了 A100 FP8 dtype 错误，以及 Marlin MoE 输出依赖专家内部 token 顺序的问题。这些问题可能导致启动失败或非确定性输出。  
   - [A100 FP8 Issue #54219](https://github.com/vllm-project/vllm/issues/54219)  
   - [Marlin MoE Issue #52525](https://github.com/vllm-project/vllm/issues/52525)

8. **Qwen reasoning parser 可能将正常内容置空：** 在使用 Nemotron v3 时，据报告，同时指定 `--reasoning-config` 和 Nemotron parser 会将所有生成的 token 都归入 reasoning，同时使 `content` 保持为 null；此外还有无限思考的报告。  
   [Issue #39103](https://github.com/vllm-project/vllm/issues/39103)

9. **RL 工作负载的休眠／唤醒正确性：** 一份 RFC 正跟踪 vLLM 是否能够在强化学习服务所使用的休眠／唤醒周期之间，正确保留状态和权重语义。  
   [Issue #48310](https://github.com/vllm-project/vllm/issues/48310)

10. **ROCm 休眠模式与投机解码组合使用：** 据报告，在 MI250 上同时启用这两项功能会发生崩溃，进一步说明在生产环境启用二者前需要进行功能矩阵测试。  
    [Issue #47548](https://github.com/vllm-project/vllm/issues/47548)

## 5. 对应用开发者的意义

- **将 SM120 和近期 ROCm nightly 部署视为待验证配置。** 在投入生产前，应验证 token 正确性、投机接受率、长上下文召回能力，以及 eager execution 和 graph-capped execution 两种执行模式。
- **显式监控投机接受情况。** 服务健康且 token 生成正常，并不代表投机解码实际有效；应跟踪接受率、每个请求接受的 token 数，以及草稿／验证器延迟。
- **在系统饱和状态下测试调度器行为。** 应跟踪请求准入、排队时间、运行中／待处理请求数及积压时长，而不是仅依赖引擎存活状态或内存健康信号。
- **避免在 ROCm GLM-5.3 上使用未经测试的投机解码组合。** 稀疏索引器、低并发流量、休眠／唤醒周期和分离式部署分别带来了不同的正确性风险。
- **固定依赖组合。** 当前活跃的 Transformers v5 跟踪 issue，以及近期出现的 Gemma/Transformers 故障表明，需要将 Transformers、vLLM 镜像和后端扩展固定为经过验证的组合。  
  [Transformers v5 tracker](https://github.com/vllm-project/vllm/issues/38379)
- **对于新的量化格式，应验证检查点的精确布局。** MXFP4、MXFP4×FP8 和特定后端的 INT4 转换在权重排序上可能存在差异，并可能产生精度损失。
- **API 层需要增加防护措施。** 智能体应用应验证 reasoning 和正常内容未被意外置空，并避免执行出现在引用 reasoning 示例中的工具标记。Qwen parser 的一项待合并修复解决了后一个问题。  
  [PR #59821](https://github.com/vllm-project/vllm/pull/59821)

---

</details>

<details>
<summary><strong>SGLang</strong> — <a href="https://github.com/sgl-project/sglang">sgl-project/sglang</a></summary>

# SGLang 摘要 — 2026-10-03

## 1. 今日要点

SGLang 发布了 **v0.5.21**，这是一次大型更新，共包含 **227 位贡献者提交的 779 个 pull request**，并扩展了模型支持，包括 **DeepSeek-V4.1 Flash** 和 **GigaChat 3.5**。近期开发活动还集中在 MoE 优化、Blackwell 与 AMD 支持、分层缓存性能、投机解码以及多模态服务等方面。多个开放 issue 报告了新优化路径中的内存增长、工具调用解析错误、调度器不稳定和路由回归问题。

## 2. 发布与破坏性变更

- **[v0.5.21](https://github.com/sgl-project/sglang/releases/tag/v0.5.21)** — 本次发布重点包括 **227 位贡献者合并的 779 个 PR**，并新增了模型支持。所提供的发布数据未明确指出破坏性变更或强制迁移要求，但用户在升级生产部署前，应查阅发布说明以及特定模型的配置指南。
- 在所提供的数据中，未发现已确认的 API 删除或必需的配置迁移。

## 3. 新模型与硬件支持

- **DeepSeek-V4.1 Flash** — 已作为 **LLM/VLM** 模型加入文档中的模型/cookbook 集合。参见 [DeepSeek-V4.1 cookbook](https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4_1)。
- **GigaChat 3.5** — 已作为 **LLM/VLM** 模型加入文档中的模型/cookbook 集合。所提供的发布摘录截断了直接的 cookbook URL，但该模型已包含在 [v0.5.21 release](https://github.com/sgl-project/sglang/releases/tag/v0.5.21) 中。
- **DeepSeek-V4 优化路线图** — 正在进行的工作包括 mHC 清理、prefill 优化、TP 改进，以及 router/kernel 优化。参见 [issue #42170](https://github.com/sgl-project/sglang/issues/42170)。
- **AMD DeepSeek-V4-MXFP4 支持** — 一个开放 PR 为 DSV4 栈添加 Quark DeepSeek-V4-MXFP4 checkpoint 支持，包括 shared-expert fusion 和 MTP/EAGLE 投机解码：[PR #31054](https://github.com/sgl-project/sglang/pull/31054)。
- **Blackwell NVFP4 与 DeepSeek 支持** — 开放工作包括在 FlashInfer MegaMoE 中支持 NVFP4 W4A16（[PR #39210](https://github.com/sgl-project/sglang/pull/39210)），以及为 LoRA 和 FP4 后端围绕 DeepSeek NVFP4 shared-expert fusion 增加保护逻辑（[PR #42203](https://github.com/sgl-project/sglang/pull/42203)）。
- **AMD GLM-5.2 解码路径** — 一个 ROCm PR 面向 decode 形态的 MoE/MLA tiles、拆分式 speculative softmax，以及 gfx950 上的 BF16 GEMM 路由：[PR #41725](https://github.com/sgl-project/sglang/pull/41725)。
- **AMD FP8 行为变更正在审查中** — 一项拟议变更将移除 AITER per-token FP8 路径中的静态 `input_scale`，改用动态 per-token scaling：[PR #42152](https://github.com/sgl-project/sglang/pull/42152)。
- **硬件能力门控** — 一份 RFC 提议对兼容 CUDA 的树外平台采用基于能力的门控，而不是仅依赖 `torch.cuda`/CUDA 版本检查：[issue #42173](https://github.com/sgl-project/sglang/issues/42173)。

## 4. 性能与优化

### 已合入或正在进行

- **Speculative FPM 可观测性** — 一项正在审查的修复纠正了 speculative-decode FPM 的计时和解码长度统计，避免迭代计时重叠以及 CPU 长度数据陈旧或缺失：[PR #38711](https://github.com/sgl-project/sglang/pull/38711)。
- **分层缓存传输清理** — HiCache 重构整合了多个调度器和存储路径中的取消处理以及进行中的存储预取处理：[PR #41453](https://github.com/sgl-project/sglang/pull/41453)。
- **用于 PD 传输的 NIXL 主机暂存** — 一条可选路径通过 pinned host memory 暂存 prefill 到 decode 的 KV/state 传输，并复用现有的 NIXL 传输规划器：[PR #41182](https://github.com/sgl-project/sglang/pull/41182)。
- **将 HiCache write-through 移出请求完成路径** — 一项拟议变更将备份操作排队并批处理，从而避免在 `cache_finished_req` 期间于调度器线程中串行执行工作：[PR #40363](https://github.com/sgl-project/sglang/pull/40363)。
- **MiniMax-M3 解码优化** — 一项 GB300/TP4 变更针对分页 K/V tile 加载和小型 router-projection GEMM。基准测试配置为 **ISL 8192、OSL 1024、上下文长度 1,048,576**：[PR #38841](https://github.com/sgl-project/sglang/pull/38841)。
- **Blackwell 机密计算重叠调度** — 一项拟议修复解决了 NVIDIA Confidential Computing 下同步 D2H copy 导致的调度器停顿问题；在该环境中，`cudaMemcpyAsync` 可能导致 decode overlap 串行执行：[PR #36810](https://github.com/sgl-project/sglang/pull/36810)。
- **确定性投机采样** — 一个开放 PR 使用请求本地状态而非全局 PyTorch RNG 为 rejection-sampling 草稿提议提供随机种子，以解决确定性推理的一致性问题：[PR #33395](https://github.com/sgl-project/sglang/pull/33395)。
- **LTX-2 视频编码重叠** — 一项后续工作提议将 MP4/音频编码与 VAE decode 重叠执行。diffusion-bench 测量显示，在短视频中，编码约占客户端延迟的 **20–40%**；在 2×B200 上，服务端计算耗时约 **4.3 秒**，客户端延迟为 **5.4–5.7 秒**：[issue #41892](https://github.com/sgl-project/sglang/issues/41892)。
- **DeepSeek-V4 长上下文内存** — 一个开放 issue 报告称，在 128k 情况下，当默认设置 `SGLANG_FP8_PAGED_MQA_LOGITS_TORCH=True` 同时在 SM120 上禁用 C4 indexer 的 row-chunk planner 时，内存会增加 **3.3–3.8 GiB**：[issue #42146](https://github.com/sgl-project/sglang/issues/42146)。
- **调度器缓存驻留** — 一项拟议的调度器变更会在采用 cache-agnostic admission policy 时保留等待请求的缓存前缀，从而可能减少可避免的缓存驱逐：[PR #41593](https://github.com/sgl-project/sglang/pull/41593)。

## 5. 稳定性与回归

以下按潜在运维影响排序；issue 状态基于所提供的 GitHub 数据。

### 高优先级

1. **QSA extend forward 中的 CUDA 非法内存访问**  
   在 H20 TP8 部署中，使用 Qwen3.8-Flash-Next-FP8 时，并发请求达到 **8 个**可能触发 CUDA 非法内存访问。`CUDA_LAUNCH_BLOCKING=1` 和 `--disable-overlap-schedule` 可以抑制故障，但这些只是临时规避措施，并不能确认为根因修复或安全运行上限。  
   [Issue #37633](https://github.com/sgl-project/sglang/issues/37633)

2. **EPLB + DSPARK 投机解码崩溃**  
   草稿 CUDA graph 捕获因 `on_select_experts` 中的 `scatter_add_` 维度不匹配而失败。报告称该问题在最新版本中仍然存在；所提供的数据未指出对应的修复 PR。  
   [Issue #34974](https://github.com/sgl-project/sglang/issues/34974)

3. **DeepSeek-V4 内存回归/配置耦合问题**  
   上述 SM120 issue 将 **128k 时增加 3.3–3.8 GiB 内存**的问题与一个环境变量/默认设置之间的交互联系起来，该交互会意外禁用 C4 indexer planner。  
   [Issue #42146](https://github.com/sgl-project/sglang/issues/42146)

4. **Chunked-prefill 批处理回归**  
   在 chunked prefill 下，decode running batch 据称会固定在 `max_running_requests - 1`，这可能浪费一个请求槽位并降低资源利用率。  
   [Issue #38118](https://github.com/sgl-project/sglang/issues/38118)

5. **SM100 上 packed MXFP4 的 MoE runner 选择失败**  
   据报告，MiMo-V2 在使用 packed MXFP4 experts 时会错误选择 FP8 MoE runner。该 issue 已关闭，另一个相关的已关闭 issue 表明 SM90/H200 上存在同类问题；所提供的数据未指出具体修复提交。  
   [Issue #41569](https://github.com/sgl-project/sglang/issues/41569) · [related issue #42162](https://github.com/sgl-project/sglang/issues/42162)

### 中优先级

6. **工具调用/流式输出正确性问题**  
   多个开放报告影响了 agent 应用：
   - HarmonyParser 可能将 analysis channel 中的工具调用参数作为 reasoning 输出：[#42143](https://github.com/sgl-project/sglang/issues/42143)
   - DeepSeek-V3.1 流式输出可能丢失一个工具调用，并将参数附加到下一个调用上：[#42138](https://github.com/sgl-project/sglang/issues/42138)
   - 当参数片段之间出现空白字符时，Anthropic 流式输出可能遗漏工具调用的闭合 `}`：[#42260](https://github.com/sgl-project/sglang/issues/42260)
   - Glm4MoeDetector 可能改变字符串值，例如将 `"true"` → `"True"` 或 `"1.50"` → `"1.5"`：[#42133](https://github.com/sgl-project/sglang/issues/42133)
   - XGrammar 可能会拒绝嵌套在结构关键字下的 `null` schema：[#42144](https://github.com/sgl-project/sglang/issues/42144)

7. **DSv4.1 路由不一致**  
   纯文本 batch 仍可能在 CUDA 上调用 `vision_topk()`，从而绕过 recorder 和 EPLB remapping 逻辑。  
   [Issue #42188](https://github.com/sgl-project/sglang/issues/42188)

8. **服务基准测试中的 TTFT 统计**  
   基准测试工具似乎会将未测量请求的默认 `ttft=0.0` 值纳入统计，从而可能使 TTFT 的均值、中位数和百分位数产生偏差。  
   [Issue #42000](https://github.com/sgl-project/sglang/issues/42000)

9. **Expert-distribution endpoint 可能终止调度器**  
   当 recorder mode 未设置时，调用 expert-distribution endpoint 可能在调度器内部抛出异常并终止引擎，而不是向客户端返回错误。  
   [Issue #42222](https://github.com/sgl-project/sglang/issues/42222)

10. **FP8 KV-cache 与投机验证**  
    一个开放 PR 处理 SM90/SM120 上使用 FP8 KV cache 时的 XQA draft-extend 行为，其中 query casting 可能与 kernel 预期的输出类型不匹配。这是 EAGLE 风格服务中需要关注的正确性/性能领域。  
    [PR #41656](https://github.com/sgl-project/sglang/pull/41656)

## 6. 对应用开发者的影响

- **升级前，端到端验证流式工具调用。** Harmony、DeepSeek、Anthropic、Glm4Moe 和 XGrammar 相关的多个问题可能破坏工具名称、参数、reasoning channel 或 JSON schema 处理。对于 agent 工作负载，应增加包含多个调用、分片 JSON、空白字符和嵌套 schema 关键字的测试。
- **固定并测试确切的 release/model/hardware 组合。** DeepSeek-V4、MiMo-V2、Blackwell NVFP4 和 AMD MXFP4 支持涉及快速变化的 kernel 和量化路径。请在目标 GPU 拓扑上运行准确性、并发和长上下文测试。
- **仅将已报告的并发规避方法用于诊断。** `CUDA_LAUNCH_BLOCKING=1` 和禁用 overlap scheduling 可能掩盖 CUDA 内存安全问题，同时会显著降低吞吐并削弱延迟优势。
- **关注长上下文 DeepSeek 部署的内存设置。** 在 SM120 上使用默认环境变量前，应验证 128k 情况下的 C4 indexer/planner 配置，并测量峰值内存。
- **谨慎使用 `--file-storage-path`。** 一份开放报告称，该 flag 当前未被 file HiCache backend 遵循，数据可能会被路由到环境变量指定的目录或默认目录。请在部署版本中验证实际生效的存储路径。  
  [PR #33883](https://github.com/sgl-project/sglang/pull/33883)
- **在生产环境中，关注投机解码和基准测试指标的可观测性。** 应将 FPM 计时、decode 长度和 TTFT 计算与原始请求 trace 进行校验；未测量请求的零值 TTFT 可能会严重扭曲延迟监控面板。
- **预计 MoE 和分离式服务仍会持续演进。** HiCache、NIXL PD 传输、EPLB、MXFP4/NVFP4 和 AMD kernel 都是活跃开发领域。尤其在组合使用投机解码、EP 和分层缓存时，应优先采用分阶段发布并进行正确性检查。

---

</details>

<details>
<summary><strong>llama.cpp</strong> — <a href="https://github.com/ggml-org/llama.cpp">ggml-org/llama.cpp</a></summary>

# llama.cpp 摘要 — 2026-10-03

## 1. 今日重点

- 最新动态主要集中在**后端稳健性和内存管理基础设施**：GGML 新增了缓冲区分配接口，Vulkan 改进了计算管线诊断并修复了兼容性问题。CUDA 还修复了两起 Volta 架构上的 FlashAttention 故障。
- **Hexagon 支持范围正在扩大**，新增了 Q2_K/Q3_K 量化类型以及基于共享 DMA 的复制/拼接操作。多个后端的正确性和稳定性问题仍在处理中，尤其是推测解码、Vulkan、CUDA MMQ 和主机卸载 MoE 模型相关问题。
- 服务端和模型管理路线图的规模持续扩大，**基于 UI 的模型/提供商管理、附属资源发现以及感知 token 的聊天解析**等工作正在推进。

## 2. 发布与破坏性变更

- **目前没有明确的破坏性发布或迁移说明。**
- 构建版本 `b11351` 在 `ggml_backend_buffer_type_i` 接口中新增了 `alloc_buffer_n`，并公开了 `ggml_backend_buft_alloc_buffer_n`。这主要属于内部/后端集成变更；自定义 GGML 后端实现可能需要提供该接口的新方法，或对其进行处理。  
  [发布版本 b11351](https://github.com/ggml-org/llama.cpp/releases/tag/b11351) · [PR #23671](https://github.com/ggml-org/llama.cpp/pull/23671)
- 构建版本 `b11342` 修复了使用存在问题的 `libstdc++` 实现时，通过符号链接创建缓存目录失败的问题。这属于部署/运行时修复，而非配置变更。  
  [发布版本 b11342](https://github.com/ggml-org/llama.cpp/releases/tag/b11342) · [PR #29816](https://github.com/ggml-org/llama.cpp/pull/29816)

## 3. 新模型与硬件支持

- **Hexagon HTP**
  - 重新构建的 HTP skeleton 已纳入项目，并修正了 HTP skeleton 目录依赖。  
    [发布版本 b11347](https://github.com/ggml-org/llama.cpp/releases/tag/b11347) · [PR #29828](https://github.com/ggml-org/llama.cpp/pull/29828)
  - Hexagon 现已支持 **Q2_K 和 Q3_K** 量化类型，并统一了 `src1_row_size` 的分配方式。  
    [发布版本 b11345](https://github.com/ggml-org/llama.cpp/releases/tag/b11345) · [PR #29717](https://github.com/ggml-org/llama.cpp/pull/29717)
  - 共享的 strided DMA 路径现已加速 `CPY` 和 `CONCAT` 操作，包括任意维度的拼接。  
    [发布版本 b11338](https://github.com/ggml-org/llama.cpp/releases/tag/b11338) · [PR #29685](https://github.com/ggml-org/llama.cpp/pull/29685)

- **Qwen4 实验性支持**
  - 修复了 Qwen4 实验性实现中的测试失败问题。  
    [发布版本 b11346](https://github.com/ggml-org/llama.cpp/releases/tag/b11346) · [PR #29819](https://github.com/ggml-org/llama.cpp/pull/29819)

- **CUDA**
  - 修复了 NVIDIA Volta 架构 GPU 上两起失效的 FlashAttention 用例。  
    [发布版本 b11344](https://github.com/ggml-org/llama.cpp/releases/tag/b11344) · [PR #29803](https://github.com/ggml-org/llama.cpp/pull/29803)

- **Vulkan**
  - 新增了计算管线编译问题的日志，有助于诊断特定驱动导致的着色器故障。  
    [发布版本 b11349](https://github.com/ggml-org/llama.cpp/releases/tag/b11349) · [PR #29794](https://github.com/ggml-org/llama.cpp/pull/29794)
  - 一项待合并修复处理了不导出 `vkEnumerateInstanceVersion` 的 Vulkan loader，从而提升旧版 Android loader 的兼容性。  
    [PR #29872](https://github.com/ggml-org/llama.cpp/pull/29872)

- **正在开发的模型架构**
  - K2 Horizon dense 和 MoVA 支持，包括从 HF 到 GGUF 的转换、分词、加载和推理图支持。  
    [PR #29535](https://github.com/ggml-org/llama.cpp/pull/29535)
  - ETET 1.0 正在加入支持；这是一种源自 MiniCPM5/LlamaForCausalLM 的 MoE 架构。  
    [PR #29873](https://github.com/ggml-org/llama.cpp/pull/29873)
  - GLM-5.3-Flash 支持已合并/关闭，覆盖一个 320B 规模的文本与视觉混合模型。  
    [PR #27773](https://github.com/ggml-org/llama.cpp/pull/27773)

## 4. 性能与优化

- **Vulkan F16 累加**
  - 一项待合并的 Vulkan 变更会在点积指令不可用时，将标量 FMA 打包为 `f16vec2` 操作，同时保持运算顺序和位级一致的结果。  
    [PR #29877](https://github.com/ggml-org/llama.cpp/pull/29877)

- **SYCL GLM MLA 预填充**
  - SYCL GLM-4.7 Flash 的提示词形态正逐步接入 MKL FlashAttention 管线，并正确处理宽度更小的 strided V-cache 视图。  
    [PR #29171](https://github.com/ggml-org/llama.cpp/pull/29171)

- **Metal 推测解码**
  - 待合并的 Metal 优化为不使用 tensor API 的 Apple GPU 推测解码增加了少行 MMA 矩阵乘和批量复制，面向每步 2–16 个 draft token。  
    [PR #29869](https://github.com/ggml-org/llama.cpp/pull/29869)

- **主机卸载 MoE**
  - 一项提议中的 GPU 常驻 LRU 缓存会将近期使用的主机内存 MoE 专家权重保留在 GPU 中，以减少解码期间的系统 RAM 流量。  
    [PR #27861](https://github.com/ggml-org/llama.cpp/pull/27861)

- **KV-cache 池化**
  - 一项修复在批次填满缓存时限制 KV-pool 的重新池化上界，避免执行规模过大的重新池化工作。  
    [发布版本 b11339](https://github.com/ggml-org/llama.cpp/releases/tag/b11339) · [PR #29805](https://github.com/ggml-org/llama.cpp/pull/29805)

- **CPU FlashAttention**
  - 一项开放中的 PR 对 KQ 最大值应用偏移，以避免长上下文解码和提示词尾部所使用的 per-query kernel 中 F16 求和溢出。  
    [PR #29810](https://github.com/ggml-org/llama.cpp/pull/29810)

## 5. 稳定性与回归问题

按潜在生产环境影响排序：

1. **CUDA MMQ 越界读取/非法内存访问**
   - 一个开放问题报告称，对于某些 MoE ubatch 大小，`MUL_MAT_ID` 中 `src1_q8_1` 尾部填充的计算不正确，可能导致非法内存访问和崩溃。  
     [Issue #27792](https://github.com/ggml-org/llama.cpp/issues/27792)

2. **MTP 推测解码崩溃和设备丢失**
   - 多份报告涉及 CUDA、Vulkan、SYCL 和较旧 GPU：
     - Qwen 3.8 Flash + MTP 启动断言：[Issue #29811](https://github.com/ggml-org/llama.cpp/issues/29811)
     - 提示词处理期间 RADV 设备丢失：[Issue #27306](https://github.com/ggml-org/llama.cpp/issues/27306)
     - Gemma 4 MTP Vulkan 崩溃：[Issue #24492](https://github.com/ggml-org/llama.cpp/issues/24492)
     - MTP FlashAttention head 维度不匹配：[Issue #29419](https://github.com/ggml-org/llama.cpp/issues/29419)
   - 部分相关 Vulkan 问题已关闭，但从问题的广泛分布来看，在经过充分测试的配置之外，MTP 仍是高风险功能。

3. **Vulkan 特定驱动故障**
   - Adreno 专有驱动可能在没有任何诊断输出的情况下中止运行；其他报告则指出，生成的 SPIR-V 会导致 `vkCreateComputePipelines` 失败。  
     [Issue #29786](https://github.com/ggml-org/llama.cpp/issues/29786) · [Issue #28635](https://github.com/ggml-org/llama.cpp/issues/28635)  
     最近的日志和 loader 兼容性工作可能有助于诊断，但尚不能构成完整的驱动修复。

4. **多 GPU/张量切分正确性**
   - 有报告称，当层分布在多块 GPU 上时，MTP 会使提示词处理速度大约减半；另一个问题则报告了 CUDA 切分轴断言。  
     [Issue #27428](https://github.com/ggml-org/llama.cpp/issues/27428) · [Issue #26902](https://github.com/ggml-org/llama.cpp/issues/26902)

5. **服务端 API 与解析**
   - 无效 embedding 请求现在会正确返回 HTTP 400，这是一个正向的 API 行为变更。  
     [发布版本 b11337](https://github.com/ggml-org/llama.cpp/releases/tag/b11337) · [PR #29060](https://github.com/ggml-org/llama.cpp/pull/29060)
   - 一个 `peg-native` JSON-schema 解析问题已关闭，同时正在修正 Ling 3.0 对 JSON-schema 响应格式的处理。  
     [Issue #27279](https://github.com/ggml-org/llama.cpp/issues/27279) · [PR #29813](https://github.com/ggml-org/llama.cpp/pull/29813)

6. **Metal 与内存管理**
   - 有报告称，更新后在较大的默认上下文大小下运行 Gemma 4 31B 时，Metal 会发生 OOM。  
     [Issue #29521](https://github.com/ggml-org/llama.cpp/issues/29521)
   - 一个 RPC/Metal 问题报告称，在默认 mmap 加载方式下，主节点仍会保留完整模型，限制了切分模型的实际内存利用率。  
     [Issue #27667](https://github.com/ggml-org/llama.cpp/issues/27667)

## 6. 对应用开发者的意义

- **将 MTP 和其他推测解码功能视为需显式启用且依赖后端的能力。** 应针对每种 GPU 架构、Vulkan 驱动、张量切分方式和模型系列分别进行验证；当正确性和稳定性比吞吐量更重要时，应禁用这些功能。
- **生产部署应固定并记录 llama.cpp 的确切构建版本。** 发布流更新非常频繁，后端行为变化迅速。最新构建包含的修复可能尚未存在于应用当前使用的构建中。
- **在网关/服务端边界显式测试无效请求。** 对格式错误的输入，embedding 请求现在会返回 HTTP 400，这比静默接受无效工作负载更合理。
- **模型下载应考虑附属资源。** 待合入的服务端工作会将 `mmproj`、imatrix、draft model 等文件视为独立缓存的附属资源，而不再假定只需要主 GGUF 文件。  
  [PR #28405](https://github.com/ggml-org/llama.cpp/pull/28405) · [PR #29583](https://github.com/ggml-org/llama.cpp/pull/29583)
- **使用结构化输出解析器，并针对不同后端进行测试。** 聊天行为和 schema 约束仍在持续演进，尤其是 Ling、PEG-native 和提供商特定格式。  
  [PR #29813](https://github.com/ggml-org/llama.cpp/pull/29813) · [PR #29876](https://github.com/ggml-org/llama.cpp/pull/29876)
- **大上下文部署应监控内存余量**，尤其是 Metal、RPC 切分模型和主机卸载 MoE 配置。近期工作旨在降低缓冲区分配复杂度和专家权重传输成本，但这些开放问题表明，相关路径仍需针对具体工作负载进行验证。

---

</details>

<details>
<summary><strong>Ollama</strong> — <a href="https://github.com/ollama/ollama">ollama/ollama</a></summary>

# Ollama 摘要 — 2026-10-03

## 1. 今日重点

过去 24 小时内，Ollama 没有发布新版本，但有多个以基础设施为重点的变更正在推进。最重要的工作集中在 Apple MLX 执行、工具调用流式传输正确性、模型选择以及 API 一致性方面；此外，用户还报告了严重的 MLX 内存/利用率回退，以及云模型、视觉模型和 GPU 检测问题。

当前逐渐显现的主题是：本地推理能力日趋成熟，尤其是在 Mac 上表现突出，但模型驻留、并行处理、工具调用解析和硬件兼容性等问题仍持续存在。

## 2. 发布与破坏性变更

过去 24 小时内没有发布新的 GitHub release。

以下未发布变更可能与使用相关：

- **MLX 依赖更新：**一个已开放的版本升级变更将更新内置的 MLX revision。在采用包含此变更的未来构建版本之前，请先检查兼容性和 release notes。[PR #18720](https://github.com/ollama/ollama/pull/18720)
- **模型运行器自动选择：**一个已开放的变更允许 `show` 请求使用平台默认运行器，预计 `ollama run` 和 `ollama launch` 也会采用此行为。因此，当旧版本安装的本地模型标签如今映射到多个运行器变体时，这些模型可能会被迁移或重新拉取。[PR #18634](https://github.com/ollama/ollama/pull/18634)
- **JSON schema 顺序修复：**一个已开放的补丁在将结构化输出 schema 转发到 `llama-server` 时保留 JSON 属性顺序，避免属性被按字母顺序重排而影响模型行为。[PR #18721](https://github.com/ollama/ollama/pull/18721)
- **工具 schema 一致性：**一个已开放的补丁修改了工具参数的 TypeScript 渲染方式，使字符串 enum 在 gpt-oss/Harmony template 中呈现为 TypeScript 字面量联合类型，而不是不受限制的 `string` 值。[PR #18745](https://github.com/ollama/ollama/pull/18745)

## 3. 新模型与硬件支持

- **MLX 中的 Granite 支持：**一个已开放的 PR 为实验模型和 MLX runner 增加了对 dense `GraniteForCausalLM` 的支持，目标模型为 Granite 4.1/4.2 系列。[PR #17972](https://github.com/ollama/ollama/pull/17972)
- **Strands Decider 支持：**两个已开放的变更增加了对 Strands Decider 的支持，并重构了 MLX 的决策准备与读取逻辑，使串行和批量评分能够共享模型内部逻辑。[PR #18748](https://github.com/ollama/ollama/pull/18748)、[PR #18755](https://github.com/ollama/ollama/pull/18755)
- **决策模型验证：**一个拟议的测试套件新增了外部 JSONL 语料库、质量评分、并发请求、视觉覆盖范围以及 System One 定时基准测试。[PR #18746](https://github.com/ollama/ollama/pull/18746)
- **社区集成：**拟议的新增集成包括 CORTEX、AgentBridge 和 Talos，进一步扩展围绕 Ollama 构建的 agent 与工具生态。[PR #18749](https://github.com/ollama/ollama/pull/18749)、[PR #18693](https://github.com/ollama/ollama/pull/18693)、[PR #18093](https://github.com/ollama/ollama/pull/18093)

过去 24 小时内没有确认合入任何有关 CUDA、ROCm、Metal、CPU 或量化格式支持的变更。

## 4. 性能与优化

- **MLX 决策推理：**正在进行的工作将模型准备和读取逻辑与 forward pass 分离，目标是避免在串行和批量评分中重复实现特定于架构的逻辑。[PR #18755](https://github.com/ollama/ollama/pull/18755)
- **结构化输出一致性：**保留 schema 属性顺序可能提升模型对结构化工具定义的遵循程度，并减少属性重排导致的意外行为。[PR #18721](https://github.com/ollama/ollama/pull/18721)
- **Nimble/Qwen 的并行处理问题：**据报告，在 NVIDIA A100 上使用 `OLLAMA_NUM_PARALLEL=8` 部署时，由于系统未识别 `qwen35` 架构支持并行请求，实际被强制降为 `-np 1`。相关报告涉及 48 个请求和约 1,000-token 的工作负载。[Issue #18750](https://github.com/ollama/ollama/issues/18750)
- **MLX 驻留回退：**有用户报告，在 macOS 27 上，模型权重会在每次请求结束约两秒后变为 pageable；在内存压力下，这可能导致压缩、交换以及下一次请求时重新分页。[Issue #18744](https://github.com/ollama/ollama/issues/18744)
- **MLX GPU 利用率回退：**据报告，在 M4 Pro 48 GB 上，Qwen 3.8 MXFP8 27B 模型在 Ollama 0.40.0 下的表现不及 0.35.1-rc2，且报告的 GPU 利用率更低。[Issue #18754](https://github.com/ollama/ollama/issues/18754)
- **ROCm 模型驱逐：**有报告指出，模型驱逐逻辑忽略了部分可用统一 VRAM，导致仍有可用容量时模型却被移除。[Issue #18756](https://github.com/ollama/ollama/issues/18756)

## 5. 稳定性与回退问题

以下按可能造成的运维影响排序：

1. **云模型可用性——高严重性，用户报告：**一名 Pro 订阅用户报告称，包括 GLM、Kimi、Qwen 和 DeepSeek 在内的多个云模型失败率约为 95%。该报告尚未得到独立确认，但考虑到影响范围和用户反馈强度，值得持续关注。[Issue #15453](https://github.com/ollama/ollama/issues/15453)
2. **工具调用流式传输正确性——高功能影响：**当流式数据块边界落在工具调用标签内部时，`DeepSeek3Parser`、`CogitoParser` 和 `LFM2Parser` 可能将不完整的工具调用开始标签作为普通内容输出。这会将原本有效的工具调用转换为原始 assistant 文本。目前已有一个针对 Cogito 解析的定向修复。[Issue #18681](https://github.com/ollama/ollama/issues/18681)、[PR #18759](https://github.com/ollama/ollama/pull/18759)
3. **MLX 模型驻留和利用率——中高影响：**多份独立报告提到，模型权重会在请求结束后很快被释放，并且新版 Ollama 的 GPU 利用率有所下降。在内存压力下，这些问题可能增加延迟、交换和能耗。[Issue #18744](https://github.com/ollama/ollama/issues/18744)、[Issue #18754](https://github.com/ollama/ollama/issues/18754)
4. **并行请求容量回退——中等影响：**使用 Qwen 3.5 的 Nimble 部署可能在未明确报错的情况下，从请求的 8 路并行回退到单路处理，显著降低吞吐量。[Issue #18750](https://github.com/ollama/ollama/issues/18750)
5. **视觉模型回退——中等影响：**有报告称，`llama3.2-vision` 在最近的 Ollama 更新后停止工作。[Issue #16490](https://github.com/ollama/ollama/issues/16490)
6. **Intel Vulkan 检测——中等影响：**据报告，Windows 上的 Ollama 0.34.4 无法通过 Vulkan backend 暴露 Intel UHD 设备，尽管 Vulkan 本身能够检测到该 GPU。[Issue #18672](https://github.com/ollama/ollama/issues/18672)
7. **孤立模型 blob——低至中等影响：**一份 macOS 报告发现了仍处于使用状态但没有关联模型的 blob，其中一个对象大小达到 21 GB，说明垃圾回收机制可能无法回收所有未引用的模型内容。该 issue 已标记为 closed，但在升级或拉取失败后，仍建议进行运维审计。[Issue #18595](https://github.com/ollama/ollama/issues/18595)

## 6. 对应用开发者的影响

- **不要假设工具调用不受数据块边界影响。**使用流式响应的应用应验证工具调用结构，并考虑对不完整标签进行缓冲或重新解析，直到正式版本包含相应修复。[Issue #18681](https://github.com/ollama/ollama/issues/18681)
- **明确测试结构化输出和工具 schema。**Enum 约束和属性顺序可能显著影响模型行为；应为包含受限值的工具参数添加回归测试。[PR #18745](https://github.com/ollama/ollama/pull/18745)、[PR #18721](https://github.com/ollama/ollama/pull/18721)
- **在生产环境中验证实际并行度和驻留状态。**应比较调度器日志、实际生效的 `-np`、延迟、GPU 利用率和内存行为，而不是只依赖 `OLLAMA_NUM_PARALLEL`。[Issue #18750](https://github.com/ollama/ollama/issues/18750)
- **Mac 推理部署应固定版本。**鉴于 0.35.1-rc2 与 0.40.0 之间已有关于 MLX 利用率和驻留行为变化的报告，请使用 canary 测试，并为延迟敏感型工作负载保留一个已知正常版本。[Issue #18754](https://github.com/ollama/ollama/issues/18754)
- **将本地模型标签视为可能对应多个运行器的 artifact。**依赖特定 backend 的应用应在升级后验证实际选择的运行器，尤其是受 manifest list 变更影响的旧模型安装。[PR #18634](https://github.com/ollama/ollama/pull/18634)
- **为云端降级和 fallback 做好规划。**如果云模型属于产品链路的一部分，应保留健康检查和本地模型 fallback 策略，不要假设 HTTP 请求成功就意味着模型可用。[Issue #15453](https://github.com/ollama/ollama/issues/15453)

</details>

<details>
<summary><strong>LiteLLM</strong> — <a href="https://github.com/BerriAI/litellm">BerriAI/litellm</a></summary>

# LiteLLM 摘要 — 2026-10-03

## 1. 今日要点

LiteLLM 发布了 **v1.105.0-dev.2**，并更新了 Docker 镜像签名验证机制，统一使用 cosign 密钥。当前的开发重点是提升网关可观测性、费用归因、流式用量统计、服务商兼容性和路由行为，尤其关注 Responses API、Bedrock、Azure AI 和智能体工作负载。目前仍有多项正确性和兼容性修复处于开放 PR 阶段，因此生产环境采用前应以验证结果和合并状态为准。

## 2. 发布与破坏性变更

- **v1.105.0-dev.2 已发布**
  - 所有 LiteLLM Docker 镜像均使用 [cosign](https://docs.sigstore.dev/cosign/overview/) 签名。
  - 发布版本使用提交 [`0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0) 中引入的密钥。
  - 运维人员可以在部署前验证镜像真实性。详见 [v1.105.0-dev.2 发布说明](https://github.com/BerriAI/litellm/releases/tag/v1.105.0-dev.2)。

- **Proxy extras 包版本更新**
  - `litellm-proxy-extras` 正在 main/release 分支上从 **0.4.104 升级至 0.4.105**，以反映 0.4.104 发布后包含的修复。
  - 在升级 LiteLLM 发布候选版本时，请同步升级部署工具：[PR #44234](https://github.com/BerriAI/litellm/pull/44234) 和 [PR #44235](https://github.com/BerriAI/litellm/pull/44235)。

在所提供的数据中，尚未发现已确认的破坏性 API 变更。以下变更仍在进行中，不应视为已发布的行为。

## 3. 新模型与硬件支持

- **为 GPT-5.6+ 原生提供 Bedrock Chat Completions**
  - [PR #40775](https://github.com/BerriAI/litellm/pull/40775) 提议原生提供 Bedrock GPT-5.6/6/6.1 Chat Completions，而不是通过 Converse 转换后再转换回来。
  - 目标是降低延迟，并避免在转换过程中丢失参数。该 PR 通过 `chat_completions` 保留了 GPT-OSS 和 Grok 的显式选择加入行为。

- **统一的 Decisions API**
  - [PR #44236](https://github.com/BerriAI/litellm/pull/44236) 新增了 `litellm.adecisions` 和 `litellm.decisions` SDK 调用，并采用与 Jev 兼容的 schema。
  - 主要面向 Perplexity 的 Decisions API 等服务商，为类型化决策模型提供统一接口。
  - [PR #44043](https://github.com/BerriAI/litellm/pull/44043) 还新增了对应的 **System One** playground 标签页。

- **Responses 后端的工具搜索兼容性**
  - [PR #44222](https://github.com/BerriAI/litellm/pull/44222) 将客户端级别的 `tool_search` 降级为普通函数，以支持尚未实现该功能的托管 vLLM 和其他 OpenAI 兼容 Responses 后端。
  - 此举旨在避免通过 vLLM 重放工具搜索项时出现 400 错误。

- **xAI 语音转录目录更新**
  - [PR #44237](https://github.com/BerriAI/litellm/pull/44237) 为 `xai/grok-voice-transcribe-1.0` 添加了弃用日期；该 PR 未显示文本模型价格变更。

本期摘要数据中没有报告新的 CUDA、ROCm、Metal、CPU、内核或量化支持。

## 4. 性能与优化

- **提示缓存资格检查避免对完整对话进行分词**
  - [PR #44221](https://github.com/BerriAI/litellm/pull/44221) 旨在减少提示缓存资格检查期间不必要的分词操作。
  - 该优化尤其适用于长上下文工作负载和 Anthropic 提示缓存，因为资格检查可能会增加原本可以避免的 CPU 开销。

- **更准确的 OpenTelemetry 数据库 span**
  - [PR #44148](https://github.com/BerriAI/litellm/pull/44148) 不再为命中内存中的热缓存、且未实际访问数据库的请求报告 PostgreSQL service span。
  - [PR #44240](https://github.com/BerriAI/litellm/pull/44240) 按操作和表改进 span 命名，并将埋点扩展到费用刷新、每日费用 upsert 和费用日志插入。
  - [PR #44150](https://github.com/BerriAI/litellm/pull/44150) 改进了缓存 span 的结构，将 Redis span 嵌套在响应缓存读取和写入之下，并按用途命名 service span。
  - 这些变更应能提高链路追踪的信噪比，使延迟调查更具代表性，但目前尚未确认已合并。

- **更准确地归因 auto-router 节省的费用**
  - [PR #44226](https://github.com/BerriAI/litellm/pull/44226) 处理了禁用费用日志或省略 session ID 时每个 router 节省费用缺失的问题。
  - 改进后的基线比较和归因逻辑应能提高 auto-router 成本节省数据在 FinOps 报表中的可靠性。

- **改进 Azure AI FLUX.2 的图像编辑定价**
  - [PR #43216](https://github.com/BerriAI/litellm/pull/43216) 提议按百万像素为 FLUX.2 参考图像计费，并处理重试上传和旧版定价覆盖逻辑。
  - 这主要是计费和成本核算方面的改进，而不是吞吐量优化。

## 5. 稳定性与回归问题

以下问题大致按可能造成的运维影响排序。

### 高影响

- **自定义模型的费用可能被记录为零**
  - [Issue #35691](https://github.com/BerriAI/litellm/issues/35691)：未包含在 LiteLLM 内置成本映射中的自定义模型，即使响应侧的成本估算正确，也可能显示 `cost_breakdown.total_cost = 0`。
  - **影响：**仪表盘、预算执行和财务报告不准确。
  - **修复状态：**所提供的数据中未显示有关联的修复。

- **后台健康检查错误可能影响无关的部署**
  - [Issue #44154](https://github.com/BerriAI/litellm/issues/44154)：据报告，健康检查结果会被归因到共享同一 `litellm_params.model` 的每个部署。
  - **影响：**错误地将部署标记为不健康，导致错误的故障转移行为和运维混乱。
  - **修复状态：**开放；未发现关联的修复 PR。

- **据报告，Responses 和 Messages 路由可绕过工具策略防护**
  - [Issue #30732](https://github.com/BerriAI/litellm/issues/30732)，现已关闭：该报告称，工具权限和黑名单策略未一致地应用于 `/v1/responses` 和 `/v1/messages`。
  - **影响：**可能导致未授权的工具执行或策略绕过。
  - 由于该 issue 已关闭，运维人员应确认修复已存在于实际部署版本中，并分别测试所有智能体路由。

### 中等影响

- **请求详情中的提示缓存统计具有误导性**
  - [Issue #32045](https://github.com/BerriAI/litellm/issues/32045)：服务商侧的提示缓存命中可能显示为 `Cache Hit: False`，且缓存 token 的费用详情可能被隐藏。
  - **影响：**导致缓存效果分析和费用解读不准确。

- **Anthropic Messages 流式响应会丢失网页搜索结果**
  - [Issue #35333](https://github.com/BerriAI/litellm/issues/35333)：在重新封装流时，网页搜索拦截逻辑可能会丢失 `web_search_tool_result` 块。
  - **影响：**智能体响应不完整，搜索工作流中断。
  - **修复状态：**开放；未列出修复 PR。

- **通过 LiteLLM 的 `/models` 端点发现 Codex 模型可能失败**
  - [Issue #36854](https://github.com/BerriAI/litellm/issues/36854)：Codex CLI 需要 `{"models": [...]}`，而 LiteLLM 返回标准的 OpenAI 风格 `{"data": [...]}`。
  - **影响：**OpenAI Codex 客户端可能无法发现模型。
  - **缓解措施：**在问题解决前，使用能够输出预期响应格式的兼容路由或网关配置。

- **自定义定价可能导致服务层级少计费**
  - [Issue #43868](https://github.com/BerriAI/litellm/issues/43868)，已关闭：据报告，返回 `service_tier="ultrafast"` 的自定义定价 OpenAI 部署会按标准费率计费。
  - **影响：**在未明确配置层级特定定价时，可能导致大量计费少计。

- **无 usage 信息的流式请求可能被记录为零 token 和零费用**
  - [PR #44230](https://github.com/BerriAI/litellm/pull/44230) 提议为不返回 usage 的流恢复 token 估算。
  - **影响：**费用记录缺失或不准确；拟议修复目前仍处于开放状态。

### 较低影响或特定环境影响

- **Stdio MCP 服务可能无法公开可用工具**
  - [Issue #15560](https://github.com/BerriAI/litellm/issues/15560)，已关闭：据报告，通过 UI 创建的 stdio MCP 服务未显示任何可用工具，而 SSE/HTTP 服务可以正常工作。
  - 请验证已部署的修复，以及客户端与传输方式的组合。

- **从 Windows Microsoft Store 安装 Python 可能超出 `MAX_PATH`**
  - [Issue #43851](https://github.com/BerriAI/litellm/issues/43851)，已关闭：在 Windows 限制路径长度的情况下，LiteLLM 仍可能安装失败。
  - 请使用更短的虚拟环境路径，或启用 Windows 长路径支持。

- **AnyIO 依赖可能仍存在等待锁死锁的风险**
  - [Issue #44048](https://github.com/BerriAI/litellm/issues/44048)：尽管上游存在已知的锁死锁问题，LiteLLM 仍未声明 AnyIO 的最低版本。
  - 在添加依赖版本约束之前，应在生产环境中固定或验证 AnyIO 版本。

## 6. 对应用开发人员的意义

- **固定并验证发布版本。** 对于 Docker 部署，请验证 v1.105 镜像签名，并固定镜像 digest 或标签。将 `.dev.2` 视为开发版本，在投入生产前完成验证。
- **明确测试自定义模型计费。** 对于未包含在内置成本映射中的模型，请提供模型成本元数据或验证费用日志。为自定义定价和分层定价增加对账检查。
- **验证每个路由上的智能体工具策略。** 分别测试 `/v1/chat/completions`、`/v1/responses` 和 `/v1/messages`；不要假设某个路由上生效的防护策略在其他路由上也同样有效。
- **为兼容性限制做好预案。** Codex 模型发现和流式网页搜索行为可能需要网关侧的变通方案。针对智能体框架使用服务商特定的集成测试。
- **将可观测性变更视为分阶段改进。** 拟议中的 OTel 和 auto-router 变更应能提高遥测质量，但 trace 名称、span 嵌套关系和节省费用归因可能会影响仪表盘和告警。
- **确保自定义定价和回退配置具有确定性。** 共享钱包聚合 economy-model 回退机制目前仍是 [Issue #43652](https://github.com/BerriAI/litellm/issues/43652) 中的功能请求，因此需要自动回退到 economy 模型的团队应继续在外部或部署特定的路由逻辑中实现该功能。

---

</details>

<details>
<summary><strong>Unsloth</strong> — <a href="https://github.com/unslothai/unsloth">unslothai/unsloth</a></summary>

# Unsloth Digest — 2026-10-03

## 1. 今日要点

过去 24 小时内没有发布带标签的版本。开发工作主要集中在 Unsloth Studio：图像/视频内核优化、长上下文租约处理、模型管理用户体验，以及 NPU 导出支持。此外，还出现了多项重要报告，涉及 VRAM 利用效率、vLLM LoRA 不兼容，以及严重的 tensor-split 吞吐量回归问题。

## 2. 发布与破坏性变更

在所提供的数据中，未发现新版本或已宣布的 API/配置迁移。

## 3. 新模型与硬件支持

- **面向 AMD Ryzen AI NPU 的 FastFlowLM Q4NX 导出：** 一个开放的 PR 提出将微调后的模型或 GGUF checkpoint（包括 Qwen3、Llama、Gemma、LFM2 和 Phi-4）转换为 Q4NX，以便在 Ryzen AI 等 XDNA 2 NPU 硬件上运行。该 PR 尚未合并。  
  [PR #12541](https://github.com/unslothai/unsloth/pull/12541)

- **请求支持 Qwen3-TTS 微调：** 社区希望 Unsloth 支持 Qwen3-TTS 的微调。该 issue 当前开放，标记为 `help wanted` 和 `good first issue`，但目前没有实现进展报告。  
  [Issue #3951](https://github.com/unslothai/unsloth/issues/3951)

- **请求为 Index-Translate 添加动态 GGUF 量化：** 该请求希望为 2B、9B 和 35B-A3B 翻译模型系列提供相关支持。  
  [Issue #12553](https://github.com/unslothai/unsloth/issues/12553)

- **模型与硬件放置问题正在修复：** 一个开放的 PR 旨在解决 `--mmproj-device CUDA1` 被拒绝的问题。该问题会在 VLM 保存的 GPU 选择结果导致仅使用单卡放置时发生，尤其影响双 GPU 和视觉语言部署。  
  [PR #12505](https://github.com/unslothai/unsloth/pull/12505)

## 4. 性能与优化

- **正在调查 tensor-split 推理回归：** 一个开放报告称，在两套 RTX 5070 Ti 系统上运行 tensor split 时，最近版本的 Unsloth 速度约为 **48 tokens/s**，而早期版本和官方 `ggml-org` 二进制文件可达到 **115–? tokens/s**。疑似原因是 `max_cuda_graphs = 64`；报告称最高减速达到 **2.9×**。  
  [Issue #12468](https://github.com/unslothai/unsloth/issues/12468)

- **T4 图像生成内核优化：** 一个开放的 PR 添加了融合 FP16 Wan block。对于 Wan2.2-TI2V-5B，在 **1280×704、25 帧、20 步、CFG 5** 的配置下，报告称每步耗时从 **11.7 秒缩短至 10.0 秒**，逐渐接近 ComfyUI **8.8 秒**的基准。  
  [PR #12531](https://github.com/unslothai/unsloth/pull/12531)

- **Qwen-Image INT8 放置改进：** 一个开放的 PR 将融合 INT8 GEMM 的使用范围扩展到整个 denoiser 固定在 GPU 上的场景。据报告，在 16 GB VRAM 预算下，A100 上可达到 **241 ms/step**。配套改动还会在请求过大后恢复 torchao 权重，以避免随后出现设备不匹配。  
  [PR #12524](https://github.com/unslothai/unsloth/pull/12524) · [PR #12526](https://github.com/unslothai/unsloth/pull/12526)

- **适用于小型主机的图像生成路径：** 一个开放的 PR 面向主机内存有限的 T4 级系统，通过预取流式文本编码器并融合 INT8 反量化来降低资源需求。据报告，FLUX.1-schnell 的每步耗时从 **5.19 秒缩短至 4.49 秒**，且输出像素完全一致。  
  [PR #12532](https://github.com/unslothai/unsloth/pull/12532)

- **MiniMax-H3 matmul 路径：** 一个开放的 PR 默认在 SM80+ 硬件上选择 BF16 cuBLAS matmul，而不是 INT8 MMQ。据报告，每步速度提升 **1.2×–2.3×**，整体表现更接近 FP32 参考实现。  
  [PR #12527](https://github.com/unslothai/unsloth/pull/12527)

- **长 prefill 租约续期：** 一个开放的 PR 会在 llama-server 持续推进 `prompt_progress` 时，续期 Studio 的聊天生成租约，目标是解决长时间处理 prompt 时生成被提前终止的问题。  
  [PR #12523](https://github.com/unslothai/unsloth/pull/12523)

- **Studio 启动预算回归：** 一个开放的 PR 会在托管引擎变更后重新设计启动预算的测量方式。据报告，前端 bundle 检查超出预算，当前为 **1,800.5 KB，而预算是 1,796.9 KB**。  
  [PR #12560](https://github.com/unslothai/unsloth/pull/12560)

## 5. 稳定性与回归问题

以下按可能的运维影响排序：

1. **严重 — tensor-split 吞吐量回归：** 最近版本的 Unsloth 在双 GPU tensor 模式下可能慢约 **2.9×**。这可能使多 GPU 推理服务的容量规划和路由假设失效。所提供的数据中未发现对应的修复 PR。  
   [Issue #12468](https://github.com/unslothai/unsloth/issues/12468)

2. **高 — 微调超出预期 VRAM 并导致 OOM：** 一个受到大量讨论的开放报告称，训练过程消耗的 VRAM 明显高于宣传值，即使标称容量看起来足够，也会导致更大模型无法微调。该 issue 已有 **23 条评论**，是当前讨论最活跃的问题。  
   [Issue #4504](https://github.com/unslothai/unsloth/issues/4504)

3. **高 — Qwen3-VL LoRA adapter 无法加载到 vLLM：** 据报告，使用 `Qwen3-VL-8B-Instruct` 生成的 LoRA adapter 即使遵循官方 Unsloth 指南，在 vLLM 中加载时仍会失败。这导致微调与生产服务之间出现 adapter 可移植性缺口。  
   [Issue #3560](https://github.com/unslothai/unsloth/issues/3560)

4. **高 — 长上下文生成可能被错误终止：** 即使 llama-server 仍在进行 prefill，Studio 也会在租约过期后报告 **“Generation stopped making progress”**。相关 PR 尚未合并，目标是修复租约续期逻辑。  
   [Issue #12518](https://github.com/unslothai/unsloth/issues/12518) · [PR #12523](https://github.com/unslothai/unsloth/pull/12523)

5. **高 — WSL 中报告存在未使用的 VRAM，同时发生 OOM：** 据报告，在使用 DeepSeek-R1-Distill-Llama-8B 进行微调时，系统会在约 **8 GB/24 GB VRAM 似乎未使用**的情况下触发 CUDA OOM，暗示可能存在内存碎片、分配行为异常或未被统计的内存压力。  
   [Issue #1797](https://github.com/unslothai/unsloth/issues/1797)

6. **中等 — Qwen3.8/Qwen3.5 系列 4-bit checkpoint 失败：** 报告涉及将打包的 4-bit 权重传入 `linear`、缺少 `quant_state`，以及 Windows/ROCm 和 NVIDIA 系统上的 shape 错误。相关 issue 现已关闭，分析认为原因既包括临时的 bitsandbytes 兼容性补丁，也包括需要重新生成的格式错误的预量化 checkpoint。  
   [Issue #9867](https://github.com/unslothai/unsloth/issues/9867) · [Issue #10276](https://github.com/unslothai/unsloth/issues/10276) · [Issue #10017](https://github.com/unslothai/unsloth/issues/10017)

7. **中等 — Gemma-4 LoRA 训练未改变输出：** 报告称训练 loss 会下降，但生成输出保持不变。该 issue 已关闭，且提供的数据不足以确定根本原因；用户应检查 adapter 是否正确应用、目标模块配置以及训练后模型加载过程。  
   [Issue #5355](https://github.com/unslothai/unsloth/issues/5355)

8. **中等 — Studio 多 GPU 训练未使用所有选定显卡：** Studio 用户报告，即使选择了多张 GPU，LoRA 微调仍只在一张 GPU 上运行。目前已有一个开放的功能请求，用于跟踪原生多 GPU 支持的进展。  
   [Issue #5764](https://github.com/unslothai/unsloth/issues/5764)

9. **中等 — VLM adapter 保存/加载失败：** 一个新报告涉及从 VLM 工作流派生出的纯文本 Gemma 3 变体在保存和加载时失败。  
   [Issue #12554](https://github.com/unslothai/unsloth/issues/12554)

10. **中等 — 长上下文 UI 卡顿与生成进度问题：** 一个新报告称，Studio/Desktop 中的长上下文聊天已开始出现卡顿。此外，issue #12518 还报告了错误的进度终止问题。  
    [Issue #12552](https://github.com/unslothai/unsloth/issues/12552) · [Issue #12518](https://github.com/unslothai/unsloth/issues/12518)

11. **较低 — Studio 网络与状态同步：** 开放报告包括无法按预期绑定到 `0.0.0.0`，以及多个局域网用户访问同一本地服务器时模型同步错误。  
    [Issue #11187](https://github.com/unslothai/unsloth/issues/11187) · [Issue #12365](https://github.com/unslothai/unsloth/issues/12365)

12. **较低 — Agent/tool-call 可靠性与安全规范：** 有报告称更新后 tool call 和项目会随机失败；该 issue 已关闭。另一个已关闭 issue 处理了在 FP8/FP4 导出自动安装 `llm-compressor` 前必须征得用户同意的问题，以减少意外改变环境的风险。  
    [Issue #12435](https://github.com/unslothai/unsloth/issues/12435) · [Issue #8904](https://github.com/unslothai/unsloth/issues/8904)

## 6. 对应用开发者的影响

- **立即锁定版本并对推理构建进行基准测试。** 最近的 tensor-split 构建可能存在严重的吞吐量回归；部署多 GPU 路径前，应将当前 Unsloth 二进制文件与已知正常版本及官方 `ggml-org` 构建进行比较。
- **不要将宣传的微调内存视为硬性保证。** 应使用目标序列长度、batch size、量化方法和模型架构验证实际峰值分配。保留保守的余量，并同时监控主机 RAM 和 GPU VRAM。
- **测试从微调到服务的完整链路。** Qwen3-VL LoRA adapter 可能能够成功微调，但在 vLLM 中加载时失败。请在 CI 中验证 adapter 转换、模型架构元数据以及推理引擎兼容性。
- **将 Studio 当前的 agent 功能视为持续演进中。** 最近的问题涉及 tool call、skills、生成租约和多用户模型状态。对于生产环境中的 agent，建议使用 API 层面的健康检查和明确的生成进度监控，而不是仅依赖 UI 状态。
- **谨慎设置长上下文超时。** prefill 期间的 keepalive 和租约行为仍在积极修复中；应使用符合服务引擎已验证上下文限制的工作负载，并对 `prompt_progress` 或同类后端遥测设置告警。
- **如果你的工作负载使用图像/视频生成，请关注 Studio 的优化进展。** 当前开放的内核和放置相关改动旨在改善 T4/A100 以及小 VRAM 系统上的表现，但尚未合并。评估这些改动时，应与当前构建进行性能比较，同时验证输出正确性。

---

</details>

---
*本日报由 [agents-radar](https://github.com/dboeter/daily-diff) 自动生成。*