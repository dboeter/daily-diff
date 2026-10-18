# Deepen the report modules

From the 2026-10-18 architecture review (`/tmp/architecture-review-20261018-213102.html`, not in the repo). This continues the work of `d0c1fd0` (`judgeItems`, shared cached Jev judgment) and `2f6b9a8` (`src/report-state.ts`, shared reported-items state): the rules Policy Watch and the data report share should live in one module, and each report module should own its whole flow.

## Tickets

| #   | Ticket                                                      | Blocked by | Behaviour change                                                       |
| --- | ----------------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 01  | One new-items pipeline for Policy Watch and the data report | —          | Data report saves record-only bundles on a quiet day                   |
| 02  | Summarized tables: number rows once, at selection           | 01         | None                                                                   |
| 03  | Report modules own their LLM calls and their empty value    | 01         | The first LLM health gate goes (it can no longer arm)                  |
| 04  | Trending classification through `judgeItems`                | —          | Cache file migrated; answers that arrived while Jev was down are saved |

02 comes after 01 only because both edit `fetchPolicyData` and `selectVendorItems`. 04 is independent.

## Out of scope

- Merging `buildPolicyReport` and `buildDataReport`. The data report's repo sections, `splitProse` and the data-law links don't fit a shared builder. Only the fetch side and the save protocol are shared.
- An LLM port with named calls for the builders (review candidate 5). Easier after 01–03. Not planned yet.
- The listing reports (`buildListingReport`), the policy sources (`POLICY_SOURCES`) and the vendor `PARSERS`. They are already deep enough.

## Rules for every ticket

- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check` pass.
- AGENTS.md describes the new state in the same change (source-file table and the sections named in each ticket), not as an appended note.
- No new dependencies.
