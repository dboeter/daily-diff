# Check of claude_opus_5_5-low-v3-raw2-r3 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 3 major, 2 minor. Unmarked interpretation: 1. Italic fact: 3.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 47 | 43 | 4 | 0 | 0 | 2 | 2 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 8 | 7 | 1 | 0 | 0 | 1 | 0 |

## The judge's coverage

- Sentences: the judge gave 55 verdicts; code counts 56 sentences.
- Sentence starts found in the article: 55 of 55.
- Quotes found word for word in the reference: 55 of 55.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 11. "The rollout brought friction. …" (interpretation; supported): The interpretation is not italicized. Source: "The case I hit: with `"env": {"DISABLE_TELEMETRY": "1"}` in `~/.claude/settings.json`, the `/model` picker does not offer Fable 5.2."
- 31. "Smart Routing now routes only subagents, …" (fact; partly, minor): Omits that Smart Routing is in Beta. Source: "Smart Routing is faster and lower cost, and now routes subagents only (Beta)"
- 32. "The 2026-11-19 and 2026-11-30 dates fall …" (fact, italic; supported): — Source: "ends: 2026-11-30"
- 37. "According to the Oh My Pi …" (fact; partly, minor): Omits the catalog's provider scope for these prices. Source: "Added Gemini 4 Carbon pricing on the Gemini API, Vertex AI, Google Antigravity, and Cursor ($2 input / $0.10 cached / $10 output per 1M tokens through 2026-11-30, then $4 / $0.20 / $20), instead of showing $0"
- 39. "If that catalog price is right, …" (interpretation, italic; partly, major): The doubling is correct, but the reference does not establish that these catalog prices govern BigQuery batch jobs; 'any' such job is too broad. Source: "Added Gemini 4 Carbon pricing on the Gemini API, Vertex AI, Google Antigravity, and Cursor ($2 input / $0.10 cached / $10 output per 1M tokens through 2026-11-30, then $4 / $0.20 / $20), instead of showing $0"
- 40. "Both warehouses now offer current models …" (fact, italic; partly, major): The reference names only Google models for BigQuery and does not establish SQL availability for the Snowflake model announcement; it does not support several labs inside SQL in both warehouses. Source: "BigQuery generative AI functions now support the gemini-4-carbon model. This model is generally available."
- 46. "OpenShell v0.1.8 now resolves static credentials …" (fact; partly, major): Incorrectly makes Authorization the only permitted placement; explicitly enabled body and WebSocket rewrite policies are also allowed without placement metadata. Source: "Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies"
- 54. "The Article 50 guidelines arrive less …" (fact, italic; supported): — Source: "kind: policy-item · source: EUR-Lex · published: 2026-11-12 · link: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005"

## Supported sentences to read by hand (seeded sample of 8)

- 1. "Anthropic released Claude Fable 5.2, and …" (fact; supported): — Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model"
- 4. "Claude Code v2.1.321 added Claude Fable …" (fact; supported): — Source: "Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model — 1M context, $8/$40 per Mtok with $0.20/Mtok cache reads"
- 10. "A story titled "Claude Fable 5.2 …" (fact; supported): — Source: "digest: shown under AI Models & Labs › Spotted · 335 points, 242 comments"
- 14. "An issue says this left no …" (fact; supported): — Source: "[BUG] 2.1.323 removed subagentStatusLine with no replacement: per-agent context, cost, model and effort are now invisible"
- 16. "In the weekly tables, Claude Code …" (fact; supported): — Source: "week #4 / month #3, 10.80T tokens/week (+7.5% vs previous week)"
- 25. "Defaults are moving too. …" (fact; supported): — Source: "Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled."
- 43. "A separate write-up describes turning a …" (fact; supported): — Source: "Turning a 22-year-old Postgres type-confusion primitive into RCE"
- 55. "Clients building generative features in the …" (interpretation, italic; supported): — Source: "Communication from the Commission – Guidelines on the implementation of the transparency obligations for certain AI systems under Article 50 of Regulation (EU) 2024/1689 (the AI Act)"
