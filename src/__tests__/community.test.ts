import { describe, expect, it } from "vitest";
import { toDevtoArticle, type DevtoApiArticle } from "../devto.ts";
import { toLobstersStory, type LobstersApiStory } from "../lobsters.ts";
import { toHfModel, type HfApiModel } from "../hf.ts";

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
      reading_time_minutes: 8,
      tag_list: ["ai", "llm", "langchain"],
      user: { name: "Alice Developer" },
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
      readingTimeMinutes: 8,
      tags: ["ai", "llm", "langchain"],
      user: "Alice Developer",
    });
  });
});

describe("toLobstersStory", () => {
  it("maps raw Lobste.rs JSON story to LobstersStory structure", () => {
    const raw: LobstersApiStory = {
      short_id: "xyz123",
      title: "Show Lobsters: Minimal Llama Inference Engine in C",
      url: "https://github.com/example/llama-c",
      comments_url: "https://lobste.rs/s/xyz123/minimal_llama",
      score: 45,
      comment_count: 12,
      submitter_user: { username: "c_dev" },
      created_at: "2026-03-09T16:00:00Z",
      tags: ["ai", "c"],
    };

    const story = toLobstersStory(raw);
    expect(story).toEqual({
      title: "Show Lobsters: Minimal Llama Inference Engine in C",
      url: "https://github.com/example/llama-c",
      commentsUrl: "https://lobste.rs/s/xyz123/minimal_llama",
      score: 45,
      commentCount: 12,
      author: "c_dev",
      publishedAt: "2026-03-09T16:00:00Z",
      tags: ["ai", "c"],
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
      submitter_user: { username: "asker" },
      created_at: "2026-03-09T10:00:00Z",
      tags: ["ai"],
    };

    const story = toLobstersStory(raw);
    expect(story.url).toBe("https://lobste.rs/s/ask456/fine_tuning");
  });
});

describe("toHfModel", () => {
  it("maps Hugging Face Hub API response to HfModel structure", () => {
    const raw: HfApiModel = {
      _id: "meta-llama/Llama-3.3-70B-Instruct",
      id: "meta-llama/Llama-3.3-70B-Instruct",
      author: "meta-llama",
      likes: 1250,
      downloads: 85000,
      tags: ["text-generation", "transformers", "en"],
      pipeline_tag: "text-generation",
      lastModified: "2026-03-08T18:00:00.000Z",
    };

    const model = toHfModel(raw);
    expect(model).toEqual({
      id: "meta-llama/Llama-3.3-70B-Instruct",
      author: "meta-llama",
      likes: 1250,
      downloads: 85000,
      tags: ["text-generation", "transformers", "en"],
      pipelineTag: "text-generation",
      lastModified: "2026-03-08T18:00:00.000Z",
      url: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
    });
  });

  it("infers author from model id if author field is missing", () => {
    const raw: HfApiModel = {
      _id: "deepseek-ai/DeepSeek-V3",
      id: "deepseek-ai/DeepSeek-V3",
      likes: 3500,
      downloads: 120000,
    };

    const model = toHfModel(raw);
    expect(model.author).toBe("deepseek-ai");
    expect(model.tags).toEqual([]);
    expect(model.pipelineTag).toBe("");
    expect(model.lastModified).toBe("");
  });
});
