# AI Models 2026-10-19

[📅 Overview](https://dboeter.github.io/daily-diff/#2026-10-19) · [🤖 AI Agents](https://dboeter.github.io/daily-diff/#2026-10-19/ai-agents) · [💬 AI Discussions](https://dboeter.github.io/daily-diff/#2026-10-19/ai-hn) · [📚 AI Research](https://dboeter.github.io/daily-diff/#2026-10-19/ai-arxiv) · [🌐 Lab Announcements](https://dboeter.github.io/daily-diff/#2026-10-19/ai-web) · [🗄️ Data Engineering Watch](https://dboeter.github.io/daily-diff/#2026-10-19/ai-data) · [📈 Agent & AI Coding Trends](https://dboeter.github.io/daily-diff/#2026-10-19/ai-trending) · **🧠 AI Models**

> Sources: [Hugging Face Hub](https://huggingface.co/) (30 models) + [OpenRouter](https://openrouter.ai/rankings) | Generated: 2026-10-19 01:04 UTC

---

## Highlights
DeepSeek’s V4.1 Flash family continues to dominate both Hugging Face likes and OpenRouter token usage, showcasing the strength of sparse mixture‑of‑experts designs. Multimodal video generation saw a surge with Lightricks’ LTX‑2.5 surpassing 2 million downloads, while open‑weight reasoning models like Reflection Beam 1.0 and Meta’s Muse Spark Open gained rapid traction for agentic workflows. Quantization and community fine‑tuning remained active, with numerous GGUF and LoRA releases appearing in the trending list.

## Hugging Face Trending
### 🧠 Language Models (LLMs, chat models, instruction-tuned)
| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [LiquidAI/LFM2.5-24B-A2B](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B) | LiquidAI | 471 | 13,007 | A 24B‑parameter mixture‑of‑experts language model optimized for reasoning and tool use. It is trending because of its efficient active‑parameter count and growing adoption in agentic workflows. |
| [tencent/Hy-Memory-30B-A3B](https://huggingface.co/tencent/Hy-Memory-30B-A3B) | tencent | 189 | 1,187 | A 30B‑parameter mixture‑of‑experts LLM focused on memory‑augmented generation. It gains attention for its novel memory‑routing architecture and strong performance on long‑context tasks. |

### 🎨 Multimodal & Generation (image, video, audio, text-to-X)
| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017) | deepseek-ai | 1,339 | 10,233 | A multimodal image‑text‑to‑text model from DeepSeek’s V4.1 Flash series. It is trending due to strong image‑understanding capabilities and recent release. |
| [openbmb/MiniCPM-V-4.7-35B-A3B](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B) | openbmb | 1,008 | 57,935 | A 35B parameter multimodal model supporting image‑text‑to‑text tasks. Popular for its efficient Mixture‑of‑Experts design and strong vision‑language performance. |
| [fishaudio/drama-3](https://huggingface.co/fishaudio/drama-3) | fishaudio | 694 | 9,620 | Text‑to‑speech model supporting multi‑speaker synthesis. Trending for its realistic voice generation and open‑source availability. |
| [black-forest-labs/flux-3-image-klein-comfy](https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy) | black-forest-labs | 812 | 338,036 | A Flux‑based image‑to‑image model packaged for ComfyUI workflows. Popular due to its high‑fidelity edits and seamless ComfyUI integration. |
| [meta-models/Muse-Spark-Open-816B-A42B](https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B) | meta-models | 546 | 1,809 | A massive 816B‑parameter Mixture‑of‑Experts model for image‑text‑to‑text tasks. Trending because of its scale and open release by Meta’s research team. |
| [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) | Lightricks | 8,378 | 2,012,496 | An image‑to‑video diffusion model enabling video generation from images. Trending thanks to over 2 M downloads and strong temporal consistency. |
| [black-forest-labs/flux-3-image-klein](https://huggingface.co/black-forest-labs/flux-3-image-klein) | black-forest-labs | 488 | 52,315 | The base Flux image‑to‑image model for editing and generation tasks. Trending due to its permissive licence and strong performance in image‑to‑image translation. |
| [abenzerps/Qwen-Image-2.1-Uncensored-Quantized](https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized) | abenzerps | 4,559 | 2,661,687 | A quantized, uncensored version of Qwen Image 2.1 for text‑to‑image synthesis. Popular for its high download count and ability to generate unrestricted visuals. |
| [OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT) | OpenMOSS-Team | 342 | 2,087 | A supervised fine‑tuned text‑to‑image model based on MOSS‑Image‑Base. Trending within niche communities for its specialized artistic styles. |
| [Qwen/Qwen-Image-2.1-Turbo](https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo) | Qwen | 984 | 23,131 | A turbo‑charged text‑to‑image model from the Qwen family. Gains attention for faster inference while maintaining competitive image quality. |
| [openbmb/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B) | openbmb | 387 | 22,689 | A compact 1B‑parameter vision‑language model for image‑text‑to‑text tasks. Trending due to its low resource footprint and strong performance for edge deployment. |
| [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) | Qwen | 17,960 | 7,695,206 | A 27B‑parameter multimodal model supporting image‑text‑to‑text and conversational tasks. Trending because of its massive download count and strong performance across vision‑language benchmarks. |
| [OpenMOSS-Team/MOSS-Image-Base](https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base) | OpenMOSS-Team | 294 | 354,126 | The base text‑to‑image model used as foundation for MOSS‑Image derivatives. Trending due to its widespread reuse in ComfyUI workflows and community fine‑tunes. |
| [nvidia/Qwen3.8-Flash-Next-FP4-Local](https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local) | nvidia | 213 | 4,876 | A FP4‑quantized version of Qwen 3.8 Flash for image‑text‑to‑text inference. Gaining interest for its low‑bit efficiency and NVIDIA‑optimized deployment. |
| [pablodawson/MiniMax-H3-360-Orbit-LoRA](https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA) | pablodawson | 512 | 25,366 | A LoRA adapter for MiniMax‑H3 enabling image‑text‑to‑video generation with orbit‑style motion. Trending within the video‑generation community for its lightweight fine‑tuning approach. |
| [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) | Qwen | 6,329 | 2,485,835 | A flash‑optimized version of Qwen 3.8 for image‑text‑to‑text tasks. Trending due to its strong performance and widespread adoption in vision‑language pipelines. |
| [deepseek-ai/DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash) | deepseek-ai | 4,637 | 1,316,711 | The base DeepSeek V4.1 Flash model for image‑text‑to‑text generation. Trending because of its efficient mixture‑of‑experts architecture and strong multimodal capabilities. |

### 🔧 Specialized Models (code, math, medical, embeddings)
| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2) | google | 2,662 | 164,339 | An embedding model based on Gemma 2 for feature extraction. Trending because of its high‑quality text embeddings and wide adoption in retrieval pipelines. |
| [baidu/Unlimited-OCR](https://huggingface.co/baidu/Unlimited-OCR) | baidu | 4,793 | 1,652,742 | An OCR model that converts images to text with unlimited length support. Trending because of its high accuracy and adoption in document‑processing pipelines. |
| [facebook/sam3](https://huggingface.co/facebook/sam3) | facebook | 4,623 | 1,945,717 | A mask‑generation model (SAM 3) for precise segmentation tasks. Trending because of its integration into vision pipelines and strong zero‑shot segmentation performance. |
| [datalab-to/indra-ocr](https://huggingface.co/datalab-to/indra-ocr) | datalab-to | 203 | 1,811 | An OCR model built with ONNX for CPU‑friendly text extraction from images. Trending among developers seeking lightweight, deployable OCR solutions. |
| [vllm-sr/d3](https://huggingface.co/vllm-sr/d3) | vllm-sr | 238 | 4,532 | A zero‑shot classification model based on Qwen3.5 for feature extraction. Gaining attention for its ability to perform classification without task‑specific training. |

### 📦 Fine-tunes & Quantizations (community fine-tunes, GGUF, AWQ)
| Model | Author | Likes | Downloads | Summary |
| :--- | :--- | ---: | ---: | :--- |
| [jialinyyzz/humanizer](https://huggingface.co/jialinyyzz/humanizer) | jialinyyzz | 1,947 | 103,709 | A GGUF‑quantized version of Gemma 4 Unified for text generation, marketed as a “humanizer” for more natural output. Gains traction due to low‑size quantisation and community interest in controllable tone. |
| [LiquidAI/LFM2.5-24B-A2B-GGUF](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF) | LiquidAI | 206 | 107,599 | GGUF‑quantized variant of the LFM2.5‑24B‑A2B mixture‑of‑experts model. Trending due to its compatibility with llama.cpp and reduced memory footprint. |
| [pablodawson/MiniMax-H3-360-Orbit-LoRA](https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA) | pablodawson | 512 | 25,366 | A LoRA adapter for MiniMax‑H3 enabling image‑text‑to‑video generation with orbit‑style motion. Trending within the video‑generation community for its lightweight fine‑tuning approach. |
| [Comfy-Org/MOSS-Image](https://huggingface.co/Comfy-Org/MOSS-Image) | Comfy-Org | 194 | 354,126 | A repackaged base model for MOSS‑Image tailored for ComfyUI usage. Trending because of its high download count reflecting widespread ComfyUI adoption. |
| [ConwayResearch/Underdog-Saluki-27B-1.0](https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0) | ConwayResearch | 542 | 410,558 | A 27B‑parameter GGUF‑quantized Llama‑style model with 2‑bit precision and tool‑calling support. Trending due to its extreme quantization and strong performance on function‑calling benchmarks. |
| [AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF](https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF) | AtomicChat | 555 | 387,254 | A GGUF‑quantized, uncensored version of Qwen Image 2.1 Turbo for text‑to‑image synthesis. Trending because it combines high‑quality generation with low‑bit deployment. |
| [nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2](https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2) | nerkyor | 433 | 256,336 | A heavily fine‑tuned, GGUF‑quantized 27B model integrating multiple expert pipelines for coding and reasoning. Trending within the LLM‑fine‑tuning community for its ambitious multi‑skill fusion. |

## OpenRouter Usage
- DeepSeek leads token usage with `deepseek/deepseek-v4.1-flash-20260910` at **35.89T** tokens, followed by `stepfun/step-5-preview-20261008` (**13.93T**) and `z-ai/glm-5.3-flash-20260826` (**12.60T**).  
- Notable newcomers in the top token list include `reflection/beam-1.0-501b-a23b` and `meta/muse-spark-open`, both recently listed and already attracting significant agentic‑workload traffic.  
- Newly listed models worth trying for agentic work: `reflection/beam-1.0-501b-a23b` (1,048,576 ctx) for long‑horizon reasoning, `meta/muse-spark-open` for coding‑focused agentic flows, and `nvidia/nemotron-3.5-super-vl` (1,048,576 ctx) for multimodal tool use.  
- Additionally, `google/gemini-4-argon` offers a 1,048,576‑token context for complex scientific and software‑engineering tasks, while the free variant `nvidia/nemotron-3.5-super-vl:free` provides accessible multimodal capabilities.

## Signals
The ecosystem is clearly consolidating around mixture‑of‑experts architectures, with DeepSeek, Qwen, and LiquidAI families driving both raw performance and efficient deployment. Open‑weight releases continue to outpace proprietary models in community engagement, as evidenced by the high likes and download counts for models like Qwen/Qwen3.8-27B and meta/muse-spark-open. Quantization remains a hot trend, with a surge in GGUF and LoRA variants that enable deployment on consumer hardware and specialized inference engines such as llama.cpp and ComfyUI. Fine‑tuning activity is also vibrant, particularly in the vision‑language domain where community LoRA adapters (e.g., pablodawson/MiniMax-H3-360-Orbit-LoRA) and SFT checkpoints (e.g., OpenMOSS-Team/MOSS-Image-SFT) are gaining rapid adoption. Overall, the week reflects a shift toward modular, efficient, and openly accessible models that can be readily customized for agentic workflows and edge applications.

## Worth a Look
- **Reflection Beam 1.0** (`reflection/beam-1.0-501b-a23b`): An open‑weight 501B‑parameter mixture‑of‑experts model with 23B active tokens per step, designed for long‑horizon reasoning and coding agents; its massive context window and open license make it ideal for research into autonomous workflows.  
- **Qwen/Qwen3.8-27B**: A 27B‑parameter vision‑language model that combines strong image‑text understanding with conversational abilities, offering a versatile foundation for multimodal applications without the overhead of larger models.  
- **LiquidAI/LFM2.5-24B-A2B-GGUF**: A GGUF‑quantized mixture‑of‑experts language model that retains robust reasoning capabilities while fitting comfortably into RAM‑constrained environments, perfect for experimenting with efficient agents on laptops or edge devices.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*