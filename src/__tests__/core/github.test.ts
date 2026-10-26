import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  closeSupersededIssues,
  fetchHotIssues,
  fetchRecentReleases,
  fetchSkillsData,
  fetchWeeklyStarGain,
  gainFromHistory,
  GitHubApiError,
  HOT_ISSUE_MAX_CHECKED,
  hotIssueCandidates,
  hotIssuesToCheck,
  hotIssueStateItem,
  nextHotIssuesState,
  isPrerelease,
  isRepeatHotIssue,
  loadHotIssueSnapshot,
  nextHotIssueSnapshot,
  selectHotIssues,
  type GitHubItem,
  type GitHubRelease,
  type HotIssueContext,
  type HotIssueRun,
  type HotIssueSnapshot,
  type HotIssueSnapshotEntry,
  type IssueActivity,
} from "../../core/github.ts";
import { nextReportedState } from "../../core/report-state.ts";

const SINCE = new Date("2026-10-03T22:37:00Z");

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// isPrerelease
// ---------------------------------------------------------------------------

function release(tag_name: string, prerelease = false): GitHubRelease {
  return { tag_name, name: tag_name, published_at: "2026-10-04T00:00:00Z", prerelease };
}

describe("isPrerelease", () => {
  it("trusts the API flag", () => {
    expect(isPrerelease(release("v2.0.0", true))).toBe(true);
  });

  it.each([
    "v0.64.0-nightly.20261003.gfb972b2f8",
    "rust-v0.162.0-alpha.10",
    "v1.2.0-beta.1",
    "v3.0.0-rc1",
    "v3.0.0-rc.2",
    "v1.0.0-preview",
    "v0.5.0.dev",
    "v0.11.0rc1",
    "v0.5.0.dev3",
  ])("treats an unflagged %s as a prerelease", (tag) => {
    expect(isPrerelease(release(tag))).toBe(true);
  });

  it.each(["v2.1.288", "v1.0.92-3", "b11379", "v2026.9.8", "rust-v0.162.0", "src-v1.0.0", "v1.0.0-arc"])(
    "treats %s as stable",
    (tag) => {
      expect(isPrerelease(release(tag))).toBe(false);
    },
  );
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

  it("skips an old issue without a baseline whose activity was not fetched", () => {
    expect(selectHotIssues([issue({ number: 1, comments: 40 })], ctx())).toEqual([]);
  });
});

describe("selectHotIssues, gain from the snapshot", () => {
  const YESTERDAY = "2026-10-03";

  it("takes the gain from yesterday's total and needs no fetch", () => {
    const i = issue({ number: 1, comments: 30 });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: YESTERDAY, total: 18 } }) });
    expect(hotIssuesToCheck([i], c)).toEqual([]);
    expect(selectHotIssues([i], c).map((x) => [x.gain, x.gainSince])).toEqual([[12, undefined]]);
  });

  it("is not hot when the total barely moved since yesterday", () => {
    const i = issue({ number: 1, comments: 400 });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: YESTERDAY, total: 395 } }) });
    expect(selectHotIssues([i], c)).toEqual([]);
  });

  it("names the date of a two-day-old baseline", () => {
    const i = issue({ number: 1, comments: 30 });
    const c = ctx({ snapshot: snap({ "org/repo#1": { date: "2026-10-02", total: 10 } }) });
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
    expect(selectHotIssues([i], ctx({ snapshot: afterFirstRun })).map((x) => x.gain)).toEqual([12]);
  });

  it("counts the whole total of an issue opened in the window, with no fetch", () => {
    const i = issue({ number: 1, comments: 12, created_at: IN_WINDOW });
    expect(hotIssuesToCheck([i], ctx())).toEqual([]);
    expect(selectHotIssues([i], ctx()).map((x) => x.gain)).toEqual([12]);
  });

  it("keeps Codex #56691 (53 now, 40 yesterday) hot without a fetch", () => {
    // 2026-10-26: 53 comments + 👍, 13 of them in the last 24h, behind older threads in a top-10-by-total cut.
    const codex = issue({ number: 56691, comments: 45, thumbs: 8 });
    const c = ctx({
      repo: "openai/codex",
      dateStr: "2026-10-26",
      since: new Date("2026-10-25T20:00:00Z"),
      snapshot: snap({ "openai/codex#56691": { date: "2026-10-25", total: 40 } }),
    });
    expect(hotIssuesToCheck([codex], c)).toEqual([]);
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
  it("records every search total with today's date and prunes entries unseen for 8 days", () => {
    const next = nextHotIssueSnapshot(
      snap({
        "org/repo#1": { date: "2026-09-26", total: 5 },
        "org/repo#2": { date: "2026-09-25", total: 5 },
        "org/repo#3": { date: "2026-10-03", total: 7 },
      }),
      { "org/repo#3": 9, "org/repo#4": 1 },
      TODAY,
    );
    expect(next.items).toEqual({
      "org/repo#1": { date: "2026-09-26", total: 5 },
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
  /** Search returns `items`; each issue's comments and 👍 come from `activity` by number (all new by default). */
  function mockGitHub(items: GitHubItem[], activity: Record<number, IssueActivity | "fail"> = {}) {
    return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = new URL(String(input));
      const json = (body: unknown) =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);
      if (url.pathname === "/search/issues") return json({ items });
      const m = /\/issues\/(\d+)\/(comments|reactions)$/.exec(url.pathname)!;
      const n = Number(m[1]);
      const a = activity[n];
      if (a === "fail") {
        return Promise.resolve({
          ok: false,
          status: 502,
          text: () => Promise.resolve("bad gateway"),
        } as Response);
      }
      const i = items.find((x) => x.number === n)!;
      const all = a ?? {
        comments: dated(i.comments, IN_WINDOW),
        thumbs: dated(i.reactions?.["+1"] ?? 0, IN_WINDOW),
      };
      if (m[2] === "comments") return json(all.comments);
      const page = Number(url.searchParams.get("page"));
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
  ) {
    const spy = mockGitHub(items, activity);
    const hotRun: HotIssueRun = { snapshot, dateStr: TODAY, isRepeat: () => () => false, seen: {} };
    const pending = fetchHotIssues("org/repo", SINCE, hotRun);
    await vi.runAllTimersAsync(); // searchSlot spacing from the previous test
    return { hot: await pending, urls: paths(spy), seen: hotRun.seen };
  }

  it("searches 100 open issues updated in the window, then counts the gain of an old one", async () => {
    const { hot, urls, seen } = await run(
      [
        issue({ number: 7, comments: 12, created_at: "2026-10-03T23:00:00Z" }),
        issue({ number: 9, comments: 60 }),
        issue({ number: 11, comments: 2 }),
      ],
      { 9: { comments: [...dated(57, BEFORE_WINDOW), ...dated(3, IN_WINDOW)], thumbs: [] } },
    );

    const search = urls[0]!;
    expect(search.pathname).toBe("/search/issues");
    expect(search.searchParams.get("q")).toBe(
      "repo:org/repo is:issue is:open updated:>=2026-10-03T22:37:00Z",
    );
    expect(search.searchParams.get("sort")).toBe("interactions");
    expect(search.searchParams.get("per_page")).toBe("100");
    const comments = urls.filter((u) => u.pathname.endsWith("/comments"));
    expect(comments.map((u) => u.pathname)).toEqual(["/repos/org/repo/issues/9/comments"]);
    expect(comments[0]!.searchParams.get("since")).toBe(SINCE.toISOString());
    expect(hot.map((i) => [i.number, i.gain])).toEqual([[7, 12]]);
    expect(seen).toEqual({ "org/repo#7": 12, "org/repo#9": 60, "org/repo#11": 2 });
  });

  it("makes no gain call for an issue with a baseline from yesterday", async () => {
    const { hot, urls } = await run(
      [issue({ number: 9, comments: 60 })],
      {},
      snap({
        "org/repo#9": { date: "2026-10-03", total: 45 },
      }),
    );
    expect(urls.map((u) => u.pathname)).toEqual(["/search/issues"]);
    expect(hot.map((i) => [i.number, i.gain])).toEqual([[9, 15]]);
  });

  it("fetches nothing for an issue whose total is under the bar", async () => {
    const { hot, urls } = await run([issue({ number: 1, comments: 5, thumbs: 4 })]);
    expect(hot).toEqual([]);
    expect(urls.map((u) => u.pathname)).toEqual(["/search/issues"]);
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

  it("skips an issue whose gain fetch fails, keeping the others", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { hot } = await run([issue({ number: 1, comments: 30 }), issue({ number: 2, comments: 15 })], {
      1: "fail",
    });
    expect(hot.map((i) => i.number)).toEqual([2]);
  });
});

describe("fetchRecentReleases", () => {
  it("retries a connection dropped mid-body", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-06T02:26:00Z") });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new TypeError("terminated")),
      } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([release("v2")]) } as Response);

    const pending = fetchRecentReleases("org/repo", SINCE);
    await vi.runAllTimersAsync();
    expect((await pending).recent.map((r) => r.tag_name)).toEqual(["v2"]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  function respond(releases: GitHubRelease[]) {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(releases),
    } as Response);
  }

  it("keeps only the releases published in the window", async () => {
    respond([release("v2"), { ...release("v1"), published_at: "2026-10-01T00:00:00Z" }]);
    expect((await fetchRecentReleases("org/repo", SINCE)).recent.map((r) => r.tag_name)).toEqual(["v2"]);
  });

  it("flags a repo whose whole history is prereleases", async () => {
    respond([release("dsh-v0.2.1-alpha.2"), release("dsh-v0.2.0-rc.1", true)]);
    expect((await fetchRecentReleases("org/repo", SINCE)).noStableYet).toBe(true);
  });

  it("does not flag a repo with a stable release, even one outside the window", async () => {
    respond([release("v2.0.0-rc.1"), { ...release("v1.0.0"), published_at: "2026-01-01T00:00:00Z" }]);
    expect((await fetchRecentReleases("org/repo", SINCE)).noStableYet).toBe(false);
  });

  it("does not flag a full page of prereleases: the stable one may be on the next page", async () => {
    respond(Array.from({ length: 100 }, (_, i) => release(`rust-v0.${i}.0-alpha.1`)));
    expect((await fetchRecentReleases("org/repo", SINCE)).noStableYet).toBe(false);
  });

  it("does not retry an HTTP error", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 404, text: () => Promise.resolve("Not Found") } as Response);

    await expect(fetchRecentReleases("org/repo", SINCE)).rejects.toThrow("GitHub API error 404");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// gainFromHistory / fetchWeeklyStarGain
// ---------------------------------------------------------------------------

/** Epoch seconds of a UTC date. */
const weekOf = (date: string) => Date.parse(`${date}T00:00:00Z`) / 1000;

describe("fetchSkillsData", () => {
  afterEach(() => vi.useRealTimers());

  it("returns no PRs and no issues instead of throwing when the network is down", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    vi.useFakeTimers();
    const pending = fetchSkillsData("anthropics/skills", new Date("2026-10-19T00:00:00Z"));
    await vi.runAllTimersAsync();
    expect(await pending).toEqual({ prs: [], issues: [], fetchSuccess: false });
  });
});

describe("gainFromHistory", () => {
  // Sunday 2026-10-11 22:37 UTC, the weekly run: the window is Sun 10-04 .. Sat 10-10.
  const NOW = new Date("2026-10-11T22:37:00Z");

  it("sums the 7 complete days before today across the week boundary", () => {
    const weeks = [
      { week: weekOf("2026-10-11"), total: 50, days: [50, 0, 0, 0, 0, 0, 0] },
      { week: weekOf("2026-10-04"), total: 28, days: [1, 2, 3, 4, 5, 6, 7] },
    ];
    expect(gainFromHistory(weeks, NOW)).toBe(28);
  });

  it("takes the tail of last week when run mid-week", () => {
    const weeks = [
      { week: weekOf("2026-10-11"), total: 6, days: [1, 2, 3, 0, 0, 0, 0] },
      { week: weekOf("2026-10-04"), total: 28, days: [1, 2, 3, 4, 5, 6, 7] },
    ];
    // Wednesday 10-14: Wed 10-07 .. Tue 10-13 = 4+5+6+7 + 1+2+3.
    expect(gainFromHistory(weeks, new Date("2026-10-14T12:00:00Z"))).toBe(28);
  });

  it("handles a repo created this week, with a single bucket", () => {
    const weeks = [{ week: weekOf("2026-10-04"), total: 9, days: [0, 0, 0, 0, 4, 5, 0] }];
    expect(gainFromHistory(weeks, NOW)).toBe(9);
  });

  it("tolerates week starts off UTC midnight", () => {
    const weeks = [{ week: weekOf("2026-10-04") + 7 * 3600, total: 7, days: [1, 1, 1, 1, 1, 1, 1] }];
    expect(gainFromHistory(weeks, NOW)).toBe(7);
  });
});

describe("fetchWeeklyStarGain", () => {
  it("asks for the two newest buckets and sums the window", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ week: weekOf("2026-10-04"), total: 3, days: [1, 1, 1, 0, 0, 0, 0] }]),
    } as Response);

    expect(await fetchWeeklyStarGain("org/repo", new Date("2026-10-11T22:37:00Z"))).toBe(3);
    const url = new URL(String(fetchSpy.mock.calls[0]![0]));
    expect(url.pathname).toBe("/repos/org/repo/stargazers/history");
    expect(url.searchParams.get("per_page")).toBe("2");
  });

  it("throws a GitHubApiError carrying the status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      text: () => Promise.resolve("spammed"),
    } as Response);

    await expect(fetchWeeklyStarGain("org/repo")).rejects.toMatchObject({ status: 422 });
    await expect(fetchWeeklyStarGain("org/repo")).rejects.toBeInstanceOf(GitHubApiError);
  });

  // 2026-10-19: "API rate limit exceeded for installation" did not say which limit.
  it("names the rate limit in the error of a 403 or 429", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers({
        "x-ratelimit-resource": "search",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": "1760835960",
        "retry-after": "42",
      }),
      text: () => Promise.resolve("API rate limit exceeded for installation"),
    } as unknown as Response);

    await expect(fetchWeeklyStarGain("org/repo")).rejects.toThrow(
      "[rate limit: resource search, remaining 0, reset 2025-10-19T01:06:00.000Z, retry-after 42]",
    );
  });
});

// ---------------------------------------------------------------------------
// closeSupersededIssues
// ---------------------------------------------------------------------------

interface FakeIssue {
  number: number;
  created_at: string;
  labels?: string[];
  isPr?: boolean;
}

/**
 * Mock the issue list endpoint and record every issue number that gets PATCHed
 * closed. A single page is returned, which ends pagination (< 100 items).
 */
function mockIssues(issues: FakeIssue[]): { closed: number[] } {
  const closed: number[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = String(input);
    if (init?.method === "PATCH") {
      closed.push(Number(url.match(/\/issues\/(\d+)$/)?.[1]));
      return Promise.resolve({ ok: true } as Response);
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(
          issues.map((i) => ({
            number: i.number,
            created_at: i.created_at,
            labels: (i.labels ?? ["digest"]).map((name) => ({ name })),
            ...(i.isPr ? { pull_request: { url: "x" } } : {}),
          })),
        ),
    } as Response);
  });
  return { closed };
}

describe("closeSupersededIssues", () => {
  const originalRepo = process.env["DIGEST_REPO"];

  beforeEach(() => {
    process.env["DIGEST_REPO"] = "owner/repo";
  });

  afterEach(() => {
    if (originalRepo === undefined) delete process.env["DIGEST_REPO"];
    else process.env["DIGEST_REPO"] = originalRepo;
  });

  it("keeps the newest CST day and closes everything older", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-08-25T23:10:00Z" },
      { number: 2, created_at: "2026-08-26T23:10:00Z" },
      { number: 3, created_at: "2026-08-27T23:10:00Z" },
    ]);

    // #3 was created at 23:10 UTC on 08-27, which is 07:10 CST on 08-28.
    expect(await closeSupersededIssues()).toBe(2);
    expect(closed.sort()).toEqual([1, 2]);
  });

  it("keeps every issue from the retained day, including a duplicate run", async () => {
    // A manual catch-up run at 01:29 UTC and the delayed cron at 04:14 UTC both
    // published on 2026-08-27 CST, matching the digests/2026-08-27 folder.
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-08-25T23:10:00Z" },
      { number: 2, created_at: "2026-08-27T01:29:00Z" },
      { number: 3, created_at: "2026-08-27T04:14:00Z" },
    ]);

    expect(await closeSupersededIssues()).toBe(1);
    expect(closed).toEqual([1]);
  });

  it("never closes pull requests or issues a person opened", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-01-01T00:00:00Z", isPr: true },
      { number: 2, created_at: "2026-01-01T00:00:00Z", labels: ["bug"] },
      { number: 3, created_at: "2026-01-01T00:00:00Z", labels: [] },
      { number: 4, created_at: "2026-08-25T23:10:00Z" },
      { number: 5, created_at: "2026-08-27T23:10:00Z" },
    ]);

    expect(await closeSupersededIssues()).toBe(1);
    expect(closed).toEqual([4]);
  });

  it("closes discontinued rollup issues, which carry a legacy label", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-05-19T23:10:00Z", labels: ["weekly"] },
      { number: 2, created_at: "2026-08-27T23:10:00Z" },
    ]);

    expect(await closeSupersededIssues()).toBe(1);
    expect(closed).toEqual([1]);
  });

  it("closes the retired discussions and lab reports' last issues as daily ones", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-10-21T23:10:00Z", labels: ["hn"] },
      { number: 2, created_at: "2026-10-21T23:10:00Z", labels: ["web"] },
      { number: 3, created_at: "2026-10-22T23:10:00Z", labels: ["models"] },
    ]);

    expect(await closeSupersededIssues()).toBe(2);
    expect(closed.sort()).toEqual([1, 2]);
  });

  it("closes the retired trending, models and arXiv reports' last issues as daily ones", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-10-18T23:10:00Z", labels: ["trending"] },
      { number: 2, created_at: "2026-10-18T23:10:00Z", labels: ["hf"] },
      { number: 3, created_at: "2026-10-21T23:10:00Z", labels: ["arxiv"] },
      { number: 4, created_at: "2026-10-22T23:10:00Z", labels: ["models"] },
    ]);

    expect(await closeSupersededIssues()).toBe(3);
    expect(closed.sort()).toEqual([1, 2, 3]);
  });

  it("closes nothing when only the newest day is open", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-08-27T23:10:00Z" },
      { number: 2, created_at: "2026-08-27T23:11:00Z" },
    ]);

    expect(await closeSupersededIssues()).toBe(0);
    expect(closed).toEqual([]);
  });

  it("keeps the newest weekly issue open through the week", async () => {
    // Monday 2026-10-05 CST: weekly Trends and the daily agents report.
    // By Thursday's run, only the daily report is superseded.
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-10-04T22:40:00Z", labels: ["agents"] },
      { number: 2, created_at: "2026-10-04T22:41:00Z", labels: ["trends"] },
      { number: 4, created_at: "2026-10-07T22:40:00Z", labels: ["agents"] },
    ]);

    expect(await closeSupersededIssues()).toBe(1);
    expect(closed).toEqual([1]);
  });

  it("closes a weekly issue once the next week's edition is open", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-09-27T22:41:00Z", labels: ["trends"] },
      { number: 2, created_at: "2026-10-04T22:41:00Z", labels: ["trends"] },
      { number: 3, created_at: "2026-10-04T22:40:00Z", labels: ["agents"] },
    ]);

    expect(await closeSupersededIssues()).toBe(1);
    expect(closed).toEqual([1]);
  });

  it("closes the last weekly infra issue once a newer day is open: infra is in the agents report now", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-10-11T22:41:00Z", labels: ["infra"] },
      { number: 2, created_at: "2026-10-12T22:40:00Z", labels: ["agents"] },
    ]);

    expect(await closeSupersededIssues()).toBe(1);
    expect(closed).toEqual([1]);
  });

  it("still closes issues of the merged CLI and OpenClaw reports", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-10-02T22:40:00Z", labels: ["digest"] },
      { number: 2, created_at: "2026-10-02T22:40:00Z", labels: ["openclaw"] },
      { number: 3, created_at: "2026-10-04T22:40:00Z", labels: ["agents"] },
    ]);

    expect(await closeSupersededIssues()).toBe(2);
    expect(closed.sort()).toEqual([1, 2]);
  });

  it("is a no-op when DIGEST_REPO is unset", async () => {
    delete process.env["DIGEST_REPO"];
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    expect(await closeSupersededIssues()).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
