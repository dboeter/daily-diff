# Trending classification through `judgeItems`

Status: resolved
Type: task
Blocked by: none

## Problem

The trending classification cache is a hand-written copy of `judgeItems` (`src/jev.ts:193`). It has the same cycle: reuse a saved entry unless it is stale or invalid, ask the rest, fall back when Jev fails too often, mark items seen, prune unseen ones, and keep hand edits by spreading entries instead of rebuilding them. It is implemented by:

- `cachedClassifications`, `nextClassifyCache` and `classifyItems` (`src/trending-jev.ts:258`, `:676`, `:710`);
- the wiring in `composeTrendingReport` (`src/trending.ts:476`): saved → asked → `byJev` → fallback.

A rule change (pruning, invalid-entry handling, model tracking) lands in two places. The `classification cache` block of `trending-jev.test.ts` (line 443) tests the same behaviour as `jev.test.ts`.

## Solution

Replace those three functions with one `judgeItems` call; keep the trending-specific parts:

- `CLASSIFY_QUESTIONS` and `classifyState` (the request);
- the validation in `classifyItem`, moved into `decide`;
- `fallbackClassification` and `isTaggedAgentApp` (applied before `judgeItems`);
- `buildTrendingRankingFile`, which also traces the Cross-source Matches. `judgeItems.rankingFile` has no `matches` section, so it isn't used here.

Mismatches to resolve, one line each in the implementation:

1. **The cache holds decisions, not answers.** Migrate `digests/trending-classifications.json` once:

   | Old field    | New field                            |
   | ------------ | ------------------------------------ |
   | `name`       | `title`                              |
   | `category`   | `answers.category.choice`            |
   | `standalone` | `answers.standalone_tool.noul`       |
   | `desc`       | the fingerprint field (see 2)        |
   | other fields | kept: `decided`, `model`, `lastSeen` |

   `standalone` may be `null` on a hand-added entry: the migration writes `noul: null` and `decide` accepts it.

   A script in `scripts/` run once and committed with the migrated file, or a read-time shim in `loadClassifyCache`. Proposed: the script; no shim to keep around.

2. **Pinning is inverted.** Trending treats an entry without `desc` as pinned, never asked again ("to fix a verdict, edit it and delete `desc`"). `judgeItems` asks again when the saved `stage` differs from `stage(item)`, and an absent one differs, which Policy Watch needs. Generalise `stage` to a fingerprint hook plus one of:
   - an option "absent fingerprint = keep", or
   - an explicit `pinned: true` field on the entry, honoured for every cache.

   The second also gives Policy Watch and the data report a way to pin a hand-fixed verdict.

3. **No relevance.** `D extends { relevance: number }` doesn't fit a classification. Relax it; `traceFields` writes `relevance` only when present.
4. **Keys.** `judgeItems` keys on `item.id`. Use `id = normKey(key)` (lowercased GitHub keys), and `title` from `itemText`.
5. **Tagged apps** never reach `judgeItems`, so their old entries stop getting `lastSeen` bumps and are pruned after 180 days. Acceptable: the tag decides those apps anyway.
6. **Jev down.** `judgeItems` saves the answers that did arrive even when more than half failed; trending saves nothing today. A benign change; note it in AGENTS.md.
7. **Item set.** `composeTrendingReport` classifies `firstItems`, but writes the cache from the post-gain `items` (`trending.ts:535`). `judgeItems` builds `nextCache` from what it was given. Check that both lists hold the same keys (gains re-rank rows, they don't add or drop any). If they don't, mark the missing ones seen explicitly.
8. **`classifiedBy`.** A run decided entirely from the cache without a key is `"topics"` today (`byJev` is null); `judgeItems` returns `"jev"` when nothing had to be asked, the fix Policy Watch got in `4c1063f`. Wanted, but visible in the `trending-ranking.json` header and the report meta.
9. **Trace `models`.** `cachedClassifications` copies a saved entry's `model` into the classification, so today's trace header lists cached models too; `judgeItems` carries `model` on fresh verdicts only. The header shrinks to this run's models, as in Policy Watch's trace.

## Open decisions (settle before implementing)

- Pinning (item 2): the absent-fingerprint option or an explicit `pinned` field.
- Migration (item 1): a script or a read-time shim.

## Scope

- In: `src/jev.ts` (fingerprint hook, relaxed `D`, pinning), `src/trending-jev.ts`, `src/trending.ts` (`composeTrendingReport`'s classification block), `digests/trending-classifications.json` (migrated), `src/__tests__/trending-jev.test.ts`, `src/__tests__/jev.test.ts`; `src/policy-jev.ts` and `src/data-jev.ts` only for the `stage` → fingerprint rename.
- Out: Cross-source Matching (`trending-matches.json`, `matchApps`), the categories and questions, the 180-day window.
- Docs: the AGENTS.md trending bullet on `trending-classifications.json`, including the hand-edit instructions ("To fix a verdict…"), and the `jev.ts` and `trending-jev.ts` rows.

Estimate: ~+40 / −120 lines in src, a one-off script (~40 lines), the migrated JSON, tests. 6 files plus the data file.

## Done when

- `cachedClassifications`, `nextClassifyCache` and `classifyItems` are gone (`grep` finds them nowhere in `src/` or `scripts/`).
- The migrated cache, loaded by the new code, gives the same `category`/`standalone` for every entry as before. A test runs this over a fixture copy of ~10 real entries, including one without `desc`.
- `composeTrendingReport` tests (`trending-jev.test.ts:580`) pass without changes to their assertions.
- The `classification cache` describe block shrinks to the trending-specific cases (description change asks again, pinned entry not asked again, tagged app beats a saved verdict). The generic cases (prune, hand-edit spread, invalid entry asked again) live in `jev.test.ts`.

## Comments
