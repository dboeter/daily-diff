# 17: One rendering convention across pages

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: S10, X6, M8, D9, D10, D11, D12 — see `../review.md`

## What to build

The four pages render shared elements the same way and spend no space on noise. On 2026-10-26: "1 comments" on two pages, banner order differing between pages, `**Release**:` vs `**Release:**` across days, an emoji on one heading only, three "No … today" sections on ai-models, a duplicate date prefix in two formats in the Snowflake Item column, a Source column repeating its section, an undocumented 🤖 marker, vendor rows oldest first, and a lone "−" bullet with no "+" beside it.

Decision needed (D11): AGENTS.md says "− for a bullet that opens with GOING_AWAY, + for the rest", but no page writes "+". Ask the maintainer whether to write both signs in the Markdown or keep the minus out of it, and record the answer before changing it.

- [ ] Counts pluralise correctly
- [ ] One Report Bar/banner template for all pages; one Release label form
- [ ] Empty Tracked sections collapse into one "Nothing new from …" line
- [ ] Vendor Item text has no date prefix; a single-source section has no Source column; vendor rows sort newest first
- [ ] Every row marker (🤖, 🆕, ⏳) and heading emoji is documented or removed
- [ ] Highlight signs follow the maintainer's D11 decision and AGENTS.md matches

## Comments

**Maintainer's choice on D11 (2026-10-26):** no signs in the Markdown. Highlights stay plain bullets, with the `GOING_AWAY` (`−`) opener on a bullet about something going away; only the web UI draws the +/− gutter. AGENTS.md's `SIGNED_SINCE`/gutter text is to be updated to match when this ticket is built.
