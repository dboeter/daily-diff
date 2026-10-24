import { describe, expect, it } from "vitest";
import { type HfApiModel, toHfModel } from "../sources/huggingface.ts";

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
