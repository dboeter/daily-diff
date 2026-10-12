# 05: Day overview landing page

**What to build:** opening a day shows an overview: each report's Highlights bullets (from `highlights.json`), each linking to its report. It is the default landing page.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Overview reachable at `#YYYY-MM-DD` and as the first sidebar entry of a day
- [ ] No extra LLM call; built from the existing highlights
- [ ] Days without `highlights.json` fall back to the first report
