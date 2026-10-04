import { describe, expect, it } from "vitest";
import { parsePhEdges } from "../ph.ts";

describe("parsePhEdges", () => {
  it("filters products by AI topic slugs and sorts by votes descending", () => {
    const rawEdges = [
      {
        node: {
          id: "prod-1",
          name: "Non-AI App",
          tagline: "Just an ordinary calculator",
          url: "https://producthunt.com/posts/non-ai",
          website: "https://example.com/calc",
          votesCount: 500,
          commentsCount: 10,
          createdAt: "2026-03-08T10:00:00Z",
          topics: {
            edges: [
              { node: { slug: "productivity", name: "Productivity" } },
              { node: { slug: "design-tools", name: "Design Tools" } },
            ],
          },
        },
      },
      {
        node: {
          id: "prod-2",
          name: "Agent CLI",
          tagline: "Autonomous coding terminal",
          url: "https://producthunt.com/posts/agent-cli",
          website: "https://example.com/agent",
          votesCount: 250,
          commentsCount: 35,
          createdAt: "2026-03-08T11:00:00Z",
          topics: {
            edges: [
              { node: { slug: "ai", name: "Artificial Intelligence" } },
              { node: { slug: "developer-tools", name: "Developer Tools" } },
            ],
          },
        },
      },
      {
        node: {
          id: "prod-3",
          name: "LLM Studio",
          tagline: "Local fine-tuning UI",
          url: "https://producthunt.com/posts/llm-studio",
          website: "https://example.com/llm",
          votesCount: 420,
          commentsCount: 50,
          createdAt: "2026-03-08T12:00:00Z",
          topics: {
            edges: [{ node: { slug: "llm", name: "LLM" } }],
          },
        },
      },
    ];

    const products = parsePhEdges(rawEdges);
    expect(products).toHaveLength(2);
    // Highest votes first: prod-3 (420) then prod-2 (250)
    expect(products[0]?.id).toBe("prod-3");
    expect(products[0]?.name).toBe("LLM Studio");
    expect(products[0]?.votesCount).toBe(420);
    expect(products[0]?.topics).toEqual(["LLM"]);

    expect(products[1]?.id).toBe("prod-2");
    expect(products[1]?.name).toBe("Agent CLI");
    expect(products[1]?.votesCount).toBe(250);
    expect(products[1]?.topics).toEqual(["Artificial Intelligence", "Developer Tools"]);
  });

  it("returns empty array when no products match AI topics", () => {
    const rawEdges = [
      {
        node: {
          id: "prod-1",
          name: "Desk Setup",
          tagline: "Hardware showcase",
          url: "https://producthunt.com/posts/desk",
          website: "https://example.com/desk",
          votesCount: 100,
          commentsCount: 5,
          createdAt: "2026-03-08T10:00:00Z",
          topics: { edges: [{ node: { slug: "hardware", name: "Hardware" } }] },
        },
      },
    ];
    expect(parsePhEdges(rawEdges)).toEqual([]);
  });

  it("handles missing topic edges gracefully", () => {
    const rawEdges = [
      {
        node: {
          id: "prod-missing-topics",
          name: "Empty Topics",
          tagline: "No topics listed",
          url: "https://producthunt.com/posts/empty",
          website: "https://example.com/empty",
          votesCount: 50,
          commentsCount: 2,
          createdAt: "2026-03-08T10:00:00Z",
        },
      },
    ];
    expect(parsePhEdges(rawEdges)).toEqual([]);
  });
});
