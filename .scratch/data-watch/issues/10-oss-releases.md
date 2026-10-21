# Make the open-source stack visible

Status: resolved
Type: task

## Evidence

"Active today: 0" on 2026-10-19, -20 and -21. Not a fetch bug: the 17 repos release about weekly (Trino 484 on 10-16, MLflow 3.17.1 on 10-13, dbt-core 2.0.8 on 10-14) and the repo window is 24 h, so most runs see nothing. A section whose repos are all quiet shows no quiet line, so the reader cannot tell the stack is tracked at all. DuckDB 2.0.0 and MLflow 3.17.2 shipped on 2026-10-21, after that run.

## Scope

- A code-rendered `## Releases this week` table (project, version, date, one-line summary from the row-summaries call) over the data repos' stable releases of the last 7 days, deduplicated across days the way the vendor rows are (a release shows once, then not again). Alternative to weigh first: widening the data report's `PROJECT_SCOPE` window to 7 days with the existing per-section LLM bodies. Pick the one that does not repeat a release on seven consecutive days.
- The quiet-projects line is shown for every data section, also when all its repos are quiet.
- A major version (x.0.0, or a version whose notes name breaking changes) is a Highlights candidate: the prose prompt is told so.
- Agents report untouched.
- Docs: AGENTS.md (layout, data engineering sources).

## Done when

- Tests: a release from 3 days ago appears once and not on the next run; an all-quiet section shows its quiet line; the agents report's output is unchanged.
- All checks pass.

## Decision

The table, not a 7-day window for the repo sections (that would repeat a release on seven consecutive days). Releases are fetched over 7 days from the same request as the daily ones; each shown release is saved as `release:<repo>@<tag>` in `digests/data-state.json`'s `reported`, so it shows once. A release from the last 24h also appears in its repo section on that day. Summaries come from the vendor summaries call, numbered after the vendor rows.
