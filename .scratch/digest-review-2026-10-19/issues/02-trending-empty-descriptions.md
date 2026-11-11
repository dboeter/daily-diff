# Trending: repos without a usable description take category slots

Status: resolved

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

## Comments

- 2026-10-19: option 1, in code. A repo with an empty description no longer reaches the category tables (`selectTrendingReport`), and `reachesReport` skips it too, so no star-history call is spent on it. Jev still classifies it, and the description-hash fingerprint asks again once a description appears. Checked the three repos (`gh api`): only harness-mix is empty; copperhead says "Hardware as fast as software." and Baize has a real description, so a word-count gate would also drop genuine short descriptions. Copperhead as a coding agent is a Jev verdict to pin by hand in `digests/trending-classifications.json` if it keeps showing.
- 2026-10-19 (follow-up): copperhead pinned `out_of_scope` in `digests/trending-classifications.json`: its README calls it "Cursor for circuit boards", an AI agent that designs PCBs in KiCad, not an AI coding or agent-harness tool. To undo, set the choice back to `coding_agent` or delete the entry.
