# 09: GLOSSARY says page-topic stories never reach "Also talked about"

Status: done
Findings: 11 [low], see `../review.md`

## Problem

`GLOSSARY.md`, "Also talked about": "Agents, models, research and data stories go to a page's Spotted instead." `AGENTS.md` (Community and Spotted) and the code also list stories under the Spotted topic bar there, whatever their topic, as topic `other`. On 2026-11-04 "Google will turn off search for schools that reject AI" (590 points, models at 0.3) and a data story did so, and the reviewers filed both as routing bugs.

## What to build

- [x] Bring the glossary entry in line with `AGENTS.md`
- [x] Decide whether `talked-about.json` should carry the story's routed topic instead of `other` (the trace says `models`, the file says `other`)

## Comments

- 2026-11-11: the glossary entry now says that a story under the Spotted topic bar is listed too, whatever its topic, as topic `other`. Open: whether `talked-about.json` should carry the routed topic, a decision, hence `needs-triage`.
- 2026-11-14: the maintainer chose the routed topic. A `talked-about.json` row now carries the topic Jev routed the story to (`selectTalkedAbout`, `src/spotted/pool.ts`), so the file and the trace agree; a story under the topic bar is still in the "Also talked about" list. The web UI splits on `policy` or not, so the Overview is unchanged. GLOSSARY and AGENTS.md updated.
