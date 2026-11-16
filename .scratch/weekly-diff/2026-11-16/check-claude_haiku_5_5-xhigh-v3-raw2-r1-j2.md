# Check of claude_haiku_5_5-xhigh-v3-raw2-r1 for 2026-11-16

Judge: claude-opus-5-5 at high effort, rubric j2, against source-raw2.md.

Flags: 0 major, 3 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 34 | 32 | 1 | 0 | 1 | 0 | 2 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 10 | 9 | 1 | 0 | 0 | 0 | 1 |

## The judge's coverage

- Sentences: the judge gave 44 verdicts; code counts 44 sentences.
- Sentence starts found in the article: 44 of 44.
- Quotes found word for word in the reference: 43 of 43.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 11. "One report from one setup points …" (interpretation, italic; partly, minor): The reading 'not a general fault' is stronger than the facts allow. The reporter describes a general behavior of DISABLE_TELEMETRY: every flag falls back to its compiled default. The reporter also links the issue to the same root cause as two other issues. Source: "Same root cause as #36460 (channels unavailable) and #86171 (Monitor tool unavailable)."
- 30. "The Genie One MCP Beta endpoint …" (fact; partly, minor): The sentence attributes the migration advice to the vendor note ('the note says'). The reference holds only the digest's own summary; the vendor's text is not saved. Source: "(the digest's own summary of this note; the vendor's text is not saved)"
- 35. "A PostgreSQL security page for CVE-2026-6460 …" (fact; unverifiable, minor): The reference has only the Hacker News story title for this item; the page itself gave no text. Whether the PostgreSQL page carries this title cannot be checked. Source: "CVE-2026-6460 – Arbitrary Code Execution in Postgres"

## Supported sentences to read by hand (seeded sample of 8)

- 3. "Anthropic's Claude Fable 5.2 and Mythos …" (fact; supported): — Source: "Fable 5.2 sets a new bar in coding, finance, and the sciences."
- 14. "Pi v1.5.1 also changes the default …" (fact; supported): — Source: "The default model for the `anthropic` provider is now Claude Opus 5.5 (`claude-opus-5-5`) instead of Claude Opus 4.8"
- 15. "Claude Code v2.1.323, published 2026-11-12, removed …" (fact; supported): — Source: "Removed the `subagentStatusLine` setting: subagent rows always use the default look"
- 16. "An issue says the setting was …" (fact; supported): — Source: "`subagentStatusLine` was the **only** place in Claude Code where a user could see, per running subagent, at a glance:"
- 17. "Claude Code v2.1.321 also fixed MCP …" (fact; supported): — Source: "Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them"
- 26. "They do not show a settled …" (interpretation, italic; supported): —
- 29. "Zhipu AI GLM 5.2 is deprecated …" (fact; supported): — Source: "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027. GLM 5.3 is the recommended replacement."
- 33. "Terraform provider v1.143.0, published 2026-11-16, moves …" (fact; supported): — Source: "The synchronous update API ignored `compute_size`, `compute_min_instances`, and `compute_max_instances`, so changes to them never took effect; they are now applied."
