# Vendor items reported twice

Status: resolved
Type: task

Two ways one vendor change reaches the report on two days.

## Evidence

- The Fabric blog post "Retiring the Fabric data agent custom tool in Microsoft Foundry: move to Fabric IQ" was reported on 2026-10-20 and 2026-10-21. The feed's date moved from 2026-10-19 to 2026-10-20, and the state key is title + date (`stateId`, `src/data/vendors.ts`), so `digests/data-state.json` holds both `…fabric iq|2026-10-19` and `…fabric iq|2026-10-20`.
- "Workspace-level package repositories for Databricks Apps": a "will soon be available" note (`whats-coming`) on 2026-10-20, the GA note on 2026-10-21. The prose prompt merges such a pair only when both rows arrive on the same day.

## Scope

- State key per feed: title + date stays for the Azure Databricks feed (it lists notes under two guids) and BigQuery (a note's position in its day moves). Feeds whose guid or link is stable (the Fabric blog, Azure updates) key on it, so an edited date or title is not a new item. Decide per feed in `config.yml` or per parser, whichever is the smaller change; existing state entries must keep working (no mass re-report on the first run after the change).
- A note that announces an upcoming change and a later note that ships it count as one: when the later note arrives, it is reported only if it adds something (a GA after a "coming soon" with a date already given is not new). Approach to decide in the ticket: a Jev question against recently reported titles, or a deterministic link-anchor/title match. Prefer the deterministic one if it covers the Databricks `whats-coming` → release-notes pattern.
- Docs: AGENTS.md (vendor feeds, state).

## Done when

- Tests: a Fabric item whose date changes between runs is not reported again; a Databricks note under two guids is still deduplicated; a GA note following a reported "coming soon" note for the same feature is not reported again (or is, per the decided rule, with a test for it).
- Replaying 2026-10-20 → 2026-10-21 (`data-ranking.json` pools) reports the Fabric item once.
- All checks pass.

## Decision

- Keying: a per-feed `stable_id: true` in `config.yml` (Fabric blog, Azure updates; all `rss`, like Azure Databricks, so not per parser). Old title + date keys still count as reported through `aliases` on the state item; they age out with the 30-day prune.
- Coming soon → GA: deterministic. A note whose title stem (status phrase cut) equals the stem of a coming-soon note ("will soon be", "coming soon") the state reported on an earlier day is skipped, always: a GA note is not reported after its coming-soon note, whether or not that note gave a date. Over the 2026-10-12..21 state it pairs only Databricks Apps package repositories, Genie file upload and feature views (the last two never across days).
- Replay: 10-20 → 10-21 with live feeds reports the Fabric IQ item once; a 10-22 run on the committed state keeps the same 12 items with the old and new keying.
