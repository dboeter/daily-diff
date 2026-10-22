import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  buildDataReport,
  buildDiscussionsReport,
  buildPolicyReport,
  buildTrendingReport,
  buildWebReport,
  type DataSection,
} from "../reports/data-reports.ts";
import { EMPTY_TRENDING, type TrendingData } from "../trending/trending.ts";
import { MSG } from "../core/i18n.ts";
import type { ProjectActivity } from "../reports/prompts.ts";
import type { PolicyData, PolicyItem } from "../policy/policy.ts";
import { isDataLaw } from "../policy/jev.ts";
import type { DevtoData } from "../sources/devto.ts";
import type { VendorData, VendorItem } from "../data/vendors.ts";
import { selectVendorItems } from "../data/jev.ts";
import { fetchVendorData } from "../data/vendors.ts";
import { numberRows } from "../reports/summarized-table.ts";

const NO_SPOTTED = { rows: [], summaries: new Map<number, string>() };

const generateBody = vi.fn(async (_prompt: string) => "## Highlights\n\nText.");
vi.mock("../core/report.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../core/report.ts")>()),
  generateBody: (...args: unknown[]) => generateBody(...(args as [string])),
  // generateOr calls report.ts's own generateBody, which this mock can't reach: route it here.
  generateOr: (_tag: string, prompt: string, fallback: unknown) => generateBody(prompt).catch(() => fallback),
  saveFile: (...args: unknown[]) => saveFile(...(args as [string, string, string])),
}));
// buildWebReport writes digests/web-state.json: keep the tests off the real file.
vi.mock("../sources/web.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../sources/web.ts")>()),
  saveWebState: () => {},
}));
/** A vendor result with these items and nothing to save but the pruned state. */
const vendorOf = (items: VendorData["items"]): VendorData => ({
  items,
  fetchSuccess: true,
  nextState: { reported: {} },
  observedState: { reported: {} },
});
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

describe("buildWebReport", () => {
  it("says a site's fetch failed instead of reporting an empty sitemap", async () => {
    generateBody.mockClear();
    const page = {
      url: "https://www.anthropic.com/news/x",
      title: "X",
      lastmod: "2026-10-18",
      content: "Body.",
      site: "anthropic" as const,
      category: "news",
    };
    const results = [
      {
        site: "anthropic" as const,
        siteName: "Anthropic",
        isFirstRun: false,
        newItems: [page],
        totalDiscovered: 40,
        fetchSuccess: true,
      },
      {
        site: "openai" as const,
        siteName: "OpenAI",
        isFirstRun: false,
        newItems: [],
        totalDiscovered: 0,
        fetchSuccess: false,
      },
    ];
    const state = { anthropic: {}, openai: {} } as unknown as Parameters<typeof buildWebReport>[1];
    const content = (await buildWebReport(results, state, "00:00", "2026-10-19"))!.content;
    expect(content).toContain("— 1 new articles (sitemap total: 40)");
    expect(content).toContain("[openai.com](https://openai.com) — fetch failed");
  });
});

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

describe("buildTrendingReport", () => {
  const data: TrendingData = {
    ...EMPTY_TRENDING,
    report: {
      radar: [
        {
          n: 1,
          keys: ["npm:kilo"],
          name: "Kilo",
          url: "https://kilo.ai/",
          description: "Kilo description.",
          sources: ["npm"],
          signals: ["1,000/week"],
          isNew: false,
          links: [],
        },
      ],
      categories: [],
      classifiedBy: "jev",
    },
  };
  const skills = { prs: [], issues: [], fetchSuccess: true, repo: "anthropics/skills" };
  const isSummaries = (p: string) => p.includes("`N: <2 sentences>`");
  const isProse = (p: string) => p.includes("<!-- tables -->");
  const build = () => buildTrendingReport(data, skills, "00:00", "2026-10-19");

  it("splices the row summaries and the prose, and adds the Skills section", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) =>
      isSummaries(p)
        ? "1: Kilo is an agent."
        : isProse(p)
          ? "## Highlights\n\nH.\n\n<!-- tables -->\n\n## Signals\n\nS."
          : "## Top Skills\n\nK.",
    );
    const content = (await build())!.content;
    expect(content).toMatch(/H\.\n\n## [^\n]+\n\n[\s\S]*\| Kilo is an agent\. \|\n\n## Signals/);
    expect(content).toContain("## Claude Code Skills");
    expect(content).toContain("### Top Skills\n\nK.");
    expect(generateBody).toHaveBeenCalledTimes(3);
  });

  it("shows the descriptions when the summaries call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) => {
      if (isSummaries(p)) throw new Error("HTTP 504");
      return isProse(p) ? "## Highlights\n\nH.\n\n<!-- tables -->" : "K.";
    });
    expect((await build())!.content).toContain("| Kilo description. |");
  });

  it("is still written with the failure notice when the prose call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) => {
      if (isProse(p)) throw new Error("HTTP 504");
      return isSummaries(p) ? "1: S." : "K.";
    });
    const content = (await build())!.content;
    expect(content).toContain(MSG.trendingFailed);
    expect(content).toContain("| S. |");
  });

  it("shows the Skills failure notice when the Skills call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) => {
      if (!isSummaries(p) && !isProse(p)) throw new Error("HTTP 504");
      return "1: S.";
    });
    expect((await build())!.content).toContain(MSG.skillsFailed);
  });

  it("shows the Skills failure notice without a Skills call when the Skills fetch failed", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) =>
      isSummaries(p) ? "1: S." : "## Highlights\n\nH.\n\n<!-- tables -->",
    );
    const failed = { ...skills, fetchSuccess: false };
    const content = (await buildTrendingReport(data, failed, "00:00", "2026-10-19"))!.content;
    expect(content).toContain(MSG.skillsFailed);
    expect(generateBody).toHaveBeenCalledTimes(2);
  });

  it("is skipped without an LLM call when there is no ranked data", async () => {
    generateBody.mockReset();
    expect(await buildTrendingReport(EMPTY_TRENDING, skills, "00:00", "2026-10-19")).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
  });
});

describe("buildPolicyReport", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "policy-report-"));
  const data = (items: PolicyItem[]): PolicyData => ({
    fetchSuccess: true,
    items: numberRows(items),
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
  const build = (s: DataSection[], vendor: VendorData = vendorOf([]), dataLaw: PolicyItem[] = []) =>
    buildDataReport(s, vendor, dataLaw, NO_SPOTTED, "00:00", "2026-10-17", stateFile, verdictsFile);

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
      ...vendorOf(items),
      rankingFile,
      nextVerdicts,
      nextState: { reported: { "dbx-new": "2026-10-17" }, stages: {} },
    };
  };

  it("renders Highlights, the sections in order, and an all-quiet repo section with its quiet line", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    const report = await build(sections(false));
    const content = report!.content;
    expect(report!.id).toBe("ai-data");
    expect(content).toMatch(/^# Data Engineering Watch 2026-10-17\n/);
    expect(content.indexOf("## Highlights")).toBeLessThan(content.indexOf("## Databricks"));
    expect(content.indexOf("## Databricks")).toBeLessThan(content.indexOf("## Open-source stack"));
    // The model wrote one; code writes it only for data-law links.
    expect(content).not.toContain("## Worth a Look");
    // 2026-10-19..21: "Active today: 0" and no sign the stack was tracked at all.
    expect(content).toContain("## Snowflake\n\n**Quiet today:** [Polaris](https://github.com/org/polaris)");
    // No repos and no vendor rows: nothing to show.
    expect(content).not.toContain("## Azure / Fabric & GCP");
    expect(content).not.toContain("<!-- tables -->");
    expect(content).toContain("### Delta");
    expect(content).toContain("**Quiet today:** [MLflow](https://github.com/org/mlflow)");
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
    // Snowflake's repos are quiet: its table, then the quiet line.
    expect(content.slice(at("## Snowflake"), at("## Azure"))).toContain("**Quiet today:** [Polaris]");
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
    expect(content).toContain("## Open-source stack\n\n**Quiet today:** [DuckDB]");
    // 2026-10-19: "Projects: 17 | Active today: 0" sat above 16 vendor rows.
    expect(content).toContain("Vendor items: 5 | Projects:");
    expect(generateBody).toHaveBeenCalledTimes(2);
  });

  const PROSE_AI =
    "## Highlights\n- H.\n\n<!-- tables -->\n\n## Worth a Look\n- Read this.\n\n## Data × AI\n- Genie spaces arrive.";
  const prosePrompts = () =>
    generateBody.mock.calls.map((c) => c[0] as string).filter((p) => p.startsWith("You are the editor"));

  it("marks an AI-flagged vendor row with 🤖 and drops a Data × AI or Worth a Look section the model wrote", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You are the editor") ? PROSE_AI : reply(prompt),
    );
    const content = (await build(sections(false), await vendorData()))!.content;
    // "Genie" is an AI term in the keyword fallback; the retirement is not AI.
    expect(content).toContain("| 🤖 [Genie spaces now available](https://example.com/dbx-new) |");
    expect(content).toContain("| ⚠️ [Retirement: legacy runtime](https://example.com/dbx-old) |");
    expect(prosePrompts()[0]).not.toContain("Data × AI");
    expect(prosePrompts()[0]).not.toContain("## Worth a Look");
    expect(content).not.toContain("Data × AI");
    expect(content).not.toContain("## Worth a Look");
    expect(content).not.toContain("Read this.");
    expect(content).toContain("## Highlights\n- H.");
  });

  it("puts Across platforms after the tables and before Worth a Look, and leaves it out when absent", async () => {
    generateBody.mockReset();
    const across =
      "## Highlights\n- H.\n\n<!-- tables -->\n\n## Across platforms\n\n- Governance tagging: Snowflake GA,\n  Databricks GA.\n\n---\n\nNote, outside the report: a row needs checking.\n\n## Data × AI\n- X.";
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You are the editor") ? across : reply(prompt),
    );
    const policy = [policyItem("nis2", "NIS2 implementing act adopted")];
    const content = (await build(sections(false), await vendorData(), dataLawOf(policy)))!.content;
    const at = (s: string) => content.indexOf(s);
    // Only its bullets: on the 2026-10-21 replay the model appended a note to the editor.
    expect(content).toContain(
      "## Across platforms\n\n- Governance tagging: Snowflake GA,\n  Databricks GA.\n\n---",
    );
    expect(content).not.toContain("Note, outside the report");
    expect(at("## Open-source stack")).toBeLessThan(at("## Across platforms"));
    expect(at("## Azure / Fabric & GCP")).toBeLessThan(at("## Across platforms"));
    expect(at("## Across platforms")).toBeLessThan(at("## Worth a Look"));
    expect(content).not.toContain("Data × AI");

    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    expect((await build(sections(false), await vendorData()))!.content).not.toContain("Across platforms");
  });

  it("splits a reply without the tables marker at its first heading after Highlights", async () => {
    generateBody.mockReset();
    const noMarker =
      "## Highlights\n- H.\n\n## Across platforms\n\n- Tagging: Snowflake GA, Databricks preview.\n\n## Data × AI\n- X.";
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You are the editor") ? noMarker : reply(prompt),
    );
    const content = (await build(sections(false), await vendorData()))!.content;
    const at = (s: string) => content.indexOf(s);
    expect(content).toContain("## Highlights\n- H.");
    expect(at("## Open-source stack")).toBeLessThan(at("## Across platforms"));
    expect(content).not.toContain("Data × AI");
  });

  it("lists the open end dates under Action required, nearest first, with today's row summary", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    const data = await vendorData();
    const retiring = data.items.find((i) => i.id === "dbx-old")!;
    const saved = {
      date: "2026-12-01",
      title: "Old retirement",
      link: "https://example.com/saved",
      source: "Microsoft Fabric",
      summary: "Move to Fabric IQ.",
    };
    const vendor: VendorData = {
      ...data,
      items: data.items.map((i) => (i.id === "dbx-old" ? { ...i, endDate: "2026-11-19" } : i)),
      nextState: {
        reported: {},
        actions: {
          saved,
          "dbx-old": {
            date: "2026-11-19",
            title: retiring.title,
            link: retiring.link,
            source: retiring.source,
          },
          passed: {
            date: "2026-10-16",
            title: "Gone",
            link: "https://example.com/gone",
            source: "Snowflake",
          },
        },
      },
    };
    const content = (await build(sections(false), vendor))!.content;
    const at = (s: string) => content.indexOf(s);
    expect(at("## Highlights")).toBeLessThan(at("## Action required"));
    expect(at("## Action required")).toBeLessThan(at("## Databricks"));
    const table = content.slice(at("## Action required"), at("## Databricks"));
    expect(table).toContain("| Date | Platform | Item | What to do |");
    expect(table).toContain(
      "| 2026-11-19 | Azure Databricks | [Retirement: legacy runtime](https://example.com/dbx-old) | Retiring soon. |\n| 2026-12-01 | Microsoft Fabric | [Old retirement](https://example.com/saved) | Move to Fabric IQ. |",
    );
    expect(table).not.toContain("Gone");
    // Today's summary is saved with the end date, for the later report days.
    expect(JSON.parse(fs.readFileSync(stateFile, "utf-8")).actions["dbx-old"].summary).toBe("Retiring soon.");
  });

  it("leaves a release of the last 24h to its repo section, and records it as shown", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    fs.rmSync(stateFile, { force: true });
    const s = releasedThisWeek();
    const today = weekRelease("v2.0.1", "2026-10-16T09:00:00Z");
    s[2]!.activities[0] = {
      ...s[2]!.activities[0]!,
      releases: [today],
      weekReleases: [today, ...s[2]!.activities[0]!.weekReleases!],
    };
    const content = (await build(s, vendorOf([])))!.content;
    const table = content.slice(content.indexOf("## Releases this week"));
    expect(table).toContain("[v2.0.0]");
    expect(table).not.toContain("[v2.0.1]");
    expect(content).toContain("### DuckDB");
    expect(JSON.parse(fs.readFileSync(stateFile, "utf-8")).reported).toMatchObject({
      "release:org/duckdb@v2.0.1": "2026-10-17",
      "release:org/duckdb@v2.0.0": "2026-10-17",
    });
  });

  it("shows the description as the action when the row summary is '—'", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You summarize data platform") ? "1: —" : reply(prompt),
    );
    const data = await vendorData();
    const retiring = data.items.find((i) => i.id === "dbx-old")!;
    const vendor: VendorData = {
      ...data,
      items: data.items.map((i) => (i.id === "dbx-old" ? { ...i, endDate: "2026-11-19" } : i)),
      nextState: {
        reported: {},
        actions: {
          "dbx-old": {
            date: "2026-11-19",
            title: retiring.title,
            link: retiring.link,
            source: retiring.source,
          },
        },
      },
    };
    const content = (await build(sections(false), vendor))!.content;
    expect(content).toContain("(https://example.com/dbx-old) | Description dbx-old. |");
  });

  it("is still skipped when only open end dates are left", async () => {
    generateBody.mockReset();
    const vendor: VendorData = {
      ...vendorOf([]),
      nextState: {
        reported: {},
        actions: { a: { date: "2026-12-01", title: "T", link: "https://x", source: "S" } },
      },
    };
    expect(await build(sections(false, false), vendor)).toBeNull();
  });

  const weekRelease = (tag: string, published: string) => ({
    tag_name: tag,
    name: tag,
    body: `## Notes\n${tag} notes.`,
    published_at: published,
    prerelease: false,
  });
  /** Quiet today, with a stable release earlier this week. */
  const releasedThisWeek = (): DataSection[] => {
    const s = sections(false, false);
    s[2]!.activities[0] = {
      ...s[2]!.activities[0]!,
      weekReleases: [weekRelease("v2.0.0", "2026-10-14T09:00:00Z")],
    };
    return s;
  };

  it("lists a release of this week once under Releases this week, and not on the next run", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You summarize data platform")
        ? "1: Major release: drops Python 3.9."
        : reply(prompt),
    );
    fs.rmSync(stateFile, { force: true });
    const vendor: VendorData = {
      ...vendorOf([]),
      nextState: { reported: { "older|2026-10-10": "2026-10-11" } },
    };
    const content = (await build(releasedThisWeek(), vendor))!.content;
    const at = (s: string) => content.indexOf(s);
    expect(content).toContain(
      "## Releases this week\n\n| Project | Version | Date | Summary |\n| :--- | :--- | :--- | :--- |\n| [DuckDB](https://github.com/org/duckdb) | [v2.0.0](https://github.com/org/duckdb/releases/tag/v2.0.0) | 2026-10-14 | Major release: drops Python 3.9. |",
    );
    expect(at("## Open-source stack")).toBeLessThan(at("## Releases this week"));
    // The summaries call lists the release after the (here: no) vendor rows.
    const summariesPrompt = generateBody.mock.calls
      .map((c) => c[0] as string)
      .find((p) => p.startsWith("You summarize data platform"))!;
    expect(summariesPrompt).toContain("1. DuckDB v2.0.0 (release, 2026-10-14) — ## Notes v2.0.0 notes.");
    const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    expect(state.reported).toEqual({
      "older|2026-10-10": "2026-10-11",
      "release:org/duckdb@v2.0.0": "2026-10-17",
    });

    // The next day: already shown, and nothing else new, so no report.
    generateBody.mockClear();
    const next = await buildDataReport(
      releasedThisWeek(),
      { ...vendorOf([]), nextState: state },
      [],
      NO_SPOTTED,
      "00:00",
      "2026-10-18",
      stateFile,
      verdictsFile,
    );
    expect(next).toBeNull();
    // A same-day re-run shows it again.
    const again = await build(releasedThisWeek(), { ...vendorOf([]), nextState: state });
    expect(again!.content).toContain("## Releases this week");
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
    const content = (await build(sections(false), vendorOf([]), dataLawOf(policy)))!.content;
    expect(content).toContain(
      "## Worth a Look\n\n- [Data Act: guidance on smart contracts](https://example.eu/data-act) — Policy Watch, Guidance",
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
    const content = (await build(sections(false), vendorOf([]), dataLawOf(policy)))!.content;
    expect(content).toContain(
      "## Worth a Look\n\n- [NIS2 implementing act adopted](https://example.eu/nis2) — Policy Watch",
    );
  });

  it("is still skipped when only data-law policy items are new", async () => {
    generateBody.mockReset();
    const policy = [policyItem("nis2", "NIS2 implementing act adopted")];
    expect(await build(sections(false, false), vendorOf([]), policy)).toBeNull();
  });

  describe("with fetchVendorData", () => {
    const bcr = fs.readFileSync(new URL("./fixtures/snowflake-bcr.html", import.meta.url), "utf-8");
    const feeds = [
      {
        name: "Snowflake BCR",
        vendor: "snowflake" as const,
        url: "https://x/bcr",
        parser: "snowflake-bcr" as const,
      },
    ];
    const fetchWith = async (resp: () => Response, state: Parameters<typeof fetchVendorData>[2]) => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      const spy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => resp());
      const data = await fetchVendorData({ feeds }, new Date("2026-10-17T00:00:00Z"), state, {
        cache: { items: {} },
      });
      spy.mockRestore();
      return data;
    };

    it("saves a quiet day's record-only bundles and leaves reported unchanged", async () => {
      generateBody.mockReset();
      fs.rmSync(stateFile, { force: true });
      const first = await fetchWith(() => new Response(bcr), null);
      // 2026_08 was reported on an earlier day at its current stage; 2026_05..07 were never seen.
      const reported = { "older-note|2026-10-16": "2026-10-16" };
      const stage08 = first.nextState.stages!["snowflake-bcr:2026_08"]!;
      const data = await fetchWith(() => new Response(bcr), {
        reported,
        stages: { "snowflake-bcr:2026_08": stage08 },
      });
      expect(data.items).toEqual([]);
      expect(await build(sections(false, false), data)).toBeNull();
      const saved = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
      expect(saved.reported).toEqual(reported);
      expect(Object.keys(saved.stages).sort()).toEqual([
        "snowflake-bcr:2026_05",
        "snowflake-bcr:2026_06",
        "snowflake-bcr:2026_07",
        "snowflake-bcr:2026_08",
      ]);
    });

    it("reports fetchSuccess false when every feed fails, and writes no state on a quiet day", async () => {
      generateBody.mockReset();
      fs.rmSync(stateFile, { force: true });
      const data = await fetchWith(() => new Response("", { status: 503 }), { reported: {} });
      expect(data.fetchSuccess).toBe(false);
      expect(await build(sections(false, false), data)).toBeNull();
      expect(fs.existsSync(stateFile)).toBe(false);
    });
  });
});
