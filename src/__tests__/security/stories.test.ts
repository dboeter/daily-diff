import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { AskJev } from "../../core/jev.ts";
import type { Story } from "../../spotted/pool.ts";
import {
  judgeSecurityStories,
  securityDecision,
  securityTraceFile,
  type SecurityAnswers,
} from "../../security/stories.ts";

const DATE = "2026-11-10";

interface Recorded {
  title: string;
  description?: string;
  url: string;
  answers: SecurityAnswers;
}
const RECORDED = (
  JSON.parse(readFileSync(path.join(__dirname, "../fixtures/security-stories.json"), "utf8")) as {
    stories: Record<string, Recorded>;
  }
).stories;

const story = (id: string): Story => {
  const r = RECORDED[id]!;
  return {
    id: `hn:${id}`,
    source: "hn",
    title: r.title,
    url: r.url,
    discussionUrl: `https://news.ycombinator.com/item?id=${id}`,
    points: 100,
    comments: 10,
    published: `${DATE}T00:00:00Z`,
    ...(r.description ? { description: r.description } : {}),
  };
};

/** Answers each story with its recorded spike answers. */
const recorded: AskJev = async (state) => {
  const title = (state as { title: string }).title;
  const r = Object.values(RECORDED).find((x) => x.title === title)!;
  return { model: "jev-1.14.0", answers: r.answers };
};

describe("securityDecision", () => {
  it("flags the Forbes Fireworks story as a banner: severe, reported by the press", () => {
    expect(securityDecision(RECORDED["s354"]!.answers)).toEqual({ flagged: true, banner: true });
  });

  it("flags the Bloomberg Fireworks story (no text) without a banner: its severity is under the bar", () => {
    expect(securityDecision(RECORDED["s353"]!.answers)).toMatchObject({ flagged: true, banner: false });
  });

  it("flags the email leak without a banner: one user's GitHub issue", () => {
    expect(securityDecision(RECORDED["s213"]!.answers)).toMatchObject({ flagged: true, banner: false });
  });

  it("does not flag a story that is no security event", () => {
    expect(securityDecision(RECORDED["s000"]!.answers)).toMatchObject({ flagged: false, banner: false });
  });

  it("throws on an unexpected shape, so the call counts as failed", () => {
    const a = RECORDED["s354"]!.answers;
    expect(() => securityDecision({ ...a, claim_by: { ...a.claim_by, choice: "blogger" } })).toThrow(
      /Unexpected/,
    );
    expect(() => securityDecision({ ...a, is_security: {} as SecurityAnswers["is_security"] })).toThrow(
      /Unexpected/,
    );
  });
});

describe("judgeSecurityStories", () => {
  it("asks each story once with its title, description and site, and caches the answers", async () => {
    const ask = vi.fn(recorded);
    const stories = [story("s354"), story("s213")];
    const j = await judgeSecurityStories(stories, { apiKey: "k", cache: { items: {} }, dateStr: DATE, ask });
    expect(ask).toHaveBeenCalledTimes(2);
    expect(ask.mock.calls[0]![0]).toEqual({
      title: RECORDED["s354"]!.title,
      site: "forbes.com",
    });
    expect(ask.mock.calls[1]![0]).toMatchObject({ description: RECORDED["s213"]!.description });
    expect(j.verdicts.get("hn:s354")).toMatchObject({ flagged: true, banner: true });
    expect(Object.keys(j.nextCache!.items)).toEqual(["hn:s354", "hn:s213"]);

    // A saved verdict is reused, even when the text changed: a failed page fetch empties it.
    const again = vi.fn(recorded);
    const described = { ...story("s354"), description: "Customer data and models exposed." };
    await judgeSecurityStories([story("s213"), described, story("s000")], {
      apiKey: "k",
      cache: j.nextCache,
      dateStr: DATE,
      ask: again,
    });
    expect(again).toHaveBeenCalledTimes(1);
    expect(again.mock.calls[0]![0]).toMatchObject({ title: RECORDED["s000"]!.title });
  });

  it("flags nothing without Jev: keywords cannot tell a security event", async () => {
    const j = await judgeSecurityStories([story("s354")], { cache: { items: {} }, dateStr: DATE });
    expect(j.rankedBy).toBe("keywords");
    expect(j.verdicts.size).toBe(0);
  });
});

describe("securityTraceFile", () => {
  it("lists every judged story with its decision, answers and where it went today", async () => {
    const stories = [story("s354"), story("s213"), story("s000")];
    const j = await judgeSecurityStories(stories, {
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: recorded,
    });
    const trace = JSON.parse(
      securityTraceFile(
        stories,
        j,
        new Map([["hn:s213", "news"]]),
        new Set(["hn:s213"]),
        new Map([["hn:s354", "cap"]]),
      ),
    ) as { rankedBy: string; flagged: number; banner: number; items: Record<string, unknown>[] };
    expect(trace.rankedBy).toBe("jev");
    expect(trace).toMatchObject({ flagged: 2, banner: 1 });
    expect(trace.items[0]).toMatchObject({
      id: "hn:s354",
      flagged: true,
      banner: true,
      placed: null,
      shown: false,
    });
    expect(trace.items[1]).toMatchObject({
      id: "hn:s213",
      flagged: true,
      banner: false,
      placed: "news",
      shown: true,
    });
    expect(trace.items[0]).toHaveProperty("severity");
    expect(trace.items[2]).toMatchObject({ flagged: false, placed: null, dropped_reason: null });
    expect(trace.items[1]).not.toHaveProperty("dropped_reason");
  });
});
