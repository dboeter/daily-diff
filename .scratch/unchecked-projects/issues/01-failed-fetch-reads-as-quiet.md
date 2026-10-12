# A failed release fetch reads as Quiet

Status: needs-triage

## Problem

When the release fetch for a Tracked Project fails, `fetchProject` (`src/index.ts:132`) catches the error, logs it and returns empty data. `buildProjectReportContent` (`src/report-builders.ts:43–49`) then lists the project under **Quiet**, and the header counts it as not active.

A reader cannot tell "Codex shipped nothing" from "we could not reach Codex's releases". On 2026-10-06 a dropped connection lost a Codex stable release, and the report listed Codex with nothing to say (see AGENTS.md, `githubGet` retries).

Per `GLOSSARY.md`, Quiet means the project had nothing worth reporting for the period. A project we could not check is not Quiet.

## Desired behavior

- A project whose release fetch failed is not listed as Quiet and is not counted as active.
- The report shows it separately, e.g. a line `**Unavailable today:** Codex` next to the Quiet line, so the gap is visible.
- A hot-issue fetch failure alone stays as it is: releases were still fetched, and the AGENTS.md convention is that it degrades to no hot issues.

## Notes

- `ProjectFetch` needs a flag (e.g. `fetchFailed`) set in the catch block; `buildProjectReportContent` excludes those from both active and quiet.
- Applies to both the Agents (daily) and Infra (weekly) reports.
- Update the "Agents and infra reports" bullet in AGENTS.md.
- Add a test next to the existing `buildProjectReportContent` tests.
