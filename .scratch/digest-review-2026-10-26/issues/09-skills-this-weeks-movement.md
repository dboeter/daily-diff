# 09: Skills section shows only this week's movement

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: T1 — see `../review.md`

## What to build

The Trends page's Claude Code Skills section shows skills PRs and issues that moved this week. On 2026-10-26, 8 of its 11 items repeated the 2026-10-19 page and several had not been updated in 5+ weeks; all are open third-party PRs, yet "Top Skills" read like released skills.

- [ ] Only PRs/issues updated in the last 7 days are eligible
- [ ] An item shown in the previous Weekly Digest is skipped unless its state changed
- [ ] The section is renamed so open PRs are not mistaken for released skills (e.g. "Open PRs worth watching")
- [ ] Off-audience items (not about coding agents or data/AI engineering) are filtered
- [ ] The section and its Takeaway are left out when nothing qualifies
- [ ] AGENTS.md's Trends row matches the new section name
