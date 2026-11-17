# Check of claude-opus-5-5 (low) for 2026-11-16, judged by claude-opus-5-5

Sentences: 55. Unmarked interpretation: 0. Italic fact: 0.

| Kind           | Sentences | Supported | Partly | Unsupported |
| -------------- | --------- | --------- | ------ | ----------- |
| fact           | 44        | 35        | 9      | 0           |
| mixed          | 1         | 0         | 1      | 0           |
| interpretation | 10        | 4         | 5      | 1           |

Links not in the source (0): none

Figures not in the source as written (0): none

## Flagged sentences

- 2. "A run of regressions, removals and …" (mixed; partly): The sequence of later regressions, a removal and an outage is in the source. Unmarked: 'followed it' presents them as consequences of the default-model change, a link the source does not make. Source: "a regression since version 2.1.321"
- 3. "On the data side, Azure Databricks …" (fact; partly): The source calls the Article 50 guidelines 'preparatory', not 'draft'. It also attributes them to the European Commission, not 'the EU'. Source: "published preparatory guidelines on implementing transparency obligations"
- 9. "Several problems were reported after the …" (fact; partly): The Team usage report describes exhaustion on Nov 4–5, before the 2026-11-10 release that made Fable 5.2 the default. The source does not tie the listed problems to the switch. Source: "exhausted in ~30.5 hours after reset (Nov 4–5)"
- 15. "A default-model change combined with reported …" (interpretation, italic; partly): Ties the Team usage exhaustion to the default-model change. The source gives no such cause, and that report (Nov 4–5) predates the switch. Source: "with no workflow change"
- 23. "Default external access, 2026-12-10: starting on …" (fact; partly): Drops two qualifiers: creating and writing require catalog commits, and access stays controlled by metastore external data access settings and Unity Catalog privileges. Source: "External Delta clients can create, read, and write Unity Catalog managed Delta tables by default"
- 27. "Separately, Smart Routing now routes only …" (fact; partly): Drops the Beta qualifier. Source: "now routes subagents only (Beta)"
- 30. "Two retirements and an endpoint shutdown …" (interpretation, italic; partly): Only one retirement (Gemini 3.6 Flash, 2026-11-19) falls within a month; GLM 5.2 retires on 2027-02-04. It also infers an ongoing pattern ('now turn over on short cycles') from a few notices. Source: "will be retired on February 4, 2027"
- 31. "The planned default for external access …" (interpretation, italic; partly): Says the change alters who can write by default. The source says access continues to be controlled by metastore settings and Unity Catalog privileges, and writing requires catalog commits. Source: "access continues to be controlled by metastore external data access settings and Unity Catalog privileges"
- 32. "An open Hermes Agent issue says …" (fact; partly): The source does not say the issue is open. Source: "capture all environment variables — including credential-bearing vars... to persistent plaintext files at `cache/terminal/hermes-snap-*.sh`"
- 37. "A researcher described turning a 22-year-old …" (fact; partly): Merges two separate items. The source never states that the write-up's bug is CVE-2026-6460; the link appears only in the article's URL slug. Source: "discovered a 22-year-old zero-day type-confusion vulnerability in PostgreSQL core that enables remote code execution"
- 39. "This suggests secret handling is where …" (interpretation, italic; partly): Generalises from a few items in two projects to where agent runtimes as a whole are being hardened. Source: "credential-bearing vars from `bws run --`"
- 41. "Hermes Agent ranked #3 at 13.02T …" (fact; partly): Drops the weekly window on the ranks; on the monthly ranking Hermes Agent is #4 and Claude Code is #3. The percentages also lose 'vs previous week'. Source: "week #3 / month #4, 13.02T tokens/week (+5.1% vs previous week)"
- 45. "Two Anthropic models sat at 6 …" (fact; partly): Three Anthropic models are in the top 20; claude-haiku-5.5 at #18 is omitted. Source: "| 18 | [anthropic/claude-haiku-5.5-20261007]"
- 47. "The model table suggests the heaviest …" (interpretation, italic; unsupported): Relies on the models being 'low-cost' and the others 'frontier', which the source does not say. It also reads 'still' into a one-day snapshot.
- 48. "The Commission published draft guidelines on …" (fact; partly): The source calls them preparatory guidelines, not 'draft'. Source: "published preparatory guidelines on implementing transparency obligations"
- 54. "Guidance published weeks before the Art. …" (interpretation, italic; partly): States a future outcome as near-certain ('will meet'). It assumes Art. 50(2) concerns generative features, which the source does not describe, and that no earlier guidance existed. Source: "Art. 50(2) transition ends"
