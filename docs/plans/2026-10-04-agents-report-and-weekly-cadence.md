# Plan: unified Agents report + daily/weekly cadence split

Status: Pending · Created 2026-10-04 · Decisions confirmed 2026-10-04

## Why

A sample of the September 2026 digests (git `0fe2b98`) and 2026-10-03/04 showed
that much of the daily output is noise:

| Report    | Day-over-day repeat | Quality notes from sampled days                                               |
| --------- | ------------------: | ----------------------------------------------------------------------------- |
| Trending  |                 54% | Ranking moves slowly; Search API window is already 7 days                     |
| Community |                 45% | Lobsters already filters to 7 days; low engagement; off-topic Lobsters picks  |
| HN        |                 28% | High quality, ~3/20 off-topic — keep daily                                    |
| CLI       |                 15% | Releases are the value; ~1/3 of TL;DR bullets restate ongoing themes          |
| Agents    |                 10% | OpenClaw substantive; peers mostly activity counts (IronClaw: 1 issue/day)    |
| PH        |                  7% | Mostly consumer apps, ~11/day, miscategorized                                 |
| Infra     |                  6% | 5/6 repos ship no release on a given day; PR churn relevant only to operators |
| ArXiv     |                  5% | Newest 50 papers, no quality signal, mostly off-focus; ran 15/30 days         |

Release cadence (Sept, links in reports, lower bound): Claude Code 22/30 days,
Qwen Code 18, Copilot CLI 17, OpenClaw 10, QwenPaw 9, Codex 7, OpenCode 7,
Gemini CLI 7, Hermes 6, IronClaw 2, Pi 2, ZeroClaw 1. Most days carry 3–5
releases across the agent group — enough for a daily report built on releases.

## Target shape

**Daily:** `ai-agents` (new format), `ai-hn`, `ai-web`, `ai-arxiv` (unchanged for now).
**Weekly (Monday CST):** `ai-trending`, `ai-community`, `ai-infra`, `ai-hf`, Skills.
**Dropped:** `ai-cli` (merged into agents), `ai-ph`.

Archive files for dropped/merged IDs stay reachable: keep them in
`REPORT_LABELS` (`src/i18n.ts`), `LABELS` (`index.html`) and `REPORT_FILES`
(`src/generate-manifest.ts`), same treatment as `ai-weekly`/`ai-monthly`.

## Decisions (confirmed 2026-10-04)

1. **Report ID:** the merged report reuses `ai-agents` (title becomes "AI Agents
   Digest"), so the sidebar/RSS keep one continuous agents series. `ai-cli`
   becomes archive-only.
2. **PH dropped**, not made weekly. `PRODUCTHUNT_TOKEN` secret can be removed afterwards.
3. **ArXiv left as is** (daily, untouched). Its quality problem is a separate
   follow-up, out of scope here.
4. **Infra weekly**, using the same releases + hot-issues pipeline as agents
   with a 7-day window — no more per-repo PR summaries.
5. **OpenClaw loses its primary-focus deep dive**; it is one agent among 12.
6. **Discussions dropped** for Codex and Pi along with issues/PRs.
7. **Skills** moves out of the CLI report into a short section of the weekly
   `ai-trending` report.
8. **Archive titles:** reusing `ai-agents` means old OpenClaw-ecosystem files
   show under the new "AI Agents Digest" title in the sidebar/RSS.

## Part 1 — Unified Agents report (daily)

### Config

- `config.yml`: replace `cli_repos`, `openclaw`, `openclaw_peers` with one
  `agents:` list (12 entries). Per entry: `id`, `repo`, `name`, optional
  `keywords` (extra match terms for news, e.g. `claude code`, `openclaw`).
  Drop `paginated`/`discussions` for agents — no longer used.
- `src/config.ts`: `RawConfig`/`RadarConfig` get `agents` and lose
  `cliRepos`/`openclaw`/`openclawPeers`; update built-in defaults and
  `config.test.ts`.

### Data

- `GitHubRelease` (`src/github.ts:60`): add `prerelease: boolean`.
- `fetchRecentReleases`: raise `per_page` to 100, the API max (llama.cpp ships
  several builds a day, ~35–70 a week; 10 truncates a 7-day window). Verify no
  truncation in the weekly dry run. Callers split stable vs prerelease.
- New `fetchHotIssues(repo, since)` in `src/github.ts`: one request,
  `/issues?state=all&since=…&sort=comments&per_page=30`, drop PRs, keep items
  that are **created inside the window** and either exceed an engagement
  threshold (`comments + 👍 ≥ HOT_ISSUE_MIN`, start at 10 — tune from a dry
  run) or carry a `regression`/`security` label (case-insensitive substring).
  Cap 2 per repo. Comment the threshold rationale where it lives.
- New `matchAgentNews(agents, { hn, web, trending })` (pure function, new file
  `src/agent-news.ts`): case-insensitive match of agent `name`, repo name and
  `keywords` against HN titles, web item titles/URLs and trending repo
  name/description. Returns `Map<agentId, NewsItem[]>`. Word-boundary matching
  so `pi` does not match "API" — Pi needs `keywords` like `pi coding agent`,
  `earendil` and its name matched only as a whole word in a coding context;
  write tests for the Pi/`pi` false-positive case explicitly.

### Prompt + build

- `src/prompts.ts`: delete `buildCliPrompt`, `buildPeerPrompt`,
  `buildComparisonPrompt`, `buildPeersComparisonPrompt`; add
  `buildAgentsPrompt(perAgent, dateStr)` taking, for each agent with activity:
  stable releases (tag, name, body truncated), prerelease count, hot issues,
  news items. One LLM call. Output: a short cross-agent overview (≤150 words),
  then one `### Agent` section per active agent (releases → news → hot issues),
  max 3 bullets each. Quiet agents omitted; a final line lists them.
- If the prompt exceeds a sane size on a heavy day, split into two calls
  (overview + sections) — measure on a dry run before adding this.
- `src/report-builders.ts`: replace `buildCliReportContent` and
  `buildOpenclawReportContent` with `buildAgentsReportContent`. The file is
  small enough that the issue uses the full body; drop the brief/`fullReportUrl`
  variant for agents unless a dry run exceeds ~50 KB.
- `src/i18n.ts`: new title/issue title for agents; remove CLI/OpenClaw strings
  no longer referenced (keep archive labels). New issue label `agents` in
  `ISSUE_LABELS` + `LABEL_COLORS`; keep `cli` and `openclaw` in
  `DIGEST_ISSUE_LABELS` so old issues remain closable.
- `src/index.ts`: fetch phase fetches releases + hot issues for agents (no
  PRs, no discussions); summary phase is the single agents call; remove the CLI
  and peers comparison calls.

## Part 2 — Weekly cadence

- `src/index.ts`: rename `HF_REPORT_WEEKDAY` → `WEEKLY_REPORT_WEEKDAY`, update
  the comment to cover all weekly reports with the measurements above. One
  `isWeeklyDay` flag gates **both fetch and save** for Community, Infra, HF
  and Skills (same pattern HF uses today).
- **Trending is the exception: fetch daily, report weekly.** The daily agents
  report needs trending repos for its news matching. The fetch is one HTML
  scrape + 6 Search API calls and no LLM call, so only the Trending report and
  its LLM call are gated to the weekly day.
- **Test override:** `DIGEST_FORCE_WEEKLY=1` env var forces `isWeeklyDay`
  true, so the weekly path can be dry-run on any day. Read it in `main()`
  next to the weekday check; document it in CLAUDE.md's env var list.
- Weekly windows:
  - Trending: keeps `since=daily` scrape (daily fetch feeds agent news);
    Search API already uses 7 days, which gives the weekly report its window.
  - Dev.to: `top: "7"` (`src/devto.ts:83`).
  - Lobsters: already 7 days — no change.
  - Infra: `since = now − 7d` for releases + hot issues, rendered by the
    same `buildAgentsPrompt`/builder parameterized by a window label
    ("today" / "this week") and report title. Delete `buildInfraPrompt` and
    `buildInfraComparisonPrompt`; drop `paginated` from infra entries
    (hot issues is one request per repo).
  - Skills: fetch unchanged (no date filter). Rendered as a short section
    appended to `ai-trending` (it is "what's popular", same genre).
- Remove PH from `fetchAllData`, `main()`, `report-savers.ts`,
  `prompts-data.ts`; delete `src/ph.ts` and its tests. ArXiv is untouched.
  Keep archive entries (see above).
- **Issue lifetime:** `closeSupersededIssues` keeps only the newest day's
  issues, so a Monday weekly issue would be closed on Tuesday (already true for
  HF today). Change: issues carrying a weekly label (`trending`, `community`,
  `infra`, `hf`) are retained while they are the newest issue **for that
  label**; daily labels keep current behaviour. Add tests next to the existing
  closer tests in `github.test.ts`.
- Highlights (`main()` step 5, `scripts/regen-highlights.ts`): report list
  becomes agents/hn/web daily + weekly IDs on Mondays.
- Workflow `daily-digest.yml`: no structural change. Drop `PRODUCTHUNT_TOKEN`.

## Part 3 — Side effects

- LLM health gate: a non-Monday run now makes ~4–5 calls (agents, HN, web,
  highlights). `LLM_MIN_SAMPLES = 5` means the first gate (after summaries) may
  never arm. Acceptable — the second gate still runs before commit — but note
  it in the gate's comment; do not lower the threshold to 1–2 (one flaky call
  would abort the day).
- `mcp/src/index.ts`: update report-type list/defaults (default `ai-cli` →
  `ai-agents`).
- `index.html` `LABELS`, `NOTIFY_LABELS`, `REPORT_LABELS`: add new titles,
  keep archive IDs.
- Docs: README.md and CLAUDE.md (architecture, tracked sources, report outputs
  table, conventions on brief issues / sampleNote / discussions that no longer
  apply). Grep for `ai-cli`, `CLI_REPOS`, `OPENCLAW_PEERS`, `buildCliPrompt`,
  `HF_REPORT_WEEKDAY`, `producthunt` before declaring done.

## Delivery

Two PRs, in order:

1. **Agents report** (Part 1 + its side effects). Biggest diff; estimate
   ~600 lines changed incl. deletions, ~10 files.
2. **Weekly cadence + drops** (Part 2 + rest of Part 3). Estimate ~500 lines (infra moves onto the agents pipeline),
   mostly deletions.

## Done when

- `pnpm typecheck && pnpm lint && pnpm test` pass.
- New tests: `fetchHotIssues` filtering, prerelease split, `matchAgentNews`
  (including the `pi` false-positive case), weekly gate on/off, closer keeps
  latest weekly issue per label.
- A `workflow_dispatch` dry run (or local `pnpm start` without `DIGEST_REPO`)
  on a non-Monday produces only `ai-agents.md`, `ai-hn.md`, `ai-arxiv.md`, `ai-web.md` (if new
  web content) and `highlights.json`; a run with `DIGEST_FORCE_WEEKLY=1`
  additionally produces `ai-trending.md`, `ai-community.md`, `ai-infra.md`,
  `ai-hf.md`.
- Dry-run `ai-agents.md` reviewed by hand: every listed release is stable, no
  prerelease spam, no obvious false-positive news matches.
