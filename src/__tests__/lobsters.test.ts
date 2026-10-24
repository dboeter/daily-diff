import { afterEach, describe, expect, it, vi } from "vitest";
import { type LobstersApiStory, fetchLobstersData, toLobstersStory } from "../sources/lobsters.ts";

describe("toLobstersStory", () => {
  it("maps raw Lobste.rs JSON story to LobstersStory structure", () => {
    const raw: LobstersApiStory = {
      short_id: "xyz123",
      title: "Show Lobsters: Minimal Llama Inference Engine in C",
      url: "https://github.com/example/llama-c",
      comments_url: "https://lobste.rs/s/xyz123/minimal_llama",
      score: 45,
      comment_count: 12,
      created_at: "2026-03-09T16:00:00Z",
    };

    const story = toLobstersStory(raw);
    expect(story).toEqual({
      id: "xyz123",
      title: "Show Lobsters: Minimal Llama Inference Engine in C",
      url: "https://github.com/example/llama-c",
      commentsUrl: "https://lobste.rs/s/xyz123/minimal_llama",
      score: 45,
      commentCount: 12,
      publishedAt: "2026-03-09T16:00:00Z",
    });
  });

  it("falls back to comments_url if external url is empty", () => {
    const raw: LobstersApiStory = {
      short_id: "ask456",
      title: "Ask Lobsters: State of Open LLM Fine-tuning",
      url: "",
      comments_url: "https://lobste.rs/s/ask456/fine_tuning",
      score: 20,
      comment_count: 8,
      created_at: "2026-03-09T10:00:00Z",
    };

    const story = toLobstersStory(raw);
    expect(story.url).toBe("https://lobste.rs/s/ask456/fine_tuning");
  });

  it("takes the submitter's text as the description, as one line", () => {
    const raw: LobstersApiStory = {
      short_id: "txt789",
      title: "Byte Language Models",
      url: "https://arxiv.org/abs/2610.00001",
      comments_url: "https://lobste.rs/s/txt789/byte_language_models",
      score: 9,
      comment_count: 2,
      created_at: "2026-10-22T10:00:00Z",
      description_plain: "The paper drops the tokenizer.\n\nIt scales anyway.",
    };
    expect(toLobstersStory(raw).description).toBe("The paper drops the tokenizer. It scales anyway.");
    expect(toLobstersStory({ ...raw, description_plain: " " })).not.toHaveProperty("description");
  });
});

describe("fetchLobstersData", () => {
  afterEach(() => vi.restoreAllMocks());

  it("gives a link story without the submitter's text its page's description, and a text story none", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const now = new Date().toISOString();
    const api = (id: string, url: string): LobstersApiStory => ({
      short_id: id,
      title: id,
      url,
      comments_url: `https://lobste.rs/s/${id}`,
      score: 5,
      comment_count: 1,
      created_at: now,
    });
    const pages: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url === "https://lobste.rs/t/ai.json") {
        return Response.json([api("link", "https://example.com/post"), api("ask", "")]);
      }
      if (url.endsWith(".json")) return Response.json([]);
      pages.push(url);
      return new Response('<meta property="og:description" content="What the post says.">', {
        headers: { "content-type": "text/html" },
      });
    });
    const { stories } = await fetchLobstersData();
    expect(stories.map((s) => [s.id, s.description])).toEqual([
      ["link", "What the post says."],
      ["ask", undefined],
    ]);
    expect(pages).toEqual(["https://example.com/post"]);
  });
});
