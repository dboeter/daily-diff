import { describe, it, expect } from "vitest";
import {
  buildProjectReportContent,
  buildStealthSection,
  renderTrendingTables,
  renderCandidates,
  renderResearchTable,
  renderPolicyTable,
  stripModelTitle,
  unwrapCodeLinks,
  highlightsOnly,
  nestHeadings,
  renderReportBar,
  withReportBar,
} from "../reports/report-builders.ts";
import type { TrendingReportData } from "../trending/rank.ts";
import { numberRows } from "../reports/summarized-table.ts";
import { MSG, TRENDS_REPORT } from "../core/i18n.ts";
import type { ProjectActivity } from "../reports/prompts.ts";
import type { GitHubRelease } from "../core/github.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// buildProjectReportContent
// ---------------------------------------------------------------------------

function makeActivity(id: string, overrides: Partial<ProjectActivity> = {}): ProjectActivity {
  return {
    config: { id, repo: `org/${id}`, name: id.toUpperCase() },
    releases: [],
    previews: [],
    prereleaseCount: 0,
    hotIssues: [],
    news: [],
    ...overrides,
  };
}

const stableRelease: GitHubRelease = {
  tag_name: "v1",
  name: "v1",
  published_at: "2026-10-04T00:00:00Z",
  prerelease: false,
};

describe("buildProjectReportContent", () => {
  const agents = {
    title: "Coding Agents",
    summary: "## Overview\nLLM_BODY",
    activities: [
      makeActivity("alpha", { releases: [stableRelease], prereleaseCount: 2 }),
      makeActivity("beta", { prereleaseCount: 5 }),
      makeActivity("gamma"),
    ],
  };
  const input = {
    heading: "# AI Agents 2026-10-04",
    utcStr: "2026-10-03 22:50",
    period: "today",
    footer: "FOOTER",
    groups: [agents],
  };
  const withAgents = (g: Partial<typeof agents>) => ({ ...input, groups: [{ ...agents, ...g }] });

  it("renders title, counts, the group heading, the LLM body and the footer", () => {
    const result = buildProjectReportContent(input);
    expect(result).toContain("# AI Agents 2026-10-04");
    expect(result).toContain(
      "Projects: 3 | Active today: 1 | Stable releases: 1 | Prereleases (not covered): 7",
    );
    expect(result).toContain("## Coding Agents\n\n### Overview\nLLM_BODY");
    expect(result.endsWith("FOOTER")).toBe(true);
  });

  it("lists quiet projects in one line, prerelease-only ones included", () => {
    const result = buildProjectReportContent(input);
    expect(result).toContain(
      "**Quiet today:** [BETA](https://github.com/org/beta), [GAMMA](https://github.com/org/gamma)",
    );
    expect(result).not.toContain("[ALPHA]");
  });

  it("counts a project the summary left out as quiet", () => {
    const news = [{ source: "GitHub Search", title: "works with BETA", url: "u", detail: "d" }];
    const result = buildProjectReportContent(
      withAgents({
        summary: "## Overview\nBODY\n\n## ALPHA\n- release\n\n## BETA pod\n- not BETA's section",
        activities: [agents.activities[0]!, makeActivity("beta", { news }), makeActivity("gamma")],
      }),
    );
    expect(result).toContain("Active today: 1 |");
    expect(result).toContain(
      "**Quiet today:** [BETA](https://github.com/org/beta), [GAMMA](https://github.com/org/gamma)",
    );
  });

  it("finds the section of a project named by its owner/repo", () => {
    const news = [{ source: "Hacker News", title: "cursor/plugins", url: "u", detail: "d" }];
    const project = (repo: string) => makeActivity("p", { config: { id: repo, repo, name: repo }, news });
    const result = buildProjectReportContent(
      withAgents({
        summary: "## Overview\nBODY\n\n## cursor/plugins\n- news",
        activities: [project("cursor/plugins"), project("ruvnet/ruflo")],
      }),
    );
    expect(result).toContain("Active today: 1 |");
    expect(result).toContain("**Quiet today:** [ruvnet/ruflo](https://github.com/ruvnet/ruflo)");
  });

  it("keeps projects with data active when the summary has no project section", () => {
    const news = [{ source: "Hacker News", title: "BETA 2.0", url: "u", detail: "d" }];
    const result = buildProjectReportContent(
      withAgents({
        summary: "Summary generation failed.",
        activities: [agents.activities[0]!, makeActivity("beta", { news }), makeActivity("gamma")],
      }),
    );
    expect(result).toContain("Active today: 2 |");
    expect(result).toContain("**Quiet today:** [GAMMA](https://github.com/org/gamma)");
  });

  it("omits the quiet line when every project was active", () => {
    const result = buildProjectReportContent(withAgents({ activities: [agents.activities[0]!] }));
    expect(result).not.toContain("Quiet today");
  });

  it("lists a project whose release fetch failed as unavailable, neither quiet nor active", () => {
    const result = buildProjectReportContent(
      withAgents({ activities: [...agents.activities, makeActivity("delta", { fetchFailed: true })] }),
    );
    expect(result).toContain("Projects: 4 | Active today: 1 |");
    expect(result).toContain(
      "**Quiet today:** [BETA](https://github.com/org/beta), [GAMMA](https://github.com/org/gamma)\n\n" +
        "**Unavailable today:** [DELTA](https://github.com/org/delta)",
    );
  });

  it("shows an all-quiet group's unavailable projects", () => {
    const result = buildProjectReportContent({
      ...input,
      groups: [{ title: "Stack", summary: "", activities: [makeActivity("delta", { fetchFailed: true })] }],
    });
    expect(result).toContain("## Stack\n\n**Unavailable today:** [DELTA](https://github.com/org/delta)");
  });

  it("leaves out a group with neither projects nor a preamble, and shows one with only a preamble", () => {
    const result = buildProjectReportContent({
      ...input,
      groups: [
        { title: "Empty", summary: "", activities: [] },
        { title: "Table", summary: "", activities: [], preamble: "| t |" },
      ],
    });
    expect(result).not.toContain("## Empty");
    expect(result).toContain("## Table\n\n| t |");
  });

  it("renders the preamble between the header and the groups", () => {
    const result = buildProjectReportContent({ ...input, preamble: "PREAMBLE\n\n---\n\n" });
    expect(result).toMatch(/Prereleases \(not covered\): 7\n\n---\n\nPREAMBLE\n\n---\n\n## Coding Agents\n/);
  });

  it("renders each group under its own heading with its own quiet line; the header counts all", () => {
    const tooling = {
      title: "Agent Tooling",
      summary: "## Overview\nTOOLS\n\n## DELTA\n- release",
      activities: [makeActivity("delta", { releases: [stableRelease] }), makeActivity("eps")],
    };
    const result = buildProjectReportContent({ ...input, groups: [agents, tooling] });
    expect(result).toContain("Projects: 5 | Active today: 2 | Stable releases: 2 |");
    const agentsAt = result.indexOf("## Coding Agents\n");
    const toolingAt = result.indexOf("## Agent Tooling\n");
    expect(agentsAt).toBeGreaterThan(-1);
    expect(toolingAt).toBeGreaterThan(agentsAt);
    expect(result.indexOf("[GAMMA]")).toBeLessThan(toolingAt);
    expect(result.slice(toolingAt)).toContain("### DELTA\n- release");
    expect(result.slice(toolingAt)).toContain("**Quiet today:** [EPS](https://github.com/org/eps)");
  });
});

// ---------------------------------------------------------------------------
// buildStealthSection
// ---------------------------------------------------------------------------

describe("buildStealthSection", () => {
  const now = Date.parse("2026-10-04T22:37:00Z");
  const model = (created: string, expires: string | null) => ({
    id: "stealth/space-bunny-alpha",
    name: "Space Bunny Alpha",
    created,
    expires,
  });

  it("flags new and soon-expiring models", () => {
    const out = buildStealthSection([model("2026-10-03", "2026-10-05")], now);
    expect(out).toContain("## 🕵️ Stealth Models on OpenRouter");
    expect(out).toContain(
      "| [Space Bunny Alpha](https://openrouter.ai/stealth/space-bunny-alpha) `stealth/space-bunny-alpha` | 2026-10-03 | 2026-10-05 | 🆕 new, ⏳ expires in 1d |",
    );
  });

  it("marks an established model without a near expiry as live", () => {
    expect(buildStealthSection([model("2026-09-23", null)], now)).toContain("| 2026-09-23 | — | live |");
  });

  it("says so when no stealth model is listed or the catalog failed", () => {
    expect(buildStealthSection([], now)).toContain("No stealth models listed");
    expect(buildStealthSection(null, now)).toContain("catalog unavailable");
  });
});

// ---------------------------------------------------------------------------
// Brief (GitHub issue) variant
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Trending tables
// ---------------------------------------------------------------------------

function trendingReport(over: Partial<TrendingReportData> = {}): TrendingReportData {
  return {
    radar: [
      {
        n: 1,
        keys: ["openrouter:1", "npm:kilo"],
        name: "Kilo",
        url: "https://kilo.ai/",
        description: "",
        sources: ["OpenRouter", "npm"],
        signals: ["🆕 week #3 / month —", "1,000/week, 4.3x"],
        isNew: true,
        links: [],
      },
      {
        n: 2,
        keys: ["npm:bare"],
        name: "bare",
        url: "",
        description: "A | piped\ndescription",
        sources: ["npm"],
        signals: ["10/week, 1.0x"],
        isNew: false,
        links: [],
      },
    ],
    categories: [
      {
        category: "coding_agent",
        rows: [
          {
            n: 3,
            key: "github:o/r",
            fullName: "o/r",
            url: "https://github.com/o/r",
            description: "word ".repeat(60),
            language: "Rust",
            totalStars: 100,
            gain: 7,
            gainFrom: "trending",
            relative: null,
            starsCell: "100 (+7)",
            isNew: false,
          },
        ],
      },
    ],
    onFire: [],
    classifiedBy: "topics",
    ...over,
  };
}

describe("renderTrendingTables", () => {
  it("renders both sections with summaries, falling back to descriptions", () => {
    const md = renderTrendingTables(trendingReport(), new Map([[1, "Kilo is | an agent."]]));
    expect(md).toContain(`## ${TRENDS_REPORT.radarHeading}\n\n${TRENDS_REPORT.radarHeader}\n`);
    expect(md).toContain(
      "| [Kilo](https://kilo.ai/) | OpenRouter; npm | 🆕 week #3 / month —; 1,000/week, 4.3x | Kilo is \\| an agent. |",
    );
    // No url → plain name; pipe and newline escaped in the description fallback.
    expect(md).toContain("| bare | npm | 10/week, 1.0x | A \\| piped description |");
    expect(md).toContain(
      `## ${TRENDS_REPORT.categoryTitles.coding_agent}\n\n${TRENDS_REPORT.categoryHeader}`,
    );
    // Long description cut at a word boundary under 160 chars.
    const row = md.split("\n").find((l) => l.startsWith("| [o/r]"))!;
    expect(row).toMatch(
      /^\| \[o\/r\]\(https:\/\/github\.com\/o\/r\) \| Rust \| 100 \(\+7\) \| (word ){31}word… \|$/,
    );
    expect(md).not.toContain("---\n\n");
  });

  it("puts 🔥 before the name of a row that was in last week's report", () => {
    const base = trendingReport();
    const md = renderTrendingTables(
      trendingReport({
        radar: base.radar.map((r, i) => ({ ...r, onFire: i === 0 })),
        categories: base.categories.map((c) => ({ ...c, rows: c.rows.map((r) => ({ ...r, onFire: true })) })),
      }),
      new Map(),
    );
    expect(md).toContain("| 🔥 [Kilo](https://kilo.ai/) | OpenRouter; npm |");
    expect(md).toContain("| bare | npm |");
    expect(md).toContain("| 🔥 [o/r](https://github.com/o/r) | Rust |");
  });

  it("shows — when there is neither summary nor description", () => {
    const md = renderTrendingTables(trendingReport(), new Map());
    expect(md).toContain(
      "| [Kilo](https://kilo.ai/) | OpenRouter; npm | 🆕 week #3 / month —; 1,000/week, 4.3x | — |",
    );
  });

  it("omits empty sections and returns empty when both are", () => {
    const noRadar = renderTrendingTables(trendingReport({ radar: [] }), new Map());
    expect(noRadar).not.toContain(TRENDS_REPORT.radarHeading);
    expect(noRadar.startsWith(`## ${TRENDS_REPORT.categoryTitles.coding_agent}`)).toBe(true);
    const noCategories = renderTrendingTables(trendingReport({ categories: [] }), new Map());
    expect(noCategories).not.toContain(TRENDS_REPORT.categoryTitles.coding_agent);
    expect(renderTrendingTables(trendingReport({ radar: [], categories: [] }), new Map())).toBe("");
  });
});

describe("renderCandidates", () => {
  const tracked = [{ id: "claude-code", repo: "anthropics/claude-code", name: "Claude Code" }];

  it("lists the 🔥 repos in no config.yml section by the section they would join, with their config lines", () => {
    const md = renderCandidates(
      [
        { fullName: "Org/Fast-Agent", category: "coding_agent" },
        { fullName: "ANTHROPICS/claude-code", category: "coding_agent" },
        { fullName: "o/mux", category: "multi_agent" },
        { fullName: "o/tool", category: "agent_tooling" },
        { fullName: "o/jobs", category: "other_agent" },
      ],
      tracked,
    );
    expect(md).toBe(
      `## ${TRENDS_REPORT.candidatesHeading}\n\n${TRENDS_REPORT.candidatesIntro}\n\n` +
        "`agents.repos`:\n\n```yaml\n    - id: fast-agent\n      repo: Org/Fast-Agent\n      name: Fast-Agent\n```\n\n" +
        "`infra.repos`:\n\n```yaml\n    - id: mux\n      repo: o/mux\n      name: mux\n" +
        "    - id: tool\n      repo: o/tool\n      name: tool\n```",
    );
  });

  it("is empty when every 🔥 repo is tracked or an Other Agent, or there are none", () => {
    expect(
      renderCandidates([{ fullName: "anthropics/claude-code", category: "coding_agent" }], tracked),
    ).toBe("");
    expect(renderCandidates([{ fullName: "o/jobs", category: "other_agent" }], tracked)).toBe("");
    expect(renderCandidates([], tracked)).toBe("");
  });
});

describe("renderResearchTable", () => {
  it("links each paper, with its summary or else its abstract", () => {
    const paper = (n: number) => ({
      n,
      id: `p${n}`,
      title: `Paper ${n}`,
      url: `https://arxiv.org/abs/p${n}`,
      published: "2026-10-20T00:00:00Z",
      relevance: 0.5,
      abstract: `Abstract ${n}.`,
      date: "2026-10-21",
    });
    expect(renderResearchTable([paper(1), paper(2)], new Map([[1, "Shows X."]]))).toBe(
      `## ${TRENDS_REPORT.researchHeading}\n\n${TRENDS_REPORT.researchTableHeader}\n` +
        "| [Paper 1](https://arxiv.org/abs/p1) | Shows X. |\n| [Paper 2](https://arxiv.org/abs/p2) | Abstract 2. |",
    );
    expect(renderResearchTable([], new Map())).toBe("");
  });
});

describe("renderPolicyTable", () => {
  const items = [
    {
      id: "1",
      title: "AI Act | guidelines",
      link: "https://example.eu/a",
      published: "2026-10-09T07:16:00.000Z",
      description: "The AI Office publishes guidelines.",
      source: "European Commission",
      jurisdiction: "eu" as const,
      jevOnly: false,
    },
    {
      id: "2",
      title: "Scientific panel",
      link: "https://example.eu/b",
      published: "2026-10-08T07:00:00.000Z",
      description: "",
      source: "European Commission",
      jurisdiction: "eu" as const,
      jevOnly: false,
    },
  ];

  const motion = {
    ...items[1]!,
    id: "3",
    title: "Motie AI",
    link: "https://example.nl/m",
    source: "Tweede Kamer",
    jurisdiction: "nl" as const,
    stage: "Stemmen - aangenomen",
  };

  it("renders one section per jurisdiction, date, source, title and stage from the data, the summary from the model", () => {
    const summaries = new Map([
      [1, "Guidelines for providers."],
      [3, "A motion passed."],
    ]);
    expect(renderPolicyTable(numberRows([...items, motion]), summaries)).toBe(
      "## EU\n\n" +
        "| Date | Source | Title | Stage | Summary |\n| :--- | :--- | :--- | :--- | :--- |\n" +
        "| 2026-10-09 | European Commission | [AI Act \\| guidelines](https://example.eu/a) |  | Guidelines for providers. |\n" +
        "| 2026-10-08 | European Commission | [Scientific panel](https://example.eu/b) |  | — |\n\n" +
        "## Netherlands\n\n" +
        "| Date | Source | Title | Stage | Summary |\n| :--- | :--- | :--- | :--- | :--- |\n" +
        "| 2026-10-08 | Tweede Kamer | [Motie AI](https://example.nl/m) | Stemmen - aangenomen | A motion passed. |",
    );
  });

  it("renders news items in their own section after every jurisdiction, without a stage column", () => {
    const news = { ...items[0]!, id: "4", source: "Politico Europe", news: true };
    expect(renderPolicyTable(numberRows([items[1]!, motion, news]), new Map([[3, "A report."]]))).toMatch(
      /## Netherlands\n[\s\S]*\n\n## News & commentary\n\n\| Date \| Source \| Title \| Summary \|\n\| :--- \| :--- \| :--- \| :--- \|\n\| 2026-10-09 \| Politico Europe \| \[AI Act \\\| guidelines\]\(https:\/\/example\.eu\/a\) \| A report\. \|$/,
    );
  });

  it("falls back to the description when the model gave no summary", () => {
    expect(renderPolicyTable(numberRows(items), new Map())).toContain(
      "| The AI Office publishes guidelines. |",
    );
  });

  it("truncates a long title in the link text only", () => {
    const long = { ...items[0]!, title: "x".repeat(300) };
    const md = renderPolicyTable(numberRows([long]), new Map());
    expect(md).toContain(`[${"x".repeat(200)}…](`);
    expect(md).not.toContain("x".repeat(201));
  });

  it("is empty with no items", () => {
    expect(renderPolicyTable([], new Map())).toBe("");
  });
});

// ---------------------------------------------------------------------------
// stripModelTitle
// ---------------------------------------------------------------------------

describe("highlightsOnly", () => {
  it("keeps Highlights and drops a section the model added", () => {
    expect(highlightsOnly("# Report\n\n## Highlights\n\n- A.\n- B.\n\n## Signals\n\nMore.")).toBe(
      "## Highlights\n\n- A.\n- B.",
    );
  });

  it("puts bare bullets under the heading", () => {
    expect(highlightsOnly("- A.\n\n## Worth a Look\n\n- x")).toBe("## Highlights\n\n- A.");
  });

  it("puts the failure notice under the heading", () => {
    expect(highlightsOnly(MSG.summaryFailed)).toBe(`## Highlights\n\n${MSG.summaryFailed}`);
  });
});

describe("unwrapCodeLinks", () => {
  it("takes a link, a release range and an issue link out of backticks", () => {
    const md =
      "- **Release**: `[v2.1.307](https://g.com/r/v2.1.307)–[v2.1.308](https://g.com/r/v2.1.308)` update the API.\n" +
      "- **Hot issue**: `[#142307](https://g.com/i/142307)` — the pinned `certifi==2026.5.20` trusts revoked CAs.";
    expect(unwrapCodeLinks(md)).toBe(
      "- **Release**: [v2.1.307](https://g.com/r/v2.1.307)–[v2.1.308](https://g.com/r/v2.1.308) update the API.\n" +
        "- **Hot issue**: [#142307](https://g.com/i/142307) — the pinned `certifi==2026.5.20` trusts revoked CAs.",
    );
  });

  it("leaves a code span with more than links in it", () => {
    const md = "Run `npm i [pkg](https://npmjs.com/pkg)` first.";
    expect(unwrapCodeLinks(md)).toBe(md);
  });
});

describe("stripModelTitle", () => {
  it("drops the model's own H1: code renders the report's", () => {
    const md = "# Hacker News AI Community Digest — 2026-10-12\n\n## Today's Highlights\n\nText.";
    expect(stripModelTitle(md)).toBe("## Today's Highlights\n\nText.");
  });

  it("drops the web report's title block and its rule", () => {
    const md =
      "# AI Official Content Tracking Report\n**Date:** 2026-10-11  \n" +
      "**Source:** Anthropic & OpenAI  \n**Type:** Incremental Update  \n\n---\n\n## Highlights\n\nText.";
    expect(stripModelTitle(md)).toBe("## Highlights\n\nText.");
  });

  it("drops the Skills summary's title (2026-10-12 trending report)", () => {
    const md =
      "# Claude Code Skills Community Highlights (2026-10-12)\n\n" +
      "## Top Skills Ranking (Most Active PRs)\n\n| Skill | Status |\n|---|---|";
    expect(stripModelTitle(md)).toBe(
      "## Top Skills Ranking (Most Active PRs)\n\n| Skill | Status |\n|---|---|",
    );
  });

  it("demotes a later H1 instead of dropping its section", () => {
    expect(stripModelTitle("## A\n\n# B\n\nText.")).toBe("## A\n\n## B\n\nText.");
  });

  it("leaves a body without a title alone, including a leading rule", () => {
    expect(stripModelTitle("## A\n\nText.")).toBe("## A\n\nText.");
    expect(stripModelTitle("Plain text.\n\n---\n\nMore.")).toBe("Plain text.\n\n---\n\nMore.");
  });

  it("does not touch # inside code fences", () => {
    const md = "## A\n\n```sh\n# a comment\n```";
    expect(stripModelTitle(md)).toBe(md);
  });
});

describe("nestHeadings", () => {
  it("shifts every heading so the top one sits at the given level", () => {
    expect(nestHeadings("## A\n\ntext\n\n### B", 3)).toBe("### A\n\ntext\n\n#### B");
  });

  it("leaves headings already deep enough, and code fences, alone", () => {
    expect(nestHeadings("### A\n\n#### B", 3)).toBe("### A\n\n#### B");
    expect(nestHeadings("## A\n```\n## not a heading\n```", 3)).toBe("### A\n```\n## not a heading\n```");
  });

  it("caps at level 6", () => {
    expect(nestHeadings("## A\n###### B", 4)).toBe("#### A\n###### B");
  });
});

describe("report bar", () => {
  const url = "https://example.com/dd";

  it("links the day's other reports and the overview; the current one is bold, unlinked", () => {
    const bar = renderReportBar("ai-models", ["ai-agents", "ai-models", "ai-trends"], "2026-10-12", url);
    expect(bar).toBe(
      `[📅 Overview](${url}/#2026-10-12) · [🤖 AI Agents](${url}/#2026-10-12/ai-agents) · ` +
        `**🧠 AI Models & Labs** · [📈 Trends](${url}/#2026-10-12/ai-trends)`,
    );
  });

  it("orders the links like REPORTS, whatever order the reports were saved in", () => {
    const bar = renderReportBar("ai-agents", ["ai-trends", "ai-agents"], "2026-10-12", url);
    expect(bar.indexOf("AI Agents")).toBeLessThan(bar.indexOf("Trends"));
  });

  it("goes under the H1", () => {
    expect(withReportBar("# T 2026-10-12\n\n> meta\n\nbody", "BAR")).toBe(
      "# T 2026-10-12\n\nBAR\n\n> meta\n\nbody",
    );
  });
});
