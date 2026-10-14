# Report skeleton: the policy report end to end with one source

Status: resolved
Blocked by: none

Tracer bullet: a daily report that fetches one source, diffs it against a state file, and publishes. Every later ticket adds a source to it.

## Scope

- Register the report per AGENTS.md "Adding a new report type": `REPORTS` entry (emoji, name, label; ⚖️ "Policy Watch", label `policy`), `LABEL_COLORS`, `REPORT_FILES`, daily (not in `WEEKLY_REPORT_IDS`). File `digests/YYYY-MM-DD/ai-policy.md`.
- `config.yml`: a `policy` key with its schema in `src/config.ts` (`RawConfig`/`RadarConfig`/`loadConfig`; an unknown key is silently ignored). Holds the watchlist (empty lists per jurisdiction for now) and the reader profile from `../spec.md`.
- State file `digests/policy-state.json` (committed, like `web-state.json`): item ids already reported, plus the last stage per watchlisted item. Written once the report is built; a same-day re-run must report the same items.
- First source: the Commission digital-strategy RSS (`https://digital-strategy.ec.europa.eu/en/rss.xml`), new items since the last run, all kept (no relevance filter yet). **News-feed age limit:** skip items older than 7 days on every run — news missed during a gap between runs is no longer new (maintainer, 2026-10-14). Build it as a shared helper: every RSS news feed (EDPB, AP, Rijksoverheid, RDI, news & commentary) uses it.
- Report body: code renders the table (date, source, title link); the LLM writes the Highlights, the per-row summaries and Signals / Worth a Look, following the `SECTIONS` layout and `NO_TITLE_RULE`. Skip the report on a day with no new items.

## Done when

- `pnpm start` with a forced empty state writes `ai-policy.md` with the feed's items; a second run the same day writes the same items; a run with the state up to date writes no report.
- Tests for the state diff and the table renderer; `pnpm test`, `pnpm typecheck`, `pnpm lint` pass.
- AGENTS.md (source files, report outputs, tracked sources) and README updated.
