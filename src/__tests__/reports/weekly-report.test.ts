import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Candidate } from "../../reports/candidates.ts";

// The run's own provider: the article must never go to it.
const { runProvider } = vi.hoisted(() => ({
  runProvider: vi.fn<(prompt: string, maxTokens: number) => Promise<string>>(),
}));

vi.mock("../../providers/index.ts", async (importOriginal) => {
  const orig = await importOriginal<typeof import("../../providers/index.ts")>();
  return { ...orig, createProvider: () => ({ name: "run", call: runProvider }) };
});

import { llmCalls, resetLlmStats } from "../../core/llm.ts";
import { buildWeeklyReport, linksOutside, type WeeklyInput } from "../../reports/pages.ts";
import { LLM_TOKENS_WRITER } from "../../weekly/writer.ts";

const story: Candidate = {
  page: "ai-agents",
  kind: "story",
  source: "Hacker News",
  title: "A story",
  url: "https://example.com/story",
  published: "2026-11-12T08:00:00Z",
  text: "The story's own description.",
};
const week = (candidates: Candidate[]): WeeklyInput => ({
  days: [
    { date: "2026-11-10", candidates: [], pages: {} },
    {
      date: "2026-11-16",
      candidates,
      pages: { "ai-agents": "## Spotted\n\n| [A story](https://example.com/story) | Summary. |" },
    },
  ],
  vendorNotes: [],
  fetchGitHub: () => Promise.resolve(undefined),
});

const ARTICLE = [
  "A [story](https://example.com/story) led the week.",
  "",
  "## The story",
  "",
  "It says what it says.",
  "",
  "*This suggests little.*",
].join("\n");

const writer = (call: (prompt: string, maxTokens: number) => Promise<string>) => ({
  name: "writer",
  call: vi.fn(call),
});

beforeEach(() => {
  resetLlmStats();
  llmCalls.length = 0;
  runProvider.mockReset();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildWeeklyReport", () => {
  it("has the writer write the article from the week's source, and frames it as a page", async () => {
    const w = writer(() => Promise.resolve(ARTICLE));

    const report = await buildWeeklyReport(() => ({ ...week([story]), writer: w }), "05:00", "2026-11-16");

    expect(report?.id).toBe("ai-weekly");
    expect(report?.content.split("\n\n---\n\n")[0]).toBe(
      [
        "# Weekly Diff 2026-11-16",
        "",
        "> Sources: 1 item the pages showed from 2026-11-10 to 2026-11-16 | Written by claude-opus-5-5 | Text in italics is interpretation | Generated: 05:00 UTC",
      ].join("\n"),
    );
    expect(report?.content).toContain(`\n\n---\n\n${ARTICLE}`);
    // One call, to the writer, with the source in the prompt and the article's budget.
    expect(runProvider).not.toHaveBeenCalled();
    expect(w.call).toHaveBeenCalledTimes(1);
    const [prompt, maxTokens] = w.call.mock.calls[0]!;
    expect(prompt).toContain("text: The story's own description.");
    expect(prompt).toContain("from 2026-11-10 to 2026-11-16");
    expect(maxTokens).toBe(LLM_TOKENS_WRITER);
    expect(llmCalls).toEqual([{ label: "weekly", outcome: "ok", chars: ARTICLE.length }]);
  });

  it("makes no page without a writer: the key is not set", async () => {
    const report = await buildWeeklyReport(() => ({ ...week([story]), writer: null }), "05:00", "2026-11-16");

    expect(report).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("ANTHROPIC_API_KEY is not set"));
    expect(runProvider).not.toHaveBeenCalled();
  });

  it("makes no page, and no call, when the week's pages showed no item", async () => {
    const w = writer(() => Promise.resolve(ARTICLE));

    expect(await buildWeeklyReport(() => ({ ...week([]), writer: w }), "05:00", "2026-11-16")).toBeNull();
    expect(w.call).not.toHaveBeenCalled();
  });

  it("makes no page when the writer's call fails, and does not throw", async () => {
    const w = writer(() => Promise.reject(new Error("401 invalid x-api-key")));

    expect(
      await buildWeeklyReport(() => ({ ...week([story]), writer: w }), "05:00", "2026-11-16"),
    ).toBeNull();
    // The trace records the lost call as one the caller covered: here, with no page.
    expect(llmCalls.map((c) => c.outcome)).toEqual(["fallback"]);
  });

  it("makes no page, and does not throw, when the week cannot be read or its source not built", async () => {
    const w = writer(() => Promise.resolve(ARTICLE));
    const unreadable = () => {
      throw new Error("EACCES: digests/2026-11-10");
    };
    expect(await buildWeeklyReport(unreadable, "05:00", "2026-11-16")).toBeNull();

    // The source builder throws: here, a GitHub fetch that rejects, which the pipeline's own never does.
    const issue: Candidate = {
      ...story,
      kind: "hot-issue",
      source: "owner/repo",
      url: "https://github.com/owner/repo/issues/5",
    };
    const input: WeeklyInput = {
      days: [
        {
          date: "2026-11-16",
          candidates: [issue],
          pages: {
            "ai-agents": "## Coding Agents\n\n- [#5](https://github.com/owner/repo/issues/5): A bug.",
          },
        },
      ],
      vendorNotes: [],
      fetchGitHub: () => Promise.reject(new Error("socket hang up")),
      writer: w,
    };
    expect(await buildWeeklyReport(() => input, "05:00", "2026-11-16")).toBeNull();

    expect(w.call).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[weekly] No Weekly Diff page: Error: EACCES"),
    );
  });

  it("drops the title the model put above its lede", async () => {
    const w = writer(() => Promise.resolve(`# Weekly Diff\n\n${ARTICLE}`));

    const report = await buildWeeklyReport(() => ({ ...week([story]), writer: w }), "05:00", "2026-11-16");

    expect(report?.content.match(/^# /gm)).toHaveLength(1);
  });

  it("warns about a link the article did not take from the source", async () => {
    const w = writer(() => Promise.resolve(`${ARTICLE}\n\nSee [this](https://elsewhere.example/page).`));

    await buildWeeklyReport(() => ({ ...week([story]), writer: w }), "05:00", "2026-11-16");

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("1 link(s) not in the source: https://elsewhere.example/page"),
    );
  });
});

describe("linksOutside", () => {
  it("lists each link the source does not hold, once", () => {
    const article =
      "[a](https://in.example/a) [b](https://out.example/b) and again [b](https://out.example/b).";
    expect(linksOutside(article, "link: https://in.example/a")).toEqual(["https://out.example/b"]);
  });
});
