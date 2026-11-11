# 01: Replay a week of stories and release lines against a Jev security question

Status: done

Run on 2026-11-11 after the maintainer's go-ahead. Results: `../spike/results.md`.

## Question

Does one Jev question separate security incidents and fixes from the rest, at a volume a daily section can carry?

## What to do

- [ ] Draft the question: a breach, leak or vulnerability in an AI tool, a model provider or a data platform, or a fix for one. Not research, not policy, not a product that sells security.
- [ ] Hand-label the stories of 2026-11-07 to 11-10 (`candidates.json`, kind `story`: 84, 109, 116 and 77 a day, with repeats across days) and the lines of that week's release bodies of the tracked repos.
- [ ] Run the question over both. Report rows per day, false hits and misses against the labels.
- [ ] Check the acceptance pair of `../spec.md`: the email-leak story and the v2.1.317 line are both flagged, and Jev matches them.
- [ ] Count the calls a normal day needs for release lines (Claude Code and Codex ship daily, 12–16 KB a release) and decide whether a cheap filter runs before Jev.

## Cost

About 300 distinct stories and a few hundred release lines: under 1,000 Jev calls, about one daily run's worth. Unverified until the lines are counted.

## Comments

- 2026-11-11: done with 1,152 Jev calls, over the estimate of 1,000. The story question finds 15 of 17 at a bar of 0.6 with 5 false hits in 363. Release lines are about 19 security lines a day, too many for one row each. The email leak links to its fix line at 0.93. Not done: the daily count used all lines of one week, not a second week; lines got no severity question.
- 2026-11-11: the organization ran out of TypeSafe credits at the end of the run (`402`). Two follow-up calls, the v2.1.321 email-check line against the leak stories, did not run. The balance was not checked before the run.
- 2026-11-11, later: credits were added and the two calls ran. The v2.1.321 email-check line scores 0.22 and 0.11 against the leak stories: not linked. See `spike/results.md`.
