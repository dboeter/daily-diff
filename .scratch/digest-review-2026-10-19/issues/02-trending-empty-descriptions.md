# Trending: repos without a usable description take category slots

Status: needs-triage

## Problem

On 2026-10-19 several category-table rows had nothing to summarize, and the model padded:

- `emo-xiaoyu/harness-mix`: "is a TypeScript project."
- `copperheadhq/copperhead`: "a TypeScript project asserting that hardware can be as fast as software" (Coding Agents)
- `Xu123-Bob/Baize`: "inspired by an ancient Chinese divine beast"

Each holds one of 8 slots in its category that a describable repo could fill. Jev classified them from little or no text.

## Options

- An empty or placeholder description keeps a repo out of the category tables (the Radar already needs `standalone_tool`).
- Or ask Jev only when the description has some minimum content, else fall back to the topic label.

## Where

`selectTrendingReport` (`src/trending/rank.ts`), `classifyTrendingItems` (`src/trending/jev.ts`).
