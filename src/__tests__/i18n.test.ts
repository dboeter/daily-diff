import { describe, it, expect } from "vitest";
import {
  CLI_REPORT,
  WEB_REPORT,
  TRENDING_REPORT,
  HN_REPORT,
  ISSUE_LABELS,
  CLI_ISSUE_TITLE,
  OPENCLAW_ISSUE_TITLE,
  INFRA_ISSUE_TITLE,
  NOTIFY_LABELS,
  REPORT_LABELS,
} from "../i18n.ts";

// ---------------------------------------------------------------------------
// Dynamic title functions
// ---------------------------------------------------------------------------

describe("issue title functions", () => {
  it("CLI_ISSUE_TITLE includes title and date", () => {
    expect(CLI_ISSUE_TITLE("2026-03-12")).toContain("AI CLI Tools Digest");
    expect(CLI_ISSUE_TITLE("2026-03-12")).toContain("2026-03-12");
  });

  it("OPENCLAW_ISSUE_TITLE includes title", () => {
    expect(OPENCLAW_ISSUE_TITLE("2026-03-12")).toContain("OpenClaw Ecosystem Digest");
  });

  it("INFRA_ISSUE_TITLE includes title and date", () => {
    expect(INFRA_ISSUE_TITLE("2026-03-12")).toContain("AI Infrastructure Digest");
    expect(INFRA_ISSUE_TITLE("2026-03-12")).toContain("2026-03-12");
  });

  it("WEB_REPORT.issueTitle includes first crawl flag", () => {
    expect(WEB_REPORT.issueTitle("2026-03-12", true)).toContain("First Crawl");
    expect(WEB_REPORT.issueTitle("2026-03-12", false)).not.toContain("First Crawl");
  });

  it("TRENDING_REPORT.issueTitle includes title", () => {
    expect(TRENDING_REPORT.issueTitle("2026-03-12")).toContain("Open Source Trends");
  });

  it("HN_REPORT.issueTitle includes title", () => {
    expect(HN_REPORT.issueTitle("2026-03-12")).toContain("Hacker News");
  });
});

// ---------------------------------------------------------------------------
// Dynamic content functions
// ---------------------------------------------------------------------------

describe("dynamic content helpers", () => {
  it("CLI_REPORT.meta produces metadata", () => {
    const meta = CLI_REPORT.meta("12:00", 5);
    expect(meta).toContain("12:00");
    expect(meta).toContain("Tools covered: 5");
  });

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
    expect(ISSUE_LABELS.cli).toBe("digest");
    expect(ISSUE_LABELS.openclaw).toBe("openclaw");
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
});

// ---------------------------------------------------------------------------
// NOTIFY_LABELS
// ---------------------------------------------------------------------------

describe("NOTIFY_LABELS", () => {
  it("covers all report types", () => {
    const expected = ["ai-cli", "ai-agents", "ai-infra", "ai-web", "ai-trending", "ai-hn"];
    for (const key of expected) {
      expect(NOTIFY_LABELS[key]).toBeTruthy();
    }
  });
});
