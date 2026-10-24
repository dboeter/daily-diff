import { afterEach, describe, it, expect, vi } from "vitest";
import {
  fetchSiteContent,
  parseSitemapUrls,
  dedupeSitemapUrls,
  isSitemapIndex,
  extractTitle,
  extractText,
  titleFromUrl,
  emptyState,
} from "../sources/labs.ts";

// ---------------------------------------------------------------------------
// parseSitemapUrls
// ---------------------------------------------------------------------------

describe("parseSitemapUrls", () => {
  it("parses urls with loc and lastmod", () => {
    const xml = `
      <urlset>
        <url>
          <loc>https://example.com/page1</loc>
          <lastmod>2026-03-09</lastmod>
        </url>
        <url>
          <loc>https://example.com/page2</loc>
          <lastmod>2026-03-08</lastmod>
        </url>
      </urlset>`;
    const result = parseSitemapUrls(xml);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ loc: "https://example.com/page1", lastmod: "2026-03-09" });
    expect(result[1]).toEqual({ loc: "https://example.com/page2", lastmod: "2026-03-08" });
  });

  it("handles urls without lastmod", () => {
    const xml = `<urlset><url><loc>https://example.com/page</loc></url></urlset>`;
    const result = parseSitemapUrls(xml);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ loc: "https://example.com/page", lastmod: undefined });
  });

  it("returns empty array for empty XML", () => {
    expect(parseSitemapUrls("")).toEqual([]);
    expect(parseSitemapUrls("<urlset></urlset>")).toEqual([]);
  });

  it("handles whitespace in loc/lastmod", () => {
    const xml = `<urlset><url><loc>  https://example.com/page  </loc><lastmod>  2026-03-09  </lastmod></url></urlset>`;
    const result = parseSitemapUrls(xml);
    expect(result[0]!.loc).toBe("https://example.com/page");
    expect(result[0]!.lastmod).toBe("2026-03-09");
  });
});

describe("dedupeSitemapUrls", () => {
  it("keeps one entry per URL, with its latest lastmod", () => {
    const result = dedupeSitemapUrls([
      { loc: "https://example.com/a", lastmod: "2026-10-21" },
      { loc: "https://example.com/b" },
      { loc: "https://example.com/a", lastmod: "2026-10-22" },
      { loc: "https://example.com/b", lastmod: "2026-10-20" },
    ]);
    expect(result).toEqual([
      { loc: "https://example.com/a", lastmod: "2026-10-22" },
      { loc: "https://example.com/b", lastmod: "2026-10-20" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// isSitemapIndex
// ---------------------------------------------------------------------------

describe("isSitemapIndex", () => {
  it("detects sitemapindex tag", () => {
    expect(isSitemapIndex('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')).toBe(true);
    expect(isSitemapIndex("<sitemapindex>")).toBe(true);
  });

  it("returns false for regular sitemap", () => {
    expect(isSitemapIndex('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractTitle
// ---------------------------------------------------------------------------

describe("extractTitle", () => {
  it("extracts og:title (property first)", () => {
    const html = `<meta property="og:title" content="My Title">`;
    expect(extractTitle(html)).toBe("My Title");
  });

  it("extracts og:title (content first)", () => {
    const html = `<meta content="My Title" property="og:title">`;
    expect(extractTitle(html)).toBe("My Title");
  });

  it("falls back to <title> tag", () => {
    const html = `<html><head><title>Page Title</title></head></html>`;
    expect(extractTitle(html)).toBe("Page Title");
  });

  it("prefers og:title over <title>", () => {
    const html = `<meta property="og:title" content="OG Title"><title>Fallback Title</title>`;
    expect(extractTitle(html)).toBe("OG Title");
  });

  it("returns empty string when no title found", () => {
    expect(extractTitle("<html><body></body></html>")).toBe("");
  });

  it("trims whitespace", () => {
    const html = `<title>  Spaced Title  </title>`;
    expect(extractTitle(html)).toBe("Spaced Title");
  });
});

// ---------------------------------------------------------------------------
// extractText
// ---------------------------------------------------------------------------

describe("extractText", () => {
  it("extracts text from <main> content", () => {
    const html = `<html><nav>Nav</nav><main><p>Main content</p></main><footer>Foot</footer></html>`;
    expect(extractText(html)).toBe("Main content");
  });

  it("falls back to <article> if no <main>", () => {
    const html = `<html><article><p>Article content</p></article></html>`;
    expect(extractText(html)).toBe("Article content");
  });

  it("strips script and style tags", () => {
    const html = `<main><script>alert('x')</script><style>.a{}</style><p>Clean</p></main>`;
    expect(extractText(html)).toBe("Clean");
  });

  it("decodes HTML entities", () => {
    const html = `<main>&amp; &lt; &gt; &quot; &#39; &nbsp;</main>`;
    const result = extractText(html);
    expect(result).toContain("&");
    expect(result).toContain("<");
    expect(result).toContain(">");
    expect(result).toContain('"');
    expect(result).toContain("'");
  });

  it("collapses whitespace", () => {
    const html = `<main><p>  Multiple   spaces   and\n\nnewlines  </p></main>`;
    expect(extractText(html)).toBe("Multiple spaces and newlines");
  });

  it("truncates to MAX_CONTENT_LENGTH (1500 chars)", () => {
    const html = `<main>${"A".repeat(2000)}</main>`;
    expect(extractText(html)).toHaveLength(1500);
  });
});

// ---------------------------------------------------------------------------
// titleFromUrl
// ---------------------------------------------------------------------------

describe("titleFromUrl", () => {
  it("converts slug to title case", () => {
    expect(titleFromUrl("https://example.com/blog/my-great-article")).toBe("My Great Article");
  });

  it("handles single-segment paths", () => {
    expect(titleFromUrl("https://example.com/about")).toBe("About");
  });

  it("returns URL for invalid input", () => {
    expect(titleFromUrl("not-a-url")).toBe("not-a-url");
  });
});

// ---------------------------------------------------------------------------
// emptyState
// ---------------------------------------------------------------------------

describe("emptyState", () => {
  it("returns valid empty state structure", () => {
    const state = emptyState();
    expect(state).toEqual({
      anthropic: { lastChecked: "", seenUrls: {} },
      openai: { lastChecked: "", seenUrls: {} },
    });
  });

  it("returns a new object each time", () => {
    const a = emptyState();
    const b = emptyState();
    expect(a).not.toBe(b);
    a.anthropic.lastChecked = "modified";
    expect(b.anthropic.lastChecked).toBe("");
  });
});

describe("fetchSiteContent", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns an empty result with fetchSuccess false when the sitemap request throws", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    const result = await fetchSiteContent("anthropic", emptyState(), "2026-10-23");
    expect(result).toEqual({
      site: "anthropic",
      isFirstRun: false,
      newItems: [],
      totalDiscovered: 0,
      fetchSuccess: false,
    });
  });

  /** Anthropic's sitemap with these paths; every other URL is a post page. */
  function serveSitemap(...paths: string[]) {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const urls = paths.map(
      (p) => `<url><loc>https://www.anthropic.com${p}</loc><lastmod>2026-10-22</lastmod></url>`,
    );
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) =>
      String(input).endsWith("/sitemap.xml")
        ? new Response(`<urlset>${urls.join("")}</urlset>`)
        : new Response("<title>A post</title><p>Its text.</p>"),
    );
  }
  const newUrls = (r: { newItems: { url: string }[] }) => r.newItems.map((i) => i.url);

  it("lists a run's new posts again on a same-day re-run, and not the next day", async () => {
    serveSitemap("/news/a", "/news/b");
    const state = emptyState();
    state.anthropic.seenUrls = { "https://www.anthropic.com/news/a": "2026-10-21" };
    const b = ["https://www.anthropic.com/news/b"];
    expect(newUrls(await fetchSiteContent("anthropic", state, "2026-10-23"))).toEqual(b);
    expect(newUrls(await fetchSiteContent("anthropic", state, "2026-10-23"))).toEqual(b);
    expect(newUrls(await fetchSiteContent("anthropic", state, "2026-10-24"))).toEqual([]);
  });

  it("keeps a first crawl a first crawl on a same-day re-run, so the page shows its count line again", async () => {
    serveSitemap("/news/a", "/news/b");
    const state = emptyState();
    expect((await fetchSiteContent("anthropic", state, "2026-10-23")).isFirstRun).toBe(true);
    const rerun = await fetchSiteContent("anthropic", state, "2026-10-23");
    expect(rerun).toMatchObject({ isFirstRun: true, totalDiscovered: 2 });
    expect((await fetchSiteContent("anthropic", state, "2026-10-24")).isFirstRun).toBe(false);
  });

  /** OpenAI's sub-sitemaps: `served` maps a sub-sitemap's name to its paths; every other one answers 404. */
  function serveSubSitemaps(served: Record<string, string[]>) {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const paths = served[String(input).match(/sitemap\.xml\/([^/]+)\/$/)?.[1] ?? ""];
      if (!paths) return new Response("", { status: 404 });
      return new Response(
        `<urlset>${paths.map((p) => `<url><loc>https://openai.com${p}</loc></url>`).join("")}</urlset>`,
      );
    });
  }

  it("keeps the day's new posts through a same-day re-run whose sub-sitemap failed", async () => {
    const state = emptyState();
    state.openai.seenUrls = { "https://openai.com/index/a": "seen" };
    const b = ["https://openai.com/index/b"];
    serveSubSitemaps({ research: ["/index/b"], release: ["/index/a"] });
    expect(newUrls(await fetchSiteContent("openai", state, "2026-10-23"))).toEqual(b);
    serveSubSitemaps({ release: ["/index/a"] });
    expect(newUrls(await fetchSiteContent("openai", state, "2026-10-23"))).toEqual(b);
    serveSubSitemaps({ research: ["/index/b"], release: ["/index/a"] });
    expect(newUrls(await fetchSiteContent("openai", state, "2026-10-23"))).toEqual(b);
  });

  it("fails the fetch when every sub-sitemap fails, and leaves the state as it was", async () => {
    const state = emptyState();
    state.openai.seenUrls = { "https://openai.com/index/a": "seen" };
    serveSubSitemaps({ research: ["/index/b"] });
    await fetchSiteContent("openai", state, "2026-10-23");
    const before = structuredClone(state);
    serveSubSitemaps({});
    expect(await fetchSiteContent("openai", state, "2026-10-23")).toMatchObject({
      fetchSuccess: false,
      newItems: [],
    });
    expect(state).toEqual(before);
  });
});
