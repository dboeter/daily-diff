# 03: A title-only news item gets no inferred impact

Status: done
Findings: 3 [medium], see `../review.md`

## What to build

hn:50320588 "ChatGPT and Codex usage limits merging" had no description; the Codex News bullet added "affecting how subscribers allocate their quota" and opened with "discusses". The news block (`src/reports/prompts.ts:388`) sends only the title, and the News rule (`:426`) still asks "why it matters".

- [x] A news item without a description is marked as title-only in the prompt, and the rule says to restate the title only, no impact and no "discusses"
- [x] Prompt test

## Comments

### Done (2026-11-01)

`formatProject` marks a news item without a description with `NEWS_TITLE_ONLY`; the News rule says such an item gets only what its title says, no consequence, no "discusses". Test in `prompts.test.ts`.
