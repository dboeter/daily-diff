import { describe, it, expect } from "vitest";
import { trendsFacts, type FactsGithubRow, type TrendsFactsInput } from "../../trending/facts.ts";

const repo = (
  fullName: string,
  gain: number,
  relative: number | null,
  starsCell: string,
): FactsGithubRow => ({
  fullName,
  url: `https://github.com/${fullName}`,
  gain,
  relative,
  starsCell,
});

const input = (over: Partial<TrendsFactsInput> = {}): TrendsFactsInput => ({
  radar: [],
  tables: [],
  openrouter: { models: [], date: "" },
  hf: [],
  ...over,
});

describe("trendsFacts", () => {
  it("names the largest absolute and the largest relative gain per table when they differ, and across tables", () => {
    const facts = trendsFacts(
      input({
        tables: [
          {
            title: "🔌 Agent Tooling",
            rows: [
              repo("c/audit", 15072, 0.45, "48,333 (+15,072, +45%)"),
              repo("k/ffmpeg", 931, 0.44, "3,028 (+931, +44%)"),
            ],
          },
          {
            title: "🕸️ Multi-Agent & Orchestration",
            rows: [
              repo("s/orca", 9622, 0.099, "106,907 (+9,622, +9.9%)"),
              repo("q/switch", 844, 0.98, "1,703 (+844, +98%)"),
            ],
          },
        ],
      }),
    );
    expect(facts).toContain(
      "- 🔌 Agent Tooling (stars gained in the last 7 days): largest absolute and largest relative gain: [c/audit](https://github.com/c/audit) (🔌 Agent Tooling, row 1), 48,333 (+15,072, +45%).",
    );
    expect(facts).toContain(
      "- 🕸️ Multi-Agent & Orchestration (stars gained in the last 7 days): largest absolute gain: [s/orca](https://github.com/s/orca) (🕸️ Multi-Agent & Orchestration, row 1), 106,907 (+9,622, +9.9%); largest relative gain: [q/switch](https://github.com/q/switch) (🕸️ Multi-Agent & Orchestration, row 2), 1,703 (+844, +98%).",
    );
    expect(facts).toMatch(
      /Across the 2 GitHub category tables \(4 rows\) \(stars gained in the last 7 days\): largest absolute gain: \[c\/audit\].*largest relative gain: \[q\/switch\]/,
    );
  });

  it("counts providers within the top 10 OpenRouter models only, and gives the table's row count and date", () => {
    const slugs = [
      "deepseek/a",
      "deepseek/b",
      "z-ai/c",
      "x/d",
      "openai/e",
      "anthropic/f",
      "y/g",
      "w/h",
      "z-ai/i",
      "deepseek/j",
    ];
    const models = [...slugs, "anthropic/k", "anthropic/l"].map((slug, i) => ({
      slug,
      tokens: (20 - i) * 1e12,
    }));
    const facts = trendsFacts(input({ openrouter: { models, date: "2026-10-25" } }));
    expect(facts).toContain("OpenRouter usage (one day's snapshot, on 2026-10-25): the table has 12 rows.");
    expect(facts).toContain(
      "within the top 10 (by the slug's provider prefix): deepseek 3, z-ai 2, anthropic 1,",
    );
    expect(facts).toContain("#1 is [deepseek/a](https://openrouter.ai/deepseek/a) with 20.00T tokens");
  });

  it("marks Hugging Face's Likes and Downloads as totals, never gains", () => {
    const facts = trendsFacts(
      input({
        hf: [
          { id: "d/flash", url: "https://huggingface.co/d/flash", likes: 3162, downloads: 95889 },
          { id: "q/qwen", url: "https://huggingface.co/q/qwen", likes: 18451, downloads: 7608285 },
        ],
      }),
    );
    expect(facts).toContain("Likes is each model's total and Downloads its last 30 days: neither is a gain");
    expect(facts).toContain("a figure the page does not show");
    expect(facts).toContain("most total likes: [q/qwen](https://huggingface.co/q/qwen) (#2), 18,451");
  });

  it("gives each Radar source its own leader and says when no row has a vs previous week figure", () => {
    const facts = trendsFacts(
      input({
        radar: [
          {
            name: "Claude Code",
            url: "https://claude.ai/code",
            sources: ["OpenRouter"],
            signals: ["week #2 / month #2, 12.67T tokens/week"],
          },
          {
            name: "pi",
            url: "https://pi.dev/",
            sources: ["OpenRouter"],
            signals: ["week #6 / month #8, 5.22T tokens/week"],
          },
          { name: "teapot", url: "https://npm/t", sources: ["npm"], signals: ["20,549 downloads/week"] },
        ],
      }),
    );
    expect(facts).toContain(
      "OpenRouter rows: most tokens in the last 7 days: [Claude Code](https://claude.ai/code) (row 1), 12.67T tokens/week.",
    );
    expect(facts).toContain(
      "npm rows: most downloads in the last 7 days: [teapot](https://npm/t) (row 3), 20,549 downloads/week.",
    );
    expect(facts).toContain('no row has a "vs previous week" figure');
    const withChange = trendsFacts(
      input({
        radar: [
          {
            name: "pi",
            url: "u",
            sources: ["OpenRouter"],
            signals: ["week #6 / month #8, 5.22T tokens/week (+12% vs previous week)"],
          },
        ],
      }),
    );
    expect(withChange).toContain(
      "largest rise against last week's page: [pi](u) (row 1) (OpenRouter), +12% vs previous week.",
    );
  });

  it("names no largest rise when every vs previous week change is a fall", () => {
    const facts = trendsFacts(
      input({
        radar: [
          {
            name: "pi",
            url: "u",
            sources: ["npm"],
            signals: ["9,000 downloads/week (-20% vs previous week)"],
          },
          {
            name: "qa",
            url: "v",
            sources: ["npm"],
            signals: ["8,000 downloads/week (-35% vs previous week)"],
          },
        ],
      }),
    );
    expect(facts).not.toContain("largest");
    expect(facts).toContain("Agent & Coding Tool Radar: no row rose against last week's page");
    expect(facts).not.toContain("🚀");
  });

  it("counts only non-empty tables across tables", () => {
    const facts = trendsFacts(
      input({
        tables: [
          { title: "A", rows: [repo("a/a", 10, 0.1, "x")] },
          { title: "B", rows: [] },
          { title: "C", rows: [repo("c/c", 20, 0.2, "y")] },
        ],
      }),
    );
    expect(facts).toContain("Across the 2 GitHub category tables (2 rows)");
  });

  it("gives no ratio against a #2 with 0 tokens and buckets slugs by their real provider", () => {
    const facts = trendsFacts(
      input({
        openrouter: {
          models: [
            { slug: "~anthropic/claude-latest", tokens: 5e12 },
            { slug: "anthropic/claude-x", tokens: 0 },
            { slug: "openrouter-auto", tokens: 0 },
          ],
          date: "2026-10-25",
        },
      }),
    );
    expect(facts).not.toContain("Infinity");
    expect(facts).not.toContain("×");
    expect(facts).toContain("anthropic 2, no provider prefix 1.");
  });

  it("is empty without rows", () => {
    expect(trendsFacts(input())).toBe("");
  });
});
