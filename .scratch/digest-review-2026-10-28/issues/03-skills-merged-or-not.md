# 03: Skills says whether a closed PR was merged

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: T1 [high] — see `../review.md`, `../ai-trends.md`

## What to build

A reader of Trends' Skills section can tell shipped work from rejected work. On 2026-10-28 all 7 PRs under "Closed this week" were closed without merging (#1958, #1728, #1961, #2027, #765, #50, #2038), yet each read as shipped ("#1961 – Hardens `skill-creator` eval viewer against script breakout, DNS rebinding…"), and the Takeaway built "refining skill specifications" on two rejected refactors.

- [ ] The Skills fetch keeps `pull_request.merged_at` from the issues API response it already makes (no extra call)
- [ ] Code, not the model, splits or marks the closed PRs: merged ones as shipped, unmerged ones as closed without merging (or dropped; pick one and document it in AGENTS.md)
- [ ] The prompt no longer says "do not say which"; a summary of an unmerged PR describes what it proposed, not what it does
- [ ] The Takeaway rests only on merged PRs, open PRs and issues
- [ ] A test with one merged and one unmerged closed PR checks the rendered section

## Comments

From the review: `src/reports/prompts.ts:388` ("a closed PR may or may not have been merged: do not say which"); `GitHubItem` (`src/core/github.ts:49`) has `closed_at` but no `merged_at`; the Skills fetch is `src/trending/skills.ts`.
