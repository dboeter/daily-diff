import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PolicyConfig } from "../../core/config.ts";
import { fetchEuroparl, latestStage, parseProcedure } from "../../policy/europarl.ts";

// Trimmed live responses, 2026-10-14.
const fixture = (name: string): unknown =>
  JSON.parse(fs.readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf-8"));

const config = (eu: string[]): PolicyConfig => ({
  readerProfile: "A practitioner.",
  watchlist: { eu, nl: [], usFederal: [], usStates: [] },
  feeds: [],
  dataLaw: [],
  calendar: [],
});

const ctx = (eu: string[]) => ({
  config: config(eu),
  now: new Date("2026-10-13T23:00:00Z"),
  dateStr: "2026-10-14",
  state: null,
});

afterEach(() => vi.restoreAllMocks());

describe("latestStage", () => {
  const ev = (date: string, type: string) => ({
    activity_date: date,
    had_activity_type: `def/ep-activities/${type}`,
  });

  it("takes the latest milestone and ignores tablings and votes", () => {
    expect(
      latestStage([
        ev("2026-06-02", "COMMITTEE_APPROVE_PROVISIONAL_AGREEMENT"),
        ev("2026-06-10", "TABLING_PLENARY"),
      ]),
    ).toEqual({ stage: "Provisional agreement approved in committee", date: "2026-06-02" });
  });

  it("on one day, the later step wins", () => {
    expect(
      latestStage([ev("2026-06-16", "PLENARY_ADOPT_POSITION"), ev("2026-06-16", "PLENARY_DEBATE")]),
    ).toEqual({
      stage: "Parliament position adopted",
      date: "2026-06-16",
    });
  });

  it("is null without a milestone", () => {
    expect(latestStage([ev("2026-06-10", "TABLING_PLENARY")])).toBeNull();
  });
});

describe("parseProcedure", () => {
  it("makes a stage item whose link names the procedure, so the watchlist matches it", () => {
    expect(parseProcedure(fixture("europarl-procedure-2025-0359.json"))).toEqual({
      id: "ep:2025/0359(COD)",
      title:
        "Amending Regulations (EU) 2024/1689 and (EU) 2018/1139 as regards the simplification of the implementation of harmonised rules on artificial intelligence (Digital Omnibus on AI)",
      link: "https://oeil.secure.europarl.europa.eu/oeil/en/procedure-file?reference=2025/0359(COD)",
      published: "2026-06-16",
      description: "European Parliament procedure 2025/0359(COD).",
      source: "European Parliament",
      jurisdiction: "eu",
      jevOnly: false,
      stage: "Parliament position adopted",
    });
  });
});

describe("fetchEuroparl", () => {
  it("fetches each watchlisted procedure, not the other watchlist entries", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(fixture("europarl-procedure-2025-0359.json"))));
    const items = await fetchEuroparl(ctx(["2025/0359(COD)", "2024/1689"]));
    expect(spy).toHaveBeenCalledOnce();
    expect(String(spy.mock.calls[0]![0])).toContain("/api/v2/procedures/2025-0359?");
    expect(items.map((i) => i.stage)).toEqual(["Parliament position adopted"]);
  });

  it("only records a first-seen stage older than 30 days", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(JSON.stringify(fixture("europarl-procedure-2025-0359.json"))),
    );
    // The stage is dated 2026-06-16.
    const [first] = await fetchEuroparl(ctx(["2025/0359(COD)"]));
    expect(first!.recordOnly).toBe(true);
    const [recent] = await fetchEuroparl({ ...ctx(["2025/0359(COD)"]), dateStr: "2026-07-01" });
    expect(recent!.recordOnly).toBeUndefined();
    const known = { reported: {}, stages: { "ep:2025/0359(COD)": "2026-05-01 Trilogue" } };
    const [moved] = await fetchEuroparl({ ...ctx(["2025/0359(COD)"]), state: known });
    expect(moved!.recordOnly).toBeUndefined();
  });

  it("skips a failing procedure and throws only when all fail", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("", { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(fixture("europarl-procedure-2025-0359.json"))));
    expect(await fetchEuroparl(ctx(["2022/0272(COD)", "2025/0359(COD)"]))).toHaveLength(1);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 500 }));
    await expect(fetchEuroparl(ctx(["2022/0272(COD)"]))).rejects.toThrow("HTTP 500");
  });
});
