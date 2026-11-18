# AI Models & Labs 2026-11-18

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-18) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-18/ai-agents) · **🟦 AI Models & Labs** · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-18/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-18/ai-data)

> Lab posts: 3 | New models: 8 | Spotted: 7 | Generated: 2026-11-18 07:08 UTC

---

## Highlights

- Cerebras says its disaggregated inference pairs AMD GPUs for prefill with wafer-scale decode to deliver 5× more tokens per megawatt without slowing token generation.
- Authors of one analysis say they traced Gemini 4 Carbon runs that spent close to an hour on tasks Opus and Astra finished in minutes.

---

## Lab announcements

| Date | Lab | Post | Summary |
| :--- | :--- | :--- | :--- |
| 2026-11-18 | OpenAI | [Astra Law 6 2](https://openai.com/index/astra-law-6-2/) | — |
| 2026-11-18 | OpenAI | [Introducing Chatgpt For Sales](https://openai.com/index/introducing-chatgpt-for-sales/) | — |
| — | OpenAI | [Introducing Gpt 6 2 Astra Sol](https://openai.com/index/introducing-gpt-6-2-astra-sol/) | — |

---

## New on OpenRouter

| Model | Listed | Context | Summary |
| :--- | :--- | :--- | :--- |
| [OpenAI: GPT-6.2 Astra Pro](https://openrouter.ai/openai/gpt-6.2-astra-pro) `openai/gpt-6.2-astra-pro` | 2026-11-17 | 1.1M | GPT-6.2 Astra Pro is the same underlying model as GPT-6.2 Astra, served with `reasoning.mode` set to `pro` for higher-quality responses on complex tasks. |
| [OpenAI: GPT-6.2 Astra Pro (batch)](https://openrouter.ai/openai/gpt-6.2-astra-pro:batch) `openai/gpt-6.2-astra-pro:batch` | 2026-11-17 | 1.1M | GPT-6.2 Astra Pro (batch) is the same underlying model as GPT-6.2 Astra, served with `reasoning.mode` set to `pro` for higher-quality responses on complex tasks. |
| [OpenAI: GPT-6.2 Astra](https://openrouter.ai/openai/gpt-6.2-astra) `openai/gpt-6.2-astra` | 2026-11-17 | 1.1M | GPT-6.2 Astra is the flagship model in the GPT-6.2 series, built for the hardest projects and suited for real-world engineering, professional work and scientific research. |
| [OpenAI: GPT-6.2 Astra (batch)](https://openrouter.ai/openai/gpt-6.2-astra:batch) `openai/gpt-6.2-astra:batch` | 2026-11-17 | 1.1M | GPT-6.2 Astra (batch) is the flagship model in the GPT-6.2 series, built for the hardest projects and suited for real-world engineering, professional work and scientific research. |
| [OpenAI: GPT-6.2 Sol Pro](https://openrouter.ai/openai/gpt-6.2-sol-pro) `openai/gpt-6.2-sol-pro` | 2026-11-17 | 1.1M | GPT-6.2 Sol Pro is the same underlying model as GPT-6.2 Sol, served with `reasoning.mode` set to `pro` for higher-quality responses on complex tasks. |
| [OpenAI: GPT-6.2 Sol Pro (batch)](https://openrouter.ai/openai/gpt-6.2-sol-pro:batch) `openai/gpt-6.2-sol-pro:batch` | 2026-11-17 | 1.1M | GPT-6.2 Sol Pro (batch) is the same underlying model as GPT-6.2 Sol, served with `reasoning.mode` set to `pro` for higher-quality responses on complex tasks. |
| [OpenAI: GPT-6.2 Sol](https://openrouter.ai/openai/gpt-6.2-sol) `openai/gpt-6.2-sol` | 2026-11-17 | 1.1M | GPT-6.2 Sol is an upgrade to GPT-6.1 Sol, positioned below the flagship GPT-6.2 Astra in the GPT-6.2 series and suited as an efficient, versatile model for everyday work. |
| [OpenAI: GPT-6.2 Sol (batch)](https://openrouter.ai/openai/gpt-6.2-sol:batch) `openai/gpt-6.2-sol:batch` | 2026-11-17 | 1.1M | GPT-6.2 Sol (batch) is an upgrade to GPT-6.1 Sol, positioned below the flagship GPT-6.2 Astra in the GPT-6.2 series and suited as an efficient, versatile model for everyday work. |

---

Nothing new from OpenRouter's stealth models today.

---

## Spotted

| Story | Source | Discussion | Summary |
| :--- | :--- | :--- | :--- |
| [MAI Code 2 and Code 2 Flash](https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/) | Hacker News | [334 points, 149 comments](https://news.ycombinator.com/item?id=50535885) | — |
| [Tencent Hy4 Flash](https://hy.tencent.ai/research/hy4-flash) | Hacker News | [104 points, 14 comments](https://news.ycombinator.com/item?id=50538184) | — |
| [Cerebras Disaggregated Inference](https://www.cerebras.ai/blog/cerebras-launches-disaggregated-inference) | Hacker News | [63 points, 16 comments](https://news.ycombinator.com/item?id=50540472) | Cerebras claims its disaggregated inference setup pairs AMD GPUs for prefill with wafer-scale decode to deliver 5× more tokens per megawatt without slowing token generation. |
| Show HN: TrnRT – An open-source LLM inference engine for AWS Trainium ([RunanywhereAI/trnrt](https://github.com/RunanywhereAI/trnrt)) | Hacker News | [48 points, 7 comments](https://news.ycombinator.com/item?id=50533270) | RunAnywhere says TrnRT is an open-source LLM inference engine for AWS Trainium with NKI megakernels, 1M-token context, and an OpenAI-compatible API. |
| [Latent Lattice Language Models](https://shivamduggal4.github.io/latent-lattice-language-models/) | Hacker News | [46 points, 5 comments](https://news.ycombinator.com/item?id=50539039) | The author introduces Latent Lattice Language Models, adding horizontal latent streams at each layer that carry across tokens next to the vertical residual stream. |
| [Why is Gemini 4 Carbon taking so long?](https://kernel.dev/blog/why-is-gemini-4-carbon-taking-so-long/) | Hacker News | [42 points, 25 comments](https://news.ycombinator.com/item?id=50541790) | The authors say they traced Gemini 4 Carbon runs to explain why it spent close to an hour on tasks that Opus and Astra finished in minutes. |
| [Program-as-Weights: A Programming Paradigm for Fuzzy Functions](https://arxiv.org/abs/2607.02512) | Lobste.rs | [12 points, 6 comments](https://lobste.rs/s/qkalae/program_as_weights_programming_paradigm) | The authors propose Program-as-Weights as a programming paradigm for fuzzy functions, citing examples such as important-log alerting, malformed JSON repair, and intent-based search ranking, and arguing that using LLM APIs for them comes at the expense of locality, reproducibility, and price. |

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*