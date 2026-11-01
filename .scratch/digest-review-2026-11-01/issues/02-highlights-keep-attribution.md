# 02: Highlights keep their row's attribution and scope

Status: ready-for-agent
Findings: 2 [medium], see `../review.md`

## What to build

- Models: Spotted row says "A user reports…" (one tweet, hn:50319358); Highlight says "Anthropic is blocking accounts … users report broad enforcement that affects legitimate development", restated in `highlights.json`.
- Agents: body bullet says the Open-VSX extension "reports that" it installed an SSH backdoor; Highlight states it as fact.

- [ ] The page Highlights prompt rule: a Highlight keeps the source's attribution ("X reports", "a user reports") and number (one report is not "users"/"broad")
- [ ] Prompt test covering the rule
