import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchUsRules } from "../policy-usrules.ts";
import type { PolicyConfig } from "../config.ts";

// Shapes from live responses (2026-10-14): federalregister.gov/api/v1/documents.json and
// api.regulations.gov/v4/documents (DEMO_KEY).
const config: PolicyConfig = {
  readerProfile: "A practitioner.",
  watchlist: { eu: [], nl: [], usFederal: ["NIST-2026-0100", "0693-AB12"], usStates: [] },
  feeds: [],
  calendar: [],
};
const ctx = { config, now: new Date("2026-10-13T23:00:00Z"), dateStr: "2026-10-14", state: null };

const frDoc = (n: string, over: Record<string, unknown>) => ({
  document_number: n,
  type: "Notice",
  subtype: null,
  title: "Safety Zone; Chicago River",
  abstract: null,
  publication_date: "2026-10-13",
  comments_close_on: null,
  docket_ids: [],
  regulation_id_numbers: [],
  html_url: `https://www.federalregister.gov/documents/2026/10/13/${n}/x`,
  agencies: [{ name: "Coast Guard" }],
  regulations_dot_gov_info: {},
  ...over,
});
const regsDoc = (id: string, docketId: string, frDocNum: string | null, title: string) => ({
  type: "documents",
  id,
  attributes: {
    agencyId: id.split("-")[0],
    frDocNum,
    documentType: "Proposed Rule",
    // 23:59:59 Eastern on 2026-12-14.
    commentEndDate: "2026-12-15T04:59:59Z",
    postedDate: "2026-10-13T04:00:00Z",
    title,
    docketId,
  },
});

const frResults = [
  frDoc("2026-1", {
    title: "Request for Information: Securing AI Agent Systems",
    comments_close_on: "2026-11-23",
    agencies: [{ name: "National Institute of Standards and Technology" }],
    regulations_dot_gov_info: { docket_id: "NIST-2026-0200", document_id: "NIST-2026-0200-0001" },
  }),
  frDoc("2026-2", {
    type: "Proposed Rule",
    title: "Compute Derivatives",
    abstract: "The Commission proposes rules for derivatives on artificial intelligence compute.",
  }),
  frDoc("2026-3", {
    type: "Presidential Document",
    subtype: "Executive Order",
    title: "Ensuring a National Policy Framework",
  }),
  frDoc("2026-4", {
    title: "Vulnerability Database",
    docket_ids: ["Docket No. 260101-0001"],
    regulation_id_numbers: ["0693-AB12"],
  }),
  // The FCC row had only a document id: its docket is derived from it.
  frDoc("2026-5", {
    title: "Spectrum Rules",
    regulations_dot_gov_info: { document_id: "FCC-2026-3961-0001" },
  }),
  frDoc("2026-6", {
    title: "Safety Zone; Chicago River",
    regulations_dot_gov_info: { docket_id: "USCG-2026-1270" },
  }),
  // "ai" in lower case is not the acronym.
  frDoc("2026-7", { title: "Mauna Kea ai permits" }),
  // Not yet linked to a regulations.gov docket (publication day): matched by document number.
  frDoc("2026-8", { title: "Hydropower Licensing" }),
];
const regsResults = [
  regsDoc("FERC-2026-0300-0001", "FERC-2026-0300", "2026-8", "Hydropower Licensing"),
  regsDoc("NIST-2026-0200-0001", "NIST-2026-0200", "2026-1", "Securing AI Agent Systems"),
  regsDoc("FCC-2026-3961-0002", "FCC-2026-3961", null, "Spectrum Rules; supplement"),
  regsDoc("USCG-2026-1270-0001", "USCG-2026-1270", "2026-6", "Safety Zone"),
  regsDoc(
    "FTC-2026-1552-0001",
    "FTC-2026-1552",
    "2026-20143",
    "Rule on Impersonation of Government and Businesses",
  ),
];

function route(fr: () => Response, regs: () => Response) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    return url.startsWith("https://www.federalregister.gov/") ? fr() : regs();
  });
}
const json = (body: unknown) => () => new Response(JSON.stringify(body));
const frOk = json({ count: frResults.length, total_pages: 1, results: frResults });
const regsOk = json({ data: regsResults, meta: {} });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("fetchUsRules", () => {
  it("keeps Federal Register documents that name AI, presidential documents and watchlisted dockets/RINs", async () => {
    vi.stubEnv("USA_GOV_API_KEY", "");
    vi.spyOn(console, "log").mockImplementation(() => {});
    const fetchSpy = route(frOk, regsOk);
    const items = await fetchUsRules(ctx);
    expect(items.map((i) => i.id)).toEqual(["us-fr:2026-1", "us-fr:2026-2", "us-fr:2026-3", "us-fr:2026-4"]);
    expect(items[0]).toEqual(
      expect.objectContaining({
        title:
          "National Institute of Standards and Technology: Request for Information: Securing AI Agent Systems",
        link: "https://www.federalregister.gov/documents/2026/10/13/2026-1/x",
        published: "2026-10-13",
        deadline: "2026-11-23",
        source: "Federal Register",
        jurisdiction: "us_federal",
        jevOnly: false,
      }),
    );
    // The watchlist match in policy-jev.ts reads the description.
    expect(items[3]!.description).toContain("0693-AB12");
    // No key: Regulations.gov is skipped without a request.
    expect(fetchSpy).toHaveBeenCalledOnce();
    const params = new URL(String(fetchSpy.mock.calls[0]![0])).searchParams;
    expect(params.get("conditions[publication_date][gte]")).toBe("2026-10-07");
  });

  it("adds Regulations.gov documents whose docket the Federal Register did not return, deadline in Eastern time", async () => {
    vi.stubEnv("USA_GOV_API_KEY", "k");
    const fetchSpy = route(frOk, regsOk);
    const items = await fetchUsRules(ctx);
    expect(items.filter((i) => i.source === "Regulations.gov")).toEqual([
      expect.objectContaining({
        // Same id as the Federal Register document, so the state dedupes it on a later day too.
        id: "us-fr:2026-20143",
        link: "https://www.regulations.gov/document/FTC-2026-1552-0001",
        published: "2026-10-13",
        deadline: "2026-12-14",
        jurisdiction: "us_federal",
      }),
    ]);
    const regsCall = fetchSpy.mock.calls.find(([u]) => String(u).startsWith("https://api.regulations.gov/"))!;
    const params = new URL(String(regsCall[0])).searchParams;
    expect(params.get("filter[documentType]")).toBe("Notice,Proposed Rule,Rule");
    expect(params.get("filter[postedDate][ge]")).toBe("2026-10-07");
    expect(params.has("api_key")).toBe(false);
    expect(new Headers(regsCall[1]?.headers).get("x-api-key")).toBe("k");
  });

  it("keeps the other source's items when one fails, and throws when both do", async () => {
    vi.stubEnv("USA_GOV_API_KEY", "k");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fail = () => new Response("", { status: 500 });
    route(fail, regsOk);
    expect((await fetchUsRules(ctx)).map((i) => i.id)).toEqual([
      "us-fr:2026-8",
      "us-fr:2026-1",
      "regs:FCC-2026-3961-0002",
      "us-fr:2026-6",
      "us-fr:2026-20143",
    ]);
    route(fail, fail);
    await expect(fetchUsRules(ctx)).rejects.toThrow("HTTP 500");
  });
});
