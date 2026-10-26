# 09: Skills section shows only this week's movement

Status: partial
Blocked by: None (can start immediately)
Findings: T1 — see `../review.md`

## What to build

The Trends page's Claude Code Skills section shows skills PRs and issues that moved this week. On 2026-10-26, 8 of its 11 items repeated the 2026-10-19 page and several had not been updated in 5+ weeks; all are open third-party PRs, yet "Top Skills" read like released skills.

- [x] Only PRs/issues updated in the last 7 days are eligible
- [x] An item shown in the previous Weekly Digest is skipped unless its state changed
- [x] The section is renamed so open PRs are not mistaken for released skills (e.g. "Open PRs worth watching")
- [ ] Off-audience items (not about coding agents or data/AI engineering) are filtered (not verified: needs live LLM run)
- [x] The section and its Takeaway are left out when nothing qualifies
- [x] AGENTS.md's Trends row matches the new section name

## Comments

- The fetch now asks for the PRs and issues updated most recently (any state), so a PR closed this week is seen; `selectSkillsItems` keeps the last 7 days and skips what the page dated 7 days earlier named unless it closed in the window. The 2026-10-19 page named items as bare `#N` (no links), so both forms are read.
- Section renamed "Skills: open PRs worth watching"; subsections Open PRs worth watching / Closed this week / Requests / Takeaway.
- Off-audience: a prompt rule only. A code filter would be a `judgeItems` gate with its own verdict cache, as the other pages do.
