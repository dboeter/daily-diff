# More tracked repos and Azure data categories

Status: ready-for-human
Type: task
Blocked by: none

## Evidence

The maintainer asked for more data engineering and platform signal (2026-10-30), naming orchestration and transformation, platform vendors, and platform engineering and governance. The data report tracked no lineage, catalog, quality or IaC project, and `Azure updates` kept none of the Azure data services beyond the databases.

## Task

Done in the same change as ticket 12's spike (PR #180); this ticket records the scope so it is not orphaned.

- `config.yml`: ten repos added after a release-practice check on 2026-10-30 (stable releases in 90 days, prerelease ratio, Issues enabled): delta-rs and the Terraform provider under Databricks; the Terraform provider under Snowflake; Prefect, PyIceberg, Great Expectations, Soda Core, OpenLineage, OpenMetadata and SQLFluff under the open-source stack. Checked and left out, with the reason in the config comment: DataHub, Kestra, Marquez, DataFusion, DuckLake. Section `subject` lines reworded to name quality, lineage and catalogs.
- Names that are ordinary words or phrases got `keywords` (Soda Core, Great Expectations, Prefect, both Terraform providers), with routing tests in `project-news.test.ts`.
- The fix-status call cap is derived from the loaded config (`hotIssueStatusCallCap`), so a config edit cannot leave it stale; the worst-case budget in `hot-issues.ts` and AGENTS.md is 895 core calls with 43 repos.
- `Azure updates` `categories`: `Azure Data Lake Storage` and `Azure Cosmos DB` added (both seen in the feed).

## Open

- The category strings for Data Factory, Synapse, Event Hubs, Stream Analytics, Purview and Data Explorer could not be read: none had an item in the feed's 200-item window. `vendors.ts` matches exactly, so a guessed string would silently match nothing. Add each when an item with it appears in the feed (grep the raw feed for the product name), or read the strings from the Azure updates site's filter list.
- Prefect ships two stable lines (3.x weekly, 2.x patches about monthly); both show. Revisit if the 2.x patches turn out to be noise.

## Done when

- The six Azure category strings are either added as read from the feed or recorded here as absent.
