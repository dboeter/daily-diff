# Review 2026-10-28: AI Models & Labs and AI Policy

Pages: `digests/2026-10-28/ai-models.md`, `digests/2026-10-28/ai-policy.md`, the `ai-models` and `ai-policy` entries of `highlights.json`, `talked-about.json`, `coming-up.json`.

The run used CI's LLM settings (OpenRouter, nemotron-3-super free with fallbacks, low reasoning effort), so the model-output findings (M1, M2, M3, L3, L5, L10) are what CI would publish.

### M1 [medium] accuracy

- Location: Lab announcements row "Oracle Apps In Chatgpt", the Summary "OpenAI announces integration of Oracle applications into ChatGPT, enabling users to access Oracle Apps directly within the chat interface."; Highlights bullet 3; `highlights.json` `ai-models[1]`. Regression of ticket 03.
- Problem: the summaries call got no text for this post. Its prompt line is `Oracle Apps In Chatgpt (OpenAI post, https://openai.com/index/oracle-apps-in-chatgpt/) — (no page text)`, with the title rebuilt from the URL slug. The prompt rule for that case is to write `N: —`. The model wrote a full sentence anyway, adding "enabling users to access Oracle Apps directly within the chat interface". The page Highlights restated it and `highlights.json` sent it as one of the two models entries. The real post is "OpenAI expands partnership with Oracle to bring its apps to ChatGPT": "bring business applications and AI agents into ChatGPT and power new Oracle offerings", Tue 27 Oct 2026 07:00 GMT. The guess is close, but it has no source, and it leaves out the agents and the Oracle-offerings half. The same thing happened on 10-27 ("OpenAI introduces GPT-6.1 Terra.", "OpenAI announces building scientific understanding with academic communities."), so this is a pattern, not a one-off.
- Evidence: VERIFIED (code path: `src/sources/labs.ts:357` builds an OpenAI item with `content: ""` and `titleFromUrl`, and `src/reports/prompts-pages.ts:252` prints "(no page text)". Rule at `src/reports/prompts-pages.ts:271`. `curl https://openai.com/index/oracle-apps-in-chatgpt/` answers HTTP 403. `https://openai.com/news/rss.xml` returns the item's real title, description and pubDate from this host.)
- Likely cause: the rule exists only in the prompt. `buildModelsPage` (`src/reports/pages.ts:417-435`) does not force `—` for a post with empty `content`. A possible source: OpenAI's RSS feed carries the title, description and date. Whether CI's runners can reach it is UNVERIFIED.

### M2 [medium] relevance

- Location: `highlights.json` `ai-models`: "Liquid AI releases LFM3…" and "OpenAI integrates Oracle applications into ChatGPT…"
- Problem: of the page's 3 Highlights, `highlights.json` kept the lead (LFM3, as required) and the Oracle partnership. It dropped Anthropic's Frontier Red Team post: an unreleased model wrote five exploit chains (one-click RCE in Chrome, Safari SOP bypass, Android lock-screen bypass, Windows HTTP/3 DoS, zero-click Linux RCE as root), with 62 Chrome CVEs fixed as of Chrome 156. For the developer reader that is the more consequential item, and it is the one backed by page text. The Oracle pick rests only on a URL slug (M1).
- Evidence: VERIFIED (page Highlights against `highlights.json`; text of https://www.anthropic.com/research/discovering-vulnerabilities-with-claude)
- Likely cause: the LLM's pick in `buildHighlightsPrompt` (`src/reports/prompts-pages.ts:414`). Nothing tells that call that the Oracle row had no page text.

### M3 [medium] correctness

- Location: AI Policy, EU table, row "Requirements for qualified independent external evaluators…", second Summary sentence: "The provided text does not specify any direct implications for organisations that deploy AI."
- Problem: the reader sees a sentence about the model's input and a stated absence. It reads like a prompt leak and makes the page look unedited.
- Evidence: VERIFIED (`digests/2026-10-28/ai-policy.md`)
- Likely cause: `src/reports/prompts-pages.ts:139` asks for 2 sentences, the second being "what it means for organisations that deploy AI", and line 140 says "Ground every sentence only in the given text". When the source has no implication, the model can only report that it has none. No rule lets it stop at one sentence, and nothing in code strips such a sentence.

### M4 [medium] relevance

- Location: `talked-about.json`, HN entries. Regression of ticket 14 (box "Policy-topic stories appear on a daily page or the Overview").
- Problem: the 3 HN slots go to the top 3 by points across `policy` and `other` together. All three are `other` essays on AI and work (605, 542 and 402 points). Both `policy` stories were cut and appear nowhere in the edition:
  - "Anthropic trained Claude on illegally obtained Stanford professors' books": policy 0.95, 323 points, 175 comments, about a $1.5B copyright settlement.
  - "Police are using AI to pull over drivers for 'suspicious' behavior": policy 0.69, 279 points, 212 comments.

  AI Policy's only row is the GPAI evaluator report, and HN is not a policy source.

- Evidence: VERIFIED (`spotted-trace.json` topics and `routing` drops; points from `digests/spotted-log.json`)
- Likely cause: `selectTalkedAbout` (`src/spotted/pool.ts:447-461`) ranks every no-page story by points alone, `TALKED_ABOUT_PER_SOURCE.hn = 3`, with no slot per topic.

### L1 [low] relevance

- Location: `talked-about.json` Dev.to entry "Stratagems #32: The AI Logged a Withdrawal. P Took It as Proof." (39 reactions, 2 comments)
- Problem: this is an episode of a fiction serial. It opens with a 36 Stratagems epigraph, then "Previously on this series:" with links to #19, #21 and #29. That is not something the Overview's reader is "talking about". It passes because `other` catches it and the Dev.to floor is 20 reactions.
- Evidence: VERIFIED (`https://dev.to/api/articles/4929675`: tags ai, discuss, programming, career; body)
- Likely cause: `src/spotted/pool.ts:422` (`TALKED_ABOUT_MIN_POINTS.devto = 20`) together with the catch-all `other` topic.

### L2 [low] relevance

- Location: missing story "Is my data used for model training?" (https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training, HN 205 points, 91 comments)
- Problem: Jev split it: models 0.40, policy 0.35, other 0.19, data 0.06. That puts it under `SPOTTED_MIN_TOPIC_PROBABILITY` (`threshold`), and because its topic (`models`) has a page it cannot go to talked-about either. A much-discussed story about Claude's training-data policy, which matters to practitioners advising clients, falls through both nets.
- Evidence: VERIFIED (`spotted-trace.json` `hn:50259406`, `digests/spotted-log.json`)
- Likely cause: `selectSpotted`'s probability floor (`src/spotted/pool.ts:385`) combined with `selectTalkedAbout`'s `pageOf(s) === null` (`src/spotted/pool.ts:454`).

### L3 [low] accuracy

- Location: AI Policy Highlights: "…aim to inform the implementation of evaluation obligations for general-purpose AI under the AI Act." `highlights.json` `ai-policy[0]`: "…third-party evaluators of general-purpose AI models under the AI Act."
- Problem: the page concerns evaluators of GPAI models **with systemic risk** (Art. 55(1)(b) AI Act, GPAI Code of Practice). Both Highlights drop the qualifier and widen the scope to all GPAI. The row summary keeps it.
- Evidence: VERIFIED (https://digital-strategy.ec.europa.eu/en/library/requirements-qualified-independent-external-evaluators-general-purpose-ai-models)
- Likely cause: not traced (LLM wording).

### L4 [low] consistency

- Location: AI Policy meta line, "1 new items ranked by Jev relevance". Regression of ticket 17 (box "Counts pluralise correctly").
- Problem: no singular form.
- Evidence: VERIFIED (`digests/2026-10-28/ai-policy.md`)
- Likely cause: `src/core/strings.ts:227`: the `newItems` string always writes "N new items" and does not use `plural`.

### L5 [low] accuracy

- Location: models Spotted row "There are now 5 inference providers for abliterated DeepSeek", Summary "…offering routing with automatic fallbacks and token-price comparison."
- Problem: the link is AllModels' "Abliterated Model Router" product page. The routing, fallbacks and price comparison are AllModels' features, but the summary credits them to "5 inference providers". The "5" comes from the HN title: the page loads its provider list live ("Loading live DeepSeek provider routes…") and otherwise says "several independent providers".
- Evidence: VERIFIED (https://allmodels.io/llm/abliterated text); the provider count is UNVERIFIED (rendered client-side)
- Likely cause: not traced (LLM merges title and description).

### L6 [low] relevance

- Location: Lab announcements rows "How AI agents shape experts' judgment calls" and "Discovering and exploiting vulnerabilities…", plus Highlights bullet 2
- Problem: both summaries describe the setup and leave out the news.
  - Judgment-calls study: the result is missing. Analysts went with the agent's assigned lean 86% of the time, and 77% reused its arguments while 15% credited it.
  - Vulnerability post: neither the row nor the Highlight says the bugs were reported and fixed (62 Chrome CVEs fixed as of Chrome 156, Apple's fix shipped, Google addressed Android, Windows CVE-2026-33096). A reader could take them for open zero-days.
- Evidence: VERIFIED (the two anthropic.com posts)
- Likely cause: `src/sources/labs.ts:104` `MAX_CONTENT_LENGTH = 1_500` characters of page text, nav included, so the model never sees the results sections.

### L7 [low] correctness

- Location: Lab announcements, OpenAI row Date `2026-10-27`, and the row order
- Problem: an OpenAI row's date is the sitemap `lastmod`, which records when the sitemap was generated. The Oracle URL's lastmod is 2026-10-27T21:01:14.978Z, the run's own time; the RSS pubDate is 07:00 GMT. The day matches today only by chance. On 10-27, "Chatgpt Expanding World Of Work" showed 2026-10-27, but RSS dates it Mon 26 Oct 10:00 GMT. For the same reason an OpenAI post always sorts first in "newest first".
- Evidence: VERIFIED (`digests/labs-state.json`, `https://openai.com/news/rss.xml`, 10-27 page on origin/main)
- Likely cause: `src/reports/markdown.ts:813` renders `p.lastmod`, and `labPosts` sorts by it (`src/reports/pages.ts:368`). `labs.ts` itself notes that OpenAI's lastmod tracks sitemap generation.

### L8 [low] relevance

- Location: Lab announcements (OpenAI coverage)
- Problem: five OpenAI posts from 10-26/27 in its RSS feed never entered `labs-state.json` on main or here: Check Point/Daybreak, Greptile/GPT-6 Astra, CodeRabbit/GPT-6.1 Sol, Codex Ultrafast incident investigation, Fanatics. One of them, `gpt-6-1-sol-coderabbit-code-security`, is in the `security` sub-sitemap, which `subSitemapNames` does not list (`global-affairs`, 162 URLs, is not listed either). Most of these are customer stories, so leaving them out may be intended (UNVERIFIED).
- Evidence: VERIFIED (sitemap index and `security` sub-sitemap fetched; grep of `labs-state.json` on both branches)
- Likely cause: `SITE_CONFIGS.openai.subSitemapNames` (`src/sources/labs.ts:79-89`).

### L9 [low] consistency

- Location: AI Policy EU row, Stage column
- Problem: the cell is empty. Elsewhere an empty cell shows `—` (Spotted Summary, lab Date).
- Evidence: VERIFIED (`digests/2026-10-28/ai-policy.md`)
- Likely cause: not traced (the policy table renderer in `src/reports/markdown.ts`).

### L10 [low] consistency

- Location: models Spotted Summaries for Amazon and DeepSeek. Partial regression of ticket 05 ("own words with one concrete fact, never a copy").
- Problem:
  - The Amazon summary is the meta description with two words swapped: "funneling … headed" became "redirecting … led".
  - The DeepSeek summary is the HN title followed by the description.

  LFM3 and "US AI Labs, Mapped" are proper summaries.

- Evidence: VERIFIED (`digests/spotted-log.json` descriptions against the rendered summaries)
- Likely cause: not traced (the model sees only the description; `STORY_RULES`).

### L11 [low] correctness

- Location: `digests/policy-state.json` `zeroSince` (first run with it)
- Problem: EUR-Lex, European Parliament, Tweede Kamer and Have your say start a quiet streak today, although they fetched 1, 2, 2 and 2 items (all repeats). That is the design (ticket 01 counts judged items, not fetched ones). But EP and Tweede Kamer are watchlist-only and return the same procedures every day, so they will log `[policy] WARN` after `QUIET_SOURCE_WARN_DAYS` (7) unless a watched dossier moves: noise, not a broken feed. This prediction is UNVERIFIED (derived from the rule).
- Evidence: VERIFIED (`git diff origin/main -- digests/policy-state.json`; `sources` header of `policy-trace.json`)
- Likely cause: ticket 01's quiet rule applied to watchlist-only sources.

## Checked and fine

- **Anthropic rows and Highlight 2 against the posts:** drug development (six partners named correctly, own drug discovery), judgment-calls study (50 analysts, Claude Code, causal inference, farming cooperative), vulnerability post (five chains named correctly, unreleased internal model). Dates 2026-10-27 match "Published Oct 27, 2026".
- **Highlight 1 (LFM3):** matches liquid.ai: open-weight, six 2B-class models for text, vision, audio, omni and decision. A lead taken from a Spotted row is within `MODELS_HIGHLIGHTS_FOCUS` ("a new model").
- **Models Spotted selection** (`spotted-trace.json` joined with `spotted-log.json` points):
  - The rows are HN only and stop at `SPOTTED_PER_SOURCE.hn = 6`.
  - Order follows band (round to tenths), then points: band 10 at 127/90/75/5 points, then band 8 at 14/7.
  - Rows 4-6 meet the 5-point HN floor (5, 14, 7).
  - "Anthropic's Disproof of the ETH" (research 0.66, band 7) is `cap`; "GPT-6.1 Terra's price cut" (3 points) and "Is my data used…" (0.40) are `threshold`.
  - Ranks 7-12 follow the 6 agents rows.
  - Summaries match the pages for Amazon (Bloomberg via Futurism: Nova models on "keep the lights on", Abbeel-led effort), LFM3 and "US AI Labs, Mapped" (nine labs, revenue multiples, Anthropic S-1). `—` for the two rows without a description follows the spec.
- **New models: 0 is correct.** The run log's "4 listed in 2 days" are `openai/gpt-6.1-terra{,:batch}` and `openai/gpt-6.1-terra-pro{,:batch}`, reported 2026-10-27 (`digests/models-state.json`, unchanged against origin/main; 10-27 `ai-models.md` lists all four).
- **Meta lines:** "Lab posts: 4 | New models: 0 | Spotted: 6" matches the body. The two empty sections are collapsed into one "Nothing new from …" line (ticket 17). The banner order is the same on both pages, and neither page writes a `+` or `−` sign.
- **AI Policy kept item:** relevance 0.4·0.97 + 0.3·0.51/2 + 0.2·0.38 + 0.1·0.08 = 0.549 ≥ 0.5, and about 0.97 ≥ 0.5 (`src/policy/relevance.ts:241-263`). Trace has `rendered: true`, `rank: 1`. Date 2026-10-21 matches "Publication 21 October 2026". The first summary sentence is accurate. It belongs, if only just: an AI Office step on the Art. 55(1)(b) evaluator requirements is worth knowing for an EU practitioner, but it binds providers of GPAI models with systemic risk, not deployers, and it reached the page 7 days after publication.
- **Ticket 03:** holds for Highlights 1 and 2 (LFM3, the Anthropic post) and for the AI Policy prose, apart from L3's scope widening. The regression is M1.
- **Dropped policy items:** 118 `threshold`. Nothing a Dutch AI practitioner must know was dropped.
  - EU drops are mostly off-topic: the Temu and Booking.com DSA items (about 0.25 and 0.07), 6G funding, the scams dialogue.
  - "Outcomes of the stakeholder meeting on GenAI pilots for public administration & Apply AI" (about 0.24, significance 0.01) and the Human/AI workforce funding call are minor.
  - The best US item, "'Bumper sticker bill': AI kill switch…" (news, 0.482), is US campaign news.
  - The NL drops are Rijksoverheid's non-AI news and Binnenlands Bestuur opinion pieces.
- **Ticket 13:** holds but was not exercised. No US item reached relevance 0.5, so the impact gate decided nothing. "New Mexico judge orders Meta to pay $25B" has unknown impact (0.53 at 0.22) but was dropped on about 0.13, as it should be.
- **`coming-up.json`:** both entries match the Have your say backend (`brpapi/searchInitiatives`). 19292, "Articles 75c – 75d AI Act Implementing Act", feedback ends 2026/11/09 23:59:59 (ISC stage). 14628, "Cloud and AI Development Act", feedback ends 2026/11/11 23:59:59 (adoption stage). The links are the initiative pages. Both match `digests/policy-state.json` `deadlines`.
- **`talked-about.json` mechanics:**
  - HN: top 3 by points among no-page stories (605, 542, 402; the next is Wikipedia at 388), all ≥ 50 points.
  - Lobste.rs: the only candidate has 5 points, under 10.
  - Dev.to: the top `other` story at 39 reactions (≥ 20).
  - Repeats: no 10-27 `talked-about.json` exists on origin/main (first day), and none of the four titles appear on any 10-25/26/27 page there, Trends' 10-26 Most discussed included.
- **Ticket 01:** the policy trace `sources` header lists sources that returned 0 (EDPB, Autoriteit Persoonsgegevens, Internetconsultatie). Every item has `rendered`/`rank`/`dropped_reason`. In the Spotted trace, talked-about stories carry `talked_about: true` and no `dropped_reason`. `llm-trace.json` shows `models-summaries`, `models-highlights`, `policy-summaries`, `policy` and `spotted-summaries` all `ok`. Congress.gov and Open States read `fetched: 0` here only because their keys are unset locally.
- **Ticket 02:** locally the European Commission RSS answered (2 items, the kept one included), and Commission mail resolved its items to site ids (`17594 at …`). CI behaviour is not checkable here.
- **Ticket 04:** models Highlights have 3 bullets (≤ 3). `highlights.json` leads `ai-models` with the page's first bullet (LFM3) and `ai-policy` with its prose's subject.
- **Ticket 10:** all floors applied as described above. No contest entries, and no story older than 7 days.
- **Ticket 14 mechanics:** the four talked-about entries are `other`, marked shown, and taken by no Spotted row. The intent is not met: see M4.
- **Ticket 17:** Spotted counts pluralise ("0 comments", "2 comments"), the meta line has `Generated:` last, and no heading emoji. Regression: L4.

## Not checked

- The Axios story "Anthropic model accessed voter information" (HTTP 403) and the newconstructs IPO PDF: their rows show `—`, and their content was not read.
- The OpenAI Oracle post itself (HTTP 403); its RSS title and description stand in.
- Whether `openai.com/news/rss.xml` answers from GitHub's runners (it answered from this host).
- The `ai-data` and `ai-agents` entries of `highlights.json` and the data items of `coming-up.json` (not my pages).
- The Most discussed rows of Trends (not my pages), beyond checking that the talked-about stories were not repeats from them.
