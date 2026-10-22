import { describe, it, expect } from "vitest";
import { buildComingUp } from "../reports/coming-up.ts";
import type { PolicyState } from "../policy/policy.ts";
import type { DataState } from "../data/vendors.ts";
import type { OpenRouterStealthModel } from "../sources/openrouter.ts";

const TODAY = "2026-10-22";

const policy: PolicyState = {
  reported: {},
  stages: {},
  deadlines: {
    "hys:1": { date: "2026-11-09", title: "Feedback closes", link: "https://hys/1", source: "Have your say" },
    "hys:old": {
      date: "2026-10-21",
      title: "Closed yesterday",
      link: "https://hys/0",
      source: "Have your say",
    },
  },
};
const calendar = [{ date: "2026-11-21", label: "Day 30", link: "https://cal/30" }];
const data: DataState = {
  reported: {},
  stages: {},
  actions: {
    a: {
      date: "2026-10-22",
      title: "Runtime retired",
      link: "https://dbx/a",
      source: "Azure Databricks",
      summary: "Move off it.",
    },
    far: { date: "2026-11-22", title: "Day 31", link: "https://dbx/far", source: "Azure Databricks" },
  },
};
const stealth: OpenRouterStealthModel[] = [
  { id: "stealth/bunny", name: "Bunny Alpha", created: "2026-10-01", expires: "2026-10-30" },
  { id: "stealth/open", name: "Open-ended", created: "2026-10-01", expires: null },
];

describe("buildComingUp", () => {
  it("merges every page's dated items in the 30-day window, nearest first", () => {
    expect(buildComingUp({ policy, calendar, data, stealth }, TODAY)).toEqual([
      {
        date: "2026-10-22",
        title: "Runtime retired",
        link: "https://dbx/a",
        source: "Azure Databricks",
        page: "ai-data",
      },
      {
        date: "2026-10-30",
        title: "Bunny Alpha (stealth model) expires",
        link: "https://openrouter.ai/stealth/bunny",
        source: "OpenRouter",
        page: "ai-models",
      },
      {
        date: "2026-11-09",
        title: "Feedback closes",
        link: "https://hys/1",
        source: "Have your say",
        page: "ai-policy",
      },
      { date: "2026-11-21", title: "Day 30", link: "https://cal/30", source: "Calendar", page: "ai-policy" },
    ]);
  });

  it("orders entries of one date by title, across pages", () => {
    const sameDay: DataState = {
      reported: {},
      actions: { b: { date: "2026-11-09", title: "A first", link: "https://dbx/b", source: "Snowflake" } },
    };
    const titles = buildComingUp({ policy, calendar: [], data: sameDay, stealth: null }, TODAY).map(
      (e) => e.title,
    );
    expect(titles).toEqual(["A first", "Feedback closes"]);
  });

  it("keeps the calendar when the states are missing or the catalog unavailable", () => {
    expect(buildComingUp({ policy: null, calendar, data: null, stealth: null }, TODAY)).toEqual([
      { date: "2026-11-21", title: "Day 30", link: "https://cal/30", source: "Calendar", page: "ai-policy" },
    ]);
  });

  it("is empty when nothing is dated", () => {
    expect(buildComingUp({ policy: null, calendar: [], data: null, stealth: [] }, TODAY)).toEqual([]);
    expect(
      buildComingUp({ policy: { reported: {} }, calendar: [], data: { reported: {} }, stealth: null }, TODAY),
    ).toEqual([]);
  });
});
