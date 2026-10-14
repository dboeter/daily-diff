# News & commentary section

Status: needs-triage
Blocked by: 04

## Scope

- RSS from the authoritative shortlist only: Politico Europe Technology, Politico US Technology, EU AI Act Newsletter (FLI), Transformer, CSET, Covington Inside Privacy, Binnenlands Bestuur. Through Jev, with the 7-day news-feed age limit (03).
- A news item Jev keeps counts as new content: a day with only news still gets a report (the outlets are already limited to authoritative ones, and official events alone would leave gaps on quiet days and in recesses). The section is left out when nothing qualifies — no fallback to general news.
- Optional later: Tech Policy Press and IAPP feeds (not found yet), Euractiv (403 from a local host; try from the runner).

## Done when

A live run shows the section on a day with qualifying posts and omits it otherwise; tests that a news-only day produces a report and a deadlines-only day does not.
