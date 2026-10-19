import { describe, it, expect, vi, afterEach } from "vitest";
import { billStage, fetchOpenStates } from "../policy/openstates.ts";
import type { PolicyConfig } from "../core/config.ts";

// Built from the public OpenAPI schema (v3.openstates.org/openapi.json, BillList/Bill/BillAction)
// and the openstates-core action classifications: no key, so no live response.
const senate = { id: "s", name: "Senate", classification: "upper" };
const assembly = { id: "a", name: "Assembly", classification: "lower" };
const governor = { id: "g", name: "Governor", classification: "executive" };
const unicameral = { id: "l", name: "Legislature", classification: "legislature" };
let order = 0;
const action = (date: string, classification: string[], organization = senate) => ({
  id: `act-${++order}`,
  organization,
  description: classification.join(", ") || "Read first time",
  date,
  classification,
  order,
});

const introduced = action("2026-02-01", ["introduction", "referral-committee"]);
const passedSenate = action("2026-05-20", ["reading-3", "passage"]);
const passedAssembly = action("2026-09-10", ["passage"], assembly);
const signed = action("2026-10-08", ["executive-signature"], governor);

describe("billStage", () => {
  it("reports nothing for an introduced-only bill, or a committee vote", () => {
    expect(billStage([introduced, action("2026-03-01", ["committee-passage"])])).toBeNull();
  });

  it("names the chamber a bill passed", () => {
    expect(billStage([introduced, passedSenate])).toEqual({ stage: "Passed the Senate", date: "2026-05-20" });
  });

  it("passed both chambers", () => {
    expect(billStage([introduced, passedSenate, passedAssembly])).toEqual({
      stage: "Passed both chambers",
      date: "2026-09-10",
    });
  });

  it("enacted: signed or became law without a signature", () => {
    expect(billStage([passedSenate, passedAssembly, signed])).toEqual({
      stage: "Enacted",
      date: "2026-10-08",
    });
    expect(
      billStage([passedSenate, passedAssembly, action("2026-10-09", ["became-law"], governor)])?.stage,
    ).toBe("Enacted");
  });

  it("vetoed", () => {
    expect(
      billStage([passedSenate, passedAssembly, action("2026-10-01", ["executive-veto"], governor)]),
    ).toEqual({
      stage: "Vetoed",
      date: "2026-10-01",
    });
  });

  it("a unicameral legislature's passage counts as passing a chamber", () => {
    expect(billStage([action("2026-04-01", ["passage"], unicameral)])?.stage).toBe("Passed the Legislature");
  });

  it("orders actions by date, not by array position", () => {
    expect(billStage([signed, passedAssembly, passedSenate])?.stage).toBe("Enacted");
  });
});

const config: PolicyConfig = {
  readerProfile: "A practitioner.",
  watchlist: { eu: [], nl: [], usFederal: [], usStates: [] },
  feeds: [],
  dataLaw: [],
  calendar: [],
};
const ctx = { config, now: new Date("2026-10-13T23:00:00Z"), dateStr: "2026-10-14", state: null };

const bill = (id: string, actions: unknown[], classification = "state") => ({
  id: `ocd-bill/${id}`,
  session: "2025-2026",
  jurisdiction: { id: "ocd-jurisdiction/x", name: "California", classification },
  from_organization: senate,
  identifier: "SB 53",
  title: "Artificial intelligence models: large developers",
  created_at: "2026-01-05T00:00:00Z",
  updated_at: "2026-10-09T00:00:00Z",
  openstates_url: `https://openstates.org/ca/bills/${id}/`,
  latest_action_date: "2026-10-08",
  latest_action_description: "Signed by the Governor",
  actions,
});
const page = (results: unknown[], p: number, maxPage: number) =>
  new Response(
    JSON.stringify({ results, pagination: { per_page: 20, page: p, max_page: maxPage, total_items: 99 } }),
  );

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("fetchOpenStates", () => {
  it("without PLURAL_API_KEY, logs and returns no items without a request", async () => {
    vi.stubEnv("PLURAL_API_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await fetchOpenStates(ctx)).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining("PLURAL_API_KEY"));
  });

  it("one all-states search: keeps state bills whose stage moved in the window, key in a header", async () => {
    vi.stubEnv("PLURAL_API_KEY", "k");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      page(
        [
          bill("enacted", [passedSenate, passedAssembly, signed]),
          bill("introduced", [introduced]),
          // Passed in May, only a committee action since: an old stage is not news.
          bill("stale", [passedSenate, action("2026-10-05", ["referral-committee"], assembly)]),
          bill("federal", [passedSenate, passedAssembly, signed], "country"),
        ],
        1,
        1,
      ),
    );
    const items = await fetchOpenStates(ctx);
    expect(items).toEqual([
      expect.objectContaining({
        id: "openstates:ocd-bill/enacted",
        title: "California SB 53: Artificial intelligence models: large developers",
        link: "https://openstates.org/ca/bills/enacted/",
        published: "2026-10-08",
        jurisdiction: "us_states",
        jevOnly: false,
        stage: "Enacted",
      }),
    ]);
    const [url, init] = fetchSpy.mock.calls[0]!;
    const params = new URL(String(url)).searchParams;
    expect(params.get("q")).toContain('"artificial intelligence"');
    // A bare term is a whole-lexeme match in websearch_to_tsquery: "AI", never inside "said".
    expect(params.get("q")).toMatch(/ OR AI$/);
    expect(params.get("action_since")).toBe("2026-09-30");
    expect(params.getAll("include")).toEqual(["actions"]);
    expect(params.has("apikey")).toBe(false);
    expect(new Headers(init?.headers).get("x-api-key")).toBe("k");
  });

  it("stops at the page cap, and keeps the pages that arrived when a later one fails", async () => {
    vi.stubEnv("PLURAL_API_KEY", "k");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const many = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => page([bill(`b${++order}`, [signed])], 1, 50));
    expect(await fetchOpenStates(ctx)).toHaveLength(5);
    expect(many).toHaveBeenCalledTimes(5);

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(page([bill("first", [signed])], 1, 3))
      .mockResolvedValueOnce(new Response("", { status: 429 }));
    expect((await fetchOpenStates(ctx)).map((i) => i.id)).toEqual(["openstates:ocd-bill/first"]);
  });

  it("throws when the first page fails, so the run counts the source as failed", async () => {
    vi.stubEnv("PLURAL_API_KEY", "k");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 403 }));
    await expect(fetchOpenStates(ctx)).rejects.toThrow("HTTP 403");
  });
});
