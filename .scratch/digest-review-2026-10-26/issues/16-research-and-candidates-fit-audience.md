# 16: Research and Candidates fit the audience

Status: done
Blocked by: None (can start immediately)
Findings: T16, T18 — see `../review.md`

## What to build

The Trends Research table and Candidates to track serve a data/AI engineering reader. On 2026-10-26, 4 of 10 papers were far from the audience while on-topic papers scored 0.85-0.88 in the day's trace, and eight candidates were filed under `infra.repos` though several are not infra; the YAML block faces the maintainer on a colleague-facing page.

- [x] Research selection weighs being about agents or code more, or applies a topical floor (done as a `domain_application` penalty; the 10-26 replay uses supplied domain values, so the live answers are not verified)
- [x] Candidates map to a config section by their category, with a "no matching section" option
- [x] The YAML block is collapsed or moved out of the reader's path

## Comments

- Research, joined from `research-state.json` and the 10-23/10-24 arXiv traces: the four off-audience papers score `about_agents_or_code` 0.96-0.98 (nnInteractive Agent 0.98, Autonomous Investing 0.98, Optimization Modeling 0.97, LLM2Cert 0.96), the same as SWE-VERIFIER, PAUSE or UserSWE (0.99). Raising that weight or flooring on it changes nothing: Jev rightly calls them agent papers. What separates them is the field they serve.
- SWE-Clar and CuraLoc were saved on 2026-10-26, and `weekPapers` reads the 7 days before the run, so they were never eligible for the 10-26 page; they are in next week's pool. The 10-26 pool held only 10-23 and 10-24 papers.
- Code part: a `domain_application` noul ("applies LLMs or agents to one field outside software and data engineering") is asked with the other questions and written to `arxiv-trace.json`, with no weight. Once a few Mondays of traces carry it, weigh it (e.g. a penalty) in `RELEVANCE_WEIGHTS`.
- Candidates: `coding_agent` → `agents.repos`, `agent_tooling` → `infra.repos`, harness/framework, multi-agent and other agents → "No matching section". Replayed on the 2026-10-26 categories (`fixtures/candidates-2026-10-26.json`): ruflo, paperclip, open-code-review, DSHA, dsh-desktop and openrig move to no section. hyperframes (HeyGen's video framework) and dsh-TUI are `agent_tooling` in the verdict cache, so they still list under `infra.repos`; fix their verdicts by hand if wanted.
- Repos are linked in a reader-facing list; the config.yml lines are in a collapsed `<details>` block.
- Research, weighed: `relevanceOf` multiplies the composite by `1 - DOMAIN_APPLICATION_PENALTY × domain_application` (0.2, a constant beside `RELEVANCE_WEIGHTS`, which still sum to 1; written to the trace header as `domain_application_penalty`). A missing answer (traces before 2026-10-26, hand edits) is no penalty. From a noul of 0.46 up it puts nnInteractive Agent (0.958) below the on-topic papers at 0.87; the cost is that an unsure 0.5 loses 10%.
- Replay (`arxiv.test.ts`, "replays the 2026-10-26 Research pool", fixture `arxiv-research-2026-10-26.json` = the 30 pool papers with their 10-23/10-24 answers): without a domain answer `relevanceOf` reproduces every saved relevance and the four off-audience papers are in the top 10. With supplied values (0.9 for the four and for the biomedical, medical-dialogue and Lean papers, 0.1 for the rest; the 10-23/10-24 runs never asked the question) none of the four is in the top 10: SWE-VERIFIER, Environment Duels, MAPS, PAUSE, SWE-DIVE, Beyond Watching, From Reasoning to Action, Diagnosing Personalization, CiteAnchor, then a tie. How Jev actually answers the four is not verified until the next run's trace.
- Criteria shape: Jev's API reference says a noul's `criteria.true`/`criteria.false` accept `string | object | array | null`, and `proposes_technique`, `works_without_training` and `widely_used_models` already used `{ what, examples }`, so `domain_application`'s shape was left as is. Should Jev reject the request anyway, every paper fails, ArXiv ranks by recency and saves nothing to the research state; the log line now says so (AGENTS.md, Jev verdict caches).
