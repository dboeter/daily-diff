# 16: Research and Candidates fit the audience

Status: partial
Blocked by: None (can start immediately)
Findings: T16, T18 — see `../review.md`

## What to build

The Trends Research table and Candidates to track serve a data/AI engineering reader. On 2026-10-26, 4 of 10 papers were far from the audience while on-topic papers scored 0.85-0.88 in the day's trace, and eight candidates were filed under `infra.repos` though several are not infra; the YAML block faces the maintainer on a colleague-facing page.

- [ ] Research selection weighs being about agents or code more, or applies a topical floor (not done: the saved answers show neither lever separates the off-audience papers; needs a domain question weighted after a live Jev run)
- [x] Candidates map to a config section by their category, with a "no matching section" option
- [x] The YAML block is collapsed or moved out of the reader's path

## Comments

- Research, joined from `research-state.json` and the 10-23/10-24 arXiv traces: the four off-audience papers score `about_agents_or_code` 0.96-0.98 (nnInteractive Agent 0.98, Autonomous Investing 0.98, Optimization Modeling 0.97, LLM2Cert 0.96), the same as SWE-VERIFIER, PAUSE or UserSWE (0.99). Raising that weight or flooring on it changes nothing: Jev rightly calls them agent papers. What separates them is the field they serve.
- SWE-Clar and CuraLoc were saved on 2026-10-26, and `weekPapers` reads the 7 days before the run, so they were never eligible for the 10-26 page; they are in next week's pool. The 10-26 pool held only 10-23 and 10-24 papers.
- Code part: a `domain_application` noul ("applies LLMs or agents to one field outside software and data engineering") is asked with the other questions and written to `arxiv-trace.json`, with no weight. Once a few Mondays of traces carry it, weigh it (e.g. a penalty) in `RELEVANCE_WEIGHTS`.
- Candidates: `coding_agent` → `agents.repos`, `agent_tooling` → `infra.repos`, harness/framework, multi-agent and other agents → "No matching section". Replayed on the 2026-10-26 categories (`fixtures/candidates-2026-10-26.json`): ruflo, paperclip, open-code-review, DSHA, dsh-desktop and openrig move to no section. hyperframes (HeyGen's video framework) and dsh-TUI are `agent_tooling` in the verdict cache, so they still list under `infra.repos`; fix their verdicts by hand if wanted.
- Repos are linked in a reader-facing list; the config.yml lines are in a collapsed `<details>` block.
