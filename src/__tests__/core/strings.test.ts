import { describe, it, expect } from "vitest";
import {
  REPORT_META,
  REPORTS,
  SPOTTED,
  LIVE_REPORT_IDS,
  REPORT_LABELS,
  WEEKLY_REPORT_IDS,
  reportHeading,
  reportIssueTitle,
} from "../../core/strings.ts";

// ---------------------------------------------------------------------------
// One name per report
// ---------------------------------------------------------------------------

describe("report names", () => {
  it("derives the H1, the issue title and the label from the one name", () => {
    for (const id of LIVE_REPORT_IDS) {
      const { emoji, name } = REPORTS[id];
      expect(reportHeading(id, "2026-03-12")).toBe(`# ${name} 2026-03-12`);
      expect(reportIssueTitle(id, "2026-03-12")).toBe(`${emoji} ${name} 2026-03-12`);
      expect(REPORT_LABELS[id]).toBe(name);
    }
  });

  it("keeps cadence words out of the names: the archive holds daily and weekly editions", () => {
    for (const id of LIVE_REPORT_IDS) expect(REPORTS[id].name).not.toMatch(/daily|weekly|today/i);
  });
});

// ---------------------------------------------------------------------------
// Dynamic content functions
// ---------------------------------------------------------------------------

describe("dynamic content helpers", () => {
  it("REPORT_META.generated formats timestamp", () => {
    expect(REPORT_META.generated("12:00")).toContain("12:00 UTC");
  });
});

// ---------------------------------------------------------------------------
// REPORT_LABELS
// ---------------------------------------------------------------------------

describe("REPORT_LABELS", () => {
  it("keeps the retired reports for archived days", () => {
    for (const id of ["ai-cli", "ai-ph", "ai-weekly", "ai-monthly", "ai-trending", "ai-hf", "ai-arxiv"])
      expect(REPORT_LABELS[id]).toBeTruthy();
  });
});

describe("WEEKLY_REPORT_IDS", () => {
  it("names live reports", () => {
    for (const id of WEEKLY_REPORT_IDS) expect(LIVE_REPORT_IDS).toContain(id);
  });

  it("gives every live report its own issue label", () => {
    const labels = LIVE_REPORT_IDS.map((id) => REPORTS[id].label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("SPOTTED.counts", () => {
  it("pluralises each count (2026-10-26: '9 points, 1 comments')", () => {
    expect(SPOTTED.counts("hn", 9, 1)).toBe("9 points, 1 comment");
    expect(SPOTTED.counts("devto", 1, 0)).toBe("1 reaction, 0 comments");
    expect(SPOTTED.counts("lobsters", 1, 2)).toBe("1 point, 2 comments");
  });
});

describe("REPORT_META.line", () => {
  it("puts the counts first and Generated last, skipping empty parts", () => {
    expect(REPORT_META.line(["A: 1", "", "B: 2"], "04:31")).toBe("> A: 1 | B: 2 | Generated: 04:31 UTC");
  });
});
