import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  buildAgentsReport,
  buildDataReport,
  buildModelsPage,
  buildPolicyReport,
  buildTrendsReport,
  type TrendsInput,
  LAB_POSTS_MAX,
  type DataSection,
} from "../reports/data-reports.ts";
import { EMPTY_TRENDING, type TrendingData } from "../trending/trending.ts";
import { MSG, TRENDS_REPORT } from "../core/i18n.ts";
import type { ProjectActivity } from "../reports/prompts.ts";
import type { PolicyData, PolicyItem } from "../policy/policy.ts";
import { isDataLaw } from "../policy/jev.ts";
import type { WebFetchResult, WebPageItem } from "../sources/web.ts";
import type { ModelCatalog } from "../sources/openrouter.ts";
import type { VendorData, VendorItem } from "../data/vendors.ts";
import { selectVendorItems } from "../data/jev.ts";
import { fetchVendorData } from "../data/vendors.ts";
import { numberRows } from "../reports/summarized-table.ts";
import type { SpottedRow } from "../spotted/spotted.ts";

const NO_SPOTTED = { rows: [], summaries: new Map<number, string>() };
/** A page's `##` headings, in order. */
const headings = (content: string) => [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const spottedRow = (n: number, page: SpottedRow["page"]): SpottedRow => ({
  n,
  page,
  id: `hn:${n}`,
  source: "hn",
  title: `Story ${n}`,
  url: `https://example.com/${n}`,
  discussionUrl: `https://news.ycombinator.com/item?id=${n}`,
  points: 100,
  comments: 10,
  published: "2026-10-22T00:00:00Z",
});

const generateBody = vi.fn(async (_prompt: string) => "## Highlights\n\nText.");
vi.mock("../core/report.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../core/report.ts")>()),
  generateBody: (...args: unknown[]) => generateBody(...(args as [string])),
  // generateOr calls report.ts's own generateBody, which this mock can't reach: route it here.
  generateOr: (_tag: string, prompt: string, fallback: unknown) => generateBody(prompt).catch(() => fallback),
  saveFile: (...args: unknown[]) => saveFile(...(args as [string, string, string])),
}));
// buildModelsPage writes digests/web-state.json: keep the tests off the real file.
const saveWebState = vi.fn();
vi.mock("../sources/web.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../sources/web.ts")>()),
  saveWebState: () => saveWebState(),
}));
/** A vendor result with these items and nothing to save but the pruned state. */
const vendorOf = (items: VendorData["items"]): VendorData => ({
  items,
  fetchSuccess: true,
  nextState: { reported: {} },
  observedState: { reported: {} },
});
const saveFile = vi.fn((_content: string, dateStr: string, name: string) => `digests/${dateStr}/${name}`);

describe("buildTrendsReport", () => {
  const githubRow = (n: number, fullName: string, onFire = false) => ({
    n,
    key: `github:${fullName}`,
    fullName,
    url: `https://github.com/${fullName}`,
    description: `${fullName} description.`,
    language: "TypeScript",
    totalStars: 5000,
    gain: 800,
    gainFrom: "trending" as const,
    relative: 0.19,
    starsCell: "5,000 (+800, +19.0%)",
    isNew: false,
    onFire,
  });
  const data: TrendingData = {
    ...EMPTY_TRENDING,
    openrouter: {
      ...EMPTY_TRENDING.openrouter,
      topModels: [{ slug: "a/b", tokens: 1e12 }],
      fetchSuccess: true,
    },
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
      categories: [{ category: "coding_agent", rows: [githubRow(2, "o/fast", true)] }],
      onFire: [{ fullName: "o/fast", category: "coding_agent" }],
      classifiedBy: "jev",
    },
  };
  const input: TrendsInput = {
    trending: data,
    skills: { prs: [], issues: [], fetchSuccess: true, repo: "anthropics/skills" },
    hf: { models: [], fetchSuccess: true },
    papers: [
      {
        id: "p1",
        title: "Paper 1",
        url: "https://arxiv.org/abs/p1",
        published: "2026-10-20T00:00:00Z",
        relevance: 0.9,
        abstract: "Paper abstract.",
        date: "2026-10-21",
      },
    ],
    stories: [
      {
        id: "lobsters:x",
        source: "lobsters",
        title: "Essay",
        url: "https://example.com/essay",
        discussionUrl: "https://lobste.rs/s/x",
        points: 40,
        comments: 60,
      },
    ],
    tracked: [],
  };
  const isTrendingSummaries = (p: string) => p.includes("`N: <2 sentences>`");
  const isRowSummaries = (p: string) => p.includes("research papers and community stories");
  const isModels = (p: string) => p.includes("model ecosystem analyst");
  const isProse = (p: string) => p.includes("<!-- tables -->");
  const reply = (p: string) =>
    isTrendingSummaries(p)
      ? "1: Kilo is an agent.\n2: Fast is a coding agent."
      : isRowSummaries(p)
        ? "1: The paper shows X.\n2: An essay on Y."
        : isModels(p)
          ? "### OpenRouter usage\n\n- a/b leads.\n\n### Hugging Face trending\n\n| Model |\n| :--- |"
          : isProse(p)
            ? "## Highlights\n\n- H.\n\n<!-- tables -->\n\n## Signals\n\nS."
            : "## Top Skills\n\nK.";
  const build = (over: Partial<TrendsInput> = {}) =>
    buildTrendsReport({ ...input, ...over }, "00:00", "2026-10-26");

  it("reads Highlights, Agents & coding tools, Skills, Candidates, Models, Research, Most discussed, Signals", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) => reply(p));
    const content = (await build())!.content;
    expect(headings(content)).toEqual([
      "Highlights",
      TRENDS_REPORT.agentsHeading,
      TRENDS_REPORT.skillsHeading,
      TRENDS_REPORT.candidatesHeading,
      TRENDS_REPORT.modelsHeading,
      TRENDS_REPORT.researchHeading,
      TRENDS_REPORT.mostDiscussedHeading,
      "Signals",
    ]);
    expect(content).toContain(`### ${TRENDS_REPORT.radarHeading}`);
    expect(content).toContain(`### ${TRENDS_REPORT.categoryTitles.coding_agent}`);
    expect(content).toContain("### Top Skills\n\nK.");
    expect(content).toContain("### OpenRouter usage");
    expect(content).toContain("| Kilo is an agent. |");
    expect(content).toContain("| [Paper 1](https://arxiv.org/abs/p1) | The paper shows X. |");
    expect(content).toContain("| An essay on Y. |");
    expect(content).toContain("    - id: fast\n      repo: o/fast\n      name: fast");
    expect(content).not.toContain("<!-- tables -->");
  });

  it("makes four calls in the first round, then the prose call over the rendered page", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) => reply(p));
    await build();
    const prompts = generateBody.mock.calls.map((c) => c[0]);
    expect(prompts).toHaveLength(5);
    expect(isProse(prompts[4]!)).toBe(true);
    expect(prompts.slice(0, 4).some(isProse)).toBe(false);
    // The prose call reads the page with the first round's summaries in it.
    expect(prompts[4]).toContain("| The paper shows X. |");
    expect(prompts[4]).toContain("### OpenRouter usage");
  });

  it("leaves out an empty section, and the failure notice under Highlights when the prose call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) => {
      if (isProse(p)) throw new Error("HTTP 504");
      return reply(p);
    });
    const content = (await build({ papers: [], tracked: [{ id: "f", repo: "O/Fast", name: "Fast" }] }))!
      .content;
    expect(headings(content)).toEqual([
      "Highlights",
      TRENDS_REPORT.agentsHeading,
      TRENDS_REPORT.skillsHeading,
      TRENDS_REPORT.modelsHeading,
      TRENDS_REPORT.mostDiscussedHeading,
    ]);
    expect(content).toContain(`## Highlights\n\n${MSG.summaryFailed}`);
  });

  it("shows the descriptions when a summaries call fails, and the Skills notice without a Skills fetch", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) => {
      if (isTrendingSummaries(p) || isRowSummaries(p)) throw new Error("HTTP 504");
      return reply(p);
    });
    const content = (await build({ skills: { ...input.skills, fetchSuccess: false } }))!.content;
    expect(content).toContain("| Kilo description. |");
    expect(content).toContain("| Paper abstract. |");
    expect(content).toContain(MSG.skillsFailed);
    expect(generateBody).toHaveBeenCalledTimes(4);
  });

  it("is skipped without an LLM call when no section has data", async () => {
    generateBody.mockReset();
    expect(
      await build({
        trending: EMPTY_TRENDING,
        hf: { models: [], fetchSuccess: false },
        papers: [],
        stories: [],
      }),
    ).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
  });

  it("stays under 60 KB with the largest plausible inputs", async () => {
    const sentence =
      "This summary says what the row is and why it matters to developers in two sentences of plain text.";
    const summary = `${sentence} ${sentence}`.slice(0, 250);
    const categories = (
      ["coding_agent", "harness_framework", "multi_agent", "agent_tooling", "other_agent"] as const
    ).map((category, c) => ({
      category,
      rows: Array.from({ length: 8 }, (_, i) => ({
        ...githubRow(13 + c * 8 + i, `some-owner-${c}/a-fairly-long-repository-name-${i}`, true),
        description: "d".repeat(300),
      })),
    }));
    const radar = Array.from({ length: 12 }, (_, i) => ({
      n: i + 1,
      keys: [`openrouter:${i}`, `npm:pkg-${i}`, `github:radar-owner/radar-tool-${i}`],
      name: `Radar Tool ${i}`,
      url: `https://radar-tool-${i}.example.com/`,
      description: "d".repeat(300),
      sources: ["OpenRouter", "npm", "GitHub"] as ("OpenRouter" | "npm" | "GitHub")[],
      signals: ["🆕 week #3 / month #12", "12,345/week, 4.3x", "1,234 (+567, +85.0%)"],
      isNew: true,
      onFire: true,
      links: [],
    }));
    const hfRows = Array.from(
      { length: 15 },
      (_, i) =>
        `| [some-org/A-Model-Name-${i}-Instruct-GGUF](https://huggingface.co/some-org/A-Model-Name-${i}-Instruct-GGUF) | some-org | 1,234 | 123,456 | ${summary} |`,
    );
    const big: TrendsInput = {
      ...input,
      trending: {
        ...data,
        report: {
          radar,
          categories,
          onFire: categories.flatMap((g) =>
            g.rows.map((r) => ({ fullName: r.fullName, category: g.category })),
          ),
          classifiedBy: "jev",
        },
      },
      papers: Array.from({ length: 10 }, (_, i) => ({
        ...input.papers[0]!,
        id: `p${i}`,
        title: `A long paper title about agents, planning and tool use in large language models, part ${i}`,
        url: `https://arxiv.org/abs/2610.0000${i}`,
      })),
      stories: Array.from({ length: 11 }, (_, i) => ({
        ...input.stories[0]!,
        id: `hn:${i}`,
        source: "hn" as const,
        title: `A fairly long Hacker News story title number ${i} about AI tooling`,
        url: `https://example.com/a/long/path/to/the/article-${i}`,
        discussionUrl: `https://news.ycombinator.com/item?id=4100000${i}`,
      })),
    };
    const lines = (count: number) =>
      Array.from({ length: count }, (_, i) => `${i + 1}: ${summary}`).join("\n");
    generateBody.mockReset();
    generateBody.mockImplementation(async (p: string) =>
      isTrendingSummaries(p)
        ? lines(52)
        : isRowSummaries(p)
          ? lines(21)
          : isModels(p)
            ? `### OpenRouter usage\n\n${`- ${summary}\n`.repeat(5)}\n### Hugging Face trending\n\n| Model | Author | Likes | Downloads | Summary |\n| :--- | :--- | ---: | ---: | :--- |\n${hfRows.join("\n")}`
            : isProse(p)
              ? `## Highlights\n\n${"x".repeat(2000)}\n\n<!-- tables -->\n\n## Signals\n\n${"x".repeat(2000)}`
              : `## Top Skills\n\n${"k".repeat(3000)}`,
    );
    const content = (await build(big))!.content;
    const kb = Buffer.byteLength(content, "utf-8") / 1024;
    expect(kb).toBeLessThan(60);
  });
});

describe("buildAgentsReport", () => {
  const project = (name: string, active: boolean): ProjectActivity => ({
    config: { id: name.toLowerCase(), repo: `org/${name.toLowerCase()}`, name },
    releases: active
      ? [{ tag_name: "v1", name: "v1", published_at: "2026-10-21T00:00:00Z", prerelease: false }]
      : [],
    previews: [],
    prereleaseCount: 0,
    hotIssues: [],
    news: [],
  });
  const groups = (active: boolean) => [
    { title: "Coding Agents", activities: [project("Codex", active)], summary: "## Codex\n- Released v1." },
    { title: "Agent Tooling", activities: [project("Agent Deck", false)], summary: MSG.projectsNoActivity },
  ];
  const spotted = { rows: [spottedRow(1, "agents")], summaries: new Map([[1, "A tool."]]) };
  const build = (g = groups(true), s: typeof spotted = spotted) =>
    buildAgentsReport(g, s, "00:00", "2026-10-22");

  it("reads Highlights, the two groups, then Spotted", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async () => "## Highlights\n\n- Codex shipped v1.");
    const report = await build();
    expect(report.id).toBe("ai-agents");
    expect(report.content).toMatch(/^# AI Agents 2026-10-22\n/);
    expect(headings(report.content)).toEqual(["Highlights", "Coding Agents", "Agent Tooling", "Spotted"]);
    expect(report.content).toContain("### Codex");
    // The Highlights call reads the rendered groups and the Spotted table.
    const prompt = generateBody.mock.calls[0]![0] as string;
    expect(prompt).toContain("You are the editor of AI Agents");
    expect(prompt).toContain("## Coding Agents\n\n### Codex\n- Released v1.");
    expect(prompt).toContain("| [Story 1](https://example.com/1) |");
    expect(generateBody).toHaveBeenCalledTimes(1);
  });

  it("writes Highlights for Spotted alone", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async () => "## Highlights\n\n- A spotted tool.");
    expect(headings((await build(groups(false))).content)[0]).toBe("Highlights");
    expect(generateBody).toHaveBeenCalledTimes(1);
  });

  it("makes no call and has no Highlights when no project is active and Spotted is empty", async () => {
    generateBody.mockReset();
    const report = await build(groups(false), NO_SPOTTED);
    expect(generateBody).not.toHaveBeenCalled();
    expect(headings(report.content)).toEqual(["Coding Agents", "Agent Tooling"]);
  });

  it("leaves the failure notice under Highlights when the call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async () => {
      throw new Error("HTTP 504");
    });
    const report = await build();
    expect(report.content).toContain(`## Highlights\n\n${MSG.summaryFailed}\n\n---\n\n## Coding Agents`);
  });
});

describe("buildModelsPage", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "models-page-"));
  const NOW = Date.parse("2026-10-22T03:00:00Z");
  const post = (i: number, site: WebPageItem["site"] = "anthropic"): WebPageItem => ({
    url: `https://www.${site}.com/news/p${i}`,
    title: `Post ${i}`,
    lastmod: `2026-10-${String(10 + (i % 12)).padStart(2, "0")}`,
    content: site === "anthropic" ? `Body ${i}.` : "",
    site,
    category: "news",
  });
  const site = (newItems: WebPageItem[], extra: Partial<WebFetchResult> = {}): WebFetchResult => ({
    site: "anthropic",
    siteName: "Anthropic (Claude)",
    isFirstRun: false,
    newItems,
    totalDiscovered: 400,
    fetchSuccess: true,
    ...extra,
  });
  const model = {
    id: "x/m",
    name: "M",
    description: "A coding model.",
    created: "2026-10-21",
    contextLength: 262144,
  };
  const catalog = (extra: Partial<ModelCatalog> = {}): ModelCatalog => ({
    stealth: [],
    newModels: [],
    ...extra,
  });
  let n = 0;
  const build = (
    web: WebFetchResult[],
    cat: ModelCatalog | null,
    spotted: { rows: SpottedRow[]; summaries: Map<number, string> } = NO_SPOTTED,
    stateFile = path.join(dir, `state-${++n}.json`),
    dateStr = "2026-10-22",
    now = NOW,
  ) => buildModelsPage(web, {} as never, cat, spotted, "00:00", dateStr, stateFile, now);
  const stub = () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.includes("You are the editor") ? "## Highlights\n\n- A new model." : "1: Summary one.",
    );
  };

  it("reads Highlights, Lab announcements, New on OpenRouter, Stealth models, then Spotted", async () => {
    stub();
    const report = await build([site([post(1)])], catalog({ newModels: [model] }), {
      rows: [spottedRow(1, "models")],
      summaries: new Map([[1, "A story."]]),
    });
    expect(report?.id).toBe("ai-models");
    expect(report?.content).toMatch(
      /^# AI Models & Labs 2026-10-22\n\n> Lab posts: 1 \| New models: 1 \| Spotted: 1 \| Generated: 00:00 UTC\n/,
    );
    expect(headings(report!.content)).toEqual([
      "Highlights",
      "Lab announcements",
      "New on OpenRouter",
      "🕵️ Stealth Models on OpenRouter",
      "Spotted",
    ]);
    expect(report?.content).toContain(
      "| 2026-10-11 | Anthropic | [Post 1](https://www.anthropic.com/news/p1) | Summary one. |",
    );
    // The model is numbered after the post; without its summary line it shows its description.
    expect(report?.content).toContain(
      "| [M](https://openrouter.ai/x/m) `x/m` | 2026-10-21 | 262K | A coding model. |",
    );
    // Two calls: the summaries, then Highlights over the rendered sections.
    expect(generateBody).toHaveBeenCalledTimes(2);
    const highlightsPrompt = generateBody.mock.calls[1]![0] as string;
    expect(highlightsPrompt).toContain("You are the editor of AI Models & Labs");
    expect(highlightsPrompt).toContain("## New on OpenRouter");
    expect(highlightsPrompt).toContain("| [Story 1](https://example.com/1) |");
  });

  it("shows at most LAB_POSTS_MAX posts, newest first, then how many more came in", async () => {
    stub();
    const posts = Array.from({ length: LAB_POSTS_MAX + 2 }, (_, i) =>
      post(i, i % 2 ? "openai" : "anthropic"),
    );
    const report = await build([site(posts)], catalog());
    const rows = report!.content.split("\n").filter((l) => /^\| 2026-/.test(l));
    expect(rows).toHaveLength(LAB_POSTS_MAX);
    expect(rows.map((r) => r.slice(2, 12))).toEqual(
      rows
        .map((r) => r.slice(2, 12))
        .sort()
        .reverse(),
    );
    expect(report?.content).toContain("2 more posts not shown.");
    expect(report?.content).toContain("> Lab posts: 17 |");
  });

  it("shows one line with the count on a first crawl, with no summaries call for the posts", async () => {
    stub();
    const report = await build([site([post(1), post(2)], { isFirstRun: true })], catalog());
    expect(report?.content).toContain(
      "## Lab announcements\n\nFirst crawl: 400 posts recorded; new posts are listed from the next run.",
    );
    expect(report?.content).not.toContain("| Date | Lab |");
    expect(generateBody).toHaveBeenCalledTimes(1);
  });

  it("is skipped without an LLM call when nothing is new, and still saves the web state", async () => {
    stub();
    saveWebState.mockClear();
    const old = { id: "stealth/a", name: "A", created: "2026-10-01", expires: null };
    const stateFile = path.join(dir, "skipped.json");
    expect(await build([site([])], catalog({ stealth: [old] }), NO_SPOTTED, stateFile)).toBeNull();
    expect(generateBody).not.toHaveBeenCalled();
    expect(saveWebState).toHaveBeenCalledOnce();
    expect(fs.existsSync(stateFile)).toBe(false);
  });

  it("is published for a 🆕 stealth model alone, or a Spotted row alone", async () => {
    stub();
    const fresh = { id: "stealth/b", name: "B", created: "2026-10-21", expires: null };
    expect(await build([site([])], catalog({ stealth: [fresh] }))).not.toBeNull();
    const spotted = { rows: [spottedRow(1, "models")], summaries: new Map<number, string>() };
    const report = await build([site([])], null, spotted);
    expect(report?.content).toContain("No new posts today.");
    expect(report?.content).toContain("⚠️ OpenRouter model catalog unavailable.");
  });

  it("lists a new model again on a same-day re-run, but not the next day", async () => {
    stub();
    const stateFile = path.join(dir, "rerun.json");
    const first = await build([site([])], catalog({ newModels: [model] }), NO_SPOTTED, stateFile);
    expect(first?.content).toContain("`x/m`");
    expect(JSON.parse(fs.readFileSync(stateFile, "utf-8")).reported).toEqual({ "x/m": "2026-10-22" });
    const rerun = await build([site([])], catalog({ newModels: [model] }), NO_SPOTTED, stateFile);
    expect(rerun?.content).toContain("`x/m`");
    const nextDay = await build(
      [site([])],
      catalog({ newModels: [model] }),
      NO_SPOTTED,
      stateFile,
      "2026-10-23",
      NOW + 86_400_000,
    );
    expect(nextDay).toBeNull();
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
        : "## Highlights\n\nH.",
    );
    const file = path.join(dir, "state.json");
    const report = await buildPolicyReport(data([item]), "00:00", "2026-10-14", file);
    expect(report?.id).toBe("ai-policy");
    expect(report?.content).toContain("# Policy Watch 2026-10-14");
    expect(report?.content).toContain(
      "H.\n\n## EU\n\n| Date | Source | Title | Stage | Summary |\n| :--- | :--- | :--- | :--- | :--- |\n" +
        "| 2026-10-09 | European Commission | [AI Act guidelines](https://example.eu/a) |  | The AI Office published guidelines. |",
    );
    expect(JSON.parse(fs.readFileSync(file, "utf-8"))).toEqual({ reported: { g1: "2026-10-14" } });
  });

  it("reads Highlights, the jurisdictions, News & commentary, then Coming up with its window line", async () => {
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.includes("`N: <2 sentences>`") ? "1: S.\n2: N." : "## Highlights\n\nH.",
    );
    const nl = { ...item, id: "nl1", jurisdiction: "nl" as const };
    const news = { ...item, id: "n1", title: "Op-ed", news: true };
    const report = await buildPolicyReport(
      { ...data([item, nl, news]), deadlines: [deadline] },
      "00:00",
      "2026-10-14",
      path.join(dir, "deadlines.json"),
    );
    expect(headings(report!.content)).toEqual([
      "Highlights",
      "EU",
      "Netherlands",
      "News & commentary",
      "Coming up",
    ]);
    expect(report?.content).toContain(
      "## Coming up\n\nDeadlines and dates in the next 30 days.\n\n| Date | Source | Item |\n| :--- | :--- | :--- |\n" +
        "| 2026-11-09 | Have your say | [AI Act implementing act](https://x.eu) |",
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
      prompt.includes("`N: <2 sentences>`") ? "1: Politico reports." : "## Highlights\n\nH.",
    );
    const news = { ...item, id: "n1", source: "Politico Europe", news: true };
    const report = await buildPolicyReport(data([news]), "00:00", "2026-10-14", path.join(dir, "news.json"));
    expect(report?.content).toContain(
      "H.\n\n## News & commentary\n\n| Date | Source | Title | Summary |\n| :--- | :--- | :--- | :--- |\n" +
        "| 2026-10-09 | Politico Europe | [AI Act guidelines](https://example.eu/a) | Politico reports. |",
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
    return `${["Delta", "Polaris", "DuckDB"]
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
    // The model wrote one; code drops it.
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

  it("puts Across platforms after the tables and before EU data law, and leaves it out when absent", async () => {
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
    expect(at("## Across platforms")).toBeLessThan(at("## EU data law"));
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

  it("reads Highlights, Action required, the vendor and repo sections, Across platforms, Spotted, then EU data law", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) =>
      prompt.startsWith("You are the editor")
        ? "## Highlights\n- H.\n\n<!-- tables -->\n\n## Across platforms\n\n- Tagging on two platforms."
        : reply(prompt),
    );
    const data = await vendorData();
    const vendor: VendorData = {
      ...data,
      nextState: {
        reported: {},
        actions: { a: { date: "2026-12-01", title: "T", link: "https://x", source: "S" } },
      },
    };
    const s = sections(true);
    s[2]!.activities[0] = {
      ...s[2]!.activities[0]!,
      weekReleases: [weekRelease("v2.0.0", "2026-10-14T09:00:00Z")],
    };
    const policy = [policyItem("nis2", "NIS2 implementing act adopted")];
    const spotted = { rows: [spottedRow(1, "data")], summaries: new Map([[1, "A story."]]) };
    const report = await buildDataReport(
      s,
      vendor,
      dataLawOf(policy),
      spotted,
      "00:00",
      "2026-10-17",
      stateFile,
      verdictsFile,
    );
    expect(headings(report!.content)).toEqual([
      "Highlights",
      "Action required",
      "Databricks",
      "Snowflake",
      "Azure / Fabric & GCP",
      "Open-source stack",
      "Releases this week",
      "Across platforms",
      "Spotted",
      "EU data law",
    ]);
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

  it("leaves the failure notice in Highlights and no EU data law when the prose call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => {
      if (prompt.startsWith("You are the editor")) throw new Error("HTTP 504");
      return reply(prompt);
    });
    const content = (await build(sections(false), await vendorData()))!.content;
    expect(content).toContain(`## Highlights\n\n${MSG.summaryFailed}`);
    expect(content).not.toContain("## EU data law");
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

  it("links the data-law policy items, and only those, under EU data law", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => reply(prompt));
    const policy = [
      policyItem("data-act", "Data Act: guidance on smart contracts", "Guidance"),
      policyItem("ai-act", "AI Act: Code of Practice published"),
    ];
    const content = (await build(sections(false), vendorOf([]), dataLawOf(policy)))!.content;
    expect(content).toContain(
      "## EU data law\n\n- [Data Act: guidance on smart contracts](https://example.eu/data-act) — Policy Watch, Guidance",
    );
    expect(content).not.toContain("https://example.eu/ai-act");
  });

  it("keeps the EU data law links when the prose call fails", async () => {
    generateBody.mockReset();
    generateBody.mockImplementation(async (prompt: string) => {
      if (prompt.startsWith("You are the editor")) throw new Error("HTTP 504");
      return reply(prompt);
    });
    const policy = [policyItem("nis2", "NIS2 implementing act adopted")];
    const content = (await build(sections(false), vendorOf([]), dataLawOf(policy)))!.content;
    expect(content).toContain(
      "## EU data law\n\n- [NIS2 implementing act adopted](https://example.eu/nis2) — Policy Watch",
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
