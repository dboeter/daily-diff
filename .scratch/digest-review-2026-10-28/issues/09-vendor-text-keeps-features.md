# 09: Vendor items are judged and summarized on their whole feature list

Status: done
Blocked by: None (can start immediately)
Findings: D1 [medium] — see `../review.md`, `../ai-data.md`

## What to build

A vendor row names the feature a data engineer would act on. On 2026-10-28 the Fabric "On-premises data gateway October 2026 release" row listed installer accessibility and compatibility fixes and left out the post's one new capability, "Admin APIs for connections and gateways (Preview)" (tenant-wide REST governance of every connection). The description is cut at 1,000 characters and the Admin APIs start about 1,600 characters in, so Jev judged the same cut text: significance 0.44 at confidence 0.32, unknown, `minor`.

- [x] A vendor description reaches every feature heading of a multi-feature post (headings kept ahead of body text, or a larger budget after stripping boilerplate)
- [x] Jev and the summaries prompt see the same text
- [x] A test on the gateway post's RSS body: the description contains "Admin APIs"
- [ ] A re-judged gateway item (delete its entry in `digests/data-verdicts.json`) is checked for whether it still lands `minor` — not done: it needs a live Jev call, and the gateway item has no entry in this branch's `digests/data-verdicts.json` to delete (0 matches for "On-premises data gateway")

## Comments

From the review: `VENDOR_DESCRIPTION_MAX_CHARS = 1000` (`src/core/rss.ts:69`, the default of `vendorText` at `:75`). The Fabric community page answers a JS challenge; the RSS body at `https://blog.fabric.microsoft.com/en-us/blog/feed/` is the pipeline's input. Lab posts have the same head cut at 1,500 chars (L6, `src/sources/labs.ts:104`); include it if the same helper fits.

Done (2026-10-28):

- **Cause**: the RSS vendor feeds (Azure Databricks, Fabric, Azure updates) did not go through `vendorText`: `fetchRssNotes` called `fetchRssFeed(url, VENDOR_DESCRIPTION_MAX_CHARS)`, so `parseRssItems` flattened the whole post with `plainText` and cut it at 1,000 characters. A heading past the cut was lost to both Jev and the summaries prompt, which both read `item.description`.
- **Changed**:
  - `src/core/rss.ts` `vendorText`: the `<h2>`–`<h4>` headings of a post open the description (`Sections: A; B; C. ` then the body without the heading elements), and the result is cut once at `maxChars`. With no heading, the output is the same as before. `parseRssItems` and `fetchRssFeed` take a `toText` function (default `plainText`, so AI Policy's feeds are unchanged) in place of `maxChars`.
  - `src/data/vendors.ts` `fetchRssNotes`: passes `vendorText`. The RSS vendor descriptions also lose the space before punctuation that `vendorText` already removed for Snowflake.
  - `src/data/snowflake.ts` `isBundlePointer`: ignores the `Sections:` label. Snowflake's release notes have `<h2>` headings, so their descriptions now open with them too. BigQuery's are unchanged because its notes are split on `<h3>`, and its tests pass without edits.
- **Jev cache**: a cached verdict is re-asked only when its fingerprint changes (`judgeItems`, `src/core/jev.ts:289`). The data report's fingerprint is the dates found in the title and description (`datesOf`), so only an item whose added text brings in a new date is re-asked. Every other cached verdict stays as it was judged on the old cut text until it is pruned (30 days unseen), unless its entry is deleted.
- **Not verified**: the network fetch was not approved in this run, so the fixture's `<h2 class="wp-block-heading">` markup is assumed from WordPress, not read from the live Fabric feed. If the live post marks features some other way (`<strong>`, `<h5>`), this fix does not reach them. Check one live item's description before closing D1.
- **Labs (L6)**: left alone. `labs.ts` strips whole page HTML (nav and scripts included) with its own chain, not `plainText`, so the helper does not fit without reworking that extraction.
- **Side effect**: when the summaries call fails, the table shows the descriptions, so a cell of a post with headings now opens with `Sections: …`.
- **Tests**: `describe("vendorText")` in `src/__tests__/core/rss.test.ts` with fixture `src/__tests__/fixtures/fabric-gateway.xml`. A guard checks that plain 1,000-character truncation misses "Admin APIs". Other tests check that every heading, Admin APIs included, opens the description within the cut, that each heading appears once, and that a note without headings is unchanged.
- **Docs**: no AGENTS.md statement is now wrong (it does not mention the description cut). Suggested addition under Data engineering › Vendor feeds: "A vendor item's description is its plain text cut at 1,000 characters (`vendorText`), opened by the post's `<h2>`–`<h4>` headings (`Sections: …`), so Jev and the summaries see every feature of a multi-feature post."
