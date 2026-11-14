# 07: The scheduled run starts over 5.5 hours late

Status: ready-for-human
Findings: 9 [medium], see `../review.md`

## Problem

Cron `7 1 * * *` Europe/Amsterdam. Runs were created at 05:46Z (11-07), 05:50Z (11-08) and 06:01Z (11-04, 11-09): 5h40m–5h54m late, outside the 2.5–4h the workflow comment and `AGENTS.md` state, and about two hours past the 05:00 Amsterdam target.

## Options

- Move the cron earlier by two hours (the news window shifts with it)
- Trigger `workflow_dispatch` from a timer on a machine that is on at that hour, keeping the cron as fallback (the guard job skips the second run)
- Accept it: update the comment and `AGENTS.md` to the measured delay

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: later still. The runs were created at 06:01Z on 11-09 (5h54m late) and at 07:03Z on 11-10 (6h56m late, 08:03 Amsterdam).
- 2026-11-14: unchanged. Scheduled runs were created at 05:56Z (11-11), 06:58Z (11-12), 06:24Z (11-13) and 06:05Z (11-14). `AGENTS.md` and the workflow comment still say 2.5–4 h.
