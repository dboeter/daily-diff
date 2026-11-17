# Check of claude_haiku_5_5-xhigh-v3-raw2-r2 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 0 major, 1 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 37 | 36 | 0 | 0 | 1 | 0 | 1 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 9 | 9 | 0 | 0 | 0 | 0 | 0 |

## The judge's coverage

- Sentences: the judge gave 46 verdicts; code counts 46 sentences.
- Sentence starts found in the article: 46 of 46.
- Quotes found word for word in the reference: 46 of 46.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 4. "Pi v1.5.1 gives the same prices …" (fact; unverifiable, minor): The visible Pi notes confirm input/output prices and fallback billing, but not the preceding sentence's cache-read price; the omitted text could contain it. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`) to the `anthropic` provider ($8/$40 per million input/output tokens, 1M context, 128K output)."

## Supported sentences to read by hand (seeded sample of 8)

- 7. "v2.1.323 added Code Mode, an experimental …" (fact; supported): — Source: "Added Code Mode, an experimental opt-in in which Claude writes JavaScript to call its tools"
- 9. "An issue on DISABLE_TELEMETRY says that …" (fact; supported): — Source: "The "Fable" row is still Fable 5.1: The account has Fable 5.2: `claude --model claude-fable-5-2` works in the same configuration."
- 20. "Kilo Code is week #5 among …" (fact; supported): — Source: "week #5 / month #5, 7.03T tokens/week (+46% vs previous week)"
- 30. "An omitted `compute_size` now resets to …" (fact; supported): — Source: "an omitted `compute_size` resets to `MEDIUM`"
- 33. "Great Expectations 1.25.0 counts rows with …" (fact; supported): — Source: "On SQL backends, `ExpectColumnPairValuesAToBeGreaterThanB`, `ExpectColumnPairValuesToBeInSet`, `ExpectMulticolumnSumToEqual` and `ExpectCompoundColumnsToBeUnique` now count rows with a NULL in a compared column as unexpected, matching pandas."
- 37. "The Terraform and Great Expectations changes …" (interpretation, italic; supported): — Source: "The synchronous update API ignored `compute_size`, `compute_min_instances`, and `compute_max_instances`, so changes to them never took effect; they are now applied."
- 40. "The Commission's guidelines on transparency obligations …" (fact; supported): — Source: "digest: shown under AI Policy › EU · stage: Preparatory document"
- 44. "Three motions in the Tweede Kamer, …" (fact; supported): — Source: "Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027"
