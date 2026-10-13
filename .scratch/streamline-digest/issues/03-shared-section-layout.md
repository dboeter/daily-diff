# 03: Shared section layout

**What to build:** every listing report reads the same: Highlights → tables → Signals → Worth reading. Section names live in one place, weekly reports never say "Today's", and headings describe their content.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] HN, ArXiv, HF, Community, Web prompts reference shared heading constants: `Highlights`, `Signals`, `Worth reading`
- [ ] Web report drops its numbered section titles
- [ ] Trending "Community Hot Spots" → "Worth watching"
- [ ] Skills inside trending: its headings sit below the trending section (no H1/H2 that outranks "Claude Code Skills")
- [ ] Prompt tests assert the headings

## Comments

- 2026-10-12, implementation: the closing section is "Worth a Look", not "Worth reading": it also lists models and repos. Web has it too, after review.
