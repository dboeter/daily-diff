===== 2026-11-10 · AI Agents =====

### Claude Code v2.1.322

kind: release · source: anthropics/claude-code · published: 2026-11-10 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.322
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: ## What's changed - Added fast mode on Vertex in the global, us and eu regions, falling back to standard speed if Vertex refuses it

### Claude Code v2.1.321

kind: release · source: anthropics/claude-code · published: 2026-11-09 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.321
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: ## What's changed - Added Claude Fable 5.2 (`claude-fable-5-2`), now the default Fable model — 1M context, $8/$40 per Mtok with $0.20/Mtok cache reads - Added `--settings ` to `claude remote-control`, which applies a settings file to every session it starts; if the file changes, no new session starts until you restart `claude remote-control` - Fixed MCP OAuth requests sending secrets such as refresh tokens to another host when a server redirected them - Fixed a case where a read-only Bash command ran outside the sandbox without a permission prompt - Fixed a case where Bash permission checks judged a file write from the wrong folder and didn't prompt - Fixed deny rules and protected-file prompts not applying to the file that a `cp` or `mv` into a directory writes - Fixed the "Draws from usage credits" note showing after a switch to Fable on Enterprise seats whose plan includes Fable - Fixed the fallback model sometimes declining a request or mentioning a stopped response when the first model was blocked before replying - Fixed `claude mcp login` printing a SEP-2352 issuer warning each time you sign in again to a server that Claude Code registered with - Fixed `NotebookEdit` deleting or overwriting a notebook's first cell when the call named no cell, on network paths (UNC shares, WSL folders, `/net` mounts) - Fixed Edit changing the first of several matches, replacing a whole file on an empty `old_string`, or editing a notebook as text, on network paths (UNC shares, WSL folders, `/net` mounts) - Fixed `/config` showing Manual as the default permission mode when new sessions start in auto mode; pressing Space on "Auto (default)" now saves Don't Ask, not Plan - Windows: Fixed `FileChanged` hooks stopping for paths set through `watchPaths` after the first shell command, when the session's working directory had a lowercase drive letter - Fixed `--plugin-dir .` and `--plugin-dir ./builtin` writing generated type files for Claude Code's built-in plugins into a `builtin` folder - Fixed context usage estimates overcounting tool definitions when exact token counts are unavailable - Fixed `/compact` showing twice in Remote Control on web and mobile - Fixed plugin auto-updates and `/plugin` marketplace updates downloading a plugin again for each worktree or folder of a repository - Fixed auto mode losing a background subagent's report that had started a turn when the conversation was compacted before Claude answered it - Fixed project skills, commands and agents staying missing after their folder was removed and came back mid-session, such as with `git stash`, including after entering a worktree - Fixed `claude -p` sometimes telling Claude that background commands get 30 minutes when they are stopped after 10 - Fixed `pkill`, `pgrep` and `pidwait` in cloud sessions matching the session's own parent processes - Fixed Claude in Chrome and computer use server processes staying alive after their parent exits behind a proxy that stalls connections - Fixed a large hook output pointing Claude to a file that held another hook's output from the same tool call - Fixed apps that embed Claude Code getting their own PreToolUse hook's `ask` reason instead of another hook's when both asked - Fixed a PreToolUse hook's `ask` being lost when another hook's `defer` finished first and could not be honored - Fixed a rare crash on permission prompts and background tasks - Fixed project skills, commands and agents disappearing from the menu in SDK and desktop sessions after Claude entered a worktree - Fixed `/desktop` on macOS saying Claude Desktop is not installed when it is in `~/Applications` - Fixed OpenTelemetry repository attributes (`vcs.*`) missing from Claude Desktop sessions that start on a pre-started process - Fixed WebFetch passing "No response from model" to Claude as page content when the model reading the page returned no text; the call now fails with a clear error - Fixed screen reader mode delaying the prompt at startup when the system clock moved back while Claude Code was starting - Fixed a command's panel sometimes not coming back after a dialog closed, leaving no panel or prompt on screen until the next redraw - Fixed a project's MCP server being disconnected after the first message in a Claude Desktop Code tab session when the desktop app has an MCP server or extension of the same name - Fixed a turn ending with "API Error: EPROTO: The TLS handshake failed" when the connection broke partway through a reply; the partial reply is kept or the request is retried, as before 2.1.302 - Fixed high memory use in long sessions that repeatedly read single lines from large files - Fixed fast mode losing replies, switching models or retrying for minutes when fast serving is rate-limited, overloaded or failing; it now tries standard speed on the same model first - Fixed one request carrying far more background agent reports than intended after Claude was stopped while several were waiting - Fixed messages from a Claude Desktop Code tab session to your other sessions staying paused after you typed while Claude was still working - Fixed `claude agents` ignoring `--permission-mode`, `--dangerously-skip-permissions`, `--model`, `--effort` or `--agent` typed before `agents` when a flag such as `--verbose` was also on the line - Fixed a case where Remote Control showed as off with "login expired" in the desktop app while its connection was still up, because the app was briefly unable to hand over a sign-in token - Fixed a Remote Control message sent with "Queue for later" reaching Claude in the middle of the running turn - Fixed the git status given to Claude at session start reading as clean when git status failed; it now reads as unavailable - Fixed the git status given to Claude at session start showing the first listed file as staged when its changes were not staged - Fixed a hang or out-of-memory crash when a connector in a cloud session lists resources with very long names […cut]

### [BUG] Claude Team weekly usage reached 100% ~30.5 hours after reset (Nov 4–5, 2026)

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-05 · link: https://github.com/anthropics/claude-code/issues/107390
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · regression; 11 comments, 5 👍; +9 since 2026-11-08
text: ### Preflight Checklist ### What's Wrong? I am experiencing unexpectedly rapid weekly usage consumption on my Claude Team subscription. During October 2026, I regularly used Claude Code heavily for software development. My five-hour session allowance often exhausted within approximately two hours of active work, but I could continue using Claude Code across the week without reaching the weekly limit. However, during the weekly cycle beginning November 4, 2026, my entire weekly allowance was exhausted in approximately **30 hours and 31 minutes**, despite no intentional change to my development workflow. ### Timeline (Sri Lanka time, UTC+05:30) | Date and time | 5-hour usage | Weekly All models | Weekly Fable | |---|---|---|---| | Nov 4, 3:30 AM | — | Weekly reset | Weekly reset | | Nov 4, ~11:05 AM | 100% | 34% | 8% | | Nov 5, ~10:01 AM | 4% | 100% | 12% | The weekly usage increased from 34% to 100% in less than 23 hours. At the time of complete weekly exhaustion, my current five-hour session showed only 4% usage. The next weekly reset is November 11, 2026, at 3:30 AM, leaving almost six days without further included weekly usage. I understand that usage depends on model choice, token consumption, context size, and background agents. However, my normal development workload has not intentionally changed enough to explain this sudden difference. Similar unexplained consumption increases have been reported by Max and other subscribers in GitHub issues #102667, #105240, and #105621. I am requesting an investigation into whether this is caused by changed usage accounting, model/token weighting, increased background consumption, or a metering regression. ### What Should Happen? With broadly comparable development workloads, model usage, and settings, weekly usage consumption should remain reasonably consistent unless there are changes to allowances or how consumption is calculated. If Anthropic recently changed weekly limits, cache/token weighting, or usage accounting, those changes should be explained. If the current consumption is caused by a bug, I would expect the metering problem to be investigated and corrected, with appropriate restoration or compensation for incorrectly consumed usage where applicable. ### Error Messages/Logs ### Steps to Reproduce 1. Sign in to Claude Code using a Claude Team subscription. 2. Begin a new weekly usage cycle. 3. Continue normal software-development work using Claude Code. 4. Monitor the five-hour and weekly usage meters through Settings → Usage or the `/usage` command. 5. Compare weekly consumption against previous weeks with similar workloads. 6. In my case, the weekly reset occurred on November 4, 2026, at 3:30 AM. 7. Approximately 7.5 hours later, weekly usage showed 34%. 8. By November 5 at approximately 10:01 AM, weekly usage reached 100%, while the current five-hour session was only at 4%. This is an observed account-level issue rather than a deterministic reproduction. I cannot establish that other account... […cut]

### [BUG] Claude in Chrome: desktop bridge 403 "OAuth token forbidden" on Windows (token scopes user:inference user:office), Pro plan confirmed by support

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-06 · link: https://github.com/anthropics/claude-code/issues/107922
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · regression; 4 comments, 1 👍; +3 since 2026-11-08
text: ### Preflight Checklist ### What's Wrong? Since ~29 October 2026, Claude in Chrome does not connect to the Claude desktop app (Code tab) on Windows. The desktop app's connection to the cloud bridge `wss://bridge.claudeusercontent.com/chrome/ ` is rejected with 403 every few seconds, so all `mcp__claude-in-chrome__*` tools report "Claude in Chrome is not connected". Support confirmed that my Claude Pro plan is active and is not the cause, but they cannot escalate it from chat. This looks the same as #55827 (Windows, same token scopes), which was auto-closed as a duplicate without a fix. **Environment** - OS: Windows 11 Pro (build 26300) - Claude desktop app: 4.23118 (Code tab), bundled Claude Code 2.1.317 - Chrome extension: Claude in Chrome (`fcoeoabgfenejglbffodgkkbkcdhcgfn`), installed in one Chrome profile only - Plan: Claude Pro (personal, single-user org, bought via Google Play), confirmed active by support - Network: direct connection, no VPN or proxy **Token scopes** - Token the desktop app uses for the bridge: `user:inference user:office` - Claude Code session token in the same app: `user:inference user:file_upload user:profile user:sessions:claude_code user:plugins` Neither includes `user:mcp_servers`. In #62233 the bridge paired only with a token that had `user:mcp_servers`. **What I checked** - The extension's storage has the same `accountUuid` and organization as the desktop app. - There are no `CLAUDE_CODE_OAUTH_TOKEN` / `ANTHROPIC_*` user or system environment variables (unlike the cause in #62233). - Personal plan, so no IP allowlist. **Intermittent:** with the same cached token it sometimes pairs by itself for a few hours (4 Nov, and 5 Nov 00:30–02:15 UTC+2), then the 403 returns. This suggests a server-side check, not a local problem. Also, the Claude side panel in Chrome signs me out after a few seconds or on page refresh. ### What Should Happen? The desktop app's bridge token should be accepted for a Pro account (or the app should request the scopes the bridge needs), so Claude in Chrome pairs and stays connected. ### Error Messages/Logs ### Steps to Reproduce 1. On Windows 11, sign in to the Claude desktop app with a personal Pro account. 2. Install the Claude in Chrome extension in Chrome and sign in with the same account. 3. Open the Code tab and start a session that uses any `mcp__claude-in-chrome__*` tool (e.g. `list_connected_browsers`). 4. The tool reports "Claude in Chrome is not connected", and `main.log` shows the 403 loop above. Already tried (no effect): restarting the desktop app (fully quit) and Chrome; signing out and back in to the desktop app (this creates a new token, still 403); a clean Chrome profile with the extension in one profile only; allowing cookies for claude.ai and turning off VPN and ad-block extensions; updating the desktop app; Claude Code CLI `claude --chrome` ("No browsers are connected"). ### Claude Model None ### Is this a regression? Yes, this worked in a previous version ### Last Working Ve... […cut]

### Pi v1.5.1

kind: release · source: earendil-works/pi · published: 2026-11-09 · link: https://github.com/earendil-works/pi/releases/tag/v1.5.1
digest: shown under AI Agents › Coding Agents & Assistants › Pi
text: ### Breaking Changes - Custom `GrepOperations.readFile` callbacks are no longer called for context lines. The field remains accepted as optional and deprecated so existing integrations still compile. The grep tool now takes context lines from ripgrep and no longer reads matched files itself. To search a remote system, override grep's `execute()`; see Remote Execution - OpenAI-compatible models no longer send `"tools": []` when all tools are disabled in a session that has used tools; the field is omitted. This fixes 400 errors (`tools must not be an empty array`) from vLLM 0.20+, also behind LiteLLM. If your proxy requires `tools` once the history has tool calls, such as older LiteLLM versions in front of Anthropic, set `compat.requiresToolsWithToolHistory: true` for that model in `models.json` ### New Features - **Shell login and logout**: use `pi auth login ` and `pi auth logout ` without starting a session, with API-key and no-browser sign-in options. See Credential commands. - **Idle prompt cache warming**: eligible caches now stay warm for up to 30 minutes between runs when a refresh is expected to pay for itself. See `cacheWarming`. - **Anthropic message threads**: requests send only new messages while the server continues the conversation, with full-request fallback when earlier context changes. See Anthropic compatibility. - **Richer Mermaid diagrams**: pie charts, author-defined styles, clickable labels on supported terminals, and diagrams in expanded branch and compaction summaries. See Display settings and Markdown transformers. - **GitHub Copilot classifiers**: call Microsoft-Decision-1 through codemode `models.classify()` for typed decisions and probabilities. See Use classifier models. - **Package update summaries**: `pi update --extensions` reports each package's npm version or git commit change and distinguishes unchanged, skipped, and warned updates. See Update Pi or packages. ### Added - `pi update` now lists each updated package with its npm version or git commit change, for example `npm:foo 1.2.0 -> 1.3.0`, and prints `Packages are already up to date` when nothing changed. When nothing changed but an update printed a warning, for example because npm left the old version installed after resolving stale registry metadata, it prints `No packages were updated, see the warnings above` instead; in offline mode it prints `Skipped package updates (offline mode)`. `PackageManager.update()` reports each changed package as a new `result` progress event whose `message` holds that line - Anthropic sessions now use message threads: each request sends only the new messages and the server continues from the previous reply, falling back to the full request when the conversation changed (for example after compaction or a tool list change). On by default for the `anthropic` provider on `api.anthropic.com`; set `compat.supportsMessageThreads` in `models.json` to enable it for gateways that forward the `thread` field, or to turn it off. Cache warming does not touch the session's thread - `pi.registerMarkdownTransformer()` takes an optional `{ messageTypes }` that selects the Markdown surfaces a transformer runs on. Besides user, assistant, and thinking Markdown, transformers can now opt into `custom` (custom messages and skill blocks), `summary` (branch and compaction summaries), and `changelog` (What's New, `/changelog`, the Extension Updates notice, and the Update Available note). Without options a transformer runs on user, assistant, and thinking Markdown as before. The built-in Mermaid renderer now also draws diagrams in expanded branch and compaction summaries - `pi auth login ` logs in to a provider from the shell without starting a session, for example `pi auth login radius`. It signs in with an account in the browser and exits; `--api-key` saves an API key instead, and `--no-browser` uses device code or copy-code sign-in instead. Logging in to Radius also configures the Radius MCP server. `pi auth logout ` removes the stored credentials, like `/logout` - `ctx.ui.custom()` overlays now honor the `blocked` option: pi reports blocked program status (OSC 7501) from when the overlay is shown until it calls `done()`, also while it is hidden with `setHidden()`. Closing one overlay keeps other open questions blocked - Added the `qwen-token-plan-individual-cn` provider for Qwen Token Plan Individual on the China endpoint, using `QWEN_TOKEN_PLAN_CN_API_KEY` ( ) - Added Microsoft-Decision-1 classifier support through GitHub Copilot, including codemode `models.classify()` ( ) - Added `compat.promptCacheKeyMode` (`"auto"`, `"enabled"`, or `"disabled"`) to enable prompt cache keys for compatible proxies or omit them for endpoints that reject them. Set it in `models.json` when using pi ( ) - Added `compat.requiresNonNullAssistantContent` for OpenAI-compatible endpoints that require an empty string instead of `null` in assistant messages containing only tool calls. Set it in `models.json` when using pi ( ) - Added syntax highlighting for Dart, Nix, Groovy, and Gradle files in read and write views - Added GLM 5.3 to the Qwen Token Plan Individual model allowlist - Added Claude Fable 5.2 (`claude-fable-5-2`) to the `anthropic` provider ($8/$40 per million input/output tokens, 1M context, 128K output). Like Fable 5.1 it uses per-message effort and mid-conversation system messages; requests its safety classifiers refuse before any output are answered by Claude Opus 5 through server-side fallback and billed at Opus 5's price. Claude Fable 5.2 and Mythos 5.2 on other providers, such as OpenRouter's `anthropic/claude-fable-5.2`, get the same per-message effort support ### Changed - The default model for the `anthropic` provider is now Claude Opus 5.5 (`claude-opus-5-5`) instead of Claude Opus 4.8 […cut]

### Oh My Pi v18.18.6

kind: release · source: can1357/oh-my-pi · published: 2026-11-09 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.6
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ## @oh-my-pi/pi-catalog ### Fixed - LiteLLM lists only the models the configured key can call (its authenticated `/v1/models`), keeping the proxy's metadata for them; a proxy whose `/v1/models` fails now lists no models instead of every model it serves ## @oh-my-pi/pi-coding-agent ### Added - In Tern, a turn's long-press menu on a phone can edit and resend a prompt, retry the turn, open the rewind page on it, or fork the session from it into a new session - A rewind from the transcript says how many turns it dropped and offers Undo on its toast in Tern, which puts the turns and your draft back ### Changed - Browser `role/` selectors in Chrome tabs now match the role and name Chrome's accessibility tree reports, so they reach open shadow roots and skip hidden elements; in Tern every name `observe()` reports selects its element again ( ) ### Fixed - A late usage-limit error from a previous provider no longer blocks or cools down the selected provider; when the old provider has spent its retry budget, a replay-safe turn still tries the selected model without the old quota delay ( ) - Multi-question ask forms in Tern show Submit on the last question tab, not only on the Review tab - MCP `headers` and stdio `env` values that use `!command` now run again on a 401/403 (the request is retried once), on `/mcp reconnect` and other reconnects, and on `/mcp reload`, so servers whose command mints short-lived tokens keep working past expiry instead of staying 401 until restart - Pausing an unapproved plan no longer tells the agent that the draft was approved or to continue executing it, and pausing with `/plan` closes an open plan review so it can no longer save and execute the plan . - Turning off `lsp.enabled` now also stops `write` and `edit` from starting language servers for diagnostics or formatting; previously only the `lsp` tool was disabled ( ) - Fixed background tabs omp borrows (relay `app.target`, `app.cdp_url`) ignoring omp's clicks and keys or timing out on hover and drag; the page reads as visible while omp drives it and hidden again once released ( ) - Fixed the transcript jumping at the screen's top edge while scrolled back during a streamed reply, and the screen dropping two rows when a reply finished ( ) - Focusing a subagent or returning to the main session no longer loses or freezes the next assistant reply when a fast tool turn finishes before the previous reply's links finish resolving, and messages and tool runs that arrive during the switch show exactly once, in order ( ) - `omp gc --strip` now keeps every response of the latest replay turn (including earlier tool-call steps joined by their tool results), reference-only images, and the transcript's file permissions ( ) - Session files whose entries were written without ids are re-indexed when loaded, and migrating old sessions no longer gives two entries the same id ( ) - `wait` and `write proc:// /kill` now say how a settled job's result reached the caller: delivered by the call itself (it finished while the call ran), handed over by this snapshot (it superseded the job's queued completion push, so no duplicate follows), or genuinely late — the last keeps its "not auto-delivered; recovered by this snapshot" warning and adds how long before the call it had finished ( ) - Fixed `ask` notes added with `n` right after picking an answer landing on the previous question instead of the one shown; a Tern click then Note still notes the answer just clicked, and the Note button names it ( ) ## @oh-my-pi/pi-natives ### Fixed - Fixed GTK4 apps such as Files (Nautilus) on X11: element clicks and `computer.elementAt()` now find their elements where they are on screen, and `ax()` no longer marks their enabled controls `(disabled)` ( ) - `grep` no longer searches the file its own output is redirected into, nor standard input redirected from that same file: both are refused with `input file is also the output`, as GNU grep does ( ) ## @oh-my-pi/pi-tui ### Added - The `wait` result's `JobSnapshot` now carries `settledAtMs` (epoch ms when the run settled, absent while it is still running), so a snapshot can tell a result that finished during the call from one recovered from an earlier, never-delivered completion ( ) - Added a `thinking.set` composer action so Tern's phone effort menu can pick a thinking level in one tap - Added All, Running, Done and Parked status scopes with counts to the agent hub's roster, so Tern's phone can filter agents by status - A prompt and a turn's answer list their actions for a phone's long press (`actions.hold`): Copy, Edit & resend (a prompt's), Retry turn, Rewind to here… and Fork from here; the desktop keeps its hover toolbars - A click or tap on a turn on the native rewind page picks it, and the rewind selector can open on a given turn (`startAt`) - A status notice can carry a button on its native toast (`StatusNoticeAction`), such as the Undo after a rewind ### Fixed - Fixed streamed rows being clipped above the screen before they reached scrollback while the working row was up, so a scrolled-back terminal saw rows jump at the screen's top edge and the whole screen dropped when a run ended ( ). `Composer.setRuntimeChildren` takes a `billedChrome` option for roots billed at their current height instead of through the floor. - Fixed rows of a streaming reply, and the top rows of a table taller than the screen, going missing from both the screen and scrollback with `tui.completeScrollback` on; such a table now keeps the column widths it had when it outgrew the screen ( ) ## @oh-my-pi/pi-wire ### Added - `actions.hold` (`TspMenuEntry[]`): what a long press on a touch screen offers, beside `actions.menu`; and `toast`'s `action` / `label` props for a button on the toast What's Changed (15 merged PRs): fix(coding-agent): keep late quota errors off the fallback provider; fix(builtins): refuse to grep the file grep writes its output to; fix(mcp): re-ran command-backed headers on 401 and reconnect; […cut]

### Oh My Pi v18.18.4

kind: release · source: can1357/oh-my-pi · published: 2026-11-09 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.4
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ## @oh-my-pi/pi-ai ### Added - Added the `base64SkipThoughtSignature` compat flag so Gemini gateways that decode `thoughtSignature` as base64 (such as the Hyperspace AI LLM proxy) can receive the unsigned-tool-call bypass sentinel without rejecting the request with a 400 ( ). ### Changed - Providers paused by a `disabled` auth rule (currently Google Antigravity) are left out of the built-in login list, refuse login, token refresh and usage probes, resolve no key from any source, and refuse requests and image generation with the pause reason; stored logins are kept and work again once the rule is removed, and an extension that registers its own login under the paused id takes it back ( ) ### Fixed - Exclusive tools (`edit`, `write`, `eval`, …) called as Cursor MCP tools now keep their place in the tool batch, so a shell or read sent with an edit no longer runs against the old file or starts before an earlier call finishes ( ) ## @oh-my-pi/pi-catalog ### Added - Added Otari gateway provider: `/login otari` with `OTARI_API_KEY`, models discovered live per workspace ( ) - Added the `base64SkipThoughtSignature` Google compat flag, which sends the Gemini unsigned-tool-call bypass sentinel base64-encoded for gateways that decode `thoughtSignature` as bytes ( ). - Added a `disabled " "` auth rule that pauses a provider: no login offers it and nothing calls it, while its code and users' stored logins stay in place ( ) ### Changed - Paused Google Antigravity, since Google may restrict accounts that use it outside its own apps ( ) ## @oh-my-pi/pi-coding-agent ### Added - SDK: `PromptOptions.followUps` queues prompts to run after the prompt, in order; if the prompt never reaches the agent they come back with it in `DroppedPrompt.followUps` ### Changed - The `task` tool no longer advertises a per-call `model` field unless `task.perCallModel` is `on` or the bundled seance is spawnable; a `model` sent anyway is still refused before dispatch ( ) ### Fixed - `/usage`, session statistics, and `omp stats` now include session title spend from both the default fork title and the tiny title model, and tiny-model titles count toward `--max-cost` ( ) - Retries after `--model pi/ ` (or `@ `, ` `) now walk that role's `retry.fallbackChains` entry instead of the `default` chain, including on `--continue` ( ) - Fixed a `->` / `=>` list sent to an idle session running its second item before its first; if the first item can't start (Esc, a refused or failed setup), the whole list goes back to the editor - Fixed auto-compaction repeating every turn when the system prompt and tool schemas alone exceed the compaction budget; it now warns once instead . - Fixed a blank per-call `model` (`""` or whitespace) failing the gate for task calls, eval `agent()` and eval `workpool()` instead of using the agent's configured model ( ) - `task` tool calls with an empty model string or empty model array now use the agent's normal model routing ( ) - Fixed `todo append` without a phase failing instead of adding tasks to the active phase, the last phase, or a new `Tasks` phase ( ). - Learned-only memory guidance no longer tells the model to read a missing `memory_summary.md` ( ). - A `wait` that times out now says how long it waited and how long a back-to-back wait allows, instead of returning a bare still-running snapshot that agents read as an empty result, and the back-to-back reminder tells agents not to start `sleep` jobs to wait longer ( ). - `auth-gateway stdio` now follows a role's configured fallback chain even when `modelRoles` does not set the role (a chat role without its own chain inherits the `default` chain) ( ) - In the Pseudo shell visualization, a `;`-separated chain no longer draws its statement separators as rows of their own, so `echo a; echo b` reads as two statements ( ) - Autoresearch `update_notes` with `append_idea` now creates an `## Ideas` section instead of inserting the bullet before the first heading when notes contain only a similarly named heading such as `## Ideas backlog` or `### Ideas` ( ) - Exclusive tools (`edit`, `write`, `eval`, …) called as Cursor MCP tools now keep their place in the tool batch, so a check sent right after an edit sees the new file and an edit no longer starts before an earlier read finishes ( ) - Quarantined Hindsight memories are now deleted once their 30-day review period ends even when no new memory is quarantined ( ) - The compaction display summary no longer requests reasoning, so thinking models return a summary instead of spending the 512-token cap on reasoning and returning nothing ( ) - Retries on the same model now stop after three consecutive generic aborts instead of spending the whole retry budget ( ) - `lsp.formatOnWrite` no longer re-indents 2/4-space files at 1 space per level when they contain JSDoc/block comments or one-off odd indents, and no longer converts tab-indented files that open with a JSDoc block to spaces - Isolated task sandboxes now finish cleanup after a SIGHUP or other signal even when releasing them takes longer than the agent shutdown grace period . ## @oh-my-pi/pi-mnemopi ### Fixed - Fixed late background embedding writes overwriting newer vectors for updated memories or recreating vectors for deleted memories ( ) - Fixed a second `Mnemopi` instance configured for a different local embedding model silently reusing the first instance's encoder while stamping its vectors with the configured model: local encoders are now cached per model, and a failed load evicts only that model's entry ( ) ## @oh-my-pi/omp-stats ### Fixed - Fixed `omp stats` re-parsing every unchanged session after a filesystem's device number changes, such as across ZFS remounts ( ). ## @oh-my-pi/pi-tui ### Added - `ask` HTML forms with two or more ` `s show one tab per question plus a Review tab in Tern; Next moves on, ←/→ and PgUp/PgDn switch tabs, and Submit lives on Review ( ) […cut]

### Hermes Agent Hermes Agent v0.23.1

kind: release · source: nousresearch/hermes-agent · published: 2026-11-10 · link: https://github.com/nousresearch/hermes-agent/releases/tag/v0.23.1
digest: shown under AI Agents › Coding Agents & Assistants › Hermes Agent
text: # Hermes Agent v0.23.1 **Release Date:** November 9, 2026 > Patch release. This tag rolls up the ~618 PRs merged since v0.23.0 into a stable release for the GitHub release (CLI and installers), the Microsoft Store app, Docker and Hermes Cloud. Full curated notes for this window ship with v0.24.0. **What this patch ships for plugin users:** since the plugin catalog's site deploy on November 9, the published `plugin-catalog.json` was larger than the 2 MiB cap clients accept, so every install silently fell back to the catalog it shipped with. `hermes plugins install ` could not find plugins added since your last update, installed the pin your release shipped instead of the current one, and missed newer `removed` entries. This release raises the cap to 16 MiB, so the live catalog is used again ( , fixes , thanks @100yenadmin). Installs that stay on v0.23.0 or older keep falling back until they update. ## About this release Measured at commit `3b421578588`, the window since v0.23.0 contains **2,578 non-merge commits** across **2,781 changed files** (+151,690 / −62,595), **618 merged PRs** and **409 closed issues**. Also in the window, undocumented here on purpose: Esc backtrack in the TUI and classic CLI (replacing the rewind list picker), group chats that run on a gateway without Desktop and can seat bots from other computers, saved gateway connections shared by Desktop and the Webapp, signing the in-app browser in with your real browser profile and filling saved logins from its address bar, `hermes gateway attach` for local clients, `hermes clipboard image --json`, new plugin API (session-scoped environment values, plugin JSON-RPC methods and events, `llm.oneshot` auxiliary tasks, a compression-stable `conversation_id`, an `on_session_open` hook in the gateway, a `post_curator_run` hook), faster transcript and handoff reads, and a large batch of new plugin-catalog entries. **Full curated release notes for this window ship with v0.24.0**, which will document everything from v0.23.0 onward — highlights, feature areas, and complete contributor credits. Nothing in this window is skipped. ## Updating - Microsoft Store app: updates through the Store. - Desktop app installed from the installer (.exe / .dmg): no change in this release; it updates with the next bundled release. - CLI: `hermes update`, or re-run the installer one-liner. - Docker / Hermes Cloud: `nousresearch/hermes-agent:stable` (or `:latest`).

===== 2026-11-10 · AI Models & Labs =====

### Claude can design electronic prototypes from start to finish

kind: lab-post · source: anthropic · published: 2026-11-09 · link: https://www.anthropic.com/research/claude-electronics-design
digest: shown under AI Models & Labs › Lab announcements
text: 01 Reasoning through geometric problems Testing Claude on real-world electronics design 01 Reasoning through geometric problems 02 Revising designs 03 Using software and documentation 04 Keeping track of constraints and downstream effects 05 Designing for real-world manufacturing 06 Limitations and next steps Published Nov 9, 2026 Team Science A little over a year ago, we began testing how well Claude could design basic electronic circuits. We collaborated with Diode Computers , 1 a company that designs and manufactures circuit boards, to train Claude on simple tasks—for example, on reading a chip’s datasheet and working out which parts a chip needs in order to run. The models we experimented with back then couldn’t reliably lay out a circuit board; they also struggled to design components that fit together. Now, Claude can both design and prototype electronic hardware from start to finish. Engineering an electronic device requires working through many complex steps and practical constraints. You have to not only design and simulate a circuit board, but also reason about the board’s physical layout and how it will behave, model the mechanical components, and write firmware—all while keeping track of which parts are readily available and what a factory is set up to build. To see how newer Claude models have improved in this area, we collaborated with Diode again, this time asking Claude Fable 5.2 to design three electronic devices: a speakerphone, a voice-assistant hub, and a

### Control Room

kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/index/control-room/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Chatgpt Enterprise Aws Marketplace

kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/index/chatgpt-enterprise-aws-marketplace/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Nex AGI: Nex-N2.6

kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/nex-agi/nex-n2.6
digest: shown under AI Models & Labs › New on OpenRouter
text: Nex-N2.6 is an agentic model from Nex AGI, built on [GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash-BF16) with about 321B parameters. It is suited for computer use, coding, and long-horizon tasks that involve tools. Compared with...

### Thinking Machines: Inkling 2 Small (free)

kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/thinkingmachines/inkling-2-small:free
digest: shown under AI Models & Labs › New on OpenRouter
text: Inkling 2 Small is a multimodal mixture-of-experts reasoning model from Thinking Machines Lab, with 17B active parameters out of 594B total. It is the first model in the second Inkling...

### Anthropic: Claude Fable 5.2

kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/anthropic/claude-fable-5.2
digest: shown under AI Models & Labs › New on OpenRouter
text: Claude Fable 5.2 is Anthropic's most capable model for the most demanding technical work, with gains over Fable 5.1 in coding, reasoning, and vision. In prerelease testing it completed otherwise-infeasible...

### Anthropic: Claude Fable 5.2 (batch)

kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/anthropic/claude-fable-5.2:batch
digest: shown under AI Models & Labs › New on OpenRouter
text: Claude Fable 5.2 is Anthropic's most capable model for the most demanding technical work, with gains over Fable 5.1 in coding, reasoning, and vision. In prerelease testing it completed otherwise-infeasible...

### Meta: Muse Ember

kind: model · source: OpenRouter · published: 2026-11-09 · link: https://openrouter.ai/meta/muse-ember
digest: shown under AI Models & Labs › New on OpenRouter
text: Muse Ember is the smallest and most efficient model from Meta that’s designed for complex reasoning execution and the work agents repeat all day: tool calls, coding agent subtasks, routing,...

===== 2026-11-10 · AI Policy =====

### Commission preliminarily finds TikTok’s ‘For You’ feed in breach of Digital Services Act for harmful ‘rabbit holes’ effect

kind: policy-item · source: European Commission · published: 2026-11-06 · link: https://digital-strategy.ec.europa.eu/news-redirect/964582
digest: shown under AI Policy › EU
text: The European Commission has preliminarily found TikTok in breach of the Digital Services Act (DSA) for the so-called ‘rabbit hole effect’ of its recommender system.

### Pennsylvania Enacts Artificial Intelligence Deceptive Advertising Act

kind: policy-item · source: Covington Inside Privacy · published: 2026-11-09 · link: https://www.insideprivacy.com/artificial-intelligence/pennsylvania-enacts-artificial-intelligence-deceptive-advertising-act/
digest: shown under AI Policy › News & commentary
text: On October 22, 2026, the Governor of Pennsylvania signed the Artificial Intelligence Deceptive Advertising Act (Senate Bill 806) (“Act”) into law. The Act joins a growing number of state laws focused on the use of AI in advertising. However, unlike the laws in New York and California, Pennsylvania’s disclosure requirement is not limited to AI-generated... Continue Reading…

===== 2026-11-10 · Data Engineering =====

### Databricks CLI v1.25.0

kind: release · source: databricks/cli · published: 2026-11-09 · link: https://github.com/databricks/cli/releases/tag/v1.25.0
digest: shown under Data Engineering › Databricks › Databricks CLI
text: ### CLI * `databricks aitools install --output json` now reports a more specific `error_category` (`MANIFEST_NOT_FOUND`, `PERMISSION_DENIED`, `FILESYSTEM`) for some failures it reported as `UNCATEGORIZED`. * Suggest `databricks auth logout --profile --delete` when multiple profiles match the same workspace in `databricks auth docker` commands. * Fix `%pip` in Jupyter notebooks opened over `databricks ssh connect` on serverless environment versions 5 and 6 and on dedicated clusters running recent Databricks Runtime versions, which fell back to the stock IPython magic instead of the Databricks one. ### AI Runtime * `databricks air run` now validates the config server-side while it uploads the run artifacts, instead of before, which shortens submission. * Remove `CRITICAL` as a valid `compute.priority_class` value; the AI Runtime API no longer accepts it. ### Bundles * Built-in templates add the workspace ID to `workspace.host` (`?w= `) when the profile or an environment variable sets it, so generated bundles select the right workspace on hosts shared by several workspaces. Welcome messages show the same URL, and `dbt-sql` also adds `?o= ` to the HTTP path it suggests for `dbt init`. * Fix grants of a renamed or recreated catalog, schema, volume or other UC resource staying recorded under the old name, which made the next `bundle plan` propose to apply them again. * Fix permissions of a recreated pipeline, app, dashboard, model serving endpoint or other resource staying recorded under the old ID, which made every later `bundle plan` propose to apply them again. * Add the `postgres_data_apis` resource (Private Preview) for enabling and configuring the Data API of a Lakebase Postgres database. * Fixes : registered model `aliases` are now set in Unity Catalog on deploy instead of being silently ignored. A model without an `aliases` section keeps the aliases set outside the bundle (for example by MLflow), and `aliases: []` removes them. * Include variable declarations and the source of each resolved value in the `--include-locations` output of `bundle validate` and `bundle summary`. * Add `.workspace.URLID` to bundle templates: the workspace ID that `.workspace.URL` adds, or empty, so templates can use it without failing when the ID is unknown. * Expose the workspace of the selected profile to bundle templates as `.workspace`, with `Hostname`, `ID`, and `URL`, so templates can address a workspace on a host shared by several workspaces. A template input named `workspace` takes precedence. ### Dependency Updates * Bump dependencies with known vulnerabilities. * Upgrade `github.com/mattn/go-runewidth` to v0.0.31, which removes ~30ms of startup time from every command. * Update the Go SDK to v0.194.0. * Update the Go SDK to v0.195.0.

### Terraform provider for Databricks v1.142.0

kind: release · source: databricks/terraform-provider-databricks · published: 2026-11-09 · link: https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.142.0
digest: shown under Data Engineering › Databricks › Terraform provider for Databricks
text: ### New Features and Improvements * `databricks_connection` now supports referencing Unity Catalog secrets through the `secrets` argument . * Add resource and data sources for `databricks_lakewatch_datasource`. * Add resource and data source for `databricks_lakewatch_datasource_config`. * Add resource and data source for `databricks_lakewatch_rule_config`. * Add resource and data source for `databricks_lakewatch_alert_config`. * Add resource and data source for `databricks_lakewatch_common_config`. * Add resource and data sources for `databricks_lakewatch_rule`. * Add `databricks_app_slack` and `databricks_app_teams` configuration blocks to `databricks_notification_destination`, and accept `DATABRICKS_APP_SLACK` and `DATABRICKS_APP_TEAMS` as `type` in the `databricks_notification_destinations` data source . ### Bug Fixes * Fix data races when concurrent resource operations access the unified provider's client caches . * Preserve `databricks_pipeline.expected_last_modified` during refresh to avoid post-apply drift .

### Who is actually using your Snowflake MCP server?

kind: community-post · source: Snowflake on Medium · published: 2026-11-09 · link: https://medium.com/snowflake/who-is-actually-using-your-snowflake-mcp-server-683a6cb543d7
digest: shown under Data Engineering › News & discussion
text: How to see who sends queries through MCP, how many and how often, using one join in account usage Snowflake has no column that tells you which MCP server a query came through. It does store the name of the OAuth security integration that every MCP client signs in with. Give each MCP server its own integration, join one column from query history to login history, and you have usage per server, user and day. This article shows how, and where the approach stops working. Setting up a Snowflake-managed MCP server takes a few minutes. A few weeks later, the same client usually comes back with a different question: is anyone using it? Which users, how often, and is it worth it? I get this question from clients regularly. The last one put it as a requirement: a model that contains only queries run by their reporting team through one specific MCP server, without the same people’s Snowsight work, and with user, role, timestamp and volume. Two identical rows in query history My first thought was …

### Databricks Genie app in Microsoft Teams is now generally available

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-in-microsoft-teams-is-now-generally-available
digest: shown under Data Engineering › Databricks
text: The Databricks Genie app in Microsoft Teams is now generally available. Chat with the app in a direct message or mention @Databricks Genie in a channel or group chat to get answers to data questions without leaving Microsoft Teams. See Databricks Genie app in Microsoft Teams.

### Databricks Genie app for Slack is now generally available

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#databricks-genie-app-for-slack-is-now-generally-available
digest: shown under Data Engineering › Databricks
text: The Databricks Genie app for Slack is now generally available. Send a direct message to the app or mention @Genie in a channel or group DM to get answers to data questions without leaving Slack. See Databricks Genie app for Slack.

### Genie Search is now generally available

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-search-is-now-generally-available
digest: shown under Data Engineering › Databricks · 🤖
text: Genie Search is now generally available. Genie Search indexes your organization's knowledge in sources such as Google Drive, Jira, Confluence, and Workday, so Genie One can search all of that knowledge in one place. Azure Databricks indexes each document's permissions with its content and keeps both current, so users see only the documents that they can already access in the source. Genie Search also powers the following features in Genie One: Org directories: Find teammates, browse the org chart, and view profiles from Workday. See Browse org directories in Genie One. Search in Discover: Search Azure Databricks assets and content from connected sources in one place. See Use Genie Search in Genie One. Databricks recommends using Genie Search together with MCP connectors, which let Genie One access live data and take action in the applications your team uses.

### Genie Ontology is now generally available

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-ontology-is-now-generally-available
digest: shown under Data Engineering › Databricks · 🤖
text: Genie Ontology is now generally available. Genie Ontology is the context layer that gives Genie One, Genie Code, and other AI agents a business-aware map of your organization. It combines modeled knowledge that you define in Unity Catalog semantics with learned knowledge that Genie extracts from your assets and usage.

### Shift dates in Lakeflow Jobs parameters with date arithmetic (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#shift-dates-in-lakeflow-jobs-parameters-with-date-arithmetic-beta
digest: shown under Data Engineering › Databricks
text: Dynamic value references in Lakeflow Jobs can now shift a date by a duration before formatting it. For example, {{(job.start_time - 1.day).iso_date}} passes the date of the day before the run started to a task. Date arithmetic is in Beta. See Shift dates with date arithmetic.

### Recover dropped Unity Catalog volumes with UNDROP VOLUME

kind: vendor-note · source: Azure Databricks · published: 2026-11-07 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#recover-dropped-unity-catalog-volumes-with-undrop-volume
digest: shown under Data Engineering › Databricks
text: You can now recover a dropped Unity Catalog volume within 7 days. Find its ID with SHOW VOLUMES DROPPED, then run UNDROP VOLUME WITH ID to restore it with its privileges and tags. Requires Databricks Runtime 19 and above. See UNDROP VOLUME.

### Zhipu AI GLM 5.2 is scheduled for retirement

kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · ends: 2027-02-04 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#zhipu-ai-glm-52-is-scheduled-for-retirement
digest: shown under Data Engineering › Action required
text: Zhipu AI GLM 5.2 is deprecated and will be retired on February 4, 2027. GLM 5.3 is the recommended replacement. See Legacy, deprecated, and retired models for migration guidance.

### Load Unity Catalog tables into PyTorch on AI Runtime (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#load-unity-catalog-tables-into-pytorch-on-ai-runtime-beta
digest: shown under Data Engineering › Databricks · 🤖
text: UCDataset streams rows from Unity Catalog tables directly into PyTorch training loops on AI Runtime, without Spark or a SQL warehouse. It applies filter expressions and deletion vectors as it reads, and splits the matching rows across GPUs and data loader workers. See Load Unity Catalog tables into PyTorch with UCDataset.

### Smart Routing is faster and lower cost, and now routes subagents only (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-05 · link: https://learn.microsoft.com/azure/databricks/release-notes/unity-gateway#smart-routing-is-faster-and-lower-cost-and-now-routes-subagents-only-beta
digest: shown under Data Engineering › Databricks · ⚠️ · 🤖
text: Smart Routing now routes only subagents, not the first prompt. It costs up to 70% less in internal benchmarks and cuts p90 routing latency from 9 seconds to 2 seconds. Smart Routing for Codex is paused. See Select models or use Smart Routing.

### Databricks SQL version 2026.45 is now available in Preview

kind: vendor-note · source: Azure Databricks · published: 2026-11-03 · link: https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202645-is-now-available-in-preview
digest: shown under Data Engineering › Databricks
text: Sections: Share views with or without history. Databricks SQL version 2026.45 is now available in the Preview channel. Review the following section to learn about new features. ALTER SHARE... ADD VIEW and ALTER SHARE... ALTER VIEW now accept the WITH HISTORY and WITHOUT HISTORY clauses. Existing history defaults are unchanged.

### Unifying SQL Pools: Upcoming changes to UI and APIs

kind: vendor-note · source: Microsoft Fabric · published: 2026-11-09 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Unifying-SQL-Pools-Upcoming-changes-to-UI-and-APIs/ba-p/5397390
digest: shown under Data Engineering › Azure / Fabric & GCP · ⚠️
text: Sections: What's changing and when; What this means for customers; Performance and cost considerations for new workspaces; What API consumers should update; Changes to GET API responses; Changes to PATCH API; Before unification (current behavior):; After unification (proposed behavior):; Next steps. SQL pools are Fabric Data Warehouse’s built-in workload management capability. They help administrators organize workloads and control how compute resources are allocated across them. SQL pool configurations are represented differently depending on whether a workspace uses the built-in or custom pool model. With unified SQL pools, we’re removing that distinction and representing all pools through a single configuration model across the UI and APIs. This removes the need to switch between built-in and custom modes, making SQL pool configurations easier to understand and manage consistently across the UI and APIs. This blog provides advance notice of upcoming changes to SQL pool configuration…

### Nov 09, 2026: Skill recommendations and suggestions to create and share skills in CoCo

kind: vendor-note · source: Snowflake · published: 2026-11-09 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-09-coco-skill-recommendations
digest: shown under Data Engineering › Snowflake
text: CoCo now helps you find, create, and share skills as you work. These capabilities are rolling out gradually, so you might not see them in your CoCo sessions yet. They include the following:

### Nov 06, 2026: Anthropic Claude 5.5 and OpenAI GPT-6 models (General availability)

kind: vendor-note · source: Snowflake · published: 2026-11-06 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-06-claude-5-5-openai-gpt-6-ga
digest: shown under Data Engineering › Snowflake · 🤖
text: The following models are now generally available:

### Nov 03, 2026: Snowflake CoCo for Microsoft Excel and Snowflake CoCo for Google Sheets (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-03 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-03-coco-excel-sheets-preview
digest: shown under Data Engineering › Snowflake
text: Snowflake CoCo for Microsoft Excel and Snowflake CoCo for Google Sheets are now available in preview. Each one adds CoCo as a chat pane inside your spreadsheet, connected to your live Snowflake data. From the pane, you can query data with natural language or SQL; build pivot tables, charts, and form

### IPADDRESS data type (General availability)

kind: vendor-note · source: Snowflake · published: 2026-11-08 · link: https://docs.snowflake.com/en/release-notes/2026/10_40
digest: shown under Data Engineering › Snowflake
text: With this release, Snowflake is pleased to announce the general availability of the IPADDRESS data type. An IPADDRESS value stores an IPv4 or IPv6 address as a native 128-bit value. Snowflake validates each address, stores it in a canonical form, and compares values in numeric address order. Use TOI

### CoCo Admin in Snowsight (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-08 · link: https://docs.snowflake.com/en/release-notes/2026/10_40
digest: shown under Data Engineering › Snowflake · 🤖
text: With this release, CoCo Admin in Snowsight is available in public preview. Instead of a manual checklist of steps, CoCo Admin automatically detects the status of CoCo enablement on your account and tells you exactly what remaining steps you need to take to successfully set it up.

### To support your FinOps practices, you can now opt in to compute cost attribution in BigQuery editions (Preview)

kind: vendor-note · source: BigQuery · published: 2026-11-09 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: To support your FinOps practices, you can now opt in to compute cost attribution in BigQuery editions. This feature attributes billed compute charges directly to the query projects that use your administration project's reservation capacity. Allocating costs based on actual commitment and autoscaling slot usage lets you accurately track project-level costs and manage internal chargebacks. This feature is available in Preview.

### Query performance troubleshooting and job and system performance comparison in the BigQuery jobs explorer (GA)

kind: vendor-note · source: BigQuery · published: 2026-11-09 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: Query performance troubleshooting and job and system performance comparison in the BigQuery jobs explorer are generally available (GA). For more information, see Troubleshoot job performance and Diagnose performance regressions by comparing jobs and systems.

### When you create or schedule a pipeline, you can specify the maximum number of concurrently executed pipeline tasks (GA)

kind: vendor-note · source: BigQuery · published: 2026-11-09 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: When you create or schedule a pipeline, you can specify the maximum number of concurrently executed pipeline tasks. This feature is generally available (GA).

### You can use compression functions in GoogleSQL to compress or decompress bytes or string values by using the Zstandard (Zstd) lossless data compression algorithm

kind: vendor-note · source: BigQuery · published: 2026-11-09 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_09_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: You can use compression functions in GoogleSQL to compress or decompress bytes or string values by using the Zstandard (Zstd) lossless data compression algorithm. The following functions are supported: ZSTD_COMPRESS ZSTD_DECOMPRESS_TO_BYTES ZSTD_DECOMPRESS_TO_STRING These functions are in Preview.

===== 2026-11-10 · Community stories =====

### Amazon saves millions by replacing Sonnet 4.6 with Strands Decider

kind: story · source: Hacker News · published: 2026-11-10 · link: https://strandsagents.com/blog/amazon-saves-millions-replacing-sonnet-with-strands-decider/ · discussion: https://news.ycombinator.com/item?id=50436640
digest: shown under AI Models & Labs › Spotted · 75 points, 14 comments
text: Two Amazon engineers swapped Claude Sonnet 4.6 for a decision model in one of the world's biggest internal ticketing systems.

### Claude Fable 5.2 and Mythos 5.2

kind: story · source: Hacker News · published: 2026-11-09 · link: https://www.anthropic.com/claude-fable-and-mythos-5-2 · discussion: https://news.ycombinator.com/item?id=50429068
digest: shown under AI Models & Labs › Spotted · 464 points, 741 comments
text: Claude Fable 5.2 and Claude Mythos 5.2, our new models for the hardest technical challenges. Fable 5.2 sets a new bar in coding, finance, and the sciences.

### Ultorg: The User Interface for Relational Databases

kind: story · source: Hacker News · published: 2026-11-10 · link: https://www.ultorg.com/ · discussion: https://news.ycombinator.com/item?id=50435898
digest: shown under Data Engineering › Spotted · 26 points, 5 comments
text: Ultorg is an efficient, spreadsheet-like user interface for relational databases. Query and edit data across tables and relationships, without SQL.

### Muse Ember: Our smallest, most efficient model

kind: story · source: Hacker News · published: 2026-11-09 · link: https://research.meta.ai/blog/muse-ember · discussion: https://news.ycombinator.com/item?id=50429024
digest: shown under AI Models & Labs › Spotted · 287 points, 118 comments
text: Muse Ember is our smallest and most efficient model, designed for complex reasoning execution and the work agents repeat all day.

### Google Gemini routes personal Drive files and emails to human annotators

kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/thisisme6598/gemini_files/ · discussion: https://news.ycombinator.com/item?id=50429426
digest: shown under AI Models & Labs › Spotted · 531 points, 120 comments
text: Documentation of Gemini File Leaking Behavior.

### Claude Fable 5.2 scores 65 on Artificial Analysis, highest so far

kind: story · source: Hacker News · published: 2026-11-09 · link: https://artificialanalysis.ai/models/claude-fable-5-2 · discussion: https://news.ycombinator.com/item?id=50431144
digest: shown under AI Models & Labs › Spotted · 335 points, 242 comments
text: Analysis of Anthropic's Claude Fable 5.2 (Max, Default Fallback) and comparison to other AI models across key metrics including quality, price, performance (time per Intelligence Index task & time to first answer token), context window & more.

### Show HN: STE80 Humanizer – de-AI text by writing 80% of the way to ASD-STE100

kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/Dodaios/ste80-humanizer · discussion: https://news.ycombinator.com/item?id=50429144
digest: shown under AI Agents › Spotted · 83 points, 24 comments
text: STE80 Humanizer: agent skill that removes AI tells and rewrites text 80% of the way to ASD-STE100 (Simplified Technical English), the method Andrej Karpathy shared.

### Testing Claude on real-world electronics design

kind: story · source: Hacker News · published: 2026-11-09 · link: https://www.anthropic.com/research/claude-electronics-design · discussion: https://news.ycombinator.com/item?id=50429952
digest: shown under AI Models & Labs › Lab announcements
text: We asked Claude to design three electronic devices: a speakerphone, a voice-assistant hub, and a handheld virtual pet. The prototypes worked without any fixes to their circuitry.

### USB: A trust layer for AI skills and MCP servers

kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/PeepSick/usbplus · discussion: https://news.ycombinator.com/item?id=50432661
digest: shown under AI Agents › Spotted · 11 points, 2 comments
text: USB+ — Universal Systems Bridge. One skill format, every agent runtime: 529 skills, 16 target formats, Trust Layer (secscan + mcprobe), zero-dependency CLI, HTTP MCP server.

### Show HN: Airgap-check – find what your AI app silently downloads offline

kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/humanethq/airgap-check · discussion: https://news.ycombinator.com/item?id=50431705
digest: shown under AI Agents › Spotted · 9 points, 0 comments
text: Audit AI repositories for offline (--network none) crashes, silent telemetry, and .env secret routing

### ChatGPT Desktop forwards your SSH agent to remote machines

kind: story · source: Hacker News · published: 2026-11-09 · link: https://news.ycombinator.com/item?id=50422628 · discussion: https://news.ycombinator.com/item?id=50422628
digest: shown under AI Agents › Spotted · 208 points, 73 comments
text: (the source gave no text)

### Why Is AI Slop So Frustrating to Read?

kind: story · source: Hacker News · published: 2026-11-09 · link: https://zonderlabs.com/slop · discussion: https://news.ycombinator.com/item?id=50433799
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: Most AI slop is unclear writing. We break it into three faults and measure them: 78% of Claude Code reply sentences are unclear, vs 11% on Stack Overflow.

### 6 Hours of YouTube and 85 handtyped pages of notes on LLM Inference – Start here

kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/samir-sarwar/samir-vllm · discussion: https://news.ycombinator.com/item?id=50424199
digest: shown under AI Models & Labs › Spotted · 78 points, 12 comments
text: small LLM inference engine from scratch, w/ 6+ hours of youtube tutorials & 85+ pages of handwritten notes included

### Ask HN: How do you evaluate the skills your AI agents use?

kind: story · source: Hacker News · published: 2026-11-09 · link: https://news.ycombinator.com/item?id=50426070 · discussion: https://news.ycombinator.com/item?id=50426070
digest: shown under AI Agents › Spotted · 18 points, 4 comments
text: (the source gave no text)

### Show HN: Glassbrain – Read your agent's brain, know what your agent knows

kind: story · source: Hacker News · published: 2026-11-09 · link: https://github.com/voidixyn/glassbrain · discussion: https://news.ycombinator.com/item?id=50423154
digest: shown under AI Agents › Spotted · 6 points, 1 comment
text: Know what your agent knows: open, diff and review the knowledge graphs agents write. Plain JSON in, one HTML file out.

### How much does it cost to run a text game with LLMs

kind: story · source: Dev.to · published: 2026-11-08 · link: https://dev.to/hiper2d/how-much-does-it-cost-to-run-a-text-game-with-llms-57o7 · discussion: https://dev.to/hiper2d/how-much-does-it-cost-to-run-a-text-game-with-llms-57o7
digest: shown under AI Models & Labs › Spotted · 30 reactions, 32 comments
text: AI costs are confusing. Providers give you a lot of numbers and nothing to actually know how much you are going to pay in the long run. There is no point in these input/cached/output token prices if you have no idea how many reasoning tokens you'll spend on your tasks. How much will be cached. We are going to review the real-world usage of 27 frontier models.

### Top 7 Best Agent Gateways

kind: story · source: Dev.to · published: 2026-11-09 · link: https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi · discussion: https://dev.to/varshithvhegde/top-7-best-agent-gateways-lhi
digest: shown under AI Agents › Spotted · 21 reactions, 3 comments
text: An agent is not just a chat window with better manners. It can call a model five times, search an

### Take Claude Code Above Average: Let Antigravity Review It

kind: story · source: Dev.to · published: 2026-11-09 · link: https://dev.to/gde/take-claude-code-above-average-let-antigravity-review-it-1f3g · discussion: https://dev.to/gde/take-claude-code-above-average-let-antigravity-review-it-1f3g
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: In November 2026, I spent a day building a small tool with Claude Code: a bridge that lets a second

### Don't Write More Prompts. Install These 10 Trending 'Skills' Instead

kind: story · source: Dev.to · published: 2026-11-09 · link: https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc · discussion: https://dev.to/taqui/dont-write-more-prompts-install-these-10-trending-skills-instead-3lpc
digest: shown under AI Agents › Spotted · 20 reactions, 7 comments
text: I found 10 trending skills on GitHub that can boost your agent power a lot, and I had to test them

===== 2026-11-11 · AI Agents =====

### [BUG] DISABLE_TELEMETRY hides Fable 5.2 from the /model picker because feature flags are ignored

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-10 · link: https://github.com/anthropics/claude-code/issues/108726
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · 5 comments, 12 👍; +17 in the last 24h
text: ### What's Wrong? `DISABLE_TELEMETRY=1` does more than disable telemetry. It stops Claude Code from downloading feature flags and makes it ignore the flags cached on disk, so every flag falls back to its compiled default. Features that depend on a flag break silently. The case I hit: with `"env": {"DISABLE_TELEMETRY": "1"}` in `~/.claude/settings.json`, the `/model` picker does not offer Fable 5.2. The "Fable" row is still Fable 5.1: The account has Fable 5.2: `claude --model claude-fable-5-2` works in the same configuration. Same root cause as #36460 (channels unavailable) and #86171 (Monitor tool unavailable). ### What Should Happen? `DISABLE_TELEMETRY` should stop analytics events and nothing else. The model list should be the same with telemetry on or off. With the variable removed, same binary and account: ### Error Messages/Logs With `DISABLE_TELEMETRY=1` (`--debug-file`): Without it: ### Steps to Reproduce 1. Put `"env": {"DISABLE_TELEMETRY": "1"}` in `~/.claude/settings.json`. 2. Run `claude --debug-file /tmp/cc.log`, then `/model`. The Fable row is 5.1 and the log says `[servedCatalog] off (flag)`. 3. Remove the variable, restart, run `/model`. The Fable row is 5.2. ### Claude Model Fable 5.2 ### Is this a regression? I don't know ### Claude Code Version 2.1.322 ### Platform Anthropic API (Claude subscription login) ### Operating System macOS ### Terminal/Shell zsh ### Additional Information What I could see from the debug log and `~/.claude.json`: - The flag `tengu_delegated_quail` decides whether the server's model catalog replaces the compiled picker. My cached value was `{"mode":"shadow","served":"primary","published":"off"}`, but with telemetry off the cached value is not read and the default `{"mode":"off"}` applies. `cachedGrowthBookFeaturesAt` had not moved since the day I set `DISABLE_TELEMETRY`. - The served catalog (`~/.claude/cache/model-catalog/`) lists `claude-fable-5-2` in its main section. - With the catalog off, the picker uses the compiled list plus `additional_model_options` from `/api/claude_cli/bootstrap`, which returns a single legacy row: `claude-fable-5-1[1m]`, label "Fable". Deleting `additionalModelOptionsCache` does not help; the same row is refetched. Workarounds: - Remove `DISABLE_TELEMETRY`. Works, but sends telemetry. - Launch with `CLAUDE_CODE_GB_DISK_CACHE_WHEN_TELEMETRY_OFF=1` in the process environment. Works with telemetry still off, but the cached flags did not refresh. Setting it in the `env` block of `settings.json` has no effect. Suggested fix: keep flag and catalog downloads independent of `DISABLE_TELEMETRY` and `DO_NOT_TRACK`. `CLAUDE_CODE_DISABLE_FEATURE_FLAGS` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` already exist for people who want those off.

### [FEATURE] Desktop app: option to make Enter insert a newline and Ctrl+Enter submit in the chat composer

kind: hot-issue · source: anthropics/claude-code · published: 2026-08-26 · link: https://github.com/anthropics/claude-code/issues/89673
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · 24 comments, 104 👍; +11 in the last 24h
text: ### Feature request Add a way to make **Enter insert a newline** and **Ctrl+Enter (or Cmd+Enter) submit** in the **Desktop app's chat composer**. ### Current behavior - In the Desktop app, Enter always submits the message; the only way to get a newline is Shift+Enter. - `~/.claude/keybindings.json` (e.g. `{"context": "Chat", "bindings": {"enter": "chat:newline", "ctrl+enter": "chat:submit"}}`) works in the terminal TUI as documented, but is completely ignored by the Desktop app's composer. - This was reported in #25087, which was closed without a fix landing — the thread ends with an OS-level Karabiner-Elements workaround that only helps macOS users. There is no equivalent workaround on Windows. ### Why When writing longer, structured prompts (multi-line lists, pasted context plus instructions), it's very easy to accidentally send an incomplete message with a reflexive Enter. Enter-for-newline with a modifier-to-send is the standard convention in many chat/messenger apps, so muscle memory works against the current default. ### Proposed solutions (either would work) 1. Make the Desktop composer respect the `Chat` context in `~/.claude/keybindings.json`, or 2. Add a simple composer setting in the Desktop app: "Enter sends / Enter inserts newline (use Ctrl+Enter to send)". ### Environment - Claude Code Desktop app on Windows 11 (also affects macOS per #25087) 🤖 Generated with Claude Code

### OpenAI Codex 0.167.1

kind: release · source: openai/codex · published: 2026-11-10 · link: https://github.com/openai/codex/releases/tag/rust-v0.167.1
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex
text: ## Changelog Full Changelog:

### UI doesn't start in VS Code extension 26.51021.22027

kind: hot-issue · source: openai/codex · published: 2026-10-24 · link: https://github.com/openai/codex/issues/56655
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex · 78 comments, 85 👍; +27 in the last 24h
text: ### What version of the IDE extension are you using? 26.51021.22027 ### What subscription do you have? Pro ### Which IDE are you using? VS Code ### What platform is your computer? Microsoft Windows NT 10.0.26300.0 x64 ### What issue are you seeing? After upgrading the extension to v26.51021.22027 - Codex doesn't start, with this notification: --- Codex could not start The extension could not start its user interface. --- OS: Windows 11 Pro, 26H2, build 26300.9711 VS Code Version: 1.143.1 (user setup) Commit: e646868227c3e3a9e3f24277c8c7220be42c0be7 Date: 2026-10-22T17:23:22Z Electron: 43.7.7 ElectronBuildId: 15743441 Chromium: 150.0.7871.250 Node.js: 24.21.0 V8: 15.0.245.31-electron.0 @github/copilot: 1.0.100-1 @github/copilot-sdk: 1.0.23-preview.5 OS: Windows_NT x64 10.0.26300 ### What steps can reproduce the bug? Upgrade to this version and restart extensions ### What is the expected behavior? ### Additional information Rolling back to 26.51007.21434 fixes the problem

### Gemini CLI Release v0.68.0

kind: release · source: google-gemini/gemini-cli · published: 2026-11-10 · link: https://github.com/google-gemini/gemini-cli/releases/tag/v0.68.0
digest: shown under AI Agents › Coding Agents & Assistants › Gemini CLI
text: What's Changed (33 merged PRs): Changelog for v0.67.0-preview.0; Changelog for v0.66.0; docs(readme): clarify Gemini CLI scope, limitations, and tool landscape; fix(cli): bound inline history re-render after terminal width changes; fix(ui): handle surrogate pairs when truncating in sanitizeForDisplay; fix(core): make isWithinRoot case-insensitive on Windows; fix(core): recognize dotted Gemini 3 models in supportsMultimodalFunctionResponse; feat(cli): add extension validation command and evaluation tests; fix(core): normalize leading slashes in file search query for @ autocomplete; fix(vscode-ide-companion): register all extension disposables in context.subscriptions; fix(core): list Auto in /model when dynamicModelConfiguration is enabled and preview access is disabled; fix(core,cli): fix instances of incorrect \n escape behavior; fix(core): use PowerShell CIM fallback for Windows IDE process lookup; fix(cli): surface 429 rate limit cool-down and countdown in loading indicator; fix(cli): anchor .git suffix removal to end of repo URL; fix(ci,sdk): run SDK tests in PR CI and fix AgentLoopContext mock in session.test.ts; fix(core): prevent $-pattern corruption in LLM prompt templates; fix(cli): Fixes unexpected truncation and toggle behavior in Expandab…; refactor(cli): decouple ToolGroupMessage from internal type guards and payload structures; fix(core): gate background log stream initialization on execution lifecycle transition; fix(core): honor .git/info/exclude and core.excludesFile in shadow repo; fix(core): flush pending SSE event buffer at stream EOF in CodeAssistServer; fix(core): handle Windows libuv zero-device stat reporting in readSecureFileBuffer; fix(cli): serialize concurrent extension installs with per-extension lock ; fix(core): resolve symlinked paths canonically in GlobTool; fix(cli): add missing active and focus keys to custom theme ui schema; fix(core,cli): preserve selected model across transient fallback, cancel, and rewind; fix(core): prevent interrupted Whisper model downloads from being treated as installed; fix(cli): handle stream failures during extension release downloads; fix(core): preserve explicit gemini-2.5-flash model in dynamic model resolution; fix(hooks): support SubagentStop event mapping and merge hook definitions; fix(cli): await history replay before responding to ACP session/load; fix(sandbox): supply --userns=keep-id for rootless podman;

### OpenCode v2.2.7

kind: release · source: anomalyco/opencode · published: 2026-11-10 · link: https://github.com/anomalyco/opencode/releases/tag/v2.2.7
digest: shown under AI Agents › Coding Agents & Assistants › OpenCode
text: ### Breaking changes #### `@opencode/ai`: `ImageResponse.image` is removed This affects code that imports `@opencode/ai` directly. Read `response.images[0]` instead of `response.image`. #### SDK: fewer endpoints wait for plugins to load On a Location that is still loading plugins, `agent.list` returns the agents loaded so far, and `integration.list`, `usage.limits`, `vcs.init`, `rpc.call` and `artifact.*` no longer wait up to 5 seconds. Entries and actions that a plugin provides appear when it finishes loading, so refresh on the matching `*.updated` event. Model, provider, `generate.*`, `voice.*` and `websearch.query` endpoints still wait. ### Highlights - **GitHub Copilot Auto**: Pick **Auto** in the model picker when your Copilot account has an Auto pool, and Copilot's router chooses the model for each session at the Auto discount. If routing fails, OpenCode falls back to the account's default chat model. - **Side Panel Tab Shortcuts**: Right-click a side panel tab and choose **Close tabs to the right**. `⌘W` now closes side panel tabs wherever focus is, `⌥⌘W` or `Ctrl+Alt+W` always closes the session tab, and `⌘⇧T` reopens the last closed tab of either kind where it was. - **Mark Sessions Read or Unread**: Open the menu on a tab, Home row, project row or inbox card and choose **Mark as unread** to keep its dot until you next visit. ### Core #### Improvements - **MCP Logins Stay Signed In**: Remote MCP servers that rotate refresh tokens no longer sign you out when several clients refresh at once or the token endpoint fails for a moment. - `read` accepts a negative `offset` to read from the end of a file, such as `-50` for the last 50 lines. An offset past the end returns the last lines and the file's line count instead of failing. - When `read` can't find a file, it suggests close names: different capitalization, another extension, a small typo, or the matching path inside the project. - Shell results end with `Exit code: N`. Commands killed by a signal show the signal name, and timeouts say how long they waited and suggest a larger timeout. - Prompt cache warming times its pings from the model's `cache.ttl` by default (`interval: "auto"`), or every 4 minutes without a TTL. Models whose cache outlasts the warming `duration` are no longer pinged. - When MCP servers connect, disconnect or change tools, Code Mode sends the model a short list of what changed instead of the whole tool catalog. #### Bug fixes - GitHub Copilot session costs use the amount Copilot charged instead of the catalog estimate, and content-filter errors name the filter that blocked the response. - GitHub Copilot picks up a new API endpoint after a plan change on its next model refresh, so you no longer have to sign in again. - Remote MCP servers that rotate refresh tokens no longer log you out when the TUI, desktop app, background service or several projects refresh the same login at once. - A temporary failure while refreshing an MCP OAuth token keeps your login for the next try instead of marking the server `needs_auth`. - MCP tool calls no longer fail when the server's result doesn't match the tool's own output schema, so completed actions aren't reported as failed. - MCP prompts stay available when refreshing a server's prompt list fails. - With `background_compaction` on, a background summary no longer stops a running Claude Agent session mid tool call. - After `opencode auth logout` on a `.well-known` integration, its remote providers and policies stop applying until you log back in. - OpenCode Console workspace policies still apply when Console's instructions or skills fail to load. - Cloudflare AI Gateway providers set up with only `gatewayApiKey` now send that key. - A v1 model override that sets only some capabilities no longer resets the others, so catalog capabilities like PDF input are kept. - A v1 provider config that sets both `api` and `options.baseURL` keeps `options.baseURL`. - Legacy model references with an inline variant, such as `"openai/gpt-5#high"`, keep the variant. - A fresh install imports saved provider credentials from the legacy `auth.json`, and skips an invalid one with a warning instead of stopping setup. - Cache warming stops for a session when a ping rebuilds the cache instead of reading it, counts its interval from when a request was sent, and no longer pings during compaction or after the session is deleted. - Tokens and cost from `session.generate` requests, including cache warming pings, count toward the session's totals. - Under zsh, a glob that matches nothing, like `rm *.tmp`, is passed through as bash does instead of stopping the command. - Truncated shell output that starts mid-line drops the partial first line, so the "showing lines X–Y" notice is exact. - On Windows, multi-line commands no longer lose everything after the first line with PowerShell 7 from the Microsoft Store. - `read` no longer cuts an emoji in half when it shortens a long line. - Generated session titles no longer include the model's commentary. Thanks @shanebishop1. - Markdown agents whose `description` starts with a bracketed tag, like `[Beta] Reviews code`, now load. - Markdown agent and command files that fail to load log a warning with the file path and frontmatter error. - Markdown agent discovery skips `node_modules`. - Failed plugin installs from git show git's own error instead of "An unknown git error occurred". ### TUI #### Improvements - The update and confirm dialogs have buttons you can move between with `←`/`→` and `Tab`/`Shift+Tab`. - The model picker no longer has a **Usage** action; use `/usage` instead. #### Bug fixes - Session exports are saved in the current working directory instead of the system temp folder. - Typing a child session's exact ID in the open-session menu lists that session. - The TUI follows the terminal's current light or dark mode instead of a cached palette. ### Desktop #### Improvements - Right-click a side panel tab to **Close tabs to the right**. […cut]

### Pi v1.5.2

kind: release · source: earendil-works/pi · published: 2026-11-10 · link: https://github.com/earendil-works/pi/releases/tag/v1.5.2
digest: shown under AI Agents › Coding Agents & Assistants › Pi
text: ### New Features - **Fork sessions whose folder is gone**: when a session's original folder was moved or deleted, you can now fork it into the current folder instead of only continuing, so later resumes no longer ask. See Continue or switch sessions. ### Changed - When a session's working directory no longer exists, for example after the project folder was renamed, interactive mode now offers `Continue`, `Fork`, or `Cancel` instead of only continuing. `Continue` runs the session in the current directory without storing the choice, as before; `Fork` copies it into the current directory as a new session with a new ID, like `--fork`, so the next resume no longer asks. This applies at startup (`--session`, `--resume`), to `/resume`, to `/import`, and to `ctx.switchSession()` from extensions ( , fixes ) ### Fixed - Fixed `/import` of a session whose working directory no longer exists leaving a copy in the session directory, and continuing it leaving a second copy with the same ID (`s.jsonl` and `s-1.jsonl`); the failed copy is now removed ( , fixes ) - Fixed Anthropic OAuth requests reporting an outdated Claude Code version

### Oh My Pi v18.18.8

kind: release · source: can1357/oh-my-pi · published: 2026-11-11 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.8
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ### Removed - Removed `getConfigAgentDirName()`; use `getAgentDir()`, which also honors `PI_CODING_AGENT_DIR` What's Changed (38 merged PRs): fix(natives): send macOS keys for a window to the sheet focused on it; fix(bash): release session-owned namespaced shells; fix(ai,coding-agent): deliver assistant_message rewrites through Codex native replay; fix(pi-shell): launched git.exe from the guarded git builtin on windows; fix(catalog): stop NanoGPT :thinking siblings from flipping reasoning models; fix(coding-agent): resolve bundled Pi packages from the installed dependency graph; fix(catalog): collapse Gemini 4 Carbon thinking tiers and add pricing; fix(browser): point calls on a tab that is not open at browser.open(); fix(coding-agent): serve non-chat models and full responses from auth-gateway stdio; fix(edit): reveal every file's unseen lines in one seen-line rejection; fix(coding-agent): prefer exact app names when selecting windows; fix(natives): accept aliases in computer role searches; fix(natives): wait for another session's input lock before failing InputBusy; fix(browser): have agents report a step the page cannot do instead of faking it; docs(lsp): corrected isLinter type-intelligence routing docs; fix(catalog): show Factory Droid's Gemini 4 Argon credit promotion; fix(catalog): show list prices for Factory Droid Fable 5.1, GLM 5.2 Fast and Muse Spark Open; fix(coding-agent): keep a child omp's browser tabs out of its parent's Tern pane and cmux workspace; fix(ai,agent): add logger.warn to empty catch blocks; fix(browser-relay): keep a shared child frame attached when one connection turns auto-attach off; fix(coding-agent): preserve role selectors across locales and document waits; fix(tui): gate exit DA1 drain sentinel on active TSP session; fix(ai): retry every concurrent request rejected as too old; fix(coding-agent): wait for aborted bash cleanup before exit; fix(ai): preserve tool strict mode at the Chat Completions gateway; fix(coding-agent): preserve mcp selection across refreshes; fix(natives): restore Finder with its desktop focus after macOS background input; fix(cli): a bare --restore keeps the session --session already named; fix(coding-agent): resolved user config dirs from PI_CODING_AGENT_DIR; fix(tui): delete ask form pictures when the form closes; perf(tui): reuse TranscriptContainer live-entry wrappers across per-frame readers; fix(natives): bumped tree-sitter-md to 0.5.4 to stop deep-nesting crash; fix(grep): split mixed internal URL and local path lists; fix(task): preserve spaces when collecting nested patch paths; fix(ask): restore per-option notes in HTML form dialogs; fix(session): keep recovered runs reported as running after a late settle; fix(ai): heal Claude blocks when the account has no running 5-hour window; feat(coding-agent): add publish tool for hosted pages and claude.ai artifacts; ## @oh-my-pi/pi-ai ### Fixed - Fixed concurrent OAuth requests rejected as `claude_code_version_too_old` failing instead of retrying with the required version - Chat Completions gateway requests preserve explicit tool strict-mode choices, so Codex tools can omit optional arguments when callers set `strict: false` ( ). ## @oh-my-pi/pi-catalog ### Added - Added Muse Ember (`muse-ember-1.0`) on Meta Model API and Muse Code with the `minimal`–`max` reasoning effort ladder and its >200K long-context pricing - Added Gemini 4 Carbon pricing on the Gemini API, Vertex AI, Google Antigravity, and Cursor ($2 input / $0.10 cached / $10 output per 1M tokens through 2026-11-30, then $4 / $0.20 / $20), instead of showing $0 ( ) ### Fixed - Fixed regenerating the catalog marking 18 reasoning models as non-reasoning when NanoGPT's ` :thinking` sibling row had larger limits ## @oh-my-pi/pi-coding-agent ### Changed - `curl -fsSL | sh` and `install.ps1` now install the standalone binary by default, even when bun is present, so installs get delta updates; pass `--source`/`-Source` for a bun package install - Ask forms can attach notes to selected options; those notes accompany the answers separately from submitted form values ( ) ### Fixed - Claude auto-redeem now spends a full saved reset on an account blocked by its weekly limit when the reset also clears the Fable cap; such resets were treated as Fable-only and skipped while Fable usage had room - Fixed agents showing as idle in the Agent Hub while still running after a failed streaming edit preview (`edit.streamingAbort`) auto-recovered the turn ( ) - A browser call on a tab that is not open now says to open it with `await browser.open({ name })` (Python: `await browser.open(name=…)`) and the url and app it was opened with, instead of pointing at the removed `action:"open"` ( ) - Fixed `computer.window({ app })` and `computer.windows({ app })` matching similarly named apps when the exact app name has an open window, such as Google Chrome alongside Google Chrome for Testing ( ) - In Tern, browser `role/` selectors keep input roles and names under Turkish and Azeri locales ( ) - Chrome `role/RootWebArea` waits with `visible` return the document instead of failing, and `hidden` waits keep waiting ( ) - An `omp -p` or other omp that your session's bash tool or eval cell starts inside Tern or cmux no longer picks Tern or cmux from the pane it inherited, so its browser tabs stop floating over your pane ( ) - Browser relay connections sharing a tab no longer lose cross-site frames when another connection disables auto-attachment on its page; automatic children detach locally when their last armed page leaves, while explicitly attached frame subtrees remain usable after opting out ( ) - Browser agents now say when a step can't be done through the page, instead of patching the page with scripts and reporting the step as done ( ) - An extension's `assistant_message` rewrite now reaches the next Codex Responses request: same-model native replay used to resend the captured original text while the transcript showed the rewritten one […cut]

### Oh My Pi v18.18.7

kind: release · source: can1357/oh-my-pi · published: 2026-11-10 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.7
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ## @oh-my-pi/pi-ai ### Added - LiteLLM usage adapter (`@oh-my-pi/pi-ai/usage/litellm`) reporting a gateway's key and user USD budgets ( ) - `UsageApi.replaceConfiguredProviders` registers configuration-sourced usage providers between runtime overrides and the built-in resolver, and `UsageProvider.usesRequestKey` makes aggregate usage probe only the key inference would send ( ) ### Changed - Providers with a `login-warning` auth rule show their account risk before a new login and start it only after the user answers `yes`; any other answer or a cancel stores nothing, and their login-list entry is marked "(at your own risk)" ### Fixed - Claude Fable launch resets now report the Fable weekly limit they clear instead of an unknown window ( ) ## @oh-my-pi/pi-catalog ### Added - Added Muse Ember (`muse-ember-1.0`) on Meta Model API and Muse Code with the `minimal`–`max` reasoning effort ladder and its >200K long-context pricing - Added the `login-warning " "` auth rule, which makes a new login accept the stated account risk first ### Changed - Resumed Google Antigravity behind a login warning instead of pausing it ### Fixed - Morph (`api.morphllm.com`) requests now send `x-session-id`, keeping a conversation on the worker that holds its prompt cache ( ) ## @oh-my-pi/pi-coding-agent ### Added - `/usage` and `omp usage` show LiteLLM key and user budgets for the built-in `litellm` provider and every models.yml provider with `discovery.type: litellm`, unless listed in `disabledProviders` ( ) - Extensions can ask the operator before an interactive quit, or cancel it, with `session_before_shutdown`; a further `/exit` or Ctrl+D skips the pending prompts and closes ( ) ### Changed - Saved-reset auto-redeem is set per window: `codexResets.autoRedeem5h`/`autoRedeemWeekly` and `claudeResets.autoRedeem5h`/`autoRedeemWeekly`/`autoRedeemFable` replace each provider's `autoRedeem`, whose value migrates into the 5h and weekly keys; a Claude Fable launch reset is governed by `autoRedeemFable` alone and spent only for a block that includes the Fable weekly cap, or before expiry when Fable usage is above zero ( ) - Sessions without a prompt UI (such as `omp -p`) no longer spend saved resets while auto-redeem is `unset`, even ones about to expire - Google Antigravity is back in `/login` and `omp login`, marked "(at your own risk)": a new login first explains that Google may suspend accounts that sign in from third-party tools and continues only after you type `yes`; saved Antigravity logins work again - On Windows, the bash tool's description tells the model it runs in an emulated bash environment, not cmd or PowerShell, so it writes bash instead of `dir`, `%VAR%` and other cmd syntax ### Fixed - Extension prompts shown from `session_before_*` handlers no longer time out after 30 seconds while the operator is still answering ( ) - A second exit request now skips pending `worktree.onExit` prompts and keeps those worktrees instead of waiting for an answer ( ) - Advice that makes the agent keep working after it finished no longer comes back a second time, often as a blocker, while the agent is fixing it: advisor reviews of the earlier answer are cancelled and the advisor reviews the fix instead ( ) - On Windows, the bash tool's shell resolves MSYS drive paths (`/c/Users/...`, `/mnt/c/...`) everywhere, so running `/c/.../tool.exe`, `cd /c/...`, `[ -f /c/... ]` and `< /c/...` reach drive C: like they already did for `ls` and other built-in utilities - On Windows, cmd-style command lines such as `dir | find /c /v ""`, `sort /r`, `timeout /t 5` and `whoami /all` in the bash tool run the Windows programs they were written for, instead of pi's GNU-style `find`/`sort`/`timeout`/`whoami` (which read `/c` as drive C: and could walk the whole drive) - Changing or unsetting `PATH` in the bash tool's shell now forgets remembered command locations, as bash does, so a command no longer runs from a directory that has left `PATH` - One slow or flooding collab guest no longer ends sharing for the room: the host drops that guest's backlog and asks it to rejoin, sessions larger than the send budget can be joined, and guest questions nobody received settle as unavailable ( ) ## @oh-my-pi/pi-tui ### Changed - `grep` and `ast_grep` results with no matches render as one line with `0 matches` in the warning color, dropping the separate `No matches found` row ( ) ### Fixed - Saved-reset messages name the Claude Fable weekly limit as "Claude Fable weekly" instead of its raw id ( ) What's Changed (9 merged PRs): feat(extensions): add an interactive pre-shutdown hook; fix(tui): show grep's 0 matches in yellow on one line; fix(shell): resolve MSYS drive paths (/c/...) in the engine on Windows; fix(catalog): pin Morph conversations to one worker with x-session-id; fix(shell): run cmd-syntax command lines through the Windows programs pi's utilities shadow; feat(coding-agent): split saved-reset auto-redeem into 5h, weekly and Claude Fable settings; fix(advisor): stop superseded reviews from re-raising advice the primary is already fixing; fix(collab): keep one guest from ending sharing for the room; feat(ai): report LiteLLM key/user budgets in /usage and omp usage;

### Desktop ws identity lost — server mints identity-bearing ws ticket, message admission is uid:10000 (two accounts)

kind: hot-issue · source: nousresearch/hermes-agent · published: 2026-11-10 · link: https://github.com/NousResearch/hermes-agent/issues/152674
digest: shown under AI Agents › Coding Agents & Assistants › Hermes Agent · type/security; 3 comments, 0 👍; +3 in the last 24h
text: ### Bug Description Desktop messages stop carrying the logged-in Nous user id: server dashboard-auth.log mints ws tickets WITH the correct user_id, but every chat message is admitted as principal "uid:10000". Reproduced with two different Nous accounts (fresh logins), after full app restart, full OS restart and Electron storage cleanup. Related to #152661 (same no_cookie loop signature in dashboard-auth.log), but here the client does complete sign-in and the ticket is minted — identity is lost between the ws ticket and the message admission. ### Steps to Reproduce 1. Desktop app (Windows 11) connected to a remote OAuth-gated gateway (Nous OAuth provider, behind Caddy), user signed in. 2. Log out and log back in (server logs native_token_success with the correct user id); optionally restart the app, reboot the OS, clear Electron storage, or sign in with a second Nous account. 3. Send any chat message. 4. Check server state.db: session_admissions.principal_id and sessions.user_id for the new session. ### Expected Behavior Messages carry the logged-in user's id (nous:nas_user: ) as they did until Nov 7 2026; a session that cannot be identified should fail loudly instead of silently degrading to the shared uid:10000. ### Actual Behavior dashboard-auth.log shows native_token_success and ws_ticket_minted with the correct user_id (67a3ff6f for account 1, 5fc47070 for account 2), and a chat message sent ~60 s later is recorded with session_admissions.principal_id = "uid:10000". Reproduced on both accounts back-to-back; persists for days; 11+ hours after a full client OS restart the admission is still uid:10000. ### Affected Component Other, Configuration (config.yaml, .env, hermes setup) ### Messaging Platform (if gateway-related) N/A (CLI only) ### Debug Report ### Operating System Server: Debian 13 (trixie), Docker/s6, behind Caddy 443. Clients: Windows 11 laptop (sleep/wake in the timeline) ### Python Version 3.14.9 ### Hermes Version v0.23.0 (2026.9.24), upstream 2bd378ed ### Additional Logs / Traceback (optional) ### Root Cause Analysis (optional) Identity attribution for relayed desktop messages is client-supplied: gateway/relay/ws_transport.py:214 (_event_from_wire) copies user_id straight from the wire frame (src.get("user_id")), and the desktop's embedded engine stamps its local owner id (f'uid:{os.getuid()}' — session_worker_reservation.py:60) whenever its engine-side Nous binding is missing; so when that binding silently drops, every message is forwarded as uid:10000 while the shell-level login stays healthy. The server-minted ws ticket (hermes_cli/dashboard_auth/ws_tickets.py:36-47, mint_ticket(user_id=…)) is consumed only for ws-upgrade authorization (hermes_cli/web_server_chat.py::_consume_ws_ticket → ws._hermes_auth_identity → hermes_cli/web_routers/chat_ws.py:664 gateway_ws → handle_ws → AuthorityConnection) and is never joined to per-message attribution — which is exactly why dashboard-auth.log shows tickets with the correct nas_user id ... […cut]

### OpenShell OpenShell v0.1.8

kind: release · source: NVIDIA/OpenShell · published: 2026-11-10 · link: https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.8
digest: shown under AI Agents › Agent Tooling › OpenShell
text: ### Upgrade notes - Static provider credentials without placement metadata now resolve only in the `Authorization` header or through explicitly enabled body/WebSocket rewrite policies, so custom headers such as `x-api-key`, query parameters, and path slots need an explicit placement declaration. Upgrade the gateway before the supervisor, and update existing imported profiles as needed, since editing reference YAML alone does not update the gateway catalog. `auth_style` selects the active placement, and fields for other styles are ignored. - REST endpoints now return `403` for HTTP upgrade requests in both enforce and audit modes. Configure WebSocket traffic with `protocol: websocket` and explicit handshake and message rules; `websocket_credential_rewrite: true` now requires a WebSocket endpoint. - OCSF sandbox attribution moved: supervisor events use `device.container.uid` and `device.container.name`, gateway API Activity and Detection Finding events use `resources` entries with `type: "sandbox"`, and other gateway classes use `unmapped.sandbox_id` and `unmapped.sandbox_name`. SIEM parsers that read top-level `container.uid` or `container.name` must update their mappings. - Sandboxes now fail to launch when a filesystem policy path goes through a symlink inside a writable workspace, including in best-effort mode. Use the symlink's target path in the policy instead. - Transparent TCP connections now evaluate IPv4-mapped IPv6 destinations as IPv4. Change endpoint rules such as `host: "::ffff:203.0.113.7"` to `host: "203.0.113.7"`. - The `openshell` Python SDK is now published from ai-openshell/sdk-python starting with `0.1.8`, and core GitHub Releases no longer attach its wheel or checksum. Keep installing it with `pip install openshell` from PyPI. - The Go SDK module `github.com/NVIDIA/OpenShell/sdk/go` is deprecated. Switch to `github.com/ai-openshell/sdk-go`, now developed in ai-openshell/sdk-go. - The Go SDK now shares `oidc_token.json` with the CLI, and `v1.RefreshableToken` no longer returns an expired cached token after a failed refresh for any token source. Run `openshell gateway login` once to replace token files written by earlier Go SDK releases. - Gateway interceptors can now intercept sandbox start, stop, suspend, and resume RPCs. After you upgrade and restart the gateway, dynamic interceptor registrations that advertise these RPCs can start intercepting them, while strict allowlist or exact registrations need matching operator configuration. ## OpenShell v0.1.8 ### Bug fixes - Deleted sandboxes no longer leave memory behind on the gateway, so repeated create/delete cycles no longer grow gateway memory until it is OOM-killed. - The gateway no longer pre-allocates about 3.4 MiB of stream buffers for every sandbox. - When PostgreSQL is unreachable, gateway requests now fail within about 5 seconds with a retryable `UNAVAILABLE` error, and a gateway started during the outage becomes ready once the database returns instead of crash-looping. - Deleting a sandbox on Kubernetes no longer waits out the pod's 30-second termination grace period. - A sandbox no longer exits when its control listener hits a transient accept error such as `EMFILE`, and DNS over TCP keeps working after a client resets a connection before it is accepted. - On Kubernetes, a late status update during a stop no longer flips a stopped sandbox back to `Provisioning` and blocks the next stop. - AWS SigV4 signing diagnostics no longer appear in supervisor TRACE logs, where they could expose the temporary session token. - Provider attachment now checks credential inspection against the sandbox's latest saved policy instead of its creation policy. - SSH relays and service forwards now have separate per-sandbox connection limits, set with `max_ssh_connections_per_sandbox` and `max_service_connections_per_sandbox` in the gateway config (default 20). - The CLI now renews expired OIDC client credentials tokens by repeating the grant instead of failing with `no refresh token available`. Renewal needs `OPENSHELL_OIDC_CLIENT_SECRET` to be set. - `openshell sandbox download` now works on busybox-based images. - `openshell policy update --add-endpoint` now accepts the `allow-encoded-slash` option. - `openshell status --gateway ` now exits non-zero when the named gateway is not registered. - Podman sandbox deletion and create rollback now remove only volumes labeled as owned by that sandbox, and keep any others with a warning. - Binary identity resolution now bounds its procfs work per mediated connection, so long command lines and digest-cache churn no longer slow connects without limit. Hashing a large, uncached executable can still delay a connect. - Isolation descriptors with an invalid workload identity, such as UID or GID 0 or an empty source or resource digest, now fail to deserialize instead of being accepted. - Sandbox signal masks are now built from zero-initialized memory, which fixes reads of uninitialized bytes on 64-bit musl. - `openshell-gateway config preflight` now warns when `allow_unauthenticated_users` is enabled. - The Docker driver now warns at startup when Docker Engine is older than the documented 28.0 minimum. - The TUI policy viewer now shows each allowed or denied MCP tool name or pattern instead of `tools/call *`. - The TypeScript SDK now revokes SSH forward tokens when you call `forward().close()`. - The Go SDK now falls back to the system `active_gateway` when the user one is missing or invalid, matching the CLI. - The Go SDK now sets up `Listen` tunnels in parallel, so one slow setup no longer blocks other clients. - The Python SDK adds an opt-in `delete_timeout_seconds` on `Sandbox` and a `timeout_seconds` argument on `delete`, for Kubernetes pods that take longer than 30 seconds to terminate. - The installer no longer prints awk escape warnings while looking up RPM assets. - VM runtime tarballs now record the libkrunfw commit, kernel version, and kernel config hash, including on macOS. […cut]

===== 2026-11-11 · AI Models & Labs =====

### Anthropic launches roadshow for proposed initial public offering

kind: lab-post · source: anthropic · published: 2026-11-10 · link: https://www.anthropic.com/news/roadshow-launch
digest: shown under AI Models & Labs › Lab announcements
text: Anthropic launches roadshow for proposed initial public offering Published Nov 10, 2026 Category Announcements Today Anthropic, PBC launched the roadshow for its proposed initial public offering of its Class A common stock. The proposed offering consists of 825,000,000 shares of Class A common stock. Of these, 801,351,354 shares are being offered by Anthropic and 23,648,646 shares are being offered by certain existing stockholders. Anthropic will not receive any proceeds from the sale of shares by the selling stockholders. Anthropic also expects to grant the underwriters a 30-day option to purchase up to an additional 123,750,000 shares of its Class A common stock. The initial public offering price is expected to be between $70.00 and $78.00 per share. Anthropic has applied to list its Class A common stock on the Nasdaq Global Select Market under the symbol “ANT.” The proposed offering will be made only by means of a prospectus. Copies of the preliminary prospectus may be obtained from: Goldman Sachs & Co. LLC, Attention: Prospectus Department, 200 West Street, New York, NY 10282, by telephone at (866) 471-2526, or by email at prospectus-ny@ny.email.gs.com; or Morgan Stanley & Co. LLC, Attention: Prospectus Department, 180 Varick Street, 2nd Floor, New York, NY 10014. A registration statement relating to these securities has been filed with the U.S. Securities and Exchange Commission but has not yet become effective. These securities may not be sold, nor may offers to buy be

### Ai Effect On Freelance Work

kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/ai-effect-on-freelance-work/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Chatgpt Plus For Veterans

kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/chatgpt-plus-for-veterans/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Helping Caregivers Use Ai In Everyday Life

kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/helping-caregivers-use-ai-in-everyday-life/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Introducing Businesses Chatgpt

kind: lab-post · source: openai · published: 2026-11-11 · link: https://openai.com/index/introducing-businesses-chatgpt/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Closing Ai Guidance Gap Education

kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/index/closing-ai-guidance-gap-education/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Enabling A Data Driven Workforce Webinar

kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/enabling-a-data-driven-workforce-webinar/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Identifying And Scaling Ai Use Cases

kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/identifying-and-scaling-ai-use-cases/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### How Openai Uses Codex

kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/how-openai-uses-codex/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Fine Tuning Gpt 4o Webinar

kind: lab-post · source: openai · published: 2026-11-10 · link: https://openai.com/business/learn/fine-tuning-gpt-4o-webinar/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Baidu: ERNIE-5.5-Flash-Preview

kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/baidu/ernie-5.5-flash-preview
digest: shown under AI Models & Labs › New on OpenRouter
text: ERNIE 5.5 Flash Preview is the latest foundation model in the ERNIE family, with comprehensive improvements in coding, agentic capabilities, knowledge work, and deep research. It has 280 billion total...

### Baidu: ERNIE-Light-DT-1.0

kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/baidu/ernie-light-dt-1.0-intl
digest: shown under AI Models & Labs › New on OpenRouter
text: ERNIE-Light-DT-1.0 is based on open-source GLM models and includes research findings from Baidu Search's Lightning large model. It features Baidu Sparse Attention (BSA), a unique sparse attention mechanism developed by...

### Google: Gemini 4 Carbon

kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/google/gemini-4-carbon
digest: shown under AI Models & Labs › New on OpenRouter
text: Gemini 4 Carbon is a frontier Gemini 4 model from Google for coding, agentic and complex reasoning work. It takes text, image, audio, video and file input, supports long decode...

### Google: Gemini 4 Carbon (batch)

kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/google/gemini-4-carbon:batch
digest: shown under AI Models & Labs › New on OpenRouter
text: Gemini 4 Carbon is a frontier Gemini 4 model from Google for coding, agentic and complex reasoning work. It takes text, image, audio, video and file input, supports long decode...

===== 2026-11-11 · AI Policy =====

### Motie van het lid Beckerman over onderzoeken hoe kunstenaars en makers beter beschermd kunnen worden tegen AI

kind: policy-item · source: Tweede Kamer · published: 2026-11-09 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24559&did=2026D56699
digest: shown under AI Policy › Netherlands
text: Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Motie van het lid El Boujdaini c.s. over autoriteiten voldoende toerusten voor het toezicht op de AI-verordening

kind: policy-item · source: Tweede Kamer · published: 2026-11-09 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24543&did=2026D56682
digest: shown under AI Policy › Netherlands
text: Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Motie van het lid Dassen over een juridisch kader voor de aansprakelijkheid bij schade van AI-modellen

kind: policy-item · source: Tweede Kamer · published: 2026-11-09 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24563&did=2026D56703
digest: shown under AI Policy › Netherlands
text: Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Commission invites views on draft revised election guidelines under Digital Services Act

kind: policy-item · source: European Commission · published: 2026-11-10 · link: https://digital-strategy.ec.europa.eu/news-redirect/964805
digest: shown under AI Policy › EU
text: The European Commission launched a consultation to update its election guidelines under the Digital Services Act (DSA), addressing the rapid evolution of technologies, particularly generative Artificial Intelligence (AI), and the growing sophistication of manipulation risks.

### Targeted consultation on the draft revised election guidelines under the Digital Services Act (DSA)

kind: policy-item · source: European Commission · published: 2026-11-10 · link: https://digital-strategy.ec.europa.eu/news-redirect/964768
digest: shown under AI Policy › EU
text: This consultation focuses on measures Very Large Online Platforms (VLOPs) and Very Large Online Search Engines (VLOSEs) should adopt to address generative AI and information manipulation risks to electoral processes.

### AI toolbox supports public administrations to put the Apply AI Strategy into practice

kind: policy-item · source: European Commission · published: 2026-11-05 · link: https://digital-strategy.ec.europa.eu/news-redirect/964507
digest: shown under AI Policy › EU
text: Public administrations looking to adopt artificial intelligence can find practical tools, guidance and examples in the AI toolbox for the European public sector, available on the Interoperable Europe portal. The toolbox supports the implementation of the European Commission’s Apply AI Strategy by helping administrations identify resources they can use and adapt to their needs.

### Kabinet kiest voor AI die Nederland vooruithelpt

kind: policy-item · source: Digitale Overheid · published: 2026-11-10 · link: https://www.digitaleoverheid.nl/nieuws/kabinet-kiest-voor-ai-die-nederland-vooruithelpt/
digest: shown under AI Policy › Netherlands
text: Het kabinet kiest voor een visie op AI die bijdraagt aan een sterke economie, goede publieke dienstverlening en oplossingen voor maatschappelijke uitdagingen. Het bericht Kabinet kiest voor AI die Nederland vooruithelpt verscheen eerst op Digitale Overheid .

### Nvidia loses ground in Washington chip fight after CEO spy scandal

kind: policy-item · source: Politico US · published: 2026-11-11 · link: https://www.politico.com/news/2026/11/10/nvidia-ceos-spy-scandal-tilts-capitol-hills-chip-fight-01160548
digest: shown under AI Policy › News & commentary
text: The revelations have weakened the semiconductor giant's hand as it tries to block new curbs on AI chips.

### Trahan crafting AI safety bill with narrower state preemption

kind: policy-item · source: Politico US · published: 2026-11-10 · link: https://www.politico.com/live-updates/2026/11/10/congress/trahan-crafting-ai-safety-bill-with-narrower-state-law-preemption-01158965
digest: shown under AI Policy › News & commentary
text: Lawmakers in a Democrat-controlled Congress may be less likely to supersede state AI laws.

### Gezichtsscanner rukt op, maar cijfers over omvang fraude ontbreken

kind: policy-item · source: Binnenlands Bestuur · published: 2026-11-10 · link: https://www.binnenlandsbestuur.nl/digitaal/gezichtsscanner-rukt-op-omvang-fraude-onbekend
digest: shown under AI Policy › News & commentary
text: Het kabinet werkt aan een wettelijke grondslag voor de inzet van gezichtsscanners bij aanvragen van een reisdocument of identiteitskaart. Meer dan de helft van de gemeenten zet op eigen initiatief al automatische gezichtsvergelijking in bij de identiteitsvaststelling. Maar hoe groot het probleem van fraude met paspoortaanvragen aan de gemeentebalie werkelijk is, weet niemand.

===== 2026-11-11 · Data Engineering =====

### Ducks in a Column

kind: community-post · source: DuckDB blog · published: 2026-11-10 · link: https://duckdb.org/2026/11/10/ducks-in-a-column.html
digest: shown under Data Engineering › Open-source stack › DuckDB
text: DuckDB is fast among other reasons because it stores data by column, so a query reads only the columns it names. This post covers DuckDB features that take advantage of that design choice: querying files in place, column-level SQL, aggregation shortcuts, window functions, ASOF joins, and writing well-organized Parquet.

### Introducing performance optimization in dltHub

kind: community-post · source: dltHub blog · published: 2026-11-10 · link: https://dlthub.com/blog/introducing-performance-optimization
digest: shown under Data Engineering › Open-source stack › dlt
text: TODO: meta description (about 150 characters).

### Is your Iceberg catalog healthy?

kind: community-post · source: Snowflake on Medium · published: 2026-11-10 · link: https://medium.com/snowflake/is-your-iceberg-catalog-healthy-939dc7817154
digest: shown under Data Engineering › Open-source stack › Apache Iceberg
text: A comparison of five open-source Iceberg catalogs on functionality and OSS project health. Apache Iceberg™ allows an organisation to own their data layer in an open format in their own storage, and has become the de facto open table format. Still, every engine must reach those Iceberg tables through an Iceberg catalog. A natural extension is an open-source Apache Iceberg catalog to complete the open lakehouse stack, acting as an open governance layer, so that access to your tables isn’t dependent on any one vendor’s managed service. In this blog, I aim to simplify the decision process when it comes to choosing an Iceberg catalog and therefore building an open lakehouse on Iceberg. I focus on the functional completeness of each catalog for Iceberg data and dive deep on OSS project health. After all, an OSS project with one vendor driving development carries similar lock-in risk to a proprietary product. My goal here is to provide transparency on the relative health of common OSS catalog…

### Native Asyncio Comes to the Snowflake Python Connector

kind: community-post · source: Snowflake on Medium · published: 2026-11-10 · link: https://medium.com/snowflake/native-asyncio-comes-to-the-snowflake-python-connector-5941385ac80e
digest: shown under Data Engineering › Snowflake › Snowflake Connector for Python
text: Version 5.0.0 is the same package you already install, now with an awaitable API built on Universal Core. If your Python service runs on an event loop, calling Snowflake has meant handing the call to a thread pool so it doesn’t block everything else. In our public preview post we introduced Universal Core; this is the Python feature it made room for. Snowflake Connector for Python 5.0.0 became generally available on October 15. It is still snowflake-connector-python, with the same synchronous API. Check the upgrade guide for behavior changes before switching. The package is a thin Python wrapper around Universal Core, the Rust core shared with the ODBC driver. The big addition is snowflake.connector.aio : native asyncio support, the feature you’ve asked us for most, going back to a 2017 GitHub issue. TL;DR If you run async Python against Snowflake, install snowflake-connector-python 5.0.0 on Python 3.11 or later. Async applications import snowflake.connector.aio and await the calls tha…

### All Unity Catalog managed tables will be upgraded to catalog commits

kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · ends: 2027-08-19 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#all-unity-catalog-managed-tables-will-be-upgraded-to-catalog-commits
digest: shown under Data Engineering › Action required
text: After Databricks Runtime 15.4 LTS reaches end of support on August 19, 2027, Azure Databricks will upgrade all Unity Catalog managed tables to use catalog commits. With catalog commits, Unity Catalog becomes the system of coordination for your tables. This enables multi-statement, multi-table transactions, writes from external engines, and consistent governance across all engines. See Catalog commits.

### Nov 10, 2026: AI_EXTRACT and AI_PARSE_DOCUMENT now support page filtering with FL_FILTER_PAGES

kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-fl-filter-pages
digest: shown under Data Engineering › Snowflake · 🤖
text: AIEXTRACT and AIPARSEDOCUMENT now support selecting document pages with FLFILTERPAGES. Process the pages relevant to your task directly in SQL, without creating separate files for each document section.

### Nov 10, 2026: Temporary role grants to users (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-temporary-role-grants-preview
digest: shown under Data Engineering › Snowflake
text: You can now grant an account role to a user temporarily. When you run [](/sql-reference/sql/grant-role) to grant a role to a user, use the FOR INTERVAL clause to specify how long the grant lasts, or the UNTIL clause to specify when it expires. When the grant expires, the user automatically loses acc

### You can use graph measures to lock an aggregation to a key in order to perform complex aggregations without overcounting (GA)

kind: vendor-note · source: BigQuery · published: 2026-11-10 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: You can use graph measures to lock an aggregation to a key in order to perform complex aggregations without overcounting. Measure expressions can include the following: Aggregate function calls Expressions within aggregate functions Conditional logic within aggregate functions Conditional distinct counting Scalar operations and expressions outside of aggregate functions Combinations of measures wrapped in the AGG function To query measures, you transform your graph into a flattened table by using the GRAPH_EXPAND TVF, and then query measures in that table with the AGG function. The GRAPH_EXPAND function now supports multiple fact tables. To view the output schema of the GRAPH_EXPAND function, use the BQ.SHOW_GRAPH_EXPAND_SCHEMA system procedure. You can define extensions in the OPTIONS clause of the labels and properties in your graphs, which are string pairs that represent custom metadata for natural language querying. Measures and graphs are supported in Data Studio through the Bi…

### BigQuery generative AI functions now support the gemini-4-carbon model

kind: vendor-note · source: BigQuery · published: 2026-11-10 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_10_2026
digest: shown under Data Engineering › Azure / Fabric & GCP · 🤖
text: BigQuery generative AI functions now support the gemini-4-carbon model. This model is generally available.

===== 2026-11-11 · Community stories =====

### Show HN: Get your coding agent off ~2019 JavaScript, onto modern web primitives

kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/GoogleChrome/modern-web-guidance · discussion: https://news.ycombinator.com/item?id=50443812
digest: shown under AI Agents › Spotted · 322 points, 98 comments
text: Keep your coding agent up to date with the latest web best practices

### LLMs Play Zachtronics' TIS-100

kind: story · source: Hacker News · published: 2026-11-11 · link: https://tis-100.wincon.dev/ · discussion: https://news.ycombinator.com/item?id=50448340
digest: shown under AI Models & Labs › Spotted · 34 points, 4 comments
text: 16 LLMs took on TIS-100's community leaderboard and found 133 new frontier points on 18 of 55 puzzles, including 3 outright cycle records.

### What objective is reasoning solving?

kind: story · source: Hacker News · published: 2026-11-10 · link: https://alexwang.ai/posts/reasoning-as-pathfinding/ · discussion: https://news.ycombinator.com/item?id=50445013
digest: shown under AI Models & Labs › Spotted · 136 points, 63 comments
text: Reasoning as pathfinding in token space.

### An Open Field Guide to Inference Engineering

kind: story · source: Hacker News · published: 2026-11-10 · link: https://docs.modelplane.ai/guides/inference-guide · discussion: https://news.ycombinator.com/item?id=50443714
digest: shown under AI Models & Labs › Spotted · 80 points, 8 comments
text: A field guide to inference concepts, production operations, tooling, and career development for platform engineers.

### Life on Claude Nine

kind: story · source: Hacker News · published: 2026-11-10 · link: https://babuschk.in/posts/2026-01-25-life-on-claude-nine.html · discussion: https://news.ycombinator.com/item?id=50443587
digest: shown under AI Agents › Spotted · 96 points, 57 comments
text: It started with automating his emails.

### Businesses in ChatGPT – OpenAI

kind: story · source: Hacker News · published: 2026-11-10 · link: https://openai.com/index/introducing-businesses-chatgpt/ · discussion: https://news.ycombinator.com/item?id=50443944
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### ClickHouse Acquires Xata

kind: story · source: Hacker News · published: 2026-11-10 · link: https://xata.io/blog/xata-is-joining-clickhouse · discussion: https://news.ycombinator.com/item?id=50436706
digest: shown under Data Engineering › Spotted · 99 points, 10 comments
text: (the source gave no text)

### Show HN: WolveKafka – Consume Kafka with a plain HTTP endpoint

kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/wolveflake/wolvekafka · discussion: https://news.ycombinator.com/item?id=50443596
digest: shown under Data Engineering › Spotted · 11 points, 2 comments
text: Consume Kafka with an HTTP handler in any language. Retries, DLQ, batching, and offsets handled for you.

### Show HN: AI agents that barter your stuff for things you want

kind: story · source: Hacker News · published: 2026-11-10 · link: https://barterpilot.com/ · discussion: https://news.ycombinator.com/item?id=50446649
digest: shown under AI Agents › Spotted · 6 points, 4 comments
text: Your stuff is your currency. List what you're done with, tell your AI agent what you want, and it barters for a fair trade.

### Gemini 4 Carbon is now available

kind: story · source: Hacker News · published: 2026-11-10 · link: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/ · discussion: https://news.ycombinator.com/item?id=50442303
digest: shown under AI Models & Labs › Spotted · 281 points, 154 comments
text: Today, we’re making Gemini 4 Carbon available to developers, enterprises, scientists, and consumers.

### Anthropic to Seek $1.3T Valuation in IPO

kind: story · source: Hacker News · published: 2026-11-10 · link: https://www.wsj.com/finance/stocks/anthropic-to-seek-1-3-trillion-valuation-in-ipo-8337b669 · discussion: https://news.ycombinator.com/item?id=50439616
digest: shown under AI Models & Labs › Spotted · 59 points, 83 comments
text: (the source gave no text)

### Claude Fable 5.2 launch offers

kind: story · source: Hacker News · published: 2026-11-09 · link: https://support.claude.com/en/articles/17506494-claude-fable-5-2-launch-offers · discussion: https://news.ycombinator.com/item?id=50430176
digest: shown under AI Models & Labs › Spotted · 29 points, 5 comments
text: (the source gave no text)

### Show HN: Cosh – An open-source AI agent orchestrator

kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/DiegoZaluski/co-sh · discussion: https://news.ycombinator.com/item?id=50439141
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex
text: Open-source agent and multi-agent orchestrator built in Rust. Fast TUI, computer use, and integrations with external agents like Codex and Goose.

### Measuring Quack: DuckDB's New Client-Server Protocol

kind: story · source: Hacker News · published: 2026-11-10 · link: https://ramonactruta.substack.com/p/measuring-quack-duckdbs-new-client · discussion: https://news.ycombinator.com/item?id=50444907
digest: shown under Data Engineering › Open-source stack › DuckDB
text: (the source gave no text)

### Next-Level Benchmarking Overfitting

kind: story · source: Lobste.rs · published: 2026-11-10 · link: http://databasearchitects.blogspot.com/2026/11/next-level-benchmarking-overfitting.html · discussion: https://lobste.rs/s/nuoce5/next_level_benchmarking_overfitting
digest: shown under Data Engineering › Spotted · 18 points, 3 comments
text: A blog by and for database architects.

### Detecting Flaky Tests and Finding Their Root Causes with Strands Agents and Gemini

kind: story · source: Dev.to · published: 2026-11-10 · link: https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan · discussion: https://dev.to/m4rri4nne/detecting-flaky-tests-and-finding-their-root-causes-with-strands-agents-and-gemini-4kan
digest: shown under AI Agents › Spotted · 48 reactions, 5 comments
text: A few years ago (three years at most), one of the biggest challenges QA Engineers faced was: how do

### Once Upon Agentic AI (Part 1): Create your own agent and forge its tools with Strands Agents

kind: story · source: Dev.to · published: 2026-11-10 · link: https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo · discussion: https://dev.to/aws/once-upon-agentic-ai-part-1-create-your-own-agent-and-forge-its-tools-with-strands-agents-22mo
digest: shown under AI Agents › Spotted · 23 reactions, 3 comments
text: On Day1, three heroes that nothing destined to cross went on a journey to write the same legend.

===== 2026-11-12 · AI Agents =====

### [BUG] Messages Sent from the iOS App Mid-Turn No Longer Reach Claude Until the Turn Ends

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-11 · link: https://github.com/anthropics/claude-code/issues/108975
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · regression; 5 comments, 1 👍; +6 in the last 24h
text: ### Preflight Checklist ### What's Wrong? Since Claude Code went to 2.1.321 (now 2.1.322), anything I send from the iOS app while Claude is working just sits there until the turn ends. On really long horizon tasks, the wait can be minutes to hours before a turn boundary opens up, so I have lost the ability to redirect/steer Claude. My setup: a Claude Desktop Code tab session on my Mac with Remote Control on, driven from the Claude iOS app. Mid-turn the composer now says "Queue for after this turn…" and there's only the one send button. Idle, the same box says "Type / for commands": Up to 2.1.318 that same send button reached Claude at the next tool call, and I used it all the time to steer/correct a long task from my phone without stopping it. Now the only way in mid-task is Stop, which kills the tool call and loses its work. That's not what I want mid-task. What the session's queue log shows (UTC, "got it" = handed to Claude): | Sent from iOS | Claude got it | Waited | | |---|---|---|---| | 05:56:02 | 06:07:55 | ~12 min | long turn, then a compaction | | 06:30:16 | 06:31:44 | 88 s | turn of short tool calls | | 06:57:28 / :36 / :52 | 06:58:31 | 63 / 55 / 39 s | my test, six tool results came back in between | | 07:13:13 / :15 / :19 | 07:13:26 | 13 / 11 / 7 s | retest on iOS 1.261109.19 | Each test's three messages came out together when the turn ended, as one message. **The session was still taking input mid-turn.** In the retest, a background task's notification got absorbed between tool calls at 07:13:18 while my three messages stayed queued. One phone message did get through mid-turn after the update (sent 06:34:14, absorbed 06:34:17). Every other one waited. I couldn't find a way to turn it back. There's no send or queue setting in the iOS app, and the docs have no settings.json key, env var or desktop preference for it. `chat:queueSubmit` and `chat:sendNow` are terminal keybindings, so they don't help on the phone. The terminal still gets a typed message in after the running tool calls, and the Mac app has "Send now" on a queued message. Only the phone can't do it now. ### What Should Happen? A message I send from the phone while Claude is working should be able to get in at the next tool boundary, like plain Enter does in the desktop app per the docs: "type a correction and press Enter to send it without stopping the running action. Claude reads the correction as soon as the current action completes." Best would be both on iOS while a turn runs (send now to steer, or queue for after this turn), or a setting for which one Send does. ### Error Messages/Logs ### Steps to Reproduce 1. On macOS, open a Claude Desktop Code tab session with Remote Control on. 2. Open the same session in the Claude iOS app. 3. Ask Claude to run short tool calls one at a time for about 30 seconds. 4. While it runs, send a message from the iOS app (the composer reads "Queue for after this turn…"). 5. The message doesn't reach Claude between tool calls. It arrives on... […cut]

### [BUG] Claude Code drops next in the middle of the scrollback when it appends text to console

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-11 · link: https://github.com/anthropics/claude-code/issues/108984
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · regression; 3 comments, 2 👍; +4 in the last 24h
text: ### Preflight Checklist ### What's Wrong? If I scroll up in a Claude Code Session (in gnome-terminal on Fedora, not using the new renderer), and then Claude Code sends new output to the console, the text in the middle of what I'm reading is often deleted. This is a clear example, where you can see that the last half of the first table and the first half of the second table are deleted, including the text in between them. I had to ask Claude Code to give me the information again. (See also #89270, which was auto-closed due to lack of Anthropic response.) ### What Should Happen? Appending new text to the console should not affect the scrollback. ### Error Messages/Logs ### Steps to Reproduce 1. Start a session 2. Ask Claude for a detailed report on something 3. Let Claude grind away on other tasks 4. Scroll back to see the detailed report 5. Wait for Claude to generate more responses below what you can see ### Claude Model None ### Is this a regression? Yes, this worked in a previous version ### Last Working Version ### Claude Code Version 2.1.321 ### Platform Anthropic API ### Operating System Other Linux ### Terminal/Shell Other ### Additional Information

### OpenAI Codex 0.167.2

kind: release · source: openai/codex · published: 2026-11-11 · link: https://github.com/openai/codex/releases/tag/rust-v0.167.2
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex
text: ## New Features - Codex now sends tool updates incrementally by default on Google Cloud Vertex AI. To opt out, set `incremental_tools_legacy_gcp = false` under `[features]` in `config.toml`. ## Changelog Full Changelog:

### OpenCode process-daemon v0.5.2

kind: release · source: anomalyco/opencode · published: 2026-11-11 · link: https://github.com/anomalyco/opencode/releases/tag/process-daemon-v0.5.2
digest: shown under AI Agents › Coding Agents & Assistants › OpenCode
text: opencode-pty 0.5.2 (protocol 8) from packages/process-daemon, published to npm as @opencode/pty@0.5.2.

### Oh My Pi v18.19.0

kind: release · source: can1357/oh-my-pi · published: 2026-11-12 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.19.0
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ### Breaking Changes - Changed the browser `open` API: `ignore_https_errors` is now `insecure`, `allow_file_access` has been removed, and `file:` pages can access other local files. - Changed the browser `open` and `targets` `app` option from an object to a string or CDP endpoint/executable path. Use `argv` instead of `app.args` and the top-level `target` instead of `app.target`. - Removed `task.file` and the task tool's `taskFile` field; subagent instructions must now be provided inline. - Removed blocked todo tasks and the `blocked` status/blocker metadata. Existing blocked tasks are restored as pending. ### Removed - Removed the `blocked` status from `TodoStatus`, the `blocker` field from `TodoItem`, and the `block`/`unblock` operations from `TodoOperation`. ## @oh-my-pi/pi-ai ### Added - Added the `liquid-systemone` judgment API for Liquid AI decision models, including validation that rejects image sets exceeding Liquid’s 10,000 32×32-patch request limit before submission. ### Fixed - Fixed Gemini CLI and Antigravity responses losing or misordering thought signatures and reply text, including responses that follow tool calls. - Fixed Gemini CLI and Antigravity merging reply text around a thought signature, dropping signatures at the start of a reply or after a tool call, and placing a thought ahead of reply text that streamed before it ( ) - Fixed Google Antigravity judging Gemini models by quota buckets they do not consume: Gemini 3.x requests ignore the Gemini 4 Argon weekly bucket, and Argon requests ignore `gemini-weekly`, so an exhausted or low bucket no longer blocks, reserves, or caps an account for the other models . ## @oh-my-pi/pi-catalog ### Added - Added Liquid AI provider support with the d1.1 and d1-ultra judge models and Liquid authentication via `/login liquid` using `LIQUID_API_KEY`. ### Fixed - Fixed Google Antigravity Gemini 4 Argon models sharing the general Gemini quota scope instead of their dedicated weekly bucket . ## @oh-my-pi/pi-coding-agent ### Added - Added `systemPromptTemplates`, which maps model-selector patterns to Handlebars template files for customizing system prompts. Templates re-render when switching models, with warnings and fallback to the bundled prompt for missing or invalid templates. - Added ordered multi-step tasks through `task.steps`. Subagents receive steps sequentially, and the final step determines the task result; interrupted tasks resume with their remaining steps. - Added Liquid AI judge models `liquid/d1.1` and `liquid/d1-ultra`, including image resizing for Liquid's request limits. - Added per-step progress, state, and duration reporting for GitHub Actions watches, with expandable details and native Tern Surface Protocol views. - Added `task.autoParallel` (`off`, `suggest`, or `on`) to identify subtasks that can run concurrently and optionally delegate them in a single parallel task call. - Added portable `awk`, `tar`, `lsof`, `shasum`, `md5`, and `strings` support to the `bash` tool, including Windows support and internal-URI paths. ### Changed - Browser sessions now prefer the bundled ABKit WebKit engine when available, with automatic installation and SHA-256 verification. WebKit provides headed, user-visible tabs and broader browser compatibility; Chromium remains the fallback and can be selected explicitly with `app: "chromium"`, while `app: "webkit"` requires WebKit. Configure this behavior with `browser.webkit` and `browser.webkitPath` or the corresponding environment variables. - Browser visibility controls now show or hide WebKit tab windows immediately. Headed WebKit tabs can be interacted with directly, while Chromium tabs retain their existing mode-switching behavior. - In Tern environments with native DOM access, browser observation and interaction use trusted native input across frames and closed shadow roots, with caret-aware typing and case-insensitive text selectors. - `edit.modelVariants` now uses the longest matching model pattern, so specific patterns take precedence over generic ones regardless of configuration order. - The `ask` tool now submits the form's current values when its timeout expires; updated settings and documentation reflect this behavior. - The `read` tool loads detailed format selectors and URI sub-path syntax on demand, reducing the default request description while retaining inline details when `read` is disabled. - The default system prompt and tool descriptions have been streamlined, with guidance moved closer to the tools and detailed task/procedure references provided when relevant. - The `bash` pseudo view renders words built from literals and expansions as f-strings (`f"repos/org/{r}/rulesets"`) instead of `concat(...)` calls. ### Fixed - Fixed `computer.close()` so subsequent computer-control calls start a fresh desktop session instead of failing. - Fixed extension providers with `oauth.modifyModels` so they do not load the full model catalog before login. - Fixed resuming sessions so it no longer scans unrelated later session transcripts. - Fixed session saving on Windows to avoid UI stalls caused by repeated session-file access. - Fixed automatic chart selection so generated charts use compatible data and chart types. - Fixed `bash` previews for `env -i` commands so they display the requested command rather than generated shell setup code. ## @oh-my-pi/collab-web ### Fixed - Fixed `task` tool cards so spawned tasks consistently display their name, assigned agent, and instructions, with `steps` spawns shown as numbered stages. ## @oh-my-pi/pi-natives ### Added - Added `shellBuiltins(sessionEnv?)` to list commands provided by the embedded shell, including process controls and utilities. - Expanded the embedded shell with `awk`, `tar`, `shasum`, `md5`, `strings`, and `lsof` across Linux, macOS, and Windows. Destructive utilities can be disabled with `PI_DISABLE_UUTILS_DESTRUCTIVE`; when disabled, `tar` is delegated to the system. […cut]

### Oh My Pi v18.18.9

kind: release · source: can1357/oh-my-pi · published: 2026-11-11 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.18.9
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ### Removed - Removed Devin's retired SWE-1.6 Fast from the models omp lists before Devin's live model list loads (first start, or when Devin is unreachable) ( ) ### Removed - Removed `/mcp smithery-search`, `/mcp smithery-login` and `/mcp smithery-logout`; Smithery shut down its API on October 31, 2026 ( ) ### Removed - Removed `estimateSkillsTokens()` and the `skillful` context-usage option; Skills tokens come from the built prompt's sources ( ) ## @oh-my-pi/pi-agent-core ### Added - Tool calls get `ctx.toolCall.earlierEffectsSettled`, which settles once the earlier calls of their message that run beside them and may write files (their approval, asked with their arguments, is not `read`) have finished; speculative results wait for those effects before validation, and cancellation while waiting prevents their commit ( ) ## @oh-my-pi/pi-ai ### Added - Added `SOFYA_API_KEY` as the env key for the `sofya` provider ( ) ### Fixed - Devin requests no longer send `temperature: 0`: the catalog's `temperature-floor` raises it to `0.0001`, so session titles and Mnemopi memory extraction work on Devin instead of failing with Cascade's opaque `invalid_argument` and silently falling back to another model - Auth-gateway `/v1/messages` now answers `400 invalid_request_error` for `output_config.format` (and the pre-GA `output_format`) instead of returning 200 with output the schema never constrained, so structured-output clients fall back to prompt-side schemas - Auth-gateway requests denied only the requested model (Codex ChatGPT account, Cursor plan) now switch to another account and keep the denied one usable for other models, instead of marking a working credential suspect; gateway rotation now follows the same rules as local sessions, including waiting out a sibling's short usage block ## @oh-my-pi/pi-catalog ### Added - Added the `web/sofya` search model ( ) - Added the `temperature-floor` compat axis, assigned `0.0001` on Devin so a request that pins `temperature: 0` reaches Cascade as a value it accepts - Added the keyless `web/hackernews` search engine model for Hacker News stories and comments ### Fixed - Devin requests now identify as Devin CLI 3000.12.43, the current stable release, instead of 3000.11.205 ( ) - Fixed Gemini 4 Argon and Carbon on Command Code showing no reasoning levels; both now offer low, medium, and high - Fixed OpenCode Zen Gemini 4 Carbon requests going to the chat-completions endpoint instead of the native Gemini endpoint Zen serves it on ## @oh-my-pi/pi-coding-agent ### Added - Added Sofya as a web search engine (`web/sofya`), using `SOFYA_API_KEY` or a stored `sofya` credential ( ) - Documented autoresearch mode in docs/autoresearch.md: activation and its git gates, the three stop conditions, the per-segment iteration cap that defaults to none, the harness `METRIC`/`ASI` contract, and the on-disk store that `OMP_AUTORESEARCH_DB_DIR` relocates ( ) - Extensions can import the form theme, the native span helpers (`styledSpans`, `compactText`, `rowsText` and the rest of the ANSI/span conversions), the `xd://` URL helpers (`parseXdUrl` and friends) and the `cfgExtensionTranscriptPresenters` setting handle from `@oh-my-pi/pi-coding-agent` instead of internal module paths, which stop the extension from loading when a file moves ( ) - `/context` shows loaded instruction files and skills in their own categories; System Prompt marks where each one sits without counting it twice, and notes when an extension or SDK callback changed the prompt after it was built ( ) - Added Hacker News search (`web/hackernews`): `web_search` queries scoped to `site:news.ycombinator.com` now search HN stories and comments through the keyless HN Search API before the configured engines ### Changed - A role edit in another omp instance no longer rewrites the `task` and `eval` tool descriptions of every running session, which was invalidating the Anthropic prompt cache from the tool definitions onward and dropping signed thinking blocks on prefix-bound models; the per-call model advertisement is now frozen into the base prompt surface and changes only when that surface rebuilds ( ) - Agent-to-agent messages now always reach the recipient as user turns: one that ends a `wait` arrives right after it instead of inside the `wait` tool result, and none is sent with developer or system authority - Launch services now persist for non‑interactive sessions - The shell's built-in `jq` now behaves like jq 1.8.2 instead of jaq: the same output (number formatting, colors, `-S`, `--indent`, `--seq`, `--stream`), error messages and exit statuses, jq's full option set (`--version` reports `jq-1.8.2`), and its grammar and builtins (`?//`, `$__loc__`, modules, `getpath`/`setpath` creating missing paths, `|=` deletions, Oniguruma regexes, dates); it passes jq 1.8.2's own test suite ### Fixed - Nix builds with `withAppleFm = false` no longer compile the Apple Foundation Models bridge with the host's Xcode - Apple Silicon Nix builds include Apple Foundation Models support instead of silently building without it ( ) - On Windows, the bash tool runs external commands when omp itself runs in an AppContainer sandbox, instead of failing every one with `Permission denied` (exit 126) ( ) - Explicit Bash prompt rules remain enforced in yolo mode when a command also matches a critical pattern ( ). - Fixed job widgets and captions failing outright when the `widget` model errors: they now try the role's next model (`retry.fallbackChains.widget`, else the built-in `smol` defaults) and fail only once every candidate has - Failed job-widget, job-caption, cache-warm, composer-prediction, and subagent completion-probe calls now keep the provider's error message in their session usage records - `/changelog`, `/changelog full`, and `/changelog last N` now list releases newest-first, matching `CHANGELOG.md` and the startup release notes […cut]

### DeepSeek Harness v0.2.2-rc.2

kind: release · source: deepseek-ai/deepseek-harness · published: 2026-11-11 · link: https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2
digest: shown under AI Agents › Coding Agents & Assistants › DeepSeek Harness
text: | 新增功能 - Git Worktree 支持按分支、提交和文件类型审阅改动，并直接处理 GitHub 评审、同步已审阅进度和更新分支。 @LegGasai - SubAgent 支持具名与多层协作，AgentTeam 可按会话开启，共用成员与任务面板。 @Dudu-0223, @Yifffan - 桌面端支持在设置中切换正式版与开发版更新渠道。 @winewill ### 体验优化 - 改善代码审阅时的评论、文件导航与窄屏布局，减少查看大型改动时的卡顿，并放宽大型仓库创建工作树的等待时间。 @LegGasai - 改善多层子代理的浏览与任务协调，优先展示任务描述，支持逐层展开和读取失败后重试。 @Dudu-0223 - 优化左侧栏插件入口的收纳，不常用入口可移入“更多”，重新固定时保持原顺序。 @Yifffan - 简化个性化页面安装后的操作，移除“保留”按钮，统一使用撤销与恢复。 @ZiyaZhang - 改善自定义主题对通知、卡片、计划和任务等界面颜色的覆盖。 @turtle2099 - 改善页面缩放、平移及长列表场景下的菜单定位，保持菜单与触发位置对齐；自定义浮层需适配新定位接口。 @Stevring, @LegGasai - 改善暗色模式下文件树浮层的显示，使用背景层次区分面板，避免白色投影。 @turtle2099 - 改善在侧栏查找文件的体验，支持按名称或路径搜索，并可调整排除规则与隐藏文件显示。 @yudshj - 改善侧栏长列表的浏览与拖动体验，插件导航和会话列表共用滚动区域，工作区工具栏保持可见。 @Yifffan - 优化从会话打开工作目录的操作，统一“在应用中打开”菜单，并改善窄屏使用体验。 @Yifffan - 加快文件右键菜单的打开；关联应用查询较慢时，先提供默认应用入口。 @yudshj - 向上回看聊天时自动加载更早消息，优先保持阅读位置，并保留手动加载和重试入口。 @imccyu - 改善聊天过程的可查看性，可展开工作区指令、技能目录等信息，了解模型收到的上下文。 @turtle2099 - 改善补丁编辑的回执，折叠状态下也可查看修改的文件，并在成功后直接打开。 @sjw1231 - 优化会话首页的交互动画。 @ZiyaZhang - 改善会话恢复或压缩后的上下文提示，明确当前运行信息与旧信息的替换关系。 @kermanx - 改善聊天中代码差异的阅读，显示增删行颜色，并按文件语言高亮。 @mektpoy - 改善粘贴图片和文件的体验，未聚焦输入框时也可粘贴到最近使用的可用输入框或主对话。 @std4453 - 改善暂停、恢复定时任务时的操作反馈，保持按钮焦点与显示稳定，避免重复操作。 @turtle2099 - 优化目标栏的操作排列与按钮间距，统一为“编辑、清除、暂停或恢复”。 @turtle2099 - 优化模型请求失败后的重试设置，可在模型设置中选择重试条件、次数和等待时间。 @turtle2099 - 改善临时请求失败后的恢复操作，可直接点击“继续生成”，无需另写消息。 @LegGasai - 改善 API Key 的管理，已保存密钥以掩码显示，支持整体替换或清除，不显示完整旧密钥。 @Magolor - 优化多问题检索，单次网页搜索默认支持最多 10 个查询和 10 个来源。 @turtle2099 - 改善 Agent 终端的可见性与接管体验，命令在侧栏终端运行，用户输入即可接管；允许读取的用户终端内容会进入模型与会话记录。 @LegGasai - 优化批量查询文件、任务和资源时的执行效率，更多只读工具可并行运行，结果仍按调用顺序返回。 @turtle2099 - 改善桌面更新下载时的进度显示，可点击下载百分比或“检查更新”查看状态。 @winewill ### 问题修复 - 修复 PR 更新后审阅差异与提交行号不一致的问题，并改善大量评审讨论的统计。 @LegGasai - 修复只有 SSH 凭据时无法查看私有 Git 插件详情的问题。 @turtle2099 - 修复可选插件加载失败导致整个 Web 页面无法启动的问题；必需插件失败仍会提示。 @imccyu - 修复已启用但未成功加载的插件容易被误认为正在运行的问题，明确显示“未运行”及原因。 @turtle1999 - 修复 PTC 中重复等待子代理消息时，同一条消息反复触发唤醒的问题。 @Dudu-0223 - 修复浏览特殊文件名或扩展名时，文件树视图崩溃的问题。 @LegGasai - 修复“未分组”会话中显示无效“新建会话”按钮的问题。 @turtle2099 - 修复复制聊天公式时出现乱码的问题，同一条 Markdown 内容中的公式可复制为 TeX 源码。 @turtle2099 - 修复查看 Perl 代码时，正则表达式导致后续内容高亮错误的问题。 @turtle2099 - 修复聊天更新出错后，历史加载和新消息显示持续卡住的问题。 @Magolor - 改善重复创建会话分支时的标题编号，跳过已用编号，减少同名会话。 @turtle2099 - 修复停止任务或关闭会话时，部分错误导致任务未中止或资源提前释放的问题。 @liukx0205 - 修复发送消息或准备附件期间重试请求，导致同一消息被重复提交的问题。 @liukx0205 - 修复中文目标栏混淆“待继续”与“已暂停”状态的问题。 @imccyu - 修复桌面端多次启动后，因鉴权信息累积而无法启动的问题。 @turtle2099 - 修复 Windows 通过短路径启动命令行时，无法保存欢迎页确认的问题。 @winewill - 修复 macOS 窗口拖动与粘贴快捷键问题，以及 Windows 暗色模式启动白闪。 @yxy72, @winewill, @turtle2099 - 改善 Windows 更新安装期间的反馈，显示安装状态窗口，减少重启过程中的无提示等待。 @winewill - 修复移动端 Safari 在展开屏幕或切换视口后，聊天文字被额外放大的问题，保留用户主动缩放。 @Saafo - 修复 Linux 存在长期后台进程时，会话加载与新建变慢的问题。 @turtle2099 - 修复会话中移除或替换工具后，部分模型拒绝继续请求的问题。 @Tuyixiang - 通过 Anthropic Messages 接入时，历史前缀变化后省略失效的签名 thinking，减少压缩后持续请求失败。 @turtle2099 - 修复部分模型网关错误被误报为“API 密钥无效”的问题，使重试按实际响应状态处理。 @LegGasai - 修复在 DSH 用户目录中配置 DeepSeek 端点后无法启动的问题；项目目录中的环境配置仍不能覆盖端点。 @LegGasai - 修复连续浏览多页 PDF 时加载越来越慢、快速翻页卡顿的问题。 @turtle2099 - 修复使用 Inspector 查看较大的 Cordis 树时，快照接近上限可能导致服务退出的问题。 @turtle2099 ### 其他变更 - 网页搜索默认改用 DeepSeek Search API，搜索与获取可分别选择计费账号或 API Key；旧提供方和自定义配置需按升级指南调整。 @yudshj - 归档会话默认清理符合条件的 Git 工作树，保留分支与提交；需保留本地目录时请关闭清理，自定义配置与 Forge 插件需迁移。 @LegGasai - AgentTeam 改用统一的具名子代理，中断工具默认关闭；自定义插件与 SDK 集成需迁移，共享会话的进程须同步升级。 @Dudu-0223 - SDK 可通过配置为新会话默认开启团队协作，恢复已有会话时保留原选择。 @Dudu-0223 - 允许插件动态注册和移除 MCP 服务，并查询状态、重启或探测连接，无需用户逐项维护服务配置。 @LegGasai - 插件可按语言扩展聊天代码块的显示，未匹配或渲染失败时回退为普通代码块。 @imccyu - 插件索引可提供 GitHub Star 和 npm 周下载量，默认仍按索引提供的顺序排列。 @turtle1999 - Creator 的开发指引统一到 dsh-doc，用于定制 DSH 并查阅当前版本资料；引用旧技能名称或路径的扩展需迁移。 @turtle1999 - 自定义模型提供方支持 Gemini 原生接口，可获取模型列表并设置推理等级。 @turtle2099 - 模型请求的 User-Agent 增加启动配置标记，便于服务端区分桌面端、Web、命令行与 SDK 请求。 @imccyu - 调整账号通知，支持产品公告等消息并随界面语言更新；已有登录保留，自定义账号插件与配置需迁移。 @lsdsjy - PTC 按运行时限限制工具调用总量，超限会终止代码并清空保留状态，已完成的操作不会撤销。 @kermanx - Session 支持批量追加事件，日志格式不变；自定义追加接口的包装代码需适配批量调用。 @liukx0205 - 工具失败提供更明确的错误类型与代码，便于定位问题；依赖旧错误分类的插件和 SDK 集成需同步适配。 @sjw1231 - 调整 Computer Use 的窗口操作、键盘控制和授权，默认不移动系统鼠标；自定义脚本与 helper 需同步升级。 @CreatixChu, @Tuyixiang, @Dudu-0223 - Office 改用原生工具，Web 与 SDK 均可加载技能；旧包和技能需迁移，文档解析在 DSH 主进程中运行，不受命令行沙箱保护。 @yudshj - Windows 的额外目录授权仅供文件工具使用，不扩大终端或 PTC 的访问范围；相关沙箱扩展需迁移。 @Tuyixiang - 调整 LiveShare 的多会话分享与插件授权，旧授权需重新配置；PTC 可访问分享目录之外，仅应分享给可信任的人。 @mektpoy - npm 安装与桌面端随附对应版本的源码和文档，方便查阅与开发扩展；Python 单文件运行时不包含这些资源。 @turtle1999 - 升级 Zod 至 4.6.6、Stagehand 至 4.4.0；Stagehand 改为自动发现扩展，旧 extensionId 配置不再生效。 @imccyu New Features - Git Worktree supports reviewing changes by branch, commit, and file category, with GitHub reviews, synchronized viewed-file progress, and branch updates directly in DSH. - SubAgent supports named, multi-level collaboration, while AgentTeam can be enabled per session with a shared member and task panel., @Yifffan - Desktop settings now let you switch between stable and development update channels. ### Improvements - Improve commenting, file navigation, and narrow-screen layouts during code review, reduce lag when viewing large changes, and allow more time to create worktrees in large repositories. - Improve browsing and coordinating nested subagents, prioritizing task descriptions and supporting incremental expansion and retries after failed reads. - Improve sidebar plugin organization: move infrequently used entries into More and restore them without changing their original order. - Simplify actions after installing personalized pages, replacing Keep with Undo and Restore. - Improve custom-theme coverage for notifications, cards, plans, tasks, and other interface colors. - Improve menu positioning during page zooming, panning, and browsing long lists, keeping menus aligned with their triggers; custom panels need to adopt the new positioning API., @LegGasai - Improve dark-theme file-tree panels with layered backgrounds instead of white shadows. - Improve file discovery in the sidebar with name and path search, exclusion rules, and hidden-file controls. - Improve browsing and dragging in long sidebar lists, with plugin navigation and sessions sharing a scroll area and workspace controls remaining visible. […cut]

### [Feature]: Team Gateway: bring your own Slack app per agent (keep bot name and avatar)

kind: hot-issue · source: nousresearch/hermes-agent · published: 2026-11-11 · link: https://github.com/NousResearch/hermes-agent/issues/153396
digest: shown under AI Agents › Coding Agents & Assistants › Hermes Agent · 8 comments, 7 👍; +15 in the last 24h
text: ### Problem or Use Case On Hermes Cloud, an instance on the Team Gateway relay replies through the shared team bot, with its display name added as a prefix. A Slack token held by the instance itself keeps the machine awake, because suspend only arms when messaging is relay-only. So today the choice is either: - each agent keeps its own Slack app (own name, avatar, channel) and stays awake around the clock, or - each agent scales to zero when idle, but every agent speaks through one shared bot. You can't have both. ### Proposed Solution Let the connector hold a separate Slack app (bot token, name, avatar) per agent. Each agent would reply under its own identity through the relay, and still suspend when idle and wake on inbound or a scheduled job. ### Alternatives Considered - Shared bot with a name prefix plus "Lock a location to this agent" per channel: routing works, but every agent looks the same in Slack. - Posting through the shared bot with a per-message username and icon (Slack's `chat:write.customize`): would give each agent a distinct name and avatar without separate apps. - Turning instances on and off by hand: saves money, but messages and scheduled jobs are missed while an agent is off. ### Feature Type Gateway/messaging improvement ### Additional context I run several agents for my business and for clients, each in its own Slack channel. A distinct name and avatar is a big part of how a team treats each agent as its own colleague. A core team member said in Discord (Nov 10) that bring-your-own bot accounts for Team Gateway are being explored, with no concrete plans yet.

===== 2026-11-12 · AI Models & Labs =====

### Baidu: ERNIE-5.5-Flash-Preview (free)

kind: model · source: OpenRouter · published: 2026-11-10 · link: https://openrouter.ai/baidu/ernie-5.5-flash-preview:free
digest: shown under AI Models & Labs › New on OpenRouter
text: ERNIE 5.5 Flash Preview is the latest foundation model in the ERNIE family, with comprehensive improvements in coding, agentic capabilities, knowledge work, and deep research. It has 280 billion total...

===== 2026-11-12 · AI Policy =====

### Commission Implementing Regulation (EU) 2026/2487 of 10 November 2026 laying down rules for the application of Regulation (EU) 2024/1689 of the European Parliament and of the Council as regards the establishment, development, implementation, operation and supervision of AI regulatory sandboxes

kind: policy-item · source: EUR-Lex · published: 2026-11-10 · link: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R2487
digest: shown under AI Policy › EU · stage: Regulation adopted
text: (the source gave no text)

### Motie van de leden Mathlouti en Struijs over inzicht in de AI-toepassingen die de politie al inzet en de mogelijkheden ọm deze op te schalen

kind: policy-item · source: Tweede Kamer · published: 2026-11-10 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24707&did=2026D57026
digest: shown under AI Policy › Netherlands
text: Motion. Vaststelling van de begrotingsstaten van het Ministerie van Justitie en Veiligheid (VI) voor het jaar 2027

### EU needs a system to respond to AI incidents, Finland and Estonia say

kind: policy-item · source: Politico Europe · published: 2026-11-11 · link: https://www.politico.eu/article/eu-needs-a-system-to-respond-to-ai-incidents-finland-and-estonia-say/?utm_source=RSS_Feed&utm_medium=RSS&utm_campaign=RSS_Syndication
digest: shown under AI Policy › News & commentary
text: In a letter seen by POLITICO, Finland and Estonia call for "EU-level arrangements for responding to serious AI incidents." This comes as European leaders are set to meet Friday to debate AI for the first time.

===== 2026-11-12 · Data Engineering =====

### Databricks CLI v1.26.0

kind: release · source: databricks/cli · published: 2026-11-11 · link: https://github.com/databricks/cli/releases/tag/v1.26.0
digest: shown under Data Engineering › Databricks › Databricks CLI
text: ## Release v1.26.0 (2026-11-11) ### AI Runtime * `air run` reuses its existing workspace connection for config validation instead of opening a second one, which saves a TCP and TLS handshake per submission. * Speed up `databricks air run` for git-pinned `code_source` snapshots by compressing the archive in parallel, which substantially shortens packaging on large repositories. * Point the `air run -h config` agent-skill hint at the stable `databricks-ai-runtime` skill. ### Bundles * Add `DATABRICKS_BUNDLE_INIT_WORKSPACE_HOST_PROFILE`, which names a profile whose host the `workspace_host` template helper returns instead of the selected profile's host. The profile must have the selected profile's workspace ID. * Fixed an explicit `false` on optional boolean fields (`variables.*.sensitive`, `artifacts.*.dynamic_version`, `bundle.deployment.lock.force`, `workspace.azure_use_msi`, `replace_existing` on postgres endpoints, databases and roles, and the `experimental.*` flags) being dropped, which hid it from `bundle validate -o json` and kept a target from overriding `true` with it. * Stop sending `compute_size` in the app update mask when the bundle does not declare it, so a deploy no longer resets a manually resized app to the default size. * `lifecycle.depends_on` can now target the grants or permissions of a resource, as `schemas.foo.grants`. * Add support for the `feature_specs` resource type, including UC grants on a feature spec. ### Dependency Updates * Update the Go SDK to v0.197.0. * Bump Go toolchain to 1.27.4.

### Local Analytics Doesn’t Need a Database Server

kind: community-post · source: DuckDB blog · published: 2026-11-12 · link: https://duckdb.org/2026/11/12/local-analytics-without-a-database-server.html
digest: shown under Data Engineering › Open-source stack › DuckDB
text: From interactive maps to graph exploration, DuckDB makes it possible to analyze data without a database server. Ilya Boyandin shares how this approach led to SQLRooms, a toolkit for building analytics applications that bring data, visualizations, and AI-assisted analysis together on the user’s machine.

### Agents Are Code Too: What I Learned Shipping a Cortex Agent Through Azure DevOps

kind: community-post · source: Snowflake on Medium · published: 2026-11-11 · link: https://medium.com/snowflake/agents-are-code-too-what-i-learned-shipping-a-cortex-agent-through-azure-devops-fab3adae29e8
digest: shown under Data Engineering › News & discussion
text: Building the agent took a week. Getting it safely from sandbox to production took longer, and taught me more. Most Cortex Agent content I read ends at the same place: a working demo in Snowsight, a clever question, a correct answer. That is where my real work started. In my recent project, I built a Cortex Agent for the finance domain. The agent itself came together quickly. What took real thought was the part nobody demos: moving it through sbx, dev, uat and prod with the same discipline we already applied to every other Snowflake object on the platform. After roughly a decade of building data platforms, I’ve learned to be suspicious of anything that only exists in one environment. So here is what I learned treating an agent like code, and what I’d do the same way again. An agent you can’t rebuild from Git is a prototype, no matter how good its answers are. 1. The myth: “An agent is just a config in the UI” It’s easy to see a Cortex Agent as a few settings in a form: pick a semantic v…

### Genie ZeroOps is available in Beta

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#genie-zeroops-is-available-in-beta
digest: shown under Data Engineering › Databricks · 🤖
text: Genie ZeroOps is now available in Beta. It monitors jobs, pipelines, and tables in the background, detects failures and data quality issues, investigates the root cause, and proposes a fix. See Get started with Genie ZeroOps.

### Azure Databricks Genie plugin for Microsoft 365 Copilot (Public Preview)

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#azure-databricks-genie-plugin-for-microsoft-365-copilot-public-preview
digest: shown under Data Engineering › Databricks
text: The Azure Databricks Genie plugin connects Microsoft 365 Copilot Chat to Genie One, so users can ask questions about their Azure Databricks data without an @-mention. See Option 1: Use the Azure Databricks Genie plugin (recommended).

### Azure Databricks Genie plugin for Microsoft Copilot Cowork (Public Preview)

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#azure-databricks-genie-plugin-for-microsoft-copilot-cowork-public-preview
digest: shown under Data Engineering › Databricks · 🤖
text: The Azure Databricks Genie plugin connects Microsoft Copilot Cowork to Genie One, so users can ask questions about their Azure Databricks data without creating an OAuth app or editing a plugin manifest. Existing installations of the Beta manifest-based Genie plugin aren't migrated automatically. To use the new plugin, add it in Copilot Cowork. See Azure Databricks Genie plugin for Microsoft Copilot Cowork.

### Bring your own ChatGPT subscription to Codex with Unity Gateway

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#bring-your-own-chatgpt-subscription-to-codex-with-unity-gateway
digest: shown under Data Engineering › Databricks
text: You can now use your own ChatGPT Go, Plus, Pro, or Enterprise subscription with Codex and ChatGPT desktop through Unity Gateway. Requests are billed to your subscription, and Unity Gateway governs access and usage. See ChatGPT subscription support.

### Pages are generally available

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#pages-are-generally-available
digest: shown under Data Engineering › Databricks
text: Pages, governed definitions of business concepts organized by domain on the Discover page, are generally available. Curators can certify and deprecate Pages, and the new MANAGE PAGES permission controls who can publish and manage Pages in a domain. You can also manage Pages with the REST API. See Pages.

### The Genie One desktop app for Windows is in Beta

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#the-genie-one-desktop-app-for-windows-is-in-beta
digest: shown under Data Engineering › Databricks · 🤖
text: The Genie One desktop app is now available for Windows in Beta, in addition to macOS. The native app opens Genie One on your desktop instead of in a browser tab, so business users can chat with data in natural language, work with their threads and documents, and use Genie Agents without a browser. See Windows.

### Write custom service policies in Python (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#write-custom-service-policies-in-python-beta
digest: shown under Data Engineering › Databricks
text: You can now write a custom service policy as a Python function in Unity Catalog. Use it for rules that SQL can't express, such as regular expressions, Python packages, or calls to an external guardrail through a service credential. It's available in select regions. See Write a custom Python service policy.

### Allow ChatGPT and Claude as partner platforms in context-based ingress policies

kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#allow-chatgpt-and-claude-as-partner-platforms-in-context-based-ingress-policies
digest: shown under Data Engineering › Databricks
text: Context-based ingress policies can now allow traffic from ChatGPT and Claude as partner platforms. Azure Databricks keeps their published IP ranges current, so you don't track the IPs yourself. Use these rules to allow hosted Model Context Protocol (MCP) clients, such as the Databricks Genie plugins for ChatGPT and Claude, to reach your workspace. See Allow partner platforms in context-based ingress policies.

### Text and binary inputs for protobuf requests to custom model serving endpoints (Public Preview)

kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#text-and-binary-inputs-for-protobuf-requests-to-custom-model-serving-endpoints-public-preview
digest: shown under Data Engineering › Databricks · 🤖
text: Protobuf requests to custom model serving endpoints can now carry text and binary data, such as titles, images, audio, and documents, as KServe v2 BYTES tensors alongside numeric tensors in the same request. Text and binary model outputs are returned as BYTES tensors. This feature is in Public Preview and is only available on endpoints deployed after November 10, 2026. See Protobuf tensor input.

### External access to Unity Catalog managed Delta tables will soon be available by default for workspaces with the compliance security profile enabled

kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#external-access-to-unity-catalog-managed-delta-tables-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled
digest: shown under Data Engineering › Databricks
text: Starting on or after December 10, 2026, external access to Unity Catalog managed Delta tables will be available by default for eligible workspaces with the compliance security profile enabled. Supported external Delta clients can create, read, and write Unity Catalog managed Delta tables. Creating and writing managed Delta tables requires catalog commits. Metastore external data access settings and Unity Catalog privileges continue to control access. See Access Databricks tables from Delta clients.

### Use cleaned AI answers in Lakeflow Designer (Public Preview)

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#use-cleaned-ai-answers-in-lakeflow-designer-public-preview
digest: shown under Data Engineering › Databricks · 🤖
text: Clean supported AI Function outputs in Lakeflow Designer for downstream transformations. Cleaned results include answer values, error messages, and raw responses in separate columns. See AI Function.

### Distinguish Lakeflow Designer Python previews from full runs (Public Preview)

kind: vendor-note · source: Azure Databricks · published: 2026-11-06 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#distinguish-lakeflow-designer-python-previews-from-full-runs-public-preview
digest: shown under Data Engineering › Databricks
text: Python operators in Lakeflow Designer now expose config["is_preview"] so your code can skip side effects during previews. See Python preview mode.

### Calculate across rows in Lakeflow Designer (Public Preview)

kind: vendor-note · source: Azure Databricks · published: 2026-11-05 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#calculate-across-rows-in-lakeflow-designer-public-preview
digest: shown under Data Engineering › Databricks
text: Use the Multi-Row Formula operator in Lakeflow Designer for running totals, ranks, moving averages, and other calculations across ordered rows. See Multi-Row Formula.

### The next chapter for CI/CD in Fabric Warehouse (Preview)

kind: vendor-note · source: Microsoft Fabric · published: 2026-11-11 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/The-next-chapter-for-CI-CD-in-Fabric-Warehouse-Preview/ba-p/5401222
digest: shown under Data Engineering › Azure / Fabric & GCP
text: Sections: What we've delivered; Establishing a consistent deployment foundation with DacFx; Pre, and post-deployment scripts; Warehouse Item Definition APIs; Bringing Familiar Warehouse Development Experiences to Client Tools; What's next for CI/CD in Fabric Warehouse; Get started with CI/CD in Fabric Warehouse. Building and operating a data warehouse is increasingly a software engineering discipline. Teams want to develop warehouse changes in isolation, version them in Git, review them through pull requests, promote them safely across environments, and automate the entire process using their existing CI/CD systems. Over the past several releases, we've been evolving CI/CD in Fabric Warehouse around that lifecycle: DacFx established a common schema deployment foundation. Pre, and post-deployment scripts expanded deployments beyond schema changes. Warehouse Item Definition APIs opened the same lifecycle to automation. Together, these investments are creating a more complete CI/CD lifecy…

### Use OneLake as native storage for Azure Databricks (Preview)

kind: vendor-note · source: Microsoft Fabric · published: 2026-11-11 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks-Preview/ba-p/5377939
digest: shown under Data Engineering › Azure / Fabric & GCP
text: Sections: Why this matters; What's new in this release; One shared data foundation, with flexibility above it; Use OneLake as the storage foundation; Continue using Unity Catalog-managed objects; Keep platform responsibilities clear; How it works; Security; How to read the data in Fabric; Get started. Organizations increasingly use Microsoft Fabric and Azure Databricks together so teams can choose the tools that best fit their data engineering, analytics, and AI workloads while working from a common data foundation. OneLake external-location support for Azure Databricks Unity Catalog is now generally available in Microsoft Fabric, with OneLake Security enabled by default for Azure Databricks Storage items. On the Azure Databricks side, the feature is in preview. With this integration, supported Unity Catalog-managed data can be stored directly in OneLake. To understand the setup and supported scenarios, Connect Azure Databricks to a OneLake external location. Data teams often need Azu…

### Project caps (also known as scheduling policies) let you limit maximum slots and concurrency per project within a BigQuery reservation (GA)

kind: vendor-note · source: BigQuery · published: 2026-11-11 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: Project caps (also known as scheduling policies) let you limit maximum slots and concurrency per project within a BigQuery reservation. This feature is only supported in the BigQuery Enterprise and Enterprise Plus editions and is generally available (GA).

### You can specify an optional principal property on BigQuery reservation assignments to route queries to specific reservations based on the identity of the user, service account, or third-party identity executing the job (GA)

kind: vendor-note · source: BigQuery · published: 2026-11-11 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: You can specify an optional principal property on BigQuery reservation assignments to route queries to specific reservations based on the identity of the user, service account, or third-party identity executing the job. This feature is only supported in the BigQuery Enterprise and Enterprise Plus editions and is generally available (GA).

### Upcoming end of life for the Genie One MCP Beta endpoint

kind: open-action · source: Azure Databricks · ends: 2026-11-30 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#upcoming-end-of-life-for-the-genie-one-mcp-beta-endpoint
digest: shown under Data Engineering › Action required
text: (the digest's own summary of this note; the vendor's text is not saved) The Genie One MCP Beta endpoint at `https://<workspace-hostname>/api/2.0/mcp/genie` reaches end of life on November 30, 2026, after which requests fail; migrate all workloads to the `system.ai.genie_one_mcp` MCP in Unity Gateway.

### Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields

kind: open-action · source: BigQuery · ends: 2027-01-31 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_06_2026
digest: shown under Data Engineering › Action required
text: Starting January 31, 2027, the BigQuery Data Transfer Service for Shopify connector will no longer support the following fields: The legacyMode field from the DeliveryProfile dataset schema The permitSkuSharing field from the FulfillmentService dataset schema For more information, see January 31, 2027.

===== 2026-11-12 · Community stories =====

### Gemini Decisions API

kind: story · source: Hacker News · published: 2026-11-11 · link: https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/ · discussion: https://news.ycombinator.com/item?id=50456791
digest: shown under AI Models & Labs › Spotted · 375 points, 120 comments
text: Meet the Gemini Decisions API, powered by our state-of-the-art model Gemini Decision for fast, calibrated multimodal decisions.

### I gave an agent a lakehouse and control of my garden

kind: story · source: Hacker News · published: 2026-11-08 · link: https://jatorre.github.io/garden/ · discussion: https://news.ycombinator.com/item?id=50415162
digest: shown under AI Agents › Spotted · 5 points, 0 comments
text: Or how to produce a €60 lettuce. Eleven sensors, a camera, an old phone and an agent that waters my vegetables.

### Faster Retrieval for Better, More Efficient RAG

kind: story · source: Hacker News · published: 2026-11-11 · link: https://machinelearning.apple.com/research/faster-retrieval · discussion: https://news.ycombinator.com/item?id=50455633
digest: shown under AI Models & Labs › Spotted · 190 points, 36 comments
text: Maximum inner product search (MIPS) sits at the core of recommendation systems, search, and retrieval-augmented generation (RAG). Given a

### Atuin Threads: All your agent sessions on every machine

kind: story · source: Hacker News · published: 2026-11-11 · link: https://blog.atuin.sh/threads-agent-sessions/ · discussion: https://news.ycombinator.com/item?id=50453637
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: Atuin Threads: one searchable, synced history for every agent session, on every machine Start a task in Claude Code, then resume it in Codex

### Launch HN: Pomerado (YC F26) – Turn any website into an MCP for agents

kind: story · source: Hacker News · published: 2026-11-11 · link: https://news.ycombinator.com/item?id=50455811 · discussion: https://news.ycombinator.com/item?id=50455811
digest: shown under AI Agents › Spotted · 53 points, 42 comments
text: (the source gave no text)

### Tools for exploring the souls of large language models

kind: story · source: Hacker News · published: 2026-11-11 · link: https://oshea00.github.io/posts/tinygpt-visualizer/ · discussion: https://news.ycombinator.com/item?id=50458434
digest: shown under AI Models & Labs › Spotted · 43 points, 12 comments
text: On metaphysics, large language models, and souls. Using TinyGPT Visualizer to decode how large language models think and act.

### Show HN: Klad, a paint app your coding agent can drive (source-available)

kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/klad-app/klad · discussion: https://news.ycombinator.com/item?id=50454951
digest: shown under AI Agents › Spotted · 78 points, 31 comments
text: A drawing app built for agent/human collaboration.

### Modern Web Guidance 1.0: The web platform expertise your coding agent is missing

kind: story · source: Hacker News · published: 2026-11-11 · link: https://developer.chrome.com/blog/modern-web-guidance-v1 · discussion: https://news.ycombinator.com/item?id=50460398
digest: shown under AI Agents › Spotted · 30 points, 7 comments
text: Modern Web Guidance 1.0 brings expert-vetted web platform skills, browser compatibility data, and codebase modernization to your AI coding agents.

### TimeNet: Open-source data infrastructure for Temporal Foundation Models

kind: story · source: Hacker News · published: 2026-11-10 · link: https://github.com/OpenTSLM/TimeNet · discussion: https://news.ycombinator.com/item?id=50443264
digest: shown under Data Engineering › Spotted · 49 points, 8 comments
text: Download and explore time-series datasets through one standardized format.

### JSON vs. jsonb in Postgres: size and speed, measured

kind: story · source: Hacker News · published: 2026-11-11 · link: https://now-next.nl/en/insights/postgresql-json-vs-jsonb-measured/ · discussion: https://news.ycombinator.com/item?id=50452394
digest: shown under Data Engineering › Spotted · 29 points, 0 comments
text: json vs jsonb in PostgreSQL 17 and 18, measured on six document shapes: when jsonb is 23% smaller or 41% larger, read speed, GIN, and what it changes.

### Show HN: I created a library for correctly using SQLite in Go programs

kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/cattlecloud/litesql · discussion: https://news.ycombinator.com/item?id=50453176
digest: shown under Data Engineering › Spotted · 21 points, 1 comment
text: litesql is a Go library for convenient, easy, and performant use of SQLite3 databases in Go programs

### Compress any LLM 3x in one click, near-lossless, in under 50 MB RAM

kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/NeuraCryption/SPECTRA · discussion: https://news.ycombinator.com/item?id=50450729
digest: shown under AI Models & Labs › Spotted · 24 points, 1 comment
text: (the source gave no text)

### The Surprising Effectiveness of Deleting Weights in LLM Post-Training

kind: story · source: Hacker News · published: 2026-11-10 · link: https://arxiv.org/abs/2611.10866 · discussion: https://news.ycombinator.com/item?id=50447363
digest: shown under AI Models & Labs › Spotted · 30 points, 0 comments
text: How little of a pretrained large language model (LLM) has to change for it to acquire new capabilities? We find that zeroing fewer than 0.05% of its weights, with no other modification, matches full fine-tuning (FFT) at scale across three LLM post-training regimes: reinforcement learning with verifi

### Subagents Conwidered Harmful

kind: story · source: Hacker News · published: 2026-11-11 · link: https://nikvdp.com/notes/subagents-considered-harmful/ · discussion: https://news.ycombinator.com/item?id=50450268
digest: shown under AI Agents › Spotted · 24 points, 8 comments
text: (the source gave no text)

### Show HN: NoDOM high performance WASM UI kit for DuckDB-WASM

kind: story · source: Hacker News · published: 2026-11-11 · link: https://osullivj.github.io/nodom_ukprop/ · discussion: https://news.ycombinator.com/item?id=50452389
digest: shown under Data Engineering › Open-source stack › DuckDB
text: (the source gave no text)

### Writing a SIGGRAPH paper from scratch

kind: story · source: Lobste.rs · published: 2026-11-11 · link: https://alexandergoslin.me/writing-a-siggraph-paper-from-scratch/ · discussion: https://lobste.rs/s/793ecg/writing_siggraph_paper_from_scratch
digest: shown under AI Models & Labs › Spotted · 8 points, 0 comments
text: In September 2024, my final year of college, I began working on a side project called “Terrain Diffusion.” The goal was to create a learned procedural terrain generator that could drop into almost any game engine with minimal friction. I had nothing but one RTX 3090 Ti, which I bought with money fro

### A Small Laptop Is a Full Build Kit: Bootstrapping with a Chromebook, Claude, and GitHub

kind: story · source: Dev.to · published: 2026-11-11 · link: https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16 · discussion: https://dev.to/earlgreyhot1701d/a-small-laptop-is-a-full-build-kit-bootstrapping-with-a-chromebook-claude-and-github-4j16
digest: shown under AI Agents › Spotted · 22 reactions, 7 comments
text: A small laptop is a full build kit. Here's how far mine went. TL;DR: A reader suggested I publish

### Part 5: The Control That Protected an Empty Bucket

kind: story · source: Dev.to · published: 2026-11-11 · link: https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j · discussion: https://dev.to/ndcodes/part-5-the-control-that-protected-an-empty-bucket-e1j
digest: shown under Data Engineering › Spotted · 18 reactions, 4 comments
text: This is Part 5 of a series building an HL7 v2 to FHIR R4 interoperability service in public. The

### The Limits That Don't Limit

kind: story · source: Dev.to · published: 2026-11-07 · link: https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j · discussion: https://dev.to/aws-builders/the-limits-that-dont-limit-2o4j
digest: shown under AI Agents › Spotted · 19 reactions, 4 comments
text: Four walls exist to stop a runaway agent. A turn cap counts model calls, a token cap misses single-turn answers, and a 5-second deadline took 21.9 seconds.

### Anthropic Targets $1.4T Valuation in IPO

kind: story · source: Hacker News · published: 2026-11-11 · link: https://www.bloomberg.com/news/videos/2026-11-10/anthropic-targets-1-4-trillion-valuation-in-ipo-video · discussion: https://news.ycombinator.com/item?id=50445463
digest: shown under AI Models & Labs › Spotted · 16 points, 1 comment
text: (the source gave no text)

===== 2026-11-13 · AI Agents =====

### Claude Code v2.1.323

kind: release · source: anthropics/claude-code · published: 2026-11-12 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.323
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: ## What's changed - Added Code Mode, an experimental opt-in in which Claude writes JavaScript to call its tools; see to turn it on, or to turn it off for an organization - Added `engines["claude-code"]` to `plugin.json`: plugins outside their stated Claude Code version range are not installed, updated or loaded, and install and update pick the newest version that fits - Added type checking of a plugin's TypeScript hooks module to `claude plugin validate`; each finding is a warning, and `--strict` fails on it - Added to `claude plugin validate` the `$` nouns a mod's `engine.create` hook adds, withholds or replaces - Added support for `CLAUDE_CODE_AUTO_MODE_MODEL` in managed settings for Claude Desktop sessions on third-party providers (takes effect once Claude Desktop includes this version) - Added an options menu (stop, switch to usage credits, upgrade) when a model needs usage credits that are turned off or used up - Added a progress heartbeat every 30 seconds while hooks run long in `claude -p` and SDK sessions, so a host such as Claude Desktop won't end the turn as hung (once it includes this version) - Added `.docx` support to Artifact tool asset uploads - Added a `/diff to close` hint to the diff panel, and the keys that focus and close a panel to the `?` shortcut guide - Added a start-up warning for Bash allow rules with a `*` in a variable's value, such as `Bash(PORT=* npm run dev)` - Added a warning when a plugin's language server can't start, naming the server and what to check - Added a one-time startup notice naming `CLAUDE_CODE_PERFORCE_MODE` when Perforce settings are found and the mode is off - Added `CLAUDE_CODE_DISABLE_AGENT_PROGRESS_SUMMARIES` (available since 2.1.318): set it to `1` to turn off subagent progress summaries and the requests that write them (anthropics/claude-code#86879) - Added `CLAUDE_CODE_RESUME_HINT_COMMAND`, which a program that starts Claude Code can set to have the exit hint name its own resume command - Added `unsetOptionCount` to the `claude plugin install --json` result: how many `userConfig` options are not yet set - Added `isPromptCovered` to the props a mod's pane is drawn with, telling it when a dialog or a field above the prompt covers the prompt - Fixed running `/compact` again, or after a command such as `/context`, summarizing away a message that Claude had not answered yet - Fixed a resumed session joining your next message to an old interrupted message that was not resumed - Fixed a memory spike at the next prompt after Claude changed a very large file - Fixed a setting saved in a running session undoing a hand edit made to `settings.json` moments earlier; a settings file you delete during a session now stays deleted - Fixed `claude plugin` commands and `claude mcp list` signing you out of a Console profile when they ended while the token was being renewed - Fixed Edit and Bash running out of memory on certain `/proc` files, and Edit hanging or running out of memory on devices and named pipes - Fixed Claude Code failing to start, or to clear stored credentials at sign-out, when saving its configuration file failed with "Out of memory" - Fixed requests sent without streaming failing on errors that streamed requests recover from, such as a rejected image, thinking block or beta header - Fixed `ExitWorktree`, the worktree exit dialog and `/resume` leaving the session in the wrong folder when the folder the shell was in before entering the worktree had been deleted - Fixed accents and other combining marks sometimes landing left of the text, leaving stale copies on screen, or silently disappearing when text wraps - Fixed the last key of a key chord, such as Enter in ctrl+x enter, acting on a dialog's text field when the chord's own action isn't available there - Fixed `ps` processes piling up when the process listing Claude Code runs before stopping a command takes too long - Fixed subagent transcripts and large tool results being saved apart from the session's transcript after entering a worktree created by a `WorktreeCreate` hook or belonging to a nested repository - Fixed a session on a named Anthropic profile moving to another sign-in when `/fork`, the Left arrow or `--bg` continued it in the background; reopen any session that was open during the update - Fixed a background session sending a conversation under another sign-in when its named Anthropic profile is missing, changed or overridden; it now stops and says so - Fixed a session on an API key, auth token or workload identity from its shell (not a setup token) moving to another sign-in in the background; it now stops and says so - Fixed MCP tool calls ending in the sign-in server's error, such as `TOKEN_EXPIRED`, instead of asking you to sign in again - Fixed an expired claude.ai login showing "Credit balance too low" when a saved Console key or `ant auth login` profile without credit was used instead - Fixed a session on a named Anthropic profile being handed to an older background service that could not keep its sign-in; it now says to restart the service - Fixed a background session's sign-in leaving the previous account's login or other credentials in place; it now clears them for every session on the computer, and a refused sign-in can leave no login - Fixed background sessions moving between a profile and the stored login when an update restarted them - Fixed sessions opened before a sign-in keeping signed-out feature flags after the sign-in - Fixed sessions that kept failing after a Claude apps gateway sign-in expired: once you sign in again with `/login` in another terminal, they carry on at the next message - Fixed the billing notice naming your `ant auth login` organization when a custom `X-Api-Key` header is set - macOS: Fixed "Not logged in · Please run /login" coming back right after a successful `/login` or a token refresh when the keychain was slow to answer […cut]

### [FEATURE] Passkey (WebAuthn) sign-in for Claude accounts, across every surface

kind: hot-issue · source: anthropics/claude-code · published: 2026-08-07 · link: https://github.com/anthropics/claude-code/issues/84862
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · 37 comments, 185 👍; +11 since 2026-11-11
text: ### Preflight Checklist ### Problem Statement Signing in to a Claude account currently offers two paths: "Continue with Google", or an emailed magic link / one-time code. If Google sign-in isn't an option for you, the magic link is the only path — and it's slow and failure-prone: - The email frequently takes 5+ minutes to arrive. #82049 reports 2–5 minute delays since mid-July 2026. - The link and code expire after 10 minutes. Those two facts interact badly. Five of the ten minutes are typically gone before the email lands, and nobody sits and watches an inbox for five minutes — so I step away, come back, and the link has expired. Then I request another one and try to time it better. The usable window is far shorter than the stated 10 minutes. The cost is then multiplied by the number of surfaces. I sign in on five: the Claude mobile app, Claude Code, the web app, Claude for Excel, and Claude for Chrome. Each holds its own credential and expires on its own schedule, so this isn't a one-time setup cost — it's a recurring interruption that lands several times across my clients. Passkeys are the standard answer to exactly this: instant, local, phishing-resistant, and already supported by the OS keychain or password manager on every device I use. ### Proposed Solution Make a passkey (WebAuthn/FIDO2) a first-class sign-in method for Claude accounts, on equal footing with "Continue with Google" and email: 1. **Enrollment.** In account settings, an "Add a passkey" flow supporting both platform authenticators (Windows Hello, Touch ID, Android) and roaming ones (hardware security keys). Multiple credentials enrolled concurrently, each named, listable, and individually revocable. 2. **Sign-in.** On the login screen, alongside "Continue with Google" and "Continue with email", a "Sign in with a passkey" option that triggers the standard WebAuthn prompt — no email round-trip, no expiry window. 3. **Every surface.** Offer it anywhere a magic link works today: claude.ai, the desktop app, the mobile apps, and the browser-based OAuth flow. Because Claude Code, the VS Code extension, Claude for Excel, and Claude for Chrome all authorize through a browser session, adding passkey sign-in to that flow covers all of them in one change. 4. **Additive, not a replacement.** Magic link and Google sign-in stay exactly as they are. One note on what already exists: something passkey-shaped is shipping under the name "Trusted Devices" — Claude Desktop prompts to set one up after login, and it backs Remote Control device auth. But as far as I can tell it isn't a _sign-in method_; it's a device-trust step layered on top of a login I still have to complete by email. It's also undocumented, single-credential only , crashes during setup on macOS , fails to enroll on Linux , and conflicts with the VS Code "Prefer Agent Host" setting . This request is for the sign-in half. ### Alternative Solutions Things I've tried or considered. None of them closes the gap: - **Continue with Googl... […cut]

### [BUG] 2.1.323 removed subagentStatusLine with no replacement: per-agent context, cost, model and effort are now invisible

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/issues/109446
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · regression; 2 comments, 2 👍; +4 in the last 24h
text: ## Regression: 2.1.323 silently removed `subagentStatusLine`, with no reason, no replacement and no migration path ### What happened The 2.1.323 changelog says: > Removed the `subagentStatusLine` setting: subagent rows always use the default look, and settings files that still hold the key load as before The settings schema now describes the key as "Deprecated: no longer has any effect. Subagent rows always use the default look." Nothing warns at startup. A configured command simply stops running, and users find out when their agent panel goes blank. 2.1.322 still runs the command. 2.1.323 never calls it. ### Why this hurts `subagentStatusLine` was the **only** place in Claude Code where a user could see, per running subagent, at a glance: - its live context use against its own window - what it has spent so far (tokens and dollars) - its model **and** its reasoning effort - its status, its age and its prompt-cache state Without it, a session that runs several background agents is flying blind. Nothing in the default row shows which agent is burning context, which one is about to hit its window, which one went to the expensive model, or which one is silently re-paying for an expired cache. This is the row as it rendered on 2.1.322, boxed in red: The same row as text: After 2.1.323 the same row reads only `flights:foreman Running grep`. ### This contradicts your own recent direction The changelog kept investing in this setting right up to the removal: - "Added reasoning effort to the `subagentStatusLine` payload, so custom agent rows can render model and effort" - "Added `agentType` to the `subagentStatusLine` payload, so scripts can tell custom subagent types apart" - "Fixed `${CLAUDE_PLUGIN_ROOT}` not being substituted in a plugin-provided `subagentStatusLine` command" People built on those additions. The docs still present the setting as live today: (section on `subagentStatusLine`) and ### Mods do not replace it The `ui.render` sites in 2.1.323 are `AskUserQuestion`, `UserMessage`, `AssistantMessage`, `ToolUse`, `ToolResult`, `ToolGroup`, `ToolProgress`, `CommandOutput`, `Spinner`, `TurnDuration`, `InfoNotice`, `SessionMode`, `PromptHint`, `AbovePrompt`, `Pane` and `Placed`. None of them is an agent-panel row, so no mod can draw what this setting drew. #105919 asked for exactly that render site on 2026-10-29 and has had no answer. Related open requests that all assume this setting exists: #102183, #102890, #96895, #97634 (the last one notes that no other place in the UI shows a subagent's model). ### What we ask 1. **Restore `subagentStatusLine`** in the next release, with the same payload as 2.1.322 (including `effort`, `agentType`, `contextWindowSize` and `tokenCount`). 2. If the default agent panel is being redesigned, **ship the replacement before removing the old hook**: a `ui.render` site for each agent-panel row , whose props carry the same payload. 3. Do not remove a documented, configurable surface without a deprecation release that wa... […cut]

### OpenAI Codex 0.168.0

kind: release · source: openai/codex · published: 2026-11-13 · link: https://github.com/openai/codex/releases/tag/rust-v0.168.0
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex
text: ## New Features - Browse model providers under Sessions → Model providers and choose the default for new chats. - Enable `features.tui_workspace` to view a side conversation beside the main chat. Drag the divider to resize the panes or press `leader z` to zoom the focused pane. - Attach recordings when using an audio-capable model. Codex skips confirmed rejected recordings on later turns and uses clip duration to keep more short recordings in context. - Enable `features.image_generation_animation` to generate or edit animated GIFs with optional frame count and timing controls. - Fullscreen Codex displays image previews and pets in tmux on Ghostty and Kitty with `allow-passthrough all`. - Set `tui.notification_method = "osc777"` for terminal notifications. Approval notifications show longer command previews and distinguish terminal input from network access requests. ## Bug Fixes - Local TUI history and resume pickers filter newly created threads by the signed-in ChatGPT account. - Open and resumed chats use their saved model provider after you change the default for new chats. - The TUI renders replies interrupted by tool calls as a single Markdown message and restores reasoning summaries when replaying a conversation. - Steering messages reach running turns when sent during the final transcript save or after switching back to a long-running chat. - Fuzzy file search gives filename matches more weight so matching parent directories are less likely to crowd them out. - Idle local MCP servers on Windows leave filesystem I/O available to the rest of Codex. ## Documentation - The app-server reference covers listing model providers, creating custom gateways, and updating gateway, Bedrock, and GCP settings. ## Chores - Codex warns when `features.multi_agent` is explicitly configured and points to `agents.enabled` for disabling subagent tools. - Contributors can run Bazel CI jobs locally without BuildBuddy credentials. ## Changelog Full Changelog: - #58766 Distinguish update handoffs in TUI startup telemetry @etraut-openai - #58767 Validate `/fork` before consuming the composer draft @etraut-openai - #58829 Accept agent follow-ups through native turn input delivery @won-openai - #58845 Add model provider discovery to the app server @alexsong-oai - #58876 Add model provider configuration writes to the app-server @alexsong-oai - #58877 Handle steers accepted during the final transcript flush @charliemarsh-oai - #58886 Preserve timestamp ties when paginating threads @jif-oai - #58890 Add a feature-gated account check for CLI thread resume @jif-oai - #58894 Support model catalog overrides for plugin guidance @goodman-oai - #58899 Add native patch support to direct Guardian review @swastik-oai - #58903 Support permission requests in direct Guardian review @swastik-oai - #58904 Add a standalone HTTP MCP server for the agent message board @jif-oai - #58908 Package the message board MCP connection as a plugin @jif-oai - #58909 Add an in-memory launcher for the message-board MCP server @jif-oai - #58918 Scope local history discovery to the current ChatGPT account @jif-oai - #58927 Fix live stream reflow at the allocated conversation width @fcoury-oai - #58931 Support direct Guardian review of patches invoked through exec_command @swastik-oai - #58933 Release message-board state before HTTP shutdown returns @jif-oai - #58935 Defer Guardian context trimming in elastic preparation @ioanbudea-OAI - #58936 Extract model-provider unit tests into separate files @ioanbudea-OAI - #58937 Verify queued network approval wakeups before polling again @seanh-oai - #58938 Skip attribution for direct MCP tool calls @victor-openai - #58939 Refine additional-context byte histogram buckets @akira-oai - #58940 Retire the daemon_auto_start feature flag @etraut-openai - #58945 Fix model selection after provider setup @etraut-openai - #58946 Preserve Guardian sender context for cloud deliveries with orbit IDs @felixxia-oai - #58950 Recover WebSocket transport after transient HTTP fallback @charliemarsh-oai - #58953 Support caller-owned sideband channels for realtime attachments @jiahao-oai - #58954 Add a thread-store builder with host cleanup support @felixxia-oai - #58955 Delete Guardian evidence boards when permanently deleting threads @felixxia-oai - #58956 Allow volatile World State sections to refresh after compaction @rhan-oai - #58957 Cache marketplace name mismatches during automatic upgrades @charliemarsh-oai - #58959 Recover inherited history from alternate rollout copies @charliemarsh-oai - #58960 Prefer indexed rollout paths when resolving ancestors @charliemarsh-oai - #58962 Preserve Guardian budget policy through review recovery @ioanbudea-OAI - #58963 Add host-owned turn admission to the agent runtime @rhan-oai - #58964 Stabilize and enable client tool output retention by default @jif-oai - #58966 Move protocol permissions tests into a separate file @viyatb-oai - #58969 Avoid unnecessary rendering during TUI history loading and insertion @etraut-openai - #58970 Keep automatic thread title saves off the TUI event loop @etraut-openai - #58971 Fix Escape handling in memory reset confirmation @imac-oai - #58973 Add opt-in MCP discovery for in-memory agent message boards @jif-oai - #58974 Bind final-message output before running sandboxed tools @viyatb-oai - #58975 Add usage accounting for host-owned agent runtimes @rhan-oai - #58978 Enable the segment heap on Windows CI runners @anp-oai - #58980 Record turn critical path metrics and trace fields @bkotsopoulos - #58983 Extend and bound exec-server session recovery @richardopenai - #58984 Allow hosts to restrict a thread's root-only capabilities @rhan-oai - #58986 Move agent message-board backend construction into the extension @jif-oai - #58988 Respect delivery boundaries for injected agent messages @won-openai - #58989 Keep HTTP fallback active for the rest of the session @charliemarsh-oai - #58990 Preserve modified Ctrl+C keys in active TUI views @imac-oai […cut]

### Oh My Pi v18.20.0

kind: release · source: can1357/oh-my-pi · published: 2026-11-12 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.0
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ### Breaking Changes - `secrets.yml` regex rules are now Rust `regex` patterns run natively, in linear time: lookarounds and backreferences are no longer supported, and a `(?P …)` group marks the part to redact (text around it is context that stays); `\d`, `\w` and `\s` are Unicode-aware. A regex rule that does not compile stops startup with an error naming the file and entry instead of being skipped. Migrate `(? \S+)`; see docs/secrets.md ( ) - Secret placeholders are now four camelCased words after the friendly name, e.g. `GitHubToken_correctHorseStapleBattery`, with no `$$` delimiters, and the transcript shows the real value wherever the model wrote one. Placeholders in the old `$$NAME_HASH:CASE$$` form, in sessions saved before this change, stay literal text, including in tool calls the model copies them into; start a new session to get working placeholders ( ) - What the model writes from placeholders (replies, thinking, tool calls, summaries) is stored as written and replayed byte-identical, keeping thinking signatures and prompt caches valid; model output that still holds a value (written while redaction was off, or before the secret was configured) is redacted on replay. Values a regex rule finds later no longer rewrite earlier history. A `friendlyName` is shown to the model as written and is dropped only when it spells out its own secret ( ) - Nix builds with `withAppleFm = false` no longer compile the Apple Foundation Models bridge with the host's Xcode - Apple Silicon Nix builds include Apple Foundation Models support instead of silently building without it ( ) - `ask` over RPC hosts without a form dialog now shows each prompt with the form's surrounding paragraphs, lists, preformatted blocks and tables instead of only the question ### Removed - Removed `task.file` and the task tool's `taskFile` field; subagent instructions are always inline - Todo tasks can no longer be blocked: the `blocked` status and `blocker` note are gone from the `todo` tool, `/todo edit` (`[!]` is now an unknown marker), the HUD, ACP plans, goal continuation (which no longer pauses on a blocked-only list) and the RPC `TodoStatus`/`TodoItem` wire types and SDKs (Go, Python, Rust). A saved todo list that still holds a blocked task reads back with it pending on resume ### Breaking Changes - `typeText` and `axType` resolve to `{ unconfirmed, focusReturn }` on every platform instead of the takeover focus report; only Windows takeover typing sets `unconfirmed`, saying why the target was not seen reading the typed text ( ) ## @oh-my-pi/pi-agent-core ### Changed - `prepareCompaction()` runs as the `compaction.prepare` loop phase, so a `ui.loop-blocked` stall from a cold token walk over a long branch names compaction instead of "unknown" ( ) ## @oh-my-pi/pi-ai ### Added - Added the `google-decisions` judgment API for Google's Gemini Decisions API (`gemini-decision-1`), with text and image input ( ) - Added `apiKey` to successful `OAuthAccessResolution` results from `oauth.accessById()` and `oauth.accessAll()`: the key normal requests send for that account, which differs from `accessToken` for providers with structured credentials ( ) - Added an optional `exemptionAlias` to `ToolCallLoopGuard` so transport calls can match the dispatched tool's name in `exemptTools` - Added the `liquid-systemone` judgment API for Liquid AI's decision models, which rejects image sets over Liquid's 10,000 32×32-patch request cap before sending ( ) - Added the `nace-systemone` judgment API for Nace's Drex decision models, which sends images as Drex's top-level `images` data URLs and replaces the base64 image, audio, video and PDF data URLs that Drex rejects in judged text with a description ( ) ### Fixed - Fixed a spent Codex account retrying every minute for days when its siblings were only refused the requested model: their short model-policy blocks no longer count as a sibling becoming available, so the usage-limit wait follows the spent account's reset and model fallback can take over ( ) - Auth-gateway client tokens (`serve --clients`) can no longer set who a request is from, who pays, or how the gateway reaches the provider: chat routes drop their request headers, `userProfileId`, `initiatorOverride`, `metadata`, `serviceTier`, `cacheRetention` and the other gateway-only options, while the gateway token keeps them ( ) - Fixed the auth gateway's `/v1/pi/stream` dropping `taskBudget`, `include` and `anthropicPrefixMismatchBehavior`, which its other chat routes accept ( ) - Fixed requests to Vertex AI Mistral partner models (`mistral-medium-3`, `mistral-small-2503`, `codestral-2`) failing because they were sent in Anthropic's request format ( ) - Added Gemini's `xhigh` thinking level, sent on the Gemini API and Vertex for models whose ladder exposes it (Gemini 4 Hydrogen). - Fixed omp failing to start with `ENOTDIR: not a directory, stat '~/.aws/credentials'` when `~/.aws` is a file instead of a directory ( ) ## @oh-my-pi/pi-catalog ### Added - Added the Gemini Decision 1 judge model (`google/gemini-decision-1`, `GEMINI_API_KEY`); assign it to the `judge` role to use it ( ) - Added Nace (`nace`) with the `drex-max-v1.1`, `drex-max-finance` and `drex-v2.0` judge models and `/login nace` (`NACE_API_KEY`) ( ) - Added Gemini 4 Hydrogen (`gemini-4-hydrogen`) on Google, Vertex, OpenCode Zen, OpenRouter, Vercel AI Gateway, and Kilo, with low, medium, high, and xhigh thinking levels on the native Google transports. ### Changed - Factory Droid requests identify as droid 1.7.1 and report the interactive CLI as their surface, and prefix-bound Claude models (Opus, Sonnet and Haiku 5.5, Fable 5.1) on Factory's direct Anthropic route now ask Anthropic to drop stale signed thinking instead of rejecting a turn whose earlier context changed ( ) ### Fixed - Fixed `alibaba-token-plan/qwen4-max-preview` (including its `qwen4.0-max-preview` alias) showing no context or output limits, image input, or thinking levels . […cut]

===== 2026-11-13 · AI Models & Labs =====

### Google: Gemini 4 Hydrogen

kind: model · source: OpenRouter · published: 2026-11-12 · link: https://openrouter.ai/google/gemini-4-hydrogen
digest: shown under AI Models & Labs › New on OpenRouter
text: Gemini 4 Hydrogen is the high-efficiency workhorse model of the Gemini 4 family from Google, built for high-throughput agentic workflows, coding and multi-model routing at lower cost and latency than...

### Google: Gemini 4 Hydrogen (batch)

kind: model · source: OpenRouter · published: 2026-11-12 · link: https://openrouter.ai/google/gemini-4-hydrogen:batch
digest: shown under AI Models & Labs › New on OpenRouter
text: Gemini 4 Hydrogen is the high-efficiency workhorse model of the Gemini 4 family from Google, built for high-throughput agentic workflows, coding and multi-model routing at lower cost and latency than...

===== 2026-11-13 · AI Policy =====

### Communication from the Commission – Guidelines on the implementation of the transparency obligations for certain AI systems under Article 50 of Regulation (EU) 2024/1689 (the AI Act)

kind: policy-item · source: EUR-Lex · published: 2026-11-12 · link: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC06005
digest: shown under AI Policy › EU · stage: Preparatory document
text: (the source gave no text)

### Gewijzigde motie van het lid Beckerman over onderzoeken hoe kunstenaars en makers beter beschermd kunnen worden tegen AI (t.v.v. 37020-XIII-28)

kind: policy-item · source: Tweede Kamer · published: 2026-11-12 · link: https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z24997&did=2026D57726
digest: shown under AI Policy › Netherlands
text: Motion. Vaststelling van de begrotingsstaten van het Ministerie van Economische Zaken en Klimaat (XIII) voor het jaar 2027

### Nonprofits sue Anthropic, Google, and other tech giants to freeze the AI arms race

kind: policy-item · source: Politico US · published: 2026-11-12 · link: https://www.politico.com/news/2026/11/12/nonprofits-sue-ai-companies-over-existential-risk-01161965
digest: shown under AI Policy › News & commentary
text: Five tech companies are targeted in a San Francisco suit that wants a court to block more advanced models and self-improving AI.

### AI Kill Switches: What Policymakers Should Know

kind: policy-item · source: CSET · published: 2026-11-12 · link: https://cset.georgetown.edu/article/ai-kill-switches-what-policymakers-should-know/
digest: shown under AI Policy › News & commentary
text: Policymakers have recently proposed requiring “AI kill switches” to quickly stop an AI system or limit the impact of a harmful or unwanted AI incident. This piece describes different potential implementations of AI kill switches at each layer of the AI stack and offers key takeaways for policymakers. The post AI Kill Switches: What Policymakers Should Know appeared first on Center for Security and Emerging Technology .

===== 2026-11-13 · Data Engineering =====

### Snowpark Python Release

kind: release · source: snowflakedb/snowpark-python · published: 2026-11-12 · link: https://github.com/snowflakedb/snowpark-python/releases/tag/v1.57.0
digest: shown under Data Engineering › Snowflake › Snowpark Python
text: ## 1.57.0 (2026-11-12) ### Snowpark Python API Updates #### New Features - Added `Session.semantic_view()` (PuPr) to query a semantic view. Pass the semantic view name plus any of `dimensions`, `metrics`, `facts`, and `where`; it returns a `DataFrame`. - Added `Session.debug` (Experimental) to turn the debug features on and off per session, with `session.debug.set(...)` or `session.debug.enable_ ()` / `disable_ ()`. The features are: - `eager_schema_validation`: validates the schema of a DataFrame when it is created, so an invalid operation fails at the line that defines it. - `trace_sql_errors_to_dataframe`: maps a SQL compilation error to the Python lines of the DataFrame operations that generated the failing SQL. - `dataframe_trace_on_error`: adds the most recent DataFrame operations of a failed DataFrame to the error. `snowflake.snowpark.context.configure_development_features` is now a mirror of `Session.debug` that applies to every session. - Added support for the following functions in `functions.py`: - `try_to_boolean` - `try_to_date` - `try_to_decfloat` - `try_to_decimal` (with aliases `try_to_number` and `try_to_numeric`) - `try_to_double` - `try_to_time` - `try_to_timestamp` - `try_to_timestamp_ltz` - `try_to_timestamp_ntz` - `try_to_timestamp_tz` #### Improvements - The debug features of `Session.debug` (Experimental) and `snowflake.snowpark.context.configure_development_features` (Experimental) no longer depend on AST collection and no longer change the AST collection setting. - `DataFrameReader.documents()` (Private Preview) no longer takes the `parse_mode`, `row_boundary` and `extract_images` options. A read without a `schema` or `prompt` now always parses each file with `AI_PARSE_DOCUMENT` in `LAYOUT` mode and returns one row per file. - `snowflake.snowpark.context.configure_development_features` now changes only the features that are passed explicitly and keeps the others; calling it without arguments disables all of them. #### Bug Fixes - Fixed a bug that `Session.debug` (Experimental) report wrong debug information when imported through a symlinked path. - Fixed a bug where `trace_sql_errors_to_dataframe` of `Session.debug` (Experimental) reported a wrong Python source position when CTE optimization was enabled. - Fixed a bug where `trace_sql_errors_to_dataframe` of `Session.debug` (Experimental) reported extra Python source lines when the failing DataFrame operation wraps earlier operations in a subquery. - Fixed a bug that caused invalid identifier errors when `Session.reduce_describe_query_enabled` is turned on and `DataFrame.group_by` is used on a case-sensitive quoted column. - Fixed a bug where importing Snowpark failed if the `requests` package was not installed. Event table telemetry now treats `requests` as an optional dependency of the `opentelemetry` extra. - Fixed a bug where `DataFrameReader.documents()` reads with a schema failed on every file in accounts that return structured types in the native Arrow format (for example, with `ENABLE_STRUCTURED_TYPES_NATIVE_ARROW_FORMAT` set). - Fixed a bug where `DataFrameReader.documents()` reads with a schema failed on every file, instead of falling back to the next model, when `AI_COMPLETE` reported the first model as unavailable (`Model " " is unavailable`). - Fixed a bug where a UDF, UDTF or stored procedure with an imported module in `packages` failed with `TypeError` on a non-Anaconda artifact repository, such as PyPI. The module is now pinned to its local version, as `Session.add_packages` does. This also fixes `snowflake.snowpark.dataframe.map` with `vectorized=True` on such a repository when `packages` is not given. - Fixed a bug where `trace_sql_errors_to_dataframe` of `Session.debug` (Experimental) reported no Python source position for errors in a non-SELECT statement passed to `Session.sql()`. #### Dependency Updates - The `[pandas]` install extra now declares `pandas` and `pyarrow` directly instead of coupling them through `snowflake-connector-python[pandas]`. The version bounds are unchanged. ### Snowpark Local Testing Updates #### Bug Fixes - Fixed a bug where a column in local testing lost its name when it was copied or filtered. - Fixed a bug where arithmetic on columns with NULL values returned an extra row in local testing when it followed a `filter`. - Fixed a bug where `Column.isin` on a datetime column in local testing did not match any value when the subquery it was given also contained NULL or a value that cannot be parsed as a timestamp. - Fixed a bug where `dateadd` with the `year`, `quarter` or `month` part raised an error instead of returning NULL for a NULL date in local testing. - Fixed a bug where `Session.create_dataframe` raised `OverflowError` in local testing for a pandas DataFrame with a datetime column outside the nanosecond range (for example, year 3000). - Fixed a bug where `DataFrame.pivot` in local testing raised `TypeError` when an aggregated value came from `date_part` with the `week`, `weekiso` or `yearofweekiso` part and a pivot cell was empty. - Fixed a bug where `DataFrameReader.csv` in local testing accepted a string or a number for `SKIP_BLANK_LINES` and treated it as true. It now raises an error unless the value is `True` or `False`, as Snowflake does. - Fixed a bug where `DataFrameReader.csv` in local testing read strings such as `NA` and `null` as `NaN` in a column of a type it does not convert, such as `VariantType`. - Fixed a bug where `Column.try_cast` to `TimeType` failed instead of returning NULL for invalid input in local testing. - Fixed a bug where `Column.try_cast` to `DoubleType` returned NaN instead of NULL for invalid input in local testing.

### dbt Core dbt v1.12.7

kind: release · source: dbt-labs/dbt · published: 2026-11-12 · link: https://github.com/dbt-labs/dbt/releases/tag/v1.12.7
digest: shown under Data Engineering › Open-source stack › dbt Core
text: ## dbt-core 1.12.7 - November 12, 2026 ### Features - Extend RunResult with the state_decision_id attribute ### Fixes - Fall back to per-source freshness checks when batch metadata freshness computation fails, instead of skipping every selected source now that `skip_nodes_if_on_run_start_fails` defaults to True - Scope relation-cache population in `compile`/`show`/`docs generate` to the selected nodes' schemas so `--cache-selected-only` is honored (previously only `run` respected the flag) - Fix `statically_parse_unrendered_config` stringifying list/dict config values, which caused false positives in `state:modified` comparisons across different dbt versions. - Reword the snapshot timestamp data type mismatch warning to identify hard-delete timestamps as the affected columns and to recommend overriding the `snapshot_get_time` macro, instead of incorrectly suggesting a change to the snapshot's `updated_at` config (#fs-14450) - Recognize Databricks Python model config keys (`access_control_list`, `notebook_access_control_list`) in jsonschema validation so they no longer raise spurious `CustomKeyInConfigDeprecation` warnings (dbt-databricks#1661) (#N/A) - Add the `builtin_macros_prefer_overrides` behavior flag (default false). When enabled and the macro search package is itself internal (e.g. dbt or dbt_postgres, as for builtin macros run via `adapter.execute_macro`), the adapter override is preferred over the base dbt implementation and a root-project macro always wins. It is off by default because a root-project macro that shares a builtin's name can otherwise hijack calls made inside dbt's own macros. - Accept the dbt v2-only `info_schema`, `check-paths` and `checks` keys in dbt_project.yml, ignoring them with a note that they are specific to the dbt v2 engine - Ignore manifest nodes with resource types dbt-core doesn't support, such as dbt v2 checks, when loading a manifest for --state and --defer - Supply credentials for `dbt deps` git packages through a git credential helper instead of embedding them in the clone URL, so clones of redirecting repositories keep working with libcurl 7.81.0-1ubuntu1.30 and later - Recognize Databricks use_materialization_v2 config in JSON schema validation - Fix `dbt deps` failing with "could not read Username" when installing a git package from a `subdirectory` with credentials in the URL, by supplying credentials to the checkout's `git reset --hard` as well - Recognize supported dbt State configurations on snapshots and data tests during JSON schema validation (#N/A) ### Dependencies - Bump dbt-core-experimental-parser lowerbound to 2.0.11 ### Contributors - @HannanNaeem (#fs-14450) - @aagarg - @aahel - @ash2shukla - @claude - @dataders ( , #N/A) - @izeigerman - @ota2000 - @piotrbator2 - @sd-db (#N/A) - @tauhid621

### Dagster 1.13.30 (core) / 0.29.30 (libraries)

kind: release · source: dagster-io/dagster · published: 2026-11-12 · link: https://github.com/dagster-io/dagster/releases/tag/1.13.30
digest: shown under Data Engineering › Open-source stack › Dagster
text: ### New - Dropped support for Python 3.10. Dagster now requires Python 3.11 or later. - [ui] The asset catalog and asset graph no longer poll asset health data for assets whose health isn't shown, which reduces load when browsing large workspaces. - [dagster-cloud-cli] Added a `dagster-cloud deployment copy-materializations` command, which copies the latest asset materializations from one deployment to another and keeps their original timestamps. ### Bugfixes - [dagster-cloud-cli] Fixed Serverless fast deploys failing with `No module named ...` when the project's code is not installed as a package. ### Dagster Plus - Users with the "Edit concurrency limits" permission can now edit concurrency limits from the Concurrency settings page. - The Dagster+ MCP server now has tools to read schedules, sensors, and their ticks, to start and stop schedules and sensors, and to work with asset partitions, including adding and deleting dynamic partitions. - Serverless code locations that take more than 3 minutes to load no longer fail to deploy. - Serverless base images are no longer built for Python 3.10. Existing Python 3.10 PEX code locations keep running on the last Python 3.10 base image. - Fixed the "Send Sample Alert" button on the alert policy details page not sending Slack alerts. - Alert emails and Microsoft Teams alerts now escape customer-provided values such as job names and asset keys, so those values can no longer inject HTML.

### Great Expectations 1.25.0

kind: release · source: great-expectations/great_expectations · published: 2026-11-12 · link: https://github.com/great-expectations/great_expectations/releases/tag/1.25.0
digest: shown under Data Engineering › Open-source stack › Great Expectations
text: Compatibility: `zstandard` minimum 0.25.0 removed (extra `spark-connect`) #### Highlights - **Compare two columns in a row condition** — Row conditions can now compare two columns of the same row on pandas, Spark and SQL backends. `Column`'s comparison operators (`==`, `!=`, ` `, `>=`) build a column-to-column condition when the right-hand side is another `Column`; it joins AND/OR groups, saves and reloads with a suite, and renders in Data Docs as written. Rows with a null in either column are excluded under every operator, and `is_in`/`is_not_in` reject a `Column` with a message pointing to the comparison operators. - **SQL metrics and Expectations work with a row condition** — Distinct-values, median, quantile, value-counts, histogram, sample-values, regex-values, table head and column-pair Expectations and metrics no longer fail on SQL backends when a row condition is set. They previously emitted a SQLAlchemy 2.0 deprecation warning and raised an `ArgumentError` under SQLAlchemy 2.1. Results without a row condition are unchanged. - **Rows containing NULLs are counted as unexpected on SQL** — On SQL backends, `ExpectColumnPairValuesAToBeGreaterThanB`, `ExpectColumnPairValuesToBeInSet`, `ExpectMulticolumnSumToEqual` and `ExpectCompoundColumnsToBeUnique` now count rows with a NULL in a compared column as unexpected, matching pandas. `unexpected_index_query` for `ExpectMulticolumnSumToEqual` now returns those rows too. - **`spark-connect` extra installs alongside older zstandard pins** — The `zstandard>=0.25.0` floor is removed from the `spark-connect` extra, so `great-expectations[spark,spark-connect]` resolves under pins such as Apache Airflow 3.0.x constraints (pyspark 4.0.0 with zstandard 0.24.0). Users of `pyspark[connect]` 4.1+ still get zstandard 0.25.0 or newer through pyspark itself. #### Changes ##### Features - Row conditions can now compare two columns of the same row using `Column`'s comparison operators on pandas, Spark and SQL backends, with the comparison serialized in suites, rendered in Data Docs, and named in metric error messages. ##### Bug fixes - Median, quantile, value-counts, histogram, distinct-values, sample-values, regex-values, table head, column-pair and compound-columns-unique metrics now work on SQL backends when the Expectation or metric has a row condition, instead of emitting a SQLAlchemy 2.0 deprecation warning or failing under SQLAlchemy 2.1. - `ExpectColumnToExist` now honors `column_index=0`, so a column at a different position correctly fails instead of passing. - `ExpectColumnDistinctValuesToEqualSet`, `ExpectColumnDistinctValuesToContainSet` and `ExpectColumnDistinctValuesToBeInSet` now work on SQL backends when given a row condition, instead of warning on SQLAlchemy 2.0 and failing on 2.1. - `import great_expectations` no longer imports the deprecated `sre_constants` and `sre_parse` modules, so it succeeds on Python 3.15 and raises no deprecation warning on Python 3.11 through 3.14. - `ExpectTableColumnsToMatchSet(column_set=None)` now returns a failed result on SQL backends instead of raising `TypeError`, matching the pandas behavior. - On SQL backends, `ExpectColumnPairValuesAToBeGreaterThanB`, `ExpectColumnPairValuesToBeInSet`, `ExpectMulticolumnSumToEqual` and `ExpectCompoundColumnsToBeUnique` now count rows containing NULLs as unexpected, matching pandas, and `ExpectMulticolumnSumToEqual`'s `unexpected_index_query` returns those rows. - `ExpectColumnValuesToBeIncreasing` and `ExpectColumnValuesToBeDecreasing` on pandas no longer mis-evaluate unsigned or very large integer columns, where integer wraparound previously let a descending `uint8` column pass a strictly-increasing check. - `ExpectColumnQuantileValuesToBeBetween` now returns a plain `bool` for `success`, so printing the result, dumping it to JSON, and running it through a ValidationDefinition or Checkpoint no longer raise `TypeError: Object of type bool is not JSON serializable`. - `ExpectationSuite.delete_expectation` now deletes the suite's own matching Expectation on a saved suite (so deleting with an equivalent Expectation that has no id works), and leaves the suite exactly as it was if persisting the deletion fails. - On Spark, Expectations on a column whose name contains a dot now return a full result when `unexpected_index_column_names` is set, instead of an empty failing result; column-pair Expectations on such columns are fixed too. - The empty-string error raised by `Metric.config` now names the offending parameter instead of printing the literal `{param_name}` placeholder. - The `spark-connect` extra no longer pins a minimum `zstandard` version, so `great-expectations[spark,spark-connect]` installs alongside older zstandard pins such as those in Apache Airflow 3.0.x constraints. - `QueryExpectation` now recognizes a `{batch}` placeholder whatever punctuation surrounds it, so queries like `SELECT COUNT(*) FROM {batch};` and tab- or CRLF-formatted queries no longer warn that they are not parameterized for a data asset, while a `{batch}` that appears only inside a comment or string literal now does warn. - `ExpectColumnValuesToBeOfType` and `ExpectColumnValuesToBeInTypeList` on class-comparing SQL backends now resolve an uppercase SQL type name against SQLAlchemy's generic types when the dialect does not export it (so, for example, `type_="INTEGER"` passes on Oracle), raise a clear error naming the type and dialect for a name that resolves nowhere instead of reporting a silent mismatch, and no longer pass falsely on ClickHouse columns the driver reflects as `NullType`. Maintenance - Bumped the docs site's follow-redirects dependency from 1.16.1 to 1.16.2. - Bumped the docs site's joi dependency from 17.13.8 to 17.13.9. - Bumped the docs site's zod dependency from 4.3.5 to 4.6.7. - Bumped the docs site's git-diff dependency from 2.0.6 to 2.0.7. - Bumped the docs site's postcss-selector-parser dependency from 6.1.2 to 6.1.5, picking up its security fixes. […cut]

### Polars Nanook benchmarked against Databricks Photon

kind: community-post · source: Polars blog · published: 2026-11-12 · link: https://pola.rs/posts/polars-nanook-vs-databricks/
digest: shown under Data Engineering › Open-source stack › Polars
text: In this blog post we compare Polars Nanook against the Databricks Spark with Photon engine.

### dltHub brings data and meaning into ClickHouse

kind: community-post · source: dltHub blog · published: 2026-11-12 · link: https://dlthub.com/blog/dlthub-clickhouse-ontology-agents
digest: shown under Data Engineering › Open-source stack › dlt
text: Private Preview: dltHub writes your business definitions into ClickHouse table and column comments, so ClickHouse Agent gives trusted answers.

### dltHub on ClickHouse: the ClickHouse Agent walkthrough

kind: community-post · source: dltHub blog · published: 2026-11-10 · link: https://dlthub.com/blog/clickhouse-agent-ontology-walkthrough
digest: shown under Data Engineering › Open-source stack › dlt
text: Demo walkthrough: dltHub loads GitHub data, its definitions and an ontology into ClickHouse, so ClickHouse Agent answers how much CI is waste.

### Operational Ontology on Snowflake: From Business Meaning to Governed AI Action

kind: community-post · source: Snowflake on Medium · published: 2026-11-12 · link: https://medium.com/snowflake/operational-ontology-on-snowflake-from-business-meaning-to-governed-ai-action-6f3ef270d3f2
digest: shown under Data Engineering › News & discussion
text: A reference architecture for AI agents to reason over operational state, simulate decisions, execute governed actions, and verify real-world outcomes. From Enterprise Knowledge to Operational Decisions At 1:30 PM, packing station PB-04 goes offline in a distribution center. Orders begin accumulating, and a carrier scheduled to depart at 5:00 PM may leave before its shipments are ready. An AI agent connected to warehouse data can identify the failed station, trace affected orders, and explain the shipping risk. But the warehouse manager needs to decide what to do. Can qualified workers move to another station? Can orders be rerouted? Which recovery plan has the best chance of meeting the deadline without creating another bottleneck? Answering these questions requires current operational state, resource capabilities, business constraints, and a way to evaluate proposed changes. Acting on a decision also requires authorization and confirmation that the intended changes occurred. In the ea…

### Streamlit’s Floor, React’s Ceiling, Inside Snowflake

kind: community-post · source: Snowflake on Medium · published: 2026-11-12 · link: https://medium.com/snowflake/streamlits-floor-react-s-ceiling-inside-snowflake-c78f90e39dc8
digest: shown under Data Engineering › News & discussion
text: Keep the simplicity of Streamlit in Snowflake, and move the interactions that a rerun cannot do to the front end Picture a revenue review. An analyst opens the pipeline dashboard and points at EMEA on the regional bar chart. A tooltip appears. The other charts and the KPIs do not change. She wants more. She wants every chart and KPI to show the EMEA numbers while she points. Then she wants to drag across two quarters on the trend line and watch bookings and the commit share change during the drag. That is how she finds the quarter where the commit share fell. Without these interactions, she must click, wait for the rerun, read the result and click again, for every guess. I build many Streamlit in Snowflake (SiS) apps. I use SiS because it is the simplest way that I know to show data to people, not to mention that you can have an app up and running with a SINGLE PROMPT . I did not want to move my apps out of SiS. I wanted SiS to support these interactions. I call the result RiSiS (React…

### ABAC DENY policies support AI securables and attachment to individual objects (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#abac-deny-policies-support-ai-securables-and-attachment-to-individual-objects-beta
digest: shown under Data Engineering › Databricks · 🤖
text: Expanded FOR clause support: DENY policies can now apply to model services, model provider services, MCP services, agent services, and skills. Expanded ON clause support: DENY policies can now be attached directly on tables, volumes, functions, models, secrets, model services, model provider services, MCP services, agent services, and skills. See Supported securable types and privileges.

### Standalone pipelines on serverless general compute are now generally available

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#standalone-pipelines-on-serverless-general-compute-are-now-generally-available
digest: shown under Data Engineering › Databricks
text: Creating and refreshing standalone materialized views and streaming tables from a notebook on serverless general compute is now generally available. You can define them with SQL through spark.sql() or with the Python pipelines decorators. See Notebooks and Use Python with standalone pipelines.

### Partial schema inference for Python Lakeflow pipelines

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#partial-schema-inference-for-python-lakeflow-pipelines
digest: shown under Data Engineering › Databricks
text: In an upcoming release, Python Lakeflow pipelines will support partial schema inference in Beta. You will be able to use the override_schema argument of table, materialized_view, or create_streaming_table to declare only the columns whose type, constraint, or comment you want to control. The pipeline infers the remaining columns from the query output. See Develop pipeline code with Python.

### Budget alerts can now trigger webhooks (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#budget-alerts-can-now-trigger-webhooks-beta
digest: shown under Data Engineering › Databricks
text: You can now configure budgets to trigger webhooks when spend thresholds are exhausted, so budget events can be routed to incident, ticketing, or automation tools. See Trigger custom webhooks.

### AI Functions Asynchronous API (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-functions-asynchronous-api-beta
digest: shown under Data Engineering › Databricks · 🤖
text: You can now use the AI Functions Asynchronous API to run ai_parse_document, ai_extract, or ai_classify asynchronously on up to 50,000 requests from a JSONL file in a Unity Catalog volume. The batch writes one result for each request to a file in a volume. Workspace admins can turn on the AI Functions Asynchronous API preview from the Previews page. This feature is in Beta. See the Asynchronous API reference. For examples, see document parsing, information extraction, and classification.

### [In preview] Public Preview: SQL performance monitoring for Azure SQL Managed Instance

kind: vendor-note · source: Azure updates · published: 2026-11-12 · link: https://azure.microsoft.com/updates?id=574158
digest: shown under Data Engineering › Azure / Fabric & GCP
text: The public preview of Microsoft-managed performance monitoring for Azure SQL Managed Instance is now available. Customers monitoring business-critical SQL Managed Instance workloads often rely on custom scripts and disconnected monitoring tools. This requ

### Nov 13, 2026: Many-to-many relationships in semantic views (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-13 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-semantic-views-many-to-many-preview
digest: shown under Data Engineering › Snowflake
text: Many-to-many relationships are now in preview for semantic views. You can model a many-to-many relationship between two logical tables in either of the following ways:

### Nov 12, 2026: Snowflake Data Clean Rooms updates

kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcr
digest: shown under Data Engineering › Snowflake
text: Clean Rooms API Version: 19.4 The following updates are now available in Snowflake Data Clean Rooms: Save analysis results: You can now save the results of a SQL analysis template run to a table in the clean room, so you can query them later or compare results across runs without rerunning the analysis. To save results, add the save_mode and name fields to the analysis specification that you pass to RUN. Saved results are stored in the clean room and aren't visible to other collaborators. Learn more. Security scan rejection reasons in update requests: When a request to add or update a template with a code spec fails the automated security scan, VIEW_UPDATE_REQUESTS now shows the specific reason that the scan rejected the code spec. Use the reason to fix the code and resubmit the request. General performance improvements and bug fixes.

### Nov 11, 2026: Semantic view materializations (General availability)

kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-semantic-view-materializations-ga
digest: shown under Data Engineering › Snowflake
text: Semantic view materializations are now generally available and are no longer in Preview. With materializations, you can pre-aggregate frequently queried dimensions and metrics in a semantic view to improve query performance.

### Nov 10, 2026: INTEGRATIONS view in ACCOUNT_USAGE (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-account-usage-integrations-view-preview
digest: shown under Data Engineering › Snowflake
text: With this preview release, the ACCOUNTUSAGE schema includes a new INTEGRATIONS view that returns a row for each integration in your account. The view includes metadata for API, catalog, external access, notification, security, and storage integrations, such as the integration type, category, enabled

### November 10, 2026: Geospatial maps in Snowflake CoWork (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-10 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-10-cowork-maps-preview
digest: shown under Data Engineering › Snowflake · 🤖
text: Geospatial maps are now available in preview in Snowflake CoWork. When a question returns locations, regions, or density over geography, the agent can plot the result on an interactive map: latitude and longitude points, H3 hexagons, or GEOGRAPHY and GEOMETRY shapes. You can pan and zoom the map in

### You can track table-level data lineage in Knowledge Catalog for BigQuery pipelines (GA)

kind: vendor-note · source: BigQuery · published: 2026-11-12 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: You can track table-level data lineage in Knowledge Catalog for BigQuery pipelines. For more information, see Track data lineage. This feature is generally available (GA).

### BigQuery generative AI functions now support the gemini-4-hydrogen model

kind: vendor-note · source: BigQuery · published: 2026-11-12 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_12_2026
digest: shown under Data Engineering › Azure / Fabric & GCP · 🤖
text: BigQuery generative AI functions now support the gemini-4-hydrogen model. This model is generally available.

===== 2026-11-13 · Community stories =====

### Gemini 4 Hydrogen and Orchestrator

kind: story · source: Hacker News · published: 2026-11-12 · link: https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/ · discussion: https://news.ycombinator.com/item?id=50472260
digest: shown under AI Models & Labs › Spotted · 374 points, 101 comments
text: Today, we're rolling out Gemini 4 Hydrogen inside Google Antigravity alongside a new model dropdown option called Orchestrator, which pairs Hydrogen with

### Edge0-145B: Frontier AI Capabilities on Your Own Computer

kind: story · source: Hacker News · published: 2026-11-12 · link: https://edge0.ai/blog/introducing-edge0-145b-frontier-ai-capabilities-on-your-own-computer · discussion: https://news.ycombinator.com/item?id=50475713
digest: shown under AI Models & Labs › Spotted · 183 points, 44 comments
text: Meet Edge0-145B, an open-source 145B model for local coding, reasoning, and agent tasks, with no cloud-model token fees for local inference.

### Foundation Models framework

kind: story · source: Hacker News · published: 2026-11-12 · link: https://developer.apple.com/foundation-models-framework/ · discussion: https://news.ycombinator.com/item?id=50474361
digest: shown under AI Agents › Spotted · 181 points, 26 comments
text: The Foundation Models framework is a native Swift API for integrating any large language model into your app.

### I'm making LLMs work on small and old devices

kind: story · source: Hacker News · published: 2026-11-12 · link: https://github.com/hyperionaidev/smolmaxxing/ · discussion: https://news.ycombinator.com/item?id=50468888
digest: shown under AI Models & Labs › Spotted · 327 points, 120 comments
text: maxxing the ability to run different LLMs on the smallest devices possible

### Turning a 22-year-old Postgres type-confusion primitive into RCE

kind: story · source: Hacker News · published: 2026-11-12 · link: https://mehmetince.net/part-3-6-how-i-ended-up-turning-a-22-year-old-postgresql-type-confusion-primitive-into-rce-cve-2026-6460/ · discussion: https://news.ycombinator.com/item?id=50471761
digest: shown under Data Engineering › Spotted · 167 points, 30 comments
text: If you had told me in April 2026 one question “Mehmet, can we use managed PostgreSQL for this project?” would send me into the deepest rabbit hole of my life, I would have laughed. Months later, I finally found the bottom of that rabbit hole. It was a 22-year-old zero-day in PostgreSQL core. In this

### Anthropic IPO

kind: story · source: Hacker News · published: 2026-11-12 · link: https://ipo.anthropic.com/us/ · discussion: https://news.ycombinator.com/item?id=50465829
digest: shown under AI Models & Labs › Spotted · 887 points, 848 comments
text: Anthropic has filed to become a public company. Read the Founders’ letter and other relevant information.

### Gemini 4 Hydrogen

kind: story · source: Hacker News · published: 2026-11-12 · link: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/ · discussion: https://news.ycombinator.com/item?id=50471431
digest: shown under AI Models & Labs › Spotted · 505 points, 321 comments
text: Today, we’re introducing Gemini 4 Hydrogen, our daily driver for agentic workflows

### Chinese frontier AI models carry the fingerprint of export-controlled GPUs

kind: story · source: Hacker News · published: 2026-11-12 · link: https://unemploymentlabs.com/checkpoint-forensics · discussion: https://news.ycombinator.com/item?id=50474883
digest: shown under AI Models & Labs › Spotted · 246 points, 66 comments
text: Our forensic analysis of publicly released AI models finds evidence that DeepSeek, Moonshot AI, MiniMax and Ant Group have gained access to NVIDIA’s Blackwell GPUs, despite restrictions on exporting these chips to China, and are using that hardware to create their AI models.

### Anthropic carelessly killed a Claude Code feature users built on, no warning

kind: story · source: Hacker News · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/issues/109446 · discussion: https://news.ycombinator.com/item?id=50477704
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: Regression: 2.1.323 silently removed subagentStatusLine, with no reason, no replacement and no migration path What happened The 2.1.323 changelog says: Removed the subagentStatusLine setting: subag

### Show HN: AgentRun – open-source, Self-improving Managed Agents

kind: story · source: Hacker News · published: 2026-11-12 · link: https://github.com/Parcha-ai/agentrun/blob/main/README.md · discussion: https://news.ycombinator.com/item?id=50471650
digest: shown under AI Agents › Spotted · 90 points, 25 comments
text: AgentRun is an open-source platform that supercharges your agents. It adds self-improvement, durable execution and a control plane on top of your favorite agent harness. Your agents become smarter,

### PostgreSQL 18.7, 17.12, 16.16, 15.20, 14.25, and 19 RC 2 Released

kind: story · source: Hacker News · published: 2026-11-12 · link: https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/ · discussion: https://news.ycombinator.com/item?id=50467763
digest: shown under Data Engineering › Spotted · 104 points, 14 comments
text: The PostgreSQL Global Development Group has released an update to all supported versions of PostgreSQL, including 18.7, 17.12, 16.16, 15.20,

### Pi GPUI: A native GUI for the pi coding agent, built with Rust and GPUI.

kind: story · source: Hacker News · published: 2026-11-12 · link: https://pi-gpui.dev · discussion: https://news.ycombinator.com/item?id=50464872
digest: shown under AI Agents › Coding Agents & Assistants › Pi
text: A native GUI for your installed pi coding agent, built with Rust and GPUI for macOS and Linux.

### Tell HN: Cast('abc' AS INTEGER) returns 0 in SQLite

kind: story · source: Hacker News · published: 2026-11-12 · link: https://news.ycombinator.com/item?id=50468864 · discussion: https://news.ycombinator.com/item?id=50468864
digest: shown under Data Engineering › Spotted · 3 points, 5 comments
text: (the source gave no text)

### Durable Execution Agents

kind: story · source: Hacker News · published: 2026-11-12 · link: https://martinfowler.com/articles/durable-execution-agents.html · discussion: https://news.ycombinator.com/item?id=50462904
digest: shown under AI Agents › Spotted · 5 points, 0 comments
text: (the source gave no text)

### libreagi - save OS models

kind: story · source: Lobste.rs · published: 2026-11-12 · link: https://libreagi.com/ · discussion: https://lobste.rs/s/7c4iar/libreagi_save_os_models
digest: shown under AI Models & Labs › Spotted · 12 points, 6 comments
text: A private BitTorrent tracker where members keep copies of the open models most likely to disappear.

### MCP Is Dead Simple. And That's Exactly the Problem

kind: story · source: Dev.to · published: 2026-11-12 · link: https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811 · discussion: https://dev.to/sylwia-lask/mcp-is-dead-simple-and-thats-exactly-the-problem-5811
digest: shown under AI Agents › Spotted · 97 reactions, 61 comments
text: What exactly is MCP? Is it some mysterious technology that requires secret knowledge to implement?

### Your MCP Servers Are Silently Draining Your Context Window: The Hidden Cost of Tool-Heavy AI Agents

kind: story · source: Dev.to · published: 2026-11-12 · link: https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl · discussion: https://dev.to/necoz/your-mcp-servers-are-silently-draining-your-context-window-the-hidden-cost-of-tool-heavy-ai-agents-fkl
digest: shown under AI Agents › Spotted · 42 reactions, 16 comments
text: Why attaching dozens of Model Context Protocol (MCP) tools degrades LLM reasoning, inflates API bills, and how small, focused TypeScript micro-tools fix the problem.

===== 2026-11-14 · AI Agents =====

### Claude Code v2.1.325

kind: release · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/releases/tag/v2.1.325
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: ## What's changed - Fixed a security issue in how zstd-compressed responses are decoded - Added a spinner tip in VS Code and similar integrated terminals about re-running a notebook cell, shown once Claude has read or edited a Jupyter notebook - Added a line under the error shown when your organization's policy blocks a request, saying how to continue: run `/rewind` and change the message, or run `/clear` - Added a note for Claude when a sandboxed `git checkout`, `git stash` or autostash pull cannot update protected files such as those in `.claude` - Fixed `/security-review` and skills' inline git commands stopping with an error in worktrees of bare repositories, `--separate-git-dir` checkouts and Android `repo` checkouts - Fixed subagents with their own model being moved to the plan-mode model when the model setting is `opusplan` or `haiku` - Fixed subagents on a different model sizing file reads and MCP results with the main session's model - Fixed sessions on many third-party gateways and Foundry stopping with a context length error on every turn instead of compacting - Fixed recent turns sometimes going missing from a resumed session after Claude Code stopped without a clean exit - Fixed shell commands running in the launch directory after the working directory was deleted; the command now fails with a message and can be re-issued - Fixed an approved plan edit being lost when the `plansDirectory` folder can't take it: the plan is now saved in the default plans folder, and a warning says where and why - Fixed a saved `sonnet[1m]` model setting being rewritten on a new install to a model id the API rejects - Fixed focus view hiding the reply to your prompt when a scheduled task replied after it - Fixed the prompt sometimes missing from a background subagent's view when fullscreen is off - Fixed long options in lists and permission prompts being partly overwritten when they wrap, and first-run screens losing lines on narrow terminals - Fixed startup warnings about permission rules and the "N MCP servers need authentication" notice being recorded as seen when they were scrolled out of view - Fixed the welcome header showing control characters or splitting across lines when an agent's name or the working folder contains them or a line break - Fixed the red error shown when Claude tries a command only you can run: a dim line now says it runs only when you type it at the prompt - Fixed `/stats` showing an Active days total that was one day too high - Fixed `/insights` saying a report was ready when no session qualified for analysis, and writing two values into its HTML report without escaping them - Fixed `/voice` saying voice mode changed when managed settings, `--settings`, or the project's `.claude/settings.json` or `.claude/settings.local.json` kept it as it was; it now says what holds it - Fixed the IDE welcome dialog showing Cmd+Esc for Quick Launch on Windows and Linux - Fixed Slack app tips showing when your organization's policy denies cloud sessions - Fixed `claude purge` hanging silently when there is no terminal to read keys from, and its project picker and `-i` prompts ignoring the keyboard when stdin is piped - Fixed `claude plugin eval --output-dir ''` writing the report into the current folder; it now exits with an error - Fixed `claude -p` text output on a terminal passing control sequences other than text styling; pipes and files are unchanged - Fixed leftover `.oauth_refresh.lock.owner.tmp.*` files piling up in the config directory - Fixed `/fast` saying "Fast mode has been disabled by your organization" under the keyless Console sign-in, where Claude Code had not asked the server - Fixed `/model` saying that your organization restricts a model when Claude Code could not check that, for example with no network - Fixed "Sign in with your Console account" in `/login` replacing your existing login when you pressed Esc right after the browser step - Fixed the browser showing the sign-in success page in some cases where sign-in failed or was canceled - Fixed `claude auth status` and other short commands leaving a lock behind on a Console profile, which made the next session hang for about a minute - Fixed background sessions started on your claude.ai login using (and billing) an API key or token from the shell that started the background service - Fixed more cases of a session moving to another sign-in in the background; these moves are now refused, with a message saying what works - Fixed a second Enter in the exit dialog stopping background work after the move to the background was refused - Fixed token counting on Amazon Bedrock sending the conversation to Bedrock when the `allowedProviders` managed setting does not allow it - Fixed AWS `credential_process` helpers and Google Cloud default credentials failing when Claude Code is started without a `HOME` environment variable - Fixed a session sometimes going back to an earlier permission mode after a subagent's plan was approved - Fixed one invalid value in an Agent SDK `applyFlagSettings()` call silently discarding all settings from earlier calls; a call that would do this is now refused with an error - Fixed sessions showing as waiting for input when a finished pull request only needed your own review or merge - Fixed an unrecognized `teammateMode` settings value being ignored without a warning: `claude -p`, the startup warning and `claude doctor` now list it as a skipped entry (still not applied) - Fixed `--worktree` skipping a `WorktreeCreate` hook from a plugin in `CLAUDE_CODE_PLUGIN_SEED_DIR` on the first run in a new home directory - Fixed brief-mode sessions, such as Dispatch, sending a reply again after the turn had already replied - Fixed Claude saying a working Atlassian, Asana or Sentry connector had failed in cloud sessions when a plugin listed it at a different URL […cut]

### [BUG] Claude down?

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-13 · link: https://github.com/anthropics/claude-code/issues/109508
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · 7 comments, 7 👍; +14 in the last 24h
text: ### Preflight Checklist ### What's Wrong? Please run /login · API Error: 403 Attention Required! | Cloudflare I opened my claude.ai and settings but my user info is not loading ### What Should Happen? should be able to login ### Error Messages/Logs ### Steps to Reproduce Please run /login · API Error: 403 Attention Required! | Cloudflare I opened my claude.ai and settings but my user info is not loading ### Claude Model None ### Is this a regression? Yes, this worked in a previous version ### Last Working Version ### Claude Code Version latest ### Platform Anthropic API ### Operating System macOS ### Terminal/Shell Terminal.app (macOS) ### Additional Information

### [BUG] Claude in Chrome: new Claude Code sessions get 'Browser extension is not connected' while already-running sessions see the browsers (macOS, since 2026-11-07)

kind: hot-issue · source: anthropics/claude-code · published: 2026-11-09 · link: https://github.com/anthropics/claude-code/issues/108679
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code · regression; 5 comments, 3 👍; +3 since 2026-11-12
text: ## What happens Since about 2026-11-07 21:10 UTC, newly started Claude Code sessions on my Mac get this on their first claude-in-chrome call: > Browser extension is not connected. Please ensure the Claude browser extension is installed and running… `list_connected_browsers` returns the same message. During the same minute, a Claude Code session that was already running lists the browsers and drives tabs normally. Retrying inside the new session does not help. Neither do waiting, restarting Chrome, or switching the native host. A running session that has lost the browser comes back only when a browser reconnects to the bridge (its `connectedAt` changes), for example after I open the Claude side panel in Chrome. ## Environment - macOS. Claude Code 2.1.319 and 2.1.321 (both affected; 2.1.319 worked fine until Nov 7). - Claude in Chrome 1.0.105 (installed Nov 4, unchanged), Chrome 156.0.8078.80 (updated Nov 3, unchanged). - One Chrome profile with the extension, signed in to the same claude.ai account and org as Claude Code. A second Mac's Chrome is signed in to the same account. - `~/.claude.json` has `chromeExtension.pairedDeviceId` set to the local Chrome. - Many Claude Code sessions run on this machine (automated runner panes plus interactive ones). ## Measurements From local Claude Code transcripts (`~/.claude/projects/**/*.jsonl`): - Nov 4 to Nov 7 21:10 UTC: about 50 sessions used claude-in-chrome, with 0 "not connected" errors. - From Nov 7 21:10 UTC to Nov 9: in 47 of 51 sessions the first claude-in-chrome call failed. Each of the 4 that worked started 2 to 16 minutes after the local browser's `connectedAt` changed. Side-by-side reproductions on 2026-11-09 (UTC): | Time | Fresh process (`claude -p --chrome`) | Session already running | |---|---|---| | 20:31, 20:34 | not connected (also on a second call after 45 s) | lists 2 browsers, `tabs_context_mcp` works | | 21:50 | not connected | lists 2 browsers | | 22:05, 22:27, 22:46 (after Chrome restarts) | not connected | lists only the second Mac's browser; local Chrome never reappears on the bridge | | 22:59 | not connected | lists only the second Mac's browser | At 20:07 a fresh session got "not connected" even though the second Mac's browser had been connected since 19:40. So a new process seems to start with an empty roster, not just a missing local browser. The native host does not matter. Before 22:59 Chrome always launched the Claude Desktop host (`/Applications/Claude.app/Contents/Helpers/chrome-native-host`). That was true even with Desktop quit, because its manifest `com.anthropic.claude_browser_extension.json` was present. For the 22:59 run I renamed that manifest and restarted Chrome. Chrome then launched `claude --chrome-native-host` and its socket appeared under `/tmp/claude-mcp-browser-bridge-$USER/`, but the result was unchanged. ## Expected A newly started session sees the browsers that are connected to the bridge for this account, as it did before Nov 7. ## Possibly related #10... […cut]

### OpenAI Codex 0.169.0

kind: release · source: openai/codex · published: 2026-11-13 · link: https://github.com/openai/codex/releases/tag/rust-v0.169.0
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex
text: ## New Features - The opt-in terminal workspace supports multiple side-chat tabs. Switch between them with the keyboard or mouse, and reopen saved local side chats after restarting Codex. - Search older tasks from the agent command center by name, prompt preview, or working directory. - Turn on **Collapse turn details** in the full-screen transcript to fold completed activity beneath each prompt while keeping answers visible and tool output searchable. - Add or edit custom model providers from the terminal. With custom gateway onboarding enabled, you can create a provider during sign-in and use a device code for supported gateways over SSH or without a local browser. - Press `Ctrl+S` in the terminal report editor to save a diagnostic ZIP locally, even when uploads are disabled. - With the opt-in Cloud connection on macOS and Linux, send images, choose a model and reasoning effort, and archive or restore Cloud conversations from the terminal. ## Bug Fixes - `codex exec` keeps project configuration and MCP servers disabled in untrusted directories, even with `--sandbox workspace-write`. Use `--trust` with `codex exec` or `codex review` to explicitly save project trust. - **Yes, clear context and implement** now hands the full approved plan to the fresh session and keeps the current session open if the handoff fails. - Fixed Windows sandbox handling for quoted `cmd.exe` paths and for PowerShell sessions whose working directory has an unreadable parent. - Pasted images on macOS retain their intended orientation and use native PNG or JPEG clipboard data when available. - The terminal no longer stays busy waiting for MCP servers that a shared app server did not report. - Interrupted turns now close cleanly, and delayed aborts or file approval cancellations no longer interrupt a later turn. ## Documentation - Updated the `openai-docs` skill to focus on Codex and ChatGPT Work questions and first-time API setup, with dedicated guidance for configuring Codex across a team. - Documented how app-server clients can list models or authorize a gateway for a configured provider without changing the default provider. ## Chores - Updated bundled SQLite to 3.54 to pick up write-ahead log fixes. - Plugin marketplace upgrades can reuse Git objects already on disk, reducing repeat downloads. ## Changelog Full Changelog: - #59739 Add a sidebar chooser and floating workspace shortcut panels @fcoury-oai - #59743 Forward explicit cyber access programs with header authentication @jamy-OAI - #59745 Repair legacy Windows sandbox bin permissions for SYSTEM @zm-oai - #59746 Add typed Cloud user-message submission receipts @bc-openai - #59749 Use runtime authentication for OpenAI MCP and app requests @cooper-oai - #59750 Stop Noise relay recovery on rejected executor credentials @richardopenai - #59752 Configure the Opus Bazel patch and isolate auth tests @bkotsopoulos - #59754 Enforce host-required cyber access programs per thread @jamy-OAI - #59759 Update WebSocket dependency forks @charliemarsh-oai - #59767 Add sidebar tabs and nonblocking side-chat creation @fcoury-oai - #59768 Stop prefetching plugin discovery at app-server startup @zamoshchin-openai - #59769 Reuse decoded WebSocket event kinds in telemetry @charliemarsh-oai - #59770 Add shared service-tier support for host-owned agents @rhan-oai - #59772 Remove the legacy sandbox policy constructor @ioanbudea-OAI - #59774 Remove the legacy Seatbelt command wrapper @ioanbudea-OAI - #59776 Allow selecting a configured provider in `model/list` @abhinav-oai - #59778 Expose acceptance metadata and code-cell links in rollout traces @tz-openai - #59779 Add provider configuration editing to the TUI @alexsong-oai - #59780 Enable safe identical code folding for x86-64 musl releases @dkovalenko-oai - #59783 Tie gRPC code-mode connection lifetime to live sessions @frantic-openai - #59784 Support multiple side chats in the TUI sidebar @fcoury-oai - #59785 Decouple message lifecycle state from model-visible item IDs @euroelessar - #59787 Support credential export commands for gateway authentication @alexsong-oai - #59789 Render delegated thread messages as Markdown in the TUI @bc-openai - #59792 Centralize managed proxy preparation and sandbox routing @viyatb-oai - #59793 Support update-boundary paging across forked thread histories @owenlin0 - #59794 Check extension budgets before model generation requests @rhan-oai - #59795 Support optional thread IDs in hosted file uploads @lt-oai - #59805 Pack relative relocations in x86-64 musl release builds @dkovalenko-oai - #59816 Retry gateway credential exports after unauthorized responses @alexsong-oai - #59817 Handle TUI message submission receipts and preserve uncertain drafts @bc-openai - #59819 Allow provider selection for gateway OAuth reads and logins @abhinav-oai - #59822 Add device-code authorization for gateway OAuth @smurching-oai - #59823 Bind runtime auth to the provider's selected credential source @cooper-oai - #59824 Enable resizing the sidebar chooser @fcoury-oai - #59826 Preserve client metadata through queued submissions @eddie-openai - #59828 Add a gated Cloud backend to the TUI @bc-openai - #59832 Add opt-in incremental tools for regular OpenAI Responses @akira-oai - #59842 Carry targeted moderation decisions on final-answer messages @psachdeva-oai - #59887 Remove incomplete prereleases after asset upload failures @jif-oai - #59891 Bound REPL provenance costs in elastic context preparation @jif-oai - #59893 Recompute the approval reviewer when switching models @jif-oai - #59902 Keep verified question/answer records whole under elastic budgets @jif-oai - #59903 Delete incomplete prereleases by release ID @jif-oai - #59905 Validate implicit API keys for Guardian Decisions @jif-oai - #59908 Avoid full image decoding for original-detail context estimates @jif-oai - #59910 Scope file change approval cancellation to the requesting turn @jif-oai […cut]

### Feature request: make ChatGPT + Work + Codex a continuous engineering workspace, not disposable tasks

kind: hot-issue · source: openai/codex · published: 2026-11-13 · link: https://github.com/openai/codex/issues/61348
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex · 14 comments, 0 👍; +13 in the last 24h
text: **Provenance and review:** Compiled and reviewed by ChatGPT from user-provided conversations and complaint summaries. ChatGPT checked the presentation against the materials available in these exchanges; this is **not independent verification of every original chat, local file, tool log, or test result**. Unverified details remain reported claims. ## TL;DR **I don't need another AI model, another /goal, another temporary agent, or another workaround to maintain. I need to open ChatGPT, talk through an engineering problem, send the resulting task and evidence to my _existing_ agent on my own computer through Work/Codex, and return to the same work tomorrow.** The real unit of work should be a **long-lived engineering project with durable, verifiable experience**, not an isolated chat, task, or model invocation. This is a cross-product **UX/product-design request**, not a claim that Work chats cannot be reopened or that Codex has no session-resume functionality. Those partial capabilities exist. The end-to-end experience described below is what is missing. ## Why this needs to be treated as a serious product problem **This is not a hypothetical feature request. It is time already lost in real engineering work.** The current workflow effectively taxes a project owner every time work crosses a product, device, context window, or agent session. The tax is paid in repeated explanations, re-checking decisions, reconstructing how tools were used, and resolving contradictions between confident model answers and original records. I'm not looking for an AI that can finish a demo in five minutes. I need AI assistance on projects that remain alive **after a feature ships, a CAD model works, a website goes live, or a spreadsheet has been read**. Engineering is iterative. New parts, failures, customer requirements, firmware versions, materials, and evidence arrive continuously. **A task can be completed; the underlying engineering responsibility does not have a final `/goal` that makes it disappear.** A user should not become the persistence layer, message bus, knowledge retriever, and quality-control system for multiple OpenAI products. Yet that is precisely what the current fragmented experience requires. ## The crucial detail: I am not a programmer **I am an ordinary engineer, not a professional software developer.** My core work is physical engineering and additive manufacturing: machines, mechanisms, production processes, materials, CAD/CAM, troubleshooting, and turning technical ideas into working systems. **AI is precisely what enabled me to expand that work into substantial software and automation projects.** I can formulate engineering problems, establish constraints, examine evidence, test results against real equipment, and decide what is acceptable. I also work with repositories, tools, and code produced during those projects. But I should not need to become a full-time software developer, prompt engineer, AI infrastructure maintainer, or manual sess... […cut]

### OpenCode v2.3.0

kind: release · source: anomalyco/opencode · published: 2026-11-13 · link: https://github.com/anomalyco/opencode/releases/tag/v2.3.0
digest: shown under AI Agents › Coding Agents & Assistants › OpenCode
text: ### Highlights - **Background Subagents by Default**: Subagents now return immediately, continue in the background, and report back whenever they become idle. You can keep working in the parent session while multiple subagents run concurrently. - **Quieter Transcripts by Default**: The TUI now summarizes each run of tool calls and thoughts into one collapsible activity row, so the answer is easier to follow. To see every step again, set **Verbosity** to `medium` or `high` in settings, or set `session.verbosity` in your TUI config; an existing setting is kept. - **Jump to an Earlier Prompt**: In the desktop app, open **Jump to message** from the command palette or press `Cmd+Alt+G` (`Ctrl+Alt+G` on Windows and Linux) to search prompts across the current session and jump directly to one. ### Core #### Improvements - Subagents now always run in the background, return their session ID immediately, and report results to their parent whenever they become idle. - Added experimental support for MCP events, behind the `mcp_events` flag. - Shell commands now survive server handoffs and keep their output when interrupted. - Added experimental support for moving a shell command to the background when its timeout expires, behind the `shell_timeout_background` flag. With the flag on, an explicit timeout on a background command stops it. - Local Windows shell commands now run through the process daemon. - Added support for freeform tool input on compatible models. - Added LM Studio decision-model support. - Agents are now told when their session is a fork. Thanks @hasta84. - Tool output truncation now keeps the beginning of the output and preserves a usable preview if the full output cannot be saved. - Tail reads no longer load the entire file into memory. - Providers can present a client certificate for gateways that require mutual TLS. Set `settings.tls` with `cert`, `key` and an optional `passphrase` on the provider; values accept `{file:}` and `{env:}` like `apiKey`. - When a subagent goes idle while its own background work is still running, its report to the parent now says it is still running, so the parent waits for the final report instead of treating the partial answer as done. - Code Mode gets simpler structured results from file and skill tools: `write` and `edit` return their confirmation as a string, `patch` returns an empty result, and `skill` returns the skill's directory and content. #### Bug fixes - Fixed case-only file renames in patches on case-insensitive filesystems. - Fixed stale thinking being retained after Claude Agent prompts or tools change. - Fixed directly driven child sessions not resuming after a restart. - Fixed plugin replacement stopping when cleanup of an earlier plugin fails. - Fixed MCP OAuth refreshes and localhost redirects when a server rewrites `127.0.0.1`. - Fixed saved API keys being omitted from local-model discovery. - Local model discovery (Ollama, LM Studio, vLLM) waits up to 15 seconds per request instead of 1, so remote or tunnelled endpoints list their models, and a slow endpoint no longer delays other endpoints or config reloads. - In Code Mode, calling a namespace as if it were a tool now suggests up to three real tools under it. - Fixed retryable provider streams losing completed work when interrupted. - Fixed GitHub Copilot requests using the wrong endpoint before models finish loading. - Fixed exhausted request rate limits being treated as terminal. Thanks @Kyle-j-bush. - Fixed LM Studio models with a null context length and accepted decision-type models. Thanks @tomzhu1024. ### TUI #### Improvements - Transcript verbosity now defaults to `low`, which summarizes each run of tools and thoughts into one activity row. A `session.verbosity` you already set is kept. - Session IDs found in messages can now be opened directly. - Activity tabs are clickable and open the correct view. - Shell mode has its own prompt color under the new designs. #### Bug fixes - Restored pasted text when undo brings back its placeholder. - Restored the live draft after browsing prompt history. - Fixed copying a paste from within the prompt selection. - Preserved the Mini composer caret when closing the command palette. - Prevented image bytes from being retained in transcript storage when image previews are disabled. - Fixed paste-chip contrast across light and dark themes. - Fixed plugin-provided themes updating live. - Session lists now open at the top rather than at the current session. - Mini scrollback now shows the subagent card instead of obsolete launch instructions. ### Desktop #### Improvements - Added **Jump to message** to the command palette with `Cmd+Alt+G` / `Ctrl+Alt+G`, including prompts not yet loaded in the timeline. Thanks @usrnk1. - Added the experimental **Recent** sessions sidebar, with cross-server recency, local pins, reordering, and standard session-row actions. - Recent sessions are limited to the last seven days and 30 rows, and can be hidden or muted. - Added an experimental customizable sessions sidebar. - Mermaid diagrams can now be maximized for zooming and panning. - Added `Alt+Enter` to place a follow-up first in the queue and `Mod+Enter` to steer the next queued prompt. - Holding the modifier key now shows tab shortcut numbers. - Each server’s terminal shell can be selected from its menu. - Added a free-limit panel in place of the composer when applicable. - Session IDs are easier to find and copy. #### Bug fixes - Recent sessions now keep stable recency ordering through list reloads, renames, and completed runs. - Fixed browser panes not retrying after server plugins finish loading. - Fixed mention suggestions being recreated while typing. - Fixed SSH prompts failing to advance or close after connection. - Fixed pasted provider-auth redirect URLs being rejected. - Restored message footers in the New timeline. - Fixed links whose labels contain inline code. - Fixed the desktop main process freezing while probing the login-shell environment. […cut]

### DeepSeek Harness v0.2.2-rc.3

kind: release · source: deepseek-ai/deepseek-harness · published: 2026-11-13 · link: https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.3
digest: shown under AI Agents › Coding Agents & Assistants › DeepSeek Harness
text: | 新增功能 - 新增实验性「DeepSeek 会话导入」插件，支持将 DeepSeek App 或网页版的历史会话导入工作区，并继续对话。 @imccyu ### 问题修复 - 修复 Windows 桌面版应用内更新可能失败、无法自动重新打开的问题。 @winewill New Features - Add an experimental DeepSeek chat import plugin to import past conversations from DeepSeek App or its web version into a workspace and continue chatting. ### Bug Fixes - Fix an issue that could cause Windows desktop in-app updates to fail and prevent the app from reopening automatically. Full Changelog:

### [Security] Terminal environment snapshots capture credential-bearing env vars to disk

kind: hot-issue · source: nousresearch/hermes-agent · published: 2026-07-10 · link: https://github.com/NousResearch/hermes-agent/issues/62336
digest: shown under AI Agents › Coding Agents & Assistants › Hermes Agent · type/security; 19 comments, 0 👍; +3 in the last 24h
text: ## Summary The terminal environment snapshot mechanism in `tools/environments/base.py` captures **all** environment variables to disk via `export -p`, including sensitive credentials injected by `bws run --` and Bitwarden Secrets Manager at startup. These snapshots persist at `cache/terminal/hermes-snap-*.sh` and contain plaintext credential values. ## Root Cause In `tools/environments/base.py`, two locations call `export -p` to dump the full environment into snapshot files: 1. **`init_session()` (line 399):** Session bootstrap captures initial environment 2. **`_wrap_command()` (line 516):** After each command, re-dumps environment Both use unfiltered `export -p`, which writes every `declare -x` line — including secrets managed by BSM, `bws run --`, and auth pool env vars — to persistent disk files. ## Impact - Credentials survive sessions (files persist in `cache/terminal/`) - Any process/user with filesystem read access to the Hermes home directory can read them - The model can read them via `read_file` / `search_files` tool calls - Created ~2 MB of credential-bearing data across 21 snapshot files before detection ## Proposed Mitigation Filter credential-bearing env vars from `export -p` output before writing to the snapshot file. A `grep -vE` pipe excluding known credential prefixes prevents secrets from being persisted while preserving the snapshot mechanism for legitimate env vars: The credential prefixes should be configurable rather than hardcoded. ## Long-term Fix A credential broker architecture that delivers secrets via pipes/file descriptors instead of environment variables would eliminate this class of vulnerability entirely. Environment variables are fundamentally incompatible with a system that captures and persists environment state. ## Affected Version Observed on Hermes Agent as of July 2026. The `export -p` mechanism has been present since the snapshot feature was introduced. ## Severity **High** — Credentials persist on disk in plaintext. Combined with the agent's ability to read arbitrary files, this creates a direct path for credential exposure to the model context.

===== 2026-11-14 · AI Models & Labs =====

### Building strong safety evaluations

kind: lab-post · source: anthropic · published: 2026-11-13 · link: https://www.anthropic.com/research/building-strong-safety-evaluations
digest: shown under AI Models & Labs › Lab announcements
text: 01 Safety first Building strong safety evaluations 01 Safety first 02 Design 03 Run 04 Report 05 Where to start Published Nov 13, 2026 Team Engineering Safety evaluations inform some of the most consequential decisions we make about an AI model, including whether it’s ready to deploy, which safeguards ship alongside it, and what our next round of safety training and research should focus on. When we say a model is “safer than its predecessor,” we mean that it scored better on a set of evals someone built. But a safety claim is only as sound as the eval behind it, and good ones are hard to build. A safety eval measures a model’s propensity to cause or contribute to harm, whether its response to a request makes harm more or less likely, and how severe that harm would be, rather than measuring specific capabilities. It can cover different types of harm. For example, a user may actively request harmful outputs (such as seeking instructions on how to harm themselves), or they may request outputs that are intended to be harmless, but that come with high risk of unintended harm (such as seeking information on the appropriate dose of a drug). Essentially, a safety eval asks, “Given a specific input, did the model do the right thing?” Like other types of evals, these can be tricky to get right: researchers have repeatedly found that AI evals are easy to game , don’t always measure what they claim to measure, and aren’t documented well enough to reproduce . The results can change depen […cut]

### Introducing Chatgpt Wallet

kind: lab-post · source: openai · published: 2026-11-13 · link: https://openai.com/index/introducing-chatgpt-wallet/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### inclusionAI: Ling 3.2 Flash (free)

kind: model · source: OpenRouter · published: 2026-11-13 · link: https://openrouter.ai/inclusionai/ling-3.2-flash:free
digest: shown under AI Models & Labs › New on OpenRouter
text: Ling 3.2 Flash is a hybrid reasoning model from inclusionAI that accepts text and image input, with a 1M-token context window and up to 200 images per request. Thinking can...

===== 2026-11-14 · Data Engineering =====

### Apache Airflow Apache Airflow TypeScript SDK 1.0.0

kind: release · source: apache/airflow · published: 2026-11-13 · link: https://github.com/apache/airflow/releases/tag/ts-sdk/1.0.0
digest: shown under Data Engineering › Open-source stack › Apache Airflow
text: First stable release of the Apache Airflow TypeScript SDK. Changes since 1.0.0-beta2: - A task that passes `queue` as `undefined` now inherits the Dag's queue. - The build no longer uses a machine-global pnpm config that created stray `.pnpm-store` directories. Published on npm as `@apache-airflow/ts-sdk@1.0.0`.

### Apache Airflow Apache Airflow Java SDK 1.0.0

kind: release · source: apache/airflow · published: 2026-11-13 · link: https://github.com/apache/airflow/releases/tag/java-sdk/1.0.0
digest: shown under Data Engineering › Open-source stack › Apache Airflow
text: First stable release of the Apache Airflow Java SDK. Changes since 1.0.0-beta1: - Native Java Dag authoring, serialized to DagSerialization v3: task dependencies, task groups, branching and conditions, edge labels - Triggering other Dags - Task state store and Variable APIs - Many fixes and hardening improvements Maven artifacts are published under group id `org.apache.airflow`; import `airflow-sdk-bom:1.0.0` to keep module versions aligned.

### Apache Airflow Apache Airflow Go SDK 1.0.0

kind: release · source: apache/airflow · published: 2026-11-13 · link: https://github.com/apache/airflow/releases/tag/go-sdk/v1.0.0
digest: shown under Data Engineering › Open-source stack › Apache Airflow
text: First stable release of the Apache Airflow Go SDK. Changes since 1.0.0-beta4: - Fix the Go SDK build on 32-bit targets. - Fix the install command breaking the first bundle build. - Log attributes no longer displace standard log fields. - `ti_run` now loads the serialized Dag only for stub tasks. Install with: API reference:

### AI Function task support in Declarative Automation Bundles (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-13 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#ai-function-task-support-in-declarative-automation-bundles-beta
digest: shown under Data Engineering › Databricks
text: Support for AI Function tasks in Declarative Automation Bundles is now in Beta. See AI Function task.

### OneLake external locations support file events (Public Preview)

kind: vendor-note · source: Azure Databricks · published: 2026-11-13 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#onelake-external-locations-support-file-events-public-preview
digest: shown under Data Engineering › Databricks
text: You can now enable file events on OneLake external locations through a Fabric eventstream. Azure Databricks can create the eventstream for you, or you can provide your own. See Set up file events.

### Importing Power BI and Tableau files with Genie Code will soon be available by default for workspaces with the compliance security profile enabled

kind: vendor-note · source: Azure Databricks · published: 2026-11-13 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#importing-power-bi-and-tableau-files-with-genie-code-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled
digest: shown under Data Engineering › Databricks · 🤖
text: You can use Genie Code to import Power BI and Tableau files as AI/BI dashboards and metric views. Starting on or after December 15, 2026, this will be available by default for workspaces with the compliance security profile enabled. Until then, a workspace admin can turn it on from Previews in the workspace settings. Importing requires partner-powered AI features for the account and workspace. See Import BI files using Genie Code.

### Artifacts and slides in Genie One (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#artifacts-and-slides-in-genie-one-beta
digest: shown under Data Engineering › Databricks
text: Artifacts are slide decks and other custom visual pages that Genie One builds from your data and saves to your workspace. Ask Genie for an artifact in chat, edit it yourself or ask for changes, then present it and share it with others. Anyone who views an artifact can use Ask Genie to ask questions about the data behind a chart or number. An artifact stores a snapshot of its data, so anyone who can view it sees that data, even without access to the source tables. This feature is in Beta. A workspace admin turns on the Artifacts preview from the Previews page. See Artifacts in Genie One and Slides in Genie One.

### Connectors section in Genie Agent settings (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#connectors-section-in-genie-agent-settings-beta
digest: shown under Data Engineering › Databricks
text: The Configure settings for a Genie Agent now have a dedicated section for adding connectors. This feature is in Beta. See Add connectors to a Genie Agent.

### Dashboard enhancements and bug fixes

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#dashboard-enhancements-and-bug-fixes
digest: shown under Data Engineering › Databricks · 🤖
text: Custom calculations with Genie Code: Genie Code can now write custom calculations that reference other custom calculations in the same dataset. See Referencing other calculations. Sort pivot tables: Viewers can now sort pivot tables by row and column. See Table and pivot table visualizations. Pivot table header styles: Authors can now style pivot table headers separately for each row, column, and value field. See Style pivot table headers. Pivot table text wrapping: Pivot table values can now adjust their height to wrap text. Pivot table divider: Authors can now resize the divider between columns and values in a pivot table. Associative filtering: Authors can now turn off associative filtering between dashboard filters. See Configure filter application behavior. Undo and redo for dashboard variables: Actions on dashboard variables now support undo and redo. See Use dashboard variables. Ask Genie on supported widgets: Ask Genie now appears only on widgets that Genie can use…

### Scheduled tasks can email other users in Genie One

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#scheduled-tasks-can-email-other-users-in-genie-one
digest: shown under Data Engineering › Databricks
text: Scheduled tasks in Genie One can now send emails to other users in your organization, not just to you. See Scheduled tasks.

### Flows are securable objects in Unity Catalog (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#flows-are-securable-objects-in-unity-catalog-beta
digest: shown under Data Engineering › Databricks
text: Pipeline flows are now securable objects in Unity Catalog. You can grant READ FLOW, REFRESH FLOW, WRITE FLOW, APPLY TAG, and MANAGE on individual flows, and CREATE FLOW on schemas. To participate in the Beta, contact your Databricks account team. See Flows in Unity Catalog.

### Gemini 3.6 Flash will be retired on November 19, 2026

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · ends: 2026-11-19 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#gemini-36-flash-will-be-retired-on-november-19-2026
digest: shown under Data Engineering › Action required
text: Google Gemini 3.6 Flash will be retired on November 19, 2026. Starting on that date, API calls to Gemini 3.6 Flash will be automatically redirected to Gemini 3.8 Flash at the same price. Gemini 3.8 Flash is the recommended replacement. See Legacy, deprecated, and retired models for migration guidance.

### OAuth on-behalf-of for service principals is generally available

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/release-notes/product/2026/november#oauth-on-behalf-of-for-service-principals-is-generally-available
digest: shown under Data Engineering › Databricks
text: OAuth on-behalf-of (OBO) for service principals is now generally available and turned on by default. With OBO, you use the standard user-to-machine (U2M) OAuth flow to act as a service principal you manage, without creating an OAuth secret. You must have the Service Principal Manager role on the service principal. A workspace admin no longer needs to turn on the feature from the Previews page. See Authenticate as a service principal using OAuth OBO.

### Pages will soon be available by default for workspaces with the compliance security profile enabled

kind: vendor-note · source: Azure Databricks · published: 2026-11-11 · link: https://learn.microsoft.com/azure/databricks/release-notes/whats-coming#pages-will-soon-be-available-by-default-for-workspaces-with-the-compliance-security-profile-enabled
digest: shown under Data Engineering › Databricks · 🤖
text: Starting in December 2026, Pages will be available by default for workspaces with the compliance security profile enabled. This applies to workspaces with no compliance standard selected or with the HIPAA, PCI-DSS, C5, TISAX, or HITRUST compliance standard selected. Workspaces with any other compliance standard can't use Pages. See Limitations. Pages are governed definitions of business concepts, such as critical terms, entities, and acronyms, organized by domain on the Discover page. Genie One prioritizes Page definitions over context it infers automatically and cites the Page in its answers. See Pages.

### Databricks SQL version 2026.45 is rolling out in Current

kind: vendor-note · source: Azure Databricks · published: 2026-11-10 · link: https://learn.microsoft.com/azure/databricks/sql/release-notes/2026#databricks-sql-version-202645-is-rolling-out-in-current
digest: shown under Data Engineering › Databricks
text: Databricks SQL version 2026.45 is rolling out to the Current channel. See features in 2026.45.

### Use OneLake as native storage for Azure Databricks

kind: vendor-note · source: Microsoft Fabric · published: 2026-11-13 · link: https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Use-OneLake-as-native-storage-for-Azure-Databricks/ba-p/5377939
digest: shown under Data Engineering › Azure / Fabric & GCP
text: Sections: Why this matters; What's new in this release; One shared data foundation, with flexibility above it; Use OneLake as the storage foundation; Continue using Unity Catalog-managed objects; Keep platform responsibilities clear; How it works; Security; How to read the data in Fabric; Get started. Organizations increasingly use Microsoft Fabric and Azure Databricks together so teams can choose the tools that best fit their data engineering, analytics, and AI workloads while working from a common data foundation. OneLake external-location support for Azure Databricks Unity Catalog is now generally available in Microsoft Fabric, with OneLake Security enabled by default for Azure Databricks Storage items. On the Azure Databricks side, the feature is in preview. With this integration, supported Unity Catalog-managed data can be stored directly in OneLake. To understand the setup and supported scenarios, Connect Azure Databricks to a OneLake external location. Data teams often need Azu…

### Nov 13, 2026: AI_TRANSCRIBE delivers improved transcription accuracy

kind: vendor-note · source: Snowflake · published: 2026-11-13 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-13-ai-transcribe-accuracy-improvements
digest: shown under Data Engineering › Snowflake
text: Snowflake Cortex AITRANSCRIBE has been upgraded to deliver improved transcription accuracy across multiple languages, including English and French. The update improves speech recognition quality, helping produce more accurate transcripts of meetings, conversations, and recorded audio. These improvem

### Nov 12, 2026: DCM Projects PLAN privilege (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-dcm-plan-privilege-preview
digest: shown under Data Engineering › Snowflake
text: With this Public Preview release, you can grant the PLAN privilege on a DCM project to let a role run EXECUTE DCM PROJECT... PLAN and EXECUTE DCM PROJECT... PLAN DELTA without holding OWNERSHIP of the project. The DCM project privileges form a hierarchy in the order READ, MONITOR, PLAN, OWNERSHI

### Nov 12, 2026: Convert Tableau workbooks to Streamlit in Snowflake apps with CoCo (Preview)

kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-12-tableau-to-streamlit-preview
digest: shown under Data Engineering › Snowflake
text: The tableau-to-streamlit-in-snowflake skill for Cortex Code (CoCo) is now available in preview. The skill converts a Tableau workbook into a multipage Streamlit in Snowflake app, with one app page for each Tableau dashboard. Worksheets become native Streamlit charts and tables, calculations become Snowflake SQL, and

### Nov 11, 2026: Select per-user quota users by role (General availability)

kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-role-scope
digest: shown under Data Engineering › Snowflake
text: You can now define the users in a per-user quota by the roles they hold, in addition to user tags and user names. A role selects the users who are directly granted it, so quota scope stays current as you grant and revoke roles, including roles that your identity provider provisions.

### Nov 11, 2026: Programmatic notifications for Trust Center findings (General availability)

kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-trust-center-programmatic-notifications-ga
digest: shown under Data Engineering › Snowflake
text: Programmatic notifications for Trust Center findings are now generally available and are no longer in Preview.

### Larger application package versions on AWS and Azure

kind: vendor-note · source: Snowflake · published: 2026-11-12 · link: https://docs.snowflake.com/en/release-notes/2026/10_41
digest: shown under Data Engineering › Snowflake
text: With this release, the maximum size of a file in an application package version increases from 5 GB to 150 GiB, and the maximum size of an application package version stage increases from 5 GiB to 150 GiB. These limits apply to accounts on AWS and Azure, including government regions and AWS China re

### BigQuery connections to MySQL, Oracle, and PostgreSQL are now available and can be used to run MySQL federated queries, Oracle federated queries, and PostgreSQL federated queries (Preview)

kind: vendor-note · source: BigQuery · published: 2026-11-13 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_13_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: BigQuery connections to MySQL, Oracle, and PostgreSQL are now available and can be used to run MySQL federated queries, Oracle federated queries, and PostgreSQL federated queries. These features are in Preview.

===== 2026-11-14 · Community stories =====

### Unsloth Qwen3.8-27B Quantizations – Dynamic v3.1 Update

kind: story · source: Hacker News · published: 2026-11-14 · link: https://unsloth.ai/docs/models/qwen3.8 · discussion: https://news.ycombinator.com/item?id=50491980
digest: shown under AI Models & Labs › Spotted · 75 points, 11 comments
text: Guide to running Qwen3.8 quants including Qwen3.8-27B on your local setup.

### Perplexity Decider v1.3: Training, eval, and use cases

kind: story · source: Hacker News · published: 2026-11-13 · link: https://www.perplexity.ai/hub/blog/perplexity-decider · discussion: https://news.ycombinator.com/item?id=50488464
digest: shown under AI Models & Labs › Spotted · 115 points, 21 comments
text: (the source gave no text)

### Claude Meetings

kind: story · source: Hacker News · published: 2026-11-13 · link: https://claude.com/resources/articles/claude-meetings · discussion: https://news.ycombinator.com/item?id=50491097
digest: shown under AI Agents › Spotted · 87 points, 66 comments
text: Add Claude to your video calls to take notes, answer questions, and build docs and whiteboards while your team talks.

### Elevated errors on claude.ai, Claude Code, and platform.claude.com

kind: story · source: Hacker News · published: 2026-11-13 · link: https://status.claude.com/incidents/nn11wk485zfn · discussion: https://news.ycombinator.com/item?id=50481187
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: Claude's Status Page - Elevated errors on claude.ai, Claude Code, and platform.claude.com.

### Anthropic upgrades Claude Code Projects to run parallel AI workers

kind: story · source: Hacker News · published: 2026-11-14 · link: https://claude.com/resources/articles/projects-redesigned · discussion: https://news.ycombinator.com/item?id=50492141
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: A new experience for Claude projects, now available in beta in Claude Code

### OpenAI disbands its robotics team as its general models start running robots

kind: story · source: Hacker News · published: 2026-11-13 · link: https://fortune.com/2026/11/13/openai-disbands-robotics-team-as-its-general-models-start-running-robots/ · discussion: https://news.ycombinator.com/item?id=50487184
digest: shown under AI Models & Labs › Spotted · 155 points, 66 comments
text: OpenAI moved its robotics researchers onto other teams representing new thinking about the best way to build general-purpose robots.

### Show HN: Log every LLM call with tokens, cost, latency, and time to first token

kind: story · source: Hacker News · published: 2026-11-11 · link: https://github.com/garritfra/llmtee · discussion: https://news.ycombinator.com/item?id=50451943
digest: shown under AI Agents › Spotted · 10 points, 2 comments
text: Self-hosted LLM proxy.

### Claude Is Down

kind: story · source: Hacker News · published: 2026-11-13 · link: https://status.claude.com/history · discussion: https://news.ycombinator.com/item?id=50481220
digest: shown under AI Models & Labs › Spotted · 198 points, 175 comments
text: Claude's Incident and Scheduled Maintenance History

### CVE-2026-6460 – Arbitrary Code Execution in Postgres

kind: story · source: Hacker News · published: 2026-11-13 · link: https://www.postgresql.org/support/security/CVE-2026-6460/ · discussion: https://news.ycombinator.com/item?id=50484044
digest: shown under Data Engineering › Spotted · 🔓 · 12 points, 9 comments
text: (the source gave no text)

### AI agents have a big problem: Nobody wants to let them in

kind: story · source: Hacker News · published: 2026-11-13 · link: https://www.pcworld.com/article/3283946/ai-agents-have-a-big-problem-nobody-wants-to-let-them-in.html · discussion: https://news.ycombinator.com/item?id=50482661
digest: shown under AI Agents › Spotted · 15 points, 6 comments
text: (the source gave no text)

### Hugging Face CEO vows to keep fighting for open-source AI

kind: story · source: Hacker News · published: 2026-11-12 · link: https://techcrunch.com/2026/11/12/hugging-face-ceo-vows-to-keep-fighting-for-open-source-ai-after-jensen-huangs-exit/ · discussion: https://news.ycombinator.com/item?id=50471673
digest: shown under AI Models & Labs › Spotted · 21 points, 2 comments
text: Hugging Face's CEO pledged to keep fighting for open source AI after Huang's exit, raising questions about Nvidia's $12.9 billion acquisition.

### Claude Code and Codex reverse engineered my 1994 Jeep's ECU over a $3 Arduino [video]

kind: story · source: Hacker News · published: 2026-11-12 · link: https://www.youtube.com/watch?v=WPj3aQ-xxpI · discussion: https://news.ycombinator.com/item?id=50463399
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: (the source gave no text)

### e-means: 10x faster k-means at equal loss

kind: story · source: Lobste.rs · published: 2026-11-13 · link: https://e-means.github.io/ · discussion: https://lobste.rs/s/rnmylu/e_means_10x_faster_k_means_at_equal_loss
digest: shown under AI Models & Labs › Spotted · 4 points, 0 comments
text: Modern optimization and scaling laws for k-means clustering

### A VS Code extension to turn ANY free chatbot website into an AI agent (kind of)

kind: story · source: Dev.to · published: 2026-11-12 · link: https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb · discussion: https://dev.to/effessdev/a-vs-code-extension-to-turn-any-free-chatbot-website-into-an-ai-agent-kind-of-1jfb
digest: shown under AI Agents › Spotted · 41 reactions, 80 comments
text: So, why should I bring this up again? Because Qoder (Alibaba’s AI IDE) free promo has officially

### Torrents are perfect for model distribution

kind: story · source: Hacker News · published: 2026-11-13 · link: https://pirateface.co/articles/every-ai-model-should-be-a-torrent · discussion: https://news.ycombinator.com/item?id=50464055
digest: shown under AI Models & Labs › Spotted · 37 points, 16 comments
text: (the source gave no text)

### How To Review Pull Requests with Kiro CLI and GitHub Actions

kind: story · source: Dev.to · published: 2026-11-13 · link: https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b · discussion: https://dev.to/erikch/how-to-review-pull-requests-with-kiro-cli-and-github-actions-1b9b
digest: shown under AI Agents › Spotted · 30 reactions, 5 comments
text: Review Pull Requests with Kiro CLI and GitHub Actions Kiro CLI has a headless mode. Give

===== 2026-11-15 · AI Agents =====

### # zstd request compression: highly compressible content gets a bare 400 instead of the documented 413, and Codex never avoids it

kind: hot-issue · source: openai/codex · published: 2026-11-14 · link: https://github.com/openai/codex/issues/61489
digest: shown under AI Agents › Coding Agents & Assistants › OpenAI Codex · 12 comments, 0 👍; +11 in the last 24h
text: ### What version of Codex CLI is running? codex-cli 0.167.0 ### What subscription do you have? Pro 500 ### Which model were you using? gpt-6.1-sol ### What platform is your computer? Linux x86_64（CentOS 8） ### What terminal emulator and version are you using (if applicable)? ### Codex doctor report ### What issue are you seeing? ## Summary With `features.enable_request_compression` on (the default for ChatGPT auth), Codex zstd-compresses HTTP request bodies to `chatgpt.com/backend-api/codex/responses`. When part of the body decompresses to far more than its compressed size, the backend answers `400 {"detail":"Bad Request"}`. The same request sent uncompressed succeeds. The API docs (production best practices → Compress request bodies) say the decompressed body must be at most 100× the compressed size, that requests exceeding the limits **return HTTP 413**, and that 400 is for invalid or incomplete zstd data. A decompression-ratio limit is reasonable; the problems are: 1. **The Codex backend returns a bare 400, not the documented 413**, so a client can't tell "ratio limit" from corrupted data, and the user only sees "Bad Request". 2. **Codex compresses by default and never avoids or recovers from it**: it does not check the ratio before sending and does not retry uncompressed. Once a thread's history contains such content, every later turn fails the same way. **The trigger is local expansion, not the whole-body ratio.** In our sweep below, the image is uniform noise, so every zstd block compresses about equally and the whole-body ratio is a fair proxy: ≤ ~106× passed, ≥ ~117× failed. With repeated content, long-distance matches let a single block expand by orders of magnitude while the whole-body ratio stays low. #60594 reports a 400 at a whole-body ratio of only 2.65×. So the limit is presumably checked per block or per received piece, not on the whole frame; we have not pinned down the exact rule. An offline model that fails when one ~16 KiB input piece decodes to more than 100× matched most of our captured outcomes, but it misjudged one case near the boundary. If the check is per received piece, the outcome could also depend on how the body is split in transit. That might be why a repeated image failed in #60594 but passed for us (2/2); this is speculation. ## Why it matters - It only happens over HTTP, which Codex uses after falling back from WebSockets. Long conversations with many images are the ones that fall back (a reloaded thread resends the whole history in one message), and then **every later turn fails** with the same 400, because each turn resends the same history. - Content that triggers it is ordinary, and nothing needs to be large or modified: a PNG stored without compression, a large blank or solid-colour image, or presumably content repeated within the zstd window (the same image twice, repetitive logs). A single 4.7 MB image (≈ 6 MB request) is enough. We only tested images. - The user only sees "Bad Request", with no hint that... […cut]

### Oh My Pi v18.20.2

kind: release · source: can1357/oh-my-pi · published: 2026-11-14 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.2
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ## @oh-my-pi/pi-ai ### Added - Added the Antigravity CLI ACP provider with managed installation, Google sign-in, refreshable distributed credentials, host tools, and retained conversations across tool steps and history changes. ## @oh-my-pi/pi-catalog ### Added - Added Antigravity CLI models for Gemini, Claude and GPT-OSS with selectable native thinking levels. ## @oh-my-pi/pi-coding-agent ### Added - Added the `antigravity-cli` provider for Google Antigravity over ACP, with managed binary installation, `/login antigravity-cli` Google sign-in, host tool execution, and retained conversations across tool steps and history changes. ## @oh-my-pi/pi-utils ### Added - Added a profile-aware data directory for managed Antigravity CLI installations and isolated account state.

### Oh My Pi v18.20.1

kind: release · source: can1357/oh-my-pi · published: 2026-11-14 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.1
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ### Breaking Changes - Changed lsTree() to return { path, mode } entries instead of bare paths; mode matches git ls-tree output (for example, 100755 or 120000). ## @oh-my-pi/pi-agent-core ### Fixed - Corrected context cost estimates for requests that omit reasoning history, so billing estimates now include thinking text only when it is sent or reconstructed for a tool call. ## @oh-my-pi/pi-ai ### Added - Added `setUnpausedProviders()` to `@oh-my-pi/pi-ai/oauth`, allowing applications to re-enable providers paused by authentication rules; loaded credential pools and extension logins recognize the change on their next read. ### Changed - Updated Vertex AI Gemini requests to use the v1beta1 API, restoring support for long Gemini responses. - Improved Google Antigravity quota recovery so Gemini 4 Argon access can resume after quota or plan changes when shared Gemini capacity is available. - Improved Amazon Bedrock region selection to honor a configured regional endpoint before falling back to `us-east-1`. ### Fixed - Fixed Gemini 4 responses that exceed a single output segment across Google, Vertex AI, Gemini CLI, and Antigravity, ensuring long responses continue generating and are delivered as one complete reply. - Fixed Cursor conversations so hook-added prompt content remains in the current user message and conversation context is correctly preserved across turns. - Fixed Amazon Bedrock streaming so malformed responses fail promptly and interrupted responses are retried rather than treated as complete. - Fixed Claude account recovery when usage reports contain only one shared usage window. - Fixed OpenRouter conversations with Kimi and DeepSeek so reasoning context is preserved when switching models. - Fixed Xiaomi MiMo Token Plan authentication to use the correct regional endpoint, including for models loaded from bundled or cached configuration. - Fixed Perplexity sign-in in the login flow and setup wizard, including email-code and browser-based SSO authentication. - Stopped native judges from retrying gateway errors caused by exhausted upstream credentials while retaining retries for other transient 502 errors. - Fixed simple completion and authenticated gateway chat routes so supported providers receive stop-sequence and frequency-penalty settings. - Fixed Muse sessions after credential changes, key rotation, or idle resume so subsequent turns can continue normally. ## @oh-my-pi/pi-catalog ### Added - Added Gemini 4 Hydrogen on Google Antigravity as a single model with selectable low, medium, high, and xhigh thinking levels, priced at $1.50/$7.50 per million tokens. - Added Chutes provider support with live model discovery and `/login chutes` authentication using `CHUTES_API_KEY`. ### Changed - Paused Google Antigravity: login is no longer available and stored credentials are not used until the provider is re-enabled. Use `GEMINI_API_KEY` with Google AI Studio or the `google-vertex` provider instead . - Updated Command Code model pricing and usage reporting to match the provider's current rates, including long-context pricing tiers for Claude Haiku 5.5, GPT-6.1 Sol and Terra, Grok 4.7, and Claude Sonnet 5.5. - Increased the maximum output for Gemini 4 Argon, Carbon, and Hydrogen on the Gemini API and Vertex AI to 262,144 tokens, enabling substantially longer responses. - Updated OpenCode Go Claude Haiku 5.5 to support thinking levels from low through max, including explicit thinking disablement. - Updated Devin requests to identify as Devin CLI 3000.12.57, the current stable version. ### Fixed - Fixed Gemini 4 Argon on Command Code so image attachments are preserved and usage is billed correctly at $2 per million input tokens, $10 per million output tokens, and $0.10 per million cache-read tokens ( ). - Fixed Factory Droid GPT-6 models failing on the next turn after changing the thinking level during Bedrock or Snowflake sessions ( ). - Fixed OpenRouter model listings for workspace-restricted API keys so each key shows its correct allowed model roster and maintains an independent model cache ( ). - Fixed OpenCode Go Muse Spark tool-call turns losing encrypted reasoning between steps ( ). - Fixed Vertex AI Gemini 3 and newer models rejecting replayed or cross-model tool calls that lack a thought signature ( ). - Fixed Cursor model listings omitting models available to the provider, including GLM 5.3 and Grok 4.7 ( ). ## @oh-my-pi/pi-coding-agent ### Added - Added `/commit` to create commits containing only changes made by the agent or a selected subagent, while preserving other agents’ and the user’s work. The workflow is also available through the eval `commit` namespace, supports targeting repositories outside the session directory, handles binary and non-UTF-8 files, symlinks, file mode changes, and initial commits, and can optionally skip commit hooks with `no_verify`; use `commit.enabled` to disable it. - Added `auth.unpausedProviders` (the **Unpaused Providers** setting) to re-enable paused providers such as Google Antigravity at your own risk while preserving their stored login state. - Added configurable long-turn todo reminders through `todo.midRunNudges`, including options to disable reminders, limit them to two, or continue with increasing intervals. - Pasting styled content into the composer now preserves Markdown formatting and places embedded images at their original positions, while code copied from editors remains plain text. - Added the `session_clear` hook and extension event, emitted when `/clear` resets the current session context without changing its session ID. - Added path-scoped Bash allow rules, project and configuration overlay precedence, and environment-variable controls through `bash.allowedEnvVars` and per-rule `env` settings. - Subagents now preserve `@upstream` provider pinning when inheriting models. - Added deletion of individual prompts from Ctrl+R history with the Delete key. […cut]

===== 2026-11-15 · AI Policy =====

### Convergent Interests: How America Could Undermine Its Own AI Advantage

kind: policy-item · source: CSET · published: 2026-11-14 · link: https://cset.georgetown.edu/article/convergent-interests-how-america-could-undermine-its-own-ai-advantage/
digest: shown under AI Policy › News & commentary
text: A convergence of political, commercial, and ideological pressures can impede America’s AI leadership, and public controversies are powerful enough to catalyze that convergence. Our piece spotlights this issue, urging policymakers to govern AI responsibly without disabling the innovation that makes American leadership possible—even in the wake of scandal. The post Convergent Interests: How America Could Undermine Its Own AI Advantage appeared first on Center for Security and Emerging Technology .

===== 2026-11-15 · Data Engineering =====

### Apache Polaris Release 1.9.0

kind: release · source: apache/polaris · published: 2026-11-14 · link: https://github.com/apache/polaris/releases/tag/apache-polaris-1.9.0
digest: shown under Data Engineering › Snowflake › Apache Polaris
text: Apache Polaris 1.9.0 Release ## Release Artifacts This release includes: - Source and binary distributions - Helm chart package - Docker images published to Docker Hub - Maven artifacts published to Maven Central ## Verification All artifacts have been signed with GPG and include SHA-512 checksums for verification. ## Docker Images - `apache/polaris:1.9.0` - Polaris Server - `apache/polaris-admin:1.9.0` - Polaris Admin Tool

### OpenMetadata 2.0.8-release

kind: release · source: open-metadata/OpenMetadata · published: 2026-11-13 · link: https://github.com/open-metadata/OpenMetadata/releases/tag/2.0.8-release
digest: shown under Data Engineering › Releases this week
text: ## Changelog OpenMetadata 2.0.8 is a maintenance release that expands connector coverage and improves lineage accuracy. It strengthens Data Quality and governance workflows. It also strengthens Model Context Protocol (MCP) authentication and access controls. The release improves search, Resource Description Framework (RDF) storage operations, and upgrades. It also improves user interface (UI) reliability. Security updates cover the server, ingestion, and Airflow. They also cover MCP and frontend dependencies. ### 🔌 Connectors and Ingestion This release includes the following connector and ingestion improvements: - **Deleting an ingestion pipeline could fail and leave its directed acyclic graph in Airflow** : Pipeline deletion now uses Airflow's supported cleanup path. It removes graph versions and cleans runs and task instances in dependency order. - **Glue Test Connection could fail on databases excluded by the pipeline filters** : Connection tests now probe only the databases and tables that ingestion is configured to read. - **Hex links were broken, and projects lacked detailed models and lineage** : Hex ingestion now builds working source links and creates data models with SQL-cell column lineage. It also ingests components, run history, and application views. - **Hex source tables linked to dashboards instead of their data models** : Table and column lineage now terminates at the Hex data model, including models created from query-history-only tables. - **Power BI retained stale dashboards and data models after a confirmed empty listing** : A complete, successful empty listing can now soft-delete entities that no longer exist while failed or incomplete listings remain protected. - **SSIS packages stored in Azure Blob Storage couldn't be configured** : SSIS connections now accept an Azure Data Lake Storage container in addition to Amazon S3 and local paths. - **BigQuery date-sharded tables appeared as separate physical assets** : An optional grouping mode now represents daily shards as one logical table while recording the physical table used for profiling and samples. Lineage and quality results also retain the physical execution source. - **Athena required a workgroup and rendered invalid table names in rule SQL** : The workgroup is now optional, and rule-library expressions omit the placeholder database segment from Athena table names. - **dbt tests and sources could produce incorrect results** : Warning results now ingest as failures. Source metadata and filtering use the physical `identifier` when it differs from the logical name. Tests and lineage use it as well. - **Recursive CSV imports could drop constraints, column properties, and foreign-key edges** : Imports at the service, database, or schema level now retain table constraints and custom properties. They also rebuild foreign-key relationships. - **Malformed quoted CSV values caused server errors** : Synchronous and asynchronous imports now return an aborted result with the affected line and corrective guidance. - **Sigma ingestion omitted workbook metadata, data models, and accurate lineage** : Nine connector improvements add data models, certification tags, and lifecycle dates. They also add workspace projects and version properties. Lineage, owner matching, and column matching are now more reliable. - **Usage ingestion could attach queries and daily counts to the wrong table identity** : Query lookup now uses the service hash and safely retries concurrent query creation. - **Snowflake stored-procedure scans could run without a lower bound or stop other ingestion work** : Procedure history is now bounded at both ends, canceled scans are split, and failures are isolated from other ingestion stages. - **MySQL-compatible connections didn't verify certificates supplied through `sslConfig`** : MySQL, Doris, and StarRocks now pass certificate files correctly to PyMySQL. Invalid SSL configurations are rejected before ingestion starts. ### 📊 Data Quality and Data Insights This release includes the following Data Quality and Data Insights fixes: - **Data Insights could omit earlier snapshot days after version history was exhausted** : Snapshot repair now fills eligible uncovered days from the oldest retained entity version and creation evidence. - **Incident menus offered invalid transitions, and listings could fail or ignore the latest-only filter** : Menus now show only allowed workflow transitions. Time-series listings also preserve latest-only partitioning and correctly scope deleted test cases. - **Column tests couldn't be attached to nested fields** : Test cases, dimensions, and inherited tags now resolve dotted paths through nested column children. - **Data contract validation results erased owners and reviewers** : Result updates now reload and preserve the stored contract fields before recording the latest result. - **Restoring or recursively deleting test cases with incident history could fail or leave stale rows** : Restore skips time-series children that use a separate repository, while hard deletion cleans incident history after the owning transaction succeeds. - **Datetime quality bounds could be rejected or scaled incorrectly** : Signed values, leading zeroes, and fractional seconds now parse consistently. ISO dates and timezone offsets also parse consistently while preserving microseconds. - **Profiler columns beginning with `__` or `_sa_` could be omitted** : The profiler now maps reserved-looking names to safe, unique Python attributes without changing the source column names. ### 🛡️ Data Governance and Workflows This release includes the following governance and workflow fixes: - **Negated tag rules matched assets that had a different tag and excluded untagged assets** : **Is Not**, **Not In**, and **Is Not Set** now represent the intended whole-list condition. The editor also displays negated rules saved through the API. […cut]

### Databricks Runtime 19: November 9, 2026

kind: vendor-note · source: Azure Databricks · published: 2026-11-09 · link: https://learn.microsoft.com/azure/databricks/release-notes/runtime/19#databricks-runtime-19-november-9-2026
digest: shown under Data Engineering › Databricks
text: Sections: Bug fixes. Fix real-time mode reservation liveness and occupied-slot accounting when tasks execute through Aether.

### Nov 11, 2026: Override per-user quota limits for specific users (General availability)

kind: vendor-note · source: Snowflake · published: 2026-11-11 · link: https://docs.snowflake.com/en/release-notes/2026/other/2026-11-11-per-user-quota-limit-overrides
digest: shown under Data Engineering › Snowflake
text: You can now set per-user, per-cycle credit limit overrides on a per-user quota to give specific users a higher or lower limit than the quota default without changing the quota's user scope or creating a separate quota. You can also set an optional expiration date so a temporary adjustment reverts au

### You can use the JSON_FLATTEN function to extract all non-array values that are either directly in the input JSON value or children of one or more consecutively nested arrays in the input JSON value

kind: vendor-note · source: BigQuery · published: 2026-11-11 · link: https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026
digest: shown under Data Engineering › Azure / Fabric & GCP
text: You can use the JSON_FLATTEN function to extract all non-array values that are either directly in the input JSON value or children of one or more consecutively nested arrays in the input JSON value. This function is generally available. (GA).

===== 2026-11-15 · Community stories =====

### Generative AI uses more energy on non-English text

kind: story · source: Hacker News · published: 2026-11-10 · link: https://news.umich.edu/generative-ai-uses-more-energy-on-non-english-text/ · discussion: https://news.ycombinator.com/item?id=50441444
digest: shown under AI Models & Labs › Spotted · 196 points, 103 comments
text: (the source gave no text)

### What a task costs on Opus 5.5

kind: story · source: Hacker News · published: 2026-11-15 · link: https://claude.dev/blog/what-a-task-costs-on-opus-5-5/ · discussion: https://news.ycombinator.com/item?id=50503241
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: The same token price can cost very different amounts per task. Learn what Claude Code tasks cost on Opus 5.5 and which settings change the bill.

### Show HN: Agweb – a browser for agents that stays out of your way

kind: story · source: Hacker News · published: 2026-11-14 · link: https://github.com/paul-nameless/agweb · discussion: https://news.ycombinator.com/item?id=50497147
digest: shown under AI Agents › Spotted · 92 points, 27 comments
text: A browser built for agents - no focus stealing, a tiny footprint, all tabs in one view.

### Agile Manifesto for Agents

kind: story · source: Hacker News · published: 2026-11-14 · link: https://debarshibasak.github.io/readables/blogs/agent-first-development · discussion: https://news.ycombinator.com/item?id=50496562
digest: shown under AI Agents › Spotted · 28 points, 6 comments
text: Twelve commandments for vibe coding and agents in a team: understand the scope before implementation, coordinate bounded work, and deliver software the enterprise can operate.

### End‑to‑End 4‑Bit Training

kind: story · source: Hacker News · published: 2026-11-13 · link: https://thinkingmachines.ai/blog/end-to-end-4-bit-training/ · discussion: https://news.ycombinator.com/item?id=50490618
digest: shown under AI Models & Labs › Spotted · 24 points, 1 comment
text: Training large language models involves calculating and storing a lot of numbers. Using fewer bits for each value reduces memory usage and allows GPUs to perform calculations faster. However, there is a tradeoff: fewer bits also mean fewer representable numbers, leading to more aggressive rounding.

### Show HN: Shotoku – Local-first action governance and budget caps for AI agents

kind: story · source: Hacker News · published: 2026-11-14 · link: https://www.shotoku.dev/ · discussion: https://news.ycombinator.com/item?id=50496705
digest: shown under AI Agents › Spotted · 9 points, 1 comment
text: Give your AI agents a budget. Spending limits, human approvals, and a tamper-evident audit trail — enforced locally before the payment happens. No cloud. No custody.

### Show HN: Cyberviber – a $15 touch screen to show which Claude session needs you

kind: story · source: Hacker News · published: 2026-11-14 · link: https://cyberviber.de/ · discussion: https://news.ycombinator.com/item?id=50496642
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: A 2.4″ ESP32 touch display that lists running Claude Code sessions with their state and focuses a session's terminal when you tap it.

### Show HN: Open-Source Version of Cyclon: Phone where AI is the interface?

kind: story · source: Hacker News · published: 2026-11-14 · link: https://opencyclone.vercel.app/ · discussion: https://news.ycombinator.com/item?id=50493213
digest: shown under AI Agents › Spotted · 8 points, 1 comment
text: Do not buy an AI phone. Just use the one you have. Free and open source.

### Ex-OpenAI researcher finds Blackwell signatures in open-weight models

kind: story · source: Hacker News · published: 2026-11-14 · link: https://twitter.com/willdepue/status/2120992457630326841 · discussion: https://news.ycombinator.com/item?id=50494668
digest: shown under AI Models & Labs › Spotted · 18 points, 1 comment
text: I have a major result to share. I’ve found conclusive forensic evidence that the top 4 Chinese AI labs—DeepSeek, Moonshot, MiniMax and Ant Group—have built their newest models on NVIDIA’s most advanced Blackwell chips, which are barred from export to China. This sounds insane, but I discovered th

### DeepSeek V4 Pro 0813

kind: story · source: Hacker News · published: 2026-11-14 · link: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813 · discussion: https://news.ycombinator.com/item?id=50492302
digest: shown under AI Models & Labs › Spotted · 25 points, 1 comment
text: Text Generation model with 1.7T parameters. Download, explore files and run it on Hugging Face.

### Claude asked to renumber pages deletes professor's syllabus, year of notes

kind: story · source: Hacker News · published: 2026-11-14 · link: https://www.tomshardware.com/tech-industry/artificial-intelligence/rogue-claude-ai-tasked-with-renumbering-pages-accidentally-deletes-law-professors-entire-syllabus-one-year-of-lecture-notes-youre-right-to-be-angry-i-deleted-your-files-through-my-own-carelessness-humbled-agent-admits · discussion: https://news.ycombinator.com/item?id=50499114
digest: shown under AI Agents › Spotted · 45 points, 63 comments
text: A University of Chicago lecturer has revealed a rogue Claude AI agent deleted his entire syllabus and year's worth of lecture notes by mistake.

### You could have invented transformers from memory

kind: story · source: Lobste.rs · published: 2026-11-13 · link: https://alexwang.ai/posts/associative-memory/ · discussion: https://lobste.rs/s/u2h9as/you_could_have_invented_transformers
digest: shown under AI Models & Labs › Spotted · 3 points, 0 comments
text: Every layer is a memory store

### Gemini Decision 1 is Free on Google AI Studio

kind: story · source: Hacker News · published: 2026-11-12 · link: https://aistudio.google.com/docs/decisions-api · discussion: https://news.ycombinator.com/item?id=50457853
digest: shown under AI Models & Labs › Spotted · 15 points, 1 comment
text: The fastest path from prompt to production with Gemini

### Anthropic says a key AI safety alarm has been triggered, days before its IPO

kind: story · source: Hacker News · published: 2026-11-12 · link: https://finance.yahoo.com/markets/article/anthropic-says-a-key-ai-safety-alarm-has-been-triggered-days-before-its-ipo-171519615.html · discussion: https://news.ycombinator.com/item?id=50456668
digest: shown under AI Models & Labs › Spotted · 15 points, 11 comments
text: (the source gave no text)

### Your Agent Needs a Schema, Not a Better Prompt

kind: story · source: Dev.to · published: 2026-11-13 · link: https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm · discussion: https://dev.to/dailycontext/your-agent-needs-a-schema-not-a-better-prompt-53bm
digest: shown under AI Agents › Spotted · 22 reactions, 9 comments
text: The failure nobody demos The agent demo always works. The customer asks for a refund, the

### Composio vs Nango vs Scalekit: What Changes When Your Agent Goes to Production

kind: story · source: Dev.to · published: 2026-11-14 · link: https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2 · discussion: https://dev.to/therealmrmumba/composio-vs-nango-vs-scalekit-what-changes-when-your-agent-goes-to-production-4fl2
digest: shown under AI Agents › Spotted · 29 reactions, 3 comments
text: The demo passed. The security review didn't. Here's a story you've probably lived, or will

===== 2026-11-16 · AI Agents =====

### Oh My Pi v18.20.3

kind: release · source: can1357/oh-my-pi · published: 2026-11-16 · link: https://github.com/can1357/oh-my-pi/releases/tag/v18.20.3
digest: shown under AI Agents › Coding Agents & Assistants › Oh My Pi
text: ### Breaking Changes - Removed the public `isXdDevicePath` export from `providers/cursor-pi-args`. Ranged reads of `xd://` documents now use the standard line-selector behavior. ### Breaking Changes - Renamed the browser `tab.clickAt()` option from `clickCount` to `count`, matching `tab.click()`. - Browser viewport screenshot coordinates now use the displayed image coordinates when the screenshot is scaled for the model; pass `css: true` (or `{ x, y, css: true }` for drag points) to provide viewport CSS pixels explicitly. - Added opt-in `mnemopi.recallRelevance` (`off`, `auto`, or `on`; default `off`) to filter automatic memory recall for task relevance using the `judge` role. - Added path-scoped entries for `bash.patterns` and `bashInterceptor.patterns`, resolved per working directory. Project and `--config` overlays now prepend these rules to global rules instead of replacing them. - Added `bash.allowedEnvVars` and per-rule `env` lists to permit explicitly named environment-variable prefixes on matching `allow` rules. - Subagents now preserve `@upstream` provider pinning on inherited models. - Added `--no-judge`, `--no-spotlight`, and `--offline` options to restrict auxiliary services to the active model's provider or disable cross-provider services. - Added per-rule TTSR `repeatMode` frontmatter (`once`, `after-gap`, or `always`) to override the global repeat policy. - Compound bash approval prompts now show each command segment separately, distinguishing allowed segments from those requiring approval. - Removed the `seance` agent, `/seance` command, and the task tool's `sourceSession` parameter. ## @oh-my-pi/pi-ai ### Fixed - Fixed rate-limit handling for Mistral and other OpenAI-compatible providers so requests with no available allowance fail immediately with an actionable error suggesting a model or plan change. - Fixed Anthropic OAuth requests for pooled Claude accounts to report accurate device and account information, including after credentials are rotated during a request. ## @oh-my-pi/pi-catalog ### Added - Added publicly available image-sizing helpers for determining model-delivered image dimensions and fitting images to a specified long edge before coordinate mapping. ### Fixed - Fixed image inputs being dropped for DeepSeek V4 Flash, restoring consistent multimodal image support. - Restricted reasoning-effort options for Mistral GLM 5.3, GLM 5.3 Flash, and Mistral Large 4 to the levels supported by those models. ## @oh-my-pi/pi-coding-agent ### Added - Added `mnemopi.embeddingQueryPrefix` and `mnemopi.embeddingInputType` configuration for asymmetric and instruction-tuned embedding models, including providers that require an `input_type`. ### Changed - Browser screenshots are delivered to the model in CSS pixels up to the supported unscaled size, making viewport screenshot coordinates directly usable with browser actions; scaling guidance remains for scaled full-page and element captures. - Browser `waitForUrl`, `waitForResponse`, and `requests({ filter })` now support `*` glob patterns in URL strings, while other strings retain substring matching. - The WebKit browser engine now automatically installs and updates to the newest stable ABKit release, with versioned installations that allow updates without waiting for existing browser hosts to exit. - Improved browser responsiveness and recovery: unresponsive WebKit pages fail fast with actionable errors, navigation can recover busy pages, and browser operations provide clearer diagnostics for timeouts, closed tabs, unsupported event listeners, invalid routes, cookie data, and viewport changes. - Pressing Delete at the end of the Ctrl+R search field removes the selected prompt from history. - `/copy` now works while viewing a subagent and copies from that subagent's transcript. - `find` now returns unranked literal keyword matches when all judge requests fail. - `take()` and `drop()` now reject nonexistent hunk units with a clear error. - `edit` rejection messages now suggest the file's current tag, and edits made before conflict resolution carry over to the resolved file. - `/marketplace` and marketplace install/uninstall commands now report picker and catalog-load errors without exiting the session. - ACP sessions honor `mcp.startupTimeoutMs` for MCP servers declared by the client, and ACP form elicitations no longer repeat field labels unnecessarily. - Task progress from every `task.steps` subagent step is now preserved, rather than only the final step's report. - Pasting HTML into the composer now preserves spaces from whitespace-only inline elements and indentation inside ` ` blocks. - Queued follow-ups edited with Alt+Up are restored as queued messages instead of being sent into the active turn. ### Fixed - Fixed `ida` `exec` output on IDA 9.5+ by suppressing helper deprecation warnings and preserving the updated function metadata API. - Expired Perplexity logins and cookies no longer return an error page as a search answer; the provider is reported as expired and the search chain continues. - Fixed browser WebMCP discovery and invocation on Chrome and Chromium 157 and later. - Private hosts written with a trailing dot are now correctly handled by Ask and `always-ask-cached` before file tools access them. - Fixed the TUI freezing when switching sessions from an open tool-approval prompt. - Fixed `/commit` and eval `commit` dropping UTF-8 BOMs or mishandling quoted and Unicode filenames during change tracking and selective commits. - Fixed misleading Wayland clipboard warnings when pasting an image or when the clipboard is empty. - Fixed JavaScript evaluation after an in-place Linux upgrade by keeping session workers tied to the session's build. - Deleting a session that cannot be removed no longer deletes its prompt history and statistics. - Fixed `read` and `write` handling of line selectors on `xd://` device URLs. - Fixed `eval wait()` rejecting or mishandling numeric delays; […cut]

### anthropics/skills

kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/anthropics/skills
digest: shown under Trends (weekly tables) › Agents & coding tools › 🔌 Agent Tooling
text: Public repository for Agent Skills

### backnotprop/plannotator

kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/backnotprop/plannotator
digest: shown under Trends (weekly tables) › Agents & coding tools › 🔌 Agent Tooling
text: The workspace to stay in the loop and on top of agents - shape, decide, plan, annotate, review code, share with team, and send all feedback to agents with one click.

### vercel-labs/agent-browser

kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/vercel-labs/agent-browser
digest: shown under Trends (weekly tables) › Agents & coding tools › 🔌 Agent Tooling
text: Browser automation CLI for AI agents

### ZhuLinsen/daily_stock_analysis

kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/ZhuLinsen/daily_stock_analysis
digest: shown under Trends (weekly tables) › Agents & coding tools › 🤖 Other Agents
text: LLM 驱动的多市场股票智能分析系统：多源行情、实时新闻、决策看板与自动推送，支持零成本定时运行。 LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs.

### milind-soni/OpenMausBot

kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/milind-soni/OpenMausBot
digest: shown under Trends (weekly tables) › Agents & coding tools › 🤖 Other Agents
text: Open-source Grok Bot alternative with a virtual machine that bots can use

### google/elephant-goldfish-model

kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/google/elephant-goldfish-model
digest: shown under Trends (weekly tables) › Agents & coding tools › 🧑‍💻 Coding Agents
text: Open-source plugin for designing and reviewing software with agents

### addyosmani/agent-skills

kind: trending-repo · source: GitHub Trending · published: 2026-11-16 · link: https://github.com/addyosmani/agent-skills
digest: shown under Trends (weekly tables) › Agents & coding tools › 🔌 Agent Tooling
text: Production-grade engineering skills for AI coding agents.

===== 2026-11-16 · AI Models & Labs =====

### Lvmh Media Division Partnership

kind: lab-post · source: openai · published: 2026-11-16 · link: https://openai.com/index/lvmh-media-division-partnership/
digest: shown under AI Models & Labs › Lab announcements
text: (the source gave no text)

### Qwen: Qwen4 Max

kind: model · source: OpenRouter · published: 2026-11-16 · link: https://openrouter.ai/qwen/qwen4-max
digest: shown under AI Models & Labs › New on OpenRouter
text: Qwen4 Max is the flagship model in Alibaba's Qwen4 series. It accepts text, image, and video input and returns text, with a 1M-token context window and reasoning enabled by default....

===== 2026-11-16 · AI Policy =====

### Commission invites views on draft revised election guidelines under Digital Services Act

kind: policy-item · source: European Commission · published: 2026-11-10 · link: https://digital-strategy.ec.europa.eu/en/news/commission-invites-views-draft-revised-election-guidelines-under-digital-services-act
digest: shown under AI Policy › EU
text: The European Commission launched a consultation to update its election guidelines under the Digital Services Act (DSA), addressing the rapid evolution of technologies, particularly generative Artificial Intelligence (AI), and the growing sophistication of manipulation risks.

===== 2026-11-16 · Data Engineering =====

### Terraform provider for Databricks v1.143.0

kind: release · source: databricks/terraform-provider-databricks · published: 2026-11-16 · link: https://github.com/databricks/terraform-provider-databricks/releases/tag/v1.143.0
digest: shown under Data Engineering › Databricks › Terraform provider for Databricks
text: ### Important Changes * `databricks_app` now updates apps through the asynchronous Apps update API . The synchronous update API ignored `compute_size`, `compute_min_instances`, and `compute_max_instances`, so changes to them never took effect; they are now applied. As before, an update replaces the app's updatable fields with the configuration, so fields omitted from it are cleared. That now also covers the fields the synchronous API skipped: an omitted `compute_size` resets to `MEDIUM`, omitted `compute_min_instances` and `compute_max_instances` disable horizontal scaling, and an omitted `git_source` clears the app's default git source. Updates now wait for the app update to reach `SUCCEEDED`. ### New Features and Improvements * Add resource and data sources for `databricks_assume_group_restricted_sharing_group`. * Add `personal_access_token_wo` and `personal_access_token_wo_version` write-only attributes to `databricks_git_credential` resource . * Add `options_wo` and `options_wo_version` write-only attributes to `databricks_connection` resource . ### Bug Fixes * Keep the configured values of the `pem_key_passphrase`, `ssl_keystore_key`, `ssl_key_password` and `schema_registry_api_secret` options of `databricks_connection`, which the API doesn't return, to avoid a perpetual diff . * Ignore whitespace-only differences in PEM-encoded options of `databricks_connection`, such as `userProvidedServerCertificate`, to avoid a perpetual diff .

### Use Genie One as your Chrome new tab page (Beta)

kind: vendor-note · source: Azure Databricks · published: 2026-11-12 · link: https://learn.microsoft.com/azure/databricks/ai-bi/release-notes/2026#use-genie-one-as-your-chrome-new-tab-page-beta
digest: shown under Data Engineering › Databricks · 🤖
text: The Genie One Chrome extension replaces the Chrome new tab page with Genie One from your Azure Databricks workspace. While the extension is turned on, new tabs open the Genie One home page, so you can ask a question, search across your connected tools, or open a dashboard without first going to your workspace. The extension uses your existing Azure Databricks sign-in and permissions, and it works with the one workspace you choose. This feature is in Beta. See Use Genie One as your Chrome new tab page.

===== 2026-11-16 · Community stories =====

### Qwen4-Max

kind: story · source: Hacker News · published: 2026-11-16 · link: https://qwen.ai/blog?id=qwen4-max · discussion: https://news.ycombinator.com/item?id=50513215
digest: shown under AI Models & Labs › Spotted · 480 points, 191 comments
text: Qwen offers comprehensive functionality spanning chatbot, image and video understanding, image generation, document processing, web search integration, tool utilization, and artifacts.

### What thousands of conversations look like inside a language model

kind: story · source: Hacker News · published: 2026-11-13 · link: https://operator0x.com/field-notes/qwen-conversation-state-space/ · discussion: https://news.ycombinator.com/item?id=50481321
digest: shown under AI Models & Labs › Spotted · 123 points, 29 comments
text: I mapped thousands of conversations inside Qwen to see how language takes shape.

### Understanding Positional Embeddings in Modern LLMs

kind: story · source: Hacker News · published: 2026-11-15 · link: https://magazine.sebastianraschka.com/p/understanding-positional-embeddings · discussion: https://news.ycombinator.com/item?id=50506376
digest: shown under AI Models & Labs › Spotted · 227 points, 27 comments
text: The Methods Behind How LLMs Represent Token Positions

### The efficient frontier of LLM inference

kind: story · source: Hacker News · published: 2026-11-15 · link: https://www.baseten.co/blog/the-efficient-frontier-of-llm-inference/#quantization · discussion: https://news.ycombinator.com/item?id=50512233
digest: shown under AI Models & Labs › Spotted · 9 points, 0 comments
text: In inference engineering, some techniques move a deployment along the latency–throughput frontier, while others push the entire frontier out. This article maps batch sizing, parallelism, quantization, kernels, speculative decoding, and disaggregation.

### Show HN: db-branch – database branches in seconds for AI agents and CI, via ZFS

kind: story · source: Hacker News · published: 2026-11-15 · link: https://github.com/db-branch/db-branch · discussion: https://news.ycombinator.com/item?id=50506940
digest: shown under Data Engineering › Spotted · 42 points, 11 comments
text: Instant MySQL database branches on ZFS clones, clustered across VMs with ProxySQL routing

### Agentic AI Designs an Analog Synthesizer

kind: story · source: Hacker News · published: 2026-11-16 · link: https://cpldcpu.github.io/2026/11/14/touchsynth/ · discussion: https://news.ycombinator.com/item?id=50512933
digest: shown under AI Agents › Spotted · 14 points, 2 comments
text: An analog monophonic synthesizer built from ~200 components, with a transistor ladder filter and touch keys. Circuit, simulation, PCB, firmware and most of the bring-up were done by Claude Opus 5.5.

### Google AI Ultra Subscription Not Worth It

kind: story · source: Hacker News · published: 2026-11-16 · link: https://www.reddit.com/r/google_antigravity/comments/1xx9nl3/google_ai_ultra_subscription_not_worth_it/ · discussion: https://news.ycombinator.com/item?id=50514224
digest: shown under AI Models & Labs › Spotted · 9 points, 0 comments
text: (the source gave no text)

### Show HN: Skillset: Easily curate and install agent skills collection

kind: story · source: Hacker News · published: 2026-11-15 · link: https://github.com/itsmeyaw/skillset · discussion: https://news.ycombinator.com/item?id=50511761
digest: shown under AI Agents › Spotted · 5 points, 0 comments
text: CLI to easily manage your skills. Start saving token by installing only necessary skills!

### Show HN: Canban – Kanban and Workflow and Herdr Workbench for CLI Agents

kind: story · source: Hacker News · published: 2026-11-15 · link: https://github.com/jjyr/canban · discussion: https://news.ycombinator.com/item?id=50508535
digest: shown under AI Agents › Agent Tooling › herdr
text: Canban = Kanban + herdr workbench.

### Show HN: Attest – Test what AI agents do, not just what they say

kind: story · source: Hacker News · published: 2026-11-15 · link: https://attest-framework.github.io/ · discussion: https://news.ycombinator.com/item?id=50509107
digest: shown under AI Agents › Spotted · 7 points, 0 comments
text: Test what your AI agent says, which tools it calls and what it changes. Replay recorded model responses and enforce checks in CI.

### Parents pay $75k for Alpha's AI school. Half of its students missed math target

kind: story · source: Hacker News · published: 2026-11-15 · link: https://fortune.com/2026/11/14/alpha-school-ai-students-tuition-learning-goals/ · discussion: https://news.ycombinator.com/item?id=50509953
digest: shown under AI Models & Labs › Spotted · 65 points, 64 comments
text: Only 42% of Alpha students hit its 2x learning goal in math and reading, internal data show, as 2,600 public school students now use its software.

### A 27-byte telemetry response nobody reads freezes Claude Desktop every two days

kind: story · source: Hacker News · published: 2026-11-14 · link: https://blog.dfb.sh/blog/claude-desktop-freeze/ · discussion: https://news.ycombinator.com/item?id=50499446
digest: shown under AI Agents › Spotted · 9 points, 1 comment
text: Claude Desktop on Linux froze dead every couple of days, with empty logs. It took two months and a 1.5 TiB core dump to find out why. The app never reads a 27-byte telemetry reply, and Chromium keeps a file descriptor open for each one until the renderer runs out of them. Chromium says it works as i

### I run multiple Claude Code accounts on one Mac

kind: story · source: Hacker News · published: 2026-11-15 · link: https://twitter.com/viborc/status/2121941174374039788 · discussion: https://news.ycombinator.com/item?id=50506993
digest: shown under AI Agents › Coding Agents & Assistants › Claude Code
text: How I run multiple Claude Code accounts on one Mac

### Please Implement A Quorum Database

kind: story · source: Lobste.rs · published: 2026-11-15 · link: https://transactional.blog/talk/please-implement-a-quorum-database · discussion: https://lobste.rs/s/hgicaq/please_implement_quorum_database
digest: shown under Data Engineering › Spotted · 11 points, 0 comments
text: Leaderless replication is fun and practical.

### Designing nextest's install scripts

kind: story · source: Lobste.rs · published: 2026-11-15 · link: https://sunshowers.io/posts/nextest-install-scripts/ · discussion: https://lobste.rs/s/tbpfcn/designing_nextest_s_install_scripts
digest: shown under AI Agents › Spotted · 3 points, 0 comments
text: How I built the scripts carefully using coding agents.

### Give Your Voice Agent Hands: Let It Act Across Sales and Marketing

kind: story · source: Dev.to · published: 2026-11-15 · link: https://dev.to/therealmrmumba/give-your-voice-agent-hands-let-it-act-across-sales-and-marketing-fn2 · discussion: https://dev.to/therealmrmumba/give-your-voice-agent-hands-let-it-act-across-sales-and-marketing-fn2
digest: shown under AI Agents › Spotted · 39 reactions, 0 comments
text: The call ends. The admin starts. Maya is an account executive. She just finished a good

### I Told My Agent Who Sent the Message. It Mostly Stopped Saying We Were Talking.

kind: story · source: Dev.to · published: 2026-11-15 · link: https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8 · discussion: https://dev.to/kenielzep97/i-told-my-agent-who-sent-the-message-it-mostly-stopped-saying-we-were-talking-12o8
digest: shown under AI Agents › Spotted · 22 reactions, 12 comments
text: This is the line: AUTOMATED SCHEDULER CHECK: sender=scheduler, not Keniel; Keniel is not

===== 2026-11-16 · Trends (weekly tables) =====

## Agents & coding tools

### 🚀 Agent & Coding Tool Radar

_New tools (🆕: created or listed in the last 14 days) first, then each source's top movers; 🔥 also on last week's Trends page. OpenRouter: the app's rank this week / this month among OpenRouter apps, its tokens in the last 7 days. npm: downloads in the last 7 days. OpenRouter and npm "vs previous week": against the row's figure on last week's page, none when it was not there. GitHub: total stars (stars gained in the last 7 days, % on a week ago)._

| Tool                                                                                             | Source          | Signal                                                                                                          | Summary                                                                                                                                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Bitbison triage](https://bitbison.io/)                                                          | OpenRouter      | 🆕 week #100 / month —, 44.7B tokens/week                                                                       | Bitbison triage analyzes build activity to catch supply chain attacks before release and lets you block releases that fail your security checks.                                                                                                                                                      |
| 🔥 [Kilo Code](https://kilocode.ai/)                                                             | OpenRouter      | week #5 / month #5, 7.03T tokens/week (+46% vs previous week)                                                   | Kilo Code is an open-source AI coding agent that works across VS Code, JetBrains, and CLI to help developers ship code faster with agentic workflows.                                                                                                                                                 |
| [@sma1lboy/rove](https://www.npmjs.com/package/@sma1lboy/rove)                                   | npm             | 28,686 downloads/week                                                                                           | @sma1lboy/rove is an agentic development environment (ADE) for your terminal that runs Claude Code, Codex, Copilot and more side by side in isolated worktrees, handing tasks to each other.                                                                                                          |
| 🔥 [Strix](https://strix.ai/)                                                                    | OpenRouter      | week #9 / month #12, 2.56T tokens/week (+45% vs previous week)                                                  | Strix are open-source AI hackers that find and validate vulnerabilities in your code, APIs, and infrastructure and open fix PRs.                                                                                                                                                                      |
| [OpenHands](https://docs.all-hands.dev/)                                                         | OpenRouter      | week #14 / month #18, 1.00T tokens/week                                                                         | OpenHands is an AI coding agent that can run commands, browse the web, and call APIs.                                                                                                                                                                                                                 |
| 🔥 [Hermes Agent](https://hermes-agent.nousresearch.com/)                                        | OpenRouter      | week #3 / month #4, 13.02T tokens/week (+5.1% vs previous week)                                                 | Hermes Agent is an open-source, self-improving AI agent by Nous Research that runs persistently with memory across sessions, builds reusable skills from experience, and comes with 40+ built-in tools including web search, browser automation, and vision plus scheduled automations and subagents. |
| [@earendil-works/pi-coding-agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) | npm             | 6,307,903 downloads/week                                                                                        | @earendil-works/pi-coding-agent is a coding agent CLI with read, bash, edit, write tools and session management.                                                                                                                                                                                      |
| 🔥 [Claude Code](https://claude.ai/code)                                                         | OpenRouter      | week #4 / month #3, 10.80T tokens/week (+7.5% vs previous week)                                                 | Claude Code is Anthropic's agentic coding tool that reads your entire codebase, plans and executes changes across files, runs tests, and iterates on failures from natural language prompts.                                                                                                          |
| 🔥 [pi](https://pi.dev/)                                                                         | OpenRouter      | week #6 / month #6, 4.00T tokens/week (-4.8% vs previous week)                                                  | pi is a coding agent described as "yours" among many coding agents.                                                                                                                                                                                                                                   |
| [Codex](https://openai.com/codex/)                                                               | OpenRouter      | week #7 / month #7, 3.42T tokens/week                                                                           | Codex is a coding agent that helps you build and ship with AI.                                                                                                                                                                                                                                        |
| 🔥 [OpenClaw](https://openclaw.ai/)                                                              | OpenRouter      | week #8 / month #8, 2.69T tokens/week (-46% vs previous week)                                                   | OpenClaw is an open-source AI agent that connects to your messaging apps and takes real actions on your behalf, from running commands and browsing the web to managing files and sending emails.                                                                                                      |
| 🔥 [omp](https://omp.sh/)                                                                        | OpenRouter; npm | week #11 / month #10, 2.13T tokens/week (-36% vs previous week); 295,519 downloads/week (+34% vs previous week) | omp is a coding agent CLI with read, bash, edit, write tools and session management.                                                                                                                                                                                                                  |

### 🧑‍💻 Coding Agents

| Project                                                                                        | Lang       | Stars (total / this week, %) | Summary                                                                                                                                                                                                                                                                           |
| :--------------------------------------------------------------------------------------------- | :--------- | ---------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [google/elephant-goldfish-model](https://github.com/google/elephant-goldfish-model)            | Python     |        20,026 (+5,060, +34%) | google/elephant-goldfish-model is an open-source plugin for designing and reviewing software with agents.                                                                                                                                                                         |
| 🔥 [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)                                     | TypeScript |         30,576 (+1,462, +5%) | QwenLM/qwen-code is an open-source AI coding agent that lives in your terminal.                                                                                                                                                                                                   |
| 🔥 [superplanehq/superplane](https://github.com/superplanehq/superplane)                       | Go         |           10,060 (+828, +9%) | superplanehq/superplane is an open source factory for one-shot engineering.                                                                                                                                                                                                       |
| 🔥 [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored)     | TypeScript |           4,293 (+681, +19%) | PurpleDoubleD/locally-uncensored is an all-in-one local AI studio for desktop with chat, image and video generation, and a coding agent in one free, open source app that runs on Windows and Linux with no Docker, no terminal, no cloud required.                               |
| 🔥 [Gentleman-Programming/gentle-shell](https://github.com/Gentleman-Programming/gentle-shell) | TypeScript |           2,681 (+598, +29%) | Gentleman-Programming/gentle-shell is a Pi-native workspace for AI-assisted development bringing parallel coding agents, live tasks, Git diffs, persistent memory, and permission controls into one terminal interface powered by Gentle AI and Organic Driven Development (ODD). |
| 🔥 [WhiteTowerAI/ohmygame](https://github.com/WhiteTowerAI/ohmygame)                           | TypeScript |           2,263 (+494, +28%) | WhiteTowerAI/ohmygame is an open-source studio for making games with AI, your own one-person game studio with game canvas and bring your own key.                                                                                                                                 |
| 🔥 [JetBrains/thinkrail](https://github.com/JetBrains/thinkrail)                               | TypeScript |          8,295 (+290, +3.6%) | JetBrains/thinkrail is an agentic IDE that gets better every time you use it.                                                                                                                                                                                                     |
| 🔥 [unstablebuild/rune](https://github.com/unstablebuild/rune)                                 | Go         |           1,795 (+206, +13%) | unstablebuild/rune is a fast, GPU-accelerated, full-featured IDE and terminal multiplexer suitable for both automatic and manual programming.                                                                                                                                     |

### 🧰 Agent Harnesses & Frameworks

| Project                                                                                   | Lang       | Stars (total / this week, %) | Summary                                                                                                                                                                                                                                                                    |
| :---------------------------------------------------------------------------------------- | :--------- | ---------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔥 [ccch1mneyyy/dsh-Go](https://github.com/ccch1mneyyy/dsh-Go)                            | Dart       |        24,256 (+7,687, +46%) | ccch1mneyyy/dsh-Go is dsh-go, a DeepSeek Harness that runs natively on mobile and can remote control your computer.                                                                                                                                                        |
| [alibaba/open-code-review](https://github.com/alibaba/open-code-review)                   | Go         |       52,520 (+2,849, +5.7%) | alibaba/open-code-review is a hybrid architecture code review tool with deterministic pipelines + LLM Agent, precise line-level comments, and a built-in multi-language ruleset covering NPE, thread-safety, XSS, and SQL injection, compatible with OpenAI and Anthropic. |
| [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop)                     | JavaScript |       19,295 (+1,676, +9.5%) | dataelement/dsh-desktop is DSHDesktop, the DeepSeek Harness desktop version.                                                                                                                                                                                               |
| 🔥 [lobehub/lobehub](https://github.com/lobehub/lobehub)                                  | TypeScript |       85,610 (+1,131, +1.3%) | lobehub/lobehub is LobeHub, a platform to add super-agents to your team's existing chats that take on work by themselves and get better every week.                                                                                                                        |
| [mdiri-ai/SoduWork](https://github.com/mdiri-ai/SoduWork)                                 | JavaScript |               1,014 (+1,001) | mdiri-ai/SoduWork is an AI-native engine for teams and their agents that is multi-harness, multi-agent, and self-hosted.                                                                                                                                                   |
| 🔥 [FailproofAI/failproofai](https://github.com/FailproofAI/failproofai)                  | TypeScript |           9,100 (+856, +10%) | FailproofAI/failproofai provides observability and enforcement for AI agent harnesses, capturing every run and ensuring runtime reliability with policy enforcement.                                                                                                       |
| [converge-ai-labs/agent-foundation](https://github.com/converge-ai-labs/agent-foundation) | Python     |           1,298 (+386, +42%) | converge-ai-labs/agent-foundation is a13n, a platform to build, run, and manage AI agents at scale on your own infrastructure with a built-in harness, durable execution, multi-provider support, and a management console.                                                |
| 🔥 [heymrun/heym](https://github.com/heymrun/heym)                                        | Python     |          1,685 (+150, +9.8%) | heymrun/heym lets you build agentic systems, orchestrate agents, automate business processes, inspect every execution, and keep humans in control, deployable on your own infrastructure.                                                                                  |

### 🕸️ Multi-Agent & Orchestration

| Project                                                                                        | Lang       | Stars (total / this week, %) | Summary                                                                                                                                                                                                                      |
| :--------------------------------------------------------------------------------------------- | :--------- | ---------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [pingdotgg/t3code](https://github.com/pingdotgg/t3code)                                        | TypeScript |        62,023 (+9,091, +17%) | pingdotgg/t3code is the best way to control Claude Code, Codex and more from any computer or phone.                                                                                                                          |
| 🔥 [paperclipai/paperclip](https://github.com/paperclipai/paperclip)                           | TypeScript |      114,220 (+1,822, +1.6%) | paperclipai/paperclip is the open-source app everyone uses to manage agents at work.                                                                                                                                         |
| [Tencent/LoopForge](https://github.com/Tencent/LoopForge)                                      | Go         |        2,046 (+1,767, +633%) | Tencent/LoopForge provides self-hosted workflows for coding-agent delivery, orchestrating CodeBuddy, Codex, and Claude Code with scripts and human approval gates, including local workflows for coding assistants.          |
| 🔥 [agent-of-empires/agent-of-empires](https://github.com/agent-of-empires/agent-of-empires)   | Rust       |           4,559 (+668, +17%) | agent-of-empires/agent-of-empires manages multiple Claude Code and OpenCode agents from TUI or Web for mobile access, also supporting Mistral Vibe, Codex CLI, Gemini CLI, Pi.dev, Copilot CLI, and Factory Droid Coding.    |
| 🔥 [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator) | TypeScript |         14,784 (+484, +3.4%) | OrchestratorInc/agent-orchestrator plans, runs, and supervises fleets of agents from task to merged PR with desktop (macOS, Windows, Linux) and iPhone & Android apps, supporting Claude Code, Codex, and 35+ coding agents. |
| 🔥 [sandbox-quantum/switch](https://github.com/sandbox-quantum/switch)                         | Python     |          4,538 (+284, +6.7%) | sandbox-quantum/switch provides open-source AI teammates in Slack, Teams, Discord, Telegram, and Mattermost, self-hostable with any agent harness and any model.                                                             |
| [zeronsh/zeron](https://github.com/zeronsh/zeron)                                              | Rust       |            3,690 (+210, +6%) | zeronsh/zeron is a native control plane for Claude Code, Codex, Cursor, Devin and other coding agents.                                                                                                                       |
| [open-mercato/cezar](https://github.com/open-mercato/cezar)                                    | TypeScript |           1,065 (+96, +9.9%) | open-mercato/cezar is an open-source orchestrator and ADE for running Claude Code, Codex, OpenCode, Pi and other AI coding agents in parallel locally or 24/7 on your own server.                                            |

### 🔌 Agent Tooling

| Project                                                                      | Lang       | Stars (total / this week, %) | Summary                                                                                                                                                                                                                                                               |
| :--------------------------------------------------------------------------- | :--------- | ---------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [anthropics/skills](https://github.com/anthropics/skills)                    | Python     |      195,587 (+6,077, +3.2%) | anthropics/skills is a public repository for Agent Skills.                                                                                                                                                                                                            |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)    | Rust       |       51,798 (+4,217, +8.9%) | vercel-labs/agent-browser is a browser automation CLI for AI agents.                                                                                                                                                                                                  |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)        | JavaScript |      118,095 (+3,889, +3.4%) | addyosmani/agent-skills provides production-grade engineering skills for AI coding agents.                                                                                                                                                                            |
| [backnotprop/plannotator](https://github.com/backnotprop/plannotator)        | TypeScript |        12,134 (+1,719, +17%) | backnotprop/plannotator is a workspace to stay in the loop and on top of agents to shape, decide, plan, annotate, review code, share with team, and send all feedback to agents with one click.                                                                       |
| 🔥 [microsoft/TokenEconomizer](https://github.com/microsoft/TokenEconomizer) | Python     |         6,821 (+1,492, +28%) | microsoft/TokenEconomizer provides experience-driven black-box cost control for coding agents.                                                                                                                                                                        |
| 🔥 [haydenschmitty/floorplan](https://github.com/haydenschmitty/floorplan)   | JavaScript |         4,574 (+1,301, +40%) | haydenschmitty/floorplan is an interactive, plain-English map of your codebase drawn by Claude or Codex.                                                                                                                                                              |
| 🔥 [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill)         | Python     |         6,096 (+1,258, +26%) | kajisho5/ffmpeg-skill is a local video editor for coding agents with 42 FFmpeg tools, a machine-readable contract, and an MCP server for Claude Code, Cursor, and Codex, supporting cut, captions, reframe, loudness, and platform exports with no cloud or API keys. |
| 🔥 [ZiChuanLan/agent-purge](https://github.com/ZiChuanLan/agent-purge)       | JavaScript |           1,857 (+370, +25%) | ZiChuanLan/agent-purge lets you replace or inject system prompts across codex, claude, opencode, grok, omp, hermes, pi, zcode with a local web console.                                                                                                               |

### 🤖 Other Agents

| Project                                                                             | Lang       | Stars (total / this week, %) | Summary                                                                                                                                                                                                       |
| :---------------------------------------------------------------------------------- | :--------- | ---------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot)               | TypeScript |        23,796 (+5,463, +30%) | milind-soni/OpenMausBot is an open-source Grok Bot alternative with a virtual machine that bots can use.                                                                                                      |
| [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | Python     |       72,659 (+4,548, +6.7%) | ZhuLinsen/daily_stock_analysis is an LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs. |

## Skills: PRs and requests this week

### Open PRs worth watching

- **#2211** – mcp-builder: reports incomplete evaluation runs instead of crashing or scoring partial output; handles `max_tokens` and refusal stops correctly. [PR #2211](https://github.com/anthropics/skills/pull/2211)
- **#2219** – skill-creator: adds Origin/Host/Content-Type checks to the eval viewer feedback endpoint, closing a CSRF vector. [PR #2219](https://github.com/anthropics/skills/pull/2219)
- **#2216** – claude-api: adds Agent SDK row to routing table and points to a fetchable local reference, fixing scope/docs mismatch. [PR #2216](https://github.com/anthropics/skills/pull/2216)
- **#1903** – pdf: streams PDF-to-image conversion page-by-page to bound memory on long documents. [PR #1903](https://github.com/anthropics/skills/pull/1903)
- **#2198** – skill-creator: isolates each `run_eval` probe in its own temp project and accepts documented frontmatter keys. [PR #2198](https://github.com/anthropics/skills/pull/2198)

### Merged this week

_None._

### Requests

- **#2220** – Skill-creator entrypoint (33 KB) exceeds some agent environments’ ~15 KiB budget; asks for a bounded entrypoint. [Issue #2220](https://github.com/anthropics/skills/issues/2220)
- **#2201** – mcp-builder evaluation loop answers only the first `tool_use` block and misclassifies `max_tokens`/refusal stops as final answers. [Issue #2201](https://github.com/anthropics/skills/issues/2201)
- **#2207** – claude-api skill excludes Agent SDK but links to an oversized docs page agents can’t fetch in one read. [Issue #2207](https://github.com/anthropics/skills/issues/2207)

## Models

### OpenRouter usage

Top models by tokens (prompt + completion) on OpenRouter on 2026-11-15, one day's snapshot. Last week: the model's rank on last week's page, new when it was not ranked there.

|   # | Model                                                                                                          | Tokens | Last week |
| --: | :------------------------------------------------------------------------------------------------------------- | -----: | :-------: |
|   1 | [deepseek/deepseek-v4.1-flash-20261017](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20261017)           | 59.23T |     1     |
|   2 | [tencent/hy4-20261104](https://openrouter.ai/tencent/hy4-20261104)                                             | 18.12T |     4     |
|   3 | [deepseek/deepseek-v4.1-flash-20260910](https://openrouter.ai/deepseek/deepseek-v4.1-flash-20260910)           | 15.55T |     2     |
|   4 | [z-ai/glm-5.3-flash-20260826](https://openrouter.ai/z-ai/glm-5.3-flash-20260826)                               | 11.90T |     3     |
|   5 | [openai/gpt-6-luna-20260922](https://openrouter.ai/openai/gpt-6-luna-20260922)                                 |  7.85T |     5     |
|   6 | [anthropic/claude-opus-5.5-20260921](https://openrouter.ai/anthropic/claude-opus-5.5-20260921)                 |  6.98T |     7     |
|   7 | [stepfun/step-5-preview-20261008](https://openrouter.ai/stepfun/step-5-preview-20261008)                       |  6.41T |     6     |
|   8 | [xiaomi/mimo-v2.6-flash-20260921](https://openrouter.ai/xiaomi/mimo-v2.6-flash-20260921)                       |  4.23T |    new    |
|   9 | [z-ai/glm-5.3-20260816](https://openrouter.ai/z-ai/glm-5.3-20260816)                                           |  3.76T |    12     |
|  10 | [openai/gpt-6.1-sol-20260929](https://openrouter.ai/openai/gpt-6.1-sol-20260929)                               |  3.71T |    11     |
|  11 | [moonshotai/kimi-k3.1-pro-20261023](https://openrouter.ai/moonshotai/kimi-k3.1-pro-20261023)                   |  3.47T |     9     |
|  12 | [minimax/minimax-m3.1-flash-20261019](https://openrouter.ai/minimax/minimax-m3.1-flash-20261019)               |  3.38T |     8     |
|  13 | [deepseek/deepseek-v4-flash-20260731](https://openrouter.ai/deepseek/deepseek-v4-flash-20260731)               |  3.28T |    14     |
|  14 | [nvidia/nemotron-3-ultra-550b-a55b-20260604](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b-20260604) |  3.19T |    16     |
|  15 | [nvidia/nemotron-3.5-super-vl-20261015](https://openrouter.ai/nvidia/nemotron-3.5-super-vl-20261015)           |  3.00T |    17     |
|  16 | [meta/muse-spark-1.3-contributor-20260902](https://openrouter.ai/meta/muse-spark-1.3-contributor-20260902)     |  2.99T |    18     |
|  17 | [typesafe/jev-1.13-20260917](https://openrouter.ai/typesafe/jev-1.13-20260917)                                 |  2.81T |    15     |
|  18 | [anthropic/claude-haiku-5.5-20261007](https://openrouter.ai/anthropic/claude-haiku-5.5-20261007)               |  2.76T |    20     |
|  19 | [anthropic/claude-sonnet-5.5-20260928](https://openrouter.ai/anthropic/claude-sonnet-5.5-20260928)             |  2.55T |    new    |
|  20 | [deepseek/deepseek-v4-flash-20260423](https://openrouter.ai/deepseek/deepseek-v4-flash-20260423)               |  2.17T |    new    |

### Hugging Face trending

_Ranked by likes gained in the last 7 days; 🔥 also on last week's Trends page; quantised copies of a release share its row._

|   # | Model                                                                                                                                          | Likes (total) | Downloads (30 days) | Summary                                            |
| --: | :--------------------------------------------------------------------------------------------------------------------------------------------- | ------------: | ------------------: | :------------------------------------------------- |
|   1 | [MiniMaxAI/MiniMax-H3-Image](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image)                                                                |         1,228 |             571,067 | text-to-image model, other license.                |
|   2 | 🔥 [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (+ [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)) |        20,162 |           6,547,772 | 27B image-text-to-text model, Apache-2.0 license.  |
|   3 | 🔥 [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)                                                                             |        12,120 |           2,754,355 | image-to-video model, other license.               |
|   4 | [Comfy-Org/MiniMax-H3-Image](https://huggingface.co/Comfy-Org/MiniMax-H3-Image)                                                                |           434 |           1,973,388 | text-to-image model, other license.                |
|   5 | [Zyphra/ZONOS3-Mini](https://huggingface.co/Zyphra/ZONOS3-Mini)                                                                                |           419 |              39,862 | text-to-speech model, Apache-2.0 license.          |
|   6 | [thinkingmachines/Inkling-2-Small](https://huggingface.co/thinkingmachines/Inkling-2-Small)                                                    |           363 |               7,329 | 594B image-text-to-text model, Apache-2.0 license. |
|   7 | [higurashi-ai/Haru-4B](https://huggingface.co/higurashi-ai/Haru-4B)                                                                            |           348 |               2,098 | 5.2B audio-to-audio model, Apache-2.0 license.     |
|   8 | 🔥 [speridlabs/idol](https://huggingface.co/speridlabs/idol)                                                                                   |         2,380 |              33,423 | image-to-3d model, Apache-2.0 license.             |
|   9 | [Edge0/Edge0-145B-NVFP4](https://huggingface.co/Edge0/Edge0-145B-NVFP4)                                                                        |           328 |              41,606 | 145B text-generation model, other license.         |
|  10 | 🔥 [moonshotai/Kimi-K3.1-Pro](https://huggingface.co/moonshotai/Kimi-K3.1-Pro)                                                                 |         2,118 |              46,766 | 2.7T image-text-to-text model, other license.      |
|  11 | 🔥 [NousResearch/Arete-27B](https://huggingface.co/NousResearch/Arete-27B)                                                                     |           621 |               7,497 | 27B text-generation model, Apache-2.0 license.     |
|  12 | 🔥 [black-forest-labs/flux-3-image-klein-comfy](https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy)                             |         3,268 |           1,182,267 | image-to-image model, other license.               |

## Research

| Paper                                                                                                                                           | Summary                                                                                                                                                                                                                                                                                                    |
| :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Hibana: Fast Agentic Inference on Unified-Memory Devices](http://arxiv.org/abs/2611.10469v1)                                                   | Hibana: Fast Agentic Inference on Unified-Memory Devices — an inference engine for unified-memory devices that co-optimizes model representation, memory management, and decoding strategy.                                                                                                                |
| [Code as Explanations: Executable and Verifiable LLM Explanations](http://arxiv.org/abs/2611.14704v1)                                           | Code as Explanations: Executable and Verifiable LLM Explanations — proposes code explanations, programs that explain LLM behavior across a dataset and enable automatic verification by execution.                                                                                                         |
| [Don't Just Trust Your Memory: Evidence-Linked Memory Reduces Memory-Induced Degradation in LLM Agents](http://arxiv.org/abs/2611.14320v1)      | Don't Just Trust Your Memory: Evidence-Linked Memory Reduces Memory-Induced Degradation in LLM Agents — introduces WikiTrace, evidence-linked memory that reduces memory-induced degradation by providing agents with trajectories to verify lessons.                                                      |
| [Mitigating Agentic Deception via Evaluation-Side Partially Observable Games](http://arxiv.org/abs/2611.12835v1)                                | Mitigating Agentic Deception via Evaluation-Side Partially Observable Games — addresses agentic deception by modeling evaluation as partially observable games to check faithfulness of reasoning and tool use beyond final outcomes.                                                                      |
| [Actor, Judge, or Teacher? Understanding Decision Models in Long-Horizon Agents](http://arxiv.org/abs/2611.17167v1)                             | Actor, Judge, or Teacher? Understanding Decision Models in Long-Horizon Agents — compares decision models and LLMs as actors, judges, and teachers on ALFWorld and WebShop, finding all six models are pulled toward similar actor performance.                                                            |
| [LiveAsset: Learning Intent Assets from Corrective Interactions for Agent Runtime Control](http://arxiv.org/abs/2611.11560v1)                   | LiveAsset: Learning Intent Assets from Corrective Interactions for Agent Runtime Control — proposes LiveAsset to learn intent assets from multi-turn corrections by interpreting each correction against preceding and revised outcomes for runtime control.                                               |
| [When Experience Becomes a Backdoor: Poisoning Self-Evolving LLM Agents via Failure-Aware Task Optimization](http://arxiv.org/abs/2611.10542v1) | When Experience Becomes a Backdoor: Poisoning Self-Evolving LLM Agents via Failure-Aware Task Optimization — studies task-level backdoor attacks where poisoned evolution tasks implant malicious rules into skills constructed by a trusted evolver.                                                      |
| [OverServe: Resource Amplification Attacks on SaaS Agents via Tool--Prompt Co-Design](http://arxiv.org/abs/2611.14808v1)                        | OverServe: Resource Amplification Attacks on SaaS Agents via Tool--Prompt Co-Design — presents OverServe, a multi-agent framework that co-designs tool prompts to exploit agent completion decisions and amplify resource consumption in SaaS deployments.                                                 |
| [Can LLM Agents Organize Their Own Memory?](http://arxiv.org/abs/2611.11929v1)                                                                  | Can LLM Agents Organize Their Own Memory? — introduces self-organized memory (SoMem), a framework where agents store memory in linked documents and autonomously decide what to summarize, how to group, and when to revise topics.                                                                        |
| [PACE: Keeping the Right Tokens in the KV Cache Is Not Enough for Long-Horizon LLM Agents](http://arxiv.org/abs/2611.10240v1)                   | PACE: Keeping the Right Tokens in the KV Cache Is Not Enough for Long-Horizon LLM Agents — shows that in 100K-token coding sessions on Qwen3-8B with a 2,048-token budget, a planner-guided policy keeping over 99% of needed tokens still sees accuracy fall from 93% to 64% as definition-use gaps grow. |

## Most discussed

| Story                                                                                                                                                                                                | Source | Discussion                                                                                                                               | Summary                                                                                                                                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [What unshare -n leaves behind: building a boundary for an AI recon agent](https://dev.to/gnomeman4201/what-unshare-n-leaves-behind-building-a-boundary-for-an-ai-recon-agent-75b)                   | Dev.to | [15 reactions, 22 comments](https://dev.to/gnomeman4201/what-unshare-n-leaves-behind-building-a-boundary-for-an-ai-recon-agent-75b)      | The author examines what Linux's unshare -n leaves exposed while building a network isolation boundary for an AI reconnaissance agent, noting the sandbox passed 13 isolation tests.       |
| [Stop Asking LLMs to Do Math: Client-Side Functions in Flutter GenUI with bloc_signals](https://dev.to/gde/stop-asking-llms-to-do-math-client-side-functions-in-flutter-genui-with-blocsignals-23bh) | Dev.to | [16 reactions, 16 comments](https://dev.to/gde/stop-asking-llms-to-do-math-client-side-functions-in-flutter-genui-with-blocsignals-23bh) | The article explains why client-side functions are critical for Generative UI, showing how bloc_signals_genui converts catalog functions into 0ms synchronous reactive signals in Flutter. |
| [Can't Beat Free: Gemma 4 31B on AMD Token Lab, with a Local Chat Page and an ADK Agent](https://dev.to/gde/cant-beat-free-gemma-4-31b-on-amd-token-lab-with-a-local-chat-page-and-an-adk-agent-c5b) | Dev.to | [36 reactions, 13 comments](https://dev.to/gde/cant-beat-free-gemma-4-31b-on-amd-token-lab-with-a-local-chat-page-and-an-adk-agent-c5b)  | AMD Token Lab offers a free OpenAI-compatible API on AMD GPUs via the AMD AI Developer Program, enabling a local chat page, terminal client, and ADK agent to run Gemma 4 31B.             |

===== 2026-11-16 · AI Policy: dates (code-rendered) =====

## Coming up

Deadlines and dates in the next 30 days.

| Date       | Source   | Item                                                                                                                                                                              |
| :--------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-12-02 | Calendar | [AI Act: bans on sexual deepfakes and CSAM generators; Art. 50(2) transition ends](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) |
