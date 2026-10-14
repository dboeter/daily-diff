import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import { buildDiscussionsReport, buildPolicyReport } from "../data-reports.ts";
import type { PolicyData } from "../policy.ts";
import type { DevtoData } from "../devto.ts";

const generateBody = vi.fn(async (_prompt: string) => "## Highlights\n\nText.");
vi.mock("../report.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../report.ts")>()),
  generateBody: (...args: unknown[]) => generateBody(...(args as [string])),
  saveFile: (...args: unknown[]) => saveFile(...(args as [string, string, string])),
}));
const saveFile = vi.fn((_content: string, dateStr: string, name: string) => `digests/${dateStr}/${name}`);

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
    generateBody.mockClear();
    const report = await buildDiscussionsReport(
      { hn: { stories: [], fetchSuccess: false }, devto, lobsters: { stories: [], fetchSuccess: false } },
      "00:00",
      "2026-10-12",
    );
    expect(report?.id).toBe("ai-hn");
    expect(report?.content).toContain("[Dev.to](https://dev.to/) (1 articles)");
    expect(report?.content).not.toContain("Hacker News](");
    expect(report?.content).toContain("## Highlights\n\nText.");
    expect(generateBody).toHaveBeenCalledOnce();
  });

  it("is skipped when every source failed, without an LLM call", async () => {
    generateBody.mockClear();
    const none = { stories: [], fetchSuccess: false };
    const report = await buildDiscussionsReport(
      { hn: none, devto: { articles: [], fetchSuccess: false }, lobsters: none },
      "00:00",
      "2026-10-12",
    );
    expect(report).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
  });
});

describe("buildPolicyReport", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "policy-report-"));
  const data = (items: PolicyData["items"]): PolicyData => ({
    fetchSuccess: true,
    items,
    nextState: { reported: Object.fromEntries(items.map((i) => [i.id, "2026-10-14"])) },
    observedState: { reported: {} },
    deadlines: [],
    readerProfile: "A practitioner.",
  });
  const deadline = {
    date: "2026-11-09",
    title: "AI Act implementing act",
    link: "https://x.eu",
    source: "Have your say",
  };
  const item = {
    id: "g1",
    title: "AI Act guidelines",
    link: "https://example.eu/a",
    published: "2026-10-09T07:16:00.000Z",
    description: "Guidelines.",
    source: "European Commission",
    jurisdiction: "eu" as const,
    jevOnly: false,
  };

  it("is skipped on a day with no new items, without an LLM call, but saves the observed state", async () => {
    generateBody.mockClear();
    const file = path.join(dir, "empty.json");
    const observedState = {
      reported: {},
      stages: { "nl:1": "2026-08-01 Passed the Tweede Kamer" },
      deadlines: { "hys:1": deadline },
    };
    expect(await buildPolicyReport({ ...data([]), observedState }, "00:00", "2026-10-14", file)).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
    expect(JSON.parse(fs.readFileSync(file, "utf-8"))).toEqual(observedState);
  });

  it("writes no state when every source failed", async () => {
    const file = path.join(dir, "all-failed.json");
    expect(
      await buildPolicyReport({ ...data([]), fetchSuccess: false }, "00:00", "2026-10-14", file),
    ).toBeNull();
    expect(fs.existsSync(file)).toBe(false);
  });

  it("saves the verdicts and the trace even when Jev kept nothing, so dropped items are not asked again", async () => {
    generateBody.mockClear();
    saveFile.mockClear();
    const verdicts = path.join(dir, "verdicts.json");
    const dropped: PolicyData = {
      ...data([]),
      nextVerdicts: { items: { x: { title: "X", answers: {} as never, lastSeen: "2026-10-14" } } },
      rankingFile: "{}\n",
    };
    expect(
      await buildPolicyReport(dropped, "00:00", "2026-10-14", path.join(dir, "s.json"), verdicts),
    ).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
    expect(saveFile).toHaveBeenCalledWith("{}\n", "2026-10-14", "policy-ranking.json");
    expect(Object.keys(JSON.parse(fs.readFileSync(verdicts, "utf-8")).items)).toEqual(["x"]);
  });

  it("splices the code-rendered table into the prose and saves the state", async () => {
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.includes("`N: <2 sentences>`")
        ? "1: The AI Office published guidelines."
        : "## Highlights\n\nH.\n\n<!-- tables -->\n\n## Signals\n\nS.\n\n## Worth a Look\n\n- W",
    );
    const file = path.join(dir, "state.json");
    const report = await buildPolicyReport(data([item]), "00:00", "2026-10-14", file);
    expect(report?.id).toBe("ai-policy");
    expect(report?.content).toContain("# Policy Watch 2026-10-14");
    expect(report?.content).toContain(
      "H.\n\n## EU\n\n| Date | Source | Title | Stage | Summary |\n| :--- | :--- | :--- | :--- | :--- |\n" +
        "| 2026-10-09 | European Commission | [AI Act guidelines](https://example.eu/a) |  | The AI Office published guidelines. |\n\n## Signals",
    );
    expect(JSON.parse(fs.readFileSync(file, "utf-8"))).toEqual({ reported: { g1: "2026-10-14" } });
  });

  it("puts the upcoming deadlines between the jurisdiction tables and the news", async () => {
    generateBody.mockImplementation(async () => "## Highlights\n\nH.\n\n<!-- tables -->\n\n## Signals\n\nS.");
    const news = { ...item, id: "n1", title: "Op-ed", news: true };
    const report = await buildPolicyReport(
      { ...data([item, news]), deadlines: [deadline] },
      "00:00",
      "2026-10-14",
      path.join(dir, "deadlines.json"),
    );
    expect(report?.content).toMatch(
      /## EU\n[\s\S]*\n\n## Upcoming deadlines \(next 30 days\)\n[\s\S]*\| 2026-11-09 \| Have your say \| \[AI Act implementing act\]\(https:\/\/x\.eu\) \|\n\n## News & commentary\n[\s\S]*Op-ed[\s\S]*\n\n## Signals/,
    );
  });

  it("is skipped on a day with only deadlines", async () => {
    generateBody.mockClear();
    const report = await buildPolicyReport(
      { ...data([]), deadlines: [deadline] },
      "00:00",
      "2026-10-14",
      path.join(dir, "only-deadlines.json"),
    );
    expect(report).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
  });

  it("is skipped when the prose call fails, saving only the observed state", async () => {
    generateBody.mockImplementation(async (prompt: string) => {
      if (prompt.includes("`N: <2 sentences>`")) return "1: S.";
      throw new Error("down");
    });
    const file = path.join(dir, "failed.json");
    expect(await buildPolicyReport(data([item]), "00:00", "2026-10-14", file)).toBeNull();
    // The item is not marked reported: the next run takes it again.
    expect(JSON.parse(fs.readFileSync(file, "utf-8"))).toEqual({ reported: {} });
  });

  it("is written on a day with only news, which gets its own section after the jurisdiction tables", async () => {
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.includes("`N: <2 sentences>`")
        ? "1: Politico reports."
        : "## Highlights\n\nH.\n\n<!-- tables -->\n\n## Signals\n\nS.",
    );
    const news = { ...item, id: "n1", source: "Politico Europe", news: true };
    const report = await buildPolicyReport(data([news]), "00:00", "2026-10-14", path.join(dir, "news.json"));
    expect(report?.content).toContain(
      "H.\n\n## News & commentary\n\n| Date | Source | Title | Summary |\n| :--- | :--- | :--- | :--- |\n" +
        "| 2026-10-09 | Politico Europe | [AI Act guidelines](https://example.eu/a) | Politico reports. |\n\n## Signals",
    );
    expect(report?.content).not.toContain("## EU");
  });
});
