# 12: "No lab or model news today" above Highlights about lab news

Status: done
Findings: 14 [low], see `../review.md`

## Problem

On 2026-11-09 the models page opened its Highlights with "No lab or model news today." The next two bullets reported OpenAI's $11B raise and Anthropic's $3.4B gas-power deal, both from Spotted rows. To a reader that is lab news.

Cause: `NO_MODEL_NEWS_NOTE` (`src/reports/prompts.ts:451`) tells the model to open with that exact bullet when the page has no lab post and no new OpenRouter model, then allows 2 more bullets, which come from Spotted (`src/reports/pages.ts:510`). The bullet means "no new Anthropic or OpenAI post and no new model"; it says more than that.

## What to build

- [x] Reword the bullet so it says only what the code knows, for example "No new lab post or new model today", or drop the bullet and let the page's "Nothing new from …" line carry it
- [x] Update the test that expects the string (`src/__tests__/reports/prompts.test.ts:607`) and `AGENTS.md` (Key conventions, `NO_MODEL_NEWS_NOTE`)
- [x] Check `highlights.json`: a page whose first bullet is this note must not send it as the report's lead

## Comments

- 2026-11-11: the bullet is dropped. `NO_MODEL_NEWS_NOTE` now caps the Highlights at 2 bullets and forbids stating an absence; the page's sections (the "Nothing new from …" line, or a failure line) say what is missing. With no such bullet, `highlights.json` has no note to send as the lead.
