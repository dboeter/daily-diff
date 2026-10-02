import { describe, it, expect, afterEach } from "vitest";
import { buildMessage } from "../notify.ts";
import type { ReportHighlights } from "../prompts-data.ts";

const BASE_URL = "https://example.com/radar";

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
    const msg = buildMessage("2026-03-09", ["ai-cli", "ai-agents"], BASE_URL);
    expect(msg).toContain("Daily Diff");
    expect(msg).toContain("2026-03-09");
    expect(msg).toContain("📡");
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-cli`);
    expect(msg).toContain("AI CLI Tools");
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-agents`);
    expect(msg).toContain("AI Agents Ecosystem");
  });

  it("includes Web UI and RSS links", () => {
    const msg = buildMessage("2026-03-09", ["ai-cli"], BASE_URL);
    expect(msg).toContain("🌐 Web UI");
    expect(msg).toContain("RSS");
    expect(msg).toContain(`${BASE_URL}/feed.xml`);
  });

  it("strips trailing slash from pagesUrl", () => {
    const msg = buildMessage("2026-03-09", ["ai-cli"], BASE_URL + "/");
    expect(msg).not.toContain("//feed.xml");
    expect(msg).toContain(`${BASE_URL}/feed.xml`);
  });

  it("includes highlights when provided", () => {
    const highlights: ReportHighlights = {
      "ai-cli": ["Claude Code releases v1.2.0", "Gemini CLI fixes streaming"],
      "ai-agents": ["OpenClaw adds MCP support"],
    };
    const msg = buildMessage("2026-03-09", ["ai-cli", "ai-agents"], BASE_URL, highlights);
    expect(msg).toContain("◦ Claude Code releases v1.2.0");
    expect(msg).toContain("◦ Gemini CLI fixes streaming");
    expect(msg).toContain("◦ OpenClaw adds MCP support");
  });

  it("escapes HTML in highlights", () => {
    const msg = buildMessage("2026-03-09", ["ai-cli"], BASE_URL, { "ai-cli": ["a <b> & c"] });
    expect(msg).toContain("◦ a &lt;b&gt; &amp; c");
  });

  it("works without highlights (null)", () => {
    const msg = buildMessage("2026-03-09", ["ai-cli"], BASE_URL, null);
    expect(msg).toContain("AI CLI Tools");
    expect(msg).not.toContain("◦");
  });

  it("works without highlights (undefined)", () => {
    const msg = buildMessage("2026-03-09", ["ai-cli"], BASE_URL);
    expect(msg).toContain("AI CLI Tools");
    expect(msg).not.toContain("◦");
  });
});
