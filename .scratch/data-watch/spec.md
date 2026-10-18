# Data Engineering Watch

Status: ready-for-agent

## Problem Statement

The maintainer works at Digital Power, a Dutch data consultancy. Its data engineers work mainly on Databricks and Snowflake, and also on Azure/Microsoft Fabric, GCP/BigQuery and dbt. Changes in that stack reach clients first and consultants second: a deprecation, a breaking release, a new AI feature in Databricks or Snowflake, or a new EU data law. Nobody on the team follows all the vendor release notes, open-source releases and community news every day. Daily Diff already does this for AI coding agents and AI policy, but its reports cover the wrong subject for these colleagues, and they are published only to GitHub Issues, the web UI and Telegram, while the team reads Microsoft Teams.

## Solution

A new daily **Report**, "Data Engineering Watch", for colleagues at Digital Power. It reports what changed yesterday in their stack:

- Databricks and Snowflake first: platform release notes, plus the open-source projects each vendor maintains.
- A short block on Azure/Fabric and GCP/BigQuery.
- Releases and Hot Issues of the open-source data stack.
- A "Data × AI" section: AI features in data platforms, and AI tooling built for data work.

Deprecations and breaking changes come first. A day with nothing new produces no report. Each Run posts the report's **Highlights** and a link to the full report to a Teams channel. The report is also a GitHub Issue, a page in the web UI and an RSS item, like every other report.

## User Stories

1. As a Digital Power data engineer, I want one daily post in our Teams channel, so that I see what changed in our stack without visiting another site.
2. As a data engineer, I want the Teams post to show a few highlights and a link to the full report, so that I can decide in seconds whether to read further.
3. As a data engineer, I want Databricks news at the top of the report, so that our main platform is never buried.
4. As a data engineer, I want Snowflake news right after Databricks, so that our second main platform gets the same attention.
5. As a data engineer, I want platform release notes summarized, so that I don't have to read every vendor's changelog page.
6. As a consultant, I want deprecations, retirements and breaking changes marked and listed first, so that I can warn clients before something breaks.
7. As a consultant, I want each item linked to its source, so that I can check details before passing them on to a client.
8. As a data engineer, I want stable releases of the open-source projects we use (dbt, Airflow, Dagster, Spark, Delta Lake, Iceberg, DuckDB…) summarized, so that I know when to upgrade.
9. As a data engineer, I want prereleases left out, except for a project with no stable release yet, so that the report isn't full of nightlies.
10. As a data engineer, I want hot issues (new, heavily discussed, or labelled regression/security) on those projects, so that I hear about regressions before I hit them.
11. As a data engineer, I want projects with nothing new listed on one line, so that the report stays short on quiet days.
12. As a data engineer, I want vendor-maintained open-source projects (delta-io/delta, Unity Catalog, MLflow, dbt-databricks, Snowpark, Apache Polaris, dbt-snowflake…) shown under their vendor, so that all of one platform's news is in one place.
13. As a data engineer working on Azure, I want Microsoft Fabric and Azure data-service updates in a short block, so that I'm covered without a daily Microsoft marketing feed.
14. As a data engineer working on GCP, I want BigQuery release notes in the same block, so that GCP clients are covered too.
15. As a consultant, I want a "Data × AI" section on AI features in data platforms (Snowflake Cortex, Databricks Genie / Agent Bricks, text-to-SQL, MCP servers for warehouses, agents in data tooling), so that I can advise clients on where the stack is heading.
16. As a consultant, I want the Data × AI section to draw on all sources (vendor notes, releases, Hacker News, trending repos), so that it isn't limited to what vendors announce.
17. As a data engineer, I want vendor marketing posts (webinars, customer stories, event recaps) filtered out, so that the report contains only real changes.
18. As a data engineer, I want items I saw yesterday left out today, so that the report never repeats itself.
19. As a data engineer, I want Hacker News stories about our stack included when they are about a tracked project or vendor, so that I see community reaction to big changes.
20. As a data engineer, I want the report in English with the same layout as the other reports, so that it reads like the rest of Daily Diff.
21. As a data engineer, I want the report to stay short (a fixed length cap), so that a busy Snowflake release day doesn't produce an unreadable wall of text.
22. As the maintainer, I want the tracked repos and feeds kept in the config file, so that adding or dropping a project is a config edit.
23. As the maintainer, I want README's tracked-repo table for the data section generated from the config, so that it never goes stale.
24. As the maintainer, I want a failing vendor feed logged and skipped, so that one broken source doesn't cost the whole report.
25. As the maintainer, I want the Teams post skipped silently when its webhook secret is unset, so that forks and local runs don't fail.
26. As the maintainer, I want a failed Teams post logged and visible on the Actions run page, so that I notice when the channel stopped receiving reports.
27. As the maintainer, I want the Teams post to contain only the data report, so that colleagues don't receive the agents and policy reports they didn't ask for.
28. As the maintainer, I want the Teams webhook tested against a private channel before it points at the team channel, so that a broken card never reaches colleagues.
29. As the maintainer, I want the LLM health gate to cover the new report's calls, so that a provider outage publishes nothing instead of a placeholder digest to Teams.
30. As the maintainer, I want the data report's Highlights in highlights.json, so that the web UI's day overview and Telegram show it too.
31. As the maintainer, I want vendor relevance decided by Jev with a saved verdict per item, so that each item is judged once and I can fix a wrong verdict by editing a file.
32. As the maintainer, I want the vendor feeds to keep working without the Jev key (falling back to keyword rules), so that a missing key degrades the report instead of skipping it.
33. As the maintainer, I want a trace file of every vendor item with its verdict, so that I can see why an item was kept or dropped without rerunning Jev.
34. As a consultant, I want EU data-law items (Data Act, Data Governance Act, NIS2) to appear in the report when Policy Watch reports them, so that regulation affecting data platforms reaches the data team.
35. As a data engineer, I want the report bar to link to the day's other reports, so that I can find Policy Watch or the agents report if I want them.

## Implementation Decisions

- **New report.** A new live entry in the report registry: emoji, name "Data Engineering Watch" (name can still change), label `data`, file `ai-data.md`. Daily, not in the weekly list. Its label gets a color. It follows the existing "Adding a new report type" checklist in AGENTS.md.
- **Report layout.** Sections, in this order: Highlights → Databricks → Snowflake → Azure / Fabric & GCP → Open-source stack → Data × AI → Worth a Look. A section with nothing new is left out. The headings are fixed strings in the i18n module; the prompt names them exactly and forbids a title, as in the other reports.
- **Repo-backed sections reuse the agents-report path.** Tracked projects live in the config file under new section keys (one section key per repo group: Databricks projects, Snowflake projects, open-source stack). Each gets a `title`, `subject` and `repos`, loaded as a `SectionConfig`, with README markers filled by `pnpm readme`. Releases, prereleases, hot issues, quiet projects and news matching work exactly as in the agents report. The data report assembles these sections into its own file; they do not appear in the agents report.
  - Starting repo list (refine during implementation, checking each repo's release practice): Databricks: delta-io/delta, unitycatalog/unitycatalog, mlflow/mlflow, databricks/cli, databricks/databricks-sdk-py, databricks/dbt-databricks. Snowflake: snowflakedb/snowpark-python, snowflakedb/snowflake-connector-python, apache/polaris, dbt-labs/dbt-snowflake (or its current home). Open source: dbt-labs/dbt-core, dbt-labs/dbt-fusion, tobymao/sqlmesh, apache/airflow, dagster-io/dagster, dlt-hub/dlt, apache/spark, apache/iceberg, duckdb/duckdb, pola-rs/polars, apache/kafka, apache/flink, trinodb/trino.
  - The section keys are part of `SECTION_KEYS`, so the agents report's code must build only its own keys, and the data report only its own.
- **Vendor feeds are a new source type, like Policy Watch's feeds.** A `data.feeds` list in the config, one entry per feed with its vendor (`databricks`, `snowflake`, `azure`, `gcp`), URL and parser. RSS feeds use the existing RSS module. Release-notes pages without RSS get one parser module each, exposing a pure `parseXxx(body) → items` function and a `fetchXxx` that calls it. The spike (ticket 01) settled the sources:
  - RSS feeds: the Azure Databricks release notes, the Microsoft Fabric blog, and Azure updates filtered to data categories.
  - Parser modules: Snowflake's "All release notes" page (server-side JSON), Snowflake's behavior-change bundles (one stage item per bundle) and the BigQuery release notes (Atom, split into notes).
  - Dropped: the Databricks and Snowflake blogs. Their product posts repeat the release notes; the rest is customer stories and partnerships.
- **State.** Seen vendor item ids go into a committed state file in the digests folder, keyed by id with the CST date first reported. Like Policy Watch, an item first reported today is still new for a same-day re-run, and ids older than 30 days are pruned. Missing or malformed state reads as a first run. A first run applies a 7-day age limit so it doesn't report a vendor's whole history.
- **Relevance.** Each new vendor item gets one Jev request: is it a real product change (vs marketing, event, customer story), is it a deprecation/retirement/breaking change, is it about AI in data work, and a significance score. Weights live in code, as in Policy Watch's relevance. Kept items are ordered with deprecations and breaking changes first, then by relevance. Verdicts are cached in a committed file, one item per line; the trace goes to the day folder (not a report). Without `TYPESAFE_API_KEY`, or when more than half the calls fail, items without a saved verdict fall back to keyword rules (deprecat/retire/breaking/end of support/GA/preview, plus AI terms).
- **Data × AI section.** The LLM writes it from items flagged as AI-related by Jev, the release notes of tracked projects, and news matched to data projects (Hacker News, trending). News matching uses the existing matcher with data-project names and keywords. Short or ambiguous names (e.g. "dlt", "Delta", "Polaris") need explicit `keywords`, as Pi does in the agents config.
- **LLM calls.** One call per repo-backed section (as in the agents report) and one for the vendor and Data × AI prose. Section bodies are capped with a length rule like the Skills cap, sized so the Teams card and the report stay readable. Calls go through the existing rate limiter and count toward the health gates.
- **Policy cross-link.** EU data-law items come from Policy Watch's data: the existing policy watchlist and keyword list gain the Data Act, Data Governance Act and NIS2. Policy items whose verdict marks them as data law are linked from the data report's Worth a Look. They are not fetched twice. This is the last ticket and can be cut.
- **Teams delivery.** A new pure function `buildTeamsCard(date, highlights, pagesUrl) → Adaptive Card JSON`, next to the Telegram `buildMessage`, and a sender that posts it to a Power Automate Workflows incoming webhook (`TEAMS_WEBHOOK_URL`, a repo secret). Office 365 connector webhooks are being retired, so Workflows is the route. The card contains only the data report: title, date, its Highlights, a button to the report on GitHub Pages. Unset secret → skip silently. Non-2xx → log, append a warning to the step summary, and do not fail the run (the report is already published). It runs in the existing notify step after the issues are opened, so the health gates have already passed.
- **Highlights.** The highlights prompt gains the data report as a source and names deprecations, breaking changes and major platform features as eligible highlights.
- **Docs.** AGENTS.md (source files, report outputs, tracked sources, the Teams step), README (report list, tracked tables) and the glossary (any new term, e.g. Vendor Feed) are updated in the same changes that introduce them.

## Testing Decisions

- A good test drives a public function with realistic input and checks its observable output (the report Markdown, parsed items, card JSON). It never asserts on internal helpers or call order.
- **Report seam:** `buildDataReport` called with fetched data and a mocked `callLlm`, asserting the returned `SavedReport`: section order, Databricks before Snowflake, deprecations first, empty sections left out, quiet-projects line, skip (null) on a day with nothing new, a failed LLM call degrading to the fixed notice. Prior art: the `buildPolicyReport` and `buildDiscussionsReport` tests, and `buildProjectReportContent` in the report-builders tests.
- **Parser seam:** one pure parse function per non-RSS vendor source, tested on a trimmed live fixture in the fixtures folder (kept as served; HTML fixtures are already excluded from Prettier). Assert ids, titles, dates, links and the empty/changed-markup case (zero parsed throws). Prior art: the Internetconsultatie and Have your say tests and fixtures.
- **Teams seam:** `buildTeamsCard` tested as a pure function: valid Adaptive Card shape, date, highlights escaped, report link built from the Pages URL, no highlights → card still links the report. Prior art: `buildMessage` in the notify tests.
- Relevance weighting and the keyword fallback are tested through the report seam or a pure select function, as in the policy-jev tests; the network is never hit in tests.

## Out of Scope

- A weekly data trending section (GitHub topic search for data topics). Candidate follow-up once the daily report has proven useful.
- Reddit r/dataengineering and Substack newsletters (Substack answered HTTP 403 to every GitHub Actions run when tried for Policy Watch).
- Security advisories (GitHub Advisory Database) for the tracked packages. Candidate follow-up.
- Posting the other reports to Teams, or Teams threads, replies and mentions.
- AWS data services and other warehouses (Redshift, ClickHouse Cloud, MotherDuck) beyond what the open-source repos cover.
- A Dutch-language version.
- Changing the agents report's scope or contents.

## Further Notes

- Posting to a workplace Teams channel is outward-facing: point the webhook at a private test channel first and switch it to the team channel only after the maintainer has approved a real card.
- Daily Diff's documented focus (AI coding and agents plus AI policy) widens with this report. AGENTS.md's overview should say so.
- Volume risk: Snowflake and Databricks release notes can list dozens of items on release days. The spike should measure a typical and a busy day, and the length cap should be set from those numbers.
- Suggested ticket order: 01 feed spike → 02 data report skeleton with repo sections → 03 vendor feeds + state + Jev relevance → 04 Data × AI section and news matching → 05 Teams card and sender → 06 policy cross-link.
