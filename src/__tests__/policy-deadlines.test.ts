import fs from "node:fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { parseInitiatives, fetchHaveYourSay } from "../policy/haveyoursay.ts";
import { upcomingDeadlines, renderDeadlines, nearPolicyDeadlines } from "../policy/deadlines.ts";
import { nextDeadlines } from "../core/report-state.ts";
import type { PolicyConfig } from "../core/config.ts";
import type { PolicyItem } from "../policy/items.ts";
import { newItems, nextReportedState } from "../core/report-state.ts";

const FIXTURE = JSON.parse(
  fs.readFileSync(new URL("./fixtures/have-your-say.json", import.meta.url), "utf-8"),
) as unknown;
const NOW = new Date("2026-10-14T00:00:00Z");

describe("parseInitiatives", () => {
  const items = parseInitiatives(FIXTURE, NOW);
  const byId = new Map(items.map((i) => [i.id, i]));

  it("maps an open consultation to a stage item with its closing date as the deadline", () => {
    expect(byId.get("hys:19292")).toMatchObject({
      title: "Articles 75c – 75d AI Act Implementing Act",
      link: "https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/19292_en",
      published: "2026-10-12",
      stage: "Draft act",
      deadline: "2026-11-09",
      source: "Have your say",
      jurisdiction: "eu",
      jevOnly: false,
    });
  });

  it("keeps a closed initiative whose stage started in the last 30 days, without a deadline", () => {
    // 18592 started 2026-07-27, feedback closed: older than 30 days on NOW, so dropped.
    expect(byId.has("hys:18592")).toBe(false);
    const item = parseInitiatives(FIXTURE, new Date("2026-08-20T00:00:00Z")).find(
      (i) => i.id === "hys:18592",
    );
    expect(item?.stage).toBe("Call for evidence");
    expect(item?.deadline).toBeUndefined();
  });

  it("drops initiatives that are neither open nor recent (first-run noise)", () => {
    expect(byId.has("hys:12270")).toBe(false); // White Paper, 2020
    expect(byId.has("hys:14398")).toBe(false); // feedback disabled since 2025
  });

  it("takes the later stage when two statuses start the same day", () => {
    expect(byId.get("hys:19293")?.stage).toBe("Public consultation");
  });
});

describe("parseInitiatives across feedback periods", () => {
  // Initiative 18872 (live, 2026-10-14) carries one PLANNING_WORKFLOW status per feedback period.
  const response = (statuses: object[]) => ({
    initiativeResultDtoPage: {
      content: [{ id: 18872, shortTitle: "AI in schools", currentStatuses: statuses }],
    },
  });
  const firstPeriod = {
    frontEndStage: "PLANNING_WORKFLOW",
    receivingFeedbackStatus: "CLOSED",
    feedbackStartDate: "2026/09/01 15:56:21",
    feedbackEndDate: "2026/09/30 23:59:59",
  };
  const secondPeriod = {
    frontEndStage: "PLANNING_WORKFLOW",
    receivingFeedbackStatus: "OPEN",
    feedbackStartDate: "2026/10/12 09:56:10",
    feedbackEndDate: "2026/11/09 23:59:59",
  };

  it("reports an initiative again when a new feedback period opens in the same stage", () => {
    const [before] = parseInitiatives(response([firstPeriod]), new Date("2026-09-02T00:00:00Z"));
    const state = nextReportedState(null, [before!], "2026-09-02");
    const after = parseInitiatives(response([firstPeriod, secondPeriod]), NOW);
    expect(after[0]).toMatchObject({ stage: before!.stage, published: "2026-10-12", deadline: "2026-11-09" });
    expect(newItems(after, state, "2026-10-14")).toHaveLength(1);
  });

  it("does not report it again when the period only closes", () => {
    const open = { ...firstPeriod, receivingFeedbackStatus: "OPEN" };
    const [before] = parseInitiatives(response([open]), new Date("2026-09-02T00:00:00Z"));
    const state = nextReportedState(null, [before!], "2026-09-02");
    const after = parseInitiatives(response([firstPeriod]), new Date("2026-09-20T00:00:00Z"));
    expect(newItems(after, state, "2026-09-20")).toEqual([]);
  });
});

describe("fetchHaveYourSay", () => {
  afterEach(() => vi.restoreAllMocks());

  it("searches 'artificial intelligence' and open 'AI' initiatives, keeping only AI titles from the second", async () => {
    const urls: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      urls.push(String(input));
      // Everything from the open-"AI" search, nothing from the "artificial intelligence" one.
      return new Response(
        JSON.stringify(urls.length === 1 ? { initiativeResultDtoPage: { content: [] } } : FIXTURE),
      );
    });
    const items = await fetchHaveYourSay({
      config: {} as PolicyConfig,
      now: NOW,
      dateStr: "2026-10-14",
      state: null,
    });
    expect(urls).toHaveLength(2);
    expect(urls[1]).toContain("feedbackStatus=OPEN");
    // 19293 (data centres) is open but names no AI.
    expect(items.map((i) => i.id).sort()).toEqual(["hys:14628", "hys:19292"]);
  });

  it("lists an initiative both searches return once", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify(FIXTURE)));
    const items = await fetchHaveYourSay({
      config: {} as PolicyConfig,
      now: NOW,
      dateStr: "2026-10-14",
      state: null,
    });
    expect(items.map((i) => i.id).sort()).toEqual(["hys:14628", "hys:19292", "hys:19293"]);
  });

  it("throws when both searches fail", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 500 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      fetchHaveYourSay({ config: {} as PolicyConfig, now: NOW, dateStr: "2026-10-14", state: null }),
    ).rejects.toThrow("HTTP 500");
  });
});

const item = (id: string, deadline?: string): PolicyItem => ({
  id,
  title: `Title ${id}`,
  link: `https://example.eu/${id}`,
  published: "2026-10-01",
  description: "",
  source: "Have your say",
  jurisdiction: "eu",
  jevOnly: false,
  ...(deadline ? { deadline } : {}),
});

describe("nextDeadlines", () => {
  const prev = {
    old: { date: "2026-10-13", title: "Closed yesterday", link: "l", source: "s" },
    kept: { date: "2026-11-01", title: "Reported last week", link: "l", source: "s" },
    moved: { date: "2026-10-20", title: "Extended", link: "l", source: "s" },
    gone: { date: "2026-10-30", title: "Withdrawn", link: "l", source: "s" },
  };

  it("keeps earlier open deadlines, adds today's, updates moved ones and drops passed or removed ones", () => {
    const next = nextDeadlines(
      prev,
      [item("new", "2026-10-25"), item("nodeadline")],
      [item("moved", "2026-10-27"), item("gone"), item("new", "2026-10-25")],
      "2026-10-14",
    );
    expect(Object.keys(next).sort()).toEqual(["kept", "moved", "new"]);
    expect(next["moved"]?.date).toBe("2026-10-27");
    expect(next["new"]).toEqual({
      date: "2026-10-25",
      title: "Title new",
      link: "https://example.eu/new",
      source: "Have your say",
    });
  });

  it("does not add a fetched item that was never reported", () => {
    expect(nextDeadlines({}, [], [item("dropped", "2026-10-25")], "2026-10-14")).toEqual({});
  });
});

describe("upcomingDeadlines", () => {
  it("lists open deadlines and calendar dates in the next 30 days, soonest first", () => {
    const open = {
      a: { date: "2026-11-09", title: "B", link: "l", source: "Have your say" },
      b: { date: "2026-11-14", title: "Too late", link: "l", source: "Have your say" },
      c: { date: "2026-10-14", title: "Today", link: "l", source: "Have your say" },
    };
    const calendar = [
      { date: "2026-11-13", label: "Last day", link: "c" },
      { date: "2026-10-13", label: "Past", link: "c" },
      { date: "2026-11-09", label: "A", link: "c" },
    ];
    expect(upcomingDeadlines(open, calendar, "2026-10-14").map((d) => d.title)).toEqual([
      "Today",
      "A",
      "B",
      "Last day",
    ]);
  });
});

describe("renderDeadlines", () => {
  it("truncates a long title like the item tables", () => {
    const md = renderDeadlines([
      { date: "2026-11-09", title: "y".repeat(300), link: "https://x.eu", source: "S" },
    ]);
    expect(md).toContain(`[${"y".repeat(200)}…](https://x.eu)`);
  });

  it("renders a table under the section heading", () => {
    const md = renderDeadlines([
      {
        date: "2026-11-09",
        title: "AI Act | implementing act",
        link: "https://x.eu",
        source: "Have your say",
      },
    ]);
    expect(md).toBe(
      "## Coming up\n\nDeadlines and dates in the next 30 days.\n\n| Date | Source | Item |\n| :--- | :--- | :--- |\n" +
        "| 2026-11-09 | Have your say | [AI Act \\| implementing act](https://x.eu) |",
    );
  });

  it("renders nothing without deadlines", () => {
    expect(renderDeadlines([])).toBe("");
  });
});

describe("nearPolicyDeadlines", () => {
  const d = (date: string, link: string) => ({ date, title: link, link, source: "Have your say" });
  it("keeps deadlines within 7 days of earlier items: not today's, not passed, not the calendar", () => {
    const deadlines = [
      d("2026-10-25", "a"),
      d("2026-10-29", "b"),
      d("2026-10-30", "c"),
      d("2026-10-24", "today"),
      d("2026-10-21", "past"),
      { ...d("2026-10-23", "cal"), source: "Calendar" },
    ];
    expect(nearPolicyDeadlines(deadlines, [{ link: "today" }], "2026-10-22").map((x) => x.link)).toEqual([
      "a",
      "b",
    ]);
  });
});
