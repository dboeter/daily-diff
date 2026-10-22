import { describe, expect, it } from "vitest";
import {
  freshStories,
  linkKey,
  mostDiscussed,
  nextLog,
  selectSpotted,
  storiesFrom,
  type SpottedLog,
  type SpottedPage,
  type Story,
  type StorySource,
} from "../spotted/spotted.ts";
import { renderSpottedTable } from "../reports/report-builders.ts";
import { buildSpottedSummariesPrompt } from "../reports/prompts-data.ts";
import { numberRows, parseRowSummaries } from "../reports/summarized-table.ts";

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
      ["lobsters:abc", "https://lobste.rs/s/abc", 7, undefined],
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

  it("keeps the copy shown today on a same-day re-run and drops the other copies of its link", () => {
    const shownToday = story("y", "lobsters", 10, { url: "https://example.com/b" });
    const copy = story("3", "hn", 500, { url: "https://example.com/b" });
    const log: SpottedLog = { items: { [shownToday.id]: logged(shownToday, { shown: DATE }) } };
    expect(freshStories([copy, shownToday], log, DATE).map((s) => s.id)).toEqual([shownToday.id]);
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
      add(`l${i}`, "lobsters", i, "2026-10-15", i === 4 ? { shown: "2026-10-15" } : {});
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

describe("selectSpotted", () => {
  it("caps each page at 6 HN, 2 Lobste.rs and 2 Dev.to by points, numbered agents, models, data", () => {
    const stories = [
      ...Array.from({ length: 8 }, (_, i) => story(`h${i}`, "hn", i)),
      ...Array.from({ length: 3 }, (_, i) => story(`l${i}`, "lobsters", i)),
      ...Array.from({ length: 3 }, (_, i) => story(`d${i}`, "devto", i)),
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
    const copyB = story("d", "devto", 1, { url: "https://example.com/b" });
    const pageOf = (s: Story): SpottedPage | null => (s === routedNowhere ? null : "agents");
    const ids = selectSpotted([routedNowhere, copyA, ...top, belowCut, copyB], pageOf).map((r) => r.id);
    expect(ids).toContain(copyA.id);
    expect(ids).toContain(copyB.id);
    expect(ids).not.toContain(belowCut.id);
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

describe("renderSpottedTable", () => {
  it("links the story and its discussion with counts, reactions for Dev.to", () => {
    const rows = numberRows([
      { ...story("1", "hn", 312), comments: 95, page: "agents" as const },
      {
        ...story("2", "devto", 40),
        discussionUrl: "https://dev.to/a/2",
        description: "An article | with a pipe",
        page: "agents" as const,
      },
    ]);
    const md = renderSpottedTable(rows, new Map([[1, "What it is."]]));
    expect(md).toBe(
      "## Spotted\n\n" +
        "| Story | Source | Discussion | Summary |\n| :--- | :--- | :--- | :--- |\n" +
        "| [Story 1](https://example.com/1) | Hacker News | [312 points, 95 comments](https://news.ycombinator.com/item?id=1) | What it is. |\n" +
        "| [Story 2](https://example.com/2) | Dev.to | [40 reactions, 3 comments](https://dev.to/a/2) | An article \\| with a pipe |",
    );
  });

  it("renders nothing without rows", () => {
    expect(renderSpottedTable([], new Map())).toBe("");
  });
});

describe("buildSpottedSummariesPrompt", () => {
  it("lists every row by its number, with its site and description, on the summaries contract", () => {
    const rows = numberRows([
      { ...story("1"), description: "The page says this.", page: "agents" as const },
      { ...story("2", "lobsters"), url: "https://www.blog.dev/post", page: "data" as const },
    ]);
    const prompt = buildSpottedSummariesPrompt(rows, DATE);
    expect(prompt).toContain(
      "1. Story 1 (Hacker News, example.com, 10 points, 3 comments) — description: The page says this.",
    );
    expect(prompt).toContain("2. Story 2 (Lobste.rs, blog.dev, 10 points, 3 comments) — (no description)");
    expect(prompt).toContain("`N: <1-2 sentences>`");
    expect(prompt).toContain("2 lines in total");
    expect(prompt).toMatch(/Describe no comment thread/);
    expect(parseRowSummaries("1: One.\n2: Two.").get(2)).toBe("Two.");
  });
});
