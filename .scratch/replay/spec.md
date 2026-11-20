# Replay a digest day

Status: ready-for-agent

## Goal

Rebuild a past day's pages with the current code from that day's own network responses, without fetching anything again. Use case: a fix lands (2026-11-20: no hot-issue counts, a higher hot-issue bar) and the day it was meant for should show it.

A replay can only rebuild a day whose run was recorded. Days before the recorder ships (2026-11-20 included) cannot be replayed.

## Why record at `fetch`, not the fetched data

Selection runs inside the fetchers: `fetchHotIssues` returns `selectHotIssues`' result, `fetchProject` drops prereleases, `fetchHnData` applies the Spotted pool filter. A capture of `fetchAllData`'s return value would replay those old decisions, so a change like the new hot-issue bar would not show. Every network call, the GitHub, feed, Jev and both LLM SDKs' calls, goes through Node's global `fetch` (`fetchOk`, `githubGet`, the raw `fetch` calls in `src/sources/`, `src/core/jev.ts`). One wrapper there records every response, and on replay it serves them, so all code from the first fetcher on runs again.

## Design

1. **Recorder** (`src/core/recording.ts`). With `DIGEST_RECORD=<file>`, wrap `globalThis.fetch` once at startup. Per request, store the key (method, URL with secrets redacted, a hash of the body) and the response (status, the headers the code reads: `content-type`, `retry-after`, plus whatever a grep of `headers.get(` finds then, and the body text). A key holds a list of responses in order, because retries repeat a URL. The LLM hosts are not recorded: their prompts are already in the `llm-prompts` artifact. The GitHub issue and label writes (`createGitHubIssue`, labels) are never recorded. The file header holds the run's start time, `GITHUB_SHA` and the CST date. Written gzipped.
2. **Secrets**: the repo is public, so anyone signed in can download its artifacts. Store no request headers. Check every keyed source (api.data.gov, Open States, AgentMail, Jev, OpenRouter, GitHub) for a key in the URL or body, and redact it from the key before hashing. The AgentMail responses carry inbox addresses: check whether they are personal before recording them.
3. **Clock**: one `nowMs()` (`src/core/clock.ts`), pinned to the header's start time on replay, used at every unpinned site: `src/sources/arxiv.ts:485`, `labs.ts:391`, `lobsters.ts:120`, `openrouter.ts` defaults, `src/core/github.ts:175`, `src/trending/compose.ts:375`, `src/reports/markdown.ts:626/636`, `src/reports/pages.ts:603`, `src/index.ts:385`. Without it, the `since=` parameters change and no key matches.
4. **Replay** (`scripts/replay.ts <YYYY-MM-DD>`):
   - Download the day's recording (artifact `digest-recording-<run id>`, found by the day's digest commit).
   - Make a git worktree of the current code, and restore every `digests/*.json` (states and verdict caches) from the recording's `GITHUB_SHA`, so the run starts from the state that day's run started from.
   - Run `main()` with `DIGEST_REPLAY=<file>`: the wrapper serves recorded responses. A miss on a non-LLM host fails as a network error, so the fetcher returns its empty value, and is logged. A Jev miss goes to the keyword fallback unless `--live-jev` is given (credits: a replay spike emptied them on 2026-11-11). LLM calls go live.
   - Write nothing outside the worktree, open no issues, send no message.
5. **Output**: the replayed day folder in `.scratch/replay/<date>/`, with a diff against the published files. `--publish` copies the reports and `highlights.json` into `digests/<date>/` and edits the bodies of that day's existing issues (no new issues). Allowed only for the latest digest day: later days' states (hot issues shown once ever, the Spotted log) were built from the original pages, so a republished older day can repeat or lose items. `--notify` then runs `pnpm notify` for that date.
6. **Workflow**: the daily workflow sets `DIGEST_RECORD` and uploads the file as an artifact next to `llm-prompts-<run id>`, kept 90 days (GitHub's maximum; the maintainer's choice, 2026-11-20).
7. **Replay workflow** (`.github/workflows/replay-digest.yml`, the maintainer's choice, 2026-11-20): `workflow_dispatch` with inputs `date` (required), `publish` and `notify` (both default false) and `live_jev` (default false). It runs `scripts/replay.ts` with the same flags, so the script stays the one implementation and the workflow adds no logic of its own.
   - `concurrency: daily-digest` (the daily workflow's group, queued, not cancelled), so a replay never overlaps a daily run that moves the same state files.
   - Without `publish`: it uploads the replayed folder and the diff as an artifact (`replay-<date>-<run id>`) and writes the diff's summary to `$GITHUB_STEP_SUMMARY`. Nothing is committed.
   - With `publish`: the script's latest-day check applies. The workflow commits only `digests/<date>/` (message `replay: <date>`), pushes, edits that day's issues and starts `deploy-site.yml`, as the daily workflow does, since a push made with `GITHUB_TOKEN` starts no workflow. It never commits the state files from the worktree.
   - Permissions: `contents: write`, `issues: write`, `actions: write` (download the recording from the daily run, start the deploy). Secrets: the daily workflow's LLM settings; `TYPESAFE_API_KEY` only when `live_jev` is set.

## Out of scope (first version)

- The weekly pages (Trends, Weekly Diff): `loadWeek` and the star history make their own GitHub calls and read the week's saved days. Add them once the daily replay works.
- Reusing the captured LLM answers for prompts that did not change. That would make a replay cheaper and change only what the code change touches. It is a good second step.

## Done when

- With unchanged code and the network blocked, a replay of a recorded day has no misses, and its `candidates.json` and Jev traces are byte-identical to the published ones.
- With the 2026-11-20 hot-issue changes applied to such a day, the replayed agents page shows no counts and only issues over the new bar.
- The replay workflow, dispatched without `publish` for a recorded day, uploads the replayed folder and a diff and commits nothing; with `publish` on an older day, it fails before any commit.
- The recording's size is measured on the first CI run (a local `pnpm start` spends Jev credits and moves state), so 90 days of artifacts can be checked against it.
