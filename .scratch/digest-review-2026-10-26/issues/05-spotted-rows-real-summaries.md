# 05: Spotted and Most discussed rows get real summaries

Status: ready-for-agent
Blocked by: 01
Findings: S1, A6, M1, T8, A10 — see `../review.md`

## What to build

Spotted rows and the Trends Most discussed rows say what the story is about. On 2026-10-26 (and 10-25) every Spotted Summary on the agents and models pages was the linked page's meta description ("Contribute to microsoft/Agensh development by creating an account on GitHub.", "I am a dermatologist. I tested..."), and Most discussed showed "Subscribe for daily updates." and "—" for a 524-comment thread. AGENTS.md says a failed summaries call shows the descriptions, so first establish whether the call fails, is skipped, or returns descriptions.

- [ ] The cause of the fallback on 2026-10-25/26 is recorded in this ticket's Comments
- [ ] Spotted rows carry a model-written summary with one concrete fact from the story
- [ ] Most discussed rows go through the same summaries call
- [ ] When the call fails, the fallback strips boilerplate ("Contribute to … on GitHub", "- owner/repo", trailing "...", subscribe lines) and shows "—" when nothing is left
- [ ] Link text matches the repo name when the story links a repo
