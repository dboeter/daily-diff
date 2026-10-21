import fs from "node:fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchVendorData, fetchVendorFeeds } from "../data/vendors.ts";
import { parseBehaviorChangeBundles, parseSnowflakeReleases } from "../data/snowflake.ts";
import { parseBigQueryNotes } from "../data/bigquery.ts";
import type { DataFeed } from "../core/config.ts";

const fixture = (name: string) => fs.readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf-8");

afterEach(() => vi.restoreAllMocks());

describe("parseSnowflakeReleases", () => {
  const notes = parseSnowflakeReleases(fixture("snowflake-releases.html"));

  it("reads the dated releases from __NEXT_DATA__ and skips Upcoming", () => {
    expect(notes.map((n) => n.date)).toEqual([
      "2026-10-16",
      "2026-10-16",
      "2026-10-15",
      "2026-10-07",
      "2026-10-07",
    ]);
    expect(notes[0]).toMatchObject({
      id: "/release-notes/2026/other/2026-10-16-cortex-ai-gateway-regions#Oct 16, 2026: Cortex AI Gateway on Azure, Google Cloud, and AWS New Zealand",
      title: "Oct 16, 2026: Cortex AI Gateway on Azure, Google Cloud, and AWS New Zealand",
      link: "https://docs.snowflake.com/en/release-notes/2026/other/2026-10-16-cortex-ai-gateway-regions",
      categories: ["Feature Update"],
    });
  });

  it("keys a server release's announcements by source and title: they share the source", () => {
    const server = notes.filter((n) => n.link.endsWith("/release-notes/2026/10_36"));
    expect(server).toHaveLength(2);
    expect(new Set(server.map((n) => n.id)).size).toBe(2);
  });

  it("takes the content when the summary is an MDX import line", () => {
    const dcr = notes.find((n) => n.title.includes("Clean Rooms"))!;
    expect(dcr.description).toMatch(/^Clean Rooms API Version: 18\.9 The following updates/);
  });

  // 2026-10-19: "10.37 Release Notes (with behavior changes)" repeated the 2026_08 bundle row.
  it("skips a release header that only points at the behavior change bundles", () => {
    const page = (content: string) =>
      `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
        props: {
          pageProps: {
            releases: [
              {
                title: "10.37 Release Notes (with behavior changes): Oct 08, 2026 - Oct 16, 2026",
                source: "/release-notes/2026/10_37",
                date: ["2026-10-08", "2026-10-16"],
                changeType: "Server Release",
                content,
              },
            ],
          },
        },
      })}</script>`;
    const pointer =
      "<h2>Behavior change bundles</h2><p>This release contains the following behavior change bundles:</p>";
    expect(parseSnowflakeReleases(page(pointer))).toEqual([]);
    expect(
      parseSnowflakeReleases(page(`${pointer}<h2>New features</h2><p>${"Dynamic tables ".repeat(20)}</p>`)),
    ).toHaveLength(1);
  });

  it("throws when the JSON or the releases are missing: the markup changed", () => {
    expect(() => parseSnowflakeReleases("<html></html>")).toThrow("no __NEXT_DATA__");
    expect(() =>
      parseSnowflakeReleases(
        '<script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"releases":[]}}}</script>',
      ),
    ).toThrow("no Snowflake releases");
  });
});

describe("parseBehaviorChangeBundles", () => {
  const bundles = parseBehaviorChangeBundles(fixture("snowflake-bcr.html"));

  it("reads one stage item per bundle of the pending table, not the implemented history", () => {
    expect(bundles.map((b) => b.id)).toEqual([
      "snowflake-bcr:2026_08",
      "snowflake-bcr:2026_07",
      "snowflake-bcr:2026_06",
      "snowflake-bcr:2026_05",
    ]);
    expect(bundles[2]).toMatchObject({
      title: "Behavior change bundle 2026_06",
      link: "https://docs.snowflake.com/en/release-notes/bcr-bundles/2026_06_bundle",
    });
  });

  it("takes the latest status that happened as the stage, else the planned introduction", () => {
    expect(bundles.map((b) => b.stage)).toEqual([
      "Planned to be introduced, Disabled by Default, in the 10.37 release (October 7-13, 2026), subject to change; once introduced, account admins can enable for testing.",
      "Introduced in the 10.32 release (September 5-9, 2026) as Disabled by Default; account admins can enable for testing.",
      "Status changed in the 10.32 release (September 5-9, 2026) to Enabled by Default; account admins can disable for opt-out.",
      "Status changed in the 10.32 release (September 5-9, 2026) to Generally Enabled; account admins can no longer enable or disable this bundle.",
    ]);
  });

  it("dates a bundle by the end of its stage's release window", () => {
    expect(bundles.map((b) => b.date)).toEqual(["2026-10-13", "2026-09-09", "2026-09-09", "2026-09-09"]);
  });

  it("throws when no bundle parses", () => {
    expect(() => parseBehaviorChangeBundles("<html></html>")).toThrow("no Snowflake behavior-change bundles");
  });
});

describe("parseBigQueryNotes", () => {
  const notes = parseBigQueryNotes(fixture("bigquery.xml"));

  it("splits each day's entry into its notes, keyed by anchor and title", () => {
    expect(notes.map((n) => n.id.split("#")[0])).toEqual(
      expect.arrayContaining(["October_16_2026", "October_15_2026"]),
    );
    expect(notes[1]!.id).toBe("October_15_2026#Feature: You can copy tables across regions.");
    expect(new Set(notes.map((n) => n.id)).size).toBe(notes.length);
    expect(notes[1]).toMatchObject({
      title: "Feature: You can copy tables across regions.",
      date: "2026-10-15",
      link: "https://docs.cloud.google.com/bigquery/docs/release-notes#October_15_2026",
      categories: ["Feature"],
    });
    expect(notes[2]!.description).toMatch(/^You can now use column aliases in GoogleSQL\./);
  });

  it("throws when no entry parses", () => {
    expect(() => parseBigQueryNotes("<html></html>")).toThrow("no BigQuery entries");
  });
});

describe("fetchVendorFeeds", () => {
  const feeds: DataFeed[] = [
    { name: "Azure Databricks", vendor: "databricks", url: "https://x/dbx.xml", parser: "rss" },
    {
      name: "Azure updates",
      vendor: "azure",
      url: "https://x/azure.xml",
      parser: "rss",
      categories: ["Databases", "Microsoft Fabric"],
    },
    { name: "BigQuery", vendor: "gcp", url: "https://x/down.xml", parser: "bigquery" },
  ];
  const now = new Date("2026-10-17T00:00:00Z");

  function stubFetch() {
    vi.spyOn(console, "log").mockImplementation(() => {});
    return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("dbx.xml")) return new Response(fixture("azure-databricks.xml"));
      if (url.endsWith("azure.xml")) return new Response(fixture("azure-updates.xml"));
      return new Response("", { status: 503 });
    });
  }

  it("dedupes a note listed twice under two guids, keeps future dates, and tags vendor and source", async () => {
    stubFetch();
    const { items } = await fetchVendorFeeds({ feeds }, now);
    const dbx = items.filter((i) => i.vendor === "databricks");
    expect(dbx.map((i) => i.date)).toEqual(["2026-10-19", "2026-10-16", "2026-10-15"]);
    expect(dbx[0]).toMatchObject({
      source: "Azure Databricks",
      title: "Saving an unchanged job no longer adds rows to the jobs system tables",
      categories: ["Product", "Jobs", "System tables & audit logs"],
    });
  });

  it("keeps only the RSS items in the feed's categories", async () => {
    stubFetch();
    const azure = (await fetchVendorFeeds({ feeds }, now)).items.filter((i) => i.vendor === "azure");
    expect(azure.map((i) => i.id)).toEqual(["573691"]);
    expect(azure[0]).toMatchObject({ source: "Azure updates", date: "2026-10-08" });
  });

  it("logs and skips a failing feed", async () => {
    stubFetch();
    const { items } = await fetchVendorFeeds({ feeds }, now);
    expect(items.some((i) => i.vendor === "gcp")).toBe(false);
    expect(console.log).toHaveBeenCalledWith("  [data] BigQuery failed: HTTP 503");
  });
});

describe("fetchVendorData", () => {
  const feeds: DataFeed[] = [
    { name: "Snowflake BCR", vendor: "snowflake", url: "https://x/bcr", parser: "snowflake-bcr" },
  ];
  const now = new Date("2026-10-17T00:00:00Z");
  const run = (state: Parameters<typeof fetchVendorData>[2]) => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(fixture("snowflake-bcr.html")));
    return fetchVendorData({ feeds }, now, state, { cache: { items: {} } });
  };

  it("records a bundle first seen at a stage over 30 days old without reporting it", async () => {
    const data = await run(null);
    expect(data.items.map((i) => i.id)).toEqual(["snowflake-bcr:2026_08"]);
    expect(data.nextState!.reported).toEqual({ "snowflake-bcr:2026_08": "2026-10-17" });
    // The three 2026-09-09 bundles: stage saved, so they return only when it moves.
    expect(Object.keys(data.nextState!.stages!).sort()).toEqual([
      "snowflake-bcr:2026_05",
      "snowflake-bcr:2026_06",
      "snowflake-bcr:2026_07",
      "snowflake-bcr:2026_08",
    ]);
  });

  it("reports a known bundle whose stage moved, however old the stage date", async () => {
    const data = await run({ reported: {}, stages: { "snowflake-bcr:2026_07": "2026-08-01 Planned" } });
    expect(data.items.map((i) => i.id)).toEqual(["snowflake-bcr:2026_08", "snowflake-bcr:2026_07"]);
  });
});

describe("fetchVendorData across days", () => {
  const rss = (items: { guid: string; title: string; date: string }[]) =>
    `<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>${items
      .map(
        (i) =>
          `<item><title>${i.title}</title><link>https://x/${i.guid}</link><guid>${i.guid}</guid><pubDate>${new Date(`${i.date}T00:00:00Z`).toUTCString()}</pubDate><description>d</description></item>`,
      )
      .join("")}</channel></rss>`;
  const feeds: DataFeed[] = [
    { name: "Microsoft Fabric", vendor: "azure", url: "https://x/fabric.xml", parser: "rss", stableId: true },
    { name: "Azure Databricks", vendor: "databricks", url: "https://x/dbx.xml", parser: "rss" },
  ];
  type Note = { guid: string; title: string; date: string };
  const run = (day: string, fabric: Note[], dbx: Note[], state: Parameters<typeof fetchVendorData>[2]) => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input) => new Response(rss(String(input).endsWith("fabric.xml") ? fabric : dbx)),
    );
    return fetchVendorData({ feeds }, new Date(`${day}T01:00:00Z`), state, { cache: { items: {} } });
  };
  const retiring = { guid: "ba-p/5374418", title: "Retirement of the custom tool: move to Fabric IQ" };

  it("does not report a stable-id item again when its date moves", async () => {
    const first = await run("2026-10-20", [{ ...retiring, date: "2026-10-19" }], [], null);
    expect(first.items.map((i) => i.title)).toEqual([retiring.title]);
    const second = await run("2026-10-21", [{ ...retiring, date: "2026-10-20" }], [], first.nextState);
    expect(second.items).toEqual([]);
  });

  it("reads a stable-id item's title + date key saved before the change as reported", async () => {
    const legacy = {
      reported: { "retirement of the custom tool: move to fabric iq|2026-10-19": "2026-10-20" },
    };
    const data = await run("2026-10-21", [{ ...retiring, date: "2026-10-19" }], [], legacy);
    expect(data.items).toEqual([]);
  });

  it("still keys an Azure Databricks note on title + date, so a second guid is not new", async () => {
    const note = { title: "Lakebase replication is generally available", date: "2026-10-19" };
    const first = await run("2026-10-20", [], [{ ...note, guid: "topic#a" }], null);
    expect(first.items).toHaveLength(1);
    const second = await run("2026-10-21", [], [{ ...note, guid: "month#a" }], first.nextState);
    expect(second.items).toEqual([]);
  });

  const comingSoon = {
    guid: "whats-coming#pkg",
    title: "Workspace-level package repositories for Databricks Apps will soon be generally available",
    date: "2026-10-14",
  };
  const ga = {
    guid: "october#pkg",
    title: "Workspace-level package repositories for Databricks Apps are generally available",
    date: "2026-10-14",
  };

  it("does not report a GA note after its coming-soon note was reported on an earlier day", async () => {
    const first = await run("2026-10-20", [], [comingSoon], null);
    expect(first.items.map((i) => i.title)).toEqual([comingSoon.title]);
    const second = await run("2026-10-21", [], [comingSoon, ga], first.nextState);
    expect(second.items).toEqual([]);
  });

  it("reports both when the coming-soon and GA notes arrive on the same day", async () => {
    const data = await run("2026-10-21", [], [comingSoon, ga], null);
    expect(data.items.map((i) => i.title).sort()).toEqual([ga.title, comingSoon.title].sort());
  });
});
