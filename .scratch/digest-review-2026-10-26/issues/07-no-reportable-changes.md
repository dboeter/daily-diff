# 07: No Tracked project shows "no reportable changes"

Status: done
Blocked by: None (can start immediately)
Findings: A1, S9 (agents) — see `../review.md`

## What to build

A Tracked project with a release always shows that release, and the page header counts match the body. On 2026-10-26 Agent Deck v1.16.34, a release with about 20 user-facing items, rendered as a bare "(no reportable changes … only dependency updates)" with no heading, outside the Quiet line, while the header counted it as active.

- [x] A project with a release gets its `### <Project>` heading and a Release bullet
- [x] When the model returns nothing usable for a release, code falls back to the release title plus its top 2-3 items
- [x] When a project has nothing to show, code puts it in the Quiet line; the model never writes an absence
- [x] "Active today" and "Stable releases" in the header match the projects shown
- [x] A test covers a release whose model output is empty

## Comments

Cause: the model wrote only "(no reportable changes for Agent Deck v1.16.34 — only dependency updates)" with no `## Agent Deck` section. `quietProjects` took a summary without any project section for a failure notice, so every project with data counted as active and the absence text rendered as written. Now `groupProjects` (markdown.ts) renders per project: the model's section when it carries a bullet, a code fallback (`releaseFallbackSection`) for a released project without one, text outside sections and bullet-less project sections dropped; only the exact `MSG.summaryFailed` lets the data decide. The header's Active count is the projects shown. The prompt now asks for a Release bullet on every released project. Tests: markdown.test "shows a release the model wrote off…" and "drops a project section without a bullet…".

**Branch review fix (2026-10-27):** the first box held only for a section without bullets: a released project whose section had only a News or Hot issue bullet showed no release. `withReleaseBullet` (markdown.ts) now appends the code Release bullet to a covered section that has neither a `**Release:**` bullet nor a bullet naming one of its release tags. Tests: markdown.test "appends the Release bullet to a released project's section that only has other bullets" and "adds no Release bullet to a section that shows the release, labelled or by its tag".
