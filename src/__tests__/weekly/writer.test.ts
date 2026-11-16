import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { stream } = vi.hoisted(() => ({ stream: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { stream };
  },
}));

import { WEEKLY_WRITER, weeklyWriter } from "../../weekly/writer.ts";

beforeEach(() => {
  stream.mockReset();
  stream.mockReturnValue({
    finalMessage: () =>
      Promise.resolve({ stop_reason: "end_turn", content: [{ type: "text", text: "An article." }] }),
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("weeklyWriter", () => {
  it("is null without ANTHROPIC_API_KEY, unset or empty (an unset GitHub secret)", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(weeklyWriter()).toBeNull();
  });

  it("asks the pinned model at the pinned effort, whatever ANTHROPIC_MODEL is", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubEnv("ANTHROPIC_MODEL", "claude-haiku-5-5");

    expect(await weeklyWriter()?.call("The prompt.", 32_000)).toBe("An article.");

    expect(WEEKLY_WRITER).toEqual({ model: "claude-opus-5-5", effort: "high" });
    expect(stream).toHaveBeenCalledWith({
      model: "claude-opus-5-5",
      max_tokens: 32_000,
      messages: [{ role: "user", content: "The prompt." }],
      output_config: { effort: "high" },
    });
  });
});
