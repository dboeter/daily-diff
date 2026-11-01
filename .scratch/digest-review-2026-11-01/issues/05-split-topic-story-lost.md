# 05: A highly discussed story with a split topic lands nowhere

Status: done
Findings: 5 [medium], see `../review.md`

## Problem

"Do the math: How we took over ChatGPT accounts" (hn:50314699, 315 pts, 157 comments): Jev topic research 0.43, other 0.31, models 0.23. Under `SPOTTED_MIN_TOPIC_PROBABILITY` (0.6) → `threshold`; top topic is not `other`, so not eligible for "Also talked about" either. Same fate: "AI, Lean, and the Future of Formal Verification" (195 pts, agents 0.54, seen since 10-30), "AI startup hacks Anthropic" (74, models 0.54), "Some Thing is Happening" (66, models 0.51).

## Open questions

- Route a below-bar story with talked-about points to "Also talked about" whatever its top topic?
- Or lower the topic bar when points are high?
- Does Trends' Most discussed pick it up on Monday (it needs a topic other than `other`)?

## Comments

### Decision (2026-11-01)

A story that misses the Spotted topic bar but clears `TALKED_ABOUT_MIN_POINTS` goes to Also talked about, whatever its top topic.

### Done

Cause: `selectTalkedAbout` took only stories routed to no page, so a story on a page's topic under `SPOTTED_MIN_TOPIC_PROBABILITY` fell through both lists. Now such a story (with a Jev probability) joins the "Also talked about" lane with topic `other`, under the same points floor and per-source cap; policy talk still claims first (`src/spotted/pool.ts`, `probabilityOf` passed from `src/index.ts`). Its trace row reads `talked_about: true`. AGENTS.md's talked-about sentence updated. Test: "issue 05: a story under the Spotted topic bar with talked-about points is Also talked about".
