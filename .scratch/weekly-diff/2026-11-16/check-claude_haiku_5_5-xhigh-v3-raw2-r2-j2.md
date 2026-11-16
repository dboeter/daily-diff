# Check of claude_haiku_5_5-xhigh-v3-raw2-r2 for 2026-11-16

Judge: claude-opus-5-5 at high effort, rubric j2, against source-raw2.md.

Flags: 0 major, 4 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 37 | 34 | 3 | 0 | 0 | 0 | 3 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 9 | 8 | 1 | 0 | 0 | 0 | 1 |

## The judge's coverage

- Sentences: the judge gave 46 verdicts; code counts 46 sentences.
- Sentence starts found in the article: 46 of 46.
- Quotes found word for word in the reference: 43 of 43.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 4. "Pi v1.5.1 gives the same prices …" (fact; partly, minor): Pi gives $8/$40 but no cache-read price, so 'the same prices' covers more than Pi states. The fallback detail is supported. Source: "Added Claude Fable 5.2 (`claude-fable-5-2`) to the `anthropic` provider ($8/$40 per million input/output tokens, 1M context, 128K output)."
- 24. "Starting 2026-11-19, calls to Gemini 3.6 …" (fact; partly, minor): The sentence drops the scope that this redirect applies on Azure Databricks. Read alone, it reads as a general redirect. Source: "Starting on that date, API calls to Gemini 3.6 Flash will be automatically redirected to Gemini 3.8 Flash at the same price."
- 34. "A Hacker News story links PostgreSQL's …" (fact; partly, minor): The quoted title is the Hacker News story's title. The reference gives no text for the PostgreSQL page, so it does not show that the page carries this title. Source: "CVE-2026-6460 – Arbitrary Code Execution in Postgres"
- 46. "The Dutch motions and the cabinet's …" (interpretation, italic; partly, minor): The motions are filed requests, and the reference does not say they were adopted. Saying they 'set direction' claims more than a motion carries. Source: "Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027"

## Supported sentences to read by hand (seeded sample of 8)

- 7. "v2.1.323 added Code Mode, an experimental …" (fact; supported): — Source: "Fixed a security issue in how zstd-compressed responses are decoded"
- 9. "An issue on DISABLE_TELEMETRY says that …" (fact; supported): — Source: "The "Fable" row is still Fable 5.1: The account has Fable 5.2: `claude --model claude-fable-5-2` works in the same configuration."
- 19. "A Hermes Agent issue reports that …" (fact; supported): — Source: "Reproduced with two different Nous accounts (fresh logins)"
- 29. "Terraform provider v1.143.0 now updates `databricks_app` …" (fact; supported): — Source: "The synchronous update API ignored `compute_size`, `compute_min_instances`, and `compute_max_instances`, so changes to them never took effect; they are now applied."
- 32. "Snowpark Python 1.57.0 no longer takes …" (fact; supported): — Source: "`DataFrameReader.documents()` (Private Preview) no longer takes the `parse_mode`, `row_boundary` and `extract_images` options."
- 36. "Three dated items fall between 2026-11-19 …" (interpretation, italic; supported): —
- 39. "The implementing regulation sets rules for …" (fact; supported): — Source: "laying down rules for the application of Regulation (EU) 2024/1689 of the European Parliament and of the Council as regards the establishment, development, implementation, operation and supervision of AI regulatory sandboxes"
- 43. "In the Netherlands, Digitale Overheid reports …" (fact; supported): — Source: "Het kabinet kiest voor een visie op AI die bijdraagt aan een sterke economie, goede publieke dienstverlening en oplossingen voor maatschappelijke uitdagingen."
