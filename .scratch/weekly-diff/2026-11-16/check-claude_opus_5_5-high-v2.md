# Check of claude-opus-5-5 (high, prompt v2) for 2026-11-16, judged by claude-opus-5-5

Sentences: 56. Unmarked interpretation: 2. Italic fact: 1.

| Kind           | Sentences | Supported | Partly | Unsupported |
| -------------- | --------- | --------- | ------ | ----------- |
| fact           | 44        | 39        | 5      | 0           |
| mixed          | 3         | 1         | 2      | 0           |
| interpretation | 9         | 7         | 2      | 0           |

Links not in the source (0): none

Figures not in the source as written (0): none

## Flagged sentences

- 8. "The rollout drew issue reports. …" (interpretation; partly): Interpretation not set in italics. It claims the issues were caused by the Fable 5.2 rollout. The source ties only #108726 to Fable 5.2. Neither #109446 (a 2.1.323 regression) nor the elevated errors is linked to the rollout. Source: "causing the `/model` picker to hide Fable 5.2"
- 10. "As a result, the `/model` picker …" (fact; partly): States as fact what the source gives only as a user report. The 'users report' attribution is dropped. Source: "causing the `/model` picker to hide Fable 5.2 and fall back to compiled defaults"
- 13. "Usage figures moved unevenly. …" (interpretation; supported): Interpretation not set in italics. Source: "(+46% vs previous week)"
- 27. "Databricks says Smart Routing now routes …" (fact; partly): Drops the Beta qualifier on the Smart Routing change. Source: "now routes subagents only (Beta)"
- 30. "BigQuery added both Gemini 4 models …" (mixed, italic; partly): The factual date match is set in italics. It is a cross-table comparison (OpenRouter listings vs BigQuery notes) that no single table shows. The reading also generalises from two models to new Google models in general. Source: "2026-11-10 | 1M"
- 39. "Catalog commits appear twice here: as …" (fact, italic; supported): A factual statement is set in italics. Source: "creating and writing requires catalog commits"
- 45. "That includes credential-bearing variables from Bitwarden …" (fact; partly): Stated as fact without the 'an issue says' attribution. It also drops the `bws run --` source. Source: "including credential-bearing vars from `bws run --` and Bitwarden Secrets Manager"
- 46. "Another issue says the Desktop app …" (fact; partly): Drops the qualifier that this happens after full restarts and storage cleanup. It also omits that the server mints a correct ws ticket. Source: "admitted as `uid:10000` for two different accounts after full restarts and storage cleanup"
- 47. "The Hermes items are reports, not …" (interpretation, italic; partly): Claims both issues are 'on the user's own machine'. The identity issue concerns how messages are admitted after the server mints a ticket, which the source does not place on the user's machine. Source: "the server mints a correct ws ticket but chat messages are admitted as `uid:10000`"
- 48. "The write-up places the PostgreSQL flaw …" (mixed, italic; supported): The factual clause (the flaw is in core) is set in italics. Source: "vulnerability in PostgreSQL core"
- 53. "The Tweede Kamer received a motion …" (fact; partly): Drops 'and others' from the motion's attribution. Source: "a motion by El Boujdaini and others"
- 55. "The Article 50 guidelines arrive less …" (mixed, italic; partly): The factual timing (2026-11-12 vs 2026-12-02, under three weeks) is set in italics. It is a cross-table comparison that no single table shows. Source: "Art. 50(2) transition ends"
