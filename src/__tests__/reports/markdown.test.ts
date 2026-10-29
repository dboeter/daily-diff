import fs from "node:fs";
import { describe, expect, it } from "vitest";
import type { GitHubRelease } from "../../core/github.ts";
import type { HotIssue } from "../../core/hot-issues.ts";
import { MSG, TRENDS_REPORT } from "../../core/strings.ts";
import {
  buildProjectReportContent,
  buildStealthSection,
  highlightsOnly,
  nestHeadings,
  renderCandidates,
  renderOpenRouterUsage,
  renderPolicyTable,
  renderReportBar,
  renderResearchTable,
  renderSpottedTable,
  renderTrendingTables,
  renderVendorTables,
  signListItems,
  stripModelTitle,
  unwrapCodeLinks,
  withReportBar,
  renderHfTable,
  unsummarizedRows,
} from "../../reports/markdown.ts";
import { type ProjectActivity, goingAwayRule } from "../../reports/prompts.ts";
import { numberRows } from "../../reports/summarized-table.ts";
import type { KeptVendorItem } from "../../data/relevance.ts";
import type { Story, StorySource } from "../../spotted/pool.ts";
import type { TrendingReportData } from "../../trending/rank.ts";

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
        signals: ["🆕 week #3 / month —", "1,000 downloads/week, 4.3x"],
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
        signals: ["10 downloads/week, 1.0x"],
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

const story = (id: string, source: StorySource = "hn", points = 10, extra: Partial<Story> = {}): Story => ({
  id: `${source}:${id}`,
  source,
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  discussionUrl: `https://news.ycombinator.com/item?id=${id}`,
  points,
  comments: 3,
  published: "2026-10-21T10:00:00Z",
  ...extra,
});

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

  it("keeps projects with data active when the summaries call failed", () => {
    const news = [{ source: "Hacker News", title: "BETA 2.0", url: "u", detail: "d" }];
    const result = buildProjectReportContent(
      withAgents({
        summary: MSG.summaryFailed,
        activities: [agents.activities[0]!, makeActivity("beta", { news }), makeActivity("gamma")],
      }),
    );
    expect(result).toContain("Active today: 2 |");
    expect(result).toContain("**Quiet today:** [GAMMA](https://github.com/org/gamma)");
  });

  it("shows a release the model wrote off as 'no reportable changes', from its notes, and counts it", () => {
    const deck = makeActivity("deck", {
      config: { id: "deck", repo: "asheshgoplani/agent-deck", name: "Agent Deck" },
      releases: [
        {
          ...stableRelease,
          tag_name: "v1.16.34",
          name: "v1.16.34",
          body:
            "## Changes\n- chore(deps): bump golang.org/x/net\n- **Session forks** keep their [worktree](https://x) (#812)\n" +
            "- Fix status bar flicker by @a in https://github.com/o/r/pull/1\n- Add `--json` to list\n- Faster search",
        },
      ],
    });
    const result = buildProjectReportContent(
      withAgents({
        summary: "(no reportable changes for Agent Deck v1.16.34 — only dependency updates)",
        activities: [deck, makeActivity("gamma")],
      }),
    );
    expect(result).not.toContain("no reportable changes");
    expect(result).toContain(
      "### Agent Deck\n- **Release:** [v1.16.34](https://github.com/asheshgoplani/agent-deck/releases/tag/v1.16.34): " +
        "Session forks keep their worktree; Fix status bar flicker; Add `--json` to list",
    );
    expect(result).toContain("Projects: 2 | Active today: 1 | Stable releases: 1 |");
    expect(result).toContain("**Quiet today:** [GAMMA](https://github.com/org/gamma)");
  });

  it("appends the Release bullet to a released project's section that only has other bullets", () => {
    const alpha = makeActivity("alpha", { releases: [{ ...stableRelease, body: "- Add `--json` to list" }] });
    const result = buildProjectReportContent(
      withAgents({ summary: "## ALPHA\n- **News:** [A story](https://n) about it.", activities: [alpha] }),
    );
    expect(result).toContain(
      "- **News:** [A story](https://n) about it.\n" +
        "- **Release:** [v1](https://github.com/org/alpha/releases/tag/v1): Add `--json` to list",
    );
    expect(result).toContain("Active today: 1 | Stable releases: 1 |");
  });

  it("adds no Release bullet to a section that shows the release, labelled or by its tag", () => {
    const alpha = makeActivity("alpha", { releases: [{ ...stableRelease, body: "- Add `--json` to list" }] });
    for (const summary of [
      "## ALPHA\n- **Release**: [v1](https://x) adds `--json`.",
      "## ALPHA\n- [v1](https://x) adds `--json` to list.",
    ]) {
      const result = buildProjectReportContent(withAgents({ summary, activities: [alpha] }));
      expect(result.match(/releases\/tag\/v1|\]\(https:\/\/x\)/g)).toHaveLength(1);
    }
  });

  describe("backticked tokens in a project section", () => {
    // Hermes Agent on 2026-10-26 (review A11): the two hot issues' titles and the body excerpt the
    // prompt saw (formatItem's first 300 characters), and the section the model wrote.
    const issue = (number: number, title: string, body: string) => ({
      number,
      title,
      body,
      state: "open",
      user: { login: "u" },
      labels: [],
      created_at: "2026-10-25T00:00:00Z",
      updated_at: "2026-10-26T00:00:00Z",
      comments: 12,
      html_url: `https://github.com/NousResearch/hermes-agent/issues/${number}`,
      gain: 12,
    });
    const hermes: ProjectActivity = {
      ...makeActivity("hermes"),
      config: { id: "hermes", repo: "NousResearch/hermes-agent", name: "Hermes Agent" },
      hotIssues: [
        issue(
          143982,
          "[Bug]: Secrets passed as command-line flags (--password=, --token=, docker login -p) and Azure AccountKey/SharedAccessKey pass the chat egress and approval-card redaction",
          "### Bug Description\n\nTwo common credential shapes pass the chat egress scrub (`redact_for_egress`) and the approval-card scrub (`_redact_approval_command`) unmasked:\n\n1. **Secrets given as command-line flags:** `--password=…`, `--password …`, `--token=…`, `--api-key=…`, `docker login -p …`.",
        ),
        issue(
          143938,
          "gateway status prints MCP child-process command-line secrets verbatim (process-tree path has no redaction)",
          "## Symptom\n\n`hermes gateway status` prints the gateway's full child-process tree, including each child's complete command line. When an MCP server is configured with a credential in its launch command (for example an `--api-key` argument), the live key value is printed in plaintext.",
        ),
      ],
    };
    const section = [
      "## Hermes Agent",
      "- **Hot issue**: Secrets passed as CLI flags (`--password=`, `--token=`, `docker login -p`) and Azure keys bypass chat egress and approval-card redaction [#143982](https://github.com/NousResearch/hermes-agent/issues/143982).",
      "- **Hot issue**: `hermes gateway status` prints MCP child-process command lines verbatim, exposing API keys in plaintext [#143938](https://github.com/NousResearch/hermes-agent/issues/143938).",
    ].join("\n");
    const render = (summary: string) =>
      buildProjectReportContent(withAgents({ summary, activities: [hermes] }));

    it("keeps every token of the 2026-10-26 Hermes section, all in its source", () => {
      const result = render(section);
      for (const token of ["--password=", "--token=", "docker login -p", "hermes gateway status"]) {
        expect(result).toContain(`\`${token}\``);
      }
    });

    it("respells a token to its source's form and unwraps one the source lacks", () => {
      const result = render(
        `${section}\n- **Hot issue**: \`redactForEgress\` and \`mask_secrets()\` miss these flags [#143982](https://github.com/NousResearch/hermes-agent/issues/143982).`,
      );
      expect(result).toContain("`redact_for_egress` and mask_secrets() miss");
    });

    it("checks a section only against its own project's source", () => {
      const other = makeActivity("alpha", { releases: [stableRelease] });
      const result = buildProjectReportContent(
        withAgents({
          summary: `## ALPHA\n- **Release**: adds \`hermes gateway status\`.\n\n${section}`,
          activities: [other, hermes],
        }),
      );
      expect(result).toContain("adds hermes gateway status.");
      expect(result).toContain("- **Hot issue:** `hermes gateway status` prints");
    });
  });

  it("never labels a no-stable-yet project's prerelease as a Release or counts it as stable", () => {
    // fetchProject sends such a project's prereleases as `previews`; `releases` stays stable-only.
    const beta = makeActivity("beta", {
      previews: [{ ...stableRelease, tag_name: "v0.3.0-beta.1", prerelease: true }],
    });
    const result = buildProjectReportContent(withAgents({ summary: "", activities: [beta] }));
    expect(result).not.toContain("**Release:**");
    expect(result).toContain("Stable releases: 0 |");
    expect(result).toContain("**Quiet today:** [BETA](https://github.com/org/beta)");
  });

  it("drops a project section without a bullet; a project without a release then goes quiet", () => {
    const news = [{ source: "Hacker News", title: "BETA", url: "u", detail: "d" }];
    const result = buildProjectReportContent(
      withAgents({
        summary: "## ALPHA\n- release\n\n## BETA\nNothing to report today.",
        activities: [agents.activities[0]!, makeActivity("beta", { news })],
      }),
    );
    expect(result).not.toContain("Nothing to report");
    expect(result).toContain("Active today: 1 |");
    expect(result).toContain("**Quiet today:** [BETA](https://github.com/org/beta)");
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
    expect(result).toMatch(
      /Prereleases \(not covered\): 7 \| Generated: [^\n]+ UTC\n\n---\n\nPREAMBLE\n\n---\n\n## Coding Agents\n/,
    );
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

  describe("hot issue bullets", () => {
    const hot = (number: number, o: Partial<HotIssue> = {}): HotIssue => ({
      number,
      title: `Issue ${number}`,
      state: "open",
      user: { login: "alice" },
      labels: [],
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-10-04T00:00:00Z",
      comments: 16,
      reactions: { "+1": 2 },
      html_url: `https://github.com/org/alpha/issues/${number}`,
      gain: 3,
      ...o,
    });
    const render = (summary: string, hotIssues: HotIssue[]) =>
      buildProjectReportContent(withAgents({ summary, activities: [makeActivity("alpha", { hotIssues })] }));

    it("links the issue and appends its label, counts and gain in code (Gemini #15404, 2026-10-28)", () => {
      const gemini = hot(15404, { labels: [{ name: "priority/p2" }, { name: "area/security" }] });
      const result = render(
        "## ALPHA\n- **Hot issue**: #15404: users report temp files flagged by antivirus (16 comments, +3 in 24h)",
        [gemini],
      );
      expect(result).toContain(
        "- **Hot issue:** [#15404](https://github.com/org/alpha/issues/15404): users report temp files flagged by antivirus" +
          " (area/security; 16 comments, 2 👍; +3 in the last 24h)",
      );
    });

    it("takes a Hot Issue label in any case, so the issue gets no second bullet", () => {
      const result = render("## ALPHA\n- **Hot Issue:** #15404: temp files flagged by antivirus", [
        hot(15404),
      ]);
      expect(result).toContain(
        "- **Hot Issue:** [#15404](https://github.com/org/alpha/issues/15404): temp files",
      );
      expect(result.match(/#15404\]/g)).toHaveLength(1);
    });

    it("keeps the model's link, names the gain's date and shows the fix PR, per issue when a bullet names two", () => {
      const result = render(
        "## ALPHA\n- **Hot issue:** [#1](https://github.com/org/alpha/issues/1) and #2: an issue says logins fail",
        [
          hot(1, {
            gainSince: "2026-10-02",
            fix: { state: "open", number: 5, url: "https://github.com/org/alpha/pull/5" },
          }),
          hot(2, {
            comments: 9,
            reactions: { "+1": 1 },
            gain: 10,
            fix: { state: "merged", number: 6, url: "u6" },
          }),
        ],
      );
      expect(result).toContain(
        "- **Hot issue:** [#1](https://github.com/org/alpha/issues/1) and [#2](https://github.com/org/alpha/issues/2): an issue says logins fail" +
          " (#1: 16 comments, 2 👍; +3 since 2026-10-02; fix PR [#5](https://github.com/org/alpha/pull/5) open)" +
          " (#2: 9 comments, 1 👍; +10 in the last 24h; fix [#6](u6) merged)",
      );
    });

    it("leaves a bullet that names no hot issue as written", () => {
      const result = render("## ALPHA\n- **Hot issue:** #99 (12 comments) users report a crash", [hot(1)]);
      expect(result).toContain("- **Hot issue:** #99 (12 comments) users report a crash");
    });

    it("writes the bullet of a hot issue the model left out, its title as the description", () => {
      const result = render("## ALPHA\n- **Hot issue:** #1: users report a crash", [
        hot(1),
        hot(2, { title: "Login loops after update", comments: 1, reactions: { "+1": 9 }, gain: 10 }),
      ]);
      expect(result).toContain(
        "- **Hot issue:** [#1](https://github.com/org/alpha/issues/1): users report a crash (16 comments, 2 👍; +3 in the last 24h)\n" +
          "- **Hot issue:** [#2](https://github.com/org/alpha/issues/2): Login loops after update (1 comment, 9 👍; +10 in the last 24h)",
      );
    });

    it("writes the section of a project the model left out that has only a hot issue", () => {
      const result = buildProjectReportContent(
        withAgents({
          summary: "## BETA\n- **News:** [a story](https://x) about beta",
          activities: [makeActivity("alpha", { hotIssues: [hot(1)] }), makeActivity("beta")],
        }),
      );
      expect(result).toContain(
        "### ALPHA\n- **Hot issue:** [#1](https://github.com/org/alpha/issues/1): Issue 1 (16 comments, 2 👍; +3 in the last 24h)",
      );
      expect(result).not.toContain("[ALPHA](https://github.com/org/alpha)");
    });
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
    expect(out).toContain("## Stealth Models on OpenRouter");
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

describe("renderOpenRouterUsage", () => {
  it("ranks and links every model in code, with the snapshot's day", () => {
    const md = renderOpenRouterUsage(
      [
        { slug: "a/one", tokens: 33_560_000_000_000 },
        { slug: "b/two", tokens: 18_000_000_000_000 },
      ],
      "2026-10-25",
    );
    expect(md).toContain(TRENDS_REPORT.openRouterIntro("2026-10-25"));
    expect(md).toContain("| 1 | [a/one](https://openrouter.ai/a/one) | 33.56T |");
    expect(md).toContain("| 2 | [b/two](https://openrouter.ai/b/two) | 18.00T |");
    expect(md).not.toContain("[link]");
    expect(renderOpenRouterUsage([], "")).toBe("");
  });

  it("adds last week's rank, and new for a model not ranked then, only with a saved ranking", () => {
    const models = [
      { slug: "a/one", tokens: 2e12 },
      { slug: "c/three", tokens: 1e12 },
    ];
    const md = renderOpenRouterUsage(models, "2026-10-25", ["b/two", "a/one"]);
    expect(md).toContain(TRENDS_REPORT.openRouterHeaderLastWeek);
    expect(md).toContain(TRENDS_REPORT.openRouterIntro("2026-10-25", true));
    expect(md).toContain("| 1 | [a/one](https://openrouter.ai/a/one) | 2.00T | 2 |");
    expect(md).toContain(
      `| 2 | [c/three](https://openrouter.ai/c/three) | 1.00T | ${TRENDS_REPORT.openRouterNewcomer} |`,
    );
    expect(renderOpenRouterUsage(models, "2026-10-25")).not.toContain("Last week");
  });
});

describe("renderHfTable", () => {
  const model = (id: string, o: object = {}) => ({
    id,
    author: id.split("/")[0]!,
    likes: 18406,
    downloads: 7762014,
    tags: ["qwen3_5"],
    pipelineTag: "image-text-to-text",
    parameters: 27.4e9,
    lastModified: "",
    url: `https://huggingface.co/${id}`,
    variants: [],
    ...o,
  });

  it("ranks in code, marks 🔥 by last week's keys, links variants, and gives the windows", () => {
    const rows = numberRows([
      model("Qwen/Qwen3.8-27B"),
      model("o/flint", { variants: [model("u/flint-GGUF")], pipelineTag: "", parameters: null }),
    ]);
    const md = renderHfTable(
      rows,
      new Map([[1, "A 27B vision-language model."]]),
      new Set(["hf:u/flint-gguf"]),
    );
    expect(md).toContain(TRENDS_REPORT.hfHeader);
    expect(md).toContain("Likes (total)");
    expect(md).toContain("Downloads (30 days)");
    expect(md).toContain(
      "| 1 | [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) | 18,406 | 7,762,014 | A 27B vision-language model. |",
    );
    expect(md).toContain(
      "| 2 | 🔥 [o/flint](https://huggingface.co/o/flint) (+ [u/flint-GGUF](https://huggingface.co/u/flint-GGUF)) | 18,406 | 7,762,014 | — |",
    );
    expect(md).not.toContain("qwen3_5");
    // A failed call: the task and size.
    expect(renderHfTable(rows.slice(0, 1), new Map())).toContain("| Image text to text, 27B parameters |");
    expect(renderHfTable([], new Map())).toBe("");
  });

  it("fills a row the model left — with its size and task; only a row with no data stays —", () => {
    const rows = numberRows([
      model("o/sized", { pipelineTag: "" }),
      model("o/tasked"),
      model("o/bare", { pipelineTag: "", parameters: null }),
    ]);
    const dashes = new Map([
      [1, "—"],
      [2, "—"],
      [3, "—"],
    ]);
    const md = renderHfTable(rows, dashes);
    expect(md).toContain("| 27B parameters |");
    expect(md).toContain("| Image text to text, 27B parameters |");
    expect(md).toMatch(/\[o\/bare\][^\n]*\| — \|$/m);
    expect(unsummarizedRows(undefined, new Map(), rows, dashes).map((r) => r.name)).toEqual(["o/bare"]);
  });

  it("names the rows that show — for the prose call: no summary, no description", () => {
    const hf = numberRows([model("o/a"), model("o/b", { pipelineTag: "", parameters: null })]);
    const report = {
      radar: [
        {
          n: 1,
          name: "Strix",
          description: "",
          keys: [],
          url: "",
          sources: [],
          signals: [],
          isNew: false,
          links: [],
        },
        {
          n: 2,
          name: "Pi",
          description: "A coding agent.",
          keys: [],
          url: "",
          sources: [],
          signals: [],
          isNew: false,
          links: [],
        },
      ],
      categories: [],
      onFire: [],
      classifiedBy: "jev",
    } as unknown as TrendingReportData;
    expect(unsummarizedRows(report, new Map(), hf, new Map()).map((r) => r.name)).toEqual(["Strix", "o/b"]);
    expect(
      unsummarizedRows(report, new Map([[1, "Strix tests apps."]]), hf, new Map([[2, "A model."]])),
    ).toEqual([]);
  });
});

describe("renderTrendingTables", () => {
  it("renders both sections with summaries, falling back to descriptions", () => {
    const md = renderTrendingTables(trendingReport(), new Map([[1, "Kilo is | an agent."]]));
    expect(md).toContain(
      `## ${TRENDS_REPORT.radarHeading}\n\n${TRENDS_REPORT.radarLegend}\n\n${TRENDS_REPORT.radarHeader}\n`,
    );
    expect(md).toContain(
      "| [Kilo](https://kilo.ai/) | OpenRouter; npm | 🆕 week #3 / month —; 1,000 downloads/week, 4.3x | Kilo is \\| an agent. |",
    );
    // No url → plain name; pipe and newline escaped in the description fallback.
    expect(md).toContain("| bare | npm | 10 downloads/week, 1.0x | A \\| piped description |");
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
      "| [Kilo](https://kilo.ai/) | OpenRouter; npm | 🆕 week #3 / month —; 1,000 downloads/week, 4.3x | — |",
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

  it("links the 🔥 repos in no config.yml section by the section their category fits, config lines collapsed", () => {
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
        "- `agents.repos`: [Org/Fast-Agent](https://github.com/Org/Fast-Agent)\n" +
        "- `infra.repos`: [o/tool](https://github.com/o/tool)\n" +
        `- ${TRENDS_REPORT.candidatesNoSection} [o/mux](https://github.com/o/mux), [o/jobs](https://github.com/o/jobs)\n\n` +
        `<details><summary>${TRENDS_REPORT.candidatesConfig}</summary>\n\n` +
        "`agents.repos`:\n\n```yaml\n    - id: fast-agent\n      repo: Org/Fast-Agent\n      name: Fast-Agent\n```\n\n" +
        "`infra.repos`:\n\n```yaml\n    - id: tool\n      repo: o/tool\n      name: tool\n```\n\n</details>",
    );
  });

  it("files the 2026-10-26 harnesses and multi-agent systems under no section, not infra.repos", () => {
    const candidates = JSON.parse(
      fs.readFileSync(new URL("../fixtures/candidates-2026-10-26.json", import.meta.url), "utf-8"),
    ) as Parameters<typeof renderCandidates>[0];
    const lines = renderCandidates(candidates, tracked).split("\n");
    const infra = lines.find((l) => l.startsWith("- `infra.repos`:")) ?? "";
    const none = lines.find((l) => l.startsWith(`- ${TRENDS_REPORT.candidatesNoSection}`)) ?? "";
    for (const r of ["ruvnet/ruflo", "paperclipai/paperclip", "alibaba/open-code-review", "DSH-APP/DSHA"]) {
      expect(infra).not.toContain(r);
      expect(none).toContain(r);
    }
  });

  it("has no config lines when only unmatched repos remain, and is empty when every 🔥 repo is tracked", () => {
    const md = renderCandidates([{ fullName: "o/jobs", category: "other_agent" }], tracked);
    expect(md).toContain(`- ${TRENDS_REPORT.candidatesNoSection} [o/jobs]`);
    expect(md).not.toContain("<details>");
    expect(
      renderCandidates([{ fullName: "anthropics/claude-code", category: "coding_agent" }], tracked),
    ).toBe("");
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

  it("renders one section per jurisdiction, date, source, title and stage (— without one) from the data, the summary from the model", () => {
    const summaries = new Map([
      [1, "Guidelines for providers."],
      [3, "A motion passed."],
    ]);
    expect(renderPolicyTable(numberRows([...items, motion]), summaries)).toBe(
      "## EU\n\n" +
        "| Date | Source | Title | Stage | Summary |\n| :--- | :--- | :--- | :--- | :--- |\n" +
        "| 2026-10-09 | European Commission | [AI Act \\| guidelines](https://example.eu/a) | — | Guidelines for providers. |\n" +
        "| 2026-10-08 | European Commission | [Scientific panel](https://example.eu/b) | — | — |\n\n" +
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

  it("leaves link syntax that is not a web link: a placeholder or a relative path", () => {
    const md = "Markdown links like `[text](url)` now render, as does `[guide](./docs/guide.md)`.";
    expect(unwrapCodeLinks(md)).toBe(md);
  });

  it("pairs backticks span by span, so a link between two spans stays outside both", () => {
    const md = "Set `foo`[docs](https://x.io) `bar` and `[v1](https://g.com/v1)`.";
    expect(unwrapCodeLinks(md)).toBe("Set `foo`[docs](https://x.io) `bar` and [v1](https://g.com/v1).");
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
      `[⬛ Overview](${url}/#2026-10-12) · [🟪 AI Agents](${url}/#2026-10-12/ai-agents) · ` +
        `**🟦 AI Models & Labs** · [🟫 Trends](${url}/#2026-10-12/ai-trends)`,
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

// ---------------------------------------------------------------------------
// formatDiscussion
// ---------------------------------------------------------------------------

describe("signListItems", () => {
  it("turns a hyphen or dash opening a list item into the minus sign, so it nests no list", () => {
    const md =
      "- - **Snowflake** retires X\n- – Fabric ends Y\n* — BigQuery drops Z\n- **DuckDB** 2.0 ships\n  - nested - stays";
    expect(signListItems(md)).toBe(
      "- − **Snowflake** retires X\n- − Fabric ends Y\n* − BigQuery drops Z\n- **DuckDB** 2.0 ships\n  - nested - stays",
    );
  });

  it("lands in a page's Highlights through highlightsOnly", () => {
    expect(highlightsOnly("## Highlights\n\n- - **X** is retired\n- **Y** ships")).toBe(
      "## Highlights\n\n- − **X** is retired\n- **Y** ships",
    );
  });

  it("makes a list of a section whose every bullet opens with the sign instead of a marker", () => {
    expect(highlightsOnly("## Highlights\n\n− **X** launches\n− **Y** ships")).toBe(
      "## Highlights\n\n- **X** launches\n- **Y** ships",
    );
  });

  it("lists each section of a longer reply on its own, with wrapped lines kept", () => {
    expect(
      signListItems("## Highlights\n\n- **Y** ships\n\n## Signals\n\n– Z grows,\n  fast\n— W slows"),
    ).toBe("## Highlights\n\n- **Y** ships\n\n## Signals\n\n- Z grows,\n  fast\n- W slows");
  });

  it("lists a section whose sign lines are followed by a rule or the tables marker", () => {
    expect(signListItems("## Highlights\n\n− X\n− Y\n\n<!-- tables -->\n\n---\n\n## Signals")).toBe(
      "## Highlights\n\n- X\n- Y\n\n<!-- tables -->\n\n---\n\n## Signals",
    );
  });

  it("leaves one unmarked sign line among prose or list items alone", () => {
    const md =
      "## Highlights\n\n- **X** ships a long thing\n— and more\n\nProse that wraps\n– after a dash\n\n```\n— code\n```";
    expect(signListItems(md)).toBe(md);
  });

  it("asks for the marker on every bullet and the sign after it", () => {
    expect(goingAwayRule("bullet")).toContain('Write every bullet as "- text"');
    expect(goingAwayRule("bullet")).toContain('"- − text"');
    expect(goingAwayRule("highlight")).toMatch(/^Start a highlight with "− "/);
  });
});

describe("renderSpottedTable", () => {
  it("links the story and its discussion with counts, reactions for Dev.to", () => {
    const rows = numberRows([
      { ...story("1", "hn", 312), comments: 95, page: "agents" as const },
      {
        ...story("2", "devto", 40),
        discussionUrl: "https://dev.to/a/2",
        description: "An article | with a pipe",
        page: "agents" as const,
      },
    ]);
    const md = renderSpottedTable(rows, new Map([[1, "What it is."]]));
    expect(md).toBe(
      "## Spotted\n\n" +
        "| Story | Source | Discussion | Summary |\n| :--- | :--- | :--- | :--- |\n" +
        "| [Story 1](https://example.com/1) | Hacker News | [312 points, 95 comments](https://news.ycombinator.com/item?id=1) | What it is. |\n" +
        "| [Story 2](https://example.com/2) | Dev.to | [40 reactions, 3 comments](https://dev.to/a/2) | An article \\| with a pipe |",
    );
  });

  it("renders nothing without rows", () => {
    expect(renderSpottedTable([], new Map())).toBe("");
  });
});

describe("renderSpottedTable links", () => {
  it("labels a GitHub repo link with the repo name, keeping the title", () => {
    const row = {
      n: 1,
      id: "hn:1",
      source: "hn" as const,
      title: "Show HN: Agentsh",
      url: "https://github.com/microsoft/Agensh",
      discussionUrl: "https://news.ycombinator.com/item?id=1",
      points: 10,
      comments: 2,
    };
    const md = renderSpottedTable([row], new Map());
    expect(md).toContain("| Show HN: Agentsh ([microsoft/Agensh](https://github.com/microsoft/Agensh)) |");
    expect(renderSpottedTable([{ ...row, url: "https://example.com/a" }], new Map())).toContain(
      "| [Show HN: Agentsh](https://example.com/a) |",
    );
  });
});

// ---------------------------------------------------------------------------
// One rendering convention across pages (ticket 17, 2026-10-26)
// ---------------------------------------------------------------------------

describe("rendering conventions", () => {
  const vendorRow = (n: number, extra: Partial<KeptVendorItem>): KeptVendorItem & { n: number } => ({
    n,
    id: `v${n}`,
    vendor: "snowflake",
    source: "Snowflake",
    title: `Item ${n}`,
    link: `https://example.com/${n}`,
    date: "2026-10-26",
    description: "",
    deprecation: false,
    aiInData: false,
    ...extra,
  });

  it("vendor tables: no date prefix, no Source column for one source, newest first (Snowflake 2026-10-26)", () => {
    const rows = [
      vendorRow(1, { title: "October 23, 2026: Coding agent MCP tool", date: "2026-10-23", aiInData: true }),
      vendorRow(2, {
        title: "Oct 26, 2026: Custom error messages for feature policy rules",
        date: "2026-10-26",
      }),
    ];
    const table = renderVendorTables(
      rows,
      new Map([
        [1, "One."],
        [2, "Two."],
      ]),
    ).snowflake!;
    expect(table).toBe(
      "| Date | Item | Summary |\n| :--- | :--- | :--- |\n" +
        "| 2026-10-26 | [Custom error messages for feature policy rules](https://example.com/2) | Two. |\n" +
        "| 2026-10-23 | 🤖 [Coding agent MCP tool](https://example.com/1) | One. |",
    );
  });

  it("vendor tables keep the Source column when a section mixes sources, deprecations first", () => {
    const rows = [
      vendorRow(1, { vendor: "azure", source: "Microsoft Fabric", date: "2026-10-20" }),
      vendorRow(2, { vendor: "gcp", source: "BigQuery", date: "2026-10-25" }),
      vendorRow(3, { vendor: "azure", source: "Microsoft Fabric", date: "2026-10-01", deprecation: true }),
    ];
    const table = renderVendorTables(rows, new Map()).cloud!;
    expect(table.split("\n")[0]).toBe("| Date | Source | Item | Summary |");
    const at = (s: string) => table.indexOf(s);
    expect(at("example.com/3")).toBeLessThan(at("example.com/2"));
    expect(at("example.com/2")).toBeLessThan(at("example.com/1"));
  });

  it("writes every bullet label as **Label:**, the form projectFallbackSection uses", () => {
    const result = buildProjectReportContent({
      heading: "# AI Agents 2026-10-26",
      utcStr: "04:31",
      period: "today",
      footer: "",
      groups: [
        {
          title: "Coding Agents",
          summary: "## ALPHA\n- **Release**: [v1](https://x) does a thing.\n- **Hot issue:** already right.",
          activities: [makeActivity("alpha")],
        },
      ],
    });
    expect(result).toContain("- **Release:** [v1](https://x) does a thing.");
    expect(result).toContain("- **Hot issue:** already right.");
    // The meta line ends with when it was generated, as on every page.
    expect(result).toMatch(/\n> Projects: 1 \| .*Prereleases \(not covered\): 0 \| Generated: 04:31 UTC\n/);
  });
});
