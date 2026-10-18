import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  buildDataReport,
  buildDiscussionsReport,
  buildPolicyReport,
  type DataSection,
} from "../data-reports.ts";
import { MSG } from "../i18n.ts";
import type { ProjectActivity } from "../prompts.ts";
import type { PolicyData, PolicyItem } from "../policy.ts";
import { isDataLaw } from "../policy-jev.ts";
import type { DevtoData } from "../devto.ts";
import type { VendorData, VendorItem } from "../data-vendors.ts";
import { selectVendorItems } from "../data-jev.ts";

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

// ---------------------------------------------------------------------------
// buildDataReport
// ---------------------------------------------------------------------------

describe("buildDataReport", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "data-report-"));
  const stateFile = path.join(dir, "data-state.json");
  const verdictsFile = path.join(dir, "data-verdicts.json");
  const build = (s: DataSection[], vendor: VendorData = { items: [] }, dataLaw: PolicyItem[] = []) =>
    buildDataReport(s, vendor, dataLaw, "00:00", "2026-10-17", stateFile, verdictsFile);

  const project = (name: string, active: boolean): ProjectActivity => ({
    config: { id: name.toLowerCase(), repo: `org/${name.toLowerCase()}`, name },
    releases: active
      ? [{ tag_name: "v1", name: "v1", published_at: "2026-10-16T00:00:00Z", prerelease: false }]
      : [],
    previews: [],
    prereleaseCount: 0,
    hotIssues: [],
    news: [],
  });
  const sections = (snowflakeActive: boolean, active = true): DataSection[] => [
    { key: "databricks", subject: "dbx", activities: [project("Delta", active), project("MLflow", false)] },
    { key: "snowflake", subject: "sf", activities: [project("Polaris", snowflakeActive)] },
    { key: "data_stack", subject: "oss", activities: [project("DuckDB", active)] },
  ];
  const PROSE = "## Highlights\n- Something changed.\n\n<!-- tables -->\n\n## Worth a Look\n- Read this.";
  // The model writes one section per active project it was given, a line per vendor row, and the prose.
  const reply = (prompt: string) => {
    if (prompt.startsWith("You summarize data platform")) return "1: Retiring soon.\n3: Snowflake note.";
    if (prompt.startsWith("You are the editor")) return PROSE;
    return `## Overview\nText.\n\n${["Delta", "Polaris", "DuckDB"]
      .filter((n) => prompt.includes(`## ${n} (github.com`))
      .map((n) => `## ${n}\n- Released v1.`)
      .join("\n\n")}`;
  };
  const vendorItem = (id: string, over: Partial<VendorItem>): VendorItem => ({
    id,
    vendor: "databricks",
    source: "Azure Databricks",
    title: `Title ${id}`,
    link: `https://example.com/${id}`,
    date: "2026-10-16",
    description: `Description ${id}.`,
    ...over,
  });
  // Through the keyword fallback, so the order is the selection's: feed order here is not report order.
  const vendorData = async (): Promise<VendorData> => {
    const { items, rankingFile, nextVerdicts } = await selectVendorItems(
      [
        vendorItem("sf", {
          vendor: "snowflake",
          source: "Snowflake",
          title: "Snowflake feature now available",
        }),
        vendorItem("gcp", { vendor: "gcp", source: "BigQuery", title: "Feature: new preview" }),
        vendorItem("dbx-new", { title: "Genie spaces now available" }),
        vendorItem("dbx-old", { title: "Retirement: legacy runtime", date: "2026-10-19" }),
        vendorItem("bundle", {
          vendor: "snowflake",
          source: "Snowflake BCR",
          title: "2026_08 bundle",
          date: "",
          stage: "Enabled by default",
        }),
      ],
      { cache: { items: {} }, dateStr: "2026-10-17" },
    );
    return {
      items,
      rankingFile,
      nextVerdicts,
      nextState: { reported: { "dbx-new": "2026-10-17" }, stages: {} },
    };
  };

  it("renders Highlights, the active sections in order, leaves out a quiet one, and lists quiet projects", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    const report = await build(sections(false));
    const content = report!.content;
    expect(report!.id).toBe("ai-data");
    expect(content).toMatch(/^# Data Engineering Watch 2026-10-17\n/);
    expect(content.indexOf("## Highlights")).toBeLessThan(content.indexOf("## Databricks"));
    expect(content.indexOf("## Databricks")).toBeLessThan(content.indexOf("## Open-source stack"));
    expect(content.indexOf("## Open-source stack")).toBeLessThan(content.indexOf("## Worth a Look"));
    expect(content).not.toContain("## Snowflake");
    expect(content).not.toContain("## Azure / Fabric & GCP");
    expect(content).not.toContain("<!-- tables -->");
    expect(content).toContain("### Delta");
    expect(content).toContain("**Quiet today:** [MLflow](https://github.com/org/mlflow)");
    // The header still counts the left-out section's project.
    expect(content).toContain("Projects: 4 | Active today: 2");
    // Two repo sections and the prose; no vendor items, so no summaries call.
    expect(generateBody).toHaveBeenCalledTimes(3);
  });

  it("is skipped without an LLM call when there are no vendor items and no repo activity", async () => {
    generateBody.mockReset();
    expect(await build(sections(false, false))).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
  });

  it("shows the failure notice for a section whose LLM call failed and keeps the others", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => {
      if (prompt.includes("covering sf")) throw new Error("HTTP 504");
      return reply(prompt);
    });
    const content = (await build(sections(true)))!.content;
    expect(content).toContain(`## Snowflake\n\n${MSG.summaryFailed}`);
    expect(content).toContain("### DuckDB");
  });

  it("puts each vendor's table above its repo section, deprecations first, rows numbered across sections", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    fs.rmSync(stateFile, { force: true });
    const content = (await build(sections(false), await vendorData()))!.content;
    const at = (s: string) => content.indexOf(s);
    // Databricks: the retirement (row 1) before the feature (row 2), both before the repo body.
    expect(content).toContain(
      "| 2026-10-19 | Azure Databricks | ⚠️ [Retirement: legacy runtime](https://example.com/dbx-old) | Retiring soon. |",
    );
    expect(at("dbx-old)")).toBeLessThan(at("dbx-new)"));
    expect(at("dbx-new)")).toBeLessThan(at("### Delta"));
    // Row 2 has no summary line: its description stands in.
    expect(content).toContain(
      "[Genie spaces now available](https://example.com/dbx-new) | Description dbx-new. |",
    );
    // Snowflake: the bundle (row 3: a deprecation, no date) before the feature (row 4).
    expect(at("## Databricks")).toBeLessThan(at("## Snowflake"));
    expect(content).toContain(
      "| — | Snowflake BCR | ⚠️ [2026_08 bundle](https://example.com/bundle) | Snowflake note. |",
    );
    expect(at("bundle)")).toBeLessThan(at("sf)"));
    // Snowflake's repos are quiet: only its table, no quiet line.
    expect(content.slice(at("## Snowflake"), at("## Azure"))).not.toContain("Quiet today");
    expect(at("## Azure / Fabric & GCP")).toBeLessThan(at("## Open-source stack"));
    expect(content).toContain("[Feature: new preview](https://example.com/gcp)");
    // Two repo sections, the summaries and the prose; the state is saved once the report exists.
    expect(generateBody).toHaveBeenCalledTimes(4);
    expect(JSON.parse(fs.readFileSync(stateFile, "utf-8"))).toEqual({
      reported: { "dbx-new": "2026-10-17" },
      stages: {},
    });
    expect(saveFile).toHaveBeenCalledWith(
      expect.stringContaining('"rankedBy": "keywords"'),
      "2026-10-17",
      "data-ranking.json",
    );
  });

  it("is written on a day with only vendor items", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    const content = (await build(sections(false, false), await vendorData()))!.content;
    expect(content).toContain("## Databricks\n\n| Date | Source | Item | Summary |");
    expect(content).not.toContain("## Open-source stack");
    expect(content).not.toContain("Quiet today");
    expect(generateBody).toHaveBeenCalledTimes(2);
  });

  const PROSE_AI =
    "## Highlights\n- H.\n\n<!-- tables -->\n\n## Worth a Look\n- Read this.\n\n## Data × AI\n- Genie spaces arrive.";
  const prosePrompts = () =>
    generateBody.mock.calls.map((c) => c[0] as string).filter((p) => p.startsWith("You are the editor"));

  it("writes Data × AI from an AI-flagged vendor item, between Open-source stack and Worth a Look", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You are the editor") ? PROSE_AI : reply(prompt),
    );
    const content = (await build(sections(false), await vendorData()))!.content;
    const at = (s: string) => content.indexOf(s);
    // "Genie" is an AI term in the keyword fallback.
    expect(prosePrompts()[0]).toContain("## Data × AI");
    expect(prosePrompts()[0]).toContain("- Genie spaces now available (Azure Databricks)");
    expect(at("## Open-source stack")).toBeLessThan(at("## Data × AI"));
    // Report order, though the model wrote Worth a Look first.
    expect(at("## Data × AI")).toBeLessThan(at("## Worth a Look"));
    expect(content).toContain("## Data × AI\n- Genie spaces arrive.");
  });

  it("leaves Data × AI out, and does not ask for it, without AI items or project activity", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You are the editor") ? PROSE_AI : reply(prompt),
    );
    const { items } = await selectVendorItems(
      [vendorItem("plain", { title: "Retirement: legacy runtime" })],
      {
        cache: { items: {} },
        dateStr: "2026-10-17",
      },
    );
    expect(items.map((i) => i.aiInData)).toEqual([false]);
    const content = (await build(sections(false, false), { items }))!.content;
    expect(prosePrompts()[0]).not.toContain("Data × AI");
    expect(content).not.toContain("Data × AI");
    expect(content).toContain("## Worth a Look");
  });

  it("leaves the failure notice in Highlights and no Worth a Look when the prose call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => {
      if (prompt.startsWith("You are the editor")) throw new Error("HTTP 504");
      return reply(prompt);
    });
    const content = (await build(sections(false), await vendorData()))!.content;
    expect(content).toContain(`## Highlights\n\n${MSG.summaryFailed}`);
    expect(content).not.toContain("## Worth a Look");
    expect(content).toContain("## Databricks");
  });

  const policyItem = (id: string, title: string, stage?: string): PolicyItem => ({
    id,
    title,
    link: `https://example.eu/${id}`,
    published: "2026-10-16",
    description: "",
    source: "EUR-Lex",
    jurisdiction: "eu",
    jevOnly: false,
    ...(stage ? { stage } : {}),
  });
  const dataLawOf = (items: PolicyItem[]) => items.filter((i) => isDataLaw(i, ["Data Act", "NIS2"]));

  it("links the data-law policy items, and only those, at the end of Worth a Look", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    const policy = [
      policyItem("data-act", "Data Act: guidance on smart contracts", "Guidance"),
      policyItem("ai-act", "AI Act: Code of Practice published"),
    ];
    const content = (await build(sections(false), { items: [] }, dataLawOf(policy)))!.content;
    expect(content).toContain(
      "## Worth a Look\n- Read this.\n- [Data Act: guidance on smart contracts](https://example.eu/data-act) — Policy Watch, Guidance",
    );
    expect(content).not.toContain("https://example.eu/ai-act");
  });

  it("gives the data-law links their own Worth a Look when the prose call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => {
      if (prompt.startsWith("You are the editor")) throw new Error("HTTP 504");
      return reply(prompt);
    });
    const policy = [policyItem("nis2", "NIS2 implementing act adopted")];
    const content = (await build(sections(false), { items: [] }, dataLawOf(policy)))!.content;
    expect(content).toContain(
      "## Worth a Look\n\n- [NIS2 implementing act adopted](https://example.eu/nis2) — Policy Watch",
    );
  });

  it("is still skipped when only data-law policy items are new", async () => {
    generateBody.mockReset();
    const policy = [policyItem("nis2", "NIS2 implementing act adopted")];
    expect(await build(sections(false, false), { items: [] }, policy)).toBeNull();
  });
});
