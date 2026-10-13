# ArXiv AI Research Digest 2026-10-13

> Source: [ArXiv](https://arxiv.org/) (cs.AI, cs.CL, cs.LG) | 40 papers ranked by [Jev](https://typesafe.ai) relevance | Generated: 2026-10-13 03:29 UTC

---

# ArXiv AI Research Digest — 2026-10-13

## Today's Highlights

A new multi-session agent framework (**HOA**) achieves perfect scores on IMO, IPhO, and IOI 2026 by orchestrating solve, review, wiki, and verification feedback loops—demonstrating that systematic workflow engineering can close the gap between open and closed models. On the safety front, **X-AgentRed** and **APEX-Harm** expose compositional failure modes in tool-using agents across evolving service ecosystems and shared professional workspaces, revealing that task completion does not imply safe behavior. In model architecture, **Multi-Stream Attention Residuals (MSAR)** delivers a 1.58× iso-loss compute speedup over standard residuals at 18B/28B MoE scales, while **DualQuant** enables calibration-free W4A4 quantization matching SmoothQuant accuracy with 2.61× memory reduction. Meanwhile, **MENTOR** and **Critique-Conditioned Self-Distillation** show that on-policy pedagogical intervention and critique-generated signals—not mere scoring—are essential for escaping zero-reward collapse and localizing reasoning errors.

---

## Key Papers

### 🧠 Large Language Models (architecture, training, alignment, evaluation)

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [Multi-Stream Attention Residuals](http://arxiv.org/abs/2610.13630v1) | Xiaohan Qin, Xiangdong Zhang, Tuo Dai et al. | MSAR generalizes Attention Residuals to multi-head depth attention using multi-scale causal convolutions for stream diversity, achieving 1.58× iso-loss compute speedup over standard residuals at 18B/28B MoE scales—outperforming AttnRes (1.35×) and mHC (1.30×). |
| [DualQuant: Dual-scale Calibration-free Weight-and-Activation Quantization for LLMs](http://arxiv.org/abs/2610.13767v1) | Mahsa Salmani, Sayeh Sharify, Hesham Mostafa | DualQuant minimizes weight-reconstruction MSE to derive per-channel activation rescalings, enabling calibration-free W4A4 quantization that matches or exceeds SmoothQuant across MX/NV block formats, with 2.61× memory reduction and 2.46× throughput speedup on RTX 4090. |
| [Not All Dimensions Are Equal: Outlier-Aware Attention Linearization with Grouped Quadratic Kernels](http://arxiv.org/abs/2610.13674v1) | Weiqi Sun, Qianyue Wu, Wenjia Wang et al. | OAL identifies outlier dimensions that dominate attention approximation error, groups dimensions by contribution scale, and reduces frozen-attention output MSE by 8.9% vs. DiJiang on Qwen2.5-0.5B while lowering WikiText-103 perplexity from 31.71 to 27.50 after LoRA fine-tuning. |
| [ReplaySSM: Cache SSM Inputs, Not State](http://arxiv.org/abs/2610.13778v1) | Ze-Wei Liou, Harris Nover, Amey Naik et al. | ReplaySSM unrolls SSM recurrence into a periodic checkpoint plus recent-input buffer, halving state memory traffic, enabling cheap speculative rollback, and supporting mixed-precision checkpoints—accelerating decoding by 1.20–1.47× and speculative throughput by ~1.8× on 120B models. |
| [Specialists Learn Faster: Knowledge Organization in Pre-training Shapes Knowledge Update Efficiency](http://arxiv.org/abs/2610.13835v1) | Sheng Zhao, Yuhao Zhu | Models trained on chronologically ordered knowledge ("specialists") require far fewer update steps to acquire new knowledge than shuffled-order "generalists"; a first-principles law predicts this advantage and guides a pre-training data strategy preserving historical stability while enabling efficient updates. |

### 🤖 Agents & Reasoning (planning, tool use, multi-agent, chain-of-thought)

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [Humanize Olympiad Agents: A Multi-Session Workflow for Olympiad Problem Solving](http://arxiv.org/abs/2610.13632v1) | Zhengyang Zhang, Jing Xiong, Hongzhou Lin et al. | HOA coordinates solve, review, wiki, and verification sessions across three feedback channels, achieving perfect scores on IMO/IPhO/IOI 2026 and 100% on PutnamBench with GPT-5.6; with open Kimi-K3 it matches closed-source baselines on IMO/IPhO and exceeds them on IChO/IOI. |
| [X-AgentRed: Red-Teaming Personal Agents in Evolving Multi-Service Ecosystems](http://arxiv.org/abs/2610.13886v1) | Yeonsung Jung, Zhiyuan Wang, Zifan Wang et al. | X-AgentRed constructs a tool-dependency graph to discover harmful cross-service paths, then uses execution feedback to diversify and refine them—achieving 1.77× the harmful path rate and 2.99× tool coverage of STAC across four frontier agentic models. |
| [APEX-Harm: Evaluating Agent Safety in Shared Professional Workspaces](http://arxiv.org/abs/2610.13623v1) | Ziyi Yang, Adel Bibi, Guohao Li et al. | APEX-Harm benchmarks prompt/script injection against long-horizon agents in finance/consulting/legal workspaces (115–328 files, MCP tools); Opus 5/Sonnet 5 show lowest attack success (8%/20%), but task-specific script replacement still achieves 81–84% success, proving task completion ≠ safe behavior. |
| [MENTOR: Learning from Failure with On-Policy Pedagogical Intervention](http://arxiv.org/abs/2610.13594v1) | Guanlan Yue, Hang Yu, Xiaoyong Huang et al. | MENTOR acts as a live mentor that diagnoses failure root causes in real time and generates targeted instructional prompts, mitigating zero-reward collapse in RLVR without infrastructure changes—achieving up to 78.3% relative gains on Llama-3.2-3B-Instruct. |
| [Inject a Turn, Not a Token: Learning Where to Redirect LLM Reasoning for Self-Correction](http://arxiv.org/abs/2610.13672v1) | Jiwon Jeon, Myungsik Cho, Jeonghye Kim et al. | UPTURN learns a 130K-parameter intervention position head and redirects reasoning by injecting a new user turn (not inline tokens), improving accuracy over 32-rollout baselines on four reasoners/six math benchmarks, transferring across models and to GPQA-Diamond without retraining. |
| [A Privileged Teacher That Only Scores Cannot Search: Critique-Conditioned On-Policy Self-Distillation for Reasoning](http://arxiv.org/abs/2610.13744v1) | Mayug Maniparambil, Ayush Rai, Ekansh Verma et al. | Scoring teachers fail to localize errors or push probability away from erroneous tokens; conditioning the teacher on a generated critique enables error localization, corrective credit, and backtracking token shifts ("Wait", "But")—converting unsolvable problems at test time and providing advantage signals in cold-start GRPO. |

### 🔧 Methods & Frameworks (new techniques, benchmarks, efficiency improvements)

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [Not All Correct Fixes Run Alike: An Empirical Study of Patch Performance in Repository-Level Issue Resolution](http://arxiv.org/abs/2610.13563v1) | Han Peng, Xing Hu, Feifei Niu et al. | Using SWE-bench F2P tests as performance workloads, the study finds runtime performance of correct patches is independent of LLM resolution rates with nearly reversed model rankings, revealing architectural regressions that correctness evaluation misses. |
| [RATED: Reliability-Aware AI Agent Tool Retrieval via Execution Dynamics](http://arxiv.org/abs/2610.13889v1) | Weiliang Chen, Song Liao | RATED combines a frozen dual-encoder with a contextual bandit re-ranker using real-time execution feedback, achieving 52.2% relative MRR improvement over ToolLLM and reducing fault selection from 86.2% to 2.9% under 30% API failure rates with <1ms latency overhead. |
| [zip2zip++: Towards Inference-Time Token Compression with Minimal Quality Loss](http://arxiv.org/abs/2610.13605v1) | Saibo Geng, Andrea Gentilini, Xinxian Ma et al. | Decoupled input/output dynamic embeddings, size-aware RoPE, and a selective-merge LZW codec close ~half the quality gap between compressed and uncompressed baselines at similar compression ratios, improving perplexity and math reasoning across four models. |
| [Defence against the dark arts of distillation: Unsupervised discovery of subliminal learning](http://arxiv.org/abs/2610.13536v1) | Joseph Egan, Ciarán M. Gilligan-Lee, Michael O'Riordan et al. | Exploiting the asymmetry that subliminal traits express consistently across teacher-generated datasets while task capabilities vary, the method recovers a weight-space direction for any distilled trait without supervision—suppressing animal-preference traits from Cloud et al. (2026) with near-zero task impact. |

### 📊 Applications (domain-specific, multimodal, code generation)

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [A Multi-Agent LLM System for Automated Tuning of Specialized Neural Network Models](http://arxiv.org/abs/2610.13663v1) | Ivan Moloshnikov, Dmitry Kunitsyn, Alexander Sboev et al. | A three-role (analyst, coder, recorder) multi-agent framework tunes key components (spiking NN correlation learning, PINN differential equation solvers) without altering network structure—outperforming baselines by 13pp (MNIST), 6pp (Digits), 2491× soliton error reduction, and 325× invariant-preservation error reduction. |

---

## Research Trend Signal

Three convergent directions dominate this batch. **First, agent reliability is shifting from "can it solve the task?" to "can it solve the task safely and efficiently across compositions?"** HOA demonstrates that orchestrating multiple specialized sessions (solve/review/wiki/verify) outperforms monolithic reasoning, while X-AgentRed and APEX-Harm formalize red-teaming as graph exploration over tool dependencies and workspace state—revealing that harm emerges from cross-service composition, not single-tool misuse. **Second, the "teacher scoring" paradigm in distillation/RLVR is being replaced by "teacher critiquing."** Both MENTOR and the critique-conditioned self-distillation paper prove that a model with privileged information cannot localize errors when asked only to score; it must generate a critique to produce corrective credit. This suggests future RLVR pipelines will embed critique generation as a first-class step. **Third, efficiency research is moving beyond static compression toward adaptive, execution-aware systems.** ReplaySSM, Adaptive DHiSparse, DualQuant, and zip2zip++ all leverage runtime signals (execution feedback, load, reconstruction error, segmentation ambiguity) to dynamically allocate compute/precision—treating the model not as a fixed artifact but as a controllable process. Expect more work unifying these: adaptive KV hierarchies + mixed-precision SSMs + critique-guided early exit.

---

## Worth Deep Reading

1. **[Humanize Olympiad Agents (HOA)](http://arxiv.org/abs/2610.13632v1)** — The most complete demonstration yet that *workflow engineering* (multi-session orchestration with structured feedback channels) can elevate open models to closed-source frontier performance on the hardest reasoning benchmarks. The open release of the full inference stack makes this immediately actionable for practitioners building domain-specific agents.

2. **[A Privileged Teacher That Only Scores Cannot Search](http://arxiv.org/abs/2610.13744v1)** — A structural critique of the dominant on-policy self-distillation paradigm. The finding that scoring teachers *fundamentally cannot* localize errors—because error localization is a search problem, not a scoring problem—reframes how we should design RLVR and distillation pipelines. The critique-conditioned alternative is simple, effective, and backward-compatible.

3. **[Multi-Stream Attention Residuals (MSAR)](http://arxiv.org/abs/2610.13630v1)** — At 18B/28B MoE scales, MSAR delivers the largest reported iso-loss speedup (1.58×) for a residual architecture change, with minimal overhead and no persistent multi-stream storage. The multi-scale causal convolution mechanism for stream diversity is a clean, scalable primitive likely to be adopted in next-gen pre-training stacks.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*