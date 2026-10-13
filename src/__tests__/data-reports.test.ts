import { describe, it, expect, vi } from "vitest";
import { buildDiscussionsReport } from "../data-reports.ts";
import type { DevtoData } from "../devto.ts";

const callLlm = vi.fn(async () => "# Model title\n\n## Highlights\n\nText.");
vi.mock("../report.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../report.ts")>()),
  callLlm: (...args: unknown[]) => callLlm(...(args as [])),
}));

const devto: DevtoData = {
  fetchSuccess: true,
  articles: [
    {
      id: 1,
      title: "MCP lesson",
      url: "https://dev.to/a/mcp",
      description: "d",
      user: "u",
      positiveReactionsCount: 78,
      commentsCount: 85,
      readingTimeMinutes: 5,
      tags: ["ai"],
      publishedAt: "2026-10-10T00:00:00Z",
    },
  ],
};

describe("buildDiscussionsReport", () => {
  it("is still written when HN fails but Dev.to succeeds", async () => {
    const report = await buildDiscussionsReport(
      { hn: { stories: [], fetchSuccess: false }, devto, lobsters: { stories: [], fetchSuccess: false } },
      "00:00",
      "2026-10-12",
    );
    expect(report?.id).toBe("ai-hn");
    expect(report?.content).toContain("[Dev.to](https://dev.to/) (1 articles)");
    expect(report?.content).not.toContain("Hacker News](");
    expect(report?.content).not.toContain("# Model title");
  });

  it("is skipped when every source failed, without an LLM call", async () => {
    callLlm.mockClear();
    const none = { stories: [], fetchSuccess: false };
    const report = await buildDiscussionsReport(
      { hn: none, devto: { articles: [], fetchSuccess: false }, lobsters: none },
      "00:00",
      "2026-10-12",
    );
    expect(report).toBeNull();
    expect(callLlm).not.toHaveBeenCalled();
  });
});
