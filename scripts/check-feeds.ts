/**
 * Fetches every feed in config.yml's `data.feeds` and `data.community` from
 * wherever it runs and prints, per feed, the HTTP outcome and the item count,
 * so a source that answers 403 to GitHub Actions (Substack did, for Policy
 * Watch) is found before the digest builds on it. Run from Actions by the
 * "Check feeds" workflow (`workflow_dispatch`); locally: `pnpm feeds:check`.
 *
 * Exit 1 when any feed failed or returned no item, so the Actions run shows
 * red; the per-feed lines (and `$GITHUB_STEP_SUMMARY`, when set) say which.
 * Writes nothing under `digests/`.
 */

import fs from "node:fs";
import { loadConfig } from "../src/core/config.ts";
import { fetchOk } from "../src/core/http.ts";
import { parseFeedItems } from "../src/core/rss.ts";

interface Check {
  list: string;
  name: string;
  url: string;
  status: string;
  items: number | null;
}

async function check(list: string, name: string, url: string): Promise<Check> {
  try {
    const text = await (await fetchOk(url)).text();
    // The vendor pages (Snowflake, BigQuery) are not RSS/Atom: a non-empty body counts.
    const items = /<(?:item|entry)[\s>]/.test(text) ? parseFeedItems(text).length : text.trim() ? 1 : 0;
    return { list, name, url, status: "ok", items };
  } catch (err) {
    return { list, name, url, status: err instanceof Error ? err.message : String(err), items: null };
  }
}

const config = loadConfig();
const checks = await Promise.all([
  ...config.data.feeds.map((f) => check("data.feeds", f.name, f.url)),
  ...config.data.community.map((f) => check("data.community", f.name, f.url)),
]);

const rows = checks.map((c) => `| ${c.list} | ${c.name} | ${c.status} | ${c.items ?? "—"} |`);
const table = `| List | Feed | Status | Items |\n| :--- | :--- | :--- | ---: |\n${rows.join("\n")}`;
console.log(table);
const summary = process.env["GITHUB_STEP_SUMMARY"];
if (summary) fs.appendFileSync(summary, `## Feed check\n\n${table}\n`);

const bad = checks.filter((c) => c.items === null || c.items === 0);
if (bad.length) {
  console.error(`\n${bad.length} feed(s) failed or returned nothing: ${bad.map((c) => c.name).join(", ")}`);
  process.exit(1);
}
