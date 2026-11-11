# 09: dbt Labs blog feed may refresh post dates

Status: wontfix
Findings: 9 [low], see `../review.md`

## Problem

`[community] dbt Labs blog: 25 items, 25 in the last 7 days`; 19 getdbt posts were also in the 10-31 trace. If the feed refreshes dates, old posts pass `recentNewsItems` and could become news (3 getdbt posts are dbt Core News on 11-01; they were not shown before, so no repeat yet). Unverified: the trace stores no post date.

- [ ] Fetch the feed and compare `pubDate`/`updated` with the posts' own pages

## Comments

### Decision (2026-11-01)

Checked: the feed dates 25 posts 2026-10-27 and their pages' datePublished says 10-27 too (ramp-internal-ai-agents-million-sessions, virgin-media-o2-dbt-state-compute-costs): a site-wide republish, not a feed bug. They leave the 7-day window on 11-03.
