# 01: A data page whose rows are all minor gets NO_HIGHLIGHT_NOTE, not a meta bullet

Status: done
Findings: 1 [high], see `../review.md`

## What to build

On 2026-11-01 all three kept vendor rows were `minor`, there was no release or hot issue, and the model wrote "All vendor release notes today are minor fixes and previews; no deprecations or breaking changes." That bullet names no row, so `dropNoHighlightRows` (`src/reports/prompts-pages.ts:566-603`) keeps it; it contradicts the Action required row (Genie One MCP Beta EOL 2026-11-30), leaks the internal label "minor", and reaches Telegram and Teams through `highlights.json`.

- [x] A data Highlights section with no bullet about a Highlight-eligible item reads `NO_HIGHLIGHT_NOTE`, so `highlights.json` has no `ai-data` entry
- [x] Test reproducing the 2026-11-01 case

## Comments

### Done (2026-11-01)

**Cause:** `buildDataProsePrompt` asked for 1–3 bullets and named every row minor, with no instruction for a day with nothing to pick, and the Action required table is rendered outside `sectionsMd`, so the model never saw the end-of-life row it contradicted. Prompt now: when no item qualifies, the one bullet `- NO_HIGHLIGHT_NOTE`; never a bullet about the rows as a group or about absence. No code net: a meta bullet names no row, so `dropNoHighlightRows` cannot tell it apart; test in `prompts-pages.test.ts`.

### Code review fixes

- Code net added: `isGroupOrAbsenceBullet` (`src/reports/prompts-pages.ts`) drops a data Highlight containing "minor" or an absence phrase ("no deprecations", "no breaking changes", "no notable", "nothing new") through `dropNoHighlightRows`' new `alsoDrop` predicate; when none is left `NO_HIGHLIGHT_NOTE` stands in. Test replays the 11-01 bullet.
