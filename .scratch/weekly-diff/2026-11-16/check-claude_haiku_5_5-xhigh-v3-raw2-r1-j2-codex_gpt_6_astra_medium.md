# Check of claude_haiku_5_5-xhigh-v3-raw2-r1 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 0 major, 1 minor. Unmarked interpretation: 0. Italic fact: 1.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 35 | 34 | 0 | 0 | 1 | 0 | 1 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 9 | 9 | 0 | 0 | 0 | 0 | 0 |

## The judge's coverage

- Sentences: the judge gave 44 verdicts; code counts 44 sentences.
- Sentence starts found in the article: 44 of 44.
- Quotes found word for word in the reference: 44 of 44.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 35. "A PostgreSQL security page for CVE-2026-6460 …" (fact; unverifiable, minor): The reference supplies the Hacker News item's title and a link, but no page text establishing the linked page's own title. Source: "### CVE-2026-6460 – Arbitrary Code Execution in Postgres"
- 43. "The Dutch items are motions, while …" (fact, italic; supported): — Source: "digest: shown under AI Policy › EU · stage: Regulation adopted"

## Supported sentences to read by hand (seeded sample of 8)

- 3. "Anthropic's Claude Fable 5.2 and Mythos …" (fact; supported): — Source: "Fable 5.2 sets a new bar in coding, finance, and the sciences."
- 14. "Pi v1.5.1 also changes the default …" (fact; supported): — Source: "OpenAI-compatible models no longer send `"tools": []` when all tools are disabled in a session that has used tools; the field is omitted. This fixes 400 errors (`tools must not be an empty array`) from vLLM 0.20+, also behind LiteLLM."
- 15. "Claude Code v2.1.323, published 2026-11-12, removed …" (fact; supported): — Source: "The 2.1.323 changelog says: > Removed the `subagentStatusLine` setting: subagent rows always use the default look, and settings files that still hold the key load as before"
- 16. "An issue says the setting was …" (fact; supported): — Source: "`subagentStatusLine` was the **only** place in Claude Code where a user could see, per running subagent, at a glance: - its live context use against its own window - what it has spent so far (tokens and dollars) - its model **and** its reasoning effort"
- 17. "Claude Code v2.1.321 also fixed MCP …" (fact; supported): — Source: "Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them - Fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt"
- 27. "Gemini 3.6 Flash will retire on …" (fact; supported): — Source: "Google Gemini 3.6 Flash will be retired on November 19, 2026."
- 29. "Zhipu AI GLM 5.2 is deprecated …" (fact; supported): — Source: "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027. GLM 5.3 is the recommended replacement."
- 33. "Terraform provider v1.143.0, published 2026-11-16, moves …" (fact; supported): — Source: "`databricks_app` now updates apps through the asynchronous Apps update API . The synchronous update API ignored `compute_size`, `compute_min_instances`, and `compute_max_instances`, so changes to them never took effect; they are now applied."
