# Hugging Face Trending Models Weekly 2026-10-05

> Source: [Hugging Face Hub](https://huggingface.co/) | 30 models | Generated: 2026-10-04 20:34 UTC

---

# Hugging Face Trending Models Digest — 2026-10-05

## 1. Today's Highlights

Qwen dominates this week’s chart, with **Qwen3.8-27B** leading likes at **16,928** and several optimized, quantized, and uncensored derivatives attracting substantial usage. Cloudflare’s **CLEF** models and the **Qwen3.8-Flash-Next** line point to continued demand for efficient multimodal and agentic systems. Visual generation remains exceptionally popular: **LTX-2.5**, **Qwen-Image-2.1**, and multiple derivative LoRAs and GGUF packages collectively register millions of downloads. Quantization and mixed-precision research are especially visible, with ISTA-DASLab’s GSQ/RCO releases, prism-ml’s 2-bit Ternary Bonsai, and community Qwen packages generating heavy download activity despite more modest like counts.

## 2. Trending Models

### 🧠 Language Models

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) | Qwen | 16,928 | 6,821,761 | Qwen3.8-27B is a major multimodal language model combining conversational and image-text capabilities. It is the most-liked model in the listing and leads downloads by a wide margin. |
| [ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF) | ISTA-DASLab | 549 | 1,886,975 | This is a GGUF-distributed, mixed-precision derivative of Qwen3.8 Flash Next. Its focus on quantization, pruning, and reduced-precision deployment drives its high download volume. |
| [Aleph-Alpha/Kolibri-1](https://huggingface.co/Aleph-Alpha/Kolibri-1) | Aleph-Alpha | 377 | 1,135 | Kolibri-1 is a reasoning-oriented MoE text-generation model offered through the vLLM ecosystem. It stands out as an early, comparatively small release from Aleph-Alpha in the emerging open-weight landscape. |
| [Contrastive-LM/CLM-v0.1-8B](https://huggingface.co/Contrastive-LM/CLM-v0.1-8B) | Contrastive-LM | 710 | 3,445 | CLM-v0.1-8B is an 8B contrastive language model designed for ranking, reranking, and verification tasks. It highlights growing interest in specialized scoring models rather than conventional generation alone. |
| [SupersonicLabs/Julia-1](https://huggingface.co/SupersonicLabs/Julia-1) | SupersonicLabs | 412 | 3,657 | Julia-1 is a multilingual decision model for text classification. It is trending as a compact, task-specific alternative to larger general-purpose language models. |
| [Venastine-Research/Xing4.0-29B-A4B-GGUF](https://huggingface.co/Venastine-Research/Xing4.0-29B-A4B-GGUF) | Venastine-Research | 263 | 14,361 | Xing4.0-29B-A4B is a mixture-style text-generation model distributed in GGUF form. Its 29B total and A4B designation suggest an emphasis on selective activation and efficient inference. |
| [TaichuAI/ZDTaichu5.0-9B](https://huggingface.co/TaichuAI/ZDTaichu5.0-9B) | TaichuAI | 2,859 | 12,638 | ZDTaichu5.0-9B is a 9B vision-language model focused on multimodal understanding and spatial reasoning. It is notable for pairing a relatively compact model size with 2,859 likes. |
| [deepseek-ai/DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash) | deepseek-ai | 4,090 | 798,422 | DeepSeek-V4.1-Flash is a multimodal text-generation model positioned around fast, efficient inference. It combines image-text support with a strong 798,422-download adoption figure. |
| [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) | Qwen | 5,893 | 1,480,842 | Qwen3.8-Flash-Next is a conversational multimodal model built around the Qwen experimental architecture. It ranks among the most-liked releases and has crossed 1.48 million downloads. |
| [NaiveAI/Naive-N0.5-Flash](https://huggingface.co/NaiveAI/Naive-N0.5-Flash) | NaiveAI | 164 | 1,920 | Naive-N0.5-Flash is an MoE model aimed at code and long-context applications. It is an early-stage research release whose interest lies in its efficient architecture and extended-context focus. |

### 🎨 Multimodal & Generation

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [Qwen/Qwen-Image-2.1](https://huggingface.co/Qwen/Qwen-Image-2.1) | Qwen | 2,938 | 90,003 | Qwen-Image-2.1 is a text-to-image model supporting both image generation and image editing. It is the central upstream model in today’s Qwen image ecosystem and has accumulated 90,003 downloads. |
| [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) | Lightricks | 6,275 | 1,626,951 | LTX-2.5 is a video-generation model supporting image-to-video, text-to-video, video-to-video, and combined image-text workflows. It is both the most-liked visual-generation model in this list and a million-download release. |
| [Alissonerdx/BFS-Best-Face-Swap](https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap) | Alissonerdx | 1,175 | 203,086 | BFS-Best-Face-Swap is a LoRA-based Qwen-Image 2.1 derivative for face replacement and image editing. Its specialized identity-preservation workflow has helped it pass 200,000 downloads. |
| [akatz-ai/MiniMax-H3-Character-Swap-LoRA](https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA) | akatz-ai | 286 | 15,800 | This MiniMax-H3 LoRA performs character swaps in video-to-video workflows. It extends generative video tools with a focused identity-replacement capability. |
| [pablodawson/MiniMax-H3-360-Orbit-LoRA](https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA) | pablodawson | 183 | 5,742 | MiniMax-H3-360-Orbit-LoRA is designed for first-and-last-frame image-to-video generation. Its standout feature is temporal control from specified starting and ending frames. |

### 🔧 Specialized Models

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [Cloudflare/clef](https://huggingface.co/Cloudflare/clef) | Cloudflare | 1,167 | 4,214 | CLEF is a Qwen3.5-based image-text model associated with Cloudflare’s specialized model stack. It is the stronger of two Cloudflare releases in the chart, with more than twice the likes of CLEF Flash. |
| [Cloudflare/clef-flash](https://huggingface.co/Cloudflare/clef-flash) | Cloudflare | 421 | 6,372 | CLEF Flash is a lightweight Qwen3.5-based image-text model from Cloudflare. Its download count exceeds that of the standard CLEF model despite having fewer likes. |
| [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya) | convaiinnovations | 5,147 | 3,752 | Laya is a text-classification model focused on calibrated decisions and System One-style inference. Its exceptionally high like-to-download ratio suggests strong attention from evaluation, decision-making, and agent developers. |
| [PSRben/VisionHOPE](https://huggingface.co/PSRben/VisionHOPE) | PSRben | 401 | 1,516 | VisionHOPE is a computer-vision image-classification model associated with a 2026 arXiv paper. It represents research interest in alternative visual representation and classification approaches. |
| [nvidia/Nemotron-3-Diarization](https://huggingface.co/nvidia/Nemotron-3-Diarization) | nvidia | 671 | 53,014 | Nemotron-3-Diarization performs speaker and voice-activity analysis using NVIDIA’s NeMo stack. It is notable for combining modern diarization with GGUF support and deployment-oriented audio classification. |
| [FermionResearch/Phonon-2](https://huggingface.co/FermionResearch/Phonon-2) | FermionResearch | 199 | 2,635 | Phonon-2 is an automatic speech-recognition model using a Parakeet TDT five-value architecture. It is packaged for MLX and optimized for Apple Silicon, giving it a distinct local-inference focus. |
| [fastino/GLiNER2.5-Decide](https://huggingface.co/fastino/GLiNER2.5-Decide) | fastino | 364 | 53,625 | GLiNER2.5-Decide is a token-classification model based on the GLiNER2 extractor family. It is used for intent classification and text extraction, with downloads more than 100 times its like count. |

### 📦 Fine-tunes & Quantizations

| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [abenzerps/Qwen-Image-2.1-Uncensored-GGUF](https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF) | abenzerps | 3,100 | 1,553,744 | This is an uncensored GGUF derivative of Qwen-Image 2.1 designed for ComfyUI workflows. Its million-plus download count demonstrates strong demand for locally deployable image-generation packages. |
| [Viggle/Qwen-Image-2.1-viggle-turbo](https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo) | Viggle | 585 | 272,896 | Viggle Turbo is a LoRA and GGUF derivative of Qwen-Image 2.1 offering accelerated image generation. It combines a compact distribution footprint with 272,896 downloads. |
| [orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF](https://huggingface.co/orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF) | orcarouter | 356 | 14,195 | OrcaSAQ-2-Cyber-27B is an uncensored 27B GGUF language model targeted at cyber and security-oriented use. It reflects the proliferation of specialized, locally runnable Qwen-derived models. |
| [ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF) | ISTA-DASLab | 258 | 351,230 | This coder-oriented Qwen3.8 Flash Next derivative applies GSQ/RCO quantization and pruning techniques. It stands out for addressing both code specialization and efficient mixed-precision inference. |
| [prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf) | prism-ml | 2,414 | 4,045,810 | Ternary Bonsai-2 is a 27B ternary, 2-bit language model distributed through llama.cpp. It is the second-most-downloaded model in the listing, illustrating exceptional interest in aggressive quantization. |
| [Infatoshi/GLM-5.3-UNCENSORED-EXL3-3.0bpw](https://huggingface.co/Infatoshi/GLM-5.3-UNCENSORED-EXL3-3.0bpw) | Infatoshi | 209 | 946 | This is an uncensored GLM-5.3 package optimized for ExLlamaV3 at roughly 3 bits per weight. It targets efficient GPU inference through aggressive precision reduction. |
| [ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF) | ISTA-DASLab | 1,958 | 1,636,747 | This Qwen3.8-27B package applies GSQ/RCO mixed-precision optimization and GGUF packaging. It combines strong community interest—1,958 likes—with more than 1.6 million downloads. |
| [DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF) | DavidAU | 1,417 | 2,164,143 | This heavily fused Qwen3.8-27B derivative combines Turbo, Fable, Heretic, uncensored, coder, and MTP features. Its 2,164,143 downloads make it the third-most-used model in the chart. |

## 3. Ecosystem Signal

Qwen is the clearest family gaining momentum. Its ecosystem now spans general multimodal assistants, image generation, coding models, Flash variants, uncensored fine-tunes, LoRAs, and several GGUF or mixed-precision packages. The presence of Cloudflare, NVIDIA, DeepSeek, Lightricks, and Qwen also shows that major organizations continue competing through downloadable weights rather than relying exclusively on closed APIs.

Open-weight differentiation is increasingly driven by deployment engineering. ISTA-DASLab’s GSQ/RCO models, prism-ml’s 2-bit ternary approach, and EXL3 packages show active experimentation with quantization, pruning, and mixed precision. The download-to-like imbalance is especially pronounced here: community conversions can reach millions of downloads with only hundreds or a few thousand likes, indicating practical experimentation rather than purely social engagement.

At the same time, specialized models are becoming more visible. Decision classifiers, rerankers, diarization systems, ASR models, entity extractors, and face- or character-swap LoRAs suggest that the ecosystem is moving beyond general-purpose foundation models toward workflow-specific components.

## 4. Worth Exploring

1. **[ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF)**  
   A strong candidate for studying mixed-precision deployment: it combines a popular 27B Qwen base with GSQ/RCO optimization and substantial real-world download activity.

2. **[prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)**  
   This 2-bit ternary 27B model is especially interesting for researchers investigating how aggressively large language models can be compressed without moving outside the GGUF and llama.cpp ecosystem.

3. **[Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)**  
   It is the strongest all-around visual-generation entry here, supporting several image- and video-to-video modalities and combining the chart’s highest visual-model like count with more than 1.6 million downloads.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*