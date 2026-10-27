# 10: Spotted selection floors

Status: done
Blocked by: None (can start immediately)
Findings: S5, A3, A9, M5, T7 — see `../review.md`

## What to build

Spotted and Most discussed show stories that are on-topic and discussed. On 2026-10-26 Spotted showed a story routed at topic probability 0.43, two models rows with 8-9 points next to 213-491, a 25-day-old post and the third Hacktoberfest entry in two days, while an on-topic agents story was cut; Most discussed ranked a 0-point, 0-comment Lobste.rs row among 500-comment threads.

- [x] A story needs a minimum topic probability for its page (start near 0.5-0.6) to be Spotted
- [x] Within the per-source cap, stories rank by topic confidence, then points
- [x] A minimum engagement applies once a page already has 3 rows
- [x] Stories older than a set age are not Spotted
- [x] Dev.to contest submissions ("This is a submission for …") are deduplicated or skipped
- [x] Most discussed requires a minimum discussion level and an on-audience topic
- [x] Rerunning selection on the 2026-10-26 pool drops DetectorScope, the AI graveyard and the 0/0 Lobste.rs row and keeps AgentTrust

## Comments

`selectSpotted` (spotted/pool.ts) drops as `threshold`: topic probability under 0.6, published over 7 days before the run, Dev.to "This is a submission for" entries, and, once a page has 3 rows, a story under `SPOTTED_MIN_POINTS` (hn 5, lobsters 3, devto 10). Within a source it ranks by topic probability in tenths, then points. `mostDiscussed` needs `MOST_DISCUSSED_MIN_COMMENTS` (hn 20, lobsters 3, devto 5) and leaves out the `other` topic. The HN points floor stays low on purpose: stories are fetched hours old (AgentTrust had 7 points at fetch), so a high bar would have cut the very story this ticket keeps. Replay: `ticket 10 replay: the 2026-10-26 pool` in pool.test, on a frozen fixture `fixtures/spotted-2026-10-26.json` (the log and trace in `digests/` are overwritten daily). Published dates in the fixture are first-seen dates: the log keeps no publish date.
