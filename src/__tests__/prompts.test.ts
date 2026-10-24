import { describe, it, expect } from "vitest";
import { formatItem, goingAwayRule, topN } from "../reports/prompts.ts";
import { highlightsOnly, signListItems } from "../reports/report-builders.ts";
import type { GitHubItem } from "../core/github.ts";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<GitHubItem> = {}): GitHubItem {
  return {
    number: 1,
    title: "Test issue",
    state: "open",
    user: { login: "alice" },
    labels: [],
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 5,
    reactions: { "+1": 3 },
    body: "Some body text",
    html_url: "https://github.com/org/repo/issues/1",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// formatItem
// ---------------------------------------------------------------------------

describe("formatItem", () => {
  it("formats a basic item", () => {
    const result = formatItem(makeItem());
    expect(result).toContain("#1 [OPEN]");
    expect(result).toContain("Test issue");
    expect(result).toContain("Author: alice");
    expect(result).toContain("Comments: 5");
    expect(result).toContain("👍: 3");
    expect(result).toContain("URL: org/repo Issue #1");
    expect(result).toContain("Summary: Some body text");
  });

  it("includes labels when present", () => {
    const item = makeItem({ labels: [{ name: "bug" }, { name: "critical" }] });
    const result = formatItem(item);
    expect(result).toContain("[bug, critical]");
  });

  it("shows no label bracket when labels empty", () => {
    const result = formatItem(makeItem({ labels: [] }));
    expect(result).toContain("#1 [OPEN] Test issue");
    expect(result).not.toContain("[]");
  });

  it("truncates body at 300 chars with ellipsis", () => {
    const longBody = "A".repeat(400);
    const result = formatItem(makeItem({ body: longBody }));
    expect(result).toContain("A".repeat(300) + "...");
  });

  it("does not add ellipsis for body <= 300 chars", () => {
    const result = formatItem(makeItem({ body: "Short body" }));
    expect(result).toContain("Short body");
    expect(result).not.toContain("...");
  });

  it("handles null body gracefully", () => {
    const result = formatItem(makeItem({ body: null }));
    expect(result).toContain("Summary: ");
  });

  it("handles missing reactions gracefully", () => {
    const result = formatItem(makeItem({ reactions: undefined }));
    expect(result).toContain("👍: 0");
  });

  it("replaces newlines in body with spaces", () => {
    const result = formatItem(makeItem({ body: "line1\nline2\nline3" }));
    expect(result).toContain("line1 line2 line3");
  });

  it("shows closed state uppercase", () => {
    const result = formatItem(makeItem({ state: "closed" }));
    expect(result).toContain("[CLOSED]");
  });
});

// ---------------------------------------------------------------------------
// topN
// ---------------------------------------------------------------------------

describe("topN", () => {
  it("returns top N items sorted by comment count desc", () => {
    const items = [
      makeItem({ number: 1, comments: 2 }),
      makeItem({ number: 2, comments: 10 }),
      makeItem({ number: 3, comments: 5 }),
      makeItem({ number: 4, comments: 8 }),
    ];
    const result = topN(items, 2);
    expect(result).toHaveLength(2);
    expect(result[0]!.number).toBe(2);
    expect(result[1]!.number).toBe(4);
  });

  it("returns all items if n >= items.length", () => {
    const items = [makeItem({ comments: 1 }), makeItem({ comments: 2 })];
    expect(topN(items, 5)).toHaveLength(2);
  });

  it("does not mutate the original array", () => {
    const items = [makeItem({ comments: 1 }), makeItem({ comments: 5 })];
    const original = [...items];
    topN(items, 1);
    expect(items[0]!.comments).toBe(original[0]!.comments);
    expect(items[1]!.comments).toBe(original[1]!.comments);
  });

  it("returns empty array for empty input", () => {
    expect(topN([], 3)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// formatDiscussion
// ---------------------------------------------------------------------------

describe("signListItems", () => {
  it("turns a hyphen or dash opening a list item into the minus sign, so it nests no list", () => {
    const md =
      "- - **Snowflake** retires X\n- – Fabric ends Y\n* — BigQuery drops Z\n- **DuckDB** 2.0 ships\n  - nested - stays";
    expect(signListItems(md)).toBe(
      "- − **Snowflake** retires X\n- − Fabric ends Y\n* − BigQuery drops Z\n- **DuckDB** 2.0 ships\n  - nested - stays",
    );
  });

  it("lands in a page's Highlights through highlightsOnly", () => {
    expect(highlightsOnly("## Highlights\n\n- - **X** is retired\n- **Y** ships")).toBe(
      "## Highlights\n\n- − **X** is retired\n- **Y** ships",
    );
  });

  it("makes a list of a section whose every bullet opens with the sign instead of a marker", () => {
    expect(highlightsOnly("## Highlights\n\n− **X** launches\n− **Y** ships")).toBe(
      "## Highlights\n\n- **X** launches\n- **Y** ships",
    );
  });

  it("lists each section of a longer reply on its own, with wrapped lines kept", () => {
    expect(
      signListItems("## Highlights\n\n- **Y** ships\n\n## Signals\n\n– Z grows,\n  fast\n— W slows"),
    ).toBe("## Highlights\n\n- **Y** ships\n\n## Signals\n\n- Z grows,\n  fast\n- W slows");
  });

  it("lists a section whose sign lines are followed by a rule or the tables marker", () => {
    expect(signListItems("## Highlights\n\n− X\n− Y\n\n<!-- tables -->\n\n---\n\n## Signals")).toBe(
      "## Highlights\n\n- X\n- Y\n\n<!-- tables -->\n\n---\n\n## Signals",
    );
  });

  it("leaves one unmarked sign line among prose or list items alone", () => {
    const md =
      "## Highlights\n\n- **X** ships a long thing\n— and more\n\nProse that wraps\n– after a dash\n\n```\n— code\n```";
    expect(signListItems(md)).toBe(md);
  });

  it("asks for the marker on every bullet and the sign after it", () => {
    expect(goingAwayRule("bullet")).toContain('Write every bullet as "- text"');
    expect(goingAwayRule("bullet")).toContain('"- − text"');
    expect(goingAwayRule("highlight")).toMatch(/^Start a highlight with "− "/);
  });
});
