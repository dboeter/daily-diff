# 09: Vendor items are judged and summarized on their whole feature list

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: D1 [medium] — see `../review.md`, `../ai-data.md`

## What to build

A vendor row names the feature a data engineer would act on. On 2026-10-28 the Fabric "On-premises data gateway October 2026 release" row listed installer accessibility and compatibility fixes and left out the post's one new capability, "Admin APIs for connections and gateways (Preview)" (tenant-wide REST governance of every connection). The description is cut at 1,000 characters and the Admin APIs start about 1,600 characters in, so Jev judged the same cut text: significance 0.44 at confidence 0.32, unknown, `minor`.

- [ ] A vendor description reaches every feature heading of a multi-feature post (headings kept ahead of body text, or a larger budget after stripping boilerplate)
- [ ] Jev and the summaries prompt see the same text
- [ ] A test on the gateway post's RSS body: the description contains "Admin APIs"
- [ ] A re-judged gateway item (delete its entry in `digests/data-verdicts.json`) is checked for whether it still lands `minor`

## Comments

From the review: `VENDOR_DESCRIPTION_MAX_CHARS = 1000` (`src/core/rss.ts:69`, the default of `vendorText` at `:75`). The Fabric community page answers a JS challenge; the RSS body at `https://blog.fabric.microsoft.com/en-us/blog/feed/` is the pipeline's input. Lab posts have the same head cut at 1,500 chars (L6, `src/sources/labs.ts:104`); include it if the same helper fits.
