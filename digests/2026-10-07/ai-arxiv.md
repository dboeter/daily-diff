# ArXiv AI Research Digest 2026-10-07

> Source: [ArXiv](https://arxiv.org/) (cs.AI, cs.CL, cs.LG) | 40 papers ranked by [Jev](https://typesafe.ai) relevance | Generated: 2026-10-07 01:45 UTC

---

# ArXiv AI Research Digest — 2026-10-07

## Today's Highlights

The past week reveals a decisive shift toward **agent infrastructure and orchestration** as the primary bottleneck for reliable LLM deployment. Three convergent directions stand out: (1) **memory and experience reuse** — DAEDALUS and MemCo demonstrate that agents can bootstrap useful memory from self-generated practice or cross-agent collaboration without human-labeled trajectories, closing the gap to oracle-supervised baselines at lower inference cost; (2) **harness-level coordination** — AECP, Nerveplane, HERA, and the HEAR protocol move critical safety, scheduling, and serving decisions out of model prompts into verifiable execution layers, yielding 15–28% absolute gains in pass rates and 1.6–2.5× serving speedups; (3) **structured confidence and stopping** — CRGs, POLAR, and STEPGATE replace heuristic early-stopping with auditable, calibrated decision criteria, enabling small models to recover most of the performance gap to large backends at 30% cloud escalation. Together, these works signal that the next capability leap will come from **systems engineering around the model**, not model scaling alone.

---

## Key Papers

### 🤖 Agents & Reasoning

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [DAEDALUS: Bootstrapping Agent Memory from Self-Generated Tasks](http://arxiv.org/abs/2610.08048v1) | Edy, Conti, Xing et al. | An explorer–solver loop generates its own practice tasks, derives heuristics from solver failures, and validates them through repeated success — building a reusable memory bank without any human tasks or oracle verifiers. Improves success rates by up to 15.9 pp and pass⁵ by 2.2× across AppWorld, τ²-bench, and AutomationBench, matching supervised-memory baselines at lower inference cost. |
| [MemCo: Memory-Centric Collaboration for Generalizing LLM Agents to Unseen Environments](http://arxiv.org/abs/2610.07376v1) | Liao, Liu, Ward et al. | Maintains complementary local (environment-specific) and global (transferable workflow) memory spaces, routing relevant memories by the agent’s current state and decision phase. Outperforms both isolated-memory and naive shared-memory baselines on interactive decision-making benchmarks, reducing redundant exploration. |
| [OOPMAS: Object-Oriented Multi-Agent Systems for Query-Level Workflow Generation](http://arxiv.org/abs/2610.07787v1) | Cheng, Chen, Cheng et al. | Generates both the agent set and coordination workflow per query using object-oriented agent definitions and a dynamic skill library that accumulates lessons across optimization rounds — no gradients needed. Achieves 89.6% accuracy on a mixed code/math/QA benchmark, +18.1 pp over the strongest baseline, with consistent scaling across four LLM backbones. |
| [Confidence Reasoning Graphs: Structured Confidence Estimation for LLM Agents](http://arxiv.org/abs/2610.07948v1) | King, Bayat, Bussotti et al. | Decomposes “task accomplished” into contextualized sub-claims grounded in trajectory evidence, estimates confidence per claim, and aggregates into a calibrated overall score — no privileged model access or training data required. Yields better-calibrated confidence and stronger risk-aware decisions than verbalized, sampling, and white-box baselines across three benchmarks and three agent frameworks. |
| [Verifying Coordination in Parallel Coding Agents: NP-Bench and a Scheduling Planner](http://arxiv.org/abs/2610.07261v1) | Muku | Recasts multi-agent coordination as upfront scheduling: partition work by declared scope, order merges along producer→consumer graph. The Nerveplane planner lifts clean integration from 1/9 to 9/9 scenarios, cuts merge conflicts 13→0, and rescues breaking-contract changes that reactive baselines miss entirely. Cross-session memory drops repeated-mistake rate to 0.00 on strong and weak models alike. |
| [Stateless Language Agents: Scaling Long-Horizon Automated Research](http://arxiv.org/abs/2610.07625v1) | Zhang, Ji, Sun et al. | Harness owns durable research state (candidates + outcomes); agents are stateless, receiving fresh, role-specific contexts per invocation. An Advisor assigns concrete experiments to parallel Workers. SLA beats three recent frameworks on SWE, kernel optimization, and algorithm design at up to 1B tokens, reaching the strongest kernel baseline with 84% fewer tokens. |
| [Fork-and-Flush: Escaping Idea Basins in Autoresearch Agents](http://arxiv.org/abs/2610.07447v1) | Cai, Ziakas, Kontonis et al. | Periodic intervention forks the agent into parallel trajectories inheriting the workspace but with fresh chat contexts; continues from the highest-scoring fork. On 13 long-horizon research/engineering tasks, outperforms single-run and best-of-N baselines by 66% and 44% relative improvement under equal compute. |

### 🔧 Methods & Frameworks

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [SchemaFill: Efficient LLM Tool Calling via Slot-Parallel Speculative Decoding](http://arxiv.org/abs/2610.07086v1) | Chen, Li, Zhan et al. | Generates future slot values concurrently as candidates, verifies them under the actual output prefix, and commits only verified tokens — achieving up to 4.05× end-to-end throughput over autoregressive decoding on Glaive and BFCL without requiring advance knowledge of call sequence. |
| [AECP: Artifact-Exclusive Communication Protocol for Multi-Agent Code Generation](http://arxiv.org/abs/2610.06481v1) | Xue, Wang, Li et al. | Forces agents to communicate exclusively through structured artifacts; the harness supplies findings on access, screens implementations for interface mismatches, and requires revisits on revision. Improves test pass rate by 28.2% and reduces wall time by 16.5% vs. free-form messaging; blocks malicious instruction relay from 95%→0% reach and 40%→0% action. |
| [ReFold: Training-Free Reversible Inter-Turn Context Folding for Long-Horizon Agents](http://arxiv.org/abs/2610.07863v1) | Su, Tian, Zhang et al. | A rendering layer that compresses only the model’s view by removing redundant content (stubbed) and folding finished turns (one-line notes) — all strictly reversible. Plug-and-play across ReAct harnesses; reduces token consumption 2.5×, halves KV-cache memory, avoids 92% of forced compactions, and cuts inference cost 3.4× under concurrent serving. |
| [HERA: Harness-Environment Co-Evolution for Reliable Agentic Abstention](http://arxiv.org/abs/2610.06563v1) | Luo, Wen, Yang et al. | Co-evolves the harness and environment: controlled mutations create feasible/infeasible task pairs; harness adapts to previous failures. Evolved harness improves abstention accuracy 61.7%→83.3% and feasible-task completion 68.3%→76.7%, transfers across 19 LLMs (+15.3 pp abstention avg.), enabling small models to match large ones at ~85% lower cost. |

### 📊 Applications

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [Harness Engineering for Software Engineering via Modular Executable Dev-Primitives](http://arxiv.org/abs/2610.07832v1) | Jin, Li, Kuang et al. | Dev-Primitives pair repository artifacts with resident LLMs, giving artifacts agent-native interfaces for reasoning, communication, and self-modification. HERMES instantiates them at repo scale with dependency-aware activation and bug diagnosis. Outperforms matched baselines by 12.4% avg. on four SWE benchmarks; with Qwen3-8B primitives stays within 4.5% of GPT-5.6 Sol while cutting inference cost 26.2%. |
| [VideoTapestry: Query-Adaptive Memory Refinement for Multi-Agent Long-Video Understanding](http://arxiv.org/abs/2610.06672v1) | Liu, Yin, Feng et al. | Preconstructs hierarchical video memory (global narrative → event structure → fine-grained evidence); specialized agents per level refine memory via coarse-to-fine, query-driven retrieval. Beats direct GPT-5.5 inference by +17.2% (LVBench), +14.9% (LongVideoBench), +9.8% (Video-MME), +7.0% (EgoSchema) — SOTA among all competitors. |
| [FC-SWE: Failure-Conditioned RL for Long-Horizon Software Engineering Agents](http://arxiv.org/abs/2610.07898v1) | Liufu, Hu, Jing et al. | After a patch fails, restores repo state and uses failed patch + verifier feedback as context for a recovery trajectory. Adapts GRPO with trajectory-local rewards and active-set advantage estimation. Achieves 41.7% Resolved@1 and 52.8% Resolved@2 on SWE-bench Verified (vs. 38.9%/48.5% GRPO), reaching 70.7% Resolved@11 at test time. |

### 🧠 Large Language Models

| Paper | Authors | Summary |
| :--- | :--- | :--- |
| [TrustMI: Causally controlling how assistants trust their users](http://arxiv.org/abs/2610.06064v1) | Lasnier, Froger, Lasbordes et al. | Defines trust as willingness to accept vulnerability; learns steering matrices from 2,000 contrastive conversation pairs (ability/benevolence/integrity). Steering changes trust decisions monotonically in both directions across six models from three families, and extends to safety settings (harmful requests, prompt injections, insider threats) while preserving benign-task performance. |
| [Structured but Silent: Probing Capability Requirements in LLM Hidden States](http://arxiv.org/abs/2610.08018v1) | Choo, Song, Kang et al. | Shows that fine-grained tool capability requirements (Source, Transformation, World Effect → 8 classes) are linearly decodable from pre-generation hidden states with high accuracy across four open-weight LLM families — yet the same models fail to reliably verbalize these classifications. Exposes a representation-to-verbalization gap: capabilities are “structured but silent.” |

---

## Research Trend Signal

Three meta-patterns emerge from this batch. **First, harness-centric design is replacing prompt-centric design.** AECP, Nerveplane, HERA, HEAR, and ReFold all move coordination, scheduling, safety, serving, and context management into the execution layer where they can be verified, versioned, and optimized independently of model weights. This yields consistent gains (15–28% pass-rate lifts, 1.6–2.5× serving speedups) that transfer across model families — a leverage point prompt engineering cannot match. **Second, memory is being re-factored from monolithic context into structured, multi-granular stores with explicit routing.** DAEDALUS, MemCo, VideoTapestry, and SLA all separate durable state (owned by the harness) from ephemeral agent context, and they route memories by *decision phase* and *abstraction level* rather than recency. This directly addresses the “context explosion vs. amnesia” trade-off that plagues long-horizon agents. **Third, confidence and stopping are becoming first-class, auditable system outputs.** CRGs, POLAR, STEPGATE, and the “judged useless, queried anyway” finding collectively show that models’ internal evidence judgments are poorly coupled to their actions — and that lightweight, structured interventions (integration steps, reversibility ontologies, step-level escalation) can close this gap without retraining. The next wave will likely combine these: **harnesses that maintain structured memory, schedule work proactively, and expose calibrated confidence/stopping signals to both humans and downstream automation.**

---

## Worth Deep Reading

1. **DAEDALUS** (Paper 1) — The cleanest demonstration yet that *self-generated practice + heuristic validation* can replace human-curated training tasks for agent memory. The explorer–solver loop, difficulty adaptation, and consolidation pipeline are directly implementable; the finding that generated tasks serve as proxy benchmarks for model ranking is a bonus for evaluation infrastructure.

2. **AECP** (Paper 3) — A rare paper that simultaneously improves *correctness* (+28.2% test pass), *efficiency* (−16.5% wall time), and *security* (malicious relay 95%→0%) by moving coordination into the harness. The artifact-exclusive protocol is a concrete, adoptable pattern for any multi-agent code-generation system.

3. **Stateless Language Agents** (Paper 28) — Reframing long-horizon research as “stateful search with stateless agents” is a principled architecture that explains why prior frameworks plateau (history duplication, context drift, implicit role conflation). The 84% token reduction to match the strongest kernel baseline, plus the ablation showing focused contexts and explicit assignments compound over full runs, makes a compelling case for harness-owned state as the default paradigm.

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*