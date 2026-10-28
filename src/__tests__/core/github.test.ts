import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  closeSupersededIssues,
  createGitHubIssue,
  fetchRecentReleases,
  fetchSkillsData,
  fetchWeeklyStarGain,
  gainFromHistory,
  GitHubApiError,
  isPrerelease,
  type GitHubRelease,
} from "../../core/github.ts";

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

  it("retries a gateway timeout", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 504, text: () => Promise.resolve("") } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([release("v2")]) } as Response);

    const pending = fetchRecentReleases("org/repo", SINCE);
    await vi.runAllTimersAsync();
    expect((await pending).recent.map((r) => r.tag_name)).toEqual(["v2"]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("retries a truncated body instead of parsing it", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const truncated = new Response('[{"tag_name":"v2","name":"v2","published_at":"2026-10');
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(truncated)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([release("v2")]) } as Response);

    const pending = fetchRecentReleases("org/repo", SINCE);
    await vi.runAllTimersAsync();
    expect((await pending).recent.map((r) => r.tag_name)).toEqual(["v2"]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("gives every request a timeout", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as unknown as Response);
    await fetchRecentReleases("org/repo", SINCE);
    expect(fetchSpy.mock.calls[0]![1]?.signal).toBeInstanceOf(AbortSignal);
  });

  /** Serves `history` (newest first) page by page, as the releases list does. */
  function respond(history: GitHubRelease[]) {
    return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = new URL(String(input));
      const perPage = Number(url.searchParams.get("per_page"));
      const page = Number(url.searchParams.get("page"));
      const body = history.slice((page - 1) * perPage, page * perPage);
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);
    });
  }
  const old = (r: GitHubRelease): GitHubRelease => ({ ...r, published_at: "2026-09-01T00:00:00Z" });

  it("keeps only the releases published in the window", async () => {
    respond([release("v2"), { ...release("v1"), published_at: "2026-10-01T00:00:00Z" }]);
    expect((await fetchRecentReleases("org/repo", SINCE)).recent.map((r) => r.tag_name)).toEqual(["v2"]);
  });

  it("pages in small pages and stops at the first page that ends before the window", async () => {
    const history = [
      ...Array.from({ length: 12 }, (_, i) => release(`v1.${12 - i}.0`)),
      ...Array.from({ length: 30 }, (_, i) => old(release(`v0.${30 - i}.0`))),
    ];
    const fetchSpy = respond(history);
    const { recent, noStableYet } = await fetchRecentReleases("org/repo", SINCE);
    expect(recent).toHaveLength(12);
    expect(noStableYet).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(new URL(String(fetchSpy.mock.calls[0]![0])).searchParams.get("per_page")).toBe("10");
  });

  it("flags a repo whose whole history is prereleases", async () => {
    respond([release("dsh-v0.2.1-alpha.2"), release("dsh-v0.2.0-rc.1", true)]);
    expect((await fetchRecentReleases("org/repo", SINCE)).noStableYet).toBe(true);
  });

  it("flags a short prerelease-only history read over several pages", async () => {
    respond(Array.from({ length: 23 }, (_, i) => old(release(`v0.${i}.0-beta.1`))));
    expect((await fetchRecentReleases("org/repo", SINCE)).noStableYet).toBe(true);
  });

  it("does not flag a repo with a stable release, even one outside the window", async () => {
    respond([release("v2.0.0-rc.1"), { ...release("v1.0.0"), published_at: "2026-01-01T00:00:00Z" }]);
    expect((await fetchRecentReleases("org/repo", SINCE)).noStableYet).toBe(false);
  });

  it("pages past the window to Codex's stable release behind a run of alphas", async () => {
    const alphas = Array.from({ length: 25 }, (_, i) => old(release(`rust-v0.166.0-alpha.${25 - i}`)));
    const fetchSpy = respond([release("rust-v0.166.0-alpha.26"), ...alphas, old(release("rust-v0.165.0"))]);
    const { recent, noStableYet } = await fetchRecentReleases("org/repo", SINCE);
    expect(recent.map((r) => r.tag_name)).toEqual(["rust-v0.166.0-alpha.26"]);
    expect(noStableYet).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("does not flag a long prerelease-only history: it stops at the page cap without reading it all", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = respond(Array.from({ length: 100 }, (_, i) => release(`rust-v0.${i}.0-alpha.1`)));
    expect((await fetchRecentReleases("org/repo", SINCE)).noStableYet).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(5);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("stopped at 5 pages"));
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

  it("gives every write request a timeout: the close, the label and the new issue", async () => {
    mockIssues([
      { number: 1, created_at: "2026-10-02T22:40:00Z" },
      { number: 2, created_at: "2026-10-04T22:40:00Z" },
    ]);
    await closeSupersededIssues();
    const fetchSpy = vi.mocked(globalThis.fetch);
    fetchSpy.mockImplementation(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: "https://x" }) } as Response),
    );
    await createGitHubIssue("Title", "Body", "agents");
    const writes = fetchSpy.mock.calls.filter(([, init]) => init?.method);
    expect(writes.map(([, init]) => init!.method)).toEqual(["PATCH", "POST", "POST"]);
    for (const [, init] of writes) expect(init!.signal).toBeInstanceOf(AbortSignal);
  });
});
