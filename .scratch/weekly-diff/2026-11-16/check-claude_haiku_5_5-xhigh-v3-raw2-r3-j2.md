# Check of claude_haiku_5_5-xhigh-v3-raw2-r3 for 2026-11-16

Judge: claude-opus-5-5 at high effort, rubric j2, against source-raw2.md.

Flags: 0 major, 3 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 34 | 33 | 1 | 0 | 0 | 0 | 1 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 8 | 6 | 2 | 0 | 0 | 0 | 2 |

## The judge's coverage

- Sentences: the judge gave 42 verdicts; code counts 42 sentences.
- Sentence starts found in the article: 42 of 42.
- Quotes found word for word in the reference: 38 of 38.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 9. "Pi v1.5.1 changed the default model …" (fact; partly, minor): Drops the qualifier that the fallback applies only to requests refused before any output. Source: "requests its safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback and billed at Opus 5's price"
- 26. "Kilo Code and OpenClaw moved 46% …" (interpretation, italic; partly, minor): Opposite token changes in two apps do not show users moving between them. The reference gives no link between the two moves. Source: "7.03T tokens/week (+46% vs previous week)"
- 34. "These are individual reports, each describing …" (interpretation, italic; partly, minor): The Codex issue is written as a group's sweep ("our sweep", "for us"). It also cites another user's report (#60594), so it is not one user's setup. Source: "In our sweep below, the image is uniform noise"

## Supported sentences to read by hand (seeded sample of 8)

- 6. "Smart Routing (Beta) now routes only …" (fact; supported): — Source: "Smart Routing now routes only subagents, not the first prompt. It costs up to 70% less in internal benchmarks"
- 7. "Defaults changed too. …" (fact; supported): — Source: "now the default Fable model"
- 14. "The Genie One MCP Beta endpoint …" (fact; supported): — Source: "reaches end of life on November 30, 2026, after which requests fail"
- 19. "OpenCode v2.3.0 made subagents always run …" (fact; supported): — Source: "Transcript verbosity now defaults to `low`, which summarizes each run of tools and thoughts into one activity row."
- 23. "On OpenRouter, Kilo Code ranked week …" (fact; supported): — Source: "week #5 / month #5, 7.03T tokens/week (+46% vs previous week)"
- 32. "An issue reports that Hermes Agent …" (fact; supported): — Source: "dashboard-auth.log shows native_token_success and ws_ticket_minted with the correct user_id (67a3ff6f for account 1, 5fc47070 for account 2), and a chat message sent ~60 s later is recorded with session_admissions.principal_id = "uid:10000"."
- 33. "A Codex issue reports a 400 …" (fact; supported): — Source: "Once a thread's history contains such content, every later turn fails the same way."
- 38. "A targeted consultation on draft revised …" (fact; supported): — Source: "This consultation focuses on measures Very Large Online Platforms (VLOPs) and Very Large Online Search Engines (VLOSEs) should adopt to address generative AI and information manipulation risks to electoral processes."
