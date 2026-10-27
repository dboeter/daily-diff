# 08: Hot issues don't repeat unchanged; closed issues are marked

Status: done
Blocked by: None (can start immediately)
Findings: A2 — see `../review.md`. Related: `.scratch/hot-issue-age/issues/01-hot-issue-regardless-of-age.md` (its "Repeats" question)

## What to build

A Hot Issue shown yesterday is not shown again unless its state moved, and a closed issue is never presented as live. On 2026-10-26 the OpenCode free-tier issues (#58781, #58670) repeated the 10-25 row word for word although both were closed "not planned" on Oct 25, and a Highlight called it a persisting regression.

- [x] A hot issue shown in the previous Daily Digest is skipped unless its state, labels or engagement changed materially
- [x] A closed issue is skipped, or labelled closed with its resolution
- [x] Closed or repeated hot issues cannot become a Highlight
- [x] The chosen repeat rule is noted on the hot-issue-age ticket so the two stay consistent

## Comments

- Repeat rule: `digests/hot-issues-state.json` (`ReportedState`, the same mechanism as the models and data states) records every hot issue sent to a published page's prompt, after the LLM health gate, under the id `issue:<owner/repo>#<n>` (`hotIssueStateItem`). Box 1 is now deliberately "shown once", per the maintainer on 2026-10-26: no change in engagement or labels brings an issue back. The repeat is filtered before the per-repo cap, so a skipped issue frees its slot. A same-day re-run shows the same issues. The state is never pruned (`nextHotIssuesState`), so an issue is never shown again.
- State: closed issues are skipped (`is:open` in the search, and `state === "open"` in `selectHotIssues`), so state is not part of the id. Labelling with the resolution would need `state_reason`; the ticket allowed skipping.
- Highlight: the filter runs in the fetch phase, so a closed or repeated issue never reaches the section prompt or the rendered page the Highlights call reads. Tests: `src/__tests__/core/github.test.ts` "hot issue repeats", replaying #58781/#58670 shown on 10-25 (skipped on 10-26 even with 400 comments or a regression label).
