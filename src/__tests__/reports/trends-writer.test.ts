import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The run's own provider: Trends' calls go to it only without a writer, or when the writer fails.
const { runProvider } = vi.hoisted(() => ({
  runProvider: vi.fn<(prompt: string, maxTokens: number) => Promise<string>>(),
}));

vi.mock("../../providers/index.ts", async (importOriginal) => {
  const orig = await importOriginal<typeof import("../../providers/index.ts")>();
  return { ...orig, createProvider: () => ({ name: "run", call: runProvider }) };
});

import { LLM_TOKENS_DEFAULT, LLM_TOKENS_LISTING, llmCalls, llmStats, resetLlmStats } from "../../core/llm.ts";
import { buildTrendsReport, type TrendsInput } from "../../reports/pages.ts";
import { EMPTY_TRENDING } from "../../trending/compose.ts";
import { LLM_TOKENS_WRITER } from "../../weekly/writer.ts";

// A week with Skills activity only: two calls, the Skills section and the prose.
const input: TrendsInput = {
  trending: EMPTY_TRENDING,
  skills: {
    prs: [
      {
        number: 7,
        title: "Add a code review skill",
        state: "open",
        user: { login: "a" },
        labels: [],
        created_at: "2026-11-10T00:00:00Z",
        updated_at: "2026-11-15T00:00:00Z",
        comments: 3,
        html_url: "https://github.com/anthropics/skills/pull/7",
      },
    ],
    issues: [],
    fetchSuccess: true,
    repo: "anthropics/skills",
  },
  hf: { models: [], fetchSuccess: true },
  papers: [],
  stories: { rows: [], summaries: new Map() },
  tracked: [],
};

const isProse = (prompt: string) => prompt.includes("<!-- tables -->");
const answers = (who: string) => (prompt: string) =>
  Promise.resolve(
    isProse(prompt)
      ? `## Highlights\n\n- Highlight by ${who}.\n\n<!-- tables -->\n\n## Signals\n\nNone.`
      : `## Open PRs worth watching\n\nSkills by ${who}.`,
  );
const writer = (call: (prompt: string, maxTokens: number) => Promise<string>) => ({
  name: "writer",
  call: vi.fn(call),
});
const build = (w: TrendsInput["writer"]) => buildTrendsReport({ ...input, writer: w }, "05:00", "2026-11-16");

beforeEach(() => {
  resetLlmStats();
  runProvider.mockReset();
  runProvider.mockImplementation(answers("the run's model"));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildTrendsReport's writer", () => {
  it("has the writer make every call, at the writer's budget", async () => {
    const w = writer(answers("the writer"));

    const report = await build(w);

    expect(w.call.mock.calls.map(([, maxTokens]) => maxTokens)).toEqual([
      LLM_TOKENS_WRITER,
      LLM_TOKENS_WRITER,
    ]);
    expect(runProvider).not.toHaveBeenCalled();
    expect(report?.content).toContain("Highlight by the writer.");
    expect(report?.content).toContain("Skills by the writer.");
  });

  it("has the run's own model write the page, at its usual budgets, without a writer", async () => {
    const report = await build(null);

    expect(runProvider.mock.calls.map(([, maxTokens]) => maxTokens)).toEqual([
      LLM_TOKENS_DEFAULT,
      LLM_TOKENS_LISTING,
    ]);
    expect(report?.content).toContain("Highlight by the run's model.");
    expect(report?.content).toContain("Skills by the run's model.");
  });

  it("gives a call the writer fails to the run's own model: in the trace, not in the tally of lost calls", async () => {
    const w = writer((prompt) =>
      isProse(prompt) ? Promise.reject(new Error("401 invalid x-api-key")) : answers("the writer")(prompt),
    );

    const report = await build(w);

    expect(runProvider).toHaveBeenCalledTimes(1);
    expect(runProvider.mock.calls[0]?.[1]).toBe(LLM_TOKENS_LISTING);
    expect(report?.content).toContain("Highlight by the run's model.");
    expect(report?.content).toContain("Skills by the writer.");
    expect(llmCalls.map((c) => [c.label, c.outcome])).toEqual([
      ["claude-code-skills", "ok"],
      ["trends", "rerouted"],
      ["trends", "ok"],
    ]);
    expect(llmStats).toEqual({ attempted: 2, failed: 0 });
  });
});
