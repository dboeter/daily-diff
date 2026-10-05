import { describe, it, expect } from "vitest";
import {
  WEB_REPORT,
  TRENDING_REPORT,
  HN_REPORT,
  ISSUE_LABELS,
  AGENTS_REPORT,
  INFRA_REPORT,
  NOTIFY_LABELS,
  REPORT_LABELS,
} from "../i18n.ts";

// ---------------------------------------------------------------------------
// Dynamic title functions
// ---------------------------------------------------------------------------

describe("issue title functions", () => {
  it("AGENTS_REPORT.issueTitle includes title and date", () => {
    expect(AGENTS_REPORT.issueTitle("2026-03-12")).toContain("AI Agents Digest");
    expect(AGENTS_REPORT.issueTitle("2026-03-12")).toContain("2026-03-12");
  });

  it("INFRA_REPORT.issueTitle includes title and date", () => {
    expect(INFRA_REPORT.issueTitle("2026-03-12")).toContain("AI Infrastructure Weekly");
    expect(INFRA_REPORT.issueTitle("2026-03-12")).toContain("2026-03-12");
  });

  it("WEB_REPORT.issueTitle includes first crawl flag", () => {
    expect(WEB_REPORT.issueTitle("2026-03-12", true)).toContain("First Crawl");
    expect(WEB_REPORT.issueTitle("2026-03-12", false)).not.toContain("First Crawl");
  });

  it("TRENDING_REPORT.issueTitle includes title", () => {
    expect(TRENDING_REPORT.issueTitle("2026-03-12")).toContain("Agent & AI Coding Trends");
  });

  it("HN_REPORT.issueTitle includes title", () => {
    expect(HN_REPORT.issueTitle("2026-03-12")).toContain("Hacker News");
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
    expect(ISSUE_LABELS.infra).toBe("infra");
    expect(ISSUE_LABELS.trending).toBe("trending");
    expect(ISSUE_LABELS.hn).toBe("hn");
  });
});

// ---------------------------------------------------------------------------
// REPORT_LABELS
// ---------------------------------------------------------------------------

describe("REPORT_LABELS", () => {
  it("covers the infra report", () => {
    expect(REPORT_LABELS["ai-infra"]).toBe("AI Infrastructure Digest");
  });

  it("keeps the merged CLI report for archived days", () => {
    expect(REPORT_LABELS["ai-cli"]).toBeTruthy();
    expect(REPORT_LABELS["ai-agents"]).toBe("AI Agents Digest");
  });
});

// ---------------------------------------------------------------------------
// NOTIFY_LABELS
// ---------------------------------------------------------------------------

describe("NOTIFY_LABELS", () => {
  it("covers all report types", () => {
    const expected = ["ai-agents", "ai-infra", "ai-web", "ai-trending", "ai-hn"];
    for (const key of expected) {
      expect(NOTIFY_LABELS[key]).toBeTruthy();
    }
  });
});
