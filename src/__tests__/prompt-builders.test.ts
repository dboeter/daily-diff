import { describe, it, expect } from "vitest";
import {
  AGENTS_HIGHLIGHTS_FOCUS,
  buildPageHighlightsPrompt,
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  announcementLinks,
  hasActivity,
  isMajorRelease,
  releaseNotes,
  type ProjectActivity,
} from "../reports/prompts.ts";
import {
  buildTrendingSummariesPrompt,
  buildTrendsProsePrompt,
  buildTrendsModelsPrompt,
  buildTrendsSummariesPrompt,
  buildModelsSummariesPrompt,
  buildPolicySummariesPrompt,
  buildPolicyProsePrompt,
  buildDataProsePrompt,
  withFallbackHighlights,
  forcedHighlightReports,
  buildHighlightsPrompt,
  firstHighlight,
} from "../reports/prompts-data.ts";
import { TABLES_MARKER, numberRows } from "../reports/summarized-table.ts";
import { SECTIONS, TRENDS_REPORT } from "../core/strings.ts";
import type { RepoConfig, GitHubItem, GitHubRelease } from "../core/github.ts";
import { EMPTY_OPENROUTER, type TrendingData } from "../trending/trending.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const cfg: RepoConfig = { id: "test", repo: "org/test", name: "TestTool" };

function makeItem(overrides: Partial<GitHubItem> = {}): GitHubItem {
  return {
    number: 1,
    title: "Issue",
    state: "open",
    user: { login: "alice" },
    labels: [],
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 5,
    reactions: { "+1": 2 },
    body: "body",
    html_url: "https://github.com/org/test/issues/1",
    ...overrides,
  };
}

const release: GitHubRelease = {
  tag_name: "v1.0.0",
  name: "Release 1.0",
  body: "Release notes",
  published_at: "2026-03-09T00:00:00Z",
  prerelease: false,
};

// ---------------------------------------------------------------------------
// buildProjectDigestPrompt
// ---------------------------------------------------------------------------

function makeActivity(overrides: Partial<ProjectActivity> = {}): ProjectActivity {
  return {
    config: cfg,
    releases: [],
    previews: [],
    prereleaseCount: 0,
    hotIssues: [],
    news: [],
    ...overrides,
  };
}

const scope = { subject: "AI coding agents", window: "last 24h", period: "today" };

describe("hasActivity", () => {
  it("is false for a project with nothing but prereleases", () => {
    expect(hasActivity(makeActivity({ prereleaseCount: 3 }))).toBe(false);
  });

  it("is true for a release, a previewed prerelease, a hot issue or a news item", () => {
    expect(hasActivity(makeActivity({ releases: [release] }))).toBe(true);
    expect(hasActivity(makeActivity({ previews: [{ ...release, prerelease: true }] }))).toBe(true);
    expect(hasActivity(makeActivity({ hotIssues: [makeItem()] }))).toBe(true);
    expect(
      hasActivity(makeActivity({ news: [{ source: "Hacker News", title: "t", url: "u", detail: "d" }] })),
    ).toBe(true);
  });
});

describe("buildProjectDigestPrompt", () => {
  it("includes releases with their tag URL, hot issues and news", () => {
    const prompt = buildProjectDigestPrompt(
      [
        makeActivity({
          releases: [release],
          hotIssues: [makeItem({ title: "Crash on start" })],
          news: [{ source: "Hacker News", title: "TestTool 1.0", url: "https://hn/1", detail: "9 points" }],
        }),
      ],
      scope,
      "2026-10-04",
    );
    expect(prompt).toContain("## TestTool (github.com/org/test)");
    expect(prompt).toContain("https://github.com/org/test/releases/tag/v1.0.0");
    expect(prompt).toContain("Release notes");
    expect(prompt).toContain("Crash on start");
    expect(prompt).toContain("[Hacker News] TestTool 1.0 — https://hn/1 (9 points)");
    expect(prompt).toContain("2026-10-04 (last 24h)");
    expect(prompt).toContain("AI coding agents");
  });

  it("sends no prerelease list for a project that has a stable release", () => {
    const prompt = buildProjectDigestPrompt(
      [makeActivity({ releases: [release], prereleaseCount: 4 })],
      scope,
      "d",
    );
    expect(prompt).not.toContain("### Prereleases");
  });

  it("lists the prereleases of a project without a stable release, with longer, cleaned notes", () => {
    const features = "New plugin manager and Claude Code mods compatibility layer. ".repeat(15);
    const preview: GitHubRelease = {
      tag_name: "dsh-v0.2.0-rc.1",
      name: "dsh-v0.2.0-rc.1",
      body: `[中文](#cn-v0.2.0-rc.1) | [English](#en-v0.2.0-rc.1)\n<h3 id="en-v0.2.0-rc.1">New features</h3>\n${features}`,
      published_at: "2026-09-28T00:00:00Z",
      prerelease: true,
    };
    const prompt = buildProjectDigestPrompt([makeActivity({ previews: [preview] })], scope, "d");
    expect(prompt).toContain("### Prereleases (no stable release yet)");
    expect(prompt).toContain("https://github.com/org/test/releases/tag/dsh-v0.2.0-rc.1");
    expect(prompt).toContain("New features New plugin manager");
    expect(prompt).not.toContain("<h3");
    expect(prompt).not.toContain("(#en-");
    expect(releaseNotes(preview.body, 1500).length).toBeGreaterThan(400);
    expect(prompt).toContain("skip routine alpha/rc bumps");
  });

  it("leaves fenced code blocks (install commands) out of the release notes", () => {
    const body =
      "### Installation\n```bash\nbrew install org/tap/tool\n```\n```bash\n" +
      "x".repeat(400) +
      "\n```\n## What's new\n- Slash commands run safely";
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [{ ...release, body }] })], scope, "d");
    expect(prompt).not.toContain("brew install");
    expect(prompt).toContain("Slash commands run safely");
    expect(releaseNotes("```sh\nnpm i tool\n```", 400)).toBe("");
    expect(releaseNotes("~~~\ngo install tool\n~~~\nFixes", 400)).toBe("Fixes");
  });

  // DuckDB v2.0.0's notes, trimmed (2026-10-21).
  const duckdbBody =
    'This release of DuckDB is named "Cyanoptera" after Spatula Cyanoptera.\r\n\r\n' +
    "Please also refer to the announcement blog post: https://duckdb.org/2026/10/21/announcing-duckdb-200.html\r\n\r\n" +
    "## What's Changed\r\n" +
    "* Make `Identifier` a class instead of using string everywhere by @Mytherin in https://github.com/duckdb/duckdb/pull/23161\r\n" +
    "* Move to tidy-check diff again by @Mytherin in https://github.com/duckdb/duckdb/pull/23196\r\n" +
    "* Allow `MERGE INTO` in triggers by @Dtenwolde in https://github.com/duckdb/duckdb/pull/23201\r\n\r\n" +
    "## New Contributors\r\n* @someone made their first contribution in https://github.com/duckdb/duckdb/pull/23000\r\n\r\n" +
    "**Full Changelog**: https://github.com/duckdb/duckdb/compare/v1.5.0...v2.0.0";

  it("compacts a generated changelog to its PR titles and their count", () => {
    const notes = releaseNotes(duckdbBody, 1000);
    expect(notes).toContain("What's Changed (3 merged PRs): Make `Identifier` a class");
    expect(notes).toContain("Allow `MERGE INTO` in triggers;");
    expect(notes).not.toMatch(/@Mytherin|pull\/23161|first contribution|Full Changelog/);
    expect(releaseNotes("## What's Changed\n- Hand-written note", 400)).toBe(
      "## What's Changed - Hand-written note",
    );
  });

  it("skips badges, images, code, chat and package links, and trims trailing punctuation", () => {
    const body =
      "[![PyPI](https://img.shields.io/pypi/v/x.svg)](https://pypi.org/project/x)\n" +
      "![shot](https://user-images.githubusercontent.com/1/2.png)\n" +
      "```\npip install x --index-url https://download.example.com/whl/release\n```\n" +
      "Join https://discord.gg/abc or read https://docs.example.com/start.\n" +
      "**https://example.com/blog/v2**, and https://example.com/news/x-2-0.";
    expect(announcementLinks(body)).toEqual([
      "https://example.com/blog/v2",
      "https://example.com/news/x-2-0",
    ]);
    expect(announcementLinks("Read <https://example.com/blog/v2> first.")).toEqual([
      "https://example.com/blog/v2",
    ]);
    expect(
      announcementLinks('<a href="https://example.com/news/v2"><img src="https://example.com/post.png"></a>'),
    ).toEqual(["https://example.com/news/v2"]);
  });

  it("counts a changelog without a What's Changed header, or with a curly apostrophe", () => {
    const entry =
      "* Fix a thing by @a in https://github.com/o/r/pull/1\n* Add b by @dependabot[bot] in https://github.com/o/r/pull/2";
    expect(releaseNotes(`Big release.\n${entry}`, 400)).toBe(
      "Big release. What's Changed (2 merged PRs): Fix a thing; Add b;",
    );
    expect(releaseNotes(`## What’s Changed\n${entry}`, 400)).toBe(
      "What's Changed (2 merged PRs): Fix a thing; Add b;",
    );
  });

  it("finds a major release's announcement and shows it in the prompt", () => {
    expect(isMajorRelease("v2.0.0")).toBe(true);
    expect(isMajorRelease("2.0.0")).toBe(true);
    expect(isMajorRelease("v2.0.1")).toBe(false);
    expect(isMajorRelease("v2.1.0")).toBe(false);
    expect(announcementLinks(duckdbBody)).toEqual([
      "https://duckdb.org/2026/10/21/announcing-duckdb-200.html",
    ]);
    expect(announcementLinks("See https://github.com/o/r/pull/1")).toEqual([]);
    const prompt = buildProjectDigestPrompt(
      [
        makeActivity({
          releases: [
            { ...release, tag_name: "v2.0.0", body: duckdbBody, announcement: "Our biggest release." },
          ],
        }),
      ],
      scope,
      "d",
    );
    expect(prompt).toContain("Announcement: Our biggest release.");
    expect(prompt).toContain("describe it from the announcement");
    expect(prompt).toContain(
      "Link each release you name as a plain Markdown link, [tag](url), never inside backticks",
    );
    // The example itself in backticks was copied, links and all, into every release and issue line.
    expect(prompt).not.toContain("`[");
  });

  it("forbids stating absences", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).toContain("Never state what did not happen");
  });

  it("caps the releases shown and notes the total", () => {
    const releases = Array.from({ length: 14 }, (_, i) => ({ ...release, tag_name: `b${100 - i}` }));
    const prompt = buildProjectDigestPrompt([makeActivity({ releases })], scope, "d");
    expect(prompt).toContain("(14 stable releases; showing newest 10)");
    expect(prompt).toContain("b100");
    expect(prompt).not.toContain("b87");
  });

  it("asks for one section per project and no overview", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).not.toContain("Overview");
    expect(prompt).toContain("Write no other sections");
    expect(prompt).toContain("## <Project name>");
    expect(prompt).toContain("today");
  });

  it("lets the model leave out a project whose items it skipped", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).toContain("that has something left to report");
    expect(prompt).toContain("leave out its section entirely");
  });
});

describe("buildPageHighlightsPrompt", () => {
  const prompt = buildPageHighlightsPrompt(
    "AI Agents",
    "## Coding Agents\n\n### Codex\n- Released 1.0.",
    AGENTS_HIGHLIGHTS_FOCUS,
    "2026-10-22",
  );

  it("gives the page name, its rendered body and its focus line", () => {
    expect(prompt).toContain("You are the editor of AI Agents");
    expect(prompt).toContain("### Codex\n- Released 1.0.");
    expect(prompt).toContain("a release with breaking changes, a hot regression");
    expect(prompt).toContain("2026-10-22");
  });

  it("asks for Highlights only: 3–5 bullets, no links, each item once, ~150 words", () => {
    expect(prompt).toContain(`Write only \`## ${SECTIONS.highlights}\`: 3–5 bullets`);
    expect(prompt).toContain("Write no links");
    expect(prompt).toContain("at most one bullet");
    expect(prompt).toContain("About 150 words");
    expect(prompt).not.toContain(SECTIONS.signals);
    expect(prompt).not.toContain("Worth a Look");
    expect(prompt).not.toContain("Overview");
  });
});

// ---------------------------------------------------------------------------
// buildSkillsPrompt
// ---------------------------------------------------------------------------

describe("buildSkillsPrompt", () => {
  it("includes skills repository context", () => {
    const result = buildSkillsPrompt([makeItem()], [makeItem()], "2026-03-09");
    expect(result).toContain("anthropics/skills");
    expect(result).toContain("Claude Code Skills");
  });

  it("shows None when no data", () => {
    const result = buildSkillsPrompt([], [], "2026-03-09");
    expect(result).toContain("Claude Code ecosystem");
    expect(result).toContain("None");
  });
});

// ---------------------------------------------------------------------------
// The Trends page's prompts
// ---------------------------------------------------------------------------

const withModels: TrendingData["openrouter"] = {
  ...EMPTY_OPENROUTER,
  topModels: [{ slug: "deepseek/deepseek-v4.1-flash", tokens: 25_630_000_000_000 }],
  topModelsDate: "2026-10-04",
  fetchSuccess: true,
};

describe("buildTrendingSummariesPrompt", () => {
  const rows = [
    {
      n: 1,
      name: "nano-coder",
      description: "A 6MB coding agent",
      facts: "Source: npm | New: created or listed in the last 14 days",
    },
    { n: 2, name: "org/repo", description: "", facts: "" },
  ];

  it("lists each row with its number, description and facts", () => {
    const result = buildTrendingSummariesPrompt(rows, "2026-10-05");
    expect(result).toContain("1. nano-coder — A 6MB coding agent — Source: npm | New: created or listed");
    expect(result).toContain("2. org/repo — (no description)\n");
  });

  it("forbids the figures the table already shows", () => {
    expect(buildTrendingSummariesPrompt(rows, "2026-10-05")).toContain(
      "No star, gain, download, token or rank figures",
    );
  });

  it("asks for one `N: <2 sentences>` line per row and nothing else", () => {
    const result = buildTrendingSummariesPrompt(rows, "2026-10-05");
    expect(result).toContain("`N: <2 sentences>`");
    expect(result).toContain("2 lines in total");
    expect(result).toContain("No other text");
    expect(result).toContain("Do not invent");
  });

  it("asks for `N: —` for a row without a description, not a sentence from its name", () => {
    expect(buildTrendingSummariesPrompt(rows, "2026-10-05")).toContain(
      "If the description is empty, write `N: —`",
    );
  });
});

describe("buildTrendsProsePrompt", () => {
  it("includes the page, the marker instruction, Highlights and Signals in order, and no Worth a Look", () => {
    const result = buildTrendsProsePrompt("## Research\n\n| Paper |\n| :--- |", "2026-10-26");
    expect(result).toContain("| Paper |");
    expect(result).toContain(`\`${TABLES_MARKER}\` exactly once`);
    const order = [SECTIONS.highlights, TABLES_MARKER, SECTIONS.signals].map((s) => result.indexOf(s));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(result).toContain("the one place for trend claims");
    expect(result).not.toContain("Worth a Look");
    expect(result).toContain("Do not reproduce or alter the tables");
  });
});

describe("buildTrendsSummariesPrompt", () => {
  const paper = {
    n: 1,
    id: "2610.00001",
    title: "Agents that plan",
    url: "https://arxiv.org/abs/2610.00001",
    published: "2026-10-20T00:00:00Z",
    relevance: 0.9,
    abstract: "We show planning helps.",
    date: "2026-10-21",
  };
  const story = {
    n: 2,
    id: "lobsters:abc",
    source: "lobsters" as const,
    title: "On AI writing",
    url: "https://example.com/essay",
    discussionUrl: "https://lobste.rs/s/abc",
    points: 40,
    comments: 60,
  };

  it("numbers the papers with their abstracts, then the stories on Spotted's rules", () => {
    const result = buildTrendsSummariesPrompt([paper], [story], "2026-10-26");
    expect(result).toContain("1. Agents that plan (arXiv paper) — abstract: We show planning helps.");
    expect(result).toContain(
      "2. On AI writing (Lobste.rs, example.com, 40 points, 60 comments) — (no description)",
    );
    expect(result).toContain("A paper: 2 sentences from its abstract: what it shows.");
    expect(result).toContain("Describe no comment thread");
    expect(result).toContain("2 lines in total");
  });
});

describe("buildTrendsModelsPrompt", () => {
  it("asks for only the ### parts whose source has data, and no Highlights, Signals or Worth a Look", () => {
    const both = buildTrendsModelsPrompt({ models: [], fetchSuccess: true }, withModels, "2026-10-26");
    expect(both).toContain(`\`### ${TRENDS_REPORT.openRouterHeading}\``);
    expect(both).toContain(`\`### ${TRENDS_REPORT.hfHeading}\``);
    expect(both).toContain("deepseek/deepseek-v4.1-flash — 25.63T tokens");
    expect(both).toContain("No Highlights, Signals or other sections");
    expect(both).not.toContain("## Highlights");
    expect(both).not.toContain("Worth a Look");
    const hfOnly = buildTrendsModelsPrompt(
      { models: [], fetchSuccess: true },
      EMPTY_OPENROUTER,
      "2026-10-26",
    );
    expect(hfOnly).not.toContain(TRENDS_REPORT.openRouterHeading);
    const orOnly = buildTrendsModelsPrompt({ models: [], fetchSuccess: false }, withModels, "2026-10-26");
    expect(orOnly).not.toContain(TRENDS_REPORT.hfHeading);
  });
});

describe("buildPolicySummariesPrompt", () => {
  const items = [
    {
      id: "1",
      title: "AI Act guidelines",
      link: "https://example.eu/a",
      published: "2026-10-09T07:16:00.000Z",
      description: "The AI Office publishes guidelines.",
      source: "European Commission",
      jurisdiction: "eu" as const,
      jevOnly: false,
    },
  ];

  it("numbers the items with their source and text, and asks for one `N:` line each", () => {
    const result = buildPolicySummariesPrompt(numberRows(items), "2026-10-14", "A Dutch AI practitioner.");
    expect(result).toContain(
      "1. AI Act guidelines (European Commission, 2026-10-09) — The AI Office publishes guidelines.",
    );
    expect(result).toContain("`N: <2 sentences>`");
    expect(result).toContain("1 lines in total");
    expect(result).toContain("Do not invent");
    expect(result).toContain("The reader: A Dutch AI practitioner.");
  });
});

describe("buildPolicyProsePrompt", () => {
  it("includes the table and asks for Highlights only: no Signals or Worth a Look", () => {
    const result = buildPolicyProsePrompt("| Date |\n| :--- |", "2026-10-14", "A Dutch AI practitioner.");
    expect(result).toContain("| Date |");
    expect(result).toContain(`Write only \`## ${SECTIONS.highlights}\``);
    expect(result).not.toContain(TABLES_MARKER);
    expect(result).not.toContain(SECTIONS.signals);
    expect(result).not.toContain("Worth a Look");
    expect(result).toContain("Do not reproduce or alter the table");
    expect(result).toContain("Do not write a title");
    expect(result).toContain("The reader: A Dutch AI practitioner.");
    expect(result).not.toContain("Open deadlines");
    expect(result).toContain("Base every claim on the table. Do not invent");
  });

  it("lists near deadlines as earlier items, not new ones", () => {
    const result = buildPolicyProsePrompt("| Date |", "2026-10-22", "A reader.", [
      { date: "2026-10-27", title: "Consultation X", link: "https://x", source: "Have your say" },
    ]);
    expect(result).toContain("Open deadlines of items reported on earlier days (not new today");
    expect(result).toContain("- 2026-10-27: [Consultation X](https://x) (Have your say)");
    expect(result).toContain("in the table or the open deadlines");
    expect(result).toContain("Base every claim on the table or the open deadlines.");
  });
});

describe("buildModelsSummariesPrompt", () => {
  const post = (site: "anthropic" | "openai", content: string) => ({
    url: `https://${site}.com/news/p`,
    title: "P",
    lastmod: "2026-10-22",
    content,
    site,
    category: "news",
  });
  const prompt = buildModelsSummariesPrompt(
    numberRows([post("anthropic", "Page body."), post("openai", "")]),
    [
      {
        n: 3,
        id: "x/m",
        name: "M",
        description: "A coding model.",
        created: "2026-10-22",
        contextLength: 262144,
      },
    ],
    "2026-10-22",
  );

  it("numbers the posts, then the models, and gives each its own rule", () => {
    expect(prompt).toContain("1. P (Anthropic post, https://anthropic.com/news/p) — page text: Page body.");
    expect(prompt).toContain("2. P (OpenAI post, https://openai.com/news/p) — (no page text)");
    expect(prompt).toContain("3. M (OpenRouter model `x/m`) — catalog description: A coding model.");
    expect(prompt).not.toContain("262144");
    expect(prompt).toContain("`N: —`, unless its title says more than its URL");
    expect(prompt).toContain("its marketing claims");
    expect(prompt).toContain("3 lines in total");
  });
});

describe("buildDataProsePrompt", () => {
  const prompt = buildDataProsePrompt("## Databricks\n\n(table)", "2026-10-19");

  it("asks Highlights for who is affected, what to do and by when, not a restated row", () => {
    expect(prompt).toContain("who is affected");
    expect(prompt).toContain("what to do");
    expect(prompt).toContain("by when");
    expect(prompt).toContain("Never restate a row");
    expect(prompt).toContain("describe the same change");
  });

  it("asks for Across platforms: two platforms per bullet, from the rows, none when nothing qualifies", () => {
    expect(prompt).toContain("## Across platforms");
    expect(prompt).toContain("two or more platforms");
    expect(prompt).toContain("how they differ");
    expect(prompt).toContain("Leave this heading out");
    expect(prompt.indexOf("<!-- tables -->")).toBeLessThan(prompt.indexOf("`## Across platforms`"));
  });

  it("makes a major release a Highlights candidate", () => {
    expect(prompt).toContain("Releases this week");
    expect(prompt).toContain("x.0.0");
    expect(prompt).toContain("breaking changes");
  });

  it("asks for no section beyond Highlights and Across platforms", () => {
    expect(prompt).not.toContain("Data × AI");
    expect(prompt).not.toContain("Worth a Look");
    expect(prompt).not.toContain("Signals");
    expect(prompt).toContain("Write only these parts");
    expect(prompt).toContain("Write no links, URLs or other sections");
  });
});

describe("withFallbackHighlights", () => {
  const POLICY =
    "## Highlights\nThe Commission published the first [harmonised standard](https://x.eu) for the AI Act. Consultations close in November.\n\n<!-- tables -->";

  it("fills a published policy or data report the model left out with its first Highlights sentence", () => {
    const out = withFallbackHighlights({ "ai-agents": ["H."] }, { "ai-agents": "x", "ai-policy": POLICY }, [
      "ai-policy",
    ]);
    expect(out).toEqual({
      "ai-agents": ["H."],
      "ai-policy": ["The Commission published the first harmonised standard for the AI Act."],
    });
  });

  it("keeps the model's highlights, and adds none for other or absent reports", () => {
    const out = withFallbackHighlights(
      { "ai-policy": ["Mine."] },
      { "ai-policy": POLICY, "ai-models": POLICY },
      ["ai-policy"],
    );
    expect(out).toEqual({ "ai-policy": ["Mine."] });
  });

  it("reads a bullet, skips a failure notice and cuts a long sentence at a word", () => {
    expect(firstHighlight("## Highlights\n\n- **Snowflake** retires X. More.")).toBe("Snowflake retires X.");
    expect(firstHighlight("## Highlights\n\n⚠️ Summary generation failed.")).toBeNull();
    expect(firstHighlight("## Signals\nNo highlights here.")).toBeNull();
    const long = firstHighlight(`## Highlights\n${"word ".repeat(60)}end.`)!;
    expect(long.length).toBeLessThanOrEqual(140);
    expect(long.endsWith("word…")).toBe(true);
  });

  it("saves a going-away highlight with the minus sign, however the model wrote it", () => {
    const out = withFallbackHighlights(
      { "ai-data": ["- Snowflake retires X", "– Fabric ends Y", "DuckDB 2.0 ships", "-dash inside"] },
      { "ai-policy": "## Highlights\n\n- − **EUR-Lex** drops a form. More." },
      ["ai-policy"],
    );
    expect(out).toEqual({
      "ai-data": ["− Snowflake retires X", "− Fabric ends Y", "DuckDB 2.0 ships", "-dash inside"],
      "ai-policy": ["− EUR-Lex drops a form."],
    });
  });

  it("forces ai-data only on a day with kept vendor items", () => {
    expect(forcedHighlightReports(false)).toEqual(["ai-policy"]);
    expect(forcedHighlightReports(true)).toEqual(["ai-policy", "ai-data"]);
    const reports = { "ai-data": "## Highlights\n- dbt Core 1.11 ships." };
    expect(withFallbackHighlights({}, reports, forcedHighlightReports(false))).toEqual({});
    expect(withFallbackHighlights({}, reports, forcedHighlightReports(true))).toEqual({
      "ai-data": ["dbt Core 1.11 ships."],
    });
  });

  it("asks the model for a forced report's highlight only when forced", () => {
    expect(buildHighlightsPrompt({}, ["ai-policy"])).toContain("give that report at least 1 highlight");
    expect(buildHighlightsPrompt({}, forcedHighlightReports(true))).toContain(
      "vendor release-note row in ai-data",
    );
    expect(buildHighlightsPrompt({})).not.toContain("at least 1 highlight");
  });

  it("does not end the sentence at an abbreviation", () => {
    expect(firstHighlight("## Highlights\nThe U.S. Senate passed the bill. More.")).toBe(
      "The U.S. Senate passed the bill.",
    );
    expect(firstHighlight("## Highlights\nThe consultation closes Nov. 9 for comments. More.")).toBe(
      "The consultation closes Nov. 9 for comments.",
    );
    expect(
      firstHighlight("## Highlights\n- See [Art. 50 guidance](https://x.eu) e.g. for providers. More."),
    ).toBe("See Art. 50 guidance e.g. for providers.");
  });

  it("handles numbered bullets, sub-headings, wrapped lines, ⚠️ markers and italics", () => {
    expect(firstHighlight("## Highlights\n1. Snowflake retires X. More.")).toBe("Snowflake retires X.");
    expect(firstHighlight("## Highlights\n### Sub\n- A.")).toBeNull();
    expect(firstHighlight("## Highlights\nThe Commission published\na standard. More.\n\nNext.")).toBe(
      "The Commission published a standard.",
    );
    expect(firstHighlight("## Highlights\n- ⚠️ **Snowflake** retires X.\n- B.")).toBe("Snowflake retires X.");
    expect(firstHighlight("## Highlights\n- *Delta Lake* 4.0 adds `variant` type.")).toBe(
      "Delta Lake 4.0 adds variant type.",
    );
  });
});
