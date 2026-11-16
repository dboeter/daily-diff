# Check of claude_opus_5_5-low-v3-raw2-r2 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 5 major, 1 minor. Unmarked interpretation: 0. Italic fact: 2.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 42 | 37 | 5 | 0 | 0 | 4 | 1 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 8 | 7 | 0 | 1 | 0 | 1 | 0 |

## The judge's coverage

- Sentences: the judge gave 50 verdicts; code counts 50 sentences.
- Sentence starts found in the article: 50 of 50.
- Quotes found word for word in the reference: 50 of 50.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 1. "Anthropic released Claude Fable 5.2, which …" (fact; partly, major): The reference lists four Claude Code releases, not three: v2.1.321, v2.1.322, v2.1.323 and v2.1.325. Source: "### Claude Code v2.1.322"
- 8. "On 2026-11-09, Artificial Analysis scored Fable …" (fact; partly, major): The date is the story's publication date; the reference does not establish when Artificial Analysis scored the model. Source: "### Claude Fable 5.2 scores 65 on Artificial Analysis, highest so far"
- 12. "Other issues filed this week are …" (fact; partly, major): The following usage-metering issue was filed on November 5, before the November 10–16 digest week. Source: "kind: hot-issue · source: anthropics/claude-code · published: 2026-11-05"
- 22. "For workspaces with the compliance security …" (fact; partly, minor): Drops the restriction to eligible workspaces. Source: "Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled."
- 37. "Several fixes this week concern secrets …" (fact, italic; partly, major): The credential snapshots on disk are an issue report with proposed mitigation, not a documented fix. Source: "## Proposed Mitigation Filter credential-bearing env vars from `export -p` output before writing to the snapshot file."
- 44. "The top of the OpenRouter table …" (fact, italic; supported): — Source: "|   4 | [z-ai/glm-5.3-flash-20260826](https://openrouter.ai/z-ai/glm-5.3-flash-20260826)                               | 11.90T |     3     |"
- 45. "This one-day snapshot points to cost-oriented …" (interpretation, italic; unsupported, major): The reference gives usage and model names, but does not establish that the leading models are cost-oriented. Source: "Top models by tokens (prompt + completion) on OpenRouter on 2026-11-15, one day's snapshot."

## Supported sentences to read by hand (seeded sample of 8)

- 3. "Google added Gemini 4 Carbon and …" (fact; supported): — Source: "Today Anthropic, PBC launched the roadshow for its proposed initial public offering of its Class A common stock."
- 6. "It also fixed a case where …" (fact; supported): — Source: "Fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt"
- 16. "Teams that pin settings or rely …" (interpretation, italic; supported): — Source: "Removed the `subagentStatusLine` setting: subagent rows always use the default look, and settings files that still hold the key load as before"
- 17. "The fallback to Opus 5 means …" (interpretation, italic; supported): — Source: "requests its safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback and billed at Opus 5's price."
- 26. "Databricks says it costs up to …" (fact; supported): — Source: "It costs up to 70% less in internal benchmarks"
- 30. "The Terraform change can resize apps …" (interpretation, italic; supported): — Source: "an omitted `compute_size` resets to `MEDIUM`"
- 39. "BigQuery generative AI functions now support …" (fact; supported): — Source: "BigQuery generative AI functions now support the gemini-4-hydrogen model. This model is generally available."
- 48. "On 2026-12-02, the Art. 50(2) transition …" (fact; supported): — Source: "| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |"
