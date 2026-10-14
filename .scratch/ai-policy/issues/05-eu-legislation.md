# EU legislation: EUR-Lex and EP procedure stages

Status: resolved
Blocked by: 04

## Scope

- EUR-Lex via Cellar SPARQL (`publications.europa.eu/webapi/rdf/sparql`): new works whose title matches AI terms or a watchlisted CELEX/regulation number. `work_date_document` back-dates late publications, so query a 30-day look-back and diff against the state file. Stage from the CELEX type (proposal, EP position, adopted act, consolidated).
- EP Open Data API v2, per watchlisted procedure (AI Act amendments, Digital Omnibus on AI, CRA): store its typed, dated events, report new ones. Re-test `/procedures/feed` first (HTTP 500 on 2026-10-13); use it for discovery only if it works.
- EDPB news RSS, every item through Jev, with the 7-day news-feed age limit (03).
- Code renders the stage and date columns.

## Done when

A live run lists the watchlisted procedures' latest stages without duplicates on a second run; tests for the CELEX stage mapping and the event diff.
