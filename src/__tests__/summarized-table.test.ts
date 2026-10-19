import { describe, it, expect } from "vitest";
import {
  numberRows,
  parseRowSummaries,
  spliceTables,
  summaryLine,
  summaryOutputRule,
  TABLES_MARKER,
} from "../reports/summarized-table.ts";
import { renderPolicyTable, renderVendorTables } from "../reports/report-builders.ts";
import {
  buildDataSummariesPrompt,
  buildPolicySummariesPrompt,
  buildTrendingSummariesPrompt,
} from "../reports/prompts-data.ts";
import type { PolicyItem } from "../policy/policy.ts";
import type { KeptVendorItem } from "../data/jev.ts";

const policyItem = (id: string, jurisdiction: PolicyItem["jurisdiction"], news = false): PolicyItem => ({
  id,
  title: `Title ${id}`,
  link: `https://example.eu/${id}`,
  published: "2026-10-14",
  description: `Description ${id}.`,
  source: "Source",
  jurisdiction,
  jevOnly: false,
  ...(news ? { news } : {}),
});
const vendorItem = (id: string, vendor: KeptVendorItem["vendor"]): KeptVendorItem => ({
  id,
  vendor,
  source: "Feed",
  title: `Title ${id}`,
  link: `https://example.com/${id}`,
  date: "2026-10-16",
  description: `Description ${id}.`,
  deprecation: false,
  aiInData: false,
});
/** Reversed, so the renderer sees the rows out of order. */
const shuffle = <T>(rows: T[]): T[] => [...rows].reverse();

describe("row numbers", () => {
  // Jurisdiction order, as fetchPolicyData sorts and numbers them: EU 1-2, NL 3, US federal 4, news 5.
  const policy = numberRows([
    policyItem("eu-1", "eu"),
    policyItem("eu-2", "eu"),
    policyItem("nl-1", "nl"),
    policyItem("us-1", "us_federal"),
    policyItem("news-1", "eu", true),
  ]);
  const reply = parseRowSummaries("1: S1.\n2: S2.\n3: S3.\n4: S4.\n5: S5.");

  it("puts a policy summary on the row with its number, under its jurisdiction, whatever the input order", () => {
    const md = renderPolicyTable(shuffle(policy), reply);
    const nl = md.slice(md.indexOf("## Netherlands"), md.indexOf("## US federal"));
    expect(nl).toContain("[Title nl-1](https://example.eu/nl-1) |  | S3. |");
    expect(md).toContain("[Title us-1](https://example.eu/us-1) |  | S4. |");
    expect(md.slice(md.indexOf("## News & commentary"))).toContain(
      "[Title news-1](https://example.eu/news-1) | S5. |",
    );
  });

  it("puts a vendor summary on the row with its number across sections, whatever the input order", () => {
    const vendor = numberRows([
      vendorItem("dbx-1", "databricks"),
      vendorItem("sf-1", "snowflake"),
      vendorItem("sf-2", "snowflake"),
      vendorItem("gcp-1", "gcp"),
    ]);
    const tables = renderVendorTables(shuffle(vendor), reply);
    expect(tables.snowflake).toContain("[Title sf-2](https://example.com/sf-2) | S3. |");
    expect(tables.cloud).toContain("[Title gcp-1](https://example.com/gcp-1) | S4. |");
    expect(tables.databricks).toContain("| S1. |");
  });

  it("is listed in the summaries prompts by each row's number", () => {
    const listed = (prompt: string) => [...prompt.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    const some = [policy[3]!, policy[1]!];
    expect(listed(buildPolicySummariesPrompt(some, "2026-10-14", "A reader."))).toEqual([4, 2]);
    const vendor = numberRows([vendorItem("a", "databricks"), vendorItem("b", "gcp")]);
    expect(listed(buildDataSummariesPrompt(vendor.slice(1), "2026-10-14"))).toEqual([2]);
    const trending = [{ n: 7, name: "x", description: "", facts: "Stars: 1" }];
    expect(listed(buildTrendingSummariesPrompt(trending, "2026-10-14"))).toEqual([7]);
  });

  it("is asked for with the same contract text in every summaries prompt", () => {
    const prompts = [
      buildPolicySummariesPrompt(policy.slice(0, 2), "2026-10-14", "A reader."),
      buildDataSummariesPrompt(
        numberRows([vendorItem("a", "databricks"), vendorItem("b", "gcp")]),
        "2026-10-14",
      ),
      buildTrendingSummariesPrompt(
        [
          { n: 1, name: "x", description: "", facts: "" },
          { n: 2, name: "y", description: "", facts: "" },
        ],
        "2026-10-14",
      ),
    ];
    for (const p of prompts) {
      expect(p).toContain(summaryOutputRule(2));
    }
    expect(prompts[0]).toContain(summaryLine("2 sentences"));
    expect(prompts[1]).toContain(summaryLine("1-2 sentences"));
    expect(prompts[2]).toContain(summaryLine("2 sentences"));
  });
});

describe("parseRowSummaries", () => {
  it("accepts the common numbering styles", () => {
    const parsed = parseRowSummaries(
      ["1: one.", "2. two.", "3) three.", "- 4: four.", "**5:** five.", "  6 :  six.  "].join("\n"),
    );
    expect([...parsed.entries()]).toEqual([
      [1, "one."],
      [2, "two."],
      [3, "three."],
      [4, "four."],
      [5, "five."],
      [6, "six."],
    ]);
  });

  it("ignores lines without a leading number or text, and keeps the first occurrence", () => {
    const parsed = parseRowSummaries(
      [
        "Here are the summaries:",
        "",
        "7:",
        "3.5x growth this week",
        "8: first.",
        "8: second.",
        "## 9: no",
      ].join("\n"),
    );
    expect([...parsed.entries()]).toEqual([[8, "first."]]);
  });
});

describe("spliceTables", () => {
  it("replaces the marker line with the tables", () => {
    const prose = `## Highlights\n\nText.\n\n${TABLES_MARKER}\n\n## Trends\n\nMore.`;
    expect(spliceTables(prose, "TABLES")).toBe("## Highlights\n\nText.\n\nTABLES\n\n## Trends\n\nMore.");
  });

  it("appends the tables when the marker is missing", () => {
    expect(spliceTables("## Highlights\n\nText.\n", "TABLES")).toBe("## Highlights\n\nText.\n\nTABLES");
  });

  it("drops the marker when there are no tables", () => {
    const prose = `A.\n\n${TABLES_MARKER}\n\nB.`;
    expect(spliceTables(prose, "")).toBe("A.\n\nB.");
  });
});
