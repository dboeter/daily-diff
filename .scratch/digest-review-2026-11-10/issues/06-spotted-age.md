# 06: Old Spotted rows read as today's news

Status: needs-triage
Findings: 3 [medium], see `../review.md`

## Problem

3 of the agents Spotted rows on 2026-11-07 and 5 of 8 on 11-08 were published before the 24h window; the table has no date. By design a story may be up to `SPOTTED_MAX_AGE_DAYS` (7) old, but a reader cannot tell a story from this morning from one of four days ago, and in-window stories were cut for them.

## Decide

- [ ] Show the age: a Date column, or a mark on a row older than the window
- [ ] Rank: whether a story inside the window beats an older one at similar points

## Comments
