/**
 * GitHub API types and fetch helpers.
 * Reads GITHUB_TOKEN and DIGEST_REPO from environment at call time.
 */

import { ISSUE_LABELS } from "./i18n.ts";
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
   * Fetch multiple pages until items older than `since` are reached.
   * Use for high-volume repos with many daily updates.
   */
  paginated?: boolean;
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

export interface RepoFetch {
  cfg: RepoConfig;
  issues: GitHubItem[];
  prs: GitHubItem[];
  releases: GitHubRelease[];
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Maximum pages to fetch for paginated repos (100 items/page). */
const MAX_PAGES = 5;

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env["GITHUB_TOKEN"] ?? ""}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubGet<T>(url: string, params: Record<string, string> = {}): Promise<T> {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const resp = await fetch(u.toString(), { headers: headers() });
  if (!resp.ok) throw new Error(`GitHub API error ${resp.status} (${url}): ${await resp.text()}`);
  return resp.json() as Promise<T>;
}

async function fetchItemPage(
  repo: string,
  itemType: "issues" | "pulls",
  since: Date,
  page: number,
): Promise<GitHubItem[]> {
  const params: Record<string, string> = {
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: "100",
    page: String(page),
  };
  // /pulls does not support `since`; filter client-side instead
  if (itemType === "issues") params["since"] = since.toISOString();

  const items = await githubGet<GitHubItem[]>(`https://api.github.com/repos/${repo}/${itemType}`, params);
  return itemType === "pulls" ? items.filter((i) => new Date(i.updated_at) >= since) : items;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Fetch items updated since `since`.
 * Paginated repos: keeps fetching until a page ends before `since` or MAX_PAGES reached.
 * Regular repos: single page of 50.
 */
export async function fetchRecentItems(
  cfg: RepoConfig,
  itemType: "issues" | "pulls",
  since: Date,
): Promise<GitHubItem[]> {
  if (!cfg.paginated) {
    const params: Record<string, string> = {
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: "50",
    };
    if (itemType === "issues") params["since"] = since.toISOString();
    const items = await githubGet<GitHubItem[]>(
      `https://api.github.com/repos/${cfg.repo}/${itemType}`,
      params,
    );
    return itemType === "pulls" ? items.filter((i) => new Date(i.updated_at) >= since) : items;
  }

  const all: GitHubItem[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const items = await fetchItemPage(cfg.repo, itemType, since, page);
    if (items.length === 0) break;
    all.push(...items);
    const last = items[items.length - 1];
    if (last && new Date(last.updated_at) < since) break;
    if (items.length < 100) break;
  }
  return all;
}

/**
 * Releases published since `since`, newest first. 100 is the API maximum: a
 * weekly window on llama.cpp, which tags several builds a day, already runs to
 * 35–70 releases.
 */
export async function fetchRecentReleases(repo: string, since: Date): Promise<GitHubRelease[]> {
  const releases = await githubGet<GitHubRelease[]>(`https://api.github.com/repos/${repo}/releases`, {
    per_page: "100",
  });
  return releases.filter((r) => new Date(r.published_at) >= since);
}

/**
 * Tags that mark a preview build. Several projects publish nightlies and alphas
 * as ordinary releases (Qwen Code and Gemini CLI nightlies, Codex
 * `rust-v…-alpha.N`), so the API's `prerelease` flag alone misses them.
 */
const PRERELEASE_TAG = /nightly|alpha|beta|preview|canary|[-.]rc\.?\d*\b|[-.]dev\b/i;

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
 * Search allows 30 requests a minute, shared with the trending fetch's 6 topic
 * queries: 18 on a daily run, 24 on the weekly one. Close to the limit, so a
 * caller should treat a failure here as "no hot issues", not a failed repo.
 */
export async function fetchHotIssues(repo: string, since: Date): Promise<GitHubItem[]> {
  const createdSince = new Date(Math.min(since.getTime(), Date.now() - HOT_ISSUE_MIN_WINDOW_MS));
  const result = await githubGet<{ items: GitHubItem[] }>("https://api.github.com/search/issues", {
    q: `repo:${repo} is:issue created:>=${createdSince.toISOString().slice(0, 19)}Z`,
    sort: "comments",
    order: "desc",
    per_page: "50",
  });
  return selectHotIssues(result.items, createdSince);
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
  ph: "da552f",
  arxiv: "b31b1b",
  hf: "ff9d00",
  community: "2563eb",
  infra: "0891b2",
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
  // The CLI and OpenClaw reports were merged into the agents report.
  "digest",
  "digest-en",
  "openclaw",
  "openclaw-en",
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

/** Stop paginating well before a runaway loop could exhaust the rate limit. */
const MAX_ISSUE_PAGES = 50;
/** Closes are spaced out: GitHub throttles bursts of mutating requests. */
const CLOSE_BATCH = 10;

/**
 * Close every digest issue except those from the most recent digest day.
 *
 * The retained day is derived from the newest digest issue that is actually
 * open, not from today's date: when a run fails, yesterday's reports stay up
 * rather than the repo being left with nothing open. Dates are compared as CST
 * days so that one run's issues — created just before 23:00 UTC — group
 * together the way the digests/YYYY-MM-DD folders do.
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

  const keepDate = digestIssues
    .map((i) => toCstDateStr(new Date(i.created_at)))
    .reduce((a, b) => (a > b ? a : b));
  const toClose = digestIssues.filter((i) => toCstDateStr(new Date(i.created_at)) !== keepDate);
  if (toClose.length === 0) return 0;

  console.log(`[github] Keeping ${digestIssues.length - toClose.length} issue(s) from ${keepDate}.`);

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
