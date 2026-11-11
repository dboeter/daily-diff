# Spike results: a Jev security question over a week of stories and release lines

Run on 2026-11-11 with `jev-1.14.0`. 1,152 Jev calls: 40 pilot, 381 stories, 656 release lines, 75 story-to-line pairs. Script: `replay.py`. Rubric: `rubric.md`, frozen before any label or call. Labels: one independent labeller (a subagent that saw neither the questions nor the answers); I read every disagreement and changed no label.

## Test set

- **Stories**: the 381 community stories of `digests/spotted-log.json` and the `candidates.json` files, first seen 2026-10-29 to 11-10. 114 have no description.
- **Release lines**: the bullet lines of the full bodies of every stable release of the 41 tracked repos published 11-03 to 11-10: 41 releases, 3,298 lines, about 410 a day (1,386 on 11-06). Jev was asked about 656 of them: all 456 that match a broad keyword filter (`lines-sample-meta.json`) and a random 200 of the other 2,842.

Repeat noise: 20 stories asked twice differ by at most 0.03 on the yes/no question, and the kind never changed.

## Stories

Labels: 17 yes, 363 no, 1 borderline. The 17 stories are 13 events (the VS Code extension backdoor twice, the Claude Code email leak twice, Fireworks three times). 10 of the 13 days have at least one.

| Bar on "is this a security or privacy event" | Found, of 17 | False hits, of 363 |
| -------------------------------------------- | ------------ | ------------------ |
| 0.3                                          | 16           | 17                 |
| 0.5                                          | 15           | 8                  |
| 0.6                                          | 15           | 5                  |
| 0.8                                          | 14           | 4                  |

- **The two misses** at 0.6 are "OpenAI seems to be silently re-enabling model training on Codex chats" (0.29) and "Tell HN: Gemini trains on chat history" (0.39). The labeller marked both as hard: a change in data use, not a leak.
- **The five false hits** at 0.6 are security news outside the scope: a Homeland Security leak, the Binance theft, malware that uses LLMs, AI used to steal Asahi Linux code, open-weight models and the patch gap. Jev reads "security event" well and "that concerns an AI tool, provider or data platform" less well.
- **All three Fireworks stories are flagged** (0.75, 0.94, 0.95), with no text. The topic routing had scattered them over `cap`, `threshold` and `routing`.
- **No story in 13 days concerned a data platform.** Postman is the nearest.

### Grading: which ones are banner-grade

The severity score alone does not separate: 12 of the 15 flagged true stories score 1.6 or more out of 2. Who makes the claim adds the second half.

| Rule                                                           | Stories          | Events |
| -------------------------------------------------------------- | ---------------- | ------ |
| flagged at 0.6                                                 | 15 true, 5 false | 11     |
| and severity ≥ 1.5                                             | 12 true, 2 false | 9      |
| and the claim comes from the vendor, a researcher or the press | 6 true, 2 false  | 5      |

The five events of the last rule: the Claude Code extension backdoor and its postmortem, the Fireworks breach, the ChatGPT account takeover, the "Don't Ask Again" passwords, the stolen API keys. That is 2 to 3 a week. The rule leaves out the Claude Code email leak (1,612 points, severity 1.92): it was one user's GitHub issue, and it was real. Points could be a third signal; not tested.

## Release lines

Labels in the sample: 101 yes, 542 no, 13 borderline.

| Bar | Found, of 101 | False hits, of 542 |
| --- | ------------- | ------------------ |
| 0.5 | 91            | 41                 |
| 0.7 | 78            | 11                 |
| 0.9 | 39            | 2                  |

- **The acceptance lines pass**: the two v2.1.321 fixes score 0.99 and 0.97, and the email check of v2.1.317 scores 0.98 with no security word in it.
- **Volume is the problem.** 97 of the 456 keyword hits are security lines, and 4 of the 200 sampled others, which extrapolates to about 57 more: roughly 150 lines in 8 days, 19 a day. Most are hardening (a deny rule that now applies, a path check, a token no longer logged). One row per line would bury the table. Lines need a grade or one row per release; no severity question was asked of lines.
- **A keyword filter loses about a third** of the true lines (97 of an estimated 154). Its misses read like "Scope UI next_run_assets endpoint to assets the caller may read" and "Validate `roles/list` and `create_role` workspaces".
- Some "false hits" are debatable, for example "Changed mods Claude writes to turn on without asking … even with managed `allowUnsandboxedCommands: false`": a change that loosens a protection.

## Linking a story to its fix

Each of three Claude Code stories was asked against the 25 Claude Code lines flagged at 0.7.

- **The email leak links cleanly.** Both stories pick the v2.1.317 line (0.93 and 0.77); the next line scores 0.14.
- **A story without text does not.** "Claude Code's 'Don't Ask Again' exposes passwords in 1,122 public GitHub files" (title only, no known fix) scores four unrelated lines 0.62 to 0.80. A link needs a bar near 0.9, or a story with a description.

## Cost of a daily run

- **Stories**: no extra call. The questions take the same state as the topic question, so they can ride in that request (1,273 input tokens for the four questions here).
- **Release lines**: about 410 calls a day when every line is asked, against the roughly 600 the digest makes now. A keyword filter cuts that to about 57 a day and loses a third of the lines.

## What this says about the design

1. The story question works at a bar of 0.6; it needs a second gate for scope (the project or vendor named, or a tighter question).
2. Banner-grade is a rule over three answers, and gives 2 to 3 events a week.
3. Fix lines are too many for a table of their own. They fit their project's release bullets, with only the graded ones raised.
4. The incident-to-fix link works when the story has text.
