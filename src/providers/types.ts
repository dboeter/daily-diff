/**
 * Abstract LLM provider interface.
 *
 * All concrete providers must implement this contract so the rest of the
 * codebase can stay provider-agnostic.
 */

export interface LlmProvider {
  /** Human-readable provider identifier (e.g. "anthropic", "openai"). */
  readonly name: string;
  /** Send a prompt and return the model's text response. */
  call(prompt: string, maxTokens: number): Promise<string>;
}

/**
 * The model stopped at `maxTokens` (OpenAI-style `finish_reason: "length"`,
 * Anthropic `stop_reason: "max_tokens"`). Thrown even when some text came back:
 * on 2026-10-11 the HN report was published cut off mid-table, missing its last
 * two sections. On OpenRouter a reasoning model's reasoning counts against the
 * same budget. `callLlm` retries once with a doubled budget.
 */
export class TruncatedResponseError extends Error {
  constructor(
    provider: string,
    readonly maxTokens: number,
    usage?: unknown,
  ) {
    super(`${provider} response cut off at max_tokens=${maxTokens} (usage: ${JSON.stringify(usage)})`);
    this.name = "TruncatedResponseError";
  }
}

/**
 * The model answered with no text. The reason and usage go into the message:
 * on 2026-10-19 the data report's vendor summaries failed with only "empty
 * response" in the log. `callLlm` retries once, as for an unavailable model.
 */
export class EmptyResponseError extends Error {
  constructor(provider: string, reason?: unknown, usage?: unknown) {
    super(
      `Unexpected empty response from ${provider} (finish_reason: ${String(reason)}, usage: ${JSON.stringify(usage)})`,
    );
    this.name = "EmptyResponseError";
  }
}

/** Factory function that creates an LlmProvider instance. */
export type ProviderFactory = () => LlmProvider;
