# EU consultations and the Upcoming deadlines section

Status: needs-triage
Blocked by: 04

## Scope

- "Have your say" (`ec.europa.eu/info/law/better-regulation/brpapi/searchInitiatives`): snapshot AI-related initiatives each run, report a changed `frontEndStage` or an opened feedback period. Undocumented backend: fail soft.
- An **Upcoming deadlines (next 30 days)** section rendered in code from every source's deadline field (`feedbackEndDate` here; later tickets add Federal Register `comments_close_on`, Regulations.gov `commentEndDate`, internetconsultatie `Sluitingsdatum`) plus a dated calendar in the `config.yml` watchlist (e.g. AI Act application dates).
- The section shows on every report day; it does not by itself make a report day.

## Done when

Tests for the deadline window and sorting; a live run shows open AI consultations with their closing dates.
