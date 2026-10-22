# Names, per-page feeds, labels and docs

Status: ready-for-agent
Blocked by: 01, 02, 03, 04, 05

Spec: "What changes besides the pages" in `../spec.md`.

- **Names.** "Policy Watch" becomes "AI Policy" and "Data Engineering Watch" becomes "Data Engineering" in `REPORTS`. Ids and labels stay (`ai-policy`/`policy`, `ai-data`/`data`). The H1, issue title, sidebar, RSS, Telegram and the Teams card all derive from `REPORTS`; check that nothing else spells the old names outside `digests/`. In prose (AGENTS.md, README, comments) the feature may keep its history: "AI Policy (Policy Watch until October 2026)" once, then the new name.
- **One RSS feed per page.** `pnpm manifest` also writes `feeds/<id>.xml` for every live report, the latest 30 issues of that report, next to `feed.xml`, which stays the all-pages feed. The workflow's commit step (`.github/workflows/daily-digest.yml`) adds `feeds/`. The web UI links each page's feed from the page.
- **MCP server** (`mcp/src/index.ts`): the default report type and the type list follow the manifest. Merging deploys it through `deploy-mcp.yml`.
- **GitHub labels.** Do not delete any. List under `## Comments` here the stale labels (`trending-en`, `community`, `community-en`, `arxiv-en`, `hn-en`, `web-en`, `digest`, `openclaw`, `infra`, `digest-en`, `openclaw-en`, `infra-en`) and the ones this work retires (`hn`, `web`, `arxiv`, `trending`, `hf`), each with its open and closed issue counts and the `gh label delete` command, for the maintainer.
- **Docs.** GLOSSARY.md: the Daily Digest and Weekly Digest entries, plus Tracked, Spotted and Coming up. README.md and AGENTS.md: a final sweep for the retired names (AI Discussions, Lab Announcements, AI Research, Agent & AI Coding Trends, AI Models, Policy Watch, Data Engineering Watch) outside `digests/`.

## Check

- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm readme --check`; `pnpm manifest` run in a scratch copy writes one feed per page.
- `grep -rn` for the old names outside `digests/` returns only archive labels and history lines.
