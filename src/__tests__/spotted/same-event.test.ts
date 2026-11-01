import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { AskJev } from "../../core/jev.ts";
import type { SpottedLog, Story } from "../../spotted/pool.ts";
import {
  dropSameDayRepeats,
  dropShownRepeats,
  isRepeatEvent,
  rankFresh,
  type SameEventVerdicts,
} from "../../spotted/same-event.ts";
import { routeStories, spottedTraceFile } from "../../spotted/topics.ts";

const DATE = "2026-11-01";

// Frozen from 2026-11-01's spotted-log.json: the three outlets' game stories, the Dev.to follow-up
// on the Open-VSX incident, a bystander, and the incident's HN story shown on 10-31.
const day = JSON.parse(
  fs.readFileSync(new URL("../fixtures/spotted-2026-11-01.json", import.meta.url), "utf-8"),
) as { pool: Story[]; log: SpottedLog["items"] };
const log: SpottedLog = { items: day.log };
const byId = (id: string) => day.pool.find((s) => s.id === id)!;

const TOP = "hn:50320255";
const GAME = new Set([TOP, "hn:50315987", "hn:50316635"]);
const VSX = new Set(["hn:50300683", "devto:4945893"]);
const BYSTANDER = "hn:50320588";
const choice = (key: string) => ({
  same_event: { choice: key, confidence: 0.9, probabilities: { [key]: 0.9 } },
});
const titleToId = new Map([
  ...day.pool.map((s): [string, string] => [s.title, s.id]),
  ...Object.entries(day.log).map(([id, e]): [string, string] => [e.title, id]),
]);
/**
 * A stub Jev from the reviewed ground truth: a story repeats only when its `earlier` list holds
 * another story on its event (the game stories, the Open-VSX incident), whatever the order.
 */
const truth: AskJev = async (state) => {
  const { title, earlier } = state as { title: string; earlier: { title: string }[] };
  const id = titleToId.get(title)!;
  const group = [GAME, VSX].find((g) => g.has(id));
  const same = earlier.some((e) => group?.has(titleToId.get(e.title)!));
  return { model: "jev-test", answers: choice(same ? "same_event_no_development" : "new_event") };
};

/** A Spotted lane of `cap` rows, by `rankFresh`, over `candidates` minus the removed ones. */
const lane =
  (candidates: Story[], cap: number) =>
  (removed: ReadonlySet<string>): { selection: string[]; shown: Story[] } => {
    const shown = rankFresh(candidates.filter((s) => !removed.has(s.id))).slice(0, cap);
    return { selection: shown.map((s) => s.id), shown };
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

describe("dropShownRepeats: the 2026-11-01 pool against earlier days", () => {
  it("drops the Dev.to follow-up of a story shown 10-31; keeps the game stories, which no earlier day showed", async () => {
    const ask = vi.fn(truth);
    const check = await dropShownRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask,
    });
    expect(check.repeats.map((s) => s.id)).toEqual(["devto:4945893"]);
    expect(check.kept.map((s) => s.id)).toEqual(
      day.pool.filter((s) => s.id !== "devto:4945893").map((s) => s.id),
    );
    // Each story sees only the stories shown on earlier days, never today's fresh ones.
    for (const [state] of ask.mock.calls) {
      expect((state as { earlier: { title: string }[] }).earlier.map((e) => e.title)).toEqual([
        log.items["hn:50300683"]!.title,
      ]);
    }
    expect(check.nextCache!.items["devto:4945893"]!.fingerprint).toMatch(/^2026-11-01:[0-9a-f]{8}$/);
  });

  it("compares with stories shown within SPOTTED_MAX_AGE_DAYS, not today, 8 days ago or a copy of its own link", async () => {
    const top = byId(TOP);
    const shown = (s: Partial<SpottedLog["items"][string]>) => ({ ...log.items["hn:50300683"]!, ...s });
    const window: SpottedLog = {
      items: {
        "hn:six": shown({ title: "Six days ago", shown: "2026-10-26" }),
        "hn:eight": shown({ title: "Eight days ago", shown: "2026-10-24" }),
        "hn:today": shown({ title: "Today", shown: DATE }),
        "hn:copy": shown({ title: "Own link", url: top.url, shown: "2026-10-31" }),
      },
    };
    const ask = vi.fn(truth);
    await dropShownRepeats([top], { log: window, apiKey: "k", cache: { items: {} }, dateStr: DATE, ask });
    const earlier = (ask.mock.calls[0]![0] as { earlier: { title: string }[] }).earlier.map((e) => e.title);
    expect(earlier).toEqual(["Six days ago"]);
  });
});

describe("dropSameDayRepeats: among what shows today", () => {
  const opts = { apiKey: "k", dateStr: DATE };

  it("removes a lower row repeating a higher shown one, refills its slot and checks the refill", async () => {
    const ask = vi.fn(truth);
    const games = [...GAME].map(byId);
    const check = await dropSameDayRepeats([], lane([...games, byId(BYSTANDER)], 2), {
      ...opts,
      cache: { items: {} },
      ask,
    });
    expect(check.repeats.map((s) => s.id)).toEqual(["hn:50315987"]);
    expect(check.selection).toEqual([TOP, BYSTANDER]);
    // The second game story and the bystander that took its slot; the third never showed.
    expect(ask).toHaveBeenCalledTimes(2);
    expect(Object.keys(check.nextCache!.items).sort()).toEqual(
      ["hn:50315987#same-day", `${BYSTANDER}#same-day`].sort(),
    );
  });

  it("keeps a story whose only same-event story does not show", async () => {
    const check = await dropSameDayRepeats([], lane([byId("hn:50315987"), byId(BYSTANDER)], 2), {
      ...opts,
      cache: { items: {} },
      ask: truth,
    });
    expect(check.repeats).toEqual([]);
    expect(check.selection).toEqual(["hn:50315987", BYSTANDER]);
  });

  it("ranks project news above every row: a row repeating it goes, the news is never asked", async () => {
    const ask = vi.fn(truth);
    const check = await dropSameDayRepeats([byId("hn:50316635")], lane([byId(TOP)], 2), {
      ...opts,
      cache: { items: {} },
      ask,
    });
    expect(check.repeats.map((s) => s.id)).toEqual([TOP]);
    expect(check.selection).toEqual([]);
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it("does not drop both copies on a same-day re-run whose ranking changed", async () => {
    // Project news above both rows, so each row is asked in both runs.
    const news = [byId(BYSTANDER)];
    const pair = [byId(TOP), byId("hn:50315987")];
    const first = await dropSameDayRepeats(news, lane(pair, 2), {
      ...opts,
      cache: { items: {} },
      ask: truth,
    });
    expect(first.selection).toEqual([TOP]);
    // Points moved overnight: the second story now ranks first. Its saved repeat verdict was made
    // against [news, TOP], so it is not reused: it shows, and TOP is the repeat.
    const reordered = [byId(TOP), { ...byId("hn:50315987"), points: 500 }];
    const ask = vi.fn(truth);
    const again = await dropSameDayRepeats(news, lane(reordered, 2), {
      ...opts,
      cache: first.nextCache,
      ask,
    });
    expect(ask).toHaveBeenCalledTimes(2);
    expect(again.selection).toEqual(["hn:50315987"]);
    expect(again.repeats.map((s) => s.id)).toEqual([TOP]);
  });

  it("applies saved verdicts without a key, and keeps a story without one", async () => {
    const games = [...GAME].map(byId);
    const first = await dropSameDayRepeats([], lane(games, 2), { ...opts, cache: { items: {} }, ask: truth });
    const ask = vi.fn(truth);
    const noKey = await dropSameDayRepeats([], lane(games, 2), {
      dateStr: DATE,
      cache: first.nextCache,
      ask,
    });
    expect(ask).not.toHaveBeenCalled();
    expect(noKey.repeats.map((s) => s.id)).toEqual(first.repeats.map((s) => s.id));
    // The third game story was asked in the first run (it refilled the slot): saved, so dropped too.
    expect(noKey.selection).toEqual(first.selection);

    const shown = await dropShownRepeats(day.pool, { log, cache: first.nextCache, dateStr: DATE });
    expect(shown.repeats).toEqual([]);
    const nothingSaved = await dropSameDayRepeats([], lane(games, 2), {
      dateStr: DATE,
      cache: { items: {} },
    });
    expect(nothingSaved.repeats).toEqual([]);
  });

  it("keeps the earlier-days verdicts in the cache it hands on", async () => {
    const shown = await dropShownRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: truth,
    });
    const check = await dropSameDayRepeats([], lane(shown.kept, 3), {
      ...opts,
      cache: shown.nextCache,
      ask: truth,
    });
    const keys = Object.keys((check.nextCache as SameEventVerdicts).items);
    expect(keys).toContain("devto:4945893");
    expect(keys).toContain("hn:50315987#same-day");
  });
});

describe("spottedTraceFile: same-event repeats", () => {
  it("lists an earlier-days repeat as a `repeat` row, and gives a removed routed row its answers", async () => {
    const shown = await dropShownRepeats(day.pool, {
      log,
      apiKey: "k",
      cache: { items: {} },
      dateStr: DATE,
      ask: truth,
    });
    const sameDay = await dropSameDayRepeats([], lane(shown.kept, 2), {
      apiKey: "k",
      cache: shown.nextCache,
      dateStr: DATE,
      ask: truth,
    });
    const routing = await routeStories(shown.kept, { cache: { items: {} }, dateStr: DATE });
    const dropped = new Map(sameDay.repeats.map((s) => [s.id, "repeat" as const]));
    const trace = JSON.parse(
      spottedTraceFile(shown.kept, routing, new Set(), {
        rows: [],
        dropped,
        shownRepeats: shown,
        sameDayRepeats: sameDay,
        sources: {},
      }),
    ) as { items: Record<string, unknown>[] };
    const row = (id: string) => trace.items.find((r) => r["id"] === id)!;
    expect(row("devto:4945893")).toMatchObject({ rendered: false, dropped_reason: "repeat", topic: null });
    expect(row("devto:4945893")["same_event"]).toMatchObject({ choice: "same_event_no_development" });
    expect(row("hn:50315987")).toMatchObject({ rendered: false, dropped_reason: "repeat" });
    expect(row("hn:50315987")["topic"]).not.toBeNull();
    expect(row("hn:50315987")["same_event"]).toMatchObject({ choice: "same_event_no_development" });
  });
});
