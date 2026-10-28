import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { parseBigQueryNotes } from "../../data/bigquery.ts";

const fixture = (name: string) => fs.readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf-8");

describe("parseBigQueryNotes", () => {
  const notes = parseBigQueryNotes(fixture("bigquery.xml"));
  const onDay = (anchor: string) => notes.filter((n) => n.id.startsWith(`${anchor}#`));

  it("splits each day's entry into its notes, keyed by anchor and the pre-label title", () => {
    expect(notes.map((n) => n.id.split("#")[0])).toEqual(
      expect.arrayContaining(["October_16_2026", "October_15_2026"]),
    );
    const [copy, aliases] = onDay("October_15_2026");
    // The id the verdict cache already holds for this note.
    expect(copy!.id).toBe("October_15_2026#Feature: You can copy tables across regions.");
    expect(new Set(notes.map((n) => n.id)).size).toBe(notes.length);
    expect(copy).toMatchObject({
      title: "You can copy tables across regions (GA)",
      date: "2026-10-15",
      link: "https://docs.cloud.google.com/bigquery/docs/release-notes#October_15_2026",
      categories: ["Feature"],
    });
    expect(aliases!.description).toMatch(/^You can now use column aliases in GoogleSQL\./);
  });

  it("labels a note by its first sentence, without the type prefix, and its stage from the body", () => {
    const [drive, udf, logging] = onDay("October_27_2026");
    expect(drive!.title).toBe("The Data Engineering Agent now integrates with Google Drive (GA)");
    expect(drive!.id).toBe(
      "October_27_2026#Feature: The Data Engineering Agent now integrates with Google Drive, letting you provide Google Sheets, CSV, or JSONL files from Google Drive as inputs for your pipelines.",
    );
    expect(drive!.description).toMatch(/This feature is generally available \(GA\)\.$/);
    expect(udf!.title).toBe("Python user-defined functions now support volume mounts (Preview)");
    // The stage phrase in the first sentence is replaced, not doubled.
    expect(logging!.title).toBe("Conversation logging for Conversational analytics in BigQuery (GA)");
  });

  it("adds no stage when the note states none", () => {
    expect(onDay("October_16_2026")[0]!.title).toBe(
      "Conversational analytics in BigQuery is now available in the following locations",
    );
  });

  it("throws when no entry parses", () => {
    expect(() => parseBigQueryNotes("<html></html>")).toThrow("no BigQuery entries");
  });
});
