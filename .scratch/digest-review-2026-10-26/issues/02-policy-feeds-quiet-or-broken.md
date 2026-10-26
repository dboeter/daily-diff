# 02: Policy feeds: quiet or broken?

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: X1, X8 — see `../review.md`

## What to build

On 2026-10-25 and 2026-10-26 AI Policy kept 0 of 99 judged items and the page was skipped. The judged items held nothing from any EU primary source, Tweede Kamer, Internetconsultatie, AP, Regulations.gov or Congress.gov; 94 of 99 were cached verdicts. Find out from the run logs whether those feeds were quiet or failing, and fix any that fail.

- [ ] The fetch outcome of every policy source on 10-25 and 10-26 is established from the workflow logs and written into this ticket's Comments
- [ ] Every failing source is fixed, or recorded with its cause if it cannot be fixed now
- [ ] AGENTS.md's Open States sentence ("has never returned a live response") matches reality: the 10-26 trace holds two Open States items
