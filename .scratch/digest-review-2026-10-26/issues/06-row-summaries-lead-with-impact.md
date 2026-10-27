# 06: Release and row summaries lead with impact

Status: done
Blocked by: None (can start immediately)
Findings: S7, A7, A11, D3, D6, T6, T14 — see `../review.md`

## What to build

Release bullets and table summaries tell the reader what changes for them first. On 2026-10-26 the Polars row spent its words on 3 of 88 performance items, Cline led with minor items and called a fix an addition, Snowflake's `CODING_AGENT` became "CODINGAGENT", Trends rows ended in a templated "It matters because…" clause, and research rows omitted their headline result.

- [x] Release summaries order breaking changes, behavior-changing fixes, headline features, then performance
- [x] Identifiers are copied verbatim in code formatting; a backticked token absent from the source is caught by a post-check
- [x] The "It matters because" clause is gone; a row gives one differentiating fact or "—"
- [x] Repo names keep their written form at sentence start
- [x] Research rows read "what it does, headline result", starting with the paper's name
- [x] Security hot issues say where the problem shows, who is affected and the fix status

## Comments

Prompts: `RELEASE_ORDER` (breaking, behavior-changing fixes named as fixes, headline features, performance last) in the project digest and data release rules; `IDENTIFIER_RULE` (verbatim identifiers in code, repo names as written at sentence start) in the project digest, trending, data and models summaries; the trending summary drops "why it matters" for one differentiating fact or `—`; research rows are one sentence opening with the paper's name, then its headline result; security hot issues name where, who and fix status. Post-check: `checkCodeTokens` (summarized-table.ts) on the data, models and policy summaries turns `CODINGAGENT` back into `CODING_AGENT` and unwraps a token the source lacks. Found on the way: the data release rule was a plain string, so `${RELEASE_BODY_CHARS}` reached the model literally; now a template literal. Model output itself unverified until a live run.

**Review (2026-10-26):** the backtick post-check (`checkCodeTokens`) runs only on the row summaries of the models, policy and data vendor tables (`pages.ts`, its three callers). The agents and data repo-section bullets (`groupProjects`, `markdown.ts`) are not checked, so the box is unticked.

**Built (2026-10-26, follow-up):** what was wrong: `checkCodeTokens` had three callers in `pages.ts` (models, policy, data vendor tables) and none on the repo sections, so a `## <Project>` bullet's identifier went unchecked. `groupProjects` (markdown.ts) now runs `checkCodeTokens` on each model-written project section against that project's block in the digest prompt (`formatProject`, exported from prompts.ts, so the check sees exactly the cut release notes, issue excerpts and news the model saw). It covers the agents page and the data report's repo groups; the code-written release fallback is not checked. Replay: the 2026-10-26 Cline bullet (A7) has no backticked token, so there is nothing to catch there; the Hermes section (A11) is replayed with the two issues' titles and the 300-character body excerpts the prompt saw (fetched with `gh issue view`), and every token (`--password=`, `--token=`, `docker login -p`, `hermes gateway status`) is in its source and stays. Tests: `buildProjectReportContent` › "backticked tokens in a project section" (markdown.test: the 10-26 replay, a respelled and an invented token, a token checked against its own project only).
