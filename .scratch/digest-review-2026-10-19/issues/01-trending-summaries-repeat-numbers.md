# Trending summaries repeat the numbers column

Status: needs-triage

## Problem

In `digests/2026-10-19/ai-trending.md` nearly every row's summary ends with the figures the Signal / Stars column already shows: "It has 625 stars, up 328, an increase of 110%." Half of each summary is a duplicate.

The Radar's OpenRouter signal was also misread: `week #16 / month #19, 800.5B tokens/week` became "800.5 billion tokens per week in week 16 of month 19" (Strix). The model reads the rank columns as dates.

## Desired behavior

- A summary says what the project is and why it matters, with no star, gain, download or token figures (they are in the row).
- The model either gets the OpenRouter signal explained ("week #N = rank this week") or does not get it at all.

## Where

`buildTrendingSummariesPrompt` (`src/reports/prompts-data.ts`), `summaryRows` (`src/trending/rank.ts`).
