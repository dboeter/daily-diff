# Page anatomy: Highlights, tracked part, Spotted, Coming up

Status: ready-for-agent
Blocked by: 01

Spec: the anatomy block in `../spec.md`.

Every daily page reads Highlights, then its tracked part, then Spotted, then Coming up. Signals is left to the weekly page, and Worth a Look goes: it re-listed rows the same page had shown in 47 of 47 cases. This ticket brings AI Agents, Policy Watch and Data Engineering Watch to that layout. The pages tickets 03 and 04 retire (Discussions, Lab Announcements, AI Research, Trending, AI Models) are left as they are.

## Changes

- **No group Overview.** `buildProjectDigestPrompt` (`src/reports/prompts.ts`) stops asking for `## Overview` and writes only the `## <Project>` sections. AI Agents loses 2 Overviews and the data report up to 3. `buildProjectReportContent` must still find each project's `## <name>` heading for the quiet line.
- **AI Agents gets `## Highlights`.** After its two section calls and the Spotted summaries (ticket 01), one prose call reads the rendered groups and the Spotted table and writes 3–5 bullets, most consequential first: a release with breaking changes, a hot regression, a new capability, a notable spotted tool. Each item once, no links (the sections link), about 150 words. The prompt builder goes in `src/reports/prompts.ts` and takes the page name and its rendered body, so ticket 03's Models page reuses it with its own focus line. The section sits right after the meta line. When no project is active and Spotted is empty there is no call and no heading. A failed call leaves `MSG.summaryFailed` under the heading.
- **Policy Watch.** `buildPolicyProsePrompt` writes only `## Highlights`: Signals and Worth a Look go. The deadlines table becomes `## Coming up` (`POLICY_REPORT.deadlinesHeading`) and moves to the end of the page, after News & commentary. It keeps the 30-day window: say so in one line under the heading, so the heading need not.
- **Data Engineering Watch.** The EU data-law links keep their code path under `## EU data law` (a `DATA_REPORT` string) instead of `## Worth a Look`, still the last section. Check that the data prose prompt allows no section beyond Highlights and Across platforms.

## Check

- Tests: the prompts (no Overview, no Signals or Worth a Look on these pages); each page's `##` headings in order, from a builder test with a stubbed LLM.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.

## Docs

AGENTS.md, current state only: the agents report's LLM-call lines ("One LLM call per report over the active projects", the summaries count in Architecture step 3), the Policy Watch layout and deadlines lines, the data report's Layout and Worth a Look lines, and the listing-report layout paragraph in Key conventions, which still describes the pages tickets 03 and 04 retire.
