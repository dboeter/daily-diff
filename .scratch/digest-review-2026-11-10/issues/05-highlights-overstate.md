# 05: Highlights and Across platforms overstate their sources

Status: needs-triage
Findings: 1 [high], see `../review.md`

## Problem

In every review, and the 2026-11-01 review before them (`../../digest-review-2026-11-01/issues/02-highlights-keep-attribution.md`, done, so the prompt rule alone does not hold):

- "Anthropic now requires a government ID to create an account": one unverified Tell HN title (11-08, high).
- "A report shows Claude Code sends the user's email address … resulting in spam": one user's allegation as fact (11-07).
- #108122 called a "Claude Code regression": a Claude Desktop chat bug (11-08).
- TikTok: "first time the Commission has targeted a platform's algorithmic recommendations", Politico's claim in the digest's voice, and wrong (11-07).
- Data, Across platforms: "(GA Nov 1)" where the note gives a start date; "both platforms now meter AI SQL functions"; "multi-workspace lineage" (11-04).
- dbt: users "must update" a flag whose old name is kept as a deprecated alias (11-04).

## Spike

- [ ] Replay these six against the rows they came from. Does a Jev check per Highlight ("does the row's text support this sentence?") separate them from Highlights that held up, at what false-drop rate
- [x] Try a code rule first where one exists: a Highlight whose only row is a single community story keeps its attribution ("a Hacker News post says")
- [ ] Across platforms is free prose over two rows: decide whether it stays, given three of its bullets failed on one day

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: about 15 more findings, and they are not only in Highlights. Release and issue bullets of the repo sections fail the same way:
  - "make Claude Fable 5.2 the default model": the release says "now the default Fable model" (11-10, high).
  - Claude Code v2.1.321: the network-path fixes are for NotebookEdit and Edit, the Bash fixes are permission bypasses; the bullet merged them (11-10).
  - Issue #107390: "far faster than the prior ~2-hour session burn rate" turns the issue's own numbers around (11-10).
  - Oh My Pi v18.18.2 and v18.18.3: two fixes merged into one claim, and a changed default written as a new feature (11-09).
  - AI Policy: "AI safety captains" and a missed data-center deadline attributed to the AI Act, which the Politico teaser never names (11-09).
  - Models: "A GitHub repository documents that Google Gemini routes personal Drive files and emails to human annotators", an allegation as fact and a Highlight; the candidate text never names annotators (11-10). GLM-5.5 written as released where the source says "upcoming" (11-09).
  - Data: "must migrate to GLM 5.3" where the source recommends it; Smart Routing figures without "internal benchmarks" and "routing latency"; an Across platforms bullet that links Smart Routing's cost to BigQuery's billing attribution (11-10).
    The spike should replay repo-section bullets too, not only Highlights.

### Spike, part 1 (2026-11-14)

Data in `../spike/`: `cases.md` (40 confirmed overstatements from the reviews of 11-04 … 11-14, each with the published sentence, the text the model had, and the layer where the error entered), `support-cases.jsonl` (39 of them plus 55 unflagged sentences from the same days and pages, with full source text) and `support-check.ts` (the Jev check, not run yet).

- Where the error entered: 18 in the row or repo bullet itself (release and hot-issue bullets, Spotted summaries), 17 in a Highlight or Across platforms line over a faithful row, 4 in a source that is a bare claim, 1 in a code-rendered Also new line. A check of Highlights against their rows would see under half.
- `SOURCE_FIDELITY_RULES` reach only the Highlights and prose prompts. `buildProjectDigestPrompt` (repo bullets) and `buildSpottedSummariesPrompt` do not carry them. The Highlights prompts have had them since 11-01 and still produced the 17, so a prompt rule alone does not hold.
- Code rule: of the Highlights resting on one community story, the title-only ones (government ID, Goldman Sachs) are dropped by `22ee1f6` (11-11; checked on the government-ID case). The rest carry an attribution and overstate the content ("A report shows … resulting in spam"), so an attribution check would catch one or two.
- Across platforms: 7 of its 9 bullets on reviewed days were flagged (11-04 3/3, 11-07 1/1, 11-08 0/1, 11-10 2/2, 11-11 1/1, 11-14 0/1). Several pair unrelated items, and OneLake's GA was its bullet on 11-06, 11-12 and 11-14. Recommendation: remove it (decision pending).
- Controls are "not flagged by a reviewer", not verified correct.
