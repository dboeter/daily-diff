# Teams card and sender

Status: ready-for-human
Type: task
Blocked by: 02

## Scope

- Pure `buildTeamsCard(date, highlights, pagesUrl)` next to Telegram's `buildMessage` in `src/notify.ts`: title, date, the data report's highlights, a button to the report on GitHub Pages.
- Sender to a Power Automate Workflows webhook (`TEAMS_WEBHOOK_URL`, repo secret). Verify the payload shape against Microsoft's docs before writing it (the Workflows trigger expects a `message` envelope with an Adaptive Card attachment, not a bare card, unverified).
- Unset secret → skip silently; non-2xx → log + `$GITHUB_STEP_SUMMARY` warning, run does not fail. Runs in the existing notify step.
- Docs: AGENTS.md (Teams step), workflow secret.

## Done when

- `buildTeamsCard` tests: card shape, date, escaped highlights, report link, no highlights → still links the report.
- A real card posted to a private test channel and approved by the maintainer before the secret points at the team channel.

## Comments

2026-10-17, branch `data-watch` (uncommitted):

- `buildTeamsCard` + `sendTeams` in `src/notify.ts`; `TEAMS_WEBHOOK_URL` in the notify step's env. Envelope confirmed against learn.microsoft.com/en-us/connectors/teams/ ("Microsoft Teams - Webhook"): `type: "message"`, one attachment `application/vnd.microsoft.card.adaptive`, `contentUrl: null`. Card version 1.2 (Microsoft's webhook sample); success status and version limit undocumented, any 2xx counts.
- Highlights are TextRuns (no Markdown parsing), so nothing needs escaping.
- Tests and the four checks pass. Nothing posted.
- Open: post a real card to a private test channel, maintainer approval, then point the secret at the team channel.
