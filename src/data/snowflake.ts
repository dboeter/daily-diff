/**
 * Snowflake release notes. No RSS or Atom: the "All release notes" page is a
 * Next.js page with its releases server-side in `<script id="__NEXT_DATA__">`,
 * and the behavior-change page is a server-rendered table, one row per monthly
 * bundle. Breaks when the markup changes: zero parsed throws.
 */

import { fetchOk } from "../core/http.ts";
import { vendorText } from "../core/rss.ts";
import type { VendorNote } from "./vendors.ts";

const SITE = "https://docs.snowflake.com/en";

interface Release {
  changeType?: string;
  /** One date, `[start, end]` for a weekly server release, or `["Upcoming"]`. */
  date?: string[];
  title?: string;
  /** Path, e.g. /release-notes/2026/other/2026-10-16-cortex-ai-gateway-regions. */
  source?: string;
  summary?: string;
  content?: string;
}

/**
 * One note per release. id = `source` + "#" + title: a weekly server release's
 * announcements share its `source`. The `Upcoming` server release has no date
 * and is skipped (its behavior changes come from the bundle page).
 */
export function parseSnowflakeReleases(html: string): VendorNote[] {
  const json = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  if (!json) throw new Error("no __NEXT_DATA__ on the Snowflake release notes page (markup changed?)");
  const releases = (JSON.parse(json) as { props?: { pageProps?: { releases?: Release[] } } }).props?.pageProps
    ?.releases;
  if (!releases?.length) throw new Error("no Snowflake releases parsed (markup changed?)");
  return releases.flatMap((r) => {
    const date = r.date?.at(-1) ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !r.source || !r.title) return [];
    return [
      {
        id: `${r.source}#${r.title}`,
        title: r.title,
        link: `${SITE}${r.source}`,
        date,
        // Some summaries are an MDX import line (`import UpdateInstructions from '…'`): use the content.
        description: vendorText(
          r.summary && !r.summary.startsWith("import ") ? r.summary : (r.content ?? ""),
        ),
        ...(r.changeType ? { categories: [r.changeType] } : {}),
      },
    ];
  });
}

const get = async (url: string): Promise<string> => (await fetchOk(url)).text();

export async function fetchSnowflakeReleases(url: string): Promise<VendorNote[]> {
  return parseSnowflakeReleases(await get(url));
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** The last day of a release window, "(October 7-13, 2026)" → 2026-10-13; "" without day and year. */
function windowEnd(text: string): string {
  const m = text.match(/\((\w+) (\d{1,2})(?:\s*-\s*(?:(\w+) )?(\d{1,2}))?, (\d{4})\)/);
  const month = MONTHS.indexOf((m?.[3] ?? m?.[1] ?? "").slice(0, 3).toLowerCase());
  if (!m || month < 0) return "";
  return `${m[5]}-${String(month + 1).padStart(2, "0")}-${(m[4] ?? m[2]!).padStart(2, "0")}`;
}

/**
 * One stage item per bundle in the page's first table, "Upcoming pending
 * changes": a bundle moves through every status (up to Generally Enabled)
 * while listed there, and the second table is history. id =
 * `snowflake-bcr:<yyyy_mm>`, link = the bundle page. stage = the current
 * status: the last paragraph of the Status / History cell that has happened,
 * else the first (a bundle not yet introduced: its planned introduction). The
 * "Status planned…" paragraphs are left out: Snowflake rewords them, which
 * would re-report the bundle. date = the end of that paragraph's release
 * window; "" when the window has no day or year ("April 2026"), for the caller.
 */
export function parseBehaviorChangeBundles(html: string): VendorNote[] {
  const pending =
    html.match(/<table[^>]*>(?:(?!<\/table>)[\s\S])*?<th>Pending Changes<\/th>[\s\S]*?<\/table>/)?.[0] ?? "";
  const rows = [...pending.matchAll(/<tr><td><strong>(\d{4}_\d{2})<\/strong><\/td><td>([\s\S]*?)<\/td>/g)];
  if (rows.length === 0) throw new Error("no Snowflake behavior-change bundles parsed (markup changed?)");
  return rows.map(([, bundle, status]) => {
    const paragraphs = [...status!.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(([, p]) =>
      vendorText(p!, Number.MAX_SAFE_INTEGER),
    );
    const stage =
      paragraphs.filter((p) => !/^(Status planned|Planned)\b/.test(p)).at(-1) ?? paragraphs[0] ?? "";
    return {
      id: `snowflake-bcr:${bundle}`,
      title: `Behavior change bundle ${bundle}`,
      link: `${SITE}/release-notes/bcr-bundles/${bundle}_bundle`,
      date: windowEnd(stage),
      description: vendorText(status!),
      stage,
    };
  });
}

export async function fetchBehaviorChangeBundles(url: string): Promise<VendorNote[]> {
  return parseBehaviorChangeBundles(await get(url));
}
