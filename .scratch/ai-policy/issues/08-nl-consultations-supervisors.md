# Netherlands: consultations, AP and government news

Status: resolved
Blocked by: 04, 06

## Scope

- internetconsultatie.nl: snapshot the homepage list (no API or RSS), new AI-related consultations with `Sluitingsdatum` into Upcoming deadlines.
- Autoriteit Persoonsgegevens RSS, every item through Jev, with the 7-day news-feed age limit (03).
- Government news: the **general Rijksoverheid news feed** (all ministries) and the RDI feed, every new item through Jev, plus Digitale Overheid. The new feeds (the old URLs broke on 2026-06-02) are `https://www.rijksoverheid.nl/api/rss?query=<url-encoded JSON>` and the same path on `www.rdi.nl`, with the JSON:
  `{"filters":[{"field":"content_type","values":["pro:newsDocument"],"type":"all"}],"resultSearchTerm":"","pageTitle":"Nieuws"}`
  - Store the query as JSON in config and encode it in code, so the feeds stay readable.
  - General feed, not per-ministry feeds: AI news comes from many ministries (education, justice, defence), not only BZK/EZK. It holds the newest 20 items, about 4 a day (5.3 days on 2026-10-14), so a daily run sends a handful to Jev. RDI: 20 items back to 2026-06-03, ~1 a week.
  - Not `resultSearchTerm`: it ranks by relevance, not date (on 2026-10-14 `AI` returned 20 items on both hosts, none from the last 30 days, oldest 2020).
  - Skip items older than 7 days, on every run. News missed during a gap between runs is no longer new and stays missing (maintainer, 2026-10-14); the 20-item feed may also drop it after ~3 days without a run. This also keeps the first run from filling the report with old news.
- Keyword lists for Dutch sources must include `AI`: Dutch government texts say "AI" far more than "kunstmatige intelligentie".

## Done when

Tests for the homepage parser on a saved fixture; a live run lists the AP items Jev keeps.
