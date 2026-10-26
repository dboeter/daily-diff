# 11: Cap-cut stories stay eligible; news matching reads title and description

Status: done
Blocked by: 10
Findings: X4, S4 — see `../review.md`

## What to build

A story cut only by the per-source cap gets another chance the next day, and a story about a Tracked Project is matched even when only its description names the project. On 2026-10-25 a Dev.to story about OpenShell (agents 0.99) was cut by the cap, then left the fresh pool, and surfaced only in the weekly Most discussed while the agents page called OpenShell quiet.

- [x] Whether project-news matching reads only the title is established and recorded
- [x] Matching considers title and description
- [x] A story cut by the cap (not by a threshold) stays eligible on the next run
- [x] A test covers a description-only project mention

## Comments

Established: `collectNewsItems` matched community stories on the title only (`text: s.title`); now title and description, and `NewsItem.description` reaches the repo prompt so the model can see the project is the subject. The OpenShell story (devto:4904813) was not dropped by freshness: Dev.to's 2-day popular window stopped returning it on 10-26 (`lastSeen` 10-25). So a cap-cut story is now logged as `cut` and `carriedStories` rebuilds it from the log into the next day's pool when no source returns it; a story cut again carries again until it is shown or older than `SPOTTED_MAX_AGE_DAYS` (first-seen date stands in for publish date). Tests: `cap-cut stories stay eligible` (pool.test), `matchProjectNews reads the description` (project-news.test).
