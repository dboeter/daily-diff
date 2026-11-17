# Check of claude_opus_5_5-low-v1 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 12 major, 8 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 45 | 30 | 12 | 1 | 2 | 8 | 7 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 10 | 5 | 2 | 3 | 0 | 4 | 1 |

## The judge's coverage

- Sentences: the judge gave 55 verdicts; code counts 55 sentences.
- Sentence starts found in the article: 55 of 55.
- Quotes found word for word in the reference: 54 of 54.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 1. "Anthropic's Claude Fable 5.2 became the …" (fact; partly, major): The release makes Fable 5.2 the default Fable model, not Claude Code's default model overall. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model"
- 3. "On the data side, Azure Databricks …" (fact; unverifiable, minor): The dates and retirement notices are supported, but the reference identifies the transparency guidelines as a preparatory document, not explicitly a draft; their text is missing. Source: "shown under AI Policy › EU · stage: Preparatory document"
- 4. "Claude Code v2.1.321–v2.1.322 made Claude Fable …" (fact; partly, major): Fable 5.2 became the default Fable model, not the default model overall. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model — 1M context, $8/$40 per Mtok with $0.20/Mtok cache reads"
- 5. "The same releases fixed regressions including …" (fact; partly, minor): The fixes are documented, but the reference does not establish that these defects were regressions. Source: "Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them"
- 9. "Several problems were reported after the …" (fact; partly, major): This framing includes the Team usage report, which was published November 5 and concerns November 4–5, before the November 9 model change. Source: "kind: hot-issue · source: anthropics/claude-code · published: 2026-11-05 · link: https://github.com/anthropics/claude-code/issues/107390"
- 10. "Telemetry and the model picker: users …" (fact; partly, minor): The reference supplies one reporter's account, not reports from multiple users. Source: "The case I hit: with `"env": {"DISABLE_TELEMETRY": "1"}` in `~/.claude/settings.json`, the `/model` picker does not offer Fable 5.2."
- 11. "Team usage limits: users report weekly …" (fact; partly, major): One Team subscriber reported this specific timing, and said there was no intentional workflow change; the sentence generalizes the report and removes that qualification. Source: "my entire weekly allowance was exhausted in approximately **30 hours and 31 minutes**, despite no intentional change to my development workflow."
- 13. "Outage: on 2026-11-14 the status page …" (fact; partly, major): November 14 is the digest date; the status-page story was published November 13. The reference does not establish confirmation on November 14. Source: "kind: story · source: Hacker News · published: 2026-11-13 · link: https://status.claude.com/incidents/nn11wk485zfn"
- 14. "That same day, v2.1.325 fixed a …" (fact; partly, major): The fix is supported, but v2.1.325 was published November 13, not November 14 as 'that same day' asserts. Source: "kind: release · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.325"
- 15. "A default-model change combined with reported …" (interpretation, italic; partly, major): The premise overstates the default-model change and links it to a Team usage report that predates it; the reference does not establish that connection. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model"
- 23. "Default external access, 2026-12-10: starting on …" (fact; partly, minor): Drops the limitation to eligible workspaces. Source: "Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled."
- 26. "Databricks calls this a breaking change. …" (fact; unsupported, major): The reference does not attribute the description 'breaking change' to Databricks; the digest places the item under Action required. Source: "shown under Data Engineering › Action required"
- 28. "Databricks says this cuts cost by …" (fact; partly, minor): Drops the internal-benchmark qualification on the cost reduction. Source: "It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds."
- 30. "Two retirements and an endpoint shutdown …" (interpretation, italic; unsupported, major): The two retirements are November 19 and February 4, not within one month. These notices also do not establish a lasting pattern of short endpoint lifecycles. Source: "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027."
- 31. "The planned default for external access …" (interpretation, italic; unsupported, major): Enabling external client access does not establish a change in who is authorized to write; the reference explicitly retains access controls and requires catalog commits for writes. Source: "Creating and writing managed Delta tables requires catalog commits. Metastore external data access settings and Unity Catalog privileges continue to control access."
- 33. "Another Hermes issue says the Desktop …" (fact; partly, minor): The report says the server admits relayed Desktop messages under the shared identity, not that the Desktop app performs admission. Source: "server dashboard-auth.log mints ws tickets WITH the correct user_id, but every chat message is admitted as principal "uid:10000"."
- 35. "Static provider credentials now need explicit …" (fact; partly, major): Overgeneralizes the placement requirement: credentials without placement metadata still resolve in the Authorization header or through explicitly enabled rewrite policies. Source: "Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies, so custom headers such as `x-api-key`, query parameters, and path slots need an explicit placement declaration."
- 47. "The model table suggests the heaviest …" (interpretation, italic; unsupported, major): The reference supplies token volumes but no prices or classification establishing that these leading models are low-cost rather than frontier models. Source: "Top models by tokens (prompt + completion) on OpenRouter on 2026-11-15, one day's snapshot."
- 48. "The Commission published draft guidelines on …" (fact; unverifiable, minor): Publication and preparatory-document status are supported, but that status alone does not establish that the guidelines are a draft; the document text is missing. Source: "shown under AI Policy › EU · stage: Preparatory document"
- 54. "Guidance published weeks before the Art. …" (interpretation, italic; partly, minor): The 20-day interval is correct, but it does not establish how much prior notice or access to the transparency rules affected clients had. Source: "kind: policy-item · source: EUR-Lex · published: 2026-11-12 · link: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005"

## Supported sentences to read by hand (seeded sample of 8)

- 7. "An analysis reports a score of …" (fact; supported): — Source: "Claude Fable 5.2 scores 65 on Artificial Analysis, highest so far"
- 16. "The silent removal is worth watching …" (interpretation, italic; supported): — Source: "A configured command simply stops running, and users find out when their agent panel goes blank."
- 19. "The Genie One MCP Beta endpoint …" (fact; supported): — Source: "The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026"
- 20. "After that date, requests fail. …" (fact; supported): — Source: "after which requests fail"
- 32. "An open Hermes Agent issue says …" (fact; supported): — Source: "These snapshots persist at `cache/terminal/hermes-snap-*.sh` and contain plaintext credential values."
- 40. "Among OpenRouter apps, Kilo Code ran …" (fact; supported): — Source: "week #5 / month #5, 7.03T tokens/week (+46% vs previous week)"
- 50. "On the same date, bans on …" (fact; supported): — Source: "AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends"
- 55. "The liability motion is worth watching, …" (interpretation, italic; supported): — Source: "Motie van het lid Dassen over een juridisch kader voor de aansprakelijkheid bij schade van AI-modellen"
