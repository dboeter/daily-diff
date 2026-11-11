# 01: One name per report

**What to build:** each report has exactly one name, used everywhere: its H1, GitHub issue title, sidebar, RSS item title and Telegram label. Today the infra report is "Agent Tooling Weekly" in its H1 and "AI Infrastructure Digest" in the sidebar.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] One entry per live report (emoji, name, short name); agents/infra names still come from `config.yml`
- [ ] H1, issue title, sidebar label (`manifest.json` labels), RSS title and Telegram label all derive from it
- [ ] Archive-only reports keep their labels
- [ ] Names are cadence-neutral (the archive holds daily and weekly editions); the issue title may add the cadence
- [ ] Tests assert H1 == issue title == label for every live report

## Comments

- 2026-10-12, implementation: no separate short name. The names are short already ("AI Agents", "AI Models"), so the report bar uses emoji + name. The agents report name moved out of config.yml into REPORTS: with infra folded in (08), config.yml `title` is each section's heading, not the report's name.
