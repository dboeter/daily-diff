# npm momentum earns 🆕; only New items should

Status: needs-triage

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
