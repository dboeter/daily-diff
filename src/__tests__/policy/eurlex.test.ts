import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PolicyConfig } from "../../core/config.ts";
import { celexStage, eurLexQuery, fetchEurLex, parseEurLexResults } from "../../policy/eurlex.ts";

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

describe("celexStage", () => {
  it.each([
    ["52025PC0836", "Commission proposal"],
    ["52026AP0098", "Parliament position"],
    ["52026IP0066", "Parliament resolution"],
    ["52026DC0577", "Commission communication"],
    ["52025AE4298", "Preparatory document"],
    ["32026R1744", "Regulation adopted"],
    ["32019L0790", "Directive adopted"],
    ["32026D1080", "Decision adopted"],
    ["32024R2847R(04)", "Corrigendum"],
    ["32026Y03795", "Published in the Official Journal"],
    ["02024R1689-20260727", "Consolidated text"],
  ])("%s → %s", (celex, stage) => {
    expect(celexStage(celex)).toBe(stage);
  });

  it("drops staff working documents and notices without a sector", () => {
    expect(celexStage("52026SC0592")).toBeNull();
    expect(celexStage("C/2026/04668")).toBeNull();
  });
});

describe("parseEurLexResults", () => {
  const items = parseEurLexResults(fixture("eurlex-sparql.json"));

  it("makes one EU item per CELEX with a known stage", () => {
    expect(items.map((i) => i.id)).toEqual([
      "celex:02024R1689-20260727",
      "celex:32026R1744",
      "celex:32026Y03795",
      "celex:52026AP0098",
      "celex:52025PC0836",
      "celex:32024R2847R(04)",
    ]);
  });

  it("takes stage, date and link from the data and keeps the full title for Jev and the prompt", () => {
    const act = items.find((i) => i.id === "celex:32026R1744")!;
    expect(act).toMatchObject({
      stage: "Regulation adopted",
      published: "2026-07-08",
      link: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R1744",
      source: "EUR-Lex",
      jurisdiction: "eu",
      jevOnly: false,
    });
    // Truncated only in the rendered table (policyTitleLabel).
    expect(act.title).toHaveLength(306);
    expect(act.title.endsWith("…")).toBe(false);
  });
});

describe("fetchEurLex", () => {
  it("queries a 30-day look-back for AI titles and watchlisted regulation numbers", async () => {
    expect(eurLexQuery("2026-09-13", ["2024/1689"])).toContain('"2026-09-13"^^xsd:date');
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(fixture("eurlex-sparql.json"))));
    const items = await fetchEurLex(ctx(["2025/0359(COD)", "2024/1689"]));
    expect(items).toHaveLength(6);
    const query = new URLSearchParams(String(spy.mock.calls[0]![1]!.body)).get("query")!;
    expect(query).toContain('"2026-09-13"^^xsd:date');
    expect(query).toContain("artificial intelligence|2024/1689");
    expect(query).not.toContain("0359");
  });

  it("throws on an HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 503 }));
    await expect(fetchEurLex(ctx([]))).rejects.toThrow("HTTP 503");
  });
});
