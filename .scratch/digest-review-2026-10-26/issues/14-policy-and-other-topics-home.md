# 14: Policy and "other" topics get a home

Status: done
Blocked by: 10
Findings: X3, X7 — see `../review.md`

## What to build

Stories routed to the policy or other topics reach a reader before the weekly page. Today `PAGE_OF_TOPIC` gives them no page: on 2026-10-26 the EU GDPR/AI story and Meta's liability story were shown nowhere, and 32 of 45 judged stories (71%) were `other`, including an AI-and-work cluster and an AI-found PHP RCE at 452 points.

Decision needed from the maintainer: where these go. Options from the review: a Spotted table on AI Policy that publishes the page on its own, policy stories on ai-models or ai-agents when AI Policy is skipped, new topics for AI economy/labor and security incidents, or an "Also talked about" line on the Overview.

- [x] The maintainer's choice is recorded in this ticket's Comments
- [x] Policy-topic stories appear on a daily page or the Overview under that choice
- [x] GLOSSARY.md and AGENTS.md describe where each topic is shown

## Comments

**Maintainer's choice (2026-10-26):** an "Also talked about" line on the Overview, for both `policy` and `other` stories.

Built: `selectTalkedAbout` (spotted/pool.ts) takes the stories routed to a topic with no page, per source the top `TALKED_ABOUT_PER_SOURCE` (hn 3, lobsters 1, devto 1) with at least `TALKED_ABOUT_MIN_POINTS` (hn 50, lobsters 10, devto 20), the Spotted age and contest rules, and no link a Spotted row took. `main()` writes them to `talked-about.json` (with the source's count label) and marks them shown; `index.html` renders the list between the highlights and Coming up, heading from the manifest (`TALKED_ABOUT`). On the 10-26 pool it picks "No signs of AI payoff outside the tech sector", the 514-point jobs story and the PHP RCE (test `ticket 14 replay`). Not built: Telegram and Teams do not carry the list. The Overview was the choice, and the notify messages are capped in size.
