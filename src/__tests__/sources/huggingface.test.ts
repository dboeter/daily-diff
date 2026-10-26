import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  type HfApiModel,
  type HfModel,
  formatParameters,
  hfDescription,
  hfReleaseRows,
  isVariantOf,
  toHfModel,
} from "../../sources/huggingface.ts";

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
      parameters: null,
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

describe("toHfModel on the live API", () => {
  // The `expand[]` request fetchHfData builds, answered by the Hub on 2026-10-26.
  const raw = JSON.parse(
    fs.readFileSync(new URL("../fixtures/hf-api-2026-10-26.json", import.meta.url), "utf-8"),
  ) as HfApiModel[];

  it("reads the task and the safetensors parameter count", () => {
    const [deepseek, flint] = raw.map(toHfModel);
    expect(deepseek).toMatchObject({
      id: "deepseek-ai/DeepSeek-V4.1-Flash-1017",
      pipelineTag: "image-text-to-text",
      parameters: 763205315794,
    });
    expect(flint).toMatchObject({
      id: "RecursiveSI/flint",
      pipelineTag: "text-generation",
      parameters: 39785287456,
    });
    expect(hfDescription(deepseek!)).toBe("Image text to text, 763B parameters");
  });
});

describe("hfReleaseRows", () => {
  // The 15 rows of the 2026-10-26 Trends page, in the Hub's order.
  const fixture = JSON.parse(
    fs.readFileSync(new URL("../fixtures/hf-2026-10-26.json", import.meta.url), "utf-8"),
  ) as { models: HfModel[] };

  it("gives one row per release on the 2026-10-26 list, without uncensored re-uploads", () => {
    const rows = hfReleaseRows(fixture.models);
    const ids = rows.map((r) => r.id);
    expect(ids).not.toContain("abenzerps/Qwen-Image-2.1-Uncensored-Quantized");
    expect(ids).not.toContain("dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8");
    expect(ids).not.toContain("ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF");
    expect(ids).not.toContain("unsloth/flint-GGUF");
    expect(rows[0]!.id).toBe("deepseek-ai/DeepSeek-V4.1-Flash-1017");
    expect(rows[0]!.variants.map((v) => v.id)).toEqual(["ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF"]);
    expect(rows.find((r) => r.id === "RecursiveSI/flint")!.variants.map((v) => v.id)).toEqual([
      "unsloth/flint-GGUF",
    ]);
    expect(ids).toContain("black-forest-labs/flux-3-image-klein-comfy");
    expect(ids).toContain("InternScience/Sage-A1.5");
    expect(rows).toHaveLength(11);
  });

  it("folds only copies whose extra name segments include a format token", () => {
    expect(isVariantOf("unsloth/flint-GGUF", "RecursiveSI/flint")).toBe(true);
    expect(isVariantOf("o/Qwen3.8-27B-AWQ-4bit", "Qwen/Qwen3.8-27B")).toBe(true);
    expect(isVariantOf("o/Qwen3.8-27B-Instruct", "Qwen/Qwen3.8-27B")).toBe(false);
    expect(isVariantOf("o/flintstone-GGUF", "RecursiveSI/flint")).toBe(false);
    expect(
      isVariantOf(
        "ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF",
        "deepseek-ai/DeepSeek-V4.1-Flash-1017",
      ),
    ).toBe(true);
  });

  it("keeps a copy of a different size apart from the release its name extends", () => {
    expect(isVariantOf("unsloth/Qwen3.6-35B-A3B-GGUF", "Qwen/Qwen3.6")).toBe(false);
    expect(isVariantOf("unsloth/Qwen3.6-GGUF", "Qwen/Qwen3.6")).toBe(true);
  });

  it.each([
    "-i1-GGUF",
    "-FP8-Dynamic",
    "-bf16",
    "-fp16",
    "-4bit-DWQ",
    "-8bit",
    "-int4",
    "-AWQ",
    "-GPTQ-Int4",
    "-MLX-4bit",
    "-exl2",
    "-Q4_K_M",
    "-GGUF-IQ3_XXS",
  ])("folds the quantised copy with suffix %s into its release", (suffix) => {
    expect(isVariantOf(`o/Qwen3.6-27B${suffix}`, "Qwen/Qwen3.6-27B")).toBe(true);
    expect(isVariantOf(`o/Qwen3.6-35B-A3B${suffix}`, "Qwen/Qwen3.6")).toBe(false);
    const m = (id: string) => ({ ...fixture.models[0]!, id });
    const rows = hfReleaseRows([m("Qwen/Qwen3.6"), m("unsloth/Qwen3.6-35B-A3B-GGUF")]);
    expect(rows.map((r) => [r.id, r.variants.length])).toEqual([
      ["Qwen/Qwen3.6", 0],
      ["unsloth/Qwen3.6-35B-A3B-GGUF", 0],
    ]);
  });

  it("puts a release at its best-ranked copy's place, led by the original", () => {
    const m = (id: string) => ({ ...fixture.models[0]!, id });
    const rows = hfReleaseRows([m("a/Other"), m("u/X-GGUF"), m("o/X")]);
    expect(rows.map((r) => r.id)).toEqual(["a/Other", "o/X"]);
    expect(rows[1]!.variants.map((v) => v.id)).toEqual(["u/X-GGUF"]);
  });

  it("describes a row by its task and size, never a tag", () => {
    expect(hfDescription({ id: "a/x", pipelineTag: "image-text-to-text", parameters: 27.4e9 })).toBe(
      "Image text to text, 27B parameters",
    );
    expect(hfDescription({ id: "a/x", pipelineTag: "", parameters: 4.3e8 })).toBe("430M parameters");
    expect(hfDescription({ id: "a/x", pipelineTag: "", parameters: null })).toBe("");
  });
});

describe("formatParameters", () => {
  it("shows the size the name states, so Qwen3.8-27B's 27.78B count reads 27B", () => {
    expect(formatParameters(27.78e9, "Qwen/Qwen3.8-27B")).toBe("27B");
    expect(formatParameters(0.596e9, "Qwen/Qwen3-0.6B")).toBe("0.6B");
    expect(formatParameters(4.1e9, "XHToken/Spark-X2.6-4B")).toBe("4B");
    expect(formatParameters(35.9e9, "unsloth/Qwen3.6-35B-A3B-GGUF")).toBe("35B");
  });

  it("ignores a name size far from the count, and version or active-parameter tokens", () => {
    expect(formatParameters(70.6e9, "a/Model-7B")).toBe("70B");
    expect(formatParameters(3.3e9, "a/Mix-A3B")).toBe("3.3B");
    expect(formatParameters(220e9, "MiniMaxAI/MiniMax-M3.1-Flash")).toBe("220B");
  });

  it("rounds down without a name size: 0.6B, 7.6B, 27.4B, 1.2T", () => {
    expect(formatParameters(0.6e9)).toBe("600M");
    expect(formatParameters(135e3)).toBe("135K");
    expect(formatParameters(400)).toBe("<1K");
    expect(formatParameters(7.69e9)).toBe("7.6B");
    expect(formatParameters(27.4e9)).toBe("27B");
    expect(formatParameters(27.78e9)).toBe("27B");
    expect(formatParameters(1.26e12)).toBe("1.2T");
  });
});
