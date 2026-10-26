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
