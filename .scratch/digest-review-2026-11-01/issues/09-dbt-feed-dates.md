# 09: dbt Labs blog feed may refresh post dates

Status: needs-info
Findings: 9 [low], see `../review.md`

## Problem

`[community] dbt Labs blog: 25 items, 25 in the last 7 days`; 19 getdbt posts were also in the 10-31 trace. If the feed refreshes dates, old posts pass `recentNewsItems` and could become news (3 getdbt posts are dbt Core News on 11-01; they were not shown before, so no repeat yet). Unverified: the trace stores no post date.

- [ ] Fetch the feed and compare `pubDate`/`updated` with the posts' own pages
