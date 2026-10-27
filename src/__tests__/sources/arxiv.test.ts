import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchArxivData,
  extractTag,
  extractAllTags,
  extractAttr,
  extractLinkHref,
  parseEntry,
  parseArxivEntries,
  relevanceOf,
  hasCodeLink,
  rankByRelevance,
  submissionCutoff,
  nextArxivState,
  buildTraceFile,
  DOMAIN_APPLICATION_PENALTY,
  type JevScore,
  type ArxivPaper,
} from "../../sources/arxiv.ts";

const SAMPLE_ENTRY_XML = `
<entry>
  <id>http://arxiv.org/abs/2603.12345v1</id>
  <updated>2026-03-10T12:00:00Z</updated>
  <published>2026-03-09T08:30:00Z</published>
  <title>
    Scaling Autonomous   Agents with Recursive Reasoning
  </title>
  <summary>
    We propose a framework for    scaling multi-agent reasoning systems.
  </summary>
  <author>
    <name>Alice Smith</name>
  </author>
  <author>
    <name>Bob Jones</name>
  </author>
  <link rel="related" type="application/pdf" href="http://arxiv.org/pdf/2603.12345v1"/>
  <category term="cs.AI" scheme="http://arxiv.org/schemas/atom"/>
  <category term="cs.CL" scheme="http://arxiv.org/schemas/atom"/>
</entry>
`;

describe("arxiv XML parsing helpers", () => {
  it("extracts text from XML tag", () => {
    expect(extractTag("<title>Hello World</title>", "title")).toBe("Hello World");
    expect(extractTag("<missing>value</missing>", "title")).toBe("");
  });

  it("extracts all matching tags", () => {
    const xml = "<name>Alice</name><name>Bob</name>";
    expect(extractAllTags(xml, "name")).toEqual(["Alice", "Bob"]);
  });

  it("extracts attribute values", () => {
    const xml = '<category term="cs.AI"/><category term="cs.LG"/>';
    expect(extractAttr(xml, "category", "term")).toEqual(["cs.AI", "cs.LG"]);
  });

  it("extracts link href by rel", () => {
    const xml =
      '<link rel="alternate" href="https://example.com/alt"/><link rel="related" href="https://example.com/pdf"/>';
    expect(extractLinkHref(xml, "related")).toBe("https://example.com/pdf");
    expect(extractLinkHref(xml, "missing")).toBe("");
  });
});

describe("parseEntry", () => {
  it("parses valid ArXiv entry XML with normalized whitespace and authors", () => {
    const paper = parseEntry(SAMPLE_ENTRY_XML);
    expect(paper).not.toBeNull();
    expect(paper?.id).toBe("http://arxiv.org/abs/2603.12345v1");
    expect(paper?.title).toBe("Scaling Autonomous Agents with Recursive Reasoning");
    expect(paper?.summary).toBe("We propose a framework for scaling multi-agent reasoning systems.");
    expect(paper?.authors).toEqual(["Alice Smith", "Bob Jones"]);
    expect(paper?.published).toBe("2026-03-09T08:30:00Z");
    expect(paper?.updated).toBe("2026-03-10T12:00:00Z");
    expect(paper?.categories).toEqual(["cs.AI", "cs.CL"]);
    expect(paper?.url).toBe("http://arxiv.org/abs/2603.12345v1");
    expect(paper?.pdfUrl).toBe("http://arxiv.org/pdf/2603.12345v1");
  });

  it("falls back to derived pdfUrl when related link is absent", () => {
    const xml = `
    <entry>
      <id>http://arxiv.org/abs/2603.99999v1</id>
      <title>No Link Paper</title>
      <summary>Summary</summary>
    </entry>`;
    const paper = parseEntry(xml);
    expect(paper?.pdfUrl).toBe("http://arxiv.org/pdf/2603.99999v1");
  });

  it("returns null when entry does not have an id tag", () => {
    const xml = "<entry><title>Missing ID</title></entry>";
    expect(parseEntry(xml)).toBeNull();
  });
});

describe("parseArxivEntries", () => {
  it("parses feed containing multiple entries", () => {
    const feed = `
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>ArXiv Feed</title>
      ${SAMPLE_ENTRY_XML}
      <entry>
        <id>http://arxiv.org/abs/2603.67890v1</id>
        <title>Second Paper</title>
        <summary>Second summary</summary>
      </entry>
    </feed>`;
    const papers = parseArxivEntries(feed);
    expect(papers).toHaveLength(2);
    expect(papers[0]?.id).toBe("http://arxiv.org/abs/2603.12345v1");
    expect(papers[1]?.id).toBe("http://arxiv.org/abs/2603.67890v1");
  });

  it("returns empty array for feeds with no entries", () => {
    expect(parseArxivEntries("<feed><title>Empty</title></feed>")).toEqual([]);
  });
});

describe("Jev relevance ranking", () => {
  const paper = (id: string): ArxivPaper => ({
    id,
    title: id,
    summary: "",
    authors: [],
    published: "",
    updated: "",
    categories: [],
    url: id,
    pdfUrl: id,
  });

  /** `llm` is the about_llms Score level, 0–2; the rest are nouls. */
  const answers = (llm: number, agents: number, noTraining: number, wide: number, technique = 1) => ({
    about_llms: { score: llm },
    about_agents_or_code: { noul: agents },
    proposes_technique: { noul: technique },
    works_without_training: { noul: noTraining },
    widely_used_models: { noul: wide },
  });
  const jev = (relevance: number): JevScore => ({
    relevance,
    answers: answers(2, 0.5, 0.123456, 0),
    codeReleased: false,
    model: "jev-1.13.0",
  });

  it("weighs the Jev answers and the code link into one relevance in 0–1", () => {
    expect(relevanceOf(answers(2, 1, 1, 1), true)).toBeCloseTo(1);
    expect(relevanceOf(answers(0, 0, 0, 0), false)).toBe(0);
    // LLM fit is half the weight: an off-topic paper never outranks a paper about LLMs.
    expect(relevanceOf(answers(0, 1, 1, 1), true)).toBeCloseTo(0.5);
    expect(relevanceOf(answers(2, 0, 0, 0), false)).toBeCloseTo(0.5);
    // A paper where an LLM is one component gets half the LLM weight.
    expect(relevanceOf(answers(1, 0, 0, 0), false)).toBeCloseTo(0.25);
    // "Without training" counts only for a paper that proposes a technique.
    expect(relevanceOf(answers(2, 0, 1, 0, 0), false)).toBeCloseTo(0.5);
    expect(() =>
      relevanceOf({ about_llms: { noul: 1 } } as unknown as Parameters<typeof relevanceOf>[0], false),
    ).toThrow();
    expect(() => relevanceOf(answers(2, 1, 1, Number.NaN), false)).toThrow(/Unexpected Jev answers/);
  });

  it("detects code and model links in an abstract", () => {
    expect(hasCodeLink("Code is available at https://github.com/org/repo.")).toBe(true);
    expect(hasCodeLink("Project page: https://org.github.io/proj/")).toBe(true);
    expect(hasCodeLink("Weights at huggingface.co/org/model")).toBe(true);
    expect(hasCodeLink("We discuss GitHub issues as a data source.")).toBe(false);
  });

  it("sorts most relevant first, keeps input order on ties, and puts failed papers last", async () => {
    const scores: Record<string, number> = { a: 1, b: 3, d: 1 };
    const ranked = await rankByRelevance(
      [paper("a"), paper("b"), paper("c"), paper("d")],
      "key",
      async (p) => {
        if (!(p.id in scores)) throw new Error("HTTP 529");
        return jev(scores[p.id]!);
      },
    );
    expect(ranked?.map((r) => r.paper.id)).toEqual(["b", "a", "d", "c"]);
    expect(ranked?.at(-1)?.jev).toBeNull();
  });

  it("returns null when most scoring calls fail", async () => {
    const ranked = await rankByRelevance([paper("a"), paper("b"), paper("c")], "key", async (p) => {
      if (p.id !== "a") throw new Error("HTTP 401");
      return jev(1);
    });
    expect(ranked).toBeNull();
  });

  it("writes the raw judgments of scored papers to the trace", () => {
    const file = JSON.parse(
      buildTraceFile([
        { paper: paper("a"), jev: jev(0.9) },
        { paper: paper("b"), jev: null },
      ]),
    );
    expect(file.models).toEqual(["jev-1.13.0"]);
    expect(file.weights.about_llms).toBe(0.5);
    expect(file.papers).toEqual([
      {
        id: "a",
        title: "a",
        relevance: 0.9,
        about_llms: 2,
        about_agents_or_code: 0.5,
        proposes_technique: 1,
        works_without_training: 0.123,
        widely_used_models: 0,
        code_released: false,
        rendered: true,
        rank: 1,
      },
    ]);
  });

  it("traces domain_application and its penalty", () => {
    const base = answers(2, 0.98, 1, 1);
    const withDomain = { ...base, domain_application: { noul: 0.97 } };
    expect(relevanceOf(withDomain, false)).toBeCloseTo(relevanceOf(base, false) * (1 - 0.2 * 0.97));
    const file = JSON.parse(
      buildTraceFile([{ paper: paper("a"), jev: { ...jev(0.9), answers: withDomain } }]),
    );
    expect(file.papers[0].domain_application).toBe(0.97);
    expect(file.domain_application_penalty).toBe(DOMAIN_APPLICATION_PENALTY);
  });

  /**
   * The 2026-10-26 Research pool (research-state entries of 10-19 to 10-25) with the answers the
   * 10-23 and 10-24 arXiv traces saved. Those runs did not ask domain_application yet: the values
   * below are supplied by hand, high for the four papers serving one outside field, low for the rest.
   */
  describe("replays the 2026-10-26 Research pool", () => {
    type Row = {
      id: string;
      title: string;
      relevance: number;
      about_llms: number;
      about_agents_or_code: number;
      proposes_technique: number;
      works_without_training: number;
      widely_used_models: number;
      code_released: boolean;
    };
    const pool = (
      JSON.parse(
        fs.readFileSync(new URL("../fixtures/arxiv-research-2026-10-26.json", import.meta.url), "utf-8"),
      ) as { papers: Row[] }
    ).papers;
    const toAnswers = (r: Row, domain?: number) => ({
      about_llms: { score: r.about_llms },
      about_agents_or_code: { noul: r.about_agents_or_code },
      ...(domain === undefined ? {} : { domain_application: { noul: domain } }),
      proposes_technique: { noul: r.proposes_technique },
      works_without_training: { noul: r.works_without_training },
      widely_used_models: { noul: r.widely_used_models },
    });
    const top10 = (domainOf: (r: Row) => number | undefined): string[] =>
      pool
        .map((r) => ({ r, rel: relevanceOf(toAnswers(r, domainOf(r)), r.code_released) }))
        .sort((a, b) => b.rel - a.rel)
        .slice(0, 10)
        .map(({ r }) => r.title.split(":")[0]!);
    const OFF_AUDIENCE = [
      "nnInteractive Agent",
      "Governed Self-Evolution for Autonomous Investing",
      "Harnessing Language Models as Optimization Modeling Agents",
      "LLM2Cert",
    ];
    // Also for one field: biomedical claims, medical dialogue, Lean/Mathlib search.
    const OTHER_DOMAIN = ["Real PMIDs, Wrong Papers", "SIM-UT", "Lean Finder V2"];

    it("reproduces the saved relevance without a domain answer (no penalty)", () => {
      for (const r of pool) expect(relevanceOf(toAnswers(r), r.code_released)).toBeCloseTo(r.relevance, 2);
      expect(top10(() => undefined)).toEqual(expect.arrayContaining(OFF_AUDIENCE));
    });

    it("drops the four off-audience papers below the on-topic ones", () => {
      const domain = (r: Row) =>
        [...OFF_AUDIENCE, ...OTHER_DOMAIN].some((t) => r.title.startsWith(t)) ? 0.9 : 0.1;
      const top = top10(domain);
      for (const t of OFF_AUDIENCE) expect(top).not.toContain(t);
      expect(top.slice(0, 2)).toEqual(["SWE-VERIFIER", "Environment Duels"]);
      // At 0.5 the top paper (0.958) still falls below the on-topic ones at 0.87.
      const half = top10((r) => (OFF_AUDIENCE.some((t) => r.title.startsWith(t)) ? 0.5 : 0));
      expect(half.indexOf("nnInteractive Agent")).toBeGreaterThan(
        half.indexOf("Beyond Watching and Searching"),
      );
    });
  });
});

describe("ArXiv pool cutoff", () => {
  const now = new Date("2026-10-05T22:37:00Z");
  const state = {
    date: "2026-10-05",
    cutoff: "2026-10-01T18:00:00.000Z",
    newest: "2026-10-02T17:59:00.000Z",
  };

  it("takes what was submitted after the newest paper the previous run saw", () => {
    expect(submissionCutoff(state, "2026-10-06", now)).toBe(Date.parse(state.newest));
  });

  it("reuses the previous cutoff when the same day is re-run", () => {
    expect(submissionCutoff(state, "2026-10-05", now)).toBe(Date.parse(state.cutoff));
  });

  it("falls back to 48 h without usable state", () => {
    const fallback = now.getTime() - 48 * 60 * 60 * 1000;
    expect(submissionCutoff(null, "2026-10-06", now)).toBe(fallback);
    expect(submissionCutoff({ ...state, newest: "garbage" }, "2026-10-06", now)).toBe(fallback);
  });

  it("records the newest submission in the pool, and nothing for an empty pool", () => {
    const paper = (published: string): ArxivPaper => ({
      id: published,
      title: "",
      summary: "",
      authors: [],
      published,
      updated: published,
      categories: [],
      url: "",
      pdfUrl: "",
    });
    const cutoff = Date.parse("2026-10-02T17:59:00Z");
    expect(nextArxivState([], cutoff, "2026-10-06")).toBeUndefined();
    expect(
      nextArxivState([paper("2026-10-05T10:00:00Z"), paper("2026-10-05T17:30:00Z")], cutoff, "2026-10-06"),
    ).toEqual({ date: "2026-10-06", cutoff: "2026-10-02T17:59:00.000Z", newest: "2026-10-05T17:30:00.000Z" });
  });
});

describe("fetchArxivData", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns fetchSuccess false instead of throwing when the network is down", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "");
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    vi.useFakeTimers();
    const pending = fetchArxivData("2026-10-19", null);
    await vi.runAllTimersAsync();
    expect(await pending).toMatchObject({ papers: [], fetchSuccess: false });
  });
});
