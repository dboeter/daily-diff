# Row summaries that add to the title

Status: resolved
Type: task

## Evidence

Many summaries restate the title. 2026-10-21: "Schema variables are now generally available in Snowflake." for the row "Schema variables (General availability)"; "File upload in Genie One and Genie Agents is now generally available…" for the row of the same name.

## Scope

- `buildDataSummariesPrompt`: the summary says what the change enables, breaks or requires (a setting to enable, a migration, a cloud or edition limit), from the description; it does not repeat the title's status words. When the description adds nothing beyond the title, the line is `N: —` and the cell shows "—", not the truncated description (`summaryText` today falls back to the description).
- Vendor table only; trending and policy summaries untouched.
- Docs: AGENTS.md (layout) if it describes the fallback.

## Done when

- Prompt test: the rule is present.
- Test: a `N: —` line renders "—"; a missing line still falls back to the description.
- A replay of 2026-10-21's vendor rows, read by hand: the Snowflake schema-variables row is "—" or says something the title does not.
- All checks pass.

## Verification

Replay of 2026-10-21 (Haiku as the model): "Oct 19, 2026: Schema variables (General availability)" → "—".
