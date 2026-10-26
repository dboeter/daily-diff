# 04: Highlights pick, they don't restate

Status: done
Blocked by: 03
Findings: S3, X5, M6, M7, D5, T10 — see `../review.md`

## What to build

A page's `## Highlights` ranks a few items instead of restating its table, and the day's Highlights (Overview, Telegram, Teams) lead with what each page leads with. On 2026-10-26 the models page gave five bullets for five Spotted rows, ai-data highlighted its weakest vendor note, and the Trends Highlights skipped the page's two lead bullets for star growth on small repos.

- [x] A page's Highlights hold at most 3 bullets, ranked by relevance to a data/AI engineer
- [x] A vendor item with low significance or low confidence does not get a Highlight
- [x] A page with no lab or model news says so instead of padding with Spotted rows
- [x] Each page's Highlights entry includes that page's first bullet
- [x] One subject per bullet; bullets keep their window ("this week")

## Comments

Prompt-side, so the model output itself is unverified until a live run. Page Highlights (`buildPageHighlightsPrompt`), Trends and data Highlights ask for 1–3 bullets ranked for a data or AI engineer, with `HIGHLIGHTS_PICK_RULE` (one subject, keep the window). Kept vendor items under significance level 1 are `minor` (`selectVendorItems`) and named in the data prose prompt as no-Highlight rows; the 10-26 D5 note scored 0.52. The models page passes `NO_MODEL_NEWS_NOTE` when it has no lab post and no new model. `buildHighlightsPrompt` makes each report's first highlight cover its page's first bullet. Tests: `Highlights pick, they don't restate` (prompts-pages.test), `buildPageHighlightsPrompt note` (prompts.test), and the `minor` assertion in data/relevance.test.

**Review fix (2026-10-26):** `minor` now also covers a significance Jev is unsure of (confidence under 0.4): before, an unsure score counted as "Notable" and was never minor, so D5 ("Custom error messages for feature policy rules", 0.52 at confidence 0.25) could still be a Highlight. Test `ticket 04 replay` (data/relevance.test).
