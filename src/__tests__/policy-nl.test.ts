import fs from "node:fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { billStage, fetchTweedeKamer, parseZaken } from "../policy/tweedekamer.ts";
import { newItems, nextReportedState } from "../core/report-state.ts";
import type { PolicyConfig } from "../core/config.ts";
import type { PolicyState } from "../policy/items.ts";

// Live responses, 2026-10-14: the Tweede Kamer OData and KOOP SRU.
const text = (name: string): string =>
  fs.readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf-8");
const dossier = JSON.parse(text("tk-dossier-36875.json")) as {
  value: { Besluit: Parameters<typeof billStage>[0] }[];
};
const besluiten = dossier.value[0]!.Besluit;
const NO_KOOP =
  "<sru:searchRetrieveResponse><sru:numberOfRecords>0</sru:numberOfRecords></sru:searchRetrieveResponse>";

const besluit = (BesluitSoort: string, Datum: string) => ({
  BesluitSoort,
  Verwijderd: false,
  Agendapunt: { Activiteit: { Datum } },
});

afterEach(() => vi.restoreAllMocks());

describe("billStage", () => {
  it("is the Senate arrival once the Eerste Kamer published kst-<nr>-A", () => {
    expect(billStage(besluiten, text("koop-sru-36875.xml"))).toEqual({
      stage: "In the Eerste Kamer",
      date: "2026-09-22",
    });
  });

  it("is the Tweede Kamer vote while KOOP has nothing later", () => {
    expect(billStage(besluiten, NO_KOOP)).toEqual({ stage: "Passed the Tweede Kamer", date: "2026-09-10" });
  });

  it("is enacted once the Staatsblad has it", () => {
    expect(billStage([], text("koop-sru-36178.xml"))).toEqual({
      stage: "Enacted (Staatsblad)",
      date: "2026-09-30",
    });
  });

  it("is null before the plenary vote: committee steps are not stages", () => {
    const early = besluiten.filter((b) => !b.BesluitSoort.startsWith("Stemmen"));
    expect(early.length).toBeGreaterThan(5);
    expect(billStage(early, NO_KOOP)).toBeNull();
  });

  it("maps a rejection and a hamerstuk, and ignores a deleted besluit", () => {
    expect(billStage([besluit("Stemmen - verworpen", "2026-03-03T14:00:00+01:00")], NO_KOOP)).toEqual({
      stage: "Rejected by the Tweede Kamer",
      date: "2026-03-03",
    });
    expect(
      billStage([besluit("Stemmen - zonder stemming aannemen", "2026-03-03T14:00:00+01:00")], NO_KOOP)?.stage,
    ).toBe("Passed the Tweede Kamer");
    expect(
      billStage(
        [{ ...besluit("Stemmen - aangenomen", "2026-03-03T14:00:00+01:00"), Verwijderd: true }],
        NO_KOOP,
      ),
    ).toBeNull();
  });
});

describe("parseZaken", () => {
  it("keeps the Zaken whose subject names AI, as English-typed items", () => {
    const items = parseZaken(JSON.parse(text("tk-zaken.json")));
    expect(items.map((i) => i.id).sort()).toEqual(["tk:2026Z21772", "tk:2026Z21775", "tk:2026Z22040"]);
    const letter = items.find((i) => i.id === "tk:2026Z22040")!;
    expect(letter).toMatchObject({
      title: "Publieke AI-voorziening funderend onderwijs",
      published: "2026-10-13",
      link: "https://www.tweedekamer.nl/kamerstukken/detail?id=2026Z22040&did=2026D50762",
      jurisdiction: "nl",
      jevOnly: false,
      source: "Tweede Kamer",
    });
    expect(letter.description).toMatch(/^Government letter/);
    expect(letter.stage).toBeUndefined();
  });

  it("does not match AI inside a word or in lower case", () => {
    const zaak = (Onderwerp: string) => ({
      value: [
        { Nummer: "2026Z1", Soort: "Motie", Titel: null, Onderwerp, GestartOp: "2026-10-10T00:00:00+02:00" },
      ],
    });
    expect(parseZaken(zaak("Motie over maaien en zaaien bij Waddenzee-dijken"))).toEqual([]);
    expect(parseZaken(zaak("Motie over het gebruik van algoritmes door gemeenten"))).toHaveLength(1);
    expect(parseZaken(zaak("Motie over een AI-killswitch"))[0]!.link).toBe(
      "https://www.tweedekamer.nl/zoeken?qry=2026Z1",
    );
  });
});

describe("fetchTweedeKamer", () => {
  const config: PolicyConfig = {
    readerProfile: "A practitioner.",
    watchlist: { eu: [], nl: ["36875"], usFederal: [], usStates: [] },
    dataLaw: [],
    calendar: [],
    feeds: [],
  };
  const mockFetch = () =>
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("repository.overheid.nl")) return new Response(text("koop-sru-36875.xml"));
      if (url.includes("Kamerstukdossier")) return new Response(text("tk-dossier-36875.json"));
      return new Response(JSON.stringify({ value: [] }));
    });
  const run = (state: PolicyState | null, dateStr: string) =>
    fetchTweedeKamer({ config, now: new Date(`${dateStr}T00:00:00Z`), dateStr, state });

  it("reports dossier 36875's stage once, and not the next day", async () => {
    mockFetch();
    const [bill] = await run(null, "2026-10-14");
    expect(bill).toMatchObject({ id: "nl:36875", stage: "In the Eerste Kamer", published: "2026-09-22" });
    expect(bill!.recordOnly).toBeUndefined();
    expect(bill!.description).toContain("36875");
    const state = nextReportedState(null, [bill!], "2026-10-14");
    expect(newItems(await run(state, "2026-10-15"), state, "2026-10-15")).toEqual([]);
  });

  it("only records a first-seen stage older than 30 days", async () => {
    mockFetch();
    const [bill] = await run(null, "2026-10-23");
    expect(bill!.recordOnly).toBe(true);
    const state = nextReportedState(null, [], "2026-10-23", [bill!]);
    expect(state.reported).toEqual({});
    expect(newItems([bill!], state, "2026-10-24")).toEqual([]);
    // Known to the state: an old stage is no longer record-only (it is not new either).
    const [again] = await run(state, "2026-10-24");
    expect(again!.recordOnly).toBeUndefined();
  });

  it("asks the Zaak search for the last week's motions, letters and questions", async () => {
    const spy = mockFetch();
    await run(null, "2026-10-14");
    const search = decodeURIComponent(
      String(
        spy.mock.calls.find(
          ([u]) => !String(u).includes("Kamerstukdossier") && String(u).includes("/Zaak"),
        )![0],
      ),
    );
    expect(search).toContain("GestartOp ge 2026-10-07T00:00:00Z");
    expect(search).toContain("Soort eq 'Motie'");
  });
});
