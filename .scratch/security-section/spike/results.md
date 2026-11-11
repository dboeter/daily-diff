# Spike results: a Jev security question over a week of stories and release lines

Run on 2026-11-11 with `jev-1.14.0`. 1,152 Jev calls and about 0.95 million tokens: 40 pilot, 381 stories (534,000 tokens), 656 release lines (318,000 input tokens), 75 story-to-line pairs. The estimate was under 1,000 calls. After the run the API answered `402`: the organization has no credits left (see the end). Script: `replay.py`. Rubric: `rubric.md`, frozen before any label or call. Every file named here other than this one is in `.gitignore` and exists only in the maintainer's local `spike/` folder. Labels: one independent labeller (a subagent that saw neither the questions nor the answers); I read every disagreement and changed no label.

## Test set

- **Stories**: the 381 community stories of `digests/spotted-log.json` and the `candidates.json` files, first seen 2026-10-29 to 11-10. 114 have no description. The log is pruned after 8 days, so the days before 11-03 are partial (10 to 27 stories a day against 23 to 43 after).
- **Release lines**: the bullet lines of the full bodies of every stable release of the 41 tracked repos published 11-03 to 11-10: 41 releases, 3,298 lines, about 410 a day (1,386 on 11-06). Jev was asked about 656 of them: all 456 that match a broad keyword filter (`lines-sample-meta.json`) and a random 200 of the other 2,842.

Repeat noise: 20 stories asked twice differ by at most 0.03 on the yes/no question, and the kind never changed. None of the 20 was a positive or a listed false hit, so this says nothing about noise near the bar.

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
- **A keyword filter loses roughly a third** of the true lines (97 of an estimated 154; the estimate rests on 4 lines in a sample of 200, so it is rough). Its misses read like "Scope UI next_run_assets endpoint to assets the caller may read" and "Validate `roles/list` and `create_role` workspaces".
- **Both pages get them.** Of the 101 labelled lines, 59 are in the agents and infra repos and 42 in the data repos (MLflow 18, Apache Airflow 10, Databricks CLI 5, dbt Core 4, Soda Core 4).
- Some "false hits" are debatable, for example "Changed mods Claude writes to turn on without asking … even with managed `allowUnsandboxedCommands: false`": a change that loosens a protection.

## Linking a story to its fix

Each of three Claude Code stories was asked against the 25 Claude Code lines flagged at 0.7.

- **The email leak links cleanly.** Both stories pick the v2.1.317 line (0.93 and 0.77); the next line scores 0.14.
- **The follow-up line was not tested.** v2.1.321 (11-09) has "Changed the account email check to refuse only a shell command that holds your email and names a User-Agent": the fix after the story, the case the maintainer named. It scored 0.43 as a security line, under the 0.7 gate, so the pair run never saw it. The two calls to test it failed with `402`. If it holds, a line gate drops the follow-up before any link is tried, and an open incident must be matched against every line of its project's releases.
- **A story without text does not.** "Claude Code's 'Don't Ask Again' exposes passwords in 1,122 public GitHub files" (title only, no known fix) scores four unrelated lines 0.62 to 0.80. A link needs a bar near 0.9, or a story with a description.

## Cost of a daily run

- **Stories**: one extra call per fresh story, about 80 to 115 a day. The question cannot ride in the topic request: `routeStories` only gets the stories no project took (`splitPool`, `src/index.ts:498`), and 5 of the 17 positives name Claude Code, so they are project News. The question has to be asked of every fresh story, after `dropShownRepeats` and before news matching. The four questions here cost about 1,400 tokens a story.
- **Release lines**: about 410 calls a day when every line is asked, about 485 input tokens each. A keyword filter cuts that to about 57 a day and loses roughly a third of the lines.
- For scale: the 11-10 run asked Jev about 828 arXiv papers alone.

## Not tested

- Vendor notes, the Data page's own feed.
- A severity question for release lines.
- The follow-up line of v2.1.321 against the email-leak stories (above).
- Points as a third banner signal.

## What this says about the design

1. The story question works at a bar of 0.6; it needs a second gate for scope (the project or vendor named, or a tighter question).
2. Banner-grade is a rule over three answers, and gives 2 to 3 events a week.
3. Fix lines are too many for a table of their own. They fit their project's release bullets, with only the graded ones raised.
4. The incident-to-fix link works when the story has text.

## Credits

The run ended with the organization out of TypeSafe credits: `402 billing_error`, "no available TypeSafe API credits", on the first call after the pair run. Whether the balance was already low is not known; it was not checked before the run, and the estimate counted calls, not tokens. Until credits are added, the daily digest falls back to keyword rules where it has no saved verdict, and saves no research papers, if its key is on the same organization.
