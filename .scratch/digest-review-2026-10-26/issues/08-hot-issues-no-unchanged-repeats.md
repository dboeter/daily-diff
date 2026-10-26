# 08: Hot issues don't repeat unchanged; closed issues are marked

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: A2 — see `../review.md`. Related: `.scratch/hot-issue-age/issues/01-hot-issue-regardless-of-age.md` (its "Repeats" question)

## What to build

A Hot Issue shown yesterday is not shown again unless its state moved, and a closed issue is never presented as live. On 2026-10-26 the OpenCode free-tier issues (#58781, #58670) repeated the 10-25 row word for word although both were closed "not planned" on Oct 25, and a Highlight called it a persisting regression.

- [ ] A hot issue shown in the previous Daily Digest is skipped unless its state, labels or engagement changed materially
- [ ] A closed issue is skipped, or labelled closed with its resolution
- [ ] Closed or repeated hot issues cannot become a Highlight
- [ ] The chosen repeat rule is noted on the hot-issue-age ticket so the two stay consistent
