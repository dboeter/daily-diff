# 15: Trends tables are correct and self-explaining

Status: done
Blocked by: 01
Findings: T3, T4, T5, T11, T12, T13, T15, T19, T20, A8, S8 — see `../review.md`

## What to build

Every figure on the Trends page is right, has its window and is explained, and every row says something. On 2026-10-26 the category tables were not sorted by 7-day gain as AGENTS.md says and skipped larger gainers, "round out the top five" named six models, growth figures did not reconcile with last week, a Radar row linked `birdstrike.local`, 6 of 11 Radar rows had no description, Hugging Face rows repeated last week unmarked and printed `model_type` tags, and the agents page showed a weekly "+5,921 stars" as if daily.

- [x] Category rows sort by displayed 7-day gain, or AGENTS.md states the real order; the trace says why a large gainer is absent
- [x] Ranks, "top N" and "newcomer" are computed in code, not by the model
- [x] The Radar has a one-line legend (🔥, 🆕, inclusion rule, units, "vs previous week"), and its growth figures reconcile with the previous Weekly Digest
- [x] Every figure carries its window, on Trends and wherever a Trending gain appears on a daily page
- [x] `.local` and `localhost` links are rejected; an empty Lang cell shows "—"
- [x] A 🆕 row with neither description nor usage is dropped; a row without summary falls back to the repo or site description and cannot be a Highlight
- [x] Hugging Face rows get the repeat marker, one row per release (no uncensored variants), a rank, and a summary built from pipeline tag, size and license only (no card text: the prompt has none), never `model_type` (code done and tested; summary wording not verified: needs live LLM run)
- [x] OpenRouter usage links on model names instead of bare "link"

## Comments

- Category order: `interleaveGains` picks up to 8 rows alternating absolute and relative gain (why Lody +130 beat knowledge-work-plugins +2,790); the picked rows now show by displayed gain, and AGENTS.md states the pick rule. `dropped_reason: cap` was already in the trace code; the 2026-10-26 trace predates it (no `rendered`/`dropped_reason` fields).
- OpenRouter usage is now a code table (rank, linked model, tokens), no LLM: the rankings snapshot is one day's tokens (`OpenRouterModel.tokens`), so the old bullets showed daily figures with no window. "Newcomers" is gone, not computed: the rankings carry no creation date.
- Windows: the agents page's Trending detail says "this week" or "today" by the scrape's `period` (the Monday run scrapes `since=weekly`, so 10-26's +5,921 was weekly). npm signal says "downloads/week"; the legend gives each source's units and windows.
- Reconcile: 📈 is OpenRouter's own growth figure and the npm ratio is this week against the 30-day average week; neither is "vs the previous Trends page". Making them reconcile means saving last week's values (like `trending-state.json`) and computing the change in code: a design decision.
- 🆕 OpenRouter apps with no description, rank or tokens are dropped (HunterSwarm-style rows). Fetching a site meta description and keeping a summary-less row out of Highlights are not done.
- Hugging Face: uncensored/abliterated re-uploads are dropped in code, tags (the `model_type` source) are no longer in the prompt, and the table asks for a `#` column. Not done: the 🔥 repeat marker and base/GGUF grouping into one row per release.

**Review (2026-10-26):** ranks are code-written for OpenRouter usage (`renderOpenRouterUsage`) only. The Hugging Face table's `#` column is still model-written (`buildTrendsModelsPrompt` asks for "the model's number from the input"), and "newcomer" was removed from the output rather than computed. Box unticked.

**Remaining boxes (2026-10-26, second pass):**

- Reconcile (decision 1): `digests/trending-state.json` gains `figures` (date → shown Radar row key → OpenRouter tokens or npm downloads in the last 7 days). An OpenRouter or npm Signal shows ` (+28% vs previous week)` against the figure saved by the run dated exactly 7 days earlier (`lastWeekFigures`, the `lastWeekKeys` rule); none without one. OpenRouter's own 📈 and the npm 30-day ratio are gone from the Signal (their baselines were the T15 mismatch); the legend says what "vs previous week" compares. Tests: `shows each figure against the one last week's page saved` replays T15's 10-19 → 10-26 figures (Claude Code 9.92T → 12.67T = +28%, @reason-machines/cli 22,777 → 30,245 = +33%), and `shows Radar figures vs last week's saved ones and saves …` covers compose.
- Newcomer (decision 2): `modelRanking` (date → OpenRouter usage slugs) in the same state; with last week's ranking the usage table gets a Last week column (its rank, or "new"). Not 🆕: GLOSSARY defines 🆕 as newly created or listed, and entering the top list is not that. The Hugging Face `#` is code-written (`renderHfTable`).
- Hugging Face (decision 3): code table `renderHfTable`: `#` = place in the Hub's likes-in-7-days order, 🔥 by `hf:<id>` keys saved in `reported`, `hfReleaseRows` folds quantised copies (name = original + segments with a format token: GGUF, FP8, AWQ, …) into the original's row with their links and drops uncensored re-uploads; on the frozen 2026-10-26 list (`fixtures/hf-2026-10-26.json`) 15 rows become 11 (DeepSeek-1017 + ISTA GGUF, flint + unsloth GGUF). Windows: "Likes (total)", "Downloads (30 days)": the API's `downloads` for openai-community/gpt2 was 21.8M against `downloadsAllTime` 951M (curl, 2026-10-26). The fetch now also asks for `safetensors`, so the summary prompt gets task, parameter count and license, no tags; a failed call shows task and size.
- No-summary rows (decision 4): an OpenRouter app without a description borrows its GitHub repo's description from the trending/search rows (DeepSeek Harness on 10-26); no new fetch, so an app whose only text would be its website's meta description (Strix) still shows "—". Such rows, and Hugging Face rows with neither summary nor task/size, are named to the prose call as "no Highlight" (`unsummarizedRows`, mirroring the data report's `minor` list).
- First effect: 2026-10-26 saved no figures, ranking or `hf:` keys, so the 2026-11-02 run shows no "vs previous week", no Last week column and no Hugging Face 🔥; they start on 2026-11-09. Hugging Face 🔥 keys are saved only when the trending ranking succeeded (the state is written from `report.nextStarHistory`).
- HF box unticked: the summary wording comes from a live LLM call, not run here.

**Branch review fixes (2026-10-26):**

- Hugging Face folding: `isVariantOf` now folds a copy only when every segment its name adds is a format token (GSQ and RCO added for the ISTA DeepSeek copy), so `unsloth/Qwen3.6-35B-A3B-GGUF` stays its own row next to `Qwen/Qwen3.6` (test: `keeps a copy of a different size apart from the release its name extends`). The 2026-10-26 list still gives 11 rows.
- Hugging Face fetch: the `expand[]` request returns `pipeline_tag` and `safetensors.total` (curl, 2026-10-26: DeepSeek-V4.1-Flash-1017 image-text-to-text, 763205315794); `toHfModel` reads both. Fixture `fixtures/hf-api-2026-10-26.json` is that raw response (2 models); `hf-2026-10-26.json` was hand-built with empty task and size.
- Hugging Face "—": a row the model left `N: —` shows its task and size (`hfSummaryText`); only a row with neither stays "—" and is named "no Highlight". The call's llm-trace label is `trends-hf-summaries`.
- OpenRouter "new": checked, no change. `modelRanking` saves every slug the rankings page returns (19 on the 2026-10-25 snapshot) and `renderOpenRouterUsage` renders every one, so the table has no cutoff of its own and "new" already means not ranked last week (pinned by rank.test's compose test on `nextStarHistory.modelRanking`).

**Live HF summary check (2026-10-26):** box ticked. `buildHfSummariesPrompt` over `numberRows(hfReleaseRows(…))` of the frozen 2026-10-26 list, `callLlm`, `parseRowSummaries`, `renderHfTable` (script `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/check.mts`), workflow OpenRouter settings, answered by the fallback `nvidia/nemotron-3-ultra-550b-a55b:free`.

- Run 1 (`/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/hf-run1.table.md`): `hf-2026-10-26.json` has no task or size, and `hf-api-2026-10-26.json` covers only 2 rows, so 9 of 11 rows went in as `task: unknown` and came back `—` (as the prompt asks). It did not test the T13 rows.
- Run 2 (`/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/hf-run2-live.table.md`, prompt `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/hf-run2-live.prompt.txt`): the frozen likes and downloads, with task, size and license from the Hub API per id (curl, saved in `/tmp/claude-1000/-home-daanb-daily-diff/17511462-fc0b-4e67-8c0b-3c7720ab573d/scratchpad/llm-check/hfapi/`). Every row got a summary from task and size, e.g. `9: 28B image-text-to-text model for visual question answering and multimodal dialogue.`, `4: 4.1B text-generation model for lightweight language generation.`, `7: 220B image-text-to-text model for efficient multimodal reasoning.` No row names a `model_type`, base model or family (T13's "Qwen 3.5", "Spark 2.5", "MiniMax M3 VL" and "tagged as flint" are gone), and no figure was invented.
- Not perfect: some rows add use or quality words their input does not give ("image editing and style transfer" for flux-3-image-klein-comfy, "high-quality", "sophisticated", "efficient"). "Card text" is not a prompt input: the prompt sends task, parameters and license only. `formatParameters` rounds Qwen3.8-27B's 27.78B to "28B", which contradicts the name's 27B.
- Follow-up to the live check: `buildHfSummariesPrompt` now says the input is task, size, license and name only, with no model card, and forbids uses the task does not name and quality or speed words; `formatParameters` shows the size the name states (Qwen3.8-27B → 27B) and otherwise rounds down (tests: `formatParameters`, `buildHfSummariesPrompt`).
