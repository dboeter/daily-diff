# 01: EDPB and Congress.gov have returned nothing since 2026-10-28

Status: ready-for-agent
Findings: 4 [medium], see `../review.md`

## Problem

- EDPB: `[policy] EDPB failed: Error: HTTP 503` on 11-07 and 11-08, quiet warning since 10-28.
- Congress.gov: `0 items` on 11-04 and 11-07, `TimeoutError` on 11-08, quiet warning since 10-28.
- Open States: one `HTTP 502` on 11-04, not retried.
- AI Policy kept 0 of 132 (11-04) and 0 of 138 (11-08) and had no US item on 11-07. Whether the dead sources explain that is unverified.

Not a bug: Internetconsultatie logs "32 open consultations" then "0 items" because `keywordHit` kept none (`src/policy/internetconsultatie.ts`). Its quiet warning is true but not actionable.

## What to build

- [ ] Find why EDPB answers 503 on CI (a blocked runner IP like digital-strategy, or a moved feed); check locally and from Actions
- [ ] Find why Congress.gov returns nothing: query, key (`USA_GOV_API_KEY`), or a real quiet spell
- [ ] Decide whether a transient 5xx on a policy source gets one retry (`githubGet` retries, `fetchOk` does not)
- [ ] Internetconsultatie: a source that listed items and kept none should not count as quiet

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: EDPB still answers `HTTP 503` on both days. Congress.gov and Internetconsultatie give `0 items`, and all three have the quiet warning since 10-28. New on 11-10: digital-strategy.ec.europa.eu answered `HTTP 429` to 9 Commission mail redirects (the items stayed, under their redirect links). New on 11-09: the GitHub Trending page answered `HTTP 504` and was not retried, so the star gains came from the snapshot only. That fetch belongs to the retry decision above, though it is not a policy source.
