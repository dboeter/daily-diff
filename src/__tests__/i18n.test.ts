import { describe, it, expect } from "vitest";
import {
  WEB_REPORT,
  ISSUE_LABELS,
  REPORTS,
  LIVE_REPORT_IDS,
  REPORT_LABELS,
  reportHeading,
  reportIssueTitle,
} from "../i18n.ts";

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

  it("flags the web report's first crawl in its issue title", () => {
    expect(WEB_REPORT.issueTitle("2026-03-12", true)).toBe(
      `${reportIssueTitle("ai-web", "2026-03-12")} (First Crawl)`,
    );
    expect(WEB_REPORT.issueTitle("2026-03-12", false)).toBe(reportIssueTitle("ai-web", "2026-03-12"));
  });
});

// ---------------------------------------------------------------------------
// Dynamic content functions
// ---------------------------------------------------------------------------

describe("dynamic content helpers", () => {
  it("WEB_REPORT.newContent formats count", () => {
    expect(WEB_REPORT.newContent(10)).toContain("10 articles");
  });

  it("WEB_REPORT.generated formats timestamp", () => {
    expect(WEB_REPORT.generated("12:00")).toContain("12:00 UTC");
  });
});

// ---------------------------------------------------------------------------
// ISSUE_LABELS
// ---------------------------------------------------------------------------

describe("ISSUE_LABELS", () => {
  it("maps report types to label names", () => {
    expect(ISSUE_LABELS.agents).toBe("agents");
    expect(ISSUE_LABELS.trending).toBe("trending");
    expect(ISSUE_LABELS.hn).toBe("hn");
  });
});

// ---------------------------------------------------------------------------
// REPORT_LABELS
// ---------------------------------------------------------------------------

describe("REPORT_LABELS", () => {
  it("keeps the retired reports for archived days", () => {
    for (const id of ["ai-cli", "ai-ph", "ai-weekly", "ai-monthly"]) expect(REPORT_LABELS[id]).toBeTruthy();
  });
});
