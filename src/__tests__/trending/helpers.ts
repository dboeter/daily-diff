import { vi } from "vitest";
import type { AskJev } from "../../core/jev.ts";

export const MODEL = "jev-1.13.0";
export const DATE = "2026-10-05";

const DAY_MS = 24 * 60 * 60 * 1000;

export const daysBefore = (n: number) => new Date(Date.parse(DATE) - n * DAY_MS).toISOString().slice(0, 10);

export function choice(pick: string, p = 0.9) {
  return { type: "choice", choice: pick, confidence: p, probabilities: { [pick]: p, none: 1 - p } };
}

/** A stub `ask` answering the classification questions. */
export const classifyAnswer =
  (category: string, standalone: number): AskJev =>
  async () => ({
    model: MODEL,
    answers: { category: choice(category), standalone_tool: { noul: standalone } },
  });

export const notCalled: AskJev = vi.fn(async () => {
  throw new Error("ask must not be called");
});
