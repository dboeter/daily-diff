import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractJsonArray,
  extractRscPayload,
  fetchModelCatalogDaily,
  isStealthModel,
  parseOpenRouterApps,
  parseOpenRouterModels,
  publicUrl,
  selectAgentApps,
  selectNewModels,
  selectStealthModels,
  type OpenRouterApp,
} from "../../sources/openrouter.ts";

describe("publicUrl", () => {
  it("rejects .local and localhost origins, which no reader can open", () => {
    expect(publicUrl("https://birdstrike.local/")).toBe("");
    expect(publicUrl("http://localhost:3000/")).toBe("");
    expect(publicUrl("not a url")).toBe("");
    expect(publicUrl(null)).toBe("");
    expect(publicUrl("https://strix.ai/")).toBe("https://strix.ai/");
  });
});

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

  it("skips an earlier data array without token rows (2026-11-16: a model list came first)", () => {
    const payload =
      JSON.stringify({ state: { data: [{ id: "x/list-model", slug: "x/list-model" }] } }) +
      JSON.stringify({
        state: {
          data: [
            {
              date: "2026-11-15 00:00:00",
              model_permaslug: "a/m",
              total_prompt_tokens: 7,
              total_completion_tokens: 3,
            },
          ],
        },
      });
    expect(parseOpenRouterModels(rscHtml(payload))).toEqual({
      date: "2026-11-15",
      models: [{ slug: "a/m", tokens: 10 }],
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

describe("selectNewModels", () => {
  const T = Date.parse("2026-11-18T03:00:00Z");
  const at = (iso: string) => Date.parse(iso) / 1000;
  const model = (id: string, name: string, created: string, description = "A model.") => ({
    id,
    name,
    description,
    created: at(created),
    context_length: 1_050_000,
  });
  const sameAs = (name: string, base: string) =>
    `${name} Pro is the same underlying model as [${name}](https://openrouter.ai/${base}), served with reasoning.mode set to pro.`;
  // The catalog of 2026-11-18: GPT-6.2 Astra and Sol, each listed four times (Pro mode, batch copies).
  const catalog = [
    model(
      "openai/gpt-6.2-astra-pro",
      "OpenAI: GPT-6.2 Astra Pro",
      "2026-11-17T18:00:05Z",
      sameAs("GPT-6.2 Astra", "openai/gpt-6.2-astra"),
    ),
    model(
      "openai/gpt-6.2-astra-pro:batch",
      "OpenAI: GPT-6.2 Astra Pro (batch)",
      "2026-11-17T18:00:04Z",
      sameAs("GPT-6.2 Astra", "openai/gpt-6.2-astra"),
    ),
    model("openai/gpt-6.2-astra", "OpenAI: GPT-6.2 Astra", "2026-11-17T18:00:03Z", "The flagship model."),
    model(
      "openai/gpt-6.2-astra:batch",
      "OpenAI: GPT-6.2 Astra (batch)",
      "2026-11-17T18:00:02Z",
      "The flagship model.",
    ),
    model(
      "openai/gpt-6.2-sol-pro",
      "OpenAI: GPT-6.2 Sol Pro",
      "2026-11-17T18:00:01Z",
      sameAs("GPT-6.2 Sol", "openai/gpt-6.2-sol"),
    ),
    model(
      "openai/gpt-6.2-sol-pro:batch",
      "OpenAI: GPT-6.2 Sol Pro (batch)",
      "2026-11-17T18:00:00Z",
      sameAs("GPT-6.2 Sol", "openai/gpt-6.2-sol"),
    ),
    model("openai/gpt-6.2-sol", "OpenAI: GPT-6.2 Sol", "2026-11-17T17:59:59Z"),
    model("openai/gpt-6.2-sol:batch", "OpenAI: GPT-6.2 Sol (batch)", "2026-11-17T17:59:58Z"),
    model("tencent/hy4-flash", "Tencent: Hy4 flash", "2026-11-16T14:18:00Z"),
    model("qwen/qwen4-max", "Qwen: Qwen4 Max", "2026-11-16T05:00:00Z"),
    // Controls: a :free model with no base, a Pro whose base is older than the window,
    // a batch copy of an older model.
    model("cohere/north-mini-code:free", "Cohere: North Mini Code (free)", "2026-11-17T10:00:00Z"),
    model("openai/gpt-7-pro", "OpenAI: GPT-7 Pro", "2026-11-17T09:00:00Z", sameAs("GPT-7", "openai/gpt-7")),
    model("openai/gpt-7", "OpenAI: GPT-7", "2026-10-01T09:00:00Z"),
    model("anthropic/claude-fable-5.2:batch", "Anthropic: Claude Fable 5.2 (batch)", "2026-11-17T08:00:00Z"),
    model("anthropic/claude-fable-5.2", "Anthropic: Claude Fable 5.2", "2026-09-01T08:00:00Z"),
    model(
      "openai/gpt-7-pro:batch",
      "OpenAI: GPT-7 Pro (batch)",
      "2026-11-17T08:59:00Z",
      sameAs("GPT-7", "openai/gpt-7"),
    ),
  ];

  it("lists a model once, its Pro mode and batch copies as variants of its row", () => {
    const rows = selectNewModels(catalog, 2, T);
    expect(rows.map((r) => r.id)).toEqual([
      "openai/gpt-6.2-astra",
      "openai/gpt-6.2-sol",
      "cohere/north-mini-code:free",
      "openai/gpt-7-pro",
      "tencent/hy4-flash",
      "qwen/qwen4-max",
    ]);
    expect(rows[0]?.variants).toEqual([
      { id: "openai/gpt-6.2-astra-pro", label: "Pro" },
      { id: "openai/gpt-6.2-astra-pro:batch", label: "Pro batch" },
      { id: "openai/gpt-6.2-astra:batch", label: "batch" },
    ]);
    expect(rows[0]?.description).toBe("The flagship model.");
    expect(rows[2]?.variants).toEqual([]);
    expect(rows[3]?.variants).toEqual([{ id: "openai/gpt-7-pro:batch", label: "batch" }]);
  });
});

describe("selectNewModels link cycle", () => {
  it("keeps one row when two new entries name each other as their base", () => {
    const desc = (base: string) => `Same underlying model as [X](https://openrouter.ai/${base}).`;
    const created = Date.parse("2026-11-17T12:00:00Z") / 1000;
    const rows = selectNewModels(
      [
        { id: "a/b", name: "B", description: desc("a/c"), created, context_length: 1 },
        { id: "a/c", name: "C", description: desc("a/b"), created, context_length: 1 },
      ],
      2,
      Date.parse("2026-11-18T03:00:00Z"),
    );
    expect(rows.map((r) => [r.id, r.variants.map((v) => v.id)])).toEqual([["a/b", ["a/c"]]]);
  });
});
