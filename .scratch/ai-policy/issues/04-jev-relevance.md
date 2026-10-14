# Jev relevance scoring with a verdict cache

Status: needs-triage
Blocked by: 03

## Scope

- Score every candidate item with Jev (`src/jev.ts`: `askJev`, `mapJev`): about AI policy? binding or not? a new stage or routine? significance 0–2; for US items, expected impact on the reader profile (`config.yml`), direct or indirect, 0–2. See `../spec.md` Decisions for the profile and the "don't lean on one sector" rule.
- Weigh the answers in code into a keep/drop decision and an order (like `relevanceOf` in `src/arxiv.ts`).
- Cache verdicts per item id (like `digests/trending-classifications.json`), so an item is asked once.
- Trace file `digests/YYYY-MM-DD/policy-ranking.json` with the raw answers (not a report, not in `REPORT_FILES`).
- No `TYPESAFE_API_KEY`, or more than half the calls failing: watchlisted items and keyword hits only; low-volume feeds that rely on Jev (EDPB, AP) are dropped for that run rather than published unfiltered.

## Done when

Tests cover the weighting and the fallback; the digital-strategy feed from 03 goes through the scorer.
