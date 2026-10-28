# 07: A much-discussed policy story reaches the Overview

Status: done
Blocked by: None (can start immediately)
Findings: M4 [medium] (regression of ticket 14 of the 2026-10-26 round); lows L1, L2 — see `../review.md`, `../ai-models-policy.md`

## What to build

Ticket 14 promised that policy-topic stories appear on a daily page or the Overview. On 2026-10-28 two did not appear anywhere: "Anthropic trained Claude on illegally obtained Stanford professors' books" (Jev policy 0.95, 323 points, a $1.5B settlement) and "Police are using AI to pull over drivers for 'suspicious' behavior" (policy 0.69, 279 points). Three `other` essays on AI and work (605, 542, 402 points) took HN's three "Also talked about" slots. Two lows ride along: the Dev.to slot went to an episode of a fiction serial (L1), and "Is my data used for model training?" (205 points), split models 0.40 / policy 0.35, fell under every floor (L2).

Decision needed from the maintainer: how policy competes with `other`. Options: (a) one HN slot reserved for the top policy story that clears `TALKED_ABOUT_MIN_POINTS` (recommended: smallest change, keeps the list at 3); (b) a separate "Policy talk" line on the Overview; (c) rank by topic before points, as Spotted does.

- [x] The maintainer's choice is recorded in this ticket's Comments
- [x] With 10-28's data, the Stanford-books story appears on the Overview
- [x] A story whose topic probabilities split under the Spotted floor but whose two leading topics are both page-less or both kept is not lost (decide with L2 in view, or record it as accepted)
- [ ] AGENTS.md "Community and Spotted" and GLOSSARY.md describe the rule (left for the integration step: see the `Docs:` line below)

## Comments

From the review: `selectTalkedAbout` (`src/spotted/pool.ts:447-461`) sorts every no-page story by points; `TALKED_ABOUT_PER_SOURCE = { hn: 3, lobsters: 1, devto: 1 }` and `TALKED_ABOUT_MIN_POINTS = { hn: 50, lobsters: 10, devto: 20 }` (`:417-422`).

**Maintainer decision (2026-10-28): option (b), a separate policy line.** Policy-topic stories get their own selection (their own per-source slots and points floor, not competing with `other`), keep their `topic` in `talked-about.json`, and the Overview (`index.html`) renders them as a separate list next to "Also talked about". Telegram and Teams are unchanged unless they already read `talked-about.json`.

**Done (2026-10-28).**

- `src/spotted/pool.ts`: `selectTalkedAbout` selects in two lanes, policy first (`POLICY_TALK_PER_SOURCE = { hn: 2, lobsters: 1, devto: 1 }`, `POLICY_TALK_MIN_POINTS` = the same bars as `other`), then the rest under the unchanged `TALKED_ABOUT_PER_SOURCE`/`TALKED_ABOUT_MIN_POINTS`. The lanes share one claimed-link set, so a link in both goes to policy. Rows and `topic` are unchanged, so `talked-about.json`, `dailyShown`, Most discussed and the trace's `talked_about` need no change. `src/index.ts`: comment only.
- `src/core/strings.ts`: `TALKED_ABOUT.policyHeading = "Policy talk"`. `src/cli/manifest.ts`: manifest field `policyTalk`.
- `index.html` `renderOverview`: splits `talked-about.json` on `topic === "policy"` and renders a "Policy talk" list (manifest `policyTalk`, fallback `'Policy talk'`) before "Also talked about", each only when non-empty. Every older file's rows already carry `topic`, so older days render too: their policy rows move into the new list. No new styles or colors.
- Tests (`src/__tests__/spotted/pool.test.ts`, `describe("policy stories")` inside `selectTalkedAbout`): the 10-28 replay (three `other` essays at 605/542/402 and policy at 323/279: Stanford books and police AI both get a policy slot, and the three essays still get HN's three), the policy cap and floor, and a shared link going to policy. The ticket-14 replay's row bound went from 5 to 9 (4 policy slots + 5 other).
- L2 box, decided: `selectTalkedAbout` has no topic-probability floor, so a story split between two page-less topics (policy/other) already goes to the lane of its leading topic and is not lost. A split between two topics with pages (e.g. research and models, which both map to the models page) would need `selectSpotted` to add probabilities per page, set in `index.ts`'s `probabilityOf`, which is outside this ticket's files: **accepted for now**. The L2 story itself (models 0.40 / policy 0.35) splits between a topic with a page and one without, so neither case covers it; it stays lost (accepted).
- No other reader of `talked-about.json` (checked `src/`, `mcp/src/`, `scripts/`): Telegram, Teams and the MCP server are unchanged. `src/spotted/topics.ts` uses only the selected ids (trace `talked_about`); its comment at `:96` ("their best stories go on the Overview's "Also talked about"") should read "the Overview's Policy talk and Also talked about lists", left for the integration step (outside this ticket's files).
- L1 (the Dev.to fiction serial) is unchanged: it is `other`, and its lane is the same as before.

Docs:

- AGENTS.md "Community and Spotted", **Spotted** bullet: "policy and other have none, and their stories with at least `TALKED_ABOUT_MIN_POINTS` (top `TALKED_ABOUT_PER_SOURCE` per source) go in `talked-about.json`, the Overview's "Also talked about" list, and count as shown." → "policy and other have none: policy stories with at least `POLICY_TALK_MIN_POINTS` (top `POLICY_TALK_PER_SOURCE` per source) go in the Overview's "Policy talk" list, then other stories with at least `TALKED_ABOUT_MIN_POINTS` (top `TALKED_ABOUT_PER_SOURCE` per source) in its "Also talked about" list, both in `talked-about.json` (split by `topic`), and count as shown. The two lists do not compete for slots; a link in both goes to policy."
- AGENTS.md "Report outputs", `talked-about.json` row: "the day's best stories routed to `policy` or `other` (no page), for the Overview's "Also talked about" (`selectTalkedAbout`)" → "the day's best stories routed to `policy` and, separately, to `other` (no page), for the Overview's "Policy talk" and "Also talked about" lists (`selectTalkedAbout`; the web UI splits them by `topic`)".
- AGENTS.md "Web UI & RSS Feed": "`#YYYY-MM-DD` is the day's overview (each report's highlights, then Coming up from `coming-up.json`)" → "(each report's highlights, then Policy talk and Also talked about from `talked-about.json`, then Coming up from `coming-up.json`)".
- GLOSSARY.md **Also talked about**: "The Overview's list of the day's most-discussed community stories whose topic has no page (policy, other): AI and work, security incidents, AI law in the news." → "The Overview's list of the day's most-discussed community stories whose topic (`other`) has no page: AI and work, security incidents. Policy stories, AI law in the news, have their own list beside it, **Policy talk**, with its own slots." Add **Policy talk**: "The Overview's list of the day's most-discussed policy-topic community stories, beside Also talked about and not competing with it for slots."
