# 12: The Research table applies the domain penalty to the whole pool

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: T4 [medium] — see `../review.md`, `../ai-trends.md`

## What to build

Papers that apply agents to one outside field stay out of Research, including papers saved before the penalty existed. On 2026-10-28, 5 of 10 Research rows were such papers (nnInteractive Agent, medical imaging, led the table), and 7 of 10 repeated the 10-26 page. The `domain_application` penalty works on the live ranking (MatOS 0.98, Numina 0.9 on the 10-28 trace), but the table reads `relevance` stored in `digests/research-state.json` on the save day, and the papers saved 2026-10-22..10-27 were stored before the penalty.

Decision needed: the gap closes by itself once the pre-penalty papers age out of the 7-day window (after the 2026-11-02 page). Options: (a) accept one more affected page; (b) a one-off re-judge of the stored pre-penalty entries; (c) store the `domain_application` answer with each entry and penalize at read time.

- [ ] The choice is recorded in this ticket's Comments
- [ ] If (b) or (c): the 2026-11-02 page's pool has no unpenalized pre-10-28 entry

## Comments

From the review: `src/trending/research.ts:57-58` reads the stored relevance; `arxivRelevance` (`src/sources/arxiv.ts:329-340`) applies `DOMAIN_APPLICATION_PENALTY`. Confirm that entries saved from 2026-10-28 on carry the penalized relevance before choosing (a).

**Maintainer decision (2026-10-28): option (b), a one-off re-judge.** A script re-asks Jev the ArXiv relevance questions for the `digests/research-state.json` entries saved before 2026-10-28 (from their stored title and abstract), recomputes `relevance` with `arxivRelevance` (penalty included), and rewrites only those entries. Recomputing from fresh answers makes a second run harmless. The maintainer runs it once with `TYPESAFE_API_KEY` set; it is not wired into the pipeline.
