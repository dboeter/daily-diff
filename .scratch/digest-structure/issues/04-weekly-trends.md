# Weekly Trends page

Status: ready-for-agent
Blocked by: 01, 03

Spec: the weekly paragraph and the section map in `../spec.md`, decisions 2 and 3.

`ai-trends` (name "Trends", label `trends`, emoji 📈) replaces `ai-trending` and `ai-hf` on the weekly run, and research moves into it from the daily `ai-arxiv` page. `WEEKLY_REPORT_IDS` becomes `["ai-trends"]`.

## Layout

```
# Trends <date>
<report bar>
> Sources: … | Generated: …
## Highlights               prose call
## Agents & coding tools    the Radar and the category tables, as ### sections
## Claude Code Skills       the Skills call, as now
## Candidates to track      code only
## Models                   ### OpenRouter usage, ### Hugging Face trending
## Research                 papers of the week
## Most discussed           the week's top community stories
## Signals                  prose call, after the tables marker
```

- **Agents & coding tools.** `renderTrendingTables` output as it is, one heading level down: `### 🚀 Agent & Coding Tool Radar`, then a `###` per category.
- **Candidates to track** (decision 2). The GitHub rows marked 🔥 (in the category tables and the Radar's GitHub members) whose repo is in no `config.yml` section. Grouped by the section they would join: Coding Agents to `agents`; Harnesses, Multi-Agent and Agent Tooling to `infra`; Other Agents left out, as promotion did. Each with the lines to paste, in the format of `config.yml`'s entries (`id` from the repo name, `repo`, `name`). One line above the block says they trended two weeks in a row and are not tracked. The section is left out when there are none.
- **Models.** `buildModelsReport`'s call reworked to write only `### OpenRouter usage` and `### Hugging Face trending` (no Highlights, Signals or Worth a Look), at most 15 Hugging Face models. Newly listed OpenRouter models are on the daily Models page since ticket 03, so they leave this section, and `fetchOpenRouterData` stops fetching the catalog for them: `newModels` leaves `OpenRouterData`, and `NEW_MODEL_DAYS` goes (`selectNewModels` keeps its `days` parameter, without a default, for `fetchModelCatalogDaily`).
- **Research** (decision 3). The 10 papers with the highest Jev relevance first seen in the 7 days before the run, from `digests/research-state.json`. Table `| Paper | Summary |`, the paper linked.
- **Most discussed.** From `digests/spotted-log.json` (ticket 01): stories first seen in the 7 days before the run, the top 5 HN, 3 Lobste.rs and 3 Dev.to by comments, every topic included. Opinion pieces no daily page showed belong here. Spotted's table layout. `LoggedStory` gains the story's `description` (cut at 300 characters), written by `nextLog`, so these rows are summarized from more than their titles.
- **Summaries.** One call for the research and Most discussed rows, on the `summarized-table.ts` contract. A paper gets 2 sentences from its abstract: what it shows. A story follows Spotted's rules.
- **Highlights and Signals.** The trending prose call, reworked to read the whole rendered page. Signals is the one place for trend claims: patterns across the week's tables.
- **Call order.** First round in parallel: trending summaries, models, Skills, and the research and Most discussed summaries. Second round: the prose call over the page rendered from them, writing Highlights, the tables marker and Signals (`spliceTables` puts the page between them; Worth a Look goes).
- On the first Monday after the merge the research state and the log hold fewer than 7 days. Show the top of what is there.

## Research state

Every daily run, after the arXiv ranking, writes `digests/research-state.json`: the day's top 15 papers by relevance (`id`, `title`, `url`, `published`, `relevance`, the abstract cut at 600 characters, the CST date), entries older than 8 days pruned. A day ranked by recency (no key, or Jev down) adds no papers. `fetchArxiv` drops each paper's relevance today (`ranked.map((r) => r.paper)`, `src/sources/arxiv.ts`); `ArxivData` must carry it. `main()` saves the state after `assertLlmHealthy`, next to the Spotted log. The daily arXiv fetch and scoring stay, and `arxiv-ranking.json` is still written to the day folder. `ai-arxiv` is no longer built. `arxiv-state.json` was saved only after that report was built; the research-state step now saves it, so the cutoff still moves daily. A same-day re-run must give the same day's entries (replace that date's entries, do not append).

## Retire `ai-trending`, `ai-hf` and `ai-arxiv`

- Remove the builders, prompts and strings nothing else uses: `buildTrendingReport` becomes the Trends builder, `buildModelsReport` and `buildArxivReport` go, and with them `buildArxivPrompt`, `ARXIV_REPORT`, `MODELS_REPORT`, `buildListingReport` and `SECTIONS.worthALook` if unused.
- `REPORT_LABELS` archive part: "Agent & AI Coding Trends" (`ai-trending`), "AI Models" (`ai-hf`), "AI Research" (`ai-arxiv`). `REPORT_FILES` archive part likewise.
- `closeSupersededIssues`: `trending` and `hf` as legacy labels in the daily group, so the first daily run after the merge closes their last open issues; `arxiv` likewise. `trends` is the one weekly group.
- Grep outside `digests/` for the three ids and labels before editing (`index.html`, `mcp/src/index.ts`, `notify.ts`, `generate-manifest.ts`, `regen-highlights.ts`, `github.ts`, `WEEKLY_ISSUE_LABELS`).
- `LABEL_COLORS` gets `trends`.

## Check

- Tests: the page's `##` order from a stubbed LLM; Candidates (🔥 in config left out, the YAML lines, empty case); research state (top 15, prune, same-day replace, recency adds nothing); Most discussed selection.
- Size: GitHub caps an issue body at 64 KB. 2026-10-19 had Trending at 21.8 KB and AI Models at 14.0 KB. Build the page from the largest plausible inputs (full category tables, 12 Radar rows, 15 HF models, 10 papers, 11 stories, Skills) in a test and assert it stays under 60 KB.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.

## Docs

AGENTS.md: Architecture, the file table, Report outputs (`ai-trends.md`; the three retired files into the archive-only line), the Trending, ArXiv, Models and Dev.to/Lobste.rs bullets, Key conventions' weekly paragraph. README's report list. GLOSSARY.md if it names the weekly reports.

## Comments

- Most discussed skips stories a daily page showed, today's pages included, by id or link (spec rule 2).
