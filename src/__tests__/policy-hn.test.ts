import { describe, it, expect } from "vitest";
import { hnPolicyItems, hnPolicySource } from "../policy/hn.ts";
import type { HnStory } from "../sources/hn.ts";
import type { PolicySourceContext } from "../policy/sources.ts";

const story = (id: string, title: string, o: Partial<HnStory> = {}): HnStory => ({
  id,
  title,
  url: `https://example.com/${id}`,
  hnUrl: `https://news.ycombinator.com/item?id=${id}`,
  points: 600,
  comments: 300,
  author: "a",
  createdAt: "2026-10-19T00:00:00.000Z",
  ...o,
});

// 2026-10-19: the day's biggest AI-policy story reached HN only, and Policy Watch never saw it.
describe("hnPolicyItems", () => {
  it("turns policy-looking stories into news items from elsewhere, judged by Jev only", () => {
    const items = hnPolicyItems([
      story("1", "Anthropic's proposed AI safety bill only kicks in if 50 deaths or $1B in damages", {
        description: "The bill sets thresholds.",
      }),
      story("2", "Mercury 3: Diffusion at scale"),
    ]);
    expect(items).toEqual([
      {
        id: "hn:1",
        title: "Anthropic's proposed AI safety bill only kicks in if 50 deaths or $1B in damages",
        link: "https://example.com/1",
        published: "2026-10-19T00:00:00.000Z",
        description: "The bill sets thresholds.",
        source: "Hacker News",
        jurisdiction: "other",
        jevOnly: true,
        news: true,
      },
    ]);
  });

  it("matches policy terms as whole words, case-insensitive, and the description too", () => {
    const titles = (stories: HnStory[]) => hnPolicyItems(stories).map((i) => i.title);
    expect(
      titles([
        story("1", "EU AI Act enforcement starts"),
        story("2", "FTC sues an AI startup"),
        story("3", "Billing for agents"),
        story("4", "Acting on model feedback"),
        story("5", "A new model", { description: "The regulator opened an investigation." }),
      ]),
    ).toEqual(["EU AI Act enforcement starts", "FTC sues an AI startup", "A new model"]);
  });
});

describe("hnPolicySource", () => {
  const ctx = {} as PolicySourceContext;

  it("reads the shared HN fetch, and fails when it failed", async () => {
    const ok = hnPolicySource(
      Promise.resolve({ stories: [story("1", "Senate passes AI bill")], fetchSuccess: true }),
    );
    expect((await ok.fetch(ctx)).map((i) => i.id)).toEqual(["hn:1"]);
    const failed = hnPolicySource(Promise.resolve({ stories: [], fetchSuccess: false }));
    await expect(failed.fetch(ctx)).rejects.toThrow();
  });
});
