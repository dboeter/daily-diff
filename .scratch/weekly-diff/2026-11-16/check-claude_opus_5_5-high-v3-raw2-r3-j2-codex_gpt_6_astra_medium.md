# Check of claude_opus_5_5-high-v3-raw2-r3 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 2 major, 2 minor. Unmarked interpretation: 0. Italic fact: 1.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 46 | 43 | 3 | 0 | 0 | 2 | 1 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 8 | 7 | 1 | 0 | 0 | 0 | 1 |

## The judge's coverage

- Sentences: the judge gave 54 verdicts; code counts 58 sentences.
- Sentence starts found in the article: 54 of 54.
- Quotes found word for word in the reference: 54 of 54.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 14. "An issue reports that this leaves …" (fact; partly, minor): The issue says this was the only place to see these details per running subagent at a glance; the sentence drops that scope. Source: "`subagentStatusLine` was the **only** place in Claude Code where a user could see, per running subagent, at a glance:"
- 31. "Separately, external access to Unity Catalog …" (fact; partly, major): The source says external access will be available by default, with metastore settings and privileges still controlling access; 'on by default' implies access is automatically enabled. Source: "Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled. Supported external Delta clients can create, read, and write Unity Catalog managed Delta tables. Creating and writing managed Delta tables requires catalog commits. Metastore external data access settings and Unity Catalog privileges continue to control access."
- 34. "The 2026-11-19 and 2026-11-30 dates fall …" (fact, italic; supported): — Source: "ends: 2026-11-30"
- 52. "At EU level, Finland and Estonia …" (fact; partly, major): The sentence presents the call directly as established fact, omitting that the reference attributes it to a letter seen by POLITICO. Source: "In a letter seen by POLITICO, Finland and Estonia call for "EU-level arrangements for responding to serious AI incidents.""
- 53. "The Article 50 guidelines appeared three …" (interpretation, italic; partly, minor): November 12 to December 2 is 20 days, not exactly three weeks. Source: "kind: policy-item · source: EUR-Lex · published: 2026-11-12"

## Supported sentences to read by hand (seeded sample of 8)

- 1. "Anthropic released Claude Fable 5.2, and …" (fact; supported): — Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model"
- 3. "Databricks set near dates for a …" (fact; supported): — Source: "Communication from the Commission – Guidelines on the implementation of the transparency obligations for certain AI systems under Article 50 of Regulation (EU) 2024/1689 (the AI Act)"
- 4. "Anthropic calls Claude Fable 5.2 and …" (fact; supported): — Source: "Claude Fable 5.2 and Claude Mythos 5.2, our new models for the hardest technical challenges."
- 11. "Later releases changed more. …" (fact; supported): — Source: "Fixed a security issue in how zstd-compressed responses are decoded"
- 18. "Point releases this week both added …" (interpretation, italic; supported): — Source: "Removed the `subagentStatusLine` setting: subagent rows always use the default look, and settings files that still hold the key load as before"
- 25. "Databricks says it costs up to …" (fact; supported): — Source: "It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds."
- 28. "Terraform provider v1.143.0 now updates databricks_app …" (fact; supported): — Source: "`databricks_app` now updates apps through the asynchronous Apps update API"
- 54. "The Dutch motions on supervision and …" (interpretation, italic; supported): — Source: "Motie van het lid El Boujdaini c.s. over autoriteiten voldoende toerusten voor het toezicht op de AI-verordening"
