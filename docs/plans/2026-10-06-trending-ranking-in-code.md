# Plan: build the trending report in code: ranking, Jev classification, star history

Status: Done · Created 2026-10-06 · Decisions confirmed 2026-10-06:
code renders the tables, Tier B is included, and Tier C accepts one week of
warm-up. Implemented on branch `feat/trending-in-code` in `9880a32` (Jev
client), `ad58f7e` (Tier A), `4ef17b4` (Tier B) and `fad1744` (Tier C).

## Why

The weekly `ai-trending` prompt (`buildTrendingPrompt`, `src/prompts-data.ts`)
hands the LLM unordered source dumps. The LLM then decides:

- which items are in scope
- which category each item belongs to
- the order within each table
- which items get 🆕
- how the numbers are formatted

The 🆕 rule is fully specified in prose inside the prompt, and the numbers come
with a "copy verbatim, do not recompute" instruction. Topic-search repos have
no momentum signal at all. They are sorted by total stars, which
`src/trending.ts` itself notes "favors established repos".

After this change, code makes every decision that has a rule:

- **Tier A:** selection, ranking, 🆕 and the cell text are computed in code,
  and code renders the tables.
- **Tier B:** Jev decides scope and category. Rendering in code is only
  possible once something other than the LLM decides scope and category.
- **Tier C:** a committed star history provides the weekly star gain of
  topic-search repos.

The LLM only writes the 2-sentence summaries and the prose sections.

The precedents are already in the repo. `buildStealthSection` renders a table
in code. ArXiv uses Jev for atomic judgments, keeps its weights in code
(`relevanceOf`), writes a trace file (`arxiv-ranking.json`) and persists state
(`arxiv-state.json`).

## Deviations from the plan (found while implementing)

A live weekly fetch (topic fallback, no LLM) showed two problems with the
rules below. Both were changed in commit 2a (decided 2026-10-06):

- **The category tables filled with new repos.** Every new repo got a
  stars-per-week figure, and established search repos had none until the star
  history starts, so 8 new repos filled a table before any established one
  appeared. The Coding Agents table held 8 new repos with 3–246 stars. New
  repos are now Radar-only, so no item is in both tables and the shared row
  number is gone.
- **The Radar was new-only.** About 64 🆕 candidates filled the 30-row pool,
  so Hermes, Kilo Code and Cline could not appear. The age scaling also ranked
  an 8-star repo created that day sixth. Now at most 8 of the 12 rows and 20
  of the 30-row pool are 🆕, and a new GitHub repo needs at least 25 stars
  (`NEW_REPO_MIN_STARS`; the LLM's new-repo picks on 2026-10-05 had 27–168).

Smaller deviations:

- **Match candidates are Choice options**, not state, because the model
  reads option names and descriptions (see Cross-source matching).
- **A single failed classification call** falls back to the topic label for
  that item. Only more than half failing sends the whole run to the fallback.
- **One tool, one app.** A candidate saved as another app's match is not
  offered, and when two apps pick the same candidate in one run, the first
  in pool order keeps it and the second rejects its offered candidates.
- **The trace lists every classified item**, not a top slice like ArXiv's
  100: a misclassified out-of-scope repo never reaches the report, so it is
  the main thing to trace.
- **An unreadable star history starts over**, unlike the match file. It is
  never hand-edited, so losing it costs a week of warm-up, not a decision.
- **A malformed match answer counts as a failed call**, so it records
  nothing rather than rejecting every candidate.
- The prose prompt no longer asks for links to recent releases: the model
  sees only the tables and the model data.
- **OpenRouter apps tagged as agents skip Jev.** The live Jev check
  (2026-10-07) put 14 of 37 apps tagged `cli-agent`, `ide-extension`,
  `cloud-agent` or `personal-agent` out of scope, goose, Crush and Command
  Code among them: most have no description, so Jev saw a bare name. Those
  four tags now settle scope. Untagged apps, which are on the list only for
  being new or trending, and the broad `programming-app` and
  `native-app-builder` tags still go to Jev.
- **Classifications are cached** in `digests/trending-classifications.json`
  (decided 2026-10-07): the plan asked Jev about every item every week,
  about 200 calls, though a project's scope does not change. An item is
  asked once, and again only when its description changes, so a new repo
  first seen with a placeholder description is not out of scope for good.
  Saved verdicts are used even without a key or when the new calls fail.
  Fallback verdicts and tagged apps are never saved, and an agent tag beats
  a verdict saved before the app was tagged. A file that fails to parse
  means every item is asked and nothing is saved, the same as the match
  file. The 50% failure rule now counts only the items asked: on a week
  with few new items, two failed calls can send those items to the topic
  fallback, and that run writes no `trending-ranking.json`. They are asked
  again the next week.
- **Live Jev check, 2026-10-07:** 208/208 classification calls and 15/15
  match calls answered, so candidate keys such as `npm:@scope/name` work as
  Choice options. Scope picks were sound for GitHub and npm (awesome-lists,
  `claude-proxy`, platform binaries out; `@tanstack/ai-sandbox` off the Radar
  at 0.21 standalone). No match was made: every app's best pick was `none`,
  correctly, because the Kilo Code, pi and Hermes repos are established
  repos, which sit in the category tables and never enter the Radar pool.

## Design

### Data flow

Only the weekly run changes. Daily runs still fetch trending data for agent
news, and leave `TrendingData.report` undefined.

1. **Fetch and compose** (`fetchTrendingData("weekly", dateStr)`,
   `src/trending.ts`). After the fetch, `composeTrendingReport` follows the
   shape of `fetchArxivData`:
   1. `rankGithubRepos` merges the trending page and topic search and sorts
      by stars per week.
   2. `buildRadarCandidates` orders the OpenRouter, npm and new GitHub
      candidates.
   3. Every unique item is classified once, by Jev (Tier B) or by the topic
      fallback.
   4. The Radar pool is the first 30 in-scope candidates, at most 20 of
      them 🆕.
   5. `urlMerge` joins rows that share a GitHub repo or a site-root host.
   6. Jev matches OpenRouter apps to the npm and GitHub rows left unmerged,
      reusing `trending-matches.json` (Tier B).
   7. The Radar is cut to 12 rows, at most 8 of them 🆕.
   8. Established GitHub rows are grouped by category, at most 8 per
      category. New repos are Radar-only.

   The result goes in `TrendingData.report`: `radar`, `categories`,
   `classifiedBy`, `rankingFile` and `nextMatches`, plus `nextStarHistory`
   in Tier C. Every row carries a number `n`, which the summaries call
   answers by.

   Steps 1 to 8 run in their own try/catch. `index.ts` wraps
   `fetchTrendingData` in `.catch(() => empty)`, so a throw would also drop
   `trendingRepos` and `searchRepos`, and Monday's agent news with them. A
   failure logs the error and leaves `report` undefined.

2. **Generate** (`generateSummaries`). When `report` is set, two `summarize()`
   calls run in parallel. Both go through the limiter and `llmStats`, with
   `LLM_TOKENS_LISTING`.
   - **Summaries** (`buildTrendingSummariesPrompt`). The input is the numbered
     rows (name, description, cell values). The output is one
     `N: <2 sentences>` line per row, which `parseRowSummaries` reads
     tolerantly. A missing line falls back to the row's description,
     truncated, or `—` when there is none. A failed call means every row uses
     its description, and the tables still render.
   - **Prose** (`buildTrendingProsePrompt`). The input is the rendered tables,
     with descriptions in the Summary column, plus the OpenRouter model data.
     It returns Highlights, a `<!-- tables -->` marker line, then Trend Signal
     Analysis, Community Hot Spots and Model Usage. A failed call uses the
     `MSG.trendingFailed` notice for the prose only.

3. **Save** (`saveTrendingReport`). With `report` undefined it logs a notice
   and skips the report; that is its only gate. Otherwise
   `renderTrendingTables` renders the tables with the summaries and
   `spliceTrendingProse` puts them at the marker, or after all the prose when
   the marker is missing. The Skills section and footer follow. After
   `saveFile` it writes `trending-ranking.json` and the match file (Tier B)
   and the star history (Tier C), at the point where ArXiv saves its state.

**Modules:**

- `src/trending-rank.ts`: pure ranking and selection (GitHub rows, Radar
  candidates, URL merge, caps, numbering). Tier C adds the star history and
  its file I/O.
- `src/trending-jev.ts`: classification (the Jev questions, the topic
  fallback, the scope and Radar policy), the match cache and the ranking
  trace.
- `src/jev.ts`: the Jev client, shared with ArXiv.
- The rendering sits in `src/report-builders.ts` next to
  `buildStealthSection`, and the two prompts in `src/prompts-data.ts`.

Report layout (unchanged for readers): Highlights → 🚀 Radar → Top Projects
by Category → Trend Signal Analysis → Community Hot Spots → Model Usage →
Skills.

### Tier A: ranking, 🆕 and cells

New module `src/trending-rank.ts` (pure functions, plus the Tier C file I/O).

**Fetch-side additions:**

- `created_at` → `SearchRepo.createdAt` in `src/trending.ts`.
- `links.repository` and `links.homepage` → `NpmPackage` in `src/npm.ts`. These
  are the merge keys.

**GitHub rows** feed the category tables.

- Merge `trendingRepos` and `searchRepos` by `fullName`. Keep the trending
  page's numbers and the search repo's topic label.
- Sort by `perWeek` (stars per week), the one unit for every GitHub row:
  1. Trending page `periodStars` (GitHub's own "this week"), when > 0.
  2. The Tier C delta.
  3. New repo (created ≤ 14 days ago): `stars × 7 / max(ageDays, 1)`.
  4. Otherwise `null`. These rows sort after all others, by total stars.
- Stars cell:
  - `"86,392 (+1,851)"`.
  - `"(+1,851)"` when the total is missing (scrape returned 0).
  - `"1,240 (new, 9 days)"` for case 3.
  - `"86,392 (+812 in 4 days)"` when the Tier C gap is not 7 days.

**Radar candidates:**

| Source     | Taken from                                          | Signal cell                                                                                 | 🆕 when                                                      |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| OpenRouter | `openrouter.apps` (`selectAgentApps` order)         | `"week #12 / month —, 2.64T tokens/week"`, plus `" · 📈 +776%"` when `growthPercent` is set | listed ≤ 14 days ago, or `weekRank` set and `monthRank` null |
| npm        | `npm.rising`, then `npm.top`                        | `"12,560/week, 4.2x"`                                                                       | `momentumRatio` ≥ 3                                          |
| GitHub     | rows created ≤ 14 days ago, or from a `new:*` query | the Stars cell                                                                              | always                                                       |

- 🆕 rows get the `🆕 ` prefix in the Signal cell.
- **Order:** 🆕 first, then by `index / sourceLength` within each source's own
  list. Ties are broken by source order: OpenRouter, npm, GitHub.
  - Do not invent a score that combines stars, ranks and download ratios
    across sources. They are not comparable.
- **Merge** ("Source: several"): two passes over the Radar pool, which is the
  first 30 in-scope, ordered candidates.
  1. **URL:** rows that share a normalized GitHub repo URL, or the host of a
     site-root URL, become one row. This is free and deterministic, and covers
     npm ↔ GitHub, since npm carries `links.repository`. Only site-root URLs
     give a host: a URL with a path often sits on a vendor site that hosts
     several products (`openai.com/codex/`). A missed merge costs a second
     row until Jev matches it, and a false merge shows two tools as one.
  2. **Jev:** OpenRouter apps are matched to the npm and GitHub rows left
     unmerged. See "Cross-source matching" under Tier B.

  The sources and Signal cells of merged rows are joined with `; `. Merging
  happens before the 12-row cap, so a merged tool takes one slot.

**Caps:**

- Radar: the first 12 in-scope rows. The section is omitted when there are 0.
- Categories: the first 8 per category. Empty categories are omitted.

**Strings:** the table headers, category titles and section headings go to
`TRENDING_REPORT` in `src/i18n.ts`.

### Tier B: Jev scope and category

- **Shared client:** extract the request, the 429/529 backoff
  (`retryDelayMs`) and the worker pool with failure counting from
  `src/arxiv.ts` into `src/jev.ts`. ArXiv then calls it. This is a separate
  first commit with no behavior change, and the existing ArXiv tests must pass
  unchanged.
- **One request per candidate:** about 200 a week (GitHub ≈ 100–130,
  OpenRouter ≤ 60, npm ≤ 30), 5 concurrent like ArXiv.
- **State:** `{ name, description, source, topic?, language? }`. Omit fields
  no question reads.
- **Questions**, asked together in one request:
  - `category`, a **Choice** with these options:
    - `coding_agent`
    - `harness_framework`
    - `multi_agent`
    - `agent_tooling`
    - `other_agent`
    - `out_of_scope`

    The descriptions come from the prompt's current category and scope text.
    `out_of_scope` covers model weights, training, inference engines, RAG,
    vector DBs, chat frontends, non-AI repos, and awesome-lists or tutorials.
    It is the no-match outcome the Jev docs recommend.

  - `standalone_tool`, a **Noul**: "Is the item itself an agent or agentic
    coding tool, rather than a plugin, extension, MCP server, skill, proxy or
    router for one?" It gates the Radar only.

- **Policy, in code:**
  - An item is in scope when `category.choice !== "out_of_scope"`.
  - A Radar row additionally needs `standalone_tool.noul ≥ 0.5`.
  - Keep the thresholds as named constants. The awesome-list "unless clear
    standout" nuance from the old prompt is dropped.
- **Trace:** `digests/YYYY-MM-DD/trending-ranking.json`, one item per line:
  - the category probabilities, the noul, `perWeek` and the Jev model version
  - the same shape and purpose as `arxiv-ranking.json`
  - not a report, and not in `REPORT_FILES`
- **Fallback:** used when there is no `TYPESAFE_API_KEY`, or when more than
  50% of the calls fail. The rules are deterministic, and no LLM is involved.

  | Item                                     | Fallback rule                                                                                                                                                                                                                               |
  | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Search repo                              | Category from its topic label: `harness`/`agent-harness`/`new:harness` → harness_framework, `ai-coding`/`new:coding-agent`/`new:agentic-coding` → coding_agent, `multi-agent`/`agent-orchestration` → multi_agent, `ai-agent` → other_agent |
  | Trending-page repo without a topic label | Dropped                                                                                                                                                                                                                                     |
  | Radar candidates                         | Kept unfiltered (OpenRouter categories and npm keywords already pre-filter them)                                                                                                                                                            |

  The log says which path ran. CI has the key, so the fallback is rare.

#### Cross-source matching, saved in `digests/trending-matches.json`

The LLM used to merge one tool across sources by name. Code can't do that:
the OpenRouter app URLs and the npm/GitHub links share nothing. Checked on the
2026-10-05 report: Kilo Code is `kilocode.ai` on OpenRouter and
`github.com/Kilo-Org/kilocode` on npm, pi is `pi.dev` vs
`github.com/badlogic/pi-mono`, and Hermes Agent is
`hermes-agent.nousresearch.com` vs `NousResearch/hermes-agent`. Matching on
names breaks on short names, since "pi" also matches the plugins `pi-acp` and
`pi-mcp-adapter`. So Jev picks the match, and every decision is saved so it is
made only once.

```json
{
  "apps": {
    "123": {
      "title": "Kilo Code",
      "npm": "@kilocode/cli",
      "github": "Kilo-Org/kilocode",
      "rejected": ["npm:kilocode", "github:someone/kilo-fork"],
      "lastSeen": "2026-10-12",
      "decided": "2026-10-12",
      "model": "jev-1.13.0"
    }
  }
}
```

- **Key:** the OpenRouter `appId`, which is a stable number. `title` is only
  there for readers.
- **Candidate keys:** `npm:<package name>` and `github:<owner/repo>`.
- **Reuse:**
  1. An app with a saved `npm` or `github` match merges with that row when it
     is in the pool, with no Jev call.
  2. Jev is called for an app only when the pool holds candidates of a source
     the app has no match for and that are not in its `rejected` list.
  3. Jev is asked only about those new candidates.
  4. In steady state that is a few calls a week. The first run makes one per
     OpenRouter app in the pool, at most about 15.
- **Request:**
  - The state holds the app's `{ title, description, url }`.
  - Two **Choice** questions, `npm_match` and `github_match`, are asked
    together. Each lists that source's new candidates plus `none` ("none of
    these is the same product"). Each candidate is an option keyed by its
    candidate key, with `{ name, description, url }` as its description.
    (Changed in commit 2b: the draft put the candidates in the state, but
    the Choice docs say the model reads option names and descriptions.)
  - It is a separate request from the classification, because the ArXiv code
    notes that extra state fields lower Jev's accuracy on questions that don't
    read them.
- **Policy:**
  - If the picked candidate has probability ≥ `MATCH_MIN_PROBABILITY`
    (default 0.8, tuned on the trace), it is saved as the match.
  - Otherwise every candidate offered in that question goes to `rejected`,
    including an uncertain pick. So no pair is asked about twice, and a
    low-confidence guess never merges.
- **Hand-editable:** the file is committed JSON.
  - To fix a wrong match, delete its `npm` or `github` field and add the key to
    `rejected`.
  - To force a match, set the field.
  - Code never overwrites an existing match.
- **Pruning:**
  - `rejected` keys not in this run's pool are dropped. A candidate that
    returns later is asked about again, which keeps the file bounded.
  - Apps unseen for 180 days are dropped.
  - Saved matches are otherwise kept indefinitely.
- **Same-day re-run:** saved matches and rejections replay the first run's
  decisions, so the result is identical without new calls.
- **No key, or Jev failing:** saved matches and the URL pass still apply, and
  only new pairs go unmatched. A failed match call records nothing, so the
  pair is asked about again next run.
- **Trace:** each match call's probabilities, and each reused match marked
  `cached`, go into `trending-ranking.json`.
- **When it is written:** after the report is saved, like the other state
  files. `git add digests/` commits it.

### Tier C: star history, `digests/trending-state.json`

```json
{
  "repos": {
    "owner/repo": [
      ["2026-10-12", 1234],
      ["2026-10-19", 1500]
    ]
  }
}
```

- **Recorded:** every GitHub repo seen on the weekly run (trending page with
  `totalStars > 0`, and all search repos), stored as `[CST date, total stars]`.
- **Carry-forward:** entries persist when a repo drops out of a top-15 search
  result. Points older than 35 days are pruned, and repos with no points left
  are dropped. Expected size is ≲ 30 KB.
- **Baseline:** the newest point dated before today.
  - `perWeek = (stars − base) × 7 / days`, used for sorting.
  - The cell shows the raw delta, plus "in N days" when N ≠ 7.
- **Same-day re-run:** saving replaces today's point, and the baseline ignores
  today's points, so the deltas come out the same. This mirrors
  `submissionCutoff`.
- **Functions:** `loadStarHistory`, `saveStarHistory`, `starBaseline`,
  `nextStarHistory`.
- **When it is read and written:** only on the weekly run. Daily runs never
  touch the file.
- **Workflow:** no change. `git add digests/` covers the file, and the LLM
  health gate still blocks the commit on an outage.
- **Warm-up (accepted):** 2026-10-12 only seeds the history, and the first
  deltas appear on 2026-10-19.

## Commits

1. `refactor(arxiv)`: extract `src/jev.ts`. No behavior change.
2. Tiers A and B, split so each review fits in one sitting:
   - 2a `feat(trending)`: rank and render the trending report in code.
     `trending-rank.ts`, the topic fallback in `trending-jev.ts`, the two
     prompts that replace `buildTrendingPrompt`, the rendering, and the
     wiring in `index.ts` and `report-savers.ts`.
   - 2b `feat(trending)`: Jev scope, category and cross-source matching, with
     `trending-matches.json` and the ranking trace.
3. `feat(trending)`: Tier C star history.

Docs go in the same commits:

- the CLAUDE.md Trending bullet and source-file table
- the "listing reports … numbers copied verbatim" convention, which now
  excludes trending
- the `trending-state.json` and `trending-matches.json` mentions next to
  `web-state.json` and `arxiv-state.json`, including how to hand-fix a match
- README

## Done-conditions

- `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` pass after
  each commit.
- `src/__tests__/trending-rank.test.ts` covers:
  - merge and precedence
  - the null-momentum tail
  - each 🆕 rule
  - each cell format
  - cross-source order
  - caps
  - URL merge
  - the match cache:
    - a saved match is reused without a call
    - only new candidates are asked about
    - a low-confidence pick is rejected, not merged
    - a hand-set match is never overwritten
    - `rejected` pruning
    - a failed call records nothing
    - no-key reuse
  - the scope and Radar policy
  - the fallback mapping
  - summary-line parsing, including missing and garbled lines
  - the marker splice and its fallback
  - the star history: baseline, non-7-day gap, pruning, carry-forward and
    same-day idempotence
- `src/__tests__/prompt-builders.test.ts` replaces the `buildTrendingPrompt`
  tests (including line 189's exact-row assertion) with tests for the two new
  prompts.
- **Live check:** with `TYPESAFE_API_KEY` set locally, a one-off script runs
  the weekly fetch with composition (Jev included), then prints the rendered
  tables with description summaries.
  - Spot-check the scope and category answers against the LLM's picks in
    `digests/2026-10-05/ai-trending.md`.
  - Check that Kilo Code, pi and Hermes Agent merge whenever both their rows
    are in the pool.
  - If no key is available, report this step as skipped.

## Estimate

About 1,050 lines over 4 commits. Roughly:

- `jev.ts` extraction: ±80
- `trending-rank.ts`: ~430 (matching adds ~80)
- prompts: −100 / +60
- wiring: ~40
- tests: ~420
- docs: ~35

The diff exceeds the review gate, so review each commit before moving on.
