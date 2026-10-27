import fs from "node:fs";
import { describe, expect, it } from "vitest";
import type { DroppedReason } from "../../core/jev.ts";
import {
  type SpottedLog,
  type SpottedPage,
  type Story,
  type StorySource,
  freshStories,
  linkKey,
  carriedStories,
  cleanStoryDescription,
  mostDiscussed,
  nextLog,
  selectSpotted,
  selectTalkedAbout,
  splitPool,
  storiesFrom,
} from "../../spotted/pool.ts";

const DATE = "2026-10-22";

const story = (id: string, source: StorySource = "hn", points = 10, extra: Partial<Story> = {}): Story => ({
  id: `${source}:${id}`,
  source,
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  discussionUrl: `https://news.ycombinator.com/item?id=${id}`,
  points,
  comments: 3,
  published: "2026-10-21T10:00:00Z",
  ...extra,
});

const logged = (
  s: Story,
  fields: Partial<SpottedLog["items"][string]> = {},
): SpottedLog["items"][string] => ({
  source: s.source,
  title: s.title,
  url: s.url,
  discussionUrl: s.discussionUrl,
  points: s.points,
  comments: s.comments,
  firstSeen: "2026-10-20",
  lastSeen: "2026-10-20",
  ...fields,
});

describe("storiesFrom", () => {
  it("maps each source's fields and ids", () => {
    const stories = storiesFrom(
      {
        fetchSuccess: true,
        stories: [
          {
            id: "1",
            title: "HN",
            url: "https://a.com",
            hnUrl: "https://news.ycombinator.com/item?id=1",
            points: 5,
            comments: 2,
            createdAt: "2026-10-21T00:00:00Z",
            description: "Page text",
          },
        ],
      },
      {
        fetchSuccess: true,
        stories: [
          {
            id: "abc",
            title: "L",
            url: "https://b.com",
            commentsUrl: "https://lobste.rs/s/abc",
            score: 7,
            commentCount: 1,
            publishedAt: "2026-10-21T01:00:00Z",
            description: "Post text",
          },
        ],
      },
      {
        fetchSuccess: true,
        articles: [
          {
            id: 9,
            title: "D",
            description: "",
            url: "https://dev.to/x/d",
            publishedAt: "2026-10-21T02:00:00Z",
            positiveReactionsCount: 20,
            commentsCount: 4,
          },
        ],
      },
    );
    expect(stories.map((s) => [s.id, s.discussionUrl, s.points, s.description])).toEqual([
      ["hn:1", "https://news.ycombinator.com/item?id=1", 5, "Page text"],
      ["lobsters:abc", "https://lobste.rs/s/abc", 7, "Post text"],
      ["devto:9", "https://dev.to/x/d", 20, undefined],
    ]);
  });
});

describe("freshStories", () => {
  it("drops a story shown on an earlier day, keeps one shown today for a same-day re-run", () => {
    const [old, today, never, unlogged] = [story("1"), story("2"), story("3"), story("4")];
    const log: SpottedLog = {
      items: {
        [old.id]: logged(old, { shown: "2026-10-21" }),
        [today.id]: logged(today, { shown: DATE }),
        [never.id]: logged(never),
      },
    };
    expect(freshStories([old, today, never, unlogged], log, DATE).map((s) => s.id)).toEqual([
      today.id,
      never.id,
      unlogged.id,
    ]);
  });
});

describe("linkKey", () => {
  it("drops the scheme, www., fragment, trailing slash and utm_* parameters, lowercases the host", () => {
    expect(linkKey("https://WWW.Example.com/Post/?utm_source=hn&utm_medium=x#top")).toBe("example.com/Post");
    expect(linkKey("http://example.com/post")).toBe(linkKey("https://www.example.com/post/"));
  });

  it("keeps the other query parameters: an HN text post is its item id", () => {
    expect(linkKey("https://news.ycombinator.com/item?id=1&utm_campaign=x")).toBe(
      "news.ycombinator.com/item?id=1",
    );
    expect(linkKey("https://news.ycombinator.com/item?id=1")).not.toBe(
      linkKey("https://news.ycombinator.com/item?id=2"),
    );
  });

  it("keeps a route fragment: a single-page app's posts are different links", () => {
    expect(linkKey("https://example.com/#/post/1")).toBe("example.com#/post/1");
    expect(linkKey("https://example.com/#/post/1")).not.toBe(linkKey("https://example.com/#/post/2"));
    expect(linkKey("https://example.com/app#!/post/1")).toBe("example.com/app#!/post/1");
  });

  it("returns an unparsable URL trimmed", () => {
    expect(linkKey("  not a url ")).toBe("not a url");
  });
});

describe("freshStories by link", () => {
  it("keeps every copy of a link no page showed, for the news or a row to claim", () => {
    const hn = story("1", "hn", 10, { url: "https://example.com/a" });
    const lobsters = story("x", "lobsters", 10, { url: "https://www.example.com/a/?utm_source=lobsters" });
    expect(freshStories([hn, lobsters], { items: {} }, DATE).map((s) => s.id)).toEqual([hn.id, lobsters.id]);
  });

  it("drops a story whose link a page showed on an earlier day, from any source", () => {
    const shown = story("x", "lobsters", 10, { url: "https://example.com/a" });
    const copy = story("2", "hn", 10, { url: "http://example.com/a#comments" });
    const other = story("3", "hn", 10, { url: "https://example.com/c" });
    const log: SpottedLog = { items: { [shown.id]: logged(shown, { shown: "2026-10-21" }) } };
    expect(freshStories([copy, other], log, DATE).map((s) => s.id)).toEqual([other.id]);
  });

  it("keeps every copy of a link shown only today, for a same-day re-run to claim again", () => {
    const shownToday = story("y", "lobsters", 10, { url: "https://example.com/b" });
    const copy = story("3", "hn", 500, { url: "https://example.com/b" });
    const log: SpottedLog = { items: { [shownToday.id]: logged(shownToday, { shown: DATE }) } };
    expect(freshStories([copy, shownToday], log, DATE).map((s) => s.id)).toEqual([copy.id, shownToday.id]);
  });
});

describe("nextLog", () => {
  it("updates counts and lastSeen of every fetched story, shown before or not", () => {
    const s = story("1", "hn", 300);
    const log: SpottedLog = { items: { [s.id]: logged({ ...s, points: 10 }, { shown: "2026-10-21" }) } };
    const next = nextLog(log, [{ ...s, comments: 95 }], [], DATE);
    expect(next.items[s.id]).toMatchObject({
      points: 300,
      comments: 95,
      firstSeen: "2026-10-20",
      lastSeen: DATE,
      shown: "2026-10-21",
    });
  });

  it("sets shown only where it has none", () => {
    const [a, b] = [story("a"), story("b")];
    const log: SpottedLog = { items: { [b.id]: logged(b, { shown: "2026-10-20" }) } };
    const next = nextLog(log, [a, b], [a.id, b.id], DATE);
    expect(next.items[a.id]).toMatchObject({ firstSeen: DATE, shown: DATE });
    expect(next.items[b.id]!.shown).toBe("2026-10-20");
  });

  it("logs a story's description, cut at 300 characters", () => {
    const s = story("d", "hn", 10, { description: "x".repeat(400) });
    expect(nextLog({ items: {} }, [s], [], DATE).items[s.id]!.description).toBe("x".repeat(300));
    expect(nextLog({ items: {} }, [story("e")], [], DATE).items["hn:e"]).not.toHaveProperty("description");
  });

  it("prunes entries last seen more than 8 days ago", () => {
    const [kept, pruned] = [story("k"), story("p")];
    const log: SpottedLog = {
      items: {
        [kept.id]: logged(kept, { lastSeen: "2026-10-14" }),
        [pruned.id]: logged(pruned, { lastSeen: "2026-10-13" }),
      },
    };
    expect(Object.keys(nextLog(log, [], [], DATE).items)).toEqual([kept.id]);
  });
});

describe("mostDiscussed", () => {
  it("takes the stories first seen in the 7 days before the run, top 5 HN, 3 Lobste.rs, 3 Dev.to by comments", () => {
    const items: SpottedLog["items"] = {};
    const add = (id: string, source: StorySource, comments: number, firstSeen: string, extra = {}) => {
      const s = story(id, source);
      items[s.id] = logged(s, { comments, firstSeen, ...extra });
    };
    for (let i = 1; i <= 7; i++) add(`h${i}`, "hn", i * 10, "2026-10-20");
    for (let i = 1; i <= 4; i++)
      add(`l${i}`, "lobsters", i * 10, "2026-10-15", i === 4 ? { shown: "2026-10-15" } : {});
    add("d1", "devto", 50, "2026-10-21", { description: "Desc." });
    add("old", "hn", 999, "2026-10-14");
    add("today", "hn", 999, DATE);
    const rows = mostDiscussed({ items }, DATE, []);
    expect(rows.map((r) => r.id)).toEqual([
      "hn:h7",
      "hn:h6",
      "hn:h5",
      "hn:h4",
      "hn:h3",
      "lobsters:l3",
      "lobsters:l2",
      "lobsters:l1",
      "devto:d1",
    ]);
    expect(rows.at(-1)).toMatchObject({ comments: 50, description: "Desc." });
  });

  it("needs MOST_DISCUSSED_MIN_COMMENTS and leaves out the `other` topic", () => {
    const items: SpottedLog["items"] = {};
    for (const [id, source, comments] of [
      ["quiet", "lobsters", 0],
      ["busy", "lobsters", 12],
      ["offtopic", "hn", 400],
    ] as const) {
      const s = story(id, source);
      items[s.id] = logged(s, { comments });
    }
    const rows = mostDiscussed({ items }, DATE, [], (id) => (id === "hn:offtopic" ? "other" : "agents"));
    expect(rows.map((r) => r.id)).toEqual(["lobsters:busy"]);
  });

  it("takes the stories shown only today again, so a same-day re-run shows the same rows", () => {
    const items: SpottedLog["items"] = {};
    for (const [id, shown] of [
      ["first", DATE],
      ["earlier", "2026-10-21"],
    ] as const) {
      const s = story(id);
      items[s.id] = logged(s, { comments: 30, firstSeen: "2026-10-20", shown });
    }
    expect(mostDiscussed({ items }, DATE, []).map((r) => r.id)).toEqual(["hn:first"]);
  });

  it("skips a story a page showed or takes today, by id or link, and takes each link once", () => {
    const items: SpottedLog["items"] = {};
    const add = (id: string, source: StorySource, comments: number, url: string, extra = {}) => {
      const s = story(id, source, 10, { url });
      items[s.id] = logged(s, { comments, firstSeen: "2026-10-20", ...extra });
    };
    add("shown", "hn", 90, "https://example.com/shown", { shown: "2026-10-20" });
    add("shownCopy", "lobsters", 80, "https://www.example.com/shown/");
    add("today", "hn", 70, "https://example.com/today");
    add("todayCopy", "devto", 60, "https://example.com/today#x");
    add("byLink", "hn", 50, "https://example.com/spotted");
    add("kept", "hn", 40, "https://example.com/kept");
    add("keptCopy", "lobsters", 99, "https://example.com/kept?utm_source=x");
    add("other", "lobsters", 30, "https://example.com/other");
    const showing = [
      { id: "hn:today", url: "https://example.com/today" },
      { id: "devto:fresh", url: "https://example.com/spotted" },
    ];
    expect(mostDiscussed({ items }, DATE, showing).map((r) => r.id)).toEqual(["hn:kept", "lobsters:other"]);
  });

  it("claims a link only for a row: a copy below one source's cut can be the next source's row", () => {
    const items: SpottedLog["items"] = {};
    const add = (id: string, source: StorySource, comments: number, url: string) => {
      const s = story(id, source, 10, { url });
      items[s.id] = logged(s, { comments, firstSeen: "2026-10-20" });
    };
    for (let i = 1; i <= 5; i++) add(`top${i}`, "hn", 100 - i, `https://example.com/top${i}`);
    add("belowCut", "hn", 10, "https://example.com/shared");
    add("sharedCopy", "lobsters", 50, "https://example.com/shared");
    const ids = mostDiscussed({ items }, DATE, []).map((r) => r.id);
    expect(ids).not.toContain("hn:belowCut");
    expect(ids).toContain("lobsters:sharedCopy");
  });
});

describe("splitPool", () => {
  // On 6 of 14 days of 2026-10 a new lab post was an HN row too: one page now shows both.
  it("gives every copy of a listed lab post's link to the post, whatever its scheme, www. or slash", () => {
    const fresh = [
      story("post", "hn", 10, { url: "http://anthropic.com/news/claude-x/" }),
      story("postCopy", "lobsters", 5, { url: "https://www.anthropic.com/news/claude-x" }),
      story("other"),
    ];
    const { lab, spotted } = splitPool(fresh, new Set(), ["https://www.anthropic.com/news/claude-x"]);
    expect(lab.map((s) => s.id)).toEqual(["hn:post", "lobsters:postCopy"]);
    expect(spotted.map((s) => s.id)).toEqual(["hn:other"]);
  });

  it("leaves a link a project's news took out of Spotted, and a story naming nothing in it", () => {
    const fresh = [story("news"), story("plain")];
    const { lab, spotted } = splitPool(fresh, new Set([linkKey("https://example.com/news")]), []);
    expect(lab).toEqual([]);
    expect(spotted.map((s) => s.id)).toEqual(["hn:plain"]);
  });
});

describe("selectSpotted", () => {
  it("caps each page at 6 HN, 2 Lobste.rs and 2 Dev.to by points, numbered agents, models, data", () => {
    const stories = [
      ...Array.from({ length: 8 }, (_, i) => story(`h${i}`, "hn", 10 + i)),
      ...Array.from({ length: 3 }, (_, i) => story(`l${i}`, "lobsters", 10 + i)),
      ...Array.from({ length: 3 }, (_, i) => story(`d${i}`, "devto", 10 + i)),
      story("data1", "hn", 1),
      story("models1", "devto", 1),
      story("dropped", "hn", 1000),
    ];
    const pageOf = (s: Story): SpottedPage | null =>
      s.id.includes("data")
        ? "data"
        : s.id.includes("models")
          ? "models"
          : s.id.includes("dropped")
            ? null
            : "agents";
    const rows = selectSpotted(stories, pageOf);
    expect(rows.map((r) => [r.n, r.page, r.id])).toEqual([
      ...[7, 6, 5, 4, 3, 2].map((i, k) => [k + 1, "agents", `hn:h${i}`]),
      [7, "agents", "lobsters:l2"],
      [8, "agents", "lobsters:l1"],
      [9, "agents", "devto:d2"],
      [10, "agents", "devto:d1"],
      [11, "models", "devto:models1"],
      [12, "data", "hn:data1"],
    ]);
  });
});

describe("selectSpotted by link", () => {
  it("leaves a link to another copy when one is routed nowhere or misses its source's cut", () => {
    const routedNowhere = story("1", "hn", 500, { url: "https://example.com/a" });
    const copyA = story("x", "lobsters", 5, { url: "https://www.example.com/a/" });
    const top = Array.from({ length: 6 }, (_, i) => story(`t${i}`, "hn", 100 + i));
    const belowCut = story("low", "hn", 1, { url: "https://example.com/b" });
    const copyB = story("d", "devto", 50, { url: "https://example.com/b" });
    const pageOf = (s: Story): SpottedPage | null => (s === routedNowhere ? null : "agents");
    const ids = selectSpotted([routedNowhere, copyA, ...top, belowCut, copyB], pageOf).map((r) => r.id);
    expect(ids).toContain(copyA.id);
    expect(ids).toContain(copyB.id);
    expect(ids).not.toContain(belowCut.id);
  });

  it("tells why each story got no row: routed nowhere, its link taken, or past its source's cap", () => {
    const nowhere = story("n", "hn", 900);
    const original = story("o", "lobsters", 50, { url: "https://example.com/same" });
    const copy = story("c", "lobsters", 40, { url: "https://example.com/same" });
    const lobsters = [story("l1", "lobsters", 30), story("l2", "lobsters", 20)];
    const dropped = new Map<string, DroppedReason>();
    selectSpotted([nowhere, original, copy, ...lobsters], (s) => (s === nowhere ? null : "agents"), dropped);
    expect(Object.fromEntries(dropped)).toEqual({
      [nowhere.id]: "routing",
      [copy.id]: "repeat",
      [lobsters[1]!.id]: "cap",
    });
  });

  it("takes each link once across pages in numbering order, and a skipped copy takes no slot", () => {
    const first = story("1", "hn", 100, { url: "https://example.com/a" });
    const sameSource = story("l1", "lobsters", 50, { url: "https://example.com/a" });
    const [l2, l3] = [story("l2", "lobsters", 20), story("l3", "lobsters", 10)];
    const otherPage = story("m", "hn", 5, { url: "https://example.com/a" });
    const pageOf = (s: Story): SpottedPage => (s === otherPage ? "models" : "agents");
    const rows = selectSpotted([first, sameSource, l2, l3, otherPage], pageOf);
    expect(rows.map((r) => [r.n, r.page, r.id])).toEqual([
      [1, "agents", first.id],
      [2, "agents", l2.id],
      [3, "agents", l3.id],
    ]);
  });
});

describe("selectSpotted floors", () => {
  const DAY = "2026-10-26";
  const agents = (): SpottedPage => "agents";

  it("drops an unsure topic, an old story and a contest entry as threshold; no verdict passes", () => {
    const unsure = story("unsure", "hn", 300);
    const old = story("old", "hn", 300, { published: "2026-10-01T10:00:00Z" });
    const contest = story("c", "devto", 90, {
      description: "This is a submission for the Hacktoberfest challenge",
    });
    const keyword = story("kw", "hn", 300);
    const dropped = new Map<string, DroppedReason>();
    const rows = selectSpotted([unsure, old, contest, keyword], agents, dropped, {
      dateStr: DAY,
      probabilityOf: (s) => (s === unsure ? 0.43 : s === keyword ? undefined : 0.9),
    });
    expect(rows.map((r) => r.id)).toEqual([keyword.id]);
    expect(Object.fromEntries(dropped)).toEqual({
      [unsure.id]: "threshold",
      [old.id]: "threshold",
      [contest.id]: "threshold",
    });
  });

  it("ranks by topic confidence band, then points", () => {
    const sure = story("sure", "hn", 7);
    const loud = story("loud", "hn", 400);
    const rows = selectSpotted([loud, sure], agents, undefined, {
      probabilityOf: (s) => (s === sure ? 1 : 0.7),
    });
    expect(rows.map((r) => r.id)).toEqual([sure.id, loud.id]);
  });

  it("needs SPOTTED_MIN_POINTS once a page has 3 rows", () => {
    const hn = [story("a", "hn", 400), story("b", "hn", 300), story("c", "hn", 2), story("d", "hn", 200)];
    const lob = story("l", "lobsters", 1);
    const dropped = new Map<string, DroppedReason>();
    const rows = selectSpotted([...hn, lob], agents, dropped);
    // By points c comes fourth, past the first 3 rows, and has 2 points: dropped, as is the lobsters story.
    expect(rows.map((r) => r.id)).toEqual(["hn:a", "hn:b", "hn:d"]);
    expect(dropped.get("hn:c")).toBe("threshold");
    expect(dropped.get(lob.id)).toBe("threshold");
    // Under 3 rows no floor applies: a 1-point story still makes a row.
    expect(selectSpotted([lob], agents).map((r) => r.id)).toEqual([lob.id]);
  });

  it("labels a story cap only when it would otherwise have made a row", () => {
    const top = [story("l1", "lobsters", 30), story("l2", "lobsters", 20)];
    const fill = [story("a", "hn", 400), story("b", "hn", 300)];
    const underFloor = story("l3", "lobsters", 1);
    const copy = story("l4", "lobsters", 10, { url: top[0]!.url });
    const capped = story("l5", "lobsters", 5);
    const dropped = new Map<string, DroppedReason>();
    selectSpotted([...fill, ...top, underFloor, copy, capped], agents, dropped);
    expect(Object.fromEntries(dropped)).toEqual({
      [underFloor.id]: "threshold",
      [copy.id]: "repeat",
      [capped.id]: "cap",
    });
  });
});

describe("ticket 10 replay: the 2026-10-26 pool", () => {
  // Frozen from that day's spotted-trace.json and spotted-log.json (published = first seen).
  const day = JSON.parse(
    fs.readFileSync(new URL("../fixtures/spotted-2026-10-26.json", import.meta.url), "utf-8"),
  ) as {
    pool: (Story & { topic: string | null; probabilities: Record<string, number> | null })[];
    week: SpottedLog["items"];
    topics: Record<string, string>;
  };
  const PAGE: Record<string, SpottedPage | null> = {
    agents: "agents",
    models: "models",
    research: "models",
    data: "data",
  };
  const titled = (part: string) => day.pool.find((s) => s.title.includes(part))!.id;

  it("drops DetectorScope and the AI graveyard and keeps AgentTrust", () => {
    const rows = selectSpotted(
      day.pool,
      (s) => PAGE[(s as (typeof day.pool)[number]).topic ?? ""] ?? null,
      undefined,
      {
        dateStr: "2026-10-26",
        probabilityOf: (s) => {
          const st = s as (typeof day.pool)[number];
          return st.topic && st.probabilities ? st.probabilities[st.topic] : undefined;
        },
      },
    );
    const ids = rows.map((r) => r.id);
    expect(ids).not.toContain(titled("DetectorScope"));
    expect(ids).not.toContain(titled("The AI graveyard"));
    expect(ids).toContain(titled("AgentTrust"));
  });

  it("Most discussed drops the 0-point, 0-comment Lobste.rs row", () => {
    const rows = mostDiscussed({ items: day.week }, "2026-10-26", [], (id) => day.topics[id]);
    expect(rows.some((r) => r.source === "lobsters" && r.comments === 0)).toBe(false);
    expect(rows.every((r) => day.topics[r.id] !== "other")).toBe(true);
  });
});

describe("cap-cut stories stay eligible", () => {
  it("nextLog marks a cap-cut story cut; carriedStories brings it back the next day only, unless refetched or shown", () => {
    const cut = story("cut", "devto", 15);
    const refetched = story("again", "devto", 20);
    const log = nextLog({ items: {} }, [cut, refetched], [], "2026-10-25", [cut.id, refetched.id]);
    expect(log.items[cut.id]!.cut).toBe("2026-10-25");

    const carried = carriedStories(log, [refetched], "2026-10-26");
    expect(carried.map((s) => s.id)).toEqual([cut.id]);
    expect(carried[0]).toMatchObject({ title: cut.title, url: cut.url, published: "2026-10-25T00:00:00Z" });
    expect(carriedStories(log, [], "2026-10-27")).toEqual([]);

    const shown = nextLog(log, [], [cut.id], "2026-10-26");
    expect(carriedStories(shown, [refetched], "2026-10-26")).toEqual([]);
  });

  it("a story a page showed is never marked cut", () => {
    const s = story("s");
    const log = nextLog({ items: {} }, [s], [s.id], "2026-10-25", [s.id]);
    expect(log.items[s.id]!.cut).toBeUndefined();
  });
});

describe("selectTalkedAbout", () => {
  const PAGE: Record<string, SpottedPage | null> = {
    agents: "agents",
    models: "models",
    research: "models",
    data: "data",
  };

  it("takes stories routed to no page, by points over the floor, skipping a link Spotted took", () => {
    const policy = story("p", "hn", 300);
    const other = story("o", "hn", 80);
    const quiet = story("q", "hn", 10);
    const onPage = story("a", "hn", 900);
    const taken = story("t", "hn", 500, { url: "https://example.com/taken" });
    const topic: Record<string, string> = {
      [policy.id]: "policy",
      [other.id]: "other",
      [quiet.id]: "other",
      [onPage.id]: "agents",
      [taken.id]: "other",
    };
    const rows = selectTalkedAbout(
      [policy, other, quiet, onPage, taken],
      (s) => topic[s.id],
      (s) => PAGE[topic[s.id]!] ?? null,
      DATE,
      new Set([linkKey("https://example.com/taken")]),
    );
    expect(rows.map((r) => [r.id, r.topic])).toEqual([
      [policy.id, "policy"],
      [other.id, "other"],
    ]);
  });

  it("ticket 14 replay: the 2026-10-26 pool puts the AI-found PHP RCE on the Overview", () => {
    const day = JSON.parse(
      fs.readFileSync(new URL("../fixtures/spotted-2026-10-26.json", import.meta.url), "utf-8"),
    ) as {
      pool: (Story & { topic: string | null })[];
    };
    const rows = selectTalkedAbout(
      day.pool,
      (s) => (s as (typeof day.pool)[number]).topic ?? undefined,
      (s) => PAGE[(s as (typeof day.pool)[number]).topic ?? ""] ?? null,
      "2026-10-26",
      new Set(),
    );
    expect(rows.map((r) => r.title)).toContain("PHP2Shell: AI uncovers critical RCE in PHP");
    expect(rows.length).toBeLessThanOrEqual(5);
  });
});

describe("cleanStoryDescription", () => {
  it.each([
    [
      "A Decentralized, Scalable Multiagent Harness. Contribute to microsoft/Agensh development by creating an account on GitHub.",
      "A Decentralized, Scalable Multiagent Harness.",
    ],
    [
      "Build AI text detectors that are human-auditable (EMNLP 2026) - google-deepmind/detectorscope",
      "Build AI text detectors that are human-auditable (EMNLP 2026)",
    ],
    ["Subscribe for daily updates.", undefined],
    [
      "This is a submission for the Challenge Week 3: Slow and Steady          ...",
      "This is a submission for the Challenge Week 3: Slow and Steady",
    ],
    ["Contribute to o/r development by creating an account on GitHub.", undefined],
    [
      "A CLI to subscribe to RSS feeds and read offline.",
      "A CLI to subscribe to RSS feeds and read offline.",
    ],
    ["Agents that plan. Subscribe to our newsletter.", "Agents that plan."],
  ])("cleans %j", (raw, clean) => {
    expect(cleanStoryDescription(raw)).toBe(clean);
  });
});
