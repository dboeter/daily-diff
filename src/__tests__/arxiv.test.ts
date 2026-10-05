import { describe, expect, it } from "vitest";
import {
  extractTag,
  extractAllTags,
  extractAttr,
  extractLinkHref,
  parseEntry,
  parseArxivEntries,
  relevanceOf,
  retryDelayMs,
  rankByRelevance,
  type ArxivPaper,
} from "../arxiv.ts";

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

  it("weighs the Jev answers into one relevance in 0–1", () => {
    const answers = (llm: number, agents: number, practical: number) => ({
      about_llms: { noul: llm },
      about_agents_or_code: { noul: agents },
      practical: { score: practical },
    });
    expect(relevanceOf(answers(1, 1, 2))).toBe(1);
    expect(relevanceOf(answers(0, 0, 0))).toBe(0);
    expect(relevanceOf(answers(1, 0, 1))).toBe(0.625);
    expect(() =>
      relevanceOf({ about_llms: { noul: 1 } } as unknown as Parameters<typeof relevanceOf>[0]),
    ).toThrow();
    expect(() => relevanceOf(answers(1, 1, Number.NaN))).toThrow(/Unexpected Jev answers/);
  });

  it("honors retry-after and otherwise backs off exponentially, capped", () => {
    expect(retryDelayMs("2", 0)).toBe(2000);
    expect(retryDelayMs("600", 0)).toBe(10_000);
    expect(retryDelayMs(null, 0)).toBe(1000);
    expect(retryDelayMs(null, 2)).toBe(4000);
    expect(retryDelayMs("Wed, 21 Oct 2026 07:28:00 GMT", 1)).toBe(2000);
  });

  it("sorts most relevant first, keeps input order on ties, and puts failed papers last", async () => {
    const scores: Record<string, number> = { a: 1, b: 3, d: 1 };
    const ranked = await rankByRelevance(
      [paper("a"), paper("b"), paper("c"), paper("d")],
      "key",
      async (p) => {
        if (!(p.id in scores)) throw new Error("HTTP 529");
        return scores[p.id]!;
      },
    );
    expect(ranked?.map((p) => p.id)).toEqual(["b", "a", "d", "c"]);
  });

  it("returns null when most scoring calls fail", async () => {
    const ranked = await rankByRelevance([paper("a"), paper("b"), paper("c")], "key", async (p) => {
      if (p.id !== "a") throw new Error("HTTP 401");
      return 1;
    });
    expect(ranked).toBeNull();
  });
});
