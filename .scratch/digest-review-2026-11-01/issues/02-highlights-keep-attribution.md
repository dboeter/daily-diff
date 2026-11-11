# 02: Highlights keep their row's attribution and scope

Status: done
Findings: 2 [medium], see `../review.md`

## What to build

- Models: Spotted row says "A user reports…" (one tweet, hn:50319358); Highlight says "Anthropic is blocking accounts … users report broad enforcement that affects legitimate development", restated in `highlights.json`.
- Agents: body bullet says the Open-VSX extension "reports that" it installed an SSH backdoor; Highlight states it as fact.

- [x] The page Highlights prompt rule: a Highlight keeps the source's attribution ("X reports", "a user reports") and number (one report is not "users"/"broad")
- [x] Prompt test covering the rule

## Comments

### Done (2026-11-01)

New `SOURCE_FIDELITY_RULES` entry (every Highlights, Signals and highlights.json prompt): keep the attribution and scope a row gives; one person's report never becomes "users report", "broad" or a company's policy. Test in `prompts-pages.test.ts`.
