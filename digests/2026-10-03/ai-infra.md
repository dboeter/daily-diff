# AI Infrastructure Digest 2026-10-03

> Generated: 2026-10-02 20:23 UTC | Projects covered: 6

- [vLLM](https://github.com/vllm-project/vllm)
- [SGLang](https://github.com/sgl-project/sglang)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://github.com/ollama/ollama)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Unsloth](https://github.com/unslothai/unsloth)

---

## Cross-Project Comparison

# Cross-Project AI Infrastructure Comparison — 2026-10-03

## 1. Ecosystem Overview

The ecosystem is advancing rapidly across model enablement, low-precision inference, speculative decoding, and distributed serving, with **SGLang and llama.cpp shipping the largest batches of changes**. Activity remains heavily concentrated around newer MoE and multimodal architectures—especially DeepSeek, Qwen, GLM, and Blackwell—while model-hardware-feature combinations are still stabilizing. Reliability is the central constraint: silent KV-cache corruption, scheduler stalls, streaming tool-call corruption, memory regressions, and multi-GPU performance regressions appear across projects. The application layer is also consolidating around gateways and agent workflows, making schema fidelity, policy enforcement, usage accounting, and streaming correctness increasingly important operational concerns.

## 2. Activity Comparison

> Counts represent unique issues and PRs explicitly referenced in the supplied digests, not each repository’s complete daily activity. Issues include RFCs and mix open, closed, and fixed reports; PRs include both open and landed work.

| Project | Referenced issues | Referenced PRs | Release status | Dominant activity |
|---|---:|---:|---|---|
| **vLLM** | 14 | 12 | **No release** | GLM speculative decoding, ROCm/Blackwell, KV-cache correctness, distributed execution |
| **SGLang** | 17 | 15 | **Released v0.5.21**; 779 merged PRs in release | DeepSeek enablement, MoE kernels, HiCache, PD transfers, Blackwell/AMD |
| **llama.cpp** | 12 | 22 | **Multiple builds released**, including b11337–b11351 | Backend robustness, Hexagon, MTP stability, memory allocation |
| **Ollama** | 9 | 12 | **No release** | MLX maturity, model-runner selection, tool streaming, local-cloud parity |
| **LiteLLM** | 11 | 14 | **Released v1.105.0-dev.2** | Gateway observability, spend attribution, provider/API compatibility |
| **Unsloth** | 18 | 9 | **No release** | Studio, fine-tuning portability, image/video kernels, multi-GPU regressions |
| **Unsloth total referenced activity** | **81** | **84** | **3 projects shipped releases; 3 did not** | Broad movement across every layer |

**Interpretation:** Unsloth had the most issue references, largely reflecting training and Studio integration pain, while llama.cpp had the most PR references and the most visible shipping cadence. SGLang’s release volume materially exceeds what can be inferred from the individual references: v0.5.21 alone merged 779 PRs.

## 3. Model Support Race

### Newly shipped or integrated support

- **SGLang**
  - Shipped documentation/cookbook support for **DeepSeek-V4.1 Flash** and **GigaChat 3.5** in v0.5.21.
  - Continued DeepSeek-V4 roadmap work spanning prefill, tensor parallelism, routing, and mHC.
  - Recent build work also added or corrected experimental Qwen4 and GLM-5.3-Flash paths.

- **llama.cpp**
  - Shipped **Qwen4 experimental fixes**.
  - Shipped Hexagon HTP support for **Q2_K and Q3_K**, plus DMA copy/concatenate improvements.
  - Fixed CUDA FlashAttention on Volta.
  - GLM-5.3-Flash support was merged, while K2 Horizon dense, MoVA, and ETET/MiniCPM5-style MoE remained in progress.

### Primarily pending support

- **vLLM**
  - Pending DeepSeek-V4 mixed **MXFP4×FP8** support.
  - Pending ROCm/Kimi-K3 MXFP4-to-INT4 conversion and Qwen3/Qwen3.5 fused attention.
  - Proposed GLM-5.2 SM10x and GLM-5.3 speculative optimizations should not yet be treated as available.

- **Ollama**
  - Experimental MLX support for Granite 4.1/4.2 remains open.
  - MLX dependency, runner-selection, and Strands Decider changes are unreleased.
  - Runner auto-selection may cause existing model tags to map to new backend artifacts after deployment.

- **Unsloth**
  - Qwen3-TTS fine-tuning is only requested.
  - AMD Ryzen AI Q4NX export and dynamic GGUF quantization are pending.
  - Most inference performance work is still represented by open PRs.

- **LiteLLM**
  - Focuses more on API and provider abstraction than model kernels. A unified Decisions API, native Bedrock GPT-5.6+ Chat Completions, and Responses-backend tool-search compatibility are pending.

### Leader assessment

**SGLang leads on newly released frontier-model enablement**, particularly DeepSeek-V4.1 and GigaChat 3.5. **llama.cpp leads on breadth of local architectures and low-resource backends**, although some of its newest model work remains experimental. vLLM remains a close frontier-serving competitor, but its most consequential model and hardware support in this snapshot is still open. LiteLLM is ahead in provider/API normalization rather than raw model execution.

## 4. Performance Frontier

| Optimization area | Leading activity |
|---|---|
| **Speculative decoding** | vLLM reports 13.3% GLM-5.3 end-to-end gain and 1.2–1.3× MRV2 kernel improvement, but also has 0% acceptance and MTP failures. SGLang is improving FPM metrics, deterministic sampling, FP8-KV verification, and EPLB interaction. llama.cpp and Unsloth focus on Metal/Vulkan MTP and CUDA-graph behavior. |
| **MoE and quantized kernels** | SGLang leads on Blackwell NVFP4 and AMD MXFP4 enablement, shared-expert fusion, and decode-shaped MoE/MLA tiles. vLLM is pursuing MXFP4×FP8 routing and lossy ROCm MXFP4-to-INT4 conversion. Unsloth is tuning BF16 versus INT8 MMQ and fused image-generation blocks. |
| **KV cache and memory** | vLLM is addressing DeepEP over-allocation, scheduler backpressure, sparse-index corruption, and KV tier admission. SGLang is optimizing HiCache, scheduler cache residency, and DeepSeek-V4’s 128k memory regression. llama.cpp is improving KV-pool bounds and host-offloaded MoE weight residency. |
| **Distributed serving** | SGLang’s NIXL pinned-host staging, EPLB, hierarchical caching, and tensor-parallel roadmap make it the most active project here. vLLM is refining sequence parallelism, FlashInfer all-reduce selection, and weight-load-bound replica activation. |
| **Batching and scheduling** | vLLM is confronting admission stalls and speculative-token scheduling overhead. SGLang is addressing chunked-prefill slot pinning, cache-aware waiting-request residency, and HiCache request-finish work. |
| **Low-resource execution** | llama.cpp and Unsloth are strongest in host offload, KV pooling, RPC/multi-GPU, image generation, and edge backends. Ollama is optimizing MLX decision inference but currently has residency and utilization regressions. |
| **Gateway efficiency** | LiteLLM is reducing tokenization for prompt-cache checks, improving OpenTelemetry cache/DB span accuracy, and refining auto-router savings attribution. |

A key signal is that **performance and correctness are increasingly coupled**. Faster speculative paths can silently stop accepting tokens; fused quantizations can alter expert ordering; optimized cache policies can affect admission; and multi-GPU changes can create severe performance cliffs.

## 5. Layer Positioning

| Project | Primary layer | Differentiation |
|---|---|---|
| **vLLM** | High-throughput model-serving engine | Strong frontier-model serving, batching, speculative decoding, distributed execution, and production scheduler/cache primitives |
| **SGLang** | High-throughput model-serving engine | Rapid release cadence, broad MoE/quantization work, hierarchical caching, disaggregated prefill/decode, and strong Blackwell/AMD direction |
| **llama.cpp** | Local and edge inference runtime | Excellent build/backend portability, GGUF, CPU/Metal/Vulkan/Hexagon coverage, lightweight deployment, and self-contained tooling |
| **Ollama** | Local developer/runtime and model-management layer | Simplified local model UX, emerging MLX maturity, automatic runner selection, and cloud/local model abstraction |
| **LiteLLM** | LLM gateway and SDK | Multi-provider routing, policy enforcement, authentication, observability, caching, budgets, spend attribution, and API normalization |
| **Unsloth** | Fine-tuning and optimized local inference | Efficient training, LoRA/QLoRA workflows, GGUF conversion, and Studio’s image/video generation; increasingly includes llama.cpp-based serving |

These products are complementary rather than direct substitutes. A common architecture is **Unsloth for adapter creation → vLLM or SGLang for production serving → LiteLLM as the governed gateway**. llama.cpp and Ollama are more prominent for local, edge, desktop, and developer-led deployments. However, the current adapter portability gap between Unsloth-produced Qwen3-VL LoRA and vLLM demonstrates that this integration is not yet seamless.

## 6. Trend Signals

### Industry trends

1. **Frontier support is moving faster than production qualification.**  
   New MoE, multimodal, and low-precision checkpoints are being integrated within days, but exact model/backend/quantization combinations still show silent corruption, malformed output, or memory regressions.

2. **Speculative decoding is becoming a first-class serving feature—and a major reliability surface.**  
   Acceptance rate, accepted tokens, draft latency, and feature compatibility must be treated as core production metrics. A healthy server with 0% acceptance is not operationally healthy.

3. **Low-precision formats are fragmenting the stack.**  
   MXFP4, NVFP4, INT4, FP8, compressed tensors, backend-specific weight ordering, and optional lossy conversion complicate checkpoint portability and reproducibility.

4. **Disaggregated and hierarchical serving are advancing, but observability lags.**  
   PD transfer, HiCache, KV tiering, EPLB, replica activation, and scheduler backpressure need request-level tracing rather than coarse engine-health signals.

5. **Agent correctness is moving into infrastructure requirements.**  
   Streaming tool calls can be dropped, merged, emitted as reasoning, or truncated. Structured schemas, route-specific tool policies, and streaming content channels now require dedicated conformance tests.

6. **Gateway governance is as important as model performance.**  
   LiteLLM’s policy-bypass, shared-model health-check, custom-pricing, and zero-cost reports show that routing, security, budgets, and attribution can fail even when inference is healthy.

7. **Local runtimes are improving, but regression testing is indispensable.**  
   Ollama’s MLX residency/utilization issues, llama.cpp’s MTP/device failures, and Unsloth’s 2.9× tensor-split regression make exact build pinning and canary benchmarking mandatory.

### What agent and application developers should watch

- **Pin the entire serving stack:** engine build, model image, GPU backend, quantization kernel, Transformers version, gateway, and adapter format.
- **Add streaming agent conformance tests:** fragmented tool tags, multiple calls, whitespace inside JSON, reasoning-channel leakage, null content, schema enums, and route-specific policy enforcement.
- **Monitor operational metrics beyond liveness:** scheduler backlog, admitted/running requests, speculative acceptance, prompt progress, TTFT, cache residency, memory peaks, and effective parallelism.
- **Treat new model/hardware combinations as a feature matrix.** Test each combination of architecture, GPU generation, backend, quantization, speculative decoder, cache mode, and concurrency.
- **Validate the complete training-to-serving path:** especially LoRA metadata, target modules, checkpoint layout, adapter loading, and dynamic weight synchronization.
- **Reconcile costs at the gateway:** custom-model pricing, stream usage estimation, service tiers, prompt-cache accounting, and auto-router savings can all affect financial reporting.
- **Prefer canary rollouts with known-good fallbacks**, especially for SGLang’s very large release train, llama.cpp’s rapid build stream, and Unsloth’s current multi-GPU instability.

---

## Per-Project Reports

<details>
<summary><strong>vLLM</strong> — <a href="https://github.com/vllm-project/vllm">vllm-project/vllm</a></summary>

# vLLM Digest — 2026-10-03

## 1. Today’s Highlights

vLLM’s activity centered on model-specific inference performance, speculative decoding, and distributed execution: open PRs include a reported **13.3% GLM-5.3 throughput improvement**, **1.2–1.3× speculative-decoding kernel gains**, and a fix for DeepEP v2 buffer over-allocation under sequence parallelism. Reliability remains the main operational concern, with active reports covering Blackwell SM120 compatibility, ROCm sparse-attention KV corruption, scheduler admission stalls, and MTP acceptance rates falling to zero. There were **no new releases in the last 24 hours**; all changes referenced below are open issues or pull requests and should not yet be treated as shipped.

## 2. New Model & Hardware Support

- **MXFP4 × FP8 compressed-tensors support:** An open PR adds routing for `MXFP4xFP8_DYNAMIC` compressed checkpoints, including DeepSeek-V4 MoE support. This expands mixed 4-bit/8-bit quantization support, but remains pending.  
  [PR #59376](https://github.com/vllm-project/vllm/pull/59376)

- **ROCm/Kimi-K3 quantization:** An opt-in gfx942 path would convert MXFP4 expert weights to grouped INT4 at load time and serve them through AITER’s packed-int4 kernel. Conversion is explicitly lossy and requires operator selection.  
  [PR #51274](https://github.com/vllm-project/vllm/pull/51274)

- **ROCm Qwen3/Qwen3.5 fused attention path:** An open ROCm change enables a fused QK-norm, RoPE, and gate Triton kernel for Qwen3-Next/Qwen3.5.  
  [PR #51406](https://github.com/vllm-project/vllm/pull/51406)

- **GLM-5.2 on NVIDIA SM10x:** A proposed optimization routes GLM-5.2’s fused QKV-A projection through the existing DeepSeek-V3 fused GEMM custom operation for low-batch decode.  
  [PR #59822](https://github.com/vllm-project/vllm/pull/59822)

- **LoRA adapter management API:** A proposed public API would let frameworks read and update loaded LoRA adapter tensors without accessing private manager state. This is relevant to dynamic adapter-weight synchronization in fine-tuning and agent-serving stacks.  
  [PR #59819](https://github.com/vllm-project/vllm/pull/59819)

## 3. Performance & Optimization

- **GLM-5.3 speculative decoding:** Fused multi-step draft decode is reported to improve end-to-end throughput by **13.3% at concurrency 1**, avoiding repeated metadata reconstruction between draft steps.  
  [PR #57443](https://github.com/vllm-project/vllm/pull/57443)

- **MRV2 autoregressive speculators:** Proper propagation of dynamically scheduled speculative-token counts is claimed to deliver **1.2–1.3× kernel performance improvement** by avoiding unnecessary draft forwards and stale draft tokens.  
  [PR #57053](https://github.com/vllm-project/vllm/pull/57053)

- **DeepEP v2 memory usage:** Under sequence parallelism, `ElasticBuffer` is reported to be over-allocated by `sp_size×`; the proposed fix sizes it to the actual per-rank dispatched shard.  
  [PR #59687](https://github.com/vllm-project/vllm/pull/59687)

- **ROCm chunked-prefill attention:** A two-pass causal MHA implementation is proposed for fusion into a single causal MHA operation, reducing kernel launches when cached context and new tokens are prefilled together.  
  [PR #59469](https://github.com/vllm-project/vllm/pull/59469)

- **FlashInfer all-reduce selection:** An open fix separates backend eligibility for node-local, multi-node Blackwell, and multi-node Hopper groups rather than applying automatic selection indiscriminately.  
  [PR #56891](https://github.com/vllm-project/vllm/pull/56891)

- **Weight-loading-bound startup:** An active roadmap targets rapid activation of additional compatible replicas by preparing serving configuration in advance and loading weights much closer to replica activation.  
  [Issue #48193](https://github.com/vllm-project/vllm/issues/48193)

- **KV-cache tiering:** An RFC proposes admission control before cascade and promotion submissions, addressing slow-tier overload and promotion contention in KV-cache offload systems.  
  [Issue #51240](https://github.com/vllm-project/vllm/issues/51240)

## 4. Stability & Regressions

### Critical / High Impact

1. **ROCm GLM-5.3 sparse indexer may corrupt its KV cache:** The kpool indexer reportedly writes 4,096 pool entries into 864 slots, leaving approximately **79% of indexer keys incorrect**. Because the model can still produce fluent text, the failure is silent and primarily appears as degraded long-context recall. No fix PR is identified in today’s data.  
   [Issue #54359](https://github.com/vllm-project/vllm/issues/54359)

2. **Scheduler can stop admitting requests under load:** A backlog grows while the engine reports healthy status, creating a production backpressure condition that may be difficult to detect from coarse health metrics. No direct fix PR is listed.  
   [Issue #53130](https://github.com/vllm-project/vllm/issues/53130)

3. **MTP acceptance falls to 0% on SM120 and disaggregated serving:** Separate reports affect GLM-5.3-Flash on RTX PRO 6000 Blackwell and Qwen3.8-Flash-Next in disaggregated prefill/decode serving. These effectively disable the throughput benefit of speculative decoding. No corresponding fix PR is shown for either report.  
   - [SM120 / GLM-5.3 Issue #59724](https://github.com/vllm-project/vllm/issues/59724)  
   - [Disaggregated PD / Qwen3.8 Issue #59642](https://github.com/vllm-project/vllm/issues/59642)

4. **Blackwell SM120 CUDA-graph support:** DeepSeek-V4.1-Flash reportedly incurs extremely low decode throughput with eager execution while CUDA graphs are unusable. A hybrid GDN prefix-cache fix is open, but it targets speculative decoding/cache hits rather than the requested SM120 graph-capture repair.  
   - [Issue #56892](https://github.com/vllm-project/vllm/issues/56892)  
   - [Hybrid GDN cache fix PR #52244](https://github.com/vllm-project/vllm/pull/52244)

5. **ROCm GLM-5.3 low-concurrency correctness:** A recent nightly reportedly generates gibberish at low request concurrency, suggesting that serving correctness may vary with batch shape or scheduler behavior.  
   [Issue #59413](https://github.com/vllm-project/vllm/issues/59413)

### Medium Impact

6. **Prefix-cache reuse disabled for DFlash Mamba groups:** The drafter KV group is reportedly not identified, causing all groups to be treated as draft groups and preventing intended prefix-cache reuse.  
   [Issue #57032](https://github.com/vllm-project/vllm/issues/57032)

7. **Quantization correctness and compatibility:** Open issues report A100 FP8 dtype errors and output dependence on within-expert token ordering with Marlin MoE. These may cause startup failures or non-deterministic output.  
   - [A100 FP8 Issue #54219](https://github.com/vllm-project/vllm/issues/54219)  
   - [Marlin MoE Issue #52525](https://github.com/vllm-project/vllm/issues/52525)

8. **Qwen reasoning parser can null normal content:** With Nemotron v3, combining `--reasoning-config` and the Nemotron parser reportedly sends all generated tokens into reasoning while leaving `content` null; unbounded thinking is also reported.  
   [Issue #39103](https://github.com/vllm-project/vllm/issues/39103)

9. **Sleep/wake correctness for RL workloads:** An RFC is tracking whether vLLM correctly preserves state and weight semantics across sleep/wake cycles used in reinforcement-learning serving.  
   [Issue #48310](https://github.com/vllm-project/vllm/issues/48310)

10. **ROCm sleep mode plus speculative decoding:** A crash is reported when combining these features on MI250, reinforcing the need for feature-matrix testing before enabling both in production.  
    [Issue #47548](https://github.com/vllm-project/vllm/issues/47548)

## 5. What This Means for Application Developers

- **Treat SM120 and recent ROCm nightly deployments as qualified configurations.** Validate token correctness, speculative acceptance rate, long-context retrieval, and both eager and graph-capped execution before production rollout.
- **Monitor speculative acceptance explicitly.** A healthy server and normal token generation do not imply useful speculation; track acceptance rate, accepted tokens per request, and draft/verifier latency.
- **Test scheduler behavior under saturation.** Track request admission, queue time, running/pending counts, and backlog age rather than relying solely on engine liveness or memory-health signals.
- **Avoid untested speculative-decoding combinations on ROCm GLM-5.3.** Sparse indexers, low-concurrency traffic, sleep/wake cycles, and disaggregated serving each expose distinct correctness risks.
- **Pin dependency combinations.** The active Transformers v5 tracker and recent Gemma/Transformers failures reinforce the need to pin and validate Transformers, vLLM images, and backend extensions together.  
  [Transformers v5 tracker](https://github.com/vllm-project/vllm/issues/38379)
- **For new quantization formats, verify exact checkpoint layouts.** MXFP4, MXFP4×FP8, and backend-specific INT4 conversions can differ in weight ordering and may be lossy.
- **API-layer safeguards are warranted.** Agent applications should validate that reasoning and normal content are not unexpectedly null, and should avoid executing tool markup that appears inside quoted reasoning examples. A pending Qwen parser fix addresses the latter.  
  [PR #59821](https://github.com/vllm-project/vllm/pull/59821)

</details>

<details>
<summary><strong>SGLang</strong> — <a href="https://github.com/sgl-project/sglang">sgl-project/sglang</a></summary>

# SGLang Digest — 2026-10-03

## 1. Today's Highlights

SGLang released **v0.5.21**, a large update comprising **779 pull requests from 227 contributors**, with expanded model support including **DeepSeek-V4.1 Flash** and **GigaChat 3.5**. Activity also focused on MoE optimization, Blackwell and AMD enablement, hierarchical-cache performance, speculative decoding, and multimodal serving. Several open issues report memory growth, incorrect tool-call parsing, scheduler instability, and routing regressions in newly optimized paths.

## 2. Releases & Breaking Changes

- **[v0.5.21](https://github.com/sgl-project/sglang/releases/tag/v0.5.21)** — The release highlights **779 merged PRs from 227 contributors** and adds new model support. The provided release data does not call out explicit breaking changes or mandatory migrations, but users should review the release notes and model-specific configuration guidance before upgrading production deployments.
- No verified API removals or required configuration migrations were identified in the supplied data.

## 3. New Model & Hardware Support

- **DeepSeek-V4.1 Flash** — Added to the documented model/cookbook set as an **LLM/VLM** model. See the [DeepSeek-V4.1 cookbook](https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4_1).
- **GigaChat 3.5** — Added to the documented model/cookbook set as an **LLM/VLM** model. The supplied release excerpt truncates the direct cookbook URL, but the model is included in the [v0.5.21 release](https://github.com/sgl-project/sglang/releases/tag/v0.5.21).
- **DeepSeek-V4 optimization roadmap** — Active work includes mHC cleanup, prefill optimizations, TP improvements, and router/kernel refinements. See [issue #42170](https://github.com/sgl-project/sglang/issues/42170).
- **AMD DeepSeek-V4-MXFP4 support** — An open PR adds Quark DeepSeek-V4-MXFP4 checkpoint support on the DSV4 stack, including shared-expert fusion and MTP/EAGLE speculative decoding: [PR #31054](https://github.com/sgl-project/sglang/pull/31054).
- **Blackwell NVFP4 and DeepSeek support** — Open work includes NVFP4 W4A16 support in FlashInfer MegaMoE ([PR #39210](https://github.com/sgl-project/sglang/pull/39210)) and guards around DeepSeek NVFP4 shared-expert fusion for LoRA and FP4 backends ([PR #42203](https://github.com/sgl-project/sglang/pull/42203)).
- **AMD GLM-5.2 decode path** — An ROCm PR targets decode-shaped MoE/MLA tiles, split speculative softmax, and BF16 GEMM routing on gfx950: [PR #41725](https://github.com/sgl-project/sglang/pull/41725).
- **AMD FP8 behavior change under review** — A proposed change removes a static `input_scale` from the AITER per-token FP8 path in favor of dynamic per-token scaling: [PR #42152](https://github.com/sgl-project/sglang/pull/42152).
- **Hardware capability gating** — An RFC proposes capability-based gating for CUDA-compatible out-of-tree platforms, rather than relying solely on `torch.cuda`/CUDA-version checks: [issue #42173](https://github.com/sgl-project/sglang/issues/42173).

## 4. Performance & Optimization

### Landed or in-progress

- **Speculative FPM observability** — A fix under review corrects speculative-decode FPM timing and decode-length statistics, avoiding overlap of iteration timings and stale/missing CPU length data: [PR #38711](https://github.com/sgl-project/sglang/pull/38711).
- **Hierarchical-cache transfer cleanup** — HiCache refactoring consolidates cancellation and in-flight storage-prefetch handling across multiple scheduler and storage paths: [PR #41453](https://github.com/sgl-project/sglang/pull/41453).
- **NIXL host staging for PD transfers** — An opt-in path stages prefill-to-decode KV/state transfers through pinned host memory, reusing the existing NIXL transfer planner: [PR #41182](https://github.com/sgl-project/sglang/pull/41182).
- **HiCache write-through off the request-finish path** — A proposed change queues and batches backups so scheduler-thread work is not performed serially during `cache_finished_req`: [PR #40363](https://github.com/sgl-project/sglang/pull/40363).
- **MiniMax-M3 decode optimizations** — A GB300/TP4 change targets paged K/V tile loads and a small router-projection GEMM. The benchmark configuration is **ISL 8192, OSL 1024, context length 1,048,576**: [PR #38841](https://github.com/sgl-project/sglang/pull/38841).
- **Blackwell confidential-computing overlap scheduling** — A proposed fix addresses scheduler stalls caused by synchronous D2H copies under NVIDIA Confidential Computing, where `cudaMemcpyAsync` can serialize decode overlap: [PR #36810](https://github.com/sgl-project/sglang/pull/36810).
- **Deterministic speculative sampling** — An open PR seeds rejection-sampling draft proposals from request-local state rather than the global PyTorch RNG, addressing deterministic-inference consistency: [PR #33395](https://github.com/sgl-project/sglang/pull/33395).
- **LTX-2 video encoding overlap** — A follow-up proposes overlapping MP4/audio encoding with VAE decode. Reported diffusion-bench measurements show approximately **20–40% of client latency** in encoding on short clips; on 2×B200, server compute was about **4.3 s** and client latency **5.4–5.7 s**: [issue #41892](https://github.com/sgl-project/sglang/issues/41892).
- **DeepSeek-V4 long-context memory** — An open issue reports **+3.3–3.8 GiB** memory at 128k when the default `SGLANG_FP8_PAGED_MQA_LOGITS_TORCH=True` also disables the C4 indexer’s row-chunk planner on SM120: [issue #42146](https://github.com/sgl-project/sglang/issues/42146).
- **Scheduler cache residency** — A proposed scheduler change keeps waiting requests’ cached prefixes resident under cache-agnostic admission policies, potentially reducing avoidable cache eviction: [PR #41593](https://github.com/sgl-project/sglang/pull/41593).

## 5. Stability & Regressions

Ranked below by likely operational impact; issue status is based on the supplied GitHub data.

### High priority

1. **CUDA illegal memory access in QSA extend forward**  
   An H20 TP8 deployment with Qwen3.8-Flash-Next-FP8 can hit a CUDA illegal memory access at **8 concurrent requests**. `CUDA_LAUNCH_BLOCKING=1` and `--disable-overlap-schedule` suppress the failure, but these are workarounds—not confirmed root-cause fixes or safe operating limits.  
   [Issue #37633](https://github.com/sgl-project/sglang/issues/37633)

2. **EPLB + DSPARK speculative-decoding crash**  
   Draft CUDA graph capture fails with an `on_select_experts` `scatter_add_` dimension mismatch. The report says the bug persists on the latest version; no fix PR is identified in the supplied data.  
   [Issue #34974](https://github.com/sgl-project/sglang/issues/34974)

3. **DeepSeek-V4 memory regression/configuration coupling**  
   The SM120 issue above links memory growth of **3.3–3.8 GiB at 128k** to an environment/default interaction that unexpectedly disables the C4 indexer planner.  
   [Issue #42146](https://github.com/sgl-project/sglang/issues/42146)

4. **Chunked-prefill batching regression**  
   Under chunked prefill, decode running batch is reported as pinned at `max_running_requests - 1`, potentially wasting one request slot and reducing utilization.  
   [Issue #38118](https://github.com/sgl-project/sglang/issues/38118)

5. **MoE runner selection failure for packed MXFP4 on SM100**  
   MiMo-V2 is reported to select the FP8 MoE runner for packed MXFP4 experts. The issue is closed, and a related closed issue indicates the same class of problem on SM90/H200; the supplied data does not identify the fixing commit.  
   [Issue #41569](https://github.com/sgl-project/sglang/issues/41569) · [related issue #42162](https://github.com/sgl-project/sglang/issues/42162)

### Medium priority

6. **Tool-call/streaming correctness issues**  
   Multiple open reports affect agent applications:
   - HarmonyParser may emit tool-call arguments from the analysis channel as reasoning: [#42143](https://github.com/sgl-project/sglang/issues/42143)
   - DeepSeek-V3.1 streaming can drop one tool call and attach arguments to the next: [#42138](https://github.com/sgl-project/sglang/issues/42138)
   - Anthropic streaming may omit a tool call’s closing `}` when whitespace appears between argument fragments: [#42260](https://github.com/sgl-project/sglang/issues/42260)
   - Glm4MoeDetector changes string values such as `"true"` → `"True"` or `"1.50"` → `"1.5"`: [#42133](https://github.com/sgl-project/sglang/issues/42133)
   - XGrammar sanitization rejects `null` schemas nested under structural keywords: [#42144](https://github.com/sgl-project/sglang/issues/42144)

7. **DSv4.1 routing inconsistency**  
   Text-only batches may still invoke `vision_topk()` on CUDA, bypassing the recorder and EPLB remapping logic.  
   [Issue #42188](https://github.com/sgl-project/sglang/issues/42188)

8. **Serving benchmark TTFT statistics**  
   The benchmark utility appears to include unmeasured default `ttft=0.0` values, potentially biasing TTFT means, medians, and percentiles.  
   [Issue #42000](https://github.com/sgl-project/sglang/issues/42000)

9. **Expert-distribution endpoint can terminate the scheduler**  
   Calling an expert-distribution endpoint when recorder mode is unset can raise inside the scheduler and terminate the engine instead of returning a client error.  
   [Issue #42222](https://github.com/sgl-project/sglang/issues/42222)

10. **FP8 KV-cache and speculative verification**  
    An open PR addresses XQA draft-extend behavior with FP8 KV cache on SM90/SM120, where query casting may not match the kernel’s expected output type. This is a correctness/performance area for EAGLE-style serving.  
    [PR #41656](https://github.com/sgl-project/sglang/pull/41656)

## 6. What This Means for Application Developers

- **Validate streaming tool calls end to end before upgrading.** The cluster of Harmony, DeepSeek, Anthropic, Glm4Moe, and XGrammar issues can corrupt tool names, arguments, reasoning channels, or JSON schema handling. For agent workloads, add tests with multiple calls, fragmented JSON, whitespace, and nested schema keywords.
- **Pin and test the exact release/model/hardware combination.** DeepSeek-V4, MiMo-V2, Blackwell NVFP4, and AMD MXFP4 support involve rapidly changing kernel and quantization paths. Run accuracy, concurrency, and long-context tests on the target GPU topology.
- **Treat the reported concurrency workaround as diagnostic only.** `CUDA_LAUNCH_BLOCKING=1` and disabling overlap scheduling can hide a CUDA memory-safety issue while materially reducing throughput and latency benefits.
- **Watch memory settings for long-context DeepSeek deployments.** On SM120, validate the C4 indexer/planner configuration at 128k and measure peak memory before using a default environment setting.
- **Use `--file-storage-path` carefully.** An open report says the flag is not currently honored by the file HiCache backend, which may route data to the environment/default directory instead. Verify the effective storage path in the deployed version.  
  [PR #33883](https://github.com/sgl-project/sglang/pull/33883)
- **For production observability, check speculative and benchmark metrics.** Validate FPM timing, decode lengths, and TTFT calculations against raw request traces; zero-valued unmeasured TTFTs can materially distort latency dashboards.
- **Expect continued movement in MoE and disaggregated serving.** HiCache, NIXL PD transfers, EPLB, MXFP4/NVFP4, and AMD kernels are active areas. Prefer staged rollouts with correctness checks, particularly when combining speculative decoding, EP, and hierarchical caching.

</details>

<details>
<summary><strong>llama.cpp</strong> — <a href="https://github.com/ggml-org/llama.cpp">ggml-org/llama.cpp</a></summary>

# llama.cpp Digest — 2026-10-03

## 1. Today’s Highlights

- The latest activity is concentrated in **backend robustness and memory-management plumbing**: GGML gained a new buffer-allocation interface, while Vulkan received improved pipeline diagnostics and compatibility fixes. CUDA work also fixed two Volta FlashAttention failures.
- **Hexagon support is expanding**, including Q2_K/Q3_K quantization types and shared DMA-based copy/concatenate operations. Several backend-specific correctness and stability issues remain active, particularly around speculative decoding, Vulkan, CUDA MMQ, and host-offloaded MoE models.
- The server/model-management roadmap is becoming more substantial, with ongoing work on **UI-based model/provider management, sidecar asset discovery, and token-aware chat parsing**.

## 2. Releases & Breaking Changes

- **No explicit breaking release or migration note was reported.**
- Build `b11351` adds `alloc_buffer_n` to the `ggml_backend_buffer_type_i` interface and exposes `ggml_backend_buft_alloc_buffer_n`. This is primarily an internal/backend integration change; custom GGML backend implementations may need to provide or account for the new interface method.  
  [Release b11351](https://github.com/ggml-org/llama.cpp/releases/tag/b11351) · [PR #23671](https://github.com/ggml-org/llama.cpp/pull/23671)
- Build `b11342` fixes cache-directory creation through symlinks when using a problematic `libstdc++` implementation. This is a deployment/runtime fix rather than a configuration change.  
  [Release b11342](https://github.com/ggml-org/llama.cpp/releases/tag/b11342) · [PR #29816](https://github.com/ggml-org/llama.cpp/pull/29816)

## 3. New Model & Hardware Support

- **Hexagon HTP**
  - Rebuilt HTP skeletons are included, with corrected HTP skeleton catalog dependencies.  
    [Release b11347](https://github.com/ggml-org/llama.cpp/releases/tag/b11347) · [PR #29828](https://github.com/ggml-org/llama.cpp/pull/29828)
  - Hexagon now supports **Q2_K and Q3_K** quantization types and standardizes `src1_row_size` allocation.  
    [Release b11345](https://github.com/ggml-org/llama.cpp/releases/tag/b11345) · [PR #29717](https://github.com/ggml-org/llama.cpp/pull/29717)
  - Shared strided DMA paths now accelerate `CPY` and `CONCAT`, including arbitrary-dimension concatenation.  
    [Release b11338](https://github.com/ggml-org/llama.cpp/releases/tag/b11338) · [PR #29685](https://github.com/ggml-org/llama.cpp/pull/29685)

- **Qwen4 experimental support**
  - Test failures in the Qwen4 experimental implementation were fixed.  
    [Release b11346](https://github.com/ggml-org/llama.cpp/releases/tag/b11346) · [PR #29819](https://github.com/ggml-org/llama.cpp/pull/29819)

- **CUDA**
  - Fixed two broken FlashAttention cases on NVIDIA Volta-generation GPUs.  
    [Release b11344](https://github.com/ggml-org/llama.cpp/releases/tag/b11344) · [PR #29803](https://github.com/ggml-org/llama.cpp/pull/29803)

- **Vulkan**
  - Added logging for compute-pipeline compilation issues, improving diagnosis of driver-specific shader failures.  
    [Release b11349](https://github.com/ggml-org/llama.cpp/releases/tag/b11349) · [PR #29794](https://github.com/ggml-org/llama.cpp/pull/29794)
  - A pending fix handles Vulkan loaders that do not export `vkEnumerateInstanceVersion`, affecting older Android loaders.  
    [PR #29872](https://github.com/ggml-org/llama.cpp/pull/29872)

- **Model architectures in progress**
  - K2 Horizon dense and MoVA support, including HF-to-GGUF conversion, tokenization, loading, and inference-graph support.  
    [PR #29535](https://github.com/ggml-org/llama.cpp/pull/29535)
  - ETET 1.0, a MiniCPM5/LlamaForCausalLM-derived MoE architecture, is being added.  
    [PR #29873](https://github.com/ggml-org/llama.cpp/pull/29873)
  - GLM-5.3-Flash support was merged/closed, covering a 320B hybrid text-and-vision model.  
    [PR #27773](https://github.com/ggml-org/llama.cpp/pull/27773)

## 4. Performance & Optimization

- **Vulkan F16 accumulation**
  - A pending Vulkan change packs scalar FMAs into `f16vec2` operations when dot-product instructions are unavailable, while preserving operation order and bit-identical results.  
    [PR #29877](https://github.com/ggml-org/llama.cpp/pull/29877)

- **SYCL GLM MLA prefill**
  - SYCL GLM-4.7 Flash prompt shapes are being routed through an MKL FlashAttention pipeline, including correct handling of narrower strided V-cache views.  
    [PR #29171](https://github.com/ggml-org/llama.cpp/pull/29171)

- **Metal speculative decoding**
  - Pending Metal optimizations add few-row MMA matmuls and batched copies for speculative decoding on Apple GPUs without the tensor API, targeting 2–16 draft tokens per step.  
    [PR #29869](https://github.com/ggml-org/llama.cpp/pull/29869)

- **Host-offloaded MoE**
  - A proposed GPU-resident LRU cache would retain recently used host-memory MoE expert weights on the GPU to reduce system-RAM traffic during decode.  
    [PR #27861](https://github.com/ggml-org/llama.cpp/pull/27861)

- **KV-cache pooling**
  - A fix clamps the KV-pool re-pool bound when a batch fills the cache, preventing oversized re-pooling work.  
    [Release b11339](https://github.com/ggml-org/llama.cpp/releases/tag/b11339) · [PR #29805](https://github.com/ggml-org/llama.cpp/pull/29805)

- **CPU FlashAttention**
  - An open PR offsets the KQ maximum to prevent F16 sum overflow in the per-query kernel used for long-context decode and prompt tails.  
    [PR #29810](https://github.com/ggml-org/llama.cpp/pull/29810)

## 5. Stability & Regressions

Ranked by likely production impact:

1. **CUDA MMQ out-of-bounds read / illegal memory access**
   - An open issue reports incorrect `src1_q8_1` tail-padding calculation in `MUL_MAT_ID` for some MoE ubatch sizes. This can cause illegal memory access and crashes.  
     [Issue #27792](https://github.com/ggml-org/llama.cpp/issues/27792)

2. **MTP speculative-decoding crashes and device loss**
   - Multiple reports affect CUDA, Vulkan, SYCL, and older GPUs:
     - Qwen 3.8 Flash + MTP startup assertion: [Issue #29811](https://github.com/ggml-org/llama.cpp/issues/29811)
     - RADV device loss during prompt processing: [Issue #27306](https://github.com/ggml-org/llama.cpp/issues/27306)
     - Gemma 4 MTP Vulkan crash: [Issue #24492](https://github.com/ggml-org/llama.cpp/issues/24492)
     - MTP FlashAttention head-dimension mismatch: [Issue #29419](https://github.com/ggml-org/llama.cpp/issues/29419)
   - Some related Vulkan issues are closed, but the breadth of reports suggests MTP remains a high-risk feature outside well-tested configurations.

3. **Vulkan driver-specific failures**
   - Adreno proprietary drivers can abort without diagnostic output, while other reports identify `vkCreateComputePipelines` failures caused by generated SPIR-V.  
     [Issue #29786](https://github.com/ggml-org/llama.cpp/issues/29786) · [Issue #28635](https://github.com/ggml-org/llama.cpp/issues/28635)  
     Recent logging and loader-compatibility work may improve diagnosis but does not constitute a complete driver fix.

4. **Multi-GPU / tensor-split correctness**
   - MTP is reported to roughly halve prompt processing when layers are split across GPUs, and another issue reports a CUDA split-axis assertion.  
     [Issue #27428](https://github.com/ggml-org/llama.cpp/issues/27428) · [Issue #26902](https://github.com/ggml-org/llama.cpp/issues/26902)

5. **Server API and parsing**
   - Invalid embedding requests now correctly return HTTP 400, which is a positive API behavior change.  
     [Release b11337](https://github.com/ggml-org/llama.cpp/releases/tag/b11337) · [PR #29060](https://github.com/ggml-org/llama.cpp/pull/29060)
   - A `peg-native` JSON-schema parsing issue was closed, and Ling 3.0’s JSON-schema response-format handling is being corrected.  
     [Issue #27279](https://github.com/ggml-org/llama.cpp/issues/27279) · [PR #29813](https://github.com/ggml-org/llama.cpp/pull/29813)

6. **Metal and memory management**
   - A Gemma 4 31B Metal OOM was reported after an update at large default context sizes.  
     [Issue #29521](https://github.com/ggml-org/llama.cpp/issues/29521)
   - An RPC/Metal issue reports the main node retaining the full model under default mmap loading, limiting effective split-model memory utilization.  
     [Issue #27667](https://github.com/ggml-org/llama.cpp/issues/27667)

## 6. What This Means for Application Developers

- **Treat MTP and other speculative decoding as opt-in, backend-dependent features.** Validate them separately on each GPU architecture, Vulkan driver, tensor split, and model family; disable them when correctness or stability is more important than throughput.
- **Pin and record the exact llama.cpp build for production deployments.** The release stream is highly active, and backend behavior changes rapidly. The latest build includes fixes that may not be present in the build used by an application.
- **Test invalid requests explicitly at the gateway/server boundary.** Embedding requests now return HTTP 400 for malformed input, which is preferable to silently accepting invalid workloads.
- **For model downloads, plan for sidecar assets.** Pending server work treats `mmproj`, imatrix, draft-model, and similar files as independently cached sidecars rather than assuming only the main GGUF is required.  
  [PR #28405](https://github.com/ggml-org/llama.cpp/pull/28405) · [PR #29583](https://github.com/ggml-org/llama.cpp/pull/29583)
- **Use structured-output parsers with backend-specific testing.** Chat behavior and schema enforcement continue to evolve, particularly for Ling, PEG-native, and provider-specific formats.  
  [PR #29813](https://github.com/ggml-org/llama.cpp/pull/29813) · [PR #29876](https://github.com/ggml-org/llama.cpp/pull/29876)
- **Monitor memory headroom for large-context deployments**, especially Metal, RPC split models, and host-offloaded MoE configurations. Recent work is aimed at reducing both buffer-allocation complexity and expert-weight transfer costs, but the open issues indicate these paths still need workload-specific validation.

</details>

<details>
<summary><strong>Ollama</strong> — <a href="https://github.com/ollama/ollama">ollama/ollama</a></summary>

# Ollama Digest — 2026-10-03

## 1. Today’s Highlights

Ollama had no new releases in the last 24 hours, but several infrastructure-focused changes are in progress. The most significant work targets Apple MLX execution, tool-call streaming correctness, model selection, and API fidelity; separately, users reported significant MLX memory/utilization regressions and cloud, vision-model, and GPU detection issues.

The emerging theme is improved local inference maturity—especially on Macs—but with ongoing concerns around model residency, parallelism, tool-call parsing, and hardware compatibility.

## 2. Releases & Breaking Changes

No GitHub releases were published in the last 24 hours.

Potentially relevant unreleased changes include:

- **MLX dependency update:** an open version bump would update the embedded MLX revision. Review compatibility and release notes before adopting a future build containing this change. [PR #18720](https://github.com/ollama/ollama/pull/18720)
- **Model runner auto-selection:** an open change allows `show` requests to request the platform-default runner, with `ollama run` and `ollama launch` expected to use this behavior. Older local model installations may consequently be migrated or pulled when their tags now map to multiple runner variants. [PR #18634](https://github.com/ollama/ollama/pull/18634)
- **JSON schema ordering fix:** an open patch preserves JSON property order when forwarding structured-output schemas to `llama-server`, avoiding alphabetically reordered properties that can affect model behavior. [PR #18721](https://github.com/ollama/ollama/pull/18721)
- **Tool schema fidelity:** an open patch changes TypeScript rendering for tool parameters so string enums become TypeScript literal unions rather than unrestricted `string` values in the gpt-oss/Harmony template. [PR #18745](https://github.com/ollama/ollama/pull/18745)

## 3. New Model & Hardware Support

- **Granite support in MLX:** an open PR adds dense `GraniteForCausalLM` support to the experimental models and MLX runner, targeting Granite 4.1/4.2-family models. [PR #17972](https://github.com/ollama/ollama/pull/17972)
- **Strands Decider support:** a pair of open changes adds Strands Decider support and refactors MLX decision preparation/readout so serial and batched scoring can share model-owned logic. [PR #18748](https://github.com/ollama/ollama/pull/18748), [PR #18755](https://github.com/ollama/ollama/pull/18755)
- **Decision-model validation:** a proposed test suite adds external JSONL corpora, quality scoring, concurrent requests, vision coverage, and System One timing benchmarks. [PR #18746](https://github.com/ollama/ollama/pull/18746)
- **Community integrations:** proposed additions include CORTEX, AgentBridge, and Talos, expanding the ecosystem of agents and tools built around Ollama. [PR #18749](https://github.com/ollama/ollama/pull/18749), [PR #18693](https://github.com/ollama/ollama/pull/18693), [PR #18093](https://github.com/ollama/ollama/pull/18093)

No confirmed CUDA, ROCm, Metal, CPU, or quantization-format support changes landed in the last 24 hours.

## 4. Performance & Optimization

- **MLX decision inference:** work in progress separates model preparation and readout from the forward pass, aiming to avoid duplicating architecture-specific logic across serial and batched scoring. [PR #18755](https://github.com/ollama/ollama/pull/18755)
- **Structured-output fidelity:** preserving schema property order may improve model adherence to structured tool definitions and reduce unexpected behavior caused by reordered properties. [PR #18721](https://github.com/ollama/ollama/pull/18721)
- **Parallelism issue on Nimble/Qwen:** a deployment with `OLLAMA_NUM_PARALLEL=8` on an NVIDIA A100 is reportedly forced to `-np 1` because the `qwen35` architecture is not recognized as supporting parallel requests. The report involved 48 requests and an approximately 1,000-token workload. [Issue #18750](https://github.com/ollama/ollama/issues/18750)
- **MLX residency regression:** a user reports that model weights become pageable approximately two seconds after each request on macOS 27; under memory pressure, this can cause compression, swapping, and re-paging on the next request. [Issue #18744](https://github.com/ollama/ollama/issues/18744)
- **MLX GPU utilization regression:** on an M4 Pro 48 GB, a Qwen 3.8 MXFP8 27B model reportedly performs worse under Ollama 0.40.0 than under 0.35.1-rc2, with lower reported GPU utilization. [Issue #18754](https://github.com/ollama/ollama/issues/18754)
- **ROCm model eviction:** a report indicates that model eviction ignores part of the available unified VRAM, causing models to be removed while capacity remains. [Issue #18756](https://github.com/ollama/ollama/issues/18756)

## 5. Stability & Regressions

Ranked by likely operational impact:

1. **Cloud model availability — high severity, user-reported:** a Pro subscriber reports an approximately 95% failure rate across multiple cloud models, including GLM, Kimi, Qwen, and DeepSeek. The report is not independently confirmed, but the breadth and level of engagement warrant monitoring. [Issue #15453](https://github.com/ollama/ollama/issues/15453)
2. **Tool-call streaming correctness — high functional impact:** `DeepSeek3Parser`, `CogitoParser`, and `LFM2Parser` may emit partial tool-call opening tags as normal content when a streaming chunk boundary falls inside the tag. This can convert valid tool calls into raw assistant text. A targeted fix is open for Cogito parsing. [Issue #18681](https://github.com/ollama/ollama/issues/18681), [PR #18759](https://github.com/ollama/ollama/pull/18759)
3. **MLX model residency and utilization — medium-to-high:** separate reports describe weights being released shortly after requests and reduced GPU utilization on newer Ollama versions. These can increase latency, swapping, and energy consumption under memory pressure. [Issue #18744](https://github.com/ollama/ollama/issues/18744), [Issue #18754](https://github.com/ollama/ollama/issues/18754)
4. **Parallel request capacity regression — medium:** Nimble deployments using Qwen 3.5 may silently fall back from the requested parallelism of eight to one, materially reducing throughput. [Issue #18750](https://github.com/ollama/ollama/issues/18750)
5. **Vision model regression — medium:** `llama3.2-vision` is reported to have stopped working after a recent Ollama update. [Issue #16490](https://github.com/ollama/ollama/issues/16490)
6. **Intel Vulkan detection — medium:** Ollama 0.34.4 on Windows reportedly fails to expose an Intel UHD device through the Vulkan backend, despite Vulkan itself detecting the GPU. [Issue #18672](https://github.com/ollama/ollama/issues/18672)
7. **Orphaned model blobs — low-to-medium:** a macOS report identified live orphaned blobs, including a 21 GB object, indicating that garbage collection may not reclaim all unreferenced model content. The issue is marked closed, but operational auditing is advisable after upgrades or failed pulls. [Issue #18595](https://github.com/ollama/ollama/issues/18595)

## 6. What This Means for Application Developers

- **Do not assume tool calls are chunk-boundary independent.** Applications using streaming responses should validate tool-call structure and consider buffering or re-parsing incomplete tags until a corresponding fix is included in a release. [Issue #18681](https://github.com/ollama/ollama/issues/18681)
- **Test structured-output and tool schemas explicitly.** Enum constraints and property order can materially affect model behavior; include regression tests for tool parameters with restricted values. [PR #18745](https://github.com/ollama/ollama/pull/18745), [PR #18721](https://github.com/ollama/ollama/pull/18721)
- **Verify observed parallelism and residency in production.** Compare scheduler logs, effective `-np`, latency, GPU utilization, and memory behavior rather than relying only on `OLLAMA_NUM_PARALLEL`. [Issue #18750](https://github.com/ollama/ollama/issues/18750)
- **Pin versions for Mac inference deployments.** Given the reported MLX utilization and residency changes between 0.35.1-rc2 and 0.40.0, use canary testing and retain a known-good version for latency-sensitive workloads. [Issue #18754](https://github.com/ollama/ollama/issues/18754)
- **Treat local model tags as potentially multi-runner artifacts.** Applications that depend on a specific backend should verify the selected runner after upgrades, especially for older model installations affected by manifest-list changes. [PR #18634](https://github.com/ollama/ollama/pull/18634)
- **Plan for degraded cloud fallback.** If cloud models are part of the product path, maintain health checks and a local-model fallback strategy rather than assuming a successful HTTP request implies model availability. [Issue #15453](https://github.com/ollama/ollama/issues/15453)

</details>

<details>
<summary><strong>LiteLLM</strong> — <a href="https://github.com/BerriAI/litellm">BerriAI/litellm</a></summary>

# LiteLLM Digest — 2026-10-03

## 1. Today’s Highlights

LiteLLM released **v1.105.0-dev.2**, with updated Docker-image signature verification using a consistent cosign key. The main development focus is improving gateway observability, spend attribution, streaming usage accounting, provider compatibility, and routing behavior—especially for Responses API, Bedrock, Azure AI, and agentic workloads. Several correctness and compatibility fixes are still open pull requests, so production adoption should be gated on validation and merge status.

## 2. Releases & Breaking Changes

- **v1.105.0-dev.2 released**
  - All LiteLLM Docker images are signed with [cosign](https://docs.sigstore.dev/cosign/overview/).
  - Releases use the key introduced in commit [`0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0).
  - Operators can verify image authenticity before deployment. See the [v1.105.0-dev.2 release](https://github.com/BerriAI/litellm/releases/tag/v1.105.0-dev.2).

- **Proxy extras package version updated**
  - `litellm-proxy-extras` is being bumped from **0.4.104 to 0.4.105** on the main/release branches, reflecting fixes shipped after 0.4.104 was published.
  - Upgrade deployment tooling alongside the LiteLLM release candidate: [PR #44234](https://github.com/BerriAI/litellm/pull/44234) and [PR #44235](https://github.com/BerriAI/litellm/pull/44235).

No confirmed breaking API changes are identified in the supplied data. The following are in-progress changes and should not be treated as released behavior yet.

## 3. New Model & Hardware Support

- **Native Bedrock Chat Completions for GPT-5.6+**
  - [PR #40775](https://github.com/BerriAI/litellm/pull/40775) proposes serving Bedrock GPT-5.6/6/6.1 Chat Completions natively rather than translating through Converse and back.
  - The goal is to reduce latency and avoid losing parameters during translation. The PR retains explicit opt-in behavior for GPT-OSS and Grok through `chat_completions`.

- **Unified Decisions API**
  - [PR #44236](https://github.com/BerriAI/litellm/pull/44236) adds `litellm.adecisions` and `litellm.decisions` SDK calls using a Jev-compatible schema.
  - This targets providers such as Perplexity’s Decisions API and provides a common interface for typed decision models.
  - A corresponding **System One** playground tab has also been added in [PR #44043](https://github.com/BerriAI/litellm/pull/44043).

- **Tool search compatibility for Responses backends**
  - [PR #44222](https://github.com/BerriAI/litellm/pull/44222) lowers client-level `tool_search` to a regular function for hosted vLLM and other OpenAI-compatible Responses backends that do not implement the feature.
  - This is intended to prevent 400 errors when replaying tool-search items through vLLM.

- **xAI voice transcription catalog update**
  - [PR #44237](https://github.com/BerriAI/litellm/pull/44237) adds the deprecation date for `xai/grok-voice-transcribe-1.0`; the PR reports no text-model price changes.

No new CUDA, ROCm, Metal, CPU, kernel, or quantization support is reported in this digest’s data.

## 4. Performance & Optimization

- **Prompt-cache eligibility avoids tokenizing entire conversations**
  - [PR #44221](https://github.com/BerriAI/litellm/pull/44221) is aimed at reducing unnecessary tokenization during prompt-cache eligibility checks.
  - The optimization is particularly relevant for long-context workloads and Anthropic prompt caching, where eligibility checks can otherwise add avoidable CPU work.

- **More accurate OpenTelemetry database spans**
  - [PR #44148](https://github.com/BerriAI/litellm/pull/44148) stops reporting PostgreSQL service spans for warm in-memory cache hits that never access the database.
  - [PR #44240](https://github.com/BerriAI/litellm/pull/44240) improves span naming by operation and table, and extends instrumentation to spend flushes, daily spend upserts, and spend-log inserts.
  - [PR #44150](https://github.com/BerriAI/litellm/pull/44150) improves cache-span structure, nesting Redis spans beneath response-cache reads and writes and naming service spans by purpose.
  - These changes should improve trace signal-to-noise and make latency investigations more representative, but they are not yet confirmed as merged.

- **Correct attribution for auto-router savings**
  - [PR #44226](https://github.com/BerriAI/litellm/pull/44226) addresses missing per-router savings when spend logs are disabled or session IDs are omitted.
  - Improved baseline comparison and attribution should make auto-router cost savings more reliable for FinOps reporting.

- **Better image-edit pricing for Azure AI FLUX.2**
  - [PR #43216](https://github.com/BerriAI/litellm/pull/43216) proposes megapixel-based accounting for FLUX.2 reference images, including handling for retried uploads and legacy pricing overrides.
  - This is primarily a billing/cost-accounting improvement rather than a throughput optimization.

## 5. Stability & Regressions

Issues are ranked approximately by likely operational impact.

### High impact

- **Spend can be recorded as zero for custom models**
  - [Issue #35691](https://github.com/BerriAI/litellm/issues/35691): custom models absent from LiteLLM’s built-in cost map can show `cost_breakdown.total_cost = 0`, even when response-side cost estimation is correct.
  - **Impact:** inaccurate dashboards, budget enforcement, and financial reporting.
  - **Fix status:** no linked fix is shown in the supplied data.

- **Background health-check errors may affect unrelated deployments**
  - [Issue #44154](https://github.com/BerriAI/litellm/issues/44154): health-check results are reportedly attributed to every deployment sharing the same `litellm_params.model`.
  - **Impact:** false unhealthy states, incorrect failover behavior, and operational confusion.
  - **Fix status:** open; no fix PR is identified.

- **Tool policy guardrails reportedly bypassed on Responses and Messages routes**
  - [Issue #30732](https://github.com/BerriAI/litellm/issues/30732), now closed: the report states that tool-permission and blocklist policies were not applied consistently to `/v1/responses` and `/v1/messages`.
  - **Impact:** possible unauthorized tool execution or policy bypass.
  - Because the issue is closed, operators should verify the fix is present in the deployed version and test all agentic routes independently.

### Medium impact

- **Prompt-cache accounting is misleading in request details**
  - [Issue #32045](https://github.com/BerriAI/litellm/issues/32045): provider prompt-cache hits may appear as `Cache Hit: False`, and cached-token cost details may be hidden.
  - **Impact:** incorrect cache-effectiveness analysis and spend interpretation.

- **Anthropic Messages streaming loses web-search results**
  - [Issue #35333](https://github.com/BerriAI/litellm/issues/35333): web-search interception can drop `web_search_tool_result` blocks while re-wrapping a stream.
  - **Impact:** incomplete agent responses and broken search workflows.
  - **Fix status:** open; no fix PR is listed.

- **Codex model discovery can fail through LiteLLM’s `/models` endpoint**
  - [Issue #36854](https://github.com/BerriAI/litellm/issues/36854): Codex CLI expects `{"models": [...]}`, while LiteLLM returns the standard OpenAI-style `{"data": [...]}`.
  - **Impact:** OpenAI Codex clients may fail to discover models.
  - **Mitigation:** use a compatibility route or gateway configuration that emits the expected response shape until the issue is resolved.

- **Custom pricing can undercharge service tiers**
  - [Issue #43868](https://github.com/BerriAI/litellm/issues/43868), closed: custom-priced OpenAI deployments returning `service_tier="ultrafast"` were reportedly charged at standard rates.
  - **Impact:** substantial billing undercounting when tier-specific pricing is not explicitly represented.

- **Streaming requests without usage may be logged as zero tokens and zero cost**
  - [PR #44230](https://github.com/BerriAI/litellm/pull/44230) proposes restoring token estimates for streams that do not return usage.
  - **Impact:** missing or inaccurate spend records; the proposed fix is still open.

### Lower or environment-specific impact

- **Stdio MCP services may not expose available tools**
  - [Issue #15560](https://github.com/BerriAI/litellm/issues/15560), closed: UI-created stdio MCP services reportedly show no available tools, while SSE/HTTP services work.
  - Validate the deployed fix and client/transport combinations.

- **Windows Microsoft Store Python installation can exceed `MAX_PATH`**
  - [Issue #43851](https://github.com/BerriAI/litellm/issues/43851), closed: LiteLLM installation can still fail under Windows long-path restrictions.
  - Use a shorter virtual environment path or enable Windows long-path support.

- **AnyIO dependency may leave a lock-waiter deadlock risk**
  - [Issue #44048](https://github.com/BerriAI/litellm/issues/44048): LiteLLM does not declare a minimum AnyIO version despite a known upstream deadlock issue.
  - Pin or validate the AnyIO version in production environments until a dependency constraint is added.

## 6. What This Means for Application Developers

- **Pin and verify releases.** For Docker deployments, verify the v1.105 image signature and pin the digest or image tag. Treat `.dev.2` as a development build and validate it before production rollout.
- **Test custom-model billing explicitly.** Supply model-cost metadata or verify spend logs for models not present in the built-in cost map. Add reconciliation checks for custom and tiered pricing.
- **Validate agent tool policies across every route.** Exercise `/v1/chat/completions`, `/v1/responses`, and `/v1/messages`; do not assume a guardrail enforced on one route is enforced on the others.
- **Budget for compatibility limitations.** Codex model discovery and streaming web-search behavior may require gateway-side workarounds. Use provider-specific integration tests for agent frameworks.
- **Treat observability changes as staged improvements.** The proposed OTel and auto-router changes should improve telemetry quality, but trace names, span nesting, and savings attribution may change dashboards and alerts.
- **Keep custom pricing and fallback configuration deterministic.** The aggregate shared-wallet economy-model fallback is still a feature request in [Issue #43652](https://github.com/BerriAI/litellm/issues/43652), so teams needing automatic economy fallback should continue implementing it externally or in deployment-specific routing logic.

</details>

<details>
<summary><strong>Unsloth</strong> — <a href="https://github.com/unslothai/unsloth">unslothai/unsloth</a></summary>

# Unsloth Digest — 2026-10-03

## 1. Today’s Highlights

No tagged releases were published in the last 24 hours. Development was concentrated in Unsloth Studio: image/video kernel optimization, long-context lease handling, model-management UX, and NPU export support, alongside significant reports of VRAM inefficiency, vLLM LoRA incompatibility, and a major tensor-split throughput regression.

## 2. Releases & Breaking Changes

No new releases or announced API/configuration migrations were identified in the provided data.

## 3. New Model & Hardware Support

- **FastFlowLM Q4NX export for AMD Ryzen AI NPUs:** An open PR proposes converting fine-tuned models or GGUF checkpoints—including Qwen3, Llama, Gemma, LFM2, and Phi-4—to Q4NX for execution on XDNA 2 NPUs such as Ryzen AI hardware. This is not yet merged.  
  [PR #12541](https://github.com/unslothai/unsloth/pull/12541)

- **Qwen3-TTS fine-tuning requested:** The community is asking Unsloth to support fine-tuning for Qwen3-TTS. The issue is open, marked help wanted and good first issue, but no implementation was reported.  
  [Issue #3951](https://github.com/unslothai/unsloth/issues/3951)

- **Dynamic GGUF quantization requested for Index-Translate:** Support is requested for the 2B, 9B, and 35B-A3B translation model family.  
  [Issue #12553](https://github.com/unslothai/unsloth/issues/12553)

- **Model and hardware placement fixes in progress:** An open PR addresses rejection of `--mmproj-device CUDA1` when a VLM’s saved GPU selection results in a single-GPU placement, particularly relevant to dual-GPU and vision-language deployments.  
  [PR #12505](https://github.com/unslothai/unsloth/pull/12505)

## 4. Performance & Optimization

- **Tensor-split inference regression under investigation:** An open report claims two RTX 5070 Ti systems running tensor split at roughly **48 tokens/s** on recent Unsloth builds, versus **115–? tokens/s** on earlier builds and official `ggml-org` binaries. The suspected change is `max_cuda_graphs = 64`; the report describes a slowdown of up to **2.9×**.  
  [Issue #12468](https://github.com/unslothai/unsloth/issues/12468)

- **T4 image-generation kernel optimization:** An open PR adds fused FP16 Wan blocks. For Wan2.2-TI2V-5B at **1280×704, 25 frames, 20 steps, CFG 5**, the reported step time improves from **11.7 seconds to 10.0 seconds**, approaching ComfyUI’s **8.8-second** baseline.  
  [PR #12531](https://github.com/unslothai/unsloth/pull/12531)

- **Qwen-Image INT8 placement improvement:** An open PR extends fused INT8 GEMM usage to cases where the complete denoiser is pinned to GPU. The reported configuration reaches **241 ms/step on an A100** under a 16 GB VRAM budget. A companion change restores torchao weights after oversized requests to avoid a subsequent device mismatch.  
  [PR #12524](https://github.com/unslothai/unsloth/pull/12524) · [PR #12526](https://github.com/unslothai/unsloth/pull/12526)

- **Small-host image-generation route:** An open PR targets T4-class systems with limited host memory by prefetching streamed text encoders and fusing INT8 dequantization. FLUX.1-schnell is reported to improve from **5.19 to 4.49 seconds per step**, with pixel-identical output.  
  [PR #12532](https://github.com/unslothai/unsloth/pull/12532)

- **MiniMax-H3 matmul path:** An open PR selects BF16 cuBLAS matmul instead of INT8 MMQ by default on SM80+ hardware. The reported gain is **1.2×–2.3× per step**, with behavior closer to an FP32 reference.  
  [PR #12527](https://github.com/unslothai/unsloth/pull/12527)

- **Long-prefill lease renewal:** An open PR renews Studio’s chat-generation lease while llama-server continues advancing `prompt_progress`, targeting premature termination during long prompt processing.  
  [PR #12523](https://github.com/unslothai/unsloth/pull/12523)

- **Studio startup budget regression:** An open PR reworks the startup-budget measurement after managed engine changes. The frontend bundle check is reportedly over budget at **1,800.5 KB versus 1,796.9 KB**.  
  [PR #12560](https://github.com/unslothai/unsloth/pull/12560)

## 5. Stability & Regressions

Ranked by likely operational impact:

1. **Severe — Tensor-split throughput regression:** Recent Unsloth builds may be approximately **2.9× slower** with two GPUs in tensor mode. This can invalidate capacity planning and routing assumptions in multi-GPU inference services. No fix PR is identified in the data.  
   [Issue #12468](https://github.com/unslothai/unsloth/issues/12468)

2. **High — Fine-tuning exceeds expected VRAM and causes OOMs:** A heavily discussed open report states that training can consume substantially more VRAM than advertised, preventing fine-tuning of larger models even when nominal capacity appears sufficient. The issue has **23 comments**, making it the most actively discussed item.  
   [Issue #4504](https://github.com/unslothai/unsloth/issues/4504)

3. **High — Qwen3-VL LoRA adapters fail to load in vLLM:** LoRA adapters produced from `Qwen3-VL-8B-Instruct` reportedly fail when loaded into vLLM, despite following the official Unsloth guide. This creates an adapter portability gap between fine-tuning and production serving.  
   [Issue #3560](https://github.com/unslothai/unsloth/issues/3560)

4. **High — Long-context generation can be killed incorrectly:** Studio reports **“Generation stopped making progress”** after a lease expires, even while llama-server is still making prefill progress. The related PR is open and targets the lease-renewal logic.  
   [Issue #12518](https://github.com/unslothai/unsloth/issues/12518) · [PR #12523](https://github.com/unslothai/unsloth/pull/12523)

5. **High — Reported unused VRAM with WSL OOM:** A DeepSeek-R1-Distill-Llama-8B fine-tuning attempt reportedly hits CUDA OOM with approximately **8 GB of 24 GB VRAM apparently unused**, suggesting fragmentation, allocation behavior, or unaccounted memory pressure.  
   [Issue #1797](https://github.com/unslothai/unsloth/issues/1797)

6. **Medium — Qwen3.8/Qwen3.5-family 4-bit checkpoint failure:** Reports included packed 4-bit weights being passed to `linear`, missing `quant_state`, and shape errors on Windows/ROCm and NVIDIA systems. The related issues are now closed, with analysis pointing to both a temporary bitsandbytes compatibility patch and a malformed pre-quantized checkpoint that requires regeneration.  
   [Issue #9867](https://github.com/unslothai/unsloth/issues/9867) · [Issue #10276](https://github.com/unslothai/unsloth/issues/10276) · [Issue #10017](https://github.com/unslothai/unsloth/issues/10017)

7. **Medium — Gemma-4 LoRA training reports no output change:** A report says training loss decreases but generated output remains unchanged. The issue is closed without enough supplied data to establish root cause; users should verify adapter application, target modules, and post-training model loading.  
   [Issue #5355](https://github.com/unslothai/unsloth/issues/5355)

8. **Medium — Multi-GPU Studio training does not use all selected cards:** Studio users report that LoRA fine-tuning operates on only one GPU despite multi-card expectations. An open feature request tracks native multi-GPU support.  
   [Issue #5764](https://github.com/unslothai/unsloth/issues/5764)

9. **Medium — VLM adapter save/load failure:** A new report concerns saving and loading a text-only Gemma 3 variant derived from a VLM workflow.  
   [Issue #12554](https://github.com/unslothai/unsloth/issues/12554)

10. **Medium — Long-context UI lag and generation progress issues:** A new report says long-context chat has begun to lag in Studio/Desktop. Separately, issue #12518 reports incorrect progress termination.  
    [Issue #12552](https://github.com/unslothai/unsloth/issues/12552) · [Issue #12518](https://github.com/unslothai/unsloth/issues/12518)

11. **Lower — Studio networking and state synchronization:** Open reports include inability to bind to `0.0.0.0` as expected and incorrect model synchronization when multiple LAN users access one local server.  
    [Issue #11187](https://github.com/unslothai/unsloth/issues/11187) · [Issue #12365](https://github.com/unslothai/unsloth/issues/12365)

12. **Lower — Agent/tool-call reliability and security hygiene:** Tool calls and projects were reported as randomly failing after updates; the issue is closed. A separate closed issue addressed requiring consent before FP8/FP4 export automatically installs `llm-compressor`, reducing unexpected environment mutation.  
    [Issue #12435](https://github.com/unslothai/unsloth/issues/12435) · [Issue #8904](https://github.com/unslothai/unsloth/issues/8904)

## 6. What This Means for Application Developers

- **Pin and benchmark inference builds immediately.** Recent tensor-split builds show a potentially severe throughput regression; compare current Unsloth binaries against a known-good release and official `ggml-org` builds before deploying multi-GPU routes.
- **Do not assume advertised fine-tuning memory is a hard guarantee.** Validate actual peak allocation with the target sequence length, batch size, quantization method, and model architecture. Keep conservative headroom and monitor host RAM as well as GPU VRAM.
- **Test the complete fine-tuning-to-serving path.** Qwen3-VL LoRA adapters may fine-tune successfully but fail when loaded by vLLM. Validate adapter conversion, model architecture metadata, and inference-engine compatibility in CI.
- **Treat Studio’s current agent features as evolving.** Recent issues affected tool calls, skills, generation leases, and multi-user model state. For production agents, prefer API-level health checks and explicit generation progress monitoring over relying solely on UI state.
- **Use long-context timeouts conservatively.** Keepalive and lease behavior during prefill remains under active repair; use workloads that fit the serving engine’s tested context limits and alert on `prompt_progress` or equivalent backend telemetry.
- **Track the Studio optimization work if your workload uses image/video generation.** The open kernel and placement changes target meaningful improvements on T4/A100 and small-VRAM systems, but they are not yet merged and should be evaluated against current builds for both performance and output correctness.

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*