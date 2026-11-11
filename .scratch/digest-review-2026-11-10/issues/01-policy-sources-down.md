# 01: EDPB and Congress.gov have returned nothing since 2026-10-28

Status: done
Findings: 4 [medium], see `../review.md`

## Problem

- EDPB: `[policy] EDPB failed: Error: HTTP 503` on 11-07 and 11-08, quiet warning since 10-28.
- Congress.gov: `0 items` on 11-04 and 11-07, `TimeoutError` on 11-08, quiet warning since 10-28.
- Open States: one `HTTP 502` on 11-04, not retried.
- AI Policy kept 0 of 132 (11-04) and 0 of 138 (11-08) and had no US item on 11-07. Whether the dead sources explain that is unverified.

Not a bug: Internetconsultatie logs "32 open consultations" then "0 items" because `keywordHit` kept none (`src/policy/internetconsultatie.ts`). Its quiet warning is true but not actionable.

## What to build

- [x] Find why EDPB answers 503 on CI (a blocked runner IP like digital-strategy, or a moved feed); check locally and from Actions
- [x] Find why Congress.gov returns nothing: query, key (`USA_GOV_API_KEY`), or a real quiet spell
- [x] Decide whether a transient 5xx on a policy source gets one retry (`githubGet` retries, `fetchOk` does not)
- [x] Internetconsultatie: a source that listed items and kept none should not count as quiet

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: EDPB still answers `HTTP 503` on both days. Congress.gov and Internetconsultatie give `0 items`, and all three have the quiet warning since 10-28. New on 11-10: digital-strategy.ec.europa.eu answered `HTTP 429` to 9 Commission mail redirects (the items stayed, under their redirect links). New on 11-09: the GitHub Trending page answered `HTTP 504` and was not retried, so the star gains came from the snapshot only. That fetch belongs to the retry decision above, though it is not a policy source.
- 2026-11-11: worked.
  - **EDPB**: the feed address `/feed/news_en` answers `HTTP 503` from a home network too, with the project's User-Agent and a browser's. It is a dead address, not a blocked runner. `https://www.edpb.europa.eu/rss.xml_en` answers RSS with 10 items; the project's feed reader parses it (3 items within the news age limit on 11-11). `config.yml` now uses it. Not checked from Actions: the first scheduled run shows it.
  - **Congress.gov**: not broken. The same query with the public `DEMO_KEY` listed 1,120 bills updated in 7 days, 43 with a new action, none of them AI-titled (my own keyword list, not `keywordHit`). No item is the usual answer for this source. The `TimeoutError` of 11-08 was one failed request.
  - **Retry**: `fetchOk` tries a GET once more after a 502, 503, 504 or a timeout, 2 seconds later, and logs `[http] <host>: HTTP 503, retrying once`. The GitHub Trending scrape now goes through `fetchOk` too.
  - **Quiet warning**: a source that kept no item of the entries it listed is not quiet. Internetconsultatie and Congress.gov report their list length (`PolicySourceContext.listed`). A failed fetch, or an empty list, still counts as quiet.
  - Not done: the `HTTP 429` of digital-strategy.ec.europa.eu on 9 Commission mail redirects (11-10). A retry 2 seconds later does not fit a rate limit.
