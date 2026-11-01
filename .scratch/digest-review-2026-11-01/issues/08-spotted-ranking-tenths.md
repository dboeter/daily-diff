# 08: Topic probability outranks points too strongly in Spotted

Status: ready-for-agent
Findings: 8 [low], see `../review.md`

## Problem

Spotted ranks each source by topic probability in tenths, then points. Models 2026-11-01: "Very Intentional: Steve Eisman Thinks Anthropic Is Hiding Something" (7 pts, 1 comment, finance, no description, models 0.81) shown; "The Impact of Generative AI on Critical Thinking" (75 pts, 53 comments, research 0.62) cut on `cap`. Made worse by #04 (three rows for one story).

## Comments

### Decision (2026-11-01)

Over the 0.6 topic bar, rank by points per source; topic probability breaks ties only.
