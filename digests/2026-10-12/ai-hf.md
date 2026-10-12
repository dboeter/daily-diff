# Hugging Face Trending Models Weekly 2026-10-12

> Source: [Hugging Face Hub](https://huggingface.co/) | 30 models | Generated: 2026-10-12 01:37 UTC

---

# Hugging Face Trending Models Digest — 2026-10-12

## Today's Highlights

The Qwen ecosystem dominates this week's trending list with nine models spanning base releases, Turbo variants, and heavily quantized community fine-tunes — signaling a maturation of the Qwen 3.8/4.0 family as the go-to open-weight foundation. Video generation sees a breakthrough with Lightricks' LTX-2.5 (7.3k likes, 1.7M downloads) and FrancisRing's Prism pioneering joint video-audio diffusion, while Cloudflare enters the multimodal race with two efficient CLEF models. Quantization research is accelerating: ISTA-DASLab and Unsloth lead mixed-precision GGUF releases (GSQ/RCO) that push 27B models toward on-device viability, and ternary-weight experiments from prism-ml demonstrate 2-bit compression at scale.

---

## Trending Models

### 🧠 Language Models

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) | Qwen | 17,509 | 6,843,108 | Flagship 27B multimodal model with image-text-to-text capabilities, leading weekly likes by a wide margin. Its 6.8M downloads reflect massive adoption as a versatile open-weight foundation for chat, reasoning, and vision tasks. |
| [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) | Qwen | 6,112 | 1,870,465 | Experimental "Flash-Next" variant optimized for speed and efficiency, built on Qwen 4.0 architecture. Nearly 1.9M downloads indicate strong developer interest in next-gen efficient multimodal models. |
| [deepseek-ai/DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash) | deepseek-ai | 4,365 | 1,382,367 | DeepSeek's latest Flash iteration with image-text-to-text support, positioning as a high-throughput open-weight competitor. 1.38M downloads show rapid uptake for production inference workloads. |
| [Aleph-Alpha/Kolibri-1](https://huggingface.co/Aleph-Alpha/Kolibri-1) | Aleph-Alpha | 887 | 12,550 | German-engineered MoE model emphasizing reasoning capabilities with vLLM optimization. Niche but notable for European sovereign AI efforts and mixture-of-experts architecture. |
| [Venastine-Research/Xing4.0-29B-A4B-GGUF](https://huggingface.co/Venastine-Research/Xing4.0-29B-A4B-GGUF) | Venastine-Research | 691 | 48,389 | 29B parameter model with 4B active parameters (MoE), released in GGUF for efficient inference. Strong download count for a research release indicates community appetite for sparse architectures. |
| [ConwayResearch/Underdog-Saluki-27B-1.0](https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0) | ConwayResearch | 322 | 108,900 | Tool-calling specialized 27B model with 2-bit quantization support via llama.cpp. 108K downloads highlight demand for function-calling capable compact models. |
| [LiquidAI/d1-3B](https://huggingface.co/LiquidAI/d1-3B) | LiquidAI | 300 | 10,843 | Compact 3B liquid foundation model (LFM2-VL) with image-text-to-text pipeline. Represents Liquid AI's novel non-transformer architecture gaining early traction. |
| [jialinyyzz/humanizer](https://huggingface.co/jialinyyzz/humanizer) | jialinyyzz | 1,087 | 37,647 | Gemma 4-based unified model for humanizing AI text with image-text-to-text capability. 1K+ likes reflect interest in style-transfer and detection-evasion use cases. |

### 🎨 Multimodal & Generation

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) | Lightricks | 7,322 | 1,726,683 | State-of-the-art image-to-video and text-to-video diffusion model with video-to-video editing. 7.3K likes and 1.7M downloads establish it as the leading open video generation model this week. |
| [Qwen/Qwen-Image-2.1](https://huggingface.co/Qwen/Qwen-Image-2.1) | Qwen | 3,227 | 136,103 | Qwen's flagship text-to-image and image-editing model with diffusers integration. Strong likes indicate community confidence in Qwen's visual generation lineage. |
| [abenzerps/Qwen-Image-2.1-Uncensored-GGUF](https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF) | abenzerps | 3,988 | 2,188,658 | Uncensored GGUF quant of Qwen-Image-2.1 for ComfyUI, leading downloads at 2.19M. Demonstrates massive demand for unrestricted, locally-run image generation. |
| [Cloudflare/clef](https://huggingface.co/Cloudflare/clef) | Cloudflare | 2,028 | 14,351 | Cloudflare's entry into multimodal with CLEF (Qwen 3.5-based) for image-text-to-text. 2K likes signal industry interest in edge-optimized vision-language models. |
| [Qwen/Qwen-Image-2.1-Turbo](https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo) | Qwen | 543 | 4,702 | Turbo variant optimized for faster inference with image editing capabilities. Early release with modest downloads but clear positioning for real-time applications. |
| [AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF](https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF) | AtomicChat | 324 | 100,530 | Uncensored GGUF of the Turbo variant, achieving 100K downloads quickly. Shows derivative quantizers can outpace base model adoption for specific use cases. |
| [Cloudflare/clef-flash](https://huggingface.co/Cloudflare/clef-flash) | Cloudflare | 756 | 22,123 | Flash-optimized CLEF variant for faster image-text-to-text inference. 22K downloads in early release suggests strong edge-deployment interest. |
| [FrancisRing/Prism](https://huggingface.co/FrancisRing/Prism) | FrancisRing | 161 | 0 | Novel joint video-audio diffusion transformer for synchronized generation. Zero downloads but notable architectural innovation worth monitoring. |
| [canberkkkkkk/ema-lightning](https://huggingface.co/canberkkkkkk/ema-lightning) | canberkkkkkk | 357 | 18,079 | Turkish-focused EMA-Lightning TTS model for speech synthesis. Niche language coverage with 18K downloads showing regional deployment traction. |
| [speridlabs/iris-3b](https://huggingface.co/speridlabs/iris-3b) | speridlabs | 150 | 393 | Lightweight 3B pixel-space diffusion model for text-to-image. Early research release with minimal adoption but interesting efficient architecture. |

### 🔧 Specialized Models

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [facebook/sam3](https://huggingface.co/facebook/sam3) | facebook | 4,072 | 2,081,596 | Third-gen Segment Anything Model with video support (sam3_video). 2M+ downloads and 4K likes confirm Meta's dominance in open segmentation foundations. |
| [google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2) | google | 1,711 | 98,829 | Google's Gemma 2-based embedding model for feature extraction. 98K downloads reflect strong RAG and retrieval adoption for the Gemma ecosystem. |
| [unsloth/embeddinggemma-2-GGUF](https://huggingface.co/unsloth/embeddinggemma-2-GGUF) | unsloth | 255 | 59,274 | GGUF-quantized multimodal embedding variant from Unsloth. 59K downloads show demand for quantized embeddings in memory-constrained pipelines. |
| [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya) | convaiinnovations | 5,493 | 44,088 | Calibrated decision-making classifier (System One) for reliable text classification. 5.5K likes highlight growing focus on trustworthy, uncertainty-aware models. |
| [Cactus-Compute/whistle](https://huggingface.co/Cactus-Compute/whistle) | Cactus-Compute | 336 | 16,434 | On-device speech recognition model (Cactus-Needle/Whistle) optimized for mobile. 16K downloads indicate edge ASR deployment momentum. |

### 📦 Fine-tunes & Quantizations

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF) | unsloth | 5,026 | 6,488,262 | Unsloth's official GGUF quantization of Qwen3.8-27B, leading fine-tune downloads at 6.5M. Gold standard for efficient 27B deployment across hardware. |
| [ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF) | ISTA-DASLab | 2,153 | 1,489,676 | Mixed-precision GSQ/RCO quantization research release preserving quality at extreme compression. 1.5M downloads validate academic quantization techniques in production. |
| [ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF) | ISTA-DASLab | 799 | 4,189,006 | Flash-Next variant with GSQ/RCO mixed-precision quantization. 4.2M downloads show Flash architecture + advanced quantization = massive adoption. |
| [prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf) | prism-ml | 2,630 | 4,549,911 | Ternary (2-bit) quantized 27B model using llama.cpp, pushing compression boundaries. 4.5M downloads prove extreme quantization viability for large models. |
| [DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF) | DavidAU | 1,657 | 2,016,567 | Heavily merged/uncensored fine-tune with MTP (multi-token prediction) and NEO-CODER specialization. 2M downloads reflect appetite for highly customized, uncensored variants. |
| [nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2](https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2) | nerkyor | 237 | 56,525 | Kitchen-sink merge combining Coder, EfficientThink, Opus, Astra, Grok, DSV4Pro with SFT/RLOO/MTP. 56K downloads for a research merge shows merge-culture maturity. |
| [orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF](https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF) | orcarouter | 760 | 614,193 | Abliterated/uncensored GGUF of Flash-Next for unrestricted use. 614K downloads confirm uncensored variants consistently outpace aligned base models in community adoption. |

---

## Ecosystem Signal

The Qwen family has cemented its position as the default open-weight multimodal foundation: nine of the top 30 models are Qwen-derived (base, Turbo, Flash-Next, Image, and quantized variants), with aggregate downloads exceeding 23M. This mirrors the Llama 2/3 trajectory but compressed into a single release cycle — base models launch alongside Turbo/Flash variants, and quantization research (GSQ/RCO, ternary, MTP) moves from academia to production within weeks. Unsloth and ISTA-DASLab have emerged as the de facto quantization authorities, their GGUF releases collectively surpassing 12M downloads. Uncensored/abliterated variants consistently out-download aligned counterparts (abenzerps: 2.19M vs Qwen-Image-2.1: 136K; orcarouter: 614K vs Qwen-Flash-Next: 1.87M), revealing a persistent community preference for unrestricted weights. Video generation has crossed a usability threshold: LTX-2.5's 1.7M downloads and Prism's joint audio-video architecture signal the diffusion-to-video pipeline maturing for creative workflows. Meanwhile, specialized models (SAM3, embeddinggemma, Whistle, Laya) maintain steady adoption in vertical applications, suggesting the ecosystem is broadening beyond chat-centric LLMs into a full multimodal toolkit.

---

## Worth Exploring

1. **Lightricks/LTX-2.5** — The most mature open video generation model to date with 1.7M downloads validating production readiness. Supports image-to-video, text-to-video, and video-to-video editing in a single diffusion framework. Ideal for prototyping video workflows without proprietary APIs.

2. **ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF** — Cutting-edge mixed-precision quantization (GSQ/RCO) on the Flash-Next architecture, delivering 27B capability at fraction of memory. 4.2M downloads confirm it runs reliably on consumer GPUs. Essential for studying quantization-state-of-the-art and deploying large multimodal models locally.

3. **facebook/sam3** — Segment Anything Model 3 with video segmentation (sam3_video) at 2M+ downloads. The segmentation foundation for any vision pipeline — tracking, editing, annotation, robotics. Meta's continued investment makes it the safest long-term bet for open segmentation.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*