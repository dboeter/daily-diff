# Check of claude_opus_5_5-high-v3-raw2-r2 for 2026-11-16

Judge: claude-opus-5-5 at high effort, rubric j2, against source-raw2.md.

Flags: 0 major, 2 minor. Unmarked interpretation: 0. Italic fact: 1.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 53 | 52 | 1 | 0 | 0 | 0 | 1 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 9 | 8 | 1 | 0 | 0 | 0 | 1 |

## The judge's coverage

- Sentences: the judge gave 62 verdicts; code counts 63 sentences.
- Sentence starts found in the article: 62 of 62.
- Quotes found word for word in the reference: 61 of 61.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 13. "For teams that turn telemetry off …" (interpretation, italic; partly, minor): Calls the explicit model flag 'the reported way around it'. The issue only notes that the flag works. The workarounds it actually lists are removing DISABLE_TELEMETRY or setting CLAUDE_CODE_GB_DISK_CACHE_WHEN_TELEMETRY_OFF=1. Source: "Workarounds: - Remove `DISABLE_TELEMETRY`. Works, but sends telemetry."
- 44. "Starting on or after 2026-12-10, external …" (fact; partly, minor): The source says external access will be 'available by default'. 'On by default' is stronger and implies the feature is enabled, not only available. Source: "external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled"
- 61. "The Article 50 guidelines appeared less …" (fact, italic; supported): — Source: "published: 2026-11-12"

## Supported sentences to read by hand (seeded sample of 8)

- 32. "Gemini 3.6 Flash retires on 2026-11-19 …" (fact; supported): — Source: "Google Gemini 3.6 Flash will be retired on November 19, 2026."
- 34. "The Genie One MCP Beta endpoint …" (fact; supported): — Source: "reaches end of life on November 30, 2026, after which requests fail"
- 35. "The notice points to the `system.ai.genie_one_mcp` …" (fact; supported): — Source: "migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway"
- 36. "Zhipu AI GLM 5.2 is deprecated …" (fact; supported): — Source: "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027. GLM 5.3 is the recommended replacement."
- 43. "An omitted `git_source` clears the app's …" (fact; supported): — Source: "an omitted `git_source` clears the app's default git source"
- 51. "Great Expectations 1.25.0 now counts rows …" (fact; supported): — Source: "now count rows with a NULL in a compared column as unexpected, matching pandas"
- 52. "Apache Airflow published first stable releases …" (fact; supported): — Source: "First stable release of the Apache Airflow TypeScript SDK."
- 60. "Finland and Estonia call, in a …" (fact; supported): — Source: "In a letter seen by POLITICO, Finland and Estonia call for "EU-level arrangements for responding to serious AI incidents.""
