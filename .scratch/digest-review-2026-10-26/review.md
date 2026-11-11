# Daily Diff review, edition 2026-10-26: aggregated report

Inputs merged: ai-agents.md, ai-models.md, ai-data.md, ai-trends.md, cross-page.md. Severity is re-ranked on one scale: high = a reader is misled or acts wrongly (wrong fact, wrong security/breaking claim, missing major item); medium = noticeably lowers value or trust; low = polish. Evidence marks are the reviewers' own. Finding ids (A, M, D, T, X) are used in the Systemic section.

## Verdict

The edition is readable and its structure, links, counts and most arithmetic check out, but it is not clean: six high findings, mostly Highlights that assert more than the source says (GA labels that no Snowflake note states, "only dependency updates" for a release with about 20 user-facing items, a closed OpenCode issue shown as a live regression), a weekly Trends page whose Claude Code Skills section is mostly last week's stale PRs, and a policy page skipped with no way to tell a quiet feed from a broken one. Most defects trace to a few generator habits: Highlights prompts that overreach, Spotted summaries that fall back to raw meta descriptions, selection with no memory of earlier editions, and traces that cannot explain why an item was dropped.

## Systemic issues

**S1 [medium] Spotted and Most discussed summaries are the raw page meta description.** Boilerplate ("Contribute to ... on GitHub", "- owner/repo", padding, "..."), first-person teasers, marketing copy, bare questions, "—" for rows with no description.
- Instances: A6 (agents Spotted, 5 of 7 rows), M1 (all 5 models rows), T8 (Trends Most discussed). Same pattern on the 10-25 edition, so persistent.
- Cause UNVERIFIED. AGENTS.md line 183: a failed summaries call shows the descriptions, so the call is probably failing or skipped on Spotted (no LLM log). The Trends reviewer implies Most discussed bypasses the summaries call; agents and models reviewers think the call failed. Both fit the data.
- Fix: read the run log for the Spotted summaries call (`summarized-table.ts`, `prompts-pages.ts`); require one concrete fact per row, forbid first-person/marketing/question text; on fallback strip boilerplate and show "—"; route Most discussed through the same call.

**S2 [high] Highlights, Signals and highlights.json assert more than the source says.** Invented status labels, calls to action, audiences and conclusions; vendor claims as fact; missing scope qualifiers; wrong labels; stitched claims.
- Instances: A2, A3, A4, A5, M2, M3, M4, D1, D2, T2, T9, T10, T17.
- Fix: prompts: only claims the source states; no GA/Preview/beta unless title or body says it; no calls to action; attribute vendor numbers; require scope (sample size, single run, self-published, who is affected, fix status); no trend claims built on three titles; "reports"/"issue says" for open issues; use the source's own terms.

**S3 [medium] Highlights restate the table instead of selecting; highlights.json picks weaker entries than the page leads with.**
- Instances: M6 (5 bullets for 5 rows), M7, D5, X5, T10. A1 notes a correct Agent Deck entry would have competed for a slot.
- Fix: cap at 2-3 per page ranked by relevance to a data/AI engineer; "no highlights beyond the list" when nothing stands out; skip vendor items with low significance/confidence; require each page's bullet 1 in highlights.json; add a "why it matters" clause.

**S4 [high] Selection has no memory of earlier editions: repeats, stale items, cut stories that never return.**
- Instances: A2 (OpenCode hot issue repeated from 10-25), T1 (8 of 11 Skills items repeated from 10-19, some untouched 5+ weeks), T12 (7 of 15 HF models repeated, no marker), A9 (third Hacktoberfest entry in two days), A3 (Skyvern post 25 days old), X4 (agents-routed story cut on 10-25 never eligible again).
- Fix: store first-reported date per id (like `ReportedState`); re-show only on real state change; `updated_at`/age window; 🔥 rule on HF rows; keep cap-cut stories eligible next day; dedupe contest-tag submissions.

**S5 [medium] Spotted ranking is by points with no topic-confidence or engagement floor; `policy` and `other` topics have no page.**
- Instances: A9, M5, T7, X3, X7.
- Fix: `selectSpotted`/`PAGE_OF_TOPIC`: minimum topic probability (about 0.5-0.6), rank by confidence then points, minimum engagement when the page already has 3+ rows, a home for policy and security-incident stories.

**S6 [medium] Hard relevance cutoffs ignore low confidence.**
- Instances: D4 (Iceberg dropped at real_change 0.46 despite significance 0.79), D13 (Fabric FNTK dropped at 0.49, significance confidence 0.30), X2 (DHS ban dropped on an impact score with 0.28 confidence), A9 (a 0.43-confidence topic published).
- Fix: low-confidence = unknown, not none; significance floor or tracked-project keyword override; second Jev pass or "Also new" line within about 0.02 of the cutoff; reserve one slot per section.

**S7 [medium] Row-summary prompts paraphrase in source order, add filler, mangle identifiers.**
- Instances: A7, D3, D6, T6, T14, A11.
- Fix: order by user impact (breaking, behavior-changing fixes, headline features, performance last); one differentiating fact or "—"; copy identifiers verbatim in code formatting (post-check backticked tokens against source); keep repo names as written; drop the mandatory "It matters because" clause.

**S8 [medium] Figures printed without period, unit, baseline or legend; ranks derived by the model.**
- Instances: A8, T3, T15, T19, T10 (bullet 1 drops its window).
- Fix: print the period; compute ranks, "top N", "newcomer" in code; add a Radar legend.

**S9 [medium] Empty or placeholder content rendered instead of falling back or being filtered.**
- Instances: A1, A6 (ADRs row "—"), T4, T8, M8, T20.
- Fix: code adds a project to Quiet when the model returns nothing; fall back to repo/site meta description; drop a 🆕 row with no description and no usage; collapse empty sections; "—" for missing language.

**S10 [low] Rendering and convention drift between pages and from the spec.**
- Instances: X6, D9, D10, D11.

**S11 [medium] Traces cannot explain drops, so outages and quiet days look the same.**
- Instances: X1 (no per-source counts), T11 (no kept/rank/dropped_reason), A6/M1 (no summaries-call log), A1 (no log of release body), D4 (keyword.keep unexplained), T4 (why no GitHub Radar rows).
- Fix: write per-source counts (including zero), `rendered`, `rank`, `dropped_reason`, LLM-call status; warn when a primary source returns zero judged items for N days.

## Findings by page

### ai-agents

**A1 [high] accuracy.** Location: Agent Tooling, "(no reportable changes for Agent Deck v1.16.34 — only dependency updates)"; header "Active today: 5", "Stable releases: 3".
- Problem: false. v1.16.34 (25 Oct) lists sandbox providers v1 (remote targets), default Claude account, ask-owner dialog, opt-in wait timer, safer install defaults, and fixes (Codex sessions reach finished state, pi driver pause-ack deadline, trust-prompt re-check, account switching). Dependency bumps (Go 1.26.10 for GO-2026-6809) are one of about 20 items. The line also states an absence (the spec forbids that). Merged: bare parenthetical, no `### Agent Deck` heading, not in the Quiet line, banner counts it as active while only 4 projects have content; reader cannot tell shipped, quiet or failed. A correct entry would have competed with Cline for the second highlight slot.
- Evidence: VERIFIED (release notes; header vs body). UNVERIFIED: whether the model's release body was truncated to the "Build, dependencies" tail.
- Fix: never emit "no reportable changes"; fall back to title plus top 2-3 items; every active project gets a `### <Project>` heading with a Release bullet; code adds a project to Quiet if nothing is returned. Systemic: S9, S11.

**A2 [high] selection / accuracy.** Location: OpenCode "Hot issue" (#58781, #58670); Highlights bullet 2 ("free-tier regression in Desktop 1.19.4 ... errors persist without limit reset").
- Problem: identical to the 10-25 row. Both issues were created Oct 24 and closed "as not planned" Oct 25 by the opencode-agent bot, which says the limit is applied by the Zen/Go service, not Desktop, and sends billing to email. The page does not say so; the Highlight calls it a persisting regression. One commenter says Desktop 1.19.4 fails where terminal 1.18.30 works, so "regression" is contested; "persist" cannot be checked.
- Evidence: VERIFIED (repeat; closure as fetched 10-26). UNVERIFIED: closure time of day vs 04:31 UTC generation (GitHub showed a date only; very likely before).
- Reviewers differ: agents reviewer high; cross-page medium (repeat only, did not check state). Rated high because the Highlight asserts a live regression the project closed as server-side. The hot-issue window of 48h+ makes repeats by design, so dedupe is a design change.
- Fix: hot-issue stage: dedupe against previous edition's issue ids unless state changed; relabel/skip closed issues; remove from Highlights. Systemic: S2, S4.

**A3 [medium] accuracy.** Location: Highlights bullet 5, "Skyvern rewrite achieves 2.3x speedup and 90.5% Odysseys benchmark score via progressive disclosure".
- Problem: 2.3x is a production A/B on mean run time (593 s to 262 s, about 100,000 runs, Skyvern 2.0 vs 3.0, cost per run -22.5%), not a benchmark. "Progressive disclosure" is the HN submitter's wording. 90.5% is Odysseys rubric success with no earlier score, so it shows no gain. Post dated Oct 1 (updated Oct 6), 25 days old.
- Evidence: VERIFIED.
- Fix: use source terms; separate production result from benchmark; staleness rule for Spotted. Systemic: S2, S4.

**A4 [medium] accuracy.** Location: Command Code "Hot issue" (#1067) and Highlights bullet 4 ("DeepSeek Harness Cloudflare returns 503 after /compact").
- Problem: the 503 (Cloudflare 1102) comes from Command Code's own API (api.commandcode.ai), not the DeepSeek harness. A maintainer wrote "1102 was a real bug on our side"; oversized requests now return 413 (PR #5955). An earlier member comment blamed the DeepSeek harness, so attribution was disputed. Row gives no cause or fix status.
- Evidence: VERIFIED (as fetched, after generation). UNVERIFIED: whether the fix existed at 04:31 UTC.
- Fix: state error origin and cause (oversized request after compaction); drop "DeepSeek harness returns 503". Systemic: S2.

**A5 [medium] highlights / accuracy.** Location: Highlights bullet 1 ("Hermes Agent leaks secrets") and highlights.json ai-agents[0] ("leaks API keys ... — audit your invocations immediately").
- Problem: "audit your invocations immediately" is in neither issue thread (added by the json, which goes to Telegram and Teams). "API keys" misdescribes #143982 (passwords, tokens, Azure storage/Service Bus keys; the API-key case is #143938's systemd path). No mention that both are rated P3 or that fix PRs are open (#144025, #144359; #143954). Page states open-issue reports as fact. It is a fair top item for teams running Hermes with chat gateways.
- Evidence: VERIFIED.
- Fix: no calls to action absent from source; name credential types and surface; note P3 and open PRs; say "reports". Systemic: S2.

**A6 [medium] editorial.** Location: Spotted Summary column (Agensh, DetectorScope, Let It Die, Blog, CowAgent, ADRs for AI rows).
- Problem: raw meta descriptions with boilerplate and truncation ("Contribute to microsoft/Agensh development by creating an account on GitHub.", "... - google-deepmind/detectorscope", "Slow and Steady          ...", "Open-Source Super AI Assistant"); ADRs for AI row is "—". Real content is more useful (Agensh: 1,024-agent harness, Pandoc pass rate 33.89% to 55.06%; ADRs for AI: ADRs in Git, VS Code extension, MCP server; Let It Die: TabPFN triage prototype on 1,981 Enron emails, not a live mailbox). Same on the 10-25 page.
- Evidence: VERIFIED against sources; cause UNVERIFIED.
- Fix: see S1. Systemic: S1, S9, S11.

**A7 [medium] editorial.** Location: Cline "Release" bullet; highlights.json ai-agents[1].
- Problem: accurate but leads with the least consequential items and crams two releases into one sentence. Omitted: request retries cut 5 to 3; native Google Search no longer sent for the `gemini` provider (429 errors on free-tier keys with Gemini 3+, dropped all Cline tools on Gemini 2.x); auto-compaction estimate about 7x too high and re-triggering; Kimi K3 max reasoning level. SDK jumps 0.0.95 to 0.2.0. Highlight says the releases "introduce" reattachment, which is a fix.
- Evidence: VERIFIED.
- Fix: one bullet per release, 2-3 highest-impact changes, say when behavior changes; "fix" not "introduce". Systemic: S7.

**A8 [medium] accuracy.** Location: OpenCode "News": "hit GitHub Trending with +5,921 stars ... open-source coding agent positioning".
- Problem: no period; it is the weekly gain (2.7% of the repo's stars) on a daily page. 10-25 had the same pattern ("~44 stars", "OpenShell surges 896 stars"). The sentence after the figure is filler, so there is no news. Link text "GitHub Trending" points to the repo.
- Evidence: period inferred. VERIFIED: trending-trace.json lists `github:anomalyco/opencode` with `gain: 5921`, `gainFrom: "trending"`; ai-trends shows it under "this week"; AGENTS.md line 158 says Trending uses `since=weekly`.
- Reviewers differ: agents medium, cross-page low. Kept medium because a daily reader will take it as today's gain.
- Fix: print "+5,921 stars this week" or drop it; no Trending-only news row without an actual change; link the trending page. Systemic: S8.

**A9 [low] selection.** Location: Spotted: DetectorScope, Let It Die, Making My Blog Readable; AgentTrust (dropped).
- Problem: three rows have little for an agent-tooling reader (text-detector interpretability; third Hacktoberfest TabPFN+Gemma entry in two days, never run on a live mailbox; llms.txt for crawlers), while on-topic "Show HN: AgentTrust – Zero-trust security and human approvals for AI agents" (agents 1.0, `shown:false`, probably cut by the points-ranked per-source cap) was left out. DetectorScope was shown at agents 0.43 (confidence 0.32). AgentTrust would also have linked to the Hermes story. Merged with the cross-page duplicate (Dev.to "This is a submission for ..." on 10-25 and 10-26).
- Evidence: VERIFIED; cap cause UNVERIFIED.
- Fix: minimum topic probability (about 0.5), rank by confidence within the cap; skip Dev.to rows opening "This is a submission for". Systemic: S4, S5, S6.

**A10 [low] accuracy.** Location: Spotted row 5, link text "Agentsh" to microsoft/Agensh.
- Problem: visible name differs from the repo (Agensh, 467 stars); readers searching will miss it. The HN title may carry the typo.
- Evidence: VERIFIED for repo name; UNVERIFIED for HN title.
- Fix: show the repo name when they differ by one character, or accept the HN title.

**A11 [low] editorial.** Location: Hermes hot issues (#143982, #143938).
- Problem: symptoms only; no exposure surface, scope or fix status. The second reads as general but applies only to the `systemctl status` path and MCP servers whose launch command contains a credential. #143982 also leaves `curl -u alice:hunter2` and background `process` results unmasked.
- Evidence: VERIFIED.
- Fix: add "who is affected / where it shows / fix status" for security issues. Systemic: S7.

### ai-models

**M1 [medium] editorial.** Location: Spotted Summary column, all 5 rows.
- Problem: every cell is the page's meta description verbatim: first-person preamble ("I am a dermatologist. I tested..."), Cerebras marketing ("Learn how..."), bare question ("What is "the true cost of a token"?"). Rows 1-3 carry no result.
- Evidence: VERIFIED by curl of all 5 URLs; whether the call failed UNVERIFIED.
- Reviewers differ: models reviewer high, agents reviewer medium for the same defect. Medium on the scale (no wrong claim), but this page exists only for Spotted, so it is its main value gap.
- Fix: see S1. Systemic: S1, S11.

**M2 [medium] accuracy.** Location: Highlights bullet 3, "decade-old CNN outperforms frontier LLMs ... in skin cancer diagnosis".
- Problem: limits missing in a medical setting: self-published, not peer reviewed, 200 lesions, each LLM run once, six-way task. CNN won first-choice accuracy (62% vs 42%/42%; 125 vs 84 and 85 of 200) but at its preset threshold discharged 18 of 30 melanomas vs 3 and 4. At a matched threshold it discharges 1-2, so the gap is a default-threshold artifact and the accuracy win holds. CNN is Inception v3 (2015), about 11 years old.
- Evidence: VERIFIED (lynchlab.net via WebFetch).
- Fix: scope qualifier, e.g. "In a 200-lesion test by a dermatologist, a fine-tuned 2015 CNN beat GPT-6 Astra and Claude Fable 5.1 on first-choice accuracy (62% vs 42%), but missed more melanomas at its default threshold." Systemic: S2.

**M3 [medium] accuracy.** Location: Highlights bullet 2 and highlights.json: "Cerebras deploys ... achieving/delivering 1,000-2,000+ tokens per second".
- Problem: vendor claim stated as achieved. The post is a design explainer (44 GB per wafer, 59 wafers, ~2 µs per hop); the figure is generic for "multi-trillion parameter models" with no named model, hardware count or test setup. "Deploys" overstates "how we deploy".
- Evidence: VERIFIED.
- Fix: attribute ("Cerebras says it can serve ..."); prefer a measured item for highlights.json. Systemic: S2.

**M4 [medium] accuracy.** Location: Highlights bullet 1 and highlights.json: "...up to 80%... reshaping token economics (for production workloads)".
- Problem: "reshaping token economics" is not in the source; "for production workloads" appears only in highlights.json. The 80% cut is one model (OpenAI GPT-5.6 Luna, 30 Jul); Anthropic's are a 75% cache-read cut on Fable 5.1 and an author estimate of 40-60% for Opus 5.5. Author calls the pricing "weird" and blames open-weight competition.
- Evidence: VERIFIED.
- Fix: say what changed ("OpenAI cut GPT-5.6 Luna 80% (30 Jul); a post tallies cuts across both labs since July and argues open-weight competition drives them"); ban unsourced conclusions and audiences. Systemic: S2.

**M5 [medium] selection.** Location: Spotted rows 4 and 5 (Grok/OpenAI election study; "The AI graveyard").
- Problem: 9 points/1 comment and 8/0 against 213-491 for the others. The graveyard is a TechCrunch evergreen list of consumer flops with no model or lab news, routed to models on 0.53 vs other 0.45 (confidence 0.44). Neither is actionable.
- Evidence: VERIFIED; absence of a minimum-points rule UNVERIFIED (none documented).
- Fix: minimum engagement or topic probability (models >= 0.6) in `selectSpotted`. Systemic: S5.

**M6 [medium] editorial.** Location: Highlights, 5 bullets for 5 Spotted rows.
- Problem: restates the table one for one, so it ranks nothing; bullets 4-5 are the weak items. Bullet 4 says "OpenAI models favor Democrats" but the study tested one OpenAI model (GPT-6.1 Sol) and one Grok (4.7) via API with a forced-pick prompt ("Name one candidate. Don't hedge"); consumer apps refused; OpenAI says the API test does not reflect ChatGPT use. Bullet 5 says "major AI project failures"; source says "notable".
- Evidence: VERIFIED. Merged with the cross-page low "balance".
- Fix: with zero lab/model items, cap at 2-3 and lead with "no lab or model news"; state method and models for study results. Systemic: S3.

**M7 [low] highlights.** Location: highlights.json ai-models entries.
- Problem: prices pick is defensible, but slot two goes to an unmeasured vendor claim over the day's most-discussed item (CNN, 491 points, named models, numbers). Neither entry says what to check.
- Evidence: UNVERIFIED (ranking judgement); engagement and Cerebras content VERIFIED.
- Fix: prefer measured results and named models; add "why it matters". Systemic: S3.

**M8 [low] structure.** Location: "Lab announcements", "New on OpenRouter", "Stealth Models on OpenRouter".
- Problem: three of four sections are "No ... today" placeholders, same as 10-25. Conforms to AGENTS.md (a Spotted row publishes the page); Trends omits empty sections. Suggestion, not a defect. (Heading emoji and "1 comments" are in X6.)
- Evidence: VERIFIED.
- Fix: collapse into the header line or one "Nothing new from labs or OpenRouter today." Systemic: S9.

### ai-data

**D1 [high] accuracy.** Location: Highlights bullets 2 and 3 and highlights.json: "Coding agent MCP tool (GA 2026-10-23)", "Custom error messages ... (GA 2026-10-26)".
- Problem: neither Snowflake release note states an availability status. The new-features index labels other entries "(General availability)" or "(Preview)" in the title; these two have no label, and the feature-policies user guide gives none. highlights.json repeats GA to Telegram, Teams and the overview.
- Evidence: VERIFIED. The cross-page reviewer did not check this; the data reviewer did.
- Fix: forbid GA/Preview/beta wording unless the title or body says it; use the title's label or say nothing. Systemic: S2.

**D2 [medium] accuracy.** Location: Highlights bullet 1 and highlights.json: Polars "must test and migrate affected pipelines" with Databricks, Snowflake, Azure Fabric, BigQuery.
- Problem: overstated. PR #30071 ("fix!: Disallow mixed string <=> numeric arithmetic in eager") calls it an oversight that already raised in lazy Polars; `pl.Series([1, 2]) + "4"` returned "14", "24" and now raises. Only code relying on that is affected. The platform list is not in the source (Polars is a client library).
- Evidence: VERIFIED.
- Fix: say what changes and who is affected; drop the platform list and "must migrate". Systemic: S2.

**D3 [medium] accuracy.** Location: Snowflake row 1: "adding a CODINGAGENT tool type".
- Problem: identifier is `CODING_AGENT`; readers would copy it. The tool type sends nothing: the spec holds the config and each call supplies the message. Omits the managed `code_toolset_all` sandbox and `thread_id` conversation continuation.
- Evidence: VERIFIED against raw page text.
- Fix: copy identifiers verbatim in code formatting; prefer behavior over the title; post-check backticked tokens. Systemic: S7.

**D4 [medium] selection.** Location: Snowflake table: kept "Custom error messages", dropped "Recompact Iceberg table data".
- Problem: the Iceberg note is a behavior change for Snowflake-managed Iceberg tables (a target file size increase now applies to existing data), and Iceberg is a tracked project. Relevance 0.348, significance 0.79 (conf 0.53), real_change 0.46, keyword.keep false. Error messages: relevance 0.502, significance 0.52 (conf 0.25). A low real_change vetoes a 0.79-significance item.
- Evidence: VERIFIED (data-trace.json, note text). INFERRED cutoff 0.5. UNVERIFIED: compaction-cost framing.
- Fix: significance floor (keep at >= 0.75) or tracked-project keyword override; "applies retroactively to existing data" should count as a real change. Systemic: S6, S11.

**D5 [medium] highlights.** Location: Highlights bullet 3, "Custom error messages for feature policy rules".
- Problem: weakest item gets a Highlight: a text field on a niche governance feature, with an invented action ("should update rules"). The three Highlights restate the three rows; Iceberg would be a better third.
- Evidence: VERIFIED (significance 0.52, confidence 0.25).
- Fix: skip a Highlight on low significance/confidence (vendor rows); two suffice. Systemic: S3.

**D6 [medium] editorial.** Location: Open-source stack, Polars: "better memory management during sort spills".
- Problem: spends its words on 3 of 88 performance items. Not mentioned: recursive SQL CTEs, SQL ASOF join, `sink_iceberg` overwrite_filter and dynamic partition overwrite, SQL CREATE TABLE in Iceberg catalogs, encrypted Parquet; behavior-changing fixes by title ("Raise on Delta tables with column mapping", "Decimal cast to int should truncate", "Casting far future dates shouldn't silently wrap", "Respect memory limits of nested cgroups"). Does not say the breaking change already errored in lazy mode.
- Evidence: VERIFIED against py-2.1.0 notes; effect of the four fixes UNVERIFIED (titles only).
- Fix: order Breaking, behavior-changing fixes, headline Enhancements, Performance last. Systemic: S7.

**D7 [low] highlights.** Location: Highlights bullet 1, "− Polars py-2.1.0 disallows ...", first live GOING_AWAY.
- Problem: AGENTS.md line 200 names "a release with breaking changes" as what a keyword rule would sign wrongly. Defensible but debatable: eager behavior is removed, yet it was accidental and fixed as a bug, not a deprecation.
- Evidence: VERIFIED; maintainer preference UNVERIFIED.
- Reviewers differ: cross-page calls the "−" plausible. Ignore if the maintainer prefers the current reading.
- Fix: prompt: GOING_AWAY is for retirements, deprecations and removed features with an end; a bug fix that now raises is not signed.

**D8 [low] editorial.** Location: Highlights bullets 2-3.
- Problem: run-on semicolon sentences; feature name as subject ("messages ... allows"); "Should evaluate integration" has no payoff; shape differs from 10-23 and 10-25.
- Evidence: VERIFIED.
- Fix: one house shape, e.g. "Who - what changed - what to do".

**D9 [low] editorial.** Location: Snowflake Item column ("October 23, 2026: Coding agent MCP tool") and Source column.
- Problem: date prefix in two formats ("October 23, 2026:", "Oct 26, 2026:") duplicates the Date column; Source says "Snowflake" in every row under the Snowflake heading. Same on 10-23.
- Evidence: VERIFIED.
- Fix: strip the prefix by regex; drop Source when a section has one source. Systemic: S10.

**D10 [low] structure.** Location: Snowflake row 1, "🤖" marker.
- Problem: no legend; AGENTS.md and README.md do not document it (ai_in_data 0.96). 10-23 used a warning marker with no legend.
- Evidence: VERIFIED (grep).
- Fix: one-line legend or document. Systemic: S10.

**D11 [low] structure.** Location: Highlights bullet 1, "- − Polars ...".
- Problem: only the "−" bullet carries a sign; bullets 2-3 have no "+", so on GitHub the minus reads as a typo.
- Evidence: I confirmed AGENTS.md line 200 ("− for a bullet that opens with `GOING_AWAY`, + for the rest") and that none of the four .md files has a "+" bullet. Whether the Pages view adds "+" is UNVERIFIED.
- Reviewers differ: data reviewer flags the missing "+"; cross-page says unsigned bullets are "as designed". The spec says "+ for the rest", which the .md does not show. Unresolved.
- Fix: write both signs in the .md, or keep the minus out of Markdown. Systemic: S10.

**D12 [low] selection.** Location: Snowflake row 1, date 2026-10-23 on a 2026-10-26 page; table sorted oldest first.
- Problem: first appears three days late (other 10-23 notes ran on 10-24).
- Evidence: VERIFIED (data-state.json in dboeter/daily-diff); cause UNVERIFIED (feed lag or judged late).
- Fix: check feed lag; sort vendor tables newest first.

**D13 [low] selection.** Location: Dropped "Connect coding agents to Fabric notebooks with FNTK (Preview)"; "More expressive graph analysis: GQL improvements"; empty "Azure / Fabric & GCP" section.
- Problem: the analogue of the kept Snowflake coding agent item was dropped at 0.490 (significance confidence 0.30), 0.01 under the apparent cutoff; GQL at 0.496 with keyword.keep false. The section the audience mostly lives in is empty on the day a Snowflake coding-agent item is a Highlight. Same Fabric drops on 10-25. Merged with the cross-page low.
- Evidence: VERIFIED.
- Fix: `SECTION_FLOORS`: reserve one slot per section within about 0.02 of the cut; second Jev pass or `*Also new:*` line. Systemic: S6.

### ai-trends

**T1 [high] selection.** Location: Claude Code Skills: "Top Skills", "Community Demand", "Pending Skills".
- Problem: 8 of 11 items repeat 2026-10-19 (#1298, #1245, #1742, #1703, #1771; #492 46 comments, #228, #556), several untouched 5+ weeks (#1771 updated 2026-09-16, #1703 2026-09-15, #1298 2026-09-16). Only the 3 "Pending Skills" are new. Merged low: all are open, unmerged third-party PRs/issues, yet "Top Skills" reads like released skills; several are off-audience (Solidity/TON, resume auditing, Markdown-to-video, Pyxel games); "overhaul" and "critical" inflate PR text (#1742's body does say import fails at startup with mcp>=2).
- Evidence: VERIFIED (10-19 page, GitHub API).
- Fix: only PRs/issues with `updated_at` in the last 7 days; drop previous weekly ids unless state moved; omit the section when nothing qualifies; rename to "Open PRs worth watching"; filter by audience; drop the Takeaway unless from new items. Systemic: S4.

**T2 [medium] highlights.** Location: Highlights bullet 5 and Signals paragraph 3, "coding agent evaluation", "maturing benchmark agenda".
- Problem: only SWE-DIVE (2610.30047) is an evaluation paper; SWE-VERIFIER (2610.30284) is a verification model (75.47% to 77.20% at 1.09x cost); PAUSE (2610.29870) a steering method (+16.8% on SWE-bench Verified). No abstract supports a "maturing benchmark agenda". The reliability/cost convergence is real.
- Evidence: VERIFIED.
- Fix: name the theme "coding-agent cost and reliability"; forbid trend claims on three titles. Systemic: S2.

**T3 [medium] accuracy.** Location: Models, OpenRouter usage: "round out the top five" after six models; "Notable newcomers".
- Problem: six models named, so Opus is sixth. "Newcomers" lists jev-1.13 (slug date 2026-09-17) but not openai/gpt-6.1-sol-20260929 (2.81T, newer and larger than Haiku 5.5 at 2.68T).
- Evidence: VERIFIED for count and figures; newcomer rule UNVERIFIED.
- Fix: derive ranks and "top five" from data; define "newcomer" in code (e.g. created within 21 days). Systemic: S8.

**T4 [medium] structure.** Location: Radar rows HunterSwarm, Prime Agent, OpenPAVE, Real-SWE ("🆕 week — / month —", summary "—"), plus Strix and DeepSeek Harness.
- Problem: 6 of 11 Radar rows say nothing about the tool; Strix is a page Highlight (+131%) with no description (strix.ai: AI penetration testing). DeepSeek Harness has a GitHub description the row could use. Cross-page adds: today's Radar has zero GitHub rows (last week had eight 🆕 GitHub rows); cause not visible.
- Evidence: VERIFIED; why no GitHub rows UNVERIFIED.
- Fix: fall back to repo/site meta description; drop a 🆕 row with neither description nor usage; do not feature an item whose row has no summary. Systemic: S9, S11.

**T5 [medium] structure.** Location: Radar: [Prime Agent + Birdstrike Security](https://birdstrike.local/).
- Problem: `.local` (mDNS) host does not resolve publicly; dead link for every reader.
- Evidence: VERIFIED (curl code 000; other Radar links 200 except hunterswarm.com 401, claude.ai/code 403).
- Fix: reject `.local` and `localhost` origin_url values; link the OpenRouter app page.

**T6 [medium] editorial.** Location: Radar and category tables: "It matters because it provides a dedicated execution layer".
- Problem: nearly every row ends with a templated clause restating the first sentence (Herdr, Superplane, Paperclip, Pi, Thinkrail "personal coding vibes"); mangled names at sentence start ("Pstack-claude", "Andrej-karpathy-skills", "Stop-that-shit"); Orca "a cross-platform platform".
- Evidence: VERIFIED.
- Fix: `summaryRows` prompt: drop the clause; one differentiating fact or "—"; keep repo names as written. Systemic: S7.

**T7 [medium] selection.** Location: "Most discussed": Lobste.rs "0 points, 0 comments", Dev.to "Build in Public", Apollo piece.
- Problem: a leftover bin for stories Jev routed off every daily page, not the week's most discussed. One row has no discussion; two Dev.to rows are career/startup marketing; Apollo is a wealth-manager newsletter; Models Spotted rows with 491 points are excluded by design. Merged cross-page low: the 0/0 Lobste.rs row is ranked among 543- and 451-comment threads.
- Evidence: VERIFIED (spotted-trace: hn:50224463 other 0.99, lobsters:zu7jjb policy 1.0, hn:50180836 other 0.84).
- Reviewers differ on 0/0: cross-page suspects a missing count (10-25 Lobste.rs rows showed counts); Trends found the API now shows score 1, 0 comments, so the story really has almost no discussion. Both can hold.
- Fix: minimum discussion (e.g. 50 comments) and on-audience topic; rank by comments across sources or rename; store counts at first sight and refresh. Systemic: S5.

**T8 [medium] editorial.** Location: "Most discussed" Summary column.
- Problem: raw descriptions: "Subscribe for daily updates.", "Read more on the Peec AI blog.", "..." endings, first-person teasers, and "—" for the most-commented story (DeepSeek ban, 524 comments). PHP2Shell omits CVSS 9.2, the 2026-10-21 patch and "every version since 5.4"; noyb repeats the NGO's loaded framing unattributed, "On Wednesday" undated.
- Evidence: VERIFIED (Wiz post, HN 50154244 at 580/524, Dev.to API).
- Fix: send Most discussed through `summaryRows` with "strip boilerplate, attribute claims, give date and action"; "—" only if no content. Systemic: S1, S9.

**T9 [medium] editorial.** Location: Signals paragraphs 1, 4, 5: "spawns three trending repos", "shifting ... to runtime enforcement".
- Problem: trends the rows cannot carry. Reads 51T tokens as DeepSeek "adoption", ignoring the federal ban (X2) and the price gap (deepseek-v4.1-flash $0.02/M vs glm-5.3-flash $0.15/M, claude-opus-5.5 $4/M); "spawns" for three third-party repos; credits Starnet with a plugin architecture only PI-Desktop has; repeats the Highlights.
- Evidence: VERIFIED for price and Starnet; causal and "runtime enforcement" claims UNVERIFIED.
- Fix: only claims a row supports, no causal verbs, name a counter-signal, give Signals the Most discussed table. Systemic: S2.

**T10 [medium] highlights.** Location: highlights.json ai-trends bullet 2 ("signal rapid adoption of agent-native IDEs and chat-embedded teammates"); bullet 1 ("adds 15K stars").
- Problem: "rapid adoption" inferred from +1,200 on a 2K-star repo (thinkrail 2,160) and +832 on a 1.6K-star repo (switch 1,639); two unrelated repos fused; stronger items missing (51.56T DeepSeek, stablyai/orca +9,622); bullet 1 drops its window. Bullet 1's numbers are right (47,208 stars, +15,072, +47%).
- Evidence: VERIFIED.
- Fix: one subject per bullet, rank by size, no "adoption" from star counts, keep the window. Systemic: S2, S3, S8. See X5.

**T11 [medium] selection / consistency.** Location: Category tables (Coding Agents, Agent Harnesses & Frameworks, Multi-Agent & Orchestration, Agent Tooling): order and missing high-gain repos. Flagged by both Trends and cross-page reviewers.
- Problem: AGENTS.md says rows sort by stars gained in 7 days, but order is not by gain (Coding Agents: +5,921, +1,200, +209, +463, +372, +276, +130, +251; Harnesses: 2987, 736, 1723, 525, 1233, 812, 93, 689). Each table is cut at exactly 8 rows; larger gainers are absent (knowledge-work-plugins +2,790, pingdotgg/t3code +1,770, android/skills +1,070, ragflow +440, QwenPaw +401, superset +209) while Lody (+130), Starnet (+93), happier and nodeterm (+69) appear.
- Evidence: VERIFIED against trending-trace.json; cause UNVERIFIED (threshold, owner exclusion, different sort key, or the Radar `standalone_tool` gate; config.yml not in bundle). Cross-page's gate hypothesis does not explain t3code (standalone 0.65, trending).
- Fix: `composeTrendingReport`: sort by displayed gain or correct AGENTS.md; write `rendered`, `rank`, `dropped_reason` into the trace. Systemic: S11.

**T12 [medium] selection.** Location: Models, "Hugging Face trending" (15 rows).
- Problem: 7 of 15 were on last week's page with no repeat marker (GitHub rows get 🔥); 5 are image/video/speech models; 3 are the same DeepSeek release (base, GGUF, "UNCENSORED-FP8"); HF trending order without a rank column looks random.
- Evidence: VERIFIED.
- Fix: 🔥 rule on HF rows, one row per release, drop uncensored variants, show rank. Systemic: S4.

**T13 [medium] editorial.** Location: HF table Summary: "Multimodal 27B parameter model (Qwen 3.5)" for Qwen3.8-27B; Spark-X2.6-4B "based on Spark 2.5"; MiniMax-M3.1-Flash "(MiniMax M3 VL)"; flint "tagged as flint"; Nanbeige4.3-33B 0 downloads vs 410 likes unremarked.
- Problem: tag paraphrases that contradict names or say nothing (they print `model_type`: `qwen3_5`, `spark2_5`, `minimax_m3_vl`).
- Evidence: VERIFIED (HF API). The cross-page reviewer wrote before the Trends review existed and flagged this as possibly uncovered.
- Fix: the HF table is exempt from LLM summaries, so change the row builder: pipeline tag, parameter count, license or model card first sentence; never print `model_type`.

**T14 [medium] editorial.** Location: Research table: SWE-VERIFIER, PAUSE, MAPS, LLM2Cert rows.
- Problem: paraphrase the method, omit the result (SWE-VERIFIER 75.47% to 77.20% at 1.09x cost, verifies under 4% of steps; PAUSE +16.8%). MAPS ("regulate search momentum") and LLM2Cert are jargon with no payoff; subjects vary.
- Evidence: VERIFIED.
- Fix: one sentence "what it does, headline result", starting with the paper's name. Systemic: S7.

**T15 [medium] accuracy.** Location: Radar Signal column ("30,245/week, 2.3x", "📈 +34%") and Highlights ("holds #2").
- Problem: growth figures lack a baseline and do not reconcile with last week: Claude Code 9.92T to 12.67T is +28%, not +34%; Strix 800.5B to 1.52T is +90%, not +131%; @reason-machines/cli 22,777 to 30,245 is 1.33x, not 2.3x. npm figure has no unit; 🔥/🆕 unexplained; "#2" does not say OpenRouter app ranking; the live ranking holds Hermes Agent (#4), Kilo Code (#5), Codex (#10), Cline (#12), none on the Radar, suggesting an unstated growth filter.
- Evidence: arithmetic VERIFIED against the 10-19 page; baseline and inclusion rule UNVERIFIED. Cross-page found Highlights consistent with tables (internal consistency), which does not contradict this.
- Re-ranked from the reviewer's low because headline Highlights quote +34% and +131%.
- Fix: one-line Radar legend (🔥, 🆕, inclusion rule, "weekly downloads", "vs previous week"); "#2 of OpenRouter apps". Systemic: S8.

**T16 [low] selection.** Location: Research: nnInteractive Agent, Autonomous Investing, LLM2Cert, Optimization Modeling.
- Problem: 4 of 10 papers far from the audience while on-topic papers (SWE-Clar, CuraLoc, 0.85-0.88) exist in today's arxiv-trace.json; the page's papers come from research-state.json.
- Evidence: UNVERIFIED why they rank.
- Fix: raise `about_agents_or_code` (weight 0.2) or add a topical floor.

**T17 [low] accuracy.** Location: Agent Tooling: dsh-TUI "officially recommended terminal UI plugin for DeepSeek Harness"; "zero ptrace overhead" (DSHA); "studio-trusted" (Aura).
- Problem: repo marketing stated as fact; ccch1mneyyy/dsh-TUI is an individual account, not deepseek-ai.
- Evidence: VERIFIED.
- Fix: attribute self-claims or omit. Systemic: S2.

**T18 [low] selection.** Location: "Candidates to track": `infra.repos` block (ruflo, paperclip, hyperframes, DSHA, ...).
- Problem: eight candidates under `infra.repos`, which README scopes to sandboxes, session multiplexers, context tools; hyperframes, open-code-review, ruflo, paperclip do not fit; three lines are DeepSeek Harness clients. YAML is maintainer-facing text on a colleague-facing page.
- Evidence: VERIFIED.
- Fix: map candidates to a section by Jev category, offer "no matching section", collapse the YAML.

**T19 [low] editorial.** Location: Models, OpenRouter usage: "([link](...), [link](...))" on every bullet.
- Problem: no time window or unit in the section; link text "link" 13 times.
- Evidence: VERIFIED.
- Fix: head "tokens in the last 7 days", link the model name. Systemic: S8.

**T20 [low] structure.** Location: Agent Tooling, andrej-karpathy-skills row; header sources line.
- Problem: empty Lang cell leaves `|  |` (GitHub language null); sources line omits anthropics/skills, which feeds a whole section.
- Evidence: VERIFIED.
- Fix: "—" for missing language; add the skills repo. Systemic: S9.

### Cross-page

**X1 [high] coverage.** Location: ai-policy.md (absent); policy-trace.json source mix; coming-up.json.
- Problem: skip follows the rule (0 kept of 99; also 0 of 99 on 10-25), but judged items contain nothing from any EU primary source, nor Tweede Kamer, Internetconsultatie, AP, Regulations.gov, Congress.gov. The only `eu` rows are Politico Europe commentary. Feeds were quiet or failing silently, and the trace cannot tell which. Source counts: Binnenlands Bestuur 54, Digitale Overheid 2, Federal Register 7, Open States 2, Politico Europe 11, Politico US 12, RDI 1, Rijksoverheid 7, Transformer 3. Only 5 of 99 items have `decided: null`; 94 were cached verdicts. The GDPR story on Trends has no policy-trace item. coming-up.json's two "Have your say" entries do not prove the feed works (they come from saved state plus `policy.calendar`).
- Evidence: VERIFIED (counts, jurisdictions); whether any source failed UNVERIFIED (no fetch logs). A feed whose few new items were already kept earlier also yields zero rows.
- Fix: per-source item counts (including zero) in policy-trace.json; check the 10-25 and 10-26 fetch logs now; warn when a primary EU source returns zero judged items for N days. Stage: fetch/sources. Systemic: S11.

**X2 [high] coverage.** Location: ai-trends "Most discussed" row 1 vs Highlights bullet 1 and Signals paragraph 1; policy-trace `us-fr:2026-21447`.
- Problem: the DHS order banning DeepSeek from federal civilian systems is the best-scored policy item of the 99 (relevance 0.853; significance 1.25 at confidence 0.33; impact 0.48 at confidence 0.28; `kept:false`; Politico "DeepSeek barred from government agency IT systems" 0.675, kept false). It has appeared on no daily page and reaches the reader only as the top Most discussed row ("578 points, 543 comments | —", Reuters link dated 2026-10-19), no summary. The Trends narrative that DeepSeek "leads across usage and infrastructure" never mentions it. The drop fits "US items also need an impact on the reader", but impact rests on a 0.28-confidence score.
- Evidence: VERIFIED.
- Reviewers differ: cross-page rated it medium. Re-ranked to high because the scale counts a missing major item as high and the Trends DeepSeek story is one-sided without it. It does reach the reader once, which is why it is not a plain omission.
- Fix: treat a low-confidence impact score as unknown, not none, for items with significance >= 1; send to News & commentary or a Spotted row; give Signals the Most discussed table. Systemic: S6.

**X3 [medium] coverage.** Location: ai-trends "Most discussed" rows 6 (noyb) and 1; spotted-trace.json and previous trace.
- Problem: policy-topic stories are dropped from Spotted even when no policy page exists. The EU GDPR/AI story (lobsters:zu7jjb, policy 1.0, `shown:false`, `page:null`, decided 2026-10-24) is shown nowhere and first reaches a reader on the weekly page with "0 points, 0 comments". The same trace holds "Meta says if its AI makes a mistake, it will legally be the customer's fault" (policy, not shown).
- Evidence: VERIFIED (AGENTS.md: `PAGE_OF_TOPIC` drops policy and other).
- Fix: when the policy page is skipped (or always), keep policy-topic stories in a Spotted table on ai-models or ai-agents, or add a "Policy talk" line to the overview. Systemic: S5.

**X4 [medium] coverage.** Location: ai-trends "Most discussed" row 7 (Dev.to, OpenShell) vs ai-agents Agent Tooling (OpenShell in the Quiet line); previous spotted-trace.json.
- Problem: a story about a tracked infra project (devto:4904813, agents 0.99, `shown:false`, `page:"agents"`) was cut on 2026-10-25, is absent from today's trace (left the fresh pool), and surfaces only in weekly Most discussed while the agents page calls OpenShell "quiet". The title lacks "OpenShell"; only the description has it. Trends Signals then cites OpenShell as "community-discussed".
- Evidence: VERIFIED; title-only matching in `matchProjectNews` UNVERIFIED.
- Fix: check whether `matchProjectNews` is title-only and match title plus description; keep cap-cut stories eligible next day. Systemic: S4.

**X5 [medium] balance.** Location: highlights.json (front page) vs each page's Highlights.
- Problem: the overview picks weaker entries than pages lead with. Trends omits its two lead bullets (DeepSeek 51.56T tokens; Claude Code #2 +34%) for two star-growth items on small bases (thinkrail 1,964 stars). Models omits the day's biggest thread (CNN, 491 points, 222 comments) for price-cut and Cerebras items (213 and 354 points); both Models entries are community links. The policy slot is empty.
- Evidence: VERIFIED.
- Fix: `regen-highlights`/json call: require entries from the page's first two bullets, or at least bullet 1. Systemic: S3.

**X6 [low] consistency.** Location: all four pages (conventions).
- Problem: (1) "1 comments" in ai-agents ("10 points, 1 comments") and ai-models ("9 points, 1 comments"); (2) banner order: ai-agents and ai-data "Generated" first, ai-models last; (3) Trends Highlights use bold, others do not; (4) ai-data has no blank line after `## Highlights` (same on 10-25); (5) `**Release**:` today vs `**Release:**` yesterday (OpenShell, Agent Deck); (6) ai-models `## 🕵️ Stealth Models on OpenRouter` is the only heading with an emoji (AGENTS.md documents 🆕/⏳ as row markers). Items 3-4 may be intentional.
- Evidence: VERIFIED; whether the heading emoji is intentional in `strings.ts` UNVERIFIED.
- Fix: pluralise; one banner template; shared Highlights list rules; drop or document the heading emoji (`buildStealthSection`). Systemic: S10.

**X7 [low] balance.** Location: spotted-trace.json topic mix.
- Problem: 32 of 45 judged stories (71%) are `other` and never shown, including an AI-and-work/economy cluster (Apollo "zero financial payoff", "If AI displaces human workers", "AI didn't cause the tech jobs bust", "Why I'm Short the AI Buildout") and the AI-found PHP RCE (452 points, other 0.81, plus NL NCSC and RDI advisories). Weekly Most discussed is the only place they surface.
- Evidence: VERIFIED (agents 8, models 5, other 32).
- Fix: add topics for AI economy/labor and security incidents, or an "Also talked about" line on Wednesday and Friday. Systemic: S5.

**X8 [low] docs.** Location: AGENTS.md line 167 vs policy-trace.json.
- Problem: AGENTS.md says Open States "has never returned a live response", yet the trace has two Open States items. The doc is stale or the items come from elsewhere.
- Evidence: VERIFIED (I read the sentence at line 167; the trace count is the cross-page reviewer's).
- Fix: update AGENTS.md if Open States now responds.

## Not checked

**ai-agents**
- HN counts for the other six Spotted rows (daily drift) and the Dev.to reaction count.
- The CowAgent site (cowagent.ai).
- The OpenCode Trending period (daily trending snapshot of Oct 26 not recoverable).
- Whether Command Code PR #5955 existed at 04:31 UTC; whether the Agent Deck release body the model saw was truncated (no LLM input log).
- Why the Spotted summaries fell back to raw descriptions (no LLM stats or log).

**ai-models**
- Whether Anthropic or OpenAI published new posts on 24-26 Oct (Lab posts: 0 two days running): sitemaps carry `lastmod` for every URL and there is no labs-state.json, so "new" cannot be reproduced.
- OpenRouter catalog and stealth models: no catalog snapshot.
- Whether the Spotted summaries LLM call actually failed (no run log).
- CNN, Cerebras and price-cut details were read through WebFetch's summarizer, not raw HTML; the meta-description comparison used raw HTML via curl.

**ai-data**
- HN / Lobste.rs recall for data-stack stories in the last 24h: HN Algolia returned no usable response; trending-matches.json not in the folder.
- Why the Iceberg recompact note has keyword.keep false: config.yml (keywords) not in the folder.
- Vendor feeds for Azure Databricks, Fabric, Azure updates, BigQuery not fetched; only traced items were read, so a fetch-stage miss cannot be ruled out.
- Hot issues or news on the 16 quiet repos (only releases checked).
- Snowflake feature policy availability beyond the release note and user guide (neither states it).

**ai-trends**
- Whether OpenRouter token figures are 7-day totals: payload rows are dated single days (2026-10-25; the minimax-m3.1-flash free-variant row, 13.68T, is dated 2026-10-22 in a different block), so the "weekly" label and that row's comparability are unconfirmed.
- Reuters article body (401), claude.ai/code and the npm page (403), hunterswarm.com (401); the Reuters claim is taken from the HN title only.
- Why specific papers entered research-state.json: only today's 100-paper arxiv-trace.json is available.
- Why the Radar has no new GitHub repos this week (last week had eight): the trace cannot tell a quiet week from a threshold change.
- Radar rows HunterSwarm, OpenPAVE, Real-SWE, Proto Agent, ZCode beyond HTTP status.
- The NVIDIA OpenShell article body beyond its description (the Z3/SMT claim is the article's own description).

**cross-page**
- Pages for 2026-10-20 to 10-24 (only 10-19 and 10-25 available), so repeats across the full week of Most discussed are only partly verified.
- config.yml and src/: the cause of the Trends table cut and order, the Spotted cap value (`SPOTTED_PER_SOURCE`), and data/policy thresholds were inferred from traces and AGENTS.md.
- Policy and other fetch logs; whether any EU source actually failed.
- Whether the Snowflake items are GA as the Data Highlights say. The ai-data reviewer checked: release notes give no status (D1).
- HN, Dev.to and Lobste.rs counts; OpenRouter and GitHub figures against sources.
- Research table selection against research-state.json (today's arxiv-trace is not in the table by design; 10-25's trace had zero papers).
- Hot-issue ages and whether the OpenCode issues changed since 10-25. The ai-agents reviewer checked: both closed Oct 25 (A2).
- Overview rendering of coming-up.json entries whose `page` is `ai-policy` when that page does not exist; gutter rendering of the Highlights (see D11).
- Per-page wording, link correctness and row summaries (page reviewers). The cross-page reviewer saw no Trends review at write time; the Trends reviewer has since covered HF summaries (T13) and the other row-level problems.
- Cross-page tool budget: about 35 calls against 25.

**Aggregation**
- I did not reopen pages beyond the cited checks (AGENTS.md lines 158, 167, 183, 200; "+" bullets in all four .md files). Page-level numbers (counts, arithmetic, source quotations) are the reviewers' and were not re-verified.