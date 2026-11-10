# Digest reviews 2026-11-04, 11-07, 11-08 (nightly black-box review)

Source: `~/daily-diff-review/reviews/` (dagent plan: four blind reviewers, four scouts, a Codex verifier, a summary, an ops check of the CI run). 11-04: 13 findings. 11-07: 22 findings, 18 missed stories. 11-08: 19 findings, 1 missed story. No review ran on 11-09 and 11-10 until the plan was fixed (below).

## Findings, by theme

| #   | Sev    | Page           | Finding                                                                                                                                                                    | Issue |
| --- | ------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | high   | all            | Highlights and Across platforms overstate their sources: one Tell HN post becomes "Anthropic now requires a government ID"; a user's allegation stated as fact; "GA Nov 1" | 05    |
| 2   | medium | models, agents | Rows without text are shown and back Highlights: 4 of 8 models Spotted rows with `—` on 11-08                                                                              | 02    |
| 3   | medium | all            | 3–5 Spotted rows a day predate the 24h window and show no date (the 7-day limit is by design)                                                                              | 06    |
| 4   | medium | policy         | EDPB 503 and Congress.gov empty or timing out since 10-28; no US item on 11-07; report skipped on 11-04 and 11-08 (0 of 132, 0 of 138)                                     | 01    |
| 5   | medium | data, models   | `highlights.json` has no entry for ai-data (11-08) and for ai-models and ai-data (11-09)                                                                                   | 03    |
| 6   | medium | agents         | `### Claude Code- **Hot issue:**`: heading glued to its bullet, project shown in two sections (11-08)                                                                      | fixed |
| 7   | medium | data           | Carried Action required rows (Genie One MCP end of life) flagged as unsourced: `candidates.json` lacked them                                                               | fixed |
| 8   | medium | data           | BigQuery notes marked `shown` that the report does not link: the review's `candidates.py` drops the URL fragment                                                           | 04    |
| 9   | medium | ops            | Every scheduled run starts 5h40m–5h54m late, past the 05:00 Amsterdam target                                                                                               | 07    |
| 10  | low    | models, agents | Missed news is mostly sources the digest does not fetch (Meta AI blog, GitHub changelog, funding news)                                                                     | 08    |
| 11  | low    | docs           | `GLOSSARY.md` says agents, models and data stories never reach "Also talked about"; `AGENTS.md` and the code send stories under the topic bar there                        | 09    |

## Noted, no issue

- Same-event misses: Revolut as News and as a Spotted row from a second outlet (11-04); the Claude Code email-leak story again on 11-08 through a Dev.to write-up (it had a development, the fix in 2.1.317, which the summary left out: finding 1's class).
- Policy: one Dutch cabinet package filled 5 of 8 rows on 11-07; two rows restated their titles ("Government letter" as the only text).
- Cosmetic: link text cut at "(G…" in the data report's Also new line (11-07); a stray `*` in a models Spotted summary (11-04).
- By design, flagged by the reviewers: the `−` that opens a going-away Highlight; "Internetconsultatie: 32 open consultations" then "0 items" (the keyword filter kept none: no open AI consultation).
- Conductor: `config.yml` tracks `conductor-oss/conductor` (a workflow engine). The Conductor of the 11-07 scout finding (Meta's acquisition, conductor.build) is closed source. Open decision: drop or keep.
- Node 20 deprecation warning on every run (`actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`).
