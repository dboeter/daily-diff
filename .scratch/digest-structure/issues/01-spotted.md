# Spotted: community stories routed by topic, shown once

Status: ready-for-agent
Blocked by: none

Spec: `../spec.md`, placement rules 3 and 4 and decision 1.

## What to build

Every daily run collects community stories from Hacker News, Lobste.rs and Dev.to. It drops the stories a page showed on an earlier day, gives each remaining story a topic, and renders a `## Spotted` table on the page of that topic. This ticket covers the pool, the topic routing, the state, the table with its summaries, and the Spotted sections of AI Agents and Data Engineering. The AI Models & Labs page (ticket 03) takes the `models` and `research` stories. The Discussions page (`ai-hn`) stays until ticket 03 and keeps reading `HnData` as it does now.

## Sources

- **Hacker News** (`src/sources/hn.ts`). `fetchHnData` takes an `isShown(storyId)` predicate (default: none shown). A story shown on an earlier day stays in the result but does not count toward `HN_TOP_STORIES`, so the cut yields stories no page has shown: 55 of 174 rows (32%) of 2026-10-13 … 22 repeated the previous day. Add a data keyword list next to `AI_KEYWORD_PATTERNS`: database, SQL, Postgres, SQLite, DuckDB, ClickHouse, Snowflake, Databricks, BigQuery, Spark, Iceberg, Parquet, Arrow, dbt, Airflow, Dagster, Kafka, Polars, Trino, data engineering, data warehouse, data lake, lakehouse, ETL. Raise `HN_TOP_STORIES` to 40. Without both, the Data page has no HN stories to spot: the current filter admits AI stories only.
- **Lobste.rs** (`src/sources/lobsters.ts`). Fetched daily. Tags `ai`, `vibecoding` and `databases`. The current `ml` tag is "MetaLanguage, OCaml programming" (`https://lobste.rs/tags.json`, checked 2026-10-22, when it returned "Unikernels in OCaml"). `vibecoding` is "Using AI/LLM, coding tools. Don't also tag with `ai`", so AI coding stories never reached the report. Keep stories published in the last 2 days (`LOBSTERS_DAYS`). The log below drops repeats.
- **Dev.to** (`src/sources/devto.ts`). Fetched daily with `top=2`, the most popular articles of the last 2 days. On 2026-10-22 that returned 110 unique articles over the five tags, most with fewer than 15 reactions. Keep articles with at least 15 positive reactions (`DEVTO_MIN_REACTIONS`) before routing, so Jev is not asked about ~100 low-signal posts a day.

`isWeeklyRun` no longer gates Lobste.rs and Dev.to. The Discussions report reads them daily until ticket 03 retires it.

## Data shapes (`src/spotted/`, a new area)

`src/spotted/spotted.ts`:

```ts
export type StorySource = "hn" | "lobsters" | "devto";

/** One community story, whatever its source. */
export interface Story {
  id: string; // "hn:<id>", "lobsters:<short_id>", "devto:<id>"
  source: StorySource;
  title: string;
  url: string; // the linked article; the discussion for a text post
  discussionUrl: string; // HN item page, Lobste.rs comments, the Dev.to article
  points: number; // HN points, Lobste.rs score, Dev.to positive reactions
  comments: number;
  description?: string; // HN page description, Dev.to description
  published: string; // ISO
}

export function storiesFrom(hn: HnData, lobsters: LobstersData, devto: DevtoData): Story[];
```

State: `digests/spotted-log.json`, committed, an `ItemsFile<LoggedStory>` with one story per line through `loadItemsFile`/`saveItemsFile` (`src/core/jev.ts`):

```ts
export interface LoggedStory {
  source: StorySource;
  title: string;
  url: string;
  discussionUrl: string;
  points: number; // latest fetched
  comments: number; // latest fetched
  firstSeen: string; // CST date
  lastSeen: string; // CST date
  shown?: string; // CST date a page first showed it
}
```

- `freshStories(stories, log, dateStr)`: stories with no `shown`, or `shown === dateStr`. A same-day re-run shows the same stories, as in the ArXiv and policy states.
- `nextLog(log, fetched, shownIds, dateStr)`: each fetched story gets its latest counts and `lastSeen`, including a story shown on an earlier day (ticket 04's weekly Most discussed reads these counts). `shown` is set for each id in `shownIds` that has none. Entries whose `lastSeen` is more than 8 days before `dateStr` are pruned: the weekly page reads the 7 days before Monday's run, and a story unseen for 8 days does not return to any source's window.
- A malformed log reads as empty (logged) and is overwritten. It holds no hand edits.

## Topic routing (`src/spotted/jev.ts`)

One Jev Choice per story through `judgeItems` (`src/core/jev.ts`), the way `classifyTrendingItems` (`src/trending/jev.ts`) uses it.

- `state`: the title, the description when present, and the link's host as `site`.
- Question `topic`, `type: "choice"`, with these keys in this order. Write `what` and `examples` in the style of `CLASSIFY_QUESTIONS`.
  - `agents`: AI agents and AI developer tools. Coding agents, agent frameworks and SDKs, MCP and agent tooling, building software with AI agents.
  - `models`: AI models and the labs and companies that make them. A model release, a benchmark or comparison, a lab's product, pricing or business news, open-weight models, inference and serving.
  - `research`: AI research results. A paper, an interpretability or training finding, a technical explanation of how models work.
  - `data`: data engineering and databases, with or without AI. A database or query engine, warehouses and lakehouses, pipelines and orchestration, dataframes, Databricks or Snowflake.
  - `policy`: AI law, regulation, government action and court cases.
  - `other`, the no-match option: an opinion essay on AI, AI's effect on jobs or culture, AI-generated content, a story only loosely about AI.
- `decide` returns the choice. A key outside the list throws, which counts the call as failed.
- No fingerprint. Cache `digests/spotted-topics.json`, committed and hand-editable like `trending-classifications.json` (to fix a topic, edit `answers.topic.choice` and set `"pinned": true`). Entries unseen for 30 days are pruned.
- Fallback, when there is no `TYPESAFE_API_KEY` or more than half the new calls fail: `fallbackTopic(story)`, keyword lists over the title and description, tried in the order policy, data, agents, research, models, else `other`. Policy goes first: "DeepSeek banned from U.S. federal civilian agencies" names a model company but is a policy story.
- Move the `ChoiceAnswer` interface from `src/trending/jev.ts` to `src/core/jev.ts` and export it. Both callers import it from there.

Topics map to pages in one table, `SPOTTED_PAGE: Record<Topic, SpottedPage | null>`: `agents` to `agents`, `models` and `research` to `models`, `data` to `data`, `policy` and `other` to null. Research stays a choice of its own so later work can tell it apart from model news. Policy stories are dropped: Policy Watch has its own sources, and the 2026-10-20 revert of the HN-to-policy routing stands.

## Pipeline (`main()`, `src/index.ts`)

1. Load the log before `fetchAllData` and pass `isShown` to `fetchHnData`.
2. `stories = storiesFrom(...)`, then `fresh = freshStories(stories, log, dateStr)`.
3. News matching reads `fresh` instead of `HnData`, in both pools. `NewsSources.hn` becomes `stories?: Story[]` (`src/reports/agent-news.ts`), so a Lobste.rs or Dev.to story can name a tracked project too. A story's `NewsItem` links its discussion, carries its story id (`NewsItem.id?`), and has the source "Hacker News", "Lobste.rs" or "Dev.to". Web and trending items are unchanged.
4. Route the fresh stories that matched no project in either pool. Then `selectSpotted`: per page at most 6 HN, 2 Lobste.rs and 2 Dev.to stories (`SPOTTED_PER_SOURCE`), each source sorted by points, sources in that order. There is no combined score: points, scores and reactions are not comparable. Number the rows across pages with `numberRows` in the order agents, models, data.
5. One LLM call for every page's rows: `buildSpottedSummariesPrompt` in `src/reports/prompts-data.ts`, on the contract of `src/reports/summarized-table.ts` (`rowList`, `summaryLine`, `summaryOutputRule`, `parseRowSummaries`). Carry over the HN rules of `buildDiscussionsPrompt`. A row with a description gets 2 sentences taken from it. A row without one gets 1 sentence saying only what the title and site say. Never describe a comment thread. A failed call shows each row's description, truncated (`summaryText`). The call runs before the page builders, so the data report's prose call sees its Spotted table.
6. `renderSpottedTable(rows, summaries)` in `src/reports/report-builders.ts`: `## Spotted`, then `| Story | Source | Discussion | Summary |`. Story is the title linked to `url`. Discussion is `[312 points, 95 comments](discussionUrl)`, with "reactions" instead of "points" for Dev.to. A page with no rows has no Spotted section. Headings and the table header go in `src/core/i18n.ts`.
7. AI Agents renders Spotted after its two tracked groups. The data report takes its rows through `buildDataReport` and renders Spotted after Across platforms and before the EU data-law links. Spotted rows alone never make a data report, as deadlines alone never make a policy report.
8. After `assertLlmHealthy`, `nextLog` marks as shown the Spotted rows of every published page and the stories matched into a published page's project news, whether or not the model mentioned them. Then save `digests/spotted-log.json` and the topics cache.
9. Trace: `digests/YYYY-MM-DD/spotted-ranking.json`, every routed story with its topic, page, whether shown, and `traceFields` (answers, `decided`), through the judgment's `rankingFile`. Not a report and not in `REPORT_FILES`.

## Check

- Unit tests, flat in `src/__tests__/` (`spotted.test.ts`, `spotted-jev.test.ts`; stub `ask` as `trending-jev.test.ts` does): `freshStories` with a same-day re-run; `nextLog` counts, `shown` and pruning; the `isShown` cut in `fetchHnData` if `hn.test.ts` stubs fetch; `decide` and the fallback order; `selectSpotted` caps and order; `renderSpottedTable`; the summaries prompt's contract.
- Routing check, `scripts/spotted-route-check.ts`. Parse the HN tables of `digests/2026-10-13/ai-hn.md` … `2026-10-22/ai-hn.md` (title link, discussion link, points, comments), route them with Jev into a scratch cache under `.scratch/digest-structure/`, and print the share per topic and 30 random routings with their titles. The archive has no page descriptions, so the check routes on less than production does: print that. Paste the output under `## Comments` here. It needs `TYPESAFE_API_KEY`. If the shell cannot load it, stop and report the exact command for the maintainer to run.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.

## Docs

AGENTS.md, current state only: the HN, Dev.to and Lobste.rs bullets under Tracked sources (daily, the tags, the floor, 40 stories, the shown rule); a Spotted bullet (routing, cache, log, caps, trace); the Architecture phases (news matching reads the fresh pool; the Spotted step); the file table (`src/spotted/*`); the Report outputs row of `ai-agents.md` and `ai-data.md`.

## Out of scope

The Models page and retiring the Discussions page (ticket 03). The weekly Most discussed (ticket 04).

## Comments

- Stories are deduplicated by link across sources and days (`linkKey`), and the first source's copy wins.
