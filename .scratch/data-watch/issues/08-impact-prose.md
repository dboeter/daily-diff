# Prose that says what a change means, once

Status: resolved
Type: task

## Evidence

Highlights, Data × AI and Worth a Look restate table rows. On 2026-10-20 the Fabric retirement is in the table and all three sections, despite the rule that an item appears in at most one. On 2026-10-21 DeepSeek V4.1 Flash and the MLflow Logs tab are in both Highlights and Data × AI. No bullet says who is affected or what to do.

## Scope

- `## Highlights` stays (heading, `highlights.json` fallback and Teams read it) but its bullets change: 3–5 items, each naming who is affected (which client setup: Azure Databricks workspaces with the compliance profile, Snowflake Native App providers…), what to do, and by when if the row has a date. No bullet that only restates a row.
- `## Data × AI` is dropped as a section. AI-flagged rows (`aiInData`) get a 🤖 marker in the vendor tables, next to ⚠️, rendered in code (`renderVendorTables`).
- `## Worth a Look` keeps only the code-rendered Policy Watch data-law links (ticket 06); the model no longer writes it. Left out when there are none.
- The prose call (`buildDataProsePrompt`) then writes Highlights only; ticket 11 adds the second section.
- Keep the code-side guard: a section the model writes that was not asked for is dropped.
- Docs: AGENTS.md (layout, Data × AI, Worth a Look), `DATA_REPORT` strings in `src/core/i18n.ts`, GLOSSARY.md if it names Data × AI.

## Done when

- Report tests: no `## Data × AI` heading; a row with `aiInData` shows 🤖; Worth a Look appears only with a data-law policy item; a model-written Worth a Look or Data × AI section is dropped.
- Prompt test: the Highlights instructions ask for who/what/when and forbid restating a row.
- One live run (or replay of 2026-10-21's inputs) read by hand: no item appears in more than one prose bullet.
- All checks pass.

## Verification

Replay of 2026-10-21's vendor rows (live feeds, the 10-20 state, `claude -p` Haiku standing in for the production model, which needs an OpenRouter key this machine lacks): five Highlights bullets, each naming who is affected and what to do (and by when where the row has a date); no item in two bullets; no Data × AI or Worth a Look.
