# 08: News the digest has no source for

Status: needs-triage
Findings: 10 [low], see `../review.md`

## Problem

Of the 19 confirmed misses on 2026-11-07 and 11-08, most were `not fetched`: Meta's new Muse models (high), OpenAI's $11B round, the Claude Dispatch browser-extension exploit, Meta buying Conductor, the GitHub Copilot CLI release and the Slack and Teams GA. Fetched and left out: DeepMind's RSA result (high), OpenAI's updated Model Spec, three US policy stories on a day with no US item.

## Decide

- [ ] Lab posts cover Anthropic and OpenAI only: add Meta AI and Google DeepMind, or leave them to Spotted
- [ ] Funding and acquisition news: in scope for AI Models & Labs or not
- [ ] The fetched-and-excluded lab items: why the DeepMind and Model Spec posts lost (trace of 11-07 and 11-08)

## Comments

- 2026-11-10, from the reviews of 11-09 and 11-10: 8 of the 11 confirmed misses were `not fetched`. 11-10: the Paris Call for AI safety and security, signed by the Netherlands (high); NVIDIA GR00T 2; Pritzker on federal AI rules; Scott Wiener in MIT Technology Review; AWS Nitro Sandboxes; a 128-point Hacker News thread on Claude Code adoption. 11-09: Trump on AI guardrails (Reuters); a Tell HN on Opus 5.5 quality. The two Hacker News threads suggest the keyword filter of `src/sources/hn.ts` or the top-500 cut dropped them: check the day's log. The fetched-and-excluded stories of these two days are issue 10.
