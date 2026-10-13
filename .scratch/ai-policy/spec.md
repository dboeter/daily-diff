# AI policy report

Status: needs-triage

A new report on the AI policy landscape: legislation, regulation and official guidance, ~95% EU and US. Other jurisdictions only for major events.

## Decisions (2026-10-13)

- **Scope: the broad AI policy landscape**, not narrowed to dev tooling. The maintainer follows AI policy for work.
- **Jurisdictions:** EU and US (federal + states). Elsewhere only when an item scores as a major event.
- **Courts: out** for now (candidate second phase, e.g. CourtListener).
- **News and commentary: in, as context**, from authoritative sources only. When none of those sources has anything, the section is empty — no fallback to general news.
- **US state bills:** reported from passing a chamber onward (passed one chamber, passed both, enacted, vetoed), not at introduction. Passing a chamber is the early warning for laws that are coming and need preparing for.
- **New API keys are acceptable.**

## Proposed design (not yet decided)

- **Daily diff with state.** Policy events are dated (a stage, a publication, a vote), so a daily report doesn't repeat itself as long as a committed state file records what was already reported (like `digests/web-state.json`). Skipped on a day with nothing new.
- **Layout:** Highlights → EU → US federal → US states → Upcoming deadlines → News & commentary → Signals → Worth a Look.
- **Code renders status, stage and dates; the LLM writes the summaries only** (the trending pattern). A wrong legal status is worse than a wrong star count.
- **Upcoming deadlines (next 30 days), rendered in code:** comment periods closing, open consultations, application dates of obligations (e.g. AI Act milestones).
- **Selection:** keyword discovery per source → Jev scores each item (about AI? binding or not? a new stage or routine? significance 0–2), with verdicts cached like `digests/trending-classifications.json`.
- **Watchlist in `config.yml`:** the main files that always appear when they move (AI Act and amendments, CRA, the GPAI Code of Practice, California/New York frontier-model laws, federal preemption bills). It also holds the deadline calendar.
- **Name/label:** proposal ⚖️ "AI Policy Diff", label `policy`. Undecided.

## Candidate sources (unverified — see issues/01)

| Layer                      | Source                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| US bills                   | Congress.gov API                                                  |
| US rules, executive orders | Federal Register API                                              |
| US comment dockets         | Regulations.gov API                                               |
| US states                  | LegiScan or Open States (Plural)                                  |
| EU procedures              | Legislative Observatory (OEIL), EUR-Lex                           |
| EU soft law                | Commission / AI Office press, EDPB, "Have your say" consultations |
| News & commentary          | authoritative outlets, to be picked in the spike                  |
| Elsewhere                  | Jev significance on HN/web/news items                             |
