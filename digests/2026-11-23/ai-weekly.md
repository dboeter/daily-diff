# Weekly Diff 2026-11-23

[⬛ Overview](https://dboeter.github.io/daily-diff/#2026-11-23) · [🟪 AI Agents](https://dboeter.github.io/daily-diff/#2026-11-23/ai-agents) · [🟦 AI Models & Labs](https://dboeter.github.io/daily-diff/#2026-11-23/ai-models) · [🟧 AI Policy](https://dboeter.github.io/daily-diff/#2026-11-23/ai-policy) · [🟨 Data Engineering](https://dboeter.github.io/daily-diff/#2026-11-23/ai-data) · **⬜ Weekly Diff** · [🟫 Trends](https://dboeter.github.io/daily-diff/#2026-11-23/ai-trends)

> Items: 376 | Sources: the pages of 2026-11-17 to 2026-11-23 | Written by claude-opus-5-5 | Text in italics is interpretation | Generated: 2026-11-23 07:21 UTC

---

OpenAI's [GPT-6.2 Astra](https://openrouter.ai/openai/gpt-6.2-astra) and Sol reached coding agents this week, and two agents made Sol their default selection. Several reports this week concerned prompts leaking from inference providers, including a [Together AI](https://www.together.ai/blog/security-event-prompt-leakage-for-requests-in-june-and-july-of-2026) notice to customers about prompts sent to its serverless inference service in June and July 2026. On the data side, Azure Databricks [retired Gemini 3.6 Flash](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-is-retired) on 2026-11-19 and set further retirement dates, while Databricks and Snowflake changed several defaults.

## GPT-6.2 in the coding agents

OpenRouter's listing calls [GPT-6.2 Sol](https://openrouter.ai/openai/gpt-6.2-sol) an upgrade to GPT-6.1 Sol, positioned below GPT-6.2 Astra in the series. [Codex 0.171.0](https://github.com/openai/codex/releases/tag/rust-v0.171.0) added both models to its catalogs, with Sol as the default catalog selection. [Pi v1.6.0](https://github.com/earendil-works/pi/releases/tag/v1.6.0) made GPT-6.2 Sol the default for its `openai`, `azure` and `openai-codex` providers instead of GPT-6.1 Sol, at the same price. It also notes that both models reject reasoning effort `none` and `minimal`, so thinking level `off` is unavailable.

Caching needed a fix. [OpenCode v2.3.2](https://github.com/anomalyco/opencode/releases/tag/v2.3.2) says GPT-6.2 models don't cache a system prompt sent in the Responses `instructions` field, so every step re-billed it as uncached input. OpenCode now sends that prompt as a leading developer message. By its own figure, uncached input per step on GitHub Copilot `gpt-6.2-sol` dropped from about 14,000 tokens to 3. [Oh My Pi v19.1.0](https://github.com/can1357/oh-my-pi/releases/tag/v19.1.0) now sends GPT-6.2 system prompts as leading developer messages through third-party Responses proxies.

Not every path works yet. An [Oh My Pi issue](https://github.com/can1357/oh-my-pi/issues/19578) reports GPT-6.2 Sol missing from its Codex model list and rejected with `model_not_found`, while the native Codex CLI works. The reporter writes that the cause is not established.

In OpenRouter's one-day snapshot of top models on 2026-11-22, [openai/gpt-6.1-sol-20260929](https://openrouter.ai/openai/gpt-6.1-sol-20260929) fell to #19 from #10 the week before. [tencent/hy4-flash-20261116](https://openrouter.ai/tencent/hy4-flash-20261116) entered the table at #4 with 10.21T tokens.

Separately, an [issue on Claude Code](https://github.com/anthropics/claude-code/issues/110480) reports premium Team and Enterprise seats using up their limits about 3–5x faster on non-Fable models since roughly the week of 2026-11-09. The reporter says everyone in their organization on premium seats sees the same drop.

*The OpenCode figure suggests that, for GPT-6.2, where a harness places the system prompt can decide most of the per-step input bill. Harnesses that pass it in `instructions` are worth checking. The GPT-6.1 Sol drop is a single day's figure, and whether GPT-6.2 takes over that traffic is worth watching.*

## Prompts leaking from inference providers

OpenRouter [says it off-boarded three providers](https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/). It also removed 125 endpoints from Zero Data Retention eligibility and notified potentially affected customers, after canary token research on inference providers. In a separate write-up, [Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens) says it seeded two million AI prompts with canary tokens. It reports finding three provider breaches, prompt theft and ignored Zero Data Retention settings.

The package supply chain also had an incident. Socket's [write-up on agent-framework](https://socket.dev/blog/agent-framework-pypi-package-compromised-with-credential-stealer) says compromised versions 1.26.1 and 1.26.2 on PyPI use `.pth` startup hooks to exfiltrate Azure, GitHub Actions and CI/CD credentials.

Disclosure timelines are also changing. [Anthropic](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines) says frontier models have become much better at discovering vulnerabilities. It is shortening its disclosure window from 90 days to 30 days for high- and critical-severity issues, and to 45 days for all others. The new timelines apply to vulnerabilities reported on or after 2027-01-01.

*This suggests Zero Data Retention eligibility is a per-endpoint status that can change while a client relies on it. For EU work built on it, the list of eligible endpoints is worth watching. From 2027, Anthropic's shorter windows would also leave maintainers less time between a report and its disclosure.*

## Retirements and changed defaults in data platforms

The [Genie One MCP Beta endpoint](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint) at `/api/2.0/mcp/genie` reaches end of life on 2026-11-30, after which requests fail. Its replacement is the `system.ai.genie_one_mcp` MCP in Unity Gateway. Azure Databricks retires [GPT-5 and GPT-5 mini](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gpt-5-and-gpt-5-mini-will-be-retired-on-december-11-2026) on 2026-12-11 and recommends GPT-6.1 Sol and GPT-6.1 Terra as replacements.

Several query and streaming results will change:

- **`array_contains`:** Starting on or after 2027-01-15, with ANSI mode enabled in Databricks Runtime 19 and above, [`array_contains`](https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-breaking-change-array_contains-with-a-constant-empty-array-will-return-null-for-a-null-value) will return NULL instead of false for a constant empty array and a NULL value. As a result, `NOT array_contains` will no longer match those rows.
- **Streaming watermarks:** In [Databricks Runtime 19](https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-16-2026), new streaming queries in real-time mode use real-time watermark propagation by default, so state is evicted sooner. Queries restarted from an existing checkpoint keep their original behavior.
- **Output policies:** [Model output policies](https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#evaluate-streaming-responses-incrementally-with-service-policies-beta) now default to streaming evaluation, including existing policies, and released text can't be recalled. This feature is in Beta.
- **Snowflake dynamic tables:** Snowflake's [AUTO refresh mode for dynamic tables](https://docs.snowflake.com/en/release-notes/2026/other/2026-11-20-dynamic-tables-auto-resolves-to-adaptive) now resolves to ADAPTIVE instead of INCREMENTAL when the definition supports incremental refresh.

[Dagster 1.13.31](https://github.com/dagster-io/dagster/releases/tag/1.13.31) also has a breaking change: its Claude Code plugin no longer reads `DAGSTER_CLOUD_MCP_URL`. Organizations in the EU region must add the EU server directly, or the plugin connects to the US server and authentication fails.

*Several of these changes alter results without raising an error: a NULL in place of false, earlier state eviction, and streamed text that can't be recalled. Those are the changes a test suite is least likely to flag. The Dagster change is the one that directly affects EU-region setups.*

## EU and Dutch regulators

The Commission [is collecting feedback](https://digital-strategy.ec.europa.eu/en/news/commission-seeks-feedback-draft-template-fundamental-rights-impact-assessment-under-ai-act) on a draft template for a questionnaire. The template is meant to help certain deployers of high-risk AI systems prepare a fundamental rights impact assessment under Article 27 of the AI Act. For 2026-12-02, the [AI Act timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) lists bans on sexual deepfakes and CSAM generators, and the end of the Art. 50(2) transition.

The [Autoriteit Persoonsgegevens](https://autoriteitpersoonsgegevens.nl/actueel/ap-raadt-aankoop-ai-camerabrillen-af-ernstige-risicos-voor-gebruikers-en-omstanders) advises consumers against buying AI camera glasses for general use. In its own study of six such glasses, one wrongly said an ambulance was on its way during a simulated resuscitation. The AP also found security problems in the software.

Politico Europe reports that an [Irish regulator stopped X](https://www.politico.eu/article/x-stops-training-ai-with-agents-data-after-ireland-intervened/?utm_source=RSS_Feed&utm_medium=RSS&utm_campaign=RSS_Syndication) from training AI with data gathered by agents. The regulator says it has significant concerns about personal data being collected by AI agents. In the Tweede Kamer, an amended [motion](https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z25300&did=2026D58461) asks for an inventory of what is needed to supervise the AI Act.

*The Irish case and the AP study both concern data that agents or devices collect about people other than the user. This suggests that is where regulator attention fell this week for agent projects at EU clients.*

---
*This digest is auto-generated by [Daily Diff](https://github.com/dboeter/daily-diff).*