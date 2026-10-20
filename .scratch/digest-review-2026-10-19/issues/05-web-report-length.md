# Web report: one article becomes ~600 words of four sections

Status: resolved

## Problem

`digests/2026-10-19/ai-web.md` had one new article (Anthropic's Public Benefit Fund). Highlights, Anthropic, Signals and Worth a Look each restate it. Signals speculates past the source: "may translate into more robust safety tools, greater transparency, and possibly discounted access for nonprofits".

## Desired behavior

- Length scales with the article count: with 1–2 articles, Highlights + the lab section only (no Signals, no Worth a Look).
- Signals states patterns across articles; no forward-looking claims the articles don't make.

## Where

`buildWebReportPrompt` (`src/reports/prompts-data.ts`), `WEB_REPORT` headings (`src/core/i18n.ts`).

## Comments

- 2026-10-19: fixed in `buildWebReportPrompt`. With fewer than 3 new articles (`WEB_FULL_LAYOUT_MIN`; first crawls always get the full layout) the prompt asks for 1-2 sentences of Highlights and the lab sections only. Signals gets a rule against forward-looking claims the articles do not make. No `WEB_REPORT` heading change was needed.
