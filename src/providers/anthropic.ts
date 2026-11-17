/**
 * Anthropic provider — wraps the @anthropic-ai/sdk.
 *
 * Env vars:
 *   ANTHROPIC_API_KEY   - API key (read automatically by the SDK)
 *   ANTHROPIC_BASE_URL  - endpoint override (read automatically by the SDK)
 *   ANTHROPIC_MODEL     - model name (default: claude-sonnet-5-5)
 *
 * Every call is streamed: the SDK refuses a plain request whose `max_tokens` could run past
 * 10 minutes (seen at 24,000 tokens on Opus), and one path serves every budget.
 */

import Anthropic from "@anthropic-ai/sdk";
import { EmptyResponseError, type LlmProvider, TruncatedResponseError } from "./types.ts";

export type AnthropicEffort = "low" | "medium" | "high";

export class AnthropicProvider implements LlmProvider {
  readonly name = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly effort: AnthropicEffort | undefined;

  /** `effort`: how much the model reasons before it answers; unset, the API's default. */
  constructor(model?: string, effort?: AnthropicEffort) {
    this.model = model ?? process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-5-5";
    this.effort = effort;
    this.client = new Anthropic();
  }

  async call(prompt: string, maxTokens: number): Promise<string> {
    const message = await this.client.messages
      .stream({
        model: this.model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
        ...(this.effort ? { output_config: { effort: this.effort } } : {}),
      })
      .finalMessage();
    if (message.stop_reason === "max_tokens") {
      throw new TruncatedResponseError(this.name, maxTokens, message.usage);
    }
    // A reasoning model answers with a thinking block before its text.
    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    if (!text) throw new EmptyResponseError(this.name, message.stop_reason, message.usage);
    return text;
  }
}
