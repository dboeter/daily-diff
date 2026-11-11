# Security: a banner for severe incidents, marked rows for the rest

Status: placement decided on 2026-11-11. The decisions under "Decided" are the maintainer's. The spike is done (`spike/results.md`). Nothing is built.

## Why

The nightly reviews of 2026-11-07 to 11-10 found security news that was fetched and then lost or misreported:

- The Fireworks AI breach was fetched three times on 11-10 and shown on no page (`../digest-review-2026-11-10/issues/10-fetched-but-not-shown.md`).
- Claude Code v2.1.321 fixed MCP OAuth requests that sent refresh tokens to another host, and a Bash command that ran outside the sandbox. The Highlights left both out (issue 11 there).
- Three overstated Highlights were security or privacy claims that rested on one post (issue 05 there).

## Decided

1. **Readers**: the maintainer and the colleagues who read only the Data page.
2. **Scope**: incidents (a breach, a leak, a vulnerability) and security fixes. A fix that follows an incident an earlier digest reported must point back to it.
3. **Messages**: security items go into `highlights.json`, so Telegram and the Teams post carry them. Which items, see "Open decisions".
4. **Placement**: a banner for the severe incidents, a marker and an own slot for the other security stories, a marked bullet for a fix. No Security page and no Security table on the pages.

## Placement

| What                    | Where it shows                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| A severe incident       | A banner on every page, on the Overview and in both messages                                     |
| Any other flagged story | Where it shows today (its project's News, Spotted, "Also talked about"), marked, in its own slot |
| A security fix          | A marked bullet in its project's release section                                                 |

Why, from the spike:

- **A banner crosses pages.** No story in 13 days concerned a data platform. A severe incident in a tool the colleagues use reaches them only through something on every page. A banner also needs no choice of page.
- **The banner rule is three Jev answers**: the story is flagged, its severity is 1.5 or more, and the claim is by the vendor, a researcher or the press. In 13 days that is 5 events, 2 to 3 a week. It passes the backdoored Claude Code extension of 2026-10-31, the maintainer's example.
- **The rule has two known faults.** 2 of its 8 stories were out of scope (security news about something other than AI or data tooling). It leaves out the Claude Code email leak, which was one user's report; that story is then a marked row.
- **No table.** About one security event a day shows across all pages, so a table would hold no row or one row on most days. The fault the reviews found was that such a story was cut: the three Fireworks submissions fell to the row cap, the topic bar and the routing. An own slot fixes that, and the item still shows once, on one page.
- **No Security page.** It would be empty on many days, the colleagues who read only Data would not open it, and it breaks "one item, one page, once" (`../digest-structure/spec.md`).
- **A fix is a bullet, not a row.** About 19 release lines a day have a security effect.

## Shape

Proposed; the maintainer has decided the placement, not these details.

- **Banner**: code-rendered, above `## Highlights` on every page published that day and at the top of the Overview. One line per event: the story's title linked, its source ("a Hacker News post", "Wiz Research") and its date. No model prose: free prose is where security claims went wrong (issue 05 of the 11-10 review). Several submissions of one event are one line.
- **Shown once.** A banner line shows on the day its story is first seen. A later fix or postmortem that clears the rule is a new line that names the earlier one.
- **Marker**: one emoji before the row's title, defined in `GLOSSARY.md`. Not green or red, and not ⚠️, which the Data page uses for a deprecation.
- **Own slot**: a flagged story skips the topic bar (`SPOTTED_MIN_TOPIC_PROBABILITY`) and the per-source row cap. It stays in the list it belongs to and takes no other story's row.
- **Without Jev** (no key, or more than half the calls failing) there is no banner and no marker that day. There is no keyword fallback, see the evidence.
- **A wrong banner is on every page.** The answers are cached like the topic verdicts, so a wrong one is fixed by editing and pinning it, and a trace file lists every flagged story with its three answers.

## Cost

The digest's Jev key and the local key are on one TypeSafe organization, and the spike emptied its credits. Estimates from the spike's token counts; the price per token and the digest's daily use today are not known.

| Part                                                       | Jev tokens a day            |
| ---------------------------------------------------------- | --------------------------- |
| Stories, all four spike questions                          | about 140,000               |
| Stories, severity and claim asked only for a flagged story | about 50,000 (not measured) |
| Release lines, every line of every release body            | about 200,000               |

So the story feed comes first, with the flag asked for every fresh story and the other answers only for a flagged one. The release-line feed waits until a week of the story feed shows what it costs.

## Feeds

1. **Community stories**: one Jev question per fresh story, cached like the topic verdicts; a flagged story gets the severity and claim questions too. The topic request sees only the stories no project took, so this is a request of its own, about 80 to 115 stories a day. A story that clears the banner rule is a banner line; any other flagged story is marked and has its own slot.
2. **Release notes**: a judgment per line of the full release body. A heading check is not enough, see the evidence. The spike found about 19 such lines a day, so a line is not a row: a flagged line is a marked bullet in its project's release section. Built after the story feed, see "Cost".
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

- A state file keeps each shown security item (a banner line, a marked story or a fix bullet) for N days, like the data state's `actions`.
- A new fix line is asked against the open incidents of its project; a new incident against that project's recent fix lines. A match adds "fixes the leak reported on 11-07" or "fixed in v2.1.317 (11-03)" to the item.
- This crosses the show-once rules (`dropShownRepeats`, the hot-issue state, one link once on Spotted). A follow-up is a new item that names the earlier one; the earlier item is not shown again.
- Acceptance case: the email leak (story 11-05, shown 11-07) and v2.1.317 (11-03). Replayed over those days, the story shown on 11-07 says it is fixed.
- Not covered: a later change to a fix. The v2.1.321 line that narrows the email check scores 0.43 as a security line and 0.22 and 0.11 against the leak stories (spike, 2026-11-11), so it is neither flagged nor linked. If such a change must show, it needs a link to the earlier fix line of its project; that is not tested.

## Open decisions

1. **Which items the messages carry.** Decision 3 was made when every item was a row. Proposed: code adds the banner lines to both messages; a marked row or a fix reaches a message only when its page's Highlights pick it.
2. **Page of a flagged story no project took**: proposed is the page of its best page topic, with no bar; a story routed to no page goes to "Also talked about".
3. **A banner that is one user's report with many points.** The email leak had 1,612 points and is not a banner. Points as a third signal are not tested.

## Order of work

1. Spike: done, `spike/results.md`.
1. Placement: decided.
1. The story question with its verdict cache and trace, the banner, and the banner lines in `highlights.json`.
1. The marker and the own slot.
1. A week of runs: the cost in tokens, and every banner checked by hand.
1. Release-line feed, then the incident-to-fix link and its state.
1. `GLOSSARY.md` and `AGENTS.md`, each with the step that changes what they describe.
