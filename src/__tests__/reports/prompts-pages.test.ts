import { describe, expect, it, vi } from "vitest";
import { MSG, NO_HIGHLIGHT_NOTE, SECTIONS, SECURITY, TRENDS_REPORT } from "../../core/strings.ts";
import type { ReleaseRow } from "../../reports/pages.ts";
import {
  buildDataProsePrompt,
  buildDataSummariesPrompt,
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
  ledeHighlight,
  pageHighlights,
  restatesLead,
  dropNoHighlightRows,
  isGroupOrAbsenceBullet,
  storiesNoHighlightNote,
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

describe("security claims in highlights.json", () => {
  it("gives an unconfirmed claim its own no-Highlight reason", () => {
    const note = storiesNoHighlightNote(["Title only"], ["Leak claim"])!;
    expect(note).toMatch(/show only a title[^\n]*"Title only"/);
    expect(note).toMatch(/not confirmed by the vendor[^\n]*"Leak claim"/);
    expect(note).not.toMatch(/show only a title[^\n]*"Leak claim"/);
  });
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
        variants: [],
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

  it("asks for Highlights only: no Across platforms section and no tables marker", () => {
    expect(prompt).not.toContain("Across platforms");
    expect(prompt).not.toContain("<!-- tables -->");
  });

  it("makes a major release a Highlights candidate", () => {
    expect(prompt).toContain("Releases this week");
    expect(prompt).toContain("x.0.0");
    expect(prompt).toContain("breaking changes");
  });

  it("asks for no section beyond Highlights", () => {
    expect(prompt).not.toContain("Data × AI");
    expect(prompt).not.toContain("Worth a Look");
    expect(prompt).not.toContain("Signals");
    expect(prompt).toContain("Write only `## Highlights`");
    expect(prompt).toContain("Write no links, URLs or other sections");
  });
});

describe("Weekly Diff's highlight", () => {
  const ARTICLE = [
    "# Weekly Diff 2026-11-16",
    "",
    "[⬛ Overview](https://example.com/#2026-11-16) · **⬜ Weekly Diff** · [🟫 Trends](https://example.com/t)",
    "",
    "> Sources: 330 items | Generated: 05:00 UTC",
    "",
    "---",
    "",
    "Anthropic released [Claude Fable 5.2](https://example.com/fable), and Claude Code made it the default Fable model. Databricks set two dates.",
    "",
    "## Claude Fable 5.2",
    "",
    "*This suggests a reading.*",
  ].join("\n");
  const AGENTS = "## Highlights\n\n- An agents highlight.\n\n## Spotted";

  it("is the lede's first sentence, as plain text, with or without the report bar", () => {
    const lede = "Anthropic released Claude Fable 5.2, and Claude Code made it the default Fable model.";
    expect(ledeHighlight(ARTICLE)).toBe(lede);
    expect(ledeHighlight(ARTICLE.replace(/\n\[⬛[^\n]*\n/, ""))).toBe(lede);
    expect(ledeHighlight("# Weekly Diff 2026-11-16\n\n> meta")).toBeNull();
  });

  it("is still the lede's when the model put a heading above it", () => {
    const page =
      "# Weekly Diff 2026-11-16\n\n> meta\n\n---\n\n## This week\n\nA lede sentence. And more.\n\n## Next\n\nBody.";
    expect(ledeHighlight(page)).toBe("A lede sentence.");
  });

  it("comes from its lede, by code", () => {
    expect(pageHighlights({ "ai-agents": AGENTS, "ai-weekly": ARTICLE })).toEqual({
      "ai-agents": ["An agents highlight."],
      "ai-weekly": ["Anthropic released Claude Fable 5.2, and Claude Code made it the default Fable model."],
    });
  });

  it("does not end the lede's sentence at an abbreviation, nor cut a long one", () => {
    const at = (lede: string) => ledeHighlight(`# W\n\n---\n\n${lede}`);
    expect(at("The U.S. Senate passed the bill. More.")).toBe("The U.S. Senate passed the bill.");
    expect(at("The consultation closes Nov. 9 for comments. More.")).toBe(
      "The consultation closes Nov. 9 for comments.",
    );
    expect(at("See [Art. 50 guidance](https://x.eu) e.g. for providers. More.")).toBe(
      "See Art. 50 guidance e.g. for providers.",
    );
    const long = `${"word ".repeat(60)}end.`;
    expect(at(long)).toBe(long);
  });
});

describe("pageHighlights", () => {
  const page = (body: string) =>
    `# P\n\n> meta\n\n---\n\n## Highlights\n\n${body}\n\n---\n\n## Spotted\n\n| a |`;

  it("gives every published page its first two Highlights, whole, as plain text (2026-11-21)", () => {
    const long =
      "Pi v1.6.0 makes render() return readonly string[] and makes Container return the same cached array while children are unchanged, so extensions that modify render output in place must copy it first.";
    expect(
      pageHighlights({
        "ai-agents": page(
          `- ${long}\n- **Cline** CLI v3.0.75 starts in [yolo mode](https://x.dev). More.\n- Third.`,
        ),
        "ai-models": page("- Thinking Machines released `Inkling 2 Mini`."),
      }),
    ).toEqual({
      "ai-agents": [long, "Cline CLI v3.0.75 starts in yolo mode. More."],
      "ai-models": ["Thinking Machines released Inkling 2 Mini."],
    });
  });

  it("reads prose paragraphs, wrapped lines, numbered bullets, ⚠️ markers and italics", () => {
    expect(
      pageHighlights({
        "ai-policy": page(
          "The Commission published\na [standard](https://x.eu). More.\n\nSecond item.\n\nThird.",
        ),
        "ai-data": page("1. ⚠️ **Snowflake** retires X.\n2. *Delta Lake* 4.0 adds `variant` type."),
      }),
    ).toEqual({
      "ai-policy": ["The Commission published a standard. More.", "Second item."],
      "ai-data": ["Snowflake retires X.", "Delta Lake 4.0 adds variant type."],
    });
  });

  it("keeps a going-away bullet's minus sign, however the page wrote the dash", () => {
    expect(pageHighlights({ "ai-data": page("- − Snowflake retires X.\n- – Fabric ends Y.") })).toEqual({
      "ai-data": ["− Snowflake retires X.", "− Fabric ends Y."],
    });
  });

  it("gives no entry for a page with nothing to restate", () => {
    expect(
      pageHighlights({
        "ai-data": page(`- ${NO_HIGHLIGHT_NOTE}`),
        "ai-policy": page(MSG.summaryFailed),
        "ai-trends": "# P\n\n## Radar\n\n| a |",
      }),
    ).toEqual({});
  });

  it("leaves out a Highlight that carries an unconfirmed security claim", () => {
    expect(
      pageHighlights({ "ai-agents": page(`- 🔓 Leak. ${SECURITY.unconfirmed}A user says.\n- Codex ships.`) }),
    ).toEqual({ "ai-agents": ["Codex ships."] });
  });

  it("matches a lead's possessive and hyphenated words to their bare forms", () => {
    expect(
      restatesLead("OpenAI open source Codex agent", "OpenAI's open-source Codex agent ships today"),
    ).toBe(true);
    expect(restatesLead("Snowflake ships X", "− Polars py-2.1.0 disallows mixed arithmetic.")).toBe(false);
  });
});

describe("dropNoHighlightRows with a title-only story", () => {
  const story = (name: string) => [{ name, url: "https://example.com/s", story: true as const }];
  const drop = (bullets: string[], name: string) => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const out = dropNoHighlightRows(
      `## Highlights\n\n${bullets.map((b) => `- ${b}`).join("\n")}`,
      story(name),
      "t",
    );
    vi.restoreAllMocks();
    return out;
  };

  it("drops a bullet that says little more than the title (2026-11-08 and 11-09)", () => {
    const cases: [string, string][] = [
      [
        "Goldman Sachs is pulling Claude Code from its bankers and traders",
        "Goldman Sachs is pulling Claude Code from its bankers and traders.",
      ],
      [
        "Tell HN: You now need a government id in order to create an Anthropic account",
        "Anthropic now requires a government ID to create an account.",
      ],
      [
        "The end of Microsoft Research's AI Frontiers group",
        "Microsoft Research's AI Frontiers group is ending.",
      ],
    ];
    for (const [title, bullet] of cases) {
      expect(drop([bullet, "Codex shipped v1."], title)).toBe("## Highlights\n\n- Codex shipped v1.");
    }
  });

  it("keeps a bullet that says much more than the title: another row with text backs it (a launch day)", () => {
    const bullet =
      "OpenAI released GPT-6 with a 2M-token context window, lower input prices and a new batch tier for agents.";
    expect(drop([bullet], "OpenAI releases GPT-6 with 2M context")).toContain(bullet);
    // The title's words alone do not make a bullet about the story.
    const release =
      "Claude Code v2.1.330 changes the hooks contract: every PreToolUse hook must return JSON.";
    expect(drop([release], "Claude Code v2.1.330 released")).toContain(release);
  });
});

describe("highlights.json for Trends", () => {
  it("leads with the page's lead and keeps its figures", () => {
    const trends =
      "## Highlights\n\n- **DeepSeek V4.1 Flash** leads OpenRouter with **35.37T tokens** on 2026-10-27.\n- **owner/repo** gains **+16,593 stars** in 7 days.\n- Third.\n\n## Models";
    expect(pageHighlights({ "ai-trends": trends })).toEqual({
      "ai-trends": [
        "DeepSeek V4.1 Flash leads OpenRouter with 35.37T tokens on 2026-10-27.",
        "owner/repo gains +16,593 stars in 7 days.",
      ],
    });
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
// Source fidelity: every Highlights, Signals and highlights.json prompt, and the Spotted summaries
// ---------------------------------------------------------------------------

describe("source fidelity rules", () => {
  const prompts = {
    page: buildPageHighlightsPrompt("AI Agents", "## Agents", AGENTS_HIGHLIGHTS_FOCUS, "2026-10-26"),
    trends: buildTrendsProsePrompt("## Research", "2026-10-26"),
    policy: buildPolicyProsePrompt("| Date |", "2026-10-26", "A reader."),
    data: buildDataProsePrompt("## Snowflake", "2026-10-26"),
    // Row summaries too: 5 of the issue 05 overstatements were Spotted summaries.
    spotted: buildSpottedSummariesPrompt([], "2026-10-26"),
  };

  it.each(Object.entries(prompts))("the %s prompt carries every rule", (_, prompt) => {
    for (const rule of SOURCE_FIDELITY_RULES) expect(prompt).toContain(rule);
  });

  it("stage words, calls to action, attribution, study scope and trends are each covered", () => {
    const rules = SOURCE_FIDELITY_RULES.join(" ");
    expect(rules).toMatch(/GA, generally available, preview, beta/);
    expect(rules).toMatch(/No call to action/);
    expect(rules).toMatch(/X says/);
    expect(rules).toMatch(/one person's report never becomes 'users report'/);
    // The scope rules the issue 05 cases broke (2026-11-04 … 11-14).
    expect(rules).toMatch(/qualifier/);
    expect(rules).toMatch(/'recommends'.*never becomes 'must'/);
    expect(rules).toMatch(/upcoming.*never becomes 'released'/);
    expect(rules).toMatch(/[Ss]eparate (changes|fixes) stay separate/);
    expect(rules).toMatch(/sample size, a single run, not peer reviewed/);
    expect(rules).toMatch(/Several items on one theme in the same period are not a trend/);
    expect(rules).toMatch(/never titles, descriptions or co-occurrence alone/);
  });

  // "must migrate to GLM 5.3" (a recommendation), "must update" a flag kept as an alias, "must test
  // migration" and "must migrate to Gemini 3.8 Flash" (calls redirected): issue 05, 2026-11-04 … 11-14.
  it("the data Highlights give an action only when the row states one, in the row's strength", () => {
    expect(prompts.data).toContain("what to do only when the row states it, as strongly as the row does");
    expect(prompts.data).not.toContain("its change requires it");
    expect(prompts.data).not.toContain("must test or migrate");
    expect(prompts.data).not.toMatch(/without who is affected and what to do/);
    // No audience the row does not state (SOURCE_FIDELITY_RULES): the reviewer's finding on this branch.
    expect(prompts.data).toContain("who is affected, as far as the row names it");
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

  // 2026-11-01: every vendor row minor, and the model wrote "All vendor release notes today are minor
  // fixes and previews; no deprecations" above an Action required end-of-life row it never saw.
  it("the data Highlights fall back to the no-highlight note, never a bullet about absence", () => {
    const p = buildDataProsePrompt("## Snowflake", "2026-11-01", ["Dashboard bug fixes"]);
    expect(p).toContain(`When no item qualifies, Highlights is the one bullet "- ${NO_HIGHLIGHT_NOTE}"`);
    expect(p).toContain("Never a bullet about the rows as a group or about what is absent");
  });

  it("Trends Highlights hold 1-3 ranked bullets, one subject each, with their window", () => {
    const p = buildTrendsProsePrompt("## Research", "2026-10-26");
    expect(p).toContain("1-3 bullets on the most noteworthy items of the week for a data or AI engineer");
    expect(p).toContain("One subject per bullet");
  });

  it("highlights.json sees each page's Highlights only, never a table row below them", () => {
    const data =
      "# Data\n\n## Highlights\n\n- − **Polars** py-2.1.0 disallows mixed arithmetic.\n\n---\n\n## Snowflake\n\n| 1 | Coding agent MCP tool | minor note |";
    const policy =
      "## Highlights\n\nThe Commission published a standard.\n\n<!-- tables -->\n\n## EU\n\n| Draft guidance row |";
    expect(pageHighlights({ "ai-data": data, "ai-policy": policy })).toEqual({
      "ai-data": ["− Polars py-2.1.0 disallows mixed arithmetic."],
      "ai-policy": ["The Commission published a standard."],
    });
    expect(highlightsSection(data)).toBe(
      "## Highlights\n\n- − **Polars** py-2.1.0 disallows mixed arithmetic.",
    );
    expect(highlightsSection("## Agents\n\n- x")).toBeNull();
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
    expect(pageHighlights({ "ai-data": page })).toEqual({});
  });

  it("on the data page, drops a bullet stating an absence or calling the rows minor (2026-11-01)", () => {
    const prose =
      "## Highlights\n- All vendor release notes today are minor fixes and previews; no deprecations or breaking changes.";
    expect(dropNoHighlightRows(prose, [], "data", isGroupOrAbsenceBullet)).toBe(
      `## Highlights\n- ${NO_HIGHLIGHT_NOTE}`,
    );
    const normal = `## Highlights\n\n${polars}`;
    expect(dropNoHighlightRows(normal, [minor], "data", isGroupOrAbsenceBullet)).toBe(normal);
    expect(
      isGroupOrAbsenceBullet("- dbt-core 1.12, a minor version, drops Python 3.9: test before upgrading."),
    ).toBe(false);
  });
});
