# 03: Page Highlights and Signals claim only what the source says

Status: done
Blocked by: None (can start immediately)
Findings: S2, D1, A5, M2, M3, M4, D2, T2, T9, T17, D7 — see `../review.md`

## What to build

The `## Highlights` sections, Trends Signals and the Highlights sent to Telegram and Teams state only what their source states. On 2026-10-26 they invented "GA" labels for two Snowflake notes, added "audit your invocations immediately", stated a Cerebras design post's throughput as achieved, dropped the limits of a 200-lesion self-published study, and built a "maturing benchmark agenda" from three paper titles.

- [x] Prompts forbid GA/Preview/beta wording unless the item's title or body says it
- [x] Prompts forbid calls to action, audiences and conclusions absent from the source
- [x] Vendor and self-published figures are attributed ("X says"); open issues are "reports", not facts
- [x] Study results carry their scope (sample, single run, peer review) when the source gives it
- [x] Trend and causal claims need support from at least the rows cited; no trend from titles alone
- [x] GOING_AWAY is reserved for retirements, deprecations and removed features with an end, not a bug fix that now raises
- [x] Regenerating the 2026-10-26 page Highlights of ai-agents, ai-models and ai-data with the current prompts, then highlights.json over those pages, no longer shows the D1, A5 and M3 claims

## Comments

`SOURCE_FIDELITY_RULES` (`src/reports/prompts.ts`) holds the five rules and goes into every Highlights prompt (`buildPageHighlightsPrompt`, Trends prose, policy prose, data prose) and `buildHighlightsPrompt` (highlights.json). The data Highlights no longer require "what to do" on every bullet, which pushed the model to invent actions; Signals' trend claims must rest on row summaries, not titles. `goingAwayRule` now says a bug fix, a breaking change or a call that now raises an error is not going away. Tests: `source fidelity rules` and `goingAwayRule` in `prompts-pages.test.ts`.

The regen box was checked live below: first on the old page Highlights (left unticked), then on regenerated ones (ticked).

**Live regen check (2026-10-26):** box stays unticked. Ran regen-highlights' code path for 2026-10-26 (same report files, `forcedHighlightReports(false)`, `buildHighlightsPrompt`, `callLlm(…, 2048)`, `withFallbackHighlights`) with the workflow's OpenRouter settings, writing to the scratchpad, not `digests/` (script `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/check.mts`, output `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/highlights-run1.json`, prompt `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/highlights-run1.prompt.txt`). One `callLlm` call, answered by the fallback `nvidia/nemotron-3-ultra-550b-a55b:free` both times; the first request was cut off at 2048 tokens (2120 reasoning tokens) and retried at 4096.

- A5 gone: `"Hermes Agent leaks secrets via CLI flags (--password=, --token=) and gateway status printing MCP command lines with API keys in plaintext"`, with no "audit … immediately".
- D1 still there: `"Snowflake Coding agent MCP tool GA enables MCP servers to expose coding agents without stored agent objects"`.
- M3 still there: `"Cerebras deploys trillion-parameter models on WSE-3T wafers achieving 1,000–2,000+ tokens per second"`.

D1 and M3 come from the pages' own Highlights, written by the old prompts: `ai-data.md` reads "Coding agent MCP tool (GA 2026-10-23)" and `ai-models.md` "Cerebras deploys … achieving 1,000–2,000+ tokens per second", and `buildHighlightsPrompt` tells the model to cover each page's first Highlights bullet, so the new rule ("only when the item's own row or text uses them") is met by the excerpt. On the 10-26 files the box can only test what highlights.json adds by itself (A5, which passed on one sample). D1 and M3 can be checked only on pages whose Highlights the new prompts wrote: the box needs rewording or a later date. Also seen: `"Coding agent evaluation research converges with SWE-VERIFIER, SWE-DIVE, and PAUSE all appearing this week"` (ai-trends), a trend built from three paper titles, which the fifth rule forbids; and the Polars bullet lost its `−` sign and still says "requiring pipeline migration across Databricks, Snowflake, Fabric, BigQuery" (D2, also carried from the page).

**Live check on regenerated page Highlights (2026-10-26):** box ticked (one sample, one model). Script `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check2/check2.mts`, log `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check2/run.log`: each page's Highlights prompt built as `src/reports/pages.ts` does, from the committed page's body below Highlights (`---` rules dropped): `buildPageHighlightsPrompt` with `AGENTS_HIGHLIGHTS_FOCUS` / `MODELS_HIGHLIGHTS_FOCUS`, and `buildDataProsePrompt` with both kept Snowflake notes as `minor` (significance 0.82 and 0.52, under level 1, in `data-trace.json`); the new Highlights spliced into copies in `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check2/pages/`, then `buildHighlightsPrompt` + `withFallbackHighlights` over those copies (`forcedHighlightReports(false)`, as `regen-highlights`). Output `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check2/highlights.json`, prompts and raw replies beside it. 4 calls, all answered by the fallback `nvidia/nemotron-3-ultra-550b-a55b:free`.

- D1 gone: the new data Highlights has one bullet, Polars; highlights.json says `"Snowflake adds CODINGAGENT tool type to MCP servers (Oct 23), enabling managed coding agents without stored agent objects"`, no "GA" (the row says none).
- A5 gone: `"Hermes Agent leaks secrets via CLI flags (--password=, --token=) and Azure keys that bypass egress controls, plus `gateway status` prints MCP command lines with API keys in plaintext"`, no call to action.
- M3 gone: the page now says `"Cerebras says it maps trillion-parameter frontier models across WSE-3T wafers to deliver inference at 1,000–2,000+ tokens per second."` and highlights.json `"Cerebras claims trillion-parameter model inference at 1,000–2,000+ tokens/sec on WSE-3T wafers, offering a high-throughput hardware alternative"`.
- Still added beyond the rows, in highlights.json only (its "why it matters" ask): "significantly reducing inference costs for developers" (the Minimaxir row's description is only "What is \"the true cost of a token\"?") and "offering a high-throughput hardware alternative". highlights.json also picked the Snowflake MCP note, which the page left out as `minor`: the highlights.json step sees only the page, not the `minor` list.
- The Polars lead lost its `−` on the page itself: the current `goingAwayRule` calls a breaking change not going away, so the unsigned highlights.json entry matches its page. The Trends page was not regenerated, so the SWE-VERIFIER trend sentence (old prompts) is still on it; the new highlights.json did not pick it.


**highlights.json live check after `4e4a9c8` (2026-10-26):** fixes both findings above on one sample. `buildHighlightsPrompt` now gets each page's `## Highlights` only (`highlightsSection`) and no longer asks why it matters. Script `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check3/check3.mts` ran regen-highlights' path (`forcedHighlightReports(false)`, `callLlm(…, 2048)`, `withFallbackHighlights`) over the llm-check2 pages; prompt (5,468 chars, was 24,194), raw reply, `highlights.json` and `run.log` beside it. 1 call, 1 request, answered by the fallback `nvidia/nemotron-3-ultra-550b-a55b:free`. Each entry against its page bullet:

- ai-agents 1: "Hermes Agent leaks secrets via CLI flags and Azure keys bypassing egress; gateway status prints MCP child-process command lines with API keys" ← "Hermes Agent exposes secrets: CLI flags (…) and Azure keys bypass chat egress and approval-card redaction …; `hermes gateway status` prints MCP child-process command lines verbatim, leaking API keys in plaintext"
- ai-agents 2: "Cline SDK v0.2.0 reattaches to live sessions instead of replacing; CLI v3.0.74 adds cross-app task attachment, Hub health timeout, hang prevention" ← the Cline bullet, same items
- ai-models 1: "Cerebras claims 1,000–2,000+ tokens/sec for trillion-parameter models on WSE-3T wafers" ← "Cerebras says it maps trillion-parameter frontier models across WSE-3T wafers to deliver inference at 1,000–2,000+ tokens per second." ("offering a high-throughput hardware alternative" gone)
- ai-models 2: "OpenAI and Anthropic cut LLM prices up to 80% in months, per Minimaxir analysis" ← "OpenAI and Anthropic have cut LLM prices by up to 80% within a few months, per a Minimaxir analysis." ("significantly reducing inference costs for developers" gone)
- ai-data 1: "Polars py-2.1.0 breaks mixed string/numeric arithmetic in eager mode; engineers must test and migrate expressions" ← "Polars py-2.1.0 introduces a breaking change disallowing mixed string and numeric arithmetic in eager mode; data engineers … must test and migrate affected expressions before upgrading." No Snowflake entry: the minor notes never reach the prompt.
- ai-trends 1: "New coding agent evaluation benchmarks appear: SWE-VERIFIER, SWE-DIVE, PAUSE" ← bullet 5 ("Research converges on coding agent evaluation: …"), the old-prompt Trends page; the "converges" trend claim was dropped.

No claim is missing from its bullet. One miss: ai-trends' entry does not cover the page's lead (the DeepSeek "dominate OpenRouter" bullet); the prompt's "never include … 'X dominates'" list likely made the model skip it.
