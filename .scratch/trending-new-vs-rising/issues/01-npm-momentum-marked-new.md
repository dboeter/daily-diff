# npm momentum earns 🆕; only New items should

Status: resolved

## Problem

`GLOSSARY.md` separates **New** (first appeared in the ecosystem recently, 🆕) from **Rising** (an existing item whose usage jumped). The Radar rows in `src/trending-rank.ts` mix them:

- GitHub repo: `isNew` = created within `NEW_REPO_DAYS` (14) — New. Correct.
- OpenRouter app (`:416`): `isNew` = listed within `NEW_LISTING_DAYS` (14) — New — **or** ranked this week but not this month — that is momentum, i.e. Rising, for an app that may be years old.
- npm package (`:429`): `isNew` = `momentumRatio(p) >= NPM_NEW_MIN_RATIO` — Rising, not New. A five-year-old package qualifies.

`isNew` is not only a label: it orders the Radar (🆕 first), and caps it (at most 8 of 12 rows, 20 of the 30-row merge pool). So Rising items currently take New slots.

## Desired behavior

- 🆕 / `isNew` only for New: GitHub repos by creation date, OpenRouter apps by listing date, npm packages by first-publish date if the registry search response carries one (check before relying on it; otherwise npm rows are never New).
- Rising items are not marked 🆕. Whether the Radar shows Rising some other way (its own marker, or only via the signal cell `12k/week, 3.1x`) is a decision to make when picking this up.
- Revisit the 🆕 caps and Radar order once Rising rows no longer count toward them.

## Notes

- Rename `NPM_NEW_MIN_RATIO` to match (e.g. `NPM_RISING_MIN_RATIO`); grep for the old name.
- Update the Trending bullets in AGENTS.md and the Radar paragraph in README.md that describe 🆕 and the Radar order.
- Tests in `src/__tests__/` for `buildRadarCandidates` / `selectTrendingReport`.

## Comments

- 2026-10-20, the maintainer's decision: 🆕 is New only; Rising gets no marker (everything in the report is supposed to be rising); a new 🔥 marks Trending, an item in the top two weeks in a row or more. "In the top" is read as "in the report" (Radar or category tables); say so if it should be narrower. Done: OpenRouter apps are 🆕 by listing date only and npm rows never (the registry search has no first-publish date; `NPM_NEW_MIN_RATIO` deleted). The caps and Radar order are unchanged: ~45 new GitHub repos a week still justify them. 🔥 reads the report keys saved in `digests/trending-state.json` (`reported`) from exactly 7 days back, seeded for 2026-10-19, so it can first show on 2026-10-26. Seed caveat: a merged Radar row contributed only its lead member's key (the others are not recoverable from the report), so if a merge's lead changes on 2026-10-26 that row misses 🔥 once. The prose prompt explains both markers.
