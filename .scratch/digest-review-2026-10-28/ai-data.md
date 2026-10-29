# Review: Data Engineering, edition 2026-10-28

Page: `digests/2026-10-28/ai-data.md`, `highlights.json` (`ai-data`). Traces: `data-trace.json`, `llm-trace.json`. State: `digests/data-state.json` (pre-run state = `HEAD`).

Totals: 0 high, 2 medium, 7 low.

The run used CI's LLM settings (OpenRouter `nvidia/nemotron-3-super-120b-a12b:free` with fallbacks), so the model-output findings (D2, D4, D5) are what CI would publish.

### D1 [medium] relevance

- Location: Azure / Fabric & GCP, row "On-premises data gateway October 2026 release"
- Problem: The summary lists installer accessibility, Power Query settings, service-start diagnostics and Power BI Desktop compatibility. It leaves out the post's one new capability: "Admin APIs for connections and gateways (Preview)", REST APIs that give Fabric admins and service principals tenant-wide visibility and control over every connection, with audit logging. That is the part a data engineer would act on, so the row reads like a routine maintenance release. Jev presumably judged the same cut text (I verified the `description`, not the Jev request): significance 0.44 at confidence 0.32, so the item counts as unknown and `minor`.
- Evidence: VERIFIED. The community page answers a JS challenge ("Just a moment..."), so I used the Fabric blog RSS body (`https://blog.fabric.microsoft.com/en-us/blog/feed/`), where "Admin APIs" starts about 1,600 characters in. I also replayed `fetchVendorFeeds` with tsx: the item's `description` is 1,001 characters, ends at "…Keyboard…", and does not contain "Admin".
- Likely cause: `src/core/rss.ts:69` (`VENDOR_DESCRIPTION_MAX_CHARS = 1000`, the default of `vendorText` at rss.ts:75). The cut feeds both the Jev judgment and the summaries prompt.

### D2 [medium] accuracy

- Location: Azure / Fabric & GCP, BigQuery row; Highlight 3 "…; the integration is released."; Across platforms "Databricks and BigQuery are GA"
- Problem: The BigQuery note says "This feature is generally available (GA)" in its second sentence. Neither the row's Item cell (the first sentence) nor its Summary says GA, so the page never shows the release stage on the row. The summaries prompt forbids status words on the assumption that the title carries them, but a BigQuery title does not. The prose call saw only the rendered rows. Highlight 3 then says "released", which is not the source's word. Across platforms says "BigQuery are GA", which matches the source but is not in anything the model was given, so ticket 03's rule ("release-stage words only when the item's own row or text uses them") holds by luck here. On 10-27 the BigQuery summaries from the same source carried "(GA)" and "(Preview)", so the same source rendered two ways on two days.
- Evidence: VERIFIED. I fetched `https://cloud.google.com/feeds/bigquery-release-notes.xml` (entry 2026-10-27: "…This feature is generally available (GA).") and the HTML page `https://docs.cloud.google.com/bigquery/docs/release-notes#October_27_2026`. In the tsx replay the description is 209 characters and contains the GA sentence. For the 10-27 rows: `git show origin/main:digests/2026-10-27/ai-data.md`.
- Likely cause: `src/data/bigquery.ts:33` (title = `<type>: <first sentence>`), `src/reports/prompts-pages.ts:315` ("Do not repeat the title or its status words … the title is shown next to the summary"), and `src/reports/pages.ts:774-783` (the prose call gets `sectionsMd`, the rendered rows, not the descriptions).

### D3 [low] consistency

- Location: Azure / Fabric & GCP, BigQuery row Item cell "Feature: The Data Engineering Agent now integrates with Google Drive, letting you provide …"
- Problem: The Item cell holds the whole first sentence, with a "Feature:" type prefix. The Summary restates it ("The Data Engineering Agent accepts Google Sheets, CSV, or JSONL files from Google Drive as pipeline inputs."), so two cells carry one sentence. The only thing the text adds beyond the title is the GA status, and D2's rule forbids it. 10-27 rendered BigQuery the same way, so this is consistent across days. Ticket 17 removed Snowflake's date prefix and left this one.
- Evidence: VERIFIED (page line 42; 10-27 page on origin/main, BigQuery rows)
- Likely cause: `src/data/bigquery.ts:33`. `vendorTitleLabel` (`src/reports/markdown.ts:574`) strips only date prefixes.

### D4 [low] relevance

- Location: Across platforms, "AI agent connectivity advanced on three platforms: … BigQuery's Data Engineering Agent added Google Drive file input …"
- Problem: Databricks (external agents reach Databricks MCP servers through default OAuth apps) and Fabric FNTK (external coding agents drive Fabric notebooks) are the same capability. BigQuery's change is a new input source for Google's own agent, not agent connectivity, so the third platform stretches the comparison. Smaller points: "Fabric remains in preview" suggests FNTK was in preview before (the post launches it in Preview), and the Databricks list drops Claude Code. The Databricks and Fabric pair alone meets the prompt's "two or more platforms".
- Evidence: VERIFIED (Databricks October release notes, `#default-oauth-apps-for-external-ai-agents-are-now-generally-available`; FNTK and BigQuery texts as in D2 and the Fabric RSS)
- Likely cause: model judgment under `buildDataProsePrompt` (`src/reports/prompts-pages.ts:340`); not traced further

### D5 [low] relevance

- Location: Highlights, all three bullets
- Problem: Each bullet repeats its row's summary and adds a status word. None says what the change means for a client platform, which is the prose call's stated job ("Highlights say what a change means for clients (the tables already say what changed)", the `buildDataProsePrompt` docstring). Ticket 04's "pick, don't restate" holds for selection (at most 3, no `minor` row, ranked) but not for content. This pulls against ticket 03, which removed the "what to do" requirement because it led the model to invent actions. The maintainer should decide which way this goes.
- Evidence: VERIFIED (page lines 10-12 against rows at lines 20, 32, 42)
- Likely cause: `src/reports/prompts-pages.ts:324-361` (the prose prompt); not traced further

### D6 [low] correctness

- Location: run log, `[data] 5 notes ship a reported coming-soon note, skipped`
- Problem: `shippedComingSoon` runs over the whole fetched feed (1,394 Databricks items), not over today's candidates. A replay with the pre-run state gives the 5 notes: Lakeflow Performance Observability GA (10-26, already reported 10-27), Genie file upload GA (10-16), Databricks Apps package repositories GA (10-14), Feature Views GA (10-12), and "AI Runtime is now in Public Preview" (2026-03-19). Four are past the 7-day limit and one was already reported, so none of today's items was skipped, and the log overstates what the filter did. The AI Runtime match also shows the stem rule pairing a March preview note with the 10-13 note "AI runtime will soon be available by default for workspaces with the compliance security profile enabled". Those notes announce default enablement for compliance-profile workspaces, not GA, and Databricks publishes both kinds of note (Genie Code tasks 10-21, Lakeflow 10-26). Every pair seen so far came out on the same day, which the filter leaves alone, but a GA note published a day after its compliance-profile note would be skipped. Skipped notes never reach `data-trace.json`. The docstring ("it pairs only the Databricks Apps package repositories, Genie file upload and feature views notes") is out of date.
- Evidence: VERIFIED (tsx replay of `fetchVendorFeeds` + `shippedComingSoon` against `git show HEAD:digests/data-state.json`; the `reported` keys in `digests/data-state.json`)
- Likely cause: `src/data/vendors.ts:169-199` (stem match, whole feed), `:241-243` (log count)

### D7 [low] correctness

- Location: `data-trace.json`, `rank` of the Fabric rows
- Problem: The trace gives Teradata rank 7 and FNTK rank 8, but the table shows FNTK (2026-10-26) above Teradata (2026-10-21) because rows sort newest first. AGENTS.md says `rank` is the row number. For vendor rows it is the summaries number (section, then relevance), not the position on the page.
- Evidence: VERIFIED (`data-trace.json` items; page lines 44-45)
- Likely cause: the rank is set at selection (`src/data/relevance.ts`), and `renderVendorTables` (`src/reports/markdown.ts`, about line 615) re-sorts the rows. Not traced line by line.

### D8 [low] consistency

- Location: Snowflake row "Continuous and bulk file loading with CoCo (General availability)"
- Problem: The row has no 🤖, although CoCo (Snowflake's AI assistant) builds the load from a description of the files. The 10-24 CoCo row ("Skill and plugin sharing in CoCo") carried 🤖. This is Jev's call: `ai_in_data` 0.37 is under `AI_IN_DATA_MIN` 0.5. Pinning the verdict in `digests/data-verdicts.json` would fix this item.
- Evidence: VERIFIED (`data-trace.json`; `git show origin/main:digests/2026-10-24/ai-data.md` line 39)
- Likely cause: Jev verdict; threshold at `src/data/relevance.ts:246`

### D9 [low] consistency

- Location: `## Highlights`, line 9-10
- Problem: There is no blank line between `## Highlights` and the first bullet, while every other heading on the page has one. Ticket 17 already noted this as left over (X6 (4)), so it is not a regression.
- Evidence: VERIFIED (page lines 9-10)
- Likely cause: not traced (`splitProse`, `src/reports/pages.ts:605`, or the model's output)

## Checked and fine

- **Rows against their sources, with status words:**
  - Default OAuth apps: GA is in the title and the body. The five clients, Genie One MCP server and "an account admin doesn't need to create an OAuth app" match the source.
  - AI Functions UC permissions: GA is in the title and body. `system.ai`, metastore admins and "contact your Databricks account team" match.
  - Editing files in UC volumes: GA is in the title. Catalog Explorer, notebook and SQL-editor schema browser match.
  - Snowflake CoCo: GA is in the title, and the body says "now generally available in CoCo CLI, CoCo Desktop, and CoCo in Snowsight". Snowpipe, `COPY INTO` and Snowflake-managed Iceberg match.
  - BigQuery: Drive and Sheets/CSV/JSONL match. The source states GA (see D2).
  - Fabric gateway: 3000.338 and Power Query Engine 2.159.229 match (see D1 for the omission).
  - FNTK: "(Preview)" is in the title. Claude Code, GitHub Copilot CLI, Codex and the cell-level loop match.
  - Teradata: "(Preview)" is in the title. T-SQL conversion and "does not move the associated data" match.
  - Highlights 1 and 2: their "generally available" is sourced.
- **Backticked tokens** (`system.ai`, `COPY INTO`) are in their sources (ticket 06).
- **Meta line**: 8 vendor items (3+1+4), 17 projects (5+3+9), 0 active, 0 stable, 0 prerelease all match the body, and `Generated:` comes last.
- **Layout**: Highlights, Databricks, Snowflake, Azure / Fabric & GCP, the "Nothing new from Open-source stack (…)" line with quiet repos linked, then Across platforms. There is no Action required, Releases this week, Spotted or EU data law section, and each absence is correct (see below).
- **Item and Source cells**:
  - The Snowflake date prefix is stripped.
  - The single-source Databricks and Snowflake tables have no Source column.
  - The cloud table sorts newest first.
  - 🤖 follows `ai_in_data` ≥ 0.5 on every row.
  - Same conventions as 10-27 apart from ticket 17's planned changes.
- **Repeats**: no row appears on the 10-22 to 10-27 data pages on origin/main (grep of every title keyword). FNTK and Teradata were judged on 10-22 and dropped until now. Ticket 12's relevance rule now keeps them (0.584 and 0.592, significance unknown), so they show once, as `minor`. Teradata (10-21) is at the 7-day age limit, not over it.
- **Releases**: nothing in the 24 h window. Every stable release of the 17 repos in the last 7 days is already a `release:` key in `data-state.json`:
  - dagster 1.13.27 and snowflake-connector-python v4.8.1: 10-27
  - polars py-2.1.0: 10-26
  - dbt-databricks v1.12.8: 10-25
  - databricks/cli v1.22.0 and v1.22.1, snowpark-python v1.55.3, sqlmesh v0.236.4, duckdb v2.0.0, mlflow v3.17.2: 10-23

  `gh api repos/<r>/releases` was checked for all 17 repos. dlt, airflow, iceberg, trino, dbt, delta, unitycatalog and polaris had no release in the window. "Stable releases: 0" and no Releases this week are correct.

- **Bundle 2026_08**: the stage string ("Introduced in the 10.37 release … Disabled by Default") equals the state's `stages` entry, so the bundle is not new: `judged: 0`, reported 10-19. Its plans have no dated window ("in a subsequent release"), so it has no `endDate`. `actions` is `{}` before and after the run, so no deprecation date lies ahead, and no Action required section is correct. CoCo's `end_date` answer is `none`.
- **The 4 drops fit the reader**:
  - GPT-6.1 Terra on Unity Gateway: significance 0.08 at 0.9, the legend's own "new model on a model gateway" example.
  - Genie processed in South Korea: a region rollout, 0.39.
  - Real-Time Dashboards design and KPI GA: dashboard authoring, relevance 0.466 under the 0.5 bar.
  - "Data Visualization in the Agentic Era": an essay, real_change 0.36.

  The cloud section had kept items, so the near-cut rule did not apply.

- **Azure updates**: 44 fetched, judged 0 is right. The newest item is 10-22, and both in-window items were reported on 10-22 and 10-23.
- **`minor`**: gateway (confidence 0.32), Teradata (0.23) and FNTK (0.30) are all `minor`, and none is in Highlights. The `dropNoHighlightRows` check had nothing to drop.
- **`highlights.json`**: 2 entries. The first covers the page's lead bullet; neither is signed. Entry 1 drops the page bullet's five-client list (ChatGPT, Codex, Claude, Claude Code, Cursor) and keeps the source heading's own phrase, "external AI agents". Both forms are sourced.
- **`llm-trace.json`**: `data-vendor-summaries`, `data-highlights` and `highlights` all `ok`.
- **Spotted**: no story was routed to the data topic. Every `other` story has data probability ≤ 0.05.
- **EU data law**: no data-law item is on today's policy page, so there is no section.
- **Footer**: the missing "auto-generated" footer is a local-run effect. `autoGenFooter` (`src/core/llm.ts:408`) returns "" without `DIGEST_REPO`.
- **BigQuery source lag**: the HTML release notes list two more Oct 27 GA features, conversational analytics in Connected Sheets and `AI.COUNT_TOKENS`. The Atom feed, fetched 13 minutes after the run, has only the Drive note. The ids are per note, so they will come in as new items once the feed carries them.
- **Prior tickets**:
  - 01 holds: the `sources` header has fetched and judged per feed, each item has `rendered`/`rank`/`dropped_reason`, and `llm-trace.json` outcomes are present. See D6 for skipped notes and D7 for rank.
  - 03 holds: no invented status, no calls to action. One caveat is in D2.
  - 04 holds structurally: at most 3 bullets, no `minor` row, the lead is in `highlights.json`. See D5 for content.
  - 06 holds: identifiers are verbatim, no "It matters because". See D1 for one omission caused upstream.
  - 12 holds: FNTK is kept at 0.584 with unknown significance and is `minor`, and Teradata is kept at 0.592.
  - 17 holds: no date prefix, no Source column on single-source sections, newest first, empty sections collapsed into one line, 🤖 documented. D3 and D10 are leftovers.

## Not checked

- The Fabric community pages themselves: they answer a JS challenge. I used the RSS bodies, which are the pipeline's own input.
- The Azure updates item texts, since none was a candidate today.
- Hot issues of the 17 data repos: "Active today: 0" was not checked against the hot-issue candidates. The run's hot-issue logic is shared with the agents page.
- Whether the HTML-only BigQuery Oct 27 notes ever reach the feed (they would show on a later edition).
- `.scratch/data-watch/spec.md`, the audience spec: I judged relevance against AGENTS.md's audience line (data engineers at Digital Power, mainly Azure) and did not read the spec.
