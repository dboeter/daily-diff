# Streamline the digest: topics, headings, navigation

Status: needs-triage

Evidence: the 2026-10-10 … 2026-10-12 digests, `src/i18n.ts`, `src/prompts-data.ts`, `index.html`.

## 1. Similar topics on different pages

Few links repeat across reports (1–3 shared URLs a day), so the overlap is in topics, not links. Three topics are split across reports:

| Topic                | Where it shows up today                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Models               | stealth table (`ai-agents`), "Model Usage on OpenRouter" (`ai-trending`), `ai-hf`                                               |
| Community discussion | `ai-hn` (daily), `ai-community` (weekly), and "Community Sentiment Signal" / "Community Pulse" / "Community Hot Spots"          |
| Agent tooling        | `ai-infra` ("Agent Tooling Weekly", 4 repos, 2 active) and trending's "🔌 Agent Tooling" category; `herdr` was in both on 10-12 |

Proposal, 8 reports → 6:

- **Fold infra into agents.** Move `infra.repos` into the agents report as its own `## Agent tooling` group. A quiet repo costs one name in the "Quiet" line, and a 4-repo weekly report is mostly that line. Infra becomes daily.
- **One discussions report.** `ai-hn` daily; on the weekly run it also gets a Dev.to + Lobste.rs section, and `ai-community` is retired.
- **One weekly models report.** `ai-hf` plus OpenRouter token usage and newly listed models (moved out of trending). The stealth table stays daily in agents because it is time-sensitive (⏳ expiry).
- Trending keeps the repo tables, Radar and Skills; Web and ArXiv stay as they are.

Result — daily: Agents, Discussions, Research, Lab news. Weekly: Trending, Models.

Each retirement goes through the "Adding a new report type" checklist in reverse: archive keeps its `REPORT_LABELS`/`REPORT_FILES` entries, plus `WEEKLY_ISSUE_LABELS`, close-stale retention groups and the README.

**User decision (scope):** ArXiv's generic categories (Applications, LLMs) and HF's "Multimodal & Generation" / video models are outside the agents-and-coding focus. Narrowing them is a separate scope question.

## 2. Headings that don't match the content

Root cause: each report has up to four names, set in different places: H1 (`title`), `issueTitle`, `REPORT_LABELS`, `NOTIFY_LABELS`.

| Report         | H1                              | Sidebar / RSS                                                   |
| -------------- | ------------------------------- | --------------------------------------------------------------- |
| `ai-infra`     | Agent Tooling Weekly            | AI Infrastructure Digest                                        |
| `ai-hn`        | Hacker News AI Community Digest | issue: "Hacker News AI Digest"                                  |
| `ai-trending`  | Agent & AI Coding Trends Weekly | Telegram: "GitHub Trends" (half of it is OpenRouter/npm/Skills) |
| `ai-community` | Tech Community AI Weekly        | Tech Community AI Digest                                        |

Inside the reports:

- **Two H1s** in hn, arxiv, community, hf and web: code writes the H1 and the model writes another ("# Hacker News AI Community Digest — 2026-10-12"). The web report adds a third header block (`**Type:** Incremental Update`) and numbered sections.
- **"Today's Highlights" in weekly HF**: the prompt hard-codes it (`src/prompts-data.ts:371`).
- **Skills puts an H1 in the middle of trending** ("# Claude Code Skills Community Highlights") under its own `##` heading.
- **"Community Hot Spots" in trending** lists repos and an OpenRouter model, not community items.
- **Inconsistent section names:** Research Trend Signal / Ecosystem Signal / Community Sentiment Signal / Strategic Signal Analysis / Trend Signal Analysis; Worth Deep Reading / Worth Reading / Worth Exploring.

Proposal:

- One `REPORTS` entry per report in `src/i18n.ts`: `{ emoji, name, shortName }`. H1, issue title, sidebar, RSS and Telegram all derive from it. Keep names cadence-neutral; the archive holds daily and weekly editions.
- One section skeleton for every listing report, with headings defined in `i18n.ts` (as `highlightsHeading` already is for trending): `## Highlights` → tables → `## Signals` → `## Worth reading`. Prompts reference these constants instead of literal text.
- In code (`report-savers.ts`), strip any leading H1 or title block from LLM output before the preamble is added.
- Skills: demote its headings one level; rename "Community Hot Spots" → "Worth watching".

## 3. Navigation

The sidebar is the only navigation: month → day → report. A report has no links to anything else.

- **Day overview page** as the landing page: each report's two `highlights.json` bullets (so far only sent to Telegram), each linking to its report. No new LLM call.
- **Report bar** at the top of each report, rendered in code into the preamble: links to that day's other reports (Pages URLs, so they work in GitHub Issues too).
- **Prev/next** in `index.html`: previous/next day, and the previous edition of the same report (useful for weekly ones), from `manifest.json`.
- **In-report table of contents** built client-side from `##` headings, for long reports (trending is 23 KB).
- **Weekly reports pinned** in the sidebar under "This week" until the next Monday, instead of only under the Monday they ran.

## Suggested order

1. Headings (§2): small, no structural change, and the merges reuse its skeleton.
2. Navigation (§3): `index.html` + preamble, independent of the rest.
3. Merges (§1), one at a time: infra → agents, community → discussions, models.
