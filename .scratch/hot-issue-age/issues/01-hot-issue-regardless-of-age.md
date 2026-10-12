# Hot Issue: drop the "opened in the window" requirement

Status: needs-triage

## Problem

`GLOSSARY.md` defines a **Hot Issue** as an issue with real engagement (comments + 👍), or less on a regression/security issue, **however old**. `fetchHotIssues` (`src/github.ts`) only finds issues _opened_ in the window (widened to at least 48h). A long-running issue that suddenly flares up (a regression reported last month, now with 40 new comments) never appears.

## Desired behavior

An issue is a Hot Issue on engagement alone, whenever it was opened.

## Open questions (decide before implementing)

- **Repeats.** Without the age filter, the same big issue is hot every day. Options: count only engagement gained in the window (the search API can't filter by that; needs per-issue data or a saved snapshot like `trending-state.json`), require activity in the window (`updated:>=` plus the threshold), or keep a seen-list and report an issue once.
- **Quota.** Search allows 30 requests/minute, shared with trending; `searchSlot` spaces calls 2.1 s apart. A wider query must still fit one request per repo, or the fetch time grows.
- **Threshold.** The current 10 / 3 thresholds were tuned for new issues; old issues have had longer to collect engagement.

## Notes

- Update the hot-issue bullet in AGENTS.md ("Agents and infra reports cover…").
- Tests for `fetchHotIssues` query building.
