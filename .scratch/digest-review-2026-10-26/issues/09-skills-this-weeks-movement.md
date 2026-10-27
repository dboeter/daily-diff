# 09: Skills section shows only this week's movement

Status: done
Blocked by: None (can start immediately)
Findings: T1 — see `../review.md`

## What to build

The Trends page's Claude Code Skills section shows skills PRs and issues that moved this week. On 2026-10-26, 8 of its 11 items repeated the 2026-10-19 page and several had not been updated in 5+ weeks; all are open third-party PRs, yet "Top Skills" read like released skills.

- [x] Only PRs/issues updated in the last 7 days are eligible
- [x] An item shown in the previous Weekly Digest is skipped unless its state changed
- [x] The section is renamed so open PRs are not mistaken for released skills (e.g. "Open PRs worth watching")
- [x] Off-audience items (not about coding agents or data/AI engineering) are filtered
- [x] The section and its Takeaway are left out when nothing qualifies
- [x] AGENTS.md's Trends row matches the new section name

## Comments

- The fetch now asks for the PRs and issues updated most recently (any state), so a PR closed this week is seen; `selectSkillsItems` keeps the last 7 days and skips what the page dated 7 days earlier named unless it closed in the window. The 2026-10-19 page named items as bare `#N` (no links), so both forms are read.
- Section renamed "Skills: open PRs worth watching"; subsections Open PRs worth watching / Closed this week / Requests / Takeaway.
- Review fix: a closed item is kept only when `closed_at` falls in the 7-day window (a comment on a PR closed months ago no longer lands under Closed this week). Test: `drops a closed item that closed before the window` (skills.test).
- Review fix: heading renamed "Skills: PRs and requests this week" (`skillsHeading`), since issues and closed PRs are included; AGENTS.md and README updated. `shownSkillsNumbers` still reads pages with the old heading.
- Off-audience, in code: `selectSkillsItems` keeps an item only when its title matches `AUDIENCE_TITLE_RE` (`isAudienceSkillsItem`, `src/trending/skills.ts`): the developer skills (skill-creator, claude-api, mcp-builder, webapp-testing), evals and triggering, skill distribution (marketplace, plugins, namespace, skill sharing), Claude Code sessions, hooks, memory. The prompt's off-audience sentence stays as a second net.
- Why a keyword rule and not Jev: on the 11 items of the 2026-10-26 page the title rule keeps #1742 mcp-builder, #1298 skill-creator, #492 namespace, #228 skill sharing, #556 run_eval, #1980 webapp-testing, #1681 skill-creator and drops #1245 (Notion spec + resume auditor), #1771 proofcore (smart contracts), #1703 md2video, #525 pyxel games: exactly the review's off-audience four. Matching the body as well let all four back in: PR templates name Claude Code, MCP, plugin or marketplace in nearly every body (proofcore via "MCP", md2video via "plugin", pyxel via "marketplace"). So titles only.
- On the week's live pool (fetched 2026-10-26, items updated since 10-19) the rule also drops the Brahma trading and xzai media skills, the slack-gif-creator and dashboard-design PRs, the docx/pptx/office fixes, CI/devcontainer PRs and the one-word spam issues ("skill", "Motiongeraphy", "/CANVA+"). The document-format skills (docx, pptx, xlsx) are left out on purpose: they are office-document tooling, not coding agents or data/AI engineering.
- Known gap: a new on-audience skill whose title names no listed term is dropped until the list is edited (this week: #1479 plan-file-hygiene, and #2032, an eval-viewer fix titled "Escape closing script tags in embedded JSON"). A `judgeItems` gate with a verdict cache would not have that gap; revisit if the misses recur. #2067 (theme-factory "trigger clause") gets in through "trigger".
- Section and Takeaway: no `pages.ts` change; `buildTrendsReport` already leaves the section out when `prs.length + issues.length` is 0 (`hasSkills`, `src/reports/pages.ts:151`). Test: `leaves nothing when every item is off-audience, so the section and its Takeaway are left out` (skills.test).
- Branch review fix: AGENTS.md's Skills bullet lists memory among the title terms and says the prompt's off-audience rule stays as a second net, matching `AUDIENCE_TITLE_RE` and `buildSkillsPrompt`.
