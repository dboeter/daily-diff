import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { GitHubItem } from "../../core/github.ts";
import {
  fetchHotIssues,
  HOT_ISSUE_MAX_CHECKED,
  HOT_ISSUE_MAX_COUNT_CALLS,
  HOT_ISSUE_MAX_PAGES,
  HOT_ISSUE_MAX_STATUS_CALLS,
  HOT_ISSUE_MAX_VERIFIED,
  gainWindowStart,
  hotIssueCallsLine,
  newHotIssueCalls,
  newHotIssueQueue,
  hotIssueCandidates,
  hotIssuesToCheck,
  hotIssueStateItem,
  nextHotIssuesState,
  isRepeatHotIssue,
  loadHotIssueSnapshot,
  nextHotIssueSnapshot,
  selectHotIssues,
  type HotIssueContext,
  type HotIssueRun,
  type HotIssueSnapshot,
  type HotIssueSnapshotEntry,
  type IssueActivity,
} from "../../core/hot-issues.ts";
import { nextReportedState } from "../../core/report-state.ts";

const SINCE = new Date("2026-10-03T22:37:00Z");

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// selectHotIssues / fetchHotIssues
// ---------------------------------------------------------------------------

function issue(o: {
  number: number;
  created_at?: string;
  comments?: number;
  thumbs?: number;
  labels?: string[];
  isPr?: boolean;
  state?: string;
}): GitHubItem {
  return {
    number: o.number,
    title: `Issue ${o.number}`,
    state: o.state ?? "open",
    user: { login: "alice" },
    labels: (o.labels ?? []).map((name) => ({ name })),
    created_at: o.created_at ?? BEFORE_WINDOW,
    updated_at: "2026-10-04T05:00:00Z",
    comments: o.comments ?? 0,
    reactions: { "+1": o.thumbs ?? 0 },
    html_url: `https://github.com/org/repo/issues/${o.number}`,
    ...(o.isPr ? { pull_request: {} } : {}),
  };
}

// The window of fetchHotIssues: `since` and a time inside and before it; TODAY is the CST date of the run.
const IN_WINDOW = "2026-10-04T03:00:00Z";
const BEFORE_WINDOW = "2026-09-01T00:00:00Z";
const TODAY = "2026-10-04";
const EMPTY: HotIssueSnapshot = { items: {} };
const dated = (n: number, created_at: string) => Array.from({ length: n }, () => ({ created_at }));
/** An issue's activity: `newComments`/`newThumbs` created in the window, `oldComments` before it. */
function act(o: { newComments?: number; oldComments?: number; newThumbs?: number }): IssueActivity {
  return {
    comments: [...dated(o.oldComments ?? 0, BEFORE_WINDOW), ...dated(o.newComments ?? 0, IN_WINDOW)],
    thumbs: dated(o.newThumbs ?? 0, IN_WINDOW),
  };
}
function ctx(o: Partial<HotIssueContext> = {}): HotIssueContext {
  return { repo: "org/repo", snapshot: EMPTY, dateStr: TODAY, since: SINCE, ...o };
}
/** Old issues counted by the API: `activity` by issue number. */
function selectByApi(entries: [GitHubItem, IssueActivity][]) {
  return selectHotIssues(
    entries.map(([i]) => i),
    ctx({ activity: new Map(entries.map(([i, a]) => [i.number, a])) }),
  );
}
const snap = (items: Record<string, HotIssueSnapshotEntry>): HotIssueSnapshot => ({ items });

describe("selectHotIssues, gain counted by the API", () => {
  it("does not keep an old issue with a large total but 2 new comments in the window", () => {
    const old = issue({ number: 1, comments: 400, thumbs: 90 });
    expect(selectByApi([[old, act({ oldComments: 98, newComments: 2 })]])).toEqual([]);
  });

  it("keeps an issue opened months ago with 12 new comments in the window, with its gain", () => {
    const old = issue({ number: 1, comments: 40 });
    const hot = selectByApi([[old, act({ oldComments: 28, newComments: 12 })]]);
    expect(hot.map((i) => [i.number, i.gain, i.gainSince])).toEqual([[1, 12, undefined]]);
  });

  it("keeps a labelled regression with 3 new 👍, not an unlabelled issue with 9", () => {
    const hot = selectByApi([
      [issue({ number: 1, thumbs: 3, labels: ["Regression"] }), act({ newThumbs: 3 })],
      [issue({ number: 2, thumbs: 9 }), act({ newThumbs: 9 })],
      [issue({ number: 3, thumbs: 2, labels: ["area:security"] }), act({ newThumbs: 2 })],
    ]);
    expect(hot.map((i) => i.number)).toEqual([1]);
  });

  it("does not count comments edited in the window but created before it", () => {
    // The comments endpoint's `since` filters on updated_at, so edited old comments come back.
    const i = issue({ number: 1, comments: 20 });
    expect(selectByApi([[i, act({ oldComments: 15, newComments: 5 })]])).toEqual([]);
  });

  it("sorts by gain, not total, and caps at two per repo", () => {
    const hot = selectByApi([
      [issue({ number: 1, comments: 300 }), act({ newComments: 11 })],
      [issue({ number: 2, comments: 30 }), act({ newComments: 25 })],
      [issue({ number: 3, comments: 20 }), act({ newComments: 4, newThumbs: 10 })],
    ]);
    expect(hot.map((i) => [i.number, i.gain])).toEqual([
      [2, 25],
      [3, 14],
    ]);
  });

  it("does not count bot comments, bot 👍 or a bare slash command (Gemini #15404, 2026-10-28)", () => {
    // Labelled area/security (bar 3): two gemini-cli[bot] comments and "/assign" made +3.
    const gemini = issue({ number: 15404, comments: 16, labels: ["area/security", "priority/p2"] });
    const by = (login: string, body: string, type = "User") => ({
      created_at: IN_WINDOW,
      user: { login, type },
      body,
    });
    const activity: IssueActivity = {
      comments: [
        by("gemini-cli[bot]", "Thanks for the report", "Bot"),
        by("Neal006", " /assign\n"),
        by("gemini-cli[bot]", "Assigned to Neal006"),
        by("ci-app", "/label bug", "Bot"),
      ],
      thumbs: [{ created_at: IN_WINDOW, user: { login: "renovate[bot]", type: "Bot" } }],
    };
    expect(selectByApi([[gemini, activity]])).toEqual([]);
    const withPeople: IssueActivity = {
      ...activity,
      comments: [...activity.comments, by("alice", "/assign is not enough, this also breaks on Linux")],
      thumbs: [
        ...activity.thumbs,
        { created_at: IN_WINDOW, user: { login: "bob", type: "User" } },
        { created_at: IN_WINDOW },
      ],
    };
    expect(selectByApi([[gemini, withPeople]]).map((i) => i.gain)).toEqual([3]);
  });

  it("skips an old issue without a baseline whose activity was not fetched", () => {
    expect(selectHotIssues([issue({ number: 1, comments: 40 })], ctx())).toEqual([]);
  });
});

describe("selectHotIssues, gain from the snapshot", () => {
  const YESTERDAY = "2026-10-03";

  it("takes the gain from yesterday's total, which a recount can only lower", () => {
    const i = issue({ number: 1, comments: 30 });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: YESTERDAY, total: 18 } }) });
    expect(hotIssuesToCheck([i], c).map((x) => x.number)).toEqual([1]);
    const people = selectHotIssues([i], { ...c, activity: new Map([[1, act({ newComments: 12 })]]) });
    expect(people.map((x) => [x.gain, x.gainSince])).toEqual([[12, undefined]]);
    // An API count past the known gain (edits, a long window) does not raise it.
    const recounted = selectHotIssues([i], { ...c, activity: new Map([[1, act({ newComments: 20 })]]) });
    expect(recounted.map((x) => x.gain)).toEqual([12]);
  });

  it("does not show a known gain that was not recounted: it counts bots and commands", () => {
    // Past HOT_ISSUE_MAX_VERIFIED, past the run's cap or after a failed fetch: no activity.
    const baseline = issue({ number: 1, comments: 30 });
    const opened = issue({ number: 2, comments: 12, created_at: IN_WINDOW });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: YESTERDAY, total: 18 } }) });
    expect(selectHotIssues([baseline, opened], c)).toEqual([]);
  });

  it("recounts a baseline gain without bots and /assign, and drops the issue when people added too little", () => {
    // Gemini #15404 (2026-10-28) on the baseline path: +3 since yesterday, labelled area/security (bar 3).
    const gemini = issue({ number: 15404, comments: 16, labels: ["area/security"] });
    const c = ctx({ snapshot: snap({ "org/repo#15404": { date: YESTERDAY, total: 13 } }) });
    const by = (login: string, body: string, type = "User") => ({
      created_at: IN_WINDOW,
      user: { login, type },
      body,
    });
    const activity: IssueActivity = {
      comments: [
        by("gemini-cli[bot]", "Triage", "Bot"),
        by("Neal006", "/assign"),
        by("gemini-cli[bot]", "Assigned"),
      ],
      thumbs: [],
    };
    expect(hotIssuesToCheck([gemini], c).map((x) => x.number)).toEqual([15404]);
    expect(selectHotIssues([gemini], { ...c, activity: new Map([[15404, activity]]) })).toEqual([]);
  });

  it("counts a two-day-old baseline's recount from the day after it", () => {
    const i = issue({ number: 1, comments: 30 });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: "2026-10-02", total: 10 } }) });
    expect(gainWindowStart(i, c)).toEqual(new Date(SINCE.getTime() - 24 * 60 * 60 * 1000));
    expect(gainWindowStart(i, ctx())).toEqual(SINCE);
  });

  it(`recounts at most ${HOT_ISSUE_MAX_VERIFIED} known gains per repo, highest first, before the unknown ones`, () => {
    const known = Array.from({ length: 6 }, (_, n) =>
      issue({ number: n + 1, comments: 20 + n, created_at: IN_WINDOW }),
    );
    const old = issue({ number: 99, comments: 500 });
    const toCheck = hotIssuesToCheck([...known, old], ctx()).map((x) => x.number);
    expect(toCheck).toEqual([6, 5, 4, 3, 99]);
  });

  it("is not hot when the total barely moved since yesterday", () => {
    const i = issue({ number: 1, comments: 400 });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: YESTERDAY, total: 395 } }) });
    expect(selectHotIssues([i], c)).toEqual([]);
  });

  it("names the date of a two-day-old baseline", () => {
    const i = issue({ number: 1, comments: 30 });
    const c = ctx({
      snapshot: snap({ "org/repo#1": { date: "2026-10-02", total: 10 } }),
      activity: new Map([[1, act({ newComments: 20 })]]),
    });
    expect(selectHotIssues([i], c).map((x) => [x.gain, x.gainSince])).toEqual([[20, "2026-10-02"]]);
  });

  it("falls back to the API when the baseline is over 2 days old", () => {
    const i = issue({ number: 1, comments: 30 });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: "2026-10-01", total: 10 } }) });
    expect(hotIssuesToCheck([i], c).map((x) => x.number)).toEqual([1]);
    const hot = selectHotIssues([i], { ...c, activity: new Map([[1, act({ newComments: 3 })]]) });
    expect(hot).toEqual([]);
  });

  it("measures a same-day re-run from the earlier day's baseline, not the first run's total", () => {
    const i = issue({ number: 1, comments: 30 });
    const first = snap({ "org/repo#1": { date: YESTERDAY, total: 18 } });
    const afterFirstRun = nextHotIssueSnapshot(first, { "org/repo#1": 29 }, TODAY);
    expect(afterFirstRun.items["org/repo#1"]).toEqual({
      date: TODAY,
      total: 29,
      baseline: { date: YESTERDAY, total: 18 },
    });
    const activity = new Map([[1, act({ newComments: 20 })]]);
    expect(selectHotIssues([i], ctx({ snapshot: afterFirstRun, activity })).map((x) => x.gain)).toEqual([12]);
  });

  it("counts the whole total of an issue opened in the window, less its bot comments once recounted", () => {
    const i = issue({ number: 1, comments: 12, created_at: IN_WINDOW });
    expect(hotIssuesToCheck([i], ctx()).map((x) => x.number)).toEqual([1]);
    const people = ctx({ activity: new Map([[1, act({ newComments: 12 })]]) });
    expect(selectHotIssues([i], people).map((x) => x.gain)).toEqual([12]);
    const botFirst: IssueActivity = {
      comments: [
        { created_at: IN_WINDOW, user: { login: "triage-bot", type: "Bot" }, body: "Thanks" },
        ...dated(11, IN_WINDOW),
      ],
      thumbs: [],
    };
    expect(selectHotIssues([i], ctx({ activity: new Map([[1, botFirst]]) })).map((x) => x.gain)).toEqual([
      11,
    ]);
  });

  it("keeps Codex #56691 (53 now, 40 yesterday) hot from its baseline", () => {
    // 2026-10-26: 53 comments + 👍, 13 of them in the last 24h, behind older threads in a top-10-by-total cut.
    const codex = issue({ number: 56691, comments: 45, thumbs: 8 });
    const c = ctx({
      repo: "openai/codex",
      dateStr: "2026-10-26",
      since: new Date("2026-10-25T20:00:00Z"),
      snapshot: snap({ "openai/codex#56691": { date: "2026-10-25", total: 40 } }),
      activity: new Map([[56691, { comments: dated(13, "2026-10-26T01:00:00Z"), thumbs: [] }]]),
    });
    expect(selectHotIssues([codex], c).map((x) => [x.number, x.gain])).toEqual([[56691, 13]]);
  });
});

describe("hotIssuesToCheck", () => {
  it("keeps open issues whose total clears the bar that applies, highest total first", () => {
    const candidates = hotIssuesToCheck(
      [
        issue({ number: 1, comments: 4, thumbs: 6 }),
        issue({ number: 2, comments: 30 }),
        issue({ number: 3, comments: 9 }),
        issue({ number: 4, comments: 3, labels: ["regression"] }),
        issue({ number: 5, comments: 2, labels: ["security"] }),
        issue({ number: 6, comments: 50, isPr: true }),
      ],
      ctx(),
    );
    expect(candidates.map((i) => i.number)).toEqual([2, 1, 4]);
  });

  it(`checks at most ${HOT_ISSUE_MAX_CHECKED} old issues without a baseline per repo`, () => {
    const items = Array.from({ length: 15 }, (_, n) => issue({ number: n + 1, comments: 10 + n }));
    const candidates = hotIssuesToCheck(items, ctx());
    expect(candidates).toHaveLength(HOT_ISSUE_MAX_CHECKED);
    expect(candidates[0]!.number).toBe(15);
  });
});

describe("nextHotIssueSnapshot", () => {
  it("records every listed total with today's date and prunes entries past the baseline age (2 days)", () => {
    const next = nextHotIssueSnapshot(
      snap({
        "org/repo#1": { date: "2026-10-02", total: 5 },
        "org/repo#2": { date: "2026-10-01", total: 5 },
        "org/repo#3": { date: "2026-10-03", total: 7 },
      }),
      { "org/repo#3": 9, "org/repo#4": 1 },
      TODAY,
    );
    expect(next.items).toEqual({
      "org/repo#1": { date: "2026-10-02", total: 5 },
      "org/repo#3": { date: TODAY, total: 9, baseline: { date: "2026-10-03", total: 7 } },
      "org/repo#4": { date: TODAY, total: 1 },
    });
  });

  it("reads a malformed file as empty", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hot-snapshot-"));
    const file = path.join(dir, "hot-issues-snapshot.json");
    fs.writeFileSync(file, "{ not json");
    expect(loadHotIssueSnapshot(file)).toEqual({ items: {} });
    expect(loadHotIssueSnapshot(path.join(dir, "missing.json"))).toEqual({ items: {} });
  });
});

describe("hot issue repeats", () => {
  // OpenCode #58781 and #58670: shown on 2026-10-25, shown again word for word on 10-26 though
  // both were closed "not planned" on 10-25.
  const REPO = "anomalyco/opencode";
  const opencode = (n: number, o: { comments?: number; labels?: string[]; state?: string } = {}) =>
    issue({ number: n, created_at: "2026-10-24T10:00:00Z", comments: o.comments ?? 20, ...o });
  const shown25 = nextReportedState(
    null,
    [opencode(58781), opencode(58670)].map((i) => hotIssueStateItem(REPO, i)),
    "2026-10-25",
  );
  const pick = (items: GitHubItem[], dateStr = "2026-10-26") =>
    hotIssueCandidates(items, isRepeatHotIssue(shown25, dateStr, REPO)).map((i) => i.number);

  it("drops a closed issue, however hot", () => {
    expect(hotIssueCandidates([opencode(58781, { state: "closed", comments: 90 })])).toEqual([]);
  });

  it("skips an issue an earlier day showed, even when its engagement or labels grew", () => {
    expect(pick([opencode(58781, { comments: 400 }), opencode(58670, { labels: ["regression"] })])).toEqual(
      [],
    );
  });

  it("keeps it on a same-day re-run", () => {
    expect(pick([opencode(58781)], "2026-10-25")).toEqual([58781]);
  });

  it("still skips an issue shown 40 days ago, after later saves", () => {
    const shown = nextHotIssuesState(null, [hotIssueStateItem(REPO, opencode(58781))], "2026-09-16");
    const later = nextHotIssuesState(shown, [], "2026-10-25");
    expect(later.reported).toEqual({ [`issue:${REPO}#58781`]: "2026-09-16" });
    expect(hotIssueCandidates([opencode(58781)], isRepeatHotIssue(later, "2026-10-26", REPO))).toEqual([]);
  });

  it("keeps a same-day re-run's issues after a no-prune save", () => {
    const today = nextHotIssuesState(shown25, [hotIssueStateItem(REPO, opencode(58781))], "2026-10-25");
    expect(today.reported[`issue:${REPO}#58781`]).toBe("2026-10-25");
    expect(
      hotIssueCandidates([opencode(58781)], isRepeatHotIssue(today, "2026-10-25", REPO)).map((i) => i.number),
    ).toEqual([58781]);
  });

  it("does not treat an issue opened months ago and never shown as a repeat", () => {
    const old = issue({ number: 7, comments: 40, created_at: "2026-03-01T00:00:00Z" });
    expect(pick([old])).toEqual([7]);
  });
});

describe("fetchHotIssues", () => {
  /**
   * The issues list returns `items`, 100 a page; each issue's comments and 👍
   * come from `activity` by number (all new by default).
   */
  function mockGitHub(
    items: GitHubItem[],
    activity: Record<number, IssueActivity | "fail"> = {},
    /** Each issue's timeline events (none by default). */
    timeline: Record<number, unknown[] | "fail"> = {},
  ) {
    return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = new URL(String(input));
      const json = (body: unknown) =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);
      if (url.pathname === "/repos/org/repo/issues") {
        const page = Number(url.searchParams.get("page"));
        return json(items.slice((page - 1) * 100, page * 100));
      }
      const m = /\/issues\/(\d+)\/(comments|reactions|timeline)$/.exec(url.pathname)!;
      const n = Number(m[1]);
      const a = m[2] === "timeline" ? timeline[n] : activity[n];
      const page = Number(url.searchParams.get("page"));
      if (m[2] === "timeline" && a !== "fail")
        return json(((a as unknown[]) ?? []).slice((page - 1) * 100, page * 100));
      if (a === "fail") {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve("Not Found"),
        } as Response);
      }
      const i = items.find((x) => x.number === n)!;
      const all = (a as IssueActivity | undefined) ?? {
        comments: dated(i.comments, IN_WINDOW),
        thumbs: dated(i.reactions?.["+1"] ?? 0, IN_WINDOW),
      };
      if (m[2] === "comments") return json(all.comments);
      return json(all.thumbs.slice((page - 1) * 100, page * 100));
    });
  }
  const paths = (spy: ReturnType<typeof mockGitHub>) => spy.mock.calls.map((c) => new URL(String(c[0])));

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2026-10-04T22:37:00Z") });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  async function run(
    items: GitHubItem[],
    activity?: Record<number, IssueActivity | "fail">,
    snapshot: HotIssueSnapshot = EMPTY,
    calls = newHotIssueCalls(),
    timeline?: Record<number, unknown[] | "fail">,
  ) {
    const spy = mockGitHub(items, activity, timeline);
    const hotRun: HotIssueRun = {
      snapshot,
      dateStr: TODAY,
      isRepeat: () => () => false,
      seen: {},
      calls,
      queue: newHotIssueQueue(1),
    };
    const hot = await fetchHotIssues("org/repo", SINCE, hotRun);
    // The list and count calls; each hot issue's fix-status lookup is in `timelines`.
    const all = paths(spy);
    const isTimeline = (u: URL) => u.pathname.endsWith("/timeline");
    return {
      hot,
      urls: all.filter((u) => !isTimeline(u)),
      timelines: all.filter(isTimeline).map((u) => u.pathname),
      seen: hotRun.seen,
      calls,
    };
  }
  const LIST = "/repos/org/repo/issues";

  it("lists the open issues updated in the window, then counts the gain of an old one", async () => {
    const { hot, urls, seen } = await run(
      [
        issue({ number: 7, comments: 12, created_at: "2026-10-03T23:00:00Z" }),
        issue({ number: 9, comments: 60 }),
        issue({ number: 11, comments: 2 }),
      ],
      { 9: { comments: [...dated(57, BEFORE_WINDOW), ...dated(3, IN_WINDOW)], thumbs: [] } },
    );

    const list = urls[0]!;
    expect(list.pathname).toBe(LIST);
    expect(Object.fromEntries(list.searchParams)).toEqual({
      state: "open",
      since: SINCE.toISOString(),
      sort: "updated",
      direction: "desc",
      per_page: "100",
      page: "1",
    });
    // #7, opened in the window, is recounted without bots first; #9 has no known gain.
    const comments = urls.filter((u) => u.pathname.endsWith("/comments"));
    expect(comments.map((u) => u.pathname)).toEqual([
      "/repos/org/repo/issues/7/comments",
      "/repos/org/repo/issues/9/comments",
    ]);
    expect(comments[1]!.searchParams.get("since")).toBe(SINCE.toISOString());
    expect(hot.map((i) => [i.number, i.gain])).toEqual([[7, 12]]);
    expect(seen).toEqual({ "org/repo#7": 12, "org/repo#9": 60, "org/repo#11": 2 });
  });

  it("recounts a gain from yesterday's baseline in one comments call", async () => {
    const { hot, urls } = await run(
      [issue({ number: 9, comments: 60 })],
      {},
      snap({
        "org/repo#9": { date: "2026-10-03", total: 45 },
      }),
    );
    expect(urls.map((u) => u.pathname)).toEqual([LIST, "/repos/org/repo/issues/9/comments"]);
    expect(hot.map((i) => [i.number, i.gain])).toEqual([[9, 15]]);
  });

  it("does not show a baseline-path issue whose gain is bot comments and /assign (Gemini #15404)", async () => {
    const gemini = issue({ number: 15404, comments: 16, labels: ["area/security"] });
    const by = (login: string, body: string, type = "User") => ({
      created_at: IN_WINDOW,
      user: { login, type },
      body,
    });
    const { hot, timelines } = await run(
      [gemini],
      {
        15404: {
          comments: [
            by("gemini-cli[bot]", "Triage", "Bot"),
            by("Neal006", "/assign"),
            by("gemini-cli[bot]", "Assigned"),
          ],
          thumbs: [],
        },
      },
      snap({ "org/repo#15404": { date: "2026-10-03", total: 13 } }),
    );
    expect(hot).toEqual([]);
    expect(timelines).toEqual([]);
  });

  it("does not show a known gain whose recount the run cap skipped, and logs the skip", async () => {
    const calls = { ...newHotIssueCalls(), countCalls: HOT_ISSUE_MAX_COUNT_CALLS };
    const { hot, urls } = await run(
      [issue({ number: 9, comments: 60 }), issue({ number: 7, comments: 12, created_at: IN_WINDOW })],
      {},
      snap({ "org/repo#9": { date: "2026-10-03", total: 45 } }),
      calls,
    );
    expect(urls.map((u) => u.pathname)).toEqual([LIST]);
    expect(hot).toEqual([]);
    expect(calls.skipped).toBe(2);
    expect(hotIssueCallsLine(calls)).toContain("2 candidates skipped past the run cap");
  });

  it("fetches nothing for an issue whose total is under the bar", async () => {
    const { hot, urls } = await run([issue({ number: 1, comments: 5, thumbs: 4 })]);
    expect(hot).toEqual([]);
    expect(urls.map((u) => u.pathname)).toEqual([LIST]);
  });

  it(`counts the gain of at most ${HOT_ISSUE_MAX_CHECKED} old issues without a baseline per repo`, async () => {
    const items = Array.from({ length: 12 }, (_, n) => issue({ number: n + 1, comments: 20 + n }));
    const { urls } = await run(items);
    const checkedIssues = new Set(
      urls.filter((u) => u.pathname.endsWith("/comments")).map((u) => u.pathname),
    );
    expect(checkedIssues.size).toBe(HOT_ISSUE_MAX_CHECKED);
    expect(checkedIssues.has("/repos/org/repo/issues/1/comments")).toBe(false);
  });

  it("reads the newest page of 👍 when there are over 100", async () => {
    const i = issue({ number: 3, thumbs: 205 });
    const { hot, urls } = await run([i], {
      3: { comments: [], thumbs: [...dated(195, BEFORE_WINDOW), ...dated(10, IN_WINDOW)] },
    });
    const reactions = urls.filter((u) => u.pathname.endsWith("/reactions"));
    expect(reactions.map((u) => [u.searchParams.get("content"), u.searchParams.get("page")])).toEqual([
      ["+1", "3"],
      ["+1", "2"],
    ]);
    expect(hot.map((x) => x.gain)).toEqual([10]);
  });

  it("reads the next page while a page is full, counting pull requests, and records every listed issue", async () => {
    // 100 on page 1 (3 of them pull requests), 20 on page 2: the surging old issue is #110, on page 2.
    const items = Array.from({ length: 120 }, (_, n) =>
      issue({ number: n + 1, comments: n === 109 ? 14 : 1, isPr: n < 3 }),
    );
    const { hot, urls, seen, calls } = await run(items, {
      110: { comments: [...dated(2, BEFORE_WINDOW), ...dated(12, IN_WINDOW)], thumbs: [] },
    });
    const pages = urls.filter((u) => u.pathname === LIST).map((u) => u.searchParams.get("page"));
    expect(pages).toEqual(["1", "2"]);
    expect(Object.keys(seen)).toHaveLength(117);
    expect(seen["org/repo#1"]).toBeUndefined();
    expect(hot.map((i) => [i.number, i.gain])).toEqual([[110, 12]]);
    expect(calls).toEqual({ listPages: 2, countCalls: 1, skipped: 0, statusCalls: 1 });
  });

  it(`stops after ${HOT_ISSUE_MAX_PAGES} list pages and logs it`, async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const items = Array.from({ length: (HOT_ISSUE_MAX_PAGES + 1) * 100 }, (_, n) => issue({ number: n + 1 }));
    const { urls, seen } = await run(items);
    expect(urls.filter((u) => u.pathname === LIST)).toHaveLength(HOT_ISSUE_MAX_PAGES);
    expect(Object.keys(seen)).toHaveLength(HOT_ISSUE_MAX_PAGES * 100);
    expect(log).toHaveBeenCalledWith(expect.stringContaining(`stopped at ${HOT_ISSUE_MAX_PAGES} pages`));
  });

  it("finds a small-total old issue that surged, from its snapshot baseline, recounting only it", async () => {
    const { hot, urls } = await run(
      [issue({ number: 5, comments: 300 }), issue({ number: 8, comments: 16, thumbs: 2 })],
      {},
      snap({
        "org/repo#5": { date: "2026-10-03", total: 299 },
        "org/repo#8": { date: "2026-10-03", total: 6 },
      }),
    );
    // #5's gain (+1) is under the bar, so only #8 is recounted.
    expect(urls.map((u) => u.pathname)).toEqual([
      LIST,
      "/repos/org/repo/issues/8/comments",
      "/repos/org/repo/issues/8/reactions",
    ]);
    expect(hot.map((i) => [i.number, i.gain])).toEqual([[8, 12]]);
  });

  it(`skips candidates once the run used ${HOT_ISSUE_MAX_COUNT_CALLS} count calls, across repos`, async () => {
    // One call left: #1 needs two (comments and 👍), #2 needs one (comments only).
    const calls = { ...newHotIssueCalls(), countCalls: HOT_ISSUE_MAX_COUNT_CALLS - 1 };
    const { hot, urls } = await run(
      [issue({ number: 1, comments: 30, thumbs: 5 }), issue({ number: 2, comments: 20 })],
      {},
      EMPTY,
      calls,
    );
    expect(urls.filter((u) => u.pathname !== LIST).map((u) => u.pathname)).toEqual([
      "/repos/org/repo/issues/2/comments",
    ]);
    expect(hot.map((i) => i.number)).toEqual([2]);
    expect(calls).toEqual({
      listPages: 1,
      countCalls: HOT_ISSUE_MAX_COUNT_CALLS,
      skipped: 1,
      statusCalls: 1,
    });
    expect(hotIssueCallsLine(calls)).toBe(
      `[github] hot issues: 1 list pages, ${HOT_ISSUE_MAX_COUNT_CALLS} count calls, 1 fix-status calls, 1 candidates skipped past the run cap of ${HOT_ISSUE_MAX_COUNT_CALLS}`,
    );
  });

  it("returns the unused part of an issue's reserved count calls", async () => {
    // 150 👍 reserves 3 calls; all 50 on the last page are old, so the page before is not read.
    const { calls } = await run([issue({ number: 4, comments: 1, thumbs: 150 })], {
      4: { comments: [], thumbs: dated(150, BEFORE_WINDOW) },
    });
    expect(calls.countCalls).toBe(2);
  });

  it("gives back a failed count fetch's unspent calls", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    // 2 reserved (comments and 👍); the comments call fails, so the 👍 call is never made.
    const { calls } = await run([issue({ number: 1, comments: 30, thumbs: 5 })], { 1: "fail" });
    expect(calls.countCalls).toBe(1);
  });

  it("counts every repo's first candidate before any repo's second, whichever lists last", async () => {
    // small/repo finishes listing last, after big/repo could have spent the 3 calls the cap leaves.
    const items: Record<string, GitHubItem[]> = {
      "big/repo": Array.from({ length: 10 }, (_, n) => issue({ number: n + 1, comments: 50 + n })),
      "small/repo": [issue({ number: 1, comments: 20 })],
    };
    const counted: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = new URL(String(input));
      const json = (body: unknown) => ({ ok: true, json: () => Promise.resolve(body) }) as Response;
      const list = /^\/repos\/(\w+\/repo)\/issues$/.exec(url.pathname);
      if (list) {
        if (list[1] === "small/repo") for (let n = 0; n < 50; n++) await Promise.resolve();
        return json(items[list[1]!]);
      }
      counted.push(url.pathname);
      return json(dated(3, IN_WINDOW));
    });
    const calls = { ...newHotIssueCalls(), countCalls: HOT_ISSUE_MAX_COUNT_CALLS - 3 };
    const hotRun: HotIssueRun = {
      snapshot: EMPTY,
      dateStr: TODAY,
      isRepeat: () => () => false,
      seen: {},
      calls,
      queue: newHotIssueQueue(2),
    };
    await Promise.all([
      fetchHotIssues("big/repo", SINCE, hotRun),
      fetchHotIssues("small/repo", SINCE, hotRun),
    ]);
    expect(counted).toEqual([
      "/repos/big/repo/issues/10/comments",
      "/repos/small/repo/issues/1/comments",
      "/repos/big/repo/issues/9/comments",
    ]);
    expect(calls).toMatchObject({ countCalls: HOT_ISSUE_MAX_COUNT_CALLS, skipped: 8 });
  });

  describe("fix status", () => {
    /** A cross-referenced pull request of `repo`, its title or body naming the issue. */
    const xref = (o: { number: number; text: string; state?: string; merged?: boolean; repo?: string }) => ({
      event: "cross-referenced",
      source: {
        issue: {
          number: o.number,
          state: o.state ?? "open",
          html_url: `https://github.com/${o.repo ?? "org/repo"}/pull/${o.number}`,
          title: "A change",
          body: o.text,
          pull_request: { merged_at: o.merged ? "2026-10-04T01:00:00Z" : null },
          repository: { full_name: o.repo ?? "Org/Repo" },
        },
      },
    });
    const hotOne = [issue({ number: 7, comments: 12, created_at: IN_WINDOW })];

    it("looks up each hot issue once and keeps an open fix PR", async () => {
      // Hermes #145452 (2026-10-28): its fix PR #145478 was open and the page did not say so.
      const { hot, timelines, calls } = await run(hotOne, {}, EMPTY, newHotIssueCalls(), {
        7: [xref({ number: 20, text: "Mentions #7 in passing" }), xref({ number: 21, text: "Fixes #7" })],
      });
      expect(timelines).toEqual(["/repos/org/repo/issues/7/timeline"]);
      expect(hot.map((i) => i.fix)).toEqual([
        { state: "open", number: 21, url: "https://github.com/org/repo/pull/21" },
      ]);
      expect(calls.statusCalls).toBe(1);
    });

    it("prefers a merged fix and ignores another repo's PR and a closed unmerged one", async () => {
      const { hot } = await run(hotOne, {}, EMPTY, newHotIssueCalls(), {
        7: [
          xref({ number: 30, text: "closes org/repo#7", repo: "fork/repo" }),
          xref({ number: 31, text: "Resolves: #7", state: "closed" }),
          xref({ number: 32, text: "fix https://github.com/org/repo/issues/7 by retrying", state: "open" }),
          xref({ number: 33, text: "Closes #7", state: "closed", merged: true }),
        ],
      });
      expect(hot.map((i) => i.fix)).toEqual([
        { state: "merged", number: 33, url: "https://github.com/org/repo/pull/33" },
      ]);
    });

    it("keeps the issue without a status when the lookup fails or the run cap is spent", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const failed = await run(hotOne, {}, EMPTY, newHotIssueCalls(), { 7: "fail" });
      expect(failed.hot.map((i) => [i.number, i.fix])).toEqual([[7, undefined]]);
      vi.restoreAllMocks();
      const spent = { ...newHotIssueCalls(), statusCalls: HOT_ISSUE_MAX_STATUS_CALLS };
      const capped = await run(hotOne, {}, EMPTY, spent);
      expect(capped.timelines).toEqual([]);
      expect(capped.hot.map((i) => [i.number, i.fix])).toEqual([[7, undefined]]);
    });

    /** Timeline events that are no fix: comments and labels. */
    const noise = (n: number) => Array.from({ length: n }, () => ({ event: "commented" }));
    const timelinePages = (spy: { timelinePages: URL[] }) =>
      spy.timelinePages.map((u) => u.searchParams.get("page"));
    async function runTimeline(comments: number, events: unknown[], calls = newHotIssueCalls()) {
      const busy = issue({ number: 7, comments, created_at: IN_WINDOW });
      const spy = mockGitHub([busy], { 7: act({ newComments: comments }) }, { 7: events });
      const hotRun: HotIssueRun = {
        snapshot: EMPTY,
        dateStr: TODAY,
        isRepeat: () => () => false,
        seen: {},
        calls,
        queue: newHotIssueQueue(1),
      };
      const hot = await fetchHotIssues("org/repo", SINCE, hotRun);
      return { hot, calls, timelinePages: paths(spy).filter((u) => u.pathname.endsWith("/timeline")) };
    }

    it("reads a busy issue's timeline from the page its comment count implies to a short page", async () => {
      // 250 comments: the timeline holds at least 250 events, so page 3 is the first read; the fix is on page 4.
      const fix = xref({ number: 40, text: "Fixes #7" });
      const r = await runTimeline(250, [...noise(320), fix]);
      expect(timelinePages(r)).toEqual(["3", "4"]);
      expect(r.hot.map((i) => i.fix?.number)).toEqual([40]);
      expect(r.calls.statusCalls).toBe(2);
    });

    it("counts every timeline page against the run cap and stops when it is spent", async () => {
      const fix = xref({ number: 40, text: "Fixes #7" });
      const spent = { ...newHotIssueCalls(), statusCalls: HOT_ISSUE_MAX_STATUS_CALLS - 1 };
      const r = await runTimeline(150, [...noise(220), fix], spent);
      expect(timelinePages(r)).toEqual(["2"]);
      expect(r.hot.map((i) => i.fix)).toEqual([undefined]);
      expect(r.calls.statusCalls).toBe(HOT_ISSUE_MAX_STATUS_CALLS);
    });
  });

  it("skips an issue whose gain fetch fails, keeping the others", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { hot } = await run([issue({ number: 1, comments: 30 }), issue({ number: 2, comments: 15 })], {
      1: "fail",
    });
    expect(hot.map((i) => i.number)).toEqual([2]);
  });
});
