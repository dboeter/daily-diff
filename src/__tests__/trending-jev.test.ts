import { describe, it, expect } from "vitest";
import { fallbackClassification, inScope, onRadar, STANDALONE_MIN_NOUL } from "../trending-jev.ts";
import type { GithubRow } from "../trending-rank.ts";
import type { OpenRouterApp } from "../openrouter.ts";
import type { NpmPackage } from "../npm.ts";

function githubRow(topic?: string): GithubRow {
  return {
    key: "github:o/r",
    fullName: "o/r",
    url: "https://github.com/o/r",
    description: "",
    language: "",
    totalStars: 0,
    perWeek: null,
    starsCell: "0",
    isNew: false,
    ...(topic !== undefined ? { topic } : {}),
  };
}

const classify = (topic?: string) =>
  fallbackClassification({ kind: "github", key: "github:o/r", row: githubRow(topic) });

describe("fallbackClassification", () => {
  it.each([
    ["harness", "harness_framework"],
    ["agent-harness", "harness_framework"],
    ["new:harness", "harness_framework"],
    ["ai-coding", "coding_agent"],
    ["new:coding-agent", "coding_agent"],
    ["new:agentic-coding", "coding_agent"],
    ["multi-agent", "multi_agent"],
    ["agent-orchestration", "multi_agent"],
    ["ai-agent", "other_agent"],
  ])("maps topic %s to %s with standalone unknown", (topic, category) => {
    expect(classify(topic)).toEqual({ category, standalone: null });
  });

  it("puts an unknown label and trending-page-only repos out of scope", () => {
    expect(classify("llm")).toEqual({ category: "out_of_scope", standalone: null });
    expect(classify()).toEqual({ category: "out_of_scope", standalone: null });
  });

  it("keeps new:* repos on the Radar", () => {
    expect(onRadar(classify("new:coding-agent"))).toBe(true);
  });

  it("keeps OpenRouter apps and npm packages in scope with unknown category", () => {
    const app = { appId: 1 } as OpenRouterApp;
    const pkg = { name: "x" } as NpmPackage;
    expect(fallbackClassification({ kind: "openrouter", key: "openrouter:1", app })).toEqual({
      category: null,
      standalone: null,
    });
    expect(fallbackClassification({ kind: "npm", key: "npm:x", pkg })).toEqual({
      category: null,
      standalone: null,
    });
  });
});

describe("inScope / onRadar", () => {
  it("treats only out_of_scope as out of scope", () => {
    expect(inScope({ category: "out_of_scope", standalone: 1 })).toBe(false);
    expect(inScope({ category: null, standalone: null })).toBe(true);
    expect(inScope({ category: "agent_tooling", standalone: 0 })).toBe(true);
  });

  it("requires standalone >= 0.5 or unknown for the Radar", () => {
    expect(STANDALONE_MIN_NOUL).toBe(0.5);
    expect(onRadar({ category: null, standalone: 0.5 })).toBe(true);
    expect(onRadar({ category: null, standalone: 0.49 })).toBe(false);
    expect(onRadar({ category: null, standalone: null })).toBe(true);
    expect(onRadar({ category: "out_of_scope", standalone: 1 })).toBe(false);
  });
});
