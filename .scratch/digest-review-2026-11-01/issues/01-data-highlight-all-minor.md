# 01: A data page whose rows are all minor gets NO_HIGHLIGHT_NOTE, not a meta bullet

Status: ready-for-agent
Findings: 1 [high], see `../review.md`

## What to build

On 2026-11-01 all three kept vendor rows were `minor`, there was no release or hot issue, and the model wrote "All vendor release notes today are minor fixes and previews; no deprecations or breaking changes." That bullet names no row, so `dropNoHighlightRows` (`src/reports/prompts-pages.ts:566-603`) keeps it; it contradicts the Action required row (Genie One MCP Beta EOL 2026-11-30), leaks the internal label "minor", and reaches Telegram and Teams through `highlights.json`.

- [ ] A data Highlights section with no bullet about a Highlight-eligible item reads `NO_HIGHLIGHT_NOTE`, so `highlights.json` has no `ai-data` entry
- [ ] Test reproducing the 2026-11-01 case
