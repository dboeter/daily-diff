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
- [ ] Try a code rule first where one exists: a Highlight whose only row is a single community story keeps its attribution ("a Hacker News post says")
- [ ] Across platforms is free prose over two rows: decide whether it stays, given three of its bullets failed on one day

## Comments
