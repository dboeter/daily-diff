# Check of claude_opus_5_5-low-v1 for 2026-11-16

Judge: claude-opus-5-5 at high effort, rubric j2, against source-raw2.md.

Flags: 9 major, 10 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 45 | 32 | 11 | 2 | 0 | 7 | 6 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 10 | 4 | 6 | 0 | 0 | 2 | 4 |

## The judge's coverage

- Sentences: the judge gave 55 verdicts; code counts 55 sentences.
- Sentence starts found in the article: 55 of 55.
- Quotes found word for word in the reference: 53 of 53.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 1. "Anthropic's Claude Fable 5.2 became the …" (fact; partly, major): The release made Fable 5.2 the default Fable model, not the default model of Claude Code. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model"
- 4. "Claude Code v2.1.321–v2.1.322 made Claude Fable …" (fact; partly, major): Only v2.1.321 added Fable 5.2; v2.1.322 added fast mode on Vertex. The model became the default Fable model, not the default model. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model — 1M context, $8/$40 per Mtok"
- 5. "The same releases fixed regressions including …" (fact; partly, minor): The fix is in v2.1.321 only. The notes do not call these fixes regressions. Source: "Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them"
- 9. "Several problems were reported after the …" (fact; partly, major): The Team usage issue listed below was filed on 2026-11-05, before Fable 5.2 shipped on 2026-11-09, so not every problem was reported after the switch. Source: "kind: hot-issue · source: anthropics/claude-code · published: 2026-11-05 · link: https://github.com/anthropics/claude-code/issues/107390"
- 10. "Telemetry and the model picker: users …" (fact; partly, minor): One user filed this issue; 'users report' widens the attribution. Source: "`DISABLE_TELEMETRY=1` does more than disable telemetry. It stops Claude Code from downloading feature flags"
- 11. "Team usage limits: users report weekly …" (fact; partly, minor): Single reporter, not 'users'. The 'intentional' qualifier is dropped: the reporter says no intentional workflow change. Source: "despite no intentional change to my development workflow"
- 13. "Outage: on 2026-11-14 the status page …" (fact; partly, major): Wrong date: the elevated-errors incident item is dated 2026-11-13. Source: "kind: story · source: Hacker News · published: 2026-11-13 · link: https://status.claude.com/incidents/nn11wk485zfn"
- 14. "That same day, v2.1.325 fixed a …" (fact; partly, major): 'That same day' points to 2026-11-14 as given in the previous sentence, but v2.1.325 was published 2026-11-13. The fix itself is supported. Source: "kind: release · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.325"
- 15. "A default-model change combined with reported …" (interpretation, italic; partly, major): Built on a wrong premise: Fable 5.2 became the default Fable model, not the default model. It also links the Team usage report to the switch, though that report predates it, and generalises one user's Team subscription to teams that 'share Team plans'. Source: "now the default Fable model"
- 23. "Default external access, 2026-12-10: starting on …" (fact; partly, minor): Drops 'eligible': only eligible compliance-profile workspaces get the default. Source: "external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled"
- 26. "Databricks calls this a breaking change. …" (fact; unsupported, major): The note never calls the upgrade a breaking change; it describes what catalog commits enable. Source: "This enables multi-statement, multi-table transactions, writes from external engines, and consistent governance across all engines."
- 28. "Databricks says this cuts cost by …" (fact; partly, minor): Drops 'in internal benchmarks' and 'routing' (it is p90 routing latency). 'This' also ties the savings to the subagent-only change, which the note does not do. Source: "It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds."
- 30. "Two retirements and an endpoint shutdown …" (interpretation, italic; partly, major): The dates do not fall inside one month: Gemini 3.6 Flash on 2026-11-19, Genie MCP on 2026-11-30, GLM 5.2 on 2027-02-04. It also reads a lasting 'short cycles' trend from one week's notes. Source: "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027."
- 31. "The planned default for external access …" (interpretation, italic; partly, minor): The note says privileges still control access. The change lets supported external clients write by default; it does not change who can write. Source: "Metastore external data access settings and Unity Catalog privileges continue to control access."
- 35. "Static provider credentials now need explicit …" (fact; partly, minor): Overstates the scope. Credentials without placement still resolve in the Authorization header; only custom headers, query parameters and path slots need an explicit placement. Source: "Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies"
- 39. "This suggests secret handling is where …" (interpretation, italic; partly, minor): Generalises from three items in one week to where agent runtimes are being hardened.
- 45. "Two Anthropic models sat at 6 …" (fact; unsupported, major): Wrong count: three Anthropic models are in the top 20, at #6 (Opus 5.5), #18 (Haiku 5.5) and #19 (Sonnet 5.5). Source: "anthropic/claude-haiku-5.5-20261007"
- 47. "The model table suggests the heaviest …" (interpretation, italic; partly, minor): The table gives no prices, so 'low-cost' is not in the reference. It is also a one-day snapshot. Source: "one day's snapshot"
- 54. "Guidance published weeks before the Art. …" (interpretation, italic; partly, minor): The reference does not say what Art. 50(2) covers, so tying it to 'generative features' goes beyond the source. The guidance is also only a preparatory document. Source: "kind: policy-item · source: EUR-Lex · published: 2026-11-12"

## Supported sentences to read by hand (seeded sample of 8)

- 6. "Anthropic released Claude Fable 5.2 and …" (fact; supported): — Source: "Claude Fable 5.2 and Claude Mythos 5.2, our new models for the hardest technical challenges."
- 12. "Removed status line: an issue says …" (fact; supported): — Source: "Regression: 2.1.323 silently removed `subagentStatusLine`, with no reason, no replacement and no migration path"
- 18. "On 2026-11-19, API calls to it …" (fact; supported): — Source: "Starting on that date, API calls to Gemini 3.6 Flash will be automatically redirected to Gemini 3.8 Flash at the same price."
- 19. "The Genie One MCP Beta endpoint …" (fact; supported): — Source: "reaches end of life on November 30, 2026, after which requests fail"
- 29. "Smart Routing for Codex is paused. …" (fact; supported): — Source: "Smart Routing for Codex is paused."
- 40. "Among OpenRouter apps, Kilo Code ran …" (fact; supported): — Source: "week #5 / month #5, 7.03T tokens/week (+46% vs previous week)"
- 50. "On the same date, bans on …" (fact; supported): — Source: "AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends"
- 55. "The liability motion is worth watching, …" (interpretation, italic; supported): — Source: "Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027"
