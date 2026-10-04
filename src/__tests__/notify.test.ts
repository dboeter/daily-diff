import { describe, it, expect, afterEach } from "vitest";
import { buildMessage, resolvePagesUrl } from "../notify.ts";
import type { ReportHighlights } from "../prompts-data.ts";

const BASE_URL = "https://example.com/radar";

describe("resolvePagesUrl", () => {
  const origPagesUrl = process.env["PAGES_URL"];
  const origGhaRepo = process.env["GITHUB_REPOSITORY"];

  afterEach(() => {
    if (origPagesUrl !== undefined) process.env["PAGES_URL"] = origPagesUrl;
    else delete process.env["PAGES_URL"];
    if (origGhaRepo !== undefined) process.env["GITHUB_REPOSITORY"] = origGhaRepo;
    else delete process.env["GITHUB_REPOSITORY"];
  });

  it("prioritizes explicit argument override", () => {
    process.env["PAGES_URL"] = "https://env.example.com/";
    process.env["GITHUB_REPOSITORY"] = "owner/repo";
    expect(resolvePagesUrl("https://override.example.com/")).toBe("https://override.example.com");
  });

  it("reads PAGES_URL environment variable when override is omitted", () => {
    delete process.env["GITHUB_REPOSITORY"];
    process.env["PAGES_URL"] = "https://env.example.com/";
    expect(resolvePagesUrl()).toBe("https://env.example.com");
  });

  it("derives GitHub Pages URL from GITHUB_REPOSITORY if PAGES_URL is not set", () => {
    delete process.env["PAGES_URL"];
    process.env["GITHUB_REPOSITORY"] = "octocat/hello-world";
    expect(resolvePagesUrl()).toBe("https://octocat.github.io/hello-world");
  });

  it("falls back to default URL when neither is set", () => {
    delete process.env["PAGES_URL"];
    delete process.env["GITHUB_REPOSITORY"];
    expect(resolvePagesUrl()).toBe("https://dboeter.github.io/daily-diff");
  });
});

describe("buildMessage", () => {
  const origPagesUrl = process.env["PAGES_URL"];

  afterEach(() => {
    if (origPagesUrl !== undefined) {
      process.env["PAGES_URL"] = origPagesUrl;
    } else {
      delete process.env["PAGES_URL"];
    }
  });

  it("builds a daily message with report links", () => {
    const msg = buildMessage("2026-03-09", ["ai-agents", "ai-hn"], BASE_URL);
    expect(msg).toContain("Daily Diff");
    expect(msg).toContain("2026-03-09");
    expect(msg).toContain("📡");
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-agents`);
    expect(msg).toContain("AI Agents");
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-hn`);
    expect(msg).toContain("HN Community");
  });

  it("includes Web UI and RSS links", () => {
    const msg = buildMessage("2026-03-09", ["ai-agents"], BASE_URL);
    expect(msg).toContain("🌐 Web UI");
    expect(msg).toContain("RSS");
    expect(msg).toContain(`${BASE_URL}/feed.xml`);
  });

  it("strips trailing slash from pagesUrl", () => {
    const msg = buildMessage("2026-03-09", ["ai-agents"], BASE_URL + "/");
    expect(msg).not.toContain("//feed.xml");
    expect(msg).toContain(`${BASE_URL}/feed.xml`);
  });

  it("includes highlights when provided", () => {
    const highlights: ReportHighlights = {
      "ai-agents": ["Claude Code releases v1.2.0", "Gemini CLI fixes streaming"],
      "ai-hn": ["OpenClaw adds MCP support"],
    };
    const msg = buildMessage("2026-03-09", ["ai-agents", "ai-hn"], BASE_URL, highlights);
    expect(msg).toContain("◦ Claude Code releases v1.2.0");
    expect(msg).toContain("◦ Gemini CLI fixes streaming");
    expect(msg).toContain("◦ OpenClaw adds MCP support");
  });

  it("escapes HTML in highlights", () => {
    const msg = buildMessage("2026-03-09", ["ai-agents"], BASE_URL, { "ai-agents": ["a <b> & c"] });
    expect(msg).toContain("◦ a &lt;b&gt; &amp; c");
  });

  it("works without highlights (null)", () => {
    const msg = buildMessage("2026-03-09", ["ai-agents"], BASE_URL, null);
    expect(msg).toContain("AI Agents");
    expect(msg).not.toContain("◦");
  });

  it("works without highlights (undefined)", () => {
    const msg = buildMessage("2026-03-09", ["ai-agents"], BASE_URL);
    expect(msg).toContain("AI Agents");
    expect(msg).not.toContain("◦");
  });
});
