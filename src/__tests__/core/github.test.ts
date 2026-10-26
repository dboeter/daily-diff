import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  closeSupersededIssues,
  fetchHotIssues,
  fetchRecentReleases,
  fetchSkillsData,
  fetchWeeklyStarGain,
  gainFromHistory,
  GitHubApiError,
  hotIssueStateItem,
  isPrerelease,
  isRepeatHotIssue,
  selectHotIssues,
  type GitHubItem,
  type GitHubRelease,
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
    created_at: o.created_at ?? "2026-10-04T01:00:00Z",
    updated_at: "2026-10-04T05:00:00Z",
    comments: o.comments ?? 0,
    reactions: { "+1": o.thumbs ?? 0 },
    html_url: `https://github.com/org/repo/issues/${o.number}`,
    ...(o.isPr ? { pull_request: {} } : {}),
  };
}

describe("selectHotIssues", () => {
  it("keeps issues past the engagement threshold, highest first", () => {
    const hot = selectHotIssues(
      [
        issue({ number: 1, comments: 4, thumbs: 6 }),
        issue({ number: 2, comments: 30 }),
        issue({ number: 3, comments: 9 }),
      ],
      SINCE,
    );
    expect(hot.map((i) => i.number)).toEqual([2, 1]);
  });

  it("lowers the bar for regression and security labels, but does not drop it", () => {
    const hot = selectHotIssues(
      [
        issue({ number: 1, comments: 3, labels: ["Regression"] }),
        issue({ number: 2, comments: 4, labels: ["area:security"] }),
        issue({ number: 3, comments: 2, labels: ["regression"] }),
        issue({ number: 4, comments: 5, labels: ["bug"] }),
      ],
      SINCE,
    );
    expect(hot.map((i) => i.number)).toEqual([2, 1]);
  });

  it("drops issues opened before the window, however busy", () => {
    const hot = selectHotIssues(
      [issue({ number: 1, comments: 500, created_at: "2026-06-01T00:00:00Z" })],
      SINCE,
    );
    expect(hot).toEqual([]);
  });

  it("drops pull requests", () => {
    expect(selectHotIssues([issue({ number: 1, comments: 50, isPr: true })], SINCE)).toEqual([]);
  });

  it("caps the result at two per repo", () => {
    const hot = selectHotIssues(
      [10, 20, 30].map((c, n) => issue({ number: n + 1, comments: c })),
      SINCE,
    );
    expect(hot.map((i) => i.number)).toEqual([3, 2]);
  });
});

describe("hot issue repeats", () => {
  // OpenCode #58781 and #58670: shown on 2026-10-25, shown again word for word on 10-26 though
  // both were closed "not planned" on 10-25.
  const REPO = "anomalyco/opencode";
  const WINDOW = new Date("2026-10-24T00:00:00Z");
  const opencode = (n: number, o: { comments?: number; labels?: string[]; state?: string } = {}) =>
    issue({ number: n, created_at: "2026-10-24T10:00:00Z", comments: o.comments ?? 20, ...o });
  const shown25 = nextReportedState(
    null,
    [opencode(58781), opencode(58670)].map((i) => hotIssueStateItem(REPO, i)),
    "2026-10-25",
  );
  const pick = (items: GitHubItem[], dateStr = "2026-10-26") =>
    selectHotIssues(items, WINDOW, isRepeatHotIssue(shown25, dateStr, REPO)).map((i) => i.number);

  it("drops a closed issue, however hot", () => {
    expect(selectHotIssues([opencode(58781, { state: "closed", comments: 90 })], WINDOW)).toEqual([]);
  });

  it("skips an issue an earlier day showed unchanged, or with a few more comments", () => {
    expect(pick([opencode(58781), opencode(58670, { comments: 25 })])).toEqual([]);
  });

  it("shows it again once its engagement doubles or it gains a regression/security label", () => {
    expect(pick([opencode(58781, { comments: 40 }), opencode(58670, { labels: ["regression"] })])).toEqual([
      58781, 58670,
    ]);
  });

  it("ignores labels other than regression/security", () => {
    expect(pick([opencode(58781, { labels: ["needs-triage"] })])).toEqual([]);
  });

  it("keeps it on a same-day re-run", () => {
    expect(pick([opencode(58781)], "2026-10-25")).toEqual([58781]);
  });

  it("lets a skipped repeat free its slot for the next hot issue", () => {
    expect(pick([opencode(58781), opencode(58670), opencode(1, { comments: 11 })])).toEqual([1]);
  });
});

describe("fetchHotIssues", () => {
  function mockSearch(items: GitHubItem[]) {
    return vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items }),
    } as Response);
  }

  it("searches issues created in the window, most commented first", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-04T22:37:00Z") });
    const fetchSpy = mockSearch([issue({ number: 7, comments: 12, created_at: "2026-10-03T01:00:00Z" })]);

    const pending = fetchHotIssues("org/repo", new Date("2026-09-27T22:37:00Z"));
    await vi.runAllTimersAsync(); // searchSlot spacing from the previous test
    const hot = await pending;

    const url = new URL(String(fetchSpy.mock.calls[0]![0]));
    expect(url.pathname).toBe("/search/issues");
    expect(url.searchParams.get("q")).toBe("repo:org/repo is:issue is:open created:>=2026-09-27T22:37:00Z");
    expect(url.searchParams.get("sort")).toBe("comments");
    expect(hot.map((i) => i.number)).toEqual([7]);
    vi.useRealTimers();
  });

  it("widens a 24h window to 48h so engagement has time to build", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-04T22:37:00Z") });
    const fetchSpy = mockSearch([issue({ number: 8, comments: 15, created_at: "2026-10-03T01:00:00Z" })]);

    const pending = fetchHotIssues("org/repo", new Date("2026-10-03T22:37:00Z"));
    await vi.runAllTimersAsync(); // searchSlot spacing from the previous test
    const hot = await pending;

    const q = new URL(String(fetchSpy.mock.calls[0]![0])).searchParams.get("q");
    expect(q).toContain("created:>=2026-10-02T22:37:00Z");
    expect(hot.map((i) => i.number)).toEqual([8]);
    vi.useRealTimers();
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
    const pending = fetchSkillsData("anthropics/skills");
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
