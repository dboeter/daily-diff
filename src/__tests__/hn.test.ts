import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHnData, metaDescription } from "../sources/hn.ts";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchHnData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves Hacker News rank order after filtering AI stories", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith("/topstories.json")) {
        return jsonResponse([101, 102, 103, 104]);
      }

      const id = Number(url.match(/item\/(\d+)\.json$/)?.[1]);
      const items = new Map<number, unknown>([
        [
          101,
          {
            id: 101,
            type: "story",
            by: "alice",
            time: 1_800_000_000,
            title: "Open hardware router",
            score: 500,
            descendants: 20,
            url: "https://example.com/router",
          },
        ],
        [
          102,
          {
            id: 102,
            type: "story",
            by: "bob",
            time: 1_800_000_100,
            title: "A global workspace in language models",
            score: 100,
            descendants: 10,
            url: "https://example.com/language-models",
          },
        ],
        [
          103,
          {
            id: 103,
            type: "story",
            by: "carol",
            time: 1_800_000_200,
            title: "Office suite for AI agents",
            score: 300,
            descendants: 15,
            url: "https://example.com/ai-agents",
          },
        ],
        [
          104,
          {
            id: 104,
            type: "story",
            by: "dave",
            time: 1_800_000_300,
            title: "Ask HN: Favorite terminals",
            score: 400,
            descendants: 30,
            url: "https://example.com/terminals",
          },
        ],
      ]);

      return jsonResponse(items.get(id) ?? null);
    });

    const result = await fetchHnData();

    expect(result.fetchSuccess).toBe(true);
    expect(result.stories.map((story) => story.id)).toEqual(["102", "103"]);
    expect(result.stories.map((story) => story.points)).toEqual([100, 300]);
  });

  it("keeps stories shown on an earlier day but does not count them toward the cut", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/topstories.json")) return jsonResponse(Array.from({ length: 50 }, (_, i) => i + 1));
      const id = Number(url.match(/item\/(\d+)\.json$/)?.[1]);
      return jsonResponse({
        id,
        type: "story",
        title: `AI story ${id}`,
        score: id,
        url: `https://e.com/${id}`,
      });
    });

    expect((await fetchHnData()).stories).toHaveLength(40);
    const shown = new Set(["2", "5", "7"]);
    const { stories } = await fetchHnData((id) => shown.has(id));
    expect(stories.map((s) => s.id)).toEqual(Array.from({ length: 43 }, (_, i) => String(i + 1)));
  });

  it("admits data engineering stories next to AI ones", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/topstories.json")) return jsonResponse([1, 2, 3]);
      const id = Number(url.match(/item\/(\d+)\.json$/)?.[1]);
      const titles = ["DuckDB 2.0 released", "Postgres 19 beta", "A new terminal emulator"];
      return jsonResponse({ id, type: "story", title: titles[id - 1], score: 1, url: `https://e.com/${id}` });
    });

    expect((await fetchHnData()).stories.map((s) => s.title)).toEqual([
      "DuckDB 2.0 released",
      "Postgres 19 beta",
    ]);
  });

  it("returns an unsuccessful result when the topstories request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ error: "failed" }, 500));

    const result = await fetchHnData();

    expect(result).toEqual({ stories: [], fetchSuccess: false });
  });
});

describe("metaDescription", () => {
  it("reads og:description in either attribute order, else the meta description", () => {
    expect(metaDescription(`<meta property="og:description" content="Goodfire on SAEs &amp; probes">`)).toBe(
      "Goodfire on SAEs & probes",
    );
    expect(metaDescription(`<meta content='Reversed order' property='og:description' />`)).toBe(
      "Reversed order",
    );
    expect(metaDescription(`<head><meta name="description" content="Plain meta"></head>`)).toBe("Plain meta");
    expect(metaDescription("<head><title>None</title></head>")).toBe("");
    expect(metaDescription(`<meta name="og:description" data-content="no" content="Named og">`)).toBe(
      "Named og",
    );
  });
});

// 2026-10-19: with titles only, summaries guessed what "Neural networks are clean" argues.
describe("fetchHnData descriptions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gives each linked story its page's description, and none to a text post", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/topstories.json")) return jsonResponse([1, 2]);
      if (url === "https://example.com/clean") {
        return new Response(`<meta property="og:description" content="Sparse features generalize.">`, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      const id = Number(url.match(/item\/(\d+)\.json$/)?.[1]);
      return jsonResponse({
        id,
        type: "story",
        title: id === 1 ? "Neural networks are clean (AI)" : "Ask HN: AI at work?",
        score: 10,
        ...(id === 1 ? { url: "https://example.com/clean" } : {}),
      });
    });

    const { stories } = await fetchHnData();
    expect(stories.map((s) => s.description)).toEqual(["Sparse features generalize.", undefined]);
  });
});
