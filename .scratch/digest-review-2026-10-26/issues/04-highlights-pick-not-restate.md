# 04: Highlights pick, they don't restate

Status: ready-for-agent
Blocked by: 03
Findings: S3, X5, M6, M7, D5, T10 — see `../review.md`

## What to build

A page's `## Highlights` ranks a few items instead of restating its table, and the day's Highlights (Overview, Telegram, Teams) lead with what each page leads with. On 2026-10-26 the models page gave five bullets for five Spotted rows, ai-data highlighted its weakest vendor note, and the Trends Highlights skipped the page's two lead bullets for star growth on small repos.

- [ ] A page's Highlights hold at most 3 bullets, ranked by relevance to a data/AI engineer
- [ ] A vendor item with low significance or low confidence does not get a Highlight
- [ ] A page with no lab or model news says so instead of padding with Spotted rows
- [ ] Each page's Highlights entry includes that page's first bullet
- [ ] One subject per bullet; bullets keep their window ("this week")
