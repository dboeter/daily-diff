# 17: One rendering convention across pages

Status: done
Blocked by: None (can start immediately)
Findings: S10, X6, M8, D9, D10, D11, D12 — see `../review.md`

## What to build

The four pages render shared elements the same way and spend no space on noise. On 2026-10-26: "1 comments" on two pages, banner order differing between pages, `**Release**:` vs `**Release:**` across days, an emoji on one heading only, three "No … today" sections on ai-models, a duplicate date prefix in two formats in the Snowflake Item column, a Source column repeating its section, an undocumented 🤖 marker, vendor rows oldest first, and a lone "−" bullet with no "+" beside it.

Decision needed (D11): AGENTS.md says "− for a bullet that opens with GOING_AWAY, + for the rest", but no page writes "+". Ask the maintainer whether to write both signs in the Markdown or keep the minus out of it, and record the answer before changing it.

- [x] Counts pluralise correctly
- [x] One Report Bar/banner template for all pages; one Release label form
- [x] Empty Tracked sections collapse into one "Nothing new from …" line
- [x] Vendor Item text has no date prefix; a single-source section has no Source column; vendor rows sort newest first
- [x] Every row marker (🤖, 🆕, ⏳) and heading emoji is documented or removed
- [x] Highlight signs follow the maintainer's D11 decision and AGENTS.md matches

## Comments

**Maintainer's choice on D11 (2026-10-26):** no signs in the Markdown. Highlights stay plain bullets, with the `GOING_AWAY` (`−`) opener on a bullet about something going away; only the web UI draws the +/− gutter. AGENTS.md's `SIGNED_SINCE`/gutter text is to be updated to match when this ticket is built.

**Built (ticket 17):**
- Counts: `SPOTTED.counts` pluralises points, reactions and comments (`plural`, `src/core/strings.ts`).
- Meta line: every page goes through `REPORT_META.line`: counts first, `Generated:` last (the agents and data pages had it first). Release label: `boldLabelColonInside` rewrites `**Label**:` to `**Label:**` in the repo sections, so the model's form no longer varies by day; it also normalises the other bullet labels (News, Hot issue, Prerelease). The prompt (`prompts.ts`) still lists `**Release**:`; left as is because the hot-issue ticket edits the lines next to it.
- Models page: Lab announcements, New on OpenRouter and the stealth section, when empty, drop their headings and are named in one "Nothing new from … today." line (`MODELS_PAGE.nothingNew`). A failed sitemap, a first crawl or an unavailable catalog still shows its section. The data report's all-quiet repo sections are unchanged (AGENTS.md documents their quiet line as intentional).
- Vendor tables: `vendorTitleLabel` strips "October 23, 2026:" / "Oct 26, 2026:" at render (the stored title stays: title + date is the state key); a section with one source has no Source column; rows show deprecations first, then newest first. D12's other half (why the 10-23 note first appeared on 10-26: feed lag or a late judgment) was not checked.
- Markers: 🤖 and ⚠️ are documented in AGENTS.md (data report, Tables), 🆕/⏳ on stealth rows and the Trends category heading emoji too; 🕵️ is removed from the stealth heading, the only daily-page heading with an emoji.
- D11: the code already writes no `+` (`signListItems` only normalises the `GOING_AWAY` opener); AGENTS.md now says the Markdown carries no `+` and only the web UI draws the gutter.
- Not in the boxes, left: X6 (3) Trends Highlights in bold and (4) no blank line after `## Highlights` on ai-data.
