# Security section: incidents and fixes on every page

Status: draft. The decisions under "Decided" are the maintainer's (2026-11-11). The spike is done (`spike/results.md`). Placement is open again. Nothing is built.

## Why

The nightly reviews of 2026-11-07 to 11-10 found security news that was fetched and then lost or misreported:

- The Fireworks AI breach was fetched three times on 11-10 and shown on no page (`../digest-review-2026-11-10/issues/10-fetched-but-not-shown.md`).
- Claude Code v2.1.321 fixed MCP OAuth requests that sent refresh tokens to another host, and a Bash command that ran outside the sandbox. The Highlights left both out (issue 11 there).
- Three overstated Highlights were security or privacy claims that rested on one post (issue 05 there).

## Decided

1. **Readers**: the maintainer and the colleagues who read only the Data page. Where the rows show is open again, see "Placement".
2. **Scope**: incidents (a breach, a leak, a vulnerability) and security fixes. A fix that follows an incident an earlier digest reported must point back to it.

3. **Messages**: a page's security rows go into `highlights.json`, so Telegram and the Teams post carry them.

## Placement (open, roadmap `security/1.2`)

The maintainer is weighing three forms: a table on each page (below), a separate Security page, and a banner or sidebar for the high-confidence, high-impact items (the backdoored Claude Code extension of 2026-10-31 is the example). What the spike says:

- No story in 13 days concerned a data platform, so a table on the Data page would hold release fixes only. A severe incident in a tool the colleagues use reaches them only through something that crosses pages.
- A banner rule over three Jev answers (flagged, severity 1.5 or more, claim by the vendor, a researcher or the press) gives 5 events in 13 days and passes the extension backdoor. 2 of its 8 stories are out of scope, and it leaves out the Claude Code email leak, which was one user's report.
- About 19 release lines a day have a security effect: too many for a row each on any page.

## Shape of a page table

- `## Security`, a code-rendered table directly under Highlights, as `## Action required` is on the Data page. No row: no section.
- Columns: Date, Item (linked), Source, What happened (the model's row summary, from the item's text only). The Source column keeps "a Hacker News post" visible, so a claim is never in the digest's own voice. A row without text shows `—`.
- Not a Highlight rule. Highlights only see what the page shows, and free prose is where security claims went wrong.

## Feeds

1. **Community stories**: one Jev question per fresh story, cached like the topic verdicts. A flagged story has its own slots. It skips the topic bar (`SPOTTED_MIN_TOPIC_PROBABILITY`) and the per-source row cap, and leaves Spotted and "Also talked about". Several submissions of one event are one row.
2. **Release notes**: a judgment per line of the full release body. A heading check is not enough, see the evidence. The spike found about 19 such lines a day, so a line is not a row: the lines go to their project's release bullets, and only graded ones are raised.
3. **Hot issues** with a security label, which code already knows.
4. **Vendor notes** on the Data page that Jev marks as a security change (not checked yet).

## What the evidence says about the design

Four days of `candidates.json` (11-07 to 11-10, the file exists since 11-07), a keyword scan and hand labels, no Jev call:

- **Volume**: 0 to 3 real items a day. 11-08: Claude Code's "Don't Ask Again" passwords in public files, the Claude Code email leak. 11-10: Fireworks (three submissions), the Gemini annotator allegation, the two v2.1.321 fixes.
- **Keywords cannot be the gate.** False hits: "Hungary: Communist-era files released, up to 60k former agents revealed", a Rust app framework, Terraform's `secrets` argument, a prompt-injection essay.
- **Fixes have no security heading.** The v2.1.321 fixes are plain "Fixed …" bullets. The email-leak fix in v2.1.317 reads "Added a check that asks before a web or shell tool call sends your account email address to the network": no "security", no "fix", no "leak".
- **A release body is far longer than what the model sees.** v2.1.317 is 12,278 characters and v2.1.321 16,683; the section prompt gets 2,000 (`RELEASE_BODY_CHARS`). A security line past the cut is never seen today.
- **The fix can come first.** v2.1.317 shipped on 11-03. The Hacker News story about the leak was shown on 11-07, as News and as a Highlight, with no word that it was fixed four days before. So the link runs both ways: a new fix looks back at open incidents, and a new incident looks back at recent fix lines.
- **Text is often missing.** All three Fireworks candidates have empty text.

## Linking an incident and its fix

- A state file keeps each shown security row (incident or fix) for N days, like the data state's `actions`.
- A new fix line is asked against the open incidents of its project; a new incident against that project's recent fix lines. A match adds "fixes the leak reported on 11-07" or "fixed in v2.1.317 (11-03)" to the row.
- This crosses the show-once rules (`dropShownRepeats`, the hot-issue state, one link once on Spotted). A follow-up row is a new item that names the earlier one; the earlier row is not shown again.
- Acceptance case: the email leak (story 11-05, shown 11-07) and v2.1.317 (11-03). Replayed over those days, the 11-07 row says it is fixed.
- Not covered: a later change to a fix. The v2.1.321 line that narrows the email check scores 0.43 as a security line and 0.22 and 0.11 against the leak stories (spike, 2026-11-11), so it is neither flagged nor linked. If such a change must show, it needs a link to the earlier fix line of its project; that is not tested.

## Open decisions

1. **An incident outside a page's topic.** With page-scoped tables the Fireworks breach is on AI Models & Labs and on the Overview, not on Data. Proposed: keep "one item, one page, once"; an incident that names a tracked data project or vendor is on Data too (the existing exception for News).
2. **Page of a flagged story**: proposed is the page of its best page topic, with no bar, or the page of the tracked project it names.

## Order of work

1. Spike: done, `spike/results.md`.
1. Placement decision.
1. Table, state and the story feed.
1. Release-line feed and the incident-to-fix link.
1. Overview list, messages, `GLOSSARY.md` and `AGENTS.md`.
