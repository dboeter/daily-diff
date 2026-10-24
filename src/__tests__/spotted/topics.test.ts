import { describe, expect, it, vi } from "vitest";
import type { AskJev } from "../../core/jev.ts";
import {
  fallbackTopic,
  routeStories,
  PAGE_OF_TOPIC,
  topicOf,
  type TopicAnswers,
} from "../../spotted/topics.ts";
import type { Story } from "../../spotted/pool.ts";

const DATE = "2026-10-22";
const MODEL = "jev-2026-10";

const choice = (key: string) => ({ choice: key, confidence: 0.9, probabilities: { [key]: 0.9 } });
const answers = (key: string): TopicAnswers => ({ topic: choice(key) });
const answer =
  (key: string): AskJev =>
  async () => ({ model: MODEL, answers: answers(key) });

const story = (id: string, title: string, description?: string): Story => ({
  id: `hn:${id}`,
  source: "hn",
  title,
  url: `https://www.example.com/${id}`,
  discussionUrl: `https://news.ycombinator.com/item?id=${id}`,
  points: 1,
  comments: 0,
  published: "2026-10-22T00:00:00Z",
  ...(description ? { description } : {}),
});

describe("topicOf", () => {
  it("returns the chosen topic", () => {
    expect(topicOf(answers("research"))).toBe("research");
  });

  it("throws on a key outside the list", () => {
    expect(() => topicOf(answers("science"))).toThrow(/Unexpected/);
    expect(() => topicOf({} as TopicAnswers)).toThrow(/Unexpected/);
  });
});

describe("PAGE_OF_TOPIC", () => {
  it("sends models and research to the models page and drops policy and other", () => {
    expect(PAGE_OF_TOPIC).toEqual({
      agents: "agents",
      models: "models",
      research: "models",
      data: "data",
      policy: null,
      other: null,
    });
  });
});

describe("fallbackTopic", () => {
  it("tries policy, data, agents, research, models, else other", () => {
    expect(fallbackTopic({ title: "DeepSeek banned from U.S. federal civilian agencies" })).toBe("policy");
    expect(fallbackTopic({ title: "An LLM agent that writes SQL for DuckDB" })).toBe("data");
    expect(fallbackTopic({ title: "A coding agent paper with a new model" })).toBe("agents");
    expect(fallbackTopic({ title: "A paper on a new model" })).toBe("research");
    expect(fallbackTopic({ title: "Qwen 4 released" })).toBe("models");
    expect(fallbackTopic({ title: "AI is eating my job" })).toBe("other");
  });

  it("reads the description too", () => {
    expect(fallbackTopic({ title: "Show HN: Rill", description: "A lakehouse in one binary" })).toBe("data");
  });
});

describe("routeStories", () => {
  it("asks Jev for the title, description and site, and caches the answer", async () => {
    const ask = vi.fn(answer("models"));
    const s = story("1", "Voxtral 3", "Mistral's speech model");
    const { topics, judgment } = await routeStories([s], {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask,
    });
    expect(ask.mock.calls[0]![0]).toEqual({
      title: "Voxtral 3",
      description: "Mistral's speech model",
      site: "example.com",
    });
    expect(topics.get(s.id)).toBe("models");
    expect(judgment.nextCache?.items[s.id]).toMatchObject({ answers: answers("models"), decided: DATE });
  });

  it("reuses a saved topic without asking", async () => {
    const ask = vi.fn(answer("models"));
    const s = story("2", "Anything");
    const cache = {
      items: {
        [s.id]: { title: "Anything", answers: answers("data"), pinned: true as const, lastSeen: DATE },
      },
    };
    const { topics } = await routeStories([s], { apiKey: "k", cache, dateStr: DATE, ask });
    expect(ask).not.toHaveBeenCalled();
    expect(topics.get(s.id)).toBe("data");
  });

  it("falls back to keywords without a key, and when Jev answers outside the list", async () => {
    const s = story("3", "Postgres 19 released");
    expect((await routeStories([s], { cache: { items: {} }, dateStr: DATE })).topics.get(s.id)).toBe("data");
    const routed = await routeStories([s], {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: answer("science"),
    });
    expect(routed.judgment.rankedBy).toBe("keywords");
    expect(routed.topics.get(s.id)).toBe("data");
  });
});
