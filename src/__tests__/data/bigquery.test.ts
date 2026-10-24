import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { parseBigQueryNotes } from "../../data/bigquery.ts";

const fixture = (name: string) => fs.readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf-8");

describe("parseBigQueryNotes", () => {
  const notes = parseBigQueryNotes(fixture("bigquery.xml"));

  it("splits each day's entry into its notes, keyed by anchor and title", () => {
    expect(notes.map((n) => n.id.split("#")[0])).toEqual(
      expect.arrayContaining(["October_16_2026", "October_15_2026"]),
    );
    expect(notes[1]!.id).toBe("October_15_2026#Feature: You can copy tables across regions.");
    expect(new Set(notes.map((n) => n.id)).size).toBe(notes.length);
    expect(notes[1]).toMatchObject({
      title: "Feature: You can copy tables across regions.",
      date: "2026-10-15",
      link: "https://docs.cloud.google.com/bigquery/docs/release-notes#October_15_2026",
      categories: ["Feature"],
    });
    expect(notes[2]!.description).toMatch(/^You can now use column aliases in GoogleSQL\./);
  });

  it("throws when no entry parses", () => {
    expect(() => parseBigQueryNotes("<html></html>")).toThrow("no BigQuery entries");
  });
});
