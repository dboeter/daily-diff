# 07: A much-discussed policy story reaches the Overview

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: M4 [medium] (regression of ticket 14 of the 2026-10-26 round); lows L1, L2 — see `../review.md`, `../ai-models-policy.md`

## What to build

Ticket 14 promised that policy-topic stories appear on a daily page or the Overview. On 2026-10-28 two did not appear anywhere: "Anthropic trained Claude on illegally obtained Stanford professors' books" (Jev policy 0.95, 323 points, a $1.5B settlement) and "Police are using AI to pull over drivers for 'suspicious' behavior" (policy 0.69, 279 points). Three `other` essays on AI and work (605, 542, 402 points) took HN's three "Also talked about" slots. Two lows ride along: the Dev.to slot went to an episode of a fiction serial (L1), and "Is my data used for model training?" (205 points), split models 0.40 / policy 0.35, fell under every floor (L2).

Decision needed from the maintainer: how policy competes with `other`. Options: (a) one HN slot reserved for the top policy story that clears `TALKED_ABOUT_MIN_POINTS` (recommended: smallest change, keeps the list at 3); (b) a separate "Policy talk" line on the Overview; (c) rank by topic before points, as Spotted does.

- [ ] The maintainer's choice is recorded in this ticket's Comments
- [ ] With 10-28's data, the Stanford-books story appears on the Overview
- [ ] A story whose topic probabilities split under the Spotted floor but whose two leading topics are both page-less or both kept is not lost (decide with L2 in view, or record it as accepted)
- [ ] AGENTS.md "Community and Spotted" and GLOSSARY.md describe the rule

## Comments

From the review: `selectTalkedAbout` (`src/spotted/pool.ts:447-461`) sorts every no-page story by points; `TALKED_ABOUT_PER_SOURCE = { hn: 3, lobsters: 1, devto: 1 }` and `TALKED_ABOUT_MIN_POINTS = { hn: 50, lobsters: 10, devto: 20 }` (`:417-422`).

**Maintainer decision (2026-10-28): option (b), a separate policy line.** Policy-topic stories get their own selection (their own per-source slots and points floor, not competing with `other`), keep their `topic` in `talked-about.json`, and the Overview (`index.html`) renders them as a separate list next to "Also talked about". Telegram and Teams are unchanged unless they already read `talked-about.json`.
