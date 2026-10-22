# Coming up on the Overview and in Telegram

Status: ready-for-agent
Blocked by: 02, 03

Spec: the Overview paragraph in `../spec.md`.

The digest answers "what is coming up" in one place: the day's Overview in the web UI, and the Telegram message.

## Data

Every daily run writes `digests/YYYY-MM-DD/coming-up.json`: the dated items of the next 30 days from every page, nearest first, by code from state the run already keeps. No LLM call.

- AI Policy: `upcomingDeadlines` (`src/policy/deadlines.ts`), the open deadlines in `policy-state.json` plus `policy.calendar`.
- Data Engineering: the `actions` in `data-state.json`, the end dates of reported deprecations.
- AI Models & Labs: stealth models with an `expires` date.

Entry: `{ date, title, link, source, page }`, where `page` is the report id. Read the states after the builders saved them. The file is written on a day a page is skipped too, since it describes state, not that day's report. It is not a report and not in `REPORT_FILES`. `scripts/regen-highlights.ts` leaves it alone.

## Rendering

- Web UI (`index.html`): the Overview (`#YYYY-MM-DD`) shows a "Coming up" list after the highlights: the date, the title linked, the page's name from the manifest labels. A day without the file shows nothing.
- Telegram (`buildMessage`, `src/cli/notify.ts`): a "Coming up" block after the highlights, at most 5 entries, none when empty.
- The Teams card stays as it is.

## Check

- Unit tests: the builder (merge, order, the 30-day window, empty and failed sources) and `buildMessage` with and without entries.
- The Overview in a browser: serve the repo root locally, open a day with a hand-made `coming-up.json`, screenshot the section.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.

## Docs

AGENTS.md (Report outputs row for `coming-up.json`, the Web UI paragraph, the Telegram line) and README.
