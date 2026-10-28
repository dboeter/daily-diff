# 02: Release bullets come from the notes that matter, never a cut sentence

Status: done
Blocked by: None (can start immediately)
Findings: A1 [high], A2 [high], A4 [medium] — see `../review.md`, `../ai-agents.md`

## What to build

A release bullet states what the release changes, breaking changes and removals first, and every claim is in the notes. On 2026-10-28 the model saw only the first 400 characters of each release's notes, mostly link URLs:

- OpenShell v0.1.6: the excerpt ended "…VM now open t" and the bullet said "now open terminals automatically"; the notes say new sandboxes open the control connection to their supervisor, and the supervisor and runtime binaries must be upgraded together.
- OpenCode v2.2.0: three breaking changes (`@opencode/ai` root is now the Promise API; "The OpenCode GitHub Action is removed … Remove it from your workflows"; plugins need OpenTUI 0.7) reached neither the bullet, the Highlights nor `highlights.json`.
- Gemini CLI v0.66.0 ended on "updates roadmap and changelog"; Oh My Pi missed `tools.restrictedFolders`; OpenShell missed four CVE fixes.

- [x] Link URLs, PR references and contributor lines are stripped before the budget is counted
- [x] Sections headed Breaking changes, Removed, Deprecated, Upgrade/Migration notes and Security go first in the excerpt, ahead of the cut
- [x] The excerpt ends on a whole item (line or sentence), never mid-word
- [x] The budget is large enough to reach past a Highlights section on a 35 KB note (OpenCode v2.2.0), within the prompt's token budget for 16 agents + 17 data repos
- [x] Tests on fixtures of the OpenShell v0.1.6 and OpenCode v2.2.0 bodies: the excerpt holds the control-connection item and all three breaking changes
- [x] A removed feature (the GitHub Action) is a going-away item the Highlights prompt can sign

## Comments

From the review: `RELEASE_BODY_CHARS = 400` (`src/reports/prompts.ts:149`) and `releaseNotes` (`:162-170`), which slices after whitespace collapse. Also used by `src/reports/markdown.ts:587` (`releaseFallbackSection`) and `prompts-pages.ts`. Repro of what the model saw: `/tmp/claude-1000/-home-daanb-daily-diff/7f51e89b-9f95-4966-b7d9-50a6de5f564a/scratchpad/relnotes/cut.mts` (scratchpad, may be gone). Hot-issue bodies have the same head cut at 300 chars: see ticket 06.

Done (2026-10-28).

- **Cause**: `releaseNotes` collapsed whitespace and sliced the first `RELEASE_BODY_CHARS` (400) characters. Link URLs and `[#N](…/pull/N)` references filled most of that, and the sections a user must act on came wherever the notes put them: OpenCode v2.2.0 puts `### Breaking changes` after `### Highlights`, so none of the three reached the model. The OpenShell bullet's "now open t[erminals]" came from the mid-word cut.
- **What changed** (`src/reports/prompts.ts`):
  - `releaseNotes` keeps the line structure until the cut. It drops code blocks, HTML and anchor links, then `priorityFirst` moves each section whose heading matches `PRIORITY_HEADING_RE` (breaking, removed/removals, deprecat…, upgrade notes/guide, upgrading, migrat…, security), sub-headings included, to the front in document order. `stripLinkNoise` follows, then `wholeItems` joins the lines up to the last whole line that fits. A line that does not fit gives its leading sentences; a first line with no sentence end is cut at a word. Headings with nothing under them, or left last by the cut, are dropped. The signature is unchanged, so `markdown.ts` and `prompts-pages.ts` did not change.
  - New exported `stripLinkNoise(text)`, for `formatItem` to reuse later (ticket 06). It drops images, PR/issue reference links (with their comma), bare and autolinked URLs, emptied `( , )` and `(#1, #2)` reference lists, trailing `by @user [in #N]`, thank-you/contributor lines, first-contribution lines, the New Contributors heading and the Full Changelog link (the last three moved out of `compactChangelog`). A link keeps its text, backticked code is kept, and line breaks are kept.
  - `RELEASE_BODY_CHARS` 400 → 2000. Measured on the real notes: OpenCode v2.2.0 is 35 KB raw and 17 KB stripped, and Breaking changes + Highlights take the first 1.8 KB. All three OpenShell v0.1.6 upgrade notes and the four CVE/RUSTSEC fixes fit. The constant's comment gives the token argument: these are input tokens, which `callLlm`'s budgets (output caps) do not count. The worst case is 17 repos × 10 releases × 2000 chars ≈ 85K tokens, inside gpt-4o's 128K and the daily fallbacks' 1M (OpenRouter `/endpoints`; the primary `nemotron-3-super-120b-a12b:free` returned no endpoint, so its context is unverified).
  - Side effect: `renderReleaseTable` (`markdown.ts`, not `releaseFallbackSection` as the review says) shows this excerpt in the Releases this week cell when the summaries call fails, so that fallback cell can now be up to 2000 chars.
  - The going-away box: the excerpt now holds "#### The OpenCode GitHub Action is removed … Remove it from your workflows.", which `goingAwayRule` already counts as going away (a removal). No prompt change was needed. Whether the model signs it is unverified until a live run.
- **Tests** (`src/__tests__/reports/prompts.test.ts`, new `describe("releaseNotes")` and `describe("stripLinkNoise")` after `buildProjectDigestPrompt`). The fixtures `src/__tests__/fixtures/release-openshell-v0.1.6.md` and `release-opencode-v2.2.0.md` are trimmed from the real bodies. The tests check:
  - Upgrade notes come first and hold the control-connection item, the CVE fixes and no install command.
  - All three breaking changes come before Highlights, and Highlights is still reached.
  - No URL, `](`, `#NNNN` or stray comma is left, and the length stays within the budget.
  - The cut is whole-line or sentence (and at a word for a first line with no sentence end), with no trailing heading.
  - Contributor lines and the Full Changelog link are dropped.
  - `stripLinkNoise` keeps link text, code and line breaks.
- `pnpm test` (1045 passed), `pnpm lint`, `pnpm typecheck` and `pnpm format` are clean; the `.md` fixtures are unchanged by Prettier.
- **Docs**: no AGENTS.md statement is now wrong (it does not describe the release excerpt). Optional addition under AI Agents → "Releases, hot issues and news only": "The model gets each release's notes without links, PR references and contributor lines, the breaking, removed, deprecated, upgrade/migration and security sections first, cut after the last whole item within `RELEASE_BODY_CHARS` (2000)."
- Known limits: the data page's Releases this week rows (`prompts-pages.ts`, `weekReleases`) have no code cap, so the 85K worst case does not bound that call. Only releases no earlier report showed are sent, and the constant's comment says so. A URL inside backticks is also stripped (`` `HOST=https://…` `` → `` `HOST=` ``); this is rare in release notes and was left as it is.
- **Fix round (code review)**:
  - `priorityFirst` also moves a section opened by a bold label alone on its line (`**Breaking changes**`, `**Breaking changes:**`, `**Security**`), matched by `PRIORITY_HEADING_RE`, up to the next heading or bold label (`BOLD_LABEL_RE`; a bold label ranks below every heading, so inside a `#` priority section it stays put). Bold text inside a line is no section.
  - `withoutCodeAndTags(text, blockGap)` replaces the fence and HTML-tag regex pair in `issueBody`, `releaseNotes` and `announcementLinks` (which now turns autolinks and `<a href>` into text before the helper runs).
  - `formatItem`'s default body length is `ITEM_BODY_CHARS` (300); the `RELEASE_BODY_CHARS` comment is two sentences, same token argument.
  - Test: "puts a section under a bold label first, up to the next heading or bold label" in `describe("releaseNotes")`. `pnpm test` (1098 passed), `pnpm typecheck`, `pnpm lint` and `pnpm format` are clean.
