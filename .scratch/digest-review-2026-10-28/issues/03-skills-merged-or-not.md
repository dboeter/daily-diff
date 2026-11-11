# 03: Skills says whether a closed PR was merged

Status: done
Blocked by: None (can start immediately)
Findings: T1 [high] — see `../review.md`, `../ai-trends.md`

## What to build

A reader of Trends' Skills section can tell shipped work from rejected work. On 2026-10-28 all 7 PRs under "Closed this week" were closed without merging (#1958, #1728, #1961, #2027, #765, #50, #2038), yet each read as shipped ("#1961 – Hardens `skill-creator` eval viewer against script breakout, DNS rebinding…"), and the Takeaway built "refining skill specifications" on two rejected refactors.

- [x] The Skills fetch keeps `pull_request.merged_at` from the issues API response it already makes (no extra call)
- [x] Code, not the model, splits or marks the closed PRs: merged ones as shipped, unmerged ones as closed without merging (or dropped; pick one and document it in AGENTS.md)
- [x] The prompt no longer says "do not say which"; a summary of an unmerged PR describes what it proposed, not what it does
- [x] The Takeaway rests only on merged PRs, open PRs and issues
- [x] A test with one merged and one unmerged closed PR checks the rendered section

## Comments

From the review: `src/reports/prompts.ts:388` ("a closed PR may or may not have been merged: do not say which"); `GitHubItem` (`src/core/github.ts:49`) has `closed_at` but no `merged_at`; the Skills fetch is `src/trending/skills.ts`.

### Done (2026-10-28)

**Premise correction**: the Skills PRs do not come from the issues API (`fetchSkills` drops the issues response's PRs with `!i.pull_request`); they come from `/repos/{repo}/pulls`, whose items carry `merged_at` at the top level (GitHub's `pull-request-simple` schema; not checked against the live API here). So box 1 is met by reading `merged_at` from the pulls response already fetched: no extra call and no fetch change, only the type.

**Choice: unmerged closed PRs are left out**, not listed as "closed without merging". Most closed PRs in `anthropics/skills` are rejected third-party submissions (7 of 7 on 2026-10-28); a list of them is noise for the reader, and leaving them out keeps the model from ever describing or building on one. So box 3's second half (an unmerged PR described as proposed) holds by construction: the model never sees one. One last week's page showed open and that closed unmerged this week is left out too.

**Cause**: `GitHubItem` had no `merged_at`, `selectSkillsItems` kept any PR whose `closed_at` fell in the window, and `buildSkillsPrompt` gave the model closed PRs under "Closed this week" with "do not say which", so it wrote them up as shipped and built the Takeaway on them.

**Changed**:

- `src/core/github.ts`: `GitHubItem.merged_at?: string | null`.
- `src/trending/skills.ts` `selectSkillsItems`: a closed PR is kept only when its `merged_at` is in the window (an issue still by `closed_at`), so a PR closed without merging is dropped; a week with only those has no Skills section and no call.
- `src/reports/prompts.ts` `buildSkillsPrompt`: a merged PR is formatted as `[MERGED]`; `## Closed this week` became `## Merged this week` ("The PRs with state MERGED, if any: what each ships."), the "do not say which" rule is gone, and the Takeaway is "what the open PRs, merged PRs and issues you wrote about have in common".
- `src/reports/pages.ts`: no change needed; the section is assembled from the selected items as before.

**Tests**:

- `src/__tests__/trending/skills.test.ts` (`selectSkillsItems` › "a PR closed without merging"): left out while a merged one is kept; left out when last week's page showed it; a closed issue still goes by `closed_at`. The existing closed-PR fixtures now carry `merged_at`.
- `src/__tests__/reports/prompts.test.ts` (`buildSkillsPrompt`): a merged PR is `[MERGED]` under `## Merged this week`, no "Closed this week" or "do not say which".
- `src/__tests__/reports/pages.test.ts` (Trends): one merged and one unmerged closed PR through `selectSkillsItems` and `buildTrendsReport`; the rendered Skills section links the merged PR under `### Merged this week` and the page never names the unmerged one.

`pnpm typecheck`, `pnpm lint` and `pnpm test` (1056 passed) pass; `pnpm format` run.

Docs: AGENTS.md, Trends › "Skills: PRs and requests this week": "the `anthropics/skills` PRs and issues updated in the last 7 days, a closed one only if it closed in those 7 days" → "the `anthropics/skills` PRs and issues updated in the last 7 days, a closed issue only if it closed in those 7 days and a closed PR only if it was merged in them (`merged_at`, from the pulls response): a PR closed without merging is left out, so the section shows only open, merged and requested work, and its Takeaway rests on those"; and "one the Skills section of the page dated exactly 7 days earlier named is skipped unless it closed this week" → "… is skipped unless it closed (a PR: merged) this week".

Fix round (code review, 2026-10-28): `selectSkillsItems` (`src/trending/skills.ts`) tells a PR from an issue by the list it came in (`data.prs` / `data.issues`), not by `html_url.includes("/pull/")`. Test (`src/__tests__/trending/skills.test.ts`): "goes by the list an item is in, not its URL". `src/reports/prompts.ts:86` still tests `/pull/` for the item kind (outside this round's files). Docs: none.
