# AI Models & Labs page; Discussions and Lab Announcements retired; promotion stopped

Status: ready-for-agent
Blocked by: 01, 02

Spec: the pages table and the section map in `../spec.md`, decisions 1 and 2.

## The page

New daily page `ai-models`: name "AI Models & Labs", label `models`, emoji 🧠, in `REPORTS` right after `ai-agents`. Layout:

```
# AI Models & Labs <date>
<report bar>
> Lab posts: N | New models: N | Spotted: N | Generated: …
## Highlights           prose call (ticket 02's builder, this page's focus)
## Lab announcements    Date | Lab | Post | Summary
## New on OpenRouter    Model | Listed | Context | Summary
## Stealth models       buildStealthSection, unchanged
## Spotted              the `models` page rows of ticket 01
```

- **Lab announcements**, tracked. The new sitemap items of `src/sources/web.ts`: Anthropic with page content, OpenAI metadata-only. Newest first, at most 15 rows (`LAB_POSTS_MAX`), then one line "N more posts not shown." On a first crawl (`isFirstRun`) the table is one line with the count. Web state is saved as `buildWebReport` saves it now: once, whether or not the page is published.
- **A post is new only when its URL is.** `fetchSiteContent` (`src/sources/web.ts`) also counts a known URL whose `lastmod` moved as new, except on the metadata-only OpenAI site, whose `lastmod` tracks sitemap generation. On 2026-10-21 Anthropic's sitemap moved the `lastmod` of all its URLs: the web report listed 476 of 476 as new, and `web-state.json` changed 2,064 lines. Drop the `lastmod` condition for every site: an edited post is not an announcement. The state keeps storing `lastmod`.
- **New on OpenRouter**, tracked. Models in the `/api/v1/models` catalog created in the last 2 days that no earlier page listed, stealth models left out. Fetch the catalog once a day and derive both this list and the stealth list from it. State `digests/models-state.json`, a `ReportedState` through `newItems` and `nextReportedState` (`src/core/report-state.ts`), saved once the page is built. The catalog listed 0–11 new models a day over 2026-10-01 … 21, usually 1–3.
- **Summaries.** One call for the page's lab posts and new models, on the `summarized-table.ts` contract. A post with content gets 1–2 sentences from it. A metadata-only post gets `N: —` unless its title says more than its URL. A model gets one sentence from its catalog description: what it is for, its context and modalities, never its marketing claims. A failed call shows the description, truncated, or "—".
- **Highlights.** Focus: what changes what a practitioner builds with. A new model or a model's availability or price, a capability, a safety or evaluation finding, a lab's product launch.
- **Stealth models** moves here from the agents report's preamble, unchanged, and is always shown on this page. Its expiry dates reach the Overview in ticket 05.
- **Published** when it has a lab post, a new model, a 🆕 stealth model or a Spotted row. Otherwise skipped, like the other optional pages.
- `LABEL_COLORS` (`src/core/github.ts`) gets `models`.

## Lab posts are not project news

`collectNewsItems` (`src/reports/agent-news.ts`) drops the web sitemaps: `NewsSources.web` goes. A lab post is a tracked item of this page and appears once, here (placement rule 4): a community story whose link is a listed lab post leaves Spotted (`splitPool`), so the page does not show the post twice.

## Retire `ai-hn` and `ai-web`

- Remove `buildDiscussionsReport`, `buildWebReport`, `buildDiscussionsPrompt`, `buildWebReportPrompt`, `DISCUSSIONS_REPORT` and `WEB_REPORT` with their tests. Strings the new page needs move to its own `MODELS_PAGE` block in `src/core/i18n.ts`. `buildListingReport` and `SECTIONS.signals`/`worthALook` stay while ticket 04's pages use them.
- `REPORTS` drops both. `REPORT_LABELS` keeps them in its archive part ("AI Discussions", "Lab Announcements"), and `REPORT_FILES` (`src/cli/generate-manifest.ts`) lists them as archive files.
- `closeSupersededIssues` (`src/core/github.ts`) counts `hn` and `web` as legacy daily labels, as `infra` and `community` are, so their last open issues close on the next run.
- Before editing, grep the repo outside `digests/` for `ai-hn`, `ai-web` and the labels `hn` and `web`. Known hits on 2026-10-22: the report-type list in `mcp/src/index.ts` (line 148), the example JSON in `buildHighlightsPrompt` (`src/reports/prompts-data.ts`), `src/core/i18n.ts`, `src/reports/data-reports.ts`, `src/cli/generate-manifest.ts`'s comment, and tests. `manifest.json` is generated: leave it to `pnpm manifest`. Handle every other hit.

## Stop promotion (decision 2)

- Delete `src/trending/promoted.ts` and its test, and `PROMOTED` in `src/index.ts`: the agents and infra lists come from `config.yml` only.
- The weekly run stops writing `promoted`. `promotedRecord` goes (called in `src/trending/trending.ts`), and so does `promoted` in `src/trending/rank.ts`: the `StarHistory` field, its validation in `loadStarHistory`, its line in `saveStarHistory` and its carry-over in `nextStarHistory`. The loader then ignores the field committed in `digests/trending-state.json`, and the next weekly save drops it.
- Ticket 04 adds the candidates list that replaces it.

## Check

- Tests for the page builder (`##` headings in order with a stubbed LLM, the first-crawl line, the 15-row cap, publishing rules), the new-models state (`newItems` over a same-day re-run), the matcher without web items, and close-stale's legacy labels.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm readme --check`.

## Docs

AGENTS.md: Architecture (fetch and save phases), the file table (`web.ts`, `openrouter.ts`, the retired builders), Report outputs (new row for `ai-models.md`, `ai-hn.md` and `ai-web.md` into the archive-only line), the Web, Stealth models, HN and Promoted trending repos bullets, Key conventions' weekly list and listing layout. README's report list.

## Comments

- A model's summary gives what it is for and its modalities, not its context length: the row shows it.
- The models page has no Coming up section: the stealth table's Expires column dates each stealth model (spec rule 4), and the Overview's Coming up lists the expiries.
- The 2026-10-23 e2e found the post twice on one page in the making: on 6 of 14 days of 2026-10 a new lab post was an HN row the same day (10-22: Patch the Planet and OpenAI on Google Cloud), and nothing kept the HN copy out of Spotted. `splitPool` now gives every copy of a listed post's link to the post (a post past the 15-row cap is only counted, so its story may still be Spotted), and the story is marked shown with the page. Its re-run also lost the run's 4 lab posts, which the web state already knew: the state now keeps the day's new URLs (`newOn`).
