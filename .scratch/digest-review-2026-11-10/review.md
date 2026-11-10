# Digest reviews 2026-11-04 … 11-10 (nightly black-box review)

Source: `~/daily-diff-review/reviews/` (dagent plan: four blind reviewers, four scouts, a Codex verifier, a summary, an ops check of the CI run). 11-04: 13 findings. 11-07: 22 findings, 18 missed stories. 11-08: 19 findings, 1 missed story. The reviews of 11-09 and 11-10 ran later, on 11-10, once the plan was fixed; their findings are in the second section.

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

## Reviews 2026-11-09 and 11-10

11-09: 23 findings, 2 missed stories. 11-10: 25 findings (2 high), 9 missed stories. Most repeat findings 1–5 and 8–10; that evidence is a dated comment in issues 01–08. New:

| #   | Sev    | Page           | Finding                                                                                                                                                       | Issue |
| --- | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 12  | high   | models, policy | Fetched stories lose the selection: the Fireworks AI breach (three submissions, none shown), the Fable launch offers, US and Dutch policy items under the bar | 10    |
| 13  | medium | data, agents   | Highlights leave out the most urgent item: the Genie One end of life on 11-30, Claude Code's OAuth-secret and sandbox fixes                                   | 11    |
| 14  | low    | models         | "No lab or model news today." above Highlights about OpenAI's raise and Anthropic's power deal (11-09)                                                        | 12    |
| 15  | low    | data           | Header says `Vendor items: 15`, the page lists 20: the Also new lines are not counted (11-10)                                                                 | 13    |
| 16  | medium | agents         | One general post is News under Claude Code and Codex, and alone makes Codex active (11-09)                                                                    | 14    |

Finding 1 also has its first high case in a repo section: "make Claude Fable 5.2 the default model" (issue 05).

Noted, no issue, from these two reviews:

- By design, flagged by the reviewers: a Spotted row for a GitHub repo links the repo name, not the title; the `−` that opens a going-away Highlight.
- `[lobsters] 0 stories (from 74 unique)` on 11-10, once. File it if it repeats.
- A type written outside code formatting in one bullet and inside in another (Oh My Pi, 11-09); "handtyped" in a title and "handwritten" in its summary (11-10).

## Noted, no issue (11-04, 11-07, 11-08)

- Same-event misses: Revolut as News and as a Spotted row from a second outlet (11-04); the Claude Code email-leak story again on 11-08 through a Dev.to write-up (it had a development, the fix in 2.1.317, which the summary left out: finding 1's class).
- Policy: one Dutch cabinet package filled 5 of 8 rows on 11-07; two rows restated their titles ("Government letter" as the only text).
- Cosmetic: link text cut at "(G…" in the data report's Also new line (11-07); a stray `*` in a models Spotted summary (11-04).
- By design, flagged by the reviewers: the `−` that opens a going-away Highlight; "Internetconsultatie: 32 open consultations" then "0 items" (the keyword filter kept none: no open AI consultation).
- Conductor: `config.yml` tracked `conductor-oss/conductor` (a workflow engine) by mistake; the entry is `microsoft/conductor`, with `keywords` (fixed 2026-11-10). The Conductor of the 11-07 scout finding (Meta's acquisition, conductor.build) is a third product, closed source and not tracked.
- Node 20 deprecation warning on every run (`actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`).
