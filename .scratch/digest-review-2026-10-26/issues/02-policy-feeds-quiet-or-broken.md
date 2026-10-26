# 02: Policy feeds: quiet or broken?

Status: partial
Blocked by: None (can start immediately)
Findings: X1, X8 — see `../review.md`

## What to build

On 2026-10-25 and 2026-10-26 AI Policy kept 0 of 99 judged items and the page was skipped. The judged items held nothing from any EU primary source, Tweede Kamer, Internetconsultatie, AP, Regulations.gov or Congress.gov; 94 of 99 were cached verdicts. Find out from the run logs whether those feeds were quiet or failing, and fix any that fail.

- [x] The fetch outcome of every policy source on 10-25 and 10-26 is established from the workflow logs and written into this ticket's Comments
- [ ] Every failing source is fixed, or recorded with its cause if it cannot be fixed now
- [x] AGENTS.md's Open States sentence ("has never returned a live response") matches reality: the 10-26 trace holds two Open States items

## Comments

**Fetch outcomes** (from `gh run view --log`, runs 40148921668 for 10-25 and 40269474851 for 10-26):

| Source | 10-25 | 10-26 | Verdict |
| --- | --- | --- | --- |
| European Commission (digital-strategy RSS) | HTTP 403 | HTTP 403 | broken on CI (also 403 on 10-22 and 10-24) |
| Commission mail | not in the run (merged 10-26) | 0 items; 11 redirect links skipped on HTTP 403 | broken on CI (same site) |
| EUR-Lex | 1 | 1 | ok |
| European Parliament | 2 | 2 | ok (watchlist only) |
| Have your say | 2 | 2 | ok |
| EDPB | 0 | 0 | quiet (feed answered) |
| Tweede Kamer | 1 | 1 | ok |
| Internetconsultatie | 0 of 39 open | 0 of 39 open | quiet (no AI consultation open) |
| Autoriteit Persoonsgegevens | 0 | 0 | quiet (feed answered) |
| Rijksoverheid / Digitale Overheid / RDI / Binnenlands Bestuur | 9/3/1/54 | 7/3/1/54 | ok |
| Federal Register + Regulations.gov | 7 | 7 | ok |
| Congress.gov | 0 | 0 | quiet: no error logged; it keeps only AI-titled bills that passed a chamber in 7 days |
| Open States | 2 | 2 | ok (live responses) |
| Politico EU/US, Transformer, Covington, CSET | ok / CSET 0 | ok / CSET 0 | ok |

So the EU-primary gap is one cause: the Commission's digital-strategy site refuses GitHub's runner IPs. The other primary sources answered; the items they returned were judged and dropped (see ticket 13 for the DHS case).

**Not fixed: the Commission 403.** The site's WAF blocks datacenter IPs; working around it (spoofed browser headers, proxies) would be bot-check circumvention, so it is out of scope. Options for the maintainer: let Commission mail items keep the email's own title and link when the redirect cannot be resolved (this reverses 866a2e6's no-fallback-id choice, so a later RSS copy could repeat it), or fetch the feed from a non-datacenter host. Recorded in AGENTS.md (AI Policy, Sources) and next to the feed in `config.yml`. Ticket 01's quiet-source warning now flags it after 7 days.
