# US states: Open States / Plural

Status: resolved
Blocked by: 04

## Scope

- Open States v3 (`v3.openstates.org/bills`, `PLURAL_API_KEY`): first check the free-tier rate limit and whether one query can span all states.
- AI bills with an action since the last run; report from passing a chamber onward (`latest_passage_date`, per-action `classification` + chamber), plus enacted and vetoed. Through Jev's impact question.
- Workflow: pass `PLURAL_API_KEY` in the digest step's `env:`.

## Done when

Tests for the passage gate; a live run (sparse in October: most legislatures adjourned) stays within the rate limit.
