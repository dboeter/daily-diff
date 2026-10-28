# 06: Hot issues count people, show their label and fix status, and are worded as reports

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: A5 [medium] (regression of ticket 03 of the 2026-10-26 round), A6 [medium], A7 [medium]; low A9 — see `../review.md`, `../ai-agents.md`

## What to build

A hot issue on the agents page is one people engaged with, and the row says what it is and whether a fix exists. On 2026-10-28:

- Gemini #15404, a 10-month-old antivirus false positive, qualified on +3: two `gemini-cli[bot]` comments and one "/assign". Its row hid the `area/security` label it qualified on, while both Hermes rows showed "security".
- Hermes #145452 (one user's open P3 report) became Highlight 3 and a `highlights.json` entry stated as fact ("Hermes Agent leaks valid `OPENAI_API_KEY`…"); its open fix PR #145478 was not mentioned.
- OpenCode #59387, the maintainers' "Free tier issues: read this first" thread (answer: update to v2), was framed as a live bug from a 300-char body excerpt.
- Every row's count parenthetical took a different form (A9), because the model writes it.

- [ ] Comments by bots (`user.type == "Bot"`, `[bot]` logins) and bare slash commands (`/assign`) do not count toward the gain
- [ ] Code renders each row's counts and qualifying label in one form; the model writes only the description
- [ ] The prompt gets enough of the body to tell a tracking or announcement thread from a bug report (template boilerplate stripped, as ticket 02 does for release notes)
- [ ] Decision: whether to fetch fix status (a linked open or merged PR) per shown issue, within the core-call budget in AGENTS.md; if yes, the row shows it
- [ ] A Highlight drawn from an open issue is worded as a report ("users report", "an issue says"); decide whether code can check this or the prompt rule stays the only guard, and record the choice
- [ ] Tests: a bot comment and a "/assign" add nothing to the gain; the rendered row shows the label

## Comments

From the review: no bot or command filter in the gain count (`src/core/github.ts`, `countHotIssues`; `HOT_LABEL = /regression|security/i` at `:235` matches `area/security`); the issue block is `formatItem` (`src/reports/prompts.ts:47-67`). The #59387 repeat itself is a one-off: the hot-issue state started empty on its first run. Needs triage because fix status costs core calls (timeline or search) and because code-checking Highlight wording may not be feasible.

**Maintainer decision (2026-10-28):** yes, look up fix status, within budget: one call per hot issue sent to the prompt (at most 2 per repo), counted against the shared core-call cap (`HOT_ISSUE_MAX_COUNT_CALLS` or a cap of its own, documented), so the AGENTS.md worst case stays under the Actions token's 1,000 core calls an hour. The row shows whether a linked fix PR is open or merged. Highlight wording: code-checking is optional; if not feasible, the prompt rule stays the only guard and the Comments say so.
