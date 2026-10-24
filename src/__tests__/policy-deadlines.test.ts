import { describe, expect, it } from "vitest";
import { nearPolicyDeadlines, renderDeadlines, upcomingDeadlines } from "../policy/deadlines.ts";

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
