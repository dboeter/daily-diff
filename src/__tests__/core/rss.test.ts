import fs from "node:fs";
import { describe, it, expect } from "vitest";
import {
  parseAtomEntries,
  parseFeedItems,
  parseRssItems,
  plainText,
  recentNewsItems,
  tagText,
  vendorText,
  VENDOR_DESCRIPTION_MAX_CHARS,
  type FeedItem,
} from "../../core/rss.ts";

// Shaped like the Commission digital-strategy feed: guid with an attribute,
// entity-encoded Drupal HTML in the description that repeats the title.
const FEED = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
  <channel>
    <title>Shaping Europe’s digital future</title>
    <item>
  <title>Commission publishes AI Act guidelines &amp; templates</title>
  <link>https://digital-strategy.ec.europa.eu/en/news/guidelines</link>
  <description>&lt;span&gt;Commission publishes AI Act guidelines&lt;/span&gt;
&lt;p class="x"&gt;The &lt;b&gt;AI Office&lt;/b&gt; publishes guidelines.&lt;/p&gt;</description>
  <pubDate>Fri, 09 Oct 2026 07:16:00 +0000</pubDate>
    <dc:creator>Anonymous</dc:creator>
    <guid isPermaLink="false">17544 at https://digital-strategy.ec.europa.eu</guid>
    </item>
    <item>
  <title><![CDATA[Call for <experts>]]></title>
  <link>https://digital-strategy.ec.europa.eu/en/news/call</link>
  <pubDate>Thu, 01 Oct 2026 07:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

describe("parseRssItems", () => {
  const items = parseRssItems(FEED);

  it("reads every item, not the channel title", () => {
    expect(items.map((i) => i.title)).toEqual([
      "Commission publishes AI Act guidelines & templates",
      "Call for <experts>",
    ]);
  });

  it("takes the guid as id, else the link", () => {
    expect(items.map((i) => i.id)).toEqual([
      "17544 at https://digital-strategy.ec.europa.eu",
      "https://digital-strategy.ec.europa.eu/en/news/call",
    ]);
  });

  it("parses pubDate to ISO", () => {
    expect(items[0]!.published).toBe("2026-10-09T07:16:00.000Z");
  });

  it("decodes and strips the HTML description to plain text", () => {
    expect(items[0]!.description).toBe(
      "Commission publishes AI Act guidelines The AI Office publishes guidelines.",
    );
    expect(items[1]!.description).toBe("");
  });

  it("drops the Drupal byline: the repeated title, author and post date", () => {
    const [i] = parseRssItems(
      `<rss><channel><item><title>Panel meets</title><description>&lt;span&gt;Panel meets&lt;/span&gt; ` +
        `&lt;span&gt;Anonymous (not verified)&lt;/span&gt; &lt;time&gt;Fri, 10/09/2026 - 09:16&lt;/time&gt; ` +
        `&lt;p&gt;The panel meets.&lt;/p&gt;</description></item></channel></rss>`,
    );
    expect(i!.description).toBe("The panel meets.");
  });

  it("reads every <category>, decoded; no categories field when there are none", () => {
    const [withCats, without] = parseRssItems(
      `<rss><channel><item><title>A</title><category>Databases</category>` +
        `<category>Regions &amp; Datacenters</category></item><item><title>B</title></item></channel></rss>`,
    );
    expect(withCats!.categories).toEqual(["Databases", "Regions & Datacenters"]);
    expect(without).not.toHaveProperty("categories");
  });

  it("returns nothing for a document that is not a feed", () => {
    expect(parseRssItems("<html><body>Maintenance</body></html>")).toEqual([]);
  });
});

describe("parseAtomEntries", () => {
  const atom = fs.readFileSync(new URL("../fixtures/duckdb-blog-2026-10-30.xml", import.meta.url), "utf-8");

  it("reads Atom entries: alternate link, published date, summary else content, and term categories", () => {
    const items = parseAtomEntries(atom);
    expect(items).toHaveLength(2);
    const [first, second] = items as [FeedItem, FeedItem];
    expect(first.title).toBe("From Spreadsheets to DuckLake: A Data Engineer's Road to DuckDB");
    expect(first.link).toBe("https://duckdb.org/2026/10/29/from-spreadsheets-to-ducklake.html");
    expect(first.id).toBe("https://duckdb.org/2026/10/29/from-spreadsheets-to-ducklake");
    expect(first.published).toBe("2026-10-29T00:00:00.000Z");
    expect(first.description).toMatch(/^After nearly two decades/);
    // No summary: the content, as plain text.
    expect(second.title).toBe("Gems of DuckDB 2.0.0");
    expect(second.description).not.toMatch(/<[a-z]/);
    expect(second.description.length).toBeGreaterThan(20);
  });

  it("takes a bare <link href> when no link is marked alternate, and <updated> without <published>", () => {
    const xml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>dltHub</title>
<entry><title>Openflow and dlt</title><link href="https://dlthub.com/blog/openflow?a=1&amp;b=2"/><updated>2026-10-16T10:00:00Z</updated>
<id>https://dlthub.com/blog/openflow</id><category term="snowflake"/><summary type="html">Which to use &lt;b&gt;when&lt;/b&gt; &amp;mdash; a guide</summary></entry></feed>`;
    expect(parseAtomEntries(xml)).toEqual([
      {
        id: "https://dlthub.com/blog/openflow",
        title: "Openflow and dlt",
        link: "https://dlthub.com/blog/openflow?a=1&b=2",
        published: "2026-10-16T10:00:00.000Z",
        description: "Which to use when — a guide",
        categories: ["snowflake"],
      },
    ]);
  });

  it("parseFeedItems picks the parser by the root element", () => {
    expect(parseFeedItems(atom)).toHaveLength(2);
    const rss = `<rss version="2.0"><channel><item><title>T</title><link>https://x.y/p</link><pubDate>Thu, 29 Oct 2026 21:01:02 GMT</pubDate>
<content:encoded><![CDATA[<p>Body &rsquo;quoted&rsquo;</p>]]></content:encoded></item></channel></rss>`;
    // Medium: no description, the body in content:encoded; named entities decoded.
    expect(parseFeedItems(rss)[0]).toMatchObject({ title: "T", description: "Body ’quoted’" });
  });
});

describe("vendorText", () => {
  const xml = fs.readFileSync(new URL("../fixtures/fabric-gateway.xml", import.meta.url), "utf-8");
  const [gateway] = parseRssItems(xml, vendorText);

  it("the fixture places the Admin APIs heading past the 1,000-character cut", () => {
    expect(plainText(tagText(xml, "description"), VENDOR_DESCRIPTION_MAX_CHARS)).not.toContain("Admin APIs");
  });

  it("opens a multi-feature post with every section heading, within the cut", () => {
    expect(gateway!.description).toMatch(
      /^Sections: Installer accessibility improvements; Power Query settings; Service start diagnostics; Power BI Desktop compatibility; Admin APIs for connections and gateways \(Preview\); Next steps\. Here is the October 2026 update/,
    );
    expect(gateway!.description.length).toBeLessThanOrEqual(VENDOR_DESCRIPTION_MAX_CHARS + 1);
  });

  it("states each heading once: the body loses the heading elements", () => {
    expect(gateway!.description.match(/Power Query settings/g)).toHaveLength(1);
  });

  it("leaves a note without headings as plainText left it, minus the space before punctuation", () => {
    expect(vendorText("<p>Now in <a>two regions</a>.</p>")).toBe("Now in two regions.");
  });
});

describe("recentNewsItems", () => {
  const item = (published: string): FeedItem => ({
    id: published,
    title: "",
    link: "",
    published,
    description: "",
  });
  const now = new Date("2026-10-14T00:00:00Z");

  it("keeps items up to 7 days old and drops older ones", () => {
    const kept = recentNewsItems(
      [item("2026-10-13T00:00:00Z"), item("2026-10-07T00:00:00Z"), item("2026-10-06T23:59:00Z")],
      now,
    );
    expect(kept.map((i) => i.published)).toEqual(["2026-10-13T00:00:00Z", "2026-10-07T00:00:00Z"]);
  });

  it("drops items without a parseable date: their age is unknown", () => {
    expect(recentNewsItems([item("")], now)).toEqual([]);
  });
});
