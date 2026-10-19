# Web report: one article becomes ~600 words of four sections

Status: needs-triage

## Problem

`digests/2026-10-19/ai-web.md` had one new article (Anthropic's Public Benefit Fund). Highlights, Anthropic, Signals and Worth a Look each restate it. Signals speculates past the source: "may translate into more robust safety tools, greater transparency, and possibly discounted access for nonprofits".

## Desired behavior

- Length scales with the article count: with 1–2 articles, Highlights + the lab section only (no Signals, no Worth a Look).
- Signals states patterns across articles; no forward-looking claims the articles don't make.

## Where

`buildWebReportPrompt` (`src/reports/prompts-data.ts`), `WEB_REPORT` headings (`src/core/i18n.ts`).
