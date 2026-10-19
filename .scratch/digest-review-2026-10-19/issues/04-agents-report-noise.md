# Agents report: install boilerplate as release notes, third-party repos as news

Status: needs-triage

## Problems (from `digests/2026-10-19/ai-agents.md`)

1. **Boilerplate release notes.** Agent Deck v1.16.30's body opens with its install block (Homebrew, curl, `go install`), so the first `RELEASE_BODY_CHARS` (400) characters carry no changes, and the report's bullet lists install commands (with their spaces stripped). Strip fenced code blocks before the cut (`src/reports/prompts.ts:110`, `:129`); when nothing is left, give the model the release link and say there are no notes.
2. **Third-party repos count as project news.** `vakandi/opencode-rust` under OpenCode, `FaqFirebase/pi-desktop` under Oh My Pi, `vastsa/PI-Desktop` under Pi, `BkashJEE/hermes-bot-forge` under Hermes, `DSH-APP/DSHA` under DeepSeek Harness: all GitHub Trending / Search repos that name the project. They push "Active today" to 10 of 16. Options: send matched GitHub repos as "ecosystem" items the prompt keeps apart from news, or drop GitHub items from `matchProjectNews` for the agents pool.
3. **Filler.** The infra overview says "No breaking issues were reported for any of the projects today." The prompt should forbid stating absences.

## Where

`buildProjectDigestPrompt` (`src/reports/prompts.ts`), `matchProjectNews` (`src/reports/agent-news.ts`).
