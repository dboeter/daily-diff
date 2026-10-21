# Action required: upcoming retirement dates

Status: resolved
Type: task

## Evidence

2026-10-21 carries two dated retirements, DeepSeek V4.1 Flash on Azure Databricks (2026-11-19) and the Fabric data agent custom tool (2026-11-06). Each is shown once, on the day it is first reported, and is gone from the next report.

## Scope

- A code-rendered `## Action required` table right after Highlights: date, platform, item (link), what to do (the row's summary). Rows are the reported deprecations with a known end date, kept until the date passes; the nearest date first.
- Where the date comes from: a Jev extraction or a field in the existing vendor request (the deprecation question already runs per item), not the prose model, and not a regex over free text unless it proves exact on the current feeds. Snowflake behavior-change bundles carry their own timeline; use it.
- State: the end dates live in `digests/data-state.json` as an extra field, the way Policy Watch keeps `deadlines` (`src/policy/deadlines.ts`, `observedState`). Reuse that code where it fits rather than copying it.
- Like Policy Watch's deadlines: shown on report days only; the table alone never makes a report.
- Docs: AGENTS.md (layout, state).

## Done when

- Tests: a deprecation with an end date appears in the table on later report days until the date passes, then drops; one without a date does not appear; the table alone does not make a report.
- The 2026-10-21 pool yields both dates above.
- All checks pass.

## Decision

- Date source: Jev, as a `choice` question (`end_date`) added to the existing vendor request when the title or description has dates; the options are the regex-found dates as ISO keys plus `none` (TypeSafe's pre-parsed value extraction). A pick outside the candidates is ignored. Live check on the 2026-10-21 pool: DeepSeek V4.1 Flash → 2026-11-19, Fabric data agent custom tool → 2026-11-06, Databricks Runtime 19 (a release date in its title) → none.
- Bundles: the planned move to Enabled by Default or Generally Enabled, when its window has a day. On 2026-10-21 every planned change was month-only ("a subsequent October 2026 release"), so no bundle has an end date yet.
- State: `actions` in `digests/data-state.json`, through Policy Watch's `nextDeadlines`.
