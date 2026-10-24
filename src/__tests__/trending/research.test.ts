import { describe, expect, it } from "vitest";
import { nextResearchState, weekPapers, type ResearchState } from "../../trending/research.ts";
import type { ArxivData, ArxivPaper } from "../../sources/arxiv.ts";

const DATE = "2026-10-26";

const paper = (id: string, relevance?: number): ArxivPaper & { relevance?: number } => ({
  id,
  title: `Paper ${id}`,
  summary: "a".repeat(800),
  authors: [],
  published: "2026-10-24T00:00:00Z",
  updated: "2026-10-24T00:00:00Z",
  categories: [],
  url: `https://arxiv.org/abs/${id}`,
  pdfUrl: "",
  ...(relevance === undefined ? {} : { relevance }),
});

const arxiv = (papers: ReturnType<typeof paper>[], rankedBy: ArxivData["rankedBy"] = "jev"): ArxivData => ({
  papers,
  fetchSuccess: papers.length > 0,
  rankedBy,
});

const entry = (date: string, relevance = 0.5) => ({
  title: "T",
  url: "u",
  published: "2026-10-01T00:00:00Z",
  relevance,
  abstract: "A.",
  date,
});

describe("nextResearchState", () => {
  it("saves the day's top 15 by relevance, abstracts cut at 600 characters", () => {
    const papers = Array.from({ length: 20 }, (_, i) => paper(`p${i}`, i / 20));
    const next = nextResearchState({ items: {} }, arxiv([...papers, paper("unscored")]), DATE);
    const ids = Object.keys(next.items);
    expect(ids).toHaveLength(15);
    expect(ids).not.toContain("p4");
    expect(ids).not.toContain("unscored");
    expect(next.items["p19"]).toMatchObject({
      relevance: 0.95,
      date: DATE,
      url: "https://arxiv.org/abs/p19",
    });
    expect(next.items["p19"]!.abstract).toHaveLength(600);
  });

  it("prunes entries older than 8 days", () => {
    const state: ResearchState = { items: { kept: entry("2026-10-18"), pruned: entry("2026-10-17") } };
    expect(Object.keys(nextResearchState(state, arxiv([]), DATE).items)).toEqual(["kept"]);
  });

  it("replaces the day's entries on a same-day re-run instead of appending", () => {
    const first = nextResearchState({ items: {} }, arxiv([paper("a", 0.9), paper("b", 0.8)]), DATE);
    const again = nextResearchState(first, arxiv([paper("c", 0.7)]), DATE);
    expect(Object.keys(again.items)).toEqual(["c"]);
  });

  it("adds nothing on a day ranked by recency", () => {
    const state: ResearchState = { items: { kept: entry(DATE) } };
    const next = nextResearchState(state, arxiv([paper("r")], "recency"), DATE);
    expect(Object.keys(next.items)).toEqual(["kept"]);
  });
});

describe("weekPapers", () => {
  it("takes the 10 most relevant saved in the 7 days before the run", () => {
    const items: ResearchState["items"] = {};
    for (let i = 0; i < 12; i++) items[`w${i}`] = entry("2026-10-20", i / 100);
    items["old"] = entry("2026-10-18", 1);
    items["today"] = entry(DATE, 1);
    items["first"] = entry("2026-10-19", 0.99);
    const papers = weekPapers({ items }, DATE);
    expect(papers).toHaveLength(10);
    expect(papers[0]).toMatchObject({ id: "first", relevance: 0.99 });
    expect(papers.map((p) => p.id)).not.toContain("old");
    expect(papers.map((p) => p.id)).not.toContain("today");
  });

  it("shows what is there when the state holds fewer than 7 days", () => {
    expect(weekPapers({ items: { a: entry("2026-10-25") } }, DATE).map((p) => p.id)).toEqual(["a"]);
  });
});
