/**
 * Base class for OpenAI-compatible providers.
 *
 * Shared by OpenAI, GitHub Copilot, and OpenRouter providers.
 */

import OpenAI from "openai";
import { type LlmProvider, TruncatedResponseError } from "./types.ts";

export abstract class OpenAICompatibleProvider implements LlmProvider {
  abstract readonly name: string;
  protected readonly client: OpenAI;
  protected readonly model: string;
  /** Provider-specific request fields merged into every chat completion call. */
  protected readonly extraBody: Record<string, unknown>;

  constructor(opts: {
    apiKey?: string;
    baseURL?: string;
    model: string;
    extraBody?: Record<string, unknown>;
  }) {
    this.model = opts.model;
    this.extraBody = opts.extraBody ?? {};
    this.client = new OpenAI({
      apiKey: opts.apiKey,
      baseURL: opts.baseURL,
    });
  }

  async call(prompt: string, maxTokens: number): Promise<string> {
    const response = await this.client.chat.completions.create({
      ...this.extraBody,
      model: this.model,
      max_completion_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    // OpenRouter can answer 2xx with `{ error: { code, message } }` and no `choices`
    // (2026-10-08/09: web and HN died on `choices[0]` with the reason lost). Put the
    // body's error in the message: it shows in the log, and a body-level 429
    // matches `is429` in report.ts, so it rides the retry ladder.
    if (!Array.isArray(response.choices)) {
      const body = JSON.stringify((response as { error?: unknown }).error ?? response);
      throw new Error(`${this.name} returned no choices: ${body.slice(0, 500)}`);
    }
    const choice = response.choices[0];
    // Before the empty check: a reasoning model that spends the whole budget
    // thinking returns "length" with no content, and that is worth a retry.
    if (choice?.finish_reason === "length") {
      throw new TruncatedResponseError(this.name, maxTokens, response.usage);
    }
    const text = choice?.message?.content;
    if (!text) throw new Error(`Unexpected empty response from ${this.name}`);
    return text;
  }
}
