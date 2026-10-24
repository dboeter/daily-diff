import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { parseBehaviorChangeBundles, parseSnowflakeReleases } from "../../data/snowflake.ts";

const fixture = (name: string) => fs.readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf-8");

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

  it("takes a planned Enabled by Default or Generally Enabled change with a full date as the end date", () => {
    // On the fixture every planned change is month-only ("a subsequent October 2026 release").
    expect(bundles.map((b) => b.endDate)).toEqual([undefined, undefined, undefined, undefined]);
    const row = (planned: string) =>
      `<table><tr><th>Pending Changes</th></tr><tr><td><strong>2026_09</strong></td><td><p>Introduced in the 10.38 release (October 14-20, 2026) as Disabled by Default; account admins can enable for testing.</p><p>${planned}</p></td></tr></table>`;
    const [b] = parseBehaviorChangeBundles(
      row(
        "Status planned to change in the 10.42 release (November 10-16, 2026) to Generally Enabled; however, this schedule is subject to change.",
      ),
    );
    expect(b!.endDate).toBe("2026-11-16");
    const [intro] = parseBehaviorChangeBundles(
      row("Status planned to change in the 10.40 release (November 3-9, 2026) to Disabled by Default."),
    );
    expect(intro!.endDate).toBeUndefined();
  });

  it("throws when no bundle parses", () => {
    expect(() => parseBehaviorChangeBundles("<html></html>")).toThrow("no Snowflake behavior-change bundles");
  });
});
