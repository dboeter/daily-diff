import { describe, expect, it } from "vitest";
import { type DevtoApiArticle, toDevtoArticle } from "../../sources/devto.ts";

describe("toDevtoArticle", () => {
  it("maps raw Forem API article to DevtoArticle structure", () => {
    const raw: DevtoApiArticle = {
      id: 98765,
      title: "Building Agents with LangChain and Local LLMs",
      description: "A complete walkthrough of deploying local agent systems.",
      url: "https://dev.to/alice/building-agents-98765",
      published_at: "2026-03-09T14:20:00Z",
      positive_reactions_count: 142,
      comments_count: 28,
    };

    const article = toDevtoArticle(raw);
    expect(article).toEqual({
      id: 98765,
      title: "Building Agents with LangChain and Local LLMs",
      description: "A complete walkthrough of deploying local agent systems.",
      url: "https://dev.to/alice/building-agents-98765",
      publishedAt: "2026-03-09T14:20:00Z",
      positiveReactionsCount: 142,
      commentsCount: 28,
    });
  });
});
