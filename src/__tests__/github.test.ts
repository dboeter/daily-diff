import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  closeSupersededIssues,
  fetchHotIssues,
  isPrerelease,
  selectHotIssues,
  type GitHubItem,
  type GitHubRelease,
} from "../github.ts";

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
}): GitHubItem {
  return {
    number: o.number,
    title: `Issue ${o.number}`,
    state: "open",
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

    const hot = await fetchHotIssues("org/repo", new Date("2026-09-27T22:37:00Z"));

    const url = new URL(String(fetchSpy.mock.calls[0]![0]));
    expect(url.pathname).toBe("/search/issues");
    expect(url.searchParams.get("q")).toBe("repo:org/repo is:issue created:>=2026-09-27T22:37:00Z");
    expect(url.searchParams.get("sort")).toBe("comments");
    expect(hot.map((i) => i.number)).toEqual([7]);
    vi.useRealTimers();
  });

  it("widens a 24h window to 48h so engagement has time to build", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-04T22:37:00Z") });
    const fetchSpy = mockSearch([issue({ number: 8, comments: 15, created_at: "2026-10-03T01:00:00Z" })]);

    const hot = await fetchHotIssues("org/repo", new Date("2026-10-03T22:37:00Z"));

    const q = new URL(String(fetchSpy.mock.calls[0]![0])).searchParams.get("q");
    expect(q).toContain("created:>=2026-10-02T22:37:00Z");
    expect(hot.map((i) => i.number)).toEqual([8]);
    vi.useRealTimers();
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

  it("closes nothing when only the newest day is open", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-08-27T23:10:00Z" },
      { number: 2, created_at: "2026-08-27T23:11:00Z" },
    ]);

    expect(await closeSupersededIssues()).toBe(0);
    expect(closed).toEqual([]);
  });

  it("keeps the newest weekly issue open through the week", async () => {
    // Monday 2026-10-05 CST: weekly infra + trending, and the daily agents report.
    // By Thursday's run, only the daily report is superseded.
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-10-04T22:40:00Z", labels: ["agents"] },
      { number: 2, created_at: "2026-10-04T22:41:00Z", labels: ["infra"] },
      { number: 3, created_at: "2026-10-04T22:41:00Z", labels: ["trending"] },
      { number: 4, created_at: "2026-10-07T22:40:00Z", labels: ["agents"] },
    ]);

    expect(await closeSupersededIssues()).toBe(1);
    expect(closed).toEqual([1]);
  });

  it("closes a weekly issue once the next week's edition is open", async () => {
    const { closed } = mockIssues([
      { number: 1, created_at: "2026-09-27T22:41:00Z", labels: ["infra"] },
      { number: 2, created_at: "2026-10-04T22:41:00Z", labels: ["infra"] },
      { number: 3, created_at: "2026-10-04T22:40:00Z", labels: ["agents"] },
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
