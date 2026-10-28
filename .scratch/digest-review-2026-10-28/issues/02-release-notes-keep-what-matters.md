# 02: Release bullets come from the notes that matter, never a cut sentence

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: A1 [high], A2 [high], A4 [medium] — see `../review.md`, `../ai-agents.md`

## What to build

A release bullet states what the release changes, breaking changes and removals first, and every claim is in the notes. On 2026-10-28 the model saw only the first 400 characters of each release's notes, mostly link URLs:

- OpenShell v0.1.6: the excerpt ended "…VM now open t" and the bullet said "now open terminals automatically"; the notes say new sandboxes open the control connection to their supervisor, and the supervisor and runtime binaries must be upgraded together.
- OpenCode v2.2.0: three breaking changes (`@opencode/ai` root is now the Promise API; "The OpenCode GitHub Action is removed … Remove it from your workflows"; plugins need OpenTUI 0.7) reached neither the bullet, the Highlights nor `highlights.json`.
- Gemini CLI v0.66.0 ended on "updates roadmap and changelog"; Oh My Pi missed `tools.restrictedFolders`; OpenShell missed four CVE fixes.

- [ ] Link URLs, PR references and contributor lines are stripped before the budget is counted
- [ ] Sections headed Breaking changes, Removed, Deprecated, Upgrade/Migration notes and Security go first in the excerpt, ahead of the cut
- [ ] The excerpt ends on a whole item (line or sentence), never mid-word
- [ ] The budget is large enough to reach past a Highlights section on a 35 KB note (OpenCode v2.2.0), within the prompt's token budget for 16 agents + 17 data repos
- [ ] Tests on fixtures of the OpenShell v0.1.6 and OpenCode v2.2.0 bodies: the excerpt holds the control-connection item and all three breaking changes
- [ ] A removed feature (the GitHub Action) is a going-away item the Highlights prompt can sign

## Comments

From the review: `RELEASE_BODY_CHARS = 400` (`src/reports/prompts.ts:149`) and `releaseNotes` (`:162-170`), which slices after whitespace collapse. Also used by `src/reports/markdown.ts:587` (`releaseFallbackSection`) and `prompts-pages.ts`. Repro of what the model saw: `/tmp/claude-1000/-home-daanb-daily-diff/7f51e89b-9f95-4966-b7d9-50a6de5f564a/scratchpad/relnotes/cut.mts` (scratchpad, may be gone). Hot-issue bodies have the same head cut at 300 chars: see ticket 06.
