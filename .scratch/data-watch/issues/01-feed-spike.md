# Vendor feed spike

Status: resolved
Type: research
Blocked by: none

For each candidate vendor source in `../spec.md` (Databricks platform release notes AWS/Azure, Databricks blog, Snowflake release notes: server, Snowpark, Cortex; Snowflake blog, Microsoft Fabric blog, Azure updates, BigQuery release notes), find out whether it can feed the daily report:

- Feed or page: an RSS/Atom feed (`<link rel="alternate">` in the page head, known feed paths) is a config line; a page without one needs its own parser module.
- Server-rendered: `fetchOk` runs no JavaScript, so the item list must be in the raw HTML.
- Stable item id and date per item: what the id would be (anchor, URL, title + date) and whether every item carries a parseable date (the state file and the first-run 7-day limit need it).
- Volume: items per day over the last 2–4 weeks, a typical and a busy day (the length cap is sized from these).
- Noise: share of marketing (webinars, customer stories, event recaps) versus product change, judged from titles.
- Reachability: fetched with the `daily-diff/1.0` User-Agent of `src/http.ts`; from GitHub Actions _unverified_ unless run there.

Output: a table per source plus a recommendation (use / use with caveat / drop), under `## Answer`.

## Answer

Spike run 2026-10-17 (a Saturday) from WSL, every request with `User-Agent: daily-diff/1.0`. Volumes are counted over the 28 days 2026-09-19..10-16 from each source's item dates. "Product" versus "marketing" is judged from titles. Reachability from GitHub Actions is _unverified_ for every source.

Kept: five sources. Three are RSS 2.0 feeds that `parseRssItems` (`src/rss.ts`) reads as they are: Azure Databricks, Fabric and Azure updates, each a config line. Two need a parser module:

- BigQuery: an Atom feed with one entry per day, which `rss.ts` does not read (it matches `<item>` and `pubDate` only).
- Snowflake: no feed, but one page carries its release notes as server-side JSON.

Both vendor blogs are dropped: their product posts repeat the release notes.

### Databricks

**Databricks docs release-notes feed**: use (Azure variant).

| Aspect         | Finding                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access         | `https://learn.microsoft.com/en-us/azure/databricks/feed.xml` (Azure Databricks) and `https://docs.databricks.com/aws/en/feed.xml` (AWS). RSS 2.0, no key. The AWS feed is 1.7 MB and holds every note back to 2025-01-15 (1,372 items). The release-notes HTML pages have no `<link rel="alternate">`; the feed is announced in the 2025/july release notes.                                                   |
| Fields         | `title`, `link` = page + anchor (`…/release-notes/product/2026/october#saving-an-unchanged-job-…`), `guid` = the same URL, `pubDate` (date only), `description` (~300–1,200 chars), `category` (e.g. `Generative AI`, `Product`, `Jobs`). The feed covers product, AI/BI (Genie), SQL, runtime and Unity Gateway notes.                                                                                         |
| Id / date      | `guid` is stable. **One note can appear twice under different guids** (once on its topic page, once on the monthly product page: 153 items, 126 unique titles in 28 days), so dedupe on title + date. **Dates can be ahead of the run**: on 2026-10-17 one item was dated 2026-10-19 (the release date, not the publication date). Use the guid for the state, and don't treat a date in the future as invalid. |
| Volume         | 153 items (126 unique) over 23 days. Median 6 a day, busiest day 17.                                                                                                                                                                                                                                                                                                                                            |
| Noise          | No marketing; every item is a product note. Some are niche for the team (new models on Unity Gateway, region rollouts). Deprecations are announced as notes ("DeepSeek V4 Pro … is scheduled for retirement").                                                                                                                                                                                                  |
| AWS vs Azure   | 120 of 127 recent titles are shared. Each feed has ~6 cloud-specific items (AWS PrivateLink and AWS-only models; Azure Private Link, Copilot Studio, Azure disk retirements).                                                                                                                                                                                                                                   |
| Recommendation | **Use the Azure feed** (Digital Power's clients are mainly on Azure; switching is a URL change). It is the main Databricks source.                                                                                                                                                                                                                                                                              |

**Databricks blog** (`https://www.databricks.com/feed`): drop.

| Aspect         | Finding                                                                                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape          | RSS 2.0, only the newest 10 items (3 days), descriptions of ~90 chars.                                                                                                                                                                                          |
| Noise          | 5 of 10 are product posts (Transactions GA, Lakebase sync, geospatial speed-up, Predictive AI Functions, Document Intelligence), and each of those is a release note too. The rest are customer stories (Atlassian, FactSet) and research (LLM malware triage). |
| Recommendation | **Drop.** The release notes cover the product changes with exact dates.                                                                                                                                                                                         |

### Snowflake

**Snowflake "All release notes" page**: use with caveat (needs a parser).

| Aspect         | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access         | No RSS or Atom: no `<link rel="alternate">`, and `/feeds/releases.xml`, `/feeds/new-features.xml` and `/release-notes/feed.xml` all answered 404. The page `https://docs.snowflake.com/en/release-notes/all-release-notes` (245 KB) is a Next.js page with its data server-side in `<script id="__NEXT_DATA__">`: `props.pageProps.releases`. The `.md` variant the page advertises answered 404.                                                                                                                                                                                                                                                                                                         |
| Fields         | Per release: `changeType` (`Feature Update`, `Server Release`), `date` (one date, `[start, end]` for a weekly server release, or `["Upcoming"]` for the next one), `title` (`"Oct 16, 2026: …"`), `source` (stable path, e.g. `/release-notes/2026/other/2026-10-16-cortex-ai-gateway-regions`), `keywords`, `summary`, `content` (HTML).                                                                                                                                                                                                                                                                                                                                                                 |
| Id / date      | Id = `source` (a server release's `source` is shared by its several announcements, so key it as `source` + `title`). Date = the last element of `date`. `Upcoming` has no date: the next server release, with its behavior changes in preview.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Filters        | Default view: "Last 30 days", Server & Feature Updates. `?bundle=false` works (66 rows instead of 63: server releases unbundled). `changeType` is not settable by query string (`?changeType=all` was ignored), so client, driver, connector and Openflow releases are out of reach here. The tracked GitHub repos (connector, Snowpark) cover the main ones.                                                                                                                                                                                                                                                                                                                                             |
| Volume         | 66 items in 30 days (2026-09-17..10-16) over 23 days. Median 2 a day, busiest day 9 (2026-09-24).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Noise          | No marketing. Many items are AI/Cortex (new models on Cortex, Cortex Agents, CoCo Desktop), which suits Data × AI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Deprecations   | Behavior changes ship in monthly bundles (`2026_08`…), announced in the weekly server releases ("10.37 Release Notes (with behavior changes) (Preview)"). `/en/release-notes/behavior-changes` (200, server-rendered) is a prose table, one row per bundle with a status text ("Planned to be introduced, Disabled by Default, in the 10.37 release (October 7-13, 2026)…"), linking to `/en/release-notes/bcr-bundles/<yyyy_mm>_bundle`. Its `__NEXT_DATA__` holds the page as `content`/`mdx`, not as dated items. It fits a stage item (id = bundle, stage = status), like Policy Watch's procedures, at about one stage change a month: a candidate addition to ticket 03, with its own small parser. |
| Recommendation | **Use with caveat.** One parser module: `parseSnowflakeReleases(html)` reads the `__NEXT_DATA__` JSON; zero releases or missing JSON throws (markup changed).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**Snowflake blog** (`https://www.snowflake.com/feed/`): drop.

| Aspect         | Finding                                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape          | RSS 2.0, newest 20 (back to 2026-09-25), descriptions of ~150 chars.                                                                                                                      |
| Noise          | 8 of 20 are product posts (Data Mirroring GA, Semantic Studio, Cortex AI Gateway, model launches), each also a release note. The rest are partnership, industry and public-sector pieces. |
| Recommendation | **Drop.**                                                                                                                                                                                 |

### Azure / Fabric and GCP

**Microsoft Fabric blog feed** (`https://blog.fabric.microsoft.com/en-us/blog/feed/`): use with caveat.

| Aspect         | Finding                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access         | RSS 2.0, 632 KB. **The blog HTML answered 403 to `daily-diff/1.0`; the feed answered 200.** Item links point to `community.fabric.microsoft.com/t5/Fabric-Updates-Blog/…`.                  |
| Fields         | `guid` = the link (stable), `pubDate`, `title` (often tagged `(Preview)` / `(Generally Available)`), `description` = the full post HTML (up to ~12 KB; truncate before Jev and the prompt). |
| Volume         | 20 items (back to 2026-09-25) over 9 days. Median 1 a day, busiest day 6 (a FabCon week).                                                                                                   |
| Noise          | ~6 of 20 are event recaps or community posts (FabCon/SQLCon roundups, "Fabric Influencers Spotlight"). The monthly "Feature Summary" is the most useful single item.                        |
| Recommendation | **Use with caveat.** Jev's real-change question drops the event recaps.                                                                                                                     |

**Azure updates feed** (`https://www.microsoft.com/releasecommunications/api/v2/azure/rss`): use with caveat.

| Aspect         | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fields         | RSS 2.0, 200 items. `guid` = numeric update id (stable); link `azure.microsoft.com/updates?id=<id>`. Titles are prefixed `[In preview]`, `[Launched]`, `Retirement:`. Several `category` elements per item: status (`Launched`, `In preview`, `Retirements`) and product (`Databases`, `Azure SQL Database`, `Azure Databricks`, `Analytics`…). Descriptions are cut at ~255 chars. `pubDate` ends in ` Z` (`Fri, 16 Oct 2026 16:59:02 Z`), which is not RFC 822; Node's `Date.parse` accepts it (checked).                                 |
| Volume         | 76 items in 28 days over 18 days. Median 2 a day, busiest day 27 (all of Azure).                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Noise          | Covers every Azure service: VMs, AKS, IoT, .NET runtimes. 19 of 76 were retirements, mostly outside data. A product-category filter (Databases, Analytics, Azure Databricks, AI + machine learning, Azure SQL, PostgreSQL, Storage) or a title match (Fabric, Databricks, Synapse, Data Factory, Purview, Cosmos, Event Hubs) kept 32 of 76. That is still broad (SQL Server on VMs, NetApp, VM restore points).                                                                                                                            |
| Recommendation | **Use with caveat.** Filter by category in code before Jev (a `categories` list in the feed's config), and let Jev's relevance decide the rest. The `Retirements` category is a direct deprecation signal. It overlaps the Databricks feed: the same week carried "Public Preview: Azure Databricks Private network gateway" here and "Billing for private network gateway" in the Azure Databricks notes. So leave the `Azure Databricks` category out of the filter (the Databricks feed covers it), or put those items under Databricks. |

**BigQuery release notes feed** (`https://cloud.google.com/feeds/bigquery-release-notes.xml`): use with caveat (needs splitting).

| Aspect         | Finding                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access         | Atom, 38 KB, newest 30 entries (back to 2026-08-25). The page's `<link rel="alternate">` points to `/static/feeds/bigquery-release-notes.xml`, which answered 404 (an HTML page); the `/feeds/` URL works.                                                                                                                                      |
| Shape          | **One entry per day**, titled with the date (`October 14, 2026`), id = page anchor (`#October_14_2026`). The individual notes are inside `content`, each under an `<h3>` type: `Feature` (33 in 28 days), `Change` (1). Other types (`Deprecated`, `Breaking`, `Issue`, `Fixed`, `Announcement`) did not occur in the 30 entries: _unverified_. |
| Id / date      | The entry is stable per day, but the notes inside it are the unit to report: split `content` on `<h3>` and key each note as anchor + index or + a hash of its text. Notes added to an existing day later (if Google does that; _unverified_) would show up as new keys.                                                                         |
| Volume         | 17 entries in 28 days (~1 per weekday), ~2 notes per entry (up to 5).                                                                                                                                                                                                                                                                           |
| Noise          | No marketing. The `<h3>` type would mark deprecations and breaking changes without Jev, if Google uses such types (unverified, see Shape).                                                                                                                                                                                                      |
| Recommendation | **Use with caveat.** It needs its own parser module: `rss.ts` reads RSS 2.0 only, and its `plainText` flattens and truncates the description that the split needs as HTML. `parseBigQueryNotes(xml)` reads the Atom entries and splits each on `<h3>`; zero entries throws.                                                                     |

### Volume for the length cap

Raw items a day from the kept sources, before Jev:

| Source                                    | Typical day | Busy day                     |
| ----------------------------------------- | ----------- | ---------------------------- |
| Databricks notes (deduped)                | ~5          | ~15                          |
| Snowflake notes                           | 2           | 9                            |
| Fabric blog                               | 1           | 6                            |
| Azure updates (after the category filter) | ~1          | ~10 (_estimated_ from 32/76) |
| BigQuery notes                            | 2           | 5                            |
| **Total**                                 | **~11**     | **~45**                      |

The busy figures are separate busy days, not one day where everything peaks. A cap of about 12 vendor items in the report (Databricks and Snowflake first), with deprecations and breaking changes always kept, would cover a typical day in full. Jev's real-change and significance answers would then trim a busy day. Set the final number in ticket 03.

### Decisions for ticket 03

- Config: 5 sources.
  - RSS through `rss.ts`: the Azure Databricks feed, the Fabric feed, Azure updates (plus a category filter, without `Azure Databricks`).
  - Parser modules: Snowflake (`__NEXT_DATA__`) and BigQuery (Atom plus the `<h3>` split).
- Dedupe within a run on normalized title + date (Databricks).
- Item dates can be in the future (Databricks) or a range or `Upcoming` (Snowflake).
- Truncate descriptions (Fabric: full posts).
- Open: Snowflake's behavior-change page as a deprecation source; AWS instead of Azure Databricks is a one-line config change.
