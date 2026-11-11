# 01: Traces explain every drop

Status: done
Blocked by: None (can start immediately)
Findings: S11, X1 (counts), T11 (trace fields), A6/M1 (LLM status) — see `../review.md`

## What to build

A maintainer reading a day's traces can tell a quiet source from a broken one and say why any judged item did not reach a page, without rerunning the pipeline. Today the 2026-10-26 traces could not explain why AI Policy had no EU primary-source items, why the Trends category tables skip large gainers, or whether the Spotted summaries call failed.

- [x] Each trace records per-source item counts, including sources that returned zero items
- [x] Each judged item records whether it was rendered, its rank, and a `dropped_reason` (threshold, cap, routing, repeat) when it was not
- [x] The run records the outcome of each LLM call (ok, failed, fallback used) where a reader can find it next to the traces
- [x] A primary policy source that returns zero judged items for N consecutive days produces a warning in the run output
- [x] AGENTS.md describes the new trace fields

## Comments

- Evidence before the change: the 2026-10-26 `policy-trace.json` lists items from 9 sources (Binnenlands Bestuur 54, Politico US 12, Politico Europe 11, Federal Register 7, Rijksoverheid 7, Transformer 3, Open States 2, Digitale Overheid 2, RDI 1). None of EUR-Lex, European Parliament, Commission mail, Tweede Kamer, Have your say, Internetconsultatie or Congress.gov appears, and nothing recorded whether they failed or returned nothing.
- Every trace now has a `sources` header (`fetched`: null = failed, 0 = empty; `judged`). Each item has `rendered`/`rank`/`dropped_reason`, set by the selecting function itself: `selectSpotted`/`claimRows`, `radarPool`/`selectTrendingReport`, `orderAndCap`, `selectPolicyItems`, and the ArXiv ranking cut. The policy and data traces are now written on a day with no candidates too.
- `dropped_reason` gained a fifth value, `unpublished`. It covers a Spotted row whose page the run skipped; the Spotted trace is the only one saved after that skip.
- Policy and data never see repeats: the state filters them before judging. A repeat shows up as the gap between `fetched` and `judged` in `sources`.
- `llm-trace.json` has one entry per `callLlm` call (label = the `generateOr` tag or `highlights`; ok / failed / fallback; chars). It is not verified end to end: a live run is needed to see the file in a day folder.
- Quiet-source warning: N = `QUIET_SOURCE_WARN_DAYS` = 7. "Primary" means the registered sources plus feeds without `kind: news`. The count follows the ticket and uses judged (new) items, not fetched ones, so a frozen feed that keeps returning old items also warns. Streak state: `zeroSince` in `digests/policy-state.json`. The 10-25/10-26 fetch logs were not checked here.
- Review fix: `trending-trace.json`'s `topic search` `fetched` is null when every topic search failed (`searchAiRepos` returns `success`; `TrendingData.searchFetchSuccess`). Test: `reports failure when every search fails` (compose.test).
- Review fix: `spotted-trace.json` marks a story the Overview's "Also talked about" took `talked_about: true` with no `dropped_reason` (was `shown: true` + `routing`); AGENTS.md notes that Spotted's `judged` counts carried stories, so it can exceed `fetched`. Test: `spottedTraceFile` (topics.test).
