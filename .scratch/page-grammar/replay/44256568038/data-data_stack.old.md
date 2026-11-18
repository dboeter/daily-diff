## dbt Core

- **News:** dbt Labs' [What's new in dbt: November 2026](https://www.getdbt.com/blog/whats-new-in-dbt-november-2026) post covers local unit tests, a free dbt State plan, Wizard Desktop in Public Beta, and dbt Charts in Claude and ChatGPT.

## dlt

- **News:** dltHub's [Introducing datasets and lineage in dltHub](https://dlthub.com/blog/introducing-datasets-and-lineage) post adds datasets and lineage so users can trace where data comes from and what depends on it, with the dltHub datasets UI in public preview and Workspace Explorer in private preview.

## Soda Core

- **Release:** [v4.31.0](https://github.com/sodadata/soda-core/releases/tag/v4.31.0) fixes freshness checks to report `NOT_EVALUATED` when the max timestamp was not measured, and fixes SQL Server and Fabric to retry statements that hit a snapshot isolation DDL conflict. It also carries each column's soda data type on `ColumnMetadata` and exports `CheckSelector` from `soda_core.contracts`.

## OpenMetadata

- **News:** In [Announcing OpenMetadata 2.1: Your Business Definitions in the Context Graph](https://blog.open-metadata.org/announcing-openmetadata-2-1-your-business-definitions-in-the-context-graph-54c65a6c6749), OpenMetadata introduces business definitions in the context graph. According to the post, an AI agent asked for last quarter's revenue may find several tables with a revenue column and, without business context, cannot tell which figure Finance recognizes or how to apply the fiscal calendar.
