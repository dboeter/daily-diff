# Check of claude_opus_5_5-high-v3-raw2-r1 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 2 major, 0 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 46 | 46 | 0 | 0 | 0 | 0 | 0 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 10 | 8 | 2 | 0 | 0 | 2 | 0 |

## The judge's coverage

- Sentences: the judge gave 56 verdicts; code counts 59 sentences.
- Sentence starts found in the article: 56 of 56.
- Quotes found word for word in the reference: 56 of 56.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 41. "For clients on the compliance security …" (interpretation, italic; partly, major): Turns an on-or-after date into a definite date, drops workspace eligibility, and says existing settings and privileges are the only conditions despite the catalog-commits requirement for creating and writing tables. Source: "Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled. Supported external Delta clients can create, read, and write Unity Catalog managed Delta tables. Creating and writing managed Delta tables requires catalog commits."
- 55. "Most of the agent fixes concern …" (interpretation, italic; partly, major): Only two of the four cited agent fixes concern credential exposure. The disk exposure is an issue report with proposed mitigation, not a reported fix. Source: "## Proposed Mitigation Filter credential-bearing env vars from `export -p` output before writing to the snapshot file."

## Supported sentences to read by hand (seeded sample of 8)

- 5. "It has 1M context and costs …" (fact; supported): — Source: "1M context, $8/$40 per Mtok with $0.20/Mtok cache reads"
- 10. "One issue reports that `DISABLE_TELEMETRY=1` hides …" (fact; supported): — Source: "the `/model` picker does not offer Fable 5.2. The "Fable" row is still Fable 5.1: The account has Fable 5.2: `claude --model claude-fable-5-2` works in the same configuration."
- 14. "Kilo Code reached 7.03T tokens/week (+46% …" (fact; supported): — Source: "week #5 / month #5, 7.03T tokens/week (+46% vs previous week)"
- 39. "A deploy therefore no longer resets …" (fact; supported): — Source: "so a deploy no longer resets a manually resized app to the default size."
- 42. "The Commission's Article 50 guidelines carry …" (fact; supported): — Source: "digest: shown under AI Policy › EU · stage: Preparatory document"
- 47. "The Article 50 guidelines appeared about …" (interpretation, italic; supported): — Source: "| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends]"
- 51. "Claude Code v2.1.325 fixed a security …" (fact; supported): — Source: "Fixed a security issue in how zstd-compressed responses are decoded"
- 53. "A Hermes Agent issue reports that …" (fact; supported): — Source: "These snapshots persist at `cache/terminal/hermes-snap-*.sh` and contain plaintext credential values."
