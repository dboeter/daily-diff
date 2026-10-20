# HN summaries describe articles and threads the model never saw

Status: needs-triage

## Problem

The discussions prompt gets titles and counts only. AGENTS.md records that before 2026-10-06 summaries invented "the community's reaction", and the prompt now forbids describing threads. On 2026-10-19 it still happened, and summaries also invent the article's content:

- DeepSeek-v4.1-Flash: "prompting discussion about its training data and licensing" (thread).
- "Neural networks are clean" (Goodfire): "when properly regularized, exhibit 'clean' representations that generalize well without memorization noise" (guessed from the title).
- "Claude reveals ECDSA curve origins": a guessed mechanism.

## Options

- Fetch each kept story's `og:description` / meta description (30 requests, parallel, short timeout) and give it to the model.
- Or restrict the summary to what the title and domain say, one sentence.

## Where

`src/sources/hn.ts`, `buildDiscussionsPrompt` (`src/reports/prompts-data.ts`).
