# 03: highlights.json leaves out ai-data and ai-models

Status: ready-for-agent
Findings: 5 [medium], see `../review.md`

## Problem

`[highlights] no highlight for ai-data; reply: {"ai-agents":[…` on 2026-11-08 and `no highlight for ai-models, ai-data` on 11-09. Both pages were published. `withFallbackHighlights` covers `ai-policy`, `ai-trends` and an `ai-data` with a Jev-kept vendor item only.

## What to build

- [ ] Read the logged raw replies of 11-08 and 11-09: did the model skip the pages, or were their Highlights `NO_HIGHLIGHT_NOTE` or `NO_MODEL_NEWS_NOTE` (then the gap is correct and the log line is noise)
- [ ] If the pages had real Highlights: fall back to the page's first Highlight for every published daily page, as `ai-policy` does

## Comments
