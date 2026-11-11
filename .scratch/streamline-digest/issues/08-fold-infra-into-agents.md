# 08: Fold infra into agents

**What to build:** the infra Tracked Projects appear daily in the agents report as an "Agent tooling" group; the separate weekly infra report is retired, its archive stays reachable.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Agents report renders the infra repos under their own heading, Quiet ones in the Quiet line
- [ ] No `ai-infra.md` or `infra` issue produced; archive label, report file and close-stale handling kept
- [ ] README tables, AGENTS.md and GLOSSARY updated

## Comments

- 2026-10-13, implementation: close-stale keeps the `infra` label eligible but moves it from its own weekly retention group into the daily group, so the last open infra issue closes on the next run instead of staying up until the next Monday. Recorded in review of PR #74.
- 2026-10-13, implementation: the infra repos also get news matching, in one pass with the agents (`matchProjectNews`); an item naming 3+ tracked projects, agents or infra, is dropped as a compatibility list. Kept after review of PR #74.
