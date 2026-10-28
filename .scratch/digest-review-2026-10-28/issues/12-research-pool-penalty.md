# 12: The Research table applies the domain penalty to the whole pool

Status: done
Blocked by: None (can start immediately)
Findings: T4 [medium] — see `../review.md`, `../ai-trends.md`

## What to build

Papers that apply agents to one outside field stay out of Research, including papers saved before the penalty existed. On 2026-10-28, 5 of 10 Research rows were such papers (nnInteractive Agent, medical imaging, led the table), and 7 of 10 repeated the 10-26 page. The `domain_application` penalty works on the live ranking (MatOS 0.98, Numina 0.9 on the 10-28 trace), but the table reads `relevance` stored in `digests/research-state.json` on the save day, and the papers saved 2026-10-22..10-27 were stored before the penalty.

Decision needed: the gap closes by itself once the pre-penalty papers age out of the 7-day window (after the 2026-11-02 page). Options: (a) accept one more affected page; (b) a one-off re-judge of the stored pre-penalty entries; (c) store the `domain_application` answer with each entry and penalize at read time.

- [x] The choice is recorded in this ticket's Comments
- [ ] If (b) or (c): the 2026-11-02 page's pool has no unpenalized pre-10-28 entry

## Comments

From the review: `src/trending/research.ts:57-58` reads the stored relevance; `arxivRelevance` (`src/sources/arxiv.ts:329-340`) applies `DOMAIN_APPLICATION_PENALTY`. Confirm that entries saved from 2026-10-28 on carry the penalized relevance before choosing (a).

**Maintainer decision (2026-10-28): option (b), a one-off re-judge.** A script re-asks Jev the ArXiv relevance questions for the `digests/research-state.json` entries saved before 2026-10-28 (from their stored title and abstract), recomputes `relevance` with `arxivRelevance` (penalty included), and rewrites only those entries. Recomputing from fresh answers makes a second run harmless. The maintainer runs it once with `TYPESAFE_API_KEY` set; it is not wired into the pipeline.

**Done (2026-10-28):** `scripts/rejudge-research.ts` (new) takes the research-state entries whose `date` is before the cutoff (`entriesBefore`). For each one it rebuilds a paper from the stored title and abstract and scores it with `scorePaper`, the daily ranking's own call: the same `RELEVANCE_QUESTIONS`, with `relevanceOf` applying `DOMAIN_APPLICATION_PENALTY`. It then rewrites only those entries' `relevance` (`rejudgeResearch`). The ticket's `arxivRelevance` is `relevanceOf`. `scorePaper` was already exported, so `src/sources/arxiv.ts` and `src/trending/research.ts` are unchanged. An entry whose call fails keeps its old relevance and prints `failed, kept`. When more than half the calls fail, nothing is written. Without `TYPESAFE_API_KEY` the script exits 1 and changes nothing. One caveat: the stored abstract is cut at 600 characters, so a code link past that point no longer counts as `code_released` (−0.1).
Tests: `src/__tests__/trending/rejudge-research.test.ts` (entry selection by cutoff; the rewrite with a stubbed judge: penalty applied, entries on or after the cutoff untouched, a second run gives the same state, a failed call keeps the old value, too many failures → null). The script has not been run against Jev here: no key.
Maintainer runs: `TYPESAFE_API_KEY=… npx tsx scripts/rejudge-research.ts --dry-run`, then without `--dry-run` (cutoff defaults to 2026-10-28; pass `YYYY-MM-DD` to change it), and commits `digests/research-state.json`. The 2026-11-02 box stays open until then.
Docs: AGENTS.md, after "Report outputs", next to `regen-highlights.ts`: "`pnpm tsx scripts/rejudge-research.ts [YYYY-MM-DD] [--dry-run]` re-scores, with `TYPESAFE_API_KEY`, the `digests/research-state.json` entries saved before the date (default 2026-10-28) with the ArXiv relevance questions, the domain penalty included, and rewrites their `relevance` (one-off for the pre-penalty entries)."

Fix round (code review, 2026-10-28): `scripts/rejudge-research.ts` no longer keeps a failed entry silently. `printChanges` prints every change, then lists the entries whose Jev call failed (id and title) and returns 1; `main()` sets that as the exit code, after saving the re-judged entries (or after the dry run). A rerun scores from fresh answers, so rerunning until exit 0 is safe. Tests (`src/__tests__/trending/rejudge-research.test.ts`, `describe("printChanges")`): a failed entry is listed and the code is 1; with none failed, nothing is listed and the code is 0. Docs: AGENTS.md's `rejudge-research.ts` line could add "; it exits 1 and lists the entries whose Jev call failed, to be rerun".
