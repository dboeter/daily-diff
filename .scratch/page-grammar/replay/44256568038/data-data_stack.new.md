## dbt Core
- **News:** According to [What's new in dbt: November 2026](https://www.getdbt.com/blog/whats-new-in-dbt-november-2026), dbt adds local unit tests, a free dbt State plan, Wizard Desktop in Public Beta, and dbt Charts in Claude and ChatGPT.

## dlt
- **News:** According to [Introducing datasets and lineage in dltHub](https://dlthub.com/blog/introducing-datasets-and-lineage), dltHub adds datasets and lineage so you can trace where your data comes from and what depends on it; the dltHub datasets UI is now in public preview and Workspace Explorer in private preview.

## Soda Core
- **Release:** [v4.31.0](https://github.com/sodadata/soda-core/releases/tag/v4.31.0) now exits with code 3 when Soda Cloud rejects results for a customer-caused reason, fixes cloud handling so a rejected file is not verified and only contracts are uploaded, and fixes freshness checks to report `NOT_EVALUATED` when the max timestamp was not measured.

## OpenMetadata
- **News:** According to [Announcing OpenMetadata 2.1: Your Business Definitions in the Context Graph](https://blog.open-metadata.org/announcing-openmetadata-2-1-your-business-definitions-in-the-context-graph-54c65a6c6749), OpenMetadata 2.1 adds business definitions to its context graph, so an AI agent asked for last quarter's revenue can tell which of several tables with a revenue column is the one Finance recognizes, rather than returning a plausible but wrong answer.