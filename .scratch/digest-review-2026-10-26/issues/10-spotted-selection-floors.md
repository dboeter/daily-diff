# 10: Spotted selection floors

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: S5, A3, A9, M5, T7 — see `../review.md`

## What to build

Spotted and Most discussed show stories that are on-topic and discussed. On 2026-10-26 Spotted showed a story routed at topic probability 0.43, two models rows with 8-9 points next to 213-491, a 25-day-old post and the third Hacktoberfest entry in two days, while an on-topic agents story was cut; Most discussed ranked a 0-point, 0-comment Lobste.rs row among 500-comment threads.

- [ ] A story needs a minimum topic probability for its page (start near 0.5-0.6) to be Spotted
- [ ] Within the per-source cap, stories rank by topic confidence, then points
- [ ] A minimum engagement applies once a page already has 3 rows
- [ ] Stories older than a set age are not Spotted
- [ ] Dev.to contest submissions ("This is a submission for …") are deduplicated or skipped
- [ ] Most discussed requires a minimum discussion level and an on-audience topic
- [ ] Rerunning selection on the 2026-10-26 pool drops DetectorScope, the AI graveyard and the 0/0 Lobste.rs row and keeps AgentTrust
