import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Candidate } from "../../reports/candidates.ts";
import { loadWeek } from "../../weekly/week.ts";

const note = (title: string): Candidate => ({
  page: "ai-data",
  kind: "vendor-note",
  source: "Azure Databricks",
  title,
  url: `https://example.com/${title}`,
  published: "2026-11-01",
  text: `${title} text`,
});
const story: Candidate = { ...note("story"), page: "ai-agents", kind: "story", source: "Hacker News" };

let dir: string;
const save = (date: string, file: string, content: string) => {
  fs.mkdirSync(path.join(dir, date), { recursive: true });
  fs.writeFileSync(path.join(dir, date, file), content);
};

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-week-"));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("loadWeek", () => {
  it("reads the six days before the run from disk and takes today from the caller", () => {
    save("2026-11-10", "ai-agents.md", "agents of the 10th");
    save("2026-11-10", "candidates.json", JSON.stringify([story]));
    save("2026-11-15", "ai-data.md", "data of the 15th");
    // A same-day re-run: yesterday's run of today's folder is on disk, and is not today's input.
    save("2026-11-16", "ai-agents.md", "an earlier run of today");
    save("2026-11-16", "candidates.json", JSON.stringify([note("stale")]));
    // Last week's article is no source of this week's.
    save("2026-11-10", "ai-weekly.md", "last week's article");
    const today = {
      date: "2026-11-16",
      candidates: [note("today")],
      pages: { "ai-agents": "today's agents" },
    };

    const { days } = loadWeek(today, dir);

    expect(days.map((d) => d.date)).toEqual([
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
      "2026-11-16",
    ]);
    expect(days[0]).toEqual({
      date: "2026-11-10",
      candidates: [story],
      pages: { "ai-agents": "agents of the 10th" },
    });
    // A day without a run: nothing, not an error.
    expect(days[1]).toEqual({ date: "2026-11-11", candidates: [], pages: {} });
    expect(days[5]?.pages).toEqual({ "ai-data": "data of the 15th" });
    expect(days[6]).toBe(today);
  });

  it("collects the vendor notes of every saved day, oldest first, then today's", () => {
    save("2026-10-02", "candidates.json", JSON.stringify([note("october"), story]));
    save("2026-11-12", "candidates.json", JSON.stringify([note("this-week")]));
    save("2026-11-16", "candidates.json", JSON.stringify([note("stale")]));
    save("2026-11-13", "candidates.json", "{ not json");
    fs.writeFileSync(path.join(dir, "data-state.json"), "{}");

    const { vendorNotes } = loadWeek(
      { date: "2026-11-16", candidates: [note("today"), story], pages: {} },
      dir,
    );

    expect(vendorNotes.map((c) => c.title)).toEqual(["october", "this-week", "today"]);
  });
});
