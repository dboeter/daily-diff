# Coding standards

How code in this repo should be written. These rules describe the target. When existing code differs, the rule wins: follow the rule in new code, and fix old code while you are working in it.

`AGENTS.md` describes the architecture and how each report behaves. This file covers how to write code.

## Before every commit

Run all of these. Every one must pass:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm readme --check
```

The pre-commit hook runs every check except the tests. Don't skip it with `--no-verify`.

## TypeScript

- Strict mode with `noUncheckedIndexedAccess`. A possibly-missing value is narrowed with a check, a default or an early return, never asserted away with `!` or `as`.
- No `any`. Data from outside the process (API responses, parsed JSON, YAML, model output) comes in as `unknown` or a loose raw type. It is validated once, at the boundary, into a typed value. Code past the boundary trusts the type.
- Model the domain in types: give unions of string literals to closed sets (stages, outcomes, topics), and add a named type for every shape that is passed between modules.
- Use ES modules with explicit `.ts` import extensions, and the `node:` prefix for built-ins (`node:fs`, `node:path`).
- Import types with `type` (`import { type StateItem, ... }`).
- Prefer `const` and pure functions. Return a new value instead of mutating an argument.

## Module structure

- One responsibility per module, grouped by area under `src/`, with the area prefix dropped inside its folder (`policy/relevance.ts`).
- Keep decisions apart from I/O. Ranking, selection, rendering and state transitions are pure functions over plain data, so they are tested without the network. Fetching and saving are thin wrappers around them.
- A function does one thing at one level of abstraction. When a function needs a comment to mark its parts, split it at those comments.
- Export only what another module uses.
- Reuse the shared helpers: `fetchOk` for HTTP, `githubGet` for the GitHub API, `callLlm` for chat models, `judgeItems` for Jev, `ReportedState` for "already shown", `parseFeedItems` for feeds, `escapeRegex` for regexes. Don't write a second version of any of them.

## Errors and failure

- A fetcher never throws. It catches its own failure, logs it and returns its empty value with `fetchSuccess: false`. One broken source degrades one section, never the run.
- Make the cause of a failure visible, not hidden: say in the report or the log what could not be checked, apart from what had nothing new ("Unavailable today" vs "Quiet").
- Catch errors only where you can handle them. Don't wrap code in `try`/`catch` just to rethrow, or to swallow an error without logging it.
- A missing or malformed state or cache file reads as empty (a first run) and is logged. It never crashes the run.
- Log lines start with the area in brackets: `[policy] ...`, `[github] ...`. Never log API keys, tokens or endpoint URLs that carry credentials.

## LLMs and Jev

- Every chat-model call goes through `callLlm`. Never call an SDK client directly: that bypasses the limiter, retries and health gate.
- The model writes only prose and row summaries. Facts are rendered in code from the source data: numbers, dates, legal stages, links, ranks, labels. A figure the model could get wrong comes from code.
- Check model output in code. Parse it against its contract (`N: text`), drop what breaks the rules, and keep a code-written fallback for anything that must appear.
- Every Jev judgment goes through `judgeItems`, with a committed verdict cache and a trace. Each judgment has a keyword fallback for when Jev is unavailable.
- Prompts live in `src/reports/prompts.ts` and `src/reports/prompts-pages.ts`. A rule that appears in several prompts is written once and shared.

## State and idempotence

- Same input, same output: a same-day re-run reports the same items. Write state transitions as pure `next...State` functions, and save them only after the step they record has succeeded.
- Write committed JSON state with one item per line, so diffs stay readable.
- Prune state on a stated age, in a named constant.

## Constants, config and strings

- No magic numbers. Every threshold, cap, window and timeout is a named `UPPER_SNAKE_CASE` constant with its unit in the name (`FETCH_TIMEOUT_MS`, `SPOTTED_MAX_AGE_DAYS`). A comment next to it says why it has that value.
- What the maintainer tunes per source or section (repos, feeds, keywords, watchlists) goes in `config.yml`, loaded and validated in `src/core/config.ts`, with no hidden defaults.
- Every fixed user-facing string goes in `src/core/strings.ts`.

## Naming

- Name things after the domain, in the words of `GLOSSARY.md` and `AGENTS.md` (Spotted, hot issue, stage, verdict).
- Name functions after what they return or do (`selectHotIssues`, `nextDeadlines`, `renderHfTable`); a boolean reads as a question (`isPrerelease`, `staleOnFirstSight`).
- Don't use abbreviations other than well-known ones (`id`, `url`, `llm`).

## Comments

- Comments explain why: the API quirk, the reason for a threshold, the case a filter exists for. What the code does should be clear from the code itself.
- Every exported function gets a one-line JSDoc that states its contract (what it returns, when it throws, what it logs).
- A module that talks to an external API opens with a header comment giving that API's details and limits.
- Comments describe the current code. No history ("used to", "now"), no commented-out code, no TODOs without an issue under `.scratch/`.

## Tests

- Use Vitest, in `src/__tests__/` mirroring `src/`, with fixtures in `src/__tests__/fixtures/`.
- Test behavior through a module's public functions, not its internals. A test name is a sentence about the behavior (`"skips items an earlier day reported"`).
- Tests never touch the network or real API keys. Feed them recorded fixtures, or stub `fetch` at the boundary.
- A bug fix comes with a test that fails without the fix.
- New logic comes with tests for its edge cases: empty input, missing fields, the threshold itself.

## Dependencies

- Use the Node standard library and the existing dependencies first. Add a new package only when it removes real complexity, and say why in the commit.
- Don't add speculative abstractions, options or extension points. Build for the case in hand.

## Changes and docs

- Keep each change small and on one topic. Don't mix refactors into a behavior change.
- When a change alters behavior that `AGENTS.md`, `README.md`, `GLOSSARY.md` or a comment describes, update that text in the same change. Docs describe the current state, never a changelog.
- Commit messages: `<area>: <what changed>`, lower case, in the present tense (`data report: gate community posts on Jev's post kind`).
