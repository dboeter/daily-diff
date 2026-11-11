# US federal: Federal Register, Regulations.gov, Congress.gov

Status: resolved
Blocked by: 04, 06

## Scope

- Federal Register API: documents published since the last run, kept on a title/abstract AI match, presidential documents, or a watchlisted docket/RIN; `comments_close_on` into Upcoming deadlines.
- Regulations.gov v4 (`USA_GOV_API_KEY`; check first that the api.data.gov key works here): Notice / Proposed Rule / Rule only, `commentEndDate` into deadlines, deduplicated against the Federal Register by docket id.
- Congress.gov v3 (`USA_GOV_API_KEY`): bills updated since the last run, AI-titled or watchlisted; report only when the stored `latestAction` changed **and** the bill has passed a chamber or later. `updateDate` alone is not a new action.
- Every US item through Jev's impact-on-reader question (04); low impact stays out.
- Workflow: pass `USA_GOV_API_KEY` in the digest step's `env:`.

## Done when

Tests for the chamber gate and the docket dedupe; a live run produces no introduced-only bills.
