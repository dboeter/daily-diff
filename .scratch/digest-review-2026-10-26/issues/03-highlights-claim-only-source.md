# 03: Page Highlights and Signals claim only what the source says

Status: partial
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
- [ ] Regenerating the 2026-10-26 Highlights (`regen-highlights`) no longer shows the D1, A5 and M3 claims (not verified: needs live LLM run)

## Comments

`SOURCE_FIDELITY_RULES` (`src/reports/prompts.ts`) holds the five rules and goes into every Highlights prompt (`buildPageHighlightsPrompt`, Trends prose, policy prose, data prose) and `buildHighlightsPrompt` (highlights.json). The data Highlights no longer require "what to do" on every bullet, which pushed the model to invent actions; Signals' trend claims must rest on row summaries, not titles. `goingAwayRule` now says a bug fix, a breaking change or a call that now raises an error is not going away. Tests: `source fidelity rules` and `goingAwayRule` in `prompts-pages.test.ts`.

Unticked: the regen check needs an LLM key, which this session lacks. Run `pnpm tsx scripts/regen-highlights.ts 2026-10-26` and look for "GA" on the two Snowflake notes, "audit … immediately" and the Cerebras throughput stated as achieved.

**Live regen check (2026-10-26):** box stays unticked. Ran regen-highlights' code path for 2026-10-26 (same report files, `forcedHighlightReports(false)`, `buildHighlightsPrompt`, `callLlm(…, 2048)`, `withFallbackHighlights`) with the workflow's OpenRouter settings, writing to the scratchpad, not `digests/` (script `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/check.mts`, output `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/highlights-run1.json`, prompt `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/highlights-run1.prompt.txt`). One `callLlm` call, answered by the fallback `nvidia/nemotron-3-ultra-550b-a55b:free` both times; the first request was cut off at 2048 tokens (2120 reasoning tokens) and retried at 4096.

- A5 gone: `"Hermes Agent leaks secrets via CLI flags (--password=, --token=) and gateway status printing MCP command lines with API keys in plaintext"`, with no "audit … immediately".
- D1 still there: `"Snowflake Coding agent MCP tool GA enables MCP servers to expose coding agents without stored agent objects"`.
- M3 still there: `"Cerebras deploys trillion-parameter models on WSE-3T wafers achieving 1,000–2,000+ tokens per second"`.

D1 and M3 come from the pages' own Highlights, written by the old prompts: `ai-data.md` reads "Coding agent MCP tool (GA 2026-10-23)" and `ai-models.md` "Cerebras deploys … achieving 1,000–2,000+ tokens per second", and `buildHighlightsPrompt` tells the model to cover each page's first Highlights bullet, so the new rule ("only when the item's own row or text uses them") is met by the excerpt. On the 10-26 files the box can only test what highlights.json adds by itself (A5, which passed on one sample). D1 and M3 can be checked only on pages whose Highlights the new prompts wrote: the box needs rewording or a later date. Also seen: `"Coding agent evaluation research converges with SWE-VERIFIER, SWE-DIVE, and PAUSE all appearing this week"` (ai-trends), a trend built from three paper titles, which the fifth rule forbids; and the Polars bullet lost its `−` sign and still says "requiring pipeline migration across Databricks, Snowflake, Fabric, BigQuery" (D2, also carried from the page).
