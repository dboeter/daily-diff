# Review: ai-trends, edition 2026-10-28 (forced weekly)

Page: `digests/2026-10-28/ai-trends.md` (29,887 bytes). Traces: `trending-trace.json`, `arxiv-trace.json`, `llm-trace.json`. Compared by hand against `origin/main:digests/2026-10-26/ai-trends.md`.

### T1 [high] accuracy

- Location: Skills: PRs and requests this week › "Closed this week" (all 7 bullets) and "Takeaway"
- Problem: All 7 "Closed this week" PRs were closed without being merged, but every bullet describes the change as if it shipped: "#1961 – Hardens `skill-creator` eval viewer against script breakout, DNS rebinding, cross-site POST…", "#50 – Adds Golang support to `mcp-builder`…", "#765 – Adds `/audit` skill…". A reader would take #1961 as a security fix that landed. It did not. The Takeaway then calls the week "hardening the skill-creator toolchain (… security) … and refining skill specifications for deterministic agent behavior". The second half rests only on #2027 and #2038, two refactor PRs that were closed unmerged.
- Evidence: VERIFIED (`gh api repos/anthropics/skills/issues/<n>`: #1958, #1728, #1961, #2027, #765, #50 and #2038 are all `state: closed` with `pull_request.merged_at: null`, closed 2026-10-21..10-25)
- Likely cause: `src/reports/prompts.ts:388` tells the model "a closed PR may or may not have been merged: do not say which". `GitHubItem` (`src/core/github.ts:49`) carries `closed_at` and no `merged_at`, so neither code nor the model can tell a merge from a rejection. The issues API returns `pull_request.merged_at`, so the data is in the response the fetch already makes.

### T2 [medium] correctness: regression of ticket 04 (box "each page's Highlights entry includes that page's first bullet")

- Location: `digests/2026-10-28/highlights.json`: no `ai-trends` key. The page has three Highlights, and the 2026-10-26 edition had two ai-trends entries.
- Problem: The weekly page gets no line on the Overview, in Telegram or in Teams. The model left the key out, and code adds nothing back for Trends.
- Evidence: VERIFIED. (1) `llm-trace.json` shows the `highlights` call with outcome `ok` and 1,155 chars. The saved highlights.json serialised compactly (`json.dumps(…, separators=(',',':'))`) is exactly 1,155 chars, so the model's reply had no `ai-trends` key and code dropped nothing. (2) The prompt sees only each page's `## Highlights` (`highlightsInput` → `highlightsSection`, `src/reports/prompts-pages.ts:388-412`). For Trends those are a token-volume lead (DeepSeek, 35.37T), a star-gain bullet (security-audit-skill, +16,593 stars) and the PAUSE paper. (3) The same prompt says "Never include: … Raw counts: … stars …" (`:443-445`), "Generic trend statements ("X dominates" …)" (`:447`) and "Omit a report's key entirely when nothing in it qualifies" (`:454`). It also requires "A report's first highlight covers the first bullet" (`:456`), and Trends' first bullet is a figure the ban excludes. (4) `forcedHighlightReports` (`:474`) forces only ai-policy and ai-data, so `withFallbackHighlights` (`:555`) adds no fallback for ai-trends. Why 10-26 differed: its prompt (CI code at `79fbfb1`) had the same ban but read the whole page, so the model could pick other rows (it wrote "adds 15K stars" anyway). Now it sees only the Highlights, so the ban covers almost everything it reads. Which rule tipped the model is UNVERIFIED: the raw reply is not saved.
- Likely cause: The Trends prose prompt makes Highlights rest on the facts block (figures), while the highlights.json prompt bans figures and leads (`src/reports/prompts-pages.ts:443-456`). ai-trends is also missing from `forcedHighlightReports` (`:474-476`).

### T3 [medium] consistency

- Location: Summary column of the Radar and all four category tables (e.g. "pi is a coding agent positioned as personally yours. It is positioned as personally yours among many coding agents."; "Proto Agent is the personal agent for your business. It is the personal agent for your business."; "anomalyco/opencode is the open source coding agent written in TypeScript. It is the open source coding agent in TypeScript.")
- Problem: 42 of the 53 non-empty summaries (Radar, category and Hugging Face tables) have a second sentence that opens "It …" and restates the first, and 30 of 53 end "in TypeScript." / "in Python." etc., repeating the Lang column. Half of each cell adds nothing, on the page's largest block of text.
- Evidence: VERIFIED (counted over the page's table rows; the prompt at `src/reports/prompts-pages.ts:63-65` asks for "what it is, then one fact from the description that sets it apart" and forbids "a sentence that restates the first in other words")
- Likely cause: Model non-compliance with `buildTrendingSummariesPrompt` (`src/reports/prompts-pages.ts:54-72`). `summaryRows` (`src/trending/rank.ts:821+`) passes `Language: X` as the only fact for a category row, which invites the "in X" suffix. Nothing in code checks for the restatement.

### T4 [medium] relevance

- Location: Research table
- Problem: 5 of the 10 papers apply agents to one field outside software and data engineering: nnInteractive Agent (3D medical image annotation), Ontology-Guided KG (climate science), Governed Self-Evolution (autonomous investing), SCI-AGENT-EXAM (scientific research tasks) and Optimization Modeling Agents (operations research). nnInteractive Agent is the top row. Ticket 16 named four of these as the off-audience papers its `domain_application` penalty was meant to push out. 7 of the 10 rows also repeat the 2026-10-26 Research table.
- Evidence: VERIFIED. arXiv API abstracts for all 10 papers. `research-state.json` stores only `relevance`, and the papers keep their unpenalised save-day scores (nnInteractive 0.958 saved 10-24, Ontology KG 0.957 saved 10-26, Investing 0.898, Optimization 0.880). The penalty first ran on 10-28 (`arxiv-trace.json` header `domain_application_penalty: 0.2`; the 10-26 trace has neither the header nor the answer), and the page takes papers saved in the 7 days _before_ the run (`src/trending/research.ts:57-58`, sorted by stored relevance). The live answers do work: on the 10-28 trace MatOS (materials research) gets 0.98, Numina Fuse (Lean) 0.9, and the top on-topic papers get ≤ 0.18. So the fix holds. It has simply not reached this page.
- Likely cause: Not a code regression. It is the transition ticket 16 documented. It also affects next Monday's page: the 10-26-saved papers (Ontology KG 0.957, SCI-AGENT-EXAM 0.891) stay in the 11-02 window unpenalised. Re-scoring the pool with the stored abstracts, or penalising at read time, would close that gap.

### T5 [low] accuracy

- Location: Highlights bullet 1: "DeepSeek V4.1 Flash leads OpenRouter usage with 35.37T tokens on 2026-10-26, nearly double the second-place model's 17.40T tokens."
- Problem: The "second-place model" is the same model's earlier snapshot (`deepseek-v4.1-flash-20260910`), so the bullet reads as a 2:1 lead over a rival when it is a lead over itself. 35.37 / 17.40 = 2.03, which is just over double, not "nearly". The facts block and Signals both say 2.0×.
- Evidence: VERIFIED (OpenRouter usage table rows 1-2; `TRENDS_FACTS.openRouterRatio`, `src/core/strings.ts:365`)
- Likely cause: Model wording. The facts block names both slugs, but the Highlight drops the snapshot suffixes.

### T6 [low] consistency

- Location: Radar rows 11-12 (Hermes Agent "week #4 / month #3, 12.70T tokens/week"; Kilo Code "week #5") placed after Aura ("week #23 … 440.7B"). Also Claude Code "week #2 … 12.53T" ranks above Hermes "week #4 … 12.70T".
- Problem: The reader cannot see why the app with the Radar's largest token figure (Signals names it) sits second to last, or why #2 has fewer tokens than #4. The legend says "each source's top movers", but the movers figure (📈) was removed from the Signal cell, so the order has no visible key.
- Evidence: VERIFIED for the order's cause (`selectAgentApps`, `src/sources/openrouter.ts:252-265`: OpenRouter-trending apps first, then by best of day/week rank; Hermes and Kilo are not on OpenRouter's trending list). UNVERIFIED for the rank/token mismatch: `weekRank` and `weekTokens` come from the same week entry (`:229-231`), so OpenRouter ranks by something other than `total_tokens` or by a different cut, and I could not check its live page for 10-26.
- Likely cause: `src/sources/openrouter.ts:258-262` (sort) together with the legend in `radarLegend`.

### T7 [low] correctness

- Location: `trending-trace.json`: `github:pingdotgg/t3code` (+1,881 stars, 30,799 total) and `github:android/skills` (+823, 9,901 total) with `dropped_reason: "threshold"`
- Problem: Both clear the star bar. They were dropped because their repos have no description (`isCategoryRepo` requires one). AGENTS.md defines `threshold` as below the keep bar, so a maintainer reading the trace would look for the wrong cause. On the page, t3code (the third-largest Coding Agents gain) is absent while LodyAI/Lody (+138) shows.
- Evidence: VERIFIED (`gh api repos/pingdotgg/t3code`: description empty, 30,799 stars; `gh api repos/android/skills`: description empty; trace entries)
- Likely cause: `src/trending/rank.ts` `isCategoryRepo`/`hasDescription` → `selectTrendingReport` labels every `!isCategoryRepo` row `threshold`.

### T8 [low] relevance: partial regression of ticket 15 ("a row without summary falls back to the repo or site description")

- Location: Radar row 5, "[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) | OpenRouter | … | —"
- Problem: The row still shows "—", as on 10-26, although the code comment in `buildRadarCandidates` names exactly this row as the case the repo-description borrowing fixes. The repo has a description ("DeepSeek Harness: Everything is a Plugin.").
- Evidence: VERIFIED (`gh api repos/deepseek-ai/deepseek-harness`; `trending-trace.json` has only `openrouter:4706207` for it and no GitHub row for the repo; HunterSwarm's "—" is justified: hunterswarm.com answers HTTP 401 with no meta description)
- Likely cause: Borrowing only reads this week's trending/search rows (`src/trending/rank.ts`, `repoDescription` in `buildRadarCandidates`), and `withSiteDescriptions` (`src/trending/compose.ts:468+`) skips GitHub URLs. One `repos/<owner>/<repo>` call for a shown row with a GitHub URL would fill it.

### T9 [low] relevance

- Location: Most discussed (one row)
- Problem: The rules leave one row this week. Every other unshown story in the window with ≥ 20 HN comments is topic `other`, some at low confidence and arguably on-audience: "Advanced coding in low-resource programming languages" (102 comments, `other` 0.56), "A practical guide to AI image generation, from diffusion to agents" (94, `other` 0.4), Dev.to "Your secrets don't need a git commit to leak into an AI tool" (26, `other` 0.56) and "Three Times My Test Failed and the LLM Was Right" (22, `other` 0.66).
- Evidence: VERIFIED (`spotted-log.json` × `spotted-verdicts.json`, firstSeen 2026-10-21..10-27, `shown` null)
- Likely cause: `mostDiscussed` (`src/spotted/pool.ts:493+`) excludes on the `other` choice alone, with no probability floor, unlike Spotted's 0.6 topic bar. This is a design choice. Flagged because the table shrank to one row.

### T10 [low] correctness

- Location: `trending-trace.json` header `"models": []`
- Problem: The trace names no Jev model, although `classifiedBy` is `jev`, 19 items carry `decided: "2026-10-28"` (judged this run) and the log says "Classified 285 items: 253 saved, the rest by Jev". `arxiv-trace.json` records `jev-1.14.0`.
- Evidence: VERIFIED (trace header; `Counter` of `decided` values)
- Likely cause: `src/trending/classify.ts:417` collects `c.model`. Whether the verdict path sets `model` on the classification is UNVERIFIED.

### T11 [low] relevance

- Location: whole page, against `origin/main:digests/2026-10-26/ai-trends.md`
- Problem: A reader of both pages sees most rows twice, with no 🔥, because the 🔥 comparison is with the page dated exactly 7 days earlier (2026-10-21, none). Repeated: Radar 8/12, Coding Agents 7/8, Agent Harnesses 7/8, Multi-Agent 6/8, Agent Tooling 7/8, Hugging Face 10/11, Research 7/10, Skills open PRs 1/5 (#1980). Not repeated: OpenRouter usage slugs (new day's snapshot, same models), the other 14 Skills items, Most discussed.
- Evidence: VERIFIED (row-by-row name comparison of the two pages)
- Likely cause: The forced weekly run 2 days after a weekly page, so not a bug. If `DIGEST_FORCE_WEEKLY` is meant for re-runs mid-week, comparing against the latest Trends page instead of exactly-7-days would mark these rows.

### T12 [low] consistency

- Location: Signals ¶2, "No Radar row includes a week-over-week change figure."
- Problem: A Signal that reports an absence. It restates the facts block's `radarNoChange` line and tells the reader nothing about the week.
- Evidence: VERIFIED (`TRENDS_FACTS.radarNoChange`, `src/core/strings.ts:351`)
- Likely cause: The facts block hands the model the absence as a fact; the Trends prose prompt does not forbid stating absences.

### T13 [low] relevance

- Location: Coding Agents: WhiteTowerAI/ohmygame ("studio for making games with AI"), unstablebuild/rune ("IDE and terminal multiplexer"); Multi-Agent: TauricResearch/TradingAgents ("financial trading framework"); Radar: Aura ("AI for game developers")
- Problem: Fit is weak for the reader (AI practitioners and data engineers). ohmygame is a game-making app, not a coding agent. rune is closer to agent tooling. TradingAgents is a finance demo framework.
- Evidence: VERIFIED (repo descriptions via `gh api`; Jev categories in `trending-trace.json`: ohmygame `coding_agent`, rune `coding_agent`, TradingAgents `multi_agent`)
- Likely cause: Jev category verdicts (`digests/trending-verdicts.json`), fixable by pinning.

### T14 [low] accuracy

- Location: Research, SWE-VERIFIER row: "SWE-VERIFIER reduces coding agent computation by selectively triggering candidate sampling and verification…"
- Problem: The abstract reports higher resolution (75.47% → 77.20%) at 1.09× the cost. The model is cheaper than verifying at every step, not cheaper than the plain agent. "Reduces computation" overstates it.
- Evidence: VERIFIED (arXiv abstract 2610.30284)
- Likely cause: Model wording (`trends-summaries` call).

### T15 [low] accuracy

- Location: Most discussed: "The Swedish government offices will block ChatGPT and Claude from staff work computers starting Monday."
- Problem: The story was first seen on 2026-10-24, so "Monday" (10-26) had already passed when the page came out on 10-28. A relative day in a weekly table reads as the coming Monday.
- Evidence: VERIFIED (`spotted-log.json` `hn:50207405`: firstSeen 2026-10-24; description "…som från måndag inte längre kan nås…")
- Likely cause: `STORY_RULES` does not ask for absolute dates.

### T16 [low] consistency

- Location: meta line "> Sources: GitHub Trending + … | Generated: 2026-10-27 21:01 UTC"
- Problem: AGENTS.md says every page's meta line gives "its counts, then `Generated:`". Trends gives its sources and no counts. The 2026-10-26 page did the same, so this is either a spec gap or an exception the spec does not mention.
- Evidence: VERIFIED (page line 5; AGENTS.md "Key conventions")
- Likely cause: not traced

## Checked and fine

- **Highlights and Signals figures**: every figure matches its row: 35.37T/17.40T, 2.0×; security-audit-skill 50,015 (+16,593, +50%); thinkrail +151% to 3,862; ruflo +2,683 (+3.5%); DSHA +40%; orca +9,241 (+9.4%); switch +97%; ffmpeg-skill +52%; Hermes 12.70T the top Radar OpenRouter figure; teapot 25,635 the top npm figure; Qwen3.8-27B most total likes (18,527) and 30-day downloads (7,522,728). Every comparison matches `trendsFacts`: largest absolute across the 4 tables, highest relative, the per-table leaders, and the top-10 provider count (deepseek 2, z-ai 2, six providers with 1). Windows are kept ("on 2026-10-26", "in 7 days", "last 7 days"). Every Signal carries links.
- **PAUSE Highlight and row**: "first source-code edit at a median of 60% of trajectory progress" and "single planning intervention" match the abstract.
- **Star totals for 20 repos** (`gh api`, about 1 h after the run): all within ±10 stars of the page (opencode, thinkrail, ohmygame, rune, ruflo, dsh-desktop, harnessrouter, heym, orca, TradingAgents, switch, happier, security-audit-skill, karpathy-skills, knowledge-work-plugins, ffmpeg-skill, stop-that-shit, plus t3code/android-skills/deepseek-harness for T7/T8). The summaries of these rows match their descriptions, apart from T3's padding.
- **Category tables**: each sorted by displayed 7-day gain; the 8-row pick follows `interleaveGains` (e.g. happier +81 by relative, oh-my-claudecode +256 cut as `cap`); the % on sampled rows reconciles with total − gain. The trace has 44 `rendered` rows (12 Radar + 32 category), each with `rank`, and every dropped row has a reason (178 cap, 54 routing, 9 threshold).
- **Hugging Face**: 6 rows against the Hub API (DeepSeek-V4.1-Flash-1017, flint, Qwen3.8-27B, LTX-2.5, Carbon-X, MiniMax-M3.1-Flash). Likes, 30-day downloads, task, size (rounded down; 27B per name) and license all match. The `#` order is code-written. GGUF copies are folded (DeepSeek + ISTA, flint + unsloth). No `model_type` tags.
- **OpenRouter usage**: code table with model-name links and the window "on 2026-10-26, one day's snapshot". The Highlight and Signals keep that date.
- **Skills**: all 15 items updated within 7 days of the run. Each closed item closed 10-21..10-25 (in the window). All titles match `AUDIENCE_TITLE_RE`. The open-PR summaries (#2087, #2086, #668, #1980) and issue summaries (#1943) match their bodies. #2086 closes #2084. No off-audience items. The heading is "Skills: PRs and requests this week".
- **Most discussed**: the Swedish row matches `spotted-log.json` (315 points, 117 comments, topic `policy` 1.0). It is not in `talked-about.json` on any of 10-24..10-28 and appears in no Spotted table. The summary is model-written in English, not a copy of the Swedish description (ticket 05).
- **Research**: all 10 summaries checked against their arXiv abstracts. Correct apart from T14.
- **Page size**: 29,887 bytes, well under GitHub's 64 KB issue limit.
- **Prior tickets**: 01 holds (trace `sources` header with per-source `fetched`, `rendered`/`rank`/`dropped_reason` on every item, `llm-trace.json` outcomes; caveats T7, T10). 03 holds for the page's Highlights and Signals (claims rest on rows and facts, windows kept, no trend from titles), but not for the Skills Takeaway (T1). 04: at most 3 Highlights, one subject each, but see T2. 05 holds. 09 holds: window, closed-in-window rule, audience filter, rename. The merge ambiguity in T1 is new. 15 holds: legend present, tables sorted by gain, no `.local` link, Lang "—" for karpathy-skills, OpenRouter model links, HF code `#` and folding, the 🆕 HunterSwarm row kept because it has usage. Exception: T8. 16: `domain_application` answers now verified live on the 10-28 arXiv trace, but not yet on this page (T4); Candidates to track is absent because no 🔥 is possible this run (expected). 17 holds: plural "comments", plain Highlights bullets (no bold), heading emoji per category.

## Not checked

- OpenRouter app ranks and tokens, the OpenRouter model snapshot and npm download figures against live sources: the 10-26 snapshot cannot be reloaded.
- 15 category rows not sampled with `gh api` (I sampled 17 of 32), and the site descriptions of Strix, Proto Agent, ZCode and Aura.
- The raw reply of the `highlights` call (not saved), so which rule made the model drop ai-trends (T2) is inferred, not observed.
- Run settings: CI's own (OpenRouter, `nvidia/nemotron-3-super-120b-a12b:free` with fallbacks, reasoning effort low; `run.log` line 5 `Using LLM provider: openrouter`), so the model-output findings (T2, T3, T5, T12, T14, T15) are what CI would publish. They are not artefacts of a local run.
