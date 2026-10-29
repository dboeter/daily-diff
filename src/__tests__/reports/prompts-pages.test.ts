import { describe, expect, it } from "vitest";
import { NO_HIGHLIGHT_NOTE, SECTIONS, TRENDS_REPORT } from "../../core/strings.ts";
import type { ReleaseRow } from "../../reports/pages.ts";
import {
  buildDataProsePrompt,
  buildDataSummariesPrompt,
  buildHighlightsPrompt,
  highlightsSection,
  buildModelsSummariesPrompt,
  labPostsNoHighlightNote,
  buildPolicyProsePrompt,
  buildPolicySummariesPrompt,
  buildSpottedSummariesPrompt,
  buildTrendingSummariesPrompt,
  buildHfSummariesPrompt,
  buildTrendsProsePrompt,
  buildTrendsSummariesPrompt,
  firstHighlight,
  forcedHighlightReports,
  withFallbackHighlights,
  restatesLead,
  dropNoHighlightRows,
} from "../../reports/prompts-pages.ts";
import { TABLES_MARKER, numberRows, parseRowSummaries } from "../../reports/summarized-table.ts";
import {
  AGENTS_HIGHLIGHTS_FOCUS,
  buildPageHighlightsPrompt,
  goingAwayRule,
  IDENTIFIER_RULE,
  RELEASE_ORDER,
  SOURCE_FIDELITY_RULES,
} from "../../reports/prompts.ts";
import type { Story, StorySource } from "../../spotted/pool.ts";

// ---------------------------------------------------------------------------
// The Trends page's prompts
// ---------------------------------------------------------------------------

const DATE = "2026-10-22";

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

  it("asks for one `N: <1-2 sentences>` line per row and nothing else", () => {
    const result = buildTrendingSummariesPrompt(rows, "2026-10-05");
    expect(result).toContain("`N: <1-2 sentences>`");
    expect(result).toContain('No "It matters because"');
    expect(result).toContain(IDENTIFIER_RULE);
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

  it("numbers the papers with their abstracts; Most discussed stories go through the Spotted call", () => {
    const result = buildTrendsSummariesPrompt([paper], "2026-10-26");
    expect(result).toContain("1. Agents that plan (arXiv paper) — abstract: We show planning helps.");
    expect(result).toContain("Start with the paper's name");
    expect(result).toContain("then its headline result, with the number when the abstract gives one");
    expect(result).toContain("1 lines in total");
    expect(result).not.toContain("community stories");
    expect(buildSpottedSummariesPrompt([story], "2026-10-26")).toContain(
      "2. On AI writing (Lobste.rs, example.com, 40 points, 60 comments) — (no description)",
    );
  });
});

describe("buildHfSummariesPrompt", () => {
  it("asks for one summary per numbered release from task, size and license, never the model_type tag", () => {
    const row = {
      id: "Qwen/Qwen3.8-27B",
      url: "https://huggingface.co/Qwen/Qwen3.8-27B",
      author: "Qwen",
      pipelineTag: "image-text-to-text",
      parameters: 27.4e9,
      likes: 18406,
      downloads: 7762014,
      tags: ["qwen3_5", "transformers", "license:apache-2.0"],
      lastModified: "",
      variants: [],
      n: 1,
    };
    const p = buildHfSummariesPrompt([row], "2026-10-26");
    expect(p).toContain(
      "1. Qwen/Qwen3.8-27B | task: image-text-to-text | parameters: 27B | license: apache-2.0",
    );
    expect(buildHfSummariesPrompt([{ ...row, parameters: 27.78e9 }], "2026-10-26")).toContain(
      "parameters: 27B |",
    );
    expect(p).toContain("from its task, size, license and name only");
    expect(p).toContain("You have no model card");
    expect(p).toMatch(/no quality or speed word \("high-quality", "sophisticated", "efficient"/);
    expect(p).not.toContain("qwen3_5");
    expect(p).toContain("`N: <one sentence>`");
    expect(p).toContain("1 lines in total");
    expect(p).not.toContain(TRENDS_REPORT.hfHeading);
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
    expect(result).toContain("`N: <1-2 sentences>`");
    expect(result).toContain("Add a second sentence only when the text states what the item means");
    expect(result).toContain("Never write about the text itself");
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
    expect(prompt).toContain("A post without page text: write `N: —`.");
    expect(prompt).toContain("its marketing claims");
    expect(prompt).toContain("3 lines in total");
  });
});

describe("labPostsNoHighlightNote", () => {
  it("names each post without page text as no Highlight, and is undefined without one", () => {
    expect(labPostsNoHighlightNote(["Oracle Apps In Chatgpt", "Gpt 6 1 Terra"])).toBe(
      'These lab posts have no page text, only a title: no Highlight for them. "Oracle Apps In Chatgpt", "Gpt 6 1 Terra"',
    );
    expect(labPostsNoHighlightNote([])).toBeUndefined();
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

  it("keeps the going-away sign of a page's signed lead on the report's first highlight", () => {
    const data = "## Highlights\n\n- − **Polars** py-2.1.0 disallows mixed arithmetic. More.\n- Other.";
    const out = withFallbackHighlights(
      {
        "ai-data": ["Polars py-2.1.0 breaks mixed arithmetic", "Snowflake ships X"],
        "ai-models": ["− Y ends", "Z"],
      },
      {
        "ai-data": data,
        "ai-models": "## Highlights\n\n- − Y ends.",
        "ai-agents": "## Highlights\n\n- A ships.",
      },
      [],
    );
    expect(out["ai-data"]).toEqual(["− Polars py-2.1.0 breaks mixed arithmetic", "Snowflake ships X"]);
    expect(out["ai-models"]).toEqual(["− Y ends", "Z"]);
    expect(
      withFallbackHighlights(
        { "ai-agents": ["A ships"] },
        { "ai-agents": "## Highlights\n\n- A ships." },
        [],
      ),
    ).toEqual({ "ai-agents": ["A ships"] });
  });

  it("signs only the highlight that restates a signed lead, and none when none does", () => {
    const data = "## Highlights\n\n- − **Polars** py-2.1.0 disallows mixed arithmetic. More.";
    const sign = (items: string[]) =>
      withFallbackHighlights({ "ai-data": items }, { "ai-data": data }, [])["ai-data"];
    expect(sign(["Snowflake ships dynamic tables", "Polars py-2.1.0 disallows mixed arithmetic"])).toEqual([
      "Snowflake ships dynamic tables",
      "− Polars py-2.1.0 disallows mixed arithmetic",
    ]);
    expect(sign(["Snowflake ships dynamic tables", "dbt Core 1.11 ships"])).toEqual([
      "Snowflake ships dynamic tables",
      "dbt Core 1.11 ships",
    ]);
    expect(sign(["− Polars drops mixed arithmetic", "Polars mixed arithmetic"])).toEqual([
      "− Polars drops mixed arithmetic",
      "Polars mixed arithmetic",
    ]);
    expect(restatesLead("Snowflake ships X", "− Polars py-2.1.0 disallows mixed arithmetic.")).toBe(false);
  });

  it("matches a lead's possessive and hyphenated words to their bare forms", () => {
    expect(
      restatesLead("OpenAI open source Codex agent", "OpenAI's open-source Codex agent ships today"),
    ).toBe(true);
  });

  it("sends a report whose Highlights failed as its page, so a forced report can still get one", () => {
    const page =
      "## Highlights\n\n⚠️ Summary generation failed.\n\n## Databricks\n\n| Item | Summary |\n| --- | --- |\n| [Lakebase GA](https://x) | Lakebase is generally available. |";
    const prompt = buildHighlightsPrompt({ "ai-data": page }, ["ai-data"]);
    const section = prompt.slice(prompt.indexOf("## [ai-data]"));
    expect(section).toContain("Lakebase is generally available.");
    expect(section).not.toContain("Summary generation failed");
    expect(
      buildHighlightsPrompt({ "ai-data": "## Highlights\n\n- A ships.\n\n## Databricks\n\n| row |" }),
    ).not.toContain("| row |");
  });

  it("forces ai-data only on a day with kept vendor items", () => {
    expect(forcedHighlightReports(false)).toEqual(["ai-policy", "ai-trends"]);
    expect(forcedHighlightReports(true)).toEqual(["ai-policy", "ai-data", "ai-trends"]);
    const reports = { "ai-data": "## Highlights\n- dbt Core 1.11 ships." };
    expect(withFallbackHighlights({}, reports, forcedHighlightReports(false))).toEqual({});
    expect(withFallbackHighlights({}, reports, forcedHighlightReports(true))).toEqual({
      "ai-data": ["dbt Core 1.11 ships."],
    });
  });

  it("asks the model for a forced report's highlight only when forced and published", () => {
    const policy = { "ai-policy": "## Highlights\n- The AI Act's standard is in the OJ." };
    expect(buildHighlightsPrompt(policy, ["ai-policy"])).toContain("give that report at least 1 highlight");
    expect(
      buildHighlightsPrompt(
        { ...policy, "ai-data": "## Highlights\n- A ships." },
        forcedHighlightReports(true),
      ),
    ).toContain("vendor release-note row in ai-data");
    expect(buildHighlightsPrompt(policy)).not.toContain("at least 1 highlight");
    expect(buildHighlightsPrompt({}, ["ai-policy"])).not.toContain("at least 1 highlight");
  });

  it("does not mention ai-trends on a daily run", () => {
    const daily = {
      "ai-agents": "## Highlights\n- Codex ships hooks.",
      "ai-policy": "## Highlights\n- The AI Act's standard is in the OJ.",
    };
    const prompt = buildHighlightsPrompt(daily, forcedHighlightReports(false));
    expect(prompt).toContain("Every item in ai-policy was already judged relevant");
    expect(prompt).not.toContain("ai-trends");
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

describe("highlights.json for Trends", () => {
  const TRENDS =
    "## Highlights\n\n- **DeepSeek V4.1 Flash** leads OpenRouter with **35.37T tokens** on 2026-10-27. More.\n- **owner/repo** gains **+16,593 stars** in 7 days.\n\n## Models";
  const LEAD = "DeepSeek V4.1 Flash leads OpenRouter with 35.37T tokens on 2026-10-27.";
  const forced = forcedHighlightReports(false);

  it("gives a figure-led Trends page an entry restating its first bullet when the model left it out", () => {
    expect(
      withFallbackHighlights({ "ai-agents": ["A."] }, { "ai-agents": "x", "ai-trends": TRENDS }, forced),
    ).toEqual({ "ai-agents": ["A."], "ai-trends": [LEAD] });
  });

  it("puts the lead first: moves the model's restatement, else adds the lead in front", () => {
    const run = (items: string[]) =>
      withFallbackHighlights({ "ai-trends": items }, { "ai-trends": TRENDS }, forced)["ai-trends"];
    expect(
      run(["owner/repo gains 16,593 stars", "DeepSeek V4.1 Flash leads OpenRouter at 35.37T tokens"]),
    ).toEqual(["DeepSeek V4.1 Flash leads OpenRouter at 35.37T tokens", "owner/repo gains 16,593 stars"]);
    expect(run(["owner/repo gains 16,593 stars", "Other thing"])).toEqual([
      LEAD,
      "owner/repo gains 16,593 stars",
    ]);
    expect(run(["DeepSeek V4.1 Flash leads OpenRouter"])).toEqual(["DeepSeek V4.1 Flash leads OpenRouter"]);
  });

  it("adds nothing for an unpublished Trends page or one whose Highlights code dropped", () => {
    expect(withFallbackHighlights({}, {}, forced)).toEqual({});
    expect(
      withFallbackHighlights({}, { "ai-trends": `## Highlights\n\n- ${NO_HIGHLIGHT_NOTE}` }, forced),
    ).toEqual({});
  });

  it("lets the prompt restate Trends figures with their window, and keeps raw counts banned elsewhere", () => {
    const withTrends = buildHighlightsPrompt({ "ai-trends": TRENDS }, forced);
    expect(withTrends).toContain("except in ai-trends: restate a figure");
    expect(withTrends).toContain("the weekly ai-trends page");
    const daily = buildHighlightsPrompt({ "ai-agents": "## Highlights\n\n- A ships." }, forced);
    expect(daily).toContain("Raw counts: commits, issues, PRs, open items, stars, comments, points\n");
    expect(daily).not.toContain("except in ai-trends");
  });
});

describe("buildSpottedSummariesPrompt", () => {
  it("lists every row by its number, with its site and description, on the summaries contract", () => {
    const rows = numberRows([
      { ...story("1"), description: "The page says this.", page: "agents" as const },
      { ...story("2", "lobsters"), url: "https://www.blog.dev/post", page: "data" as const },
    ]);
    const prompt = buildSpottedSummariesPrompt(rows, DATE);
    expect(prompt).toContain(
      "1. Story 1 (Hacker News, example.com, 10 points, 3 comments) — description: The page says this.",
    );
    expect(prompt).toContain("2. Story 2 (Lobste.rs, blog.dev, 10 points, 3 comments) — (no description)");
    expect(prompt).toContain("`N: <1-2 sentences>`");
    expect(prompt).toContain("2 lines in total");
    expect(prompt).toMatch(/Describe no comment thread/);
    expect(prompt).toContain("Without one: write `N: —`");
    expect(parseRowSummaries("1: One.\n2: —").get(2)).toBe("—");
  });
});

// ---------------------------------------------------------------------------
// Source fidelity: every Highlights, Signals and highlights.json prompt
// ---------------------------------------------------------------------------

describe("source fidelity rules", () => {
  const prompts = {
    page: buildPageHighlightsPrompt("AI Agents", "## Agents", AGENTS_HIGHLIGHTS_FOCUS, "2026-10-26"),
    trends: buildTrendsProsePrompt("## Research", "2026-10-26"),
    policy: buildPolicyProsePrompt("| Date |", "2026-10-26", "A reader."),
    data: buildDataProsePrompt("## Snowflake", "2026-10-26"),
    highlights: buildHighlightsPrompt({ "ai-data": "## Highlights" }),
  };

  it.each(Object.entries(prompts))("the %s prompt carries every rule", (_, prompt) => {
    for (const rule of SOURCE_FIDELITY_RULES) expect(prompt).toContain(rule);
  });

  it("stage words, calls to action, attribution, study scope and trends are each covered", () => {
    const rules = SOURCE_FIDELITY_RULES.join(" ");
    expect(rules).toMatch(/GA, generally available, preview, beta/);
    expect(rules).toMatch(/No call to action/);
    expect(rules).toMatch(/X says/);
    expect(rules).toMatch(/sample size, a single run, not peer reviewed/);
    expect(rules).toMatch(/Several items on one theme in the same period are not a trend/);
    expect(rules).toMatch(/never titles, descriptions or co-occurrence alone/);
  });

  it("the data Highlights ask for an action only when the row gives or requires one", () => {
    expect(prompts.data).toContain("what to do when the row says or its change requires it");
  });

  // 2026-10-27 forced weekly run: "DeepSeek's model family dominates", "half the OpenRouter top 20"
  // with MiniMax (a Hugging Face row only), and "harnesses are converging" from shared descriptions.
  it("each Signal rests on a fact and its rows' figures, with no unsupported trend verb", () => {
    expect(prompts.trends).toContain(
      "links the rows that fact names; every other name and figure in it appears in those rows",
    );
    expect(prompts.trends).toContain("never on what their summaries, descriptions or titles have in common");
    expect(prompts.trends).toContain(
      "uses no trend verb the figures cannot show (dominates, is accelerating, is converging)",
    );
    expect(prompts.trends).toContain("The Research table has no figures, so it gives no Signal.");
    expect(prompts.trends).not.toContain("which model families lead usage");
  });

  it("usage claims keep the table's window, in Highlights too", () => {
    expect(prompts.trends).toContain(
      'in Highlights too: OpenRouter usage is one day\'s snapshot, so say "on <its date>", never "this week"',
    );
  });
});

describe("goingAwayRule", () => {
  it.each(["bullet", "highlight"] as const)(
    "keeps bug fixes and breaking changes out of the %s sign",
    (item) => {
      expect(goingAwayRule(item)).toContain(
        "a bug fix, a breaking change or a call that now raises an error is not going away",
      );
    },
  );
});

describe("Highlights pick, they don't restate", () => {
  it("the data Highlights skip minor vendor rows and hold 1-3 bullets", () => {
    const p = buildDataProsePrompt("## Snowflake", "2026-10-26", ["Oct 26, 2026: Custom error messages"]);
    expect(p).toContain("1-3 bullets");
    expect(p).toContain('These rows are minor: no Highlight for them. "Oct 26, 2026: Custom error messages"');
    expect(buildDataProsePrompt("## Snowflake", "2026-10-26")).not.toContain("These rows are minor");
  });

  it("Trends Highlights hold 1-3 ranked bullets, one subject each, with their window", () => {
    const p = buildTrendsProsePrompt("## Research", "2026-10-26");
    expect(p).toContain("1-3 bullets on the most noteworthy items of the week for a data or AI engineer");
    expect(p).toContain("One subject per bullet");
  });

  it("highlights.json leads each report with its page's first bullet", () => {
    const p = buildHighlightsPrompt({ "ai-data": "## Highlights\n\n- lead" });
    expect(p).toContain("A report's first highlight covers the first bullet of its `## Highlights`");
    expect(p).toContain("one subject per highlight");
  });

  it("highlights.json sees each page's Highlights only, never a table row below them", () => {
    const data =
      "# Data\n\n## Highlights\n\n- − **Polars** py-2.1.0 disallows mixed arithmetic.\n\n---\n\n## Snowflake\n\n| 1 | Coding agent MCP tool | minor note |";
    const policy =
      "## Highlights\n\nThe Commission published a standard.\n\n<!-- tables -->\n\n## EU\n\n| Draft guidance row |";
    const p = buildHighlightsPrompt({ "ai-data": data, "ai-policy": policy });
    expect(p).toContain("- − **Polars** py-2.1.0 disallows mixed arithmetic.");
    expect(p).toContain("The Commission published a standard.");
    expect(p).not.toContain("Coding agent MCP tool");
    expect(p).not.toContain("Draft guidance row");
    expect(highlightsSection(data)).toBe(
      "## Highlights\n\n- − **Polars** py-2.1.0 disallows mixed arithmetic.",
    );
    expect(highlightsSection("## Agents\n\n- x")).toBeNull();
  });

  it("highlights.json asks for no consequence the Highlights do not state", () => {
    const p = buildHighlightsPrompt({ "ai-agents": "## Highlights\n\n- A ships." });
    expect(p).not.toMatch(/why it matters/i);
    expect(p).toContain("add no consequence, audience or benefit it does not state");
  });
});

describe("summaries lead with impact", () => {
  it("the data summaries order release changes by impact and copy identifiers", () => {
    const release = {
      key: "release:pola-rs/polars@py-2.1.0",
      project: { name: "Polars", repo: "pola-rs/polars" },
      release: { tag_name: "py-2.1.0", name: "", body: "notes", published_at: "2026-10-25T00:00:00Z" },
    } as unknown as ReleaseRow;
    const p = buildDataSummariesPrompt([], "2026-10-26", numberRows([release]));
    expect(p).toContain(RELEASE_ORDER);
    expect(p).toContain(IDENTIFIER_RULE);
  });
});

describe("story summaries are written, not copied", () => {
  it("Spotted and Most discussed both ask for own words and one concrete fact", () => {
    const row = {
      n: 1,
      id: "hn:1",
      source: "hn" as const,
      title: "T",
      url: "https://x.com",
      discussionUrl: "d",
      points: 1,
      comments: 1,
      description: "D.",
    };
    const p = buildSpottedSummariesPrompt([row], "2026-10-26");
    expect(p).toContain("in your own words, what it is about, with one concrete fact");
    expect(p).toContain("Never copy the description");
  });
});

describe("buildTrendsProsePrompt", () => {
  it("names the rows without summary or description as no Highlight, like the data report's minor rows", () => {
    expect(buildTrendsProsePrompt("page", "2026-10-26", ["Strix", "o/x"])).toContain(
      '- These rows have no summary or description: no Highlight for them. "Strix", "o/x"',
    );
    expect(buildTrendsProsePrompt("page", "2026-10-26")).not.toContain("no Highlight for them");
  });

  it("carries the facts block and takes every comparison from it", () => {
    const p = buildTrendsProsePrompt(
      "page",
      "2026-10-26",
      [],
      "- Agent Tooling: largest absolute gain: [a/b](u).",
    );
    expect(p).toContain("Facts computed in code from the tables above");
    expect(p).toContain("- Agent Tooling: largest absolute gain: [a/b](u).");
    expect(p).toContain('Comparisons ("largest", "most"');
    expect(p).toContain("come only from the facts block, quoted as given");
    expect(p).toContain("opens with one fact from the facts block");
    expect(buildTrendsProsePrompt("page", "2026-10-26")).not.toContain("Facts computed in code");
  });
});

describe("dropNoHighlightRows", () => {
  // The 2026-10-26 data page's minor row (D5) and Strix, the Trends Radar row showing "—".
  const minor = {
    name: "Custom error messages for feature policy rules",
    url: "https://docs.snowflake.com/d5",
  };
  const strix = { name: "Strix", url: "https://strix.ai" };
  const polars = "- Polars py-2.1.0 disallows mixed arithmetic.";

  it("drops a bullet linking, naming or restating a no-Highlight row, and keeps the rest", () => {
    for (const bullet of [
      "- Snowflake [adds a setting](https://docs.snowflake.com/d5) for policies.",
      "- strix tests web apps for vulnerabilities.",
      "- Snowflake policy rules now take custom error messages.",
    ]) {
      const prose = `## Highlights\n\n${polars}\n${bullet}\n  continued.\n${TABLES_MARKER}\n- Strix in a Signal.`;
      expect(dropNoHighlightRows(prose, [minor, strix], "test")).toBe(
        `## Highlights\n\n${polars}\n${TABLES_MARKER}\n- Strix in a Signal.`,
      );
    }
  });

  it("matches GitHub and Hugging Face names as written", () => {
    const rows = [
      { name: "deepseek-ai/deepseek-harness", url: "" },
      { name: "Qwen/Qwen3.6-35B-A3B", url: "" },
    ];
    const prose = `## Highlights\n\n${polars}\n- deepseek-ai/deepseek-harness gained 900 stars.\n- Qwen/Qwen3.6-35B-A3B tops likes.`;
    expect(dropNoHighlightRows(prose, rows, "test")).toBe(`## Highlights\n\n${polars}`);
  });

  it("drops a bullet restating a name of three content words", () => {
    const prose = `## Highlights\n\n${polars}\n- Snowflake adds new API support.`;
    expect(dropNoHighlightRows(prose, [{ name: "Support for the new API", url: "" }], "test")).toBe(
      `## Highlights\n\n${polars}`,
    );
  });

  it("keeps a bullet that only shares a word with a short name", () => {
    const prose = `## Highlights\n\n- Kilo ships a new CLI.\n- Strixhaven chips arrive.`;
    expect(dropNoHighlightRows(prose, [{ name: "Kilo Code", url: "" }, strix], "test")).toBe(prose);
  });

  it("leaves NO_HIGHLIGHT_NOTE when every bullet goes, which highlights.json does not restate", () => {
    const page = dropNoHighlightRows("## Highlights\n\n- Strix is up 40%.", [strix], "test");
    expect(page).toBe(`## Highlights\n\n- ${NO_HIGHLIGHT_NOTE}`);
    expect(withFallbackHighlights({}, { "ai-data": page }, ["ai-data"])).toEqual({});
  });
});
