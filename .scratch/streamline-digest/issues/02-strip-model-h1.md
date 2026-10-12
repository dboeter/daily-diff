# 02: Strip H1s the model writes

**What to build:** a report has one H1, the one code renders. The model's own title (`# Hacker News AI Community Digest — 2026-10-12`) and the web report's title block (`**Date:** … **Type:** Incremental Update`) are removed from the Summary before it is saved.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Any `#` heading the model emits is dropped, and a leading `**Date:**/**Source:**/**Type:**` block with it
- [ ] Applied to every LLM-written report body
- [ ] Unit tests on real-shaped Summaries (HN, web, Skills)
