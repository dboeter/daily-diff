# Report skeleton: the data report with its repo sections

Status: resolved
Type: task
Blocked by: none

Tracer bullet: a daily `ai-data.md` report (label `data`) built from the tracked repos only, published like every other report. Later tickets add vendor feeds, Data × AI and Teams.

## Scope

- Report registry entry (emoji, name "Data Engineering Watch", label `data`), label color, `REPORT_FILES`, highlights prompt source; the fixed section headings in `src/i18n.ts`.
- Three new `SECTION_KEYS` (Databricks projects, Snowflake projects, open-source stack) with `title`, `subject`, `repos` in `config.yml`, checking each repo's release practice (quirks as comments, as in the agents list). `loadConfig` throws on a key without a config section and `pnpm readme --check` runs in pre-commit and CI, so the keys, their config sections and their README `<!-- tracked:<key> -->` markers land in one change.
- The agents report builds only `agents` and `infra`, and the data report only its own keys, in the same change: otherwise the agents report renders the data sections.
- `buildDataReport` returning a `SavedReport` (null on a day with nothing new), one LLM call per repo section with a length cap, quiet-projects line, failed call → fixed notice. Calls count toward the health gates.
- Docs: AGENTS.md (overview scope, source files, report outputs, tracked sources), README.

## Done when

- `buildDataReport` tests pass: section order (Databricks, Snowflake, open source), empty sections left out, quiet line, null skip, failed call notice.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm readme --check` pass; a local run writes `ai-data.md` and an unchanged `ai-agents.md` layout.

## Comments

2026-10-17, branch `data-watch` (uncommitted):

- `ai-data` is a live report: `REPORTS`, label `data`, `LABEL_COLORS`, highlights prompt reader line, MCP report-type list.
- `DATA_SECTION_KEYS` (`databricks`, `snowflake`, `data_stack`) are part of `SECTION_KEYS`; `index.ts` builds the agents report from `CONFIG.agents`/`CONFIG.infra` only, and the data report from `DATA_SECTIONS`.
- `buildDataReport` (`src/data-reports.ts`) reuses `buildProjectReportContent` with `omitQuietGroups`.
- The section headings are the config `title`s, in the agents layout (each section has its own Overview); the report has no Highlights / Worth a Look yet. The spec's fixed i18n headings are deferred to 03, where the vendor sections and Data × AI need the spec layout anyway.
- The section length cap is the agents prompt's (overview of 3–5 sentences, at most 3 bullets per project). The tickets that follow revisit it with the vendor items.
- Repo list checked live: 17 repos. Left out, with reasons in `config.yml`: dbt-snowflake, dbt-fusion, Spark, Kafka, Flink, databricks-sdk-py. Renamed: `dbt-labs/dbt`, `SQLMesh/sqlmesh`.
- Checks: typecheck, lint, 622 tests (3 new `buildDataReport` tests and a missing-`data_stack` config test), `format:check` and `readme --check` all pass.
- Live check, without an LLM key: GitHub fetch for all 17 repos, rendered with placeholder summaries. Last 24h (a Saturday): nothing new, so the report would be skipped. Last 7 days: 8 active projects across 3 sections.
- Not run: a full `pnpm start`. It needs an LLM key and would overwrite the committed 2026-10-17 digest.
