# 02: A Spotted row without text is shown and can back a Highlight

Status: ready-for-agent
Findings: 2 [medium], see `../review.md`

## Problem

On 2026-11-08 four of the eight models Spotted rows showed `—` (empty candidate text), including the two behind the Highlights. One Highlight, "Anthropic now requires a government ID to create an account", rested on a Tell HN title alone; a commenter in that thread says no ID was asked. Same day: AegisKernel (agents) and "PostgreSQL Internals [pdf] (2023)" (data) with `—`.

Lab posts without page text, `minor` vendor rows and unsummarized Trends rows are already named to the prose call as no Highlight and dropped in code (`dropNoHighlightRows`). Spotted rows are not.

## What to build

- [ ] A Spotted row whose summary is `—` is no Highlight: named to the prose call and dropped by `dropNoHighlightRows`
- [ ] Decide: within a source, a story with a description ranks above one without at similar points, or a description is required once a page has 3 rows
- [ ] Tests replaying the 11-08 models page

## Comments
