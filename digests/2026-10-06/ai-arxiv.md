# ArXiv AI Research Digest 2026-10-06

> Source: [ArXiv](https://arxiv.org/) (cs.AI, cs.CL, cs.LG) | 40 papers ranked by [Jev](https://typesafe.ai) relevance | Generated: 2026-10-06 02:26 UTC

---

# ArXiv AI Research Digest — 2026-10-06

## Today's Highlights

Agent harness evolution has emerged as a dominant research direction, with multiple papers demonstrating that optimizing the *system* around the model—prompts, tools, workflows, and verification loops—yields larger gains than model scaling alone. VERSE shows self-evolving optimizers with execution-based verification achieve SOTA on coding benchmarks, while HASTE and SHIFT evolve harnesses against attacks and per-query respectively. Security research has matured beyond toy benchmarks: COPEX isolates model susceptibility across MCP layers, and Boundary Action Auditing provides a practical pre-action defense against staged prompt injection. A new class of "self-evolving inference systems" (SEIS, ASCENT, AgentDiscover) demonstrates that agents can autonomously optimize their own code, search strategies, and weights during deployment, pointing toward truly continual learning. Finally, rigorous controlled evaluation frameworks (MedicalHarness, Measurement-First Auditing, Threat-Preserving Representation Sensitivity) are exposing how much reported scores depend on harness choice, contamination channels, and benchmark representation—demanding more scientific rigor in agent evaluation.

---

## Key Papers

### 🧠 Large Language Models

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [Grammar-Guided Code Watermarking with Green Temperature](http://arxiv.org/abs/2610.05323v1) | Hyundong Jin, Hyeseon An, Soohan Lim et al. | Integrates grammar-constrained decoding with probability-aware watermarking, restricting candidates to grammar-admissible tokens and reweighting "green" tokens at high-entropy positions. Achieves 73.6% mean AUROC while preserving Pass@1 (59.2% vs 59.6% unwatermarked) across 5 models and 4 languages. |
| [Are you Synthesizing or Recalling? Evaluating LLMs on Algorithmic Code Retrieval](http://arxiv.org/abs/2610.02438v1) | Nickil Maveli, Antonio Vergari, Shay B. Cohen et al. | Introduces AlgoREval, a benchmark of 599 problems across 77 classical algorithms to isolate *parametric code retrieval*—reproducing known algorithms from weights—from synthesis. Finds substantial variation across languages/input representations; prompt augmentation and GRPO improve retrieval accuracy. |
| [Counterexample Generation via Per-Theorem Symbolic Verifiers](http://arxiv.org/abs/2610.02444v1) | Omar Farouk Zouak, Houssam Eddine Boukhalfa, Soumaya Lakehal et al. | Frames falsification as constrained witness emission against executable Python verifiers (SymCE, 4,707 conjectures). Shows SFT collapses true-theorem recognition (0.27→0.00) while GRPO with sparse rewards repairs and exceeds base (0.66), revealing an "imitation trap" in counterexample training. |

### 🤖 Agents & Reasoning

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [VERSE: Verified Self-Evolving Optimizer for Agent Harnesses](http://arxiv.org/abs/2610.02616v1) | Zekai Wang, Yingqiang Ge, Zekun Wang et al. | Introduces VERSE, an optimizer that self-evolves its own prompts, tools, and verification procedures while improving an executor harness. With execution-based verification, achieves 42.3%/37.7% on held-out/OOD SWE-rebench tasks vs 39.2%/29.3% for strongest baselines—demonstrating harness evolution beats fixed optimizers. |
| [AgentDiscover: Autonomous Discovery with Minimal Search Scaffolding](http://arxiv.org/abs/2610.05334v1) | Mahdi Farahbakhsh, Ilan Sela, Fatemeh Doudi et al. | Promotes the model from proposer to planner: a coding agent owns the search strategy, runs experiments, and maintains a structured idea database where classical algorithms (MAP-Elites, MCTS) reduce to single queries. Outperforms prior discovery frameworks on kernel engineering, biology, algorithm design, and math; wins 7 past AtCoder heuristic contests. |
| [DeReAct: Decomposed Reasoning and Acting for Reliable AI Agents](http://arxiv.org/abs/2610.02351v1) | Ajay Vohra, Tao Chen, Neeti Narayan et al. | Externalizes two gating policies—a Critic validating actions pre-execution and a Context Manager certifying completion—from the ReAct loop. Improves Pass@1 by 6.5–7.0 pts for weaker models (Qwen3-Coder-480B) on GAIA/SWE-bench; gains diminish with stronger brains but yields more evidence-complete trajectories. |
| [HazardWeaver: Scientific Route Selection for Hazard Analysis Agents](http://arxiv.org/abs/2610.03591v1) | Wangshu Zhu, Xueqi Cheng, Liang Wu et al. | Formulates hazard analysis as state-dependent scientific route selection. A Hazard Knowledge Compiler extracts applicability conditions; a Capability Graph checks I/O compatibility; the agent selects/executes routes and revises as state changes. Outperforms baselines on 141-instance benchmark, especially on multi-route tasks. |
| [Inherit-MAS: Test-Time Evolution of Multi-Agent Systems](http://arxiv.org/abs/2610.02396v1) | Songtao Wei, Yi Li, Zhichun Guo et al. | Makes inheritance explicit at workflow and execution levels: workflow inheritance discards unhelpful nodes and applies validated edits; execution inheritance reuses stored results when request+context match. Achieves 55.4% on WorkBench and 49.7% F1 on HotpotQA, reducing worker tokens by 29–35%. |
| [ASCENT: Online Test-Time Training via Self-Distillation of Verified Experience](http://arxiv.org/abs/2610.05303v1) | Haodong Lu, Dong Gong | Trains LLM weights online on verified trajectories during deployment. A frozen initial copy receives verified trajectory as privileged information, predicts next-token distributions, and distills into persistent LoRA weights. Improves task success and efficiency on ALFWorld, WebShop, AppWorld; transfers to held-out scenes. |

### 🔧 Methods & Frameworks

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [HASTE: Evolving Agent Harnesses Against Emerging Attacks Using Sparse Evidence](http://arxiv.org/abs/2610.02920v1) | Xiqiao Xiong, Moxin Li, Zhixin Ma et al. | Multi-agent framework evolving harnesses from sparse threat reports via adversarial interplay: safety-spec generation guides harness updates; attack-case generation probes remaining vulnerabilities. Consistently reduces attack success rates while preserving benign utility across models and attack types. |
| [Dynamic Harness Search: Building Multi-Agent Systems Per-Query via Prediction](http://arxiv.org/abs/2610.04137v1) | Som Sagar, Shasha Li, Hejie Cui et al. | SHIFT moves execution out of per-query search: a local LLM architect learns a policy over harness-building actions and a value function predicting utility (accuracy vs cost). MCTS constructs per-query harnesses. Attains ~80% mean accuracy across 9K tasks (6 benchmarks), +7.2 pp over strongest baseline; cheaper mode uses 32% fewer tokens. |
| [MemTrace: State-Consistent Memory for Long-Horizon Coding Agents](http://arxiv.org/abs/2610.04838v1) | Hongming Xu, Le Zhou, ZhongHe Jin et al. | Provenance-aware memory storing immutable Memory Traces anchored to files/symbols/tests, organized in a Memory Trace Graph. Working memory retains compact Anchors; before reuse, validates evidence against current repo state. Improves DeepSWE pass@1 by 21.2 pts, SWE-EVO by 4.4 pts, SWE-Milestone by 17.8 pts. |
| [AECG: Asymmetric Experience Consolidation and Governance In Multi-Agent Systems](http://arxiv.org/abs/2610.05176v1) | Ao Tian, Jialong Liu, Daqi Zheng et al. | Turns memory into a reliability-governance loop: preserves coordination scope, uses multi-scale confidence-aware reliability to detect degradation, prioritizes high-risk knowledge under bounded review budget, applies targeted interventions, reactivates only after paired replay. Best in 11/12 framework-benchmark settings; scope removal drops accuracy up to 16.9 pp. |
| [CUAWright: A Minimal Unified Interface for Digital Agents](http://arxiv.org/abs/2610.04116v1) | Yadong Lu, Theodore Lee, Yifei Li et al. | Replaces GUI/desktop harnesses with a ~3K-line terminal harness: bash commands as sole action interface, filesystem as evolvable tool/context space. On OSWorld 2.0: +33.2% partial reward, -37.5% cost vs GPT-5.5 baseline. Beats GUI harnesses on Online-Mind2Web (+4.7%) and Odysseys (+44.0%); also wins on CAD benchmarks. |
| [FrugalEvo: Towards Cost-Aware LLM-Guided Program Evolution](http://arxiv.org/abs/2610.03675v1) | Hui Chen, Xuan Qi, James Xu Zhao et al. | Cost-aware evolution: strong LLM explores strategies, cheap LLM implements/refines; cache-efficient harness maximizes prefix sharing. Introduces BA-AUC (best-so-far score over cumulative cost). Matches/surpasses OpenEvolve, ShinkaEvolve, AdaEvolve, EvoX on 10 math/systems tasks; new SOTA on circle packing at $1.68 (GPT-5.6) / $0.55 (GLM-5.3). |

### 📊 Applications

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [MOF-VERIFY: A Failure-Aware Agentic Harness for MOF Hypothesis Verification](http://arxiv.org/abs/2610.03056v1) | Donghyun Lee, Taehoon Lee, Geonhee Ahn et al. | Diagnostic benchmark (T-MOF-1-4) for materials science: structural grounding, synthesis verification, evidence sufficiency, computational verification. MOF-Verify harness targets each bottleneck; substantially improves hypothesis verification over direct inference and RAG across multiple backbone LLMs. |
| [PLCWorld: Benchmarking LLM-Generated PLC Programs in Closed-Loop Plant Simulation](http://arxiv.org/abs/2610.02982v1) | Yunji Kim, Yunseok Lee, Hyunwoo Seo et al. | Closed-loop execution environment coupling Structured Text with simulated plant responses. 100 synthetic tasks, 473 task-condition pairs across Motion Control/Material Handling. GPT-5.5 achieves 82.7% Task Success on Easy but only 25.1% on Hard; exposes gaps between completion, safety, and generation cost. |
| [MedicalHarness: A Controlled Evaluation of LLMs and Agent Harnesses on Medical Tasks](http://arxiv.org/abs/2610.05778v1) | Ziqing Wang, Lili Zhao, Kaize Ding et al. | Controlled study: 5 models × 5 harnesses on 107 tasks across 4 medical domains. Harness-model interaction accounts for ~25% of outcome variance; no single harness wins across models/tasks. MH-Lab isolates context management, planning, tool exposure mechanisms. |
| [4DCodeBench: Benchmarking Agents on Inverse Graphics of Dynamic Scenes](http://arxiv.org/abs/2610.03715v1) | Ruihong Shen, Žiga Kovačič, Peter Kulits et al. | Benchmark for 4D inverse graphics via code generation: agents reconstruct dynamic scenes from video as executable graphics programs (deformation, fluid, fracture). Strong static reconstruction does not transfer to reliable dynamic reconstruction; provides testbed for world-dynamics-through-code. |

---

## Research Trend Signal

Three convergent directions are reshaping agent research. **First, harness-centric optimization** has displaced model-centric tuning: VERSE, HASTE, SHIFT, Inherit-MAS, and CUAWright all demonstrate that the *system surrounding the model*—its tools, workflow, verification loops, and interface—is the primary lever for performance, safety, and cost efficiency. This shifts engineering effort from prompt engineering to harness architecture and evolution. **Second, rigorous evaluation infrastructure** is maturing rapidly: MedicalHarness, Measurement-First Auditing, Threat-Preserving Representation Sensitivity, COPEX, and IEC-Bench expose how prior leaderboards conflated model capability with harness choice, contamination channels, benchmark representation, and tool-call corruption. The field is adopting controlled, component-level, and representation-robust evaluation as a prerequisite for credible claims. **Third, autonomous self-improvement at test time** is becoming viable: SEIS optimizes entire inference engines, ASCENT distills verified experience into weights, AgentDiscover owns its search strategy, and FrugalEvo evolves programs under cost constraints. These systems treat deployment as a continual learning loop rather than a static inference endpoint. Together, these trends suggest the next generation of agent research will focus on *evolvable, auditable, harness-native systems* that improve themselves during operation under rigorous, multi-dimensional evaluation.

---

## Worth Deep Reading

1. **[VERSE: Verified Self-Evolving Optimizer for Agent Harnesses](http://arxiv.org/abs/2610.02616v1)** — The most comprehensive demonstration that *optimizer self-evolution with execution verification* beats fixed optimizers and manual harness design. Its ablation showing verification is necessary for self-evolution to help, plus the clean protocol (disjoint train/val/test, multiple executors, OOD tasks), makes it a template for rigorous harness-evolution research.

2. **[Blocking at the Boundary: Auditing Long-Horizon Agents against Staged Prompt Injection](http://arxiv.org/abs/2610.05163v1)** — First to formulate and benchmark *staged prompt injection* in production agents (Claude Code, Codex), then propose a practical pre-action auditor (Path-Aligned Attribution) with strong empirical results (86% recall at 6–8% FBR). The 479-pair benchmark and analysis of why input-screening/post-hoc evaluation fail are immediately actionable for anyone deploying long-horizon agents.

3. **[AgentDiscover: Autonomous Discovery with Minimal Search Scaffolding](http://arxiv.org/abs/2610.05334v1)** — A concrete instantiation of the Bitter Lesson for scientific discovery: giving the model *ownership of the search strategy* via a programmable idea database outperforms human-designed search algorithms across diverse domains (kernels, biology, algorithms, math). The reduction of classical algorithms to single queries over a structured database is a reusable architectural pattern.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*