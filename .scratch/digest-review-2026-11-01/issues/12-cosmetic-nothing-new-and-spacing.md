# 12: "Nothing new from" double "or"; heading spacing

Status: ready-for-agent
Findings: 12 [low], see `../review.md`

## What to build

- Models line 17: "Nothing new from Anthropic or OpenAI, OpenRouter's new listings or OpenRouter's stealth models today." The labs section's name contains "or" and `nothingNew` (`src/core/strings.ts:109-110`) joins with ", " and " or ". Fix the name or the join so the list parses.
- Agents: some `###` project headings have no blank line before their first bullet, others do (agents vs infra call). Normalise in code. Renders the same; raw Markdown only.
