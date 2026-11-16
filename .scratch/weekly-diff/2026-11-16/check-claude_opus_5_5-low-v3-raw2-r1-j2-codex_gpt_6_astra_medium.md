# Check of claude_opus_5_5-low-v3-raw2-r1 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 0 major, 6 minor. Unmarked interpretation: 0. Italic fact: 1.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 49 | 45 | 4 | 0 | 0 | 0 | 4 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 11 | 9 | 2 | 0 | 0 | 0 | 2 |

## The judge's coverage

- Sentences: the judge gave 60 verdicts; code counts 66 sentences.
- Sentence starts found in the article: 60 of 60.
- Quotes found word for word in the reference: 60 of 60.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 37. "The two November dates fall inside …" (fact, italic; supported): — Source: "ends: 2026-11-30"
- 45. "Static provider credentials without placement metadata …" (fact; partly, minor): The exception is imprecise: credentials without placement metadata can also resolve through explicitly enabled body or WebSocket rewrite policies. Source: "Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies"
- 48. "Where environment variables and logs hold …" (interpretation, italic; partly, minor): Calling this a recurring weak point implies a continuing pattern beyond the examples shown this week. Source: "AWS SigV4 signing diagnostics no longer appear in supervisor TRACE logs, where they could expose the temporary session token."
- 50. "omp's npm downloads rose to 295,519 …" (fact; partly, minor): Omits that 295,519 is downloads in the last seven days; the preceding seven-day introduction explicitly concerns OpenRouter rankings. Source: "295,519 downloads/week (+34% vs previous week)"
- 51. "On GitHub, Tencent/LoopForge gained 1,767 stars …" (fact; partly, minor): Omits the seven-day window for the star gain and percentage. Source: "GitHub: total stars (stars gained in the last 7 days, % on a week ago)."
- 53. "These are one week's figures and …" (interpretation, italic; partly, minor): The model tokens are a one-day snapshot, so describing all these figures as one week's movement blurs their different windows. Source: "Top models by tokens (prompt + completion) on OpenRouter on 2026-11-15, one day's snapshot."
- 58. "On 2026-11-09, the Tweede Kamer received …" (fact; partly, minor): The reference gives a publication date, not an explicit date of receipt by the Tweede Kamer. Source: "kind: policy-item · source: Tweede Kamer · published: 2026-11-09"

## Supported sentences to read by hand (seeded sample of 8)

- 7. "MCP OAuth requests sent secrets such …" (fact; supported): — Source: "Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them"
- 21. "That makes the changelog worth reading …" (interpretation, italic; supported): — Source: "Removed the `subagentStatusLine` setting: subagent rows always use the default look, and settings files that still hold the key load as before"
- 23. "Several Azure Databricks notes carry dates: …" (fact; supported): — Source: "Google Gemini 3.6 Flash will be retired on November 19, 2026."
- 40. "The PostgreSQL Global Development Group released …" (fact; supported): — Source: "PostgreSQL 18.7, 17.12, 16.16, 15.20, 14.25, and 19 RC 2 Released"
- 49. "On OpenRouter's app rankings over the …" (fact; supported): — Source: "OpenRouter: the app's rank this week / this month among OpenRouter apps, its tokens in the last 7 days."
- 54. "The gap between omp's falling OpenRouter …" (interpretation, italic; supported): — Source: "week #11 / month #10, 2.13T tokens/week (-36% vs previous week); 295,519 downloads/week (+34% vs previous week)"
- 55. "The Commission published guidelines on the …" (fact; supported): — Source: "digest: shown under AI Policy › EU · stage: Preparatory document"
- 56. "It also adopted Implementing Regulation (EU) …" (fact; supported): — Source: "digest: shown under AI Policy › EU · stage: Regulation adopted"
