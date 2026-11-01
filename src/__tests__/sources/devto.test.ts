import { afterEach, describe, expect, it, vi } from "vitest";
import { type DevtoApiArticle, fetchDevtoData, toDevtoArticle } from "../../sources/devto.ts";

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

describe("fetchDevtoData", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("fetches tags one at a time and retries a 429 once after Retry-After", async () => {
    vi.useFakeTimers();
    const article: DevtoApiArticle = {
      id: 1,
      title: "Agents in production",
      description: "",
      url: "https://dev.to/a/1",
      published_at: "2026-11-01T00:00:00Z",
      positive_reactions_count: 50,
      comments_count: 3,
    };
    let inFlight = 0;
    let maxInFlight = 0;
    let calls = 0;
    const fetchMock = vi.fn(async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight--;
      calls++;
      if (calls === 1) return new Response("", { status: 429, headers: { "Retry-After": "2" } });
      return new Response(JSON.stringify(calls === 2 ? [article] : []), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const pending = fetchDevtoData();
    await vi.advanceTimersByTimeAsync(1999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    const data = await pending;
    expect(data).toEqual({ articles: [toDevtoArticle(article)], fetchSuccess: true });
    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(maxInFlight).toBe(1);
  });
});
