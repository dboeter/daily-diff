# Check of claude_opus_5_5-low-v1 for 2026-11-16

Judge: Codex CLI (its configured model and effort), rubric j2, against source-raw2.md.

Flags: 12 major, 6 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 45 | 32 | 10 | 1 | 2 | 7 | 6 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 10 | 5 | 1 | 4 | 0 | 5 | 0 |

## The judge's coverage

- Sentences: the judge gave 55 verdicts; code counts 55 sentences.
- Sentence starts found in the article: 55 of 55.
- Quotes found word for word in the reference: 55 of 55.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 1. "Anthropic's Claude Fable 5.2 became the …" (fact; partly, major): The release made Fable 5.2 the default Fable model, not Claude Code's default model overall. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model"
- 3. "On the data side, Azure Databricks …" (fact; unverifiable, minor): The deadlines are supported, but the transparency document is identified as preparatory, not explicitly as draft guidance; its text is missing. Source: "digest: shown under AI Policy › EU · stage: Preparatory document"
- 4. "Claude Code v2.1.321–v2.1.322 made Claude Fable …" (fact; partly, major): Fable 5.2 became the default Fable model, not the default model overall; the context and prices are supported. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model — 1M context, $8/$40 per Mtok with $0.20/Mtok cache reads"
- 9. "Several problems were reported after the …" (fact; partly, major): The ensuing list includes the Team usage report published November 5, before the November 9 model change. Source: "kind: hot-issue · source: anthropics/claude-code · published: 2026-11-05 · link: https://github.com/anthropics/claude-code/issues/107390"
- 10. "Telemetry and the model picker: users …" (fact; partly, minor): The reference supplies one reporter's account, not reports from multiple users. Source: "The case I hit: with `"env": {"DISABLE_TELEMETRY": "1"}` in `~/.claude/settings.json`, the `/model` picker does not offer Fable 5.2."
- 11. "Team usage limits: users report weekly …" (fact; partly, minor): The reference documents one account and says there was no intentional workflow change, rather than establishing no change at all. Source: "my entire weekly allowance was exhausted in approximately **30 hours and 31 minutes**, despite no intentional change to my development workflow."
- 13. "Outage: on 2026-11-14 the status page …" (fact; partly, major): The status-page item was published November 13; November 14 is the digest date. Source: "kind: story · source: Hacker News · published: 2026-11-13 · link: https://status.claude.com/incidents/nn11wk485zfn"
- 14. "That same day, v2.1.325 fixed a …" (fact; partly, major): The fix is supported, but v2.1.325 was published November 13, not the November 14 date asserted in the preceding sentence. Source: "kind: release · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.325"
- 15. "A default-model change combined with reported …" (interpretation, italic; unsupported, major): The reading relies on an overall default-model change that the reference does not establish and connects it to a Team usage report that predates the release. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model"
- 23. "Default external access, 2026-12-10: starting on …" (fact; partly, minor): The sentence drops the restriction to eligible workspaces. Source: "Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled."
- 26. "Databricks calls this a breaking change. …" (fact; unsupported, major): The reference does not attribute the description 'breaking change' to Databricks. Source: "With catalog commits, Unity Catalog becomes the system of coordination for your tables."
- 28. "Databricks says this cuts cost by …" (fact; partly, minor): The cost reduction is qualified as a result from internal benchmarks. Source: "It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds."
- 30. "Two retirements and an endpoint shutdown …" (interpretation, italic; unsupported, major): The two retirements are November 19 and February 4, not within one month; those dates also do not establish short endpoint turnover cycles. Source: "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027."
- 31. "The planned default for external access …" (interpretation, italic; unsupported, major): The reference changes external-access availability, not who has write privileges; it explicitly retains existing access controls. Source: "Metastore external data access settings and Unity Catalog privileges continue to control access."
- 35. "Static provider credentials now need explicit …" (fact; partly, major): Explicit placement is required for nondefault locations, not all static credentials; Authorization-header resolution remains available without placement metadata. Source: "Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies, so custom headers such as `x-api-key`, query parameters, and path slots need an explicit placement declaration."
- 47. "The model table suggests the heaviest …" (interpretation, italic; unsupported, major): The table gives token volumes but no prices or classification separating low-cost models from frontier models. Source: "Top models by tokens (prompt + completion) on OpenRouter on 2026-11-15, one day's snapshot."
- 48. "The Commission published draft guidelines on …" (fact; unverifiable, minor): Preparatory status is supported, but the reference does not explicitly identify the guidelines as a draft and supplies no document text. Source: "digest: shown under AI Policy › EU · stage: Preparatory document"
- 54. "Guidance published weeks before the Art. …" (interpretation, italic; partly, major): The 20-day interval is correct, but it does not establish that EU clients with generative features will face these duties with little reading time; applicability and their prior preparation are not given. Source: "| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends]"

## Supported sentences to read by hand (seeded sample of 8)

- 6. "Anthropic released Claude Fable 5.2 and …" (fact; supported): — Source: "Claude Fable 5.2 and Claude Mythos 5.2, our new models for the hardest technical challenges."
- 12. "Removed status line: an issue says …" (fact; supported): — Source: "Regression: 2.1.323 silently removed `subagentStatusLine`, with no reason, no replacement and no migration path"
- 18. "On 2026-11-19, API calls to it …" (fact; supported): — Source: "Starting on that date, API calls to Gemini 3.6 Flash will be automatically redirected to Gemini 3.8 Flash at the same price."
- 19. "The Genie One MCP Beta endpoint …" (fact; supported): — Source: "The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026"
- 32. "An open Hermes Agent issue says …" (fact; supported): — Source: "These snapshots persist at `cache/terminal/hermes-snap-*.sh` and contain plaintext credential values."
- 39. "This suggests secret handling is where …" (interpretation, italic; supported): — Source: "AWS SigV4 signing diagnostics no longer appear in supervisor TRACE logs, where they could expose the temporary session token."
- 50. "On the same date, bans on …" (fact; supported): — Source: "| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends]"
- 55. "The liability motion is worth watching, …" (interpretation, italic; supported): — Source: "Motie van het lid Dassen over een juridisch kader voor de aansprakelijkheid bij schade van AI-modellen"
