import { describe, expect, it, vi } from "vitest";
import { judgeItems, retryDelayMs, type VerdictCache } from "../jev.ts";

describe("Jev client", () => {
  it("honors retry-after and otherwise backs off exponentially, capped", () => {
    expect(retryDelayMs("2", 0)).toBe(2000);
    expect(retryDelayMs("600", 0)).toBe(10_000);
    expect(retryDelayMs(null, 0)).toBe(1000);
    expect(retryDelayMs(null, 2)).toBe(4000);
    expect(retryDelayMs("Wed, 21 Oct 2026 07:28:00 GMT", 1)).toBe(2000);
  });
});

describe("judgeItems", () => {
  interface Item {
    id: string;
    title: string;
    stage?: string;
  }
  type A = { score: number };
  const DATE = "2026-10-14";
  const item = (id: string, stage?: string): Item => ({
    id,
    title: `Title ${id}`,
    ...(stage ? { stage } : {}),
  });
  /** Answers by id; an id without one fails the call. */
  const stub = (byId: Record<string, number>) =>
    vi.fn(async (state: unknown) => {
      const score = byId[(state as { id: string }).id];
      if (score === undefined) throw new Error("HTTP 500");
      return { model: "jev-1.0", answers: { score } as unknown };
    });
  const judge = (
    items: Item[],
    cache: VerdictCache<A> | null,
    ask = stub({}),
    extra: { stage?: boolean } = {},
  ) =>
    judgeItems(items, {
      tag: "test",
      request: (i) => ({ state: { id: i.id }, questions: {} }),
      decide: (a: A) => {
        if (!Number.isFinite(a.score)) throw new Error("bad shape");
        return { relevance: a.score, keep: a.score >= 0.5 };
      },
      ...(extra.stage ? { stage: (i: Item) => i.stage } : {}),
      apiKey: "k",
      cache,
      dateStr: DATE,
      unseenDays: 30,
      ask,
    });

  it("asks once: reuses a saved verdict, saves new answers, keeps hand edits, prunes unseen ids", async () => {
    const cache: VerdictCache<A> = {
      items: {
        old: { title: "Title old", answers: { score: 0.9 }, lastSeen: "2026-10-12" },
        gone: { title: "Gone", answers: { score: 0.9 }, decided: "2026-09-01", lastSeen: "2026-09-13" },
      },
    };
    const ask = stub({ fresh: 0.12345 });
    const j = await judge([item("old"), item("fresh")], cache, ask);
    expect(ask).toHaveBeenCalledTimes(1);
    expect(j.rankedBy).toBe("jev");
    expect(j.verdicts.get("old")).toMatchObject({ keep: true, decided: "by hand" });
    expect(j.verdicts.get("fresh")).toMatchObject({ keep: false, model: "jev-1.0" });
    expect(j.nextCache?.items).toEqual({
      old: { ...cache.items["old"], lastSeen: DATE },
      fresh: {
        title: "Title fresh",
        answers: { score: 0.123 },
        decided: DATE,
        model: "jev-1.0",
        lastSeen: DATE,
      },
    });
  });

  it("asks a saved entry again when its answers do not parse", async () => {
    const cache: VerdictCache<A> = {
      items: { x: { title: "t", answers: { score: Number.NaN }, lastSeen: DATE } },
    };
    const ask = stub({ x: 1 });
    const j = await judge([item("x")], cache, ask);
    expect(ask).toHaveBeenCalledTimes(1);
    expect(j.verdicts.get("x")?.relevance).toBe(1);
  });

  it("asks a stage item again at a new stage and saves the stage", async () => {
    const cache: VerdictCache<A> = {
      items: { b: { title: "t", stage: "Introduced", answers: { score: 0 }, lastSeen: DATE } },
    };
    const ask = stub({ b: 1 });
    const j = await judge([item("b", "Enacted")], cache, ask, { stage: true });
    expect(ask).toHaveBeenCalledTimes(1);
    expect(j.nextCache?.items["b"]).toMatchObject({ stage: "Enacted", answers: { score: 1 } });
    // Without a stage hook the stage is not compared.
    const ask2 = stub({});
    await judge([item("b", "Enacted")], cache, ask2);
    expect(ask2).not.toHaveBeenCalled();
  });

  it("decides by saved verdicts only when more than half the calls fail, but saves what arrived", async () => {
    const cache: VerdictCache<A> = {
      items: { saved: { title: "t", answers: { score: 1 }, lastSeen: DATE } },
    };
    const j = await judge([item("saved"), item("ok"), item("f1"), item("f2")], cache, stub({ ok: 1 }));
    expect(j.rankedBy).toBe("keywords");
    expect([...j.verdicts.keys()]).toEqual(["saved"]);
    expect(Object.keys(j.nextCache!.items)).toEqual(["saved", "ok"]);
    expect(j.traceFields(item("ok"))).toEqual({ relevance: 1, score: 1, decided: null });
  });

  it("without a key, ranks by keywords only when something was left to ask", async () => {
    const run = (items: Item[], cache: VerdictCache<A>) =>
      judgeItems(items, {
        tag: "test",
        request: () => ({ state: {}, questions: {} }),
        decide: (a: A) => ({ relevance: a.score }),
        cache,
        dateStr: DATE,
        unseenDays: 30,
      });
    const cache: VerdictCache<A> = { items: { s: { title: "t", answers: { score: 1 }, lastSeen: DATE } } };
    expect((await run([item("s")], cache)).rankedBy).toBe("jev");
    expect((await run([item("s"), item("new")], cache)).rankedBy).toBe("keywords");
  });

  it("leaves a malformed cache alone", async () => {
    const j = await judge([item("x")], null, stub({ x: 1 }));
    expect(j.verdicts.get("x")?.relevance).toBe(1);
    expect(j.nextCache).toBeNull();
  });

  it("writes the trace header, then one row per line", async () => {
    const j = await judge([item("x")], { items: {} }, stub({ x: 1 }));
    const file = j.rankingFile([{ id: "x", ...j.traceFields(item("x")) }, { id: "y" }], {
      weights: { score: 1 },
    });
    expect(file).toBe(
      '{\n"models": ["jev-1.0"],\n"rankedBy": "jev",\n"weights": {"score":1},\n"items": [\n' +
        '{"id":"x","relevance":1,"score":1,"decided":null},\n{"id":"y"}\n]\n}\n',
    );
    expect(j.traceFields(item("unknown"))).toEqual({ relevance: null, decided: null });
  });
});
