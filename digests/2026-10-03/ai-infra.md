# AI Infrastructure Digest 2026-10-03

> Generated: 2026-10-03 15:36 UTC | Projects covered: 6

- [vLLM](https://github.com/vllm-project/vllm)
- [SGLang](https://github.com/sgl-project/sglang)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://github.com/ollama/ollama)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Unsloth](https://github.com/unslothai/unsloth)

---

## Cross-Project Comparison

## Ecosystem Overview

The ecosystem is advancing rapidly across new model architectures, low-level kernels, memory management, and heterogeneous hardware, but production reliability remains the primary constraint. vLLM and SGLang are converging on frontier-model serving features while exposing higher risks around speculative decoding, KV-cache correctness, and new GPU architectures. llama.cpp and Ollama emphasize local deployment and compatibility, whereas LiteLLM and Unsloth operate higher in the stack. Most items remain proposals or open fixes; only llama.cpp shipped releases.

## Activity Comparison

*Counts reflect items explicitly linked in the digest, not total repository activity.*

| Project | Issues | PRs | Release status |
|---|---:|---:|---|
| vLLM | 4 | 7 | No release; 363 PRs active |
| SGLang | 13 | 5 | No release; CI 1 broken/6 flaky |
| llama.cpp | 4 | 6 | **Shipped b11366–b11378** |
| Ollama | 8 | 5 | No release; llama.cpp update pending |
| LiteLLM | 7 | 8 | No confirmed release |
| Unsloth | 5 | 13 | No confirmed production release |

## Model Support Race

- **Shipped:** llama.cpp added Clef and improved Ling 3.0 structured output; Ollama’s llama.cpp upgrade is still pending.
- **In progress:** vLLM targets DeepSeek-V4-P1 and Qwen3-Next/3.5; SGLang targets Gemma 4, Qwen3.5 MoE, and DeepSeek V4.1; Unsloth advances FastFlowLM NPU and audio models.
- **Leader:** llama.cpp leads on shipped model breadth; SGLang and vLLM lead on emerging frontier architectures and accelerator-specific optimization.

## Performance Frontier

- **vLLM/SGLang:** distributed serving, prefix/KV caches, speculative decoding, MoE kernels, and SM120/SM100 optimization dominate.
- **llama.cpp/Unsloth:** memory footprint, quantization, fused expert kernels, GGUF execution, and local-device efficiency lead.
- **Quantization:** vLLM is expanding batch-invariant FP8 and LoRA paths; SGLang’s NVFP4 KV issue makes scale validation especially urgent.

## Layer Positioning

- **Serving engines:** vLLM and SGLang target high-throughput GPU inference, batching, disaggregation, and frontier models.
- **Local runtimes:** llama.cpp offers broad device portability; Ollama wraps it in a local-model UX and OpenAI-compatible API.
- **Gateway/platform:** LiteLLM centralizes providers, budgets, tracing, and routing. Unsloth is evolving from fine-tuning toward multimodal serving and agent tooling.

## Trend Signals

- Production adoption is shifting from raw benchmark wins to **correctness guarantees** for caches, structured outputs, tool calls, and request isolation.
- New hardware and architectures arrive faster than mature kernels: **SM120/GB10, ROCm/gfx950, NPUs, MoE, and diffusion** are expanding the compatibility matrix.
- Agent developers should watch streaming tool-call association, reasoning preservation, context limits, cancellation behavior, and independent budget enforcement; these are current cross-project failure points.

---

## Per-Project Reports

<details>
<summary><strong>vLLM</strong> — <a href="https://github.com/vllm-project/vllm">vllm-project/vllm</a></summary>

## TL;DR
- No release shipped; 363 PRs saw activity, with work concentrated in speculative-decoding correctness, KV-cache lifecycle, and memory efficiency.
- Several serious reports target Blackwell/SM120 speculative decoding, including 0% MTP acceptance and unusable CUDA graphs for DeepSeek-V4.1-Flash.
- Notable in-progress fixes address hybrid prefix caching, sleep-mode CUDA-graph release, and a deterministic LoRA kernel.

## New Model & Hardware Support
- A proposed DeepSeek-V4-P1 change adds standalone, batch-invariant FP8 quantization for fused SiLU×Mul, expanding quantization-kernel reuse ([PR #59863](https://github.com/vllm-project/vllm/pull/59863)).
- ROCm support is being extended with a fused QK-norm, RoPE, and gate Triton kernel for Qwen3-Next/3.5 ([PR #51406](https://github.com/vllm-project/vllm/pull/51406)); TokenSpeed MLA gains block-interleaved DCP support for heterogeneous NIXL disaggregation ([PR #59462](https://github.com/vllm-project/vllm/pull/59462)).

## Performance & Optimization
- An opt-in sleep mode can offload CUDA-graph pools, releasing potentially GiBs per GPU for large MoE deployments; ROCm is being added too ([PR #59160](https://github.com/vllm-project/vllm/pull/59160), [PR #59523](https://github.com/vllm-project/vllm/pull/59523)).
- Fixes target a reported 1,648-token recomputation per prefix-cache hit and 30–40% batch throughput loss in hybrid EAGLE/MTP serving ([issue #53670](https://github.com/vllm-project/vllm/issues/53670), [PR #52244](https://github.com/vllm-project/vllm/pull/52244)).
- A merged deterministic split-K=8 LoRA shrink preserves batch invariance without float atomics ([PR #59377](https://github.com/vllm-project/vllm/pull/59377)).

## Stability & Regressions
- **High:** MTP acceptance reportedly falls to 0% with Qwen3.8-Flash under disaggregated serving ([#59642](https://github.com/vllm-project/vllm/issues/59642)) and GLM-5.3-Flash with FlashInfer SM120 ([#59724](https://github.com/vllm-project/vllm/issues/59724)).
- **High:** DeepSeek-V4.1-Flash reports extremely low eager-mode throughput and unusable CUDA graphs on RTX PRO 6000 Blackwell ([#56892](https://github.com/vllm-project/vllm/issues/56892)).
- **Medium:** Silent `prompt_logprobs` corruption and possible unconstrained structured-output tokens are under investigation ([#53488](https://github.com/vllm-project/vllm/issues/53488), [#54437](https://github.com/vllm-project/vllm/issues/54437)).

## What This Means for Application Developers
- Pin nightly builds and validate speculative-decoding acceptance, prefix reuse, logprobs, and structured outputs on your exact model/hardware combination.
- Treat disaggregated, SM120, and hybrid-cache deployments as higher-risk; retain eager-mode fallbacks and correctness monitoring until fixes land.

</details>

<details>
<summary><strong>SGLang</strong> — <a href="https://github.com/sgl-project/sglang">sgl-project/sglang</a></summary>

## TL;DR

- SGLang reported no new release; CI remains at **1 broken, 6 flaky, and 1,132 recently fixed tests** ([#17050](https://github.com/sgl-project/sglang/issues/17050)).
- Critical reports cover **NVFP4 KV-cache corruption**, scheduler admission livelock, and a possible DSpark startup hang ([#42369](https://github.com/sgl-project/sglang/issues/42369), [#41579](https://github.com/sgl-project/sglang/issues/41579), [#39886](https://github.com/sgl-project/sglang/issues/39886)).
- Kernel and serving work targets DeepSeek V4.1, Mamba HiCache correctness, MoE prefill, diffusion validation, and disaggregated serving efficiency ([PR #42351](https://github.com/sgl-project/sglang/pull/42351), [PR #41907](https://github.com/sgl-project/sglang/pull/41907)).

## New Model & Hardware Support

- In-progress support expands Gemma 4 FA4 on SM90, including **head dimension 512**, while an AMD gfx950 optimization targets small-batch Qwen3.5 MoE serving ([PR #42019](https://github.com/sgl-project/sglang/pull/42019), [PR #41982](https://github.com/sgl-project/sglang/pull/41982)).
- DeepSeek V4.1 remains under active optimization, but SM120/GB10 initialization and FlashInfer 0.7.0 CUDA-graph capture failures require attention ([roadmap](https://github.com/sgl-project/sglang/issues/42170), [#42364](https://github.com/sgl-project/sglang/issues/42364), [#42367](https://github.com/sgl-project/sglang/issues/42367)).

## Performance & Optimization

- An opt-in SM100 LiteTopK decode path targets DeepSeek V4.1’s **top-512 index-K selection** ([PR #42351](https://github.com/sgl-project/sglang/pull/42351)).
- DSpark is addressing per-batch-size Triton recompilation, while file-backed PLE reports **6.8× lower cold-prefill TTFT** on GB10 ([PR #42394](https://github.com/sgl-project/sglang/pull/42394), [#42392](https://github.com/sgl-project/sglang/issues/42392)).
- LTX-2 postprocessing is exploring overlapping MP4 encoding with VAE decode because encoding adds **20–40% of client latency** ([#41892](https://github.com/sgl-project/sglang/issues/41892)).

## Stability & Regressions

- **Critical:** NVFP4 KV may silently reuse FP8-calibrated scales, causing deterministic long-context corruption ([#42369](https://github.com/sgl-project/sglang/issues/42369)).
- **High:** Hybrid-SWA plus radix caching can livelock admission with an idle GPU; FA4 also crashes during GLM-5.3-Flash CUDA-graph capture on SM120 ([#41579](https://github.com/sgl-project/sglang/issues/41579), [#42012](https://github.com/sgl-project/sglang/issues/42012)).
- **Medium:** HiCache may restore another TP rank’s Mamba state; a fix PR exists ([PR #41907](https://github.com/sgl-project/sglang/pull/41907)).

## What This Means for Application Developers

- Avoid NVFP4 KV for long-context workloads until scale validation is fixed; validate served output on the target architecture before rollout.
- Test streaming tool calls carefully: DeepSeek V3/V3.1 and Harmony parsers have argument/channel handling bugs ([#42327](https://github.com/sgl-project/sglang/issues/42327), [#42143](https://github.com/sgl-project/sglang/issues/42143)).
- For multi-turn Qwen traffic, avoid templates that hoist inline system messages, which can defeat prefix-cache reuse ([#42272](https://github.com/sgl-project/sglang/issues/42272)).

</details>

<details>
<summary><strong>llama.cpp</strong> — <a href="https://github.com/ggml-org/llama.cpp">ggml-org/llama.cpp</a></summary>

## TL;DR
- **llama.cpp shipped b11366–b11378**, improving OpenVINO performance, Qwen indexer memory use, recurrent-state graph handling, speculative sampling, and Ling 3.0 structured output. ([b11374](https://github.com/ggml-org/llama.cpp/releases/tag/b11374), [b11372](https://github.com/ggml-org/llama.cpp/releases/tag/b11372))
- **Open pull requests target BF16X recompression, Q2_K kernel efficiency, Intel Vulkan prefill, SYCL correctness, and host-resident MoE caching.** ([#29896](https://github.com/ggml-org/llama.cpp/pull/29896), [#29910](https://github.com/ggml-org/llama.cpp/pull/29910))
- **Serving reliability remains the main risk**, with reports of Qwen MTP startup assertions, Metal decode stalls, idle-request hangs, and potential cross-request KV-cache contamination. ([#29811](https://github.com/ggml-org/llama.cpp/issues/29811), [#29867](https://github.com/ggml-org/llama.cpp/issues/29867), [#28056](https://github.com/ggml-org/llama.cpp/issues/28056))

## New Model & Hardware Support
- **Clef**, a text-only decision model, landed in b11371. ([b11371](https://github.com/ggml-org/llama.cpp/releases/tag/b11371))
- A pending **BF16X** proposal adds near-lossless recompression at **11.5 bpw**—**1.39× smaller than BF16**—with CPU and GPU execution. ([#29896](https://github.com/ggml-org/llama.cpp/pull/29896))
- OpenVINO was updated to **2026.4.1**, expanding Qwen3.5 MoE performance, profiling, operation coverage, and device discovery. ([b11374](https://github.com/ggml-org/llama.cpp/releases/tag/b11374))

## Performance & Optimization
- Qwen experimental indexer score memory was approximately **halved** by eliminating duplicated long-context FP32 tensors. ([b11372](https://github.com/ggml-org/llama.cpp/releases/tag/b11372))
- CUDA now fuses shared MoE experts into MMVQ; pending work addresses Q2_K register spills and host-memory expert caching. ([b11370](https://github.com/ggml-org/llama.cpp/releases/tag/b11370), [#29910](https://github.com/ggml-org/llama.cpp/pull/29910), [#29887](https://github.com/ggml-org/llama.cpp/pull/29887))
- Intel Vulkan Flash-Attention prefill and SYCL memory-safety fixes are in review. ([#29357](https://github.com/ggml-org/llama.cpp/pull/29357), [#29889](https://github.com/ggml-org/llama.cpp/pull/29889))

## Stability & Regressions
- **High:** reported KV-cache contamination could leak content between requests; **high:** Qwen 3.8 MTP can assert at startup. ([#28056](https://github.com/ggml-org/llama.cpp/issues/28056), [#29811](https://github.com/ggml-org/llama.cpp/issues/29811))
- **Medium:** GLM decode stalls when Metal’s fused indexer falls back to CPU; a request arriving during idle sleep may remain stuck. ([#29867](https://github.com/ggml-org/llama.cpp/issues/29867), [#29689](https://github.com/ggml-org/llama.cpp/issues/29689))
- Laya’s `n_batch > n_ubatch` server abort was closed with a fix PR. ([#29903](https://github.com/ggml-org/llama.cpp/pull/29903))

## What This Means for Application Developers
- Pin exact builds and regression-test long-context, concurrent, MTP, and multi-GPU workloads before deployment.
- Validate `response_format.json_schema` with Ling 3.0; the parser now applies an eager response grammar. ([b11377](https://github.com/ggml-org/llama.cpp/releases/tag/b11377))
- Treat pending BF16X and cache optimizations as experimental until merged and benchmarked.

</details>

<details>
<summary><strong>Ollama</strong> — <a href="https://github.com/ollama/ollama">ollama/ollama</a></summary>

## 1. **TL;DR**
- No Ollama release shipped in the last 24 hours; a [llama.cpp version update](https://github.com/ollama/ollama/pull/18761) is awaiting integration.
- The main focus is OpenAI-compatible API correctness, with fixes in progress for parallel tool-result association, array-form tool content, and assistant reasoning propagation.
- Apple MLX performance and memory-management concerns remain prominent, alongside a reported Windows v0.35.1 installer signature failure.

## 2. **New Model & Hardware Support**
- A proposed Linux build fix links the MLX runner against `libdl`, restoring compatibility with glibc versions older than 2.34, including Debian 11. [PR #17567](https://github.com/ollama/ollama/pull/17567)
- The installer currently cannot provision both CUDA and ROCm runtimes for mixed NVIDIA/AMD systems; users are requesting dual-runtime support. [Issue #18545](https://github.com/ollama/ollama/issues/18545)

## 3. **Performance & Optimization**
- The MLX runner reportedly underutilizes GPU resources on an M4 Pro, with a 27B MXFP8 model performing substantially worse than on an older Ollama release. [Issue #18754](https://github.com/ollama/ollama/issues/18754)
- ROCm may ignore available unified VRAM when evicting models, causing premature removal of models that should still fit. [Issue #18756](https://github.com/ollama/ollama/issues/18756)
- Quantizing imported safetensors reportedly leaves large unreferenced F16 blobs, producing severe storage waste. [Issue #18416](https://github.com/ollama/ollama/issues/18416)

## 4. **Stability & Regressions**
- **High:** Ollama v0.35.1’s Windows installer reportedly fails Authenticode verification with `HashMismatch`; no fix PR is listed. [Issue #18765](https://github.com/ollama/ollama/issues/18765)
- **High:** `/v1/chat/completions` can misassociate reordered parallel tool results by position rather than `tool_call_id`; fixes are proposed in [PR #18767](https://github.com/ollama/ollama/pull/18767) and [PR #18722](https://github.com/ollama/ollama/pull/18722).
- **Medium:** `clef-flash` fails on `/v1/systemone` despite working through `/v1/chat/completions`; no fix PR is listed. [Issue #18769](https://github.com/ollama/ollama/issues/18769)

## 5. **What This Means for Application Developers**
- Until the tool-result fixes land, preserve tool-call/result ordering or validate and reorder messages by `tool_call_id`.
- Avoid relying on `think: "low"`, `"medium"`, or `"high"` for affected Qwen3.8 GGUFs; only `think: false` reportedly changes behavior. [Issue #18766](https://github.com/ollama/ollama/issues/18766)
- Pin and verify Windows installer signatures, and budget cleanup for failed or quantized imports to avoid unmanaged storage growth.

</details>

<details>
<summary><strong>LiteLLM</strong> — <a href="https://github.com/BerriAI/litellm">BerriAI/litellm</a></summary>

## TL;DR
- LiteLLM added ClinePass, ai&, GitHub Copilot Anthropic-beta forwarding, and a unified Jev-compatible `/v1/decisions` API ([#44379](https://github.com/BerriAI/litellm/pull/44379), [#44353](https://github.com/BerriAI/litellm/pull/44353), [#44378](https://github.com/BerriAI/litellm/pull/44378), [#44236](https://github.com/BerriAI/litellm/pull/44236)).
- Operational fixes target trace loading, quota retry classification, custom-provider error propagation, and deployment-scoped request state ([#44364](https://github.com/BerriAI/litellm/pull/44364), [#32789](https://github.com/BerriAI/litellm/pull/32789), [#33151](https://github.com/BerriAI/litellm/pull/33151), [#32112](https://github.com/BerriAI/litellm/issues/32112)).
- Budget enforcement, streaming translation, multimodal routing, and health-check attribution remain significant open risks ([#26672](https://github.com/BerriAI/litellm/issues/26672), [#32357](https://github.com/BerriAI/litellm/issues/32357), [#44336](https://github.com/BerriAI/litellm/issues/44336), [#44154](https://github.com/BerriAI/litellm/issues/44154)).

## New Model & Hardware Support
- ClinePass adds an OpenAI-compatible provider with nonstandard response-envelope handling ([PR #44379](https://github.com/BerriAI/litellm/pull/44379)).
- ai& gains chat-completions, Responses, and Anthropic Messages integration ([PR #44353](https://github.com/BerriAI/litellm/pull/44353)).
- A unified `/v1/decisions` route now targets Jev-compatible providers such as Cloudflare Clef and Strands Decider ([PR #44236](https://github.com/BerriAI/litellm/pull/44236)).

## Performance & Optimization
- Trace detail loading is being changed to bounded keyset reads, fixing failures for traces exceeding 1,000 spans ([PR #44364](https://github.com/BerriAI/litellm/pull/44364)).
- Usage UI work adds provider-level output-tokens-per-second comparison, though no measured speedup is reported ([PR #44372](https://github.com/BerriAI/litellm/pull/44372)).

## Stability & Regressions
- **High:** key/user budgets may be bypassed or enforced using stale spend; related end-user model budgets also remain broken ([#26672](https://github.com/BerriAI/litellm/issues/26672), [#31842](https://github.com/BerriAI/litellm/issues/31842)).
- **High:** Anthropic streaming can duplicate or mis-encode reasoning; web-search results may disappear after stream re-wrapping ([#32357](https://github.com/BerriAI/litellm/issues/32357), [#35333](https://github.com/BerriAI/litellm/issues/35333)).
- **Medium:** health results can mark every identically named deployment unhealthy; Vertex Agent Engine silently drops non-text content ([#44154](https://github.com/BerriAI/litellm/issues/44154), [#44336](https://github.com/BerriAI/litellm/issues/44336)).

## What This Means for Application Developers
- Independently verify server-side budget accounting; retain gateway-side spend controls.
- Regression-test Anthropic tools, reasoning streams, multimodal attachments, and cross-provider fallback paths.
- Pin LiteLLM versions and validate production releases—today’s item set contains PRs, not confirmed shipped releases.

</details>

<details>
<summary><strong>Unsloth</strong> — <a href="https://github.com/unslothai/unsloth">unslothai/unsloth</a></summary>

## TL;DR

- Unsloth is expanding Studio into a multi-model, multimodal serving platform, with concurrent model residency, voice cloning/conversion, NPU configuration, and agent-tool integrations in active development ([PR #11591](https://github.com/unslothai/unsloth/pull/11591), [PR #12602](https://github.com/unslothai/unsloth/pull/12602)).
- Inference performance is mixed: tensor-split GGUF reportedly regressed by up to **2.9×**, while Studio’s OpenAI-compatible API previously added roughly **1.0–1.2 seconds per request** ([Issue #12468](https://github.com/unslothai/unsloth/issues/12468), [Issue #12364](https://github.com/unslothai/unsloth/issues/12364)).
- Several high-impact reliability issues remain open, including stuck generation, Triton corruption, offline model-loading failure, and OpenClaw’s temporary **8,192-token cap** ([Issue #12592](https://github.com/unslothai/unsloth/issues/12592), [Issue #12466](https://github.com/unslothai/unsloth/issues/12466)).

## New Model & Hardware Support

- Studio can retain several loaded models and route each request to its named model, enabling workload-specific residency ([PR #11591](https://github.com/unslothai/unsloth/pull/11591)).
- FastFlowLM NPU models gain pre-load configuration and token-rate visibility, bringing reporting closer to CUDA/GGUF behavior ([PR #12595](https://github.com/unslothai/unsloth/pull/12595)).
- New audio workflows add reference-based voice cloning and RVC/Seed-VC/MeanVC2 voice conversion ([PR #12602](https://github.com/unslothai/unsloth/pull/12602), [PR #12611](https://github.com/unslothai/unsloth/pull/12611)).

## Performance & Optimization

- A small-host FLUX path targets **5.19→4.49 seconds/step** through text-encoder prefetching and fused INT8 dequantization ([PR #12532](https://github.com/unslothai/unsloth/pull/12532)).
- INT8 diffusion kernels are being aligned with torchao 0.17 for bit-exact behavior and PyTorch-style rounding ([PR #12633](https://github.com/unslothai/unsloth/pull/12633)).
- Wan2.2 VAE decoding will disable tiling when sufficient VRAM is available, eliminating redundant overlap decoding ([PR #12603](https://github.com/unslothai/unsloth/pull/12603)).

## Stability & Regressions

- **High:** Stop/unload can freeze while generation continues; no fix is identified ([Issue #12592](https://github.com/unslothai/unsloth/issues/12592)).
- **High:** Xet health probing replaces Triton globally, breaking Diffusers/xformers; proposed Studio import isolation is awaiting review ([Issue #12466](https://github.com/unslothai/unsloth/issues/12466), [PR #12572](https://github.com/unslothai/unsloth/pull/12572)).
- **Medium:** Gemma 4 tool-result masking was fixed, while the OpenClaw **8,192-token** cutoff has a closed fix ([PR #12575](https://github.com/unslothai/unsloth/pull/12575), [PR #12573](https://github.com/unslothai/unsloth/pull/12573)).

## What This Means for Application Developers

- Pin known-good builds and avoid relying on tensor-split performance until the regression is isolated.
- For agent integrations, ensure model configuration respects the served context limit; OpenClaw’s cap has a fix pending merge.
- Test concurrent-model routing and cancellation semantics before production adoption, since both are still evolving ([PR #11591](https://github.com/unslothai/unsloth/pull/11591)).

</details>

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*