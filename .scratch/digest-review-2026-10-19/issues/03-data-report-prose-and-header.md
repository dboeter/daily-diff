# Data report: prose repeats items, header misleads, duplicate events

Status: needs-triage

## Problems (from `digests/2026-10-19/ai-data.md`)

1. **Prose repeats itself.** The AI Runtime SDK and Knowledge Assistant items appear in both Highlights and Data × AI; all three Worth a Look bullets are rows already in the tables. Rule for `buildDataProsePrompt`: an item appears in at most one prose section, and Worth a Look names something the tables do not lead with.
2. **Header.** `Projects: 17 | Active today: 0 | Stable releases: 0` sits above a report of 16 vendor rows. Count the vendor items in the header, or drop the project counts when every repo section is quiet.
3. **One event, two rows.** Snowflake "10.37 Release Notes (with behavior changes)" and "Behavior change bundle 2026_08" are the same change; Databricks "Feature Views are now generally available" (release notes) and "Feature Views will soon be available by default…" (what's coming page) too. Candidate for dedupe, or for a Jev/prompt instruction to merge them.

## Where

`buildDataProsePrompt` (`src/reports/prompts-data.ts`), `buildDataReport` (`src/reports/data-reports.ts`), `buildProjectReportContent` header (`src/reports/report-builders.ts`), `selectVendorItems` (`src/data/jev.ts`).
