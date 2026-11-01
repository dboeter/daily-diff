# Digest review 2026-11-01

Run 41278370156 (schedule, success). Published: `ai-agents`, `ai-data`, `ai-models`. `ai-policy` skipped (0/127 kept, legitimate), `ai-trends` not scheduled. 0/9 LLM calls failed, no fetch returned `fetched: null`. Reviewed by one subagent per page plus one cross-page subagent.

## Findings

| #   | Sev    | Page            | Finding                                                                                                                                                                                  | Issue |
| --- | ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | high   | data            | Only Highlight is an absence/meta bullet ("All vendor release notes … minor … no deprecations") contradicted by the Action required row; sent to Teams via `highlights.json`            | 01    |
| 2   | medium | models, agents  | Highlights overstate their rows: one user's tweet becomes "users report broad enforcement"; agents lead drops the body's "reports that"                                                | 02    |
| 3   | medium | agents          | Codex news bullet for a title-only story adds "affecting how subscribers allocate their quota" and opens with "discusses"                                                               | 03    |
| 4   | medium | models, agents  | No story-level dedup: one video-game story from 3 outlets takes 3/6 HN Spotted slots; the Open-VSX incident leads agents two days running via a different article                     | 04    |
| 5   | medium | cross           | "Do the math: How we took over ChatGPT accounts" (315 pts) on no page: split topic (research 0.43) fails Spotted's 0.6 bar and is not `other`, so not talked-about either             | 05    |
| 6   | medium | data            | Hard cut-offs: Snowflake DCM SECRET significance 0.99 counts as minor (`>= 1`); 3 Snowflake community posts at insight 1.21–1.56 dropped on confidence alone, so no News & discussion | 06    |
| 7   | low    | policy (future) | Six sources reach the quiet-source warning ~11-03/04; EUR-Lex, EP, Have your say do fetch items, but they are already-reported watchlist items, never judged                            | 07    |
| 8   | low    | models          | Spotted ranks topic probability in tenths before points: 7-pt off-topic "Very Intentional" (models 0.81) shown, 75-pt "Critical Thinking" (research 0.62) cut on cap                   | 08    |
| 9   | low    | data            | dbt Labs blog feed: 25/25 items dated within 7 days, 19 already in the 10-31 trace; dates may be refreshed, so old posts could return as news (unverified: trace has no post dates)     | 09    |
| 10  | low    | data            | `shippedComingSoon` matches on a stem `STATUS_RE` cuts too far ("AI Runtime is now in Public Preview" matched a CSP-default coming-soon note); "5 skipped" counted before filters      | 10    |
| 11  | low    | data            | `data-trace.json` rows lack the `minor` flag and source text, so a minor classification and vendor summaries cannot be checked from the trace                                          | 11    |
| 12  | low    | models, agents  | Cosmetic: `nothingNew` gives "Nothing new from Anthropic or OpenAI, … or …" (two "or"s); blank line under `###` project headings inconsistent                                         | 12    |
| 13  | low    | cross           | Dev.to answered HTTP 429 for tags `llm`, `langchain`, `openai`                                                                                                                         | 13    |

## Noted, no issue

- Weak Spotted summaries (bootgpt restates its title; "Let's Build a Brain" pads a one-line description): thin meta descriptions, by spec.
- Data near-cut picks: Databricks "Dashboard bug fixes" (relevance 0.466) and a Fabric tie at 0.474 kept by `NEAR_CUT_MARGIN`, by design.
- Postgres 19 Spotted summary goes slightly past its description; Snowflake row summary omits CREATE OR ALTER SECRET.
- Policy: "Newsom special session AI" dropped at relevance 0.427 (significance 0.13); judgement call.
- 28 `[community] Invalid saved verdict … asking again` lines: one-off re-ask after the `kind` question (commit 720ba92); reads like corruption in the log.
- ArXiv 0 papers: weekend, expected.

## Checked and fine

Agents meta counts, quiet lines, Codex hot issue #58551 (gain, commenters, labels, fix status), Oh My Pi and Agent Deck release claims; models labs/OpenRouter/stealth all correctly empty; data layout, markers, Action required, releases (every stable since 10-24 already reported); `coming-up.json`; `talked-about.json` thresholds; no link on two pages; hot-issue calls well under caps.
