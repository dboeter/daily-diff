# 01: Traces explain every drop

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: S11, X1 (counts), T11 (trace fields), A6/M1 (LLM status) — see `../review.md`

## What to build

A maintainer reading a day's traces can tell a quiet source from a broken one and say why any judged item did not reach a page, without rerunning the pipeline. Today the 2026-10-26 traces could not explain why AI Policy had no EU primary-source items, why the Trends category tables skip large gainers, or whether the Spotted summaries call failed.

- [ ] Each trace records per-source item counts, including sources that returned zero items
- [ ] Each judged item records whether it was rendered, its rank, and a `dropped_reason` (threshold, cap, routing, repeat) when it was not
- [ ] The run records the outcome of each LLM call (ok, failed, fallback used) where a reader can find it next to the traces
- [ ] A primary policy source that returns zero judged items for N consecutive days produces a warning in the run output
- [ ] AGENTS.md describes the new trace fields
