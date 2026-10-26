import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import { EmptyResponseError, TruncatedResponseError } from "../../providers/index.ts";

// ---------------------------------------------------------------------------
// Mock provider — intercepts createProvider() so the module-level `provider`
// in llm.ts uses our controllable mock instead of a real SDK client.
// ---------------------------------------------------------------------------

const { mockCall } = vi.hoisted(() => ({
  mockCall: vi.fn<(prompt: string, maxTokens: number) => Promise<string>>(),
}));

vi.mock("../../providers/index.ts", async (importOriginal) => {
  const orig = await importOriginal<typeof import("../../providers/index.ts")>();
  return {
    ...orig,
    createProvider: () => ({ name: "mock", call: mockCall }),
  };
});

import {
  is429,
  isConnectionError,
  isProviderUnavailable,
  isRetryable,
  callLlm,
  generateOr,
  saveFile,
  autoGenFooter,
  parseLlmJson,
  llmStats,
  llmFailureRatio,
  resetLlmStats,
  llmHealthLine,
  assertLlmHealthy,
  reportLlmHealth,
  llmTraceFile,
} from "../../core/llm.ts";

// ---------------------------------------------------------------------------
// is429
// ---------------------------------------------------------------------------

describe("is429", () => {
  it("detects status 429 from error-like objects", () => {
    expect(is429({ status: 429 })).toBe(true);
  });

  it("detects 429 from string representation", () => {
    expect(is429(new Error("Request failed with 429"))).toBe(true);
  });

  it("returns false for other status codes", () => {
    expect(is429({ status: 500 })).toBe(false);
    expect(is429({ status: 200 })).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(is429(null)).toBe(false);
    expect(is429(undefined)).toBe(false);
  });

  it("returns false for unrelated errors", () => {
    expect(is429(new Error("Something else"))).toBe(false);
  });

  it("detects OpenAI SDK RateLimitError shape (status + code)", () => {
    const openaiError = Object.assign(new Error("Rate limit reached"), {
      status: 429,
      code: "rate_limit_exceeded",
      type: "tokens",
    });
    expect(is429(openaiError)).toBe(true);
  });

  it("detects Anthropic SDK APIError shape (status + headers)", () => {
    const anthropicError = Object.assign(new Error("rate_limit_error"), {
      status: 429,
      headers: { "retry-after": "30" },
    });
    expect(is429(anthropicError)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// saveFile
// ---------------------------------------------------------------------------

describe("saveFile", () => {
  beforeEach(() => {
    vi.spyOn(fs, "mkdirSync").mockReturnValue(undefined);
    vi.spyOn(fs, "writeFileSync").mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the expected file path", () => {
    const result = saveFile("content", "2026-03-09", "ai-cli.md");
    expect(result).toBe("digests/2026-03-09/ai-cli.md");
  });

  it("creates parent directories recursively", () => {
    saveFile("content", "2026-03-09", "ai-cli.md");
    expect(fs.mkdirSync).toHaveBeenCalledWith("digests/2026-03-09", { recursive: true });
  });

  it("writes content as utf-8", () => {
    saveFile("hello world", "2026-03-09", "test.md");
    expect(fs.writeFileSync).toHaveBeenCalledWith("digests/2026-03-09/test.md", "hello world", "utf-8");
  });
});

// ---------------------------------------------------------------------------
// autoGenFooter
// ---------------------------------------------------------------------------

describe("autoGenFooter", () => {
  const originalEnv = process.env["DIGEST_REPO"];

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env["DIGEST_REPO"] = originalEnv;
    } else {
      delete process.env["DIGEST_REPO"];
    }
  });

  it("returns empty string when DIGEST_REPO is not set", () => {
    delete process.env["DIGEST_REPO"];
    expect(autoGenFooter()).toBe("");
  });

  it("returns empty string when DIGEST_REPO is empty", () => {
    process.env["DIGEST_REPO"] = "";
    expect(autoGenFooter()).toBe("");
  });

  it("returns footer when DIGEST_REPO is set", () => {
    process.env["DIGEST_REPO"] = "user/repo";
    const result = autoGenFooter();
    expect(result).toContain("auto-generated");
    expect(result).toContain("Daily Diff");
    expect(result).toContain("github.com/user/repo");
  });
});

// ---------------------------------------------------------------------------
// parseLlmJson
// ---------------------------------------------------------------------------

describe("parseLlmJson", () => {
  it("parses plain JSON", () => {
    expect(parseLlmJson('{"a": 1, "b": ["x"]}')).toEqual({ a: 1, b: ["x"] });
  });

  it("strips ```json code fences", () => {
    const raw = '```json\n{"a": 1}\n```';
    expect(parseLlmJson(raw)).toEqual({ a: 1 });
  });

  it("strips bare ``` code fences", () => {
    expect(parseLlmJson('```\n{"a": 1}\n```')).toEqual({ a: 1 });
  });

  it("tolerates an unescaped newline inside a string literal", () => {
    // This is the failure that wiped highlights.json: a raw control character
    // inside a string literal makes JSON.parse throw without sanitization.
    const raw = '{"x": ["line one\nline two"]}';
    expect(() => JSON.parse(raw)).toThrow();
    expect(parseLlmJson(raw)).toEqual({ x: ["line one line two"] });
  });

  it("tolerates other raw control characters (tab) in strings", () => {
    const raw = '{"x": ["a\tb"]}';
    expect(parseLlmJson(raw)).toEqual({ x: ["a b"] });
  });

  it("tolerates a trailing comma before a closing brace", () => {
    // The exact failure that wiped highlights on 2026-07-07:
    // "Expected double-quoted property name in JSON" from a trailing comma.
    const raw = '{"a": [1, 2,], "b": 3,}';
    expect(() => JSON.parse(raw)).toThrow();
    expect(parseLlmJson(raw)).toEqual({ a: [1, 2], b: 3 });
  });

  it("strips prose around the JSON payload", () => {
    const raw = 'Here are the highlights:\n{"a": 1}\nHope that helps!';
    expect(parseLlmJson(raw)).toEqual({ a: 1 });
  });

  it("throws on genuinely malformed JSON", () => {
    expect(() => parseLlmJson("{not json")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// isConnectionError / isRetryable
// ---------------------------------------------------------------------------

describe("isConnectionError", () => {
  it("detects the OpenAI SDK APIConnectionError shape", () => {
    const err = Object.assign(new Error("Connection error."), {
      name: "APIConnectionError",
      status: undefined,
    });
    expect(isConnectionError(err)).toBe(true);
  });

  it("detects a connection code buried in the cause chain", () => {
    // The real shape seen on 2026-08-28: APIConnectionError -> TypeError:
    // fetch failed -> AggregateError carrying code ETIMEDOUT.
    const aggregate = Object.assign(new Error("connect timeout"), { code: "ETIMEDOUT" });
    const fetchFailed = Object.assign(new TypeError("boom"), { cause: aggregate });
    const outer = Object.assign(new Error("wrapped"), { cause: fetchFailed });
    expect(isConnectionError(outer)).toBe(true);
  });

  it("detects a bare undici 'fetch failed'", () => {
    expect(isConnectionError(new TypeError("fetch failed"))).toBe(true);
  });

  it("returns false for HTTP errors and unrelated failures", () => {
    expect(isConnectionError({ status: 500, message: "server error" })).toBe(false);
    expect(isConnectionError(new Error("Unexpected empty response from qwen"))).toBe(false);
    expect(isConnectionError(null)).toBe(false);
  });

  it("terminates on a self-referencing cause chain", () => {
    const err: { message: string; cause?: unknown } = { message: "loop" };
    err.cause = err;
    expect(isConnectionError(err)).toBe(false);
  });
});

describe("isProviderUnavailable", () => {
  // The body OpenRouter sent for every call of the 2026-10-16 run.
  const gatewayTimeout = new Error(
    'openrouter returned no choices: {"message":"A Timeout Occurred","code":504,"metadata":{"error_type":"timeout"}}',
  );

  it("detects a 504 in a 2xx body, a 502/503/504 status and the SDK request timeout", () => {
    expect(isProviderUnavailable(gatewayTimeout)).toBe(true);
    expect(isProviderUnavailable({ status: 503 })).toBe(true);
    expect(
      isProviderUnavailable(
        Object.assign(new Error("Request timed out."), { name: "APIConnectionTimeoutError" }),
      ),
    ).toBe(true);
  });

  it("leaves other errors alone", () => {
    expect(isProviderUnavailable({ status: 500, message: "server error" })).toBe(false);
    expect(isProviderUnavailable(new Error('openrouter returned no choices: {"code":400}'))).toBe(false);
    expect(isProviderUnavailable(null)).toBe(false);
  });

  it("is not a connection error, so it does not get the 6-retry ladder", () => {
    const timeout = Object.assign(new Error("Request timed out."), { name: "APIConnectionTimeoutError" });
    expect(isConnectionError(timeout)).toBe(false);
  });
});

describe("isRetryable", () => {
  it("covers both rate limits and connection failures", () => {
    expect(isRetryable({ status: 429 })).toBe(true);
    expect(isRetryable(new TypeError("fetch failed"))).toBe(true);
  });

  it("excludes errors that would fail identically on a retry", () => {
    expect(isRetryable({ status: 400, message: "bad request" })).toBe(false);
    expect(isRetryable({ status: 500, message: "server error" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// callLlm
// ---------------------------------------------------------------------------

describe("callLlm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockCall.mockReset();
    resetLlmStats();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes prompt and maxTokens to provider.call()", async () => {
    mockCall.mockResolvedValueOnce("response text");

    const result = await callLlm("hello", 2048);

    expect(result).toBe("response text");
    expect(mockCall).toHaveBeenCalledOnce();
    expect(mockCall).toHaveBeenCalledWith("hello", 2048);
  });

  it("uses default maxTokens of 8192", async () => {
    mockCall.mockResolvedValueOnce("ok");

    await callLlm("prompt");

    expect(mockCall).toHaveBeenCalledWith("prompt", 8192);
  });

  it("retries on 429 with exponential backoff", async () => {
    const err429 = Object.assign(new Error("rate limited"), { status: 429 });
    mockCall.mockRejectedValueOnce(err429);
    mockCall.mockResolvedValueOnce("success after retry");

    const promise = callLlm("prompt", 1024);

    // First call rejects with 429 — advance past the 5 s backoff
    await vi.advanceTimersByTimeAsync(5_000);

    const result = await promise;
    expect(result).toBe("success after retry");
    expect(mockCall).toHaveBeenCalledTimes(2);
  });

  it("retries up to MAX_RETRIES times then throws", async () => {
    const err429 = Object.assign(new Error("rate limited"), { status: 429 });
    mockCall
      .mockRejectedValueOnce(err429)
      .mockRejectedValueOnce(err429)
      .mockRejectedValueOnce(err429)
      .mockRejectedValueOnce(err429);

    const promise = callLlm("prompt", 1024);
    // Attach a no-op catch immediately so Node doesn't flag unhandled rejection
    // before the expect() below gets a chance to inspect the rejection.
    promise.catch(() => {});

    // Advance through all 3 retry backoffs: 5s, 10s, 20s
    await vi.advanceTimersByTimeAsync(5_000);
    await vi.advanceTimersByTimeAsync(10_000);
    await vi.advanceTimersByTimeAsync(20_000);

    await expect(promise).rejects.toThrow("rate limited");
    // 1 initial + 3 retries = 4 total calls
    expect(mockCall).toHaveBeenCalledTimes(4);
  });

  it("retries on a connection error", async () => {
    const connErr = Object.assign(new Error("Connection error."), { name: "APIConnectionError" });
    mockCall.mockRejectedValueOnce(connErr);
    mockCall.mockResolvedValueOnce("success after retry");

    const promise = callLlm("prompt", 1024);
    await vi.advanceTimersByTimeAsync(5_000);

    expect(await promise).toBe("success after retry");
    expect(mockCall).toHaveBeenCalledTimes(2);
  });

  it("retries an unavailable model once, then fails", async () => {
    const err504 = new Error('openrouter returned no choices: {"message":"A Timeout Occurred","code":504}');
    mockCall.mockRejectedValue(err504);

    const promise = callLlm("prompt", 1024);
    promise.catch(() => {});
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(promise).rejects.toThrow("A Timeout Occurred");
    expect(mockCall).toHaveBeenCalledTimes(2);
    expect(llmStats).toEqual({ attempted: 1, failed: 1 });
  });

  it("retries an empty response once", async () => {
    mockCall.mockRejectedValueOnce(new EmptyResponseError("mock", "stop"));
    mockCall.mockResolvedValueOnce("summaries");

    const promise = callLlm("prompt", 1024);
    await vi.advanceTimersByTimeAsync(5_000);

    expect(await promise).toBe("summaries");
    expect(mockCall).toHaveBeenCalledTimes(2);
    expect(llmStats).toEqual({ attempted: 1, failed: 0 });
  });

  it("fails after a second empty response", async () => {
    mockCall.mockRejectedValue(new EmptyResponseError("mock", "stop"));

    const promise = callLlm("prompt", 1024);
    promise.catch(() => {});
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(promise).rejects.toBeInstanceOf(EmptyResponseError);
    expect(mockCall).toHaveBeenCalledTimes(2);
    expect(llmStats).toEqual({ attempted: 1, failed: 1 });
  });

  it("throws immediately on errors that are neither 429 nor connection failures", async () => {
    mockCall.mockRejectedValueOnce(new Error("server error"));

    await expect(callLlm("prompt")).rejects.toThrow("server error");
    expect(mockCall).toHaveBeenCalledOnce();
  });

  it("retries a cut-off response once with double the budget", async () => {
    mockCall.mockRejectedValueOnce(new TruncatedResponseError("mock", 6144));
    mockCall.mockResolvedValueOnce("full report");

    expect(await callLlm("prompt", 6144)).toBe("full report");
    expect(mockCall.mock.calls.map((c) => c[1])).toEqual([6144, 12288]);
    expect(llmStats).toEqual({ attempted: 1, failed: 0 });
  });

  it("fails after a second cut-off response", async () => {
    mockCall.mockRejectedValue(new TruncatedResponseError("mock", 1024));

    await expect(callLlm("prompt", 1024)).rejects.toBeInstanceOf(TruncatedResponseError);
    expect(mockCall).toHaveBeenCalledTimes(2);
    expect(llmStats).toEqual({ attempted: 1, failed: 1 });
  });

  it("does not leak concurrency slots on 429 retries", async () => {
    const err429 = Object.assign(new Error("429"), { status: 429 });
    mockCall.mockRejectedValueOnce(err429);
    mockCall.mockResolvedValueOnce("ok");

    const promise = callLlm("prompt");
    await vi.advanceTimersByTimeAsync(5_000);
    await promise;

    // If slots leaked, subsequent calls would hang. Fire LLM_CONCURRENCY (5)
    // calls to prove all slots are available.
    mockCall.mockResolvedValue("ok");
    const batch = Array.from({ length: 5 }, (_, i) => callLlm(`p${i}`));
    const results = await Promise.all(batch);
    expect(results).toEqual(["ok", "ok", "ok", "ok", "ok"]);
  });

  it("gives a connection error a longer ladder than a 429", async () => {
    // The 2026-09-03 outage lasted ~4 min; the old shared 3-retry ladder gave
    // up after 35 s. Connection failures now get 6 retries capped at 60 s.
    const connErr = Object.assign(new Error("Connection error."), { name: "APIConnectionError" });
    mockCall.mockRejectedValue(connErr);

    const promise = callLlm("prompt");
    promise.catch(() => {});

    for (const ms of [5_000, 10_000, 20_000, 40_000, 60_000, 60_000]) {
      await vi.advanceTimersByTimeAsync(ms);
    }

    await expect(promise).rejects.toThrow("Connection error.");
    // 1 initial + 6 retries
    expect(mockCall).toHaveBeenCalledTimes(7);
  });

  it("caps the connection backoff at 60 s instead of doubling to 160 s", async () => {
    const connErr = Object.assign(new Error("Connection error."), { name: "APIConnectionError" });
    mockCall.mockRejectedValue(connErr);
    mockCall.mockRejectedValueOnce(connErr).mockRejectedValueOnce(connErr);

    const promise = callLlm("prompt");
    promise.catch(() => {});

    // Walk to the 6th backoff. Uncapped it would be 5 * 2**5 = 160 s; capped it
    // fires at 60 s, so the 7th attempt must already have happened by then.
    for (const ms of [5_000, 10_000, 20_000, 40_000, 60_000]) {
      await vi.advanceTimersByTimeAsync(ms);
    }
    expect(mockCall).toHaveBeenCalledTimes(6);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mockCall).toHaveBeenCalledTimes(7);

    await expect(promise).rejects.toThrow();
  });

  it("keeps the 429 ladder at 3 retries", async () => {
    const err429 = Object.assign(new Error("rate limited"), { status: 429 });
    mockCall.mockRejectedValue(err429);

    const promise = callLlm("prompt");
    promise.catch(() => {});

    for (const ms of [5_000, 10_000, 20_000, 60_000]) {
      await vi.advanceTimersByTimeAsync(ms);
    }

    await expect(promise).rejects.toThrow("rate limited");
    expect(mockCall).toHaveBeenCalledTimes(4);
  });
});

// ---------------------------------------------------------------------------
// generateOr
// ---------------------------------------------------------------------------

describe("generateOr", () => {
  beforeEach(() => {
    mockCall.mockReset();
    resetLlmStats();
  });

  it("returns the body, without a model-written H1", async () => {
    mockCall.mockResolvedValueOnce("# Title\n\n## Highlights\n\nText.");
    expect(await generateOr("t", "p", null)).toBe("## Highlights\n\nText.");
  });

  it("returns the fallback when the call fails", async () => {
    mockCall.mockRejectedValueOnce(new Error("boom"));
    expect(await generateOr("t", "p", null)).toBeNull();
  });

  it("traces each call by label: ok with its length, or fallback when it failed", async () => {
    mockCall.mockResolvedValueOnce("Text.").mockRejectedValueOnce(new Error("boom"));
    await generateOr("agents", "p", null);
    await generateOr("policy", "p", null);
    const calls = JSON.parse(llmTraceFile()).calls;
    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({ label: "agents", outcome: "ok", chars: 5 });
    expect(calls[1]).toMatchObject({ label: "policy", outcome: "fallback" });
  });
});

// ---------------------------------------------------------------------------
// llmStats / llmFailureRatio
// ---------------------------------------------------------------------------

describe("llm health accounting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockCall.mockReset();
    resetLlmStats();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at zero and reports a 0 ratio with no samples", () => {
    expect(llmStats).toEqual({ attempted: 0, failed: 0 });
    expect(llmFailureRatio()).toBe(0);
  });

  it("counts one attempt per callLlm, not per retry", async () => {
    const err429 = Object.assign(new Error("rate limited"), { status: 429 });
    mockCall.mockRejectedValueOnce(err429).mockResolvedValueOnce("ok");

    const promise = callLlm("prompt");
    await vi.advanceTimersByTimeAsync(5_000);
    await promise;

    expect(llmStats).toEqual({ attempted: 1, failed: 0 });
    expect(llmFailureRatio()).toBe(0);
  });

  it("counts a failure only once the retries are exhausted", async () => {
    mockCall.mockRejectedValueOnce(new Error("bad request"));
    mockCall.mockResolvedValueOnce("ok");

    await expect(callLlm("a")).rejects.toThrow("bad request");
    await callLlm("b");

    expect(llmStats).toEqual({ attempted: 2, failed: 1 });
    expect(llmFailureRatio()).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// assertLlmHealthy / reportLlmHealth
// ---------------------------------------------------------------------------

describe("assertLlmHealthy", () => {
  beforeEach(() => {
    resetLlmStats();
  });

  const record = (attempted: number, failed: number) => {
    llmStats.attempted = attempted;
    llmStats.failed = failed;
  };

  it("passes when nothing has been attempted", () => {
    expect(() => assertLlmHealthy("summary")).not.toThrow();
  });

  it("passes below the minimum sample size even at 100% failure", () => {
    // After the summary phase a daily run has made one or two calls.
    record(2, 2);
    expect(() => assertLlmHealthy("summary")).not.toThrow();
  });

  it("throws on a daily run that lost 2 of its 3 calls", () => {
    record(3, 2);
    expect(() => assertLlmHealthy("report")).toThrow(/appears to be down/);
  });

  it("passes a daily run that lost 1 of its 3 calls", () => {
    record(3, 1);
    expect(() => assertLlmHealthy("report")).not.toThrow();
  });

  it("passes at the ordinary noise floor", () => {
    record(40, 2);
    expect(() => assertLlmHealthy("summary")).not.toThrow();
  });

  it("passes just under the abort ratio", () => {
    record(10, 4);
    expect(() => assertLlmHealthy("summary")).not.toThrow();
  });

  it("throws at the abort ratio", () => {
    record(10, 5);
    expect(() => assertLlmHealthy("summary")).toThrow(/appears to be down/);
  });

  it("throws on the 2026-09-03 shape — every call lost", () => {
    record(30, 30);
    expect(() => assertLlmHealthy("summary")).toThrow(/30\/30 LLM calls failed \(100%\)/);
  });

  it("names the stage that tripped it", () => {
    record(10, 10);
    expect(() => assertLlmHealthy("report")).toThrow(/end of the report phase/);
  });
});

describe("reportLlmHealth", () => {
  const originalSummary = process.env["GITHUB_STEP_SUMMARY"];

  beforeEach(() => {
    resetLlmStats();
    delete process.env["GITHUB_STEP_SUMMARY"];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalSummary !== undefined) process.env["GITHUB_STEP_SUMMARY"] = originalSummary;
    else delete process.env["GITHUB_STEP_SUMMARY"];
  });

  it("does not write a step summary on a clean run", () => {
    llmStats.attempted = 40;
    const append = vi.spyOn(fs, "appendFileSync").mockReturnValue(undefined);
    vi.spyOn(console, "log").mockImplementation(() => {});
    process.env["GITHUB_STEP_SUMMARY"] = "/tmp/step-summary";

    reportLlmHealth();

    expect(append).not.toHaveBeenCalled();
  });

  it("appends a warning to the Actions step summary when calls were lost", () => {
    llmStats.attempted = 40;
    llmStats.failed = 3;
    const append = vi.spyOn(fs, "appendFileSync").mockReturnValue(undefined);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env["GITHUB_STEP_SUMMARY"] = "/tmp/step-summary";

    reportLlmHealth();

    expect(append).toHaveBeenCalledWith(
      "/tmp/step-summary",
      expect.stringContaining("3/40 LLM calls failed (8%)"),
      "utf-8",
    );
  });

  it("stays silent outside Actions", () => {
    llmStats.attempted = 40;
    llmStats.failed = 3;
    const append = vi.spyOn(fs, "appendFileSync").mockReturnValue(undefined);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    reportLlmHealth();

    expect(append).not.toHaveBeenCalled();
  });
});

describe("llmHealthLine", () => {
  it("reports zero cleanly", () => {
    resetLlmStats();
    expect(llmHealthLine()).toBe("0/0 LLM calls failed (0%)");
  });

  it("rounds the percentage", () => {
    resetLlmStats();
    llmStats.attempted = 3;
    llmStats.failed = 1;
    expect(llmHealthLine()).toBe("1/3 LLM calls failed (33%)");
  });
});
