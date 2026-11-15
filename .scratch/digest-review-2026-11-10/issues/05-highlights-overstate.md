# 05: Highlights and Across platforms overstate their sources

Status: ready-for-human
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

- [x] Replay these six against the rows they came from. Does a Jev check per Highlight ("does the row's text support this sentence?") separate them from Highlights that held up, at what false-drop rate
- [x] Try a code rule first where one exists: a Highlight whose only row is a single community story keeps its attribution ("a Hacker News post says")
- [x] Across platforms is free prose over two rows: decide whether it stays, given three of its bullets failed on one day

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

### Spike, part 2: the Jev replay (2026-11-14)

One `noul` question per sentence ("does `source` support everything `claim` states?", `support-check.ts`), over `support-cases-v2.jsonl`: the 94 sentences with each source rebuilt as the writing model received it (release notes through `releaseNotes()`, every release of a range, full candidate text), and the counts code appends to a bullet (comments, 👍, points) stripped from the claims, since a check would run before code adds them. Answers in `cache.json`. A call costs about 600 input tokens plus the source (`usage` in the response); about 140 calls in all, an estimated 120,000 tokens.

| Bar (supported below) | Flagged caught | Unflagged dropped |
| --------------------- | -------------- | ----------------- |
| 0.2                   | 14/39          | 5/55              |
| 0.3                   | 16/39          | 8/55              |
| 0.4                   | 21/39          | 10/55             |
| 0.5                   | 22/39          | 12/55             |

- Medians: flagged 0.35, unflagged 0.79. By section at 0.4: Across platforms 7/7 caught, 0/2 dropped; Highlights 8/16, 5/18; repo bullets 5/9, 5/15; Spotted rows 0/5, 0/12; table rows 1/2, 0/8.
- The first run, on sources cut raw at 2,000 characters, read 25/39 and 14/55 at 0.4: incomplete sources made both numbers look higher.
- The 10 unflagged sentences under 0.4, read one by one: 1 real overstatement the reviews missed ("must migrate to Gemini 3.8 Flash", where calls are redirected and 3.8 is "the recommended replacement": the GLM 5.3 case again); 4 hot-issue bullets saying "users report" or "users request" for one reporter; 2 OpenRouter rows citing catalog fields outside the description (context size, availability); 3 borderline additions ("tool calls", "critical for Iceberg adoption", a summary going past a story text the day's file had cut). None is clearly a faithful sentence dropped, so the false-drop rate over genuinely faithful sentences is low, but 55 controls with weak labels cannot put a number on it.
- What it misses: the question cannot see who is speaking. TikTok's source holds Politico's "first time", so "supported" is the right answer to the question asked; the government ID (0.74) and Goldman Sachs (0.90) are title-only, already dropped by `22ee1f6`; Gemini "human annotators" 0.72. It also misses merged fixes in long release bullets (Oh My Pi 0.63–0.89) and 4 of 5 Spotted rows. A source-kind field in the state (like the security judgment's `claim_by`) is untested.
- #108122: code places every `anthropics/claude-code` issue under Claude Code, Desktop ones included; the body bullet says "macOS Desktop", and the Highlight took the section's name.

### Recommendation

1. Remove Across platforms: 7 of 9 bullets flagged, Jev agrees on all 7. (Decision for Daan.)
2. The hot-issue prompt contradicts `SOURCE_FIDELITY_RULES`: it asks for "users report" on every issue, and 4 unflagged plus 1 flagged bullet (#107390) say "users report" for one reporter. Ask for "an issue reports" (or "N users report" only when the body shows several).
3. Carry the fidelity rules to where 18 of the 40 errors started, `buildProjectDigestPrompt` and `buildSpottedSummariesPrompt`, with the scope rules these cases broke: keep a qualifier ("the default Fable model", "internal benchmarks"), "recommends" or "upcoming" never becomes "must" or "released", separate fixes stay separate. Unmeasured: the Highlights prompts have had these rules since 11-01 and still produced 17 cases.
4. A Jev check of Highlights only (about 10 calls a day, under 15,000 tokens), dropping a Highlight below 0.2 to 0.3, is the one gate the replay supports: at 0.4 it caught 8 of 16 flagged Highlights, and of its 5 unflagged drops 1 was real, 1 a one-reporter "users report", 1 borderline, and 2 cited catalog fields a production check would have in its source. Not a gate for repo bullets (a long bullet fails on one clause) or Spotted rows (it catches none).
5. Still open after 1–4: about 10 Highlights over faithful rows, among them "resulting in spam", TikTok, #108122 and the dbt "must update", and every case where the error is who says it.

### Decisions and changes (2026-11-15)

Daan: remove Across platforms, and do recommendations 2–4.

- Done: Across platforms removed (`bbc9c77`); the fidelity rules, with three new scope rules (qualifiers, strength, separate changes), in the repo-section and Spotted summary prompts, and a hot issue worded "an issue reports" (`81125b5`); the data Highlights prompt asks for an action only when the row states one, as strongly as the row does, instead of what the change "requires" and who "must test or migrate", which matched four cases: dbt, GLM 5.3, the Snowflake connector and Gemini Flash.
- Not built: the Jev check on Highlights (recommendation 4). Recomputed for the bullet Highlights it would check (agents, models, data; policy is prose, and the two title-only cases are already dropped), from `cache.json`:

| Bar | Flagged caught | Unflagged dropped |
| --- | -------------- | ----------------- |
| 0.2 | 4/11           | 4/18              |
| 0.3 | 4/11           | 4/18              |
| 0.4 | 6/11           | 5/18              |

  By page at 0.3: agents 1/5 caught, 0/8 dropped; models 0/3, 3/6; data 3/3, 1/4. The data catches are the "must" cases the prompt change above targets. Three of the four drops are models-page rows, two of them for catalog fields a production source would carry. Unmatched in production too: which rows a Highlight rests on (the data prompt forbids links, so only names). Waiting on Daan: build it anyway, or judge the prompt changes on a week of nightly reviews first.
