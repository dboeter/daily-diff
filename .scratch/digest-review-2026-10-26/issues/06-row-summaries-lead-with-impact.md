# 06: Release and row summaries lead with impact

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: S7, A7, A11, D3, D6, T6, T14 — see `../review.md`

## What to build

Release bullets and table summaries tell the reader what changes for them first. On 2026-10-26 the Polars row spent its words on 3 of 88 performance items, Cline led with minor items and called a fix an addition, Snowflake's `CODING_AGENT` became "CODINGAGENT", Trends rows ended in a templated "It matters because…" clause, and research rows omitted their headline result.

- [ ] Release summaries order breaking changes, behavior-changing fixes, headline features, then performance
- [ ] Identifiers are copied verbatim in code formatting; a backticked token absent from the source is caught by a post-check
- [ ] The "It matters because" clause is gone; a row gives one differentiating fact or "—"
- [ ] Repo names keep their written form at sentence start
- [ ] Research rows read "what it does, headline result", starting with the paper's name
- [ ] Security hot issues say where the problem shows, who is affected and the fix status
