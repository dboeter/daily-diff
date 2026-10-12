/**
 * GitHub API types and fetch helpers.
 * Reads GITHUB_TOKEN and DIGEST_REPO from environment at call time.
 */

import { ISSUE_LABELS, WEEKLY_REPORT_IDS } from "./i18n.ts";
import { toCstDateStr, sleep } from "./date.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoConfig {
  /** Short identifier used for filenames */
  id: string;
  /** GitHub owner/repo slug */
  repo: string;
  /** Human-readable display name */
  name: string;
  /**
   * Terms matchAgentNews looks for in news items. Defaults to the display name
   * and repo name; set this when the name is a common word (e.g. "Pi").
   */
  keywords?: string[];
}

export interface GitHubUser {
  login: string;
}

export interface GitHubLabel {
  name: string;
}

export interface GitHubReactions {
  "+1": number;
}

export interface GitHubItem {
  number: number;
  title: string;
  state: string;
  user: GitHubUser;
  labels: GitHubLabel[];
  created_at: string;
  updated_at: string;
  comments: number;
  reactions?: GitHubReactions;
  body?: string | null;
  html_url: string;
  pull_request?: unknown;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body?: string | null;
  published_at: string;
  prerelease: boolean;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env["GITHUB_TOKEN"] ?? ""}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** An HTTP error status from the API; `status` lets callers tell a rate limit from a missing repo. */
export class GitHubApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Retries after a dropped connection; waits GET_RETRY_MS, then twice that. */
const GET_RETRIES = 2;
const GET_RETRY_MS = 2000;

/**
 * GET with retries on network failures only. On 2026-10-06 the connection
 * dropped mid-body (`TypeError: terminated`, thrown by `resp.json()`) and the
 * run lost a Codex stable release. undici throws TypeError for both that and a
 * failed connect; an HTTP error status or bad JSON fails again on retry.
 *
 * `slot` runs before every attempt: search calls pass searchSlot, so a retry
 * keeps to the search rate limit too.
 */
export async function githubGet<T>(
  url: string,
  params: Record<string, string> = {},
  slot?: () => Promise<void>,
): Promise<T> {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  for (let attempt = 0; ; attempt++) {
    await slot?.();
    try {
      const resp = await fetch(u.toString(), { headers: headers() });
      if (!resp.ok) {
        throw new GitHubApiError(
          resp.status,
          `GitHub API error ${resp.status} (${url}): ${await resp.text()}`,
        );
      }
      return (await resp.json()) as T;
    } catch (err) {
      if (!(err instanceof TypeError) || attempt >= GET_RETRIES) throw err;
      console.error(`  [github] ${err} — retry ${attempt + 1}/${GET_RETRIES} (${url})`);
      await sleep(GET_RETRY_MS * 2 ** attempt);
    }
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * The search API allows 30 requests a minute, shared by fetchHotIssues and the
 * trending topic queries. Spacing every search call SEARCH_INTERVAL_MS apart
 * keeps any 60 s window under 30, however many repos and topics there are, at
 * the cost of ~2 s of fetch-phase time per request.
 */
const SEARCH_INTERVAL_MS = 2100;
let nextSearchAt = 0;

/** Wait for this caller's turn at the search API. Call right before each search request. */
export async function searchSlot(): Promise<void> {
  const now = Date.now();
  const at = Math.max(now, nextSearchAt);
  nextSearchAt = at + SEARCH_INTERVAL_MS;
  if (at > now) await sleep(at - now);
}

/** The API maximum: a weekly window on llama.cpp, which tags several builds a day, already runs to 35–70 releases. */
const RELEASES_PAGE = 100;

export interface RecentReleases {
  /** Published since `since`, newest first. */
  recent: GitHubRelease[];
  /**
   * The repo has never published a stable release: its whole history fit in
   * one page and none of it was stable. A full page of prereleases cannot tell
   * (Codex runs ~86 alphas per 100 releases), so it reads as false.
   */
  noStableYet: boolean;
}

export async function fetchRecentReleases(repo: string, since: Date): Promise<RecentReleases> {
  const releases = await githubGet<GitHubRelease[]>(`https://api.github.com/repos/${repo}/releases`, {
    per_page: String(RELEASES_PAGE),
  });
  return {
    recent: releases.filter((r) => new Date(r.published_at) >= since),
    noStableYet: releases.length < RELEASES_PAGE && releases.every(isPrerelease),
  };
}

/**
 * Tags that mark a preview build. Several projects publish nightlies and alphas
 * as ordinary releases (Qwen Code and Gemini CLI nightlies, Codex
 * `rust-v…-alpha.N`), so the API's `prerelease` flag alone misses them.
 */
// "rc" and "dev" may follow a digit with no separator (PEP 440: v0.11.0rc1,
// v0.5.0.dev3), but never a letter, so "src" or "arc" in a tag is not a match.
const PRERELEASE_TAG = /nightly|alpha|beta|preview|canary|(?<=[-.\d])rc\.?\d*\b|[-.]dev\d*\b/i;

export function isPrerelease(r: GitHubRelease): boolean {
  return r.prerelease || PRERELEASE_TAG.test(r.tag_name);
}

/**
 * Minimum comments + 👍 for an issue to count as hot. Measured 2026-10-04 on
 * the issues opened in the previous week: the ones worth reporting (Claude
 * Code auto-mode classifier failures, Codex Remote pairing loops, OpenCode
 * free-tier errors) sat at 11–98, routine bug reports at 0–9.
 */
export const HOT_ISSUE_MIN_ENGAGEMENT = 10;
/**
 * Lower bar for an issue labelled as a regression or security problem — the
 * label is a maintainer's severity signal, but an issue nobody has reacted to
 * is still not news.
 */
export const HOT_ISSUE_MIN_ENGAGEMENT_LABELLED = 3;
/** Hot issues reported per repo, so one noisy tracker cannot flood the report. */
export const HOT_ISSUES_PER_REPO = 2;
/** Matched against each label name, so "area:security" and "type: regression" count. */
const HOT_LABEL = /regression|security/i;
/**
 * Minimum look-back for an issue's creation date. Engagement takes days to
 * build: on 2026-10-04 not one tracked agent had an issue opened in the last
 * 24h with 10+ comments and 👍, while the previous week had dozens. 48h finds
 * them at the cost of an issue appearing in at most two daily reports.
 */
export const HOT_ISSUE_MIN_WINDOW_MS = 48 * 60 * 60 * 1000;

export function issueEngagement(i: GitHubItem): number {
  return i.comments + (i.reactions?.["+1"] ?? 0);
}

function isHot(i: GitHubItem): boolean {
  const labelled = i.labels.some((l) => HOT_LABEL.test(l.name));
  return issueEngagement(i) >= (labelled ? HOT_ISSUE_MIN_ENGAGEMENT_LABELLED : HOT_ISSUE_MIN_ENGAGEMENT);
}

/**
 * Pick the hot issues from a list: opened since `createdSince` and past the
 * engagement bar. Highest engagement first, capped at HOT_ISSUES_PER_REPO.
 * Long-running mega-threads are excluded by the creation date — they would
 * otherwise top the list every day.
 */
export function selectHotIssues(items: GitHubItem[], createdSince: Date): GitHubItem[] {
  return items
    .filter((i) => !i.pull_request && new Date(i.created_at) >= createdSince && isHot(i))
    .sort((a, b) => issueEngagement(b) - issueEngagement(a))
    .slice(0, HOT_ISSUES_PER_REPO);
}

/**
 * Hot issues for a repo, in one request: the 50 most-commented issues opened
 * since `since` (widened to HOT_ISSUE_MIN_WINDOW_MS), via the search API — the
 * issues list endpoint can only filter by update time, and its top-commented
 * page is all months-old mega-threads.
 *
 * Paced by searchSlot. A failure should still be treated as "no hot issues",
 * not a failed repo.
 */
export async function fetchHotIssues(repo: string, since: Date): Promise<GitHubItem[]> {
  const createdSince = new Date(Math.min(since.getTime(), Date.now() - HOT_ISSUE_MIN_WINDOW_MS));
  const result = await githubGet<{ items: GitHubItem[] }>(
    "https://api.github.com/search/issues",
    {
      q: `repo:${repo} is:issue created:>=${createdSince.toISOString().slice(0, 19)}Z`,
      sort: "comments",
      order: "desc",
      per_page: "50",
    },
    searchSlot,
  );
  return selectHotIssues(result.items, createdSince);
}

/** One `stargazers/history` bucket: a calendar week from Sunday, newest bucket first. */
export interface StarHistoryWeek {
  /** Week start, epoch seconds. */
  week: number;
  total: number;
  /** Stars per day, Sunday first. */
  days: number[];
}

/** The gain window in days, the trending page's "this week". */
export const STAR_GAIN_DAYS = 7;

const DAY_S = 24 * 60 * 60;

/**
 * Stars in the STAR_GAIN_DAYS complete days before `now`'s UTC day; today is
 * still running. The series starts at the repo's creation week, so a repo
 * created this week has one bucket, and missing days count 0.
 */
export function gainFromHistory(weeks: StarHistoryWeek[], now: Date): number {
  const today = Math.floor(now.getTime() / 1000 / DAY_S);
  let gain = 0;
  for (const w of weeks) {
    // Rounded, not floored: the docs say week starts need not be UTC midnight.
    const start = Math.round(w.week / DAY_S);
    w.days.forEach((stars, i) => {
      const day = start + i;
      if (day >= today - STAR_GAIN_DAYS && day < today) gain += stars;
    });
  }
  return gain;
}

/**
 * Stars `repo` gained in the last week, from one core-API request: the two
 * newest buckets cover STAR_GAIN_DAYS from any weekday. The bucket totals sum
 * to `stargazers_count` (cli/cli on 2026-10-08), so the gain is exact. The
 * endpoint answers 422 when "spammed": callers make these calls one at a time.
 */
export async function fetchWeeklyStarGain(repo: string, now = new Date()): Promise<number> {
  const weeks = await githubGet<StarHistoryWeek[]>(
    `https://api.github.com/repos/${repo}/stargazers/history`,
    {
      per_page: "2",
    },
  );
  return gainFromHistory(weeks, now);
}

export async function ensureLabel(name: string, color: string): Promise<void> {
  const digestRepo = process.env["DIGEST_REPO"] ?? "";
  const resp = await fetch(`https://api.github.com/repos/${digestRepo}/labels`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ name, color }),
  });
  if (!resp.ok && resp.status !== 422) {
    throw new Error(`Failed to create label "${name}": ${await resp.text()}`);
  }
}

/**
 * Fetch trending skills data from a skills repo (e.g. anthropics/skills).
 * PRs sorted by popularity (comment count); issues sorted by comments.
 * No `since` filter — we want all-time hot items, not just the last 24 h.
 */
export async function fetchSkillsData(repo: string): Promise<{ prs: GitHubItem[]; issues: GitHubItem[] }> {
  const [prs, issuesRaw] = await Promise.all([
    githubGet<GitHubItem[]>(`https://api.github.com/repos/${repo}/pulls`, {
      state: "open",
      sort: "popularity",
      direction: "desc",
      per_page: "50",
    }),
    githubGet<GitHubItem[]>(`https://api.github.com/repos/${repo}/issues`, {
      state: "all",
      sort: "comments",
      direction: "desc",
      per_page: "50",
    }),
  ]);
  return { prs, issues: issuesRaw.filter((i) => !i.pull_request) };
}

const GITHUB_ISSUE_BODY_LIMIT = 65536;
const TRUNCATION_NOTICE =
  "\n\n---\n> ⚠️ Content exceeds the GitHub Issue size limit; see the committed Markdown file for the full report.";

/** GitHub label colors by label name. Default: "0075ca". */
const LABEL_COLORS: Record<string, string> = {
  agents: "e11d48",
  trending: "f9a825",
  hn: "ff6600",
  arxiv: "b31b1b",
  hf: "ff9d00",
};

/**
 * Break GitHub URLs in issue body to prevent cross-repository references.
 * Inserts a zero-width space in "github.com" so GitHub's auto-linker
 * won't create "mentioned this issue" notifications on external repos.
 */
function neutralizeGitHubRefs(text: string): string {
  return (
    text
      // Prevent "mentioned this issue" cross-references
      .replace(/https:\/\/github\.com\//g, "https://github\u200B.com/")
      // Prevent @mention notifications — insert zero-width space after @
      .replace(/@([a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38})/g, "@\u200B$1")
  );
}

/**
 * Close open issues created more than `days` days ago.
 * Uses pagination to handle large backlogs. Returns the number of issues closed.
 */
/**
 * Every label the digest pipeline attaches, plus the discontinued rollup
 * labels that older archived issues still carry. Only issues bearing one of
 * these are eligible for auto-closing, so an issue a person opened is never
 * touched.
 */
const DIGEST_ISSUE_LABELS = new Set([
  ...Object.values(ISSUE_LABELS),
  // Issues from the former bilingual pipeline carried "-en" labels; keep them closable.
  ...Object.values(ISSUE_LABELS).map((l) => `${l}-en`),
  // Discontinued in October 2026: CLI and OpenClaw were merged into the agents
  // report, Product Hunt was dropped.
  "digest",
  "digest-en",
  "openclaw",
  "openclaw-en",
  "ph",
  "ph-en",
  // Folded into the agents and discussions reports in October 2026. Not weekly
  // any more, so an open issue falls in the daily group and is closed by the
  // next run.
  "infra",
  "infra-en",
  "community",
  "community-en",
  "weekly",
  "weekly-en",
  "monthly",
  "monthly-en",
]);

interface OpenIssue {
  number: number;
  created_at: string;
  /** Present only on pull requests — the /issues endpoint returns both. */
  pull_request?: unknown;
  labels: { name: string }[];
}

function isDigestIssue(i: OpenIssue): boolean {
  return i.pull_request === undefined && i.labels.some((l) => DIGEST_ISSUE_LABELS.has(l.name));
}

/** Labels of the weekly reports: a report's label is its id without "ai-". */
export const WEEKLY_ISSUE_LABELS = new Set<string>(WEEKLY_REPORT_IDS.map((id) => id.replace(/^ai-/, "")));

/**
 * Daily issues are retained as one group; each weekly report is its own group,
 * so Monday's weekly issues stay open through the week instead of being closed
 * by Tuesday's daily run.
 */
function retentionGroup(i: OpenIssue): string {
  return i.labels.find((l) => WEEKLY_ISSUE_LABELS.has(l.name))?.name ?? "daily";
}

/** Stop paginating well before a runaway loop could exhaust the rate limit. */
const MAX_ISSUE_PAGES = 50;
/** Closes are spaced out: GitHub throttles bursts of mutating requests. */
const CLOSE_BATCH = 10;

/**
 * Close every digest issue except those from the most recent digest day — per
 * retention group: all daily reports together, each weekly report on its own.
 *
 * The retained day is derived from the newest digest issue that is actually
 * open, not from today's date: when a run fails, yesterday's reports stay up
 * rather than the repo being left with nothing open. Dates are compared as CST
 * days so that one run's issues group together the way the digests/YYYY-MM-DD
 * folders do; a run, around 02:00 UTC, never straddles CST midnight (16:00 UTC).
 *
 * The full open list is collected before anything is closed. Closing shifts
 * pagination, so interleaving the two skips items.
 */
export async function closeSupersededIssues(): Promise<number> {
  const digestRepo = process.env["DIGEST_REPO"] ?? "";
  if (!digestRepo) return 0;

  const open: OpenIssue[] = [];
  for (let page = 1; page <= MAX_ISSUE_PAGES; page++) {
    const batch = await githubGet<OpenIssue[]>(`https://api.github.com/repos/${digestRepo}/issues`, {
      state: "open",
      sort: "created",
      direction: "asc",
      per_page: "100",
      page: String(page),
    });
    open.push(...batch);
    if (batch.length < 100) break;
  }

  const digestIssues = open.filter(isDigestIssue);
  if (digestIssues.length === 0) return 0;

  const keepDate = new Map<string, string>();
  for (const i of digestIssues) {
    const group = retentionGroup(i);
    const day = toCstDateStr(new Date(i.created_at));
    if (day > (keepDate.get(group) ?? "")) keepDate.set(group, day);
  }
  const toClose = digestIssues.filter(
    (i) => toCstDateStr(new Date(i.created_at)) !== keepDate.get(retentionGroup(i)),
  );
  if (toClose.length === 0) return 0;

  const kept = [...keepDate].map(([group, day]) => `${group} ${day}`).join(", ");
  console.log(`[github] Keeping ${digestIssues.length - toClose.length} issue(s): ${kept}.`);

  let closed = 0;
  for (let i = 0; i < toClose.length; i += CLOSE_BATCH) {
    if (i > 0) await sleep(1_000);
    await Promise.all(
      toClose.slice(i, i + CLOSE_BATCH).map(async (issue) => {
        const resp = await fetch(`https://api.github.com/repos/${digestRepo}/issues/${issue.number}`, {
          method: "PATCH",
          headers: { ...headers(), "Content-Type": "application/json" },
          body: JSON.stringify({ state: "closed" }),
        });
        if (resp.ok) closed++;
        else console.error(`[github] Failed to close #${issue.number}: ${resp.status}`);
      }),
    );
  }
  return closed;
}

export async function createGitHubIssue(title: string, body: string, label: string): Promise<string> {
  const digestRepo = process.env["DIGEST_REPO"] ?? "";
  body = neutralizeGitHubRefs(body);
  if (body.length > GITHUB_ISSUE_BODY_LIMIT) {
    body = body.slice(0, GITHUB_ISSUE_BODY_LIMIT - TRUNCATION_NOTICE.length) + TRUNCATION_NOTICE;
  }
  await ensureLabel(label, LABEL_COLORS[label] ?? "0075ca");
  const resp = await fetch(`https://api.github.com/repos/${digestRepo}/issues`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, labels: [label] }),
  });
  if (!resp.ok) throw new Error(`Failed to create issue: ${await resp.text()}`);
  const data = (await resp.json()) as { html_url: string };
  return data.html_url;
}
