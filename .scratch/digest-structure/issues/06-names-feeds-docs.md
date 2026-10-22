# Names, per-page feeds, labels and docs

Status: ready-for-agent
Blocked by: 01, 02, 03, 04, 05

Spec: "What changes besides the pages" in `../spec.md`.

- **Names.** "Policy Watch" becomes "AI Policy" and "Data Engineering Watch" becomes "Data Engineering" in `REPORTS`. Ids and labels stay (`ai-policy`/`policy`, `ai-data`/`data`). The H1, issue title, sidebar, RSS, Telegram and the Teams card all derive from `REPORTS`; check that nothing else spells the old names outside `digests/`. In prose (AGENTS.md, README, comments) the feature may keep its history: "AI Policy (Policy Watch until October 2026)" once, then the new name.
- **One RSS feed per page.** `pnpm manifest` also writes `feeds/<id>.xml` for every live report, the latest 30 issues of that report, next to `feed.xml`, which stays the all-pages feed. The workflow's commit step (`.github/workflows/daily-digest.yml`) adds `feeds/`. The web UI links each page's feed from the page.
- **MCP server** (`mcp/src/index.ts`): tickets 03 and 04 updated the `get_report` type list; check that it matches `REPORTS` and the archive part of `REPORT_LABELS` once more. The default type, `ai-agents`, stays, and `list_reports` already reads the manifest's labels, so the renames reach it without a change. Merging deploys it through `deploy-mcp.yml`.
- **GitHub labels.** Do not delete any. List under `## Comments` here the stale labels (`trending-en`, `community`, `community-en`, `arxiv-en`, `hn-en`, `web-en`, `digest`, `openclaw`, `infra`, `digest-en`, `openclaw-en`, `infra-en`) and the ones this work retires (`hn`, `web`, `arxiv`, `trending`, `hf`), each with its open and closed issue counts and the `gh label delete` command, for the maintainer.
- **Docs.** GLOSSARY.md: the Daily Digest and Weekly Digest entries, plus Tracked, Spotted and Coming up. README.md and AGENTS.md: a final sweep for the retired names (AI Discussions, Lab Announcements, AI Research, Agent & AI Coding Trends, AI Models, Policy Watch, Data Engineering Watch) outside `digests/`.

## Check

- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm readme --check`; `pnpm manifest` run in a scratch copy writes one feed per page.
- `grep -rn` for the old names outside `digests/` returns only archive labels and history lines.

## Comments

GitHub labels for the maintainer to delete (counted 2026-10-22 with `gh issue list --label <label> --state open|closed`). Deleting a label strips it from its issues; nothing was deleted. The retired labels' one open issue each is the last live issue, closed by the next run's `pnpm close-stale` (they are in the legacy list in `src/core/github.ts`).

| Label                | Open | Closed | Delete with                                                    |
| -------------------- | ---- | ------ | -------------------------------------------------------------- |
| `trending-en`        | 0    | 1      | `gh label delete trending-en --repo dboeter/daily-diff --yes`  |
| `community`          | 0    | 6      | `gh label delete community --repo dboeter/daily-diff --yes`    |
| `community-en`       | 0    | 1      | `gh label delete community-en --repo dboeter/daily-diff --yes` |
| `arxiv-en`           | 0    | 1      | `gh label delete arxiv-en --repo dboeter/daily-diff --yes`     |
| `hn-en`              | 0    | 1      | `gh label delete hn-en --repo dboeter/daily-diff --yes`        |
| `web-en`             | 0    | 1      | `gh label delete web-en --repo dboeter/daily-diff --yes`       |
| `digest`             | 0    | 4      | `gh label delete digest --repo dboeter/daily-diff --yes`       |
| `openclaw`           | 0    | 4      | `gh label delete openclaw --repo dboeter/daily-diff --yes`     |
| `infra`              | 0    | 6      | `gh label delete infra --repo dboeter/daily-diff --yes`        |
| `digest-en`          | 0    | 1      | `gh label delete digest-en --repo dboeter/daily-diff --yes`    |
| `openclaw-en`        | 0    | 1      | `gh label delete openclaw-en --repo dboeter/daily-diff --yes`  |
| `infra-en`           | 0    | 1      | `gh label delete infra-en --repo dboeter/daily-diff --yes`     |
| `hn` (retired)       | 1    | 18     | `gh label delete hn --repo dboeter/daily-diff --yes`           |
| `web` (retired)      | 1    | 14     | `gh label delete web --repo dboeter/daily-diff --yes`          |
| `arxiv` (retired)    | 1    | 16     | `gh label delete arxiv --repo dboeter/daily-diff --yes`        |
| `trending` (retired) | 1    | 6      | `gh label delete trending --repo dboeter/daily-diff --yes`     |
| `hf` (retired)       | 1    | 2      | `gh label delete hf --repo dboeter/daily-diff --yes`           |
