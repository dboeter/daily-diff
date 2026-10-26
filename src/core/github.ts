/**
 * GitHub API types and fetch helpers.
 * Reads GITHUB_TOKEN and DIGEST_REPO from environment at call time.
 */

import { LIVE_REPORT_IDS, REPORTS, WEEKLY_REPORT_IDS } from "./strings.ts";
import { daysBefore, toCstDateStr, sleep } from "./date.ts";
import { loadItemsFile, type ItemsFile } from "./jev.ts";
import { newItems, type ReportedState, type StateItem } from "./report-state.ts";

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
   * Terms matchProjectNews looks for in news items. Defaults to the display name
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
  closed_at?: string | null;
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
  /** A major release's announcement post description (index.ts `withAnnouncement`). */
  announcement?: string;
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

/**
 * The rate-limit headers of a 403 or 429, for the log. On 2026-10-19 a hot-issue
 * search failed with "API rate limit exceeded for installation", which the
 * search and core limits both say; `x-ratelimit-resource` tells them apart.
 */
function rateLimitNote(resp: Response): string {
  if (resp.status !== 403 && resp.status !== 429) return "";
  const h = (name: string) => resp.headers?.get(name) ?? "?";
  const reset = Number(resp.headers?.get("x-ratelimit-reset"));
  const resetStr = reset ? new Date(reset * 1000).toISOString() : "?";
  return ` [rate limit: resource ${h("x-ratelimit-resource")}, remaining ${h("x-ratelimit-remaining")}, reset ${resetStr}, retry-after ${h("retry-after")}]`;
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
          `GitHub API error ${resp.status} (${url}): ${await resp.text()}${rateLimitNote(resp)}`,
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
 * Minimum comments + 👍 gained in the window for an issue to count as hot.
 * Measured 2026-10-04 on the totals of the issues opened in the previous week:
 * the ones worth reporting (Claude Code auto-mode classifier failures, Codex
 * Remote pairing loops, OpenCode free-tier errors) sat at 11–98, routine bug
 * reports at 0–9. A one-day-old issue's total is its gain, so the bar carried over.
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
/**
 * Candidates per repo without a snapshot baseline whose gain is fetched (1–3
 * core REST calls each), highest total first. Bounds a run's extra calls: the
 * Actions GITHUB_TOKEN allows 1,000 core requests an hour.
 */
export const HOT_ISSUE_MAX_CHECKED = 10;
/** Matched against each label name, so "area:security" and "type: regression" count. */
const HOT_LABEL = /regression|security/i;
export function issueEngagement(i: GitHubItem): number {
  return i.comments + (i.reactions?.["+1"] ?? 0);
}

/** The engagement an issue needs to be hot: lower with a regression or security label. */
function hotIssueBar(i: GitHubItem): number {
  return i.labels.some((l) => HOT_LABEL.test(l.name))
    ? HOT_ISSUE_MIN_ENGAGEMENT_LABELLED
    : HOT_ISSUE_MIN_ENGAGEMENT;
}

/**
 * A hot issue with `gain`: its comments + 👍 gained since `gainSince` (a CST
 * date, from a snapshot baseline older than yesterday), else in the report window.
 */
export interface HotIssue extends GitHubItem {
  gain: number;
  gainSince?: string;
}

/** An issue's comments and 👍 reactions, as far as fetched; only `created_at` is read. */
export interface IssueActivity {
  comments: { created_at: string }[];
  thumbs: { created_at: string }[];
}

/** `digests/hot-issues-state.json`: the hot issues a page showed, a `ReportedState` of `hotIssueStateItem`s. */
export const HOT_ISSUES_STATE_FILE = "digests/hot-issues-state.json";

/**
 * A hot issue as a state item, `issue:<owner/repo>#<n>`: a page shows an issue
 * once, and more engagement or a new label does not bring it back. The state's
 * 30-day prune means an issue still active a month after it was shown can return once.
 */
export function hotIssueStateItem(repo: string, i: GitHubItem): StateItem {
  return { id: `issue:${repo}#${i.number}`, published: i.created_at };
}

/** Whether an earlier day showed the issue (`hotIssueStateItem`); one shown today is not a repeat. */
export function isRepeatHotIssue(
  state: ReportedState | null,
  dateStr: string,
  repo: string,
): (i: GitHubItem) => boolean {
  return (i) => newItems([hotIssueStateItem(repo, i)], state, dateStr).length === 0;
}

// ---------------------------------------------------------------------------
// Hot-issue snapshot: each search result's total, the baseline of the next run's gain
// ---------------------------------------------------------------------------

/** `digests/hot-issues-snapshot.json`: `<owner/repo>#<n>` → `HotIssueSnapshotEntry`, one per line. */
export const HOT_ISSUES_SNAPSHOT_FILE = "digests/hot-issues-snapshot.json";
/** A baseline older than this many days is not used: the gain would span too long to call hot. */
const SNAPSHOT_BASELINE_MAX_DAYS = 2;
/** Entries not seen in a search for this many days are pruned. */
const SNAPSHOT_KEEP_DAYS = 8;

/** One day's observation: comments + 👍 (`issueEngagement`) and the CST date seen. */
export interface SnapshotTotal {
  date: string;
  total: number;
}

/**
 * The latest observation, plus `baseline`, the last one from an earlier day:
 * a same-day re-run measures its gain from the same baseline as the first run.
 */
export interface HotIssueSnapshotEntry extends SnapshotTotal {
  baseline?: SnapshotTotal;
}

export type HotIssueSnapshot = ItemsFile<HotIssueSnapshotEntry>;

export function snapshotKey(repo: string, i: GitHubItem): string {
  return `${repo}#${i.number}`;
}

/** Missing → empty; malformed → empty, logged: the file only holds yesterday's totals. */
export function loadHotIssueSnapshot(file = HOT_ISSUES_SNAPSHOT_FILE): HotIssueSnapshot {
  return loadItemsFile<HotIssueSnapshotEntry>(file, "hot-issues") ?? { items: {} };
}

/** The total an earlier day saw, if at most SNAPSHOT_BASELINE_MAX_DAYS old. */
export function snapshotBaseline(
  entry: HotIssueSnapshotEntry | undefined,
  dateStr: string,
): SnapshotTotal | undefined {
  const b = entry && (entry.date < dateStr ? entry : entry.baseline);
  return b && b.date >= daysBefore(dateStr, SNAPSHOT_BASELINE_MAX_DAYS)
    ? { date: b.date, total: b.total }
    : undefined;
}

/** The snapshot with today's search totals (`seen`: key → total) recorded, pruned of entries unseen for 8 days. */
export function nextHotIssueSnapshot(
  snapshot: HotIssueSnapshot,
  seen: Record<string, number>,
  dateStr: string,
): HotIssueSnapshot {
  const items: Record<string, HotIssueSnapshotEntry> = {};
  const cutoff = daysBefore(dateStr, SNAPSHOT_KEEP_DAYS);
  for (const [key, e] of Object.entries(snapshot.items)) if (e.date >= cutoff) items[key] = e;
  for (const [key, total] of Object.entries(seen)) {
    const old = items[key];
    const baseline = old && (old.date < dateStr ? { date: old.date, total: old.total } : old.baseline);
    items[key] = { date: dateStr, total, ...(baseline ? { baseline } : {}) };
  }
  return { items };
}

// ---------------------------------------------------------------------------
// Hot-issue selection
// ---------------------------------------------------------------------------

/**
 * The issues that can be hot: open, not shown on an earlier day (`isRepeat`),
 * and with a total over the bar, since the gain cannot exceed the total.
 * Highest total first.
 */
export function hotIssueCandidates(
  items: GitHubItem[],
  isRepeat: (i: GitHubItem) => boolean = () => false,
): GitHubItem[] {
  return items
    .filter(
      (i) => !i.pull_request && i.state === "open" && issueEngagement(i) >= hotIssueBar(i) && !isRepeat(i),
    )
    .sort((a, b) => issueEngagement(b) - issueEngagement(a));
}

/** Comments and 👍 created at or after `since`; an edited older comment does not count. */
export function engagementGained(activity: IssueActivity, since: Date): number {
  const isNew = (x: { created_at: string }) => new Date(x.created_at) >= since;
  return activity.comments.filter(isNew).length + activity.thumbs.filter(isNew).length;
}

/** What `selectHotIssues` reads besides the search results. */
export interface HotIssueContext {
  repo: string;
  snapshot: HotIssueSnapshot;
  /** Today, CST. */
  dateStr: string;
  /** The report window's start. */
  since: Date;
  isRepeat?: (i: GitHubItem) => boolean;
  /** By issue number: the API-counted activity of the issues `hotIssuesToCheck` named. */
  activity?: Map<number, IssueActivity>;
}

/**
 * A candidate's gain without an API call: today's total minus the snapshot
 * baseline, or the whole total for an issue opened in the window. Undefined:
 * only the API can tell.
 */
function knownGain(i: GitHubItem, ctx: HotIssueContext): { gain: number; gainSince?: string } | undefined {
  const base = snapshotBaseline(ctx.snapshot.items[snapshotKey(ctx.repo, i)], ctx.dateStr);
  if (base) {
    const gain = Math.max(0, issueEngagement(i) - base.total);
    // A baseline from yesterday spans about the 24h window; an older one is named.
    return base.date < daysBefore(ctx.dateStr, 1) ? { gain, gainSince: base.date } : { gain };
  }
  if (new Date(i.created_at) >= ctx.since) return { gain: issueEngagement(i) };
  return undefined;
}

/** The candidates without a known gain whose activity to fetch: at most HOT_ISSUE_MAX_CHECKED, highest total first. */
export function hotIssuesToCheck(items: GitHubItem[], ctx: HotIssueContext): GitHubItem[] {
  return hotIssueCandidates(items, ctx.isRepeat)
    .filter((i) => !knownGain(i, ctx))
    .slice(0, HOT_ISSUE_MAX_CHECKED);
}

/**
 * Pick the hot issues: gained engagement over the bar, whenever opened.
 * Highest gain first, capped at HOT_ISSUES_PER_REPO. A candidate with neither
 * a known gain nor fetched activity is skipped.
 */
export function selectHotIssues(items: GitHubItem[], ctx: HotIssueContext): HotIssue[] {
  return hotIssueCandidates(items, ctx.isRepeat)
    .flatMap((i): HotIssue[] => {
      const known = knownGain(i, ctx);
      if (known) return [{ ...i, ...known }];
      const activity = ctx.activity?.get(i.number);
      return activity ? [{ ...i, gain: engagementGained(activity, ctx.since) }] : [];
    })
    .filter((i) => i.gain >= hotIssueBar(i))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, HOT_ISSUES_PER_REPO);
}

const ACTIVITY_PAGE = 100;

/**
 * An issue's comments and 👍 that may be new since `since`, in 0–3 core calls.
 * Comments: `since` filters on updated_at, so edited old comments come back
 * too (engagementGained drops them); one page, oldest first. Reactions have
 * no `since` and come oldest first: past one page, the last page holds the
 * newest, and when all of a short last page is new the page before is read too.
 * Over 100 new of either the count is low, but far past the bar.
 */
async function fetchIssueActivity(repo: string, i: GitHubItem, since: Date): Promise<IssueActivity> {
  const base = `https://api.github.com/repos/${repo}/issues/${i.number}`;
  const perPage = String(ACTIVITY_PAGE);
  const comments =
    i.comments > 0
      ? await githubGet<{ created_at: string }[]>(`${base}/comments`, {
          since: since.toISOString(),
          per_page: perPage,
        })
      : [];
  const totalThumbs = i.reactions?.["+1"] ?? 0;
  const thumbsPage = (page: number) =>
    githubGet<{ created_at: string }[]>(`${base}/reactions`, {
      content: "+1",
      per_page: perPage,
      page: String(page),
    });
  let thumbs: { created_at: string }[] = [];
  if (totalThumbs > 0) {
    const last = Math.ceil(totalThumbs / ACTIVITY_PAGE);
    thumbs = await thumbsPage(last);
    if (last > 1 && thumbs.every((r) => new Date(r.created_at) >= since)) {
      thumbs = [...(await thumbsPage(last - 1)), ...thumbs];
    }
  }
  return { comments, thumbs };
}

/** A run's hot-issue inputs, shared by every repo; `seen` collects each search result's total for the snapshot. */
export interface HotIssueRun {
  snapshot: HotIssueSnapshot;
  dateStr: string;
  isRepeat: (repo: string) => (i: GitHubItem) => boolean;
  seen: Record<string, number>;
}

/**
 * Hot issues for a repo: one search for the 100 most-engaged open issues with
 * activity since `since`, however old (paced by searchSlot). The gain comes
 * from the snapshot or the issue's age where it can (`knownGain`), else from
 * the API for up to HOT_ISSUE_MAX_CHECKED candidates (core calls, one issue at
 * a time). Every result's total goes into `run.seen`. A failed gain fetch skips
 * that issue; a failed search should still be treated as "no hot issues", not a failed repo.
 */
export async function fetchHotIssues(repo: string, since: Date, run: HotIssueRun): Promise<HotIssue[]> {
  const result = await githubGet<{ items: GitHubItem[] }>(
    "https://api.github.com/search/issues",
    {
      q: `repo:${repo} is:issue is:open updated:>=${since.toISOString().slice(0, 19)}Z`,
      // Comments plus every reaction: the search sort closest to issueEngagement (comments + 👍).
      sort: "interactions",
      order: "desc",
      per_page: "100",
    },
    searchSlot,
  );
  for (const i of result.items) run.seen[snapshotKey(repo, i)] = issueEngagement(i);
  const activity = new Map<number, IssueActivity>();
  const ctx: HotIssueContext = {
    repo,
    snapshot: run.snapshot,
    dateStr: run.dateStr,
    since,
    isRepeat: run.isRepeat(repo),
    activity,
  };
  for (const issue of hotIssuesToCheck(result.items, ctx)) {
    try {
      activity.set(issue.number, await fetchIssueActivity(repo, issue, since));
    } catch (err) {
      console.error(`  [github] ${repo}#${issue.number} engagement fetch failed, skipped: ${err}`);
    }
  }
  return selectHotIssues(result.items, ctx);
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

export interface SkillsData {
  prs: GitHubItem[];
  issues: GitHubItem[];
  fetchSuccess: boolean;
}

/** Never throws: a failed fetch is no PRs and no issues, with `fetchSuccess: false`. */
export async function fetchSkillsData(repo: string, since: Date): Promise<SkillsData> {
  try {
    const data = await fetchSkills(repo, since);
    console.log(`  [claude-code-skills] prs: ${data.prs.length}, issues: ${data.issues.length}`);
    return { ...data, fetchSuccess: true };
  } catch (err) {
    console.error(`  [claude-code-skills] fetch failed: ${err}`);
    return { prs: [], issues: [], fetchSuccess: false };
  }
}

/**
 * The PRs and issues of a skills repo (e.g. anthropics/skills) updated most
 * recently, any state, so a PR merged or closed this week is seen too. The
 * pulls endpoint has no `since`: sorted by update, page 1 covers a week.
 */
async function fetchSkills(repo: string, since: Date): Promise<{ prs: GitHubItem[]; issues: GitHubItem[] }> {
  const [prs, issuesRaw] = await Promise.all([
    githubGet<GitHubItem[]>(`https://api.github.com/repos/${repo}/pulls`, {
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: "50",
    }),
    githubGet<GitHubItem[]>(`https://api.github.com/repos/${repo}/issues`, {
      state: "all",
      sort: "updated",
      direction: "desc",
      since: since.toISOString(),
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
  models: "7c3aed",
  policy: "1d4ed8",
  data: "0d9488",
  trends: "f9a825",
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
  ...LIVE_REPORT_IDS.map((id) => REPORTS[id].label),
  // Issues from the former bilingual pipeline carried "-en" labels; keep them closable.
  ...LIVE_REPORT_IDS.map((id) => `${REPORTS[id].label}-en`),
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
  // Retired in October 2026: Hacker News, Dev.to and Lobste.rs went to each
  // page's Spotted section, the lab posts to the models page. Daily, like infra.
  "hn",
  "hn-en",
  "web",
  "web-en",
  // Retired in October 2026: trending and the weekly models report became the
  // weekly Trends page, the daily arXiv report its Research section. Their
  // labels fall in the daily group, so the next run closes their last issues.
  "trending",
  "trending-en",
  "hf",
  "hf-en",
  "arxiv",
  "arxiv-en",
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

/** Labels of the weekly reports. */
const WEEKLY_ISSUE_LABELS = new Set<string>(WEEKLY_REPORT_IDS.map((id) => REPORTS[id].label));

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
