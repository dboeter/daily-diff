import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { AskJev } from "../../core/jev.ts";
import type { SpottedLog, Story } from "../../spotted/pool.ts";
import { dropSameEventRepeats, isRepeatEvent, rankFresh } from "../../spotted/same-event.ts";
import { routeStories, spottedTraceFile } from "../../spotted/topics.ts";

const DATE = "2026-11-01";

// Frozen from 2026-11-01's spotted-log.json: the three outlets' game stories, the Dev.to follow-up
// on the Open-VSX incident, a bystander, and the incident's HN story shown on 10-31.
const day = JSON.parse(
  fs.readFileSync(new URL("../fixtures/spotted-2026-11-01.json", import.meta.url), "utf-8"),
) as { pool: Story[]; log: SpottedLog["items"] };
const log: SpottedLog = { items: day.log };
const byId = (id: string) => day.pool.find((s) => s.id === id)!;

const REPEATS = new Set(["hn:50315987", "hn:50316635", "devto:4945893"]);
const choice = (key: string) => ({
  same_event: { choice: key, confidence: 0.9, probabilities: { [key]: 0.9 } },
});
/** A stub Jev that answers from the reviewed ground truth, by title. */
const truth: AskJev = async (state) => {
  const title = (state as { title: string }).title;
  const id = day.pool.find((s) => s.title === title)!.id;
  return { model: "jev-test", answers: choice(REPEATS.has(id) ? "same_event_no_development" : "new_event") };
};

describe("isRepeatEvent", () => {
  it("is a repeat only for the same event without a new development; throws on an unknown key", () => {
    expect(isRepeatEvent(choice("same_event_no_development"))).toBe(true);
    expect(isRepeatEvent(choice("same_event_new_development"))).toBe(false);
    expect(isRepeatEvent(choice("new_event"))).toBe(false);
    expect(() => isRepeatEvent(choice("maybe"))).toThrow(/Unexpected/);
  });
});

describe("rankFresh", () => {
  it("ranks by source order, then points: an HN story outranks a bigger Dev.to one", () => {
    const ids = rankFresh(day.pool).map((s) => s.id);
    expect(ids).toEqual(["hn:50320255", "hn:50315987", "hn:50320588", "hn:50316635", "devto:4945893"]);
  });
});

describe("dropSameEventRepeats: the 2026-11-01 pool", () => {
  it("keeps the top game story, drops the two lower ones and the Dev.to follow-up of a story shown 10-31", async () => {
    const ask = vi.fn(truth);
    const check = await dropSameEventRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask,
    });
    expect(check.kept.map((s) => s.id)).toEqual(["hn:50320255", "hn:50320588"]);
    expect(check.repeats.map((s) => s.id).sort()).toEqual([...REPEATS].sort());

    // The Dev.to story sees the story shown on 10-31 and every HN story ranked above it.
    const devto = ask.mock.calls.find(
      ([s]) => (s as { title: string }).title === byId("devto:4945893").title,
    )!;
    const earlier = (devto[0] as { earlier: { title: string }[] }).earlier.map((e) => e.title);
    expect(earlier[0]).toBe(log.items["hn:50300683"]!.title);
    expect(earlier).toHaveLength(5);
    // The top story, with only the 10-31 story before it, is asked too.
    expect(ask).toHaveBeenCalledTimes(5);
    expect(check.judgment.nextCache!.items["hn:50316635"]!.fingerprint).toBe(DATE);
  });

  it("drops nothing without a key, or when Jev fails too often", async () => {
    const noKey = await dropSameEventRepeats(day.pool, { log, cache: { items: {} }, dateStr: DATE });
    expect(noKey.kept).toEqual(day.pool);
    expect(noKey.repeats).toEqual([]);
    const failing = await dropSameEventRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: async () => {
        throw new Error("HTTP 500");
      },
    });
    expect(failing.kept).toEqual(day.pool);
  });

  it("never compares a story with a copy of its own link, nor with a story shown today or 3 days ago", async () => {
    const top = byId("hn:50320255");
    const copy: Story = { ...top, id: "lobsters:copy", source: "lobsters", points: 5 };
    const stale: SpottedLog = {
      items: {
        "hn:old": { ...log.items["hn:50300683"]!, shown: "2026-10-29" },
        "hn:today": { ...log.items["hn:50300683"]!, shown: DATE },
      },
    };
    const ask = vi.fn(truth);
    await dropSameEventRepeats([top, copy], {
      log: stale,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask,
    });
    // Neither has anything to compare with: no call.
    expect(ask).not.toHaveBeenCalled();
  });

  it("reuses the day's saved verdict on a same-day re-run", async () => {
    const first = await dropSameEventRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: truth,
    });
    const ask = vi.fn(truth);
    const again = await dropSameEventRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: first.judgment.nextCache,
      dateStr: DATE,
      ask,
    });
    expect(ask).not.toHaveBeenCalled();
    expect(again.repeats.map((s) => s.id)).toEqual(first.repeats.map((s) => s.id));
  });

  it("puts a repeat in the Spotted trace as `repeat`", async () => {
    const check = await dropSameEventRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: truth,
    });
    const routing = await routeStories(check.kept, { cache: { items: {} }, dateStr: DATE });
    const trace = JSON.parse(
      spottedTraceFile(check.kept, routing, new Set(), {
        rows: [],
        dropped: new Map(),
        sameEvent: check,
        sources: {},
      }),
    ) as { items: Record<string, unknown>[] };
    const row = trace.items.find((r) => r["id"] === "hn:50316635")!;
    expect(row).toMatchObject({ rendered: false, dropped_reason: "repeat", topic: null });
    expect(row["same_event"]).toMatchObject({ choice: "same_event_no_development" });
  });
});
