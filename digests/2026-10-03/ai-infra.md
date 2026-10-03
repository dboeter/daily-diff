# AI Infrastructure Digest 2026-10-03

> Generated: 2026-10-03 08:33 UTC | Projects covered: 6

- [vLLM](https://github.com/vllm-project/vllm)
- [SGLang](https://github.com/sgl-project/sglang)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://github.com/ollama/ollama)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Unsloth](https://github.com/unslothai/unsloth)

---

## Cross-Project Comparison

# Cross-Project Infrastructure Comparison — 2026-10-03

## 1. Ecosystem Overview

Today’s activity shows a broad shift from basic model execution toward **long-context, sparse-attention, speculative-decoding, and memory-lifecycle optimization**. Serving engines such as vLLM and SGLang are concentrating on hybrid KV-cache management, disaggregated prefill/decode, and hardware-specific kernels, while llama.cpp is shipping the broadest incremental runtime and model-support train. At the gateway layer, LiteLLM is improving distributed routing, stream validation, usage attribution, and protocol translation, but budget and multimodal correctness remain material risks. Unsloth is extending Studio into preference/RL fine-tuning and optimized generative-media workflows, although serving regressions highlight the cost of rapid GPU-path experimentation. Overall, the ecosystem is highly active but increasingly requires **pinned versions, workload-specific validation, and backend-specific operational safeguards**.

## 2. Activity Comparison

> Counts below are **unique issue and PR numbers explicitly referenced in the supplied digests**, not full repository totals.

| Project | Issues referenced | PRs referenced | Release status |
|---|---:|---:|---|
| **vLLM** | 17 | 13 | No release in the last 24 hours |
| **SGLang** | 23 | 16 | No release in the last 24 hours |
| **llama.cpp** | 14 | 28 | **20 builds shipped**, b11351–b11370 |
| **Ollama** | 14 | 14 | No release in the last 24 hours |
| **LiteLLM** | 20 | 12 | No release in the last 24 hours |
| **Unsloth** | 16 | 7 | No release in the last 24 hours |

### Release interpretation

- **llama.cpp has the strongest release cadence**, shipping multiple kernel, backend, model, and API changes.
- **vLLM and SGLang** are investing heavily in unreleased fixes and optimization stacks; their production behavior therefore remains tied to exact nightlies or commits.
- **LiteLLM, Ollama, and Unsloth** are primarily accumulating fixes and proposals rather than shipping immediately.
- The volume of referenced issues is not a direct quality score: vLLM and SGLang digests emphasize deep technical investigations, while gateways and application layers naturally accumulate more integration-specific reports.

## 3. Model Support Race

### Shipped or landed support

**llama.cpp leads in immediately available breadth:**

- **Nimble decision model** support, including Ollama’s Nimble integration path.
- **SystemOne** model families through `/v1/systemone`, including shared prefixes and vision support.
- **Metal F16-KV flash attention** expanded across additional head sizes, attention sinks, ALiBi, and logit softcapping.
- **LFM2.5 encoder** conversion support was merged during the period, although release availability should still be confirmed by build.
- **Samsung Vulkan compatibility** landed through small shared-memory workgroup constraints.
- Existing **qwen4exp/GLM5-next mask paths** were optimized.

### Actively developed, but not generally released

**vLLM**

- ROCm fused QK-norm, RoPE, and gating kernels for **Qwen3-Next/Qwen3.5**.
- Work on **DeepSeek-V4.1-Flash**, **GLM-5.3-Flash**, and **Kimi K3** kernels and KV-cache behavior.
- Newer support is constrained by SM120 speculative-decoding and throughput issues.

**SGLang**

- A dedicated **DeepSeek-V4.1 optimization roadmap** spanning prefill indexing, sparse decode, tensor parallelism, and Hopper kernels.
- A five-PR context-parallel stack for **GLM-5.3-Flash**, including MoE/EP and B200 validation.
- **InternVL** Rust multimodal datapath and a unified-cache path for DeepSeek-V4.1/DSpark.
- DeepSeek-V4.1 remains blocked on non-SM100 accelerators such as SM12x and GB10.

**Ollama**

- MLX decision-model/readout refactoring is in progress.
- A proposed llama.cpp update from b11232 to b11351 is pending.
- No definitive new model or backend support shipped.

**Unsloth**

- Idefics3/Granite Docling VLM support remains an open, long-running effort.
- MiniMax-H3 INT8, Qwen-Image-2.1, and Wan2.2 optimizations are under development.
- DPO, ORPO, GRPO, and rule-based reward fine-tuning are proposed but not merged.

### Competitive assessment

- **Immediate model/runtime breadth:** **llama.cpp**
- **Frontier large-model optimization:** **SGLang**, narrowly ahead of vLLM for DeepSeek-V4.1-focused work
- **Production serving ecosystem maturity and model-path depth:** **vLLM**, though it has more exposed correctness and hardware regressions
- **Fine-tuning and Studio expansion:** **Unsloth**
- **Consumer/local integration:** **Ollama**, but its own model advances are mostly pending

## 4. Performance Frontier

### KV cache and memory lifecycle

This is the dominant theme across serving projects.

- **vLLM** is addressing sleep/wake remapping for remote KV registrations, filesystem-tier eviction, CUDA-graph release during sleep mode, and hybrid-model/MTP cache regressions.
- **SGLang** is improving unified prefix-cache abstractions, persistent eviction heaps, hybrid-SWA sizing, and PD allocation policies that defer destination reservation until prefill completes.
- A critical vLLM ROCm report alleges **silent GLM-5.3-Flash sparse-index corruption**, affecting long-context recall without necessarily breaking fluency.
- SGLang has an open **hybrid-SWA admission livelock** in which GPU memory remains idle while a request stays waiting.

**Assessment:** KV-cache correctness and lifecycle management are currently more important than small raw-kernel gains, especially for hybrid, sparse, and disaggregated architectures.

### Speculative decoding and batching

- **vLLM** is optimizing speculative verification for `1 + K` query tokens, but reports include **0% acceptance** in multiple MTP/PD configurations.
- **SGLang** is fixing DSpark/EPLB CUDA-graph incompatibilities and deep model-specific scheduling issues.
- **llama.cpp** shipped probabilistic drafting and rejection verification, but reports of SM120 batch non-invariance threaten exact verification semantics.
- Unsloth reports a multi-GPU tensor-split decode regression from roughly **115–120+ to 48 tokens/s**.

**Assessment:** Speculative decoding has moved from a straightforward throughput feature to a cross-stack correctness problem involving cache groups, graph capture, batch invariance, and scheduler behavior.

### Quantization and low-level kernels

- **vLLM:** FP8 group-quantization reduction, ROCm fused norms/RoPE/gating, RDNA3 GPTQ accuracy, and AOT compile-cache correctness.
- **llama.cpp:** CUDA MoE shared-expert fusion, qwen4exp mask optimization, and a major qwen4exp indexer memory reduction from about **4 GB to 0.5 GB** at 131K context/batch 4096.
- **SGLang:** DeepSeek fused Hopper prefill scoring, SM100 LiteTopK sparse decode, and fused MXFP8/SwiGLU work.
- **Unsloth:** fused INT8 generation, denoiser residency, and VAE tiling avoidance.

**Assessment:** llama.cpp currently has the clearest landed efficiency gains, while vLLM and SGLang hold greater frontier-kernel potential but with more integration risk.

### Distributed serving

- **vLLM:** pipeline communication reduction and KV-connector lifecycle work for disaggregated P/D.
- **SGLang:** `prefill_complete` decode allocation, unified-cache support, and context parallelism.
- **LiteLLM:** proposed Kubernetes pod discovery could route requests across individual self-hosted GPU pods rather than a headless service endpoint.
- **llama.cpp:** NCCL-backed multi-process and multi-node tensor parallelism is under development.

**Assessment:** disaggregated serving is moving from architectural experimentation toward operational policy and connector compatibility, but lifecycle and failover behavior remain under-tested.

## 5. Layer Positioning

| Project | Primary role | Best fit | Main current risk |
|---|---|---|---|
| **vLLM** | High-throughput LLM serving engine | Datacenter GPU inference, P/D disaggregation, high-concurrency OpenAI-compatible serving | Correctness regressions in sparse KV, speculative decoding, structured output, and emerging hardware paths |
| **SGLang** | High-performance serving engine with strong frontier-model specialization | DeepSeek/GLM, sparse attention, structured generation, disaggregated serving | Rapidly evolving feature stack, backend crashes, scheduler/cache livelocks, tool-call regressions |
| **llama.cpp** | Portable local/edge runtime and server | CPU, Metal, CUDA, Vulkan, heterogeneous devices, GGUF/quantized inference | Backend-specific memory safety, multi-GPU reliability, and scheduler head-of-line blocking |
| **Ollama** | Local-model manager and convenience runtime | Desktop/developer use, simple model lifecycle, llama.cpp-backed serving | Tool/structured-output compatibility, hardware utilization, cloud availability |
| **LiteLLM** | LLM gateway and control plane | Multi-provider routing, budgets, auth, observability, protocol normalization | Budget bypasses, dropped multimodal content, protocol translation, and health-state leakage |
| **Unsloth** | Fine-tuning/training framework and Studio application layer | Efficient LoRA/fine-tuning, preference optimization, image/video workflows | VRAM variability, prebuilt GPU regressions, cancellation lifecycle, and Studio latency |

### Architectural distinction

- **vLLM and SGLang** compete most directly at the high-throughput GPU serving-engine layer.
- **llama.cpp** is differentiated by portability, quantization breadth, and local/edge execution, although its server is increasingly capable.
- **Ollama** generally sits above llama.cpp as the model-management and developer-experience layer.
- **LiteLLM** does not replace the inference engines; it governs routing, authentication, budgets, observability, and provider/protocol compatibility around them.
- **Unsloth** is primarily a training and Studio layer, although its inference paths increasingly overlap with the local-runtime category.

## 6. Trend Signals

### 1. Sparse and hybrid attention is becoming the central systems challenge

DeepSeek-V4.1, GLM-5.3-Flash, Qwen3.x variants, and related architectures are driving work in sparse indexes, prefill scoring, hybrid-SWA memory pools, and model-specific KV layouts. The key risk is shifting from “the model runs” to **whether cache state remains correct under realistic long-context workloads**.

### 2. Speculative decoding is becoming a correctness-sensitive subsystem

Acceptance rate alone is insufficient. Teams now need to test target-output equivalence, cache isolation, structured-output constraints, grammar behavior, graph capture, and batch invariance. Zero acceptance, draft contamination, and provider-specific sampling differences can erase performance gains or introduce correctness failures.

### 3. Operational observability is catching up with serving complexity

vLLM needs deferred-backlog monitoring; SGLang needs detection of an idle-GPU/waiting-request livelock; LiteLLM needs deployment-specific health attribution; and gateways need strict stream completion. A simple health endpoint or GPU-utilization signal is no longer enough to establish that requests are progressing safely.

### 4. Protocol compatibility is becoming an application-level risk

Tool calls, structured output, reasoning channels, citations, cache-control fields, and multimodal payloads are being translated through multiple APIs. Agent applications should test **streaming and non-streaming behavior across the complete gateway → runtime → model-template chain**, rather than testing each component independently.

### 5. Hardware-specific support is diverging

SM120, GB10, RDNA3, integrated GPUs, Samsung Vulkan, SYCL, and Metal each show different failures in graph capture, memory accounting, kernels, or hardware detection. “CUDA supported” is no longer an adequate deployment descriptor; the exact GPU architecture, backend, kernel, graph mode, and topology should be recorded.

### 6. Fast-moving upstream changes favor reproducibility

Only llama.cpp shipped a broad build train today, while the other projects have many high-impact changes in open PRs or unreleased commits. Production teams should pin image digests or source revisions and explicitly track included commits rather than relying on `latest`, default branches, or assumed PR availability.

### Practical watchlist for agent/application developers

- Test parallel tool-call correlation by `tool_call_id`, especially under streaming, whitespace chunking, MTP, and multi-token output.
- Enforce explicit multimodal-part validation; HTTP 200 does not guarantee images, audio, files, or video reached the model.
- Add long-context known-answer retrieval tests rather than judging correctness from fluent output.
- Validate cancellation, timeout, stream truncation, retry classification, and fallback routing.
- Keep independent spend controls outside LiteLLM until budget enforcement is independently verified.
- Benchmark the exact production path—including gateway and template layers—not only the raw inference engine.
- Record acceptance rate, cache-hit rate, TTFT, inter-token latency, mixed prefill/decode step time, output tokens/s, and request-backlog age together.

---

## Per-Project Reports

<details>
<summary><strong>vLLM</strong> — <a href="https://github.com/vllm-project/vllm">vllm-project/vllm</a></summary>

# vLLM Daily Digest — 2026-10-03

## 1. Today's Highlights

vLLM had no new release in the last 24 hours, but development activity was substantial across speculative decoding, KV-cache lifecycle management, disaggregated serving, and ROCm correctness. The most consequential items are fixes for silent KV-cache corruption, zero speculative acceptance rates, CUDA-graph/resource handling during sleep mode, and several pipeline/prefix-cache regressions.

For production teams, the near-term focus should be validating hybrid-model/MTP configurations, disaggregated prefill–decode deployments, and newer Blackwell/ROCm paths before adopting the latest nightlies.

## 2. Releases & Breaking Changes

No new vLLM releases were published in the last 24 hours.

Potentially relevant compatibility and configuration changes are still in progress:

- **Transformers v5 upgrade remains an active blocker.** The project maintains a living issue for compatibility work: [#38379](https://github.com/vllm-project/vllm/issues/38379).
- **Sleep-mode support is being tightened around KV connectors.** The new connector API is intended to ensure that remote memory registrations are released and restored correctly when KV-cache physical mappings change: [#59624](https://github.com/vllm-project/vllm/pull/59624), with Mooncake and NIXL implementations in [#59625](https://github.com/vllm-project/vllm/pull/59625) and [#59635](https://github.com/vllm-project/vllm/pull/59635).
- **AOT compile cache behavior is being corrected.** PR [#59231](https://github.com/vllm-project/vllm/pull/59231) adds the resolved quantization-kernel selection to the compile-cache key, preventing reuse of incompatible artifacts after kernel-selection changes.

These changes are PRs/issues rather than released migration requirements; operators should avoid assuming they are available in production images unless the corresponding commit is included.

## 3. New Model & Hardware Support

No definitive new model or hardware-support announcement was released today. Notable backend enablement and model-path work includes:

- **ROCm fused QK-norm, RoPE, and gating kernel** for Qwen3-Next/Qwen3.5 is being enabled through Triton: [PR #51406](https://github.com/vllm-project/vllm/pull/51406).
- **RDNA3 W4A16 accuracy and determinism** are being addressed for GPTQ split-K kernels: [PR #54706](https://github.com/vllm-project/vllm/pull/54706).
- **SM120 Blackwell speculative decoding** remains an active compatibility focus. GLM-5.3-Flash MTP acceptance is reported at 0% with the native `FLASHINFER_MLA_SPARSE_SM120` backend: [issue #59724](https://github.com/vllm-project/vllm/issues/59724).
- **DeepSeek-V4.1-Flash on SM120** has a reported severe decode-throughput problem with `--enforce-eager`, while CUDA graphs are reportedly unusable: [issue #56892](https://github.com/vllm-project/vllm/issues/56892).
- **Kimi K3 support tracking** remains active, covering KV-cache behavior and model-specific kernels: [issue #50001](https://github.com/vllm-project/vllm/issues/50001).

## 4. Performance & Optimization

### Work in progress or proposed

- **Pipeline-parallel communication optimization:** PR [#53948](https://github.com/vllm-project/vllm/pull/53948) defers sampled-result receives on non-final pipeline stages, reducing unnecessary NCCL receiver activity between scheduler steps.
- **Speculative-decode attention optimization:** PR [#56148](https://github.com/vllm-project/vllm/pull/56148) adds a multi-query Triton split-K path for speculative verification, targeting batches with only `1 + K` query tokens per request.
- **FP8 group-quantization reduction:** PR [#59564](https://github.com/vllm-project/vllm/pull/59564) changes the compiled implementation to use a value-only reduction, matching the CUDA implementation and avoiding unnecessary index reduction.
- **ROCm KV-cache memory savings:** issue [#55132](https://github.com/vllm-project/vllm/issues/55132) reports that sparse-MLA profiling reserves a theoretical 32 GiB decode-logits workspace per GPU, consuming approximately **21% of the KV cache** for a 1M-context deployment.
- **FS KV-offload capacity controls:** PR [#54327](https://github.com/vllm-project/vllm/pull/54327) adds bounded filesystem-tier capacity and LRU eviction.
- **Sleep-mode CUDA-graph release:** PR [#59160](https://github.com/vllm-project/vllm/pull/59160) adds an opt-in `sleep_mode_offload_cudagraph` option to release CUDA graph memory pools during sleep.
- **Weight-loading-bound startup:** the project is working toward activating additional compatible replicas after the first, without sacrificing serving behavior, throughput, or context capacity: [roadmap issue #48193](https://github.com/vllm-project/vllm/issues/48193).

### Reported performance concerns

- Qwen3.5 397B NVFP4 with DEP8 is reported to have a **6× longer mixed prefill/decode step** than a decode-only step: [issue #44806](https://github.com/vllm-project/vllm/issues/44806).
- Gemma-4-26B-A4B-NVFP4 with MTP is reported slower on vLLM 0.23.0 than on 0.21.0 for RTX PRO 6000 Blackwell systems: [issue #47047](https://github.com/vllm-project/vllm/issues/47047).

## 5. Stability & Regressions

Ranked by likely operational impact:

1. **Potential silent KV-cache corruption on ROCm/GLM-5.3-Flash — critical correctness issue.**  
   The kpool sparse indexer reportedly writes 4,096 entries into 864 slots, potentially corrupting approximately **79% of indexer keys** while allowing fluent output and thereby hiding long-context recall failures: [issue #54359](https://github.com/vllm-project/vllm/issues/54359).  
   **Status:** Open; no fix PR is identified in the supplied data.

2. **Zero speculative acceptance in multiple configurations — high performance/correctness concern.**  
   Reported cases include GLM-5.3-Flash with SM120 MTP and `FLASHINFER_MLA_SPARSE_SM120`: [issue #59724](https://github.com/vllm-project/vllm/issues/59724), and Qwen3.8-flash-next with disaggregated prefill/decode serving: [issue #59642](https://github.com/vllm-project/vllm/issues/59642).  
   Related drafter-group detection and prefix-cache behavior are tracked in [#57032](https://github.com/vllm-project/vllm/issues/57032) and [#51771](https://github.com/vllm-project/vllm/issues/51771).

3. **Scheduler may stop admitting requests under load — high availability issue.**  
   The engine can appear healthy while a deferred backlog grows: [issue #53130](https://github.com/vllm-project/vllm/issues/53130).  
   **Status:** Open; no fix PR is identified.

4. **ROCm GLM-5.3-Flash produces gibberish at low concurrency — high output-integrity issue.**  
   [Issue #59413](https://github.com/vllm-project/vllm/issues/59413).  
   **Status:** Open; no fix PR is identified.

5. **Potential structured-output constraint violation with stale speculative draft hand-off — high correctness issue.**  
   Unconstrained tokens may be sampled when combining speculative decoding, async scheduling, and pipeline parallelism: [issue #54437](https://github.com/vllm-project/vllm/issues/54437).

6. **DSpark bonus-token KV slot reservation bug — potential cross-request corruption.**  
   At KV-block boundaries, the bonus query could use stale block-table metadata and corrupt another request’s target KV: [issue #59104](https://github.com/vllm-project/vllm/issues/59104).  
   **Fix PR:** [#59105](https://github.com/vllm-project/vllm/pull/59105), which reserves `N+1` slots for the affected layout.

7. **Hybrid GDN/MTP prefix-cache regression — high performance issue.**  
   Qwen3.5-122B-A10B with MTP may fail to reach reusable cached-prefix depth, and prompts aligned to the hash-unit boundary can receive no cache hit: [issue #51771](https://github.com/vllm-project/vllm/issues/51771).  
   **Fix PR:** [#52244](https://github.com/vllm-project/vllm/pull/52244), targeting Model Runner V1.

8. **Gemma 4 with Transformers 5.15.0 fails to start in the `latest` image — deployment/compatibility issue.**  
   [Issue #51744](https://github.com/vllm-project/vllm/issues/51744) is closed, but the supplied data does not identify the corresponding fix PR. Users should verify the image contents and pin a known-compatible image rather than relying on `latest`.

9. **Intermittent multimodal embeddings API crash — medium/high stability issue.**  
   Qwen3-VL-Embedding-8B can fail preprocessing with `Expected a cached item for mm_hash`: [issue #33865](https://github.com/vllm-project/vllm/issues/33865).  
   **Status:** Closed; no fix PR is identified.

## 6. What This Means for Application Developers

- **Pin images and validate dependency compatibility.** `vllm/vllm-openai:latest` is not a sufficient production contract, particularly while Transformers v5 compatibility is still being completed. Track [#38379](https://github.com/vllm-project/vllm/issues/38379) and use reproducible image digests.
- **Exercise long-context recall, not just fluency.** The ROCm GLM-5.3-Flash issue in [#54359](https://github.com/vllm-project/vllm/issues/54359) is especially dangerous because corrupted output can still appear coherent. Use known-answer retrieval tests before deploying affected model/backend combinations.
- **Benchmark speculative decoding end to end.** Check acceptance rate, effective output tokens/sec, KV-cache hit rate, and mixed prefill/decode latency together. A 0% acceptance path can erase the expected benefit of MTP/EAGLE/DFlash and may indicate cache-group or backend incompatibilities.
- **Use safety gates for structured outputs.** Applications relying on JSON Schema, tool arguments, or constrained decoding should test stale draft hand-offs and async/pipeline-parallel combinations; [#54437](https://github.com/vllm-project/vllm/issues/54437) indicates possible constraint violations.
- **Treat disaggregated serving as a distinct deployment target.** P/D workers must use compatible KV-connector versions and test connector sleep/wake behavior. Review the new lifecycle work in [#59624](https://github.com/vllm-project/vllm/pull/59624), [#59625](https://github.com/vllm-project/vllm/pull/59625), and [#59635](https://github.com/vllm-project/vllm/pull/59635).
- **Add load-shed and backlog monitoring.** Because the scheduler issue in [#53130](https://github.com/vllm-project/vllm/issues/53130) can grow a deferred queue while the engine appears healthy, monitor admitted/running/waiting requests, queue age, and cancellation behavior—not only GPU utilization and request success rate.
- **Prefer explicit hardware validation on Blackwell and ROCm.** For SM120 and RDNA3, compare eager and compiled execution, native and fallback kernels, and graph capture; several current regressions are hardware/backend-specific rather than general model failures.

</details>

<details>
<summary><strong>SGLang</strong> — <a href="https://github.com/sgl-project/sglang">sgl-project/sglang</a></summary>

# SGLang Digest — 2026-10-03

## Today’s Highlights

DeepSeek-V4.1 optimization dominated the day, with active work on prefill indexing, sparse decode paths, Hopper kernels, context parallelism, unified-cache support, and SM120 compatibility ([roadmap](https://github.com/sgl-project/sglang/issues/42170), [prefill indexer PR](https://github.com/sgl-project/sglang/pull/41659)). SGLang also continued improving prefix-cache efficiency, hybrid-SWA memory management, and PD-disaggregated KV allocation ([unified cache refactor](https://github.com/sgl-project/sglang/pull/42362), [lazy eviction heap](https://github.com/sgl-project/sglang/pull/38371), [PD allocation policy](https://github.com/sgl-project/sglang/pull/40703)). No new release was published in the last 24 hours.

## New Model & Hardware Support

- **DeepSeek-V4.1 optimization roadmap:** A newly created tracking issue coordinates mHC cleanup, prefill optimizations, mHC tensor parallelism, and kernel fusion work ([#42170](https://github.com/sgl-project/sglang/issues/42170)).
- **Context parallelism for GLM-5.3-Flash:** A five-PR stack is adding DSA-interleaved attention DP, dense TP, MoE/EP support, and GLM-5.3-Flash validation on B200. Components are still open and must land in stack order ([attention DP/TP](https://github.com/sgl-project/sglang/pull/42038), [scattered MoE inputs](https://github.com/sgl-project/sglang/pull/42041), [layer-boundary support](https://github.com/sgl-project/sglang/pull/42044), [B200 validation](https://github.com/sgl-project/sglang/pull/42045)).
- **DeepSeek-V4.1 on non-SM100 accelerators:** Current sparse-MQA candidate indexing reportedly depends on an SM100-only DeepGEMM path, blocking initialization on SM12x/GB10 ([#42364](https://github.com/sgl-project/sglang/issues/42364)).
- **DeepSeek-V4.1 unified-cache support:** An open PR adapts the UMBP direct linker for ratio-1/2 compressed layers and packed draft layers used with DSpark ([#42197](https://github.com/sgl-project/sglang/pull/42197)).
- **InternVL Rust datapath:** Work is underway to extend native Rust server-pipeline multimodal processing beyond Qwen-VL to InternVL, avoiding Python per-image feature handoff ([#42237](https://github.com/sgl-project/sglang/issues/42237)).
- **MUSA kernel coverage:** Direct AOT RoPE and fused multiply-add tests were added to improve numerical coverage of Moore Threads kernels ([#42357](https://github.com/sgl-project/sglang/pull/42357)).
- **FlashInfer Cake kernels:** A model-by-model integration tracker was opened for validating Cake kernels end to end; production support and performance gains are not yet validated ([#42176](https://github.com/sgl-project/sglang/issues/42176)).

## Performance & Optimization

- **DeepSeek-V4.1 prefill indexing:** An open PR removes intermediate sorting/remapping, introduces raw selection and row-pair schedule IDs, and eliminates host synchronization from the low-ratio prefill indexer ([#41659](https://github.com/sgl-project/sglang/pull/41659)).
- **Fused Hopper prefill scoring:** A Triton implementation aims to collapse DeepSeek-V4.1 ratio-1/2 prefill indexer scoring into one kernel ([#42365](https://github.com/sgl-project/sglang/pull/42365)).
- **Sparse decode top-512 path:** An opt-in SM100 LiteTopK decode path targets DeepSeek-V4.1’s paged-KV selection, reducing the candidate set from the full index score space to 512 positions ([#42351](https://github.com/sgl-project/sglang/pull/42351)).
- **Persistent cache eviction:** `UnifiedRadixCache` currently rebuilds and discards a heap over every evictable device or host leaf on each eviction call. An open PR makes that heap persistent while preserving bit-identical eviction ordering ([#38371](https://github.com/sgl-project/sglang/pull/38371)).
- **Prefix-sharing capability cleanup:** A new abstraction, `supports_prefix_sharing()`, replaces separate chunk/tree cache checks and explicitly describes whether cached prefixes remain shareable after a request completes ([#42362](https://github.com/sgl-project/sglang/pull/42362)).
- **PD-disaggregated decode scheduling:** A proposed `--disaggregation-decode-allocation-policy prefill_complete` delays destination KV reservation until prefill finishes, preventing long prefills from consuming decode capacity prematurely ([#40703](https://github.com/sgl-project/sglang/pull/40703)).
- **Hybrid-SWA memory sizing:** Open work enables post-CUDA-graph KV sizing for the unified hybrid-SWA pool, allowing the shared byte arena to be sized from measured free memory ([#41961](https://github.com/sgl-project/sglang/pull/41961)).
- **Diffusion output pipeline:** LTX-2 profiling found serial MP4 encoding and saving consumed **20–40% of client latency**—about **1.1–1.4 seconds** in a reported run. Async output saving is being added to overlap disk work with the next request ([issue](https://github.com/sgl-project/sglang/issues/41892), [PR](https://github.com/sgl-project/sglang/pull/37549)).
- **MiniMax-M3 quantized MLP:** A proposed Triton fusion combines SwiGLU with MXFP8 quantization, removing an intermediate activation write/read and one kernel launch ([#39531](https://github.com/sgl-project/sglang/pull/39531)).
- **Multi-detokenizer IPC:** `MultiDetokenizerRouter` currently serializes and sends scheduler output one request at a time, creating a potential router/IPC bottleneck in multi-tokenizer deployments ([#42217](https://github.com/sgl-project/sglang/issues/42217)).
- **DeepSeek-V4 Pro checkpoint loading:** On one 8×B300 node, checkpoint prefetch completed in roughly **62–73 seconds**, but total loading reached about **95 minutes** with the current tensor-copy worker count; limiting workers reduced the observation to **3.3 minutes** ([#42361](https://github.com/sgl-project/sglang/issues/42361)).

## Stability & Regressions

1. **Critical — hybrid-SWA admission livelock:** With the radix cache enabled and a tight SWA pool, a finished request’s untrimmed last chunk can remain pinned, leaving one request waiting, nothing running, and the GPU idle. Reported on MiMo-V2.6-Flash with a 128-token window and page size 1. No fix PR is identified in today’s data. ([#41579](https://github.com/sgl-project/sglang/issues/41579))

2. **High — engine termination from expert-distribution endpoint:** Calling the endpoint when `expert_distribution_recorder_mode` is unset raises in the scheduler and can terminate the engine instead of returning an error. ([#42222](https://github.com/sgl-project/sglang/issues/42222))

3. **High — tool-call correctness regressions:** Multiple parser and routing issues were reported:
   - Anthropic system prompts are merged ahead of turn content, causing repeated prefix-cache misses ([#42272](https://github.com/sgl-project/sglang/issues/42272)).
   - GLM-4.7 may drop tool calls when `response_format` is combined with tools and instead invent JSON content ([#42269](https://github.com/sgl-project/sglang/issues/42269)).
   - Anthropic streaming can lose a tool call’s closing brace when whitespace interrupts argument streaming ([#42260](https://github.com/sgl-project/sglang/issues/42260)).
   - DeepSeek V3 with MTP or multi-token streaming can emit a spurious `{}` fragment when fence and end tokens arrive together ([#42327](https://github.com/sgl-project/sglang/issues/42327)).
   - Harmony streaming may expose tool arguments on the analysis channel as reasoning ([#42143](https://github.com/sgl-project/sglang/issues/42143)).
   - GLM4 tool arguments are rewritten when string values resemble JSON, such as `"true"` becoming `"True"` ([#42133](https://github.com/sgl-project/sglang/issues/42133)).

4. **High — backend initialization and CUDA-graph failures:** GLM-5.3-Flash on SM120 reportedly crashes in the FA4 attention backend during hybrid-extend CUDA-graph capture; Triton is currently the only working backend in the reported matrix. ([#42012](https://github.com/sgl-project/sglang/issues/42012)) Separately, DeepSeek-V4 on SM120 reportedly loses the C4 row-chunk planner when the paged-MQA logits Torch path is enabled, adding **3.3–3.8 GiB** at 128K context ([#42146](https://github.com/sgl-project/sglang/issues/42146)).

5. **Medium — speculative-decoding compatibility:** `--enable-eplb` with DSPARK can crash during draft CUDA-graph capture because of an expert-selection `scatter_add_` dimension mismatch, while a separate report suggests unsynchronized graph memory checks may cause startup hangs ([EPLB/DSpark crash](https://github.com/sgl-project/sglang/issues/34974), [startup hang](https://github.com/sgl-project/sglang/issues/39886)).

6. **Medium — closed/inactive historical regressions:** Several older issues were closed without an identified fix in the supplied data, including EAGLE prefix reuse collapsing from **97% to 40–53%** on GLM-DSA NVFP4 ([#32459](https://github.com/sgl-project/sglang/issues/32459)), AMD EAGLE3 lacking a MiniMax-M3 sparse decode path ([#33383](https://github.com/sgl-project/sglang/issues/33383)), and OLMo-2 fused QK normalization being bypassed ([#33415](https://github.com/sgl-project/sglang/issues/33415)).

7. **Operational:** The main CI tracker reported **1 broken, 5 flaky, and 1,131 recently fixed** items as of 08:26 UTC; AMD PR-test tracking also remains active ([#17050](https://github.com/sgl-project/sglang/issues/17050), [AMD tracker](https://github.com/sgl-project/sglang/issues/37451)).

## What This Means for Application Developers

- **Treat DeepSeek-V4.1 support as actively evolving, not universally production-ready.** Hopper/SM100 and B200 deployments are the primary optimization targets; SM120/GB10 users should verify attention-backend and indexer support before deployment ([roadmap](https://github.com/sgl-project/sglang/issues/42170), [SM12x blocker](https://github.com/sgl-project/sglang/issues/42364)).
- **Add strict tool-call integration tests.** Validate non-streaming and streaming behavior with multiple tools, whitespace, `response_format`, MTP, and multi-token stream intervals; several parser failures are semantic rather than crashes ([#42269](https://github.com/sgl-project/sglang/issues/42269), [#42327](https://github.com/sgl-project/sglang/issues/42327)).
- **Monitor prefix-cache hit rate for conversational workloads**, particularly when using Anthropic-compatible messages and system-first templates ([#42272](https://github.com/sgl-project/sglang/issues/42272)).
- **Use Triton as the safer attention backend for GLM-5.3-Flash on SM120** until the FA4 graph-capture regression is resolved ([#42012](https://github.com/sgl-project/sglang/issues/42012)).
- **Watch scheduler and memory health on hybrid-SWA models.** An apparently idle engine with a perpetually waiting request may indicate cache admission livelock rather than lack of client traffic ([#41579](https://github.com/sgl-project/sglang/issues/41579)).
- **Avoid relying on optional experimental paths without feature flags and fallbacks**, especially DSpark speculative decoding, DeepSeek sparse indexing, context parallelism, and asynchronous diffusion saving ([#34974](https://github.com/sgl-project/sglang/issues/34974), [async output saving](https://github.com/sgl-project/sglang/pull/37549)).

</details>

<details>
<summary><strong>llama.cpp</strong> — <a href="https://github.com/ggml-org/llama.cpp">ggml-org/llama.cpp</a></summary>

# llama.cpp Digest — 2026-10-03

## 1. Today’s Highlights

llama.cpp shipped CUDA MoE kernel fusion, probabilistic speculative sampling, Metal F16-KV flash attention, a new `ggml_backend_buft_alloc_buffer_n` interface, and fixes for quantization scale search and aliased softmax-back operations. Model-support updates include Nimble, SystemOne, LFM2.5 encoders, Prism Bonsai 2, and expanded qwen4exp optimizations. The issue queue remains active around multi-GPU prefill reliability, CUDA MMQ memory safety, SYCL correctness, batch invariance, and server-side cross-request isolation.

## 2. Releases & Breaking Changes

Releases [b11370](https://github.com/ggml-org/llama.cpp/releases/tag/b11370) through [b11351](https://github.com/ggml-org/llama.cpp/releases/tag/b11351) are available.

- **GGML buffer API extension:** `ggml_backend_buft_alloc_buffer_n` was added to the backend buffer-type interface. Out-of-tree backends implementing `ggml_backend_buffer_type_i` may need to compile against the extended interface; a default implementation is supplied. [Release b11351](https://github.com/ggml-org/llama.cpp/releases/tag/b11351) · [PR #23671](https://github.com/ggml-org/llama.cpp/pull/23671)
- **Speculative decoding behavior/configuration:** b11368 adds probabilistic draft generation and rejection-sampling verification, with argmax fallback for grammar-constrained requests and an option controlling probabilistic behavior. Operators using deterministic assumptions should regression-test acceptance, sampling, and grammar-constrained speculative decoding. [Release b11368](https://github.com/ggml-org/llama.cpp/releases/tag/b11368) · [PR #27694](https://github.com/ggml-org/llama.cpp/pull/27694)
- No release is explicitly labeled as a breaking change.

## 3. New Model & Hardware Support

### Landed

- **Nimble decision model:** Model support was added in b11364. [Release](https://github.com/ggml-org/llama.cpp/releases/tag/b11364) · [PR #29844](https://github.com/ggml-org/llama.cpp/pull/29844)
- **SystemOne models:** `llama-server` gained `/v1/systemone`, shared prompt prefixes, and vision support for the Laya, Julia-1, LEV, OpenJev, and Kev model families. [Release b11361](https://github.com/ggml-org/llama.cpp/releases/tag/b11361) · [PR #29818](https://github.com/ggml-org/llama.cpp/pull/29818)
- **Metal F16 KV flash attention:** Tensor API FA kernels now cover additional head-size combinations and support attention sinks, ALiBi, and logit softcapping. [Release b11362](https://github.com/ggml-org/llama.cpp/releases/tag/b11362) · [PR #29570](https://github.com/ggml-org/llama.cpp/pull/29570)
- **Samsung Vulkan compatibility:** Large matmul tiles are disabled on Samsung GPUs with only 32 KB of shared memory, avoiding unsupported workgroup configurations. [Release b11355](https://github.com/ggml-org/llama.cpp/releases/tag/b11355) · [PR #28531](https://github.com/ggml-org/llama.cpp/pull/28531)

### In Progress

- **LFM2.5 encoders:** Conversion support for `Lfm2BidirectionalForMaskedLM`, covering LFM2.5-Encoder-350M and 230M, was merged during the period. [PR #29862](https://github.com/ggml-org/llama.cpp/pull/29862)
- **Prism Bonsai 2 27B:** Runtime support is under review. [PR #29600](https://github.com/ggml-org/llama.cpp/pull/29600)
- **Rerankers:** Open work adds typed multimodal RERANK input and model-specific classifier activations, including GELU/tanh handling. [PR #29625](https://github.com/ggml-org/llama.cpp/pull/29625) · [PR #29692](https://github.com/ggml-org/llama.cpp/pull/29692)
- **Qwen3 sliding-window attention:** Support for per-layer `sliding_window_pattern` is under review. [PR #26286](https://github.com/ggml-org/llama.cpp/pull/26286)
- **Q8_0 SpacemiT X60 CPU path:** A Q8_0 IME1 matrix kernel would extend existing acceleration beyond Q4 formats. [PR #28479](https://github.com/ggml-org/llama.cpp/pull/28479)

## 4. Performance & Optimization

### Landed

- **CUDA shared-expert fusion:** Shared experts are fused into MMVQ, reducing intermediate work and memory traffic for MoE models. [Release b11370](https://github.com/ggml-org/llama.cpp/releases/tag/b11370) · [PR #29184](https://github.com/ggml-org/llama.cpp/pull/29184)
- **qwen4exp mask optimization:** Mask construction was streamlined for qwen4exp and GLM5-next, reducing overhead in these model paths. [Release b11352](https://github.com/ggml-org/llama.cpp/releases/tag/b11352) · [PR #29824](https://github.com/ggml-org/llama.cpp/pull/29824)
- **Softmax-back correctness fix:** The CPU path now handles cases where the output aliases `src0` or `src1`, preventing incorrect graph execution results. [Release b11365](https://github.com/ggml-org/llama.cpp/releases/tag/b11365) · [PR #27096](https://github.com/ggml-org/llama.cpp/pull/27096)

### In Progress

- **qwen4exp indexer memory:** A merged change reduces indexer intermediate memory from roughly **4 GB to 0.5 GB** at **131K context and batch 4096**, by avoiding a full post-ReLU copy of all head scores. [PR #29825](https://github.com/ggml-org/llama.cpp/pull/29825)
- **CUDA TOP_K:** Segmented radix sort is intended to accelerate multi-row TOP_K relative to the existing CUB sorting path. [PR #29883](https://github.com/ggml-org/llama.cpp/pull/29883)
- **Intel SYCL speculative verification:** Multi-column XMX kernels target **2–8-token verification** and **9–80-token prompt batches**, improving matmul utilization for speculative decoding and short prefill. [PR #29864](https://github.com/ggml-org/llama.cpp/pull/29864)
- **Metal small-batch q4_0:** A proposed 64×8 tile avoids padding associated with the 64×32 kernel for batch sizes 5–16. [PR #25377](https://github.com/ggml-org/llama.cpp/pull/25377)
- **Host-resident MoE experts:** A GPU LRU cache would upload only missing experts and operate for batches up to 32 tokens, reducing transfer overhead for large MoE models. [PR #29887](https://github.com/ggml-org/llama.cpp/pull/29887)
- **RPC loading:** Reported local improvement of about **5×** across two Spark systems; still under review. [PR #29413](https://github.com/ggml-org/llama.cpp/pull/29413)
- **Multi-node tensor parallelism:** NCCL-backed collectives are being added for tensor parallelism across processes and nodes. [PR #28967](https://github.com/ggml-org/llama.cpp/pull/28967) · [PR #26610](https://github.com/ggml-org/llama.cpp/pull/26610)
- **Metal training/evaluation support:** A forward-only cross-entropy-loss kernel and BF16 K-tail handling for tinyBLAS are under development. [PR #29800](https://github.com/ggml-org/llama.cpp/pull/29800) · [PR #29806](https://github.com/ggml-org/llama.cpp/pull/29806)

## 5. Stability & Regressions

Ranked by likely production impact:

1. **Potential cross-request KV-cache contamination on integrated GPUs:** A report alleges missing synchronization during chunked prefill can scatter K/V rows and leak conversation content between requests. This is the highest-risk serving issue because it affects isolation, though it remains unconfirmed. [Issue #28056](https://github.com/ggml-org/llama.cpp/issues/28056)
2. **CUDA MMQ out-of-bounds read:** `MUL_MAT_ID` appears to calculate `src1_q8_1` tail padding from the wrong dimension for MoE, potentially causing illegal memory access for some microbatch sizes. [Issue #27792](https://github.com/ggml-org/llama.cpp/issues/27792)
3. **Multi-GPU qwen4exp/MTP failures:** Reports include fixed-position prefill crashes, a startup assertion with MTP, and roughly halved prompt processing with draft-MTP across GPUs. [Issue #29562](https://github.com/ggml-org/llama.cpp/issues/29562) · [Issue #29811](https://github.com/ggml-org/llama.cpp/issues/29811) · [Issue #27428](https://github.com/ggml-org/llama.cpp/issues/27428)
4. **SYCL memory and initialization errors:** Open work fixes potentially out-of-bounds F16 reads in `mul_mat`, split-buffer errors, host-pool errors, and device-memory-query failures. [PR #29889](https://github.com/ggml-org/llama.cpp/pull/29889) · [Issue #28134](https://github.com/ggml-org/llama.cpp/issues/28134) · [Issue #27412](https://github.com/ggml-org/llama.cpp/issues/27412)
5. **Speculative-decoding batch invariance:** IQ-quantized CUDA `mul_mat` on SM120 reportedly produces bitwise-different results for batches of 5 or 8 versus individual columns, which can break lossless verification assumptions. [Issue #28111](https://github.com/ggml-org/llama.cpp/issues/28111)
6. **Long-context and concurrency quality issues:** Open reports include Vulkan Flash Attention regressions, qwen4exp decode slowdown with context, tool-call instability during partial streaming, and memory leaks. [Issue #25207](https://github.com/ggml-org/llama.cpp/issues/25207) · [Issue #28734](https://github.com/ggml-org/llama.cpp/issues/28734) · [Issue #29655](https://github.com/ggml-org/llama.cpp/issues/29655) · [Issue #27725](https://github.com/ggml-org/llama.cpp/issues/27725)
7. **Server scheduler head-of-line blocking:** A large prefill can stall decode for all concurrent slots; the reported pattern is approximately `ceil(prompt_tokens / n_batch)` decode interruptions. [Issue #29175](https://github.com/ggml-org/llama.cpp/issues/29175)
8. **Router logging regression:** Router mode emits blank lines during child-model loading/download progress. A targeted fix is open. [Issue #29878](https://github.com/ggml-org/llama.cpp/issues/29878) · [PR #29895](https://github.com/ggml-org/llama.cpp/pull/29895)
9. **Slot restore correctness:** Restoring slots can discard checkpoints for SWA and recurrent/hybrid models, forcing an unnecessary full re-prefill. A fix is under review. [PR #26004](https://github.com/ggml-org/llama.cpp/pull/26004)

## 6. What This Means for Application Developers

- **Pin and stage-test aggressively.** The current build train contains meaningful kernel and model-path changes; validate greedy output, tool calls, multimodal handling, and speculative decoding before production rollout.
- **Exercise CUDA MoE on the exact deployment topology.** Draft-MTP and qwen4exp remain problematic in multi-GPU layer splits. Until fixes are validated, use conservative batch sizes and explicitly benchmark prompt processing, not only single-request decode.
- **Treat speculative decoding as nondeterministic unless verified.** Probabilistic drafting and known batch-invariance issues warrant checks for rejection rates, acceptance rates, output equivalence versus target-only inference, and grammar-constrained behavior.
- **Do not rely solely on request isolation guarantees on integrated GPUs.** For sensitive multi-tenant deployments, add backend-specific soak tests for conversation leakage, especially with chunked prefill and concurrent requests.
- **Size prefill for co-tenancy.** On `llama-server`, large prompts can monopolize scheduling. Choose `n_batch`, `n_ubatch`, and parallelism around latency SLOs; consider separating prompt-heavy and interactive traffic.
- **Use the newest builds for long-context qwen4exp workloads after validation.** The indexer memory reduction is substantial, but current reports of context-scaling regressions make workload-specific benchmarking essential.
- **Backend selection remains workload-specific.** Metal F16-KV attention and Intel XMX verification kernels are promising for their respective hardware, but unresolved SYCL memory issues and Metal OOM reports warrant conservative memory settings and backend-specific regression suites.

</details>

<details>
<summary><strong>Ollama</strong> — <a href="https://github.com/ollama/ollama">ollama/ollama</a></summary>

# Ollama Digest — 2026-10-03

## Today’s Highlights

- No Ollama release was published in the last 24 hours. The main activity is a substantial set of open fixes around tool calling, reasoning controls, OpenAI-compatible APIs, and model runners.
- The most serious user-facing report is a claimed **95% failure rate across Ollama Cloud Pro models** ([#15453](https://github.com/ollama/ollama/issues/15453)).
- Work is progressing on multiple inference-path issues, including tool-result ordering, structured outputs, reasoning-budget enforcement, MLX support, and llama.cpp integration.

## Releases & Breaking Changes

No new release was identified in the last 24 hours.

Important compatibility and API issues currently under development:

- An OpenAI-compatible chat conversion path may split tool-message content arrays incorrectly, potentially dropping tool-call IDs and names ([PR #18722](https://github.com/ollama/ollama/pull/18722)).
- A proposed llama.cpp update advances the upstream revision from `b11232` to `b11351`; review and merge status remain pending ([PR #18761](https://github.com/ollama/ollama/pull/18761)).
- Models using `qwen3.5` may be forced to `numParallel=1` through the Nimble integration despite `OLLAMA_NUM_PARALLEL=8` ([issue #18750](https://github.com/ollama/ollama/issues/18750)).

## New Model & Hardware Support

No definitive new model or backend support landed today. Relevant active work includes:

- A proposed MLX refactor separates decision-model preparation and readout from the forward pass and introduces a Strands Decider implementation ([PR #18755](https://github.com/ollama/ollama/pull/18755)).
- A pending Linux MLX build fix links the runner against `libdl` for glibc versions older than 2.34, improving compatibility with distributions such as Debian 11 ([PR #17567](https://github.com/ollama/ollama/pull/17567)).
- An open feature request proposes installing both CUDA and ROCm runtimes on systems containing NVIDIA and AMD GPUs ([issue #18545](https://github.com/ollama/ollama/issues/18545)).
- ROCm VRAM accounting may incorrectly evict models even when sufficient unified VRAM remains available ([issue #18756](https://github.com/ollama/ollama/issues/18756)).
- Intel UHD Graphics hardware is not being detected through Ollama’s Vulkan backend on Windows, despite working Vulkan detection at the OS level ([issue #18672](https://github.com/ollama/ollama/issues/18672)).
- MLX performance on an M4 Pro is reported below an earlier Ollama release, with the MLX runner not utilizing the full GPU ([issue #18754](https://github.com/ollama/ollama/issues/18754)).

## Performance & Optimization

- **Parallelism:** Nimble reportedly serializes Qwen 3.5 requests because the qwen35 architecture does not support the configured parallel-request path, reducing effective throughput to one request at a time ([issue #18750](https://github.com/ollama/ollama/issues/18750)).
- **ROCm memory utilization:** A ROCm scheduling or VRAM-accounting defect may cause premature model eviction and unnecessary CPU offload or model reloads ([issue #18756](https://github.com/ollama/ollama/issues/18756)).
- **Reasoning efficiency:** An open proposal would enforce configurable per-request or per-model thinking token budgets, preventing reasoning loops from consuming the full context window ([PR #17566](https://github.com/ollama/ollama/pull/17566)).
- **Reasoning termination:** Related work would stop an exhausted reasoning block at a line boundary rather than cutting through a word, improving output cleanliness ([PR #18212](https://github.com/ollama/ollama/pull/18212)).
- **Tool-call streaming:** Several parser fixes target chunk-boundary handling, incomplete tool calls, and reasoning-channel transitions. These can improve correctness for long agentic sessions, although no benchmarks or merged performance gains were reported ([PR #18624](https://github.com/ollama/ollama/pull/18624), [PR #17564](https://github.com/ollama/ollama/pull/17564), [PR #17565](https://github.com/ollama/ollama/pull/17565)).
- **Scheduler reload behavior:** A pending change proposes reloading runners when shared model blobs require different llama-server flags, avoiding incorrect reuse of a loaded runner ([PR #18289](https://github.com/ollama/ollama/pull/18289)).

## Stability & Regressions

Ranked by likely operational impact:

1. **Critical — Ollama Cloud Pro reportedly unusable:** Users report a 95% failure rate across multiple cloud models, with the report accumulating substantial discussion and reactions ([issue #15453](https://github.com/ollama/ollama/issues/15453)). No fix is identified in the supplied data.
2. **High — `/v1/systemone` decision-model failure:** `clef-flash` fails on CUDA with a non-finite logit error and on CPU because the model cannot be opened, despite working through `/v1/chat/completions` ([issue #18769](https://github.com/ollama/ollama/issues/18769)).
3. **High — OpenAI tool-result misassociation:** On `/v1/chat/completions`, parallel tool results may be matched by position rather than `tool_call_id`, assigning outputs to the wrong call ([issue #18762](https://github.com/ollama/ollama/issues/18762)). Two candidate fixes are available: [PR #18767](https://github.com/ollama/ollama/pull/18767) and [PR #18763](https://github.com/ollama/ollama/pull/18763).
4. **High — Structured-output property-order regression:** JSON-schema property order is reportedly changed to alphabetical order on the native llama-server chat path, potentially breaking step-dependent schemas ([issue #18717](https://github.com/ollama/ollama/issues/18717)).
5. **Medium — Reasoning-effort control ignored:** For a Qwen3.8 GGUF whose template supports `reasoning_effort`, `"low"`, `"medium"`, and `"high"` behave like the template default (`xhigh`); only `think: false` changes behavior ([issue #18766](https://github.com/ollama/ollama/issues/18766)).
6. **Medium — Windows installer signature failure:** The Ollama v0.35.1 Windows installer reportedly fails Authenticode verification with `HashMismatch`, including when obtained from the official endpoint and GitHub release asset ([issue #18765](https://github.com/ollama/ollama/issues/18765)).
7. **Medium — Tool-call parser fragility:** Opening tags may be lost across streaming chunk boundaries in the DeepSeek3, Cogito, and LFM2 parsers ([issue #18681](https://github.com/ollama/ollama/issues/18681)). Several related parser fixes are open, including [PR #17914](https://github.com/ollama/ollama/pull/17914) and [PR #18288](https://github.com/ollama/ollama/pull/18288).
8. **Medium — Unreferenced model blobs:** `ollama create --quantize` from safetensors reportedly leaves a large unquantized F16 blob in `blobs/`; `ollama rm` does not remove it ([issue #18416](https://github.com/ollama/ollama/issues/18416)).
9. **Medium — Model version requirements undocumented:** Some model pages, including `qwen3.8:27b`, reportedly require particular Ollama versions without documenting that requirement ([issue #18414](https://github.com/ollama/ollama/issues/18414)).
10. **Low/Medium — MLX and hardware regressions:** The M4 Pro underutilization and Intel Vulkan detection problems remain unresolved ([issue #18754](https://github.com/ollama/ollama/issues/18754), [issue #18672](https://github.com/ollama/ollama/issues/18672)).

## What This Means for Application Developers

- For agent applications, treat parallel tool calls as an especially sensitive integration point. Validate that results are correlated by `tool_call_id`, and avoid assuming that message ordering is preserved across Ollama and template renderers until the proposed fixes are merged.
- Structured-output consumers should verify property order and schema-dependent sequencing in deployment, especially when using the OpenAI-compatible endpoint or native llama-server chat path.
- For reasoning models, test the actual Ollama version and GGUF chat template. `think` currently behaves as a simple toggle in some models, while graded reasoning-effort settings may be ignored.
- For GPU-backed deployments, benchmark both model residency and request concurrency. ROCm users should monitor VRAM and eviction behavior; Qwen 3.5 workloads using Nimble may be serialized unexpectedly.
- Cloud deployments should include health checks, retry logic, and fallback routing; the reported cloud-wide failure issue makes availability monitoring essential.
- Before upgrading Windows systems, validate the installer’s Authenticode signature rather than relying solely on the download URL.
- Model operators should verify minimum Ollama requirements and monitor blob storage after imports or quantization, given the reported orphaned F16-blob behavior.

</details>

<details>
<summary><strong>LiteLLM</strong> — <a href="https://github.com/BerriAI/litellm">BerriAI/litellm</a></summary>

# LiteLLM Digest — 2026-10-03

## 1. Today's Highlights

LiteLLM saw no new release in the last 24 hours, but development was active across proxy routing, streaming, authentication, observability, and cost controls. The most operationally significant work includes Kubernetes pod discovery for self-hosted GPU deployments, stricter stream-completion handling, fixes for usage attribution and budget enforcement, and expansion of provider and agent-platform integrations.

## 2. Releases & Breaking Changes

- **No new LiteLLM release was published in the last 24 hours.**
- Several changes are still open pull requests and may alter behavior once merged:
  - **Opt-in strict stream completion:** [`strict_stream_completion`](https://github.com/BerriAI/litellm/pull/42140) would raise `IncompleteStreamError` for truncated provider streams instead of reporting a normal `finish_reason: "stop"`. This is intended to trigger caller retries but is not yet a shipped change.
  - **Kubernetes pod discovery:** [PR #44342](https://github.com/BerriAI/litellm/pull/44342) introduces an opt-in `kubernetes_pod_discovery: true` deployment setting so a headless Kubernetes service can be resolved to multiple GPU pods for load distribution.
  - **Hosted admin authentication:** [PR #44360](https://github.com/BerriAI/litellm/pull/44360) proposes delegated hosted-admin access through existing OAuth, PKCE, and token endpoints.
  - **Optional dependency slimming:** [PR #44340](https://github.com/BerriAI/litellm/pull/44340) proposes moving AWS, tokenizer, and dashboard dependencies behind installation extras; operators should review this when upgrading.

## 3. New Model & Hardware Support

- **ai& provider integration:** [PR #44353](https://github.com/BerriAI/litellm/pull/44353) adds `ai&` as a JSON-configured, OpenAI-compatible provider, with routing planned for chat completions, Responses, and Anthropic Messages.
- **OpenAI Skills routing:** [PR #37072](https://github.com/BerriAI/litellm/pull/37072) proposes native OpenAI and Azure OpenAI Skills, versions, and content handling through the proxy.
- **Kubernetes GPU backends:** [PR #44342](https://github.com/BerriAI/litellm/pull/44342) targets deployments behind Kubernetes headless services, enabling pod-level routing rather than treating a service as a single endpoint.
- No new CUDA, ROCm, Metal, CPU, kernel, or quantization support was reported in the supplied data.

## 4. Performance & Optimization

- **Distributed self-hosted inference routing:** [PR #44342](https://github.com/BerriAI/litellm/pull/44342) could improve throughput and availability by discovering individual Kubernetes pods and distributing requests among them. The change is opt-in and does not yet provide published latency or throughput measurements.
- **Streaming completion safety:** [PR #42140](https://github.com/BerriAI/litellm/pull/42140) addresses a reliability gap where truncated streams were indistinguishable from successful completions. Strict mode is intended to improve retry behavior rather than raw throughput.
- **Usage attribution correction:** [PR #44357](https://github.com/BerriAI/litellm/pull/44357) preserves daily spend separately for public model names that share a deployment, preventing aggregated usage from distorting cost reporting and PTU calculations.
- **Health-check correctness:** [Issue #44154](https://github.com/BerriAI/litellm/issues/44154) reports that background health-check results may be attributed to every deployment sharing the same `litellm_params.model`. This can cause incorrect routing or health state; no concrete performance benchmark is provided.

## 5. Stability & Regressions

Ranked by likely production impact:

1. **Budget enforcement failures — critical financial-control risk**
   - [Issue #26672](https://github.com/BerriAI/litellm/issues/26672): key and user `max_budget` limits may be bypassed in Proxy v1.82.3 after spend exceeds the configured budget.
   - [Issue #31842](https://github.com/BerriAI/litellm/issues/31842): `model_max_budget` enforcement for customer/end-user records is reported as ineffective.
   - [PR #44356](https://github.com/BerriAI/litellm/pull/44356) proposes charging shadow evaluations to the initiating admin and enforcing their budgets, but it does not directly establish that all reported budget-bypass paths are fixed.
   - **Recommendation:** independently verify budget enforcement before relying on LiteLLM limits for hard spend controls.

2. **Silent data loss in multimodal requests**
   - [Issue #44336](https://github.com/BerriAI/litellm/issues/44336): `vertex_ai/agent_engine` silently drops image, file, audio, and video content parts, returning a plausible HTTP 200 answer based only on text.
   - This is a correctness and safety issue for agents processing documents or visual inputs.

3. **Incorrect retry behavior for billing errors**
   - [Issue #32785](https://github.com/BerriAI/litellm/issues/32785): OpenAI `insufficient_quota` is surfaced as `RateLimitError`, causing retry loops even though the condition is a non-retryable billing failure.

4. **Streaming and protocol translation defects**
   - [Issue #32357](https://github.com/BerriAI/litellm/issues/32357): Anthropic `/v1/messages` streaming mis-encodes `reasoning_content` for OpenAI-compatible reasoning backends, potentially producing empty content in Anthropic SDK and Claude Code clients.
   - [Issue #43010](https://github.com/BerriAI/litellm/issues/43010): Anthropic reasoning encrypted content is duplicated during `/v1/responses` streaming; the issue is closed, but the data does not identify a release containing the fix.
   - [Issue #43620](https://github.com/BerriAI/litellm/issues/43620): non-streaming Responses bridging retains only the last reasoning item.
   - [Issue #43817](https://github.com/BerriAI/litellm/issues/43817): streaming Responses bridging drops URL-citation annotations.
   - [Issue #41954](https://github.com/BerriAI/litellm/issues/41954): `/v1/messages` requests involving `tool_result.cache_control` can fail with HTTP 400 through the Anthropic→OpenAI→Anthropic bridge.
   - [Issue #44038](https://github.com/BerriAI/litellm/issues/44038): newer Anthropic parameters such as `safeguards` and `output_config` are forwarded verbatim to Azure AI Foundry, which rejects them.
   - [PR #44349](https://github.com/BerriAI/litellm/pull/44349) addresses missing `finish_reason` and provider usage when rebuilding streamed text completions.

5. **Proxy lifecycle and state-isolation issues**
   - [Issue #31206](https://github.com/BerriAI/litellm/issues/31206): `REDIS_CLUSTER_NODES` can cause shutdown failures.
   - [Issue #31841](https://github.com/BerriAI/litellm/issues/31841): `blocked_user_check` receives `prisma_client=None` during startup initialization.
   - [Issue #32112](https://github.com/BerriAI/litellm/issues/32112): a non-standard request parameter sent once can be permanently reinjected into subsequent requests for a deployment, creating in-memory state contamination.
   - [Issue #44154](https://github.com/BerriAI/litellm/issues/44154) may apply one deployment’s health result to all deployments sharing the same model identifier.

6. **Tracing and observability gaps**
   - [Issue #44274](https://github.com/BerriAI/litellm/issues/44274): generic OTLP span events are decoded but silently dropped before ClickHouse storage.
   - [PR #44363](https://github.com/BerriAI/litellm/pull/44363) proposes bringing the tracing development seed, including Rust trace and ClickHouse components, into the main branch.
   - [PR #43992](https://github.com/BerriAI/litellm/pull/43992) proposes exporting cache-read and cache-write token counts as OTEL span attributes.

7. **Other provider and UI regressions**
   - [Issue #44300](https://github.com/BerriAI/litellm/issues/44300): `openai_like` embeddings place `extra_headers` in the JSON body instead of HTTP headers. [PR #44361](https://github.com/BerriAI/litellm/pull/44361) is a direct fix.
   - [Issue #31947](https://github.com/BerriAI/litellm/issues/31947): Bedrock Mantle received the wrong Anthropic workspace header; the issue is closed.
   - [Issue #24669](https://github.com/BerriAI/litellm/issues/24669): Bedrock cross-region pricing lookup can use the base-model price instead of the regional entry; the issue is closed.
   - [Issue #36854](https://github.com/BerriAI/litellm/issues/36854): the `/models` response shape may break OpenAI Codex CLI discovery.
   - [Issue #32013](https://github.com/BerriAI/litellm/issues/32013) and [Issue #32047](https://github.com/BerriAI/litellm/issues/32047) identify Firefox navigation visibility and paginated request-log search problems.

## 6. What This Means for Application Developers

- **Do not treat LiteLLM budgets as your only financial control.** Add independent spend monitoring and hard limits at the provider or cloud-account level until the reported budget-enforcement issues are verified fixed.
- **Test protocol translations end to end.** Applications using Claude Code, Anthropic Messages, OpenAI Responses, reasoning models, tools, citations, or cache-control fields should run both streaming and non-streaming integration tests.
- **Validate multimodal payloads explicitly.** Reject or log responses when expected image, file, audio, or video parts are missing; HTTP 200 alone does not guarantee that LiteLLM forwarded all content.
- **Separate retryable throttling from billing failures.** Treat `insufficient_quota` and other non-retryable quota errors as terminal until LiteLLM exposes a distinguishable error type.
- **For Kubernetes inference, watch the pending pod-discovery change.** Headless-service routing could simplify multi-GPU deployment registration, but it remains a proposed feature and should be load-tested for discovery latency, pod readiness handling, and failover behavior.
- **Enable strict stream handling only after compatibility testing.** The proposed `strict_stream_completion` mode may turn silent truncation into failed calls, which is safer for agents but can expose providers or client integrations that do not correctly close streams.

</details>

<details>
<summary><strong>Unsloth</strong> — <a href="https://github.com/unslothai/unsloth">unslothai/unsloth</a></summary>

# Unsloth Digest — 2026-10-03

## 1. Today's Highlights

Unsloth’s main activity was focused on expanding Studio’s training and inference workflows, with open PRs adding DPO, ORPO, and GRPO fine-tuning alongside SFT ([PR #12601](https://github.com/unslothai/unsloth/pull/12601)). Several performance efforts target image/video generation, including fused INT8 kernels, reduced GPU-memory spill, and avoiding unnecessary VAE tiling for high-memory systems ([PRs #12517](https://github.com/unslothai/unsloth/pull/12517), [#12524](https://github.com/unslothai/unsloth/pull/12524), [#12525](https://github.com/unslothai/unsloth/pull/12525), [#12603](https://github.com/unslothai/unsloth/pull/12603)). The issue tracker also contains several operational concerns, especially Studio API latency, tensor-parallel decode regressions, VRAM/OOM behavior, and tool-call or generation-stop failures.

## 2. Releases & Breaking Changes

No new releases were published in the last 24 hours.

There are no confirmed breaking API or configuration changes in the supplied data. The following are still open proposals or in-progress changes:

- A proposed `/v1/models` field currently labeled `max_context_length` reportedly represents a VRAM-fit estimate rather than the actual model context limit; clarification or renaming is requested in [#12571](https://github.com/unslothai/unsloth/issues/12571).
- The proposed Studio training expansion—DPO, ORPO, GRPO, and rule-based rewards—is not yet merged ([PR #12601](https://github.com/unslothai/unsloth/pull/12601)).
- Changes to Studio tool-call deduplication would preserve current behavior by default while adding an opt-out setting ([PR #11685](https://github.com/unslothai/unsloth/pull/11685)).

## 3. New Model & Hardware Support

- **MiniMax-H3 INT8 optimization:** An open PR integrates the model’s ConvRot rotation into the INT8 activation-quantization path, targeting faster denoising on G4/RTX PRO 6000 systems ([PR #12517](https://github.com/unslothai/unsloth/pull/12517)).
- **Qwen-Image-2.1:** Open changes extend fused INT8 GEMM placement and improve memory recovery after oversized requests ([PR #12524](https://github.com/unslothai/unsloth/pull/12524)).
- **Wan2.2-TI2V-5B:** A proposed optimization enables untiled VAE decoding when the model and clip fit resident GPU memory, avoiding tiled decoding on very high-memory devices such as B200s ([PR #12603](https://github.com/unslothai/unsloth/pull/12603)).
- **Idefics3 / Granite Docling VLM:** A long-running open PR adds Idefics3 architecture support and includes dedicated tests ([PR #9702](https://github.com/unslothai/unsloth/pull/9702)). This is support in progress, not a confirmed release.
- **Qwen3-TTS:** Fine-tuning support remains a feature request, indicating that current Transformers support does not yet translate into Unsloth fine-tuning support ([Issue #3951](https://github.com/unslothai/unsloth/issues/3951)).

## 4. Performance & Optimization

- **Two-GPU tensor split regression:** Users report tensor-split decode throughput dropping to approximately **48 tokens/s** from **115–120+ tokens/s** on RTX 5070 Ti systems, reportedly beginning with `b10715-mix-86bd2d3`; affected configurations include `--split-mode tensor` and draft-MTP modes. The issue is open and no confirmed fix is listed ([Issue #12468](https://github.com/unslothai/unsloth/issues/12468)).
- **Studio API latency:** The OpenAI-compatible `/v1/chat/completions` endpoint is reported to add a fixed **~1.0–1.2 seconds per request**, making short-text workloads roughly **3–5× slower** than the bundled llama-server path. The issue was closed in the supplied data, but the report remains operationally important when comparing serving routes ([Issue #12364](https://github.com/unslothai/unsloth/issues/12364)).
- **Video VAE efficiency:** The Wan2.2 proposal avoids decoding overlapping tiles when sufficient VRAM is available, reducing duplicate VAE work on large-memory accelerators ([PR #12603](https://github.com/unslothai/unsloth/pull/12603)).
- **Image-generation kernels and placement:** Open work targets fused INT8 GEMMs, full-denoiser residency, and minimizing uncached GPU-memory overhead. Reported placement issues include approximately **0.7 GB on A100** and **1.4 GB on B200** of memory outside PyTorch’s caching allocator ([PR #12525](https://github.com/unslothai/unsloth/pull/12525)).
- **Fine-tuning VRAM concerns:** A high-engagement issue continues to report that Unsloth fine-tuning uses more VRAM than advertised and causes OOMs for larger models ([Issue #4504](https://github.com/unslothai/unsloth/issues/4504)). Treat published VRAM estimates as deployment-sensitive and validate them against the exact model, sequence length, batch size, and quantization setup.

## 5. Stability & Regressions

Ranked by potential production impact:

1. **High — tensor-parallel decode regression:** Multi-GPU tensor-split inference may be approximately **2.9× slower** in affected builds ([Issue #12468](https://github.com/unslothai/unsloth/issues/12468)). No confirmed remediation is identified.
2. **High — Studio Triton/Xet incompatibility:** An Xet health probe reportedly replaces Triton process-wide, causing failures in Diffusers/xformers with errors such as `'function' object has no attribute 'fn'`, potentially breaking image/video generation ([Issue #12466](https://github.com/unslothai/unsloth/issues/12466)).
3. **High — generation cancellation can leave the UI active:** A report says stopping generation does not consistently stop token production; the model may remain loaded and the chat UI may freeze ([Issue #12592](https://github.com/unslothai/unsloth/issues/12592)).
4. **Medium — pre-quantized bitsandbytes checkpoints:** Windows checkpoints can load with `quant_state=None`, leading to forward-pass shape errors. Related Qwen3.8-27B and hybrid-attention checkpoint issues were closed, but the reports point to regenerated or corrected checkpoints rather than a broad library fix ([Issues #10017](https://github.com/unslothai/unsloth/issues/10017), [#10276](https://github.com/unslothai/unsloth/issues/10276), [#9867](https://github.com/unslothai/unsloth/issues/9867)).
5. **Medium — VRAM accounting and OOMs:** Users report unused VRAM alongside CUDA OOMs in WSL, while a separate issue alleges materially higher-than-advertised fine-tuning memory use ([Issues #1797](https://github.com/unslothai/unsloth/issues/1797), [#4504](https://github.com/unslothai/unsloth/issues/4504)).
6. **Medium — Studio request/media lifecycle:** Durable chat runs reportedly allowed `image_url` or `video_url` data URIs to bypass the media gate; the issue is listed as closed, indicating a fix or mitigation existed ([Issue #10983](https://github.com/unslothai/unsloth/issues/10983)).
7. **Medium — generation progress failures:** Reports of repeated “Generation stopped making progress” were associated with expired chat-generation leases; the issue is closed, but lease and cancellation behavior merits monitoring ([Issue #12518](https://github.com/unslothai/unsloth/issues/12518)).
8. **Lower — Windows sandbox/tooling:** A literal `nul` file created in the Windows sandbox workdir can block terminal and Python tools ([Issue #12473](https://github.com/unslothai/unsloth/issues/12473)).
9. **Lower — offline model discovery:** Unsloth Desktop may attempt a Hugging Face quant-discovery request even when the model is already downloaded, preventing offline loading ([Issue #12415](https://github.com/unslothai/unsloth/issues/12415)).
10. **Lower — TTS formatting:** System TTS may read Markdown punctuation such as asterisks and underscores aloud, requiring normalization before speech synthesis ([Issue #12547](https://github.com/unslothai/unsloth/issues/12547)).

## 6. What This Means for Application Developers

- **Benchmark the actual serving path.** Do not assume Studio’s OpenAI-compatible endpoint and llama-server have equivalent latency; short requests may expose a substantial fixed overhead ([Issue #12364](https://github.com/unslothai/unsloth/issues/12364)).
- **Pin and regression-test GPU builds.** Tensor-split throughput appears sensitive to specific prebuilt versions. Record the exact Unsloth build, GPU topology, split mode, draft decoder, model, and context settings before upgrading ([Issue #12468](https://github.com/unslothai/unsloth/issues/12468)).
- **Validate memory with production workloads.** Measure peak VRAM, host RAM spill, sequence length, image/video resolution, and concurrency. Advertised fit estimates should not be treated as guaranteed limits, particularly for fine-tuning and Studio image generation ([Issue #4504](https://github.com/unslothai/unsloth/issues/4504)).
- **Use cancellation as a hard operational boundary.** Ensure applications handle model unload and generation cancellation independently, and add timeouts around Studio agent or chat requests to prevent runaway generation ([Issue #12592](https://github.com/unslothai/unsloth/issues/12592)).
- **Isolate media pipelines from health checks.** Xet/Download health probes should not mutate the Triton environment used by Diffusers or xformers. This is particularly relevant for applications combining model downloads with image/video generation ([Issue #12466](https://github.com/unslothai/unsloth/issues/12466)).
- **Treat new training objectives as preview capabilities.** DPO, ORPO, and GRPO are promising for preference optimization and self-generated reward loops, but the implementation remains open and should be evaluated in a non-production environment until merged and stabilized ([PR #12601](https://github.com/unslothai/unsloth/pull/12601)).
- **Prefer confirmed checkpoint compatibility.** For pre-quantized bitsandbytes models—especially on Windows—verify checkpoint regeneration and run a forward pass before deploying a long training or serving job ([Issue #10017](https://github.com/unslothai/unsloth/issues/10017)).

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*