import { describe, it, expect } from "vitest";
import {
  checkCodeTokens,
  numberRows,
  parseRowSummaries,
  spliceTables,
  summaryLine,
  summaryOutputRule,
  TABLES_MARKER,
} from "../../reports/summarized-table.ts";
import { renderPolicyTable, renderVendorTables } from "../../reports/markdown.ts";
import {
  buildDataSummariesPrompt,
  buildPolicySummariesPrompt,
  buildTrendingSummariesPrompt,
} from "../../reports/prompts-pages.ts";
import type { PolicyItem } from "../../policy/items.ts";
import type { KeptVendorItem } from "../../data/relevance.ts";

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

  it("lists the over-cap items as links under their section's table", () => {
    const vendor = numberRows([vendorItem("dbx-1", "databricks")]);
    const over = [
      vendorItem("dbx-2", "databricks"),
      vendorItem("dbx-3", "databricks"),
      vendorItem("gcp-1", "gcp"),
    ];
    const tables = renderVendorTables(vendor, reply, over);
    expect(tables.databricks).toMatch(
      /\| S1\. \|\n\n\*Also new:\* \[Title dbx-2\]\(https:\/\/example\.com\/dbx-2\) · \[Title dbx-3\]/,
    );
    expect(tables.cloud).toBe("*Also new:* [Title gcp-1](https://example.com/gcp-1)");
    expect(tables.snowflake).toBeUndefined();
    expect(renderVendorTables(vendor, reply).databricks).not.toContain("Also new");
  });

  it("shows a vendor row's '—' as '—', and the description only when its line is missing", () => {
    const vendor = numberRows([vendorItem("dbx-1", "databricks"), vendorItem("dbx-2", "databricks")]);
    const tables = renderVendorTables(vendor, parseRowSummaries("1: —"));
    expect(tables.databricks).toContain("[Title dbx-1](https://example.com/dbx-1) | — |");
    expect(tables.databricks).not.toContain("| — | — |");
    expect(tables.databricks).toContain(`| ${vendor[1]!.description} |`);
  });

  it("asks for vendor summaries that add to the title, or '—'", () => {
    const prompt = buildDataSummariesPrompt(numberRows([vendorItem("a", "databricks")]), "2026-10-21");
    expect(prompt).toContain("Do not repeat the title");
    expect(prompt).toContain("`N: —`");
    expect(prompt).toContain("enables, breaks or requires");
  });

  it("lists release rows after the vendor rows, calls only x.0.0 major, and never mentions the cut notes", () => {
    const release = {
      n: 2,
      key: "release:org/duckdb@v2.0.0",
      project: { id: "duckdb", repo: "org/duckdb", name: "DuckDB" },
      release: {
        tag_name: "v2.0.0",
        name: "v2.0.0",
        body: "Notes.",
        published_at: "2026-10-21T00:00:00Z",
        prerelease: false,
      },
    };
    const prompt = buildDataSummariesPrompt(numberRows([vendorItem("a", "databricks")]), "2026-10-21", [
      release,
    ]);
    expect([...prompt.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]))).toEqual([1, 2]);
    expect(prompt).toContain("2. DuckDB v2.0.0 (release, 2026-10-21) — Notes.");
    expect(prompt).toContain("only a version x.0.0 is a major version");
    expect(prompt).toContain("never say they are cut");
    expect(prompt).toContain(summaryOutputRule(2));
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
    expect(prompts[2]).toContain(summaryLine("1-2 sentences"));
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

describe("checkCodeTokens", () => {
  const sources = new Map([[1, "Adds the CODING_AGENT tool type with code_toolset_all."]]);

  it("keeps a token the source has, respells one it spells differently, unwraps one it lacks", () => {
    const out = checkCodeTokens(
      new Map([[1, "Adds a `CODINGAGENT` tool type, the `code_toolset_all` sandbox and `thread_id`."]]),
      sources,
      "test",
    );
    expect(out.get(1)).toBe("Adds a `CODING_AGENT` tool type, the `code_toolset_all` sandbox and thread_id.");
  });

  it("leaves a row without a source alone", () => {
    expect(checkCodeTokens(new Map([[2, "`x`"]]), sources, "test").get(2)).toBe("`x`");
  });
});
