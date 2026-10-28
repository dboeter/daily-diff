# 05: A lab post without page text is never summarized or highlighted

Status: ready-for-agent
Blocked by: None (can start immediately)
Findings: M1 [medium] (regression of ticket 03 of the 2026-10-26 round), M2 [medium]; lows L7, L8 — see `../review.md`, `../ai-models-policy.md`

## What to build

No summary or Highlight on the models page rests on a URL slug. On 2026-10-28 the OpenAI row "Oracle Apps In Chatgpt" got the prompt line "(no page text)", and the model wrote "enabling users to access Oracle Apps directly within the chat interface" anyway; Highlight 3 and `highlights.json` restated it, and `highlights.json` dropped Anthropic's sourced vulnerability-research post to make room. The same happened on 10-27 (GPT-6.1 Terra). The guess was close this time; nothing makes the next one close.

- [ ] Code writes `—` for a lab post with empty content, whatever the model returns
- [ ] Such a row is named to the Highlights prose call as no Highlight, and a Highlight about it is dropped in code (`dropNoHighlightRows`, as Trends and the data report do)
- [ ] `highlights.json` cannot pick a highlight about such a row
- [ ] Optional, after checking from a GitHub runner: OpenAI's `https://openai.com/news/rss.xml` supplies each post's title, description and publish date (it answered from a local machine on 2026-10-27; CI reachability is unverified). That would also fix L7 (OpenAI row dates are sitemap generation time) and L8 (the `security` and `global-affairs` sub-sitemaps are not crawled)
- [ ] A test: an OpenAI post with empty content renders `—` and yields no Highlight

## Comments

From the review: `src/sources/labs.ts:357` builds the OpenAI item with `content: ""` and `titleFromUrl`; `src/reports/prompts-pages.ts:252` prints "(no page text)" and `:271` holds the `N: —` rule; `buildModelsPage` is `src/reports/pages.ts:417-435`.
