# 10: Fetched stories that matter lose the selection

Status: needs-triage
Findings: 12 [high], see `../review.md`

## Problem

On 2026-11-09 and 11-10 the reviewers found stories the digest fetched and did not show, while weaker rows were shown. The traces of those days give the reason for each:

- Fireworks AI breach (11-10, high): three Hacker News submissions of one event, none shown. "Fireworks AI Hacked" (Bloomberg) was routed to models at 0.70 and cut by the Hacker News row cap (`cap`). The Forbes copy was routed to models at 0.46, under `SPOTTED_MIN_TOPIC_PROBABILITY` (`threshold`). The Tell HN about Notion AI went to `other` (`routing`). The cap ranks each submission by its own points, so an event split over three submissions ranks lower than it would as one.
- "Claude Fable 5.2 launch offers" (11-10): models at 0.97, cut by the cap. Eight Hacker News stories at 0.66 or more were cut by the cap on the models page that day.
- Google TPU 8tx and 8i Max (11-10): two submissions. One was routed to models at 0.50 and listed on the Overview under "Also talked about". The other was routed to agents at 0.48 (`threshold`).
- AI Policy, US and Dutch items under the keep bar (`threshold`): "GOP bucks Trump on Nvidia" (Politico US, relevance 0.344, 11-10), "Local data center fights are fueling a wider backlash" (Politico US, 0.144, 11-09), "Mooi dat onze overheid achterloopt met AI" (Binnenlands Bestuur, 0.371, an opinion piece, 11-09). The FDA final rule on an AI cytology device (Federal Register, 11-10) has relevance 0.754 and is still `threshold`: US items also need an impact on the reader. The US had one row on 11-10 and none on 11-09; the Netherlands had none on 11-09.

Related: issue 08 covers news no source fetches, and its last item asks the same question for two lab posts.

## Decide

- [ ] Same event, several submissions: rank the event once, by its best or summed points, before the row cap (Jev's same-event check already groups them after selection)
- [ ] The Hacker News cap of 6 rows a page on a launch day: keep it, or let it grow with the number of stories over the topic bar
- [ ] AI Policy: replay the four dropped items in the Jev lab (`scripts/jev-lab.ts`) and decide whether a jurisdiction with no kept item takes its best item near the bar, as a data section does
- [ ] Review repo: a story the Overview lists ("Also talked about", `talked-about.json`) counts as shown. `scripts/collect.sh` and `scripts/candidates.py` do not read that file, so the TPU story reads as `excluded`

## Comments
