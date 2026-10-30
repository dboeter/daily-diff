import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CommunityFeed } from "../../core/config.ts";
import type { AskJev } from "../../core/jev.ts";
import {
  communityVerdict,
  fetchCommunityPosts,
  INSIGHT_MIN,
  unshownPosts,
  keywordVerdict,
  MAX_COMMUNITY_ROWS,
  postId,
  selectCommunityPosts,
  type CommunityAnswers,
  type CommunityPost,
} from "../../data/community.ts";

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "..", "fixtures", name), "utf-8");

const feed = (name: string, over: Partial<CommunityFeed> = {}): CommunityFeed => ({
  name,
  url: `https://example.com/${name.toLowerCase().replace(/\s+/g, "-")}/feed`,
  kind: "blog",
  cap: 1,
  ...over,
});

const post = (id: string, over: Partial<CommunityPost> = {}): CommunityPost => ({
  id: `post:example.com/${id}`,
  source: "DuckDB blog",
  kind: "blog",
  title: `Post ${id}`,
  url: `https://example.com/${id}`,
  published: "2026-10-29T00:00:00.000Z",
  date: "2026-10-29",
  description: `Description of ${id}`,
  ...over,
});

const answers = (insight: number, audience: string, confidence = 1): CommunityAnswers => ({
  insight: { score: insight, confidence },
  audience: { choice: audience, confidence: 0.9, probabilities: { [audience]: 0.9 } },
});

/** A Jev stub answering from `byTitle`; a title without an entry throws (a failed call). */
const askWith =
  (byTitle: Record<string, CommunityAnswers>): AskJev =>
  async (state) => {
    const a = byTitle[(state as { title: string }).title];
    if (!a) throw new Error("no stub answer");
    return { model: "jev-test", answers: a };
  };

afterEach(() => vi.restoreAllMocks());

describe("fetchCommunityPosts", () => {
  it("reads Atom and RSS feeds into posts of the last 7 days, one per link, and skips a failed feed", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const feeds = [feed("DuckDB blog"), feed("Snowflake on Medium", { cap: 2 }), feed("Broken")];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes("duckdb")) return new Response(fixture("duckdb-blog-2026-10-30.xml"));
      if (u.includes("medium")) return new Response(fixture("medium-snowflake-2026-10-30.xml"));
      return new Response("", { status: 403 });
    });
    const { posts, fetchSuccess, counts } = await fetchCommunityPosts(
      feeds,
      new Date("2026-10-30T06:00:00Z"),
    );
    expect(fetchSuccess).toBe(true);
    expect(counts).toEqual({ "DuckDB blog": 2, "Snowflake on Medium": 2, Broken: null });
    expect(posts.map((p) => [p.source, p.date, p.title])).toEqual([
      ["DuckDB blog", "2026-10-29", "From Spreadsheets to DuckLake: A Data Engineer's Road to DuckDB"],
      ["DuckDB blog", "2026-10-26", "Gems of DuckDB 2.0.0"],
      ["Snowflake on Medium", "2026-10-30", "A Martech Perspective on Databricks’ New CDP Capability"],
      [
        "Snowflake on Medium",
        "2026-10-29",
        "The Agent Is Now a Pipeline Step: Keeping CoCo Automations and Cloud Agents Reproducible",
      ],
    ]);
    // Atom: the alternate link and the summary; RSS without a description: content:encoded.
    const duck = posts[0]!;
    expect(duck.url).toBe("https://duckdb.org/2026/10/29/from-spreadsheets-to-ducklake.html");
    expect(duck.id).toBe(postId(duck.url));
    expect(duck.description).toMatch(/^After nearly two decades/);
    expect(posts[2]!.description.length).toBeGreaterThan(50);
    expect(posts[2]!.description).not.toMatch(/<[a-z]/);
    // Medium's `?source=rss…` tracking parameter is dropped from the link and so from the id.
    expect(posts[2]!.url).toBe(
      "https://medium.com/snowflake/a-martech-perspective-on-databricks-new-cdp-capability-b0fadcb6f2c9",
    );
    expect(posts[2]!.id).toBe(
      "post:medium.com/snowflake/a-martech-perspective-on-databricks-new-cdp-capability-b0fadcb6f2c9",
    );
  });

  it("drops posts older than 7 days and reports no success when every feed failed", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(fixture("duckdb-blog-2026-10-30.xml")),
    );
    const late = await fetchCommunityPosts([feed("DuckDB blog")], new Date("2026-11-10T06:00:00Z"));
    expect(late.posts).toEqual([]);
    expect(late.counts).toEqual({ "DuckDB blog": 2 });
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("", { status: 500 }));
    const failed = await fetchCommunityPosts([feed("DuckDB blog")], new Date("2026-10-30T06:00:00Z"));
    expect(failed).toEqual({ posts: [], fetchSuccess: false, counts: { "DuckDB blog": null } });
    // No feeds configured is not a failure.
    expect((await fetchCommunityPosts([], new Date("2026-10-30T06:00:00Z"))).fetchSuccess).toBe(true);
  });

  it("measures the 7-day window in time, not calendar dates", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(fixture("duckdb-blog-2026-10-30.xml")),
    );
    // The older post is dated 2026-10-26T00:00Z: in the window up to that instant 7 days on, out after it.
    const inWindow = await fetchCommunityPosts([feed("DuckDB blog")], new Date("2026-11-01T23:59:00Z"));
    expect(inWindow.posts.map((p) => p.date)).toEqual(["2026-10-29", "2026-10-26"]);
    const edge = await fetchCommunityPosts([feed("DuckDB blog")], new Date("2026-11-02T00:01:00Z"));
    expect(edge.posts.map((p) => p.date)).toEqual(["2026-10-29"]);
  });
});

describe("unshownPosts", () => {
  it("drops a post an earlier report showed, as news or as a row, and keeps one shown today", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { matchProjectNews } = await import("../../reports/project-news.ts");
    const duckdb = { id: "duckdb", repo: "duckdb/duckdb", name: "DuckDB" };
    const posts = [
      post("a", { title: "Gems of DuckDB 2.0.0" }),
      post("b", { title: "Iceberg metadata explained" }),
      post("c", { title: "A new post today" }),
    ];
    // Day 1: a is DuckDB news, b a News & discussion candidate; the report records both.
    const day1 = unshownPosts(posts, {}, "2026-10-29");
    const news1 = matchProjectNews([duckdb], { posts: day1 }, Infinity);
    expect(news1.get("duckdb")!.map((n) => n.id)).toEqual([posts[0]!.id]);
    const reported = { [posts[0]!.id]: "2026-10-29", [posts[1]!.id]: "2026-10-29" };
    // Day 2: neither comes back, as news or as a candidate; the feed still lists them.
    const day2 = unshownPosts(posts, reported, "2026-10-30");
    expect(day2.map((p) => p.id)).toEqual([posts[2]!.id]);
    expect(matchProjectNews([duckdb], { posts: day2 }, Infinity).get("duckdb")).toEqual([]);
    // A same-day re-run shows day 1's posts again.
    expect(unshownPosts(posts, reported, "2026-10-29")).toHaveLength(3);
  });
});

describe("communityVerdict", () => {
  it("keeps a confident insight at the bar for an on-audience post and nothing else", () => {
    expect(communityVerdict(answers(INSIGHT_MIN, "open_source_stack"))).toEqual({
      keep: true,
      audience: "open_source_stack",
      relevance: INSIGHT_MIN,
    });
    expect(communityVerdict(answers(1.1, "open_source_stack")).keep).toBe(false);
    expect(communityVerdict(answers(2, "off_audience")).keep).toBe(false);
    // An unsure score is unknown, which does not keep.
    expect(communityVerdict(answers(2, "databricks", 0.2)).keep).toBe(false);
  });

  it("throws on an unexpected shape, so the call counts as failed", () => {
    expect(() => communityVerdict({ insight: { score: 1 } } as CommunityAnswers)).toThrow(
      "Unexpected Jev answers",
    );
    expect(() => communityVerdict(answers(1, "marketing"))).toThrow("Unexpected Jev answers");
  });
});

describe("keywordVerdict", () => {
  it("keeps a post naming a data term unless it has a marketing shape", () => {
    expect(
      keywordVerdict({ title: "What is inside an Iceberg table?", description: "Apache Iceberg metadata" })
        .keep,
    ).toBe(true);
    expect(keywordVerdict({ title: "Join our webinar on Apache Iceberg", description: "" }).keep).toBe(false);
    expect(keywordVerdict({ title: "Our Series B", description: "funding round" }).keep).toBe(false);
    expect(keywordVerdict({ title: "A career retrospective", description: "" }).keep).toBe(false);
  });
});

describe("selectCommunityPosts", () => {
  const feeds = [feed("DuckDB blog"), feed("Snowflake on Medium", { cap: 2 })];

  it("keeps Jev's rows, one per feed unless its cap says more, newest first, numbered after the given count", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const posts = [
      post("a", { title: "Iceberg internals", published: "2026-10-27T00:00:00Z", date: "2026-10-27" }),
      post("b", { title: "DuckDB release recap", published: "2026-10-29T00:00:00Z", date: "2026-10-29" }),
      post("c", {
        source: "Snowflake on Medium",
        title: "Snowpark to_polars",
        published: "2026-10-29T00:00:00Z",
        date: "2026-10-29",
      }),
      post("d", {
        source: "Snowflake on Medium",
        title: "Cost controls",
        published: "2026-10-28T00:00:00Z",
        date: "2026-10-28",
      }),
      post("e", {
        source: "Snowflake on Medium",
        title: "Braze acquisition",
        published: "2026-10-30T00:00:00Z",
        date: "2026-10-30",
      }),
    ];
    const sel = await selectCommunityPosts(posts, {
      feeds,
      apiKey: "k",
      cache: { items: {} },
      dateStr: "2026-10-30",
      fetched: { "DuckDB blog": 2, "Snowflake on Medium": 3 },
      numberAfter: 4,
      ask: askWith({
        "Iceberg internals": answers(1.9, "open_source_stack"),
        "DuckDB release recap": answers(1.3, "open_source_stack"),
        "Snowpark to_polars": answers(1.6, "snowflake"),
        "Cost controls": answers(1.5, "snowflake"),
        "Braze acquisition": answers(0.4, "off_audience"),
      }),
    });
    // DuckDB: the higher insight of its two kept posts; Medium: both under its cap of 2.
    expect(sel.rows.map((r) => [r.n, r.title, r.audience])).toEqual([
      [5, "Snowpark to_polars", "snowflake"],
      [6, "Cost controls", "snowflake"],
      [7, "Iceberg internals", "open_source_stack"],
    ]);
    expect(sel.rankedBy).toBe("jev");
    expect(Object.keys(sel.nextVerdicts!.items)).toHaveLength(5);
    const trace = JSON.parse(sel.traceFile) as {
      sources: Record<string, { fetched: number; judged: number }>;
      items: { title: string; rendered: boolean; dropped_reason?: string; relevance: number }[];
    };
    expect(trace.sources).toEqual({
      "DuckDB blog": { fetched: 2, judged: 2 },
      "Snowflake on Medium": { fetched: 3, judged: 3 },
    });
    expect(Object.fromEntries(trace.items.map((i) => [i.title, i.dropped_reason ?? "row"]))).toEqual({
      "Iceberg internals": "row",
      "DuckDB release recap": "cap",
      "Snowpark to_polars": "row",
      "Cost controls": "row",
      "Braze acquisition": "threshold",
    });
  });

  it("drops a post whose link another row shows, and caps the table", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const posts = Array.from({ length: MAX_COMMUNITY_ROWS + 2 }, (_, i) =>
      post(`p${i}`, {
        source: `Feed ${i}`,
        title: `Post ${i}`,
        published: `2026-10-${String(20 + i).padStart(2, "0")}T00:00:00Z`,
      }),
    );
    const sel = await selectCommunityPosts(posts, {
      feeds: posts.map((p) => feed(p.source)),
      apiKey: "k",
      cache: { items: {} },
      dateStr: "2026-10-30",
      fetched: {},
      taken: new Set(["example.com/p0"]),
      ask: askWith(
        Object.fromEntries(posts.map((p, i) => [p.title, answers(2 - i * 0.05, "general_data_engineering")])),
      ),
    });
    expect(sel.rows).toHaveLength(MAX_COMMUNITY_ROWS);
    const trace = JSON.parse(sel.traceFile) as { items: { title: string; dropped_reason?: string }[] };
    const reasons = Object.fromEntries(trace.items.map((i) => [i.title, i.dropped_reason]));
    expect(reasons["Post 0"]).toBe("repeat");
    // The lowest insight of the rest is over the cap.
    expect(reasons[`Post ${MAX_COMMUNITY_ROWS + 1}`]).toBe("cap");
  });

  it("falls back to the keyword rules without a key, and reuses saved verdicts", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const posts = [
      post("a", { title: "Apache Iceberg metadata explained" }),
      post("b", { title: "Join our webinar" }),
    ];
    const noKey = await selectCommunityPosts(posts, {
      feeds,
      cache: { items: {} },
      dateStr: "2026-10-30",
      fetched: {},
    });
    expect(noKey.rankedBy).toBe("keywords");
    expect(noKey.rows.map((r) => r.title)).toEqual(["Apache Iceberg metadata explained"]);
    const cached = await selectCommunityPosts(posts, {
      feeds,
      apiKey: "k",
      cache: {
        items: {
          [posts[1]!.id]: {
            title: posts[1]!.title,
            answers: answers(2, "open_source_stack"),
            decided: "2026-10-29",
            lastSeen: "2026-10-29",
          },
        },
      },
      dateStr: "2026-10-30",
      fetched: {},
      ask: askWith({ "Apache Iceberg metadata explained": answers(0.2, "open_source_stack") }),
    });
    // The saved verdict keeps b without a call; a's fresh answer drops it.
    expect(cached.rows.map((r) => r.title)).toEqual(["Join our webinar"]);
    expect(cached.nextVerdicts!.items[posts[1]!.id]!.lastSeen).toBe("2026-10-30");
  });
});
