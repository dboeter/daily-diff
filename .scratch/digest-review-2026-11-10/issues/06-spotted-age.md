# 06: Old Spotted rows read as today's news

Status: needs-triage
Findings: 3 [medium], see `../review.md`

## Problem

3 of the agents Spotted rows on 2026-11-07 and 5 of 8 on 11-08 were published before the 24h window; the table has no date. By design a story may be up to `SPOTTED_MAX_AGE_DAYS` (7) old, but a reader cannot tell a story from this morning from one of four days ago, and in-window stories were cut for them.

## Decide

- [ ] Show the age: a Date column, or a mark on a row older than the window
- [ ] Rank: whether a story inside the window beats an older one at similar points

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: 5 of 6 agents Spotted rows and at least 3 of 7 models Spotted rows predate the window on 11-09; one models row on 11-10. The reviewers now flag the same on other tables: nine Databricks and Snowflake vendor rows dated Nov 3–8 (11-10), a Fabric post of Nov 3 as the only News & discussion row (11-09), a TikTok item of Nov 6 as the only EU policy row (11-10). Those are inside their 7-day limits by design. The decision above applies to every table that shows items older than the window.
