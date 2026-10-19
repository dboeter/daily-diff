# One new-items pipeline for Policy Watch and the data report

Status: resolved
Type: task
Blocked by: none

## Problem

Policy Watch and the data report's vendor feeds run the same sequence in two copies:

1. Load the state and the verdicts.
2. Fetch.
3. `newItems` against the state.
4. Split record-only items from candidates.
5. Run `select*Items` (`judgeItems` inside).
6. Return `nextState`, `nextVerdicts` and the ranking file.
7. In the builder, save in a fixed order:
   - the trace and the verdicts always;
   - the observed state on a successful fetch;
   - the reported state only once the report exists.

The copies are `fetchPolicyData` (`src/policy.ts:134`) and `fetchVendorData` (`src/data-vendors.ts:163`) for steps 1–6, and `buildPolicyReport` (`src/data-reports.ts:262`) and `buildDataReport` (`src/data-reports.ts:368`) for step 7. They have drifted:

- **Quiet days defer the data report's record-only bundles.** `buildDataReport` returns at `data-reports.ts:382` before `saveDataState`, so the `stages` recorded for stale bundles are not written that day. They are not lost: the next run finds them stale again and records them again, until a report day writes them. The outcome is the same; the protocol differs from Policy Watch, which saves `observedState` on every successful fetch.
- **No `fetchSuccess` on the vendor side.** All feeds failing and a quiet day look the same.
- **`rankedBy` is dropped.** `selectVendorItems` returns it, but `fetchVendorData` drops it.
- **Record-only is decided in two layers.** The policy sources set `recordOnly` themselves (`policy-europarl.ts:96`, `policy-nl.ts:176`). The vendor pipeline decides it inline instead (`data-vendors.ts:176`).
- **`index.ts` builds fallback values by hand.** It builds a full `PolicyData` fallback, including `observedState`, `nextState` and `readerProfile` (`index.ts:233`), and a `{ items: [] }` vendor fallback that saves nothing.

## Solution

Add a module (working name `src/new-items.ts`) that takes items from the fetch to the selected items and owns the pending writes and their order. Each report supplies an adapter:

| Hook                         | Policy Watch                                                       | Vendor feeds                                                                     |
| ---------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| fetch                        | `fetchPolicySources`; success = any source or feed answered        | `fetchVendorFeeds` + 7-day age limit; success = any feed answered                |
| state item (id, date, stage) | the item itself                                                    | `asStateItem` (title + date key; bundle id)                                      |
| record-only                  | reads `recordOnly`, set by the sources (unchanged)                 | sets `recordOnly` on stale bundles in the adapter (moved from `fetchVendorData`) |
| select                       | `selectPolicyItems`, then the jurisdiction sort                    | `selectVendorItems`                                                              |
| state extension              | `deadlines` (`nextDeadlines`, observed and next)                   | none                                                                             |
| files                        | `policy-state.json`, `policy-verdicts.json`, `policy-ranking.json` | `data-state.json`, `data-verdicts.json`, `data-ranking.json`                     |

The module returns:

- the kept items;
- `fetchSuccess`;
- `rankedBy`;
- the adapter's extras (policy: `deadlines` rows, `readerProfile`);
- a pending-writes value with two steps, named here for the plan only: "on fetched" (trace, verdicts, observed state if the fetch succeeded) and "on reported" (the reported state).

The builders call the two steps instead of saving fields by hand. `fetchPolicyData` and `fetchVendorData` keep their names and become a few lines each, built on the module. They catch their own state and Jev errors and return `fetchSuccess: false`, so `index.ts` drops both `.catch` fallbacks.

Record-only stays an adapter decision, carried on the item as `recordOnly`; the module only splits on the flag. Applying `staleOnFirstSight` to every stage item in the module would change Have your say (it keeps open initiatives whose stage started over 30 days ago), the EUR-Lex 30-day look-back edge, Congress and Open States.

## Open decisions (settle before implementing)

- The pending-writes shape: an object with two methods, or two plain write lists the builder passes to one `commit` function. The second is easier to assert in tests without temp files.
- Vendor `fetchSuccess` false but repo sections active: the data report still exists. Should "on reported" then write the reported state? Proposed: yes, it holds no new items, only pruning, as today.
- Policy's `observedState` and `nextState` both carry `deadlines`. Does the extension hook return one function `(state, kept, fetched) → extra fields`, called with `kept = []` for the observed state? Proposed: yes.

## Scope

- In: `src/new-items.ts` (new), `src/policy.ts`, `src/data-vendors.ts`, `src/data-reports.ts` (the save lines of `buildPolicyReport` and `buildDataReport` only), `src/index.ts` (the two fallbacks), `PolicyData` and `VendorData`.
- Keep: `fetchPolicySources` exported (`scripts/jev-lab.ts` uses it); the policy sources' own `staleOnFirstSight` calls; `selectPolicyItems` and `selectVendorItems` as they are.
- Out: the builders' rendering and LLM calls; showing "ranked by Jev" in the data report's meta line (that line comes from `buildProjectReportContent`; follow-up).
- Docs: the AGENTS.md source-file table (new row; `policy.ts`, `data-vendors.ts`, `report-state.ts` rows), the vendor **State** paragraph (observed state saved on quiet days) and the Policy Watch **News age limit** paragraph (two-part save, now shared).

Estimate: ~+150 / −120 lines in src, plus tests. 6 files.

## Done when

- New `src/__tests__/new-items.test.ts` covers the save order once, against temp-dir files and an injected `ask`:
  - the trace and verdicts are written before a no-items return;
  - the observed state only on a successful fetch;
  - the reported state only after "on reported";
  - a failed fetch writes no state.
- Protocol test, data report: a quiet day (no kept items, no repo activity) with a stale bundle writes `stages[bundle]` to `data-state.json` and leaves `reported` unchanged.
- No-behaviour-change test, policy: the existing `buildPolicyReport` save tests (`data-reports.test.ts:73`) and `policy.test.ts` pass with no edits to their assertions. Moving them to the new test file is fine.
- `fetchVendorData` with every feed rejecting returns `fetchSuccess: false`; with no repo activity either, no state file is written.
- `src/index.ts` has no `PolicyData` or `VendorData` literal.

## Comments
