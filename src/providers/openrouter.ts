/**
 * OpenRouter provider — OpenAI-compatible endpoint via openrouter.ai.
 *
 * Env vars:
 *   OPENROUTER_API_KEY  - API key
 *   OPENROUTER_MODEL    - model name (default: anthropic/claude-sonnet-5.5)
 *   OPENROUTER_REASONING_EFFORT - optional reasoning effort (e.g. "low"). Without it a
 *                         reasoning model can spend the whole max_tokens budget on
 *                         reasoning and return empty content (finish_reason "length").
 *                         Reasoning counts against max_tokens even at "low", so a long
 *                         report can still be cut off; callLlm then retries once with
 *                         double the budget (TruncatedResponseError).
 *   OPENROUTER_FALLBACK_MODELS - optional comma-separated models OpenRouter tries, in
 *                         order, when OPENROUTER_MODEL errors or is down (sent as
 *                         `models`). On 2026-10-16 the free Nemotron 3 Ultra endpoint
 *                         was down (0% uptime) and all 7 calls of the run timed out.
 */

import { OpenAICompatibleProvider } from "./openai-compatible.ts";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterProvider extends OpenAICompatibleProvider {
  readonly name = "openrouter";

  constructor(opts?: { apiKey?: string; model?: string }) {
    const effort = process.env["OPENROUTER_REASONING_EFFORT"];
    const model = opts?.model ?? process.env["OPENROUTER_MODEL"] ?? "anthropic/claude-sonnet-5.5";
    const fallbacks = (process.env["OPENROUTER_FALLBACK_MODELS"] ?? "")
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m && m !== model);
    super({
      apiKey: opts?.apiKey ?? process.env["OPENROUTER_API_KEY"],
      baseURL: OPENROUTER_BASE_URL,
      model,
      extraBody: {
        ...(effort ? { reasoning: { effort } } : {}),
        // OpenRouter tries `models` in order; the primary goes first.
        ...(fallbacks.length > 0 ? { models: [model, ...fallbacks] } : {}),
      },
    });
  }
}
