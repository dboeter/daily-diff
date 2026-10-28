import { describe, expect, it, vi } from "vitest";
import { entriesBefore, printChanges, rejudgeResearch } from "../../../scripts/rejudge-research.ts";
import { relevanceOf, type ArxivPaper, type JevAnswers, type JevScore } from "../../sources/arxiv.ts";
import type { ResearchEntry, ResearchState } from "../../trending/research.ts";

const entry = (date: string, relevance: number, title = "T"): ResearchEntry => ({
  title,
  url: "u",
  published: "2026-10-20T00:00:00Z",
  relevance,
  abstract: `abstract of ${title}`,
  date,
});

const state = (): ResearchState => ({
  items: {
    a: entry("2026-10-23", 0.958, "nnInteractive Agent"),
    b: entry("2026-10-27", 0.87, "A coding agent"),
    c: entry("2026-10-28", 0.9, "Saved after the penalty"),
  },
});

/** A medical-imaging paper scores domain_application 1; the rest 0. */
const answers = (domain: number): JevAnswers => ({
  about_llms: { score: 2 },
  about_agents_or_code: { noul: 1 },
  domain_application: { noul: domain },
  proposes_technique: { noul: 1 },
  works_without_training: { noul: 1 },
  widely_used_models: { noul: 0 },
});

const stubScore = async (paper: ArxivPaper): Promise<JevScore> => {
  const a = answers(paper.title.startsWith("nnInteractive") ? 1 : 0);
  return { relevance: relevanceOf(a, false), answers: a, codeReleased: false, model: "jev-test" };
};

describe("entriesBefore", () => {
  it("takes the entries saved before the cutoff only", () => {
    expect(entriesBefore(state(), "2026-10-28").map(([id]) => id)).toEqual(["a", "b"]);
    expect(entriesBefore(state(), "2026-10-24").map(([id]) => id)).toEqual(["a"]);
  });
});

describe("rejudgeResearch", () => {
  it("rewrites the relevance of the entries before the cutoff from fresh answers, nothing else", async () => {
    const result = await rejudgeResearch(state(), "2026-10-28", stubScore);
    // Weighted 0.5 + 0.2 + 0.1 = 0.8; the outside-field paper loses DOMAIN_APPLICATION_PENALTY (20%).
    expect(result!.state.items["a"]!.relevance).toBeCloseTo(0.8 * 0.8);
    expect(result!.state.items["b"]!.relevance).toBeCloseTo(0.8);
    expect(result!.state.items["c"]).toEqual(state().items["c"]);
    expect(result!.state.items["a"]).toEqual({
      ...state().items["a"],
      relevance: result!.state.items["a"]!.relevance,
    });
    expect(result!.changes.map((c) => [c.title, c.old])).toEqual([
      ["nnInteractive Agent", 0.958],
      ["A coding agent", 0.87],
    ]);
  });

  it("gives the same state on a second run: no double penalty", async () => {
    const once = await rejudgeResearch(state(), "2026-10-28", stubScore);
    const twice = await rejudgeResearch(once!.state, "2026-10-28", stubScore);
    expect(twice!.state).toEqual(once!.state);
  });

  it("keeps the old relevance of an entry whose call failed", async () => {
    const score = (paper: ArxivPaper) =>
      paper.title === "A coding agent" ? Promise.reject(new Error("HTTP 500")) : stubScore(paper);
    const result = await rejudgeResearch(state(), "2026-10-28", score);
    expect(result!.state.items["b"]!.relevance).toBe(0.87);
    expect(result!.changes.find((c) => c.id === "b")!.new).toBeNull();
  });

  it("judges an entry on its full abstract when there is one, else on the stored text", async () => {
    const seen = new Map<string, string>();
    const score = (paper: ArxivPaper) => {
      seen.set(paper.id, paper.summary);
      return stubScore(paper);
    };
    await rejudgeResearch(state(), "2026-10-28", score, new Map([["a", "The full abstract."]]));
    expect(seen.get("a")).toBe("The full abstract.");
    expect(seen.get("b")).toBe(state().items["b"]!.abstract);
  });

  it("returns null when too many calls failed", async () => {
    const result = await rejudgeResearch(state(), "2026-10-28", () => Promise.reject(new Error("HTTP 400")));
    expect(result).toBeNull();
  });
});

describe("printChanges", () => {
  it("lists the entries it could not re-judge and exits non-zero", async () => {
    const score = (paper: ArxivPaper) =>
      paper.title === "A coding agent" ? Promise.reject(new Error("HTTP 500")) : stubScore(paper);
    const result = await rejudgeResearch(state(), "2026-10-28", score);
    vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(printChanges(result!.changes)).toBe(1);
    const listed = error.mock.calls.map((c) => String(c[0]));
    expect(listed.some((l) => l.includes("b  A coding agent"))).toBe(true);
    expect(listed.some((l) => l.includes("nnInteractive"))).toBe(false);
    vi.restoreAllMocks();
  });

  it("exits zero when every entry was re-judged", async () => {
    const result = await rejudgeResearch(state(), "2026-10-28", stubScore);
    vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(printChanges(result!.changes)).toBe(0);
    expect(error).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
