# 14: One story is News under two agents

Status: needs-triage
Findings: 16 [medium], see `../review.md`

## Problem

On 2026-11-09 "How I Fight AI Brain Fry" was listed as News under Claude Code and under OpenAI Codex. It is a general post whose only mention is "If you work with Claude Code or Codex from the terminal, you know this one." It was the only item of the Codex section, so it alone made Codex count in `Active today: 3`.

By design: `matchProjectNews` drops an item that names 3 or more agents and lists an item that names two under both. The data pool lists a story once, under the project its text names first that has room (`FIRST_NAMED`).

## Decide

- [ ] A story naming two agents: listed once (as the data pool does), or under both
- [ ] A post that names a project in passing and is not about it: whether Jev should judge "is this story about <project>" before it becomes that project's News
- [ ] Whether a project whose only item is such a story counts as active

## Comments
