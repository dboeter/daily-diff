/**
 * Hot issues: the open issues of a tracked repo that gained comments + 👍 in the
 * report window, the snapshot their gain is measured against, and their fix status.
 */

import { daysBefore } from "./date.ts";
import { DAY_S, githubGet, type GitHubItem } from "./github.ts";
import { loadItemsFile, type ItemsFile } from "./jev.ts";
import { newItems, nextReportedState, type ReportedState, type StateItem } from "./report-state.ts";
import { escapeRegex } from "./regex.ts";

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
 * Candidates per repo without a snapshot baseline whose gain may be fetched
 * (1–3 core REST calls each), highest total first, while HOT_ISSUE_MAX_COUNT_CALLS
 * lasts: the run counts every repo's first candidate before any repo's second.
 */
export const HOT_ISSUE_MAX_CHECKED = 10;
/**
 * Candidates per repo whose known gain (snapshot delta, or a new issue's total) clears the bar and
 * is recounted by the API without bots and slash commands, highest gain first: twice the issues
 * shown, so a drop still leaves recounted ones. Only a recounted one can be shown: on 2026-10-28
 * Gemini #15404 qualified on two gemini-cli[bot] comments and "/assign". Their calls come out of
 * HOT_ISSUE_MAX_COUNT_CALLS.
 */
export const HOT_ISSUE_MAX_VERIFIED = 2 * HOT_ISSUES_PER_REPO;
/**
 * Per-issue count calls per run, shared by every repo: with the list pages and
 * the releases it keeps a daily run under the Actions GITHUB_TOKEN's 1,000 core
 * requests an hour (43 repos × 10 × 3 would be 1,290 alone). Spent round-robin
 * (`countHotIssues`), so the repos that list longest still get their turns.
 */
export const HOT_ISSUE_MAX_COUNT_CALLS = 250;
/**
 * Issue list pages (100 items, pull requests included) read per repo. Live on
 * 2026-10-26, the open issues updated in 37h ran to 815 items in openai/codex
 * and 826 in anthropics/claude-code (9 pages); the 24h window holds ~550 issues
 * plus the pull requests, so 8 pages covers it. Hitting the cap is logged.
 */
export const HOT_ISSUE_MAX_PAGES = 8;
/**
 * Timeline pages read per run for fix status (`fetchFixStatus`), shared by every repo: one per hot
 * issue sent to the prompt (HOT_ISSUES_PER_REPO × the tracked repos, from the loaded config so a
 * config edit cannot leave it stale), though a busy issue can spend several. With 43 tracked repos
 * (2026-10-30), the list pages (43 × HOT_ISSUE_MAX_PAGES), count calls and release pages
 * (43 × RELEASES_MAX_PAGES) make a daily worst case of 344 + 250 + 86 + 215 = 895 core calls,
 * under the Actions token's 1,000 an hour.
 */
export function hotIssueStatusCallCap(trackedRepos: number): number {
  return trackedRepos * HOT_ISSUES_PER_REPO;
}
/** Matched against each label name, so "area:security" and "type: regression" count. */
const HOT_LABEL = /regression|security/i;
export function issueEngagement(i: GitHubItem): number {
  return i.comments + (i.reactions?.["+1"] ?? 0);
}

/** The regression or security label that lowers the issue's bar, as the tracker names it. */
export function hotIssueLabel(i: GitHubItem): string | undefined {
  return i.labels.find((l) => HOT_LABEL.test(l.name))?.name;
}

/** The engagement an issue needs to be hot: lower with a regression or security label. */
function hotIssueBar(i: GitHubItem): number {
  return hotIssueLabel(i) ? HOT_ISSUE_MIN_ENGAGEMENT_LABELLED : HOT_ISSUE_MIN_ENGAGEMENT;
}

/** A pull request linked to a hot issue as its fix (`fetchFixStatus`): merged, or still open. */
export interface FixStatus {
  state: "open" | "merged";
  number: number;
  url: string;
}

/**
 * A hot issue with `gain`: its comments + 👍 gained since `gainSince` (a CST
 * date, from a snapshot baseline older than yesterday), else in the report window.
 * `fix`: its linked fix PR, when the lookup found one.
 */
export interface HotIssue extends GitHubItem {
  gain: number;
  gainSince?: string;
  fix?: FixStatus;
}

/** Who wrote a comment or reaction; `type` is "Bot" for an app. */
export interface ActivityUser {
  login: string;
  type?: string;
}

/** An issue's comments and 👍 reactions, as far as fetched. */
export interface IssueActivity {
  comments: { created_at: string; user?: ActivityUser | null; body?: string | null }[];
  thumbs: { created_at: string; user?: ActivityUser | null }[];
}

/** `digests/hot-issues-state.json`: the hot issues a page showed, a `ReportedState` of `hotIssueStateItem`s. */
export const HOT_ISSUES_STATE_FILE = "digests/hot-issues-state.json";

/**
 * A hot issue as a state item, `issue:<owner/repo>#<n>`: a page shows an issue
 * once, and more engagement, a new label or time does not bring it back: the state is never pruned.
 */
export function hotIssueStateItem(repo: string, i: GitHubItem): StateItem {
  return { id: `issue:${repo}#${i.number}`, published: i.created_at };
}

/**
 * The hot-issue state after `dateStr` showed `items`. Never pruned, so an issue is shown once, ever;
 * the file grows by a few ids a day.
 */
export function nextHotIssuesState(
  state: ReportedState | null,
  items: StateItem[],
  dateStr: string,
): ReportedState {
  return nextReportedState(state, items, dateStr, [], [], { prune: false });
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
// Hot-issue snapshot: each listed issue's total, the baseline of the next run's gain
// ---------------------------------------------------------------------------

/** `digests/hot-issues-snapshot.json`: `<owner/repo>#<n>` → `HotIssueSnapshotEntry`, one per line. */
export const HOT_ISSUES_SNAPSHOT_FILE = "digests/hot-issues-snapshot.json";
/**
 * A baseline older than this many days is not used: the gain would span too
 * long to call hot. An entry older than that is never read, so it is pruned.
 */
const SNAPSHOT_BASELINE_MAX_DAYS = 2;

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
  return loadItemsFile<HotIssueSnapshotEntry>(file, "hot-issues", "no baselines today") ?? { items: {} };
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

/** The snapshot with today's listed totals (`seen`: key → total) recorded, pruned of entries older than SNAPSHOT_BASELINE_MAX_DAYS. */
export function nextHotIssueSnapshot(
  snapshot: HotIssueSnapshot,
  seen: Record<string, number>,
  dateStr: string,
): HotIssueSnapshot {
  const items: Record<string, HotIssueSnapshotEntry> = {};
  const cutoff = daysBefore(dateStr, SNAPSHOT_BASELINE_MAX_DAYS);
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

const isBot = (u: ActivityUser | null | undefined) => u?.type === "Bot" || /\[bot\]$/i.test(u?.login ?? "");
/**
 * A comment that is only a slash command and its argument ("/assign", "/label bug"): on
 * 2026-10-28 Gemini #15404 qualified on two gemini-cli[bot] comments and one "/assign".
 */
const BARE_COMMAND = /^\/[\w-]+(?:[ \t]+\S+)?$/;

/**
 * Comments and 👍 created at or after `since`, by people: an edited older comment, a bot's
 * comment or 👍 and a bare slash command do not count.
 */
export function engagementGained(activity: IssueActivity, since: Date): number {
  const isNew = (x: { created_at: string }) => new Date(x.created_at) >= since;
  const comments = activity.comments.filter(
    (c) => isNew(c) && !isBot(c.user) && !BARE_COMMAND.test((c.body ?? "").trim()),
  );
  return comments.length + activity.thumbs.filter((t) => isNew(t) && !isBot(t.user)).length;
}

/** What `selectHotIssues` reads besides the listed issues. */
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

/**
 * Where a candidate's counted gain starts: the window's start, or for a baseline older than
 * yesterday the same time of day on the day after the baseline (the snapshot keeps dates only).
 */
export function gainWindowStart(i: GitHubItem, ctx: HotIssueContext): Date {
  const base = snapshotBaseline(ctx.snapshot.items[snapshotKey(ctx.repo, i)], ctx.dateStr);
  const dayMs = DAY_S * 1000;
  const extraDays = base ? (Date.parse(ctx.dateStr) - Date.parse(base.date)) / dayMs - 1 : 0;
  return new Date(ctx.since.getTime() - Math.max(0, extraDays) * dayMs);
}

/**
 * The candidates whose activity to fetch, highest first: up to HOT_ISSUE_MAX_VERIFIED whose known
 * gain clears the bar, recounted without bots and commands (a known gain counts them), then up to
 * HOT_ISSUE_MAX_CHECKED without a known gain, by total.
 */
export function hotIssuesToCheck(items: GitHubItem[], ctx: HotIssueContext): GitHubItem[] {
  const candidates = hotIssueCandidates(items, ctx.isRepeat);
  const toVerify = candidates
    .flatMap((i) => {
      const known = knownGain(i, ctx);
      return known && known.gain >= hotIssueBar(i) ? [{ i, gain: known.gain }] : [];
    })
    .sort((a, b) => b.gain - a.gain)
    .slice(0, HOT_ISSUE_MAX_VERIFIED)
    .map(({ i }) => i);
  return [...toVerify, ...candidates.filter((i) => !knownGain(i, ctx)).slice(0, HOT_ISSUE_MAX_CHECKED)];
}

/**
 * Pick the hot issues: gained engagement over the bar, whenever opened, counted without
 * bots and slash commands. Highest gain first, capped at HOT_ISSUES_PER_REPO. A candidate
 * without fetched activity (past HOT_ISSUE_MAX_VERIFIED or HOT_ISSUE_MAX_CHECKED, past the
 * run's cap, a failed fetch) is skipped, a known gain included: it counts bots. A known gain
 * with fetched activity is the people's part of it (the count, never above the known gain).
 */
export function selectHotIssues(items: GitHubItem[], ctx: HotIssueContext): HotIssue[] {
  return hotIssueCandidates(items, ctx.isRepeat)
    .flatMap((i): HotIssue[] => {
      const activity = ctx.activity?.get(i.number);
      if (!activity) return [];
      const counted = engagementGained(activity, gainWindowStart(i, ctx));
      const known = knownGain(i, ctx);
      return [known ? { ...i, ...known, gain: Math.min(known.gain, counted) } : { ...i, gain: counted }];
    })
    .filter((i) => i.gain >= hotIssueBar(i))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, HOT_ISSUES_PER_REPO);
}

const ACTIVITY_PAGE = 100;
const LIST_PAGE = 100;
const TIMELINE_PAGE = 100;

/**
 * An issue's comments and 👍 that may be new since `since`, in 0–3 core calls.
 * Comments: `since` filters on updated_at, so edited old comments come back
 * too (engagementGained drops them); one page, oldest first. Reactions have
 * no `since` and come oldest first: past one page, the last page holds the
 * newest, and when all of a short last page is new the page before is read too.
 * Order checked live on 2026-10-26: anthropics/claude-code#45596 (1,195 👍)
 * had April 2026 reactions on page 1 and its last page ended 2026-10-23.
 * Over 100 new of either the count is low, but far past the bar.
 */
async function fetchIssueActivity(
  repo: string,
  i: GitHubItem,
  since: Date,
  /** Calls made so far, kept up to date so a failed fetch still reports what it spent. */
  made: { calls: number },
): Promise<IssueActivity> {
  const base = `https://api.github.com/repos/${repo}/issues/${i.number}`;
  const perPage = String(ACTIVITY_PAGE);
  if (i.comments > 0) made.calls++;
  const comments =
    i.comments > 0
      ? await githubGet<IssueActivity["comments"]>(`${base}/comments`, {
          since: since.toISOString(),
          per_page: perPage,
        })
      : [];
  const totalThumbs = i.reactions?.["+1"] ?? 0;
  const thumbsPage = (page: number) => {
    made.calls++;
    return githubGet<IssueActivity["thumbs"]>(`${base}/reactions`, {
      content: "+1",
      per_page: perPage,
      page: String(page),
    });
  };
  let thumbs: IssueActivity["thumbs"] = [];
  if (totalThumbs > 0) {
    const last = Math.ceil(totalThumbs / ACTIVITY_PAGE);
    thumbs = await thumbsPage(last);
    if (last > 1 && thumbs.every((r) => new Date(r.created_at) >= since)) {
      thumbs = [...(await thumbsPage(last - 1)), ...thumbs];
    }
  }
  return { comments, thumbs };
}

/** A run's GitHub calls for hot issues, summed over every repo (`hotIssueCallsLine`). */
export interface HotIssueCalls {
  listPages: number;
  countCalls: number;
  /** Candidates not counted: the run had used HOT_ISSUE_MAX_COUNT_CALLS. */
  skipped: number;
  /** Fix-status timeline pages read (`fetchFixStatus`), at most `maxStatusCalls`. */
  statusCalls: number;
  /** The run's fix-status cap (`hotIssueStatusCallCap`). */
  maxStatusCalls: number;
}

/** One repo's candidates waiting for the run's count phase, and the activity fetched for them. */
interface QueuedRepo {
  repo: string;
  /** Where a candidate's count starts (`gainWindowStart`). */
  countFrom: (i: GitHubItem) => Date;
  toCheck: GitHubItem[];
  activity: Map<number, IssueActivity>;
}

/**
 * The repos that have listed their issues; the count phase starts once all
 * `repos` have joined. `repos` must equal the number of fetchHotIssues calls of
 * the run, or the run waits forever.
 */
export interface HotIssueQueue {
  repos: number;
  entries: QueuedRepo[];
  full: Promise<void>;
  release: () => void;
  counted?: Promise<void>;
}

export function newHotIssueQueue(repos: number): HotIssueQueue {
  let release = () => {};
  const full = new Promise<void>((resolve) => (release = resolve));
  if (repos <= 0) release();
  return { repos, entries: [], full, release };
}

/** A run's hot-issue inputs, shared by every repo; `seen` collects each listed issue's total for the snapshot. */
export interface HotIssueRun {
  snapshot: HotIssueSnapshot;
  dateStr: string;
  isRepeat: (repo: string) => (i: GitHubItem) => boolean;
  seen: Record<string, number>;
  calls: HotIssueCalls;
  queue: HotIssueQueue;
}

/** A run's zeroed counters; `trackedRepos` is the number of repos the config tracks, for the fix-status cap. */
export function newHotIssueCalls(trackedRepos: number): HotIssueCalls {
  return {
    listPages: 0,
    countCalls: 0,
    skipped: 0,
    statusCalls: 0,
    maxStatusCalls: hotIssueStatusCallCap(trackedRepos),
  };
}

/** The run's one hot-issue log line. */
export function hotIssueCallsLine(c: HotIssueCalls): string {
  return (
    `[github] hot issues: ${c.listPages} list pages, ${c.countCalls} count calls, ${c.statusCalls} fix-status calls` +
    (c.skipped ? `, ${c.skipped} candidates skipped past the run cap of ${HOT_ISSUE_MAX_COUNT_CALLS}` : "")
  );
}

/** A timeline event, as far as `fetchFixStatus` reads it: a cross-reference's source issue or PR. */
interface TimelineEvent {
  event: string;
  source?: {
    issue?: {
      number: number;
      state: string;
      html_url: string;
      title?: string;
      body?: string | null;
      pull_request?: { merged_at?: string | null } | null;
      repository?: { full_name: string };
    };
  };
}

/**
 * The issue's fix: a pull request of the same repo that cross-references it with a GitHub
 * closing keyword ("fixes #N", "closes owner/repo#N", the issue URL), merged first, else an
 * open one; a PR that only mentions the issue is not its fix. The timeline is oldest first with
 * no sort, and holds at least every comment, so reading starts at the page the comment count
 * implies and goes forward to a short page: the newest events, one call per page while
 * the run's fix-status cap lasts. A fix PR referenced before the comments on earlier pages is unseen.
 */
export async function fetchFixStatus(
  repo: string,
  i: GitHubItem,
  calls: HotIssueCalls,
): Promise<FixStatus | undefined> {
  const events: TimelineEvent[] = [];
  for (let page = Math.max(1, Math.ceil(i.comments / TIMELINE_PAGE)); ; page++) {
    // Reserved before the await: the repos look up in parallel and share the cap.
    if (calls.statusCalls >= calls.maxStatusCalls) break;
    calls.statusCalls++;
    const batch = await githubGet<TimelineEvent[]>(
      `https://api.github.com/repos/${repo}/issues/${i.number}/timeline`,
      { per_page: String(TIMELINE_PAGE), page: String(page) },
    );
    events.push(...batch);
    if (batch.length < TIMELINE_PAGE) break;
  }
  const ref = `(?:#|${escapeRegex(repo)}#|https://github\\.com/${escapeRegex(repo)}/issues/)${i.number}(?!\\d)`;
  const closes = new RegExp(`\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\b:?\\s+${ref}`, "i");
  const fixes = events.flatMap((e) => {
    const pr = e.source?.issue;
    return e.event === "cross-referenced" &&
      pr?.pull_request &&
      pr.repository?.full_name.toLowerCase() === repo.toLowerCase() &&
      closes.test(`${pr.title ?? ""}\n${pr.body ?? ""}`)
      ? [pr]
      : [];
  });
  const merged = fixes.find((pr) => pr.pull_request?.merged_at);
  const open = fixes.find((pr) => pr.state === "open");
  const fix = merged ?? open;
  return fix && { state: merged ? "merged" : "open", number: fix.number, url: fix.html_url };
}

/** The most core calls `fetchIssueActivity` makes for an issue. */
function maxActivityCalls(i: GitHubItem): number {
  const thumbs = i.reactions?.["+1"] ?? 0;
  return (i.comments > 0 ? 1 : 0) + (thumbs > ACTIVITY_PAGE ? 2 : thumbs > 0 ? 1 : 0);
}

/**
 * The repo's open issues updated since `since`, however old, from the core
 * issues list (newest update first, at most HOT_ISSUE_MAX_PAGES pages), pull
 * requests dropped. Paging stops on a short page, measured before the pull
 * requests are dropped: they share the list's pages.
 */
async function listUpdatedIssues(repo: string, since: Date, calls: HotIssueCalls): Promise<GitHubItem[]> {
  const issues: GitHubItem[] = [];
  for (let page = 1; page <= HOT_ISSUE_MAX_PAGES; page++) {
    const items = await githubGet<GitHubItem[]>(`https://api.github.com/repos/${repo}/issues`, {
      state: "open",
      since: since.toISOString(),
      sort: "updated",
      direction: "desc",
      per_page: String(LIST_PAGE),
      page: String(page),
    });
    calls.listPages++;
    issues.push(...items.filter((i) => !i.pull_request));
    if (items.length < LIST_PAGE) return issues;
  }
  console.log(`  [github] ${repo}: hot-issue list stopped at ${HOT_ISSUE_MAX_PAGES} pages`);
  return issues;
}

/**
 * The run's count phase, once every repo has listed: in round k each repo's
 * k-th candidate is counted, all repos in parallel, so every repo gets a turn
 * before any gets another while HOT_ISSUE_MAX_COUNT_CALLS lasts. Within a round
 * the higher total reserves first. A candidate past the cap is skipped.
 */
async function countHotIssues(queue: HotIssueQueue, calls: HotIssueCalls): Promise<void> {
  const rounds = Math.max(0, ...queue.entries.map((e) => e.toCheck.length));
  for (let k = 0; k < rounds; k++) {
    const turn = queue.entries
      .flatMap((e) => {
        const issue = e.toCheck[k];
        return issue ? [{ e, issue }] : [];
      })
      .sort((a, b) => issueEngagement(b.issue) - issueEngagement(a.issue));
    await Promise.all(
      turn.map(async ({ e, issue }) => {
        // Reserved before the first await: the round's fetches run in parallel and share the cap.
        const cost = maxActivityCalls(issue);
        if (calls.countCalls + cost > HOT_ISSUE_MAX_COUNT_CALLS) {
          calls.skipped++;
          return;
        }
        calls.countCalls += cost;
        const made = { calls: 0 };
        try {
          e.activity.set(issue.number, await fetchIssueActivity(e.repo, issue, e.countFrom(issue), made));
        } catch (err) {
          console.error(`  [github] ${e.repo}#${issue.number} engagement fetch failed, skipped: ${err}`);
        } finally {
          calls.countCalls -= cost - made.calls;
        }
      }),
    );
  }
}

/**
 * Hot issues for a repo. Every open issue updated since `since` is listed
 * (`listUpdatedIssues`) and its total goes into `run.seen`. The gain comes
 * from the snapshot or the issue's age where it can (`knownGain`), else from
 * the API for up to HOT_ISSUE_MAX_CHECKED candidates, counted in the run's
 * shared count phase (`countHotIssues`) once every repo has listed; that phase
 * also recounts up to HOT_ISSUE_MAX_VERIFIED known gains without bots. Only a
 * counted issue is shown. Each selected issue then gets a fix-status lookup
 * (`withFixStatus`). A failed gain fetch skips that issue; a failed list should
 * be treated as "no hot issues", not a failed repo.
 */
export async function fetchHotIssues(repo: string, since: Date, run: HotIssueRun): Promise<HotIssue[]> {
  const activity = new Map<number, IssueActivity>();
  const ctx: HotIssueContext = {
    repo,
    snapshot: run.snapshot,
    dateStr: run.dateStr,
    since,
    isRepeat: run.isRepeat(repo),
    activity,
  };
  const entry: QueuedRepo = { repo, countFrom: (i) => gainWindowStart(i, ctx), toCheck: [], activity };
  const { queue } = run;
  let issues: GitHubItem[];
  try {
    issues = await listUpdatedIssues(repo, since, run.calls);
    for (const i of issues) run.seen[snapshotKey(repo, i)] = issueEngagement(i);
    entry.toCheck = hotIssuesToCheck(issues, ctx);
  } finally {
    // A failed list still joins, with nothing to count: the count phase waits for every repo.
    queue.entries.push(entry);
    if (queue.entries.length >= queue.repos) queue.release();
  }
  queue.counted ??= queue.full.then(() => countHotIssues(queue, run.calls));
  await queue.counted;
  return Promise.all(selectHotIssues(issues, ctx).map((i) => withFixStatus(repo, i, run.calls)));
}

/** The issue with its fix status while the run's fix-status cap lasts; a failed lookup shows none and keeps the issue. */
async function withFixStatus(repo: string, i: HotIssue, calls: HotIssueCalls): Promise<HotIssue> {
  try {
    const fix = await fetchFixStatus(repo, i, calls);
    return fix ? { ...i, fix } : i;
  } catch (err) {
    console.error(`  [github] ${repo}#${i.number} fix-status lookup failed: ${err}`);
    return i;
  }
}
