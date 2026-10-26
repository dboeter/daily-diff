# 11: Cap-cut stories stay eligible; news matching reads title and description

Status: ready-for-agent
Blocked by: 10
Findings: X4, S4 — see `../review.md`

## What to build

A story cut only by the per-source cap gets another chance the next day, and a story about a Tracked Project is matched even when only its description names the project. On 2026-10-25 a Dev.to story about OpenShell (agents 0.99) was cut by the cap, then left the fresh pool, and surfaced only in the weekly Most discussed while the agents page called OpenShell quiet.

- [ ] Whether project-news matching reads only the title is established and recorded
- [ ] Matching considers title and description
- [ ] A story cut by the cap (not by a threshold) stays eligible on the next run
- [ ] A test covers a description-only project mention
