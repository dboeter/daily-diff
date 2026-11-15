# Overstatement cases: published sentence vs model input

Sources: review verdicts in `~/daily-diff-review/reviews/<date>/verify.md` (CONFIRMED only; 11-04 from the flat file), ticket `.scratch/digest-review-2026-11-10/issues/05-highlights-overstate.md`. Published text from `digests/<date>/ai-*.md`; inputs from `candidates.json` (cut to 1500 chars in the file; excerpts below are cut further), `data-trace.json` `text`, or refetched with `gh api` (marked "refetched"). All digest folders matched the review date.

Layers: (a) Highlight/Across/highlights.json overstates a faithful row; (b) the row or repo bullet already overstates its input; (c) input is a bare unverified claim repeated without attribution; (d) other.

---

## 2026-11-04

### 2026-11-04-data-1 (ticket: dbt "must update")

1. Page `ai-data`, section Highlights
2. Published: "- dbt Core v2.0.11 renames `--run-cache-mode` to `--state-mode` (deprecated alias kept) — dbt Core users must update scripts and CI pipelines using the old flag."
3. Input (refetched, `gh api repos/dbt-labs/dbt/releases/tags/v2.0.11`): "- Rename the --run-cache-mode CLI flag to --state-mode to match the dbt State terminology it configures. --run-cache-mode is kept as a deprecated alias and will keep working, with a warning, until it is removed in a future release."
4. Row restated (dbt repo section): "- **Release:** v2.0.11 renames `--run-cache-mode` to `--state-mode` (with deprecated alias), adds BigQuery query reservation config, …"
5. Layer (a): the bullet keeps "(with deprecated alias)"; the Highlight adds "users must update", which the release's "will keep working, with a warning" contradicts. The Highlight even keeps "(deprecated alias kept)" in the same sentence.
6. Backing: 1 row (one GitHub release). Not community or issue.

### 2026-11-04-data-2 (ticket: "(GA Nov 1)")

1. Page `ai-data`, section Across platforms
2. Published: "- AI cost governance: Databricks Unity Gateway budgets now include AI Functions (`ai_parse_document`, `ai_extract`, `ai_classify`) spend (GA Nov 1); Snowflake Cortex AI Gateway GA provides request tracing and spend attribution per user — both platforms now meter AI SQL functions."
3. Input (`data-trace.json`, "AI Functions usage is now included in Unity Gateway budgets", `text`): "Beginning November 1, 2026, Unity Gateway budgets include spend from task-specific AI Functions such as ai_parse_document, ai_extract, and ai_classify across batch and real-time execution paths. See Manage budgets for Unity Gateway."
4. Row restated (Databricks table): "Unity Gateway budgets now track spend from AI Functions including `ai_parse_document`, `ai_extract`, and `ai_classify` across batch and real-time execution paths starting November 1, 2026."
5. Layer (a): the row says "starting November 1, 2026"; Across platforms turns the start date into a stage word, "GA Nov 1", which neither row nor note uses.
6. Backing: 2 rows (one vendor note each platform); the GA word has no backing. Vendor notes, not community.

### 2026-11-04-data-3 (ticket: "both platforms now meter AI SQL functions")

1. Page `ai-data`, section Across platforms
2. Published: same bullet as 2026-11-04-data-2, clause "— both platforms now meter AI SQL functions."
3. Input (`data-trace.json`, "Nov 3, 2026: Cortex AI Gateway inference, observability, and cost management (General availability)", `text`): "Inference, observability, and cost management for Cortex AI Gateway are now generally available. The gateway gives AI clients in your organization one governed endpoint to reach models, records a trace of every request, and attributes spend to the users who made it."
4. Row restated (Snowflake table): "Cortex AI Gateway provides a single governed endpoint for AI model inference with full request tracing and spend attribution to users."
5. Layer (a): the Snowflake row is faithful ("governed endpoint for AI model inference"); the Across line generalises both to "AI SQL functions", which only the Databricks note concerns.
6. Backing: 2 rows, of which only 1 (Databricks) supports "AI SQL functions". Vendor notes.

### 2026-11-04-data-5 (ticket: "multi-workspace lineage")

1. Page `ai-data`, section Across platforms
2. Published: "- Cross-cloud catalog mirroring: Fabric mirrors Unity Catalog materialized views and streaming tables read-only via shortcuts; Databricks Lakeflow Jobs now trigger across workspaces sharing a metastore — both enable multi-workspace lineage without data movement."
3. Input (`data-trace.json`, "Trigger Lakeflow Jobs when upstream jobs complete (Beta)", `text`): "You can now run a Lakeflow Job when one or more upstream jobs complete, including across workspaces attached to the same Unity Catalog metastore. Configure dependencies on the downstream job."
4. Row restated (Databricks table): "Lakeflow Jobs can now be triggered when upstream jobs complete, including across workspaces sharing the same Unity Catalog metastore, by configuring dependencies on the downstream job."
5. Layer (a): the row is faithful (job triggering); Across files it under "catalog mirroring" and adds "multi-workspace lineage without data movement", which no note mentions. It also drops the note's "(Beta)".
6. Backing: 2 rows (Fabric post, Databricks note); neither mentions lineage. Vendor sources.

---

## 2026-11-07

### 2026-11-07-agents-2 (ticket: email address "resulting in spam")

1. Page `ai-agents`, section Highlights
2. Published: "- A report shows Claude Code sends the user's email address in the User-Agent header during web searches without consent, resulting in spam."
3. Input (`candidates.json`, story "Claude Code sends your email address to websites", text of GitHub issue anthropics/claude-code#107757): "Bug Description I receive dozens of scam emails per day because claude code divulged my email to arbitrary 3rd parties in the User-Agent request header while conducting web searches without my perm"
4. Row restated (Claude Code News bullet): "- **News:** [Claude Code sends your email address to websites](https://news.ycombinator.com/item?id=50385272) reports the User-Agent header includes the user's email during web searches without consent, causing spam."
5. Layer (a): the input is one user's allegation; the bullet keeps "reports", the Highlight changes it to "A report shows … resulting in spam", stating the cause as fact. (The bullet's "causing spam" is already unhedged.)
6. Backing: 1 row, a single community story (HN link to one GitHub issue). The story was also shown on an earlier day (status shown-earlier).

### 2026-11-07-agents-3

1. Page `ai-agents`, section Highlights
2. Published: "- OpenAI Codex users report all local projects vanish from the Projects list after switching from an enterprise back to a personal account on Windows, though folders and chats remain visible but ungrouped."
3. Input (refetched, `gh api repos/openai/codex/issues/59895`): "Individual chats remain visible, but are no longer grouped under their projects. The local project folders still exist."
4. Row restated (Codex hot issue bullet): "- **Hot issue:** [#59895](https://github.com/openai/codex/issues/59895): users report all local projects disappear from the Projects list after switching from enterprise back to personal account on Windows, though folders exist and chats remain visible but ungrouped."
5. Layer (a): the bullet says "folders exist and chats remain visible"; the Highlight merges them into "folders and chats remain visible", which the issue denies for folders. (Both lines also drop the issue's app update as a possible cause: an omission, see Borderline.)
6. Backing: 1 row, a single open GitHub issue.

### 2026-11-07-data-2

1. Page `ai-data`, section Across platforms
2. Published: "- Apache Iceberg interoperability advanced on three platforms: … Databricks Lakeflow Pipeline Tables are readable as Iceberg tables from Snowflake per the Iceberg project."
3. Input (`candidates.json`, community post, source "Snowflake on Medium"): "Streaming tables and materialized views, read in place as Iceberg: the settings that matter, what the logs show, and the Snowflake errors I hit Most guides to reading Databricks from Snowflake start with a plain Delta table. Mine are different: … I got Snowflake to read all 13 of them in place, as Apache Iceberg, with no copy" … "In short: Lakeflow tables need one opt-in (pipelines.externalMetadata.enabled) to be readable from Snowflake;"
4. Row restated (Apache Iceberg News bullet): "- **News:** [Query Databricks Lakeflow Pipeline Tables from Snowflake, Without Copying Data](https://medium.com/snowflake/…) demonstrates reading Databricks Lakeflow streaming tables and materialized views directly as Iceberg tables from Snowflake, showing cross-platform Iceberg interoperability."
5. Layer (a): the bullet attributes a demonstration to the linked post; Across platforms turns one author's experiment into a platform capability "per the Iceberg project" and counts it as one of "three platforms" advancing. Both drop the opt-in setting.
6. Backing: 1 row for this clause, a single community blog post (Medium), not HN/Lobsters/Dev.to.

### 2026-11-07-models-1

1. Page `ai-models`, section Spotted row summary
2. Published: "The paper introduces Memorilla, a latent semantic memory system that lets frozen LLMs access accumulated knowledge like past conversations and documents by placing relevant information in the context window."
3. Input (`candidates.json`, HN story "Memorilla: Latent Semantic Memory for LLMs"): "Memory enables large language models (LLMs) to use information beyond their parameters, such as past user conversations, long documents, or an agent's earlier actions. For a frozen LLM, access to this accumulated knowledge is limited to what a memory system places in its context window. However, gat"
4. n/a (row summary)
5. Layer (b): the input names "places in its context window" as the limitation of existing systems and stops before Memorilla's mechanism; the summary states that limitation as Memorilla's method. Not settled against the full abstract (review could not fetch arXiv).
6. Backing: 1 row, a single community story (HN).

### 2026-11-07-policy-1 (ticket: TikTok "first time")

1. Page `ai-policy`, section Highlights (prose)
2. Published: "The European Commission preliminarily found TikTok’s recommender system in breach of the Digital Services Act for creating harmful “rabbit holes,” marking the first time the Commission has targeted a platform’s algorithmic recommendations as a DSA violation."
3. Input (`candidates.json`, Politico Europe "EU accuses TikTok of designing algorithm that creates 'rabbit holes'"): "The preliminary findings mark the first time the Commission has focused on a social media platform's recommender systems as a breach of its powerful Digital Services Act."
4. Row restated (News & commentary): "Politico Europe reported that the EU's preliminary findings mark the first time the Commission has focused on a social media platform's recommender systems as a breach of the Digital Services Act." The Commission's own row says nothing about a first.
5. Layer (a): the row keeps "Politico Europe reported that"; the Highlight states the "first time" in the digest's voice. The claim is also wrong (the review cites the Commission's 6 Feb 2026 TikTok finding).
6. Backing: 2 rows on the event, but only 1 (one news outlet, Politico) backs "first time". Not community.

### 2026-11-07-policy-2

1. Page `ai-policy`, section Highlights (prose)
2. Published: "…signalling a national push for “open strategic autonomy” while acknowledging persistent US and Chinese influence."
3. Input (`candidates.json`, Binnenlands Bestuur "Kabinet wil eigen AI-koers, maar de VS en China zijn nooit ver weg"): "Het kabinet-Jetten presenteert vrijdag een visie op AI. Die visie luidt dat Nederland zich weliswaar inzet om open strategische autonomie te bereiken, maar dat er tegelijkertijd via 'gerichte AI-diplomatie' wordt ingezet om de Nederlandse toegang tot ge[avanceerde AI-capaciteiten veilig te stellen]"
4. Row restated (News & commentary): "The Dutch cabinet presented an AI vision aiming for open strategic autonomy while using targeted AI diplomacy to secure access to advanced AI capabilities."
5. Layer (a): the row is faithful; the Highlight credits the cabinet with "acknowledging persistent US and Chinese influence", a framing found only in the newspaper's headline ("maar de VS en China zijn nooit ver weg").
6. Backing: 1 row, a single news outlet (headline framing). Not community.

---

## 2026-11-08

### 2026-11-08-models-1 (ticket: Anthropic government ID)

1. Page `ai-models`, section Highlights
2. Published: "- Anthropic now requires a government ID to create an account."
3. Input (`candidates.json`, HN story "Tell HN: You now need a government id in order to create an Anthropic account", https://news.ycombinator.com/item?id=50356209): text empty (title only).
4. Row restated (Spotted): "| [Tell HN: You now need a government id in order to create an Anthropic account](https://news.ycombinator.com/item?id=50356209) | Hacker News | [16 points, 4 comments](…) | — |"
5. Layer (c): the input is a bare, title-only user claim ("Tell HN: You now need …"); the row correctly shows `—`, and the Highlight restates the title as Anthropic policy with no attribution. (The thread contains a contradicting comment, per the review.)
6. Backing: 1 row, a single community story (HN, title only). Also in highlights.json: "Anthropic now requires a government ID to create an account".

### 2026-11-08-models-6

1. Page `ai-models`, section Spotted row summary
2. Published: "The article covers open-weight LLM architectures including MoE, hybrid layers, and ternary weights, written by a PhD in Electrical Engineering from UFMG."
3. Input (`candidates.json`, HN story "The architecture of open-weight LLMs: MoE, hybrid layers, ternary weights"): "Data Scientist especialista em Knowledge Graphs, LLMs e AI Systems. PhD in Electrical Engineering (UFMG). Portfólio de projetos em Machine Learning, NLP, Time Series e Graph Algorithms."
4. n/a (row summary)
5. Layer (b): the input is the site's portfolio tagline; the summary turns it into an authorship claim about the article ("written by a PhD in Electrical Engineering from UFMG"). The rest restates the title.
6. Backing: 1 row, a single community story (HN).

### 2026-11-08-agents-5

1. Page `ai-agents`, section Spotted row summary
2. Published: "Analysis of 663 Hacker News comments reveals AI coding agent setups from 424 developers categorized into seven patterns."
3. Input (`candidates.json`, HN story "AI coding agent setups from 663 Hacker News comments"): "On November 4, 2026, an Ask HN thread asked developers for their current AI agent setup, and 663 comments came back. We read every one, counted the tools 424 people say they use, and turned the most detailed setups into seven patt"
4. n/a (row summary)
5. Layer (b): the input categorises only "the most detailed setups" and counts tools for 424 people; the summary says the setups "from 424 developers" were "categorized into seven patterns", dropping the qualifier.
6. Backing: 1 row, a single community story (HN).

### 2026-11-08-agents-6 (ticket: #108122 "Claude Code regression")

1. Page `ai-agents`, section Highlights
2. Published: "- Claude Code regression (Desktop 4.23118.0 on macOS): users report MCP Apps from local stdio servers no longer render in Chat — the tool executes and returns text but Desktop never requests the `ui://` resource, so no widget panel appears"
3. Input (`candidates.json`, hot issue anthropics/claude-code#108122): "## Summary Since Claude Desktop auto-updated from **4.16336.0** to **4.23118.0** (2026-11-05), MCP Apps widgets from **local stdio servers** (`claude_desktop_config.json`) no longer render in Chat. The tool is called and its text result appears, but Desktop never requests the widget page with `resources/read`, so no panel appears."
4. Row restated (line 18, under the Claude Code heading): "### Claude Code- **Hot issue:** #108122: users report that MCP Apps from local stdio servers no longer render in Chat on macOS Desktop 4.23118.0; the tool executes and returns text but Desktop never requests the `ui://` resource, so no widget panel appears". The linked bullet on line 33 also names Desktop and carries the code-appended "(regression; …)" label.
5. Layer (a): both bullets name Desktop; the Highlight adds "Claude Code regression" for a bug the issue scopes to "Claude Desktop … in Chat". The likely cause is placement: the issue is filed in the `anthropics/claude-code` repo, so code lists it under the Claude Code heading and appends the issue's "regression" label, and the Highlight joins the two.
6. Backing: 1 row, a single open GitHub issue (also listed a second time under a malformed "### Claude Code- **Hot issue:**" heading on line 18).

### 2026-11-08-agents-11

1. Page `ai-agents`, section Oh My Pi repo Release bullet (also restated in Highlights, line 11)
2. Published (Release bullet): "…fixes include preserving tool-batch order for file mutations, correcting Pro Max account routing, capping Cursor's 24h `hard_timeout` at the bash tool's 3600s ceiling, treating 429/402 context-overflow errors as rate limits, …"
3. Input (`candidates.json`, release Oh My Pi v18.18.1): "- Cursor exec frames keep tool-batch order: a file mutation (native StrReplace and Write, …) waits for the calls issued before it …" / "ChatGPT Pro Max (`promax`) counts as Pro for Codex account routing, so a blocked Pro account no longer wins over an open or pinned Pro Max account" / "A 429 or 402 worded like a context overflow (Bedrock's "429 Too many tokens, please wait…") is treated as a rate limit, so it retries and walks the fallback chain instead of compacti[ng]"
4. Highlight line 11 restates the bullet almost verbatim ("…the release also preserves tool-batch order for file mutations, corrects Pro Max account routing, … treats 429/402 context-overflow errors as rate limits…"), so it adds nothing new.
5. Layer (b): the release scopes the fixes ("Cursor exec frames", "for Codex account routing") and describes rate-limit errors "worded like a context overflow"; the bullet drops the scopes and calls them "context-overflow errors", inverting the meaning.
6. Backing: 1 row, a single GitHub release.

---

## 2026-11-09

### 2026-11-09-agents-2 (ticket comment: Oh My Pi, two fixes merged)

1. Page `ai-agents`, section Oh My Pi repo Release bullet
2. Published: "…remote OpenAI compaction preparation and generic `/chat/completions` compaction retain correct model attribution; …"
3. Input (refetched, `gh api repos/can1357/oh-my-pi/releases/tags/v18.18.2`; also in `candidates.json`): "- Fixed compaction preparation for remote OpenAI compaction that the active model cannot replay, ensuring the content is expanded and remains available for compaction. - Fixed generic remote compaction requests to `/chat/completions` so gateway sessions retain the correct per-request model attribution."
4. n/a (repo bullet)
5. Layer (b): two separate fixes are merged into one clause, so "retain correct model attribution" is also credited to the OpenAI compaction fix, which is about expanding content "the active model cannot replay".
6. Backing: 1 row, a single GitHub release.

### 2026-11-09-agents-3 (ticket comment: changed default written as a new feature)

1. Page `ai-agents`, section Oh My Pi Release bullet and Highlights
2. Published (Highlight): "New features include `balanced` delegation bias, `ask` forms supporting images and free-text options, and `ui.formDialog(html, options)` extension." Release bullet: "features — `balanced` delegation bias added; …"
3. Input (refetched, `gh api repos/can1357/oh-my-pi/releases/tags/v18.18.3`): "### Changed - Added a `balanced` delegation bias between `eager` and `restrained`; models without a `delegation-bias` rule now resolve to it instead of `eager`"
4. Row restated (Release bullet): "features — `balanced` delegation bias added; Tern right-click `ask` answer adds Note annotation; …"
5. Layer (b): the release files it under "### Changed" and says models "now resolve to it instead of `eager`" (a default change); the bullet calls it an added feature, and the Highlight repeats that.
6. Backing: 1 row, a single GitHub release.

### 2026-11-09-agents-4

1. Page `ai-agents`, section Oh My Pi Release bullet
2. Published: "`ask` forms support images (URL, data URI, local file, Mermaid) and "Other" free-text options"
3. Input (refetched, v18.18.3, the full notes; "mermaid" appears nowhere in them): "`ask` forms can show pictures: `<img src>` from an http(s) URL, a `data:` URI or a local file (relative to the session's working directory), and inline `<svg>` diagrams, drawn in the terminal form and natively in Tern"
4. n/a (repo bullet)
5. Layer (b): the release says "inline `<svg>` diagrams"; the bullet substitutes "Mermaid", which the full release never names (checked against the refetched body, so not a truncation artifact).
6. Backing: 1 row, a single GitHub release.

### 2026-11-09-agents-8

1. Page `ai-agents`, section Highlights
2. Published: "- Goldman Sachs is pulling Claude Code from its bankers and traders."
3. Input (`candidates.json`, HN story "Goldman Sachs is pulling Claude Code from its bankers and traders", https://www.thestateofai.com/news/goldman-sachs-claude-code-traders-bankers): text empty (title only).
4. Row restated (Claude Code News bullet): "- **News:** [Goldman Sachs is pulling Claude Code from its bankers and traders](https://news.ycombinator.com/item?id=50415628)"
5. Layer (c): the input is a bare headline from a little-known site; the bullet is the bare title, and the Highlight states it as fact with no source named.
6. Backing: 1 row, a single community story (HN, title only). Also in highlights.json: "Goldman Sachs pulls Claude Code from bankers and traders."

### 2026-11-09-models-1 (ticket comment: GLM-5.5 "upcoming")

1. Page `ai-models`, section Spotted row summary
2. Published: "Z.ai's chief scientist Jie Tang revealed that GLM-5.5 (in 32B, 122B, and 256B sizes) was pretrained on 1 trillion web pages drawn from six internal engines rather than public datasets."
3. Input (`candidates.json`, HN story "Z.ai says GLM 5.5 built on 1T web pages", a third-party tweet): "chief scientist Jie Tang just revealed the training pipeline behind the upcoming GLM-5.5 (32B, 122B, and 256B) during a lecture at Tsinghua University today. Instead of relying on public datasets, their pretraining pipeline pulls from six separate internal engines: - Web:"
4. n/a (row summary)
5. Layer (b): the input says "the upcoming GLM-5.5" and lists "Web" as one of six engines; the summary writes "was pretrained" and "1 trillion web pages drawn from six internal engines" (the figure is only in the title).
6. Backing: 1 row, a single community story (HN linking a third-party tweet).

### 2026-11-09-models-5

1. Page `ai-models`, section Spotted row summary
2. Published: "OpenAI secured an $11 billion raise at a $1.25 trillion valuation, though the piece notes the terms fell short of what the company wanted and highlight a growing gap between its growth narrative and investor appetite."
3. Input (`candidates.json`, HN story "OpenAI raises $11B at a $1.25T valuation", 247wallst.com): "OpenAI got its money, but not on the terms it wanted, and the gap between its growth story and investor appetite is landing on two giants. One faces a bookkeeping hit, the other a deeper dependency on the funding flow."
4. n/a (row summary)
5. Layer (b): the input says "the gap … is landing on two giants"; the summary adds "growing" and drops the two-giants point.
6. Backing: 1 row, a single community story (HN).

### 2026-11-09-policy-1 (ticket comment: AI Act attribution)

1. Page `ai-policy`, section Highlights (prose)
2. Published: "Politico Europe reports that sixteen EU countries have not yet appointed AI safety captains and many missed an important deadline on data centers, signalling uneven national implementation of the AI Act."
3. Input (`candidates.json`, Politico Europe "EU countries still can't get it together on AI", full text): "Sixteen countries haven't yet appointed AI safety captains, and many missed an important deadline on data centers."
4. Row restated (News & commentary): "Sixteen EU countries have not yet appointed AI safety captains, and many missed an important deadline on data centers."
5. Layer (a): the row repeats the one-sentence teaser faithfully; the Highlight adds "signalling uneven national implementation of the AI Act", and the teaser never names the AI Act.
6. Backing: 1 row, a single news outlet (one-sentence RSS teaser). Not community.

---

## 2026-11-10

### 2026-11-10-agents-1 (ticket comment: "default model")

1. Page `ai-agents`, section Claude Code Release bullet
2. Published: "…make Claude Fable 5.2 the default model (1M context, $8/$40 per Mtok), …"
3. Input (refetched, `gh api repos/anthropics/claude-code/releases/tags/v2.1.321`): "- Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model — 1M context, $8/$40 per Mtok with $0.20/Mtok cache reads"
4. n/a (repo bullet)
5. Layer (b): "now the default Fable model" becomes "the default model", which widens the scope from the Fable alias to Claude Code as a whole. (The bullet spans v2.1.321–v2.1.322; v2.1.322's notes, refetched, hold one line: "Added fast mode on Vertex in the global, us and eu regions…".)
6. Backing: 1 row, a single GitHub release.

### 2026-11-10-agents-2 (ticket comment: #107390 burn rate)

1. Page `ai-agents`, section Claude Code hot issue bullet
2. Published: "- **Hot issue:** [#107390](https://github.com/anthropics/claude-code/issues/107390): users report weekly Team usage exhausted in ~30.5 hours after reset (Nov 4–5), far faster than the prior ~2-hour session burn rate, with no workflow change."
3. Input (refetched, `gh api repos/anthropics/claude-code/issues/107390`): "During October 2026, I regularly used Claude Code heavily for software development. My five-hour session allowance often exhausted within approximately two hours of active work, but I could continue using Claude Code across the week without reaching the weekly limit."
4. n/a (repo bullet)
5. Layer (b): the issue's "two hours" is how fast the five-hour session allowance ran out; the bullet makes it a weekly "burn rate" and calls 30.5 hours "far faster" than 2 hours, which reverses the issue's numbers.
6. Backing: 1 row, a single open GitHub issue (one reporter; "users report").

### 2026-11-10-agents-3 (ticket comment: v2.1.321 fixes merged)

1. Page `ai-agents`, section Claude Code Release bullet
2. Published: "…fix multiple regressions including MCP OAuth token leaks, Bash permission prompts on network paths, `NotebookEdit`/`Edit` corruption on UNC/WSL paths, and Windows `FileChanged` hook failures with lowercase drive letters."
3. Input (refetched, v2.1.321): "- Fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt" / "- Fixed a case where Bash permission checks judged a file write from the wrong folder and didn't prompt" / "- Fixed `NotebookEdit` deleting or overwriting a notebook's first cell when the call named no cell, on network paths (UNC shares, WSL folders, `/net` mounts)"
4. n/a (repo bullet)
5. Layer (b): the release's Bash fixes are permission bypasses and its "on network paths" fixes are for NotebookEdit and Edit; the bullet merges them into "Bash permission prompts on network paths" and adds "regressions", a word neither v2.1.321 nor v2.1.322 (refetched) uses.
6. Backing: 1 row, a single GitHub release.

### 2026-11-10-models-2 (ticket comment: Gemini "human annotators")

1. Page `ai-models`, section Highlights (also Spotted row summary)
2. Published (Highlight): "- A GitHub repository documents that Google Gemini routes personal Drive files and emails to human annotators."
3. Input (`candidates.json`, HN story "Google Gemini routes personal Drive files and emails to human annotators", https://github.com/thisisme6598/gemini_files/): "Documentation of Gemini File Leaking Behavior."
4. Row restated (Spotted): "The documentation shows that Google Gemini sends personal Drive files and emails to human annotators."
5. Layer (c): the claim exists only in the HN submission title; the repo text says only "Documentation of Gemini File Leaking Behavior". The row turns the title into "The documentation shows that …", and the Highlight repeats it as documented fact.
6. Backing: 1 row, a single community story (HN linking a personal GitHub repo).

### 2026-11-10-models-8

1. Page `ai-models`, section Highlights (also Spotted row and highlights.json)
2. Published (Highlight): "- Anthropic released Claude Fable 5.2 with gains over 5.1 in coding, reasoning, and vision; it scores 65 on Artificial Analysis, the highest to date, and demonstrates end-to-end electronic hardware design." highlights.json: "Anthropic released Claude Fable 5.2 with gains in coding, reasoning, vision, scoring 65 on Artificial Analysis"
3. Input (`candidates.json`, HN story "Claude Fable 5.2 scores 65 on Artificial Analysis, highest so far", https://artificialanalysis.ai/models/claude-fable-5-2): "Analysis of Anthropic's Claude Fable 5.2 (Max, Default Fallback) and comparison to other AI models across key metrics including quality, price, performance …"
4. Row restated (Spotted): "An analysis reports Claude Fable 5.2 scoring 65 on Artificial Analysis, the highest score to date"
5. Layer (b): the score comes only from the HN title, and the page text scopes the model to "(Max, Default Fallback)"; the row drops that configuration, and the Highlight also drops the row's "An analysis reports".
6. Backing: the score rests on 1 row, a single community story (HN title). The release itself has its own lab row.

### 2026-11-10-data-1 (ticket comment: Smart Routing linked to BigQuery billing)

1. Page `ai-data`, section Across platforms
2. Published: "- Cost attribution appears on Databricks and BigQuery: Databricks Smart Routing reduces routing cost per request, and BigQuery editions add opt-in compute cost attribution (Preview) that assigns billed slots to query projects based on actual reservation usage."
3. Input (`data-trace.json`, `text`): Smart Routing: "Smart Routing now routes only subagents, not the first prompt. It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused." BigQuery: "This feature attributes billed compute charges directly to the query projects that use your administration project's reservation capacity."
4. Rows restated: Databricks "Smart Routing now routes only subagents instead of the first prompt, reducing cost by up to 70% and p90 latency from 9 seconds to 2 seconds, while Smart Routing for Codex is paused."; BigQuery "BigQuery editions offer an opt-in compute cost attribution feature that assigns billed compute charges to query projects based on actual commitment and autoscaling slot usage …"
5. Layer (a): neither row links Smart Routing to cost attribution; Across platforms files a cost reduction under "Cost attribution appears on Databricks and BigQuery" and changes "billed compute charges" into "billed slots".
6. Backing: 2 rows, only 1 (BigQuery) about attribution. Vendor notes.

### 2026-11-10-data-2 (ticket comment: "internal benchmarks", "routing latency")

1. Page `ai-data`, section Databricks table row summary, repeated in Across platforms
2. Published (row): "Smart Routing now routes only subagents instead of the first prompt, reducing cost by up to 70% and p90 latency from 9 seconds to 2 seconds, while Smart Routing for Codex is paused." Across: "…cutting cost up to 70% and p90 latency from 9s to 2s…"
3. Input (`data-trace.json`, "Smart Routing is faster and lower cost, and now routes subagents only (Beta)", `text`): "It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds."
4. Across platforms restates the row (above).
5. Layer (b): the row drops "in internal benchmarks" and shortens "p90 routing latency" to "p90 latency"; Across repeats the row.
6. Backing: 1 row, a vendor release note.

### 2026-11-10-data-5 (ticket comment: "must migrate to GLM 5.3")

1. Page `ai-data`, section Highlights (also Action required and Databricks row)
2. Published (Highlight): "- − Azure Databricks workspaces using Zhipu AI GLM 5.2 must migrate to GLM 5.3 before the model retires on February 4, 2027."
3. Input (`data-trace.json`, "Zhipu AI GLM 5.2 is scheduled for retirement", `text`): "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027. GLM 5.3 is the recommended replacement. See Legacy, deprecated, and retired models for migration guidance."
4. Row restated (Databricks table and Action required): "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027, requiring migration to GLM 5.3 per the Legacy, deprecated, and retired models guidance."
5. Layer (b): the row already turns "GLM 5.3 is the recommended replacement" into "requiring migration to GLM 5.3"; the Highlight sharpens it to "must migrate to GLM 5.3".
6. Backing: 1 vendor note, rendered in 2 rows (Action required and Databricks). Also in highlights.json: "− Azure Databricks workspaces using Zhipu AI GLM 5.2 must migrate to GLM 5.3 before retirement on February 4, 2027".

### 2026-11-10-data-6

1. Page `ai-data`, section Across platforms
2. Published: "…while Snowflake makes Anthropic Claude 5.5 and OpenAI GPT-6 generally available for Cortex workloads."
3. Input (`data-trace.json`, "Nov 06, 2026: Anthropic Claude 5.5 and OpenAI GPT-6 models (General availability)", `text`): "The following models are now generally available:"
4. Row restated (Snowflake table): "Anthropic Claude 5.5 and OpenAI GPT-6 models are now generally available in Snowflake."
5. Layer (a): the row says "in Snowflake"; Across adds "for Cortex workloads", which the note's text does not say (the model list was cut).
6. Backing: 1 row for this clause, a vendor note.

### 2026-11-10-data-8

1. Page `ai-data`, section BigQuery "Also new" line
2. Published: "_Also new:_ [You can use compression functions in GoogleSQL to compress or decompress bytes or string values by using the Zstandard (Zstd) lossless data compression algorithm](https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026)"
3. Input (`candidates.json`, BigQuery vendor note with that title): "You can use compression functions in GoogleSQL … The following functions are supported: ZSTD_COMPRESS ZSTD_DECOMPRESS_TO_BYTES … These functions are in Preview." (`data-trace.json` holds no `text` for this item, as it was not a shown row).
4. n/a
5. Layer (d): the "Also new" line is rendered in code from the note's title alone, so the Preview stage that sits only in the note's body is lost; no model wrote it.
6. Backing: 1 vendor note.

---

## 2026-11-11

### 2026-11-11-agents-1

1. Page `ai-agents`, section Highlights
2. Published: "- OpenShell v0.1.8 introduces breaking changes: static provider credentials now require explicit `auth_style` declarations, REST endpoints return 403 for HTTP upgrade requests, …"
3. Input (refetched, `gh api repos/NVIDIA/OpenShell/releases/tags/v0.1.8`): "### Upgrade notes - Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies, so custom headers such as `x-api-key`, query parameters, and path slots need an explicit placement declaration. Upgrade the gateway before the supervisor, …"
4. Row restated (OpenShell Release bullet): "- **Release:** [v0.1.8](…) makes several breaking changes: static provider credentials now require explicit `auth_style` placement declarations for custom headers, query parameters, and path slots; …"
5. Layer (a): the bullet keeps the scope "for custom headers, query parameters, and path slots"; the Highlight drops it, so all static credentials seem to need `auth_style`. Both drop "without placement metadata" and the upgrade order.
6. Backing: 1 row, a single GitHub release. Also in highlights.json: "OpenShell v0.1.8 breaks: explicit auth_style for static credentials, …".

### 2026-11-11-data-1

1. Page `ai-data`, section Across platforms
2. Published: "- AI functions in SQL: Snowflake adds page filtering to AI_EXTRACT and AI_PARSE_DOCUMENT (GA), while BigQuery generative AI functions add gemini-4-carbon model support (GA); both run in-warehouse but expose different function sets and models."
3. Input (`data-trace.json`, "Nov 10, 2026: AI_EXTRACT and AI_PARSE_DOCUMENT now support page filtering with FL_FILTER_PAGES", `text`): "AIEXTRACT and AIPARSEDOCUMENT now support selecting document pages with FLFILTERPAGES. Process the pages relevant to your task directly in SQL, without creating separate files for each document section."
4. Rows restated: Snowflake "`AI_EXTRACT` and `AI_PARSE_DOCUMENT` now accept `FL_FILTER_PAGES` to process specific document pages directly in SQL, eliminating the need to create separate files for each section."; BigQuery "BigQuery generative AI functions now support the `gemini-4-carbon` model for generally available use."
5. Layer (a): the Snowflake row has no stage; Across adds "(GA)" to it and adds "both run in-warehouse but expose different function sets", which neither row nor note says.
6. Backing: 2 rows (one vendor note each); only the BigQuery one supports a GA word. Vendor notes.

### 2026-11-11-data-2

1. Page `ai-data`, section dlt repo News bullet
2. Published: "- **News:** [Introducing performance optimization in dltHub](https://dlthub.com/blog/introducing-performance-optimization) announces new performance optimization features for the data ingestion library."
3. Input (`candidates.json`, community post, source "dltHub blog"): "TODO: meta description (about 150 characters)."
4. n/a (repo bullet)
5. Layer (c): the input text is a CMS placeholder, so only the title exists; the bullet describes "new performance optimization features" as an announcement, without the "title only, no description" note the same page gives the Quack item.
6. Backing: 1 row, a single vendor blog post (title only); not HN/Lobsters/Dev.to.

### 2026-11-11-data-3

1. Page `ai-data`, section Highlights (and Snowflake News bullet)
2. Published (Highlight): "- Snowflake Python Connector 5.0.0 introduces a native asyncio awaitable API built on Universal Core; teams using the connector in event-loop-based Python services must test migration to eliminate thread pools."
3. Input (`candidates.json`, community post "Native Asyncio Comes to the Snowflake Python Connector", Snowflake on Medium): "TL;DR If you run async Python against Snowflake, install snowflake-connector-python 5.0.0 on Python 3.11 or later. Async applications import snowflake.connector.aio and await the calls tha[t] …" / "Snowflake Connector for Python 5.0.0 became generally available on October 15. It is still snowflake-connector-python, with the same synchronous API. Check the upgrade guide for behavior changes before switching."
4. Row restated (Snowflake News bullet): "- **News:** [Native Asyncio Comes to the Snowflake Python Connector](https://medium.com/snowflake/…) announces version 5.0.0 with a native awaitable API built on Universal Core, eliminating the need for thread pools when calling Snowflake from event-loop-based Python services."
5. Layer (a): the bullet has no "must"; the Highlight adds "must test migration", where the post says "Check the upgrade guide … before switching" to an opt-in API. (The bullet has its own, separate flaw: it presents a release that "became generally available on October 15" as announced now.)
6. Backing: 1 row, a single community blog post (Medium, Snowflake's publication).

### 2026-11-11-data-4

1. Page `ai-data`, section Action required row summary (and Highlights)
2. Published (Action required row): "…all Unity Catalog managed tables will be automatically upgraded to `catalog commits`, making Unity Catalog the system of coordination and enabling multi-statement transactions, external engine writes, and consistent governance; clients must plan for this breaking change before the 2027 deadline." Highlight: "- − Azure Databricks workspaces with Unity Catalog managed tables must plan for automatic upgrade to catalog commits after Databricks Runtime 15.4 LTS end of support on August 19, 2027, …"
3. Input (`data-trace.json`, "All Unity Catalog managed tables will be upgraded to catalog commits", `text`): "After Databricks Runtime 15.4 LTS reaches end of support on August 19, 2027, Azure Databricks will upgrade all Unity Catalog managed tables to use catalog commits. With catalog commits, Unity Catalog becomes the system of coordination for your tables. This enables multi-statement, multi-table transactions, writes from external e[ngines] …"
4. Highlight restates the row (above).
5. Layer (b): the note describes an automatic upgrade after the date; the row adds "clients must plan for this breaking change before the 2027 deadline", and the Highlight keeps "must plan".
6. Backing: 1 vendor note (the row appears in Action required and in the Databricks table).

### 2026-11-11-models-1

1. Page `ai-models`, section Highlights
2. Published: "- Anthropic launches its IPO roadshow for 825 million Class A shares priced at $70–78, targeting a Nasdaq listing under “ANT” at a reported $1.3 trillion valuation."
3. Input (`candidates.json`, lab post "Anthropic launches roadshow for proposed initial public offering"): "The initial public offering price is expected to be between $70.00 and $78.00 per share. … A registration statement relating to these securities has been filed with the U.S. Securities and Exchange Commission but has not yet become effective."
4. Row restated (Lab announcements): "Anthropic launched a roadshow for its proposed initial public offering of 825,000,000 shares of Class A common stock, with an expected price between $70.00 and $78.00 per …"
5. Layer (a): the row keeps "expected price between"; the Highlight says the shares are "priced at $70–78", as if pricing were done.
6. Backing: 1 lab post row for the price (the $1.3T figure rests on a separate title-only WSJ Spotted row). Not community.

---

## 2026-11-14

### 2026-11-14-agents-1

1. Page `ai-agents`, section Claude Code Release bullet (repeated in Highlights)
2. Published (bullet): "…resolves subagent model handling bugs in worktrees and bare repos, fixes session resumption losing recent turns after unclean exits, …" Highlight: "- Claude Code v2.1.325 fixes a security issue in zstd-compressed response decoding along with subagent model handling bugs in worktrees and session resumption losses after unclean exits"
3. Input (refetched, `gh api repos/anthropics/claude-code/releases/tags/v2.1.325`): "- Fixed `/security-review` and skills' inline git commands stopping with an error in worktrees of bare repositories, `--separate-git-dir` checkouts and Android `repo` checkouts - Fixed subagents with their own model being moved to the plan-mode model when the model setting is `opusplan` or `haiku`"
4. Highlight restates the bullet (above).
5. Layer (b): two adjacent, unrelated fixes (git commands in bare-repo worktrees; subagent model selection) are merged into "subagent model handling bugs in worktrees and bare repos"; the Highlight copies the merge.
6. Backing: 1 row, a single GitHub release. Also in highlights.json: "Claude Code v2.1.325 fixes a zstd decoding security issue and subagent bugs in worktrees and session resumption after unclean exits".

### 2026-11-14-data-1

1. Page `ai-data`, section Airflow repo Release bullet
2. Published: "- **Release:** First stable releases of the TypeScript, Java, and Go SDKs ([ts-sdk/1.0.0](…), [java-sdk/1.0.0](…), [go-sdk/v1.0.0](…)) enable native DAG authoring in those languages with task dependencies, task groups, and variable APIs."
3. Input (refetched, the three releases): Java: "- Native Java Dag authoring, serialized to DagSerialization v3: task dependencies, task groups, branching and conditions, edge labels - Triggering other Dags - Task state store and Variable APIs". TypeScript: "- A task that passes `queue` as `undefined` now inherits the Dag's queue. - The build no longer uses a machine-global pnpm config …". Go: "- Fix the Go SDK build on 32-bit targets. - Fix the install command breaking the first bundle build. - Log attributes no longer displace standard log fields. - `ti_run` now loads the serialized Dag only for stub tasks."
4. n/a (repo bullet)
5. Layer (b): the feature list ("task dependencies, task groups, and variable APIs") is from the Java notes only; the bullet attributes it to all three SDKs.
6. Backing: 1 row built from 3 GitHub releases, of which 1 supports the claim.

---

## Left out (confirmed, but not overstatement on a close reading), for re-cutting

- 2026-11-07-agents-4: both Codex lines drop the app update the issue names as a possible cause (omission). Issue text refetched: "The update occurred between the successful switch and the failed switch, but this observation does not establish whether the update or account switching caused the problem."
- 2026-11-07-agents-8: Oh My Pi #18341 "possibly from upstream authentication/fingerprint changes". Refetched: the reporter asks "if there are recent upstream changes from Google affecting the authentication/fingerprint used by antigravity", so the hedge is sourced; the finding is the omitted ToS reason (omission).
- 2026-11-08-agents-4: Dev.to write-up of the email leak listed as News without its fix version (omission, stale repeat).
- 2026-11-09-data-3: Fabric "now supports Reference Data Joins"; the review could not open the post, and "now supports" is normal for an announcement post.
- 2026-11-10-policy-4: dated before the window and Stage "—" (selection and format).
- 2026-11-11-data-7: Lobste.rs summary built from the blog tagline plus the title (restates title, no added claim).
- 2026-11-11-data-8: third-party Substack post placed under DuckDB News, flagged "title only" (placement).
- 2026-11-11-models-6: "$1.3T" from a title-only WSJ headline, but written as "a reported $1.3 trillion valuation" (attributed; the conflict with Bloomberg's $1.4T is an omission).
- 2026-11-11-policy-1: consultation closing date missing from Coming up (omission).
- 2026-11-14-agents-10: details the review could not check in the 1500-char candidate. Refetched full notes support them: Codex rust-v0.169.0 "Pasted images on macOS retain their intended orientation"; OpenCode v2.3.0 "Local Windows shell commands now run through the process daemon" and "Added LM Studio decision-model support". A truncation artifact of the review, not an overstatement.
- 2026-11-08-agents-9: dash summaries and a repo-name link (format).
- 2026-11-10-models-9: "handwritten" in the summary where the title says "handtyped" (word choice).
- 2026-11-07-models-6 (256K vs 262K notation) and 2026-11-08-models-5 (credits without provider, same in input): notation or input gaps.
