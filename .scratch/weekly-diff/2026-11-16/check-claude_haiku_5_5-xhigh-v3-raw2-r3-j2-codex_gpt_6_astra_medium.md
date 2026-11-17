# Check of claude_haiku_5_5-xhigh-v3-raw2-r3 for 2026-11-16

Judge: Codex CLI (gpt-6-astra, medium effort), rubric j2, against source-raw2.md.

Flags: 2 major, 3 minor. Unmarked interpretation: 0. Italic fact: 0.

| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fact | 34 | 31 | 3 | 0 | 0 | 1 | 2 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| interpretation | 8 | 6 | 2 | 0 | 0 | 1 | 1 |

## The judge's coverage

- Sentences: the judge gave 42 verdicts; code counts 42 sentences.
- Sentence starts found in the article: 42 of 42.
- Quotes found word for word in the reference: 41 of 42.
- Links not in the reference (0): none
- Figures not in the reference as written (0): none

## Flagged sentences

- 9. "Pi v1.5.1 changed the default model …" (fact; partly, minor): Omits that the fallback applies to classifier refusals before any output. Source: "requests its safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback and billed at Opus 5's price."
- 12. "The Terraform provider for Databricks v1.143.0 …" (fact; partly, minor): Omits that this behavior concerns updates to databricks_app resources. Source: "`databricks_app` now updates apps through the asynchronous Apps update API . The synchronous update API ignored `compute_size`, `compute_min_instances`, and `compute_max_instances`, so changes to them never took effect; they are now applied."
- 21. "One macOS user's local transcripts show …" (fact; partly, major): Presents the user's reported transcript measurements as established findings rather than attributing them to the issue reporter. Source: "From local Claude Code transcripts (`~/.claude/projects/**/*.jsonl`): - Nov 4 to Nov 7 21:10 UTC: about 50 sessions used claude-in-chrome, with 0 "not connected" errors. - From Nov 7 21:10 UTC to Nov 9: in 47 of 51 sessions the first claude-in-chrome call failed."
- 25. "One week of ranks shows movement …" (interpretation, italic; partly, minor): The table gives weekly ranks and token changes against the previous week's page, not rank movement within the week. Source: "OpenRouter and npm "vs previous week": against the row's figure on last week's page, none when it was not there."
- 26. "Kilo Code and OpenClaw moved 46% …" (interpretation, italic; partly, major): Opposite token-volume changes do not establish churn between apps; the reference contains no evidence of users or workloads switching between them. Source: "week #8 / month #8, 2.69T tokens/week (-46% vs previous week)"

## Supported sentences to read by hand (seeded sample of 8)

- 5. "Zhipu AI GLM 5.2 is deprecated …" (fact; supported): — Source: "Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027. GLM 5.3 is the recommended replacement."
- 6. "Smart Routing (Beta) now routes only …" (fact; supported): — Source: "Smart Routing now routes only subagents, not the first prompt. It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds."
- 14. "The Genie One MCP Beta endpoint …" (fact; supported): — Source: "The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway."
- 19. "OpenCode v2.3.0 made subagents always run …" (fact; supported): — Source: "Subagents now always run in the background, return their session ID immediately, and report results to their parent whenever they become idle."
- 24. "OpenClaw ranked week #8, with 2.69T …" (fact; supported): — Source: "week #8 / month #8, 2.69T tokens/week (-46% vs previous week)"
- 34. "These are individual reports, each describing …" (interpretation, italic; supported): — Source: "### What platform is your computer? Linux x86_64（CentOS 8）"
- 35. "Credential and request handling come up …" (interpretation, italic; supported): — Source: "Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them"
- 38. "A targeted consultation on draft revised …" (fact; supported): — Source: "This consultation focuses on measures Very Large Online Platforms (VLOPs) and Very Large Online Search Engines (VLOSEs) should adopt to address generative AI and information manipulation risks to electoral processes."
