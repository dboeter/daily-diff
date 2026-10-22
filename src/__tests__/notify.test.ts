import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, afterEach, vi } from "vitest";
import { buildMessage, buildTeamsCard, resolvePagesUrl, sendTeams } from "../cli/notify.ts";
import type { ReportHighlights } from "../reports/prompts-data.ts";
import type { ComingUpEntry } from "../reports/coming-up.ts";
import { REPORT_LABELS } from "../core/i18n.ts";

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
    const msg = buildMessage("2026-03-09", ["ai-agents", "ai-models"], BASE_URL);
    expect(msg).toContain("Daily Diff");
    expect(msg).toContain("2026-03-09");
    expect(msg).toContain("📡");
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-agents`);
    expect(msg).toContain("AI Agents");
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-models`);
    expect(msg).toContain("AI Models &amp; Labs");
  });

  it("escapes a report label in its link", () => {
    expect(buildMessage("2026-03-09", ["ai-models"], BASE_URL)).toContain(">AI Models &amp; Labs</a>");
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
      "ai-models": ["OpenClaw adds MCP support"],
    };
    const msg = buildMessage("2026-03-09", ["ai-agents", "ai-models"], BASE_URL, highlights);
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

  const entry = (n: number): ComingUpEntry => ({
    date: `2026-03-${String(10 + n).padStart(2, "0")}`,
    title: `Deadline ${n}`,
    link: `https://example.com/d?n=${n}&x=1`,
    source: "Calendar",
    page: "ai-policy",
  });

  it("adds Coming up after the highlights, at most 5 entries", () => {
    const comingUp = [1, 2, 3, 4, 5, 6].map(entry);
    comingUp[0] = { ...comingUp[0]!, title: "AI Act <GPAI> rules" };
    const msg = buildMessage("2026-03-09", ["ai-agents"], BASE_URL, { "ai-agents": ["x"] }, comingUp);
    expect(msg).toContain("<b>Coming up</b>");
    expect(msg.indexOf("◦ x")).toBeLessThan(msg.indexOf("Coming up"));
    expect(msg.indexOf("Coming up")).toBeLessThan(msg.indexOf("🌐 Web UI"));
    expect(msg).toContain(
      `• 2026-03-11 · <a href="https://example.com/d?n=1&amp;x=1">AI Act &lt;GPAI&gt; rules</a> (${REPORT_LABELS["ai-policy"]})`,
    );
    expect(msg).toContain("Deadline 5");
    expect(msg).not.toContain("Deadline 6");
  });

  it("leaves Coming up out without entries", () => {
    expect(buildMessage("2026-03-09", ["ai-agents"], BASE_URL, null, [])).not.toContain("Coming up");
    expect(buildMessage("2026-03-09", ["ai-agents"], BASE_URL, null, null)).not.toContain("Coming up");
  });
});

describe("buildTeamsCard", () => {
  const card = buildTeamsCard(
    "2026-10-17",
    ["Spark *4.1* drops `_legacy_` [API](x)", "- not a list"],
    BASE_URL,
  );
  const attachment = card.attachments[0]!;
  const texts = JSON.stringify(attachment.content.body);

  it("wraps one Adaptive Card in a message envelope", () => {
    expect(card.type).toBe("message");
    expect(card.attachments).toHaveLength(1);
    expect(attachment.contentType).toBe("application/vnd.microsoft.card.adaptive");
    expect(attachment.contentUrl).toBeNull();
    expect(attachment.content.type).toBe("AdaptiveCard");
    expect(attachment.content.version).toBe("1.2");
  });

  it("shows the data report's name and the date", () => {
    expect(texts).toContain(REPORT_LABELS["ai-data"]!);
    expect(texts).toContain("2026-10-17");
  });

  it("puts highlights in plain-text runs, so Markdown in them is not parsed", () => {
    const runs = attachment.content.body
      .filter((b) => b.type === "RichTextBlock")
      .map((b) => (b as { inlines: { type: string; text: string }[] }).inlines[0]!);
    expect(runs.map((r) => r.type)).toEqual(["TextRun", "TextRun"]);
    expect(runs.map((r) => r.text)).toEqual(["• Spark *4.1* drops `_legacy_` [API](x)", "• - not a list"]);
  });

  it("links the report on Pages", () => {
    expect(attachment.content.actions).toEqual([
      { type: "Action.OpenUrl", title: "Open report", url: `${BASE_URL}/#2026-10-17/ai-data` },
    ]);
  });

  it("still has the title and the report link without highlights", () => {
    const empty = buildTeamsCard("2026-10-17", [], BASE_URL).attachments[0]!.content;
    expect(empty.body).toHaveLength(2);
    expect(empty.actions[0]!.url).toBe(`${BASE_URL}/#2026-10-17/ai-data`);
  });
});

describe("sendTeams", () => {
  const origWebhook = process.env["TEAMS_WEBHOOK_URL"];
  const origSummary = process.env["GITHUB_STEP_SUMMARY"];
  const highlights: ReportHighlights = { "ai-data": ["Snowflake ships a thing."] };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (origWebhook !== undefined) process.env["TEAMS_WEBHOOK_URL"] = origWebhook;
    else delete process.env["TEAMS_WEBHOOK_URL"];
    if (origSummary !== undefined) process.env["GITHUB_STEP_SUMMARY"] = origSummary;
    else delete process.env["GITHUB_STEP_SUMMARY"];
  });

  it("does nothing when TEAMS_WEBHOOK_URL is unset", async () => {
    delete process.env["TEAMS_WEBHOOK_URL"];
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await sendTeams("2026-10-17", highlights);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not post when the data report has no highlights", async () => {
    process.env["TEAMS_WEBHOOK_URL"] = "https://teams.example.com/hook";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "log").mockImplementation(() => {});
    await sendTeams("2026-10-17", { "ai-agents": ["x"] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs a non-2xx answer and writes a step-summary warning without throwing", async () => {
    const summary = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "teams-")), "summary.md");
    process.env["TEAMS_WEBHOOK_URL"] = "https://teams.example.com/hook";
    process.env["GITHUB_STEP_SUMMARY"] = summary;
    const fetchMock = vi.fn().mockResolvedValue(new Response("bad card", { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(sendTeams("2026-10-17", highlights)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalled();
    expect(fs.readFileSync(summary, "utf-8")).toContain("**Teams notification failed** — HTTP 400: bad card");
  });
});
