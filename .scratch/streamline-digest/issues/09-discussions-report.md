# 09: Discussions report

**What to build:** one discussions report: Hacker News daily, plus a Dev.to + Lobste.rs section on the Weekly Run. The separate community report is retired, its archive stays reachable.

**Blocked by:** 01, 03

**Status:** ready-for-agent

- [ ] HN report includes the Dev.to/Lobste.rs tables on a Weekly Run
- [ ] Still generated when HN fails but Dev.to/Lobste.rs succeed on a Weekly Run
- [ ] No `ai-community.md` or `community` issue produced; archive kept
- [ ] AGENTS.md / README updated

## Comments

- 2026-10-13, implementation: close-stale keeps the `community` label eligible but moves it from its own weekly retention group into the daily group, so the last open community issue closes on the next run instead of staying up until the next Monday. Recorded in review of PR #74.
