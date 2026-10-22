# Digest structure: one topic per page

Status: ready-for-agent

Evidence: the digests of 2026-10-12 … 2026-10-22 (report files, `highlights.json`, `policy-ranking.json`, `trending-state.json`, `policy-state.json`), `src/core/i18n.ts`, `config.yml`, `gh label list`, and the October round in `.scratch/streamline-digest/spec.md`. The archive lags the code: the 2026-10-22 data report still has `## Data × AI`, which the current code drops. Claims about a page's layout come from the code and its tests.

## What the digest is for

A news digest and trend spotter for AI and data engineering. It has two readers: the maintainer (AI coding agents, AI policy) and colleagues at Digital Power, data engineers who get the data report in Teams. It answers three questions: what changed since yesterday, what is coming up, and what is rising.

## Diagnosis

The five complaints, and what the archive shows for each.

1. **Labels don't match topics.** Four of the eight pages carry a source as their label and file id (`hn`, `hf`, `web`, `arxiv`) and a topic as their title ("AI Discussions", "AI Models", "Lab Announcements", "AI Research"). The repo also has 12 stale digest labels (`*-en`, `openclaw`, `digest`, `infra`, `community`).
2. **Topics don't match titles.** "AI Agents" opens with stealth models on OpenRouter, a models topic. "Agent & AI Coding Trends" ends with Claude Code Skills. "AI Discussions" sorts Hacker News into Models & Research, Tools & Engineering, Industry News and Opinions, which are the topics of four other pages. "AI Models" is Hugging Face plus OpenRouter usage. "Lab Announcements" is Anthropic and OpenAI only.
3. **Overlap.** Two pages of the same day shared only 6 links in 2026-10-13 … 22, so the overlap is in topics, not links. Model news has five homes: the stealth table in Agents, HN's Models & Research, Lab Announcements, the weekly AI Models page, and model retirements in Data. Pages also repeat themselves. 55 of 174 HN rows (32%) repeated a row of the previous HN report, and all 47 "Worth a Look" links in those ten days were rows the same page had already shown.
4. **The daily/weekly split.** Which pages appear depends on which sources published: 2 pages on Saturday 10-17, 7 on Monday 10-19 (without Policy), 6 on 10-20 … 22. Weekly means two source-defined pages (Trending, AI Models), weekly-only sections inside a daily page (Dev.to and Lobste.rs in Discussions on Mondays), and a weekly-to-daily flow (trending repos promoted into Agents). arXiv has no page on Sunday and Monday.
5. **Tracked and random items mixed.** Promotion took the Agents header from `Projects: 16` (10-19) to `Projects: 25` (10-21). Since then 6 of the 11–12 project sections a day are promoted trending repos. They appear as `owner/repo` next to the curated list, with no marker: `michael-denyer/pstack-claude`, and `heygen-com/hyperframes`, a video renderer, under Agent Tooling. Every page mixes tracked and discovered items in its own way, and no page says which is which.

**Root cause.** Pages are cut along three axes at once: by source (HN, arXiv, the lab sitemaps, Hugging Face), by topic (agents, policy, data) and by method (trending). With three axes there is no rule for where an item belongs, so one model release can land on five pages. The October round fixed the names and merged reports but kept the three axes. Policy and data then added two topic pages next to the source pages, and the overlap came back.

## The placement rule

1. A page is a topic. A source is a column on a page, never a page.
2. Cadence is a mode, not a set of sources. Daily pages answer "what's new since yesterday", the weekly page "what's moving". A daily page has no weekly-only sections, and the weekly page repeats no daily news.
3. Every page has the same two parts. **Tracked** is everything relevant from the lists in `config.yml` (projects, vendors, labs, legislative files, policy feeds), with a quiet line on a day without news. **Spotted** is the best of the open sources (Hacker News, Lobste.rs, Dev.to, GitHub Trending, arXiv, Hugging Face), picked by topic and signal. Nothing moves from Spotted to Tracked without a config edit.
4. One item, one page, once. An item lands on its tracked page if it names a tracked project, else in its topic's Spotted part, else nowhere. An item shown on one day is not shown again the next. Three exceptions stay. Two because colleagues read Data only: Data links to EU data-law items of Policy Watch, and a story naming a tracked agent and a tracked data project (or two copies of one article, naming one each) is news on both AI Agents and Data Engineering. One because AI Agents tracks what is said about its projects: a lab post is a row on AI Models & Labs, and a community story about it that names a tracked agent is that agent's news too.

## Proposed pages

Daily, in this order:

| Page             | id / label                 | Tracked                                                                             | Spotted                                                                                          | Replaces                                                                       |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| AI Agents        | `ai-agents` / `agents`     | coding agents and agent tooling in `config.yml`: releases, hot issues, matched news | HN, Lobste.rs and Dev.to stories about agents and AI dev tools                                   | AI Agents without its stealth table and promoted repos; HN Tools & Engineering |
| AI Models & Labs | `ai-models` / `models`     | Anthropic and OpenAI posts (sitemaps), OpenRouter stealth and newly listed models   | HN stories about models and labs                                                                 | Lab Announcements, the stealth table, HN Models & Research and lab news        |
| AI Research      | `ai-research` / `research` | none                                                                                | arXiv ranked by Jev, HN research posts                                                           | AI Research (decision 3)                                                       |
| AI Policy        | `ai-policy` / `policy`     | jurisdiction tables (official sources, watchlist), news feeds, deadlines            | none: HN policy stories repeat the feeds, and the 2026-10-20 revert of `src/policy/hn.ts` stands | Policy Watch                                                                   |
| Data Engineering | `ai-data` / `data`         | vendor feeds, Action required, the data repos, releases this week                   | HN data stories that name no tracked project                                                     | Data Engineering Watch                                                         |

Weekly, on Monday: **Trends** (`ai-trends` / `trends`). Its sections follow the topics: agents and coding tools (Radar, category tables, 🆕 and 🔥), models (OpenRouter token share, Hugging Face trending), research (papers of the week, if decision 3 picks weekly), most discussed (the week's top HN, Dev.to and Lobste.rs stories), Claude Code Skills, candidates to track (decision 2), and Signals. It replaces Trending and AI Models. GitHub caps an issue body at 64 KB. Trending (21 KB) plus AI Models (14 KB) fits, and the row caps keep it there.

Every day, the **Overview** (web UI and Telegram) shows each page's highlights under **Coming up**: the dated items of the next 30 days from every page (policy deadlines and `policy.calendar`, Action required dates in Data, stealth model expiries). Code renders it from state the run already keeps, without an LLM call.

Every daily page has the same anatomy:

```
# <Page> <date>
<report bar>
> counts | generated
## Highlights        LLM, 3–5 bullets
## <tracked part>    from config.yml; a quiet line when nothing changed
## Spotted           code table with LLM row summaries; left out when empty
## Coming up         this page's dated items; left out when empty
```

Signals moves to the weekly page, the one place where a trend claim has a week of data behind it. Worth a Look goes, since it re-listed rows in 47 of 47 cases. Data's Across platforms stays, because it compares rows instead of re-listing them.

## Where every current section goes

| Today                                             | New home                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| Agents: Coding Agents & Assistants, Agent Tooling | AI Agents, tracked                                                     |
| Agents: Stealth Models on OpenRouter              | AI Models & Labs, tracked; expiries in Coming up                       |
| Agents: promoted trending repos                   | Trends, candidates to track (decision 2)                               |
| Discussions: HN Tools & Engineering               | AI Agents, spotted                                                     |
| Discussions: HN Models & Research                 | AI Models & Labs or AI Research, spotted                               |
| Discussions: HN Industry News                     | AI Models & Labs, spotted (lab and model news); policy stories dropped |
| Discussions: HN Opinions & Debates                | Trends, most discussed; dropped on other days                          |
| Discussions: Dev.to and Lobste.rs (Mondays)       | Trends, most discussed                                                 |
| Lab Announcements                                 | AI Models & Labs, tracked                                              |
| AI Research                                       | AI Research, or Trends (decision 3)                                    |
| Policy Watch                                      | AI Policy, unchanged; its deadlines also feed Coming up                |
| Data Engineering Watch                            | Data Engineering, unchanged; Action required also feeds Coming up      |
| Trending: Radar and category tables               | Trends                                                                 |
| Trending: Claude Code Skills                      | Trends                                                                 |
| AI Models: Hugging Face, OpenRouter usage         | Trends, models                                                         |
| Every Signals section                             | Trends only                                                            |
| Every Worth a Look section                        | dropped                                                                |

## 2026-10-22 under the new structure

A sketch from that day's files and state.

- **Overview, Coming up.** 2026-11-09, feedback on the AI Act Articles 75c–75d implementing act closes. 2026-11-11, the Cloud and AI Development Act deadline. Both come from `policy-state.json`. The data state holds no open action, and OpenRouter listed no stealth model.
- **AI Agents.** Tracked: Claude Code, OpenAI Codex, Pi, Oh My Pi and Hermes Agent active; 7 agents and all 4 tooling projects quiet. Spotted: LayerFS, GitHub's agent-scale Git, Alter, Respan, Claude Duet, SlopCodeBench.
- **AI Models & Labs.** Tracked: 17 Anthropic and OpenAI posts, among them Enterprise Frontier Safeguards and the Frontier Red Team findings. Spotted: DeepInfer, Voxtral 3, OpenAI models on Google Cloud, Patch the Planet, "Publish fake stats, get cited in LLMs". DeepInfer was on the 10-21 HN page too, so rule 4 shows it on 10-21 only.
- **AI Research.** The 30 papers, or nothing if decision 3 picks weekly.
- **AI Policy.** The 3 published items. "DeepSeek banned from U.S. federal civilian agencies" (HN, 578 points) is not added: Policy Watch saw Politico's story on 10-20 and the DHS order in the Federal Register on 10-21, and Jev dropped both on the US impact gate.
- **Data Engineering.** As published: 12 vendor rows, DuckDB 2.0.0, the Polars `read_csv` regression.
- **Not shown.** "On AI writing", "The Lucrative World of Literary Scams" and "The AI-Hacking Apocalypse Began Last Night" (13 points) fit no topic.

## Decisions for the maintainer

Decided by the maintainer on 2026-10-22, each the recommended option.

1. **Hacker News, Dev.to and Lobste.rs** are routed into the topic pages' Spotted parts. There is no Discussions page. The other option was a Discussions page holding what no topic page claims.
2. **Trending repos** no longer join AI Agents. Trends lists candidates to track, with the `config.yml` lines to add. The other option was to keep following them automatically in a "Trending this week" block under Spotted.
3. **Research** is weekly: "Papers of the week" in Trends, the week's top 10 from the daily Jev scores, kept in a small state file. The other option was the daily page (13–30 papers, none on Sunday and Monday).
4. **The AI pages cover AI for practitioners**: models, labs, tools and research that change what you build with. This widens the 2026-10-05 focus on AI coding and agents. The other option kept that focus, with AI Models & Labs narrowed to coding models and research to agent and code papers.

With research weekly, the daily pages are AI Agents, AI Models & Labs, AI Policy and Data Engineering, and AI Research is a section of Trends.

## What changes besides the pages

- One id per page, used for the file, label, URL, feed and Telegram name. New ids replace `ai-hn`, `ai-web`, `ai-arxiv`, `ai-hf` and `ai-trending`, which move to the archive part of `REPORT_LABELS` and `REPORT_FILES` so old days keep their titles.
- Weekly plumbing: `WEEKLY_REPORT_IDS`, the close-stale retention groups and `WEEKLY_ISSUE_LABELS` in `src/core/github.ts`, manifest `weekly` and the sidebar's "This week", the `isWeeklyRun` gate in `src/index.ts`, and the promotion state in `trending-state.json`.
- Subscriptions: one RSS feed per page next to `feed.xml`, so a colleague can follow Data alone. `generate-manifest.ts` already loops over the pages. Teams keeps the Data page. The MCP server's default type (`ai-agents`) and type list follow the manifest.
- GitHub labels: the 12 stale labels sit on closed archive issues, and deleting a label strips it from them. They are listed for the maintainer, not deleted.
- Docs: README, AGENTS.md, and GLOSSARY.md, whose Daily Digest and Weekly Digest entries name the reports.

## Order of work

Riskiest first. Each step is one ticket in `issues/` and one commit on the `digest-structure` branch, and ends in a check. One PR opens when all six are done: a merged step goes live on the next cron, and steps 3 and 4 alone would publish a mixed set of pages.

1. **Routing and dedupe.** Give every open-source item a topic: a Jev Choice per HN, Lobste.rs and Dev.to item, cached by id like the trending verdicts, with a keyword fallback. Add a reported state for HN so a story is not repeated the next day. Check: run it over the last ten days' HN rows, print the share per topic and the leftovers, and read 30 routings by hand.
2. **Page anatomy.** Tracked, Spotted and Coming up on the daily pages; Signals and Worth a Look removed. Check: render 2026-10-22 from fixtures.
3. **Moves.** The stealth table and lab posts into AI Models & Labs, HN rows into Spotted, Discussions retired (decision 1), promotion replaced (decision 2).
4. **Weekly Trends.** Trending and AI Models merged, plus Dev.to, Lobste.rs and Signals. Check: a forced weekly run (`DIGEST_FORCE_WEEKLY=1`) stays under 64 KB.
5. **Coming up** on the Overview and in Telegram.
6. **Names, ids, labels, feeds and docs**, last.

## Not in this spec

- New sources, such as other labs' feeds or data-engineering trends on the weekly page.
- The internals of the policy and data pages, which already follow the rule.
