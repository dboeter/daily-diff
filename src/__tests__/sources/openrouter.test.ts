import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractJsonArray,
  extractRscPayload,
  fetchModelCatalogDaily,
  isStealthModel,
  parseOpenRouterApps,
  parseOpenRouterModels,
  selectAgentApps,
  selectStealthModels,
  type OpenRouterApp,
} from "../../sources/openrouter.ts";

/** Wrap payload text in RSC script chunks, split at the given offsets. */
function rscHtml(payload: string, splits: number[] = []): string {
  const bounds = [0, ...splits, payload.length];
  const chunks = bounds.slice(1).map((end, i) => payload.slice(bounds[i], end));
  return chunks.map((c) => `<script>self.__next_f.push([1,${JSON.stringify(c)}])</script>`).join("\n");
}

const entry = (id: number, rank: number, title: string, extra: Record<string, unknown> = {}) => ({
  app_id: id,
  total_tokens: String(id * 1_000_000_000),
  rank,
  app: {
    title,
    description: `${title} desc`,
    origin_url: `https://${id}.example`,
    created_at: "2025-01-01T00:00:00Z",
    categories: ["cli-agent"],
    ...extra,
  },
});

describe("extractRscPayload", () => {
  it("joins chunks split mid-string and unescapes them", () => {
    const payload = '{"title":"He said \\"hi\\"","n":1}';
    const text = extractRscPayload(rscHtml(payload, [12]));
    expect(JSON.parse(text)).toEqual({ title: 'He said "hi"', n: 1 });
  });

  it("returns an empty string when there are no chunks", () => {
    expect(extractRscPayload("<html></html>")).toBe("");
  });
});

describe("extractJsonArray", () => {
  it("bracket-matches past brackets, braces and escaped quotes inside strings", () => {
    const text = 'x"list":[{"a":"]}[{\\"","b":[1,2]},{"c":"}"}],"after":[9]';
    expect(extractJsonArray(text, "list")).toEqual([{ a: ']}[{"', b: [1, 2] }, { c: "}" }]);
  });

  it("returns null for a missing key or a truncated array", () => {
    expect(extractJsonArray('"other":[1]', "list")).toBeNull();
    expect(extractJsonArray('"list":[1,2', "list")).toBeNull();
  });
});

describe("parseOpenRouterApps", () => {
  it("joins day/week/month ranks and trending growth by app id", () => {
    const payload = JSON.stringify({
      globalRankingMap: {
        day: [entry(1, 1, "Old"), entry(2, 2, "New")],
        week: [entry(1, 1, "Old")],
        month: [entry(1, 1, "Old")],
      },
      trending: [{ appAnalytics: entry(2, 2, "New"), growthPercent: 776 }],
    });
    const apps = parseOpenRouterApps(rscHtml(payload, [50, 200]));
    expect(apps).toHaveLength(2);
    expect(apps.find((a) => a.title === "Old")).toMatchObject({
      dayRank: 1,
      weekRank: 1,
      monthRank: 1,
      weekTokens: 1e9,
      growthPercent: null,
    });
    expect(apps.find((a) => a.title === "New")).toMatchObject({
      dayRank: 2,
      weekRank: null,
      monthRank: null,
      growthPercent: 776,
      url: "https://2.example",
    });
  });

  it("returns an empty list when the payload has no ranking data", () => {
    expect(parseOpenRouterApps(rscHtml('{"unrelated":true}'))).toEqual([]);
  });
});

describe("selectAgentApps", () => {
  const app = (over: Partial<OpenRouterApp>): OpenRouterApp => ({
    appId: 0,
    title: "x",
    description: "",
    url: "",
    categories: [],
    createdAt: "2025-01-01T00:00:00Z",
    weekTokens: 0,
    dayRank: null,
    weekRank: null,
    monthRank: null,
    growthPercent: null,
    ...over,
  });
  const now = Date.parse("2026-03-09T00:00:00Z");

  it("keeps trending, top agent-category and recently listed apps, trending first", () => {
    const selected = selectAgentApps(
      [
        app({ title: "roleplay", categories: ["roleplay"], dayRank: 3 }),
        app({ title: "agent", categories: ["cli-agent"], dayRank: 5 }),
        app({ title: "agent-low", categories: ["cli-agent"], dayRank: 150, weekRank: 180 }),
        app({ title: "fresh", createdAt: "2026-03-01T00:00:00Z", dayRank: 190 }),
        app({ title: "trending", categories: ["roleplay"], dayRank: 40, growthPercent: 50 }),
      ],
      now,
    );
    expect(selected.map((a) => a.title)).toEqual(["trending", "agent", "fresh"]);
  });
});

describe("parseOpenRouterModels", () => {
  it("sums prompt + completion tokens for the latest snapshot day", () => {
    const row = (date: string, slug: string, p: number, c: number) => ({
      date: `${date} 00:00:00`,
      model_permaslug: slug,
      variant: "standard",
      total_completion_tokens: c,
      total_prompt_tokens: p,
    });
    const payload = JSON.stringify({
      data: [
        row("2026-03-07", "old/model", 999, 999),
        row("2026-03-08", "a/m", 10, 5),
        row("2026-03-08", "b/m", 30, 0),
        row("2026-03-08", "a/m", 1, 0),
      ],
    });
    expect(parseOpenRouterModels(rscHtml(payload))).toEqual({
      date: "2026-03-08",
      models: [
        { slug: "b/m", tokens: 30 },
        { slug: "a/m", tokens: 16 },
      ],
    });
  });
});

describe("isStealthModel", () => {
  it("matches the stealth/ namespace and cloaked/anonymous model descriptions", () => {
    expect(isStealthModel({ id: "stealth/space-bunny-alpha", description: "" })).toBe(true);
    expect(
      isStealthModel({
        id: "openrouter/horizon-alpha",
        description: "This is a cloaked model provided to the community.",
      }),
    ).toBe(true);
    expect(
      isStealthModel({
        id: "x/y",
        description: "Space Bunny Alpha is an anonymous large model with fast inference.",
      }),
    ).toBe(true);
  });

  it("ignores routers and ordinary models", () => {
    expect(
      isStealthModel({ id: "openrouter/auto", description: "The Auto Router selects the best model." }),
    ).toBe(false);
    expect(isStealthModel({ id: "a/b", description: "Collects anonymous usage stats. A great model." })).toBe(
      false,
    );
  });
});

describe("selectStealthModels", () => {
  it("keeps stealth models newest first with their expiration date", () => {
    const m = (id: string, created: string, expiration_date?: string | null) => ({
      id,
      name: id,
      description: "",
      created: Date.parse(created) / 1000,
      context_length: 1,
      expiration_date,
    });
    expect(
      selectStealthModels([
        m("stealth/old", "2026-09-01", null),
        m("vendor/model", "2026-10-01"),
        m("stealth/new", "2026-10-03", "2026-10-20"),
      ]),
    ).toEqual([
      { id: "stealth/new", name: "stealth/new", created: "2026-10-03", expires: "2026-10-20" },
      { id: "stealth/old", name: "stealth/old", created: "2026-09-01", expires: null },
    ]);
  });
});

describe("fetchModelCatalogDaily", () => {
  afterEach(() => vi.unstubAllGlobals());
  const NOW = Date.parse("2026-10-22T03:00:00Z");
  const m = (id: string, created: string) => ({
    id,
    name: id,
    description: "",
    created: Date.parse(created) / 1000,
    context_length: 1000,
  });

  it("derives the stealth list and the models listed in 2 days, stealth ones left out, from one fetch", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: [m("stealth/s", "2026-10-21"), m("v/new", "2026-10-21"), m("v/old", "2026-10-18")],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const catalog = await fetchModelCatalogDaily(NOW);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(catalog?.stealth.map((s) => s.id)).toEqual(["stealth/s"]);
    expect(catalog?.newModels.map((s) => s.id)).toEqual(["v/new"]);
  });

  it("is null when the catalog fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 503 })),
    );
    expect(await fetchModelCatalogDaily(NOW)).toBeNull();
  });
});
