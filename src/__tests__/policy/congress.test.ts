import { describe, it, expect, vi, afterEach } from "vitest";
import { congressStage, fetchCongress } from "../../policy/congress.ts";
import type { PolicyConfig } from "../../core/config.ts";

// Shapes from live api.congress.gov v3 responses (DEMO_KEY, 2026-10-14): `/bill` list items and
// S. 195's `/actions` (newest first, Library of Congress action codes next to chamber-floor ones).
const act = (actionDate: string, text: string, actionCode?: string, type = "Floor") => ({
  actionDate,
  text,
  type,
  ...(actionCode ? { actionCode } : {}),
  sourceSystem: { name: actionCode ? "Library of Congress" : "Senate" },
});
const introduced = act("2025-01-22", "Introduced in Senate", "10000", "IntroReferral");
const passedSenate = act(
  "2025-05-14",
  "Passed/agreed to in Senate: Passed Senate by Unanimous Consent.",
  "17000",
);
const passedHouse = act(
  "2026-10-09",
  "Passed/agreed to in House: On motion to suspend the rules and pass the bill.",
  "8000",
);
const reconsider = act(
  "2026-10-09",
  "Motion to reconsider laid on the table Agreed to without objection.",
  "H38310",
);
const law = act("2026-10-12", "Became Public Law No: 119-121.", "36000", "BecameLaw");

describe("congressStage", () => {
  it("is null before a chamber passed the bill (introduced, referred, reported)", () => {
    expect(
      congressStage([introduced, act("2025-03-14", "Reported by Senator Cruz.", "14000", "Committee")]),
    ).toBeNull();
  });

  it("finds the passage on a day whose latest action is a procedural one", () => {
    // The list's latestAction that day was "Motion to reconsider…": the text alone misses the passage.
    expect(congressStage([reconsider, passedHouse, introduced])).toEqual({
      stage: "Passed the House",
      date: "2026-10-09",
    });
  });

  it("passed both chambers, then enacted, then vetoed", () => {
    expect(congressStage([passedHouse, passedSenate, introduced])).toEqual({
      stage: "Passed both chambers",
      date: "2026-10-09",
    });
    expect(congressStage([law, passedHouse, passedSenate])?.stage).toBe("Enacted");
    expect(
      congressStage([
        act("2026-10-13", "Vetoed by President.", undefined, "Veto"),
        passedHouse,
        passedSenate,
      ]),
    ).toEqual({
      stage: "Vetoed",
      date: "2026-10-13",
    });
  });
});

const config: PolicyConfig = {
  readerProfile: "A practitioner.",
  watchlist: { eu: [], nl: [], usFederal: ["hr9772-119"], usStates: [] },
  feeds: [],
  dataLaw: [],
  calendar: [],
};
const ctx = { config, now: new Date("2026-10-13T23:00:00Z"), dateStr: "2026-10-14", state: null };

const bill = (type: string, number: string, title: string, actionDate: string) => ({
  congress: 119,
  type,
  number,
  title,
  originChamber: "Senate",
  latestAction: { actionDate, text: "Some action." },
  updateDate: "2026-10-13",
  url: `https://api.congress.gov/v3/bill/119/${type.toLowerCase()}/${number}?format=json`,
});
const json = (body: unknown) => new Response(JSON.stringify(body));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("fetchCongress", () => {
  it("without USA_GOV_API_KEY, logs and returns no items without a request", async () => {
    vi.stubEnv("USA_GOV_API_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await fetchCongress(ctx)).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining("USA_GOV_API_KEY"));
  });

  it("asks for actions only for AI-titled or watchlisted bills with a new action; reports from passing a chamber", async () => {
    vi.stubEnv("USA_GOV_API_KEY", "k");
    const actions: Record<string, unknown[]> = {
      "s/195": [law, passedHouse, passedSenate],
      "hr/10768": [
        act("2026-10-10", "Referred to the Committee on Energy and Commerce.", "H11100", "IntroReferral"),
      ],
      "hr/9772": [reconsider, passedHouse],
      "s/50": [
        act("2026-10-12", "Read twice and referred to the Committee.", undefined, "IntroReferral"),
        passedHouse,
      ],
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = new URL(String(input));
      const m = url.pathname.match(/\/bill\/119\/(\w+\/\d+)\/actions$/);
      if (m) return json({ actions: actions[m[1]!] });
      return json({
        bills: [
          bill("S", "195", "Artificial Intelligence Risk Evaluation Act", "2026-10-12"),
          // Introduced-only: actions fetched, no stage, dropped.
          bill("HR", "10768", "AI Whistleblower Protection Act", "2026-10-10"),
          // Watchlisted, no AI in the title.
          bill("HR", "9772", "Foreign Funding Transparency Act", "2026-10-09"),
          // Passed the House in October, a Senate referral since: an old stage is not news.
          bill("S", "50", "AI LEAD Act", "2026-10-12"),
          // Not AI: no actions request.
          bill("HR", "1", "Highway Funding Act", "2026-10-12"),
          // AI, but only an updateDate change (no new action): no actions request.
          bill("S", "77", "AI Accountability Act", "2026-03-01"),
          // A resolution never becomes law.
          bill("SRES", "12", "A resolution on artificial intelligence", "2026-10-12"),
        ],
        pagination: { count: 7 },
      });
    });
    actions["s/50"]![1] = act("2026-09-01", "Passed/agreed to in House: Passed.", "8000");
    const items = await fetchCongress(ctx);
    expect(items).toEqual([
      expect.objectContaining({
        id: "congress:s195-119",
        title: "S. 195: Artificial Intelligence Risk Evaluation Act",
        link: "https://www.congress.gov/bill/119th-congress/senate-bill/195",
        published: "2026-10-12",
        jurisdiction: "us_federal",
        stage: "Enacted",
      }),
      expect.objectContaining({
        id: "congress:hr9772-119",
        stage: "Passed the House",
        published: "2026-10-09",
      }),
    ]);
    expect(items[1]!.description).toContain("hr9772-119");
    const urls = fetchSpy.mock.calls.map(([u]) => new URL(String(u)));
    expect(urls.filter((u) => u.pathname.endsWith("/actions")).map((u) => u.pathname)).toEqual([
      "/v3/bill/119/s/195/actions",
      "/v3/bill/119/hr/10768/actions",
      "/v3/bill/119/hr/9772/actions",
      "/v3/bill/119/s/50/actions",
    ]);
    expect(urls[0]!.searchParams.get("fromDateTime")).toBe("2026-10-07T00:00:00Z");
    expect(urls[0]!.searchParams.has("api_key")).toBe(false);
    expect(new Headers(fetchSpy.mock.calls[0]![1]?.headers).get("x-api-key")).toBe("k");
  });

  it("throws when the bill list fails, so the run counts the source as failed", async () => {
    vi.stubEnv("USA_GOV_API_KEY", "k");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 429 }));
    await expect(fetchCongress(ctx)).rejects.toThrow("HTTP 429");
  });
});
