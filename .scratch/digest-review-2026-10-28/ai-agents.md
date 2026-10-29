# Review: AI Agents page, edition 2026-10-28

Page: `digests/2026-10-28/ai-agents.md`, `ai-agents` entry of `highlights.json`. Traces: `spotted-trace.json`, `llm-trace.json`. Run log: scratchpad `run.log`.

The 400-character cut on release notes causes three of these findings (A1, A2, A4), so one change fixes all three. The repro script `/tmp/claude-1000/-home-daanb-daily-diff/7f51e89b-9f95-4966-b7d9-50a6de5f564a/scratchpad/relnotes/cut.mts` prints `releaseNotes(body, RELEASE_BODY_CHARS)` for each release on the page, which is exactly what the model saw.

### A1 [high] accuracy

- Location: Agent Tooling › OpenShell, Release bullet: "New sandboxes on Kubernetes, Docker, Podman, and VM now open terminals automatically."
- Problem: The release notes don't say this. The v0.1.6 upgrade note says new sandboxes "now open the control connection from the sandbox to its supervisor, while running sandboxes keep their existing connection direction. Upgrade the supervisor and sandbox runtime binaries together". So the model made up a feature and dropped an upgrade requirement. Both the bullet and Highlight 1 also drop the scope of the auth opt-out ("For trusted local development only, set `allow_unauthenticated_users = true`"). The bullet also says "now requires", while the notes say gateways "refuse to start".
- Evidence: VERIFIED (`gh api repos/NVIDIA/OpenShell/releases/tags/v0.1.6`). The excerpt the model saw ends mid-sentence: "… - New sandboxes on Kubernetes, Docker, Podman, and VM now open t" (cut.mts output). The model finished the cut sentence itself.
- Likely cause: `RELEASE_BODY_CHARS = 400` (src/reports/prompts.ts:149). `releaseNotes` cuts at a fixed character count, including mid-word, and Markdown link URLs (`[#4821](https://github.com/…/pull/4821)`) take up a lot of those 400 characters.

### A2 [high] accuracy

- Location: Coding Agents › OpenCode, Release bullet: "v2.2.0 adds experimental desktop plugins …, refreshes the desktop app experience."
- Problem: v2.2.0 has a `### Breaking changes` section with three items, and the page mentions none of them: the `@opencode/ai` package root is now the Promise API (`@opencode/ai/promise` removed, Effect API moved to `@opencode/ai/effect`); "The OpenCode GitHub Action is removed … Remove it from your workflows"; and TUI plugins require OpenTUI 0.7, so plugins on 0.6 "fail to install". The bullet reads as features only. `RELEASE_ORDER` puts breaking changes first, and `AGENTS_HIGHLIGHTS_FOCUS` ranks "a release with breaking changes" first. The removed Action is also a `GOING_AWAY` case. None of it reached the bullet, the Highlights or highlights.json, so a reader who runs the Action in CI is not warned.
- Evidence: VERIFIED (`gh api repos/anomalyco/opencode/releases/tags/v2.2.0`; the body is 35,349 chars, and the 400-char excerpt ends inside `### Highlights`, mostly PR link URLs).
- Likely cause: same as A1 (src/reports/prompts.ts:149). Nothing pulls a "Breaking changes" or "Upgrade notes" section ahead of the cut.

### A3 [high] correctness

- Location: Coding Agents, "**Unavailable today:** [OpenAI Codex]"
- Problem: Codex's stable release rust-v0.165.0 (published 2026-10-27T20:09Z, inside the window) is missing from the page. Codex has also been Unavailable on 10-24, 10-26, 10-27 and now 10-28, so a top tracked project has had no coverage for most of a week. The failure is not random flakiness: it comes from the payload size. Each Codex release carries 36–318 asset records, and `/releases?per_page=100` makes GitHub serialize all of them, which takes longer than GitHub's server-side time limit.
- Evidence: VERIFIED. Timed the same request (`curl` with the gh token, and `gh api`):
  - `per_page=100` (5 tries): `curl` gave 504 at 11.3 s, 504 at 11.3 s, and once 200 with only 219,264 bytes of unterminated JSON at 12.3 s (cut mid-body). `gh api` gave "stream ID 1; CANCEL" after 12.3 s once and 200 in 11.0 s once.
  - `per_page=50`: 200 three times out of three, 28,592,374 bytes, 10.0–11.1 s. That is right at the limit.
  - `per_page=30`: 5.4 s. `per_page=10`: 4.9 s.
  - The 50 releases hold 13,548 assets, but only 90 KB of release notes.
  - `releases/latest` answers in 0.6 s (rust-v0.165.0, 318 assets).
  - Run log line: `[codex] fetch failed: Error: GitHub API error 504 (https://api.github.com/repos/openai/codex/releases)`.
- Likely cause: `fetchRecentReleases` (src/core/github.ts:175-183) asks for `RELEASES_PAGE = 100` (github.ts:162). `githubGet` (github.ts:114-136) retries only a `TypeError` (dropped connection), so a 504 `GitHubApiError` fails on the first try. Its raw `fetch` also has no timeout (`fetchOk` has one, `githubGet` does not use it). Fix direction: smaller pages (10–30), paged until `published_at < since`, plus a retry on 5xx. Constraint: `noStableYet` depends on the page size being 100 (`releases.length < RELEASES_PAGE`, see the comment at github.ts:167-171 about Codex's ~86 alphas per 100), so a page-size change has to keep that check working.

### A4 [medium] relevance

- Location: release bullets of Gemini CLI, Oh My Pi, OpenShell and Claude Code
- Problem: Each bullet summarizes the first 400 characters of its notes rather than the changes that matter most.
  - Gemini CLI v0.66.0: the bullet ends with "updates roadmap and changelog", taken from the first four chore lines. It misses `fix(core): disable interactive credential and SSH prompts in getSafeGitEnv`, opt-in private network endpoints for MCP OAuth, binary-update PATH-shadowing verification, and the "not optimized for Gemini 4" banner.
  - Oh My Pi v18.13.1–v18.13.2: the bullet leads with two SDK internals from `pi-agent-core`, the package the notes list first. It misses v18.13.1's `tools.restrictedFolders`, which asks for approval in every mode including `yolo`, the GPT-6.1 Terra and Kimi K3.1 Pro catalog entries, and v18.13.2's OAuth `invalid_grant` fix. v18.13.2's notes are 49 KB and the model saw one item.
  - OpenShell v0.1.6: misses the "upgrade supervisor and sandbox runtime binaries together" note (see A1), suspend/resume, and four CVE/RUSTSEC dependency fixes (webpki compromised emSign CA, russh CVE-2026-111061, Tokio, ctutils).
- Evidence: VERIFIED (`gh api …/releases/tags/<tag>` for each, and the cut.mts excerpts).
- Likely cause: src/reports/prompts.ts:149 (`RELEASE_BODY_CHARS = 400`) and `releaseNotes`. `RELEASE_ORDER` cannot reorder items the model never sees.

### A5 [medium] accuracy (regression of ticket 03)

- Location: Highlight 3, "Hermes Agent leaks valid `OPENAI_API_KEY` to third-party `base_url` endpoints …", and the same sentence in highlights.json `ai-agents[1]`
- Problem: This comes from one user's open issue (#145452, labelled `type/security`, `P3`), but the Highlight states it as a fact. Ticket 03's rule says "An open issue is a report ('users report'), not an established fact". Highlight 2 follows the rule ("Users report …") and Highlight 3 does not. The Hermes hot-issue rows also give no fix status, which ticket 06 asks for on security issues: fix PR #145478 ("use declared provider credentials for catalog probes") is open, and #145361 has a fix "staged on the fork". The prompt did say `[OPEN]`, but it carries no comments or linked PRs.
- Evidence: VERIFIED (`gh api repos/NousResearch/hermes-agent/issues/145452`: open, 5 comments, 0 👍, filed by smhc, "Verified on v0.22.5+1437"; `gh api …/pulls/145478`: open, not merged).
- Likely cause: the Highlights prompt (`SOURCE_FIDELITY_RULES`, src/reports/prompts.ts) has the rule, but no code enforces it. The issue block from `formatItem` (prompts.ts:47-67) gives the 300-char body excerpt only, with no linked PRs.

### A6 [medium] relevance / consistency

- Location: Gemini CLI, "Hot issue: [#15404] — temporary error files flagged as `Generic.PyStealer.AD.3D27F607` by antivirus … (16 comments, +3 in 24h)"
- Problem: This is a 10-month-old antivirus false-positive report (opened 2025-12-21, 0 👍). It cleared only the labelled bar (3, through `area/security`), and its +3 gain in the window is two `gemini-cli[bot]` comments and one "/assign" comment. No user engaged with it. The row also hides the label it qualified on: both Hermes rows say "(security, …)" and this row does not.
- Evidence: VERIFIED (`gh api …/issues/15404`: labels include `area/security`, `priority/p2`. Comments in the window: 09:05Z gemini-cli[bot], 15:23Z Neal006 "/assign", 15:23Z gemini-cli[bot]).
- Likely cause: `issueEngagement` and the window count (src/core/github.ts:236-238, plus the comment counting in `countHotIssues`) count every comment, with no bot or command filter (a grep of github.ts for `bot`, `user.type` and `/assign` finds nothing). `HOT_LABEL = /regression|security/i` (github.ts:235) matches the broad `area/security`. The parenthetical with the counts is written by the model, so it differs from row to row (see A9).

### A7 [medium] accuracy / relevance (regression of ticket 08, explained by the new state)

- Location: OpenCode, "Hot issue: [#59387] — free tier limits not resetting, "Free usage exceeded" errors blocking users (31 comments, 6 👍, +35 in 24h)"
- Problem: (1) The issue was already shown on the 10-27 page. (2) The row presents it as a live bug. In fact it is the maintainers' consolidation thread, "Free tier issues: read this first", and the thread's answer is that v1 (`0.x`/`1.x`) no longer supports free models and updating to v2 fixed it for many people. The 10-27 row called it "main tracking issue". This row drops that and the workaround.
- Evidence: VERIFIED (`git show origin/main:digests/2026-10-27/ai-agents.md` line 29; `gh api repos/anomalyco/opencode/issues/59387` body; the gain checks out: 30 comments + 5 👍 created after 2026-10-26T21:01Z = 35).
- Likely cause: the repeat comes from the new `digests/hot-issues-state.json`, whose first run starts empty. It is not on origin/main (`git show origin/main:digests/hot-issues-state.json` → "exists on disk, but not in 'origin/main'"), so CI's first run will repeat the 10-28 issues as well unless this branch's copy is committed. The framing comes from the model reading only the first 300 characters of the body.

### A8 [low] correctness

- Location: Oh My Pi Release bullet, "add AgentTool.handlesToolInterrupt flag" (shown without code formatting). Log line: `` `AgentTool.handlesToolInterrupt` is not in its source ``
- Problem: The check got it right. The source says "`AgentTool` gained the optional `handlesToolInterrupt` flag", so the dotted token the model wrote appears nowhere as one string, and `IDENTIFIER_RULE` asks for verbatim identifiers. The weak part is the fallback: it strips the backticks, so the rendered text is a dotted identifier shown as prose. Retrying with the last dotted segment (`handlesToolInterrupt`, which is in the source) would have kept a correct code token. The warning appears twice in the log (lines 126 and 139) because `groupProjects` runs twice, once for the Highlights input and once for the final page. That is noise, not a second hit.
- Evidence: VERIFIED (`gh api repos/can1357/oh-my-pi/releases/tags/v18.13.2`; `checkCodeTokens`, src/reports/summarized-table.ts:64-90: `source.includes(token)`, then a `tokenKey` match against whole source tokens).
- Likely cause: src/reports/summarized-table.ts:79-86.

### A9 [low] consistency

- Location: the count parentheticals on hot-issue rows
- Problem: Every row uses a different form: "(90 👍, 52 comments, +29 in 24h)", "(21 👍, filed 2026-10-27)" with no comment count, "(16 comments, +3 in 24h)" with no 👍, "(31 comments, 6 👍, +35 in 24h)" with the order flipped, and "(security, 5 comments, filed 2026-10-27)" with a label that only some rows show. All of the numbers checked out (#97074 +29 = 14 comments + 15 👍 in the window; #105408 21 👍, filed 10-27).
- Evidence: VERIFIED (page, plus `gh api` counts for #97074 and #59387).
- Likely cause: the model writes these parentheticals freely from `formatItem` and `hotIssueGain` (src/reports/prompts.ts:47-67, 255). No code renders them.

### A10 [low] accuracy

- Location: Claude Code Release bullet, "fix long startup freezes with large `CLAUDE.md` files"
- Problem: The note says the freeze happens "when a CLAUDE.md file holds a very long list item", not when the file is large. "Fix interrupt handling" is vague. The bullet also repeats the v2.1.311 items the 10-27 page already showed. That repeat is an artifact of this local run: it started at 21:01Z, 16 h after the 10-27 page (04:50Z), and the window is `now − 24h` (src/index.ts:238), so the two windows overlap. Oh My Pi's `Agent.isPaused` and Codex spend-cap items repeat 10-27 for the same reason.
- Evidence: VERIFIED (`gh api …/claude-code/releases/tags/v2.1.311`; `git show origin/main:digests/2026-10-27/ai-agents.md`).
- Likely cause: model paraphrase (wording). The repeat is from the local run's timing, not the code.

### A11 [low] relevance

- Location: Spotted rank 2, "Show HN: Agent-relay … ([saranyan/agent-relay])", 4 points, 0 comments, summary "—"
- Problem: A 2-star repo with no discussion and no summary sits above a 124-point story. This follows the spec: both rank in confidence band 10 above "Here be monsters" (0.85 → band 9), and the points floor (`SPOTTED_MIN_POINTS.hn = 5`) applies only from the 4th row. Still, the row gives the reader nothing, even though the README has a one-line pitch ("Let AI coding sessions from different vendors work together"). The GitHub description is null, so the "—" follows the rule. Row 4, Survival LLM (an offline consumer survival assistant, agents 0.72), is a borderline fit for an agents page. Its summary's "1.5 million articles" comes from the story's stored description; the current page says "about 930,000 Wikipedia articles" plus other references.
- Evidence: VERIFIED (`spotted-trace.json`, `digests/spotted-log.json` points, `gh api repos/saranyan/agent-relay`, brangus.io page).
- Likely cause: `selectSpotted` / `claimRows` floor ordering (src/spotted/pool.ts:369-420). This is how the spec is written, not a bug.

### A12 [low] relevance

- Location: News bullets. Claude Code: "[Dev.to] — 30-day experiment coding exclusively with Claude Code …". OpenCode: "[GitHub Trending] — +5,070 stars this week, highlighting growth of the open-source coding agent."
- Problem: The Claude Code item is a personal field report (16 reactions, 7 comments), not news about the project. The summary is accurate: the author rule was "for 30 days I don't type application code". The OpenCode bullet ends with filler ("highlighting growth of …"). It shows a weekly figure on a daily page because this forced-weekly run fetches only the weekly trending list (src/index.ts:279). It names its window, so this is allowed by the spec. Neither news link was on the 10-24, 10-26 or 10-27 pages.
- Evidence: VERIFIED (dev.to API for the article; `ai-trends.md` line 41 has the same +5,070; grep of the earlier pages).
- Likely cause: prompt ("what the news item says about the project and why it matters" invites the filler clause), src/reports/prompts.ts:298.

## Checked and fine

- Header counts: Projects 16 (12 agents + 4 infra); Active 6; Stable releases 7 (CC 2, Gemini 1, OpenCode 1, OMP 2, OpenShell 1); Prereleases 7 (Gemini 2, context-mode 4, Kilo 1). These match the run log. Quiet (6 + 3) + Unavailable (1) + Active (6) = 16. The meta line puts the counts first and `Generated` last (ticket 17).
- Ticket 07: every project with a release has a heading and a `**Release:**` bullet. No absence text.
- Ticket 17: `**Release:**`, `**Hot issue:**` and `**News:**` all have the colon inside. Counts are pluralised ("0 comments", "4 points"). The banner matches the other pages.
- Hot-issue bar: all six rows clear it. #97074 gain 29 (verified by count), #105408 21 (opened in the window), #59387 35 (verified), #15404 3 with `area/security`, #145361 and #145452 5 each with `type/security`. All six are open (ticket 08: no closed issue shown). Titles and claims match the issue bodies (#97074 "~1.8×" on a Max plan; #105408 Vertex + `CLAUDE_CODE_SKIP_VERTEX_AUTH=1`; #145361 p5js exporter disables Chrome sandbox and web security). Highlight 2's "Users report" follows ticket 03. The issue is one user's A/B test with 90 👍, which is fair to call "users".
- Claude Code `oidc.user_id_claim` (Entra ID `oid`) and `--hold-idle-file` / `--max-hold-min` match the notes. Oh My Pi `Agent.isPaused` and the Codex spend-cap fix match v18.13.1.
- Ticket 03 / 04 for highlights.json: 2 entries, the first restates the page's lead (OpenShell), one subject each, no "GA" or calls to action. The 3 page Highlights are in rank order.
- Ticket 05: 5 of 6 Spotted summaries are in the model's own words with one concrete fact, each checked against its page: Formal OIDC (formal.ai post); "Here be monsters" (adrq.dev); MCP 15→4 tools, 7→2 calls, 88% (dev.to API); 11 design-to-code tools (dev.to API); Survival LLM (see A11). The "—" row has no description. Link text `saranyan/agent-relay` follows the owner/repo rule.
- Ticket 10: Spotted selection follows the rules. Kauldron (agents 0.58) and "3D game" (0.53) were dropped as `threshold`. Ranks 1–6 in the trace match the page order. 4 HN rows (cap 6) and 2 Dev.to rows (cap 2). The floor applied to row 4 (Survival LLM, 46 ≥ 5). All stories are within 7 days. No contest entries.
- Ticket 01: `spotted-trace.json` has a `sources` header (hn 66/40, lobsters 1/1, devto 11/8) and `rendered`/`rank`/`dropped_reason` on every item. `llm-trace.json` has 16 entries, all `ok` (agents 3022 chars, infra 390, spotted-summaries 1429, agents-highlights 521, highlights 1155), matching the log line `[llm] 0/16 LLM calls failed`.
- Ticket 11: news matching reads title + description (src/reports/project-news.ts:89-90). No agents story was cap-cut today, so the carry rule had nothing to show.
- Ticket 06: the identifier post-check runs on the repo sections (it fired on Oh My Pi). Backticked tokens left on the page (`claude -p`, `apiKeyHelper`, `CLAUDE_CODE_SKIP_VERTEX_AUTH=1`, `Generic.PyStealer.AD.3D27F607`, `OPENAI_API_KEY`, `Agent.isPaused`, `allow_unauthenticated_users = true`) are all in their sources. The release ordering and the fix status for security issues are not met (A2, A4, A5).

## Not checked

- Hot-issue candidates past the list cap: the log has `nousresearch/hermes-agent: hot-issue list stopped at 8 pages`, so Hermes issues beyond page 8 were never weighed.
- Whether the Claude Code Dev.to news item cleared `DEVTO_MIN_REACTIONS` (16 reactions).
- The `decided: null` field on every `spotted-trace.json` item: not documented in AGENTS.md's trace description. Not traced to code.
- Kilo Code, context-mode and Gemini prereleases (not covered by design). The notes of the other quiet projects.

## For the caller (outside this page)

- The run log says `[providers] Using LLM provider: openrouter`, but the shared brief says this local run used Anthropic.
- `digests/hot-issues-state.json` is untracked here and missing on origin/main (see A7).
- The Trends row for anomalyco/opencode reads "… is the open source coding agent written in TypeScript. It is the open source coding agent in TypeScript." (a duplicated sentence, ai-trends.md:41).
