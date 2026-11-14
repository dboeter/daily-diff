import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { AskJev } from "../../core/jev.ts";
import type { Story } from "../../spotted/pool.ts";
import {
  detailDecision,
  flagDecision,
  judgeSecurityStories,
  securityTraceFile,
  type DetailAnswers,
  type FlagAnswers,
} from "../../security/stories.ts";

const DATE = "2026-11-10";

interface Recorded {
  title: string;
  description?: string;
  url: string;
  answers: FlagAnswers & DetailAnswers;
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

/** Answers the questions asked, from each story's recorded spike answers. */
const recorded: AskJev = async (state, questions) => {
  const title = (state as { title: string }).title;
  const r = Object.values(RECORDED).find((x) => x.title === title)!;
  const answers = Object.fromEntries(
    Object.keys(questions).map((k) => [k, r.answers[k as keyof Recorded["answers"]]]),
  );
  return { model: "jev-1.14.0", answers };
};

const judge = (ids: string[], ask: AskJev = recorded) =>
  judgeSecurityStories(ids.map(story), { apiKey: "k", cache: { items: {} }, dateStr: DATE, ask });

describe("judgeSecurityStories decisions", () => {
  it("flags the Forbes Fireworks story as a banner: severe, reported by the press", async () => {
    expect((await judge(["s354"])).decisions.get("hn:s354")).toEqual({
      flagged: true,
      banner: true,
      confirmed: true,
    });
  });

  it("flags the Bloomberg Fireworks story (no text) without a banner: its severity is under the bar", async () => {
    expect((await judge(["s353"])).decisions.get("hn:s353")).toEqual({
      flagged: true,
      banner: false,
      confirmed: true,
    });
  });

  it("flags the email leak without a banner: one user's GitHub issue", async () => {
    expect((await judge(["s213"])).decisions.get("hn:s213")).toEqual({
      flagged: true,
      banner: false,
      confirmed: false,
    });
  });

  it("does not flag a story that is no security event", async () => {
    expect((await judge(["s000"])).decisions.get("hn:s000")).toEqual({
      flagged: false,
      banner: false,
      confirmed: null,
    });
  });
});

describe("flagDecision and detailDecision", () => {
  it("throw on an unexpected shape, so the call counts as failed", () => {
    const a = RECORDED["s354"]!.answers;
    expect(() => flagDecision({} as FlagAnswers)).toThrow(/Unexpected/);
    expect(() => detailDecision({ ...a, claim_by: { ...a.claim_by, choice: "blogger" } })).toThrow(
      /Unexpected/,
    );
  });
});

describe("judgeSecurityStories", () => {
  it("asks the flag of every story and the other questions of a flagged story only, in one cache", async () => {
    const ask = vi.fn(recorded);
    const j = await judge(["s354", "s000"], ask);
    expect(ask).toHaveBeenCalledTimes(3);
    const asked = ask.mock.calls.map(([state, questions]) => [
      (state as { title: string }).title,
      Object.keys(questions).sort().join(","),
    ]);
    expect(asked).toEqual(
      expect.arrayContaining([
        [RECORDED["s354"]!.title, "is_security"],
        [RECORDED["s000"]!.title, "is_security"],
        [RECORDED["s354"]!.title, "claim_by,kind,severity"],
      ]),
    );
    expect(ask.mock.calls[0]![0]).toEqual({ title: RECORDED["s354"]!.title, site: "forbes.com" });
    expect(Object.keys(j.nextCache!.items).sort()).toEqual(["hn:s000", "hn:s354", "hn:s354#detail"]);

    // Saved verdicts are reused, even when the text changed: a failed page fetch empties it.
    const again = vi.fn(recorded);
    const described = { ...story("s354"), description: "Customer data and models exposed." };
    const k = await judgeSecurityStories([described, story("s000"), story("s213")], {
      apiKey: "k",
      cache: j.nextCache,
      dateStr: DATE,
      ask: again,
    });
    expect(again.mock.calls.map(([s]) => (s as { title: string }).title)).toEqual([
      RECORDED["s213"]!.title,
      RECORDED["s213"]!.title,
    ]);
    expect(k.decisions.get("hn:s354")).toEqual({ flagged: true, banner: true, confirmed: true });
  });

  it("flags nothing without Jev: keywords cannot tell a security event", async () => {
    const j = await judgeSecurityStories([story("s354")], { cache: { items: {} }, dateStr: DATE });
    expect(j.rankedBy).toBe("keywords");
    expect(j.decisions.size).toBe(0);
  });

  it("keeps a flagged story with an unknown banner when its detail call fails", async () => {
    const ask: AskJev = async (state, questions, key) => {
      if ("kind" in questions) throw new Error("HTTP 500");
      return recorded(state, questions, key);
    };
    const j = await judge(["s354"], ask);
    expect(j.decisions.get("hn:s354")).toEqual({ flagged: true, banner: null, confirmed: null });
  });
});

describe("securityTraceFile", () => {
  it("lists every judged story with its decision, answers and where it went today", async () => {
    const stories = [story("s354"), story("s213"), story("s000")];
    const j = await judge(["s354", "s213", "s000"]);
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
      confirmed: true,
      placed: null,
      dropped_reason: "cap",
      shown: false,
      decided: null,
      detail_decided: null,
    });
    expect(trace.items[0]).toHaveProperty("severity");
    expect(trace.items[1]).toMatchObject({
      id: "hn:s213",
      flagged: true,
      banner: false,
      confirmed: false,
      placed: "news",
      shown: true,
    });
    expect(trace.items[1]).not.toHaveProperty("dropped_reason");
    expect(trace.items[2]).toMatchObject({
      flagged: false,
      confirmed: null,
      placed: null,
      dropped_reason: null,
    });
    expect(trace.items[2]).toHaveProperty("is_security");
    expect(trace.items[2]).not.toHaveProperty("severity");
  });
});
