/**
 * The writer of the weekly pages: the calls of the pipeline that do not use the run's own provider.
 *
 * Weekly Diff's article interprets the week, the kind of prose a weak model overstates ("Across
 * platforms", retired 2026-11-15). In the experiment of 2026-11-16 (`.scratch/weekly-diff/`)
 * Claude Opus 5.5 at high effort drew 0 to 2 major flags an article from two judges, and at low
 * effort up to 5, so both the model and the effort are fixed here and not read from the
 * environment: `ANTHROPIC_MODEL` sets the model of a local run's every other call.
 *
 * Trends' own calls use the same writer since 2026-11-17, by the maintainer's choice: no
 * experiment compared it with the run's model on those prompts.
 */

import { AnthropicProvider, type LlmProvider } from "../providers/index.ts";

export const WEEKLY_WRITER = { model: "claude-opus-5-5", effort: "high" } as const;

/** The article call's label in `llm-trace.json` and the prompt capture. */
export const WEEKLY_CALL_LABEL = "weekly";

/**
 * The budget of a writer's call. Reasoning counts against it: at high effort an article took
 * 9,800 to 12,400 output tokens. `callLlm` doubles a cut answer's budget once, to 64,000.
 */
export const LLM_TOKENS_WRITER = 32_000;

let writer: LlmProvider | undefined;

/** The writer, made on first use; null without `ANTHROPIC_API_KEY`: no article, and Trends by the run's model. */
export function weeklyWriter(): LlmProvider | null {
  if (!process.env["ANTHROPIC_API_KEY"]) return null;
  return (writer ??= new AnthropicProvider(WEEKLY_WRITER.model, WEEKLY_WRITER.effort));
}
