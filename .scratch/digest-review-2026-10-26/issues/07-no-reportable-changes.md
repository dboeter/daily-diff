# 07: No Tracked project shows "no reportable changes"

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: A1, S9 (agents) — see `../review.md`

## What to build

A Tracked project with a release always shows that release, and the page header counts match the body. On 2026-10-26 Agent Deck v1.16.34, a release with about 20 user-facing items, rendered as a bare "(no reportable changes … only dependency updates)" with no heading, outside the Quiet line, while the header counted it as active.

- [ ] A project with a release gets its `### <Project>` heading and a Release bullet
- [ ] When the model returns nothing usable for a release, code falls back to the release title plus its top 2-3 items
- [ ] When a project has nothing to show, code puts it in the Quiet line; the model never writes an absence
- [ ] "Active today" and "Stable releases" in the header match the projects shown
- [ ] A test covers a release whose model output is empty
